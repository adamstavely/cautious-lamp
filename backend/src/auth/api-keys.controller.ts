import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiKeyMetadata, KeyManagementService } from '../common/security/key-management.service';
import { TokenRotationService } from '../common/security/token-rotation.service';
import { Permission, isPermission } from '../rbac/rbac.service';
import { CreateApiKeyDto, RotateApiKeyDto, strictBody } from './auth.dto';
import { DEFAULT_SERVICE_PERMISSIONS } from './auth.service';
import { AuthPrincipal, Principal, RequirePermission } from './principal';

/** Key metadata without the hash */
function withoutSecrets(metadata: ApiKeyMetadata) {
  const { keyHash, ...rest } = metadata;
  return rest;
}

/** What a key with these scopes may do, as AuthService resolves it */
function effectivePermissions(scopes: string[] | undefined): readonly string[] {
  return scopes?.length ? scopes.filter(isPermission) : DEFAULT_SERVICE_PERMISSIONS;
}

/**
 * 403 unless the caller holds every permission the key would have: managing
 * keys must not be a way to gain permissions (docs/AUTH.md).
 */
function assertCanGrant(principal: AuthPrincipal, scopes: string[] | undefined): void {
  const missing = effectivePermissions(scopes).filter((permission) => !principal.permissions.has(permission));
  if (missing.length) {
    throw new ForbiddenException(`You can't grant permissions you don't have: ${missing.join(', ')}`);
  }
}

/**
 * API key management (docs/AUTH.md). Needs admin:users, and a caller can only
 * create or rotate keys whose permissions it holds itself.
 */
@Controller('api/v1/auth/api-keys')
@RequirePermission(Permission.ADMIN_USERS)
export class ApiKeysController {
  constructor(
    private readonly keys: KeyManagementService,
    private readonly rotation: TokenRotationService,
  ) {}

  @Post()
  async create(@Body(strictBody()) body: CreateApiKeyDto, @Principal() principal: AuthPrincipal) {
    const unknown = (body.scopes ?? []).filter((scope) => !isPermission(scope));
    if (unknown.length) {
      throw new BadRequestException(`Unknown scopes: ${unknown.join(', ')}`);
    }
    assertCanGrant(principal, body.scopes);
    const { key, metadata } = await this.keys.createKey(body.name, {
      expiresInDays: body.expiresInDays,
      scopes: body.scopes ? [...new Set(body.scopes)] : undefined,
      createdBy: principal.id,
    });
    return { apiKey: key, metadata: withoutSecrets(metadata) };
  }

  @Get()
  async list() {
    return (await this.keys.getAllKeys()).map(withoutSecrets);
  }

  // Declared before ':id' so ':id' doesn't capture it
  @Get('needing-rotation')
  async needingRotation() {
    return (await this.rotation.getTokensNeedingRotation()).map((entry) => ({ ...entry, metadata: withoutSecrets(entry.metadata) }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return withoutSecrets(await this.find(id));
  }

  @Post(':id/rotate')
  async rotate(
    @Param('id') id: string,
    @Body(strictBody()) body: RotateApiKeyDto,
    @Principal() principal: AuthPrincipal,
    @Req() req: Request,
  ) {
    // The new key gets the old one's scopes, so this is a grant too
    assertCanGrant(principal, (await this.find(id)).scopes);
    const result = await this.rotation.rotateToken(
      id,
      principal.id,
      body.reason || 'manual',
      body.revokeOld !== false,
      req.ip,
      req.headers['user-agent'],
    );
    return {
      message: 'Token rotated successfully',
      newApiKey: result.newKey,
      newMetadata: withoutSecrets(result.newMetadata),
    };
  }

  @Post(':id/revoke')
  async revoke(@Param('id') id: string) {
    if (!(await this.keys.revokeKey(id))) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    return { message: 'API key revoked successfully' };
  }

  @Get(':id/rotation-history')
  rotationHistory(@Param('id') id: string) {
    return this.rotation.getRotationHistory(id);
  }

  private async find(id: string): Promise<ApiKeyMetadata> {
    const metadata = await this.keys.getKeyMetadata(id);
    if (!metadata) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    return metadata;
  }
}
