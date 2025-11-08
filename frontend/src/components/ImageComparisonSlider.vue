<template>
  <div class="relative w-full" :class="containerClass">
    <div class="relative overflow-hidden rounded-lg border" :class="borderClass" :style="{ height: `${height}px` }">
      <!-- Baseline Image (background) -->
      <img
        v-if="baselineImage"
        :src="baselineImage"
        :alt="`Baseline: ${altText}`"
        class="absolute inset-0 w-full h-full object-contain"
        :style="{ opacity: sliderPosition > 0 ? 1 : 0 }"
      />
      
      <!-- Current Image (foreground) -->
      <div
        class="absolute inset-0 overflow-hidden"
        :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
      >
        <img
          v-if="currentImage"
          :src="currentImage"
          :alt="`Current: ${altText}`"
          class="w-full h-full object-contain"
        />
      </div>
      
      <!-- Slider Handle -->
      <div
        class="absolute top-0 bottom-0 w-1 bg-indigo-600 cursor-ew-resize z-10 flex items-center justify-center"
        :style="{ left: `${sliderPosition}%` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <div class="w-8 h-8 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-sm">drag_indicator</span>
        </div>
      </div>
      
      <!-- Labels -->
      <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">
        Baseline
      </div>
      <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white">
        Current
      </div>
    </div>
    
    <!-- Controls -->
    <div class="mt-2 flex items-center justify-center gap-4">
      <button
        @click="resetPosition"
        class="px-3 py-1 text-sm rounded transition-colors"
        :class="buttonClass"
      >
        Reset
      </button>
      <div class="text-xs" :class="textClass">
        Drag slider to compare
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

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

const sliderPosition = ref(50);
const isDragging = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const containerClass = computed(() => {
  return isDarkMode.value ? '' : '';
});

const borderClass = computed(() => {
  return isDarkMode.value ? 'border-gray-700' : 'border-gray-200';
});

const buttonClass = computed(() => {
  return isDarkMode.value
    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
});

const textClass = computed(() => {
  return isDarkMode.value ? 'text-gray-400' : 'text-gray-600';
});

const startDrag = (e) => {
  isDragging.value = true;
  e.preventDefault();
  
  const container = e.currentTarget?.closest('.relative');
  if (!container) return;
  
  const handleMove = (moveEvent) => {
    if (!isDragging.value) return;
    
    const rect = container.getBoundingClientRect();
    const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    sliderPosition.value = percentage;
  };
  
  const handleEnd = () => {
    isDragging.value = false;
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

const resetPosition = () => {
  sliderPosition.value = 50;
};

let darkModeObserver = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

