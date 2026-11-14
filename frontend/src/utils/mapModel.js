import { matchRows } from './regionMatch.js';

/**
 * Turn Map Maker's data tables into what the maps draw, and collect what
 * couldn't be drawn and why, for the match report. Pure functions over the
 * rows and a region index (utils/regionMatch.js createRegionIndex).
 */

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const hasCoordinates = (row) => finite(row.lat) && finite(row.lng);

/**
 * Choropleth rows ({ region, value }) matched to the map's regions.
 * @returns {{ matched: Map<number, { row, rowIndex }>, unmatched: object[], duplicates: object[], invalid: number[] }}
 *   invalid lists rows whose value isn't a number (from the row editor)
 */
export function resolveChoropleth(rows, index) {
  const invalid = [];
  const usable = rows.map((row, i) => {
    if (!finite(row.value)) {
      if (String(row.region ?? '').trim()) invalid.push(i);
      return { region: '' };
    }
    return row;
  });
  return { ...matchRows(usable, index, (row) => row.region), invalid };
}

/**
 * Bubble and dot rows ({ name, lat?, lng?, value?, category? }): placed by
 * coordinates, or at the centre of the region their name matches.
 * @param {object[]} rows
 * @param {object} index region index for the map
 * @param {Array} features the map's features (for centres)
 * @param {(feature) => [number, number]} centerOf
 * @param {{ needsValue?: boolean }} [options] bubble maps need a positive value
 * @returns {{ points: object[], unmatched: object[], noValue: Array<{ name: string, rowIndex: number }> }}
 *   points: { rowIndex, label, lng, lat, value, category }
 */
export function resolvePoints(rows, index, features, centerOf, { needsValue = false } = {}) {
  const points = [];
  const noValue = [];
  const byName = [];
  rows.forEach((row, rowIndex) => {
    const name = String(row.name ?? '').trim();
    if (needsValue && !(finite(row.value) && row.value > 0)) {
      if (name || hasCoordinates(row)) noValue.push({ name: name || `Row ${rowIndex + 1}`, rowIndex });
      return;
    }
    if (hasCoordinates(row)) {
      points.push({ rowIndex, label: name || `${row.lat}, ${row.lng}`, lng: row.lng, lat: row.lat, value: finite(row.value) ? row.value : null, category: String(row.category ?? '').trim() });
    } else if (name) {
      byName.push({ row, rowIndex });
    }
  });

  const { matched, unmatched } = matchRows(byName.map((b) => b.row), index, (row) => row.name);
  for (const [featureIndex, { row, rowIndex: i }] of matched) {
    const [lng, lat] = centerOf(features[featureIndex]);
    points.push({ rowIndex: byName[i].rowIndex, label: index.labels[featureIndex], lng, lat, value: finite(row.value) ? row.value : null, category: String(row.category ?? '').trim() });
  }
  // Report rows by their place in the full table
  const remapped = unmatched.map((u) => ({ ...u, rowIndexes: u.rowIndexes.map((i) => byName[i].rowIndex) }));
  points.sort((a, b) => a.rowIndex - b.rowIndex);
  return { points, unmatched: remapped, noValue };
}

/**
 * Flow rows ({ from, to, value }) joined to places ({ id, name, lat, lng }).
 * @returns {{ places: object[], flows: object[], unknown: Array<{ id: string, rowIndexes: number[] }>, invalid: number[] }}
 *   places: { id, label, lng, lat } for places with coordinates; unknown: ids
 *   flows use that have no place; invalid: flows with no numeric value
 */
export function resolveFlows(placeRows, flowRows) {
  const places = [];
  const ids = new Set();
  placeRows.forEach((p) => {
    const id = String(p.id ?? '').trim();
    if (!id || ids.has(id) || !hasCoordinates(p)) return;
    ids.add(id);
    places.push({ id, label: String(p.name ?? '').trim() || id, lng: p.lng, lat: p.lat });
  });
  const flows = [];
  const unknown = new Map();
  const invalid = [];
  flowRows.forEach((f, rowIndex) => {
    const from = String(f.from ?? '').trim();
    const to = String(f.to ?? '').trim();
    if (!from && !to) return;
    let ok = true;
    for (const id of [from, to]) {
      if (ids.has(id)) continue;
      ok = false;
      if (!unknown.has(id)) unknown.set(id, []);
      unknown.get(id).push(rowIndex);
    }
    if (!finite(f.value)) {
      invalid.push(rowIndex);
      ok = false;
    }
    if (ok && from !== to) flows.push({ from, to, value: f.value, rowIndex });
  });
  return { places, flows, unknown: [...unknown].map(([id, rowIndexes]) => ({ id: id || '(blank)', rowIndexes })), invalid };
}
