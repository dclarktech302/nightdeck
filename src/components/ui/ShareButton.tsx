'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title:       string
  text:        string
  url:         string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Use native share sheet on mobile
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        // User cancelled — not an error
      }
      return
    }

    // Desktop fallback — copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available — do nothing
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border:     '1px solid rgba(255,255,255,0.08)',
        color:      'rgba(255,255,255,0.4)',
      }}
    >
      {copied ? (
        <>
          <span style={{ color: '#22c55e' }}>✓</span>
          <span style={{ color: '#22c55e' }}>Link copied</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share this event
        </>
      )}
    </button>
  )
}