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
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Icon Library
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Upload and manage icon sets from Material Icons, Lucide, and custom collections. Browse, search, and copy icons for your projects.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Icon Management
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
                        <linearGradient id="iconLibraryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized icon library icon -->
                      <circle cx="50" cy="50" r="20" fill="url(#iconLibraryGradient)" opacity="0.6"/>
                      <circle cx="150" cy="50" r="20" fill="url(#iconLibraryGradient)" opacity="0.5"/>
                      <circle cx="50" cy="150" r="20" fill="url(#iconLibraryGradient)" opacity="0.7"/>
                      <circle cx="150" cy="150" r="20" fill="url(#iconLibraryGradient)" opacity="0.4"/>
                      <rect x="100" y="90" width="20" height="20" rx="4" fill="url(#iconLibraryGradient)" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div 
              class="rounded-lg border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Upload Icon Set</h2>
                <button
                  @click="showUploadModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">upload</span>
                  Upload Icons
                </button>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Upload icon sets from Material Icons, Lucide, or your own custom SVG collections. Supported formats: SVG files, SVG sprite sheets, and icon font files.
              </p>
            </div>
          </div>

          <!-- Icon Sets Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Icon Sets</h2>
              <div class="flex items-center gap-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search icons..."
                  class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
                <select
                  v-model="selectedSet"
                  class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="">All Sets</option>
                  <option v-for="set in iconSets" :key="set.id" :value="set.id">{{ set.name }}</option>
                </select>
              </div>
            </div>

            <!-- Icon Sets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div
                v-for="set in filteredSets"
                :key="set.id"
                class="rounded-lg border p-6 transition-all cursor-pointer"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
                @click="selectedSet = set.id"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ set.name }}</h3>
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="isDarkMode 
                      ? 'bg-indigo-900/30 text-indigo-300' 
                      : 'bg-indigo-100 text-indigo-700'"
                  >
                    {{ set.iconCount }} icons
                  </span>
                </div>
                <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ set.description }}</p>
                <div class="flex items-center gap-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  <span class="material-symbols-outlined text-base">{{ set.sourceIcon }}</span>
                  {{ set.source }}
                </div>
              </div>
            </div>

            <!-- Icons Grid -->
            <div 
              v-if="selectedSet" 
              class="rounded-lg border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ getSelectedSet()?.name }} Icons
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    @click="viewMode = 'grid'"
                    class="p-2 rounded-lg transition-colors"
                    :class="viewMode === 'grid' 
                      ? (isDarkMode 
                        ? 'bg-indigo-900/30 text-indigo-400' 
                        : 'bg-indigo-100 text-indigo-600')
                      : (isDarkMode
                        ? 'text-gray-400 hover:bg-slate-700' 
                        : 'text-gray-400 hover:bg-gray-100')"
                  >
                    <span class="material-symbols-outlined">grid_view</span>
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    class="p-2 rounded-lg transition-colors"
                    :class="viewMode === 'list' 
                      ? (isDarkMode 
                        ? 'bg-indigo-900/30 text-indigo-400' 
                        : 'bg-indigo-100 text-indigo-600')
                      : (isDarkMode
                        ? 'text-gray-400 hover:bg-slate-700' 
                        : 'text-gray-400 hover:bg-gray-100')"
                  >
                    <span class="material-symbols-outlined">view_list</span>
                  </button>
                </div>
              </div>

              <div v-if="viewMode === 'grid'" class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon.id"
                  class="group relative rounded-lg p-4 transition-colors cursor-pointer border border-transparent"
                  :class="isDarkMode 
                    ? 'bg-slate-700 hover:bg-indigo-900/20 hover:border-indigo-700' 
                    : 'bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300'"
                  @click="selectIcon(icon)"
                >
                  <div class="flex flex-col items-center gap-2">
                    <div class="text-2xl" :class="isDarkMode ? 'text-white' : 'text-gray-900'" v-html="icon.svg"></div>
                    <span class="text-xs text-center truncate w-full" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ icon.name }}</span>
                  </div>
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click.stop="copyIcon(icon)"
                      class="p-1 rounded shadow-lg transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 text-gray-400 hover:text-indigo-400' 
                        : 'bg-white text-gray-600 hover:text-indigo-600'"
                      title="Copy icon"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon.id"
                  class="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer"
                  :class="isDarkMode 
                    ? 'bg-slate-700 hover:bg-indigo-900/20' 
                    : 'bg-gray-50 hover:bg-indigo-50'"
                  @click="selectIcon(icon)"
                >
                  <div class="flex items-center gap-4">
                    <div class="text-xl" :class="isDarkMode ? 'text-white' : 'text-gray-900'" v-html="icon.svg"></div>
                    <div>
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ icon.name }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ icon.category }}</div>
                    </div>
                  </div>
                  <button
                    @click.stop="copyIcon(icon)"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-800' 
                      : 'text-gray-400 hover:text-indigo-600 hover:bg-white'"
                    title="Copy icon"
                  >
                    <span class="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showUploadModal = false"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Upload Icon Set</h3>
            <button
              @click="showUploadModal = false"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Icon Set Name
            </label>
            <input
              v-model="newSetName"
              type="text"
              placeholder="e.g., Material Icons, Lucide Icons, Custom Set"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Source Type
            </label>
            <select
              v-model="newSetSource"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="material">Material Icons</option>
              <option value="lucide">Lucide Icons</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Upload Files
            </label>
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
              :class="isDragging 
                ? (isDarkMode 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-indigo-500 bg-indigo-50')
                : (isDarkMode 
                  ? 'border-gray-600' 
                  : 'border-gray-300')"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".svg,.woff,.woff2,.ttf,.eot"
                @change="handleFileSelect"
                class="hidden"
              />
              <span class="material-symbols-outlined text-4xl mb-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">cloud_upload</span>
              <p class="mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Drag and drop icon files here, or
                <button
                  @click="fileInput?.click()"
                  class="hover:underline"
                  :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
                >
                  browse
                </button>
              </p>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Supported formats: SVG files, SVG sprite sheets, icon fonts (WOFF, WOFF2, TTF, EOT)
              </p>
            </div>
            <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-50'"
              >
                <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ file.name }}</span>
                <button
                  @click="removeFile(index)"
                  class="transition-colors"
                  :class="isDarkMode 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-red-600 hover:text-red-700'"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button
              @click="showUploadModal = false"
              class="px-4 py-2 border rounded-lg transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
            <button
              @click="uploadIconSet"
              :disabled="!newSetName || selectedFiles.length === 0"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const showUploadModal = ref(false);
const searchQuery = ref('');
const selectedSet = ref('');
const viewMode = ref('grid');
const newSetName = ref('');
const newSetSource = ref('custom');
const selectedFiles = ref([]);
const isDragging = ref(false);
const fileInput = ref(null);

const iconSets = ref([
  {
    id: 'material',
    name: 'Material Icons',
    source: 'Google',
    sourceIcon: 'palette',
    description: 'Material Design icons from Google',
    iconCount: 2000,
    icons: [
      { id: 'home', name: 'home', category: 'Navigation', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
      { id: 'search', name: 'search', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' },
      { id: 'favorite', name: 'favorite', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
    ]
  },
  {
    id: 'lucide',
    name: 'Lucide Icons',
    source: 'Lucide',
    sourceIcon: 'auto_awesome',
    description: 'Beautiful & consistent icon toolkit',
    iconCount: 1000,
    icons: [
      { id: 'lucide-home', name: 'home', category: 'Navigation', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
      { id: 'lucide-search', name: 'search', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' },
      { id: 'lucide-heart', name: 'heart', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
    ]
  }
]);

const filteredSets = computed(() => {
  if (!searchQuery.value) return iconSets.value;
  const query = searchQuery.value.toLowerCase();
  return iconSets.value.filter(set =>
    set.name.toLowerCase().includes(query) ||
    set.description.toLowerCase().includes(query) ||
    set.source.toLowerCase().includes(query)
  );
});

const filteredIcons = computed(() => {
  const set = getSelectedSet();
  if (!set) return [];
  let icons = set.icons || [];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    icons = icons.filter(icon =>
      icon.name.toLowerCase().includes(query) ||
      icon.category.toLowerCase().includes(query)
    );
  }
  return icons;
});

const getSelectedSet = () => {
  return iconSets.value.find(set => set.id === selectedSet.value);
};

const selectIcon = (icon) => {
  // Handle icon selection
  console.log('Selected icon:', icon);
};

const copyIcon = async (icon) => {
  try {
    await navigator.clipboard.writeText(icon.svg);
    // Show success message
    alert('Icon copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy icon:', err);
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  addFiles(files);
};

const addFiles = (files) => {
  const validFiles = files.filter(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['svg', 'woff', 'woff2', 'ttf', 'eot'].includes(ext);
  });
  selectedFiles.value.push(...validFiles);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const uploadIconSet = async () => {
  if (!newSetName.value || selectedFiles.value.length === 0) return;
  
  // TODO: Implement actual upload logic
  // For now, just add to iconSets
  const newSet = {
    id: newSetName.value.toLowerCase().replace(/\s+/g, '-'),
    name: newSetName.value,
    source: newSetSource.value === 'material' ? 'Google' : newSetSource.value === 'lucide' ? 'Lucide' : 'Custom',
    sourceIcon: newSetSource.value === 'material' ? 'palette' : newSetSource.value === 'lucide' ? 'auto_awesome' : 'upload',
    description: `Custom icon set uploaded from ${newSetSource.value}`,
    iconCount: selectedFiles.value.length,
    icons: [] // Would be parsed from uploaded files
  };
  
  iconSets.value.push(newSet);
  selectedSet.value = newSet.id;
  showUploadModal.value = false;
  newSetName.value = '';
  selectedFiles.value = [];
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

