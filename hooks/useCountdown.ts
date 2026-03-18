'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAssessmentStore } from '@/store/assessmentStore'

/**
 * Server-synced countdown timer.
 *
 * Instead of simply ticking down a local counter (which can be manipulated
 * or drift), we store the absolute `expiresAt` timestamp and recalculate
 * the remaining seconds on every tick from `Date.now()`.
 *
 * @param expiresAt  ISO string — the server-issued expiry time for this assessment.
 * @param enabled    Pause the timer when false (after completion/failure).
 */
export function useCountdown(expiresAt: string | null, enabled: boolean) {
  const { setSeconds, expireTimer } = useAssessmentStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    if (!expiresAt) return

    const remaining = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / 1000
    )

    if (remaining <= 0) {
      setSeconds(0)
      expireTimer()
      if (intervalRef.current) clearInterval(intervalRef.current)
    } else {
      setSeconds(remaining)
    }
  }, [expiresAt, setSeconds, expireTimer])

  useEffect(() => {
    if (!enabled || !expiresAt) return

    // Run immediately then on every second
    tick()
    intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, expiresAt, tick])
}

/**
 * Format a seconds count as MM:SS
 */
export function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
