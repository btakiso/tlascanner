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
            
            if (params.keyword) {
                queryParams.keywordSearch = params.keyword;
            }
            if (params.cveId) {
                queryParams.cveId = params.cveId;
            }
            if (params.startIndex !== undefined) {
                queryParams.startIndex = params.startIndex;
            }
            if (params.resultsPerPage !== undefined) {
                queryParams.resultsPerPage = params.resultsPerPage;
            }

            const response = await this.axiosInstance.get('/', {
                params: queryParams
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`NVD API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async getCVEById(cveId: string): Promise<CVESearchResponse> {
        try {
            const response = await this.axiosInstance.get('/', {
                params: {
                    cveId
                }
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`NVD API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
