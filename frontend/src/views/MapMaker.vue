<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Map maker"
      lead="Create interactive choropleth and flow maps with accurate geographic boundaries using TopoJSON data and D3-geo projections."
      spot="tools/map-maker"
      size="tool"
    />

    <PageSection title="Map type" description="Colour regions by value, or show movement between places.">
      <UiChoiceCards v-model="selectedMapType" :options="mapTypes" :columns="2" aria-label="Map type" />
    </PageSection>

    <PageSection title="Build" description="Set up the map, enter your data and export it." divided>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 flex flex-col gap-6">
          <UiPanel title="Map configuration">
            <div class="flex flex-col gap-4">
              <UiSelect v-model="mapConfig.mapType" label="Geographic area" :options="areaOptions" @update:model-value="handleMapTypeChange" />
              <UiSelect v-if="mapConfig.mapType === 'world'" v-model="mapConfig.mapProjection" label="Projection" :options="projectionOptions" />
              <UiCheckbox v-if="selectedMapType === 'choropleth'" v-model="mapConfig.showAllRegions" label="Show all regions" />
              <UiSelect v-model="mapConfig.colorScheme" label="Color scheme" :options="colorSchemeOptions" />
            </div>
          </UiPanel>

          <UiPanel title="Data">
            <!-- Choropleth data -->
            <fieldset v-if="selectedMapType === 'choropleth'" class="flex flex-col gap-2">
              <legend class="mb-2 text-sm font-medium text-ink">Regions</legend>
              <div v-for="(region, index) in choroplethData" :key="index" class="flex items-center gap-2">
                <div class="flex-1 min-w-0">
                  <UiInput v-model="region.name" placeholder="Region name" :aria-label="`Region ${index + 1} name`" />
                </div>
                <div class="w-32">
                  <UiInput v-model.number="region.value" type="number" placeholder="Value" :aria-label="`Region ${index + 1} value`" />
                </div>
                <UiButton
                  icon-only
                  icon="delete"
                  variant="ghost"
                  size="sm"
                  :label="`Remove region ${index + 1}`"
                  :disabled="choroplethData.length <= 1"
                  @click="choroplethData.splice(index, 1)"
                />
              </div>
              <UiButton icon="add" size="sm" class="self-start" @click="choroplethData.push({ name: `Region ${choroplethData.length + 1}`, value: 0 })">Add region</UiButton>
            </fieldset>

            <!-- Flow map data -->
            <div v-else-if="selectedMapType === 'flowMap'" class="flex flex-col gap-6">
              <fieldset class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-medium text-ink">Locations</legend>
                <div v-for="(node, index) in flowMapData.nodes" :key="index" class="grid grid-cols-2 gap-2 p-3 rounded-tile border border-line bg-surface-sunken">
                  <UiInput v-model="node.id" placeholder="ID" :aria-label="`Location ${index + 1} ID`" />
                  <UiInput v-model="node.label" placeholder="Location name" :aria-label="`Location ${index + 1} name`" />
                  <UiInput v-model.number="node.lat" type="number" step="0.0001" placeholder="Latitude" :aria-label="`Location ${index + 1} latitude`" />
                  <UiInput v-model.number="node.lng" type="number" step="0.0001" placeholder="Longitude" :aria-label="`Location ${index + 1} longitude`" />
                  <UiButton
                    icon="delete"
                    variant="ghost"
                    size="sm"
                    class="col-span-2 justify-self-end"
                    :disabled="flowMapData.nodes.length <= 2"
                    @click="flowMapData.nodes.splice(index, 1)"
                  >
                    Remove location
                  </UiButton>
                </div>
                <UiButton
                  icon="add"
                  size="sm"
                  class="self-start"
                  @click="flowMapData.nodes.push({ id: `Loc${flowMapData.nodes.length + 1}`, label: `Location ${flowMapData.nodes.length + 1}`, lat: 0, lng: 0 })"
                >
                  Add location
                </UiButton>
              </fieldset>

              <fieldset class="flex flex-col gap-3">
                <legend class="mb-2 text-sm font-medium text-ink">Flows</legend>
                <div v-for="(link, index) in flowMapData.links" :key="index" class="flex flex-col gap-2 p-3 rounded-tile border border-line bg-surface-sunken">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0"><UiSelect v-model="link.source" :options="nodeOptions" :aria-label="`Flow ${index + 1} from`" /></div>
                    <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">arrow_forward</span>
                    <div class="flex-1 min-w-0"><UiSelect v-model="link.target" :options="nodeOptions" :aria-label="`Flow ${index + 1} to`" /></div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0"><UiInput v-model.number="link.value" type="number" placeholder="Value" :aria-label="`Flow ${index + 1} value`" /></div>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove flow ${index + 1}`" @click="flowMapData.links.splice(index, 1)" />
                  </div>
                </div>
                <UiButton
                  icon="add"
                  size="sm"
                  class="self-start"
                  @click="flowMapData.links.push({ source: flowMapData.nodes[0]?.id || '', target: flowMapData.nodes[1]?.id || '', value: 10 })"
                >
                  Add flow
                </UiButton>
              </fieldset>
            </div>
          </UiPanel>
        </div>

        <div class="lg:col-span-2">
          <UiPanel title="Preview">
            <template #actions>
              <UiButton v-if="mapConfig.mapType === 'world' && drillDownState.level === 'country'" icon="arrow_back" size="sm" @click="handleDrillUp">
                Back to world
              </UiButton>
              <UiButton
                v-for="format in ['png', 'svg']"
                :key="format"
                icon="download"
                size="sm"
                :disabled="format === 'png' && exporting"
                :aria-label="`Export map as ${format.toUpperCase()}`"
                @click="format === 'png' ? exportPNG() : exportSVG()"
              >
                {{ format.toUpperCase() }}
              </UiButton>
            </template>

            <InlineNotice :notice="notice" class="mb-3" @dismiss="clearNotice" />

            <nav v-if="mapConfig.mapType === 'world' && drillDownState.breadcrumbs.length > 0" aria-label="Map level" class="mb-2 flex items-center gap-2 text-sm text-ink-secondary">
              <span>World</span>
              <span class="material-symbols-outlined text-xs" aria-hidden="true">chevron_right</span>
              <span aria-current="location">{{ drillDownState.selectedCountry }}</span>
            </nav>

            <UiCallout v-if="mapConfig.mapType === 'world' && drillDownState.level === 'world' && selectedMapType === 'choropleth'" class="mb-3">
              Click on a country to view its regions (e.g., United States)
            </UiCallout>

            <div ref="mapWellRef" class="map-well">
              <ChoroplethMapSVG
                v-if="selectedMapType === 'choropleth'"
                ref="mapViewRef"
                :data="choroplethData"
                :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                :mapType="mapConfig.mapType || 'us'"
                :projectionType="mapConfig.mapProjection"
                :showAllRegions="mapConfig.showAllRegions !== false"
                :drillDownState="drillDownState"
                :onDrillDown="handleDrillDown"
                :onDrillUp="handleDrillUp"
              />
              <FlowMapSVG
                v-else-if="selectedMapType === 'flowMap'"
                ref="mapViewRef"
                :data="flowMapData"
                :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                :mapType="mapConfig.mapType || 'us'"
                :projectionType="mapConfig.mapProjection"
              />
            </div>
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onBeforeUnmount, h } from 'vue';
import { useNotice } from '../composables/useNotice.js';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiInput, UiPanel, UiSelect } from '../components/ui';
import UiChoiceCards from '../components/ui/UiChoiceCards.vue';
import { loadTopoJSON, getGeoJSONFeatures, mapDataByFeatureName, getFeatureCentroid, getDefaultMapUrls, getCountryMapUrl, getCountryObjectName } from '../utils/mapData.js';
import { createProjection, createPathGenerator, projectCoordinates, fitProjectionToFeatures } from '../utils/mapProjections.js';

const { notice, showNotice, clearNotice } = useNotice();

const mapTypes = [
  { value: 'choropleth', label: 'Choropleth map', icon: 'map', description: 'Geographic regions colored by data values' },
  { value: 'flowMap', label: 'Flow map', icon: 'route', description: 'Shows movement/flow between locations' }
];

const areaOptions = [
  { value: 'us', label: 'United States' },
  { value: 'world', label: 'World' }
];

const projectionOptions = [
  { value: 'equalEarth', label: 'Equal Earth' },
  { value: 'mercator', label: 'Mercator' }
];

const selectedMapType = ref('choropleth');

const mapConfig = ref({
  mapType: 'us', // 'us' | 'world'
  mapProjection: 'equalEarth', // 'mercator' | 'equalEarth' (for world maps)
  showAllRegions: true, // Show all regions or only data regions
  colorScheme: 'default'
});

// Drill-down state
const drillDownState = ref({
  level: 'world', // 'world' | 'country'
  selectedCountry: null, // Country name when drilled down
  breadcrumbs: [] // Navigation breadcrumbs
});

const colorSchemes = {
  default: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
  green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
  orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb']
};

const colorSchemeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' }
];

// Choropleth map data
const choroplethData = ref([
  { name: 'California', value: 39538223, coordinates: null },
  { name: 'Texas', value: 29145505, coordinates: null },
  { name: 'Florida', value: 21538187, coordinates: null },
  { name: 'New York', value: 20201249, coordinates: null },
  { name: 'Pennsylvania', value: 13002700, coordinates: null }
]);

// Flow map data
const flowMapData = ref({
  nodes: [
    { id: 'NYC', label: 'New York', lat: 40.7128, lng: -74.0060 },
    { id: 'LA', label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { id: 'CHI', label: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { id: 'HOU', label: 'Houston', lat: 29.7604, lng: -95.3698 }
  ],
  links: [
    { source: 'NYC', target: 'LA', value: 500 },
    { source: 'NYC', target: 'CHI', value: 300 },
    { source: 'LA', target: 'HOU', value: 200 },
    { source: 'CHI', target: 'HOU', value: 150 }
  ]
});

const nodeOptions = computed(() => flowMapData.value.nodes.map((node) => ({ value: node.id, label: node.label })));

/**
 * Parse a user-entered value as a number. Inputs bound with v-model.number
 * give '' when empty, and pasted values may carry thousands separators.
 * Returns NaN for anything that is not a finite number.
 */
const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/[,\s]/g, ''));
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

const formatValue = (value) => (Number.isFinite(value) ? value.toLocaleString() : String(value));

const formatCompact = (value) => {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  } catch {
    return formatValue(value);
  }
};

/** Text that stays readable on any fill: strong text with a halo in the surface colour. */
const labelAttrs = {
  class: 'fill-ink-strong stroke-surface-raised pointer-events-none',
  'stroke-width': 3,
  'stroke-linejoin': 'round',
  'paint-order': 'stroke',
  'font-size': 12,
  'font-weight': 'bold'
};

const centeredMessage = (text, isError = false) =>
  h('div', { class: 'absolute inset-0 flex items-center justify-center' }, [
    h('div', { class: isError ? 'text-sm text-danger' : 'text-sm text-ink-muted', role: isError ? 'alert' : 'status' }, text)
  ]);

/**
 * Shared plumbing for both map components: measures the container (which is
 * always rendered, so the ResizeObserver can attach on mount), loads TopoJSON
 * with a request id so a stale load can never overwrite a newer one, and
 * rebuilds the projection from the current fit whenever the size changes.
 *
 * `getSource` returns { kind, url, objectName } or { error }; kind is 'us',
 * 'world' or 'country' (a drill-down, fitted to the country's features).
 */
function useMapSurface(props, getSource) {
  const containerRef = ref(null);
  const svgRef = ref(null);
  const width = ref(800);
  const height = ref(500);
  const loading = ref(true);
  const error = ref(null);
  const features = shallowRef([]);
  const fit = shallowRef(null);
  let requestId = 0;
  let resizeObserver = null;

  const measure = () => {
    const el = containerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      width.value = Math.round(rect.width);
      height.value = Math.round(rect.height);
    }
  };

  watch(containerRef, (el) => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (!el) return;
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(el);
    }
  }, { flush: 'post' });

  onBeforeUnmount(() => {
    requestId++; // drop any load still in flight
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  // Rebuilt on resize or projection change, keeping the current fit (US
  // states, world sphere or the drilled-down country).
  const projection = computed(() => {
    const current = fit.value;
    if (!current) return null;
    const w = width.value;
    const hgt = height.value;
    if (current.kind === 'country') {
      return fitProjectionToFeatures(createProjection('us', w, hgt), current.features, w, hgt, 20);
    }
    if (current.kind === 'world') {
      return createProjection('world', w, hgt, props.projectionType || 'equalEarth');
    }
    return createProjection('us', w, hgt, undefined, { type: 'FeatureCollection', features: current.features });
  });

  const pathGenerator = computed(() => (projection.value ? createPathGenerator(projection.value) : null));

  // Path strings are the expensive part; compute them once per projection.
  const paths = computed(() => {
    const gen = pathGenerator.value;
    if (!gen) return [];
    return features.value.map((feature) => gen(feature));
  });

  const load = async (sourceKey) => {
    const id = ++requestId;
    const source = JSON.parse(sourceKey);
    loading.value = true;
    error.value = null;
    try {
      if (source.error) throw new Error(source.error);
      const topoJson = await loadTopoJSON(source.url);
      if (id !== requestId) return;
      const geoFeatures = getGeoJSONFeatures(topoJson, source.objectName);
      features.value = geoFeatures;
      fit.value = { kind: source.kind, features: geoFeatures };
    } catch (err) {
      if (id !== requestId) return;
      console.error('Error loading map data:', err);
      error.value = err.message || 'Failed to load map data';
      features.value = [];
      fit.value = null;
    } finally {
      if (id === requestId) loading.value = false;
    }
  };

  // One watcher over everything that decides which file to load, keyed by a
  // string so a new-but-equal drill-down object does not trigger a reload.
  watch(() => JSON.stringify(getSource()), load, { immediate: true });

  /** Wrap content in the always-present, measured container. */
  const renderSurface = (content) => {
    let inner;
    if (loading.value) inner = centeredMessage('Loading map...');
    else if (error.value) inner = centeredMessage(`Error: ${error.value}`, true);
    else if (!projection.value || !features.value.length) inner = centeredMessage('No map data available');
    else inner = content();
    return h('div', { ref: containerRef, class: 'w-full h-full min-h-72 relative' }, [inner]);
  };

  return { containerRef, svgRef, width, height, loading, error, features, projection, paths, renderSurface };
}

const baseMapSource = (mapType) => {
  const urls = getDefaultMapUrls();
  return mapType === 'world'
    ? { kind: 'world', url: urls.world, objectName: 'countries' }
    : { kind: 'us', url: urls.us, objectName: 'states' };
};

// Choropleth Map SVG Component
const ChoroplethMapSVG = {
  props: ['data', 'colors', 'mapType', 'projectionType', 'showAllRegions', 'drillDownState', 'onDrillDown', 'onDrillUp'],
  setup(props, { expose }) {
    const surface = useMapSurface(props, () => {
      const state = props.drillDownState;
      if (props.mapType === 'world' && state?.level === 'country' && state.selectedCountry) {
        const url = getCountryMapUrl(state.selectedCountry);
        if (!url) return { error: `Detailed map data not available for ${state.selectedCountry}` };
        return { kind: 'country', url, objectName: getCountryObjectName(state.selectedCountry) };
      }
      return baseMapSource(props.mapType);
    });
    const { svgRef, width, height, features, projection, paths, renderSurface } = surface;
    const hovered = ref(null);

    expose({ getSvgElement: () => svgRef.value });

    // Rows with a usable name and a numeric value
    const validData = computed(() => (props.data || [])
      .map((row) => ({ ...row, name: typeof row?.name === 'string' ? row.name.trim() : row?.name, value: toNumber(row?.value) }))
      .filter((row) => row.name && Number.isFinite(row.value)));

    // Keyed by the feature's own name, so "CA" and "California" both colour California
    const regionByFeature = computed(() => {
      if (!features.value.length) return new Map();
      return mapDataByFeatureName(validData.value, features.value);
    });

    // Sequential schemes run dark → light; higher values get the darker colours.
    const ramp = computed(() => {
      const colors = props.colors?.length ? props.colors : ['#6366f1'];
      return [...colors].reverse();
    });

    // Bin the values on the map into equal-width classes, one per colour.
    const scale = computed(() => {
      const values = Array.from(regionByFeature.value.values(), (r) => r.value);
      if (!values.length) return null;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const n = ramp.value.length;
      const span = max - min;
      const binOf = (value) => (span === 0 ? n - 1 : Math.min(n - 1, Math.max(0, Math.floor(((value - min) / span) * n))));
      const bins = span === 0
        ? [{ color: ramp.value[n - 1], from: min, to: max }]
        : ramp.value.map((color, i) => ({ color, from: min + (span * i) / n, to: min + (span * (i + 1)) / n }));
      return { min, max, color: (value) => ramp.value[binOf(value)], bins };
    });

    // Regions without data use the chart's neutral token, not a data colour

    const isClickable = () => props.mapType === 'world' && props.drillDownState?.level === 'world';

    const handleFeatureClick = (feature) => {
      if (!isClickable()) return;
      const countryName = feature.properties?.name;
      if (countryName && props.onDrillDown) {
        props.onDrillDown(countryName);
      }
    };

    const renderLegend = () => {
      const s = scale.value;
      if (!s) return null;
      const sw = 18;
      const sh = 12;
      const rowH = 18;
      const boxW = 150;
      const boxH = s.bins.length * rowH + 12;
      const x = 12;
      const y = Math.max(12, height.value - boxH - 12);
      return h('g', { transform: `translate(${x}, ${y})`, 'aria-hidden': 'true' }, [
        h('rect', { width: boxW, height: boxH, rx: 6, class: 'fill-surface-overlay stroke-line', 'fill-opacity': 0.9 }),
        ...[...s.bins].reverse().map((bin, i) => h('g', { transform: `translate(8, ${6 + i * rowH})` }, [
          h('rect', { width: sw, height: sh, fill: bin.color, class: 'stroke-line', 'stroke-width': 0.5 }),
          h('text', { x: sw + 6, y: sh / 2, 'dominant-baseline': 'middle', 'font-size': 11, class: 'fill-ink-secondary' },
            bin.from === bin.to ? formatCompact(bin.from) : `${formatCompact(bin.from)} – ${formatCompact(bin.to)}`)
        ]))
      ]);
    };

    return () => renderSurface(() => {
      const proj = projection.value;
      const clickable = isClickable();
      const regions = regionByFeature.value;
      const colorFor = scale.value?.color;
      const items = [];
      let hoveredPath = null;

      features.value.forEach((feature, index) => {
        const featureName = feature.properties?.name ?? `Region ${index + 1}`;
        const dataRegion = regions.get(featureName) || null;
        if (props.showAllRegions === false && !dataRegion) return;
        const pathData = paths.value[index];
        if (!pathData) return;

        const color = dataRegion && colorFor ? colorFor(dataRegion.value) : null;
        const valueText = dataRegion ? `: ${formatValue(dataRegion.value)}` : '';
        const label = clickable ? `${featureName}${valueText}. Activate to view its regions.` : `${featureName}${valueText}`;
        const isHovered = clickable && hovered.value === index;
        if (isHovered) hoveredPath = pathData;

        items.push(h('g', { key: `region-${index}` }, [
          h('path', {
            d: pathData,
            fill: color || undefined,
            class: [
              'stroke-surface-raised outline-none',
              clickable ? 'cursor-pointer' : 'cursor-default',
              color ? '' : (isHovered ? 'fill-ink-muted' : 'fill-chart-neutral')
            ],
            'stroke-width': 0.5,
            'aria-label': label,
            tabindex: clickable ? 0 : undefined,
            role: clickable ? 'button' : undefined,
            onClick: clickable ? () => handleFeatureClick(feature) : undefined,
            onKeydown: clickable ? (e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                handleFeatureClick(feature);
              }
            } : undefined,
            onMouseenter: clickable ? () => { hovered.value = index; } : undefined,
            onMouseleave: clickable ? () => { if (hovered.value === index) hovered.value = null; } : undefined,
            onFocus: clickable ? () => { hovered.value = index; } : undefined,
            onBlur: clickable ? () => { if (hovered.value === index) hovered.value = null; } : undefined
          }, [h('title', clickable ? `${featureName}${valueText} — click to view its regions` : `${featureName}${valueText}`)])
        ]));
      });

      // Labels for regions with data, drawn above all shapes
      const labels = [];
      features.value.forEach((feature, index) => {
        const featureName = feature.properties?.name;
        if (!featureName || !regions.has(featureName) || !paths.value[index]) return;
        const point = proj(getFeatureCentroid(feature));
        if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
        labels.push(h('text', { key: `label-${index}`, x: point[0], y: point[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle', ...labelAttrs }, featureName));
      });

      const summary = Array.from(regions.entries(), ([name, row]) => `${name}: ${formatValue(row.value)}`).join('; ');
      const area = props.drillDownState?.level === 'country' && props.mapType === 'world'
        ? props.drillDownState.selectedCountry
        : (props.mapType === 'world' ? 'the world' : 'the United States');

      return h('svg', {
        ref: svgRef,
        xmlns: 'http://www.w3.org/2000/svg',
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full block',
        role: clickable ? 'group' : 'img',
        'aria-label': `Choropleth map of ${area}${summary ? `. ${summary}` : ''}`
      }, [
        ...items,
        hoveredPath ? h('path', { d: hoveredPath, fill: 'none', class: 'stroke-accent pointer-events-none', 'stroke-width': 2 }) : null,
        ...labels,
        renderLegend()
      ]);
    });
  }
};

// Flow Map SVG Component
const FlowMapSVG = {
  props: ['data', 'colors', 'mapType', 'projectionType'],
  setup(props, { expose }) {
    const { svgRef, width, height, features, projection, paths, renderSurface } =
      useMapSurface(props, () => baseMapSource(props.mapType));

    expose({ getSvgElement: () => svgRef.value });

    // Project nodes to screen coordinates; nodes without valid coordinates, or
    // outside the projection (e.g. London on the US map), are left out.
    const nodes = computed(() => {
      const proj = projection.value;
      if (!proj || !props.data?.nodes) return [];
      const colors = props.colors?.length ? props.colors : ['#6366f1'];
      return props.data.nodes.flatMap((node, index) => {
        const lat = toNumber(node.lat);
        const lng = toNumber(node.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return [];
        const projected = projectCoordinates(proj, lng, lat);
        if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) return [];
        return [{ ...node, x: projected[0], y: projected[1], color: colors[index % colors.length], radius: 10 }];
      });
    });

    const links = computed(() => {
      if (!props.data?.links) return [];
      const colors = props.colors?.length ? props.colors : ['#888888'];
      const values = props.data.links.map((l) => Math.abs(toNumber(l.value))).filter(Number.isFinite);
      const maxValue = Math.max(0, ...values);

      return props.data.links.map((link, index) => {
        const sourceNode = nodes.value.find((n) => n.id === link.source);
        const targetNode = nodes.value.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode || sourceNode === targetNode) return null;
        const value = toNumber(link.value);

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;

        return {
          ...link,
          value,
          sourceLabel: sourceNode.label || sourceNode.id,
          targetLabel: targetNode.label || targetNode.id,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          distance: Math.sqrt(dx * dx + dy * dy),
          angle: Math.atan2(dy, dx),
          // 2px for the smallest flows up to 12px for the largest
          strokeWidth: maxValue > 0 && Number.isFinite(value) ? 2 + (Math.abs(value) / maxValue) * 10 : 2,
          color: colors[index % colors.length] || '#888888'
        };
      }).filter(Boolean);
    });

    return () => renderSurface(() => {
      const summary = links.value.map((l) => `${l.sourceLabel} to ${l.targetLabel}: ${formatValue(l.value)}`).join('; ');
      return h('svg', {
        ref: svgRef,
        xmlns: 'http://www.w3.org/2000/svg',
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full block',
        role: 'img',
        'aria-label': `Flow map of ${props.mapType === 'world' ? 'the world' : 'the United States'}${summary ? `. ${summary}` : ''}`
      }, [
        // Map background
        ...features.value.map((feature, index) => {
          const pathData = paths.value[index];
          if (!pathData) return null;
          return h('path', {
            key: `map-feature-${index}`,
            d: pathData,
            class: 'fill-chart-neutral stroke-line',
            'stroke-width': 0.5,
            opacity: 0.5
          });
        }),
        // Links (curved paths) - render behind nodes
        ...links.value.map((link, index) => {
          const midX = (link.sourceX + link.targetX) / 2;
          const midY = (link.sourceY + link.targetY) / 2;
          const controlOffset = link.distance * 0.3;
          const controlX = midX - Math.sin(link.angle) * controlOffset;
          const controlY = midY + Math.cos(link.angle) * controlOffset;
          const path = `M ${link.sourceX} ${link.sourceY} Q ${controlX} ${controlY} ${link.targetX} ${link.targetY}`;

          return h('path', {
            key: `link-${index}`,
            d: path,
            stroke: link.color,
            'stroke-width': link.strokeWidth,
            'stroke-linecap': 'round',
            fill: 'none',
            opacity: 0.6
          }, [h('title', `${link.sourceLabel} → ${link.targetLabel}: ${formatValue(link.value)}`)]);
        }),
        // Nodes
        ...nodes.value.map((node, index) =>
          h('g', { key: `node-${index}` }, [
            h('circle', {
              cx: node.x,
              cy: node.y,
              r: node.radius,
              fill: node.color,
              class: 'stroke-surface-raised',
              'stroke-width': 2
            }, [h('title', node.label || node.id)]),
            h('text', {
              x: node.x,
              y: node.y + node.radius + 12,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              ...labelAttrs
            }, node.label)
          ])
        )
      ]);
    });
  }
};

// Drill-down handlers
const handleDrillDown = (countryName) => {
  drillDownState.value = {
    level: 'country',
    selectedCountry: countryName,
    breadcrumbs: [...drillDownState.value.breadcrumbs, countryName]
  };
};

const handleDrillUp = () => {
  drillDownState.value = {
    level: 'world',
    selectedCountry: null,
    breadcrumbs: []
  };
};

// Reset drill-down when map type changes
const handleMapTypeChange = () => {
  drillDownState.value = {
    level: 'world',
    selectedCountry: null,
    breadcrumbs: []
  };
};

// ---- Export -------------------------------------------------------------

const mapViewRef = ref(null);
const mapWellRef = ref(null);
const exporting = ref(false);

// Presentation properties copied from the live SVG onto the export, so it
// looks the same outside the page (no Tailwind, no app fonts).
const EXPORT_STYLE_PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
  'stroke-linejoin', 'opacity', 'paint-order', 'font-family', 'font-size', 'font-weight',
  'text-anchor', 'dominant-baseline'
];

const exportFileName = (ext) => {
  const kind = selectedMapType.value === 'flowMap' ? 'flow-map' : 'choropleth-map';
  const area = mapConfig.value.mapType === 'world' && drillDownState.value.level === 'country' && drillDownState.value.selectedCountry
    ? drillDownState.value.selectedCountry
    : mapConfig.value.mapType;
  const slug = String(area).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${kind}-${slug || 'map'}.${ext}`;
};

const serializeMapSvg = () => {
  const svg = mapViewRef.value?.getSvgElement?.();
  if (!svg) throw new Error('The map has not finished loading yet.');

  const [, , vbWidth, vbHeight] = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const width = vbWidth || svg.clientWidth || 800;
  const height = vbHeight || svg.clientHeight || 500;

  const clone = svg.cloneNode(true);
  const sources = [svg, ...svg.querySelectorAll('*')];
  const targets = [clone, ...clone.querySelectorAll('*')];
  sources.forEach((source, i) => {
    const target = targets[i];
    const computedStyle = window.getComputedStyle(source);
    const declarations = EXPORT_STYLE_PROPS
      .map((prop) => [prop, computedStyle.getPropertyValue(prop)])
      .filter(([, value]) => value && value !== 'normal' && value !== 'auto')
      .map(([prop, value]) => `${prop}:${value}`);
    target.setAttribute('style', declarations.join(';'));
    target.removeAttribute('class');
    target.removeAttribute('tabindex');
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Same background as the preview well, in the current theme
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', mapWellRef.value ? window.getComputedStyle(mapWellRef.value).backgroundColor : 'none');
  clone.insertBefore(background, clone.firstChild);

  const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  return { markup, width, height };
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const exportSVG = () => {
  try {
    const { markup } = serializeMapSvg();
    downloadBlob(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), exportFileName('svg'));
    showNotice('Map exported as SVG.', 'success');
  } catch (err) {
    console.error('SVG export failed:', err);
    showNotice(err.message || 'Could not export the map as SVG.', 'error');
  }
};

const exportPNG = async () => {
  if (exporting.value) return;
  exporting.value = true;
  let url = null;
  try {
    const { markup, width, height } = serializeMapSvg();
    url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Could not render the map as an image.'));
      image.src = url;
    });

    const pixelRatio = 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the PNG.'))), 'image/png');
    });
    downloadBlob(blob, exportFileName('png'));
    showNotice('Map exported as PNG.', 'success');
  } catch (err) {
    console.error('PNG export failed:', err);
    showNotice(err.message || 'Could not export the map as PNG.', 'error');
  } finally {
    if (url) URL.revokeObjectURL(url);
    exporting.value = false;
  }
};
</script>

<style scoped>
/* The map needs a fixed working height (the workspace token); the SVG measures it */
.map-well {
  @apply relative w-full h-workspace overflow-hidden rounded-tile border border-line bg-surface-sunken;
}
</style>
