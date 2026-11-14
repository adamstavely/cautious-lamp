import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { API_KEY_STORE, ApiKeyDoc, KeyManagementService } from '../common/security/key-management.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { TokenRotationService } from '../common/security/token-rotation.service';
import { Permission, RbacService, Role } from '../rbac/rbac.service';
import { RBAC_STORE } from '../rbac/rbac.store';
import { InMemoryRbacStore } from '../rbac/testing/in-memory-rbac-store';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { ApiKeysController } from './api-keys.controller';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ADMIN_EMAIL, ADMIN_KEY, ADMIN_PASSWORD, API_KEY, createAuditStub } from './testing/harness';
import { TokenService } from './token.service';
import { USER_STORE, UserDoc } from './user.types';
import { UsersService } from './users.service';

/** API key management through the real guard, controller and services, with in-memory storage */
describe('API keys HTTP API', () => {
  const saved = { ...process.env };
  const keyStore = new InMemoryStore<ApiKeyDoc>();
  let app: INestApplication;
  let base: string;
  let adminToken: string;
  /** A user whose only admin permission is admin:users */
  let keymasterToken: string;
  let designerToken: string;

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

  /** Signs in with a temporary password, replaces it and signs in again, as the frontend does */
  const signInFirstTime = async (email: string, password: string) => {
    const temporary = await login(email, password);
    const newPassword = `${password} (changed)`;
    expect((await call('POST', '/auth/change-password', { token: temporary, body: { currentPassword: password, newPassword } })).status).toBe(204);
    return login(email, newPassword);
  };

  beforeAll(async () => {
    process.env.API_KEYS = API_KEY;
    process.env.ADMIN_API_KEY = ADMIN_KEY;
    process.env.BOOTSTRAP_ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.BOOTSTRAP_ADMIN_PASSWORD = ADMIN_PASSWORD;
    delete process.env.AUTH_JWT_SECRET;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, ApiKeysController],
      providers: [
        AuthService,
        TokenService,
        UsersService,
        RbacService,
        KeyManagementService,
        TokenRotationService,
        { provide: API_KEY_STORE, useValue: keyStore },
        { provide: USER_STORE, useValue: new InMemoryStore<UserDoc>() },
        { provide: RBAC_STORE, useValue: new InMemoryRbacStore() },
        { provide: SecurityAuditService, useValue: { ...createAuditStub(), logTokenRotation: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

    const rbac = moduleRef.get(RbacService);
    const users = moduleRef.get(UsersService);
    const auth = moduleRef.get(AuthService);
    await rbac.onModuleInit();
    await users.onModuleInit();
    const adminKey = (await auth.resolve(ADMIN_KEY))!;
    await rbac.updateRole(Role.DEVELOPER, [Permission.ADMIN_USERS, Permission.TOKEN_VIEW]);
    await users.create({ email: 'keys@example.com', name: 'Keys', password: 'keymaster password', roles: [Role.DEVELOPER] }, adminKey);
    await users.create({ email: 'dee@example.com', name: 'Dee', password: 'designer password', roles: [Role.DESIGNER] }, adminKey);
    adminToken = await signInFirstTime(ADMIN_EMAIL, ADMIN_PASSWORD);
    keymasterToken = await signInFirstTime('keys@example.com', 'keymaster password');
    designerToken = await signInFirstTime('dee@example.com', 'designer password');
  });

  afterAll(async () => {
    await app.close();
    process.env = saved;
  });

  it('needs admin:users', async () => {
    expect((await call('GET', '/auth/api-keys', { token: designerToken })).status).toBe(403);
    expect((await call('POST', '/auth/api-keys', { token: designerToken, body: { name: 'x', scopes: [Permission.TOKEN_VIEW] } })).status).toBe(403);
    expect((await call('GET', '/auth/api-keys', { token: API_KEY })).status).toBe(403);
    expect((await call('GET', '/auth/api-keys', { token: keymasterToken })).status).toBe(200);
  });

  it('refuses to grant permissions the caller does not have', async () => {
    const escalate = await call('POST', '/auth/api-keys', {
      token: keymasterToken,
      body: { name: 'escalate', scopes: [Permission.ADMIN_RBAC, Permission.ADMIN_GOVERNANCE] },
    });
    expect(escalate.status).toBe(403);
    expect(escalate.body.message).toContain(Permission.ADMIN_RBAC);
    // An unscoped key gets the default service permissions, which the keymaster lacks
    expect((await call('POST', '/auth/api-keys', { token: keymasterToken, body: { name: 'defaults' } })).status).toBe(403);
    expect(await keyStore.list()).toEqual([]);
  });

  it('rejects unknown and empty scopes and unknown fields', async () => {
    expect((await call('POST', '/auth/api-keys', { token: adminToken, body: { name: 'x', scopes: ['made:up'] } })).status).toBe(400);
    expect((await call('POST', '/auth/api-keys', { token: adminToken, body: { name: 'x', scopes: [] } })).status).toBe(400);
    expect((await call('POST', '/auth/api-keys', { token: adminToken, body: { name: 'x', admin: true } })).status).toBe(400);
  });

  it('creates a key within the caller\'s permissions, which then authenticates with exactly those', async () => {
    const created = await call('POST', '/auth/api-keys', { token: keymasterToken, body: { name: 'tokens-bot', scopes: [Permission.TOKEN_VIEW] } });
    expect(created.status).toBe(201);
    expect(created.body.metadata).not.toHaveProperty('keyHash');
    expect(created.body.metadata.createdBy).toBeDefined();

    const me = await call('GET', '/auth/me', { token: created.body.apiKey });
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ type: 'service', id: created.body.metadata.id, permissions: [Permission.TOKEN_VIEW] });
    expect((await call('GET', '/auth/api-keys', { token: created.body.apiKey })).status).toBe(403);

    const listed = await call('GET', '/auth/api-keys', { token: keymasterToken });
    expect(listed.body.map((k: { id: string }) => k.id)).toContain(created.body.metadata.id);
    expect(listed.body.every((k: object) => !('keyHash' in k))).toBe(true);
  });

  it('only lets a caller rotate keys whose permissions it holds', async () => {
    const powerful = await call('POST', '/auth/api-keys', { token: adminToken, body: { name: 'governance', scopes: [Permission.ADMIN_GOVERNANCE] } });
    expect(powerful.status).toBe(201);
    const id = powerful.body.metadata.id;

    // Rotating would hand the keymaster a fresh admin:governance secret
    expect((await call('POST', `/auth/api-keys/${id}/rotate`, { token: keymasterToken, body: {} })).status).toBe(403);
    expect((await call('GET', '/auth/me', { token: powerful.body.apiKey })).status).toBe(200);

    const rotated = await call('POST', `/auth/api-keys/${id}/rotate`, { token: adminToken, body: { reason: 'compromised' } });
    expect(rotated.status).toBe(201);
    expect(rotated.body.newMetadata).toMatchObject({ scopes: [Permission.ADMIN_GOVERNANCE] });
    expect((await call('GET', '/auth/me', { token: powerful.body.apiKey })).status).toBe(401);
    expect((await call('GET', '/auth/me', { token: rotated.body.newApiKey })).status).toBe(200);

    const history = await call('GET', `/auth/api-keys/${id}/rotation-history`, { token: adminToken });
    expect(history.body).toEqual([expect.objectContaining({ tokenId: id, newTokenId: rotated.body.newMetadata.id, reason: 'compromised' })]);
  });

  it('revokes keys, and stored keys outlive the instance that created them', async () => {
    const created = await call('POST', '/auth/api-keys', { token: keymasterToken, body: { name: 'ci', scopes: [Permission.TOKEN_VIEW] } });
    // A fresh service over the same store stands in for a restart or another replica
    expect(await new KeyManagementService(keyStore).resolveApiKey(created.body.apiKey)).toMatchObject({ id: created.body.metadata.id });

    expect((await call('POST', `/auth/api-keys/${created.body.metadata.id}/revoke`, { token: keymasterToken })).status).toBe(201);
    expect((await call('GET', '/auth/me', { token: created.body.apiKey })).status).toBe(401);
    expect(await new KeyManagementService(keyStore).resolveApiKey(created.body.apiKey)).toBeNull();
    expect((await call('POST', '/auth/api-keys/key_nope/revoke', { token: keymasterToken })).status).toBe(404);
  });

  it('refuses key management to a temporary-password session until the password is changed and the user signs in again', async () => {
    // A new account holding admin:users, still on the password an admin set
    const adminKey = (await app.get(AuthService).resolve(ADMIN_KEY))!;
    await app.get(UsersService).create({ email: 'new@example.com', name: 'New', password: 'temporary password', roles: [Role.DEVELOPER] }, adminKey);
    const temporary = await login('new@example.com', 'temporary password');
    const before = (await keyStore.list()).length;

    expect((await call('GET', '/auth/me', { token: temporary })).body).toMatchObject({ mustChangePassword: true, permissions: expect.arrayContaining([Permission.ADMIN_USERS]) });
    const create = await call('POST', '/auth/api-keys', { token: temporary, body: { name: 'sneaky', scopes: [Permission.TOKEN_VIEW] } });
    expect(create.status).toBe(403);
    expect(create.body).toMatchObject({ code: 'PASSWORD_CHANGE_REQUIRED' });
    expect((await call('GET', '/auth/api-keys', { token: temporary })).body).toMatchObject({ code: 'PASSWORD_CHANGE_REQUIRED' });
    expect((await keyStore.list()).length).toBe(before);

    // Changing the password ends the session; the next sign-in is unrestricted
    expect((await call('POST', '/auth/change-password', { token: temporary, body: { currentPassword: 'temporary password', newPassword: 'a permanent password' } })).status).toBe(204);
    expect((await call('POST', '/auth/api-keys', { token: temporary, body: { name: 'sneaky', scopes: [Permission.TOKEN_VIEW] } })).status).toBe(401);
    const fresh = await login('new@example.com', 'a permanent password');
    expect((await call('POST', '/auth/api-keys', { token: fresh, body: { name: 'legit', scopes: [Permission.TOKEN_VIEW] } })).status).toBe(201);
  });
});
