/**
 * Contract test: every HTTP request an MCP tool sends must match a route the
 * backend actually serves. The route list is read from the backend source
 * (`@Controller` / `@Get` / `@Post` … decorators in backend/src/**\/*.controller.ts),
 * so a renamed or removed backend route, or a tool pointed at a path that never
 * existed, fails here instead of in production.
 */
import * as fs from 'fs';
import * as path from 'path';
import { callTool, TOOLS } from '../../src/index';
import { apiClient } from '../../src/api-client';
import { config } from '../../src/config';
import { REVIEW_ACTIONS } from '../../src/tools/reviews.tool';

jest.mock('../../src/api-client');
jest.mock('../../src/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const BACKEND_SRC = path.resolve(__dirname, '../../../backend/src');

interface Route {
  method: string;
  path: string;
  pattern: RegExp;
}

function listControllerFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Skip stray sync copies like "foo 2.controller.ts" / "testing 2/"
    if (/ \d+(\.|$)/.test(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listControllerFiles(full));
    else if (entry.name.endsWith('.controller.ts')) out.push(full);
  }
  return out;
}

function joinPath(...parts: string[]): string {
  const joined = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return `/${joined}`;
}

/** Parse the backend controllers' routing decorators into a route list */
function loadBackendRoutes(): Route[] {
  const routes: Route[] = [];
  const decorator = /@(Controller|Get|Post|Put|Patch|Delete|All)\(\s*(?:(['"`])([^'"`]*)\2)?\s*[,)]/g;
  for (const file of listControllerFiles(BACKEND_SRC)) {
    const source = fs.readFileSync(file, 'utf8');
    let prefix = '';
    for (const match of source.matchAll(decorator)) {
      const [, kind, , routePath = ''] = match;
      if (kind === 'Controller') {
        prefix = routePath;
        continue;
      }
      const full = joinPath(prefix, routePath);
      const pattern = new RegExp(
        `^${full
          .split('/')
          .map((seg) => (seg.startsWith(':') ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
          .join('/')}$`
      );
      routes.push({ method: kind.toUpperCase(), path: full, pattern });
    }
  }
  return routes;
}

/** Turn what a tool passed to the API client into the server path it hits */
function serverPath(requested: string): string {
  if (/^https?:\/\//.test(requested)) {
    return new URL(requested).pathname;
  }
  const base = new URL(config.apiBaseUrl).pathname;
  return joinPath(base, requested.split('?')[0]);
}

/**
 * Arguments for every tool. A tool that is called several times (one argument
 * set per branch) has several entries. Adding a tool without an entry here
 * fails the "covers every tool" test.
 */
const TOOL_CALLS: Record<string, Record<string, unknown>[]> = {
  get_tokens: [{}, { category: 'color', type: 'color', tag: 'brand' }],
  get_token: [{ name: 'color-primary' }],
  search_tokens: [{ query: 'primary' }],
  get_components: [{}, { status: 'stable' }],
  get_component: [{ id: 'button' }],
  get_component_code: [{ id: 'button', format: 'vue' }],
  search_components: [{ query: 'button' }],
  get_patterns: [{}],
  get_pattern: [{ id: 'p1' }],
  get_patterns_by_component: [{ componentId: 'button' }],
  get_compliance_rules: [{}],
  scan_component: [{ componentId: 'button' }],
  export_rules: [{}, { format: 'eslint' }],
  get_assets: [{ workspaceId: 'ws1' }, { workspaceId: 'ws1', type: 'logo' }],
  get_icons: [{ workspaceId: 'ws1' }, { workspaceId: 'ws1', iconSet: 'material' }],
  get_asset_by_id: [{ workspaceId: 'ws1', assetId: 'a1' }],
  search_assets: [{ workspaceId: 'ws1', query: 'logo' }],
  get_asset_types: [{}],
  get_reviews: [{}],
  get_review: [{ reviewId: 'r1' }],
  create_review: [{ url: 'https://example.com/design' }],
  update_review: REVIEW_ACTIONS.map((action) => ({
    reviewId: 'r1',
    action,
    stage: 'client_review',
    reason: 'needs work',
    targetStage: 'draft',
    sharingMode: 'anyone',
  })),
  search_reviews: [{ query: 'home' }],
  get_review_comments: [{ reviewId: 'r1' }],
  add_review_comment: [{ reviewId: 'r1', text: 'Looks good' }],
};

/** Tools that answer locally without calling the backend */
const LOCAL_ONLY = new Set(['get_asset_types']);

interface SentRequest {
  method: string;
  path: string;
  params?: Record<string, unknown>;
}

describe('MCP tools match backend routes', () => {
  const routes = loadBackendRoutes();
  let sent: SentRequest[] = [];

  beforeEach(() => {
    sent = [];
    jest.clearAllMocks();
    mockApiClient.get.mockImplementation(async (p: string, params?: Record<string, unknown>) => {
      sent.push({ method: 'GET', path: p, params });
      return [] as never;
    });
    for (const method of ['post', 'put', 'delete'] as const) {
      (mockApiClient[method] as jest.Mock).mockImplementation(async (p: string) => {
        sent.push({ method: method.toUpperCase(), path: p });
        return {};
      });
    }
  });

  it('parses a plausible route list from the backend', () => {
    expect(routes.length).toBeGreaterThan(50);
    expect(routes).toContainEqual(
      expect.objectContaining({ method: 'GET', path: '/api/v1/workspaces/:id/resources/:kind' })
    );
  });

  it('has request arguments for every registered tool', () => {
    expect(Object.keys(TOOL_CALLS).sort()).toEqual(TOOLS.map((t) => t.name).sort());
  });

  it.each(Object.entries(TOOL_CALLS))('%s only calls routes the backend serves', async (name, argSets) => {
    for (const args of argSets) {
      await callTool(name, args);
    }

    if (LOCAL_ONLY.has(name)) {
      expect(sent).toEqual([]);
      return;
    }
    expect(sent.length).toBeGreaterThan(0);

    const unmatched = sent
      .map((req) => ({ method: req.method, path: serverPath(req.path) }))
      .filter((req) => !routes.some((r) => r.method === req.method && r.pattern.test(req.path)));
    expect(unmatched).toEqual([]);
  });

  it('workspace resource tools only use the `filter` query parameter', async () => {
    await callTool('get_assets', { workspaceId: 'ws1', type: 'logo' });
    await callTool('get_icons', { workspaceId: 'ws1', iconSet: 'material' });

    expect(sent.map((r) => r.params)).toEqual([{ filter: 'logo' }, { filter: 'material' }]);
  });
});
