// The color scale generator exports a Power BI report theme: every step as
// dataColors, plus the gradient and good/neutral/bad colours where they apply.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ColorScaleGenerator from '../src/views/ColorScaleGenerator.vue';
import { powerBiTheme, powerBiThemeFileName } from '../src/utils/powerBiTheme.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

describe('powerBiTheme', () => {
  const steps = ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'];

  it('gives a sequential scale its steps and a two-colour gradient', () => {
    expect(powerBiTheme({ name: 'Blues', type: 'sequential', colors: steps })).toEqual({
      name: 'Blues',
      dataColors: ['#F7FBFF', '#C6DBEF', '#6BAED6', '#2171B5', '#08306B'],
      minimum: '#F7FBFF',
      maximum: '#08306B',
    });
  });

  it('gives a diverging scale a three-colour gradient and bad, neutral and good', () => {
    const theme = powerBiTheme({ name: 'RdBu', type: 'diverging', colors: ['#b2182b', '#ef8a62', '#f7f7f7', '#67a9cf', '#2166ac'] });
    expect(theme).toMatchObject({ minimum: '#B2182B', center: '#F7F7F7', maximum: '#2166AC', bad: '#B2182B', neutral: '#F7F7F7', good: '#2166AC' });
    expect(theme.dataColors).toHaveLength(5);
  });

  it('gives a qualitative scale only its palette', () => {
    expect(powerBiTheme({ name: 'Set', type: 'qualitative', colors: ['#e41a1c', '#377eb8', '#4daf4a'] })).toEqual({
      name: 'Set',
      dataColors: ['#E41A1C', '#377EB8', '#4DAF4A'],
    });
  });

  it('normalises short and alpha hex, drops what it cannot read, and refuses an empty scale', () => {
    expect(powerBiTheme({ type: 'qualitative', colors: ['#abc', '#112233ff', 'not a colour'] }).dataColors).toEqual(['#AABBCC', '#112233']);
    expect(() => powerBiTheme({ colors: [] })).toThrow(/no colours/);
  });

  it('names the file safely', () => {
    expect(powerBiThemeFileName('Diverging color scale')).toBe('diverging-color-scale-power-bi-theme.json');
    expect(powerBiThemeFileName('')).toBe('color-scale-power-bi-theme.json');
  });
});

describe('Color scale generator', () => {
  let page;
  afterEach(() => {
    page?.unmount();
    vi.restoreAllMocks();
  });

  it('downloads the Power BI theme for the scale on screen', async () => {
    let saved;
    // jsdom has no object URLs
    URL.createObjectURL = (blob) => {
      saved = blob;
      return 'blob:theme';
    };
    URL.revokeObjectURL = () => {};
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    HTMLCanvasElement.prototype.getContext = () => null;

    page = await mountView(ColorScaleGenerator, { path: '/tools/color-scale' });
    await nextTick();
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Export Power BI theme');
    expect(button).toBeTruthy();
    button.click();
    await nextTick();

    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(saved);
    });
    const theme = JSON.parse(text);
    expect(theme.dataColors).toEqual(page.state.generatedScale.map((c) => c.toUpperCase().slice(0, 7)));
    expect(theme.minimum).toBe(theme.dataColors[0]);
    expect(theme.maximum).toBe(theme.dataColors.at(-1));
    expect(document.body.textContent).toContain('Browse for themes');
  });
});
