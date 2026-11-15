import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { StrictBody } from '../workspaces/workspace.dto';
import {
  AddCommentDto,
  ApproveRequestDto,
  AssignRequestDto,
  ComponentLinkDto,
  CreateRequestDto,
  RejectRequestDto,
  SetPriorityDto,
  TransitionStatusDto,
  UpdateRequestDto,
} from './component-request.dto';
import { ComponentRequestsService } from './component-requests.service';

/**
 * Component requests (docs/AUTH.md). Anyone signed in can read, request, vote
 * and comment, as themselves. The author may edit or withdraw their own open
 * request; triage (status, approvals, priority, assignment, linking a
 * component) needs `roadmap:edit`.
 */
@Controller('api/v1/component-requests')
export class ComponentRequestsController {
  constructor(private readonly requests: ComponentRequestsService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('requestedBy') requestedBy?: string,
    @Query('componentId') componentId?: string,
  ) {
    return this.requests.list({ status, category, priority, assignedTo, requestedBy, componentId });
  }

  @Get('analytics')
  analytics() {
    return this.requests.getAnalytics();
  }

  @Get('duplicates')
  duplicates(@Query('title') title?: string, @Query('description') description?: string) {
    if (!title) throw new BadRequestException('Title is required');
    return this.requests.checkForDuplicates(title, description);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.requests.getWithComments(id);
  }

  /** Creates the request as the caller; similar existing requests come back as a warning */
  @Post()
  async create(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: CreateRequestDto) {
    const duplicates = await this.requests.checkForDuplicates(dto.title, dto.description);
    const request = await this.requests.create(principal, dto);
    return duplicates.similar.length > 0 ? { duplicateWarning: true, similarRequests: duplicates.similar, request } : request;
  }

  @Put(':id')
  update(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: UpdateRequestDto) {
    return this.requests.update(principal, id, dto);
  }

  @Delete(':id')
  async remove(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.requests.delete(principal, id);
    return { success: true, id };
  }

  @Post(':id/vote')
  @HttpCode(200)
  vote(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.requests.vote(principal, id);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.requests.listComments(id);
  }

  @Post(':id/comments')
  addComment(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: AddCommentDto) {
    return this.requests.addComment(principal, id, dto.content);
  }

  // ---------- Triage ----------

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Patch(':id/status')
  transitionStatus(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: TransitionStatusDto) {
    return this.requests.transitionStatus(principal, id, dto.status, dto.comment);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Patch(':id/priority')
  setPriority(@Param('id') id: string, @Body(StrictBody()) dto: SetPriorityDto) {
    return this.requests.setPriority(id, dto.priority);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/assign')
  @HttpCode(200)
  assign(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: AssignRequestDto) {
    return this.requests.assign(principal, id, dto.userId);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Delete(':id/assign')
  unassign(@Param('id') id: string) {
    return this.requests.unassign(id);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/approve')
  @HttpCode(200)
  approve(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: ApproveRequestDto) {
    return this.requests.approve(principal, id, dto.stage);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/reject')
  @HttpCode(200)
  reject(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: RejectRequestDto) {
    return this.requests.reject(principal, id, dto.reason);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/promote')
  @HttpCode(200)
  promote(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: ComponentLinkDto) {
    return this.requests.promote(principal, id, dto.componentId);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/link-component')
  @HttpCode(200)
  link(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body(StrictBody()) dto: ComponentLinkDto) {
    return this.requests.link(principal, id, dto.componentId);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/unlink-component')
  @HttpCode(200)
  unlink(@Param('id') id: string) {
    return this.requests.unlink(id);
  }
}
