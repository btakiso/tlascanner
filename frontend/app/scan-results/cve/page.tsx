'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Shield, Terminal, Bug, FileCode, Database, Loader2, Search, ChevronRight, ChevronsLeft, ChevronLeft, ChevronsRight, AlertCircle } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { AnimatedSeverityScore } from "@/components/ui/animated-severity-score";
import { CVSSVectorTooltip } from "@/components/ui/cvss-vector-tooltip";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCVEById, getCVSSColor, getCVSSSeverityText, parseVectorString, searchCVEs } from "@/services/cveService";
import { CVEDetails, CVESearchResponse } from "@/types/cveScan";
import Link from "next/link";

// Helper function to format date safely
function formatDate(dateString: string | null, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    
    return format === 'short' 
      ? date.toLocaleDateString() 
      : date.toLocaleString();
  } catch (e) {
    return 'Unknown date';
  }
}

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
  const router = useRouter();
  const [cveData, setCveData] = useState<CVEDetails | null>(null);
  const [searchResults, setSearchResults] = useState<CVESearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [filterText, setFilterText] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const cveId = searchParams.get('id');
        const keyword = searchParams.get('keyword');
        const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : 0;
        setCurrentPage(page);
        
        if (cveId && cveId !== 'undefined' && cveId.trim() !== '') {
          // Validate CVE ID format
          if (!cveId.match(/^CVE-\d{4}-\d{4,}$/)) {
            throw new Error(`Invalid CVE ID format: ${cveId}. Expected format: CVE-YYYY-NNNNN`);
          }
          
          // Fetch specific CVE details
          console.log(`Fetching details for CVE: ${cveId}`);
          const data = await getCVEById(cveId);
          setCveData(data);
          setSearchResults(null);
        } else if (keyword && keyword.trim() !== '') {
          // Fetch search results
          console.log(`Searching for CVEs with keyword: ${keyword}`);
          const results = await searchCVEs({ 
            keyword, 
            resultsPerPage,
            startIndex: page * resultsPerPage
          });
          setSearchResults(results);
          setCveData(null);
        } else {
          setError("No valid CVE ID or keyword provided. Please enter a valid search term.");
        }
      } catch (err) {
        console.error("Error fetching CVE data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch CVE data";
        setError(errorMessage);
        
        // Clear any previous data to avoid showing stale information
        setCveData(null);
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Return a cleanup function to handle component unmounting
    return () => {
      // Cancel any pending requests or cleanup if needed
    };
  }, [searchParams.get('id'), searchParams.get('keyword'), searchParams.get('page'), resultsPerPage]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl relative">
        <div className="bg-card rounded-lg shadow-sm p-12 border">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-medium mb-2">Loading vulnerability data...</h2>
            <p className="text-gray-400">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-red-500/20">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-400 mb-6">Please try again with a valid CVE ID or keyword.</p>
            <Button 
              variant="outline"
              onClick={() => {
                router.push('/');
              }}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show search results if available
  if (searchResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
          key="search-results-container"
        >
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400 mb-4">
            Found {searchResults.totalResults} vulnerabilities for &quot;{searchParams.get('keyword')}&quot;
          </p>
          
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Filter results..." 
                className="pl-10 w-full" 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {severityFilter !== 'all' && (
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: 
                      severityFilter === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : 
                      severityFilter === 'HIGH' ? 'rgba(234, 88, 12, 0.1)' : 
                      severityFilter === 'MEDIUM' ? 'rgba(202, 138, 4, 0.1)' : 
                      severityFilter === 'LOW' ? 'rgba(22, 163, 74, 0.1)' : 'transparent',
                    color: 
                      severityFilter === 'CRITICAL' ? 'rgb(220, 38, 38)' : 
                      severityFilter === 'HIGH' ? 'rgb(234, 88, 12)' : 
                      severityFilter === 'MEDIUM' ? 'rgb(202, 138, 4)' : 
                      severityFilter === 'LOW' ? 'rgb(22, 163, 74)' : 'rgb(100, 116, 139)'
                  }}
                  onClick={() => setSeverityFilter('all')}
                >
                  Severity: {severityFilter} 
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setSeverityFilter('all')}>
                    <span className="sr-only">Remove</span>
                    ×
                  </Button>
                </Badge>
              )}
              {filterText && (
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 flex items-center gap-1 cursor-pointer"
                  onClick={() => setFilterText('')}
                >
                  Search: {filterText} 
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setFilterText('')}>
                    <span className="sr-only">Remove</span>
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              {searchResults && (
                <span>
                  Showing {Math.min(1 + currentPage * resultsPerPage, searchResults.totalResults)} - {Math.min((currentPage + 1) * resultsPerPage, searchResults.totalResults)} of {searchResults.totalResults} results
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={severityFilter}
                onValueChange={(value: string) => {
                  setSeverityFilter(value);
                }}
              >
                <SelectTrigger className="w-[150px] border-2" style={{
                  borderColor: 
                    severityFilter === 'CRITICAL' ? 'rgba(220, 38, 38, 0.5)' : 
                    severityFilter === 'HIGH' ? 'rgba(234, 88, 12, 0.5)' : 
                    severityFilter === 'MEDIUM' ? 'rgba(202, 138, 4, 0.5)' : 
                    severityFilter === 'LOW' ? 'rgba(22, 163, 74, 0.5)' : 'transparent'
                }}>
                  <SelectValue placeholder="Filter by Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={(value: string) => {
                  setResultsPerPage(parseInt(value));
                  // Reset to page 0 when changing results per page
                  router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=0`);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Results per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 mt-4">
            {searchResults.vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No vulnerabilities found matching your search criteria.</p>
              </div>
            ) : (
              searchResults.vulnerabilities
                .filter(cve => {
                  if (!filterText) return true;
                  const description = cve.descriptions?.find((d: { lang: string; value: string }) => d.lang === 'en')?.value || '';
                  return (
                    cve.id.toLowerCase().includes(filterText.toLowerCase()) ||
                    description.toLowerCase().includes(filterText.toLowerCase())
                  );
                })
                .filter(cve => {
                  if (severityFilter === 'all') return true;
                  
                  // Access the correct metrics path
                  const cveData = cve.cve || cve;
                  
                  // Debug the metrics structure
                  console.log('CVE Metrics structure:', cveData.metrics);
                  
                  // Try multiple possible paths for CVSS metrics
                  const cvssMetricV31 = cveData.metrics?.cvssMetricV31?.[0];
                  const cvssMetricV2 = cveData.metrics?.cvssMetricV2?.[0];
                  const cvssMetric = cvssMetricV31 || cvssMetricV2 || 
                                    (cveData.metrics?.cvssMetrics && cveData.metrics.cvssMetrics[0]);
                  
                  const severity = cvssMetric?.baseSeverity || cvssMetric?.cvssData?.baseSeverity || 'NONE';
                  return severity === severityFilter;
                })
                .sort((a, b) => {
                  // Get CVSS scores for both CVEs with correct path
                  const aData = a.cve || a;
                  const bData = b.cve || b;
                  
                  // Try multiple possible paths for CVSS metrics
                  const aMetricV31 = aData.metrics?.cvssMetricV31?.[0];
                  const aMetricV2 = aData.metrics?.cvssMetricV2?.[0];
                  const aMetric = aMetricV31 || aMetricV2 || 
                                 (aData.metrics?.cvssMetrics && aData.metrics.cvssMetrics[0]);
                  
                  const bMetricV31 = bData.metrics?.cvssMetricV31?.[0];
                  const bMetricV2 = bData.metrics?.cvssMetricV2?.[0];
                  const bMetric = bMetricV31 || bMetricV2 || 
                                 (bData.metrics?.cvssMetrics && bData.metrics.cvssMetrics[0]);
                  
                  // Get the score from the appropriate field
                  const aScore = aMetricV31?.cvssData?.baseScore || 
                                aMetricV2?.cvssData?.baseScore || 
                                aMetric?.cvssData?.baseScore || 0;
                  
                  const bScore = bMetricV31?.cvssData?.baseScore || 
                                bMetricV2?.cvssData?.baseScore || 
                                bMetric?.cvssData?.baseScore || 0;
                  
                  // Always sort by severity score descending (highest first)
                  return bScore - aScore;
                })
                .map((cve, index) => {
                // Find English description
                const cveData = cve.cve || cve;
                const description = cveData.descriptions?.find((d: { lang: string; value: string }) => d.lang === 'en')?.value || 'No description available';
                
                // Get CVSS data with correct path - try multiple possible structures
                const cvssMetricV31 = cveData.metrics?.cvssMetricV31?.[0];
                const cvssMetricV2 = cveData.metrics?.cvssMetricV2?.[0];
                const cvssMetricsArray = cveData.metrics?.cvssMetrics;
                const cvssMetric = cvssMetricV31 || cvssMetricV2 || 
                                  (cvssMetricsArray && cvssMetricsArray[0]);
                
                // Debug the metrics for this CVE
                console.log('CVSS Metrics for ' + cve.id + ':', {
                  cvssMetricV31,
                  cvssMetricV2,
                  cvssMetricsArray,
                  cvssMetric
                });
                
                const cvssScore = cvssMetricV31?.cvssData?.baseScore || 
                                 cvssMetricV2?.cvssData?.baseScore || 
                                 cvssMetric?.cvssData?.baseScore || 0;
                
                const severity = cvssMetricV31?.baseSeverity || 
                               cvssMetricV2?.baseSeverity || 
                               cvssMetricV31?.cvssData?.baseSeverity || 
                               cvssMetricV2?.cvssData?.baseSeverity || 
                               cvssMetric?.baseSeverity ||
                               cvssMetric?.cvssData?.baseSeverity ||
                               getCVSSSeverityText(cvssScore);
                
                // Parse vector components for display if vector string exists
                const vectorString = cvssMetricV31?.cvssData?.vectorString || 
                                   cvssMetricV2?.cvssData?.vectorString || 
                                   cvssMetric?.cvssData?.vectorString;
                
                const vectorComponents = vectorString ? parseVectorString(vectorString) : {};
                
                // Determine background gradient based on severity
                const gradientBg = 
                  cvssScore >= 9 ? 'bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-gray-950' : 
                  cvssScore >= 7 ? 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-950' : 
                  cvssScore >= 4 ? 'bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-950' : 
                  cvssScore > 0 ? 'bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-gray-950' : 
                  'bg-gradient-to-r from-gray-50 to-white dark:from-gray-950/20 dark:to-gray-950';
                
                // Determine icon based on vulnerability type
                const vulnerabilityType = description.toLowerCase().includes('sql injection') ? 'sqli' : 
                                         description.toLowerCase().includes('remote code') ? 'rce' : 
                                         description.toLowerCase().includes('cross-site') ? 'xss' : 'other';
                const { icon: VulnIcon } = getVulnerabilityTypeIcon(vulnerabilityType);
                
                return (
                  <motion.div
                    key={cve.id || `result-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      y: -3,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${gradientBg}`} style={{
                      borderLeftColor: cvssScore >= 9 ? 'rgb(220, 38, 38)' : 
                                      cvssScore >= 7 ? 'rgb(234, 88, 12)' : 
                                      cvssScore >= 4 ? 'rgb(202, 138, 4)' : 
                                      cvssScore > 0 ? 'rgb(22, 163, 74)' : 'rgb(100, 116, 139)'
                    }}>
                      <CardContent className="p-0">
                        <div className="p-5 relative">
                          {/* CVSS Score Badge - Top Right */}
                          {cvssScore > 0 ? (
                            <div className="absolute top-3 right-3 flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center`} style={{
                                backgroundColor: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                                                cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                                                cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                                                cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(71, 85, 105)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              }}>
                                <Shield className="h-3 w-3 mr-1.5" />
                                <span className="text-white">CVSS: {cvssScore.toFixed(1)}</span>
                              </div>
                              <Badge variant="outline" className="font-medium shadow-sm" style={{
                                backgroundColor: cvssScore >= 9 ? 'rgba(220, 38, 38, 0.2)' : 
                                                cvssScore >= 7 ? 'rgba(234, 88, 12, 0.2)' : 
                                                cvssScore >= 4 ? 'rgba(202, 138, 4, 0.2)' : 
                                                cvssScore > 0 ? 'rgba(22, 163, 74, 0.2)' : 'transparent',
                                color: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                                      cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                                      cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                                      cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(71, 85, 105)',
                                border: cvssScore >= 9 ? '1px solid rgba(220, 38, 38, 0.4)' : 
                                        cvssScore >= 7 ? '1px solid rgba(234, 88, 12, 0.4)' : 
                                        cvssScore >= 4 ? '1px solid rgba(202, 138, 4, 0.4)' : 
                                        cvssScore > 0 ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid rgba(100, 116, 139, 0.4)',
                                fontWeight: 'bold'
                              }}>
                                {severity}
                              </Badge>
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3">
                              <Badge variant="outline" className="text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                No Score
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            {/* Left column with icon */}
                            <div className="mr-4 mt-1">
                              <div className={`p-2 rounded-full ${
                                cvssScore >= 9 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                cvssScore >= 7 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                cvssScore >= 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                                cvssScore > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                <VulnIcon className="h-5 w-5" />
                              </div>
                            </div>
                            
                            {/* Main content */}
                            <div className="flex-grow">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-semibold">
                                  <Link href={`/scan-results/cve?id=${cve.id}`} className="hover:text-primary transition-colors">
                                    {cve.id}
                                  </Link>
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></span>
                                {formatDate(cve.published)} 
                                {cve.lastModified ? (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span className="inline-block w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-700 mr-2"></span>
                                    Updated: {formatDate(cve.lastModified)}
                                  </>
                                ) : ''}
                              </p>
                              <p className="text-sm line-clamp-2 mb-4 leading-relaxed">{description}</p>
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className={`px-4 py-2 h-auto border rounded-full transition-all duration-300 hover:scale-105 ${
                                    cvssScore >= 9 ? 'hover:border-red-500 hover:text-red-600' : 
                                    cvssScore >= 7 ? 'hover:border-orange-500 hover:text-orange-600' : 
                                    cvssScore >= 4 ? 'hover:border-amber-500 hover:text-amber-600' : 
                                    cvssScore > 0 ? 'hover:border-green-500 hover:text-green-600' : 
                                    'hover:border-gray-500 hover:text-gray-600'
                                  }`}
                                >
                                  <Link href={`/scan-results/cve?id=${cve.id}`} className="flex items-center">
                                    <span>View Details</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Link>
                                </Button>
                                {cve.references && cve.references.length > 0 && (
                                  <Badge variant="secondary" className="ml-3 flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    {cve.references.length} {cve.references.length === 1 ? 'reference' : 'references'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
          
          {searchResults.totalResults > resultsPerPage && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=0`);
                  }}
                  disabled={currentPage === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=${Math.max(0, currentPage - 1)}`);
                  }}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, Math.ceil(searchResults.totalResults / resultsPerPage)) }, (_, i) => {
                    // Calculate page numbers to show based on current page
                    let pageNum = i;
                    if (currentPage > 2) {
                      pageNum = currentPage - 2 + i;
                    }
                    if (pageNum >= Math.ceil(searchResults.totalResults / resultsPerPage)) {
                      return null;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        className="w-9 h-9"
                        onClick={() => {
                          router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=${pageNum}`);
                        }}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  
                  {/* Show ellipsis if there are more pages */}
                  {Math.ceil(searchResults.totalResults / resultsPerPage) > 5 && currentPage < Math.ceil(searchResults.totalResults / resultsPerPage) - 3 && (
                    <span className="mx-1">...</span>
                  )}
                  
                  {/* Show last page if not visible in the current range */}
                  {Math.ceil(searchResults.totalResults / resultsPerPage) > 5 && currentPage < Math.ceil(searchResults.totalResults / resultsPerPage) - 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9"
                      onClick={() => {
                        router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=${Math.ceil(searchResults.totalResults / resultsPerPage) - 1}`);
                      }}
                    >
                      {Math.ceil(searchResults.totalResults / resultsPerPage)}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=${Math.min(Math.ceil(searchResults.totalResults / resultsPerPage) - 1, currentPage + 1)}`);
                  }}
                  disabled={currentPage >= Math.ceil(searchResults.totalResults / resultsPerPage) - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    router.push(`/scan-results/cve?keyword=${searchParams.get('keyword')}&page=${Math.ceil(searchResults.totalResults / resultsPerPage) - 1}`);
                  }}
                  disabled={currentPage >= Math.ceil(searchResults.totalResults / resultsPerPage) - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Showing {currentPage * resultsPerPage + 1}-{Math.min((currentPage + 1) * resultsPerPage, searchResults.totalResults)} of {searchResults.totalResults} results
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // If no CVE data is available
  if (!cveData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm p-8 border">
          <div className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">No CVE Data Available</h1>
            <p className="text-gray-400 mb-6">Please provide a valid CVE ID or keyword to search for vulnerabilities.</p>
            <Button 
              variant="outline"
              onClick={() => {
                router.push('/');
              }}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have valid data structure
  if (!cveData.descriptions || !Array.isArray(cveData.descriptions)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-red-500/20 relative">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Invalid CVE Data Format</h1>
            <p className="text-red-500 mb-4">The CVE data received is not in the expected format.</p>
            <p className="text-gray-400 mb-6">This may be due to an API change or data corruption.</p>
            <Button 
              variant="outline"
              onClick={() => {
                router.push('/');
              }}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Find English description
  const description = cveData.descriptions.find((d: { lang: string; value: string }) => d.lang === 'en')?.value || 'No description available';
  
  // Get CVSS data if available
  const cvssMetricV31 = cveData.metrics?.cvssMetricV31?.[0];
  const cvssMetricV2 = cveData.metrics?.cvssMetricV2?.[0];
  const cvssMetricsArray = cveData.metrics?.cvssMetrics;
  const cvssMetric = cvssMetricV31 || cvssMetricV2 || 
                    (cvssMetricsArray && cvssMetricsArray[0]);
  
  // Debug the metrics for this CVE
  console.log(`CVSS Metrics for ${cveData.id}:`, {
    cvssMetricV31,
    cvssMetricV2,
    cvssMetricsArray,
    cvssMetric
  });
  
  const cvssScore = cvssMetricV31?.cvssData?.baseScore || 
                    cvssMetricV2?.cvssData?.baseScore || 
                    cvssMetric?.cvssData?.baseScore || 0;
  
  const severity = cvssMetricV31?.baseSeverity || 
                  cvssMetricV2?.baseSeverity || 
                  cvssMetricV31?.cvssData?.baseSeverity || 
                  cvssMetricV2?.cvssData?.baseSeverity || 
                  cvssMetric?.baseSeverity ||
                  cvssMetric?.cvssData?.baseSeverity ||
                  getCVSSSeverityText(cvssScore);
  
  // Parse vector components for display if vector string exists
  const vectorString = cvssMetricV31?.cvssData?.vectorString || 
                      cvssMetricV2?.cvssData?.vectorString || 
                      cvssMetric?.cvssData?.vectorString;
  
  const vectorComponents = vectorString ? parseVectorString(vectorString) : {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 flex items-center"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Search</span>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{cveData.id}</h1>
            <p className="text-muted-foreground mt-1">
              Published: {formatDate(cveData.published, 'long')} 
              {cveData.lastModified ? (
                <>
                  <span className="mx-2">•</span>
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-700 mr-2"></span>
                  Updated: {formatDate(cveData.lastModified, 'long')}
                </>
              ) : ''}
            </p>
          </div>
          {cvssScore > 0 && (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <Badge className="mb-1 font-medium shadow-sm" style={{
                  backgroundColor: cvssScore >= 9 ? 'rgba(185, 28, 28, 0.15)' : 
                                  cvssScore >= 7 ? 'rgba(194, 65, 12, 0.15)' : 
                                  cvssScore >= 4 ? 'rgba(161, 98, 7, 0.15)' : 
                                  cvssScore > 0 ? 'rgba(21, 128, 61, 0.15)' : 'transparent',
                  color: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                        cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                        cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                        cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(100, 116, 139)',
                  border: cvssScore >= 9 ? '1px solid rgba(185, 28, 28, 0.3)' : 
                          cvssScore >= 7 ? '1px solid rgba(194, 65, 12, 0.3)' : 
                          cvssScore >= 4 ? '1px solid rgba(161, 98, 7, 0.3)' : 
                          cvssScore > 0 ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid rgba(100, 116, 139, 0.3)',
                  fontWeight: 'bold'
                }}>
                  {severity}
                </Badge>
                <span className="text-xs text-muted-foreground">CVSS v{cvssMetricV31?.cvssData?.version || cvssMetricV2?.cvssData?.version || '3.1'}</span>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md`} style={{
                backgroundColor: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                                  cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                                  cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                                  cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(71, 85, 105)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                {cvssScore.toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                <div className="border-b">
                  <TabsList className="bg-transparent h-12 w-full justify-start rounded-none px-6">
                    <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Description
                    </TabsTrigger>
                    {cveData.weaknesses && cveData.weaknesses.length > 0 && (
                      <TabsTrigger value="weaknesses" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Weaknesses
                      </TabsTrigger>
                    )}
                    {cveData.references && cveData.references.length > 0 && (
                      <TabsTrigger value="references" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        References
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <TabsContent value="description" className="p-6 focus:outline-none">
                  {description ? (
                    <div className="prose prose-invert max-w-none">
                      <p>{description}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No description available for this CVE.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="weaknesses" className="p-6 focus:outline-none">
                  {cveData.weaknesses && cveData.weaknesses.length > 0 ? (
                    <div className="space-y-4">
                      {cveData.weaknesses.map((weakness, index) => {
                        const weaknessDesc = weakness.description?.find((d: { lang: string; value: string }) => d.lang === 'en')?.value || '';
                        return (
                          <div key={`weakness-${index}`} className="p-4 rounded-md border bg-card/50">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{weaknessDesc}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Source: {weakness.source} • Type: {weakness.type}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No weaknesses listed for this CVE.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="references" className="focus:outline-none">
                  {cveData.references && cveData.references.length > 0 ? (
                    <div className="divide-y divide-border">
                      {cveData.references.map((reference, index) => (
                        <div key={`ref-${index}`} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <ExternalLink className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <a 
                                href={reference.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                {reference.url}
                              </a>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <div className="text-sm text-muted-foreground">
                                  Source: {reference.source}
                                </div>
                                {reference.tags && reference.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {reference.tags.map((tag, tagIndex) => (
                                      <Badge key={`tag-${index}-${tagIndex}`} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No references available for this CVE.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {vectorComponents && Object.keys(vectorComponents).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">CVSS Vector</h2>
                <div className="mb-4">
                  <code className="bg-muted text-sm p-2 rounded block overflow-x-auto">
                    {vectorString}
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {Object.entries(vectorComponents).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-md border bg-card/50 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                        backgroundColor: 
                          key.startsWith('A') ? 'rgba(22, 163, 74, 0.1)' : 
                          key.startsWith('C') ? 'rgba(220, 38, 38, 0.1)' : 
                          key.startsWith('I') ? 'rgba(234, 88, 12, 0.1)' : 
                          key.startsWith('PR') ? 'rgba(202, 138, 4, 0.1)' : 
                          key.startsWith('S') ? 'rgba(79, 70, 229, 0.1)' : 
                          'rgba(100, 116, 139, 0.1)',
                        color: 
                          key.startsWith('A') ? 'rgb(22, 163, 74)' : 
                          key.startsWith('C') ? 'rgb(220, 38, 38)' : 
                          key.startsWith('I') ? 'rgb(234, 88, 12)' : 
                          key.startsWith('PR') ? 'rgb(202, 138, 4)' : 
                          key.startsWith('S') ? 'rgb(79, 70, 229)' : 
                          'rgb(100, 116, 139)'
                      }}>
                        {key.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{key}</div>
                        <div className="text-xs text-muted-foreground">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {cvssScore > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">CVSS Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Base Score</h3>
                    <div className="flex items-center">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md`} style={{
                        backgroundColor: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                                        cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                                        cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                                        cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(71, 85, 105)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}>
                        {cvssScore.toFixed(1)}
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold flex items-center">
                          <span className="mr-2">{severity}</span>
                          <Badge variant="outline" className="font-medium shadow-sm" style={{
                            backgroundColor: cvssScore >= 9 ? 'rgba(185, 28, 28, 0.15)' : 
                                            cvssScore >= 7 ? 'rgba(194, 65, 12, 0.15)' : 
                                            cvssScore >= 4 ? 'rgba(161, 98, 7, 0.15)' : 
                                            cvssScore > 0 ? 'rgba(21, 128, 61, 0.15)' : 'transparent',
                            color: cvssScore >= 9 ? 'rgb(185, 28, 28)' : 
                                  cvssScore >= 7 ? 'rgb(194, 65, 12)' : 
                                  cvssScore >= 4 ? 'rgb(161, 98, 7)' : 
                                  cvssScore > 0 ? 'rgb(21, 128, 61)' : 'rgb(100, 116, 139)',
                            border: cvssScore >= 9 ? '1px solid rgba(185, 28, 28, 0.3)' : 
                                    cvssScore >= 7 ? '1px solid rgba(194, 65, 12, 0.3)' : 
                                    cvssScore >= 4 ? '1px solid rgba(161, 98, 7, 0.3)' : 
                                    cvssScore > 0 ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid rgba(100, 116, 139, 0.3)',
                          }}>
                            CVSS {cvssScore.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">CVSS v{cvssMetricV31?.cvssData?.version || cvssMetricV2?.cvssData?.version || '3.1'}</div>
                      </div>
                    </div>
                  </div>

                  {Object.keys(vectorComponents).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Impact Metrics</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(vectorComponents)
                          .filter(([key]) => ['C', 'I', 'A'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/50">
                              <div className="text-sm font-medium">
                                {key === 'C' ? 'Confidentiality' : 
                                 key === 'I' ? 'Integrity' : 
                                 key === 'A' ? 'Availability' : key}
                              </div>
                              <Badge variant="outline" className={
                                value === 'H' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                value === 'M' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                value === 'L' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-green-500/10 text-green-500 border-green-500/20'
                              }>
                                {value === 'H' ? 'High' : 
                                 value === 'M' ? 'Medium' : 
                                 value === 'L' ? 'Low' : 
                                 value === 'N' ? 'None' : value}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                  <p className="font-mono">{cveData.id}</p>
                </div>
                {cveData.sourceIdentifier && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                    <p>{cveData.sourceIdentifier}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Published</h3>
                  <p>{formatDate(cveData.published, 'long')}</p>
                </div>
                {cveData.lastModified && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Modified</h3>
                    <p>{formatDate(cveData.lastModified, 'long')}</p>
                  </div>
                )}
                {cveData.vulnStatus && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge variant={cveData.vulnStatus === 'Analyzed' ? 'default' : 'secondary'}>
                      {cveData.vulnStatus}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add a "Share" card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Share</h2>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href={`https://nvd.nist.gov/vuln/detail/${cveData.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on NVD
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
