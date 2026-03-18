'use client'

import { getDifficultyConfig } from '@/lib/utils'
import type { Question } from '@/types'
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface QuestionPanelProps {
  question:     Question
  index:        number
  total:        number
  onPrev:       () => void
  onNext:       () => void
  hasPrev:      boolean
  hasNext:      boolean
}

export default function QuestionPanel({
  question, index, total, onPrev, onNext, hasPrev, hasNext,
}: QuestionPanelProps) {
  const [showHidden, setShowHidden] = useState(false)
  const diff = getDifficultyConfig(question.difficulty)
  const visibleTests = question.test_cases.filter(t => !t.is_hidden)
  const hiddenCount  = question.test_cases.filter(t => t.is_hidden).length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          {/* Question navigation */}
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
              {index + 1} / {total}
            </span>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="w-7 h-7 rounded-lg glass-sm flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Difficulty badge */}
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${diff.bg} ${diff.color}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {diff.label}
          </span>
        </div>

        <h2
          className="text-lg font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {question.title}
        </h2>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Description — render markdown-ish content */}
        <div
          className="prose-custom text-sm text-white/65 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(question.description),
          }}
        />

        {/* Visible test cases */}
        {visibleTests.length > 0 && (
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Examples
            </h4>
            <div className="space-y-3">
              {visibleTests.map((tc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                >
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5"
                        style={{ fontFamily: 'var(--font-mono)' }}>Input</p>
                      <pre
                        className="text-xs text-cyan-300/80 whitespace-pre-wrap break-all"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {tc.input}
                      </pre>
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5"
                        style={{ fontFamily: 'var(--font-mono)' }}>Expected</p>
                      <pre
                        className="text-xs text-emerald-300/80 whitespace-pre-wrap break-all"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {tc.expected_output}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden test case indicator */}
        {hiddenCount > 0 && (
          <div
            className="flex items-center gap-2 text-xs text-white/25 border border-dashed border-white/[0.08] rounded-xl px-4 py-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <EyeOff size={12} />
            {hiddenCount} hidden test {hiddenCount === 1 ? 'case' : 'cases'} — visible after submission
          </div>
        )}
      </div>

      {/* Inline CSS for prose styling */}
      <style jsx global>{`
        .prose-custom h2 { font-size:1.1rem; font-weight:700; color:rgba(255,255,255,.8); margin:0 0 .75rem; font-family:var(--font-display); }
        .prose-custom p  { margin-bottom:.75rem; }
        .prose-custom strong { color:rgba(255,255,255,.75); font-weight:600; }
        .prose-custom code { font-family:var(--font-mono); font-size:.8rem; color:var(--accent-primary); background:rgba(0,212,200,.08); padding:.1em .35em; border-radius:4px; }
        .prose-custom pre { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:.75rem 1rem; overflow-x:auto; margin:.5rem 0; }
        .prose-custom pre code { background:none; padding:0; color:rgba(255,255,255,.75); }
        .prose-custom ul { padding-left:1.25rem; space-y:.25rem; }
        .prose-custom li { margin-bottom:.25rem; }
      `}</style>
    </div>
  )
}

/** Minimal markdown → HTML renderer for the question description */
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
