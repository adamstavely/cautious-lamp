import { createHmac } from 'crypto';
import { INestApplication } from '@nestjs/common';
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
import { UsersService } from '../auth/users.service';
import { ArgosApiClient, ArgosApiError, ArgosBuild, ArgosSnapshotDiff } from './argos-api.client';
import { ArgosWebhookController, VisualRegressionController } from './visual-regression.controller';
import { VisualRegressionService } from './visual-regression.service';
import { createProjectServices } from './testing/services';
import { globalValidationPipe } from '../common/validation/global-validation';

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

const BUILD: ArgosBuild = {
  id: 'b1',
  number: 7,
  head: { sha: 'abc1234', branch: 'feature' },
  base: { sha: 'def5678', branch: 'main' },
  status: 'changes-detected',
  conclusion: 'changes-detected',
  stats: null,
  metadata: { testReport: { status: 'passed', stats: { startTime: '2026-11-10T10:00:00.000Z', duration: 42000 } } },
  url: 'https://app.argos-ci.com/acme/web/builds/7',
};

const shot = (id: string, name: string) => ({ id, name, url: `https://files.argos-ci.com/${name}.png`, width: 1280, height: 800 });
const DIFFS: ArgosSnapshotDiff[] = [
  { id: 'd1', name: 'home', status: 'changed', score: 0.12, url: 'https://files.argos-ci.com/d1-diff.png', base: shot('s1', 'home-base'), head: shot('s2', 'home-head') },
  { id: 'd2', name: 'about', status: 'unchanged', score: 0, url: null, base: shot('s3', 'about'), head: shot('s4', 'about') },
];

const users = {
  async findByEmail(email: string) {
    const key = (Object.keys(PEOPLE) as Person[]).find((p) => `${p}@example.com` === email.toLowerCase());
    return key ? { id: PEOPLE[key].id, email: `${key}@example.com`, name: PEOPLE[key].name, status: 'active' } : null;
  },
};

/** Visual-regression and session-replay projects over HTTP: who can do what */
describe('Project access over HTTP (visual regression and session replay)', () => {
  let app: INestApplication;
  let base: string;
  let services: ReturnType<typeof createProjectServices>;
  const WS = 'ws_team';

  beforeAll(async () => {
    // Argos itself can't be reached from tests: its client is mocked with the v2 API's shapes
    jest.spyOn(ArgosApiClient.prototype, 'verify').mockResolvedValue({
      ok: true,
      project: { id: 'argos-1', name: 'web', account: { id: 'acc', slug: 'acme' }, defaultBaseBranch: 'main' },
    });
    jest.spyOn(ArgosApiClient.prototype, 'listBuilds').mockResolvedValue({ pageInfo: { total: 1, page: 1, perPage: 30 }, results: [BUILD] });
    jest.spyOn(ArgosApiClient.prototype, 'getBuild').mockResolvedValue(BUILD);
    jest.spyOn(ArgosApiClient.prototype, 'listBuildDiffs').mockResolvedValue(DIFFS);
    jest.spyOn(ArgosApiClient.prototype, 'reviewSnapshots').mockResolvedValue(undefined);
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
        { provide: UsersService, useValue: users },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    // rawBody as in main.ts, so webhook signatures are checked over the exact bytes
    app = moduleRef.createNestApplication({ logger: false, rawBody: true });
    app.useGlobalPipes(globalValidationPipe());
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

  const vrBody = (extra: Record<string, unknown> = {}) => ({ name: 'Web', argosProjectId: 'acme/web', argosToken: 'tok', ...extra });

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

    it('refuses a project Argos refuses, saying why', async () => {
      const verify = jest.mocked(ArgosApiClient.prototype.verify);
      verify.mockResolvedValueOnce({ ok: false, reason: 'unauthorized', status: 401, message: 'Argos refused the token.' });
      expect(await call('loner', 'POST', '/visual-regression/projects', vrBody())).toMatchObject({ status: 400, body: { message: 'Argos refused the token.' } });
      verify.mockResolvedValueOnce({ ok: false, reason: 'project_not_found', status: 404, message: 'Argos has no project acme/nope.' });
      expect((await call('loner', 'POST', '/visual-regression/projects', vrBody({ argosProjectId: 'acme/nope' }))).status).toBe(400);
      verify.mockResolvedValueOnce({ ok: false, reason: 'unreachable', message: 'Argos could not be reached.' });
      expect((await call('loner', 'POST', '/visual-regression/projects', vrBody())).status).toBe(502);
      expect((await call('loner', 'GET', '/visual-regression/projects')).body).toEqual([]);
    });

    it('hides projects from people outside the workspace', async () => {
      const id = project.id;
      for (const [method, route, body] of [
        ['GET', `/visual-regression/projects/${id}`],
        ['PUT', `/visual-regression/projects/${id}`, { name: 'Hijacked' }],
        ['DELETE', `/visual-regression/projects/${id}`],
        ['GET', `/visual-regression/projects/${id}/runs`],
        ['GET', `/visual-regression/projects/${id}/ci-setup`],
        ['GET', `/visual-regression/projects/${id}/analytics`],
        ['GET', `/visual-regression/projects/${id}/baselines`],
        ['GET', `/visual-regression/projects/${id}/shares`],
        ['POST', `/visual-regression/projects/${id}/share`, { email: 'outsider@example.com', role: 'editor' }],
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

    it('lets viewers read but not change', async () => {
      const id = project.id;
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}`)).status).toBe(200);
      expect((await call('viewer', 'GET', '/visual-regression/projects')).body.map((p: any) => p.id)).toContain(id);
      expect((await call('viewer', 'PUT', `/visual-regression/projects/${id}`, { name: 'Nope' })).status).toBe(403);
      expect((await call('viewer', 'DELETE', `/visual-regression/projects/${id}`)).status).toBe(403);
      expect((await call('editor', 'PUT', `/visual-regression/projects/${id}`, { name: 'Web 2' })).body.name).toBe('Web 2');
    });

    it('has no route that pretends to start a run: builds come from CI uploads', async () => {
      expect((await call('editor', 'POST', `/visual-regression/projects/${project.id}/runs`, {})).status).toBe(404);
    });

    it('saves test settings and emits them into the CI setup', async () => {
      const id = project.id;
      const config = {
        testDirectories: ['tests/visual'],
        viewports: ['iphone-16', '1280x800'],
        browsers: ['chromium', 'webkit'],
        ignorePatterns: ['**/flaky-*.png'],
        screenshotOptions: { fullPage: true, waitForSelector: '[data-ready]', waitForTimeout: 250 },
      };
      expect((await call('editor', 'PUT', `/visual-regression/projects/${id}`, { config: { ...config, browsers: ['netscape'] } })).status).toBe(400);
      expect((await call('editor', 'PUT', `/visual-regression/projects/${id}`, { config: { viewports: ['huge; rm -rf /'] } })).status).toBe(400);
      expect((await call('editor', 'PUT', `/visual-regression/projects/${id}`, { config })).body.config).toEqual(config);

      const setup = (await call('viewer', 'GET', `/visual-regression/projects/${id}/ci-setup`)).body;
      expect(setup.uploadCommand).toBe("npx @argos-ci/cli upload ./screenshots \\\n  --reference-branch 'develop' \\\n  --ignore '**/flaky-*.png'");
      expect(setup.playwrightConfig).toContain(`testMatch: ["tests/visual/**/*.spec.ts"]`);
      expect(setup.playwrightConfig).toContain(`{ name: "webkit", use: { ...devices["Desktop Safari"] } }`);
      expect(setup.screenshotHelper).toContain(`viewports: ["iphone-16", { width: 1280, height: 800 }], fullPage: true`);
      expect(setup.screenshotHelper).toContain(`await page.waitForSelector("[data-ready]");`);
      expect(setup.screenshotHelper).toContain(`await page.waitForTimeout(250);`);
      expect(setup).not.toHaveProperty('notifyCommand');
    });

    it('sets a webhook secret for managers only, never returns it again, and accepts signed build notifications', async () => {
      const created = await call('editor', 'POST', '/visual-regression/projects', vrBody({ workspaceId: WS, argosProjectId: 'acme/hooks' }));
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
      // The CI setup now includes the signed notification
      const setup = (await call('viewer', 'GET', `/visual-regression/projects/${id}/ci-setup`)).body;
      expect(setup.notifyCommand).toContain('/api/v1/visual-regression/webhooks/argos');
      expect(setup.notifyCommand).toContain('$ARGOS_WEBHOOK_SECRET');
      expect(setup.notifyCommand).not.toContain(secret);

      // Signed over the exact bytes sent, which JSON.stringify of the parsed body wouldn't reproduce
      const raw = '{ "projectId": "acme/hooks",  "buildNumber": 7 }';
      const post = (signature: string, body = raw) =>
        fetch(`${base}/api/v1/visual-regression/webhooks/argos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-argos-signature': signature },
          body,
        });
      const sign = (key: string, body: string) => `sha256=${createHmac('sha256', key).update(body).digest('hex')}`;
      const accepted = await post(sign(secret, raw));
      expect(accepted.status).toBe(200);
      expect(await accepted.json()).toMatchObject({ processed: true });
      // The notified build was read from Argos at once
      const runs = await services.vrRuns.findAny([{ projectId: id }]);
      expect(runs.map((r) => r.argosBuildNumber)).toEqual([7]);
      expect((await post(sign(secret, raw.replace('7', '8')), raw)).status).toBe(401);
      expect((await post(sign('whsec_wrong_secret_value_000', raw))).status).toBe(401);

      // A chosen secret works too; clearing it refuses notifications again
      expect((await call('editor', 'POST', route, { secret: 'my-chosen-secret-1234' })).status).toBe(201);
      expect((await post(sign('my-chosen-secret-1234', raw))).status).toBe(200);
      expect((await post(sign(secret, raw))).status).toBe(401);
      expect((await call('viewer', 'DELETE', route)).status).toBe(403);
      expect((await call('editor', 'DELETE', route)).status).toBe(204);
      expect((await post(sign('my-chosen-secret-1234', raw))).status).toBe(401);
      expect((await call('editor', 'GET', `/visual-regression/projects/${id}`)).body.hasWebhookSecret).toBe(false);
    });

    it('reads runs from Argos builds, filters them by date, and checks the run and result behind run and result routes', async () => {
      const listed = await call('viewer', 'GET', `/visual-regression/projects/${project.id}/runs`);
      expect(listed.status).toBe(200);
      const run = listed.body.data[0];
      expect(run).toMatchObject({
        argosBuildNumber: 7,
        argosStatus: 'changes-detected',
        status: 'completed',
        branch: 'feature',
        commitSha: 'abc1234',
        startedAt: '2026-11-10T10:00:00.000Z',
        durationMs: 42000,
        resultsSummary: { total: 2, passed: 1, failed: 1, new: 0, removed: 0 },
      });
      expect(run.commitSha).not.toMatch(/^commit-/);
      const inRange = await call('viewer', 'GET', `/visual-regression/projects/${project.id}/runs?from=2026-11-10&to=2026-11-10`);
      expect(inRange.body.data.map((r: any) => r.id)).toEqual([run.id]);
      expect((await call('viewer', 'GET', `/visual-regression/projects/${project.id}/runs?from=2026-11-11`)).body.data).toEqual([]);
      expect((await call('viewer', 'GET', `/visual-regression/projects/${project.id}/runs?to=2026-11-09`)).body.data).toEqual([]);

      const runId = run.id;
      expect((await call('viewer', 'GET', `/visual-regression/runs/${runId}`)).status).toBe(200);
      expect((await call('outsider', 'GET', `/visual-regression/runs/${runId}`)).status).toBe(404);
      expect((await call('outsider', 'GET', `/visual-regression/runs/${runId}/results`)).status).toBe(404);

      const results = (await call('viewer', 'GET', `/visual-regression/runs/${runId}/results`)).body.data;
      const changed = results.find((r: any) => r.testName === 'home');
      expect(changed).toMatchObject({
        status: 'failed',
        approved: false,
        argosScreenshotId: 'd1',
        diffImageUrl: 'https://files.argos-ci.com/d1-diff.png',
        baselineImageUrl: 'https://files.argos-ci.com/home-base.png',
        currentImageUrl: 'https://files.argos-ci.com/home-head.png',
      });
      expect((await call('outsider', 'POST', `/visual-regression/results/${changed.id}/approve`)).status).toBe(404);
      expect((await call('viewer', 'POST', `/visual-regression/results/${changed.id}/approve`)).status).toBe(403);
      expect((await call('editor', 'POST', `/visual-regression/results/${changed.id}/approve`)).status).toBe(200);
      expect(ArgosApiClient.prototype.reviewSnapshots).toHaveBeenLastCalledWith('acme/web', 7, [{ id: 'd1', conclusion: 'APPROVE' }], expect.any(String));
      const after = await call('viewer', 'GET', `/visual-regression/runs/${runId}/results`);
      expect(after.body.data.find((r: any) => r.id === changed.id)).toMatchObject({ approved: true, approvedBy: PEOPLE.editor.id });

      // Argos refuses reviews from project tokens; say so instead of pretending it worked
      jest.mocked(ArgosApiClient.prototype.reviewSnapshots).mockRejectedValueOnce(new ArgosApiError('Argos answered 403', 403));
      const refused = await call('editor', 'POST', `/visual-regression/results/${changed.id}/reject`);
      expect(refused.status).toBe(400);
      expect(refused.body.message).toMatch(/personal access token/);
    });

    it('versions baselines and rolls back to an earlier one, which the CI upload then compares against', async () => {
      const id = project.id;
      const [run] = await services.vrRuns.findAny([{ projectId: id }]);
      const v1 = await call('editor', 'POST', `/visual-regression/projects/${id}/baselines`, { name: 'v1', runId: run.id });
      expect(v1.status).toBe(201);
      expect(v1.body).toMatchObject({ createdBy: PEOPLE.editor.id, commitSha: 'abc1234', argosBuildNumber: 7, current: true });
      // A second version from another build
      const other = { ...run, id: 'vr-run-b2', argosBuildId: 'b2', argosBuildNumber: 8, commitSha: 'fff9999', results: [], resultIds: [] };
      services.vrRuns.forceWrite(other);
      const v2 = await call('editor', 'POST', `/visual-regression/projects/${id}/baselines`, { name: 'v2', runId: other.id });
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}/ci-setup`)).body.uploadCommand).toContain("--reference-commit 'fff9999'");

      const listed = (await call('viewer', 'GET', `/visual-regression/projects/${id}/baselines`)).body;
      expect(listed.map((b: any) => [b.name, b.current])).toEqual([['v2', true], ['v1', false]]);

      expect((await call('viewer', 'POST', `/visual-regression/projects/${id}/baselines/${v1.body.id}/rollback`)).status).toBe(403);
      expect((await call('editor', 'POST', `/visual-regression/projects/${id}/baselines/baseline-nope/rollback`)).status).toBe(404);
      expect((await call('editor', 'POST', `/visual-regression/projects/${id}/baselines/${v2.body.id}/rollback`)).status).toBe(409);
      const rollback = await call('editor', 'POST', `/visual-regression/projects/${id}/baselines/${v1.body.id}/rollback`);
      expect(rollback).toMatchObject({ status: 200, body: { id: v1.body.id, current: true } });

      // The later version is kept, and the upload compares against v1's commit again
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}/baselines`)).body.map((b: any) => [b.name, b.current])).toEqual([
        ['v2', false],
        ['v1', true],
      ]);
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}/ci-setup`)).body.uploadCommand).toContain("--reference-commit 'abc1234'");
      const history = (await call('viewer', 'GET', `/visual-regression/projects/${id}/baselines/history`)).body;
      expect(history[0]).toMatchObject({ baselineId: v1.body.id, action: 'rolled-back', previousBaselineId: v2.body.id, by: PEOPLE.editor.id });
      // Still stored after a restart
      const again = new VisualRegressionService(services.vrProjects, services.vrRuns, services.access, services.encryption);
      expect((await again.getProject(id)).currentBaselineId).toBe(v1.body.id);
    });

    it('shares a project with one person, as viewer or editor, for managers only', async () => {
      const id = project.id;
      const share = `/visual-regression/projects/${id}/share`;
      expect((await call('outsider', 'GET', `/visual-regression/projects/${id}`)).status).toBe(404);
      expect((await call('viewer', 'POST', share, { email: 'outsider@example.com', role: 'viewer' })).status).toBe(403);
      expect((await call('editor', 'POST', share, { email: 'nobody@example.com', role: 'viewer' })).status).toBe(404);
      expect((await call('editor', 'POST', share, { email: 'outsider@example.com', role: 'admin' })).status).toBe(400);

      const granted = await call('editor', 'POST', share, { email: 'Outsider@Example.com', role: 'viewer' });
      expect(granted).toMatchObject({ status: 201, body: { userId: PEOPLE.outsider.id, role: 'viewer', grantedBy: { id: PEOPLE.editor.id } } });
      expect((await call('outsider', 'GET', `/visual-regression/projects/${id}`)).status).toBe(200);
      expect((await call('outsider', 'GET', '/visual-regression/projects')).body.map((p: any) => p.id)).toContain(id);
      const [run] = await services.vrRuns.findAny([{ projectId: id }]);
      const resultId = run.results[0].id;
      // A viewer share reads but can't review, roll back or manage
      expect((await call('outsider', 'POST', `/visual-regression/results/${resultId}/approve`)).status).toBe(403);
      expect((await call('outsider', 'PUT', `/visual-regression/projects/${id}`, { name: 'Mine' })).status).toBe(403);
      expect((await call('outsider', 'GET', `/visual-regression/projects/${id}/shares`)).status).toBe(403);

      // An editor share can review, but still not manage
      expect((await call('editor', 'POST', share, { email: 'outsider@example.com', role: 'editor' })).status).toBe(201);
      expect((await call('outsider', 'POST', `/visual-regression/results/${resultId}/approve`)).status).toBe(200);
      expect((await call('outsider', 'DELETE', `/visual-regression/projects/${id}`)).status).toBe(403);
      expect((await call('editor', 'GET', `/visual-regression/projects/${id}/shares`)).body.map((s: any) => [s.userId, s.role])).toEqual([
        [PEOPLE.outsider.id, 'editor'],
      ]);
      // Shares aren't part of the project as readers see it
      expect((await call('viewer', 'GET', `/visual-regression/projects/${id}`)).body).not.toHaveProperty('sharedWith');

      expect((await call('editor', 'DELETE', `${share}/${PEOPLE.outsider.id}`)).status).toBe(204);
      expect((await call('editor', 'DELETE', `${share}/${PEOPLE.outsider.id}`)).status).toBe(404);
      expect((await call('outsider', 'GET', `/visual-regression/projects/${id}`)).status).toBe(404);
    });

    it('reports analytics from the runs Argos reported', async () => {
      const res = await call('viewer', 'GET', `/visual-regression/projects/${project.id}/analytics?startDate=2026-11-01&endDate=2026-11-30`);
      expect(res.body).toMatchObject({ totalRuns: 2, changedRuns: 2, passedRuns: 0, failedRuns: 0, averageDuration: 42000 });
      expect(res.body.trends).toEqual([{ date: '2026-11-10', passed: 0, changed: 2, failed: 0 }]);
      expect((await call('viewer', 'GET', `/visual-regression/projects/${project.id}/analytics?startDate=2026-12-01`)).body.totalRuns).toBe(0);
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
      // A project can't be moved by an update: the field is refused, not silently dropped
      const move = await call('editor', 'PUT', `/session-replay/projects/${id}`, { name: 'Replay 2', workspaceId: 'ws_other' });
      expect(move).toMatchObject({ status: 400, body: { message: ['property workspaceId should not exist'] } });
      expect((await call('editor', 'PUT', `/session-replay/projects/${id}`, { name: 'Replay 2' })).body).toMatchObject({
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
