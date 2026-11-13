import { ServiceUnavailableException } from '@nestjs/common';
import { existsSync } from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import type { Browser } from 'playwright';
import { assertPublicHttpUrl } from '../common/security/url-safety';
import { Semaphore } from '../governance/semaphore';

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
  nodes: AxeNode[];
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

const MAX_NODES_PER_RULE = 50;

/** axe-core's browser bundle, injected into the page or jsdom window */
const AXE_SOURCE: string = require('axe-core').source;

function normalize(results: any[], keepNodes: boolean): AxeRuleResult[] {
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
  timeoutMs?: number;
  /** Tests only: allow a local fixture server. Never set from a request. */
  allowPrivateAddressesForTests?: boolean;
}

/**
 * Loads a public URL in headless Chromium and runs axe-core on the rendered
 * page. Every request the page makes (redirects, subresources) is checked
 * against the public-address rules too. At most a couple run at once.
 */
export async function runAxeOnUrl(rawUrl: string, options: UrlScanOptions = {}): Promise<AxeOutcome> {
  const target = options.allowPrivateAddressesForTests ? new URL(rawUrl) : await assertPublicHttpUrl(rawUrl);
  if (!isBrowserInstalled()) {
    throw new ServiceUnavailableException('URL scans need a browser (run `npx playwright install chromium`); supply HTML instead');
  }
  const timeout = options.timeoutMs ?? 30000;

  return urlSlots.run(async () => {
    const { chromium } = require('playwright') as typeof import('playwright');
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      // bypassCSP so a page's CSP can't block the injected axe script
      const context = await browser.newContext({ bypassCSP: true, serviceWorkers: 'block', acceptDownloads: false });
      if (!options.allowPrivateAddressesForTests) {
        const checkedHosts = new Map<string, boolean>();
        await context.route('**/*', async (route) => {
          const requestUrl = route.request().url();
          if (requestUrl.startsWith('data:') || requestUrl.startsWith('blob:')) return route.continue();
          let host: string;
          try {
            host = new URL(requestUrl).host;
          } catch {
            return route.abort('blockedbyclient');
          }
          if (!checkedHosts.has(host)) {
            checkedHosts.set(host, await assertPublicHttpUrl(requestUrl).then(() => true, () => false));
          }
          return checkedHosts.get(host) ? route.continue() : route.abort('blockedbyclient');
        });
      }
      const page = await context.newPage();
      page.setDefaultTimeout(timeout);
      const response = await page.goto(target.toString(), { waitUntil: 'load', timeout });
      if (!response) throw new ServiceUnavailableException('The page did not load');
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
    } finally {
      await browser?.close().catch(() => undefined);
    }
  });
}
