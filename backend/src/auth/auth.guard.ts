import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeyManagementService } from '../common/security/key-management.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission } from '../rbac/rbac.service';
import { AuthService } from './auth.service';
import {
  ALLOW_PASSWORD_CHANGE_PENDING_KEY,
  AuthedRequest,
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  isPasswordChangePending,
  passwordChangeRequired,
} from './principal';

/** Messages for credentials that were once good, by credential and problem */
const REFUSED = {
  'api-key': {
    expired: 'This API key has expired. Create a new one or rotate it.',
    revoked: 'This API key has been revoked. Use a new key.',
  },
  token: {
    expired: 'Your sign-in has expired. Sign in again.',
    revoked: 'Your sign-in has ended (signed out, password changed or account disabled). Sign in again.',
  },
} as const;

/**
 * The 401 for a refused credential: TOKEN_EXPIRED or TOKEN_REVOKED for an API
 * key or sign-in that was once good (docs/API_ERROR_CODES.md), else UNAUTHORIZED
 */
export function credentialRefused(check: { problem?: 'expired' | 'revoked'; credential?: 'api-key' | 'token' }): UnauthorizedException {
  if (!check.problem || !check.credential) return new UnauthorizedException('Sign in or send a valid API key');
  return new UnauthorizedException({
    statusCode: 401,
    code: check.problem === 'expired' ? 'TOKEN_EXPIRED' : 'TOKEN_REVOKED',
    message: REFUSED[check.credential][check.problem],
    error: 'Unauthorized',
  });
}

/**
 * Global guard (docs/AUTH.md): every HTTP route needs a user token or an API
 * key unless it is `@Public()`, and `@RequirePermission` routes need those
 * permissions. A user who must change their password only gets the
 * `@AllowPasswordChangePending()` routes. Registered after the throttler, so
 * floods are cut off first.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly audit: SecurityAuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // WebSocket gateways authenticate on connect
    if (context.getType() !== 'http') return true;
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const check = await this.auth.authenticate(KeyManagementService.extractKey(req.headers?.authorization));
    if (!check.principal) throw credentialRefused(check);
    const principal = check.principal;
    req.principal = principal;

    // A temporary password is a restricted session, whatever the user's roles
    if (isPasswordChangePending(principal) && !this.reflector.getAllAndOverride<boolean>(ALLOW_PASSWORD_CHANGE_PENDING_KEY, targets)) {
      void this.audit
        .logPermissionDenied(principal.id, 'route', req.originalUrl ?? req.url, `${req.method} (password change required)`, req.ip, req.headers['user-agent'])
        .catch(() => undefined);
      throw passwordChangeRequired();
    }

    const required = this.reflector.getAllAndMerge<Permission[]>(REQUIRED_PERMISSIONS_KEY, targets) ?? [];
    const missing = required.filter((permission) => !principal.permissions.has(permission));
    if (missing.length) {
      void this.audit
        .logPermissionDenied(principal.id, 'route', req.originalUrl ?? req.url, `${req.method} (missing ${missing.join(', ')})`, req.ip, req.headers['user-agent'])
        .catch(() => undefined);
      throw new ForbiddenException(`Requires ${missing.join(', ')}`);
    }
    return true;
  }
}
