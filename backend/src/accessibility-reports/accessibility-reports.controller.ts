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
    const report = await this.reportsService.generateReport(applicationId, options);
    // Serialize Date objects to ISO strings for JSON response
    return {
      ...report,
      generatedAt: report.generatedAt instanceof Date ? report.generatedAt.toISOString() : report.generatedAt,
    };
  }

  @Get('reports')
  async getReports(@Query('applicationId') applicationId?: string) {
    const reports = this.reportsService.getReports(applicationId);
    // Serialize Date objects to ISO strings for JSON response
    return reports.map(report => ({
      ...report,
      generatedAt: report.generatedAt instanceof Date ? report.generatedAt.toISOString() : report.generatedAt,
      trend: report.trend,
    }));
  }

  @Get('reports/:reportId')
  async getReport(@Param('reportId') reportId: string) {
    const report = this.reportsService.getReport(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }
    // Serialize Date objects to ISO strings for JSON response
    return {
      ...report,
      generatedAt: report.generatedAt instanceof Date ? report.generatedAt.toISOString() : report.generatedAt,
    };
  }

  @Get('schedules')
  async getSchedules(@Query('applicationId') applicationId?: string) {
    const schedules = this.reportsService.getSchedules(applicationId);
    // Serialize Date objects to ISO strings for JSON response
    return schedules.map(schedule => ({
      ...schedule,
      lastRun: schedule.lastRun instanceof Date ? schedule.lastRun.toISOString() : schedule.lastRun,
      nextRun: schedule.nextRun instanceof Date ? schedule.nextRun.toISOString() : schedule.nextRun,
    }));
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

