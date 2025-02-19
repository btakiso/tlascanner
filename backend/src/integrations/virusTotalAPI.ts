import axios, { AxiosError } from 'axios';
import { APIError } from '../types/errors';

export class VirusTotalAPI {
    private apiKey: string;
    private baseURL: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseURL = 'https://www.virustotal.com/api/v3';
    }

    private getHeaders() {
        return {
            'x-apikey': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    async analyzeURL(url: string): Promise<{ data: { id: string } }> {
        try {
            const response = await axios.post(
                `${this.baseURL}/urls`,
                new URLSearchParams({ url }),
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new APIError(`VirusTotal API Error: ${error.message}`, error.response?.status);
            }
            throw error;
        }
    }

    async getAnalysisResults(id: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseURL}/analyses/${id}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new APIError(`VirusTotal API Error: ${error.message}`, error.response?.status);
            }
            throw error;
        }
    }

    async getURLReport(urlId: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseURL}/urls/${urlId}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new APIError(`VirusTotal API Error: ${error.message}`, error.response?.status);
            }
            throw error;
        }
    }
}
