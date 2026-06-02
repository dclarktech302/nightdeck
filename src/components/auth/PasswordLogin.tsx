'use client'

import { useState } from 'react'
import { loginWithPassword } from '@/app/login/actions'

export function PasswordLogin({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-xs text-center py-1 transition-colors"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        Forgot PIN? Sign in with password
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-xs text-white/20">sign in with password</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <form action={loginWithPassword} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Sign in
        </button>
      </form>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="w-full text-xs text-center py-1 transition-colors"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        ← Back to PIN login
      </button>
    </div>
  )
}
