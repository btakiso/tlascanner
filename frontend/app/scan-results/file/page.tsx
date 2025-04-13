"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { 
  Activity,
  AlertTriangle, 
  Check, 
  Copy, 
  File, 
  FileCode, 
  FileText, 
  Image, 
  Shield, 
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Video,
  ArrowLeft
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedDonut } from "@/components/ui/animated-donut"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { checkFileScanStatus, getFileScanById } from "@/services/fileScanApi"
// useToast already imported above
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, Colors } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend, Colors)

interface FileMetadata {
  name: string;
  type: string;
  size: string;
  sha256: string;
  md5: string;
  sha1: string;
  firstSeen: string;
  lastSeen: string;
  createdAt?: string;
}

interface Stats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  total: number;
}

interface EngineResult {
  engine: string;
  category: string;
  result: string;
  method: string;
  engineVersion: string;
  engineUpdate: string;
  signatureName?: string;
}

interface ThreatSignature {
  type: string;
  description: string;
  severity: string;
  name?: string;
  family?: string;
  details?: string;
  mitre?: string;
}

interface ScanResult {
  fileMetadata: FileMetadata;
  stats: Stats;
  lastAnalysisResults: EngineResult[];
  signatures: ThreatSignature[];
  reputation: number;
}

const getFileIcon = (type: string) => {
  switch (type.split('/')[0]) {
    case 'image':
      return <Image className="size-6" />
    case 'video':
      return <Video className="size-6" />
    case 'text':
      return <FileText className="size-6" />
    case 'application':
      return type.includes('json') || type.includes('javascript') || type.includes('typescript') ? 
        <FileCode className="size-6" /> : <File className="size-6" />
    default:
      return <File className="size-6" />
  }
}

// Define a custom function to get the appropriate badge variant based on severity
const getBadgeVariantBySeverity = (severity: string | undefined): "default" | "destructive" | "outline" | "secondary" => {
  if (!severity) return "outline";
  
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity === "high" || lowerSeverity === "critical") {
    return "destructive";
  } else if (lowerSeverity === "medium" || lowerSeverity === "warning") {
    return "secondary";
  } else {
    return "outline";
  }
};

const threatLevelColors = {
  critical: {
    border: "border-destructive",
    bgLight: "bg-destructive/10",
    bg: "bg-destructive/20",
    text: "text-destructive"
  },
  warning: {
    border: "border-warning",
    bgLight: "bg-warning/10",
    bg: "bg-warning/20",
    text: "text-warning"
  },
  safe: {
    border: "border-success",
    bgLight: "bg-success/10",
    bg: "bg-success/20",
    text: "text-success"
  }
};

// Custom CSS classes for enhanced alert visibility
const alertStyles: Record<string, string> = {
  critical: "border-l-8 border-l-destructive bg-red-100 dark:bg-red-900/30 shadow-md",
  warning: "border-l-8 border-l-amber-500 bg-amber-100 dark:bg-amber-900/30 shadow-md",
  safe: "border-l-8 border-l-green-500 bg-green-100 dark:bg-green-900/30 shadow-md"
};

export default function FileScanResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [threatLevel, setThreatLevel] = useState<string>("safe");
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const handleBackClick = () => {
    router.push('/#file-scanner');
  };
  const [scanStatus, setScanStatus] = useState<string>("pending");
  const [socketStatus, setSocketStatus] = useState<string>("disconnected");
  const { toast } = useToast();
  
  // Function to test WebSocket connection independently
  const testWebSocketConnection = () => {
    console.log('Testing WebSocket connection independently...');
    
    // Get the base URL from the current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;
    
    console.log('Test WebSocket URL:', wsUrl);
    
    // Create test connection
    const testSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    // Log all events
    testSocket.onAny((event, ...args) => {
      console.log(`Test socket event '${event}' received:`, args);
    });
    
    // Handle connection
    testSocket.on('connect', () => {
      console.log('Test WebSocket connected with ID:', testSocket.id);
      
      // Send a ping to test bidirectional communication
      testSocket.emit('ping', (response: any) => {
        console.log('Received pong response:', response);
        
        // Close test connection after successful ping
        setTimeout(() => {
          testSocket.disconnect();
          console.log('Test WebSocket disconnected');
        }, 2000);
      });
    });
    
    // Handle errors
    testSocket.on('connect_error', (error) => {
      console.error('Test WebSocket connection error:', error);
    });
  };

  useEffect(() => {
    // Process scan results (used for both initial fetch and WebSocket updates)
    const processResults = (result: any) => {
      // Calculate total from individual counts
      const totalEngines = 
        (result.stats?.malicious || 0) + 
        (result.stats?.suspicious || 0) + 
        (result.stats?.harmless || 0) + 
        (result.stats?.undetected || 0);
      
      setScanResult({
        fileMetadata: {
          name: result.fileName || "Unknown file",
          type: result.fileType || "application/octet-stream",
          size: result.fileSize ? String(result.fileSize) : "Unknown",
          sha256: result.hash?.sha256 || "",
          md5: result.hash?.md5 || "",
          sha1: result.hash?.sha1 || "",
          firstSeen: result.scanDate || new Date().toISOString(),
          lastSeen: result.scanDate || new Date().toISOString(),
          createdAt: result.scanDate,
        },
        stats: {
          malicious: result.stats?.malicious || 0,
          suspicious: result.stats?.suspicious || 0,
          harmless: result.stats?.harmless || 0,
          undetected: result.stats?.undetected || 0,
          total: totalEngines
        },
        lastAnalysisResults: Object.entries(result.results || {}).map(([engine, data]: [string, any]) => ({
          engine: engine,
          category: data.category || "unknown",
          result: data.result || "",
          method: data.method || "unknown",
          engineVersion: data.engine_version || "N/A",
          engineUpdate: data.engine_update || "N/A",
          signatureName: data.result
        })),
        signatures: result.signatures || [],
        reputation: result.reputation || 0
      });
      
      // Determine threat level
      if (result.stats?.malicious > 0) {
        setThreatLevel("critical");
      } else if (result.stats?.suspicious > 0) {
        setThreatLevel("warning");
      } else if (result.status === 'completed') {
        setThreatLevel("safe");
      } else {
        setThreatLevel("scanning");
      }
      
      // Update scan status
      setScanStatus(result.status);
      console.log(`Scan status updated to: ${result.status}`);
      
      // Set loading to false once we have results
      setIsLoading(false);
      
      // Show toast notification for status updates
      if (result.status === 'completed') {
        toast({
          title: "Scan Completed",
          description: "File scan has been completed",
          variant: "default"
        });
      } else if (result.status === 'scanning') {
        toast({
          title: "Scan In Progress",
          description: "File is being scanned",
          variant: "default"
        });
      }
    };
    
    // Connect to WebSocket and subscribe to scan updates
    const connectToWebSocket = (scanId: string) => {
      // Close existing connection if any
      if (socketRef.current) {
        console.log('Closing existing WebSocket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      console.log('Creating new WebSocket connection for scan ID:', scanId);
      
      // Get the base URL from the current window location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}`;
      
      console.log('WebSocket URL:', wsUrl);
      
      try {
        console.log('Creating Socket.IO connection with URL:', wsUrl);
        
        // Create new connection with explicit options
        const socket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 30000,
          forceNew: true,
          autoConnect: true,
          withCredentials: false,
          path: '/socket.io'
        });
        
        socketRef.current = socket;
        
        // Debug all socket events
        socket.onAny((event, ...args) => {
          console.log(`Socket event '${event}' received:`, args);
        });
        
        // Handle connection events
        socket.on('connect', () => {
          console.log('WebSocket connected with ID:', socket.id);
          setSocketStatus('connected');
          
          // Important: Subscribe to scan updates with the correct scan ID
          console.log('Subscribing to scan updates for scan ID:', scanId);
          socket.emit('subscribe', { scanId: scanId });
          
          // Log socket connection details
          console.log('Socket connection details:', {
            id: socket.id,
            connected: socket.connected,
            disconnected: socket.disconnected
          });
          
          // Listen for subscription confirmation
          socket.on('subscribed', (data: any) => {
            console.log('Subscription confirmed:', data);
            setSocketStatus('connected');
            toast({
              title: "WebSocket Connected",
              description: `Connected to real-time updates! Room size: ${data.roomSize || 1}`,
              variant: "default"
            });
          });

          // Listen for subscription test messages
          socket.on('subscription-test', (data: any) => {
            console.log('Subscription test received:', data);
            toast({
              title: "WebSocket Test",
              description: "WebSocket connection verified with test message",
              variant: "default"
            });
          });

          // Verify subscription by pinging the server
          setTimeout(() => {
            console.log('Sending ping to server...');
            socket.emit('ping', (response: any) => {
              console.log('Ping response:', response);
              if (socketStatus !== 'connected') {
                setSocketStatus('connected');
                toast({
                  title: "WebSocket Connected",
                  description: "Connected to real-time updates!",
                  variant: "default"
                });
              }
            });
          }, 1000);
          
          // Check WebSocket server status via API
          fetch('/api/health/socket')
            .then(res => res.json())
            .then(data => {
              console.log('WebSocket server status:', data);
            })
            .catch(err => {
              console.error('Error checking WebSocket server status:', err);
            });
          
          // Show connection toast
          toast({
            title: "WebSocket Connected",
            description: `Connected with ID: ${socket.id}`,
            variant: "default"
          });
        });
        
        // Handle welcome message
        socket.on('welcome', (data) => {
          console.log('Received welcome message:', data);
        });
        
        // Handle subscription confirmation
        socket.on('subscribed', (data) => {
          console.log('Successfully subscribed to scan:', data);
          toast({
            title: "Subscribed to Updates",
            description: `Subscribed to scan: ${data.scanId}`,
            variant: "default"
          });
        });
        
        // Handle scan updates
        socket.on('scanUpdate', (data) => {
          console.log('Received scan update:', data);
          if (data.scanId === scanId) {
            console.log('Processing scan update for current scan');
            processResults(data.results);
            
            // If scan is completed, close the WebSocket connection
            if (data.status === 'completed') {
              console.log('Scan completed, closing WebSocket connection');
              socket.disconnect();
              socketRef.current = null;
            }
          } else {
            console.log('Received update for different scan ID, ignoring');
          }
        });
        
        // Handle errors
        socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "WebSocket Error",
            description: error.toString(),
            variant: "destructive"
          });
        });
        
        // Handle connection errors
        socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          setSocketStatus('disconnected');
          toast({
            title: "Connection Error",
            description: error.message,
            variant: "destructive"
          });
        });
        
        // Handle disconnection
        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected, reason:', reason);
          setSocketStatus('disconnected');
          
          // Show disconnection toast
          toast({
            title: "WebSocket Disconnected",
            description: `Reason: ${reason}`,
            variant: "destructive"
          });
          
          // Attempt to reconnect if not completed
          if (scanStatus !== 'completed' && reason !== 'io client disconnect') {
            console.log('Attempting to reconnect...');
            setTimeout(() => {
              connectToWebSocket(scanId);
            }, 5000);
          }
        });
        
        // Return the socket instance
        return socket;
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        toast({
          title: "WebSocket Error",
          description: "Failed to create WebSocket connection",
          variant: "destructive"
        });
        return null;
      }
    };
    

    
    const fetchInitialResults = async () => {
      try {
        const scanId = searchParams.get('scanId');
        if (!scanId) {
          toast({
            title: "Error",
            description: "Scan ID is required",
          });
          setIsLoading(false);
          setError("Scan ID is required");
          return;
        }

        console.log('Fetching initial results for scan ID:', scanId);
        
        // Check scan status
        const statusResult = await checkFileScanStatus(scanId);
        console.log('Initial scan status:', statusResult);
        
        // Process the initial results
        processResults(statusResult);
        
        // Always connect to WebSocket for real-time updates
        // This ensures we get updates even if the scan completes after our initial check
        connectToWebSocket(scanId);
        
        // If scan is already completed, we don't need to poll
        if (statusResult.status === 'completed') {
          console.log('Scan already completed, no need for real-time updates');
        } else {
          console.log('Scan in progress, waiting for real-time updates');
        }
      } catch (error) {
        console.error("Error fetching scan results:", error);
        toast({
          title: "Error",
          description: "Failed to fetch scan results",
        });
        setIsLoading(false);
        setError("Failed to fetch scan results");
      }
    };

    fetchInitialResults();
    
    // Cleanup WebSocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [searchParams]);

  const copyToClipboard = (text: string, itemKey: string) => {
    navigator.clipboard.writeText(text);
    
    // Set the copied state for this specific item
    setCopiedItems(prev => ({ ...prev, [itemKey]: true }));
    
    // Show toast notification
    toast({
      title: "Copied to clipboard",
      description: `${itemKey} has been copied to clipboard`,
    });
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedItems(prev => ({ ...prev, [itemKey]: false }));
    }, 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "destructive";
      case "warning":
        return "warning";
      case "safe":
        return "success";
      default:
        return "default";
    }
  };

  // Loading state component with animation
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h3 className="text-xl font-bold">Analyzing File</h3>
          <p className="text-muted-foreground">
            {scanStatus === "pending" && "Waiting for scan to begin..."}
            {scanStatus === "scanning" && "Scanning file with multiple security engines..."}
            {scanStatus === "completed" && "Finalizing results..."}
          </p>
        </motion.div>
      </div>
    )
  }

  // Error state component with animation
  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold">Error Loading Scan Results</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.history.back()}>
            Back to Scan
          </Button>
        </motion.div>
      </div>
    )
  }

  // If scanResult is null after loading is complete, show an error
  if (!scanResult) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold">No Scan Results Available</h3>
          <p className="text-muted-foreground">The scan results could not be loaded or are not available.</p>
          <Button onClick={() => window.history.back()}>
            Back to Scan
          </Button>
        </motion.div>
      </div>
    )
  }

  const fileName = searchParams.get('file');

  const getThreatLevel = () => {
    if (scanResult.stats.malicious > 0) return "critical";
    if (scanResult.stats.suspicious > 0) return "warning";
    return "safe";
  };

  const threatColors = {
    critical: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    safe: "bg-success text-success-foreground"
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl relative">
      {/* Back Button - positioned for better alignment */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleBackClick}
            variant="outline"
            className="flex items-center gap-2 hover:bg-background/80 transition-colors border rounded-md px-3 py-2 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Scanner</span>
          </Button>
        </motion.div>
      </div>
      
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">File Analysis Results</h1>
        

      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {threatLevel !== "safe" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert
              variant={threatLevel === "critical" ? "destructive" : "default"}
              className={cn(
                "border-l-8 shadow-md",
                threatLevel === "critical" ? alertStyles.critical : 
                threatLevel === "warning" ? alertStyles.warning : ""
              )}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  threatLevel === "critical" ? threatLevelColors.critical.bgLight : threatLevelColors.warning.bgLight
                }`}>
                  {threatLevel === "critical" ? (
                    <ShieldAlert className={`h-6 w-6 ${threatLevelColors.critical.text}`} />
                  ) : (
                    <AlertTriangle className={`h-6 w-6 ${threatLevelColors.warning.text}`} />
                  )}
                </div>
                <div>
                  <AlertTitle className={`text-lg ${
                    threatLevel === "critical" ? threatLevelColors.critical.text : threatLevelColors.warning.text
                  }`}>
                    {threatLevel === "critical"
                      ? "Malicious File Detected"
                      : "Suspicious File Detected"}
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-base">
                    {threatLevel === "critical"
                      ? `This file was flagged as malicious by ${scanResult.stats.malicious} security engines. Exercise extreme caution.`
                      : `This file was flagged as suspicious by ${scanResult.stats.suspicious} security engines. Handle with caution.`}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </motion.div>
        )}

        {threatLevel === "safe" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert variant="default" className={cn(
              "border-l-8 shadow-md",
              threatLevel === "safe" ? alertStyles.safe : ""
            )}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${threatLevelColors.safe.bgLight}`}>
                  <Shield className={`h-6 w-6 ${threatLevelColors.safe.text}`} />
                </div>
                <div>
                  <AlertTitle className={`text-lg ${threatLevelColors.safe.text}`}>Clean File</AlertTitle>
                  <AlertDescription className="mt-1 text-base">
                    This file was flagged as clean by all security engines.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className={`${
          threatLevel === "critical" ? threatLevelColors.critical.bgLight :
          threatLevel === "warning" ? threatLevelColors.warning.bgLight :
          threatLevelColors.safe.bgLight
        }`}>
          <CardHeader>
            <CardTitle>File Overview</CardTitle>
            <CardDescription>
              Detailed information about the scanned file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">File Name</span>
                      <span className="font-medium break-all">{scanResult.fileMetadata.name}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">File Type</span>
                      <span className="font-medium">{scanResult.fileMetadata.type || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">File Size</span>
                      <span className="font-medium">
                        {scanResult.fileMetadata.size ? `${scanResult.fileMetadata.size} bytes (${Math.round(parseInt(scanResult.fileMetadata.size) / 1024)} KB)` : "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">Scan Date</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* File Hashes */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">File Hashes</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">SHA-256</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 overflow-x-auto whitespace-nowrap">
                          {scanResult.fileMetadata.sha256}
                        </code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(scanResult.fileMetadata.sha256, "SHA-256 hash")}
                              >
                                {copiedItems["SHA-256 hash"] ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy SHA-256 hash</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">MD5</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 overflow-x-auto whitespace-nowrap">
                          {scanResult.fileMetadata.md5}
                        </code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(scanResult.fileMetadata.md5, "MD5 hash")}
                              >
                                {copiedItems["MD5 hash"] ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy MD5 hash</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">SHA-1</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 overflow-x-auto whitespace-nowrap">
                          {scanResult.fileMetadata.sha1}
                        </code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(scanResult.fileMetadata.sha1, "SHA-1 hash")}
                              >
                                {copiedItems["SHA-1 hash"] ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy SHA-1 hash</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detection Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detection Statistics</CardTitle>
            <CardDescription>
              Analysis results from security engines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Detection Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className="bg-red-100 dark:bg-red-900/30 border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <span className="font-medium">Malicious</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-destructive">{scanResult.stats.malicious}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {Math.round((scanResult.stats.malicious / scanResult.stats.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="bg-amber-100 dark:bg-amber-900/30 border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <span className="font-medium">Suspicious</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-amber-500">{scanResult.stats.suspicious}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {Math.round((scanResult.stats.suspicious / scanResult.stats.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="bg-green-100 dark:bg-green-900/30 border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Clean</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-green-500">{scanResult.stats.harmless}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {Math.round((scanResult.stats.harmless / scanResult.stats.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Card className="bg-gray-100 dark:bg-gray-800/30 border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">Undetected</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-gray-500">{scanResult.stats.undetected}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {Math.round((scanResult.stats.undetected / scanResult.stats.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Add Pie Chart Visualization */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-lg font-medium mb-4">Detection Distribution</h3>
                <div className="w-full max-w-[300px] aspect-square">
                  <Pie 
                    data={{
                      labels: ['Malicious', 'Suspicious', 'Clean', 'Undetected'],
                      datasets: [
                        {
                          data: [
                            scanResult.stats.malicious,
                            scanResult.stats.suspicious,
                            scanResult.stats.harmless,
                            scanResult.stats.undetected
                          ],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',  // Destructive (red) for Malicious
                            'rgba(255, 193, 7, 0.8)', // Warning (amber) for Suspicious
                            'rgba(52, 199, 89, 0.8)',  // Success (green) for Clean
                            'rgba(52, 199, 89, 0.5)'   // Lighter green for Undetected (still considered clean)
                          ],
                          borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(52, 199, 89, 1)',
                            'rgba(52, 199, 89, 0.8)'
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw as number;
                              const percentage = Math.round((value / scanResult.stats.total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col justify-center"
              >
                <h3 className="text-lg font-medium mb-4">Scan Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      Risk Level and Detection Rate
                      <span className={cn(
                        "ml-2 px-2 py-0.5 text-xs font-bold rounded-md text-white",
                        scanResult.stats.malicious > 0 ? "bg-destructive" :
                        scanResult.stats.suspicious > 0 ? "bg-[#FFC107]" : "bg-[#34C759]"
                      )}>
                        {scanResult.stats.malicious > 0 ? "HIGH" :
                         scanResult.stats.suspicious > 0 ? "MEDIUM" : "LOW"}
                      </span>
                    </h4>
                    <div className="relative h-6 w-full bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden">
                      {scanResult.stats.malicious > 0 ? (
                        <div className="absolute top-0 left-0 h-full bg-destructive flex items-center justify-center px-2 text-xs text-white font-medium" 
                             style={{ 
                               width: `${Math.max(Math.round((scanResult.stats.malicious / scanResult.stats.total) * 100), scanResult.stats.malicious > 0 ? 10 : 0)}%`,
                               minWidth: scanResult.stats.malicious > 0 ? '80px' : '0'
                             }}>
                          HIGH RISK
                        </div>
                      ) : scanResult.stats.suspicious > 0 ? (
                        <div className="absolute top-0 left-0 h-full bg-[#FFC107] flex items-center justify-center px-2 text-xs text-white font-medium" 
                             style={{ 
                               width: `${Math.max(Math.round((scanResult.stats.suspicious / scanResult.stats.total) * 100), 10)}%`,
                               minWidth: '80px'
                             }}>
                          MEDIUM RISK
                        </div>
                      ) : (
                        <div className="absolute top-0 left-0 h-full bg-[#34C759] flex items-center justify-start px-2 text-xs text-white font-medium" 
                             style={{ 
                               width: `${scanResult.stats.harmless > 0 ? Math.max(Math.round((scanResult.stats.harmless / scanResult.stats.total) * 100), 10) : 10}%`,
                               minWidth: '80px'
                             }}>
                          LOW RISK
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Malicious</span>
                      <span>Suspicious</span>
                      <span>Clean</span>
                    </div>
                    <div className="mt-3 text-xs p-2 rounded-md border" style={{
                      borderColor: scanResult.stats.malicious > 0 ? 'var(--destructive)' : 
                                  scanResult.stats.suspicious > 0 ? 'var(--warning)' : 'var(--success)',
                      backgroundColor: scanResult.stats.malicious > 0 ? 'rgba(239, 68, 68, 0.1)' : 
                                      scanResult.stats.suspicious > 0 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(52, 199, 89, 0.1)'
                    }}>
                      <div className="flex items-start gap-2">
                        {scanResult.stats.malicious > 0 ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <p className="text-destructive">
                              {scanResult.stats.malicious === 1 
                                ? "This file has been flagged by 1 security engine. Consider this a potential risk and investigate further before using."
                                : `This file has been flagged as malicious by ${scanResult.stats.malicious} security engines. Exercise caution with this file.`
                              }
                            </p>
                          </>
                        ) : scanResult.stats.suspicious > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                            <p className="text-[#FFC107]">This file shows suspicious behavior and should be used with caution. It has been flagged by {scanResult.stats.suspicious} security engines.</p>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-[#34C759] mt-0.5 flex-shrink-0" />
                            <p className="text-[#34C759]">This file appears to be safe based on all security checks. No security engines have flagged this file as malicious or suspicious.</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className={cn(
                        "text-xl font-bold",
                        scanResult.stats.malicious > 0 ? "text-destructive" :
                        scanResult.stats.suspicious > 0 ? "text-[#FFC107]" : "text-[#34C759]"
                      )}>
                        {Math.round(((scanResult.stats.malicious + scanResult.stats.suspicious) / scanResult.stats.total) * 100)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({scanResult.stats.malicious + scanResult.stats.suspicious} / {scanResult.stats.total} engines)
                      </span>
                    </div>
                    {(scanResult.stats.malicious === 0 && scanResult.stats.suspicious === 0) && (
                      <p className="text-xs text-[#34C759] mt-1">
                        All engines report this file as clean or undetected
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6">
              <Progress 
                value={scanResult.stats.harmless / scanResult.stats.total * 100} 
                className="h-5 bg-muted"
                style={{
                  "--progress-background": "linear-gradient(to right, var(--destructive), var(--warning), var(--success))"
                } as React.CSSProperties}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Malicious</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#FFC107]"></div>
                  <span>Suspicious</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#34C759]"></div>
                  <span>Clean</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analysis Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="engines" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engines" className="relative">
              <span className="mr-2">Engine Results</span>
              <div className="flex gap-1">
                {scanResult.stats.malicious > 0 && (
                  <span className="h-3 w-3 rounded-full bg-destructive inline-block" title="Malicious detections"></span>
                )}
                {scanResult.stats.suspicious > 0 && (
                  <span className="h-3 w-3 rounded-full bg-[#FFC107] inline-block" title="Suspicious detections"></span>
                )}
                {(scanResult.stats.harmless > 0 || scanResult.stats.undetected > 0) && (
                  <span className="h-3 w-3 rounded-full bg-[#34C759] inline-block" title="Clean/Undetected"></span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="signatures" className="relative">
              <span className="mr-2">Threat Signatures</span>
              {scanResult.signatures && scanResult.signatures.length > 0 && (
                <span className="h-3 w-3 rounded-full bg-destructive inline-block" title="Threats detected"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="metadata">File Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="engines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Engine Results</CardTitle>
                <CardDescription>
                  Analysis results from multiple security engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanResult.lastAnalysisResults && scanResult.lastAnalysisResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scanResult.lastAnalysisResults.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          <Card className={`h-full ${
                            result.category === "malicious" ? threatLevelColors.critical.bg :
                            result.category === "suspicious" ? threatLevelColors.warning.bg :
                            result.category === "clean" ? threatLevelColors.safe.bg :
                            "bg-muted/10"
                          }`}>
                            <CardContent className="p-3">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">{result.engine}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Badge
                                        variant={
                                          result.category === "malicious"
                                            ? "destructive"
                                            : result.category === "suspicious"
                                            ? "outline"
                                            : result.category === "harmless"
                                            ? "secondary"
                                            : "default"
                                        }
                                        className={cn(
                                          "text-xs py-0",
                                          result.category === "malicious"
                                            ? "bg-destructive text-white border-destructive"
                                            : result.category === "suspicious"
                                            ? "bg-[#FFC107] text-white border-[#FFC107]"
                                            : result.category === "harmless"
                                            ? "bg-[#34C759] text-white border-[#34C759]"
                                            : "bg-[#34C759]/40 text-[#34C759] border-[#34C759]/40"
                                        )}
                                      >
                                        {result.category === "malicious" ? "Malicious" : 
                                         result.category === "suspicious" ? "Suspicious" : 
                                         result.category === "harmless" ? "Clean" : "Undetected"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {result.category === "malicious" && (
                                      <div className="text-destructive flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                      </div>
                                    )}
                                    {result.category === "suspicious" && (
                                      <div className="text-[#FFC107] flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                      </div>
                                    )}
                                    {result.category === "harmless" && (
                                      <div className="text-[#34C759] flex items-center gap-1">
                                        <Check className="h-4 w-4" />
                                      </div>
                                    )}
                                    {result.category === "undetected" && (
                                      <div className="text-[#34C759]/80 flex items-center gap-1">
                                        <HelpCircle className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {result.result && result.result !== result.category && (
                                  <div className="text-xs text-muted-foreground">
                                    {result.result}
                                  </div>
                                )}
                                {result.method && (
                                  <div className="text-xs text-muted-foreground">
                                    Method: {result.method}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No engine results available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Threat Signatures</CardTitle>
                <CardDescription>
                  Identified threat signatures and behaviors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanResult.signatures && scanResult.signatures.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scanResult.signatures.map((signature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          <Card className={`border-l-4 ${threatLevelColors.critical.border} ${threatLevelColors.critical.bgLight}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    <h4 className="font-medium">{signature.type || "Unknown Threat"}</h4>
                                  </div>
                                  <Badge variant={getBadgeVariantBySeverity(signature.severity)} className={`${
                                    signature.severity?.toLowerCase() === "high" || signature.severity?.toLowerCase() === "critical" 
                                      ? threatLevelColors.critical.bg
                                      : signature.severity?.toLowerCase() === "medium" || signature.severity?.toLowerCase() === "warning"
                                      ? threatLevelColors.warning.bg
                                      : "bg-muted/10"
                                  }`}>
                                    {signature.severity || "Unknown"}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">
                                  {signature.description || "This signature indicates potentially malicious behavior in the file."}
                                </div>
                                
                                {signature.details && (
                                  <div className="bg-muted/30 p-3 rounded-md text-xs font-mono overflow-x-auto">
                                    <pre className="whitespace-pre-wrap">{signature.details}</pre>
                                  </div>
                                )}
                                
                                {signature.mitre && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="secondary" className="bg-background">MITRE ATT&CK</Badge>
                                    <span>{signature.mitre}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Security Alert</AlertTitle>
                        <AlertDescription>
                          This file contains {scanResult.signatures.length} identified threat signature{scanResult.signatures.length > 1 ? 's' : ''}. 
                          Exercise caution when handling this file.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-[#34C759]/10 p-3 mb-4">
                      <Check className="h-6 w-6 text-[#34C759]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#34C759] mb-2">No threat signatures detected</h3>
                    <p className="text-muted-foreground max-w-md">
                      No malicious behaviors or threat signatures were identified in this file. 
                      However, always exercise caution when handling files from unknown sources.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Details</CardTitle>
                <CardDescription>
                  Technical information about the scanned file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Basic Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">File Name</div>
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{scanResult.fileMetadata.name}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(scanResult.fileMetadata.name, "File name")}
                                >
                                  {copiedItems["File name"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">File Type</div>
                              <div className="font-medium">{scanResult.fileMetadata.type || "Unknown"}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">File Size</div>
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {scanResult.fileMetadata.size ? `${scanResult.fileMetadata.size} bytes (${Math.round(parseInt(scanResult.fileMetadata.size) / 1024)} KB)` : "Unknown"}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-2"
                                  onClick={() => copyToClipboard(scanResult.fileMetadata.size, "File size")}
                                >
                                  {copiedItems["File size"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    {/* File Timestamps */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Timestamps</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">First Seen</div>
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {scanResult.fileMetadata.firstSeen 
                                    ? new Date(scanResult.fileMetadata.firstSeen).toLocaleString() 
                                    : "Unknown"}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(
                                    scanResult.fileMetadata.firstSeen 
                                      ? new Date(scanResult.fileMetadata.firstSeen).toLocaleString() 
                                      : "Unknown", 
                                    "First seen date"
                                  )}
                                >
                                  {copiedItems["First seen date"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Last Seen</div>
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {scanResult.fileMetadata.lastSeen 
                                    ? new Date(scanResult.fileMetadata.lastSeen).toLocaleString() 
                                    : "Unknown"}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(
                                    scanResult.fileMetadata.lastSeen 
                                      ? new Date(scanResult.fileMetadata.lastSeen).toLocaleString() 
                                      : "Unknown", 
                                    "Last seen date"
                                  )}
                                >
                                  {copiedItems["Last seen date"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Last Analysis</div>
                              <div className="font-medium">
                                {scanResult.fileMetadata.createdAt ? new Date(scanResult.fileMetadata.createdAt).toLocaleString() : "Unknown"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  
                  {/* File Hashes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Cryptographic Hashes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {scanResult.fileMetadata.md5 && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">MD5</div>
                              <div className="flex items-center justify-between">
                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
                                  {scanResult.fileMetadata.md5}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-2"
                                  onClick={() => copyToClipboard(scanResult.fileMetadata.md5, "MD5 hash")}
                                >
                                  {copiedItems["MD5 hash"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {scanResult.fileMetadata.sha1 && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">SHA-1</div>
                              <div className="flex items-center justify-between">
                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
                                  {scanResult.fileMetadata.sha1}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-2"
                                  onClick={() => copyToClipboard(scanResult.fileMetadata.sha1, "SHA-1 hash")}
                                >
                                  {copiedItems["SHA-1 hash"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {scanResult.fileMetadata.sha256 && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">SHA-256</div>
                              <div className="flex items-center justify-between">
                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
                                  {scanResult.fileMetadata.sha256}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-2"
                                  onClick={() => copyToClipboard(scanResult.fileMetadata.sha256, "SHA-256 hash")}
                                >
                                  {copiedItems["SHA-256 hash"] ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Additional Metadata */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">File Extension</div>
                            <div className="font-medium">
                              {scanResult.fileMetadata.type.split('/').pop() || "Unknown"}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">MIME Type</div>
                            <div className="font-medium">
                              {scanResult.fileMetadata.type || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
