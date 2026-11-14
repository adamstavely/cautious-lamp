<template>
  <div>
    <!-- Palette quality score: opens the breakdown -->
    <button type="button" class="score-trigger" aria-haspopup="dialog" @click="showModal = true">
      <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">show_chart</span>
      <span class="flex flex-col text-left">
        <span class="text-xs font-medium text-ink-secondary">Palette quality score</span>
        <span class="text-xs text-ink-muted">{{ metCriteria }}/{{ totalCriteria }} criteria met</span>
      </span>
      <UiChip :tone="scoreTone">{{ healthScore }}</UiChip>
    </button>

    <UiDialog v-model:open="showModal" title="Palette quality score" size="sm">
      <p class="text-sm text-ink-secondary mb-5">
        Your palette quality score measures how complete and accessible your color palette is.
      </p>
      <ul class="flex flex-col gap-4">
        <li v-for="criterion in criteria" :key="criterion.title" class="flex items-start gap-3">
          <span
            class="material-symbols-outlined text-xl flex-shrink-0"
            :class="criterion.met ? 'text-success' : 'text-danger'"
            :aria-label="criterion.met ? 'Met' : 'Not met'"
            role="img"
          >{{ criterion.met ? 'check_circle' : 'cancel' }}</span>
          <div class="flex-1">
            <p class="font-semibold text-ink-strong">{{ criterion.title }}</p>
            <p class="text-sm mt-0.5 text-ink-secondary">{{ criterion.detail }}</p>
          </div>
        </li>
      </ul>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import apiClient from '../services/api.js';
import { UiChip, UiDialog } from './ui';

/**
 * A compact "Palette quality score" button for the palette builder; it opens
 * a dialog listing the six criteria and whether the palette meets each.
 */
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
  
  // Check for semantic colors (success, error, warning, info)
  const semanticRoles = ['success', 'error', 'warning', 'info'];
  const semanticColorsInPalette = colors.filter((c) => semanticRoles.includes(c.role));
  const semanticSuggestions = props.generatedData?.semanticSuggestions || {};
  const hasAllSemanticColors = semanticRoles.every((role) => {
    // Check if role exists in palette colors
    const inPalette = semanticColorsInPalette.some((c) => c.role === role);
    // Or check if role exists in generated suggestions
    const inSuggestions = semanticSuggestions[role] !== undefined;
    return inPalette || inSuggestions;
  });
  
  return {
    hasThreePlusColors: colorCount >= 3,
    hasLightNeutral,
    hasDarkNeutral,
    contrastCoverage,
    everyColorHasAccessiblePairing,
    colorsWithoutPairing,
    passingPairings,
    hasFourPlusPairings,
    hasAllSemanticColors,
  };
});

const totalCriteria = 6;
const metCriteria = computed(() => {
  let count = 0;
  if (healthMetrics.value.hasThreePlusColors) count++;
  if (healthMetrics.value.hasLightNeutral) count++;
  if (healthMetrics.value.hasDarkNeutral) count++;
  if (healthMetrics.value.everyColorHasAccessiblePairing) count++;
  if (healthMetrics.value.hasFourPlusPairings) count++;
  if (healthMetrics.value.hasAllSemanticColors) count++;
  return count;
});

const missingSemanticColors = computed(() => {
  const semanticRoles = ['success', 'error', 'warning', 'info'];
  const colors = props.palette?.colors || [];
  const semanticColorsInPalette = colors.filter((c) => semanticRoles.includes(c.role));
  const semanticSuggestions = props.generatedData?.semanticSuggestions || {};
  const definedRoles = semanticRoles.filter((role) => {
    return semanticColorsInPalette.some((c) => c.role === role) || semanticSuggestions[role] !== undefined;
  });
  return 4 - definedRoles.length;
});

const healthScore = computed(() => {
  try {
    return Math.round((metCriteria.value / totalCriteria) * 100);
  } catch (error) {
    console.error('Error calculating palette quality score:', error);
    return 0;
  }
});

const scoreTone = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
});

const plural = (n, word) => `${n} ${word}${n !== 1 ? 's' : ''}`;

const criteria = computed(() => {
  const m = healthMetrics.value;
  const colorCount = (props.palette?.colors || []).length;
  let pairingDetail;
  if (colorCount < 2) pairingDetail = 'Requires at least 2 colors';
  else if (m.everyColorHasAccessiblePairing) pairingDetail = 'All colors have accessible pairings';
  else pairingDetail = `${plural(m.colorsWithoutPairing.length, 'color')} without accessible pairings`;
  return [
    { title: 'Add 3+ colors', met: m.hasThreePlusColors, detail: `${plural(colorCount, 'color')} added` },
    { title: 'Add a light neutral', met: m.hasLightNeutral, detail: 'For backgrounds and light UI elements' },
    { title: 'Add a dark neutral', met: m.hasDarkNeutral, detail: 'For text and dark UI elements' },
    { title: 'Every color has at least 1 accessible pairing', met: m.everyColorHasAccessiblePairing, detail: pairingDetail },
    { title: 'Select 4+ contrast pairings', met: m.hasFourPlusPairings, detail: `${m.passingPairings} pairings selected` },
    {
      title: 'Define 4 semantic colors',
      met: m.hasAllSemanticColors,
      detail: m.hasAllSemanticColors
        ? 'Success, Error, Warning, and Info colors defined'
        : `${plural(missingSemanticColors.value, 'semantic color')} missing`,
    },
  ];
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
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/analyze`, {
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

<style scoped>
.score-trigger {
  @apply inline-flex items-center gap-3 rounded-tile border border-line bg-surface-control px-3 py-2 transition-colors;
  @apply hover:border-line-control-hover hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
