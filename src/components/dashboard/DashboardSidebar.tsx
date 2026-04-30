'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard',          label: 'Overview',  icon: '◈' },
  { href: '/dashboard/events',   label: 'Events',    icon: '◉' },
  { href: '/dashboard/artists',  label: 'Artists',   icon: '◎' },
  { href: '/dashboard/venues',   label: 'Venues',    icon: '◌' },
  { href: '/dashboard/settings', label: 'Settings',  icon: '◦' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col border-r min-h-screen"
      style={{
        background: '#0a0a0a',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-tight">
            Ongho
          </span>
          <span className="text-sm font-bold tracking-tight"
            style={{ color: '#c9a84c' }}>
            Ops
          </span>
        </div>
      </div>

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
  )
}