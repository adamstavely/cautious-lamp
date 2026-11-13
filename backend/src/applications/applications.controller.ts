import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { StrictBody } from '../workspaces/workspace.dto';
import {
  CapabilitiesDto,
  MoveApplicationDto,
  RegisterApplicationDto,
  UpdateApplicationDto,
  UpdateDesignSystemVersionDto,
} from './application.dto';
import { CAPABILITY_NAMES, CapabilityName } from './application.types';
import { ApplicationsService } from './applications.service';

/**
 * Registered applications (docs/WORKSPACES.md). Reads need any signed-in
 * principal; writes need admin:governance or the admin role in the
 * application's workspace (checked in the service).
 *
 * Literal `applications/...` routes are declared before `applications/:id` so
 * the parameter route doesn't swallow them.
 */
@Controller('api/v1')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get('design-system/current-version')
  currentVersion() {
    return this.applications.currentVersion();
  }

  @Get('applications')
  async list(
    @Query('teamId') teamId?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('capability') capability?: string,
  ) {
    if (capability !== undefined && !CAPABILITY_NAMES.includes(capability as CapabilityName)) {
      throw new BadRequestException(`capability must be one of ${CAPABILITY_NAMES.join(', ')}`);
    }
    const applications = await this.applications.list({
      teamId: teamId || undefined,
      workspaceId: workspaceId || undefined,
      capability: capability as CapabilityName | undefined,
    });
    return { applications, count: applications.length };
  }

  @Post('applications/register')
  register(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: RegisterApplicationDto) {
    return this.applications.register(principal, dto);
  }

  @Get('applications/version-tracking')
  versionTracking() {
    return this.applications.migrationPlanning();
  }

  @Get('applications/needing-upgrade')
  needingUpgrade(@Query('currentVersion') currentVersion?: string) {
    return this.applications.needingUpgrade(currentVersion || undefined);
  }

  @Get('applications/affected-by-breaking-changes')
  affectedByBreakingChanges(@Query('version') version?: string) {
    if (!version) throw new BadRequestException('version is required');
    return this.applications.affectedByBreakingChanges(version);
  }

  @Get('applications/:id')
  get(@Param('id') id: string) {
    return this.applications.get(id);
  }

  @Put('applications/:id')
  update(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: UpdateApplicationDto) {
    return this.applications.update(principal, id, dto);
  }

  @Patch('applications/:id/capabilities')
  updateCapabilities(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: CapabilitiesDto) {
    return this.applications.updateCapabilities(principal, id, dto);
  }

  @Patch('applications/:id/design-system-version')
  updateDesignSystemVersion(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body(StrictBody()) dto: UpdateDesignSystemVersionDto,
  ) {
    return this.applications.updateDesignSystemVersion(principal, id, dto.version);
  }

  @Patch('applications/:id/workspace')
  move(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: MoveApplicationDto) {
    return this.applications.move(principal, id, dto);
  }

  @Delete('applications/:id')
  async delete(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.applications.delete(principal, id);
    return { success: true };
  }
}
