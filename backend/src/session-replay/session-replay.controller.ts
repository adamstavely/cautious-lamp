import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { SessionReplayService } from './session-replay.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('api/v1/session-replay')
export class SessionReplayController {
  constructor(private readonly sessionReplayService: SessionReplayService) {}

  @Get('projects')
  async getProjects(@Query('teamId') teamId?: string) {
    return this.sessionReplayService.getProjects(teamId);
  }

  @Post('projects')
  async createProject(@Body() dto: CreateProjectDto, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    const teamId = dto.teamId || 'default-team';
    return this.sessionReplayService.createProject(teamId, dto);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    return this.sessionReplayService.getProject(id);
  }

  @Put('projects/:id')
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.sessionReplayService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    await this.sessionReplayService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Get('projects/:id/integration-code')
  async getIntegrationCode(@Param('id') id: string) {
    const code = await this.sessionReplayService.getIntegrationCode(id);
    return { code };
  }

  @Get('projects/:id/sessions')
  async searchSessions(
    @Param('id') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('userEmail') userEmail?: string,
    @Query('issueType') issueType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
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
  async getSession(@Param('id') projectId: string, @Param('sessionId') sessionId: string) {
    return this.sessionReplayService.getSession(projectId, sessionId);
  }

  @Get('projects/:id/heatmaps-url')
  async getHeatmapsUrl(@Param('id') projectId: string, @Query('heatmapId') heatmapId?: string) {
    const url = await this.sessionReplayService.getHeatmapsUrl(projectId, heatmapId);
    return { url };
  }
}

