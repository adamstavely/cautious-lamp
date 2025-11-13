import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Headers, Body, UnauthorizedException, BadRequestException, Request } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { RegisterApplicationDto } from './dto/register-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateCapabilitiesDto } from './dto/update-capabilities.dto';
import { TokenRotationService } from '../common/security/token-rotation.service';
import { KeyManagementService } from '../common/security/key-management.service';

@Controller('api/v1')
export class DesignSystemController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly componentRequestService: ComponentRequestService,
    private readonly notificationService: NotificationService,
    private readonly tokenRotationService: TokenRotationService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  private extractApiKey(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  private validateRequest(authHeader: string | undefined): void {
    const apiKey = this.extractApiKey(authHeader);
    if (!apiKey || !this.designSystemService.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
  }

  @Post('auth/api-keys')
  createApiKey(@Body() body: { name: string; expiresInDays?: number; scopes?: string[] }) {
    if (!body.name) {
      throw new BadRequestException('API key name is required');
    }
    const { key, metadata } = this.keyManagementService.createKey(body.name, {
      expiresInDays: body.expiresInDays,
      scopes: body.scopes,
    });
    return { apiKey: key, metadata };
  }

  @Get('auth/api-keys')
  getApiKeys() {
    return this.keyManagementService.getAllKeys();
  }

  @Get('auth/api-keys/:id')
  getApiKey(@Param('id') id: string) {
    const metadata = this.keyManagementService.getKeyMetadata(id);
    if (!metadata) {
      throw new BadRequestException(`API key with ID ${id} not found`);
    }
    return metadata;
  }

  @Post('auth/api-keys/:id/rotate')
  async rotateApiKey(
    @Param('id') id: string,
    @Body() body: { revokeOld?: boolean; reason?: 'manual' | 'automatic' | 'expired' | 'compromised' },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'anonymous';
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await this.tokenRotationService.rotateToken(
      id,
      userId,
      body.reason || 'manual',
      body.revokeOld !== false,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Token rotated successfully',
      newApiKey: result.newKey,
      newMetadata: result.newMetadata,
    };
  }

  @Post('auth/api-keys/:id/revoke')
  revokeApiKey(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    const success = this.keyManagementService.revokeKey(id);
    if (!success) {
      throw new BadRequestException(`API key with ID ${id} not found`);
    }
    return { message: 'API key revoked successfully' };
  }

  @Get('auth/api-keys/:id/rotation-history')
  getRotationHistory(@Param('id') id: string) {
    return this.tokenRotationService.getRotationHistory(id);
  }

  @Get('auth/api-keys/needing-rotation')
  getTokensNeedingRotation() {
    return this.tokenRotationService.getTokensNeedingRotation();
  }

  @Get('tokens')
  getTokens(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('tag') tag?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const tokens = this.designSystemService.getAllTokens(category, type, tag);
    return { 
      tokens,
      count: tokens.length,
      filters: { category, type, tag }
    };
  }

  @Get('tokens/:name')
  getToken(
    @Param('name') name: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const token = this.designSystemService.getTokenByName(name);
    if (!token) {
      throw new BadRequestException(`Token '${name}' not found`);
    }
    return token;
  }

  @Get('tokens/category/:category')
  getTokensByCategory(
    @Param('category') category: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const tokens = this.designSystemService.getTokensByCategory(category);
    return { 
      tokens,
      category,
      count: tokens.length
    };
  }

  // Component metadata for Loupe Tool
  // Using a different path to avoid conflict with components/:id route
  @Get('component-metadata')
  getComponentMetadata() {
    // Make this endpoint public for the Loupe Tool to work
    // In production, you may want to add rate limiting instead
    try {
      return this.designSystemService.getComponentMetadata();
    } catch (error) {
      console.error('Error getting component metadata:', error);
      throw new BadRequestException('Failed to retrieve component metadata');
    }
  }

  @Get('components')
  getComponents(
    @Query('status') status?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const components = this.designSystemService.getAllComponents(status);
    return { 
      components,
      count: components.length,
      filters: { status }
    };
  }

  @Get('components/:id/test-coverage')
  getComponentTestCoverage(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.calculateTestCoverage(id);
  }

  @Get('components/:id')
  getComponent(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const component = this.designSystemService.getComponentById(id);
    if (!component) {
      throw new BadRequestException(`Component '${id}' not found`);
    }
    return component;
  }

  @Get('components/status/:status')
  getComponentsByStatus(
    @Param('status') status: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const components = this.designSystemService.getComponentsByStatus(status);
    return { 
      components,
      status,
      count: components.length
    };
  }

  @Get('health')
  healthCheck() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Post('applications/register')
  async registerApplication(
    @Body() body: RegisterApplicationDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return await this.designSystemService.registerApplication(body.name, {
      description: body.description,
      repository: body.repository,
      version: body.version,
      applicationUrl: body.applicationUrl,
      teamId: body.teamId,
      workspaceId: body.workspaceId,
      capabilities: body.capabilities,
      metadata: body.metadata,
    });
  }

  @Get('applications')
  getApplications(
    @Query('teamId') teamId?: string,
    @Query('capability') capability?: 'governance' | 'visualRegression' | 'sessionReplay',
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getAllApplications({ teamId, capability });
  }

  @Get('applications/:id')
  getApplication(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const application = this.designSystemService.getApplication(id);
    if (!application) {
      return { error: 'Application not found' };
    }
    return application;
  }

  @Put('applications/:id')
  updateApplication(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.updateApplication(id, body);
  }

  @Patch('applications/:id/capabilities')
  async updateApplicationCapabilities(
    @Param('id') id: string,
    @Body() body: UpdateCapabilitiesDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    // Convert DTO to ApplicationCapabilities format
    const capabilities: any = {};
    if (body.governance) {
      capabilities.governance = body.governance;
    }
    if (body.visualRegression) {
      capabilities.visualRegression = body.visualRegression;
    }
    if (body.sessionReplay) {
      capabilities.sessionReplay = body.sessionReplay;
    }
    return await this.designSystemService.updateApplicationCapabilities(id, capabilities);
  }

  @Delete('applications/:id')
  deleteApplication(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteApplication(id);
    return { success: deleted };
  }

  @Post('compliance/scan')
  scanCompliance(
    @Body() body: { 
      applicationId?: string; 
      scope: 'design-system' | 'applications'; 
      rules?: Array<{ name: string; scannerCode?: string }> | string[]; 
      categories?: string[];  // Filter by rule categories (e.g., ['accessibility', 'design-system'])
      codebase?: any 
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.scanCompliance(body.scope, body.applicationId, body.rules, body.codebase, body.categories);
  }

  @Post('compliance/scan-application')
  async scanApplication(
    @Body() body: { 
      applicationId: string; 
      codebase?: any;
      categories?: string[];  // Filter by rule categories (e.g., ['accessibility', 'design-system'])
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return await this.designSystemService.scanApplicationCodebase(body.applicationId, body.codebase, body.categories);
  }

  @Post('ai/chat')
  async chatWithAI(
    @Body() body: { message: string; conversationHistory?: Array<{ role: string; content: string }> },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return await this.designSystemService.chatWithAI(body.message, body.conversationHistory);
  }

  @Get('performance/budgets')
  getPerformanceBudgets(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.getPerformanceBudgets();
  }

  @Post('performance/budgets')
  createPerformanceBudget(
    @Body() body: { name: string; metric: string; threshold: number; unit: string; alertThreshold?: number },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.createPerformanceBudget(body.name, body.metric, body.threshold, body.unit, body.alertThreshold);
  }

  @Put('performance/budgets/:id')
  updatePerformanceBudget(
    @Param('id') id: string,
    @Body() body: { name?: string; threshold?: number; alertThreshold?: number; enabled?: boolean },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.updatePerformanceBudget(id, body);
  }

  @Delete('performance/budgets/:id')
  deletePerformanceBudget(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.deletePerformanceBudget(id);
  }

  @Get('performance/bundle-analysis')
  getBundleAnalysis(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.getBundleAnalysis();
  }

  @Post('performance/bundle-analysis/analyze')
  analyzeBundle(
    @Body() body: { componentId?: string; includeDependencies?: boolean },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.analyzeBundle(body.componentId, body.includeDependencies);
  }

  @Get('roadmap')
  getRoadmap(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.getRoadmap();
  }

  @Post('roadmap/items')
  createRoadmapItem(
    @Body() body: { title: string; description: string; category: string; priority: string; targetDate?: string; status?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.createRoadmapItem(body);
  }

  @Put('roadmap/items/:id')
  updateRoadmapItem(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; category?: string; priority?: string; targetDate?: string; status?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.updateRoadmapItem(id, body);
  }

  @Delete('roadmap/items/:id')
  deleteRoadmapItem(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.deleteRoadmapItem(id);
  }

  @Get('rules/export')
  exportRulesForLinter(
    @Query('format') format: 'eslint' | 'prettier' | 'json' = 'json',
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.exportRulesForLinter(format);
  }

  // Info Banner endpoints
  @Get('banners')
  getBanners(@Query('active') active?: string) {
    if (active === 'true') {
      return this.designSystemService.getActiveBanners();
    }
    return this.designSystemService.getAllBanners();
  }

  @Get('banners/:id')
  getBanner(@Param('id') id: string) {
    return this.designSystemService.getBanner(id);
  }

  @Post('banners')
  createBanner(
    @Body() body: { title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; expiresAt?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.createBanner(body);
  }

  @Put('banners/:id')
  updateBanner(
    @Param('id') id: string,
    @Body() body: { title?: string; message?: string; type?: 'info' | 'warning' | 'error' | 'success'; isActive?: boolean; expiresAt?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  deleteBanner(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    this.designSystemService.deleteBanner(id);
    return { success: true };
  }

  // Component Request endpoints
  @Get('requests')
  getRequests(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.getAllRequests({ status, category, assignedTo, priority });
  }

  @Get('requests/:id')
  getRequest(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.getRequest(id);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Post('requests')
  createRequest(
    @Body() body: {
      title: string;
      description: string;
      useCase?: string;
      requestedBy: string;
      category: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.createRequest(body);
  }

  @Put('requests/:id')
  updateRequest(
    @Param('id') id: string,
    @Body() body: Partial<{
      title: string;
      description: string;
      status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-more-info' | 'in-progress' | 'completed' | 'released';
      priority: 'low' | 'medium' | 'high' | 'critical';
      assignedTo: string;
    }>,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.updateRequest(id, body);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Delete('requests/:id')
  deleteRequest(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.componentRequestService.deleteRequest(id);
    if (!deleted) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return { success: true };
  }

  @Post('requests/:id/vote')
  voteRequest(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.voteRequest(id, body.userId);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Put('requests/:id/status')
  updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: string; userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    try {
      const request = this.componentRequestService.transitionStatus(id, body.status as any, body.userId);
      if (!request) {
        throw new BadRequestException(`Request ${id} not found`);
      }
      return request;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('requests/:id/assign')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.assignRequest(id, body.userId);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Post('requests/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: {
      author: string;
      content: string;
      mentions?: string[];
      attachments?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.addComment(id, body);
  }

  @Get('requests/:id/comments')
  getComments(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.getComments(id);
  }

  @Put('requests/:id/link-component')
  linkToComponent(
    @Param('id') id: string,
    @Body() body: { componentId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.linkToComponent(id, body.componentId);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  // Issue endpoints
  @Get('issues')
  getIssues(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('componentId') componentId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.getAllIssues({ status, severity, componentId });
  }

  @Get('issues/:id')
  getIssue(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const issue = this.componentRequestService.getIssue(id);
    if (!issue) {
      throw new BadRequestException(`Issue ${id} not found`);
    }
    return issue;
  }

  @Post('issues')
  createIssue(
    @Body() body: {
      title: string;
      description: string;
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      reportedBy: string;
      componentId?: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.componentRequestService.createIssue(body);
  }

  @Put('issues/:id')
  updateIssue(
    @Param('id') id: string,
    @Body() body: Partial<{
      title: string;
      description: string;
      status: 'open' | 'investigating' | 'in-progress' | 'resolved' | 'closed';
      severity: 'low' | 'medium' | 'high' | 'critical';
      assignedTo: string;
    }>,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const issue = this.componentRequestService.updateIssue(id, body);
    if (!issue) {
      throw new BadRequestException(`Issue ${id} not found`);
    }
    return issue;
  }

  // Analytics
  @Get('requests/analytics')
  getRequestAnalytics(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.componentRequestService.getRequestAnalytics();
  }

  // Request Templates
  @Get('requests/templates')
  getRequestTemplates(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.componentRequestService.getRequestTemplates();
  }

  @Get('requests/templates/:id')
  getRequestTemplate(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const template = this.componentRequestService.getRequestTemplate(id);
    if (!template) {
      throw new BadRequestException(`Template ${id} not found`);
    }
    return template;
  }

  // Duplicate Detection
  @Get('requests/:id/duplicates')
  findDuplicateRequests(
    @Param('id') id: string,
    @Query('threshold') threshold?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const thresholdValue = threshold ? parseFloat(threshold) : 0.7;
    return this.componentRequestService.findDuplicateRequests(id, thresholdValue);
  }

  // Merge Requests
  @Post('requests/:id/merge')
  mergeRequests(
    @Param('id') sourceRequestId: string,
    @Body() body: {
      targetRequestId: string;
      mergeOptions?: {
        keepTitle?: 'source' | 'target';
        keepDescription?: 'source' | 'target' | 'merge';
        keepVotes?: 'source' | 'target' | 'combine';
        keepComments?: 'source' | 'target' | 'combine';
        keepStatus?: 'source' | 'target' | 'highest';
      };
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const mergedRequest = this.componentRequestService.mergeRequests(
      sourceRequestId,
      body.targetRequestId,
      body.mergeOptions,
    );
    if (!mergedRequest) {
      throw new BadRequestException('Failed to merge requests. One or both requests not found.');
    }
    return mergedRequest;
  }

  // Notification endpoints
  @Get('notifications')
  getNotifications(
    @Query('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.notificationService.getNotifications(userId, unreadOnly === 'true');
  }

  @Put('notifications/:id/read')
  markNotificationAsRead(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const success = this.notificationService.markAsRead(id);
    if (!success) {
      throw new BadRequestException(`Notification ${id} not found`);
    }
    return { success: true };
  }

  @Put('notifications/read-all')
  markAllNotificationsAsRead(
    @Body() body: { userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const count = this.notificationService.markAllAsRead(body.userId);
    return { success: true, count };
  }

  @Get('notifications/unread-count')
  getUnreadCount(
    @Query('userId') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return { count: this.notificationService.getUnreadCount(userId) };
  }

  // NASA-TLX endpoint
  @Post('nasa-tlx')
  submitNASATLX(
    @Body() body: {
      systemName: string;
      task: string;
      mentalDemand: number;
      physicalDemand: number;
      temporalDemand: number;
      performance: number;
      effort: number;
      frustration: number;
      user: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.submitNASATLX(body);
  }

  // System Usability Scale endpoint
  @Post('sus')
  submitSUS(
    @Body() body: {
      systemName: string;
      q1: number;
      q2: number;
      q3: number;
      q4: number;
      q5: number;
      q6: number;
      q7: number;
      q8: number;
      q9: number;
      q10: number;
      user: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.submitSUS(body);
  }

  // Heuristic Evaluation endpoint
  @Post('heuristic-evaluation')
  submitHeuristicEvaluation(
    @Body() body: {
      systemName: string;
      evaluator: string;
      heuristics: Array<{ heuristic: string; issues: string; severity: number }>;
      overallAssessment: string;
      timestamp: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.submitHeuristicEvaluation(body);
  }

  // Application Version Tracking endpoints
  @Get('applications/version-tracking')
  getVersionTracking(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getMigrationPlanningData();
  }

  @Get('applications/needing-upgrade')
  getApplicationsNeedingUpgrade(
    @Query('currentVersion') currentVersion?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getApplicationsNeedingUpgrade(currentVersion);
  }

  @Get('applications/affected-by-breaking-changes')
  getApplicationsAffectedByBreakingChanges(
    @Query('version') version: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getApplicationsAffectedByBreakingChanges(version);
  }

  @Patch('applications/:id/design-system-version')
  updateApplicationDesignSystemVersion(
    @Param('id') id: string,
    @Body() body: { version: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.updateApplicationDesignSystemVersion(id, body.version);
  }

  @Get('design-system/current-version')
  getCurrentDesignSystemVersion(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return {
      version: this.designSystemService.getCurrentDesignSystemVersion(),
    };
  }

  // Token Relationship Mapping endpoints
  @Get('tokens/relationships')
  getTokenRelationships(
    @Query('token') tokenName?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getTokenRelationships(tokenName);
  }

  @Get('tokens/:name/impact')
  getTokenImpactAnalysis(
    @Param('name') tokenName: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getTokenImpactAnalysis(tokenName);
  }

  // Component Variant Builder endpoints
  @Get('components/:id/variants')
  getComponentVariants(
    @Param('id') componentId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return {
      variants: this.designSystemService.getComponentVariants(componentId),
    };
  }

  @Post('components/:id/variants')
  saveComponentVariant(
    @Param('id') componentId: string,
    @Body() variant: any,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.saveComponentVariant(componentId, variant);
  }

  @Delete('components/:id/variants/:variantName')
  deleteComponentVariant(
    @Param('id') componentId: string,
    @Param('variantName') variantName: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteComponentVariant(componentId, variantName);
    if (!deleted) {
      throw new BadRequestException(`Variant '${variantName}' not found for component '${componentId}'`);
    }
    return { success: true };
  }

  // Component creation with auto-linking
  @Post('components')
  createComponent(
    @Body() data: {
      id: string;
      name: string;
      description: string;
      status?: 'production' | 'in-progress' | 'planned' | 'deprecated';
      props?: any[];
      code?: { vue?: string; react?: string; html?: string };
      dependencies?: string[];
      examples?: string[];
      accessibility?: { wcag: string; notes?: string };
      linkedRequestId?: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.createComponent(data);
  }

  // Get linked requests for a component
  @Get('components/:id/linked-requests')
  getLinkedRequests(
    @Param('id') componentId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    // This would need to query ComponentRequestsService
    // For now, return empty array - this can be enhanced later
    return { requests: [] };
  }

  // ==================== Workspace Management ====================

  @Post('workspaces')
  createWorkspace(
    @Body() data: {
      name: string;
      description?: string;
      ownerId: string;
      ownerEmail: string;
      settings?: any;
      metadata?: any;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.createWorkspace(data);
  }

  @Get('workspaces')
  getAllWorkspaces(
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    if (userId) {
      return this.designSystemService.getWorkspacesForUser(userId);
    }
    return this.designSystemService.getAllWorkspaces();
  }

  @Get('workspaces/:id')
  getWorkspace(
    @Param('id') workspaceId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new BadRequestException(`Workspace '${workspaceId}' not found`);
    }
    return workspace;
  }

  @Get('workspaces/slug/:slug')
  getWorkspaceBySlug(
    @Param('slug') slug: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.getWorkspaceBySlug(slug);
    if (!workspace) {
      throw new BadRequestException(`Workspace '${slug}' not found`);
    }
    return workspace;
  }

  @Put('workspaces/:id')
  updateWorkspace(
    @Param('id') workspaceId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      settings?: any;
      metadata?: any;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.updateWorkspace(workspaceId, updates);
    if (!workspace) {
      throw new BadRequestException(`Workspace '${workspaceId}' not found`);
    }
    return workspace;
  }

  @Delete('workspaces/:id')
  deleteWorkspace(
    @Param('id') workspaceId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspace(workspaceId);
    if (!deleted) {
      throw new BadRequestException(`Workspace '${workspaceId}' not found`);
    }
    return { message: 'Workspace deleted successfully' };
  }

  @Post('workspaces/:id/members')
  addWorkspaceMember(
    @Param('id') workspaceId: string,
    @Body() member: {
      userId: string;
      email: string;
      role: 'admin' | 'editor' | 'viewer';
      addedBy: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.addWorkspaceMember(workspaceId, member);
    if (!workspace) {
      throw new BadRequestException(`Failed to add member to workspace '${workspaceId}'`);
    }
    return workspace;
  }

  @Delete('workspaces/:id/members/:userId')
  removeWorkspaceMember(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.removeWorkspaceMember(workspaceId, userId);
    if (!workspace) {
      throw new BadRequestException(`Failed to remove member from workspace '${workspaceId}'`);
    }
    return workspace;
  }

  @Patch('workspaces/:id/members/:userId/role')
  updateWorkspaceMemberRole(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'admin' | 'editor' | 'viewer' },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.updateWorkspaceMemberRole(workspaceId, userId, body.role);
    if (!workspace) {
      throw new BadRequestException(`Failed to update member role in workspace '${workspaceId}'`);
    }
    return workspace;
  }

  @Get('workspaces/:id/components')
  getWorkspaceComponents(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    let components = this.designSystemService.getComponentsForWorkspace(workspaceId, userId);
    if (status) {
      components = components.filter(c => c.status === status);
    }
    return { components, count: components.length };
  }

  @Get('workspaces/:id/analytics')
  getWorkspaceAnalytics(
    @Param('id') workspaceId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceAnalytics(workspaceId);
  }

  @Get('workspaces/analytics/compare')
  getCrossWorkspaceComparison(
    @Query('workspaceIds') workspaceIds?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const ids = workspaceIds ? workspaceIds.split(',') : undefined;
    return this.designSystemService.getCrossWorkspaceComparison(ids);
  }

  @Post('components/:id/share')
  shareComponent(
    @Param('id') componentId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const component = this.designSystemService.shareComponentWithWorkspaces(
      componentId,
      body.workspaceIds,
      body.requestingWorkspaceId
    );
    if (!component) {
      throw new BadRequestException(`Failed to share component '${componentId}'`);
    }
    return component;
  }

  @Post('components/:id/unshare')
  unshareComponent(
    @Param('id') componentId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const component = this.designSystemService.unshareComponentFromWorkspaces(
      componentId,
      body.workspaceIds,
      body.requestingWorkspaceId
    );
    if (!component) {
      throw new BadRequestException(`Failed to unshare component '${componentId}'`);
    }
    return component;
  }

  @Post('components/:id/make-global')
  makeComponentGlobal(
    @Param('id') componentId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const component = this.designSystemService.makeComponentGlobal(componentId, body.requestingWorkspaceId);
    if (!component) {
      throw new BadRequestException(`Failed to make component '${componentId}' global`);
    }
    return component;
  }

  // ==================== Workspace Fonts ====================

  @Post('workspaces/:id/fonts')
  addWorkspaceFont(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      family: string;
      weights: string[];
      styles: string[];
      source: 'google' | 'custom' | 'system';
      url?: string;
      fallback?: string;
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceFont(workspaceId, data);
  }

  @Get('workspaces/:id/fonts')
  getWorkspaceFonts(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceFonts(workspaceId, userId);
  }

  @Put('workspaces/:id/fonts/:fontId')
  updateWorkspaceFont(
    @Param('id') workspaceId: string,
    @Param('fontId') fontId: string,
    @Body() updates: {
      name?: string;
      family?: string;
      weights?: string[];
      styles?: string[];
      url?: string;
      fallback?: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const font = this.designSystemService.updateWorkspaceFont(fontId, updates);
    if (!font) {
      throw new BadRequestException(`Font '${fontId}' not found`);
    }
    return font;
  }

  @Delete('workspaces/:id/fonts/:fontId')
  deleteWorkspaceFont(
    @Param('id') workspaceId: string,
    @Param('fontId') fontId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceFont(fontId);
    if (!deleted) {
      throw new BadRequestException(`Font '${fontId}' not found`);
    }
    return { message: 'Font deleted successfully' };
  }

  @Post('workspaces/:id/fonts/:fontId/share')
  shareWorkspaceFont(
    @Param('id') workspaceId: string,
    @Param('fontId') fontId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const font = this.designSystemService.shareWorkspaceFont(fontId, body.workspaceIds, body.requestingWorkspaceId);
    if (!font) {
      throw new BadRequestException(`Failed to share font '${fontId}'`);
    }
    return font;
  }

  @Post('workspaces/:id/fonts/:fontId/make-global')
  makeWorkspaceFontGlobal(
    @Param('id') workspaceId: string,
    @Param('fontId') fontId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const font = this.designSystemService.makeWorkspaceFontGlobal(fontId, body.requestingWorkspaceId);
    if (!font) {
      throw new BadRequestException(`Failed to make font '${fontId}' global`);
    }
    return font;
  }

  // ==================== Workspace Assets ====================

  @Post('workspaces/:id/assets')
  addWorkspaceAsset(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      type: 'image' | 'icon' | 'illustration' | 'logo' | 'other';
      url: string;
      thumbnailUrl?: string;
      size?: number;
      format?: string;
      tags?: string[];
      description?: string;
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceAsset(workspaceId, data);
  }

  @Get('workspaces/:id/assets')
  getWorkspaceAssets(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceAssets(workspaceId, userId, type);
  }

  @Put('workspaces/:id/assets/:assetId')
  updateWorkspaceAsset(
    @Param('id') workspaceId: string,
    @Param('assetId') assetId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const asset = this.designSystemService.updateWorkspaceAsset(assetId, updates);
    if (!asset) {
      throw new BadRequestException(`Asset '${assetId}' not found`);
    }
    return asset;
  }

  @Delete('workspaces/:id/assets/:assetId')
  deleteWorkspaceAsset(
    @Param('id') workspaceId: string,
    @Param('assetId') assetId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceAsset(assetId);
    if (!deleted) {
      throw new BadRequestException(`Asset '${assetId}' not found`);
    }
    return { message: 'Asset deleted successfully' };
  }

  @Post('workspaces/:id/assets/:assetId/share')
  shareWorkspaceAsset(
    @Param('id') workspaceId: string,
    @Param('assetId') assetId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const asset = this.designSystemService.shareWorkspaceAsset(assetId, body.workspaceIds, body.requestingWorkspaceId);
    if (!asset) {
      throw new BadRequestException(`Failed to share asset '${assetId}'`);
    }
    return asset;
  }

  @Post('workspaces/:id/assets/:assetId/make-global')
  makeWorkspaceAssetGlobal(
    @Param('id') workspaceId: string,
    @Param('assetId') assetId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const asset = this.designSystemService.makeWorkspaceAssetGlobal(assetId, body.requestingWorkspaceId);
    if (!asset) {
      throw new BadRequestException(`Failed to make asset '${assetId}' global`);
    }
    return asset;
  }

  // ==================== Workspace Tokens ====================

  @Post('workspaces/:id/tokens')
  addWorkspaceToken(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      value: string;
      type: string;
      category: string;
      description?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceToken(workspaceId, data);
  }

  @Get('workspaces/:id/tokens')
  getWorkspaceTokens(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceTokens(workspaceId, userId, category);
  }

  @Put('workspaces/:id/tokens/:tokenId')
  updateWorkspaceToken(
    @Param('id') workspaceId: string,
    @Param('tokenId') tokenId: string,
    @Body() updates: {
      name?: string;
      value?: string;
      description?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const token = this.designSystemService.updateWorkspaceToken(tokenId, updates);
    if (!token) {
      throw new BadRequestException(`Token '${tokenId}' not found`);
    }
    return token;
  }

  @Delete('workspaces/:id/tokens/:tokenId')
  deleteWorkspaceToken(
    @Param('id') workspaceId: string,
    @Param('tokenId') tokenId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceToken(tokenId);
    if (!deleted) {
      throw new BadRequestException(`Token '${tokenId}' not found`);
    }
    return { message: 'Token deleted successfully' };
  }

  @Post('workspaces/:id/tokens/:tokenId/share')
  shareWorkspaceToken(
    @Param('id') workspaceId: string,
    @Param('tokenId') tokenId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const token = this.designSystemService.shareWorkspaceToken(tokenId, body.workspaceIds, body.requestingWorkspaceId);
    if (!token) {
      throw new BadRequestException(`Failed to share token '${tokenId}'`);
    }
    return token;
  }

  @Post('workspaces/:id/tokens/:tokenId/make-global')
  makeWorkspaceTokenGlobal(
    @Param('id') workspaceId: string,
    @Param('tokenId') tokenId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const token = this.designSystemService.makeWorkspaceTokenGlobal(tokenId, body.requestingWorkspaceId);
    if (!token) {
      throw new BadRequestException(`Failed to make token '${tokenId}' global`);
    }
    return token;
  }

  // ==================== Workspace Reviews ====================

  @Post('workspaces/:id/reviews')
  addWorkspaceReview(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      status?: 'pending' | 'in-review' | 'approved' | 'rejected';
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceReview(workspaceId, data);
  }

  @Get('workspaces/:id/reviews')
  getWorkspaceReviews(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceReviews(workspaceId, userId);
  }

  @Put('workspaces/:id/reviews/:reviewId')
  updateWorkspaceReview(
    @Param('id') workspaceId: string,
    @Param('reviewId') reviewId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      status?: 'pending' | 'in-review' | 'approved' | 'rejected';
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const review = this.designSystemService.updateWorkspaceReview(reviewId, updates);
    if (!review) {
      throw new BadRequestException(`Review '${reviewId}' not found`);
    }
    return review;
  }

  @Delete('workspaces/:id/reviews/:reviewId')
  deleteWorkspaceReview(
    @Param('id') workspaceId: string,
    @Param('reviewId') reviewId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceReview(reviewId);
    if (!deleted) {
      throw new BadRequestException(`Review '${reviewId}' not found`);
    }
    return { message: 'Review deleted successfully' };
  }

  @Post('workspaces/:id/reviews/:reviewId/share')
  shareWorkspaceReview(
    @Param('id') workspaceId: string,
    @Param('reviewId') reviewId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const review = this.designSystemService.shareWorkspaceReview(reviewId, body.workspaceIds, body.requestingWorkspaceId);
    if (!review) {
      throw new BadRequestException(`Failed to share review '${reviewId}'`);
    }
    return review;
  }

  @Post('workspaces/:id/reviews/:reviewId/make-global')
  makeWorkspaceReviewGlobal(
    @Param('id') workspaceId: string,
    @Param('reviewId') reviewId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const review = this.designSystemService.makeWorkspaceReviewGlobal(reviewId, body.requestingWorkspaceId);
    if (!review) {
      throw new BadRequestException(`Failed to make review '${reviewId}' global`);
    }
    return review;
  }

  // ==================== Workspace Session Replays ====================

  @Post('workspaces/:id/session-replays')
  addWorkspaceSessionReplay(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      projectId?: string;
      sessionId?: string;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceSessionReplay(workspaceId, data);
  }

  @Get('workspaces/:id/session-replays')
  getWorkspaceSessionReplays(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceSessionReplays(workspaceId, userId);
  }

  @Put('workspaces/:id/session-replays/:replayId')
  updateWorkspaceSessionReplay(
    @Param('id') workspaceId: string,
    @Param('replayId') replayId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      projectId?: string;
      sessionId?: string;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const replay = this.designSystemService.updateWorkspaceSessionReplay(replayId, updates);
    if (!replay) {
      throw new BadRequestException(`Session replay '${replayId}' not found`);
    }
    return replay;
  }

  @Delete('workspaces/:id/session-replays/:replayId')
  deleteWorkspaceSessionReplay(
    @Param('id') workspaceId: string,
    @Param('replayId') replayId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceSessionReplay(replayId);
    if (!deleted) {
      throw new BadRequestException(`Session replay '${replayId}' not found`);
    }
    return { message: 'Session replay deleted successfully' };
  }

  @Post('workspaces/:id/session-replays/:replayId/share')
  shareWorkspaceSessionReplay(
    @Param('id') workspaceId: string,
    @Param('replayId') replayId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const replay = this.designSystemService.shareWorkspaceSessionReplay(replayId, body.workspaceIds, body.requestingWorkspaceId);
    if (!replay) {
      throw new BadRequestException(`Failed to share session replay '${replayId}'`);
    }
    return replay;
  }

  @Post('workspaces/:id/session-replays/:replayId/make-global')
  makeWorkspaceSessionReplayGlobal(
    @Param('id') workspaceId: string,
    @Param('replayId') replayId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const replay = this.designSystemService.makeWorkspaceSessionReplayGlobal(replayId, body.requestingWorkspaceId);
    if (!replay) {
      throw new BadRequestException(`Failed to make session replay '${replayId}' global`);
    }
    return replay;
  }

  // ==================== Workspace Journey Maps ====================

  @Post('workspaces/:id/journey-maps')
  addWorkspaceJourneyMap(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      persona?: string;
      stages?: Array<{ name: string; description?: string }>;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceJourneyMap(workspaceId, data);
  }

  @Get('workspaces/:id/journey-maps')
  getWorkspaceJourneyMaps(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceJourneyMaps(workspaceId, userId);
  }

  @Put('workspaces/:id/journey-maps/:mapId')
  updateWorkspaceJourneyMap(
    @Param('id') workspaceId: string,
    @Param('mapId') mapId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      persona?: string;
      stages?: Array<{ name: string; description?: string }>;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const map = this.designSystemService.updateWorkspaceJourneyMap(mapId, updates);
    if (!map) {
      throw new BadRequestException(`Journey map '${mapId}' not found`);
    }
    return map;
  }

  @Delete('workspaces/:id/journey-maps/:mapId')
  deleteWorkspaceJourneyMap(
    @Param('id') workspaceId: string,
    @Param('mapId') mapId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceJourneyMap(mapId);
    if (!deleted) {
      throw new BadRequestException(`Journey map '${mapId}' not found`);
    }
    return { message: 'Journey map deleted successfully' };
  }

  @Post('workspaces/:id/journey-maps/:mapId/share')
  shareWorkspaceJourneyMap(
    @Param('id') workspaceId: string,
    @Param('mapId') mapId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const map = this.designSystemService.shareWorkspaceJourneyMap(mapId, body.workspaceIds, body.requestingWorkspaceId);
    if (!map) {
      throw new BadRequestException(`Failed to share journey map '${mapId}'`);
    }
    return map;
  }

  @Post('workspaces/:id/journey-maps/:mapId/make-global')
  makeWorkspaceJourneyMapGlobal(
    @Param('id') workspaceId: string,
    @Param('mapId') mapId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const map = this.designSystemService.makeWorkspaceJourneyMapGlobal(mapId, body.requestingWorkspaceId);
    if (!map) {
      throw new BadRequestException(`Failed to make journey map '${mapId}' global`);
    }
    return map;
  }

  // ==================== Workspace HCD Reports ====================

  @Post('workspaces/:id/hcd-reports')
  addWorkspaceHcdReport(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      reportType?: 'usability' | 'accessibility' | 'heuristic' | 'user-research' | 'other';
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceHcdReport(workspaceId, data);
  }

  @Get('workspaces/:id/hcd-reports')
  getWorkspaceHcdReports(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('reportType') reportType?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceHcdReports(workspaceId, userId, reportType);
  }

  @Put('workspaces/:id/hcd-reports/:reportId')
  updateWorkspaceHcdReport(
    @Param('id') workspaceId: string,
    @Param('reportId') reportId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      reportType?: 'usability' | 'accessibility' | 'heuristic' | 'user-research' | 'other';
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const report = this.designSystemService.updateWorkspaceHcdReport(reportId, updates);
    if (!report) {
      throw new BadRequestException(`HCD report '${reportId}' not found`);
    }
    return report;
  }

  @Delete('workspaces/:id/hcd-reports/:reportId')
  deleteWorkspaceHcdReport(
    @Param('id') workspaceId: string,
    @Param('reportId') reportId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceHcdReport(reportId);
    if (!deleted) {
      throw new BadRequestException(`HCD report '${reportId}' not found`);
    }
    return { message: 'HCD report deleted successfully' };
  }

  @Post('workspaces/:id/hcd-reports/:reportId/share')
  shareWorkspaceHcdReport(
    @Param('id') workspaceId: string,
    @Param('reportId') reportId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const report = this.designSystemService.shareWorkspaceHcdReport(reportId, body.workspaceIds, body.requestingWorkspaceId);
    if (!report) {
      throw new BadRequestException(`Failed to share HCD report '${reportId}'`);
    }
    return report;
  }

  @Post('workspaces/:id/hcd-reports/:reportId/make-global')
  makeWorkspaceHcdReportGlobal(
    @Param('id') workspaceId: string,
    @Param('reportId') reportId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const report = this.designSystemService.makeWorkspaceHcdReportGlobal(reportId, body.requestingWorkspaceId);
    if (!report) {
      throw new BadRequestException(`Failed to make HCD report '${reportId}' global`);
    }
    return report;
  }

  // ==================== Workspace User Personas ====================

  @Post('workspaces/:id/user-personas')
  addWorkspaceUserPersona(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      demographics?: Record<string, any>;
      goals?: string[];
      painPoints?: string[];
      behaviors?: string[];
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceUserPersona(workspaceId, data);
  }

  @Get('workspaces/:id/user-personas')
  getWorkspaceUserPersonas(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceUserPersonas(workspaceId, userId);
  }

  @Put('workspaces/:id/user-personas/:personaId')
  updateWorkspaceUserPersona(
    @Param('id') workspaceId: string,
    @Param('personaId') personaId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      demographics?: Record<string, any>;
      goals?: string[];
      painPoints?: string[];
      behaviors?: string[];
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const persona = this.designSystemService.updateWorkspaceUserPersona(personaId, updates);
    if (!persona) {
      throw new BadRequestException(`User persona '${personaId}' not found`);
    }
    return persona;
  }

  @Delete('workspaces/:id/user-personas/:personaId')
  deleteWorkspaceUserPersona(
    @Param('id') workspaceId: string,
    @Param('personaId') personaId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceUserPersona(personaId);
    if (!deleted) {
      throw new BadRequestException(`User persona '${personaId}' not found`);
    }
    return { message: 'User persona deleted successfully' };
  }

  @Post('workspaces/:id/user-personas/:personaId/share')
  shareWorkspaceUserPersona(
    @Param('id') workspaceId: string,
    @Param('personaId') personaId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const persona = this.designSystemService.shareWorkspaceUserPersona(personaId, body.workspaceIds, body.requestingWorkspaceId);
    if (!persona) {
      throw new BadRequestException(`Failed to share user persona '${personaId}'`);
    }
    return persona;
  }

  @Post('workspaces/:id/user-personas/:personaId/make-global')
  makeWorkspaceUserPersonaGlobal(
    @Param('id') workspaceId: string,
    @Param('personaId') personaId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const persona = this.designSystemService.makeWorkspaceUserPersonaGlobal(personaId, body.requestingWorkspaceId);
    if (!persona) {
      throw new BadRequestException(`Failed to make user persona '${personaId}' global`);
    }
    return persona;
  }

  // ==================== Workspace Research Artifacts ====================

  @Post('workspaces/:id/research-artifacts')
  addWorkspaceResearchArtifact(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      artifactType?: 'interview' | 'survey' | 'observation' | 'workshop' | 'other';
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceResearchArtifact(workspaceId, data);
  }

  @Get('workspaces/:id/research-artifacts')
  getWorkspaceResearchArtifacts(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('artifactType') artifactType?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceResearchArtifacts(workspaceId, userId, artifactType);
  }

  @Put('workspaces/:id/research-artifacts/:artifactId')
  updateWorkspaceResearchArtifact(
    @Param('id') workspaceId: string,
    @Param('artifactId') artifactId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      artifactType?: 'interview' | 'survey' | 'observation' | 'workshop' | 'other';
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const artifact = this.designSystemService.updateWorkspaceResearchArtifact(artifactId, updates);
    if (!artifact) {
      throw new BadRequestException(`Research artifact '${artifactId}' not found`);
    }
    return artifact;
  }

  @Delete('workspaces/:id/research-artifacts/:artifactId')
  deleteWorkspaceResearchArtifact(
    @Param('id') workspaceId: string,
    @Param('artifactId') artifactId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceResearchArtifact(artifactId);
    if (!deleted) {
      throw new BadRequestException(`Research artifact '${artifactId}' not found`);
    }
    return { message: 'Research artifact deleted successfully' };
  }

  @Post('workspaces/:id/research-artifacts/:artifactId/share')
  shareWorkspaceResearchArtifact(
    @Param('id') workspaceId: string,
    @Param('artifactId') artifactId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const artifact = this.designSystemService.shareWorkspaceResearchArtifact(artifactId, body.workspaceIds, body.requestingWorkspaceId);
    if (!artifact) {
      throw new BadRequestException(`Failed to share research artifact '${artifactId}'`);
    }
    return artifact;
  }

  @Post('workspaces/:id/research-artifacts/:artifactId/make-global')
  makeWorkspaceResearchArtifactGlobal(
    @Param('id') workspaceId: string,
    @Param('artifactId') artifactId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const artifact = this.designSystemService.makeWorkspaceResearchArtifactGlobal(artifactId, body.requestingWorkspaceId);
    if (!artifact) {
      throw new BadRequestException(`Failed to make research artifact '${artifactId}' global`);
    }
    return artifact;
  }

  // ==================== Workspace Insights ====================

  @Post('workspaces/:id/insights')
  addWorkspaceInsight(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      category?: 'user-need' | 'pain-point' | 'opportunity' | 'finding' | 'other';
      priority?: 'high' | 'medium' | 'low';
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceInsight(workspaceId, data);
  }

  @Get('workspaces/:id/insights')
  getWorkspaceInsights(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceInsights(workspaceId, userId, category);
  }

  @Put('workspaces/:id/insights/:insightId')
  updateWorkspaceInsight(
    @Param('id') workspaceId: string,
    @Param('insightId') insightId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      category?: 'user-need' | 'pain-point' | 'opportunity' | 'finding' | 'other';
      priority?: 'high' | 'medium' | 'low';
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const insight = this.designSystemService.updateWorkspaceInsight(insightId, updates);
    if (!insight) {
      throw new BadRequestException(`Insight '${insightId}' not found`);
    }
    return insight;
  }

  @Delete('workspaces/:id/insights/:insightId')
  deleteWorkspaceInsight(
    @Param('id') workspaceId: string,
    @Param('insightId') insightId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceInsight(insightId);
    if (!deleted) {
      throw new BadRequestException(`Insight '${insightId}' not found`);
    }
    return { message: 'Insight deleted successfully' };
  }

  @Post('workspaces/:id/insights/:insightId/share')
  shareWorkspaceInsight(
    @Param('id') workspaceId: string,
    @Param('insightId') insightId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const insight = this.designSystemService.shareWorkspaceInsight(insightId, body.workspaceIds, body.requestingWorkspaceId);
    if (!insight) {
      throw new BadRequestException(`Failed to share insight '${insightId}'`);
    }
    return insight;
  }

  @Post('workspaces/:id/insights/:insightId/make-global')
  makeWorkspaceInsightGlobal(
    @Param('id') workspaceId: string,
    @Param('insightId') insightId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const insight = this.designSystemService.makeWorkspaceInsightGlobal(insightId, body.requestingWorkspaceId);
    if (!insight) {
      throw new BadRequestException(`Failed to make insight '${insightId}' global`);
    }
    return insight;
  }

  // ==================== Workspace Patterns ====================

  @Post('workspaces/:id/patterns')
  addWorkspacePattern(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      category?: string;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspacePattern(workspaceId, data);
  }

  @Get('workspaces/:id/patterns')
  getWorkspacePatterns(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspacePatterns(workspaceId, userId, category);
  }

  @Put('workspaces/:id/patterns/:patternId')
  updateWorkspacePattern(
    @Param('id') workspaceId: string,
    @Param('patternId') patternId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      category?: string;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const pattern = this.designSystemService.updateWorkspacePattern(patternId, updates);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Delete('workspaces/:id/patterns/:patternId')
  deleteWorkspacePattern(
    @Param('id') workspaceId: string,
    @Param('patternId') patternId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspacePattern(patternId);
    if (!deleted) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return { message: 'Pattern deleted successfully' };
  }

  @Post('workspaces/:id/patterns/:patternId/share')
  shareWorkspacePattern(
    @Param('id') workspaceId: string,
    @Param('patternId') patternId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const pattern = this.designSystemService.shareWorkspacePattern(patternId, body.workspaceIds, body.requestingWorkspaceId);
    if (!pattern) {
      throw new BadRequestException(`Failed to share pattern '${patternId}'`);
    }
    return pattern;
  }

  @Post('workspaces/:id/patterns/:patternId/make-global')
  makeWorkspacePatternGlobal(
    @Param('id') workspaceId: string,
    @Param('patternId') patternId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const pattern = this.designSystemService.makeWorkspacePatternGlobal(patternId, body.requestingWorkspaceId);
    if (!pattern) {
      throw new BadRequestException(`Failed to make pattern '${patternId}' global`);
    }
    return pattern;
  }

  // ==================== Workspace Icons ====================

  @Post('workspaces/:id/icons')
  addWorkspaceIcon(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      iconSet?: string;
      svg?: string;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceIcon(workspaceId, data);
  }

  @Get('workspaces/:id/icons')
  getWorkspaceIcons(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('iconSet') iconSet?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceIcons(workspaceId, userId, iconSet);
  }

  @Put('workspaces/:id/icons/:iconId')
  updateWorkspaceIcon(
    @Param('id') workspaceId: string,
    @Param('iconId') iconId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      iconSet?: string;
      svg?: string;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const icon = this.designSystemService.updateWorkspaceIcon(iconId, updates);
    if (!icon) {
      throw new BadRequestException(`Icon '${iconId}' not found`);
    }
    return icon;
  }

  @Delete('workspaces/:id/icons/:iconId')
  deleteWorkspaceIcon(
    @Param('id') workspaceId: string,
    @Param('iconId') iconId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceIcon(iconId);
    if (!deleted) {
      throw new BadRequestException(`Icon '${iconId}' not found`);
    }
    return { message: 'Icon deleted successfully' };
  }

  @Post('workspaces/:id/icons/:iconId/share')
  shareWorkspaceIcon(
    @Param('id') workspaceId: string,
    @Param('iconId') iconId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const icon = this.designSystemService.shareWorkspaceIcon(iconId, body.workspaceIds, body.requestingWorkspaceId);
    if (!icon) {
      throw new BadRequestException(`Failed to share icon '${iconId}'`);
    }
    return icon;
  }

  @Post('workspaces/:id/icons/:iconId/make-global')
  makeWorkspaceIconGlobal(
    @Param('id') workspaceId: string,
    @Param('iconId') iconId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const icon = this.designSystemService.makeWorkspaceIconGlobal(iconId, body.requestingWorkspaceId);
    if (!icon) {
      throw new BadRequestException(`Failed to make icon '${iconId}' global`);
    }
    return icon;
  }

  // ==================== Workspace Interactives ====================

  @Post('workspaces/:id/interactives')
  addWorkspaceInteractive(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      type?: 'prototype' | 'demo' | 'sandbox' | 'other';
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceInteractive(workspaceId, data);
  }

  @Get('workspaces/:id/interactives')
  getWorkspaceInteractives(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceInteractives(workspaceId, userId, type);
  }

  @Put('workspaces/:id/interactives/:interactiveId')
  updateWorkspaceInteractive(
    @Param('id') workspaceId: string,
    @Param('interactiveId') interactiveId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      type?: 'prototype' | 'demo' | 'sandbox' | 'other';
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const interactive = this.designSystemService.updateWorkspaceInteractive(interactiveId, updates);
    if (!interactive) {
      throw new BadRequestException(`Interactive '${interactiveId}' not found`);
    }
    return interactive;
  }

  @Delete('workspaces/:id/interactives/:interactiveId')
  deleteWorkspaceInteractive(
    @Param('id') workspaceId: string,
    @Param('interactiveId') interactiveId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceInteractive(interactiveId);
    if (!deleted) {
      throw new BadRequestException(`Interactive '${interactiveId}' not found`);
    }
    return { message: 'Interactive deleted successfully' };
  }

  @Post('workspaces/:id/interactives/:interactiveId/share')
  shareWorkspaceInteractive(
    @Param('id') workspaceId: string,
    @Param('interactiveId') interactiveId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const interactive = this.designSystemService.shareWorkspaceInteractive(interactiveId, body.workspaceIds, body.requestingWorkspaceId);
    if (!interactive) {
      throw new BadRequestException(`Failed to share interactive '${interactiveId}'`);
    }
    return interactive;
  }

  @Post('workspaces/:id/interactives/:interactiveId/make-global')
  makeWorkspaceInteractiveGlobal(
    @Param('id') workspaceId: string,
    @Param('interactiveId') interactiveId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const interactive = this.designSystemService.makeWorkspaceInteractiveGlobal(interactiveId, body.requestingWorkspaceId);
    if (!interactive) {
      throw new BadRequestException(`Failed to make interactive '${interactiveId}' global`);
    }
    return interactive;
  }

  // ==================== Workspace Stock Photos ====================

  @Post('workspaces/:id/stock-photos')
  addWorkspaceStockPhoto(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      url: string;
      thumbnailUrl?: string;
      photographer?: string;
      license?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceStockPhoto(workspaceId, data);
  }

  @Get('workspaces/:id/stock-photos')
  getWorkspaceStockPhotos(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceStockPhotos(workspaceId, userId);
  }

  @Put('workspaces/:id/stock-photos/:photoId')
  updateWorkspaceStockPhoto(
    @Param('id') workspaceId: string,
    @Param('photoId') photoId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      photographer?: string;
      license?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const photo = this.designSystemService.updateWorkspaceStockPhoto(photoId, updates);
    if (!photo) {
      throw new BadRequestException(`Stock photo '${photoId}' not found`);
    }
    return photo;
  }

  @Delete('workspaces/:id/stock-photos/:photoId')
  deleteWorkspaceStockPhoto(
    @Param('id') workspaceId: string,
    @Param('photoId') photoId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceStockPhoto(photoId);
    if (!deleted) {
      throw new BadRequestException(`Stock photo '${photoId}' not found`);
    }
    return { message: 'Stock photo deleted successfully' };
  }

  @Post('workspaces/:id/stock-photos/:photoId/share')
  shareWorkspaceStockPhoto(
    @Param('id') workspaceId: string,
    @Param('photoId') photoId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const photo = this.designSystemService.shareWorkspaceStockPhoto(photoId, body.workspaceIds, body.requestingWorkspaceId);
    if (!photo) {
      throw new BadRequestException(`Failed to share stock photo '${photoId}'`);
    }
    return photo;
  }

  @Post('workspaces/:id/stock-photos/:photoId/make-global')
  makeWorkspaceStockPhotoGlobal(
    @Param('id') workspaceId: string,
    @Param('photoId') photoId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const photo = this.designSystemService.makeWorkspaceStockPhotoGlobal(photoId, body.requestingWorkspaceId);
    if (!photo) {
      throw new BadRequestException(`Failed to make stock photo '${photoId}' global`);
    }
    return photo;
  }

  // ==================== Workspace Illustrations ====================

  @Post('workspaces/:id/illustrations')
  addWorkspaceIllustration(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      url: string;
      thumbnailUrl?: string;
      style?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceIllustration(workspaceId, data);
  }

  @Get('workspaces/:id/illustrations')
  getWorkspaceIllustrations(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('style') style?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceIllustrations(workspaceId, userId, style);
  }

  @Put('workspaces/:id/illustrations/:illustrationId')
  updateWorkspaceIllustration(
    @Param('id') workspaceId: string,
    @Param('illustrationId') illustrationId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      style?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const illustration = this.designSystemService.updateWorkspaceIllustration(illustrationId, updates);
    if (!illustration) {
      throw new BadRequestException(`Illustration '${illustrationId}' not found`);
    }
    return illustration;
  }

  @Delete('workspaces/:id/illustrations/:illustrationId')
  deleteWorkspaceIllustration(
    @Param('id') workspaceId: string,
    @Param('illustrationId') illustrationId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceIllustration(illustrationId);
    if (!deleted) {
      throw new BadRequestException(`Illustration '${illustrationId}' not found`);
    }
    return { message: 'Illustration deleted successfully' };
  }

  @Post('workspaces/:id/illustrations/:illustrationId/share')
  shareWorkspaceIllustration(
    @Param('id') workspaceId: string,
    @Param('illustrationId') illustrationId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const illustration = this.designSystemService.shareWorkspaceIllustration(illustrationId, body.workspaceIds, body.requestingWorkspaceId);
    if (!illustration) {
      throw new BadRequestException(`Failed to share illustration '${illustrationId}'`);
    }
    return illustration;
  }

  @Post('workspaces/:id/illustrations/:illustrationId/make-global')
  makeWorkspaceIllustrationGlobal(
    @Param('id') workspaceId: string,
    @Param('illustrationId') illustrationId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const illustration = this.designSystemService.makeWorkspaceIllustrationGlobal(illustrationId, body.requestingWorkspaceId);
    if (!illustration) {
      throw new BadRequestException(`Failed to make illustration '${illustrationId}' global`);
    }
    return illustration;
  }

  // ==================== Workspace Capability Logos ====================

  @Post('workspaces/:id/capability-logos')
  addWorkspaceCapabilityLogo(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      capability?: string;
      url: string;
      thumbnailUrl?: string;
      format?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceCapabilityLogo(workspaceId, data);
  }

  @Get('workspaces/:id/capability-logos')
  getWorkspaceCapabilityLogos(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('capability') capability?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceCapabilityLogos(workspaceId, userId, capability);
  }

  @Put('workspaces/:id/capability-logos/:logoId')
  updateWorkspaceCapabilityLogo(
    @Param('id') workspaceId: string,
    @Param('logoId') logoId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      capability?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const logo = this.designSystemService.updateWorkspaceCapabilityLogo(logoId, updates);
    if (!logo) {
      throw new BadRequestException(`Capability logo '${logoId}' not found`);
    }
    return logo;
  }

  @Delete('workspaces/:id/capability-logos/:logoId')
  deleteWorkspaceCapabilityLogo(
    @Param('id') workspaceId: string,
    @Param('logoId') logoId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceCapabilityLogo(logoId);
    if (!deleted) {
      throw new BadRequestException(`Capability logo '${logoId}' not found`);
    }
    return { message: 'Capability logo deleted successfully' };
  }

  @Post('workspaces/:id/capability-logos/:logoId/share')
  shareWorkspaceCapabilityLogo(
    @Param('id') workspaceId: string,
    @Param('logoId') logoId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const logo = this.designSystemService.shareWorkspaceCapabilityLogo(logoId, body.workspaceIds, body.requestingWorkspaceId);
    if (!logo) {
      throw new BadRequestException(`Failed to share capability logo '${logoId}'`);
    }
    return logo;
  }

  @Post('workspaces/:id/capability-logos/:logoId/make-global')
  makeWorkspaceCapabilityLogoGlobal(
    @Param('id') workspaceId: string,
    @Param('logoId') logoId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const logo = this.designSystemService.makeWorkspaceCapabilityLogoGlobal(logoId, body.requestingWorkspaceId);
    if (!logo) {
      throw new BadRequestException(`Failed to make capability logo '${logoId}' global`);
    }
    return logo;
  }

  // ==================== Workspace Style Dictionaries ====================

  @Post('workspaces/:id/style-dictionaries')
  addWorkspaceStyleDictionary(
    @Param('id') workspaceId: string,
    @Body() data: {
      name: string;
      description?: string;
      format?: 'json' | 'css' | 'scss' | 'less' | 'js' | 'ts';
      tokens?: Record<string, any>;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceStyleDictionary(workspaceId, data);
  }

  @Get('workspaces/:id/style-dictionaries')
  getWorkspaceStyleDictionaries(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('format') format?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceStyleDictionaries(workspaceId, userId, format);
  }

  @Put('workspaces/:id/style-dictionaries/:dictId')
  updateWorkspaceStyleDictionary(
    @Param('id') workspaceId: string,
    @Param('dictId') dictId: string,
    @Body() updates: {
      name?: string;
      description?: string;
      format?: 'json' | 'css' | 'scss' | 'less' | 'js' | 'ts';
      tokens?: Record<string, any>;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const dict = this.designSystemService.updateWorkspaceStyleDictionary(dictId, updates);
    if (!dict) {
      throw new BadRequestException(`Style dictionary '${dictId}' not found`);
    }
    return dict;
  }

  @Delete('workspaces/:id/style-dictionaries/:dictId')
  deleteWorkspaceStyleDictionary(
    @Param('id') workspaceId: string,
    @Param('dictId') dictId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceStyleDictionary(dictId);
    if (!deleted) {
      throw new BadRequestException(`Style dictionary '${dictId}' not found`);
    }
    return { message: 'Style dictionary deleted successfully' };
  }

  @Post('workspaces/:id/style-dictionaries/:dictId/share')
  shareWorkspaceStyleDictionary(
    @Param('id') workspaceId: string,
    @Param('dictId') dictId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const dict = this.designSystemService.shareWorkspaceStyleDictionary(dictId, body.workspaceIds, body.requestingWorkspaceId);
    if (!dict) {
      throw new BadRequestException(`Failed to share style dictionary '${dictId}'`);
    }
    return dict;
  }

  @Post('workspaces/:id/style-dictionaries/:dictId/make-global')
  makeWorkspaceStyleDictionaryGlobal(
    @Param('id') workspaceId: string,
    @Param('dictId') dictId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const dict = this.designSystemService.makeWorkspaceStyleDictionaryGlobal(dictId, body.requestingWorkspaceId);
    if (!dict) {
      throw new BadRequestException(`Failed to make style dictionary '${dictId}' global`);
    }
    return dict;
  }

  // ==================== Workspace Guidelines ====================

  @Post('workspaces/:id/guidelines')
  addWorkspaceGuideline(
    @Param('id') workspaceId: string,
    @Body() data: {
      title: string;
      description?: string;
      category?: 'design' | 'accessibility' | 'content' | 'interaction' | 'visual' | 'technical' | 'other';
      content?: string;
      url?: string;
      tags?: string[];
      createdBy: string;
      sharedWith?: string[];
      isGlobal?: boolean;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.addWorkspaceGuideline(workspaceId, data);
  }

  @Get('workspaces/:id/guidelines')
  getWorkspaceGuidelines(
    @Param('id') workspaceId: string,
    @Query('userId') userId?: string,
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getWorkspaceGuidelines(workspaceId, userId, category);
  }

  @Put('workspaces/:id/guidelines/:guidelineId')
  updateWorkspaceGuideline(
    @Param('id') workspaceId: string,
    @Param('guidelineId') guidelineId: string,
    @Body() updates: {
      title?: string;
      description?: string;
      category?: 'design' | 'accessibility' | 'content' | 'interaction' | 'visual' | 'technical' | 'other';
      content?: string;
      url?: string;
      tags?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const guideline = this.designSystemService.updateWorkspaceGuideline(guidelineId, updates);
    if (!guideline) {
      throw new BadRequestException(`Guideline '${guidelineId}' not found`);
    }
    return guideline;
  }

  @Delete('workspaces/:id/guidelines/:guidelineId')
  deleteWorkspaceGuideline(
    @Param('id') workspaceId: string,
    @Param('guidelineId') guidelineId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.designSystemService.deleteWorkspaceGuideline(guidelineId);
    if (!deleted) {
      throw new BadRequestException(`Guideline '${guidelineId}' not found`);
    }
    return { message: 'Guideline deleted successfully' };
  }

  @Post('workspaces/:id/guidelines/:guidelineId/share')
  shareWorkspaceGuideline(
    @Param('id') workspaceId: string,
    @Param('guidelineId') guidelineId: string,
    @Body() body: {
      workspaceIds: string[];
      requestingWorkspaceId: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const guideline = this.designSystemService.shareWorkspaceGuideline(guidelineId, body.workspaceIds, body.requestingWorkspaceId);
    if (!guideline) {
      throw new BadRequestException(`Failed to share guideline '${guidelineId}'`);
    }
    return guideline;
  }

  @Post('workspaces/:id/guidelines/:guidelineId/make-global')
  makeWorkspaceGuidelineGlobal(
    @Param('id') workspaceId: string,
    @Param('guidelineId') guidelineId: string,
    @Body() body: { requestingWorkspaceId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const guideline = this.designSystemService.makeWorkspaceGuidelineGlobal(guidelineId, body.requestingWorkspaceId);
    if (!guideline) {
      throw new BadRequestException(`Failed to make guideline '${guidelineId}' global`);
    }
    return guideline;
  }

  // ==================== User Management ====================

  @Get('users')
  getAllUsers(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getAllUsersWithWorkspaces();
  }

  @Get('users/:userId/workspaces')
  getUserWorkspaces(
    @Param('userId') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getUserWorkspaces(userId);
  }

  @Post('users/:userId/workspaces')
  addUserToWorkspace(
    @Param('userId') userId: string,
    @Body() body: {
      workspaceId: string;
      email: string;
      role: 'admin' | 'editor' | 'viewer';
      addedBy: string;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.addUserToWorkspace(
      body.workspaceId,
      userId,
      body.email,
      body.role,
      body.addedBy
    );
    if (!workspace) {
      throw new BadRequestException(`Failed to add user to workspace`);
    }
    return workspace;
  }

  @Delete('users/:userId/workspaces/:workspaceId')
  removeUserFromWorkspace(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const workspace = this.designSystemService.removeUserFromWorkspace(workspaceId, userId);
    if (!workspace) {
      throw new BadRequestException(`Failed to remove user from workspace`);
    }
    return workspace;
  }
}
