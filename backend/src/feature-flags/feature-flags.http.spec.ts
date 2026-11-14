import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { FeatureFlagsController } from './feature-flags.controller';
import { FEATURE_FLAG_STORE, FeatureFlag, FeatureFlagsService, evaluateFlag } from './feature-flags.service';

const PEOPLE: Record<string, string[]> = {
  designer: [Permission.COMPONENT_VIEW],
  ops: [Permission.ADMIN_SYSTEM_HEALTH],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [name], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

/** Feature flags through the real guard, controller and service, with in-memory storage */
describe('Feature flags HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let store: InMemoryStore<FeatureFlag>;

  const call = async (method: string, route: string, as: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1/feature-flags${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer tok-${as}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  /** A fresh service over the same store stands in for a restart */
  const restart = async () => {
    if (app) await app.close();
    const moduleRef = await Test.createTestingModule({
      controllers: [FeatureFlagsController],
      providers: [
        FeatureFlagsService,
        { provide: FEATURE_FLAG_STORE, useValue: store },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    return moduleRef.get(FeatureFlagsService);
  };

  beforeEach(async () => {
    store = new InMemoryStore<FeatureFlag>();
    await restart();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the built-in defaults without storing them', async () => {
    const all = await call('GET', '', 'designer');
    expect(all.status).toBe(200);
    expect(all.body.find((f: FeatureFlag) => f.key === 'component-playground')).toMatchObject({ enabled: true });
    expect(store.docs.size).toBe(0);
    expect((await call('GET', '/key/no-such-flag', 'designer')).status).toBe(404);
  });

  it('needs admin:system_health for every change', async () => {
    expect((await call('PUT', '/component-playground/toggle', 'designer')).status).toBe(403);
    expect((await call('PUT', '/component-playground', 'designer', { enabled: false })).status).toBe(403);
    expect((await call('POST', '', 'designer', { key: 'new-thing', name: 'New' })).status).toBe(403);
    expect((await call('DELETE', '/component-playground', 'designer')).status).toBe(403);
    expect((await call('POST', '/enable-all', 'designer')).status).toBe(403);
    expect(store.docs.size).toBe(0);
  });

  it('keeps a disabled flag disabled: reads, checks and restarts do not turn it back on', async () => {
    const toggled = await call('PUT', '/component-playground/toggle', 'ops');
    expect(toggled.status).toBe(200);
    expect(toggled.body).toMatchObject({ enabled: false, metadata: { updatedBy: 'usr_ops' } });

    expect((await call('GET', '/key/component-playground', 'designer')).body.enabled).toBe(false);
    expect((await call('GET', '/component-playground', 'designer')).body.enabled).toBe(false);
    expect((await call('GET', '/check/component-playground', 'designer')).body).toEqual({ key: 'component-playground', enabled: false });
    expect((await call('GET', '', 'designer')).body.find((f: FeatureFlag) => f.key === 'component-playground').enabled).toBe(false);

    await restart();
    expect((await call('GET', '/key/component-playground', 'designer')).body.enabled).toBe(false);
    expect(store.docs.get('component-playground')?.doc.enabled).toBe(false);

    // Deleting a built-in flag resets it to its default
    expect((await call('DELETE', '/component-playground', 'ops')).status).toBe(200);
    expect((await call('GET', '/key/component-playground', 'designer')).body.enabled).toBe(true);
  });

  it('creates, edits and validates custom flags', async () => {
    const created = await call('POST', '', 'ops', { key: 'beta-search', name: 'Beta search', enabled: false });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ id: 'beta-search', key: 'beta-search', enabled: false, metadata: { createdBy: 'usr_ops' } });
    expect((await call('POST', '', 'ops', { key: 'beta-search', name: 'Again' })).status).toBe(409);
    expect((await call('POST', '', 'ops', { key: 'component-playground', name: 'Clash' })).status).toBe(409);
    expect((await call('POST', '', 'ops', { key: 'Bad Key!', name: 'x' })).status).toBe(400);
    expect((await call('POST', '', 'ops', { key: 'x', name: 'x', id: 'other' })).status).toBe(400);

    const updated = await call('PUT', '/beta-search', 'ops', { key: 'beta-search', enabled: true, targeting: { groups: ['ops'] } });
    expect(updated.status).toBe(200);
    expect((await call('GET', '/check/beta-search', 'ops')).body.enabled).toBe(true);
    expect((await call('GET', '/check/beta-search', 'designer')).body.enabled).toBe(false);
    expect((await call('PUT', '/beta-search', 'ops', { key: 'renamed' })).status).toBe(400);
    expect((await call('PUT', '/nope', 'ops', { enabled: true })).status).toBe(404);
  });

  it('falls back to the last values read when storage is down', async () => {
    const service = await restart();
    await call('PUT', '/component-playground/toggle', 'ops');
    await service.getAllFlags();
    jest.spyOn(store, 'list').mockRejectedValue(new ServiceUnavailableException());
    jest.spyOn(store, 'get').mockRejectedValue(new ServiceUnavailableException());
    expect((await call('GET', '/key/component-playground', 'designer')).body.enabled).toBe(false);
    expect((await call('GET', '', 'designer')).body.find((f: FeatureFlag) => f.key === 'component-playground').enabled).toBe(false);
    expect((await call('PUT', '/component-playground/toggle', 'ops')).status).toBe(503);
  });

  describe('evaluateFlag', () => {
    const flag = (overrides: Partial<FeatureFlag>): FeatureFlag => ({ id: 'f', key: 'f', name: 'f', enabled: true, ...overrides });

    it('is off when disabled, whatever the targeting', () => {
      expect(evaluateFlag(flag({ enabled: false }), 'u1')).toBe(false);
      expect(evaluateFlag(flag({ enabled: false, targeting: { users: ['u1'] } }), 'u1')).toBe(false);
    });

    it('limits an enabled flag to its targets', () => {
      expect(evaluateFlag(flag({}), 'u1')).toBe(true);
      expect(evaluateFlag(flag({ targeting: { users: ['u1'] } }), 'u1')).toBe(true);
      expect(evaluateFlag(flag({ targeting: { users: ['u1'] } }), 'u2')).toBe(false);
      expect(evaluateFlag(flag({ targeting: { groups: ['g'] } }), 'u2', ['g'])).toBe(true);
      expect(evaluateFlag(flag({ targeting: { percentage: 0 } }), 'u2')).toBe(false);
      expect(evaluateFlag(flag({ targeting: { percentage: 100 } }), 'u2')).toBe(true);
    });
  });
});
