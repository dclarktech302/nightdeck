'use client'

import { useState } from 'react'

interface RSVPFormProps {
  eventId: string
  eventName: string
}

type FormState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export function RSVPForm({ eventId, eventName }: RSVPFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [partySize, setPartySize] = useState(1)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')

    const form = e.currentTarget
    const data = {
      eventId,
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
      email:     (form.elements.namedItem('email') as HTMLInputElement).value,
      phone:     (form.elements.namedItem('phone') as HTMLInputElement).value,
      partySize,
      // Capture UTM source from URL for attribution tracking
      source:    new URLSearchParams(window.location.search).get('utm_source') ?? 'direct',
    }

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (res.status === 409) {
        setState('duplicate')
      } else if (res.ok) {
        setState('success')
      } else {
        console.error('RSVP error:', json)
        setState('error')
      }
    } catch (err) {
      console.error('RSVP fetch error:', err)
      setState('error')
    }
  }

  // -- SUCCESS STATE --
  if (state === 'success') {
    return (
      <div className="rounded-xl p-6 text-center space-y-3"
        style={{
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid oklch(0.78 0.15 85 / 0.3)',
          boxShadow: '0 0 30px oklch(0.78 0.15 85 / 0.08)',
        }}>
        <div className="text-3xl">✓</div>
        <p className="font-semibold text-white">You&apos;re on the list.</p>
        <p className="text-sm text-white/40">
          Check your email for your confirmation and QR code.
        </p>
      </div>
    )
  }

  // -- DUPLICATE STATE --
  if (state === 'duplicate') {
    return (
      <div className="rounded-xl p-6 text-center space-y-3"
        style={{
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        <p className="font-semibold text-white">Already registered.</p>
        <p className="text-sm text-white/40">
          Check your email for your original confirmation.
        </p>
      </div>
    )
  }

  // -- FORM STATE --
  return (
    <div className="rounded-xl p-6 space-y-5"
      style={{
        background: 'rgba(10,10,10,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>

      <div>
        <p className="text-xs tracking-[0.3em] uppercase font-semibold mb-1"
          style={{ color: '#c9a84c' }}>
          Save your spot
        </p>
        <p className="text-sm text-white/40">Free · No account needed</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* First name */}
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-xs font-medium text-white/60">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'oklch(0.78 0.15 85 / 0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-white/60">
            Email <span style={{ color: '#c9a84c' }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'oklch(0.78 0.15 85 / 0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Phone — optional */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-medium text-white/60">
            Phone <span className="text-white/20">(optional · same-day updates)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'oklch(0.78 0.15 85 / 0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Party size */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">
            Party size
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPartySize(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              -
            </button>
            <span className="text-white font-semibold w-4 text-center">{partySize}</span>
            <button
              type="button"
              onClick={() => setPartySize(p => Math.min(10, p + 1))}
              className="w-8 h-8 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          style={{
            background: 'oklch(0.78 0.15 85 / 0.15)',
            border: '1px solid oklch(0.78 0.15 85 / 0.4)',
            color: '#c9a84c',
            boxShadow: '0 0 20px oklch(0.78 0.15 85 / 0.1)',
          }}
        >
          {state === 'loading' ? 'Saving your spot...' : 'Save my spot'}
        </button>

        {/* Error state inline */}
        {state === 'error' && (
          <p className="text-xs text-center text-red-400/70">
            Something went wrong. Try again.
          </p>
        )}

        <p className="text-[10px] text-white/20 text-center">
          You&apos;ll receive a confirmation with your QR code.
        </p>

      </form>
    </div>
  )
}