'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  gold: boolean
}

interface ParticleFieldProps {
  density?: number
}

export function ParticleField({ density = 60 }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    let particles: Particle[] = []

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function initParticles() {
      particles = Array.from({ length: density }, () => ({
        x:       Math.random() * canvas!.width,
        y:       Math.random() * canvas!.height,
        vx:      (Math.random() - 0.5) * 0.3,
        vy:      (Math.random() - 0.5) * 0.3,
        radius:  Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.4 + 0.05,
        // ~25% of particles are gold — the rest are white/dim
        gold:    Math.random() > 0.75,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = canvas!.width
        if (p.x > canvas!.width) p.x = 0
        if (p.y < 0) p.y = canvas!.height
        if (p.y > canvas!.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(201, 168, 76, ${p.opacity})`   // --gold
          : `rgba(245, 245, 245, ${p.opacity * 0.4})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    window.addEventListener('resize', () => { resize(); initParticles() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => { resize(); initParticles() })
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}