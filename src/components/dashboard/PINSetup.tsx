'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PINState = 'idle' | 'loading' | 'success' | 'error'

export function PINSetup() {
  const [pin, setPin]         = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState]     = useState<PINState>('idle')
  const [message, setMessage] = useState('')

  async function handleSetPIN(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) {
      setMessage('PIN must be at least 4 digits')
      setState('error')
      return
    }
    if (pin !== confirm) {
      setMessage('PINs do not match')
      setState('error')
      return
    }
    if (!/^\d+$/.test(pin)) {
      setMessage('PIN must contain only numbers')
      setState('error')
      return
    }

    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pin })

    if (error) {
      setMessage(error.message)
      setState('error')
    } else {
      setMessage('PIN set successfully. You can now log in with your PIN.')
      setState('success')
      setPin('')
      setConfirm('')
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: '#c9a84c' }}>Login PIN</p>
        <p className="text-xs text-white/30">
          Set a numeric PIN to log in without waiting for a magic link.
          Works in low-reception areas.
        </p>
      </div>

      <form onSubmit={handleSetPIN} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="4-8 digits"
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none tracking-widest"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirm}
              onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Repeat PIN"
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none tracking-widest"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: 'oklch(0.78 0.15 85 / 0.1)',
            border: '1px solid oklch(0.78 0.15 85 / 0.3)',
            color: '#c9a84c',
          }}
        >
          {state === 'loading' ? 'Saving...' : 'Set PIN'}
        </button>

        {message && (
          <p className="text-xs"
            style={{ color: state === 'success' ? '#22c55e' : '#f43f5e' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}