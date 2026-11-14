/**
 * Match the region names people type ("CA", "Cote d'Ivoire", "Cook County, IL")
 * to the features on a map, and suggest likely names for the ones that don't
 * match. Pure functions: the caller says which names and codes each feature
 * answers to (see utils/mapAreas.js).
 */

// Abbreviations map data uses, spelled out so either form matches
const EXPANSIONS = {
  st: 'saint',
  ste: 'sainte',
  mt: 'mount',
  ft: 'fort',
  is: 'islands',
  isl: 'islands',
  rep: 'republic',
  dem: 'democratic',
  eq: 'equatorial',
  fr: 'french',
  herz: 'herzegovina',
  cent: 'central',
  afr: 'african',
};
// Single letters stand for compass points only before another word ("N. Cyprus")
const COMPASS = { n: 'north', s: 'south', e: 'east', w: 'west' };
const DROP = new Set(['the', 'of']);

/**
 * Canonical form of a name for comparison: no accents, case or punctuation,
 * abbreviations spelled out, "the" and "of" dropped. Commas are kept (they
 * separate a county from its state).
 * @param {unknown} name
 * @returns {string}
 */
export function normalizeName(name) {
  const plain = String(name ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[.'’`]/g, ' ')
    .replace(/[^a-z0-9,]+/g, ' ');
  return plain
    .split(',')
    .map((part) => {
      const words = part.trim().split(/\s+/).filter(Boolean);
      return words
        .map((w, i) => EXPANSIONS[w] || (COMPASS[w] && i < words.length - 1 ? COMPASS[w] : w))
        .filter((w) => !DROP.has(w))
        .join(' ');
    })
    .filter(Boolean)
    .join(', ');
}

/** Edit distance (insertions, deletions, substitutions, adjacent swaps). */
export function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2] + 1);
      row.push(d);
    }
    prev2 = prev;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Index features by every name and code they answer to.
 * @param {Array} features GeoJSON features
 * @param {(feature, index) => { label: string, keys: string[] }} describe
 *   label is the name shown to people; keys are every spelling and code that
 *   should match it (the label is included automatically)
 * @param {{ canonical?: (normalized: string) => string }} [options]
 *   canonical rewrites a normalized key or query further for an area, e.g.
 *   counties drop "County" and turn a state name into its postal code
 * @returns {{ labels: string[], lookup: (name) => ({ index: number } | { candidates: number[] } | null), suggest: (name, limit?) => Array<{ index: number, label: string }> }}
 */
export function createRegionIndex(features, describe, { canonical = (s) => s } = {}) {
  const keyMap = new Map();
  const labels = [];
  const labelKeys = [];
  const canon = (name) => canonical(normalizeName(name));
  features.forEach((feature, index) => {
    const { label, keys } = describe(feature, index);
    labels[index] = label;
    const own = new Set([label, ...(keys || [])].map((k) => canon(k)).filter(Boolean));
    labelKeys[index] = [...own];
    for (const key of own) {
      if (!keyMap.has(key)) keyMap.set(key, new Set());
      keyMap.get(key).add(index);
    }
  });

  const lookup = (name) => {
    const key = canon(name);
    if (!key) return null;
    const hits = keyMap.get(key);
    if (!hits) return null;
    if (hits.size === 1) return { index: hits.values().next().value };
    return { candidates: [...hits] };
  };

  // Close spellings first, then names that contain what was typed. Cheap
  // enough for a few dozen misses against a few thousand features.
  const suggest = (name, limit = 3) => {
    const query = canon(name);
    if (!query) return [];
    const exact = keyMap.get(query);
    if (exact) return [...exact].slice(0, limit).map((index) => ({ index, label: labels[index] }));
    const maxDistance = Math.max(1, Math.floor(query.length / 3));
    const scored = [];
    labelKeys.forEach((keys, index) => {
      let best = Infinity;
      for (const key of keys) {
        if (Math.abs(key.length - query.length) <= maxDistance) best = Math.min(best, editDistance(query, key));
        // Contained names, but not short codes ("co" is not a hint for "Cook")
        const contained = key.startsWith(query) || key.includes(` ${query}`) || (key.length >= 4 && query.startsWith(`${key} `));
        if (query.length >= 3 && contained) best = Math.min(best, maxDistance + 0.5);
      }
      if (best <= maxDistance + 0.5) scored.push({ index, score: best });
    });
    scored.sort((a, b) => a.score - b.score || labels[a.index].localeCompare(labels[b.index]));
    return scored.slice(0, limit).map(({ index }) => ({ index, label: labels[index] }));
  };

  return { labels, lookup, suggest };
}

/**
 * Match data rows to features.
 * @param {object[]} rows
 * @param {ReturnType<typeof createRegionIndex>} index
 * @param {(row) => string} nameOf the row's region name
 * @returns {{
 *   matched: Map<number, { row: object, rowIndex: number }>,
 *   unmatched: Array<{ name: string, rowIndexes: number[], ambiguous: boolean, suggestions: string[] }>,
 *   duplicates: Array<{ label: string, rowIndexes: number[] }>
 * }} matched is keyed by feature index (later rows win); unmatched groups
 *   rows by the name typed, with up to three suggested names
 */
export function matchRows(rows, index, nameOf) {
  const matched = new Map();
  const missed = new Map();
  const seen = new Map();
  rows.forEach((row, rowIndex) => {
    const name = String(nameOf(row) ?? '').trim();
    if (!name) return;
    const hit = index.lookup(name);
    if (hit && 'index' in hit) {
      matched.set(hit.index, { row, rowIndex });
      if (!seen.has(hit.index)) seen.set(hit.index, []);
      seen.get(hit.index).push(rowIndex);
      return;
    }
    if (!missed.has(name)) missed.set(name, { name, rowIndexes: [], ambiguous: Boolean(hit), candidates: hit?.candidates });
    missed.get(name).rowIndexes.push(rowIndex);
  });
  const unmatched = [...missed.values()].map(({ name, rowIndexes, ambiguous, candidates }) => ({
    name,
    rowIndexes,
    ambiguous,
    suggestions: ambiguous ? candidates.slice(0, 5).map((i) => index.labels[i]) : index.suggest(name).map((s) => s.label),
  }));
  const duplicates = [...seen].filter(([, list]) => list.length > 1).map(([i, list]) => ({ label: index.labels[i], rowIndexes: list }));
  return { matched, unmatched, duplicates };
}
