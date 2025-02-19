import { Router } from 'express';
import { URLScanService } from '../services/urlScanService';
import { APIError } from '../types/errors';

const router = Router();
const urlScanService = new URLScanService();

// Submit URL for scanning
router.post('/scan', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      throw new APIError('URL is required', 400);
    }

    const result = await urlScanService.scanURL(url);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get scan results
router.get('/scan/results/:scanId', async (req, res, next) => {
  try {
    const { scanId } = req.params;
    if (!scanId) {
      throw new APIError('Scan ID is required', 400);
    }

    const result = await urlScanService.getScanResults(scanId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
