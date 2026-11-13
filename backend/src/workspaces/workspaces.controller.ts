import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import {
  AddUserToWorkspaceDto,
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  StrictBody,
  TransferOwnershipDto,
  UpdateSharingDto,
  UpdateWorkspaceDto,
  UpdateWorkspaceMemberDto,
} from './workspace.dto';
import { WorkspaceResourcesService } from './workspace-resources.service';
import { WorkspacesService } from './workspaces.service';

/**
 * Team workspaces (docs/WORKSPACES.md). Every route needs a signed-in
 * principal (global AuthGuard); per-workspace roles are checked in the
 * services. Identity comes only from the principal.
 *
 * Literal routes (`workspaces/analytics/compare`, `workspaces/slug/:slug`)
 * are declared before the `workspaces/:id` routes.
 */
@Controller('api/v1')
export class WorkspacesController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly resources: WorkspaceResourcesService,
  ) {}

  @Get('workspaces')
  list(@Principal() principal: AuthPrincipal, @Query('mine') mine?: string) {
    return this.workspaces.list(principal, { mine: mine === 'true' });
  }

  @Post('workspaces')
  create(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: CreateWorkspaceDto) {
    return this.workspaces.create(principal, dto);
  }

  @Get('workspaces/analytics/compare')
  compare(@Principal() principal: AuthPrincipal, @Query('workspaceIds') workspaceIds?: string) {
    const ids = workspaceIds ? workspaceIds.split(',').map((id) => id.trim()).filter(Boolean).slice(0, 100) : undefined;
    return this.workspaces.compare(principal, ids);
  }

  @Get('workspaces/slug/:slug')
  getBySlug(@Principal() principal: AuthPrincipal, @Param('slug') slug: string) {
    return this.workspaces.getBySlug(principal, slug);
  }

  @Get('workspaces/:id')
  get(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.workspaces.get(principal, id);
  }

  /** PATCH semantics (fields left out are unchanged); PUT is kept for older clients */
  @Patch('workspaces/:id')
  update(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: UpdateWorkspaceDto) {
    return this.workspaces.update(principal, id, dto);
  }

  @Put('workspaces/:id')
  updatePut(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: UpdateWorkspaceDto) {
    return this.workspaces.update(principal, id, dto);
  }

  @Delete('workspaces/:id')
  delete(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.workspaces.delete(principal, id);
  }

  // ---------- Members ----------

  @Post('workspaces/:id/members')
  addMember(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: AddWorkspaceMemberDto) {
    return this.workspaces.addMember(principal, id, dto);
  }

  @Patch('workspaces/:id/members/:userId')
  updateMember(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(StrictBody()) dto: UpdateWorkspaceMemberDto,
  ) {
    return this.workspaces.updateMember(principal, id, userId, dto);
  }

  /** Older path for the same change */
  @Patch('workspaces/:id/members/:userId/role')
  updateMemberRole(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(StrictBody()) dto: UpdateWorkspaceMemberDto,
  ) {
    return this.workspaces.updateMember(principal, id, userId, dto);
  }

  @Delete('workspaces/:id/members/:userId')
  removeMember(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Param('userId') userId: string) {
    return this.workspaces.removeMember(principal, id, userId);
  }

  @Post('workspaces/:id/transfer-ownership')
  @HttpCode(200)
  transferOwnership(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: TransferOwnershipDto) {
    return this.workspaces.transferOwnership(principal, id, dto);
  }

  // ---------- Components and analytics ----------

  @Get('workspaces/:id/components')
  components(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Query('status') status?: string) {
    return this.workspaces.listComponents(principal, id, status || undefined);
  }

  @Put('workspaces/:id/components/:componentId/sharing')
  componentSharing(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('componentId') componentId: string,
    @Body(StrictBody()) dto: UpdateSharingDto,
  ) {
    return this.workspaces.setComponentSharing(principal, id, componentId, dto);
  }

  @Get('workspaces/:id/analytics')
  analytics(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.workspaces.analytics(principal, id);
  }

  // ---------- Per-user (contract with the user management page) ----------

  @Get('users/:userId/workspaces')
  userWorkspaces(@Principal() principal: AuthPrincipal, @Param('userId') userId: string) {
    return this.workspaces.userWorkspaces(principal, userId);
  }

  @Post('users/:userId/workspaces')
  addUserToWorkspace(
    @Principal() principal: AuthPrincipal,
    @Param('userId') userId: string,
    @Body(StrictBody()) dto: AddUserToWorkspaceDto,
  ) {
    return this.workspaces.addUserToWorkspace(principal, userId, dto.workspaceId, dto.role);
  }

  @Delete('users/:userId/workspaces/:workspaceId')
  removeUserFromWorkspace(
    @Principal() principal: AuthPrincipal,
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaces.removeMember(principal, workspaceId, userId);
  }

  // ---------- Items (generic over the kinds in resource-kinds.ts) ----------

  @Get('workspaces/:id/resources/:kind')
  listResources(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @Query('filter') filter?: string,
  ) {
    return this.resources.list(principal, id, kind, filter || undefined);
  }

  /** Body: the kind's fields (resource-kinds.ts); validated per kind in the service */
  @Post('workspaces/:id/resources/:kind')
  createResource(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Param('kind') kind: string, @Body() body: unknown) {
    return this.resources.create(principal, id, kind, body);
  }

  @Get('workspaces/:id/resources/:kind/:rid')
  getResource(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Param('kind') kind: string, @Param('rid') rid: string) {
    return this.resources.get(principal, id, kind, rid);
  }

  @Patch('workspaces/:id/resources/:kind/:rid')
  updateResource(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @Param('rid') rid: string,
    @Body() body: unknown,
  ) {
    return this.resources.update(principal, id, kind, rid, body);
  }

  @Delete('workspaces/:id/resources/:kind/:rid')
  @HttpCode(204)
  async deleteResource(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @Param('rid') rid: string,
  ): Promise<void> {
    await this.resources.delete(principal, id, kind, rid);
  }

  @Put('workspaces/:id/resources/:kind/:rid/sharing')
  setResourceSharing(
    @Principal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Param('kind') kind: string,
    @Param('rid') rid: string,
    @Body(StrictBody()) dto: UpdateSharingDto,
  ) {
    return this.resources.setSharing(principal, id, kind, rid, dto);
  }

  /** Older path still used by the Design Extractor page */
  @Post('workspaces/:id/style-dictionaries')
  createStyleDictionary(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: unknown) {
    return this.resources.create(principal, id, 'style-dictionaries', body);
  }
}
