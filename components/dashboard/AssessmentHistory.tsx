'use client'

import Link from 'next/link'
import GlassCard from '@/components/shared/GlassCard'
import {
  formatDate,
  formatDuration,
  getDifficultyConfig,
  getScoreColor,
  getStatusConfig,
} from '@/lib/utils'
import type { Assessment } from '@/types'
import { ClipboardList, ChevronRight, AlertTriangle, Clock } from 'lucide-react'

interface AssessmentHistoryProps {
  assessments: Assessment[]
  isOwner:     boolean
}

export default function AssessmentHistory({ assessments, isOwner }: AssessmentHistoryProps) {
  const completed = assessments.filter(a => a.status === 'completed' || a.status === 'flagged')

  return (
    <GlassCard className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-base font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Assessment History
          </h3>
          <p className="text-xs text-white/35 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            {completed.length} completed
          </p>
        </div>

        {isOwner && (
          <Link
            href="/assessment/new"
            className="glass-sm px-4 py-2 rounded-xl text-xs text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors font-medium"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            + New
          </Link>
        )}
      </div>

      {/* Empty state */}
      {completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <ClipboardList size={20} className="text-white/20" />
          </div>
          <p className="text-sm text-white/30" style={{ fontFamily: 'var(--font-body)' }}>
            No assessments yet
          </p>
          {isOwner && (
            <Link
              href="/assessment/new"
              className="text-xs text-[var(--accent-primary)] hover:underline mt-1"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Take your first assessment →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => {
            const statusConfig = getStatusConfig(assessment.status)

            return (
              <div
                key={assessment.id}
                className="flex items-center gap-4 p-4 glass-sm rounded-xl hover:border-white/10 transition-all group"
              >
                {/* Status dot */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    assessment.status === 'completed' ? 'bg-emerald-400' :
                    assessment.status === 'flagged'   ? 'bg-rose-400'    :
                    assessment.status === 'in_progress' ? 'bg-cyan-400'  :
                                                          'bg-white/20'
                  }`}
                />

                {/* Date + duration */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium text-white/70"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {formatDate(assessment.started_at)}
                    </span>

                    {/* Flagged warning */}
                    {assessment.is_flagged_for_cheating && (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full"
                        style={{ fontFamily: 'var(--font-mono)' }}>
                        <AlertTriangle size={9} />
                        Flagged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className="flex items-center gap-1 text-[10px] text-white/25"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <Clock size={9} />
                      {formatDuration(assessment.started_at, assessment.completed_at)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  {assessment.final_score !== null ? (
                    <>
                      <span
                        className={`text-xl font-bold ${getScoreColor(assessment.final_score)}`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {assessment.final_score}
                      </span>
                      <span className="text-xs text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>/100</span>
                    </>
                  ) : (
                    <span className="text-sm text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>
                      —
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={14}
                  className="text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0"
                />
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
