// Visual regression build notifications: the project's settings panel saves
// recipients and URLs on the server (URLs never shown back), turns channels on
// and off, sends a test per channel, lists recent deliveries, and says when
// the server can't send email or the viewer can't change the settings.
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VrNotificationSettings from '../src/components/visual-regression/VrNotificationSettings.vue';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

const PATH = '/api/v1/visual-regression/projects/vr-1/notifications';

const OVERVIEW = {
  channels: [
    { type: 'email', enabled: true, configured: true, recipients: ['qa@example.com'] },
    { type: 'slack', enabled: false, configured: false },
    { type: 'teams', enabled: false, configured: false },
    { type: 'webhook', enabled: true, configured: true, hasSecret: true },
  ],
  availability: { email: { available: true }, slack: { available: true }, teams: { available: true }, webhook: { available: true } },
  attempts: [
    {
      id: 'dlv_1',
      channel: 'webhook',
      target: 'ci.example.com',
      title: 'Visual regression: Web found 2 changed screenshots',
      status: 'sent',
      tries: [{ ok: true }],
      test: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

let api;
let page;

const mount = async () => {
  page = await mountView({ render: () => h(VrNotificationSettings, { projectId: 'vr-1' }) });
  await flush();
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label) => [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === label || el.getAttribute('aria-label') === label);
const toggle = (label) => [...document.querySelectorAll('[role="switch"]')].find((el) => el.textContent.includes(label));
const type = async (id, value) => {
  const el = document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new Event('input'));
  await flush();
};
const calls = (key) => api.calls.filter((c) => c.key === key);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  page?.unmount();
  page = null;
  api?.restore();
  vi.restoreAllMocks();
});

describe('Visual regression build notifications', () => {
  it('shows each channel and the recent deliveries from the server', async () => {
    api = stubApi({ [`GET ${PATH}`]: structuredClone(OVERVIEW) });
    await mount();
    const body = text();
    expect(body).toContain('Send build results');
    expect(document.getElementById('vr-email-recipients').value).toBe('qa@example.com');
    expect(toggle('Email').getAttribute('aria-checked')).toBe('true');
    expect(toggle('Slack').disabled).toBe(true);
    expect(body).toContain('No URL saved');
    expect(body).toContain('ci.example.com');
    expect(body).toContain('Visual regression: Web found 2 changed screenshots');
    expect(body).not.toContain("isn't set up on this server");
  });

  it('saves a Slack URL without showing it back, and a webhook shows its new secret once', async () => {
    api = stubApi({
      [`GET ${PATH}`]: structuredClone(OVERVIEW),
      [`POST ${PATH}`]: (data) =>
        data.type === 'webhook'
          ? { type: 'webhook', enabled: true, configured: true, hasSecret: true, secret: `whsec_${'b'.repeat(64)}` }
          : { type: data.type, enabled: true, configured: true },
    });
    await mount();
    await type('vr-slack-url', 'https://hooks.slack.com/services/T/B/token');
    document.getElementById('vr-slack-url').closest('form').querySelector('button[type="submit"]').click();
    await flush();
    expect(calls(`POST ${PATH}`)[0].data).toEqual({ type: 'slack', url: 'https://hooks.slack.com/services/T/B/token' });
    expect(document.getElementById('vr-slack-url').value).toBe('');
    expect(toggle('Slack').getAttribute('aria-checked')).toBe('true');
    expect(text()).not.toContain('T/B/token');

    await type('vr-webhook-url', 'https://ci.example.com/new-hook');
    document.getElementById('vr-webhook-url').closest('form').querySelector('button[type="submit"]').click();
    await flush();
    expect(document.getElementById('vr-webhook-signing-secret').value).toBe(`whsec_${'b'.repeat(64)}`);
  });

  it('saves email recipients and turns a channel off', async () => {
    api = stubApi({
      [`GET ${PATH}`]: structuredClone(OVERVIEW),
      [`POST ${PATH}`]: (data) =>
        data.type === 'email'
          ? { type: 'email', enabled: true, configured: true, recipients: data.recipients }
          : { type: data.type, enabled: data.enabled, configured: true, hasSecret: true },
    });
    await mount();
    await type('vr-email-recipients', 'qa@example.com, design@example.com');
    document.getElementById('vr-email-recipients').closest('form').querySelector('button[type="submit"]').click();
    await flush();
    expect(calls(`POST ${PATH}`)[0].data).toEqual({ type: 'email', recipients: ['qa@example.com', 'design@example.com'] });

    toggle('Webhook').click();
    await flush();
    expect(calls(`POST ${PATH}`)[1].data).toEqual({ type: 'webhook', enabled: false });
    expect(toggle('Webhook').getAttribute('aria-checked')).toBe('false');
  });

  it('sends a test and adds the recorded attempt to the list', async () => {
    api = stubApi({
      [`GET ${PATH}`]: structuredClone(OVERVIEW),
      [`POST ${PATH}/webhook/test`]: {
        id: 'dlv_2',
        channel: 'webhook',
        target: 'ci.example.com',
        title: 'Test notification for Web',
        status: 'failed',
        error: 'HTTP 404',
        tries: [{ ok: false }],
        test: true,
        createdAt: new Date().toISOString(),
      },
    });
    await mount();
    button('Send test to Webhook').click();
    await flush();
    expect(calls(`POST ${PATH}/webhook/test`)).toHaveLength(1);
    expect(text()).toContain("The test to Webhook wasn't delivered: HTTP 404");
    expect(text()).toContain('Test notification for Web');
    expect(button('Send test to Slack').disabled).toBe(true);
  });

  it("says when the server can't send email", async () => {
    const overview = structuredClone(OVERVIEW);
    overview.availability.email = { available: false, reason: "Email isn't set up on this server: SMTP_FROM is not set." };
    api = stubApi({ [`GET ${PATH}`]: overview });
    await mount();
    expect(text()).toContain("Email isn't set up on this server");
    expect(text()).toContain('SMTP_FROM is not set');
    expect(button('Send test to Email').disabled).toBe(true);
  });

  it('tells viewers who cannot edit the project that only editors see these settings', async () => {
    api = stubApi({ [`GET ${PATH}`]: fail(403, 'Forbidden resource') });
    await mount();
    expect(text()).toContain('Only people who can edit this project');
    expect(document.getElementById('vr-slack-url')).toBeNull();
  });
});
