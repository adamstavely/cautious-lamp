<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Map maker"
      lead="Make choropleth, proportional symbol, dot and flow maps from your own data, for the world, a continent, any country's regions or US counties."
      spot="tools/map-maker"
      size="tool"
    />

    <PageSection title="Map type" description="Colour regions by value, size symbols by value, mark places, or show movement between places.">
      <UiChoiceCards v-model="mapType" :options="mapTypes" :columns="4" aria-label="Map type" />
    </PageSection>

    <PageSection title="Build" description="Choose an area, bring in your data, then style and export the map." divided>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 flex flex-col gap-6">
          <UiPanel title="Area">
            <div class="flex flex-col gap-4">
              <UiSelect :model-value="area" label="Geographic area" :options="areaSelectOptions" @update:model-value="setArea" />
              <UiSelect v-if="area === 'world' && !country" v-model="worldProjection" label="Projection" :options="projectionOptions" />
              <UiSelect
                v-if="countryOptions.length > 1"
                :model-value="country || ''"
                label="Country regions"
                hint="Show a country's states, provinces or other first-level regions."
                :options="countryOptions"
                @update:model-value="openCountry"
              />
              <UiCheckbox v-if="geo?.hasRemote" v-model="includeRemote" label="Fit remote regions" hint="Zoom out to include overseas regions." />
              <UiCheckbox v-if="mapType === 'choropleth'" v-model="showAllRegions" label="Show regions without data" />
            </div>
          </UiPanel>

          <UiPanel v-if="mapType === 'choropleth'" title="Colour">
            <div class="flex flex-col gap-4">
              <UiSegmented v-model="paletteKind" label="Scheme" :options="schemeOptions" :hint="schemeHint" />
              <UiSelect v-if="paletteKind === 'sequential'" v-model="sequentialHue" label="Colours" :options="SEQUENTIAL" />
              <template v-else>
                <UiSelect v-model="divergingRamp" label="Colours" :options="DIVERGING" />
                <UiInput v-model="midpointInput" type="number" step="any" label="Midpoint" hint="Shown in the neutral colour, e.g. 0 or the average." :error="midpointError" />
              </template>
              <UiSegmented v-model="method" label="Classes" :options="methodOptions" :hint="methodHint" />
              <UiSegmented v-if="method !== 'custom'" v-model="classCount" label="Number of classes" :options="classOptions" />
              <UiInput v-else v-model="breaksText" label="Class breaks" hint="2 to 6 values, separated by a comma and a space, e.g. 10, 25, 50" :error="breaksError" />
            </div>
          </UiPanel>

          <UiPanel title="Data" :description="dataDescription">
            <UiTabs v-model="dataTab" :tabs="dataTabs" label="Data entry">
              <template #import>
                <div class="flex flex-col gap-4">
                  <UiSegmented v-if="mapType === 'flowMap'" v-model="flowTable" label="Table" :options="flowTableOptions" />
                  <MapDataImport
                    :label="importLabel"
                    :hint="importHint"
                    :placeholder="importPlaceholder"
                    :model-text="importTexts[activeTable]"
                    @import="onImport"
                    @sample="loadSample"
                  />
                </div>
              </template>
              <template #edit>
                <MapRowEditor v-if="mapType === 'choropleth'" v-model="regionRows" :columns="editorColumns.choropleth" legend="Regions" item-label="Region" @update:model-value="touch" />
                <MapRowEditor v-else-if="mapType === 'bubble' || mapType === 'dot'" v-model="pointRows" :columns="editorColumns.points" legend="Places" item-label="Place" @update:model-value="touch" />
                <div v-else class="flex flex-col gap-6">
                  <MapRowEditor v-model="placeRows" :columns="editorColumns.places" legend="Places" item-label="Place" @update:model-value="touch" />
                  <MapRowEditor v-model="flowRows" :columns="editorColumns.flows" legend="Flows" item-label="Flow" @update:model-value="touch" />
                </div>
              </template>
            </UiTabs>
            <template #footer>
              <div class="flex flex-wrap gap-2">
                <UiButton v-for="table in tablesForType" :key="table" size="sm" icon="download" @click="downloadCSV(table)">
                  {{ tablesForType.length > 1 ? `${TABLE_NAMES[table]} CSV` : 'Download CSV' }}
                </UiButton>
              </div>
            </template>
          </UiPanel>

          <MapMatchReport v-if="report" :report="report" @use-suggestion="applySuggestion" />
        </div>

        <div class="lg:col-span-2">
          <UiPanel title="Preview">
            <template #actions>
              <UiButton v-if="country" ref="backButton" icon="arrow_back" size="sm" @click="backFromCountry">Back to {{ areaLabel }}</UiButton>
              <UiButton
                v-for="format in ['png', 'svg']"
                :key="format"
                icon="download"
                size="sm"
                :disabled="(format === 'png' && exporting) || !geo"
                :aria-label="`Export map as ${format.toUpperCase()}`"
                @click="format === 'png' ? exportPNG() : exportSVG()"
              >
                {{ format.toUpperCase() }}
              </UiButton>
            </template>

            <InlineNotice :notice="notice" class="mb-3" @dismiss="clearNotice" />

            <nav v-if="country" aria-label="Map level" class="mb-2 flex items-center gap-2 text-sm text-ink-secondary">
              <span>{{ areaLabel }}</span>
              <span class="material-symbols-outlined text-xs" aria-hidden="true">chevron_right</span>
              <span aria-current="location">{{ geo?.countryName || 'Loading…' }}</span>
            </nav>

            <UiCallout v-if="geo?.drillable && countryOptions.length > 1" class="mb-3">
              Select a country on the map, or under Country regions, to show its regions.
            </UiCallout>

            <UiTabs v-model="previewTab" :tabs="previewTabs" label="Preview as">
              <div v-show="previewTab === 'map'" ref="mapWellRef" class="map-well">
                <component :is="mapComponent" ref="mapViewRef" v-bind="mapProps" />
              </div>
              <MapDataTable v-if="previewTab === 'table'" :caption="tableCaption" :columns="tableView.columns" :rows="tableView.rows" />
            </UiTabs>
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useNotice } from '../composables/useNotice.js';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiChoiceCards, UiInput, UiPanel, UiSegmented, UiSelect, UiTabs } from '../components/ui';
import ChoroplethMap from '../components/maps/ChoroplethMap.js';
import BubbleMap from '../components/maps/BubbleMap.js';
import DotMap from '../components/maps/DotMap.js';
import FlowMap from '../components/maps/FlowMap.js';
import MapDataImport from '../components/maps/MapDataImport.vue';
import MapDataTable from '../components/maps/MapDataTable.vue';
import MapMatchReport from '../components/maps/MapMatchReport.vue';
import MapRowEditor from '../components/maps/MapRowEditor.vue';
import { useGeography } from '../components/maps/useGeography.js';
import { useMapPalette, SEQUENTIAL, DIVERGING, CATEGORY_SLOTS } from '../components/maps/useMapPalette.js';
import { formatCompact, formatValue, shapeFor } from '../components/maps/mapLegend.js';
import { project, onMap } from '../components/maps/mapMarks.js';
import { AREAS, areaOptions } from '../utils/mapAreas.js';
import { getFeatureCentroid } from '../utils/mapData.js';
import { createAreaProjection, createProjection } from '../utils/mapProjections.js';
import { importTable } from '../utils/mapImport.js';
import { resolveChoropleth, resolveFlows, resolvePoints } from '../utils/mapModel.js';
import { assignCategories, buildColorScale, parseBreaks, MIN_CLASSES, MAX_CLASSES } from '../utils/mapScales.js';
import { choroplethSample, flowSample, pointsSample } from '../utils/mapSamples.js';
import { parseNumber, toCSV } from '../utils/csv.js';

const { notice, showNotice, clearNotice } = useNotice();

const mapTypes = [
  { value: 'choropleth', label: 'Choropleth map', icon: 'map', description: 'Regions coloured by value' },
  { value: 'bubble', label: 'Proportional symbols', icon: 'bubble_chart', description: 'Circles sized by value, at places or region centres' },
  { value: 'dot', label: 'Dot map', icon: 'scatter_plot', description: 'Places marked by location, with optional categories' },
  { value: 'flowMap', label: 'Flow map', icon: 'route', description: 'Movement between places, sized by volume' },
];
const TYPE_NAMES = { choropleth: 'Choropleth map', bubble: 'Proportional symbol map', dot: 'Dot map', flowMap: 'Flow map' };

const projectionOptions = [
  { value: 'equalEarth', label: 'Equal Earth' },
  { value: 'mercator', label: 'Mercator' },
];
const schemeOptions = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'diverging', label: 'Diverging' },
];
const methodOptions = [
  { value: 'equal', label: 'Equal interval' },
  { value: 'quantile', label: 'Quantile' },
  { value: 'custom', label: 'Custom' },
];
const classOptions = Array.from({ length: MAX_CLASSES - MIN_CLASSES + 1 }, (_, i) => MIN_CLASSES + i);
const areaSelectOptions = areaOptions();

// ---- Area -----------------------------------------------------------------

const mapType = ref('choropleth');
const area = ref('us-states');
const country = ref(null);
const includeRemote = ref(false);
const worldProjection = ref('equalEarth');
const showAllRegions = ref(true);

const areaLabel = computed(() => AREAS[area.value]?.label || 'World');

const setArea = (value) => {
  area.value = value;
  country.value = null;
  includeRemote.value = false;
};

const openCountry = (id) => {
  country.value = id || null;
  includeRemote.value = false;
};

const closeCountry = () => openCountry(null);

const { geo, loading, error } = useGeography(() => ({ area: area.value, country: country.value, includeRemote: includeRemote.value }));

// Keyboard focus follows the drill-down: opening a country from the map moves
// to Back, and Back returns to that country on the redrawn map, so focus is
// never dropped on the page when the clicked or focused control disappears.
const backButton = ref(null);
const refocusCountry = ref(null);

const openFromMap = async (id) => {
  openCountry(id);
  await nextTick();
  backButton.value?.$el?.focus();
};

const backFromCountry = () => {
  refocusCountry.value = country.value;
  closeCountry();
};

watch(loading, async (isLoading) => {
  if (isLoading || !refocusCountry.value) return;
  const id = refocusCountry.value;
  refocusCountry.value = null;
  await nextTick();
  const region = [...(mapWellRef.value?.querySelectorAll('[data-country]') || [])].find((el) => el.dataset.country === String(id));
  region?.focus();
});
const palette = useMapPalette();

// Countries on the world or continent map that have regions to show; kept
// while a country is open, so the select can switch between them
const countryList = ref([]);
watch(geo, (g) => {
  if (!g || country.value) return;
  countryList.value = g.drillable
    ? g.features
      .map((f, i) => ({ value: g.drillable(f), label: g.index.labels[i] }))
      .filter((o) => o.value)
      .sort((a, b) => a.label.localeCompare(b.label))
    : [];
});
watch(area, () => {
  countryList.value = [];
});
const countryOptions = computed(() => (countryList.value.length ? [{ value: '', label: `None (all of ${areaLabel.value})` }, ...countryList.value] : []));

// ---- Data -----------------------------------------------------------------

const regionRows = ref([]);
const pointRows = ref([]);
const placeRows = ref([]);
const flowRows = ref([]);
const valueTitles = ref({ choropleth: '', points: '', flows: '' });
// Tables the user has imported, edited or loaded; empty untouched tables get the sample
const touched = ref(new Set());
const imports = ref({});
const importTexts = ref({ choropleth: '', points: '', places: '', flows: '' });

const TABLE_NAMES = { choropleth: 'Regions', points: 'Places', places: 'Places', flows: 'Flows' };
const TABLE_HEADERS = {
  choropleth: ['region', 'value'],
  points: ['name', 'lat', 'lng', 'value', 'category'],
  places: ['id', 'name', 'lat', 'lng'],
  flows: ['from', 'to', 'value'],
};
const tableRows = { choropleth: regionRows, points: pointRows, places: placeRows, flows: flowRows };

const flowTable = ref('flows');
const flowTableOptions = [
  { value: 'flows', label: 'Flows' },
  { value: 'places', label: 'Places' },
];
const activeTable = computed(() => {
  if (mapType.value === 'choropleth') return 'choropleth';
  if (mapType.value === 'flowMap') return flowTable.value;
  return 'points';
});
const tablesForType = computed(() => (mapType.value === 'flowMap' ? ['flows', 'places'] : [activeTable.value]));

const dataTab = ref('import');
const dataTabs = [
  { value: 'import', label: 'Import' },
  { value: 'edit', label: 'Edit rows' },
];

const IMPORT_HELP = {
  choropleth: {
    label: 'Paste a table of regions and values',
    hint: 'Columns: region, value. A region can be a name, a postal or ISO code, or a FIPS code (counties: "Cook, IL" or 17031).',
    placeholder: 'region,value\nCalifornia,39538223\nTexas,29145505',
  },
  points: {
    label: 'Paste a table of places',
    hint: 'Columns: name, lat, lng, value, category. Without lat and lng, the name is matched to a region and placed at its centre.',
    placeholder: 'name,lat,lng,value,category\nChicago,41.88,-87.63,2746000,Central',
  },
  places: {
    label: 'Paste a table of places',
    hint: 'Columns: id, name, lat, lng. Flows refer to places by id.',
    placeholder: 'id,name,lat,lng\nNYC,New York,40.71,-74.01',
  },
  flows: {
    label: 'Paste a table of flows',
    hint: 'Columns: from, to, value, using the ids in the places table.',
    placeholder: 'from,to,value\nNYC,LA,500',
  },
};
const importLabel = computed(() => IMPORT_HELP[activeTable.value].label);
const importHint = computed(() => `${IMPORT_HELP[activeTable.value].hint} Headers in any case; commas, tabs or semicolons.`);
const importPlaceholder = computed(() => IMPORT_HELP[activeTable.value].placeholder);
const dataDescription = computed(() => (mapType.value === 'flowMap' ? 'Flows between places, and the places with their coordinates.' : 'Import a CSV or TSV, or edit rows by hand.'));

const editorColumns = {
  choropleth: [
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
  ],
  points: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'lat', label: 'Lat', type: 'number' },
    { key: 'lng', label: 'Lng', type: 'number' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
  ],
  places: [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'lat', label: 'Lat', type: 'number' },
    { key: 'lng', label: 'Lng', type: 'number' },
  ],
  flows: [
    { key: 'from', label: 'From', type: 'text' },
    { key: 'to', label: 'To', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
  ],
};

const touch = () => {
  touched.value = new Set([...touched.value, ...tablesForType.value]);
};

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const onImport = (text) => {
  const table = activeTable.value;
  const result = importTable(text, table);
  importTexts.value = { ...importTexts.value, [table]: text };
  imports.value = { ...imports.value, [table]: { imported: result.rows.length, skipped: result.skipped, missing: result.missing } };
  if (result.missing.length) return;
  tableRows[table].value = result.rows;
  if (table !== 'places') valueTitles.value = { ...valueTitles.value, [table]: titleCase(result.columns.value || '') };
  touch();
  const skipped = result.skipped.length ? `, skipped ${result.skipped.length}` : '';
  showNotice(`Imported ${result.rows.length.toLocaleString()} ${result.rows.length === 1 ? 'row' : 'rows'}${skipped}.`, skipped ? 'warning' : 'success');
};

// `auto`: loaded for the map on screen, so it follows the area until the user takes over the data
const loadSample = (auto = false) => {
  const g = geo.value;
  if (!g) return;
  if (mapType.value === 'choropleth') {
    const { rows, title } = choroplethSample(g);
    regionRows.value = rows;
    valueTitles.value = { ...valueTitles.value, choropleth: title };
  } else if (mapType.value === 'flowMap') {
    const { places, flows, title } = flowSample(g, getFeatureCentroid);
    placeRows.value = places;
    flowRows.value = flows;
    valueTitles.value = { ...valueTitles.value, flows: title };
  } else {
    const { rows, title } = pointsSample(g);
    pointRows.value = rows;
    valueTitles.value = { ...valueTitles.value, points: title };
  }
  // Show the sample as CSV in the import box, so the format is plain to see
  const texts = { ...importTexts.value };
  const nextImports = { ...imports.value };
  for (const table of tablesForType.value) {
    texts[table] = toCSV(TABLE_HEADERS[table], tableRows[table].value);
    delete nextImports[table];
  }
  importTexts.value = texts;
  imports.value = nextImports;
  if (auto !== true) touch();
};

// Until the user imports, edits or picks the sample, show the sample for the map on screen
watch([geo, mapType], () => {
  if (!geo.value) return;
  if (tablesForType.value.every((t) => !touched.value.has(t))) loadSample(true);
}, { immediate: true });

const downloadCSV = (table) => {
  const csv = toCSV(TABLE_HEADERS[table], tableRows[table].value);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `map-${table}.csv`);
};

const applySuggestion = (item, suggestion) => {
  const rowsRef = mapType.value === 'choropleth' ? regionRows : pointRows;
  const key = mapType.value === 'choropleth' ? 'region' : 'name';
  const next = [...rowsRef.value];
  item.rowIndexes.forEach((i) => {
    next[i] = { ...next[i], [key]: suggestion };
  });
  rowsRef.value = next;
  touch();
};

// ---- Colour ---------------------------------------------------------------

const paletteKind = ref('sequential');
const sequentialHue = ref('blue');
const divergingRamp = ref('blue-red');
const midpointInput = ref(0);
const method = ref('quantile');
const classCount = ref(5);
const breaksText = ref('');

const schemeHint = computed(() => (paletteKind.value === 'diverging'
  ? 'Two colours either side of a midpoint, for values above and below it.'
  : 'One colour, light to dark, for amounts.'));

const methodHint = computed(() => ({
  equal: 'Classes of equal width between the lowest and highest values.',
  quantile: 'About the same number of regions in each class.',
  custom: 'Your own class boundaries.',
})[method.value]);

const parsedBreaks = computed(() => parseBreaks(breaksText.value));
const breaksError = computed(() => {
  if (method.value !== 'custom') return '';
  const { breaks, invalid } = parsedBreaks.value;
  if (invalid.length) return `Not a number: ${invalid.join(', ')}`;
  if (breaks.length < MIN_CLASSES - 1 || breaks.length > MAX_CLASSES - 1) return `Enter ${MIN_CLASSES - 1} to ${MAX_CLASSES - 1} breaks (${MIN_CLASSES} to ${MAX_CLASSES} classes).`;
  return '';
});

const midpoint = computed(() => {
  const n = parseNumber(typeof midpointInput.value === 'number' ? midpointInput.value : String(midpointInput.value ?? ''));
  return Number.isFinite(n) ? n : null;
});
const midpointError = computed(() => (midpoint.value === null ? 'Enter a number.' : ''));

// The sequential ramp's step 6 is the accent (illustration blue)
const accent = computed(() => palette.value?.sequential.blue[5] || 'currentColor');

// ---- Models: what each map draws, and what it leaves out ------------------

const choroplethModel = computed(() => (geo.value ? resolveChoropleth(regionRows.value, geo.value.index) : null));

const colorScale = computed(() => {
  const model = choroplethModel.value;
  if (!model || !palette.value) return null;
  const values = [...model.matched.values()].map((m) => m.row.value);
  const diverging = paletteKind.value === 'diverging';
  const ramp = diverging ? palette.value.diverging[divergingRamp.value] : palette.value.sequential[sequentialHue.value];
  // Custom breaks that don't parse fall back to equal intervals until they're fixed
  const useMethod = method.value === 'custom' && (breaksError.value || !parsedBreaks.value.breaks.length) ? 'equal' : method.value;
  return buildColorScale(values, {
    method: useMethod,
    classes: classCount.value,
    breaks: parsedBreaks.value.breaks,
    diverging,
    midpoint: midpoint.value ?? 0,
    ramp,
  });
});

const pointsModel = computed(() => (geo.value
  ? resolvePoints(pointRows.value, geo.value.index, geo.value.features, getFeatureCentroid, { needsValue: mapType.value === 'bubble' })
  : null));

const flowModel = computed(() => resolveFlows(placeRows.value, flowRows.value));

// A projection at a reference size, to tell which places fall outside the map
const REF_W = 960;
const REF_H = 600;
const referenceProjection = computed(() => {
  const g = geo.value;
  if (!g) return null;
  return g.projection.type === 'world' ? createProjection('world', REF_W, REF_H, worldProjection.value) : createAreaProjection(g.projection, REF_W, REF_H, g.fit);
});
const isOnMap = (p) => onMap(project(referenceProjection.value, p.lng, p.lat), REF_W, REF_H);

const categories = computed(() => assignCategories((pointsModel.value?.points || []).map((p) => p.category), CATEGORY_SLOTS));
const categoryColor = (slot) => (slot >= 0 ? palette.value?.categorical[slot] : palette.value?.neutral) || 'currentColor';
const hasCategories = computed(() => categories.value.categories.length > 0);

const drawnPoints = computed(() => (pointsModel.value?.points || []).filter(isOnMap).map((p) => {
  const slot = categories.value.slotOf(p.category);
  return {
    ...p,
    color: hasCategories.value ? categoryColor(slot) : accent.value,
    shape: hasCategories.value ? shapeFor(slot) : 'circle',
  };
}));

const categoryLegend = computed(() => {
  if (!hasCategories.value) return [];
  const items = categories.value.categories.map((c) => ({ name: c.name, color: categoryColor(c.slot), shape: shapeFor(c.slot) }));
  const blank = (pointsModel.value?.points || []).some((p) => !p.category);
  const other = categories.value.other;
  if (other || blank) {
    const name = other ? `Other (${other.names.length} ${other.names.length === 1 ? 'category' : 'categories'})` : 'No category';
    items.push({ name, color: categoryColor(-1), shape: shapeFor(-1) });
  }
  return items;
});

const drawnFlows = computed(() => {
  const { places, flows } = flowModel.value;
  const shown = places.filter(isOnMap);
  const ids = new Set(shown.map((p) => p.id));
  return { places: shown, flows: flows.filter((f) => ids.has(f.from) && ids.has(f.to)) };
});

// ---- Match report ---------------------------------------------------------

const report = computed(() => {
  const g = geo.value;
  if (!g) return null;
  const imported = tablesForType.value.map((t) => imports.value[t]).filter(Boolean);
  const base = {
    areaName: g.countryName || g.name,
    imported: imported.reduce((n, i) => n + i.imported, 0),
    skipped: imported.flatMap((i) => i.skipped),
    missing: imported.flatMap((i) => i.missing),
    expected: TABLE_HEADERS[activeTable.value].join(','),
    remote: g.remote,
  };
  if (mapType.value === 'choropleth') {
    const m = choroplethModel.value;
    return { ...base, total: regionRows.value.length, unmatched: m.unmatched, duplicates: m.duplicates, invalid: m.invalid.length };
  }
  if (mapType.value === 'flowMap') {
    const m = flowModel.value;
    const outside = m.places.filter((p) => !isOnMap(p)).map((p) => p.label);
    return { ...base, total: flowRows.value.length, unknown: m.unknown, invalid: m.invalid.length, outside };
  }
  const m = pointsModel.value;
  const outside = m.points.filter((p) => !isOnMap(p)).map((p) => p.label);
  return { ...base, total: pointRows.value.length, unmatched: m.unmatched, noValue: m.noValue, outside };
});

// ---- The map and its table ------------------------------------------------

const tableView = computed(() => {
  const g = geo.value;
  if (!g) return { columns: [], rows: [] };
  if (mapType.value === 'choropleth') {
    const scale = colorScale.value;
    const classOf = (value) => {
      if (!scale) return '';
      const c = scale.classes.find((k) => k.color === scale.colorFor(value));
      return c ? `${formatCompact(c.from)} – ${formatCompact(c.to)}` : '';
    };
    const rows = [...choroplethModel.value.matched]
      .map(([index, { row }]) => ({ region: g.index.labels[index], value: row.value, class: classOf(row.value) }))
      .sort((a, b) => b.value - a.value);
    return { columns: [{ key: 'region', label: 'Region' }, { key: 'value', label: valueTitles.value.choropleth || 'Value', numeric: true }, { key: 'class', label: 'Class' }], rows };
  }
  if (mapType.value === 'flowMap') {
    const label = new Map(drawnFlows.value.places.map((p) => [p.id, p.label]));
    const rows = drawnFlows.value.flows.map((f) => ({ from: label.get(f.from), to: label.get(f.to), value: f.value })).sort((a, b) => b.value - a.value);
    return { columns: [{ key: 'from', label: 'From' }, { key: 'to', label: 'To' }, { key: 'value', label: valueTitles.value.flows || 'Value', numeric: true }], rows };
  }
  const rows = drawnPoints.value.map((p) => ({ name: p.label, value: p.value, category: p.category, lat: Math.round(p.lat * 1e4) / 1e4, lng: Math.round(p.lng * 1e4) / 1e4 }));
  if (mapType.value === 'bubble') rows.sort((a, b) => b.value - a.value);
  const columns = [{ key: 'name', label: 'Place' }, { key: 'value', label: valueTitles.value.points || 'Value', numeric: true }];
  if (hasCategories.value) columns.push({ key: 'category', label: 'Category' });
  columns.push({ key: 'lat', label: 'Latitude', numeric: true }, { key: 'lng', label: 'Longitude', numeric: true });
  return { columns, rows };
});

const mapName = computed(() => `${TYPE_NAMES[mapType.value]} of ${geo.value?.countryName || geo.value?.name || areaLabel.value}`);
const tableCaption = computed(() => `${mapName.value}: data`);

// The svg's accessible name: what it is and the first few values; the Table view has them all
const SUMMARY_ITEMS = 12;
const mapLabel = computed(() => {
  const rows = tableView.value.rows;
  let items;
  if (mapType.value === 'choropleth') items = rows.map((r) => `${r.region}: ${formatValue(r.value)}`);
  else if (mapType.value === 'flowMap') items = rows.map((r) => `${r.from} to ${r.to}: ${formatValue(r.value)}`);
  else items = rows.map((r) => [r.name, Number.isFinite(r.value) ? formatValue(r.value) : null, r.category].filter(Boolean).join(': '));
  if (!items.length) return mapName.value;
  const shown = items.slice(0, SUMMARY_ITEMS).join('; ');
  const more = items.length > SUMMARY_ITEMS ? `; and ${items.length - SUMMARY_ITEMS} more, listed in the Table view` : '';
  return `${mapName.value}. ${shown}${more}`;
});

const mapComponent = computed(() => ({ choropleth: ChoroplethMap, bubble: BubbleMap, dot: DotMap, flowMap: FlowMap })[mapType.value]);

const mapProps = computed(() => {
  const common = {
    geo: geo.value,
    loading: loading.value,
    error: error.value,
    projectionType: worldProjection.value,
    onOpen: openFromMap,
    label: mapLabel.value,
  };
  if (mapType.value === 'choropleth') {
    return {
      ...common,
      matched: choroplethModel.value?.matched || new Map(),
      scale: colorScale.value,
      showAllRegions: showAllRegions.value,
      legendTitle: valueTitles.value.choropleth,
    };
  }
  if (mapType.value === 'flowMap') {
    return { ...common, places: drawnFlows.value.places, flows: drawnFlows.value.flows, color: accent.value, legendTitle: valueTitles.value.flows };
  }
  if (mapType.value === 'bubble') return { ...common, points: drawnPoints.value, categories: categoryLegend.value, legendTitle: valueTitles.value.points };
  return { ...common, points: drawnPoints.value, categories: categoryLegend.value };
});

const previewTab = ref('map');
const previewTabs = [
  { value: 'map', label: 'Map' },
  { value: 'table', label: 'Table' },
];

// ---- Export ---------------------------------------------------------------

const mapViewRef = ref(null);
const mapWellRef = ref(null);
const exporting = ref(false);

// Presentation properties copied from the live SVG onto the export, so it
// looks the same outside the page (no Tailwind, no app fonts).
const EXPORT_STYLE_PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
  'stroke-linejoin', 'stroke-dasharray', 'opacity', 'paint-order', 'font-family', 'font-size', 'font-weight',
  'text-anchor', 'dominant-baseline'
];

const exportFileName = (ext) => {
  const kind = { choropleth: 'choropleth-map', bubble: 'proportional-symbol-map', dot: 'dot-map', flowMap: 'flow-map' }[mapType.value];
  const place = geo.value?.countryName || areaLabel.value;
  const slug = String(place).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
  const defs = clone.querySelector('defs');
  clone.insertBefore(background, defs ? defs.nextSibling : clone.firstChild);

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
