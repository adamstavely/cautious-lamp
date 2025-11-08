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
                  Component Status
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Track the development status, availability, and documentation coverage of all components in the design system.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized status/checkmark icon -->
                    <circle cx="100" cy="100" r="70" fill="url(#statusGradient)" opacity="0.3"/>
                    <circle cx="100" cy="100" r="50" fill="url(#statusGradient)" opacity="0.5"/>
                    <path d="M 70 100 L 90 120 L 130 80" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Overview -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

        <!-- Component Status Table -->
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
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">widgets</span>
                All Components
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Component</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Version</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Documentation</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Last Updated</th>
                  </tr>
                </thead>
                <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                  <tr 
                    v-for="component in filteredComponents" 
                    :key="component.name" 
                    class="transition-colors cursor-pointer"
                    :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    @click="navigateToComponent(component.name)"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <Pipette v-if="component.name === 'Color Picker'" :size="20" :stroke-width="2" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" />
                        <span v-else class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ component.icon }}</span>
                        <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ component.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        :class="getStatusClass(component.status)"
                      >
                        {{ component.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      {{ component.version }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        :class="component.documentation === 'Complete' 
                          ? (isDarkMode 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-green-100 text-green-800')
                          : (isDarkMode
                            ? 'bg-yellow-900/30 text-yellow-400' 
                            : 'bg-yellow-100 text-yellow-800')"
                      >
                        {{ component.documentation }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      {{ component.lastUpdated }}
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
import { Pipette } from 'lucide-vue-next';

const router = useRouter();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedStatus = ref(null);

const components = ref([
  { name: 'Button', icon: 'smart_button', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-15' },
  { name: 'Input', icon: 'input', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-10' },
  { name: 'Card', icon: 'view_module', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-12' },
  { name: 'Modal', icon: 'fullscreen', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-08' },
  { name: 'Dropdown', icon: 'arrow_drop_down', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-05' },
  { name: 'Checkbox', icon: 'check_box', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-03' },
  { name: 'Radio', icon: 'radio_button_checked', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-02' },
  { name: 'Switch', icon: 'toggle_on', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2023-12-28' },
  { name: 'Color Picker', icon: 'pipette', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-15' },
  { name: 'Tabs', icon: 'tab', status: 'In Progress', version: '0.9.0', documentation: 'Partial', lastUpdated: '2024-01-20' },
  { name: 'Accordion', icon: 'expand_more', status: 'In Progress', version: '0.8.0', documentation: 'Partial', lastUpdated: '2024-01-18' },
  { name: 'Tooltip', icon: 'info', status: 'In Progress', version: '0.7.0', documentation: 'Partial', lastUpdated: '2024-01-16' },
  { name: 'Popover', icon: 'open_in_new', status: 'In Progress', version: '0.6.0', documentation: 'Partial', lastUpdated: '2024-01-14' },
  { name: 'Breadcrumbs', icon: 'navigate_next', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
  { name: 'Pagination', icon: 'more_horiz', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
  { name: 'Data Table', icon: 'table_chart', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
]);

const statusCounts = computed(() => {
  return {
    productionReady: components.value.filter(c => c.status === 'Production Ready').length,
    planned: components.value.filter(c => c.status === 'Planned').length,
    inProgress: components.value.filter(c => c.status === 'In Progress').length,
    sunsetting: components.value.filter(c => c.status === 'Sunsetting').length,
    deprecated: components.value.filter(c => c.status === 'Deprecated').length,
  };
});

const filteredComponents = computed(() => {
  if (!selectedStatus.value) {
    return components.value;
  }
  return components.value.filter(c => c.status === selectedStatus.value);
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

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Map component names to their routes
const getComponentRoute = (componentName) => {
  const routeMap = {
    'Button': '/components/buttons',
    'Input': '/components/forms',
    'Card': '/components/cards',
    'Modal': '/components',
    'Dropdown': '/components',
    'Checkbox': '/components/forms',
    'Radio': '/components/forms',
    'Switch': '/components/forms',
    'Color Picker': '/components/color-picker',
    'Tabs': '/components/navigation',
    'Accordion': '/components',
    'Tooltip': '/components',
    'Popover': '/components',
    'Breadcrumbs': '/components/navigation',
    'Pagination': '/components/navigation',
    'Data Table': '/components/data-display',
  };
  
  // Return mapped route or generate a default route
  if (routeMap[componentName]) {
    return routeMap[componentName];
  }
  
  // Fallback: convert component name to route
  // Convert to lowercase, replace spaces with hyphens
  const routeName = componentName.toLowerCase().replace(/\s+/g, '-');
  return `/components/${routeName}`;
};

const navigateToComponent = (componentName) => {
  const route = getComponentRoute(componentName);
  router.push(route);
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

