import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { ErrorHandler } from '../common/errors/error-handler';
import { ProjectIntegrationSummary, checkEach } from '../integrations/integration.types';
import { PaginatedResponse, PaginationParams, createPaginatedResponse } from '../common/pagination/pagination.types';
import { EncryptionService } from '../common/security/encryption.service';
import { BuildPayload, CreateProjectDto, NotificationConfig, ScreenshotPayload, WebhookPayload } from '../common/types/common.types';
import { DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from '../workspaces/queryable-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import { ArgosApiClient } from './argos-api.client';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectAccessService, ProjectAction, ProjectCreator } from './project-access';
import type { VisualRegressionGateway } from './visual-regression.gateway';
import {
  Baseline,
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

interface ArgosBuild {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  branch?: string;
  commit?: string;
}

interface ArgosScreenshot {
  id: string;
  name: string;
  status: string;
  baselineUrl?: string;
  compareUrl?: string;
  diffUrl?: string;
  diffPercentage?: number;
}

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

function newRunId(): string {
  return `vr-run-${crypto.randomBytes(9).toString('hex')}`;
}

/** The project without its Argos token, webhook secret, baselines and notification settings */
function toProject(doc: ProjectDoc): Project {
  const { argosToken, webhookSecret, baselines, notifications, ...project } = doc;
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
 * Access is per project (see ProjectAccessService): controllers and the
 * gateway call `authorize*` before anything else.
 */
@Injectable()
export class VisualRegressionService {
  private readonly logger = new Logger(VisualRegressionService.name);
  /** Recent webhook deliveries, for diagnostics only (not persisted) */
  private webhookEvents: Array<{ projectId: string; event: string; payload: WebhookPayload; timestamp: Date }> = [];
  private gateway?: VisualRegressionGateway; // Injected via setter to avoid circular dependency

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
   * The Argos URL to call. Projects store the client's token, so the server only
   * calls Argos hosts it is configured for (ARGOS_ALLOWED_BASE_URLS, comma-separated).
   */
  private resolveArgosBaseUrl(...candidates: Array<string | undefined>): string {
    const normalize = (url: string) => url.trim().replace(/\/+$/, '');
    const defaultUrl = normalize(process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com');
    const allowed = new Set(
      (process.env.ARGOS_ALLOWED_BASE_URLS || `${defaultUrl},https://api.argos-ci.com`)
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

  /** For GET /integrations/status: projects with an Argos token, and with `check`, which can't reach Argos */
  async integrationSummary(check: boolean): Promise<ProjectIntegrationSummary> {
    const projects = await this.projects.list();
    const withToken = projects.filter((p) => p.argosToken);
    const summary: ProjectIntegrationSummary = { projects: projects.length, withCredentials: withToken.length };
    if (check) {
      const failures = await checkEach(withToken, async (project) => {
        if (!(await this.clientFor(project).verifyConnection())) throw new Error('Argos did not answer');
      });
      summary.unreachable = failures.map(({ item, error }) => ({ projectId: item.id, name: item.name, error }));
    }
    return summary;
  }

  /** Projects that accept Argos webhooks (have a webhook secret) */
  async webhookReadyCount(): Promise<number> {
    return (await this.projects.list()).filter((p) => p.webhookSecret).length;
  }

  async createProject(teamId: string, dto: CreateProjectDto, options: CreateProjectOptions): Promise<Project> {
    if (options.id && (await this.projects.get(options.id))) throw new ProjectExistsError(options.id);

    // Verify the Argos connection and project before saving anything
    const argosBaseUrl = this.resolveArgosBaseUrl(dto.argosBaseUrl);
    const argosClient = new ArgosApiClient(argosBaseUrl, dto.argosToken);
    try {
      const isValid = await argosClient.verifyConnection();
      if (!isValid) {
        throw new BadRequestException('Unable to connect to Argos instance. Please check your base URL and token.');
      }
      await argosClient.getProject(dto.argosProjectId);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw ErrorHandler.handleError(error, 'VisualRegressionService.createProject');
    }

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

    // If updating Argos connection details, verify them
    if (dto.argosProjectId || dto.argosToken || dto.argosBaseUrl) {
      const argosBaseUrl = this.resolveArgosBaseUrl(dto.argosBaseUrl, current.argosBaseUrl);
      const argosToken = dto.argosToken || this.decryptToken(current.argosToken);
      if (argosToken) {
        const argosClient = new ArgosApiClient(argosBaseUrl, argosToken);
        try {
          await argosClient.verifyConnection();
          await argosClient.getProject(dto.argosProjectId || current.argosProjectId);
        } catch (error) {
          throw ErrorHandler.handleError(error, 'VisualRegressionService.updateProject');
        }
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
    for (const run of await this.runs.findAny([{ projectId: id }])) {
      await this.runs.delete(run.id);
    }
  }

  // ---------- Runs ----------

  async triggerTest(projectId: string, userId: string, dto: { branch?: string; commitSha?: string }): Promise<TestRun> {
    const project = await this.requireProject(projectId);
    const argosClient = this.clientFor(project);
    const branch = dto.branch || project.argosBranch;
    const commitSha = dto.commitSha || `commit-${Date.now()}`;

    let run: TestRunDoc;
    try {
      const argosBuild = await argosClient.createBuild(project.argosProjectId, {
        branch,
        commit: commitSha,
        name: `Test run triggered by ${userId}`,
      });
      const now = new Date().toISOString();
      run = {
        id: newRunId(),
        projectId,
        argosBuildId: argosBuild.id,
        status: this.mapArgosStatusToRunStatus(argosBuild.status),
        branch,
        commitSha,
        triggeredBy: userId,
        startedAt: new Date(argosBuild.createdAt).toISOString(),
        results: [],
        resultIds: [],
        createdAt: now,
      };
      await this.runs.create(stripUndefined(run));
    } catch (error) {
      throw ErrorHandler.handleError(error, 'VisualRegressionService.triggerTest');
    }

    this.gateway?.emitRunStatusUpdate(run.id, run.status, toRun(run) as unknown as Record<string, unknown>);
    this.pollBuildStatus(run.id, project, argosClient);
    return toRun(run);
  }

  private mapArgosStatusToRunStatus(argosStatus: string): RunStatus {
    const statusMap: Record<string, RunStatus> = {
      pending: 'pending',
      progress: 'running',
      stable: 'completed',
      error: 'failed',
    };
    return statusMap[argosStatus] || 'pending';
  }

  private pollBuildStatus(runId: string, project: ProjectDoc, argosClient: ArgosApiClient): void {
    const pollInterval = 5000;
    const maxAttempts = 120; // 10 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        const run = (await this.runs.get(runId))?.doc;
        if (!run?.argosBuildId) return;
        if (attempts >= maxAttempts) {
          await this.mutateRun(runId, (doc) => {
            doc.status = 'failed';
            doc.completedAt = new Date().toISOString();
          });
          return;
        }
        const build = await argosClient.getBuild(project.argosProjectId, run.argosBuildId);
        if (build.status === 'stable' || build.status === 'error') {
          const updated = await this.applyBuild(runId, project, argosClient, build, new Date().toISOString());
          this.gateway?.emitRunCompleted(runId, updated?.results ?? []);
        } else {
          attempts++;
          const updated = await this.mutateRun(runId, (doc) => {
            doc.status = this.mapArgosStatusToRunStatus(build.status);
          });
          this.gateway?.emitRunStatusUpdate(runId, updated.status, toRun(updated) as unknown as Record<string, unknown>);
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        this.logger.error(`Failed to poll build status for run ${runId}: ${(error as Error).message}`);
        attempts++;
        if (attempts < maxAttempts) setTimeout(poll, pollInterval);
      }
    };
    setTimeout(poll, pollInterval);
  }

  /** Fetches a finished build's screenshots and saves them as the run's results */
  private async applyBuild(
    runId: string,
    project: ProjectDoc,
    argosClient: ArgosApiClient,
    build: ArgosBuild,
    completedAt: string,
  ): Promise<TestRunDoc | null> {
    let results: TestResult[] | null = null;
    try {
      const screenshots = (await argosClient.getBuildScreenshots(project.argosProjectId, build.id)) as unknown as ArgosScreenshot[];
      results = screenshots.map((screenshot) => ({
        id: `result-${screenshot.id}-${runId}`,
        runId,
        argosScreenshotId: screenshot.id,
        testName: screenshot.name,
        status: this.mapArgosScreenshotStatus(screenshot.status),
        baselineImageUrl: screenshot.baselineUrl ? argosClient.getImageUrl(screenshot.baselineUrl) : undefined,
        currentImageUrl: screenshot.compareUrl ? argosClient.getImageUrl(screenshot.compareUrl) : undefined,
        diffImageUrl: screenshot.diffUrl ? argosClient.getImageUrl(screenshot.diffUrl) : undefined,
        diffPercentage: screenshot.diffPercentage,
        approved: screenshot.status === 'stable',
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch build results for run ${runId}: ${(error as Error).message}`);
    }
    try {
      return await this.mutateRun(runId, (doc) => {
        doc.status = this.mapArgosStatusToRunStatus(build.status);
        doc.completedAt = completedAt;
        if (results) {
          // Keep approvals recorded here for results Argos still reports
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

  private mapArgosScreenshotStatus(argosStatus: string): TestResult['status'] {
    const statusMap: Record<string, TestResult['status']> = {
      stable: 'passed',
      failure: 'failed',
      new: 'new',
      removed: 'removed',
    };
    return statusMap[argosStatus] || 'failed';
  }

  async getTestRun(runId: string): Promise<TestRun> {
    return toRun(await this.requireRun(runId));
  }

  async getTestRuns(projectId: string, pagination?: PaginationParams): Promise<PaginatedResponse<TestRun>> {
    const project = await this.requireProject(projectId);

    if (project.argosToken) {
      try {
        await this.syncRunsFromArgos(project);
      } catch (error) {
        // Continue with stored runs if Argos can't be reached
        this.logger.warn(`Failed to sync runs from Argos for project ${projectId}: ${(error as Error).message}`);
      }
    }

    const allRuns = (await this.runs.findAny([{ projectId }]))
      .map(toRun)
      .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
    const page = pagination ?? { page: 1, limit: 20, offset: 0 };
    return createPaginatedResponse(allRuns.slice(page.offset, page.offset + page.limit), allRuns.length, page);
  }

  private async syncRunsFromArgos(project: ProjectDoc): Promise<void> {
    const argosClient = this.clientFor(project);
    const argosBuilds = (await argosClient.getBuilds(project.argosProjectId, {
      branch: project.argosBranch,
      limit: 50,
    })) as ArgosBuild[];

    for (const build of argosBuilds) {
      const done = build.status === 'stable' || build.status === 'error';
      const [existing] = await this.runs.findAny([{ projectId: project.id, argosBuildId: build.id }]);
      let runId = existing?.id;
      if (!existing) {
        runId = `vr-run-${build.id}`;
        const run: TestRunDoc = {
          id: runId,
          projectId: project.id,
          argosBuildId: build.id,
          status: this.mapArgosStatusToRunStatus(build.status),
          branch: build.branch,
          commitSha: build.commit,
          triggeredBy: 'argos-sync',
          startedAt: new Date(build.createdAt).toISOString(),
          results: [],
          resultIds: [],
          createdAt: new Date().toISOString(),
        };
        try {
          await this.runs.create(stripUndefined(run));
        } catch (error) {
          if (!(error instanceof DuplicateDocumentError)) throw error;
        }
      }
      if (done) {
        const completedAt = new Date(build.updatedAt ?? build.createdAt).toISOString();
        await this.applyBuild(runId!, project, argosClient, build, completedAt);
      } else if (existing) {
        await this.mutateRun(existing.id, (doc) => {
          doc.status = this.mapArgosStatusToRunStatus(build.status);
        });
      }
    }
  }

  // ---------- Results ----------

  async getTestResults(runId: string, pagination?: PaginationParams): Promise<PaginatedResponse<TestResult>> {
    let run = await this.requireRun(runId);
    const project = await this.requireProject(run.projectId);

    // Refresh completed runs from Argos; fall back to stored results if that fails
    if (project.argosToken && run.argosBuildId && run.status === 'completed') {
      try {
        const argosClient = this.clientFor(project);
        const build = await argosClient.getBuild(project.argosProjectId, run.argosBuildId);
        run = (await this.applyBuild(runId, project, argosClient, build, run.completedAt ?? new Date().toISOString())) ?? run;
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

  private async reviewDiff(resultId: string, userId: string, approve: boolean): Promise<void> {
    const run = await this.findRunByResult(resultId);
    const result = run?.results.find((r) => r.id === resultId);
    if (!run || !result) throw new NotFoundException(`Test result with ID ${resultId} not found`);
    const project = await this.findProject(run.projectId);
    if (!project || !project.argosToken) throw new BadRequestException('Project or Argos token not found');
    if (!run.argosBuildId) throw new BadRequestException('This run has no Argos build');

    // Results made before argosScreenshotId was stored: result-{screenshotId}-{runId}
    const screenshotId = result.argosScreenshotId ?? result.id.slice('result-'.length, result.id.length - run.id.length - 1);
    if (!screenshotId) throw new BadRequestException('Invalid result ID format');

    const argosClient = this.clientFor(project);
    try {
      if (approve) await argosClient.approveScreenshot(project.argosProjectId, run.argosBuildId, screenshotId);
      else await argosClient.rejectScreenshot(project.argosProjectId, run.argosBuildId, screenshotId);
    } catch (error) {
      if (approve) throw new BadRequestException(`Failed to approve in Argos: ${(error as Error).message}`);
      throw ErrorHandler.handleError(error, 'VisualRegressionService.rejectDiff');
    }

    await this.mutateRun(run.id, (doc) => {
      const stored = doc.results.find((r) => r.id === resultId);
      if (!stored) return;
      stored.approved = approve;
      stored.approvedBy = userId;
      stored.approvedAt = new Date().toISOString();
    });
    this.gateway?.emitResultUpdate(run.id, resultId, { approved: approve, approvedBy: userId });
  }

  // ---------- Webhooks ----------

  async handleWebhook(
    payload: WebhookPayload,
    signature?: string,
    event?: string,
    rawBody?: Buffer,
  ): Promise<{ message: string; processed: boolean }> {
    const argosProjectId = payload.projectId || (payload.project as { id?: string } | undefined)?.id;
    if (!argosProjectId || typeof argosProjectId !== 'string') {
      this.logger.warn('Webhook received without project identifier');
      return { message: 'Webhook received but project not identified', processed: false };
    }

    // Every project linked to that Argos project whose secret matches the signature
    const candidates = (await this.projects.findAny([{ argosProjectId }])).filter((p) => p.webhookSecret);
    if (candidates.length === 0) {
      const any = await this.projects.findAny([{ argosProjectId }]);
      if (any.length === 0) {
        this.logger.warn(`Webhook received for unknown project: ${argosProjectId}`);
        return { message: 'Project not found', processed: false };
      }
      // Without a secret anyone could post fake build results
      throw new UnauthorizedException('Webhooks are not configured for this project');
    }
    const project = signature
      ? candidates.find((p) => this.verifyWebhookSignature(rawBody ?? payload, signature, this.decryptToken(p.webhookSecret)!))
      : undefined;
    if (!project) {
      this.logger.warn(`Invalid or missing webhook signature for Argos project ${argosProjectId}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.webhookEvents.push({ projectId: project.id, event: event || 'unknown', payload, timestamp: new Date() });
    if (this.webhookEvents.length > 500) this.webhookEvents.splice(0, this.webhookEvents.length - 500);

    try {
      await this.processWebhookEvent(project, event || 'build.updated', payload);
      return { message: 'Webhook processed successfully', processed: true };
    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      this.logger.error(`Failed to process webhook for project ${project.id}: ${(error as Error).message}`);
      return { message: `Webhook received but processing failed: ${handledError.message}`, processed: false };
    }
  }

  private verifyWebhookSignature(payload: Buffer | WebhookPayload, signature: string, secret: string): boolean {
    // HMAC SHA256 over the exact bytes Argos sent; re-serialized JSON can differ
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload));
    const expected = Buffer.from(`sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`);
    const actual = Buffer.from(signature);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }

  private async processWebhookEvent(project: ProjectDoc, event: string, payload: WebhookPayload): Promise<void> {
    switch (event) {
      case 'build.completed':
      case 'build.updated':
      case 'build.stable':
      case 'build.error':
        await this.handleBuildUpdate(project, payload);
        break;
      case 'screenshot.approved':
      case 'screenshot.rejected':
        await this.handleScreenshotUpdate(project, event, payload);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  private async handleBuildUpdate(project: ProjectDoc, payload: BuildPayload | WebhookPayload): Promise<void> {
    if (!project.argosToken) return;
    const buildId = payload.buildId || (payload.build as { id?: string } | undefined)?.id;
    if (!buildId || typeof buildId !== 'string') return;

    const [existing] = await this.runs.findAny([{ projectId: project.id, argosBuildId: buildId }]);
    if (!existing) return;
    const argosClient = this.clientFor(project);
    const build = await argosClient.getBuild(project.argosProjectId, buildId);
    if (build.status === 'stable' || build.status === 'error') {
      await this.applyBuild(existing.id, project, argosClient, build, new Date().toISOString());
    } else {
      await this.mutateRun(existing.id, (doc) => {
        doc.status = this.mapArgosStatusToRunStatus(build.status);
      });
    }
  }

  private async handleScreenshotUpdate(project: ProjectDoc, event: string, payload: ScreenshotPayload | WebhookPayload): Promise<void> {
    const screenshotId = payload.screenshotId || (payload.screenshot as { id?: string } | undefined)?.id;
    const buildId = payload.buildId || (payload.build as { id?: string } | undefined)?.id;
    if (!screenshotId || !buildId || typeof buildId !== 'string') return;

    const [run] = await this.runs.findAny([{ projectId: project.id, argosBuildId: buildId }]);
    if (!run) return;
    await this.mutateRun(run.id, (doc) => {
      const result = doc.results.find((r) => r.argosScreenshotId === screenshotId || r.id === `result-${screenshotId}-${doc.id}`);
      if (!result) return;
      result.approved = event === 'screenshot.approved';
      result.approvedAt = new Date().toISOString();
    });
  }

  /**
   * Sets the secret Argos signs this project's webhooks with (stored
   * encrypted). Without `secret` a random one is generated. The secret is
   * returned only here, so it can be pasted into Argos.
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

  /** Removes the webhook secret; webhooks for the project are refused again */
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

  // Set WebSocket gateway (called from module to avoid circular dependency)
  setGateway(gateway: VisualRegressionGateway) {
    this.gateway = gateway;
  }

  // ---------- Analytics & reporting ----------

  async getProjectAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<{
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    averageDuration: number;
    trends: Array<{ date: string; passed: number; failed: number }>;
  }> {
    await this.requireProject(projectId);
    const runs = (await this.runs.findAny([{ projectId }])).filter((r) => {
      if (!startDate && !endDate) return true;
      if (!r.startedAt) return false;
      const runDate = new Date(r.startedAt);
      if (startDate && runDate < new Date(startDate)) return false;
      if (endDate && runDate > new Date(endDate)) return false;
      return true;
    });

    const trendsMap: Record<string, { date: string; passed: number; failed: number }> = {};
    for (const run of runs) {
      if (!run.startedAt) continue;
      const date = run.startedAt.split('T')[0];
      trendsMap[date] ??= { date, passed: 0, failed: 0 };
      if (run.status === 'completed') trendsMap[date].passed++;
      else if (run.status === 'failed') trendsMap[date].failed++;
    }

    const durations = runs
      .filter((r) => r.startedAt && r.completedAt)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    return {
      totalRuns: runs.length,
      passedRuns: runs.filter((r) => r.status === 'completed').length,
      failedRuns: runs.filter((r) => r.status === 'failed').length,
      averageDuration: Math.round(avgDuration),
      trends: Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  /** Not implemented: there is no PDF renderer. Use the analytics endpoint for the data. */
  async generatePDFReport(projectId: string): Promise<never> {
    await this.requireProject(projectId);
    throw new NotImplementedException(
      'PDF reports are not implemented. GET /api/v1/visual-regression/projects/:id/analytics returns the same data as JSON.',
    );
  }

  // ---------- Sharing ----------

  /** Projects are shared through their workspace: who can see one follows workspace membership */
  async getProjectTeams(projectId: string): Promise<{ workspaceId: string | null; applicationId?: string; createdBy: ProjectCreator }> {
    const { workspaceId, applicationId, createdBy } = await this.requireProject(projectId);
    return { workspaceId, ...(applicationId ? { applicationId } : {}), createdBy };
  }

  // ---------- Baselines ----------

  async createBaseline(projectId: string, dto: { name: string; description?: string; runId: string }, createdBy: string): Promise<Baseline> {
    if (!dto?.name || typeof dto.name !== 'string') throw new BadRequestException('name is required');
    const run = isSafeId(dto.runId) ? (await this.runs.get(dto.runId))?.doc : undefined;
    if (!run || run.projectId !== projectId) throw new NotFoundException(`Test run with ID ${dto.runId} not found`);

    const baseline: Baseline = stripUndefined({
      id: `baseline-${crypto.randomBytes(9).toString('hex')}`,
      projectId,
      name: dto.name,
      description: dto.description,
      runId: dto.runId,
      createdAt: new Date().toISOString(),
      createdBy,
    });
    await this.mutateProject(projectId, (doc) => {
      doc.baselines = [...(doc.baselines ?? []), baseline];
    });
    return baseline;
  }

  async getBaselines(projectId: string): Promise<Baseline[]> {
    return (await this.requireProject(projectId)).baselines ?? [];
  }

  /**
   * Not implemented: restoring baseline images needs an Argos API this client
   * doesn't have. Baselines are records of which run was accepted, nothing more.
   */
  async rollbackBaseline(projectId: string, baselineId: string): Promise<never> {
    const project = await this.requireProject(projectId);
    if (!(project.baselines ?? []).some((b) => b.id === baselineId)) {
      throw new NotFoundException(`Baseline with ID ${baselineId} not found`);
    }
    throw new NotImplementedException(
      'Baseline rollback is not implemented: Argos baselines can only be changed by approving builds in Argos.',
    );
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
