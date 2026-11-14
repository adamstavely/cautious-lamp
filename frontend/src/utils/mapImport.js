import { parseDelimited, parseNumber, headerKey } from './csv.js';

/**
 * Import pasted or uploaded tables for Map Maker. Each table has a schema:
 * the fields it reads, the header names accepted for each (any case, spaces
 * and punctuation ignored) and which fields must be numbers. Rows that can't
 * be used are returned with the reason, never silently dropped.
 */

const ALIASES = {
  region: ['region', 'name', 'state', 'country', 'province', 'county', 'area', 'location', 'place', 'territory', 'district', 'fips', 'code', 'iso', 'iso3', 'id', 'geo'],
  value: ['value', 'count', 'amount', 'total', 'number', 'population', 'pop', 'val', 'data', 'score', 'rate', 'percent', 'size', 'weight', 'flow', 'volume'],
  from: ['from', 'source', 'origin', 'start', 'fromid', 'sourceid'],
  to: ['to', 'target', 'destination', 'dest', 'end', 'toid', 'targetid'],
  id: ['id', 'code', 'key', 'placeid', 'locationid'],
  name: ['name', 'label', 'title', 'city', 'place', 'placename', 'location', 'site', 'region', 'state', 'country'],
  lat: ['lat', 'latitude', 'y'],
  lng: ['lng', 'lon', 'long', 'longitude', 'x'],
  category: ['category', 'group', 'type', 'class', 'kind', 'series', 'segment'],
};

/**
 * Table schemas. `fields` are in the order used when the data has no header
 * row; `required` must be present (as columns); `numeric` are parsed with
 * parseNumber and a row with a bad number is skipped. `numericOptional`
 * fields may be empty.
 */
export const SCHEMAS = {
  choropleth: { fields: ['region', 'value'], required: ['region', 'value'], numeric: ['value'] },
  flows: { fields: ['from', 'to', 'value'], required: ['from', 'to', 'value'], numeric: ['value'] },
  // A place needs an id or a name (each stands in for the other)
  places: { fields: ['id', 'name', 'lat', 'lng'], required: ['lat', 'lng'], anyOf: ['id', 'name'], numeric: ['lat', 'lng'] },
  // Bubble and dot maps: by coordinates, or by region name (placed at its centre)
  points: { fields: ['name', 'lat', 'lng', 'value', 'category'], required: ['name'], numeric: [], numericOptional: ['lat', 'lng', 'value'] },
};

/**
 * Work out which column holds each field. Every header is used at most once,
 * fields are claimed in schema order and aliases in order, so "name" goes to
 * the first field that lists it.
 * @returns {Record<string, number>} field → column index
 */
export function mapColumns(headers, schema) {
  const keys = headers.map(headerKey);
  const taken = new Set();
  const columns = {};
  // Exact field names first ("id" is the id even if "name" also could be), then aliases
  const passes = [(field) => [field], (field) => ALIASES[field] || []];
  for (const pass of passes) {
    for (const field of schema.fields) {
      if (columns[field] !== undefined) continue;
      for (const alias of pass(field)) {
        const index = keys.findIndex((k, i) => k === alias && !taken.has(i));
        if (index >= 0) {
          columns[field] = index;
          taken.add(index);
          break;
        }
      }
    }
  }
  return columns;
}

/**
 * Parse a table for one schema.
 * @param {string} text pasted or uploaded CSV/TSV
 * @param {keyof SCHEMAS | object} schemaName
 * @returns {{
 *   rows: object[],
 *   skipped: Array<{ line: number, reason: string, text: string }>,
 *   missing: string[],
 *   headerless: boolean,
 *   columns: Record<string, string>
 * }} missing lists required fields with no column (then rows is empty)
 */
export function importTable(text, schemaName) {
  const schema = typeof schemaName === 'string' ? SCHEMAS[schemaName] : schemaName;
  const { rows: parsed } = parseDelimited(text);
  const result = { rows: [], skipped: [], missing: [], headerless: false, columns: {} };
  if (!parsed.length) return result;

  let columns = mapColumns(parsed[0].fields, schema);
  let body = parsed.slice(1);
  // No recognised header: read the columns in the schema's order, if there are enough
  if (Object.keys(columns).length === 0 || (!schema.required.every((f) => columns[f] !== undefined) && looksLikeData(parsed[0].fields, schema))) {
    if (parsed[0].fields.length >= schema.required.length) {
      columns = Object.fromEntries(schema.fields.slice(0, parsed[0].fields.length).map((f, i) => [f, i]));
      body = parsed;
      result.headerless = true;
    }
  } else {
    result.columns = Object.fromEntries(Object.entries(columns).map(([f, i]) => [f, parsed[0].fields[i]]));
  }

  result.missing = schema.required.filter((f) => columns[f] === undefined);
  if (schema.anyOf && !schema.anyOf.some((f) => columns[f] !== undefined)) result.missing.push(schema.anyOf.join(' or '));
  if (result.missing.length) return result;

  const numeric = new Set(schema.numeric);
  const optional = new Set(schema.numericOptional || []);
  for (const { line, fields } of body) {
    const row = {};
    let reason = '';
    for (const field of schema.fields) {
      if (columns[field] === undefined) continue;
      const raw = fields[columns[field]] ?? '';
      if (numeric.has(field) || optional.has(field)) {
        if (optional.has(field) && raw === '') {
          row[field] = null;
          continue;
        }
        const value = parseNumber(raw);
        if (Number.isNaN(value)) {
          reason ||= raw === '' ? `no ${field}` : `${field} "${raw}" is not a number`;
          continue;
        }
        row[field] = value;
      } else {
        row[field] = raw;
      }
    }
    if (!reason) {
      const blank = schema.required.find((f) => !numeric.has(f) && (row[f] === undefined || row[f] === ''));
      if (blank) reason = `no ${blank}`;
    }
    if (!reason && schema.anyOf) {
      const present = schema.anyOf.find((f) => row[f]);
      if (!present) reason = `no ${schema.anyOf.join(' or ')}`;
      else schema.anyOf.forEach((f) => { row[f] ||= row[present]; });
    }
    if (!reason && 'lat' in row && 'lng' in row) reason = coordinateProblem(row.lat, row.lng);
    if (reason) result.skipped.push({ line, reason, text: fields.join(', ') });
    else result.rows.push(row);
  }
  return result;
}

/** A first row that has a number where the schema expects one is data, not a header. */
function looksLikeData(fields, schema) {
  const firstNumeric = schema.fields.findIndex((f) => schema.numeric.includes(f));
  return firstNumeric >= 0 && firstNumeric < fields.length && !Number.isNaN(parseNumber(fields[firstNumeric]));
}

/**
 * Why a coordinate pair can't be used, or '' if it can (both empty is fine:
 * the row is placed by name).
 */
export function coordinateProblem(lat, lng) {
  const hasLat = lat !== null && lat !== undefined;
  const hasLng = lng !== null && lng !== undefined;
  if (!hasLat && !hasLng) return '';
  if (!hasLat || !hasLng) return 'needs both latitude and longitude';
  if (Math.abs(lat) > 90) return `latitude ${lat} is outside -90 to 90`;
  if (Math.abs(lng) > 180) return `longitude ${lng} is outside -180 to 180`;
  return '';
}
