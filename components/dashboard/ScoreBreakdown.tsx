'use client'

import { useEffect, useRef, useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import { getScoreColor } from '@/lib/utils'
import { TrendingUp, Eye, Lightbulb, Info } from 'lucide-react'
import type { SkillScore } from '@/types'

interface ScoreBreakdownProps {
  skillScores: SkillScore[]
  hasData:     boolean
}

const METRIC_CONFIG = [
  {
    key:         'Algorithm\nEfficiency',
    label:       'Algorithm Efficiency',
    icon:        TrendingUp,
    description: 'Measures time/space complexity, optimal algorithm choice, and solution performance.',
    color:       'from-[var(--accent-primary)] to-cyan-400',
  },
  {
    key:         'Code\nReadability',
    label:       'Code Readability',
    icon:        Eye,
    description: 'Evaluates naming conventions, code structure, comments, and overall clarity.',
    color:       'from-purple-400 to-pink-400',
  },
  {
    key:         'Problem\nSolving',
    label:       'Problem Solving',
    icon:        Lightbulb,
    description: 'Assesses edge case handling, test case coverage, and logical decomposition.',
    color:       'from-amber-400 to-orange-400',
  },
]

export default function ScoreBreakdown({ skillScores, hasData }: ScoreBreakdownProps) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasData) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasData])

  const getScore = (key: string) =>
    skillScores.find(s => s.subject === key)?.score ?? 0

  return (
    <GlassCard ref={ref} className="p-7 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-base font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Score Breakdown
        </h3>
        <p className="text-xs text-white/35 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
          AI-graded metrics per submission
        </p>
      </div>

      <div className="space-y-7">
        {METRIC_CONFIG.map(({ key, label, icon: Icon, description, color }) => {
          const score = hasData ? getScore(key) : 0

          return (
            <div key={key}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center opacity-80`}
                    style={{ filter: 'saturate(0.7)' }}
                  >
                    <Icon size={13} className="text-white" />
                  </div>
                  <span
                    className="text-sm font-medium text-white/75"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {label}
                  </span>
                  {/* Tooltip trigger */}
                  <div className="relative group cursor-help">
                    <Info size={11} className="text-white/20 hover:text-white/40 transition-colors" />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 glass px-3 py-2.5 rounded-xl text-xs text-white/60 leading-relaxed z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {description}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${hasData ? getScoreColor(score) : 'text-white/15'}`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {hasData ? score : '—'}
                  {hasData && <span className="text-white/25 font-normal text-xs">/100</span>}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
                  style={{
                    width:             animated && hasData ? `${score}%` : '0%',
                    transitionDuration: '1.1s',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity:           hasData ? 1 : 0.15,
                  }}
                />
              </div>

              {/* Grade label */}
              {hasData && (
                <p
                  className="text-[10px] text-white/25 mt-1.5"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {score >= 85 ? 'Excellent' :
                   score >= 70 ? 'Good'      :
                   score >= 55 ? 'Fair'      :
                   score >= 40 ? 'Needs Work':
                                 'Beginner'  }
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="mt-6 text-center py-4 border border-dashed border-white/[0.06] rounded-xl">
          <p className="text-xs text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
            Complete an assessment to unlock your breakdown
          </p>
        </div>
      )}
    </GlassCard>
  )
}
