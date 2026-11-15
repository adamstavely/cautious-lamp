// Component status, pattern status and lifecycle management read the real
// components (GET /api/v1/components) and patterns (GET /patterns-library/patterns),
// save status changes and new items to the server, and keep nothing in localStorage.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComponentStatus from '../src/views/ComponentStatus.vue';
import ContentManagement from '../src/views/ContentManagement.vue';
import PatternStatus from '../src/views/PatternStatus.vue';
import { fail, flush, stubApi } from './helpers/stubApi.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const permissions = new Set();
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => permissions.has(p), user: { value: { id: 'usr_1' } } }),
}));

const COMPONENTS = [
  { id: 'button', name: 'Button', description: 'Actions', status: 'production', dependencies: [] },
  { id: 'modal', name: 'Modal', description: 'Dialogs', status: 'in-progress', dependencies: ['button'], updatedAt: '2026-10-01T10:00:00.000Z' },
  { id: 'old-card', name: 'Old card', description: 'Legacy', status: 'deprecated', dependencies: [] },
];
const PATTERNS = [
  { id: 'p1', name: 'Form Validation', description: 'Validate inputs', category: 'best-practice', status: 'production', updatedAt: '2026-09-01T10:00:00.000Z' },
  { id: 'p2', name: 'Inline Styles', description: 'Avoid them', category: 'anti-pattern', status: 'planned', updatedAt: '2026-09-02T10:00:00.000Z' },
];

let api;
let page;
let responses;

beforeEach(() => {
  permissions.clear();
  localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/components': { components: COMPONENTS, count: COMPONENTS.length },
    'GET /patterns-library/patterns': PATTERNS,
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

describe('Component status', () => {
  it('lists the real components with their status, dependencies and counts', async () => {
    await open(ComponentStatus);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    const body = text();
    expect(body).toContain('Old card');
    expect(body).toContain('Modal');
    expect(body).not.toContain('Data Table'); // the old hard-coded inventory
    expect(page.state.counts).toEqual({ production: 1, 'in-progress': 1, planned: 0, deprecated: 1 });
    expect(page.state.dependencyNames(COMPONENTS[1])).toBe('Button');
    // Read-only: chips, not selects
    expect(document.querySelectorAll('select')).toHaveLength(0);
    expect(body).toContain('Production ready');
    // Only components with a page of their own link to it
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/components/buttons');
    expect(hrefs).not.toContain('/components/modal');
    expect(localStorage.length).toBe(0);
  });

  it('saves a status change for people with component:edit', async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/modal/status'] = (body) => ({ ...COMPONENTS[1], status: body.status, updatedAt: '2026-11-15T10:00:00.000Z' });
    await open(ComponentStatus);
    expect(document.querySelectorAll('select')).toHaveLength(3);
    await page.state.changeStatus(page.state.components.find((c) => c.id === 'modal'), 'production');
    await flush();
    expect(api.calls.find((c) => c.key === 'PUT /api/v1/components/modal/status').data).toEqual({ status: 'production' });
    expect(page.state.counts.production).toBe(2);
    expect(text()).toContain('Modal is now production ready.');
    expect(localStorage.length).toBe(0);
  });

  it("shows the server's refusal and keeps the old status", async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/modal/status'] = fail(403, "Requires the editor role in the component's workspace");
    await open(ComponentStatus);
    await page.state.changeStatus(page.state.components.find((c) => c.id === 'modal'), 'planned');
    await flush();
    expect(page.state.components.find((c) => c.id === 'modal').status).toBe('in-progress');
    expect(document.querySelector('#status-modal').value).toBe('in-progress');
    expect(text()).toContain("Requires the editor role in the component's workspace");
  });

  it('says so when the components cannot be loaded', async () => {
    responses['GET /api/v1/components'] = fail(503, 'Elasticsearch is unavailable');
    await open(ComponentStatus);
    expect(text()).toContain("Components couldn't be loaded");
  });
});

describe('Pattern status', () => {
  it('lists the patterns library with real statuses and saves changes', async () => {
    await open(PatternStatus);
    expect(text()).toContain('Form Validation');
    expect(text()).toContain('Anti-pattern');
    expect(page.state.counts).toEqual({ production: 1, 'in-progress': 0, planned: 1, deprecated: 0 });
    expect([...document.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toContain('/patterns/form-validation');
    page.unmount();

    permissions.add('pattern:edit');
    responses['PUT /patterns-library/patterns/p2'] = (body) => ({ ...PATTERNS[1], ...body });
    await open(PatternStatus);
    await page.state.changeStatus(page.state.patterns.find((p) => p.id === 'p2'), 'deprecated');
    await flush();
    expect(api.calls.find((c) => c.key === 'PUT /patterns-library/patterns/p2').data).toEqual({ status: 'deprecated' });
    expect(page.state.counts.deprecated).toBe(1);
  });
});

describe('Lifecycle management', () => {
  it('adds a component through the API, with an id made from its name', async () => {
    permissions.add('component:create');
    responses['POST /api/v1/components'] = (body) => ({ ...body, dependencies: [] });
    await open(ContentManagement);
    expect(page.state.contentTypeOptions.map((o) => o.value)).toEqual(['component']);
    Object.assign(page.state.newItem, { name: 'Date Picker', description: 'Pick a day', status: 'planned' });
    await page.state.handleCreateSubmit();
    await flush();
    expect(api.calls.find((c) => c.key === 'POST /api/v1/components').data).toEqual({ id: 'date-picker', name: 'Date Picker', description: 'Pick a day', status: 'planned' });
    expect(page.state.components.map((c) => c.id)).toContain('date-picker');
    expect(page.state.activeTab).toBe('manage');
    expect(text()).toContain('Added Date Picker to the component library.');
  });

  it('adds a pattern, and refuses an incomplete form without calling the server', async () => {
    permissions.add('pattern:create');
    responses['POST /patterns-library/patterns'] = (body) => ({ id: 'p3', ...body, updatedAt: '2026-11-15T10:00:00.000Z' });
    await open(ContentManagement);
    expect(page.state.newItem.type).toBe('pattern');
    Object.assign(page.state.newItem, { name: 'Stepper', description: '' });
    await page.state.handleCreateSubmit();
    expect(page.state.errors.description).toBeTruthy();
    expect(page.state.errors.category).toBeTruthy();
    expect(api.calls.some((c) => c.key.startsWith('POST'))).toBe(false);

    Object.assign(page.state.newItem, { description: 'Steps through a task', category: 'common' });
    await page.state.handleCreateSubmit();
    await flush();
    expect(api.calls.find((c) => c.key === 'POST /patterns-library/patterns').data).toEqual({
      name: 'Stepper',
      description: 'Steps through a task',
      category: 'common',
      status: 'in-progress',
    });
    expect(page.state.patterns.map((p) => p.name)).toContain('Stepper');
  });

  it("shows the server's error when adding fails", async () => {
    permissions.add('component:create');
    responses['POST /api/v1/components'] = fail(409, "A component with id 'button' already exists");
    await open(ContentManagement);
    Object.assign(page.state.newItem, { name: 'Button', description: 'Again' });
    await page.state.handleCreateSubmit();
    await flush();
    expect(text()).toContain("A component with id 'button' already exists");
    expect(page.state.activeTab).toBe('create');
  });

  it('edits a status through the API from the manage tab', async () => {
    permissions.add('component:edit');
    responses['PUT /api/v1/components/button/status'] = (body) => ({ ...COMPONENTS[0], ...body });
    await open(ContentManagement);
    expect(text()).toContain("You can't add components or patterns");
    page.state.editItem('component', page.state.components.find((c) => c.id === 'button'));
    page.state.editing.status = 'deprecated';
    await page.state.saveStatusChange();
    await flush();
    expect(api.calls.find((c) => c.key === 'PUT /api/v1/components/button/status').data).toEqual({ status: 'deprecated' });
    expect(page.state.components.find((c) => c.id === 'button').status).toBe('deprecated');
    expect(page.state.editing).toBe(null);
    // Patterns need pattern:edit, which this user doesn't have
    expect(page.state.canEditPatterns).toBe(false);
  });
});
