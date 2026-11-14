import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { VersionConflictError } from '../reviews/document-store';
import { RBAC_STORE, RbacStore, RoleDoc } from './rbac.store';

export enum Permission {
  // Component permissions
  COMPONENT_VIEW = 'component:view',
  COMPONENT_CREATE = 'component:create',
  COMPONENT_EDIT = 'component:edit',
  COMPONENT_DELETE = 'component:delete',
  COMPONENT_APPROVE = 'component:approve',
  
  // Design Token permissions
  TOKEN_VIEW = 'token:view',
  TOKEN_CREATE = 'token:create',
  TOKEN_EDIT = 'token:edit',
  TOKEN_DELETE = 'token:delete',
  
  // Pattern permissions
  PATTERN_VIEW = 'pattern:view',
  PATTERN_CREATE = 'pattern:create',
  PATTERN_EDIT = 'pattern:edit',
  PATTERN_DELETE = 'pattern:delete',
  
  // Review permissions
  REVIEW_VIEW = 'review:view',
  REVIEW_CREATE = 'review:create',
  REVIEW_APPROVE = 'review:approve',
  REVIEW_REJECT = 'review:reject',
  REVIEW_ADMIN = 'review:admin',
  
  // Admin permissions
  ADMIN_SYSTEM_HEALTH = 'admin:system_health',
  ADMIN_GOVERNANCE = 'admin:governance',
  ADMIN_AUDIT = 'admin:audit',
  ADMIN_BANNERS = 'admin:banners',
  ADMIN_RBAC = 'admin:rbac',
  ADMIN_PERFORMANCE_ANALYSIS = 'admin:performance_analysis',
  ADMIN_USERS = 'admin:users',
  
  // Roadmap & Feedback permissions
  ROADMAP_VIEW = 'roadmap:view',
  ROADMAP_EDIT = 'roadmap:edit',
  FEEDBACK_CREATE = 'feedback:create',
  FEEDBACK_VOTE = 'feedback:vote',
  
  // Style/Tokens permissions
  STYLE_MANAGE = 'style:manage',
  STYLE_APPROVE = 'style:approve',
  
  // Design permissions
  DESIGN_CREATE = 'design:create',
  DESIGN_EDIT = 'design:edit',
  DESIGN_APPROVE = 'design:approve',
}

export enum Role {
  DESIGNER = 'designer',
  ART_DIRECTOR = 'art_director',
  CREATIVE_DIRECTOR = 'creative_director',
  DESIGN_SYSTEM_MANAGER = 'design_system_manager',
  REVIEW_MANAGER = 'review_manager',
  STYLE_MANAGER = 'style_manager',
  DEVELOPER = 'developer',
  SYSTEM_OWNER = 'system_owner',
  ACCESSIBILITY_AUDITOR = 'accessibility_auditor',
  /** Approves or rejects reviews at the client review stage (docs/REVIEW_API.md) */
  CLIENT = 'client',
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy?: string;
}

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(Permission);

const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && PERMISSION_SET.has(value);
}

/**
 * Permissions added to the default roles after roles were first stored. A role
 * stored before `defaultsApplied` was tracked is assumed to have had every other
 * default applied already, so only these are added to it.
 */
const PERMISSIONS_ADDED_LATER: readonly Permission[] = [Permission.ADMIN_USERS];

/** Labels for the permission picker. A Record, so a new permission without a label fails to compile. */
const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.COMPONENT_VIEW]: 'View Components',
  [Permission.COMPONENT_CREATE]: 'Create Components',
  [Permission.COMPONENT_EDIT]: 'Edit Components',
  [Permission.COMPONENT_DELETE]: 'Delete Components',
  [Permission.COMPONENT_APPROVE]: 'Approve Components',
  [Permission.TOKEN_VIEW]: 'View Tokens',
  [Permission.TOKEN_CREATE]: 'Create Tokens',
  [Permission.TOKEN_EDIT]: 'Edit Tokens',
  [Permission.TOKEN_DELETE]: 'Delete Tokens',
  [Permission.PATTERN_VIEW]: 'View Patterns',
  [Permission.PATTERN_CREATE]: 'Create Patterns',
  [Permission.PATTERN_EDIT]: 'Edit Patterns',
  [Permission.PATTERN_DELETE]: 'Delete Patterns',
  [Permission.REVIEW_VIEW]: 'View Reviews',
  [Permission.REVIEW_CREATE]: 'Create Reviews',
  [Permission.REVIEW_APPROVE]: 'Approve Reviews',
  [Permission.REVIEW_REJECT]: 'Reject Reviews',
  [Permission.REVIEW_ADMIN]: 'Review Administration',
  [Permission.ADMIN_SYSTEM_HEALTH]: 'System Health',
  [Permission.ADMIN_GOVERNANCE]: 'Governance',
  [Permission.ADMIN_AUDIT]: 'Audit Logs',
  [Permission.ADMIN_BANNERS]: 'Site Banners',
  [Permission.ADMIN_RBAC]: 'Role Management',
  [Permission.ADMIN_PERFORMANCE_ANALYSIS]: 'Performance Analysis',
  [Permission.ADMIN_USERS]: 'User Management',
  [Permission.ROADMAP_VIEW]: 'View Roadmap',
  [Permission.ROADMAP_EDIT]: 'Edit Roadmap',
  [Permission.FEEDBACK_CREATE]: 'Create Feedback',
  [Permission.FEEDBACK_VOTE]: 'Vote on Feedback',
  [Permission.STYLE_MANAGE]: 'Manage Styles',
  [Permission.STYLE_APPROVE]: 'Approve Styles',
  [Permission.DESIGN_CREATE]: 'Create Designs',
  [Permission.DESIGN_EDIT]: 'Edit Designs',
  [Permission.DESIGN_APPROVE]: 'Approve Designs',
};

const PERMISSION_CATEGORIES: Record<string, string> = {
  component: 'Components',
  token: 'Design Tokens',
  pattern: 'Patterns',
  review: 'Reviews',
  admin: 'Administration',
  roadmap: 'Roadmap & Feedback',
  feedback: 'Roadmap & Feedback',
  style: 'Style',
  design: 'Design',
};

@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);
  private initialized: Promise<void> | null = null;

  // Default role definitions with permissions
  readonly defaultRoles: Record<Role, Permission[]> = {
    [Role.DESIGNER]: [
      Permission.COMPONENT_VIEW,
      Permission.COMPONENT_CREATE,
      Permission.COMPONENT_EDIT,
      Permission.TOKEN_VIEW,
      Permission.PATTERN_VIEW,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.DESIGN_CREATE,
      Permission.DESIGN_EDIT,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.ART_DIRECTOR]: [
      Permission.COMPONENT_VIEW,
      Permission.COMPONENT_CREATE,
      Permission.COMPONENT_EDIT,
      Permission.COMPONENT_APPROVE,
      Permission.TOKEN_VIEW,
      Permission.TOKEN_CREATE,
      Permission.TOKEN_EDIT,
      Permission.PATTERN_VIEW,
      Permission.PATTERN_CREATE,
      Permission.PATTERN_EDIT,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.REVIEW_APPROVE,
      Permission.REVIEW_REJECT,
      Permission.DESIGN_CREATE,
      Permission.DESIGN_EDIT,
      Permission.DESIGN_APPROVE,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.CREATIVE_DIRECTOR]: [
      Permission.COMPONENT_VIEW,
      Permission.COMPONENT_CREATE,
      Permission.COMPONENT_EDIT,
      Permission.COMPONENT_DELETE,
      Permission.COMPONENT_APPROVE,
      Permission.TOKEN_VIEW,
      Permission.TOKEN_CREATE,
      Permission.TOKEN_EDIT,
      Permission.TOKEN_DELETE,
      Permission.PATTERN_VIEW,
      Permission.PATTERN_CREATE,
      Permission.PATTERN_EDIT,
      Permission.PATTERN_DELETE,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.REVIEW_APPROVE,
      Permission.REVIEW_REJECT,
      Permission.DESIGN_CREATE,
      Permission.DESIGN_EDIT,
      Permission.DESIGN_APPROVE,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.DESIGN_SYSTEM_MANAGER]: [
      // All permissions
      ...Object.values(Permission),
    ],
    [Role.REVIEW_MANAGER]: [
      Permission.COMPONENT_VIEW,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.REVIEW_APPROVE,
      Permission.REVIEW_REJECT,
      Permission.REVIEW_ADMIN,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.STYLE_MANAGER]: [
      Permission.COMPONENT_VIEW,
      Permission.TOKEN_VIEW,
      Permission.TOKEN_CREATE,
      Permission.TOKEN_EDIT,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
      Permission.TOKEN_DELETE,
      Permission.STYLE_MANAGE,
      Permission.STYLE_APPROVE,
      Permission.PATTERN_VIEW,
      Permission.PATTERN_CREATE,
      Permission.PATTERN_EDIT,
    ],
    [Role.DEVELOPER]: [
      Permission.COMPONENT_VIEW,
      Permission.COMPONENT_CREATE,
      Permission.COMPONENT_EDIT,
      Permission.TOKEN_VIEW,
      Permission.TOKEN_CREATE,
      Permission.TOKEN_EDIT,
      Permission.PATTERN_VIEW,
      Permission.PATTERN_CREATE,
      Permission.PATTERN_EDIT,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
      Permission.ADMIN_PERFORMANCE_ANALYSIS,
    ],
    [Role.SYSTEM_OWNER]: [
      Permission.COMPONENT_VIEW,
      Permission.COMPONENT_CREATE,
      Permission.COMPONENT_EDIT,
      Permission.COMPONENT_DELETE,
      Permission.COMPONENT_APPROVE,
      Permission.TOKEN_VIEW,
      Permission.TOKEN_CREATE,
      Permission.TOKEN_EDIT,
      Permission.TOKEN_DELETE,
      Permission.PATTERN_VIEW,
      Permission.PATTERN_CREATE,
      Permission.PATTERN_EDIT,
      Permission.PATTERN_DELETE,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.REVIEW_APPROVE,
      Permission.REVIEW_REJECT,
      Permission.ADMIN_SYSTEM_HEALTH,
      Permission.ADMIN_GOVERNANCE,
      Permission.ADMIN_AUDIT,
      Permission.ADMIN_PERFORMANCE_ANALYSIS,
      Permission.ADMIN_USERS,
      Permission.ROADMAP_VIEW,
      Permission.ROADMAP_EDIT,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.ACCESSIBILITY_AUDITOR]: [
      Permission.COMPONENT_VIEW,
      Permission.PATTERN_VIEW,
      Permission.TOKEN_VIEW,
      Permission.REVIEW_VIEW,
      Permission.REVIEW_CREATE,
      Permission.REVIEW_APPROVE,
      Permission.REVIEW_REJECT,
      Permission.ADMIN_GOVERNANCE,
      Permission.ROADMAP_VIEW,
      Permission.FEEDBACK_CREATE,
      Permission.FEEDBACK_VOTE,
    ],
    [Role.CLIENT]: [Permission.REVIEW_VIEW, Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT],
  };

  constructor(@Inject(RBAC_STORE) private readonly store: RbacStore) {}

  /**
   * Creates the indices and default roles before the app serves requests. If
   * Elasticsearch is down the app still starts: RBAC calls return 503 and
   * init is retried on the next call.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.ensureInitialized();
    } catch (error) {
      this.logger.warn(`RBAC not initialized yet, will retry on first use: ${(error as Error)?.message}`);
    }
  }

  /** Idempotent: safe to call from every instance on every start */
  ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      this.initialized = this.initialize().catch((error) => {
        this.initialized = null;
        throw error;
      });
    }
    return this.initialized;
  }

  private async initialize(): Promise<void> {
    await this.store.init();
    for (const [roleId, defaults] of Object.entries(this.defaultRoles) as [Role, Permission[]][]) {
      await this.applyDefaults(roleId, defaults);
    }
  }

  /** Creates a default role, or adds defaults it hasn't had yet without touching the rest */
  private async applyDefaults(roleId: Role, defaults: Permission[]): Promise<void> {
    const now = new Date().toISOString();
    const created = await this.store.createRole({
      id: roleId,
      name: this.formatRoleName(roleId),
      description: this.getRoleDescription(roleId),
      permissions: [...defaults],
      defaultsApplied: [...defaults],
      createdAt: now,
      updatedAt: now,
    });
    if (created) return;

    for (let attempt = 0; attempt < 3; attempt++) {
      const stored = await this.store.getRole(roleId);
      if (!stored) return;
      const role = stored.doc;
      const applied = new Set(
        role.defaultsApplied ?? defaults.filter((permission) => !PERMISSIONS_ADDED_LATER.includes(permission)),
      );
      const missing = defaults.filter((permission) => !applied.has(permission));
      if (missing.length === 0 && role.defaultsApplied) return;
      const permissions = new Set(role.permissions);
      missing.forEach((permission) => permissions.add(permission));
      try {
        await this.store.replaceRole(
          {
            ...role,
            permissions: [...permissions],
            defaultsApplied: [...new Set([...applied, ...defaults])],
            updatedAt: missing.length ? now : role.updatedAt,
          },
          stored.version,
        );
        if (missing.length) this.logger.log(`Added ${missing.join(', ')} to role ${roleId}`);
        return;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    this.logger.warn(`Role ${roleId} kept changing during init; its new default permissions were not added`);
  }

  private formatRoleName(roleId: string): string {
    return roleId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getRoleDescription(role: Role): string {
    const descriptions: Record<Role, string> = {
      [Role.DESIGNER]: 'Create and edit design components, tokens, and patterns. Submit reviews.',
      [Role.ART_DIRECTOR]: 'Oversee design work, approve components, and manage reviews.',
      [Role.CREATIVE_DIRECTOR]: 'Full design system access with approval and deletion capabilities.',
      [Role.DESIGN_SYSTEM_MANAGER]: 'Complete administrative access to all design system features.',
      [Role.REVIEW_MANAGER]: 'Manage review workflows, approvals, and review administration.',
      [Role.STYLE_MANAGER]: 'Manage design tokens, styles, and ensure design consistency.',
      [Role.DEVELOPER]: 'Develop and maintain components, tokens, and patterns. Access code quality and performance tools.',
      [Role.SYSTEM_OWNER]: 'Own and manage system-wide operations, governance, and technical infrastructure.',
      [Role.ACCESSIBILITY_AUDITOR]: 'Audit and ensure accessibility compliance across components and patterns.',
      [Role.CLIENT]: 'View design reviews shared with them, comment, and approve or reject at the client review stage.',
    };
    return descriptions[role] || '';
  }

  /** The API shape: stored roles without bookkeeping, and only known permissions */
  private toDefinition(role: RoleDoc): RoleDefinition {
    const { defaultsApplied, ...rest } = role;
    return { ...rest, permissions: role.permissions.filter(isPermission) };
  }

  async getRoles(): Promise<RoleDefinition[]> {
    await this.ensureInitialized();
    const roles = await this.store.listRoles();
    return roles.map((role) => this.toDefinition(role)).sort((a, b) => a.id.localeCompare(b.id));
  }

  /** The role, or null when there is no such role */
  async getRole(roleId: string): Promise<RoleDefinition | null> {
    await this.ensureInitialized();
    const stored = await this.store.getRole(roleId);
    return stored ? this.toDefinition(stored.doc) : null;
  }

  /** The role, or a 404 */
  async requireRole(roleId: string): Promise<RoleDefinition> {
    const role = await this.getRole(roleId);
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);
    return role;
  }

  /**
   * Replaces a role's permissions. `check` runs against the role as read, and
   * can veto the change (the last-admin rule) before anything is written.
   */
  async updateRole(
    roleId: string,
    permissions: string[],
    check?: (before: RoleDefinition, after: Permission[]) => Promise<void>,
  ): Promise<RoleDefinition> {
    const unknown = permissions.filter((permission) => !isPermission(permission));
    if (unknown.length) throw new BadRequestException(`Unknown permissions: ${unknown.join(', ')}`);
    const next = [...new Set(permissions)] as Permission[];
    await this.ensureInitialized();

    for (let attempt = 0; attempt < 3; attempt++) {
      const stored = await this.store.getRole(roleId);
      if (!stored) throw new NotFoundException(`Role ${roleId} not found`);
      if (check) await check(this.toDefinition(stored.doc), next);
      const updated: RoleDoc = { ...stored.doc, permissions: next, updatedAt: new Date().toISOString() };
      try {
        await this.store.replaceRole(updated, stored.version);
        return this.toDefinition(updated);
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException(`Role ${roleId} was changed by someone else, please try again`);
  }

  /** Assigns a role (idempotent). 404 for an unknown role; the caller checks the user exists. */
  async assignRoleToUser(userId: string, roleId: string, assignedBy?: string): Promise<UserRole> {
    await this.requireRole(roleId);
    const userRole: UserRole = { userId, roleId, assignedAt: new Date().toISOString(), assignedBy };
    await this.store.putAssignment(userRole);
    return userRole;
  }

  /** 404 when the user doesn't have the role */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.ensureInitialized();
    if (!(await this.store.deleteAssignment(userId, roleId))) {
      throw new NotFoundException(`User ${userId} does not have role ${roleId}`);
    }
  }

  async getUserRoles(userId: string): Promise<RoleDefinition[]> {
    const roleIds = (await this.getRoleIdsByUser([userId])).get(userId) ?? [];
    if (roleIds.length === 0) return [];
    const roles = await this.getRoles();
    return roles.filter((role) => roleIds.includes(role.id));
  }

  /** Role ids per user, for many users at once */
  async getRoleIdsByUser(userIds: string[]): Promise<Map<string, string[]>> {
    await this.ensureInitialized();
    const result = new Map<string, string[]>(userIds.map((id) => [id, []]));
    if (userIds.length === 0) return result;
    for (const assignment of await this.store.assignmentsForUsers(userIds)) {
      result.get(assignment.userId)?.push(assignment.roleId);
    }
    for (const ids of result.values()) ids.sort();
    return result;
  }

  /** Ids of users with the role. 404 for an unknown role. */
  async getUsersWithRole(roleId: string): Promise<string[]> {
    await this.requireRole(roleId);
    const assignments = await this.store.assignmentsForRoles([roleId]);
    return [...new Set(assignments.map((assignment) => assignment.userId))];
  }

  /** Assignments that grant a permission, given role permissions (the stored ones by default) */
  async getAssignmentsWithPermission(permission: Permission, roles?: RoleDefinition[]): Promise<UserRole[]> {
    const roleIds = (roles ?? (await this.getRoles()))
      .filter((role) => role.permissions.includes(permission))
      .map((role) => role.id);
    if (roleIds.length === 0) return [];
    return this.store.assignmentsForRoles(roleIds);
  }

  /** Role ids and the union of their permissions */
  async getAccess(userId: string): Promise<{ roles: string[]; permissions: Permission[] }> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<Permission>();
    roles.forEach((role) => role.permissions.forEach((permission) => permissions.add(permission)));
    return { roles: roles.map((role) => role.id), permissions: [...permissions].sort() };
  }

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    return (await this.getAccess(userId)).permissions.includes(permission);
  }

  /** Every permission in the enum, with a label and category */
  getAllPermissions(): { value: Permission; label: string; category: string }[] {
    return ALL_PERMISSIONS.map((value) => ({
      value,
      label: PERMISSION_LABELS[value],
      category: PERMISSION_CATEGORIES[value.split(':')[0]] ?? 'Other',
    }));
  }
}
