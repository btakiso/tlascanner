'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Shield, Terminal, Bug, FileCode, Database } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { AnimatedSeverityScore } from "@/components/ui/animated-severity-score";
import { CVSSVectorTooltip } from "@/components/ui/cvss-vector-tooltip";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Input } from "@/components/ui/input";

// Mock data template
const createMockData = (cveId: string) => ({
  id: cveId,
  title: "Remote Code Execution in XYZ Service",
  type: "rce",
  cvssScore: 9.8,
  severity: "CRITICAL",
  cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  publishedDate: "2025-01-15",
  modifiedDate: "2025-02-01",
  description: "A remote code execution vulnerability exists in XYZ Service versions 1.0 through 2.0 when processing specially crafted requests. An attacker can exploit this to execute arbitrary code with system privileges.",
  technicalDetails: "The vulnerability exists due to improper validation of user-supplied data in the XYZ Service's request processing component. By sending a specially crafted request, an attacker can trigger a buffer overflow condition, leading to arbitrary code execution with SYSTEM privileges.",
  affectedProducts: [
    { vendor: "XYZ Corp", product: "XYZ Service", versions: "1.0-2.0" },
    { vendor: "XYZ Corp", product: "XYZ Enterprise", versions: "1.5-1.8" }
  ],
  references: [
    { url: "https://xyz.com/security/advisory/2025-001", type: "VENDOR_ADVISORY", icon: FileCode },
    { url: "https://exploit-db.com/exploits/12345", type: "EXPLOIT", icon: Bug },
    { url: "https://nvd.nist.gov/vuln/detail/CVE-2025-12345", type: "NVD", icon: Database }
  ],
  mitigation: [
    { vendor: "XYZ Corp", steps: [
      "Upgrade to XYZ Service version 2.1 or later",
      "Apply security patch XYZ-2025-001"
    ]},
    { vendor: "General", steps: [
      "Implement network segmentation to restrict access",
      "Monitor for suspicious network activity"
    ]}
  ],
  timeline: [
    { date: "2025-01-10", event: "Vulnerability Discovered" },
    { date: "2025-01-15", event: "Public Disclosure" },
    { date: "2025-01-20", event: "Patch Released" },
    { date: "2025-02-01", event: "Last Updated" }
  ]
});

const getVulnerabilityTypeIcon = (type: string) => {
  const types: { [key: string]: { icon: any, label: string } } = {
    rce: { icon: Terminal, label: "Remote Code Execution" },
    sqli: { icon: Database, label: "SQL Injection" },
    xss: { icon: FileCode, label: "Cross-Site Scripting" }
  };
  return types[type] || { icon: Bug, label: "Other" };
};

export default function CVEResultPage() {
  const searchParams = useSearchParams();
  const [cveData, setCveData] = useState<ReturnType<typeof createMockData> | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const cveId = searchParams.get('id');
    if (cveId) {
      // In the future, this will be replaced with an actual API call
      setCveData(createMockData(cveId));
    }
  }, [searchParams]);

  if (!cveData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No CVE ID provided</h1>
          <p className="text-gray-400">Please provide a valid CVE ID to view vulnerability details.</p>
        </div>
      </div>
    );
  }

  const VulnType = getVulnerabilityTypeIcon(cveData.type);

  const filteredProducts = cveData.affectedProducts.filter(product => 
    product.vendor.toLowerCase().includes(filterText.toLowerCase()) ||
    product.product.toLowerCase().includes(filterText.toLowerCase()) ||
    product.versions.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{cveData.id}</h1>
          <SeverityBadge severity={cveData.severity} score={cveData.cvssScore} />
          <Badge variant="outline" className="flex items-center gap-1">
            <VulnType.icon className="h-4 w-4" />
            <span>{VulnType.label}</span>
          </Badge>
        </div>
        <h2 className="text-xl text-gray-400">{cveData.title}</h2>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold">CVSS Score</h3>
            </div>
            <AnimatedSeverityScore score={cveData.cvssScore} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5" />
              <h3 className="font-semibold">Vector String</h3>
            </div>
            <CVSSVectorTooltip vector={cveData.cvssVector} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Timeline</h3>
            </div>
            <div className="space-y-1">
              {cveData.timeline.map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{event.date}:</span>
                  <span>{event.event}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="description" className="space-y-4">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="affected">Affected Products</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Overview</h3>
                <p className="text-gray-200">{cveData.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Details</h3>
                <p className="text-gray-200">{cveData.technicalDetails}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affected" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <Input
                  placeholder="Filter by vendor, product, or version..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <div key={index} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold">{product.vendor}</h4>
                    <p className="text-gray-400">{product.product}</p>
                    <p className="text-sm text-gray-500">Affected versions: {product.versions}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {cveData.references.map((ref, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ref.icon className="h-4 w-4" />
                    <a 
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {ref.type}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {cveData.mitigation.map((vendor, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2">{vendor.vendor}</h3>
                    <ul className="list-disc pl-4 space-y-2">
                      {vendor.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-200">{step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
