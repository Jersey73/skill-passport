'use client'

import Link from 'next/link'
import { Github, Globe, Share2, CheckCircle2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import GlassCard from '@/components/shared/GlassCard'
import { getScoreColor, getScoreGradient, getLanguageLabel } from '@/lib/utils'
import type { User } from '@/types'

interface PassportCardProps {
  user:        User
  isOwner:     boolean
  assessmentCount: number
}

export default function PassportCard({ user, isOwner, assessmentCount }: PassportCardProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/${user.username}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreColor   = getScoreColor(user.overall_score)
  const scoreGradient = getScoreGradient(user.overall_score)

  return (
    <GlassCard variant="bright" gradientBorder className="p-7 md:p-9">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden border-2"
            style={{ borderColor: 'var(--glass-border-bright)' }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name ?? user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)]/30 to-[var(--accent-secondary)]/30 flex items-center justify-center">
                <span
                  className="text-2xl font-bold text-[var(--accent-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {(user.full_name ?? user.username)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Verified badge */}
          {user.overall_score > 0 && (
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[var(--bg-void)] border border-[var(--glass-border)] flex items-center justify-center">
              <CheckCircle2 size={15} className="text-[var(--accent-primary)]" />
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-2xl font-bold text-white truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {user.full_name ?? user.username}
            </h1>
            {user.overall_score > 0 && (
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border"
                style={{
                  fontFamily:  'var(--font-mono)',
                  color:       'var(--accent-primary)',
                  borderColor: 'var(--accent-primary)',
                  background:  'var(--accent-glow)',
                }}
              >
                Verified
              </span>
            )}
          </div>

          <p
            className="text-sm text-white/40 mt-0.5 font-mono"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            @{user.username}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="glass-sm text-xs px-3 py-1 rounded-full text-white/50"
              style={{ fontFamily: 'var(--font-mono)' }}>
              {getLanguageLabel(user.primary_language)}
            </span>
            <span className="glass-sm text-xs px-3 py-1 rounded-full text-white/50"
              style={{ fontFamily: 'var(--font-mono)' }}>
              {user.years_of_exp} {user.years_of_exp === 1 ? 'yr' : 'yrs'} exp
            </span>
            <span className="glass-sm text-xs px-3 py-1 rounded-full text-white/50"
              style={{ fontFamily: 'var(--font-mono)' }}>
              {assessmentCount} {assessmentCount === 1 ? 'assessment' : 'assessments'}
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-3">
            {user.github_url && (
              <a
                href={user.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Github size={13} />
                GitHub
              </a>
            )}
            {user.portfolio_url && (
              <a
                href={user.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Globe size={13} />
                Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Score + Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto">

          {/* Overall score ring */}
          <div className="text-center md:text-right">
            <div
              className={`text-5xl font-bold ${scoreColor}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {user.overall_score}
            </div>
            <div className="text-xs text-white/30 mt-0.5 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)' }}>
              Overall Score
            </div>
            {/* Score bar */}
            <div className="mt-2 h-1 w-24 md:w-32 bg-white/10 rounded-full overflow-hidden ml-auto">
              <div
                className={`h-full bg-gradient-to-r ${scoreGradient} progress-bar rounded-full`}
                style={{ width: `${user.overall_score}%` }}
              />
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 glass-sm px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-all hover:border-[var(--accent-primary)]/50"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {copied ? (
              <><Check size={13} className="text-emerald-400" /> Copied!</>
            ) : (
              <><Share2 size={13} /> Share Passport</>
            )}
          </button>

          {/* Take assessment CTA (owner only) */}
          {isOwner && (
            <Link
              href="/assessment/new"
              className="btn-primary text-xs px-4 py-2"
            >
              Take Assessment
            </Link>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
