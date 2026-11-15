// Eero: replies come from POST /ai/chat (Claude), shown with their related
// components and tokens; without a Claude API key the greeting and replies say
// Eero isn't configured instead of answering.
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import EeroChatbot from '../src/components/EeroChatbot.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('@adamstavely/trenchcoat/embed-widget', () => ({}));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  calls = [];
  responses = {};
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
  page = await mountView({ render: () => h(EeroChatbot, { open: true }) });
  await flush();
  return document.querySelector('tc-embed-widget');
};

const send = async (widget, text) => {
  widget.dispatchEvent(new CustomEvent('tc-send', { detail: { text }, cancelable: true }));
  await flush();
};

describe('Eero', () => {
  it('sends the conversation and shows Claude’s reply with what it relates to', async () => {
    responses['GET /api/v1/ai/status'] = { configured: true, model: 'claude-opus-5-5' };
    responses['POST /api/v1/ai/chat'] = {
      response: 'Button has **three** variants.',
      suggestions: ['What sizes are there?'],
      relatedComponents: ['Button'],
      relatedTokens: ['color.button.primary'],
      model: 'claude-opus-5-5',
    };
    const widget = await open();
    expect(widget.getAttribute('greeting')).toMatch(/^Hi! I'm Eero/);

    await send(widget, 'Which button variants are there?');

    expect(calls.find((c) => c.key === 'POST /api/v1/ai/chat').data).toEqual({
      message: 'Which button variants are there?',
      conversationHistory: [{ role: 'user', content: 'Which button variants are there?' }],
    });
    const [question, answer] = widget.messages;
    expect(question).toMatchObject({ from: 'visitor', text: 'Which button variants are there?' });
    expect(answer.from).toBe('assistant');
    expect(answer.text).toContain('Button has three variants.');
    expect(answer.text).toContain('Related components: Button');
    expect(answer.text).toContain('Related tokens: color.button.primary');
    expect(answer.text).toContain('• What sizes are there?');
  });

  it('says it is not configured when the backend has no Claude API key', async () => {
    responses['GET /api/v1/ai/status'] = { configured: false, model: 'claude-opus-5-5' };
    responses['POST /api/v1/ai/chat'] = fail(503, 'Eero is not configured. Set ANTHROPIC_API_KEY on the backend.');
    const widget = await open();
    expect(widget.getAttribute('greeting')).toMatch(/isn't configured/);

    await send(widget, 'Hello?');
    expect(widget.messages.at(-1)).toMatchObject({ from: 'assistant', text: 'Eero is not configured. Set ANTHROPIC_API_KEY on the backend.' });
  });

  it('passes on a rate limit message, and hides unexpected errors', async () => {
    responses['GET /api/v1/ai/status'] = { configured: true, model: 'claude-opus-5-5' };
    responses['POST /api/v1/ai/chat'] = fail(429, 'You can ask the AI assistant 10 times a minute. Try again in 30 seconds.');
    const widget = await open();
    await send(widget, 'One more?');
    expect(widget.messages.at(-1).text).toBe('You can ask the AI assistant 10 times a minute. Try again in 30 seconds.');

    responses['POST /api/v1/ai/chat'] = fail(500, 'TypeError at line 12');
    await send(widget, 'And again?');
    expect(widget.messages.at(-1).text).toBe('Sorry, something went wrong. Please try again.');
  });
});
