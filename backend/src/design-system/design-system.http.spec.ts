import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService, DEFAULT_SERVICE_PERMISSIONS } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission } from '../rbac/rbac.service';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WORKSPACE_STORE, WorkspaceDoc } from '../workspaces/workspace.types';
import { ComponentAccessService } from './component-access.service';
import { ComponentIssueService } from './component-issue.service';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { CHANGE_RECORDER, ChangeActor, ChangeInput } from '../notifications/notification.types';

const MEMBER_PERMISSIONS = [Permission.COMPONENT_VIEW, Permission.COMPONENT_CREATE, Permission.COMPONENT_EDIT, Permission.FEEDBACK_CREATE];

/** Who the tests sign in as: the token is `tok-<name>` */
const PEOPLE: Record<string, string[]> = {
  alice: MEMBER_PERMISSIONS, // owner of ws_alpha
  bob: MEMBER_PERMISSIONS, // owner of ws_beta only
  ed: MEMBER_PERMISSIONS, // editor in ws_alpha
  vic: MEMBER_PERMISSIONS, // viewer in ws_alpha
  banners: [Permission.ADMIN_BANNERS],
  perf: [Permission.ADMIN_PERFORMANCE_ANALYSIS],
  roadmap: [Permission.ROADMAP_EDIT],
  superuser: [Permission.ADMIN_USERS],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    if (credential === 'svc-key') {
      return { type: 'service', id: 'svc', name: 'Service', email: null, roles: [], permissions: new Set(DEFAULT_SERVICE_PERMISSIONS), mustChangePassword: false };
    }
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

function workspace(id: string, memberId: string, others: Array<[string, 'admin' | 'editor' | 'viewer']> = []): WorkspaceDoc {
  const members: Array<[string, string]> = [[memberId, 'owner'], ...others];
  return {
    id,
    name: id,
    members: members.map(([userId, role]) => ({ userId, email: `${userId}@example.com`, name: userId, role })),
    memberIds: members.map(([userId]) => userId),
  } as unknown as WorkspaceDoc;
}

/**
 * Workspace boundaries on the global component routes, and permissions on the
 * admin routes of DesignSystemController, through the real guard and services.
 */
describe('Design system HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let designSystem: DesignSystemService;
  /** Changes the routes reported to the changelog */
  const recorded: Array<{ change: ChangeInput; actor?: ChangeActor }> = [];

  const call = async (method: string, route: string, options: { as?: string; token?: string; body?: unknown } = {}) => {
    const token = options.token ?? (options.as ? `tok-${options.as}` : undefined);
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  const componentIds = async (as: string, route = '/components') => (await call('GET', route, { as })).body.components.map((c: { id: string }) => c.id);

  beforeAll(async () => {
    const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    await workspaces.create(workspace('ws_alpha', 'usr_alice', [['usr_ed', 'editor'], ['usr_vic', 'viewer']]));
    await workspaces.create(workspace('ws_beta', 'usr_bob'));

    const moduleRef = await Test.createTestingModule({
      controllers: [DesignSystemController],
      providers: [
        DesignSystemService,
        ComponentIssueService,
        { provide: CHANGE_RECORDER, useValue: { record: async (change: ChangeInput, actor?: ChangeActor) => void recorded.push({ change, actor }) } },
        ComponentAccessService,
        WorkspaceAccessService,
        { provide: WORKSPACE_STORE, useValue: workspaces },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

    designSystem = moduleRef.get(DesignSystemService);
    designSystem.createComponent({ id: 'alpha-secret', name: 'AlphaSecret', description: 'Alpha only', workspaceId: 'ws_alpha' });
    const shared = designSystem.createComponent({ id: 'alpha-shared', name: 'AlphaShared', description: 'Shared with beta', workspaceId: 'ws_alpha' });
    shared.sharedWith = ['ws_beta'];
    designSystem.createComponent({ id: 'alpha-global', name: 'AlphaGlobal', description: 'Everyone', workspaceId: 'ws_alpha', isGlobal: true });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('workspace components on global routes', () => {
    it('lists only components the caller can see', async () => {
      const library = designSystem.getAllComponents().filter((c) => !c.workspaceId).map((c) => c.id);
      expect(library.length).toBeGreaterThan(0);

      const bob = await componentIds('bob');
      expect(bob).toEqual(expect.arrayContaining([...library, 'alpha-shared', 'alpha-global']));
      expect(bob).not.toContain('alpha-secret');

      expect(await componentIds('alice')).toEqual(expect.arrayContaining(['alpha-secret', 'alpha-shared', 'alpha-global']));
      expect(await componentIds('superuser')).toContain('alpha-secret');

      const service = (await call('GET', '/components', { token: 'svc-key' })).body.components.map((c: { id: string }) => c.id);
      expect(service).not.toContain('alpha-secret');
      expect(service).not.toContain('alpha-shared');
    });

    it('filters by status the same way', async () => {
      expect(await componentIds('bob', '/components/status/in-progress')).not.toContain('alpha-secret');
      expect(await componentIds('bob', '/components?status=in-progress')).not.toContain('alpha-secret');
      expect(await componentIds('alice', '/components/status/in-progress')).toContain('alpha-secret');
    });

    it('answers a hidden component exactly like a missing one', async () => {
      const hidden = await call('GET', '/components/alpha-secret', { as: 'bob' });
      const missing = await call('GET', '/components/no-such-component', { as: 'bob' });
      expect(hidden.status).toBe(missing.status);
      expect(hidden.body.message).toBe("Component 'alpha-secret' not found");
      expect((await call('GET', '/components/alpha-secret', { as: 'alice' })).status).toBe(200);
      expect((await call('GET', '/components/alpha-shared', { as: 'bob' })).status).toBe(200);

      for (const route of ['/components/alpha-secret/variants', '/components/alpha-secret/test-coverage', '/components/alpha-secret/linked-requests']) {
        expect((await call('GET', route, { as: 'bob' })).status).toBe(400);
      }
      expect((await call('POST', '/components/alpha-secret/variants', { as: 'bob', body: { name: 'x' } })).status).toBe(400);
    });

    // AI chat context: ai-assistant.http.spec.ts
    it('leaves hidden components out of the Loupe metadata', async () => {
      const metadata = await call('GET', '/component-metadata', { as: 'bob' });
      expect(Object.keys(metadata.body)).not.toContain('alpha-secret');
      expect(Object.keys((await call('GET', '/component-metadata', { as: 'alice' })).body)).toContain('alpha-secret');
    });

    it('only lets a workspace editor add components to it, without sharing them', async () => {
      const body = { id: 'beta-made', name: 'BetaMade', description: 'x', workspaceId: 'ws_alpha', isGlobal: true };
      expect((await call('POST', '/components', { as: 'bob', body })).status).toBe(404);
      expect((await call('POST', '/components', { as: 'banners', body })).status).toBe(403); // no component:create
      const created = await call('POST', '/components', { as: 'alice', body: { ...body, id: 'alpha-made' } });
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({ workspaceId: 'ws_alpha', isGlobal: false });
      expect(await componentIds('bob')).not.toContain('alpha-made');
    });
  });

  describe('changing components (variants)', () => {
    const variant = (name: string) => ({ name, properties: { padding: '4' } });
    const save = (as: string, id: string, name = 'compact') => call('POST', `/components/${id}/variants`, { as, body: variant(name) });
    const remove = (as: string, id: string, name = 'compact') => call('DELETE', `/components/${id}/variants/${name}`, { as });

    it("needs the editor role in the component's workspace, not just component:edit", async () => {
      // A viewer can read the component but not change it
      expect((await call('GET', '/components/alpha-secret/variants', { as: 'vic' })).status).toBe(200);
      const denied = await save('vic', 'alpha-secret');
      expect(denied.status).toBe(403);
      expect(denied.body.message).toBe("Requires the editor role in the component's workspace");

      expect((await save('ed', 'alpha-secret')).status).toBe(201);
      expect((await save('alice', 'alpha-secret', 'roomy')).status).toBe(201);
      expect((await remove('vic', 'alpha-secret')).status).toBe(403);
      expect(designSystem.getComponentVariants('alpha-secret').map((v) => v.name)).toEqual(['compact', 'roomy']);
      expect((await remove('ed', 'alpha-secret')).status).toBe(200);
      expect(designSystem.getComponentVariants('alpha-secret').map((v) => v.name)).toEqual(['roomy']);
    });

    it('is refused through a workspace the component is shared with, and for global components', async () => {
      expect((await save('alice', 'alpha-shared')).status).toBe(201);
      expect((await save('alice', 'alpha-global')).status).toBe(201);
      for (const id of ['alpha-shared', 'alpha-global']) {
        expect((await call('GET', `/components/${id}/variants`, { as: 'bob' })).status).toBe(200);
        expect((await save('bob', id, 'hijacked')).status).toBe(403);
        expect((await remove('bob', id)).status).toBe(403);
        expect(designSystem.getComponentVariants(id).map((v) => v.name)).toEqual(['compact']);
      }
      // admin:users holders act as owner in every workspace, but still need component:edit
      expect((await save('superuser', 'alpha-shared')).status).toBe(403);
    });

    it('keeps library components (no workspace) open to component:edit holders', async () => {
      const library = designSystem.getAllComponents().find((c) => !c.workspaceId)!.id;
      expect((await save('bob', library)).status).toBe(201);
      expect((await remove('vic', library)).status).toBe(200);
      expect((await save('roadmap', library)).status).toBe(403); // no component:edit
    });
  });

  describe('changelog', () => {
    const since = () => recorded.length;

    it('records a created component with its workspace audience and author', async () => {
      const start = since();
      const body = { id: 'alpha-logged', name: 'AlphaLogged', description: 'Logged on create', workspaceId: 'ws_alpha' };
      expect((await call('POST', '/components', { as: 'alice', body })).status).toBe(201);
      expect(recorded.slice(start)).toEqual([
        {
          change: expect.objectContaining({
            type: 'component',
            entityId: 'alpha-logged',
            entityName: 'AlphaLogged',
            action: 'created',
            workspaceId: 'ws_alpha',
            audience: ['ws_alpha'],
          }),
          actor: expect.objectContaining({ id: 'usr_alice' }),
        },
      ]);
    });

    it('records saved variants as updates and removed variants as breaking', async () => {
      const start = since();
      await call('POST', '/components/alpha-shared/variants', { as: 'alice', body: { name: 'dense', properties: {} } });
      await call('DELETE', '/components/alpha-shared/variants/dense', { as: 'alice' });
      const [saved, removed] = recorded.slice(start).map((r) => r.change);
      expect(saved).toMatchObject({ entityId: 'alpha-shared', action: 'updated', audience: ['ws_alpha', 'ws_beta'] });
      expect(saved.breaking).toBeFalsy();
      expect(removed).toMatchObject({ entityId: 'alpha-shared', action: 'updated', breaking: true });
      expect(removed.changes?.[0].description).toContain('dense');
    });

    it('records nothing when the write is refused', async () => {
      const start = since();
      await call('POST', '/components/alpha-secret/variants', { as: 'vic', body: { name: 'nope', properties: {} } });
      await call('POST', '/components', { as: 'bob', body: { id: 'x', name: 'X', description: 'x', workspaceId: 'ws_alpha' } });
      expect(recorded.slice(start)).toEqual([]);
    });
  });

  describe('component lifecycle (status, deprecation, dependencies)', () => {
    beforeAll(() => {
      for (const id of ['life-base', 'life-mid', 'life-top', 'life-old']) {
        designSystem.createComponent({ id, name: id, description: 'Lifecycle test', status: 'production' });
      }
    });

    it('needs component:edit, and the editor role for a workspace component', async () => {
      expect((await call('PUT', '/components/life-old/status', { as: 'roadmap', body: { status: 'planned' } })).status).toBe(403);
      expect((await call('PUT', '/components/life-old/deprecation', { as: 'roadmap', body: {} })).status).toBe(403);
      expect((await call('PUT', '/components/life-old/dependencies', { as: 'roadmap', body: { dependencies: [] } })).status).toBe(403);
      expect((await call('PUT', '/components/alpha-secret/status', { as: 'vic', body: { status: 'planned' } })).status).toBe(403);
      expect((await call('PUT', '/components/alpha-shared/status', { as: 'bob', body: { status: 'planned' } })).status).toBe(403);
      // Hidden components answer like missing ones
      expect((await call('PUT', '/components/alpha-secret/status', { as: 'bob', body: { status: 'planned' } })).status).toBe(400);
      expect((await call('PUT', '/components/alpha-secret/status', { as: 'ed', body: { status: 'planned' } })).status).toBe(200);
      expect(designSystem.getComponentById('alpha-secret')!.status).toBe('planned');
    });

    it('changes the status and records who changed it', async () => {
      expect((await call('PUT', '/components/life-old/status', { as: 'bob', body: { status: 'retired' } })).status).toBe(400);
      expect((await call('PUT', '/components/life-old/status', { as: 'bob', body: { status: 'planned', extra: 1 } })).status).toBe(400);
      const res = await call('PUT', '/components/life-old/status', { as: 'bob', body: { status: 'in-progress' } });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'life-old', status: 'in-progress', updatedBy: 'usr_bob' });
      expect((await call('GET', '/components/life-old', { as: 'alice' })).body.status).toBe('in-progress');
    });

    it('deprecates with a replacement and sunset date, and undeprecates by changing the status', async () => {
      const details = { replacement: 'life-base', sunsetDate: '2027-06-30', reason: 'Merged into base', migrationGuide: 'Swap the import' };
      const res = await call('PUT', '/components/life-old/deprecation', { as: 'bob', body: details });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('deprecated');
      expect(res.body.deprecation).toMatchObject({ ...details, deprecatedBy: 'usr_bob', deprecatedAt: expect.any(String) });
      expect(await componentIds('alice', '/components?status=deprecated')).toContain('life-old');

      expect((await call('PUT', '/components/life-old/deprecation', { as: 'bob', body: { replacement: 'life-old' } })).status).toBe(400);
      expect((await call('PUT', '/components/life-old/deprecation', { as: 'bob', body: { replacement: 'no-such-thing' } })).status).toBe(400);
      expect((await call('PUT', '/components/life-old/deprecation', { as: 'bob', body: { sunsetDate: 'next year' } })).status).toBe(400);
      // A component the caller can't see can't be named as the replacement
      expect((await call('PUT', '/components/life-old/deprecation', { as: 'bob', body: { replacement: 'alpha-secret' } })).status).toBe(400);

      const back = await call('PUT', '/components/life-old/status', { as: 'bob', body: { status: 'production' } });
      expect(back.body.status).toBe('production');
      expect(back.body.deprecation).toBeUndefined();
    });

    it('stores dependencies, refusing unknown, hidden, self and cyclic ones', async () => {
      const put = (as: string, id: string, dependencies: string[]) => call('PUT', `/components/${id}/dependencies`, { as, body: { dependencies } });
      expect((await put('bob', 'life-mid', ['life-base', 'life-base'])).body.dependencies).toEqual(['life-base']);
      expect((await put('bob', 'life-top', ['life-mid'])).status).toBe(200);
      expect((await put('bob', 'life-base', ['life-top'])).status).toBe(400); // base -> top -> mid -> base
      expect((await put('bob', 'life-base', ['life-base'])).status).toBe(400);
      expect((await put('bob', 'life-base', ['nope'])).status).toBe(400);
      expect((await put('bob', 'life-base', ['alpha-secret'])).status).toBe(400);
      expect((await put('alice', 'life-base', ['alpha-secret'])).status).toBe(200);
      expect((await call('PUT', '/components/life-base/dependencies', { as: 'bob', body: { dependencies: 'life-top' } })).status).toBe(400);
      expect(designSystem.getComponentById('life-top')!.dependencies).toEqual(['life-mid']);
    });

    it('records status changes, deprecations and dependency changes in the changelog', async () => {
      const start = recorded.length;
      await call('PUT', '/components/life-mid/status', { as: 'bob', body: { status: 'planned' } });
      await call('PUT', '/components/life-mid/status', { as: 'bob', body: { status: 'planned' } }); // unchanged: nothing recorded
      await call('PUT', '/components/life-mid/deprecation', { as: 'bob', body: { replacement: 'life-base', sunsetDate: '2027-01-31' } });
      await call('PUT', '/components/life-mid/dependencies', { as: 'bob', body: { dependencies: [] } });
      await call('PUT', '/components/life-mid/status', { as: 'roadmap', body: { status: 'production' } }); // refused
      expect(recorded.slice(start).map((r) => [r.change.entityId, r.change.action])).toEqual([
        ['life-mid', 'status-changed'],
        ['life-mid', 'deprecated'],
        ['life-mid', 'updated'],
      ]);
      expect(recorded[start + 1].change.changes).toEqual([
        { field: 'deprecation', description: 'Use life-base instead' },
        { field: 'deprecation', description: 'Sunset on 2027-01-31' },
      ]);
    });

    it('validates new components and refuses a duplicate id', async () => {
      expect((await call('POST', '/components', { as: 'bob', body: { id: 'Not A Slug', name: 'x', description: 'y' } })).status).toBe(400);
      expect((await call('POST', '/components', { as: 'bob', body: { id: 'new-one', name: ' ', description: 'y' } })).status).toBe(400);
      expect((await call('POST', '/components', { as: 'bob', body: { id: 'new-one', name: 'x', description: 'y', status: 'retired' } })).status).toBe(400);
      expect((await call('POST', '/components', { as: 'bob', body: { id: 'life-base', name: 'x', description: 'y' } })).status).toBe(409);
      expect((await call('POST', '/components', { as: 'bob', body: { id: 'new-one', name: 'New one', description: 'y', status: 'planned' } })).status).toBe(201);
    });
  });

  describe('administrative routes', () => {
    const banner = { title: 'Maintenance', message: 'Tonight', type: 'info' };

    it('needs admin:banners to change banners; reading stays open', async () => {
      expect((await call('POST', '/banners', { as: 'bob', body: banner })).status).toBe(403);
      expect((await call('POST', '/banners', { token: 'svc-key', body: banner })).status).toBe(403);
      const created = await call('POST', '/banners', { as: 'banners', body: banner });
      expect(created.status).toBe(201);
      const id = created.body.id;
      expect((await call('PUT', `/banners/${id}`, { as: 'bob', body: { isActive: false } })).status).toBe(403);
      expect((await call('DELETE', `/banners/${id}`, { as: 'bob' })).status).toBe(403);
      expect((await call('GET', '/banners?active=true', { as: 'bob' })).body.map((b: { id: string }) => b.id)).toContain(id);
      expect((await call('PUT', `/banners/${id}`, { as: 'banners', body: { isActive: false } })).status).toBe(200);
      expect((await call('DELETE', `/banners/${id}`, { as: 'banners' })).status).toBe(200);
    });

    it('needs admin:performance_analysis to change performance budgets', async () => {
      const budget = { name: 'Bundle', metric: 'bundle-size', threshold: 100, unit: 'kb' };
      expect((await call('POST', '/performance/budgets', { as: 'bob', body: budget })).status).toBe(403);
      expect((await call('DELETE', '/performance/budgets/anything', { as: 'bob' })).status).toBe(403);
      expect((await call('POST', '/performance/budgets', { as: 'perf', body: budget })).status).toBe(201);
      expect((await call('GET', '/performance/budgets', { as: 'bob' })).status).toBe(200);
    });

    it('needs roadmap:edit to change the roadmap', async () => {
      const item = { title: 'Dark mode', description: 'x', category: 'feature', priority: 'high' };
      expect((await call('POST', '/roadmap/items', { as: 'bob', body: item })).status).toBe(403);
      expect((await call('POST', '/roadmap/items', { as: 'roadmap', body: item })).status).toBe(201);
    });
  });
});
