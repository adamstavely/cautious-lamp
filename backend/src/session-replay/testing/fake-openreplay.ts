import * as http from 'http';
import { AddressInfo } from 'net';

export interface RecordedRequest {
  method: string;
  path: string;
  authorization?: string;
  body: unknown;
}

export interface FakeOpenReplay {
  server: http.Server;
  /** http://127.0.0.1:<port>, a self-hosted instance as far as the client can tell */
  baseUrl: string;
  requests: RecordedRequest[];
  /** Answers `method path` with `status` and `body` (unregistered routes get 404; GET .../projects gets an empty list) */
  respond(method: string, path: string, status: number, body: unknown): void;
  reset(): void;
  close(): Promise<void>;
}

/**
 * A local HTTP stand-in for OpenReplay's public API, for tests: it records
 * requests and answers with canned responses. Nothing reaches a real OpenReplay.
 */
export async function startFakeOpenReplay(): Promise<FakeOpenReplay> {
  const routes = new Map<string, { status: number; body: unknown }>();
  const requests: RecordedRequest[] = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const path = (req.url ?? '').split('?')[0];
      requests.push({ method: req.method ?? '', path, authorization: req.headers.authorization, body: raw ? JSON.parse(raw) : undefined });
      const route = routes.get(`${req.method} ${path}`) ?? (req.method === 'GET' && /\/projects$/.test(path) ? { status: 200, body: { data: [] } } : undefined);
      res.writeHead(route?.status ?? 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify(route?.body ?? { error: 'not found' }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    respond: (method, path, status, body) => routes.set(`${method} ${path}`, { status, body }),
    reset: () => {
      routes.clear();
      requests.length = 0;
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
