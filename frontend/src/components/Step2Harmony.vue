<template>
  <div>
    <div class="flex gap-6 mb-8">
    <!-- Main Content Area -->
    <div class="flex-1">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Analyze Harmony</h2>
        <p class="text-gray-600">
          Review color relationships, harmony patterns, and palette metrics.
        </p>
      </div>

      <!-- Your Brand Colors -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Brand Colors</h3>
        <div class="flex flex-wrap gap-6">
          <div
            v-for="(color, index) in palette.colors"
            :key="index"
            class="flex flex-col items-center"
          >
            <div
              class="w-16 h-16 rounded-full shadow-md border-2 border-white mb-2"
              :style="{ backgroundColor: color.hex }"
            ></div>
            <div class="font-mono text-xs text-gray-700 mb-1">{{ color.hex }}</div>
            <div class="flex items-center gap-1">
              <button
                @click="copyToClipboard(color.hex)"
                class="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy hex code"
              >
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                @click="removeColor(index)"
                class="p-1 hover:bg-red-50 rounded transition-colors text-red-600"
                title="Delete color"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights Sidebar -->
    <div class="w-96 bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">INSIGHTS</h3>

      <!-- Harmony Check Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-900">Harmony Check</h4>
          <button
            @click="toggleHarmonyCheckCollapse"
            class="text-xs text-gray-600 hover:text-gray-900"
          >
            {{ harmonyCheckCollapsed ? 'Expand' : 'Collapse' }}
          </button>
        </div>
        <p class="text-xs text-gray-600 mb-4">
          Scan for colors that don't fit your palette's harmony
        </p>

        <div v-if="!harmonyCheckCollapsed">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-xs text-gray-600">Analyzing...</p>
          </div>

          <div v-else-if="analysis && analysis.problematicColors && analysis.problematicColors.length > 0">
            <!-- Alert -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-sm font-medium text-yellow-900">
                    {{ analysis.problematicColors.length }} color{{ analysis.problematicColors.length > 1 ? 's' : '' }} could be balanced
                  </span>
                </div>
                <button
                  @click="applyAllFixes"
                  class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Apply All Fixes
                </button>
              </div>
            </div>

            <!-- Color Comparisons -->
            <div class="space-y-4">
              <div
                v-for="(item, index) in analysis.problematicColors"
                :key="index"
                class="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div class="flex items-center gap-4 mb-3">
                  <div class="flex-1">
                    <div class="text-xs text-gray-600 mb-2">Current</div>
                    <div
                      class="w-full h-12 rounded-lg shadow-sm mb-1"
                      :style="{ backgroundColor: item.color }"
                    ></div>
                    <div class="font-mono text-xs text-gray-700">{{ item.color }}</div>
                  </div>
                  <div class="flex-1">
                    <div class="text-xs text-gray-600 mb-2">Suggested</div>
                    <div
                      class="w-full h-12 rounded-lg shadow-sm mb-1"
                      :style="{ backgroundColor: item.fixes[0] || item.color }"
                    ></div>
                    <div class="font-mono text-xs text-gray-700">{{ item.fixes[0] || item.color }}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="text-sm font-medium text-gray-900 mb-1">
                    {{ getIssueDescription(item) }}
                  </div>
                  <div class="text-xs text-gray-600">
                    {{ getActionSuggestion(item) }}
                  </div>
                </div>

                <div class="flex items-center gap-2 mb-3">
                  <div class="flex items-center gap-1 text-xs text-green-700">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Contrast-safe
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="dismissIssue(index)"
                    class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    X Dismiss
                  </button>
                  <button
                    @click="applyFix(item.color, item.fixes[0])"
                    class="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <button
              @click="analyzePalette"
              class="w-full mt-4 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Check Again
            </button>
          </div>

          <div v-else-if="analysis && (!analysis.problematicColors || analysis.problematicColors.length === 0)" class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center gap-2 text-green-700 mb-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium">All colors are balanced!</span>
            </div>
            <button
              @click="analyzePalette"
              class="w-full mt-3 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Check Again
            </button>
          </div>
        </div>
      </div>

      <!-- Palette Metrics Section -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-4">Palette Metrics</h4>
        <div class="space-y-4">
          <!-- Cool-Warm -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-xs text-gray-600">Cool</span>
              <span class="text-xs text-gray-600">Warm</span>
            </div>
            <div class="relative h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 rounded-full">
              <div
                class="absolute top-0 h-2 rounded-full bg-white border-2 border-gray-800"
                :style="{ left: `${metrics.coolWarm}%`, width: '4px', transform: 'translateX(-50%)' }"
              ></div>
            </div>
          </div>

          <!-- Muted-Vibrant -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-xs text-gray-600">Muted</span>
              <span class="text-xs text-gray-600">Vibrant</span>
            </div>
            <div class="relative h-2 bg-gradient-to-r from-purple-300 via-pink-400 to-pink-600 rounded-full">
              <div
                class="absolute top-0 h-2 rounded-full bg-white border-2 border-gray-800"
                :style="{ left: `${metrics.mutedVibrant}%`, width: '4px', transform: 'translateX(-50%)' }"
              ></div>
            </div>
          </div>

          <!-- Dark-Light -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-xs text-gray-600">Dark</span>
              <span class="text-xs text-gray-600">Light</span>
            </div>
            <div class="relative h-2 bg-gradient-to-r from-gray-800 via-gray-400 to-gray-200 rounded-full">
              <div
                class="absolute top-0 h-2 rounded-full bg-white border-2 border-gray-800"
                :style="{ left: `${metrics.darkLight}%`, width: '4px', transform: 'translateX(-50%)' }"
              ></div>
            </div>
          </div>

          <!-- Mono-Diverse -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-xs text-gray-600">Mono</span>
              <span class="text-xs text-gray-600">Diverse</span>
            </div>
            <div class="relative h-2 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-800 rounded-full">
              <div
                class="absolute top-0 h-2 rounded-full bg-white border-2 border-gray-800"
                :style="{ left: `${metrics.monoDiverse}%`, width: '4px', transform: 'translateX(-50%)' }"
              ></div>
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
        @click="$emit('next')"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Next: Contrast Testing →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'back', 'next']);

const loading = ref(false);
const analysis = ref(null);
const harmonyCheckCollapsed = ref(false);
const dismissedIssues = ref([]);

const metrics = computed(() => {
  if (!props.palette.colors || props.palette.colors.length === 0) {
    return {
      coolWarm: 50,
      mutedVibrant: 50,
      darkLight: 50,
      monoDiverse: 50,
    };
  }

  const colors = props.palette.colors.map((c) => c.hex);
  
  // Calculate average HSL values
  let totalHue = 0;
  let totalSaturation = 0;
  let totalLightness = 0;
  let colorCount = 0;

  colors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      totalHue += hsl.h;
      totalSaturation += hsl.s;
      totalLightness += hsl.l;
      colorCount++;
    }
  });

  if (colorCount === 0) {
    return {
      coolWarm: 50,
      mutedVibrant: 50,
      darkLight: 50,
      monoDiverse: 50,
    };
  }

  const avgHue = totalHue / colorCount;
  const avgSaturation = totalSaturation / colorCount;
  const avgLightness = totalLightness / colorCount;

  // Cool-Warm: Based on hue where 0-100 scale: 0 = cool (blue), 100 = warm (red/orange)
  // Blue is around 240°, warm colors are around 0-60°
  // Map: 0° (red) = 100, 120° (green) = 50, 240° (blue) = 0
  let coolWarm;
  if (avgHue <= 120) {
    // Warm to neutral: 0° (red) = 100, 60° (yellow) = 100, 120° (green) = 50
    coolWarm = 100 - (avgHue / 120) * 50;
  } else {
    // Neutral to cool: 120° (green) = 50, 240° (blue) = 0, 360° (red) = 100
    coolWarm = 50 - ((avgHue - 120) / 120) * 50;
    if (avgHue > 240) {
      // Beyond blue, wrapping back to warm
      coolWarm = ((avgHue - 240) / 120) * 100;
    }
  }
  coolWarm = Math.max(0, Math.min(100, coolWarm));

  // Muted-Vibrant: Based on saturation
  const mutedVibrant = avgSaturation;

  // Dark-Light: Based on lightness
  const darkLight = avgLightness;

  // Mono-Diverse: Based on hue variance
  const hueVariances = colors.map((hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return Math.abs(hsl.h - avgHue);
    }
    return 0;
  });
  const avgHueVariance = hueVariances.reduce((a, b) => a + b, 0) / hueVariances.length;
  const monoDiverse = Math.min(100, (avgHueVariance / 60) * 100);

  return {
    coolWarm: Math.round(coolWarm),
    mutedVibrant: Math.round(mutedVibrant),
    darkLight: Math.round(darkLight),
    monoDiverse: Math.round(monoDiverse),
  };
});

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

const analyzePalette = async () => {
  if (props.palette.colors.length === 0) return;

  loading.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/palettes/analyze', {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    analysis.value = response.data;
    dismissedIssues.value = [];
  } catch (error) {
    console.error('Error analyzing palette:', error);
    alert('Error analyzing palette. Please try again.');
  } finally {
    loading.value = false;
  }
};

const applyFix = (oldColor, newColor) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c) =>
      c.hex === oldColor ? { ...c, hex: newColor } : c
    ),
  };
  emit('update-palette', newPalette);
  analyzePalette();
};

const applyAllFixes = () => {
  if (!analysis.value || !analysis.value.problematicColors) return;

  let newPalette = { ...props.palette };
  analysis.value.problematicColors.forEach((item) => {
    if (item.fixes && item.fixes.length > 0) {
      newPalette.colors = newPalette.colors.map((c) =>
        c.hex === item.color ? { ...c, hex: item.fixes[0] } : c
      );
    }
  });
  emit('update-palette', newPalette);
  analyzePalette();
};

const dismissIssue = (index) => {
  if (!analysis.value || !analysis.value.problematicColors) return;
  const color = analysis.value.problematicColors[index].color;
  dismissedIssues.value.push(color);
  // Filter out dismissed issues
  analysis.value.problematicColors = analysis.value.problematicColors.filter(
    (_, i) => i !== index
  );
};

const getIssueDescription = (item) => {
  if (item.analysis.isTooDark) return 'Too dark compared to palette';
  if (item.analysis.isTooBright) return 'Too bright compared to palette';
  if (item.analysis.isTooVibrant) return 'Too vibrant compared to palette';
  return 'Color harmony issue';
};

const getActionSuggestion = (item) => {
  if (item.analysis.isTooDark) return 'Adjust brightness to harmonize with the palette';
  if (item.analysis.isTooBright) return 'Reduce brightness to harmonize with the palette';
  if (item.analysis.isTooVibrant) return 'Reduce saturation to harmonize with the palette';
  return 'Adjust color to harmonize with the palette';
};

const toggleHarmonyCheckCollapse = () => {
  harmonyCheckCollapsed.value = !harmonyCheckCollapsed.value;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const removeColor = (index) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.filter((_, i) => i !== index),
  };
  emit('update-palette', newPalette);
  analyzePalette();
};

onMounted(() => {
  analyzePalette();
});

watch(() => props.palette.colors, analyzePalette, { deep: true });
</script>
