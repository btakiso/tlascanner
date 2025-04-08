import rateLimit from 'express-rate-limit';

// Default rate limit settings
const defaultLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300 // limit each IP to 300 requests per windowMs (increased from 100)
};

// Stricter limits for intensive operations
const strictLimit = {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 150 // limit each IP to 150 requests per windowMs (increased from 50)
};

// More permissive limits for file operations
const fileOperationsLimit = {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50 // limit each IP to 50 file uploads per 5 minutes (increased from 20)
};

// More permissive limits for status check operations
const statusCheckLimit = {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200 // limit each IP to 200 status checks per 5 minutes (increased from 60)
};

export const defaultRateLimiter = rateLimit({
    ...defaultLimit,
    message: 'Too many requests from this IP, please try again later'
});

export const strictRateLimiter = rateLimit({
    ...strictLimit,
    message: 'Rate limit exceeded for intensive operations'
});

export const fileOperationsLimiter = rateLimit({
    ...fileOperationsLimit,
    message: 'File upload limit exceeded'
});

export const statusCheckLimiter = rateLimit({
    ...statusCheckLimit,
    message: 'Status check rate limit exceeded, please try again later'
});
