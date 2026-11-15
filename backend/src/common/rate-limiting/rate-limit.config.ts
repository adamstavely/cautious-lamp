import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Requests per minute per client IP for each route: the throttler keys its
 * count by route handler and IP (docs/API_REFERENCE.md#rate-limiting)
 */
export const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE) || 600;

/**
 * Rate limiting configuration. Counts are kept in memory, per instance.
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
