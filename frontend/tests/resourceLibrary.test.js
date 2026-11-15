// Library pages (here Country flags): items come from GET /resources/:kind across
// the user's workspaces; search and the region filter narrow them; empty and
// error states are honest; only editors of the owning workspace can add, change
// or delete, and writes go to that workspace's item routes.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import CountryFlags from '../src/views/CountryFlags.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

// jsdom has no <dialog> methods
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

const flag = (id, name, region, workspaceId, extra = {}) => ({
  id,
  kind: 'country-flags',
  name,
  region,
  url: `https://cdn.example.com/flags/${id}.svg`,
  workspaceId,
  sharedWith: [],
  isGlobal: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  updatedBy: { id: 'usr_1', name: 'Fran Flags' },
  ...extra,
});

const FLAGS = [
  flag('res_chad', 'Chad', 'Africa', 'ws_a', { countryCode: 'TD', tags: ['sahel'] }),
  flag('res_peru', 'Peru', 'Americas', 'ws_b', { countryCode: 'PE' }),
  flag('res_japan', 'Japan', 'Asia', 'ws_other', { isGlobal: true, countryCode: 'JP' }),
];

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/resources/country-flags': structuredClone(FLAGS),
    'GET /api/v1/workspaces': [
      { id: 'ws_a', name: 'Maps team', effectiveRole: 'editor' },
      { id: 'ws_b', name: 'Travel team', effectiveRole: 'viewer' },
    ],
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

const open = async () => {
  page = await mountView(CountryFlags, { path: '/design-assets/country-flags' });
  await flush();
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const cardTitles = () => [...document.querySelectorAll('.library-open')].map((el) => el.textContent.trim());
const button = (label) => [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === label);
const openDialog = () => document.querySelector('dialog[open]');
const dialogButtons = () => [...(openDialog()?.querySelectorAll('button') ?? [])].map((el) => el.textContent.trim()).filter(Boolean);
const fieldByLabel = (label, root = document) => {
  const el = [...root.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(label));
  return document.getElementById(el.getAttribute('for'));
};
const setValue = async (el, value) => {
  el.value = value;
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
  await flush();
};

describe('Country flags library', () => {
  it('lists flags from every workspace the user can read, with their source', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1').textContent).toContain('Country flags');
    expect(cardTitles()).toEqual(['Chad', 'Peru', 'Japan']);
    const body = text();
    expect(body).toContain('3 country flags');
    expect(body).toContain('Maps team');
    expect(body).toContain('Travel team');
    expect(body).toContain('Global');
    expect(body).not.toMatch(/coming soon/i);
    expect(calls.map((c) => c.key)).toEqual(expect.arrayContaining(['GET /api/v1/resources/country-flags', 'GET /api/v1/workspaces']));
  });

  it('searches and filters, and offers to clear filters when nothing matches', async () => {
    await open();
    await setValue(fieldByLabel('Search'), 'sahel');
    expect(cardTitles()).toEqual(['Chad']);
    expect(text()).toContain('1 of 3 country flags');

    await setValue(fieldByLabel('Search'), '');
    await setValue(fieldByLabel('Region'), 'Asia');
    expect(cardTitles()).toEqual(['Japan']);

    await setValue(fieldByLabel('Search'), 'peru');
    expect(cardTitles()).toEqual([]);
    expect(text()).toContain('Nothing matches');
    button('Clear filters').click();
    await flush();
    expect(cardTitles()).toEqual(['Chad', 'Peru', 'Japan']);
  });

  it('says so honestly when there are no flags, and only offers Add to editors', async () => {
    responses['GET /api/v1/resources/country-flags'] = [];
    await open();
    expect(text()).toContain('No country flags yet');
    expect(button('Add country flag')).toBeTruthy();
    page.unmount();

    responses['GET /api/v1/workspaces'] = [{ id: 'ws_b', name: 'Travel team', effectiveRole: 'viewer' }];
    await open();
    expect(text()).toContain('No country flags yet');
    expect(text()).toContain('Ask an editor of your workspace');
    expect(button('Add country flag')).toBeUndefined();
  });

  it('shows an error with a retry instead of an empty library', async () => {
    responses['GET /api/v1/resources/country-flags'] = fail(500, 'Search is unavailable');
    await open();
    expect(document.querySelector('[role="alert"]').textContent).toContain('Search is unavailable');
    expect(text()).not.toContain('No country flags yet');
    responses['GET /api/v1/resources/country-flags'] = structuredClone(FLAGS);
    button('Try again').click();
    await flush();
    expect(cardTitles()).toEqual(['Chad', 'Peru', 'Japan']);
  });

  it('lets editors change only items their workspace owns; others are read-only', async () => {
    await open();
    document.querySelector('.library-open').click(); // Chad, in ws_a where the user is an editor
    await flush();
    expect(openDialog().textContent).toContain('TD');
    expect(dialogButtons()).toEqual(expect.arrayContaining(['Edit', 'Delete']));

    responses['DELETE /api/v1/workspaces/ws_a/resources/country-flags/res_chad'] = '';
    button('Delete').click();
    await flush();
    // The confirmation opens on top of the detail
    const confirm = [...document.querySelectorAll('dialog[open]')].pop();
    expect(confirm.textContent).toContain("can't be undone");
    [...confirm.querySelectorAll('button')].find((el) => el.textContent.trim() === 'Delete').click();
    await flush();
    expect(calls.map((c) => c.key)).toContain('DELETE /api/v1/workspaces/ws_a/resources/country-flags/res_chad');
    expect(cardTitles()).toEqual(['Peru', 'Japan']);

    for (const title of ['Peru', 'Japan']) {
      [...document.querySelectorAll('.library-open')].find((el) => el.textContent.trim() === title).click();
      await flush();
      expect(dialogButtons()).not.toContain('Edit');
      expect(dialogButtons()).not.toContain('Delete');
      expect(openDialog().textContent).toContain('Read-only');
    }
  });

  it('adds a flag to the chosen workspace', async () => {
    responses['POST /api/v1/workspaces/ws_a/resources/country-flags'] = (config) => flag('res_new', JSON.parse(config.data).name, 'Europe', 'ws_a');
    await open();
    button('Add country flag').click();
    await flush();
    const form = openDialog();
    expect(fieldByLabel('Workspace', form).value).toBe('ws_a');
    await setValue(fieldByLabel('Country', form), 'France');
    await setValue(fieldByLabel('Region', form), 'Europe');
    await setValue(fieldByLabel('URL', form), 'https://cdn.example.com/flags/fr.svg');
    openDialog().querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();
    const post = calls.find((c) => c.key === 'POST /api/v1/workspaces/ws_a/resources/country-flags');
    expect(post.data).toEqual({ name: 'France', region: 'Europe', url: 'https://cdn.example.com/flags/fr.svg' });
    expect(cardTitles()[0]).toBe('France');
    expect(text()).toContain('Country Flag added.');
  });
});
