import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { ProjectAccessService, ProjectAction, ProjectCreator, ProjectOwnership } from '../visual-regression/project-access';
import { QueryableStore } from '../workspaces/queryable-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import { OpenReplayApiClient } from './openreplay-api.client';
import { resolveOpenReplayBaseUrl } from './openreplay-url';

export const SR_PROJECTS_INDEX = 'design-system-session-replay-projects';
export const SR_PROJECT_STORE = Symbol('SR_PROJECT_STORE');

const keyword = { type: 'keyword' };
export const SR_PROJECT_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  teamId: keyword,
  workspaceId: keyword,
  applicationId: keyword,
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

/** As stored in design-system-session-replay-projects; `openreplayApiKey` is encrypted and never returned */
export interface Project extends ProjectOwnership {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  applicationUrl?: string;
  openreplayProjectKey: string;
  openreplayBaseUrl?: string;
  openreplayApiKey?: string; // Encrypted API key (not returned in responses)
  privacySettings?: {
    maskAllInputs?: boolean;
    maskAllText?: boolean;
    maskTextSelector?: string[];
    blockSelector?: string[];
    respectDoNotTrack?: boolean;
  };
  config?: {
    captureConsole?: boolean;
    captureNetwork?: boolean;
    captureIFrames?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  sessionId: string;
  projectId: string;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  startTime: Date;
  duration: number;
  pagesCount: number;
  eventsCount: number;
  errorsCount: number;
  issueScore: number;
  issueTypes: string[];
  favorite: boolean;
  viewed: boolean;
  live: boolean;
  replayUrl: string;
  metadata?: Record<string, any>;
}

const UPDATABLE_PROJECT_FIELDS = [
  'name',
  'description',
  'applicationUrl',
  'openreplayProjectKey',
  'openreplayBaseUrl',
  'privacySettings',
  'config',
] as const;

function redact(project: Project): Project {
  const { openreplayApiKey, ...rest } = project;
  return rest as Project;
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
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
    // SSRF guard: the base URL is fetched later, so it is checked before it is stored
    const openreplayBaseUrl = await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl);
    // Verify OpenReplay connection if API key provided
    if (dto.openreplayApiKey) {
      const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, dto.openreplayApiKey);
      try {
        const isValid = await openreplayClient.verifyConnection();
        if (!isValid) {
          throw new BadRequestException('Unable to connect to OpenReplay instance. Please check your base URL and API key.');
        }
      } catch (error: any) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(`Failed to verify OpenReplay connection: ${error.message}`);
      }
    }

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
      openreplayBaseUrl,
      // Encrypted at rest
      openreplayApiKey: dto.openreplayApiKey ? this.encryptionService.encrypt(dto.openreplayApiKey) : undefined,
      privacySettings: dto.privacySettings || {},
      config: dto.config || {},
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
    return (await this.access.readable(principal, all)).map(redact);
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

    // SSRF guard: check a new base URL before it is stored
    if (dto.openreplayBaseUrl !== undefined) {
      dto = { ...dto, openreplayBaseUrl: await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl) };
    }

    // If updating OpenReplay connection details, verify them
    if (dto.openreplayProjectKey || dto.openreplayApiKey || dto.openreplayBaseUrl) {
      const openreplayBaseUrl = await resolveOpenReplayBaseUrl(dto.openreplayBaseUrl || project.openreplayBaseUrl);
      const openreplayApiKey = dto.openreplayApiKey || this.decryptToken(project.openreplayApiKey);
      if (openreplayApiKey) {
        const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, openreplayApiKey);
        try {
          await openreplayClient.verifyConnection();
        } catch (error: any) {
          throw new BadRequestException(`Failed to verify OpenReplay connection: ${error.message}`);
        }
      }
    }

    // Only fields a client may change; id, ownership, timestamps and the like can't be overwritten
    const changes: Partial<Project> = {};
    for (const key of UPDATABLE_PROJECT_FIELDS) {
      if (dto[key] !== undefined) (changes as Record<string, unknown>)[key] = dto[key];
    }
    const updated = await this.mutate(id, (doc) => {
      Object.assign(doc, changes);
      if (dto.openreplayApiKey) doc.openreplayApiKey = this.encryptionService.encrypt(dto.openreplayApiKey);
    });
    return redact(updated);
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
    return (await this.projects.get(id))?.doc ?? null;
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

  // Integration Code Generation
  async getIntegrationCode(projectId: string): Promise<string> {
    const project = await this.requireProject(projectId);

    const decryptedApiKey = this.decryptToken(project.openreplayApiKey) || '';
    // Only builds a snippet (no request); the base URL was checked when it was saved
    const openreplayBaseUrl = project.openreplayBaseUrl || 'https://api.openreplay.com';
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, decryptedApiKey);

    return openreplayClient.getIntegrationCode(
      project.openreplayProjectKey,
      project.openreplayBaseUrl,
      {
        privacySettings: project.privacySettings,
        config: project.config,
      }
    );
  }

  // Session Management
  async searchSessions(
    projectId: string,
    params: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      userEmail?: string;
      issueType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ sessions: Session[]; total: number }> {
    const project = await this.requireProject(projectId);

    // If no API key is configured, return mock sessions for development/demo purposes
    const decryptedApiKey = this.decryptToken(project.openreplayApiKey);
    if (!decryptedApiKey || (typeof decryptedApiKey === 'string' && decryptedApiKey.trim() === '')) {
      const mockSessions: Session[] = [
        {
          sessionId: 'mock-session-001',
          projectId,
          userId: 'user-123',
          userEmail: 'user@example.com',
          userDisplayName: 'Demo User',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          duration: 1250,
          pagesCount: 5,
          eventsCount: 342,
          errorsCount: 0,
          issueScore: 0,
          issueTypes: [],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-001`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-002',
          projectId,
          userId: 'user-456',
          userEmail: 'another@example.com',
          userDisplayName: 'Another User',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          duration: 890,
          pagesCount: 3,
          eventsCount: 198,
          errorsCount: 2,
          issueScore: 45,
          issueTypes: ['js_error', 'network_error'],
          favorite: true,
          viewed: true,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-002`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-003',
          projectId,
          userId: 'user-789',
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          duration: 2100,
          pagesCount: 8,
          eventsCount: 567,
          errorsCount: 1,
          issueScore: 12,
          issueTypes: ['js_error'],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-003`,
          metadata: {},
        },
      ];

      // Apply filters if provided
      let filteredSessions = mockSessions;
      if (params.userEmail) {
        filteredSessions = filteredSessions.filter(s => 
          s.userEmail?.toLowerCase().includes(params.userEmail!.toLowerCase())
        );
      }
      if (params.userId) {
        filteredSessions = filteredSessions.filter(s => 
          s.userId?.toLowerCase().includes(params.userId!.toLowerCase())
        );
      }
      if (params.issueType) {
        filteredSessions = filteredSessions.filter(s => 
          s.issueTypes?.includes(params.issueType!)
        );
      }

      // Apply pagination
      const limit = params.limit || 50;
      const offset = params.offset || 0;
      const paginatedSessions = filteredSessions.slice(offset, offset + limit);

      return {
        sessions: paginatedSessions,
        total: filteredSessions.length,
      };
    }

    // SSRF guard: re-checked before every request, since DNS can change after the URL was saved
    const openreplayBaseUrl = await resolveOpenReplayBaseUrl(project.openreplayBaseUrl);
    const apiKey = this.decryptToken(project.openreplayApiKey);
    if (!apiKey) {
      throw new BadRequestException('OpenReplay API key not configured or failed to decrypt');
    }
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, apiKey);

    try {
      // Parse project key to get numeric project ID (OpenReplay uses numeric IDs)
      // In a real implementation, you'd need to map project keys to numeric IDs
      const numericProjectId = parseInt(project.openreplayProjectKey) || 1;

      const result = await openreplayClient.searchSessions({
        projectId: numericProjectId,
        ...params,
      });

      // Map OpenReplay sessions to our Session format
      const sessions: Session[] = result.sessions.map(s => ({
        sessionId: s.sessionId,
        projectId,
        userId: s.userId,
        userEmail: s.userEmail,
        userDisplayName: s.userDisplayName,
        startTime: new Date(s.startTs),
        duration: s.duration,
        pagesCount: s.pagesCount,
        eventsCount: s.eventsCount,
        errorsCount: s.errorsCount,
        issueScore: s.issueScore,
        issueTypes: s.issueTypes,
        favorite: s.favorite,
        viewed: s.viewed,
        live: s.live,
        replayUrl: openreplayClient.getSessionReplayUrl(numericProjectId, s.sessionId),
        metadata: s.metadata,
      }));

      return {
        sessions,
        total: result.total,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to search sessions: ${error.message}`);
    }
  }

  async getSession(projectId: string, sessionId: string): Promise<Session> {
    const project = await this.requireProject(projectId);

    // If no API key is configured, return mock session for development/demo purposes
    const decryptedApiKey = this.decryptToken(project.openreplayApiKey);
    if (!decryptedApiKey || (typeof decryptedApiKey === 'string' && decryptedApiKey.trim() === '')) {
      // Find the mock session by ID or return a default one
      const mockSessions = [
        {
          sessionId: 'mock-session-001',
          projectId,
          userId: 'user-123',
          userEmail: 'user@example.com',
          userDisplayName: 'Demo User',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 1250,
          pagesCount: 5,
          eventsCount: 342,
          errorsCount: 0,
          issueScore: 0,
          issueTypes: [],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-001`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-002',
          projectId,
          userId: 'user-456',
          userEmail: 'another@example.com',
          userDisplayName: 'Another User',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
          duration: 890,
          pagesCount: 3,
          eventsCount: 198,
          errorsCount: 2,
          issueScore: 45,
          issueTypes: ['js_error', 'network_error'],
          favorite: true,
          viewed: true,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-002`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-003',
          projectId,
          userId: 'user-789',
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 2100,
          pagesCount: 8,
          eventsCount: 567,
          errorsCount: 1,
          issueScore: 12,
          issueTypes: ['js_error'],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-003`,
          metadata: {},
        },
      ];

      const mockSession = mockSessions.find(s => s.sessionId === sessionId) || mockSessions[0];
      return mockSession;
    }

    // SSRF guard: re-checked before every request, since DNS can change after the URL was saved
    const openreplayBaseUrl = await resolveOpenReplayBaseUrl(project.openreplayBaseUrl);
    const apiKey = this.decryptToken(project.openreplayApiKey);
    if (!apiKey) {
      throw new BadRequestException('OpenReplay API key not configured or failed to decrypt');
    }
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, apiKey);

    try {
      const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
      const s = await openreplayClient.getSession(numericProjectId, sessionId);

      return {
        sessionId: s.sessionId,
        projectId,
        userId: s.userId,
        userEmail: s.userEmail,
        userDisplayName: s.userDisplayName,
        startTime: new Date(s.startTs),
        duration: s.duration,
        pagesCount: s.pagesCount,
        eventsCount: s.eventsCount,
        errorsCount: s.errorsCount,
        issueScore: s.issueScore,
        issueTypes: s.issueTypes,
        favorite: s.favorite,
        viewed: s.viewed,
        live: s.live,
        replayUrl: openreplayClient.getSessionReplayUrl(numericProjectId, s.sessionId),
        metadata: s.metadata,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to get session: ${error.message}`);
    }
  }

  /**
   * Get heatmaps URL for a project
   */
  async getHeatmapsUrl(projectId: string, heatmapId?: string): Promise<string> {
    const project = await this.requireProject(projectId);

    // For development/testing: Return mock URL if no OpenReplay base URL is configured
    // or if explicitly using mock data
    const useMockData = process.env.USE_MOCK_OPENREPLAY_DATA === 'true' || 
                       !project.openreplayBaseUrl || 
                       project.openreplayBaseUrl === 'https://api.openreplay.com';

    if (useMockData) {
      // Return a mock heatmap URL pointing to our local demo page
      // In production, this would be the actual OpenReplay URL
      const mockUrl = process.env.MOCK_HEATMAP_URL || 'http://localhost:5174/mock-heatmap.html';
      
      if (heatmapId) {
        return `${mockUrl}?heatmapId=${heatmapId}`;
      }
      return mockUrl;
    }

    // Only builds a URL for the browser (no request); the base URL was checked when it was saved
    const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, '');
    
    const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
    return openreplayClient.getHeatmapUrl(numericProjectId, heatmapId);
  }
}

