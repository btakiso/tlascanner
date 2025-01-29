"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield } from "lucide-react"

export function Hero() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))] gap-px opacity-[0.03]">
        {Array.from({ length: 800 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-200" />
        ))}
      </div>

      {/* Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl inline-block"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-purple-600"
          >
            Secure Your Digital Frontier
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Advanced threat detection and vulnerability analysis at your fingertips.
          </motion.p>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative max-w-3xl mx-auto"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter URL, IP, domain, file hash..."
                className="pl-12 pr-32 h-14 text-lg bg-gray-950/50 border-gray-800 text-gray-100 placeholder:text-gray-500 rounded-2xl"
              />
              <div className="absolute right-2">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r transition-all duration-300 rounded-xl
                    ${
                      isHovered
                        ? "from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25"
                        : "from-blue-600 to-purple-700"
                    }
                  `}
                >
                  Scan
                </Button>
              </div>
            </div>

            {/* Animated Border */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 -z-10 blur"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 flex justify-center gap-8 text-sm text-gray-400"
          >
          </motion.div>
        </div>
      </div>
    </section>
  )
}

