'use client'

import { useRef, useEffect } from 'react'
import { useAssessmentStore } from '@/store/assessmentStore'
import { Terminal, Trash2 } from 'lucide-react'

export default function ConsolePanel() {
  const consoleOutput = useAssessmentStore(s => s.consoleOutput)
  const clearConsole  = useAssessmentStore(s => s.clearConsole)
  const scrollRef     = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [consoleOutput])

  const getLineColor = (line: string) => {
    if (line.startsWith('[ERROR]'))  return 'text-rose-400'
    if (line.startsWith('[AI]'))     return 'text-[var(--accent-primary)]'
    if (line.startsWith('[SYSTEM]')) return 'text-amber-400'
    return 'text-white/50'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[var(--accent-primary)]" />
          <span
            className="text-[10px] uppercase tracking-widest text-white/30 font-medium"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Output
          </span>
          {consoleOutput.length > 0 && (
            <span className="text-[9px] text-white/20 font-mono bg-white/5 px-1.5 py-0.5 rounded-full">
              {consoleOutput.length}
            </span>
          )}
        </div>
        {consoleOutput.length > 0 && (
          <button
            onClick={clearConsole}
            className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Trash2 size={10} />
            clear
          </button>
        )}
      </div>

      {/* Output lines */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        {consoleOutput.length === 0 ? (
          <p
            className="text-xs text-white/15 mt-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Submit your code to see evaluation output here.
          </p>
        ) : (
          consoleOutput.map((line, i) => (
            <div
              key={i}
              className={`text-xs leading-5 ${getLineColor(line)}`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
