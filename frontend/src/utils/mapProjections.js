import { geoAlbersUsa, geoMercator, geoEqualEarth, geoPath } from 'd3-geo';

/**
 * Create Albers USA projection for US states
 * This projection is optimized for the continental US, Alaska, and Hawaii
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {Object} D3 projection function
 */
export function createUSProjection(width, height) {
  const projection = geoAlbersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);
  
  return projection;
}

/**
 * Create Mercator projection for world maps
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {Array} center - [longitude, latitude] center point (default: [0, 0])
 * @param {number} scale - Scale factor (default: auto-calculated)
 * @returns {Object} D3 projection function
 */
export function createWorldMercatorProjection(width, height, center = [0, 0], scale = null) {
  const projection = geoMercator()
    .center(center)
    .translate([width / 2, height / 2]);
  
  if (scale !== null) {
    projection.scale(scale);
  } else {
    // Auto-calculate scale based on width
    projection.scale(width / (2 * Math.PI));
  }
  
  return projection;
}

/**
 * Create Equal Earth projection for world maps (better area preservation)
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {Array} center - [longitude, latitude] center point (default: [0, 0])
 * @param {number} scale - Scale factor (default: auto-calculated)
 * @returns {Object} D3 projection function
 */
export function createWorldEqualEarthProjection(width, height, center = [0, 0], scale = null) {
  const projection = geoEqualEarth()
    .center(center)
    .translate([width / 2, height / 2]);
  
  if (scale !== null) {
    projection.scale(scale);
  } else {
    // Auto-calculate scale based on width
    projection.scale(width / 2.5);
  }
  
  return projection;
}

/**
 * Create a path generator from a projection
 * @param {Object} projection - D3 projection function
 * @returns {Function} D3 geoPath generator
 */
export function createPathGenerator(projection) {
  return geoPath().projection(projection);
}

/**
 * Get projection bounds for a feature collection
 * @param {Object} projection - D3 projection function
 * @param {Array} features - Array of GeoJSON features
 * @returns {Object} Bounds object with x0, y0, x1, y1
 */
export function getProjectionBounds(projection, features) {
  const path = createPathGenerator(projection);
  const bounds = path.bounds({ type: 'FeatureCollection', features });
  
  return {
    x0: bounds[0][0],
    y0: bounds[0][1],
    x1: bounds[1][0],
    y1: bounds[1][1],
    width: bounds[1][0] - bounds[0][0],
    height: bounds[1][1] - bounds[0][1]
  };
}

/**
 * Fit projection to features with padding
 * @param {Object} projection - D3 projection function
 * @param {Array} features - Array of GeoJSON features
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {number} padding - Padding in pixels (default: 20)
 * @returns {Object} Updated projection
 */
export function fitProjectionToFeatures(projection, features, width, height, padding = 20) {
  const path = createPathGenerator(projection);
  const bounds = path.bounds({ type: 'FeatureCollection', features });
  
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.min((width - padding * 2) / dx, (height - padding * 2) / dy);
  const translate = [width / 2 - scale * x, height / 2 - scale * y];
  
  return projection
    .scale(scale)
    .translate(translate);
}

/**
 * Project geographic coordinates to screen coordinates
 * @param {Object} projection - D3 projection function
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @returns {Array|null} [x, y] screen coordinates or null if invalid
 */
export function projectCoordinates(projection, longitude, latitude) {
  try {
    const point = projection([longitude, latitude]);
    return point ? [point[0], point[1]] : null;
  } catch (error) {
    console.error('Error projecting coordinates:', error);
    return null;
  }
}

/**
 * Invert screen coordinates to geographic coordinates
 * @param {Object} projection - D3 projection function
 * @param {number} x - Screen x coordinate
 * @param {number} y - Screen y coordinate
 * @returns {Array|null} [longitude, latitude] or null if invalid
 */
export function invertCoordinates(projection, x, y) {
  try {
    const coords = projection.invert([x, y]);
    return coords ? [coords[0], coords[1]] : null;
  } catch (error) {
    console.error('Error inverting coordinates:', error);
    return null;
  }
}

/**
 * Create projection based on map type
 * @param {string} mapType - 'us' or 'world'
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {string} projectionType - 'mercator' or 'equalEarth' for world maps (default: 'equalEarth')
 * @returns {Object} D3 projection function
 */
export function createProjection(mapType, width, height, projectionType = 'equalEarth') {
  if (mapType === 'us') {
    return createUSProjection(width, height);
  } else if (mapType === 'world') {
    if (projectionType === 'mercator') {
      return createWorldMercatorProjection(width, height);
    } else {
      return createWorldEqualEarthProjection(width, height);
    }
  } else {
    // Default to US projection
    return createUSProjection(width, height);
  }
}

