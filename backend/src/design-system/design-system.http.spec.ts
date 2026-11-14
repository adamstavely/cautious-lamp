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
import { ComponentRequestService } from './component-request.service';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { NotificationService } from './notification.service';

const MEMBER_PERMISSIONS = [Permission.COMPONENT_VIEW, Permission.COMPONENT_CREATE, Permission.COMPONENT_EDIT, Permission.FEEDBACK_CREATE];

/** Who the tests sign in as: the token is `tok-<name>` */
const PEOPLE: Record<string, string[]> = {
  alice: MEMBER_PERMISSIONS, // member of ws_alpha
  bob: MEMBER_PERMISSIONS, // member of ws_beta only
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

function workspace(id: string, memberId: string): WorkspaceDoc {
  return {
    id,
    name: id,
    members: [{ userId: memberId, email: `${memberId}@example.com`, name: memberId, role: 'owner' }],
    memberIds: [memberId],
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
    await workspaces.create(workspace('ws_alpha', 'usr_alice'));
    await workspaces.create(workspace('ws_beta', 'usr_bob'));

    const moduleRef = await Test.createTestingModule({
      controllers: [DesignSystemController],
      providers: [
        DesignSystemService,
        ComponentRequestService,
        NotificationService,
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

    it('leaves hidden components out of the Loupe metadata and AI chat context', async () => {
      const metadata = await call('GET', '/component-metadata', { as: 'bob' });
      expect(Object.keys(metadata.body)).not.toContain('alpha-secret');
      expect(Object.keys((await call('GET', '/component-metadata', { as: 'alice' })).body)).toContain('alpha-secret');

      const chat = await call('POST', '/ai/chat', { as: 'bob', body: { message: 'tell me about alphasecret' } });
      expect(chat.status).toBe(201);
      expect(JSON.stringify(chat.body)).not.toMatch(/alpha-?secret/i);
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

    it('needs roadmap:edit to change the roadmap or triage requests', async () => {
      const item = { title: 'Dark mode', description: 'x', category: 'feature', priority: 'high' };
      expect((await call('POST', '/roadmap/items', { as: 'bob', body: item })).status).toBe(403);
      expect((await call('POST', '/roadmap/items', { as: 'roadmap', body: item })).status).toBe(201);
      expect((await call('PUT', '/requests/any/status', { as: 'bob', body: { status: 'approved' } })).status).toBe(403);
      expect((await call('PUT', '/requests/any/assign', { as: 'bob', body: { userId: 'x' } })).status).toBe(403);
      expect((await call('POST', '/requests/any/merge', { as: 'bob', body: { targetRequestId: 'y' } })).status).toBe(403);
    });
  });
});
