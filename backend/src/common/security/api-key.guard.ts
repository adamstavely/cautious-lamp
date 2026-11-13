import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { KeyManagementService } from './key-management.service';

/**
 * Requires a valid API key in the Authorization header. Guards run before
 * interceptors, so uploads are rejected before anything is written to disk.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly keyManagementService: KeyManagementService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    this.keyManagementService.assertValidApiKey(request.headers?.authorization);
    return true;
  }
}

/**
 * Requires the admin key (ADMIN_API_KEY) in the Authorization header.
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly keyManagementService: KeyManagementService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    this.keyManagementService.assertAdminKey(request.headers?.authorization);
    return true;
  }
}
