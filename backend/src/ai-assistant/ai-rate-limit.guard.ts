import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthedRequest } from '../auth/principal';

/** Claude calls per person per minute, across Eero and AI suggestions */
export const AI_REQUESTS_PER_MINUTE = Number(process.env.AI_REQUESTS_PER_MINUTE) || 10;
const WINDOW_MS = 60_000;

/** A sliding one-minute window of calls per key. `take` returns the seconds to wait, or 0 when the call may go ahead. */
export class SlidingWindowLimiter {
  private readonly calls = new Map<string, number[]>();

  constructor(readonly limit: number, private readonly now: () => number = Date.now) {}

  take(key: string): number {
    const now = this.now();
    const recent = (this.calls.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
    if (recent.length >= this.limit) {
      this.calls.set(key, recent);
      return Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    }
    recent.push(now);
    this.calls.set(key, recent);
    this.prune(now);
    return 0;
  }

  /** Forget keys with no calls in the window, so the map doesn't grow forever */
  private prune(now: number) {
    if (this.calls.size < 1000) return;
    for (const [key, times] of this.calls) {
      if (!times.some((at) => now - at < WINDOW_MS)) this.calls.delete(key);
    }
  }
}

/**
 * A per-person limit on the routes that call Claude, on top of the global
 * per-IP throttle: each call costs money, and people behind one proxy share
 * an IP. Runs after the AuthGuard, so the principal is known. Counts are kept
 * in memory per process, like the throttler's own.
 */
@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly limiter = new SlidingWindowLimiter(AI_REQUESTS_PER_MINUTE);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const key = request.principal ? `${request.principal.type}:${request.principal.id}` : `ip:${request.ip}`;
    const retryAfter = this.limiter.take(key);
    if (retryAfter) {
      context.switchToHttp().getResponse<Response>().setHeader('Retry-After', String(retryAfter));
      throw new HttpException(
        `You can ask the AI assistant ${this.limiter.limit} times a minute. Try again in ${retryAfter} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
