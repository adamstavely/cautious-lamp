import { Controller, Get, INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { EncryptionService } from '../common/security/encryption.service';
import { KeyManagementService } from '../common/security/key-management.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { RbacController } from '../rbac/rbac.controller';
import { Permission, RbacService, Role } from '../rbac/rbac.service';
import { RBAC_STORE } from '../rbac/rbac.store';
import { InMemoryRbacStore } from '../rbac/testing/in-memory-rbac-store';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Public } from './principal';
import { ADMIN_EMAIL, ADMIN_KEY, ADMIN_PASSWORD, API_KEY, createAuditStub } from './testing/harness';
import { TokenService } from './token.service';
import { USER_STORE, UserDoc } from './user.types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Controller('api/v1')
class PingController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

/** Sign-in through to admin routes over HTTP, with in-memory storage in place of Elasticsearch */
describe('Auth HTTP API', () => {
  const saved = { ...process.env };
  let app: INestApplication;
  let base: string;

  const call = async (method: string, route: string, options: { token?: string; body?: unknown } = {}) => {
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  const login = async (email: string, password: string) => {
    const res = await call('POST', '/auth/login', { body: { email, password } });
    expect(res.status).toBe(200);
    return res.body.accessToken as string;
  };

  beforeAll(async () => {
    process.env.API_KEYS = API_KEY;
    process.env.ADMIN_API_KEY = ADMIN_KEY;
    process.env.BOOTSTRAP_ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.BOOTSTRAP_ADMIN_PASSWORD = ADMIN_PASSWORD;
    delete process.env.AUTH_JWT_SECRET;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, UsersController, RbacController, PingController],
      providers: [
        AuthService,
        TokenService,
        UsersService,
        RbacService,
        EncryptionService,
        KeyManagementService,
        { provide: USER_STORE, useValue: new InMemoryStore<UserDoc>() },
        { provide: RBAC_STORE, useValue: new InMemoryRbacStore() },
        { provide: SecurityAuditService, useValue: createAuditStub() },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
    process.env = saved;
  });

  it('serves public routes without a credential and 401s the rest', async () => {
    expect((await call('GET', '/health')).status).toBe(200);
    expect((await call('GET', '/auth/me')).status).toBe(401);
    expect((await call('GET', '/users')).status).toBe(401);
    expect((await call('GET', '/auth/me', { token: 'garbage' })).status).toBe(401);
  });

  it('401s bad credentials with one message, and rejects unknown body fields', async () => {
    const wrong = await call('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: 'definitely wrong' } });
    const unknown = await call('POST', '/auth/login', { body: { email: 'who@example.com', password: 'definitely wrong' } });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
    expect((await call('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: 'x', admin: true } })).status).toBe(400);
  });

  it('login → me → admin-only routes → logout', async () => {
    const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    const me = await call('GET', '/auth/me', { token: adminToken });
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ type: 'user', email: ADMIN_EMAIL, roles: [Role.DESIGN_SYSTEM_MANAGER], mustChangePassword: true });
    expect(me.body.permissions).toContain(Permission.ADMIN_USERS);

    // The admin creates a designer
    const created = await call('POST', '/users', {
      token: adminToken,
      body: { email: 'Dee@Example.com', name: 'Dee', password: 'designer password', roles: [Role.DESIGNER] },
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ email: 'dee@example.com', mustChangePassword: true, roles: [Role.DESIGNER] });
    expect(created.body).not.toHaveProperty('passwordHash');
    expect((await call('POST', '/users', { token: adminToken, body: { email: 'dee@example.com', name: 'X', password: 'designer password' } })).status).toBe(409);

    const list = await call('GET', '/users?q=dee', { token: adminToken });
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);

    // The designer can't use admin routes, but can read their own roles
    const designerToken = await login('dee@example.com', 'designer password');
    expect((await call('GET', '/users', { token: designerToken })).status).toBe(403);
    expect((await call('GET', '/rbac/roles', { token: designerToken })).status).toBe(403);
    expect((await call('GET', `/rbac/users/${created.body.id}/roles`, { token: designerToken })).status).toBe(200);
    expect((await call('GET', `/rbac/users/${me.body.id}/roles`, { token: designerToken })).status).toBe(403);

    // RBAC routes for the admin
    const permissions = await call('GET', '/rbac/permissions', { token: adminToken });
    expect(permissions.body.map((p: { value: string }) => p.value)).toEqual(expect.arrayContaining(['admin:performance_analysis', 'admin:users']));
    expect((await call('GET', '/rbac/roles/nope', { token: adminToken })).status).toBe(404);
    expect((await call('PUT', `/rbac/roles/${Role.DESIGNER}`, { token: adminToken, body: { permissions: ['made:up'] } })).status).toBe(400);
    const assigned = await call('POST', `/rbac/users/${created.body.id}/roles`, {
      token: adminToken,
      body: { roleId: Role.REVIEW_MANAGER, assignedBy: 'someone-else' },
    });
    expect(assigned.status).toBe(400); // assignedBy is not accepted from clients
    const assignedOk = await call('POST', `/rbac/users/${created.body.id}/roles`, { token: adminToken, body: { roleId: Role.REVIEW_MANAGER } });
    expect(assignedOk.status).toBe(201);
    expect(assignedOk.body.assignedBy).toBe(me.body.id);
    expect((await call('POST', '/rbac/users/usr_nobody/roles', { token: adminToken, body: { roleId: Role.DESIGNER } })).status).toBe(404);
    const holders = await call('GET', `/rbac/roles/${Role.REVIEW_MANAGER}/users`, { token: adminToken });
    expect(holders.body).toEqual([{ id: created.body.id, email: 'dee@example.com', name: 'Dee' }]);
    expect((await call('DELETE', `/rbac/users/${me.body.id}/roles/${Role.DESIGN_SYSTEM_MANAGER}`, { token: adminToken })).status).toBe(409);
    expect((await call('DELETE', `/rbac/users/${created.body.id}/roles/${Role.STYLE_MANAGER}`, { token: adminToken })).status).toBe(404);

    // Disabling yourself is refused
    expect((await call('PATCH', `/users/${me.body.id}`, { token: adminToken, body: { status: 'disabled' } })).status).toBe(409);

    // Logout revokes the token
    expect((await call('POST', '/auth/logout', { token: designerToken })).status).toBe(204);
    expect((await call('GET', '/auth/me', { token: designerToken })).status).toBe(401);
  });

  it('change-password signs the user out and clears mustChangePassword', async () => {
    const token = await login('dee@example.com', 'designer password');
    expect((await call('POST', '/auth/change-password', { token, body: { currentPassword: 'wrong one!', newPassword: 'a newer password' } })).status).toBe(400);
    expect((await call('POST', '/auth/change-password', { token, body: { currentPassword: 'designer password', newPassword: 'a newer password' } })).status).toBe(204);
    expect((await call('GET', '/auth/me', { token })).status).toBe(401);
    const fresh = await login('dee@example.com', 'a newer password');
    expect((await call('GET', '/auth/me', { token: fresh })).body.mustChangePassword).toBe(false);
  });

  it('accepts API keys: admin key for admin routes, plain keys for reads only', async () => {
    expect((await call('GET', '/users', { token: ADMIN_KEY })).status).toBe(200);
    expect((await call('GET', '/users', { token: API_KEY })).status).toBe(403);
    const me = await call('GET', '/auth/me', { token: API_KEY });
    expect(me.body).toMatchObject({ type: 'service', email: null, roles: [] });
    expect(me.body.permissions).toContain(Permission.COMPONENT_VIEW);
    expect((await call('POST', '/auth/logout', { token: API_KEY })).status).toBe(403);
  });

  it('disabling a user revokes their tokens', async () => {
    const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    const token = await login('dee@example.com', 'a newer password');
    const id = (await call('GET', '/auth/me', { token })).body.id;
    const patched = await call('PATCH', `/users/${id}`, { token: adminToken, body: { status: 'disabled' } });
    expect(patched.status).toBe(200);
    expect(patched.body.status).toBe('disabled');
    expect((await call('GET', '/auth/me', { token })).status).toBe(401);
    expect((await call('POST', '/auth/login', { body: { email: 'dee@example.com', password: 'a newer password' } })).status).toBe(401);
  });
});
