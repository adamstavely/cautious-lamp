import { BadRequestException, Controller, Get, Query, Param } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { ComponentAccessService } from '../design-system/component-access.service';
import { AnalyticsService, Timeframe } from './analytics.service';

const TIMEFRAMES: readonly Timeframe[] = ['7d', '30d', '90d', 'all'];

function timeframeOf(value?: string): Timeframe {
  if (!value) return 'all';
  if (!(TIMEFRAMES as readonly string[]).includes(value)) throw new BadRequestException(`timeframe must be one of ${TIMEFRAMES.join(', ')}`);
  return value as Timeframe;
}

/**
 * Every route works on the components and applications the caller may see, so
 * other workspaces' components and applications don't leak through analytics
 * (docs/WORKSPACES.md, "Analytics"). Usage comes from governance
 * application scans; GET /summary says whether any has been recorded.
 */
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly componentAccess: ComponentAccessService,
  ) {}

  @Get('summary')
  async getSummary(@Principal() principal: AuthPrincipal) {
    return this.analyticsService.getSummary(await this.analyticsService.applicationsVisibleTo(principal));
  }

  @Get('component-popularity')
  async getComponentPopularity(@Principal() principal: AuthPrincipal, @Query('timeframe') timeframe?: string) {
    return this.analyticsService.getComponentPopularity(
      timeframeOf(timeframe),
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('component/:componentId/usage')
  async getComponentUsage(
    @Principal() principal: AuthPrincipal,
    @Param('componentId') componentId: string,
    @Query('timeframe') timeframe?: string,
  ) {
    // A hidden component answers like a missing one
    await this.componentAccess.get(principal, componentId);
    return this.analyticsService.getComponentUsageAnalytics(componentId, timeframeOf(timeframe), await this.analyticsService.applicationsVisibleTo(principal));
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
    if (!Number.isFinite(daysNum) || daysNum < 1) throw new BadRequestException('days must be a positive number');
    return this.analyticsService.getUsageTrends(
      daysNum,
      await this.componentAccess.list(principal),
      await this.analyticsService.applicationsVisibleTo(principal),
    );
  }

  @Get('cross-application-comparison')
  async getCrossApplicationComparison(@Principal() principal: AuthPrincipal, @Query('applicationIds') applicationIds?: string) {
    const ids = applicationIds ? applicationIds.split(',').map((id) => id.trim()).filter(Boolean) : undefined;
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
