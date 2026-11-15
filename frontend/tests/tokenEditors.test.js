// Token studio and AI tokens save to the workspace `style-dictionaries` resource
// (not localStorage): a new dictionary goes into a workspace the user can edit,
// ?load=<id> opens one from the library, and saving again updates it. No
// example tokens appear on a fresh page.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import AITokenBuilder from '../src/views/AITokenBuilder.vue';
import TokenStudio from '../src/views/TokenStudio.vue';
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

const dictionary = (id, name, workspaceId, tokens, extra = {}) => ({
  id,
  kind: 'style-dictionaries',
  name,
  description: '',
  format: 'json',
  tokens,
  workspaceId,
  sharedWith: [],
  isGlobal: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...extra,
});

const BRAND = dictionary('res_brand', 'Brand', 'ws_a', { color: { $type: 'color', primary: { $value: '#2f5ea8', $description: 'Primary' } } });
const SHARED = dictionary('res_shared', 'Shared', 'ws_b', { spacing: { sm: { $value: '8px', $type: 'dimension' } } });
const AI = dictionary('res_ai', 'Assistant', 'ws_a', { ai: { confidence: { color: { high: { $value: '#1a7f37', $type: 'color' } } } } });

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  localStorage.clear();
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/resources/style-dictionaries': [structuredClone(BRAND), structuredClone(SHARED), structuredClone(AI)],
    'GET /api/v1/workspaces': [
      { id: 'ws_a', name: 'Brand team', effectiveRole: 'editor' },
      { id: 'ws_b', name: 'Platform team', effectiveRole: 'viewer' },
    ],
    'POST /api/v1/workspaces/ws_a/resources/style-dictionaries': (config) => ({ ...dictionary('res_new', '', 'ws_a', {}), ...JSON.parse(config.data) }),
    'PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_brand': (config) => ({ ...BRAND, ...JSON.parse(config.data) }),
    'PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_ai': (config) => ({ ...AI, ...JSON.parse(config.data) }),
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
    let data = responses[key];
    if (typeof data === 'function') data = data(config);
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label, root = document) => [...root.querySelectorAll('button')].find((el) => el.textContent.trim() === label);
const openDialog = () => document.querySelector('dialog[open]');
const fieldByLabel = (label, root = document) => {
  const el = [...root.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(label));
  return document.getElementById(el.getAttribute('for'));
};
const setValue = async (el, value) => {
  el.value = value;
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
  await flush();
};
const submitDialog = async () => {
  openDialog().querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
  await flush();
};
const settle = async () => {
  await flush();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flush();
};
const writes = () => calls.filter((c) => c.key.startsWith('POST') || c.key.startsWith('PATCH'));

describe('Token studio', () => {
  const open = async (path = '/tokens/studio') => {
    page = await mountView(TokenStudio, { path });
    await flush();
  };

  it('starts empty, with one h1 and no example tokens', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(page.state.tokens).toEqual([]);
    expect(text()).toContain('No tokens yet');
    expect(document.querySelectorAll('li code')).toHaveLength(0);
  });

  it('adds a token and saves a new dictionary to an editable workspace', async () => {
    await open();
    button('Add token').click();
    await flush();
    await setValue(fieldByLabel('Token name', openDialog()), 'color.accent');
    await setValue(fieldByLabel('Value', openDialog()), '#2f5ea8');
    await submitDialog();
    expect(page.state.tokens.map((t) => t.name)).toEqual(['color.accent']);
    // The draft survives a reload
    expect(JSON.parse(localStorage.getItem('designTokens'))[0].name).toBe('color.accent');

    button('Save to library').click();
    await flush();
    const dialog = openDialog();
    // Only workspaces the user can edit are offered
    const workspace = fieldByLabel('Workspace', dialog);
    expect([...workspace.options].map((o) => o.textContent.trim())).toEqual(['Brand team']);
    await setValue(fieldByLabel('Dictionary name', dialog), 'Accent');
    await submitDialog();
    await settle();

    expect(writes()).toEqual([
      {
        key: 'POST /api/v1/workspaces/ws_a/resources/style-dictionaries',
        data: { name: 'Accent', description: '', tokens: { color: { accent: { $value: '#2f5ea8', $type: 'color' } } }, format: 'json', tags: [] },
      },
    ]);
    expect(localStorage.getItem('styleDictionaries')).toBeNull();
    expect(page.router.currentRoute.value.query.load).toBe('res_new');
    expect(text()).toContain('Saved Accent to the style library.');
  });

  it('opens a dictionary with ?load and saves changes back to it', async () => {
    await open('/tokens/studio?load=res_brand');
    expect(page.state.tokens).toEqual([
      { id: 'color.primary', name: 'color.primary', category: 'color', $type: 'color', $value: '#2f5ea8', $description: 'Primary' },
    ]);
    expect(text()).toContain('Editing Brand from Brand team');

    button('Save to library').click();
    await flush();
    expect(fieldByLabel('Dictionary name', openDialog()).value).toBe('Brand');
    expect(openDialog().textContent).toContain('Saving updates Brand');
    await submitDialog();

    expect(writes()).toEqual([
      {
        key: 'PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_brand',
        data: { name: 'Brand', description: '', tokens: { color: { primary: { $value: '#2f5ea8', $type: 'color', $description: 'Primary' } } } },
      },
    ]);
    expect(text()).toContain('Saved changes to Brand.');
  });

  it('saves a copy of a dictionary the user can only read', async () => {
    await open('/tokens/studio?load=res_shared');
    expect(text()).toContain('saving makes a copy');
    button('Save to library').click();
    await flush();
    await submitDialog();
    expect(writes().map((w) => w.key)).toEqual(['POST /api/v1/workspaces/ws_a/resources/style-dictionaries']);
    expect(writes()[0].data.name).toBe('Shared');
  });

  it('says so when a dictionary is missing, and when the save fails', async () => {
    await open('/tokens/studio?load=res_gone');
    expect(text()).toContain('That style dictionary was not found');
    page.unmount();

    responses['PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_brand'] = fail(403, 'You need the editor role');
    await open('/tokens/studio?load=res_brand');
    button('Save to library').click();
    await flush();
    await submitDialog();
    expect(openDialog().textContent).toContain('You need the editor role');
  });

  it('tells people without an editable workspace that they cannot save', async () => {
    responses['GET /api/v1/workspaces'] = [{ id: 'ws_b', name: 'Platform team', effectiveRole: 'viewer' }];
    await open();
    page.state.tokens.push({ id: 'x', name: 'color.x', $type: 'color', $value: '#000000' });
    await flush();
    button('Save to library').click();
    await flush();
    expect(openDialog().textContent).toContain('You need editor access to a workspace');
    expect(button('Save to library', openDialog()).disabled).toBe(true);
  });
});

describe('AI tokens', () => {
  const open = async (path = '/tokens/ai-builder') => {
    page = await mountView(AITokenBuilder, { path });
    await flush();
  };

  it('is a manual builder: suggestions fill a name, never a value', async () => {
    await open();
    expect(document.querySelector('h1').textContent).toContain('AI tokens');
    expect(page.state.tokens).toEqual([]);
    page.state.selectedCategory = 'confidence';
    await flush();
    [...document.querySelectorAll('.template-button')].find((b) => b.textContent.includes('ai.confidence.color.high')).click();
    await flush();
    expect(fieldByLabel('Token name', openDialog()).value).toBe('color.high');
    expect(fieldByLabel('Value', openDialog()).value).toBe('');
  });

  it('opens a dictionary with ?load, files tokens under their category, and updates it', async () => {
    await open('/tokens/ai-builder?load=res_ai');
    expect(page.state.tokens.map((t) => [t.name, t.aiCategory])).toEqual([['ai.confidence.color.high', 'confidence']]);
    button('Save to library').click();
    await flush();
    await submitDialog();
    expect(writes()).toEqual([
      {
        key: 'PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_ai',
        data: { name: 'Assistant', description: '', tokens: { ai: { confidence: { color: { high: { $value: '#1a7f37', $type: 'color' } } } } } },
      },
    ]);
  });

  it('puts human-AI teaming suggestions under one prefix', async () => {
    await open();
    page.state.selectedCategory = 'human-ai-teaming';
    await flush();
    const names = [...document.querySelectorAll('.template-button code')].map((el) => el.textContent.trim());
    expect(names).toContain('ai.teaming.hitl.requiredIndicator.color');
    expect(names.every((name) => name.startsWith('ai.teaming.') && !name.includes('teaming.ai.'))).toBe(true);
  });
});
