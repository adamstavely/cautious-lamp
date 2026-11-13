export const WORKSPACES_INDEX = 'design-system-workspaces';
export const WORKSPACE_RESOURCES_INDEX = 'design-system-workspace-resources';

/** Injection tokens for the two stores */
export const WORKSPACE_STORE = Symbol('WORKSPACE_STORE');
export const WORKSPACE_RESOURCE_STORE = Symbol('WORKSPACE_RESOURCE_STORE');

/** Per-workspace roles, highest first. A workspace has exactly one owner. */
export const WORKSPACE_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Roles that can be given to a member (owner only moves by transfer) */
export const ASSIGNABLE_ROLES = ['admin', 'editor', 'viewer'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_RANK: Record<WorkspaceRole, number> = { owner: 4, admin: 3, editor: 2, viewer: 1 };

/** Who did something, from the principal (never from the request body) */
export interface Actor {
  id: string;
  name: string;
}

export interface WorkspaceMember {
  /** Id of the user in design-system-users */
  userId: string;
  /** Lowercase */
  email: string;
  name: string;
  role: WorkspaceRole;
  addedAt: string;
  addedBy: Actor;
}

export interface WorkspaceSettings {
  /** When false, nothing from this workspace can be shared with other workspaces or made global */
  allowExternalSharing: boolean;
  /** When true, only workspace admins (not editors) can share items or change their sharing */
  requireApprovalForSharing: boolean;
  defaultComponentStatus: 'production' | 'in-progress' | 'planned';
}

export interface WorkspaceMetadata {
  teamSize?: number;
  industry?: string;
  tags?: string[];
}

/** As stored in design-system-workspaces */
export interface WorkspaceDoc {
  id: string;
  name: string;
  description: string;
  /** Unique, URL-friendly */
  slug: string;
  ownerId: string;
  members: WorkspaceMember[];
  /** Denormalized from members for term queries */
  memberIds: string[];
  settings: WorkspaceSettings;
  metadata: WorkspaceMetadata;
  createdAt: string;
  updatedAt: string;
  createdBy: Actor;
}

/** As stored in design-system-workspace-resources. Kind-specific fields live in `fields`. */
export interface WorkspaceResourceDoc {
  id: string;
  kind: string;
  /** The owning workspace; only it can change or delete the item */
  workspaceId: string;
  /** Other workspaces that can read the item */
  sharedWith: string[];
  /** Readable by every workspace */
  isGlobal: boolean;
  fields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: Actor;
  updatedBy: Actor;
}

/** A resource as the API returns it: kind fields flattened next to the control fields */
export type WorkspaceResource = Record<string, unknown> & {
  id: string;
  kind: string;
  workspaceId: string;
  sharedWith: string[];
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: Actor;
  updatedBy: Actor;
};

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const WORKSPACE_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  slug: keyword,
  ownerId: keyword,
  memberIds: keyword,
  createdAt: date,
  updatedAt: date,
};

export const WORKSPACE_RESOURCE_PROPERTIES = {
  id: keyword,
  kind: keyword,
  workspaceId: keyword,
  sharedWith: keyword,
  isGlobal: { type: 'boolean' },
  createdAt: date,
  updatedAt: date,
};
