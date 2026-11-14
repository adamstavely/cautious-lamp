import { ExecutionContext, ForbiddenException, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import { Permission } from '../rbac/rbac.service';

/** A signed-in person (JWT) */
export interface UserPrincipal {
  type: 'user';
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: ReadonlySet<string>;
  mustChangePassword: boolean;
  /** When the credential stops working (the token's expiry); unset when unknown */
  expiresAt?: Date;
}

/** A machine client: the admin key or an API key */
export interface ServicePrincipal {
  type: 'service';
  id: string;
  name: string;
  email: null;
  roles: string[];
  permissions: ReadonlySet<string>;
  mustChangePassword: false;
  /** When the key expires; unset for keys that don't */
  expiresAt?: Date;
}

export type AuthPrincipal = UserPrincipal | ServicePrincipal;

/** Requests after the AuthGuard ran: `principal` is set on every non-public route */
export type AuthedRequest = Request & { principal?: AuthPrincipal };

export const IS_PUBLIC_KEY = 'auth:isPublic';
export const REQUIRED_PERMISSIONS_KEY = 'auth:requiredPermissions';
export const ALLOW_PASSWORD_CHANGE_PENDING_KEY = 'auth:allowPasswordChangePending';

/** The `code` of the 403 a user gets while they must change their password (docs/AUTH.md) */
export const PASSWORD_CHANGE_REQUIRED = 'PASSWORD_CHANGE_REQUIRED';

/** Skips authentication. Only for the routes listed in docs/AUTH.md. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Lets a user who must change their password call the route. Only
 * `GET /auth/me`, `POST /auth/change-password` and `POST /auth/logout` have it.
 */
export const AllowPasswordChangePending = () => SetMetadata(ALLOW_PASSWORD_CHANGE_PENDING_KEY, true);

/** 403 unless the principal has every listed permission. On a class, applies to every route. */
export const RequirePermission = (...permissions: Permission[]) => SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);

export function hasPermission(principal: AuthPrincipal | undefined, permission: Permission): boolean {
  return !!principal && principal.permissions.has(permission);
}

/** The authenticated caller. Throws 401 on a public route, where there is none. */
export const Principal = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthPrincipal => {
  const principal = ctx.switchToHttp().getRequest<AuthedRequest>().principal;
  if (!principal) throw new UnauthorizedException('Sign in required');
  return principal;
});

/** Whether the principal is a user still on a temporary password, who may only change it or sign out */
export function isPasswordChangePending(principal: AuthPrincipal): boolean {
  return principal.type === 'user' && principal.mustChangePassword;
}

/** The 403 for a user who must change their password first */
export function passwordChangeRequired(): ForbiddenException {
  return new ForbiddenException({
    statusCode: 403,
    code: PASSWORD_CHANGE_REQUIRED,
    message: 'Change your password before doing anything else, then sign in again',
  });
}

/** For routes only people can use (logout, change password) */
export function requireUser(principal: AuthPrincipal): UserPrincipal {
  if (principal.type !== 'user') throw new ForbiddenException('Only signed-in users can do this');
  return principal;
}

/** For "admin, or the user themself" routes */
export function assertSelfOr(principal: AuthPrincipal, userId: string, permission: Permission): void {
  if (principal.type === 'user' && principal.id === userId) return;
  if (!hasPermission(principal, permission)) throw new ForbiddenException(`Requires ${permission}`);
}
