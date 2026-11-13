import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Permission, Role } from '../rbac/rbac.service';
import { ADMIN_EMAIL, ADMIN_KEY, AuthHarness, createAuthHarness } from './testing/harness';

describe('UsersService', () => {
  let h: AuthHarness;

  afterEach(() => h.restoreEnv());

  describe('bootstrap admin', () => {
    it('creates exactly one admin, with design_system_manager and mustChangePassword', async () => {
      h = await createAuthHarness();
      // Startup already ran it once; running again (and concurrently) changes nothing
      await Promise.all([h.users.bootstrapAdmin(), h.users.bootstrapAdmin()]);
      const { users } = await h.users.list();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        email: ADMIN_EMAIL,
        status: 'active',
        mustChangePassword: true,
        roles: [Role.DESIGN_SYSTEM_MANAGER],
      });
      expect(users[0]).not.toHaveProperty('passwordHash');
      expect(users[0]).not.toHaveProperty('tokenVersion');
    });

    it('creates nothing without the env vars, or with a short password', async () => {
      h = await createAuthHarness({ bootstrap: false });
      expect((await h.users.list()).total).toBe(0);
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'x@example.com';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'too-short';
      await h.users.bootstrapAdmin();
      expect((await h.users.list()).total).toBe(0);
    });

    it('does nothing once any user exists', async () => {
      h = await createAuthHarness();
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'second@example.com';
      await h.users.bootstrapAdmin();
      expect((await h.users.list()).users.map((u) => u.email)).toEqual([ADMIN_EMAIL]);
    });
  });

  describe('users', () => {
    beforeEach(async () => {
      h = await createAuthHarness();
    });

    it('creates users with lowercase unique emails and mustChangePassword', async () => {
      const admin = await h.principalFor(ADMIN_KEY);
      const user = await h.users.create({ email: 'Ann@Example.com', name: 'Ann', password: 'a long enough password', roles: [Role.DESIGNER] }, admin);
      expect(user).toMatchObject({ email: 'ann@example.com', mustChangePassword: true, roles: [Role.DESIGNER] });
      expect(user.id).toMatch(/^usr_/);
      await expect(
        h.users.create({ email: 'ANN@example.com', name: 'Other', password: 'a long enough password' }, admin),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        h.users.create({ email: 'bob@example.com', name: 'Bob', password: 'a long enough password', roles: ['nope'] }, admin),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(h.users.create({ email: 'cy@example.com', name: 'Cy', password: 'short' }, admin)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('filters the list by text and status', async () => {
      const admin = await h.principalFor(ADMIN_KEY);
      const ann = await h.users.create({ email: 'ann@example.com', name: 'Ann Lee', password: 'a long enough password' }, admin);
      await h.users.create({ email: 'bob@example.com', name: 'Bob', password: 'a long enough password' }, admin);
      await h.users.update(ann.id, { status: 'disabled' }, admin);
      expect((await h.users.list({ q: 'lee' })).users.map((u) => u.email)).toEqual(['ann@example.com']);
      expect((await h.users.list({ status: 'active' })).users.map((u) => u.email)).toEqual([ADMIN_EMAIL, 'bob@example.com']);
    });

    it('bumps tokenVersion when disabling and when resetting a password', async () => {
      const admin = await h.principalFor(ADMIN_KEY);
      const { user, accessToken } = await h.createUser('gil@example.com');
      await h.users.resetPassword(user.id, 'a reset password!!', admin);
      expect(await h.auth.resolve(accessToken)).toBeNull();
      expect((await h.users.get(user.id)).mustChangePassword).toBe(true);
      await expect(h.users.get('usr_missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('admin:users without admin:rbac', () => {
    beforeEach(async () => {
      h = await createAuthHarness();
    });

    it("can't grant roles or take over an account with more access", async () => {
      const { accessToken } = await h.createUser('owner@example.com', [Role.SYSTEM_OWNER]);
      const owner = await h.principalFor(accessToken);
      expect(owner.permissions.has(Permission.ADMIN_USERS)).toBe(true);
      expect(owner.permissions.has(Permission.ADMIN_RBAC)).toBe(false);

      await expect(
        h.users.create({ email: 'eve@example.com', name: 'Eve', password: 'a long enough password', roles: [Role.DESIGN_SYSTEM_MANAGER] }, owner),
      ).rejects.toBeInstanceOf(ForbiddenException);
      const plain = await h.users.create({ email: 'fay@example.com', name: 'Fay', password: 'a long enough password' }, owner);
      expect(plain.roles).toEqual([]);

      const { user: designer } = await h.createUser('dan@example.com', [Role.DESIGNER]);
      await h.users.resetPassword(designer.id, 'a reset password!!', owner);
      const adminId = (await h.users.list({ q: ADMIN_EMAIL })).users[0].id;
      await expect(h.users.resetPassword(adminId, 'a reset password!!', owner)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(h.users.resetPassword('usr_missing', 'a reset password!!', owner)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('last-admin rule', () => {
    let adminId: string;

    beforeEach(async () => {
      h = await createAuthHarness();
      adminId = (await h.users.list()).users[0].id;
    });

    it('refuses to disable yourself', async () => {
      const { accessToken } = await h.auth.login(ADMIN_EMAIL, process.env.BOOTSTRAP_ADMIN_PASSWORD);
      const me = await h.principalFor(accessToken);
      await expect(h.users.update(adminId, { status: 'disabled' }, me)).rejects.toBeInstanceOf(ConflictException);
    });

    it('refuses to disable or demote the last active admin:rbac holder', async () => {
      const key = await h.principalFor(ADMIN_KEY);
      await expect(h.users.update(adminId, { status: 'disabled' }, key)).rejects.toBeInstanceOf(ConflictException);
      await expect(h.users.removeRole(adminId, Role.DESIGN_SYSTEM_MANAGER, key)).rejects.toBeInstanceOf(ConflictException);
      const without = Object.values(Permission).filter((p) => p !== Permission.ADMIN_RBAC);
      await expect(h.users.updateRolePermissions(Role.DESIGN_SYSTEM_MANAGER, without, key)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(await h.rbac.hasPermission(adminId, Permission.ADMIN_RBAC)).toBe(true);
    });

    it('allows it once another active admin exists', async () => {
      const key = await h.principalFor(ADMIN_KEY);
      const { user: second } = await h.createUser('second-admin@example.com', [Role.DESIGN_SYSTEM_MANAGER]);
      await h.users.removeRole(adminId, Role.DESIGN_SYSTEM_MANAGER, key);
      // ...but now `second` is the last one
      await expect(h.users.update(second.id, { status: 'disabled' }, key)).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not count disabled users as admins', async () => {
      const key = await h.principalFor(ADMIN_KEY);
      const { user: second } = await h.createUser('second-admin@example.com', [Role.DESIGN_SYSTEM_MANAGER]);
      await h.users.update(second.id, { status: 'disabled' }, key);
      await expect(h.users.removeRole(adminId, Role.DESIGN_SYSTEM_MANAGER, key)).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s assigning to an unknown user or role', async () => {
      const key = await h.principalFor(ADMIN_KEY);
      await expect(h.users.assignRole('usr_nobody', Role.DESIGNER, key)).rejects.toBeInstanceOf(NotFoundException);
      await expect(h.users.assignRole(adminId, 'no_such_role', key)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('records role changes with the acting principal', async () => {
      const key = await h.principalFor(ADMIN_KEY);
      const { user } = await h.createUser('hal@example.com');
      const assignment = await h.users.assignRole(user.id, Role.DEVELOPER, key);
      expect(assignment.assignedBy).toBe('admin-key');
      expect(h.audit.logAccountEvent).toHaveBeenCalledWith('role_changed', expect.any(String), 'admin-key', expect.objectContaining({ targetUserId: user.id }));
    });
  });
});
