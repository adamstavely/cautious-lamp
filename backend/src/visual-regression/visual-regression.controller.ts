import { Body, Controller, Delete, Get, Headers, HttpCode, NotImplementedException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthPrincipal, Principal, Public } from '../auth/principal';
import { parsePaginationParams } from '../common/pagination/pagination.types';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { NotificationConfig } from '../common/types/common.types';
import { CreateProjectDto } from './dto/create-project.dto';
import { TriggerTestDto } from './dto/trigger-test.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { creatorOf } from './project-access';
import { VisualRegressionService } from './visual-regression.service';

/**
 * Every route checks the caller's access to the project (docs/WORKSPACES.md,
 * "Visual regression and session replay projects"): members of the owning
 * workspace by role, the creator of a project without one, admin:users holders
 * everywhere, and admin:governance holders for application-linked projects.
 */
@Controller('api/v1/visual-regression')
@UseGuards(ApiKeyGuard)
export class VisualRegressionController {
  constructor(private readonly visualRegressionService: VisualRegressionService) {}

  @Get('projects')
  async getProjects(
    @Principal() principal: AuthPrincipal,
    @Query('teamId') teamId?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.visualRegressionService.listProjects(principal, { teamId: teamId || undefined, workspaceId: workspaceId || undefined });
  }

  @Post('projects')
  async createProject(@Principal() principal: AuthPrincipal, @Body() dto: CreateProjectDto) {
    const workspaceId = dto.workspaceId || null;
    await this.visualRegressionService.assertCanCreate(principal, workspaceId);
    const teamId = dto.teamId || workspaceId || 'default-team';
    return this.visualRegressionService.createProject(teamId, dto, { workspaceId, createdBy: creatorOf(principal) });
  }

  @Get('projects/:id')
  async getProject(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.visualRegressionService.authorizeProject(principal, id, 'read');
  }

  @Put('projects/:id')
  async updateProject(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    await this.visualRegressionService.authorizeProject(principal, id, 'manage');
    return this.visualRegressionService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  async deleteProject(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.visualRegressionService.authorizeProject(principal, id, 'manage');
    await this.visualRegressionService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Post('projects/:id/runs')
  async triggerTest(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Body() dto: TriggerTestDto) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'run');
    return this.visualRegressionService.triggerTest(projectId, principal.id, dto);
  }

  @Get('projects/:id/runs')
  async getTestRuns(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Query() query: { page?: string; limit?: string; offset?: string },
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getTestRuns(projectId, parsePaginationParams(query));
  }

  @Get('runs/:id')
  async getTestRun(@Principal() principal: AuthPrincipal, @Param('id') runId: string) {
    return this.visualRegressionService.authorizeRun(principal, runId, 'read');
  }

  @Get('runs/:id/results')
  async getTestResults(
    @Principal() principal: AuthPrincipal,
    @Param('id') runId: string,
    @Query() query: { page?: string; limit?: string; offset?: string },
  ) {
    await this.visualRegressionService.authorizeRun(principal, runId, 'read');
    return this.visualRegressionService.getTestResults(runId, parsePaginationParams(query));
  }

  @Post('results/:id/approve')
  @HttpCode(200)
  async approveDiff(@Param('id') resultId: string, @Principal() principal: AuthPrincipal) {
    await this.visualRegressionService.authorizeResult(principal, resultId, 'run');
    await this.visualRegressionService.approveDiff(resultId, principal.id);
    return { message: 'Diff approved successfully' };
  }

  @Post('results/:id/reject')
  @HttpCode(200)
  async rejectDiff(@Param('id') resultId: string, @Principal() principal: AuthPrincipal) {
    await this.visualRegressionService.authorizeResult(principal, resultId, 'run');
    await this.visualRegressionService.rejectDiff(resultId, principal.id);
    return { message: 'Diff rejected successfully' };
  }

  // Analytics & Reporting
  @Get('projects/:id/analytics')
  async getProjectAnalytics(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getProjectAnalytics(projectId, startDate, endDate);
  }

  /** 501: there is no PDF renderer */
  @Get('projects/:id/reports/pdf')
  async generatePDFReport(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.generatePDFReport(projectId);
  }

  /** 501: projects are shared by adding people to their workspace */
  @Post('projects/:id/share')
  async shareProject(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    throw new NotImplementedException("Projects are shared through their workspace. Add people to the project's workspace instead.");
  }

  /** Who the project belongs to (its workspace, application and creator) */
  @Get('projects/:id/teams')
  async getProjectTeams(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getProjectTeams(projectId);
  }

  // Baseline Management
  @Post('projects/:id/baselines')
  async createBaseline(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Body() dto: { name: string; description?: string; runId: string },
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'run');
    return this.visualRegressionService.createBaseline(projectId, dto, principal.id);
  }

  @Get('projects/:id/baselines')
  async getBaselines(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getBaselines(projectId);
  }

  /** 501: Argos baselines change only by approving builds in Argos */
  @Post('projects/:id/baselines/:baselineId/rollback')
  async rollbackBaseline(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Param('baselineId') baselineId: string,
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'run');
    return this.visualRegressionService.rollbackBaseline(projectId, baselineId);
  }

  // Notifications
  @Post('projects/:id/notifications')
  async configureNotifications(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Body() dto: { type: 'email' | 'slack' | 'teams' | 'webhook'; config: NotificationConfig },
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    return this.visualRegressionService.configureNotifications(projectId, dto);
  }

  /** Needs manage: notification settings can hold webhook URLs */
  @Get('projects/:id/notifications')
  async getNotificationConfig(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    return this.visualRegressionService.getNotificationConfig(projectId);
  }
}

/**
 * Argos calls this without an API key, so it is public and lives outside the
 * guarded controller. Each request must carry a valid signature instead.
 */
@Controller('api/v1/visual-regression')
export class ArgosWebhookController {
  constructor(private readonly visualRegressionService: VisualRegressionService) {}

  @Public()
  @Post('webhooks/argos')
  @HttpCode(200)
  async handleArgosWebhook(
    @Body() payload: any,
    @Request() req: { rawBody?: Buffer },
    @Headers('x-argos-signature') signature?: string,
    @Headers('x-argos-event') event?: string,
  ) {
    return this.visualRegressionService.handleWebhook(payload, signature, event, req.rawBody);
  }
}
