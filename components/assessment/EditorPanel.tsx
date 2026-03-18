'use client'

import { useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAssessmentStore } from '@/store/assessmentStore'
import { encodeCode } from '@/lib/encode'
import { getLanguageLabel } from '@/lib/utils'
import type { Question, ProgrammingLanguage } from '@/types'
import { Send, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

const SUPPORTED_LANGUAGES: ProgrammingLanguage[] = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust',
]

interface EditorPanelProps {
  question:     Question
  assessmentId: string
}

export default function EditorPanel({ question, assessmentId }: EditorPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const code          = useAssessmentStore(s => s.questionStates[question.id]?.code ?? question.starter_code?.javascript ?? '')
  const language      = useAssessmentStore(s => s.questionStates[question.id]?.language ?? 'javascript')
  const status        = useAssessmentStore(s => s.questionStates[question.id]?.status ?? 'idle')
  const setCode       = useAssessmentStore(s => s.setCode)
  const setLanguage   = useAssessmentStore(s => s.setLanguage)
  const setStatus     = useAssessmentStore(s => s.setSubmissionStatus)
  const setResult     = useAssessmentStore(s => s.setSubmissionResult)
  const appendConsole = useAssessmentStore(s => s.appendConsole)

  const handleSubmit = useCallback(async () => {
    if (status === 'submitting' || status === 'evaluating') return

    setStatus(question.id, 'submitting')
    appendConsole(`[${new Date().toLocaleTimeString()}] Submitting "${question.title}"...`)

    const encodedCode = encodeCode(code)

    try {
      setStatus(question.id, 'evaluating')
      appendConsole('[AI] Evaluating code quality and correctness...')

      const res = await fetch('/api/evaluate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id:        assessmentId,
          question_id:          question.id,
          encoded_code:         encodedCode,
          language,
          question_title:       question.title,
          question_description: question.description,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Evaluation failed')
      }

      setResult(question.id, data.submission)
      appendConsole(`[AI] ✓ Evaluation complete — Score: ${data.ai_metrics.overall_score}/100`)

      const { strengths, weaknesses } = data.ai_metrics.feedback
      if (strengths.length)   appendConsole(`[AI] Strengths: ${strengths[0]}`)
      if (weaknesses.length)  appendConsole(`[AI] Weakness: ${weaknesses[0]}`)

    } catch (err: any) {
      setStatus(question.id, 'error')
      appendConsole(`[ERROR] ${err.message ?? 'Submission failed. Please try again.'}`)
    }
  }, [code, language, question, assessmentId, status, setStatus, setResult, appendConsole])

  const handleLanguageChange = (lang: ProgrammingLanguage) => {
    setLanguage(question.id, lang)
    // Switch to starter code for that language if code hasn't been modified
    const starter = question.starter_code?.[lang] ?? ''
    if (starter) setCode(question.id, starter)
  }

  const isSubmitting = status === 'submitting' || status === 'evaluating'
  const isDone       = status === 'done'
  const isError      = status === 'error'

  return (
    <div ref={wrapperRef} className="flex flex-col h-full overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0 gap-3">

        {/* Language selector */}
        <div className="relative">
          <select
            value={language}
            onChange={e => handleLanguageChange(e.target.value as ProgrammingLanguage)}
            disabled={isSubmitting || isDone}
            className="appearance-none glass-sm text-xs text-white/60 pl-3 pr-7 py-1.5 rounded-lg outline-none cursor-pointer hover:text-white/80 transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-[var(--bg-elevated)]">
                {getLanguageLabel(lang)}
              </option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Status + Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isDone || !code.trim()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            isDone    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 cursor-default' :
            isError   ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30 cursor-pointer'         :
            isSubmitting ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]/50 cursor-wait border border-[var(--accent-primary)]/20' :
            'btn-primary py-1.5 px-4'
          }`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {isSubmitting ? (
            <><Loader2 size={13} className="animate-spin" /> {status === 'submitting' ? 'Submitting...' : 'Evaluating...'}</>
          ) : isDone ? (
            <><CheckCircle2 size={13} /> Submitted</>
          ) : isError ? (
            <><XCircle size={13} /> Retry</>
          ) : (
            <><Send size={13} /> Submit</>
          )}
        </button>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={(val) => setCode(question.id, val ?? '')}
          options={{
            fontSize:          13,
            fontFamily:        'DM Mono, Fira Code, monospace',
            fontLigatures:     true,
            lineHeight:        22,
            tabSize:           2,
            minimap:           { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight:  'gutter',
            bracketPairColorization: { enabled: true },
            padding:           { top: 16, bottom: 16 },
            overviewRulerLanes: 0,
            contextmenu:       false,         // ← disable right-click menu
            readOnly:          isDone,
            theme:             'sp-dark',
          }}
          beforeMount={(monaco) => {
            // Register custom theme
            monaco.editor.defineTheme('sp-dark', {
              base:    'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment',   foreground: '4a5568', fontStyle: 'italic' },
                { token: 'keyword',   foreground: '00d4c8' },
                { token: 'string',    foreground: '68d391' },
                { token: 'number',    foreground: 'f6ad55' },
                { token: 'type',      foreground: '76e4f7' },
                { token: 'function',  foreground: 'b794f4' },
                { token: 'variable',  foreground: 'e2e8f0' },
              ],
              colors: {
                'editor.background':             '#07070f',
                'editor.foreground':             '#cbd5e0',
                'editor.lineHighlightBackground':'#0c0c18',
                'editorLineNumber.foreground':   '#2d3748',
                'editorLineNumber.activeForeground': '#4a5568',
                'editor.selectionBackground':    '#00d4c818',
                'editorCursor.foreground':       '#00d4c8',
                'editorIndentGuide.background':  '#1a202c',
                'editor.findMatchBackground':    '#00d4c830',
                'scrollbarSlider.background':    '#00d4c815',
                'scrollbarSlider.hoverBackground': '#00d4c825',
              },
            })
          }}
        />
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3 text-sm text-white/30"
        style={{ fontFamily: 'var(--font-mono)' }}>
        <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
        Loading editor...
      </div>
    </div>
  )
}
