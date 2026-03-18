'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCodingQuestions, getMcqQuestions } from '@/lib/questions'
import type { CodingQuestion, McqQuestion } from '@/lib/questions'
import McqPanel from './McqPanel'
import ResultsScreen from './ResultsScreen'
import GlassCard from '@/components/shared/GlassCard'
import {
  Zap, AlertTriangle, X, Play, Send, Loader2, CheckCircle2,
  Code2, ListChecks, Clock, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

interface Props {
  assessmentId: string
  language: 'java' | 'python'
}

interface RunOutput {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
}

interface ScoreResult {
  finalScore: number
  codingScore: number
  mcqScore: number
  correctMcqs: number
  totalMcqs: number
  codingResults: any[]
  mcqResults: any[]
}

export default function NewAssessmentEngine({ assessmentId, language }: Props) {
  const router = useRouter()
  const editorRef = useRef<any>(null)

  // ── Questions ──
  const codingQuestions = getCodingQuestions(language)
  const mcqQuestions    = getMcqQuestions()

  // ── State ──
  const [phase, setPhase] = useState<'coding' | 'mcq' | 'results'>('coding')
  const [codingIndex, setCodingIndex] = useState(0)
  const [mcqIndex, setMcqIndex]       = useState(0)

  // Coding state — code per question
  const [codingAnswers, setCodingAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    codingQuestions.forEach(q => { initial[q.id] = q.starterCode })
    return initial
  })

  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({})

  // Code execution
  const [isRunning, setIsRunning]   = useState(false)
  const [runOutput, setRunOutput]   = useState<RunOutput | null>(null)
  const [consoleLines, setConsoleLines] = useState<string[]>([])

  // Scoring
  const [isScoring, setIsScoring]   = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)

  // Anti-cheat
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [isFailed, setIsFailed]     = useState(false)

  // Timer: 60 minutes
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 60)
  const [timerExpired, setTimerExpired] = useState(false)

  // ── Timer countdown ──
  useEffect(() => {
    if (isFailed || timerExpired || phase === 'results') return
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setTimerExpired(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isFailed, timerExpired, phase])

  // ── Anti-cheat: tab switch detection ──
  useEffect(() => {
    if (isFailed || phase === 'results') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1
          if (next === 1) {
            setWarningMessage('⚠️ Warning: Tab switching detected. A second violation will auto-fail your assessment.')
          } else if (next >= 2) {
            setIsFailed(true)
            setWarningMessage(null)
          }
          return next
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isFailed, phase])

  // ── Anti-cheat: disable copy/paste ──
  useEffect(() => {
    if (phase === 'results') return

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      appendConsole(`[SYSTEM] ⚠️ ${e.type === 'copy' ? 'Copy' : 'Paste'} attempt blocked — anti-cheat active.`)
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener('copy', handleCopyPaste)
    document.addEventListener('paste', handleCopyPaste)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('copy', handleCopyPaste)
      document.removeEventListener('paste', handleCopyPaste)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [phase])

  const appendConsole = useCallback((line: string) => {
    setConsoleLines(prev => [...prev.slice(-199), line])
  }, [])

  // ── Current question ──
  const currentCodingQuestion = codingQuestions[codingIndex]
  const currentMcqQuestion    = mcqQuestions[mcqIndex]

  // ── Run Code ──
  const handleRunCode = async () => {
    if (isRunning || !currentCodingQuestion) return
    setIsRunning(true)
    setRunOutput(null)
    appendConsole(`[${new Date().toLocaleTimeString()}] Running ${currentCodingQuestion.title}...`)

    try {
      const code = codingAnswers[currentCodingQuestion.id] || ''
      const testCase = currentCodingQuestion.testCases.find(t => !t.isHidden) ?? currentCodingQuestion.testCases[0]

      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          input: testCase?.input ?? '',
        }),
      })

      const data: RunOutput = await res.json()
      setRunOutput(data)

      if (data.stderr) {
        appendConsole(`[ERROR] ${data.stderr}`)
      }
      if (data.stdout) {
        appendConsole(`[OUTPUT] ${data.stdout}`)
      }
      if (data.timedOut) {
        appendConsole(`[SYSTEM] ⚠️ Execution timed out (10s limit).`)
      }
      if (!data.stderr && !data.stdout && !data.timedOut) {
        appendConsole(`[OUTPUT] (no output)`)
      }

    } catch (err) {
      appendConsole(`[ERROR] Failed to execute code. Please try again.`)
    } finally {
      setIsRunning(false)
    }
  }

  // ── Finish Assessment ──
  const handleFinishAssessment = async () => {
    if (isScoring) return
    setIsScoring(true)
    appendConsole(`[SYSTEM] Scoring assessment...`)

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, codingAnswers, mcqAnswers }),
      })

      const data = await res.json()
      if (data.success) {
        setScoreResult(data)
        setPhase('results')
      } else {
        appendConsole(`[ERROR] Scoring failed: ${data.error}`)
      }
    } catch (err) {
      appendConsole(`[ERROR] Failed to score assessment. Please try again.`)
    } finally {
      setIsScoring(false)
    }
  }

  // ── Format timer ──
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const timerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isTimerLow = secondsRemaining < 300

  // ── Failed / Expired screens ──
  if (isFailed || timerExpired) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center p-6">
        <GlassCard variant="bright" className="max-w-md w-full p-10 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
            isFailed ? 'bg-rose-500/20' : 'bg-amber-500/20'
          }`}>
            <AlertTriangle size={30} className={isFailed ? 'text-rose-400' : 'text-amber-400'} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {isFailed ? 'Assessment Terminated' : 'Time Expired'}
          </h2>
          <p className="text-sm text-white/50 mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            {isFailed
              ? 'Multiple tab-switch violations were detected. This assessment has been flagged and terminated.'
              : 'The 60-minute assessment window has expired.'}
          </p>
          <button onClick={() => router.push('/dashboard/me')} className="btn-primary w-full justify-center">
            View My Dashboard
          </button>
        </GlassCard>
      </div>
    )
  }

  // ── Results phase ──
  if (phase === 'results' && scoreResult) {
    return (
      <ResultsScreen
        {...scoreResult}
        mcqQuestions={mcqQuestions}
        onGoToDashboard={() => router.push('/dashboard/me')}
      />
    )
  }

  // ── Total question count for tabs ──
  const totalQuestions = codingQuestions.length + mcqQuestions.length
  const currentGlobalIndex = phase === 'coding' ? codingIndex : codingQuestions.length + mcqIndex

  return (
    <div
      className="h-screen flex flex-col bg-[var(--bg-void)] overflow-hidden"
      style={{ userSelect: 'none' }}
    >

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] glass flex-shrink-0 z-30">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <Zap size={12} className="text-[#03030a]" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight gradient-text"
            style={{ fontFamily: 'var(--font-display)' }}>
            SkillPassport
          </span>
        </div>

        {/* Phase tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPhase('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              phase === 'coding'
                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
                : 'glass-sm text-white/30 hover:text-white/60'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Code2 size={12} /> Coding ({codingQuestions.length})
          </button>
          <button
            onClick={() => setPhase('mcq')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              phase === 'mcq'
                ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                : 'glass-sm text-white/30 hover:text-white/60'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <ListChecks size={12} /> MCQ ({mcqQuestions.length})
          </button>
        </div>

        {/* Question dots */}
        <div className="flex items-center gap-1">
          {codingQuestions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => { setPhase('coding'); setCodingIndex(i) }}
              className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                phase === 'coding' && codingIndex === i
                  ? 'bg-[var(--accent-primary)]/25 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                  : 'glass-sm text-white/25 hover:text-white/50'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              C{i + 1}
            </button>
          ))}
          <span className="w-px h-4 bg-white/10 mx-1" />
          {mcqQuestions.map((q, i) => {
            const isAnswered = mcqAnswers[q.id] !== undefined
            return (
              <button
                key={q.id}
                onClick={() => { setPhase('mcq'); setMcqIndex(i) }}
                className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                  isAnswered
                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                    : phase === 'mcq' && mcqIndex === i
                      ? 'bg-purple-400/25 text-purple-300 border border-purple-400/30'
                      : 'glass-sm text-white/20 hover:text-white/40'
                }`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {isAnswered ? '✓' : i + 1}
              </button>
            )
          })}
        </div>

        {/* Timer + Actions */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
            isTimerLow
              ? 'bg-rose-500/15 text-rose-400 border border-rose-400/25 animate-pulse'
              : 'glass-sm text-white/50'
          }`} style={{ fontFamily: 'var(--font-mono)' }}>
            <Clock size={12} />
            {timerText}
          </div>

          <button
            onClick={handleFinishAssessment}
            disabled={isScoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {isScoring ? (
              <><Loader2 size={12} className="animate-spin" /> Scoring...</>
            ) : (
              <><CheckCircle2 size={12} /> Finish</>
            )}
          </button>
        </div>
      </div>

      {/* ── Warning Banner ── */}
      {warningMessage && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-amber-400/10 border-b border-amber-400/25 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-sm text-amber-300" style={{ fontFamily: 'var(--font-body)' }}>
            <AlertTriangle size={15} className="flex-shrink-0" />
            {warningMessage}
          </div>
          <button onClick={() => setWarningMessage(null)}
            className="text-amber-400/60 hover:text-amber-400 transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      {phase === 'coding' && currentCodingQuestion && (
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Question Panel */}
          <div
            className="w-[42%] min-w-[300px] border-r border-white/[0.06] overflow-hidden flex flex-col"
            style={{ background: 'rgba(7,7,15,0.7)' }}
          >
            <CodingQuestionPanel
              question={currentCodingQuestion}
              index={codingIndex}
              total={codingQuestions.length}
              onPrev={() => setCodingIndex(Math.max(0, codingIndex - 1))}
              onNext={() => setCodingIndex(Math.min(codingQuestions.length - 1, codingIndex + 1))}
            />
          </div>

          {/* Right: Editor + Console */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--bg-surface)' }}>

            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 px-2 py-1 glass-sm rounded-md"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {language === 'java' ? 'Java' : 'Python'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/20"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  <Shield size={10} className="text-amber-400/50" /> Anti-cheat active
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-400/25 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {isRunning ? (
                    <><Loader2 size={12} className="animate-spin" /> Running...</>
                  ) : (
                    <><Play size={12} /> Run Code</>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language === 'java' ? 'java' : 'python'}
                value={codingAnswers[currentCodingQuestion.id] || ''}
                onChange={(val) => {
                  setCodingAnswers(prev => ({
                    ...prev,
                    [currentCodingQuestion.id]: val ?? '',
                  }))
                }}
                options={{
                  fontSize:           13,
                  fontFamily:         'DM Mono, Fira Code, monospace',
                  fontLigatures:      true,
                  lineHeight:         22,
                  tabSize:            2,
                  minimap:            { enabled: false },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'gutter',
                  bracketPairColorization: { enabled: true },
                  padding:            { top: 16, bottom: 16 },
                  overviewRulerLanes: 0,
                  contextmenu:        false,
                  theme:              'sp-dark',
                }}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('sp-dark', {
                    base:    'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment',  foreground: '4a5568', fontStyle: 'italic' },
                      { token: 'keyword',  foreground: '00d4c8' },
                      { token: 'string',   foreground: '68d391' },
                      { token: 'number',   foreground: 'f6ad55' },
                      { token: 'type',     foreground: '76e4f7' },
                      { token: 'function', foreground: 'b794f4' },
                      { token: 'variable', foreground: 'e2e8f0' },
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
                onMount={(editor) => {
                  editorRef.current = editor
                  // Disable paste in editor
                  editor.onDidPaste(() => {
                    // Undo the paste
                    editor.trigger('keyboard', 'undo', null)
                    appendConsole('[SYSTEM] ⚠️ Paste blocked — anti-cheat active.')
                  })
                }}
              />
            </div>

            {/* Console Output */}
            <div
              className="border-t border-white/[0.06] flex-shrink-0 overflow-hidden"
              style={{ height: 180, background: 'rgba(3,3,10,0.9)' }}
            >
              <ConsoleView lines={consoleLines} onClear={() => setConsoleLines([])} />
            </div>
          </div>
        </div>
      )}

      {/* ── MCQ Phase ── */}
      {phase === 'mcq' && currentMcqQuestion && (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden" style={{ background: 'rgba(7,7,15,0.7)' }}>
            <McqPanel
              question={currentMcqQuestion}
              index={mcqIndex}
              total={mcqQuestions.length}
              selectedAnswer={mcqAnswers[currentMcqQuestion.id] ?? null}
              onSelectAnswer={(i) => setMcqAnswers(prev => ({ ...prev, [currentMcqQuestion.id]: i }))}
              onPrev={() => setMcqIndex(Math.max(0, mcqIndex - 1))}
              onNext={() => setMcqIndex(Math.min(mcqQuestions.length - 1, mcqIndex + 1))}
              hasPrev={mcqIndex > 0}
              hasNext={mcqIndex < mcqQuestions.length - 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Coding Question Panel ──────────────────────────────────────────────────

function CodingQuestionPanel({
  question, index, total, onPrev, onNext,
}: {
  question: CodingQuestion
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const diffConfig: Record<string, { bg: string; color: string; label: string }> = {
    easy:   { bg: 'bg-emerald-400/10', color: 'text-emerald-400 border-emerald-400/25', label: 'Easy' },
    medium: { bg: 'bg-amber-400/10',   color: 'text-amber-400 border-amber-400/25',   label: 'Medium' },
    hard:   { bg: 'bg-rose-400/10',    color: 'text-rose-400 border-rose-400/25',     label: 'Hard' },
  }
  const diff = diffConfig[question.difficulty]
  const visibleTests = question.testCases.filter(t => !t.isHidden)
  const hiddenCount  = question.testCases.filter(t => t.isHidden).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={onPrev} disabled={index === 0}
              className="w-7 h-7 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
              {index + 1} / {total}
            </span>
            <button onClick={onNext} disabled={index === total - 1}
              className="w-7 h-7 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${diff.bg} ${diff.color}`}
            style={{ fontFamily: 'var(--font-mono)' }}>
            {diff.label}
          </span>
        </div>
        <h2 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {question.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <div className="prose-custom text-sm text-white/65 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(question.description) }}
        />

        {visibleTests.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3"
              style={{ fontFamily: 'var(--font-mono)' }}>Examples</h4>
            <div className="space-y-3">
              {visibleTests.map((tc, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5"
                        style={{ fontFamily: 'var(--font-mono)' }}>Input</p>
                      <pre className="text-xs text-cyan-300/80 whitespace-pre-wrap break-all"
                        style={{ fontFamily: 'var(--font-mono)' }}>{tc.input}</pre>
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5"
                        style={{ fontFamily: 'var(--font-mono)' }}>Expected</p>
                      <pre className="text-xs text-emerald-300/80 whitespace-pre-wrap break-all"
                        style={{ fontFamily: 'var(--font-mono)' }}>{tc.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hiddenCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/25 border border-dashed border-white/[0.08] rounded-xl px-4 py-3"
            style={{ fontFamily: 'var(--font-mono)' }}>
            🔒 {hiddenCount} hidden test {hiddenCount === 1 ? 'case' : 'cases'} — evaluated on submission
          </div>
        )}
      </div>
    </div>
  )
}

// ── Console View ───────────────────────────────────────────────────────────

function ConsoleView({ lines, onClear }: { lines: string[]; onClear: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  const getLineColor = (line: string) => {
    if (line.startsWith('[ERROR]'))  return 'text-rose-400'
    if (line.startsWith('[OUTPUT]')) return 'text-emerald-300'
    if (line.startsWith('[SYSTEM]')) return 'text-amber-400'
    return 'text-white/50'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ userSelect: 'none' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium"
            style={{ fontFamily: 'var(--font-mono)' }}>Console</span>
        </div>
        {lines.length > 0 && (
          <button onClick={onClear}
            className="text-[10px] text-white/20 hover:text-white/40 transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}>clear</button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
        style={{ background: 'rgba(0,0,0,0.3)' }}>
        {lines.length === 0 ? (
          <p className="text-xs text-white/15 mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
            Click &quot;Run Code&quot; to see execution output here.
          </p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={`text-xs leading-5 ${getLineColor(line)}`}
              style={{ fontFamily: 'var(--font-mono)' }}>{line}</div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Editor Skeleton ────────────────────────────────────────────────────────

function EditorSkeleton() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3 text-sm text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
        <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
        Loading editor...
      </div>
    </div>
  )
}

// ── Markdown renderer ──────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|p|u|o|l|p])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}
