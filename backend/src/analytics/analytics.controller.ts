import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('component-popularity')
  getComponentPopularity(@Query('timeframe') timeframe?: '7d' | '30d' | '90d' | 'all') {
    return this.analyticsService.getComponentPopularity(timeframe || 'all');
  }

  @Get('component/:componentId/usage')
  getComponentUsage(
    @Param('componentId') componentId: string,
    @Query('timeframe') timeframe?: '7d' | '30d' | '90d' | 'all',
  ) {
    return this.analyticsService.getComponentUsageAnalytics(componentId, timeframe || 'all');
  }

  @Get('application-adoption')
  getApplicationAdoption() {
    return this.analyticsService.getApplicationAdoption();
  }

  @Get('usage-trends')
  getUsageTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getUsageTrends(daysNum);
  }

  @Get('cross-application-comparison')
  getCrossApplicationComparison(@Query('applicationIds') applicationIds?: string) {
    const ids = applicationIds ? applicationIds.split(',') : undefined;
    return this.analyticsService.getCrossApplicationComparison(ids);
  }

  @Get('design-debt')
  getDesignDebtMetrics() {
    return this.analyticsService.getDesignDebtMetrics();
  }
}

