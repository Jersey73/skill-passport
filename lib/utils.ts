import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Difficulty, ProgrammingLanguage } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'In Progress'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-cyan-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-rose-400'
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-teal-400'
  if (score >= 60) return 'from-cyan-500 to-blue-400'
  if (score >= 40) return 'from-amber-500 to-orange-400'
  return 'from-rose-500 to-pink-400'
}

export function getDifficultyConfig(difficulty: Difficulty) {
  const configs = {
    easy:   { label: 'Easy',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
    medium: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30' },
    hard:   { label: 'Hard',   color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/30' },
  }
  return configs[difficulty]
}

export function getLanguageLabel(lang: ProgrammingLanguage): string {
  const labels: Record<ProgrammingLanguage, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python:     'Python',
    java:       'Java',
    cpp:        'C++',
    go:         'Go',
    rust:       'Rust',
  }
  return labels[lang] ?? lang
}

export function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    completed:   { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
    in_progress: { label: 'In Progress', color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/30' },
    expired:     { label: 'Expired',     color: 'text-zinc-400',    bg: 'bg-zinc-400/10 border-zinc-400/30' },
    flagged:     { label: 'Flagged',     color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/30' },
  }
  return configs[status] ?? configs.expired
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
