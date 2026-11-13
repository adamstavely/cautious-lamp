import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';
import { RATE_LIMIT_PER_MINUTE } from './rate-limit.config';

/**
 * Rate limit guard with clearer errors and per-IP tracking
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();
    const retryAfter = 60;

    response.setHeader('X-RateLimit-Limit', RATE_LIMIT_PER_MINUTE);
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('Retry-After', retryAfter.toString());

    throw new ThrottlerException(
      `Rate limit exceeded: at most ${RATE_LIMIT_PER_MINUTE} requests per minute. Retry after ${retryAfter} seconds.`,
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
