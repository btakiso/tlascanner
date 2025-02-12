"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ShieldAlert, Globe, Link2, AlertTriangle, CheckCircle, AlertOctagon, Info, Users, HelpCircle, Tag, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
);

interface EngineResult {
  engine: string;
  category: string;
  result: string;
}

interface CommunityReport {
  user: string;
  avatar: string;
  comment: string;
  date: string;
  votes: number;
}

interface CommunityFeedback {
  reports: CommunityReport[];
  totalReports: number;
  riskScore: number;
}

interface ScanStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

interface ScanResult {
  url: string;
  scanDate: string;
  stats: ScanStats;
  lastAnalysisResults: EngineResult[];
  categories: string[];
  lastHttpResponse: number;
  reputation: number;
  communityFeedback: CommunityFeedback;
}

export default function URLScanResults() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  const targetUrl = searchParams.get('target');

  useEffect(() => {
    const fetchScanResults = async () => {
      setIsLoading(true);
      try {
        // Simulated scan result data
        const mockResult: ScanResult = {
          url: targetUrl || "https://example.com",
          scanDate: new Date().toISOString(),
          stats: {
            malicious: 2,
            suspicious: 1,
            harmless: 50,
            undetected: 7,
          },
          lastAnalysisResults: [
            { engine: "Security Engine 1", category: "malicious", result: "phishing" },
            { engine: "Security Engine 2", category: "clean", result: "clean" },
          ],
          categories: ["phishing", "malware"],
          lastHttpResponse: 200,
          reputation: -25,
          communityFeedback: {
            reports: [
              {
                user: "SecurityAnalyst",
                avatar: "/avatars/analyst1.png",
                comment: "This URL exhibits characteristics of a phishing attempt targeting financial institutions.",
                date: "2024-02-10T15:30:00Z",
                votes: 12
              },
              {
                user: "ThreatHunter",
                avatar: "/avatars/hunter1.png",
                comment: "Domain was registered recently and uses suspicious redirects.",
                date: "2024-02-09T18:45:00Z",
                votes: 8
              }
            ],
            totalReports: 15,
            riskScore: 75
          }
        };

        await new Promise(resolve => setTimeout(resolve, 1000));
        setScanResult(mockResult);
      } catch (error) {
        console.error('Error loading scan results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (targetUrl) {
      fetchScanResults();
    }
  }, [targetUrl]);

  if (!targetUrl) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No URL provided for analysis.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3 mx-auto"></div>
          <div className="h-32 bg-secondary rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load analysis results.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getThreatLevel = (stats: ScanStats) => {
    if (stats.malicious > 0) return "high";
    if (stats.suspicious > 0) return "medium";
    return "low";
  };

  const getThreatScore = (stats: ScanStats) => {
    const total = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
    const threatScore = ((stats.malicious * 1.0 + stats.suspicious * 0.5) / total) * 100;
    return Math.round(threatScore);
  };

  const threatLevel = getThreatLevel(scanResult.stats);

  // Animation variants for elements
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  const chartData = {
    labels: ['Malicious', 'Suspicious', 'Harmless', 'Undetected'],
    datasets: [
      {
        data: [
          scanResult.stats.malicious,
          scanResult.stats.suspicious,
          scanResult.stats.harmless,
          scanResult.stats.undetected
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',  // red
          'rgba(245, 158, 11, 0.5)', // yellow
          'rgba(16, 185, 129, 0.5)', // green
          'rgba(107, 114, 128, 0.5)' // gray
        ],
        borderColor: [
          'rgb(239, 68, 68)',  // red
          'rgb(245, 158, 11)', // yellow
          'rgb(16, 185, 129)', // green
          'rgb(107, 114, 128)' // gray
        ],
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 40,
      }
    ]
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          stepSize: 10
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            return `Count: ${context.raw}`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Threat Alert Section */}
        <AnimatePresence>
          {threatLevel === "high" && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
            >
              <Alert variant="destructive" className="relative overflow-hidden bg-destructive/10 border-2 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
                <motion.div
                  className="absolute inset-0 bg-destructive/5"
                  animate={pulseAnimation}
                />
                <AlertOctagon className="h-4 w-4" />
                <AlertTitle>High Risk Detected!</AlertTitle>
                <AlertDescription>
                  This URL has been flagged as potentially dangerous by multiple security engines. Exercise extreme caution.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section with Threat Score */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col md:flex-row items-center justify-between gap-4 bg-background/10 p-6 rounded-lg border-2 border-border/50 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
        >
          <h1 className="text-4xl font-bold tracking-tight">URL Analysis Results</h1>
          <div className="flex items-center gap-4">
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl font-bold">{getThreatScore(scanResult.stats)}%</div>
                </div>
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    className="text-gray-300"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-red-500"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - getThreatScore(scanResult.stats) / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="48"
                    cy="48"
                  />
                </svg>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Threat Score</div>
            </motion.div>
            
            <motion.div animate={threatLevel === "high" ? pulseAnimation : {}}>
              <Badge 
                variant={threatLevel === "high" ? "destructive" : threatLevel === "medium" ? "secondary" : "default"}
                className="text-lg py-1 px-4"
              >
                {threatLevel.toUpperCase()} RISK
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* URL Info Card with Radar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="md:col-span-2"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-2 border-border/50 bg-background/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Analyzed URL
                </CardTitle>
                <CardDescription>
                  Analyzed on {new Date(scanResult.scanDate).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-mono bg-secondary/10 p-4 rounded-lg border-2 border-border/50 shadow-inner">
                  <Link2 className="h-5 w-5" />
                  {scanResult.url}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-1"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-2 border-border/50 bg-background/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Threat Distribution
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Distribution of security engine verdicts</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px] flex items-center justify-center p-4 bg-card/50 rounded-lg border-2 border-border/50 shadow-inner">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Card className="border-2 border-red-500/30 bg-background/10 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-500 flex items-center gap-2">
                        <ShieldAlert />
                        Malicious
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{scanResult.stats.malicious}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of engines that detected malicious behavior</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </TooltipProvider>

          <TooltipProvider>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Card className="border-2 border-yellow-500/30 bg-background/10 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-yellow-500 flex items-center gap-2">
                        <AlertTriangle />
                        Suspicious
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{scanResult.stats.suspicious}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of engines that detected suspicious behavior</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </TooltipProvider>

          <TooltipProvider>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Card className="border-2 border-green-500/30 bg-background/10 hover:border-green-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-500 flex items-center gap-2">
                        <CheckCircle />
                        Harmless
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{scanResult.stats.harmless}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of engines that detected harmless behavior</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </TooltipProvider>

          <TooltipProvider>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Card className="border-2 border-gray-500/30 bg-background/10 hover:border-gray-500 hover:shadow-[0_0_20px_rgba(107,114,128,0.2)] transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-gray-500 flex items-center gap-2">
                        <Shield />
                        Undetected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{scanResult.stats.undetected}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of engines that did not detect any threats</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </TooltipProvider>
        </div>

        {/* Detailed Analysis Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="w-full">
          <Tabs defaultValue="engines" className="w-full">
            <TabsList className="flex w-full gap-2 !bg-transparent !p-0">
              <TabsTrigger 
                value="engines" 
                className="flex-1 border border-border/50 hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:bg-primary/10 rounded-xl py-4 px-6 transition-all duration-300 !shadow-none"
              >
                <div className="flex items-center justify-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span className="text-base font-semibold">Engine Results</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="categories"
                className="flex-1 border border-border/50 hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:bg-primary/10 rounded-xl py-4 px-6 transition-all duration-300 !shadow-none"
              >
                <div className="flex items-center justify-center gap-3">
                  <Tag className="h-5 w-5" />
                  <span className="text-base font-semibold">Categories</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="details"
                className="flex-1 border border-border/50 hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:bg-primary/10 rounded-xl py-4 px-6 transition-all duration-300 !shadow-none"
              >
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span className="text-base font-semibold">Technical Details</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="community"
                className="flex-1 border border-border/50 hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:bg-primary/10 rounded-xl py-4 px-6 transition-all duration-300 !shadow-none"
              >
                <div className="flex items-center justify-center gap-3">
                  <Users className="h-5 w-5" />
                  <span className="text-base font-semibold">Community</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="engines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="engines">
                  <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Engine Results
                      </CardTitle>
                      <CardDescription>Analysis from multiple security engines</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {scanResult.lastAnalysisResults.map((result: EngineResult, index: number) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300",
                              result.category === "malicious" 
                                ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50" 
                                : result.category === "suspicious"
                                ? "bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50"
                                : result.category === "harmless"
                                ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                                : "bg-gray-500/5 border-gray-500/30 hover:border-gray-500/50"
                            )}
                          >
                            <div className="font-medium">{result.engine}</div>
                            <Badge 
                              variant={result.category === "malicious" ? "destructive" : "default"}
                              className={cn(
                                "font-semibold",
                                result.category === "malicious" && "bg-red-500/20 text-red-500 hover:bg-red-500/30",
                                result.category === "suspicious" && "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
                                result.category === "harmless" && "bg-green-500/20 text-green-500 hover:bg-green-500/30",
                                result.category === "undetected" && "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
                              )}
                            >
                              {result.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>

              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="categories">
                  <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Threat Categories
                      </CardTitle>
                      <CardDescription>Identified threat categories for this URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {scanResult.categories.map((category, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300"
                          >
                            <h3 className="font-semibold text-primary">{category}</h3>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>

              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="details">
                  <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Technical Details
                      </CardTitle>
                      <CardDescription>Additional technical information about the URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                          <div className="font-medium text-muted-foreground mb-1">Last Analysis Date</div>
                          <div className="font-mono">{new Date(scanResult.scanDate).toLocaleString()}</div>
                        </div>
                        <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                          <div className="font-medium text-muted-foreground mb-1">Total Engines</div>
                          <div className="font-mono">{scanResult.lastAnalysisResults.length}</div>
                        </div>
                        <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                          <div className="font-medium text-muted-foreground mb-1">Analysis Status</div>
                          <div className="font-mono">{scanResult.stats.malicious > 0 ? "Malicious" : "Clean"}</div>
                        </div>
                        {scanResult.lastHttpResponse && (
                          <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                            <div className="font-medium text-muted-foreground mb-1">HTTP Response</div>
                            <div className="font-mono">{scanResult.lastHttpResponse}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>

              <motion.div
                key="community"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="community">
                  <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Community Feedback
                      </CardTitle>
                      <CardDescription>Community votes and reports for this URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Community Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                            <p className="text-sm text-muted-foreground">Total Reports</p>
                            <p className="text-2xl font-bold">{scanResult.communityFeedback.totalReports}</p>
                          </div>
                          <div className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                            <p className="text-sm text-muted-foreground">Community Score</p>
                            <p className="text-2xl font-bold">{scanResult.communityFeedback.riskScore}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
