import { Request, Response } from 'express';
import { VirusTotalAPI } from '../integrations/virusTotalAPI';
import { URLSanitizer } from '../utils/urlSanitizer';
import { APIError } from '../types/errors';
import { VIRUSTOTAL_API_KEY } from '../config';

export class CommunityFeedbackController {
  private vtAPI: VirusTotalAPI;

  constructor() {
    if (!VIRUSTOTAL_API_KEY) {
      throw new Error('VirusTotal API key is not configured');
    }
    this.vtAPI = new VirusTotalAPI(VIRUSTOTAL_API_KEY);
  }

  /**
   * Get community feedback for a URL
   */
  public async getCommunityFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        throw new APIError('URL is required', 400);
      }

      // Sanitize the URL
      const sanitizedUrl = URLSanitizer.sanitize(url);

      // Get community feedback from VirusTotal
      const communityData = await this.vtAPI.getURLCommunityData(sanitizedUrl);

      res.json({
        status: 'success',
        data: {
          comments: communityData.comments,
          votes: communityData.votes,
          meta: communityData.meta
        }
      });
    } catch (error) {
      console.error('Error getting community feedback:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          status: 'error',
          error: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          error: 'Failed to get community feedback'
        });
      }
    }
  }
}
