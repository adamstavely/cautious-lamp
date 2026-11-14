#!/usr/bin/env node
/**
 * Builds the Map Maker's extra geography in public/maps (see public/maps/README.md):
 *
 *  - admin1/<id>.json  first-level regions (states, provinces…) of each country,
 *                      one TopoJSON per country, named by the ISO 3166 numeric
 *                      id world-atlas gives the country (e.g. 124 = Canada)
 *  - countries.json    per country id: names and codes for matching, continent,
 *                      and how many admin-1 regions it has (0 = no file)
 *  - counties-10m.json us-atlas US counties, copied byte for byte
 *
 * Sources are Natural Earth (public domain), pinned to a release, and us-atlas.
 * Each country is simplified on its own with mapshaper to a fixed screen
 * resolution, so small countries keep as much detail as large ones.
 *
 *   node scripts/build-map-data.mjs                     download sources, build
 *   node scripts/build-map-data.mjs --sources <dir>     use (or fill) this cache
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';
import { feature as topoFeature } from 'topojson-client';
import { geoArea, geoBounds, geoCentroid, geoDistance } from 'd3-geo';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/maps');
const admin1Dir = path.join(outDir, 'admin1');

const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson';
const SOURCES = {
  admin1: `${NE}/ne_10m_admin_1_states_provinces.geojson`,
  admin0: `${NE}/ne_110m_admin_0_countries.geojson`,
  counties: 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/counties-10m.json',
};

// Detail per country: the simplified shapes still look smooth at this size (px)
const RESOLUTION = '900x900';
// Parts of a country further than this from its main landmass (beyond both
// parts' own size) are "remote": still in the file, but left out of the fit
const REMOTE_KM = 800;
const EARTH_KM = 6371;

const argIndex = process.argv.indexOf('--sources');
const sourceDir = argIndex > 0 ? path.resolve(process.argv[argIndex + 1]) : path.join(tmpdir(), 'cautious-lamp-map-sources');

async function source(name) {
  const file = path.join(sourceDir, path.basename(SOURCES[name]));
  if (!existsSync(file)) {
    mkdirSync(sourceDir, { recursive: true });
    console.log(`Downloading ${SOURCES[name]}`);
    const response = await fetch(SOURCES[name]);
    if (!response.ok) throw new Error(`${SOURCES[name]}: ${response.status} ${response.statusText}`);
    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  }
  return readFileSync(file);
}

const unique = (values) => [...new Set(values.filter((v) => typeof v === 'string' && v.trim() && v !== '-99').map((v) => v.trim()))];

/** Split a (multi)polygon feature into one polygon geometry per part. */
const partsOf = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }));
  return [];
};

/**
 * Find the parts that belong to the country's main landmass: group parts that
 * lie within REMOTE_KM of each other, counting from the edge of each
 * (approximated by the radius of a circle of its area), and keep the group
 * with the most land. Returns the fit (centre and a set of points to fit the
 * projection to) and the regions with no part on the main landmass.
 */
function mainland(features) {
  const parts = features.flatMap((f, featureIndex) => partsOf(f.geometry).map((geometry) => {
    const area = geoArea(geometry);
    // geoArea is in steradians; a ring wound the wrong way reads as the whole sphere
    const sr = area > 2 * Math.PI ? 4 * Math.PI - area : area;
    return { featureIndex, geometry, area: sr, centroid: geoCentroid(geometry), radius: Math.sqrt(sr / Math.PI) };
  }));
  if (!parts.length) return null;
  const limit = REMOTE_KM / EARTH_KM;
  // Union-find over pairs that are close enough
  const parent = parts.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i];
      const b = parts[j];
      if (geoDistance(a.centroid, b.centroid) - a.radius - b.radius < limit) parent[find(i)] = find(j);
    }
  }
  const land = new Map();
  parts.forEach((p, i) => land.set(find(i), (land.get(find(i)) || 0) + p.area));
  const [mainGroup] = [...land].reduce((a, b) => (b[1] > a[1] ? b : a));
  const inMain = new Set(parts.filter((_, i) => find(i) === mainGroup));
  const main = [...inMain];
  // Bounding-box corners of every main part: enough for d3's fitExtent, and
  // safe across the antimeridian because the client centres on `center`
  const fit = main.flatMap(({ geometry }) => {
    const [[x0, y0], [x1, y1]] = geoBounds(geometry);
    return [[x0, y0], [x1, y1], [x0, y1], [x1, y0]];
  }).map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  const center = geoCentroid({ type: 'GeometryCollection', geometries: main.map((p) => p.geometry) }).map((v) => Math.round(v * 100) / 100);
  const mainFeatures = new Set(main.map((p) => p.featureIndex));
  const remote = features.filter((_, i) => !mainFeatures.has(i)).map((f) => f.properties.name);
  return { center, fit, remote };
}

async function buildCountry(id, features) {
  const input = { type: 'FeatureCollection', features };
  const out = await mapshaper.applyCommands(
    `-i in.json -simplify weighted keep-shapes resolution=${RESOLUTION} -filter-slivers -clean -o out.json format=topojson quantization=10000`,
    { 'in.json': JSON.stringify(input) },
  );
  const topo = JSON.parse(String(out['out.json']));
  // mapshaper names the object after the input file; the app reads "regions"
  const [objectName] = Object.keys(topo.objects);
  topo.objects = { regions: topo.objects[objectName] };
  const simplified = topoFeature(topo, topo.objects.regions).features;
  const fit = mainland(simplified);
  if (fit) topo.fit = fit;
  writeFileSync(path.join(admin1Dir, `${id}.json`), JSON.stringify(topo));
  return simplified.length;
}

async function main() {
  const world = JSON.parse(readFileSync(path.join(outDir, 'countries-110m.json'), 'utf8'));
  const worldIds = new Set(world.objects.countries.geometries.map((g) => g.id).filter(Boolean));

  const admin0 = JSON.parse(await source('admin0'));
  const admin1 = JSON.parse(await source('admin1'));
  writeFileSync(path.join(outDir, 'counties-10m.json'), await source('counties'));

  // ADM0_A3 (what admin-1 rows carry) → the numeric id world-atlas uses
  const countries = {};
  const idByA3 = new Map();
  for (const { properties: p } of admin0.features) {
    const id = String(p.ISO_N3_EH ?? p.ISO_N3 ?? '').padStart(3, '0');
    if (!worldIds.has(id)) continue;
    idByA3.set(p.ADM0_A3, id);
    countries[id] = {
      name: p.NAME,
      continent: p.CONTINENT,
      a2: p.ISO_A2_EH !== '-99' ? p.ISO_A2_EH : p.ISO_A2,
      a3: p.ISO_A3_EH !== '-99' ? p.ISO_A3_EH : p.ISO_A3,
      aliases: unique([p.NAME_LONG, p.ADMIN, p.NAME_EN, p.FORMAL_EN, p.NAME_SORT, p.NAME_ALT, p.BRK_NAME, p.NAME_CIAWF].filter((n) => n !== p.NAME)),
      admin1: 0,
    };
  }

  // Group admin-1 rows by country, keeping only what matching needs
  const byCountry = new Map();
  for (const f of admin1.features) {
    const p = f.properties;
    const id = idByA3.get(p.adm0_a3) || idByA3.get(p.gu_a3) || idByA3.get(p.sov_a3);
    if (!id || !p.name) continue;
    const alt = unique([p.name_en, ...(p.name_alt || '').split('|'), p.woe_name, p.gn_name].filter((n) => n !== p.name));
    const properties = { name: p.name };
    if (p.iso_3166_2 && !p.iso_3166_2.endsWith('~')) properties.code = p.iso_3166_2;
    if (p.postal) properties.postal = p.postal;
    if (p.type_en) properties.type = p.type_en;
    if (alt.length) properties.alt = alt.join('|');
    if (!byCountry.has(id)) byCountry.set(id, []);
    byCountry.get(id).push({ type: 'Feature', properties, geometry: f.geometry });
  }

  rmSync(admin1Dir, { recursive: true, force: true });
  mkdirSync(admin1Dir, { recursive: true });
  for (const [id, features] of [...byCountry].sort()) {
    // One region is the country itself: nothing to drill into
    if (features.length < 2) continue;
    // The United States opens to us-atlas's states instead (src/utils/mapAreas.js USA_ID)
    if (id === '840') {
      countries[id].admin1 = features.length;
      continue;
    }
    countries[id].admin1 = await buildCountry(id, features);
  }

  const sorted = Object.fromEntries(Object.entries(countries).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(path.join(outDir, 'countries.json'), `${JSON.stringify(sorted)}\n`);

  const files = readdirSync(admin1Dir);
  const bytes = files.reduce((sum, f) => sum + statSync(path.join(admin1Dir, f)).size, 0);
  console.log(`${Object.keys(sorted).length} countries, ${files.length} admin-1 files, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
