import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { ProjectIntegrationSummary, checkEach } from '../integrations/integration.types';
import { DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { ProjectAccessService, ProjectAction, ProjectCreator, ProjectOwnership } from '../visual-regression/project-access';
import { QueryableStore } from '../workspaces/queryable-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import {
  CaptureConfig,
  PrivacySettings,
  assertValidSelectors,
  normalizeCaptureConfig,
  normalizePrivacySettings,
  translateLegacyPrivacy,
} from './capture-settings';
import { PROJECT_KEY_LOOKS_NUMERIC, PROJECT_KEY_MAX_LENGTH, PROJECT_KEY_MESSAGE, PROJECT_KEY_PATTERN } from './dto/project-keys';
import { OpenReplayApiClient, OpenReplayError, OpenReplayWindow } from './openreplay-api.client';
import { IntegrationSnippets, integrationSnippets } from './openreplay-snippet';
import { DEFAULT_OPENREPLAY_BASE_URL, openReplayHeatmapsUrl, openReplaySessionUrl, resolveOpenReplayBaseUrl } from './openreplay-url';

export const SR_PROJECTS_INDEX = 'design-system-session-replay-projects';
export const SR_PROJECT_STORE = Symbol('SR_PROJECT_STORE');

const keyword = { type: 'keyword' };
export const SR_PROJECT_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  teamId: keyword,
  workspaceId: keyword,
  applicationId: keyword,
  openreplayProjectKey: keyword,
  openreplayProjectId: { type: 'long' },
  createdBy: { properties: { type: keyword, id: keyword } },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const MAX_WRITE_ATTEMPTS = 5;

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

/**
 * As stored in design-system-session-replay-projects; `openreplayApiKey` is
 * encrypted and never returned. OpenReplay names a project two ways: the
 * project key (the tracker and the public API use it) and the numeric project
 * id (its dashboard links use it), so both are kept.
 */
export interface Project extends ProjectOwnership {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  applicationUrl?: string;
  /** Missing only on projects saved before the two were kept apart, whose key was the numeric id */
  openreplayProjectKey?: string;
  openreplayProjectId?: number;
  openreplayBaseUrl?: string;
  openreplayApiKey?: string; // Encrypted API key (not returned in responses)
  privacySettings: PrivacySettings;
  config: CaptureConfig;
  createdAt: string;
  updatedAt: string;
}

/** A session as OpenReplay's public API lists it */
export interface Session {
  sessionId: string;
  projectId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  /** Seconds, when OpenReplay gave an end time */
  duration: number | null;
  eventsCount: number | null;
  /** OpenReplay's player; null until the project has its numeric id */
  replayUrl: string | null;
}

export interface SessionEvent {
  id: string;
  name: string;
  time: string;
  autoCaptured: boolean;
  properties: Record<string, unknown>;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
}

export interface SessionSearch {
  userId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface EventSearch {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SESSION_WINDOW_MS = 7 * DAY_MS;
const DEFAULT_EVENT_WINDOW_MS = 30 * DAY_MS;
const DEFAULT_PAGE_SIZE = 20;
/** The public API's limits */
const MAX_PAGE_SIZE = 200;
const EARLIEST_TIMESTAMP = 946684800000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

const UPDATABLE_PROJECT_FIELDS = [
  'name',
  'description',
  'applicationUrl',
  'openreplayProjectKey',
  'openreplayProjectId',
  'openreplayBaseUrl',
] as const;

/** The project without its API key; `hasApiKey` says whether one is set */
function redact(project: Project): Project & { hasApiKey: boolean } {
  const { openreplayApiKey, ...rest } = project;
  return { ...(rest as Project), hasApiKey: !!openreplayApiKey };
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/**
 * A stored project in the current shape. Before the project key and id were
 * kept apart, `openreplayProjectKey` had to hold the numeric id: such a value
 * moves to `openreplayProjectId`, and the project needs its key entered again
 * (the integration code says so). Privacy settings in the older shape are
 * translated. Written back on the next change.
 */
export function migrateProject(stored: Project): Project {
  const project = { ...stored };
  const legacyKey = project.openreplayProjectKey?.trim();
  if (legacyKey && /^\d+$/.test(legacyKey)) {
    const id = Number(legacyKey);
    if (project.openreplayProjectId === undefined && Number.isSafeInteger(id) && id > 0) project.openreplayProjectId = id;
    delete project.openreplayProjectKey;
  }
  project.privacySettings = normalizePrivacySettings(project.privacySettings);
  project.config = normalizeCaptureConfig(project.config);
  return project;
}

/** Throws 400 unless `key` is an OpenReplay project key (not the numeric id) */
export function assertProjectKey(key: unknown): asserts key is string {
  if (typeof key !== 'string' || !key.trim() || key.length > PROJECT_KEY_MAX_LENGTH || !PROJECT_KEY_PATTERN.test(key)) {
    throw new BadRequestException(PROJECT_KEY_MESSAGE);
  }
  if (/^\d+$/.test(key)) throw new BadRequestException(PROJECT_KEY_LOOKS_NUMERIC);
}

/** Throws 400 unless `id` is a positive whole number */
export function assertProjectId(id: unknown): asserts id is number {
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new BadRequestException('openreplayProjectId must be the numeric project id from OpenReplay');
  }
}

/** An ISO date or date-time as epoch ms; a bare date as the end of that day when `endOfDay` */
function parseDate(value: string | undefined, field: string, endOfDay = false): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) throw new BadRequestException(`${field} must be an ISO date`);
  return endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value) ? ms + DAY_MS - 1 : ms;
}

/** The time window and page for a public-API list, checked against its limits */
function listWindow(params: { startDate?: string; endDate?: string; page?: number; limit?: number }, defaultSpan: number) {
  const end = parseDate(params.endDate, 'endDate', true) ?? Date.now();
  const start = parseDate(params.startDate, 'startDate') ?? end - defaultSpan;
  if (start >= end) throw new BadRequestException('startDate must be before endDate');
  if (start < EARLIEST_TIMESTAMP) throw new BadRequestException('startDate must be in 2000 or later');
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;
  if (!Number.isInteger(page) || page < 1) throw new BadRequestException('page must be 1 or more');
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new BadRequestException(`limit must be between 1 and ${MAX_PAGE_SIZE}`);
  }
  return { startTimestamp: start, endTimestamp: end, page, limit };
}

/** An OpenReplay failure as our answer: 502, with OpenReplay's reason */
function upstream(error: unknown): Error {
  if (error instanceof OpenReplayError) {
    return new BadGatewayException({ statusCode: 502, code: 'OPENREPLAY_ERROR', message: error.message });
  }
  return error as Error;
}

/**
 * Session-replay projects (backed by OpenReplay), stored in Elasticsearch.
 * Access is per project (ProjectAccessService); the controller calls
 * `authorizeProject` before anything else.
 */
@Injectable()
export class SessionReplayService {
  constructor(
    @Inject(SR_PROJECT_STORE) private readonly projects: QueryableStore<Project>,
    private readonly access: ProjectAccessService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private decryptToken(stored: string | undefined): string | undefined {
    if (!stored) return undefined;
    return this.encryptionService.isEncrypted(stored) ? this.encryptionService.decrypt(stored) : stored;
  }

  // ---------- Access ----------

  /** The project without its API key, if the principal may do `action` with it (404/403 otherwise) */
  async authorizeProject(principal: AuthPrincipal, projectId: string, action: ProjectAction): Promise<Project> {
    const project = await this.requireProject(projectId);
    await this.access.assert(principal, project, action);
    return redact(project);
  }

  assertCanCreate(principal: AuthPrincipal, workspaceId: string | null | undefined): Promise<void> {
    return this.access.assertCanCreate(principal, workspaceId);
  }

  // ---------- Projects ----------

  async createProject(teamId: string, dto: any, options: CreateProjectOptions): Promise<Project> {
    if (options.id && (await this.projects.get(options.id))) throw new ProjectExistsError(options.id);
    assertProjectKey(dto.openreplayProjectKey);
    if (dto.openreplayProjectId !== undefined && dto.openreplayProjectId !== null) assertProjectId(dto.openreplayProjectId);
    const privacySettings = normalizePrivacySettings(dto.privacySettings);
    assertValidSelectors(privacySettings);
    // SSRF guard: the base URL is fetched later, so it is checked before it is stored
    const openreplayBaseUrl = await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl);
    // With an API key, OpenReplay confirms the key and project, and supplies the numeric id
    const openreplayProjectId = dto.openreplayApiKey
      ? await this.confirmOpenReplayProject(openreplayBaseUrl, dto.openreplayApiKey, dto.openreplayProjectKey, dto.openreplayProjectId ?? undefined)
      : (dto.openreplayProjectId ?? undefined);

    const now = new Date().toISOString();
    const project: Project = stripUndefined({
      id: options.id ?? `sr-project-${crypto.randomBytes(9).toString('hex')}`,
      teamId,
      workspaceId: options.workspaceId ?? null,
      applicationId: options.applicationId,
      createdBy: options.createdBy,
      name: dto.name,
      description: dto.description,
      applicationUrl: dto.applicationUrl,
      openreplayProjectKey: dto.openreplayProjectKey,
      openreplayProjectId,
      openreplayBaseUrl,
      // Encrypted at rest
      openreplayApiKey: dto.openreplayApiKey ? this.encryptionService.encrypt(dto.openreplayApiKey) : undefined,
      privacySettings,
      config: normalizeCaptureConfig(dto.config),
      createdAt: now,
      updatedAt: now,
    });
    try {
      await this.projects.create(project);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ProjectExistsError(project.id);
      throw error;
    }
    return redact(project);
  }

  /** The projects the principal can read, optionally filtered */
  async listProjects(principal: AuthPrincipal, filters: { teamId?: string; workspaceId?: string } = {}): Promise<Project[]> {
    const clause: Record<string, string> = {};
    if (filters.teamId) clause.teamId = filters.teamId;
    if (filters.workspaceId) clause.workspaceId = filters.workspaceId;
    const all = Object.keys(clause).length ? await this.projects.findAny([clause]) : await this.projects.list();
    return (await this.access.readable(principal, all)).map((p) => redact(migrateProject(p)));
  }

  /** The project without its API key. No access check: for other modules (applications). */
  async getProject(id: string): Promise<Project> {
    return redact(await this.requireProject(id));
  }

  async projectExists(id: string): Promise<boolean> {
    return !!(await this.findProject(id));
  }

  async updateProject(id: string, dto: any): Promise<Project> {
    const project = await this.requireProject(id);

    if (dto.openreplayProjectKey !== undefined) assertProjectKey(dto.openreplayProjectKey);
    if (dto.openreplayProjectId !== undefined && dto.openreplayProjectId !== null) assertProjectId(dto.openreplayProjectId);
    // Partial settings are merged into the current ones
    const privacySettings =
      dto.privacySettings !== undefined
        ? normalizePrivacySettings({ ...project.privacySettings, ...translateLegacyPrivacy(dto.privacySettings) })
        : undefined;
    if (privacySettings) assertValidSelectors(privacySettings);
    const config = dto.config !== undefined ? normalizeCaptureConfig({ ...project.config, ...dto.config }) : undefined;

    // SSRF guard: check a new base URL before it is stored
    if (dto.openreplayBaseUrl !== undefined) {
      dto = { ...dto, openreplayBaseUrl: await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl) };
    }

    // Changed connection details are confirmed with OpenReplay when there is an API key to ask with
    let confirmedProjectId: number | undefined;
    const connectionChanged = ['openreplayProjectKey', 'openreplayProjectId', 'openreplayApiKey', 'openreplayBaseUrl'].some(
      (key) => dto[key] !== undefined,
    );
    const projectKey = dto.openreplayProjectKey ?? project.openreplayProjectKey;
    const apiKey = dto.openreplayApiKey || this.decryptToken(project.openreplayApiKey);
    if (connectionChanged && apiKey && projectKey) {
      const baseUrl = await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl || project.openreplayBaseUrl);
      const expectedId = dto.openreplayProjectId === undefined ? project.openreplayProjectId : (dto.openreplayProjectId ?? undefined);
      // A new key belongs to whichever project OpenReplay says, unless an id was given with it
      const checkId = dto.openreplayProjectKey !== undefined && dto.openreplayProjectId === undefined ? undefined : expectedId;
      confirmedProjectId = await this.confirmOpenReplayProject(baseUrl, apiKey, projectKey, checkId);
    }

    // Only fields a client may change; id, ownership, timestamps and the like can't be overwritten
    const changes: Partial<Project> = {};
    for (const key of UPDATABLE_PROJECT_FIELDS) {
      if (dto[key] !== undefined) (changes as Record<string, unknown>)[key] = dto[key];
    }
    if (confirmedProjectId !== undefined) changes.openreplayProjectId = confirmedProjectId;
    if (privacySettings) changes.privacySettings = privacySettings;
    if (config) changes.config = config;
    const updated = await this.mutate(id, (doc) => {
      Object.assign(doc, changes);
      if (doc.openreplayProjectId === null) delete doc.openreplayProjectId;
      if (dto.openreplayApiKey) doc.openreplayApiKey = this.encryptionService.encrypt(dto.openreplayApiKey);
    });
    return redact(updated);
  }

  /**
   * Asks OpenReplay for the project with this key: throws 400 when the API key
   * is refused, OpenReplay can't be reached, it has no such project, or the
   * project's numeric id isn't `expectedId`. Returns the numeric id.
   */
  private async confirmOpenReplayProject(baseUrl: string, apiKey: string, projectKey: string, expectedId?: number): Promise<number | undefined> {
    const client = new OpenReplayApiClient(baseUrl, apiKey);
    let remote;
    try {
      await client.checkConnection();
      remote = await client.getProject(projectKey);
    } catch (error: any) {
      throw new BadRequestException(`Could not check the OpenReplay connection: ${error.message}`);
    }
    if (!remote) throw new BadRequestException(`OpenReplay has no project with the key "${projectKey}"`);
    const remoteId = Number(remote.projectId);
    if (!Number.isSafeInteger(remoteId) || remoteId <= 0) return expectedId;
    if (expectedId !== undefined && remoteId !== expectedId) {
      throw new BadRequestException(
        `In OpenReplay, the project key "${projectKey}" belongs to project ${remoteId}, not ${expectedId}`,
      );
    }
    return remoteId;
  }

  /** Moves the project to another workspace (when its application moves) */
  async setProjectWorkspace(id: string, workspaceId: string | null): Promise<void> {
    await this.mutate(id, (doc) => {
      doc.workspaceId = workspaceId;
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!isSafeId(id) || !(await this.projects.delete(id))) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  private async findProject(id: string): Promise<Project | null> {
    if (!isSafeId(id)) return null;
    const stored = (await this.projects.get(id))?.doc;
    return stored ? migrateProject(stored) : null;
  }

  private async requireProject(id: string): Promise<Project> {
    const project = await this.findProject(id);
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  private async mutate(id: string, fn: (doc: Project) => void): Promise<Project> {
    if (!isSafeId(id)) throw new NotFoundException(`Project with ID ${id} not found`);
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.projects.get(id);
      if (!stored) throw new NotFoundException(`Project with ID ${id} not found`);
      // Older documents are written back in the current shape
      const doc = migrateProject(stored.doc);
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

  // ---------- Integration code and links ----------

  /** The tracker setup for the script tag and the npm package, with the project's privacy and capture settings */
  async getIntegrationCode(projectId: string): Promise<IntegrationSnippets> {
    const project = await this.requireProject(projectId);
    const projectKey = this.requireProjectKey(project);
    return integrationSnippets({
      projectKey,
      // Only builds code (no request); the base URL was checked when it was saved
      baseUrl: project.openreplayBaseUrl || DEFAULT_OPENREPLAY_BASE_URL,
      privacy: project.privacySettings,
      capture: project.config,
    });
  }

  /** OpenReplay's player for one session (needs the numeric project id, not the API key) */
  async getReplayUrl(projectId: string, sessionId: string): Promise<string> {
    if (!SESSION_ID_PATTERN.test(sessionId)) throw new BadRequestException('sessionId is not an OpenReplay session id');
    const project = await this.requireProject(projectId);
    return openReplaySessionUrl(project.openreplayBaseUrl || DEFAULT_OPENREPLAY_BASE_URL, this.requireNumericId(project), sessionId);
  }

  /** OpenReplay's heatmap cards for the project, or one card */
  async getHeatmapsUrl(projectId: string, heatmapId?: string): Promise<string> {
    if (heatmapId !== undefined && !SESSION_ID_PATTERN.test(heatmapId)) throw new BadRequestException('heatmapId is not an OpenReplay card id');
    const project = await this.requireProject(projectId);
    return openReplayHeatmapsUrl(project.openreplayBaseUrl || DEFAULT_OPENREPLAY_BASE_URL, this.requireNumericId(project), heatmapId);
  }

  private requireProjectKey(project: Project): string {
    if (!project.openreplayProjectKey) {
      throw new ConflictException({
        statusCode: 409,
        code: 'OPENREPLAY_PROJECT_KEY_MISSING',
        message: "This project has no OpenReplay project key. Add it in the project's settings (OpenReplay shows it under Project settings).",
      });
    }
    return project.openreplayProjectKey;
  }

  private requireNumericId(project: Project): number {
    if (!project.openreplayProjectId) {
      throw new ConflictException({
        statusCode: 409,
        code: 'OPENREPLAY_PROJECT_ID_MISSING',
        message: "This project has no OpenReplay project id, so there is no link into OpenReplay. Add it in the project's settings.",
      });
    }
    return project.openreplayProjectId;
  }

  // ---------- Sessions (OpenReplay's public API) ----------

  /**
   * The OpenReplay client for a project's API calls. Without an API key there
   * is nothing to show: a 503 with code OPENREPLAY_NOT_CONFIGURED, which the
   * UI explains, rather than made-up sessions.
   */
  private async clientFor(project: Project): Promise<OpenReplayApiClient> {
    const apiKey = this.decryptToken(project.openreplayApiKey)?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        code: 'OPENREPLAY_NOT_CONFIGURED',
        message: "This project has no OpenReplay API key, so there are no sessions to show. Add the key in the project's settings.",
      });
    }
    // SSRF guard: re-checked before every request, since DNS can change after the URL was saved
    const baseUrl = await resolveOpenReplayBaseUrl(project.openreplayBaseUrl);
    return new OpenReplayApiClient(baseUrl, apiKey);
  }

  /** For GET /integrations/status: projects with an OpenReplay API key, and with `check`, which can't reach OpenReplay */
  async integrationSummary(check: boolean): Promise<ProjectIntegrationSummary> {
    const projects = await this.projects.list();
    const withKey = projects.filter((p) => p.openreplayApiKey);
    const summary: ProjectIntegrationSummary = { projects: projects.length, withCredentials: withKey.length };
    if (check) {
      const failures = await checkEach(withKey, async (project) => {
        await (await this.clientFor(migrateProject(project))).checkConnection();
      });
      summary.unreachable = failures.map(({ item, error }) => ({ projectId: item.id, name: item.name, error }));
    }
    return summary;
  }

  /** One user's sessions, a page at a time: the public API lists sessions per user in a time window */
  async searchSessions(projectId: string, params: SessionSearch): Promise<Page<Session>> {
    const project = await this.requireProject(projectId);
    const userId = params.userId?.trim();
    if (!userId) throw new BadRequestException('userId is required: OpenReplay lists sessions per user');
    const window: OpenReplayWindow = { ...listWindow(params, DEFAULT_SESSION_WINDOW_MS), sortOrder: params.sortOrder ?? 'desc' };
    const projectKey = this.requireProjectKey(project);
    const client = await this.clientFor(project);
    const baseUrl = project.openreplayBaseUrl || DEFAULT_OPENREPLAY_BASE_URL;

    let result;
    try {
      result = await client.listUserSessions(projectKey, userId, window);
    } catch (error) {
      throw upstream(error);
    }
    const items = result.items.map((s): Session => {
      const endTs = typeof s.endTs === 'number' ? s.endTs : null;
      return {
        sessionId: String(s.sessionId),
        projectId,
        userId,
        startTime: new Date(s.startTs).toISOString(),
        endTime: endTs !== null ? new Date(endTs).toISOString() : null,
        duration: endTs !== null ? Math.max(0, Math.round((endTs - s.startTs) / 1000)) : null,
        eventsCount: typeof s.eventsCount === 'number' ? s.eventsCount : null,
        replayUrl: project.openreplayProjectId ? openReplaySessionUrl(baseUrl, project.openreplayProjectId, String(s.sessionId)) : null,
      };
    });
    return {
      items,
      total: result.total,
      page: window.page,
      limit: window.limit,
      startDate: new Date(window.startTimestamp).toISOString(),
      endDate: new Date(window.endTimestamp).toISOString(),
    };
  }

  /** The events OpenReplay recorded in one session, in a time window (the public API has no single-session lookup) */
  async listSessionEvents(projectId: string, sessionId: string, params: EventSearch): Promise<Page<SessionEvent>> {
    if (!SESSION_ID_PATTERN.test(sessionId)) throw new BadRequestException('sessionId is not an OpenReplay session id');
    const project = await this.requireProject(projectId);
    const window: OpenReplayWindow = { ...listWindow(params, DEFAULT_EVENT_WINDOW_MS), sortOrder: 'asc' };
    const projectKey = this.requireProjectKey(project);
    const client = await this.clientFor(project);

    let result;
    try {
      result = await client.listSessionEvents(projectKey, sessionId, window);
    } catch (error) {
      throw upstream(error);
    }
    return {
      items: result.items.map((e) => ({
        id: String(e.event_id),
        name: e.$event_name ?? 'event',
        time: new Date(e.created_at).toISOString(),
        autoCaptured: e.$auto_captured === true,
        properties: e.$properties ?? e.properties ?? {},
      })),
      total: result.total,
      page: window.page,
      limit: window.limit,
      startDate: new Date(window.startTimestamp).toISOString(),
      endDate: new Date(window.endTimestamp).toISOString(),
    };
  }
}
