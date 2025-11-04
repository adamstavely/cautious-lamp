<template>
  <div>
    <!-- Palette Quality Score Widget (not sticky, inline) -->
    <button
      @click="showModal = true"
      class="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 hover:shadow-md transition-shadow flex items-center gap-3"
    >
      <div class="flex items-center justify-center w-10 h-10 rounded-full" :class="healthScoreClass">
        <span class="text-lg font-bold text-white">{{ healthScore }}</span>
      </div>
      <div class="text-left">
        <div class="text-xs font-medium text-gray-600">Palette Quality Score</div>
        <div class="text-xs text-gray-500">{{ metCriteria }}/{{ totalCriteria }} criteria met</div>
      </div>
    </button>

  <!-- Palette Quality Score Modal -->
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    @click.self="showModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Palette Quality Score</h2>
          <p class="text-sm text-gray-600 mt-1">
            Your palette quality score measures how complete and accessible your color palette is.
          </p>
        </div>
        <button
          @click="showModal = false"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Criteria List -->
      <div class="p-6">
        <div class="space-y-4">
          <!-- Criterion 1: 3+ Colors -->
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="healthMetrics.hasThreePlusColors"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">Add 3+ colors</div>
              <div class="text-sm text-gray-600 mt-0.5">
                {{ (palette?.colors || []).length }} color{{ (palette?.colors || []).length !== 1 ? 's' : '' }} added
              </div>
            </div>
          </div>

          <!-- Criterion 2: Light Neutral -->
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="healthMetrics.hasLightNeutral"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">Add a light neutral</div>
              <div class="text-sm text-gray-600 mt-0.5">
                For backgrounds and light UI elements
              </div>
            </div>
          </div>

          <!-- Criterion 3: Dark Neutral -->
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="healthMetrics.hasDarkNeutral"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">Add a dark neutral</div>
              <div class="text-sm text-gray-600 mt-0.5">
                For text and dark UI elements
              </div>
            </div>
          </div>

          <!-- Criterion 4: Every Color Has Accessible Pairing -->
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="healthMetrics.everyColorHasAccessiblePairing"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">Every color has at least 1 accessible pairing</div>
              <div class="text-sm text-gray-600 mt-0.5">
                <span v-if="(palette?.colors || []).length < 2">
                  Requires at least 2 colors
                </span>
                <span v-else-if="healthMetrics.everyColorHasAccessiblePairing">
                  All colors have accessible pairings
                </span>
                <span v-else>
                  {{ healthMetrics.colorsWithoutPairing.length }} color{{ healthMetrics.colorsWithoutPairing.length !== 1 ? 's' : '' }} without accessible pairings
                </span>
              </div>
            </div>
          </div>

          <!-- Criterion 5: Contrast Pairings -->
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="healthMetrics.hasFourPlusPairings"
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">Select 4+ contrast pairings</div>
              <div class="text-sm text-gray-600 mt-0.5">
                {{ healthMetrics.passingPairings }} pairings selected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const showModal = ref(false);
const contrastResults = ref([]);

// Calculate health metrics
const healthMetrics = computed(() => {
  const colors = props.palette?.colors || [];
  const colorCount = colors.length;
  
  // Check for neutrals
  const hasLightNeutral = colors.some((c) => {
    if (!c || !c.hex) return false;
    const hsl = hexToHsl(c.hex);
    return hsl.s < 20 && hsl.l > 70;
  });
  
  const hasDarkNeutral = colors.some((c) => {
    if (!c || !c.hex) return false;
    const hsl = hexToHsl(c.hex);
    // Use a more lenient threshold for dark neutrals: low saturation (< 30) and very dark (< 30 lightness)
    // Also check luminance as a fallback for very dark colors that might have slightly higher saturation
    const rgb = hexToRgb(c.hex);
    if (!rgb) return false;
    // WCAG luminance calculation
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return (hsl.s < 30 && hsl.l < 30) || (luminance < 0.2 && hsl.s < 35);
  });
  
  // Check if every color has at least 1 accessible pairing
  const colorHexes = colors.filter((c) => c && c.hex).map((c) => c.hex.toLowerCase());
  const passingPairs = contrastResults.value.filter((r) => r && r.passesAA);
  const colorsWithAccessiblePairing = new Set();
  
  // Track which colors have at least one accessible pairing
  passingPairs.forEach((pair) => {
    if (pair.color1) colorsWithAccessiblePairing.add(pair.color1.toLowerCase());
    if (pair.color2) colorsWithAccessiblePairing.add(pair.color2.toLowerCase());
  });
  
  // Every color needs at least 1 accessible pairing (requires at least 2 colors)
  const everyColorHasAccessiblePairing = colorCount >= 2 && colorHexes.length > 0 && colorHexes.every((hex) => colorsWithAccessiblePairing.has(hex));
  const colorsWithoutPairing = colorCount >= 2 ? colorHexes.filter((hex) => !colorsWithAccessiblePairing.has(hex)) : [];
  
  // Calculate contrast coverage for display
  const totalPairs = contrastResults.value.length;
  const passingAA = passingPairs.length;
  const contrastCoverage = totalPairs > 0 ? Math.round((passingAA / totalPairs) * 100) : 0;
  
  // Count passing pairings
  const passingPairings = passingAA;
  const hasFourPlusPairings = passingPairings >= 4;
  
  return {
    hasThreePlusColors: colorCount >= 3,
    hasLightNeutral,
    hasDarkNeutral,
    contrastCoverage,
    everyColorHasAccessiblePairing,
    colorsWithoutPairing,
    passingPairings,
    hasFourPlusPairings,
  };
});

const totalCriteria = 5;
const metCriteria = computed(() => {
  let count = 0;
  if (healthMetrics.value.hasThreePlusColors) count++;
  if (healthMetrics.value.hasLightNeutral) count++;
  if (healthMetrics.value.hasDarkNeutral) count++;
  if (healthMetrics.value.everyColorHasAccessiblePairing) count++;
  if (healthMetrics.value.hasFourPlusPairings) count++;
  return count;
});

const healthScore = computed(() => {
  try {
    return Math.round((metCriteria.value / totalCriteria) * 100);
  } catch (error) {
    console.error('Error calculating palette quality score:', error);
    return 0;
  }
});

const healthScoreClass = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
});

// Helper functions
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

const hexToHsl = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

// Fetch contrast results when palette changes
const fetchContrastResults = async () => {
  if (!props.palette?.colors || props.palette.colors.length < 2) {
    contrastResults.value = [];
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/palettes/analyze', {
      colors: props.palette.colors.map((c) => ({ hex: c?.hex || '' })).filter((c) => c.hex),
    });
    contrastResults.value = response.data.contrastResults || [];
  } catch (error) {
    console.error('Error fetching contrast results:', error);
    contrastResults.value = [];
  }
};

watch(() => props.palette?.colors, fetchContrastResults, { immediate: true, deep: true });
</script>

