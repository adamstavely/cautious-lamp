/**
 * The font library (src/assets/fonts.json): Google Fonts families with their
 * categories (`tags`), scripts (`supports`), weights and pairings. Filter
 * choices come from the families themselves, so a filter never offers a
 * category or script that would match nothing.
 */

export const WEIGHT_NAMES = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
};

export const weightName = (weight) => WEIGHT_NAMES[Number(weight)] ?? 'Unknown';

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** The categories, scripts and weights the families have, as select options with an "all" choice first */
export function filterOptions(fonts) {
  const tags = [...new Set(fonts.flatMap((font) => font.tags ?? []))].sort();
  const scripts = [...new Set(fonts.flatMap((font) => font.supports ?? []))].sort();
  const weights = [...new Set(fonts.flatMap((font) => font.weights ?? []))].sort((a, b) => Number(a) - Number(b));
  return {
    categories: [{ value: '', label: 'All categories' }, ...tags.map((tag) => ({ value: tag, label: capitalize(tag) }))],
    scripts: [{ value: '', label: 'All scripts' }, ...scripts.map((script) => ({ value: script, label: capitalize(script) }))],
    weights: [{ value: '', label: 'All weights' }, ...weights.map((weight) => ({ value: weight, label: `${weightName(weight)} (${weight})` }))],
  };
}

/** Families matching a name search and the category, script and weight filters (empty filters match all) */
export function filterFonts(fonts, { search = '', tag = '', script = '', weight = '' } = {}) {
  const query = search.trim().toLowerCase();
  return fonts.filter(
    (font) =>
      (!query || font.name.toLowerCase().includes(query)) &&
      (!tag || (font.tags ?? []).includes(tag)) &&
      (!script || (font.supports ?? []).includes(script)) &&
      (!weight || (font.weights ?? []).includes(weight)),
  );
}

/** Families the favourites pair well with, in the library, not already favourites, at most `limit` */
export function pairingRecommendations(fonts, favorites, limit = 8) {
  const byName = new Map(fonts.map((font) => [font.name, font]));
  const picked = new Map();
  for (const name of favorites) {
    for (const pair of byName.get(name)?.pairsWellWith ?? []) {
      const font = byName.get(pair);
      if (font && !favorites.includes(pair) && !picked.has(pair)) picked.set(pair, font);
    }
  }
  return [...picked.values()].slice(0, limit);
}

/** The family's page on Google Fonts */
export const specimenUrl = (font) => `https://fonts.google.com/specimen/${encodeURIComponent(font.name).replace(/%20/g, '+')}`;
