import { UserPrincipal } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { ArgosApiClient } from '../visual-regression/argos-api.client';
import { createProjectServices } from '../visual-regression/testing/services';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../workspaces/workspace.types';
import { ApplicationDoc } from './application.types';
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
  let service: ApplicationsService;

  const build = () =>
    new ApplicationsService(appStore, new WorkspaceAccessService(workspaces), projects.visualRegression, projects.sessionReplay);

  beforeAll(() => {
    delete process.env.OPENREPLAY_ALLOWED_BASE_URLS;
    delete process.env.OPENREPLAY_BASE_URL;
    jest.spyOn(ArgosApiClient.prototype, 'verifyConnection').mockResolvedValue(true);
    jest.spyOn(ArgosApiClient.prototype, 'getProject').mockResolvedValue({ id: 'argos-1', name: 'a', repository: 'r', branch: 'main' });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    process.env = saved;
  });

  beforeEach(() => {
    workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    projects = createProjectServices(workspaces);
    appStore = new InMemoryQueryableStore<ApplicationDoc>();
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
    const restarted = new ApplicationsService(appStore, new WorkspaceAccessService(workspaces), vr, sr);

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
});
