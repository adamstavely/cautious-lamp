import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { ComponentAccessService } from '../design-system/component-access.service';
import { AnalyticsService } from './analytics.service';

/**
 * Every route works on the components and applications the caller may see, so
 * other workspaces' components and applications don't leak through analytics
 * (docs/WORKSPACES.md, "Analytics")
 */
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly componentAccess: ComponentAccessService,
  ) {}

  @Get('component-popularity')
  async getComponentPopularity(@Principal() principal: AuthPrincipal, @Query('timeframe') timeframe?: '7d' | '30d' | '90d' | 'all') {
    return this.analyticsService.getComponentPopularity(
      timeframe || 'all',
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('component/:componentId/usage')
  async getComponentUsage(
    @Principal() principal: AuthPrincipal,
    @Param('componentId') componentId: string,
    @Query('timeframe') timeframe?: '7d' | '30d' | '90d' | 'all',
  ) {
    // A hidden component answers like a missing one
    await this.componentAccess.get(principal, componentId);
    return this.analyticsService.getComponentUsageAnalytics(componentId, timeframe || 'all', await this.analyticsService.applicationsVisibleTo(principal));
  }

  @Get('application-adoption')
  async getApplicationAdoption(@Principal() principal: AuthPrincipal) {
    return this.analyticsService.getApplicationAdoption(
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('usage-trends')
  async getUsageTrends(@Principal() principal: AuthPrincipal, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getUsageTrends(
      daysNum,
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('cross-application-comparison')
  async getCrossApplicationComparison(@Principal() principal: AuthPrincipal, @Query('applicationIds') applicationIds?: string) {
    const ids = applicationIds ? applicationIds.split(',') : undefined;
    return this.analyticsService.getCrossApplicationComparison(
      ids,
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('design-debt')
  async getDesignDebtMetrics(@Principal() principal: AuthPrincipal) {
    return this.analyticsService.getDesignDebtMetrics(
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }
}
