"use client"

import { MetricsBar } from "@/components/dashboard/metrics-bar"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ThreatAnalysisChart } from "@/components/dashboard/threat-analysis-chart"
import { APIResponse, ScanEvent } from "@/types/security"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data - will be replaced with actual API calls
const mockData: APIResponse = {
  virusTotal: {
    urlScans: 1234,
    fileScans: 567,
    malwareDetections: 23,
    recentScans: [],
    detectionRates: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      detections: Math.floor(Math.random() * 50)
    }))
  },
  nvd: {
    totalCVEs: 89,
    criticalCVEs: 12,
    recentCVEs: [],
    severityDistribution: {
      low: 20,
      medium: 35,
      high: 22,
      critical: 12
    }
  },
  malwareBazaar: {
    totalFiles: 789,
    maliciousFiles: 45,
    recentFiles: [],
    signatureMatches: [
      { signature: "Ransomware", count: 15 },
      { signature: "Trojan", count: 20 },
      { signature: "Backdoor", count: 10 }
    ]
  }
}

// Generate mock recent events
const mockEvents: ScanEvent[] = [
  {
    id: "1",
    type: "URL",
    source: "VirusTotal",
    status: "malicious",
    timestamp: new Date().toISOString(),
    details: "High-risk malicious content detected"
  },
  {
    id: "2",
    type: "FILE",
    source: "MalwareBazaar",
    status: "clean",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    details: "No security threats found"
  },
  {
    id: "3",
    type: "CVE",
    source: "NVD",
    status: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    details: "Medium severity security issue identified"
  }
]

export default function DashboardPage() {
  const aggregatedMetrics = {
    totalUrlsScanned: mockData.virusTotal.urlScans,
    totalFilesAnalyzed: mockData.virusTotal.fileScans + mockData.malwareBazaar.totalFiles,
    maliciousDetections: mockData.virusTotal.malwareDetections + mockData.malwareBazaar.maliciousFiles,
    criticalCVEs: mockData.nvd.criticalCVEs
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor and analyze security threats in real-time</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricsBar metrics={aggregatedMetrics} />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <ThreatAnalysisChart data={mockData} />
            <ActivityFeed events={mockEvents} />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>In-depth analysis of security metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardHeader>
              <CardTitle>Security Reports</CardTitle>
              <CardDescription>Generate and export security reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reporting features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
