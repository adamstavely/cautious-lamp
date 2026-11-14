import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { WorkspaceAccessService, isWorkspaceSuperuser } from '../workspaces/workspace-access.service';
import { Component, DesignSystemService } from './design-system.service';

/** Which components a principal may read: everything (`all`), or those visible to its workspaces */
export interface ComponentReadScope {
  all: boolean;
  workspaceIds: ReadonlySet<string>;
}

/**
 * Library components (no workspace) and global ones are visible to everyone;
 * a workspace's own components only to its members and the workspaces it
 * shares them with. The same rule as `componentsVisibleTo` in workspaces.
 */
export function canReadComponent(scope: ComponentReadScope, component: Pick<Component, 'workspaceId' | 'sharedWith' | 'isGlobal'>): boolean {
  if (scope.all || !component.workspaceId || component.isGlobal === true) return true;
  return scope.workspaceIds.has(component.workspaceId) || (component.sharedWith ?? []).some((id) => scope.workspaceIds.has(id));
}

/**
 * The one place component reads are authorized. Every route that returns
 * components (list, detail, status, variants, metadata, search, AI chat) goes
 * through here, so workspace components don't leak through global routes.
 */
@Injectable()
export class ComponentAccessService {
  constructor(
    private readonly designSystem: DesignSystemService,
    private readonly workspaces: WorkspaceAccessService,
  ) {}

  /** `admin:users` holders see every workspace (as in WorkspaceAccessService); others their memberships */
  async scopeFor(principal: AuthPrincipal | undefined): Promise<ComponentReadScope> {
    if (principal && isWorkspaceSuperuser(principal)) return { all: true, workspaceIds: new Set() };
    return { all: false, workspaceIds: principal ? await this.workspaces.memberWorkspaceIds(principal) : new Set() };
  }

  /** The components the principal may read, optionally by status */
  async list(principal: AuthPrincipal | undefined, status?: string): Promise<Component[]> {
    return this.filter(principal, this.designSystem.getAllComponents(status));
  }

  async filter<T extends Pick<Component, 'workspaceId' | 'sharedWith' | 'isGlobal'>>(principal: AuthPrincipal | undefined, components: T[]): Promise<T[]> {
    const scope = await this.scopeFor(principal);
    return components.filter((component) => canReadComponent(scope, component));
  }

  /**
   * The component, if the principal may read it. A hidden component gets the
   * same error as a missing one, so ids can't be probed.
   */
  async get(principal: AuthPrincipal, id: string): Promise<Component> {
    const component = this.designSystem.getComponentById(id);
    if (!component || !canReadComponent(await this.scopeFor(principal), component)) {
      throw new BadRequestException(`Component '${id}' not found`);
    }
    return component;
  }
}
