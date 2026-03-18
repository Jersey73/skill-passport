import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Run Code API — Uses Piston API for sandboxed code execution
// Supports: Java, Python
// ─────────────────────────────────────────────────────────────────────────────

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_CONFIG: Record<string, { language: string; version: string; filename: string }> = {
  java:   { language: 'java',   version: '15.0.2', filename: 'Main.java' },
  python: { language: 'python', version: '3.10.0', filename: 'main.py' },
}

export async function POST(request: NextRequest) {
  let body: { code: string; language: string; input?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { code, language, input = '' } = body

  if (!code || !language) {
    return NextResponse.json({ error: 'code and language are required' }, { status: 400 })
  }

  const config = LANGUAGE_CONFIG[language]
  if (!config) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
  }

  try {
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version:  config.version,
        files: [{ name: config.filename, content: code }],
        stdin:       input,
        run_timeout: 10000,  // 10 second timeout
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[run-code] Piston API error:', errText)
      return NextResponse.json(
        { error: 'Code execution service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    const result = await response.json()

    // Piston returns: { run: { stdout, stderr, code, signal, output }, compile?: { ... } }
    const compileError = result.compile?.stderr || result.compile?.output || ''
    const runResult    = result.run || {}

    return NextResponse.json({
      stdout:      runResult.stdout?.trimEnd() ?? '',
      stderr:      (compileError + (runResult.stderr ?? '')).trimEnd(),
      exitCode:    runResult.code ?? -1,
      timedOut:    runResult.signal === 'SIGKILL',
    })

  } catch (err) {
    console.error('[run-code] Error:', err)
    return NextResponse.json(
      { error: 'Failed to execute code. Please try again.' },
      { status: 500 }
    )
  }
}
