import chroma from 'chroma-js';
import { parseNumber } from './csv.js';

/**
 * Colour and size scales for Map Maker: classed (binned) colour scales for
 * choropleths, square-root sizes for proportional symbols and fixed-order
 * category slots. Pure functions; colours come in from design tokens (see
 * components/maps/useMapPalette.js) and are only interpolated here.
 */

export const MIN_CLASSES = 3;
export const MAX_CLASSES = 7;

// Drop floating-point noise (6.3999999999999995) so legends read cleanly
const tidy = (n) => Number(n.toPrecision(12));

/** R-7 quantile (the spreadsheet default) of an ascending array. */
export function quantile(sorted, p) {
  if (!sorted.length) return NaN;
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  return sorted[lo] + (h - lo) * ((sorted[Math.min(lo + 1, sorted.length - 1)] ?? sorted[lo]) - sorted[lo]);
}

const strictlyInside = (thresholds, min, max) => {
  const out = [];
  for (const t of thresholds) {
    if (Number.isFinite(t) && t > min && t <= max && (!out.length || t > out[out.length - 1])) out.push(t);
  }
  return out;
};

/**
 * Class thresholds: n classes have n - 1 thresholds; a value goes in the
 * class of the last threshold it reaches. Thresholds that would leave a class
 * empty at the ends, or repeat (quantiles of tied values), are dropped, so
 * there can be fewer classes than asked for.
 * @param {number[]} values
 * @param {{ method: 'equal' | 'quantile' | 'custom', classes?: number, breaks?: number[], midpoint?: number | null }} options
 *   midpoint (diverging maps) centres equal intervals on it, so it falls on a
 *   threshold (even classes) or in the middle of the neutral class (odd)
 * @returns {number[]} ascending thresholds
 */
export function computeThresholds(values, { method, classes = 5, breaks = [], midpoint = null }) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return [];
  const sorted = [...finite].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const n = Math.min(MAX_CLASSES, Math.max(MIN_CLASSES, Math.round(classes)));

  if (method === 'custom') {
    return [...new Set(breaks.filter(Number.isFinite))].sort((a, b) => a - b);
  }
  if (method === 'quantile') {
    return strictlyInside(Array.from({ length: n - 1 }, (_, i) => tidy(quantile(sorted, (i + 1) / n))), min, max);
  }
  if (Number.isFinite(midpoint)) {
    // Symmetric around the midpoint, wide enough for both ends of the data
    const reach = Math.max(Math.abs(max - midpoint), Math.abs(min - midpoint)) || 1;
    const step = (2 * reach) / n;
    const all = Array.from({ length: n - 1 }, (_, i) => midpoint - reach + step * (i + 1));
    // Keep the scale as built (classes may be empty) so the colours stay symmetric
    return all.map(tidy);
  }
  if (min === max) return [];
  const step = (max - min) / n;
  return Array.from({ length: n - 1 }, (_, i) => tidy(min + step * (i + 1)));
}

/** Index of the class a value falls in: the number of thresholds it reaches. */
export function classIndex(value, thresholds) {
  let lo = 0;
  let hi = thresholds.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (value >= thresholds[mid]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Colours spread evenly along a ramp, interpolated in OKLab between its
 * steps (exact steps when the count matches).
 * @param {string[]} ramp CSS colours, low → high
 * @param {number} count
 */
export function sampleRamp(ramp, count) {
  if (!ramp?.length || count <= 0) return [];
  if (count === ramp.length) return [...ramp];
  if (count === 1) return [ramp[Math.floor((ramp.length - 1) / 2)]];
  const scale = chroma.scale(ramp).mode('oklab');
  return Array.from({ length: count }, (_, i) => scale(i / (count - 1)).hex());
}

/**
 * Colour each class of a diverging scale: classes entirely below the
 * midpoint take the low arm, entirely above the high arm, and a class that
 * straddles it the neutral middle. Each arm darkens with distance from the
 * midpoint; the longer side reaches the end of its arm and the shorter side
 * keeps the same steps, so equal distances read as equal on both sides.
 * @param {Array<{ from: number, to: number }>} classes
 * @param {number} midpoint
 * @param {string[]} ramp odd-length diverging ramp: low arm, neutral, high arm
 */
export function divergingColors(classes, midpoint, ramp) {
  const mid = (ramp.length - 1) / 2;
  const neutral = ramp[mid];
  const lowArm = [neutral, ...ramp.slice(0, mid).reverse()];
  const highArm = ramp.slice(mid);
  // The end classes are open: the first runs down to -∞, the last up to +∞
  const last = classes.length - 1;
  const side = classes.map((c, i) => {
    if ((i < last ? c.to : Infinity) <= midpoint) return -1;
    if ((i > 0 ? c.from : -Infinity) >= midpoint) return 1;
    return 0;
  });
  const lowCount = side.filter((s) => s < 0).length;
  const highCount = side.filter((s) => s > 0).length;
  const reach = Math.max(lowCount, highCount, 1);
  const lowScale = chroma.scale(lowArm).mode('oklab');
  const highScale = chroma.scale(highArm).mode('oklab');
  return classes.map((_, i) => {
    if (side[i] === 0) return chroma(neutral).hex();
    // Steps away from the midpoint: 1 for the class beside it
    const steps = side[i] < 0 ? lowCount - i : i - (classes.length - highCount) + 1;
    return (side[i] < 0 ? lowScale : highScale)(steps / reach).hex();
  });
}

/**
 * Build a classed colour scale.
 * @param {number[]} values the values on the map
 * @param {{ method, classes, breaks, diverging?: boolean, midpoint?: number, ramp: string[] }} options
 *   ramp: sequential (low → high) or diverging (odd length) token colours
 * @returns {{ classes: Array<{ from: number, to: number, color: string, count: number }>, thresholds: number[], colorFor: (v: number) => string, min: number, max: number } | null}
 */
export function buildColorScale(values, { method, classes, breaks, diverging = false, midpoint = 0, ramp }) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length || !ramp?.length) return null;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const mp = diverging && Number.isFinite(midpoint) ? midpoint : null;
  const thresholds = computeThresholds(finite, { method, classes, breaks, midpoint: method === 'equal' ? mp : null });
  const low = mp !== null && method === 'equal' ? Math.min(min, thresholds[0] ?? min) : min;
  const high = mp !== null && method === 'equal' ? Math.max(max, thresholds[thresholds.length - 1] ?? max) : max;
  // The end classes run to the data's extent; with custom breaks beyond the
  // data an end class can be empty (from > to), which the legend shows as open
  const ranges = Array.from({ length: thresholds.length + 1 }, (_, i) => ({
    from: i === 0 ? low : thresholds[i - 1],
    to: i === thresholds.length ? high : thresholds[i],
  }));
  if (mp !== null && method === 'equal') {
    // The symmetric scale's ends: the data extent mirrored around the midpoint
    const reach = Math.max(Math.abs(max - mp), Math.abs(min - mp)) || 1;
    ranges[0].from = mp - reach;
    ranges[ranges.length - 1].to = mp + reach;
  }
  const colors = mp !== null ? divergingColors(ranges, mp, ramp) : sampleRamp(ramp, ranges.length);
  const counts = new Array(ranges.length).fill(0);
  finite.forEach((v) => counts[classIndex(v, thresholds)]++);
  const scaleClasses = ranges.map((r, i) => ({ ...r, color: colors[i], count: counts[i] }));
  return {
    classes: scaleClasses,
    thresholds,
    min,
    max,
    colorFor: (v) => (Number.isFinite(v) ? colors[classIndex(v, thresholds)] : null),
  };
}

/**
 * Parse user-entered class breaks ("10, 20, 50" or one per line).
 * @returns {{ breaks: number[], invalid: string[] }} ascending unique breaks, and the bits that weren't numbers
 */
export function parseBreaks(text) {
  const parts = String(text || '').split(/[\s;]+|,(?=\s)|,(?!\d{3}\b)/).map((s) => s.trim()).filter(Boolean);
  const invalid = [];
  const numbers = [];
  for (const part of parts) {
    const n = parseNumber(part);
    if (Number.isNaN(n)) invalid.push(part);
    else numbers.push(n);
  }
  return { breaks: [...new Set(numbers)].sort((a, b) => a - b), invalid };
}

/**
 * Circle radius for a proportional symbol: area ∝ value, so radius ∝ √value.
 * @param {number} maxValue the largest value on the map
 * @param {number} maxRadius radius of the largest symbol, in px
 */
export function radiusScale(maxValue, maxRadius) {
  return (value) => (maxValue > 0 && Number.isFinite(value) && value > 0 ? Math.sqrt(value / maxValue) * maxRadius : 0);
}

/** The largest 1, 2 or 5 × 10ⁿ that is ≤ value. */
export function niceFloor(value) {
  if (!(value > 0)) return 0;
  const power = 10 ** Math.floor(Math.log10(value));
  const lead = value / power;
  return (lead >= 5 ? 5 : lead >= 2 ? 2 : 1) * power;
}

/**
 * Reference values for a size legend: a round number near the maximum and
 * two smaller ones, largest first.
 */
export function sizeLegendValues(maxValue) {
  const top = niceFloor(maxValue);
  if (!top) return [];
  const values = [top, niceFloor(top / 4), niceFloor(top / 16)].filter((v, i, all) => v > 0 && all.indexOf(v) === i);
  return values;
}

/**
 * Give categories fixed colour slots in order of first appearance; past the
 * slot count they share an "Other" slot. The order of first appearance keeps
 * a category's colour when rows are edited or values change.
 * @param {Array<string | null | undefined>} values one per row
 * @param {number} slots
 * @returns {{ categories: Array<{ name: string, slot: number, count: number }>, other: { names: string[], count: number } | null, slotOf: (name) => number }}
 *   slotOf returns -1 for Other (or a blank category)
 */
export function assignCategories(values, slots) {
  const order = [];
  const counts = new Map();
  for (const raw of values) {
    const name = String(raw ?? '').trim();
    if (!name) continue;
    if (!counts.has(name)) order.push(name);
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const named = order.slice(0, slots);
  const rest = order.slice(slots);
  const slotByName = new Map(named.map((name, i) => [name, i]));
  return {
    categories: named.map((name, slot) => ({ name, slot, count: counts.get(name) })),
    other: rest.length ? { names: rest, count: rest.reduce((sum, n) => sum + counts.get(n), 0) } : null,
    slotOf: (name) => slotByName.get(String(name ?? '').trim()) ?? -1,
  };
}
