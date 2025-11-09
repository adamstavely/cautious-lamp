<template>
  <div class="relative w-full" :class="containerClass">
    <!-- Toolbar -->
    <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <!-- View Mode Buttons -->
        <button
          v-for="mode in viewModes"
          :key="mode"
          @click="currentViewMode = mode"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          :class="currentViewMode === mode
            ? 'bg-indigo-600 text-white'
            : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
        >
          <span class="material-symbols-outlined text-base">{{ getViewModeIcon(mode) }}</span>
          {{ mode }}
        </button>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Zoom Controls -->
        <button
          @click="zoomOut"
          :disabled="zoomLevel <= minZoom"
          class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <span class="material-symbols-outlined text-base">remove</span>
        </button>
        <span class="text-sm px-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          {{ Math.round(zoomLevel * 100) }}%
        </span>
        <button
          @click="zoomIn"
          :disabled="zoomLevel >= maxZoom"
          class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <span class="material-symbols-outlined text-base">add</span>
        </button>
        <button
          @click="resetZoom"
          class="px-3 py-1.5 rounded-lg text-sm transition-colors"
          :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          Reset
        </button>
        
        <!-- Full Screen -->
        <button
          @click="toggleFullscreen"
          class="p-2 rounded-lg transition-colors"
          :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <span class="material-symbols-outlined text-base">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
        </button>
      </div>
    </div>

    <!-- Diff Viewer Container -->
    <div
      ref="viewerContainer"
      class="relative overflow-hidden rounded-lg border"
      :class="[
        borderClass,
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : '',
        currentViewMode === 'overlay' ? 'bg-black' : ''
      ]"
      :style="containerStyle"
      @wheel="handleWheel"
      @mousedown="startPan"
    >
      <!-- Slider View -->
      <div v-if="currentViewMode === 'slider'" class="relative w-full h-full" :style="{ height: `${height}px` }">
        <div
          ref="sliderContainer"
          class="relative w-full h-full overflow-hidden"
          :style="{ transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)` }"
        >
          <!-- Baseline Image -->
          <img
            v-if="baselineImage"
            :src="baselineImage"
            :alt="`Baseline: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain"
            :style="{ opacity: sliderPosition > 0 ? 1 : 0 }"
            draggable="false"
          />
          
          <!-- Current Image -->
          <div
            class="absolute inset-0 overflow-hidden"
            :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
          >
            <img
              v-if="currentImage"
              :src="currentImage"
              :alt="`Current: ${altText}`"
              class="w-full h-full object-contain"
              draggable="false"
            />
          </div>
          
          <!-- Slider Handle -->
          <div
            class="absolute top-0 bottom-0 w-1 bg-indigo-600 cursor-ew-resize z-10 flex items-center justify-center"
            :style="{ left: `${sliderPosition}%` }"
            @mousedown.stop="startSliderDrag"
            @touchstart.stop="startSliderDrag"
          >
            <div class="w-8 h-8 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-sm">drag_indicator</span>
            </div>
          </div>
          
          <!-- Labels -->
          <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white z-20">
            Baseline
          </div>
          <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white z-20">
            Current
          </div>
        </div>
      </div>

      <!-- Side-by-Side View -->
      <div v-else-if="currentViewMode === 'side-by-side'" class="relative w-full h-full flex" :style="{ height: `${height}px` }">
        <div
          ref="sideBySideContainer"
          class="flex-1 overflow-auto"
          :style="{ transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)` }"
        >
          <div class="flex h-full">
            <div class="flex-1 relative border-r" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white z-10">
                Baseline
              </div>
              <img
                v-if="baselineImage"
                :src="baselineImage"
                :alt="`Baseline: ${altText}`"
                class="w-full h-full object-contain"
                draggable="false"
              />
            </div>
            <div class="flex-1 relative">
              <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white z-10">
                Current
              </div>
              <img
                v-if="currentImage"
                :src="currentImage"
                :alt="`Current: ${altText}`"
                class="w-full h-full object-contain"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay View -->
      <div v-else-if="currentViewMode === 'overlay'" class="relative w-full h-full" :style="{ height: `${height}px` }">
        <div
          ref="overlayContainer"
          class="relative w-full h-full overflow-hidden"
          :style="{ transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)` }"
        >
          <!-- Baseline Image (background) -->
          <img
            v-if="baselineImage"
            :src="baselineImage"
            :alt="`Baseline: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain"
            draggable="false"
          />
          
          <!-- Diff Image (overlay) -->
          <img
            v-if="diffImage"
            :src="diffImage"
            :alt="`Diff: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain mix-blend-difference opacity-70"
            :style="{ opacity: overlayOpacity }"
            draggable="false"
          />
          
          <!-- Current Image (optional) -->
          <img
            v-if="currentImage && showCurrentInOverlay"
            :src="currentImage"
            :alt="`Current: ${altText}`"
            class="absolute inset-0 w-full h-full object-contain opacity-50"
            draggable="false"
          />
          
          <!-- Overlay Controls -->
          <div class="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4 z-20">
            <div class="flex items-center gap-4">
              <label class="text-white text-sm flex items-center gap-2">
                <input
                  v-model="showCurrentInOverlay"
                  type="checkbox"
                  class="rounded"
                />
                Show Current
              </label>
              <label class="text-white text-sm flex items-center gap-2 flex-1">
                <span>Diff Opacity:</span>
                <input
                  v-model.number="overlayOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="flex-1"
                />
                <span class="text-xs">{{ Math.round(overlayOpacity * 100) }}%</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View (fallback) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4" :style="{ height: `${height}px`, overflow: 'auto' }">
        <div v-if="baselineImage" class="space-y-2">
          <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Baseline</div>
          <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <img :src="baselineImage" :alt="`Baseline for ${altText}`" class="w-full h-auto" draggable="false" />
          </div>
        </div>
        <div v-if="diffImage" class="space-y-2">
          <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Diff</div>
          <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <img :src="diffImage" :alt="`Diff for ${altText}`" class="w-full h-auto" draggable="false" />
          </div>
        </div>
        <div v-if="currentImage" class="space-y-2">
          <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Current</div>
          <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <img :src="currentImage" :alt="`Current for ${altText}`" class="w-full h-auto" draggable="false" />
          </div>
        </div>
      </div>

      <!-- Pan Indicator -->
      <div v-if="isPanning" class="absolute top-4 left-4 px-3 py-2 rounded-lg bg-black/70 text-white text-sm z-30">
        Panning mode - Drag to move
      </div>
    </div>

    <!-- Keyboard Shortcuts Hint -->
    <div class="mt-2 text-xs flex items-center gap-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
      <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">+</kbd> / <kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">-</kbd> Zoom</span>
      <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">0</kbd> Reset Zoom</span>
      <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">F</kbd> Fullscreen</span>
      <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Space</kbd> + Drag Pan</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

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
const overlayOpacity = ref(0.7);
const showCurrentInOverlay = ref(false);

// Fullscreen
const isFullscreen = ref(false);

// Dark mode
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Refs
const viewerContainer = ref(null);
const sliderContainer = ref(null);
const sideBySideContainer = ref(null);
const overlayContainer = ref(null);

const containerClass = computed(() => {
  return isDarkMode.value ? '' : '';
});

const borderClass = computed(() => {
  return isDarkMode.value ? 'border-gray-700' : 'border-gray-200';
});

const containerStyle = computed(() => {
  if (isFullscreen.value) {
    return { height: '100vh' };
  }
  return { height: `${props.height}px` };
});

const getViewModeIcon = (mode) => {
  const icons = {
    'slider': 'compare',
    'side-by-side': 'view_column',
    'overlay': 'layers',
    'grid': 'grid_view'
  };
  return icons[mode] || 'image';
};

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

let darkModeObserver = null;

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

