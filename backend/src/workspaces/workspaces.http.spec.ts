import { RESOURCE_KINDS } from './resource-kinds';
import { API_KEY, PEOPLE, createWorkspacesApp } from './testing/harness';
import { RESOURCE_SAMPLES } from './testing/samples';

/** Workspaces over HTTP with the real AuthGuard and in-memory storage */
describe('Workspaces HTTP API', () => {
  let h: Awaited<ReturnType<typeof createWorkspacesApp>>;

  beforeAll(async () => {
    h = await createWorkspacesApp();
  });

  afterAll(async () => {
    await h.app.close();
  });

  /** A workspace owned by `owner` with admin, editor and viewer members */
  async function team(name: string) {
    const created = await h.call('owner', 'POST', '/workspaces', { name });
    expect(created.status).toBe(201);
    const id = created.body.id as string;
    for (const [email, role] of [
      [PEOPLE.admin.email, 'admin'],
      [PEOPLE.editor.email, 'editor'],
      [PEOPLE.viewer.email, 'viewer'],
    ]) {
      const res = await h.call('owner', 'POST', `/workspaces/${id}/members`, { email, role });
      expect(res.status).toBe(201);
    }
    return id;
  }

  it('requires a credential', async () => {
    expect((await h.call({}, 'GET', '/workspaces')).status).toBe(401);
    expect((await h.call({ credential: 'garbage' }, 'GET', '/workspaces')).status).toBe(401);
  });

  it('creates a workspace owned by the caller and ignores identity fields from the client', async () => {
    const res = await h.call('owner', 'POST', '/workspaces', { name: 'Marketing Team', description: 'Promo' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Marketing Team',
      slug: 'marketing-team',
      ownerId: PEOPLE.owner.id,
      myRole: 'owner',
      settings: { allowExternalSharing: true, requireApprovalForSharing: false },
    });
    expect(res.body.id).toMatch(/^ws_[0-9a-f]{24}$/);
    expect(res.body.members).toEqual([expect.objectContaining({ userId: PEOPLE.owner.id, email: PEOPLE.owner.email, role: 'owner' })]);
    expect(res.body).not.toHaveProperty('memberIds');

    for (const extra of [{ ownerId: 'usr_x' }, { members: [] }, { id: 'ws_mine' }, { createdBy: 'x' }]) {
      expect((await h.call('owner', 'POST', '/workspaces', { name: 'X', ...extra })).status).toBe(400);
    }
    // ownerEmail is for admin:users holders only
    expect((await h.call('owner', 'POST', '/workspaces', { name: 'X', ownerEmail: PEOPLE.other.email })).status).toBe(403);
    const forOther = await h.call('superuser', 'POST', '/workspaces', { name: 'For Oscar', ownerEmail: PEOPLE.other.email });
    expect(forOther.status).toBe(201);
    expect(forOther.body.ownerId).toBe(PEOPLE.other.id);
    // An API key must name an owner
    expect((await h.call({ credential: API_KEY }, 'POST', '/workspaces', { name: 'Svc' })).status).toBe(400);
  });

  it('keeps slugs unique', async () => {
    const a = await h.call('owner', 'POST', '/workspaces', { name: 'Design Ops' });
    const b = await h.call('owner', 'POST', '/workspaces', { name: 'Design  Ops!' });
    expect(a.body.slug).toBe('design-ops');
    expect(b.body.slug).toBe('design-ops-2');
    expect((await h.call('owner', 'POST', '/workspaces', { name: 'Y', slug: 'design-ops' })).status).toBe(409);
    expect((await h.call('owner', 'POST', '/workspaces', { name: 'Y', slug: 'Not A Slug' })).status).toBe(400);
    expect((await h.call('owner', 'PATCH', `/workspaces/${b.body.id}`, { slug: 'design-ops' })).status).toBe(409);
    const renamed = await h.call('owner', 'PATCH', `/workspaces/${b.body.id}`, { slug: 'design-ops-west' });
    expect(renamed.status).toBe(200);
    const bySlug = await h.call('owner', 'GET', '/workspaces/slug/design-ops-west');
    expect(bySlug.body.id).toBe(b.body.id);
    expect((await h.call('outsider', 'GET', '/workspaces/slug/design-ops-west')).status).toBe(404);
  });

  it('keeps slugs unique when creates race', async () => {
    const results = await Promise.all([1, 2, 3, 4].map(() => h.call('owner', 'POST', '/workspaces', { name: 'Race Team' })));
    expect(results.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    const slugs = results.map((r) => r.body.slug);
    expect(new Set(slugs).size).toBe(4);
    const stored = [...h.workspaceStore.docs.values()].map((e) => e.doc.slug).filter((s) => s.startsWith('race-team'));
    expect(new Set(stored).size).toBe(stored.length);
  });

  it('lists only the caller\'s workspaces, or every one for admin:users, ignoring ?userId=', async () => {
    const id = await team('Listing');
    const mine = await h.call('viewer', 'GET', `/workspaces?userId=${PEOPLE.owner.id}`);
    expect(mine.status).toBe(200);
    expect(mine.body.map((w: any) => w.id)).toContain(id);
    expect(mine.body.every((w: any) => w.members.some((m: any) => m.userId === PEOPLE.viewer.id))).toBe(true);
    expect(mine.body.find((w: any) => w.id === id)).toMatchObject({ myRole: 'viewer', summary: { memberCount: 4, applicationCount: 0 } });

    expect((await h.call('outsider', 'GET', `/workspaces?userId=${PEOPLE.owner.id}`)).body).toEqual([]);
    const all = await h.call('superuser', 'GET', '/workspaces');
    expect(all.body.map((w: any) => w.id)).toContain(id);
    expect(all.body.find((w: any) => w.id === id)).toMatchObject({ myRole: null, effectiveRole: 'owner' });
    expect((await h.call('superuser', 'GET', '/workspaces?mine=true')).body.map((w: any) => w.id)).not.toContain(id);
  });

  describe('per-workspace roles', () => {
    let id: string;
    beforeAll(async () => {
      id = await team('Roles');
    });

    it('hides the workspace from non-members (404, not 403)', async () => {
      expect((await h.call('outsider', 'GET', `/workspaces/${id}`)).status).toBe(404);
      expect((await h.call('outsider', 'GET', `/workspaces/${id}/resources/fonts`)).status).toBe(404);
      expect((await h.call('outsider', 'POST', `/workspaces/${id}/resources/fonts`, RESOURCE_SAMPLES.fonts.create)).status).toBe(404);
      expect((await h.call('outsider', 'GET', `/workspaces/${id}/analytics`)).status).toBe(404);
      expect((await h.call('superuser', 'GET', `/workspaces/${id}`)).status).toBe(200);
    });

    it('lets a viewer read but not write', async () => {
      expect((await h.call('viewer', 'GET', `/workspaces/${id}`)).status).toBe(200);
      expect((await h.call('viewer', 'GET', `/workspaces/${id}/resources/tokens`)).status).toBe(200);
      expect((await h.call('viewer', 'POST', `/workspaces/${id}/resources/tokens`, RESOURCE_SAMPLES.tokens.create)).status).toBe(403);
      expect((await h.call('viewer', 'PATCH', `/workspaces/${id}`, { description: 'x' })).status).toBe(403);
      expect((await h.call('viewer', 'POST', `/workspaces/${id}/members`, { email: PEOPLE.other.email, role: 'viewer' })).status).toBe(403);
    });

    it('lets an editor change items but not members or settings', async () => {
      const created = await h.call('editor', 'POST', `/workspaces/${id}/resources/tokens`, RESOURCE_SAMPLES.tokens.create);
      expect(created.status).toBe(201);
      expect(created.body.createdBy).toEqual({ id: PEOPLE.editor.id, name: PEOPLE.editor.name });
      expect((await h.call('editor', 'POST', `/workspaces/${id}/members`, { email: PEOPLE.other.email, role: 'viewer' })).status).toBe(403);
      expect((await h.call('editor', 'PATCH', `/workspaces/${id}/members/${PEOPLE.viewer.id}`, { role: 'editor' })).status).toBe(403);
      expect((await h.call('editor', 'PATCH', `/workspaces/${id}`, { settings: { allowExternalSharing: false } })).status).toBe(403);
      expect((await h.call('editor', 'DELETE', `/workspaces/${id}`)).status).toBe(403);
    });

    it('lets an admin manage editors and viewers and settings, but only the owner deals in admins or deletes', async () => {
      expect((await h.call('admin', 'PATCH', `/workspaces/${id}`, { description: 'Updated' })).body.description).toBe('Updated');
      const added = await h.call('admin', 'POST', `/workspaces/${id}/members`, { email: PEOPLE.other.email, role: 'viewer' });
      expect(added.status).toBe(201);
      expect(added.body.members.find((m: any) => m.userId === PEOPLE.other.id)).toMatchObject({
        role: 'viewer',
        addedBy: { id: PEOPLE.admin.id, name: PEOPLE.admin.name },
      });
      expect((await h.call('admin', 'PATCH', `/workspaces/${id}/members/${PEOPLE.other.id}`, { role: 'admin' })).status).toBe(403);
      expect((await h.call('admin', 'PATCH', `/workspaces/${id}/members/${PEOPLE.other.id}`, { role: 'editor' })).status).toBe(200);
      expect((await h.call('admin', 'DELETE', `/workspaces/${id}/members/${PEOPLE.owner.id}`)).status).toBe(409);
      expect((await h.call('admin', 'DELETE', `/workspaces/${id}`)).status).toBe(403);
      expect((await h.call('owner', 'PATCH', `/workspaces/${id}/members/${PEOPLE.other.id}`, { role: 'admin' })).status).toBe(200);
      expect((await h.call('admin', 'DELETE', `/workspaces/${id}/members/${PEOPLE.other.id}`)).status).toBe(403);
      expect((await h.call('owner', 'DELETE', `/workspaces/${id}/members/${PEOPLE.other.id}`)).status).toBe(200);
    });

    it('validates member changes', async () => {
      const add = (body: unknown) => h.call('owner', 'POST', `/workspaces/${id}/members`, body);
      expect((await add({ email: PEOPLE.other.email, role: 'owner' })).status).toBe(400);
      expect((await add({ email: PEOPLE.other.email, role: 'superadmin' })).status).toBe(400);
      expect((await add({ email: 'nobody@example.com', role: 'viewer' })).status).toBe(404);
      expect((await add({ email: 'disabled@example.com', role: 'viewer' })).status).toBe(404);
      expect((await add({ email: PEOPLE.viewer.email.toUpperCase(), role: 'viewer' })).status).toBe(409);
      expect((await add({ email: PEOPLE.other.email, role: 'viewer', userId: 'usr_fake', addedBy: 'x' })).status).toBe(400);
      expect((await h.call('owner', 'PATCH', `/workspaces/${id}/members/${PEOPLE.viewer.id}`, { role: 'owner' })).status).toBe(400);
      expect((await h.call('owner', 'PATCH', `/workspaces/${id}/members/usr_nobody`, { role: 'viewer' })).status).toBe(404);
      expect((await h.call('owner', 'PATCH', `/workspaces/${id}/members/${PEOPLE.owner.id}`, { role: 'viewer' })).status).toBe(409);
    });

    it('lets members leave', async () => {
      await h.call('owner', 'POST', `/workspaces/${id}/members`, { email: PEOPLE.other.email, role: 'viewer' });
      const left = await h.call('other', 'DELETE', `/workspaces/${id}/members/${PEOPLE.other.id}`);
      expect(left.status).toBe(200);
      expect(left.body).toEqual({ left: true });
      expect((await h.call('other', 'GET', `/workspaces/${id}`)).status).toBe(404);
    });
  });

  it('transfers ownership explicitly; the old owner becomes an admin', async () => {
    const id = await team('Transfer');
    expect((await h.call('admin', 'POST', `/workspaces/${id}/transfer-ownership`, { userId: PEOPLE.admin.id })).status).toBe(403);
    expect((await h.call('owner', 'POST', `/workspaces/${id}/transfer-ownership`, { userId: PEOPLE.outsider.id })).status).toBe(400);
    const res = await h.call('owner', 'POST', `/workspaces/${id}/transfer-ownership`, { userId: PEOPLE.editor.id });
    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBe(PEOPLE.editor.id);
    const roles = Object.fromEntries(res.body.members.map((m: any) => [m.userId, m.role]));
    expect(roles[PEOPLE.editor.id]).toBe('owner');
    expect(roles[PEOPLE.owner.id]).toBe('admin');
    expect(res.body.members.filter((m: any) => m.role === 'owner')).toHaveLength(1);
    expect((await h.call('owner', 'DELETE', `/workspaces/${id}`)).status).toBe(403);
  });

  describe('items through the generic controller', () => {
    let id: string;
    beforeAll(async () => {
      id = await team('Items');
    });

    it.each(RESOURCE_KINDS.map((spec) => spec.kind))('creates, reads, updates and deletes %s', async (kind) => {
      const sample = RESOURCE_SAMPLES[kind];
      const created = await h.call('editor', 'POST', `/workspaces/${id}/resources/${kind}`, sample.create);
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({ ...sample.create, kind, workspaceId: id, sharedWith: [], isGlobal: false });
      const rid = created.body.id;
      expect(rid).toMatch(/^res_[0-9a-f]{24}$/);

      const list = await h.call('viewer', 'GET', `/workspaces/${id}/resources/${kind}`);
      expect(list.body.map((r: any) => r.id)).toContain(rid);
      expect((await h.call('viewer', 'GET', `/workspaces/${id}/resources/${kind}/${rid}`)).body.id).toBe(rid);

      const updated = await h.call('editor', 'PATCH', `/workspaces/${id}/resources/${kind}/${rid}`, sample.update);
      expect(updated.status).toBe(200);
      expect(updated.body).toMatchObject(sample.update);

      expect((await h.call('editor', 'DELETE', `/workspaces/${id}/resources/${kind}/${rid}`)).status).toBe(204);
      expect((await h.call('viewer', 'GET', `/workspaces/${id}/resources/${kind}/${rid}`)).status).toBe(404);
    });

    it('rejects unknown kinds, a kind mismatch and invalid bodies', async () => {
      expect((await h.call('editor', 'GET', `/workspaces/${id}/resources/components`)).status).toBe(404);
      expect((await h.call('editor', 'POST', `/workspaces/${id}/resources/__proto__`, {})).status).toBe(404);
      const token = await h.call('editor', 'POST', `/workspaces/${id}/resources/tokens`, RESOURCE_SAMPLES.tokens.create);
      expect((await h.call('viewer', 'GET', `/workspaces/${id}/resources/fonts/${token.body.id}`)).status).toBe(404);
      expect((await h.call('editor', 'POST', `/workspaces/${id}/resources/tokens`, { name: 'x' })).status).toBe(400);
      expect((await h.call('editor', 'POST', `/workspaces/${id}/resources/tokens`, [])).status).toBe(400);
      expect((await h.call('editor', 'PATCH', `/workspaces/${id}/resources/tokens/${token.body.id}`, {})).status).toBe(400);
      expect((await h.call('editor', 'PATCH', `/workspaces/${id}/resources/tokens/${token.body.id}`, { name: null })).status).toBe(400);
    });

    it('ignores nothing silently: control fields in bodies are rejected (mass assignment)', async () => {
      const base = RESOURCE_SAMPLES.assets.create;
      for (const extra of [{ id: 'res_mine' }, { workspaceId: 'ws_other' }, { isGlobal: true }, { sharedWith: ['ws_x'] }, { createdBy: 'x' }, { createdAt: '2020-01-01' }]) {
        expect((await h.call('editor', 'POST', `/workspaces/${id}/resources/assets`, { ...base, ...extra })).status).toBe(400);
      }
      const asset = await h.call('editor', 'POST', `/workspaces/${id}/resources/assets`, base);
      for (const extra of [{ workspaceId: 'ws_other' }, { isGlobal: true }, { kind: 'fonts' }, { id: 'res_x' }]) {
        expect((await h.call('editor', 'PATCH', `/workspaces/${id}/resources/assets/${asset.body.id}`, extra)).status).toBe(400);
      }
      const after = await h.call('viewer', 'GET', `/workspaces/${id}/resources/assets/${asset.body.id}`);
      expect(after.body).toMatchObject({ workspaceId: id, isGlobal: false, kind: 'assets' });
    });

    it('accepts only http(s) URLs and SVG markup for icons', async () => {
      for (const url of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'ftp://example.com/a', 'not a url', `https://example.com/${'a'.repeat(2100)}`]) {
        const res = await h.call('editor', 'POST', `/workspaces/${id}/resources/assets`, { name: 'x', type: 'image', url });
        expect(res.status).toBe(400);
      }
      expect((await h.call('editor', 'POST', `/workspaces/${id}/resources/icons`, { name: 'x', svg: '<img src=x onerror=alert(1)>' })).status).toBe(400);
    });

    it('serves the older Design Extractor path as a style dictionary', async () => {
      const res = await h.call('editor', 'POST', `/workspaces/${id}/style-dictionaries`, RESOURCE_SAMPLES['style-dictionaries'].create);
      expect(res.status).toBe(201);
      expect(res.body.kind).toBe('style-dictionaries');
    });
  });

  describe('cross-workspace access (IDOR)', () => {
    let a: string;
    let b: string;
    let itemInA: string;

    beforeAll(async () => {
      a = await team('Team A');
      // The editor of A is only a viewer... no: in B, `other` is the owner and the editor of A is an editor too
      const created = await h.call('other', 'POST', '/workspaces', { name: 'Team B' });
      b = created.body.id;
      await h.call('other', 'POST', `/workspaces/${b}/members`, { email: PEOPLE.editor.email, role: 'editor' });
      itemInA = (await h.call('editor', 'POST', `/workspaces/${a}/resources/tokens`, RESOURCE_SAMPLES.tokens.create)).body.id;
    });

    it('scopes every item route by the workspace in the path', async () => {
      // `other` owns B but isn't in A: going through B to A's item is 404
      expect((await h.call('other', 'GET', `/workspaces/${b}/resources/tokens/${itemInA}`)).status).toBe(404);
      expect((await h.call('other', 'PATCH', `/workspaces/${b}/resources/tokens/${itemInA}`, { value: '#000' })).status).toBe(404);
      expect((await h.call('other', 'DELETE', `/workspaces/${b}/resources/tokens/${itemInA}`)).status).toBe(404);
      expect((await h.call('other', 'PUT', `/workspaces/${b}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] })).status).toBe(404);
      // Even an editor of both can't change A's item through B
      expect((await h.call('editor', 'PATCH', `/workspaces/${b}/resources/tokens/${itemInA}`, { value: '#000' })).status).toBe(404);
      expect((await h.call('viewer', 'GET', `/workspaces/${a}/resources/tokens/${itemInA}`)).body.value).toBe(RESOURCE_SAMPLES.tokens.create.value);
    });

    it('shares read-only: B can read A\'s shared item but only A can change it', async () => {
      const shared = await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] });
      expect(shared.status).toBe(200);
      expect(shared.body.sharedWith).toEqual([b]);
      const inB = await h.call('other', 'GET', `/workspaces/${b}/resources/tokens`);
      expect(inB.body.map((r: any) => r.id)).toContain(itemInA);
      expect((await h.call('other', 'GET', `/workspaces/${b}/resources/tokens/${itemInA}`)).status).toBe(200);
      expect((await h.call('other', 'PATCH', `/workspaces/${b}/resources/tokens/${itemInA}`, { value: '#000' })).status).toBe(404);
      // body.requestingWorkspaceId and the like are not accepted
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b], requestingWorkspaceId: b })).status).toBe(400);
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: ['ws_doesnotexist'] })).status).toBe(400);
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [a] })).status).toBe(400);
    });

    it('needs a workspace admin to make an item global, and refuses to re-share a global item', async () => {
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [], isGlobal: true })).status).toBe(403);
      const global = await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [], isGlobal: true });
      expect(global.status).toBe(200);
      expect(global.body).toMatchObject({ isGlobal: true, sharedWith: [] });
      expect((await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] })).status).toBe(409);
      const outsiderWs = (await h.call('outsider', 'POST', '/workspaces', { name: 'Outsider WS' })).body.id;
      expect((await h.call('outsider', 'GET', `/workspaces/${outsiderWs}/resources/tokens`)).body.map((r: any) => r.id)).toContain(itemInA);
      const back = await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [], isGlobal: false });
      expect(back.body.isGlobal).toBe(false);
    });

    it('enforces requireApprovalForSharing and allowExternalSharing', async () => {
      await h.call('owner', 'PATCH', `/workspaces/${a}`, { settings: { requireApprovalForSharing: true } });
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] })).status).toBe(403);
      expect((await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] })).status).toBe(200);

      // Turning external sharing off withdraws existing shares and blocks new ones
      const off = await h.call('owner', 'PATCH', `/workspaces/${a}`, { settings: { allowExternalSharing: false } });
      expect(off.body.settings).toMatchObject({ allowExternalSharing: false, requireApprovalForSharing: true });
      expect((await h.call('other', 'GET', `/workspaces/${b}/resources/tokens`)).body.map((r: any) => r.id)).not.toContain(itemInA);
      expect((await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [b] })).status).toBe(403);
      expect((await h.call('admin', 'PUT', `/workspaces/${a}/resources/tokens/${itemInA}/sharing`, { workspaceIds: [], isGlobal: true })).status).toBe(403);
    });
  });

  describe('components', () => {
    it('lists visible components and shares only the workspace\'s own', async () => {
      const a = await team('Comp A');
      const b = (await h.call('other', 'POST', '/workspaces', { name: 'Comp B' })).body.id;
      h.components.components.push(
        { id: 'cmp-a', name: 'Button A', status: 'production', workspaceId: a },
        { id: 'cmp-b', name: 'Button B', status: 'production', workspaceId: b },
        { id: 'cmp-global', name: 'Card', status: 'deprecated', isGlobal: true },
      );
      const list = await h.call('viewer', 'GET', `/workspaces/${a}/components`);
      expect(list.body.components.map((c: any) => c.id).sort()).toEqual(['cmp-a', 'cmp-global']);
      expect((await h.call('editor', 'PUT', `/workspaces/${a}/components/cmp-b/sharing`, { workspaceIds: [a] })).status).toBe(404);
      const shared = await h.call('editor', 'PUT', `/workspaces/${a}/components/cmp-a/sharing`, { workspaceIds: [b] });
      expect(shared.status).toBe(200);
      expect((await h.call('other', 'GET', `/workspaces/${b}/components`)).body.components.map((c: any) => c.id)).toContain('cmp-a');
      // Clean up so other tests' analytics aren't affected
      h.components.components.splice(0);
    });
  });

  describe('analytics', () => {
    it('computes from real data and says when there is no usage data', async () => {
      const id = await team('Analytics');
      h.components.components.push(
        { id: 'an-1', name: 'Button', status: 'production', workspaceId: id },
        { id: 'an-2', name: 'Modal', status: 'production', workspaceId: id },
        { id: 'an-3', name: 'Old', status: 'deprecated', workspaceId: id },
      );
      const empty = await h.call('viewer', 'GET', `/workspaces/${id}/analytics`);
      expect(empty.body).toMatchObject({
        totalComponents: 3,
        totalApplications: 0,
        designDebt: 1,
        healthScore: 95,
        usageDataAvailable: false,
        adoptionRate: null,
        mostUsedComponents: [],
        adoptionMetrics: { componentsAvailable: 2, componentsAdopted: null, adoptionPercentage: null },
      });

      const app = await h.call('owner', 'POST', '/applications/register', { name: 'Web', workspaceId: id });
      expect(app.status).toBe(201);
      h.components.usage.set('an-1', [{ applicationId: app.body.id, usageCount: 7 }, { applicationId: 'app_elsewhere', usageCount: 99 }]);
      const withUsage = await h.call('viewer', 'GET', `/workspaces/${id}/analytics`);
      expect(withUsage.body).toMatchObject({
        totalApplications: 1,
        usageDataAvailable: true,
        adoptionRate: 100,
        mostUsedComponents: [{ id: 'an-1', name: 'Button', usage: 7, applications: 1 }],
        adoptionMetrics: { componentsAdopted: 1, adoptionPercentage: 50, applicationsUsingComponents: 1, averageComponentsPerApp: 1 },
      });
      // Same input, same output (no random numbers)
      expect((await h.call('viewer', 'GET', `/workspaces/${id}/analytics`)).body).toEqual(withUsage.body);

      const compare = await h.call('viewer', 'GET', '/workspaces/analytics/compare');
      expect(compare.status).toBe(200);
      expect(compare.body.map((r: any) => r.workspaceId)).toContain(id);
      expect((await h.call('outsider', 'GET', `/workspaces/analytics/compare?workspaceIds=${id}`)).body).toEqual([]);

      await h.call('owner', 'DELETE', `/applications/${app.body.id}`);
      h.components.components.splice(0);
      h.components.usage.clear();
    });
  });

  describe('deleting a workspace', () => {
    it('is blocked while applications belong to it, then deletes its items and withdraws shares', async () => {
      const id = await team('Doomed');
      const other = (await h.call('other', 'POST', '/workspaces', { name: 'Neighbour' })).body.id;
      const own = (await h.call('editor', 'POST', `/workspaces/${id}/resources/guidelines`, RESOURCE_SAMPLES.guidelines.create)).body.id;
      const neighbours = (await h.call('other', 'POST', `/workspaces/${other}/resources/guidelines`, RESOURCE_SAMPLES.guidelines.create)).body.id;
      await h.call('other', 'PUT', `/workspaces/${other}/resources/guidelines/${neighbours}/sharing`, { workspaceIds: [id] });
      const app = (await h.call('owner', 'POST', '/applications/register', { name: 'Doomed app', workspaceId: id })).body;

      const blocked = await h.call('owner', 'DELETE', `/workspaces/${id}`);
      expect(blocked.status).toBe(409);
      expect(blocked.body.message).toMatch(/1 application/);

      expect((await h.call('owner', 'DELETE', `/applications/${app.id}`)).status).toBe(200);
      const deleted = await h.call('owner', 'DELETE', `/workspaces/${id}`);
      expect(deleted.status).toBe(200);
      expect(deleted.body).toEqual({ deletedItems: 1 });
      expect(h.resourceStore.docs.has(own)).toBe(false);
      expect(h.resourceStore.docs.get(neighbours).doc.sharedWith).toEqual([]);
      expect((await h.call('owner', 'GET', `/workspaces/${id}`)).status).toBe(404);
    });

    it('lets an admin:users holder delete any workspace', async () => {
      const id = (await h.call('other', 'POST', '/workspaces', { name: 'Abandoned' })).body.id;
      expect((await h.call('superuser', 'DELETE', `/workspaces/${id}`)).status).toBe(200);
    });
  });

  describe('GET /users/:userId/workspaces', () => {
    it('returns { workspaceId, name, slug, role } to the user themself or admin:users', async () => {
      const id = await team('Per user');
      const own = await h.call('viewer', 'GET', `/users/${PEOPLE.viewer.id}/workspaces`);
      expect(own.status).toBe(200);
      expect(own.body).toEqual(expect.arrayContaining([{ workspaceId: id, name: 'Per user', slug: 'per-user', role: 'viewer' }]));
      expect(Object.keys(own.body[0]).sort()).toEqual(['name', 'role', 'slug', 'workspaceId']);
      expect((await h.call('viewer', 'GET', `/users/${PEOPLE.owner.id}/workspaces`)).status).toBe(403);
      expect((await h.call('superuser', 'GET', `/users/${PEOPLE.owner.id}/workspaces`)).body).toEqual(
        expect.arrayContaining([{ workspaceId: id, name: 'Per user', slug: 'per-user', role: 'owner' }]),
      );
    });

    it('adds and removes a user by id with workspace-admin rules', async () => {
      const id = await team('Per user 2');
      expect((await h.call('editor', 'POST', `/users/${PEOPLE.other.id}/workspaces`, { workspaceId: id, role: 'viewer' })).status).toBe(403);
      expect((await h.call('admin', 'POST', `/users/${PEOPLE.other.id}/workspaces`, { workspaceId: id, role: 'viewer', addedBy: 'x' })).status).toBe(400);
      expect((await h.call('admin', 'POST', `/users/${PEOPLE.other.id}/workspaces`, { workspaceId: id, role: 'viewer' })).status).toBe(201);
      expect((await h.call('admin', 'POST', `/users/usr_nobody/workspaces`, { workspaceId: id, role: 'viewer' })).status).toBe(404);
      expect((await h.call('admin', 'DELETE', `/users/${PEOPLE.other.id}/workspaces/${id}`)).status).toBe(200);
    });
  });
});
