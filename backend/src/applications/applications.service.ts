import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { VersionConflictError } from '../reviews/document-store';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { QueryableStore } from '../workspaces/queryable-store';
import { WorkspaceAccessService, actorOf, isSafeId, newId } from '../workspaces/workspace-access.service';
import {
  CapabilitiesDto,
  MoveApplicationDto,
  RegisterApplicationDto,
  UpdateApplicationDto,
} from './application.dto';
import { APPLICATION_STORE, ApplicationCapabilities, ApplicationDoc, CapabilityName } from './application.types';
import { DesignSystemVersionInfo, compareVersions, currentDesignSystemVersion, parseVersion } from './design-system-version';

const MAX_WRITE_ATTEMPTS = 5;
const DEFAULT_TEAM = 'default-team';

export interface ApplicationFilters {
  teamId?: string;
  workspaceId?: string;
  capability?: CapabilityName;
}

/** Projects created while registering, so a later failure can undo them */
interface CreatedProjects {
  visualRegression?: string;
  sessionReplay?: string;
}

/**
 * Registered applications, stored in Elasticsearch (`design-system-applications`).
 *
 * Writes need `admin:governance` or the admin role in the application's
 * workspace (docs/WORKSPACES.md). Enabling visual regression or session
 * replay creates a project in that module; failures are returned to the
 * caller instead of being swallowed, and deleting an application deletes its projects.
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @Inject(APPLICATION_STORE) private readonly store: QueryableStore<ApplicationDoc>,
    private readonly workspaces: WorkspaceAccessService,
    private readonly visualRegression: VisualRegressionService,
    private readonly sessionReplay: SessionReplayService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  // ---------- Reads ----------

  async list(filters: ApplicationFilters = {}): Promise<ApplicationDoc[]> {
    const clause: Record<string, string> = {};
    if (filters.teamId) clause.teamId = filters.teamId;
    if (filters.workspaceId) clause.workspaceId = filters.workspaceId;
    let apps = Object.keys(clause).length ? await this.store.findAny([clause]) : await this.store.list();
    if (filters.capability) apps = apps.filter((app) => app.capabilities?.[filters.capability]?.enabled === true);
    return apps.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  async get(id: string): Promise<ApplicationDoc> {
    const stored = isSafeId(id) ? await this.store.get(id) : null;
    if (!stored) throw new NotFoundException('Application not found');
    return stored.doc;
  }

  /** The application, or null (for callers that treat a missing application as a normal case) */
  async find(id: string): Promise<ApplicationDoc | null> {
    return isSafeId(id) ? ((await this.store.get(id))?.doc ?? null) : null;
  }

  async listByWorkspace(workspaceId: string): Promise<ApplicationDoc[]> {
    return this.store.findAny([{ workspaceId }]);
  }

  // ---------- Writes ----------

  async register(principal: AuthPrincipal, dto: RegisterApplicationDto): Promise<ApplicationDoc> {
    const workspaceId = dto.workspaceId ?? null;
    await this.assertCanWrite(principal, workspaceId);
    if (workspaceId && !(await this.workspaces.find(workspaceId))) {
      throw new BadRequestException('Unknown workspace');
    }
    await this.assertNameFree(dto.name, workspaceId);

    const now = new Date().toISOString();
    const actor = actorOf(principal);
    const app: ApplicationDoc = {
      id: newId('app'),
      name: dto.name,
      description: dto.description ?? '',
      repository: dto.repository,
      version: dto.version,
      designSystemVersion: dto.designSystemVersion?.replace(/^v/, ''),
      applicationUrl: dto.applicationUrl,
      teamId: dto.teamId,
      workspaceId,
      registeredAt: now,
      updatedAt: now,
      registeredBy: actor,
      updatedBy: actor,
      capabilities: {
        governance: { enabled: false, rules: [], scanSchedule: 'manual' },
        visualRegression: { enabled: false },
        sessionReplay: { enabled: false },
      },
      metadata: { ...(dto.metadata ?? {}) },
    };

    const created: CreatedProjects = {};
    try {
      await this.applyCapabilities(app, dto.capabilities ?? {}, created);
      await this.store.create(app);
    } catch (error) {
      await this.undoProjects(created);
      throw error;
    }
    return app;
  }

  update(principal: AuthPrincipal, id: string, dto: UpdateApplicationDto): Promise<ApplicationDoc> {
    return this.mutate(principal, id, async (app) => {
      if (dto.name !== undefined && dto.name !== app.name) {
        await this.assertNameFree(dto.name, app.workspaceId, app.id);
        app.name = dto.name;
      }
      if (dto.description !== undefined) app.description = dto.description;
      if (dto.repository !== undefined) app.repository = dto.repository || undefined;
      if (dto.version !== undefined) app.version = dto.version || undefined;
      if (dto.applicationUrl !== undefined) app.applicationUrl = dto.applicationUrl || undefined;
      if (dto.teamId !== undefined) app.teamId = dto.teamId || undefined;
      if (dto.metadata !== undefined) app.metadata = { ...dto.metadata };
    });
  }

  async updateCapabilities(principal: AuthPrincipal, id: string, dto: CapabilitiesDto): Promise<ApplicationDoc> {
    const created: CreatedProjects = {};
    try {
      return await this.mutate(principal, id, (app) => this.applyCapabilities(app, dto, created));
    } catch (error) {
      await this.undoProjects(created);
      throw error;
    }
  }

  updateDesignSystemVersion(principal: AuthPrincipal, id: string, version: string): Promise<ApplicationDoc> {
    return this.mutate(principal, id, (app) => {
      app.designSystemVersion = version.replace(/^v/, '');
    });
  }

  /** Moves an application to another workspace: needs admin of both (or admin:governance) */
  async move(principal: AuthPrincipal, id: string, dto: MoveApplicationDto): Promise<ApplicationDoc> {
    if (dto.workspaceId === undefined) throw new BadRequestException('workspaceId is required (null to clear it)');
    const target = dto.workspaceId;
    await this.assertCanWrite(principal, target);
    if (target && !(await this.workspaces.find(target))) throw new BadRequestException('Unknown workspace');
    return this.mutate(principal, id, async (app) => {
      if (app.workspaceId === target) return;
      await this.assertNameFree(app.name, target, app.id);
      app.workspaceId = target;
    });
  }

  /** Records a governance scan (for the compliance scanner) */
  async markScanned(id: string, at = new Date()): Promise<ApplicationDoc> {
    return this.write(id, (app) => {
      app.lastScanned = at.toISOString();
      app.capabilities.governance.lastScan = app.lastScanned;
    });
  }

  /** Deletes the application and its visual-regression and session-replay projects */
  async delete(principal: AuthPrincipal, id: string): Promise<void> {
    const app = await this.get(id);
    await this.assertCanWrite(principal, app.workspaceId);
    await this.undoProjects({
      visualRegression: app.capabilities?.visualRegression?.projectId,
      sessionReplay: app.capabilities?.sessionReplay?.projectId,
    });
    if (!(await this.store.delete(id))) throw new NotFoundException('Application not found');
  }

  // ---------- Versions ----------

  currentVersion(): DesignSystemVersionInfo {
    return currentDesignSystemVersion();
  }

  async needingUpgrade(currentVersion?: string) {
    if (currentVersion !== undefined && !parseVersion(currentVersion)) {
      throw new BadRequestException('currentVersion must be a semantic version like 2.1.0');
    }
    const latest = currentVersion?.replace(/^v/, '') ?? this.currentVersion().version;
    const applications = (await this.list()).filter((app) => compareVersions(app.designSystemVersion, latest) < 0);
    return { applications, currentVersion: latest, upgradeRequired: applications.length };
  }

  async affectedByBreakingChanges(version: string) {
    if (!parseVersion(version)) throw new BadRequestException('version must be a semantic version like 3.0.0');
    const target = version.replace(/^v/, '');
    const applications = (await this.list()).filter((app) => compareVersions(app.designSystemVersion, target) < 0);
    const { breakingChanges, source } = this.breakingChangesFor(target);
    return { applications, affectedCount: applications.length, breakingChanges, breakingChangesSource: source };
  }

  async migrationPlanning() {
    const { version: currentVersion, source } = this.currentVersion();
    const apps = await this.list();
    const currentMajor = parseVersion(currentVersion)[0];

    const applicationsByVersion: Record<string, ApplicationDoc[]> = {};
    for (const app of apps) {
      const key = app.designSystemVersion || 'unknown';
      (applicationsByVersion[key] ??= []).push(app);
    }
    const behind = apps.filter((app) => compareVersions(app.designSystemVersion, currentVersion) < 0);
    const majorBehind = (app: ApplicationDoc) => {
      const parsed = parseVersion(app.designSystemVersion);
      return !parsed || currentMajor - parsed[0] >= 1;
    };

    const recommendedActions = behind
      .map((app) => {
        const from = app.designSystemVersion || 'unknown';
        const major = majorBehind(app);
        return {
          applicationId: app.id,
          applicationName: app.name,
          currentVersion: from,
          targetVersion: currentVersion,
          priority: (major ? 'high' : 'medium') as 'high' | 'medium' | 'low',
          reason: !app.designSystemVersion
            ? `No design system version recorded. Record the version this application uses (target ${currentVersion}).`
            : major
              ? `Major version upgrade required (${from} → ${currentVersion}). Breaking changes may affect this application.`
              : `Minor/patch update available (${from} → ${currentVersion}).`,
        };
      })
      .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1));

    return {
      currentVersion,
      currentVersionSource: source,
      applicationsByVersion,
      upgradeSummary: {
        total: apps.length,
        upToDate: apps.filter((app) => compareVersions(app.designSystemVersion, currentVersion) >= 0 && parseVersion(app.designSystemVersion)).length,
        needsUpgrade: behind.length,
        needsMajorUpgrade: behind.filter(majorBehind).length,
      },
      recommendedActions,
    };
  }

  // ---------- Internals ----------

  /** admin:governance, or admin of the workspace. Applications outside a workspace need admin:governance. */
  async assertCanWrite(principal: AuthPrincipal, workspaceId: string | null): Promise<void> {
    if (hasPermission(principal, Permission.ADMIN_GOVERNANCE)) return;
    if (!workspaceId) {
      throw new ForbiddenException('Requires admin:governance, or choose a workspace you administer');
    }
    if (!(await this.workspaces.has(principal, workspaceId, 'admin'))) {
      throw new ForbiddenException('Requires admin:governance or the admin role in the application\'s workspace');
    }
  }

  private async assertNameFree(name: string, workspaceId: string | null, exceptId?: string): Promise<void> {
    const peers = workspaceId ? await this.listByWorkspace(workspaceId) : (await this.list()).filter((a) => !a.workspaceId);
    const taken = peers.some((app) => app.id !== exceptId && app.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (taken) throw new ConflictException(`An application named "${name}" is already registered${workspaceId ? ' in this workspace' : ''}`);
  }

  /** Loads, checks write access against the stored workspace, applies `fn`, and saves with a retry on conflicts */
  private async mutate(
    principal: AuthPrincipal,
    id: string,
    fn: (app: ApplicationDoc) => void | Promise<void>,
  ): Promise<ApplicationDoc> {
    const current = await this.get(id);
    await this.assertCanWrite(principal, current.workspaceId);
    return this.write(id, async (app) => {
      // The workspace may have changed since the check; re-check against what we'll write over
      if (app.workspaceId !== current.workspaceId) await this.assertCanWrite(principal, app.workspaceId);
      await fn(app);
      app.updatedBy = actorOf(principal);
    });
  }

  private async write(id: string, fn: (app: ApplicationDoc) => void | Promise<void>): Promise<ApplicationDoc> {
    if (!isSafeId(id)) throw new NotFoundException('Application not found');
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Application not found');
      const app = stored.doc;
      await fn(app);
      app.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(app, stored.version);
        return app;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The application was changed by someone else at the same time, please try again');
  }

  /**
   * Merges capability changes into `app`, creating or updating the linked
   * projects. Errors from those modules propagate (no silent half-registration).
   */
  private async applyCapabilities(app: ApplicationDoc, dto: CapabilitiesDto, created: CreatedProjects): Promise<void> {
    const caps: ApplicationCapabilities = app.capabilities;
    const teamId = app.teamId || app.workspaceId || DEFAULT_TEAM;

    if (dto.governance) {
      caps.governance = {
        ...caps.governance,
        enabled: dto.governance.enabled,
        rules: dto.governance.rules ?? caps.governance.rules ?? [],
        scanSchedule: dto.governance.scanSchedule ?? caps.governance.scanSchedule ?? 'manual',
      };
    }

    if (dto.visualRegression) {
      const vr = dto.visualRegression;
      const current = caps.visualRegression;
      const next = {
        ...current,
        enabled: vr.enabled,
        argosProjectId: vr.argosProjectId ?? current.argosProjectId,
        argosBaseUrl: vr.argosBaseUrl ?? current.argosBaseUrl,
        argosBranch: vr.argosBranch ?? current.argosBranch ?? process.env.ARGOS_DEFAULT_BRANCH ?? 'main',
      };
      if (next.enabled && !next.projectId && created.visualRegression) {
        // A retry after a write conflict: reuse the project made on the first attempt
        next.projectId = created.visualRegression;
      } else if (next.enabled && !next.projectId) {
        const project = await this.visualRegression.createProject(teamId, {
          name: `${app.name} - Visual Regression`,
          description: `Visual regression testing for ${app.name}`,
          argosProjectId: next.argosProjectId,
          argosBaseUrl: next.argosBaseUrl,
          argosBranch: next.argosBranch,
          argosToken: vr.argosToken,
        });
        next.projectId = project.id;
        next.argosBaseUrl = project.argosBaseUrl ?? next.argosBaseUrl;
        created.visualRegression = project.id;
      } else if (next.projectId && (vr.argosProjectId || vr.argosBaseUrl || vr.argosBranch || vr.argosToken)) {
        await this.visualRegression.updateProject(next.projectId, {
          argosProjectId: vr.argosProjectId,
          argosBaseUrl: vr.argosBaseUrl,
          argosBranch: vr.argosBranch,
          argosToken: vr.argosToken,
        });
      }
      caps.visualRegression = stripUndefined(next);
    }

    if (dto.sessionReplay) {
      const sr = dto.sessionReplay;
      const current = caps.sessionReplay;
      const next = {
        ...current,
        enabled: sr.enabled,
        openreplayProjectKey: sr.openreplayProjectKey ?? current.openreplayProjectKey,
        openreplayBaseUrl: sr.openreplayBaseUrl ?? current.openreplayBaseUrl,
        privacySettings: sr.privacySettings ? { ...current.privacySettings, ...sr.privacySettings } : current.privacySettings,
      };
      if (next.enabled && !next.projectId && created.sessionReplay) {
        next.projectId = created.sessionReplay;
      } else if (next.enabled && !next.projectId) {
        const project = await this.sessionReplay.createProject(teamId, {
          name: `${app.name} - Session Replay`,
          teamId,
          description: `Session replay for ${app.name}`,
          applicationUrl: app.applicationUrl,
          openreplayProjectKey: next.openreplayProjectKey,
          openreplayBaseUrl: next.openreplayBaseUrl,
          openreplayApiKey: sr.openreplayApiKey,
          privacySettings: next.privacySettings,
        });
        next.projectId = project.id;
        next.openreplayBaseUrl = project.openreplayBaseUrl ?? next.openreplayBaseUrl;
        created.sessionReplay = project.id;
      } else if (next.projectId && (sr.openreplayProjectKey || sr.openreplayBaseUrl || sr.openreplayApiKey || sr.privacySettings)) {
        await this.sessionReplay.updateProject(next.projectId, stripUndefined({
          openreplayProjectKey: sr.openreplayProjectKey,
          openreplayBaseUrl: sr.openreplayBaseUrl,
          openreplayApiKey: sr.openreplayApiKey,
          privacySettings: sr.privacySettings ? next.privacySettings : undefined,
        }));
      }
      caps.sessionReplay = stripUndefined(next);
    }
  }

  /** Deletes linked projects; a project that is already gone is fine */
  private async undoProjects(projects: CreatedProjects): Promise<void> {
    const attempts: Array<[string, () => Promise<void>]> = [];
    if (projects.visualRegression) {
      attempts.push([`visual-regression project ${projects.visualRegression}`, () => this.visualRegression.deleteProject(projects.visualRegression)]);
    }
    if (projects.sessionReplay) {
      attempts.push([`session-replay project ${projects.sessionReplay}`, () => this.sessionReplay.deleteProject(projects.sessionReplay)]);
    }
    for (const [label, run] of attempts) {
      try {
        await run();
      } catch (error) {
        if (error instanceof NotFoundException) continue;
        this.logger.error(`Could not delete ${label}: ${(error as Error).message}`);
        throw error;
      }
    }
  }

  /**
   * Breaking changes recorded for a version in the changelog module, when it
   * is loaded. Looked up lazily so this module doesn't import it (it depends
   * on DesignSystemModule, which will depend on this one).
   */
  private breakingChangesFor(version: string): { breakingChanges: string[]; source: 'changelog' | 'unavailable' } {
    let changelog: { getAggregatedChangelog(filters: { version: string; breakingOnly: boolean }): { entries: Array<{ entityName: string; changes: Array<{ description?: string }> }> } } | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ChangelogAggregationService } = require('../changelog-aggregation/changelog-aggregation.service');
      changelog = this.moduleRef?.get(ChangelogAggregationService, { strict: false });
    } catch {
      changelog = undefined;
    }
    if (!changelog) return { breakingChanges: [], source: 'unavailable' };
    const entries = changelog.getAggregatedChangelog({ version, breakingOnly: true }).entries;
    const breakingChanges = entries.map((entry) => {
      const details = entry.changes.map((c) => c.description).filter(Boolean).join('; ');
      return details ? `${entry.entityName}: ${details}` : entry.entityName;
    });
    return { breakingChanges, source: 'changelog' };
  }
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
