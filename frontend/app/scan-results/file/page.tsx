"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { AlertTriangle, Check, Copy, File, FileCode, FileText, Image, Shield, ShieldAlert, Video } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedDonut } from "@/components/ui/animated-donut"
import { cn } from "@/lib/utils"

interface FileMetadata {
  name: string;
  type: string;
  size: string;
  sha256: string;
  md5: string;
  firstSeen: string;
  lastSeen: string;
  createdAt?: string;
  lastModified?: string;
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

export default function FileScanResults() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [threatLevel, setThreatLevel] = useState<string>("safe");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Simulated API response
        const mockResult: ScanResult = {
          fileMetadata: {
            name: "test_file.exe",
            type: "application/x-msdownload",
            size: "1024576", // 1MB
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            md5: "d41d8cd98f00b204e9800998ecf8427e",
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          },
          stats: {
            malicious: 3,
            suspicious: 2,
            harmless: 45,
            undetected: 10,
            total: 60,
          },
          lastAnalysisResults: [
            { 
              engine: "Security Engine 1", 
              category: "malicious", 
              result: "trojan",
              method: "signature-based",
              engineVersion: "1.0.0",
              engineUpdate: new Date().toISOString(),
              signatureName: "Win32.Trojan.Generic"
            },
            { 
              engine: "Security Engine 2", 
              category: "clean", 
              result: "clean", 
              method: "behavioral",
              engineVersion: "2.0.0",
              engineUpdate: new Date().toISOString()
            },
          ],
          signatures: [
            {
              type: "Malware",
              description: "Detected malware pattern",
              severity: "High",
              name: "Win32.Trojan.Generic",
              family: "Trojan",
            }
          ],
          reputation: -35,
        };

        setScanResult(mockResult);
        
        // Determine threat level
        if (mockResult.stats.malicious > 0) {
          setThreatLevel("critical");
        } else if (mockResult.stats.suspicious > 0) {
          setThreatLevel("warning");
        } else {
          setThreatLevel("safe");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching scan results:", error);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
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

  if (isLoading || !scanResult) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="container mx-auto p-4 space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">File Analysis Results</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Scan
        </Button>
      </div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert 
          variant={getRiskColor(threatLevel)}
          className={cn(
            "relative overflow-hidden",
            threatLevel === "critical" && "animate-pulse-subtle"
          )}
        >
          {threatLevel === "critical" && (
            <motion.div
              className="absolute inset-0 bg-destructive/20"
              animate={{
                opacity: [0.2, 0.3, 0.2],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          {threatLevel === "critical" ? (
            <ShieldAlert className="size-5" />
          ) : threatLevel === "warning" ? (
            <AlertTriangle className="size-5" />
          ) : (
            <Shield className="size-5" />
          )}
          <AlertTitle className="font-semibold">
            {threatLevel === "critical" 
              ? "High Risk Detected" 
              : threatLevel === "warning"
              ? "Suspicious File"
              : "Clean File"}
          </AlertTitle>
          <AlertDescription>
            This file was flagged as {threatLevel} risk by our security engines.
            {threatLevel === "critical" && " Immediate action recommended."}
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* File Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getFileIcon(scanResult.fileMetadata.type)}
              File Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><strong>Name:</strong> {scanResult.fileMetadata.name}</p>
              <p><strong>Size:</strong> {scanResult.fileMetadata.size}</p>
              <p><strong>Type:</strong> {scanResult.fileMetadata.type}</p>
              <p><strong>Scan Date:</strong> {new Date().toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p><strong>SHA-256:</strong></p>
                <TooltipProvider>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded bg-muted text-xs">
                        {scanResult.fileMetadata.sha256}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyHash(scanResult.fileMetadata.sha256)}
                          >
                            <Copy className={cn(
                              "size-4",
                              copiedHash === scanResult.fileMetadata.sha256 && "text-green-500"
                            )} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedHash === scanResult.fileMetadata.sha256 ? "Copied!" : "Copy hash"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <p><strong>MD5:</strong></p>
                <TooltipProvider>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded bg-muted text-xs">
                        {scanResult.fileMetadata.md5}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyHash(scanResult.fileMetadata.md5)}
                          >
                            <Copy className={cn(
                              "size-4",
                              copiedHash === scanResult.fileMetadata.md5 && "text-green-500"
                            )} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedHash === scanResult.fileMetadata.md5 ? "Copied!" : "Copy hash"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detection Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Detection Statistics</CardTitle>
            <CardDescription>
              Analysis results from multiple security engines
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <AnimatedDonut stats={scanResult.stats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              Summary of detection results and threat indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Detection Ratio</span>
                <Badge
                  variant={threatLevel === "critical" ? "destructive" : threatLevel === "warning" ? "secondary" : "default"}
                >
                  {threatLevel === "critical" ? "High" : threatLevel === "warning" ? "Medium" : "Low"}
                </Badge>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    "absolute h-full rounded-full",
                    threatLevel === "critical" 
                      ? "bg-destructive" 
                      : threatLevel === "warning"
                      ? "bg-warning"
                      : "bg-success"
                  )}
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: `${((scanResult.stats.malicious + scanResult.stats.suspicious) / scanResult.stats.total) * 100}%` 
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{scanResult.stats.malicious + scanResult.stats.suspicious} detections</span>
                <span>{scanResult.stats.total} engines</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-destructive" />
                    <span className="text-sm font-medium">Malicious</span>
                  </div>
                  <p className="text-2xl font-bold">{scanResult.stats.malicious}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-warning" />
                    <span className="text-sm font-medium">Suspicious</span>
                  </div>
                  <p className="text-2xl font-bold">{scanResult.stats.suspicious}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">Clean</span>
                  </div>
                  <p className="text-2xl font-bold">{scanResult.stats.harmless}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-muted" />
                    <span className="text-sm font-medium">Undetected</span>
                  </div>
                  <p className="text-2xl font-bold">{scanResult.stats.undetected}</p>
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
            <TabsTrigger value="engines">Engine Results</TabsTrigger>
            <TabsTrigger value="signatures">Threat Signatures</TabsTrigger>
            <TabsTrigger value="metadata">File Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="engines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Engine Results</CardTitle>
                <CardDescription>
                  Detailed analysis from multiple security engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanResult.lastAnalysisResults.map((result, index) => (
                    <motion.div
                      key={result.engine}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{result.engine}</span>
                                <Badge
                                  variant={
                                    result.category === "malicious"
                                      ? "destructive"
                                      : result.category === "suspicious"
                                      ? "secondary"
                                      : "default"
                                  }
                                >
                                  {result.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{result.result}</p>
                              <p className="text-sm text-muted-foreground">Method: {result.method}</p>
                              <p className="text-sm text-muted-foreground">Engine Version: {result.engineVersion}</p>
                              <p className="text-sm text-muted-foreground">Engine Update: {new Date(result.engineUpdate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Identified Threat Signatures</CardTitle>
                <CardDescription>
                  Detected malware patterns and behaviors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanResult.signatures.map((signature, index) => (
                    <motion.div
                      key={`${signature.type}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold capitalize">{signature.type}</span>
                                <Badge
                                  variant={
                                    signature.severity === "high"
                                      ? "destructive"
                                      : signature.severity === "medium"
                                      ? "secondary"
                                      : "default"
                                  }
                                >
                                  {signature.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{signature.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Extended File Information</CardTitle>
                <CardDescription>
                  Detailed technical information about the file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">File Details</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Name</dt>
                          <dd className="font-medium">{scanResult.fileMetadata.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type</dt>
                          <dd className="font-medium">{scanResult.fileMetadata.type}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Size</dt>
                          <dd className="font-medium">{scanResult.fileMetadata.size}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Analysis Timeline</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">First Seen</dt>
                          <dd className="font-medium">
                            {new Date(scanResult.fileMetadata.firstSeen).toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Last Seen</dt>
                          <dd className="font-medium">
                            {new Date(scanResult.fileMetadata.lastSeen).toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
