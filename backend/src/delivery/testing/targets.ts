import * as http from 'http';
import { AddressInfo } from 'net';
import { isBlockedAddress } from '../../common/security/url-safety';
import { MailSender } from '../mail-transport';

/** A local HTTP target that answers each request with the next status in `statuses` (the last one repeats) */
export async function startTarget(statuses: number[] = [200]) {
  const received: Array<{ path: string; headers: http.IncomingHttpHeaders; body: string }> = [];
  let hang = false;
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      received.push({ path: req.url ?? '', headers: req.headers, body });
      if (hang) return;
      const status = statuses[Math.min(received.length - 1, statuses.length - 1)];
      res.writeHead(status).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: (path = '/hook') => `http://127.0.0.1:${port}${path}`,
    received,
    hangForever: () => (hang = true),
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

/** Loopback is allowed so tests can run a local target; every other private range is still refused */
export const TEST_EGRESS = { isAllowedAddress: (address: string) => address === '127.0.0.1' || !isBlockedAddress(address) };

export function fakeMail(failures: Array<Error & { responseCode?: number; code?: string }> = []) {
  const sent: Array<{ from: string; to: string[]; subject: string; text: string }> = [];
  const queue = [...failures];
  const sender: MailSender = {
    async sendMail(mail) {
      const failure = queue.shift();
      if (failure) throw failure;
      sent.push(mail);
      return { messageId: 'x' };
    },
  };
  return { sent, factory: () => sender };
}
