import { GatewayTimeoutException, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { existsSync } from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import type { Browser, LaunchOptions } from 'playwright';
import { EgressProxy, chromiumEgressOptions, startEgressProxy } from '../common/security/egress-proxy';
import { DestinationPolicy, assertPublicHttpUrl } from '../common/security/url-safety';
import { Semaphore, withDeadline } from '../governance/semaphore';

/** WCAG 2.x level A and AA rules; reports are measured against these */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor' | null;

export interface AxeNode {
  target: string;
  html: string;
  failureSummary?: string;
}

export interface AxeRuleResult {
  id: string;
  impact: AxeImpact;
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  /** Example elements, at most MAX_NODES_PER_RULE of them (see nodeCount) */
  nodes: AxeNode[];
  /** How many elements axe reported for this rule; counts and scores use this, not nodes.length */
  nodeCount: number;
}

export interface AxeOutcome {
  engine: 'jsdom' | 'playwright';
  /** The page that was scanned, after redirects (URL scans only) */
  url?: string;
  violations: AxeRuleResult[];
  /** Rules that passed (nodes omitted) */
  passes: AxeRuleResult[];
  /** Rules axe could not decide (e.g. colour contrast without layout); need manual review */
  incomplete: AxeRuleResult[];
}

/** Example elements kept per rule; the full count is kept in nodeCount */
export const MAX_NODES_PER_RULE = 50;

/** axe-core's browser bundle, injected into the page or jsdom window */
const AXE_SOURCE: string = require('axe-core').source;

export function normalize(results: any[], keepNodes: boolean): AxeRuleResult[] {
  return (results ?? []).map((rule) => ({
    id: String(rule.id),
    impact: (rule.impact ?? null) as AxeImpact,
    help: String(rule.help ?? ''),
    description: String(rule.description ?? ''),
    helpUrl: String(rule.helpUrl ?? ''),
    tags: Array.isArray(rule.tags) ? rule.tags.map(String) : [],
    nodes: keepNodes
      ? (rule.nodes ?? []).slice(0, MAX_NODES_PER_RULE).map((node: any) => ({
          target: Array.isArray(node.target) ? node.target.map(String).join(' ') : String(node.target ?? ''),
          html: String(node.html ?? '').slice(0, 300),
          failureSummary: node.failureSummary ? String(node.failureSummary).slice(0, 500) : undefined,
        }))
      : [],
    nodeCount: Array.isArray(rule.nodes) ? rule.nodes.length : 0,
  }));
}

const htmlSlots = new Semaphore(Number(process.env.A11Y_HTML_SCAN_CONCURRENCY) || 2);
const urlSlots = new Semaphore(Number(process.env.A11Y_URL_SCAN_CONCURRENCY) || 2, 10);

/**
 * Runs axe-core over an HTML string in jsdom. The document's own scripts never
 * run (`runScripts: 'outside-only'` only lets us load axe itself) and no
 * resources are fetched. jsdom has no layout, so checks that need rendering
 * (colour contrast, for one) come back as `incomplete`.
 */
export function runAxeOnHtml(html: string): Promise<AxeOutcome> {
  return htmlSlots.run(async () => {
    const dom = new JSDOM(html, {
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      // Silent: jsdom reports unimplemented APIs (canvas) that axe probes
      virtualConsole: new VirtualConsole(),
    });
    try {
      dom.window.eval(AXE_SOURCE);
      const results = await (dom.window as any).axe.run(dom.window.document, {
        runOnly: { type: 'tag', values: WCAG_TAGS },
        resultTypes: ['violations', 'incomplete'],
      });
      return {
        engine: 'jsdom' as const,
        violations: normalize(results.violations, true),
        passes: normalize(results.passes, false),
        incomplete: normalize(results.incomplete, true),
      };
    } finally {
      dom.window.close();
    }
  });
}

/** Whether Playwright's Chromium is installed (CI has no browser install step) */
export function isBrowserInstalled(): boolean {
  try {
    // Loaded lazily so the module works where Playwright has no browsers
    const { chromium } = require('playwright') as typeof import('playwright');
    return existsSync(chromium.executablePath());
  } catch {
    return false;
  }
}

export interface UrlScanOptions {
  /** Navigation timeout */
  timeoutMs?: number;
  /** Limit on the whole scan (browser start, navigation and axe); the browser is closed when it passes */
  totalTimeoutMs?: number;
  /** Tests only: allow a local fixture server. Never set from a request. */
  allowPrivateAddressesForTests?: boolean;
  /** Tests only: a stub resolver / address rule for the egress checks */
  egressPolicyForTests?: DestinationPolicy;
  /** Tests only: stands in for chromium.launch */
  launchBrowserForTests?: (options: LaunchOptions) => Promise<Browser>;
}

const DEFAULT_TOTAL_TIMEOUT_MS = Number(process.env.A11Y_URL_SCAN_DEADLINE_MS) || 90_000;

/**
 * Loads a public URL in headless Chromium and runs axe-core on the rendered
 * page. All of Chromium's traffic goes through a local egress proxy that
 * resolves each host itself and only connects to the public address it
 * checked, so redirects, subresources and DNS rebinding can't reach internal
 * addresses. The whole scan has a deadline that closes the browser, so a page
 * that never settles can't hold a scan slot. A page that answers with an HTTP
 * error is a failed scan, not a report. At most a couple run at once.
 */
export async function runAxeOnUrl(rawUrl: string, options: UrlScanOptions = {}): Promise<AxeOutcome> {
  const policy = options.egressPolicyForTests;
  const target = options.allowPrivateAddressesForTests ? new URL(rawUrl) : await assertPublicHttpUrl(rawUrl, policy);
  const launch = options.launchBrowserForTests ?? ((launchOptions: LaunchOptions) => (require('playwright') as typeof import('playwright')).chromium.launch(launchOptions));
  if (!options.launchBrowserForTests && !isBrowserInstalled()) {
    throw new ServiceUnavailableException('URL scans need a browser (run `npx playwright install chromium`); supply HTML instead');
  }
  const timeout = options.timeoutMs ?? 30000;
  const totalTimeout = options.totalTimeoutMs ?? Math.max(DEFAULT_TOTAL_TIMEOUT_MS, timeout + 10_000);

  return urlSlots.run(() => {
    let browser: Browser | null = null;
    let proxy: EgressProxy | null = null;
    let stopped = false;
    // Runs at the deadline and again when the scan ends; closes each thing once
    const stop = async () => {
      stopped = true;
      const [openBrowser, openProxy] = [browser, proxy];
      browser = null;
      proxy = null;
      await openBrowser?.close().catch(() => undefined);
      await openProxy?.close().catch(() => undefined);
    };

    const scan = async (): Promise<AxeOutcome> => {
      const guarded = !options.allowPrivateAddressesForTests;
      if (guarded) proxy = await startEgressProxy(policy);
      const launched = await launch({ headless: true, ...(proxy ? chromiumEgressOptions(proxy) : {}) });
      browser = launched;
      // The deadline passed while the browser was starting
      if (stopped) {
        await launched.close().catch(() => undefined);
        throw new GatewayTimeoutException('The scan was stopped');
      }
      // bypassCSP so a page's CSP can't block the injected axe script
      const context = await launched.newContext({ bypassCSP: true, serviceWorkers: 'block', acceptDownloads: false });
      const page = await context.newPage();
      page.setDefaultTimeout(timeout);
      const response = await page.goto(target.toString(), { waitUntil: 'load', timeout });
      if (!response) throw new ServiceUnavailableException('The page did not load');
      const status = response.status();
      if (status < 200 || status >= 400) {
        throw new UnprocessableEntityException(`Target unavailable: ${new URL(response.url()).host} answered HTTP ${status}, so there is nothing to audit (no report was created)`);
      }
      await page.addScriptTag({ content: AXE_SOURCE });
      const results = await page.evaluate(
        (tags) => (window as any).axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] }),
        WCAG_TAGS,
      );
      return {
        engine: 'playwright' as const,
        url: page.url(),
        violations: normalize(results.violations, true),
        passes: normalize(results.passes, false),
        incomplete: normalize(results.incomplete, true),
      };
    };

    return withDeadline(
      totalTimeout,
      () => scan().finally(stop),
      stop,
      () => new GatewayTimeoutException(`The scan took longer than ${Math.round(totalTimeout / 1000)}s and was stopped`),
    );
  });
}
