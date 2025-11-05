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

    <!-- Color Blindness Simulation -->
    <div v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-xl text-indigo-600">visibility</span>
        Color Blindness Simulation
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Preview how your palette appears to users with different types of color blindness. This helps ensure your color choices remain distinguishable for all users.
      </p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <button
          v-for="type in colorBlindnessTypes"
          :key="type.value"
          @click="selectedBlindnessType = type.value"
          class="px-3 py-2 rounded-lg border-2 transition-all text-sm"
          :class="selectedBlindnessType === type.value
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          {{ type.label }}
        </button>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="(color, index) in palette.colors"
          :key="`cb-${color.hex}-${index}`"
          class="text-center"
        >
          <div
            class="w-full h-16 rounded-lg shadow-md mb-2 border border-gray-200"
            :style="{ backgroundColor: simulateColorBlindness(color.hex, selectedBlindnessType) }"
          ></div>
          <div class="text-xs text-gray-600 font-mono">{{ color.hex }}</div>
          <div v-if="color.name" class="text-xs text-gray-500">{{ color.name }}</div>
        </div>
      </div>
    </div>

    <!-- Readability Testing -->
    <div v-if="palette.colors && palette.colors.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-xl text-indigo-600">text_fields</span>
        Readability Testing
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Test text readability with different font sizes and weights on each palette color to ensure optimal contrast.
      </p>
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <select v-model="readabilityFontSize" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="12">12px (Small)</option>
            <option value="14">14px (Normal)</option>
            <option value="16">16px (Large)</option>
            <option value="18">18px (Extra Large)</option>
            <option value="24">24px (Heading)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
          <select v-model="readabilityFontWeight" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="(color, index) in palette.colors"
          :key="`readability-${color.hex}-${index}`"
          class="p-4 rounded-lg border border-gray-200"
          :style="{ backgroundColor: color.hex }"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ color.name || color.hex }}</span>
            <span
              class="text-xs px-2 py-1 rounded"
              :class="getReadabilityClass(color.hex)"
            >
              {{ getReadabilityStatus(color.hex) }}
            </span>
          </div>
          <p
            class="text-gray-900"
            :style="{
              fontSize: `${readabilityFontSize}px`,
              fontWeight: readabilityFontWeight,
              color: getBestTextColor(color.hex),
            }"
          >
            The quick brown fox jumps over the lazy dog. Readability test for {{ color.name || color.hex }}.
          </p>
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
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-indigo-600">compare_arrows</span>
            Contrast Pairs
          </h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            @click="filter = 'all'"
            class="bg-blue-50 p-4 rounded-lg border-2 transition-all hover:bg-blue-100 cursor-pointer"
            :class="filter === 'all' ? 'border-blue-500 shadow-md' : 'border-blue-200'"
          >
            <div class="text-2xl font-bold text-blue-900">{{ totalPairs }}</div>
            <div class="text-sm text-blue-700">Total Pairs</div>
          </button>
          <button
            @click="filter = 'passing'"
            class="bg-green-50 p-4 rounded-lg border-2 transition-all hover:bg-green-100 cursor-pointer"
            :class="filter === 'passing' ? 'border-green-500 shadow-md' : 'border-green-200'"
          >
            <div class="text-2xl font-bold text-green-900">{{ passingAA }}</div>
            <div class="text-sm text-green-700">Pass AA</div>
          </button>
          <button
            @click="filter = 'passingAAA'"
            class="bg-green-50 p-4 rounded-lg border-2 transition-all hover:bg-green-100 cursor-pointer"
            :class="filter === 'passingAAA' ? 'border-green-500 shadow-md' : 'border-green-200'"
          >
            <div class="text-2xl font-bold text-green-900">{{ passingAAA }}</div>
            <div class="text-sm text-green-700">Pass AAA</div>
          </button>
          <button
            @click="filter = 'failing'"
            class="bg-red-50 p-4 rounded-lg border-2 transition-all hover:bg-red-100 cursor-pointer"
            :class="filter === 'failing' ? 'border-red-500 shadow-md' : 'border-red-200'"
          >
            <div class="text-2xl font-bold text-red-900">{{ failing }}</div>
            <div class="text-sm text-red-700">Failing</div>
          </button>
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
        <div class="flex items-center justify-between mb-4 gap-4">
          <!-- Versatility Insights -->
          <div v-if="versatileColors.length > 0" class="flex-1 flex items-center gap-4">
            <h4 class="text-sm font-semibold text-gray-900">Most Versatile Colors:</h4>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(color, index) in versatileColors.slice(0, 3)"
                :key="index"
                class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200"
              >
                <div
                  class="w-6 h-6 rounded border border-gray-300"
                  :style="{ backgroundColor: color.hex }"
                ></div>
                <span class="text-xs font-mono text-gray-900">{{ color.hex }}</span>
                <span class="text-xs text-gray-600">({{ color.count }} pairs)</span>
              </div>
            </div>
          </div>
          
          <!-- Filter and Sort Controls -->
          <div class="flex items-center gap-4 flex-shrink-0">
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
const selectedBlindnessType = ref('normal');
const colorBlindnessTypes = [
  { value: 'normal', label: 'Normal' },
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

const getReadabilityClass = (bgColor) => {
  const whiteContrast = calculateContrast(bgColor, '#ffffff');
  const blackContrast = calculateContrast(bgColor, '#000000');
  const bestContrast = Math.max(whiteContrast, blackContrast);
  
  if (bestContrast >= 7) return 'bg-green-100 text-green-800';
  if (bestContrast >= 4.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
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
</script>
