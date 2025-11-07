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
                  Multi-Brand Support
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Manage multiple brands and white-label systems. Create brand-specific themes, tokens, and components.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Brand Management -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Brand List -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Brands
                </h3>
                <button
                  @click="showAddBrand = true"
                  class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  + Add
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="brand in brands"
                  :key="brand.id"
                  @click="selectedBrand = brand"
                  class="p-3 rounded-lg cursor-pointer transition-colors"
                  :class="selectedBrand?.id === brand.id
                    ? (isDarkMode ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200')
                    : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100')"
                >
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      :style="{ backgroundColor: brand.primaryColor }"
                    >
                      {{ brand.name.charAt(0) }}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ brand.name }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ brand.components }} components
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Brand Settings -->
            <div 
              v-if="selectedBrand"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Brand Settings
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Brand Name
                  </label>
                  <input
                    v-model="selectedBrand.name"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Primary Color
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="selectedBrand.primaryColor"
                      type="color"
                      class="w-12 h-10 rounded border"
                      :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    />
                    <input
                      v-model="selectedBrand.primaryColor"
                      type="text"
                      class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Secondary Color
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="selectedBrand.secondaryColor"
                      type="color"
                      class="w-12 h-10 rounded border"
                      :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    />
                    <input
                      v-model="selectedBrand.secondaryColor"
                      type="text"
                      class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                </div>
                <button
                  @click="saveBrand"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  Save Brand
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Brand Preview & Components -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Brand Preview -->
            <div 
              v-if="selectedBrand"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Brand Preview
              </h3>
              <div 
                class="rounded-lg p-8"
                :style="{ backgroundColor: selectedBrand.primaryColor }"
              >
                <div class="text-white">
                  <h2 class="text-2xl font-bold mb-4">{{ selectedBrand.name }}</h2>
                  <p class="mb-6 opacity-90">Brand preview with primary color</p>
                  <button 
                    class="px-6 py-2 rounded-lg font-medium"
                    :style="{ backgroundColor: selectedBrand.secondaryColor, color: '#fff' }"
                  >
                    Action Button
                  </button>
                </div>
              </div>
            </div>

            <!-- Brand Components -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Brand Components
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div
                  v-for="component in brandComponents"
                  :key="component.id"
                  class="p-4 rounded-lg border"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'"
                >
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ component.name }}
                  </div>
                  <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ component.brand }}
                  </div>
                  <div class="flex items-center gap-2">
                    <span 
                      class="text-xs px-2 py-1 rounded"
                      :class="component.status === 'active'
                        ? (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')"
                    >
                      {{ component.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Brand Modal -->
        <div
          v-if="showAddBrand"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showAddBrand = false"
          role="dialog"
          aria-modal="true"
        >
          <div 
            class="relative w-full max-w-md rounded-lg shadow-xl border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h2 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Add New Brand
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Brand Name
                </label>
                <input
                  v-model="newBrand.name"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>
              <div class="flex items-center gap-4">
                <button
                  @click="createBrand"
                  class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  Create
                </button>
                <button
                  @click="showAddBrand = false; newBrand = { name: '', primaryColor: '#4f46e5', secondaryColor: '#6366f1' }"
                  class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Cancel
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedBrand = ref(null);
const showAddBrand = ref(false);
const newBrand = ref({ name: '', primaryColor: '#4f46e5', secondaryColor: '#6366f1' });

const brands = ref([
  {
    id: 1,
    name: 'Primary Brand',
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    components: 24
  },
  {
    id: 2,
    name: 'Enterprise',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    components: 18
  },
  {
    id: 3,
    name: 'Consumer',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    components: 15
  }
]);

const brandComponents = computed(() => {
  if (!selectedBrand) return [];
  return [
    { id: 1, name: 'Button', brand: selectedBrand.name, status: 'active' },
    { id: 2, name: 'Card', brand: selectedBrand.name, status: 'active' },
    { id: 3, name: 'Input', brand: selectedBrand.name, status: 'active' }
  ];
});

const createBrand = () => {
  if (!newBrand.value.name.trim()) return;
  
  brands.value.push({
    id: brands.value.length + 1,
    name: newBrand.value.name,
    primaryColor: newBrand.value.primaryColor,
    secondaryColor: newBrand.value.secondaryColor,
    components: 0
  });
  
  showAddBrand.value = false;
  newBrand.value = { name: '', primaryColor: '#4f46e5', secondaryColor: '#6366f1' };
};

const saveBrand = () => {
  // Save brand logic
  console.log('Saving brand:', selectedBrand.value);
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
  selectedBrand.value = brands.value[0];
  
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

