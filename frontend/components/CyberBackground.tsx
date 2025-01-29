"use client"

import { useEffect, useRef } from "react"

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Grid properties
    const gridSize = 30
    const dotSize = 1
    const lineWidth = 0.5

    // Animation properties
    let frame = 0
    const fps = 30
    const now = Date.now()

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set colors based on theme
      const isDark = document.documentElement.classList.contains("dark")
      const dotColor = isDark ? "rgba(147, 197, 253, 0.3)" : "rgba(59, 130, 246, 0.2)"
      const lineColor = isDark ? "rgba(147, 197, 253, 0.1)" : "rgba(59, 130, 246, 0.1)"

      // Draw grid lines
      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
      }

      ctx.stroke()

      // Draw dots at intersections
      ctx.fillStyle = dotColor
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const distanceFromCenter = Math.sqrt(Math.pow(canvas.width / 2 - x, 2) + Math.pow(canvas.height / 2 - y, 2))
          const pulseIntensity = Math.sin(frame / 30 + distanceFromCenter / 50) * 0.5 + 0.5

          ctx.beginPath()
          ctx.arc(x, y, dotSize * pulseIntensity, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw floating particles
      const numParticles = 50
      const time = (Date.now() - now) / 1000

      ctx.fillStyle = isDark ? "rgba(147, 197, 253, 0.2)" : "rgba(59, 130, 246, 0.15)"
      for (let i = 0; i < numParticles; i++) {
        const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width
        const y = (Math.cos(time * 0.5 + i) * 0.5 + 0.5) * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      frame++
      requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

