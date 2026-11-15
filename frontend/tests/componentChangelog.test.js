// Component pages' version history comes from the design-system changelog
// (GET /api/v1/changelog/components/:id), not hard-coded versions; the Loupe's
// breakpoint buttons open the page at that width instead of an alert().
import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import { useComponentChangelog, versionsFromChangelog } from '../src/composables/useComponentChangelog.js';
import ComponentVersionHistory from '../src/components/ComponentVersionHistory.vue';
import LoupeTool from '../src/components/LoupeTool.vue';
import { mountView } from './helpers/mountView.js';

const ENTRIES = [
  { id: 'c3', type: 'component', entityId: 'button', entityName: 'Button', action: 'updated', version: '2.1.0', changes: [{ field: 'props', description: 'Added a loading prop' }], breaking: false, createdAt: '2026-03-02T10:00:00.000Z', author: 'Ann Lee' },
  { id: 'c4', type: 'component', entityId: 'button', entityName: 'Button', action: 'updated', changes: [{ description: 'Tweaked focus ring' }], breaking: false, createdAt: '2026-04-01T10:00:00.000Z' },
  { id: 'c2', type: 'component', entityId: 'button', entityName: 'Button', action: 'updated', version: '2.0.0', changes: [{ description: 'Renamed type to variant' }], breaking: true, createdAt: '2026-02-01T10:00:00.000Z', author: 'Bo Chen' },
  { id: 'c1', type: 'component', entityId: 'button', entityName: 'Button', action: 'created', version: '1.0.0', changes: [], breaking: false, createdAt: '2026-01-01T10:00:00.000Z' },
];

const originalAdapter = apiClient.defaults.adapter;
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
});

const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

describe('versionsFromChangelog', () => {
  it('groups versioned entries newest version first and keeps the rest apart', () => {
    const { versions, unversioned } = versionsFromChangelog(ENTRIES);
    expect(versions.map((v) => [v.version, v.status, v.breaking])).toEqual([
      ['2.1.0', 'Current', false],
      ['2.0.0', 'Earlier', true],
      ['1.0.0', 'Earlier', false],
    ]);
    expect(versions[1].changelog).toEqual([{ type: 'breaking', description: 'Renamed type to variant' }]);
    expect(versions[2].changelog).toEqual([{ type: 'added', description: 'Added Button' }]);
    expect(versions[0].releasedAt).toBe('2026-03-02T10:00:00.000Z');
    expect(unversioned).toEqual([expect.objectContaining({ id: 'c4', changes: [{ type: 'changed', description: 'Tweaked focus ring' }] })]);
  });

  it('is empty without entries', () => {
    expect(versionsFromChangelog([])).toEqual({ versions: [], unversioned: [] });
  });
});

describe('useComponentChangelog', () => {
  it('loads the component changelog and reports errors', async () => {
    const urls = [];
    apiClient.defaults.adapter = async (config) => {
      urls.push(config.url);
      return { status: 200, statusText: 'OK', headers: {}, config, data: ENTRIES };
    };
    const history = useComponentChangelog('button');
    await flush();
    expect(urls).toEqual(['/api/v1/changelog/components/button']);
    expect(history.versions.value.map((v) => v.version)).toEqual(['2.1.0', '2.0.0', '1.0.0']);

    apiClient.defaults.adapter = async () => Promise.reject(Object.assign(new Error('boom'), { response: { status: 500, data: {} } }));
    await history.load();
    expect(history.error.value).toBeTruthy();
  });
});

describe('ComponentVersionHistory', () => {
  it('shows each version and an honest empty state', async () => {
    const { versions, unversioned } = versionsFromChangelog(ENTRIES);
    const el = document.createElement('div');
    createApp({ render: () => h(ComponentVersionHistory, { versions, unversioned, loaded: true }) }).mount(el);
    expect(el.textContent).toContain('v2.1.0');
    expect(el.textContent).toContain('Breaking changes');
    expect(el.textContent).toContain('Changes without a version');

    const empty = document.createElement('div');
    createApp({ render: () => h(ComponentVersionHistory, { versions: [], unversioned: [], loaded: true }) }).mount(empty);
    expect(empty.textContent).toContain('No versions recorded');
  });
});

describe('Loupe breakpoints', () => {
  it('open the page in a window that wide, and say so when it is blocked', async () => {
    const page = await mountView(LoupeTool);
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: () => {} });
    page.state.jumpToBreakpoint({ id: 'md', label: 'Medium', minWidth: 768 });
    expect(open).toHaveBeenCalledWith(window.location.href, 'loupe-breakpoint-preview', expect.stringContaining('width=768'));
    expect(page.state.breakpointMessage).toContain('768px');

    open.mockReturnValue(null);
    page.state.jumpToBreakpoint({ id: 'lg', label: 'Large', minWidth: 1024 });
    expect(page.state.breakpointMessage).toContain('blocked');
    page.unmount();
  });
});
