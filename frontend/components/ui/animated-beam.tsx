"use client"

import { motion } from "framer-motion"
import { RefObject, useEffect, useId, useState } from "react"
import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
  disabled?: boolean
}

export const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "#7c3aed",
  pathWidth = 2,
  pathOpacity = 0.5,
  gradientStartColor = "#7c3aed",
  gradientStopColor = "#9333ea",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  disabled = false,
}: AnimatedBeamProps) => {
  const id = useId()
  const [path, setPath] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

  // Check if developer tools are open - using a more efficient method
  useEffect(() => {
    // Only check once on component mount
    const checkDevTools = () => {
      // Use window dimensions to detect dev tools
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      }
    };
    
    checkDevTools();
    
    // Listen for resize events which might indicate dev tools opening
    const handleResize = () => {
      checkDevTools();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Skip heavy calculations if disabled or dev tools are open
    if (disabled || isDevToolsOpen) return;
    
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const svgWidth = containerRect.width
      const svgHeight = containerRect.height
      setSvgDimensions({ width: svgWidth, height: svgHeight })

      const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset
      const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset
      const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset
      const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset

      const controlX = (startX + endX) / 2
      const controlY = Math.min(startY, endY) - curvature

      const d = `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`
      setPath(d)
    }

    // Initial update
    updatePath()
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePath, 100);
    };
    
    window.addEventListener("resize", handleResize)

    // Use ResizeObserver with throttling
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePath, 100);
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
      clearTimeout(resizeTimeout);
    }
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset, disabled, isDevToolsOpen])

  // If disabled or dev tools are open, render a simplified version
  if (disabled || isDevToolsOpen) {
    return null;
  }

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 10,
      }}
      className={cn("absolute", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient
          id={`beam-gradient-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#glow-${id})`}>
        <motion.path
          d={path}
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeOpacity={pathOpacity}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: duration, ease: "easeInOut", repeat: Infinity },
            opacity: { duration: 0.5 },
          }}
        />
        <motion.path
          d={path}
          stroke={`url(#beam-gradient-${id})`}
          strokeWidth={pathWidth}
          strokeOpacity={pathOpacity * 1.5}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: duration, ease: "easeInOut", repeat: Infinity, delay: 0.1 },
            opacity: { duration: 0.5 },
          }}
        />
      </g>
    </svg>
  )
}
