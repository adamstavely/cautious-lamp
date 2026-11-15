// Pattern pages: the index reads the patterns library (GET /patterns-library/patterns)
// for status instead of hard-coding it; every code pattern shows complete code
// (no "coming soon" fallbacks or `[...]` stubs); guidance pages render their
// Markdown under one hero; and every link on these pages goes to a real page.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PatternCodeSnippet from '../src/views/PatternCodeSnippet.vue';
import PatternDetail from '../src/views/PatternDetail.vue';
import PatternNotifications from '../src/views/PatternNotifications.vue';
import Patterns from '../src/views/Patterns.vue';
import { EXPERIENCE_PATTERNS, PATTERN_GUIDES, experiencePatternForSlug, guideForSlug, relatedCards } from '../src/data/patternGuides.js';
import { FRAMEWORKS, patternSnippets, snippetForSlug } from '../src/data/patternSnippets.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

// jsdom has no scrollingElement; MarkdownViewer's scroll spy measures it
if (!document.scrollingElement) Object.defineProperty(document, 'scrollingElement', { value: document.documentElement, configurable: true });

const root = resolve(__dirname, '..');
const doc = (slug) => resolve(root, `public/docs/patterns/${slug}.md`);

const LIBRARY = [
  {
    id: 'pattern-form-validation',
    name: 'Form Validation',
    description: 'Proper form validation pattern with error states',
    category: 'best-practice',
    status: 'in-progress',
    whenToUse: 'For all form inputs requiring validation',
    codeExample: { good: '<label for="email">Email</label>', bad: '<input type="email" />', description: 'Always include proper labels' },
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  { id: 'pattern-inline-styles', name: 'Inline Styles', description: 'Anti-pattern: inline styles', category: 'anti-pattern', status: 'deprecated' },
];

let api;
let page;
let responses;

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = { 'GET /patterns-library/patterns': LIBRARY };
  api = stubApi(responses);
  vi.stubGlobal('fetch', async (url) => {
    const slug = String(url).match(/^\/docs\/patterns\/([a-z-]+)\.md$/)?.[1];
    const body = slug && existsSync(doc(slug)) ? readFileSync(doc(slug), 'utf8') : undefined;
    return { ok: !!body, status: body ? 200 : 404, statusText: body ? 'OK' : 'Not Found', headers: { get: () => null }, text: async () => body ?? '' };
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  api.restore();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const open = async (view, path, routes = []) => {
  page = await mountView(view, { path, routes });
  await flush();
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const hrefs = () => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));

describe('Patterns index', () => {
  it('lists the patterns library with each pattern’s real status', async () => {
    await open(Patterns, '/patterns');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(api.calls.map((c) => c.key)).toContain('GET /patterns-library/patterns');
    const body = text();
    expect(body).toContain('Inline Styles');
    expect(body).toContain('Deprecated');
    // The Form validation code pattern carries the library's status, not a hard-coded one
    expect(body).toContain('In progress');
    expect(body).not.toContain('Production Ready');
    // Library patterns link to a page only when they have one
    expect(hrefs()).toContain('/patterns/form-validation');
    expect(hrefs()).not.toContain('/patterns/inline-styles');
    for (const guide of PATTERN_GUIDES) expect(hrefs()).toContain(guide.to);
    for (const pattern of EXPERIENCE_PATTERNS) expect(hrefs()).toContain(pattern.to);
  });

  it('says so when the library cannot be loaded', async () => {
    responses['GET /patterns-library/patterns'] = fail(500, 'Elasticsearch is unavailable');
    await open(Patterns, '/patterns');
    expect(document.querySelector('[role="alert"]').textContent).toContain('Elasticsearch is unavailable');
  });
});

describe('Experience pattern pages', () => {
  it('render the guidance document under a single hero', async () => {
    await open(Patterns, '/guidelines/patterns/error-handling');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1').textContent).toBe('Error handling');
    expect(text()).toContain('What a good error says');
  });

  it('send a code pattern or guide under /guidelines/patterns to its own page', async () => {
    await open(Patterns, '/guidelines/patterns/forms');
    expect(page.router.currentRoute.value.path).toBe('/patterns/forms');
  });

  it('show "not found" for an unknown pattern', async () => {
    await open(Patterns, '/patterns/no-such-pattern');
    expect(text()).toContain("There's no pattern at this address");
  });
});

describe('Pattern guides', () => {
  it('show the guide document and related pages, without made-up versions or status', async () => {
    await open(PatternDetail, '/patterns/forms');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(text()).toContain('Input fields');
    expect(hrefs()).toContain('/patterns/form-validation');
    expect(text()).not.toMatch(/v1\.0\.0|Production Ready|Jan 10, 2024/);
  });
});

describe('Code pattern pages', () => {
  it('show the code, and the library status and do/don’t code when the library has the pattern', async () => {
    await open(PatternCodeSnippet, '/patterns/form-validation');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(document.querySelector('pre').textContent).toContain('aria-describedby');
    expect(text()).toContain('In the patterns library');
    expect(text()).toContain('In progress');
    expect(text()).toContain('Always include proper labels');
    expect(text()).not.toMatch(/coming soon|Production Ready|v1\.0\.0/i);
  });

  it('switch frameworks', async () => {
    await open(PatternCodeSnippet, '/patterns/sortable-data-table');
    page.state.framework = 'react';
    await flush();
    expect(document.querySelector('pre').textContent).toContain('useMemo');
  });

  it('leave the library section out when the library has no such pattern', async () => {
    await open(PatternCodeSnippet, '/patterns/login-form');
    expect(text()).not.toContain('In the patterns library');
    expect(text()).toContain('autocomplete="current-password"');
  });
});

describe('Notification decision helper', () => {
  it('walks the decision tree to a recommendation and drops later answers when an earlier one changes', async () => {
    await open(PatternNotifications, '/patterns/notifications');
    page.state.choose(0, 'no'); // no action needed
    page.state.choose(1, 'no'); // not a status update
    page.state.choose(2, 'yes'); // an alert
    page.state.choose(3, 'no'); // can't be dismissed
    expect(page.state.outcome.id).toBe('banner');
    page.state.choose(0, 'yes');
    expect(page.state.steps).toHaveLength(2);
    expect(page.state.outcome).toBeNull();
    page.state.choose(1, 'yes');
    expect(page.state.outcome.id).toBe('modal');
  });
});

describe('Pattern content', () => {
  it('has complete code in every framework for every code pattern', () => {
    for (const snippet of patternSnippets) {
      for (const { value } of FRAMEWORKS) {
        const code = snippet.code[value];
        expect(code, `${snippet.slug} ${value}`).toBeTruthy();
        expect(code, `${snippet.slug} ${value}`).not.toMatch(/\[\.\.\.\]|coming soon|TODO|\/\/ (API call|Sort logic|Add validation|Trap focus|Authentication logic|Filter, sort)/i);
      }
      expect(snippet.usageExamples.length, snippet.slug).toBeGreaterThan(0);
      for (const example of snippet.usageExamples) expect(example.code).not.toMatch(/\[\.\.\.\]|logic here/i);
      expect(snippet.accessibility.length, snippet.slug).toBeGreaterThan(0);
    }
  });

  it('has a document with no h1 or leftover hero markup for every guide and experience pattern', () => {
    for (const { slug } of [...PATTERN_GUIDES.filter((g) => g.slug !== 'notifications'), ...EXPERIENCE_PATTERNS]) {
      const markdown = readFileSync(doc(slug), 'utf8');
      expect(markdown, slug).not.toMatch(/^# /m);
      expect(markdown, slug).not.toContain('class=');
    }
  });

  it('links only to pages that exist', () => {
    const routes = [...readFileSync(resolve(root, 'src/main.js'), 'utf8').matchAll(/path: '([^']+)'/g)].map((m) => m[1]).filter((p) => !p.includes(':'));
    const isRealPage = (to) => {
      const patternSlug = to.match(/^\/(?:guidelines\/)?patterns\/([a-z-]+)$/)?.[1];
      if (patternSlug) return patternSlug === 'status' || !!(guideForSlug(patternSlug) || snippetForSlug(patternSlug) || experiencePatternForSlug(patternSlug));
      const guideline = to.match(/^\/guidelines\/([a-z-]+)$/)?.[1];
      if (guideline) return existsSync(resolve(root, `public/docs/guidelines/${guideline}.md`));
      return routes.includes(to);
    };
    const links = [
      ...PATTERN_GUIDES.flatMap((g) => [g.to, ...relatedCards(g.related).map((c) => c.to)]),
      ...EXPERIENCE_PATTERNS.map((p) => p.to),
      ...patternSnippets.flatMap((s) => s.related.map((r) => r.to)),
    ];
    for (const to of links) expect(isRealPage(to), to).toBe(true);
    expect(links).not.toContain('/components/cards');
  });
});
