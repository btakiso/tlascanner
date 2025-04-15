"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, ShieldAlert, Globe, Link2, AlertTriangle, CheckCircle, AlertOctagon, Info, Users, HelpCircle, Tag, FileText, Clock, Activity, Star, ThumbsUp, MessageSquare, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { config } from "@/app/config";
import { ThreatLevel, BaseScanStats } from "@/types/common";
import { URLScanResponse, CommunityComment } from "@/types/urlScan";
import { ScanType, ScanStatus, DataSource } from "@/types/security";
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

type VendorCategory = 'malicious' | 'suspicious' | 'harmless' | 'undetected';
type BadgeVariant = "destructive" | "secondary" | "default" | "outline";
type SortOrder = 'threat' | 'name' | 'updated';

interface Vendor {
  name: string;
  category: VendorCategory;
  result: string;
  method?: string;
  update?: string;
}

interface VendorFilters {
  category: 'all' | VendorCategory;
  search: string;
  sortOrder: SortOrder;
}

function URLScanResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState<URLScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorFilters, setVendorFilters] = useState<VendorFilters>({
    category: 'all',
    search: '',
    sortOrder: 'threat'
  });
  
  const scanId = searchParams.get('scanId');

  const [isPending, setIsPending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const handleBackClick = () => {
    router.push('/#url-scanner');
  };

  useEffect(() => {
    const fetchScanResults = async () => {
      if (!scanId) return;
      
      setIsLoading(true);
      setError(null);
      setIsPending(false);
      
      try {
        const response = await fetch(`${config.API_URL}${config.SCAN_ENDPOINTS.RESULTS.URL}/${scanId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scan results');
        }

        const data: URLScanResponse = await response.json();
        
        if (data.status === 'success' && data.data?.scanId && data.data?.url) {
          setScanResult(data);
          setIsPending(false);
        } else if (data.status === 'pending') {
          setScanResult(data);
          setIsPending(true);
          // Set a timeout to retry after 10 seconds
          setTimeout(() => setRetryCount(prev => prev + 1), 10000);
        } else {
          throw new Error('Invalid scan result format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching scan results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScanResults();
  }, [scanId, retryCount]); // Add retryCount to dependencies to trigger re-fetch

  const getThreatOrder = (category: string): number => {
    const threatOrder: Record<VendorCategory, number> = {
      malicious: 4,
      suspicious: 3,
      harmless: 2,
      undetected: 1
    };
    return threatOrder[category.toLowerCase() as VendorCategory] || 0;
  };

  const getFilteredVendors = (results: Record<string, any>): Vendor[] => {
    let vendors: Vendor[] = Object.entries(results).map(([name, data]) => ({
      name,
      category: (data.category || '').toLowerCase() as VendorCategory,
      result: data.result || '',
      method: data.method,
      update: data.update
    }));

    // Apply category filter
    if (vendorFilters.category !== 'all') {
      vendors = vendors.filter(v => v.category === vendorFilters.category);
    }

    // Apply search filter
    if (vendorFilters.search) {
      const searchLower = vendorFilters.search.toLowerCase();
      vendors = vendors.filter(v => 
        v.name.toLowerCase().includes(searchLower) ||
        v.result.toLowerCase().includes(searchLower) ||
        v.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    return vendors.sort((a, b) => {
      switch (vendorFilters.sortOrder) {
        case 'threat':
          return getThreatOrder(b.category) - getThreatOrder(a.category);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return (b.update || '').localeCompare(a.update || '');
        default:
          return 0;
      }
    });
  };

  const getCategoryBadgeStyle = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'malicious':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'suspicious':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'harmless':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getVendorCardStyle = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'malicious':
        return 'border-red-500/50 bg-red-50/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      case 'suspicious':
        return 'border-yellow-500/50 bg-yellow-50/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
      case 'harmless':
        return 'border-green-500/50 bg-green-50/10';
      default:
        return 'border-gray-500/50 bg-gray-50/10';
    }
  };

  const getThreatLevel = (stats: BaseScanStats | undefined): ThreatLevel => {
    if (!stats) return "low";
    if (stats.malicious > 0) return "high";
    if (stats.suspicious > 0) return "medium";
    return "low";
  };

  const getThreatScore = (stats: BaseScanStats | undefined): number => {
    if (!stats) return 0;
    const total = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
    if (total === 0) return 0;  // Handle case when all stats are 0
    const threatScore = ((stats.malicious * 1.0 + stats.suspicious * 0.5) / total) * 100;
    return Math.round(threatScore);
  };

  const threatLevel = getThreatLevel(scanResult?.data?.stats);
  const threatScore = getThreatScore(scanResult?.data?.stats);

  // Animation variants
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

  const defaultAnimation = {
    initial: { scale: 1 },
    animate: { scale: 1 }
  };

  const chartData = {
    labels: ['Malicious', 'Suspicious', 'Clean', 'Undetected'],
    datasets: [
      {
        label: 'Scan Results',
        data: scanResult?.data?.stats ? [
          scanResult.data.stats.malicious,
          scanResult.data.stats.suspicious,
          scanResult.data.stats.harmless,
          scanResult.data.stats.undetected
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',  // red for malicious
          'rgba(234, 179, 8, 0.5)',   // yellow for suspicious
          'rgba(34, 197, 94, 0.5)',   // green for clean
          'rgba(148, 163, 184, 0.5)'  // slate for undetected
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(148, 163, 184)'
        ],
        borderWidth: 1,
      },
    ],
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

  // Helper function to process vendor results
  const processVendorResults = (lastAnalysisResults: Record<string, { category: string; result: string; method: string; engine_name: string; }>) => {
    return Object.entries(lastAnalysisResults)
      .filter(([_, result]) => result.result && result.result !== 'clean' && result.result !== 'unrated')
      .map(([vendor, result]) => ({
        vendor: result.engine_name || vendor,
        result: result.result,
        method: result.method,
        category: result.category
      }))
      .sort((a, b) => {
        // Sort by category severity first
        const severityOrder = { malicious: 0, suspicious: 1, phishing: 2, spam: 3, advertisements: 4 };
        const aOrder = severityOrder[a.category.toLowerCase() as keyof typeof severityOrder] ?? 999;
        const bOrder = severityOrder[b.category.toLowerCase() as keyof typeof severityOrder] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Then sort alphabetically by vendor name
        return a.vendor.localeCompare(b.vendor);
      });
  };

  // Early return for no scan ID
  if (!scanId) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No scan ID provided for analysis.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
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

  // Error state
  if (error || !scanResult) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Failed to load analysis results.'}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Pending state
  if (isPending && scanResult) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              URL Scan In Progress
            </CardTitle>
            <CardDescription>
              Scanning: {scanResult.data.url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <AlertTitle>Scan is still processing</AlertTitle>
              <AlertDescription>
                {scanResult.data.message || 'Your URL scan is currently being processed by VirusTotal. This can take a few minutes for new URLs.'}
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Automatically checking for results every 10 seconds...</span>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-medium mb-2">Why does this happen?</h3>
                <p className="text-muted-foreground text-sm">
                  When scanning a URL that hasn't been analyzed before, VirusTotal needs time to process it through multiple security engines. 
                  This typically takes 1-3 minutes, but can be longer for complex websites.
                </p>
              </div>
              
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Check Now
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
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
        
        {/* Threat Alert Section */}
        <AnimatePresence mode="sync">
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
                  <div className="text-3xl font-bold">{threatScore}%</div>
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
                    cx="48"
                    cy="48"
                    r="45"
                    className="text-red-500"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - threatScore / 100)}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Threat Score</div>
            </motion.div>
            
            <motion.div 
              animate={threatLevel === "high" ? pulseAnimation.animate : defaultAnimation.animate}
              initial={threatLevel === "high" ? pulseAnimation.initial : defaultAnimation.initial}
            >
              <Badge 
                variant={threatLevel === "high" ? "destructive" : threatLevel === "medium" ? "secondary" : "default"}
                className="text-lg py-1 px-4"
              >
                {threatLevel.toUpperCase()} RISK
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* URL Info Card with Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="md:col-span-2"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Analyzed URL
                </CardTitle>
                <CardDescription>
                  Currently analyzing {scanResult.data.domain}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-mono bg-secondary/10 p-4 rounded-lg border-2 border-border/50 shadow-inner">
                  <Link2 className="h-5 w-5" />
                  {scanResult.data.url}
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
            <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Threat Distribution
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
                      <p className="text-3xl font-bold">{scanResult.data.stats.malicious}</p>
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
                      <p className="text-3xl font-bold">{scanResult.data.stats.suspicious}</p>
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
                      <p className="text-3xl font-bold">{scanResult.data.stats.harmless}</p>
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
                      <p className="text-3xl font-bold">{scanResult.data.stats.undetected}</p>
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

        {/* Analysis Results Section */}
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
            
            <AnimatePresence mode="sync">
              <motion.div
                key="engines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="engines">
                  <motion.div
                    key="engines"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-2 border-border/50 bg-background/10 mt-6 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Security Engines
                        </CardTitle>
                        <CardDescription>Analysis results from various security vendors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Vendor Results Section */}
                          <div className="space-y-4">
                            <Card className="col-span-full">
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                      <select
                                        className="px-3 py-2 rounded-md border bg-background text-sm"
                                        value={vendorFilters.category}
                                        onChange={(e) => setVendorFilters(prev => ({ ...prev, category: e.target.value as any }))}
                                      >
                                        <option value="all">All Categories</option>
                                        <option value="malicious">Malicious</option>
                                        <option value="suspicious">Suspicious</option>
                                        <option value="harmless">Harmless</option>
                                        <option value="undetected">Undetected</option>
                                      </select>
                                      
                                      <select
                                        className="px-3 py-2 rounded-md border bg-background text-sm"
                                        value={vendorFilters.sortOrder}
                                        onChange={(e) => setVendorFilters(prev => ({ ...prev, sortOrder: e.target.value as SortOrder }))}
                                      >
                                        <option value="threat">Sort by Risk Level</option>
                                        <option value="name">Sort by Name</option>
                                        <option value="updated">Sort by Last Updated</option>
                                      </select>

                                      <input
                                        type="text"
                                        placeholder="Search vendors..."
                                        className="px-3 py-2 rounded-md border bg-background text-sm"
                                        value={vendorFilters.search}
                                        onChange={(e) => setVendorFilters(prev => ({ ...prev, search: e.target.value }))}
                                      />
                                    </div>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <AnimatePresence mode="popLayout">
                                    {getFilteredVendors(scanResult.data.lastAnalysisResults).map((vendor) => (
                                      <motion.div
                                        key={vendor.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                          "p-4 rounded-lg border hover:shadow-lg transition-shadow",
                                          getVendorCardStyle(vendor.category)
                                        )}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <h3 className="font-semibold">{vendor.name}</h3>
                                            <p className="text-sm text-muted-foreground">{vendor.result}</p>
                                          </div>
                                          <Badge className={getCategoryBadgeStyle(vendor.category)}>
                                            {vendor.category}
                                          </Badge>
                                        </div>
                                        {vendor.method && (
                                          <p className="text-xs text-muted-foreground mt-2">
                                            Method: {vendor.method}
                                          </p>
                                        )}
                                        {vendor.update && (
                                          <p className="text-xs text-muted-foreground">
                                            Updated: {new Date(vendor.update).toLocaleString()}
                                          </p>
                                        )}
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Summary Stats */}
                          {scanResult.data.stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-lg border-2 border-border/50 bg-primary/5">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500" />
                                  <p className="text-sm font-medium">Malicious</p>
                                </div>
                                <p className="text-2xl font-bold mt-1">{scanResult.data.stats.malicious}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                  <p className="text-sm font-medium">Suspicious</p>
                                </div>
                                <p className="text-2xl font-bold mt-1">{scanResult.data.stats.suspicious}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500" />
                                  <p className="text-sm font-medium">Harmless</p>
                                </div>
                                <p className="text-2xl font-bold mt-1">{scanResult.data.stats.harmless}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                                  <p className="text-sm font-medium">Undetected</p>
                                </div>
                                <p className="text-2xl font-bold mt-1">{scanResult.data.stats.undetected}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scanResult.data.lastAnalysisResults && processVendorResults(scanResult.data.lastAnalysisResults).map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <h3 className="font-medium text-primary">{item.vendor}</h3>
                                  <Badge 
                                    variant={
                                      item.category.toLowerCase() === 'malicious' ? 'destructive' :
                                      item.category.toLowerCase() === 'suspicious' ? 'default' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {item.category}
                                  </Badge>
                                </div>
                                {item.method && (
                                  <Badge variant="outline" className="bg-background/50">
                                    {item.method}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Result:</span> {item.result}
                              </div>
                            </div>
                          </motion.div>
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
                      <div className="space-y-8">
                        {/* History Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            History
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {scanResult.data.firstSubmissionDate && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                              >
                                <p className="text-sm font-medium text-muted-foreground mb-1">First Submission</p>
                                <p className="font-mono text-sm">{new Date(scanResult.data.firstSubmissionDate).toLocaleString()}</p>
                              </motion.div>
                            )}
                            {scanResult.data.lastSubmissionDate && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                              >
                                <p className="text-sm font-medium text-muted-foreground mb-1">Last Submission</p>
                                <p className="font-mono text-sm">{new Date(scanResult.data.lastSubmissionDate).toLocaleString()}</p>
                              </motion.div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.2 }}
                              className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                            >
                              <p className="text-sm font-medium text-muted-foreground mb-1">Last Analysis</p>
                              <p className="font-mono text-sm">{new Date(scanResult.data.scanDate).toLocaleString()}</p>
                            </motion.div>
                          </div>
                        </div>

                        {/* HTTP Response Section */}
                        {scanResult.data.httpResponse && Object.keys(scanResult.data.httpResponse).length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              HTTP Response
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-lg border-2 border-border/50 bg-primary/5 col-span-2"
                              >
                                <p className="text-sm font-medium text-muted-foreground mb-1">Final URL</p>
                                <p className="font-mono text-sm break-all">{scanResult.data.httpResponse.finalUrl || scanResult.data.url}</p>
                              </motion.div>
                              {scanResult.data.httpResponse.ipAddress !== undefined && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                >
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Serving IP Address</p>
                                  <p className="font-mono text-sm">{scanResult.data.httpResponse.ipAddress}</p>
                                </motion.div>
                              )}
                              {scanResult.data.httpResponse.statusCode !== undefined && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                >
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Status Code</p>
                                  <p className="font-mono text-sm">{scanResult.data.httpResponse.statusCode}</p>
                                </motion.div>
                              )}
                              {scanResult.data.httpResponse.bodyLength !== undefined && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                >
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Body Length</p>
                                  <p className="font-mono text-sm">{(scanResult.data.httpResponse.bodyLength / 1024).toFixed(2)} KB</p>
                                </motion.div>
                              )}
                              {scanResult.data.httpResponse.bodySha256 !== undefined && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                >
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Body SHA-256</p>
                                  <p className="font-mono text-sm break-all">{scanResult.data.httpResponse.bodySha256}</p>
                                </motion.div>
                              )}
                            </div>

                            {/* Headers Section */}
                            {scanResult.data.httpResponse.headers && Object.keys(scanResult.data.httpResponse.headers).length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-md font-semibold mb-3">Headers</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(scanResult.data.httpResponse.headers).map(([key, value], index) => (
                                    <motion.div
                                      key={key}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.05 }}
                                      className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                    >
                                      <p className="text-sm font-medium text-muted-foreground mb-1">{key}</p>
                                      <p className="font-mono text-sm break-all">{value}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Redirection Chain Section */}
                            {scanResult.data.httpResponse.redirectionChain && scanResult.data.httpResponse.redirectionChain.length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-md font-semibold mb-3">Redirection Chain</h4>
                                <div className="space-y-2">
                                  {scanResult.data.httpResponse.redirectionChain.map((url, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.05 }}
                                      className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                                    >
                                      <p className="font-mono text-sm break-all">{url}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
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
                      <CardDescription>Community insights and votes for this URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {/* Vote Summary */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            Community Votes
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-4 rounded-lg border-2 border-border/50 bg-green-500/10"
                            >
                              <p className="text-sm font-medium text-muted-foreground mb-1">Harmless Votes</p>
                              <p className="text-2xl font-bold">{scanResult?.data?.communityFeedback?.totalVotes?.harmless || 0}</p>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.1 }}
                              className="p-4 rounded-lg border-2 border-border/50 bg-red-500/10"
                            >
                              <p className="text-sm font-medium text-muted-foreground mb-1">Malicious Votes</p>
                              <p className="text-2xl font-bold">{scanResult?.data?.communityFeedback?.totalVotes?.malicious || 0}</p>
                            </motion.div>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comments ({scanResult?.data?.communityFeedback?.totalComments || 0})
                          </h3>
                          <div className="space-y-4">
                            {scanResult?.data?.communityFeedback?.comments.map((comment, index) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="p-4 rounded-lg border-2 border-border/50 bg-primary/5"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(comment.date * 1000).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {comment.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="bg-primary/5">
                                          #{tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>👍 {comment.votes.positive}</span>
                                    <span>👎 {comment.votes.negative}</span>
                                    {comment.votes.abuse > 0 && <span>⚠️ {comment.votes.abuse}</span>}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            {(!scanResult?.data?.communityFeedback?.comments || scanResult.data.communityFeedback.comments.length === 0) && (
                              <p className="text-center text-muted-foreground">No comments yet</p>
                            )}
                          </div>
                        </div>

                        {/* Individual Votes Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Recent Votes ({scanResult?.data?.communityFeedback?.totalVotesCount || 0})
                          </h3>
                          <div className="space-y-4">
                            {scanResult?.data?.communityFeedback?.votes.map((vote, index) => (
                              <motion.div
                                key={vote.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className={cn(
                                  "p-4 rounded-lg border-2 border-border/50",
                                  vote.verdict === "malicious" ? "bg-red-500/10" : "bg-green-500/10"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(vote.date * 1000).toLocaleString()}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={vote.verdict === "malicious" ? "destructive" : "default"}
                                  >
                                    {vote.verdict}
                                  </Badge>
                                </div>
                              </motion.div>
                            ))}
                            {(!scanResult?.data?.communityFeedback?.votes || scanResult.data.communityFeedback.votes.length === 0) && (
                              <p className="text-center text-muted-foreground">No votes yet</p>
                            )}
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

// Wrap the component that uses useSearchParams() in a Suspense boundary
export default function URLScanResults() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loading URL scan results...</h2>
        <p className="text-muted-foreground">Please wait while we retrieve your scan data</p>
      </div>
    </div>}>
      <URLScanResultsContent />
    </Suspense>
  );
}
