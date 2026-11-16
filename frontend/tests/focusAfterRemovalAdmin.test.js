// Admin pages keep keyboard focus when the control that had it goes away
// (WCAG 2.4.3): a created API key's form is replaced by the key, an inline
// Delete is swapped for Confirm delete, and a deleted row takes its button
// with it.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccessibilityReports from '../src/views/AccessibilityReports.vue';
import ApiKeys from '../src/views/ApiKeys.vue';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));
vi.mock('jspdf', () => ({ default: class {} }));

const myPermissions = ['admin:governance', 'token:view'];
vi.mock('../src/composables/useAuth.js', async () => {
  const { computed } = await import('vue');
  return {
    useAuth: () => ({
      hasPermission: (p) => myPermissions.includes(p),
      permissions: computed(() => myPermissions),
      user: computed(() => ({ id: 'usr_admin', permissions: myPermissions })),
    }),
  };
});

let api;
let page;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  page?.unmount();
  page = null;
  api?.restore();
  api = null;
  vi.restoreAllMocks();
});

// Vue ignores a click in the same millisecond its listener was attached (UiButton's
// capture listener marks the event first), so let freshly rendered buttons age
const settle = async () => {
  await flush();
  await new Promise((resolve) => setTimeout(resolve, 2));
};
// Matched by the text shown: row buttons add the item's name for screen readers in a .sr-only span
const visibleText = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('.sr-only').forEach((hidden) => hidden.remove());
  return copy.textContent.trim();
};
const button = (label) => [...document.querySelectorAll('button')].find((el) => visibleText(el) === label);

describe('API keys', () => {
  const KEYS = [
    { id: 'key_' + 'a'.repeat(32), name: 'First', createdAt: '2026-11-02T10:00:00.000Z', revoked: false },
    { id: 'key_' + 'b'.repeat(32), name: 'Second', createdAt: '2026-11-01T10:00:00.000Z', revoked: false },
  ];
  let keys;

  beforeEach(() => {
    keys = structuredClone(KEYS);
    api = stubApi({
      'GET /api/v1/auth/api-keys': () => keys,
      'POST /api/v1/auth/api-keys': (body) => ({
        apiKey: 'dsk_' + 'x'.repeat(43),
        metadata: { id: 'key_' + 'e'.repeat(32), name: body.name, createdAt: '2026-11-15T10:00:00.000Z', revoked: false },
      }),
      [`POST /api/v1/auth/api-keys/key_${'a'.repeat(32)}/revoke`]: () => {
        keys[0].revoked = true;
        return { message: 'API key revoked successfully' };
      },
    });
  });

  it('moves focus to the revealed key when the form is replaced by it', async () => {
    page = await mountView(ApiKeys, { path: '/admin/api-keys' });
    await flush();
    page.state.openCreate();
    await flush();
    page.state.form.name = 'Release pipeline';
    await page.state.submit();
    await flush();
    const field = document.querySelector('#api-key-value');
    expect(field).toBeTruthy();
    expect(document.activeElement).toBe(field);
  });

  it('focuses the next key once a key is revoked', async () => {
    page = await mountView(ApiKeys, { path: '/admin/api-keys' });
    await flush();
    page.state.askRevoke(keys[0]);
    await flush();
    await page.state.revoke();
    await flush();
    expect(document.activeElement).toBe(document.querySelector('button[aria-label="Revoke Second"]'));
  });
});

describe('Accessibility reports: inline Delete → Confirm delete', () => {
  const report = (id, name) => ({ id, applicationId: 'app-1', applicationName: name, generatedAt: '2026-11-14T10:00:00.000Z', source: 'url', complianceScore: 80, totalIssues: 2 });
  let deleteAnswer;

  beforeEach(() => {
    deleteAnswer = { ok: true };
    api = stubApi({
      'GET /api/v1/applications': { applications: [{ id: 'app-1', name: 'App one' }] },
      'GET /api/v1/accessibility-reports/reports': [report('report-1', 'First app'), report('report-2', 'Second app')],
      'GET /api/v1/accessibility-reports/schedules': [],
      'GET /api/v1/accessibility-reports/slas': [],
      'DELETE /api/v1/accessibility-reports/reports/report-1': () => deleteAnswer,
    });
  });

  const openHistory = async () => {
    page = await mountView(AccessibilityReports);
    await settle();
    page.state.activeTab = 'reports';
    await settle();
  };
  const deleteButtons = () => [...document.querySelectorAll('button')].filter((el) => visibleText(el) === 'Delete');

  it('keeps focus on the Confirm delete button that replaces Delete', async () => {
    await openHistory();
    const first = deleteButtons()[0];
    first.focus();
    first.click();
    await settle();
    const confirm = button('Confirm delete');
    expect(confirm).toBeTruthy();
    expect(document.activeElement).toBe(confirm);
  });

  it('focuses the next report once the report is deleted', async () => {
    await openHistory();
    deleteButtons()[0].click();
    await settle();
    button('Confirm delete').click();
    await settle();
    const remaining = deleteButtons();
    expect(remaining).toHaveLength(1);
    expect(document.activeElement).toBe(remaining[0]);
  });

  it('returns focus to Delete when the delete fails', async () => {
    deleteAnswer = fail(503, 'Elasticsearch is unavailable');
    await openHistory();
    deleteButtons()[0].click();
    await settle();
    button('Confirm delete').click();
    await settle();
    expect(button('Confirm delete')).toBeUndefined();
    expect(document.activeElement).toBe(deleteButtons()[0]);
  });
});
