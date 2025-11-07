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
                  Change Notifications
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Stay informed about component and token changes. Configure alerts and track updates across your design system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Notification Settings -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Notification Preferences -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Notification Preferences
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="preferences.componentChanges" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Component Changes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="preferences.tokenChanges" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Token Changes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="preferences.breakingChanges" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Breaking Changes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="preferences.deprecations" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Deprecations</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="preferences.newComponents" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">New Components</span>
                </label>
              </div>
            </div>

            <!-- Notification Channels -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Notification Channels
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="channels.inApp" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">In-App</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="channels.email" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Email</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="channels.slack" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Slack</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="channels.webhook" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Webhook</span>
                </label>
              </div>
            </div>

            <!-- Subscribe to Components -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Subscribe to Components
              </h3>
              <select
                v-model="selectedComponent"
                @change="subscribeToComponent"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Select component...</option>
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="modal">Modal</option>
              </select>
              <div class="space-y-2">
                <div
                  v-for="sub in subscriptions"
                  :key="sub.id"
                  class="flex items-center justify-between p-2 rounded-lg"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                >
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sub.name }}</span>
                  <button
                    @click="unsubscribe(sub.id)"
                    class="text-xs text-red-500 hover:text-red-600"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Change History -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Recent Changes -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Recent Changes
                </h3>
                <select
                  v-model="filterType"
                  class="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="all">All Changes</option>
                  <option value="components">Components</option>
                  <option value="tokens">Tokens</option>
                  <option value="breaking">Breaking Changes</option>
                </select>
              </div>
              <div class="space-y-3">
                <div
                  v-for="change in filteredChanges"
                  :key="change.id"
                  class="p-4 rounded-lg border"
                  :class="change.type === 'breaking'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : change.type === 'deprecation'
                    ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                    : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200')"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span 
                          class="text-xs px-2 py-1 rounded font-medium"
                          :class="change.type === 'breaking'
                            ? (isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700')
                            : change.type === 'deprecation'
                            ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                            : change.category === 'component'
                            ? (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700')
                            : (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700')"
                        >
                          {{ change.type === 'breaking' ? 'Breaking' : change.type === 'deprecation' ? 'Deprecated' : change.category === 'component' ? 'Component' : 'Token' }}
                        </span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ change.name }}
                        </span>
                      </div>
                      <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ change.description }}
                      </div>
                      <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        <span>{{ formatDate(change.timestamp) }}</span>
                        <span>by {{ change.author }}</span>
                        <span v-if="change.version">v{{ change.version }}</span>
                      </div>
                    </div>
                    <button
                      v-if="!change.read"
                      @click="markAsRead(change.id)"
                      class="ml-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Mark as read"
                    >
                      <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">check</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Change Summary -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Change Summary
              </h3>
              <div class="grid grid-cols-4 gap-4">
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    {{ changeStats.components }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</div>
                </div>
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    {{ changeStats.tokens }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Tokens</div>
                </div>
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ changeStats.breaking }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Breaking</div>
                </div>
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">
                    {{ changeStats.deprecations }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Deprecated</div>
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
const selectedComponent = ref('');
const filterType = ref('all');
const preferences = ref({
  componentChanges: true,
  tokenChanges: true,
  breakingChanges: true,
  deprecations: true,
  newComponents: true
});
const channels = ref({
  inApp: true,
  email: false,
  slack: false,
  webhook: false
});
const subscriptions = ref([
  { id: 1, name: 'Button' },
  { id: 2, name: 'Card' }
]);

const changes = ref([
  {
    id: 1,
    name: 'Button Component',
    description: 'Added new "outline" variant',
    category: 'component',
    type: 'update',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    author: 'John Doe',
    version: '2.1.0',
    read: false
  },
  {
    id: 2,
    name: 'color.primary Token',
    description: 'Updated primary color value',
    category: 'token',
    type: 'update',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    author: 'Jane Smith',
    version: '1.5.2',
    read: false
  },
  {
    id: 3,
    name: 'Modal Component',
    description: 'Breaking: Changed prop name from "isOpen" to "open"',
    category: 'component',
    type: 'breaking',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    author: 'John Doe',
    version: '3.0.0',
    read: false
  },
  {
    id: 4,
    name: 'OldCard Component',
    description: 'Component deprecated, use Card instead',
    category: 'component',
    type: 'deprecation',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    author: 'Jane Smith',
    version: '2.0.0',
    read: true
  }
]);

const filteredChanges = computed(() => {
  if (filterType.value === 'all') return changes.value;
  if (filterType.value === 'components') return changes.value.filter(c => c.category === 'component');
  if (filterType.value === 'tokens') return changes.value.filter(c => c.category === 'token');
  if (filterType.value === 'breaking') return changes.value.filter(c => c.type === 'breaking');
  return changes.value;
});

const changeStats = computed(() => {
  return {
    components: changes.value.filter(c => c.category === 'component').length,
    tokens: changes.value.filter(c => c.category === 'token').length,
    breaking: changes.value.filter(c => c.type === 'breaking').length,
    deprecations: changes.value.filter(c => c.type === 'deprecation').length
  };
});

const formatDate = (date) => {
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const subscribeToComponent = () => {
  if (!selectedComponent.value) return;
  if (subscriptions.value.some(s => s.name.toLowerCase() === selectedComponent.value.toLowerCase())) return;
  
  subscriptions.value.push({
    id: subscriptions.value.length + 1,
    name: selectedComponent.value.charAt(0).toUpperCase() + selectedComponent.value.slice(1)
  });
  selectedComponent.value = '';
};

const unsubscribe = (id) => {
  const index = subscriptions.value.findIndex(s => s.id === id);
  if (index > -1) {
    subscriptions.value.splice(index, 1);
  }
};

const markAsRead = (id) => {
  const change = changes.value.find(c => c.id === id);
  if (change) {
    change.read = true;
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

