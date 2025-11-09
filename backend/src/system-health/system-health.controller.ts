import { Controller, Get, Query } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';

@Controller('api/v1/system-health')
export class SystemHealthController {
  constructor(
    private readonly systemHealthService: SystemHealthService,
  ) {}

  @Get('score')
  getHealthScore() {
    const healthScore = this.systemHealthService.calculateHealthScore();
    const alerts = this.systemHealthService.checkHealthScoreAlerts(healthScore.score);
    const recommendations = this.systemHealthService.generateRecommendations(healthScore);

    return {
      ...healthScore,
      timestamp: healthScore.timestamp instanceof Date ? healthScore.timestamp.toISOString() : healthScore.timestamp,
      alerts,
      recommendations,
    };
  }

  @Get('trends')
  getHealthScoreTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.systemHealthService.getHealthScoreTrends(daysNum);
  }

  @Get('recommendations')
  getRecommendations() {
    const healthScore = this.systemHealthService.calculateHealthScore();
    return this.systemHealthService.generateRecommendations(healthScore);
  }

  @Get('alerts')
  getAlerts() {
    const healthScore = this.systemHealthService.calculateHealthScore();
    return this.systemHealthService.checkHealthScoreAlerts(healthScore.score);
  }

  @Get('audit-report')
  getAuditReport() {
    return this.systemHealthService.generateAuditReport();
  }
}

