"use client"

import { useEffect, useRef } from "react"

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let raf = 0
    const DPR = Math.min(2, window.devicePixelRatio || 1)
    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: Math.random() * 1.2 + 0.4,
    }))

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const tick = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)
      // glow
      ctx.fillStyle = "rgba(0, 128, 255, 0.055)"
      ctx.fillRect(0, 0, W, H)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1

        const x = p.x * (W / DPR)
        const y = p.y * (H / DPR)

        // particle
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 14)
        grd.addColorStop(0, "rgba(0,255,255,0.35)")
        grd.addColorStop(1, "rgba(0,255,255,0)")
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(x, y, 14, 0, Math.PI * 2)
        ctx.fill()
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
}
