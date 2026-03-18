'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { LogOut, User as UserIcon, LayoutDashboard, Zap } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Zap size={16} className="text-[#03030a]" strokeWidth={2.5} />
          </div>
          <span
            className="font-display font-800 text-lg tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Skill<span className="gradient-text">Passport</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard/me"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
              <Link href="/dashboard/me" className="flex items-center gap-2 glass-sm px-3 py-1.5 rounded-xl hover:border-[var(--accent-primary)] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/30 to-[var(--accent-secondary)]/30 flex items-center justify-center">
                  <UserIcon size={14} className="text-[var(--accent-primary)]" />
                </div>
                <span className="text-sm font-medium text-white/80" style={{ fontFamily: 'var(--font-display)' }}>
                  {user.user_metadata?.user_name ?? user.email?.split('@')[0]}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="#features"
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                How It Works
              </Link>
              <button
                onClick={() => router.push('/?auth=signin')}
                className="btn-primary text-sm py-2 px-5"
              >
                Get Your Passport
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
