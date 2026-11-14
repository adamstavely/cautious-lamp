import { createServer, request, Server } from 'http';
import { AddressInfo, connect } from 'net';
import { EgressProxy, startEgressProxy } from './egress-proxy';
import { HostResolver } from './url-safety';

/**
 * The fixture server listens on 127.0.0.1, so these tests treat 127.0.0.1 as
 * the "public" address and anything else private ones as internal.
 */
const allowLoopbackOnly = (address: string) => address === '127.0.0.1';

/** A rebinding resolver: the first answer is the allowed address, later ones are internal */
function rebindingResolver() {
  const state = { calls: 0 };
  const resolve: HostResolver = async () => {
    state.calls++;
    return state.calls === 1 ? [{ address: '127.0.0.1', family: 4 }] : [{ address: '10.255.255.1', family: 4 }];
  };
  return { resolve, state };
}

function viaProxy(proxy: EgressProxy, url: string): Promise<{ status: number; body: string }> {
  const { port } = new URL(proxy.url);
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: Number(port), method: 'GET', path: url, headers: { host: new URL(url).host } }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

function connectViaProxy(proxy: EgressProxy, authority: string): Promise<string> {
  const { port } = new URL(proxy.url);
  return new Promise((resolve, reject) => {
    const socket = connect(Number(port), '127.0.0.1', () => socket.write(`CONNECT ${authority} HTTP/1.1\r\nHost: ${authority}\r\n\r\n`));
    socket.once('data', (data) => {
      resolve(data.toString().split('\r\n')[0]);
      socket.destroy();
    });
    socket.on('error', reject);
  });
}

describe('egress proxy', () => {
  let target: Server;
  let targetPort: number;
  let hits = 0;

  beforeAll(async () => {
    target = createServer((_req, res) => {
      hits++;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('hello');
    });
    await new Promise<void>((resolve) => target.listen(0, '127.0.0.1', resolve));
    targetPort = (target.address() as AddressInfo).port;
  });

  afterAll(() => new Promise<void>((resolve) => target.close(() => resolve())));

  it('checks the address it actually connects to on every request (DNS rebinding)', async () => {
    const resolver = rebindingResolver();
    const proxy = await startEgressProxy({ resolve: resolver.resolve, isAllowedAddress: allowLoopbackOnly });
    try {
      const url = `http://rebind.example:${targetPort}/`;
      hits = 0;
      expect(await viaProxy(proxy, url)).toEqual({ status: 200, body: 'hello' });
      // Same host, new answer: refused without connecting anywhere
      expect((await viaProxy(proxy, url)).status).toBe(403);
      expect(resolver.state.calls).toBe(2);
      expect(hits).toBe(1);
      expect(proxy.blocked).toEqual([`rebind.example:${targetPort}`]);
    } finally {
      await proxy.close();
    }
  });

  it('applies the same check to CONNECT tunnels (https, WebSockets)', async () => {
    const resolver = rebindingResolver();
    const proxy = await startEgressProxy({ resolve: resolver.resolve, isAllowedAddress: allowLoopbackOnly });
    try {
      expect(await connectViaProxy(proxy, `rebind.example:${targetPort}`)).toMatch(/^HTTP\/1\.1 200/);
      expect(await connectViaProxy(proxy, `rebind.example:${targetPort}`)).toMatch(/^HTTP\/1\.1 403/);
    } finally {
      await proxy.close();
    }
  });

  it('refuses private IP literals and hosts resolving to any private address with the default policy', async () => {
    const proxy = await startEgressProxy({ resolve: async () => [{ address: '93.184.215.14', family: 4 }, { address: '169.254.169.254', family: 4 }] });
    try {
      hits = 0;
      expect((await viaProxy(proxy, `http://127.0.0.1:${targetPort}/`)).status).toBe(403);
      expect((await viaProxy(proxy, 'http://mixed.example/')).status).toBe(403);
      expect(await connectViaProxy(proxy, `127.0.0.1:${targetPort}`)).toMatch(/^HTTP\/1\.1 403/);
      expect(await connectViaProxy(proxy, '[::1]:443')).toMatch(/^HTTP\/1\.1 403/);
      expect(hits).toBe(0);
    } finally {
      await proxy.close();
    }
  });

  it('refuses non-http absolute URLs', async () => {
    const proxy = await startEgressProxy({ isAllowedAddress: allowLoopbackOnly });
    try {
      expect((await viaProxy(proxy, 'ftp://127.0.0.1/')).status).toBe(400);
    } finally {
      await proxy.close();
    }
  });
});
