import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { strictBody } from '../auth/auth.dto';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './feature-flags.dto';
import { FeatureFlag, FeatureFlagsService } from './feature-flags.service';

/**
 * Feature flags. Anyone signed in can read them (the frontend gates pages on
 * them); changing them needs admin:system_health (docs/AUTH.md).
 */
@Controller('api/v1/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  getAllFlags() {
    return this.featureFlagsService.getAllFlags();
  }

  @Get('key/:key')
  async getFlagByKey(@Param('key') key: string) {
    return this.found(await this.featureFlagsService.getFlagByKey(key));
  }

  /** Evaluated for the caller: targeting uses their id and roles, never client-supplied ones */
  @Get('check/:key')
  async checkFlag(@Param('key') key: string, @Principal() principal: AuthPrincipal) {
    const enabled = await this.featureFlagsService.isEnabled(key, principal.id, principal.roles);
    return { key, enabled };
  }

  @Get(':id')
  async getFlag(@Param('id') id: string) {
    return this.found(await this.featureFlagsService.getFlag(id));
  }

  @RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
  @Post()
  createFlag(@Body(strictBody()) body: CreateFeatureFlagDto, @Principal() principal: AuthPrincipal) {
    return this.featureFlagsService.createFlag(body, principal.id);
  }

  // Declared before ':id' routes so ':id' doesn't capture it
  @RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
  @Post('enable-all')
  async enableAllFeatures(@Principal() principal: AuthPrincipal) {
    const enabled = await this.featureFlagsService.enableAll(principal.id);
    return { success: true, message: `Enabled ${enabled} feature flag(s)` };
  }

  @RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
  @Put(':id')
  async updateFlag(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdateFeatureFlagDto,
    @Principal() principal: AuthPrincipal,
  ) {
    return this.found(await this.featureFlagsService.updateFlag(id, body, principal.id));
  }

  @RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
  @Put(':id/toggle')
  async toggleFlag(@Param('id') id: string, @Principal() principal: AuthPrincipal) {
    return this.found(await this.featureFlagsService.toggleFlag(id, principal.id));
  }

  @RequirePermission(Permission.ADMIN_SYSTEM_HEALTH)
  @Delete(':id')
  async deleteFlag(@Param('id') id: string) {
    if (!(await this.featureFlagsService.deleteFlag(id))) {
      throw new NotFoundException('Feature flag not found');
    }
    return { success: true };
  }

  private found(flag: FeatureFlag | null): FeatureFlag {
    if (!flag) throw new NotFoundException('Feature flag not found');
    return flag;
  }
}
