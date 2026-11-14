import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { QueryableStore } from './queryable-store';
import { Actor, ROLE_RANK, WORKSPACE_STORE, WorkspaceDoc, WorkspaceRole } from './workspace.types';

const SAFE_ID = /^[A-Za-z0-9_-]{1,100}$/;

/** Ids are generated on the server: `<prefix>_<24 hex chars>` */
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`;
}

/** Whether a path parameter can be an id at all (keeps junk out of storage lookups) */
export function isSafeId(id: unknown): id is string {
  return typeof id === 'string' && SAFE_ID.test(id);
}

export function actorOf(principal: AuthPrincipal): Actor {
  return { id: principal.id, name: principal.name };
}

/** `admin:users` holders (and the admin key) administer every workspace as if they owned it */
export function isWorkspaceSuperuser(principal: AuthPrincipal): boolean {
  return hasPermission(principal, Permission.ADMIN_USERS);
}

export interface WorkspaceAccess {
  workspace: WorkspaceDoc;
  /** The caller's own membership role, or null when they aren't a member */
  memberRole: WorkspaceRole | null;
  /** What the caller may do: their role, or `owner` for an admin:users holder */
  effectiveRole: WorkspaceRole;
  superuser: boolean;
}

/**
 * Reads workspaces and decides what a principal may do in one. Shared by the
 * workspaces and applications modules; it only needs the workspace store.
 */
@Injectable()
export class WorkspaceAccessService {
  constructor(@Inject(WORKSPACE_STORE) private readonly store: QueryableStore<WorkspaceDoc>) {}

  /** The workspace, or null. No access check. */
  async find(workspaceId: string): Promise<WorkspaceDoc | null> {
    if (!isSafeId(workspaceId)) return null;
    return (await this.store.get(workspaceId))?.doc ?? null;
  }

  roleOf(workspace: WorkspaceDoc, principal: AuthPrincipal): WorkspaceRole | null {
    if (principal.type !== 'user') return null;
    return workspace.members.find((m) => m.userId === principal.id)?.role ?? null;
  }

  /** What the principal can do in an already-loaded workspace, or null if nothing */
  accessTo(workspace: WorkspaceDoc, principal: AuthPrincipal): WorkspaceAccess | null {
    const memberRole = this.roleOf(workspace, principal);
    const superuser = isWorkspaceSuperuser(principal);
    if (!memberRole && !superuser) return null;
    return { workspace, memberRole, effectiveRole: superuser ? 'owner' : memberRole, superuser };
  }

  /**
   * Loads the workspace and checks the caller has at least `required`.
   * Non-members get 404 (so ids can't be probed); members with too low a role get 403.
   */
  async require(principal: AuthPrincipal, workspaceId: string, required: WorkspaceRole): Promise<WorkspaceAccess> {
    const workspace = await this.find(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const access = this.accessTo(workspace, principal);
    if (!access) throw new NotFoundException('Workspace not found');
    assertRole(access, required);
    return access;
  }

  /** Ids of the workspaces the principal is a member of (none for API keys, which can't be members) */
  async memberWorkspaceIds(principal: AuthPrincipal): Promise<Set<string>> {
    if (principal.type !== 'user') return new Set();
    return new Set((await this.store.findAny([{ memberIds: principal.id }])).map((ws) => ws.id));
  }

  /** Whether the principal has at least `required` in the workspace (false if it doesn't exist) */
  async has(principal: AuthPrincipal, workspaceId: string, required: WorkspaceRole): Promise<boolean> {
    const workspace = await this.find(workspaceId);
    const access = workspace && this.accessTo(workspace, principal);
    return !!access && ROLE_RANK[access.effectiveRole] >= ROLE_RANK[required];
  }
}

export function assertRole(access: WorkspaceAccess, required: WorkspaceRole): void {
  if (ROLE_RANK[access.effectiveRole] < ROLE_RANK[required]) {
    throw new ForbiddenException(`Requires the ${required} role in this workspace`);
  }
}
