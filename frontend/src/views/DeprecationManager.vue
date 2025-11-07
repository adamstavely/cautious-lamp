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
                  Deprecation Manager
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Track and manage deprecated components. Set deprecation dates, migration paths, and retirement schedules.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Deprecation List -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Filter -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Filter
              </h3>
              <select
                v-model="filterStatus"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="all">All Status</option>
                <option value="deprecated">Deprecated</option>
                <option value="sunset">Sunset Scheduled</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <!-- Deprecated Components -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Deprecated Components
              </h3>
              <div class="space-y-2">
                <div
                  v-for="component in filteredDeprecated"
                  :key="component.id"
                  @click="selectedComponent = component"
                  class="p-3 rounded-lg cursor-pointer transition-colors"
                  :class="selectedComponent?.id === component.id
                    ? (isDarkMode ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200')
                    : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100')"
                >
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ component.name }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ component.status }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Component Details -->
            <div 
              v-if="selectedComponent"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ selectedComponent.name }}
                </h3>
                <span 
                  class="px-3 py-1 rounded text-sm font-medium"
                  :class="selectedComponent.status === 'deprecated'
                    ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                    : selectedComponent.status === 'sunset'
                    ? (isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700')
                    : (isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700')"
                >
                  {{ selectedComponent.status }}
                </span>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Deprecation Date
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatDate(selectedComponent.deprecationDate) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Sunset Date
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatDate(selectedComponent.sunsetDate) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Replacement Component
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    {{ selectedComponent.replacement }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Reason
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ selectedComponent.reason }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Guide
                  </label>
                  <div class="rounded-lg p-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <pre class="text-xs font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"><code>{{ selectedComponent.migrationGuide }}</code></pre>
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Usage Count
                  </label>
                  <div class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ selectedComponent.usageCount }} projects
                  </div>
                </div>
              </div>
            </div>

            <!-- Deprecation Schedule -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Deprecation Schedule
              </h3>
              <div class="space-y-3">
                <div
                  v-for="item in deprecationSchedule"
                  :key="item.id"
                  class="flex items-center gap-4 p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ item.component }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ item.action }} on {{ formatDate(item.date) }}
                    </div>
                  </div>
                  <div class="text-xs" :class="getDaysUntil(item.date) < 30 ? 'text-red-500' : getDaysUntil(item.date) < 90 ? 'text-yellow-500' : 'text-gray-500'">
                    {{ getDaysUntil(item.date) }} days
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref(null);
const filterStatus = ref('all');

const deprecatedComponents = ref([
  {
    id: 1,
    name: 'OldButton',
    status: 'deprecated',
    deprecationDate: new Date('2024-01-15'),
    sunsetDate: new Date('2024-07-15'),
    replacement: 'Button',
    reason: 'Replaced with improved Button component with better accessibility',
    migrationGuide: 'Replace <OldButton> with <Button>\nAll props are compatible.',
    usageCount: 12
  },
  {
    id: 2,
    name: 'LegacyCard',
    status: 'sunset',
    deprecationDate: new Date('2023-11-01'),
    sunsetDate: new Date('2024-05-01'),
    replacement: 'Card',
    reason: 'Legacy component, use new Card component',
    migrationGuide: 'Migrate to Card component:\n1. Replace import\n2. Update props\n3. Test functionality',
    usageCount: 5
  },
  {
    id: 3,
    name: 'DeprecatedModal',
    status: 'retired',
    deprecationDate: new Date('2023-06-01'),
    sunsetDate: new Date('2024-01-01'),
    replacement: 'Modal',
    reason: 'Component retired, use Modal instead',
    migrationGuide: 'Component has been retired. Use Modal component.',
    usageCount: 0
  }
]);

const deprecationSchedule = ref([
  { id: 1, component: 'OldButton', action: 'Sunset', date: new Date('2024-07-15') },
  { id: 2, component: 'LegacyCard', action: 'Retire', date: new Date('2024-05-01') }
]);

const filteredDeprecated = computed(() => {
  if (filterStatus.value === 'all') return deprecatedComponents.value;
  return deprecatedComponents.value.filter(c => c.status === filterStatus.value);
});

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getDaysUntil = (date) => {
  const now = new Date();
  const diff = date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
  selectedComponent.value = deprecatedComponents.value[0];
  
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

