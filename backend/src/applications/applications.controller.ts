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
import { CAPABILITY_NAMES, CapabilityName, ENVIRONMENTS } from './application.types';
import { ApplicationsService } from './applications.service';

/**
 * Registered applications (docs/WORKSPACES.md). Reads show applications
 * without a workspace and those in the caller's workspaces (everything for
 * admin:users and admin:governance); a hidden application is a 404. Writes
 * need admin:governance or the admin role in the application's workspace
 * (checked in the service).
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
    @Principal() principal: AuthPrincipal,
    @Query('teamId') teamId?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('capability') capability?: string,
    @Query('environment') environment?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (capability && !CAPABILITY_NAMES.includes(capability as CapabilityName)) {
      throw new BadRequestException(`capability must be one of ${CAPABILITY_NAMES.join(', ')}`);
    }
    if (environment && !(ENVIRONMENTS as readonly string[]).includes(environment)) {
      throw new BadRequestException(`environment must be one of ${ENVIRONMENTS.join(', ')}`);
    }
    if (search !== undefined && search.length > 200) throw new BadRequestException('search must be 200 characters or fewer');
    const whole = (value: string | undefined, name: string, min: number, max: number) => {
      if (value === undefined || value === '') return undefined;
      const n = Number(value);
      if (!Number.isInteger(n) || n < min || n > max) throw new BadRequestException(`${name} must be a whole number from ${min} to ${max}`);
      return n;
    };
    return this.applications.pageFor(
      principal,
      {
        teamId: teamId || undefined,
        workspaceId: workspaceId || undefined,
        capability: (capability || undefined) as CapabilityName | undefined,
        environment: environment || undefined,
        search: search?.trim() || undefined,
      },
      { limit: whole(limit, 'limit', 1, 100), offset: whole(offset, 'offset', 0, 1_000_000) },
    );
  }

  @Post('applications/register')
  register(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: RegisterApplicationDto) {
    return this.applications.register(principal, dto);
  }

  @Get('applications/version-tracking')
  versionTracking(@Principal() principal: AuthPrincipal) {
    return this.applications.migrationPlanning(principal);
  }

  @Get('applications/needing-upgrade')
  needingUpgrade(@Principal() principal: AuthPrincipal, @Query('currentVersion') currentVersion?: string) {
    return this.applications.needingUpgrade(principal, currentVersion || undefined);
  }

  @Get('applications/affected-by-breaking-changes')
  affectedByBreakingChanges(@Principal() principal: AuthPrincipal, @Query('version') version?: string) {
    if (!version) throw new BadRequestException('version is required');
    return this.applications.affectedByBreakingChanges(principal, version);
  }

  @Get('applications/:id')
  get(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.applications.getFor(principal, id);
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
