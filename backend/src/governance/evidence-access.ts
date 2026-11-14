import { AuthPrincipal, hasPermission } from '../auth/principal';
import type { ComponentReadScope } from '../design-system/component-access.service';
import { Permission } from '../rbac/rbac.service';
import { DesignComponent } from './governance.types';

/**
 * Who may read a stored scan or accessibility report. Both contain evidence
 * (component names, HTML snippets), so they are read under the same rules as
 * the components and applications they came from (docs/GOVERNANCE.md).
 */
export interface EvidenceAccess {
  /** Application evidence: the application's workspace when it was produced (null: no workspace) */
  workspaceId?: string | null;
  /**
   * Design-system scans: for each workspace component in the result that
   * wasn't global, the workspaces that could read it (its own plus those it
   * was shared with). Empty when the scan only covered library and global components.
   */
  componentAudiences?: string[][];
}

/** Which workspaces a principal reads through: ComponentAccessService.scopeFor */
export interface ReadScopeResolver {
  scopeFor(principal: AuthPrincipal | undefined): Promise<ComponentReadScope>;
}

export const READ_SCOPE = Symbol('GOVERNANCE_READ_SCOPE');

/** The read scope of internal callers (the scheduler): everything */
export const SYSTEM_SCOPE: ComponentReadScope = { all: true, workspaceIds: new Set() };

/** The audiences of the private components a design-system scan covered, deduplicated */
export function componentAudiences(components: Array<Pick<DesignComponent, 'workspaceId' | 'sharedWith' | 'isGlobal'>>): string[][] {
  const seen = new Map<string, string[]>();
  for (const component of components) {
    if (!component.workspaceId || component.isGlobal === true) continue;
    const audience = [...new Set([component.workspaceId, ...(component.sharedWith ?? [])])].sort();
    seen.set(audience.join(','), audience);
  }
  return [...seen.values()];
}

/**
 * Application scans and accessibility reports: `admin:governance` holders,
 * `admin:users` holders (scope.all), and members of the application's
 * workspace. Evidence of applications without a workspace is for
 * governance admins only. Records stored before `access` existed (undefined)
 * are treated the same way: governance admins and admin:users only.
 */
export function canReadApplicationEvidence(principal: AuthPrincipal, scope: ComponentReadScope, access: EvidenceAccess | undefined): boolean {
  if (scope.all || hasPermission(principal, Permission.ADMIN_GOVERNANCE)) return true;
  return !!access?.workspaceId && scope.workspaceIds.has(access.workspaceId);
}

/**
 * Design-system scans: readable when the reader can read every private
 * component the scan covered. Scans stored before `access` existed may hold
 * any component, so only admin:users holders (who read every component) see them.
 */
export function canReadComponentEvidence(scope: ComponentReadScope, access: EvidenceAccess | undefined): boolean {
  if (scope.all) return true;
  if (!access?.componentAudiences) return false;
  return access.componentAudiences.every((audience) => audience.some((workspaceId) => scope.workspaceIds.has(workspaceId)));
}
