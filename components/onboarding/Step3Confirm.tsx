'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronLeft, Rocket, Github, Globe, Code, Clock, FileText } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'
import { getLanguageLabel } from '@/lib/utils'
import type { OnboardingFormValues } from '@/lib/validators'

interface Step3Props {
  formData:  Partial<OnboardingFormValues>
  resumeUrl: string | null
  onBack:    () => void
  onConfirm: () => Promise<void>
}

export default function Step3Confirm({ formData, resumeUrl, onBack, onConfirm }: Step3Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  const fields = [
    {
      icon:  Code,
      label: 'Full Name',
      value: formData.full_name ?? '—',
    },
    {
      icon:  Code,
      label: 'Username',
      value: `@${formData.username ?? '—'}`,
      mono:  true,
    },
    {
      icon:  Github,
      label: 'GitHub',
      value: formData.github_url || 'Not provided',
      dim:   !formData.github_url,
    },
    {
      icon:  Globe,
      label: 'Portfolio',
      value: formData.portfolio_url || 'Not provided',
      dim:   !formData.portfolio_url,
    },
    {
      icon:  Code,
      label: 'Primary Language',
      value: getLanguageLabel(formData.primary_language ?? 'javascript'),
    },
    {
      icon:  Clock,
      label: 'Experience',
      value: `${formData.years_of_exp ?? 0} ${(formData.years_of_exp ?? 0) === 1 ? 'year' : 'years'}`,
    },
    {
      icon:  FileText,
      label: 'Resume',
      value: resumeUrl ? 'Uploaded ✓' : 'Not uploaded',
      dim:   !resumeUrl,
      accent: !!resumeUrl,
    },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center pb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/15 mb-4">
          <CheckCircle2 size={28} className="text-[var(--accent-primary)]" />
        </div>
        <h3
          className="text-xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Looks good?
        </h3>
        <p className="text-sm text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
          Review your details before we create your Passport.
        </p>
      </div>

      {/* Summary card */}
      <GlassCard variant="sm" className="divide-y divide-white/[0.05]">
        {fields.map(({ icon: Icon, label, value, mono, dim, accent }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Icon size={13} className="text-white/30 flex-shrink-0" />
              <span
                className="text-xs text-white/45"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {label}
              </span>
            </div>
            <span
              className={`text-sm font-medium truncate max-w-[180px] text-right ${
                accent ? 'text-emerald-400' :
                dim    ? 'text-white/20'    :
                         'text-white/75'
              }`}
              style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </GlassCard>

      {/* What happens next */}
      <GlassCard variant="sm" className="px-5 py-4">
        <p className="text-xs text-white/35 mb-2 uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)' }}>
          What happens next
        </p>
        <ul className="space-y-1.5">
          {[
            'Your Skill Passport profile is created',
            'You\'ll be taken to your dashboard',
            'Start a timed coding assessment anytime',
            'Share your verified scores with employers',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/50"
              style={{ fontFamily: 'var(--font-body)' }}>
              <span className="text-[var(--accent-primary)] mt-0.5 flex-shrink-0">›</span>
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn-ghost flex-1 justify-center"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary flex-[2] justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#03030a]/30 border-t-[#03030a] rounded-full animate-spin" />
              Creating Passport...
            </>
          ) : (
            <>
              <Rocket size={16} />
              Create My Passport
            </>
          )}
        </button>
      </div>
    </div>
  )
}
