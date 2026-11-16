import { normalizeName } from './regionMatch.js';

/**
 * The geographic areas Map Maker can draw, how each is projected, and which
 * names and codes each area's features answer to when matching data.
 */

/** US states and territories: FIPS code, postal code, name (as in us-atlas). */
export const US_STATES = [
  ['01', 'AL', 'Alabama'], ['02', 'AK', 'Alaska'], ['04', 'AZ', 'Arizona'], ['05', 'AR', 'Arkansas'],
  ['06', 'CA', 'California'], ['08', 'CO', 'Colorado'], ['09', 'CT', 'Connecticut'], ['10', 'DE', 'Delaware'],
  ['11', 'DC', 'District of Columbia'], ['12', 'FL', 'Florida'], ['13', 'GA', 'Georgia'], ['15', 'HI', 'Hawaii'],
  ['16', 'ID', 'Idaho'], ['17', 'IL', 'Illinois'], ['18', 'IN', 'Indiana'], ['19', 'IA', 'Iowa'],
  ['20', 'KS', 'Kansas'], ['21', 'KY', 'Kentucky'], ['22', 'LA', 'Louisiana'], ['23', 'ME', 'Maine'],
  ['24', 'MD', 'Maryland'], ['25', 'MA', 'Massachusetts'], ['26', 'MI', 'Michigan'], ['27', 'MN', 'Minnesota'],
  ['28', 'MS', 'Mississippi'], ['29', 'MO', 'Missouri'], ['30', 'MT', 'Montana'], ['31', 'NE', 'Nebraska'],
  ['32', 'NV', 'Nevada'], ['33', 'NH', 'New Hampshire'], ['34', 'NJ', 'New Jersey'], ['35', 'NM', 'New Mexico'],
  ['36', 'NY', 'New York'], ['37', 'NC', 'North Carolina'], ['38', 'ND', 'North Dakota'], ['39', 'OH', 'Ohio'],
  ['40', 'OK', 'Oklahoma'], ['41', 'OR', 'Oregon'], ['42', 'PA', 'Pennsylvania'], ['44', 'RI', 'Rhode Island'],
  ['45', 'SC', 'South Carolina'], ['46', 'SD', 'South Dakota'], ['47', 'TN', 'Tennessee'], ['48', 'TX', 'Texas'],
  ['49', 'UT', 'Utah'], ['50', 'VT', 'Vermont'], ['51', 'VA', 'Virginia'], ['53', 'WA', 'Washington'],
  ['54', 'WV', 'West Virginia'], ['55', 'WI', 'Wisconsin'], ['56', 'WY', 'Wyoming'], ['60', 'AS', 'American Samoa'],
  ['66', 'GU', 'Guam'], ['69', 'MP', 'Commonwealth of the Northern Mariana Islands'], ['72', 'PR', 'Puerto Rico'],
  ['78', 'VI', 'United States Virgin Islands'],
];
const STATE_BY_FIPS = new Map(US_STATES.map(([fips, abbr, name]) => [fips, { abbr, name }]));
// Normalized state name or postal code → postal code, for "Cook County, Illinois"
const STATE_ABBR = new Map(US_STATES.flatMap(([, abbr, name]) => [[normalizeName(name), abbr], [normalizeName(abbr), abbr]]));

/**
 * The Census Bureau's regions and divisions, by state FIPS code. DC is in the
 * South Atlantic division; the territories are in neither.
 */
export const US_DIVISIONS = {
  'new-england': { label: 'New England', region: 'northeast', states: ['09', '23', '25', '33', '44', '50'] },
  'middle-atlantic': { label: 'Middle Atlantic', region: 'northeast', states: ['34', '36', '42'] },
  'east-north-central': { label: 'East North Central', region: 'midwest', states: ['17', '18', '26', '39', '55'] },
  'west-north-central': { label: 'West North Central', region: 'midwest', states: ['19', '20', '27', '29', '31', '38', '46'] },
  'south-atlantic': { label: 'South Atlantic', region: 'south', states: ['10', '11', '12', '13', '24', '37', '45', '51', '54'] },
  'east-south-central': { label: 'East South Central', region: 'south', states: ['01', '21', '28', '47'] },
  'west-south-central': { label: 'West South Central', region: 'south', states: ['05', '22', '40', '48'] },
  mountain: { label: 'Mountain', region: 'west', states: ['04', '08', '16', '30', '32', '35', '49', '56'] },
  pacific: { label: 'Pacific', region: 'west', states: ['02', '06', '15', '41', '53'] },
};
export const US_REGIONS = Object.fromEntries(
  [['northeast', 'Northeast'], ['midwest', 'Midwest'], ['south', 'South'], ['west', 'West']].map(([key, label]) => [
    key,
    { label, states: Object.values(US_DIVISIONS).filter((d) => d.region === key).flatMap((d) => d.states) },
  ]),
);

/**
 * Part of a US map to show on its own: `region:west`, `division:pacific` or
 * `state:06` (a state shows its counties). Null for anything else.
 */
export function parseUsFocus(focus) {
  const [kind, key] = String(focus || '').split(':');
  if (kind === 'region' && US_REGIONS[key]) return { kind, key, label: `${US_REGIONS[key].label} region`, states: US_REGIONS[key].states };
  if (kind === 'division' && US_DIVISIONS[key]) return { kind, key, label: `${US_DIVISIONS[key].label} division`, states: US_DIVISIONS[key].states };
  if (kind === 'state' && STATE_BY_FIPS.has(key)) return { kind, key, label: STATE_BY_FIPS.get(key).name, states: [key] };
  return null;
}

/** Focus choices for a US map, grouped for a UiSelect */
export const usFocusOptions = () => [
  { value: '', label: 'All of the United States' },
  { group: 'Census regions', options: Object.entries(US_REGIONS).map(([key, r]) => ({ value: `region:${key}`, label: r.label })) },
  { group: 'Census divisions', options: Object.entries(US_DIVISIONS).map(([key, d]) => ({ value: `division:${key}`, label: d.label })) },
  {
    group: 'A state and its counties',
    options: US_STATES.filter(([fips]) => Number(fips) <= 56).map(([fips, , name]) => ({ value: `state:${fips}`, label: name })),
  },
];

/** The id world-atlas gives the United States, which drills into us-atlas states. */
export const USA_ID = '840';

// Fit boxes ([[west, south], [east, north]]) for the continents: countries like
// France and Russia reach far outside their continent, so fitting the features
// themselves would zoom out too far.
export const AREAS = {
  world: { label: 'World', group: 'World', source: 'world', name: 'the world' },
  africa: { label: 'Africa', group: 'Continents', source: 'world', continent: 'Africa', projection: { type: 'azimuthalEqualArea', rotate: [-18, -2] }, extent: [[-18, -35], [52, 37]] },
  asia: { label: 'Asia', group: 'Continents', source: 'world', continent: 'Asia', projection: { type: 'conicEqualArea', rotate: [-95, 0], parallels: [15, 45] }, extent: [[26, -11], [146, 55]] },
  europe: { label: 'Europe', group: 'Continents', source: 'world', continent: 'Europe', projection: { type: 'azimuthalEqualArea', rotate: [-10, -52] }, extent: [[-24, 35], [42, 71]] },
  'north-america': { label: 'North America', group: 'Continents', source: 'world', continent: 'North America', projection: { type: 'conicEqualArea', rotate: [100, 0], parallels: [20, 60] }, extent: [[-168, 7], [-52, 72]] },
  'south-america': { label: 'South America', group: 'Continents', source: 'world', continent: 'South America', projection: { type: 'azimuthalEqualArea', rotate: [60, 15] }, extent: [[-82, -56], [-34, 13]] },
  oceania: { label: 'Oceania', group: 'Continents', source: 'world', continent: 'Oceania', projection: { type: 'azimuthalEqualArea', rotate: [-150, 22] }, extent: [[112, -47], [180, -1]] },
  'us-states': { label: 'US states', group: 'United States', source: 'us-states', projection: { type: 'albersUsa' }, name: 'the United States' },
  'us-counties': { label: 'US counties', group: 'United States', source: 'us-counties', projection: { type: 'albersUsa' }, name: 'US counties' },
};

/** Area choices for a UiSelect, grouped. */
export const areaOptions = () => {
  const groups = new Map();
  for (const [value, area] of Object.entries(AREAS)) {
    if (!groups.has(area.group)) groups.set(area.group, []);
    groups.get(area.group).push({ value, label: area.label });
  }
  return [...groups].map(([group, options]) => ({ group, options }));
};

/** Whether an area shows world countries (so a country can be opened). */
export const isWorldArea = (areaKey) => AREAS[areaKey]?.source === 'world';

/** Points across a box, for fitting a projection to it (edges bend in conic projections). */
export function extentPoints([[west, south], [east, north]], steps = 4) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      points.push([west + ((east - west) * i) / steps, south + ((north - south) * j) / steps]);
    }
  }
  return { type: 'MultiPoint', coordinates: points };
}

// ---- What each kind of feature answers to ---------------------------------

/** World countries: world-atlas name, Natural Earth names and ISO codes, numeric id. */
export const describeCountry = (countries) => (feature) => {
  const meta = countries?.[feature.id] || {};
  const label = meta.name || feature.properties?.name || String(feature.id ?? '');
  return { label, keys: [feature.properties?.name, ...(meta.aliases || []), meta.a2, meta.a3, feature.id] };
};

/** US states: name, postal code and FIPS code (with or without the leading zero). */
export const describeState = (feature) => {
  const state = STATE_BY_FIPS.get(feature.id);
  const label = feature.properties?.name || state?.name || String(feature.id);
  return { label, keys: [state?.abbr, feature.id, String(Number(feature.id))] };
};

const COUNTY_SUFFIX = /\s+(county|parish|borough|census area|city and borough|municipality|municipio|planning region)$/;

/**
 * Counties repeat across states, so they match as "Name, ST" (with or
 * without "County", with the state spelled out or not) or by five-digit FIPS
 * code; a bare name matches only if it is unique. Independent cities that
 * share a county's name (Richmond city and Richmond County, VA; Baltimore;
 * St. Louis) are labelled "Name city, ST", as the Census names them.
 * @param {Array} features all the counties, to find those shared names
 */
export const describeCounties = (features) => {
  const seen = new Map();
  const labelOf = (feature) => {
    const state = STATE_BY_FIPS.get(String(feature.id).slice(0, 2));
    const name = feature.properties?.name || String(feature.id);
    return state ? `${name}, ${state.abbr}` : name;
  };
  features.forEach((f) => seen.set(labelOf(f), (seen.get(labelOf(f)) || 0) + 1));
  return (feature) => {
    const name = feature.properties?.name || String(feature.id);
    let label = labelOf(feature);
    // County codes from 500 up are independent cities
    if (seen.get(label) > 1 && Number(String(feature.id).slice(2)) >= 500) label = label.replace(`${name},`, `${name} city,`);
    return { label, keys: [name, feature.id, String(Number(feature.id))] };
  };
};

/** Canonical county key: no "County" suffix, the state as a postal code. */
export function canonicalCounty(key) {
  // A FIPS code typed without its leading zero
  if (/^\d{4}$/.test(key)) return `0${key}`;
  const [place, state] = key.split(', ');
  const base = place.replace(COUNTY_SUFFIX, '');
  if (state === undefined) return base;
  return `${base}, ${(STATE_ABBR.get(state) || state).toLowerCase()}`;
}

/** First-level regions from Natural Earth: name, ISO 3166-2 code (with and without the country), postal code, other names. */
export const describeAdmin1 = (feature) => {
  const p = feature.properties || {};
  const code = p.code || '';
  return { label: p.name, keys: [code, code.split('-')[1], p.postal, ...(p.alt ? p.alt.split('|') : [])] };
};
