import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { decodeCode } from '@/lib/encode'
import { evaluatePayloadSchema, aiMetricsSchema } from '@/lib/validators'

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// Exact constraint from the spec — the AI must respond with raw JSON only.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Evaluate the provided code. You must respond with ONLY a raw, valid JSON object. Do not include markdown formatting like \`\`\`json. The JSON must strictly adhere to this structure: \`metrics\` (containing \`algorithm_efficiency\`, \`code_readability\`, \`problem_solving\` with nested \`score\` 0-100 and \`reasoning\`), \`overall_score\` (integer 0-100), \`feedback\` (containing string arrays for \`strengths\`, \`weaknesses\`, \`improvement_suggestions\`), and a boolean \`is_plagiarized_or_suspicious\`.`

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {

  // ── 1. Auth guard ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse + validate request body ─────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = evaluatePayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const {
    assessment_id,
    question_id,
    encoded_code,
    language,
    question_title,
    question_description,
  } = parsed.data

  // ── 3. Verify the assessment belongs to the authenticated user ────────────
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id, user_id, status, expires_at')
    .eq('id', assessment_id)
    .eq('user_id', user.id)
    .single()

  if (assessmentError || !assessment) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
  }

  if (assessment.status !== 'in_progress') {
    return NextResponse.json(
      { success: false, error: `Assessment is not in progress (status: ${assessment.status})` },
      { status: 409 }
    )
  }

  // Guard: server-side expiry check
  if (new Date(assessment.expires_at) < new Date()) {
    const serviceClient = createServiceClient()
    await serviceClient
      .from('assessments')
      .update({ status: 'expired' })
      .eq('id', assessment_id)

    return NextResponse.json({ success: false, error: 'Assessment has expired' }, { status: 410 })
  }

  // ── 4. Decode the Base64 code payload ────────────────────────────────────
  let rawCode: string
  try {
    rawCode = decodeCode(encoded_code)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to decode code payload. Ensure it is valid Base64.' },
      { status: 400 }
    )
  }

  if (!rawCode.trim()) {
    return NextResponse.json({ success: false, error: 'Decoded code is empty.' }, { status: 400 })
  }

  // ── 5. Build the AI evaluation prompt ────────────────────────────────────
  const userPrompt = `
Problem Title: ${question_title}
Language: ${language}

Problem Description:
${question_description}

Submitted Code:
\`\`\`${language}
${rawCode}
\`\`\`

Evaluate this code submission according to the metrics defined in your instructions.
Focus on: algorithm efficiency (Big-O, optimal approach), code readability (naming, structure, comments), and problem solving (correctness, edge cases, logic).
`.trim()

  // ── 6. Call the AI model ─────────────────────────────────────────────────
  let aiResponseText: string
  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text()
      console.error('[evaluate] AI API error:', errBody)
      return NextResponse.json(
        { success: false, error: 'AI evaluation service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    const aiData = await aiResponse.json()
    aiResponseText = aiData.content?.[0]?.text ?? ''

  } catch (networkErr) {
    console.error('[evaluate] Network error calling AI:', networkErr)
    return NextResponse.json(
      { success: false, error: 'Failed to reach AI evaluation service.' },
      { status: 503 }
    )
  }

  // ── 7. Parse + validate the AI JSON response ──────────────────────────────
  let aiMetrics: ReturnType<typeof aiMetricsSchema.parse>
  try {
    // Strip any stray markdown fences the model may have added despite instructions
    const cleaned = aiResponseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/,      '')
      .replace(/```\s*$/,      '')
      .trim()

    const rawJson = JSON.parse(cleaned)
    aiMetrics = aiMetricsSchema.parse(rawJson)

  } catch (parseErr) {
    console.error('[evaluate] Failed to parse AI response:', aiResponseText)
    return NextResponse.json(
      {
        success: false,
        error:   'AI returned an unexpected response format. Please retry.',
        raw:     aiResponseText.slice(0, 300),
      },
      { status: 502 }
    )
  }

  // ── 8. Persist to Supabase via service role (bypasses RLS update restriction) ──
  const serviceClient = createServiceClient()

  const { data: submission, error: insertError } = await serviceClient
    .from('submissions')
    .upsert(
      {
        assessment_id,
        question_id,
        user_id:       user.id,
        language,
        raw_code:      encoded_code,          // Store Base64-encoded source
        ai_metrics:    aiMetrics,
        overall_score: aiMetrics.overall_score,
        is_suspicious: aiMetrics.is_plagiarized_or_suspicious,
      },
      {
        onConflict:        'assessment_id,question_id',  // Unique index from schema
        ignoreDuplicates:  false,                         // Allow re-evaluation / update
      }
    )
    .select()
    .single()

  if (insertError) {
    console.error('[evaluate] Supabase insert error:', insertError)
    return NextResponse.json(
      { success: false, error: 'Failed to save evaluation results.' },
      { status: 500 }
    )
  }

  // ── 9. Update the assessment's overall score (average of all submissions) ──
  const { data: allSubmissions } = await serviceClient
    .from('submissions')
    .select('overall_score')
    .eq('assessment_id', assessment_id)
    .not('overall_score', 'is', null)

  if (allSubmissions && allSubmissions.length > 0) {
    const avgScore = Math.round(
      allSubmissions.reduce((acc: number, s: any) => acc + (s.overall_score ?? 0), 0) / allSubmissions.length
    )

    await serviceClient
      .from('assessments')
      .update({ final_score: avgScore })
      .eq('id', assessment_id)

    // Update user's overall_score (best assessment score)
    const { data: bestAssessment } = await serviceClient
      .from('assessments')
      .select('final_score')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('final_score', { ascending: false })
      .limit(1)
      .single()

    if (bestAssessment?.final_score) {
      await serviceClient
        .from('users')
        .update({ overall_score: bestAssessment.final_score })
        .eq('id', user.id)
    }
  }

  // ── 10. Auto-flag suspicious submissions ─────────────────────────────────
  if (aiMetrics.is_plagiarized_or_suspicious) {
    await serviceClient
      .from('assessments')
      .update({ is_flagged_for_cheating: true, status: 'flagged' })
      .eq('id', assessment_id)
  }

  // ── 11. Return success response ───────────────────────────────────────────
  return NextResponse.json({
    success:       true,
    submission_id: submission.id,
    ai_metrics:    aiMetrics,
    submission,
  })
}
