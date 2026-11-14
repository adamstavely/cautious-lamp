import { GatewayTimeoutException } from '@nestjs/common';
import { existsSync } from 'fs';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { chromium, Browser, LaunchOptions } from 'playwright';
import { DesignExtractionService } from './design-extraction.service';

describe('DesignExtractionService browser safety', () => {
  it('launches Chromium behind the egress proxy and stops a hung extraction at the deadline', async () => {
    const service = new DesignExtractionService();
    const launches: LaunchOptions[] = [];
    let closes = 0;
    service.launchBrowser = async (options) => {
      launches.push(options);
      const page = { goto: () => new Promise(() => undefined) };
      return {
        newContext: async () => ({ newPage: async () => page }),
        close: async () => {
          closes++;
        },
      } as unknown as Browser;
    };
    service.totalTimeoutMs = 200;

    await expect(service.extractDesignTokens('http://93.184.215.14/')).rejects.toThrow(GatewayTimeoutException);
    expect(closes).toBe(1);
    expect(launches[0].proxy).toMatchObject({ server: expect.stringMatching(/^http:\/\/127\.0\.0\.1:\d+$/), bypass: '<-loopback>' });

    // The slot was released: the next extraction starts (and is stopped) too
    await expect(service.extractDesignTokens('http://93.184.215.14/')).rejects.toThrow(GatewayTimeoutException);
    await expect(service.extractDesignTokens('http://93.184.215.14/')).rejects.toThrow(GatewayTimeoutException);
    expect(closes).toBe(3);
  });

  it('rejects private addresses before starting a browser', async () => {
    const service = new DesignExtractionService();
    service.launchBrowser = jest.fn();
    await expect(service.extractDesignTokens('http://169.254.169.254/')).rejects.toThrow(/private or internal/);
    expect(service.launchBrowser).not.toHaveBeenCalled();
  });
});

/**
 * Real Chromium: the stub resolver answers 127.0.0.1 (treated as public here)
 * for the early check and the navigation, then an internal address, like a
 * rebinding DNS server. Every later request must be refused.
 */
const describeWithBrowser = existsSync(chromium.executablePath()) ? describe : describe.skip;
describeWithBrowser('DesignExtractionService in Chromium', () => {
  let server: Server;
  let port: number;
  const hits: string[] = [];

  beforeAll(async () => {
    server = createServer((req, res) => {
      hits.push(req.url ?? '');
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!doctype html><html><head><link rel="stylesheet" href="/s.css"></head><body style="color:#123456"><h1>Hi</h1><img src="/a.png"></body></html>');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('refuses requests once the host rebinds to an internal address', async () => {
    let lookups = 0;
    const service = new DesignExtractionService();
    service.egressPolicy = {
      resolve: async () => {
        lookups++;
        return [{ address: lookups <= 2 ? '127.0.0.1' : '10.255.255.1', family: 4 }];
      },
      isAllowedAddress: (address) => address === '127.0.0.1',
    };
    hits.length = 0;
    const result = await service.extractDesignTokens(`http://fixture.test:${port}/`);
    expect(result.url).toBe(`http://fixture.test:${port}/`);
    expect(hits).toEqual(['/']);
    expect(lookups).toBeGreaterThan(2);
  }, 90000);
});
