// Component composition: saved compositions are workspace items of kind
// "compositions". The list loads from the library route, saving posts the
// component tree to the workspace, and opening one puts it on the canvas.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import ComponentComposition from '../src/views/ComponentComposition.vue';
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

const SAVED = {
  id: 'res_1',
  kind: 'compositions',
  workspaceId: 'ws_a',
  name: 'Sign-in card',
  layout: 'grid',
  components: [{ name: 'Card', type: 'component', props: { title: 'Welcome' }, children: [{ name: 'Button', type: 'component', props: { label: 'Go' }, children: [] }] }],
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-02T10:00:00.000Z',
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  calls = [];
  responses = {
    'GET /api/v1/resources/compositions': [structuredClone(SAVED)],
    'GET /api/v1/workspaces': [{ id: 'ws_a', name: 'Payments', effectiveRole: 'editor' }],
    'POST /api/v1/workspaces/ws_a/resources/compositions': (config) => ({
      id: 'res_2',
      kind: 'compositions',
      workspaceId: 'ws_a',
      ...JSON.parse(config.data),
      createdAt: '2026-04-01T10:00:00.000Z',
    }),
    'PATCH /api/v1/workspaces/ws_a/resources/compositions/res_1': (config) => ({ ...structuredClone(SAVED), ...JSON.parse(config.data) }),
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
    let data = responses[key];
    if (typeof data === 'function') data = data(config);
    if (data === undefined) return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const open = async () => {
  page = await mountView(ComponentComposition, { path: '/components/composition' });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');

describe('Component composition', () => {
  it('lists saved compositions from the library', async () => {
    await open();
    expect(calls.map((c) => c.key)).toContain('GET /api/v1/resources/compositions');
    expect(text()).toContain('Sign-in card');
    expect(text()).toContain('Payments · 2 components · grid');
  });

  it('saves the component tree to the workspace', async () => {
    const { state } = await open();
    state.loadTemplate(state.templates[0]);
    state.openSaveDialog();
    state.saveForm.name = 'Login';
    await state.saveAsNew();
    await flush();

    const post = calls.find((c) => c.key === 'POST /api/v1/workspaces/ws_a/resources/compositions');
    expect(post.data).toEqual({
      name: 'Login',
      layout: 'stack',
      components: [
        {
          name: 'Form',
          type: 'component',
          props: {},
          children: [
            { name: 'Input', type: 'component', props: { placeholder: 'Email' }, children: [] },
            { name: 'Input', type: 'component', props: { placeholder: 'Password', type: 'password' }, children: [] },
            { name: 'Button', type: 'component', props: { label: 'Log in' }, children: [] },
          ],
        },
      ],
    });
    expect(state.opened.id).toBe('res_2');
    expect(text()).toContain('Saved Login to Payments.');
  });

  it('opens a saved composition onto the canvas and saves changes back to it', async () => {
    const { state } = await open();
    const openButton = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Open Sign-in card');
    openButton.click();
    await flush();

    expect(state.composition).toHaveLength(1);
    expect(state.composition[0].name).toBe('Card');
    expect(state.composition[0].children[0].props.label).toBe('Go');
    expect(state.layoutType).toBe('grid');

    state.composition[0].props.title = 'Hello';
    await state.save();
    await flush();
    const patch = calls.find((c) => c.key === 'PATCH /api/v1/workspaces/ws_a/resources/compositions/res_1');
    expect(patch.data.components[0].props.title).toBe('Hello');
    expect(patch.data.layout).toBe('grid');
  });

  it('explains that saving needs editor access when the user can only read', async () => {
    responses['GET /api/v1/workspaces'] = [{ id: 'ws_a', name: 'Payments', effectiveRole: 'viewer' }];
    await open();
    expect(text()).toContain("You can't save compositions yet");
  });
});
