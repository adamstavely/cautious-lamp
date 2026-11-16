// Status messages on the tool pages (WCAG 4.1.3): results that change without
// focus moving are said through an always-present live region, and the docs
// viewer moves focus with its table of contents and keeps one h1 per page.
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import MarkdownViewer from '../src/components/MarkdownViewer.vue';
import APCACalculator from '../src/views/APCACalculator.vue';
import IconLibrary from '../src/views/IconLibrary.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

// jsdom has no scrollingElement; MarkdownViewer measures it
if (!document.scrollingElement) Object.defineProperty(document, 'scrollingElement', { value: document.documentElement, configurable: true });

const liveText = () => [...document.querySelectorAll('[aria-live]')].map((el) => el.textContent.trim()).filter(Boolean);

let page;

afterEach(() => {
  page?.unmount();
  page = null;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Icon library search', () => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16"/></svg>';
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const responses = {
      'GET /api/v1/resources/icons': [
        { id: 'res_1', kind: 'icons', name: 'cart', iconSet: 'Shop', svg: SVG, workspaceId: 'ws_a' },
        { id: 'res_2', kind: 'icons', name: 'bag', iconSet: 'Shop', svg: SVG, workspaceId: 'ws_a' },
      ],
      'GET /api/v1/workspaces': [{ id: 'ws_a', name: 'Commerce', effectiveRole: 'editor' }],
    };
    apiClient.defaults.adapter = async (config) => {
      const data = responses[`${config.method.toUpperCase()} ${config.url}`];
      if (data === undefined) return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
      return { status: 200, statusText: 'OK', data, headers: {}, config };
    };
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it('says "N of M icons" once typing pauses, not on every keystroke', async () => {
    page = await mountView(IconLibrary, { path: '/design-assets/icons' });
    await flush();
    page.state.selectedSet = 'ws:ws_a:Shop';
    await flush();

    vi.useFakeTimers();
    page.state.searchQuery = 'c';
    await nextTick();
    vi.advanceTimersByTime(200);
    page.state.searchQuery = 'car';
    await nextTick();
    vi.advanceTimersByTime(200);
    expect(page.state.searchAnnouncement).toBe(''); // still typing

    vi.advanceTimersByTime(250);
    expect(page.state.searchAnnouncement).toBe('1 of 2 icons');
    await flush();
    expect(liveText()).toContain('1 of 2 icons');
  });

  it('announces the selection count without a status role on the toolbar', async () => {
    page = await mountView(IconLibrary, { path: '/design-assets/icons' });
    await flush();
    page.state.selectedSet = 'ws:ws_a:Shop';
    await flush();
    const [cart, bag] = page.state.filteredIcons;
    page.state.toggleIconSelection(cart);
    page.state.toggleIconSelection(bag);
    await flush();
    expect(page.state.selectionAnnouncement).toBe('2 selected');
    expect(document.querySelector('[role="status"]')).toBeNull();
    page.state.clearSelection();
    await flush();
    expect(page.state.selectionAnnouncement).toBe('Selection cleared');
  });
});

describe('APCA calculator', () => {
  it('says the calculated colour and its contrast', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    page = await mountView(APCACalculator, { path: '/tools/apca-calculator' });
    page.state.calculateColor();
    await flush();
    expect(page.state.resultAnnouncement).toMatch(/^Calculated: #[0-9a-f]{6}, Lc \d+(\.\d)?$/);
    expect(liveText()).toContain(page.state.resultAnnouncement);
  });
});

describe('MarkdownViewer', () => {
  const DOC = '# Dashboard Design\n\nIntro text.\n\n## Choosing a type\n\nBody.\n\n| Type | Use |\n| --- | --- |\n| Curated | Decisions |\n\n## Layout\n\nMore.\n';

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', async () => ({ ok: true, status: 200, statusText: 'OK', headers: { get: () => null }, text: async () => DOC }));
  });

  const viewer = (docPath, props = {}) => ({ render: () => h(MarkdownViewer, { docPath, ...props }) });

  it('drops the document\'s own h1 under a hero and keeps it out of the TOC', async () => {
    page = await mountView(viewer('/data-viz/dashboard-design'));
    await flush();
    const h1s = [...document.querySelectorAll('h1')];
    expect(h1s.map((el) => el.textContent.trim())).toEqual(['Dashboard Design']);
    expect(document.querySelector('.md-prose h1')).toBeNull();
    const tocLinks = [...document.querySelectorAll('.md-toc-link')].map((a) => a.textContent.trim());
    expect(tocLinks).toEqual(['Choosing a type', 'Layout']);
  });

  it('keeps the h1 when the viewer stands alone, still leaving it out of the TOC', async () => {
    page = await mountView(viewer('/patterns/forms'));
    await flush();
    expect(document.querySelector('.md-prose h1')?.textContent).toBe('Dashboard Design');
    expect([...document.querySelectorAll('.md-toc-link')].map((a) => a.textContent.trim())).toEqual(['Choosing a type', 'Layout']);
  });

  it('moves focus to the heading a TOC link points to', async () => {
    page = await mountView(viewer('/data-viz/dashboard-design'));
    await flush();
    const link = [...document.querySelectorAll('.md-toc-link')].find((a) => a.textContent.trim() === 'Layout');
    link.click();
    await flush();
    const heading = document.getElementById('layout');
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);
  });

  it('wraps tables in a named, focusable scroll region', async () => {
    page = await mountView(viewer('/data-viz/dashboard-design'));
    await flush();
    const region = document.querySelector('.md-prose .md-table-scroll');
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('aria-label')).toBe('Table');
    expect(region.querySelector('table')).not.toBeNull();
  });
});
