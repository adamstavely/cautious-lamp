import * as topojson from 'topojson-client';
import { geoCentroid } from 'd3-geo';

/**
 * Loading the map files in public/maps (see public/maps/README.md): TopoJSON
 * boundaries and the country table. Files are cached per URL; the us-atlas and
 * world-atlas copies fall back to jsDelivr if the bundled file can't be loaded.
 */

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const local = (file) => `${BASE}maps/${file}`;

export const MAP_URLS = {
  world: local('countries-110m.json'),
  usStates: local('states-10m.json'),
  usCounties: local('counties-10m.json'),
  countries: local('countries.json'),
};

const CDN_FALLBACKS = {
  [MAP_URLS.usStates]: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  [MAP_URLS.usCounties]: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json',
  [MAP_URLS.world]: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
};

/** First-level regions of a country, by its ISO 3166 numeric id (world-atlas's feature id). */
export const admin1Url = (countryId) => local(`admin1/${countryId}.json`);

const cache = new Map();

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load map data (${response.status} ${response.statusText})`);
  }
  return response.json();
}

/**
 * Load a JSON map file. Concurrent requests share one fetch; failures are not
 * cached, so a later attempt can retry.
 * @param {string} url
 * @returns {Promise<Object>}
 */
export function loadMapFile(url) {
  if (cache.has(url)) return cache.get(url);
  const request = (async () => {
    try {
      return await fetchJSON(url);
    } catch (error) {
      const fallback = CDN_FALLBACKS[url];
      if (!fallback) throw error;
      console.warn(`Could not load ${url}, falling back to ${fallback}:`, error);
      return fetchJSON(fallback);
    }
  })();
  cache.set(url, request);
  request.catch(() => cache.delete(url));
  return request;
}

/**
 * Convert one TopoJSON object to GeoJSON features.
 * @param {Object} topoJson
 * @param {string} objectName e.g. 'states', 'countries', 'regions'
 * @returns {Array} GeoJSON features
 */
export function getGeoJSONFeatures(topoJson, objectName) {
  if (!topoJson?.objects?.[objectName]) {
    throw new Error(`TopoJSON object "${objectName}" not found`);
  }
  return topojson.feature(topoJson, topoJson.objects[objectName]).features;
}

/**
 * Shared borders of a TopoJSON object as one MultiLineString (each border
 * once), e.g. state lines drawn over counties.
 */
export function getBorderMesh(topoJson, objectName) {
  if (!topoJson?.objects?.[objectName]) return null;
  return topojson.mesh(topoJson, topoJson.objects[objectName], (a, b) => a !== b);
}

/**
 * Geographic centre of a feature, [longitude, latitude]; [0, 0] if it can't
 * be computed.
 */
export function getFeatureCentroid(feature) {
  try {
    return geoCentroid(feature);
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return [0, 0];
  }
}
