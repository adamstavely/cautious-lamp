// Site-wide banners: each type gets its callout tone, errors interrupt and the
// rest don't, and a dismissed banner stays dismissed.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InfoBanner from '../src/components/InfoBanner.vue';
import apiClient from '../src/services/api.js';
import { mountView } from './helpers/mountView.js';

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  localStorage.clear();
  apiClient.defaults.adapter = async (config) => ({
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    data: [
      { id: 'b1', type: 'info', title: 'Maintenance', message: 'Read-only on Saturday.' },
      { id: 'b2', type: 'error', title: 'Sync failed', message: 'Figma could not be reached.' },
    ],
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
});

describe('InfoBanner', () => {
  it('shows each banner in its tone, interrupting only for errors', async () => {
    page = await mountView(InfoBanner);
    await flush();
    const callouts = [...document.querySelectorAll('.ui-callout')];
    expect(callouts.map((c) => [...c.classList].find((n) => n.startsWith('ui-callout-')))).toEqual(['ui-callout-info', 'ui-callout-danger']);
    expect(callouts.map((c) => c.getAttribute('role'))).toEqual(['status', 'alert']);
  });

  it('remembers a dismissed banner', async () => {
    page = await mountView(InfoBanner);
    await flush();
    document.querySelector('button[aria-label="Dismiss Maintenance"]').click();
    await flush();
    expect(document.querySelectorAll('.ui-callout')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('dismissedBanners'))).toEqual(['b1']);

    page.unmount();
    page = await mountView(InfoBanner);
    await flush();
    expect([...document.querySelectorAll('.ui-callout-title')].map((t) => t.textContent)).toEqual(['Sync failed']);
  });
});
