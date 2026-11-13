import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Permission, RbacService, Role } from './rbac.service';
import { InMemoryRbacStore } from './testing/in-memory-rbac-store';

describe('RbacService', () => {
  let store: InMemoryRbacStore;
  let rbac: RbacService;

  beforeEach(async () => {
    store = new InMemoryRbacStore();
    rbac = new RbacService(store);
    await rbac.onModuleInit();
  });

  it('creates every default role, and running init again changes nothing', async () => {
    const roles = await rbac.getRoles();
    expect(roles.map((role) => role.id).sort()).toEqual(Object.values(Role).sort());
    const before = structuredClone([...store.roles.values()]);
    await new RbacService(store).onModuleInit();
    expect([...store.roles.values()]).toEqual(before);
  });

  it('grants admin:users to design_system_manager and system_owner', async () => {
    expect((await rbac.requireRole(Role.DESIGN_SYSTEM_MANAGER)).permissions).toContain(Permission.ADMIN_USERS);
    expect((await rbac.requireRole(Role.SYSTEM_OWNER)).permissions).toContain(Permission.ADMIN_USERS);
    expect((await rbac.requireRole(Role.DESIGNER)).permissions).not.toContain(Permission.ADMIN_USERS);
  });

  it('adds new default permissions to roles stored by an older release, keeping admin edits', async () => {
    const legacy = new InMemoryRbacStore();
    const now = new Date().toISOString();
    // Stored before admin:users existed and before defaultsApplied was tracked; an admin removed token:delete
    await legacy.createRole({
      id: Role.SYSTEM_OWNER,
      name: 'System Owner',
      description: '',
      permissions: [Permission.COMPONENT_VIEW, Permission.ADMIN_AUDIT, Permission.DESIGN_APPROVE],
      createdAt: now,
      updatedAt: now,
    });
    const service = new RbacService(legacy);
    await service.onModuleInit();
    const role = await service.requireRole(Role.SYSTEM_OWNER);
    expect(role.permissions).toEqual(
      expect.arrayContaining([Permission.COMPONENT_VIEW, Permission.ADMIN_AUDIT, Permission.DESIGN_APPROVE, Permission.ADMIN_USERS]),
    );
    expect(role.permissions).not.toContain(Permission.TOKEN_DELETE);

    // An admin then removes admin:users; the next start doesn't put it back
    await service.updateRole(Role.SYSTEM_OWNER, role.permissions.filter((p) => p !== Permission.ADMIN_USERS));
    await new RbacService(legacy).onModuleInit();
    expect((await service.requireRole(Role.SYSTEM_OWNER)).permissions).not.toContain(Permission.ADMIN_USERS);
  });

  it('revoking a role really revokes it', async () => {
    await rbac.assignRoleToUser('usr_a', Role.REVIEW_MANAGER, 'tester');
    expect(await rbac.hasPermission('usr_a', Permission.REVIEW_ADMIN)).toBe(true);
    await rbac.removeRoleFromUser('usr_a', Role.REVIEW_MANAGER);
    expect(await rbac.hasPermission('usr_a', Permission.REVIEW_ADMIN)).toBe(false);
    expect(await rbac.getUserRoles('usr_a')).toEqual([]);
    // A fresh service over the same store agrees: nothing is held in memory
    expect(await new RbacService(store).hasPermission('usr_a', Permission.REVIEW_ADMIN)).toBe(false);
  });

  it('has no special users', async () => {
    for (const id of ['current-user', 'default-user', process.env.DEFAULT_USER_ID ?? 'x']) {
      expect(await rbac.hasPermission(id, Permission.ADMIN_RBAC)).toBe(false);
    }
  });

  it('404s for unknown roles and missing assignments', async () => {
    expect(await rbac.getRole('nope')).toBeNull();
    await expect(rbac.requireRole('nope')).rejects.toBeInstanceOf(NotFoundException);
    await expect(rbac.assignRoleToUser('usr_a', 'nope')).rejects.toBeInstanceOf(NotFoundException);
    await expect(rbac.updateRole('nope', [])).rejects.toBeInstanceOf(NotFoundException);
    await expect(rbac.getUsersWithRole('nope')).rejects.toBeInstanceOf(NotFoundException);
    await expect(rbac.removeRoleFromUser('usr_a', Role.DESIGNER)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects unknown permissions on update', async () => {
    await expect(rbac.updateRole(Role.DESIGNER, ['component:view', 'made:up'])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists every permission in the enum', () => {
    const values = rbac.getAllPermissions().map((p) => p.value);
    expect(values.sort()).toEqual(Object.values(Permission).sort());
    expect(values).toContain('admin:performance_analysis');
    expect(values).toContain('admin:users');
    for (const permission of rbac.getAllPermissions()) {
      expect(permission.label).toBeTruthy();
      expect(permission.category).not.toBe('Other');
    }
  });

  it('lists role holders without a size cap', async () => {
    for (let i = 0; i < 1500; i++) await store.putAssignment({ userId: `usr_${i}`, roleId: Role.DESIGNER, assignedAt: '' });
    expect(await rbac.getUsersWithRole(Role.DESIGNER)).toHaveLength(1500);
  });

  it('fails with 503 instead of pretending when storage is down', async () => {
    store.failWith = new ServiceUnavailableException();
    await expect(rbac.getRoles()).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(rbac.assignRoleToUser('usr_a', Role.DESIGNER)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(rbac.hasPermission('usr_a', Permission.COMPONENT_VIEW)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('retries init after storage was down at startup', async () => {
    const down = new InMemoryRbacStore();
    down.failWith = new ServiceUnavailableException();
    const service = new RbacService(down);
    await service.onModuleInit(); // logs, doesn't throw
    down.failWith = undefined;
    expect((await service.getRoles()).length).toBe(Object.values(Role).length);
  });
});
