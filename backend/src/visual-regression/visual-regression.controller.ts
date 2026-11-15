import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpCode, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthPrincipal, Principal, Public } from '../auth/principal';
import { UsersService } from '../auth/users.service';
import { parsePaginationParams } from '../common/pagination/pagination.types';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { PublicBaseUrl } from '../reviews/request-context';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateBaselineDto, NotificationSettingsDto, ShareProjectDto, WebhookSecretDto } from './dto/project-settings.dto';
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
  constructor(
    private readonly visualRegressionService: VisualRegressionService,
    private readonly users: UsersService,
  ) {}

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

  /**
   * Argos builds are created by uploading screenshots from CI, so runs can't
   * be started here. This returns what the project's CI runs, from its settings.
   */
  @Get('projects/:id/ci-setup')
  async getCiSetup(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @PublicBaseUrl() publicBaseUrl: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getCiSetup(projectId, publicBaseUrl);
  }

  /** The project's Argos builds, newest first; `from`/`to` (YYYY-MM-DD) limit when they started */
  @Get('projects/:id/runs')
  async getTestRuns(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Query() query: { page?: string; limit?: string; offset?: string; from?: string; to?: string },
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getTestRuns(projectId, parsePaginationParams(query), {
      from: typeof query.from === 'string' ? query.from : undefined,
      to: typeof query.to === 'string' ? query.to : undefined,
    });
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

  // Analytics
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

  // Sharing: besides its workspace, a project can be shared with people one by one
  @Get('projects/:id/shares')
  async getShares(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    return this.visualRegressionService.getShares(projectId);
  }

  /** Gives an active user the viewer or editor role on this project (body `{ email, role }`) */
  @Post('projects/:id/share')
  async shareProject(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Body() dto: ShareProjectDto) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    const user = await this.users.findByEmail(dto.email);
    if (!user || user.status !== 'active') {
      throw new NotFoundException('No active user has that email. Ask an administrator to create their account first.');
    }
    if (principal.type === 'user' && user.id === principal.id) throw new BadRequestException('You already have access to this project');
    return this.visualRegressionService.shareProject(projectId, { userId: user.id, email: user.email, name: user.name }, dto.role, {
      id: principal.id,
      name: principal.name,
    });
  }

  @Delete('projects/:id/share/:userId')
  @HttpCode(204)
  async unshareProject(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Param('userId') userId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    await this.visualRegressionService.unshareProject(projectId, userId);
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
    @Body() dto: CreateBaselineDto,
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'run');
    return this.visualRegressionService.createBaseline(projectId, dto, principal.id);
  }

  /** Every baseline version, newest first, with `current` on the one builds are compared against */
  @Get('projects/:id/baselines')
  async getBaselines(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getBaselines(projectId);
  }

  @Get('projects/:id/baselines/history')
  async getBaselineHistory(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'read');
    return this.visualRegressionService.getBaselineHistory(projectId);
  }

  /** Makes an earlier baseline current again; the CI upload then compares against its commit */
  @Post('projects/:id/baselines/:baselineId/rollback')
  @HttpCode(200)
  async rollbackBaseline(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Param('baselineId') baselineId: string,
  ) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'run');
    return this.visualRegressionService.rollbackBaseline(projectId, baselineId, principal.id);
  }

  // Build notifications from CI
  /**
   * Sets the secret CI signs build notifications with (body `{ secret? }`;
   * generated when left out). The response is the only time the secret is shown.
   */
  @Post('projects/:id/webhook-secret')
  async setWebhookSecret(@Principal() principal: AuthPrincipal, @Param('id') projectId: string, @Body() dto: WebhookSecretDto) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    const { secret } = await this.visualRegressionService.setWebhookSecret(projectId, dto?.secret);
    return { secret, hasWebhookSecret: true, webhookUrl: '/api/v1/visual-regression/webhooks/argos', signatureHeader: 'x-argos-signature' };
  }

  @Delete('projects/:id/webhook-secret')
  @HttpCode(204)
  async clearWebhookSecret(@Principal() principal: AuthPrincipal, @Param('id') projectId: string) {
    await this.visualRegressionService.authorizeProject(principal, projectId, 'manage');
    await this.visualRegressionService.clearWebhookSecret(projectId);
  }

  // Notifications
  @Post('projects/:id/notifications')
  async configureNotifications(
    @Principal() principal: AuthPrincipal,
    @Param('id') projectId: string,
    @Body() dto: NotificationSettingsDto,
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
 * CI calls this after uploading screenshots to Argos (Argos itself sends no
 * webhooks), without an API key, so it is public and lives outside the
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
  ) {
    return this.visualRegressionService.handleWebhook(payload, signature, req.rawBody);
  }
}
