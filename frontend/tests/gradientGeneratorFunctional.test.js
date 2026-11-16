// Gradient generator: dragging stops reorders them, animation rotates and
// reaches every code export, colours parse in any CSS form, and the contrast
// check sees stop opacity and every visible layer.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import GradientGenerator from '../src/views/GradientGenerator.vue';
import {
  gradientStackCss, moveStop, parseColor, sampleStackColor, stopCss, stopRgba, worstContrast,
} from '../src/utils/gradientGenerator.js';
import { mountView } from './helpers/mountView.js';

let page;
afterEach(() => {
  page?.unmount();
  page = undefined;
});

const dragEvent = () => ({ preventDefault() {}, dataTransfer: { setData() {}, effectAllowed: '', dropEffect: '' } });
const layer = (stops, extra = {}) => ({
  id: Math.random(),
  type: 'linear',
  linearAngle: 90,
  radialPosition: { x: '50%', y: '50%' },
  radialShape: 'ellipse',
  radialSize: 'farthest-corner',
  conicPosition: { x: '50%', y: '50%' },
  conicAngle: 0,
  colorStops: stops.map(([color, position, opacity = 100], i) => ({ id: i + 1, color, position, opacity })),
  blendMode: 'normal',
  opacity: 100,
  enabled: true,
  ...extra,
});

describe('moving colour stops', () => {
  it('moveStop keeps the positions and moves the colour', () => {
    const stops = [
      { id: 1, color: 'red', position: 0 },
      { id: 2, color: 'lime', position: 40 },
      { id: 3, color: 'blue', position: 100 },
    ];
    const moved = moveStop(stops, 0, 2);
    expect(moved.map((s) => [s.color, s.position])).toEqual([['lime', 0], ['blue', 40], ['red', 100]]);
    expect(stops[0].position).toBe(0); // input untouched
  });

  it('dropping a dragged stop on another changes the gradient and sticks', async () => {
    page = await mountView(GradientGenerator);
    const { state } = page;
    state.handleDragStart(0, dragEvent());
    state.handleDrop(1, dragEvent());
    await nextTick();
    expect(state.colorStops.map((s) => [s.color, s.position])).toEqual([['#8b5cf6', 0], ['#3b82f6', 100]]);
    expect(state.layers[0].colorStops[0].color).toBe('#8b5cf6');
    expect(state.cssGradient).toBe('linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)');
    expect(state.isDragging).toBe(false);
  });

  it('the move buttons do the same without a mouse', async () => {
    page = await mountView(GradientGenerator);
    const { state } = page;
    state.moveColorStop(1, 0);
    await nextTick();
    expect(state.cssGradient).toBe('linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)');
    expect(page.vm.$el.parentNode.querySelector('[aria-label="Move stop 1 later"]')).not.toBeNull();
  });
});

describe('animation', () => {
  const two = [layer([['#000', 0], ['#fff', 100]]), layer([['red', 0], ['blue', 100]], { blendMode: 'multiply' })];

  it('angle animation rotates the animated layer with a registered property', () => {
    const css = gradientStackCss(two, { animation: { enabled: true, type: 'angle', duration: 4, direction: 'normal', iterationCount: 'infinite' }, animatedIndex: 1 });
    const image = css.declarations.find(([p]) => p === 'background-image')[1];
    expect(image).toBe('linear-gradient(90deg, #000 0%, #fff 100%), linear-gradient(calc(90deg + var(--gradient-angle)), red 0%, blue 100%)');
    expect(css.atRules).toContain('@property --gradient-angle');
    expect(css.atRules).toMatch(/@keyframes gradient-angle[\s\S]*--gradient-angle: 360deg/);
    expect(css.declarations).toContainEqual(['animation', 'gradient-angle 4s linear normal infinite']);
    expect(css.declarations).toContainEqual(['background-blend-mode', 'normal, multiply']);
  });

  it('position animation keeps every layer and scrolls only the current one', () => {
    const css = gradientStackCss(two, { animation: { enabled: true, type: 'position' }, animatedIndex: 0 });
    expect(css.declarations.find(([p]) => p === 'background-image')[1].split('-gradient(').length - 1).toBe(2);
    expect(css.declarations).toContainEqual(['background-size', '200% 200%, 100% 100%']);
    expect(css.declarations).toContainEqual(['background-position', 'var(--gradient-shift) 50%, 0% 0%']);
  });

  it('radial layers cannot rotate, so nothing animates', () => {
    const radial = [layer([['red', 0], ['blue', 100]], { type: 'radial' })];
    expect(gradientStackCss(radial, { animation: { enabled: true, type: 'angle' } }).animated).toBe(false);
  });

  it('every code export carries the keyframes and the animation property', async () => {
    page = await mountView(GradientGenerator);
    const { state } = page;
    state.addLayer();
    state.animationEnabled = true;
    state.animationType = 'angle';
    await nextTick();
    expect(state.previewCss.declarations.find(([p]) => p === 'background-image')[1].split('-gradient(').length - 1).toBe(2);
    for (const format of ['css', 'css-vars', 'scss', 'react', 'vue']) {
      state.exportFormat = format;
      await nextTick();
      expect(state.formattedExportCode, format).toContain('@keyframes gradient-angle');
      expect(state.formattedExportCode, format).toContain('@property --gradient-angle');
      expect(state.formattedExportCode, format).toMatch(/animation: '?gradient-angle 3s linear alternate infinite/);
    }
    state.exportFormat = 'tailwind';
    await nextTick();
    expect(state.formattedExportCode).toContain("keyframes: {\n        'gradient-angle': {");
    expect(state.formattedExportCode).toContain("'to': { '--gradient-angle': '360deg' },");
    expect(state.formattedExportCode).toContain("'gradient-primary': 'gradient-angle 3s linear alternate infinite'");

    state.animationType = 'color';
    state.exportFormat = 'css';
    await nextTick();
    expect(state.formattedExportCode).toContain('@keyframes gradient-color');
    expect(state.formattedExportCode).toContain('filter: hue-rotate(360deg)');
  });

  it('exports stay as before with animation off', async () => {
    page = await mountView(GradientGenerator);
    expect(page.state.formattedExportCode).toBe('background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);\nbackground-image: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);');
  });
});

describe('colour parsing', () => {
  it('reads short hex, hex with alpha, rgb() and names', () => {
    expect(stopRgba({ color: '#fff', opacity: 50 })).toBe('rgba(255, 255, 255, 0.5)');
    expect(stopRgba({ color: '#ff000080', opacity: 100 })).toBe('rgba(255, 0, 0, 0.502)');
    expect(stopRgba({ color: '#fff8', opacity: 50 })).toBe('rgba(255, 255, 255, 0.267)');
    expect(stopRgba({ color: 'rgb(10, 20, 30)', opacity: 25 })).toBe('rgba(10, 20, 30, 0.25)');
    expect(stopRgba({ color: 'rebeccapurple', opacity: 100 })).toBe('rgba(102, 51, 153, 1)');
    expect(stopRgba({ color: 'not a colour', opacity: 100 })).toBe('rgba(0, 0, 0, 0)');
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
  });

  it('keeps what the user typed when opaque, and applies opacity otherwise', () => {
    expect(stopCss({ color: 'teal', opacity: 100 })).toBe('teal');
    expect(stopCss({ color: 'teal', opacity: 40 })).toBe('rgba(0, 128, 128, 0.4)');
  });

  it('the preview of a half-transparent short-hex stop is not black', async () => {
    page = await mountView(GradientGenerator);
    page.state.setStopValue(page.state.colorStops[0], 'color', '#fff');
    page.state.setStopValue(page.state.colorStops[0], 'opacity', 50);
    await nextTick();
    expect(page.state.cssGradient).toContain('rgba(255, 255, 255, 0.5) 0%');
  });
});

describe('contrast check', () => {
  it('composites transparent stops over the backdrop', () => {
    const clear = [layer([['#fff', 0, 0], ['#fff', 100, 0]])];
    expect(sampleStackColor(clear, 50, '#111827')).toEqual({ r: 17, g: 24, b: 39 });
    // White text on a see-through white gradient over a dark backdrop reads well.
    expect(worstContrast(clear, '#ffffff', '#111827')).toBeGreaterThan(15);
    expect(worstContrast(clear, 'nope', '#111827')).toBeNull();
  });

  it('includes every visible layer, not just the current one', async () => {
    page = await mountView(GradientGenerator);
    const { state } = page;
    state.layers = [
      layer([['#ffffff', 0], ['#ffffff', 100]]),
      layer([['#000000', 0], ['#000000', 100]]),
    ];
    state.currentLayerIndex = 1;
    state.accessibilityTextColor = '#000000';
    await nextTick();
    // Layer 1 (opaque white) paints on top of the black current layer.
    expect(state.contrastRatio).toBeCloseTo(21, 1);
    state.layers[0].enabled = false;
    await nextTick();
    expect(state.contrastRatio).toBeCloseTo(1, 1);
  });

  it('uses the chosen backdrop', async () => {
    page = await mountView(GradientGenerator);
    const { state } = page;
    state.setStopValue(state.colorStops[0], 'opacity', 0);
    state.setStopValue(state.colorStops[1], 'opacity', 0);
    state.accessibilityTextColor = '#ffffff';
    await nextTick();
    expect(state.contrastRatio).toBeCloseTo(1, 1);
    state.accessibilityBackdrop = 'night';
    await nextTick();
    expect(state.contrastRatio).toBeGreaterThan(15);
  });
});
