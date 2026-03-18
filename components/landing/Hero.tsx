'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Github, Chrome, Shield, Sparkles } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'

export default function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authLoading, setAuthLoading] = useState<'github' | 'google' | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('auth')) setShowAuthModal(true)
  }, [searchParams])

  const signInWith = async (provider: 'github' | 'google') => {
    if (!supabase) return
    setAuthLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
        scopes: provider === 'github' ? 'read:user user:email' : undefined,
      },
    })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-grid px-6">

      {/* ── Ambient Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,200,0.12) 0%, transparent 70%)' }} />
        <div className="orb-2 absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)' }} />
        <div className="orb-3 absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,145,178,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* ── Grid Accent Lines ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/30 to-transparent" />
        <div className="absolute bottom-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/20 to-transparent" />
        <div className="absolute bottom-0 right-1/3 w-px h-48 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <div className="animate-fade-up flex justify-center mb-8">
          <GlassCard variant="sm" className="inline-flex items-center gap-2 px-4 py-2">
            <Sparkles size={14} className="text-[var(--accent-primary)]" />
            <span className="text-xs font-medium tracking-widest uppercase text-white/60"
              style={{ fontFamily: 'var(--font-mono)' }}>
              AI-Verified Credentials
            </span>
          </GlassCard>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100 text-[clamp(2.8rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="block text-white/90">Your Skills.</span>
          <span className="block gradient-text glow-text">Verified.</span>
          <span className="block text-white/90">Shareable.</span>
        </h1>

        {/* Sub-headline */}
        <p
          className="animate-fade-up delay-200 text-lg text-white/50 max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Take a secure, AI-proctored coding assessment. Receive a verified{' '}
          <span className="text-white/75">Skill Passport</span> with granular scores for
          algorithm efficiency, readability, and problem solving.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary text-base px-8 py-4 group"
          >
            Get Your Passport
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#features"
            className="btn-ghost text-sm"
          >
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <div className="animate-fade-up delay-500 mt-12 flex items-center justify-center gap-6 text-xs text-white/30"
          style={{ fontFamily: 'var(--font-mono)' }}>
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-[var(--accent-primary)]" />
            Anti-cheat protected
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span>60-min timed assessment</span>
          <span className="w-px h-3 bg-white/10" />
          <span>Shareable public profile</span>
        </div>
      </div>

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,3,10,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAuthModal(false) }}
        >
          <GlassCard
            variant="bright"
            gradientBorder
            className="w-full max-w-md p-8 animate-scale-in"
          >
            {/* Modal header */}
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Create Your Passport
              </h2>
              <p className="text-sm text-white/50" style={{ fontFamily: 'var(--font-body)' }}>
                Sign in to begin your verified skill assessment
              </p>
            </div>

            {/* Auth Providers */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signInWith('github')}
                disabled={authLoading !== null}
                className="flex items-center gap-3 w-full px-5 py-4 glass rounded-xl border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all group"
              >
                <Github size={20} />
                <span className="flex-1 text-left text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  {authLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
                </span>
                {authLoading !== 'github' && (
                  <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              <button
                onClick={() => signInWith('google')}
                disabled={authLoading !== null}
                className="flex items-center gap-3 w-full px-5 py-4 glass rounded-xl border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all group"
              >
                <Chrome size={20} />
                <span className="flex-1 text-left text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  {authLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                </span>
                {authLoading !== 'google' && (
                  <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>

            {/* Legal copy */}
            <p className="text-center text-xs text-white/25 mt-6" style={{ fontFamily: 'var(--font-body)' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* Close */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </GlassCard>
        </div>
      )}
    </section>
  )
}
