'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SessionContext } from '@/types'

interface DashboardHeaderProps {
  session: SessionContext
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="hidden md:flex h-16 items-center justify-between px-6 shrink-0 border-b"
      style={{
        background: '#0a0a0a',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Left — page context (children can override via portal later) */}
      <div />

      {/* Right — user controls */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-white/20">
          {session.role}
        </span>
        <button
          onClick={handleSignOut}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}