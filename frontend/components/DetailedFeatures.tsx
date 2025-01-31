"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { LinkIcon, FileIcon, ShieldIcon, ArrowRight, Terminal, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BoxReveal } from "@/components/ui/box-reveal"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { cn } from "@/lib/utils"
import { ShieldCheck, FileWarning, FileScan, WormIcon as Virus, FileKey, Shield, FileSearch } from "lucide-react"
import React from "react" // Import React

export default function DetailedFeatures() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Our Core Features
        </h2>
        <div className="space-y-32">
          <URLScannerSection />
          <FileScannerSection />
          <CVELookupSection />
        </div>
      </div>
    </section>
  )
}

function URLScannerSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8 }}
      className="grid md:grid-cols-2 gap-8 items-center"
    >
      <div>
        <BoxReveal boxColor="#3B82F6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-2xl font-bold">URL Scanner</h3>
          </div>
        </BoxReveal>
        <BoxReveal boxColor="#3B82F6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our advanced URL scanning technology analyzes web addresses in real-time for potential threats, malware,
            phishing attempts, and malicious content. Stay protected while browsing the web.
          </p>
        </BoxReveal>
        <div className="space-y-4 mb-6">
          <BoxReveal boxColor="#3B82F6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Real-time threat detection and analysis</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#3B82F6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Phishing and scam detection</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#3B82F6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Malware and exploit identification</p>
            </div>
          </BoxReveal>
        </div>
        <BoxReveal boxColor="#3B82F6">
          <div className="flex flex-col space-y-4">
            <Input type="url" placeholder="Enter URL to scan..." className="w-full" />
            <Button className="w-full md:w-auto">
              Start URL Scan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </BoxReveal>
      </div>
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">Scan in progress</span>
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              analyzing
            </Badge>
          </div>
          <Progress value={66} className="h-1 bg-gray-800" />
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Checking for:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Malware</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Phishing</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Exploits</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Blacklists</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function FileScannerSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8 }}
      className="grid md:grid-cols-2 gap-8 items-center md:flex-row-reverse"
    >
      <div className="md:order-2">
        <BoxReveal boxColor="#8B5CF6">
          <div className="flex items-center gap-2 mb-4">
            <FileIcon className="w-6 h-6 text-purple-500" />
            <h3 className="text-2xl font-bold">File Scanner</h3>
          </div>
        </BoxReveal>
        <BoxReveal boxColor="#8B5CF6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Upload and scan files for potential security threats. Our advanced file scanning system detects malware,
            ransomware, and other malicious content before they can harm your system.
          </p>
        </BoxReveal>
        <div className="space-y-4 mb-6">
          <BoxReveal boxColor="#8B5CF6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Multiple file format support</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#8B5CF6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Deep file analysis</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#8B5CF6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Instant threat detection</p>
            </div>
          </BoxReveal>
        </div>
        <BoxReveal boxColor="#8B5CF6">
          <Button className="w-full md:w-auto">
            Upload File
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </BoxReveal>
      </div>
      <Card className="p-6 bg-gray-900 border-gray-800 md:order-1">
        <div
          className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-lg bg-background p-10"
          ref={containerRef}
        >
          <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div1Ref}>
                <FileScan className="h-6 w-6 text-blue-500" />
              </Circle>
              <Circle ref={div5Ref}>
                <FileWarning className="h-6 w-6 text-red-500" />
              </Circle>
            </div>
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div2Ref}>
                <Virus className="h-6 w-6 text-purple-500" />
              </Circle>
              <Circle ref={div4Ref} className="size-16">
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </Circle>
              <Circle ref={div6Ref}>
                <FileKey className="h-6 w-6 text-yellow-500" />
              </Circle>
            </div>
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div3Ref}>
                <Shield className="h-6 w-6 text-indigo-500" />
              </Circle>
              <Circle ref={div7Ref}>
                <FileSearch className="h-6 w-6 text-cyan-500" />
              </Circle>
            </div>
          </div>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
          />
          <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div4Ref} />
          <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div4Ref} curvature={75} endYOffset={10} />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            reverse
          />
          <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div4Ref} reverse />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div7Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
            reverse
          />
        </div>
      </Card>
    </motion.div>
  )
}

function CVELookupSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8 }}
      className="grid md:grid-cols-2 gap-8 items-center"
    >
      <div>
        <BoxReveal boxColor="#F59E0B">
          <div className="flex items-center gap-2 mb-4">
            <ShieldIcon className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold">CVE Lookup</h3>
          </div>
        </BoxReveal>
        <BoxReveal boxColor="#F59E0B">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Access our comprehensive database of Common Vulnerabilities and Exposures (CVE). Stay informed about known
            security vulnerabilities and protect your systems.
          </p>
        </BoxReveal>
        <div className="space-y-4 mb-6">
          <BoxReveal boxColor="#F59E0B">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Extensive CVE database</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#F59E0B">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Real-time updates</p>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="#F59E0B">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              <p className="text-sm">Detailed vulnerability information</p>
            </div>
          </BoxReveal>
        </div>
        <BoxReveal boxColor="#F59E0B">
          <div className="flex flex-col space-y-4">
            <Input type="text" placeholder="Enter CVE ID (e.g., CVE-2024-1234)" className="w-full" />
            <Button className="w-full md:w-auto">
              Search CVE
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </BoxReveal>
      </div>
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              High Severity
            </Badge>
            <span className="text-sm text-gray-400">Published: 2024-01-28</span>
          </div>
          <h4 className="text-lg font-semibold">CVE-2024-1234</h4>
          <p className="text-sm text-gray-400">
            Remote Code Execution vulnerability in popular web framework affecting versions prior to 2.5.0
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">CVSS Score</span>
              <span className="text-orange-400">8.9</span>
            </div>
            <Progress value={89} className="h-1 bg-gray-800" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const Circle = React.forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

Circle.displayName = "Circle"

const Icons = {
  notion: () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
        fill="#ffffff"
      />
      <path
        d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
        fill="#000000"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ),
  openai: () => (
    <svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),
  googleDrive: () => (
    <svg width="100" height="100" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  ),
  whatsapp: () => (
    <svg width="100" height="100" viewBox="0 0 175.216 175.552" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
        <filter id="a" width="1.115" height="1.114" x="-.057" y="-.057" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3.531" />
        </filter>
      </defs>
      <path
        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
        fill="#b3b3b3"
        filter="url(#a)"
      />
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
        fill="url(#linearGradient1780)"
      />
    </svg>
  ),
  zapier: () => (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM17 10.5H14V17H10V10.5H7V9H17V10.5Z"
        fill="#FFC107"
      />
    </svg>
  ),
}

