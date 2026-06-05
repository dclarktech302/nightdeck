'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { loginWithPassword } from '@/app/login/actions'

interface Props {
  onBack: () => void
}

export function PasswordLogin({ onBack }: Props) {
  const [email,      setEmail]      = useState('')
  const [resetSent,  setResetSent]  = useState(false)
  const [resetting,  setResetting]  = useState(false)
  const [resetError, setResetError] = useState('')

  async function handleReset() {
    if (!email) {
      setResetError('Enter your email above first.')
      return
    }
    setResetting(true)
    setResetError('')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email)
    // Always show confirmation — don't leak whether the email exists
    setResetSent(true)
    setResetting(false)
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
          value={email}
          onChange={e => setEmail(e.target.value)}
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

      {/* Forgot password */}
      <div className="text-center">
        {resetSent ? (
          <p className="text-xs" style={{ color: '#22c55e' }}>
            Check your email for a reset link.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="text-xs transition-colors disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {resetting ? 'Sending…' : 'Forgot password?'}
            </button>
            {resetError && (
              <p className="text-xs mt-1" style={{ color: '#f43f5e' }}>{resetError}</p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-center py-1 transition-colors"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        ← Back to PIN login
      </button>
    </div>
  )
}
