import { Controller, Get, Post, Put, Delete, Query, Param, Body, BadRequestException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { ComponentAccessService } from './component-access.service';
import { AuthPrincipal, Principal, Public, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';

@Controller('api/v1')
export class DesignSystemController {
  @Public()
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
    private readonly componentAccess: ComponentAccessService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  @Get('tokens')
  getTokens(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('tag') tag?: string,
  ) {
    const tokens = this.designSystemService.getAllTokens(category, type, tag);
    return { 
      tokens,
      count: tokens.length,
      filters: { category, type, tag }
    };
  }

  @Get('tokens/category/:category')
  getTokensByCategory(
    @Param('category') category: string,
  ) {
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
  async getComponentMetadata(@Principal() principal: AuthPrincipal) {
    const components = await this.componentAccess.list(principal);
    try {
      return this.designSystemService.getComponentMetadata(components);
    } catch (error) {
      console.error('Error getting component metadata:', error);
      throw new BadRequestException('Failed to retrieve component metadata');
    }
  }

  // Component reads go through ComponentAccessService, which hides other workspaces' components
  @Get('components')
  async getComponents(
    @Principal() principal: AuthPrincipal,
    @Query('status') status?: string,
  ) {
    const components = await this.componentAccess.list(principal, status);
    return { 
      components,
      count: components.length,
      filters: { status }
    };
  }

  @Get('components/:id/test-coverage')
  async getComponentTestCoverage(
    @Param('id') id: string,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.get(principal, id);
    return this.designSystemService.calculateTestCoverage(id);
  }

  @Get('components/:id')
  getComponent(
    @Param('id') id: string,
    @Principal() principal: AuthPrincipal,
  ) {
    return this.componentAccess.get(principal, id);
  }

  @Get('components/status/:status')
  async getComponentsByStatus(
    @Param('status') status: string,
    @Principal() principal: AuthPrincipal,
  ) {
    const components = await this.componentAccess.list(principal, status);
    return { 
      components,
      status,
      count: components.length
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Post('ai/chat')
  async chatWithAI(
    @Body() body: { message: string; conversationHistory?: Array<{ role: string; content: string }> },
    @Principal() principal: AuthPrincipal,
  ) {
    const components = await this.componentAccess.list(principal);
    return await this.designSystemService.chatWithAI(body.message, body.conversationHistory, components);
  }

  @Get('performance/budgets')
  getPerformanceBudgets() {
    return this.designSystemService.getPerformanceBudgets();
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Post('performance/budgets')
  createPerformanceBudget(
    @Body() body: { name: string; metric: string; threshold: number; unit: string; alertThreshold?: number },
  ) {
    return this.designSystemService.createPerformanceBudget(body.name, body.metric, body.threshold, body.unit, body.alertThreshold);
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Put('performance/budgets/:id')
  updatePerformanceBudget(
    @Param('id') id: string,
    @Body() body: { name?: string; threshold?: number; alertThreshold?: number; enabled?: boolean },
  ) {
    return this.designSystemService.updatePerformanceBudget(id, body);
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Delete('performance/budgets/:id')
  deletePerformanceBudget(@Param('id') id: string) {
    return this.designSystemService.deletePerformanceBudget(id);
  }

  @Get('performance/bundle-analysis')
  getBundleAnalysis() {
    return this.designSystemService.getBundleAnalysis();
  }

  @Post('performance/bundle-analysis/analyze')
  analyzeBundle(
    @Body() body: { componentId?: string; includeDependencies?: boolean },
  ) {
    return this.designSystemService.analyzeBundle(body.componentId, body.includeDependencies);
  }

  @Get('roadmap')
  getRoadmap() {
    return this.designSystemService.getRoadmap();
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post('roadmap/items')
  createRoadmapItem(
    @Body() body: { title: string; description: string; category: string; priority: string; targetDate?: string; status?: string },
  ) {
    return this.designSystemService.createRoadmapItem(body);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Put('roadmap/items/:id')
  updateRoadmapItem(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; category?: string; priority?: string; targetDate?: string; status?: string },
  ) {
    return this.designSystemService.updateRoadmapItem(id, body);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Delete('roadmap/items/:id')
  deleteRoadmapItem(@Param('id') id: string) {
    return this.designSystemService.deleteRoadmapItem(id);
  }

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

  @RequirePermission(Permission.ADMIN_BANNERS)
  @Post('banners')
  createBanner(
    @Body() body: { title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; expiresAt?: string },
  ) {
    return this.designSystemService.createBanner(body);
  }

  @RequirePermission(Permission.ADMIN_BANNERS)
  @Put('banners/:id')
  updateBanner(
    @Param('id') id: string,
    @Body() body: { title?: string; message?: string; type?: 'info' | 'warning' | 'error' | 'success'; isActive?: boolean; expiresAt?: string },
  ) {
    return this.designSystemService.updateBanner(id, body);
  }

  @RequirePermission(Permission.ADMIN_BANNERS)
  @Delete('banners/:id')
  deleteBanner(
    @Param('id') id: string,
  ) {
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
  ) {
    return this.componentRequestService.getAllRequests({ status, category, assignedTo, priority });
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
  ) {
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
  ) {
    const request = this.componentRequestService.updateRequest(id, body);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Delete('requests/:id')
  deleteRequest(
    @Param('id') id: string,
  ) {
    const deleted = this.componentRequestService.deleteRequest(id);
    if (!deleted) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return { success: true };
  }

  @Post('requests/:id/vote')
  voteRequest(
    @Param('id') id: string,
    @Principal() principal: AuthPrincipal,
  ) {
    const request = this.componentRequestService.voteRequest(id, principal.id);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Put('requests/:id/status')
  updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Principal() principal: AuthPrincipal,
  ) {
    try {
      const request = this.componentRequestService.transitionStatus(id, body.status as any, principal.id);
      if (!request) {
        throw new BadRequestException(`Request ${id} not found`);
      }
      return request;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Put('requests/:id/assign')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
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
  ) {
    return this.componentRequestService.addComment(id, body);
  }

  @Get('requests/:id/comments')
  getComments(
    @Param('id') id: string,
  ) {
    return this.componentRequestService.getComments(id);
  }

  @Put('requests/:id/link-component')
  linkToComponent(
    @Param('id') id: string,
    @Body() body: { componentId: string },
  ) {
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
  ) {
    return this.componentRequestService.getAllIssues({ status, severity, componentId });
  }

  @Get('issues/:id')
  getIssue(
    @Param('id') id: string,
  ) {
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
  ) {
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
  ) {
    const issue = this.componentRequestService.updateIssue(id, body);
    if (!issue) {
      throw new BadRequestException(`Issue ${id} not found`);
    }
    return issue;
  }

  // Analytics
  @Get('requests/analytics')
  getRequestAnalytics() {
    return this.componentRequestService.getRequestAnalytics();
  }

  // Request Templates
  @Get('requests/templates')
  getRequestTemplates() {
    return this.componentRequestService.getRequestTemplates();
  }

  @Get('requests/templates/:id')
  getRequestTemplate(
    @Param('id') id: string,
  ) {
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
  ) {
    const thresholdValue = threshold ? parseFloat(threshold) : 0.7;
    return this.componentRequestService.findDuplicateRequests(id, thresholdValue);
  }

  // Merge Requests
  @RequirePermission(Permission.ROADMAP_EDIT)
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
  ) {
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
    @Principal() principal: AuthPrincipal,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getNotifications(principal.id, unreadOnly === 'true');
  }

  @Put('notifications/:id/read')
  markNotificationAsRead(
    @Param('id') id: string,
  ) {
    const success = this.notificationService.markAsRead(id);
    if (!success) {
      throw new BadRequestException(`Notification ${id} not found`);
    }
    return { success: true };
  }

  @Put('notifications/read-all')
  markAllNotificationsAsRead(
    @Principal() principal: AuthPrincipal,
  ) {
    const count = this.notificationService.markAllAsRead(principal.id);
    return { success: true, count };
  }

  @Get('notifications/unread-count')
  getUnreadCount(
    @Principal() principal: AuthPrincipal,
  ) {
    return { count: this.notificationService.getUnreadCount(principal.id) };
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
  ) {
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
  ) {
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
  ) {
    return this.designSystemService.submitHeuristicEvaluation(body);
  }

  // Token Relationship Mapping endpoints
  @Get('tokens/relationships')
  getTokenRelationships(
    @Query('token') tokenName?: string,
  ) {
    return this.designSystemService.getTokenRelationships(tokenName);
  }

  @Get('tokens/:name/impact')
  getTokenImpactAnalysis(
    @Param('name') tokenName: string,
  ) {
    return this.designSystemService.getTokenImpactAnalysis(tokenName);
  }

  // Component Variant Builder endpoints
  @Get('components/:id/variants')
  async getComponentVariants(
    @Param('id') componentId: string,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.get(principal, componentId);
    return {
      variants: this.designSystemService.getComponentVariants(componentId),
    };
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Post('components/:id/variants')
  async saveComponentVariant(
    @Param('id') componentId: string,
    @Body() variant: any,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.get(principal, componentId);
    return this.designSystemService.saveComponentVariant(componentId, variant);
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Delete('components/:id/variants/:variantName')
  async deleteComponentVariant(
    @Param('id') componentId: string,
    @Param('variantName') variantName: string,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.get(principal, componentId);
    const deleted = this.designSystemService.deleteComponentVariant(componentId, variantName);
    if (!deleted) {
      throw new BadRequestException(`Variant '${variantName}' not found for component '${componentId}'`);
    }
    return { success: true };
  }

  // Component creation with auto-linking
  @RequirePermission(Permission.COMPONENT_CREATE)
  @Post('components')
  async createComponent(
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
      workspaceId?: string;
    },
    @Principal() principal: AuthPrincipal,
  ) {
    // Only a workspace's editors add components to it; sharing is set through the workspace routes
    if (data.workspaceId !== undefined) {
      await this.workspaceAccess.require(principal, data.workspaceId, 'editor');
    }
    return this.designSystemService.createComponent({ ...data, isGlobal: false });
  }

  // Get linked requests for a component
  @Get('components/:id/linked-requests')
  async getLinkedRequests(
    @Param('id') componentId: string,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.get(principal, componentId);
    // This would need to query ComponentRequestsService
    // For now, return empty array - this can be enhanced later
    return { requests: [] };
  }

  // Catch-all routes last: Nest matches in declaration order, so these
  // would otherwise swallow tokens/relationships, requests/analytics and
  // requests/templates.
  @Get('tokens/:name')
  getToken(
    @Param('name') name: string,
  ) {
    const token = this.designSystemService.getTokenByName(name);
    if (!token) {
      throw new BadRequestException(`Token '${name}' not found`);
    }
    return token;
  }

  @Get('requests/:id')
  getRequest(
    @Param('id') id: string,
  ) {
    const request = this.componentRequestService.getRequest(id);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }
}
