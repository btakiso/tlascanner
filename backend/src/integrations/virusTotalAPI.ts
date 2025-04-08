import axios, { AxiosError } from 'axios';
import { APIError } from '../types/errors';
import { APIResponse, CommunityComment, CommunityVote, VTAPIResponse } from '../types/urlScan';
import { VT_API_URL } from '../config';
import FormData = require('form-data');
import * as fs from 'fs';
import * as crypto from 'crypto';

export class VirusTotalAPI {
    private apiKey: string;
    private baseURL: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseURL = VT_API_URL;
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
            throw this.handleError(error);
        }
    }

    /**
     * Get all pages of results using the cursor-based pagination
     * @param endpoint The API endpoint to fetch from
     * @returns Array of all items from all pages
     */
    private async getAllPages<T>(endpoint: string): Promise<T[]> {
        let allData: T[] = [];
        let nextCursor: string | undefined;

        do {
            const response = await axios.get<VTAPIResponse<T>>(endpoint, {
                headers: this.getHeaders(),
                params: {
                    limit: 40,
                    ...(nextCursor && { cursor: nextCursor })
                }
            });

            allData = allData.concat(response.data.data.data || []);
            nextCursor = response.data.data.meta?.cursor;

            // If there's no next cursor or we've collected a lot of data, stop
            if (!nextCursor || allData.length >= 100) break;

        } while (nextCursor);

        return allData;
    }

    public async getURLComments(urlId: string): Promise<APIResponse<CommunityComment>> {
        try {
            const endpoint = `${this.baseURL}/urls/${urlId}/comments`;
            const response = await axios.get<VTAPIResponse<CommunityComment>>(endpoint, { 
                headers: this.getHeaders(),
                params: {
                    limit: 40 // Maximum comments per request
                }
            });
            
            return {
                data: response.data.data.data,
                meta: response.data.data.meta,
                links: response.data.data.links
            };
        } catch (error) {
            // Return empty response that matches APIResponse<CommunityComment> type
            const emptyResponse: APIResponse<CommunityComment> = {
                data: [],
                meta: { count: 0 },
                links: { self: '' }
            };
            console.error('Error fetching URL comments:', error);
            return emptyResponse;
        }
    }

    public async getURLVotes(urlId: string): Promise<APIResponse<CommunityVote>> {
        try {
            const endpoint = `${this.baseURL}/urls/${urlId}/votes`;
            const response = await axios.get<VTAPIResponse<CommunityVote>>(endpoint, { 
                headers: this.getHeaders(),
                params: {
                    limit: 40 // Maximum votes per request
                }
            });

            return {
                data: response.data.data.data,
                meta: response.data.data.meta,
                links: response.data.data.links
            };
        } catch (error) {
            // Return empty response that matches APIResponse<CommunityVote> type
            const emptyResponse: APIResponse<CommunityVote> = {
                data: [],
                meta: { count: 0 },
                links: { self: '' }
            };
            console.error('Error fetching URL votes:', error);
            return emptyResponse;
        }
    }

    async getURLCommunityData(urlId: string): Promise<any> {
        try {
            // Log the URL ID we're querying
            console.log('Fetching community data for URL ID:', urlId);

            // First get the URL info
            const urlInfo = await this.getURLReport(urlId);
            console.log('URL Info:', JSON.stringify(urlInfo.data, null, 2));

            // Use the total_votes from the URL info
            const totalVotes = urlInfo.data.attributes.total_votes || { harmless: 0, malicious: 0 };

            const [comments, votes] = await Promise.all([
                this.getURLComments(urlId).catch(error => {
                    console.log('Comments request failed:', error.response?.status, error.response?.data);
                    return {
                        data: [],
                        meta: { count: 0 },
                        links: { self: `${this.baseURL}/urls/${urlId}/comments` }
                    } as APIResponse<CommunityComment>;
                }),
                this.getURLVotes(urlId).catch(error => {
                    console.log('Votes request failed:', error.response?.status, error.response?.data);
                    return {
                        data: [],
                        meta: { count: 0 },
                        links: { self: `${this.baseURL}/urls/${urlId}/votes` }
                    } as APIResponse<CommunityVote>;
                })
            ]);

            // Log raw response data for debugging
            console.log('Comments response:', JSON.stringify(comments, null, 2));
            console.log('Votes response:', JSON.stringify(votes, null, 2));
            
            const communityData = {
                comments: Array.isArray(comments.data) ? comments.data : [],
                votes: Array.isArray(votes.data) ? votes.data : [],
                meta: {
                    comments_count: comments.meta?.count || 0,
                    votes_count: votes.meta?.count || 0
                },
                total_votes: totalVotes || { harmless: 0, malicious: 0 }
            };

            console.log('Processed community data:', JSON.stringify(communityData, null, 2));
            return communityData;
        } catch (error) {
            console.error('Error fetching community data:', error);
            // Return empty data instead of throwing
            return {
                comments: [],
                votes: [],
                meta: {
                    comments_count: 0,
                    votes_count: 0
                },
                total_votes: {
                    harmless: 0,
                    malicious: 0
                },
                data: [],
                links: {
                    self: ''
                }
            };
        }
    }

    /**
     * Calculate file hashes (MD5, SHA-1, SHA-256)
     * @param filePath Path to the file
     * @returns Object containing file hashes
     */
    async calculateFileHashes(filePath: string): Promise<{ md5: string; sha1: string; sha256: string }> {
        return new Promise((resolve, reject) => {
            try {
                const fileBuffer = fs.readFileSync(filePath);
                
                const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
                const sha1Hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');
                const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
                
                resolve({
                    md5: md5Hash,
                    sha1: sha1Hash,
                    sha256: sha256Hash
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Check if a file has been previously scanned using its hash
     * @param hash File hash (SHA-256, SHA-1, or MD5)
     * @returns Scan report if available
     */
    async getFileReportByHash(hash: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseURL}/files/${hash}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                // File not found in VirusTotal database
                return null;
            }
            throw this.handleError(error);
        }
    }

    /**
     * Upload a file to VirusTotal for scanning
     * @param filePath Path to the file to be scanned
     * @returns Upload response with analysis ID
     */
    async uploadFile(filePath: string): Promise<any> {
        try {
            // Create form data with the file
            const formData = new FormData();
            const fileStream = fs.createReadStream(filePath);
            formData.append('file', fileStream);
            
            // Custom headers for form data
            const headers = {
                ...formData.getHeaders(),
                'x-apikey': this.apiKey
            };
            
            // Upload the file
            const response = await axios.post(
                `${this.baseURL}/files`,
                formData,
                { headers }
            );
            
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Upload a file using a buffer instead of a file path
     * @param fileBuffer Buffer containing the file data
     * @param fileName Original file name
     * @returns Upload response with analysis ID
     */
    async uploadFileBuffer(fileBuffer: Buffer, fileName: string): Promise<any> {
        try {
            // Create form data with the file buffer
            const formData = new FormData();
            formData.append('file', fileBuffer, { filename: fileName });
            
            // Custom headers for form data
            const headers = {
                ...formData.getHeaders(),
                'x-apikey': this.apiKey
            };
            
            // Upload the file
            const response = await axios.post(
                `${this.baseURL}/files`,
                formData,
                { headers }
            );
            
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get the analysis results for a file scan
     * @param id Analysis ID returned from file upload
     * @returns Analysis results
     */
    async getFileAnalysisResults(id: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseURL}/analyses/${id}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get file behavior report (sandbox analysis)
     * @param hash File hash (SHA-256, SHA-1, or MD5)
     * @returns Behavior report if available
     */
    async getFileBehaviorReport(hash: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseURL}/files/${hash}/behaviours`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                // Behavior report not available
                return null;
            }
            throw this.handleError(error);
        }
    }

    private handleError(error: any): APIError {
        console.error('VirusTotal API Error:', error.response?.data || error.message);
        if (error.response?.data?.error) {
            throw new APIError(`VirusTotal API Error: ${error.response.data.error.message}`, error.response.status);
        }
        throw new APIError(`VirusTotal API Error: ${error.message}`, error.response?.status || 500);
    }
}
