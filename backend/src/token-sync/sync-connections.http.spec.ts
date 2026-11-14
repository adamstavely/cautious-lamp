import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { EncryptionService } from '../common/security/encryption.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { DesignSyncController } from '../design-sync/design-sync.controller';
import { DesignSyncService } from '../design-sync/design-sync.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { Permission } from '../rbac/rbac.service';
import { TokenSyncController } from './token-sync.controller';
import { TokenSyncService } from './token-sync.service';

const PEOPLE = {
  alice: { id: 'usr_alice', permissions: [] as string[] },
  bob: { id: 'usr_bob', permissions: [] as string[] },
  admin: { id: 'usr_admin', permissions: [Permission.ADMIN_USERS] as string[] },
};
type Person = keyof typeof PEOPLE;

const auth = {
  async resolve(credential?: string) {
    const key = credential?.startsWith('tok-') ? (credential.slice(4) as Person) : undefined;
    const person = key && PEOPLE[key];
    if (!person) return null;
    return {
      type: 'user' as const,
      id: person.id,
      email: `${key}@example.com`,
      name: key,
      roles: [],
      permissions: new Set(person.permissions),
      mustChangePassword: false,
    };
  },
};

/** Design sync and token sync connections over HTTP */
describe('Sync connections over HTTP', () => {
  let app: INestApplication;
  let base: string;
  let encryption: EncryptionService;
  let tokenSync: TokenSyncService;

  beforeAll(async () => {
    encryption = new EncryptionService();
    tokenSync = new TokenSyncService({ getAllTokens: () => [] } as unknown as DesignSystemService, encryption);
    const moduleRef = await Test.createTestingModule({
      controllers: [DesignSyncController, TokenSyncController],
      providers: [
        { provide: DesignSyncService, useValue: new DesignSyncService(encryption) },
        { provide: TokenSyncService, useValue: tokenSync },
        { provide: AuthService, useValue: auth },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
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
  });

  const call = async (as: Person | null, method: string, route: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer tok-${as}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined, raw: text };
  };

  const features = [
    { name: 'design sync', path: '/design-sync', body: { name: 'Figma', tool: 'figma', fileId: 'f1', apiKey: 'figd_secret_value' } },
    { name: 'token sync', path: '/token-sync', body: { name: 'Tokens', tool: 'figma', fileId: 'f1', apiKey: 'figd_secret_value' } },
  ];

  describe.each(features)('$name', ({ path, body }) => {
    let id: string;

    beforeAll(async () => {
      const res = await call('alice', 'POST', `${path}/connections`, body);
      expect(res.status).toBe(201);
      id = res.body.id;
    });

    it('starts with no sample connections and needs a signed-in caller', async () => {
      expect((await call('bob', 'GET', `${path}/connections`)).body).toEqual([]);
      expect((await call(null, 'GET', `${path}/connections`)).status).toBe(401);
    });

    it('never returns the credential', async () => {
      for (const res of [
        await call('alice', 'GET', `${path}/connections`),
        await call('alice', 'GET', `${path}/connections/${id}`),
        await call('alice', 'PUT', `${path}/connections/${id}`, { name: 'Renamed' }),
        await call('admin', 'GET', `${path}/connections`),
      ]) {
        expect(res.status).toBe(200);
        expect(res.raw).not.toContain('figd_secret_value');
        expect(res.raw).not.toContain('"apiKey"');
      }
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).body).toMatchObject({ hasApiKey: true, owner: { id: PEOPLE.alice.id } });
    });

    it('stores the credential encrypted', async () => {
      const service = path === '/token-sync' ? tokenSync : (app.get(DesignSyncService) as DesignSyncService);
      const registry = (service as unknown as { registry: { require: Function; credential: Function } }).registry;
      const stored = registry.require(await auth.resolve('tok-alice'), id);
      expect(stored.apiKey).not.toBe('figd_secret_value');
      expect(encryption.isEncrypted(stored.apiKey)).toBe(true);
      expect(registry.credential(stored)).toBe('figd_secret_value');
    });

    it('keeps connections to their owner (and admin:users holders)', async () => {
      expect((await call('bob', 'GET', `${path}/connections`)).body.map((c: any) => c.id)).not.toContain(id);
      for (const [method, route, payload] of [
        ['GET', `${path}/connections/${id}`],
        ['PUT', `${path}/connections/${id}`, { name: 'Hijacked' }],
        ['DELETE', `${path}/connections/${id}`],
        ['POST', `${path}/connections/${id}/sync`, {}],
        ['POST', `${path}/connections/${id}/auto-sync`, { intervalMinutes: 5 }],
      ] as Array<[string, string, unknown?]>) {
        expect([method, route, (await call('bob', method, route, payload)).status]).toEqual([method, route, 404]);
      }
      expect((await call('admin', 'GET', `${path}/connections`)).body.map((c: any) => c.id)).toContain(id);
      expect((await call('admin', 'GET', `${path}/connections/${id}`)).status).toBe(200);
    });

    it('rejects server-set fields instead of applying them', async () => {
      expect((await call('alice', 'PUT', `${path}/connections/${id}`, { owner: { id: PEOPLE.bob.id } })).status).toBe(400);
      expect((await call('alice', 'PUT', `${path}/connections/${id}`, { lastSync: '2020-01-01' })).status).toBe(400);
      expect((await call('alice', 'POST', `${path}/connections`, { ...body, tool: 'sketch' })).status).toBe(400);
    });

    it('answers 501 for sync and auto-sync instead of reporting success', async () => {
      const sync = await call('alice', 'POST', `${path}/connections/${id}/sync`, {});
      expect(sync.status).toBe(501);
      expect(sync.body.message).toMatch(/not implemented/i);
      expect((await call('alice', 'POST', `${path}/connections/${id}/auto-sync`, { intervalMinutes: 5 })).status).toBe(501);
      expect((await call('alice', 'POST', `${path}/connections`, { ...body, autoSync: true })).status).toBe(501);
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).body).toMatchObject({ autoSync: false });
      expect((await call('alice', 'DELETE', `${path}/connections/${id}/auto-sync`)).status).toBe(200);
    });

    it('lets the owner delete', async () => {
      expect((await call('alice', 'DELETE', `${path}/connections/${id}`)).status).toBe(200);
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).status).toBe(404);
    });
  });

  it('answers 501 for design files, code generation and conflict resolution', async () => {
    const conn = (await call('alice', 'POST', '/design-sync/connections', features[0].body)).body;
    expect((await call('alice', 'GET', `/design-sync/connections/${conn.id}/file`)).status).toBe(501);
    expect((await call('alice', 'POST', '/design-sync/components/comp-1/generate', { framework: 'vue', connectionId: conn.id })).status).toBe(501);
    expect((await call('bob', 'POST', '/design-sync/components/comp-1/generate', { framework: 'vue', connectionId: conn.id })).status).toBe(404);
    expect((await call('alice', 'GET', `/design-sync/connections/${conn.id}/versions`)).body).toEqual([]);
    expect((await call('alice', 'POST', '/token-sync/conflicts/c-1/resolve', { resolution: 'use-system' })).status).toBe(501);
  });
});
