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

            const results = await this.cveService.searchCVEs(validatedParams);
            
            // Ensure each CVE in the results has the expected structure
            if (results.vulnerabilities && Array.isArray(results.vulnerabilities)) {
                results.vulnerabilities = results.vulnerabilities.map(cve => this.ensureValidCVEFormat(cve));
            }
            
            res.json(results);
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
            res.status(500).json({
                error: 'Failed to search CVEs',
                message: error.message
            });
        }
    }

    async getCVEById(req: Request, res: Response): Promise<void> {
        try {
            const { cveId } = cveIdSchema.parse(req.params);
            
            const cve = await this.cveService.getCVEById(cveId);
            if (!cve) {
                res.status(404).json({
                    error: 'CVE not found'
                });
                return;
            }

            // Ensure the CVE data has the expected structure
            const formattedCVE = this.ensureValidCVEFormat(cve);
            res.json(formattedCVE);
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Invalid CVE ID format',
                    details: err.errors
                });
                return;
            }

            const error = err as Error;
            console.error('CVE lookup error:', error);
            res.status(500).json({
                error: 'Failed to retrieve CVE',
                message: error.message
            });
        }
    }

    /**
     * Ensures the CVE data has the expected structure for the frontend
     * Adds missing properties with default values if necessary
     */
    private ensureValidCVEFormat(cve: any): any {
        // Create a deep copy to avoid modifying the original
        const formattedCVE = JSON.parse(JSON.stringify(cve));
        
        // Ensure descriptions array exists
        if (!formattedCVE.descriptions || !Array.isArray(formattedCVE.descriptions)) {
            formattedCVE.descriptions = [{ lang: 'en', value: 'No description available' }];
        }
        
        // Ensure metrics object and cvssMetrics array exist
        if (!formattedCVE.metrics) {
            formattedCVE.metrics = { cvssMetrics: [] };
        } else if (!formattedCVE.metrics.cvssMetrics || !Array.isArray(formattedCVE.metrics.cvssMetrics)) {
            formattedCVE.metrics.cvssMetrics = [];
        }
        
        // Ensure references array exists
        if (!formattedCVE.references || !Array.isArray(formattedCVE.references)) {
            formattedCVE.references = [];
        }
        
        // Ensure weaknesses array exists
        if (!formattedCVE.weaknesses || !Array.isArray(formattedCVE.weaknesses)) {
            formattedCVE.weaknesses = [];
        }
        
        return formattedCVE;
    }
}
