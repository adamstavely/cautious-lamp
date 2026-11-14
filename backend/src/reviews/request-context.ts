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
 * Who is acting. A signed-in user is identified by their verified email and
 * carries their roles and permissions. A service principal (an API key) has no
 * reviewer identity: `x-user-name` (else `x-user-email`) only labels what it
 * records, so the header can't satisfy an approved-email list or make it a
 * review's owner (docs/AUTH.md). It acts as a review admin only with `review:admin`.
 */
export function actingUserFrom(req: Request): ActingUser {
  const principal = (req as AuthedRequest).principal;
  if (principal?.type === 'user') {
    return {
      email: principal.email.trim().toLowerCase(),
      name: principal.name,
      roles: principal.roles,
      permissions: principal.permissions,
    };
  }
  return {
    email: null,
    name: header(req, 'x-user-name', 200) ?? header(req, 'x-user-email', 254),
    roles: [],
    permissions: principal?.permissions ?? new Set(),
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
