import { Context, Next } from 'hono';

const rateLimitMap = new Map<string, number[]>();

export const rateLimit = (options: { windowMs: number; max: number }) => {
    return async (c: Context, next: Next) => {

        const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
            c.req.header('x-real-ip') ||
            '127.0.0.1';

        const now = Date.now();
        const windowStart = now - options.windowMs;

        const requestTimestamps = rateLimitMap.get(ip) || [];
        const requestsInWindow = requestTimestamps.filter((timestamp) => timestamp > windowStart);

        if (requestsInWindow.length >= options.max) {

            return c.json({
                error: 'Too many requests, please try again later.',
                message: 'Rate limit exceeded. Please wait a moment before trying again.'
            }, 429);
        }

        requestsInWindow.push(now);
        rateLimitMap.set(ip, requestsInWindow);

        await next();
    };
};

