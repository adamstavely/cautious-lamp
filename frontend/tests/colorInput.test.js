// A native colour input got a text field's 14px side padding, which left a
// sliver of colour in narrow columns (the badge generator's "Picker").
import { createApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import UiInput from '../src/components/ui/UiInput.vue';
import { readSource } from './helpers/appRoutes.js';

const render = (props) => {
  const el = document.createElement('div');
  const app = createApp({ render: () => h(UiInput, { label: 'Picker', modelValue: '#6366f1', ...props }) });
  app.component('AppIcon', { render: () => null });
  app.mount(el);
  return { input: el.querySelector('input'), app };
};

describe('UiInput type="color"', () => {
  it('marks colour inputs so they get swatch sizing instead of text padding', () => {
    const color = render({ type: 'color' });
    expect(color.input.classList.contains('ui-input-color')).toBe(true);
    color.app.unmount();
    const text = render({ type: 'text' });
    expect(text.input.classList.contains('ui-input-color')).toBe(false);
    text.app.unmount();
  });

  it('is at least a field-high square with the swatch filling it', () => {
    const css = readSource('src/components/ui/UiInput.vue');
    expect(css).toMatch(/\.ui-input\.ui-input-color \{\s*@apply min-w-11 p-1/);
    expect(css).toMatch(/::-webkit-color-swatch-wrapper \{\s*@apply p-0/);
    expect(css).toMatch(/::-moz-color-swatch/);
  });
});
