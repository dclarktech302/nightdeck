'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { markPinSetupSeen } from '@/app/dashboard/actions'

const DISMISS_KEY = 'nightdeck_welcome_dismissed'

export function WelcomeBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      ;(supabase as any)
        .from('user_profiles')
        .select('has_set_pin')
        .eq('user_id', user.id)
        .single()
        .then(({ data }: any) => {
          if (data && data.has_set_pin === false) setShow(true)
        })
    })
  }, [])

  async function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
    await markPinSetupSeen()
  }

  if (!show) return null

  return (
    <div
      className="rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4"
      style={{
        background: 'oklch(0.78 0.15 85 / 0.06)',
        border: '1px solid oklch(0.78 0.15 85 / 0.2)',
      }}
    >
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Welcome to Nightdeck.{' '}
        <Link
          href="/dashboard/settings"
          className="underline underline-offset-2 transition-colors"
          style={{ color: '#c9a84c' }}
        >
          Go to Settings
        </Link>{' '}
        to set up your login PIN.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="text-xl leading-none shrink-0 transition-colors hover:text-white/60"
        style={{ color: 'rgba(255,255,255,0.25)' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
