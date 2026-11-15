// Token sync and design sync pages against stubbed APIs: a pull shows the diff
// with safe default choices, apply posts the per-item choices and shows the
// outcomes (or the permission error), the Figma plan error is shown, Adobe XD
// connections say why they can't sync, and design sync shows the compare and
// links a component to its design node.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import TokenSync from '../src/views/TokenSync.vue';
import DesignSync from '../src/views/DesignSync.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

const PLAN_MESSAGE = 'Figma didn\'t return variables ("Limited by Figma plan"). The variables API is only open to full members of an Enterprise organization.';

const TOKEN_RUN = {
  id: 'run-1',
  kind: 'tokens',
  connectionId: 'conn-1',
  tool: 'figma',
  fileName: 'Acme',
  fileVersion: '42',
  trigger: 'manual',
  startedBy: { type: 'user', id: 'usr_1', name: 'Dana' },
  startedAt: '2026-11-01T10:00:00.000Z',
  status: 'review',
  counts: { added: 1, changed: 1, removed: 1, conflicts: 1, unchanged: 3 },
  warnings: [PLAN_MESSAGE, 'Collection "Primitives" has 2 modes; only its default mode ("Light") was read'],
  variables: { status: 'unavailable', message: PLAN_MESSAGE },
  tokenItems: [
    { id: 'border.radius.sm', kind: 'conflict', codeValue: '5px', designValue: '8px', baselineValue: '6px', type: 'dimension', category: 'borders', reason: 'Changed on both sides', defaultChoice: 'skip' },
    { id: 'color.secondary', kind: 'changed', codeValue: '#6366f1', designValue: '#000000', type: 'color', category: 'colors', reason: 'Differs from code', defaultChoice: 'take-design' },
    { id: 'color.brand', kind: 'added', designValue: '#ff8000', designName: 'Brand/Accent', type: 'color', category: 'colors', reason: 'New in the design file', defaultChoice: 'take-design' },
    { id: 'color.old', kind: 'removed', codeValue: '#111111', type: 'color', category: 'colors', reason: 'Removed from the design file', defaultChoice: 'skip' },
  ],
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {};
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    const data = config.data ? JSON.parse(config.data) : undefined;
    calls.push({ key, data });
    let answer = responses[key];
    if (typeof answer === 'function') answer = answer(data);
    if (answer instanceof Error) return Promise.reject(answer);
    if (answer === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data: answer, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === label);

describe('Token sync page', () => {
  beforeEach(() => {
    responses['GET /api/v1/token-sync/connections'] = [
      { id: 'conn-1', name: 'Acme Figma', tool: 'figma', fileId: 'AbCdEf1234567890', enabled: true, hasApiKey: true, autoSync: true, syncIntervalHours: 24 },
      { id: 'conn-xd', name: 'Old XD', tool: 'adobe-xd', enabled: true, hasApiKey: true, autoSync: false },
    ];
    responses['POST /api/v1/token-sync/connections/conn-1/sync'] = structuredClone(TOKEN_RUN);
  });

  it('shows connections honestly, with Adobe XD marked as not supported', async () => {
    page = await mountView(TokenSync, { path: '/tokens/sync' });
    await flush();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(text()).toContain('Every day');
    expect(text()).toContain('Not supported');
    expect(text()).toContain('Adobe has discontinued the XD plugin and cloud document APIs');
    // Only the Figma connection can pull
    expect([...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Pull changes')).toHaveLength(1);
  });

  it('pulls a diff with safe default choices, shows the plan error, and applies the chosen items', async () => {
    page = await mountView(TokenSync, { path: '/tokens/sync' });
    await flush();
    button('Pull changes').click();
    await flush();

    expect(text()).toContain('Review changes');
    expect(text()).toContain("Figma variables weren't read");
    expect(text()).toContain('Limited by Figma plan');
    expect(text()).toContain('only its default mode');
    expect(text()).toContain('color.brand');
    expect(page.state.choices).toEqual({ 'border.radius.sm': 'skip', 'color.secondary': 'take-design', 'color.brand': 'take-design', 'color.old': 'skip' });
    // An added token has nothing in code to keep
    expect(page.state.choiceOptions(TOKEN_RUN.tokenItems[2]).map((o) => o.value)).toEqual(['take-design', 'skip']);
    expect(page.state.choiceOptions(TOKEN_RUN.tokenItems[3]).map((o) => o.label)).toEqual(['Delete', 'Keep code', 'Skip']);

    page.state.choices['border.radius.sm'] = 'keep-code';
    responses['POST /api/v1/token-sync/runs/run-1/apply'] = () => ({
      status: 'applied',
      applied: {
        by: { name: 'Dana' },
        at: '2026-11-01T10:05:00.000Z',
        counts: { created: 1, updated: 1, deleted: 0, 'kept-code': 1, skipped: 1, failed: 0 },
        results: [
          { id: 'border.radius.sm', choice: 'keep-code', outcome: 'kept-code' },
          { id: 'color.secondary', choice: 'take-design', outcome: 'updated' },
          { id: 'color.brand', choice: 'take-design', outcome: 'created' },
          { id: 'color.old', choice: 'skip', outcome: 'skipped' },
        ],
      },
    });
    button('Apply choices').click();
    await flush();

    const apply = calls.find((c) => c.key === 'POST /api/v1/token-sync/runs/run-1/apply');
    expect(apply.data).toEqual({ choices: { 'border.radius.sm': 'keep-code', 'color.secondary': 'take-design', 'color.brand': 'take-design', 'color.old': 'skip' } });
    expect(text()).toContain('Your choices were applied.');
    expect(text()).toContain('Kept code');
    expect(text()).toContain('Created');
    expect(button('Apply choices')).toBeUndefined();
  });

  it('shows the permission the server asks for when applying is refused', async () => {
    responses['POST /api/v1/token-sync/runs/run-1/apply'] = fail(403, 'Applying these changes requires token:create');
    page = await mountView(TokenSync, { path: '/tokens/sync' });
    await flush();
    button('Pull changes').click();
    await flush();
    button('Apply choices').click();
    await flush();
    expect(text()).toContain('Applying these changes requires token:create');
  });

  it('shows why a pull failed', async () => {
    responses['POST /api/v1/token-sync/connections/conn-1/sync'] = fail(422, 'Refused to contact 127.0.0.1:9001: URLs that point to private or internal addresses are not allowed');
    page = await mountView(TokenSync, { path: '/tokens/sync' });
    await flush();
    button('Pull changes').click();
    await flush();
    expect(text()).toContain('Refused to contact 127.0.0.1:9001');
    expect(text()).not.toContain('Review changes');
  });

  it('sends the schedule with the connection', async () => {
    responses['POST /api/v1/token-sync/connections'] = (data) => ({ id: 'conn-2', ...data });
    page = await mountView(TokenSync, { path: '/tokens/sync' });
    await flush();
    page.state.openCreate();
    Object.assign(page.state.connectionForm, { name: 'New', tool: 'penpot', apiKey: 'tok', fileId: 'abc', fileUrl: 'https://penpot.example.com', autoSync: true, syncIntervalHours: 12 });
    await page.state.saveConnection();
    expect(calls.find((c) => c.key === 'POST /api/v1/token-sync/connections').data).toEqual({
      name: 'New',
      tool: 'penpot',
      apiKey: 'tok',
      fileId: 'abc',
      fileUrl: 'https://penpot.example.com',
      enabled: true,
      autoSync: true,
      syncIntervalHours: 12,
      mappings: [],
    });
  });
});

describe('Design sync page', () => {
  const COMPARE = {
    id: 'run-c',
    kind: 'components',
    connectionId: 'sync-1',
    fileName: 'Acme',
    fileVersion: '42',
    trigger: 'manual',
    startedBy: { name: 'Dana' },
    startedAt: '2026-11-01T10:00:00.000Z',
    status: 'compared',
    counts: { matched: 1, renamed: 0, 'missing-in-code': 1, 'missing-in-design': 1 },
    warnings: [],
    componentItems: [
      { kind: 'missing-in-code', designId: '3:1', designName: 'Toast', designUrl: 'https://www.figma.com/design/k/?node-id=3-1' },
      { kind: 'missing-in-design', componentId: 'card', componentName: 'Card' },
      { kind: 'matched', designId: '1:0', designName: 'Button', variants: ['Size=Small', 'Size=Large'], componentId: 'button', componentName: 'Button' },
    ],
  };

  beforeEach(() => {
    responses['GET /api/v1/design-sync/connections'] = [{ id: 'sync-1', name: 'Acme', tool: 'figma', fileId: 'k', enabled: true, hasApiKey: true, autoSync: false }];
    responses['POST /api/v1/design-sync/connections/sync-1/sync'] = structuredClone(COMPARE);
    responses['PUT /api/v1/design-sync/connections/sync-1/links'] = { id: 'sync-1', componentLinks: { card: '3:1' } };
  });

  it('compares, says it never writes to the design file, and links a component to its node', async () => {
    page = await mountView(DesignSync, { path: '/design-sync' });
    await flush();
    expect(text()).toContain("doesn't change the design file or generate component code");
    expect(text()).not.toMatch(/bidirectional|Generate code/i);

    button('Compare').click();
    await flush();
    expect(text()).toContain('Missing in code');
    expect(text()).toContain('Missing in design');
    expect(text()).toContain('2 variants');
    expect(document.querySelector('a[href="https://www.figma.com/design/k/?node-id=3-1"]')).not.toBeNull();
    expect(page.state.unmatchedCode).toEqual([{ value: 'card', label: 'Card' }]);

    await page.state.setLink('card', '3:1');
    await flush();
    expect(calls.find((c) => c.key === 'PUT /api/v1/design-sync/connections/sync-1/links').data).toEqual({ componentId: 'card', designNodeId: '3:1' });
    expect(calls.filter((c) => c.key === 'POST /api/v1/design-sync/connections/sync-1/sync')).toHaveLength(2);
  });
});
