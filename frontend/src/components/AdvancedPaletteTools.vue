<template>
  <div class="flex flex-col gap-6">
    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <!-- Color variants -->
    <UiPanel title="Color variants" description="Generate tints, shades, and dark variants for each color" heading-tag="h3">
      <div v-if="variants.length === 0" class="flex flex-col items-start gap-3">
        <UiButton variant="primary" icon="auto_fix_high" label="Generate variants" @click.prevent="generateVariants" />
        <p v-if="palette && palette.colors && palette.colors.length > 0" class="text-sm text-ink-muted">
          Click "Generate variants" to create tints and shades
        </p>
      </div>

      <div v-else>
        <p class="text-sm mb-3 text-ink-secondary">{{ variants.length }} variants generated</p>
        <ul class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <li v-for="(variant, index) in variants" :key="`variant-${variant.hex}-${index}-${variant.type}`">
            <UiColorSample
              tag="button"
              :color="variant.hex"
              class="block w-full h-20 rounded-tile border shadow-control mb-2 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 outline-focus"
              :aria-label="`Add ${variant.type} ${variant.hex} to the palette`"
              @click="addVariant(variant)"
            />
            <p class="text-xs text-center text-ink-secondary">{{ variant.type }}</p>
            <p class="text-xs text-center font-code text-ink-muted">{{ variant.hex }}</p>
          </li>
        </ul>
      </div>
    </UiPanel>

    <!-- Semantic color validation -->
    <UiPanel title="Semantic color validation" description="Check that the palette has success, error, warning and info colors." heading-tag="h3">
      <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <li v-for="semantic in semanticTypes" :key="semantic.type" class="semantic-card">
          <p class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-lg" :class="semanticIconClass[semantic.type]" aria-hidden="true">{{ semantic.icon }}</span>
            <span class="font-semibold text-ink-strong">{{ semantic.label }}</span>
          </p>

          <p v-if="semanticMatches[semantic.type]" class="text-sm text-success flex items-center gap-1 mb-2">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">check</span>
            {{ semanticMatches[semantic.type].name || semanticMatches[semantic.type].hex }}
          </p>
          <div v-else class="mb-2 flex flex-col items-start gap-2">
            <p class="text-sm text-ink-muted">No suitable color found</p>
            <UiButton size="sm" label="Suggest color" @click="generateSemanticSuggestion(semantic.type)" />
          </div>

          <!-- Suggestion -->
          <div v-if="semanticSuggestions[semantic.type]" class="semantic-suggestion">
            <div class="flex items-center gap-2 mb-2">
              <UiSwatch :color="semanticSuggestions[semantic.type].hex" size="lg" :label="`Suggested ${semantic.label.toLowerCase()} color ${semanticSuggestions[semantic.type].hex}`" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-code text-ink-strong">{{ semanticSuggestions[semantic.type].hex }}</p>
                <p class="text-xs text-ink-secondary">{{ semanticSuggestions[semantic.type].name }}</p>
              </div>
              <UiButton variant="primary" size="sm" label="Add" @click="addSemanticSuggestion(semantic.type)" />
            </div>
            <UiButton variant="ghost" size="sm" icon="refresh" label="Generate another" @click="generateSemanticSuggestion(semantic.type)" />
          </div>
        </li>
      </ul>
    </UiPanel>

    <!-- Color scale generator -->
    <UiPanel
      title="Color scale generator"
      description="Generate complete color scales (50-900) for all colors in your palette, similar to Tailwind CSS"
      heading-tag="h3"
    >
      <div v-if="colorScales.length === 0">
        <UiButton
          variant="primary"
          icon="format_color_fill"
          label="Generate color scales"
          :disabled="!palette?.colors || palette.colors.length === 0"
          @click.prevent="generateColorScale"
        />
      </div>

      <div v-else class="relative">
        <p class="text-sm mb-2 text-ink-secondary">{{ colorScales.length }} color scale(s) generated</p>
        <!-- Highlight behind the 500 column, the base color that is in the palette -->
        <div v-if="hasColumn500" class="scale-column-500" aria-hidden="true"></div>
        <div v-for="(scale, scaleIndex) in colorScales" :key="scaleIndex" class="mb-6 relative">
          <p class="mb-2 text-sm font-semibold text-ink-strong">{{ scale.baseColor.name || scale.baseColor.hex }}</p>
          <div class="relative mb-8">
            <!-- Label above the 500 column, on the first scale only -->
            <div v-if="scaleIndex === 0 && scale.shades.some((s) => s.weight === 500)" class="absolute left-0 right-0 bottom-full z-10 flex" aria-hidden="true">
              <div v-for="(shade, shadeIndex) in scale.shades" :key="shadeIndex" class="flex-1">
                <p v-if="shade.weight === 500" class="scale-500-label">This color is in your palette</p>
              </div>
            </div>
            <ul class="flex rounded-field border border-line overflow-hidden" :aria-label="`${scale.baseColor.name || scale.baseColor.hex} scale`">
              <li v-for="(shade, shadeIndex) in scale.shades" :key="shadeIndex" class="flex-1">
                <UiColorSample
                  tag="button"
                  :color="shade.hex"
                  :text-color="getTextColor(shade.hex)"
                  class="shade-cell"
                  :class="{ 'shade-in-palette': isShadeInPalette(shade.hex) }"
                  :title="`${shade.weight}: ${shade.hex}`"
                  :aria-pressed="isShadeInPalette(shade.hex)"
                  :aria-label="`${shade.weight} ${shade.hex}: ${isShadeInPalette(shade.hex) ? 'in the palette, select to remove' : 'select to add to the palette'}`"
                  @click="addSingleShade(shade)"
                >
                  <span class="text-xs font-semibold">{{ shade.weight }}</span>
                  <span class="text-xs font-code mt-1">{{ shade.hex }}</span>
                  <span v-if="isShadeInPalette(shade.hex)" class="shade-dot" aria-hidden="true"></span>
                </UiColorSample>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UiPanel>

    <!-- Dark mode generator -->
    <UiPanel title="Dark mode palette generator" description="Generate dark mode variants optimized for dark backgrounds" heading-tag="h3">
      <div v-if="darkModeColors.length === 0">
        <UiButton variant="primary" icon="dark_mode" label="Generate dark mode variants" @click.prevent="generateDarkModePalette" />
      </div>

      <div v-else class="flex flex-col items-start gap-4">
        <!-- A dark stage, whatever the page theme, to judge the colors on -->
        <div class="dark-stage" data-theme="dark">
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <li v-for="(color, index) in darkModeColors" :key="`dark-${color.hex}-${index}`">
              <UiColorSample :color="color.hex" class="w-full h-16 rounded-tile border shadow-control mb-2" role="img" :aria-label="`${color.name || 'Color'} ${color.hex}`" />
              <p class="text-xs font-code text-center text-ink-secondary">{{ color.hex }}</p>
              <p v-if="color.name" class="text-xs text-center text-ink-muted">{{ color.name }}</p>
            </li>
          </ul>
        </div>
        <UiButton icon="add" label="Add dark mode colors to palette" @click="addDarkModeColors" />
      </div>
    </UiPanel>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import InlineNotice from './InlineNotice.vue';
import UiColorSample from './ui/UiColorSample.vue';
import { UiButton, UiPanel, UiSwatch } from './ui';
import { useNotice } from '../composables/useNotice.js';

/**
 * Extra palette tools for the palette builder: variants, semantic colour
 * checks and suggestions, 50–900 scales and dark-mode variants. Emits
 * `update-palette` with the new palette and `update-generated-data` for export.
 */
const { notice, showNotice, clearNotice } = useNotice();

const props = defineProps({
  palette: {
    type: Object,
    required: true,
    default: () => ({ colors: [] }),
  },
});

const emit = defineEmits(['update-palette', 'update-generated-data']);

// Debug computed to check palette state
const paletteDebug = computed(() => {
  if (!props.palette) {
    return { exists: false, colors: null, colorsLength: 0 };
  }
  return {
    exists: !!props.palette,
    colors: props.palette?.colors,
    colorsLength: props.palette?.colors?.length || 0,
  };
});

const variants = ref([]);
const semanticMatches = ref({});
const semanticSuggestions = ref({});
const semanticIconClass = { success: 'text-success', error: 'text-danger', warning: 'text-warning', info: 'text-info' };
const semanticTypes = [
  { type: 'success', label: 'Success', color: '#10b981', icon: 'check_circle', targetHue: 140 },
  { type: 'error', label: 'Error', color: '#ef4444', icon: 'error', targetHue: 0 },
  { type: 'warning', label: 'Warning', color: '#f59e0b', icon: 'warning', targetHue: 45 },
  { type: 'info', label: 'Info', color: '#3b82f6', icon: 'info', targetHue: 210 },
];
const darkModeColors = ref([]);
const colorScales = ref([]);

// Generate color variants (tints, shades, dark variants)
const generateVariants = () => {
  try {
    console.log('=== GENERATE VARIANTS CALLED ===');
    console.log('props:', props);
    console.log('props.palette:', props.palette);
    console.log('props.palette?.colors:', props.palette?.colors);
    console.log('props.palette?.colors?.length:', props.palette?.colors?.length);
    
    if (!props.palette) {
      console.error('No palette prop');
      showNotice('Palette data not available', 'error');
      return;
    }
    
    if (!props.palette.colors || props.palette.colors.length === 0) {
      console.warn('No colors in palette');
      showNotice('Please add colors to your palette first', 'warning');
      return;
    }
    
    console.log('Starting variant generation for', props.palette.colors.length, 'colors');
    
    const newVariants = [];
    props.palette.colors.forEach((color, idx) => {
      console.log(`Processing color ${idx}:`, color);
      const rgb = hexToRgb(color.hex);
      console.log(`RGB for ${color.hex}:`, rgb);
      
      if (!rgb) {
        console.warn(`Failed to parse hex: ${color.hex}`);
        return;
      }
      
      // Generate tints (lighter)
      for (let i = 1; i <= 3; i++) {
        const tint = generateTint(rgb, i * 0.25);
        const tintHex = rgbToHex(tint.r, tint.g, tint.b);
        console.log(`Tint ${i}:`, tintHex);
        newVariants.push({
          hex: tintHex,
          type: `${color.name || 'Color'} Tint ${i}`,
          original: color.hex,
        });
      }
      
      // Generate shades (darker)
      for (let i = 1; i <= 3; i++) {
        const shade = generateShade(rgb, i * 0.25);
        const shadeHex = rgbToHex(shade.r, shade.g, shade.b);
        console.log(`Shade ${i}:`, shadeHex);
        newVariants.push({
          hex: shadeHex,
          type: `${color.name || 'Color'} Shade ${i}`,
          original: color.hex,
        });
      }
    });
    
    console.log('Generated variants:', newVariants.length, newVariants);
    
    // Set variants using a new array to trigger reactivity
    variants.value = newVariants;
    
    // Emit generated data for PDF export
    emit('update-generated-data', {
      variants: newVariants,
      colorScales: colorScales.value,
      darkModeColors: darkModeColors.value,
      semanticSuggestions: semanticSuggestions.value,
    });
    
    console.log('After assignment, variants.value:', variants.value.length);
    console.log('variants ref:', variants);
  } catch (error) {
    console.error('Error generating variants:', error);
    showNotice('Error generating variants: ' + error.message, 'error');
  }
};

const generateTint = (rgb, factor) => {
  return {
    r: Math.round(rgb.r + (255 - rgb.r) * factor),
    g: Math.round(rgb.g + (255 - rgb.g) * factor),
    b: Math.round(rgb.b + (255 - rgb.b) * factor),
  };
};

const generateShade = (rgb, factor) => {
  return {
    r: Math.round(rgb.r * (1 - factor)),
    g: Math.round(rgb.g * (1 - factor)),
    b: Math.round(rgb.b * (1 - factor)),
  };
};

const addVariant = (variant) => {
  const newPalette = {
    ...props.palette,
    colors: [...props.palette.colors, { hex: variant.hex, name: variant.type, role: null }],
  };
  emit('update-palette', newPalette);
};

// Semantic color validation
const validateSemanticColors = () => {
  semanticMatches.value = {};
  
  if (!props.palette || !props.palette.colors || props.palette.colors.length === 0) {
    return;
  }
  
  props.palette.colors.forEach((color) => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Success (green)
    if (hsl.h >= 120 && hsl.h <= 180 && hsl.s > 40 && hsl.l > 30 && hsl.l < 70) {
      if (!semanticMatches.value.success) {
        semanticMatches.value.success = color;
      }
    }
    
    // Error (red)
    if ((hsl.h >= 0 && hsl.h <= 30) || (hsl.h >= 330 && hsl.h <= 360)) {
      if (hsl.s > 40 && hsl.l > 30 && hsl.l < 70) {
        if (!semanticMatches.value.error) {
          semanticMatches.value.error = color;
        }
      }
    }
    
    // Warning (yellow/orange)
    if (hsl.h >= 30 && hsl.h <= 60 && hsl.s > 40 && hsl.l > 40 && hsl.l < 70) {
      if (!semanticMatches.value.warning) {
        semanticMatches.value.warning = color;
      }
    }
    
    // Info (blue)
    if (hsl.h >= 180 && hsl.h <= 270 && hsl.s > 40 && hsl.l > 30 && hsl.l < 70) {
      if (!semanticMatches.value.info) {
        semanticMatches.value.info = color;
      }
    }
  });
};

// Generate semantic color suggestions in harmony with palette
const generateSemanticSuggestion = (type) => {
  if (!props.palette || !props.palette.colors || props.palette.colors.length === 0) {
    showNotice('Please add colors to your palette first', 'warning');
    return;
  }
  
  const semanticType = semanticTypes.find(s => s.type === type);
  if (!semanticType) return;
  
  // Analyze palette colors
  const paletteAnalyses = props.palette.colors.map(color => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { ...hsl, rgb };
  }).filter(Boolean);
  
  if (paletteAnalyses.length === 0) return;
  
  // Calculate palette statistics
  const saturations = paletteAnalyses.map(hsl => hsl.s);
  const lightnesses = paletteAnalyses.map(hsl => hsl.l);
  const hues = paletteAnalyses.map(hsl => hsl.h);
  
  const avgSaturation = saturations.reduce((sum, s) => sum + s, 0) / saturations.length;
  const avgLightness = lightnesses.reduce((sum, l) => sum + l, 0) / lightnesses.length;
  let avgHue = hues.reduce((sum, h) => sum + h, 0) / hues.length;
  
  // Calculate ranges (min/max) for saturation and lightness
  const minSaturation = Math.min(...saturations);
  const maxSaturation = Math.max(...saturations);
  const minLightness = Math.min(...lightnesses);
  const maxLightness = Math.max(...lightnesses);
  
  // Find palette's hue spread (range of hues used)
  const sortedHues = [...hues].sort((a, b) => a - b);
  
  // Check if hues wrap around (e.g., 350 and 10)
  let hueSpread = sortedHues[sortedHues.length - 1] - sortedHues[0];
  const wrapAroundSpread = (360 - sortedHues[sortedHues.length - 1]) + sortedHues[0];
  if (wrapAroundSpread < hueSpread) {
    hueSpread = wrapAroundSpread;
    // Adjust avgHue for wraparound case
    const adjustedHues = hues.map(h => h < 180 ? h + 360 : h);
    avgHue = adjustedHues.reduce((sum, h) => sum + h, 0) / adjustedHues.length;
    if (avgHue >= 360) avgHue -= 360;
  }
  
  // Determine palette "vibe" - muted, vibrant, pastel, etc.
  const isMutedPalette = avgSaturation < 40;
  const isVibrantPalette = avgSaturation > 60;
  const isPastelPalette = avgLightness > 70 && avgSaturation < 50;
  const isDarkPalette = avgLightness < 40;
  
  // Target saturation: stay within palette's saturation range
  let targetSaturation;
  if (isMutedPalette) {
    // Muted palette - keep semantic colors muted but readable
    targetSaturation = Math.min(maxSaturation + 10, avgSaturation + 15);
  } else if (isVibrantPalette) {
    // Vibrant palette - semantic colors can be vibrant
    targetSaturation = Math.max(minSaturation - 10, avgSaturation);
  } else {
    // Medium palette - match average
    targetSaturation = avgSaturation;
  }
  
  // Ensure saturation stays within reasonable bounds
  targetSaturation = Math.max(30, Math.min(80, targetSaturation));
  
  // Add randomization for "Generate Another" - vary saturation by ±15%
  const saturationVariation = (Math.random() - 0.5) * 30; // -15 to +15
  targetSaturation = Math.max(30, Math.min(80, targetSaturation + saturationVariation));
  
  // Target lightness: stay within palette's lightness range, adjusted for readability
  let targetLightness;
  if (isPastelPalette) {
    // Pastel palette - semantic colors should be medium-light
    targetLightness = Math.max(45, Math.min(65, avgLightness - 15));
  } else if (isDarkPalette) {
    // Dark palette - semantic colors should be lighter
    targetLightness = Math.min(60, avgLightness + 20);
  } else {
    // Medium palette - use middle of palette's lightness range
    targetLightness = (minLightness + maxLightness) / 2;
    // Ensure readable (not too light or dark)
    targetLightness = Math.max(45, Math.min(65, targetLightness));
  }
  
  // Add randomization for "Generate Another" - vary lightness by ±10%
  const lightnessVariation = (Math.random() - 0.5) * 20; // -10 to +10
  targetLightness = Math.max(45, Math.min(65, targetLightness + lightnessVariation));
  
  // Target hue: maintain semantic meaning while harmonizing with palette
  const baseHue = semanticType.targetHue;
  
  // Define acceptable hue ranges for each semantic type to maintain meaning
  const semanticHueRanges = {
    success: { min: 120, max: 180 }, // Green range
    error: { min: 350, max: 30 }, // Red range (wraps around)
    warning: { min: 30, max: 70 }, // Yellow/orange range
    info: { min: 180, max: 270 }, // Blue range
  };
  
  const hueRange = semanticHueRanges[type];
  
  // Start with the semantic base hue
  let hueCenter = baseHue;
  
  // Blend slightly with palette for harmony (80% semantic, 20% palette)
  // This keeps semantic meaning while adding harmony
  const blendedHue = (baseHue * 0.8 + avgHue * 0.2) % 360;
  
  // Check if blended hue is within semantic range
  let isValidSemanticHue = false;
  if (hueRange.min > hueRange.max) {
    // Wraps around (e.g., error: 350-30)
    isValidSemanticHue = blendedHue >= hueRange.min || blendedHue <= hueRange.max;
  } else {
    // Normal range
    isValidSemanticHue = blendedHue >= hueRange.min && blendedHue <= hueRange.max;
  }
  
  if (isValidSemanticHue) {
    // Blended hue is still semantically valid - use it
    hueCenter = blendedHue;
  } else {
    // Blended hue moved outside semantic range - find closest valid hue
    // Find the closest point within the semantic range
    let minDist = Infinity;
    let bestHue = baseHue;
    
    // Check points at semantic range boundaries and middle
    const testPoints = [
      hueRange.min,
      hueRange.max,
      hueRange.min > hueRange.max ? (hueRange.min + hueRange.max + 360) / 2 % 360 : (hueRange.min + hueRange.max) / 2,
    ];
    
    testPoints.forEach(testHue => {
      const dist = Math.min(
        Math.abs(blendedHue - testHue),
        Math.abs(blendedHue - testHue + 360),
        Math.abs(blendedHue - testHue - 360)
      );
      if (dist < minDist) {
        minDist = dist;
        bestHue = testHue;
      }
    });
    
    // Blend the best valid hue with a slight palette influence
    hueCenter = (bestHue * 0.9 + avgHue * 0.1) % 360;
    
    // Ensure it's still in the semantic range
    if (hueRange.min > hueRange.max) {
      if (hueCenter < hueRange.min && hueCenter > hueRange.max) {
        hueCenter = baseHue; // Fallback to base if somehow still invalid
      }
    } else {
      if (hueCenter < hueRange.min || hueCenter > hueRange.max) {
        hueCenter = baseHue; // Fallback to base if somehow still invalid
      }
    }
  }
  
  // Add randomization for "Generate Another" - vary hue by ±15 degrees within semantic range
  const hueVariation = (Math.random() - 0.5) * 30; // -15 to +15
  hueCenter = (hueCenter + hueVariation + 360) % 360;
  
  // Ensure randomized hue stays within semantic range
  if (hueRange.min > hueRange.max) {
    // Wraps around
    if (hueCenter < hueRange.min && hueCenter > hueRange.max) {
      // Clamp to nearest boundary
      const distToMin = Math.min(hueCenter + 360 - hueRange.min, hueRange.min - hueCenter);
      const distToMax = Math.min(hueCenter - hueRange.max, hueRange.max + 360 - hueCenter);
      hueCenter = distToMin < distToMax ? hueRange.min : hueRange.max;
    }
  } else {
    // Normal range
    if (hueCenter < hueRange.min) {
      hueCenter = hueRange.min;
    } else if (hueCenter > hueRange.max) {
      hueCenter = hueRange.max;
    }
  }
  
  // Generate the color
  const rgb = hslToRgb(hueCenter, targetSaturation, targetLightness);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  // Force reactivity update by creating a new object
  semanticSuggestions.value = {
    ...semanticSuggestions.value,
    [type]: {
      hex,
      name: `${semanticType.label} Color`,
      type: semanticType.type,
    },
  };
  
  // Emit generated data for PDF export
  emit('update-generated-data', {
    variants: variants.value,
    colorScales: colorScales.value,
    darkModeColors: darkModeColors.value,
    semanticSuggestions: semanticSuggestions.value,
  });
};

const addSemanticSuggestion = (type) => {
  const suggestion = semanticSuggestions.value[type];
  if (!suggestion) return;
  
  const newPalette = {
    ...props.palette,
    colors: [...props.palette.colors, { hex: suggestion.hex, name: suggestion.name, role: null }],
  };
  emit('update-palette', newPalette);
  
  // Clear suggestion after adding
  delete semanticSuggestions.value[type];
  
  // Revalidate semantic colors
  validateSemanticColors();
};


// Dark mode palette generator
const generateDarkModePalette = () => {
  try {
    console.log('=== GENERATE DARK MODE CALLED ===');
    console.log('props.palette:', props.palette);
    
    if (!props.palette || !props.palette.colors || props.palette.colors.length === 0) {
      showNotice('Please add colors to your palette first', 'warning');
      return;
    }
    
    const newDarkModeColors = props.palette.colors.map((color, idx) => {
      console.log(`Processing color ${idx} for dark mode:`, color);
      const rgb = hexToRgb(color.hex);
      
      if (!rgb) {
        console.warn(`Failed to parse hex: ${color.hex}`);
        return { ...color, hex: color.hex };
      }
      
      // Increase lightness for dark backgrounds, adjust saturation
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const darkHsl = {
        h: hsl.h,
        s: Math.min(100, hsl.s * 0.8), // Slightly desaturate
        l: Math.min(90, hsl.l + (hsl.l < 50 ? 30 : 20)), // Lighten darker colors more
      };
      
      const darkRgb = hslToRgb(darkHsl.h, darkHsl.s, darkHsl.l);
      const darkHex = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);
      console.log(`Dark mode variant:`, darkHex);
      
      return {
        hex: darkHex,
        name: `${color.name || 'Color'} (Dark)`,
        role: color.role,
      };
    });
    
    console.log('Generated dark mode colors:', newDarkModeColors);
    
    // Set dark mode colors using a new array to trigger reactivity
    darkModeColors.value = newDarkModeColors;
    
    // Emit generated data for PDF export
    emit('update-generated-data', {
      variants: variants.value,
      colorScales: colorScales.value,
      darkModeColors: newDarkModeColors,
      semanticSuggestions: semanticSuggestions.value,
    });
    
    console.log('After assignment, darkModeColors.value:', darkModeColors.value.length);
  } catch (error) {
    console.error('Error generating dark mode palette:', error);
    showNotice('Error generating dark mode palette: ' + error.message, 'error');
  }
};

// Color scale generator (50-900 shades) - generates for all colors
const generateColorScale = () => {
  if (!props.palette?.colors || props.palette.colors.length === 0) {
    showNotice('Please add colors to your palette first', 'warning');
    return;
  }
  
  // Clear existing scales
  colorScales.value = [];
  
  // Generate scale for each color in the palette
  props.palette.colors.forEach((baseColor) => {
    const rgb = hexToRgb(baseColor.hex);
    if (!rgb) {
      console.warn(`Invalid color format for ${baseColor.hex}`);
      return;
    }
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Generate scale from 50 (lightest) to 900 (darkest)
    // Similar to Tailwind CSS color scales
    const scaleWeights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const shades = [];
    
    scaleWeights.forEach((weight) => {
      let targetLightness;
      
      // Map weight to lightness (0-100)
      // 50 = very light (95%), 500 = base color, 900 = very dark (10%)
      if (weight === 500) {
        // Base color - use exact original hex, don't convert
        shades.push({
          weight,
          hex: baseColor.hex,
          name: `${baseColor.name || 'Color'} ${weight}`,
        });
        return; // Skip the conversion for weight 500
      } else if (weight < 500) {
        // Lighter shades (50-400)
        const ratio = weight / 500;
        targetLightness = hsl.l + (95 - hsl.l) * (1 - ratio);
      } else {
        // Darker shades (600-900)
        const ratio = (weight - 500) / 400;
        targetLightness = hsl.l - (hsl.l - 10) * ratio;
      }
      
      // Clamp lightness between 5% and 95%
      targetLightness = Math.max(5, Math.min(95, targetLightness));
      
      // Adjust saturation slightly for very light/dark shades
      let targetSaturation = hsl.s;
      if (weight <= 200) {
        // Light shades - reduce saturation slightly
        targetSaturation = hsl.s * 0.7;
      } else if (weight >= 800) {
        // Dark shades - reduce saturation slightly
        targetSaturation = hsl.s * 0.8;
      }
      
      const shadeRgb = hslToRgb(hsl.h, targetSaturation, targetLightness);
      const shadeHex = rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
      
      shades.push({
        weight,
        hex: shadeHex,
        name: `${baseColor.name || 'Color'} ${weight}`,
      });
    });
    
    // Add to color scales array
    colorScales.value.push({
      baseColor,
      shades,
    });
  });
  
  // Emit generated data for PDF export
  emit('update-generated-data', {
    variants: variants.value,
    colorScales: colorScales.value,
    darkModeColors: darkModeColors.value,
    semanticSuggestions: semanticSuggestions.value,
  });
};

const addColorScale = (scaleIndex) => {
  const scale = colorScales.value[scaleIndex];
  if (!scale) return;
  
  const newColors = scale.shades.map(shade => ({
    hex: shade.hex,
    name: shade.name,
    role: null,
  }));
  
  const newPalette = {
    ...props.palette,
    colors: [...props.palette.colors, ...newColors],
  };
  
  emit('update-palette', newPalette);
};

const addSingleShade = (shade) => {
  // Check if shade is already in palette
  const shadeInPalette = isShadeInPalette(shade.hex);
  
  if (shadeInPalette) {
    // Remove from palette
    const newPalette = {
      ...props.palette,
      colors: props.palette.colors.filter(color => color.hex.toLowerCase() !== shade.hex.toLowerCase()),
    };
    emit('update-palette', newPalette);
  } else {
    // Add to palette
    const newPalette = {
      ...props.palette,
      colors: [...props.palette.colors, {
        hex: shade.hex,
        name: shade.name,
        role: null,
      }],
    };
    emit('update-palette', newPalette);
  }
};

const getTextColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Calculate relative luminance
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const isShadeInPalette = (shadeHex) => {
  if (!props.palette?.colors) return false;
  return props.palette.colors.some(color => color.hex.toLowerCase() === shadeHex.toLowerCase());
};

const getColumn500Position = () => {
  if (!colorScales.value || colorScales.value.length === 0) return 0;
  const firstScale = colorScales.value[0];
  const column500Index = firstScale.shades.findIndex(shade => shade.weight === 500);
  if (column500Index === -1) return 0;
  const totalColumns = firstScale.shades.length;
  return (column500Index / totalColumns) * 100;
};

// Where the 500 column sits, for its highlight (through v-bind() in <style>)
const hasColumn500 = computed(() => colorScales.value.length > 0 && colorScales.value[0].shades.some((s) => s.weight === 500));
const column500Left = computed(() => `${getColumn500Position()}%`);
const columnWidth = computed(() => `${100 / (colorScales.value[0]?.shades.length || 1)}%`);

const addDarkModeColors = () => {
  const newPalette = {
    ...props.palette,
    colors: [...props.palette.colors, ...darkModeColors.value],
  };
  emit('update-palette', newPalette);
};

// Utility functions - must be defined before functions that use them
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

const calculateLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const calculateContrast = (color1, color2) => {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};


const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
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
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

watch(() => props.palette?.colors, () => {
  validateSemanticColors();
}, { deep: true, immediate: true });

onMounted(() => {
  validateSemanticColors();
});
</script>

<style scoped>
.semantic-card {
  @apply flex flex-col rounded-tile border border-line p-4;
}
.semantic-suggestion {
  @apply mt-2 p-3 rounded-tile border border-line-faint bg-surface-sunken;
}
.scale-column-500 {
  @apply absolute top-8 bottom-0 rounded-field bg-accent-subtle pointer-events-none;
  left: v-bind(column500Left);
  width: v-bind(columnWidth);
}
.scale-500-label {
  @apply w-full py-1 rounded-t-control bg-accent text-center text-xs font-semibold text-ink-on-accent;
}
.shade-cell {
  @apply relative flex flex-col items-center justify-center w-full h-16 cursor-pointer transition-opacity hover:opacity-90;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus;
}
.shade-in-palette {
  box-shadow: inset 0 0 0 3px var(--tc-accent);
}
.shade-dot {
  @apply absolute top-1 right-1 w-3 h-3 rounded-pill bg-accent border-2 border-solid border-surface-raised shadow-control;
}
.dark-stage {
  @apply w-full p-6 rounded-tile bg-surface;
}
</style>
