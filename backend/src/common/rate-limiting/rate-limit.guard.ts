import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

/**
 * Custom rate limit guard that provides better error messages
 * and supports API key-based rate limiting
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Get rate limit info
    const limit = 100; // Default limit
    const retryAfter = 60; // Default 60 seconds
    
    // Add rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + retryAfter * 1000).toISOString());
    response.setHeader('Retry-After', retryAfter.toString());

    throw new ThrottlerException(
      `Rate limit exceeded. Maximum ${limit} requests per minute. ` +
      `Please retry after ${retryAfter} seconds. ` +
      `If you need higher limits, contact support or upgrade your plan.`
    );
  }

  protected getTracker(req: Record<string, any>): string {
    // Use API key if available, otherwise use IP address
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      // Hash the API key for tracking (don't expose it)
      return `api-key:${this.hashString(apiKey)}`;
    }
    
    // Fall back to IP address
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  private hashString(str: string): string {
    // Simple hash for tracking (not cryptographic)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

