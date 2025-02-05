"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BoxReveal } from "@/components/ui/box-reveal"
import { Shield, FileWarning, FileKey, FileSearch } from "lucide-react"
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal"
import { WaveContainer } from "../ui/wave-container";

export function URLScanner() {
  const ref = useRef(null)
  const terminalRef = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  const [url, setUrl] = useState("https://example.com")
  const [isScanning, setIsScanning] = useState(false)
  const [demoStep, setDemoStep] = React.useState(0)

  // Auto-play demo animation when component is in view
  useEffect(() => {
    if (!isInView || demoStep === 10) return

    const startDemo = () => {
      setIsScanning(true)
      setDemoStep(0)

      const steps = [
        { step: 1, delay: 1000 },   // Show scanning URL
        { step: 2, delay: 2000 },   // Show DNS check
        { step: 3, delay: 3000 },   // Show init process
        { step: 4, delay: 4000 },   // Show SSL verify
        { step: 5, delay: 5000 },   // Show content analysis
        { step: 6, delay: 6000 },   // Show malware check
        { step: 7, delay: 7000 },   // Show generating report
        { step: 8, delay: 8000 },   // Show URL is safe
        { step: 9, delay: 9000 },   // Show final details
        { step: 10, delay: 10000 }, // Show completion message
      ]

      steps.forEach(({ step, delay }) => {
        setTimeout(() => {
          setDemoStep(step)
        }, delay)
      })
    }

    startDemo()
    return () => {
      setIsScanning(false)
      setDemoStep(0)
    }
  }, [isInView])

  const handleScan = () => {
    setDemoStep(0)
    setIsScanning(true)
    setTimeout(() => setDemoStep(1), 500)
  }

  return (
    <motion.div 
      id="url-scanner" 
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.section
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="py-12 relative overflow-hidden max-w-7xl mx-auto rounded-2xl"
          style={{ opacity: 1, scale: 1 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent dark:from-blue-500/30 dark:via-blue-400/20 dark:to-transparent rounded-2xl backdrop-blur-sm" />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${
                "rgba(14, 165, 233, 0.15)"
              } 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-2"
                >
                  <WaveContainer className="p-3" color="14,165,233">
                    <Link2 className="size-8 text-foreground dark:text-white" />
                  </WaveContainer>
                </motion.div>
                <div className="relative">
                  <motion.h1 
                    className="text-4xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    URL Scanner
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-[600px] mx-auto">
                Our advanced URL scanning technology analyzes web addresses in real-time for
                potential threats, malware, phishing attempts, and malicious content.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left side content */}
              <div className="size-full max-w-lg mx-auto items-center justify-center overflow-hidden pt-4">
                <BoxReveal boxColor="#0EA5E9" duration={0.5}>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <motion.div 
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0EA5E9]/10 to-[#0EA5E9]/5 p-3.5 transition-all hover:shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
                      >
                        <Shield className="mb-2 h-6 w-6 text-[#0EA5E9] transform transition-transform group-hover:scale-110" />
                      </motion.div>
                      <h3 className="font-semibold text-[#0EA5E9] text-sm group-hover:translate-x-0.5 transition-transform">Real-time Detection</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Instant threat analysis</p>
                    </motion.div>

                    <motion.div 
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#7C3AED]/10 to-[#7C3AED]/5 p-3.5 transition-all hover:shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2,
                        delay: 0.1,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4.2 }}
                      >
                        <FileWarning className="mb-2 h-6 w-6 text-[#7C3AED] transform transition-transform group-hover:scale-110" />
                      </motion.div>
                      <h3 className="font-semibold text-[#7C3AED] text-sm group-hover:translate-x-0.5 transition-transform">Anti-Phishing</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Scam protection</p>
                    </motion.div>

                    <motion.div 
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#F97316]/10 to-[#F97316]/5 p-3.5 transition-all hover:shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2,
                        delay: 0.2,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4.4 }}
                      >
                        <FileKey className="mb-2 h-6 w-6 text-[#F97316] transform transition-transform group-hover:scale-110" />
                      </motion.div>
                      <h3 className="font-semibold text-[#F97316] text-sm group-hover:translate-x-0.5 transition-transform">Malware Shield</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Exploit prevention</p>
                    </motion.div>

                    <motion.div 
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#06B6D4]/10 to-[#06B6D4]/5 p-3.5 transition-all hover:shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2,
                        delay: 0.3,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4.6 }}
                      >
                        <FileSearch className="mb-2 h-6 w-6 text-[#06B6D4] transform transition-transform group-hover:scale-110" />
                      </motion.div>
                      <h3 className="font-semibold text-[#06B6D4] text-sm group-hover:translate-x-0.5 transition-transform">Deep Analysis</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Content verification</p>
                    </motion.div>
                  </div>
                </BoxReveal>

                <div className="mt-8">
                  <div className="flex space-x-2 bg-background p-1.5 rounded-2xl border">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter URL to scan..."
                      className="flex-1 h-12 px-4 bg-transparent border-0 ring-2 ring-border/50 focus-visible:ring-2 focus-visible:ring-[#0EA5E9] rounded-xl transition-shadow duration-200"
                    />
                    <Button
                      onClick={handleScan}
                      className={`h-12 px-6 bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] text-white rounded-xl 
                        hover:translate-y-[-1px] hover:shadow-md 
                        active:translate-y-[1px] active:shadow-sm 
                        transition-all duration-200`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <span className="font-medium">Scan URL</span>
                      </div>
                    </Button>
                  </div>
                </div>

              </div>

              {/* Terminal side */}
              <div className="space-y-6">
                <div 
                  ref={terminalRef}
                  className="rounded-lg overflow-hidden relative h-[450px]"
                >
                  <Terminal className="font-mono text-sm p-4 h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2">
                      <TypingAnimation>
                        {`> Scanning URL: ${url}`}
                      </TypingAnimation>

                      {demoStep >= 2 && (
                        <AnimatedSpan delay={200} className="text-green-500">
                          <span>✓ Checking DNS records...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 3 && (
                        <AnimatedSpan delay={400} className="text-green-500">
                          <span>✓ Initializing scan process...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 4 && (
                        <AnimatedSpan delay={600} className="text-green-500">
                          <span>✓ Verifying SSL certificate...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 5 && (
                        <AnimatedSpan delay={800} className="text-green-500">
                          <span>✓ Analyzing content safety...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 6 && (
                        <AnimatedSpan delay={1000} className="text-green-500">
                          <span>✓ Checking malware database...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 7 && (
                        <AnimatedSpan delay={1200} className="text-blue-500">
                          <span>ℹ Generating security report...</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 8 && (
                        <AnimatedSpan delay={1400} className="text-green-500">
                          <span>✓ URL IS SAFE</span>
                        </AnimatedSpan>
                      )}

                      {demoStep >= 9 && (
                        <>
                          <AnimatedSpan delay={1600} className="text-muted-foreground">
                            <span>No malware detected</span>
                          </AnimatedSpan>
                          <AnimatedSpan delay={1800} className="text-muted-foreground">
                            <span>SSL certificate valid</span>
                          </AnimatedSpan>
                          <AnimatedSpan delay={2000} className="text-muted-foreground">
                            <span>Content verified</span>
                          </AnimatedSpan>
                        </>
                      )}

                      {demoStep >= 10 && (
                        <>
                          <div className="h-4"></div>
                          <TypingAnimation delay={2200} className="text-muted-foreground">
                            {`Scan completed successfully. You may scan another URL.`}
                          </TypingAnimation>
                        </>
                      )}
                    </div>
                  </Terminal>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
