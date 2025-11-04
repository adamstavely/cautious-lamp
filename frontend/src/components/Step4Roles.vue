<template>
  <div>
    <div class="mb-8">
      <div class="mb-6">
        <p class="text-gray-600">
          Sort colors by their prominence in your design—drag between roles or use dropdowns.
        </p>
      </div>

      <!-- Role Assignment Guide - Compact -->
      <div class="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-gray-900 mb-1">Role Assignment Guide</h4>
            <p class="text-xs text-gray-600 mb-2">
              Drag colors between sections or use the dropdowns to assign roles.
            </p>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700">
              <div>• Hero = your main brand color</div>
              <div>• Accents = highlights and CTAs</div>
              <div>• Neutrals = backgrounds and text</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Three Column Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Hero Colors Section -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Hero Colors</h3>
          <div
            class="min-h-[200px] p-3 rounded-lg transition-colors border-2 border-dashed"
            :class="isDraggingOver === 'hero' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'"
            @dragover.prevent="handleDragOver($event, 'hero')"
            @drop.prevent="handleDrop($event, 'hero')"
            @dragenter.prevent="isDraggingOver = 'hero'"
            @dragleave="handleDragLeave"
          >
            <div class="flex flex-wrap gap-3 justify-center">
              <div
                v-for="(color, index) in heroColors"
                :key="`hero-${index}-${color.hex}`"
                class="flex flex-col items-center"
              >
                <div
                  class="w-28 h-28 rounded-full shadow-md border-2 border-white flex flex-col items-center justify-center cursor-move draggable-color"
                  :style="{ backgroundColor: color.hex, opacity: draggedColor === color ? 0.5 : 1 }"
                  draggable="true"
                  @dragstart="handleDragStart($event, color, 'hero', index)"
                  @dragend="handleDragEnd"
                >
                  <div class="text-xs font-semibold mb-1 pointer-events-none" :style="getTextColor(color.hex)">Hero</div>
                  <div class="font-mono text-xs pointer-events-none" :style="getTextColor(color.hex)">{{ color.hex }}</div>
                </div>
              </div>
              <div
                v-if="heroColors.length === 0"
                class="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white text-xs text-center px-2"
              >
                Drop Hero
              </div>
            </div>
          </div>
        </div>

        <!-- Accent Colors Section -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Accent Colors</h3>
          <div
            class="min-h-[200px] p-3 rounded-lg transition-colors border-2 border-dashed"
            :class="isDraggingOver === 'accent' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'"
            @dragover.prevent="handleDragOver($event, 'accent')"
            @drop.prevent="handleDrop($event, 'accent')"
            @dragenter.prevent="isDraggingOver = 'accent'"
            @dragleave="handleDragLeave"
          >
            <div class="flex flex-wrap gap-3 justify-center">
              <div
                v-for="(color, index) in accentColors"
                :key="`accent-${index}-${color.hex}`"
                class="flex flex-col items-center"
              >
                <div
                  class="w-20 h-20 rounded-full shadow-md border-2 border-white flex flex-col items-center justify-center cursor-move relative draggable-color"
                  :style="{ backgroundColor: color.hex, opacity: draggedColor === color ? 0.5 : 1 }"
                  draggable="true"
                  @dragstart="handleDragStart($event, color, 'accent', index)"
                  @dragend="handleDragEnd"
                >
                  <div class="text-xs font-semibold mb-0.5 pointer-events-none" :style="getTextColor(color.hex)">Accent</div>
                  <div class="font-mono text-xs pointer-events-none" :style="getTextColor(color.hex)">{{ color.hex }}</div>
                </div>
              </div>
              <div
                v-if="accentColors.length === 0"
                class="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white text-xs text-center px-2"
              >
                Drop Accent
              </div>
            </div>
          </div>
        </div>

        <!-- Neutrals Section -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Neutrals</h3>
          <div
            class="min-h-[200px] p-3 rounded-lg transition-colors border-2 border-dashed"
            :class="isDraggingOver === 'neutral' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'"
            @dragover.prevent="handleDragOver($event, 'neutral')"
            @drop.prevent="handleDrop($event, 'neutral')"
            @dragenter.prevent="isDraggingOver = 'neutral'"
            @dragleave="handleDragLeave"
          >
            <div class="flex flex-wrap gap-3 justify-center">
              <div
                v-for="(color, index) in neutralColors"
                :key="`neutral-${index}-${color.hex}`"
                class="flex flex-col items-center"
              >
                <div
                  class="w-24 h-14 rounded-lg shadow-md border-2 border-white flex flex-col items-center justify-center cursor-move draggable-color"
                  :style="{ backgroundColor: color.hex, opacity: draggedColor === color ? 0.5 : 1 }"
                  draggable="true"
                  @dragstart="handleDragStart($event, color, 'neutral', index)"
                  @dragend="handleDragEnd"
                >
                  <div class="text-xs font-semibold mb-0.5 pointer-events-none" :style="getTextColor(color.hex)">
                    {{ getNeutralLabel(color.role) }}
                  </div>
                  <div class="font-mono text-xs pointer-events-none" :style="getTextColor(color.hex)">{{ color.hex }}</div>
                </div>
              </div>
              <div
                v-if="neutralColors.length === 0"
                class="w-24 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white text-xs text-center px-2"
              >
                Drop Neutral
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-8 border-t border-gray-200">
      <button
        @click="$emit('back')"
        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>
      <button
        @click="handleNext"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Next: Export & Use →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'back', 'next']);

const draggedColor = ref(null);
const draggedFromRole = ref(null);
const draggedFromIndex = ref(null);
const isAssigningRoles = ref(false);
const isDraggingOver = ref(null);

// Helper functions for color conversion
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

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
};

// Auto-assign roles to colors without roles
const assignDefaultRoles = () => {
  if (isAssigningRoles.value) return;
  
  const colorsWithoutRoles = props.palette.colors.filter(c => !c.role);
  
  if (colorsWithoutRoles.length === 0) return;

  isAssigningRoles.value = true;

  const updatedColors = props.palette.colors.map((color, index) => {
    if (!color.role) {
      // First color becomes hero, rest become accents
      if (index === 0) {
        return { ...color, role: 'hero' };
      } else {
        // Check if it's a neutral based on saturation and lightness
        const rgb = hexToRgb(color.hex);
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          // Low saturation and high lightness = light neutral
          // Low saturation and low lightness = dark neutral
          if (hsl.s < 20) {
            return { ...color, role: hsl.l > 70 ? 'neutral-light' : 'neutral-dark' };
          }
        }
        return { ...color, role: 'accent' };
      }
    }
    return color;
  });

  if (colorsWithoutRoles.length > 0) {
    const newPalette = {
      ...props.palette,
      colors: updatedColors,
    };
    emit('update-palette', newPalette);
  }
  
  isAssigningRoles.value = false;
};

onMounted(() => {
  assignDefaultRoles();
});

watch(() => props.palette.colors.length, () => {
  assignDefaultRoles();
});

// Organize colors by role
const heroColors = computed(() => {
  return props.palette.colors.filter(c => c.role === 'hero');
});

const accentColors = computed(() => {
  return props.palette.colors.filter(c => c.role === 'accent');
});

const neutralColors = computed(() => {
  return props.palette.colors.filter(c => c.role === 'neutral-light' || c.role === 'neutral-dark');
});

// Determine text color based on background lightness
const getTextColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { color: '#000000' };
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return {
    color: luminance > 0.5 ? '#000000' : '#FFFFFF',
    textShadow: luminance > 0.5 ? 'none' : '0 1px 2px rgba(0,0,0,0.2)',
  };
};

const getNeutralLabel = (role) => {
  if (role === 'neutral-dark') return 'Dark Neutral';
  return 'Light Neutral';
};

// Drag and Drop Handlers
const handleDragStart = (event, color, role, index) => {
  draggedColor.value = color;
  draggedFromRole.value = role;
  draggedFromIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', color.hex);
};

const handleDragEnd = () => {
  draggedColor.value = null;
  draggedFromRole.value = null;
  draggedFromIndex.value = null;
  isDraggingOver.value = null;
};

const handleDragOver = (event, targetRole) => {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = 'move';
  isDraggingOver.value = targetRole;
};

const handleDragLeave = (event) => {
  // Only clear if we're actually leaving the drop zone (not just moving to a child)
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDraggingOver.value = null;
  }
};

const handleDrop = (event, targetRole) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (!draggedColor.value) return;

  // Determine the new role based on target section
  let newRole;
  if (targetRole === 'hero') {
    newRole = 'hero';
  } else if (targetRole === 'accent') {
    newRole = 'accent';
  } else if (targetRole === 'neutral') {
    // Determine if it should be light or dark neutral based on color lightness
    const rgb = hexToRgb(draggedColor.value.hex);
    if (rgb) {
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      newRole = luminance > 0.5 ? 'neutral-light' : 'neutral-dark';
    } else {
      newRole = 'neutral-light';
    }
  } else {
    newRole = draggedColor.value.role || 'accent';
  }

  // Update the color's role
  updateRole(draggedColor.value, newRole);
  
  // Reset drag state
  isDraggingOver.value = null;
  draggedColor.value = null;
  draggedFromRole.value = null;
  draggedFromIndex.value = null;
};

// Update role for a color
const updateRole = (color, newRole) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c) =>
      c === color ? { ...c, role: newRole } : c
    ),
  };
  emit('update-palette', newPalette);
};

const handleNext = () => {
  emit('next');
};

</script>

<style scoped>
/* Ensure draggable elements have proper cursor */
.draggable-color {
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: opacity 0.2s, transform 0.2s;
}

.draggable-color:hover {
  transform: scale(1.05);
}

.draggable-color:active {
  cursor: grabbing;
}

/* Prevent text selection during drag */
.pointer-events-none {
  pointer-events: none;
}

/* Drop zone styling */
.bg-blue-50 {
  background-color: rgb(239 246 255);
}
</style>
