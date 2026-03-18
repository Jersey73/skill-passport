'use client'

import type { McqQuestion, CodingQuestion } from '@/lib/questions'
import GlassCard from '@/components/shared/GlassCard'
import { Trophy, CheckCircle2, XCircle, Code2, ListChecks, ArrowRight } from 'lucide-react'

interface CodingResult {
  questionId: string
  title: string
  testsPassed: number
  totalTests: number
  score: number
  details: { input: string; expected: string; actual: string; passed: boolean }[]
}

interface McqResult {
  questionId: string
  question: string
  selectedAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string
}

interface ResultsScreenProps {
  finalScore: number
  codingScore: number
  mcqScore: number
  correctMcqs: number
  totalMcqs: number
  codingResults: CodingResult[]
  mcqResults: McqResult[]
  mcqQuestions: McqQuestion[]
  onGoToDashboard: () => void
}

export default function ResultsScreen({
  finalScore, codingScore, mcqScore, correctMcqs, totalMcqs,
  codingResults, mcqResults, mcqQuestions, onGoToDashboard,
}: ResultsScreenProps) {

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5'
    if (score >= 60) return 'from-amber-500/20 to-amber-500/5'
    return 'from-rose-500/20 to-rose-500/5'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] overflow-y-auto py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Final Score Card ── */}
        <GlassCard variant="bright" gradientBorder className="p-8 text-center">
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-b ${getScoreBg(finalScore)}`}>
            <Trophy size={36} className={getScoreColor(finalScore)} />
          </div>

          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Assessment Complete!
          </h1>

          <div className={`text-6xl font-bold mb-2 ${getScoreColor(finalScore)}`}
            style={{ fontFamily: 'var(--font-display)' }}>
            {finalScore}<span className="text-2xl text-white/30">/100</span>
          </div>

          <p className="text-sm text-white/40 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            Weighted: 60% Coding + 40% MCQ
          </p>

          {/* Score breakdown */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center gap-2 text-white/30 text-xs mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}>
                <Code2 size={12} /> Coding
              </div>
              <span className={`text-xl font-bold ${getScoreColor(codingScore)}`}
                style={{ fontFamily: 'var(--font-display)' }}>
                {codingScore}%
              </span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center gap-2 text-white/30 text-xs mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}>
                <ListChecks size={12} /> MCQ
              </div>
              <span className={`text-xl font-bold ${getScoreColor(mcqScore)}`}
                style={{ fontFamily: 'var(--font-display)' }}>
                {correctMcqs}/{totalMcqs}
              </span>
            </div>
          </div>

          <button onClick={onGoToDashboard} className="btn-primary justify-center w-full max-w-xs mx-auto">
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </GlassCard>

        {/* ── Coding Results ── */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            <Code2 size={18} className="text-[var(--accent-primary)]" />
            Coding Results
          </h2>

          <div className="space-y-4">
            {codingResults.map((cr) => (
              <div key={cr.questionId} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white/80" style={{ fontFamily: 'var(--font-display)' }}>
                    {cr.title}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    cr.score >= 80 ? 'bg-emerald-400/20 text-emerald-400' :
                    cr.score >= 50 ? 'bg-amber-400/20 text-amber-400' :
                    'bg-rose-400/20 text-rose-400'
                  }`} style={{ fontFamily: 'var(--font-mono)' }}>
                    {cr.testsPassed}/{cr.totalTests} passed
                  </span>
                </div>

                <div className="space-y-2">
                  {cr.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      {d.passed ? (
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-white/40">Input: </span>
                        <span className="text-white/60">{d.input.replace(/\n/g, ' ↵ ')}</span>
                        {!d.passed && (
                          <>
                            <br />
                            <span className="text-white/40">Expected: </span>
                            <span className="text-emerald-300/60">{d.expected.replace(/\n/g, ' ↵ ')}</span>
                            <br />
                            <span className="text-white/40">Got: </span>
                            <span className="text-rose-300/60">{d.actual.replace(/\n/g, ' ↵ ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── MCQ Results ── */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            <ListChecks size={18} className="text-purple-400" />
            MCQ Results — {correctMcqs}/{totalMcqs} correct
          </h2>

          <div className="space-y-3">
            {mcqResults.map((mr, i) => {
              const q = mcqQuestions.find(mq => mq.id === mr.questionId)
              return (
                <div key={mr.questionId}
                  className={`rounded-xl border p-4 ${
                    mr.isCorrect
                      ? 'border-emerald-400/20 bg-emerald-400/5'
                      : 'border-rose-400/20 bg-rose-400/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {mr.isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white/75 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                        {mr.question}
                      </p>
                      {!mr.isCorrect && q && (
                        <p className="text-xs text-white/40 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                          <span className="text-rose-300/60">Your answer: {q.options[mr.selectedAnswer] ?? 'Not answered'}</span>
                          <br />
                          <span className="text-emerald-300/60">Correct: {q.options[mr.correctAnswer]}</span>
                          <br />
                          <span className="text-white/30 italic">{mr.explanation}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
