const rateLimit = require('express-rate-limit');

// Define rate limiter middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes (time window)
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    headers: true, // Send rate limit info in headers
});

module.exports = rateLimiter;