"use client"

import React, { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileIcon, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BoxReveal } from "@/components/ui/box-reveal"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { cn } from "@/lib/utils"
import { Shield, FileWarning, FileScan, FileKey } from "lucide-react"

interface ScanHistoryItem {
  fileName: string
  timestamp: string
  status: 'safe' | 'warning' | 'danger'
  size: string
}

export function FileScanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isScanning, setIsScanning] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [scanHistory, setScanHistory] = React.useState<ScanHistoryItem[]>([])

  // Refs for AnimatedBeam
  const containerRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isScanning) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false)
            clearInterval(timer)
            return 100
          }
          return prev + 1
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [isScanning])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsScanning(true)
    setProgress(0)

    // Simulate scanning multiple files
    for (const file of files) {
      setScanHistory(prev => [{
        fileName: file.name,
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.5 ? 'safe' : 'warning',
        size: formatFileSize(file.size)
      }, ...prev.slice(0, 4)])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        <BoxReveal boxColor="#9333EA">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <FileIcon className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold">File Scanner</h3>
          </div>
        </BoxReveal>
        
        <BoxReveal boxColor="#9333EA">
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
                  Our advanced file scanning system analyzes files for potential threats, malware,
                  and vulnerabilities. Protect your system from malicious files and stay secure.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <FileScan className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-green-500">Deep Scan</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Thorough analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <Shield className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-purple-500">Real-time Protection</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Instant detection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <FileWarning className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-orange-500">Threat Detection</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Malware protection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <FileKey className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-500">File Integrity</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Checksum verification</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full relative overflow-hidden group" 
                    onClick={() => document.getElementById('file-input')?.click()}
                    disabled={isScanning}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isScanning ? 'Scanning...' : 'Select Files to Scan'}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Drag and drop files here or click to select
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </BoxReveal>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-gray-900/50 backdrop-blur-xl border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isScanning ? "bg-purple-500" : "bg-green-500"
                )} />
                <span className="text-sm font-medium text-gray-300">
                  {isScanning ? 'Scan in progress' : 'Ready to scan'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium",
                  isScanning ? "text-purple-400 border-purple-400" : "text-green-400 border-green-400"
                )}
              >
                {isScanning ? 'analyzing' : 'ready'}
              </Badge>
            </div>

            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Progress value={progress} className="h-1.5 bg-gray-800" />
                  <div className="absolute -top-2 -translate-y-full left-1/2 -translate-x-1/2 px-2 py-1 bg-purple-500 text-xs rounded-md">
                    {progress}%
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-400 font-medium">Scanning for threats:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: AlertCircle, label: 'Malware', color: 'text-yellow-500' },
                      { icon: Shield, label: 'Integrity', color: 'text-purple-500' },
                      { icon: FileWarning, label: 'Exploits', color: 'text-orange-500' },
                      { icon: FileKey, label: 'Signatures', color: 'text-blue-500' },
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

            {!isScanning && scanHistory.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-400 font-medium">Recent Scans:</p>
                <div className="space-y-2">
                  {scanHistory.map((scan, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          scan.status === 'safe' ? "bg-green-500" : "bg-yellow-500"
                        )} />
                        <div>
                          <span className="text-sm text-gray-300 truncate max-w-[200px] block">{scan.fileName}</span>
                          <span className="text-xs text-gray-500">{scan.size}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </span>
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
