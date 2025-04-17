"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Scan, FileSearch, Database, Clock } from "lucide-react"
import { useRef, useState, useEffect } from "react"

const products = [
  "URL Scanner",
  "File Scanner",
  "CVE Database",
  "Malware Detection",
  "Threat Analysis"
]

export function Hero() {
  const targetRef = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 50])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const targetText = products[currentIndex];
    
    if (isTyping && displayText !== targetText) {
      timeoutId = setTimeout(() => {
        // Calculate how many characters to add (1-3 randomly)
        const charsToAdd = Math.min(
          Math.floor(Math.random() * 3) + 1,
          targetText.length - displayText.length
        );
        setDisplayText(targetText.slice(0, displayText.length + charsToAdd));
      }, Math.random() * 30 + 20); // Random delay between 20-50ms
    } else if (isTyping && displayText === targetText) {
      timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 2000); // Pause at the end
    } else {
      timeoutId = setTimeout(() => {
        setDisplayText("");
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setIsTyping(true);
      }, 200);
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, currentIndex, isTyping]);

  return (
    <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center py-8 sm:py-16 md:py-20 overflow-hidden" ref={targetRef}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/20" />

      <AnimatePresence>
        <motion.div 
          className="container mx-auto px-4 sm:px-8 relative z-10"
          style={{ opacity, scale, y }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 items-start">
            {/* Left Column - Content */}
            <div className="w-full max-w-xl space-y-4 sm:space-y-6 md:space-y-8 mx-auto md:mx-0 px-0">
              {/* Stats Row */}
              <motion.div 
                className="flex gap-3 sm:gap-4 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border shadow-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Real-time Scanning</span>
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
              <div className="pl-1">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
                    Advanced
                  </span>
                  <br />
                  <div className="h-[1.5em] flex items-center">
                    <div className="relative">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
                        {displayText}
                      </span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="inline-block ml-0.5 w-[3px] h-[1em] bg-purple-500 align-middle"
                      />
                    </div>
                  </div>
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-muted-foreground text-base sm:text-lg"
              >
                Our advanced security tools help detect threats and manage vulnerabilities in real-time.
              </motion.p>

              {/* Search Form - Temporarily hidden until functionality is implemented */}
              {/* 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative flex items-center group">
                  <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter URL, IP, domain, file hash..."
                    className="pl-12 pr-32 h-12 text-base bg-background/50 backdrop-blur-sm border border-border text-foreground placeholder:text-muted-foreground rounded-2xl hover:bg-background/60 hover:border-accent transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-lg"
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
              */}

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-sm text-muted-foreground pl-1"
              >
                • Free to use • No login required
              </motion.div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[500px] overflow-hidden rounded-xl sm:rounded-3xl border border-border/40 shadow-2xl shadow-blue-500/5 mt-6 md:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-background/50 backdrop-blur-lg rounded-2xl p-4 border border-border shadow-lg hover:shadow-blue-500/10 transition-all duration-300 w-full md:w-64 md:absolute md:top-20 md:right-0 mb-4 md:mb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 shadow-inner">
                    <Scan className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">URL Scanner</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Real-time threat detection</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-background/50 backdrop-blur-lg rounded-2xl p-4 border border-border shadow-lg hover:shadow-purple-500/10 transition-all duration-300 w-full md:w-64 md:absolute md:top-60 md:left-0 mb-4 md:mb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 shadow-inner">
                    <FileSearch className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">File Scanner</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Malware detection</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-background/50 backdrop-blur-lg rounded-2xl p-4 border border-border shadow-lg hover:shadow-green-500/10 transition-all duration-300 w-full md:w-64 md:absolute md:top-96 md:right-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10 shadow-inner">
                    <Database className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">CVE Database</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Vulnerability insights</p>
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
