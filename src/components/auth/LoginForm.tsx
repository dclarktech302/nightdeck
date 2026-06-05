'use client'

import { useState } from 'react'
import { PINLogin } from './PINLogin'
import { PasswordLogin } from './PasswordLogin'

interface Props {
  defaultOpen?: boolean
}

export function LoginForm({ defaultOpen = false }: Props) {
  const [showPasswordForm, setShowPasswordForm] = useState(defaultOpen)

  if (showPasswordForm) {
    return <PasswordLogin onBack={() => setShowPasswordForm(false)} />
  }

  return (
    <div className="space-y-4">
      <PINLogin />
      <button
        type="button"
        onClick={() => setShowPasswordForm(true)}
        className="w-full text-xs text-center py-1 transition-colors"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        Forgot PIN? Sign in with password
      </button>
    </div>
  )
}
