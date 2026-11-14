<template>
  <div class="relative w-full">
    <!-- Toolbar -->
    <div class="mb-4 flex items-center justify-between flex-wrap gap-3">
      <UiSegmented v-model="currentViewMode" :options="viewModeOptions" aria-label="Comparison view" />

      <div class="flex items-center gap-2">
        <UiButton size="sm" variant="ghost" icon="remove" icon-only label="Zoom out" :disabled="zoomLevel <= minZoom" @click="zoomOut" />
        <span class="text-sm px-1 tabular-nums text-ink-secondary" aria-live="polite">{{ Math.round(zoomLevel * 100) }}%</span>
        <UiButton size="sm" variant="ghost" icon="add" icon-only label="Zoom in" :disabled="zoomLevel >= maxZoom" @click="zoomIn" />
        <UiButton size="sm" variant="ghost" label="Reset" @click="resetZoom" />
        <UiButton
          size="sm"
          variant="ghost"
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          icon-only
          :label="isFullscreen ? 'Exit full screen' : 'Full screen'"
          @click="toggleFullscreen"
        />
      </div>
    </div>

    <!-- Diff viewer -->
    <div
      ref="viewerContainer"
      class="diff-viewer"
      :class="{ 'diff-viewer-fullscreen': isFullscreen, 'diff-viewer-dark': currentViewMode === 'overlay' }"
      @wheel="handleWheel"
      @mousedown="startPan"
    >
      <!-- Slider view -->
      <div v-if="currentViewMode === 'slider'" class="diff-pane">
        <div ref="sliderContainer" class="diff-zoom overflow-hidden">
          <img
            v-if="baselineImage"
            :src="baselineImage"
            :alt="`Baseline: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain diff-baseline"
            draggable="false"
          />

          <div class="absolute inset-0 overflow-hidden diff-clip">
            <img v-if="currentImage" :src="currentImage" :alt="`Current: ${altText}`" class="w-full h-full object-contain" draggable="false" />
          </div>

          <div
            class="diff-handle"
            role="slider"
            tabindex="0"
            aria-label="Comparison position"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(sliderPosition)"
            :aria-valuetext="`${Math.round(sliderPosition)}% current`"
            @mousedown.stop="startSliderDrag"
            @touchstart.stop="startSliderDrag"
            @keydown="onHandleKey"
          >
            <span class="diff-handle-grip">
              <span class="material-symbols-outlined text-sm" aria-hidden="true">drag_indicator</span>
            </span>
          </div>

          <span class="diff-tag left-2">Baseline</span>
          <span class="diff-tag right-2">Current</span>
        </div>
      </div>

      <!-- Side-by-side view -->
      <div v-else-if="currentViewMode === 'side-by-side'" class="diff-pane flex">
        <div ref="sideBySideContainer" class="diff-zoom flex-1 overflow-auto">
          <div class="flex h-full">
            <div class="flex-1 relative border-r border-line">
              <span class="diff-tag left-2">Baseline</span>
              <img v-if="baselineImage" :src="baselineImage" :alt="`Baseline: ${altText}`" class="w-full h-full object-contain" draggable="false" />
            </div>
            <div class="flex-1 relative">
              <span class="diff-tag right-2">Current</span>
              <img v-if="currentImage" :src="currentImage" :alt="`Current: ${altText}`" class="w-full h-full object-contain" draggable="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay view -->
      <div v-else-if="currentViewMode === 'overlay'" class="diff-pane">
        <div ref="overlayContainer" class="diff-zoom overflow-hidden">
          <img
            v-if="baselineImage"
            :src="baselineImage"
            :alt="`Baseline: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain"
            draggable="false"
          />
          <img
            v-if="diffImage"
            :src="diffImage"
            :alt="`Diff: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain mix-blend-difference diff-overlay-image"
            draggable="false"
          />
          <img
            v-if="currentImage && showCurrentInOverlay"
            :src="currentImage"
            :alt="`Current: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain opacity-50"
            draggable="false"
          />
        </div>

        <div class="diff-overlay-controls">
          <UiCheckbox v-model="showCurrentInOverlay" label="Show current" />
          <div class="flex-1 min-w-48">
            <UiRange v-model="overlayOpacityPercent" label="Diff opacity" :min="0" :max="100" :step="10" unit="%" />
          </div>
        </div>
      </div>

      <!-- Grid view -->
      <div v-else class="diff-pane diff-grid">
        <figure v-for="image in gridImages" :key="image.label" class="flex flex-col gap-2">
          <figcaption class="text-sm font-medium text-ink-secondary">{{ image.label }}</figcaption>
          <div class="rounded-tile border border-line overflow-hidden">
            <img :src="image.src" :alt="`${image.label} for ${altText}`" class="w-full h-auto" draggable="false" />
          </div>
        </figure>
      </div>

      <!-- Pan indicator -->
      <div v-if="isPanning" class="diff-pan-note" role="status">Panning mode - Drag to move</div>
    </div>

    <!-- Keyboard shortcuts -->
    <p class="mt-2 text-xs flex flex-wrap items-center gap-4 text-ink-muted">
      <span><kbd class="diff-kbd">+</kbd> / <kbd class="diff-kbd">-</kbd> Zoom</span>
      <span><kbd class="diff-kbd">0</kbd> Reset zoom</span>
      <span><kbd class="diff-kbd">F</kbd> Full screen</span>
      <span><kbd class="diff-kbd">Space</kbd> + Drag pan</span>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { UiButton, UiCheckbox, UiRange, UiSegmented } from './ui';

/**
 * Compares a baseline and a current screenshot (and a diff image): slider,
 * side-by-side, overlay and grid views, with zoom, pan and full screen.
 * Emits `view-mode-change` with the new view. Sizes, zoom and the slider
 * position come from data and reach CSS through v-bind().
 */

const props = defineProps({
  baselineImage: String,
  currentImage: String,
  diffImage: String,
  altText: {
    type: String,
    default: 'Image comparison'
  },
  height: {
    type: Number,
    default: 400
  }
});

const emit = defineEmits(['view-mode-change']);

// View modes
const viewModes = ['slider', 'side-by-side', 'overlay', 'grid'];
const currentViewMode = ref('slider');

// Zoom and pan
const zoomLevel = ref(1);
const minZoom = 0.25;
const maxZoom = 5;
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStartX = ref(0);
const panStartY = ref(0);

// Slider
const sliderPosition = ref(50);
const isSliderDragging = ref(false);

// Overlay
const overlayOpacityPercent = ref(70);
const overlayOpacity = computed(() => overlayOpacityPercent.value / 100);
const showCurrentInOverlay = ref(false);

// Fullscreen
const isFullscreen = ref(false);

// Refs
const viewerContainer = ref(null);
const sliderContainer = ref(null);
const sideBySideContainer = ref(null);
const overlayContainer = ref(null);

const viewModeLabels = { slider: 'Slider', 'side-by-side': 'Side by side', overlay: 'Overlay', grid: 'Grid' };

// Values from data, used in <style> through v-bind()
const containerHeight = computed(() => (isFullscreen.value ? '100vh' : `${props.height}px`));
const paneHeight = computed(() => (isFullscreen.value ? '100%' : `${props.height}px`));
const zoomTransform = computed(() => `scale(${zoomLevel.value}) translate(${panX.value / zoomLevel.value}px, ${panY.value / zoomLevel.value}px)`);
const sliderLeft = computed(() => `${sliderPosition.value}%`);
const sliderClip = computed(() => `inset(0 ${100 - sliderPosition.value}% 0 0)`);
const baselineOpacity = computed(() => (sliderPosition.value > 0 ? 1 : 0));

const gridImages = computed(() =>
  [
    { label: 'Baseline', src: props.baselineImage },
    { label: 'Diff', src: props.diffImage },
    { label: 'Current', src: props.currentImage },
  ].filter((image) => image.src),
);

const getViewModeIcon = (mode) => {
  const icons = {
    'slider': 'compare',
    'side-by-side': 'view_column',
    'overlay': 'layers',
    'grid': 'grid_view'
  };
  return icons[mode] || 'image';
};

const viewModeOptions = viewModes.map((mode) => ({ value: mode, label: viewModeLabels[mode], icon: getViewModeIcon(mode) }));

// Zoom functions
const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value = Math.min(maxZoom, zoomLevel.value + 0.25);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value = Math.max(minZoom, zoomLevel.value - 0.25);
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
};

// Pan functions
const startPan = (e) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // Only left mouse button, not with modifier
  if (e.target.tagName === 'IMG' || e.target.closest('button')) return;
  
  isPanning.value = true;
  panStartX.value = e.clientX - panX.value;
  panStartY.value = e.clientY - panY.value;
  e.preventDefault();
  
  const handleMove = (moveEvent) => {
    if (!isPanning.value) return;
    panX.value = moveEvent.clientX - panStartX.value;
    panY.value = moveEvent.clientY - panStartY.value;
  };
  
  const handleEnd = () => {
    isPanning.value = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  };
  
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
};

// Wheel zoom
const handleWheel = (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta));
    zoomLevel.value = newZoom;
  } else if (e.shiftKey) {
    // Horizontal pan with shift + wheel
    e.preventDefault();
    panX.value += e.deltaY;
  } else {
    // Vertical pan with wheel
    e.preventDefault();
    panY.value += e.deltaY;
  }
};

// Slider drag
const startSliderDrag = (e) => {
  isSliderDragging.value = true;
  e.preventDefault();
  
  const container = viewerContainer.value;
  if (!container) return;
  
  const handleMove = (moveEvent) => {
    if (!isSliderDragging.value) return;
    
    const rect = container.getBoundingClientRect();
    const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    sliderPosition.value = percentage;
  };
  
  const handleEnd = () => {
    isSliderDragging.value = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);
  };
  
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleMove, { passive: false });
  document.addEventListener('touchend', handleEnd);
};

// Keyboard control of the slider handle
const onHandleKey = (e) => {
  const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
  const edge = { Home: 0, End: 100 }[e.key];
  if (step === undefined && edge === undefined) return;
  e.preventDefault();
  e.stopPropagation();
  sliderPosition.value = edge ?? Math.max(0, Math.min(100, sliderPosition.value + step));
};

// Fullscreen
const toggleFullscreen = () => {
  if (!viewerContainer.value) return;
  
  if (!isFullscreen.value) {
    if (viewerContainer.value.requestFullscreen) {
      viewerContainer.value.requestFullscreen();
    } else if (viewerContainer.value.webkitRequestFullscreen) {
      viewerContainer.value.webkitRequestFullscreen();
    } else if (viewerContainer.value.msRequestFullscreen) {
      viewerContainer.value.msRequestFullscreen();
    }
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFullscreen.value = false;
  }
};

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  switch (e.key) {
    case '+':
    case '=':
      e.preventDefault();
      zoomIn();
      break;
    case '-':
    case '_':
      e.preventDefault();
      zoomOut();
      break;
    case '0':
      e.preventDefault();
      resetZoom();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
  }
};

// Watch view mode changes
watch(currentViewMode, (newMode) => {
  emit('view-mode-change', newMode);
  resetZoom();
});

// Fullscreen change listener
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.diff-viewer {
  @apply relative overflow-hidden rounded-tile border border-line bg-surface-sunken;
  height: v-bind(containerHeight);
}
.diff-viewer-fullscreen {
  @apply fixed inset-0 z-50 rounded-none;
}
.diff-viewer-dark {
  @apply bg-surface-inverse;
}
.diff-pane {
  @apply relative w-full;
  height: v-bind(paneHeight);
}
.diff-zoom {
  @apply relative w-full h-full;
  transform: v-bind(zoomTransform);
}
.diff-baseline {
  opacity: v-bind(baselineOpacity);
}
.diff-clip {
  clip-path: v-bind(sliderClip);
}
.diff-handle {
  @apply absolute top-0 bottom-0 z-10 w-1 -ml-0.5 flex items-center justify-center bg-accent cursor-ew-resize;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
  left: v-bind(sliderLeft);
}
.diff-handle-grip {
  @apply flex items-center justify-center w-8 h-8 shrink-0 rounded-pill bg-accent text-ink-on-accent shadow-overlay;
}
.diff-tag {
  @apply absolute top-2 z-20 px-2 py-1 rounded-control border border-line bg-surface-overlay text-xs font-medium text-ink;
}
.diff-overlay-image {
  opacity: v-bind(overlayOpacity);
}
.diff-overlay-controls {
  @apply absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end gap-6 p-4 rounded-tile border border-line bg-surface-overlay shadow-overlay;
}
.diff-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-auto;
}
.diff-pan-note {
  @apply absolute top-4 left-4 z-30 px-3 py-2 rounded-control border border-line bg-surface-overlay text-sm text-ink shadow-overlay;
}
.diff-kbd {
  @apply px-2 py-1 rounded-control bg-fill font-code text-ink;
}
</style>
