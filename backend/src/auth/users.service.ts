import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission, RbacService, Role, RoleDefinition } from '../rbac/rbac.service';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { AuthPrincipal } from './principal';
import {
  MIN_PASSWORD_LENGTH,
  PublicUser,
  USER_STORE,
  UserDoc,
  UserStatus,
  UserSummary,
  normalizeEmail,
  toPublicUser,
  userIdForEmail,
} from './user.types';

/** Lower in tests, where bcryptjs at full cost makes suites slow */
const BCRYPT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;
/** bcrypt ignores everything after 72 bytes */
const MAX_PASSWORD_BYTES = 72;
/** How long a user's record and permissions are reused before reloading (docs/AUTH.md) */
export const AUTH_CACHE_MS = 30_000;

/** What the AuthGuard needs about a user on each request */
export interface AuthState {
  user: UserDoc;
  roles: string[];
  permissions: Permission[];
}

export function assertPasswordPolicy(password: string): void {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestException(`Passwords must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new BadRequestException(`Passwords must be at most ${MAX_PASSWORD_BYTES} bytes`);
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Who did it, for audit records */
function actorId(actor: AuthPrincipal | 'bootstrap'): string {
  return actor === 'bootstrap' ? 'bootstrap' : actor.id;
}

/**
 * People who can sign in (docs/AUTH.md), stored in `design-system-users`, and
 * the role changes that need to know about them (the last-admin rule).
 */
@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly cache = new Map<string, { state: AuthState | null; expires: number }>();
  private bootstrapped: Promise<void> | null = null;

  constructor(
    @Inject(USER_STORE) private readonly store: DocumentStore<UserDoc>,
    private readonly rbac: RbacService,
    private readonly audit: SecurityAuditService,
  ) {}

  /** Creates the first admin once RBAC roles exist. Never blocks startup. */
  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBootstrapped();
    } catch (error) {
      this.logger.warn(`Could not check for a bootstrap admin yet, will retry on sign-in: ${(error as Error)?.message}`);
    }
  }

  /** Runs the bootstrap once per process; retried after a failure */
  ensureBootstrapped(): Promise<void> {
    if (!this.bootstrapped) {
      this.bootstrapped = this.bootstrapAdmin().catch((error) => {
        this.bootstrapped = null;
        throw error;
      });
    }
    return this.bootstrapped;
  }

  /**
   * When there are no users, creates one from BOOTSTRAP_ADMIN_EMAIL and
   * BOOTSTRAP_ADMIN_PASSWORD with the design_system_manager role. The role is
   * assigned first, so a crash in between leaves nothing half made: the next
   * start sees no users and finishes the job. The id comes from the email,
   * so instances starting together create one user between them.
   */
  async bootstrapAdmin(): Promise<void> {
    await this.rbac.ensureInitialized();
    const existing = await this.store.list({ excludes: ['passwordHash'] });
    if (existing.length > 0) return;

    const rawEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!rawEmail || !password) {
      this.logger.warn(
        'No users exist. Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (12+ characters) and restart ' +
          'to create the first admin, who must change the password on first sign-in.',
      );
      return;
    }
    if (!rawEmail.includes('@')) {
      this.logger.error('BOOTSTRAP_ADMIN_EMAIL is not an email address; no admin was created');
      return;
    }
    try {
      assertPasswordPolicy(password);
    } catch (error) {
      this.logger.error(`BOOTSTRAP_ADMIN_PASSWORD rejected: ${(error as Error).message}; no admin was created`);
      return;
    }

    const email = normalizeEmail(rawEmail);
    const id = userIdForEmail(email);
    await this.rbac.assignRoleToUser(id, Role.DESIGN_SYSTEM_MANAGER, 'bootstrap');
    const now = new Date().toISOString();
    try {
      await this.store.create({
        id,
        email,
        name: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'Administrator',
        passwordHash: await hashPassword(password),
        status: 'active',
        mustChangePassword: true,
        tokenVersion: 0,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof DuplicateDocumentError) return; // another instance got there first
      throw error;
    }
    this.logger.log(`Created bootstrap admin ${email}; they must change the password on first sign-in`);
    void this.audit
      .logAccountEvent('user_changed', `Bootstrap admin ${email} created`, 'bootstrap', {
        targetUserId: id,
        change: 'created',
        roles: [Role.DESIGN_SYSTEM_MANAGER],
      })
      .catch(() => undefined);
  }

  // ---- Lookups ----

  async findById(id: string): Promise<UserDoc | null> {
    return (await this.store.get(id))?.doc ?? null;
  }

  async findByEmail(email: string): Promise<UserDoc | null> {
    const user = await this.findById(userIdForEmail(email));
    return user && user.email === normalizeEmail(email) ? user : null;
  }

  /** The user and their permissions, cached for 30 seconds. Null for an unknown user. */
  async getAuthState(userId: string): Promise<AuthState | null> {
    const cached = this.cache.get(userId);
    if (cached && cached.expires > Date.now()) return cached.state;
    const user = await this.findById(userId);
    const state = user ? { user, ...(await this.rbac.getAccess(userId)) } : null;
    this.cache.set(userId, { state, expires: Date.now() + AUTH_CACHE_MS });
    if (this.cache.size > 10_000) this.cache.delete(this.cache.keys().next().value as string);
    return state;
  }

  /** Drops cached auth state, for one user or (after a role's permissions change) everyone */
  invalidate(userId?: string): void {
    if (userId) this.cache.delete(userId);
    else this.cache.clear();
  }

  async list(filter: { q?: string; status?: UserStatus } = {}): Promise<{ users: PublicUser[]; total: number }> {
    const q = filter.q?.trim().toLowerCase();
    const docs = (await this.store.list({ excludes: ['passwordHash'] }))
      .filter((user) => !filter.status || user.status === filter.status)
      .filter((user) => !q || user.email.includes(q) || user.name.toLowerCase().includes(q))
      .sort((a, b) => a.email.localeCompare(b.email));
    const roles = await this.rbac.getRoleIdsByUser(docs.map((user) => user.id));
    const users = docs.map((user) => toPublicUser(user, roles.get(user.id) ?? []));
    return { users, total: users.length };
  }

  async get(id: string): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  /** id, email and name for each id; ids without a user are left out */
  async summaries(ids: string[]): Promise<UserSummary[]> {
    const users = await Promise.all(ids.map((id) => this.findById(id)));
    return users.filter((user): user is UserDoc => !!user).map(({ id, email, name }) => ({ id, email, name }));
  }

  // ---- Changes ----

  async create(
    input: { email: string; name: string; password: string; roles?: string[] },
    actor: AuthPrincipal,
  ): Promise<PublicUser> {
    assertPasswordPolicy(input.password);
    const email = normalizeEmail(input.email);
    const roleIds = [...new Set(input.roles ?? [])];
    const known = new Set((await this.rbac.getRoles()).map((role) => role.id));
    const unknown = roleIds.filter((roleId) => !known.has(roleId));
    if (unknown.length) throw new BadRequestException(`Unknown roles: ${unknown.join(', ')}`);

    const now = new Date().toISOString();
    const user: UserDoc = {
      id: userIdForEmail(email),
      email,
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      status: 'active',
      mustChangePassword: true,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.store.create(user);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException('A user with that email already exists');
      throw error;
    }
    for (const roleId of roleIds) {
      await this.rbac.assignRoleToUser(user.id, roleId, actor.id);
    }
    this.invalidate(user.id);
    this.logAccount('user_changed', `User ${email} created`, actor, { targetUserId: user.id, change: 'created', roles: roleIds });
    return toPublicUser(user, roleIds.sort());
  }

  async update(id: string, patch: { name?: string; status?: UserStatus }, actor: AuthPrincipal): Promise<PublicUser> {
    const current = await this.findById(id);
    if (!current) throw new NotFoundException('User not found');
    if (patch.status === 'disabled' && current.status !== 'disabled') {
      if (actor.type === 'user' && actor.id === id) throw new ConflictException('You cannot disable yourself');
      await this.assertAdminRemains({ disableUser: id });
    }
    const updated = await this.mutate(id, (user) => {
      if (patch.name !== undefined) user.name = patch.name.trim();
      if (patch.status !== undefined && patch.status !== user.status) {
        user.status = patch.status;
        // Signs the user out everywhere when disabled
        if (patch.status === 'disabled') user.tokenVersion += 1;
      }
    });
    this.logAccount('user_changed', `User ${updated.email} updated`, actor, {
      targetUserId: id,
      change: 'updated',
      fields: Object.keys(patch),
      status: updated.status,
    });
    return this.toPublic(updated);
  }

  async resetPassword(id: string, password: string, actor: AuthPrincipal): Promise<void> {
    assertPasswordPolicy(password);
    const passwordHash = await hashPassword(password);
    const user = await this.mutate(id, (doc) => {
      doc.passwordHash = passwordHash;
      doc.mustChangePassword = true;
      doc.tokenVersion += 1;
    });
    this.logAccount('password_changed', `Password reset for ${user.email}`, actor, { targetUserId: id, change: 'reset' });
  }

  /**
   * Read-modify-write with optimistic concurrency, retried on a conflict.
   * 404 for an unknown user. Drops the cached auth state.
   */
  async mutate(id: string, change: (user: UserDoc) => void): Promise<UserDoc> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('User not found');
      const user = stored.doc;
      change(user);
      user.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(user, stored.version);
        this.invalidate(id);
        return user;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The user was changed by someone else, please try again');
  }

  // ---- Roles ----

  async assignRole(userId: string, roleId: string, actor: AuthPrincipal) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const assignment = await this.rbac.assignRoleToUser(userId, roleId, actor.id);
    this.invalidate(userId);
    this.logAccount('role_changed', `Role ${roleId} assigned to ${user.email}`, actor, {
      targetUserId: userId,
      roleId,
      change: 'assigned',
    });
    return assignment;
  }

  async removeRole(userId: string, roleId: string, actor: AuthPrincipal): Promise<void> {
    await this.rbac.requireRole(roleId);
    await this.assertAdminRemains({ removeAssignment: { userId, roleId } });
    await this.rbac.removeRoleFromUser(userId, roleId);
    this.invalidate(userId);
    this.logAccount('role_changed', `Role ${roleId} removed from ${userId}`, actor, {
      targetUserId: userId,
      roleId,
      change: 'removed',
    });
  }

  async updateRolePermissions(roleId: string, permissions: string[], actor: AuthPrincipal): Promise<RoleDefinition> {
    const role = await this.rbac.updateRole(roleId, permissions, async (_before, after) => {
      await this.assertAdminRemains({ rolePermissions: { roleId, permissions: after } });
    });
    this.invalidate();
    this.logAccount('role_changed', `Permissions of role ${roleId} changed`, actor, {
      roleId,
      permissions: role.permissions,
      change: 'permissions',
    });
    return role;
  }

  /**
   * 409 if a change would leave no active user with admin:rbac (nobody could
   * manage roles any more). Changes when there is already no such user pass.
   */
  async assertAdminRemains(change: {
    disableUser?: string;
    removeAssignment?: { userId: string; roleId: string };
    rolePermissions?: { roleId: string; permissions: Permission[] };
  }): Promise<void> {
    const roles = await this.rbac.getRoles();
    const before = await this.activeAdmins(roles, {});
    if (before.size === 0) return;
    const after = await this.activeAdmins(
      change.rolePermissions
        ? roles.map((role) =>
            role.id === change.rolePermissions.roleId ? { ...role, permissions: change.rolePermissions.permissions } : role,
          )
        : roles,
      change,
    );
    if (after.size === 0) {
      throw new ConflictException(`This would leave no active user with ${Permission.ADMIN_RBAC}`);
    }
  }

  private async activeAdmins(
    roles: RoleDefinition[],
    change: { disableUser?: string; removeAssignment?: { userId: string; roleId: string } },
  ): Promise<Set<string>> {
    const assignments = await this.rbac.getAssignmentsWithPermission(Permission.ADMIN_RBAC, roles);
    const candidates = new Set(
      assignments
        .filter(
          (a) =>
            !(change.removeAssignment && a.userId === change.removeAssignment.userId && a.roleId === change.removeAssignment.roleId),
        )
        .map((a) => a.userId)
        .filter((userId) => userId !== change.disableUser),
    );
    const users = await Promise.all([...candidates].map((id) => this.findById(id)));
    return new Set(users.filter((user) => user?.status === 'active').map((user) => user.id));
  }

  private async toPublic(user: UserDoc): Promise<PublicUser> {
    const roles = await this.rbac.getRoleIdsByUser([user.id]);
    return toPublicUser(user, roles.get(user.id) ?? []);
  }

  private logAccount(
    type: Parameters<SecurityAuditService['logAccountEvent']>[0],
    description: string,
    actor: AuthPrincipal | 'bootstrap',
    metadata: Record<string, unknown>,
  ): void {
    void this.audit.logAccountEvent(type, description, actorId(actor), metadata).catch(() => undefined);
  }
}
