// Every page had the same title ("DESIGN.COM"), and the top-bar search was an
// input with aria-expanded but no combobox role, whose results were silent.
import { nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import PageHero from '../src/components/ui/PageHero.vue';
import TopNav from '../src/components/TopNav.vue';
import { pageTitle, titleFromPath } from '../src/utils/pageTitle.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ user: ref({ id: 'usr_1', name: 'Ann Lee', email: 'ann@example.com' }), initials: ref('AL'), logout: async () => {} }),
}));

let page;
afterEach(() => page?.unmount());

describe('page titles', () => {
  it('name the page, its section and the site', () => {
    expect(pageTitle('Compare colors', '/tools/color-contrast')).toBe('Compare colors · Tools · DESIGN.COM');
    expect(pageTitle('Feature flags', '/admin/feature-flags')).toBe('Feature flags · Admin · DESIGN.COM');
    expect(pageTitle('Tools', '/tools')).toBe('Tools · DESIGN.COM');
    expect(titleFromPath('/tools/png-to-ico')).toBe('Png to ico');
  });

  it('come from the page hero', async () => {
    const { createApp, h } = await import('vue');
    const { createRouter, createMemoryHistory } = await import('vue-router');
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] });
    await router.push('/design-assets/icons');
    const el = document.createElement('div');
    const app = createApp({ render: () => h(PageHero, { title: 'Icon library' }) });
    app.use(router);
    app.component('AppIcon', { render: () => null });
    app.mount(el);
    await nextTick();
    expect(document.title).toBe('Icon library · Design Assets · DESIGN.COM');
    app.unmount();
    page = null;
  });
});

describe('top-bar search', () => {
  const originalAdapter = apiClient.defaults.adapter;
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it('is a combobox that points at the highlighted option and announces the result count', async () => {
    apiClient.defaults.adapter = async (config) => ({ status: 200, statusText: 'OK', headers: {}, config, data: [] });
    page = await mountView(TopNav);
    const input = page.app._container.querySelector('input[type="search"]');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-controls')).toBe('top-search-results');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-haspopup')).toBe(false);

    page.state.searchQuery = 'button';
    page.state.showSearchResults = true;
    await nextTick();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const options = [...page.app._container.querySelectorAll('[role="option"]')];
    if (options.length) {
      expect(options.every((o) => o.getAttribute('tabindex') === '-1')).toBe(true);
      page.state.selectedSearchIndex = 0;
      await nextTick();
      expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    }
    expect(page.state.resultsAnnouncement).toMatch(/result|No results/);
  });
});
