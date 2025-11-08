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
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      {{ pattern.title }}
                    </h1>
                    <span 
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      :class="getComplexityClass(pattern.complexity)"
                    >
                      {{ pattern.complexity }}
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    {{ pattern.description }}
                  </p>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">category</span>
                      {{ getCategoryLabel(pattern.category) }}
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">code</span>
                      {{ pattern.useCase }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient :id="`codePatternHeroGradient-${pattern.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <g v-html="getPatternSVGContent"></g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Code Display Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div 
              class="rounded-2xl border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <!-- Framework Selector -->
              <div 
                class="px-6 py-4 border-b flex items-center justify-between"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              >
                <div class="flex items-center gap-4">
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Framework:</span>
                  <div class="flex gap-2">
                    <button
                      v-for="fw in ['vue', 'react', 'html']"
                      :key="fw"
                      @click="viewingFramework = fw"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      :class="viewingFramework === fw
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode 
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                    >
                      {{ fw.toUpperCase() }}
                    </button>
                  </div>
                </div>
                <button
                  @click="copyCode"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  :class="isDarkMode 
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  <span class="material-symbols-outlined text-base">content_copy</span>
                  Copy
                </button>
              </div>

              <!-- Code Block -->
              <div class="overflow-x-auto">
                <pre 
                  class="p-6 m-0 text-sm"
                  :class="isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-gray-900 text-gray-100'"
                ><code>{{ currentCode }}</code></pre>
              </div>
            </div>
          </div>

          <!-- Usage and Props Section -->
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            <!-- Usage Example -->
            <div 
              class="rounded-2xl border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined">info</span>
                Usage Example
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ pattern.usageExample }}
              </p>
            </div>

            <!-- Props -->
            <div 
              class="rounded-2xl border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined">settings</span>
                Properties
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="prop in pattern.props"
                  :key="prop.name"
                  class="pb-3 border-b last:border-0"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">
                      {{ prop.name }}
                    </code>
                    <span 
                      class="text-xs px-2 py-0.5 rounded"
                      :class="prop.required 
                        ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')"
                    >
                      {{ prop.required ? 'required' : 'optional' }}
                    </span>
                    <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ prop.type }}
                    </span>
                  </div>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ prop.description }}
                  </p>
                  <p v-if="prop.default !== undefined && prop.default !== ''" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Default: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">{{ prop.default }}</code>
                  </p>
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
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { patternSnippets } from '../data/patternSnippets.js';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const viewingFramework = ref('vue');

const pattern = computed(() => {
  // Map route paths to pattern IDs
  const routeToIdMap = {
    '/patterns/form-validation': 'form-validation',
    '/patterns/accessible-modal': 'modal-component',
    '/patterns/sortable-data-table': 'data-table',
    '/patterns/login-form': 'authentication-form',
    '/patterns/responsive-navigation': 'navigation-menu',
    '/patterns/toast-notification': 'toast-notification'
  };
  
  const patternId = routeToIdMap[route.path] || route.params.id;
  return patternSnippets.find(p => p.id === patternId) || patternSnippets[0];
});

const currentCode = computed(() => {
  return pattern.value?.code?.[viewingFramework.value] || pattern.value?.code?.vue || '';
});

const getCategoryLabel = (category) => {
  const labels = {
    'forms': 'Forms',
    'navigation': 'Navigation',
    'data-display': 'Data Display',
    'feedback': 'Feedback',
    'layout': 'Layout',
    'authentication': 'Authentication',
    'utilities': 'Utilities'
  };
  return labels[category] || category;
};

const getComplexityClass = (complexity) => {
  const classes = {
    'Beginner': isDarkMode.value ? 'bg-green-900/30 text-green-400 border border-green-400/30' : 'bg-green-100 text-green-800',
    'Intermediate': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-400/30' : 'bg-yellow-100 text-yellow-800',
    'Advanced': isDarkMode.value ? 'bg-red-900/30 text-red-400 border border-red-400/30' : 'bg-red-100 text-red-800'
  };
  return classes[complexity] || classes['Intermediate'];
};

const getPatternSVGContent = computed(() => {
  const patternId = pattern.value?.id;
  const gradientId = `codePatternHeroGradient-${patternId}`;
  
  // Use consistent opacity values that work well on dark gradient backgrounds
  // Following the same pattern as PatternNavigation and other pattern pages
  const svgContent = {
    'form-validation': `
      <!-- Form with validation checkmark -->
      <rect x="50" y="50" width="100" height="120" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="60" y="60" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="80" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="100" width="60" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="150" cy="70" r="10" fill="url(#${gradientId})" opacity="0.7"/>
      <path d="M 145 70 L 148 73 L 155 66" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <rect x="60" y="120" width="50" height="10" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
    `,
    'modal-component': `
      <!-- Modal dialog -->
      <rect x="40" y="40" width="120" height="120" rx="6" fill="url(#${gradientId})" opacity="0.4"/>
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="50" y="50" width="100" height="20" rx="4" fill="url(#${gradientId})" opacity="0.6"/>
      <line x1="60" y1="80" x2="140" y2="80" stroke="white" stroke-width="2.5" opacity="0.6"/>
      <line x1="60" y1="100" x2="120" y2="100" stroke="white" stroke-width="2.5" opacity="0.6"/>
      <rect x="70" y="120" width="30" height="8" rx="2" fill="url(#${gradientId})" opacity="0.7"/>
      <rect x="110" y="120" width="30" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="140" cy="60" r="6" fill="url(#${gradientId})" opacity="0.7"/>
      <line x1="137" y1="60" x2="143" y2="60" stroke="white" stroke-width="2.5" opacity="0.9"/>
    `,
    'data-table': `
      <!-- Data table -->
      <rect x="40" y="50" width="120" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="40" y="50" width="120" height="15" rx="4" fill="url(#${gradientId})" opacity="0.5"/>
      <line x1="50" y1="65" x2="150" y2="65" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <line x1="50" y1="80" x2="150" y2="80" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="95" x2="150" y2="95" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="110" x2="150" y2="110" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="125" x2="150" y2="125" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="80" y1="50" x2="80" y2="150" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="120" y1="50" x2="120" y2="150" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <circle cx="140" cy="58" r="4" fill="url(#${gradientId})" opacity="0.7"/>
      <path d="M 137 58 L 140 55 L 143 58 M 140 55 L 140 61" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    `,
    'authentication-form': `
      <!-- Login form with lock -->
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <circle cx="100" cy="70" r="12" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="88" y="70" width="24" height="20" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="60" y="100" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="115" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="70" y="130" width="60" height="10" rx="2" fill="url(#${gradientId})" opacity="0.7"/>
    `,
    'navigation-menu': `
      <!-- Navigation menu -->
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="60" y="60" width="80" height="6" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="60" y="75" width="60" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="90" width="70" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="105" width="55" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="120" width="65" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="145" cy="63" r="5" fill="url(#${gradientId})" opacity="0.6"/>
      <path d="M 142 63 L 145 60 L 148 63" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
    `,
    'toast-notification': `
      <!-- Toast notification -->
      <rect x="50" y="80" width="100" height="60" rx="4" fill="url(#${gradientId})" opacity="0.4"/>
      <rect x="50" y="80" width="100" height="15" rx="4" fill="url(#${gradientId})" opacity="0.6"/>
      <line x1="60" y1="105" x2="140" y2="105" stroke="white" stroke-width="2" opacity="0.6"/>
      <line x1="60" y1="120" x2="120" y2="120" stroke="white" stroke-width="2" opacity="0.5"/>
      <circle cx="140" cy="88" r="5" fill="url(#${gradientId})" opacity="0.7"/>
      <line x1="137" y1="88" x2="143" y2="88" stroke="white" stroke-width="2.5" opacity="0.9"/>
      <circle cx="60" cy="88" r="4" fill="url(#${gradientId})" opacity="0.8"/>
      <path d="M 58 88 L 60 90 L 62 88" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    `
  };
  
  return svgContent[patternId] || svgContent['form-validation'];
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(currentCode.value);
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  viewingFramework.value = pattern.value?.framework || 'vue';
  
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

