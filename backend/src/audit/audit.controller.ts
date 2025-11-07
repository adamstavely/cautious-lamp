import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuditService, AuditAction } from './audit.service';

@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: any = {};

    if (userId) filters.userId = userId;
    if (action) filters.action = action as AuditAction;
    if (resourceType) filters.resourceType = resourceType;
    if (resourceId) filters.resourceId = resourceId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    const result = await this.auditService.query(filters);

    return {
      logs: result.logs,
      total: result.total,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    };
  }

  @Get('export')
  async exportLogs(
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: 'json' | 'csv' = 'csv',
  ) {
    const filters: any = {};

    if (userId) filters.userId = userId;
    if (action) filters.action = action as AuditAction;
    if (resourceType) filters.resourceType = resourceType;
    if (resourceId) filters.resourceId = resourceId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const data = await this.auditService.export(filters, format);

    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    const contentType = format === 'json' ? 'application/json' : 'text/csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // Get all logs for stats
    const { logs } = await this.auditService.query({ ...filters, limit: 10000 });

    const stats = {
      total: logs.length,
      byAction: {} as Record<string, number>,
      byResourceType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      successRate: 0,
      errors: 0,
    };

    let successCount = 0;

    logs.forEach((log) => {
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // Count by resource type
      stats.byResourceType[log.resourceType] = (stats.byResourceType[log.resourceType] || 0) + 1;

      // Count by user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;

      // Count success/errors
      if (log.success) {
        successCount++;
      } else {
        stats.errors++;
      }
    });

    stats.successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

    return stats;
  }
}

