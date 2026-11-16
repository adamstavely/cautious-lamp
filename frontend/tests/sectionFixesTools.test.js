// Page-specific accessibility fixes in the Tools section: a pausable animation
// preview (WCAG 2.2.2), rating buttons that say what they mean, errors next to
// the field that caused them, no made-up contrast results, and a world map
// that is one tab stop instead of ~200.
import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CSSAnimationGenerator from '../src/views/CSSAnimationGenerator.vue';
import SystemUsabilityScale from '../src/views/SystemUsabilityScale.vue';
import ColorContrastChecker from '../src/views/ColorContrastChecker.vue';
import MapCanvas from '../src/components/maps/MapCanvas.js';
import AppIcon from '../src/components/ui/AppIcon.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const byText = (text) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

let page;
let cleanup = [];
afterEach(() => {
  page?.unmount();
  page = null;
  cleanup.forEach((fn) => fn());
  cleanup = [];
  vi.unstubAllGlobals();
});

describe('CSS animation generator', () => {
  it('pauses and resumes the preview', async () => {
    page = await mountView(CSSAnimationGenerator);
    expect(page.state.paused).toBe(false);
    expect(page.state.playState).toBe('running');
    expect(document.querySelector('[data-reduced-motion-hint]')).toBeNull();

    byText('Pause').click();
    await flush();
    expect(page.state.playState).toBe('paused');
    expect(byText('Play')).toBeTruthy();

    byText('Play').click();
    await flush();
    expect(page.state.playState).toBe('running');
  });

  it('starts paused, and says so, when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
    page = await mountView(CSSAnimationGenerator);
    expect(page.state.playState).toBe('paused');
    expect(byText('Play')).toBeTruthy();
    expect(document.querySelector('[data-reduced-motion-hint]').textContent).toMatch(/reduced motion/i);

    // Choosing a looping preset keeps the preview paused
    byText('Bounce').click();
    await flush();
    expect(page.state.iterationCount).toBe('infinite');
    expect(page.state.playState).toBe('paused');
  });
});

describe('System Usability Scale', () => {
  it('names each rating with its place on the scale', async () => {
    page = await mountView(SystemUsabilityScale);
    const first = document.querySelector('[data-question="1"]');
    const names = [...first.querySelectorAll('[role="radio"]')].map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['1, strongly disagree', '2, disagree', '3, neutral', '4, agree', '5, strongly agree']);
    // The <ol> numbers the statements; the label doesn't repeat the number
    expect(first.querySelector('.ui-field-label').textContent.trim()).toBe('I think that I would like to use this system frequently.');
  });

  it('marks unanswered statements invalid and focuses the first', async () => {
    page = await mountView(SystemUsabilityScale);
    page.state.form.systemName = 'Mobile App';
    page.state.form.q1 = 3;
    page.state.form.q2 = 3;
    await flush();

    document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();

    const q1 = document.querySelector('[data-question="1"] [role="radiogroup"]');
    const q3 = document.querySelector('[data-question="3"] [role="radiogroup"]');
    expect(q1.hasAttribute('aria-invalid')).toBe(false);
    expect(q3.getAttribute('aria-invalid')).toBe('true');
    const errorId = q3.getAttribute('aria-describedby');
    expect(document.getElementById(errorId).getAttribute('role')).toBe('alert');
    expect(document.querySelectorAll('[role="radiogroup"][aria-invalid="true"]')).toHaveLength(8);

    // Focus lands on the first unanswered group's tab stop (its first option)
    expect(document.activeElement.closest('[data-question]').dataset.question).toBe('3');
    expect(document.activeElement.getAttribute('aria-label')).toBe('1, strongly disagree');

    // Answering clears that group's error
    page.state.form.q3 = 4;
    await flush();
    expect(q3.hasAttribute('aria-invalid')).toBe(false);
  });
});

describe('Color contrast checker', () => {
  it('flags a colour it cannot read instead of showing a ratio of 1.00', async () => {
    page = await mountView(ColorContrastChecker);
    const ratio = () => document.querySelector('[data-contrast-ratio]').textContent.trim();
    const foreground = () => document.querySelector('input[aria-invalid="true"]');
    expect(ratio()).not.toBe('—');
    expect(foreground()).toBeNull();

    page.state.foregroundColor = 'not-a-colour';
    await flush();
    expect(ratio()).toBe('—');
    expect(foreground()).toBeTruthy();
    expect(document.getElementById(foreground().getAttribute('aria-describedby')).textContent).toMatch(/supported format/);
    // No Pass/Fail chips for a pair that has no contrast
    expect(document.body.textContent).not.toMatch(/\bFail\b/);

    page.state.foregroundColor = '#000000';
    await flush();
    expect(ratio()).not.toBe('—');
    expect(foreground()).toBeNull();
  });

  it('names the picker buttons starting with their visible text', async () => {
    page = await mountView(ColorContrastChecker);
    const names = [...document.querySelectorAll('.picker-button')].map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['Pick color, foreground', 'Pick color, background']);
  });
});

describe('Map canvas', () => {
  // Three small squares, named out of order, each one openable
  const square = (lng, lat) => ({ type: 'Polygon', coordinates: [[[lng, lat], [lng + 10, lat], [lng + 10, lat + 10], [lng, lat + 10], [lng, lat]]] });
  const geo = {
    kind: 'world',
    projection: { type: 'world' },
    features: [
      { type: 'Feature', id: 'C', properties: {}, geometry: square(40, 0) },
      { type: 'Feature', id: 'A', properties: {}, geometry: square(0, 0) },
      { type: 'Feature', id: 'B', properties: {}, geometry: square(20, 0) },
    ],
    context: [],
    overlay: null,
    index: { labels: ['Chile', 'Austria', 'Brazil'] },
    drillable: (feature) => feature.id,
  };

  const mountMap = async (onOpen) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const app = createApp({ render: () => h(MapCanvas, { geo, label: 'Choropleth map of the world', onOpen }) });
    app.component('AppIcon', AppIcon);
    app.config.warnHandler = () => {};
    app.mount(el);
    cleanup.push(() => {
      app.unmount();
      el.remove();
    });
    await flush();
    return el;
  };

  const region = (el, id) => el.querySelector(`[data-country="${id}"]`);
  const key = (target, k) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

  it('has one tab stop, and the arrow keys move between regions by name', async () => {
    const opened = [];
    const el = await mountMap((id) => opened.push(id));
    const stops = [...el.querySelectorAll('[role="button"]')].filter((r) => r.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    // The first by name (Austria), not the first in the data (Chile)
    expect(stops[0]).toBe(region(el, 'A'));
    expect(region(el, 'C').getAttribute('tabindex')).toBe('-1');

    region(el, 'A').focus();
    key(region(el, 'A'), 'ArrowRight');
    await flush();
    expect(document.activeElement).toBe(region(el, 'B'));
    expect(region(el, 'B').getAttribute('tabindex')).toBe('0');
    expect(region(el, 'A').getAttribute('tabindex')).toBe('-1');

    key(region(el, 'B'), 'End');
    await flush();
    expect(document.activeElement).toBe(region(el, 'C'));

    key(region(el, 'C'), 'ArrowRight');
    await flush();
    expect(document.activeElement).toBe(region(el, 'A'));

    key(region(el, 'A'), 'Enter');
    expect(opened).toEqual(['A']);
  });

  it('points to the Table tab in its accessible name', async () => {
    const el = await mountMap(() => {});
    expect(el.querySelector('svg').getAttribute('aria-label')).toMatch(/^Choropleth map of the world; values are in the Table tab/);
  });
});
