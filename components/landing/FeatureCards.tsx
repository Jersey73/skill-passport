'use client'

import GlassCard from '@/components/shared/GlassCard'
import { BrainCircuit, ShieldCheck, Share2, Code2, BarChart3, Lock } from 'lucide-react'

const FEATURES = [
  {
    icon:        BrainCircuit,
    iconColor:   'text-[var(--accent-primary)]',
    iconBg:      'from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20',
    accent:      'var(--accent-primary)',
    title:       'AI-Powered Evaluation',
    description:
      'Every submission is evaluated by a frontier AI model. Get granular scores for algorithm efficiency, code readability, and problem-solving strategy — not just pass/fail.',
    stat:        '3 Metrics',
    statLabel:   'per question',
  },
  {
    icon:        ShieldCheck,
    iconColor:   'text-purple-400',
    iconBg:      'from-purple-500/20 to-purple-700/20',
    accent:      '#a78bfa',
    title:       'Anti-Cheat Engine',
    description:
      'Server-synced 60-minute timers, tab-switch detection, clipboard lockdown, and AI plagiarism flags combine to make every Passport meaningfully earned.',
    stat:        '4-Layer',
    statLabel:   'protection system',
  },
  {
    icon:        Share2,
    iconColor:   'text-emerald-400',
    iconBg:      'from-emerald-500/20 to-teal-700/20',
    accent:      '#34d399',
    title:       'Shareable Passport',
    description:
      'Your verified scores live on a beautiful, public-by-default profile page with radar charts and score breakdowns. Share the link anywhere — no login required to view.',
    stat:        '1 Link',
    statLabel:   'to share everything',
  },
]

const HOW_IT_WORKS = [
  { icon: Code2,      step: '01', title: 'Take the Assessment',  desc: 'Complete 3 timed coding challenges in a secure, full-featured Monaco editor.' },
  { icon: BrainCircuit, step: '02', title: 'AI Evaluates Code', desc: 'Our AI grades your logic, style, and efficiency — generating detailed written feedback.' },
  { icon: BarChart3,  step: '03', title: 'Get Your Passport',    desc: 'Receive a verified score card with radar charts, progress bars, and shareable URL.' },
]

export default function FeatureCards() {
  return (
    <>
      {/* ── FEATURES SECTION ── */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--accent-primary)] mb-4"
              style={{ fontFamily: 'var(--font-mono)' }}>
              Why Skill Passport
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}>
              Skills You Can{' '}
              <span className="gradient-text">Prove</span>
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <GlassCard
                  key={feature.title}
                  className="p-7 group hover:border-[var(--glass-border-bright)] cursor-default"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${feature.accent}18`
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                  }}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-6`}>
                    <Icon size={22} className={feature.iconColor} />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold text-white mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm text-white/50 leading-relaxed mb-6"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {feature.description}
                  </p>

                  {/* Stat pill */}
                  <div className="flex items-center gap-2 mt-auto">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: feature.accent, fontFamily: 'var(--font-display)' }}
                    >
                      {feature.stat}
                    </span>
                    <span
                      className="text-xs text-white/35"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {feature.statLabel}
                    </span>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="relative py-24 px-6">
        {/* Horizontal rule with glow */}
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center mb-24">
            <div className="flex-1 h-px bg-white/5" />
            <div className="mx-6 glass-sm px-5 py-2 rounded-full flex items-center gap-2">
              <Lock size={12} className="text-[var(--accent-primary)]" />
              <span className="text-xs text-white/40 tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}>
                How It Works
              </span>
            </div>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }} />

            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="text-center flex flex-col items-center gap-4">
                  {/* Step number + icon */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/40 flex items-center justify-center">
                      <Icon size={20} className="text-[var(--accent-primary)]" />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--bg-void)] px-1.5 py-0.5 rounded-full border border-[var(--accent-primary)]/30"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3
                    className="font-bold text-white text-lg"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-white/45 max-w-[200px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
