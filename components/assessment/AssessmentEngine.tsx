'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useAntiCheat } from '@/hooks/useAntiCheat'
import { useCountdown } from '@/hooks/useCountdown'
import type { Assessment, Question } from '@/types'

import CountdownTimer from './CountdownTimer'
import QuestionPanel  from './QuestionPanel'
import EditorPanel    from './EditorPanel'
import ConsolePanel   from './ConsolePanel'

import { Zap, AlertTriangle, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'

interface AssessmentEngineProps {
  assessment: Assessment
  questions:  Question[]
}

const CONSOLE_HEIGHT_PX = 180

export default function AssessmentEngine({ assessment, questions }: AssessmentEngineProps) {
  const router        = useRouter()
  const editorWrapRef = useRef<HTMLDivElement>(null)

  // ── Store hydration ──
  const storeAssessment = useAssessmentStore(s => s.assessment)
  const setAssessment   = useAssessmentStore(s => s.setAssessment)
  const setQuestions    = useAssessmentStore(s => s.setQuestions)
  const currentIndex    = useAssessmentStore(s => s.currentIndex)
  const setCurrentIndex = useAssessmentStore(s => s.setCurrentIndex)
  const isFailed        = useAssessmentStore(s => s.isFailed)
  const timerExpired    = useAssessmentStore(s => s.timerExpired)
  const warningMessage  = useAssessmentStore(s => s.warningMessage)
  const dismissWarning  = useAssessmentStore(s => s.dismissWarning)
  const questionStates  = useAssessmentStore(s => s.questionStates)
  const reset           = useAssessmentStore(s => s.reset)

  // Hydrate store once
  useEffect(() => {
    if (!storeAssessment) {
      setAssessment(assessment)
      setQuestions(questions)
    }
    return () => { reset() }
  }, [])

  // ── Hooks ──
  const isActive = !isFailed && !timerExpired
  useAntiCheat(editorWrapRef, isActive)
  useCountdown(assessment.expires_at, isActive)

  // ── Derived ──
  const currentQuestion = questions[currentIndex]
  const allSubmitted    = questions.every(q => questionStates[q.id]?.status === 'done')
  const submittedCount  = questions.filter(q => questionStates[q.id]?.status === 'done').length

  if (!currentQuestion) return null

  // ── Terminal / Failed screens ──
  if (isFailed || timerExpired) {
    return (
      <TerminalScreen
        type={isFailed ? 'failed' : 'expired'}
        onGoToDashboard={() => router.push('/dashboard/me')}
      />
    )
  }

  return (
    <div
      className="h-screen flex flex-col bg-[var(--bg-void)] overflow-hidden"
      style={{ userSelect: 'none' }}    // global text-selection disabled on outer shell
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

        {/* Question tabs */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => {
            const qState   = questionStates[q.id]
            const isDone   = qState?.status === 'done'
            const isActive = i === currentIndex
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isDone    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' :
                  isActive  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40' :
                              'glass-sm text-white/30 hover:text-white/60'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isDone ? '✓' : i + 1}
              </button>
            )
          })}
        </div>

        {/* Timer + progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30 hidden sm:block"
            style={{ fontFamily: 'var(--font-mono)' }}>
            {submittedCount}/{questions.length} submitted
          </span>
          <CountdownTimer />
        </div>
      </div>

      {/* ── Warning Banner ── */}
      {warningMessage && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-amber-400/10 border-b border-amber-400/25 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-sm text-amber-300"
            style={{ fontFamily: 'var(--font-body)' }}>
            <AlertTriangle size={15} className="flex-shrink-0" />
            {warningMessage}
          </div>
          <button onClick={dismissWarning}
            className="text-amber-400/60 hover:text-amber-400 transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Main Split Pane ── */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: `calc(100% - ${CONSOLE_HEIGHT_PX}px - 45px)` }}
      >
        {/* Left: Question */}
        <div
          className="w-[42%] min-w-[300px] border-r border-white/[0.06] overflow-hidden flex flex-col"
          style={{ background: 'rgba(7,7,15,0.7)' }}
        >
          <QuestionPanel
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            onPrev={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            onNext={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < questions.length - 1}
          />
        </div>

        {/* Right: Editor */}
        <div
          ref={editorWrapRef}
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: 'var(--bg-surface)' }}
        >
          <EditorPanel
            question={currentQuestion}
            assessmentId={assessment.id}
          />
        </div>
      </div>

      {/* ── Bottom: Console ── */}
      <div
        className="border-t border-white/[0.06] flex-shrink-0"
        style={{
          height:     CONSOLE_HEIGHT_PX,
          background: 'rgba(3,3,10,0.9)',
        }}
      >
        <ConsolePanel />
      </div>
    </div>
  )
}

// ── Terminal Screen (fail / expire) ──────────────────────────────────────────
function TerminalScreen({
  type,
  onGoToDashboard,
}: {
  type: 'failed' | 'expired'
  onGoToDashboard: () => void
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center p-6">
      <GlassCard variant="bright" className="max-w-md w-full p-10 text-center">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
            type === 'failed' ? 'bg-rose-500/20' : 'bg-amber-500/20'
          }`}
        >
          <AlertTriangle
            size={30}
            className={type === 'failed' ? 'text-rose-400' : 'text-amber-400'}
          />
        </div>

        <h2
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {type === 'failed' ? 'Assessment Terminated' : 'Time Expired'}
        </h2>

        <p className="text-sm text-white/50 mb-8 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}>
          {type === 'failed'
            ? 'Multiple tab-switch violations were detected. This assessment has been flagged and terminated. Submitted questions have been saved.'
            : 'The 60-minute assessment window has expired. All submitted questions have been saved and evaluated.'
          }
        </p>

        <button
          onClick={onGoToDashboard}
          className="btn-primary w-full justify-center"
        >
          View My Dashboard
        </button>
      </GlassCard>
    </div>
  )
}
