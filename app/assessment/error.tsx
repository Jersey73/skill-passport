'use client'

import { useEffect } from 'react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AssessmentError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[AssessmentError]', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#03030a',
        color: '#e4e4e7',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '28rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛑</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Assessment Error
        </h2>
        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Something went wrong loading the assessment. Your progress has been saved.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#00d4c8',
              color: '#03030a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Retry
          </button>
          <a
            href="/dashboard/me"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#a1a1aa',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
