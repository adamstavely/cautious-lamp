import { Controller, Get, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { SystemHealthService } from './system-health.service';

/**
 * Every figure is limited to the components, applications and accessibility
 * reports the caller may read. Reads never record anything: history comes
 * from the daily snapshots SystemHealthSnapshotScheduler stores.
 */
@Controller('api/v1/system-health')
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get('score')
  getHealthScore(@Principal() principal: AuthPrincipal) {
    return this.systemHealthService.getDashboard(principal);
  }

  @Get('trends')
  getHealthScoreTrends(@Principal() principal: AuthPrincipal, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.systemHealthService.getHealthScoreTrends(principal, daysNum);
  }

  @Get('recommendations')
  async getRecommendations(@Principal() principal: AuthPrincipal) {
    return this.systemHealthService.generateRecommendations(await this.systemHealthService.calculateHealthScore(principal));
  }

  @Get('alerts')
  async getAlerts(@Principal() principal: AuthPrincipal) {
    return this.systemHealthService.checkHealthScoreAlerts(await this.systemHealthService.calculateHealthScore(principal));
  }

  @Get('audit-report')
  getAuditReport(@Principal() principal: AuthPrincipal) {
    return this.systemHealthService.generateAuditReport(principal);
  }
}
