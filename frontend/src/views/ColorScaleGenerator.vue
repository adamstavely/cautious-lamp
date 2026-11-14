<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Color scale generator"
      lead="Generate sequential, diverging and qualitative color scales, check them for contrast and color blindness, and export them."
      spot="tools/color-scale-generator"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <UiPanel title="Build the scale">
            <UiSegmented :model-value="scaleType" :options="scaleTypes" label="Scale type" @update:model-value="scaleType = $event; generateScale()" />

            <!-- Base colors -->
            <div class="flex flex-col gap-4 pt-5 border-t border-line">
              <h3 class="text-sm font-semibold text-ink-strong">Base colors</h3>

              <template v-if="scaleType === 'sequential' || scaleType === 'diverging'">
                <div
                  v-for="(color, index) in (scaleType === 'sequential' ? sequentialColors : divergingColors)"
                  :key="`${scaleType}-${index}`"
                  class="flex items-end gap-3"
                >
                  <button
                    type="button"
                    class="swatch-button"
                    :aria-label="`Pick color ${index + 1}`"
                    title="Pick color"
                    @click="openColorPicker(`${scaleType}-${index}`, $event)"
                  >
                    <UiSwatch :color="color" size="fill" :label="`Color ${index + 1}: ${color}`" />
                  </button>
                  <div class="flex-1 min-w-0">
                    <UiInput
                      :model-value="color"
                      :label="`Color ${index + 1}`"
                      :placeholder="placeholders.color"
                      mono
                      @update:model-value="setBaseColor(scaleType === 'sequential' ? sequentialColors : divergingColors, index, $event)"
                    />
                  </div>
                  <UiButton
                    v-if="(scaleType === 'sequential' ? sequentialColors : divergingColors).length > 1"
                    icon-only
                    icon="delete"
                    variant="ghost"
                    :label="`Remove color ${index + 1}`"
                    @click="scaleType === 'sequential' ? removeSequentialColor(index) : removeDivergingColor(index)"
                  />
                </div>
                <div>
                  <UiButton icon="add" @click="scaleType === 'sequential' ? addSequentialColor() : addDivergingColor()">Add color</UiButton>
                </div>
              </template>

              <UiTextarea
                v-if="scaleType === 'qualitative'"
                :model-value="qualitativeColorsInput"
                label="Base colors (comma-separated)"
                hint="Enter colors separated by commas"
                :rows="3"
                :placeholder="placeholders.qualitative"
                mono
                @update:model-value="setQualitativeInput"
              />
            </div>

            <!-- Settings -->
            <div class="flex flex-col gap-4 pt-5 border-t border-line">
              <h3 class="text-sm font-semibold text-ink-strong">Settings</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput :model-value="settings.steps" type="number" label="Number of steps" min="3" max="20" @update:model-value="setSetting('steps', $event)" />
                <UiSelect :model-value="settings.contrast" label="Contrast ratio" :options="contrastOptions" @update:model-value="setSetting('contrast', $event)" />
                <UiRange :model-value="settings.brightness" label="Brightness" unit="%" :min="0" :max="100" @update:model-value="setSetting('brightness', $event)" />
                <UiRange :model-value="settings.saturation" label="Saturation" unit="%" :min="0" :max="100" @update:model-value="setSetting('saturation', $event)" />
              </div>
              <div class="flex items-end gap-3">
                <button type="button" class="swatch-button" aria-label="Pick background color" title="Pick background color" @click="openColorPicker('background', $event)">
                  <UiSwatch :color="settings.backgroundColor" size="fill" :label="`Background color: ${settings.backgroundColor}`" />
                </button>
                <div class="flex-1 min-w-0">
                  <UiInput
                    :model-value="settings.backgroundColor"
                    label="Background color"
                    hint="Used for contrast checking"
                    :placeholder="placeholders.background"
                    mono
                    @update:model-value="setSetting('backgroundColor', $event)"
                  />
                </div>
              </div>
            </div>
          </UiPanel>

          <UiPanel title="Preview" description="Click a color to copy it.">
            <template #actions>
              <UiSegmented v-model="previewDarkMode" :options="previewModeOptions" aria-label="Preview background" />
            </template>

            <InlineNotice :notice="notice" @dismiss="clearNotice" />

            <div class="scale-backdrop">
              <button
                v-for="(color, index) in generatedScale"
                :key="index"
                type="button"
                class="scale-step"
                :title="`${color} - Click to copy`"
                :aria-label="`Copy step ${index + 1}: ${color}`"
                @click="copyColor(color)"
              >
                <UiSwatch :color="color" size="fill" />
                <span class="scale-step-label">{{ color }}</span>
              </button>
            </div>

            <ul class="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <li v-for="(color, index) in generatedScale" :key="index" class="color-row" @click="copyColor(color)">
                <UiSwatch :color="color" :label="color" />
                <div class="flex-1 min-w-0">
                  <p class="font-code text-sm text-ink">{{ color }}</p>
                  <p class="text-xs text-ink-muted">Step {{ index + 1 }}</p>
                </div>
                <UiButton icon-only size="sm" variant="ghost" icon="content_copy" :label="`Copy ${color}`" @click.stop="copyColor(color)" />
              </li>
            </ul>
          </UiPanel>

          <UiPanel v-if="generatedScale.length > 0" title="Colorblindness simulation" description="Simulated colors are ordered by hue and saturation for best comparison of similar colors.">
            <div v-for="sim in simulationTypes" :key="sim.value" class="flex flex-col gap-2">
              <h3 class="text-sm font-semibold text-ink-strong">{{ sim.label }}</h3>
              <svg
                class="w-full h-auto"
                :viewBox="`0 0 ${generatedScale.length * 10} 10`"
                role="img"
                :aria-label="`The scale as seen with ${sim.label.toLowerCase()}`"
              >
                <g v-for="(color, index) in generatedScale" :key="`${sim.value}-${index}`">
                  <rect :x="index * 10 + 0.4" y="0.4" width="9.2" height="9.2" rx="0.6" :fill="simulateColorBlindness(color, sim.value)">
                    <title>{{ color }} → {{ simulateColorBlindness(color, sim.value) }}</title>
                  </rect>
                  <rect :x="index * 10 + 1.2" y="6.6" width="2.4" height="2.4" rx="0.4" :fill="color" class="stroke-surface-raised" stroke-width="0.3" />
                </g>
              </svg>
            </div>
          </UiPanel>

          <UiPanel title="Visualizations" description="Sample data drawn with the scale.">
            <div class="grid md:grid-cols-2 gap-6">
              <figure class="flex flex-col gap-2">
                <figcaption class="text-sm font-medium text-ink">Heatmap</figcaption>
                <div class="chart-frame p-2">
                  <svg class="w-full h-auto" :viewBox="`0 0 10 ${heatmapRows}`" role="img" aria-label="Heatmap of sample values">
                    <rect
                      v-for="(cell, index) in heatmapCells"
                      :key="index"
                      :x="cell.x + 0.03"
                      :y="cell.y + 0.03"
                      width="0.94"
                      height="0.94"
                      :fill="getColorForValue(cell.value)"
                    >
                      <title>Value: {{ cell.value.toFixed(2) }}</title>
                    </rect>
                  </svg>
                </div>
              </figure>

              <figure class="flex flex-col gap-2">
                <figcaption class="text-sm font-medium text-ink">Scatter plot</figcaption>
                <div class="chart-frame relative h-52">
                  <svg width="100%" height="100%" class="absolute inset-0" role="img" aria-label="Scatter plot of sample values">
                    <circle
                      v-for="(point, index) in scatterData"
                      :key="index"
                      :cx="point.x + '%'"
                      :cy="point.y + '%'"
                      r="4"
                      :fill="getColorForValue(point.value)"
                      opacity="0.7"
                    >
                      <title>Value: {{ point.value.toFixed(2) }}</title>
                    </circle>
                  </svg>
                </div>
              </figure>

              <figure class="flex flex-col gap-2">
                <figcaption class="text-sm font-medium text-ink">Bar chart</figcaption>
                <div class="chart-frame flex flex-col h-52 p-4 gap-1">
                  <svg class="flex-1 w-full" viewBox="0 0 120 100" preserveAspectRatio="none" role="img" aria-label="Bar chart of sample values">
                    <rect
                      v-for="(value, index) in barChartData"
                      :key="index"
                      :x="index * 10 + 1"
                      :y="100 - Math.max(2, value * 100)"
                      width="8"
                      :height="Math.max(2, value * 100)"
                      :fill="getColorForValue(value)"
                    >
                      <title>Value: {{ value.toFixed(2) }}</title>
                    </rect>
                  </svg>
                  <div class="flex" aria-hidden="true">
                    <span v-for="(value, index) in barChartData" :key="index" class="flex-1 text-center text-xs text-ink-muted">{{ index + 1 }}</span>
                  </div>
                </div>
              </figure>

              <figure class="flex flex-col gap-2">
                <figcaption class="text-sm font-medium text-ink">Area chart</figcaption>
                <div class="chart-frame relative h-52">
                  <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Area chart of sample values">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop
                          v-for="(color, index) in generatedScale"
                          :key="index"
                          :offset="(index / Math.max(1, generatedScale.length - 1)) * 100 + '%'"
                          :stop-color="color"
                          stop-opacity="0.6"
                        />
                      </linearGradient>
                    </defs>
                    <polygon :points="areaChartPoints" fill="url(#areaGradient)" :stroke="generatedScale[Math.floor(generatedScale.length / 2)]" stroke-width="2" vector-effect="non-scaling-stroke" />
                  </svg>
                </div>
              </figure>
            </div>
          </UiPanel>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-6">
          <UiPanel title="Export">
            <div class="flex flex-col gap-2">
              <UiButton v-for="action in exportActions" :key="action.label" :variant="action.variant" icon="download" @click="action.run">{{ action.label }}</UiButton>
            </div>
          </UiPanel>

          <UiPanel title="Color analysis">
            <dl class="grid grid-cols-2 gap-3">
              <template v-if="generatedScale.length >= 3">
                <div class="stat-tile">
                  <dt class="stat-label">Start luminance</dt>
                  <dd class="stat-value">{{ getLuminance(generatedScale[0]).toFixed(2) }}</dd>
                </div>
                <div class="stat-tile">
                  <dt class="stat-label">Mid luminance</dt>
                  <dd class="stat-value">{{ getLuminance(generatedScale[Math.floor(generatedScale.length / 2)]).toFixed(2) }}</dd>
                </div>
                <div class="stat-tile">
                  <dt class="stat-label">End luminance</dt>
                  <dd class="stat-value">{{ getLuminance(generatedScale[generatedScale.length - 1]).toFixed(2) }}</dd>
                </div>
              </template>
              <div class="stat-tile">
                <dt class="stat-label">Contrast ratio</dt>
                <dd class="stat-value">
                  {{ generatedScale.length >= 2 ? getContrastRatio(generatedScale[0], generatedScale[generatedScale.length - 1]).toFixed(2) : '0.00' }}
                </dd>
              </div>
              <div class="stat-tile">
                <dt class="stat-label">Total colors</dt>
                <dd class="stat-value">{{ generatedScale.length }}</dd>
              </div>
              <div class="stat-tile">
                <dt class="stat-label">Avg saturation</dt>
                <dd class="stat-value">{{ generatedScale.length > 0 ? getAverageSaturation().toFixed(0) : '0' }}%</dd>
              </div>
            </dl>
          </UiPanel>

          <UiPanel v-if="comparisons.length" title="Accessibility contrast check" flush>
            <UiTable caption="Contrast between the ends of the scale and the background" compact>
              <thead>
                <tr>
                  <th scope="col">Compared colors</th>
                  <th scope="col">Status</th>
                  <th scope="col">Contrast</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisons" :key="row.label">
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="flex shrink-0">
                        <UiSwatch :color="row.a" size="sm" :label="row.a" />
                        <UiSwatch :color="row.b" size="sm" :label="row.b" />
                      </span>
                      <span>{{ row.label }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-xs text-ink-muted whitespace-nowrap">Delta E {{ getDeltaE(row.a, row.b).toFixed(2) }}</span>
                      <UiMeter :value="getDeltaE(row.a, row.b)" :max="100" :label="`${row.label}: color difference`" :value-text="`Delta E ${getDeltaE(row.a, row.b).toFixed(2)}`" />
                    </div>
                  </td>
                  <td>
                    <UiChip :tone="getContrastStatus(row.a, row.b) === 'Pass' ? 'success' : 'danger'">{{ getContrastStatus(row.a, row.b) }}</UiChip>
                  </td>
                  <td class="font-code whitespace-nowrap">{{ getContrastRatio(row.a, row.b).toFixed(2) }}:1</td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>

          <UiPanel title="Color space visualizations">
            <figure class="flex flex-col gap-2">
              <figcaption class="text-xs font-medium text-ink-secondary">Color wheel</figcaption>
              <div class="chart-frame relative h-52">
                <canvas ref="colorWheelCanvas" class="w-full h-full text-chart-neutral" role="img" aria-label="The scale's path on a hue and saturation wheel"></canvas>
              </div>
            </figure>

            <figure class="flex flex-col gap-2">
              <figcaption class="text-xs font-medium text-ink-secondary">RGB channels</figcaption>
              <div class="chart-frame relative h-52">
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Red, green and blue channel values across the scale">
                  <defs>
                    <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" class="stroke-line-faint" stroke-width="0.5" vector-effect="non-scaling-stroke" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#gridPattern)" />
                  <polyline
                    v-for="channel in rgbChannels"
                    :key="channel.name"
                    :points="channel.points"
                    :stroke="channel.color"
                    stroke-width="2"
                    fill="none"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </figure>

            <figure class="flex flex-col gap-2">
              <figcaption class="text-xs font-medium text-ink-secondary">3D color space</figcaption>
              <div class="chart-frame relative h-52">
                <canvas ref="color3dCanvas" class="w-full h-full text-chart-neutral" role="img" aria-label="The scale's path through RGB space"></canvas>
              </div>
            </figure>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import ColorPicker from '../components/ColorPicker.vue';
import chroma from 'chroma-js';
import {
  PageHero, PageSection, PageShell, UiButton, UiChip, UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiSwatch, UiTable, UiTextarea,
} from '../components/ui';
import UiMeter from '../components/ui/UiMeter.vue';

const { notice, showNotice, clearNotice } = useNotice();
const previewDarkMode = ref(false);
const scaleType = ref('sequential');
const generatedScale = ref([]);

const scaleTypes = [
  { label: 'Sequential', value: 'sequential' },
  { label: 'Diverging', value: 'diverging' },
  { label: 'Qualitative', value: 'qualitative' },
];

const contrastOptions = [
  { label: '1.0 (No contrast)', value: '1.0' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2.0' },
  { label: '3.0 (AA Large)', value: '3.0' },
  { label: '4.5 (AA)', value: '4.5' },
  { label: '7.0 (AAA)', value: '7.0' },
];

const sequentialColors = ref(['#3b82f6']);

const divergingColors = ref(['#3b82f6', '#ef4444']);

const qualitativeColorsInput = ref('#3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6');
const qualitativeColors = ref(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

const settings = ref({
  steps: 9,
  contrast: '4.5',
  brightness: 50,
  saturation: 100,
  backgroundColor: '#ffffff',
});

// Visualization data
const heatmapData = ref([]);
const scatterData = ref([]);
const barChartData = ref([]);
const areaChartData = ref([]);
const rgbChannels = ref([]);
const colorWheelCanvas = ref(null);
const color3dCanvas = ref(null);

const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const pickerTarget = ref(null);

// The preview strip sits on a fixed light or dark backdrop (test colours, not design colours)
const previewBackdrops = { light: '#ffffff', night: '#1e293b' };
const previewBackdrop = computed(() => (previewDarkMode.value ? previewBackdrops.night : previewBackdrops.light));
const previewModeOptions = [
  { value: false, label: 'Light', icon: 'light_mode' },
  { value: true, label: 'Dark', icon: 'dark_mode' },
];

const simulationTypes = [
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];

const placeholders = { color: '#000000', background: '#ffffff', qualitative: '#ff0000, #00ff00, #0000ff' };

const exportActions = [
  { label: 'Export CSS Variables', variant: 'primary', run: () => exportCSS() },
  { label: 'Export JSON', variant: 'secondary', run: () => exportJSON() },
  { label: 'Export Tableau XML', variant: 'secondary', run: () => exportTableau() },
];

const setSetting = (key, value) => {
  settings.value[key] = value;
  generateScale();
};

const setBaseColor = (list, index, value) => {
  list[index] = value;
  generateScale();
};

const setQualitativeInput = (value) => {
  qualitativeColorsInput.value = value;
  updateQualitativeColors();
};

// Rows of the accessibility table: which two colours are compared
const comparisons = computed(() => {
  const scale = generatedScale.value;
  if (scale.length < 2) return [];
  const first = scale[0];
  const last = scale[scale.length - 1];
  const bg = settings.value.backgroundColor;
  return [
    { label: 'Start color vs Background', a: first, b: bg },
    { label: 'End color vs Background', a: last, b: bg },
    { label: 'Start color vs End color', a: first, b: last },
  ];
});

// Heatmap cells laid out on a 10-column grid (SVG units)
const heatmapCells = computed(() => heatmapData.value.map((value, index) => ({ value, x: index % 10, y: Math.floor(index / 10) })));
const heatmapRows = computed(() => Math.max(1, Math.ceil(heatmapData.value.length / 10)));

// Canvas drawings can't use CSS tokens directly: read the neutral chart colour
// from the canvas's own (token) text colour, and leave the background clear
// so the container's surface shows through.
const canvasInk = (canvas) => getComputedStyle(canvas).color;

const addSequentialColor = () => {
  sequentialColors.value.push('#808080');
  generateScale();
};

const removeSequentialColor = (index) => {
  if (sequentialColors.value.length > 1) {
    sequentialColors.value.splice(index, 1);
    generateScale();
  }
};

const addDivergingColor = () => {
  divergingColors.value.push('#808080');
  generateScale();
};

const removeDivergingColor = (index) => {
  if (divergingColors.value.length > 1) {
    divergingColors.value.splice(index, 1);
    generateScale();
  }
};

const updateQualitativeColors = () => {
  qualitativeColors.value = qualitativeColorsInput.value
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0 && chroma.valid(c));
  generateScale();
};

// Number of steps from the input, clamped to the input's 3..20 range.
const stepCount = () => {
  const n = Math.round(Number(settings.value.steps));
  if (!Number.isFinite(n)) return 9;
  return Math.min(20, Math.max(3, n));
};

// Only colors chroma can parse (text inputs can hold half-typed values).
const validColors = (colors) => colors.filter((c) => typeof c === 'string' && chroma.valid(c));
const backgroundColor = () =>
  chroma.valid(settings.value.backgroundColor) ? settings.value.backgroundColor : '#ffffff';

const generateScale = () => {
  try {
    if (scaleType.value === 'sequential') {
      generateSequentialScale();
    } else if (scaleType.value === 'diverging') {
      generateDivergingScale();
    } else if (scaleType.value === 'qualitative') {
      generateQualitativeScale();
    }
  } catch (error) {
    console.error('Error generating scale:', error);
  }
};

const generateSequentialScale = () => {
  const colors = validColors(sequentialColors.value);
  if (colors.length === 0) return;

  const steps = stepCount();
  const contrastRatio = parseFloat(settings.value.contrast) || 1.0;
  const bgColor = backgroundColor();

  const chromaFallback = () =>
    colors.length === 1
      ? chroma.scale([colors[0], chroma(colors[0]).darken(2)]).mode('lch').colors(steps)
      : chroma.scale(colors).mode('lch').colors(steps);

  try {
    // Use contrast-based generation if contrast ratio > 1.0
    if (contrastRatio > 1.0) {
      let scale = [];

      if (colors.length === 1) {
        // Single color: generate scale from base to target contrast
        scale = generateContrastBasedScale(colors[0], bgColor, contrastRatio, steps, 'sequential');
      } else {
        // Multiple colors: split the steps - 1 intervals across the segments so
        // the scale has exactly `steps` colors, sharing each boundary color.
        const segments = colors.length - 1;
        const intervals = steps - 1;
        const base = Math.floor(intervals / segments);
        const remainder = intervals % segments;

        for (let i = 0; i < segments; i++) {
          const segmentIntervals = base + (i < remainder ? 1 : 0);
          const segmentScale = generateContrastBasedScaleBetweenColors(
            colors[i],
            colors[i + 1],
            bgColor,
            contrastRatio,
            segmentIntervals + 1
          );
          scale.push(...(i === 0 ? segmentScale : segmentScale.slice(1)));
        }
      }

      generatedScale.value = applyAdjustments(scale);
    } else {
      generatedScale.value = applyAdjustments(chromaFallback());
    }
  } catch (error) {
    console.error('Error generating sequential scale:', error);
    generatedScale.value = applyAdjustments(chromaFallback());
  }
};

const generateDivergingScale = () => {
  const colors = validColors(divergingColors.value);
  if (colors.length === 0) return;

  const steps = stepCount();
  const contrastRatio = parseFloat(settings.value.contrast) || 1.0;
  const bgColor = backgroundColor();

  const chromaFallback = () => {
    if (colors.length === 1) {
      return chroma.scale(['#ffffff', colors[0]]).mode('lch').colors(steps);
    }
    const stops = colors.length === 2 ? [colors[0], '#ffffff', colors[1]] : colors;
    return chroma.scale(stops).mode('lch').colors(steps);
  };

  try {
    // Use contrast-based generation if contrast ratio > 1.0
    if (contrastRatio > 1.0) {
      let scale = [];

      if (colors.length === 1) {
        // Single color: generate scale from background to target contrast
        scale = generateContrastBasedScale(colors[0], bgColor, contrastRatio, steps, 'diverging');
      } else {
        // Two arms that meet at the background: each runs from the target
        // contrast at its end color down to (no contrast with) the background.
        const leftSteps = Math.ceil(steps / 2);
        const rightSteps = steps - leftSteps + 1; // shares the midpoint

        const leftScale = generateContrastBasedScale(colors[0], bgColor, contrastRatio, leftSteps, 'diverging').reverse();
        const rightScale = generateContrastBasedScale(colors[colors.length - 1], bgColor, contrastRatio, rightSteps, 'diverging');

        // Combine scales (avoid duplicate at midpoint)
        scale = [...leftScale, ...rightScale.slice(1)];
      }

      generatedScale.value = applyAdjustments(scale);
    } else {
      generatedScale.value = applyAdjustments(chromaFallback());
    }
  } catch (error) {
    console.error('Error generating diverging scale:', error);
    generatedScale.value = applyAdjustments(chromaFallback());
  }
};

// Calculate relative luminance (WCAG formula)
const getLuminance = (color) => {
  try {
    const rgb = chroma(color).rgb();
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch {
    return 0;
  }
};

// Calculate contrast ratio between two colors
const calculateContrastRatio = (color1, color2) => {
  if (!color1 || !color2) return 1;
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Find a color that meets a target contrast ratio against a background
const findColorAtContrast = (baseColor, bgColor, targetRatio, isSequential = true) => {
  try {
    const bgLum = getLuminance(bgColor);
    const baseLum = getLuminance(baseColor);
    
    // Determine if we need lighter or darker color
    const needsLighter = bgLum < baseLum;
    
    // Calculate target luminance
    // contrast = (lighter + 0.05) / (darker + 0.05)
    // If bg is darker, we need: targetRatio = (colorLum + 0.05) / (bgLum + 0.05)
    // If bg is lighter, we need: targetRatio = (bgLum + 0.05) / (colorLum + 0.05)
    
    let targetLum;
    if (needsLighter) {
      // Background is darker, color needs to be lighter
      targetLum = targetRatio * (bgLum + 0.05) - 0.05;
    } else {
      // Background is lighter, color needs to be darker
      targetLum = (bgLum + 0.05) / targetRatio - 0.05;
    }
    
    // Clamp luminance between 0 and 1
    targetLum = Math.max(0, Math.min(1, targetLum));
    
    // Convert base color to HSL to preserve hue and saturation
    const baseHsl = chroma(baseColor).hsl();
    const hue = baseHsl[0] || 0;
    const saturation = baseHsl[1] || 0;
    
    // Binary search for the right lightness
    let minLightness = 0;
    let maxLightness = 1;
    let bestColor = baseColor;
    let bestRatio = calculateContrastRatio(baseColor, bgColor);
    
    // Try to find a color close to the target contrast
    for (let i = 0; i < 50; i++) {
      const lightness = (minLightness + maxLightness) / 2;
      const testColor = chroma.hsl(hue, saturation, lightness).hex();
      const testLum = getLuminance(testColor);
      const testRatio = calculateContrastRatio(testColor, bgColor);
      
      if (Math.abs(testRatio - targetRatio) < Math.abs(bestRatio - targetRatio)) {
        bestRatio = testRatio;
        bestColor = testColor;
      }
      
      if (needsLighter) {
        if (testLum < targetLum) {
          minLightness = lightness;
        } else {
          maxLightness = lightness;
        }
      } else {
        if (testLum > targetLum) {
          maxLightness = lightness;
        } else {
          minLightness = lightness;
        }
      }
      
      if (Math.abs(testRatio - targetRatio) < 0.01) {
        break;
      }
    }
    
    return bestColor;
  } catch (error) {
    console.error('Error finding color at contrast:', error);
    return baseColor;
  }
};

// Generate a contrast-based color scale
const generateContrastBasedScale = (baseColor, bgColor, targetRatio, steps, type = 'sequential') => {
  const scale = [];
  const ratios = [];
  
  if (steps <= 1) return [findColorAtContrast(baseColor, bgColor, targetRatio, true)];

  // Generate ratios from 1.0 (no contrast) to targetRatio
  for (let i = 0; i < steps; i++) {
    const ratio = 1.0 + (targetRatio - 1.0) * (i / (steps - 1));
    ratios.push(ratio);
  }
  
  // For diverging, we want to go from background to target contrast
  // For sequential, we go from base color to target contrast
  if (type === 'diverging') {
    // Start with background color (or very close to it)
    scale.push(bgColor);
    
    // Generate colors at increasing contrast ratios
    for (let i = 1; i < steps; i++) {
      const ratio = ratios[i];
      const color = findColorAtContrast(baseColor, bgColor, ratio, false);
      scale.push(color);
    }
  } else {
    // Sequential: start from base color, increase contrast
    for (let i = 0; i < steps; i++) {
      const ratio = ratios[i];
      const color = findColorAtContrast(baseColor, bgColor, ratio, true);
      scale.push(color);
    }
  }
  
  // Ensure smooth transitions by interpolating between generated colors
  if (scale.length > 2) {
    const smoothed = chroma.scale(scale).mode('lch').colors(steps);
    return smoothed;
  }
  
  return scale;
};

// Generate a contrast-based scale between two colors
const generateContrastBasedScaleBetweenColors = (startColor, endColor, bgColor, targetRatio, steps) => {
  const scale = [];
  
  // Generate intermediate colors between start and end
  for (let i = 0; i < steps; i++) {
    const t = steps > 1 ? i / (steps - 1) : 0; // 0 to 1
    
    // Interpolate between start and end colors
    const interpolatedColor = chroma.mix(startColor, endColor, t, 'lch').hex();
    
    // Calculate what contrast ratio this interpolated color has
    const currentRatio = calculateContrastRatio(interpolatedColor, bgColor);
    
    // If contrast is below target, adjust the color to meet contrast requirement
    if (currentRatio < targetRatio) {
      // Find a color that meets the contrast requirement while preserving hue/saturation
      const adjustedColor = findColorAtContrast(interpolatedColor, bgColor, targetRatio, true);
      scale.push(adjustedColor);
    } else {
      // Color already meets contrast requirement
      scale.push(interpolatedColor);
    }
  }
  
  return scale;
};

const applyAdjustments = (scale) => {
  const brightness = Number(settings.value.brightness);
  const saturation = Number(settings.value.saturation);
  return scale.map(color => {
    let c = chroma(color);
    if (Number.isFinite(brightness) && brightness !== 50) {
      c = c.brighten((brightness - 50) / 50);
    }
    // Saturation is a percentage of the color's own chroma: 0% is gray.
    if (Number.isFinite(saturation) && saturation !== 100) {
      const [l, ch, h] = c.lch();
      if (ch > 0.5 && Number.isFinite(h)) {
        c = chroma.lch(l, ch * Math.max(0, saturation) / 100, h);
      }
    }
    return c.hex();
  });
};

const generateQualitativeScale = () => {
  const colors = validColors(qualitativeColors.value);
  if (colors.length === 0) return;
  const steps = stepCount();

  // Generate intermediate colors between the provided colors. Each segment
  // stops short of the next color, so boundary colors are not repeated.
  const stepsPerColor = Math.ceil(steps / colors.length);
  const scale = [];
  
  for (let i = 0; i < colors.length; i++) {
    const currentColor = colors[i];
    const nextColor = colors[(i + 1) % colors.length];
    
    const colorScale = chroma.scale([currentColor, nextColor])
      .mode('lch')
      .colors(stepsPerColor + 1)
      .slice(0, stepsPerColor);
    
    scale.push(...colorScale);
  }
  
  // Trim to desired number of steps
  const trimmedScale = scale.slice(0, steps);
  generatedScale.value = applyAdjustments(trimmedScale);
};

const getContrastRatio = (color1, color2) => {
  return calculateContrastRatio(color1, color2);
};

// Colorblindness simulation functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const simulateColorBlindness = (hex, type) => {
  if (type === 'normal' || !type) return hex;
  
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Color blindness simulation matrices (based on Brettel et al. 1997)
  switch (type) {
    case 'protanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.567 + rgb.g * 0.433),
        Math.round(rgb.r * 0.558 + rgb.g * 0.442),
        Math.round(rgb.r * 0 + rgb.g * 0.242 + rgb.b * 0.758)
      );
    case 'deuteranopia':
      return rgbToHex(
        Math.round(rgb.r * 0.625 + rgb.g * 0.375),
        Math.round(rgb.r * 0.7 + rgb.g * 0.3),
        Math.round(rgb.r * 0 + rgb.g * 0.3 + rgb.b * 0.7)
      );
    case 'tritanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.95 + rgb.g * 0.05),
        Math.round(rgb.r * 0 + rgb.g * 0.433 + rgb.b * 0.567),
        Math.round(rgb.r * 0 + rgb.g * 0.475 + rgb.b * 0.525)
      );
    default:
      return hex;
  }
};

const getAverageSaturation = () => {
  if (generatedScale.value.length === 0) return 0;
  try {
    const totalSaturation = generatedScale.value.reduce((sum, color) => {
      if (!color) return sum;
      return sum + chroma(color).get('hsl.s') * 100;
    }, 0);
    return totalSaturation / generatedScale.value.length;
  } catch (e) {
    return 0;
  }
};

const getContrastStatus = (color1, color2) => {
  if (!color1 || !color2) return 'Fail';
  try {
    const ratio = getContrastRatio(color1, color2);
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    // We'll use 4.5:1 as the threshold for "Pass"
    return ratio >= 4.5 ? 'Pass' : 'Fail';
  } catch (e) {
    return 'Fail';
  }
};

const getDeltaE = (color1, color2) => {
  if (!color1 || !color2) return 0;
  try {
    // Convert colors to Lab color space for Delta E calculation
    const lab1 = chroma(color1).lab();
    const lab2 = chroma(color2).lab();
    
    // Calculate Delta E using CIE76 formula
    const deltaL = lab1[0] - lab2[0];
    const deltaA = lab1[1] - lab2[1];
    const deltaB = lab1[2] - lab2[2];
    
    const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    return deltaE;
  } catch (e) {
    return 0;
  }
};

const getColorForValue = (value) => {
  // Normalize value to 0-1 range
  const normalized = Math.max(0, Math.min(1, value));
  // Map to scale index (equal-width buckets)
  const length = generatedScale.value.length;
  const index = Math.min(length - 1, Math.floor(normalized * length));
  return generatedScale.value[index] || generatedScale.value[0];
};

const generateVisualizationData = () => {
  // Generate heatmap data (10x10 grid = 100 values)
  heatmapData.value = Array.from({ length: 100 }, () => Math.random());
  
  // Generate scatter plot data (50 points)
  scatterData.value = Array.from({ length: 50 }, () => ({
    x: Math.random() * 80 + 10, // 10-90%
    y: Math.random() * 80 + 10, // 10-90%
    value: Math.random(),
  }));
  
  // Generate bar chart data (12 bars)
  barChartData.value = Array.from({ length: 12 }, () => Math.random());
  
  // Generate area chart data (20 points)
  areaChartData.value = Array.from({ length: 20 }, (_, i) => ({
    x: (i / 19) * 100,
    y: Math.sin(i / 3) * 0.3 + 0.5 + Math.random() * 0.2,
  }));

  refreshScaleCharts();
};

// Charts that are derived from the scale itself (the sample data above stays
// the same when only the scale changes).
const refreshScaleCharts = () => {
  generateRGBChannels();
  nextTick(() => {
    drawColorWheel();
    draw3DColorSpace();
  });
};

const generateRGBChannels = () => {
  if (generatedScale.value.length === 0) return;
  
  const steps = generatedScale.value.length;
  const channelData = {
    r: [],
    g: [],
    b: [],
  };
  
  generatedScale.value.forEach((color, index) => {
    const rgb = chroma(color).rgb();
    const x = steps > 1 ? (index / (steps - 1)) * 100 : 50;
    channelData.r.push({ x, y: rgb[0] });
    channelData.g.push({ x, y: rgb[1] });
    channelData.b.push({ x, y: rgb[2] });
  });
  
  rgbChannels.value = [
    {
      name: 'Red',
      color: '#ef4444',
      points: channelData.r.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '), // Scale to 0-100
    },
    {
      name: 'Green',
      color: '#10b981',
      points: channelData.g.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '),
    },
    {
      name: 'Blue',
      color: '#3b82f6',
      points: channelData.b.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '),
    },
  ];
};

const drawColorWheel = () => {
  const canvas = colorWheelCanvas.value;
  if (!canvas || generatedScale.value.length === 0) return;
  
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
  
  // Clear canvas (the container's surface shows through)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw color wheel background (simplified hue circle)
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= radius) {
        // Same mapping as the path below: hue 0 at the top, increasing clockwise.
        const angle = Math.atan2(dy, dx);
        const hue = ((angle + Math.PI / 2) * 180 / Math.PI + 360) % 360;
        const saturation = Math.min(100, (dist / radius) * 100);
        const lightness = 50;
        
        const color = chroma.hsl(hue, saturation / 100, lightness / 100);
        const rgb = color.rgb();
        
        const idx = (y * canvas.width + x) * 4;
        imageData.data[idx] = rgb[0];
        imageData.data[idx + 1] = rgb[1];
        imageData.data[idx + 2] = rgb[2];
        imageData.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  
  // Draw color path on wheel
  if (generatedScale.value.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    generatedScale.value.forEach((color, index) => {
      const hsl = chroma(color).hsl();
      const hue = hsl[0] || 0;
      const saturation = hsl[1] || 0;
      const angle = (hue / 360) * 2 * Math.PI - Math.PI / 2;
      const dist = (saturation * radius);
      
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw start and end points
    const startColor = generatedScale.value[0];
    const endColor = generatedScale.value[generatedScale.value.length - 1];
    
    [startColor, endColor].forEach((color, idx) => {
      const hsl = chroma(color).hsl();
      const hue = hsl[0] || 0;
      const saturation = hsl[1] || 0;
      const angle = (hue / 360) * 2 * Math.PI - Math.PI / 2;
      const dist = (saturation * radius);
      
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
};

const draw3DColorSpace = () => {
  const canvas = color3dCanvas.value;
  if (!canvas || generatedScale.value.length === 0) return;
  
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas (the container's surface shows through)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw 3D axes
  const padding = 20;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  
  ctx.strokeStyle = canvasInk(canvas);
  ctx.lineWidth = 1;
  
  // X axis (bottom)
  ctx.beginPath();
  ctx.moveTo(padding, height + padding);
  ctx.lineTo(width + padding, height + padding);
  ctx.stroke();
  
  // Y axis (left)
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height + padding);
  ctx.stroke();
  
  // Z axis (diagonal)
  ctx.beginPath();
  ctx.moveTo(padding, height + padding);
  ctx.lineTo(padding + width * 0.3, padding + height * 0.3);
  ctx.stroke();
  
  // Draw color path in 3D space
  if (generatedScale.value.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    generatedScale.value.forEach((color, index) => {
      const rgb = chroma(color).rgb();
      const normalized = index / (generatedScale.value.length - 1);
      
      // Map RGB to 3D coordinates
      const x = padding + normalized * width;
      const y = padding + height - (rgb[1] / 255) * height;
      const z = (rgb[2] / 255) * width * 0.3;
      
      const x3d = x + z * 0.5;
      const y3d = y - z * 0.5;
      
      if (index === 0) {
        ctx.moveTo(x3d, y3d);
      } else {
        ctx.lineTo(x3d, y3d);
      }
    });
    
    // Create gradient for the path
    const gradient = ctx.createLinearGradient(padding, padding, width + padding, height + padding);
    generatedScale.value.forEach((color, index) => {
      gradient.addColorStop(index / (generatedScale.value.length - 1), color);
    });
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Draw points along the path
    generatedScale.value.forEach((color, index) => {
      const rgb = chroma(color).rgb();
      const normalized = index / (generatedScale.value.length - 1);
      
      const x = padding + normalized * width;
      const y = padding + height - (rgb[1] / 255) * height;
      const z = (rgb[2] / 255) * width * 0.3;
      
      const x3d = x + z * 0.5;
      const y3d = y - z * 0.5;
      
      ctx.beginPath();
      ctx.arc(x3d, y3d, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
};

const areaChartPoints = computed(() => {
  if (areaChartData.value.length === 0) return '';
  
  const width = 100;
  const height = 100;
  const padding = 10;
  
  const points = areaChartData.value.map((point, index) => {
    const x = padding + (point.x / 100) * (width - padding * 2);
    const y = height - padding - (point.y * (height - padding * 2));
    return `${x},${y}`;
  });
  
  // Add bottom corners for area fill
  const firstX = padding + (areaChartData.value[0].x / 100) * (width - padding * 2);
  const lastX = padding + (areaChartData.value[areaChartData.value.length - 1].x / 100) * (width - padding * 2);
  const bottomY = height - padding;
  
  return `${firstX},${bottomY} ${points.join(' ')} ${lastX},${bottomY}`;
});

const copyText = async (text, successMessage) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(successMessage, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard. Check your browser permissions.', 'error');
  }
};

const copyColor = (color) => copyText(color, `${color} copied to clipboard.`);

const exportCSS = () => {
  const css = generatedScale.value.map((color, index) => {
    return `  --color-scale-${index + 1}: ${color};`;
  }).join('\n');
  
  copyText(`:root {\n${css}\n}`, 'CSS variables copied to clipboard.');
};

const exportJSON = () => {
  const json = JSON.stringify({
    type: scaleType.value,
    colors: generatedScale.value,
    settings: settings.value,
  }, null, 2);
  
  copyText(json, 'JSON copied to clipboard.');
};

const exportTableau = () => {
  // Map scale type to Tableau palette type
  const tableauTypeMap = {
    sequential: 'ordered-sequential',
    diverging: 'ordered-diverging',
    qualitative: 'regular',
  };
  
  const tableauType = tableauTypeMap[scaleType.value] || 'regular';
  const paletteName = `Custom ${scaleType.value.charAt(0).toUpperCase() + scaleType.value.slice(1)} Palette`;
  
  // Generate Tableau XML
  let xmlContent = `<?xml version='1.0'?>\n`;
  xmlContent += `<workbook>\n`;
  xmlContent += `  <preferences>\n`;
  xmlContent += `    <color-palette name="${paletteName}" type="${tableauType}">\n`;
  
  generatedScale.value.forEach((color) => {
    // Ensure color is in hex format without alpha
    const hexColor = chroma(color).hex().toUpperCase();
    xmlContent += `      <color>${hexColor}</color>\n`;
  });
  
  xmlContent += `    </color-palette>\n`;
  xmlContent += `  </preferences>\n`;
  xmlContent += `</workbook>`;
  
  // Create and download file
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Preferences.tps';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
  
  showNotice('Preferences.tps downloaded. Place it in your "My Tableau Repository" folder and restart Tableau.', 'success');
};

const openColorPicker = (target, event) => {
  event.stopPropagation();
  pickerTarget.value = target;
  
  let color = '#000000';
  if (target.startsWith('sequential-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && sequentialColors.value[index]) {
      color = sequentialColors.value[index];
    }
  } else if (target.startsWith('diverging-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && divergingColors.value[index]) {
      color = divergingColors.value[index];
    }
  } else if (target.startsWith('qualitative-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && qualitativeColors.value[index]) {
      color = qualitativeColors.value[index];
    }
  } else if (target === 'background') {
    color = settings.value.backgroundColor;
  }
  
  pickerColor.value = color;
  
  const rect = (event.currentTarget || event.target).getBoundingClientRect();
  
  const pickerWidth = 280;
  const pickerHeight = 550;
  const padding = 16;
  
  // Use viewport coordinates for fixed positioning
  let left = rect.right + padding;
  let top = rect.top;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth) {
    left = rect.left - pickerWidth - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  // Check if there's enough space below the button
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // If there's not enough space below, try above
  if (spaceBelow < pickerHeight + padding && spaceAbove > spaceBelow) {
    top = rect.top - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  // If still too tall for viewport, center it vertically or position at top
  if (top + pickerHeight > window.innerHeight) {
    const centeredTop = Math.max(padding, (window.innerHeight - pickerHeight) / 2);
    top = Math.min(centeredTop, padding);
  }
  
  // Final safety check: ensure it's within bounds
  if (top < padding) {
    top = padding;
  }
  if (top + pickerHeight > window.innerHeight) {
    top = window.innerHeight - pickerHeight - padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (!pickerTarget.value) {
    showColorPicker.value = false;
    return;
  }
  if (pickerTarget.value.startsWith('sequential-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && sequentialColors.value[index] !== undefined) {
      sequentialColors.value[index] = color;
      generateScale();
    }
  } else if (pickerTarget.value.startsWith('diverging-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && divergingColors.value[index] !== undefined) {
      divergingColors.value[index] = color;
      generateScale();
    }
  } else if (pickerTarget.value.startsWith('qualitative-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && qualitativeColors.value[index] !== undefined) {
      qualitativeColors.value[index] = color;
      qualitativeColorsInput.value = qualitativeColors.value.join(', ');
      generateScale();
    }
  } else if (pickerTarget.value === 'background') {
    settings.value.backgroundColor = color;
    generateScale();
  }
  showColorPicker.value = false;
  pickerTarget.value = null;
};

watch(scaleType, () => {
  generateScale();
});

watch(generatedScale, () => {
  refreshScaleCharts();
}, { deep: true });

onMounted(() => {
  generateScale();
  generateVisualizationData();
});
</script>

<style scoped>
.swatch-button {
  @apply block w-11 h-11 shrink-0 p-0.5 rounded-control border border-line-control bg-surface-control transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.scale-backdrop {
  @apply flex gap-1 h-24 p-2 rounded-tile border border-line;
  background: v-bind(previewBackdrop);
}
.scale-step {
  @apply relative flex-1 min-w-0 transition-opacity hover:opacity-80 rounded-control;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.scale-step-label {
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full truncate px-1 py-0.5 rounded-control bg-surface-overlay font-code text-xs text-ink;
}
.color-row {
  @apply flex items-center gap-3 p-2 rounded-tile border border-line cursor-pointer transition-colors hover:bg-fill-hover;
}
.chart-frame {
  @apply rounded-tile border border-line bg-surface-sunken overflow-hidden;
}
.stat-tile {
  @apply flex flex-col-reverse gap-1 p-3 rounded-tile border border-line bg-surface-sunken text-center;
}
.stat-label {
  @apply text-xs text-ink-secondary;
}
.stat-value {
  @apply text-xl font-semibold text-ink-strong;
}
</style>
