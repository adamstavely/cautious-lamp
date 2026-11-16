// Colour maths in the colour tools: CIEDE2000 and threshold-safe ratios in
// Compare colors, sRGB solving in the APCA calculator, the colour scale
// generator's contrast steps and stops, and the spacing scale's ratios.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calcContrast } from 'apcach';
import chroma from 'chroma-js';
import ColorContrastChecker from '../src/views/ColorContrastChecker.vue';
import SpacingScaleGenerator from '../src/views/SpacingScaleGenerator.vue';
import ColorScaleGenerator from '../src/views/ColorScaleGenerator.vue';
import { deltaE2000, formatBelowThreshold, formatContrastRatio, formatDeltaE } from '../src/utils/colourCompare.js';
import { solveInSrgb } from '../src/utils/apcaSrgb.js';
import { contrastRatio, divergingScale, findColorAtContrast, qualitativeScale, singleColorSequentialScale } from '../src/utils/colourScale.js';
import { SPACING_RATIOS, SPACING_RATIO_LABELS, spacingScale } from '../src/utils/spacingScale.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const WHITE = '#ffffff';
const chromaHue = (c) => chroma(c).lch()[2];

describe('Compare colors maths', () => {
  it('uses CIEDE2000, not CIE76', () => {
    // CIE76 (Euclidean Lab) gives about 19.0 here, which passed the 11 threshold
    expect(deltaE2000('#3b82f6', '#2563eb')).toBeCloseTo(10.88, 1);
    expect(deltaE2000([59, 130, 246], [37, 99, 235])).toBeCloseTo(10.88, 1);
  });

  it('never rounds a ratio up across a threshold', () => {
    expect(formatContrastRatio(4.495)).toBe('4.49');
    expect(formatContrastRatio(4.4999)).toBe('4.49');
    expect(formatContrastRatio(6.9999999)).toBe('6.99');
    expect(formatContrastRatio(2.99999)).toBe('2.99');
    expect(formatContrastRatio(4.5)).toBe('4.50');
    expect(formatContrastRatio(1.15)).toBe('1.15');
    expect(formatContrastRatio(21)).toBe('21.00');
    expect(formatDeltaE(10.996)).toBe('10.99');
    expect(formatBelowThreshold(4.4999999999999, [4.5])).toBe('4.49');
  });

  describe('page', () => {
    let page;
    afterEach(() => page?.unmount());

    it('shows 4.49 next to the AA fail for a 4.495 pair, and marks a DE2000 10.9 pair unsafe', async () => {
      page = await mountView(ColorContrastChecker, { path: '/tools/color-contrast-checker' });
      page.state.backgroundColor = WHITE;
      page.state.foregroundColor = '#767676'; // 4.54
      await nextTick();
      expect(document.querySelector('[data-contrast-ratio]').textContent).toBe('4.54');

      // A pair whose unrounded ratio is just under 4.5 (rgba composite on white)
      page.state.foregroundColor = 'rgba(0, 0, 0, 0.5345)';
      await nextTick();
      const ratio = page.state.contrastRatio;
      expect(ratio).toBeLessThan(4.5);
      expect(ratio).toBeGreaterThanOrEqual(4.495);
      expect(document.querySelector('[data-contrast-ratio]').textContent).toBe('4.49');
      expect(page.state.wcagCriteria[0].aaPass).toBe(false);

      page.state.foregroundColor = '#3b82f6';
      page.state.backgroundColor = '#2563eb';
      await nextTick();
      const normal = page.state.visionTypes.find((v) => v.name === 'Normal vision');
      expect(normal.deltaE).toBeCloseTo(10.88, 1);
      expect(normal.safe).toBe(false);
    });
  });
});

describe('APCA calculator solves in sRGB', () => {
  it('meets WCAG 4.5 on white at hue 145 by reducing chroma (was #008b00, 4.475:1)', () => {
    const r = solveInSrgb({ reference: WHITE, position: 'bg', contrast: 4.5, model: 'wcag', chroma: 0.2, hue: 145 });
    expect(r.meetsTarget).toBe(true);
    expect(contrastRatio(r.hex, WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(r.reducedChroma).toBeLessThan(0.2);
    expect(r.reducedChroma).toBeGreaterThan(0.1);
  });

  it('meets APCA Lc 75 on white at hue 30, chroma 0.37 (was #ff0000, Lc 64.1)', () => {
    const r = solveInSrgb({ reference: WHITE, position: 'bg', contrast: 75, model: 'apca', chroma: 0.37, hue: 30 });
    expect(r.hex).not.toBe('#ff0000');
    expect(calcContrast(r.hex, WHITE, 'apca', 'srgb')).toBeGreaterThanOrEqual(75);
    expect(r.reducedChroma).toBeLessThan(0.37);
  });

  it('keeps an in-gamut chroma as asked and still checks the hex', () => {
    const r = solveInSrgb({ reference: WHITE, position: 'bg', contrast: 60, model: 'apca', chroma: 0.05, hue: 145 });
    expect(r.reducedChroma).toBeNull();
    expect(r.color.chroma).toBe(0.05);
    expect(r.meetsTarget).toBe(true);
  });

  it('meets the target for text on a reference background and with max chroma', () => {
    const fg = solveInSrgb({ reference: WHITE, position: 'fg', contrast: 60, model: 'apca', chroma: 0.1, hue: 250 });
    expect(fg.meetsTarget).toBe(true);
    const max = solveInSrgb({ reference: '#000000', position: 'bg', contrast: 7, model: 'wcag', chroma: null, hue: 250 });
    expect(contrastRatio(max.hex, '#000000')).toBeGreaterThanOrEqual(7);
  });

  it('meets WCAG targets across hues and chromas', () => {
    for (const hue of [0, 30, 90, 145, 200, 260, 320]) {
      for (const c of [0.05, 0.15, 0.3]) {
        for (const target of [3, 4.5, 7]) {
          const r = solveInSrgb({ reference: WHITE, position: 'bg', contrast: target, model: 'wcag', chroma: c, hue });
          expect(contrastRatio(r.hex, WHITE), `${hue}/${c}/${target}`).toBeGreaterThanOrEqual(target);
        }
      }
    }
  });
});

describe('Color scale maths', () => {
  it('only accepts colours at or above the target contrast (was 4.49 for 4.5)', () => {
    for (const base of ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#808080', '#ec4899']) {
      for (const target of [3, 4.5, 7]) {
        const c = findColorAtContrast(base, WHITE, target);
        expect(contrastRatio(c, WHITE), `${base} @ ${target}`).toBeGreaterThanOrEqual(target);
        expect(contrastRatio(c, WHITE)).toBeLessThan(target + 0.15);
      }
    }
    // On a dark background it goes lighter
    expect(contrastRatio(findColorAtContrast('#3b82f6', '#111111', 7), '#111111')).toBeGreaterThanOrEqual(7);
  });

  it('includes the base colour in a one-colour sequential scale', () => {
    const scale = singleColorSequentialScale('#3b82f6', WHITE, 4.5, 9);
    expect(scale).toHaveLength(9);
    expect(scale).toContain('#3b82f6');
    const ratios = scale.map((c) => contrastRatio(c, WHITE));
    ratios.slice(1).forEach((r, i) => expect(r).toBeGreaterThan(ratios[i]));
    expect(ratios.at(-1)).toBeGreaterThanOrEqual(4.5);
    // A base with more contrast than the target still appears, at the end
    expect(singleColorSequentialScale('#1e3a8a', WHITE, 3, 5).at(-1)).toBe('#1e3a8a');
  });

  it('honours every stop in a diverging scale', () => {
    const scale = divergingScale(['#3b82f6', '#10b981', '#ef4444'], WHITE, 4.5, 9);
    expect(scale).toHaveLength(9);
    expect(scale[4]).toBe('#10b981'); // the middle stop is the centre
    expect(contrastRatio(scale[0], WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(scale[8], WHITE)).toBeGreaterThanOrEqual(4.5);

    // Four stops: the inner stops' hues show up on their arms
    const four = divergingScale(['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'], WHITE, 3, 9);
    expect(four[4]).toBe(WHITE);
    const hue = (c) => Math.round(chromaHue(c));
    expect(Math.abs(hue(four[3]) - hue('#8b5cf6'))).toBeLessThan(15);
    expect(Math.abs(hue(four[5]) - hue('#f59e0b'))).toBeLessThan(15);

    // Two stops still meet at the background
    const two = divergingScale(['#3b82f6', '#ef4444'], WHITE, 4.5, 7);
    expect(two[3]).toBe(WHITE);
  });

  it('keeps every qualitative colour as given', () => {
    const colours = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    expect(qualitativeScale(colours, 3)).toEqual(colours);
    const padded = qualitativeScale(colours, 8);
    expect(padded.slice(0, 5)).toEqual(colours);
    expect(padded).toHaveLength(8);
    expect(new Set(padded).size).toBe(8);
    padded.slice(5).forEach((c) => colours.forEach((u) => expect(deltaE2000(c, u)).toBeGreaterThan(10)));
  });

  describe('page', () => {
    let page;
    afterEach(() => page?.unmount());

    it('shows qualitative colours unchanged and describes the simulation honestly', async () => {
      HTMLCanvasElement.prototype.getContext = () => null;
      page = await mountView(ColorScaleGenerator, { path: '/tools/color-scale' });
      page.state.scaleType = 'qualitative';
      page.state.setSetting('steps', 3);
      await nextTick();
      expect(page.state.generatedScale).toEqual(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);
      expect(document.body.textContent).not.toContain('ordered by hue and saturation');

      page.state.scaleType = 'sequential';
      page.state.setSetting('steps', 9);
      await nextTick();
      expect(page.state.generatedScale).toContain('#3b82f6');
    });
  });
});

describe('Spacing scale maths', () => {
  it('names the ratios as the font scale does', () => {
    expect(SPACING_RATIOS).toEqual({ 'minor-third': 1.2, 'major-third': 1.25, 'perfect-fourth': 1.333, 'perfect-fifth': 1.5, 'golden-ratio': 1.618 });
    expect(SPACING_RATIO_LABELS['major-third']).toBe('Major Third (1.25)');
    expect(SPACING_RATIO_LABELS['perfect-fourth']).toBe('Perfect Fourth (1.333)');
    expect(SPACING_RATIO_LABELS['perfect-fifth']).toBe('Perfect Fifth (1.5)');
  });

  it('keeps whole pixels when they are distinct', () => {
    const { scale, precision } = spacingScale(4, 1.333);
    expect(precision).toBe(1);
    expect(scale).toEqual({ xs: 2, sm: 3, base: 4, md: 5, lg: 7, xl: 9, '2xl': 13, '3xl': 17, '4xl': 22, '5xl': 30 });
  });

  it('uses a finer grid instead of repeating a step (base 2, ratio 1.2 gave sm = base = 2)', () => {
    const { scale, precision, duplicates } = spacingScale(2, 1.2);
    expect(precision).toBe(0.25);
    expect(duplicates).toEqual([]);
    expect(scale.sm).toBe(1.75);
    expect(scale.base).toBe(2);
    const values = Object.values(scale);
    values.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(values[i]));
  });

  describe('page', () => {
    let page;
    afterEach(() => {
      page?.unmount();
      vi.restoreAllMocks();
    });

    it('exports the right ratio name and notes the finer rounding', async () => {
      let saved;
      URL.createObjectURL = (blob) => {
        saved = blob;
        return 'blob:spacing';
      };
      URL.revokeObjectURL = () => {};
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      page = await mountView(SpacingScaleGenerator, { path: '/tools/spacing-scale-generator' });
      expect(page.state.ratioOptions.map((o) => o.label)).toContain('Major Third (1.25)');
      page.state.selectedRatio = 'perfect-fifth';
      page.state.baseSpacing = 2;
      await nextTick();
      expect(document.querySelector('[data-precision-note]')?.textContent).toContain('0.5px');
      page.state.exportFormat('json');
      const json = JSON.parse(await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(saved);
      }));
      expect(json).toMatchObject({ ratio: 1.5, ratioName: 'perfect-fifth', base: 2 });
      const values = Object.values(json.scale);
      values.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(values[i]));
    });
  });
});
