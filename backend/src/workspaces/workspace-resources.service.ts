import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { CHANGE_RECORDER, ChangeAction, ChangeRecorder } from '../notifications/notification.types';
import { VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from './queryable-store';
import { ResourceKindSpec, resourceKind, validateResourceFields } from './resource-kinds';
import { StyleDictionaryTree, toStyleDictionary } from './style-dictionary';
import { UpdateSharingDto } from './workspace.dto';
import {
  WorkspaceAccess,
  WorkspaceAccessService,
  actorOf,
  assertRole,
  isSafeId,
  isWorkspaceSuperuser,
  newId,
} from './workspace-access.service';
import { WORKSPACE_RESOURCE_STORE, WorkspaceDoc, WorkspaceResource, WorkspaceResourceDoc } from './workspace.types';

const MAX_WRITE_ATTEMPTS = 5;

/** Kinds whose changes go into the design-system changelog, and their changelog type */
const CHANGELOG_TYPES: Record<string, 'token' | 'pattern'> = { tokens: 'token', patterns: 'pattern' };

/** Tagging an item "deprecated" deprecates it */
const isDeprecated = (fields: Record<string, unknown>) =>
  Array.isArray(fields.tags) && fields.tags.some((tag) => String(tag).toLowerCase() === 'deprecated');

/**
 * The kinds of workspace items (fonts, tokens, guidelines, …) behind one
 * generic API: `/workspaces/:id/resources/:kind[/:rid]`. Every operation is
 * scoped by the workspace in the path:
 *
 * - reading needs viewer, and sees the workspace's own items plus items other
 *   workspaces shared with it and global items;
 * - creating, changing and deleting need editor, and only touch items the
 *   workspace owns (anything else is 404, so ids can't be probed across workspaces);
 * - sharing needs editor, or admin when the workspace requires approval for
 *   sharing or when making an item global (or not).
 *
 * `library` reads one kind across every workspace the caller can read, for
 * the library pages (`/resources/:kind`); writes still go through a workspace.
 */
@Injectable()
export class WorkspaceResourcesService {
  constructor(
    @Inject(WORKSPACE_RESOURCE_STORE) private readonly store: QueryableStore<WorkspaceResourceDoc>,
    private readonly access: WorkspaceAccessService,
    @Inject(CHANGE_RECORDER) private readonly changes: ChangeRecorder,
  ) {}

  async list(principal: AuthPrincipal, workspaceId: string, kind: string, filter?: string): Promise<WorkspaceResource[]> {
    const spec = this.spec(kind);
    await this.access.require(principal, workspaceId, 'viewer');
    let docs = await this.store.findAny([
      { kind, workspaceId },
      { kind, sharedWith: workspaceId },
      { kind, isGlobal: true },
    ]);
    if (filter && spec.filterField) docs = docs.filter((doc) => doc.fields[spec.filterField] === filter);
    return docs.map(toView);
  }

  /**
   * The tokens the workspace can read (its own, shared with it and global) as
   * a Style Dictionary source file, its own first so they win a name clash.
   * `filter` is a category, as on the list.
   */
  async exportStyleDictionary(principal: AuthPrincipal, workspaceId: string, filter?: string): Promise<StyleDictionaryTree> {
    const tokens = await this.list(principal, workspaceId, 'tokens', filter);
    const own = (token: WorkspaceResource) => (token.workspaceId === workspaceId ? 0 : 1);
    return toStyleDictionary(
      [...tokens].sort((a, b) => own(a) - own(b) || String(a.name).localeCompare(String(b.name)) || a.createdAt.localeCompare(b.createdAt)),
    );
  }

  /**
   * One kind across the caller's workspaces: items in the workspaces they are a
   * member of, items shared with those workspaces, and global items, newest
   * first. admin:users holders read every workspace, as they do elsewhere.
   * Callers who aren't members of anything (API keys) see global items only.
   */
  async library(principal: AuthPrincipal, kind: string, filter?: string): Promise<WorkspaceResource[]> {
    const spec = this.spec(kind);
    let docs: WorkspaceResourceDoc[];
    if (isWorkspaceSuperuser(principal)) {
      docs = await this.store.findAny([{ kind }]);
    } else {
      const ids = [...(await this.access.memberWorkspaceIds(principal))];
      docs = await this.store.findAny([
        { kind, isGlobal: true },
        ...ids.flatMap((workspaceId) => [
          { kind, workspaceId },
          { kind, sharedWith: workspaceId },
        ]),
      ]);
    }
    if (filter && spec.filterField) docs = docs.filter((doc) => doc.fields[spec.filterField] === filter);
    return docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(toView);
  }

  async get(principal: AuthPrincipal, workspaceId: string, kind: string, resourceId: string): Promise<WorkspaceResource> {
    this.spec(kind);
    await this.access.require(principal, workspaceId, 'viewer');
    const doc = await this.load(kind, resourceId);
    if (!doc || !visibleTo(doc, workspaceId)) throw new NotFoundException('Item not found');
    return toView(doc);
  }

  async create(principal: AuthPrincipal, workspaceId: string, kind: string, body: unknown): Promise<WorkspaceResource> {
    const spec = this.spec(kind);
    await this.access.require(principal, workspaceId, 'editor');
    const fields = await validateResourceFields(spec, body, false);
    const now = new Date().toISOString();
    const actor = actorOf(principal);
    const doc: WorkspaceResourceDoc = {
      id: newId('res'),
      kind,
      workspaceId,
      sharedWith: [],
      isGlobal: false,
      fields,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
    };
    await this.store.create(doc);
    await this.recordChange(principal, spec, doc, isDeprecated(fields) ? 'deprecated' : 'created');
    return toView(doc);
  }

  async update(
    principal: AuthPrincipal,
    workspaceId: string,
    kind: string,
    resourceId: string,
    body: unknown,
  ): Promise<WorkspaceResource> {
    const spec = this.spec(kind);
    await this.access.require(principal, workspaceId, 'editor');
    const patch = await validateResourceFields(spec, body, true);
    let before: Record<string, unknown> = {};
    const view = await this.mutateOwned(workspaceId, kind, resourceId, (doc) => {
      before = { ...doc.fields };
      doc.fields = { ...doc.fields, ...patch };
      doc.updatedBy = actorOf(principal);
    });
    const changed = Object.keys(patch).filter((field) => JSON.stringify(before[field]) !== JSON.stringify(patch[field]));
    if (changed.length) {
      const renamed = changed.includes(spec.titleField);
      await this.recordChange(
        principal,
        spec,
        fromView(view),
        !isDeprecated(before) && isDeprecated(view) ? 'deprecated' : 'updated',
        changed.map((field) =>
          field === spec.titleField
            ? { field, description: `Renamed from "${String(before[field] ?? '')}"` }
            : { field, description: `${field} changed` },
        ),
        // References by the old name stop resolving
        renamed && kind === 'tokens',
      );
    }
    return view;
  }

  async delete(principal: AuthPrincipal, workspaceId: string, kind: string, resourceId: string): Promise<void> {
    this.spec(kind);
    await this.access.require(principal, workspaceId, 'editor');
    const doc = await this.load(kind, resourceId);
    if (!doc || doc.workspaceId !== workspaceId) throw new NotFoundException('Item not found');
    if (!(await this.store.delete(doc.id))) throw new NotFoundException('Item not found');
    await this.recordChange(principal, this.spec(kind), doc, 'deleted', [], true);
  }

  async setSharing(
    principal: AuthPrincipal,
    workspaceId: string,
    kind: string,
    resourceId: string,
    dto: UpdateSharingDto,
  ): Promise<WorkspaceResource> {
    this.spec(kind);
    const access = await this.access.require(principal, workspaceId, 'editor');
    const current = await this.load(kind, resourceId);
    if (!current || current.workspaceId !== workspaceId) throw new NotFoundException('Item not found');
    const next = await checkSharing(access, current, dto, this.access);
    return this.mutateOwned(workspaceId, kind, resourceId, (doc) => {
      doc.sharedWith = next.sharedWith;
      doc.isGlobal = next.isGlobal;
      doc.updatedBy = actorOf(principal);
    });
  }

  // ---------- For WorkspacesService ----------

  /** Withdraws every share and global flag on items the workspace owns (external sharing turned off) */
  async revokeExternalSharing(workspaceId: string): Promise<number> {
    const owned = await this.store.findAny([{ workspaceId }]);
    let changed = 0;
    for (const doc of owned.filter((d) => d.isGlobal || d.sharedWith.length)) {
      await this.write(doc.id, (d) => {
        d.sharedWith = [];
        d.isGlobal = false;
      });
      changed++;
    }
    return changed;
  }

  /** Deletes the workspace's items and removes it from other items' share lists */
  async removeWorkspace(workspaceId: string): Promise<{ deleted: number; unshared: number }> {
    const owned = await this.store.findAny([{ workspaceId }]);
    for (const doc of owned) await this.store.delete(doc.id);
    const sharedIn = await this.store.findAny([{ sharedWith: workspaceId }]);
    for (const doc of sharedIn) {
      await this.write(doc.id, (d) => {
        d.sharedWith = d.sharedWith.filter((id) => id !== workspaceId);
      });
    }
    return { deleted: owned.length, unshared: sharedIn.length };
  }

  async countOwned(workspaceId: string): Promise<number> {
    return (await this.store.findAny([{ workspaceId }])).length;
  }

  // ---------- Internals ----------

  /** Reports a token or pattern change to the design-system changelog; other kinds aren't tracked */
  private async recordChange(
    principal: AuthPrincipal,
    spec: ResourceKindSpec,
    doc: Pick<WorkspaceResourceDoc, 'id' | 'workspaceId' | 'sharedWith' | 'isGlobal' | 'fields'>,
    action: ChangeAction,
    changes: Array<{ field?: string; description?: string }> = [],
    breaking = false,
  ): Promise<void> {
    const type = CHANGELOG_TYPES[spec.kind];
    if (!type) return;
    await this.changes.record(
      {
        type,
        entityId: doc.id,
        entityName: String(doc.fields[spec.titleField] ?? doc.id),
        action,
        changes,
        breaking,
        workspaceId: doc.workspaceId,
        audience: doc.isGlobal ? [] : [doc.workspaceId, ...doc.sharedWith],
        link: `/admin/workspaces/${doc.workspaceId}`,
      },
      principal,
    );
  }

  private spec(kind: string): ResourceKindSpec {
    const spec = resourceKind(kind);
    if (!spec) throw new NotFoundException(`Unknown resource kind "${kind}"`);
    return spec;
  }

  private async load(kind: string, resourceId: string): Promise<WorkspaceResourceDoc | null> {
    if (!isSafeId(resourceId)) return null;
    const doc = (await this.store.get(resourceId))?.doc;
    return doc && doc.kind === kind ? doc : null;
  }

  private mutateOwned(
    workspaceId: string,
    kind: string,
    resourceId: string,
    fn: (doc: WorkspaceResourceDoc) => void,
  ): Promise<WorkspaceResource> {
    return this.write(resourceId, (doc) => {
      if (doc.kind !== kind || doc.workspaceId !== workspaceId) throw new NotFoundException('Item not found');
      fn(doc);
    }).then(toView);
  }

  private async write(id: string, fn: (doc: WorkspaceResourceDoc) => void): Promise<WorkspaceResourceDoc> {
    if (!isSafeId(id)) throw new NotFoundException('Item not found');
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Item not found');
      const doc = stored.doc;
      fn(doc);
      doc.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(doc, stored.version);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The item was changed by someone else at the same time, please try again');
  }
}

/**
 * Validates a sharing change against the caller's role and the workspace's
 * settings, and returns the new sharing. Used for workspace items and components.
 */
export async function checkSharing(
  access: WorkspaceAccess,
  current: { sharedWith?: string[]; isGlobal?: boolean },
  dto: UpdateSharingDto,
  workspaces: WorkspaceAccessService,
): Promise<{ sharedWith: string[]; isGlobal: boolean }> {
  const workspace: WorkspaceDoc = access.workspace;
  const wasGlobal = current.isGlobal === true;
  const isGlobal = dto.isGlobal ?? wasGlobal;
  const targets = [...new Set(dto.workspaceIds)];

  if (workspace.settings.requireApprovalForSharing) {
    assertRole(access, 'admin');
  }
  if (isGlobal !== wasGlobal) {
    // Global items are visible everywhere, so only workspace admins can make (or unmake) them
    assertRole(access, 'admin');
  }
  if (targets.includes(workspace.id)) {
    throw new BadRequestException('An item is always visible in its own workspace; leave it out of workspaceIds');
  }
  if (isGlobal && targets.length) {
    throw new ConflictException('This item is global and already visible to every workspace; send an empty workspaceIds');
  }
  if (!workspace.settings.allowExternalSharing && (isGlobal || targets.length)) {
    throw new ForbiddenException("External sharing is turned off in this workspace's settings");
  }
  const unknown: string[] = [];
  for (const id of targets) {
    if (!(await workspaces.find(id))) unknown.push(id);
  }
  if (unknown.length) throw new BadRequestException(`Unknown workspace(s): ${unknown.join(', ')}`);
  return { sharedWith: isGlobal ? [] : targets, isGlobal };
}

function visibleTo(doc: WorkspaceResourceDoc, workspaceId: string): boolean {
  return doc.workspaceId === workspaceId || doc.isGlobal || doc.sharedWith.includes(workspaceId);
}

/** The parts of a stored item a view still carries */
function fromView(view: WorkspaceResource): Pick<WorkspaceResourceDoc, 'id' | 'workspaceId' | 'sharedWith' | 'isGlobal' | 'fields'> {
  return { id: view.id, workspaceId: view.workspaceId, sharedWith: view.sharedWith, isGlobal: view.isGlobal, fields: view as Record<string, unknown> };
}

/** Kind fields first, so control fields always win */
function toView(doc: WorkspaceResourceDoc): WorkspaceResource {
  return {
    ...doc.fields,
    id: doc.id,
    kind: doc.kind,
    workspaceId: doc.workspaceId,
    sharedWith: doc.sharedWith,
    isGlobal: doc.isGlobal,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
  };
}
