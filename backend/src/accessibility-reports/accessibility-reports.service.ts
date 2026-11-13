import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { assertPublicHttpUrl } from '../common/security/url-safety';
import { APPLICATION_DIRECTORY, ApplicationDirectory, GovernanceApplication } from '../governance/sources';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import {
  AccessibilityReport,
  ApplicationComplianceSummary,
  ComplianceSLA,
  MultiApplicationComplianceSummary,
  ReportSchedule,
} from './accessibility-reports.types';
import { AxeOutcome, runAxeOnHtml, runAxeOnUrl } from './axe-engine';
import { buildReport } from './report-builder';
import { ScheduleTiming, assertValidTiming, calculateNextRun } from './schedule';
import { evaluateSla } from './sla';

export const REPORT_STORE = Symbol('A11Y_REPORT_STORE');
export const SCHEDULE_STORE = Symbol('A11Y_SCHEDULE_STORE');
export const SLA_STORE = Symbol('A11Y_SLA_STORE');
export const A11Y_SCANNER = Symbol('A11Y_SCANNER');

export const REPORTS_INDEX = 'design-system-a11y-reports';
export const SCHEDULES_INDEX = 'design-system-a11y-schedules';
export const SLAS_INDEX = 'design-system-a11y-slas';

const keyword = { type: 'keyword' };
const date = { type: 'date' };
export const REPORT_PROPERTIES = { id: keyword, applicationId: keyword, scheduleId: keyword, generatedAt: date, createdAt: date, complianceScore: { type: 'float' } };
export const SCHEDULE_PROPERTIES = { id: keyword, applicationId: keyword, enabled: { type: 'boolean' }, nextRun: date, createdAt: date };
export const SLA_PROPERTIES = { id: keyword, applicationId: keyword, createdAt: date };

/** How reports scan; swapped in tests */
export interface A11yScanner {
  scanHtml(html: string): Promise<AxeOutcome>;
  scanUrl(url: string): Promise<AxeOutcome>;
}

export const axeScanner: A11yScanner = { scanHtml: runAxeOnHtml, scanUrl: (url) => runAxeOnUrl(url) };

/** Report fields that list views don't need */
const HEAVY_FIELDS = ['checks', 'prioritizedFixes', 'wcagCriteria'];

export type ReportSummary = Omit<AccessibilityReport, 'checks' | 'prioritizedFixes' | 'wcagCriteria'>;

type Actor = AuthPrincipal | 'scheduler';
const actorName = (actor: Actor) => (actor === 'scheduler' ? 'scheduler' : actor.type === 'user' ? actor.email : `service:${actor.id}`);

const slaId = (applicationId: string) => `sla-${encodeURIComponent(applicationId)}`;

/**
 * Accessibility reports (axe-core over a URL or supplied HTML), report
 * schedules and compliance SLAs, stored in Elasticsearch. See docs/GOVERNANCE.md.
 */
@Injectable()
export class AccessibilityReportsService implements OnModuleInit {
  private readonly logger = new Logger(AccessibilityReportsService.name);

  /** For the synchronous summary system-health reads; refreshed on every write and summary request */
  private cache: { applications: GovernanceApplication[]; latest: Map<string, ReportSummary>; slas: ComplianceSLA[] } = {
    applications: [],
    latest: new Map(),
    slas: [],
  };

  constructor(
    @Inject(REPORT_STORE) private readonly reports: DocumentStore<AccessibilityReport>,
    @Inject(SCHEDULE_STORE) private readonly schedules: DocumentStore<ReportSchedule>,
    @Inject(SLA_STORE) private readonly slas: DocumentStore<ComplianceSLA>,
    @Inject(APPLICATION_DIRECTORY) private readonly applications: ApplicationDirectory,
    @Inject(A11Y_SCANNER) private readonly scanner: A11yScanner,
  ) {}

  onModuleInit(): void {
    this.refreshCache().catch((error) => this.logger.warn(`Accessibility summary cache not loaded: ${error.message}`));
  }

  // -------------------------------------------------------------- reports

  async generateReport(
    applicationId: string,
    request: { url?: string; html?: string },
    actor: Actor,
    options: { scheduled?: boolean; scheduleId?: string } = {},
  ): Promise<AccessibilityReport> {
    const application = await this.requireApplication(applicationId);
    const html = request.html?.trim() ? request.html : undefined;
    if (html && request.url) throw new BadRequestException('Send either url or html, not both');
    const url = html ? undefined : request.url || application.applicationUrl;
    if (!html && !url) {
      throw new BadRequestException('Nothing to scan: send a url or html, or set the application URL');
    }

    let outcome: AxeOutcome;
    try {
      outcome = html ? await this.scanner.scanHtml(html) : await this.scanner.scanUrl(url!);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new UnprocessableEntityException(`Could not scan the page: ${(error as Error).message.split('\n')[0]}`);
    }

    const previousSummary = (await this.getReports(applicationId))[0];
    const previous = previousSummary ? (await this.reports.get(previousSummary.id))?.doc ?? null : null;
    const report = buildReport(
      outcome,
      {
        id: `report-${randomUUID()}`,
        applicationId,
        applicationName: application.name,
        generatedAt: new Date(),
        source: html ? 'html' : 'url',
        scheduled: options.scheduled,
        scheduleId: options.scheduleId,
        createdBy: actorName(actor),
      },
      previous,
    );
    report.createdAt = report.generatedAt;
    await this.reports.create(report);
    await this.applications.recordScan(applicationId, new Date(report.generatedAt));
    await this.refreshCache().catch(() => undefined);
    return report;
  }

  async getReports(applicationId?: string): Promise<ReportSummary[]> {
    const all = (await this.reports.list({ excludes: HEAVY_FIELDS })) as ReportSummary[];
    return all
      .filter((report) => !applicationId || report.applicationId === applicationId)
      .map((report) => this.stripHeavy(report))
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  async getReport(id: string): Promise<AccessibilityReport> {
    const found = await this.reports.get(id);
    if (!found) throw new NotFoundException(`Report ${id} not found`);
    return found.doc;
  }

  async deleteReport(id: string): Promise<void> {
    if (!(await this.reports.delete(id))) throw new NotFoundException(`Report ${id} not found`);
    await this.refreshCache().catch(() => undefined);
  }

  // ------------------------------------------------------------ summaries

  /** Fresh multi-application summary (reloads applications, latest reports and SLAs) */
  async getComplianceSummary(): Promise<MultiApplicationComplianceSummary> {
    await this.refreshCache();
    return this.getMultiApplicationComplianceSummary();
  }

  /**
   * Summary from the in-memory cache, for callers that can't await
   * (SystemHealthService). The cache is refreshed on start, after every
   * report/SLA change and on every GET /summary.
   */
  getMultiApplicationComplianceSummary(): MultiApplicationComplianceSummary {
    const slaByApp = new Map(this.cache.slas.map((sla) => [sla.applicationId, sla]));
    const applications: ApplicationComplianceSummary[] = this.cache.applications.map((app) => {
      const latest = this.cache.latest.get(app.id);
      return {
        applicationId: app.id,
        applicationName: app.name,
        latestReportId: latest?.id,
        complianceScore: latest ? latest.complianceScore : null,
        wcagLevel: latest ? latest.wcagLevel : null,
        totalIssues: latest?.totalIssues ?? 0,
        criticalIssues: latest?.criticalIssues ?? 0,
        highIssues: latest?.highIssues ?? 0,
        slaStatus: evaluateSla(slaByApp.get(app.id), latest),
        lastReportDate: latest?.generatedAt,
        trend: latest?.previousReportId ? { scoreChange: latest.trend.scoreChange, issuesChange: latest.trend.issuesChange } : undefined,
      };
    });
    const reported = applications.filter((a) => a.complianceScore !== null);
    const count = (status: string) => applications.filter((a) => a.slaStatus === status).length;
    const order: Record<string, number> = { 'non-compliant': 0, 'at-risk': 1, 'no-report': 2, 'no-sla': 3, compliant: 4 };
    return {
      totalApplications: applications.length,
      reportedApplications: reported.length,
      compliantApplications: count('compliant'),
      atRiskApplications: count('at-risk'),
      nonCompliantApplications: count('non-compliant'),
      unassessedApplications: count('no-sla') + count('no-report'),
      averageScore: reported.length ? Math.round((reported.reduce((sum, a) => sum + a.complianceScore!, 0) / reported.length) * 100) / 100 : 0,
      applications: applications.sort(
        (a, b) =>
          order[a.slaStatus] - order[b.slaStatus] ||
          (a.complianceScore ?? 101) - (b.complianceScore ?? 101) ||
          a.applicationName.localeCompare(b.applicationName),
      ),
    };
  }

  // ------------------------------------------------------------ schedules

  async getSchedules(applicationId?: string): Promise<ReportSchedule[]> {
    const all = await this.schedules.list();
    return all.filter((s) => !applicationId || s.applicationId === applicationId).sort((a, b) => a.nextRun.localeCompare(b.nextRun));
  }

  async getSchedule(id: string): Promise<ReportSchedule> {
    const found = await this.schedules.get(id);
    if (!found) throw new NotFoundException(`Schedule ${id} not found`);
    return found.doc;
  }

  async createSchedule(
    input: ScheduleTiming & { applicationId: string; url?: string; enabled?: boolean },
    principal: AuthPrincipal,
    now = new Date(),
  ): Promise<ReportSchedule> {
    const application = await this.requireApplication(input.applicationId);
    const timing = this.timing(input);
    const url = await this.scheduleUrl(input.url, application);
    const at = now.toISOString();
    const schedule: ReportSchedule = {
      id: `schedule-${randomUUID()}`,
      applicationId: application.id,
      ...(input.url ? { url } : {}),
      ...timing,
      enabled: input.enabled !== false,
      nextRun: calculateNextRun(timing, now).toISOString(),
      createdAt: at,
      updatedAt: at,
      createdBy: actorName(principal),
    };
    await this.schedules.create(schedule);
    return schedule;
  }

  async updateSchedule(id: string, changes: Partial<ScheduleTiming> & { url?: string; enabled?: boolean }, now = new Date()): Promise<ReportSchedule> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.schedules.get(id);
      if (!found) throw new NotFoundException(`Schedule ${id} not found`);
      const current = found.doc;
      const timing = this.timing({
        frequency: changes.frequency ?? current.frequency,
        time: changes.time ?? current.time,
        dayOfWeek: changes.dayOfWeek ?? current.dayOfWeek,
        dayOfMonth: changes.dayOfMonth ?? current.dayOfMonth,
      });
      let url = current.url;
      if (changes.url !== undefined) {
        const application = await this.requireApplication(current.applicationId);
        url = changes.url ? await this.scheduleUrl(changes.url, application) : undefined;
        if (!url && !application.applicationUrl) throw new BadRequestException('The schedule needs a URL: the application has none');
      }
      const enabled = changes.enabled ?? current.enabled;
      const timingChanged =
        timing.frequency !== current.frequency ||
        timing.time !== current.time ||
        timing.dayOfWeek !== current.dayOfWeek ||
        timing.dayOfMonth !== current.dayOfMonth;
      const reenabled = enabled && !current.enabled;
      const next: ReportSchedule = {
        id: current.id,
        applicationId: current.applicationId,
        ...(url ? { url } : {}),
        ...timing,
        enabled,
        nextRun: timingChanged || reenabled ? calculateNextRun(timing, now).toISOString() : current.nextRun,
        ...(current.lastRun ? { lastRun: current.lastRun } : {}),
        ...(current.lastStatus ? { lastStatus: current.lastStatus } : {}),
        ...(current.lastError ? { lastError: current.lastError } : {}),
        ...(current.lastReportId ? { lastReportId: current.lastReportId } : {}),
        createdAt: current.createdAt,
        updatedAt: now.toISOString(),
        createdBy: current.createdBy,
      };
      try {
        await this.schedules.replace(next, found.version);
        return next;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException(`Schedule ${id} is being changed concurrently; try again`);
  }

  async deleteSchedule(id: string): Promise<void> {
    if (!(await this.schedules.delete(id))) throw new NotFoundException(`Schedule ${id} not found`);
  }

  /**
   * Runs every enabled schedule whose nextRun has passed. Each one is claimed
   * first by moving nextRun forward with a compare-and-swap write, so two
   * backend instances never run the same occurrence.
   */
  async runDueSchedules(now = new Date()): Promise<number> {
    let ran = 0;
    for (const schedule of await this.schedules.list()) {
      if (!schedule.enabled || new Date(schedule.nextRun) > now) continue;
      const found = await this.schedules.get(schedule.id);
      if (!found || !found.doc.enabled || new Date(found.doc.nextRun) > now) continue;
      const claimed: ReportSchedule = { ...found.doc, nextRun: calculateNextRun(found.doc, now).toISOString(), lastRun: now.toISOString() };
      try {
        await this.schedules.replace(claimed, found.version);
      } catch (error) {
        if (error instanceof VersionConflictError) continue;
        throw error;
      }
      ran++;
      let result: Pick<ReportSchedule, 'lastStatus' | 'lastError' | 'lastReportId'>;
      try {
        const report = await this.generateReport(claimed.applicationId, { url: claimed.url }, 'scheduler', { scheduled: true, scheduleId: claimed.id });
        result = { lastStatus: 'success', lastReportId: report.id };
      } catch (error) {
        this.logger.warn(`Scheduled report ${claimed.id} failed: ${(error as Error).message}`);
        result = { lastStatus: 'failed', lastError: (error as Error).message.slice(0, 500) };
      }
      await this.recordRun(claimed.id, result);
    }
    return ran;
  }

  // ------------------------------------------------------------------ SLAs

  async getSLAs(applicationId?: string): Promise<ComplianceSLA[]> {
    const all = await this.slas.list();
    return all.filter((sla) => !applicationId || sla.applicationId === applicationId);
  }

  async getSLA(id: string): Promise<ComplianceSLA> {
    const found = await this.slas.get(id);
    if (!found) throw new NotFoundException(`SLA ${id} not found`);
    return found.doc;
  }

  /** One SLA per application: the id is derived from the application, so a second create is a 409 */
  async createSLA(input: Omit<ComplianceSLA, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceSLA> {
    await this.requireApplication(input.applicationId);
    const now = new Date().toISOString();
    const sla: ComplianceSLA = {
      id: slaId(input.applicationId),
      applicationId: input.applicationId,
      targetScore: input.targetScore,
      targetLevel: input.targetLevel,
      criticalIssuesThreshold: input.criticalIssuesThreshold,
      highIssuesThreshold: input.highIssuesThreshold,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.slas.create(sla);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException('This application already has an SLA; edit it instead');
      throw error;
    }
    await this.refreshCache().catch(() => undefined);
    return sla;
  }

  async updateSLA(
    id: string,
    changes: Partial<Pick<ComplianceSLA, 'targetScore' | 'targetLevel' | 'criticalIssuesThreshold' | 'highIssuesThreshold'>>,
  ): Promise<ComplianceSLA> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.slas.get(id);
      if (!found) throw new NotFoundException(`SLA ${id} not found`);
      const current = found.doc;
      const next: ComplianceSLA = {
        ...current,
        targetScore: changes.targetScore ?? current.targetScore,
        targetLevel: changes.targetLevel ?? current.targetLevel,
        criticalIssuesThreshold: changes.criticalIssuesThreshold ?? current.criticalIssuesThreshold,
        highIssuesThreshold: changes.highIssuesThreshold ?? current.highIssuesThreshold,
        updatedAt: new Date().toISOString(),
      };
      try {
        await this.slas.replace(next, found.version);
        await this.refreshCache().catch(() => undefined);
        return next;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException(`SLA ${id} is being changed concurrently; try again`);
  }

  async deleteSLA(id: string): Promise<void> {
    if (!(await this.slas.delete(id))) throw new NotFoundException(`SLA ${id} not found`);
    await this.refreshCache().catch(() => undefined);
  }

  // --------------------------------------------------------------- helpers

  private async requireApplication(id: string): Promise<GovernanceApplication> {
    const application = await this.applications.get(id);
    if (!application) throw new NotFoundException(`Application ${id} not found`);
    return application;
  }

  private timing(input: ScheduleTiming): ScheduleTiming {
    assertValidTiming(input);
    return {
      frequency: input.frequency,
      time: input.time,
      ...(input.frequency === 'weekly' ? { dayOfWeek: input.dayOfWeek } : {}),
      ...(input.frequency === 'monthly' ? { dayOfMonth: input.dayOfMonth } : {}),
    };
  }

  /** The URL a schedule scans: its own, else the application's; checked to be public */
  private async scheduleUrl(url: string | undefined, application: GovernanceApplication): Promise<string> {
    const resolved = url || application.applicationUrl;
    if (!resolved) throw new BadRequestException('The schedule needs a URL to scan: the application has none');
    return (await assertPublicHttpUrl(resolved)).toString();
  }

  private async recordRun(id: string, result: Pick<ReportSchedule, 'lastStatus' | 'lastError' | 'lastReportId'>): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.schedules.get(id);
      if (!found) return;
      const next: ReportSchedule = { ...found.doc, ...result };
      if (!result.lastError) delete next.lastError;
      try {
        await this.schedules.replace(next, found.version);
        return;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
  }

  private stripHeavy(report: ReportSummary): ReportSummary {
    const copy = { ...report } as Record<string, unknown>;
    for (const field of HEAVY_FIELDS) delete copy[field];
    return copy as ReportSummary;
  }

  private async refreshCache(): Promise<void> {
    const [applications, reports, slas] = await Promise.all([this.applications.list(), this.getReports(), this.slas.list()]);
    const latest = new Map<string, ReportSummary>();
    for (const report of reports) if (!latest.has(report.applicationId)) latest.set(report.applicationId, report);
    this.cache = { applications, latest, slas };
  }
}
