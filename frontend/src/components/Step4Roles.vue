<template>
  <div>
    <div class="mb-8">
      <p class="text-ink-secondary mb-6">Sort colors by their prominence in your design—drag between roles or use dropdowns.</p>

      <!-- Role Assignment Guide - Compact -->
      <UiCallout title="Role assignment guide" icon="help" class="mb-6">
        <p class="mb-2">Drag colors between sections or use the dropdowns to assign roles.</p>
        <ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <li>• Hero = your main brand color</li>
          <li>• Accents = highlights and CTAs</li>
          <li>• Neutrals = backgrounds and text</li>
          <li>• Semantic = success, error, warning, info</li>
        </ul>
      </UiCallout>

      <!-- Four Column Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <section v-for="zone in zones" :key="zone.key" :aria-labelledby="`role-zone-${zone.key}`">
          <h3 :id="`role-zone-${zone.key}`" class="text-lg font-semibold text-ink-strong mb-4">{{ zone.title }}</h3>
          <div
            class="drop-zone"
            :class="{ 'drop-zone-over': isDraggingOver === zone.key }"
            @dragover.prevent="handleDragOver($event, zone.key)"
            @drop.prevent="handleDrop($event, zone.key)"
            @dragenter.prevent="isDraggingOver = zone.key"
            @dragleave="handleDragLeave"
          >
            <ul class="flex flex-wrap gap-3 justify-center">
              <li v-for="(color, index) in zone.colors" :key="`${zone.key}-${index}-${color.hex}`" class="flex flex-col items-center gap-2">
                <UiColorSample
                  class="draggable-color flex flex-col items-center justify-center border-2 shadow-control"
                  :class="[zone.shape, { 'opacity-50': draggedColor === color }]"
                  :color="color.hex"
                  :text-color="getTextColor(color.hex)"
                  draggable="true"
                  @dragstart="handleDragStart($event, color, zone.key, index)"
                  @dragend="handleDragEnd"
                >
                  <span class="text-xs font-semibold mb-0.5 pointer-events-none">{{ zone.label(color) }}</span>
                  <span class="font-code text-xs pointer-events-none">{{ color.hex }}</span>
                </UiColorSample>
                <div class="w-32">
                  <UiSelect
                    :model-value="color.role || color.type || ''"
                    :options="roleOptions"
                    placeholder="Role"
                    :aria-label="`Role for ${color.hex}`"
                    @update:model-value="updateRole(color, $event)"
                  />
                </div>
              </li>
              <li v-if="zone.colors.length === 0" class="drop-zone-empty" :class="zone.shape">{{ zone.empty }}</li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-8 border-t border-line-faint">
      <UiButton icon="arrow_back" @click="$emit('back')">Back</UiButton>
      <UiButton variant="primary" trailing-icon="arrow_forward" @click="handleNext">Next: Export and use</UiButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { UiButton, UiCallout, UiSelect } from './ui';
import UiColorSample from './ui/UiColorSample.vue';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
  generatedData: {
    type: Object,
    default: () => ({
      semanticSuggestions: {},
    }),
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

const semanticColors = computed(() => {
  // Get semantic colors from palette
  const paletteSemanticColors = props.palette.colors.filter(c => 
    c.role === 'success' || c.role === 'error' || c.role === 'warning' || c.role === 'info'
  );
  
  // Get semantic suggestions from generatedData that aren't in palette yet
  const semanticSuggestions = props.generatedData?.semanticSuggestions || {};
  const generatedSemanticColors = Object.values(semanticSuggestions).map(suggestion => ({
    hex: suggestion.hex,
    name: suggestion.name,
    type: suggestion.type,
    role: suggestion.type, // Use type as role
  }));
  
  // Combine and deduplicate by hex
  const allSemanticColors = [...paletteSemanticColors, ...generatedSemanticColors];
  const uniqueSemanticColors = allSemanticColors.filter((color, index, self) =>
    index === self.findIndex(c => c.hex.toLowerCase() === color.hex.toLowerCase())
  );
  
  return uniqueSemanticColors;
});

// Determine text color based on background lightness
const getTextColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const getNeutralLabel = (role) => {
  if (role === 'neutral-dark') return 'Dark Neutral';
  return 'Light Neutral';
};

const getSemanticLabel = (roleOrType) => {
  const type = roleOrType || '';
  if (type === 'success') return 'Success';
  if (type === 'error') return 'Error';
  if (type === 'warning') return 'Warning';
  if (type === 'info') return 'Info';
  return 'Semantic';
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
  } else if (targetRole === 'semantic') {
    // Preserve semantic type if it exists, otherwise use the original role or default to 'info'
    const semanticType = draggedColor.value.type || draggedColor.value.role;
    if (semanticType === 'success' || semanticType === 'error' || semanticType === 'warning' || semanticType === 'info') {
      newRole = semanticType;
    } else {
      // If dragging from another section, check if it's a semantic suggestion
      const semanticSuggestions = props.generatedData?.semanticSuggestions || {};
      const matchingSuggestion = Object.values(semanticSuggestions).find(s => s.hex.toLowerCase() === draggedColor.value.hex.toLowerCase());
      if (matchingSuggestion) {
        newRole = matchingSuggestion.type;
      } else {
        newRole = draggedColor.value.role || 'info';
      }
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
  // Check if color is in palette
  const colorInPalette = props.palette.colors.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
  
  if (colorInPalette) {
    // Update existing color's role
    const newPalette = {
      ...props.palette,
      colors: props.palette.colors.map((c) =>
        c.hex.toLowerCase() === color.hex.toLowerCase() ? { ...c, role: newRole } : c
      ),
    };
    emit('update-palette', newPalette);
  } else {
    // Add semantic color to palette with the new role
    const newColor = {
      hex: color.hex,
      name: color.name || color.type || 'Semantic Color',
      role: newRole,
    };
    const newPalette = {
      ...props.palette,
      colors: [...props.palette.colors, newColor],
    };
    emit('update-palette', newPalette);
  }
};

const handleNext = () => {
  emit('next');
};

// The four role zones, in order
const zones = computed(() => [
  { key: 'hero', title: 'Hero colors', colors: heroColors.value, shape: 'w-28 h-28 rounded-pill', label: () => 'Hero', empty: 'Drop Hero' },
  { key: 'accent', title: 'Accent colors', colors: accentColors.value, shape: 'w-20 h-20 rounded-pill', label: () => 'Accent', empty: 'Drop Accent' },
  { key: 'neutral', title: 'Neutrals', colors: neutralColors.value, shape: 'w-24 h-14 rounded-tile', label: (color) => getNeutralLabel(color.role), empty: 'Drop Neutral' },
  { key: 'semantic', title: 'Semantic colors', colors: semanticColors.value, shape: 'w-20 h-20 rounded-pill', label: (color) => getSemanticLabel(color.role || color.type), empty: 'Drop Semantic' },
]);

// The dropdown alternative to dragging (keyboard and screen reader users)
const roleOptions = [
  { value: 'hero', label: 'Hero' },
  { value: 'accent', label: 'Accent' },
  { value: 'neutral-light', label: 'Light neutral' },
  { value: 'neutral-dark', label: 'Dark neutral' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

</script>

<style scoped>
.drop-zone {
  @apply min-h-48 p-3 rounded-tile border-2 border-dashed border-line-control bg-surface-sunken transition-colors;
}
.drop-zone-over {
  @apply border-accent-border bg-accent-subtle;
}
.drop-zone-empty {
  @apply flex items-center justify-center px-2 border-2 border-dashed border-line-control bg-surface-raised text-ink-muted text-xs text-center;
}
.draggable-color {
  @apply cursor-move select-none transition-transform hover:scale-105 active:cursor-grabbing;
}
</style>
