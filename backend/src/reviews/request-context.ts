import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthedRequest } from '../auth/principal';
import { ActingUser } from './review.types';

/**
 * Header values can only carry ASCII, so clients send free text (names,
 * passwords) URL-encoded with encodeURIComponent. Values that don't decode
 * are used as sent.
 */
function decodeHeaderValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function header(req: Request, name: string, max: number): string | null {
  const raw = req.headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const trimmed = decodeHeaderValue(value).trim().slice(0, max);
  return trimmed || null;
}

/**
 * Who is acting: the signed-in user, or for a service principal (an API key)
 * the person it says it acts for in `x-user-email` / `x-user-name`, which is
 * recorded for display only (docs/AUTH.md).
 */
export function actingUserFrom(req: Request): ActingUser {
  const principal = (req as AuthedRequest).principal;
  if (principal?.type === 'user') return { email: principal.email, name: principal.name };
  return {
    email: header(req, 'x-user-email', 254)?.toLowerCase() ?? null,
    name: header(req, 'x-user-name', 200),
  };
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): ActingUser =>
  actingUserFrom(ctx.switchToHttp().getRequest<Request>()),
);

/** The `x-review-password` header, URL-encoded by the client */
export const ReviewPassword = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const raw = ctx.switchToHttp().getRequest<Request>().headers['x-review-password'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  // Not trimmed: spaces can be part of a password
  return typeof value === 'string' && value.length > 0 ? decodeHeaderValue(value).slice(0, 1024) : undefined;
});

/** Origin to build absolute URLs with: `PUBLIC_API_URL`, else the request's own origin */
export const PublicBaseUrl = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const configured = process.env.PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  const req = ctx.switchToHttp().getRequest<Request>();
  return `${req.protocol}://${req.get('host')}`;
});
