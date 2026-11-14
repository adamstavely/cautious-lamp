import { GatewayTimeoutException, UnprocessableEntityException } from '@nestjs/common';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import type { Browser } from 'playwright';
import { HostResolver } from '../common/security/url-safety';
import { MAX_NODES_PER_RULE, isBrowserInstalled, normalize, runAxeOnUrl } from './axe-engine';
import { buildReport } from './report-builder';

const PUBLIC_URL = 'http://93.184.215.14/';

/** axe's raw shape for one failing rule with `count` elements */
const axeRule = (count: number) => ({
  id: 'image-alt',
  impact: 'critical',
  help: 'Images must have alternate text',
  description: 'Ensures <img> elements have alternate text',
  helpUrl: 'https://dequeuniversity.com/rules/axe/image-alt',
  tags: ['wcag2a', 'wcag111'],
  nodes: Array.from({ length: count }, (_, i) => ({ target: [`img:nth-child(${i + 1})`], html: `<img src="${i}.png">`, failureSummary: 'Fix it' })),
});

interface FakePage {
  status?: number;
  evaluate?: () => Promise<unknown>;
}

/** A stand-in for chromium.launch whose page behaves as told */
function fakeLaunch(behaviour: FakePage) {
  const closes = { count: 0 };
  const launch = jest.fn(async () => {
    const page = {
      setDefaultTimeout: () => undefined,
      goto: async () => ({ status: () => behaviour.status ?? 200, url: () => PUBLIC_URL }),
      addScriptTag: async () => undefined,
      evaluate: behaviour.evaluate ?? (async () => ({ violations: [], passes: [], incomplete: [] })),
      url: () => PUBLIC_URL,
    };
    const browser = {
      newContext: async () => ({ newPage: async () => page }),
      close: async () => {
        closes.count++;
      },
    };
    return browser as unknown as Browser;
  });
  return { launch, closes };
}

describe('axe URL scans', () => {
  it('stops a scan whose evaluate never returns, closes the browser and frees the slot', async () => {
    const hanging = fakeLaunch({ evaluate: () => new Promise(() => undefined) });
    const started = Date.now();
    // Three at once with two slots: the third only starts once a hung scan is stopped
    const results = await Promise.allSettled(
      [1, 2, 3].map(() => runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: hanging.launch, totalTimeoutMs: 200 })),
    );
    expect(results.every((r) => r.status === 'rejected' && r.reason instanceof GatewayTimeoutException)).toBe(true);
    expect(hanging.closes.count).toBe(3);
    expect(Date.now() - started).toBeLessThan(5000);

    // The slots are free again: a normal scan runs
    const healthy = fakeLaunch({ evaluate: async () => ({ violations: [], passes: [], incomplete: [] }) });
    await expect(runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: healthy.launch, totalTimeoutMs: 2000 })).resolves.toMatchObject({ engine: 'playwright' });
    expect(healthy.closes.count).toBe(1);
  });

  it('treats an HTTP error page as an unavailable target, not a report', async () => {
    const notFound = fakeLaunch({ status: 404 });
    await expect(runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: notFound.launch })).rejects.toThrow(UnprocessableEntityException);
    await expect(runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: notFound.launch })).rejects.toThrow(/HTTP 404/);
    expect(notFound.closes.count).toBe(2);
    const serverError = fakeLaunch({ status: 500 });
    await expect(runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: serverError.launch })).rejects.toThrow(/HTTP 500/);
  });

  it('keeps the full element count when examples are capped (60 nodes)', async () => {
    const big = fakeLaunch({ evaluate: async () => ({ violations: [axeRule(60)], passes: [], incomplete: [] }) });
    const outcome = await runAxeOnUrl(PUBLIC_URL, { launchBrowserForTests: big.launch });
    expect(outcome.violations[0].nodes).toHaveLength(MAX_NODES_PER_RULE);
    expect(outcome.violations[0].nodeCount).toBe(60);

    const report = buildReport(outcome, { id: 'r', applicationId: 'a', applicationName: 'A', generatedAt: new Date(), source: 'url', createdBy: 't' });
    expect(report.totalIssues).toBe(60);
    expect(report.criticalIssues).toBe(60);
    expect(report.issuesByCategory.altText).toBe(60);
    expect(report.wcagCriteria['1.1.1']).toMatchObject({ issues: 60, status: 'fail' });
    expect(report.wcagCriteria['1.1.1'].failingElements).toHaveLength(MAX_NODES_PER_RULE);
    expect(report.prioritizedFixes[0].affectedElements).toBe(60);
    expect(report.checks).toHaveLength(MAX_NODES_PER_RULE);
    expect(report.sampling).toEqual({ examplesPerRule: MAX_NODES_PER_RULE, rules: [{ ruleId: 'image-alt', shown: 50, total: 60 }] });
  });

  it('does not flag sampling when every element is listed', () => {
    const [rule] = normalize([axeRule(3)], true);
    expect(rule).toMatchObject({ nodeCount: 3 });
    const report = buildReport(
      { engine: 'jsdom', violations: [rule], passes: [], incomplete: [] },
      { id: 'r', applicationId: 'a', applicationName: 'A', generatedAt: new Date(), source: 'html', createdBy: 't' },
    );
    expect(report.totalIssues).toBe(3);
    expect(report.sampling).toBeUndefined();
  });
});

/**
 * Real Chromium through the egress proxy. The fixture listens on 127.0.0.1,
 * so the stub policy treats 127.0.0.1 as the "public" address, and the stub
 * resolver for fixture.test answers 127.0.0.1 for the first two lookups (the
 * early check and the navigation) and an internal address after that, the way
 * a rebinding DNS server would. Only runs where Chromium is installed.
 */
const describeWithBrowser = isBrowserInstalled() ? describe : describe.skip;
describeWithBrowser('axe URL scans in Chromium', () => {
  let server: Server;
  let port: number;
  const hits: string[] = [];

  beforeAll(async () => {
    server = createServer((req, res) => {
      hits.push(req.url ?? '');
      if (req.url === '/missing') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<!doctype html><html lang="en"><head><title>Not found</title></head><body><main><h1>Not found</h1></main></body></html>');
        return;
      }
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!doctype html><html lang="en"><head><title>Page</title></head><body><main><h1>Hi</h1><img src="/a.png" alt="a"><script src="/b.js"></script></main></body></html>');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('loads the page and its subresources through the proxy', async () => {
    hits.length = 0;
    await runAxeOnUrl(`http://fixture.test:${port}/`, {
      egressPolicyForTests: { resolve: async () => [{ address: '127.0.0.1', family: 4 }], isAllowedAddress: (address) => address === '127.0.0.1' },
      timeoutMs: 20000,
    });
    expect(hits).toEqual(expect.arrayContaining(['/', '/a.png', '/b.js']));
  }, 60000);

  it('checks the resolved address of every request, so a rebinding host is cut off', async () => {
    let lookups = 0;
    const resolve: HostResolver = async () => {
      lookups++;
      return [{ address: lookups <= 2 ? '127.0.0.1' : '10.255.255.1', family: 4 }];
    };
    hits.length = 0;
    const outcome = await runAxeOnUrl(`http://fixture.test:${port}/`, {
      egressPolicyForTests: { resolve, isAllowedAddress: (address) => address === '127.0.0.1' },
      timeoutMs: 20000,
    });
    expect(outcome.engine).toBe('playwright');
    expect(hits).toEqual(['/']);
    expect(lookups).toBeGreaterThan(2);
  }, 60000);

  it('fails a scan of a 404 page instead of reporting on it', async () => {
    await expect(runAxeOnUrl(`http://127.0.0.1:${port}/missing`, { allowPrivateAddressesForTests: true, timeoutMs: 20000 })).rejects.toThrow(/HTTP 404/);
  }, 60000);
});
