'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function PINLogin() {
  const [email, setEmail] = useState('')
  const [pin, setPin]     = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePINLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pin,
    })

    if (error) {
      setError('Incorrect email or PIN')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handlePINLogin} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="Email"
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      <input
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
        required
        placeholder="PIN"
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none tracking-widest"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: 'oklch(0.78 0.15 85 / 0.1)',
          border: '1px solid oklch(0.78 0.15 85 / 0.3)',
          color: '#c9a84c',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with PIN'}
      </button>
      {error && (
        <p className="text-xs text-center" style={{ color: '#f43f5e' }}>{error}</p>
      )}
    </form>
  )
}