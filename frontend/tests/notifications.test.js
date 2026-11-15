// Notifications: the top-nav bell shows the signed-in person's own
// notifications from the API (unread count, mark read, mark all read, empty
// state) with no made-up entries, and the Change notifications page lists
// them, shows the real changelog, and saves following and preferences on the
// server, and sets up delivery to email, Slack, Teams and webhooks: URLs are
// saved (never shown back), each channel has a test send, recent deliveries
// are listed, and a channel the server can't send by says so.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import TopNav from '../src/components/TopNav.vue';
import ChangeNotifications from '../src/views/ChangeNotifications.vue';
import { resetNotifications } from '../src/composables/useNotifications.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({
    user: { value: { id: 'usr_1', name: 'Ann', email: 'ann@example.com' } },
    initials: { value: 'A' },
    logout: async () => {},
    hasPermission: () => true,
  }),
}));
vi.mock('../src/router/rbacGuards.js', () => ({ canAccessPath: () => true }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
  // Router navigations settle on a later task
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const NOTIFICATIONS = [
  {
    id: 'ntf_1',
    userId: 'usr_1',
    type: 'design-system-change',
    title: 'Token "color.brand" removed',
    message: 'Breaking change. By Bo.',
    link: '/admin/workspaces/ws_1',
    read: false,
    breaking: true,
    createdAt: minutesAgo(5),
  },
  {
    id: 'ntf_2',
    userId: 'usr_1',
    type: 'design-system-change',
    title: 'Component "Card" updated',
    message: 'Variant "dense" saved. By Bo.',
    link: '/components',
    read: false,
    breaking: false,
    createdAt: minutesAgo(90),
  },
  { id: 'ntf_3', userId: 'usr_1', type: 'request-updated', title: 'Request "Tabs" approved', message: 'Approved', read: true, createdAt: minutesAgo(3000) },
];

const SETTINGS = {
  subscriptions: [{ id: 'sub_1', type: 'component', entityId: 'card', entityName: 'Card', createdAt: minutesAgo(10) }],
  preferences: {
    inApp: true,
    actions: ['created', 'updated', 'deprecated', 'deleted', 'status-changed'],
    breakingOnly: false,
    channels: { email: false, slack: false, teams: false, webhook: false },
  },
  targets: { slack: { configured: false }, teams: { configured: false }, webhook: { configured: false } },
};

const DELIVERY = {
  channels: {
    email: { available: false, reason: "Email isn't set up on this server: SMTP_URL or SMTP_HOST is not set." },
    slack: { available: true },
    teams: { available: true },
    webhook: { available: true },
  },
  attempts: [
    {
      id: 'dlv_1',
      channel: 'webhook',
      target: 'hooks.example.com',
      title: 'Component "Card" updated',
      status: 'failed',
      error: 'HTTP 500',
      tries: [{}, {}, {}],
      test: false,
      createdAt: minutesAgo(30),
    },
  ],
};

const CHANGELOG = {
  version: null,
  entries: [
    {
      id: 'chg_1',
      type: 'token',
      entityId: 'res_9',
      entityName: 'color.brand',
      action: 'deleted',
      breaking: true,
      changes: [],
      author: 'Bo',
      audience: ['ws_1'],
      link: '/admin/workspaces/ws_1',
      createdAt: minutesAgo(5),
    },
    {
      id: 'chg_2',
      type: 'component',
      entityId: 'card',
      entityName: 'Card',
      action: 'updated',
      breaking: false,
      changes: [{ field: 'variants', description: 'Variant "dense" saved' }],
      author: 'Bo',
      audience: [],
      createdAt: minutesAgo(90),
    },
  ],
  summary: { totalChanges: 2, breakingChanges: 1, componentsChanged: 1, tokensChanged: 1, patternsChanged: 0, newItems: 0, deprecations: 0 },
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

const fail = (status, message) => Object.assign(new Error(message ?? `HTTP ${status}`), { response: { status, data: message ? { message } : {} } });

beforeEach(() => {
  resetNotifications();
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // TopNav's search uses fetch; nothing here needs it to answer
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
  responses = {
    'GET /api/v1/notifications': structuredClone(NOTIFICATIONS),
    'PUT /api/v1/notifications/read-all': { success: true, count: 2 },
    'PUT /api/v1/notifications/ntf_1/read': { ...NOTIFICATIONS[0], read: true },
    'PUT /api/v1/notifications/ntf_2/read': { ...NOTIFICATIONS[1], read: true },
    'DELETE /api/v1/notifications/ntf_3': '',
    'GET /api/v1/notifications/settings': structuredClone(SETTINGS),
    'GET /api/v1/notifications/delivery': structuredClone(DELIVERY),
    'PUT /api/v1/notifications/preferences': (config) => {
      const patch = JSON.parse(config.data);
      return { ...SETTINGS, preferences: { ...SETTINGS.preferences, ...patch, channels: { ...SETTINGS.preferences.channels, ...(patch.channels ?? {}) } } };
    },
    'POST /api/v1/notifications/subscriptions': (config) => ({ id: 'sub_new', createdAt: minutesAgo(0), ...JSON.parse(config.data) }),
    'DELETE /api/v1/notifications/subscriptions/sub_1': '',
    'GET /api/v1/changelog/aggregated': structuredClone(CHANGELOG),
    'GET /api/v1/components': { components: [{ id: 'button', name: 'Button' }, { id: 'card', name: 'Card' }] },
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, params: config.params, data: config.data ? JSON.parse(config.data) : undefined });
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
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const text = (root = document.body) => root.textContent.replace(/\s+/g, ' ');
const button = (label, root = document.body) =>
  [...root.querySelectorAll('button, a')].find((el) => el.textContent.trim() === label || el.getAttribute('aria-label') === label);
const called = (key) => calls.filter((c) => c.key === key);

describe('Top-nav notifications bell', () => {
  const bell = () => document.querySelector('button[title="Notifications"]');
  const openBell = async () => {
    page = await mountView(TopNav, { path: '/' });
    await flush();
    bell().click();
    await flush();
    return document.getElementById('notifications-panel');
  };

  it('shows the unread count from the API and the signed-in person\'s notifications, nothing made up', async () => {
    page = await mountView(TopNav, { path: '/' });
    await flush();
    expect(bell().getAttribute('aria-label')).toBe('Notifications, 2 unread');
    expect(bell().textContent).toContain('2');

    bell().click();
    await flush();
    const panel = document.getElementById('notifications-panel');
    expect(text(panel)).toContain('Token "color.brand" removed');
    expect(text(panel)).toContain('Component "Card" updated');
    expect(text(panel)).toContain('Breaking');
    expect(text(document.body)).not.toContain('Button v2.0.0');
    expect(text(document.body)).not.toMatch(/Activity/);
  });

  it('marks everything read', async () => {
    const panel = await openBell();
    button('Mark all read', panel).click();
    await flush();
    expect(called('PUT /api/v1/notifications/read-all')).toHaveLength(1);
    expect(bell().getAttribute('aria-label')).toBe('Notifications');
    expect(button('Mark all read')).toBeUndefined();
  });

  it('marks a notification read when opened and goes to its link', async () => {
    const panel = await openBell();
    const row = [...panel.querySelectorAll('li button')].find((el) => el.textContent.includes('Component "Card" updated'));
    row.click();
    await flush();
    expect(called('PUT /api/v1/notifications/ntf_2/read')).toHaveLength(1);
    expect(page.router.currentRoute.value.path).toBe('/components');
    expect(bell().getAttribute('aria-label')).toBe('Notifications, 1 unread');
  });

  it('shows an empty state when there are none', async () => {
    responses['GET /api/v1/notifications'] = [];
    const panel = await openBell();
    expect(bell().getAttribute('aria-label')).toBe('Notifications');
    expect(text(panel)).toContain('No notifications');
    expect(panel.querySelectorAll('li')).toHaveLength(0);
  });

  it('says so when notifications can\'t be loaded', async () => {
    responses['GET /api/v1/notifications'] = fail(503, 'Storage is unavailable');
    const panel = await openBell();
    expect(text(panel)).toContain("Notifications couldn't be loaded");
  });
});

describe('Change notifications page', () => {
  const open = async () => {
    page = await mountView(ChangeNotifications, { path: '/notifications' });
    await flush();
  };
  const tab = (label) => [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.includes(label));

  it('lists the person\'s notifications and marks them read on the server', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1').textContent).toContain('Change notifications');
    const body = text();
    expect(body).toContain('Token "color.brand" removed');
    expect(body).toContain('Request "Tabs" approved');
    expect(body).not.toContain('Modal Component');

    button('Mark “Component "Card" updated” read').click();
    await flush();
    expect(called('PUT /api/v1/notifications/ntf_2/read')).toHaveLength(1);

    button('Delete “Request "Tabs" approved”').click();
    await flush();
    expect(called('DELETE /api/v1/notifications/ntf_3')).toHaveLength(1);
    expect(text()).not.toContain('Request "Tabs" approved');
  });

  it('shows an empty state with no notifications', async () => {
    responses['GET /api/v1/notifications'] = [];
    await open();
    expect(text()).toContain('No notifications yet');
  });

  it('shows recorded changes from the changelog with filters, and follows an item', async () => {
    await open();
    tab('Recent changes').click();
    await flush();
    const body = text();
    expect(body).toContain('color.brand');
    expect(body).toContain('Removed');
    expect(body).toContain('Variant "dense" saved');
    expect(body).toContain('by Bo');

    // Card is already followed; the token isn't
    expect(button('Unfollow Card')).toBeDefined();
    button('Follow color.brand').click();
    await flush();
    expect(called('POST /api/v1/notifications/subscriptions')[0].data).toEqual({ type: 'token', entityId: 'res_9', entityName: 'color.brand' });
    expect(button('Unfollow color.brand')).toBeDefined();

    const breakingSwitch = [...document.querySelectorAll('[role="switch"]')].find((el) => el.textContent.includes('Breaking changes only'));
    breakingSwitch.click();
    await flush();
    expect(called('GET /api/v1/changelog/aggregated').at(-1).params).toEqual({ breakingOnly: 'true' });
  });

  it('saves following and preferences on the server', async () => {
    await open();
    tab('Following and preferences').click();
    await flush();
    const body = text();
    expect(body).toContain('Card');
    expect(body).not.toContain("Delivery isn't set up yet");

    button('Unfollow Card').click();
    await flush();
    expect(called('DELETE /api/v1/notifications/subscriptions/sub_1')).toHaveLength(1);

    const select = document.getElementById('follow-item');
    select.selectedIndex = [...select.options].findIndex((o) => o.textContent.trim() === 'Button');
    select.dispatchEvent(new Event('change'));
    await flush();
    button('Follow').click();
    await flush();
    expect(called('POST /api/v1/notifications/subscriptions')[0].data).toEqual({ type: 'component', entityId: 'button', entityName: 'Button' });

    const checkbox = (label) => [...document.querySelectorAll('input[type="checkbox"]')].find((el) => el.closest('label')?.textContent.includes(label));
    checkbox('Removed').click();
    await flush();
    expect(called('PUT /api/v1/notifications/preferences').at(-1).data).toEqual({ actions: ['created', 'updated', 'deprecated', 'status-changed'] });
  });

  describe('delivery to email, Slack, Teams and webhooks', () => {
    const openSettings = async () => {
      await open();
      tab('Following and preferences').click();
      await flush();
    };
    const toggle = (label) => [...document.querySelectorAll('[role="switch"]')].find((el) => el.textContent.includes(label));
    const input = (id) => document.getElementById(id);
    const type = async (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input'));
      await flush();
    };

    it('says honestly that email is not set up on the server, and lists recent deliveries with their status', async () => {
      await openSettings();
      const body = text();
      expect(body).toContain("Email isn't set up on this server");
      expect(body).toContain('SMTP_URL or SMTP_HOST is not set');
      expect(toggle('Email').disabled).toBe(true);
      expect(button('Send test to Email').disabled).toBe(true);
      // Slack works but needs a URL first
      expect(body).toContain('No URL saved');
      expect(toggle('Slack').disabled).toBe(true);
      expect(button('Send test to Slack').disabled).toBe(true);

      expect(body).toContain('Recent deliveries');
      expect(body).toContain('hooks.example.com');
      expect(body).toContain('Failed');
      expect(body).toContain('HTTP 500');
      expect(body).toContain('3 tries');
    });

    it('saves a Slack URL, turns Slack on and never shows the URL back', async () => {
      responses['PUT /api/v1/notifications/channels/slack'] = {
        ...SETTINGS,
        preferences: { ...SETTINGS.preferences, channels: { ...SETTINGS.preferences.channels, slack: true } },
        targets: { ...SETTINGS.targets, slack: { configured: true, savedAt: minutesAgo(0) } },
      };
      await openSettings();
      await type(input('slack-url'), 'https://hooks.slack.com/services/T1/B1/xyz');
      button('Save URL', input('slack-url').closest('form')).click();
      await flush();

      expect(called('PUT /api/v1/notifications/channels/slack')[0].data).toEqual({ url: 'https://hooks.slack.com/services/T1/B1/xyz' });
      expect(input('slack-url').value).toBe('');
      expect(input('slack-url').placeholder).toContain('Saved');
      expect(toggle('Slack').getAttribute('aria-checked')).toBe('true');
      expect(text()).not.toContain('T1/B1/xyz');
      expect(button('Send test to Slack').disabled).toBe(false);
    });

    it('shows a generated webhook secret once', async () => {
      responses['PUT /api/v1/notifications/channels/webhook'] = {
        ...SETTINGS,
        targets: { ...SETTINGS.targets, webhook: { configured: true } },
        secret: 'a'.repeat(64),
      };
      await openSettings();
      await type(input('webhook-url'), 'https://example.com/hooks/ds');
      button('Save URL', input('webhook-url').closest('form')).click();
      await flush();
      expect(called('PUT /api/v1/notifications/channels/webhook')[0].data).toEqual({ url: 'https://example.com/hooks/ds' });
      expect(input('webhook-secret-revealed').value).toBe('a'.repeat(64));
      expect(text()).toContain("it won't be shown again");
    });

    it('sends a test and shows the recorded result, including a failure', async () => {
      responses['GET /api/v1/notifications/settings'] = { ...SETTINGS, targets: { ...SETTINGS.targets, teams: { configured: true } } };
      responses['POST /api/v1/notifications/channels/teams/test'] = {
        id: 'dlv_2',
        channel: 'teams',
        target: 'contoso.webhook.office.com',
        title: 'Test notification from the design system',
        status: 'sent',
        tries: [{ ok: true }],
        test: true,
        createdAt: minutesAgo(0),
      };
      await openSettings();
      button('Send test to Microsoft Teams').click();
      await flush();
      expect(called('POST /api/v1/notifications/channels/teams/test')).toHaveLength(1);
      expect(text()).toContain('Test sent to Microsoft Teams.');
      expect(text()).toContain('contoso.webhook.office.com');
      expect(text()).toContain('Sent');

      responses['POST /api/v1/notifications/channels/teams/test'] = { ...responses['POST /api/v1/notifications/channels/teams/test'], id: 'dlv_3', status: 'refused', error: 'URLs that point to private or internal addresses are not allowed' };
      button('Send test to Microsoft Teams').click();
      await flush();
      expect(text()).toContain("The test to Microsoft Teams wasn't delivered: URLs that point to private or internal addresses are not allowed");
      expect(text()).toContain('Refused');
    });

    it('turns a ready channel on and off through preferences, and removes a saved URL', async () => {
      const withSlack = { ...SETTINGS, targets: { ...SETTINGS.targets, slack: { configured: true } } };
      responses['GET /api/v1/notifications/settings'] = withSlack;
      responses['PUT /api/v1/notifications/preferences'] = { ...withSlack, preferences: { ...SETTINGS.preferences, channels: { ...SETTINGS.preferences.channels, slack: true } } };
      responses['DELETE /api/v1/notifications/channels/slack'] = structuredClone(SETTINGS);
      await openSettings();
      toggle('Slack').click();
      await flush();
      expect(called('PUT /api/v1/notifications/preferences').at(-1).data).toEqual({ channels: { slack: true } });
      expect(toggle('Slack').getAttribute('aria-checked')).toBe('true');

      button('Remove the Slack URL').click();
      await flush();
      expect(called('DELETE /api/v1/notifications/channels/slack')).toHaveLength(1);
      expect(text()).toContain('No URL saved');
    });
  });
});
