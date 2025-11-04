<template>
  <div>
    <p class="text-gray-600 mb-8">
      Send your palette through Contrast Testing to make sure every color combo is accessible and readable.
      See the exact scores, check which pairs pass AA/AAA standards, and feel confident your palette works everywhere.
    </p>

    <!-- Current Palette Display -->
    <div v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Palette</h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(color, index) in palette.colors"
          :key="index"
          class="group relative"
        >
          <div
            class="w-20 h-20 rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer"
            :style="{ backgroundColor: color.hex }"
          ></div>
          <div class="mt-1 text-center">
            <div class="text-xs font-mono text-gray-700">{{ color.hex }}</div>
            <div v-if="color.role" class="text-xs text-gray-500 capitalize">{{ color.role }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Testing contrast...</p>
    </div>

    <div v-else>
      <!-- Summary -->
      <div v-if="contrastResults.length > 0" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="text-2xl font-bold text-blue-900">{{ totalPairs }}</div>
            <div class="text-sm text-blue-700">Total Pairs</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-900">{{ passingAA }}</div>
            <div class="text-sm text-green-700">Pass AA</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-900">{{ passingAAA }}</div>
            <div class="text-sm text-green-700">Pass AAA</div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="text-2xl font-bold text-red-900">{{ failing }}</div>
            <div class="text-sm text-red-700">Failing</div>
          </div>
        </div>

        <!-- Strategic Color Suggestions -->
        <div v-if="strategicSuggestions.length > 0" class="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-indigo-900">Strategic Color Suggestions</h3>
              <p class="text-sm text-indigo-700 mt-1">
                These colors fix multiple failing pairs. Add them to improve your palette's contrast coverage.
              </p>
            </div>
            <button
              @click="loadStrategicSuggestions"
              :disabled="loadingStrategic"
              class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="!loadingStrategic" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div v-else class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refresh Suggestions
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(suggestion, index) in strategicSuggestions"
              :key="index"
              class="bg-white rounded-lg p-4 border border-indigo-200 hover:border-indigo-400 transition-all"
            >
              <div class="flex items-start gap-3 mb-3">
                <div v-if="suggestion.replaceColor" class="flex items-center gap-2">
                  <!-- Before Color -->
                  <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1">Before</div>
                    <div
                      class="w-16 h-16 rounded-lg border-2 border-gray-300 flex-shrink-0"
                      :style="{ backgroundColor: suggestion.replaceColor }"
                    ></div>
                    <div class="text-xs font-mono text-gray-600 mt-1">{{ suggestion.replaceColor }}</div>
                  </div>
                  <!-- Arrow -->
                  <div class="flex items-center text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <!-- After Color -->
                  <div class="text-center">
                    <div class="text-xs text-gray-500 mb-1">After</div>
                    <div
                      class="w-16 h-16 rounded-lg border-2 border-indigo-400 flex-shrink-0"
                      :style="{ backgroundColor: suggestion.hex }"
                    ></div>
                    <div class="text-xs font-mono text-gray-900 font-semibold mt-1">{{ suggestion.hex }}</div>
                  </div>
                </div>
                <div v-else>
                  <div
                    class="w-16 h-16 rounded-lg border-2 border-gray-300 flex-shrink-0"
                    :style="{ backgroundColor: suggestion.hex }"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm font-semibold text-gray-900 mb-1">{{ suggestion.hex }}</div>
                  <div class="text-xs text-gray-600 capitalize">{{ suggestion.type.replace('-', ' ') }}</div>
                  <div class="text-xs text-indigo-600 font-medium mt-1">
                    Fixes {{ suggestion.pairsFixed }} pair{{ suggestion.pairsFixed !== 1 ? 's' : '' }}
                  </div>
                  <div v-if="suggestion.replaceColor" class="text-xs text-purple-600 font-medium mt-1">
                    Keeps palette size the same
                  </div>
                </div>
              </div>
              
              <p class="text-xs text-gray-700 mb-3">{{ suggestion.description }}</p>
              
              <div v-if="suggestion.pairsFixedDetails.length > 0" class="mb-3">
                <div class="text-xs font-medium text-gray-600 mb-1">Sample pairs fixed:</div>
                <div class="space-y-1 max-h-24 overflow-y-auto">
                  <div
                    v-for="(pair, idx) in suggestion.pairsFixedDetails.slice(0, 3)"
                    :key="idx"
                    class="text-xs text-gray-500 flex items-center gap-2"
                  >
                    <div class="w-4 h-4 rounded border border-gray-300" :style="{ backgroundColor: pair.color1 }"></div>
                    <div class="w-4 h-4 rounded border border-gray-300" :style="{ backgroundColor: pair.color2 }"></div>
                    <span class="font-mono">{{ pair.ratio.toFixed(1) }}:1</span>
                  </div>
                </div>
              </div>
              
              <button
                v-if="suggestion.replaceColor"
                @click="applyReplacement(suggestion.replaceColor, suggestion.hex)"
                class="w-full px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Replace Color
              </button>
              <button
                v-else
                @click="applyStrategicColor(suggestion.hex)"
                class="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add to Palette
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Filter:</label>
            <select
              v-model="filter"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Pairs</option>
              <option value="passing">Passing Only</option>
              <option value="failing">Failing Only</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Sort:</label>
            <select
              v-model="sortBy"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ratio">Ratio (Low to High)</option>
              <option value="ratio-desc">Ratio (High to Low)</option>
              <option value="passing">Passing First</option>
              <option value="failing">Failing First</option>
            </select>
          </div>
        </div>

        <!-- Versatility Insights -->
        <div v-if="versatileColors.length > 0" class="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 class="text-sm font-semibold text-indigo-900 mb-2">Most Versatile Colors</h4>
          <p class="text-xs text-indigo-700 mb-3">
            These colors work well with many others in your palette:
          </p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(color, index) in versatileColors.slice(0, 3)"
              :key="index"
              class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-indigo-300"
            >
              <div
                class="w-6 h-6 rounded border border-gray-300"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <span class="text-xs font-mono text-indigo-900">{{ color.hex }}</span>
              <span class="text-xs text-indigo-600">({{ color.count }} pairs)</span>
            </div>
          </div>
        </div>

        <!-- Contrast Results Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standards</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(result, index) in filteredAndSortedResults" :key="index">
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <!-- Text Color 1 on Background Color 2 -->
                    <div class="flex items-center gap-2">
                      <div
                        class="flex-1 px-4 py-3 rounded border border-gray-300"
                        :style="{
                          backgroundColor: result.color2,
                          color: result.color1,
                        }"
                      >
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Sample Text</span>
                          <div class="flex items-center gap-2">
                            <span
                              v-if="result.passesAALarge"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AA Large Text (3:1)"
                            >
                              AA Large
                            </span>
                            <span
                              v-if="result.passesAA"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AA Standard (4.5:1)"
                            >
                              AA
                            </span>
                            <span
                              v-if="result.passesAAA"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AAA Standard (7:1)"
                            >
                              AAA
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 font-mono whitespace-nowrap">
                        {{ result.color1 }} on {{ result.color2 }}
                      </div>
                    </div>
                    <!-- Text Color 2 on Background Color 1 -->
                    <div class="flex items-center gap-2">
                      <div
                        class="flex-1 px-4 py-3 rounded border border-gray-300"
                        :style="{
                          backgroundColor: result.color1,
                          color: result.color2,
                        }"
                      >
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Sample Text</span>
                          <div class="flex items-center gap-2">
                            <span
                              v-if="result.passesAALarge"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AA Large Text (3:1)"
                            >
                              AA Large
                            </span>
                            <span
                              v-if="result.passesAA"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AA Standard (4.5:1)"
                            >
                              AA
                            </span>
                            <span
                              v-if="result.passesAAA"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded"
                              title="Passes AAA Standard (7:1)"
                            >
                              AAA
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 font-mono whitespace-nowrap">
                        {{ result.color2 }} on {{ result.color1 }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="font-mono text-sm font-semibold" :class="getRatioClass(result.ratio)">
                      {{ result.ratio }}:1
                    </span>
                    <span class="text-xs text-gray-500 mt-1">
                      {{ getRatioDescription(result.ratio) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded w-12 text-center"
                        :class="result.passesAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ result.passesAA ? '✓ AA' : '✗ AA' }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded w-12 text-center"
                        :class="result.passesAAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ result.passesAAA ? '✓ AAA' : '✗ AAA' }}
                      </span>
                    </div>
                    <div v-if="result.passesAALarge || result.passesAAALarge" class="text-xs text-gray-500 mt-1">
                      <span v-if="result.passesAALarge">Large text OK</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="!result.passesAA" class="flex flex-col gap-2">
                    <button
                      v-if="!suggestionsLoading[`${result.color1}-${result.color2}`]"
                      @click="getContrastSuggestion(result)"
                      class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Get Fix
                    </button>
                    <div v-else class="text-xs text-gray-500 flex items-center gap-2">
                      <div class="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      Loading...
                    </div>
                    <div
                      v-if="contrastSuggestions[`${result.color1}-${result.color2}`]"
                      class="mt-2 p-3 bg-gray-50 rounded border border-gray-200 min-w-[200px]"
                    >
                      <div class="text-xs text-gray-700 mb-3 font-medium">
                        {{ contrastSuggestions[`${result.color1}-${result.color2}`].description }}
                      </div>
                      <div
                        v-if="contrastSuggestions[`${result.color1}-${result.color2}`].color1Fix"
                        class="flex items-center gap-2 mb-2 p-2 bg-white rounded"
                      >
                        <div
                          class="w-10 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                          :style="{ backgroundColor: contrastSuggestions[`${result.color1}-${result.color2}`].color1Fix }"
                        ></div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-mono text-gray-700 break-all">
                            {{ contrastSuggestions[`${result.color1}-${result.color2}`].color1Fix }}
                          </div>
                          <div class="text-xs text-gray-500">Add to palette</div>
                        </div>
                        <button
                          @click.stop="applyContrastFix(result.color1, contrastSuggestions[`${result.color1}-${result.color2}`].color1Fix)"
                          class="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      <div
                        v-if="contrastSuggestions[`${result.color1}-${result.color2}`].color2Fix"
                        class="flex items-center gap-2 p-2 bg-white rounded"
                      >
                        <div
                          class="w-10 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                          :style="{ backgroundColor: contrastSuggestions[`${result.color1}-${result.color2}`].color2Fix }"
                        ></div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-mono text-gray-700 break-all">
                            {{ contrastSuggestions[`${result.color1}-${result.color2}`].color2Fix }}
                          </div>
                          <div class="text-xs text-gray-500">Add to palette</div>
                        </div>
                        <button
                          @click.stop="applyContrastFix(result.color2, contrastSuggestions[`${result.color1}-${result.color2}`].color2Fix)"
                          class="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      <div
                        v-if="!contrastSuggestions[`${result.color1}-${result.color2}`].color1Fix && !contrastSuggestions[`${result.color1}-${result.color2}`].color2Fix"
                        class="text-xs text-orange-600 italic"
                      >
                        No automatic fix available. Try manually adjusting colors.
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-green-600 font-medium">✓ Good contrast</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
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
        Next: Assign Roles →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

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
  if (ratio >= 7) return 'text-green-600';
  if (ratio >= 4.5) return 'text-yellow-600';
  return 'text-red-600';
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
    const response = await axios.post('http://localhost:3000/api/palettes/contrast-fix', {
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
    
    alert(`Failed to get contrast fix: ${error.message || 'Unknown error'}. Check console for details.`);
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
    alert(`Color ${newColor} is already in your palette`);
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
    const response = await axios.post('http://localhost:3000/api/palettes/analyze', {
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
    alert('Error testing contrast. Please try again.');
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
    const response = await axios.post('http://localhost:3000/api/palettes/strategic-colors', {
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

// Watch for palette changes and retest contrast
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
</script>
