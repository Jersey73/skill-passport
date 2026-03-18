'use client'

import { useEffect, useRef } from 'react'
import { useAssessmentStore } from '@/store/assessmentStore'

/**
 * Attaches all anti-cheat event listeners for the duration of the assessment.
 *
 * Detections:
 *   1. visibilitychange  — tab switching / window minimizing
 *   2. contextmenu       — right-click disabled inside editor wrapper
 *   3. copy              — clipboard copy blocked
 *   4. paste             — clipboard paste blocked
 *   5. selectstart       — text selection blocked inside editor wrapper
 *   6. keydown           — Ctrl/Cmd+C, Ctrl/Cmd+V, F12, DevTools shortcuts blocked
 *
 * @param editorWrapperRef  Ref to the DOM element wrapping the Monaco editor
 * @param enabled           Set false to disable all hooks (e.g., after assessment ends)
 */
export function useAntiCheat(
  editorWrapperRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const { recordTabSwitch, appendConsole } = useAssessmentStore()

  // ── 1. Tab Switch / Visibility Change ──────────────────────────────────────
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordTabSwitch()
        appendConsole('[SYSTEM] Tab switch detected.')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, recordTabSwitch, appendConsole])

  // ── 2-5. Editor Wrapper Restrictions ──────────────────────────────────────
  useEffect(() => {
    if (!enabled) return
    const wrapper = editorWrapperRef.current
    if (!wrapper) return

    const block = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      appendConsole('[SYSTEM] Copy attempt blocked.')
    }

    const blockPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      appendConsole('[SYSTEM] Paste attempt blocked.')
    }

    wrapper.addEventListener('contextmenu', block)
    wrapper.addEventListener('copy',        blockCopy)
    wrapper.addEventListener('paste',       blockPaste)
    wrapper.addEventListener('selectstart', block)

    return () => {
      wrapper.removeEventListener('contextmenu', block)
      wrapper.removeEventListener('copy',        blockCopy)
      wrapper.removeEventListener('paste',       blockPaste)
      wrapper.removeEventListener('selectstart', block)
    }
  }, [enabled, editorWrapperRef, appendConsole])

  // ── 6. Keyboard Shortcut Blocking ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey

      // Block copy / paste shortcuts globally during assessment
      if (isMeta && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        appendConsole('[SYSTEM] Copy shortcut blocked.')
        return
      }
      if (isMeta && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault()
        appendConsole('[SYSTEM] Paste shortcut blocked.')
        return
      }

      // Block developer tools
      if (e.key === 'F12') { e.preventDefault(); return }
      if (isMeta && e.shiftKey && (e.key === 'i' || e.key === 'I')) { e.preventDefault(); return }
      if (isMeta && e.shiftKey && (e.key === 'j' || e.key === 'J')) { e.preventDefault(); return }
      if (isMeta && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [enabled, appendConsole])
}
