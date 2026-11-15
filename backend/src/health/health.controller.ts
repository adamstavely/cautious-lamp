import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/principal';
import { HealthReport, HealthService } from './health.service';

/** The one health check: public, so load balancers and clients can call it without a credential */
@Controller('api/v1')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 200 when Elasticsearch answers, 503 (with the same report) when it doesn't */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const report = await this.health.check();
    if (report.status !== 'ok') res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
