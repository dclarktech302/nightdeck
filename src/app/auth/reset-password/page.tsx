'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { markPinSetupSeen } from '@/app/dashboard/actions'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready,   setReady]   = useState(false)
  const [pin,     setPin]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [state,   setState]   = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setReady(true)
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (!/^\d+$/.test(pin)) {
      setMessage('PIN must contain only numbers')
      setState('error')
      return
    }
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

    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pin })

    if (error) {
      setMessage(error.message)
      setState('error')
      return
    }

    await markPinSetupSeen()
    router.push('/dashboard')
  }

  if (!ready) return null

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#000000' }}
    >
      <div className="w-full max-w-sm space-y-6 p-8">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ongho <span style={{ color: '#c9a84c' }}>Ops</span>
          </h1>
          <p className="text-sm text-white/30">Set a new PIN</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              required
              placeholder="4–8 digits"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none tracking-widest"
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
              required
              placeholder="Repeat PIN"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none tracking-widest"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
              color: '#c9a84c',
            }}
          >
            {state === 'loading' ? 'Saving…' : 'Set PIN'}
          </button>

          {message && (
            <p className="text-xs text-center" style={{ color: '#f43f5e' }}>{message}</p>
          )}
        </form>

      </div>
    </div>
  )
}
