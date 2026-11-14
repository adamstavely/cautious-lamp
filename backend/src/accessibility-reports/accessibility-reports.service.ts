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
import { READ_SCOPE, ReadScopeResolver, canReadApplicationEvidence } from '../governance/evidence-access';
import { ClockInput, MAX_DEAD_LETTERS, OccurrencePolicy, clockOf, leaseUntil, occurrencePolicy, retryAt } from '../governance/occurrence-policy';
import { APPLICATION_DIRECTORY, ApplicationDirectory, GovernanceApplication } from '../governance/sources';
import { DocVersion, DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import {
  AccessibilityReport,
  ApplicationComplianceSummary,
  ComplianceSLA,
  MultiApplicationComplianceSummary,
  PendingRun,
  PublicReportSchedule,
  ReportSchedule,
} from './accessibility-reports.types';
import { AxeOutcome, runAxeOnHtml, runAxeOnUrl } from './axe-engine';
import { buildReport, withConformance } from './report-builder';
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

/** One stored report per scheduled occurrence, however many attempts or instances run it */
export const scheduledReportId = (scheduleId: string, occurrence: string) => `report-${scheduleId}-${new Date(occurrence).getTime()}`;

type Claim = { scheduleId: string; token: string; pending: PendingRun };

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

  readonly policy: OccurrencePolicy = occurrencePolicy('A11Y_SCHEDULER');

  constructor(
    @Inject(REPORT_STORE) private readonly reports: DocumentStore<AccessibilityReport>,
    @Inject(SCHEDULE_STORE) private readonly schedules: DocumentStore<ReportSchedule>,
    @Inject(SLA_STORE) private readonly slas: DocumentStore<ComplianceSLA>,
    @Inject(APPLICATION_DIRECTORY) private readonly applications: ApplicationDirectory,
    @Inject(A11Y_SCANNER) private readonly scanner: A11yScanner,
    @Inject(READ_SCOPE) private readonly readScope: ReadScopeResolver,
  ) {}

  onModuleInit(): void {
    this.refreshCache().catch((error) => this.logger.warn(`Accessibility summary cache not loaded: ${error.message}`));
  }

  // -------------------------------------------------------------- reports

  async generateReport(
    applicationId: string,
    request: { url?: string; html?: string },
    actor: Actor,
    options: { scheduled?: boolean; scheduleId?: string; occurrence?: string; id?: string } = {},
  ): Promise<AccessibilityReport> {
    // A scheduled occurrence that already stored its report (a run that was taken over) isn't scanned again
    if (options.id) {
      const existing = await this.reports.get(options.id);
      if (existing) return withConformance(existing.doc);
    }
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

    const previousSummary = (await this.allReports(applicationId))[0];
    const previous = previousSummary ? (await this.reports.get(previousSummary.id))?.doc ?? null : null;
    const report = buildReport(
      outcome,
      {
        id: options.id ?? `report-${randomUUID()}`,
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
    report.access = { workspaceId: application.workspaceId ?? null };
    if (options.occurrence) report.occurrence = options.occurrence;
    try {
      await this.reports.create(report);
    } catch (error) {
      // Another run of the same occurrence stored it first: keep that one
      if (!(options.id && error instanceof DuplicateDocumentError)) throw error;
      const stored = await this.reports.get(options.id);
      if (stored) return withConformance(stored.doc);
      throw error;
    }
    // Only the accessibility timestamp: a report isn't this period's governance scan
    await this.applications.recordScan(applicationId, new Date(report.generatedAt), 'accessibility');
    await this.refreshCache().catch(() => undefined);
    return report;
  }

  /**
   * Reports the principal may read (newest first): those of applications in
   * their workspaces, or every one for governance admins (evidence-access.ts).
   */
  async getReports(principal: AuthPrincipal, applicationId?: string): Promise<ReportSummary[]> {
    const scope = await this.readScope.scopeFor(principal);
    return (await this.allReports(applicationId)).filter((report) => canReadApplicationEvidence(principal, scope, report.access));
  }

  /** A report the principal may not read is a 404, like a missing one */
  async getReport(principal: AuthPrincipal, id: string): Promise<AccessibilityReport> {
    const found = await this.reports.get(id);
    if (!found || !canReadApplicationEvidence(principal, await this.readScope.scopeFor(principal), found.doc.access)) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return withConformance(found.doc);
  }

  /** Every report, unfiltered (trends, the summary cache, the scheduler) */
  private async allReports(applicationId?: string): Promise<ReportSummary[]> {
    const all = (await this.reports.list({ excludes: HEAVY_FIELDS })) as ReportSummary[];
    return all
      .filter((report) => !applicationId || report.applicationId === applicationId)
      .map((report) => withConformance(this.stripHeavy(report)))
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  async deleteReport(id: string): Promise<void> {
    if (!(await this.reports.delete(id))) throw new NotFoundException(`Report ${id} not found`);
    await this.refreshCache().catch(() => undefined);
  }

  // ------------------------------------------------------------ summaries

  /**
   * Fresh multi-application summary (reloads applications, latest reports
   * and SLAs), limited to the applications whose reports the principal may
   * read, by the application's current workspace.
   */
  async getComplianceSummary(principal: AuthPrincipal): Promise<MultiApplicationComplianceSummary> {
    await this.refreshCache();
    const scope = await this.readScope.scopeFor(principal);
    const visible = new Set(
      this.cache.applications.filter((app) => canReadApplicationEvidence(principal, scope, { workspaceId: app.workspaceId ?? null })).map((app) => app.id),
    );
    return this.getMultiApplicationComplianceSummary(visible);
  }

  /**
   * Summary from the in-memory cache, for callers that can't await
   * (SystemHealthService). The cache is refreshed on start, after every
   * report/SLA change and on every GET /summary. `only` limits it to those applications.
   */
  getMultiApplicationComplianceSummary(only?: ReadonlySet<string>): MultiApplicationComplianceSummary {
    const slaByApp = new Map(this.cache.slas.map((sla) => [sla.applicationId, sla]));
    const included = this.cache.applications.filter((app) => !only || only.has(app.id));
    const applications: ApplicationComplianceSummary[] = included.map((app) => {
      const latest = this.cache.latest.get(app.id);
      return {
        applicationId: app.id,
        applicationName: app.name,
        latestReportId: latest?.id,
        complianceScore: latest ? latest.complianceScore : null,
        wcagLevel: latest ? latest.wcagLevel : null,
        conformanceStatus: latest ? latest.conformance.status : null,
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
    const order: Record<string, number> = { 'non-compliant': 0, 'at-risk': 1, 'needs-review': 2, 'no-report': 3, 'no-sla': 4, compliant: 5 };
    return {
      totalApplications: applications.length,
      reportedApplications: reported.length,
      compliantApplications: count('compliant'),
      atRiskApplications: count('at-risk'),
      nonCompliantApplications: count('non-compliant'),
      needsReviewApplications: count('needs-review'),
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

  /**
   * Schedules of the applications the principal may read (by the
   * application's current workspace, as for reports), without the claim's
   * lease token and expiry. A schedule the principal may not read is a 404.
   */
  async getSchedules(principal: AuthPrincipal, applicationId?: string): Promise<PublicReportSchedule[]> {
    const [all, canRead] = await Promise.all([this.schedules.list(), this.applicationReader(principal)]);
    return all
      .filter((s) => (!applicationId || s.applicationId === applicationId) && canRead(s.applicationId))
      .sort((a, b) => a.nextRun.localeCompare(b.nextRun))
      .map(publicSchedule);
  }

  async getSchedule(principal: AuthPrincipal, id: string): Promise<PublicReportSchedule> {
    const found = await this.schedules.get(id);
    if (!found || !(await this.applicationReader(principal))(found.doc.applicationId)) throw new NotFoundException(`Schedule ${id} not found`);
    return publicSchedule(found.doc);
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
        // An occurrence in flight or waiting for a retry carries on under the new settings
        ...(current.pending ? { pending: current.pending } : {}),
        ...(current.deadLetters ? { deadLetters: current.deadLetters } : {}),
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
   * Runs every attempt that is due: schedules whose nextRun has passed,
   * retries whose time has come, and claims whose lease expired (the
   * instance running them died). Each attempt is claimed first with a
   * compare-and-swap write that records a lease, so two instances never run
   * the same attempt; nextRun only moves on once the occurrence completes or
   * is dead-lettered after the last attempt (occurrence-policy.ts). The report
   * has a fixed id per occurrence, so a takeover after it was stored
   * completes the occurrence without a second report.
   */
  async runDueSchedules(at?: ClockInput): Promise<number> {
    const clock = clockOf(at);
    let ran = 0;
    for (const schedule of await this.schedules.list()) {
      if (!schedule.enabled || !this.attemptDue(schedule, clock())) continue;
      const claim = await this.claimAttempt(schedule.id, clock());
      if (!claim) continue;
      ran++;
      const { occurrence } = claim.pending;
      try {
        const current = (await this.schedules.get(claim.scheduleId))?.doc;
        if (!current) continue;
        const report = await this.generateReport(current.applicationId, { url: current.url }, 'scheduler', {
          scheduled: true,
          scheduleId: current.id,
          occurrence,
          id: scheduledReportId(current.id, occurrence),
        });
        await this.finishAttempt(claim, { reportId: report.id }, clock());
      } catch (error) {
        const message = (error as Error).message.slice(0, 500);
        this.logger.warn(`Scheduled report ${claim.scheduleId} failed (attempt ${claim.pending.attempts} of ${this.policy.maxAttempts}): ${message}`);
        await this.finishAttempt(claim, { error: message }, clock()).catch(() => undefined);
      }
    }
    return ran;
  }

  private attemptDue(schedule: ReportSchedule, now: Date): boolean {
    const pending = schedule.pending;
    if (!pending) return new Date(schedule.nextRun) <= now;
    if (pending.state === 'claimed') return new Date(pending.leaseUntil ?? 0) <= now;
    return new Date(pending.retryAt ?? 0) <= now;
  }

  /** Claims the next attempt, or null if another instance got there first (or the last attempt died: dead-lettered) */
  private async claimAttempt(id: string, now: Date): Promise<Claim | null> {
    const found = await this.schedules.get(id);
    if (!found || !found.doc.enabled || !this.attemptDue(found.doc, now)) return null;
    const previous = found.doc.pending;
    const attempts = (previous?.attempts ?? 0) + 1;
    if (previous?.state === 'claimed' && attempts > this.policy.maxAttempts) {
      await this.writeSchedule(this.deadLettered(found.doc, `The run was interrupted ${previous.attempts} time(s) (its lease expired)`, now), found).catch(() => false);
      return null;
    }
    const pending: PendingRun = {
      occurrence: previous?.occurrence ?? found.doc.nextRun,
      state: 'claimed',
      attempts,
      token: randomUUID(),
      leaseUntil: leaseUntil(this.policy, now).toISOString(),
      ...(previous?.lastError ? { lastError: previous.lastError } : {}),
    };
    return (await this.writeSchedule({ ...found.doc, pending }, found)) ? { scheduleId: id, token: pending.token, pending } : null;
  }

  /**
   * Completes an attempt. Only the run holding the claim can: one whose
   * lease was taken over changes nothing. Success moves nextRun on; a failure
   * schedules a retry, or dead-letters the occurrence after the last attempt.
   */
  private async finishAttempt(claim: Claim, result: { reportId: string } | { error: string }, now: Date): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.schedules.get(claim.scheduleId);
      if (!found || found.doc.pending?.token !== claim.token) return;
      let next: ReportSchedule;
      if (!('error' in result)) {
        const { pending: _pending, lastError: _error, ...rest } = found.doc;
        next = { ...rest, nextRun: this.advance(found.doc, now), lastRun: now.toISOString(), lastStatus: 'success', lastReportId: result.reportId };
      } else if (claim.pending.attempts >= this.policy.maxAttempts) {
        next = this.deadLettered(found.doc, result.error, now);
      } else {
        const { leaseUntil: _lease, ...pending } = found.doc.pending;
        next = {
          ...found.doc,
          pending: { ...pending, state: 'retry', retryAt: retryAt(this.policy, claim.pending.attempts, now).toISOString(), lastError: result.error },
          lastStatus: 'failed',
          lastError: result.error,
        };
      }
      if (await this.writeSchedule(next, found)) return;
    }
  }

  /** Gives up on the pending occurrence: recorded in deadLetters, and nextRun moves on */
  private deadLettered(schedule: ReportSchedule, error: string, now: Date): ReportSchedule {
    const { pending, ...rest } = schedule;
    const letter = { occurrence: pending?.occurrence ?? schedule.nextRun, attempts: pending?.attempts ?? 1, error, at: now.toISOString() };
    this.logger.error(`Scheduled report ${schedule.id} (${letter.occurrence}) dead-lettered after ${letter.attempts} attempt(s): ${error}`);
    return {
      ...rest,
      nextRun: this.advance(schedule, now),
      lastRun: now.toISOString(),
      lastStatus: 'dead-letter',
      lastError: error,
      deadLetters: [letter, ...(schedule.deadLetters ?? [])].slice(0, MAX_DEAD_LETTERS),
    };
  }

  /** The next occurrence after now (an edited schedule may already have a future nextRun) */
  private advance(schedule: ReportSchedule, now: Date): string {
    return new Date(schedule.nextRun) > now ? schedule.nextRun : calculateNextRun(schedule, now).toISOString();
  }

  /** false when someone else wrote first */
  private async writeSchedule(next: ReportSchedule, found: { version: DocVersion }): Promise<boolean> {
    try {
      await this.schedules.replace(next, found.version);
      return true;
    } catch (error) {
      if (error instanceof VersionConflictError) return false;
      throw error;
    }
  }

  // ------------------------------------------------------------------ SLAs

  /** SLAs of the applications the principal may read; one it may not read is a 404 */
  async getSLAs(principal: AuthPrincipal, applicationId?: string): Promise<ComplianceSLA[]> {
    const [all, canRead] = await Promise.all([this.slas.list(), this.applicationReader(principal)]);
    return all.filter((sla) => (!applicationId || sla.applicationId === applicationId) && canRead(sla.applicationId));
  }

  async getSLA(principal: AuthPrincipal, id: string): Promise<ComplianceSLA> {
    const found = await this.slas.get(id);
    if (!found || !(await this.applicationReader(principal))(found.doc.applicationId)) throw new NotFoundException(`SLA ${id} not found`);
    return found.doc;
  }

  /** Whether the principal may read an application's evidence, by the application's current workspace */
  private async applicationReader(principal: AuthPrincipal): Promise<(applicationId: string) => boolean> {
    const [scope, applications] = await Promise.all([this.readScope.scopeFor(principal), this.applications.list()]);
    const workspaceOf = new Map(applications.map((app) => [app.id, app.workspaceId ?? null]));
    return (applicationId) => canReadApplicationEvidence(principal, scope, { workspaceId: workspaceOf.get(applicationId) ?? null });
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

  private stripHeavy(report: ReportSummary): ReportSummary {
    const copy = { ...report } as Record<string, unknown>;
    for (const field of HEAVY_FIELDS) delete copy[field];
    return copy as ReportSummary;
  }

  private async refreshCache(): Promise<void> {
    const [applications, reports, slas] = await Promise.all([this.applications.list(), this.allReports(), this.slas.list()]);
    const latest = new Map<string, ReportSummary>();
    for (const report of reports) if (!latest.has(report.applicationId)) latest.set(report.applicationId, report);
    this.cache = { applications, latest, slas };
  }
}

/**
 * A schedule as clients see it: the pending occurrence's state, attempts and
 * retry time, without the claim token or lease expiry, which only the
 * scheduler uses.
 */
export function publicSchedule(schedule: ReportSchedule): PublicReportSchedule {
  if (!schedule.pending) return schedule;
  const { token: _token, leaseUntil: _leaseUntil, ...pending } = schedule.pending;
  return { ...schedule, pending };
}
