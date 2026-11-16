// The app shell on phones (accessibility review, phone layout): the side nav
// becomes a menu, the docs drawer a sheet that never opens by itself and moves
// focus in and back, and the shared layout rules keep content inside the screen.
// jsdom has no layout; the widths were checked in a browser at 320 and 375px.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentationDrawer from '../src/components/DocumentationDrawer.vue';
import PhoneNav from '../src/components/PhoneNav.vue';
import Sidebar from '../src/components/Sidebar.vue';
import UiInput from '../src/components/ui/UiInput.vue';
import UiTable from '../src/components/ui/UiTable.vue';
import { usePhoneNav } from '../src/composables/usePhoneNav.js';
import { isSectionActive } from '../src/navigation.js';
import { readSource } from './helpers/appRoutes.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/router/rbacGuards.js', () => ({ canAccessPath: () => true }));

const pages = [];
const mount = async (component, path = '/tools/color-contrast') => {
  const page = await mountView(component, { path });
  pages.push(page);
  return page.app._container;
};

beforeEach(() => {
  // jsdom has no <dialog> methods
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  pages.splice(0).forEach((page) => page.unmount());
  usePhoneNav().value = false;
});

describe('sections in the nav', () => {
  it('match their child pages', () => {
    expect(isSectionActive('/tools', '/tools/color-contrast')).toBe(true);
    expect(isSectionActive('/tools', '/toolsx')).toBe(false);
    expect(isSectionActive('/tokens', '/palette-builder/step-1')).toBe(true);
    expect(isSectionActive('/research', '/hcd/personas')).toBe(true);
  });

  it('mark the current section for assistive technology in the side nav', async () => {
    const el = await mount(Sidebar);
    expect(el.querySelector('a[aria-current="page"]').textContent.trim()).toBe('Tools');
    expect(el.querySelectorAll('a[aria-current]')).toHaveLength(1);
    // One landmark named "Main navigation", not two
    expect(el.querySelectorAll('[aria-label="Main navigation"]')).toHaveLength(1);
  });
});

describe('the phone menu', () => {
  it('opens as a modal dialog with every section, the current one marked, and closes on navigation', async () => {
    const el = await mount(PhoneNav);
    const dialog = el.querySelector('dialog#phone-nav');
    expect(dialog.open).toBe(false);

    usePhoneNav().value = true;
    await nextTick();
    expect(dialog.open).toBe(true);
    const links = [...dialog.querySelectorAll('nav a')].map((a) => a.textContent.trim());
    expect(links).toEqual(expect.arrayContaining(['Getting Started', 'Tools', 'Admin']));
    expect(dialog.querySelector('a[aria-current="page"]').textContent.trim()).toBe('Tools');

    await pages[0].router.push('/admin');
    await nextTick();
    await nextTick();
    expect(usePhoneNav().value).toBe(false);
  });

  it('closes from its close button and offers the theme toggle', async () => {
    const el = await mount(PhoneNav);
    usePhoneNav().value = true;
    await nextTick();
    expect(el.querySelector('.phone-nav-foot button').textContent).toMatch(/mode/);
    el.querySelector('button[aria-label="Close menu"]').click();
    await nextTick();
    expect(usePhoneNav().value).toBe(false);
  });
});

describe('the section guide (docs drawer)', () => {
  const mountDrawer = async (isOpen) => {
    const { createApp, h, ref } = await import('vue');
    const open = ref(isOpen);
    const events = [];
    const el = document.createElement('div');
    document.body.appendChild(el);
    const { createRouter, createMemoryHistory } = await import('vue-router');
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] });
    await router.push('/tools');
    const app = createApp({ render: () => h(DocumentationDrawer, { isOpen: open.value, onClose: () => events.push('close'), onToggle: () => events.push('toggle'), onRestoreFocus: () => events.push('restore-focus') }) });
    app.component('AppIcon', { render: () => null });
    app.use(router);
    app.config.warnHandler = () => {};
    app.mount(el);
    pages.push({ unmount: () => { app.unmount(); el.remove(); } });
    await nextTick();
    return { el, open, events };
  };

  it('names its toggle and states whether the guide is open', async () => {
    const { el } = await mountDrawer(false);
    const button = el.querySelector('button[aria-label="Open section guide"]');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe('section-guide');
  });

  it('moves focus into the guide when it opens', async () => {
    const { el, open } = await mountDrawer(false);
    open.value = true;
    await nextTick();
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(el.querySelector('#section-guide'));
  });

  it('asks the page for its guide button when closing leaves focus nowhere (phones, no rail)', async () => {
    const { open, events } = await mountDrawer(true);
    open.value = false;
    await nextTick();
    await nextTick();
    await nextTick();
    // jsdom lays nothing out, so the rail button has no offsetParent, as on phones
    expect(events).toContain('restore-focus');
  });

  it('leaves Escape alone when a dialog handled it', async () => {
    const { events } = await mountDrawer(true);
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(events).not.toContain('close');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(events).toContain('close');
    dialog.remove();
  });
});

describe('shared layout rules', () => {
  it('make room for an input\'s icon with a rule its own padding can\'t undo', async () => {
    const { createApp, h } = await import('vue');
    const el = document.createElement('div');
    const app = createApp({ render: () => h(UiInput, { label: 'Search', icon: 'search', modelValue: '' }) });
    app.component('AppIcon', { render: () => null });
    app.mount(el);
    expect(el.querySelector('input').classList.contains('ui-input-has-icon')).toBe(true);
    expect(readSource('src/components/ui/UiInput.vue')).toMatch(/\.ui-input\.ui-input-has-icon \{\s*@apply pl-10/);
    app.unmount();
  });

  it('let grid items shrink, keep flexible grid columns from growing past the screen, and let buttons wrap', () => {
    expect(readSource('src/style.css')).toMatch(/:where\(\.grid\) > \* \{\s*min-width: 0;/);
    const config = readSource('tailwind.config.js');
    expect(config).toContain("'content-aside': 'minmax(0, 1fr) auto'");
    expect(config).toContain("'aside-content': 'auto minmax(0, 1fr)'");
    const button = readSource('src/components/ui/UiButton.vue');
    expect(button).not.toMatch(/whitespace-nowrap/);
    expect(button).toMatch(/\.ui-button-md \{\s*@apply min-h-11/);
  });

  it('make a table that scrolls sideways a named, focusable region, and leave one that fits alone', async () => {
    const { createApp, h } = await import('vue');
    const mountTable = (scrollWidth) => {
      const widths = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
      const el = document.createElement('div');
      const app = createApp({ render: () => h(UiTable, { caption: 'Contrast by vision type' }, () => h('tbody')) });
      app.mount(el);
      widths.mockRestore();
      vi.restoreAllMocks();
      return { wrap: el.querySelector('.ui-table-wrap'), app };
    };
    const wide = mountTable(800);
    await nextTick();
    expect(wide.wrap.getAttribute('tabindex')).toBe('0');
    expect(wide.wrap.getAttribute('role')).toBe('region');
    expect(wide.wrap.getAttribute('aria-label')).toBe('Contrast by vision type');
    wide.app.unmount();
    const fits = mountTable(300);
    await nextTick();
    expect(fits.wrap.hasAttribute('tabindex')).toBe(false);
    expect(fits.wrap.hasAttribute('role')).toBe(false);
    fits.app.unmount();
  });

  it('size the shell from tokens', () => {
    const tokens = readSource('src/styles/tokens.css');
    for (const name of ['sidenav', 'topbar', 'launcher-clearance', 'field-sm', 'field-md']) expect(tokens).toMatch(new RegExp(`--app-${name}:`));
    expect(readSource('src/components/DocumentationDrawer.vue')).toMatch(/\.drawer-rail \{\s*@apply hidden sm:flex fixed left-sidenav top-topbar/);
    expect(readSource('src/components/ui/PageShell.vue')).toMatch(/pb-launcher-clearance/);
  });
});
