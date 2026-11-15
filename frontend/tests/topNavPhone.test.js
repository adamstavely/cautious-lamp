// The top bar fits a phone: search sits behind a button and opens over the bar,
// secondary links move into the account menu, menus span the screen below sm,
// and the dead "Live chat" and "Switch app" buttons are gone. (jsdom has no
// layout; the widths themselves were checked in a browser at 320, 375 and 390px.)
import { nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import TopNav from '../src/components/TopNav.vue';
import { mountView } from './helpers/mountView.js';
import { readSource } from './helpers/appRoutes.js';

vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ user: ref({ id: 'usr_1', name: 'Ann Lee', email: 'ann@example.com' }), initials: ref('AL'), logout: async () => {} }),
}));

const originalAdapter = apiClient.defaults.adapter;
let page;

beforeEach(async () => {
  apiClient.defaults.adapter = async (config) => ({ status: 200, statusText: 'OK', headers: {}, config, data: [] });
  page = await mountView(TopNav, { routes: [{ path: '/feedback', component: { render: () => null } }, { path: '/components/composition', component: { render: () => null } }] });
});

afterEach(() => {
  page.unmount();
  apiClient.defaults.adapter = originalAdapter;
});

const el = () => page.app._container;

describe('TopNav on a phone', () => {
  it('has no dead buttons', () => {
    const labels = [...el().querySelectorAll('button, a')].map((b) => b.getAttribute('aria-label') || b.textContent.trim());
    expect(labels).not.toContain('Live Chat');
    expect(labels).not.toContain('Switch application');
  });

  it('opens the search over the bar from a button, focused, and closes it again', async () => {
    const area = el().querySelector('.search-area');
    expect(area.classList.contains('search-area-open')).toBe(false);
    const button = el().querySelector('button[aria-label="Search"]');
    expect(button.classList.contains('phone-only')).toBe(true);

    button.click();
    await nextTick();
    await nextTick();
    expect(area.classList.contains('search-area-open')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(el().querySelector('input[type="search"]'));

    el().querySelector('button[aria-label="Close search"]').click();
    await nextTick();
    await nextTick();
    expect(area.classList.contains('search-area-open')).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('keeps roadmap and feedback reachable: a wide-screen icon and an account menu item', async () => {
    expect(el().querySelector('a[href="/feedback"]').classList.contains('wide-only')).toBe(true);
    el().querySelector('#user-menu-button').click();
    await nextTick();
    await nextTick();
    const item = [...el().querySelectorAll('[role="menuitem"]')].find((i) => i.textContent.includes('Roadmap and feedback'));
    item.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.router.currentRoute.value.path).toBe('/feedback');
  });

  it('searches the generated index', async () => {
    page.state.searchQuery = 'composition';
    await page.state.performSearch();
    await nextTick();
    const results = [...el().querySelectorAll('[role="option"]')].map((a) => a.getAttribute('href'));
    expect(results).toContain('/components/composition');
  });

  it('lays the bar out for 320px and up', () => {
    const css = readSource('src/components/TopNav.vue');
    // Search hidden until opened below sm; phone menus span the screen; the side nav narrows
    expect(css).toMatch(/\.search-area \{\s*@apply hidden sm:flex/);
    expect(css).toMatch(/\.popover-end \{\s*@apply fixed left-2 right-2 top-16 sm:absolute/);
    expect(css).toMatch(/\.account-menu \{\s*@apply fixed left-2 right-2 top-16 sm:absolute/);
    expect(readSource('src/components/Sidebar.vue')).toMatch(/w-16 sm:w-24/);
  });
});
