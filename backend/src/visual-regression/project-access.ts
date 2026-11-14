import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { WorkspaceAccessService, isWorkspaceSuperuser } from '../workspaces/workspace-access.service';
import { WorkspaceRole } from '../workspaces/workspace.types';

/** Who created a project: a signed-in user or an API key */
export interface ProjectCreator {
  type: 'user' | 'service';
  id: string;
  name: string;
}

/**
 * Who a visual-regression or session-replay project belongs to (docs/WORKSPACES.md,
 * "Visual regression and session replay projects"):
 *
 * - `workspaceId` set: the workspace's members, by role.
 * - `workspaceId` null: only its creator.
 * - `applicationId` set: the project backs an application's capability, so
 *   admin:governance holders (who manage applications) can use it too.
 *
 * admin:users holders can use every project, as they can every workspace.
 */
export interface ProjectOwnership {
  workspaceId: string | null;
  applicationId?: string;
  createdBy: ProjectCreator;
}

/**
 * - `read`: see the project, its runs, results, sessions and settings (viewer)
 * - `run`: trigger runs, approve or reject diffs, record baselines (editor)
 * - `manage`: change or delete the project and its notifications (editor; admin
 *   when the project backs an application, since changing the application needs admin)
 */
export type ProjectAction = 'read' | 'run' | 'manage';

export function creatorOf(principal: AuthPrincipal): ProjectCreator {
  return { type: principal.type, id: principal.id, name: principal.name };
}

function requiredRole(project: ProjectOwnership, action: ProjectAction): WorkspaceRole {
  if (action === 'read') return 'viewer';
  if (action === 'manage' && project.applicationId) return 'admin';
  return 'editor';
}

/** Decides what a principal may do with a project, from its ownership fields */
@Injectable()
export class ProjectAccessService {
  constructor(private readonly workspaces: WorkspaceAccessService) {}

  async can(principal: AuthPrincipal, project: ProjectOwnership, action: ProjectAction): Promise<boolean> {
    if (isWorkspaceSuperuser(principal)) return true;
    if (project.applicationId && hasPermission(principal, Permission.ADMIN_GOVERNANCE)) return true;
    if (project.workspaceId) return this.workspaces.has(principal, project.workspaceId, requiredRole(project, action));
    const creator = project.createdBy;
    return !!creator && creator.type === principal.type && creator.id === principal.id;
  }

  /**
   * Throws unless the principal may do `action`. Callers who can't even read the
   * project get 404 (ids can't be probed); readers without the role get 403.
   */
  async assert(principal: AuthPrincipal, project: ProjectOwnership & { id: string }, action: ProjectAction): Promise<void> {
    if (await this.can(principal, project, action)) return;
    if (action !== 'read' && (await this.can(principal, project, 'read'))) {
      throw new ForbiddenException(
        project.workspaceId
          ? `Requires the ${requiredRole(project, action)} role in the project's workspace`
          : 'Only the project creator can do this',
      );
    }
    throw new NotFoundException(`Project with ID ${project.id} not found`);
  }

  /** The projects the principal can read */
  async readable<T extends ProjectOwnership>(principal: AuthPrincipal, projects: T[]): Promise<T[]> {
    const memo = new Map<string, boolean>();
    const out: T[] = [];
    for (const project of projects) {
      let allowed: boolean;
      if (project.workspaceId && !isWorkspaceSuperuser(principal) && !(project.applicationId && hasPermission(principal, Permission.ADMIN_GOVERNANCE))) {
        if (!memo.has(project.workspaceId)) memo.set(project.workspaceId, await this.workspaces.has(principal, project.workspaceId, 'viewer'));
        allowed = memo.get(project.workspaceId)!;
      } else {
        allowed = await this.can(principal, project, 'read');
      }
      if (allowed) out.push(project);
    }
    return out;
  }

  /** Creating a project in a workspace needs the editor role there; without one, anyone signed in (they own it) */
  async assertCanCreate(principal: AuthPrincipal, workspaceId: string | null | undefined): Promise<void> {
    if (!workspaceId) return;
    await this.workspaces.require(principal, workspaceId, 'editor');
  }
}
