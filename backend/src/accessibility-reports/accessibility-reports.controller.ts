import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CreateScheduleDto, CreateSlaDto, GenerateReportDto, UpdateScheduleDto, UpdateSlaDto, strictBody } from './accessibility-reports.dto';
import { AccessibilityReportsService } from './accessibility-reports.service';

/**
 * Accessibility reports, schedules and SLAs (docs/GOVERNANCE.md). Reads need
 * any signed-in caller; everything that changes data needs admin:governance.
 */
@Controller('api/v1/accessibility-reports')
export class AccessibilityReportsController {
  constructor(private readonly reports: AccessibilityReportsService) {}

  @Post('generate/:applicationId')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  generateReport(@Param('applicationId') applicationId: string, @Body(strictBody()) body: GenerateReportDto, @Principal() principal: AuthPrincipal) {
    return this.reports.generateReport(applicationId, body ?? {}, principal);
  }

  @Get('summary')
  getComplianceSummary() {
    return this.reports.getComplianceSummary();
  }

  @Get('reports')
  getReports(@Query('applicationId') applicationId?: string) {
    return this.reports.getReports(applicationId || undefined);
  }

  @Get('reports/:reportId')
  getReport(@Param('reportId') reportId: string) {
    return this.reports.getReport(reportId);
  }

  @Delete('reports/:reportId')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteReport(@Param('reportId') reportId: string) {
    await this.reports.deleteReport(reportId);
  }

  // ---------------------------------------------------------- schedules

  @Get('schedules')
  getSchedules(@Query('applicationId') applicationId?: string) {
    return this.reports.getSchedules(applicationId || undefined);
  }

  @Get('schedules/:scheduleId')
  getSchedule(@Param('scheduleId') scheduleId: string) {
    return this.reports.getSchedule(scheduleId);
  }

  @Post('schedules')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  createSchedule(@Body(strictBody()) body: CreateScheduleDto, @Principal() principal: AuthPrincipal) {
    return this.reports.createSchedule(body, principal);
  }

  @Put('schedules/:scheduleId')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  updateSchedule(@Param('scheduleId') scheduleId: string, @Body(strictBody()) body: UpdateScheduleDto) {
    return this.reports.updateSchedule(scheduleId, body);
  }

  @Delete('schedules/:scheduleId')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteSchedule(@Param('scheduleId') scheduleId: string) {
    await this.reports.deleteSchedule(scheduleId);
  }

  // --------------------------------------------------------------- SLAs

  @Get('slas')
  getSLAs(@Query('applicationId') applicationId?: string) {
    return this.reports.getSLAs(applicationId || undefined);
  }

  @Get('slas/:slaId')
  getSLA(@Param('slaId') slaId: string) {
    return this.reports.getSLA(slaId);
  }

  @Post('slas')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  createSLA(@Body(strictBody()) body: CreateSlaDto) {
    return this.reports.createSLA(body);
  }

  @Put('slas/:slaId')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  updateSLA(@Param('slaId') slaId: string, @Body(strictBody()) body: UpdateSlaDto) {
    return this.reports.updateSLA(slaId, body);
  }

  @Delete('slas/:slaId')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteSLA(@Param('slaId') slaId: string) {
    await this.reports.deleteSLA(slaId);
  }
}
