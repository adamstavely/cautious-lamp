import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CreateScheduleDto, CreateSlaDto, GenerateReportDto, UpdateScheduleDto, UpdateSlaDto, strictBody } from './accessibility-reports.dto';
import { AccessibilityReportsService, publicSchedule } from './accessibility-reports.service';

/**
 * Accessibility reports, schedules and SLAs (docs/GOVERNANCE.md). Reads need
 * any signed-in caller; reports and the summary only show applications whose
 * evidence the caller may read (governance admins, or members of the
 * application's workspace). Everything that changes data needs admin:governance.
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
  getComplianceSummary(@Principal() principal: AuthPrincipal) {
    return this.reports.getComplianceSummary(principal);
  }

  @Get('reports')
  getReports(@Principal() principal: AuthPrincipal, @Query('applicationId') applicationId?: string) {
    return this.reports.getReports(principal, applicationId || undefined);
  }

  @Get('reports/:reportId')
  getReport(@Param('reportId') reportId: string, @Principal() principal: AuthPrincipal) {
    return this.reports.getReport(principal, reportId);
  }

  @Delete('reports/:reportId')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteReport(@Param('reportId') reportId: string) {
    await this.reports.deleteReport(reportId);
  }

  // ---------------------------------------------------------- schedules

  @Get('schedules')
  getSchedules(@Principal() principal: AuthPrincipal, @Query('applicationId') applicationId?: string) {
    return this.reports.getSchedules(principal, applicationId || undefined);
  }

  @Get('schedules/:scheduleId')
  getSchedule(@Param('scheduleId') scheduleId: string, @Principal() principal: AuthPrincipal) {
    return this.reports.getSchedule(principal, scheduleId);
  }

  @Post('schedules')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async createSchedule(@Body(strictBody()) body: CreateScheduleDto, @Principal() principal: AuthPrincipal) {
    return publicSchedule(await this.reports.createSchedule(body, principal));
  }

  @Put('schedules/:scheduleId')
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async updateSchedule(@Param('scheduleId') scheduleId: string, @Body(strictBody()) body: UpdateScheduleDto) {
    return publicSchedule(await this.reports.updateSchedule(scheduleId, body));
  }

  @Delete('schedules/:scheduleId')
  @HttpCode(204)
  @RequirePermission(Permission.ADMIN_GOVERNANCE)
  async deleteSchedule(@Param('scheduleId') scheduleId: string) {
    await this.reports.deleteSchedule(scheduleId);
  }

  // --------------------------------------------------------------- SLAs

  @Get('slas')
  getSLAs(@Principal() principal: AuthPrincipal, @Query('applicationId') applicationId?: string) {
    return this.reports.getSLAs(principal, applicationId || undefined);
  }

  @Get('slas/:slaId')
  getSLA(@Param('slaId') slaId: string, @Principal() principal: AuthPrincipal) {
    return this.reports.getSLA(principal, slaId);
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
