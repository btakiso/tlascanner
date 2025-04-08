import { Request, Response, NextFunction } from 'express';
import { VT_API_KEY } from '../config';
import db from '../config/database';
import { APIError } from '../types/errors';

/**
 * Middleware to validate API key from request headers
 * If no API key is provided in the request, use the default API key from environment variables
 */
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from request header or use default from environment
    const providedApiKey = req.headers['x-api-key'] as string;
    const isUsingDefaultKey = !providedApiKey && VT_API_KEY;
    const apiKey = providedApiKey || VT_API_KEY;

    if (!apiKey) {
      throw new APIError('API key is required', 401);
    }

    // If using the default key from environment, skip database validation
    if (isUsingDefaultKey) {
      // Add a placeholder API key info to the request
      (req as any).apiKey = {
        key: apiKey,
        user_id: 'system',
        name: 'Default System Key',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        active: true
      };
      return next();
    }

    // Query the database to validate the provided API key
    const result = await db.query(
      'SELECT * FROM api_keys WHERE key = $1 AND active = true AND expires_at > NOW()',
      [apiKey]
    );

    if (result.rows.length === 0) {
      throw new APIError('Invalid or expired API key', 401);
    }

    // Add the API key info to the request for use in controllers
    (req as any).apiKey = result.rows[0];
    
    next();
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error during API key validation' });
  }
};
