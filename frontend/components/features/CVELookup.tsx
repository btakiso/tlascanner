"use client"

import React, { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ShieldIcon, ArrowRight, AlertCircle, CheckCircle2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BoxReveal } from "@/components/ui/box-reveal"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { cn } from "@/lib/utils"
import { Shield, Database, FileWarning, FileKey } from "lucide-react"

interface CVEResult {
  id: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export function CVELookup() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isSearching, setIsSearching] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [query, setQuery] = React.useState("")
  const [searchHistory, setSearchHistory] = React.useState<CVEResult[]>([])

  // Refs for AnimatedBeam
  const containerRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isSearching) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsSearching(false)
            clearInterval(timer)
            return 100
          }
          return prev + 1
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [isSearching])

  const handleSearch = () => {
    if (!query) return
    setIsSearching(true)
    setProgress(0)

    // Simulate CVE lookup result
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']
    setSearchHistory(prev => [{
      id: `CVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: 'Vulnerability affecting system security through improper input validation.'
    }, ...prev.slice(0, 4)])
  }

  const getSeverityColor = (severity: CVEResult['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500'
      case 'high': return 'text-orange-500 border-orange-500'
      case 'medium': return 'text-yellow-500 border-yellow-500'
      case 'low': return 'text-green-500 border-green-500'
      default: return 'text-gray-500 border-gray-500'
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8 }}
      className="grid md:grid-cols-2 gap-8 items-start"
    >
      <div className="space-y-6">
        <BoxReveal boxColor="#10B981">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Database className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold">CVE Lookup</h3>
          </div>
        </BoxReveal>
        
        <BoxReveal boxColor="#10B981">
          <div className="relative" ref={containerRef}>
            <AnimatedBeam 
              containerRef={containerRef}
              fromRef={fromRef}
              toRef={toRef}
              curvature={0.5}
              endYOffset={20}
            />
            <div ref={fromRef} className="absolute -left-2 top-1/2 w-1 h-1" />
            <div ref={toRef} className="absolute -right-2 top-1/2 w-1 h-1" />
            
            <Card className="relative bg-white/5 backdrop-blur-sm border-white/10">
              <div className="p-6 space-y-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Search and analyze Common Vulnerabilities and Exposures (CVE) database.
                  Stay informed about known security vulnerabilities and their impacts.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <Database className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-500">CVE Database</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <Shield className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-purple-500">Severity Rating</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Risk assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <FileWarning className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-orange-500">Impact Analysis</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vulnerability scope</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <FileKey className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-500">Patch Status</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fix availability</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Enter CVE ID or keywords..." 
                      className="w-full pl-10 bg-white/5 border-white/10" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <Button 
                    className="w-full relative overflow-hidden group" 
                    onClick={handleSearch}
                    disabled={isSearching || !query}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSearching ? 'Searching...' : 'Search CVE Database'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </BoxReveal>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-gray-900/50 backdrop-blur-xl border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isSearching ? "bg-emerald-500" : "bg-green-500"
                )} />
                <span className="text-sm font-medium text-gray-300">
                  {isSearching ? 'Search in progress' : 'Ready to search'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium",
                  isSearching ? "text-emerald-400 border-emerald-400" : "text-green-400 border-green-400"
                )}
              >
                {isSearching ? 'searching' : 'ready'}
              </Badge>
            </div>

            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Progress value={progress} className="h-1.5 bg-gray-800" />
                  <div className="absolute -top-2 -translate-y-full left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-xs rounded-md">
                    {progress}%
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-400 font-medium">Searching database:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Database, label: 'CVE Records', color: 'text-emerald-500' },
                      { icon: Shield, label: 'CVSS Score', color: 'text-purple-500' },
                      { icon: FileWarning, label: 'References', color: 'text-orange-500' },
                      { icon: FileKey, label: 'Solutions', color: 'text-blue-500' },
                    ].map((item, i) => (
                      <div 
                        key={item.label}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          progress > i * 25 ? "bg-gray-800/50" : "bg-gray-800/20"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", item.color)} />
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!isSearching && searchHistory.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-400 font-medium">Recent Lookups:</p>
                <div className="space-y-3">
                  {searchHistory.map((result, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg bg-gray-800/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{result.id}</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getSeverityColor(result.severity))}
                        >
                          {result.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{result.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
