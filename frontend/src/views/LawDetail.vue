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
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-16" v-if="law">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      {{ law.name }}
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    {{ law.description }}
                  </p>
                  <router-link
                    to="/hcd/laws-of-ux"
                    class="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                  >
                    <span class="material-symbols-outlined text-base">arrow_back</span>
                    Back to Laws of UX
                  </router-link>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <div class="w-full h-full" v-html="getLawIcon(law.id)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Sections -->
          <div class="max-w-7xl mx-auto space-y-12" v-if="law && law.content">
            <!-- Overview -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">info</span>
                Overview
              </h2>
              <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ law.content.overview }}
              </p>
            </div>

            <!-- Explanation -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">lightbulb</span>
                Explanation
              </h2>
              <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ law.content.explanation }}
              </p>
            </div>

            <!-- Applications -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">build</span>
                Design Applications
              </h2>
              <ul class="space-y-3">
                <li 
                  v-for="(application, index) in law.content.applications"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <span class="mt-1.5 flex-shrink-0" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </span>
                  <span class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ application }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Examples -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">example</span>
                Examples
              </h2>
              <ul class="space-y-3">
                <li 
                  v-for="(example, index) in law.content.examples"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <span class="mt-1.5 flex-shrink-0" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-lg">star</span>
                  </span>
                  <span class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ example }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- References -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">menu_book</span>
                References
              </h2>
              <ul class="space-y-3">
                <li 
                  v-for="(reference, index) in law.content.references"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <span class="mt-1.5 flex-shrink-0" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-lg">article</span>
                  </span>
                  <span class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ reference }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-sm border p-8 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <p class="text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Loading law details...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { lawsOfUXData } from '../data/lawsOfUX.js';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const lawId = computed(() => route.params.id);
const law = computed(() => {
  return lawsOfUXData[lawId.value] || null;
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Helper to get icon SVG content for a law (scaled for hero section)
const getLawIcon = (id) => {
  // For hero section, use 200x200 viewBox
  const iconMap = {
    'aesthetic-usability': `<defs><linearGradient id="aestheticGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="70" fill="url(#aestheticGrad-${id})" opacity="0.2"/><path d="M 60 100 Q 100 60 140 100 Q 100 140 60 100" fill="url(#aestheticGrad-${id})" opacity="0.6"/><circle cx="100" cy="100" r="16" fill="url(#aestheticGrad-${id})" opacity="0.8"/>`,
    'choice-overload': `<defs><linearGradient id="choiceGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="70" fill="url(#choiceGrad-${id})" opacity="0.2"/><circle cx="60" cy="60" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="100" cy="60" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="140" cy="60" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="60" cy="100" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="140" cy="100" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="60" cy="140" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="100" cy="140" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/><circle cx="140" cy="140" r="16" fill="url(#choiceGrad-${id})" opacity="0.7"/>`,
    'chunking': `<defs><linearGradient id="chunkGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="40" y="60" width="50" height="30" rx="4" fill="url(#chunkGrad-${id})" opacity="0.6"/><rect x="100" y="60" width="50" height="30" rx="4" fill="url(#chunkGrad-${id})" opacity="0.6"/><rect x="40" y="100" width="50" height="30" rx="4" fill="url(#chunkGrad-${id})" opacity="0.6"/><rect x="100" y="100" width="50" height="30" rx="4" fill="url(#chunkGrad-${id})" opacity="0.6"/><line x1="90" y1="74" x2="100" y2="74" stroke="url(#chunkGrad-${id})" stroke-width="4" opacity="0.4"/><line x1="90" y1="114" x2="100" y2="114" stroke="url(#chunkGrad-${id})" stroke-width="4" opacity="0.4"/>`,
    'cognitive-bias': `<defs><linearGradient id="biasGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="none" stroke="url(#biasGrad-${id})" stroke-width="6" opacity="0.5"/><path d="M 100 40 Q 140 100 100 160 Q 60 100 100 40" fill="url(#biasGrad-${id})" opacity="0.4"/><circle cx="100" cy="100" r="10" fill="url(#biasGrad-${id})" opacity="0.8"/>`,
    'cognitive-load': `<defs><linearGradient id="loadGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="60" y="80" width="80" height="60" rx="6" fill="url(#loadGrad-${id})" opacity="0.3"/><rect x="70" y="90" width="60" height="10" rx="2" fill="url(#loadGrad-${id})" opacity="0.6"/><rect x="70" y="110" width="60" height="10" rx="2" fill="url(#loadGrad-${id})" opacity="0.6"/><rect x="70" y="130" width="40" height="10" rx="2" fill="url(#loadGrad-${id})" opacity="0.6"/><circle cx="100" cy="50" r="16" fill="url(#loadGrad-${id})" opacity="0.7"/><path d="M 100 34 L 90 24 M 100 34 L 110 24" stroke="url(#loadGrad-${id})" stroke-width="4" opacity="0.7" stroke-linecap="round"/>`,
    'doherty-threshold': `<defs><linearGradient id="dohertyGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="url(#dohertyGrad-${id})" opacity="0.2"/><path d="M 40 100 L 100 60 L 160 100 L 100 140 Z" fill="url(#dohertyGrad-${id})" opacity="0.5"/><circle cx="100" cy="100" r="16" fill="url(#dohertyGrad-${id})" opacity="0.8"/><line x1="100" y1="40" x2="100" y2="60" stroke="url(#dohertyGrad-${id})" stroke-width="4" opacity="0.6"/>`,
    'fitts-law': `<defs><linearGradient id="fittsGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="60" cy="100" r="24" fill="url(#fittsGrad-${id})" opacity="0.5"/><circle cx="140" cy="100" r="40" fill="url(#fittsGrad-${id})" opacity="0.6"/><line x1="84" y1="100" x2="100" y2="100" stroke="url(#fittsGrad-${id})" stroke-width="6" opacity="0.7" stroke-linecap="round"/><path d="M 100 100 L 110 90 L 110 110 Z" fill="url(#fittsGrad-${id})" opacity="0.7"/>`,
    'flow': `<defs><linearGradient id="flowGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><path d="M 40 100 Q 70 60 100 100 T 160 100" fill="none" stroke="url(#flowGrad-${id})" stroke-width="8" opacity="0.6" stroke-linecap="round"/><circle cx="40" cy="100" r="10" fill="url(#flowGrad-${id})" opacity="0.8"/><circle cx="100" cy="100" r="10" fill="url(#flowGrad-${id})" opacity="0.8"/><circle cx="160" cy="100" r="10" fill="url(#flowGrad-${id})" opacity="0.8"/>`,
    'goal-gradient': `<defs><linearGradient id="goalGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><line x1="40" y1="140" x2="160" y2="60" stroke="url(#goalGrad-${id})" stroke-width="6" opacity="0.5"/><circle cx="50" cy="130" r="12" fill="url(#goalGrad-${id})" opacity="0.6"/><circle cx="80" cy="110" r="12" fill="url(#goalGrad-${id})" opacity="0.7"/><circle cx="110" cy="90" r="12" fill="url(#goalGrad-${id})" opacity="0.8"/><circle cx="140" cy="70" r="16" fill="url(#goalGrad-${id})" opacity="0.9"/><path d="M 160 60 L 150 50 L 150 70 Z" fill="url(#goalGrad-${id})" opacity="0.9"/>`,
    'hick-law': `<defs><linearGradient id="hickGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="50" fill="url(#hickGrad-${id})" opacity="0.2"/><path d="M 100 50 L 60 100 L 100 150 L 140 100 Z" fill="url(#hickGrad-${id})" opacity="0.5"/><circle cx="100" cy="100" r="16" fill="url(#hickGrad-${id})" opacity="0.8"/><line x1="100" y1="50" x2="100" y2="84" stroke="url(#hickGrad-${id})" stroke-width="4" opacity="0.6"/><line x1="60" y1="100" x2="84" y2="100" stroke="url(#hickGrad-${id})" stroke-width="4" opacity="0.6"/><line x1="100" y1="150" x2="100" y2="116" stroke="url(#hickGrad-${id})" stroke-width="4" opacity="0.6"/><line x1="140" y1="100" x2="116" y2="100" stroke="url(#hickGrad-${id})" stroke-width="4" opacity="0.6"/>`,
    'jakob-law': `<defs><linearGradient id="jakobGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="50" y="60" width="40" height="80" rx="4" fill="url(#jakobGrad-${id})" opacity="0.5"/><rect x="110" y="60" width="40" height="80" rx="4" fill="url(#jakobGrad-${id})" opacity="0.5"/><line x1="90" y1="100" x2="110" y2="100" stroke="url(#jakobGrad-${id})" stroke-width="6" opacity="0.7" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="url(#jakobGrad-${id})" opacity="0.9"/>`,
    'common-region': `<defs><linearGradient id="regionGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="40" y="60" width="120" height="80" rx="6" fill="none" stroke="url(#regionGrad-${id})" stroke-width="6" opacity="0.6"/><circle cx="70" cy="90" r="12" fill="url(#regionGrad-${id})" opacity="0.7"/><circle cx="100" cy="90" r="12" fill="url(#regionGrad-${id})" opacity="0.7"/><circle cx="130" cy="90" r="12" fill="url(#regionGrad-${id})" opacity="0.7"/>`,
    'proximity': `<defs><linearGradient id="proximityGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="70" cy="80" r="16" fill="url(#proximityGrad-${id})" opacity="0.7"/><circle cx="90" cy="80" r="16" fill="url(#proximityGrad-${id})" opacity="0.7"/><circle cx="110" cy="120" r="16" fill="url(#proximityGrad-${id})" opacity="0.7"/><circle cx="130" cy="120" r="16" fill="url(#proximityGrad-${id})" opacity="0.7"/>`,
    'pragnanz': `<defs><linearGradient id="pragnanzGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="url(#pragnanzGrad-${id})" opacity="0.3"/><circle cx="100" cy="100" r="40" fill="none" stroke="url(#pragnanzGrad-${id})" stroke-width="6" opacity="0.6"/><circle cx="100" cy="100" r="20" fill="url(#pragnanzGrad-${id})" opacity="0.8"/>`,
    'similarity': `<defs><linearGradient id="similarityGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="60" cy="60" r="16" fill="url(#similarityGrad-${id})" opacity="0.7"/><circle cx="100" cy="60" r="16" fill="url(#similarityGrad-${id})" opacity="0.7"/><circle cx="140" cy="60" r="16" fill="url(#similarityGrad-${id})" opacity="0.7"/><rect x="44" y="100" width="32" height="32" rx="4" fill="url(#similarityGrad-${id})" opacity="0.7"/><rect x="84" y="100" width="32" height="32" rx="4" fill="url(#similarityGrad-${id})" opacity="0.7"/><rect x="124" y="100" width="32" height="32" rx="4" fill="url(#similarityGrad-${id})" opacity="0.7"/>`,
    'uniform-connectedness': `<defs><linearGradient id="connectedGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="60" cy="80" r="12" fill="url(#connectedGrad-${id})" opacity="0.7"/><circle cx="100" cy="80" r="12" fill="url(#connectedGrad-${id})" opacity="0.7"/><circle cx="140" cy="80" r="12" fill="url(#connectedGrad-${id})" opacity="0.7"/><line x1="72" y1="80" x2="88" y2="80" stroke="url(#connectedGrad-${id})" stroke-width="6" opacity="0.6"/><line x1="112" y1="80" x2="128" y2="80" stroke="url(#connectedGrad-${id})" stroke-width="6" opacity="0.6"/><circle cx="60" cy="120" r="12" fill="url(#connectedGrad-${id})" opacity="0.4"/><circle cx="100" cy="120" r="12" fill="url(#connectedGrad-${id})" opacity="0.4"/><circle cx="140" cy="120" r="12" fill="url(#connectedGrad-${id})" opacity="0.4"/>`,
    'mental-model': `<defs><linearGradient id="mentalGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="50" fill="url(#mentalGrad-${id})" opacity="0.2"/><path d="M 60 100 Q 100 60 140 100 Q 100 140 60 100" fill="url(#mentalGrad-${id})" opacity="0.5"/><circle cx="100" cy="100" r="16" fill="url(#mentalGrad-${id})" opacity="0.8"/><path d="M 100 84 L 90 70 M 100 84 L 110 70" stroke="url(#mentalGrad-${id})" stroke-width="4" opacity="0.7" stroke-linecap="round"/>`,
    'miller-law': `<defs><linearGradient id="millerGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="url(#millerGrad-${id})" opacity="0.2"/><circle cx="60" cy="70" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="90" cy="60" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="120" cy="60" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="150" cy="70" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="70" cy="110" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="100" cy="100" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/><circle cx="130" cy="110" r="10" fill="url(#millerGrad-${id})" opacity="0.7"/>`,
    'occam-razor': `<defs><linearGradient id="occamGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><line x1="60" y1="100" x2="140" y2="100" stroke="url(#occamGrad-${id})" stroke-width="8" opacity="0.6" stroke-linecap="round"/><path d="M 140 100 L 130 90 L 130 110 Z" fill="url(#occamGrad-${id})" opacity="0.6"/><circle cx="70" cy="100" r="8" fill="url(#occamGrad-${id})" opacity="0.8"/><circle cx="100" cy="100" r="8" fill="url(#occamGrad-${id})" opacity="0.8"/>`,
    'paradox-active-user': `<defs><linearGradient id="paradoxGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="60" y="80" width="80" height="60" rx="6" fill="url(#paradoxGrad-${id})" opacity="0.3"/><rect x="70" y="90" width="60" height="10" rx="2" fill="url(#paradoxGrad-${id})" opacity="0.6"/><rect x="70" y="110" width="60" height="10" rx="2" fill="url(#paradoxGrad-${id})" opacity="0.6"/><circle cx="100" cy="50" r="16" fill="url(#paradoxGrad-${id})" opacity="0.7"/><path d="M 100 34 L 90 24 M 100 34 L 110 24" stroke="url(#paradoxGrad-${id})" stroke-width="4" opacity="0.7" stroke-linecap="round"/><line x1="100" y1="66" x2="100" y2="80" stroke="url(#paradoxGrad-${id})" stroke-width="4" opacity="0.7"/>`,
    'pareto': `<defs><linearGradient id="paretoGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><path d="M 100 160 L 100 80 Q 100 60 120 60 L 160 60" fill="none" stroke="url(#paretoGrad-${id})" stroke-width="8" opacity="0.6" stroke-linecap="round"/><circle cx="100" cy="160" r="10" fill="url(#paretoGrad-${id})" opacity="0.8"/><circle cx="120" cy="60" r="10" fill="url(#paretoGrad-${id})" opacity="0.8"/><circle cx="160" cy="60" r="10" fill="url(#paretoGrad-${id})" opacity="0.8"/>`,
    'parkinson': `<defs><linearGradient id="parkinsonGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="60" y="120" width="30" height="40" rx="4" fill="url(#parkinsonGrad-${id})" opacity="0.6"/><rect x="100" y="100" width="30" height="60" rx="4" fill="url(#parkinsonGrad-${id})" opacity="0.7"/><rect x="140" y="80" width="30" height="80" rx="4" fill="url(#parkinsonGrad-${id})" opacity="0.8"/><line x1="40" y1="160" x2="170" y2="160" stroke="url(#parkinsonGrad-${id})" stroke-width="4" opacity="0.5"/>`,
    'peak-end': `<defs><linearGradient id="peakGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><path d="M 40 140 Q 80 60 120 100 T 160 100" fill="none" stroke="url(#peakGrad-${id})" stroke-width="6" opacity="0.6"/><circle cx="80" cy="60" r="12" fill="url(#peakGrad-${id})" opacity="0.9"/><circle cx="160" cy="100" r="12" fill="url(#peakGrad-${id})" opacity="0.9"/>`,
    'postel': `<defs><linearGradient id="postelGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><path d="M 60 100 L 100 60 L 140 100" fill="none" stroke="url(#postelGrad-${id})" stroke-width="8" opacity="0.6" stroke-linecap="round"/><path d="M 60 100 L 100 140 L 140 100" fill="url(#postelGrad-${id})" opacity="0.4"/><circle cx="100" cy="100" r="10" fill="url(#postelGrad-${id})" opacity="0.8"/>`,
    'selective-attention': `<defs><linearGradient id="attentionGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="none" stroke="url(#attentionGrad-${id})" stroke-width="6" opacity="0.4"/><circle cx="100" cy="100" r="40" fill="none" stroke="url(#attentionGrad-${id})" stroke-width="6" opacity="0.5"/><circle cx="100" cy="100" r="20" fill="url(#attentionGrad-${id})" opacity="0.8"/><circle cx="60" cy="60" r="8" fill="url(#attentionGrad-${id})" opacity="0.3"/><circle cx="140" cy="60" r="8" fill="url(#attentionGrad-${id})" opacity="0.3"/><circle cx="60" cy="140" r="8" fill="url(#attentionGrad-${id})" opacity="0.3"/><circle cx="140" cy="140" r="8" fill="url(#attentionGrad-${id})" opacity="0.3"/>`,
    'serial-position': `<defs><linearGradient id="serialGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="50" y="60" width="24" height="80" rx="4" fill="url(#serialGrad-${id})" opacity="0.9"/><rect x="80" y="80" width="24" height="60" rx="4" fill="url(#serialGrad-${id})" opacity="0.5"/><rect x="110" y="90" width="24" height="50" rx="4" fill="url(#serialGrad-${id})" opacity="0.5"/><rect x="140" y="60" width="24" height="80" rx="4" fill="url(#serialGrad-${id})" opacity="0.9"/>`,
    'tesler': `<defs><linearGradient id="teslerGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="60" y="80" width="80" height="60" rx="6" fill="url(#teslerGrad-${id})" opacity="0.3"/><path d="M 60 80 L 100 60 L 140 80" fill="none" stroke="url(#teslerGrad-${id})" stroke-width="6" opacity="0.6"/><path d="M 60 140 L 100 120 L 140 140" fill="none" stroke="url(#teslerGrad-${id})" stroke-width="6" opacity="0.6"/><circle cx="100" cy="100" r="10" fill="url(#teslerGrad-${id})" opacity="0.8"/>`,
    'von-restorff': `<defs><linearGradient id="restorffGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="60" cy="80" r="12" fill="url(#restorffGrad-${id})" opacity="0.5"/><circle cx="100" cy="80" r="12" fill="url(#restorffGrad-${id})" opacity="0.5"/><circle cx="140" cy="80" r="20" fill="url(#restorffGrad-${id})" opacity="0.9"/><circle cx="60" cy="120" r="12" fill="url(#restorffGrad-${id})" opacity="0.5"/><circle cx="100" cy="120" r="12" fill="url(#restorffGrad-${id})" opacity="0.5"/><circle cx="140" cy="120" r="12" fill="url(#restorffGrad-${id})" opacity="0.5"/>`,
    'working-memory': `<defs><linearGradient id="memoryGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><rect x="60" y="70" width="80" height="60" rx="6" fill="url(#memoryGrad-${id})" opacity="0.3"/><rect x="70" y="80" width="60" height="10" rx="2" fill="url(#memoryGrad-${id})" opacity="0.6"/><rect x="70" y="100" width="60" height="10" rx="2" fill="url(#memoryGrad-${id})" opacity="0.6"/><rect x="70" y="120" width="40" height="10" rx="2" fill="url(#memoryGrad-${id})" opacity="0.6"/><circle cx="100" cy="50" r="12" fill="url(#memoryGrad-${id})" opacity="0.7"/>`,
    'zeigarnik': `<defs><linearGradient id="zeigarnikGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></linearGradient></defs><circle cx="100" cy="100" r="60" fill="none" stroke="url(#zeigarnikGrad-${id})" stroke-width="8" opacity="0.5" stroke-dasharray="20 10"/><circle cx="100" cy="100" r="40" fill="none" stroke="url(#zeigarnikGrad-${id})" stroke-width="6" opacity="0.7" stroke-dasharray="16 8"/><circle cx="100" cy="100" r="20" fill="url(#zeigarnikGrad-${id})" opacity="0.8"/><line x1="100" y1="40" x2="100" y2="20" stroke="url(#zeigarnikGrad-${id})" stroke-width="6" opacity="0.7" stroke-linecap="round"/>`,
  };
  
  const iconContent = iconMap[id];
  if (iconContent) {
    return `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">${iconContent}</svg>`;
  }
  
  // Default icon
  return `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="defaultGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="60" fill="url(#defaultGrad-${id})" opacity="0.3"/>
    <circle cx="100" cy="100" r="40" fill="url(#defaultGrad-${id})" opacity="0.5"/>
    <circle cx="100" cy="100" r="20" fill="url(#defaultGrad-${id})" opacity="0.7"/>
  </svg>`;
};

onMounted(() => {
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

