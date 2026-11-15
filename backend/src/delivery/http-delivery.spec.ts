import * as http from 'http';
import { AddressInfo } from 'net';
import { DeliveryHttpError, postJson } from './http-delivery';

/** Loopback only, for these tests: the real policy refuses private addresses */
const LOOPBACK = { resolve: async () => [{ address: '127.0.0.1', family: 4 }], isAllowedAddress: () => true };

/**
 * postJson against a local server that misbehaves: a body trickled forever,
 * headers that never come. The server and every socket are closed after each test.
 */
describe('postJson', () => {
  let server: http.Server;
  let url: string;
  let open: Set<import('net').Socket>;
  let timers: NodeJS.Timeout[];
  let handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;

  beforeEach(async () => {
    open = new Set();
    timers = [];
    server = http.createServer((req, res) => handler(req, res));
    server.on('connection', (socket) => {
      open.add(socket);
      socket.on('close', () => open.delete(socket));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    url = `http://delivery.test:${(server.address() as AddressInfo).port}/hook`;
  });

  afterEach(async () => {
    timers.forEach(clearInterval);
    for (const socket of open) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  /** Answers with `status` straight away, then sends a chunk every 10ms and never ends */
  const trickle = (status: number) => (req: http.IncomingMessage, res: http.ServerResponse) => {
    req.resume();
    res.writeHead(status, { 'Content-Type': 'text/plain' });
    timers.push(setInterval(() => res.write('.'), 10));
  };

  it('resolves on the status and closes the connection while the body is still trickling', async () => {
    handler = trickle(200);
    await expect(postJson(url, '{}', {}, { timeoutMs: 40, policy: LOOPBACK })).resolves.toBe(200);
    await wait(200);
    expect(open.size).toBe(0);
  });

  it('closes the connection on an error status too', async () => {
    handler = trickle(503);
    await expect(postJson(url, '{}', {}, { timeoutMs: 40, policy: LOOPBACK })).rejects.toMatchObject({ status: 503, retryable: true });
    await wait(100);
    expect(open.size).toBe(0);
  });

  it('gives up when the status line never comes, within the deadline', async () => {
    handler = (req) => req.resume();
    const started = Date.now();
    const error = await postJson(url, '{}', {}, { timeoutMs: 60, policy: LOOPBACK }).catch((e) => e);
    expect(error).toBeInstanceOf(DeliveryHttpError);
    expect(error).toMatchObject({ retryable: true, message: expect.stringMatching(/Timed out after 60ms/) });
    expect(Date.now() - started).toBeLessThan(1000);
    await wait(50);
    expect(open.size).toBe(0);
  });

  it('gives up on headers trickled slower than the deadline, even though the socket is never idle', async () => {
    handler = (req, res) => {
      req.resume();
      // Keep the socket busy without ever finishing the status line
      timers.push(setInterval(() => res.socket?.write('H'), 10));
    };
    const error = await postJson(url, '{}', {}, { timeoutMs: 60, policy: LOOPBACK }).catch((e) => e);
    expect(error).toBeInstanceOf(DeliveryHttpError);
    await wait(50);
    expect(open.size).toBe(0);
  });

  it("doesn't follow redirects", async () => {
    handler = (req, res) => {
      req.resume();
      res.writeHead(302, { Location: 'http://169.254.169.254/' }).end();
    };
    await expect(postJson(url, '{}', {}, { timeoutMs: 200, policy: LOOPBACK })).rejects.toMatchObject({ status: 302, retryable: false });
  });
});
