// The Timeline generator: the preview and the exports render the same
// timeline, the bugs found in review stay fixed (icons, connector, early
// errors, a preview hidden from screen readers), and the editor's reorder,
// duplicate, collapse and saved state work.
import { compileScript, parse } from '@vue/compiler-sfc';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as Vue from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runModule } from './helpers/generators.js';
import { mountView } from './helpers/mountView.js';
import TimelineRender from '../src/components/timeline/TimelineRender.vue';
import TimelineGenerator from '../src/views/TimelineGenerator.vue';
import { generateTimelineCode } from '../src/utils/timelineExport.js';
import {
  TIMELINE_CSS, TIMELINE_ICONS, TIMELINE_STYLE_VALUES, contrastRatio, defaultTimelineConfig, readableOn, restoreTimeline, timelineItems,
} from '../src/utils/timelineTheme.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const STORAGE_KEY = 'cautious-lamp:timeline-generator';
const EVIL = 'evil </script><script>alert(1)</script> & "quotes"  ';

const EVENTS = [
  { date: '2020-03-01', title: 'Kickoff', description: 'Team formed', icon: 'flag', color: '', side: 'auto' },
  { date: '2020-01-15', title: 'Idea', description: '', icon: 'circle-check', color: '#8b5cf6', side: 'right' },
  { date: '2999-06-01', title: 'Launch', description: 'Everyone', icon: 'map-pin', color: '#059669', side: 'auto' },
  { date: '', title: 'Someday', description: '', icon: '', color: '', side: 'auto' },
];
const configFor = (style, extra = {}) => ({ ...defaultTimelineConfig(), style, theme: 'light', keyInsight: 'It took a while', ...extra });

const mounted = [];
afterEach(() => {
  mounted.splice(0).forEach((unmount) => unmount());
  window.localStorage.clear();
});

function mountComponent(component, props) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const app = Vue.createApp(component, props);
  app.config.warnHandler = () => {};
  app.mount(el);
  mounted.push(() => {
    app.unmount();
    el.remove();
  });
  return el;
}

async function compileVue(source, id) {
  const { descriptor, errors } = parse(source, { filename: `${id}.vue` });
  if (errors.length) throw new Error(errors.map((e) => e.message).join('; '));
  const script = compileScript(descriptor, { id, inlineTemplate: true });
  return (await runModule(script.content, { vue: Vue }, 'js')).default;
}

/** The markup without what only differs in how it is styled: inline styles, preview scoping, Vue's comments */
const normalized = (el) => el.innerHTML
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s(style|data-tl-preview|data-v-[a-z0-9]+)="[^"]*"/g, '')
  .replace(/>\s+</g, '><');

describe('preview and exports', () => {
  it.each(TIMELINE_STYLE_VALUES)('the Vue export renders exactly the preview markup (%s)', async (style) => {
    const config = configFor(style, { cards: style !== 'compact' });
    const preview = mountComponent(TimelineRender, { config, events: EVENTS });
    await Vue.nextTick();
    const exported = mountComponent(await compileVue(generateTimelineCode('vue', config, EVENTS), `tl-${style}`));
    await Vue.nextTick();
    expect(normalized(exported)).toBe(normalized(preview));
    expect(preview.querySelector('section').className).toContain(`tl--${style}`);
  });

  it('the React export renders the same markup too, as an ordered list with headings and dates', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const config = configFor('milestones');
    const { Timeline } = await runModule(generateTimelineCode('react', config, EVENTS), { react: React });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(React.createElement(Timeline)));
    const preview = mountComponent(TimelineRender, { config, events: EVENTS });
    await Vue.nextTick();
    const reactMarkup = container.innerHTML.replace(/<style>[\s\S]*?<\/style>/, '');
    expect(normalized({ innerHTML: reactMarkup })).toBe(normalized(preview));
    expect(container.querySelector('section[aria-labelledby="timeline-heading"] h2#timeline-heading').textContent).toBe(config.title);
    expect(container.querySelectorAll('ol > li h3')).toHaveLength(4);
    expect(container.querySelector('time').getAttribute('datetime')).toBe('2020-01-15');
    await act(async () => root.unmount());
    container.remove();
  });

  it('carries its own stylesheet and needs nothing else: no Tailwind classes or icon fonts', () => {
    const config = configFor('vertical');
    for (const format of ['react', 'vue']) {
      const code = generateTimelineCode(format, config, EVENTS);
      expect(code).not.toMatch(/material-symbols|text-gray-|flex-shrink-0|rounded-full/);
      expect(code).toContain('@container (max-width:36rem)');
    }
    expect(generateTimelineCode('vue', config, EVENTS)).toContain(TIMELINE_CSS);
  });

  it('keeps user text inert in the code and the SVG', async () => {
    const events = [{ ...EVENTS[0], title: EVIL, description: '</style><b>x</b>' }];
    const config = configFor('rail', { title: EVIL, summary: EVIL });
    const vue = generateTimelineCode('vue', config, events);
    expect(vue.match(/<\/script/gi)).toHaveLength(1);
    expect(vue.match(/<\/style/gi)).toHaveLength(1);
    const el = mountComponent(await compileVue(vue, 'tl-evil'));
    await Vue.nextTick();
    expect(el.querySelector('h3').textContent).toBe(EVIL);
    expect(el.querySelector('script, b')).toBeNull();

    const svg = generateTimelineCode('svg', config, events);
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.querySelector('script')).toBeNull();
    expect(doc.querySelector('title').textContent).toBe(EVIL);
  });

  it.each(TIMELINE_STYLE_VALUES)('exports a well-formed SVG that describes every event (%s)', (style) => {
    const svg = generateTimelineCode('svg', configFor(style, { theme: 'dark' }), EVENTS);
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    const desc = doc.querySelector('desc').textContent;
    for (const event of EVENTS) expect(desc).toContain(event.title);
    expect(svg).toContain('#111827');
  });
});

describe('the timeline itself', () => {
  it('draws the chosen Lucide icon (Check and Location used to show the calendar)', async () => {
    const el = mountComponent(TimelineRender, { config: configFor('vertical'), events: EVENTS });
    await Vue.nextTick();
    const paths = (name) => TIMELINE_ICONS[name].node.filter(([tag]) => tag === 'path').map(([, attrs]) => attrs.d);
    const markers = [...el.querySelectorAll('.tl-marker')];
    const markerHtml = markers.map((m) => m.innerHTML);
    // Sorted by date: Idea (circle-check), Kickoff (flag), Launch (map-pin), then the undated one
    expect(paths('circle-check').every((d) => markerHtml[0].includes(d))).toBe(true);
    expect(paths('flag').every((d) => markerHtml[1].includes(d))).toBe(true);
    expect(paths('map-pin').every((d) => markerHtml[2].includes(d))).toBe(true);
    expect(markers[3].querySelector('svg')).toBeNull();
    expect(paths('calendar-check').some((d) => markerHtml[0].includes(d))).toBe(false);
  });

  it('is a labelled region with an ordered list, not a single image', async () => {
    const el = mountComponent(TimelineRender, { config: configFor('vertical', { showHeader: false }), events: EVENTS });
    await Vue.nextTick();
    expect(el.querySelector('[role="img"]')).toBeNull();
    const section = el.querySelector('section');
    expect(el.querySelector(`#${section.getAttribute('aria-labelledby')}`).textContent).toBe('Product launch');
    expect(el.querySelector('header').className).toContain('tl-sr');
    expect(el.querySelectorAll('ol.tl-list > li')).toHaveLength(4);
    expect(el.querySelectorAll('.tl-marker[aria-hidden="true"]')).toHaveLength(4);
    expect(el.querySelector('.tl-insight').textContent).toContain('It took a while');
  });

  it('says which milestones are done and which are upcoming, not by colour alone', async () => {
    const el = mountComponent(TimelineRender, { config: configFor('milestones'), events: EVENTS });
    await Vue.nextTick();
    const states = [...el.querySelectorAll('.tl-item')].map((li) => li.className);
    expect(states[0]).toContain('tl-item--done');
    expect(states[1]).toContain('tl-item--to-upcoming');
    expect(states[2]).toContain('tl-item--upcoming');
    expect([...el.querySelectorAll('.tl-title .tl-sr')].map((s) => s.textContent.trim())).toEqual(['Completed:', 'Completed:', 'Upcoming:', 'Upcoming:']);
  });

  it('alternates sides unless an event picks one', () => {
    const items = timelineItems(EVENTS, { sortByDate: true }, new Date(2026, 0, 1));
    expect(items.map((i) => i.side)).toEqual(['right', 'right', 'left', 'right']);
  });

  it('draws connectors from each marker to the next item, whatever the text height', () => {
    expect(TIMELINE_CSS).toContain('.tl-item:not(:last-child)::before{content:"";position:absolute;top:calc(var(--tl-marker) + var(--tl-offset))');
    expect(TIMELINE_CSS).toContain('height:calc(100% - var(--tl-marker) + var(--tl-gap))');
    expect(TIMELINE_CSS).not.toMatch(/- 3rem/);
  });

  it('puts every layout in one column when it is narrow', () => {
    const narrow = TIMELINE_CSS.slice(TIMELINE_CSS.indexOf('@container (max-width:36rem)'));
    expect(TIMELINE_CSS).toContain('container-type:inline-size');
    for (const style of ['horizontal', 'milestones', 'alternating', 'rail']) expect(narrow).toContain(`.tl--${style} .tl-item`);
  });

  it('picks the icon colour that reads on each marker', () => {
    expect(readableOn('#059669')).toBe('#111827');
    expect(readableOn('#2563eb')).toBe('#ffffff');
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
  });

  it('cleans up its stylesheet when it goes away', async () => {
    const el = mountComponent(TimelineRender, { config: configFor('vertical'), events: EVENTS });
    await Vue.nextTick();
    const scope = el.querySelector('section').dataset.tlPreview;
    expect(document.getElementById('timeline-css')?.textContent).toBe(TIMELINE_CSS);
    expect(document.querySelector(`style[data-timeline-preview="${scope}"]`).textContent).toContain('--tl-color:#8b5cf6');
    mounted.splice(0).forEach((unmount) => unmount());
    expect(document.getElementById('timeline-css')).toBeNull();
    expect(document.querySelector(`style[data-timeline-preview="${scope}"]`)).toBeNull();
  });
});

describe('the editor', () => {
  let page;
  beforeEach(() => window.localStorage.clear());
  afterEach(() => page?.unmount());

  const text = () => document.body.textContent.replace(/\s+/g, ' ');

  it('only says the title and summary are missing once you have left the field', async () => {
    page = await mountView(TimelineGenerator);
    page.state.config.title = '';
    await Vue.nextTick();
    expect(text()).not.toContain('Add a title');
    document.querySelector('input[required]').dispatchEvent(new Event('blur'));
    await Vue.nextTick();
    expect(text()).toContain('Add a title');
    expect(page.state.accessibilityChecks[0].state).toBe('fail');
  });

  it('moves, duplicates and removes events, and keeps manual order when sorting is off', async () => {
    page = await mountView(TimelineGenerator);
    const { state } = page;
    state.config.sortByDate = false;
    await Vue.nextTick();
    const titles = () => state.events.map((e) => e.title);
    const first = state.events[0];
    state.move(first, 1);
    expect(titles().slice(0, 2)).toEqual(['Research complete', 'Kickoff']);
    state.duplicate(first);
    expect(titles()[2]).toBe('Kickoff (copy)');
    state.remove(state.events[2]);
    expect(state.events).toHaveLength(4);
    await Vue.nextTick();
    expect([...document.querySelectorAll('.tl-title')].map((h) => h.textContent)).toEqual(['Research complete', 'Kickoff', 'Beta release', 'Launch']);
    expect(document.querySelector('button[aria-label^="Move “Research complete” up"]').disabled).toBe(true);
  });

  it('collapses events to a one-line summary', async () => {
    page = await mountView(TimelineGenerator);
    page.state.setAllCollapsed(true);
    await Vue.nextTick();
    const toggles = [...document.querySelectorAll('.event-toggle')];
    expect(toggles.every((t) => t.getAttribute('aria-expanded') === 'false')).toBe(true);
    expect(document.getElementById(toggles[0].getAttribute('aria-controls')).style.display).toBe('none');
    expect(text()).toContain('Expand all');
  });

  it('keeps your timeline across a reload, and can start over with an undo', async () => {
    page = await mountView(TimelineGenerator);
    page.state.config.title = 'Our history';
    page.state.events[0].title = 'Founded';
    page.state.config.style = 'rail';
    await Vue.nextTick();
    page.unmount();

    page = await mountView(TimelineGenerator);
    expect(page.state.config).toMatchObject({ title: 'Our history', style: 'rail' });
    expect(page.state.events.some((e) => e.title === 'Founded')).toBe(true);

    page.state.startOver();
    await Vue.nextTick();
    expect(page.state.config.title).toBe('Product launch');
    expect(text()).toContain('Started over with the example timeline');
    page.state.undoStartOver();
    expect(page.state.config.title).toBe('Our history');
  });

  it('ignores saved data it cannot use', () => {
    const restored = restoreTimeline({ config: { style: 'spiral', spacing: 'lots', title: 5 }, events: [{ title: 'Ok', icon: 'not-an-icon', color: 'red' }, null] });
    expect(restored.config).toMatchObject({ style: 'vertical', spacing: 32, title: 'Product launch' });
    expect(restored.events).toEqual([expect.objectContaining({ title: 'Ok', icon: '', color: '#2563eb', side: 'auto' })]);
  });

  it('exports what is on screen', async () => {
    page = await mountView(TimelineGenerator);
    page.state.config.style = 'compact';
    page.state.selectedExportFormat = 'vue';
    await Vue.nextTick();
    expect(page.state.generatedCode).toContain("layout: { type: String, default: \"compact\" }");
    page.state.selectedExportFormat = 'svg';
    await Vue.nextTick();
    expect(page.state.fileName).toBe('timeline.svg');
  });
});
