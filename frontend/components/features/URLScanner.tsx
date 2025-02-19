"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BoxReveal } from "@/components/ui/box-reveal"
import { Shield, FileWarning, FileKey, FileSearch } from "lucide-react"
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal"
import { WaveContainer } from "../ui/wave-container"
import { useRouter } from "next/navigation"
import { config } from "@/app/config"

export function URLScanner() {
  const router = useRouter()
  const ref = useRef(null)
  const terminalRef = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-100px" })
  const [url, setUrl] = useState("https://example.com")
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'error'>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scanSteps, setScanSteps] = useState({
    dns: false,
    init: false,
    ssl: false,
    content: false,
    malware: false,
    report: false,
    complete: false
  })

  // Reset scan steps when URL changes
  useEffect(() => {
    setScanSteps({
      dns: false,
      init: false,
      ssl: false,
      content: false,
      malware: false,
      report: false,
      complete: false
    });
    setScanState('idle');
    setError(null);
  }, [url]);

  const runScanStep = async (step: keyof typeof scanSteps, delay: number) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    setScanSteps(prev => ({ ...prev, [step]: true }));
  };

  const handleScan = async () => {
    setScanState('scanning');
    setError(null);
    setScanProgress(0);
    
    // Reset scan steps
    setScanSteps({
      dns: false,
      init: false,
      ssl: false,
      content: false,
      malware: false,
      report: false,
      complete: false
    });

    try {
      // Start the visual scanning process
      const steps: [keyof typeof scanSteps, number][] = [
        ['dns', 500],
        ['init', 800],
        ['ssl', 1000],
        ['content', 1200],
        ['malware', 1500],
        ['report', 1800],
      ];

      // Run each step with its delay
      for (const [step, delay] of steps) {
        await runScanStep(step, delay);
        setScanProgress(prev => Math.min(prev + 100 / steps.length, 100));
      }

      const apiUrl = `${config.API_URL}${config.SCAN_ENDPOINTS.URL}`;
      console.log('Making API request to:', apiUrl);
      console.log('Request body:', { url });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to scan URL');
      }

      // Mark scan as complete
      setScanSteps(prev => ({ ...prev, complete: true }));
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to scan results page with the scan ID
      router.push(`/scan-results/url?target=${encodeURIComponent(url)}&scanId=${responseData.data.scanId}`);
    } catch (error) {
      console.error('Error scanning URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to scan URL');
      setScanState('error');
    }
  };

  const renderScanStep = (step: keyof typeof scanSteps, label: string) => {
    const isActive = scanSteps[step];
    return (
      <AnimatedSpan delay={0} className={isActive ? "text-green-500" : "text-muted-foreground"}>
        <span>{isActive ? "✓" : "○"} {label}</span>
      </AnimatedSpan>
    );
  };

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
                  <div className="flex flex-col space-y-2">
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
                        disabled={scanState === 'scanning'}
                        className={`h-12 px-6 bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] text-white rounded-xl 
                          hover:translate-y-[-1px] hover:shadow-md 
                          active:translate-y-[1px] active:shadow-sm 
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-2">
                          {scanState === 'scanning' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
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
                          )}
                          <span className="font-medium">
                            {scanState === 'scanning' ? 'Scanning...' : 'Scan URL'}
                          </span>
                        </div>
                      </Button>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm px-2">
                        {error}
                      </div>
                    )}
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
                      {scanState === 'scanning' && (
                        <>
                          <TypingAnimation>
                            {`> Scanning URL: ${url}`}
                          </TypingAnimation>

                          <div className="space-y-2 mt-2">
                            {renderScanStep('dns', 'Checking DNS records...')}
                            {renderScanStep('init', 'Initializing scan process...')}
                            {renderScanStep('ssl', 'Verifying SSL certificate...')}
                            {renderScanStep('content', 'Analyzing content safety...')}
                            {renderScanStep('malware', 'Checking malware database...')}
                            {renderScanStep('report', 'Generating security report...')}
                            
                            {scanSteps.complete && (
                              <>
                                <AnimatedSpan delay={200} className="text-green-500">
                                  <span>✓ URL IS SAFE</span>
                                </AnimatedSpan>
                                <AnimatedSpan delay={400} className="text-muted-foreground">
                                  <span>No malware detected</span>
                                </AnimatedSpan>
                                <AnimatedSpan delay={600} className="text-muted-foreground">
                                  <span>SSL certificate valid</span>
                                </AnimatedSpan>
                                <AnimatedSpan delay={800} className="text-muted-foreground">
                                  <span>Content verified</span>
                                </AnimatedSpan>
                              </>
                            )}

                            {error && (
                              <AnimatedSpan delay={200} className="text-red-500">
                                <span>✗ Error: {error}</span>
                              </AnimatedSpan>
                            )}
                          </div>
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
