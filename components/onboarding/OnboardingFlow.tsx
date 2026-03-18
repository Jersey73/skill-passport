'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import GlassCard from '@/components/shared/GlassCard'
import StepIndicator from '@/components/onboarding/StepIndicator'
import Step1Profile from '@/components/onboarding/Step1Profile'
import Step2Resume from '@/components/onboarding/Step2Resume'
import Step3Confirm from '@/components/onboarding/Step3Confirm'
import type { OnboardingFormValues } from '@/lib/validators'
import { Zap } from 'lucide-react'

const STEPS = ['Profile', 'Resume', 'Confirm']

export default function OnboardingFlow() {
  const [step, setStep]           = useState(0)
  const [user, setUser]           = useState<User | null>(null)
  const [formData, setFormData]   = useState<Partial<OnboardingFormValues>>({})
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (!data.user) { router.push('/'); return }
      setUser(data.user)

      // Pre-fill from OAuth metadata
      setFormData(prev => ({
        full_name: data.user?.user_metadata?.full_name ?? data.user?.user_metadata?.name ?? '',
        username:  data.user?.user_metadata?.user_name ?? '',
        github_url: data.user?.user_metadata?.user_name
          ? `https://github.com/${data.user.user_metadata.user_name}`
          : '',
        ...prev,
      }))
    })
  }, [])

  const handleStep1 = (data: Partial<OnboardingFormValues>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(1)
  }

  const handleStep2 = (url: string | null) => {
    setResumeUrl(url)
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!user || !supabase) return

    const { error } = await supabase
      .from('users')
      .update({
        full_name:        formData.full_name,
        username:         formData.username,
        github_url:       formData.github_url   || null,
        portfolio_url:    formData.portfolio_url || null,
        primary_language: formData.primary_language,
        years_of_exp:     formData.years_of_exp,
        resume_url:       resumeUrl,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Profile update failed:', error)
      return
    }

    router.push('/dashboard/me')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--accent-primary)]/30 border-t-[var(--accent-primary)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main
      className="min-h-screen bg-[var(--bg-void)] bg-grid flex flex-col items-center justify-center px-4 py-16"
      style={{ position: 'relative' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <Zap size={15} className="text-[#03030a]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}>
            Skill<span className="gradient-text">Passport</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* Card */}
        <GlassCard variant="bright" gradientBorder className="p-8">

          {/* Step header */}
          <div className="mb-7">
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {step === 0 && 'Tell us about yourself'}
              {step === 1 && 'Upload your resume'}
              {step === 2 && 'Almost there!'}
            </h2>
            <p className="text-sm text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
              {step === 0 && 'This info will appear on your public Skill Passport.'}
              {step === 1 && 'Optional — helps AI provide context-aware code evaluation.'}
              {step === 2 && 'Confirm your details to create your Passport.'}
            </p>
          </div>

          {/* Step content */}
          {step === 0 && (
            <Step1Profile
              defaultValues={formData}
              onNext={handleStep1}
            />
          )}
          {step === 1 && (
            <Step2Resume
              userId={user.id}
              onNext={handleStep2}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <Step3Confirm
              formData={formData}
              resumeUrl={resumeUrl}
              onBack={() => setStep(1)}
              onConfirm={handleConfirm}
            />
          )}
        </GlassCard>

        <p className="text-center text-xs text-white/20 mt-6"
          style={{ fontFamily: 'var(--font-mono)' }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </main>
  )
}
