// The font library: filter choices come from the families themselves (no
// category or script that matches nothing), favourites and recently viewed
// persist in this browser, the comparison holds three families, pairings come
// from the families' own data, and the exported embed code is a valid
// Google Fonts css2 URL.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fontData from '../src/assets/fonts.json';
import { filterFonts, filterOptions, pairingRecommendations, specimenUrl, weightName } from '../src/utils/fontLibrary.js';
import { generateCSS } from '../src/composables/useCSSGenerator.js';
import FontPreviewer from '../src/components/font-previewer/FontPreviewer.vue';
import { mountView } from './helpers/mountView.js';

const FONTS = [
  { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter', tags: ['sans-serif'], supports: ['latin', 'cyrillic'], weights: ['400', '700'], pairsWellWith: ['Merriweather', 'Not In Library'] },
  { name: 'Merriweather', url: 'https://fonts.googleapis.com/css2?family=Merriweather', tags: ['serif'], supports: ['latin'], weights: ['300', '400'], pairsWellWith: ['Inter'] },
  { name: 'Fira Code', url: 'https://fonts.googleapis.com/css2?family=Fira+Code', tags: ['monospace'], supports: ['latin'], weights: ['400'] },
];

describe('filterOptions', () => {
  it('offers only the categories, scripts and weights the families have', () => {
    const { categories, scripts, weights } = filterOptions(FONTS);
    expect(categories.map((o) => o.value)).toEqual(['', 'monospace', 'sans-serif', 'serif']);
    expect(scripts.map((o) => o.value)).toEqual(['', 'cyrillic', 'latin']);
    expect(weights.map((o) => o.value)).toEqual(['', '300', '400', '700']);
    expect(weights[1].label).toBe('Light (300)');
  });

  it('never offers a filter that matches nothing in the real library', () => {
    const { categories, scripts, weights } = filterOptions(fontData);
    for (const { value } of categories.slice(1)) expect(filterFonts(fontData, { tag: value }).length).toBeGreaterThan(0);
    for (const { value } of scripts.slice(1)) expect(filterFonts(fontData, { script: value }).length).toBeGreaterThan(0);
    for (const { value } of weights.slice(1)) expect(filterFonts(fontData, { weight: value }).length).toBeGreaterThan(0);
  });
});

describe('filterFonts', () => {
  it('matches the name case-insensitively and combines filters', () => {
    expect(filterFonts(FONTS, { search: '  fira ' }).map((f) => f.name)).toEqual(['Fira Code']);
    expect(filterFonts(FONTS, { script: 'latin', weight: '400' })).toHaveLength(3);
    expect(filterFonts(FONTS, { script: 'cyrillic', tag: 'serif' })).toHaveLength(0);
    expect(filterFonts(FONTS)).toHaveLength(3);
  });
});

describe('pairingRecommendations', () => {
  it('suggests library families the favourites pair with, skipping favourites and unknown names', () => {
    expect(pairingRecommendations(FONTS, ['Inter']).map((f) => f.name)).toEqual(['Merriweather']);
    expect(pairingRecommendations(FONTS, ['Inter', 'Merriweather'])).toEqual([]);
    expect(pairingRecommendations(FONTS, [])).toEqual([]);
  });
});

describe('helpers', () => {
  it('names weights and links to the Google Fonts specimen', () => {
    expect(weightName('700')).toBe('Bold');
    expect(weightName(950)).toBe('Unknown');
    expect(specimenUrl({ name: 'Fira Code' })).toBe('https://fonts.google.com/specimen/Fira+Code');
  });
});

describe('generateCSS embed', () => {
  it('writes one family= per font with its own sorted weights', () => {
    const html = generateCSS([FONTS[0], { ...FONTS[1], weights: ['400', '300'] }], { format: 'embed' });
    expect(html).toContain('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@300;400&display=swap');
    expect(html).not.toContain('&wght=');
  });
});

describe('FontPreviewer', () => {
  let page;
  const flush = async () => {
    for (let i = 0; i < 4; i++) await nextTick();
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    page?.unmount();
    page = null;
  });

  it('shows every family and filters them', async () => {
    page = await mountView(FontPreviewer);
    const { state } = page;
    expect(state.filteredFonts).toHaveLength(fontData.length);
    state.search = fontData[0].name;
    await flush();
    expect(state.filteredFonts.map((f) => f.name)).toContain(fontData[0].name);
    expect(state.hasFilters).toBe(true);
    state.clearFilters();
    await flush();
    expect(state.filteredFonts).toHaveLength(fontData.length);
  });

  it('keeps favourites and recently viewed in this browser, ignoring names not in the library', async () => {
    localStorage.setItem('fontPreviewer_favorites', JSON.stringify([fontData[0].name, 'Gone Font']));
    page = await mountView(FontPreviewer);
    const { state } = page;
    expect(state.favorites).toEqual([fontData[0].name]);
    state.toggleFavorite(fontData[1]);
    expect(JSON.parse(localStorage.getItem('fontPreviewer_favorites'))).toEqual([fontData[0].name, fontData[1].name]);
    state.addToRecentlyViewed(fontData[2].name);
    expect(JSON.parse(localStorage.getItem('fontPreviewer_recentlyViewed'))).toEqual([fontData[2].name]);
  });

  it('holds at most three families in the comparison and says so', async () => {
    page = await mountView(FontPreviewer);
    const { state } = page;
    for (const font of fontData.slice(0, 4)) state.toggleCompare(font);
    expect(state.compareList).toHaveLength(3);
    expect(state.notice).toMatchObject({ type: 'error' });
    state.toggleCompare(fontData[0]);
    expect(state.compareList).toHaveLength(2);
  });

  it('exports code for the favourites and comparison without duplicates', async () => {
    page = await mountView(FontPreviewer);
    const { state } = page;
    expect(state.exportCount).toBe(0);
    state.toggleFavorite(fontData[0]);
    state.toggleCompare(fontData[0]);
    state.toggleCompare(fontData[1]);
    await flush();
    expect(state.exportCount).toBe(2);
    state.cssFormat = 'tailwind';
    await flush();
    expect(state.generatedCSS).toContain(`['${fontData[0].name}', 'sans-serif']`);
    expect(state.generatedCSS).toContain(`['${fontData[1].name}', 'sans-serif']`);
  });

  it('switches only the preview colours for the dark preview, never the app theme', async () => {
    page = await mountView(FontPreviewer);
    const { state } = page;
    const before = document.documentElement.className;
    state.toggleDarkMode();
    expect(state.previewDarkMode).toBe(true);
    expect(state.bgColor).not.toBe('#ffffff');
    expect(document.documentElement.className).toBe(before);
  });
});

vi.mock('../src/composables/useFontLoader.js', () => ({ loadFont: () => {} }));
