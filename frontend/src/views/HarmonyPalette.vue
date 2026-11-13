<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
        <!-- Back Button -->
        <div class="max-w-7xl mx-auto mb-8">
          <router-link
            to="/tokens/color-palettes"
            class="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Back to Color Palettes
          </router-link>
        </div>

        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-5xl">palette</span>
                  </div>
                  <h1 class="text-4xl md:text-5xl font-bold text-white">
                    Harmony
                  </h1>
                </div>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Accessible UI color palette by Evil Martians. Uses OKLCH and APCA for highly consistent color shades with precise control over text and UI element contrast.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Harmony Palette Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <!-- Features Badges -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                OKLCH
              </span>
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                APCA
              </span>
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                Tailwind Compatible
              </span>
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                P3 Support
              </span>
            </div>

            <!-- Install Info -->
            <div class="mb-8 p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
              <code class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                npm install @evilmartians/harmony
              </code>
            </div>

            <!-- Color Palette Grid -->
            <div class="mb-12">
              <h3 class="text-2xl font-semibold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Color Palette Grid
              </h3>
              
              <!-- Search/Filter -->
              <div class="mb-6">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search color families..."
                  class="w-full md:w-96 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :class="isDarkMode ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                />
              </div>

              <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

              <!-- Palette Grid Table -->
              <div class="overflow-x-auto mb-8 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-300 bg-white'">
                <table class="w-full border-collapse">
                  <!-- Header Row -->
                  <thead>
                    <tr>
                      <th class="sticky left-0 z-20 p-3 text-left font-semibold border-b-2" :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-400 text-gray-900'">
                        <div class="min-w-[100px]">Color</div>
                      </th>
                      <th 
                        v-for="shade in shadeLevels" 
                        :key="shade"
                        class="p-3 text-center font-semibold border-b-2 min-w-[120px]" 
                        :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-400 text-gray-900'"
                      >
                        <div class="text-base font-bold mb-1">Level {{ shade }}</div>
                        <div class="text-xs mt-1 font-normal opacity-90">Contrast: {{ getContrastForShade(shade) }}</div>
                        <div class="text-xs font-normal opacity-90">Chroma: {{ getChromaForShade(shade) }}</div>
                      </th>
                    </tr>
                  </thead>
                  
                  <!-- Color Family Rows -->
                  <tbody>
                    <tr
                      v-for="(colors, familyName) in filteredColors"
                      :key="familyName"
                      class="border-b transition-colors"
                      :class="isDarkMode ? 'border-gray-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'"
                    >
                      <!-- Color Family Name -->
                      <td class="sticky left-0 z-10 p-3 font-semibold capitalize border-r-2 whitespace-nowrap" :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'">
                        {{ familyName }}
                      </td>
                      
                      <!-- Color Cells -->
                      <td
                        v-for="shade in shadeLevels"
                        :key="`${familyName}-${shade}`"
                        class="p-3 border-r text-center relative group cursor-pointer min-h-[120px]"
                        :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                        :style="{ backgroundColor: colors[shade] || (isDarkMode ? '#1e293b' : '#f9fafb') }"
                        :role="colors[shade] ? 'button' : undefined"
                        :tabindex="colors[shade] ? 0 : undefined"
                        :aria-label="colors[shade] ? `Copy ${familyName} ${shade}: ${colors[shade]}` : undefined"
                        @click="copyToClipboard(colors[shade], `${familyName}-${shade}`)"
                        @keydown.enter.prevent="copyToClipboard(colors[shade], `${familyName}-${shade}`)"
                        @keydown.space.prevent="copyToClipboard(colors[shade], `${familyName}-${shade}`)"
                      >
                        <!-- Contrast Number (Large) -->
                        <div 
                          class="text-3xl font-bold mb-2 leading-none"
                          :style="getTextColorForCell(colors[shade], `${familyName}-${shade}`)"
                        >
                          {{ getContrastForShade(shade) }}
                        </div>
                        
                        <!-- Color Value -->
                        <div 
                          class="text-xs font-mono mb-1"
                          :style="{ ...getTextColorForCell(colors[shade], `${familyName}-${shade}`), opacity: 0.95 }"
                        >
                          {{ colorInfo[`${familyName}-${shade}`]?.hex || 'OKLCH' }}
                        </div>
                        
                        <!-- Usage Guideline Icon -->
                        <div 
                          class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                          :style="getUsageIconStyle(colors[shade], shade, familyName)"
                        >
                          {{ getUsageGuidelineIcon(shade) }}
                        </div>
                        
                        <!-- Copy Indicator on Hover -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity bg-black bg-opacity-30 rounded">
                          <span class="material-symbols-outlined text-white drop-shadow-lg text-2xl">{{ copiedColor === `${familyName}-${shade}` ? 'check' : 'content_copy' }}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Usage Guidelines Legend -->
              <div class="mt-8 p-6 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <h4 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Usage Guidelines
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div 
                    v-for="(guideline, index) in usageGuidelines" 
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <div 
                      class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                      :style="{ backgroundColor: guideline.color }"
                      :class="guidelineTextColors[index] === 'white' ? 'text-white' : 'text-black'"
                    >
                      {{ guideline.icon }}
                    </div>
                    <div>
                      <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                        {{ guideline.label }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Contrast {{ guideline.contrast }}, {{ guideline.fontSize }}, {{ guideline.lineHeight }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Usage Guidelines -->
            <div class="mb-12">
              <h3 class="text-2xl font-semibold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Usage Guidelines
              </h3>

              <!-- Guideline 1: Accent Color Flexibility -->
              <div class="mb-12">
                <div class="mb-6">
                  <h4 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    1. Set up and easily change the accent color later
                  </h4>
                  <p class="text-base mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Harmony's equal contrast within level columns allows you to change accent colors (e.g., Blue 600 to another 600 color) while maintaining the same contrast level. This preserves accessibility and readability.
                  </p>
                  <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Thanks to equal contrast within level columns, the contrast between text labels and buttons doesn't change when you swap accent colors.
                  </p>
                </div>

                <!-- Example Dialog Boxes -->
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                  <!-- Blue Accent -->
                  <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                    <div class="mb-4">
                      <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Document changed</div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Do you want to save your edits?</div>
                    </div>
                    <div class="flex gap-3">
                      <button class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors" :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
                        Cancel
                      </button>
                      <button class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style="background-color: oklch(0.5 0.2 250);">
                        Save
                      </button>
                    </div>
                    <div class="mt-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Blue 600 accent
                    </div>
                  </div>

                  <!-- Teal Accent -->
                  <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                    <div class="mb-4">
                      <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Document changed</div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Do you want to save your edits?</div>
                    </div>
                    <div class="flex gap-3">
                      <button class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors" :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
                        Cancel
                      </button>
                      <button class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style="background-color: oklch(0.5 0.2 180);">
                        Save
                      </button>
                    </div>
                    <div class="mt-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Teal 600 accent (same contrast)
                    </div>
                  </div>
                </div>
              </div>

              <!-- Guideline 2: Light and Dark Themes -->
              <div class="mb-12">
                <div class="mb-6">
                  <h4 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    2. Establish both light and dark themes effortlessly
                  </h4>
                  <p class="text-base mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Harmony's palette features mirrored contrast pairs. Every color column (except the central one) has a pair with the same level of contrast on the right (e.g., "65 and 65, 77 and 77").
                  </p>
                  <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Consider level 500 as the central column, and other columns make up mirrored contrast pairs. 400 and 600 are one step away from 500. 300 and 700 are two steps away from the center.
                  </p>
                </div>

                <!-- Contrast Level Visualization -->
                <div class="mb-6 p-6 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                  <div class="flex items-center justify-center gap-4 mb-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">77</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">300</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">65</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">400</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">54</div>
                      <div class="text-xs font-semibold" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-700'">500 (center)</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">65</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">600</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">77</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">700</div>
                    </div>
                  </div>
                  <div class="text-center text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Mirrored contrast pairs around level 500
                  </div>
                </div>

                <!-- Example Dialog Boxes -->
                <div class="grid md:grid-cols-2 gap-6">
                  <!-- Light Theme -->
                  <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                    <div class="mb-4">
                      <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Document changed</div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Do you want to save your edits?</div>
                    </div>
                    <div class="flex gap-3">
                      <button class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors" :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'">
                        Cancel
                      </button>
                      <button class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style="background-color: oklch(0.5 0.2 250);">
                        Save
                      </button>
                    </div>
                    <div class="mt-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Light theme: Slate 200, Blue 600, Blue 100
                    </div>
                  </div>

                  <!-- Dark Theme -->
                  <div class="rounded-lg border p-6 bg-slate-900 border-gray-700">
                    <div class="mb-4">
                      <div class="text-sm font-medium mb-2 text-white">Document changed</div>
                      <div class="text-sm text-gray-300">Do you want to save your edits?</div>
                    </div>
                    <div class="flex gap-3">
                      <button class="px-4 py-2 rounded-lg border border-gray-600 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                        Cancel
                      </button>
                      <button class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style="background-color: oklch(0.65 0.15 250);">
                        Save
                      </button>
                    </div>
                    <div class="mt-4 text-xs text-gray-500">
                      Dark theme: Slate 800, Blue 400, Blue 900
                    </div>
                  </div>
                </div>
              </div>

              <!-- Guideline 3: Consistent Object Coloring -->
              <div class="mb-12">
                <div class="mb-6">
                  <h4 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    3. Set different colors within one column to similar objects
                  </h4>
                  <p class="text-base mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use colors from the same column for semantically similar but visually distinct objects, such as multicolored user avatars, tags, and notifications.
                  </p>
                  <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Colors in every column have equal chroma and lightness, giving them a cohesive look that makes them seem like they belong to the same group. Also, as usual, the contrast level remains the same.
                  </p>
                </div>

                <!-- Example Tags -->
                <div class="flex flex-wrap gap-3">
                  <div class="px-4 py-2 rounded-full text-sm font-medium text-white" style="background-color: oklch(0.5 0.15 250);">
                    Music
                  </div>
                  <div class="px-4 py-2 rounded-full text-sm font-medium text-white" style="background-color: oklch(0.5 0.15 30);">
                    Books
                  </div>
                  <div class="px-4 py-2 rounded-full text-sm font-medium text-white" style="background-color: oklch(0.5 0.15 300);">
                    Games
                  </div>
                  <div class="px-4 py-2 rounded-full text-sm font-medium text-white" style="background-color: oklch(0.5 0.15 150);">
                    Video
                  </div>
                  <div class="px-4 py-2 rounded-full text-sm font-medium text-white" style="background-color: oklch(0.5 0.15 0);">
                    Utilities
                  </div>
                </div>
                <div class="mt-4 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  All tags use colors from the same column (600 level) with equal chroma and lightness
                </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import harmonyPalette from '@evilmartians/harmony/base';

// Note: much of this page (OKLCH grid, usage guidelines) duplicates
// ColoredTextPalette.vue; a shared palette-grid component would remove that.

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();
const searchQuery = ref('');
const copiedColor = ref(null);

// Shade levels in Harmony palette
const shadeLevels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Contrast values for each shade (APCA contrast, mirrored around 500)
const contrastValues = {
  '50': 105,
  '100': 100,
  '200': 90,
  '300': 77,
  '400': 65,
  '500': 54,
  '600': 65,
  '700': 77,
  '800': 90,
  '900': 100,
  '950': 105
};

// Chroma values for each shade
const chromaValues = {
  '50': 0.005,
  '100': 0.02,
  '200': 0.04,
  '300': 0.08,
  '400': 0.11,
  '500': 0.15,
  '600': 0.14,
  '700': 0.12,
  '800': 0.09,
  '900': 0.07,
  '950': 0.04
};

// Usage guidelines mapping
const usageGuidelines = [
  { label: 'Any Text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P1', color: 'oklch(0.98 0.005 0)' },
  { label: 'Any Text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P2', color: 'oklch(0.95 0.02 0)' },
  { label: 'Any Text', contrast: 90, fontSize: '20px', lineHeight: '32px', icon: 'P3', color: 'oklch(0.90 0.04 0)' },
  { label: 'Body Text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P4', color: 'oklch(0.80 0.08 0)' },
  { label: 'Content Text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P5', color: 'oklch(0.65 0.11 0)' },
  { label: 'Headline', contrast: 54, fontSize: '48px', lineHeight: '56px', icon: 'P6', color: 'oklch(0.50 0.15 0)' },
  { label: 'Content Text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P7', color: 'oklch(0.35 0.14 0)' },
  { label: 'Body Text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P8', color: 'oklch(0.20 0.12 0)' },
  { label: 'Any Text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P9', color: 'oklch(0.10 0.07 0)' },
  { label: 'Any Text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P10', color: 'oklch(0.05 0.04 0)' }
];





// Color family order matching the Harmony palette documentation
const colorFamilyOrder = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc',
  'neutral', 'stone', 'sand', 'olive', 'mauve'
];

// Process Harmony colors
const harmonyColors = computed(() => {
  const colors = {};
  
  // Process colors in the specified order
  colorFamilyOrder.forEach(colorName => {
    if (harmonyPalette[colorName] && typeof harmonyPalette[colorName] === 'object') {
      colors[colorName] = {};
      // Ensure shades are in correct order
      shadeLevels.forEach(shade => {
        const oklchValue = harmonyPalette[colorName][shade];
        if (typeof oklchValue === 'string' && oklchValue.startsWith('oklch')) {
          colors[colorName][shade] = oklchValue;
        }
      });
    }
  });
  
  return colors;
});

// Filter colors based on search query
const filteredColors = computed(() => {
  if (!searchQuery.value.trim()) {
    return harmonyColors.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  const filtered = {};
  
  Object.keys(harmonyColors.value).forEach(familyName => {
    if (familyName.toLowerCase().includes(query)) {
      filtered[familyName] = harmonyColors.value[familyName];
    } else {
      // Check if any shade matches
      const shades = Object.keys(harmonyColors.value[familyName]);
      if (shades.some(shade => shade.includes(query))) {
        filtered[familyName] = harmonyColors.value[familyName];
      }
    }
  });
  
  return filtered;
});

// OKLCH -> sRGB, computed directly. (Reading back getComputedStyle() doesn't
// work: current browsers report oklch colours as "oklch(...)", not rgb(), so
// the old regex never matched and hex values never appeared. It also forced a
// layout for every cell on every render.)
const parseOklch = (value) => {
  const match = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)(?:deg)?/i.exec(String(value || ''));
  if (!match) return null;
  const L = match[2] ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  const C = match[4] ? (parseFloat(match[3]) / 100) * 0.4 : parseFloat(match[3]);
  const H = parseFloat(match[5]);
  return [L, C, H].every(Number.isFinite) ? { L, C, H } : null;
};

const oklchToRgb = (value) => {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const { L, C, H } = parsed;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ];

  return linear.map((channel) => {
    const c = Math.min(1, Math.max(0, channel));
    const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  });
};

const toHex = ([r, g, b]) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();

// Calculate relative luminance (WCAG standard)
const calculateLuminance = (r, g, b) => {
  const [rNorm, gNorm, bNorm] = [r / 255, g / 255, b / 255].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

const isDarkColor = (value) => {
  const rgb = oklchToRgb(value);
  if (!rgb) return false;
  return calculateLuminance(...rgb) < 0.5;
};

// Hex value, text colour and badge style for every cell, computed once.
const colorInfo = computed(() => {
  const info = {};
  Object.entries(harmonyColors.value).forEach(([familyName, shades]) => {
    Object.entries(shades).forEach(([shade, oklchValue]) => {
      const rgb = oklchToRgb(oklchValue);
      const dark = rgb ? calculateLuminance(...rgb) < 0.5 : Number(shade) >= 600;
      info[`${familyName}-${shade}`] = {
        hex: rgb ? toHex(rgb) : null,
        textStyle: { color: dark ? '#ffffff' : '#000000' },
        iconStyle: dark
          ? { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }
          : { backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#000000', border: '1px solid rgba(0, 0, 0, 0.3)' }
      };
    });
  });
  return info;
});

const guidelineTextColors = usageGuidelines.map((guideline) => (isDarkColor(guideline.color) ? 'white' : 'black'));

// Get contrast value for shade
const getContrastForShade = (shade) => {
  return contrastValues[shade] || '';
};

// Get chroma value for shade
const getChromaForShade = (shade) => {
  return chromaValues[shade] || '';
};

// Get usage guideline icon for shade
const getUsageGuidelineIcon = (shade) => {
  const mapping = {
    '50': 'P1',
    '100': 'P2',
    '200': 'P3',
    '300': 'P4',
    '400': 'P5',
    '500': 'P6',
    '600': 'P7',
    '700': 'P8',
    '800': 'P9',
    '900': 'P10',
    '950': 'P10'
  };
  return mapping[shade] || '';
};

// Get text color for cell (white or black based on background luminance)
const getTextColorForCell = (oklchValue, cacheKey) => {
  if (!oklchValue) return { color: 'transparent' };
  return colorInfo.value[cacheKey]?.textStyle || { color: '#000000' };
};

// Get usage icon style
const getUsageIconStyle = (oklchValue, shade, familyName) => {
  if (!oklchValue) {
    return {
      backgroundColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      color: isDarkMode.value ? '#ffffff' : '#000000'
    };
  }
  return colorInfo.value[`${familyName}-${shade}`]?.iconStyle || { backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#000000' };
};

// Copy to clipboard
let copiedTimer = null;
const copyToClipboard = async (value, colorName) => {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copiedColor.value = colorName;
    showNotice(`Copied ${colorName.replace('-', ' ')}: ${value}`, 'success');

    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copiedColor.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  try {
    if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
      drawerOpen.value = true;
      sessionStorage.removeItem('openDrawerOnLoad');
    }
  } catch {
    // Storage unavailable (private mode / blocked): just don't auto-open.
  }
});

onBeforeUnmount(() => {
  clearTimeout(copiedTimer);
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

