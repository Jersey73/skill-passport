'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  steps:       string[]
  currentStep: number   // 0-indexed
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep
        const isActive    = index === currentStep
        const isLast      = index === steps.length - 1

        return (
          <div key={label} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  isCompleted && 'bg-[var(--accent-primary)] text-[#03030a]',
                  isActive    && 'border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10',
                  !isCompleted && !isActive && 'border border-white/10 text-white/25'
                )}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide uppercase whitespace-nowrap',
                  isActive    && 'text-[var(--accent-primary)]',
                  isCompleted && 'text-white/50',
                  !isCompleted && !isActive && 'text-white/20'
                )}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'h-px w-12 md:w-20 mx-1 mb-5 transition-all duration-500',
                  isCompleted ? 'bg-[var(--accent-primary)]' : 'bg-white/10'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
