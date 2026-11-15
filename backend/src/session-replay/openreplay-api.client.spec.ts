import { AddressInfo } from 'net';
import { OpenReplayApiClient, OpenReplayError } from './openreplay-api.client';
import { FakeOpenReplay, startFakeOpenReplay } from './testing/fake-openreplay';

/** Against a local stand-in for OpenReplay's public API (no real OpenReplay is reachable from tests) */
describe('OpenReplayApiClient', () => {
  let fake: FakeOpenReplay;
  let client: OpenReplayApiClient;

  beforeAll(async () => {
    fake = await startFakeOpenReplay();
  });
  afterAll(() => fake.close());
  beforeEach(() => {
    fake.reset();
    client = new OpenReplayApiClient(fake.baseUrl, 'org-key');
  });

  it('calls the public API with the organization key as a bearer token', async () => {
    await client.checkConnection();
    expect(fake.requests[0]).toMatchObject({ method: 'GET', path: '/v2/api/public/projects', authorization: 'Bearer org-key' });
  });

  it('says when the key is refused or OpenReplay is down', async () => {
    fake.respond('GET', '/v2/api/public/projects', 401, { error: 'nope' });
    await expect(client.checkConnection()).rejects.toThrow('OpenReplay rejected the API key');
    expect(await client.verifyConnection()).toBe(false);

    const port = (fake.server.address() as AddressInfo).port;
    const closed = new OpenReplayApiClient(`http://127.0.0.1:${port + 1}`, 'k');
    await expect(closed.checkConnection()).rejects.toBeInstanceOf(OpenReplayError);
  });

  it('looks a project up by its key', async () => {
    fake.respond('GET', '/v2/api/public/projects/abc123', 200, { data: { projectId: 42, projectKey: 'abc123', name: 'Shop' } });
    expect(await client.getProject('abc123')).toMatchObject({ projectId: 42 });
    expect(await client.getProject('missing')).toBeNull();
  });

  it('lists one user’s sessions with the window and page in the body', async () => {
    fake.respond('POST', '/v2/api/public/abc123/users/u%2F1/sessions', 200, {
      data: { total: 31, sessions: [{ sessionId: 's1', startTs: 1000, endTs: 61000, eventsCount: 4 }] },
    });
    const window = { startTimestamp: 1, endTimestamp: 2, page: 2, limit: 10, sortOrder: 'desc' as const };
    const page = await client.listUserSessions('abc123', 'u/1', window);
    expect(page).toEqual({ total: 31, items: [{ sessionId: 's1', startTs: 1000, endTs: 61000, eventsCount: 4 }] });
    expect(fake.requests[0].body).toEqual(window);
  });

  it('lists a session’s events', async () => {
    fake.respond('POST', '/v2/api/public/abc123/sessions/s1/events', 200, {
      data: { total: 1, events: [{ event_id: 'e1', $event_name: 'CLICK', created_at: 5 }] },
    });
    const page = await client.listSessionEvents('abc123', 's1', { startTimestamp: 1, endTimestamp: 9, page: 1, limit: 50 });
    expect(page.items).toHaveLength(1);
    expect(fake.requests[0].body).toMatchObject({ page: 1, limit: 50 });
  });
});
