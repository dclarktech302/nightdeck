'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function SavedBanner() {
  const searchParams          = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') !== 'true') return

    window.history.replaceState({}, '', window.location.pathname)

    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 2000)  // Changed to 2 seconds
    return () => clearTimeout(timer)

  }, [searchParams])

  if (!visible) return null

  return (
    <div
      className="fixed z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in duration-200"
      style={{
        top: '76px',
        right: '24px',
        background: 'rgba(10,10,10,0.95)',
        border: '1px solid rgba(34,197,94,0.4)',
        color: '#22c55e',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 20px rgba(34,197,94,0.1)',
      }}
    >
      <span>✓</span>
      <span>Changes saved</span>
    </div>
  )
}