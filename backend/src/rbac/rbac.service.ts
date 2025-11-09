import { Injectable, Optional, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

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
  ADMIN_CODE_QUALITY = 'admin:code_quality',
  ADMIN_VULNERABILITY_SCANNER = 'admin:vulnerability_scanner',
  ADMIN_PERFORMANCE_ANALYSIS = 'admin:performance_analysis',
  
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
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy?: string;
}

@Injectable()
export class RbacService {
  private readonly indexPrefix = 'design-system-rbac';
  
  // Default role definitions with permissions
  private readonly defaultRoles: Record<Role, Permission[]> = {
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
      Permission.ADMIN_CODE_QUALITY,
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
      Permission.ADMIN_CODE_QUALITY,
      Permission.ADMIN_VULNERABILITY_SCANNER,
      Permission.ADMIN_PERFORMANCE_ANALYSIS,
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
  };

  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
  ) {
    // Initialize default roles on service creation (async, don't await)
    this.initializeDefaultRoles().catch(err => {
      console.error('Failed to initialize default roles:', err);
    });
  }

  private async initializeDefaultRoles() {
    if (!this.elasticsearchService) {
      console.warn('ElasticsearchService not available, using in-memory RBAC');
      return;
    }

    try {
      for (const [roleId, permissions] of Object.entries(this.defaultRoles)) {
        const role: RoleDefinition = {
          id: roleId,
          name: this.formatRoleName(roleId),
          description: this.getRoleDescription(roleId as Role),
          permissions,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await this.elasticsearchService.index({
          index: `${this.indexPrefix}-roles`,
          id: roleId,
          document: role,
          op_type: 'create', // Only create if doesn't exist
        }).catch(() => {
          // Role already exists, ignore
        });
      }
    } catch (error) {
      console.error('Failed to initialize default roles:', error);
    }
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
    };
    return descriptions[role] || '';
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<RoleDefinition[]> {
    if (!this.elasticsearchService) {
      // Return default roles from memory
      return Object.entries(this.defaultRoles).map(([roleId, permissions]) => ({
        id: roleId,
        name: this.formatRoleName(roleId),
        description: this.getRoleDescription(roleId as Role),
        permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    try {
      const result = await this.elasticsearchService.search<RoleDefinition>({
        index: `${this.indexPrefix}-roles`,
        query: { match_all: {} },
        size: 100,
      });

      return result.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error('Failed to get roles:', error);
      return [];
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRole(roleId: string): Promise<RoleDefinition | null> {
    if (!this.elasticsearchService) {
      if (this.defaultRoles[roleId as Role]) {
        return {
          id: roleId,
          name: this.formatRoleName(roleId),
          description: this.getRoleDescription(roleId as Role),
          permissions: this.defaultRoles[roleId as Role],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }

    try {
      const result = await this.elasticsearchService.get<RoleDefinition>({
        index: `${this.indexPrefix}-roles`,
        id: roleId,
      });

      return result._source;
    } catch (error) {
      console.error(`Failed to get role ${roleId}:`, error);
      return null;
    }
  }

  /**
   * Update role permissions
   */
  async updateRole(roleId: string, permissions: Permission[]): Promise<RoleDefinition> {
    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const updatedRole: RoleDefinition = {
      ...role,
      permissions,
      updatedAt: new Date(),
    };

    if (!this.elasticsearchService) {
      console.warn('ElasticsearchService not available, role update not persisted');
      return updatedRole;
    }

    try {
      await this.elasticsearchService.index({
        index: `${this.indexPrefix}-roles`,
        id: roleId,
        document: updatedRole,
      });

      return updatedRole;
    } catch (error) {
      console.error(`Failed to update role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string, assignedBy?: string): Promise<UserRole> {
    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const userRole: UserRole = {
      userId,
      roleId,
      assignedAt: new Date(),
      assignedBy,
    };

    if (!this.elasticsearchService) {
      console.warn('ElasticsearchService not available, role assignment not persisted');
      return userRole;
    }

    try {
      await this.elasticsearchService.index({
        index: `${this.indexPrefix}-user-roles`,
        id: `${userId}-${roleId}`,
        document: userRole,
      });

      return userRole;
    } catch (error) {
      console.error(`Failed to assign role to user:`, error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    if (!this.elasticsearchService) {
      console.warn('ElasticsearchService not available, role removal not persisted');
      return;
    }

    try {
      await this.elasticsearchService.delete({
        index: `${this.indexPrefix}-user-roles`,
        id: `${userId}-${roleId}`,
      });
    } catch (error) {
      console.error(`Failed to remove role from user:`, error);
      throw error;
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<RoleDefinition[]> {
    if (!this.elasticsearchService) {
      return [];
    }

    try {
      const result = await this.elasticsearchService.search<UserRole>({
        index: `${this.indexPrefix}-user-roles`,
        query: {
          term: { userId },
        },
        size: 100,
      });

      const roleIds = result.hits.hits.map(hit => hit._source.roleId);
      const roles = await Promise.all(roleIds.map(id => this.getRole(id)));
      
      return roles.filter((role): role is RoleDefinition => role !== null);
    } catch (error) {
      console.error(`Failed to get user roles:`, error);
      return [];
    }
  }

  /**
   * Get all users with a specific role
   */
  async getUsersWithRole(roleId: string): Promise<string[]> {
    if (!this.elasticsearchService) {
      return [];
    }

    try {
      const result = await this.elasticsearchService.search<UserRole>({
        index: `${this.indexPrefix}-user-roles`,
        query: {
          term: { roleId },
        },
        size: 1000,
      });

      return result.hits.hits.map(hit => hit._source.userId);
    } catch (error) {
      console.error(`Failed to get users with role:`, error);
      return [];
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      if (role.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): { value: Permission; label: string; category: string }[] {
    return [
      // Component permissions
      { value: Permission.COMPONENT_VIEW, label: 'View Components', category: 'Components' },
      { value: Permission.COMPONENT_CREATE, label: 'Create Components', category: 'Components' },
      { value: Permission.COMPONENT_EDIT, label: 'Edit Components', category: 'Components' },
      { value: Permission.COMPONENT_DELETE, label: 'Delete Components', category: 'Components' },
      { value: Permission.COMPONENT_APPROVE, label: 'Approve Components', category: 'Components' },
      
      // Token permissions
      { value: Permission.TOKEN_VIEW, label: 'View Tokens', category: 'Design Tokens' },
      { value: Permission.TOKEN_CREATE, label: 'Create Tokens', category: 'Design Tokens' },
      { value: Permission.TOKEN_EDIT, label: 'Edit Tokens', category: 'Design Tokens' },
      { value: Permission.TOKEN_DELETE, label: 'Delete Tokens', category: 'Design Tokens' },
      
      // Pattern permissions
      { value: Permission.PATTERN_VIEW, label: 'View Patterns', category: 'Patterns' },
      { value: Permission.PATTERN_CREATE, label: 'Create Patterns', category: 'Patterns' },
      { value: Permission.PATTERN_EDIT, label: 'Edit Patterns', category: 'Patterns' },
      { value: Permission.PATTERN_DELETE, label: 'Delete Patterns', category: 'Patterns' },
      
      // Review permissions
      { value: Permission.REVIEW_VIEW, label: 'View Reviews', category: 'Reviews' },
      { value: Permission.REVIEW_CREATE, label: 'Create Reviews', category: 'Reviews' },
      { value: Permission.REVIEW_APPROVE, label: 'Approve Reviews', category: 'Reviews' },
      { value: Permission.REVIEW_REJECT, label: 'Reject Reviews', category: 'Reviews' },
      { value: Permission.REVIEW_ADMIN, label: 'Review Administration', category: 'Reviews' },
      
      // Admin permissions
      { value: Permission.ADMIN_SYSTEM_HEALTH, label: 'System Health', category: 'Administration' },
      { value: Permission.ADMIN_GOVERNANCE, label: 'Governance', category: 'Administration' },
      { value: Permission.ADMIN_AUDIT, label: 'Audit Logs', category: 'Administration' },
      { value: Permission.ADMIN_BANNERS, label: 'Site Banners', category: 'Administration' },
      { value: Permission.ADMIN_RBAC, label: 'Role Management', category: 'Administration' },
      { value: Permission.ADMIN_CODE_QUALITY, label: 'Code Quality', category: 'Administration' },
      { value: Permission.ADMIN_VULNERABILITY_SCANNER, label: 'Vulnerability Scanner', category: 'Administration' },
      
      // Roadmap & Feedback permissions
      { value: Permission.ROADMAP_VIEW, label: 'View Roadmap', category: 'Roadmap & Feedback' },
      { value: Permission.ROADMAP_EDIT, label: 'Edit Roadmap', category: 'Roadmap & Feedback' },
      { value: Permission.FEEDBACK_CREATE, label: 'Create Feedback', category: 'Roadmap & Feedback' },
      { value: Permission.FEEDBACK_VOTE, label: 'Vote on Feedback', category: 'Roadmap & Feedback' },
      
      // Style permissions
      { value: Permission.STYLE_MANAGE, label: 'Manage Styles', category: 'Style' },
      { value: Permission.STYLE_APPROVE, label: 'Approve Styles', category: 'Style' },
      
      // Design permissions
      { value: Permission.DESIGN_CREATE, label: 'Create Designs', category: 'Design' },
      { value: Permission.DESIGN_EDIT, label: 'Edit Designs', category: 'Design' },
      { value: Permission.DESIGN_APPROVE, label: 'Approve Designs', category: 'Design' },
    ];
  }
}

