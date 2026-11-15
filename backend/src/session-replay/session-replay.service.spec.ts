import { BadGatewayException, BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { SYSTEM_CREATOR, createProjectServices } from '../visual-regression/testing/services';
import { FakeOpenReplay, startFakeOpenReplay } from './testing/fake-openreplay';

const owner = { workspaceId: null, createdBy: SYSTEM_CREATOR };

/** OpenReplay is a local stand-in (testing/fake-openreplay.ts): no real instance is reachable from tests */
describe('SessionReplayService', () => {
  const savedEnv = { ...process.env };
  let fake: FakeOpenReplay;

  beforeAll(async () => {
    fake = await startFakeOpenReplay();
    process.env.OPENREPLAY_ALLOWED_BASE_URLS = fake.baseUrl;
  });
  afterAll(async () => {
    process.env = savedEnv;
    await fake.close();
  });
  beforeEach(() => fake.reset());

  describe('project key and project id', () => {
    it('keeps the tracker key and the numeric id apart, and checks each', async () => {
      const { sessionReplay } = createProjectServices();
      const project = await sessionReplay.createProject('t', { name: 'Shop', openreplayProjectKey: 'abc123', openreplayProjectId: 42 }, owner);
      expect(project).toMatchObject({ openreplayProjectKey: 'abc123', openreplayProjectId: 42 });

      for (const bad of [
        { openreplayProjectKey: '42' }, // the numeric id in the key's place
        { openreplayProjectKey: 'has spaces' },
        { openreplayProjectKey: '' },
        { openreplayProjectKey: 'abc123', openreplayProjectId: 0 },
        { openreplayProjectKey: 'abc123', openreplayProjectId: 1.5 },
      ]) {
        await expect(sessionReplay.createProject('t', { name: 'x', ...bad }, owner)).rejects.toBeInstanceOf(BadRequestException);
      }
      await expect(sessionReplay.updateProject(project.id, { openreplayProjectKey: '7' })).rejects.toThrow(/numeric project id/);
      expect(await sessionReplay.updateProject(project.id, { openreplayProjectId: null })).not.toHaveProperty('openreplayProjectId');
    });

    it('with an API key, asks OpenReplay for the project and takes its numeric id', async () => {
      const { sessionReplay } = createProjectServices();
      fake.respond('GET', '/v2/api/public/projects/abc123', 200, { data: { projectId: 42, projectKey: 'abc123', name: 'Shop' } });
      const base = { name: 'Shop', openreplayBaseUrl: fake.baseUrl, openreplayApiKey: 'org-key' };

      const project = await sessionReplay.createProject('t', { ...base, openreplayProjectKey: 'abc123' }, owner);
      expect(project).toMatchObject({ openreplayProjectId: 42, hasApiKey: true });
      expect(project).not.toHaveProperty('openreplayApiKey');

      await expect(sessionReplay.createProject('t', { ...base, openreplayProjectKey: 'abc123', openreplayProjectId: 7 }, owner)).rejects.toThrow(
        /belongs to project 42, not 7/,
      );
      await expect(sessionReplay.createProject('t', { ...base, openreplayProjectKey: 'nope99' }, owner)).rejects.toThrow(/no project with the key/);
      fake.respond('GET', '/v2/api/public/projects', 403, {});
      await expect(sessionReplay.createProject('t', { ...base, openreplayProjectKey: 'abc123' }, owner)).rejects.toThrow(/rejected the API key/);
    });

    it('migrates a project saved with the numeric id as its key', async () => {
      const { sessionReplay, srProjects } = createProjectServices();
      const now = new Date().toISOString();
      await srProjects.create({
        id: 'sr-old',
        teamId: 't',
        name: 'Old',
        workspaceId: null,
        createdBy: SYSTEM_CREATOR,
        openreplayProjectKey: '7',
        privacySettings: { maskAllInputs: true, maskAllText: true, blockSelector: ['.ad'] },
        createdAt: now,
        updatedAt: now,
      } as any);

      const read = await sessionReplay.getProject('sr-old');
      expect(read.openreplayProjectKey).toBeUndefined();
      expect(read.openreplayProjectId).toBe(7);
      expect(read.privacySettings).toMatchObject({ defaultInputMode: 'obscured', privateMode: true, blockSelector: ['.ad'], respectDoNotTrack: true });
      // Links still work; the tracker needs the key entered again
      expect(await sessionReplay.getReplayUrl('sr-old', 's1')).toBe('https://app.openreplay.com/7/session/s1');
      await expect(sessionReplay.getIntegrationCode('sr-old')).rejects.toMatchObject({ response: { code: 'OPENREPLAY_PROJECT_KEY_MISSING' } });

      await sessionReplay.updateProject('sr-old', { openreplayProjectKey: 'abc123' });
      const stored = (await srProjects.get('sr-old'))!.doc;
      expect(stored).toMatchObject({ openreplayProjectKey: 'abc123', openreplayProjectId: 7, privacySettings: { privateMode: true } });
      expect(stored.privacySettings).not.toHaveProperty('maskAllText');
    });
  });

  describe('privacy and capture settings', () => {
    it('merges changes, checks selectors, and shows up in the integration code', async () => {
      const { sessionReplay } = createProjectServices();
      const project = await sessionReplay.createProject('t', { name: 'Shop', openreplayProjectKey: 'abc123' }, owner);
      expect(project.privacySettings).toMatchObject({ defaultInputMode: 'obscured', obscureInputEmails: true, respectDoNotTrack: true });
      expect(project.config).toMatchObject({ captureNetworkPayload: false });

      const updated = await sessionReplay.updateProject(project.id, {
        privacySettings: { defaultInputMode: 'ignored', blockSelector: ['.card-number'] },
        config: { captureConsole: false },
      });
      expect(updated.privacySettings).toMatchObject({ defaultInputMode: 'ignored', blockSelector: ['.card-number'], obscureInputEmails: true });
      expect(updated.config).toMatchObject({ captureConsole: false, captureNetwork: true });

      const code = await sessionReplay.getIntegrationCode(project.id);
      for (const snippet of [code.script, code.npm]) {
        expect(snippet).toContain('defaultInputMode: 2');
        expect(snippet).toContain('consoleMethods: []');
        expect(snippet).toContain('node.matches(".card-number")');
      }

      await expect(sessionReplay.updateProject(project.id, { privacySettings: { maskTextSelector: ['div[['] } })).rejects.toThrow(/not a valid CSS selector/);
    });
  });

  describe('links into OpenReplay', () => {
    it('builds the replay and heatmap URLs from the numeric id, and says when it is missing', async () => {
      const { sessionReplay } = createProjectServices();
      const own = await sessionReplay.createProject('t', { name: 'A', openreplayProjectKey: 'abc123', openreplayProjectId: 3, openreplayBaseUrl: fake.baseUrl }, owner);
      expect(await sessionReplay.getReplayUrl(own.id, 'sess_1')).toBe(`${fake.baseUrl}/3/session/sess_1`);
      expect(await sessionReplay.getHeatmapsUrl(own.id)).toBe(`${fake.baseUrl}/3/metrics`);
      await expect(sessionReplay.getReplayUrl(own.id, '../admin')).rejects.toBeInstanceOf(BadRequestException);

      const noId = await sessionReplay.createProject('t', { name: 'B', openreplayProjectKey: 'abc123' }, owner);
      await expect(sessionReplay.getReplayUrl(noId.id, 's1')).rejects.toBeInstanceOf(ConflictException);
      await expect(sessionReplay.getHeatmapsUrl(noId.id)).rejects.toMatchObject({ response: { code: 'OPENREPLAY_PROJECT_ID_MISSING' } });
    });
  });

  describe('sessions', () => {
    async function connected() {
      const { sessionReplay } = createProjectServices();
      fake.respond('GET', '/v2/api/public/projects/abc123', 200, { data: { projectId: 42, projectKey: 'abc123' } });
      const project = await sessionReplay.createProject(
        't',
        { name: 'Shop', openreplayProjectKey: 'abc123', openreplayBaseUrl: fake.baseUrl, openreplayApiKey: 'org-key' },
        owner,
      );
      fake.reset();
      return { sessionReplay, project };
    }

    it('passes the user, date range, page and order through to OpenReplay', async () => {
      const { sessionReplay, project } = await connected();
      fake.respond('POST', '/v2/api/public/abc123/users/user-9/sessions', 200, {
        data: { total: 45, sessions: [{ sessionId: 's1', startTs: Date.UTC(2026, 10, 2), endTs: Date.UTC(2026, 10, 2) + 90_000, eventsCount: 12 }] },
      });

      const page = await sessionReplay.searchSessions(project.id, {
        userId: 'user-9',
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        page: 3,
        limit: 20,
        sortOrder: 'asc',
      });
      expect(fake.requests[0]).toMatchObject({
        method: 'POST',
        authorization: 'Bearer org-key',
        body: {
          startTimestamp: Date.UTC(2026, 10, 1),
          // A bare end date includes the whole day
          endTimestamp: Date.UTC(2026, 10, 4) - 1,
          page: 3,
          limit: 20,
          sortOrder: 'asc',
        },
      });
      expect(page).toMatchObject({ total: 45, page: 3, limit: 20 });
      expect(page.items[0]).toMatchObject({ sessionId: 's1', userId: 'user-9', duration: 90, eventsCount: 12, replayUrl: `${fake.baseUrl}/42/session/s1` });
    });

    it('refuses what the public API would', async () => {
      const { sessionReplay, project } = await connected();
      for (const params of [
        { userId: '' },
        { userId: 'u', limit: 500 },
        { userId: 'u', page: 0 },
        { userId: 'u', startDate: '2026-11-05', endDate: '2026-11-01' },
      ]) {
        await expect(sessionReplay.searchSessions(project.id, params)).rejects.toBeInstanceOf(BadRequestException);
      }
      expect(fake.requests).toHaveLength(0);
    });

    it('reports OpenReplay failures and missing credentials honestly', async () => {
      const { sessionReplay, project } = await connected();
      fake.respond('POST', '/v2/api/public/abc123/users/u/sessions', 500, {});
      await expect(sessionReplay.searchSessions(project.id, { userId: 'u' })).rejects.toBeInstanceOf(BadGatewayException);

      const bare = await sessionReplay.createProject('t', { name: 'No key', openreplayProjectKey: 'abc123' }, owner);
      await expect(sessionReplay.searchSessions(bare.id, { userId: 'u' })).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('lists a session’s events', async () => {
      const { sessionReplay, project } = await connected();
      fake.respond('POST', '/v2/api/public/abc123/sessions/s1/events', 200, {
        data: { total: 1, events: [{ event_id: 'e1', $event_name: 'CLICK', created_at: Date.UTC(2026, 10, 2), $properties: { label: 'Buy' } }] },
      });
      const events = await sessionReplay.listSessionEvents(project.id, 's1', { startDate: '2026-11-01', endDate: '2026-11-02', limit: 50 });
      expect(events.items).toEqual([{ id: 'e1', name: 'CLICK', time: '2026-11-02T00:00:00.000Z', autoCaptured: false, properties: { label: 'Buy' } }]);
      expect(fake.requests[0].body).toMatchObject({ page: 1, limit: 50, sortOrder: 'asc' });
    });
  });
});
