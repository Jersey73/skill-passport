'use client'

import { useAssessmentStore } from '@/store/assessmentStore'
import { formatCountdown } from '@/hooks/useCountdown'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CountdownTimer() {
  const secondsRemaining = useAssessmentStore(s => s.secondsRemaining)
  const timerExpired     = useAssessmentStore(s => s.timerExpired)

  const isUrgent   = secondsRemaining <= 300  // ≤ 5 min
  const isCritical = secondsRemaining <= 60   // ≤ 1 min

  const colorClass = isCritical
    ? 'text-rose-400'
    : isUrgent
    ? 'text-amber-400'
    : 'text-[var(--accent-primary)]'

  const borderClass = isCritical
    ? 'border-rose-400/40 bg-rose-400/10'
    : isUrgent
    ? 'border-amber-400/30 bg-amber-400/10'
    : 'border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-500',
        borderClass
      )}
    >
      <Clock
        size={13}
        className={cn('flex-shrink-0 transition-colors', colorClass)}
      />
      <span
        className={cn(
          'text-sm font-bold tabular-nums tracking-widest transition-colors',
          colorClass,
          isCritical && 'animate-pulse'
        )}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {timerExpired ? '00:00' : formatCountdown(secondsRemaining)}
      </span>
    </div>
  )
}
