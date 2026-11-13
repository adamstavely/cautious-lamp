import * as topojson from 'topojson-client';
import { geoCentroid } from 'd3-geo';

// Cache for loaded TopoJSON data
const topoJsonCache = new Map();

// State name mappings to handle variations
const stateNameMap = {
  'New York': 'New York',
  'NY': 'New York',
  'California': 'California',
  'CA': 'California',
  'Texas': 'Texas',
  'TX': 'Texas',
  'Florida': 'Florida',
  'FL': 'Florida',
  'Pennsylvania': 'Pennsylvania',
  'PA': 'Pennsylvania',
  'Illinois': 'Illinois',
  'IL': 'Illinois',
  'Ohio': 'Ohio',
  'OH': 'Ohio',
  'Georgia': 'Georgia',
  'GA': 'Georgia',
  'North Carolina': 'North Carolina',
  'NC': 'North Carolina',
  'Michigan': 'Michigan',
  'MI': 'Michigan',
  'New Jersey': 'New Jersey',
  'NJ': 'New Jersey',
  'Virginia': 'Virginia',
  'VA': 'Virginia',
  'Washington': 'Washington',
  'WA': 'Washington',
  'Arizona': 'Arizona',
  'AZ': 'Arizona',
  'Massachusetts': 'Massachusetts',
  'MA': 'Massachusetts',
  'Tennessee': 'Tennessee',
  'TN': 'Tennessee',
  'Indiana': 'Indiana',
  'IN': 'Indiana',
  'Missouri': 'Missouri',
  'MO': 'Missouri',
  'Maryland': 'Maryland',
  'MD': 'Maryland',
  'Wisconsin': 'Wisconsin',
  'WI': 'Wisconsin',
  'Colorado': 'Colorado',
  'CO': 'Colorado',
  'Minnesota': 'Minnesota',
  'MN': 'Minnesota',
  'South Carolina': 'South Carolina',
  'SC': 'South Carolina',
  'Alabama': 'Alabama',
  'AL': 'Alabama',
  'Louisiana': 'Louisiana',
  'LA': 'Louisiana',
  'Kentucky': 'Kentucky',
  'KY': 'Kentucky',
  'Oregon': 'Oregon',
  'OR': 'Oregon',
  'Oklahoma': 'Oklahoma',
  'OK': 'Oklahoma',
  'Connecticut': 'Connecticut',
  'CT': 'Connecticut',
  'Utah': 'Utah',
  'UT': 'Utah',
  'Iowa': 'Iowa',
  'IA': 'Iowa',
  'Nevada': 'Nevada',
  'NV': 'Nevada',
  'Arkansas': 'Arkansas',
  'AR': 'Arkansas',
  'Mississippi': 'Mississippi',
  'MS': 'Mississippi',
  'Kansas': 'Kansas',
  'KS': 'Kansas',
  'New Mexico': 'New Mexico',
  'NM': 'New Mexico',
  'Nebraska': 'Nebraska',
  'NE': 'Nebraska',
  'West Virginia': 'West Virginia',
  'WV': 'West Virginia',
  'Idaho': 'Idaho',
  'ID': 'Idaho',
  'Hawaii': 'Hawaii',
  'HI': 'Hawaii',
  'New Hampshire': 'New Hampshire',
  'NH': 'New Hampshire',
  'Maine': 'Maine',
  'ME': 'Maine',
  'Montana': 'Montana',
  'MT': 'Montana',
  'Rhode Island': 'Rhode Island',
  'RI': 'Rhode Island',
  'Delaware': 'Delaware',
  'DE': 'Delaware',
  'South Dakota': 'South Dakota',
  'SD': 'South Dakota',
  'North Dakota': 'North Dakota',
  'ND': 'North Dakota',
  'Alaska': 'Alaska',
  'AK': 'Alaska',
  'Vermont': 'Vermont',
  'VT': 'Vermont',
  'Wyoming': 'Wyoming',
  'WY': 'Wyoming',
  'District of Columbia': 'District of Columbia',
  'DC': 'District of Columbia',
  'D.C.': 'District of Columbia'
};

// TopoJSON files are bundled under public/maps (see public/maps/README.md) and
// loaded from there first; the jsDelivr copies they were taken from are the fallback.
const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const US_STATES = {
  local: `${BASE}maps/states-10m.json`,
  cdn: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
};
const WORLD_COUNTRIES = {
  local: `${BASE}maps/countries-110m.json`,
  cdn: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
};
const CDN_FALLBACKS = {
  [US_STATES.local]: US_STATES.cdn,
  [WORLD_COUNTRIES.local]: WORLD_COUNTRIES.cdn
};

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load TopoJSON (${response.status} ${response.statusText})`);
  }
  return response.json();
}

/**
 * Load TopoJSON data from URL or local file. A bundled /maps/ file falls back
 * to its CDN copy if it cannot be loaded. Concurrent requests share one fetch.
 * @param {string} url - URL or path to TopoJSON file
 * @returns {Promise<Object>} Parsed TopoJSON object
 */
export function loadTopoJSON(url) {
  if (topoJsonCache.has(url)) {
    return topoJsonCache.get(url);
  }

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

  topoJsonCache.set(url, request);
  // Do not cache failures, so a later attempt can retry.
  request.catch(() => topoJsonCache.delete(url));
  return request;
}

/**
 * Convert TopoJSON to GeoJSON features
 * @param {Object} topoJson - TopoJSON object
 * @param {string} objectName - Name of the TopoJSON object to extract
 * @returns {Array} Array of GeoJSON features
 */
export function getGeoJSONFeatures(topoJson, objectName) {
  try {
    if (!topoJson.objects || !topoJson.objects[objectName]) {
      throw new Error(`TopoJSON object "${objectName}" not found`);
    }
    
    const featureCollection = topojson.feature(topoJson, topoJson.objects[objectName]);
    return featureCollection.features;
  } catch (error) {
    console.error('Error converting TopoJSON to GeoJSON:', error);
    throw error;
  }
}

/**
 * Normalize state name to handle variations
 * @param {string} name - State name or abbreviation
 * @returns {string} Normalized state name
 */
export function normalizeStateName(name) {
  if (typeof name !== 'string') return name;
  const trimmed = name.trim();
  return stateNameMap[trimmed] || stateNameMap[trimmed.toUpperCase()] || trimmed;
}

/**
 * Find a feature by name in a GeoJSON feature collection
 * @param {Array} features - Array of GeoJSON features
 * @param {string} name - Name to search for
 * @param {string} propertyName - Property name to search in (default: 'name')
 * @returns {Object|null} Matching feature or null
 */
export function findFeatureByName(features, name, propertyName = 'name') {
  if (name === null || name === undefined) return null;
  name = String(name).trim();
  if (!name) return null;
  const normalizedName = normalizeStateName(name);
  
  // Try exact match first
  let feature = features.find(f => {
    const propValue = f.properties?.[propertyName];
    return propValue === name || propValue === normalizedName;
  });
  
  // Try case-insensitive match
  if (!feature) {
    feature = features.find(f => {
      const propValue = f.properties?.[propertyName];
      return propValue && propValue.toLowerCase() === normalizedName.toLowerCase();
    });
  }
  
  // Try partial match (only for names long enough to be meaningful)
  if (!feature && normalizedName.length >= 3) {
    feature = features.find(f => {
      const propValue = f.properties?.[propertyName];
      return propValue && propValue.toLowerCase().includes(normalizedName.toLowerCase());
    });
  }
  
  return feature || null;
}

/**
 * Calculate geographic centroid for a feature
 * @param {Object} feature - GeoJSON feature
 * @returns {Array} [longitude, latitude] coordinates
 */
export function getFeatureCentroid(feature) {
  try {
    return geoCentroid(feature);
  } catch (error) {
    console.error('Error calculating centroid:', error);
    // Fallback: return [0, 0] if calculation fails
    return [0, 0];
  }
}

/**
 * Map data regions to GeoJSON features
 * @param {Array} dataRegions - Array of data objects with name property
 * @param {Array} features - Array of GeoJSON features
 * @param {string} propertyName - Property name to match against (default: 'name')
 * @returns {Map} Map of data region name to GeoJSON feature
 */
export function mapDataToFeatures(dataRegions, features, propertyName = 'name') {
  const mapping = new Map();
  
  dataRegions.forEach(region => {
    const feature = findFeatureByName(features, region.name, propertyName);
    if (feature) {
      mapping.set(region.name, feature);
    }
  });
  
  return mapping;
}

/**
 * Match data regions to features, keyed by the feature's own name, so lookups
 * from the feature side work whatever spelling the user typed ("CA" and
 * "California" both colour California). Later rows win over earlier ones.
 * @param {Array} dataRegions - Array of data objects with name/value
 * @param {Array} features - Array of GeoJSON features
 * @param {string} propertyName - Feature property to match against (default: 'name')
 * @returns {Map} Map of feature name to the data region for it
 */
export function mapDataByFeatureName(dataRegions, features, propertyName = 'name') {
  const mapping = new Map();
  (dataRegions || []).forEach(region => {
    const feature = findFeatureByName(features, region?.name, propertyName);
    if (feature) {
      mapping.set(feature.properties?.[propertyName], region);
    }
  });
  return mapping;
}

/**
 * Get default TopoJSON URLs
 * @returns {Object} Object with US and world map URLs
 */
export function getDefaultMapUrls() {
  return {
    us: US_STATES.local,
    world: WORLD_COUNTRIES.local
  };
}

/**
 * Get country-specific TopoJSON URL
 * Currently supports US states. Can be extended for other countries.
 * @param {string} countryName - Name of the country
 * @returns {string|null} URL to country-specific TopoJSON or null if not available
 */
export function getCountryMapUrl(countryName) {
  const countryMap = {
    'United States': US_STATES.local,
    'United States of America': US_STATES.local,
    'USA': US_STATES.local,
    'US': US_STATES.local
  };
  
  return countryMap[countryName] || null;
}

/**
 * Get object name for country-specific TopoJSON
 * @param {string} countryName - Name of the country
 * @returns {string} Object name in TopoJSON (e.g., 'states', 'provinces')
 */
export function getCountryObjectName(countryName) {
  const countryMap = {
    'United States': 'states',
    'United States of America': 'states',
    'USA': 'states',
    'US': 'states'
  };
  
  return countryMap[countryName] || 'states';
}

