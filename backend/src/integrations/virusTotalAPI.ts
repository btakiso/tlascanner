import axios, { AxiosError } from 'axios';
import { APIError } from '../types/errors';
import { APIResponse, CommunityComment, CommunityVote, VTAPIResponse } from '../types/urlScan';
import { VT_API_URL } from '../config';

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

    private handleError(error: any): APIError {
        console.error('VirusTotal API Error:', error.response?.data || error.message);
        if (error.response?.data?.error) {
            throw new APIError(`VirusTotal API Error: ${error.response.data.error.message}`, error.response.status);
        }
        throw new APIError(`VirusTotal API Error: ${error.message}`, error.response?.status || 500);
    }
}
