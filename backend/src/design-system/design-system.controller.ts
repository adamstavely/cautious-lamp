import { Controller, Get, Post, Put, Delete, Query, Param, Headers, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';

@Controller('api/v1')
export class DesignSystemController {
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
  health() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Post('applications/register')
  registerApplication(
    @Body() body: { name: string; repository?: string; version?: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.registerApplication(body.name, body.repository, body.version);
  }

  @Get('applications')
  getApplications(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.designSystemService.getAllApplications();
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

  // Component metadata for Loupe Tool
  @Get('components/metadata')
  getComponentMetadata(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.designSystemService.getComponentMetadata();
  }
}
