"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface DetectionStats {
  malicious: number
  suspicious: number
  harmless: number
  undetected: number
  total: number
}

interface AnimatedDonutProps {
  stats: DetectionStats
  size?: number
  strokeWidth?: number
  className?: string
}

export function AnimatedDonut({
  stats,
  size = 200,
  strokeWidth = 20,
  className,
}: AnimatedDonutProps) {
  const [isVisible, setIsVisible] = useState(false)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getSegmentColor = (type: keyof DetectionStats) => {
    switch (type) {
      case "malicious":
        return "rgb(239 68 68)" // red-500
      case "suspicious":
        return "rgb(245 158 11)" // amber-500
      case "harmless":
        return "rgb(34 197 94)" // green-500
      case "undetected":
        return "rgb(156 163 175)" // gray-400
      default:
        return "rgb(209 213 219)" // gray-300
    }
  }

  const segments = [
    { type: "malicious", value: stats.malicious },
    { type: "suspicious", value: stats.suspicious },
    { type: "harmless", value: stats.harmless },
    { type: "undetected", value: stats.undetected },
  ]

  let currentAngle = 0
  const totalValue = stats.total || 1 // Prevent division by zero

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map(({ type, value }, index) => {
          const percentage = (value / totalValue) * 100
          const strokeDasharray = (percentage / 100) * circumference
          const strokeDashoffset = circumference - strokeDasharray
          const rotation = currentAngle
          currentAngle += (percentage / 100) * 360

          return (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getSegmentColor(type as keyof DetectionStats)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                      strokeDashoffset: isVisible ? strokeDashoffset : circumference,
                      rotate: rotation,
                    }}
                    transition={{
                      duration: 1,
                      delay: index * 0.2,
                      ease: "easeInOut",
                    }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                      transformOrigin: "center",
                      cursor: "pointer",
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <span className="font-medium capitalize">{type}:</span>{" "}
                    {value} ({percentage.toFixed(1)}%)
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {stats.malicious + stats.suspicious}
          </div>
          <div className="text-sm text-muted-foreground">
            Threats Found
          </div>
        </div>
      </div>
    </div>
  )
}
