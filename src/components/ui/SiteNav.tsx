'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SiteNav() {
  const [scrolled, setScrolled]   = useState(false)
  const [authed, setAuthed]       = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
    })
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-bold tracking-tight text-white">Shore</span>
          <span className="text-lg font-bold tracking-tight transition-all duration-200"
            style={{ color: '#c9a84c' }}>Pulse</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link href="/events"
            className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            Events
          </Link>
          <Link href="/artists"
            className="text-sm text-white/50 hover:text-white transition-colors duration-200">
            Artists
          </Link>

          {/* Dashboard link — only shown when logged in */}
          {authed && (
            <Link
              href="/dashboard"
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                background: 'oklch(0.78 0.15 85 / 0.1)',
                border: '1px solid oklch(0.78 0.15 85 / 0.3)',
                color: '#c9a84c',
              }}
            >
              Ops ↗
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}