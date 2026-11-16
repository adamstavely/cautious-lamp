// The colour picker was a floating <div aria-modal> that Tab could leave, that
// never gave focus back, and whose Apply button could sit off a short screen.
// It is now a native modal <dialog>. (Its height and Tab containment were
// checked in a browser at 1280x600 and 375x667.)
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ColorPicker from '../src/components/ColorPicker.vue';
import { colorPickerAnchor } from '../src/utils/colorPickerAnchor.js';

let app;
let root;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  // jsdom has no canvas: a context whose every method does nothing
  const noop = new Proxy(function () {}, { get: () => noop, apply: () => noop, set: () => true });
  HTMLCanvasElement.prototype.getContext = () => noop;
});
afterEach(() => {
  app?.unmount();
  root?.remove();
});

const flush = async () => {
  for (let i = 0; i < 4; i++) await nextTick();
};

async function mountWithOpener() {
  const show = ref(false);
  const events = [];
  root = document.createElement('div');
  document.body.appendChild(root);
  app = createApp({
    render: () => [
      h('button', { id: 'swatch', onClick: () => (show.value = true) }, 'Pick color'),
      h(ColorPicker, {
        show: show.value,
        initialColor: '#2f5ea8',
        position: { left: 100, top: 50, anchorLeft: 60 },
        'onUpdate:show': (v) => { show.value = v; events.push(`show:${v}`); },
        onCancel: () => events.push('cancel'),
        onApply: (hex) => events.push(`apply:${hex}`),
      }),
    ],
  });
  app.component('AppIcon', { render: () => null });
  app.mount(root);
  const swatch = root.querySelector('#swatch');
  swatch.focus();
  swatch.click();
  await flush();
  return { show, events, swatch };
}

describe('ColorPicker', () => {
  it('opens as a labelled modal dialog with focus inside', async () => {
    await mountWithOpener();
    const dialog = root.querySelector('dialog.color-picker');
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('cancels on Escape (the dialog cancel event) and gives focus back to the control that opened it', async () => {
    const { events, swatch } = await mountWithOpener();
    root.querySelector('dialog.color-picker').dispatchEvent(new Event('cancel', { cancelable: true }));
    await flush();
    expect(events).toEqual(['cancel', 'show:false']);
    expect(root.querySelector('dialog.color-picker')).toBeNull();
    expect(document.activeElement).toBe(swatch);
  });

  it('cancels on a click on the backdrop but not inside', async () => {
    const { events } = await mountWithOpener();
    const dialog = root.querySelector('dialog.color-picker');
    dialog.querySelector('canvas').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).not.toContain('cancel');
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toContain('cancel');
  });
});

describe('colorPickerAnchor', () => {
  it('places the picker beside the clicked control, remembering its left edge for flipping', () => {
    const el = document.createElement('button');
    el.getBoundingClientRect = () => ({ left: 40, right: 80, top: 120, bottom: 150 });
    expect(colorPickerAnchor({ currentTarget: el })).toEqual({ left: 96, top: 120, anchorLeft: 40 });
  });
});
