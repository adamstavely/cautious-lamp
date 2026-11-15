import { Controller, Get, Post, Put, Delete, Query, Param, Body, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { Component, DesignSystemService } from './design-system.service';
import {
  AnalyzeBundleDto,
  ComponentDependenciesDto,
  ComponentVariantDto,
  CreateBannerDto,
  CreateComponentDto,
  CreateIssueDto,
  CreatePerformanceBudgetDto,
  CreateRoadmapItemDto,
  DeprecateComponentDto,
  HeuristicEvaluationDto,
  NasaTlxDto,
  SusDto,
  UpdateBannerDto,
  UpdateComponentStatusDto,
  UpdateIssueDto,
  UpdatePerformanceBudgetDto,
  UpdateRoadmapItemDto,
} from './design-system.dto';
import { strictBody } from '../auth/auth.dto';
import { ComponentIssueService } from './component-issue.service';
import { ComponentAccessService } from './component-access.service';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { CHANGE_RECORDER, ChangeRecorder } from '../notifications/notification.types';

/** The changelog fields every component change shares: who can see it and where it lives */
function componentChange(component: Component) {
  return {
    type: 'component' as const,
    entityId: component.id,
    entityName: component.name,
    workspaceId: component.workspaceId,
    audience: component.workspaceId && !component.isGlobal ? [component.workspaceId, ...(component.sharedWith ?? [])] : [],
    link: '/components',
  };
}

@Controller('api/v1')
export class DesignSystemController {
  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly componentIssueService: ComponentIssueService,
    private readonly componentAccess: ComponentAccessService,
    private readonly workspaceAccess: WorkspaceAccessService,
    @Inject(CHANGE_RECORDER) private readonly changes: ChangeRecorder,
  ) {}

  @Get('tokens')
  async getTokens(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('tag') tag?: string,
  ) {
    await this.designSystemService.ready();
    const tokens = this.designSystemService.getAllTokens(category, type, tag);
    return { 
      tokens,
      count: tokens.length,
      filters: { category, type, tag }
    };
  }

  @Get('tokens/category/:category')
  async getTokensByCategory(
    @Param('category') category: string,
  ) {
    await this.designSystemService.ready();
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

  @Get('performance/budgets')
  getPerformanceBudgets() {
    return this.designSystemService.getPerformanceBudgets();
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Post('performance/budgets')
  createPerformanceBudget(
    @Body(strictBody()) body: CreatePerformanceBudgetDto,
  ) {
    return this.designSystemService.createPerformanceBudget(body.name, body.metric, body.threshold, body.unit, body.alertThreshold);
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Put('performance/budgets/:id')
  updatePerformanceBudget(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdatePerformanceBudgetDto,
  ) {
    const { name, threshold, alertThreshold, enabled } = body;
    return this.designSystemService.updatePerformanceBudget(id, { name, threshold, alertThreshold, enabled });
  }

  @RequirePermission(Permission.ADMIN_PERFORMANCE_ANALYSIS)
  @Delete('performance/budgets/:id')
  deletePerformanceBudget(@Param('id') id: string) {
    return this.designSystemService.deletePerformanceBudget(id);
  }

  // Only the components the caller can read are measured, counted or followed as dependencies
  @Get('performance/bundle-analysis')
  async getBundleAnalysis(@Principal() principal: AuthPrincipal) {
    return this.designSystemService.getBundleAnalysis(await this.componentAccess.list(principal));
  }

  @Post('performance/bundle-analysis/analyze')
  async analyzeBundle(
    @Principal() principal: AuthPrincipal,
    @Body(strictBody()) body: AnalyzeBundleDto,
  ) {
    const visible = await this.componentAccess.list(principal);
    return this.designSystemService.analyzeBundle(body.componentId, body.includeDependencies, visible);
  }

  @Get('roadmap')
  getRoadmap() {
    return this.designSystemService.getRoadmap();
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post('roadmap/items')
  createRoadmapItem(
    @Body(strictBody()) body: CreateRoadmapItemDto,
  ) {
    return this.designSystemService.createRoadmapItem(body);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Put('roadmap/items/:id')
  updateRoadmapItem(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdateRoadmapItemDto,
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
    @Body(strictBody()) body: CreateBannerDto,
  ) {
    return this.designSystemService.createBanner(body);
  }

  @RequirePermission(Permission.ADMIN_BANNERS)
  @Put('banners/:id')
  updateBanner(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdateBannerDto,
  ) {
    return this.designSystemService.updateBanner(id, body);
  }

  @RequirePermission(Permission.ADMIN_BANNERS)
  @Delete('banners/:id')
  async deleteBanner(
    @Param('id') id: string,
  ) {
    await this.designSystemService.deleteBanner(id);
    return { success: true };
  }

  // Issue endpoints. Reporting an issue is feedback (feedback:create);
  // triaging one changes how a component is tracked (component:edit).
  @Get('issues')
  getIssues(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('componentId') componentId?: string,
  ) {
    return this.componentIssueService.list({ status, severity, componentId });
  }

  @Get('issues/:id')
  async getIssue(
    @Param('id') id: string,
  ) {
    const issue = await this.componentIssueService.get(id);
    if (!issue) {
      throw new BadRequestException(`Issue ${id} not found`);
    }
    return issue;
  }

  @RequirePermission(Permission.FEEDBACK_CREATE)
  @Post('issues')
  createIssue(
    @Body(strictBody()) body: CreateIssueDto,
    @Principal() principal: AuthPrincipal,
  ) {
    const { title, description, category, severity, componentId } = body;
    return this.componentIssueService.create({ title, description, category, severity, componentId, reportedBy: principal.id });
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Put('issues/:id')
  async updateIssue(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdateIssueDto,
  ) {
    const issue = await this.componentIssueService.update(id, body);
    if (!issue) {
      throw new BadRequestException(`Issue ${id} not found`);
    }
    return issue;
  }

  // NASA-TLX endpoint
  @Post('nasa-tlx')
  submitNASATLX(
    @Body(strictBody()) body: NasaTlxDto,
  ) {
    return this.designSystemService.submitNASATLX(body);
  }

  // System Usability Scale endpoint
  @Post('sus')
  submitSUS(
    @Body(strictBody()) body: SusDto,
  ) {
    return this.designSystemService.submitSUS(body);
  }

  // Heuristic Evaluation endpoint
  @Post('heuristic-evaluation')
  submitHeuristicEvaluation(
    @Body(strictBody()) body: HeuristicEvaluationDto,
  ) {
    // Left out, the service stamps it with the time of submission
    return this.designSystemService.submitHeuristicEvaluation({ ...body, timestamp: body.timestamp });
  }

  // Token Relationship Mapping endpoints
  @Get('tokens/relationships')
  async getTokenRelationships(
    @Query('token') tokenName?: string,
  ) {
    await this.designSystemService.ready();
    return this.designSystemService.getTokenRelationships(tokenName);
  }

  @Get('tokens/:name/impact')
  async getTokenImpactAnalysis(
    @Param('name') tokenName: string,
  ) {
    await this.designSystemService.ready();
    return this.designSystemService.getTokenImpactAnalysis(tokenName);
  }

  // Component Variant Builder endpoints. Changing variants needs component:edit
  // and write access to the component (ComponentAccessService.getForWrite).
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
    @Body(strictBody()) body: ComponentVariantDto,
    @Principal() principal: AuthPrincipal,
  ) {
    const component = await this.componentAccess.getForWrite(principal, componentId);
    // The stored code is generated from the properties, never taken from the body
    const { name, description, properties } = body;
    const saved = await this.designSystemService.saveComponentVariant(componentId, { name, description, properties });
    await this.changes.record(
      {
        ...componentChange(component),
        action: 'updated',
        changes: [{ field: 'variants', description: `Variant "${saved.name}" saved` }],
      },
      principal,
    );
    return saved;
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Delete('components/:id/variants/:variantName')
  async deleteComponentVariant(
    @Param('id') componentId: string,
    @Param('variantName') variantName: string,
    @Principal() principal: AuthPrincipal,
  ) {
    const component = await this.componentAccess.getForWrite(principal, componentId);
    const deleted = await this.designSystemService.deleteComponentVariant(componentId, variantName);
    if (!deleted) {
      throw new BadRequestException(`Variant '${variantName}' not found for component '${componentId}'`);
    }
    // Code that used the variant stops working, so removing one is breaking
    await this.changes.record(
      {
        ...componentChange(component),
        action: 'updated',
        breaking: true,
        changes: [{ field: 'variants', description: `Variant "${variantName}" removed` }],
      },
      principal,
    );
    return { success: true };
  }

  // Lifecycle: status, deprecation and dependencies. Same rule as variants:
  // component:edit, and write access to the component.
  @RequirePermission(Permission.COMPONENT_EDIT)
  @Put('components/:id/status')
  async updateComponentStatus(
    @Param('id') componentId: string,
    @Body(strictBody()) body: UpdateComponentStatusDto,
    @Principal() principal: AuthPrincipal,
  ) {
    const previous = (await this.componentAccess.getForWrite(principal, componentId)).status;
    const component = await this.designSystemService.setComponentStatus(componentId, body.status, principal.id);
    if (component.status !== previous) {
      await this.changes.record(
        {
          ...componentChange(component),
          action: component.status === 'deprecated' ? 'deprecated' : 'status-changed',
          changes: [{ field: 'status', description: `Status changed from ${previous} to ${component.status}` }],
        },
        principal,
      );
    }
    return component;
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Put('components/:id/deprecation')
  async deprecateComponent(
    @Param('id') componentId: string,
    @Body(strictBody()) body: DeprecateComponentDto,
    @Principal() principal: AuthPrincipal,
  ) {
    const wasDeprecated = (await this.componentAccess.getForWrite(principal, componentId)).status === 'deprecated';
    const component = await this.designSystemService.deprecateComponent(componentId, body, await this.visibleComponentIds(principal), principal.id);
    const details = [
      body.replacement && `Use ${body.replacement} instead`,
      body.sunsetDate && `Sunset on ${body.sunsetDate}`,
      body.reason,
    ].filter((text): text is string => !!text);
    await this.changes.record(
      {
        ...componentChange(component),
        action: wasDeprecated ? 'updated' : 'deprecated',
        changes: details.map((description) => ({ field: 'deprecation', description })),
      },
      principal,
    );
    return component;
  }

  @RequirePermission(Permission.COMPONENT_EDIT)
  @Put('components/:id/dependencies')
  async updateComponentDependencies(
    @Param('id') componentId: string,
    @Body(strictBody()) body: ComponentDependenciesDto,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.componentAccess.getForWrite(principal, componentId);
    const component = await this.designSystemService.setComponentDependencies(componentId, body.dependencies, await this.visibleComponentIds(principal), principal.id);
    await this.changes.record(
      {
        ...componentChange(component),
        action: 'updated',
        changes: [{ field: 'dependencies', description: component.dependencies?.length ? `Depends on ${component.dependencies.join(', ')}` : 'No dependencies' }],
      },
      principal,
    );
    return component;
  }

  private async visibleComponentIds(principal: AuthPrincipal): Promise<Set<string>> {
    return new Set((await this.componentAccess.list(principal)).map((c) => c.id));
  }

  // Component creation with auto-linking
  @RequirePermission(Permission.COMPONENT_CREATE)
  @Post('components')
  async createComponent(
    @Body(strictBody()) data: CreateComponentDto,
    @Principal() principal: AuthPrincipal,
  ) {
    // Ids are global, so a clash with a component the caller can't see still conflicts
    await this.designSystemService.ready();
    if (this.designSystemService.getComponentById(data.id)) {
      throw new ConflictException(`A component with id '${data.id}' already exists`);
    }
    // Only a workspace's editors add components to it; sharing is set through the workspace routes
    if (data.workspaceId !== undefined) {
      await this.workspaceAccess.require(principal, data.workspaceId, 'editor');
    }
    const component = await this.designSystemService.createComponent({ ...data, isGlobal: false }, principal);
    await this.changes.record(
      {
        ...componentChange(component),
        action: component.status === 'deprecated' ? 'deprecated' : 'created',
        changes: component.description ? [{ description: component.description }] : [],
      },
      principal,
    );
    return component;
  }

  // Catch-all routes last: Nest matches in declaration order, so these
  // would otherwise swallow tokens/relationships.
  @Get('tokens/:name')
  async getToken(
    @Param('name') name: string,
  ) {
    await this.designSystemService.ready();
    const token = this.designSystemService.getTokenByName(name);
    if (!token) {
      throw new BadRequestException(`Token '${name}' not found`);
    }
    return token;
  }

}
