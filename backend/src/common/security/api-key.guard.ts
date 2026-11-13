import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthedRequest } from '../../auth/principal';
import { Permission } from '../../rbac/rbac.service';

function principalOf(context: ExecutionContext) {
  const principal = context.switchToHttp().getRequest<AuthedRequest>().principal;
  if (!principal) throw new UnauthorizedException('Sign in or send a valid API key');
  return principal;
}

/**
 * Requires an authenticated caller: a signed-in user or an API key. The
 * global AuthGuard has already checked the credential and set
 * `req.principal`; this only makes sure it ran. Guards run before
 * interceptors, so uploads are rejected before anything is written to disk.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    principalOf(context);
    return true;
  }
}

/** Requires the admin:users permission, which the admin key (ADMIN_API_KEY) has */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!principalOf(context).permissions.has(Permission.ADMIN_USERS)) {
      throw new ForbiddenException(`Requires ${Permission.ADMIN_USERS}`);
    }
    return true;
  }
}
