import { geoAlbersUsa, geoMercator, geoEqualEarth, geoPath } from 'd3-geo';

/**
 * Inner extent [[x0, y0], [x1, y1]] for fitting, keeping padding on each side
 * but never collapsing below 1px.
 */
function fitExtent(width, height, padding = 0) {
  const p = Math.max(0, Math.min(padding, width / 4, height / 4));
  return [[p, p], [Math.max(p + 1, width - p), Math.max(p + 1, height - p)]];
}

/**
 * Create Albers USA projection for US states
 * This projection is optimized for the continental US, Alaska, and Hawaii.
 * With `fitObject` (GeoJSON, e.g. the states) the projection is fitted to the
 * container; otherwise it is scaled from d3's reference size (1070 at 960x600)
 * so it still fits small containers.
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {Object|null} fitObject - GeoJSON object to fit (optional)
 * @param {number} padding - Padding in pixels when fitting (default: 10)
 * @returns {Object} D3 projection function
 */
export function createUSProjection(width, height, fitObject = null, padding = 10) {
  const projection = geoAlbersUsa();
  if (fitObject) {
    return projection.fitExtent(fitExtent(width, height, padding), fitObject);
  }
  return projection
    .scale(1070 * Math.min(width / 960, height / 600))
    .translate([width / 2, height / 2]);
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
    // Fit the full 360° of longitude (and roughly ±85° latitude) in the box
    projection.scale(Math.min(width, height) / (2 * Math.PI));
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
  if (scale === null && center[0] === 0 && center[1] === 0) {
    // Fit the whole globe to the box, whatever its aspect ratio
    return geoEqualEarth().fitExtent(fitExtent(width, height, 10), { type: 'Sphere' });
  }
  const projection = geoEqualEarth()
    .center(center)
    .translate([width / 2, height / 2]);
  projection.scale(scale !== null ? scale : width / 5.5);
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
  // d3's fitExtent resets scale/translate before measuring, so the result does
  // not depend on the projection's previous state.
  return projection.fitExtent(
    fitExtent(width, height, padding),
    { type: 'FeatureCollection', features }
  );
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
 * @param {Object|null} fitObject - GeoJSON to fit the projection to (optional; used for US maps)
 * @returns {Object} D3 projection function
 */
export function createProjection(mapType, width, height, projectionType = 'equalEarth', fitObject = null) {
  if (mapType === 'world') {
    if (projectionType === 'mercator') {
      return createWorldMercatorProjection(width, height);
    }
    return createWorldEqualEarthProjection(width, height);
  }
  // 'us' and anything else
  return createUSProjection(width, height, fitObject);
}
