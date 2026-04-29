'use client'

import { useEffect, useRef, useState } from 'react'

interface CheckInScannerProps {
  eventId:          string
  initialCheckedIn: number
  totalRsvps:       number
}

type ScanResult =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'success'; name: string; partySize: number; alreadyCheckedIn: boolean }
  | { status: 'error'; message: string }

export function CheckInScanner({ eventId, initialCheckedIn, totalRsvps }: CheckInScannerProps) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const [result, setResult]           = useState<ScanResult>({ status: 'idle' })
  const [checkedIn, setCheckedIn]     = useState(initialCheckedIn)
  const [manualCode, setManualCode]   = useState('')
  const [cameraError, setCameraError] = useState(false)
  const [supportsBarcodeDetector, setSupportsBarcodeDetector] = useState(false)

  useEffect(() => {
    setSupportsBarcodeDetector('BarcodeDetector' in window)
  }, [cameraError, supportsBarcodeDetector])

  // Start camera on mount
  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // back camera on mobile
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setCameraError(true)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [cameraError, supportsBarcodeDetector])

  // QR scanning via BarcodeDetector API (Chrome/Android)
  // Falls back to manual entry on unsupported browsers (Safari)
  useEffect(() => {
    if (cameraError) return
    if (!supportsBarcodeDetector) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
    let active = true

    async function scan() {
      if (!active || !videoRef.current || videoRef.current.readyState < 2) {
        if (active) requestAnimationFrame(scan)
        return
      }

      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          await processCode(code)
          // Pause scanning for 3 seconds after a successful read
          await new Promise(r => setTimeout(r, 3000))
        }
      } catch {
        // Detection errors are expected on some frames — continue
      }

      if (active) requestAnimationFrame(scan)
    }

    requestAnimationFrame(scan)
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraError])

  async function processCode(code: string) {
    setResult({ status: 'scanning' })

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: code, eventId }),
      })

      const json = await res.json()

      if (res.ok) {
        if (!json.alreadyCheckedIn) {
          setCheckedIn(c => c + 1)
        }
        setResult({
          status: 'success',
          name: json.firstName,
          partySize: json.partySize,
          alreadyCheckedIn: json.alreadyCheckedIn,
        })
      } else {
        setResult({ status: 'error', message: json.error ?? 'Invalid code' })
      }
    } catch {
      setResult({ status: 'error', message: 'Network error — try again' })
    }

    // Reset to idle after 4 seconds
    setTimeout(() => setResult({ status: 'idle' }), 4000)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await processCode(manualCode.trim())
    setManualCode('')
  }

  return (
    <div className="w-full max-w-sm space-y-6">

      {/* Camera viewfinder */}
      {!cameraError ? (
        <div
          className="relative rounded-2xl overflow-hidden aspect-square"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-48 h-48 rounded-xl"
              style={{ border: '2px solid rgba(201,168,76,0.6)' }}
            />
          </div>

          {/* BarcodeDetector not supported notice */}
          {!supportsBarcodeDetector && (
            <div
              className="absolute bottom-0 left-0 right-0 p-3 text-center text-xs"
              style={{ background: 'rgba(0,0,0,0.8)', color: 'rgba(255,255,255,0.5)' }}
            >
              Auto-scan not supported — use manual entry below
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl aspect-square flex items-center justify-center"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}
        >
          <div className="text-center space-y-2 px-6">
            <p className="text-white/30 text-sm">Camera unavailable</p>
            <p className="text-white/20 text-xs">Use manual code entry below</p>
          </div>
        </div>
      )}

      {/* Scan result */}
      {result.status === 'success' && (
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: result.alreadyCheckedIn
              ? 'rgba(245,158,11,0.08)'
              : 'rgba(34,197,94,0.08)',
            border: `1px solid ${result.alreadyCheckedIn ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
          }}
        >
          <p className="text-2xl mb-1">{result.alreadyCheckedIn ? '⚠' : '✓'}</p>
          <p className="font-semibold text-white">{result.name}</p>
          <p className="text-sm mt-1"
            style={{ color: result.alreadyCheckedIn ? '#f59e0b' : '#22c55e' }}>
            {result.alreadyCheckedIn
              ? 'Already checked in'
              : `Checked in · Party of ${result.partySize}`}
          </p>
        </div>
      )}

      {result.status === 'error' && (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)' }}
        >
          <p className="text-2xl mb-1">✗</p>
          <p className="text-sm text-red-400">{result.message}</p>
        </div>
      )}

      {result.status === 'scanning' && (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm text-white/40">Checking...</p>
        </div>
      )}

      {/* Manual code entry — always visible as fallback */}
      <form onSubmit={handleManualSubmit} className="space-y-2">
        <label className="text-xs text-white/30">Enter code manually</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="Paste confirmation code"
            className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none font-mono"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'oklch(0.78 0.15 85 / 0.1)',
              border: '1px solid oklch(0.78 0.15 85 / 0.3)',
              color: '#c9a84c',
            }}
          >
            Check
          </button>
        </div>
      </form>

      {/* Live count */}
      <div className="text-center">
        <p className="text-xs text-white/20">
          {checkedIn} of {totalRsvps} checked in this session
        </p>
      </div>

    </div>
  )
}