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
    const principal = await this.auth.resolve(KeyManagementService.extractKey(req.headers?.authorization));
    if (!principal) throw new UnauthorizedException('Sign in or send a valid API key');
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
