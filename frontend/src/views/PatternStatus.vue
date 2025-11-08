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
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Pattern Status
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Track the development status, availability, and documentation coverage of all patterns in the design system.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="patternStatusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized pattern status icon -->
                      <rect x="20" y="20" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.3"/>
                      <rect x="70" y="20" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.5"/>
                      <rect x="120" y="20" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.4"/>
                      <rect x="20" y="70" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.5"/>
                      <rect x="70" y="70" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.3"/>
                      <rect x="120" y="70" width="40" height="40" rx="4" fill="url(#patternStatusGradient)" opacity="0.6"/>
                      <circle cx="170" cy="100" r="20" fill="url(#patternStatusGradient)" opacity="0.4"/>
                      <path d="M 160 100 L 170 90 L 180 100 L 170 110 Z" fill="white" opacity="0.7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Overview -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <div 
                @click="setStatusFilter('Production Ready')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'Production Ready'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">check_circle</span>
                    Production Ready
                  </span>
                  <span class="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.productionReady }}</p>
              </div>
              <div 
                @click="setStatusFilter('Planned')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'Planned'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">event</span>
                    Planned
                  </span>
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.planned }}</p>
              </div>
              <div 
                @click="setStatusFilter('In Progress')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'In Progress'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">progress_activity</span>
                    In Progress
                  </span>
                  <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.inProgress }}</p>
              </div>
              <div 
                @click="setStatusFilter('Sunsetting')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'Sunsetting'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">schedule</span>
                    Sunsetting
                  </span>
                  <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.sunsetting }}</p>
              </div>
              <div 
                @click="setStatusFilter('Experimental')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'Experimental'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">science</span>
                    Experimental
                  </span>
                  <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.experimental }}</p>
              </div>
              <div 
                @click="setStatusFilter('Deprecated')"
                class="rounded-2xl p-6 border cursor-pointer transition-all"
                :class="selectedStatus === 'Deprecated'
                  ? (isDarkMode 
                    ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500' 
                    : 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500')
                  : (isDarkMode 
                    ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-500')"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    <span class="material-symbols-outlined text-indigo-600">warning</span>
                    Deprecated
                  </span>
                  <span class="w-3 h-3 rounded-full bg-red-500"></span>
                </div>
                <p class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ statusCounts.deprecated }}</p>
              </div>
            </div>
          </div>

          <!-- Pattern Status Table -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-2xl border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div 
                class="px-6 py-4 border-b"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              >
                <h2 class="text-2xl font-bold flex items-center gap-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">pattern</span>
                  All Patterns
                </h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Pattern</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Documentation</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                    <tr 
                      v-for="pattern in filteredPatterns" 
                      :key="pattern.name" 
                      class="transition-colors cursor-pointer"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                      @click="navigateToPattern(pattern)"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ pattern.icon }}</span>
                          <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ pattern.name }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-medium"
                          :class="pattern.type === 'Design Pattern' 
                            ? (isDarkMode 
                              ? 'bg-purple-900/30 text-purple-400' 
                              : 'bg-purple-100 text-purple-800')
                            : (isDarkMode
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-blue-100 text-blue-800')"
                        >
                          {{ pattern.type }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-medium"
                          :class="getStatusClass(pattern.status)"
                        >
                          {{ pattern.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ pattern.category }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-medium"
                          :class="pattern.documentation === 'Complete' 
                            ? (isDarkMode 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-green-100 text-green-800')
                            : (isDarkMode
                              ? 'bg-yellow-900/30 text-yellow-400' 
                              : 'bg-yellow-100 text-yellow-800')"
                        >
                          {{ pattern.documentation }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ pattern.lastUpdated }}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const router = useRouter();
const { patterns: sharedPatterns } = useComponentPatternStatus();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedStatus = ref(null);

// Use shared patterns from composable
const patterns = computed(() => sharedPatterns.value);

const statusCounts = computed(() => {
  return {
    productionReady: patterns.value.filter(p => p.status === 'Production Ready').length,
    planned: patterns.value.filter(p => p.status === 'Planned').length,
    inProgress: patterns.value.filter(p => p.status === 'In Progress').length,
    experimental: patterns.value.filter(p => p.status === 'Experimental').length,
    sunsetting: patterns.value.filter(p => p.status === 'Sunsetting').length,
    deprecated: patterns.value.filter(p => p.status === 'Deprecated').length,
  };
});

const filteredPatterns = computed(() => {
  if (!selectedStatus.value) {
    return patterns.value;
  }
  return patterns.value.filter(p => p.status === selectedStatus.value);
});

const setStatusFilter = (status) => {
  if (selectedStatus.value === status) {
    // If clicking the same status, clear the filter
    selectedStatus.value = null;
  } else {
    selectedStatus.value = status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Production Ready':
      return isDarkMode.value 
        ? 'bg-green-900/30 text-green-400' 
        : 'bg-green-100 text-green-800';
    case 'In Progress':
      return isDarkMode.value 
        ? 'bg-yellow-900/30 text-yellow-400' 
        : 'bg-yellow-100 text-yellow-800';
    case 'Planned':
      return isDarkMode.value 
        ? 'bg-blue-900/30 text-blue-400' 
        : 'bg-blue-100 text-blue-800';
    case 'Experimental':
      return isDarkMode.value 
        ? 'bg-purple-900/30 text-purple-400' 
        : 'bg-purple-100 text-purple-800';
    case 'Sunsetting':
      return isDarkMode.value 
        ? 'bg-orange-900/30 text-orange-400' 
        : 'bg-orange-100 text-orange-800';
    case 'Deprecated':
      return isDarkMode.value 
        ? 'bg-red-900/30 text-red-400' 
        : 'bg-red-100 text-red-800';
    default:
      return isDarkMode.value 
        ? 'bg-gray-900/30 text-gray-400' 
        : 'bg-gray-100 text-gray-800';
  }
};

const navigateToPattern = (pattern) => {
  router.push(pattern.route);
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

