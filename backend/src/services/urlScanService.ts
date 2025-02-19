import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { ScanError, APIError } from '../types/errors';
import { URLScanModel, URLScanRecord } from '../models/urlScan';
import { URLSanitizer } from '../utils/urlSanitizer';
import { VirusTotalAPI } from '../integrations/virusTotalAPI';
import db from '../config/database';
import { URLScanResult } from '../types/urlScan';

dotenv.config();

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VT_API_URL = 'https://www.virustotal.com/api/v3';

export class URLScanService {
  private urlScanModel: URLScanModel;

  constructor() {
    this.urlScanModel = new URLScanModel();
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
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          throw new APIError('Invalid VirusTotal API key', 401);
        }
        if (axiosError.response?.status === 429) {
          throw new APIError('VirusTotal API rate limit exceeded', 429);
        }
      }
      throw new ScanError('Failed to submit URL for scanning');
    }
  }

  private async checkCache(url: string): Promise<URLScanRecord | null> {
    try {
      return await this.urlScanModel.findRecentScan(url);
    } catch (error) {
      console.error('Cache check failed:', error);
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

  public async getLastCachedResult(): Promise<URLScanRecord | null> {
    try {
      return await this.urlScanModel.findLastScan();
    } catch (error) {
      console.error('Failed to get last cached result:', error);
      return null;
    }
  }

  public async getAnalysisResults(id: string): Promise<any> {
    try {
      // Extract the resource ID from the analysis ID
      const resourceId = id.includes('-') ? id.split('-')[1] : id;
      
      // Get the URL info
      const response = await axios.get(`${VT_API_URL}/urls/${resourceId}`, {
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
        },
      });

      // Extract the last analysis results
      const lastAnalysisResults = response.data.data.attributes.last_analysis_results;
      const stats = response.data.data.attributes.last_analysis_stats;

      return {
        data: {
          attributes: {
            url: response.data.data.attributes.url,
            stats,
            results: lastAnalysisResults,
            first_submission_date: response.data.data.attributes.first_submission_date,
            last_submission_date: response.data.data.attributes.last_submission_date,
            last_http_response: response.data.data.attributes.last_http_response
          }
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          throw new APIError('Scan results not found', 404);
        }
        if (axiosError.response?.status === 401) {
          throw new APIError('Invalid VirusTotal API key', 401);
        }
        if (axiosError.response?.status === 429) {
          throw new APIError('VirusTotal API rate limit exceeded', 429);
        }
      }
      console.error('Error getting analysis results:', error);
      throw new APIError('Failed to get analysis results', 500);
    }
  }

  public async getScanResults(scanId: string): Promise<URLScanResult> {
    try {
      if (scanId === 'cached') {
        const cachedResult = await this.getLastCachedResult();
        if (!cachedResult) {
          throw new APIError('No cached results found', 404);
        }
        return cachedResult.results;
      }

      const vtResults = await this.getAnalysisResults(scanId);
      const attributes = vtResults.data.attributes;

      return {
        status: 'success',
        data: {
          scanId,
          url: attributes.url || '',
          domain: new URL(attributes.url || '').hostname,
          stats: {
            harmless: attributes.stats.harmless || 0,
            malicious: attributes.stats.malicious || 0,
            suspicious: attributes.stats.suspicious || 0,
            undetected: attributes.stats.undetected || 0,
            timeout: attributes.stats.timeout || 0
          },
          lastAnalysisResults: attributes.results || {},
          scanDate: new Date().toISOString(),
          firstSubmissionDate: attributes.first_submission_date ? new Date(attributes.first_submission_date * 1000).toISOString() : new Date().toISOString(),
          lastSubmissionDate: attributes.last_submission_date ? new Date(attributes.last_submission_date * 1000).toISOString() : new Date().toISOString(),
          httpResponse: {
            finalUrl: attributes.last_http_response?.url || attributes.url || '',
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
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Failed to get scan results', 500);
    }
  }

  async scanURL(url: string): Promise<URLScanResult> {
    try {
      if (!VIRUSTOTAL_API_KEY) {
        throw new APIError('VirusTotal API key not configured', 500);
      }

      // Validate URL before sanitizing
      if (!url || !URLSanitizer.isValidUrl(url)) {
        throw new APIError('Invalid URL format', 400);
      }

      // Sanitize the URL
      let sanitizedUrl: string;
      try {
        sanitizedUrl = URLSanitizer.sanitize(url);
      } catch (error) {
        throw new APIError('Invalid URL format', 400);
      }

      // Check cache for recent results
      const cachedResult = await this.checkCache(sanitizedUrl);
      if (cachedResult) {
        return cachedResult.results;
      }

      // Submit URL for scanning
      const id = await this.submitURL(sanitizedUrl);
      
      // Wait for initial analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get analysis results
      const vtResults = await this.getAnalysisResults(id);
      const attributes = vtResults.data.attributes;

      // Transform the data to match our frontend expectations
      const transformedResults: URLScanResult = {
        status: 'success',
        data: {
          scanId: id,
          url: sanitizedUrl,
          domain: new URL(sanitizedUrl).hostname,
          stats: {
            harmless: attributes.stats.harmless || 0,
            malicious: attributes.stats.malicious || 0,
            suspicious: attributes.stats.suspicious || 0,
            undetected: attributes.stats.undetected || 0,
            timeout: attributes.stats.timeout || 0
          },
          lastAnalysisResults: attributes.results || {},
          scanDate: new Date().toISOString(),
          firstSubmissionDate: attributes.first_submission_date ? new Date(attributes.first_submission_date * 1000).toISOString() : new Date().toISOString(),
          lastSubmissionDate: attributes.last_submission_date ? new Date(attributes.last_submission_date * 1000).toISOString() : new Date().toISOString(),
          httpResponse: {
            finalUrl: attributes.last_http_response?.url || sanitizedUrl,
            ipAddress: attributes.last_http_response?.ip_address || '',
            statusCode: attributes.last_http_response?.status_code || 0,
            bodyLength: attributes.last_http_response?.content_length || 0,
            bodySha256: attributes.last_http_response?.sha256 || '',
            headers: attributes.last_http_response?.headers || {},
            redirectionChain: attributes.last_http_response?.redirect_chain || []
          }
        }
      };

      // Cache the results
      await this.saveScanResults(sanitizedUrl, id, transformedResults);

      return transformedResults;
    } catch (error) {
      if (error instanceof APIError || error instanceof ScanError) {
        throw error;
      }
      throw new ScanError('Failed to scan URL');
    }
  }
}
