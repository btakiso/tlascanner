import { Request, Response } from 'express';
import { FileScanService } from '../services/fileScanService';
import { APIError } from '../types/errors';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { validate as isUUID } from 'uuid';

/**
 * Extract client information from the request
 * @param req Express request object
 * @returns Object containing IP address and user agent
 */
function getClientInfo(req: Request): { ip: string; userAgent: string } {
    // Get client IP address
    const ip = 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
        req.socket.remoteAddress || 
        '0.0.0.0';
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    return { ip, userAgent };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const uploadDir = path.join(os.tmpdir(), 'tlascanner-uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
});

// File filter to validate uploads
const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    // Accept all file types but limit size
    callback(null, true);
};

// Create multer upload instance with 32MB size limit
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 32 * 1024 * 1024 // 32MB
    }
});

// Custom error handler for multer errors
export const handleMulterError = (err: any, req: Request, res: Response, next: (err?: any) => void) => {
    if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'File size exceeds the 32MB limit.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message || 'Error uploading file'
        });
    }
    next();
};

// Extend Express Request interface to include file property
declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
        }
    }
}

export class FileScanController {
    private fileScanService: FileScanService;

    constructor(apiKey: string) {
        this.fileScanService = new FileScanService(apiKey);
    }

    /**
     * Upload and scan a file
     */
    async uploadAndScanFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                throw new APIError('No file uploaded', 400);
            }

            const file = req.file;
            const fileBuffer = await fs.promises.readFile(file.path);
            const clientInfo = getClientInfo(req);

            // Scan the file
            const result = await this.fileScanService.scanFile(
                fileBuffer,
                file.originalname,
                file.size,
                file.mimetype,
                clientInfo
            );

            // Clean up the temporary file
            await fs.promises.unlink(file.path);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in uploadAndScanFile:', error);
            
            // Clean up the temporary file if it exists
            if (req.file?.path) {
                try {
                    await fs.promises.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temporary file:', unlinkError);
                }
            }
            
            if (error instanceof APIError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else if (error instanceof Error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'An unknown error occurred'
                });
            }
        }
    }

    /**
     * Get a file scan report by ID
     */
    async getFileScanById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new APIError('Scan ID is required', 400);
            }
            
            let result;
            
            // Check if the ID is a UUID (database ID) or a scan ID
            if (isUUID(id)) {
                // If it's a UUID, use getReportById
                result = await this.fileScanService.getReportById(id);
            } else {
                // If it's not a UUID, assume it's a scan ID
                result = await this.fileScanService.getReportByScanId(id);
            }
            
            if (!result) {
                throw new APIError('Scan not found', 404);
            }
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in getFileScanById:', error);
            
            if (error instanceof APIError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'An error occurred while retrieving the scan'
                });
            }
        }
    }

    /**
     * Get a file scan report by hash
     */
    async getFileScanByHash(req: Request, res: Response): Promise<void> {
        try {
            const { hash } = req.params;
            
            if (!hash) {
                throw new APIError('File hash is required', 400);
            }
            
            const result = await this.fileScanService.getReportByHash(hash);
            
            if (!result) {
                throw new APIError('No scan found for this hash', 404);
            }
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error in getFileScanByHash:', error);
            
            if (error instanceof APIError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'An error occurred while retrieving the scan'
                });
            }
        }
    }

    /**
     * Check the status of a file scan
     * @param req Express request object
     * @param res Express response object
     */
    async checkFileScanStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new APIError('Scan ID is required', 400);
            }
            
            const result = await this.fileScanService.checkScanStatus(id);
            
            if (!result) {
                throw new APIError('Scan not found', 404);
            }
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            if (error instanceof APIError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error('Error checking scan status:', error);
                res.status(500).json({ error: 'Internal server error while checking scan status' });
            }
        }
    }
}
