import rateLimit from 'express-rate-limit';

// Default rate limit settings
const defaultLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

// Stricter limits for intensive operations
const strictLimit = {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50 // limit each IP to 50 requests per windowMs
};

// Very strict limits for file operations
const fileOperationsLimit = {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // limit each IP to 10 file uploads per hour
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
