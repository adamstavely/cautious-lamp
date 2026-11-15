// The research, HCD, AI, audience landing and not-found pages: every link
// goes to a route that exists, every spot illustration is a real Trench Coat
// spot, each law of UX has its own spot, an unknown law says so instead of
// loading forever, and the breadcrumbs only link to pages that exist.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lawsOfUX, lawsOfUXData } from '../src/data/lawsOfUX.js';
import AI from '../src/views/AI.vue';
import ForDesigners from '../src/views/ForDesigners.vue';
import ForDevelopers from '../src/views/ForDevelopers.vue';
import ForResearchers from '../src/views/ForResearchers.vue';
import HcdHub from '../src/views/HcdHub.vue';
import LawDetail from '../src/views/LawDetail.vue';
import LawsOfUX from '../src/views/LawsOfUX.vue';
import NotFound from '../src/views/NotFound.vue';
import ResearchRepo from '../src/views/ResearchRepo.vue';
import Breadcrumbs from '../src/components/Breadcrumbs.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const root = resolve(__dirname, '..');
const spotExists = (name) => existsSync(resolve(root, `src/assets/illustrations/spot/${name}.svg`));

// The app's route table, read from main.js so the test follows it
const CATCH_ALL = '/:pathMatch(.*)*';
const appPaths = [...readFileSync(resolve(root, 'src/main.js'), 'utf8').matchAll(/path: '([^']+)'/g)].map((m) => m[1]);
const appRouter = createRouter({
  history: createMemoryHistory(),
  routes: [...new Set(appPaths)].map((path) => ({ path, component: { render: () => null } })),
});
const isRoute = (href) => appRouter.resolve(href).matched[0]?.path !== CATCH_ALL;

const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

let page;
afterEach(() => {
  page?.unmount();
  page = null;
});

const pages = {
  '/research': ResearchRepo,
  '/hcd': HcdHub,
  '/hcd/laws-of-ux': LawsOfUX,
  '/hcd/laws-of-ux/hick-law': LawDetail,
  '/for-designers': ForDesigners,
  '/for-developers': ForDevelopers,
  '/for-researchers': ForResearchers,
  '/ai': AI,
  '/no-such-page': NotFound,
};

describe('research, HCD, AI and landing pages', () => {
  it('has a route for /hcd now that breadcrumbs link to it', () => {
    expect(isRoute('/hcd')).toBe(true);
  });

  it.each(Object.entries(pages))('%s links only to routes that exist, and has one h1', async (path, view) => {
    page = await mountView(view, { path, routes: [{ path: '/hcd/laws-of-ux/:id', component: LawDetail }] });
    await flush();
    const el = page.vm.$el.parentElement;
    const hrefs = [...el.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h.startsWith('/'));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((h) => !isRoute(h))).toEqual([]);
    expect(el.querySelectorAll('h1')).toHaveLength(1);
  });

  it('names only spot illustrations that exist', () => {
    const files = ['AI', 'ForDesigners', 'ForDevelopers', 'ForResearchers', 'HcdHub', 'LawDetail', 'LawsOfUX', 'NotFound', 'ResearchRepo'];
    const names = files.flatMap((f) => {
      const source = readFileSync(resolve(root, `src/views/${f}.vue`), 'utf8');
      return [...source.matchAll(/spot(?:=|: )["'`]([a-z]+\/[a-z0-9-]+)["'`]/g)].map((m) => m[1]);
    });
    expect(names.length).toBeGreaterThan(40);
    expect(names.filter((n) => !spotExists(n))).toEqual([]);
    // The AI guideline rows build theirs from the slug
    const ai = readFileSync(resolve(root, 'src/views/AI.vue'), 'utf8');
    const slugs = [...ai.matchAll(/\['([a-z-]+)', '[^']+'\]/g)].map((m) => m[1]);
    expect(slugs).toHaveLength(11);
    expect(slugs.filter((s) => !spotExists(`ai/${s}`))).toEqual([]);
  });
});

describe('laws of UX', () => {
  it('gives each of the 30 laws its own Trench Coat spot', () => {
    expect(lawsOfUX).toHaveLength(30);
    for (const [key, law] of Object.entries(lawsOfUXData)) {
      expect(law.id).toBe(key);
      expect(law.spot).toMatch(/^laws\//);
      expect(spotExists(law.spot)).toBe(true);
      expect(law).not.toHaveProperty('icon');
    }
    expect(new Set(lawsOfUX.map((l) => l.spot)).size).toBe(30);
  });

  it('lists every law on the index page', async () => {
    page = await mountView(LawsOfUX, { path: '/hcd/laws-of-ux' });
    await flush();
    const el = page.vm.$el.parentElement;
    const links = [...el.querySelectorAll('a[href^="/hcd/laws-of-ux/"]')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(lawsOfUX.map((l) => `/hcd/laws-of-ux/${l.id}`));
    expect(el.innerHTML).not.toContain('linearGradient');
  });

  it("shows a law's content and names its breadcrumb", async () => {
    page = await mountView(LawDetail, { path: '/hcd/laws-of-ux/hick-law', routes: [{ path: '/hcd/laws-of-ux/:id', component: LawDetail }] });
    await flush();
    const el = page.vm.$el.parentElement;
    expect(el.querySelector('h1').textContent).toBe(lawsOfUXData['hick-law'].name);
    expect(el.textContent).toContain(lawsOfUXData['hick-law'].content.overview);
    expect(el.querySelector('[aria-current="page"]').textContent.trim()).toBe(lawsOfUXData['hick-law'].name);
  });

  it('says an unknown law does not exist rather than loading forever', async () => {
    page = await mountView(LawDetail, { path: '/hcd/laws-of-ux/nope', routes: [{ path: '/hcd/laws-of-ux/:id', component: LawDetail }] });
    await flush();
    const el = page.vm.$el.parentElement;
    expect(el.querySelector('h1').textContent).toBe('Law not found');
    expect(el.textContent).not.toMatch(/loading/i);
  });
});

describe('not found page', () => {
  it('shows the missing address and its search button focuses the top bar search', async () => {
    const search = document.createElement('input');
    search.setAttribute('aria-label', 'Search design system');
    document.body.appendChild(search);
    page = await mountView(NotFound, { path: '/missing/page' });
    await flush();
    const el = page.vm.$el.parentElement;
    expect(el.textContent).toContain('/missing/page');
    const button = [...el.querySelectorAll('button')].find((b) => b.textContent.includes('Search the design system'));
    button.click();
    expect(document.activeElement).toBe(search);
    search.remove();
  });
});

describe('breadcrumbs', () => {
  // The crumbs Breadcrumbs builds for a path: [label, path it links to]
  const crumbsFor = async (path) => {
    page = await mountView(Breadcrumbs, { path });
    await flush();
    return page.state.crumbs.map((c) => [c.label, c.path]);
  };

  it('links HCD pages to the HCD hub, which is a real page', async () => {
    expect(await crumbsFor('/hcd/laws-of-ux')).toEqual([
      ['HCD', '/hcd'],
      ['Laws of UX', null],
    ]);
  });

  it('does not link to a references index that does not exist', async () => {
    expect(await crumbsFor('/tools/references/jaws-commands')).toEqual([
      ['Tools', '/tools'],
      ['References', null],
      ['Jaws Commands', null],
    ]);
  });

  it('calls the research repository Research', async () => {
    expect(await crumbsFor('/research/insights')).toEqual([
      ['Research', '/research'],
      ['Insights', null],
    ]);
  });

  it('only links crumbs to routes that exist', async () => {
    for (const path of ['/hcd/principles', '/hcd/session-replay', '/research/journey-maps', '/ai/patterns', '/for-designers']) {
      const crumbs = await crumbsFor(path);
      expect(crumbs.filter(([, to]) => to && !isRoute(to))).toEqual([]);
      page.unmount();
      page = null;
    }
  });
});
