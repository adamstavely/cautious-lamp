// AI suggestions: the pasted code goes to POST /ai/suggestions and the page
// shows Claude's suggestions with the real components and tokens they name,
// says which invented names were left out, shows no match scores, and says
// when the backend has no Claude API key.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import AISuggestions from '../src/views/AISuggestions.vue';
import { mountView } from './helpers/mountView.js';

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

const RESULT = {
  summary: 'A hand-made button with a hard-coded colour.',
  suggestions: [
    {
      id: 's1',
      title: 'Use the Button component',
      description: 'The markup re-creates Button.',
      severity: 'warning',
      category: 'components',
      components: [{ id: 'button', name: 'Button' }],
      tokens: [{ name: 'color.button.primary', value: '{color.primary.500}' }],
      fix: '<Button variant="primary">Save</Button>',
    },
    {
      id: 's2',
      title: 'Name the icon button',
      description: 'It has no accessible name.',
      severity: 'error',
      category: 'accessibility',
      components: [],
      tokens: [],
      fix: '',
    },
  ],
  removedReferences: ['super-button'],
  model: 'claude-opus-5-5',
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  calls = [];
  responses = { 'GET /api/v1/ai/status': { configured: true, model: 'claude-opus-5-5' } };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
    const data = responses[key];
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
});

const open = async () => {
  page = await mountView(AISuggestions, { path: '/ai-suggestions' });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === label);

describe('AI suggestions', () => {
  it('sends the code and focus, and shows the suggestions Claude returned', async () => {
    responses['POST /api/v1/ai/suggestions'] = RESULT;
    const { state } = await open();
    expect(text()).toContain('No suggestions yet');
    expect(button('Get suggestions').disabled).toBe(true);

    state.code = '<button style="background:#4f46e5">Save</button>';
    state.focus = 'components';
    await flush();
    button('Get suggestions').click();
    await flush();

    expect(calls.find((c) => c.key === 'POST /api/v1/ai/suggestions').data).toEqual({
      code: '<button style="background:#4f46e5">Save</button>',
      focus: 'components',
    });
    expect(text()).toContain('A hand-made button with a hard-coded colour.');
    expect(text()).toContain('Use the Button component');
    expect(text()).toContain('color.button.primary');
    expect(text()).toContain('<Button variant="primary">Save</Button>');
    expect(text()).toContain('Name the icon button');
    expect(text()).toContain("Left out a name that isn't in the design system: super-button.");
    expect(text()).toContain('Written by claude-opus-5-5');
    expect(text()).not.toMatch(/match/i);
  });

  it('says when AI suggestions are not configured, and does not send', async () => {
    responses['GET /api/v1/ai/status'] = { configured: false, model: 'claude-opus-5-5' };
    const { state } = await open();
    expect(text()).toContain("AI suggestions aren't configured");
    expect(text()).toContain('ANTHROPIC_API_KEY');

    state.code = '<div>Hi</div>';
    await flush();
    expect(button('Get suggestions').disabled).toBe(true);
    expect(calls.some((c) => c.key === 'POST /api/v1/ai/suggestions')).toBe(false);
  });

  it('shows the not-configured state when the route says so', async () => {
    responses['GET /api/v1/ai/status'] = fail(500, 'down');
    responses['POST /api/v1/ai/suggestions'] = fail(503, 'AI suggestions is not configured. Set ANTHROPIC_API_KEY on the backend.');
    const { state } = await open();
    state.code = '<div>Hi</div>';
    await flush();
    button('Get suggestions').click();
    await flush();

    expect(text()).toContain('AI suggestions is not configured. Set ANTHROPIC_API_KEY on the backend.');
    expect(text()).toContain("AI suggestions aren't configured");
    expect(button('Get suggestions').disabled).toBe(true);
  });

  it('caps the pasted code at 20,000 characters', async () => {
    const { state } = await open();
    state.code = 'x'.repeat(20001);
    await flush();
    expect(text()).toContain('Paste at most 20,000 characters.');
    expect(button('Get suggestions').disabled).toBe(true);
  });

  it('says so when there is nothing to change', async () => {
    responses['POST /api/v1/ai/suggestions'] = { summary: 'Looks good.', suggestions: [], removedReferences: [], model: 'claude-opus-5-5' };
    const { state } = await open();
    state.code = '<Button>Save</Button>';
    await flush();
    button('Get suggestions').click();
    await flush();
    expect(text()).toContain('Nothing to change');
  });
});
