import { Controller, Get, Post, Put, Delete, Query, Param, Headers, Body, BadRequestException, NotFoundException, Request } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { TokenRotationService } from '../common/security/token-rotation.service';
import { KeyManagementService } from '../common/security/key-management.service';
import { AuthPrincipal, Principal, Public, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';

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
    private readonly tokenRotationService: TokenRotationService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  /**
   * No-op: the global AuthGuard has already authenticated the caller (a user
   * token or an API key, docs/AUTH.md). Kept so the call sites stay as they were.
   */
  private validateRequest(_authHeader?: string): void {}

  // API key management needs admin:users (the admin key has it)

  @RequirePermission(Permission.ADMIN_USERS)
  @Post('auth/api-keys')
  createApiKey(
    @Body() body: { name: string; expiresInDays?: number; scopes?: string[] },
    @Headers('authorization') authHeader?: string,
  ) {
    if (!body.name) {
      throw new BadRequestException('API key name is required');
    }
    const { key, metadata } = this.keyManagementService.createKey(body.name, {
      expiresInDays: body.expiresInDays,
      scopes: body.scopes,
    });
    return { apiKey: key, metadata: this.withoutSecrets(metadata) };
  }

  @RequirePermission(Permission.ADMIN_USERS)
  @Get('auth/api-keys')
  getApiKeys(@Headers('authorization') authHeader?: string) {
    return this.keyManagementService.getAllKeys().map((metadata) => this.withoutSecrets(metadata));
  }

  // Declared before 'auth/api-keys/:id' so ':id' doesn't capture it
  @RequirePermission(Permission.ADMIN_USERS)
  @Get('auth/api-keys/needing-rotation')
  getTokensNeedingRotation(@Headers('authorization') authHeader?: string) {
    return this.tokenRotationService.getTokensNeedingRotation();
  }

  @RequirePermission(Permission.ADMIN_USERS)
  @Get('auth/api-keys/:id')
  getApiKey(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    const metadata = this.keyManagementService.getKeyMetadata(id);
    if (!metadata) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    return this.withoutSecrets(metadata);
  }

  @RequirePermission(Permission.ADMIN_USERS)
  @Post('auth/api-keys/:id/rotate')
  async rotateApiKey(
    @Param('id') id: string,
    @Body() body: { revokeOld?: boolean; reason?: 'manual' | 'automatic' | 'expired' | 'compromised' },
    @Request() req: any,
    @Principal() principal: AuthPrincipal,
  ) {
    const userId = principal.id;
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
      newMetadata: this.withoutSecrets(result.newMetadata),
    };
  }

  @RequirePermission(Permission.ADMIN_USERS)
  @Post('auth/api-keys/:id/revoke')
  revokeApiKey(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    const success = this.keyManagementService.revokeKey(id);
    if (!success) {
      throw new NotFoundException(`API key with ID ${id} not found`);
    }
    return { message: 'API key revoked successfully' };
  }

  @RequirePermission(Permission.ADMIN_USERS)
  @Get('auth/api-keys/:id/rotation-history')
  getRotationHistory(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    return this.tokenRotationService.getRotationHistory(id);
  }

  /** Key metadata without the hash or the encrypted key */
  private withoutSecrets<T extends { keyHash?: string; encryptedKey?: string }>(metadata: T) {
    const { keyHash, encryptedKey, ...rest } = metadata;
    return rest;
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
    @Principal() principal: AuthPrincipal,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.componentRequestService.voteRequest(id, principal.id);
    if (!request) {
      throw new BadRequestException(`Request ${id} not found`);
    }
    return request;
  }

  @Put('requests/:id/status')
  updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Principal() principal: AuthPrincipal,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
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
    @Principal() principal: AuthPrincipal,
    @Query('unreadOnly') unreadOnly?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.notificationService.getNotifications(principal.id, unreadOnly === 'true');
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
    @Principal() principal: AuthPrincipal,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const count = this.notificationService.markAllAsRead(principal.id);
    return { success: true, count };
  }

  @Get('notifications/unread-count')
  getUnreadCount(
    @Principal() principal: AuthPrincipal,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
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
}
