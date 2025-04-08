"use client"

import { type ReactNode, useRef, useState, useEffect, forwardRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
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
  FileSearch,
  FileText,
  CloudUpload,
  Shield,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { WaveContainer } from "../ui/wave-container";
import { uploadAndScanFile, checkFileScanStatus } from "@/services/fileScanApi"
import { toast } from "sonner"

interface ScanResult {
  id: string
  fileName: string
  fileSize: string
  timestamp: Date
  status: "scanning" | "clean" | "suspicious" | "malicious"
  threats: string[]
}

interface ExtendedFileScanResponse {
  status: string;
  scanId?: string;
  stats?: {
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout?: number;
    total?: number;
  };
  progress?: number;
}

interface CircleProps {
  children?: ReactNode
  className?: string
}

type ScanStage = 
  | "uploading" 
  | "queued" 
  | "analyzing" 
  | "checking_signatures" 
  | "behavioral_analysis" 
  | "finalizing" 
  | "complete"

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
  const router = useRouter()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const topLeftRef = useRef<HTMLDivElement>(null)
  const middleLeftRef = useRef<HTMLDivElement>(null)
  const bottomLeftRef = useRef<HTMLDivElement>(null)
  const topRightRef = useRef<HTMLDivElement>(null)
  const middleRightRef = useRef<HTMLDivElement>(null)
  const bottomRightRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'selected' | 'scanning'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStage, setScanStage] = useState<ScanStage>("uploading")
  const [scanId, setScanId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("Preparing to upload file...")
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingDelay, setPollingDelay] = useState<number>(5000)
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0)
  const maxPollingDelay = 15000
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(Date.now())
  const [stuckDetected, setStuckDetected] = useState<boolean>(false)

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [statusCheckInterval, progressInterval]);

  // Update status message based on scan stage
  useEffect(() => {
    switch (scanStage) {
      case "uploading":
        setStatusMessage("Uploading file to secure server...");
        break;
      case "queued":
        setStatusMessage("File uploaded. Waiting in scan queue...");
        break;
      case "analyzing":
        setStatusMessage("Analyzing file structure and contents...");
        break;
      case "checking_signatures":
        setStatusMessage("Checking against known malware signatures...");
        break;
      case "behavioral_analysis":
        setStatusMessage("Performing behavioral analysis...");
        break;
      case "finalizing":
        setStatusMessage("Finalizing scan results...");
        break;
      case "complete":
        setStatusMessage("Scan complete! Redirecting to results...");
        break;
    }
  }, [scanStage]);

  // Check if progress is stuck
  useEffect(() => {
    if (uploadState === 'scanning' && scanProgress > 0 && scanProgress < 100) {
      const stuckCheckInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastProgressUpdate;
        // If no progress for more than 15 seconds, show additional message
        if (timeSinceLastUpdate > 15000 && !stuckDetected) {
          setStuckDetected(true);
          setStatusMessage(prev => `${prev} (Still working, this may take a while...)`);
        }
      }, 5000);
      
      return () => clearInterval(stuckCheckInterval);
    }
  }, [uploadState, scanProgress, lastProgressUpdate, stuckDetected]);

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
      setSelectedFile(files[0])
      setUploadState('selected')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFile(files[0])
      setUploadState('selected')
    }
  }

  const startScan = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    try {
      // Reset scan state
      setUploadState('scanning');
      setScanProgress(0);
      setScanStage("uploading");
      setStatusMessage("Preparing file...");
      setScanResult(null);
      setError(null);
      setStuckDetected(false);
      setLastProgressUpdate(Date.now());
      
      // Clear any existing intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
      
      // Add file size validation (32MB limit)
      const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB in bytes
      if (selectedFile.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the 32MB limit. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`);
      }
      
      // Set up initial progress animation
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) return prev;
          
          // Adjust progress increment based on scan stage
          const stageMultiplier: Record<ScanStage, number> = {
            uploading: 0.7,
            queued: 0.3,
            analyzing: 0.5,
            checking_signatures: 0.6,
            behavioral_analysis: 0.8,
            finalizing: 0.9,
            complete: 1.0
          };
          
          // Smaller, more frequent increments for smoother progress
          const increment = Math.random() * 2 * (stageMultiplier[scanStage] || 0.5);
          const nextProgress = prev + increment;
          
          // More granular stage caps with overlap to prevent getting stuck at specific percentages
          const stageCaps: Record<ScanStage, number> = {
            uploading: 25,
            queued: 40,
            analyzing: 60,
            checking_signatures: 75,
            behavioral_analysis: 90,
            finalizing: 95,
            complete: 100
          };
          
          const cap = stageCaps[scanStage] || 95;
          
          // Update timestamp whenever progress changes
          if (nextProgress > prev) {
            setLastProgressUpdate(Date.now());
            setStuckDetected(false);
          }
          
          return nextProgress > cap ? cap : nextProgress;
        });
      }, 200); // More frequent updates for smoother animation
      
      setProgressInterval(interval);
      
      // Start file upload
      console.log("Uploading file to API...");
      setScanStage("uploading");
      
      // Upload retry mechanism with backoff
      let uploadAttempts = 0;
      const maxUploadAttempts = 3; 
      let uploadBackoff = 3000; 
      let result;
      
      // Circuit breaker pattern - check if we've had recent failures
      const lastFailureTime = localStorage.getItem('lastScanFailureTime');
      const failureCount = parseInt(localStorage.getItem('scanFailureCount') || '0');
      
      // If we've had multiple failures recently, implement a cooling period
      if (lastFailureTime && failureCount > 3) {
        const timeSinceLastFailure = Date.now() - parseInt(lastFailureTime);
        const cooldownPeriod = 60000; 
        
        if (timeSinceLastFailure < cooldownPeriod) {
          const remainingCooldown = Math.ceil((cooldownPeriod - timeSinceLastFailure) / 1000);
          setStatusMessage(`Server is experiencing high load. Please wait ${remainingCooldown} seconds before trying again.`);
          throw new Error(`Please wait ${remainingCooldown} seconds before trying again due to server load.`);
        }
      }
      
      while (uploadAttempts < maxUploadAttempts) {
        try {
          setStatusMessage(`Uploading file${uploadAttempts > 0 ? ` (attempt ${uploadAttempts + 1}/${maxUploadAttempts})` : ''}...`);
          result = await uploadAndScanFile(selectedFile);
          console.log("Upload complete, scan initiated:", result);
          
          // Reset failure tracking on success
          localStorage.setItem('scanFailureCount', '0');
          
          // If successful, break out of the retry loop
          break;
        } catch (error) {
          console.error("Upload attempt failed:", error);
          uploadAttempts++;
          
          // Check for specific error types
          if (error instanceof Error) {
            // Check for file size error (HTTP 413)
            if (error.message.includes('413') || error.message.includes('size exceeds')) {
              throw new Error(`File size exceeds the 32MB limit. Please choose a smaller file.`);
            }
            
            // Check if it's a rate limit error
            if (error.message.includes('429')) {
              // Update failure tracking
              const currentFailures = parseInt(localStorage.getItem('scanFailureCount') || '0');
              localStorage.setItem('scanFailureCount', (currentFailures + 1).toString());
              localStorage.setItem('lastScanFailureTime', Date.now().toString());
              
              if (uploadAttempts < maxUploadAttempts) {
                // Show user-friendly message about rate limiting
                setStatusMessage(`Rate limit reached. Waiting ${uploadBackoff/1000} seconds before retry... (${uploadAttempts}/${maxUploadAttempts})`);
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, uploadBackoff));
                
                // Increase backoff for next attempt (exponential backoff)
                uploadBackoff = Math.min(uploadBackoff * 2, 20000); 
              } else {
                // We've exhausted our retries
                throw new Error("Server is busy. Please try again later.");
              }
            } else if (uploadAttempts < maxUploadAttempts) {
              // For other errors, retry with backoff if we haven't exhausted retries
              setStatusMessage(`Error occurred. Retrying in ${uploadBackoff/1000} seconds... (${uploadAttempts}/${maxUploadAttempts})`);
              await new Promise(resolve => setTimeout(resolve, uploadBackoff));
              uploadBackoff = Math.min(uploadBackoff * 2, 20000);
            } else {
              // We've exhausted our retries for non-rate-limit errors
              throw error;
            }
          } else {
            // For unknown error types, just throw and exit
            throw new Error("An unknown error occurred during file upload.");
          }
        }
      }
      
      // If we've exhausted retries without success
      if (!result) {
        throw new Error(`Upload failed after ${maxUploadAttempts} attempts. Please try again later.`);
      }
      
      // Store scan ID for status checks
      setScanId(result.scanId);
      
      // Start checking scan status with a longer initial delay
      setTimeout(() => {
        checkScanStatus(result.scanId);
      }, 5000); // Start with a 5-second delay before first status check
    } catch (error) {
      console.error("Scan error:", error);
      
      // Clear any intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      
      // Reset state
      setUploadState('idle');
      setScanProgress(0);
      setScanStage("uploading");
      
      // Display user-friendly error message
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more user-friendly messages for common errors
        if (error.message.includes('413') || error.message.includes('size exceeds')) {
          errorMessage = `File size exceeds the 32MB limit. Please choose a smaller file.`;
        } else if (error.message.includes('429')) {
          errorMessage = `Server is busy. Please try again in a few minutes.`;
        } else if (error.message.includes('500')) {
          errorMessage = `Server error. Please try again later or contact support if the issue persists.`;
        }
      }
      
      // Show error toast
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null)
    setUploadState('idle')
    setScanProgress(0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="size-6 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="size-6 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="size-6 text-green-500" />
      case 'zip':
      case 'rar':
        return <FileText className="size-6 text-yellow-500" />
      case 'exe':
        return <FileText className="size-6 text-purple-500" />
      default:
        return <FileText className="size-6 text-gray-500" />
    }
  }

  // Helper function to calculate progress from status
  const calculateProgressFromStatus = (result: ExtendedFileScanResponse): number => {
    // If no status info is available, use a default progress based on time elapsed
    if (result.status === "pending") return 10;
    if (result.status === "scanning") {
      // Calculate progress based on stats if available
      if (result.stats) {
        // Calculate total if not provided
        const processed = (result.stats.harmless || 0) + 
                         (result.stats.malicious || 0) + 
                         (result.stats.suspicious || 0) + 
                         (result.stats.undetected || 0);
        
        // Use the calculated total or the provided total, or default to 1 to avoid division by zero
        const total = result.stats.total || processed || 1;
        
        return Math.min(95, Math.round((processed / total) * 100));
      }
      return 50; // Default mid-progress
    }
    if (result.status === "completed") return 100;
    return 0;
  };

  const checkScanStatus = async (scanId: string) => {
    if (!scanId) return;
    
    try {
      const statusResult: ExtendedFileScanResponse = await checkFileScanStatus(scanId);
      console.log("Scan status update:", statusResult);
      
      // Calculate total if not provided
      if (statusResult.stats && !statusResult.stats.total) {
        statusResult.stats.total = 
          (statusResult.stats.malicious || 0) + 
          (statusResult.stats.suspicious || 0) + 
          (statusResult.stats.harmless || 0) + 
          (statusResult.stats.undetected || 0);
      }
      
      // Reset error counter and gradually decrease polling delay on success
      setConsecutiveErrors(0);
      if (pollingDelay > 2000) {
        setPollingDelay(Math.max(2000, pollingDelay - 1000));
        // We'll update the interval after this execution completes
      }
      
      // Update scan stage based on status
      if (statusResult.status === "scanning") {
        // Simulate progress percentage if not provided by API
        const progressPercent = statusResult.progress || calculateProgressFromStatus(statusResult);
        
        // Determine scan stage based on progress percentage with overlapping ranges
        // to prevent getting stuck at specific percentages
        if (progressPercent < 25) {
          setScanStage("queued");
          setStatusMessage("File in processing queue. Preparing for analysis...");
        } else if (progressPercent < 45) {
          setScanStage("analyzing");
          setStatusMessage("Analyzing file structure and contents...");
        } else if (progressPercent < 65) {
          setScanStage("checking_signatures");
          setStatusMessage("Checking against malware databases and signatures...");
        } else if (progressPercent < 85) {
          setScanStage("behavioral_analysis");
          setStatusMessage("Performing behavioral and heuristic analysis...");
        } else {
          setScanStage("finalizing");
          setStatusMessage("Finalizing scan results and generating report...");
        }
        
        // Set actual progress if available from API with a small increment
        // to show continuous movement
        if (statusResult.progress) {
          const randomIncrement = Math.random() * 2;
          const newProgress = Math.min(95, statusResult.progress + randomIncrement);
          setScanProgress(newProgress);
          setLastProgressUpdate(Date.now());
          setStuckDetected(false);
        }
      } else if (statusResult.status === "completed") {
        // Scan is complete
        setScanStage("complete");
        setScanProgress(100);
        setLastProgressUpdate(Date.now());
        
        // Clear the interval
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        // Navigate to results page
        setTimeout(() => {
          if (selectedFile) {
            const url = `/scan-results/file?file=${encodeURIComponent(selectedFile.name)}&scanId=${scanId}`;
            console.log("Scan complete. Navigating to:", url);
            router.push(url);
          }
        }, 1000);
        
        // Exit the function early since we're done
        return;
      }
    } catch (error) {
      console.error("Error checking scan status:", error);
      
      // Handle rate limit errors specifically
      if (error instanceof Error && error.message.includes('429')) {
        setConsecutiveErrors(consecutiveErrors + 1);
        
        // Increase polling delay exponentially when hitting rate limits
        setPollingDelay(Math.min(maxPollingDelay, pollingDelay * 1.5));
        
        // Update the status message to inform the user
        setStatusMessage(`Rate limit reached. Reducing check frequency (${Math.round(pollingDelay/1000)}s intervals)...`);
      }
      
      // If we've had too many consecutive errors, show a more permanent error message
      if (consecutiveErrors > 5) {
        setStatusMessage("Experiencing connection issues. Scan continues in the background.");
      }
    }
    
    // Update the interval with the new delay
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    
    const newInterval = setInterval(() => checkScanStatus(scanId), pollingDelay);
    setStatusCheckInterval(newInterval);
  };

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
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-1 flex items-center">
                <FileWarning className="w-3 h-3 mr-1 text-yellow-500" />
                <span>File Size Limitation: Files must be under 32MB.</span>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Left Column - Upload and Features */}
              <div className="flex flex-col gap-6">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  multiple
                />
                
                {/* Drag & Drop Area */}
                <AnimatePresence mode="wait">
                  {uploadState === 'idle' && (
                    <motion.div
                      key="upload-area"
                      className={`relative rounded-2xl border-2 border-dashed transition-colors duration-200 ${
                        isDragging 
                          ? 'border-purple-500 bg-purple-500/5' 
                          : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
                      } px-6 py-5 text-center w-[400px] bg-white/30 dark:bg-white/5`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
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
                  )}

                  {uploadState === 'selected' && selectedFile && (
                    <motion.div
                      key="file-preview"
                      className="relative rounded-2xl border border-purple-200 dark:border-purple-800 px-6 py-5 w-[400px] bg-white/30 dark:bg-white/5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                          {getFileIcon(selectedFile.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 truncate">
                            {selectedFile.name}
                          </h3>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <motion.button
                          onClick={cancelUpload}
                          className="inline-flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={startScan}
                          className="inline-flex items-center justify-center rounded-xl bg-purple-600 dark:bg-purple-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700 dark:hover:bg-purple-400"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Start Scan
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {uploadState === 'scanning' && selectedFile && (
                    <motion.div
                      key="scanning"
                      className="relative rounded-2xl border border-purple-200 dark:border-purple-800 px-6 py-5 w-[400px] bg-white/30 dark:bg-white/5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            {scanStage === "uploading" && <CloudUpload className="size-6 text-blue-600" />}
                            {scanStage === "queued" && <Database className="size-6 text-yellow-600" />}
                            {(scanStage === "analyzing" || scanStage === "checking_signatures") && <ScanSearch className="size-6 text-purple-600" />}
                            {scanStage === "behavioral_analysis" && <BugPlay className="size-6 text-orange-600" />}
                            {scanStage === "finalizing" && <Shield className="size-6 text-green-600" />}
                            {scanStage === "complete" && <CheckCircle className="size-6 text-green-600" />}
                          </motion.div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {scanStage === "complete" ? "Scan complete!" : "Scanning file..."}
                          </h3>
                          <div className="relative">
                            <Progress 
                              value={scanProgress} 
                              className={cn(
                                "h-3 mt-2 bg-gray-200 dark:bg-gray-700 relative overflow-hidden",
                                scanStage === "complete" ? "[&>div]:bg-green-500" : "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:via-purple-500 [&>div]:to-purple-600"
                              )}
                            />
                            {/* Animated shimmer effect on the progress bar */}
                            {scanProgress < 100 && (
                              <motion.div 
                                className="absolute inset-0 mt-2 pointer-events-none"
                                animate={{ 
                                  background: [
                                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                                    "linear-gradient(90deg, transparent 100%, rgba(255, 255, 255, 0.3) 50%, transparent 0%)"
                                  ],
                                  backgroundSize: "200% 100%",
                                  backgroundPosition: ["0% 0%", "100% 0%"]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{ height: "3px" }}
                              />
                            )}
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-purple-700 dark:text-purple-300">{Math.round(scanProgress)}%</span>
                            <span className="text-xs text-purple-700 dark:text-purple-300">
                              {scanStage === "complete" ? "Done" : "In progress"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`size-2 rounded-full ${
                            scanStage === "uploading" ? "bg-blue-500 animate-pulse" : 
                            scanStage === "complete" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                          }`} />
                          <span className={`text-xs ${
                            scanStage === "uploading" ? "text-blue-600 dark:text-blue-400 font-medium" : 
                            scanStage === "complete" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            File upload
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`size-2 rounded-full ${
                            scanStage === "queued" ? "bg-yellow-500 animate-pulse" : 
                            scanStage === "complete" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                          }`} />
                          <span className={`text-xs ${
                            scanStage === "queued" ? "text-yellow-600 dark:text-yellow-400 font-medium" : 
                            scanStage === "complete" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            Queue processing
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`size-2 rounded-full ${
                            scanStage === "analyzing" || scanStage === "checking_signatures" ? "bg-purple-500 animate-pulse" : 
                            scanStage === "complete" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                          }`} />
                          <span className={`text-xs ${
                            scanStage === "analyzing" || scanStage === "checking_signatures" ? "text-purple-600 dark:text-purple-400 font-medium" : 
                            scanStage === "complete" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            Malware analysis
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`size-2 rounded-full ${
                            scanStage === "behavioral_analysis" ? "bg-orange-500 animate-pulse" : 
                            scanStage === "complete" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                          }`} />
                          <span className={`text-xs ${
                            scanStage === "behavioral_analysis" ? "text-orange-600 dark:text-orange-400 font-medium" : 
                            scanStage === "complete" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            Behavioral analysis
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${
                            scanStage === "finalizing" ? "bg-green-500 animate-pulse" : 
                            scanStage === "complete" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                          }`} />
                          <span className={`text-xs ${
                            scanStage === "finalizing" ? "text-green-600 dark:text-green-400 font-medium" : 
                            scanStage === "complete" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            Finalizing results
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-purple-700 dark:text-purple-300 text-center mt-3">
                        {statusMessage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      <Circle ref={topLeftRef}>
                        <File className="size-6 text-indigo-500" />
                      </Circle>
                    </div>
                    <div className="relative" />
                    <div className="justify-self-end relative">
                      <Circle ref={topRightRef}>
                        <FileWarning className="size-6 text-cyan-500" />
                      </Circle>
                    </div>

                    {/* Middle Row */}
                    <div className="col-start-1 relative">
                      <Circle ref={middleLeftRef}>
                        <Skull className="size-6 text-emerald-500" />
                      </Circle>
                    </div>
                    <div className="justify-self-center relative">
                      <Circle ref={centerRef} className="size-16">
                        <div className="p-2">
                          <WaveContainer className="p-3">
                            <ScanSearch className="size-8 text-white" />
                          </WaveContainer>
                        </div>
                      </Circle>
                    </div>
                    <div className="justify-self-end relative">
                      <Circle ref={middleRightRef}>
                        <Bug className="size-6 text-amber-500" />
                      </Circle>
                    </div>

                    {/* Bottom Row */}
                    <div className="col-start-1 relative">
                      <Circle ref={bottomLeftRef}>
                        <EyeOff className="size-6 text-teal-500" />
                      </Circle>
                    </div>
                    <div className="relative" />
                    <div className="justify-self-end relative">
                      <Circle ref={bottomRightRef}>
                        <ServerCrash className="size-6 text-rose-500" />
                      </Circle>
                    </div>
                  </div>

                  {/* Animated Beams */}
                  <div className="pointer-events-none absolute inset-0 z-10">
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={topLeftRef}
                      toRef={centerRef}
                      curvature={50}
                      pathColor="#6366f1"
                      pathOpacity={0.8}
                      duration={4}
                      delay={0}
                      pathWidth={2}
                      gradientStartColor="#6366f1"
                      gradientStopColor="#4f46e5"
                      disabled={uploadState === 'scanning'}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={middleLeftRef}
                      toRef={centerRef}
                      curvature={30}
                      pathColor="#10b981"
                      pathOpacity={0.8}
                      duration={4}
                      delay={0.4}
                      pathWidth={2}
                      gradientStartColor="#10b981"
                      gradientStopColor="#059669"
                      disabled={uploadState === 'scanning'}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={bottomLeftRef}
                      toRef={centerRef}
                      curvature={-30}
                      pathColor="#14b8a6"
                      pathOpacity={0.8}
                      duration={4}
                      delay={0.8}
                      pathWidth={2}
                      gradientStartColor="#14b8a6"
                      gradientStopColor="#0d9488"
                      disabled={uploadState === 'scanning'}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={topRightRef}
                      toRef={centerRef}
                      curvature={50}
                      pathColor="#06b6d4"
                      pathOpacity={0.8}
                      duration={4}
                      delay={1.2}
                      pathWidth={2}
                      gradientStartColor="#06b6d4"
                      gradientStopColor="#0891b2"
                      reverse
                      disabled={uploadState === 'scanning'}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={middleRightRef}
                      toRef={centerRef}
                      curvature={30}
                      pathColor="#f59e0b"
                      pathOpacity={0.8}
                      duration={4}
                      delay={1.6}
                      pathWidth={2}
                      gradientStartColor="#f59e0b"
                      gradientStopColor="#d97706"
                      reverse
                      disabled={uploadState === 'scanning'}
                    />
                    <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={bottomRightRef}
                      toRef={centerRef}
                      curvature={-30}
                      pathColor="#f43f5e"
                      pathOpacity={0.8}
                      duration={4}
                      delay={2}
                      pathWidth={2}
                      gradientStartColor="#f43f5e"
                      gradientStopColor="#e11d48"
                      reverse
                      disabled={uploadState === 'scanning'}
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
