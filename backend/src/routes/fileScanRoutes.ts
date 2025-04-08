import express from 'express';
import { FileScanController, upload } from '../controllers/fileScanController';
import { Request, Response, NextFunction } from 'express';
import { VT_API_KEY } from '../config';
import { fileOperationsLimiter, strictRateLimiter, statusCheckLimiter } from '../middleware/rateLimiter';

const router = express.Router();
// Handle the case where VT_API_KEY might be undefined
const fileScanController = new FileScanController(VT_API_KEY || '');

// Apply a simplified API key middleware that just passes the VT_API_KEY
router.use((req: Request, res: Response, next: NextFunction) => {
  // Set the API key from environment to the request headers
  if (VT_API_KEY) {
    req.headers['x-api-key'] = VT_API_KEY;
  }
  next();
});

// Route for uploading and scanning a file - apply file operations limiter
router.post('/scan', fileOperationsLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'File size exceeds the limit (300MB)'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Error uploading file'
      });
    }
    
    // If no error, proceed with file scanning
    fileScanController.uploadAndScanFile(req, res);
  });
});

// Route for getting a scan by ID - apply strict limiter
router.get(
    '/:id',
    strictRateLimiter,
    (req, res) => fileScanController.getFileScanById(req, res)
);

// Route for checking scan status - apply status check limiter
router.get(
    '/:id/status',
    statusCheckLimiter,
    (req, res) => fileScanController.checkFileScanStatus(req, res)
);

// Route for getting a scan by file hash - apply strict limiter
router.get(
    '/hash/:hash',
    strictRateLimiter,
    (req, res) => fileScanController.getFileScanByHash(req, res)
);

export default router;
