'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingFormValues, PROGRAMMING_LANGUAGES } from '@/lib/validators'
import { getLanguageLabel } from '@/lib/utils'
import { User, Github, Globe, Code, Clock, ChevronRight } from 'lucide-react'

interface Step1Props {
  defaultValues: Partial<OnboardingFormValues>
  onNext: (data: Partial<OnboardingFormValues>) => void
}

const LANGUAGE_OPTIONS = PROGRAMMING_LANGUAGES.map(lang => ({
  value: lang,
  label: getLanguageLabel(lang),
}))

export default function Step1Profile({ defaultValues, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(
      onboardingSchema.pick({
        full_name:        true,
        username:         true,
        github_url:       true,
        portfolio_url:    true,
        primary_language: true,
        years_of_exp:     true,
      })
    ),
    defaultValues: {
      primary_language: 'javascript',
      years_of_exp:     0,
      ...defaultValues,
    },
    mode: 'onChange',
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">

      {/* Full name + username side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Full Name" icon={User} error={errors.full_name?.message}>
          <input
            {...register('full_name')}
            placeholder="Ada Lovelace"
            className="input-field"
          />
        </FieldGroup>

        <FieldGroup label="Username" icon={Code} error={errors.username?.message}>
          <div className="flex items-center input-field gap-1 !px-3">
            <span className="text-white/25 text-sm select-none">@</span>
            <input
              {...register('username')}
              placeholder="ada_dev"
              className="bg-transparent outline-none flex-1 text-sm text-white/80"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </FieldGroup>
      </div>

      {/* GitHub URL */}
      <FieldGroup label="GitHub Profile" icon={Github} error={errors.github_url?.message} optional>
        <input
          {...register('github_url')}
          placeholder="https://github.com/yourusername"
          className="input-field"
        />
      </FieldGroup>

      {/* Portfolio URL */}
      <FieldGroup label="Portfolio URL" icon={Globe} error={errors.portfolio_url?.message} optional>
        <input
          {...register('portfolio_url')}
          placeholder="https://yourportfolio.dev"
          className="input-field"
        />
      </FieldGroup>

      {/* Primary language + years of exp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Primary Language" icon={Code} error={errors.primary_language?.message}>
          <select {...register('primary_language')} className="input-field appearance-none">
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[var(--bg-elevated)]">
                {opt.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label="Years of Experience" icon={Clock} error={errors.years_of_exp?.message}>
          <input
            {...register('years_of_exp', { valueAsNumber: true })}
            type="number"
            min={0}
            max={50}
            placeholder="3"
            className="input-field"
          />
        </FieldGroup>
      </div>

      {/* Next button */}
      <div className="pt-2">
        <button
          type="submit"
          className="btn-primary w-full py-4"
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Field styles via global CSS pattern */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          background: var(--glass-01);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.875rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }
        .input-field:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .input-field option { background: #111124; color: white; }
      `}</style>
    </form>
  )
}

// ---- Internal FieldGroup helper ----
function FieldGroup({
  label, icon: Icon, error, optional, children,
}: {
  label: string
  icon: React.ElementType
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="flex items-center gap-1.5 text-xs font-medium text-white/50"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <Icon size={12} className="text-[var(--accent-primary)]" />
        {label}
        {optional && <span className="text-white/25 ml-1">(optional)</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-400 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
