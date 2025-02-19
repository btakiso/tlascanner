import { Request, Response } from 'express';
import { URLScanService } from '../services/urlScanService';
import { URLScanModel } from '../models/urlScan';
import { APIError, ValidationError, ScanError } from '../types/errors';
import { URLSanitizer } from '../utils/urlSanitizer';

export class URLScanController {
  private urlScanService: URLScanService;
  private urlScanModel: URLScanModel;

  constructor() {
    this.urlScanService = new URLScanService();
    this.urlScanModel = new URLScanModel();
  }

  scanURL = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received URL scan request:', req.body);
      const { url } = req.body;

      // Check if URL is provided
      if (!url) {
        console.log('URL is missing in request body');
        throw new ValidationError('URL is required in the request body');
      }

      // Check if URL is a string
      if (typeof url !== 'string') {
        console.log('URL is not a string:', typeof url);
        throw new ValidationError('URL must be a string');
      }

      // Check URL length
      if (url.length > 2048) {
        console.log('URL exceeds maximum length:', url.length);
        throw new ValidationError('URL exceeds maximum length of 2048 characters');
      }

      // Validate URL format
      if (!URLSanitizer.isValidUrl(url)) {
        console.log('Invalid URL format:', url);
        throw new ValidationError('Invalid URL format. URL must start with http:// or https://');
      }

      // Get domain for logging
      const domain = URLSanitizer.getDomain(url);
      console.log(`Processing scan request for domain: ${domain}`);

      const results = await this.urlScanService.scanURL(url);
      console.log('Scan completed successfully:', results);

      // Format the response
      const response = {
        status: 'success',
        data: {
          url: url,
          domain: domain,
          scanId: results.data?.scanId || 'cached',
          stats: results.data?.stats || {
            harmless: 0,
            malicious: 0,
            suspicious: 0,
            undetected: 0,
            timeout: 0
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in URL scan controller:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          error: 'validation_error',
          message: error.message,
        });
        return;
      }

      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          status: 'error',
          error: 'api_error',
          message: error.message,
          code: error.code,
        });
        return;
      }

      if (error instanceof ScanError) {
        res.status(500).json({
          status: 'error',
          error: 'scan_error',
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        error: 'internal_error',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      });
    }
  };

  getScanResults = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scanId } = req.params;

      if (!scanId) {
        throw new ValidationError('Scan ID is required');
      }

      // Use the model to fetch results
      const results = await this.urlScanModel.findByScanId(scanId);
      
      if (!results) {
        res.status(404).json({
          status: 'error',
          error: 'not_found',
          message: 'Scan results not found'
        });
        return;
      }

      // Format the response
      const response = {
        status: 'success',
        data: {
          url: results.url,
          domain: URLSanitizer.getDomain(results.url),
          scanId: results.scanId,
          threatLevel: this.determineThreatLevel(results.results),
          stats: results.results?.data?.stats || {
            harmless: 0,
            malicious: 0,
            suspicious: 0,
            undetected: 0,
            timeout: 0
          },
          results: results.results,
          scannedAt: results.createdAt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in get scan results:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          error: 'validation_error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        error: 'internal_error',
        message: 'Failed to fetch scan results'
      });
    }
  };

  private determineThreatLevel(results: any): string {
    if (!results?.data?.attributes?.stats) {
      return 'unknown';
    }

    const stats = results.data.attributes.stats;
    if (stats.malicious > 0) {
      return 'malicious';
    } else if (stats.suspicious > 0) {
      return 'suspicious';
    } else {
      return 'safe';
    }
  }

  private calculateThreatLevel(stats: { 
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout: number;
  }): string {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const maliciousRatio = (stats.malicious + stats.suspicious) / total;

    if (maliciousRatio >= 0.5) return 'high';
    if (maliciousRatio >= 0.2) return 'medium';
    if (maliciousRatio > 0) return 'low';
    return 'safe';
  }
}
