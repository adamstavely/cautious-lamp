// The deprecation manager and dependency graph are built from the real
// components (GET /api/v1/components): deprecations and dependencies are saved
// through the API, usage appears only when application scans recorded some,
// and an empty graph says no dependencies are recorded.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComponentDependencyGraph from '../src/views/ComponentDependencyGraph.vue';
import DeprecationManager from '../src/views/DeprecationManager.vue';
import { fail, flush, stubApi } from './helpers/stubApi.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const permissions = new Set();
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => permissions.has(p), user: { value: { id: 'usr_1' } } }),
}));

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const components = () => [
  { id: 'button', name: 'Button', description: 'Actions', status: 'production', dependencies: [] },
  { id: 'card', name: 'Card', description: 'Containers', status: 'production', dependencies: [] },
  {
    id: 'old-card',
    name: 'Old card',
    description: 'Legacy',
    status: 'deprecated',
    dependencies: [],
    deprecation: { replacement: 'card', sunsetDate: day(10), reason: 'Replaced by Card', migrationGuide: 'Swap <OldCard> for <Card>', deprecatedAt: '2026-01-01T00:00:00.000Z' },
  },
  { id: 'legacy-tabs', name: 'Legacy tabs', description: 'Old tabs', status: 'deprecated', dependencies: [], deprecation: { sunsetDate: day(-3), deprecatedAt: '2026-01-01T00:00:00.000Z' } },
];

const noUsage = [
  { componentId: 'button', totalUsage: 0, applicationCount: 0 },
  { componentId: 'old-card', totalUsage: 0, applicationCount: 0 },
];

let api;
let page;
let responses;

beforeEach(() => {
  permissions.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/components': { components: components() },
    'GET /api/v1/analytics/component-popularity': noUsage,
  };
  api = stubApi(responses);
});

afterEach(() => {
  page?.unmount();
  page = null;
  api.restore();
});

const open = async (view) => {
  page = await mountView(view);
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');

describe('Deprecation manager', () => {
  it('lists the deprecated components with their replacement and sunset date, soonest first', async () => {
    await open(DeprecationManager);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(page.state.deprecated.map((c) => c.id)).toEqual(['legacy-tabs', 'old-card']);
    expect(page.state.soon.map((c) => c.id)).toEqual(['old-card']);
    expect(page.state.past.map((c) => c.id)).toEqual(['legacy-tabs']);
    const body = text();
    expect(body).toContain('Replaced by Card');
    expect(body).toContain('Swap <OldCard> for <Card>');
    expect(body).toContain('In 10 days');
    expect(body).toContain('3 days ago');
    expect(page.state.nameOf('card')).toBe('Card');
    expect(body).not.toContain('OldButton'); // the old hard-coded list
    // Read-only: no write actions on the page (the closed dialogs aren't shown)
    const pageButtons = [...document.querySelectorAll('button')].filter((b) => !b.closest('dialog')).map((b) => b.textContent.trim());
    expect(pageButtons.some((l) => /Deprecate a component|Undeprecate|^Edit/.test(l))).toBe(false);
  });

  it('leaves usage out when no application scan recorded any, and shows it when one did', async () => {
    await open(DeprecationManager);
    expect(page.state.usageAvailable).toBe(false);
    expect(text()).toContain('no application scan has recorded component usage yet');
    expect([...document.querySelectorAll('th')].map((th) => th.textContent.trim())).not.toContain('Usage');
    page.unmount();

    responses['GET /api/v1/analytics/component-popularity'] = [{ componentId: 'old-card', totalUsage: 7, applicationCount: 2 }];
    await open(DeprecationManager);
    expect(page.state.usageAvailable).toBe(true);
    expect(text()).toContain('7 uses in 2 applications');
    expect(page.state.usageLabel('legacy-tabs')).toBe('Not used');
  });

  it('deprecates a component through the API', async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/button/deprecation'] = (body) => ({
      ...components()[0],
      status: 'deprecated',
      deprecation: { ...body, deprecatedAt: '2026-11-15T00:00:00.000Z' },
    });
    await open(DeprecationManager);
    page.state.openDeprecate();
    await flush();
    await page.state.saveDeprecation();
    expect(page.state.form.errors.id).toBeTruthy();

    Object.assign(page.state.form, { id: 'button', replacement: 'card', sunsetDate: '2027-03-01', reason: ' Superseded ', migrationGuide: '' });
    await page.state.saveDeprecation();
    await flush();
    expect(api.calls.find((c) => c.key === 'PUT /api/v1/components/button/deprecation').data).toEqual({ replacement: 'card', sunsetDate: '2027-03-01', reason: 'Superseded' });
    expect(page.state.deprecated.map((c) => c.id)).toContain('button');
    expect(page.state.form).toBe(null);
    expect(text()).toContain('Button is now deprecated.');
  });

  it('undeprecates by setting a new status, and keeps the dialog open with the error if refused', async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/old-card/status'] = fail(403, "Requires the editor role in the component's workspace");
    await open(DeprecationManager);
    page.state.openRestore(page.state.deprecated.find((c) => c.id === 'old-card'));
    await page.state.saveRestore();
    await flush();
    expect(page.state.restore.error).toContain('Requires the editor role');

    responses['PUT /api/v1/components/old-card/status'] = (body) => ({ ...components()[2], status: body.status, deprecation: undefined });
    page.state.restore.status = 'in-progress';
    await page.state.saveRestore();
    await flush();
    expect(api.calls.filter((c) => c.key === 'PUT /api/v1/components/old-card/status').at(-1).data).toEqual({ status: 'in-progress' });
    expect(page.state.deprecated.map((c) => c.id)).toEqual(['legacy-tabs']);
    expect(page.state.restore).toBe(null);
  });
});

describe('Dependency graph', () => {
  it('shows an honest empty state when no dependencies are recorded', async () => {
    await open(ComponentDependencyGraph);
    expect(page.state.edges).toEqual([]);
    expect(text()).toContain('No dependencies recorded');
    expect(document.querySelector('svg[role="img"]')).toBe(null);
    // The list still shows every component
    expect(text()).toContain('Legacy tabs');
  });

  it('draws the recorded dependencies in rows, foundations first', async () => {
    const list = components();
    list[1].dependencies = ['button'];
    list[2].dependencies = ['card', 'button', 'not-visible'];
    responses['GET /api/v1/components'] = { components: list };
    await open(ComponentDependencyGraph);
    expect(page.state.edges).toEqual([
      { from: 'button', to: 'card' },
      { from: 'card', to: 'old-card' },
      { from: 'button', to: 'old-card' },
    ]);
    const { positions } = page.state.layout;
    expect(positions.get('button').y).toBeLessThan(positions.get('card').y);
    expect(positions.get('card').y).toBeLessThan(positions.get('old-card').y);
    expect(document.querySelector('svg[role="img"]').getAttribute('aria-label')).toContain('Old card depends on Card, Button');
    expect(page.state.names(page.state.dependentsOf('button'))).toBe('Card, Old card');

    page.state.focusId = 'card';
    page.state.showDependents = false;
    await flush();
    expect(page.state.visibleNodes.map((n) => n.id).sort()).toEqual(['button', 'card']);
  });

  it('saves dependencies through the API for component:edit holders', async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/card/dependencies'] = (body) => ({ ...components()[1], ...body });
    await open(ComponentDependencyGraph);
    page.state.openEdit(page.state.components.find((c) => c.id === 'card'));
    page.state.editing.dependencies.push('button');
    await page.state.saveDependencies();
    await flush();
    expect(api.calls.find((c) => c.key === 'PUT /api/v1/components/card/dependencies').data).toEqual({ dependencies: ['button'] });
    expect(page.state.edges).toEqual([{ from: 'button', to: 'card' }]);
    expect(text()).not.toContain('No dependencies recorded');
  });

  it("keeps the editor open with the server's reason when a cycle is refused", async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/button/dependencies'] = fail(400, "'card' already depends on 'button', so this would create a cycle");
    await open(ComponentDependencyGraph);
    page.state.openEdit(page.state.components.find((c) => c.id === 'button'));
    page.state.editing.dependencies.push('card');
    await page.state.saveDependencies();
    await flush();
    expect(page.state.editing.error).toContain('would create a cycle');
  });
});
