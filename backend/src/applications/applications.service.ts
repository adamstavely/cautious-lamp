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
import { createHash } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { ProjectExistsError as SrProjectExistsError, SessionReplayService } from '../session-replay/session-replay.service';
import { ProjectCreator } from '../visual-regression/project-access';
import { ProjectExistsError as VrProjectExistsError, VisualRegressionService } from '../visual-regression/visual-regression.service';
import { QueryableStore } from '../workspaces/queryable-store';
import { WorkspaceAccessService, actorOf, isSafeId, isWorkspaceSuperuser, newId } from '../workspaces/workspace-access.service';
import {
  CapabilitiesDto,
  MoveApplicationDto,
  RegisterApplicationDto,
  UpdateApplicationDto,
} from './application.dto';
import {
  APPLICATION_NAME_STORE,
  APPLICATION_STORE,
  ApplicationCapabilities,
  ApplicationDoc,
  ApplicationNameClaim,
  CapabilityName,
} from './application.types';
import { DesignSystemVersionInfo, compareVersions, currentDesignSystemVersion, parseVersion } from './design-system-version';

const MAX_WRITE_ATTEMPTS = 5;
/** A claim whose application doesn't exist is only taken over once it's this old (its registration may still be finishing) */
const STALE_CLAIM_MS = 60_000;

const nameKey = (name: string) => name.trim().toLowerCase();
const claimId = (name: string, workspaceId: string | null) =>
  `name_${createHash('sha256').update(`${workspaceId ?? ''}\u0000${nameKey(name)}`).digest('hex').slice(0, 40)}`;

/** Which kind of scan completed (see markScanned) */
export type ScanKind = 'governance' | 'accessibility';
const DEFAULT_TEAM = 'default-team';

export interface ApplicationFilters {
  teamId?: string;
  workspaceId?: string;
  capability?: CapabilityName;
  /** metadata.environment */
  environment?: string;
  /** Case-insensitive text in the name, description, URLs, team or tags */
  search?: string;
}

export interface ApplicationPage {
  applications: ApplicationDoc[];
  /** How many are in this page */
  count: number;
  /** How many match the filters, across all pages */
  total: number;
  offset: number;
  limit: number | null;
  /** Teams and environments among the applications the caller can read (for filter menus) */
  facets: { teams: string[]; environments: string[] };
}

const matchesSearch = (app: ApplicationDoc, search: string): boolean => {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [app.name, app.description, app.repository, app.applicationUrl, app.teamId, ...(app.metadata?.tags ?? [])];
  return haystack.some((value) => typeof value === 'string' && value.toLowerCase().includes(needle));
};

/** Projects this request created, so a failure can undo them */
interface CreatedProjects {
  visualRegression?: string;
  sessionReplay?: string;
}

/**
 * The id of the project backing an application's capability. Fixed per
 * application, so concurrent or retried enables create one project between
 * them instead of one each (the loser of the race finds it and reuses it).
 */
export function linkedProjectId(kind: 'visualRegression' | 'sessionReplay', applicationId: string): string {
  return `${kind === 'visualRegression' ? 'vrp' : 'srp'}_${applicationId}`;
}

/**
 * Registered applications, stored in Elasticsearch (`design-system-applications`).
 *
 * Reads are scoped (listFor, getFor): applications without a workspace and
 * those in the caller's workspaces; `admin:users` and `admin:governance`
 * holders read every one. Writes need `admin:governance` or the admin role in the application's
 * workspace (docs/WORKSPACES.md). Enabling visual regression or session
 * replay creates a project in that module; failures are returned to the
 * caller instead of being swallowed, and deleting an application deletes its projects.
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @Inject(APPLICATION_STORE) private readonly store: QueryableStore<ApplicationDoc>,
    @Inject(APPLICATION_NAME_STORE) private readonly names: DocumentStore<ApplicationNameClaim>,
    private readonly workspaces: WorkspaceAccessService,
    private readonly visualRegression: VisualRegressionService,
    private readonly sessionReplay: SessionReplayService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  private readonly deletedListeners: Array<(app: ApplicationDoc) => Promise<void>> = [];

  /**
   * Lets other modules remove what belongs to an application when it is
   * deleted (accessibility schedules and SLAs). Listeners run after the
   * application is gone; a failing one is logged, not thrown.
   */
  onDeleted(listener: (app: ApplicationDoc) => Promise<void>): void {
    this.deletedListeners.push(listener);
  }

  // ---------- Reads ----------

  async list(filters: ApplicationFilters = {}): Promise<ApplicationDoc[]> {
    const clause: Record<string, string> = {};
    if (filters.teamId) clause.teamId = filters.teamId;
    if (filters.workspaceId) clause.workspaceId = filters.workspaceId;
    let apps = Object.keys(clause).length ? await this.store.findAny([clause]) : await this.store.list();
    if (filters.capability) apps = apps.filter((app) => app.capabilities?.[filters.capability]?.enabled === true);
    if (filters.environment) apps = apps.filter((app) => app.metadata?.environment === filters.environment);
    if (filters.search) apps = apps.filter((app) => matchesSearch(app, filters.search!));
    return apps.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  /**
   * One page of the applications the principal may read, newest first, with
   * the total and the teams and environments to filter by. Without a limit
   * every match is returned (existing callers rely on that).
   */
  async pageFor(principal: AuthPrincipal, filters: ApplicationFilters, paging: { limit?: number; offset?: number } = {}): Promise<ApplicationPage> {
    const visible = await this.listFor(principal);
    const matching = await this.listFor(principal, filters);
    const offset = paging.offset ?? 0;
    const applications = paging.limit ? matching.slice(offset, offset + paging.limit) : matching.slice(offset);
    const distinct = (values: Array<string | undefined>) => [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
    return {
      applications,
      count: applications.length,
      total: matching.length,
      offset,
      limit: paging.limit ?? null,
      facets: {
        teams: distinct(visible.map((app) => app.teamId)),
        environments: distinct(visible.map((app) => app.metadata?.environment)),
      },
    };
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

  /**
   * The applications the principal may read: those without a workspace, and
   * those in workspaces the principal is a member of. `admin:users` and
   * `admin:governance` holders read every application.
   */
  async listFor(principal: AuthPrincipal, filters: ApplicationFilters = {}): Promise<ApplicationDoc[]> {
    const all = await this.list(filters);
    if (this.readsEverything(principal)) return all;
    const mine = await this.workspaces.memberWorkspaceIds(principal);
    return all.filter((app) => !app.workspaceId || mine.has(app.workspaceId));
  }

  /** The application, if the principal may read it; a hidden one is a 404 like a missing one, so ids can't be probed */
  async getFor(principal: AuthPrincipal, id: string): Promise<ApplicationDoc> {
    const app = await this.find(id);
    if (!app || !(await this.canRead(principal, app))) throw new NotFoundException('Application not found');
    return app;
  }

  private readsEverything(principal: AuthPrincipal): boolean {
    return isWorkspaceSuperuser(principal) || hasPermission(principal, Permission.ADMIN_GOVERNANCE);
  }

  private async canRead(principal: AuthPrincipal, app: ApplicationDoc): Promise<boolean> {
    if (!app.workspaceId || this.readsEverything(principal)) return true;
    return (await this.workspaces.memberWorkspaceIds(principal)).has(app.workspaceId);
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
    const id = newId('app');
    await this.claimName(dto.name, workspaceId, id);

    const now = new Date().toISOString();
    const actor = actorOf(principal);
    const app: ApplicationDoc = {
      id,
      name: dto.name,
      description: dto.description ?? '',
      repository: dto.repository || undefined,
      version: dto.version,
      designSystemVersion: dto.designSystemVersion?.replace(/^v/, ''),
      applicationUrl: dto.applicationUrl || undefined,
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
      await this.applyCapabilities(app, dto.capabilities ?? {}, created, principal);
      await this.store.create(app);
    } catch (error) {
      await this.undoUnlinkedProjects(app.id, created);
      await this.releaseName(app.name, workspaceId, app.id);
      throw error;
    }
    return app;
  }

  async update(principal: AuthPrincipal, id: string, dto: UpdateApplicationDto): Promise<ApplicationDoc> {
    const before = await this.getFor(principal, id);
    // A new name (not just new capitals) is claimed first, so a concurrent rename or registration can't take it too
    const renaming = dto.name !== undefined && nameKey(dto.name) !== nameKey(before.name);
    if (renaming) {
      await this.assertCanWrite(principal, before.workspaceId);
      await this.assertNameFree(dto.name!, before.workspaceId, id);
      await this.claimName(dto.name!, before.workspaceId, id);
    }
    try {
      const saved = await this.mutate(principal, id, async (app) => {
        if (dto.name !== undefined) app.name = dto.name;
        if (dto.description !== undefined) app.description = dto.description;
        if (dto.repository !== undefined) app.repository = dto.repository || undefined;
        if (dto.version !== undefined) app.version = dto.version || undefined;
        if (dto.applicationUrl !== undefined) app.applicationUrl = dto.applicationUrl || undefined;
        if (dto.teamId !== undefined) app.teamId = dto.teamId || undefined;
        if (dto.metadata !== undefined) app.metadata = { ...dto.metadata };
      });
      if (renaming) await this.releaseName(before.name, before.workspaceId, id);
      return saved;
    } catch (error) {
      if (renaming) await this.releaseName(dto.name!, before.workspaceId, id);
      throw error;
    }
  }

  async updateCapabilities(principal: AuthPrincipal, id: string, dto: CapabilitiesDto): Promise<ApplicationDoc> {
    const created: CreatedProjects = {};
    try {
      return await this.mutate(principal, id, (app) => this.applyCapabilities(app, dto, created, principal));
    } catch (error) {
      // Only projects no stored application points at: a concurrent writer may have linked the same one
      await this.undoUnlinkedProjects(id, created);
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
    const before = await this.getFor(principal, id);
    if ((before.workspaceId ?? null) === target) return before;
    await this.assertNameFree(before.name, target, id);
    await this.claimName(before.name, target, id);
    let moved: ApplicationDoc;
    try {
      moved = await this.mutate(principal, id, async (app) => {
        app.workspaceId = target;
      });
    } catch (error) {
      await this.releaseName(before.name, target, id);
      throw error;
    }
    await this.releaseName(before.name, before.workspaceId, id);
    await this.moveLinkedProjects(moved);
    return moved;
  }

  /**
   * Records a completed scan. Governance scans and accessibility reports keep
   * their own timestamps, so a report doesn't count as this period's
   * governance scan (GovernanceScanScheduler reads governance.lastScan).
   * `lastScanned` is the latest of either. Timestamps never move backwards,
   * so recording the same scan twice is harmless.
   */
  async markScanned(id: string, at: Date, kind: ScanKind): Promise<ApplicationDoc> {
    const iso = at.toISOString();
    const later = (current: string | undefined) => (current && current > iso ? current : iso);
    return this.write(id, (app) => {
      app.lastScanned = later(app.lastScanned);
      if (kind === 'governance') app.capabilities.governance.lastScan = later(app.capabilities.governance.lastScan);
      else app.lastAccessibilityReport = later(app.lastAccessibilityReport);
    });
  }

  /**
   * Deletes the application, then what belongs to it: its visual-regression
   * and session-replay projects, its name, and (through onDeleted listeners)
   * its accessibility schedules and SLAs. The application goes first, so a
   * failure part-way never leaves it pointing at deleted projects; what
   * couldn't be removed afterwards is logged.
   */
  async delete(principal: AuthPrincipal, id: string): Promise<void> {
    const app = await this.getFor(principal, id);
    await this.assertCanWrite(principal, app.workspaceId);
    if (!(await this.store.delete(id))) throw new NotFoundException('Application not found');
    await this.undoProjects({
      visualRegression: app.capabilities?.visualRegression?.projectId,
      sessionReplay: app.capabilities?.sessionReplay?.projectId,
    }).catch((error) => this.logger.warn(`Application ${id} deleted, but not all its projects: ${(error as Error).message}`));
    await this.releaseName(app.name, app.workspaceId, id);
    for (const listener of this.deletedListeners) {
      await listener(app).catch((error) => this.logger.warn(`Application ${id} deleted; cleanup failed: ${(error as Error).message}`));
    }
  }

  // ---------- Versions ----------

  currentVersion(): DesignSystemVersionInfo {
    return currentDesignSystemVersion();
  }

  async needingUpgrade(principal: AuthPrincipal, currentVersion?: string) {
    if (currentVersion !== undefined && !parseVersion(currentVersion)) {
      throw new BadRequestException('currentVersion must be a semantic version like 2.1.0');
    }
    const latest = currentVersion?.replace(/^v/, '') ?? this.currentVersion().version;
    const applications = (await this.listFor(principal)).filter((app) => compareVersions(app.designSystemVersion, latest) < 0);
    return { applications, currentVersion: latest, upgradeRequired: applications.length };
  }

  async affectedByBreakingChanges(principal: AuthPrincipal, version: string) {
    if (!parseVersion(version)) throw new BadRequestException('version must be a semantic version like 3.0.0');
    const target = version.replace(/^v/, '');
    const applications = (await this.listFor(principal)).filter((app) => compareVersions(app.designSystemVersion, target) < 0);
    const { breakingChanges, source } = this.breakingChangesFor(target);
    return { applications, affectedCount: applications.length, breakingChanges, breakingChangesSource: source };
  }

  async migrationPlanning(principal: AuthPrincipal) {
    const { version: currentVersion, source } = this.currentVersion();
    const apps = await this.listFor(principal);
    const currentMajor = parseVersion(currentVersion)[0];

    const applicationsByVersion: Record<string, ApplicationDoc[]> = {};
    for (const app of apps) {
      const key = app.designSystemVersion || 'unknown';
      (applicationsByVersion[key] ??= []).push(app);
    }
    const behind = apps.filter((app) => compareVersions(app.designSystemVersion, currentVersion) < 0);
    // A major behind needs a recorded version: one with none is counted on its own, not as a major upgrade
    const majorBehind = (app: ApplicationDoc) => {
      const parsed = parseVersion(app.designSystemVersion);
      return !!parsed && currentMajor - parsed[0] >= 1;
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
        unknownVersion: apps.filter((app) => !parseVersion(app.designSystemVersion)).length,
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

  /**
   * Takes the name in the workspace for this application, atomically: the
   * claim document is created only if absent. A claim held by an application
   * that no longer has that name there (renamed, moved, deleted, or a
   * registration that never finished) is taken over.
   */
  private async claimName(name: string, workspaceId: string | null, applicationId: string): Promise<void> {
    const claim: ApplicationNameClaim = { id: claimId(name, workspaceId), applicationId, name, workspaceId, claimedAt: new Date().toISOString() };
    const taken = () => new ConflictException(`An application named "${name}" is already registered${workspaceId ? ' in this workspace' : ''}`);
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      try {
        await this.names.create(claim);
        return;
      } catch (error) {
        if (!(error instanceof DuplicateDocumentError)) throw error;
      }
      const existing = await this.names.get(claim.id);
      if (!existing) continue;
      if (existing.doc.applicationId === applicationId) return;
      const holder = await this.store.get(existing.doc.applicationId);
      if (holder) {
        if ((holder.doc.workspaceId ?? null) === workspaceId && nameKey(holder.doc.name) === nameKey(name)) throw taken();
      } else if (Date.now() - new Date(existing.doc.claimedAt).getTime() < STALE_CLAIM_MS) {
        // Its registration may still be finishing
        throw taken();
      }
      try {
        await this.names.replace(claim, existing.version);
        return;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw taken();
  }

  /** Gives the name back, if this application still holds it */
  private async releaseName(name: string, workspaceId: string | null, applicationId: string): Promise<void> {
    try {
      const existing = await this.names.get(claimId(name, workspaceId));
      if (existing?.doc.applicationId === applicationId) await this.names.delete(existing.doc.id);
    } catch (error) {
      this.logger.warn(`Could not release the name "${name}" of application ${applicationId}: ${(error as Error).message}`);
    }
  }

  /** Loads, checks write access against the stored workspace, applies `fn`, and saves with a retry on conflicts */
  private async mutate(
    principal: AuthPrincipal,
    id: string,
    fn: (app: ApplicationDoc) => void | Promise<void>,
  ): Promise<ApplicationDoc> {
    // An application the caller can't read is a 404, not a 403 that confirms it exists
    const current = await this.getFor(principal, id);
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
   * A linked project that no longer exists is recreated when the capability is
   * enabled, and unlinked when it is disabled.
   */
  private async applyCapabilities(
    app: ApplicationDoc,
    dto: CapabilitiesDto,
    created: CreatedProjects,
    principal: AuthPrincipal,
  ): Promise<void> {
    const caps: ApplicationCapabilities = app.capabilities;
    const teamId = app.teamId || app.workspaceId || DEFAULT_TEAM;
    const createdBy: ProjectCreator = { type: principal.type, id: principal.id, name: principal.name };
    const owner = { workspaceId: app.workspaceId, applicationId: app.id, createdBy };

    if (dto.governance) {
      if (dto.governance.rules?.length) await this.assertRulesExist(dto.governance.rules);
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
      const changes = stripUndefined({
        argosProjectId: vr.argosProjectId,
        argosBaseUrl: vr.argosBaseUrl,
        argosBranch: vr.argosBranch,
        argosToken: vr.argosToken,
      });
      if (next.projectId && !(await this.linkedProjectStillThere('visualRegression', next.projectId, next.enabled, changes))) {
        next.projectId = undefined;
        if (next.enabled && !vr.argosToken) {
          throw new BadRequestException(
            "The application's visual-regression project no longer exists. Send argosToken to recreate it.",
          );
        }
      }
      if (next.enabled && !next.projectId) {
        if (created.visualRegression) {
          // A retry after a write conflict: reuse the project made on the first attempt
          next.projectId = created.visualRegression;
        } else {
          const id = linkedProjectId('visualRegression', app.id);
          try {
            const project = await this.visualRegression.createProject(
              teamId,
              {
                name: `${app.name} - Visual Regression`,
                description: `Visual regression testing for ${app.name}`,
                argosProjectId: next.argosProjectId,
                argosBaseUrl: next.argosBaseUrl,
                argosBranch: next.argosBranch,
                argosToken: vr.argosToken,
              },
              { ...owner, id },
            );
            next.projectId = project.id;
            next.argosBaseUrl = project.argosBaseUrl ?? next.argosBaseUrl;
            created.visualRegression = project.id;
          } catch (error) {
            if (!(error instanceof VrProjectExistsError)) throw error;
            // A concurrent request made it first: share it, with this request's settings
            next.projectId = id;
            if (Object.keys(changes).length) await this.visualRegression.updateProject(id, changes);
          }
        }
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
      const changes = stripUndefined({
        openreplayProjectKey: sr.openreplayProjectKey,
        openreplayBaseUrl: sr.openreplayBaseUrl,
        openreplayApiKey: sr.openreplayApiKey,
        privacySettings: sr.privacySettings ? next.privacySettings : undefined,
      });
      if (next.projectId && !(await this.linkedProjectStillThere('sessionReplay', next.projectId, next.enabled, changes))) {
        next.projectId = undefined;
      }
      if (next.enabled && !next.projectId) {
        if (created.sessionReplay) {
          next.projectId = created.sessionReplay;
        } else {
          const id = linkedProjectId('sessionReplay', app.id);
          try {
            const project = await this.sessionReplay.createProject(
              teamId,
              {
                name: `${app.name} - Session Replay`,
                teamId,
                description: `Session replay for ${app.name}`,
                applicationUrl: app.applicationUrl,
                openreplayProjectKey: next.openreplayProjectKey,
                openreplayBaseUrl: next.openreplayBaseUrl,
                openreplayApiKey: sr.openreplayApiKey,
                privacySettings: next.privacySettings,
              },
              { ...owner, id },
            );
            next.projectId = project.id;
            next.openreplayBaseUrl = project.openreplayBaseUrl ?? next.openreplayBaseUrl;
            created.sessionReplay = project.id;
          } catch (error) {
            if (!(error instanceof SrProjectExistsError)) throw error;
            next.projectId = id;
            if (Object.keys(changes).length) await this.sessionReplay.updateProject(id, changes);
          }
        }
      }
      caps.sessionReplay = stripUndefined(next);
    }
  }

  /**
   * Applies `changes` to the linked project, or (with no changes) checks it
   * exists when the capability is enabled. False when it is gone.
   */
  private async linkedProjectStillThere(
    kind: 'visualRegression' | 'sessionReplay',
    projectId: string,
    enabled: boolean,
    changes: Record<string, unknown>,
  ): Promise<boolean> {
    const module = kind === 'visualRegression' ? this.visualRegression : this.sessionReplay;
    if (Object.keys(changes).length) {
      try {
        await module.updateProject(projectId, changes);
        return true;
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.warn(`Linked ${kind} project ${projectId} is missing; ${enabled ? 'recreating it' : 'unlinking it'}`);
          return false;
        }
        throw error;
      }
    }
    if (!enabled) return true;
    const exists = await module.projectExists(projectId);
    if (!exists) this.logger.warn(`Linked ${kind} project ${projectId} is missing; recreating it`);
    return exists;
  }

  /** Keeps linked projects in the application's workspace, so access to them follows the application */
  private async moveLinkedProjects(app: ApplicationDoc): Promise<void> {
    const vrId = app.capabilities?.visualRegression?.projectId;
    const srId = app.capabilities?.sessionReplay?.projectId;
    for (const [id, module] of [
      [vrId, this.visualRegression],
      [srId, this.sessionReplay],
    ] as const) {
      if (!id) continue;
      try {
        await module.setProjectWorkspace(id, app.workspaceId);
      } catch (error) {
        if (!(error instanceof NotFoundException)) throw error;
      }
    }
  }

  /**
   * Undoes projects this request created, unless the stored application links
   * them (a concurrent request that won the write may share the same project).
   */
  private async undoUnlinkedProjects(applicationId: string, created: CreatedProjects): Promise<void> {
    if (!created.visualRegression && !created.sessionReplay) return;
    const stored = await this.find(applicationId).catch(() => null);
    const linked = stored?.capabilities;
    await this.undoProjects({
      visualRegression: created.visualRegression !== linked?.visualRegression?.projectId ? created.visualRegression : undefined,
      sessionReplay: created.sessionReplay !== linked?.sessionReplay?.projectId ? created.sessionReplay : undefined,
    });
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
   * Rejects governance rule ids that don't exist, so an application can't
   * silently end up running none of the rules it picked (unknown ids are
   * skipped at scan time). Looked up lazily, like the changelog below: the
   * governance module depends on this one. Without it (some tests) ids aren't checked.
   */
  private async assertRulesExist(ids: string[]): Promise<void> {
    let rules: { list(): Promise<Array<{ id: string }>> } | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { RulesService } = require('../governance/rules.service');
      rules = this.moduleRef?.get(RulesService, { strict: false });
    } catch {
      rules = undefined;
    }
    if (!rules) return;
    const known = new Set((await rules.list()).map((rule) => rule.id));
    const unknown = [...new Set(ids)].filter((id) => !known.has(id));
    if (unknown.length) throw new BadRequestException(`Unknown governance rule${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`);
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
