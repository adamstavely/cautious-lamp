<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
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
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Font Subsetting
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate optimized Google Fonts URLs by selecting only the character sets you need. Reduce file size and improve load times.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Optimization Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated Jan 15, 2024
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="fontSubsettingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized font subsetting icon -->
                      <rect x="30" y="30" width="140" height="140" rx="8" fill="url(#fontSubsettingGradient)" opacity="0.3"/>
                      <text x="100" y="100" font-family="Arial" font-size="30" font-weight="bold" fill="url(#fontSubsettingGradient)" text-anchor="middle" opacity="0.8">Aa</text>
                      <circle cx="100" cy="100" r="50" fill="none" stroke="url(#fontSubsettingGradient)" stroke-width="3" opacity="0.5" stroke-dasharray="5,5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-3xl mx-auto">

          <!-- Info Box -->
          <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              <strong>What is font subsetting?</strong> Font subsetting allows you to include only the character sets you need, reducing file size and improving load times. Select the character sets your project requires to generate an optimized Google Fonts URL.
            </p>
          </div>
          
          <!-- Select Font -->
          <div class="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForSubsetting"
              @change="selectedSubsets = []; selectedWeightForSubsetting = ''"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <!-- Select Weight -->
          <div v-if="selectedFontForSubsetting" class="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Weight</label>
            <select 
              v-model="selectedWeightForSubsetting"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Choose a weight...</option>
              <option v-for="weight in getAvailableWeightsForSubsetting()" :key="weight" :value="weight">
                {{ getWeightName(weight) }} ({{ weight }})
              </option>
            </select>
          </div>
          
          <!-- Select Character Sets -->
          <div v-if="selectedFontForSubsetting" class="space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Select Character Sets to Include</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Choose which character sets to include in your font subset. Only options supported by this font are shown.</p>
              <div v-if="getAvailableSubsetsForFont().length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
                No character sets available for this font.
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <label v-for="subset in getAvailableSubsetsForFont()" :key="subset.value" class="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                  <input type="checkbox" :value="subset.value" v-model="selectedSubsets" class="rounded" />
                  <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ subset.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Generated URL -->
            <div v-if="selectedSubsets.length > 0 && selectedWeightForSubsetting" class="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Google Fonts URL</div>
              <div class="text-xs font-mono text-gray-900 dark:text-white break-all mb-3 p-3 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-gray-600">
                https://fonts.googleapis.com/css2?family={{ selectedFontForSubsetting.replace(/\s/g, '+') }}:wght@{{ selectedWeightForSubsetting }}&subset={{ selectedSubsets.join(',') }}
              </div>
              <button @click="copySubsetURL" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Copy URL
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import fontData from '../assets/fonts.json';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedFontForSubsetting = ref('');
const selectedWeightForSubsetting = ref('');
const selectedSubsets = ref([]);

function getSelectedFontForSubsetting() {
  if (!selectedFontForSubsetting.value) return null;
  return fontData.find(f => f.name === selectedFontForSubsetting.value);
}

function getAvailableWeightsForSubsetting() {
  const font = getSelectedFontForSubsetting();
  if (!font || !font.weights) return [];
  return font.weights.sort((a, b) => parseInt(a) - parseInt(b));
}

function getAvailableSubsetsForFont() {
  const font = getSelectedFontForSubsetting();
  if (!font || !font.supports) return [];
  
  const allSubsets = [
    { value: 'latin', label: 'Latin', base: 'latin' },
    { value: 'latin-ext', label: 'Latin Extended', base: 'latin' },
    { value: 'cyrillic', label: 'Cyrillic', base: 'cyrillic' },
    { value: 'cyrillic-ext', label: 'Cyrillic Extended', base: 'cyrillic' },
    { value: 'greek', label: 'Greek', base: 'greek' },
    { value: 'greek-ext', label: 'Greek Extended', base: 'greek' },
    { value: 'arabic', label: 'Arabic', base: 'arabic' },
    { value: 'devanagari', label: 'Devanagari', base: 'devanagari' },
    { value: 'chinese', label: 'Chinese', base: 'chinese' }
  ];
  
  // Filter to only show subsets for scripts the font supports
  return allSubsets.filter(subset => {
    return font.supports.includes(subset.base);
  });
}

function copySubsetURL() {
  if (!selectedFontForSubsetting.value || selectedSubsets.value.length === 0 || !selectedWeightForSubsetting.value) return;
  const url = `https://fonts.googleapis.com/css2?family=${selectedFontForSubsetting.value.replace(/\s/g, '+')}:wght@${selectedWeightForSubsetting.value}&subset=${selectedSubsets.value.join(',')}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Font subset URL copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy to clipboard');
  });
}

function getWeightName(weight) {
  const weightNames = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  return weightNames[weight.toString()] || 'Unknown';
}

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

