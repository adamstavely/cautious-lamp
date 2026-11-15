// Every view is reachable: a page file that nothing imports is dead code that
// drifts from the rest of the app. The pages removed as duplicates of routed
// ones keep their old addresses as redirects.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = join(__dirname, '../src');
const viewsDir = join(src, 'views');

const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'assets' ? [] : sourceFiles(path);
    return /\.(vue|js)$/.test(name) ? [path] : [];
  });

describe('views', () => {
  it('are each imported by the router or another page', () => {
    const files = sourceFiles(src);
    const unreferenced = readdirSync(viewsDir)
      .filter((name) => name.endsWith('.vue'))
      .filter((name) => {
        const own = join(viewsDir, name);
        const pattern = new RegExp(`/${name.replace('.', '\\.')}['"]`);
        return !files.some((file) => file !== own && pattern.test(readFileSync(file, 'utf8')));
      });
    expect(unreferenced).toEqual([]);
  });

  it('removed as duplicates leave redirects to the pages that replace them', () => {
    const router = readFileSync(join(src, 'main.js'), 'utf8');
    const redirects = {
      '/components/versions': '/feedback',
      '/components/examples': '/components',
      '/components/feedback': '/feedback',
      '/performance/budgets': '/admin/performance',
      '/performance/bundle-analysis': '/admin/performance',
      '/fonts/subsetting': '/tools/font-stack',
      '/search': '/',
    };
    for (const [from, to] of Object.entries(redirects)) {
      expect(router, from).toMatch(new RegExp(`path: '${from}',\\s+redirect: '${to}'`));
    }
  });
});
