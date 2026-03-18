'use client'

import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'

export default function CallToAction() {
  const [hovered, setHovered] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // A brief timeout lets the scroll complete before triggering auth modal
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-auth-modal'))
    }, 600)
  }

  return (
    <section className="relative py-32 px-6 overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <GlassCard variant="bright" gradientBorder className="p-14">

          {/* Icon mark */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-[0_0_40px_rgba(0,212,200,0.35)]">
              <Zap size={28} className="text-[#03030a]" strokeWidth={2.5} />
            </div>
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to Get{' '}
            <span className="gradient-text">Verified?</span>
          </h2>

          <p
            className="text-base text-white/50 max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Join developers who use Skill Passport to stand out in job applications,
            freelance bids, and open source communities.
            Your first assessment is completely free.
          </p>

          <button
            onClick={scrollToTop}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="btn-primary text-base px-10 py-4 mx-auto"
          >
            Create Your Passport — It's Free
            <ArrowRight
              size={18}
              className="transition-transform duration-200"
              style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}
            />
          </button>

          <p className="text-xs text-white/20 mt-6" style={{ fontFamily: 'var(--font-mono)' }}>
            No credit card required · Takes ~75 minutes · Results instantly
          </p>
        </GlassCard>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-white/20"
          style={{ fontFamily: 'var(--font-mono)' }}>
          <span>© 2025 Skill Passport</span>
          <span>·</span>
          <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          <span>·</span>
          <a href="https://github.com" className="hover:text-white/40 transition-colors">GitHub</a>
        </div>
      </div>
    </section>
  )
}
