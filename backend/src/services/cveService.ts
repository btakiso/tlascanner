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
            // First check cache
            const cachedResults = await this.getCachedResults(params);
            if (cachedResults) {
                return cachedResults;
            }

            // If not in cache, fetch from NVD
            const results = await this.nvdClient.searchCVEs(params);
            
            // Cache the results
            await this.cacheResults(params, results);
            
            return results;
        } catch (error) {
            throw new Error(`CVE Search Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getCVEById(cveId: string): Promise<CVEItem | null> {
        try {
            // Check cache first
            const cachedCVE = await this.getCachedCVE(cveId);
            if (cachedCVE) {
                return cachedCVE;
            }

            // If not in cache, fetch from NVD
            const response = await this.nvdClient.getCVEById(cveId);
            if (response.vulnerabilities.length > 0) {
                const cveItem = response.vulnerabilities[0];
                
                // Cache the CVE
                await this.cacheCVE(cveItem);
                
                return cveItem;
            }
            
            return null;
        } catch (error) {
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
            return JSON.parse(result.rows[0].response_data);
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
                const responseData = result.rows[0].response_data;
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
}
