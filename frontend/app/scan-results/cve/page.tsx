'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Shield, Terminal, Bug, FileCode, Database, Loader2 } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { AnimatedSeverityScore } from "@/components/ui/animated-severity-score";
import { CVSSVectorTooltip } from "@/components/ui/cvss-vector-tooltip";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Input } from "@/components/ui/input";
import { getCVEById, getCVSSColor, getCVSSSeverityText, parseVectorString, searchCVEs } from "@/services/cveService";
import { CVEDetails, CVESearchResponse } from "@/types/cveScan";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const [cveData, setCveData] = useState<CVEDetails | null>(null);
  const [searchResults, setSearchResults] = useState<CVESearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const cveId = searchParams.get('id');
        const keyword = searchParams.get('keyword');
        
        if (cveId) {
          // Fetch specific CVE details
          const data = await getCVEById(cveId);
          setCveData(data);
          setSearchResults(null);
        } else if (keyword) {
          // Fetch search results
          const results = await searchCVEs({ 
            keyword, 
            resultsPerPage: 10 
          });
          setSearchResults(results);
          setCveData(null);
        } else {
          setError("No CVE ID or keyword provided");
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
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
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
            <Button asChild variant="outline">
              <Link href="/cve-lookup">
                Return to CVE Lookup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show search results if available
  if (searchResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400 mb-4">
            Found {searchResults.totalResults} vulnerabilities for &quot;{searchParams.get('keyword')}&quot;
          </p>
          
          <div className="grid gap-4 mt-8">
            {searchResults.vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No vulnerabilities found matching your search criteria.</p>
              </div>
            ) : (
              searchResults.vulnerabilities.map((cve) => {
                // Find English description
                const description = cve.descriptions.find(d => d.lang === 'en')?.value || 'No description available';
                
                // Get CVSS data if available
                const cvssMetric = cve.metrics?.cvssMetrics?.[0];
                const cvssScore = cvssMetric?.cvssData?.baseScore || 0;
                const severity = cvssMetric?.cvssData?.baseSeverity || getCVSSSeverityText(cvssScore);
                
                return (
                  <motion.div
                    key={cve.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex border-l-4 border-l-primary">
                          <div className="p-4 flex-grow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">
                                  <Link href={`/scan-results/cve?id=${cve.id}`} className="hover:text-primary transition-colors">
                                    {cve.id}
                                  </Link>
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  Published: {new Date(cve.published).toLocaleDateString()}
                                  {cve.lastModified && ` • Updated: ${new Date(cve.lastModified).toLocaleDateString()}`}
                                </p>
                              </div>
                              {cvssScore > 0 && (
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getCVSSColor(cvssScore)}`}>
                                    {cvssScore.toFixed(1)}
                                  </div>
                                  <Badge variant="outline" className="ml-2">{severity}</Badge>
                                </div>
                              )}
                            </div>
                            <p className="text-sm line-clamp-2 mb-2">{description}</p>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/scan-results/cve?id=${cve.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
          
          {searchResults.totalResults > searchResults.resultsPerPage && (
            <div className="flex justify-center mt-6">
              <p className="text-gray-400">
                Showing {Math.min(searchResults.resultsPerPage, searchResults.vulnerabilities.length)} of {searchResults.totalResults} results
              </p>
              {/* Pagination could be added here */}
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
            <Button asChild>
              <Link href="/cve-lookup">
                Go to CVE Lookup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have valid data structure
  if (!cveData.descriptions || !Array.isArray(cveData.descriptions)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-red-500/20">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Invalid CVE Data Format</h1>
            <p className="text-red-500 mb-4">The CVE data received is not in the expected format.</p>
            <p className="text-gray-400 mb-6">This may be due to an API change or data corruption.</p>
            <Button asChild variant="outline">
              <Link href="/cve-lookup">
                Return to CVE Lookup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Find English description
  const description = cveData.descriptions.find(d => d.lang === 'en')?.value || 'No description available';
  
  // Get CVSS data if available
  const cvssMetric = cveData.metrics?.cvssMetrics?.[0];
  const cvssScore = cvssMetric?.cvssData?.baseScore || 0;
  const cvssVector = cvssMetric?.cvssData?.vectorString || '';
  const severity = cvssMetric?.cvssData?.baseSeverity || getCVSSSeverityText(cvssScore);
  
  // Parse vector components for display if vector string exists
  const vectorComponents = cvssVector ? parseVectorString(cvssVector) : {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-lg shadow-sm p-6 border"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{cveData.id}</h1>
            <p className="text-gray-400 mt-1">
              Published: {new Date(cveData.published).toLocaleDateString()}
              {cveData.lastModified && ` • Updated: ${new Date(cveData.lastModified).toLocaleDateString()}`}
            </p>
          </div>
          
          {cvssScore > 0 && (
            <div className="flex items-center gap-3">
              <AnimatedSeverityScore score={cvssScore} />
              <div>
                <SeverityBadge severity={severity} score={cvssScore} />
                {cvssVector && (
                  <div className="mt-1 text-xs text-gray-400">
                    <CVSSVectorTooltip vector={cvssVector} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description and Details */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-200 whitespace-pre-line">{description}</p>
            </CardContent>
          </Card>

          {/* Technical Details */}
          {cveData.weaknesses && Array.isArray(cveData.weaknesses) && cveData.weaknesses.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Weaknesses</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {cveData.weaknesses.map((weakness, idx) => {
                    const weaknessDesc = weakness.description && Array.isArray(weakness.description) 
                      ? weakness.description.find(d => d.lang === 'en')?.value || 'No description available'
                      : 'No description available';
                    return (
                      <li key={idx} className="text-gray-200">
                        <span className="font-medium">{weakness.source || 'Unknown'}: </span>
                        {weaknessDesc}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {cveData.references && cveData.references.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">References</h2>
                <ul className="space-y-3">
                  {cveData.references.map((ref, idx) => (
                    <li key={idx} className="flex items-start">
                      <ExternalLink className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <a 
                          href={ref.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {ref.url}
                        </a>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ref.tags && Array.isArray(ref.tags) && ref.tags.map((tag, tagIdx) => (
                            <Badge key={tagIdx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right Column - CVSS Details */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {cvssScore > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">CVSS Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Base Score</h3>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getCVSSColor(cvssScore)}`}>
                        {cvssScore.toFixed(1)}
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold">{severity}</div>
                        <div className="text-xs text-gray-400">CVSS v{cvssMetric?.cvssData?.version || '3.1'}</div>
                      </div>
                    </div>
                  </div>

                  {Object.keys(vectorComponents).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Vector Components</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(vectorComponents).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-1 border-b border-gray-800">
                            <div className="text-sm font-medium">{key}</div>
                            <Badge variant="outline">{value}</Badge>
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
                  <h3 className="text-sm font-medium text-gray-400">ID</h3>
                  <p>{cveData.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Source</h3>
                  <p>{cveData.sourceIdentifier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Published</h3>
                  <p>{new Date(cveData.published).toLocaleString()}</p>
                </div>
                {cveData.lastModified && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Last Modified</h3>
                    <p>{new Date(cveData.lastModified).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  <Badge variant="outline">{cveData.vulnStatus}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
