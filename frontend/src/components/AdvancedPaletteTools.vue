<template>
  <div class="space-y-6">
    <!-- Color Variants Generator -->
    <div 
      class="rounded-lg shadow-sm border p-6 transition-colors duration-300"
      :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
    >
      <h3 
        class="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300"
        :class="isDarkMode ? 'text-white' : 'text-gray-900'"
      >
        <span 
          class="material-symbols-outlined text-xl transition-colors duration-300"
          :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
        >
          auto_fix_high
        </span>
        Color Variants
      </h3>
      <p 
        class="text-sm mb-4 transition-colors duration-300"
        :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
      >
        Generate tints, shades, and dark variants for each color
      </p>
      <button
        v-if="variants.length === 0"
        @click.prevent="generateVariants"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Generate Variants
      </button>
      
      <div v-if="variants.length > 0" class="mt-4">
        <p 
          class="text-sm mb-2 transition-colors duration-300"
          :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
        >
          {{ variants.length }} variants generated
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="(variant, index) in variants"
            :key="`variant-${variant.hex}-${index}-${variant.type}`"
            class="cursor-pointer group"
            @click="addVariant(variant)"
          >
            <div
              class="w-full h-20 rounded-lg shadow-md mb-2 border transition-colors duration-300"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              :style="{ backgroundColor: variant.hex }"
            ></div>
            <div 
              class="text-xs text-center transition-colors duration-300"
              :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
            >
              {{ variant.type }}
            </div>
            <div 
              class="text-xs text-center font-mono transition-colors duration-300"
              :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
            >
              {{ variant.hex }}
            </div>
          </div>
        </div>
      </div>
      <div 
        v-else-if="variants.length === 0 && palette && palette.colors && palette.colors.length > 0" 
        class="mt-4 text-sm transition-colors duration-300"
        :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
      >
        Click "Generate Variants" to create tints and shades
      </div>
    </div>

    <!-- Semantic Color Validation -->
    <div 
      class="rounded-lg shadow-sm border p-6 transition-colors duration-300"
      :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
    >
      <h3 
        class="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300"
        :class="isDarkMode ? 'text-white' : 'text-gray-900'"
      >
        <span 
          class="material-symbols-outlined text-xl transition-colors duration-300"
          :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
        >
          label
        </span>
        Semantic Color Validation
      </h3>
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="semantic in semanticTypes"
          :key="semantic.type"
          class="border rounded-lg p-4 transition-colors duration-300"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-lg" :style="{ color: semantic.color }">
              {{ semantic.icon }}
            </span>
            <span 
              class="font-semibold transition-colors duration-300"
              :class="isDarkMode ? 'text-white' : 'text-gray-900'"
            >
              {{ semantic.label }}
            </span>
          </div>
          <div v-if="semanticMatches[semantic.type]" class="text-sm text-green-600 flex items-center gap-1 mb-2">
            <span class="material-symbols-outlined text-sm">check</span>
            {{ semanticMatches[semantic.type].name || semanticMatches[semantic.type].hex }}
          </div>
          <div v-else class="mb-2">
            <div 
              class="text-sm mb-2 transition-colors duration-300"
              :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
            >
              No suitable color found
            </div>
            <button
              @click="generateSemanticSuggestion(semantic.type)"
              class="text-xs px-2 py-1 rounded hover:bg-indigo-100 transition-colors duration-300"
              :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-indigo-50 text-indigo-700'"
            >
              Suggest Color
            </button>
          </div>
          
          <!-- Show suggestion if available -->
          <div 
            v-if="semanticSuggestions[semantic.type]" 
            class="mt-2 p-2 rounded border transition-colors duration-300"
            :class="isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-12 h-12 rounded border transition-colors duration-300"
                :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                :style="{ backgroundColor: semanticSuggestions[semantic.type].hex }"
              ></div>
              <div class="flex-1">
                <div 
                  class="text-xs font-mono transition-colors duration-300"
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  {{ semanticSuggestions[semantic.type].hex }}
                </div>
                <div 
                  class="text-xs transition-colors duration-300"
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                >
                  {{ semanticSuggestions[semantic.type].name }}
                </div>
              </div>
              <button
                @click="addSemanticSuggestion(semantic.type)"
                class="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            <button
              @click="generateSemanticSuggestion(semantic.type)"
              class="text-xs transition-colors duration-300"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'"
            >
              Generate Another
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Scale Generator -->
    <div 
      class="rounded-lg shadow-sm border p-6 transition-colors duration-300"
      :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
    >
      <h3 
        class="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300"
        :class="isDarkMode ? 'text-white' : 'text-gray-900'"
      >
        <span 
          class="material-symbols-outlined text-xl transition-colors duration-300"
          :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
        >
          format_color_fill
        </span>
        Color Scale Generator
      </h3>
      <p 
        class="text-sm mb-4 transition-colors duration-300"
        :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
      >
        Generate complete color scales (50-900) for all colors in your palette, similar to Tailwind CSS
      </p>
      <button
        v-if="colorScales.length === 0"
        @click.prevent="generateColorScale"
        :disabled="!palette?.colors || palette.colors.length === 0"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Generate Color Scales
      </button>
      
      <div v-if="colorScales.length > 0" class="mt-4 relative">
        <p 
          class="text-sm mb-2 transition-colors duration-300"
          :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
        >
          {{ colorScales.length }} color scale(s) generated
        </p>
        <!-- Transparent blue background for the 500 column - spans full height -->
        <div 
          v-if="colorScales.length > 0 && colorScales[0].shades.some(s => s.weight === 500)"
          class="absolute pointer-events-none"
          :style="{
            left: getColumn500Position() + '%',
            width: (100 / (colorScales[0]?.shades.length || 1)) + '%',
            top: '2rem',
            bottom: '0',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '0.5rem'
          }"
        ></div>
        <div
          v-for="(scale, scaleIndex) in colorScales"
          :key="scaleIndex"
          class="mb-6 relative"
        >
          <div class="mb-2">
            <div 
              class="text-sm font-semibold transition-colors duration-300"
              :class="isDarkMode ? 'text-white' : 'text-gray-900'"
            >
              {{ scale.baseColor.name || scale.baseColor.hex }}
            </div>
          </div>
          <div class="relative mb-8">
            <!-- Title above the 500 column - only show on first scale -->
            <div v-if="scaleIndex === 0 && scale.shades.some(s => s.weight === 500)" class="absolute left-0 right-0 flex z-10" style="bottom: calc(100% - 1px);">
              <div
                v-for="(shade, shadeIndex) in scale.shades"
                :key="shadeIndex"
                class="flex-1 relative"
              >
                <div v-if="shade.weight === 500" class="w-full">
                  <div class="bg-indigo-600 text-white text-xs font-semibold py-1 rounded-b-none rounded-t text-center w-full">
                    This color is in your palette
                  </div>
                </div>
              </div>
            </div>
            <div 
              class="flex rounded-lg border overflow-hidden transition-colors duration-300"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <div
                v-for="(shade, shadeIndex) in scale.shades"
                :key="shadeIndex"
                class="flex-1 h-16 flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative"
                :style="{ 
                  backgroundColor: shade.hex,
                  boxShadow: isShadeInPalette(shade.hex) ? 'inset 0 0 0 3px #4f46e5' : 'none'
                }"
                @click="addSingleShade(shade)"
                :title="`${shade.weight}: ${shade.hex}`"
              >
                <div class="text-xs font-semibold" :style="getTextColor(shade.hex)">{{ shade.weight }}</div>
                <div class="text-xs font-mono mt-1" :style="getTextColor(shade.hex)">{{ shade.hex }}</div>
                <div v-if="isShadeInPalette(shade.hex)" class="absolute top-1 right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dark Mode Generator -->
    <div 
      class="rounded-lg shadow-sm border p-6 transition-colors duration-300"
      :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
    >
      <h3 
        class="text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300"
        :class="isDarkMode ? 'text-white' : 'text-gray-900'"
      >
        <span 
          class="material-symbols-outlined text-xl transition-colors duration-300"
          :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
        >
          dark_mode
        </span>
        Dark Mode Palette Generator
      </h3>
      <p 
        class="text-sm mb-4 transition-colors duration-300"
        :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
      >
        Generate dark mode variants optimized for dark backgrounds
      </p>
      <button
        v-if="darkModeColors.length === 0"
        @click.prevent="generateDarkModePalette"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Generate Dark Mode Variants
      </button>
      
      <div v-if="darkModeColors.length > 0" class="mt-4">
        <div class="bg-gray-900 p-6 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="(color, index) in darkModeColors"
              :key="`dark-${color.hex}-${index}`"
            >
              <div
                class="w-full h-16 rounded-lg shadow-md mb-2 border border-gray-700"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <div class="text-xs text-gray-400 font-mono text-center">{{ color.hex }}</div>
              <div v-if="color.name" class="text-xs text-gray-500 text-center">{{ color.name }}</div>
            </div>
          </div>
        </div>
        <button
          @click="addDarkModeColors"
          class="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Add Dark Mode Colors to Palette
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

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
      alert('Palette data not available');
      return;
    }
    
    if (!props.palette.colors || props.palette.colors.length === 0) {
      console.warn('No colors in palette');
      alert('Please add colors to your palette first');
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
    alert('Error generating variants: ' + error.message);
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
    alert('Please add colors to your palette first');
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
      alert('Please add colors to your palette first');
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
    alert('Error generating dark mode palette: ' + error.message);
  }
};

// Color scale generator (50-900 shades) - generates for all colors
const generateColorScale = () => {
  if (!props.palette?.colors || props.palette.colors.length === 0) {
    alert('Please add colors to your palette first');
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
  if (!rgb) return { color: '#000000' };
  
  // Calculate relative luminance
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  return { color: luminance > 0.5 ? '#000000' : '#FFFFFF' };
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
  
  // Dark mode detection
  const updateDarkMode = () => {
    const wasDark = isDarkMode.value;
    isDarkMode.value = document.documentElement.classList.contains('dark');
    if (wasDark !== isDarkMode.value) {
      nextTick(() => {});
    }
  };
  
  const darkModeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateDarkMode();
      }
    });
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true
  });
  
  updateDarkMode();
  
  const darkModeInterval = setInterval(updateDarkMode, 50);
  
  onBeforeUnmount(() => {
    darkModeObserver.disconnect();
    clearInterval(darkModeInterval);
  });
});
</script>

