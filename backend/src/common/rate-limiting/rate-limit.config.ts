import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Rate limiting configuration
 * Limits are per IP address or API key
 */
export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      name: 'strict',
      ttl: 60000, // 1 minute
      limit: 20, // 20 requests per minute (for sensitive endpoints)
    },
    {
      name: 'auth',
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute (for authentication endpoints)
    },
  ],
};

/**
 * Get rate limit configuration for a specific endpoint
 */
export function getRateLimitConfig(endpoint: string): { ttl: number; limit: number } {
  // Authentication endpoints - strictest limits
  if (endpoint.includes('/auth/') || endpoint.includes('/login') || endpoint.includes('/api-keys')) {
    return { ttl: 60000, limit: 10 };
  }

  // Write operations - stricter limits
  if (endpoint.includes('/create') || endpoint.includes('/update') || endpoint.includes('/delete') || endpoint.includes('/post')) {
    return { ttl: 60000, limit: 30 };
  }

  // Read operations - default limits
  return { ttl: 60000, limit: 100 };
}

