import axios from 'axios';
import { 
    CVESearchParams, 
    CVESearchResponse, 
    CVEItem 
} from '../types/cve';

const NVD_API_BASE_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

export class NVDAPIClient {
    private readonly apiKey?: string;
    private readonly axiosInstance;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
        this.axiosInstance = axios.create({
            baseURL: NVD_API_BASE_URL,
            headers: apiKey ? {
                'apiKey': apiKey
            } : {}
        });
    }

    async searchCVEs(params: CVESearchParams): Promise<CVESearchResponse> {
        try {
            const queryParams: Record<string, string | number> = {};
            
            // Validate and build query parameters
            if (params.keyword) {
                queryParams.keywordSearch = params.keyword;
                // Add keywordExactMatch if the keyword contains multiple terms
                if (params.keyword.includes(' ')) {
                    queryParams.keywordExactMatch = '';
                }
            } else if (params.cveId) {
                // Validate CVE ID format
                if (!params.cveId.match(/^CVE-\d{4}-\d{4,}$/)) {
                    throw new Error(`Invalid CVE ID format: ${params.cveId}`);
                }
                queryParams.cveId = params.cveId;
            } else {
                throw new Error('Either keyword or cveId must be provided');
            }
            
            // Add pagination parameters
            if (params.startIndex !== undefined) {
                queryParams.startIndex = params.startIndex;
            }
            if (params.resultsPerPage !== undefined) {
                queryParams.resultsPerPage = params.resultsPerPage;
            }

            console.log(`Making NVD API request with params:`, queryParams);
            const response = await this.axiosInstance.get('/', {
                params: queryParams
            });

            // Check if the response contains the expected data structure
            if (!response.data || !response.data.vulnerabilities) {
                throw new Error('Invalid response format from NVD API');
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle rate limiting (429) specifically
                if (error.response?.status === 429) {
                    throw new Error('NVD API rate limit exceeded. Please try again later.');
                }
                
                // Handle not found (404) specifically
                if (error.response?.status === 404) {
                    return {
                        resultsPerPage: 0,
                        startIndex: 0,
                        totalResults: 0,
                        format: 'NVD_CVE',
                        version: '2.0',
                        timestamp: new Date().toISOString(),
                        vulnerabilities: []
                    };
                }
                
                throw new Error(`NVD API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async getCVEById(cveId: string): Promise<CVESearchResponse> {
        try {
            // Validate CVE ID format before making the request
            if (!cveId || !cveId.match(/^CVE-\d{4}-\d{4,}$/)) {
                throw new Error(`Invalid CVE ID format: ${cveId}`);
            }

            const response = await this.axiosInstance.get('/', {
                params: {
                    cveId
                }
            });

            // Check if the response contains the expected data structure
            if (!response.data || !response.data.vulnerabilities) {
                throw new Error('Invalid response format from NVD API');
            }

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle rate limiting (429) specifically
                if (error.response?.status === 429) {
                    throw new Error('NVD API rate limit exceeded. Please try again later.');
                }
                throw new Error(`NVD API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
