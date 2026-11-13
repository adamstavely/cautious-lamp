/** Injection token for the design-system components a workspace can see */
export const WORKSPACE_COMPONENT_SOURCE = Symbol('WORKSPACE_COMPONENT_SOURCE');

/** The parts of a design-system component workspaces use */
export interface WorkspaceComponent {
  id: string;
  name: string;
  status: string;
  workspaceId?: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  [key: string]: unknown;
}

export interface ComponentUsageRecord {
  applicationId: string;
  usageCount: number;
}

/**
 * Components live in DesignSystemService and usage in AnalyticsService (both
 * in memory today). The module wires this to them; tests use a fake.
 */
export interface WorkspaceComponentSource {
  listComponents(): WorkspaceComponent[];
  getComponent(id: string): WorkspaceComponent | undefined;
  /** Usage recorded by application scans, per application */
  usage(componentId: string): ComponentUsageRecord[];
  /** Replaces a component's sharing; returns the updated component */
  setSharing(componentId: string, sharing: { sharedWith: string[]; isGlobal: boolean }): WorkspaceComponent | undefined;
}

/** Components a workspace can see: its own, those shared with it, and global ones */
export function componentsVisibleTo(source: WorkspaceComponentSource, workspaceId: string): WorkspaceComponent[] {
  return source
    .listComponents()
    .filter((c) => c.workspaceId === workspaceId || c.isGlobal === true || (c.sharedWith ?? []).includes(workspaceId));
}
