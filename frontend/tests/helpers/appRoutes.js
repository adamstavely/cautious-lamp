import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createMemoryHistory, createRouter } from 'vue-router';

const root = path.resolve(__dirname, '../..');
export const readSource = (file) => readFileSync(path.join(root, file), 'utf8');

/**
 * The app's routes as main.js declares them (paths, redirects and meta), in a
 * memory router with stub components, so tests can check links against them.
 */
export function appRouter() {
  const source = readSource('src/main.js');
  // Route records run up to the not-found route; later `path:`s are redirects in guards
  const all = source.split(/\bpath: '/).slice(1);
  const chunks = all.slice(0, all.findIndex((chunk) => chunk.startsWith('/:pathMatch(.*)*')) + 1);
  const routes = chunks.map((chunk) => {
    const routePath = chunk.slice(0, chunk.indexOf("'"));
    const meta = /meta: \{([^}]*)\}/.exec(chunk)?.[1] ?? '';
    return {
      path: routePath,
      ...(/\bredirect:/.test(chunk) ? { redirect: '/' } : { component: { render: () => null } }),
      meta: { bare: /bare: true/.test(meta), public: /public: true/.test(meta), title: /title: '([^']*)'/.exec(meta)?.[1] },
    };
  });
  // The same path can appear twice (aliases); the router keeps the last one
  return createRouter({ history: createMemoryHistory(), routes });
}

/**
 * The Markdown file a document page under a catch-all route shows, or null.
 * Mirrors MarkdownViewer's mapping for the paths links use.
 */
export function docFileFor(link) {
  const candidates = [];
  const rest = (prefix) => link.slice(prefix.length);
  if (link.startsWith('/guidelines/ai/')) candidates.push(`docs/ai/${rest('/guidelines/ai/')}`);
  else if (link.startsWith('/guidelines/patterns/')) candidates.push(`docs/patterns/${rest('/guidelines/patterns/')}`);
  else if (link === '/guidelines/accessibility') candidates.push('docs/hcd/accessibility');
  else if (link.startsWith('/guidelines/')) candidates.push(`docs/${rest('/guidelines/')}`, `docs/guidelines/${rest('/guidelines/')}`);
  else if (link.startsWith('/tools/references/')) candidates.push(`docs/tools/references/${rest('/tools/references/')}`);
  else if (link.startsWith('/data-viz/')) candidates.push(`docs/data-viz/${rest('/data-viz/')}`);
  else if (link.startsWith('/patterns/')) candidates.push(`docs/patterns/${rest('/patterns/')}`);
  return candidates.map((c) => `public/${c}.md`).find((file) => existsSync(path.join(root, file))) ?? null;
}

const DOC_ROUTES = ['/guidelines/:pathMatch(.*)*', '/guidelines/patterns/:pathMatch(.*)*', '/tools/references/:pathMatch(.*)*', '/data-viz/:pathMatch(.*)*', '/patterns/:pathMatch(.*)*'];

/** Why a link goes nowhere, or null when it opens a real page (a route, or a document behind a catch-all) */
export function brokenLinkReason(router, link) {
  const matched = router.resolve(link).matched;
  const record = matched[matched.length - 1];
  if (!record || record.path === '/:pathMatch(.*)*') return 'no route';
  if (record.redirect) return 'redirect';
  if (DOC_ROUTES.includes(record.path) && !docFileFor(link)) return 'no document';
  return null;
}
