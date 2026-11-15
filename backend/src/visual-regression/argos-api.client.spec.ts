import { createServer, IncomingMessage, Server } from 'http';
import { AddressInfo } from 'net';
import { ArgosApiClient, ArgosApiError, parseArgosProjectId } from './argos-api.client';

/**
 * The real Argos can't be reached from tests, so a local server answers like
 * its v2 API (paths, bearer auth and response shapes from @argos-ci/api-client).
 */
describe('ArgosApiClient', () => {
  let server: Server;
  let baseUrl: string;
  const requests: Array<{ method: string; url: string; auth?: string; body?: unknown }> = [];
  /** Status to answer GET /projects/acme/web with */
  let projectStatus = 200;

  const project = { id: 'p1', name: 'web', account: { id: 'a1', slug: 'acme' }, defaultBaseBranch: 'main' };
  const diff = (n: number) => ({ id: `d${n}`, name: `shot-${n}`, status: 'changed', score: 0.1, url: null, base: null, head: null });

  const readBody = (req: IncomingMessage) =>
    new Promise<unknown>((resolve) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => resolve(raw ? JSON.parse(raw) : undefined));
    });

  beforeAll(async () => {
    server = createServer(async (req, res) => {
      const body = await readBody(req);
      requests.push({ method: req.method!, url: req.url!, auth: req.headers.authorization, body });
      const send = (status: number, payload: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
      };
      if (req.headers.authorization !== 'Bearer good-token') return send(401, { error: 'Unauthorized' });
      const url = new URL(req.url!, 'http://x');
      if (url.pathname === '/v2/projects/acme/web') {
        return projectStatus === 200 ? send(200, project) : send(projectStatus, { error: 'nope' });
      }
      if (url.pathname === '/v2/projects/acme/web/builds/7/diffs') {
        // 150 diffs over two pages of 100
        const page = Number(url.searchParams.get('page'));
        const all = Array.from({ length: 150 }, (_, i) => diff(i + 1));
        return send(200, { pageInfo: { total: 150, page, perPage: 100 }, results: all.slice((page - 1) * 100, page * 100) });
      }
      if (url.pathname === '/v2/projects/acme/web/builds/7/reviews' && req.method === 'POST') return send(200, { id: 'r1' });
      if (url.pathname.startsWith('/v2/projects/')) return send(404, { error: 'Not found' });
      send(500, { error: 'boom' });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v2`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  beforeEach(() => {
    requests.length = 0;
    projectStatus = 200;
  });

  it('parses owner/project ids', () => {
    expect(parseArgosProjectId('acme/web')).toEqual({ owner: 'acme', project: 'web' });
    expect(parseArgosProjectId('argos-1')).toBeNull();
    expect(parseArgosProjectId('acme/web/extra')).toBeNull();
  });

  it('verifies against the project itself with a bearer token', async () => {
    const result = await new ArgosApiClient(baseUrl, 'good-token').verify('acme/web');
    expect(result).toEqual({ ok: true, project });
    expect(requests).toEqual([{ method: 'GET', url: '/v2/projects/acme/web', auth: 'Bearer good-token', body: undefined }]);
  });

  it('maps a refused token to unauthorized, not success', async () => {
    const client = new ArgosApiClient(baseUrl, 'bad-token');
    expect(await client.verify('acme/web')).toMatchObject({ ok: false, reason: 'unauthorized', status: 401 });
    expect(await client.verifyConnection('acme/web')).toBe(false);
    projectStatus = 403;
    expect(await new ArgosApiClient(baseUrl, 'good-token').verify('acme/web')).toMatchObject({ ok: false, reason: 'unauthorized', status: 403 });
  });

  it('maps 404 to a wrong project, 5xx to an Argos error, and no answer to unreachable', async () => {
    const client = new ArgosApiClient(baseUrl, 'good-token');
    expect(await client.verify('acme/other')).toMatchObject({ ok: false, reason: 'project_not_found', status: 404 });
    projectStatus = 502;
    expect(await client.verify('acme/web')).toMatchObject({ ok: false, reason: 'error', status: 502 });
    expect(await new ArgosApiClient('http://127.0.0.1:1/v2', 'good-token').verify('acme/web')).toMatchObject({ ok: false, reason: 'unreachable' });
  });

  it('refuses a project id that is not owner/project without calling Argos', async () => {
    expect(await new ArgosApiClient(baseUrl, 'good-token').verify('argos-1')).toMatchObject({ ok: false, reason: 'invalid_project_id' });
    expect(requests).toEqual([]);
  });

  it('reads every page of a build’s diffs', async () => {
    const diffs = await new ArgosApiClient(baseUrl, 'good-token').listBuildDiffs('acme/web', 7);
    expect(diffs).toHaveLength(150);
    expect(requests.map((r) => r.url)).toEqual([
      '/v2/projects/acme/web/builds/7/diffs?page=1&perPage=100',
      '/v2/projects/acme/web/builds/7/diffs?page=2&perPage=100',
    ]);
  });

  it('reviews screenshots by diff id on the build', async () => {
    await new ArgosApiClient(baseUrl, 'good-token').reviewSnapshots('acme/web', 7, [{ id: 'd1', conclusion: 'APPROVE' }], 'Looks right');
    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: '/v2/projects/acme/web/builds/7/reviews',
      body: { event: 'COMMENT', body: 'Looks right', snapshots: [{ id: 'd1', conclusion: 'APPROVE' }] },
    });
  });

  it('throws ArgosApiError with the status Argos answered', async () => {
    const error = await new ArgosApiClient(baseUrl, 'bad-token').getBuild('acme/web', 7).catch((e) => e);
    expect(error).toBeInstanceOf(ArgosApiError);
    expect(error.status).toBe(401);
  });
});
