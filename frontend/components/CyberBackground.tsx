"use client"

import { useEffect, useRef, useState } from "react"
import { 
  Shield, Lock, Fingerprint, Network, Bug,
  ShieldAlert, ShieldCheck, Binary, Radar, KeySquare,
  CircuitBoard
} from "lucide-react"

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)

  // Security icons configuration with movement parameters
  const securityIcons = [
    { id: 1, Icon: Shield, size: 24, color: "#60a5fa", x: 0.15, y: 0.2, dx: 30, dy: -20 },
    { id: 2, Icon: Lock, size: 22, color: "#34d399", x: 0.85, y: 0.3, dx: -25, dy: 15 },
    { id: 3, Icon: Fingerprint, size: 28, color: "#fbbf24", x: 0.25, y: 0.7, dx: 20, dy: -30 },
    { id: 4, Icon: Network, size: 26, color: "#818cf8", x: 0.7, y: 0.6, dx: -35, dy: 10 },
    { id: 5, Icon: Bug, size: 20, color: "#f472b6", x: 0.4, y: 0.4, dx: 15, dy: 25 },
    { id: 6, Icon: ShieldAlert, size: 22, color: "#c084fc", x: 0.5, y: 0.8, dx: -10, dy: -15 },
    { id: 7, Icon: ShieldCheck, size: 26, color: "#22d3ee", x: 0.35, y: 0.15, dx: 20, dy: 30 },
    { id: 8, Icon: Binary, size: 24, color: "#a78bfa", x: 0.75, y: 0.45, dx: -30, dy: -10 },
    { id: 9, Icon: Radar, size: 28, color: "#38bdf8", x: 0.15, y: 0.55, dx: 15, dy: -25 },
    { id: 10, Icon: KeySquare, size: 22, color: "#4ade80", x: 0.65, y: 0.75, dx: -20, dy: 15 },
    { id: 11, Icon: CircuitBoard, size: 26, color: "#f59e0b", x: 0.45, y: 0.35, dx: 25, dy: 20 }
  ]

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
    const fps = 60
    const now = Date.now()

    function drawGrid() {
      if (!canvas || !ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = (Date.now() - now) / 1000
      const pulse = Math.sin(time * 2) * 0.5 + 0.5

      // Set colors based on theme
      const isDark = document.documentElement.classList.contains("dark")
      const baseHue = isDark ? 210 : 220
      const dotColor = isDark 
        ? `hsla(${baseHue + Math.sin(time) * 10}, 80%, 70%, ${0.2 + pulse * 0.2})`
        : `hsla(${baseHue + Math.sin(time) * 10}, 80%, 50%, ${0.15 + pulse * 0.1})`
      const lineColor = isDark
        ? `hsla(${baseHue}, 70%, 60%, 0.08)`
        : `hsla(${baseHue}, 70%, 40%, 0.06)`

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      )
      gradient.addColorStop(0, isDark ? 'rgba(10, 10, 20, 0.2)' : 'rgba(255, 255, 255, 0.1)')
      gradient.addColorStop(1, isDark ? 'rgba(10, 10, 20, 0)' : 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines with wave effect
      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth

      // Vertical lines with wave
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        for (let y = 0; y < canvas.height; y += 5) {
          const wave = Math.sin(y / 50 + time * 2) * 5
          ctx.lineTo(x + wave, y)
        }
        ctx.stroke()
      }

      // Horizontal lines with wave
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin(x / 50 + time * 2) * 5
          ctx.lineTo(x, y + wave)
        }
        ctx.stroke()
      }

      // Draw animated dots at intersections
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const distanceFromCenter = Math.sqrt(
            Math.pow(canvas.width / 2 - x, 2) + 
            Math.pow(canvas.height / 2 - y, 2)
          )
          const sizePulse = Math.sin(time * 2 + distanceFromCenter / 50) * 0.5 + 0.5
          
          ctx.beginPath()
          ctx.fillStyle = dotColor
          ctx.arc(x, y, dotSize * (1 + sizePulse), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      frame++
      requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {securityIcons.map(({ id, Icon, size, color, x, y, dx, dy }) => (
        <div
          key={id}
          className="absolute animate-float cursor-pointer"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hoveredIcon === id 
              ? `translate(${dx}px, ${dy}px) translate(-50%, -50%)`
              : 'translate(-50%, -50%)',
            zIndex: hoveredIcon === id ? 10 : 0
          }}
          onMouseEnter={() => setHoveredIcon(id)}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <Icon
            className="opacity-20 transition-all duration-300 hover:opacity-60"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              color: color,
              transform: hoveredIcon === id ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
      ))}
    </div>
  )
}
