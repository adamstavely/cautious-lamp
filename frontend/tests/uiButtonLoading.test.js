// A loading button used to be `disabled`, which drops focus to the page when it
// was the focused control (a keyboard Save) and silences what happens next.
// It now stays focusable, says it's busy, and ignores clicks until done.
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import UiButton from '../src/components/ui/UiButton.vue';

let app;
let el;
afterEach(() => {
  app?.unmount();
  el?.remove();
});

describe('UiButton while loading', () => {
  it('keeps focus, is marked busy and aria-disabled, and ignores clicks and form submission', async () => {
    const loading = ref(false);
    let clicks = 0;
    let submits = 0;
    el = document.createElement('div');
    document.body.appendChild(el);
    app = createApp({
      render: () =>
        h('form', { onSubmit: (e) => { e.preventDefault(); submits++; } }, [
          h(UiButton, { type: 'submit', loading: loading.value, onClick: () => clicks++ }, () => 'Save'),
        ]),
    });
    app.component('AppIcon', { render: () => null });
    app.mount(el);
    const button = el.querySelector('button');
    button.focus();

    loading.value = true;
    await nextTick();
    expect(button.disabled).toBe(false);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    button.click();
    expect(clicks).toBe(0);
    expect(submits).toBe(0);

    loading.value = false;
    await nextTick();
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    button.click();
    expect(clicks).toBe(1);
    expect(submits).toBe(1);
  });
});
