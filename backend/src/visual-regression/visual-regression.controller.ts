import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode, Headers, BadRequestException } from '@nestjs/common';
import { VisualRegressionService } from './visual-regression.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TriggerTestDto } from './dto/trigger-test.dto';
import { parsePaginationParams } from '../common/pagination/pagination.types';

@Controller('api/v1/visual-regression')
export class VisualRegressionController {
  constructor(private readonly visualRegressionService: VisualRegressionService) {}

  @Get('projects')
  async getProjects(@Query('teamId') teamId?: string) {
    return this.visualRegressionService.getProjects(teamId);
  }

  @Post('projects')
  async createProject(@Body() dto: CreateProjectDto, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    const teamId = dto.teamId || 'default-team';
    return this.visualRegressionService.createProject(teamId, dto);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    return this.visualRegressionService.getProject(id);
  }

  @Put('projects/:id')
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.visualRegressionService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    await this.visualRegressionService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Post('projects/:id/runs')
  async triggerTest(
    @Param('id') projectId: string,
    @Body() dto: TriggerTestDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || 'anonymous';
    return this.visualRegressionService.triggerTest(projectId, userId, dto);
  }

  @Get('projects/:id/runs')
  async getTestRuns(
    @Param('id') projectId: string,
    @Query() query: { page?: string; limit?: string; offset?: string },
  ) {
    const pagination = parsePaginationParams(query);
    return this.visualRegressionService.getTestRuns(projectId, pagination);
  }

  @Get('runs/:id')
  async getTestRun(@Param('id') runId: string) {
    return this.visualRegressionService.getTestRun(runId);
  }

  @Get('runs/:id/results')
  async getTestResults(
    @Param('id') runId: string,
    @Query() query: { page?: string; limit?: string; offset?: string },
  ) {
    const pagination = parsePaginationParams(query);
    return this.visualRegressionService.getTestResults(runId, pagination);
  }

  @Post('results/:id/approve')
  @HttpCode(200)
  async approveDiff(@Param('id') resultId: string, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    await this.visualRegressionService.approveDiff(resultId, userId);
    return { message: 'Diff approved successfully' };
  }

  @Post('results/:id/reject')
  @HttpCode(200)
  async rejectDiff(@Param('id') resultId: string, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    await this.visualRegressionService.rejectDiff(resultId, userId);
    return { message: 'Diff rejected successfully' };
  }

  @Post('webhooks/argos')
  @HttpCode(200)
  async handleArgosWebhook(
    @Body() payload: any,
    @Headers('x-argos-signature') signature?: string,
    @Headers('x-argos-event') event?: string,
  ) {
    return this.visualRegressionService.handleWebhook(payload, signature, event);
  }

  // Analytics & Reporting
  @Get('projects/:id/analytics')
  async getProjectAnalytics(
    @Param('id') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.visualRegressionService.getProjectAnalytics(projectId, startDate, endDate);
  }

  @Get('projects/:id/reports/pdf')
  async generatePDFReport(@Param('id') projectId: string) {
    return this.visualRegressionService.generatePDFReport(projectId);
  }

  // Team Management
  @Post('projects/:id/share')
  async shareProject(
    @Param('id') projectId: string,
    @Body() dto: { teamId: string; role: 'viewer' | 'tester' | 'admin' },
  ) {
    return this.visualRegressionService.shareProject(projectId, dto.teamId, dto.role);
  }

  @Get('projects/:id/teams')
  async getProjectTeams(@Param('id') projectId: string) {
    return this.visualRegressionService.getProjectTeams(projectId);
  }

  // Baseline Management
  @Post('projects/:id/baselines')
  async createBaseline(
    @Param('id') projectId: string,
    @Body() dto: { name: string; description?: string; runId: string },
  ) {
    return this.visualRegressionService.createBaseline(projectId, dto);
  }

  @Get('projects/:id/baselines')
  async getBaselines(@Param('id') projectId: string) {
    return this.visualRegressionService.getBaselines(projectId);
  }

  @Post('projects/:id/baselines/:baselineId/rollback')
  async rollbackBaseline(
    @Param('id') projectId: string,
    @Param('baselineId') baselineId: string,
  ) {
    return this.visualRegressionService.rollbackBaseline(projectId, baselineId);
  }

  // Notifications
  @Post('projects/:id/notifications')
  async configureNotifications(
    @Param('id') projectId: string,
    @Body() dto: { type: 'email' | 'slack' | 'teams' | 'webhook'; config: Record<string, unknown> },
  ) {
    return this.visualRegressionService.configureNotifications(projectId, dto);
  }

  @Get('projects/:id/notifications')
  async getNotificationConfig(@Param('id') projectId: string) {
    return this.visualRegressionService.getNotificationConfig(projectId);
  }
}
