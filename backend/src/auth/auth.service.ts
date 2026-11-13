import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { KeyManagementService } from '../common/security/key-management.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { ALL_PERMISSIONS, Permission, isPermission } from '../rbac/rbac.service';
import { LOCKOUT_MS, LoginLockout } from './login-lockout';
import { AuthPrincipal, ServicePrincipal, UserPrincipal } from './principal';
import { TokenService } from './token.service';
import { Me, normalizeEmail } from './user.types';
import { AuthState, UsersService, assertPasswordPolicy, hashPassword } from './users.service';

const INVALID_CREDENTIALS = 'Invalid email or password';
/** 423 Locked (not in this version of Nest's HttpStatus) */
const HTTP_LOCKED = 423;

/**
 * What an API key without scopes may do: read everything, and create
 * components, reviews and feedback (docs/AUTH.md)
 */
export const DEFAULT_SERVICE_PERMISSIONS: readonly Permission[] = [
  ...ALL_PERMISSIONS.filter((permission) => permission.endsWith(':view')),
  Permission.COMPONENT_CREATE,
  Permission.REVIEW_CREATE,
  Permission.FEEDBACK_CREATE,
];

export interface RequestInfo {
  ip?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  expiresAt: string;
  user: Me;
}

export function toMe(principal: AuthPrincipal): Me {
  return {
    id: principal.id,
    type: principal.type,
    email: principal.email,
    name: principal.name,
    roles: [...principal.roles],
    permissions: [...principal.permissions].sort(),
    mustChangePassword: principal.mustChangePassword,
  };
}

function toUserPrincipal(state: AuthState): UserPrincipal {
  return {
    type: 'user',
    id: state.user.id,
    email: state.user.email,
    name: state.user.name,
    roles: state.roles,
    permissions: new Set(state.permissions),
    mustChangePassword: state.user.mustChangePassword,
  };
}

/** Sign-in, sign-out and password changes, and turning a bearer credential into a principal */
@Injectable()
export class AuthService {
  readonly lockout = new LoginLockout();
  private dummyHash: Promise<string> | null = null;

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly keys: KeyManagementService,
    private readonly audit: SecurityAuditService,
  ) {}

  async login(rawEmail: string, password: string, info: RequestInfo = {}): Promise<LoginResult> {
    const email = normalizeEmail(rawEmail);
    // Retries the bootstrap admin if Elasticsearch was down at startup
    await this.users.ensureBootstrapped().catch(() => undefined);

    const lockedUntil = this.lockout.lockedUntil(email);
    if (lockedUntil) {
      this.logFailure(email, 'locked', info);
      throw this.lockedError(lockedUntil);
    }

    const user = await this.users.findByEmail(email);
    // Compare against a dummy hash for unknown emails, so timing doesn't reveal which exist
    const matches = await bcrypt.compare(password, user?.passwordHash ?? (await this.getDummyHash()));
    if (!user || !matches || user.status !== 'active') {
      const reason = !user ? 'unknown email' : !matches ? 'wrong password' : 'user disabled';
      this.logFailure(email, reason, info, user?.id);
      if (this.lockout.recordFailure(email)) {
        void this.audit
          .logAccountEvent(
            'account_locked',
            `Sign-in for ${email} locked for ${LOCKOUT_MS / 60000} minutes after repeated failures`,
            user?.id,
            { email },
            info.ip,
            info.userAgent,
          )
          .catch(() => undefined);
      }
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    this.lockout.clear(email);
    const updated = await this.users.mutate(user.id, (doc) => {
      doc.lastLoginAt = new Date().toISOString();
    });
    const token = await this.tokens.issue({ sub: updated.id, tv: updated.tokenVersion });
    void this.audit.logAuthSuccess(updated.id, info.ip, info.userAgent, { email }).catch(() => undefined);
    return { ...token, user: toMe(toUserPrincipal(await this.users.getAuthState(updated.id))) };
  }

  /** Revokes every token the user has (bumps tokenVersion) */
  async logout(principal: UserPrincipal, info: RequestInfo = {}): Promise<void> {
    await this.users.mutate(principal.id, (doc) => {
      doc.tokenVersion += 1;
    });
    void this.audit
      .logAccountEvent('logout', `${principal.email} signed out`, principal.id, { targetUserId: principal.id }, info.ip, info.userAgent)
      .catch(() => undefined);
  }

  /** Clears mustChangePassword and revokes every token, so the client signs in again */
  async changePassword(principal: UserPrincipal, currentPassword: string, newPassword: string, info: RequestInfo = {}): Promise<void> {
    assertPasswordPolicy(newPassword);
    const lockedUntil = this.lockout.lockedUntil(principal.email);
    if (lockedUntil) throw this.lockedError(lockedUntil);
    const user = await this.users.findById(principal.id);
    if (!user) throw new UnauthorizedException('Sign in required');
    // 400, not 401: a 401 signs the client out (docs/AUTH.md)
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      this.lockout.recordFailure(user.email);
      this.logFailure(user.email, 'wrong current password on password change', info, user.id);
      throw new BadRequestException('Current password is incorrect');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('The new password must be different from the current one');
    }
    const passwordHash = await hashPassword(newPassword);
    await this.users.mutate(user.id, (doc) => {
      doc.passwordHash = passwordHash;
      doc.mustChangePassword = false;
      doc.tokenVersion += 1;
    });
    void this.audit
      .logAccountEvent('password_changed', `${user.email} changed their password`, user.id, { targetUserId: user.id, change: 'self' }, info.ip, info.userAgent)
      .catch(() => undefined);
  }

  /**
   * The principal for a bearer credential (docs/AUTH.md), or null when it is
   * not valid. Keys are checked first: they're cheap, and a key can't be
   * mistaken for a token.
   */
  async resolve(credential: string | undefined): Promise<AuthPrincipal | null> {
    if (!credential) return null;
    if (this.keys.isAdminKey(credential)) {
      return this.service('admin-key', 'Admin API key', ALL_PERMISSIONS);
    }
    const key = this.keys.resolveApiKey(credential);
    if (key) {
      const scoped = (key.scopes ?? []).filter(isPermission);
      return this.service(key.id, key.name, key.scopes?.length ? scoped : DEFAULT_SERVICE_PERMISSIONS);
    }
    const claims = await this.tokens.verify(credential);
    if (!claims) return null;
    const state = await this.users.getAuthState(claims.sub);
    if (!state || state.user.status !== 'active' || state.user.tokenVersion !== claims.tv) return null;
    return toUserPrincipal(state);
  }

  private service(id: string, name: string, permissions: readonly string[]): ServicePrincipal {
    return { type: 'service', id, name, email: null, roles: [], permissions: new Set(permissions), mustChangePassword: false };
  }

  private lockedError(until: Date): HttpException {
    const minutes = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
    return new HttpException(
      { statusCode: HTTP_LOCKED, message: `Too many failed sign-ins. Try again in ${minutes} minutes.`, lockedUntil: until.toISOString() },
      HTTP_LOCKED,
    );
  }

  private logFailure(email: string, reason: string, info: RequestInfo, userId?: string): void {
    void this.audit.logAuthFailure(userId, reason, info.ip, info.userAgent, { email }).catch(() => undefined);
  }

  private getDummyHash(): Promise<string> {
    if (!this.dummyHash) this.dummyHash = hashPassword('not-a-real-password-for-timing');
    return this.dummyHash;
  }
}
