<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Versions
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Track component versions, view changelogs, and manage breaking changes across your design system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Component Selector -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Select Component
            </label>
            <select
              v-model="selectedComponent"
              @change="loadComponentVersions"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="">Choose a component...</option>
              <option value="button">Button</option>
              <option value="card">Card</option>
              <option value="input">Input</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio Button</option>
              <option value="textarea">Textarea</option>
              <option value="badge">Badge</option>
              <option value="alert">Alert</option>
            </select>
          </div>
        </div>

        <!-- Version Display -->
        <div v-if="selectedComponent && componentVersions.length > 0" class="max-w-7xl mx-auto">
          <!-- Current Version Info -->
          <div 
            class="rounded-lg shadow-sm border p-6 mb-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ selectedComponent.charAt(0).toUpperCase() + selectedComponent.slice(1) }}
                </h2>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Current Version: <span class="font-semibold">{{ currentVersion.version }}</span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(currentVersion.status)"
                >
                  {{ currentVersion.status }}
                </span>
              </div>
            </div>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              {{ currentVersion.description }}
            </p>
            <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              <span>Released: {{ formatDate(currentVersion.releasedAt) }}</span>
              <span v-if="currentVersion.lastUpdated">Last Updated: {{ formatDate(currentVersion.lastUpdated) }}</span>
            </div>
          </div>

          <!-- Version History -->
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Version History
              </h3>
            </div>
            <div class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
              <div
                v-for="version in componentVersions"
                :key="version.version"
                class="p-6"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h4 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        v{{ version.version }}
                      </h4>
                      <span 
                        class="px-2 py-0.5 rounded text-xs font-medium"
                        :class="getStatusBadgeClass(version.status)"
                      >
                        {{ version.status }}
                      </span>
                      <span 
                        v-if="version.breaking"
                        class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      >
                        Breaking Changes
                      </span>
                    </div>
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ version.description }}
                    </p>
                    <div class="text-xs mb-3" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Released: {{ formatDate(version.releasedAt) }}
                    </div>
                  </div>
                </div>

                <!-- Changelog -->
                <div v-if="version.changelog && version.changelog.length > 0" class="ml-6 border-l-2 pl-4 mb-4"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <h5 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Changelog
                  </h5>
                  <ul class="space-y-1 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <li v-for="(change, idx) in version.changelog" :key="idx" class="flex items-start gap-2">
                      <span class="mt-1" :class="getChangeTypeColor(change.type)">
                        {{ getChangeTypeIcon(change.type) }}
                      </span>
                      <span>{{ change.description }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Migration Guide -->
                <div v-if="version.migrationGuide" class="mt-4 p-4 rounded-lg"
                  :class="isDarkMode ? 'bg-slate-800 border border-gray-700' : 'bg-yellow-50 border border-yellow-200'"
                >
                  <div class="flex items-start gap-2 mb-2">
                    <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                    <h5 class="text-sm font-semibold" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-900'">
                      Migration Guide
                    </h5>
                  </div>
                  <p class="text-sm" :class="isDarkMode ? 'text-yellow-200' : 'text-yellow-800'">
                    {{ version.migrationGuide }}
                  </p>
                </div>

                <!-- Compare Versions -->
                <div class="mt-4 flex gap-2">
                  <button
                    v-if="version.version !== currentVersion.version"
                    @click="compareVersions(currentVersion.version, version.version)"
                    class="px-3 py-1 rounded text-xs font-medium border transition-colors"
                    :class="isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Compare with Current
                  </button>
                  <button
                    v-if="version.version !== currentVersion.version"
                    @click="viewVersion(version.version)"
                    class="px-3 py-1 rounded text-xs font-medium border transition-colors"
                    :class="isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    View Version
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="selectedComponent" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-12 text-center"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
              history
            </span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No version history found
            </p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              Version history will appear here once versions are added
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');

// Sample version data - in a real app, this would come from an API
const versionData = {
  button: [
    {
      version: '2.1.0',
      status: 'Current',
      description: 'Added loading state and improved accessibility',
      releasedAt: '2024-01-15',
      lastUpdated: '2024-01-20',
      breaking: false,
      changelog: [
        { type: 'added', description: 'Added loading prop and spinner animation' },
        { type: 'added', description: 'Added aria-busy attribute for screen readers' },
        { type: 'improved', description: 'Enhanced focus indicators for better accessibility' },
        { type: 'fixed', description: 'Fixed button text alignment in small sizes' },
      ]
    },
    {
      version: '2.0.0',
      status: 'Stable',
      description: 'Major refactor with new variant system',
      releasedAt: '2023-12-01',
      breaking: true,
      migrationGuide: 'The "type" prop has been renamed to "variant". Update all instances: type="primary" → variant="primary"',
      changelog: [
        { type: 'breaking', description: 'Renamed "type" prop to "variant" for consistency' },
        { type: 'breaking', description: 'Removed "outline" variant, use "secondary" instead' },
        { type: 'added', description: 'Added "tertiary" variant' },
        { type: 'added', description: 'Added size prop (sm, md, lg)' },
        { type: 'improved', description: 'Improved button styling and hover states' },
      ]
    },
    {
      version: '1.5.2',
      status: 'Stable',
      description: 'Bug fixes and minor improvements',
      releasedAt: '2023-10-15',
      breaking: false,
      changelog: [
        { type: 'fixed', description: 'Fixed disabled state styling' },
        { type: 'fixed', description: 'Fixed button width in flex containers' },
      ]
    },
    {
      version: '1.5.0',
      status: 'Stable',
      description: 'Added new button variants',
      releasedAt: '2023-09-01',
      breaking: false,
      changelog: [
        { type: 'added', description: 'Added "outline" variant' },
        { type: 'added', description: 'Added "ghost" variant' },
        { type: 'improved', description: 'Improved button spacing' },
      ]
    },
  ],
  card: [
    {
      version: '1.2.0',
      status: 'Current',
      description: 'Added new variants and improved layout',
      releasedAt: '2024-01-10',
      lastUpdated: '2024-01-18',
      breaking: false,
      changelog: [
        { type: 'added', description: 'Added "elevated" variant with shadow' },
        { type: 'added', description: 'Added "outlined" variant' },
        { type: 'added', description: 'Added showActions prop' },
      ]
    },
    {
      version: '1.1.0',
      status: 'Stable',
      description: 'Initial stable release',
      releasedAt: '2023-11-01',
      breaking: false,
      changelog: [
        { type: 'added', description: 'Initial card component release' },
      ]
    },
  ],
};

const componentVersions = ref([]);
const currentVersion = computed(() => {
  return componentVersions.value.find(v => v.status === 'Current') || componentVersions.value[0] || {};
});

const loadComponentVersions = () => {
  if (!selectedComponent.value) {
    componentVersions.value = [];
    return;
  }
  componentVersions.value = versionData[selectedComponent.value] || [];
};

// Support query parameter to pre-select component
onMounted(() => {
  if (route.query.component) {
    selectedComponent.value = route.query.component;
    loadComponentVersions();
  }
});

// Watch for route changes
watch(() => route.query.component, (newComponent) => {
  if (newComponent) {
    selectedComponent.value = newComponent;
    loadComponentVersions();
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'Current': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'Stable': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Deprecated': isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
    'Beta': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
  };
  return classes[status] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

const getChangeTypeIcon = (type) => {
  const icons = {
    'added': '✓',
    'changed': '→',
    'deprecated': '⚠',
    'removed': '✗',
    'fixed': '🔧',
    'improved': '↑',
    'breaking': '⚠',
  };
  return icons[type] || '•';
};

const getChangeTypeColor = (type) => {
  const colors = {
    'added': 'text-green-600 dark:text-green-400',
    'changed': 'text-blue-600 dark:text-blue-400',
    'deprecated': 'text-yellow-600 dark:text-yellow-400',
    'removed': 'text-red-600 dark:text-red-400',
    'fixed': 'text-purple-600 dark:text-purple-400',
    'improved': 'text-indigo-600 dark:text-indigo-400',
    'breaking': 'text-red-600 dark:text-red-400 font-bold',
  };
  return colors[type] || 'text-gray-600 dark:text-gray-400';
};

const compareVersions = (version1, version2) => {
  // In a real app, this would open a comparison view
  alert(`Comparing ${version1} with ${version2}`);
};

const viewVersion = (version) => {
  // In a real app, this would show the component at that version
  alert(`Viewing version ${version}`);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for dark mode changes
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

