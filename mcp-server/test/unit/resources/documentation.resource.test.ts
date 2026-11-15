import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  listDocumentationResources,
  readDocumentationResource,
  resolveDocsDirs,
} from '../../../src/resources/documentation.resource';

jest.mock('../../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const REPO_ROOT = path.resolve(__dirname, '../../../..');

/** A temporary tree: { 'a/b.md': '# B' } */
function tree(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-docs-'));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  return root;
}

describe('Documentation Resource', () => {
  const original = process.env.MCP_DOCS_DIRS;

  afterEach(() => {
    if (original === undefined) delete process.env.MCP_DOCS_DIRS;
    else process.env.MCP_DOCS_DIRS = original;
  });

  describe('resolveDocsDirs', () => {
    it("finds the repository's docs/ and frontend/docs/ from src or dist", () => {
      const expected = [path.join(REPO_ROOT, 'docs'), path.join(REPO_ROOT, 'frontend', 'docs')];
      expect(resolveDocsDirs({}, path.join(REPO_ROOT, 'mcp-server', 'src', 'resources'))).toEqual(expected);
      expect(resolveDocsDirs({}, path.join(REPO_ROOT, 'mcp-server', 'dist', 'resources'))).toEqual(expected);
    });

    it('uses MCP_DOCS_DIRS when set', () => {
      expect(resolveDocsDirs({ MCP_DOCS_DIRS: ['/a', '/b'].join(path.delimiter) }, '/anywhere')).toEqual(['/a', '/b']);
    });

    it("falls back to an installed package's bundled docs", () => {
      const root = tree({
        'node_modules/pkg/package.json': '{}',
        'node_modules/pkg/bundled-docs/docs/GETTING_STARTED.md': '# Start',
        'node_modules/pkg/dist/resources/x.js': '',
      });
      const pkg = path.join(root, 'node_modules', 'pkg');
      expect(resolveDocsDirs({}, path.join(pkg, 'dist', 'resources'))).toEqual([
        path.join(pkg, 'bundled-docs', 'docs'),
        path.join(pkg, 'bundled-docs', 'frontend', 'docs'),
      ]);
    });

    it('prefers the repository over a bundle left in a checkout by npm pack', () => {
      const root = tree({
        'docs/GETTING_STARTED.md': '# Live',
        'frontend/docs/index.md': '# Live',
        'mcp-server/package.json': '{}',
        'mcp-server/bundled-docs/docs/GETTING_STARTED.md': '# Stale',
      });
      expect(resolveDocsDirs({}, path.join(root, 'mcp-server', 'dist', 'resources'))).toEqual([
        path.join(root, 'docs'),
        path.join(root, 'frontend', 'docs'),
      ]);
    });

    it('serves nothing when there are no docs anywhere', () => {
      expect(resolveDocsDirs({}, fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-none-')))).toEqual([]);
    });
  });

  describe('with the repository docs', () => {
    it('lists the advertised platform docs and the design system guides', () => {
      const uris = listDocumentationResources().map((r) => r.uri);
      expect(uris).toEqual(
        expect.arrayContaining([
          'design-system://docs/GETTING_STARTED',
          'design-system://docs/API_REFERENCE',
          'design-system://docs/index',
          'design-system://docs/colors',
        ])
      );
      expect(uris.some((uri) => uri.includes('.vitepress'))).toBe(false);
    });

    it('reads GETTING_STARTED from the top-level docs and index from frontend/docs', async () => {
      await expect(readDocumentationResource('design-system://docs/GETTING_STARTED')).resolves.toBe(
        fs.readFileSync(path.join(REPO_ROOT, 'docs', 'GETTING_STARTED.md'), 'utf-8')
      );
      await expect(readDocumentationResource('design-system://docs/index')).resolves.toBe(
        fs.readFileSync(path.join(REPO_ROOT, 'frontend', 'docs', 'index.md'), 'utf-8')
      );
    });
  });

  describe('with configured directories', () => {
    let first: string;
    let second: string;

    beforeEach(() => {
      first = tree({ 'shared.md': '# First', 'guides/intro.md': '# Intro' });
      second = tree({ 'shared.md': '# Second', 'only-second.md': '# Only' });
      process.env.MCP_DOCS_DIRS = [first, second].join(path.delimiter);
    });

    it('lists each path once, the first directory winning', async () => {
      const uris = listDocumentationResources().map((r) => r.uri).sort();
      expect(uris).toEqual([
        'design-system://docs/guides/intro',
        'design-system://docs/only-second',
        'design-system://docs/shared',
      ]);
      await expect(readDocumentationResource('design-system://docs/shared')).resolves.toBe('# First');
      await expect(readDocumentationResource('design-system://docs/only-second')).resolves.toBe('# Only');
    });

    it('allows nested paths inside a docs directory', async () => {
      await expect(readDocumentationResource('design-system://docs/guides/../guides/intro')).resolves.toBe('# Intro');
    });

    it('says when a document does not exist', async () => {
      await expect(readDocumentationResource('design-system://docs/missing')).rejects.toThrow('Documentation not found: missing');
    });

    it('rejects paths that leave the docs directories', async () => {
      fs.writeFileSync(path.join(path.dirname(first), `${path.basename(first)}-private.md`), 'secret');
      await expect(readDocumentationResource(`design-system://docs/../${path.basename(first)}-private`)).rejects.toThrow(
        'Invalid documentation path'
      );
      await expect(readDocumentationResource('design-system://docs/../../etc/passwd')).rejects.toThrow('Invalid documentation path');
    });

    it('rejects a URI outside design-system://docs/', async () => {
      await expect(readDocumentationResource('invalid-uri')).rejects.toThrow('Invalid documentation URI');
    });
  });
});
