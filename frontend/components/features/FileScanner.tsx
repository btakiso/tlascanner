"use client"

import { type ReactNode, useRef, useState, useEffect, forwardRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  File, 
  Scan, 
  FileCheck, 
  FileWarning,
  Bug,
  BugPlay,
  Skull,
  EyeOff,
  FileX,
  ScanSearch,
  KeyRound,
  Lock,
  ServerCrash,
  FileSearch
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { WaveContainer } from "../ui/wave-container";

interface ScanResult {
  id: string
  fileName: string
  fileSize: string
  timestamp: Date
  status: "scanning" | "clean" | "suspicious" | "malicious"
  threats: string[]
}

interface CircleProps {
  children?: ReactNode
  className?: string
}

const Circle = forwardRef<HTMLDivElement, CircleProps>(({ children, className }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-purple-200 dark:border-purple-500/20 bg-white dark:bg-gray-900 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:border-gray-700",
        className,
      )}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )
})

Circle.displayName = "Circle"

export function FileScanner() {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const beam1Ref = useRef<HTMLDivElement>(null)
  const beam2Ref = useRef<HTMLDivElement>(null)
  const beam3Ref = useRef<HTMLDivElement>(null)
  const beam4Ref = useRef<HTMLDivElement>(null)
  const beam5Ref = useRef<HTMLDivElement>(null)
  const beam6Ref = useRef<HTMLDivElement>(null)
  const beam7Ref = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      setCurrentFile(file)
      setIsScanning(true)
      setScanProgress(0)

      // Simulate scanning process
      await new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 10
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            resolve()
          }
          setScanProgress(Math.min(progress, 100))
        }, 200)
      })

      const result: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        timestamp: new Date(),
        status: Math.random() > 0.7 ? "suspicious" : "clean",
        threats: Math.random() > 0.7 ? ["Potential malware detected", "Suspicious behavior"] : [],
      }

      setScanResults((prev) => [result, ...prev])
      setIsScanning(false)
      setCurrentFile(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <motion.div 
      id="file-scanner" 
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-transparent dark:from-purple-500/30 dark:via-purple-400/20 dark:to-transparent rounded-2xl backdrop-blur-sm" />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(168,85,247,0.15) 1px, transparent 0)`,
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
                  <WaveContainer className="p-3" color="168,85,247">
                    <FileSearch className="size-8 text-foreground dark:text-white" />
                  </WaveContainer>
                </motion.div>
                <div className="relative">
                  <motion.h1 
                    className="text-4xl font-bold text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    File Scanner
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-[600px] mx-auto">
                Upload and scan files for potential security threats. Our advanced scanning system detects malware,
                ransomware, and other malicious content.
              </p>
            </div>

            <div className="flex gap-6">
              {/* Left Column - Upload and Features */}
              <div className="flex flex-col gap-6">
                {/* Drag & Drop Area */}
                <motion.div
                  className={`relative rounded-2xl border-2 border-dashed transition-colors duration-200 ${
                    isDragging 
                      ? 'border-purple-500 bg-purple-500/5' 
                      : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
                  } px-6 py-5 text-center w-[400px] bg-white/30 dark:bg-white/5`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-50 dark:from-purple-500/5 to-transparent pointer-events-none" />
                  
                  <motion.div 
                    className="mx-auto mb-2 size-14 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Upload className="size-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>

                  <motion.h3 
                    className="text-base font-semibold mb-1 text-purple-900 dark:text-purple-100"
                    animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                  >
                    Drag & Drop Files
                  </motion.h3>
                  
                  <motion.p 
                    className="text-purple-700 dark:text-purple-300 text-xs mb-3"
                    animate={isDragging ? { opacity: 0.7 } : { opacity: 1 }}
                  >
                    or click to select files to scan
                  </motion.p>

                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-xl bg-purple-600 dark:bg-purple-500 px-5 py-1.5 text-sm font-medium text-white hover:bg-purple-700 dark:hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Upload Files
                  </motion.button>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Feature Box - Real-time Protection */}
                  <div className="flex flex-col items-start p-4 rounded-2xl border border-purple-100/30 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-purple-50/30 dark:hover:bg-purple-500/10 transition-colors duration-200">
                    <div className="rounded-lg bg-purple-100/50 dark:bg-purple-500/20 p-2 mb-2">
                      <KeyRound className="size-4 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-sm text-purple-900 dark:text-purple-300">Real-time Protection</h3>
                    <span className="text-xs text-purple-700/70 dark:text-purple-400/70">Instant threat analysis</span>
                  </div>

                  {/* Feature Box - Instant Analysis */}
                  <div className="flex flex-col items-start p-4 rounded-2xl border border-blue-100/30 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-colors duration-200">
                    <div className="rounded-lg bg-blue-100/50 dark:bg-blue-500/20 p-2 mb-2">
                      <Zap className="size-4 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-sm text-blue-900 dark:text-blue-300">Instant Analysis</h3>
                    <span className="text-xs text-blue-700/70 dark:text-blue-400/70">Quick scan results</span>
                  </div>

                  {/* Feature Box - Multiple Formats */}
                  <div className="flex flex-col items-start p-4 rounded-2xl border border-green-100/30 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-green-50/30 dark:hover:bg-green-500/10 transition-colors duration-200">
                    <div className="rounded-lg bg-green-100/50 dark:bg-green-500/20 p-2 mb-2">
                      <File className="size-4 text-green-600" />
                    </div>
                    <h3 className="font-medium text-sm text-green-900 dark:text-green-300">Multiple Formats</h3>
                    <span className="text-xs text-green-700/70 dark:text-green-400/70">Support all file types</span>
                  </div>

                  {/* Feature Box - Threat Detection */}
                  <div className="flex flex-col items-start p-4 rounded-2xl border border-orange-100/30 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-orange-50/30 dark:hover:bg-orange-500/10 transition-colors duration-200">
                    <div className="rounded-lg bg-orange-100/50 dark:bg-orange-500/20 p-2 mb-2">
                      <AlertTriangle className="size-4 text-orange-600" />
                    </div>
                    <h3 className="font-medium text-sm text-orange-900 dark:text-orange-300">Threat Detection</h3>
                    <span className="text-xs text-orange-700/70 dark:text-orange-400/70">Advanced security</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Visualization */}
              <div className="flex-1 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-sm p-6">
                {/* Visualization content goes here */}
                <div 
                  className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-purple-100/20 p-8"
                  ref={containerRef}
                  style={{ position: 'relative' }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/5 to-white/5 dark:from-purple-900/5 dark:to-gray-900/5" />
                  
                  <div className="relative z-20 grid grid-cols-3 gap-16 w-full max-w-2xl">
                    {/* Top Row */}
                    <div className="col-start-1 relative">
                      <Circle ref={div1Ref}>
                        <File className="size-6 text-indigo-500" />
                      </Circle>
                    </div>
                    <div className="relative" />
                    <div className="justify-self-end relative">
                      <Circle ref={div5Ref}>
                        <FileWarning className="size-6 text-cyan-500" />
                      </Circle>
                    </div>

                    {/* Middle Row */}
                    <div className="col-start-1 relative">
                      <Circle ref={div2Ref}>
                        <Skull className="size-6 text-emerald-500" />
                      </Circle>
                    </div>
                    <div className="justify-self-center relative">
                      <Circle ref={div4Ref} className="size-16">
                        <div className="p-2">
                          <WaveContainer className="p-3">
                            <ScanSearch className="size-8 text-white" />
                          </WaveContainer>
                        </div>
                      </Circle>
                    </div>
                    <div className="justify-self-end relative">
                      <Circle ref={div6Ref}>
                        <Bug className="size-6 text-amber-500" />
                      </Circle>
                    </div>

                    {/* Bottom Row */}
                    <div className="col-start-1 relative">
                      <Circle ref={div3Ref}>
                        <EyeOff className="size-6 text-teal-500" />
                      </Circle>
                    </div>
                    <div className="relative" />
                    <div className="justify-self-end relative">
                      <Circle ref={div7Ref}>
                        <ServerCrash className="size-6 text-rose-500" />
                      </Circle>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 z-10">
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div1Ref}
                      toRef={div4Ref}
                      curvature={50}
                      pathColor="#6366f1"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#6366f1"
                      gradientStopColor="#4f46e5"
                      duration={3}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div2Ref}
                      toRef={div4Ref}
                      curvature={30}
                      pathColor="#10b981"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#10b981"
                      gradientStopColor="#059669"
                      duration={3.2}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div3Ref}
                      toRef={div4Ref}
                      curvature={-30}
                      pathColor="#14b8a6"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#14b8a6"
                      gradientStopColor="#0d9488"
                      duration={3.4}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div5Ref}
                      toRef={div4Ref}
                      curvature={50}
                      pathColor="#06b6d4"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#06b6d4"
                      gradientStopColor="#0891b2"
                      duration={3.6}
                      reverse
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div6Ref}
                      toRef={div4Ref}
                      curvature={30}
                      pathColor="#f59e0b"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#f59e0b"
                      gradientStopColor="#d97706"
                      duration={3.8}
                      reverse
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={div7Ref}
                      toRef={div4Ref}
                      curvature={-30}
                      pathColor="#f43f5e"
                      pathOpacity={0.8}
                      pathWidth={3}
                      gradientStartColor="#f43f5e"
                      gradientStopColor="#e11d48"
                      duration={4}
                      reverse
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
