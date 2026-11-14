import { ref, shallowRef, watch, onBeforeUnmount } from 'vue';
import { MAP_URLS, admin1Url, loadMapFile, getGeoJSONFeatures, getBorderMesh } from '../../utils/mapData.js';
import { AREAS, USA_ID, extentPoints, describeCountry, describeState, describeCounties, canonicalCounty, describeAdmin1 } from '../../utils/mapAreas.js';
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
      const next = await build(choice);
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
    remote: [],
  };
};

async function build({ area: areaKey, country, includeRemote }) {
  const area = AREAS[areaKey] || AREAS.world;
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
