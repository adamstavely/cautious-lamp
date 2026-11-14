<template>
  <div>
    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <p class="text-ink-secondary mb-8">
      Send your palette through Contrast Testing to make sure every color combo is accessible and readable.
      See the exact scores, check which pairs pass AA/AAA standards, and feel confident your palette works everywhere.
    </p>

    <!-- Current Palette Display -->
    <section v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-ink-strong mb-4">Current palette</h3>
      <ul class="flex flex-wrap gap-3">
        <li v-for="(color, index) in palette.colors" :key="index">
          <UiColorSample class="w-20 h-20 rounded-tile border-2 shadow-control" :color="color.hex" />
          <div class="mt-1 text-center">
            <div class="text-xs font-code text-ink">{{ color.hex }}</div>
            <div v-if="color.role" class="text-xs text-ink-muted capitalize">{{ color.role }}</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Color Blindness Simulation -->
    <section v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-ink-strong mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">visibility</span>
        Color blindness simulation
      </h3>
      <p class="text-sm text-ink-secondary mb-4">
        Preview how your palette appears to users with different types of color blindness. This helps ensure your color choices remain distinguishable for all users.
      </p>
      <div class="mb-4">
        <UiSegmented v-model="selectedBlindnessType" :options="colorBlindnessTypes" aria-label="Color blindness type" />
      </div>
      <ul class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <li v-for="(color, index) in palette.colors" :key="`cb-${color.hex}-${index}`" class="text-center">
          <UiColorSample
            class="w-full h-16 rounded-tile border shadow-control mb-2"
            :color="simulateColorBlindness(color.hex, selectedBlindnessType)"
            role="img"
            :aria-label="`${color.hex} as seen with ${selectedBlindnessType}`"
          />
          <div class="text-xs text-ink-secondary font-code">{{ color.hex }}</div>
          <div v-if="color.name" class="text-xs text-ink-muted">{{ color.name }}</div>
        </li>
      </ul>
    </section>

    <!-- Readability Testing -->
    <section v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-ink-strong mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">text_fields</span>
        Readability testing
      </h3>
      <p class="text-sm text-ink-secondary mb-4">
        Test text readability with different font sizes and weights on each palette color to ensure optimal contrast.
      </p>
      <div class="mb-4 grid grid-cols-2 gap-4">
        <UiSelect v-model="readabilityFontSize" label="Font size" :options="fontSizeOptions" />
        <UiSelect v-model="readabilityFontWeight" label="Font weight" :options="fontWeightOptions" />
      </div>

      <div class="space-y-4">
        <UiColorSample
          v-for="(color, index) in palette.colors"
          :key="`readability-${color.hex}-${index}`"
          class="p-4 rounded-tile border"
          :color="color.hex"
          :text-color="getBestTextColor(color.hex)"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">{{ color.name || color.hex }}</span>
            <UiChip :tone="getReadabilityTone(color.hex)">{{ getReadabilityStatus(color.hex) }}</UiChip>
          </div>
          <p class="readability-sample">
            The quick brown fox jumps over the lazy dog. Readability test for {{ color.name || color.hex }}.
          </p>
        </UiColorSample>
      </div>
    </section>

    <UiSpinner v-if="loading" label="Testing contrast…" />

    <div v-else>
      <section v-if="contrastResults.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-ink-strong flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">compare_arrows</span>
          Contrast pairs
        </h3>

        <!-- Summary (each figure filters the table) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" role="group" aria-label="Filter contrast pairs">
          <button
            v-for="card in filterCards"
            :key="card.value"
            type="button"
            class="filter-card"
            :class="[`filter-card-${card.tone}`, { 'filter-card-on': filter === card.value }]"
            :aria-pressed="filter === card.value"
            @click="filter = card.value"
          >
            <span class="block text-2xl font-bold text-ink-strong">{{ card.count }}</span>
            <span class="block text-sm">{{ card.label }}</span>
          </button>
        </div>

        <!-- Strategic Color Suggestions -->
        <UiPanel
          v-if="strategicSuggestions.length > 0"
          class="mb-8"
          title="Strategic color suggestions"
          description="These colors fix multiple failing pairs. Add them to improve your palette's contrast coverage."
          heading-tag="h3"
        >
          <template #actions>
            <UiButton variant="primary" size="sm" icon="refresh" :loading="loadingStrategic" @click="loadStrategicSuggestions">Refresh suggestions</UiButton>
          </template>

          <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <li v-for="(suggestion, index) in strategicSuggestions" :key="index" class="rounded-tile border border-line-faint bg-surface-raised p-4 hover:border-accent-border transition-colors">
              <div class="flex items-start gap-3 mb-3">
                <div v-if="suggestion.replaceColor" class="flex items-center gap-2">
                  <div class="text-center">
                    <div class="text-xs text-ink-muted mb-1">Before</div>
                    <UiColorSample class="w-16 h-16 rounded-tile border-2 shrink-0" :color="suggestion.replaceColor" />
                    <div class="text-xs font-code text-ink-secondary mt-1">{{ suggestion.replaceColor }}</div>
                  </div>
                  <span class="material-symbols-outlined text-ink-muted" aria-label="becomes">arrow_forward</span>
                  <div class="text-center">
                    <div class="text-xs text-ink-muted mb-1">After</div>
                    <UiColorSample class="w-16 h-16 rounded-tile border-2 shrink-0" :color="suggestion.hex" />
                    <div class="text-xs font-code text-ink-strong font-semibold mt-1">{{ suggestion.hex }}</div>
                  </div>
                </div>
                <UiColorSample v-else class="w-16 h-16 rounded-tile border-2 shrink-0" :color="suggestion.hex" />
                <div class="flex-1 min-w-0">
                  <div class="font-code text-sm font-semibold text-ink-strong mb-1">{{ suggestion.hex }}</div>
                  <div class="text-xs text-ink-secondary capitalize">{{ suggestion.type.replace('-', ' ') }}</div>
                  <div class="text-xs text-accent-text font-medium mt-1">
                    Fixes {{ suggestion.pairsFixed }} pair{{ suggestion.pairsFixed !== 1 ? 's' : '' }}
                  </div>
                  <div v-if="suggestion.replaceColor" class="text-xs text-info font-medium mt-1">Keeps palette size the same</div>
                </div>
              </div>

              <p class="text-xs text-ink mb-3">{{ suggestion.description }}</p>

              <div v-if="suggestion.pairsFixedDetails.length > 0" class="mb-3">
                <div class="text-xs font-medium text-ink-secondary mb-1">Sample pairs fixed:</div>
                <ul class="space-y-1 max-h-24 overflow-y-auto">
                  <li v-for="(pair, idx) in suggestion.pairsFixedDetails.slice(0, 3)" :key="idx" class="text-xs text-ink-muted flex items-center gap-2">
                    <UiSwatch :color="pair.color1" size="sm" />
                    <UiSwatch :color="pair.color2" size="sm" />
                    <span class="font-code">{{ pair.ratio.toFixed(1) }}:1</span>
                  </li>
                </ul>
              </div>

              <UiButton v-if="suggestion.replaceColor" variant="primary" size="sm" class="w-full justify-center" @click="applyReplacement(suggestion.replaceColor, suggestion.hex)">
                Replace color
              </UiButton>
              <UiButton v-else variant="primary" size="sm" icon="add" class="w-full justify-center" @click="applyStrategicColor(suggestion.hex)">
                Add to palette
              </UiButton>
            </li>
          </ul>
        </UiPanel>

        <div class="flex flex-wrap items-end justify-between mb-4 gap-4">
          <!-- Versatility Insights -->
          <div v-if="versatileColors.length > 0" class="flex-1 flex flex-wrap items-center gap-4">
            <h4 class="text-sm font-semibold text-ink-strong">Most versatile colors:</h4>
            <ul class="flex flex-wrap gap-2">
              <li v-for="(color, index) in versatileColors.slice(0, 3)" :key="index" class="flex items-center gap-2 px-3 py-1.5 rounded-control border border-line-faint bg-surface-raised">
                <UiSwatch :color="color.hex" size="sm" />
                <span class="text-xs font-code text-ink-strong">{{ color.hex }}</span>
                <span class="text-xs text-ink-secondary">({{ color.count }} pairs)</span>
              </li>
            </ul>
          </div>

          <div class="w-56 shrink-0">
            <UiSelect v-model="sortBy" label="Sort" :options="sortOptions" />
          </div>
        </div>

        <!-- Contrast Results Table -->
        <UiTable caption="Contrast between each pair of palette colors" bordered>
          <thead>
            <tr>
              <th scope="col">Preview</th>
              <th scope="col">Ratio</th>
              <th scope="col">Standards</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in filteredAndSortedResults" :key="index">
              <td>
                <div class="flex items-center gap-2">
                  <UiColorSample class="flex-1 px-4 py-3 rounded-control border" :color="result.color2" :text-color="result.color1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-medium">Sample Text</span>
                      <div class="flex items-center gap-1">
                        <UiChip v-if="result.passesAALarge" tone="success" title="Passes AA Large Text (3:1)">AA Large</UiChip>
                        <UiChip v-if="result.passesAA" tone="success" title="Passes AA Standard (4.5:1)">AA</UiChip>
                        <UiChip v-if="result.passesAAA" tone="success" title="Passes AAA Standard (7:1)">AAA</UiChip>
                      </div>
                    </div>
                  </UiColorSample>
                  <div class="text-xs text-ink-muted font-code whitespace-nowrap">{{ result.color1 }} on {{ result.color2 }}</div>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="font-code text-sm font-semibold" :class="getRatioClass(result.ratio)">{{ result.ratio }}:1</span>
                  <span class="text-xs text-ink-muted mt-1">{{ getRatioDescription(result.ratio) }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <UiChip :tone="result.passesAA ? 'success' : 'danger'">{{ result.passesAA ? '✓ AA' : '✗ AA' }}</UiChip>
                    <UiChip :tone="result.passesAAA ? 'success' : 'danger'">{{ result.passesAAA ? '✓ AAA' : '✗ AAA' }}</UiChip>
                  </div>
                  <div v-if="result.passesAALarge || result.passesAAALarge" class="text-xs text-ink-muted mt-1">
                    <span v-if="result.passesAALarge">Large text OK</span>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div v-if="!result.passesAA" class="flex flex-col gap-2">
                  <UiButton
                    v-if="!suggestionsLoading[suggestionKey(result)]"
                    variant="primary"
                    size="sm"
                    @click="getContrastSuggestion(result)"
                  >
                    Get fix
                  </UiButton>
                  <UiSpinner v-else label="Loading..." />
                  <div v-if="contrastSuggestions[suggestionKey(result)]" class="mt-2 p-3 rounded-control border border-line-faint bg-surface-sunken min-w-48 whitespace-normal">
                    <p class="text-xs text-ink mb-3 font-medium">{{ contrastSuggestions[suggestionKey(result)].description }}</p>
                    <div
                      v-for="fix in ['color1', 'color2']"
                      :key="fix"
                    >
                      <div v-if="contrastSuggestions[suggestionKey(result)][`${fix}Fix`]" class="flex items-center gap-2 mb-2 p-2 rounded-control bg-surface-raised">
                        <UiColorSample class="w-10 h-10 rounded-control border-2 shrink-0" :color="contrastSuggestions[suggestionKey(result)][`${fix}Fix`]" />
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-code text-ink break-all">{{ contrastSuggestions[suggestionKey(result)][`${fix}Fix`] }}</div>
                          <div class="text-xs text-ink-muted">Add to palette</div>
                        </div>
                        <UiButton
                          variant="primary"
                          size="sm"
                          :aria-label="`Add ${contrastSuggestions[suggestionKey(result)][`${fix}Fix`]} to palette`"
                          @click.stop="applyContrastFix(result[fix], contrastSuggestions[suggestionKey(result)][`${fix}Fix`])"
                        >
                          Add
                        </UiButton>
                      </div>
                    </div>
                    <p
                      v-if="!contrastSuggestions[suggestionKey(result)].color1Fix && !contrastSuggestions[suggestionKey(result)].color2Fix"
                      class="text-xs text-warning italic"
                    >
                      No automatic fix available. Try manually adjusting colors.
                    </p>
                  </div>
                </div>
                <div v-else class="text-xs text-success font-medium">✓ Good contrast</div>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </section>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
      <UiButton icon="arrow_back" @click="$emit('back')">Back</UiButton>
      <UiButton variant="primary" trailing-icon="arrow_forward" @click="$emit('next')">Next: Assign roles</UiButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import apiClient from '../services/api.js';
import InlineNotice from './InlineNotice.vue';
import { UiButton, UiChip, UiPanel, UiSegmented, UiSelect, UiSpinner, UiSwatch, UiTable } from './ui';
import UiColorSample from './ui/UiColorSample.vue';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back', 'next', 'update-palette']);

const loading = ref(false);
const contrastResults = ref([]);
const filter = ref('all');
const sortBy = ref('failing');
const contrastSuggestions = ref({});
const suggestionsLoading = ref({});
const strategicSuggestions = ref([]);
const loadingStrategic = ref(false);
const selectedBlindnessType = ref('protanopia');
const colorBlindnessTypes = [
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];
const readabilityFontSize = ref(14);
const readabilityFontWeight = ref(400);

const totalPairs = computed(() => contrastResults.value.length);
const passingAA = computed(() =>
  contrastResults.value.filter((r) => r.passesAA).length
);
const passingAAA = computed(() =>
  contrastResults.value.filter((r) => r.passesAAA).length
);
const failing = computed(() =>
  contrastResults.value.filter((r) => !r.passesAA).length
);

const filteredAndSortedResults = computed(() => {
  let filtered = contrastResults.value;

  // Apply filter
  if (filter.value === 'passing') {
    filtered = filtered.filter((r) => r.passesAA);
  } else if (filter.value === 'passingAAA') {
    filtered = filtered.filter((r) => r.passesAAA);
  } else if (filter.value === 'failing') {
    filtered = filtered.filter((r) => !r.passesAA);
  }

  // Apply sort
  if (sortBy.value === 'ratio') {
    filtered = [...filtered].sort((a, b) => a.ratio - b.ratio);
  } else if (sortBy.value === 'ratio-desc') {
    filtered = [...filtered].sort((a, b) => b.ratio - a.ratio);
  } else if (sortBy.value === 'passing') {
    filtered = [...filtered].sort((a, b) => {
      if (a.passesAA && !b.passesAA) return -1;
      if (!a.passesAA && b.passesAA) return 1;
      return b.ratio - a.ratio;
    });
  } else if (sortBy.value === 'failing') {
    filtered = [...filtered].sort((a, b) => {
      if (!a.passesAA && b.passesAA) return -1;
      if (a.passesAA && !b.passesAA) return 1;
      return a.ratio - b.ratio;
    });
  }

  return filtered;
});

const versatileColors = computed(() => {
  const colorCounts = {};
  contrastResults.value.forEach((result) => {
    if (result.passesAA) {
      colorCounts[result.color1] = (colorCounts[result.color1] || 0) + 1;
      colorCounts[result.color2] = (colorCounts[result.color2] || 0) + 1;
    }
  });

  return Object.entries(colorCounts)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

const getRatioClass = (ratio) => {
  if (ratio >= 7) return 'text-success';
  if (ratio >= 4.5) return 'text-warning';
  return 'text-danger';
};

const getRatioDescription = (ratio) => {
  if (ratio >= 7) return 'Excellent (AAA)';
  if (ratio >= 4.5) return 'Good (AA)';
  if (ratio >= 3) return 'Large text only';
  return 'Insufficient';
};

const getContrastSuggestion = async (result) => {
  const key = `${result.color1}-${result.color2}`;
  
  // Clear any existing suggestion first
  delete contrastSuggestions.value[key];
  
  // Use Vue's reactivity properly
  suggestionsLoading.value = { ...suggestionsLoading.value, [key]: true };
  
  try {
    console.log('Requesting contrast fix for:', { color1: result.color1, color2: result.color2 });
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/contrast-fix`, {
      color1: result.color1,
      color2: result.color2,
      targetRatio: 4.5,
    });
    console.log('Contrast fix response:', response.data);
    
    // Filter out suggested colors that already exist in the palette
    const paletteColors = props.palette.colors.map((c) => c.hex.toLowerCase());
    const suggestion = response.data || {};
    
    // Check if suggested colors already exist
    const color1FixExists = suggestion.color1Fix && paletteColors.includes(suggestion.color1Fix.toLowerCase());
    const color2FixExists = suggestion.color2Fix && paletteColors.includes(suggestion.color2Fix.toLowerCase());
    
    // Only store suggestion if at least one fix doesn't exist
    if (color1FixExists && color2FixExists) {
      // Both colors already exist - no need to suggest
      contrastSuggestions.value = {
        ...contrastSuggestions.value,
        [key]: {
          description: 'Both suggested colors are already in your palette. Try adjusting the existing colors or adding different variations.',
        },
      };
    } else {
      // Filter out existing colors from suggestions
      const filteredSuggestion = {
        ...suggestion,
        color1Fix: color1FixExists ? undefined : suggestion.color1Fix,
        color2Fix: color2FixExists ? undefined : suggestion.color2Fix,
      };
      
      contrastSuggestions.value = {
        ...contrastSuggestions.value,
        [key]: filteredSuggestion,
      };
    }
    
    console.log('Stored suggestion:', contrastSuggestions.value[key]);
  } catch (error) {
    console.error('Error getting contrast suggestion:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Store error message so user can see it
    contrastSuggestions.value = {
      ...contrastSuggestions.value,
      [key]: {
        description: `Error: ${error.response?.data?.message || error.message || 'Failed to get suggestion. Check console for details.'}`,
      },
    };
    
    showNotice(`Failed to get contrast fix: ${error.message || 'Unknown error'}. Check console for details.`, 'error');
  } finally {
    suggestionsLoading.value = { ...suggestionsLoading.value, [key]: false };
  }
};

const applyContrastFix = (oldColor, newColor) => {
  console.log('Applying contrast fix:', { oldColor, newColor });
  
  // Set flag to prevent watcher loop
  isApplyingChange = true;
  
  // Normalize hex colors for comparison
  const normalizeHex = (hex) => hex.toLowerCase().trim();
  const normalizedNewColor = normalizeHex(newColor);
  
  // Check if the new color already exists in the palette
  const colorExists = props.palette.colors.some((c) => normalizeHex(c.hex) === normalizedNewColor);
  
  if (colorExists) {
    console.warn(`Color ${newColor} is already in your palette`);
    showNotice(`Color ${newColor} is already in your palette`, 'warning');
    isApplyingChange = false;
    return;
  }
  
  // Add the new color to the palette instead of replacing
  const newPalette = {
    ...props.palette,
    colors: [
      ...props.palette.colors,
      {
        hex: normalizedNewColor.toUpperCase().startsWith('#') ? normalizedNewColor.toUpperCase() : `#${normalizedNewColor.toUpperCase()}`,
        role: '', // Let user assign role later
      },
    ],
  };
  
  console.log('Adding color to palette. New palette:', newPalette);
  
  // Clear suggestions BEFORE updating to prevent loops
  contrastSuggestions.value = {};
  strategicSuggestions.value = [];
  
  emit('update-palette', newPalette);
  
  // Manually trigger contrast test after a delay to let the update settle
  setTimeout(() => {
    isApplyingChange = false;
    testContrast();
  }, 300);
};

const testContrast = async () => {
  if (props.palette.colors.length === 0) {
    contrastResults.value = [];
    strategicSuggestions.value = [];
    return;
  }

  loading.value = true;
  try {
    console.log('Testing contrast for palette:', props.palette.colors.map((c) => c.hex));
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/analyze`, {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    
    console.log('Contrast results received:', response.data.contrastResults?.length || 0, 'pairs');
    contrastResults.value = response.data.contrastResults || [];
    
    // Clear all suggestions when palette changes - they may be outdated
    contrastSuggestions.value = {};
    
    // Don't auto-load strategic suggestions here - let user click refresh button
    // This prevents loops
  } catch (error) {
    console.error('Error testing contrast:', error);
    showNotice('Error testing contrast. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const loadStrategicSuggestions = async () => {
  if (props.palette.colors.length === 0 || contrastResults.value.length === 0) {
    strategicSuggestions.value = [];
    return;
  }
  
  // Prevent loading if already loading
  if (loadingStrategic.value) return;
  
  loadingStrategic.value = true;
  try {
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/strategic-colors`, {
      colors: props.palette.colors.map((c) => c.hex),
      contrastResults: contrastResults.value,
      maxSuggestions: 5,
    });
    
    console.log('Strategic suggestions received:', response.data);
    
    // Filter out colors that already exist in palette
    const paletteColors = props.palette.colors.map((c) => c.hex.toLowerCase());
    strategicSuggestions.value = (response.data || []).filter(
      (suggestion) => {
        // For replacements, always show (they're replacing existing colors)
        if (suggestion.replaceColor) return true;
        // For additions, filter out if already exists
        return !paletteColors.includes(suggestion.hex.toLowerCase());
      }
    );
  } catch (error) {
    console.error('Error loading strategic suggestions:', error);
    strategicSuggestions.value = [];
  } finally {
    loadingStrategic.value = false;
  }
};

const applyStrategicColor = (colorHex) => {
  console.log('Applying strategic color:', colorHex);
  
  // Clear suggestions BEFORE updating to prevent loops
  contrastSuggestions.value = {};
  strategicSuggestions.value = [];
  
  applyContrastFix(null, colorHex);
};

const applyReplacement = (oldColor, newColor) => {
  console.log('Applying replacement:', { oldColor, newColor });
  
  // Set flag to prevent watcher loop
  isApplyingChange = true;
  
  // Normalize hex colors for comparison (remove # and convert to lowercase)
  const normalizeHex = (hex) => hex.toLowerCase().trim().replace(/^#/, '');
  const normalizedOldColor = normalizeHex(oldColor);
  
  // Ensure new color has # prefix
  const normalizedNewColor = normalizeHex(newColor);
  const newColorWithHash = normalizedNewColor.startsWith('#') 
    ? normalizedNewColor.toUpperCase() 
    : `#${normalizedNewColor.toUpperCase()}`;
  
  // Replace the color in the palette
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c) => {
      const normalizedC = normalizeHex(c.hex);
      if (normalizedC === normalizedOldColor) {
        return {
          ...c,
          hex: newColorWithHash,
        };
      }
      return c;
    }),
  };
  
  console.log('Replacing color in palette. New palette:', newPalette);
  
  // Clear suggestions BEFORE updating to prevent loops
  contrastSuggestions.value = {};
  strategicSuggestions.value = [];
  
  emit('update-palette', newPalette);
  
  // Manually trigger contrast test after a delay to let the update settle
  setTimeout(() => {
    isApplyingChange = false;
    testContrast();
  }, 300);
};

onMounted(() => {
  testContrast();
});

// Color blindness simulation utilities
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

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const simulateColorBlindness = (hex, type) => {
  if (type === 'normal') return hex;
  
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Simplified color blindness simulation matrices
  switch (type) {
    case 'protanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.567 + rgb.g * 0.433),
        Math.round(rgb.r * 0.558 + rgb.g * 0.442),
        Math.round(rgb.r * 0 + rgb.g * 0.242 + rgb.b * 0.758)
      );
    case 'deuteranopia':
      return rgbToHex(
        Math.round(rgb.r * 0.625 + rgb.g * 0.375),
        Math.round(rgb.r * 0.7 + rgb.g * 0.3),
        Math.round(rgb.r * 0 + rgb.g * 0.3 + rgb.b * 0.7)
      );
    case 'tritanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.95 + rgb.g * 0.05),
        Math.round(rgb.r * 0 + rgb.g * 0.433 + rgb.b * 0.567),
        Math.round(rgb.r * 0 + rgb.g * 0.475 + rgb.b * 0.525)
      );
    default:
      return hex;
  }
};

// Readability testing utilities
const calculateLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
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

const getReadabilityStatus = (bgColor) => {
  const whiteContrast = calculateContrast(bgColor, '#ffffff');
  const blackContrast = calculateContrast(bgColor, '#000000');
  const bestContrast = Math.max(whiteContrast, blackContrast);
  
  if (bestContrast >= 7) return 'AAA';
  if (bestContrast >= 4.5) return 'AA';
  return 'Fail';
};

const getReadabilityTone = (bgColor) => {
  const status = getReadabilityStatus(bgColor);
  if (status === 'AAA') return 'success';
  if (status === 'AA') return 'warning';
  return 'danger';
};

const getBestTextColor = (bgColor) => {
  const whiteContrast = calculateContrast(bgColor, '#ffffff');
  const blackContrast = calculateContrast(bgColor, '#000000');
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
};

let contrastTestTimeout = null;
let isApplyingChange = false; // Flag to prevent loops

watch(() => props.palette.colors, () => {
  // Skip if we're currently applying a change (to prevent loops)
  if (isApplyingChange) {
    isApplyingChange = false;
    return;
  }
  
  // Debounce to avoid multiple rapid calls
  if (contrastTestTimeout) clearTimeout(contrastTestTimeout);
  contrastTestTimeout = setTimeout(() => {
    testContrast();
  }, 300);
}, { deep: true, immediate: false });

const fontSizeOptions = [
  { value: 12, label: '12px (Small)' },
  { value: 14, label: '14px (Normal)' },
  { value: 16, label: '16px (Large)' },
  { value: 18, label: '18px (Extra Large)' },
  { value: 24, label: '24px (Heading)' },
];
const fontWeightOptions = [
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi-Bold (600)' },
  { value: 700, label: 'Bold (700)' },
];
const sortOptions = [
  { value: 'ratio', label: 'Ratio (Low to High)' },
  { value: 'ratio-desc', label: 'Ratio (High to Low)' },
  { value: 'passing', label: 'Passing First' },
  { value: 'failing', label: 'Failing First' },
];
const filterCards = computed(() => [
  { value: 'all', label: 'Total pairs', count: totalPairs.value, tone: 'info' },
  { value: 'passing', label: 'Pass AA', count: passingAA.value, tone: 'success' },
  { value: 'passingAAA', label: 'Pass AAA', count: passingAAA.value, tone: 'success' },
  { value: 'failing', label: 'Failing', count: failing.value, tone: 'danger' },
]);
const suggestionKey = (result) => `${result.color1}-${result.color2}`;

// The readability sample takes the chosen size and weight (reach CSS via v-bind)
const sampleFontSize = computed(() => `${readabilityFontSize.value}px`);
const sampleFontWeight = computed(() => String(readabilityFontWeight.value));
</script>

<style scoped>
.readability-sample {
  font-size: v-bind(sampleFontSize);
  font-weight: v-bind(sampleFontWeight);
}
.filter-card {
  @apply p-4 rounded-tile border-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 outline-focus;
}
.filter-card-info {
  @apply border-info-border bg-info-bg text-info;
}
.filter-card-success {
  @apply border-success-border bg-success-bg text-success;
}
.filter-card-danger {
  @apply border-danger-border bg-danger-bg text-danger;
}
.filter-card-on {
  @apply border-current shadow-raised;
}
</style>
