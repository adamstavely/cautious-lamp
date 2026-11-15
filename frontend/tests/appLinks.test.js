// Links in the app shell and index pages go to real pages: the top-nav search
// index (generated from the router), the docs drawer, and the Components and
// Guidelines index pages. Breadcrumbs spell acronyms in route slugs correctly.
import { describe, expect, it } from 'vitest';
import { PAGES, buildSearchIndex } from '../src/router/searchIndex.js';
import { slugLabel } from '../src/utils/slugLabel.js';
import { appRouter, brokenLinkReason, readSource } from './helpers/appRoutes.js';

const router = appRouter();
const broken = (links) => links.map((link) => [link, brokenLinkReason(router, link)]).filter(([, reason]) => reason);
const linksIn = (file, pattern) => [...readSource(file).matchAll(pattern)].map((m) => m[1]);

describe('top-nav search index', () => {
  const index = buildSearchIndex(router);

  it('lists only pages that exist', () => {
    expect(broken(index.map((entry) => entry.path))).toEqual([]);
  });

  it('describes only pages that exist, so the descriptions cannot drift', () => {
    expect(broken(Object.keys(PAGES))).toEqual([]);
  });

  it('includes every static route, titled', () => {
    const paths = index.map((entry) => entry.path);
    expect(paths).toEqual(expect.arrayContaining(['/components/composition', '/design-assets/icons', '/guidelines', '/guidelines/colors', '/guidelines/time']));
    expect(index.every((entry) => entry.title && entry.category && entry.icon)).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('leaves out sign-in screens, redirects and parameterised routes', () => {
    const paths = index.map((entry) => entry.path);
    for (const path of ['/login', '/change-password', '/search', '/components/feedback', '/review/:id', '/font/:fontName']) {
      expect(paths).not.toContain(path);
    }
  });

  it('drops a described page once its route is gone', () => {
    const real = appRouter();
    const without = {
      getRoutes: () => real.getRoutes().filter((r) => r.path !== '/components/composition'),
      resolve: (p) => (p === '/components/composition' ? { matched: [] } : real.resolve(p)),
    };
    expect(PAGES['/components/composition']).toBeDefined();
    expect(buildSearchIndex(without).map((e) => e.path)).not.toContain('/components/composition');
  });
});

describe('docs drawer', () => {
  it('links only to pages that exist', () => {
    const links = linksIn('src/components/DocumentationDrawer.vue', /link: '([^']+)'/g);
    expect(links.length).toBeGreaterThan(100);
    expect(broken(links)).toEqual([]);
  });
});

describe('index pages', () => {
  it.each(['src/views/Components.vue', 'src/views/Guidelines.vue'])('%s links only to pages that exist', (file) => {
    const links = linksIn(file, /to: '([^']+)'/g);
    expect(links.length).toBeGreaterThan(4);
    expect(broken(links)).toEqual([]);
    expect(readSource(file)).not.toMatch(/href="#"/);
  });
});

describe('breadcrumb labels', () => {
  it('spells acronyms in slugs in capitals', () => {
    expect(slugLabel('jaws-commands')).toBe('JAWS Commands');
    expect(slugLabel('nasa-tlx')).toBe('NASA TLX');
    expect(slugLabel('px-converter')).toBe('PX Converter');
    expect(slugLabel('usg-seals')).toBe('USG Seals');
    expect(slugLabel('voice-and-tone')).toBe('Voice and Tone');
  });
});
