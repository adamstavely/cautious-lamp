import { BadRequestException, ForbiddenException, INestApplication, NotFoundException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { UsersService } from '../auth/users.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { ComponentAccessService } from '../design-system/component-access.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { DesignSystemStores, createDesignSystemStores, designSystemStoreProviders } from '../design-system/testing/in-memory-stores';
import { NotificationService } from '../notifications/notification.service';
import { NOTIFICATION_STORE, Notification } from '../notifications/notification.types';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WORKSPACE_STORE, WorkspaceDoc } from '../workspaces/workspace.types';
import {
  COMPONENT_REQUEST_COMMENT_STORE,
  COMPONENT_REQUEST_STORE,
  ComponentRequest,
  RequestComment,
} from './component-request.types';
import { ComponentRequestsController } from './component-requests.controller';
import { ComponentRequestsService } from './component-requests.service';

/** Who the tests sign in as: the token is `tok-<name>`, the user id `usr_<name>` */
const PEOPLE: Record<string, string[]> = {
  alice: [],
  bob: [],
  carol: [],
  rita: [Permission.ROADMAP_EDIT],
};

const authStub = {
  /** As AuthService.authenticate: these stand-ins never report an expired or revoked credential */
  async authenticate(credential?: string) {
    return { principal: await this.resolve(credential) };
  },
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    const display = name[0].toUpperCase() + name.slice(1);
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name: display, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

/** The users directory: everyone in PEOPLE exists */
const usersStub = {
  async summaries(ids: string[]) {
    return ids
      .filter((id) => PEOPLE[id.replace(/^usr_/, '')])
      .map((id) => ({ id, email: `${id.slice(4)}@example.com`, name: id.slice(4)[0].toUpperCase() + id.slice(5) }));
  },
};

const settle = () => new Promise((resolve) => setImmediate(resolve));

/** The principal the guard would build for a test person */
const as = async (name: string) => (await authStub.resolve(`tok-${name}`))!;

/**
 * Component requests over HTTP with the real guard and services on in-memory
 * stores (the same compare-and-swap semantics as Elasticsearch).
 */
describe('Component requests HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let requestStore: InMemoryQueryableStore<ComponentRequest>;
  let commentStore: InMemoryStore<RequestComment>;
  let notificationStore: InMemoryStore<Notification>;
  let designSystem: DesignSystemService;
  let designSystemStores: DesignSystemStores;
  let registrations: jest.SpyInstance;

  const call = async (as: string | null, method: string, route: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1/component-requests${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer tok-${as}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  /** Starts the API on the given stores, so a restart can be simulated */
  const start = async () => {
    const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    registrations = jest.spyOn(DesignSystemService.prototype, 'setComponentRequestLinker');
    const moduleRef = await Test.createTestingModule({
      controllers: [ComponentRequestsController],
      providers: [
        ComponentRequestsService,
        DesignSystemService,
        ...designSystemStoreProviders(designSystemStores),
        ComponentAccessService,
        WorkspaceAccessService,
        NotificationService,
        { provide: COMPONENT_REQUEST_STORE, useValue: requestStore },
        { provide: COMPONENT_REQUEST_COMMENT_STORE, useValue: commentStore },
        { provide: NOTIFICATION_STORE, useValue: notificationStore },
        { provide: WORKSPACE_STORE, useValue: workspaces },
        { provide: UsersService, useValue: usersStub },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    designSystem = moduleRef.get(DesignSystemService);
  };

  beforeEach(async () => {
    designSystemStores = createDesignSystemStores();
    requestStore = new InMemoryQueryableStore<ComponentRequest>();
    commentStore = new InMemoryStore<RequestComment>();
    notificationStore = new InMemoryStore<Notification>();
    await start();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  const NEW_REQUEST = { title: 'Data table', description: 'Sortable, filterable table', category: 'data-display' };
  const submit = async (as = 'alice', body: Record<string, unknown> = NEW_REQUEST) => {
    const res = await call(as, 'POST', '', body);
    expect(res.status).toBe(201);
    return (res.body.request ?? res.body) as ComponentRequest;
  };
  const stored = async (id: string) => (await requestStore.get(id))?.doc;
  const notificationsFor = async (userId: string) => {
    await settle();
    return (await notificationStore.list({ where: { userId } })).map((n) => n.title);
  };
  /** Takes a request through design, technical and final approval */
  const approve = async (id: string) => {
    for (const stage of ['design', 'technical', 'final']) {
      expect((await call('rita', 'POST', `/${id}/approve`, { stage })).status).toBe(200);
    }
  };

  it('requires sign-in and starts with no requests (no seed data)', async () => {
    expect((await call(null, 'GET', '')).status).toBe(401);
    expect((await call('alice', 'GET', '')).body).toEqual([]);
    expect(requestStore.docs.size).toBe(0);
  });

  describe('creating', () => {
    it('stores the request with the signed-in person as its author', async () => {
      const request = await submit('alice', { ...NEW_REQUEST, useCase: 'Admin screens', priority: 'high' });
      expect(request).toMatchObject({ requestedBy: 'usr_alice', requestedByName: 'Alice', status: 'submitted', votes: 0, voters: [], priority: 'high' });
      expect(await stored(request.id)).toMatchObject({ title: 'Data table', requestedBy: 'usr_alice', useCase: 'Admin screens' });
    });

    it('rejects a forged author or any triage field in the body', async () => {
      for (const extra of [{ requestedBy: 'usr_bob' }, { status: 'approved' }, { votes: 99 }, { assignedTo: 'usr_alice' }, { metadata: { designApproved: true } }]) {
        expect((await call('alice', 'POST', '', { ...NEW_REQUEST, ...extra })).status).toBe(400);
      }
      expect((await call('alice', 'POST', '', { ...NEW_REQUEST, priority: 'urgent' })).status).toBe(400);
      expect((await call('alice', 'POST', '', { ...NEW_REQUEST, title: '  ' })).status).toBe(400);
      expect(requestStore.docs.size).toBe(0);
    });

    it('warns about similar requests but still creates the new one', async () => {
      await submit();
      const res = await call('bob', 'POST', '', { ...NEW_REQUEST, title: 'Data tables' });
      expect(res.status).toBe(201);
      expect(res.body.duplicateWarning).toBe(true);
      expect(res.body.similarRequests[0]).toMatchObject({ title: 'Data table' });
      expect(res.body.request.requestedBy).toBe('usr_bob');
      expect(requestStore.docs.size).toBe(2);
    });

    it('filters the list by status and author', async () => {
      const mine = await submit('alice');
      await submit('bob', { ...NEW_REQUEST, title: 'Date picker' });
      expect((await call('carol', 'GET', '?requestedBy=usr_alice')).body.map((r: ComponentRequest) => r.id)).toEqual([mine.id]);
      expect((await call('carol', 'GET', '?status=approved')).body).toEqual([]);
    });
  });

  describe('editing and deleting', () => {
    it('rejects mass assignment of status, votes, author, assignment and approval flags', async () => {
      const request = await submit();
      for (const body of [
        { status: 'approved' },
        { votes: 500 },
        { voters: ['usr_alice'] },
        { requestedBy: 'usr_bob' },
        { assignedTo: 'usr_alice' },
        { priority: 'critical' },
        { componentId: 'button' },
        { metadata: { designApproved: true, technicalApproved: true } },
      ]) {
        expect((await call('alice', 'PUT', `/${request.id}`, { title: 'Still mine', ...body })).status).toBe(400);
      }
      expect(await stored(request.id)).toMatchObject({ title: 'Data table', status: 'submitted', votes: 0, requestedBy: 'usr_alice', priority: 'medium' });
    });

    it('lets only the author edit the title, description and use case while the request is open', async () => {
      const request = await submit();
      expect((await call('bob', 'PUT', `/${request.id}`, { title: 'Hijacked' })).status).toBe(403);
      expect((await call('rita', 'PUT', `/${request.id}`, { title: 'Edited by triage' })).status).toBe(403);

      const edited = await call('alice', 'PUT', `/${request.id}`, { title: 'Data grid', useCase: 'Reports' });
      expect(edited.status).toBe(200);
      expect(await stored(request.id)).toMatchObject({ title: 'Data grid', useCase: 'Reports', description: NEW_REQUEST.description });

      expect((await call('rita', 'POST', `/${request.id}/reject`, { reason: 'Out of scope' })).status).toBe(200);
      expect((await call('alice', 'PUT', `/${request.id}`, { title: 'Please reconsider' })).status).toBe(403);
      expect((await call('alice', 'PUT', '/req_missing', { title: 'x' })).status).toBe(404);
    });

    it('lets the author delete an open request, and a roadmap editor delete any', async () => {
      const request = await submit();
      await call('bob', 'POST', `/${request.id}/comments`, { content: 'Yes please' });
      expect((await call('bob', 'DELETE', `/${request.id}`)).status).toBe(403);
      expect(requestStore.docs.has(request.id)).toBe(true);

      expect((await call('alice', 'DELETE', `/${request.id}`)).status).toBe(200);
      expect(requestStore.docs.has(request.id)).toBe(false);
      expect(commentStore.docs.size).toBe(0);

      const approved = await submit('alice', { ...NEW_REQUEST, title: 'Toast' });
      await approve(approved.id);
      expect((await call('alice', 'DELETE', `/${approved.id}`)).status).toBe(403);
      expect((await call('rita', 'DELETE', `/${approved.id}`)).status).toBe(200);
      expect(requestStore.docs.has(approved.id)).toBe(false);
    });
  });

  describe('votes', () => {
    it('counts one vote per person and toggles it', async () => {
      const request = await submit();
      expect((await call('bob', 'POST', `/${request.id}/vote`)).body).toMatchObject({ votes: 1, voters: ['usr_bob'] });
      expect((await call('carol', 'POST', `/${request.id}/vote`)).body).toMatchObject({ votes: 2, voters: ['usr_bob', 'usr_carol'] });
      expect((await call('bob', 'POST', `/${request.id}/vote`)).body).toMatchObject({ votes: 1, voters: ['usr_carol'] });
      expect(await stored(request.id)).toMatchObject({ votes: 1, voters: ['usr_carol'] });
      // A body can't vote for someone else
      expect((await call('bob', 'POST', `/${request.id}/vote`, { userId: 'usr_alice' })).body.voters).toEqual(['usr_carol', 'usr_bob']);
    });

    it('keeps both votes when two people vote at once', async () => {
      const request = await submit();
      await Promise.all(['alice', 'bob', 'carol'].map((who) => call(who, 'POST', `/${request.id}/vote`)));
      expect((await stored(request.id))!.votes).toBe(3);
    });
  });

  describe('comments', () => {
    it('stores comments as the signed-in person and returns them with the request, oldest first', async () => {
      const request = await submit();
      const first = await call('bob', 'POST', `/${request.id}/comments`, { content: 'Needs sorting' });
      expect(first.status).toBe(201);
      expect(first.body).toMatchObject({ author: 'usr_bob', authorName: 'Bob', content: 'Needs sorting' });
      await new Promise((r) => setTimeout(r, 5));
      await call('alice', 'POST', `/${request.id}/comments`, { content: 'And paging' });

      const detail = await call('carol', 'GET', `/${request.id}`);
      expect(detail.body.commentCount).toBe(2);
      expect(detail.body.comments.map((c: RequestComment) => c.content)).toEqual(['Needs sorting', 'And paging']);
      expect((await call('carol', 'GET', `/${request.id}/comments`)).body).toHaveLength(2);
    });

    it('rejects a forged author and notifies the request author, not the commenter', async () => {
      const request = await submit();
      expect((await call('bob', 'POST', `/${request.id}/comments`, { content: 'Hi', author: 'usr_alice' })).status).toBe(400);
      expect((await call('bob', 'POST', `/${request.id}/comments`, { content: '' })).status).toBe(400);
      expect((await call('bob', 'POST', '/req_missing/comments', { content: 'Hi' })).status).toBe(404);

      await call('alice', 'POST', `/${request.id}/comments`, { content: 'Mine' });
      expect(await notificationsFor('usr_alice')).toEqual([]);
      await call('bob', 'POST', `/${request.id}/comments`, { content: 'Hi' });
      expect(await notificationsFor('usr_alice')).toEqual(['New comment on "Data table"']);
      expect((await notificationStore.list({ where: { userId: 'usr_alice' } }))[0].message).toBe('Bob added a comment');
    });
  });

  describe('triage', () => {
    it('needs roadmap:edit for every triage route', async () => {
      const request = await submit();
      const routes: Array<[string, string, unknown?]> = [
        ['PATCH', 'status', { status: 'under-review' }],
        ['PATCH', 'priority', { priority: 'high' }],
        ['POST', 'assign', { userId: 'usr_alice' }],
        ['DELETE', 'assign'],
        ['POST', 'approve', {}],
        ['POST', 'reject', { reason: 'no' }],
        ['POST', 'promote', { componentId: 'button' }],
        ['POST', 'link-component', { componentId: 'button' }],
        ['POST', 'unlink-component'],
      ];
      for (const [method, route, body] of routes) {
        expect((await call('alice', method, `/${request.id}/${route}`, body)).status).toBe(403);
      }
      expect(await stored(request.id)).toMatchObject({ status: 'submitted', priority: 'medium' });
    });

    it('validates status changes and rejects body fields beyond status and comment', async () => {
      const request = await submit();
      expect((await call('rita', 'PATCH', `/${request.id}/status`, { status: 'released' })).status).toBe(400);
      expect((await call('rita', 'PATCH', `/${request.id}/status`, { status: 'under-review', userId: 'usr_bob' })).status).toBe(400);
      const res = await call('rita', 'PATCH', `/${request.id}/status`, { status: 'under-review', comment: 'Looking' });
      expect(res.status).toBe(200);
      expect(res.body.statusHistory.at(-1)).toMatchObject({ status: 'under-review', userId: 'usr_rita', comment: 'Looking' });
      expect(await notificationsFor('usr_alice')).toEqual(['Request "Data table" updated']);
    });

    it('approves in stages, puts the request on the roadmap and tells the author and voters', async () => {
      const request = await submit();
      await call('bob', 'POST', `/${request.id}/vote`);
      expect((await call('rita', 'POST', `/${request.id}/approve`, { stage: 'final' })).status).toBe(400);

      expect((await call('rita', 'POST', `/${request.id}/approve`, { stage: 'design' })).body).toMatchObject({
        status: 'under-review',
        metadata: { designApproved: true, technicalApproved: false },
      });
      await call('rita', 'POST', `/${request.id}/approve`, { stage: 'technical' });
      const approved = await call('rita', 'POST', `/${request.id}/approve`, { stage: 'final' });
      expect(approved.body.status).toBe('approved');
      expect(approved.body.metadata.roadmapItemId).toEqual(expect.any(String));
      expect((await designSystem.getRoadmap()).some((item: { title: string }) => item.title === 'Data table')).toBe(true);
      expect(await notificationsFor('usr_bob')).toEqual(['Request "Data table" approved']);
      expect(await notificationsFor('usr_alice')).toContain('Request "Data table" updated');
    });

    it('rejects with a reason and resets the approvals', async () => {
      const request = await submit();
      await call('rita', 'POST', `/${request.id}/approve`, { stage: 'design' });
      expect((await call('rita', 'POST', `/${request.id}/reject`, {})).status).toBe(400);
      const res = await call('rita', 'POST', `/${request.id}/reject`, { reason: 'Duplicate of the grid' });
      expect(res.body).toMatchObject({ status: 'rejected', metadata: { designApproved: false, rejectionReason: 'Duplicate of the grid' } });
    });

    it('assigns to an existing user, tells them, and unassigns', async () => {
      const request = await submit();
      expect((await call('rita', 'POST', `/${request.id}/assign`, { userId: 'usr_nobody' })).status).toBe(400);
      const res = await call('rita', 'POST', `/${request.id}/assign`, { userId: 'usr_carol' });
      expect(res.body).toMatchObject({ assignedTo: 'usr_carol', assignedToName: 'Carol' });
      expect(await notificationsFor('usr_carol')).toEqual(['Request assigned: "Data table"']);
      expect((await call('rita', 'DELETE', `/${request.id}/assign`)).body.assignedTo).toBeUndefined();
    });

    it('changes priority only through the priority route', async () => {
      const request = await submit();
      expect((await call('rita', 'PATCH', `/${request.id}/priority`, { priority: 'critical' })).body.priority).toBe('critical');
      expect((await call('rita', 'PATCH', `/${request.id}/priority`, { priority: 'urgent' })).status).toBe(400);
    });

    it('promotes approved requests and links components that exist', async () => {
      await designSystem.createComponent({ id: 'data-grid', name: 'Grid', description: 'x' });
      const request = await submit();
      expect((await call('rita', 'POST', `/${request.id}/promote`, { componentId: 'data-grid' })).status).toBe(400);
      await approve(request.id);
      expect((await call('rita', 'POST', `/${request.id}/promote`, { componentId: 'missing' })).status).toBe(400);
      const promoted = await call('rita', 'POST', `/${request.id}/promote`, { componentId: 'data-grid' });
      expect(promoted.body).toMatchObject({ status: 'in-progress', componentId: 'data-grid' });

      const linked = await call('rita', 'POST', `/${request.id}/link-component`, { componentId: 'data-grid' });
      expect(linked.body).toMatchObject({ status: 'completed', componentId: 'data-grid' });
      expect((await call('rita', 'POST', `/${request.id}/unlink-component`)).body.componentId).toBeUndefined();
    });
  });

  describe('storage and auto-linking', () => {
    it('keeps requests, votes and comments across a restart', async () => {
      const request = await submit();
      await call('bob', 'POST', `/${request.id}/vote`);
      await call('bob', 'POST', `/${request.id}/comments`, { content: 'Still wanted' });
      await app.close();
      jest.restoreAllMocks();

      await start();
      const detail = await call('carol', 'GET', `/${request.id}`);
      expect(detail.body).toMatchObject({ title: 'Data table', votes: 1, voters: ['usr_bob'], requestedBy: 'usr_alice' });
      expect(detail.body.comments.map((c: RequestComment) => c.content)).toEqual(['Still wanted']);
    });

    it('registers the linker once and links a triager\'s new component to the matching approved request', async () => {
      expect(registrations).toHaveBeenCalledTimes(1);
      const request = await submit();
      await approve(request.id);
      const other = await submit('bob', { ...NEW_REQUEST, title: 'Toast notification' });

      await designSystem.createComponent({ id: 'data-table', name: 'Data Table', description: 'Tables' }, await as('rita'));
      await settle();
      await settle();
      expect(await stored(request.id)).toMatchObject({ componentId: 'data-table', status: 'in-progress' });
      expect((await stored(request.id))!.statusHistory.at(-1)).toMatchObject({ userId: 'usr_rita' });
      expect((await stored(other.id))!.componentId).toBeUndefined();
    });

    it('links the request a new component names, completing an in-progress one as its creator', async () => {
      const request = await submit();
      await approve(request.id);
      await call('rita', 'PATCH', `/${request.id}/status`, { status: 'in-progress' });
      await designSystem.createComponent({ id: 'unrelated', name: 'Unrelated', description: 'x', linkedRequestId: request.id }, await as('rita'));
      await settle();
      await settle();
      expect(await stored(request.id)).toMatchObject({ componentId: 'unrelated', status: 'completed' });
      expect((await stored(request.id))!.statusHistory.at(-1)).toMatchObject({ userId: 'usr_rita' });
    });

    it('refuses a creator without triage rights who names someone else\'s request, and creates nothing', async () => {
      const request = await submit();
      await approve(request.id);
      await call('rita', 'PATCH', `/${request.id}/status`, { status: 'in-progress' });

      await expect(
        designSystem.createComponent({ id: 'dummy-link', name: 'Dummy', description: 'x', linkedRequestId: request.id }, await as('bob')),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        designSystem.createComponent({ id: 'dummy-anon', name: 'Dummy', description: 'x', linkedRequestId: request.id }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(designSystem.getComponentById('dummy-link')).toBeUndefined();
      expect(await stored(request.id)).toMatchObject({ status: 'in-progress' });
      expect((await stored(request.id))!.componentId).toBeUndefined();
    });

    it('does not match a crafted name to a request the creator may not fulfil', async () => {
      const request = await submit();
      await approve(request.id);
      await designSystem.createComponent({ id: 'data-table', name: 'Data Table', description: 'Tables' }, await as('bob'));
      await designSystem.createComponent({ id: 'data-table-2', name: 'Data Table', description: 'Tables' });
      await settle();
      await settle();
      expect(await stored(request.id)).toMatchObject({ status: 'approved' });
      expect((await stored(request.id))!.componentId).toBeUndefined();
    });

    it('lets the assignee fulfil their own request', async () => {
      const request = await submit();
      await approve(request.id);
      await call('rita', 'POST', `/${request.id}/assign`, { userId: 'usr_carol' });
      await designSystem.createComponent({ id: 'carol-table', name: 'Anything', description: 'x', linkedRequestId: request.id }, await as('carol'));
      await settle();
      await settle();
      expect(await stored(request.id)).toMatchObject({ componentId: 'carol-table', status: 'in-progress' });
      expect((await stored(request.id))!.statusHistory.at(-1)).toMatchObject({ userId: 'usr_carol' });
    });

    it('rejects a link to a request that is missing or not yet approved', async () => {
      const request = await submit();
      await expect(
        designSystem.createComponent({ id: 'early', name: 'Early', description: 'x', linkedRequestId: request.id }, await as('rita')),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        designSystem.createComponent({ id: 'ghost', name: 'Ghost', description: 'x', linkedRequestId: 'nope' }, await as('rita')),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it('reports analytics from the stored requests', async () => {
    const request = await submit();
    await submit('alice', { ...NEW_REQUEST, title: 'Date picker', category: 'form-controls' });
    await approve(request.id);
    const res = await call('carol', 'GET', '/analytics');
    expect(res.body).toMatchObject({
      totalRequests: 2,
      requestsByStatus: { approved: 1, submitted: 1 },
      requestsByCategory: { 'data-display': 1, 'form-controls': 1 },
      topRequesters: [{ userId: 'usr_alice', name: 'Alice', count: 2 }],
      fulfillmentRate: 50,
    });
  });
});
