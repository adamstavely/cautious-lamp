import { ThrottlerModuleOptions } from '@nestjs/throttler';

/** Requests per minute per client IP, across all routes */
export const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE) || 600;

/**
 * Rate limiting configuration.
 *
 * One throttler: @nestjs/throttler v6 applies every named throttler to every
 * route, so the old 'strict' (20/min) and 'auth' (10/min) entries capped the
 * whole API at 10 requests a minute.
 */
export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: 60000, // 1 minute
      limit: RATE_LIMIT_PER_MINUTE,
    },
  ],
};
