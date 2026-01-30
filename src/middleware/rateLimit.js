import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 10, // Limit each IP to 10 requests per `window` (here, per 1 minute)
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
