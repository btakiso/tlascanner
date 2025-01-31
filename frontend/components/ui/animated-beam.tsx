"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement>
  fromRef: React.RefObject<HTMLDivElement>
  toRef: React.RefObject<HTMLDivElement>
  curvature?: number
  endYOffset?: number
  reverse?: boolean
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  endYOffset = 0,
  reverse = false,
}) => {
  const pathRef = useRef<SVGPathElement>(null)
  const controls = useAnimation()
  const isInView = useInView(containerRef)

  useEffect(() => {
    if (isInView) {
      controls.start({
        pathLength: 1,
        transition: { duration: 1.5, ease: "easeInOut" },
      })
    } else {
      controls.start({ pathLength: 0 })
    }
  }, [isInView, controls])

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current || !pathRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const startX = fromRect.left + fromRect.width / 2 - containerRect.left
      const startY = fromRect.top + fromRect.height / 2 - containerRect.top
      const endX = toRect.left + toRect.width / 2 - containerRect.left
      const endY = toRect.top + toRect.height / 2 - containerRect.top + endYOffset

      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2 + curvature

      const path = `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`
      pathRef.current.setAttribute("d", path)
    }

    updatePath()
    window.addEventListener("resize", updatePath)
    return () => window.removeEventListener("resize", updatePath)
  }, [containerRef, fromRef, toRef, curvature, endYOffset])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <motion.path
        ref={pathRef}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={controls}
      />
      <defs>
        <linearGradient id="gradient" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={reverse ? "#8B5CF6" : "#3B82F6"} />
          <stop offset="100%" stopColor={reverse ? "#3B82F6" : "#8B5CF6"} />
        </linearGradient>
      </defs>
    </svg>
  )
}

