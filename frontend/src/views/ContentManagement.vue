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
                    Component and Pattern Lifecycle Management
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Create new pattern and component pages, and manage statuses throughout their lifecycle.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="contentMgmtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Document/page icon -->
                      <rect x="50" y="40" width="100" height="120" rx="4" fill="url(#contentMgmtGradient)" opacity="0.3"/>
                      <rect x="60" y="50" width="80" height="8" rx="2" fill="url(#contentMgmtGradient)" opacity="0.5"/>
                      <rect x="60" y="65" width="60" height="8" rx="2" fill="url(#contentMgmtGradient)" opacity="0.5"/>
                      <rect x="60" y="80" width="70" height="8" rx="2" fill="url(#contentMgmtGradient)" opacity="0.5"/>
                      <!-- Plus icon for create -->
                      <circle cx="150" cy="50" r="15" fill="url(#contentMgmtGradient)" opacity="0.6"/>
                      <line x1="150" y1="42" x2="150" y2="58" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
                      <line x1="142" y1="50" x2="158" y2="50" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <button
                @click="activeTab = 'create'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'create'
                  ? (isDarkMode 
                    ? 'text-indigo-400 border-b-2 border-indigo-400' 
                    : 'text-indigo-600 border-b-2 border-indigo-600')
                  : (isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-900')"
              >
                Create New
              </button>
              <button
                @click="activeTab = 'manage'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'manage'
                  ? (isDarkMode 
                    ? 'text-indigo-400 border-b-2 border-indigo-400' 
                    : 'text-indigo-600 border-b-2 border-indigo-600')
                  : (isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-900')"
              >
                Manage Existing
              </button>
            </div>
          </div>

          <!-- Create New Tab -->
          <div v-if="activeTab === 'create'" class="max-w-7xl mx-auto">
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
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">add_circle</span>
                  Create New Page
                </h2>
              </div>
              
              <div class="p-6">
                <form @submit.prevent="handleCreateSubmit" class="space-y-6">
                  <!-- Content Type -->
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Content Type <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        @click="newItem.type = 'component'"
                        class="p-4 rounded-lg border-2 transition-all text-left"
                        :class="newItem.type === 'component'
                          ? (isDarkMode 
                            ? 'border-indigo-500 bg-indigo-900/20' 
                            : 'border-indigo-500 bg-indigo-50')
                          : (isDarkMode 
                            ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                            : 'border-gray-300 bg-white hover:border-gray-400')"
                      >
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">widgets</span>
                          <div>
                            <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Component</div>
                            <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Create a new component page</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        @click="newItem.type = 'pattern'"
                        class="p-4 rounded-lg border-2 transition-all text-left"
                        :class="newItem.type === 'pattern'
                          ? (isDarkMode 
                            ? 'border-indigo-500 bg-indigo-900/20' 
                            : 'border-indigo-500 bg-indigo-50')
                          : (isDarkMode 
                            ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                            : 'border-gray-300 bg-white hover:border-gray-400')"
                      >
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">pattern</span>
                          <div>
                            <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Pattern</div>
                            <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Create a new pattern page</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- Name -->
                  <div>
                    <label for="name" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      v-model="newItem.name"
                      type="text"
                      required
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Button, Navigation Pattern"
                    />
                  </div>

                  <!-- Pattern Type (only for patterns) -->
                  <div v-if="newItem.type === 'pattern'">
                    <label for="patternType" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Pattern Type <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      :model-value="newItem.patternType"
                      @update:model-value="newItem.patternType = $event"
                      :options="[
                        { value: '', label: 'Select pattern type' },
                        { value: 'Design Pattern', label: 'Design Pattern' },
                        { value: 'Code Pattern', label: 'Code Pattern' }
                      ]"
                      :is-dark-mode="isDarkMode"
                    />
                  </div>

                  <!-- Category -->
                  <div>
                    <label for="category" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Category
                    </label>
                    <input
                      id="category"
                      v-model="newItem.category"
                      type="text"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Forms, Navigation, Layout"
                    />
                  </div>

                  <!-- Status -->
                  <div>
                    <label for="status" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Status <span class="text-red-500">*</span>
                    </label>
                    <Dropdown
                      :model-value="newItem.status"
                      @update:model-value="newItem.status = $event"
                      :options="statusOptions"
                      :is-dark-mode="isDarkMode"
                    />
                  </div>

                  <!-- Icon -->
                  <div>
                    <label for="icon" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Icon (Material Symbols name)
                    </label>
                    <input
                      id="icon"
                      v-model="newItem.icon"
                      type="text"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., smart_button, navigation"
                    />
                    <p class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Use Material Symbols icon names. Leave empty for default.
                    </p>
                  </div>

                  <!-- Route -->
                  <div>
                    <label for="route" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Route Path <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="route"
                      v-model="newItem.route"
                      type="text"
                      required
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      :placeholder="newItem.type === 'component' ? '/components/example' : '/patterns/example'"
                    />
                    <p class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      URL path for the new page (e.g., /components/button or /patterns/navigation)
                    </p>
                  </div>

                  <!-- Submit Button -->
                  <div class="flex gap-4 pt-4">
                    <button
                      type="submit"
                      class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Create Page
                    </button>
                    <button
                      type="button"
                      @click="resetForm"
                      class="px-6 py-2 rounded-lg border transition-colors font-medium"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Manage Existing Tab -->
          <div v-if="activeTab === 'manage'" class="max-w-7xl mx-auto space-y-6">
            <!-- Components Section -->
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
                  Components
                </h2>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Component</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Version</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Actions</th>
                    </tr>
                  </thead>
                  <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                    <tr 
                      v-for="component in components" 
                      :key="component.name"
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ component.icon }}</span>
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
                        <button
                          @click="editItem('component', component)"
                          class="px-3 py-1 text-sm rounded-lg transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Patterns Section -->
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
                  Patterns
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
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Actions</th>
                    </tr>
                  </thead>
                  <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                    <tr 
                      v-for="pattern in patterns" 
                      :key="pattern.name"
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
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
                        <button
                          @click="editItem('pattern', pattern)"
                          class="px-3 py-1 text-sm rounded-lg transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        >
                          Edit
                        </button>
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

    <!-- Edit Status Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="closeEditModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div 
        class="relative w-full max-w-md rounded-2xl border shadow-xl"
        :class="isDarkMode 
          ? 'bg-slate-900 border-gray-700' 
          : 'bg-white border-gray-200'"
      >
        <div 
          class="px-6 py-4 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <h3 class="text-xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">edit</span>
            Edit Status
          </h3>
          <button
            @click="closeEditModal"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode 
              ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                {{ editingItem?.icon || 'widgets' }}
              </span>
              <div>
                <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ editingItem?.name }}
                </div>
                <div v-if="editingItemType" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ editingItemType === 'component' ? 'Component' : (editingItem?.type || 'Pattern') }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-6">
            <label for="editStatus" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Status <span class="text-red-500">*</span>
            </label>
            <Dropdown
              v-if="editingItem"
              :model-value="editingItem.status"
              @update:model-value="editingItem.status = $event"
              :options="statusOptions"
              :is-dark-mode="isDarkMode"
            />
          </div>
          
          <div class="flex gap-4">
            <button
              @click="saveStatusChange"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              @click="closeEditModal"
              class="flex-1 px-4 py-2 rounded-lg border transition-colors font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
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
import Dropdown from '../components/Dropdown.vue';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const { components, patterns, updateComponentStatus, updatePatternStatus } = useComponentPatternStatus();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('create');
const showEditModal = ref(false);
const editingItem = ref(null);
const editingItemType = ref(null);

// Form data for creating new items
const newItem = ref({
  type: 'component',
  name: '',
  patternType: '',
  category: '',
  status: 'Production Ready',
  icon: '',
  route: ''
});

// Components and patterns are now loaded from the shared composable

// Status options for dropdowns
const statusOptions = [
  { value: 'Production Ready', label: 'Production Ready' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Planned', label: 'Planned' },
  { value: 'Experimental', label: 'Experimental' },
  { value: 'Sunsetting', label: 'Sunsetting' },
  { value: 'Deprecated', label: 'Deprecated' }
];

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

const resetForm = () => {
  newItem.value = {
    type: 'component',
    name: '',
    patternType: '',
    category: '',
    status: 'Production Ready',
    icon: '',
    route: ''
  };
};

const handleCreateSubmit = () => {
  // In a real app, this would make an API call to create the page
  console.log('Creating new page:', newItem.value);
  
  // Show success message
  alert(`Successfully created ${newItem.value.type}: ${newItem.value.name}`);
  
  // Reset form
  resetForm();
  
  // Switch to manage tab to see the new item
  activeTab.value = 'manage';
};

const updateStatus = (type, name, newStatus) => {
  // Update status using the shared composable
  if (type === 'component') {
    updateComponentStatus(name, newStatus);
  } else if (type === 'pattern') {
    updatePatternStatus(name, newStatus);
  }
  
  // Show success message
  alert(`Status updated to ${newStatus}`);
};

const editItem = (type, item) => {
  editingItemType.value = type;
  // Create a copy with all properties, including type for patterns
  editingItem.value = { 
    ...item,
    type: type === 'component' ? 'component' : item.type || 'Pattern'
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingItem.value = null;
  editingItemType.value = null;
};

const saveStatusChange = () => {
  if (!editingItem.value || !editingItemType.value) return;
  
  // Update status using the shared composable
  if (editingItemType.value === 'component') {
    updateComponentStatus(editingItem.value.name, editingItem.value.status);
  } else if (editingItemType.value === 'pattern') {
    updatePatternStatus(editingItem.value.name, editingItem.value.status);
  }
  
  // Show success message
  alert(`Status updated to ${editingItem.value.status}`);
  
  // Close modal
  closeEditModal();
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

