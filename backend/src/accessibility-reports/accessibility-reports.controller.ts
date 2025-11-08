import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AccessibilityReportsService, ReportSchedule } from './accessibility-reports.service';

@Controller('api/v1/accessibility-reports')
export class AccessibilityReportsController {
  constructor(
    private readonly reportsService: AccessibilityReportsService,
  ) {}

  @Post('generate/:applicationId')
  async generateReport(
    @Param('applicationId') applicationId: string,
    @Body() options?: { scheduled?: boolean; scheduleId?: string }
  ) {
    return this.reportsService.generateReport(applicationId, options);
  }

  @Get('reports')
  async getReports(@Query('applicationId') applicationId?: string) {
    return this.reportsService.getReports(applicationId);
  }

  @Get('reports/:reportId')
  async getReport(@Param('reportId') reportId: string) {
    const report = this.reportsService.getReport(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }
    return report;
  }

  @Get('schedules')
  async getSchedules(@Query('applicationId') applicationId?: string) {
    return this.reportsService.getSchedules(applicationId);
  }

  @Post('schedules')
  async createSchedule(@Body() schedule: Omit<ReportSchedule, 'id' | 'nextRun'>) {
    return this.reportsService.createSchedule(schedule);
  }

  @Put('schedules/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updates: Partial<ReportSchedule>
  ) {
    const schedule = this.reportsService.updateSchedule(scheduleId, updates);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }
    return schedule;
  }

  @Delete('schedules/:scheduleId')
  async deleteSchedule(@Param('scheduleId') scheduleId: string) {
    const deleted = this.reportsService.deleteSchedule(scheduleId);
    if (!deleted) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }
    return { success: true };
  }
}

