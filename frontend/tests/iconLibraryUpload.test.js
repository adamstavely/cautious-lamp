// Icon library: uploaded SVG files are parsed in the browser (only SVG documents
// up to 100KB), each valid file is saved as an `icons` item in the chosen
// workspace with the set name, and uploaded sets load from GET /resources/icons
// grouped by set, rendered as sanitized images.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import IconLibrary from '../src/views/IconLibrary.vue';
import { MAX_SVG_BYTES, iconNameFromFile, parseSvgText, readSvgFiles } from '../src/utils/svgIconFiles.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h16"/></svg>';
const svgFile = (name, text = SVG) => new File([text], name, { type: 'image/svg+xml' });

describe('svgIconFiles', () => {
  it('names icons after their files', () => {
    expect(iconNameFromFile('Arrow Right.svg')).toBe('arrow-right');
    expect(iconNameFromFile('chevron_down.SVG')).toBe('chevron-down');
  });

  it('accepts SVG documents and rejects other markup', () => {
    expect(parseSvgText(SVG)).toEqual({ ok: true, svg: SVG });
    expect(parseSvgText('<html><body>hi</body></html>').ok).toBe(false);
    expect(parseSvgText('<svg><path></svg>').ok).toBe(false);
    expect(parseSvgText('   ').ok).toBe(false);
  });

  it('keeps valid files and reports the rest with a reason', async () => {
    const big = svgFile('big.svg', `<svg xmlns="http://www.w3.org/2000/svg"><!--${'x'.repeat(MAX_SVG_BYTES)}--></svg>`);
    const { icons, rejected } = await readSvgFiles([
      svgFile('Home.svg'),
      new File(['hello'], 'notes.txt', { type: 'text/plain' }),
      svgFile('broken.svg', '<div>not svg</div>'),
      big,
    ]);
    expect(icons).toEqual([{ name: 'home', svg: SVG, fileName: 'Home.svg' }]);
    expect(rejected.map((r) => r.fileName)).toEqual(['notes.txt', 'broken.svg', 'big.svg']);
    expect(rejected[2].reason).toMatch(/100KB/);
  });
});

describe('IconLibrary', () => {
  let responses;
  let calls;
  let page;
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    calls = [];
    vi.spyOn(console, 'error').mockImplementation(() => {});
    responses = {
      'GET /api/v1/resources/icons': [
        { id: 'res_1', kind: 'icons', name: 'cart', iconSet: 'Shop', svg: SVG, workspaceId: 'ws_a', tags: ['commerce'] },
        { id: 'res_2', kind: 'icons', name: 'bag', iconSet: 'Shop', svg: SVG, workspaceId: 'ws_a' },
        { id: 'res_3', kind: 'icons', name: 'logo', iconSet: 'Brand', svg: SVG, workspaceId: 'ws_b' },
      ],
      'GET /api/v1/workspaces': [
        { id: 'ws_a', name: 'Commerce', effectiveRole: 'editor' },
        { id: 'ws_b', name: 'Brand team', effectiveRole: 'viewer' },
      ],
      'POST /api/v1/workspaces/ws_a/resources/icons': (config) => ({ id: `res_${calls.length}`, kind: 'icons', workspaceId: 'ws_a', ...JSON.parse(config.data) }),
    };
    apiClient.defaults.adapter = async (config) => {
      const key = `${config.method.toUpperCase()} ${config.url}`;
      calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
      let data = responses[key];
      if (typeof data === 'function') data = data(config);
      if (data === undefined) return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
      return { status: 200, statusText: 'OK', data, headers: {}, config };
    };
  });

  afterEach(() => {
    page?.unmount();
    page = null;
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('loads uploaded sets from the workspace library, grouped by set, as sanitized images', async () => {
    page = await mountView(IconLibrary, { path: '/design-assets/icons' });
    await flush();
    expect(calls.map((c) => c.key)).toContain('GET /api/v1/resources/icons');

    const uploaded = page.state.uploadedSets;
    expect(uploaded.map((s) => [s.name, s.icons.length, s.workspaceName, s.canEdit])).toEqual([
      ['Brand', 1, 'Brand team', false],
      ['Shop', 2, 'Commerce', true],
    ]);

    page.state.selectedSet = 'ws:ws_a:Shop';
    await flush();
    const imgs = [...document.querySelectorAll('img.icon-img')];
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    expect(document.body.innerHTML).not.toContain('<path d="M4 12h16"');
  });

  it('uploads one icons item per valid SVG file, with the set name, to the chosen workspace', async () => {
    page = await mountView(IconLibrary, { path: '/design-assets/icons' });
    await flush();
    page.state.openUpload();
    await flush();
    expect(page.state.uploadWorkspaceId).toBe('ws_a'); // the only workspace the user can edit

    page.state.newSetName = 'Arrows';
    page.state.addFile(svgFile('Arrow Up.svg'));
    page.state.addFile(svgFile('arrow_down.svg'));
    page.state.addFile(new File(['nope'], 'readme.md', { type: 'text/markdown' }));
    await page.state.uploadIconSet();
    await flush();

    const posts = calls.filter((c) => c.key === 'POST /api/v1/workspaces/ws_a/resources/icons');
    expect(posts.map((p) => p.data)).toEqual([
      { name: 'arrow-up', iconSet: 'Arrows', svg: SVG },
      { name: 'arrow-down', iconSet: 'Arrows', svg: SVG },
    ]);
    expect(page.state.rejectedFiles.map((f) => f.fileName)).toEqual(['readme.md']);
    expect(page.state.selectedSet).toBe('ws:ws_a:Arrows');
    expect(page.state.uploadedSets.find((s) => s.name === 'Arrows').icons).toHaveLength(2);
  });

  it('explains that editor access is needed when the user can edit no workspace', async () => {
    responses['GET /api/v1/workspaces'] = [{ id: 'ws_b', name: 'Brand team', effectiveRole: 'viewer' }];
    page = await mountView(IconLibrary, { path: '/design-assets/icons' });
    await flush();
    page.state.openUpload();
    await flush();
    expect(document.body.textContent).toContain('Editor access needed');
    expect(document.querySelector('#icon-upload-form')).toBeNull();
  });
});
