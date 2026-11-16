import { ref, shallowRef, watch, onBeforeUnmount } from 'vue';
import { MAP_URLS, admin1Url, loadMapFile, getGeoJSONFeatures, getBorderMesh } from '../../utils/mapData.js';
import { geoBounds, geoCentroid } from 'd3-geo';
import { AREAS, USA_ID, extentPoints, describeCountry, describeState, describeCounties, canonicalCounty, describeAdmin1, parseUsFocus, usFocusOptions } from '../../utils/mapAreas.js';
import { createRegionIndex } from '../../utils/regionMatch.js';

/**
 * Loads the geography for the chosen area, or for a country opened from a
 * world or continent map, and describes it for the map components: the
 * features that carry data, countries drawn around them for context, border
 * lines to draw on top, how to project and fit it, and an index for matching
 * region names. Loads are guarded by a request id, so a slow file can never
 * replace a newer choice.
 *
 * @param {() => { area: string, country: string | null, includeRemote: boolean }} getChoice
 * @returns {{ geo: import('vue').ShallowRef<object | null>, loading: import('vue').Ref<boolean>, error: import('vue').Ref<string | null> }}
 */
export function useGeography(getChoice) {
  const geo = shallowRef(null);
  const loading = ref(true);
  const error = ref(null);
  let requestId = 0;
  onBeforeUnmount(() => {
    requestId++;
  });

  const load = async (key) => {
    const id = ++requestId;
    const choice = JSON.parse(key);
    loading.value = true;
    error.value = null;
    try {
      const next = await buildGeography(choice);
      if (id !== requestId) return;
      geo.value = next;
    } catch (err) {
      if (id !== requestId) return;
      console.error('Error loading map data:', err);
      error.value = err.message || 'Failed to load map data';
      geo.value = null;
    } finally {
      if (id === requestId) loading.value = false;
    }
  };

  watch(() => JSON.stringify(getChoice()), load, { immediate: true });
  return { geo, loading, error };
}

// Opening a state from a US map shows its counties
const openState = (feature) => (Number(feature.id) <= 56 ? `state:${feature.id}` : null);

const usStates = async () => {
  const topo = await loadMapFile(MAP_URLS.usStates);
  const features = getGeoJSONFeatures(topo, 'states');
  return {
    kind: 'us-states',
    name: 'the United States',
    features,
    context: [],
    overlay: null,
    projection: { type: 'albersUsa' },
    fit: { type: 'FeatureCollection', features },
    index: createRegionIndex(features, describeState),
    drillable: openState,
    focusOptions: usFocusOptions(),
    remote: [],
  };
};

/** A conic projection centred on a group of features, with standard parallels inside their latitude span */
const conicFor = (collection) => {
  const [[, south], [, north]] = geoBounds(collection);
  const [lon] = geoCentroid(collection);
  const span = north - south;
  return { type: 'conicEqualArea', rotate: [-lon, 0], parallels: [south + span / 6, north - span / 6] };
};

/**
 * Part of the US on its own: the states of a Census region or division (with
 * their counties on a counties map), or one state's counties. Other states are
 * drawn faintly around it. `outsideIndex` matches names anywhere in the US, so
 * data for places outside the view is reported as such, not as unknown.
 */
async function usFocus(areaKey, focus) {
  const area = AREAS[areaKey];
  const parent = { area: areaKey, label: area.label };
  const showCounties = focus.kind === 'state' || area.source === 'us-counties';
  const inFocus = (fips) => focus.states.includes(String(fips).slice(0, 2));
  const base = { key: `${areaKey}/${focus.kind}:${focus.key}`, country: `${focus.kind}:${focus.key}`, countryName: focus.label, name: focus.label, parent, overlay: null, remote: [] };

  if (!showCounties) {
    const topo = await loadMapFile(MAP_URLS.usStates);
    const all = getGeoJSONFeatures(topo, 'states');
    const features = all.filter((f) => inFocus(f.id));
    return {
      ...base,
      kind: 'us-focus',
      features,
      context: all.filter((f) => !inFocus(f.id)),
      // Albers USA keeps Alaska and Hawaii in their insets for the Pacific and the West
      projection: { type: 'albersUsa' },
      fit: { type: 'FeatureCollection', features },
      index: createRegionIndex(features, describeState),
      outsideIndex: createRegionIndex(all, describeState),
      drillable: openState,
    };
  }

  const topo = await loadMapFile(MAP_URLS.usCounties);
  const all = getGeoJSONFeatures(topo, 'counties');
  const states = getGeoJSONFeatures(topo, 'states');
  const features = all.filter((f) => inFocus(f.id));
  const fit = { type: 'FeatureCollection', features };
  const spansInsets = focus.states.some((fips) => fips === '02' || fips === '15') && focus.states.length > 1;
  return {
    ...base,
    kind: 'us-focus',
    features,
    context: states.filter((f) => !inFocus(f.id)),
    // State lines over a region's counties
    overlay: focus.kind === 'state' ? null : getBorderMesh(topo, 'states'),
    projection: spansInsets ? { type: 'albersUsa' } : conicFor(fit),
    fit,
    index: createRegionIndex(features, describeCounties(features), { canonical: canonicalCounty }),
    outsideIndex: createRegionIndex(all, describeCounties(all), { canonical: canonicalCounty }),
  };
}

/** The geography for a choice (exported for tests; useGeography loads it reactively) */
export async function buildGeography({ area: areaKey, country, includeRemote }) {
  const area = AREAS[areaKey] || AREAS.world;
  // A state or region opened from a US map (also the US opened from the world map)
  const focus = parseUsFocus(country);
  if (focus) return usFocus(areaKey, focus);
  if (area.source === 'us-states') return { ...(await usStates()), key: areaKey };
  if (area.source === 'us-counties') {
    const topo = await loadMapFile(MAP_URLS.usCounties);
    const features = getGeoJSONFeatures(topo, 'counties');
    return {
      key: areaKey,
      kind: 'us-counties',
      name: 'US counties',
      features,
      context: [],
      // State lines over the counties, so the map stays readable
      overlay: getBorderMesh(topo, 'states'),
      projection: { type: 'albersUsa' },
      fit: { type: 'FeatureCollection', features },
      index: createRegionIndex(features, describeCounties(features), { canonical: canonicalCounty }),
      focusOptions: usFocusOptions(),
      remote: [],
    };
  }

  const [worldTopo, countries] = await Promise.all([loadMapFile(MAP_URLS.world), loadMapFile(MAP_URLS.countries)]);
  const world = getGeoJSONFeatures(worldTopo, 'countries');
  const parent = { area: areaKey, label: area.label };

  if (country) {
    const meta = countries[country];
    const name = meta?.name || world.find((f) => f.id === country)?.properties?.name || 'this country';
    if (country === USA_ID) return { ...(await usStates()), key: `${areaKey}/${country}`, name, country, countryName: name, parent };
    if (!meta?.admin1) throw new Error(`Regions are not available for ${name}`);
    const topo = await loadMapFile(admin1Url(country));
    const features = getGeoJSONFeatures(topo, 'regions');
    const fitPoints = topo.fit?.fit;
    const remote = topo.fit?.remote || [];
    return {
      key: `${areaKey}/${country}`,
      kind: 'country',
      name,
      country,
      countryName: name,
      countryA3: meta.a3,
      parent,
      features,
      context: [],
      overlay: null,
      // Centred on the country, so it is drawn without the distortion a world projection gives it
      projection: { type: 'azimuthalEqualArea', rotate: topo.fit?.center ? [-topo.fit.center[0], -topo.fit.center[1]] : [0, 0] },
      fit: includeRemote || !fitPoints ? { type: 'FeatureCollection', features } : { type: 'MultiPoint', coordinates: fitPoints },
      index: createRegionIndex(features, describeAdmin1),
      remote: includeRemote ? [] : remote,
      hasRemote: remote.length > 0,
    };
  }

  const describe = describeCountry(countries);
  const drillable = (feature) => (countries[feature.id]?.admin1 ? feature.id : null);
  if (!area.continent) {
    return {
      key: areaKey,
      kind: 'world',
      name: 'the world',
      features: world,
      context: [],
      overlay: null,
      projection: { type: 'world' },
      fit: { type: 'Sphere' },
      index: createRegionIndex(world, describe),
      countries,
      drillable,
      remote: [],
    };
  }
  const inside = world.filter((f) => countries[f.id]?.continent === area.continent);
  return {
    key: areaKey,
    kind: 'continent',
    name: area.label,
    features: inside,
    // Neighbours, drawn faintly so the continent doesn't float in space
    context: world.filter((f) => countries[f.id]?.continent !== area.continent),
    overlay: null,
    projection: area.projection,
    fit: extentPoints(area.extent),
    index: createRegionIndex(inside, describe),
    countries,
    drillable,
    remote: [],
  };
}
