import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';
import { Permission, Role } from '../rbac/rbac.service';
import { LOCKOUT_MS } from './login-lockout';
import { ADMIN_EMAIL, ADMIN_PASSWORD, AuthHarness, createAuthHarness } from './testing/harness';

async function statusOf(promise: Promise<unknown>): Promise<number | 'ok'> {
  try {
    await promise;
    return 'ok';
  } catch (error) {
    if (error instanceof HttpException) return error.getStatus();
    throw error;
  }
}

describe('AuthService', () => {
  let h: AuthHarness;

  beforeEach(async () => {
    h = await createAuthHarness();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    h.restoreEnv();
  });

  describe('login', () => {
    it('returns a token and the user, and the token resolves to that user', async () => {
      const result = await h.auth.login('  Admin@Example.com ', ADMIN_PASSWORD);
      expect(result.accessToken).toEqual(expect.any(String));
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now() + 7.9 * 3600 * 1000);
      expect(result.user).toMatchObject({
        type: 'user',
        email: ADMIN_EMAIL,
        roles: [Role.DESIGN_SYSTEM_MANAGER],
        mustChangePassword: true,
      });
      expect(result.user.permissions).toEqual(expect.arrayContaining([Permission.ADMIN_RBAC, Permission.ADMIN_USERS]));
      expect(result.user).not.toHaveProperty('passwordHash');

      const principal = await h.auth.resolve(result.accessToken);
      expect(principal).toMatchObject({ type: 'user', id: result.user.id, email: ADMIN_EMAIL });
      expect((await h.users.findById(result.user.id)).lastLoginAt).toEqual(expect.any(String));
      expect(h.audit.logAuthSuccess).toHaveBeenCalled();
    });

    it('gives the same 401 for a wrong password and an unknown email', async () => {
      const wrong = await h.auth.login(ADMIN_EMAIL, 'not the password!!').catch((e) => e);
      const unknown = await h.auth.login('nobody@example.com', 'not the password!!').catch((e) => e);
      expect(wrong).toBeInstanceOf(UnauthorizedException);
      expect(unknown).toBeInstanceOf(UnauthorizedException);
      expect(wrong.message).toBe(unknown.message);
      expect(h.audit.logAuthFailure).toHaveBeenCalledTimes(2);
    });

    it('locks an email for 15 minutes after 5 failures, even for the right password', async () => {
      for (let i = 0; i < 5; i++) {
        expect(await statusOf(h.auth.login(ADMIN_EMAIL, 'wrong password ' + i))).toBe(401);
      }
      expect(h.audit.logAccountEvent).toHaveBeenCalledWith('account_locked', expect.any(String), expect.any(String), expect.anything(), undefined, undefined);
      expect(await statusOf(h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD))).toBe(423);

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now + LOCKOUT_MS + 1000);
      expect(await statusOf(h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD))).toBe('ok');
    });

    it('locks unknown emails the same way', async () => {
      for (let i = 0; i < 5; i++) await statusOf(h.auth.login('ghost@example.com', 'whatever-password'));
      expect(await statusOf(h.auth.login('ghost@example.com', 'whatever-password'))).toBe(423);
    });

    it('a success resets the failure count', async () => {
      for (let i = 0; i < 4; i++) await statusOf(h.auth.login(ADMIN_EMAIL, 'wrong password'));
      expect(await statusOf(h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD))).toBe('ok');
      for (let i = 0; i < 4; i++) await statusOf(h.auth.login(ADMIN_EMAIL, 'wrong password'));
      expect(await statusOf(h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD))).toBe('ok');
    });

    it('rejects disabled users, and their existing tokens', async () => {
      const { user, password, accessToken } = await h.createUser('dana@example.com', [Role.DESIGNER]);
      const admin = await h.principalFor('test-admin-key');
      await h.users.update(user.id, { status: 'disabled' }, admin);
      expect(await h.auth.resolve(accessToken)).toBeNull();
      expect(await statusOf(h.auth.login('dana@example.com', password))).toBe(401);
    });
  });

  describe('tokens', () => {
    it('stops accepting every token once tokenVersion is bumped (logout)', async () => {
      const { accessToken } = await h.createUser('erin@example.com');
      const second = (await h.auth.login('erin@example.com', 'a long enough password')).accessToken;
      const principal = await h.principalFor(accessToken);
      await h.auth.logout(principal as any);
      expect(await h.auth.resolve(accessToken)).toBeNull();
      expect(await h.auth.resolve(second)).toBeNull();
    });

    it('rejects a token whose tokenVersion was bumped by another instance once the cache expires', async () => {
      const { user, accessToken } = await h.createUser('fay@example.com');
      await h.auth.resolve(accessToken); // cached
      const stored = h.userStore.docs.get(user.id);
      h.userStore.forceWrite({ ...stored.doc, tokenVersion: stored.doc.tokenVersion + 1 });
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now + 31_000);
      expect(await h.auth.resolve(accessToken)).toBeNull();
    });

    it('rejects garbage and tokens signed with another secret', async () => {
      expect(await h.auth.resolve('not-a-token')).toBeNull();
      expect(await h.auth.resolve(undefined)).toBeNull();
      const forged =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfeCIsInR2IjowfQ.' + 'x'.repeat(43);
      expect(await h.auth.resolve(forged)).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('needs the current password (400, not 401), then revokes tokens and clears mustChangePassword', async () => {
      const { accessToken } = await h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      const principal = (await h.principalFor(accessToken)) as any;
      await expect(h.auth.changePassword(principal, 'wrong current pw', 'a brand new password')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(h.auth.changePassword(principal, ADMIN_PASSWORD, 'short')).rejects.toBeInstanceOf(BadRequestException);

      await h.auth.changePassword(principal, ADMIN_PASSWORD, 'a brand new password');
      expect(await h.auth.resolve(accessToken)).toBeNull();
      expect(await statusOf(h.auth.login(ADMIN_EMAIL, ADMIN_PASSWORD))).toBe(401);
      const again = await h.auth.login(ADMIN_EMAIL, 'a brand new password');
      expect(again.user.mustChangePassword).toBe(false);
      expect(h.audit.logAccountEvent).toHaveBeenCalledWith('password_changed', expect.any(String), principal.id, expect.anything(), undefined, undefined);
    });
  });

  describe('API keys', () => {
    it('gives the admin key every permission', async () => {
      const principal = await h.principalFor('test-admin-key');
      expect(principal).toMatchObject({ type: 'service', id: 'admin-key' });
      expect(principal.permissions.has(Permission.ADMIN_USERS)).toBe(true);
      expect(principal.permissions.has(Permission.ADMIN_RBAC)).toBe(true);
    });

    it('gives unscoped keys the default service set', async () => {
      const principal = await h.principalFor('test-api-key');
      expect(principal.type).toBe('service');
      expect([...principal.permissions].sort()).toEqual(
        [
          ...Object.values(Permission).filter((p) => p.endsWith(':view')),
          Permission.COMPONENT_CREATE,
          Permission.REVIEW_CREATE,
          Permission.FEEDBACK_CREATE,
        ].sort(),
      );
    });

    it('gives scoped keys only their scopes', async () => {
      const { key, metadata } = h.keys.createKey('ci', { scopes: [Permission.TOKEN_VIEW, 'not:a-permission'] });
      const principal = await h.principalFor(key);
      expect(principal.id).toBe(metadata.id);
      expect([...principal.permissions]).toEqual([Permission.TOKEN_VIEW]);
    });
  });
});
