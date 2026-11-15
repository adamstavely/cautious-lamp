import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { EncryptionService } from '../common/security/encryption.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { DesignSyncController } from '../design-sync/design-sync.controller';
import { DesignSyncService } from '../design-sync/design-sync.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { createDesignSystemService } from '../design-system/testing/in-memory-stores';
import { DesignToolReader } from '../design-tools/design-tool-reader';
import { SyncRunLog } from '../design-tools/sync-runs';
import { FIGMA_KEY, figmaFixture } from '../design-tools/testing/fake-design-tools';
import { Permission } from '../rbac/rbac.service';
import { TokenSyncController } from './token-sync.controller';
import { TokenSyncService } from './token-sync.service';
import { globalValidationPipe } from '../common/validation/global-validation';

const PEOPLE = {
  alice: { id: 'usr_alice', permissions: [] as string[] },
  bob: { id: 'usr_bob', permissions: [] as string[] },
  admin: { id: 'usr_admin', permissions: [Permission.ADMIN_USERS] as string[] },
  carol: { id: 'usr_carol', permissions: [Permission.TOKEN_CREATE, Permission.TOKEN_EDIT, Permission.TOKEN_DELETE] as string[] },
};
type Person = keyof typeof PEOPLE;

const auth = {
  /** As AuthService.authenticate: these stand-ins never report an expired or revoked credential */
  async authenticate(credential?: string) {
    return { principal: await this.resolve(credential) };
  },
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
    const designSystem = await createDesignSystemService();
    const reader = new DesignToolReader(figmaFixture().http);
    const runs = new SyncRunLog(new InMemoryStore());
    tokenSync = new TokenSyncService(designSystem, encryption, new InMemoryStore(), reader, runs);
    const moduleRef = await Test.createTestingModule({
      controllers: [DesignSyncController, TokenSyncController],
      providers: [
        { provide: DesignSyncService, useValue: new DesignSyncService(encryption, new InMemoryStore(), designSystem, reader, runs) },
        { provide: TokenSyncService, useValue: tokenSync },
        { provide: AuthService, useValue: auth },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    app.useGlobalPipes(globalValidationPipe());
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
      const stored = await registry.require(await auth.resolve('tok-alice'), id);
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
        ['POST', `${path}/connections/${id}/auto-sync`, { intervalHours: 6 }],
        ['GET', `${path}/connections/${id}/runs`],
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

    it('turns scheduled pulls on and off', async () => {
      expect((await call('alice', 'POST', `${path}/connections/${id}/auto-sync`, { intervalHours: 0 })).status).toBe(400);
      expect((await call('alice', 'POST', `${path}/connections/${id}/auto-sync`, { intervalMinutes: 5 })).status).toBe(400);
      const on = await call('alice', 'POST', `${path}/connections/${id}/auto-sync`, { intervalHours: 6 });
      expect(on.status).toBe(201);
      expect(on.body).toMatchObject({ autoSync: true, syncIntervalHours: 6, nextAutoSyncAt: expect.any(String) });
      expect((await call('alice', 'DELETE', `${path}/connections/${id}/auto-sync`)).status).toBe(200);
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).body).toMatchObject({ autoSync: false });
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).body).not.toHaveProperty('nextAutoSyncAt');
    });

    it('reports a design file it cannot read as 422 with the reason', async () => {
      const sync = await call('alice', 'POST', `${path}/connections/${id}/sync`, {});
      expect(sync.status).toBe(422);
      expect(sync.body.message).toMatch(/Figma file key/);
      const runs = await call('alice', 'GET', `${path}/connections/${id}/runs`);
      expect(runs.body[0]).toMatchObject({ status: 'failed', error: expect.stringMatching(/Figma file key/) });
    });

    it('lets the owner delete', async () => {
      expect((await call('alice', 'DELETE', `${path}/connections/${id}`)).status).toBe(200);
      expect((await call('alice', 'GET', `${path}/connections/${id}`)).status).toBe(404);
    });
  });

  it('pulls tokens into a diff, and applies the chosen changes with token permissions', async () => {
    const conn = (await call('carol', 'POST', '/token-sync/connections', { name: 'Acme', tool: 'figma', fileId: FIGMA_KEY, apiKey: 'figd_test' })).body;
    const run = await call('carol', 'POST', `/token-sync/connections/${conn.id}/sync`, {});
    expect(run.status).toBe(201);
    expect(run.body).toMatchObject({ status: 'review', fileVersion: '42' });
    expect(run.body.tokenItems.find((i: any) => i.id === 'border.radius.sm')).toMatchObject({ kind: 'changed', designValue: '6px' });

    expect((await call('carol', 'POST', `/token-sync/runs/${run.body.id}/apply`, { choices: 'all' })).status).toBe(400);
    expect((await call('carol', 'POST', `/token-sync/runs/${run.body.id}/apply`, { choices: { 'border.radius.sm': 'merge' } })).status).toBe(400);
    expect((await call('bob', 'POST', `/token-sync/runs/${run.body.id}/apply`, {})).status).toBe(404);
    const applied = await call('carol', 'POST', `/token-sync/runs/${run.body.id}/apply`, { choices: { 'border.radius.sm': 'keep-code' } });
    expect(applied.status).toBe(201);
    expect(applied.body.applied.results).toEqual(expect.arrayContaining([{ id: 'border.radius.sm', choice: 'keep-code', outcome: 'kept-code' }]));
    expect((await call('carol', 'GET', `/token-sync/runs/${run.body.id}`)).body).toMatchObject({ status: 'applied' });

    // Without token permissions, a pull works but applying it doesn't
    const mine = (await call('alice', 'POST', '/token-sync/connections', { name: 'Mine', tool: 'figma', fileId: FIGMA_KEY, apiKey: 'figd_test' })).body;
    const pulled = (await call('alice', 'POST', `/token-sync/connections/${mine.id}/sync`, {})).body;
    const refused = await call('alice', 'POST', `/token-sync/runs/${pulled.id}/apply`, {});
    expect(refused.status).toBe(403);
    expect(refused.body.message).toMatch(/token:/);
  });

  it('compares design components with the library and lets people link them', async () => {
    const conn = (await call('alice', 'POST', '/design-sync/connections', { name: 'Acme', tool: 'figma', fileId: FIGMA_KEY, apiKey: 'figd_test' })).body;
    const file = await call('alice', 'GET', `/design-sync/connections/${conn.id}/file`);
    expect(file.status).toBe(200);
    expect(file.body).toMatchObject({ name: 'Acme design system', tokenCount: expect.any(Number) });
    expect(file.body.components.map((c: any) => c.name)).toEqual(['Button', 'Text Field', 'Toast']);

    expect((await call('alice', 'POST', `/design-sync/connections/${conn.id}/sync`, { direction: 'code-to-design' })).status).toBe(400);
    const compared = await call('alice', 'POST', `/design-sync/connections/${conn.id}/sync`, {});
    expect(compared.status).toBe(201);
    expect(compared.body).toMatchObject({ kind: 'components', status: 'compared' });
    const items = compared.body.componentItems;
    expect(items.find((i: any) => i.designName === 'Button')).toMatchObject({ kind: 'matched', componentId: 'button' });
    expect(items.find((i: any) => i.designName === 'Toast')).toMatchObject({ kind: 'missing-in-code' });
    expect(items.find((i: any) => i.componentName === 'Card')).toMatchObject({ kind: 'missing-in-design' });

    expect((await call('alice', 'PUT', `/design-sync/connections/${conn.id}/links`, { componentId: 'nope', designNodeId: '2:1' })).status).toBe(400);
    expect((await call('bob', 'PUT', `/design-sync/connections/${conn.id}/links`, { componentId: 'input', designNodeId: '2:1' })).status).toBe(404);
    const linked = await call('alice', 'PUT', `/design-sync/connections/${conn.id}/links`, { componentId: 'input', designNodeId: '2:1' });
    expect(linked.body.componentLinks).toEqual({ input: '2:1' });
    const again = await call('alice', 'POST', `/design-sync/connections/${conn.id}/sync`, {});
    expect(again.body.componentItems.find((i: any) => i.designId === '2:1')).toMatchObject({ kind: 'renamed', componentId: 'input', linked: true });
    expect((await call('alice', 'PUT', `/design-sync/connections/${conn.id}/links`, { componentId: 'input', designNodeId: null })).body.componentLinks).toEqual({});

    expect((await call('alice', 'GET', `/design-sync/connections/${conn.id}/versions`)).body).toEqual(['42']);
    expect((await call('alice', 'GET', `/design-sync/connections/${conn.id}/runs`)).body).toHaveLength(2);
    expect((await call('alice', 'POST', '/design-sync/components/comp-1/generate', { connectionId: conn.id })).status).toBe(404);
    expect((await call('alice', 'POST', '/token-sync/conflicts/c-1/resolve', { resolution: 'use-system' })).status).toBe(404);
  });
});
