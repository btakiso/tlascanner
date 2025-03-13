import { Request, Response } from 'express';
import { CVEService } from '../services/cveService';
import { z } from 'zod';

const searchParamsSchema = z.object({
    keyword: z.string().optional(),
    cveId: z.string().optional(),
    startIndex: z.coerce.number().min(0).optional(),
    resultsPerPage: z.coerce.number().min(1).max(100).optional()
});

const cveIdSchema = z.object({
    cveId: z.string().regex(/^CVE-\d{4}-\d{4,}$/)
});

export class CVEController {
    private cveService: CVEService;

    constructor() {
        // TODO: Get API key from environment variables
        this.cveService = new CVEService();
    }

    async searchCVEs(req: Request, res: Response): Promise<void> {
        try {
            const validatedParams = searchParamsSchema.parse(req.query);
            
            if (!validatedParams.keyword && !validatedParams.cveId) {
                res.status(400).json({
                    error: 'Either keyword or cveId must be provided'
                });
                return;
            }

            // Add user information for search history tracking
            const searchParams = {
                ...validatedParams,
                userId: req.user?.id, // Assuming user info is attached to req by auth middleware
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            };

            const results = await this.cveService.searchCVEs(searchParams);
            
            try {
                // Create a simplified response structure
                const simplifiedResponse = {
                    format: results.format || 'NVD_CVE',
                    version: results.version || '2.0',
                    timestamp: results.timestamp || new Date().toISOString(),
                    startIndex: results.startIndex || 0,
                    totalResults: results.totalResults || 0,
                    resultsPerPage: results.resultsPerPage || 0,
                    vulnerabilities: [] as any[]
                };
                
                // Process each vulnerability with our sanitizer
                if (results.vulnerabilities && Array.isArray(results.vulnerabilities)) {
                    simplifiedResponse.vulnerabilities = results.vulnerabilities.map(cve => this.ensureValidCVEFormat(cve));
                }
                
                // Set a higher JSON size limit for the response
                res.setHeader('Content-Type', 'application/json');
                res.json(simplifiedResponse);
            } catch (formatError) {
                console.error('Error formatting search results:', formatError);
                res.status(500).json({
                    error: 'Error processing CVE search results',
                    message: 'The system encountered an issue processing the search results. Please try again later.'
                });
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Invalid search parameters',
                    details: err.errors
                });
                return;
            }

            const error = err as Error;
            console.error('CVE search error:', error);
            
            // Check for JSON parsing errors
            if (error.message && error.message.includes('JSON')) {
                res.status(500).json({
                    error: 'Invalid data format in CVE database',
                    message: 'The system encountered an issue with the data format. Please try again or contact support.'
                });
                return;
            }
            
            res.status(500).json({
                error: 'Failed to search CVEs',
                message: error.message
            });
        }
    }

    async getCVEById(req: Request, res: Response): Promise<void> {
        try {
            const { cveId } = cveIdSchema.parse(req.params);
            
            // Extract user information for search history tracking
            const userId = req.user?.id; // Assuming user info is attached to req by auth middleware
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'] as string;
            
            const cve = await this.cveService.getCVEById(cveId, userId, ipAddress, userAgent);
            
            if (!cve) {
                res.status(404).json({
                    error: `CVE ${cveId} not found`
                });
                return;
            }
            
            try {
                // Ensure the CVE has the expected structure before sending to client
                const validatedCVE = this.ensureValidCVEFormat(cve);
                
                // Set a higher JSON size limit for the response
                res.setHeader('Content-Type', 'application/json');
                res.json(validatedCVE);
            } catch (formatError) {
                console.error(`Error formatting CVE ${cveId}:`, formatError);
                res.status(500).json({
                    error: 'Error processing CVE data',
                    message: 'The system encountered an issue processing the CVE data. Please try again later.'
                });
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Invalid CVE ID format',
                    details: err.errors
                });
                return;
            }

            const error = err as Error;
            console.error(`CVE lookup error for ${req.params.cveId}:`, error);
            
            // Check for JSON parsing errors
            if (error.message && error.message.includes('JSON')) {
                res.status(500).json({
                    error: 'Invalid data format in CVE database',
                    message: 'The system encountered an issue with the data format. Please try again or contact support.'
                });
                return;
            }
            
            res.status(500).json({
                error: 'Failed to retrieve CVE details',
                message: error.message
            });
        }
    }

    /**
     * Ensures the CVE data has the expected structure for the frontend
     * Adds missing properties with default values if necessary
     */
    private ensureValidCVEFormat(cve: any): any {
        // Create a simplified structure with only the necessary fields
        // This avoids issues with circular references or overly complex objects
        try {
            // Extract the ID from either the top-level object or the nested cve object
            const cveId = (cve.id || (cve.cve && cve.cve.id)) || 'Unknown';
            
            const simplifiedCVE: any = {
                id: cveId,
                descriptions: [],
                metrics: { cvssMetrics: [], cvssMetricV31: [], cvssMetricV2: [] },
                references: [],
                weaknesses: [],
                published: null,
                lastModified: null
            };
            
            // Copy simple properties directly
            // Check both top-level and nested cve object for properties
            const published = cve.published || (cve.cve && cve.cve.published);
            if (published && this.isValidDateString(published)) {
                simplifiedCVE.published = published;
            }
            
            const lastModified = cve.lastModified || (cve.cve && cve.cve.lastModified);
            if (lastModified && this.isValidDateString(lastModified)) {
                simplifiedCVE.lastModified = lastModified;
            }
            
            // Handle descriptions array - check both top-level and nested
            const descriptions = cve.descriptions || (cve.cve && cve.cve.descriptions);
            if (descriptions && Array.isArray(descriptions)) {
                simplifiedCVE.descriptions = descriptions.map((desc: any) => ({
                    lang: desc.lang || 'en',
                    value: desc.value || 'No description available'
                }));
            } else {
                simplifiedCVE.descriptions = [{ lang: 'en', value: 'No description available' }];
            }
            
            // Handle metrics - check both top-level and nested
            const metrics = cve.metrics || (cve.cve && cve.cve.metrics);
            if (metrics) {
                // Initialize metrics arrays
                simplifiedCVE.metrics.cvssMetrics = [];
                simplifiedCVE.metrics.cvssMetricV31 = [];
                simplifiedCVE.metrics.cvssMetricV2 = [];
                
                // Process CVSS metrics if available
                if (metrics.cvssMetrics && Array.isArray(metrics.cvssMetrics)) {
                    simplifiedCVE.metrics.cvssMetrics = metrics.cvssMetrics.map((metric: any) => {
                        const simplifiedMetric: any = {
                            source: metric.source || 'unknown',
                            type: metric.type || 'unknown'
                        };
                        
                        // Add CVSS data if available
                        if (metric.cvssData) {
                            simplifiedMetric.cvssData = {
                                version: metric.cvssData.version || '3.1',
                                vectorString: metric.cvssData.vectorString || '',
                                baseScore: metric.cvssData.baseScore || 0,
                                baseSeverity: metric.cvssData.baseSeverity || 'NONE'
                            };
                        }
                        
                        return simplifiedMetric;
                    });
                    
                    // Also populate cvssMetricV31 and cvssMetricV2 arrays based on version
                    simplifiedCVE.metrics.cvssMetrics.forEach((metric: any) => {
                        if (metric.cvssData) {
                            if (metric.cvssData.version && metric.cvssData.version.startsWith('3')) {
                                simplifiedCVE.metrics.cvssMetricV31.push(metric);
                            } else if (metric.cvssData.version && metric.cvssData.version.startsWith('2')) {
                                simplifiedCVE.metrics.cvssMetricV2.push(metric);
                            }
                        }
                    });
                }
                
                // Check for NVD API format with direct cvssMetricV31 and cvssMetricV2 properties
                if (metrics.cvssMetricV31 && Array.isArray(metrics.cvssMetricV31)) {
                    simplifiedCVE.metrics.cvssMetricV31 = metrics.cvssMetricV31;
                }
                
                if (metrics.cvssMetricV2 && Array.isArray(metrics.cvssMetricV2)) {
                    simplifiedCVE.metrics.cvssMetricV2 = metrics.cvssMetricV2;
                }
                
                // Log the metrics structure for debugging
                console.log('Processed metrics structure:', JSON.stringify(simplifiedCVE.metrics, null, 2));
            }
            
            // Handle references array - check both top-level and nested
            const references = cve.references || (cve.cve && cve.cve.references);
            if (references && Array.isArray(references)) {
                simplifiedCVE.references = references.map((ref: any) => ({
                    url: ref.url || '',
                    source: ref.source || '',
                    tags: Array.isArray(ref.tags) ? ref.tags : []
                }));
            }
            
            // Handle weaknesses array - check both top-level and nested
            const weaknesses = cve.weaknesses || (cve.cve && cve.cve.weaknesses);
            if (weaknesses && Array.isArray(weaknesses)) {
                simplifiedCVE.weaknesses = weaknesses.map((weakness: any) => {
                    const simplifiedWeakness: any = {
                        source: weakness.source || '',
                        type: weakness.type || ''
                    };
                    
                    if (weakness.description && Array.isArray(weakness.description)) {
                        simplifiedWeakness.description = weakness.description.map((desc: any) => ({
                            lang: desc.lang || 'en',
                            value: desc.value || ''
                        }));
                    } else {
                        simplifiedWeakness.description = [];
                    }
                    
                    return simplifiedWeakness;
                });
            }
            
            return simplifiedCVE;
        } catch (error) {
            console.error('Error creating simplified CVE structure:', error);
            // Return a minimal valid structure if an error occurs
            return {
                id: cve.id || 'Unknown',
                descriptions: [{ lang: 'en', value: 'Error processing CVE data' }],
                metrics: { cvssMetrics: [], cvssMetricV31: [], cvssMetricV2: [] },
                references: [],
                weaknesses: [],
                published: null,
                lastModified: null
            };
        }
    }
    
    /**
     * Checks if a string is a valid date format
     */
    private isValidDateString(dateStr: string): boolean {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
}
