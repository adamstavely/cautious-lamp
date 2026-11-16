// The diff viewer's shortcuts used to listen on the whole document with no
// modifier check: Cmd/Ctrl + +, - and 0 stopped zooming the browser, Cmd+F
// opened full screen, and one key press changed every viewer on the page.
import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EnhancedDiffViewer from '../src/components/EnhancedDiffViewer.vue';
import AppIcon from '../src/components/ui/AppIcon.vue';

const IMAGES = { baselineImage: 'data:image/png;base64,AA==', currentImage: 'data:image/png;base64,AA==', diffImage: 'data:image/png;base64,AA==' };

let mounted = [];
afterEach(() => {
  mounted.forEach(({ app, el }) => {
    app.unmount();
    el.remove();
  });
  mounted = [];
  vi.restoreAllMocks();
});

/** Two viewers side by side, as on a run's results page */
async function mountTwo() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const app = createApp({ render: () => [h(EnhancedDiffViewer, { ...IMAGES, altText: 'Home page' }), h(EnhancedDiffViewer, { ...IMAGES, altText: 'Pricing page' })] });
  app.component('AppIcon', AppIcon);
  app.config.warnHandler = () => {};
  app.mount(el);
  mounted.push({ app, el });
  await nextTick();
  const viewers = [...el.querySelectorAll('.diff-viewer')];
  const zoom = (index) => el.querySelectorAll('[aria-live="polite"]')[index].textContent.trim();
  return { el, viewers, zoom };
}

const press = (target, key, init = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

describe('Diff viewer keyboard shortcuts', () => {
  it('act only on the viewer that has focus', async () => {
    const { viewers, zoom } = await mountTwo();
    press(viewers[0], '+');
    await nextTick();
    expect(zoom(0)).toBe('125%');
    expect(zoom(1)).toBe('100%');
  });

  it('ignore keys pressed anywhere else on the page', async () => {
    const { zoom } = await mountTwo();
    const event = press(document.body, '+');
    await nextTick();
    expect(event.defaultPrevented).toBe(false);
    expect(zoom(0)).toBe('100%');
  });

  it('leave Cmd/Ctrl + +, -, 0 and F to the browser', async () => {
    const { viewers, zoom } = await mountTwo();
    for (const [key, init] of [['+', { metaKey: true }], ['-', { ctrlKey: true }], ['0', { metaKey: true }], ['f', { metaKey: true }], ['+', { altKey: true }]]) {
      expect(press(viewers[0], key, init).defaultPrevented).toBe(false);
    }
    await nextTick();
    expect(zoom(0)).toBe('100%');
  });

  it('pan with the arrow keys once zoomed in, and leave arrows alone at 100%', async () => {
    const { viewers } = await mountTwo();
    expect(press(viewers[0], 'ArrowRight').defaultPrevented).toBe(false);
    press(viewers[0], '+');
    await nextTick();
    expect(press(viewers[0], 'ArrowRight').defaultPrevented).toBe(true);
  });

  it('let the wheel scroll the page unless zoomed in', async () => {
    const { viewers } = await mountTwo();
    const wheel = () => {
      const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
      viewers[0].dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(wheel()).toBe(false);
    press(viewers[0], '+');
    await nextTick();
    expect(wheel()).toBe(true);
  });

  it('names each viewer and points at its own shortcut hint', async () => {
    const { el, viewers } = await mountTwo();
    expect(viewers.map((v) => v.getAttribute('aria-label'))).toEqual(['Comparison of Home page', 'Comparison of Pricing page']);
    const ids = viewers.map((v) => v.getAttribute('aria-describedby'));
    expect(new Set(ids).size).toBe(2);
    ids.forEach((id) => expect(document.getElementById(id)?.textContent).toContain('Zoom'));
    expect(el.textContent).not.toContain('Space');
  });
});
