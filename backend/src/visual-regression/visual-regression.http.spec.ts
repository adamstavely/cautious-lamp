import { createHmac } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission } from '../rbac/rbac.service';
import { SessionReplayController } from '../session-replay/session-replay.controller';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceDoc, WorkspaceRole } from '../workspaces/workspace.types';
import { ArgosApiClient } from './argos-api.client';
import { VisualRegressionGateway } from './visual-regression.gateway';
import { ArgosWebhookController, VisualRegressionController } from './visual-regression.controller';
import { VisualRegressionService } from './visual-regression.service';
import { createProjectServices } from './testing/services';

const PEOPLE = {
  owner: { id: 'usr_owner', name: 'Olive Owner', permissions: [] as string[] },
  editor: { id: 'usr_editor', name: 'Eddie Editor', permissions: [] as string[] },
  viewer: { id: 'usr_viewer', name: 'Vera Viewer', permissions: [] as string[] },
  outsider: { id: 'usr_outsider', name: 'Otto Outsider', permissions: [] as string[] },
  loner: { id: 'usr_loner', name: 'Lou Loner', permissions: [] as string[] },
  superuser: { id: 'usr_super', name: 'Sue Super', permissions: [Permission.ADMIN_USERS] as string[] },
  governance: { id: 'usr_gov', name: 'Gus Governance', permissions: [Permission.ADMIN_GOVERNANCE] as string[] },
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
      name: person.name,
      roles: [],
      permissions: new Set(person.permissions),
      mustChangePassword: false,
    };
  },
};

function workspace(id: string, members: Array<[Person, WorkspaceRole]>): WorkspaceDoc {
  const now = new Date().toISOString();
  return {
    id,
    name: id,
    description: '',
    slug: id,
    ownerId: PEOPLE.owner.id,
    members: members.map(([person, role]) => ({
      userId: PEOPLE[person].id,
      email: `${person}@example.com`,
      name: PEOPLE[person].name,
      role,
      addedAt: now,
      addedBy: { id: PEOPLE.owner.id, name: PEOPLE.owner.name },
    })),
    memberIds: members.map(([person]) => PEOPLE[person].id),
    settings: { allowExternalSharing: true, requireApprovalForSharing: false, defaultComponentStatus: 'in-progress' },
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: { id: PEOPLE.owner.id, name: PEOPLE.owner.name },
  };
}

/** Visual-regression and session-replay projects over HTTP: who can do what */
describe('Project access over HTTP (visual regression and session replay)', () => {
  let app: INestApplication;
  let base: string;
  let services: ReturnType<typeof createProjectServices>;
  const WS = 'ws_team';

  beforeAll(async () => {
    jest.spyOn(ArgosApiClient.prototype, 'verifyConnection').mockResolvedValue(true);
    jest.spyOn(ArgosApiClient.prototype, 'getProject').mockResolvedValue({ id: 'argos-1', name: 'a', repository: 'r', branch: 'main' });
    jest.spyOn(ArgosApiClient.prototype, 'getBuilds').mockResolvedValue([]);
    jest.spyOn(ArgosApiClient.prototype, 'getBuild').mockResolvedValue({ id: 'b1', status: 'progress' } as any);
    jest.spyOn(ArgosApiClient.prototype, 'createBuild').mockResolvedValue({
      id: 'b1',
      projectId: 'argos-1',
      branch: 'main',
      commit: 'abc',
      status: 'progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    jest.spyOn(ArgosApiClient.prototype, 'approveScreenshot').mockResolvedValue(undefined);
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask', 'hrtime', 'performance', 'Date'] });

    const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    await workspaces.create(workspace(WS, [['owner', 'owner'], ['editor', 'editor'], ['viewer', 'viewer']]));
    services = createProjectServices(workspaces);

    const moduleRef = await Test.createTestingModule({
      controllers: [VisualRegressionController, ArgosWebhookController, SessionReplayController],
      providers: [
        { provide: VisualRegressionService, useValue: services.visualRegression },
        { provide: SessionReplayService, useValue: services.sessionReplay },
        { provide: AuthService, useValue: auth },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    // rawBody as in main.ts, so webhook signatures are checked over the exact bytes
    app = moduleRef.createNestApplication({ logger: false, rawBody: true });
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    await app.close();
  });

  const call = async (as: Person, method: string, route: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer tok-${as}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  const vrBody = (extra: Record<string, unknown> = {}) => ({ name: 'Web', argosProjectId: 'argos-1', argosToken: 'tok', ...extra });

  describe('visual regression', () => {
    let project: any;

    beforeAll(async () => {
      const res = await call('editor', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS }));
      expect(res.status).toBe(201);
      project = res.body;
    });

    it('creates projects in a workspace only for its editors', async () => {
      expect(project).toMatchObject({ workspaceId: WS, teamId: WS, createdBy: { type: 'user', id: PEOPLE.editor.id } });
      expect(project).not.toHaveProperty('argosToken');
      expect((await call('viewer', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS }))).status).toBe(403);
      expect((await call('outsider', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS }))).status).toBe(404);
      expect((await call('superuser', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS }))).status).toBe(201);
    });

    it('hides projects from people outside the workspace', async () => {
      const id = project.id;
      for (const [method, route, body] of [
        ['GET', `/visual-regression/projects/${id}`],
        ['PUT', `/visual-regression/projects/${id}`, { name: 'Hijacked' }],
        ['DELETE', `/visual-regression/projects/${id}`],
        ['POST', `/visual-regression/projects/${id}/runs`, {}],
        ['GET', `/visual-regression/projects/${id}/runs`],
        ['GET', `/visual-regression/projects/${id}/analytics`],
        ['GET', `/visual-regression/projects/${id}/baselines`],
        ['GET', `/visual-regression/projects/${id}/notifications`],
        ['POST', `/visual-regression/projects/${id}/notifications`, { type: 'webhook', config: {} }],
      ] as Array<[string, string, unknown?]>) {
        expect([method, route, (await call('outsider', method, route, body)).status]).toEqual([method, route, 404]);
      }
      const list = await call('outsider', 'GET', '/visual-regression/projects');
      expect(list.body.map((p: any) => p.id)).not.toContain(id);
      expect((await call('outsider', 'GET', `/visual-regression/projects?workspaceId=${WS}`)).body).toEqual([]);
      expect((await call('superuser', 'GET', `/visual-regression/projects/${id}`)).status).toBe(200);
      expect((await services.visualRegression.getProject(id)).name).toBe('Web');
    });

    it('lets viewers read but not change or run', async () => {
      const id = project.id;
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}`)).status).toBe(200);
      expect((await call('viewer', 'GET', '/visual-regression/projects')).body.map((p: any) => p.id)).toContain(id);
      expect((await call('viewer', 'PUT', `/visual-regression/projects/${id}`, { name: 'Nope' })).status).toBe(403);
      expect((await call('viewer', 'DELETE', `/visual-regression/projects/${id}`)).status).toBe(403);
      expect((await call('viewer', 'POST', `/visual-regression/projects/${id}/runs`, {})).status).toBe(403);
      expect((await call('editor', 'PUT', `/visual-regression/projects/${id}`, { name: 'Web 2' })).body.name).toBe('Web 2');
    });

    it('sets a webhook secret for managers only, never returns it again, and accepts signed Argos webhooks', async () => {
      const created = await call('editor', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS, argosProjectId: 'argos-hooks' }));
      const id = created.body.id;
      expect(created.body.hasWebhookSecret).toBe(false);
      const route = `/visual-regression/projects/${id}/webhook-secret`;
      expect((await call('outsider', 'POST', route, {})).status).toBe(404);
      expect((await call('viewer', 'POST', route, {})).status).toBe(403);
      expect((await call('editor', 'POST', route, { secret: 'too short' })).status).toBe(400);

      const set = await call('editor', 'POST', route, {});
      expect(set.status).toBe(201);
      const secret: string = set.body.secret;
      expect(secret).toMatch(/^whsec_[0-9a-f]{64}$/);
      const read = await call('viewer', 'GET', `/visual-regression/projects/${id}`);
      expect(read.body.hasWebhookSecret).toBe(true);
      expect(JSON.stringify(read.body)).not.toContain(secret);
      expect(JSON.stringify((await call('editor', 'GET', '/visual-regression/projects')).body)).not.toContain(secret);

      // Signed over the exact bytes sent, which JSON.stringify of the parsed body wouldn't reproduce
      const raw = '{ "projectId": "argos-hooks",  "buildId": "b-unknown" }';
      const post = (signature: string) =>
        fetch(`${base}/api/v1/visual-regression/webhooks/argos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-argos-signature': signature, 'x-argos-event': 'build.updated' },
          body: raw,
        });
      const sign = (key: string, body: string) => `sha256=${createHmac('sha256', key).update(body).digest('hex')}`;
      const accepted = await post(sign(secret, raw));
      expect(accepted.status).toBe(200);
      expect(await accepted.json()).toMatchObject({ processed: true });
      expect((await post(sign(secret, raw.replace('b-unknown', 'b-other')))).status).toBe(401);
      expect((await post(sign('whsec_wrong_secret_value_000', raw))).status).toBe(401);

      // A chosen secret works too; clearing it refuses webhooks again
      expect((await call('editor', 'POST', route, { secret: 'my-chosen-secret-1234' })).status).toBe(201);
      expect((await post(sign('my-chosen-secret-1234', raw))).status).toBe(200);
      expect((await post(sign(secret, raw))).status).toBe(401);
      expect((await call('viewer', 'DELETE', route)).status).toBe(403);
      expect((await call('editor', 'DELETE', route)).status).toBe(204);
      expect((await post(sign('my-chosen-secret-1234', raw))).status).toBe(401);
      expect((await call('editor', 'GET', `/visual-regression/projects/${id}`)).body.hasWebhookSecret).toBe(false);
    });

    it('checks the run and result behind run and result routes', async () => {
      const run = await call('editor', 'POST', `/visual-regression/projects/${project.id}/runs`, { branch: 'main' });
      expect(run.status).toBe(201);
      const runId = run.body.id;
      expect((await call('viewer', 'GET', `/visual-regression/runs/${runId}`)).status).toBe(200);
      expect((await call('outsider', 'GET', `/visual-regression/runs/${runId}`)).status).toBe(404);
      expect((await call('outsider', 'GET', `/visual-regression/runs/${runId}/results`)).status).toBe(404);

      // Give the run a result, as a finished Argos build would
      const stored = (await services.vrRuns.get(runId))!.doc;
      const result = { id: `result-shot1-${runId}`, runId, argosScreenshotId: 'shot1', testName: 'home', status: 'failed' as const, approved: false };
      services.vrRuns.forceWrite({ ...stored, results: [result], resultIds: [result.id] });

      expect((await call('outsider', 'POST', `/visual-regression/results/${result.id}/approve`)).status).toBe(404);
      expect((await call('viewer', 'POST', `/visual-regression/results/${result.id}/approve`)).status).toBe(403);
      expect((await call('editor', 'POST', `/visual-regression/results/${result.id}/approve`)).status).toBe(200);
      const results = await call('viewer', 'GET', `/visual-regression/runs/${runId}/results`);
      expect(results.body.data[0]).toMatchObject({ approved: true, approvedBy: PEOPLE.editor.id });
    });

    it('answers 501 for features that are not implemented instead of pretending', async () => {
      const id = project.id;
      const runs = await services.vrRuns.findAny([{ projectId: id }]);
      const baseline = await call('editor', 'POST', `/visual-regression/projects/${id}/baselines`, { name: 'v1', runId: runs[0].id });
      expect(baseline.status).toBe(201);
      expect(baseline.body.createdBy).toBe(PEOPLE.editor.id);
      const rollback = await call('editor', 'POST', `/visual-regression/projects/${id}/baselines/${baseline.body.id}/rollback`);
      expect(rollback.status).toBe(501);
      expect(rollback.body.message).toMatch(/not implemented/i);
      expect((await call('editor', 'POST', `/visual-regression/projects/${id}/baselines/baseline-nope/rollback`)).status).toBe(404);
      const pdf = await call('viewer', 'GET', `/visual-regression/projects/${id}/reports/pdf`);
      expect(pdf.status).toBe(501);
      expect(pdf.body).not.toHaveProperty('reportUrl');
      expect((await call('editor', 'POST', `/visual-regression/projects/${id}/share`, { teamId: 'x', role: 'admin' })).status).toBe(501);
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}/teams`)).body).toMatchObject({ workspaceId: WS });
    });

    it('gives projects without a workspace to their creator only', async () => {
      const mine = (await call('loner', 'POST', '/visual-regression/projects', vrBody())).body;
      expect(mine).toMatchObject({ workspaceId: null, createdBy: { id: PEOPLE.loner.id } });
      expect((await call('loner', 'GET', `/visual-regression/projects/${mine.id}`)).status).toBe(200);
      expect((await call('loner', 'GET', '/visual-regression/projects')).body.map((p: any) => p.id)).toEqual([mine.id]);
      for (const other of ['owner', 'editor', 'governance'] as Person[]) {
        expect((await call(other, 'GET', `/visual-regression/projects/${mine.id}`)).status).toBe(404);
        expect((await call(other, 'DELETE', `/visual-regression/projects/${mine.id}`)).status).toBe(404);
      }
      expect((await call('superuser', 'GET', `/visual-regression/projects/${mine.id}`)).status).toBe(200);
      expect((await call('loner', 'DELETE', `/visual-regression/projects/${mine.id}`)).status).toBe(200);
    });

    it('lets admin:governance holders use application-linked projects', async () => {
      const linked = await services.visualRegression.createProject('t', vrBody() as any, {
        workspaceId: null,
        applicationId: 'app_1',
        createdBy: { type: 'user', id: 'usr_someone', name: 'Someone' },
      });
      expect((await call('governance', 'GET', `/visual-regression/projects/${linked.id}`)).status).toBe(200);
      expect((await call('outsider', 'GET', `/visual-regression/projects/${linked.id}`)).status).toBe(404);
    });

    it('keeps projects and runs in storage, so a restarted service still has them', async () => {
      const restarted = createProjectServices(services.workspaceStore);
      const again = new VisualRegressionService(services.vrProjects, services.vrRuns, restarted.access, services.encryption);
      expect((await again.getProject(project.id)).name).toBe('Web 2');
      const runs = await again.getTestRuns(project.id);
      expect(runs.data.length).toBeGreaterThan(0);
      // The token is stored encrypted, never in the clear
      expect((await services.vrProjects.get(project.id))!.doc.argosToken).not.toBe('tok');
    });

    it('only subscribes WebSocket clients to projects and runs they can read', async () => {
      const gateway = new VisualRegressionGateway(services.visualRegression, auth as unknown as AuthService);
      const socket = (person: Person) => {
        const joined: string[] = [];
        return {
          id: `sock-${person}`,
          handshake: { auth: { token: `tok-${person}` }, headers: {} },
          data: {} as Record<string, unknown>,
          emit: jest.fn(),
          disconnect: jest.fn(),
          join: (room: string) => joined.push(room),
          joined,
        };
      };
      const outsider = socket('outsider');
      await gateway.handleConnection(outsider as any);
      expect(await gateway.handleSubscribeProject(outsider as any, { projectId: project.id })).toMatchObject({ success: false });
      const runId = (await services.vrRuns.findAny([{ projectId: project.id }]))[0].id;
      expect(await gateway.handleSubscribeRun(outsider as any, { runId })).toMatchObject({ success: false });
      expect(outsider.joined).toEqual([]);

      const viewer = socket('viewer');
      await gateway.handleConnection(viewer as any);
      expect(await gateway.handleSubscribeProject(viewer as any, { projectId: project.id })).toMatchObject({ success: true });
      expect(await gateway.handleSubscribeRun(viewer as any, { runId })).toMatchObject({ success: true });
      expect(viewer.joined).toEqual([`project:${project.id}`, `run:${runId}`]);
    });
  });

  describe('session replay', () => {
    let project: any;

    beforeAll(async () => {
      const res = await call('editor', 'POST', '/session-replay/projects', { name: 'Replay', openreplayProjectKey: '7', workspaceId: WS });
      expect(res.status).toBe(201);
      project = res.body;
    });

    it('checks workspace access on every route', async () => {
      const id = project.id;
      for (const [method, route, body] of [
        ['GET', `/session-replay/projects/${id}`],
        ['PUT', `/session-replay/projects/${id}`, { name: 'Hijacked' }],
        ['DELETE', `/session-replay/projects/${id}`],
        ['GET', `/session-replay/projects/${id}/integration-code`],
        ['GET', `/session-replay/projects/${id}/sessions`],
        ['GET', `/session-replay/projects/${id}/sessions/s-1`],
        ['GET', `/session-replay/projects/${id}/heatmaps-url`],
      ] as Array<[string, string, unknown?]>) {
        expect([method, route, (await call('outsider', method, route, body)).status]).toEqual([method, route, 404]);
      }
      expect((await call('outsider', 'GET', '/session-replay/projects')).body.map((p: any) => p.id)).not.toContain(id);
      expect((await call('viewer', 'GET', `/session-replay/projects/${id}`)).status).toBe(200);
      expect((await call('viewer', 'PUT', `/session-replay/projects/${id}`, { name: 'Nope' })).status).toBe(403);
      expect((await call('viewer', 'POST', '/session-replay/projects', { name: 'X', openreplayProjectKey: '1', workspaceId: WS })).status).toBe(403);
      expect((await call('editor', 'PUT', `/session-replay/projects/${id}`, { name: 'Replay 2', workspaceId: 'ws_other' })).body).toMatchObject({
        name: 'Replay 2',
        workspaceId: WS,
      });
    });

    it('shows no made-up sessions: without an API key it says OpenReplay is not configured', async () => {
      const id = project.id;
      for (const route of [`/session-replay/projects/${id}/sessions`, `/session-replay/projects/${id}/sessions/s-1`]) {
        const res = await call('viewer', 'GET', route);
        expect(res.status).toBe(503);
        expect(res.body).toMatchObject({ code: 'OPENREPLAY_NOT_CONFIGURED' });
      }
      // The heatmap link is OpenReplay's own page, never a local mock
      const heatmaps = await call('viewer', 'GET', `/session-replay/projects/${id}/heatmaps-url`);
      expect(heatmaps.status).toBe(200);
      expect(JSON.stringify(heatmaps.body)).toContain('https://api.openreplay.com/project/7/heatmaps');
      expect(JSON.stringify(heatmaps.body)).not.toContain('mock');

      // A project id that isn't OpenReplay's numeric one is refused, not read as project 1
      const named = await call('editor', 'POST', '/session-replay/projects', { name: 'Named', openreplayProjectKey: 'abc-key', workspaceId: WS });
      expect((await call('editor', 'GET', `/session-replay/projects/${named.body.id}/heatmaps-url`)).status).toBe(400);
    });

    it('persists projects across a restart', async () => {
      const again = new SessionReplayService(services.srProjects, services.access, services.encryption);
      expect((await again.getProject(project.id)).name).toBe('Replay 2');
    });
  });
});
