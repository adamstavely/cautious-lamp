import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Response } from 'express';

/**
 * Headers on every response (docs/API_REFERENCE.md#rate-limiting), which CORS
 * lets browsers read. X-RateLimit-Reset is the seconds until the window
 * resets; Retry-After is sent with a 429 only.
 */
export const RATE_LIMIT_HEADERS = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'];

/**
 * Rate limit guard with clearer errors and per-IP tracking. ThrottlerGuard
 * sets the X-RateLimit-* headers on requests it lets through.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext, detail: ThrottlerLimitDetail): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();
    // Seconds until this client may call again (the window's reset)
    const retryAfter = Math.max(1, detail.timeToBlockExpire || detail.timeToExpire);

    response.setHeader('X-RateLimit-Limit', detail.limit);
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('X-RateLimit-Reset', retryAfter);
    response.setHeader('Retry-After', retryAfter.toString());

    throw new ThrottlerException(
      `Rate limit exceeded: at most ${detail.limit} requests per minute. Retry after ${retryAfter} seconds.`,
    );
  }

  /**
   * Count requests per client IP. Keying by the Authorization header let
   * anyone get a fresh allowance by sending a new random token each time.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
