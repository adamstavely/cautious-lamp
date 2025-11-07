import { Controller, Get, Post, Put, Delete, Query, Param, Headers, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';

@Controller('api/v1')
export class DesignSystemController {
  constructor(private readonly designSystemService: DesignSystemService) {}

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
}
