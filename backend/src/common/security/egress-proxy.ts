import * as http from 'http';
import { AddressInfo, Socket, connect } from 'net';
import { DestinationPolicy, resolvePublicAddress } from './url-safety';

/** Headers that describe one hop, not the request; never forwarded */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-connection',
  'proxy-authorization',
  'proxy-authenticate',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
]);

function forwardable(headers: http.IncomingHttpHeaders): http.OutgoingHttpHeaders {
  const out: http.OutgoingHttpHeaders = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value !== undefined && !HOP_BY_HOP.has(name.toLowerCase())) out[name] = value;
  }
  return out;
}

export interface EgressProxy {
  /** `http://127.0.0.1:<port>`, for Chromium's --proxy-server */
  url: string;
  /** Hosts that were refused, for logs and tests */
  blocked: string[];
  close(): Promise<void>;
}

/**
 * A local forward proxy that only connects to public addresses. Each
 * connection resolves the host once, checks every answer, then connects to
 * that exact address, so the check and the connection can't disagree (DNS
 * rebinding). Plain http requests are forwarded; https and WebSockets come
 * through CONNECT tunnels, so TLS stays end to end between the browser and
 * the site.
 *
 * Headless Chromium is pointed at it (see chromiumEgressOptions) so every
 * request the page makes, including navigations, redirects, subresources,
 * fetch/XHR, WebSockets and service workers, goes through this check.
 */
export async function startEgressProxy(policy: DestinationPolicy = {}): Promise<EgressProxy> {
  const sockets = new Set<Socket>();
  const track = (socket: Socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  };
  const blocked: string[] = [];

  const server = http.createServer((req, res) => {
    let target: URL;
    try {
      target = new URL(req.url ?? '');
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (target.protocol !== 'http:') {
      res.writeHead(400).end();
      return;
    }
    resolvePublicAddress(target.hostname, policy).then(
      ({ address, family }) => {
        const upstream = http.request(
          {
            host: address,
            family,
            port: Number(target.port) || 80,
            method: req.method,
            path: `${target.pathname}${target.search}`,
            headers: { ...forwardable(req.headers), host: target.host },
          },
          (upstreamRes) => {
            res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.statusMessage, forwardable(upstreamRes.headers));
            upstreamRes.pipe(res);
          },
        );
        upstream.on('socket', track);
        upstream.on('error', () => {
          if (!res.headersSent) res.writeHead(502);
          res.end();
        });
        req.pipe(upstream);
      },
      () => {
        blocked.push(target.host);
        res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Blocked: not a public address');
      },
    );
  });

  server.on('connect', (req: http.IncomingMessage, client: Socket, head: Buffer) => {
    client.on('error', () => undefined);
    let hostname: string;
    let port: number;
    try {
      const authority = new URL(`http://${req.url ?? ''}`);
      hostname = authority.hostname;
      port = Number(authority.port) || 443;
    } catch {
      client.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      return;
    }
    resolvePublicAddress(hostname, policy).then(
      ({ address }) => {
        const upstream = connect({ host: address, port }, () => {
          client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
          if (head.length) upstream.write(head);
          upstream.pipe(client);
          client.pipe(upstream);
        });
        track(upstream);
        upstream.on('error', () => client.destroy());
        client.on('close', () => upstream.destroy());
      },
      () => {
        blocked.push(`${hostname}:${port}`);
        client.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      },
    );
  });

  // Upgrades over plain http (ws:// without CONNECT) aren't supported; refuse them
  server.on('upgrade', (_req, socket: Socket) => socket.destroy());
  server.on('connection', track);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    blocked,
    close: () =>
      new Promise<void>((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.close(() => resolve());
      }),
  };
}

/**
 * Chromium launch options that send all traffic through an egress proxy.
 * `<-loopback>` stops Chromium's built-in proxy bypass for localhost, and the
 * flags keep UDP (QUIC, WebRTC) from going around the proxy.
 */
export function chromiumEgressOptions(proxy: Pick<EgressProxy, 'url'>) {
  return {
    proxy: { server: proxy.url, bypass: '<-loopback>' },
    args: ['--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'],
  };
}
