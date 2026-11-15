import { UserPrincipal } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { ArgosApiClient } from '../visual-regression/argos-api.client';
import { createProjectServices } from '../visual-regression/testing/services';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../workspaces/workspace.types';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { ApplicationDoc, ApplicationNameClaim } from './application.types';
import { ApplicationsService, linkedProjectId } from './applications.service';

const governance: UserPrincipal = {
  type: 'user',
  id: 'usr_gov',
  email: 'gov@example.com',
  name: 'Gus Governance',
  roles: [],
  permissions: new Set([Permission.ADMIN_GOVERNANCE]),
  mustChangePassword: false,
};

const enableVr = { visualRegression: { enabled: true, argosProjectId: 'argos-1', argosToken: 'secret' } };
const enableSr = { sessionReplay: { enabled: true, openreplayProjectKey: 'key-1' } };

function workspaceDoc(id: string, members: string[]): WorkspaceDoc {
  const now = new Date().toISOString();
  return {
    id,
    name: id,
    description: '',
    slug: id,
    ownerId: members[0],
    members: members.map((userId, i) => ({
      userId,
      email: `${userId}@example.com`,
      name: userId,
      role: i === 0 ? 'owner' : 'viewer',
      addedAt: now,
      addedBy: { id: members[0], name: members[0] },
    })),
    memberIds: members,
    settings: { allowExternalSharing: true, requireApprovalForSharing: false, defaultComponentStatus: 'in-progress' },
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: { id: members[0], name: members[0] },
  };
}

/** Applications with the real visual-regression and session-replay services over in-memory storage */
describe('ApplicationsService linked projects', () => {
  const saved = { ...process.env };
  let workspaces: InMemoryQueryableStore<WorkspaceDoc>;
  let projects: ReturnType<typeof createProjectServices>;
  let appStore: InMemoryQueryableStore<ApplicationDoc>;
  let nameStore: InMemoryStore<ApplicationNameClaim>;
  let service: ApplicationsService;

  const build = () =>
    new ApplicationsService(appStore, nameStore, new WorkspaceAccessService(workspaces), projects.visualRegression, projects.sessionReplay);

  beforeAll(() => {
    delete process.env.OPENREPLAY_ALLOWED_BASE_URLS;
    delete process.env.OPENREPLAY_BASE_URL;
    jest.spyOn(ArgosApiClient.prototype, 'verify').mockResolvedValue({
      ok: true,
      project: { id: 'argos-1', name: 'a', account: { id: 'acc', slug: 'acme' }, defaultBaseBranch: 'main' },
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    process.env = saved;
  });

  beforeEach(() => {
    workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    projects = createProjectServices(workspaces);
    appStore = new InMemoryQueryableStore<ApplicationDoc>();
    nameStore = new InMemoryStore<ApplicationNameClaim>();
    service = build();
  });

  it('links projects that survive a restart of every service', async () => {
    const app = await service.register(governance, { name: 'Shop', capabilities: { ...enableVr, ...enableSr } } as any);
    const vrId = app.capabilities.visualRegression.projectId!;
    const srId = app.capabilities.sessionReplay.projectId!;
    expect(vrId).toBe(linkedProjectId('visualRegression', app.id));
    expect(srId).toBe(linkedProjectId('sessionReplay', app.id));

    // New service instances over the same storage, as after a restart
    const restartedProjects = createProjectServices(workspaces);
    const { VisualRegressionService } = await import('../visual-regression/visual-regression.service');
    const { SessionReplayService } = await import('../session-replay/session-replay.service');
    const vr = new VisualRegressionService(projects.vrProjects, projects.vrRuns, restartedProjects.access, projects.encryption);
    const sr = new SessionReplayService(projects.srProjects, restartedProjects.access, projects.encryption);
    const restarted = new ApplicationsService(appStore, nameStore, new WorkspaceAccessService(workspaces), vr, sr);

    expect(await vr.getProject(vrId)).toMatchObject({ applicationId: app.id, workspaceId: null, argosProjectId: 'argos-1' });
    expect(await sr.getProject(srId)).toMatchObject({ applicationId: app.id, openreplayProjectKey: 'key-1' });
    const updated = await restarted.updateCapabilities(governance, app.id, { visualRegression: { enabled: true, argosBranch: 'release' } } as any);
    expect(updated.capabilities.visualRegression.projectId).toBe(vrId);
    expect((await vr.getProject(vrId)).argosBranch).toBe('release');
  });

  it('recreates a linked project that has gone missing when the capability is enabled', async () => {
    const app = await service.register(governance, { name: 'Shop', capabilities: { ...enableVr, ...enableSr } } as any);
    const vrId = app.capabilities.visualRegression.projectId!;
    const srId = app.capabilities.sessionReplay.projectId!;
    await projects.vrProjects.delete(vrId);
    await projects.srProjects.delete(srId);

    // Session replay needs nothing secret, so it comes back on any update
    const sr = await service.updateCapabilities(governance, app.id, { sessionReplay: { enabled: true, privacySettings: { maskAllText: true } } } as any);
    expect(sr.capabilities.sessionReplay.projectId).toBe(srId);
    expect(await projects.sessionReplay.getProject(srId)).toMatchObject({ privacySettings: { maskAllText: true } });

    // Visual regression needs the Argos token, which went with the project: say so
    await expect(service.updateCapabilities(governance, app.id, { visualRegression: { enabled: true, argosBranch: 'x' } } as any)).rejects.toThrow(
      /no longer exists.*argosToken/,
    );
    await expect(service.updateCapabilities(governance, app.id, { visualRegression: { enabled: true } } as any)).rejects.toThrow(/argosToken/);
    expect((await service.get(app.id)).capabilities.visualRegression.projectId).toBe(vrId);

    const vr = await service.updateCapabilities(governance, app.id, enableVr as any);
    expect(vr.capabilities.visualRegression.projectId).toBe(vrId);
    expect(await projects.visualRegression.projectExists(vrId)).toBe(true);
  });

  it('unlinks a missing project when the capability is disabled', async () => {
    const app = await service.register(governance, { name: 'Shop', capabilities: enableVr } as any);
    await projects.vrProjects.delete(app.capabilities.visualRegression.projectId!);
    const off = await service.updateCapabilities(governance, app.id, { visualRegression: { enabled: false, argosBranch: 'main' } } as any);
    expect(off.capabilities.visualRegression).toMatchObject({ enabled: false });
    expect(off.capabilities.visualRegression.projectId).toBeUndefined();
  });

  it('creates one project when two requests enable the capability at once', async () => {
    const app = await service.register(governance, { name: 'Shop' } as any);
    const results = await Promise.allSettled([
      service.updateCapabilities(governance, app.id, enableVr as any),
      service.updateCapabilities(governance, app.id, enableVr as any),
      service.updateCapabilities(governance, app.id, enableSr as any),
      service.updateCapabilities(governance, app.id, enableSr as any),
    ]);
    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled', 'fulfilled', 'fulfilled']);
    const stored = await service.get(app.id);
    expect(stored.capabilities.visualRegression.projectId).toBe(linkedProjectId('visualRegression', app.id));
    expect(stored.capabilities.sessionReplay.projectId).toBe(linkedProjectId('sessionReplay', app.id));
    expect((await projects.vrProjects.list()).map((p) => p.id)).toEqual([linkedProjectId('visualRegression', app.id)]);
    expect((await projects.srProjects.list()).map((p) => p.id)).toEqual([linkedProjectId('sessionReplay', app.id)]);
  });

  it('reuses its project across lost write races and removes it when every attempt loses', async () => {
    const app = await service.register(governance, { name: 'Shop' } as any);

    // One lost race: the retry reuses the project from the first attempt
    let races = 1;
    appStore.beforeReplace = async (doc) => {
      if (races-- > 0) appStore.forceWrite({ ...(await appStore.get(doc.id))!.doc, description: 'someone else' });
    };
    const won = await service.updateCapabilities(governance, app.id, enableVr as any);
    expect(won.description).toBe('someone else');
    expect((await projects.vrProjects.list()).map((p) => p.id)).toEqual([won.capabilities.visualRegression.projectId]);

    // Every attempt loses: the request fails and leaves no project behind
    const other = await service.register(governance, { name: 'Other' } as any);
    appStore.beforeReplace = async (doc) => {
      appStore.forceWrite({ ...(await appStore.get(doc.id))!.doc });
    };
    await expect(service.updateCapabilities(governance, other.id, enableSr as any)).rejects.toThrow(/changed by someone else/);
    appStore.beforeReplace = undefined;
    expect(await projects.sessionReplay.projectExists(linkedProjectId('sessionReplay', other.id))).toBe(false);
    expect((await service.get(other.id)).capabilities.sessionReplay.enabled).toBe(false);
  });

  it('moves linked projects with the application, so access follows it', async () => {
    await workspaces.create(workspaceDoc('ws_a', ['usr_a']));
    await workspaces.create(workspaceDoc('ws_b', ['usr_b']));
    const app = await service.register(governance, { name: 'Shop', workspaceId: 'ws_a', capabilities: { ...enableVr, ...enableSr } } as any);
    expect((await projects.visualRegression.getProject(app.capabilities.visualRegression.projectId!)).workspaceId).toBe('ws_a');
    await service.move(governance, app.id, { workspaceId: 'ws_b' });
    expect((await projects.visualRegression.getProject(app.capabilities.visualRegression.projectId!)).workspaceId).toBe('ws_b');
    expect((await projects.sessionReplay.getProject(app.capabilities.sessionReplay.projectId!)).workspaceId).toBe('ws_b');
  });

  it('lets only one of several concurrent registrations take a name', async () => {
    // Every registration passes the "is the name free?" read before any of them writes
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => service.register(governance, { name: 'Race' } as any)));
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected').map((r) => (r as PromiseRejectedResult).reason.status)).toEqual([409, 409, 409, 409]);
    expect((await service.list()).filter((app) => app.name === 'Race')).toHaveLength(1);
  });

  it('frees a name on rename and delete, and claims it in the new workspace on a move', async () => {
    await workspaces.create(workspaceDoc('ws_a', ['usr_a']));
    const first = await service.register(governance, { name: 'Alpha' } as any);
    await service.update(governance, first.id, { name: 'Beta' } as any);
    // The old name is free again; the new one is taken
    const second = await service.register(governance, { name: 'alpha' } as any);
    await expect(service.register(governance, { name: 'BETA' } as any)).rejects.toMatchObject({ status: 409 });
    // A change of capitals only keeps the claim
    await service.update(governance, first.id, { name: 'beta' } as any);
    await expect(service.register(governance, { name: 'Beta' } as any)).rejects.toMatchObject({ status: 409 });

    await service.move(governance, first.id, { workspaceId: 'ws_a' });
    await expect(service.register(governance, { name: 'beta', workspaceId: 'ws_a' } as any)).rejects.toMatchObject({ status: 409 });
    await service.register(governance, { name: 'beta' } as any); // free again outside the workspace

    await service.delete(governance, second.id);
    await service.register(governance, { name: 'Alpha' } as any);
  });

  it('takes over a claim left by a registration that never finished, once it is stale', async () => {
    await nameStore.create({ id: (await import('crypto')).createHash('sha256').update('\u0000ghost').digest('hex').slice(0, 40).replace(/^/, 'name_'), applicationId: 'app_gone', name: 'Ghost', workspaceId: null, claimedAt: new Date(Date.now() - 120_000).toISOString() });
    await expect(service.register(governance, { name: 'Ghost' } as any)).resolves.toMatchObject({ name: 'Ghost' });
  });

  it('deletes the application before its projects, and tells listeners', async () => {
    const app = await service.register(governance, { name: 'Shop', capabilities: { ...enableVr } } as any);
    const vrId = app.capabilities.visualRegression.projectId!;
    const deleted: string[] = [];
    service.onDeleted(async (gone) => {
      deleted.push(gone.id);
      // By the time listeners run the application is gone
      expect(await appStore.get(gone.id)).toBeNull();
    });
    jest.spyOn(projects.visualRegression, 'deleteProject').mockRejectedValueOnce(new Error('Argos is down'));
    await service.delete(governance, app.id);
    expect(await service.find(app.id)).toBeNull();
    expect(deleted).toEqual([app.id]);
    expect(vrId).toBeTruthy();
  });

  it('rejects governance rule ids that do not exist', async () => {
    const rules = { list: async () => [{ id: 'a11y-axe' }, { id: 'ds-important' }] };
    const withRules = new ApplicationsService(appStore, nameStore, new WorkspaceAccessService(workspaces), projects.visualRegression, projects.sessionReplay, {
      get: () => rules,
    } as any);
    await expect(
      withRules.register(governance, { name: 'Rules', capabilities: { governance: { enabled: true, rules: ['a11y-axe', 'no-such-rule'] } } } as any),
    ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/no-such-rule/) });
    const app = await withRules.register(governance, { name: 'Rules', capabilities: { governance: { enabled: true, rules: ['a11y-axe'] } } } as any);
    expect(app.capabilities.governance.rules).toEqual(['a11y-axe']);
    await expect(withRules.updateCapabilities(governance, app.id, { governance: { enabled: true, rules: ['gone'] } } as any)).rejects.toMatchObject({ status: 400 });
  });
});
