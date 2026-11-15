// Guidance pages (here HCD principles): the hero is the page's only h1, the
// Markdown document comes from public/docs and is rendered by MarkdownViewer,
// same-site links inside it open with the router, and a missing document shows
// an error rather than a placeholder. The shipped document is real content.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HcdPrinciples from '../src/views/HcdPrinciples.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

// jsdom has no scrollingElement; MarkdownViewer's scroll spy measures it
if (!document.scrollingElement) Object.defineProperty(document, 'scrollingElement', { value: document.documentElement, configurable: true });

const DOC = readFileSync(resolve(__dirname, '../public/docs/hcd/principles.md'), 'utf8');

let documents;
let page;

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  documents = { '/docs/hcd/principles.md': DOC };
  vi.stubGlobal('fetch', async (url) => {
    const body = documents[url];
    return {
      ok: body !== undefined,
      status: body === undefined ? 404 : 200,
      statusText: body === undefined ? 'Not Found' : 'OK',
      headers: { get: () => null },
      text: async () => body ?? '',
    };
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const open = async () => {
  page = await mountView(HcdPrinciples, { path: '/hcd/principles' });
  await flush();
};

describe('HCD principles', () => {
  it('renders the document under the hero, with one h1', async () => {
    await open();
    const h1s = document.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toContain('HCD principles');
    const headings = [...document.querySelectorAll('.md-prose h2, .md-prose h3')].map((h) => h.textContent);
    expect(headings).toEqual(expect.arrayContaining(['The principles', '1. Understand people, their tasks and their context', '6. Bring different skills and perspectives to the team']));
    expect(document.body.textContent).not.toMatch(/coming soon/i);
    // The table of contents lists the document's sections
    expect([...document.querySelectorAll('.md-toc-link')].map((a) => a.textContent.trim())).toContain('How the principles connect to policy');
  });

  it('opens same-site links with the router', async () => {
    await open();
    const link = [...document.querySelectorAll('.md-prose a')].find((a) => a.getAttribute('href') === '/hcd/process');
    expect(link).toBeTruthy();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(click);
    await flush();
    expect(click.defaultPrevented).toBe(true);
    await new Promise((r) => setTimeout(r, 50));
    expect(page.router.currentRoute.value.path).toBe('/hcd/process');
  });

  it('shows an error, not a placeholder, when the document is missing', async () => {
    delete documents['/docs/hcd/principles.md'];
    await open();
    expect(document.body.textContent).toContain("This page didn't load");
  });

  it('ships substantive guidance for every HCD and AI guidance page', () => {
    for (const path of ['hcd/principles', 'hcd/research', 'hcd/accessibility', 'hcd/process', 'hcd/recruiting-users', 'hcd/conducting-interviews', 'hcd/research-reports', 'hcd/research-methods', 'hcd/council', 'ai/patterns', 'ai/components']) {
      const doc = readFileSync(resolve(__dirname, `../public/docs/${path}.md`), 'utf8');
      expect(doc, path).not.toMatch(/coming soon/i);
      expect(doc.match(/^## /gm)?.length ?? 0, path).toBeGreaterThanOrEqual(4);
      // The page's hero is its h1; documents start at h2
      expect(doc, path).not.toMatch(/^# /m);
    }
  });
});
