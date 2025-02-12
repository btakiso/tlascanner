"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Database, Search, Shield, AlertTriangle, CircleCheck, CircleDashed, Zap, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { WaveContainer } from "../ui/wave-container";

interface SearchStep {
  id: string
  status: 'pending' | 'loading' | 'complete'
  text: string
  description: string
  icon: any
}

export function CVELookup() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchSteps, setSearchSteps] = useState<SearchStep[]>([])

  const searchStepsList: SearchStep[] = [
    { 
      id: 'init', 
      text: 'Initializing Scan', 
      description: 'Preparing vulnerability analysis',
      status: 'pending',
      icon: Zap 
    },
    { 
      id: 'scan', 
      text: 'Database Search', 
      description: 'Searching CVE records',
      status: 'pending',
      icon: Database 
    },
    { 
      id: 'analyze', 
      text: 'Risk Analysis', 
      description: 'Evaluating security impact',
      status: 'pending',
      icon: Shield 
    },
    { 
      id: 'assess', 
      text: 'Severity Check', 
      description: 'Calculating CVSS scores',
      status: 'pending',
      icon: AlertTriangle 
    }
  ]

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setSearchSteps(searchStepsList.map(step => ({ ...step, status: 'pending' })))

    for (const step of searchStepsList) {
      setSearchSteps(prev => 
        prev.map(s => 
          s.id === step.id ? { ...s, status: 'loading' } : s
        )
      )
      await new Promise(resolve => setTimeout(resolve, 800))
      setSearchSteps(prev => 
        prev.map(s => 
          s.id === step.id ? { ...s, status: 'complete' } : s
        )
      )
    }

    setTimeout(() => {
      setIsSearching(false)
      router.push(`/scan-results/cve?id=${encodeURIComponent(query)}`)
    }, 1000)
  }

  return (
    <motion.div 
      id="cve-lookup" 
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.section
          className="py-12 relative overflow-hidden max-w-7xl mx-auto rounded-2xl"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-emerald-50/80 to-white dark:from-emerald-950/50 dark:via-emerald-900/30 dark:to-black/50 rounded-2xl backdrop-blur-sm" />
          <div
            className="absolute inset-0 rounded-2xl opacity-[0.2] dark:opacity-[0.15]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(34 197 94) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="p-2">
                  <WaveContainer className="p-3" color="34,197,94">
                    <Database className="size-8 text-foreground dark:text-white" />
                  </WaveContainer>
                </div>
                <div className="relative">
                  <motion.h1 
                    className="text-4xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    CVE Lookup
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                  />
                </div>
              </motion.div>
              <motion.p 
                className="text-muted-foreground text-sm max-w-[600px] mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Search and analyze Common Vulnerabilities and Exposures (CVE) to
                identify potential security risks and stay informed about the latest threats.
              </motion.p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column - Search Interface */}
              <div className="space-y-4">
                <motion.div 
                  className="bg-emerald-50/80 dark:bg-black/20 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter CVE ID or keywords (e.g., CVE-2021-44228, Log4j)..."
                      className="w-full bg-white dark:bg-black/40 border-emerald-200 dark:border-emerald-500/30 rounded-xl h-12 pl-4 pr-12 text-base placeholder:text-emerald-600/50 dark:placeholder:text-muted-foreground"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || !query.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-lg h-8 px-3"
                    >
                      <Search className="size-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
                  >
                    {isSearching ? 'Analyzing Vulnerabilities...' : 'Search CVE Database'}
                  </Button>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50/80 dark:bg-blue-950/20 backdrop-blur-sm border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex flex-col items-center text-center group hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors">
                      <Shield className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Real-time Analysis</h3>
                    <p className="text-xs text-blue-600/80 dark:text-blue-300/80">Instant vulnerability assessment</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col items-center text-center group hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-xl mb-2 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/20 transition-colors">
                      <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Severity Rating</h3>
                    <p className="text-xs text-amber-600/80 dark:text-amber-300/80">CVSS score evaluation</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-sm border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 flex flex-col items-center text-center group hover:bg-rose-100/80 dark:hover:bg-rose-900/30 transition-colors"
                  >
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-xl mb-2 group-hover:bg-rose-200 dark:group-hover:bg-rose-500/20 transition-colors">
                      <Database className="size-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-sm font-medium text-rose-700 dark:text-rose-400 mb-1">Comprehensive</h3>
                    <p className="text-xs text-rose-600/80 dark:text-rose-300/80">Extensive CVE database</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-violet-50/80 dark:bg-violet-950/20 backdrop-blur-sm border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 flex flex-col items-center text-center group hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-colors"
                  >
                    <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-xl mb-2 group-hover:bg-violet-200 dark:group-hover:bg-violet-500/20 transition-colors">
                      <Zap className="size-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-1">Fast Results</h3>
                    <p className="text-xs text-violet-600/80 dark:text-violet-300/80">Quick response time</p>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-emerald-50/80 dark:bg-black/20 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-50" />
                
                {/* Results or Loading State */}
                {!isSearching && !searchSteps.length && (
                  <motion.div
                    className="flex flex-col items-center justify-center text-center p-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [0.5, 1],
                      y: [10, -10]
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 4,
                        ease: "easeInOut"
                      }}
                    >
                      <Database className="size-16 text-emerald-500/50 mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Ready to Search</h3>
                    <p className="text-sm text-muted-foreground/80">
                      Enter a CVE ID or keyword to begin vulnerability analysis
                    </p>
                  </motion.div>
                )}
                {isSearching && (
                  <div className="space-y-4 w-full max-w-md mx-auto">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-400/5 backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-400/30 shadow-lg shadow-emerald-500/5 dark:shadow-emerald-400/10">
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-400/20 p-2">
                        <Loader2 className="size-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Initializing Scan</h3>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/90">Preparing vulnerability analysis</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 dark:bg-blue-400/5 backdrop-blur-sm border border-blue-200/20 dark:border-blue-400/30 shadow-lg shadow-blue-500/5 dark:shadow-blue-400/10">
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-400/20 p-2">
                        <Search className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">Database Search</h3>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/90">Searching CVE records</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 backdrop-blur-sm border border-amber-200/20 dark:border-amber-400/30 shadow-lg shadow-amber-500/5 dark:shadow-amber-400/10">
                      <div className="rounded-lg bg-amber-100 dark:bg-amber-400/20 p-2">
                        <Shield className="size-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Risk Analysis</h3>
                        <p className="text-xs text-amber-600/80 dark:text-amber-400/90">Evaluating security impact</p>
                        <div className="mt-2 h-1.5 bg-amber-200/20 dark:bg-amber-400/20 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 dark:bg-rose-400/5 backdrop-blur-sm border border-rose-200/20 dark:border-rose-400/30 shadow-lg shadow-rose-500/5 dark:shadow-rose-400/10">
                      <div className="rounded-lg bg-rose-100 dark:bg-rose-400/20 p-2">
                        <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-rose-700 dark:text-rose-400">Severity Check</h3>
                        <p className="text-xs text-rose-600/80 dark:text-rose-400/90">Calculating CVSS scores</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}