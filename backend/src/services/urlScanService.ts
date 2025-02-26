import axios, { AxiosError } from 'axios';
import { URLScanModel } from '../models/urlScan';
import { URLScanResult } from '../types/urlScan';
import { APIError, ScanError } from '../types/errors';
import { VirusTotalAPI } from '../integrations/virusTotalAPI';
import { VIRUSTOTAL_API_KEY, VT_API_URL } from '../config';
import dotenv from 'dotenv';
import { URLSanitizer } from '../utils/urlSanitizer';
import db from '../config/database';

dotenv.config();

interface VTAttributes {
  url: string;
  domain: string;
  last_analysis_stats: {
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout: number;
  };
  last_analysis_results: {
    [key: string]: {
      category: string;
      result: string;
      method: string;
    };
  };
  last_analysis_date: string;
  first_submission_date: string;
  last_submission_date: string;
  last_http_response: {
    url?: string;
    ip_address?: string;
    status_code?: number;
    content_length?: number;
    sha256?: string;
    headers?: { [key: string]: string };
    redirect_chain?: string[];
  };
  total_votes?: {
    harmless: number;
    malicious: number;
  };
}

interface VTResponse {
  data: {
    attributes: VTAttributes;
  };
}

interface CommunityFeedback {
  comments: {
    id: string;
    attributes: {
      date: number;
      text: string;
      html: string;
      votes: {
        positive: number;
        negative: number;
        abuse: number;
      };
      tags: string[];
    };
    links: {
      self: string;
    };
    type: string;
  }[];
  votes: {
    id: string;
    attributes: {
      date: number;
      verdict: string;
      value: number;
    };
    links: {
      self: string;
    };
    type: string;
  }[];
  totalVotes: {
    harmless: number;
    malicious: number;
  };
  totalComments: number;
  totalVotesCount: number;
}

export class URLScanService {
  private urlScanModel: URLScanModel;
  private vtApi: VirusTotalAPI;

  constructor() {
    this.urlScanModel = new URLScanModel();
    this.vtApi = new VirusTotalAPI(VIRUSTOTAL_API_KEY!);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.urlScanModel.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new APIError('Database initialization failed', 500);
    }
  }

  private async submitURL(url: string): Promise<string> {
    try {
      const response = await axios.post(
        `${VT_API_URL}/urls`,
        new URLSearchParams({ url }).toString(),
        {
          headers: {
            'x-apikey': VIRUSTOTAL_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      // Extract the ID from the response
      const analysisId = response.data.data.id;
      
      // Get the URL ID from the analysis ID
      const urlId = analysisId.split('-')[1];
      
      return urlId;
    } catch (error) {
      console.error('Error submitting URL:', error);
      throw this.handleError(error);
    }
  }

  private async checkCache(url: string): Promise<URLScanResult | null> {
    try {
      const record = await this.urlScanModel.findRecentScan(url);
      return record ? record.results : null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  private async saveScanResults(url: string, scanId: string, results: URLScanResult): Promise<void> {
    try {
      await this.urlScanModel.saveScan(url, scanId, results);
    } catch (error) {
      console.error('Failed to save scan results:', error);
    }
  }

  public async getLastCachedResult(): Promise<URLScanResult | null> {
    try {
      const record = await this.urlScanModel.findLastScan();
      return record ? record.results : null;
    } catch (error) {
      console.error('Error getting last cached result:', error);
      return null;
    }
  }

  public async getAnalysisResults(id: string): Promise<VTResponse> {
    try {
      if (!VIRUSTOTAL_API_KEY) {
        throw new APIError('VirusTotal API key is not configured', 500);
      }

      const vtReport = await this.vtApi.getURLReport(id) as Promise<VTResponse>;
      return vtReport;
    } catch (error) {
      console.error('Error getting analysis results:', error);
      throw this.handleError(error);
    }
  }

  private async getCommunityFeedback(urlId: string): Promise<CommunityFeedback> {
    try {
      console.log('Fetching community data for URL ID:', urlId);
      const [urlInfo, commentsResponse, votesResponse] = await Promise.all([
        this.vtApi.getURLReport(urlId),
        this.vtApi.getURLComments(urlId),
        this.vtApi.getURLVotes(urlId)
      ]);

      // Get total votes from URL info
      const totalVotes = urlInfo.data.attributes.total_votes || { harmless: 0, malicious: 0 };

      // Comments and votes are already in the correct format from the API
      return {
        comments: commentsResponse.data,
        votes: votesResponse.data,
        totalVotes,
        totalComments: commentsResponse.meta?.count ?? 0,
        totalVotesCount: Math.max(
          votesResponse.meta?.count ?? 0,
          (totalVotes.harmless || 0) + (totalVotes.malicious || 0)
        )
      };
    } catch (error) {
      console.error('Error getting community feedback:', error);
      return {
        comments: [],
        votes: [],
        totalVotes: { harmless: 0, malicious: 0 },
        totalComments: 0,
        totalVotesCount: 0
      };
    }
  }

  public async getScanResults(scanId: string): Promise<URLScanResult> {
    try {
      if (scanId === 'cached') {
        const cachedResult = await this.getLastCachedResult();
        if (!cachedResult) {
          throw new APIError('No cached results found', 404);
        }
        return cachedResult;
      }

      const vtReport = await this.getAnalysisResults(scanId);
      const communityFeedback = await this.getCommunityFeedback(scanId);

      const { attributes } = vtReport.data;
      return {
        status: 'success',
        data: {
          scanId,
          url: attributes.url,
          domain: attributes.domain || '',
          stats: attributes.last_analysis_stats,
          lastAnalysisResults: Object.entries(attributes.last_analysis_results).map(([engine, result]) => ({
            engine,
            category: result.category,
            result: result.result,
            method: result.method
          })),
          communityFeedback: {
            comments: communityFeedback?.comments || [],
            votes: communityFeedback?.votes || [],
            totalVotes: communityFeedback?.totalVotes || { harmless: 0, malicious: 0 },
            totalComments: communityFeedback?.totalComments || 0,
            totalVotesCount: communityFeedback?.totalVotesCount || 0
          },
          scanDate: attributes.last_analysis_date,
          firstSubmissionDate: attributes.first_submission_date,
          lastSubmissionDate: attributes.last_submission_date,
          httpResponse: {
            finalUrl: attributes.last_http_response?.url || '',
            ipAddress: attributes.last_http_response?.ip_address || '',
            statusCode: attributes.last_http_response?.status_code || 0,
            bodyLength: attributes.last_http_response?.content_length || 0,
            bodySha256: attributes.last_http_response?.sha256 || '',
            headers: attributes.last_http_response?.headers || {},
            redirectionChain: attributes.last_http_response?.redirect_chain || []
          }
        }
      };
    } catch (error) {
      console.error('Error getting scan results:', error);
      throw this.handleError(error);
    }
  }

  public async scanURL(url: string): Promise<URLScanResult> {
    try {
      // Sanitize the URL
      const sanitizedUrl = URLSanitizer.sanitize(url);

      // Check cache for recent results
      const cachedResult = await this.checkCache(sanitizedUrl);
      if (cachedResult) {
        return cachedResult;
      }

      // Submit URL for scanning
      const scanId = await this.submitURL(sanitizedUrl);

      // Get analysis results
      const vtReport = await this.getAnalysisResults(scanId);
      const communityFeedback = await this.getCommunityFeedback(scanId);

      const { attributes } = vtReport.data;
      const results: URLScanResult = {
        status: 'success',
        data: {
          scanId,
          url: attributes.url,
          domain: attributes.domain || '',
          stats: attributes.last_analysis_stats,
          lastAnalysisResults: Object.entries(attributes.last_analysis_results).map(([engine, result]) => ({
            engine,
            category: result.category,
            result: result.result,
            method: result.method
          })),
          communityFeedback: {
            comments: communityFeedback?.comments || [],
            votes: communityFeedback?.votes || [],
            totalVotes: communityFeedback?.totalVotes || { harmless: 0, malicious: 0 },
            totalComments: communityFeedback?.totalComments || 0,
            totalVotesCount: communityFeedback?.totalVotesCount || 0
          },
          scanDate: attributes.last_analysis_date,
          firstSubmissionDate: attributes.first_submission_date,
          lastSubmissionDate: attributes.last_submission_date,
          httpResponse: {
            finalUrl: attributes.last_http_response?.url || '',
            ipAddress: attributes.last_http_response?.ip_address || '',
            statusCode: attributes.last_http_response?.status_code || 0,
            bodyLength: attributes.last_http_response?.content_length || 0,
            bodySha256: attributes.last_http_response?.sha256 || '',
            headers: attributes.last_http_response?.headers || {},
            redirectionChain: attributes.last_http_response?.redirect_chain || []
          }
        }
      };

      // Save results to database
      await this.saveScanResults(sanitizedUrl, scanId, results);

      return results;
    } catch (error) {
      console.error('Error scanning URL:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): APIError | ScanError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return new APIError('Invalid VirusTotal API key', 401);
      }
      if (axiosError.response?.status === 429) {
        return new APIError('VirusTotal API rate limit exceeded', 429);
      }
    }
    return new ScanError('Failed to scan URL');
  }
}
