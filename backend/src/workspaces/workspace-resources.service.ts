import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from './queryable-store';
import { ResourceKindSpec, resourceKind, validateResourceFields } from './resource-kinds';
import { UpdateSharingDto } from './workspace.dto';
import { WorkspaceAccess, WorkspaceAccessService, actorOf, assertRole, isSafeId, newId } from './workspace-access.service';
import { WORKSPACE_RESOURCE_STORE, WorkspaceDoc, WorkspaceResource, WorkspaceResourceDoc } from './workspace.types';

const MAX_WRITE_ATTEMPTS = 5;

/**
 * The 18 kinds of workspace items (fonts, tokens, guidelines, …) behind one
 * generic API: `/workspaces/:id/resources/:kind[/:rid]`. Every operation is
 * scoped by the workspace in the path:
 *
 * - reading needs viewer, and sees the workspace's own items plus items other
 *   workspaces shared with it and global items;
 * - creating, changing and deleting need editor, and only touch items the
 *   workspace owns (anything else is 404, so ids can't be probed across workspaces);
 * - sharing needs editor, or admin when the workspace requires approval for
 *   sharing or when making an item global (or not).
 */
@Injectable()
export class WorkspaceResourcesService {
  constructor(
    @Inject(WORKSPACE_RESOURCE_STORE) private readonly store: QueryableStore<WorkspaceResourceDoc>,
    private readonly access: WorkspaceAccessService,
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
    return this.mutateOwned(workspaceId, kind, resourceId, (doc) => {
      doc.fields = { ...doc.fields, ...patch };
      doc.updatedBy = actorOf(principal);
    });
  }

  async delete(principal: AuthPrincipal, workspaceId: string, kind: string, resourceId: string): Promise<void> {
    this.spec(kind);
    await this.access.require(principal, workspaceId, 'editor');
    const doc = await this.load(kind, resourceId);
    if (!doc || doc.workspaceId !== workspaceId) throw new NotFoundException('Item not found');
    if (!(await this.store.delete(doc.id))) throw new NotFoundException('Item not found');
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
