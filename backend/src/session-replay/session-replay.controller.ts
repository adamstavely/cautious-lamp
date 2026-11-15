import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { creatorOf } from '../visual-regression/project-access';
import { CreateProjectDto } from './dto/create-project.dto';
import { SearchSessionsQueryDto, SessionEventsQueryDto } from './dto/search-sessions.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SessionReplayService } from './session-replay.service';

/**
 * Every route checks the caller's access to the project, as for visual
 * regression (docs/WORKSPACES.md, "Visual regression and session replay projects").
 */
@Controller('api/v1/session-replay')
export class SessionReplayController {
  constructor(private readonly sessionReplayService: SessionReplayService) {}

  @Get('projects')
  async getProjects(
    @Principal() principal: AuthPrincipal,
    @Query('teamId') teamId?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.sessionReplayService.listProjects(principal, { teamId: teamId || undefined, workspaceId: workspaceId || undefined });
  }

  @Post('projects')
  async createProject(@Principal() principal: AuthPrincipal, @Body() dto: CreateProjectDto) {
    const workspaceId = dto.workspaceId || null;
    await this.sessionReplayService.assertCanCreate(principal, workspaceId);
    const teamId = dto.teamId || workspaceId || 'default-team';
    return this.sessionReplayService.createProject(teamId, dto, { workspaceId, createdBy: creatorOf(principal) });
  }

  @Get('projects/:id')
  async getProject(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.sessionReplayService.authorizeProject(principal, id, 'read');
  }

  @Put('projects/:id')
  async updateProject(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    await this.sessionReplayService.authorizeProject(principal, id, 'manage');
    return this.sessionReplayService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  async deleteProject(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.sessionReplayService.authorizeProject(principal, id, 'manage');
    await this.sessionReplayService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  /** The tracker setup: `script` for a <script> tag, `npmInstall` and `npm` for the @openreplay/tracker package */
  @Get('projects/:id/integration-code')
  async getIntegrationCode(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.sessionReplayService.authorizeProject(principal, id, 'read');
    return this.sessionReplayService.getIntegrationCode(id);
  }

  /** One user's sessions in a time window, a page at a time (OpenReplay's public API lists sessions per user) */
  @Get('projects/:id/sessions')
  async searchSessions(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Query() query: SearchSessionsQueryDto) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    return this.sessionReplayService.searchSessions(projectId, {
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page !== undefined ? Number(query.page) : undefined,
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
      sortOrder: query.sortOrder,
    });
  }

  @Get('projects/:id/sessions/:sessionId/events')
  async listSessionEvents(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Param('sessionId') sessionId: string,
    @Query() query: SessionEventsQueryDto,
  ) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    return this.sessionReplayService.listSessionEvents(projectId, sessionId, {
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page !== undefined ? Number(query.page) : undefined,
      limit: query.limit !== undefined ? Number(query.limit) : undefined,
    });
  }

  /** OpenReplay's player for the session; viewers sign in to OpenReplay to watch it */
  @Get('projects/:id/sessions/:sessionId/replay-url')
  async getReplayUrl(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Param('sessionId') sessionId: string) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    return { url: await this.sessionReplayService.getReplayUrl(projectId, sessionId) };
  }

  /** OpenReplay's heatmap cards for the project (a link out; heatmaps are not drawn here) */
  @Get('projects/:id/heatmaps-url')
  async getHeatmapsUrl(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Query('heatmapId') heatmapId?: string) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    const url = await this.sessionReplayService.getHeatmapsUrl(projectId, heatmapId);
    return { url };
  }
}
