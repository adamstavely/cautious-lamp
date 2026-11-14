<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Gradient generator"
      lead="Build CSS gradients with custom stops, layers, blend modes and animation, then copy the code or export a file."
      spot="tools/gradient-generator"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Preview -->
          <UiPanel title="Preview">
            <template #actions>
              <UiChip v-if="animationEnabled" tone="accent" icon="sync">Animating</UiChip>
            </template>

            <div class="gradient-preview" :class="{ 'animate-gradient': animationEnabled }" role="img" aria-label="Gradient preview"></div>

            <div class="grid grid-cols-3 gap-3">
              <div v-for="tile in backdropTiles" :key="tile.key" class="flex flex-col gap-1.5">
                <div class="backdrop" :class="`backdrop-${tile.key}`">
                  <div class="gradient-fill h-16 rounded-control"></div>
                </div>
                <p class="text-xs text-center text-ink-secondary">{{ tile.label }}</p>
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-5 border-t border-line">
              <h3 class="text-sm font-medium text-ink">Accessibility check</h3>
              <div class="flex flex-wrap items-end gap-4">
                <div class="flex items-end gap-2">
                  <button type="button" class="swatch-button" title="Pick text color" aria-label="Pick text color" @click="openAccessibilityColorPicker($event)">
                    <UiSwatch :color="accessibilityTextColor" size="fill" :label="`Text color: ${accessibilityTextColor}`" />
                  </button>
                  <div class="w-32">
                    <UiInput v-model="accessibilityTextColor" label="Text color" :placeholder="textColorPlaceholder" mono />
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 h-11" role="status">
                  <span class="text-sm font-medium text-ink">Ratio</span>
                  <UiChip :tone="contrastTone">{{ contrastRatio.toFixed(2) }}:1</UiChip>
                  <UiChip :tone="contrastRatio >= 4.5 ? 'success' : 'danger'" :icon="contrastRatio >= 4.5 ? 'check' : 'close'">AA</UiChip>
                  <UiChip :tone="contrastRatio >= 7 ? 'success' : 'danger'" :icon="contrastRatio >= 7 ? 'check' : 'close'">AAA</UiChip>
                </div>
                <div class="gradient-fill text-sample flex-1">Sample</div>
              </div>
            </div>
          </UiPanel>

          <!-- Color stops -->
          <UiPanel title="Color stops" :description="layers.length > 1 ? `Stops for layer ${currentLayerIndex + 1}` : ''">
            <template #actions>
              <UiButton size="sm" :loading="loadingPalettes" icon="palette" @click="fetchPalettes">
                {{ loadingPalettes ? 'Loading…' : 'Load from Palette Builder' }}
              </UiButton>
              <UiButton size="sm" variant="primary" icon="add" @click="addColorStop">Add stop</UiButton>
            </template>

            <InlineNotice :notice="paletteNotice" @dismiss="clearPaletteNotice" />

            <div v-if="availablePalettes.length > 0" class="flex flex-wrap items-end gap-3">
              <div class="flex-1 min-w-48">
                <UiSelect
                  v-model="selectedPaletteId"
                  label="Palette"
                  placeholder="Select a palette…"
                  :options="availablePalettes.map((palette) => ({ value: palette.id, label: palette.name }))"
                />
              </div>
              <UiButton variant="primary" :disabled="!selectedPaletteId" @click="importPaletteColors">Import colors</UiButton>
            </div>

            <ol class="flex flex-col gap-3">
              <li
                v-for="(stop, index) in colorStops"
                :key="stop.id"
                class="stop-row"
                :class="{ 'cursor-grabbing': isDragging }"
                @dragover.prevent="handleDragOver(index, $event)"
                @drop="handleDrop(index, $event)"
              >
                <fieldset class="flex flex-wrap items-end gap-3">
                  <legend class="sr-only">Stop {{ index + 1 }}</legend>
                  <span
                    class="material-symbols-outlined drag-handle"
                    draggable="true"
                    title="Drag to reorder"
                    aria-hidden="true"
                    @dragstart="handleDragStart(index, $event)"
                    @dragend="handleDragEnd"
                  >drag_indicator</span>

                  <button type="button" class="swatch-button" :aria-label="`Pick color for stop ${index + 1}`" title="Pick color" @click="openColorPicker(index, $event)">
                    <UiSwatch :color="stop.color" size="fill" :label="`Stop ${index + 1}: ${stop.color}`" />
                  </button>

                  <div class="w-28">
                    <UiInput :model-value="stop.color" label="Color" :placeholder="textColorPlaceholder" mono @update:model-value="setStopValue(stop, 'color', $event)" />
                  </div>

                  <div class="flex-1 min-w-56 grid grid-cols-content-aside items-end gap-x-3 gap-y-3">
                    <UiRange
                      :model-value="Number(stop.position) || 0"
                      label="Position"
                      unit="%"
                      :min="0"
                      :max="100"
                      :step="0.1"
                      @update:model-value="setStopValue(stop, 'position', $event)"
                    />
                    <div class="w-24">
                      <UiInput :model-value="stop.position" type="number" label="Position %" min="0" max="100" step="0.1" @update:model-value="setStopValue(stop, 'position', $event)" />
                    </div>
                    <UiRange
                      :model-value="Number(stop.opacity) || 0"
                      label="Opacity"
                      unit="%"
                      :min="0"
                      :max="100"
                      :step="1"
                      @update:model-value="setStopValue(stop, 'opacity', $event)"
                    />
                    <div class="w-24">
                      <UiInput :model-value="stop.opacity" type="number" label="Opacity %" min="0" max="100" step="1" @update:model-value="setStopValue(stop, 'opacity', $event)" />
                    </div>
                  </div>

                  <UiButton
                    v-if="colorStops.length > 2"
                    icon-only
                    icon="delete"
                    variant="ghost"
                    :label="`Remove stop ${index + 1}`"
                    @click="removeColorStop(index)"
                  />
                </fieldset>
              </li>
            </ol>
          </UiPanel>
        </div>

        <!-- Settings -->
        <UiPanel title="Settings" :description="layers.length > 1 ? `Editing layer ${currentLayerIndex + 1}` : ''">
          <template #actions>
            <UiButton size="sm" variant="primary" icon="download" @click="showExportModal = true">Export</UiButton>
          </template>

          <!-- Layers -->
          <div class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-sm font-medium text-ink">Layers</h3>
                <p class="text-xs text-ink-muted">Stack multiple gradients with blend modes</p>
              </div>
              <UiButton size="sm" icon="add" @click="addLayer">Add layer</UiButton>
            </div>

            <ul class="flex flex-col gap-2 max-h-64 overflow-y-auto">
              <li v-for="(layer, index) in layers" :key="layer.id" class="layer-row" :class="{ 'layer-row-on': currentLayerIndex === index }">
                <UiCheckbox v-model="layer.enabled"><span class="sr-only">Show layer {{ index + 1 }}</span></UiCheckbox>
                <UiSwatch :color="getLayerPreview(layer).background" :label="`Layer ${index + 1} preview`" />
                <button type="button" class="layer-select" :aria-current="currentLayerIndex === index ? 'true' : undefined" @click="currentLayerIndex = index">
                  <span class="block text-sm font-medium">Layer {{ index + 1 }}</span>
                  <span class="block text-xs text-ink-muted capitalize">
                    {{ layer.type }} · {{ layer.blendMode }}<template v-if="layer.colorStops.length > 0"> · {{ layer.colorStops.length }} stops</template>
                  </span>
                </button>
                <div class="flex items-center">
                  <UiButton v-if="index > 0" icon-only size="sm" variant="ghost" icon="arrow_upward" :label="`Move layer ${index + 1} up`" @click="moveLayer(index, index - 1)" />
                  <UiButton v-if="index < layers.length - 1" icon-only size="sm" variant="ghost" icon="arrow_downward" :label="`Move layer ${index + 1} down`" @click="moveLayer(index, index + 1)" />
                  <UiButton v-if="layers.length > 1" icon-only size="sm" variant="ghost" icon="delete" :label="`Delete layer ${index + 1}`" @click="removeLayer(index)" />
                </div>
              </li>
            </ul>

            <UiCallout v-if="layers.length > 1">
              Layers are stacked from bottom (Layer 1) to top. Click a layer to edit it. Use blend modes to combine layers.
            </UiCallout>
          </div>

          <!-- Current layer -->
          <div class="flex flex-col gap-4 pt-5 border-t border-line">
            <h3 class="text-sm font-semibold text-ink-strong">Current layer settings</h3>

            <UiSegmented v-model="gradientType" :options="gradientTypes" label="Gradient type" />

            <template v-if="gradientType === 'linear'">
              <div class="grid grid-cols-content-aside items-end gap-3">
                <UiRange :model-value="Number(linearAngle) || 0" label="Angle" unit="°" :min="0" :max="360" @update:model-value="linearAngle = $event" />
                <div class="w-24">
                  <UiInput v-model="linearAngle" type="number" label="Degrees" suffix="°" min="0" max="360" />
                </div>
              </div>
              <UiSegmented
                v-model="linearAngle"
                :options="linearDirections.map((direction) => ({ value: direction.angle, label: direction.label }))"
                label="Direction presets"
              />
            </template>

            <div v-if="gradientType === 'radial'" class="grid grid-cols-2 gap-4">
              <UiInput v-model="radialPosition.x" label="Position X" placeholder="50%" />
              <UiInput v-model="radialPosition.y" label="Position Y" placeholder="50%" />
              <UiSelect v-model="radialShape" label="Shape" :options="radialShapeOptions" />
              <UiSelect v-model="radialSize" label="Size" :options="radialSizeOptions" />
            </div>

            <div v-if="gradientType === 'conic'" class="grid grid-cols-2 gap-4">
              <UiInput v-model="conicPosition.x" label="Position X" placeholder="50%" />
              <UiInput v-model="conicPosition.y" label="Position Y" placeholder="50%" />
              <UiInput v-model="conicAngle" type="number" label="Angle" suffix="°" min="0" max="360" />
            </div>

            <UiSelect v-model="blendMode" label="Blend mode" hint="How this layer blends with layers below" :options="blendModeOptions" />
          </div>

          <!-- Animation -->
          <div class="flex flex-col gap-4 pt-5 border-t border-line">
            <UiSwitch v-model="animationEnabled" label="Animation" hint="Animates the current active layer" />
            <template v-if="animationEnabled">
              <UiCallout tone="success" role="status">Animation is active: watch the preview.</UiCallout>
              <UiSelect v-model="animationType" label="Animation type" :options="animationTypeOptions" />
              <UiRange v-model="animationDuration" label="Duration" unit="s" :min="0.5" :max="10" :step="0.5" />
              <UiSelect v-model="animationDirection" label="Direction" :options="animationDirectionOptions" />
            </template>
          </div>

        </UiPanel>
      </div>
    </PageSection>

    <UiDialog v-model:open="showExportModal" title="Export gradient">
      <InlineNotice :notice="exportNotice" @dismiss="clearExportNotice" />
      <UiSelect v-model="exportFormat" label="Code format" :options="exportFormatOptions" />
      <UiCodeBlock
        :code="formattedExportCode"
        :label="exportFormatOptions.find((option) => option.value === exportFormat)?.label || 'Code'"
        @copied="onExportCopied"
        @copy-failed="onExportCopyFailed"
      />
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-medium text-ink">File format</h3>
        <div class="grid grid-cols-2 gap-3">
          <UiButton v-for="file in fileExports" :key="file.label" :variant="file.variant" :icon="file.icon" @click="file.run">{{ file.label }}</UiButton>
        </div>
      </div>
    </UiDialog>

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
import { ref, computed, onMounted, watch } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiChip, UiCodeBlock, UiDialog,
  UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiSwatch, UiSwitch,
} from '../components/ui';

const { notice: paletteNotice, showNotice: showPaletteNotice, clearNotice: clearPaletteNotice } = useNotice();
const { notice: exportNotice, showNotice: showExportNotice, clearNotice: clearExportNotice } = useNotice();

const gradientType = ref('linear');
const linearAngle = ref(90);
const radialPosition = ref({ x: '50%', y: '50%' });
const radialShape = ref('ellipse');
const radialSize = ref('farthest-corner');
const conicPosition = ref({ x: '50%', y: '50%' });
const conicAngle = ref(0);
const blendMode = ref('normal');
const layers = ref([
  {
    id: 1,
    type: 'linear',
    linearAngle: 90,
    radialPosition: { x: '50%', y: '50%' },
    radialShape: 'ellipse',
    radialSize: 'farthest-corner',
    conicPosition: { x: '50%', y: '50%' },
    conicAngle: 0,
    colorStops: [
      { id: 1, color: '#3b82f6', position: 0, opacity: 100 },
      { id: 2, color: '#8b5cf6', position: 100, opacity: 100 },
    ],
    blendMode: 'normal',
    opacity: 100,
    enabled: true,
  },
]);
const currentLayerIndex = ref(0);
const animationEnabled = ref(false);
const animationDuration = ref(3);
const animationDirection = ref('alternate');
const animationIterationCount = ref('infinite');
const animationType = ref('position'); // 'position', 'color', 'angle'

const colorStops = ref([
  { id: 1, color: '#3b82f6', position: 0, opacity: 100 },
  { id: 2, color: '#8b5cf6', position: 100, opacity: 100 },
]);

const draggedIndex = ref(null);
const showColorPicker = ref(false);
const pickerColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const isDragging = ref(false);
const exportFormat = ref('css');
const showAccessibilityCheck = ref(false);
const accessibilityTextColor = ref('#000000');
const availablePalettes = ref([]);
const selectedPaletteId = ref('');
const loadingPalettes = ref(false);
const showExportModal = ref(false);

const gradientTypes = [
  { label: 'Linear', value: 'linear' },
  { label: 'Radial', value: 'radial' },
  { label: 'Conic', value: 'conic' },
];

const radialShapeOptions = [
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'circle', label: 'Circle' },
];

const radialSizeOptions = [
  { value: 'farthest-corner', label: 'Farthest Corner' },
  { value: 'farthest-side', label: 'Farthest Side' },
  { value: 'closest-corner', label: 'Closest Corner' },
  { value: 'closest-side', label: 'Closest Side' },
];

const blendModeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
];

const animationTypeOptions = [
  { value: 'position', label: 'Position (scrolls gradient)' },
  { value: 'angle', label: 'Angle (rotates gradient)' },
  { value: 'color', label: 'Color (cycles hues)' },
];

const animationDirectionOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'alternate-reverse', label: 'Alternate Reverse' },
];

const exportFormatOptions = [
  { value: 'css', label: 'CSS' },
  { value: 'css-vars', label: 'CSS Variables' },
  { value: 'tailwind', label: 'Tailwind Config' },
  { value: 'scss', label: 'SCSS Variables' },
  { value: 'json', label: 'JSON' },
  { value: 'react', label: 'React (styled-components)' },
  { value: 'vue', label: 'Vue (style binding)' },
];

const fileExports = [
  { label: 'Export as Image', icon: 'image', variant: 'primary', run: () => exportAsImage() },
  { label: 'Export as SVG', icon: 'code', variant: 'secondary', run: () => exportAsSVG() },
  { label: 'Export to Adobe', icon: 'file_download', variant: 'secondary', run: () => exportToAdobe() },
  { label: 'Export to Penpot', icon: 'file_download', variant: 'secondary', run: () => exportToPenpot() },
];

// Fixed backdrops to judge the gradient against (test colours, not design colours)
const backdrops = { white: '#ffffff', night: '#111827', gray: '#e5e7eb' };
const backdropTiles = [
  { key: 'white', label: 'White' },
  { key: 'night', label: 'Dark' },
  { key: 'gray', label: 'Gray' },
];
const textColorPlaceholder = '#000000';

const linearDirections = [
  { label: 'To Right', angle: 90, value: 'to right' },
  { label: 'To Bottom', angle: 180, value: 'to bottom' },
  { label: 'To Left', angle: 270, value: 'to left' },
  { label: 'To Top', angle: 0, value: 'to top' },
  { label: 'To Top Right', angle: 45, value: 'to top right' },
  { label: 'To Bottom Right', angle: 135, value: 'to bottom right' },
  { label: 'To Bottom Left', angle: 225, value: 'to bottom left' },
  { label: 'To Top Left', angle: 315, value: 'to top left' },
];

const updateGradient = () => {
  // Sort stops by position
  colorStops.value.sort((a, b) => a.position - b.position);
};

// Helper to convert hex + opacity to rgba
const hexToRgba = (hex, opacity) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${opacity / 100})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

// Sync current layer with main controls
const syncCurrentLayer = () => {
  if (layers.value[currentLayerIndex.value]) {
    const layer = layers.value[currentLayerIndex.value];
    gradientType.value = layer.type;
    linearAngle.value = layer.linearAngle;
    radialPosition.value = { ...layer.radialPosition };
    radialShape.value = layer.radialShape;
    radialSize.value = layer.radialSize;
    conicPosition.value = { ...layer.conicPosition };
    conicAngle.value = layer.conicAngle;
    colorStops.value = layer.colorStops.map(s => ({ ...s }));
    blendMode.value = layer.blendMode;
  }
};

// Update current layer from main controls
const updateCurrentLayer = () => {
  if (layers.value[currentLayerIndex.value]) {
    layers.value[currentLayerIndex.value] = {
      ...layers.value[currentLayerIndex.value],
      type: gradientType.value,
      linearAngle: linearAngle.value,
      radialPosition: { ...radialPosition.value },
      radialShape: radialShape.value,
      radialSize: radialSize.value,
      conicPosition: { ...conicPosition.value },
      conicAngle: conicAngle.value,
      colorStops: colorStops.value.map(s => ({ ...s })),
      blendMode: blendMode.value,
    };
  }
};

// Watch for changes to sync layers
// Deep, because the position inputs mutate radialPosition/conicPosition in place.
watch([gradientType, linearAngle, radialPosition, radialShape, radialSize, conicPosition, conicAngle, blendMode], () => {
  updateCurrentLayer();
}, { deep: true });

watch(colorStops, () => {
  updateCurrentLayer();
}, { deep: true });

watch(currentLayerIndex, () => {
  syncCurrentLayer();
});

const cssGradient = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  
  if (enabledLayers.length === 0) return '';
  
  const gradientStrings = enabledLayers.map(layer => {
    const stops = layer.colorStops
      .map((stop) => {
        const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
        return `${color} ${stop.position}%`;
      })
      .join(', ');
    
    let gradient = '';
    switch (layer.type) {
      case 'linear':
        gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
        break;
      case 'radial':
        gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
        break;
      case 'conic':
        gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
        break;
      default:
        gradient = `linear-gradient(90deg, ${stops})`;
    }
    
    return gradient;
  });
  
  return gradientStrings.join(', ');
});

const cssGradientWithBlend = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  
  if (enabledLayers.length === 0) return '';
  
  // For multiple layers with blend modes, we need to use background-image with multiple gradients
  const backgrounds = enabledLayers.map((layer) => {
    const stops = layer.colorStops
      .map((stop) => {
        const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
        return `${color} ${stop.position}%`;
      })
      .join(', ');
    
    let gradient = '';
    switch (layer.type) {
      case 'linear':
        gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
        break;
      case 'radial':
        gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
        break;
      case 'conic':
        gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
        break;
      default:
        gradient = `linear-gradient(90deg, ${stops})`;
    }
    
    return gradient;
  });
  
  return backgrounds.join(', ');
});

const cssBlendModes = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  return enabledLayers.map(layer => layer.blendMode || 'normal').join(', ');
});

const animatedGradient = computed(() => {
  if (!animationEnabled.value) return cssGradientWithBlend.value;
  
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer || currentLayer.colorStops.length < 2) return cssGradientWithBlend.value;
  
  // For color animation, use normal gradient - filter handles it
  if (animationType.value === 'color') {
    return cssGradientWithBlend.value;
  }
  
  // For position and angle animations, create a wider gradient
  if (animationType.value === 'position' || animationType.value === 'angle') {
    if (currentLayer.type === 'linear') {
      const angle = currentLayer.linearAngle;
      // Create stops that extend beyond 100% for seamless scrolling
      const firstStop = currentLayer.colorStops[0];
      const lastStop = currentLayer.colorStops[currentLayer.colorStops.length - 1];
      
      const stops = currentLayer.colorStops
        .map((stop) => {
          const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
          return `${color} ${stop.position * 0.5}%`;
        })
        .concat(
          currentLayer.colorStops.map((stop) => {
            const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
            return `${color} ${stop.position * 0.5 + 50}%`;
          })
        )
        .join(', ');
      
      return `linear-gradient(${angle}deg, ${stops})`;
    }
  }
  
  return cssGradientWithBlend.value;
});

// The main preview's CSS, passed to the stylesheet through v-bind()
const previewImage = computed(() => (animationEnabled.value ? animatedGradient.value : cssGradientWithBlend.value) || 'none');
const previewBlend = computed(() => (animationEnabled.value ? 'normal' : cssBlendModes.value || 'normal'));
const previewAnimation = computed(() => animationStyle.value.animation || 'none');
const previewSize = computed(() => animationStyle.value.backgroundSize || 'auto');
const previewRepeat = computed(() => animationStyle.value.backgroundRepeat || 'repeat');
const previewPosition = computed(() => animationStyle.value.backgroundPosition || '0% 0%');
const staticImage = computed(() => cssGradientWithBlend.value || 'none');
const staticBlend = computed(() => cssBlendModes.value || 'normal');

const contrastTone = computed(() => (contrastRatio.value >= 4.5 ? 'success' : contrastRatio.value >= 3 ? 'warning' : 'danger'));

const animationStyle = computed(() => {
  if (!animationEnabled.value) return {};
  
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer) return {};
  
  const style = {};
  
  if (animationType.value === 'color') {
    // Color animation uses filter
    style.animation = `gradient-color ${animationDuration.value}s ${animationDirection.value} ${animationIterationCount.value}`;
  } else if (animationType.value === 'position' || animationType.value === 'angle') {
    if (currentLayer.type === 'linear') {
      // Position and angle animations use background-position
      style.backgroundSize = '200% 200%';
      style.backgroundRepeat = 'no-repeat';
      style.animation = `gradient-${animationType.value} ${animationDuration.value}s ${animationDirection.value} ${animationIterationCount.value}`;
      style.backgroundPosition = '0% 50%'; // Initial position
    }
  }
  
  return style;
});

const addLayer = () => {
  const newLayer = {
    id: Date.now(),
    type: 'linear',
    linearAngle: 90,
    radialPosition: { x: '50%', y: '50%' },
    radialShape: 'ellipse',
    radialSize: 'farthest-corner',
    conicPosition: { x: '50%', y: '50%' },
    conicAngle: 0,
    colorStops: [
      { id: Date.now() + 1, color: '#6366f1', position: 0, opacity: 100 },
      { id: Date.now() + 2, color: '#8b5cf6', position: 100, opacity: 100 },
    ],
    blendMode: 'normal',
    opacity: 100,
    enabled: true,
  };
  layers.value.push(newLayer);
  currentLayerIndex.value = layers.value.length - 1;
  syncCurrentLayer();
};

const removeLayer = (index) => {
  if (layers.value.length > 1) {
    layers.value.splice(index, 1);
    // Keep pointing at the same layer when one before it is removed.
    if (index < currentLayerIndex.value) {
      currentLayerIndex.value -= 1;
    } else if (currentLayerIndex.value >= layers.value.length) {
      currentLayerIndex.value = layers.value.length - 1;
    }
    syncCurrentLayer();
  }
};

const moveLayer = (fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  
  const layer = layers.value.splice(fromIndex, 1)[0];
  layers.value.splice(toIndex, 0, layer);
  
  // Keep the selection on the same layer after the move.
  const current = currentLayerIndex.value;
  if (current === fromIndex) {
    currentLayerIndex.value = toIndex;
  } else if (fromIndex < current && current <= toIndex) {
    currentLayerIndex.value = current - 1;
  } else if (toIndex <= current && current < fromIndex) {
    currentLayerIndex.value = current + 1;
  }
};

// Get preview gradient for a layer
const getLayerPreview = (layer) => {
  if (!layer || !layer.colorStops || layer.colorStops.length === 0) {
    return { background: 'linear-gradient(90deg, #e5e7eb, #e5e7eb)' };
  }
  
  const stops = layer.colorStops
    .map((stop) => {
      const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
      return `${color} ${stop.position}%`;
    })
    .join(', ');
  
  let gradient = '';
  switch (layer.type) {
    case 'linear':
      gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
      break;
    case 'radial':
      gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
      break;
    case 'conic':
      gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
      break;
    default:
      gradient = `linear-gradient(90deg, ${stops})`;
  }
  
  return { background: gradient };
};

const setStopValue = (stop, key, value) => {
  stop[key] = value;
  updateGradient();
};

const addColorStop = () => {
  const newPosition = colorStops.value.length > 0
    ? Math.min(100, Math.max(0, colorStops.value[colorStops.value.length - 1].position + 10))
    : 50;
  
  // Generate a color between the last two stops if possible
  let newColor = '#6366f1';
  if (colorStops.value.length >= 2) {
    const last = colorStops.value[colorStops.value.length - 1];
    const secondLast = colorStops.value[colorStops.value.length - 2];
    newColor = interpolateColor(secondLast.color, last.color, 0.5);
  } else if (colorStops.value.length === 1) {
    newColor = colorStops.value[0].color;
  }

  colorStops.value.push({
    id: Date.now(),
    color: newColor,
    position: newPosition,
    opacity: 100,
  });
  updateGradient();
};

const removeColorStop = (index) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1);
    updateGradient();
  }
};

const formattedExportCode = computed(() => {
  const gradient = cssGradientWithBlend.value;
  const blendModes = cssBlendModes.value;
  const multiLayer = layers.value.filter((layer) => layer.enabled).length > 1;
  
  switch (exportFormat.value) {
    case 'css':
      if (multiLayer) {
        return `background-image: ${gradient};\nbackground-blend-mode: ${blendModes};`;
      }
      return `background: ${gradient};\nbackground-image: ${gradient};`;
      
    case 'css-vars':
      return `:root {\n  --gradient-primary: ${gradient};\n${multiLayer ? `  --gradient-blend-mode: ${blendModes};\n` : ''}}\n\n.my-element {\n  background-image: var(--gradient-primary);${multiLayer ? '\n  background-blend-mode: var(--gradient-blend-mode);' : ''}\n}`;
      
    case 'tailwind':
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-primary': '${gradient}',\n      },\n    },\n  },\n}`;
      
    case 'scss':
      return `$gradient-primary: ${gradient};\n\n.my-element {\n  background-image: $gradient-primary;\n}`;
      
    case 'json':
      return JSON.stringify({
        layers: layers.value,
        css: gradient,
        blendMode: multiLayer ? blendModes : undefined,
        animation: animationEnabled.value ? {
          type: animationType.value,
          duration: animationDuration.value,
          direction: animationDirection.value,
          iterationCount: animationIterationCount.value,
        } : undefined,
      }, null, 2);
      
    case 'react':
      return `import styled from 'styled-components';\n\nconst GradientComponent = styled.div\`\n  background-image: ${gradient};\n${multiLayer ? `  background-blend-mode: ${blendModes};\n` : ''}\`;`;
      
    case 'vue':
      // Vue component code - using style binding
      return `const gradient = '${gradient}';\n${multiLayer ? `const blendMode = '${blendModes}';\n` : ''}\n// Use in template:\n// <div :style="{ backgroundImage: gradient${multiLayer ? ', backgroundBlendMode: blendMode' : ''} }">Your content</div>`;
      
    default:
      return gradient;
  }
});

// The export code block copies; these report the result as before.
const onExportCopied = () => showExportNotice(`${exportFormat.value.toUpperCase()} code copied to clipboard.`, 'success');
const onExportCopyFailed = () => showExportNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');

// Trigger a download, revoking the object URL once the click has been handled.
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Parse a CSS position component ("50%", "120px", "center", "left"...) into pixels.
const parsePosition = (value, size, axis) => {
  const v = String(value ?? '').trim().toLowerCase();
  const keywords = axis === 'x'
    ? { left: 0, center: 50, right: 100 }
    : { top: 0, center: 50, bottom: 100 };
  if (v in keywords) return (keywords[v] / 100) * size;
  const num = parseFloat(v);
  if (!Number.isFinite(num)) return size / 2;
  return v.endsWith('px') ? num : (num / 100) * size;
};

// Start/end points of a CSS linear-gradient(<angle>deg) line inside a w x h box.
// CSS angles: 0deg points up, 90deg right; the line is long enough that the
// corners land exactly on 0% and 100%.
const linearGradientLine = (angleDeg, w, h) => {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  return { x1: cx - dx * half, y1: cy - dy * half, x2: cx + dx * half, y2: cy + dy * half };
};

// Radii of a CSS radial-gradient ending shape centred at (x, y) in a w x h box.
const radialRadii = (shape, size, x, y, w, h) => {
  const sideX = { closest: Math.min(x, w - x), farthest: Math.max(x, w - x) };
  const sideY = { closest: Math.min(y, h - y), farthest: Math.max(y, h - y) };
  const which = size.startsWith('closest') ? 'closest' : 'farthest';
  if (shape === 'circle') {
    if (size.endsWith('side')) {
      const r = which === 'closest'
        ? Math.min(sideX.closest, sideY.closest)
        : Math.max(sideX.farthest, sideY.farthest);
      return { rx: r, ry: r };
    }
    const r = Math.hypot(sideX[which], sideY[which]);
    return { rx: r, ry: r };
  }
  // Ellipse: the "-side" ellipse touches the sides; the "-corner" one keeps that
  // aspect ratio and passes through the corner (a factor of sqrt(2)).
  const factor = size.endsWith('corner') ? Math.SQRT2 : 1;
  return { rx: sideX[which] * factor, ry: sideY[which] * factor };
};

const stopColor = (stop) => hexToRgba(stop.color, stop.opacity ?? 100);
const sortedStops = (layer) => [...layer.colorStops].sort((a, b) => a.position - b.position);
const clampOffset = (position) => Math.min(1, Math.max(0, (Number(position) || 0) / 100));

// Canvas composite operations share their names with CSS blend modes.
const canvasBlendMode = (mode) => (!mode || mode === 'normal' ? 'source-over' : mode);

const exportAsImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    showExportNotice('Your browser could not create the image.', 'error');
    return;
  }
  const w = canvas.width;
  const h = canvas.height;

  // CSS paints the first background layer on top, so draw from the last one up.
  const enabled = layers.value.filter((layer) => layer.enabled).reverse();
  if (enabled.length === 0) {
    showExportNotice('Enable at least one layer to export.', 'warning');
    return;
  }

  enabled.forEach((layer, i) => {
    // Canvas gradients are resolved in the coordinate space active at fill time.
    ctx.save();
    ctx.globalCompositeOperation = i === 0 ? 'source-over' : canvasBlendMode(layer.blendMode);
    let gradient;
    let fill = () => ctx.fillRect(0, 0, w, h);
    if (layer.type === 'radial') {
      const x = parsePosition(layer.radialPosition.x, w, 'x');
      const y = parsePosition(layer.radialPosition.y, h, 'y');
      const { rx, ry } = radialRadii(layer.radialShape, layer.radialSize, x, y, w, h);
      const r = Math.max(rx, 1);
      const sy = Math.max(ry, 1) / r;
      // A circle gradient at the origin, squashed vertically into the ellipse.
      ctx.translate(x, y);
      ctx.scale(1, sy);
      gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      fill = () => ctx.fillRect(-x, -y / sy, w, h / sy);
    } else if (layer.type === 'conic' && typeof ctx.createConicGradient === 'function') {
      const x = parsePosition(layer.conicPosition.x, w, 'x');
      const y = parsePosition(layer.conicPosition.y, h, 'y');
      // CSS conic 0deg is "up"; canvas 0 rad is "right".
      gradient = ctx.createConicGradient(((layer.conicAngle - 90) * Math.PI) / 180, x, y);
    } else {
      const angle = layer.type === 'linear' ? layer.linearAngle : 90;
      const { x1, y1, x2, y2 } = linearGradientLine(angle, w, h);
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    sortedStops(layer).forEach((stop) => {
      gradient.addColorStop(clampOffset(stop.position), stopColor(stop));
    });

    ctx.fillStyle = gradient;
    fill();
    ctx.restore();
  });

  canvas.toBlob((blob) => {
    if (!blob) {
      showExportNotice('Could not create the PNG.', 'error');
      return;
    }
    downloadBlob(blob, 'gradient.png');
  }, 'image/png');
};

const exportAsSVG = () => {
  // Build SVG using DOM methods so every attribute value is escaped.
  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 800;
  const h = 600;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const defs = document.createElementNS(svgNS, 'defs');
  svg.appendChild(defs);

  const enabled = layers.value.filter((layer) => layer.enabled).reverse();
  if (enabled.length === 0) {
    showExportNotice('Enable at least one layer to export.', 'warning');
    return;
  }
  let approximated = false;

  enabled.forEach((layer, i) => {
    const id = `grad-${i}`;
    let gradient;
    if (layer.type === 'radial') {
      const x = parsePosition(layer.radialPosition.x, w, 'x');
      const y = parsePosition(layer.radialPosition.y, h, 'y');
      const { rx, ry } = radialRadii(layer.radialShape, layer.radialSize, x, y, w, h);
      const r = Math.max(rx, 1);
      gradient = document.createElementNS(svgNS, 'radialGradient');
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('cx', '0');
      gradient.setAttribute('cy', '0');
      gradient.setAttribute('r', String(r));
      gradient.setAttribute('gradientTransform', `translate(${x} ${y}) scale(1 ${Math.max(ry, 1) / r})`);
    } else {
      // SVG has no conic gradient; a conic layer is approximated as linear.
      if (layer.type === 'conic') approximated = true;
      const angle = layer.type === 'linear' ? layer.linearAngle : (layer.conicAngle ?? 0) + 90;
      const { x1, y1, x2, y2 } = linearGradientLine(angle, w, h);
      gradient = document.createElementNS(svgNS, 'linearGradient');
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('x1', String(x1));
      gradient.setAttribute('y1', String(y1));
      gradient.setAttribute('x2', String(x2));
      gradient.setAttribute('y2', String(y2));
    }
    gradient.setAttribute('id', id);

    sortedStops(layer).forEach((stop) => {
      const stopEl = document.createElementNS(svgNS, 'stop');
      stopEl.setAttribute('offset', String(clampOffset(stop.position)));
      stopEl.setAttribute('stop-color', stop.color);
      if (stop.opacity !== 100) {
        stopEl.setAttribute('stop-opacity', String((stop.opacity ?? 100) / 100));
      }
      gradient.appendChild(stopEl);
    });
    defs.appendChild(gradient);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', String(h));
    rect.setAttribute('fill', `url(#${id})`);
    if (i > 0 && layer.blendMode && layer.blendMode !== 'normal') {
      rect.setAttribute('style', `mix-blend-mode: ${layer.blendMode}`);
    }
    svg.appendChild(rect);
  });

  const svgString = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), 'gradient.svg');
  if (approximated) {
    showExportNotice('SVG has no conic gradients, so conic layers were exported as linear.', 'warning');
  }
};

// Color interpolation helper
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const interpolateColor = (color1, color2, factor) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  return rgbToHex(r, g, b);
};

// Calculate contrast ratio for accessibility
const calculateLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Sample color at a specific position in the gradient
const sampleGradientColor = (position) => {
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer || !currentLayer.colorStops || currentLayer.colorStops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  
  const layerStops = currentLayer.colorStops;
  if (layerStops.length === 1) return hexToRgb(layerStops[0].color);
  
  // Find the two stops that bracket this position
  const sortedStops = [...layerStops].sort((a, b) => a.position - b.position);
  
  if (position <= sortedStops[0].position) {
    return hexToRgb(sortedStops[0].color);
  }
  if (position >= sortedStops[sortedStops.length - 1].position) {
    return hexToRgb(sortedStops[sortedStops.length - 1].color);
  }
  
  // Find the two stops that bracket this position
  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
      const stop1 = sortedStops[i];
      const stop2 = sortedStops[i + 1];
      const range = stop2.position - stop1.position;
      const factor = range > 0 ? (position - stop1.position) / range : 0;
      
      const rgb1 = hexToRgb(stop1.color);
      const rgb2 = hexToRgb(stop2.color);
      
      // Interpolate between the two colors
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
      
      return { r, g, b };
    }
  }
  
  return hexToRgb(sortedStops[0].color);
};

const contrastRatio = computed(() => {
  const textRgb = hexToRgb(accessibilityTextColor.value);
  const textLuminance = calculateLuminance(textRgb);
  
  // Sample multiple points across the gradient (at 0%, 25%, 50%, 75%, 100%)
  const samplePositions = [0, 25, 50, 75, 100];
  const sampleLuminances = samplePositions.map(pos => {
    const gradientRgb = sampleGradientColor(pos);
    return calculateLuminance(gradientRgb);
  });
  
  // Calculate average luminance
  const avgGradientLuminance = sampleLuminances.reduce((sum, lum) => sum + lum, 0) / sampleLuminances.length;
  
  // Use the worst case contrast ratio for accessibility
  const contrastRatios = sampleLuminances.map(lum => {
    const lighter = Math.max(textLuminance, lum);
    const darker = Math.min(textLuminance, lum);
    return (lighter + 0.05) / (darker + 0.05);
  });
  
  // Return the minimum contrast ratio (worst case)
  return Math.min(...contrastRatios);
});

// Turn an API error into a message for the palette panel.
const paletteErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (status === 404) return 'That palette no longer exists.';
  if (status === 503) return 'Palette storage is unavailable right now. Try again in a moment.';
  if (status === 401 || status === 403) return 'You are not authorised to load palettes. Check your API key.';
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  return error.response.data?.message || fallback;
};

// Fetch palettes from backend (first page; the API caps pageSize at 200)
const fetchPalettes = async () => {
  loadingPalettes.value = true;
  try {
    const response = await apiClient.get('/api/palettes', { params: { page: 1, pageSize: 200 } });
    const data = response.data;
    availablePalettes.value = Array.isArray(data) ? data : (data?.items ?? []);
    if (availablePalettes.value.length === 0) {
      showPaletteNotice('No saved palettes yet. Save one in Palette Builder first.', 'info');
    } else {
      clearPaletteNotice();
    }
  } catch (error) {
    console.error('Error fetching palettes:', error);
    showPaletteNotice(paletteErrorMessage(error, 'Error loading palettes.'), 'error');
  } finally {
    loadingPalettes.value = false;
  }
};

// Import colors from selected palette
const importPaletteColors = async () => {
  if (!selectedPaletteId.value) return;

  try {
    const response = await apiClient.get(`/api/palettes/${encodeURIComponent(selectedPaletteId.value)}`);
    const palette = response.data || {};
    const colors = (palette.colors || [])
      .map((c) => (typeof c === 'string' ? c : c?.hex))
      .filter((c) => typeof c === 'string' && /^#?[0-9a-f]{6}$/i.test(c))
      .map((c) => (c.startsWith('#') ? c : `#${c}`));

    if (colors.length === 0) {
      showPaletteNotice('That palette has no colors to import.', 'warning');
      return;
    }

    // A single color still needs two stops to form a gradient.
    const source = colors.length === 1 ? [colors[0], colors[0]] : colors;
    const step = 100 / (source.length - 1);
    const now = Date.now();
    colorStops.value = source.map((color, index) => ({
      id: now + index,
      color,
      position: Math.round(index * step * 100) / 100,
      opacity: 100,
    }));

    updateGradient();
    showPaletteNotice(`Imported ${colors.length} colors from ${palette.name || 'the palette'}.`, 'success');
  } catch (error) {
    console.error('Error importing palette:', error);
    showPaletteNotice(paletteErrorMessage(error, 'Error importing palette colors.'), 'error');
    if (error?.response?.status === 404) {
      availablePalettes.value = availablePalettes.value.filter((p) => p.id !== selectedPaletteId.value);
      selectedPaletteId.value = '';
    }
  }
};

// Export to Adobe XD (CSS format compatible with Adobe XD)
const exportToAdobe = () => {
  const gradientData = {
    css: cssGradient.value,
    type: gradientType.value,
    stops: colorStops.value.map((stop) => ({
      color: stop.color,
      position: stop.position,
      opacity: stop.opacity / 100,
    })),
    settings: {
      angle: gradientType.value === 'linear' ? linearAngle.value : undefined,
      position: gradientType.value === 'radial' ? radialPosition.value : undefined,
      shape: gradientType.value === 'radial' ? radialShape.value : undefined,
      size: gradientType.value === 'radial' ? radialSize.value : undefined,
    },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'gradient-adobe.json');
};

// Export to Penpot (Penpot JSON format)
const exportToPenpot = () => {
  const gradientData = {
    type: 'gradient',
    gradientType: gradientType.value === 'linear' ? 'linear' : gradientType.value === 'radial' ? 'radial' : 'linear',
    stops: colorStops.value.map((stop) => ({
      offset: stop.position / 100,
      color: {
        r: hexToRgb(stop.color).r / 255,
        g: hexToRgb(stop.color).g / 255,
        b: hexToRgb(stop.color).b / 255,
        a: stop.opacity / 100,
      },
    })),
    transform: gradientType.value === 'linear' 
      ? {
          sx: Math.cos(linearAngle.value * Math.PI / 180),
          sy: Math.sin(linearAngle.value * Math.PI / 180),
          tx: 0,
          ty: 0,
        }
      : {
          sx: 1,
          sy: 1,
          tx: 0,
          ty: 0,
        },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'gradient-penpot.json');
};

const handleDragStart = (index, event) => {
  draggedIndex.value = index;
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(index));
};

const handleDragOver = (index, event) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (index, event) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) {
    isDragging.value = false;
    return;
  }
  
  const draggedStop = colorStops.value[draggedIndex.value];
  colorStops.value.splice(draggedIndex.value, 1);
  colorStops.value.splice(index, 0, draggedStop);
  
  updateGradient();
  isDragging.value = false;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  isDragging.value = false;
};

const openColorPicker = (index, event) => {
  event.stopPropagation();
  pickerColorIndex.value = index;
  pickerColor.value = colorStops.value[index].color;
  
  // Calculate position near the color swatch button
  const rect = (event.currentTarget || event.target).getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (pickerColorIndex.value === 'accessibility') {
    accessibilityTextColor.value = color;
  } else if (pickerColorIndex.value !== null) {
    colorStops.value[pickerColorIndex.value].color = color;
    updateGradient();
  }
  showColorPicker.value = false;
  pickerColorIndex.value = null;
};

const openAccessibilityColorPicker = (event) => {
  event.stopPropagation();
  pickerColorIndex.value = 'accessibility';
  pickerColor.value = accessibilityTextColor.value;
  
  // Calculate position near the color swatch button
  const rect = (event.currentTarget || event.target).getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

onMounted(() => {
  syncCurrentLayer();
  updateGradient();
});
</script>

<style scoped>
.gradient-preview {
  @apply w-full h-64 rounded-tile border border-line transition-all;
  background-image: v-bind(previewImage);
  background-blend-mode: v-bind(previewBlend);
  background-size: v-bind(previewSize);
  background-repeat: v-bind(previewRepeat);
  background-position: v-bind(previewPosition);
  animation: v-bind(previewAnimation);
}
.gradient-fill {
  background-image: v-bind(staticImage);
  background-blend-mode: v-bind(staticBlend);
}
.backdrop {
  @apply p-2 rounded-tile border border-line;
}
.backdrop-white {
  background: v-bind('backdrops.white');
}
.backdrop-night {
  background: v-bind('backdrops.night');
}
.backdrop-gray {
  background: v-bind('backdrops.gray');
}
.text-sample {
  @apply flex items-center justify-center h-11 min-w-32 px-4 rounded-field border-2 border-solid text-sm font-semibold;
  color: v-bind(accessibilityTextColor);
  border-color: v-bind(accessibilityTextColor);
}
.swatch-button {
  @apply block w-11 h-11 shrink-0 p-0.5 rounded-control border border-line-control bg-surface-control transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.stop-row {
  @apply p-4 rounded-tile border border-line bg-surface-sunken transition-colors hover:border-line-control-hover;
}
.drag-handle {
  @apply self-center cursor-move text-ink-muted hover:text-ink;
}
.layer-row {
  @apply flex items-center gap-3 p-2 rounded-tile border border-line bg-surface-raised transition-colors hover:border-line-control-hover;
}
.layer-row-on {
  @apply border-accent-highlight bg-accent-subtle;
}
.layer-select {
  @apply flex-1 min-w-0 text-left text-ink rounded-control hover:text-accent-text;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.layer-row-on .layer-select {
  @apply text-accent-text;
}
</style>

<style>
/* Global keyframes: the preview's animation names them through v-bind() */
@keyframes gradient-angle {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-position {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-color {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

.animate-gradient {
  animation-play-state: running !important;
}
</style>
