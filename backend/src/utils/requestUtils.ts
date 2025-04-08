import { Request } from 'express';

/**
 * Extract client information from the request
 * @param req Express request object
 * @returns Object containing IP address and user agent
 */
export function getClientInfo(req: Request): { ip: string; userAgent: string } {
    // Get client IP address
    const ip = 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
        req.socket.remoteAddress || 
        '0.0.0.0';
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    return { ip, userAgent };
}
