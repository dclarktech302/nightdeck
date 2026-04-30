'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [authed, setAuthed]     = useState(false)
  const [open, setOpen]         = useState(false)

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

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || open ? 'rgba(0,0,0,0.95)' : 'transparent',
          backdropFilter: scrolled || open ? 'blur(16px)' : 'none',
          borderBottom: scrolled || open ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="text-lg font-bold tracking-tight text-white">Shore</span>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#c9a84c' }}>
              Pulse
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/events"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200">
              Events
            </Link>
            <Link href="/artists"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200">
              Artists
            </Link>
            <Link href="/venues"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200">
              Venues
            </Link>
            {!authed && (
              <a href="/login"
                className="text-xs text-white/20 hover:text-white/40 transition-colors">
                Admin
              </a>
            )}
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: 'rgba(255,255,255,0.6)',
                transform: open ? 'translateY(5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.6)',
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: 'rgba(255,255,255,0.6)',
                transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>

        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Link href="/events"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-white/60 hover:text-white transition-colors border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              Events
            </Link>
            <Link href="/artists"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-white/60 hover:text-white transition-colors border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              Artists
            </Link>
            <Link href="/venues"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-white/60 hover:text-white transition-colors border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              Venues
            </Link>
            {!authed && (
              <a href="/login"
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-white/30 hover:text-white/50 transition-colors">
                Admin
              </a>
            )}
            {authed && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 py-2.5 text-sm font-medium text-center rounded-lg transition-all duration-200"
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
        )}
      </nav>
    </>
  )
}