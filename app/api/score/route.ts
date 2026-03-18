import { NextRequest, NextResponse } from 'next/server'
import { getCodingQuestions, getMcqQuestions } from '@/lib/questions'
import type { CodingQuestion, McqQuestion } from '@/lib/questions'

// ─────────────────────────────────────────────────────────────────────────────
// Score API — Runs test cases + scores MCQs → returns final score
// ─────────────────────────────────────────────────────────────────────────────

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_CONFIG: Record<string, { language: string; version: string; filename: string }> = {
  java:   { language: 'java',   version: '15.0.2', filename: 'Main.java' },
  python: { language: 'python', version: '3.10.0', filename: 'main.py' },
}

interface ScoreRequest {
  language: 'java' | 'python'
  codingAnswers: Record<string, string>   // questionId → code
  mcqAnswers:    Record<string, number>   // questionId → selected option index
}

async function runCode(code: string, language: string, input: string): Promise<string> {
  const config = LANGUAGE_CONFIG[language]
  if (!config) return ''

  try {
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version:  config.version,
        files: [{ name: config.filename, content: code }],
        stdin:       input,
        run_timeout: 10000,
      }),
    })

    if (!response.ok) return ''
    const result = await response.json()
    return (result.run?.stdout ?? '').trimEnd()
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  let body: ScoreRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { language, codingAnswers, mcqAnswers } = body

  if (!language || !codingAnswers || !mcqAnswers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const codingQuestions = getCodingQuestions(language)
  const mcqQuestions    = getMcqQuestions()

  // ── Score Coding Questions ────────────────────────────────────────────────
  const codingResults: {
    questionId: string
    title: string
    testsPassed: number
    totalTests: number
    score: number
    details: { input: string; expected: string; actual: string; passed: boolean }[]
  }[] = []

  let totalCodingScore = 0
  const maxCodingScore = codingQuestions.length * 100

  for (const q of codingQuestions) {
    const code = codingAnswers[q.id] || ''
    const details: { input: string; expected: string; actual: string; passed: boolean }[] = []
    let passed = 0

    if (code.trim()) {
      // Run all test cases
      for (const tc of q.testCases) {
        const actual = await runCode(code, language, tc.input)
        const isPassed = actual.trim() === tc.expectedOutput.trim()
        if (isPassed) passed++
        details.push({
          input:    tc.input,
          expected: tc.expectedOutput,
          actual:   actual || '(no output)',
          passed:   isPassed,
        })
      }
    } else {
      // No code submitted
      for (const tc of q.testCases) {
        details.push({
          input:    tc.input,
          expected: tc.expectedOutput,
          actual:   '(not submitted)',
          passed:   false,
        })
      }
    }

    const questionScore = q.testCases.length > 0
      ? Math.round((passed / q.testCases.length) * 100)
      : 0

    totalCodingScore += questionScore

    codingResults.push({
      questionId: q.id,
      title:      q.title,
      testsPassed: passed,
      totalTests:  q.testCases.length,
      score:       questionScore,
      details,
    })
  }

  // ── Score MCQs ────────────────────────────────────────────────────────────
  const mcqResults: {
    questionId: string
    question: string
    selectedAnswer: number
    correctAnswer: number
    isCorrect: boolean
    explanation: string
  }[] = []

  let correctMcqs = 0

  for (const q of mcqQuestions) {
    const selected = mcqAnswers[q.id] ?? -1
    const isCorrect = selected === q.correctAnswer
    if (isCorrect) correctMcqs++

    mcqResults.push({
      questionId:     q.id,
      question:       q.question,
      selectedAnswer: selected,
      correctAnswer:  q.correctAnswer,
      isCorrect,
      explanation:    q.explanation,
    })
  }

  const mcqScore = mcqQuestions.length > 0
    ? Math.round((correctMcqs / mcqQuestions.length) * 100)
    : 0

  // ── Final Score ───────────────────────────────────────────────────────────
  // Weighted: 60% coding + 40% MCQ
  const avgCodingScore = codingQuestions.length > 0
    ? Math.round(totalCodingScore / codingQuestions.length)
    : 0

  const finalScore = Math.round(avgCodingScore * 0.6 + mcqScore * 0.4)

  return NextResponse.json({
    success: true,
    finalScore,
    codingScore: avgCodingScore,
    mcqScore,
    correctMcqs,
    totalMcqs: mcqQuestions.length,
    codingResults,
    mcqResults,
  })
}
