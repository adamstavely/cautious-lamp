import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { AuthPrincipal, assertSelfOr } from '../auth/principal';
import { UsersService } from '../auth/users.service';
import { Permission } from '../rbac/rbac.service';
import { VersionConflictError } from '../reviews/document-store';
import { WORKSPACE_COMPONENT_SOURCE, WorkspaceComponent, WorkspaceComponentSource, componentsVisibleTo } from './component-source';
import { QueryableStore } from './queryable-store';
import {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  TransferOwnershipDto,
  UpdateSharingDto,
  UpdateWorkspaceDto,
  UpdateWorkspaceMemberDto,
} from './workspace.dto';
import {
  WorkspaceAccess,
  WorkspaceAccessService,
  actorOf,
  assertRole,
  isSafeId,
  isWorkspaceSuperuser,
  newId,
} from './workspace-access.service';
import { WorkspaceResourcesService, checkSharing } from './workspace-resources.service';
import { AssignableRole, WORKSPACE_STORE, WorkspaceDoc, WorkspaceMember, WorkspaceRole } from './workspace.types';

const MAX_WRITE_ATTEMPTS = 5;
const MAX_SLUG_ATTEMPTS = 20;

export interface WorkspaceSummary {
  memberCount: number;
  applicationCount: number;
  componentCount: number;
  healthScore: number | null;
}

/** A workspace as the API returns it */
export type WorkspaceView = Omit<WorkspaceDoc, 'memberIds'> & {
  /** The caller's membership role (null for an admin:users holder who isn't a member) */
  myRole: WorkspaceRole | null;
  /** What the caller can do (owner for admin:users holders) */
  effectiveRole: WorkspaceRole;
  summary?: WorkspaceSummary;
};

/** `GET /users/:userId/workspaces` (contract with the user management page) */
export interface UserWorkspace {
  workspaceId: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
  return slug || 'workspace';
}

/** Health score from component statuses (docs/WORKSPACES.md); null without components */
export function healthScore(components: WorkspaceComponent[]): number | null {
  if (components.length === 0) return null;
  const deprecated = components.filter((c) => c.status === 'deprecated').length;
  const inProgress = components.filter((c) => c.status === 'in-progress').length;
  return Math.max(0, Math.min(100, 100 - deprecated * 5 - inProgress * 2));
}

/**
 * Team workspaces, stored in Elasticsearch (`design-system-workspaces`).
 * Roles: viewer reads, editor changes items, admin manages members and
 * settings, owner deletes. `admin:users` holders act as owner everywhere.
 * See docs/WORKSPACES.md.
 */
@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(WORKSPACE_STORE) private readonly store: QueryableStore<WorkspaceDoc>,
    private readonly access: WorkspaceAccessService,
    private readonly resources: WorkspaceResourcesService,
    private readonly applications: ApplicationsService,
    private readonly users: UsersService,
    @Inject(WORKSPACE_COMPONENT_SOURCE) private readonly components: WorkspaceComponentSource,
  ) {}

  // ---------- Workspaces ----------

  /** admin:users holders see every workspace (or only theirs with `mine`); everyone else sees theirs */
  async list(principal: AuthPrincipal, options: { mine?: boolean } = {}): Promise<WorkspaceView[]> {
    const all = isWorkspaceSuperuser(principal) && !options.mine;
    const docs = all
      ? await this.store.list()
      : principal.type === 'user'
        ? await this.store.findAny([{ memberIds: principal.id }])
        : [];
    const apps = docs.length ? await this.applications.list() : [];
    const appCounts = new Map<string, number>();
    for (const app of apps) {
      if (app.workspaceId) appCounts.set(app.workspaceId, (appCounts.get(app.workspaceId) ?? 0) + 1);
    }
    return docs
      .map((doc) => {
        const access = this.access.accessTo(doc, principal);
        const components = componentsVisibleTo(this.components, doc.id);
        return toView(access, {
          memberCount: doc.members.length,
          applicationCount: appCounts.get(doc.id) ?? 0,
          componentCount: components.length,
          healthScore: healthScore(components),
        });
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(principal: AuthPrincipal, id: string): Promise<WorkspaceView> {
    return toView(await this.access.require(principal, id, 'viewer'));
  }

  async getBySlug(principal: AuthPrincipal, slug: string): Promise<WorkspaceView> {
    const [doc] = typeof slug === 'string' && slug.length <= 60 ? await this.store.findAny([{ slug }]) : [];
    if (!doc) throw new NotFoundException('Workspace not found');
    return this.get(principal, doc.id);
  }

  async create(principal: AuthPrincipal, dto: CreateWorkspaceDto): Promise<WorkspaceView> {
    const owner = await this.resolveOwner(principal, dto.ownerEmail);
    const now = new Date().toISOString();
    const actor = actorOf(principal);
    const doc: WorkspaceDoc = {
      id: newId('ws'),
      name: dto.name,
      description: dto.description ?? '',
      slug: '',
      ownerId: owner.userId,
      members: [{ ...owner, role: 'owner', addedAt: now, addedBy: actor }],
      memberIds: [owner.userId],
      settings: {
        allowExternalSharing: dto.settings?.allowExternalSharing ?? true,
        requireApprovalForSharing: dto.settings?.requireApprovalForSharing ?? false,
        defaultComponentStatus: dto.settings?.defaultComponentStatus ?? 'in-progress',
      },
      metadata: { ...(dto.metadata ?? {}) },
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
    };

    const base = dto.slug ?? slugify(dto.name);
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      if (await this.slugTaken(candidate)) {
        if (dto.slug) throw new ConflictException(`The slug "${dto.slug}" is taken`);
        continue;
      }
      doc.slug = candidate;
      await this.store.create(doc);
      // Two creates can pass the check at once; the earlier one keeps the slug
      if (await this.lostSlugRace(doc)) {
        await this.store.delete(doc.id);
        if (dto.slug) throw new ConflictException(`The slug "${dto.slug}" is taken`);
        continue;
      }
      return toView(this.access.accessTo(doc, principal));
    }
    throw new ConflictException('Could not find a free slug for this name; choose one with "slug"');
  }

  async update(principal: AuthPrincipal, id: string, dto: UpdateWorkspaceDto): Promise<WorkspaceView> {
    await this.access.require(principal, id, 'admin');
    if (dto.slug !== undefined && (await this.slugTaken(dto.slug, id))) {
      throw new ConflictException(`The slug "${dto.slug}" is taken`);
    }
    let turnedOffSharing = false;
    const doc = await this.mutate(principal, id, 'admin', (ws) => {
      if (dto.name !== undefined) ws.name = dto.name;
      if (dto.description !== undefined) ws.description = dto.description;
      if (dto.slug !== undefined) ws.slug = dto.slug;
      if (dto.settings) {
        turnedOffSharing = ws.settings.allowExternalSharing && dto.settings.allowExternalSharing === false;
        ws.settings = { ...ws.settings, ...stripUndefined(dto.settings) };
      }
      if (dto.metadata) ws.metadata = { ...ws.metadata, ...stripUndefined(dto.metadata) };
    });
    if (dto.slug !== undefined && (await this.lostSlugRace(doc))) {
      throw new ConflictException(`The slug "${dto.slug}" was just taken by another workspace; choose another`);
    }
    if (turnedOffSharing) {
      // Turning external sharing off withdraws what was already shared
      await this.resources.revokeExternalSharing(id);
      for (const component of this.components.listComponents().filter((c) => c.workspaceId === id)) {
        if (component.isGlobal || component.sharedWith?.length) this.components.setSharing(component.id, { sharedWith: [], isGlobal: false });
      }
    }
    return toView(this.access.accessTo(doc, principal));
  }

  /**
   * Owner only. Blocked while applications or components belong to the
   * workspace; its own items are deleted and it is removed from other items' share lists.
   */
  async delete(principal: AuthPrincipal, id: string): Promise<{ deletedItems: number }> {
    await this.access.require(principal, id, 'owner');
    const apps = await this.applications.listByWorkspace(id);
    const owned = this.components.listComponents().filter((c) => c.workspaceId === id);
    if (apps.length || owned.length) {
      const parts = [
        apps.length ? `${apps.length} application${apps.length === 1 ? '' : 's'}` : '',
        owned.length ? `${owned.length} component${owned.length === 1 ? '' : 's'}` : '',
      ].filter(Boolean);
      throw new ConflictException(`This workspace still has ${parts.join(' and ')}. Move or delete them before deleting the workspace.`);
    }
    const { deleted } = await this.resources.removeWorkspace(id);
    for (const component of this.components.listComponents().filter((c) => (c.sharedWith ?? []).includes(id))) {
      this.components.setSharing(component.id, {
        sharedWith: component.sharedWith.filter((wsId) => wsId !== id),
        isGlobal: component.isGlobal === true,
      });
    }
    if (!(await this.store.delete(id))) throw new NotFoundException('Workspace not found');
    return { deletedItems: deleted };
  }

  // ---------- Members ----------

  async addMember(principal: AuthPrincipal, id: string, dto: AddWorkspaceMemberDto): Promise<WorkspaceView> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || user.status !== 'active') {
      throw new NotFoundException('No active user has that email. Ask an administrator to create their account first.');
    }
    return this.addUser(principal, id, { userId: user.id, email: user.email, name: user.name }, dto.role);
  }

  async updateMember(principal: AuthPrincipal, id: string, userId: string, dto: UpdateWorkspaceMemberDto): Promise<WorkspaceView> {
    const doc = await this.mutate(principal, id, 'admin', (ws, access) => {
      const member = findMember(ws, userId);
      if (!member) throw new NotFoundException('Member not found');
      if (member.role === 'owner') {
        throw new ConflictException('The owner keeps the owner role; transfer ownership to change it');
      }
      if ((member.role === 'admin' || dto.role === 'admin') && member.role !== dto.role) {
        // Only the owner grants or takes away admin, so admins can't promote each other
        assertRole(access, 'owner');
      }
      member.role = dto.role;
    });
    return toView(this.access.accessTo(doc, principal));
  }

  /** Admins remove editors and viewers, the owner removes admins too, and anyone but the owner can leave */
  async removeMember(principal: AuthPrincipal, id: string, userId: string): Promise<WorkspaceView | { left: true }> {
    const leaving = principal.type === 'user' && principal.id === userId;
    const doc = await this.mutate(principal, id, leaving ? 'viewer' : 'admin', (ws, access) => {
      const member = findMember(ws, userId);
      if (!member) throw new NotFoundException('Member not found');
      if (member.role === 'owner') {
        throw new ConflictException('The owner can\'t be removed; transfer ownership first');
      }
      if (!leaving && member.role === 'admin') assertRole(access, 'owner');
      ws.members = ws.members.filter((m) => m !== member);
    });
    const access = this.access.accessTo(doc, principal);
    return access ? toView(access) : { left: true };
  }

  /** The owner (or an admin:users holder) hands ownership to an existing member, and becomes an admin */
  async transferOwnership(principal: AuthPrincipal, id: string, dto: TransferOwnershipDto): Promise<WorkspaceView> {
    const doc = await this.mutate(principal, id, 'owner', (ws) => {
      const target = findMember(ws, dto.userId);
      if (!target) throw new BadRequestException('The new owner must already be a member of the workspace');
      if (target.role === 'owner') return;
      const previous = ws.members.find((m) => m.role === 'owner');
      if (previous) previous.role = 'admin';
      target.role = 'owner';
      ws.ownerId = target.userId;
    });
    return toView(this.access.accessTo(doc, principal));
  }

  // ---------- Per-user (user management page) ----------

  async userWorkspaces(principal: AuthPrincipal, userId: string): Promise<UserWorkspace[]> {
    assertSelfOr(principal, userId, Permission.ADMIN_USERS);
    if (!isSafeId(userId)) return [];
    const docs = await this.store.findAny([{ memberIds: userId }]);
    return docs
      .map((ws) => ({ workspaceId: ws.id, name: ws.name, slug: ws.slug, role: findMember(ws, userId)?.role }))
      .filter((entry): entry is UserWorkspace => !!entry.role)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async addUserToWorkspace(principal: AuthPrincipal, userId: string, workspaceId: string, role: AssignableRole) {
    const user = isSafeId(userId) ? await this.users.findById(userId) : null;
    if (!user || user.status !== 'active') throw new NotFoundException('User not found');
    return this.addUser(principal, workspaceId, { userId: user.id, email: user.email, name: user.name }, role);
  }

  // ---------- Components ----------

  async listComponents(principal: AuthPrincipal, id: string, status?: string) {
    await this.access.require(principal, id, 'viewer');
    let components = componentsVisibleTo(this.components, id);
    if (status) components = components.filter((c) => c.status === status);
    return { components, count: components.length };
  }

  /** Same rules as items; the component must belong to the workspace in the path */
  async setComponentSharing(principal: AuthPrincipal, id: string, componentId: string, dto: UpdateSharingDto) {
    const access = await this.access.require(principal, id, 'editor');
    const component = this.components.getComponent(componentId);
    if (!component || component.workspaceId !== id) throw new NotFoundException('Component not found in this workspace');
    const next = await checkSharing(access, component, dto, this.access);
    return this.components.setSharing(componentId, next);
  }

  // ---------- Analytics ----------

  async analytics(principal: AuthPrincipal, id: string) {
    await this.access.require(principal, id, 'viewer');
    return this.computeAnalytics(id);
  }

  /** Workspaces the caller can view, optionally narrowed to `ids` */
  async compare(principal: AuthPrincipal, ids?: string[]) {
    let visible = await this.list(principal);
    if (ids?.length) visible = visible.filter((ws) => ids.includes(ws.id));
    const rows = [];
    for (const ws of visible) {
      const a = await this.computeAnalytics(ws.id);
      rows.push({
        workspaceId: ws.id,
        workspaceName: ws.name,
        totalComponents: a.totalComponents,
        totalApplications: a.totalApplications,
        adoptionRate: a.adoptionRate,
        healthScore: a.healthScore,
      });
    }
    return rows.sort((a, b) => (b.healthScore ?? -1) - (a.healthScore ?? -1));
  }

  /**
   * Computed from the components the workspace can see, its applications and
   * the component usage recorded by application scans. Figures that need usage
   * data are null when no scan has recorded any (`usageDataAvailable: false`).
   */
  private async computeAnalytics(id: string) {
    const components = componentsVisibleTo(this.components, id);
    const apps = await this.applications.listByWorkspace(id);
    const appIds = new Set(apps.map((app) => app.id));

    const componentsByStatus: Record<string, number> = {};
    for (const c of components) componentsByStatus[c.status] = (componentsByStatus[c.status] ?? 0) + 1;

    const usedByApp = new Map<string, Set<string>>();
    const usage = components.map((c) => {
      const records = this.components.usage(c.id).filter((r) => appIds.has(r.applicationId));
      for (const r of records) {
        if (!usedByApp.has(r.applicationId)) usedByApp.set(r.applicationId, new Set());
        usedByApp.get(r.applicationId).add(c.id);
      }
      return { component: c, total: records.reduce((sum, r) => sum + r.usageCount, 0), applications: records.length };
    });
    const usageDataAvailable = usedByApp.size > 0;
    const production = components.filter((c) => c.status === 'production');
    const adopted = usage.filter((u) => u.component.status === 'production' && u.applications > 0).length;
    const round = (n: number) => Math.round(n * 10) / 10;

    return {
      totalComponents: components.length,
      componentsByStatus,
      totalApplications: apps.length,
      designDebt: componentsByStatus['deprecated'] ?? 0,
      healthScore: healthScore(components),
      usageDataAvailable,
      adoptionRate: usageDataAvailable && apps.length ? round((usedByApp.size / apps.length) * 100) : null,
      mostUsedComponents: usage
        .filter((u) => u.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((u) => ({ id: u.component.id, name: u.component.name, usage: u.total, applications: u.applications })),
      adoptionMetrics: {
        componentsAvailable: production.length,
        componentsAdopted: usageDataAvailable ? adopted : null,
        adoptionPercentage: usageDataAvailable && production.length ? round((adopted / production.length) * 100) : null,
        applicationsUsingComponents: usageDataAvailable ? usedByApp.size : null,
        averageComponentsPerApp:
          usageDataAvailable && apps.length
            ? round([...usedByApp.values()].reduce((sum, set) => sum + set.size, 0) / apps.length)
            : null,
      },
    };
  }

  // ---------- Internals ----------

  private async addUser(
    principal: AuthPrincipal,
    id: string,
    user: { userId: string; email: string; name: string },
    role: AssignableRole,
  ): Promise<WorkspaceView> {
    const doc = await this.mutate(principal, id, 'admin', (ws, access) => {
      if (role === 'admin') assertRole(access, 'owner');
      const email = user.email.toLowerCase();
      if (ws.members.some((m) => m.userId === user.userId || m.email.toLowerCase() === email)) {
        throw new ConflictException('That person is already a member');
      }
      ws.members.push({
        userId: user.userId,
        email,
        name: user.name,
        role,
        addedAt: new Date().toISOString(),
        addedBy: actorOf(principal),
      });
    });
    return toView(this.access.accessTo(doc, principal));
  }

  private async resolveOwner(principal: AuthPrincipal, ownerEmail?: string): Promise<{ userId: string; email: string; name: string }> {
    if (ownerEmail) {
      if (!isWorkspaceSuperuser(principal)) {
        throw new ForbiddenException('Only admin:users holders can create a workspace for someone else');
      }
      const user = await this.users.findByEmail(ownerEmail);
      if (!user || user.status !== 'active') throw new BadRequestException('No active user has that ownerEmail');
      return { userId: user.id, email: user.email, name: user.name };
    }
    if (principal.type !== 'user') {
      throw new BadRequestException('API keys must name the owner with ownerEmail');
    }
    return { userId: principal.id, email: principal.email.toLowerCase(), name: principal.name };
  }

  private async slugTaken(slug: string, exceptId?: string): Promise<boolean> {
    return (await this.store.findAny([{ slug }])).some((ws) => ws.id !== exceptId);
  }

  /** Whether another workspace with the same slug was created first */
  private async lostSlugRace(doc: WorkspaceDoc): Promise<boolean> {
    const same = await this.store.findAny([{ slug: doc.slug }]);
    const first = same.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))[0];
    return !!first && first.id !== doc.id;
  }

  /** Loads, checks the role against the stored copy, applies `fn`, and saves with a retry on conflicts */
  private async mutate(
    principal: AuthPrincipal,
    id: string,
    required: WorkspaceRole,
    fn: (ws: WorkspaceDoc, access: WorkspaceAccess) => void,
  ): Promise<WorkspaceDoc> {
    if (!isSafeId(id)) throw new NotFoundException('Workspace not found');
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Workspace not found');
      const ws = stored.doc;
      const access = this.access.accessTo(ws, principal);
      if (!access) throw new NotFoundException('Workspace not found');
      assertRole(access, required);
      fn(ws, access);
      ws.memberIds = ws.members.map((m) => m.userId);
      ws.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(ws, stored.version);
        return ws;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The workspace was changed by someone else at the same time, please try again');
  }
}

function findMember(ws: WorkspaceDoc, userId: string): WorkspaceMember | undefined {
  return ws.members.find((m) => m.userId === userId);
}

function toView(access: WorkspaceAccess, summary?: WorkspaceSummary): WorkspaceView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { memberIds, ...rest } = access.workspace;
  return { ...rest, myRole: access.memberRole, effectiveRole: access.effectiveRole, ...(summary ? { summary } : {}) };
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

