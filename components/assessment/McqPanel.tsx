'use client'

import type { McqQuestion } from '@/lib/questions'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

interface McqPanelProps {
  question: McqQuestion
  index: number
  total: number
  selectedAnswer: number | null
  onSelectAnswer: (optionIndex: number) => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

export default function McqPanel({
  question, index, total, selectedAnswer, onSelectAnswer,
  onPrev, onNext, hasPrev, hasNext,
}: McqPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="w-7 h-7 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span
              className="text-xs text-white/30"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              MCQ {index + 1} / {total}
            </span>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="w-7 h-7 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Topic badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-purple-400/10 text-purple-300 border-purple-400/20"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {question.topic}
          </span>
        </div>

        <h2
          className="text-lg font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Multiple Choice
        </h2>
      </div>

      {/* ── Question + Options ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Question text */}
        <p
          className="text-sm text-white/75 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selectedAnswer === i
            const letter = String.fromCharCode(65 + i)  // A, B, C, D

            return (
              <button
                key={i}
                onClick={() => onSelectAnswer(i)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-white/80'
                }`}
              >
                {/* Letter badge */}
                <span
                  className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-[#03030a]'
                      : 'glass-sm text-white/40 group-hover:text-white/60'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {isSelected ? <CheckCircle2 size={14} /> : letter}
                </span>

                {/* Option text */}
                <span
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {option}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
