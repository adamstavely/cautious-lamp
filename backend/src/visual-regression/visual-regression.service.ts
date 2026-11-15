import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { ErrorHandler } from '../common/errors/error-handler';
import { ProjectIntegrationSummary, checkEach } from '../integrations/integration.types';
import { PaginatedResponse, PaginationParams, createPaginatedResponse } from '../common/pagination/pagination.types';
import { EncryptionService } from '../common/security/encryption.service';
import { CreateProjectDto, NotificationConfig, WebhookPayload } from '../common/types/common.types';
import { DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from '../workspaces/queryable-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import { ARGOS_API_URL, ArgosApiClient, ArgosApiError, ArgosBuild, ArgosSnapshotDiff, ArgosVerificationFailed } from './argos-api.client';
import { CiSetup, buildCiSetup } from './ci-setup';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectAccessService, ProjectAction, ProjectCreator, ProjectShare } from './project-access';
import {
  Baseline,
  BaselineEvent,
  NotificationEntry,
  NotificationType,
  Project,
  ProjectDoc,
  RunStatus,
  TestResult,
  TestRun,
  TestRunDoc,
  VR_PROJECT_STORE,
  VR_RUN_STORE,
} from './visual-regression.types';

export type { Project, TestRun, TestResult } from './visual-regression.types';

const MAX_WRITE_ATTEMPTS = 5;

/** Argos statuses of builds that won't change by themselves */
const FINISHED_STATUSES = new Set(['accepted', 'rejected', 'no-changes', 'changes-detected', 'error', 'aborted', 'expired']);
/** Argos is asked for a project's builds at most this often when runs are listed */
const SYNC_INTERVAL_MS = 15_000;

/** Who owns a new project, and optionally a fixed id (for idempotent creation) */
export interface CreateProjectOptions {
  workspaceId: string | null;
  applicationId?: string;
  createdBy: ProjectCreator;
  /** Use this id; throws ProjectExistsError if a project already has it */
  id?: string;
}

/** Thrown by createProject when `options.id` is already taken */
export class ProjectExistsError extends ConflictException {
  constructor(readonly projectId: string) {
    super(`Project ${projectId} already exists`);
  }
}

function newProjectId(): string {
  return `vr-project-${crypto.randomBytes(9).toString('hex')}`;
}

/** The run of an Argos build in a project: the same build always gets the same run */
function runIdFor(projectId: string, argosBuildId: string): string {
  return `vr-run-${crypto.createHash('sha256').update(`${projectId}\n${argosBuildId}`).digest('hex').slice(0, 24)}`;
}

/** The project without its Argos token, webhook secret, baselines, shares and notification settings */
function toProject(doc: ProjectDoc): Project {
  const { argosToken, webhookSecret, baselines, baselineHistory, notifications, sharedWith, ...project } = doc;
  return { ...project, hasWebhookSecret: !!webhookSecret };
}

/** Printable ASCII, long enough to resist guessing */
const WEBHOOK_SECRET_PATTERN = /^[\x21-\x7e]{16,256}$/;

function toRun(doc: TestRunDoc): TestRun {
  const { results, resultIds, createdAt, ...run } = doc;
  return run;
}

/**
 * Visual regression projects (backed by Argos) and their runs, stored in
 * Elasticsearch (`design-system-visual-regression-projects` and `-runs`).
 * Access is per project (see ProjectAccessService): controllers call
 * `authorize*` before anything else.
 */
@Injectable()
export class VisualRegressionService {
  private readonly logger = new Logger(VisualRegressionService.name);
  /** Recent webhook deliveries, for diagnostics only (not persisted) */
  private webhookEvents: Array<{ projectId: string; event: string; payload: WebhookPayload; timestamp: Date }> = [];
  /** When each project's builds were last read from Argos */
  private readonly lastSync = new Map<string, number>();

  constructor(
    @Inject(VR_PROJECT_STORE) private readonly projects: QueryableStore<ProjectDoc>,
    @Inject(VR_RUN_STORE) private readonly runs: QueryableStore<TestRunDoc>,
    private readonly access: ProjectAccessService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ---------- Access ----------

  /** The project, if the principal may do `action` with it (404/403 otherwise) */
  async authorizeProject(principal: AuthPrincipal, projectId: string, action: ProjectAction): Promise<Project> {
    const doc = await this.requireProject(projectId);
    await this.access.assert(principal, doc, action);
    return toProject(doc);
  }

  /** The run, if the principal may do `action` with its project */
  async authorizeRun(principal: AuthPrincipal, runId: string, action: ProjectAction): Promise<TestRun> {
    const run = await this.requireRun(runId);
    const project = await this.findProject(run.projectId);
    if (!project) throw new NotFoundException(`Test run with ID ${runId} not found`);
    try {
      await this.access.assert(principal, project, action);
    } catch (error) {
      if (error instanceof NotFoundException) throw new NotFoundException(`Test run with ID ${runId} not found`);
      throw error;
    }
    return toRun(run);
  }

  /** Checks the principal may do `action` with the result's project */
  async authorizeResult(principal: AuthPrincipal, resultId: string, action: ProjectAction): Promise<void> {
    const run = await this.findRunByResult(resultId);
    if (!run) throw new NotFoundException(`Test result with ID ${resultId} not found`);
    const project = await this.findProject(run.projectId);
    if (!project) throw new NotFoundException(`Test result with ID ${resultId} not found`);
    try {
      await this.access.assert(principal, project, action);
    } catch (error) {
      if (error instanceof NotFoundException) throw new NotFoundException(`Test result with ID ${resultId} not found`);
      throw error;
    }
  }

  /** Checks the principal may create a project in the workspace (or, with none, owns it) */
  assertCanCreate(principal: AuthPrincipal, workspaceId: string | null | undefined): Promise<void> {
    return this.access.assertCanCreate(principal, workspaceId);
  }

  // ---------- Projects ----------

  /**
   * The Argos API URL to call. Projects store the client's token, so the server only
   * calls Argos hosts it is configured for (ARGOS_ALLOWED_BASE_URLS, comma-separated).
   * Projects saved with Argos's app URL (before the v2 API was used) mean the hosted API.
   */
  private resolveArgosBaseUrl(...candidates: Array<string | undefined>): string {
    const normalize = (url: string) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      return trimmed === 'https://app.argos-ci.com' || trimmed === 'https://api.argos-ci.com' ? ARGOS_API_URL : trimmed;
    };
    const defaultUrl = normalize(process.env.ARGOS_BASE_URL || ARGOS_API_URL);
    const allowed = new Set(
      (process.env.ARGOS_ALLOWED_BASE_URLS || defaultUrl)
        .split(',')
        .map(normalize)
        .filter(Boolean),
    );
    allowed.add(defaultUrl);
    const requested = normalize(candidates.find((url) => url && url.trim()) || defaultUrl);
    if (!allowed.has(requested)) {
      throw new BadRequestException(
        `Argos base URL ${requested} is not allowed. Ask an administrator to add it to ARGOS_ALLOWED_BASE_URLS.`,
      );
    }
    return requested;
  }

  private decryptToken(stored: string | undefined): string | undefined {
    if (!stored) return undefined;
    return this.encryptionService.isEncrypted(stored) ? this.encryptionService.decrypt(stored) : stored;
  }

  private clientFor(project: ProjectDoc): ArgosApiClient {
    if (!project.argosToken) throw new BadRequestException('Argos token not configured for this project');
    const token = this.decryptToken(project.argosToken);
    if (!token) throw new BadRequestException('Failed to decrypt Argos token');
    return new ArgosApiClient(this.resolveArgosBaseUrl(project.argosBaseUrl), token);
  }

  /**
   * Checks the token can read the Argos project before anything is saved: a
   * refused token or unknown project is the caller's mistake (400), Argos
   * being down or failing is not (502).
   */
  private async assertArgosAccess(client: ArgosApiClient, argosProjectId: string): Promise<void> {
    const result = await client.verify(argosProjectId);
    if (result.ok) return;
    const { reason, message } = result as ArgosVerificationFailed;
    if (reason === 'unreachable' || reason === 'error') throw new BadGatewayException(message);
    throw new BadRequestException(message);
  }

  /** For GET /integrations/status: projects with an Argos token, and with `check`, which can't reach Argos */
  async integrationSummary(check: boolean): Promise<ProjectIntegrationSummary> {
    const projects = await this.projects.list();
    const withToken = projects.filter((p) => p.argosToken);
    const summary: ProjectIntegrationSummary = { projects: projects.length, withCredentials: withToken.length };
    if (check) {
      const failures = await checkEach(withToken, async (project) => {
        if (!(await this.clientFor(project).verifyConnection(project.argosProjectId))) throw new Error('Argos did not answer');
      });
      summary.unreachable = failures.map(({ item, error }) => ({ projectId: item.id, name: item.name, error }));
    }
    return summary;
  }

  /** Projects that accept build notifications (have a webhook secret) */
  async webhookReadyCount(): Promise<number> {
    return (await this.projects.list()).filter((p) => p.webhookSecret).length;
  }

  async createProject(teamId: string, dto: CreateProjectDto, options: CreateProjectOptions): Promise<Project> {
    if (options.id && (await this.projects.get(options.id))) throw new ProjectExistsError(options.id);

    const argosBaseUrl = this.resolveArgosBaseUrl(dto.argosBaseUrl);
    await this.assertArgosAccess(new ArgosApiClient(argosBaseUrl, dto.argosToken), dto.argosProjectId);

    const now = new Date().toISOString();
    const doc: ProjectDoc = {
      id: options.id ?? newProjectId(),
      teamId,
      workspaceId: options.workspaceId ?? null,
      ...(options.applicationId ? { applicationId: options.applicationId } : {}),
      createdBy: options.createdBy,
      name: dto.name,
      description: dto.description,
      argosProjectId: dto.argosProjectId,
      argosBaseUrl,
      argosBranch: dto.argosBranch || 'develop',
      argosToken: dto.argosToken ? this.encryptionService.encrypt(dto.argosToken) : undefined,
      config: (dto as { config?: ProjectDoc['config'] }).config || {},
      baselines: [],
      notifications: [],
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.projects.create(stripUndefined(doc));
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ProjectExistsError(doc.id);
      throw error;
    }
    return toProject(doc);
  }

  /** The projects the principal can read, optionally filtered */
  async listProjects(principal: AuthPrincipal, filters: { teamId?: string; workspaceId?: string } = {}): Promise<Project[]> {
    const clause: Record<string, string> = {};
    if (filters.teamId) clause.teamId = filters.teamId;
    if (filters.workspaceId) clause.workspaceId = filters.workspaceId;
    const docs = Object.keys(clause).length ? await this.projects.findAny([clause]) : await this.projects.list();
    return (await this.access.readable(principal, docs)).map(toProject);
  }

  /** The project without secrets. No access check: for other modules (applications). */
  async getProject(id: string): Promise<Project> {
    return toProject(await this.requireProject(id));
  }

  async projectExists(id: string): Promise<boolean> {
    return !!(await this.findProject(id));
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const current = await this.requireProject(id);

    // New Argos connection details are checked before they are saved
    if (dto.argosProjectId || dto.argosToken || dto.argosBaseUrl) {
      const argosBaseUrl = this.resolveArgosBaseUrl(dto.argosBaseUrl, current.argosBaseUrl);
      const argosToken = dto.argosToken || this.decryptToken(current.argosToken);
      if (argosToken) {
        await this.assertArgosAccess(new ArgosApiClient(argosBaseUrl, argosToken), dto.argosProjectId || current.argosProjectId);
      }
    }

    const updated = await this.mutateProject(id, (doc) => {
      if (dto.name !== undefined) doc.name = dto.name;
      if (dto.description !== undefined) doc.description = dto.description;
      if (dto.argosProjectId) doc.argosProjectId = dto.argosProjectId;
      if (dto.argosBaseUrl) doc.argosBaseUrl = this.resolveArgosBaseUrl(dto.argosBaseUrl);
      if (dto.argosBranch) doc.argosBranch = dto.argosBranch;
      if (dto.config !== undefined) doc.config = dto.config;
      if (dto.argosToken) doc.argosToken = this.encryptionService.encrypt(dto.argosToken);
    });
    return toProject(updated);
  }

  /** Moves the project to another workspace (when its application moves) */
  async setProjectWorkspace(id: string, workspaceId: string | null): Promise<void> {
    await this.mutateProject(id, (doc) => {
      doc.workspaceId = workspaceId;
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!isSafeId(id) || !(await this.projects.delete(id))) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    this.lastSync.delete(id);
    for (const run of await this.runs.findAny([{ projectId: id }])) {
      await this.runs.delete(run.id);
    }
  }

  /**
   * The commands the project's CI runs to create Argos builds, from its
   * settings and current baseline. `publicBaseUrl` is this API's origin, for
   * the build notification command.
   */
  async getCiSetup(projectId: string, publicBaseUrl: string): Promise<CiSetup> {
    const project = await this.requireProject(projectId);
    const baseline = project.currentBaselineId ? project.baselines?.find((b) => b.id === project.currentBaselineId) : undefined;
    return buildCiSetup({
      argosProjectId: project.argosProjectId,
      argosBranch: project.argosBranch,
      config: project.config ?? {},
      baseline: baseline ? { name: baseline.name, commitSha: baseline.commitSha } : undefined,
      notifyUrl: project.webhookSecret ? `${publicBaseUrl}/api/v1/visual-regression/webhooks/argos` : undefined,
    });
  }

  // ---------- Runs (Argos builds) ----------

  private mapArgosStatusToRunStatus(argosStatus: string): RunStatus {
    if (argosStatus === 'pending') return 'pending';
    if (argosStatus === 'progress') return 'running';
    if (argosStatus === 'error' || argosStatus === 'aborted' || argosStatus === 'expired') return 'failed';
    return FINISHED_STATUSES.has(argosStatus) ? 'completed' : 'pending';
  }

  private mapArgosDiffStatus(status: ArgosSnapshotDiff['status']): TestResult['status'] {
    if (status === 'unchanged' || status === 'ignored') return 'passed';
    if (status === 'added') return 'new';
    if (status === 'removed') return 'removed';
    // changed, failure (a failing test's screenshot), retryFailure, pending
    return 'failed';
  }

  /**
   * Reads the project's latest builds from Argos into runs. Throttled per
   * project unless `force` (a build notification from CI).
   */
  private async syncRunsFromArgos(project: ProjectDoc, force = false): Promise<void> {
    const last = this.lastSync.get(project.id) ?? 0;
    if (!force && Date.now() - last < SYNC_INTERVAL_MS) return;
    this.lastSync.set(project.id, Date.now());
    const argosClient = this.clientFor(project);
    const { results: builds } = await argosClient.listBuilds(project.argosProjectId, { perPage: 30 });
    for (const build of builds) {
      await this.upsertBuild(project, argosClient, build);
    }
  }

  /** Creates or updates the run for an Argos build; fetches its diffs once it has finished or changed status */
  private async upsertBuild(project: ProjectDoc, argosClient: ArgosApiClient, build: ArgosBuild): Promise<TestRunDoc | null> {
    const [existing] = await this.runs.findAny([{ projectId: project.id, argosBuildId: build.id }]);
    let runId = existing?.id;
    if (!existing) {
      // Several projects can follow one Argos project, so the id names both
      runId = runIdFor(project.id, build.id);
      const startTime = build.metadata?.testReport?.stats?.startTime;
      const now = new Date().toISOString();
      const run: TestRunDoc = {
        id: runId,
        projectId: project.id,
        argosBuildId: build.id,
        argosBuildNumber: build.number,
        argosStatus: build.status,
        argosUrl: build.url,
        status: this.mapArgosStatusToRunStatus(build.status),
        branch: build.head?.branch,
        commitSha: build.head?.sha,
        triggeredBy: 'argos',
        startedAt: startTime && !Number.isNaN(Date.parse(startTime)) ? new Date(startTime).toISOString() : now,
        durationMs: build.metadata?.testReport?.stats?.duration,
        results: [],
        resultIds: [],
        createdAt: now,
      };
      try {
        await this.runs.create(stripUndefined(run));
      } catch (error) {
        if (!(error instanceof DuplicateDocumentError)) throw error;
      }
    }
    const unchanged = existing && existing.argosStatus === build.status && existing.results.length > 0;
    if (FINISHED_STATUSES.has(build.status) && !unchanged) {
      return this.applyBuild(runId!, project, argosClient, build);
    }
    if (existing && existing.argosStatus !== build.status) {
      return this.mutateRun(existing.id, (doc) => {
        doc.argosStatus = build.status;
        doc.status = this.mapArgosStatusToRunStatus(build.status);
      });
    }
    return existing ?? null;
  }

  /** Saves a finished build's status and screenshot diffs as the run's results */
  private async applyBuild(runId: string, project: ProjectDoc, argosClient: ArgosApiClient, build: ArgosBuild): Promise<TestRunDoc | null> {
    let results: TestResult[] | null = null;
    try {
      const diffs = await argosClient.listBuildDiffs(project.argosProjectId, build.number);
      results = diffs.map((diff) => ({
        id: `result-${diff.id}-${runId}`,
        runId,
        argosScreenshotId: diff.id,
        testName: diff.name,
        status: this.mapArgosDiffStatus(diff.status),
        baselineImageUrl: diff.base?.url ? argosClient.getImageUrl(diff.base.url) : undefined,
        currentImageUrl: diff.head?.url ? argosClient.getImageUrl(diff.head.url) : undefined,
        diffImageUrl: diff.url ? argosClient.getImageUrl(diff.url) : undefined,
        approved: diff.status === 'unchanged' || diff.status === 'ignored' || build.status === 'accepted',
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch build results for run ${runId}: ${(error as Error).message}`);
    }
    try {
      return await this.mutateRun(runId, (doc) => {
        const wasFinished = doc.argosStatus !== undefined && FINISHED_STATUSES.has(doc.argosStatus);
        doc.argosStatus = build.status;
        doc.argosBuildNumber = build.number;
        doc.argosUrl = build.url;
        doc.status = this.mapArgosStatusToRunStatus(build.status);
        if (!wasFinished || !doc.completedAt) doc.completedAt = new Date().toISOString();
        if (build.metadata?.testReport?.stats?.duration !== undefined) doc.durationMs = build.metadata.testReport.stats.duration;
        if (results) {
          // Keep reviews recorded here for results Argos still reports
          const previous = new Map(doc.results.map((r) => [r.id, r]));
          doc.results = results.map((r) => {
            const old = previous.get(r.id);
            return stripUndefined(old?.approvedBy ? { ...r, approved: old.approved, approvedBy: old.approvedBy, approvedAt: old.approvedAt } : r);
          });
          doc.resultIds = doc.results.map((r) => r.id);
          doc.resultsSummary = {
            total: results.length,
            passed: results.filter((r) => r.status === 'passed').length,
            failed: results.filter((r) => r.status === 'failed').length,
            new: results.filter((r) => r.status === 'new').length,
            removed: results.filter((r) => r.status === 'removed').length,
          };
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }

  async getTestRun(runId: string): Promise<TestRun> {
    return toRun(await this.requireRun(runId));
  }

  /** The project's runs, newest first, optionally started within [from, to] (ISO dates; `to` includes that whole day) */
  async getTestRuns(
    projectId: string,
    pagination?: PaginationParams,
    range: { from?: string; to?: string } = {},
  ): Promise<PaginatedResponse<TestRun>> {
    const project = await this.requireProject(projectId);

    if (project.argosToken) {
      try {
        await this.syncRunsFromArgos(project);
      } catch (error) {
        // Continue with stored runs if Argos can't be reached
        this.logger.warn(`Failed to sync runs from Argos for project ${projectId}: ${(error as Error).message}`);
      }
    }

    const inRange = dateRangeFilter(range);
    const allRuns = (await this.runs.findAny([{ projectId }]))
      .filter((r) => inRange(r.startedAt))
      .map(toRun)
      .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
    const page = pagination ?? { page: 1, limit: 20, offset: 0 };
    return createPaginatedResponse(allRuns.slice(page.offset, page.offset + page.limit), allRuns.length, page);
  }

  // ---------- Results ----------

  async getTestResults(runId: string, pagination?: PaginationParams): Promise<PaginatedResponse<TestResult>> {
    let run = await this.requireRun(runId);
    const project = await this.requireProject(run.projectId);

    // Pick up a review or status change in Argos; fall back to stored results if that fails
    if (project.argosToken && run.argosBuildNumber !== undefined) {
      try {
        const argosClient = this.clientFor(project);
        const build = await argosClient.getBuild(project.argosProjectId, run.argosBuildNumber);
        run = (await this.upsertBuild(project, argosClient, build)) ?? run;
      } catch (error) {
        this.logger.warn(`Failed to refresh results from Argos: ${(error as Error).message}`);
      }
    }

    const allResults = [...run.results].sort((a, b) => a.testName.localeCompare(b.testName));
    const page = pagination ?? { page: 1, limit: 50, offset: 0 };
    return createPaginatedResponse(allResults.slice(page.offset, page.offset + page.limit), allResults.length, page);
  }

  async approveDiff(resultId: string, userId: string): Promise<void> {
    await this.reviewDiff(resultId, userId, true);
  }

  async rejectDiff(resultId: string, userId: string): Promise<void> {
    await this.reviewDiff(resultId, userId, false);
  }

  /** Records the review in Argos (per screenshot, on the build), then here */
  private async reviewDiff(resultId: string, userId: string, approve: boolean): Promise<void> {
    const run = await this.findRunByResult(resultId);
    const result = run?.results.find((r) => r.id === resultId);
    if (!run || !result) throw new NotFoundException(`Test result with ID ${resultId} not found`);
    const project = await this.findProject(run.projectId);
    if (!project || !project.argosToken) throw new BadRequestException('Project or Argos token not found');
    if (run.argosBuildNumber === undefined || !result.argosScreenshotId) {
      throw new BadRequestException('This result has no Argos build to review. Refresh the run from Argos and try again.');
    }

    const argosClient = this.clientFor(project);
    try {
      await argosClient.reviewSnapshots(
        project.argosProjectId,
        run.argosBuildNumber,
        [{ id: result.argosScreenshotId, conclusion: approve ? 'APPROVE' : 'REQUEST_CHANGES' }],
        `${approve ? 'Approved' : 'Changes requested on'} ${result.testName} from the design system workbench.`,
      );
    } catch (error) {
      const status = error instanceof ArgosApiError ? error.status : undefined;
      if (status === 401 || status === 403) {
        throw new BadRequestException(
          'Argos refused the review. Reviews need a personal access token with review access to the project; a project token can only read builds.',
        );
      }
      if (status === 404) throw new BadRequestException('Argos no longer has this build or screenshot.');
      throw new BadGatewayException(`Argos did not record the review: ${(error as Error).message}`);
    }

    await this.mutateRun(run.id, (doc) => {
      const stored = doc.results.find((r) => r.id === resultId);
      if (!stored) return;
      stored.approved = approve;
      stored.approvedBy = userId;
      stored.approvedAt = new Date().toISOString();
    });
  }

  // ---------- Build notifications ----------

  /**
   * Argos has no outgoing webhooks, so builds are read from its API. CI can
   * post here after `argos upload` (body `{ projectId: "owner/project",
   * buildNumber? }`, signed with the project's secret) to have the build read
   * at once instead of on the next listing.
   */
  async handleWebhook(payload: WebhookPayload, signature?: string, rawBody?: Buffer): Promise<{ message: string; processed: boolean }> {
    const argosProjectId = payload?.projectId;
    if (!argosProjectId || typeof argosProjectId !== 'string') {
      this.logger.warn('Build notification received without an Argos project');
      return { message: 'Notification received but project not identified', processed: false };
    }

    // Every project linked to that Argos project whose secret matches the signature
    const linked = await this.projects.findAny([{ argosProjectId }]);
    const candidates = linked.filter((p) => p.webhookSecret);
    if (candidates.length === 0) {
      if (linked.length === 0) {
        this.logger.warn(`Build notification for unknown Argos project: ${argosProjectId}`);
        return { message: 'Project not found', processed: false };
      }
      // Without a secret anyone could make us call Argos on the project's behalf
      throw new UnauthorizedException('Build notifications are not configured for this project');
    }
    const projects = signature
      ? candidates.filter((p) => this.verifyWebhookSignature(rawBody ?? payload, signature, this.decryptToken(p.webhookSecret)!))
      : [];
    if (projects.length === 0) {
      this.logger.warn(`Invalid or missing signature on a build notification for ${argosProjectId}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const buildNumber = Number(payload.buildNumber);
    let processed = true;
    for (const project of projects) {
      this.webhookEvents.push({ projectId: project.id, event: 'build', payload, timestamp: new Date() });
      if (this.webhookEvents.length > 500) this.webhookEvents.splice(0, this.webhookEvents.length - 500);
      try {
        if (!project.argosToken) continue;
        if (Number.isInteger(buildNumber) && buildNumber > 0) {
          const argosClient = this.clientFor(project);
          await this.upsertBuild(project, argosClient, await argosClient.getBuild(project.argosProjectId, buildNumber));
        } else {
          await this.syncRunsFromArgos(project, true);
        }
      } catch (error) {
        processed = false;
        this.logger.error(`Failed to read Argos builds for project ${project.id}: ${(error as Error).message}`);
      }
    }
    return processed
      ? { message: 'Builds read from Argos', processed: true }
      : { message: 'Notification accepted but Argos could not be read', processed: false };
  }

  private verifyWebhookSignature(payload: Buffer | WebhookPayload, signature: string, secret: string): boolean {
    // HMAC SHA256 over the exact bytes sent; re-serialized JSON can differ
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload));
    const expected = Buffer.from(`sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`);
    const actual = Buffer.from(signature);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }

  /**
   * Sets the secret CI signs build notifications with (stored encrypted).
   * Without `secret` a random one is generated. The secret is returned only
   * here, so it can be put in the CI's secrets.
   */
  async setWebhookSecret(projectId: string, secret?: string): Promise<{ secret: string }> {
    if (secret !== undefined && (typeof secret !== 'string' || !WEBHOOK_SECRET_PATTERN.test(secret))) {
      throw new BadRequestException('secret must be 16 to 256 printable characters without spaces');
    }
    const value = secret ?? `whsec_${crypto.randomBytes(32).toString('hex')}`;
    const encrypted = this.encryptionService.encrypt(value);
    await this.mutateProject(projectId, (doc) => {
      doc.webhookSecret = encrypted;
    });
    return { secret: value };
  }

  /** Removes the webhook secret; build notifications for the project are refused again */
  async clearWebhookSecret(projectId: string): Promise<void> {
    await this.mutateProject(projectId, (doc) => {
      delete doc.webhookSecret;
    });
  }

  async getWebhookEvents(projectId: string, limit = 50): Promise<Array<{ event: string; payload: WebhookPayload; timestamp: Date }>> {
    return this.webhookEvents
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(({ event, payload, timestamp }) => ({ event, payload, timestamp }));
  }

  // ---------- Analytics ----------

  /**
   * Runs started within [startDate, endDate]: passed (no changes, or changes
   * accepted), with changes awaiting review, and failed (rejected, or the
   * build errored). The average duration is the test suite's, when Argos has it.
   */
  async getProjectAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<{
    totalRuns: number;
    passedRuns: number;
    changedRuns: number;
    failedRuns: number;
    averageDuration: number;
    trends: Array<{ date: string; passed: number; changed: number; failed: number }>;
  }> {
    await this.requireProject(projectId);
    const inRange = dateRangeFilter({ from: startDate, to: endDate });
    const runs = (await this.runs.findAny([{ projectId }])).filter((r) => inRange(r.startedAt));

    const outcome = (run: TestRunDoc): 'passed' | 'changed' | 'failed' | null => {
      if (run.status === 'failed' || run.argosStatus === 'rejected') return 'failed';
      if (run.argosStatus === 'changes-detected') return 'changed';
      if (run.argosStatus === 'no-changes' || run.argosStatus === 'accepted') return 'passed';
      return null;
    };

    const trendsMap: Record<string, { date: string; passed: number; changed: number; failed: number }> = {};
    for (const run of runs) {
      if (!run.startedAt) continue;
      const date = run.startedAt.split('T')[0];
      trendsMap[date] ??= { date, passed: 0, changed: 0, failed: 0 };
      const result = outcome(run);
      if (result) trendsMap[date][result]++;
    }

    const durations = runs.map((r) => r.durationMs).filter((d): d is number => typeof d === 'number' && d >= 0);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    return {
      totalRuns: runs.length,
      passedRuns: runs.filter((r) => outcome(r) === 'passed').length,
      changedRuns: runs.filter((r) => outcome(r) === 'changed').length,
      failedRuns: runs.filter((r) => outcome(r) === 'failed').length,
      averageDuration: Math.round(avgDuration),
      trends: Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  // ---------- Sharing ----------

  /** Who the project belongs to: its workspace, application and creator */
  async getProjectTeams(projectId: string): Promise<{ workspaceId: string | null; applicationId?: string; createdBy: ProjectCreator }> {
    const { workspaceId, applicationId, createdBy } = await this.requireProject(projectId);
    return { workspaceId, ...(applicationId ? { applicationId } : {}), createdBy };
  }

  /** People given access to this project alone */
  async getShares(projectId: string): Promise<ProjectShare[]> {
    return (await this.requireProject(projectId)).sharedWith ?? [];
  }

  /** Gives a person the viewer or editor role on the project (replacing an earlier share) */
  async shareProject(
    projectId: string,
    user: { userId: string; email: string; name: string },
    role: ProjectShare['role'],
    grantedBy: { id: string; name: string },
  ): Promise<ProjectShare> {
    const share: ProjectShare = { ...user, role, grantedBy, grantedAt: new Date().toISOString() };
    await this.mutateProject(projectId, (doc) => {
      doc.sharedWith = [...(doc.sharedWith ?? []).filter((s) => s.userId !== user.userId), share];
    });
    return share;
  }

  async unshareProject(projectId: string, userId: string): Promise<void> {
    await this.mutateProject(projectId, (doc) => {
      const before = doc.sharedWith ?? [];
      if (!before.some((s) => s.userId === userId)) throw new NotFoundException('This project is not shared with that person');
      doc.sharedWith = before.filter((s) => s.userId !== userId);
    });
  }

  // ---------- Baselines ----------

  /** Records a run as a new baseline version and makes it current */
  async createBaseline(projectId: string, dto: { name: string; description?: string; runId: string }, createdBy: string): Promise<Baseline & { current: boolean }> {
    if (!dto?.name || typeof dto.name !== 'string') throw new BadRequestException('name is required');
    const run = isSafeId(dto.runId) ? (await this.runs.get(dto.runId))?.doc : undefined;
    if (!run || run.projectId !== projectId) throw new NotFoundException(`Test run with ID ${dto.runId} not found`);
    if (!run.commitSha) throw new BadRequestException('That run has no commit, so builds could not be compared against it');

    const now = new Date().toISOString();
    const baseline: Baseline = stripUndefined({
      id: `baseline-${crypto.randomBytes(9).toString('hex')}`,
      projectId,
      name: dto.name,
      description: dto.description,
      runId: dto.runId,
      argosBuildNumber: run.argosBuildNumber,
      commitSha: run.commitSha,
      branch: run.branch,
      createdAt: now,
      createdBy,
    });
    await this.mutateProject(projectId, (doc) => {
      doc.baselines = [...(doc.baselines ?? []), baseline];
      doc.baselineHistory = [
        ...(doc.baselineHistory ?? []),
        stripUndefined({ baselineId: baseline.id, action: 'created' as const, previousBaselineId: doc.currentBaselineId, at: now, by: createdBy }),
      ];
      doc.currentBaselineId = baseline.id;
    });
    return { ...baseline, current: true };
  }

  /** Every baseline version, newest first, marking the current one */
  async getBaselines(projectId: string): Promise<Array<Baseline & { current: boolean }>> {
    const project = await this.requireProject(projectId);
    return [...(project.baselines ?? [])]
      .reverse()
      .map((b) => ({ ...b, current: b.id === project.currentBaselineId }));
  }

  /** How the current baseline changed, newest first */
  async getBaselineHistory(projectId: string): Promise<BaselineEvent[]> {
    return [...((await this.requireProject(projectId)).baselineHistory ?? [])].reverse();
  }

  /**
   * Makes an earlier baseline current again. Later versions are kept, so a
   * rollback can itself be undone. From then on the CI upload compares against
   * that baseline's commit (see getCiSetup).
   */
  async rollbackBaseline(projectId: string, baselineId: string, by: string): Promise<Baseline & { current: boolean }> {
    let restored: Baseline | undefined;
    await this.mutateProject(projectId, (doc) => {
      restored = (doc.baselines ?? []).find((b) => b.id === baselineId);
      if (!restored) throw new NotFoundException(`Baseline with ID ${baselineId} not found`);
      if (doc.currentBaselineId === baselineId) throw new ConflictException('That baseline is already the current one');
      doc.baselineHistory = [
        ...(doc.baselineHistory ?? []),
        stripUndefined({ baselineId, action: 'rolled-back' as const, previousBaselineId: doc.currentBaselineId, at: new Date().toISOString(), by }),
      ];
      doc.currentBaselineId = baselineId;
    });
    return { ...restored!, current: true };
  }

  // ---------- Notifications ----------

  async configureNotifications(
    projectId: string,
    dto: { type: NotificationType; config: NotificationConfig },
  ): Promise<{ type: string; enabled: boolean; config: NotificationConfig }> {
    if (!dto || !['email', 'slack', 'teams', 'webhook'].includes(dto.type)) {
      throw new BadRequestException('type must be one of email, slack, teams, webhook');
    }
    const entry: NotificationEntry = { type: dto.type, config: dto.config ?? {}, enabled: true };
    await this.mutateProject(projectId, (doc) => {
      doc.notifications = [...(doc.notifications ?? []).filter((n) => n.type !== dto.type), entry];
    });
    return entry;
  }

  async getNotificationConfig(projectId: string): Promise<NotificationEntry[]> {
    return (await this.requireProject(projectId)).notifications ?? [];
  }

  // ---------- Storage ----------

  private async findProject(id: string): Promise<ProjectDoc | null> {
    if (!isSafeId(id)) return null;
    return (await this.projects.get(id))?.doc ?? null;
  }

  private async requireProject(id: string): Promise<ProjectDoc> {
    const project = await this.findProject(id);
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  private async requireRun(id: string): Promise<TestRunDoc> {
    const run = isSafeId(id) ? (await this.runs.get(id))?.doc : null;
    if (!run) throw new NotFoundException(`Test run with ID ${id} not found`);
    return run;
  }

  private async findRunByResult(resultId: string): Promise<TestRunDoc | null> {
    if (typeof resultId !== 'string' || !resultId || resultId.length > 300) return null;
    const [run] = await this.runs.findAny([{ resultIds: resultId }]);
    return run ?? null;
  }

  private async mutateProject(id: string, fn: (doc: ProjectDoc) => void): Promise<ProjectDoc> {
    if (!isSafeId(id)) throw new NotFoundException(`Project with ID ${id} not found`);
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.projects.get(id);
      if (!stored) throw new NotFoundException(`Project with ID ${id} not found`);
      const doc = stored.doc;
      fn(doc);
      doc.updatedAt = new Date().toISOString();
      try {
        const clean = stripUndefined(doc);
        await this.projects.replace(clean, stored.version);
        return clean;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The project was changed by someone else at the same time, please try again');
  }

  private async mutateRun(id: string, fn: (doc: TestRunDoc) => void): Promise<TestRunDoc> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.runs.get(id);
      if (!stored) throw new NotFoundException(`Test run with ID ${id} not found`);
      const doc = stored.doc;
      fn(doc);
      try {
        const clean = stripUndefined(doc);
        await this.runs.replace(clean, stored.version);
        return clean;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The test run was changed at the same time, please try again');
  }
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/** Whether an ISO timestamp falls within [from, to]; `to` as a bare date includes that whole day */
function dateRangeFilter(range: { from?: string; to?: string }): (iso?: string) => boolean {
  const from = range.from ? Date.parse(range.from) : NaN;
  const toDay = range.to && /^\d{4}-\d{2}-\d{2}$/.test(range.to);
  const to = range.to ? Date.parse(toDay ? `${range.to}T23:59:59.999Z` : range.to) : NaN;
  if (Number.isNaN(from) && Number.isNaN(to)) return () => true;
  return (iso) => {
    if (!iso) return false;
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return false;
    return (Number.isNaN(from) || t >= from) && (Number.isNaN(to) || t <= to);
  };
}
