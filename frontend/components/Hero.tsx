"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Scan, FileSearch, Database, Clock } from "lucide-react"
import { useRef } from "react"

export function Hero() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 50])

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden bg-gradient-to-br from-background via-blue-950/10 to-background" ref={targetRef}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <AnimatePresence>
        <motion.div 
          className="container mx-auto px-8 relative z-10"
          style={{ opacity, scale, y }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Content */}
            <div className="max-w-xl space-y-8">
              {/* Stats Row */}
              <motion.div 
                className="flex gap-8 pl-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Real-time Scanning</span>
                </div>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1.2, bounce: 0.4 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl inline-block ml-1 shadow-xl shadow-blue-500/20"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 leading-tight pl-1"
              >
                Advanced Malware
                <br />
                & Vulnerability Scanner
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-base text-gray-400 pl-1"
              >
                Our advanced malware scanner helps detect threats and manage vulnerabilities in real-time.
              </motion.p>

              {/* Search Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative flex items-center group">
                  <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter URL, IP, domain, file hash..."
                    className="pl-12 pr-32 h-12 text-base bg-white/5 border-2 border-gray-400/30 dark:border-gray-500/30 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-xl"
                  />
                  <div className="absolute right-2">
                    <Button
                      size="default"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg hover:shadow-purple-500/25"
                    >
                      Scan Now
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-sm text-gray-500 pl-1"
              >
                • Free to use • No login required
              </motion.div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative h-[500px] mt-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="absolute top-20 right-0 bg-white dark:bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 w-64"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/10 shadow-inner">
                    <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">URL Scanner</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Real-time threat detection</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="absolute top-60 left-0 bg-white dark:bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 w-64"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 shadow-inner">
                    <FileSearch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">File Scanner</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Deep malware analysis</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="absolute top-96 right-0 bg-white dark:bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 w-64"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-100 dark:bg-green-500/10 shadow-inner">
                    <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">CVE Lookup</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vulnerability tracking</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
