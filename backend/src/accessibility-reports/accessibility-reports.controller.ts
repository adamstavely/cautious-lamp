import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AccessibilityReportsService, ReportSchedule, ComplianceSLA } from './accessibility-reports.service';

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

  /**
   * Multi-Application Compliance Dashboard
   */
  @Get('summary')
  async getComplianceSummary() {
    return this.reportsService.getMultiApplicationComplianceSummary();
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

  /**
   * SLA Management
   */
  @Post('slas')
  async createSLA(@Body() sla: Omit<ComplianceSLA, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSLA = this.reportsService.createSLA(sla);
    return {
      ...newSLA,
      createdAt: newSLA.createdAt instanceof Date ? newSLA.createdAt.toISOString() : newSLA.createdAt,
      updatedAt: newSLA.updatedAt instanceof Date ? newSLA.updatedAt.toISOString() : newSLA.updatedAt,
    };
  }

  @Get('slas')
  async getAllSLAs(@Query('applicationId') applicationId?: string) {
    if (applicationId) {
      const sla = this.reportsService.getSLAByApplication(applicationId);
      if (!sla) {
        return null;
      }
      return {
        ...sla,
        createdAt: sla.createdAt instanceof Date ? sla.createdAt.toISOString() : sla.createdAt,
        updatedAt: sla.updatedAt instanceof Date ? sla.updatedAt.toISOString() : sla.updatedAt,
      };
    }
    const slas = this.reportsService.getAllSLAs();
    return slas.map(sla => ({
      ...sla,
      createdAt: sla.createdAt instanceof Date ? sla.createdAt.toISOString() : sla.createdAt,
      updatedAt: sla.updatedAt instanceof Date ? sla.updatedAt.toISOString() : sla.updatedAt,
    }));
  }

  @Get('slas/:slaId')
  async getSLA(@Param('slaId') slaId: string) {
    const sla = this.reportsService.getSLA(slaId);
    if (!sla) {
      throw new Error(`SLA ${slaId} not found`);
    }
    return {
      ...sla,
      createdAt: sla.createdAt instanceof Date ? sla.createdAt.toISOString() : sla.createdAt,
      updatedAt: sla.updatedAt instanceof Date ? sla.updatedAt.toISOString() : sla.updatedAt,
    };
  }

  @Put('slas/:slaId')
  async updateSLA(
    @Param('slaId') slaId: string,
    @Body() updates: Partial<Omit<ComplianceSLA, 'id' | 'createdAt'>>
  ) {
    const sla = this.reportsService.updateSLA(slaId, updates);
    if (!sla) {
      throw new Error(`SLA ${slaId} not found`);
    }
    return {
      ...sla,
      createdAt: sla.createdAt instanceof Date ? sla.createdAt.toISOString() : sla.createdAt,
      updatedAt: sla.updatedAt instanceof Date ? sla.updatedAt.toISOString() : sla.updatedAt,
    };
  }

  @Delete('slas/:slaId')
  async deleteSLA(@Param('slaId') slaId: string) {
    const deleted = this.reportsService.deleteSLA(slaId);
    if (!deleted) {
      throw new Error(`SLA ${slaId} not found`);
    }
    return { success: true };
  }
}

