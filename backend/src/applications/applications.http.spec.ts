import { API_KEY, PEOPLE, createWorkspacesApp } from '../workspaces/testing/harness';

/** Applications over HTTP with the real AuthGuard and in-memory storage */
describe('Applications HTTP API', () => {
  let h: Awaited<ReturnType<typeof createWorkspacesApp>>;
  let ws: string;
  const saved = { ...process.env };

  beforeAll(async () => {
    process.env.DESIGN_SYSTEM_VERSION = '2.1.0';
    delete process.env.OPENREPLAY_ALLOWED_BASE_URLS;
    delete process.env.OPENREPLAY_BASE_URL;
    h = await createWorkspacesApp();
    ws = (await h.call('owner', 'POST', '/workspaces', { name: 'Apps team' })).body.id;
    await h.call('owner', 'POST', `/workspaces/${ws}/members`, { email: PEOPLE.admin.email, role: 'admin' });
    await h.call('owner', 'POST', `/workspaces/${ws}/members`, { email: PEOPLE.editor.email, role: 'editor' });
  });

  afterAll(async () => {
    await h.app.close();
    process.env = saved;
  });

  const register = (as: Parameters<typeof h.call>[0], body: Record<string, unknown>) => h.call(as, 'POST', '/applications/register', body);

  it('needs admin:governance or the admin role in the workspace to register', async () => {
    expect((await register('editor', { name: 'Nope', workspaceId: ws })).status).toBe(403);
    expect((await register('outsider', { name: 'Nope', workspaceId: ws })).status).toBe(403);
    expect((await register('admin', { name: 'No workspace' })).status).toBe(403);
    expect((await register({ credential: API_KEY }, { name: 'Nope', workspaceId: ws })).status).toBe(403);

    const byAdmin = await register('admin', { name: 'Storefront', workspaceId: ws, repository: 'https://github.com/acme/store' });
    expect(byAdmin.status).toBe(201);
    expect(byAdmin.body).toMatchObject({
      name: 'Storefront',
      workspaceId: ws,
      registeredBy: { id: PEOPLE.admin.id, name: PEOPLE.admin.name },
      capabilities: { governance: { enabled: false, rules: [] }, visualRegression: { enabled: false }, sessionReplay: { enabled: false } },
    });
    expect(byAdmin.body.id).toMatch(/^app_[0-9a-f]{24}$/);

    const byGovernance = await register('governance', { name: 'Unassigned' });
    expect(byGovernance.status).toBe(201);
    expect(byGovernance.body.workspaceId).toBeNull();
    expect((await register('governance', { name: 'Ghost', workspaceId: 'ws_missing' })).status).toBe(400);
    expect((await register('admin', { name: 'storefront', workspaceId: ws })).status).toBe(409);
  });

  it('validates registration strictly', async () => {
    const bad = [
      { name: 'X', workspaceId: ws, id: 'app_mine' },
      { name: 'X', workspaceId: ws, registeredAt: '2020-01-01' },
      { name: 'X', workspaceId: ws, repository: 'javascript:alert(1)' },
      { name: 'X', workspaceId: ws, applicationUrl: 'file:///etc/passwd' },
      { name: 'X', workspaceId: ws, designSystemVersion: 'latest' },
      { name: 'X', workspaceId: ws, capabilities: { governance: { enabled: true, rules: ['Made Up Rule'] } } },
      { name: 'X', workspaceId: ws, capabilities: { visualRegression: { enabled: true } } },
      { name: 'X', workspaceId: ws, capabilities: { visualRegression: { enabled: true, argosProjectId: 'p', projectId: 'vr-x' } } },
      { name: 'X', workspaceId: ws, capabilities: { sessionReplay: { enabled: true } } },
    ];
    for (const body of bad) expect((await register('admin', body)).status).toBe(400);
  });

  it('declares literal routes before :id so they are not shadowed', async () => {
    await register('admin', { name: 'Old', workspaceId: ws, designSystemVersion: '1.4.0' });
    await register('admin', { name: 'Current', workspaceId: ws, designSystemVersion: '2.1.0' });

    const tracking = await h.call('viewer', 'GET', '/applications/version-tracking');
    expect(tracking.status).toBe(200);
    expect(tracking.body).toMatchObject({ currentVersion: '2.1.0', currentVersionSource: 'DESIGN_SYSTEM_VERSION' });
    expect(tracking.body.applicationsByVersion['1.4.0'].map((a: any) => a.name)).toEqual(['Old']);
    expect(tracking.body.recommendedActions.find((r: any) => r.applicationName === 'Old')).toMatchObject({ priority: 'high', targetVersion: '2.1.0' });

    const needing = await h.call('viewer', 'GET', '/applications/needing-upgrade');
    expect(needing.status).toBe(200);
    expect(needing.body.currentVersion).toBe('2.1.0');
    expect(needing.body.applications.map((a: any) => a.name)).toContain('Old');
    expect(needing.body.applications.map((a: any) => a.name)).not.toContain('Current');

    const affected = await h.call('viewer', 'GET', '/applications/affected-by-breaking-changes?version=3.0.0');
    expect(affected.status).toBe(200);
    expect(affected.body).toMatchObject({ breakingChanges: [], breakingChangesSource: 'unavailable' });
    expect(affected.body.applications.map((a: any) => a.name)).toEqual(expect.arrayContaining(['Old', 'Current']));
    expect((await h.call('viewer', 'GET', '/applications/affected-by-breaking-changes')).status).toBe(400);
    expect((await h.call('viewer', 'GET', '/applications/affected-by-breaking-changes?version=soon')).status).toBe(400);

    expect((await h.call('viewer', 'GET', '/design-system/current-version')).body).toEqual({ version: '2.1.0', source: 'DESIGN_SYSTEM_VERSION' });
  });

  it('returns 404 for missing applications on every route', async () => {
    expect((await h.call('governance', 'GET', '/applications/app_missing')).status).toBe(404);
    expect((await h.call('governance', 'PUT', '/applications/app_missing', { name: 'x' })).status).toBe(404);
    expect((await h.call('governance', 'PATCH', '/applications/app_missing/capabilities', {})).status).toBe(404);
    expect((await h.call('governance', 'PATCH', '/applications/app_missing/design-system-version', { version: '2.0.0' })).status).toBe(404);
    expect((await h.call('governance', 'DELETE', '/applications/app_missing')).status).toBe(404);
    expect((await h.call('governance', 'GET', '/applications/..%2F..%2Fetc')).status).toBe(404);
  });

  it('updates only editable fields (no mass assignment)', async () => {
    const app = (await register('admin', { name: 'Editable', workspaceId: ws, designSystemVersion: '2.0.0' })).body;
    for (const extra of [{ capabilities: { governance: { enabled: true } } }, { workspaceId: 'ws_other' }, { designSystemVersion: '9.9.9' }, { registeredAt: '2000-01-01' }, { id: 'x' }]) {
      expect((await h.call('admin', 'PUT', `/applications/${app.id}`, extra)).status).toBe(400);
    }
    const updated = await h.call('admin', 'PUT', `/applications/${app.id}`, { name: 'Edited', description: 'New words' });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: 'Edited', description: 'New words', designSystemVersion: '2.0.0', workspaceId: ws });
    expect(updated.body.registeredAt).toBe(app.registeredAt);
    expect((await h.call('editor', 'PUT', `/applications/${app.id}`, { name: 'Hijack' })).status).toBe(403);

    const version = await h.call('admin', 'PATCH', `/applications/${app.id}/design-system-version`, { version: 'v2.1.0' });
    expect(version.body.designSystemVersion).toBe('2.1.0');
    expect((await h.call('admin', 'PATCH', `/applications/${app.id}/design-system-version`, { version: 'two' })).status).toBe(400);
  });

  it('creates linked projects, surfaces their errors, and deletes them with the application', async () => {
    const createdBefore = h.vr.created.length;
    h.vr.failVrCreate = true;
    const failed = await register('admin', {
      name: 'Flaky VR',
      workspaceId: ws,
      capabilities: { visualRegression: { enabled: true, argosProjectId: 'argos-1', argosToken: 'bad' } },
    });
    expect(failed.status).toBe(400);
    expect(failed.body.message).toMatch(/Argos/);
    expect((await h.call('viewer', 'GET', '/applications')).body.applications.map((a: any) => a.name)).not.toContain('Flaky VR');

    const ok = await register('admin', {
      name: 'With projects',
      workspaceId: ws,
      teamId: 'team-web',
      capabilities: {
        visualRegression: { enabled: true, argosProjectId: 'argos-1', argosBranch: 'main', argosToken: 'secret-token' },
        sessionReplay: { enabled: true, openreplayProjectKey: 'key-1' },
      },
    });
    expect(ok.status).toBe(201);
    expect(h.vr.created.length).toBe(createdBefore + 1);
    expect(h.vr.created[h.vr.created.length - 1]).toMatchObject({ argosBranch: 'main', argosToken: 'secret-token' });
    const caps = ok.body.capabilities;
    expect(caps.visualRegression).toMatchObject({ enabled: true, argosBranch: 'main', projectId: expect.stringMatching(/^vr-/) });
    expect(caps.visualRegression).not.toHaveProperty('argosToken');
    expect(caps.sessionReplay).toMatchObject({ enabled: true, openreplayProjectKey: 'key-1', projectId: expect.any(String) });
    const srProject = await h.sessionReplay.getProject(caps.sessionReplay.projectId);
    expect(srProject.teamId).toBe('team-web');

    // Editing capabilities keeps the other settings (no reset of the branch or base URL)
    const gov = await h.call('admin', 'PATCH', `/applications/${ok.body.id}/capabilities`, { governance: { enabled: true, rules: ['a11y-image-alt'] } });
    expect(gov.body.capabilities.visualRegression).toEqual(caps.visualRegression);
    expect(gov.body.capabilities.governance).toMatchObject({ enabled: true, rules: ['a11y-image-alt'] });

    expect((await h.call('admin', 'DELETE', `/applications/${ok.body.id}`)).status).toBe(200);
    expect(h.vr.deleted).toContain(caps.visualRegression.projectId);
    await expect(h.sessionReplay.getProject(caps.sessionReplay.projectId)).rejects.toThrow(/not found/);
  });

  it('rejects OpenReplay base URLs that point at internal addresses (SSRF)', async () => {
    for (const url of ['http://127.0.0.1:8080', 'http://169.254.169.254/latest', 'http://10.0.0.5', 'http://[::1]:3000']) {
      const res = await register('admin', {
        name: `SR ${url}`,
        workspaceId: ws,
        capabilities: { sessionReplay: { enabled: true, openreplayProjectKey: 'k', openreplayBaseUrl: url } },
      });
      expect(res.status).toBe(400);
    }
    const app = (await register('admin', { name: 'SR later', workspaceId: ws })).body;
    const res = await h.call('admin', 'PATCH', `/applications/${app.id}/capabilities`, {
      sessionReplay: { enabled: true, openreplayProjectKey: 'k', openreplayBaseUrl: 'http://192.168.1.10' },
    });
    expect(res.status).toBe(400);
    expect((await h.call('viewer', 'GET', `/applications/${app.id}`)).body.capabilities.sessionReplay.enabled).toBe(false);
  });

  it('moves applications between workspaces only for admins of both', async () => {
    const other = (await h.call('other', 'POST', '/workspaces', { name: 'Elsewhere' })).body.id;
    const app = (await register('admin', { name: 'Mover', workspaceId: ws })).body;
    expect((await h.call('admin', 'PATCH', `/applications/${app.id}/workspace`, { workspaceId: other })).status).toBe(403);
    expect((await h.call('other', 'PATCH', `/applications/${app.id}/workspace`, { workspaceId: other })).status).toBe(403);
    await h.call('other', 'POST', `/workspaces/${other}/members`, { email: PEOPLE.admin.email, role: 'editor' });
    await h.call('other', 'PATCH', `/workspaces/${other}/members/${PEOPLE.admin.id}`, { role: 'admin' });
    const moved = await h.call('admin', 'PATCH', `/applications/${app.id}/workspace`, { workspaceId: other });
    expect(moved.status).toBe(200);
    expect(moved.body.workspaceId).toBe(other);
    expect((await h.call('admin', 'PATCH', `/applications/${app.id}/workspace`, { workspaceId: null })).status).toBe(403);
    expect((await h.call('governance', 'PATCH', `/applications/${app.id}/workspace`, { workspaceId: null })).body.workspaceId).toBeNull();
  });

  it('filters the list', async () => {
    const res = await h.call({ credential: API_KEY }, 'GET', `/applications?workspaceId=${ws}&capability=governance`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(res.body.applications.length);
    expect(res.body.applications.every((a: any) => a.workspaceId === ws && a.capabilities.governance.enabled)).toBe(true);
    expect((await h.call('viewer', 'GET', '/applications?capability=everything')).status).toBe(400);
  });
});
