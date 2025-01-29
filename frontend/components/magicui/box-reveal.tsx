"use client"

import type * as React from "react"
import { motion } from "framer-motion"

interface BoxRevealProps {
  children: React.ReactNode
  boxColor?: string
  duration?: number
}

export const BoxReveal = ({ children, boxColor = "#5046e6", duration = 0.5 }: BoxRevealProps) => {
  return (
    <div className="relative">
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: 0 }}
        transition={{ duration, delay: 0.2, ease: "easeInOut" }}
        style={{ backgroundColor: boxColor }}
        className="absolute inset-0 z-10"
      />
      {children}
    </div>
  )
}

