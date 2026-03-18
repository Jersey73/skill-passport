'use client'

import { useEffect } from 'react'
import Navbar from '@/components/shared/Navbar'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[var(--bg-void)] bg-grid">
      <Navbar />
      <div className="flex items-center justify-center pt-32">
        <div className="text-center p-8 rounded-2xl border border-white/5 bg-white/[0.02] max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Dashboard Error</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Failed to load dashboard data. This might be a temporary issue.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[var(--accent-primary)] text-[var(--bg-void)] rounded-lg font-semibold text-sm uppercase tracking-wider hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  )
}
