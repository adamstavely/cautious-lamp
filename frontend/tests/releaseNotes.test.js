// Release notes on the roadmap and feedback page come from the changelog:
// versioned changes are grouped by version, newest release first, breaking
// changes in their own group; unversioned changes are left out, and a failed
// load says so rather than showing notes.
import { afterEach, describe, expect, it, vi } from 'vitest';
import RoadmapFeedback from '../src/views/RoadmapFeedback.vue';
import { buildReleaseNotes, describeEntry } from '../src/utils/releaseNotes.js';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ user: { value: { id: 'usr_1' } }, hasPermission: () => false }),
}));
vi.mock('../src/components/feedback/ComponentRequests.vue', () => ({ default: { render: () => null } }));

const entry = (overrides = {}) => ({
  id: 'chg_1',
  type: 'component',
  entityId: 'button',
  entityName: 'Button',
  action: 'updated',
  version: '2.1.0',
  changes: [],
  breaking: false,
  createdAt: '2026-03-01T10:00:00.000Z',
  audience: [],
  ...overrides,
});

const ENTRIES = [
  entry({ id: 'chg_1', action: 'created', entityName: 'Data table', version: '2.1.0', createdAt: '2026-03-02T10:00:00.000Z', link: '/components/data-table' }),
  entry({ id: 'chg_2', changes: [{ field: 'variant', description: 'Renamed type to variant' }], breaking: true, version: '2.1.0' }),
  entry({ id: 'chg_3', type: 'token', entityName: 'color.brand', action: 'deprecated', version: '1.4.0', createdAt: '2026-01-05T10:00:00.000Z' }),
  entry({ id: 'chg_4', entityName: 'Card', version: undefined, createdAt: '2026-04-01T10:00:00.000Z' }),
];

describe('buildReleaseNotes', () => {
  it('groups versioned changes by version, newest first, and leaves out unversioned ones', () => {
    const notes = buildReleaseNotes(ENTRIES);
    expect(notes.map((n) => n.version)).toEqual(['2.1.0', '1.4.0']);
    expect(notes[0]).toMatchObject({
      date: '2026-03-02T10:00:00.000Z',
      count: 2,
      features: [{ id: 'chg_1', text: 'Component Data table added', link: '/components/data-table' }],
      breaking: [{ id: 'chg_2', text: 'Component Button: Renamed type to variant' }],
      improvements: [],
    });
    expect(notes[1].deprecations).toEqual([{ id: 'chg_3', text: 'Token color.brand deprecated', link: undefined }]);
  });

  it('describes a change by its item and what happened', () => {
    expect(describeEntry(entry({ action: 'deleted' }))).toBe('Component Button removed');
    expect(describeEntry(entry({ changes: [{ description: 'a' }, { description: 'b' }] }))).toBe('Component Button: a; b');
  });
});

describe('Roadmap and feedback release notes', () => {
  let api;
  let page;
  afterEach(() => {
    page?.unmount();
    api?.restore();
  });

  const mount = async (changelog) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api = stubApi({ 'GET /api/v1/changelog/entries': changelog, 'GET /api/v1/roadmap': [], 'GET /api/v1/issues': [] });
    page = await mountView(RoadmapFeedback);
    await flush();
    return document.body.textContent.replace(/\s+/g, ' ');
  };

  it('shows the changelog grouped by version, with no hard-coded releases', async () => {
    const text = await mount(ENTRIES);
    expect(text).toContain('Version 2.1.0');
    expect(text).toContain('Version 1.4.0');
    expect(text).toContain('Component Button: Renamed type to variant');
    expect(text).not.toContain('Version 2.0.0');
    expect(text).not.toContain('Add release note');
  });

  it('says the changelog could not be loaded when it fails', async () => {
    const text = await mount(fail(500));
    expect(text).toContain('No release notes yet');
    expect(text).toContain('could not be loaded');
  });
});
