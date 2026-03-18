'use client'

import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bright' | 'sm'
  glow?: boolean
  gradientBorder?: boolean
  as?: React.ElementType
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'default',
      glow = false,
      gradientBorder = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'glass rounded-2xl',
      bright:  'glass-bright rounded-2xl',
      sm:      'glass-sm rounded-xl',
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          gradientBorder && 'gradient-border',
          glow && 'glow-accent',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
