import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Headers, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { RegisterApplicationDto } from './dto/register-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateCapabilitiesDto } from './dto/update-capabilities.dto';

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
    private readonly notificationService: NotificationService
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
  createApiKey(@Body() body: { name: string }) {
    if (!body.name) {
      throw new BadRequestException('API key name is required');
    }
    const apiKey = this.designSystemService.createApiKey(body.name);
    return { apiKey, name: body.name, createdAt: new Date() };
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
