'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',          label: 'Overview',  icon: '◈' },
  { href: '/dashboard/events',   label: 'Events',    icon: '◉' },
  { href: '/dashboard/artists',  label: 'Artists',   icon: '◎' },
  { href: '/dashboard/venues',   label: 'Venues',    icon: '◌' },
  { href: '/dashboard/settings', label: 'Settings',  icon: '◦' },
]

interface DashboardSidebarProps {
  greeting?: string
}

export function DashboardSidebar({ greeting }: DashboardSidebarProps) {
  const pathname      = usePathname()
  const router        = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Close sidebar on route change on mobile
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile header bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 border-b"
        style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-tight">Ongho</span>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#c9a84c' }}>Ops</span>
        </Link>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex flex-col gap-1.5 p-2"
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

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible. Mobile: slide in from left */}
      <aside
        className={`
          fixed md:sticky md:top-0
          top-0 left-0 h-full md:h-screen
          z-50 md:z-auto
          w-64 md:w-56
          flex flex-col
          border-r
          shrink-0
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: '#0a0a0a',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo — desktop only (mobile has its own header) */}
        <div
          className="hidden md:flex h-16 items-center px-5 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">Ongho</span>
            <span className="text-sm font-bold tracking-tight" style={{ color: '#c9a84c' }}>Ops</span>
          </Link>
        </div>

        {/* Mobile sidebar top padding to clear the header */}
        <div className="md:hidden h-16 shrink-0" />

        {/* Greeting */}
        {greeting && (
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-white/30">
              Hey, <span className="text-white/60">{greeting}</span>
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                style={{
                  background: isActive ? 'oklch(0.78 0.15 85 / 0.08)' : 'transparent',
                  color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.4)',
                  border: isActive ? '1px solid oklch(0.78 0.15 85 / 0.2)' : '1px solid transparent',
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out — mobile only (desktop uses DashboardHeader) */}
        <div className="md:hidden px-3 pb-1">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Sign out
          </button>
        </div>

        {/* Shore Pulse preview link */}
        <div
          className="p-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.06)',
              border: '1px solid oklch(0.78 0.15 85 / 0.15)',
              color: '#c9a84c',
            }}
          >
            <span className="text-base leading-none">◇</span>
            <span className="flex-1">Shore Pulse</span>
            <span className="text-xs opacity-50">↗</span>
          </a>
        </div>
      </aside>
    </>
  )
}