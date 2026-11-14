import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { creatorOf } from '../visual-regression/project-access';
import { CreateProjectDto } from './dto/create-project.dto';
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

  @Get('projects/:id/integration-code')
  async getIntegrationCode(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.sessionReplayService.authorizeProject(principal, id, 'read');
    const code = await this.sessionReplayService.getIntegrationCode(id);
    return { code };
  }

  @Get('projects/:id/sessions')
  async searchSessions(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('userEmail') userEmail?: string,
    @Query('issueType') issueType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    return this.sessionReplayService.searchSessions(projectId, {
      startDate,
      endDate,
      userId,
      userEmail,
      issueType,
      limit: limit ? parseInt(String(limit)) : undefined,
      offset: offset ? parseInt(String(offset)) : undefined,
    });
  }

  @Get('projects/:id/sessions/:sessionId')
  async getSession(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Param('sessionId') sessionId: string) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    return this.sessionReplayService.getSession(projectId, sessionId);
  }

  @Get('projects/:id/heatmaps-url')
  async getHeatmapsUrl(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Query('heatmapId') heatmapId?: string) {
    await this.sessionReplayService.authorizeProject(principal, projectId, 'read');
    const url = await this.sessionReplayService.getHeatmapsUrl(projectId, heatmapId);
    return { url };
  }
}
