'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  url: string
}

export function AttendQRCode({ url }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div
        className="p-4 rounded-xl shrink-0"
        style={{ background: '#ffffff' }}
      >
        <QRCodeSVG value={url} size={160} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Community check-in QR</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Display at the venue entrance. Guests scan to complete a quick 4-question survey — no app or login needed.
        </p>
        <p
          className="text-xs font-mono break-all mt-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          {url}
        </p>
      </div>
    </div>
  )
}
