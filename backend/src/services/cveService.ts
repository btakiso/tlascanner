import { NVDAPIClient } from '../integrations/nvdAPI';
import { 
    CVESearchParams, 
    CVESearchResponse, 
    CVEItem 
} from '../types/cve';
import { Pool } from 'pg';
import db from '../config/database';

export class CVEService {
    private nvdClient: NVDAPIClient;
    private db: Pool;

    constructor(nvdApiKey?: string) {
        this.nvdClient = new NVDAPIClient(nvdApiKey);
        this.db = db.getPool();
    }

    async searchCVEs(params: CVESearchParams): Promise<CVESearchResponse> {
        try {
            // Validate parameters
            if (!params.keyword && !params.cveId) {
                throw new Error('Either keyword or cveId must be provided');
            }
            
            // If cveId is provided, validate its format
            if (params.cveId && !params.cveId.match(/^CVE-\d{4}-\d{4,}$/)) {
                throw new Error(`Invalid CVE ID format: ${params.cveId}`);
            }

            // First check cache
            const cachedResults = await this.getCachedResults(params);
            if (cachedResults) {
                console.log(`Using cached results for query:`, params);
                
                // Log the search to history even when using cached results
                await this.logSearchHistory(params, cachedResults.totalResults || 0, params.userId, params.ipAddress, params.userAgent);
                
                return cachedResults;
            }

            // If not in cache, fetch from NVD
            console.log(`Fetching from NVD API for query:`, params);
            const results = await this.nvdClient.searchCVEs(params);
            
            // Cache the results
            await this.cacheResults(params, results);
            
            // Log the search to history
            await this.logSearchHistory(params, results.totalResults || 0, params.userId, params.ipAddress, params.userAgent);
            
            return results;
        } catch (error) {
            console.error(`Error searching CVEs:`, error);
            throw new Error(`CVE Search Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getCVEById(cveId: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<CVEItem | null> {
        try {
            // Validate CVE ID format
            if (!cveId || !cveId.match(/^CVE-\d{4}-\d{4,}$/)) {
                throw new Error(`Invalid CVE ID format: ${cveId}`);
            }

            // Check cache first
            const cachedCVE = await this.getCachedCVE(cveId);
            if (cachedCVE) {
                // Log the direct CVE lookup to history
                await this.logSearchHistory({ cveId }, 1, userId, ipAddress, userAgent);
                return cachedCVE;
            }

            // If not in cache, fetch from NVD
            const response = await this.nvdClient.getCVEById(cveId);
            if (response.vulnerabilities && response.vulnerabilities.length > 0) {
                const cveItem = response.vulnerabilities[0];
                
                // Cache the CVE
                await this.cacheCVE(cveItem);
                
                // Log the direct CVE lookup to history
                await this.logSearchHistory({ cveId }, 1, userId, ipAddress, userAgent);
                
                return cveItem;
            }
            
            // Log the failed lookup attempt
            await this.logSearchHistory({ cveId }, 0, userId, ipAddress, userAgent);
            
            return null;
        } catch (error) {
            console.error(`Error fetching CVE ${cveId}:`, error);
            throw new Error(`CVE Lookup Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async getCachedResults(params: CVESearchParams): Promise<CVESearchResponse | null> {
        // Only cache keyword searches
        if (!params.keyword) return null;

        const query = `
            SELECT * FROM cve_cache 
            WHERE search_keyword = $1 
            AND cached_at > NOW() - INTERVAL '24 hours'
            LIMIT $2 OFFSET $3
        `;
        
        const values = [
            params.keyword,
            params.resultsPerPage || 20,
            params.startIndex || 0
        ];

        const result = await this.db.query(query, values);
        if (result.rows.length > 0) {
            // Check if response_data is already a JSON object
            const responseData = result.rows[0].response_data;
            if (responseData) {
                if (typeof responseData === 'string') {
                    try {
                        return JSON.parse(responseData);
                    } catch (error) {
                        console.error('Error parsing cached response data:', error);
                        return null;
                    }
                } else {
                    // It's already an object
                    return responseData;
                }
            }
        }
        
        return null;
    }

    private async getCachedCVE(cveId: string): Promise<CVEItem | null> {
        try {
            const query = `
                SELECT response_data 
                FROM cve_cache 
                WHERE cve_id = $1 
                AND cached_at > NOW() - INTERVAL '24 hours'
            `;
            
            const result = await this.db.query(query, [cveId]);
            if (result.rows.length > 0 && result.rows[0].response_data) {
                // Extract the CVE item from the response data
                let responseData = result.rows[0].response_data;
                
                // Handle string response data
                if (typeof responseData === 'string') {
                    try {
                        responseData = JSON.parse(responseData);
                    } catch (error) {
                        console.error('Error parsing cached CVE data:', error);
                        return null;
                    }
                }
                
                if (responseData.vulnerabilities && responseData.vulnerabilities.length > 0) {
                    return responseData.vulnerabilities[0];
                }
            }
            
            return null;
        } catch (error) {
            console.error(`Error retrieving cached CVE ${cveId}:`, error);
            return null;
        }
    }

    private async cacheResults(params: CVESearchParams, results: CVESearchResponse): Promise<void> {
        if (!params.keyword) return;

        const query = `
            INSERT INTO cve_cache (search_keyword, response_data, cached_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (search_keyword)
            DO UPDATE SET response_data = $2, cached_at = NOW()
        `;
        
        await this.db.query(query, [
            params.keyword,
            JSON.stringify(results)
        ]);
    }

    private async cacheCVE(cveItem: CVEItem): Promise<void> {
        try {
            // Create a response object similar to what the NVD API returns
            const responseData = {
                resultsPerPage: 1,
                startIndex: 0,
                totalResults: 1,
                format: 'NVD_CVE',
                version: '2.0',
                timestamp: new Date().toISOString(),
                vulnerabilities: [cveItem]
            };

            const query = `
                INSERT INTO cve_cache (cve_id, response_data, cached_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (cve_id)
                DO UPDATE SET response_data = $2, cached_at = NOW()
            `;
            
            await this.db.query(query, [
                cveItem.id,
                JSON.stringify(responseData)
            ]);
        } catch (error) {
            console.error(`Error caching CVE ${cveItem.id}:`, error);
            // Continue execution even if caching fails
        }
    }

    /**
     * Logs CVE search history to the cve_searches table
     */
    private async logSearchHistory(
        params: CVESearchParams, 
        resultsCount: number, 
        userId?: string, 
        ipAddress?: string, 
        userAgent?: string
    ): Promise<void> {
        try {
            // Check for recent identical searches to prevent duplicates
            // This acts as a debounce mechanism to avoid multiple entries for the same search
            const checkRecentQuery = `
                SELECT id FROM cve_searches 
                WHERE (cve_id = $1 OR search_keyword = $2)
                AND ip_address = $3
                AND created_at > NOW() - INTERVAL '10 seconds'
                LIMIT 1
            `;
            
            const recentSearchResult = await this.db.query(checkRecentQuery, [
                params.cveId || null,
                params.keyword || null,
                ipAddress || null
            ]);
            
            // If a recent identical search exists, don't log this one
            if (recentSearchResult.rows.length > 0) {
                console.log(`Skipping duplicate CVE search log for: ${params.cveId || params.keyword}`);
                return;
            }
            
            // No recent identical search found, proceed with logging
            const query = `
                INSERT INTO cve_searches (
                    user_id, 
                    cve_id, 
                    search_keyword, 
                    search_params, 
                    results_count, 
                    ip_address, 
                    user_agent
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            
            await this.db.query(query, [
                userId || null,
                params.cveId || null,
                params.keyword || null,
                JSON.stringify(params),
                resultsCount,
                ipAddress || null,
                userAgent || null
            ]);
            
            console.log(`Logged CVE search to history: ${params.cveId || params.keyword}`);
        } catch (error) {
            // Don't fail the main operation if logging fails
            console.error('Error logging CVE search history:', error);
        }
    }
}
