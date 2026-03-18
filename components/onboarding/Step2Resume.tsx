'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud, FileText, Check, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step2Props {
  userId:   string
  onNext:   (resumeUrl: string | null) => void
  onBack:   () => void
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

export default function Step2Resume({ userId, onNext, onBack }: Step2Props) {
  const [file, setFile]       = useState<File | null>(null)
  const [state, setState]     = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError]     = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = useCallback((incoming: File) => {
    if (incoming.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (incoming.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.')
      return
    }
    setFile(incoming)
    setError(null)
    setState('idle')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const uploadResume = async () => {
    if (!file || !supabase) return
    setState('uploading')
    setProgress(0)

    const path = `${userId}/${Date.now()}-resume.pdf`

    // Simulate progress increments
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 20, 85))
    }, 200)

    const { data, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(path, file, { upsert: true, contentType: 'application/pdf' })

    clearInterval(progressInterval)

    if (uploadError) {
      setState('error')
      setError(uploadError.message)
      return
    }

    setProgress(100)
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(data.path)
    setUploadedUrl(publicUrl)
    setState('success')
  }

  const reset = () => {
    setFile(null)
    setState('idle')
    setProgress(0)
    setError(null)
    setUploadedUrl(null)
  }

  const isSuccess = state === 'success'

  return (
    <div className="space-y-6">

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setState('dragging') }}
        onDragLeave={() => setState('idle')}
        onDrop={handleDrop}
        onClick={() => !isSuccess && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300',
          state === 'dragging'  && 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5',
          isSuccess             && 'border-emerald-400/50 bg-emerald-400/5 cursor-default',
          state === 'error'     && 'border-rose-400/50 bg-rose-400/5',
          state === 'idle' && !file && 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]',
          state === 'idle' && file  && 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/5',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const picked = e.target.files?.[0]
            if (picked) handleFile(picked)
          }}
        />

        {/* Icon */}
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
          isSuccess             ? 'bg-emerald-400/20' : '',
          state === 'error'     ? 'bg-rose-400/20'    : '',
          !isSuccess && state !== 'error' ? 'bg-white/5' : '',
        )}>
          {isSuccess    ? <Check      size={26} className="text-emerald-400" /> :
           state === 'error' ? <X    size={26} className="text-rose-400"    /> :
           file          ? <FileText  size={26} className="text-[var(--accent-primary)]" /> :
                           <UploadCloud size={26} className="text-white/30" />
          }
        </div>

        {/* Text */}
        <div className="text-center">
          {isSuccess ? (
            <>
              <p className="font-semibold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
                Resume Uploaded!
              </p>
              <p className="text-xs text-white/40 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                {file?.name}
              </p>
            </>
          ) : file ? (
            <>
              <p className="font-semibold text-white/80" style={{ fontFamily: 'var(--font-display)' }}>
                {file.name}
              </p>
              <p className="text-xs text-white/35 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB — Click to change
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-white/60" style={{ fontFamily: 'var(--font-display)' }}>
                Drop your resume here
              </p>
              <p className="text-xs text-white/25 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                PDF only · max 5 MB
              </p>
            </>
          )}
        </div>

        {/* Upload progress bar */}
        {state === 'uploading' && (
          <div className="w-full max-w-xs">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-white/30 mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-3">
          <AlertCircle size={14} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{error}</span>
        </div>
      )}

      {/* Skip note */}
      <p className="text-xs text-center text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
        Resume is optional — you can add it later from your dashboard.
      </p>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost flex-1 justify-center"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {!isSuccess && file && (
          <button
            type="button"
            onClick={uploadResume}
            disabled={state === 'uploading'}
            className="btn-primary flex-[2] justify-center"
          >
            {state === 'uploading' ? 'Uploading...' : 'Upload Resume'}
          </button>
        )}

        {(isSuccess || !file) && (
          <button
            type="button"
            onClick={() => onNext(uploadedUrl)}
            className="btn-primary flex-[2] justify-center"
          >
            {isSuccess ? 'Continue' : 'Skip for Now'}
            <ChevronRight size={16} />
          </button>
        )}

        {isSuccess && (
          <button type="button" onClick={reset} className="btn-ghost px-3">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
