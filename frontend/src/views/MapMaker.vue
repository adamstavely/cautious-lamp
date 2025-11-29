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
                      Map Maker
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create interactive choropleth and flow maps with accurate geographic boundaries using TopoJSON data and D3-geo projections.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">map</span>
                      Data Visualization
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Map representation -->
                      <path d="M 30 50 L 30 150 L 80 140 L 120 150 L 170 140 L 170 50 Z" fill="url(#mapGradient)" opacity="0.3" stroke="#fff" stroke-width="2"/>
                      <circle cx="60" cy="100" r="8" fill="url(#mapGradient)" opacity="0.8"/>
                      <circle cx="130" cy="90" r="8" fill="url(#mapGradient)" opacity="0.8"/>
                      <path d="M 60 100 Q 95 95 130 90" stroke="url(#mapGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Map Type Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 
                class="text-lg font-semibold mb-6 flex items-center gap-2" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                <span class="material-symbols-outlined text-indigo-600">map</span>
                Map Type
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  v-for="type in mapTypes"
                  :key="type.value"
                  @click="selectedMapType = type.value"
                  class="p-4 rounded-lg border-2 transition-all text-left"
                  :class="selectedMapType === type.value
                    ? (isDarkMode 
                      ? 'border-indigo-400 bg-indigo-900/20' 
                      : 'border-indigo-500 bg-indigo-50')
                    : (isDarkMode
                      ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                      : 'border-gray-300 bg-white hover:border-gray-400')"
                >
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-3xl" :class="selectedMapType === type.value ? 'text-indigo-400' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')">
                      {{ type.icon }}
                    </span>
                    <div>
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ type.label }}</h3>
                      <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ type.description }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Configuration Panel -->
              <div class="lg:col-span-1 space-y-6">
                <!-- Map Configuration -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">settings</span>
                    Map Configuration
                  </h3>
                  
                  <div class="space-y-4">
                    <!-- Map Type (US/World) -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Geographic Area
                      </label>
                      <select
                        v-model="mapConfig.mapType"
                        @change="handleMapTypeChange"
                        class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'"
                      >
                        <option value="us">United States</option>
                        <option value="world">World</option>
                      </select>
                    </div>

                    <!-- Projection Type (for world maps) -->
                    <div v-if="mapConfig.mapType === 'world'">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Projection
                      </label>
                      <select
                        v-model="mapConfig.mapProjection"
                        class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'"
                      >
                        <option value="equalEarth">Equal Earth</option>
                        <option value="mercator">Mercator</option>
                      </select>
                    </div>

                    <!-- Show All Regions (for choropleth) -->
                    <div v-if="selectedMapType === 'choropleth'">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          v-model="mapConfig.showAllRegions"
                          type="checkbox"
                          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Show all regions
                        </span>
                      </label>
                    </div>

                    <!-- Color Scheme -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Color Scheme
                      </label>
                      <select
                        v-model="mapConfig.colorScheme"
                        class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'"
                      >
                        <option v-for="scheme in colorSchemeOptions" :key="scheme.value" :value="scheme.value">
                          {{ scheme.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Data Input Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">database</span>
                    Data
                  </h3>
                  
                  <!-- Choropleth Data Input -->
                  <div v-if="selectedMapType === 'choropleth'">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Regions
                    </label>
                    <div class="space-y-2">
                      <div 
                        v-for="(region, index) in choroplethData"
                        :key="index"
                        class="flex gap-2"
                      >
                        <input
                          v-model="region.name"
                          type="text"
                          placeholder="Region name"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="region.value"
                          type="number"
                          placeholder="Value"
                          class="w-32 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <button
                          @click="choroplethData.splice(index, 1)"
                          class="px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          :disabled="choroplethData.length <= 1"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <button
                        @click="choroplethData.push({ name: `Region ${choroplethData.length + 1}`, value: 0 })"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Region
                      </button>
                    </div>
                  </div>

                  <!-- Flow Map Data Input -->
                  <div v-else-if="selectedMapType === 'flowMap'">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Flow Map Data
                    </label>
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Locations:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(node, index) in flowMapData.nodes"
                            :key="index"
                            class="flex gap-2 flex-wrap"
                          >
                            <input
                              v-model="node.id"
                              type="text"
                              placeholder="ID"
                              class="w-20 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model="node.label"
                              type="text"
                              placeholder="Location name"
                              class="flex-1 min-w-[120px] px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model.number="node.lat"
                              type="number"
                              step="0.0001"
                              placeholder="Latitude"
                              class="w-24 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model.number="node.lng"
                              type="number"
                              step="0.0001"
                              placeholder="Longitude"
                              class="w-24 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <button
                              @click="flowMapData.nodes.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              :disabled="flowMapData.nodes.length <= 2"
                            >
                              <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                          <button
                            @click="flowMapData.nodes.push({ id: `Loc${flowMapData.nodes.length + 1}`, label: `Location ${flowMapData.nodes.length + 1}`, lat: 0, lng: 0 })"
                            class="w-full px-3 py-2 rounded-lg border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-sm align-middle mr-1">add</span>
                            Add Location
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Flows:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(link, index) in flowMapData.links"
                            :key="index"
                            class="flex gap-2"
                          >
                            <select
                              v-model="link.source"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option v-for="node in flowMapData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                            </select>
                            <span class="self-center text-gray-500">→</span>
                            <select
                              v-model="link.target"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option v-for="node in flowMapData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                            </select>
                            <input
                              v-model.number="link.value"
                              type="number"
                              placeholder="Value"
                              class="w-20 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <button
                              @click="flowMapData.links.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                          <button
                            @click="flowMapData.links.push({ source: flowMapData.nodes[0]?.id || '', target: flowMapData.nodes[1]?.id || '', value: 10 })"
                            class="w-full px-3 py-2 rounded-lg border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-sm align-middle mr-1">add</span>
                            Add Flow
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Map Preview -->
              <div class="lg:col-span-2">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-indigo-600">preview</span>
                      Preview
                    </h3>
                    <!-- Back button for drill-down -->
                    <button
                      v-if="mapConfig.mapType === 'world' && drillDownState.level === 'country'"
                      @click="handleDrillUp"
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 text-white hover:bg-slate-700 border border-gray-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
                    >
                      <span class="material-symbols-outlined text-base">arrow_back</span>
                      Back to World
                    </button>
                  </div>
                  
                  <!-- Breadcrumb navigation -->
                  <div v-if="mapConfig.mapType === 'world' && drillDownState.breadcrumbs.length > 0" class="mb-2 flex items-center gap-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <span>World</span>
                    <span class="material-symbols-outlined text-xs">chevron_right</span>
                    <span>{{ drillDownState.selectedCountry }}</span>
                  </div>
                  
                  <!-- Drill-down instruction -->
                  <div v-if="mapConfig.mapType === 'world' && drillDownState.level === 'world' && selectedMapType === 'choropleth'" class="mb-2 p-2 rounded-lg text-sm flex items-center gap-2" :class="isDarkMode ? 'bg-indigo-900/20 text-indigo-300 border border-indigo-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'">
                    <span class="material-symbols-outlined text-base">info</span>
                    <span>Click on a country to view its regions (e.g., United States)</span>
                  </div>
                  
                  <div class="w-full h-[600px] border rounded-lg overflow-hidden relative" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                    <!-- Choropleth Map -->
                    <ChoroplethMapSVG 
                      v-if="selectedMapType === 'choropleth'"
                      :data="choroplethData" 
                      :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                      :mapType="mapConfig.mapType || 'us'"
                      :showAllRegions="mapConfig.showAllRegions !== false"
                      :drillDownState="drillDownState"
                      :onDrillDown="handleDrillDown"
                      :onDrillUp="handleDrillUp"
                    />
                    
                    <!-- Flow Map -->
                    <FlowMapSVG 
                      v-else-if="selectedMapType === 'flowMap'"
                      :data="flowMapData" 
                      :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                      :mapType="mapConfig.mapType || 'us'"
                    />
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, h } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { loadTopoJSON, getGeoJSONFeatures, mapDataToFeatures, getFeatureCentroid, getDefaultMapUrls, getCountryMapUrl, getCountryObjectName } from '../utils/mapData.js';
import { createProjection, createPathGenerator, projectCoordinates, fitProjectionToFeatures } from '../utils/mapProjections.js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();

const mapTypes = [
  { value: 'choropleth', label: 'Choropleth Map', icon: 'map', description: 'Geographic regions colored by data values' },
  { value: 'flowMap', label: 'Flow Map', icon: 'route', description: 'Shows movement/flow between locations' }
];

const selectedMapType = ref('choropleth');

const mapConfig = ref({
  mapType: 'us', // 'us' | 'world'
  mapProjection: 'equalEarth', // 'mercator' | 'equalEarth' (for world maps)
  showAllRegions: true, // Show all regions or only data regions
  colorScheme: 'default'
});

// Drill-down state
const drillDownState = ref({
  level: 'world', // 'world' | 'country'
  selectedCountry: null, // Country name when drilled down
  breadcrumbs: [] // Navigation breadcrumbs
});

const colorSchemes = {
  default: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
  green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
  orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb']
};

const colorSchemeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' }
];

// Choropleth map data
const choroplethData = ref([
  { name: 'California', value: 39538223, coordinates: null },
  { name: 'Texas', value: 29145505, coordinates: null },
  { name: 'Florida', value: 21538187, coordinates: null },
  { name: 'New York', value: 20201249, coordinates: null },
  { name: 'Pennsylvania', value: 13002700, coordinates: null }
]);

// Flow map data
const flowMapData = ref({
  nodes: [
    { id: 'NYC', label: 'New York', lat: 40.7128, lng: -74.0060 },
    { id: 'LA', label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { id: 'CHI', label: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { id: 'HOU', label: 'Houston', lat: 29.7604, lng: -95.3698 }
  ],
  links: [
    { source: 'NYC', target: 'LA', value: 500 },
    { source: 'NYC', target: 'CHI', value: 300 },
    { source: 'LA', target: 'HOU', value: 200 },
    { source: 'CHI', target: 'HOU', value: 150 }
  ]
});

// Choropleth Map SVG Component
const ChoroplethMapSVG = {
  props: ['data', 'colors', 'mapType', 'showAllRegions', 'drillDownState', 'onDrillDown', 'onDrillUp'],
  setup(props) {
    const containerRef = ref(null);
    const width = ref(800);
    const height = ref(500);
    const loading = ref(true);
    const error = ref(null);
    const topoJsonData = ref(null);
    const features = ref([]);
    const projection = ref(null);
    const pathGenerator = ref(null);
    
    // Update dimensions on resize
    const updateDimensions = () => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect();
        width.value = rect.width || 800;
        height.value = rect.height || 500;
        
        // Recreate projection with new dimensions
        if (props.mapType) {
          const mapTypeValue = props.mapType || 'us';
          const proj = createProjection(mapTypeValue, width.value, height.value);
          projection.value = proj;
          pathGenerator.value = createPathGenerator(proj);
        }
      }
    };
    
    // Calculate color scale
    const colorScale = computed(() => {
      if (!props.data || props.data.length === 0) return () => props.colors[0] || '#ccc';
      
      const values = props.data.map(r => r.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      
      return (value) => {
        const normalizedValue = (value - min) / range;
        const colorIndex = Math.floor(normalizedValue * (props.colors.length - 1));
        return props.colors[colorIndex] || props.colors[0] || '#ccc';
      };
    });
    
    // Map data regions to features
    const dataFeatureMap = computed(() => {
      if (!features.value.length || !props.data) return new Map();
      return mapDataToFeatures(props.data, features.value);
    });
    
    // Get default color for regions without data
    const defaultColor = '#e5e7eb';
    
    // Load TopoJSON data
    onMounted(async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const mapType = props.mapType || 'us';
        const mapUrls = getDefaultMapUrls();
        const url = mapType === 'us' ? mapUrls.us : mapUrls.world;
        const objectName = mapType === 'us' ? 'states' : 'countries';
        
        // Load TopoJSON
        const topoJson = await loadTopoJSON(url);
        topoJsonData.value = topoJson;
        
        // Convert to GeoJSON features
        const geoFeatures = getGeoJSONFeatures(topoJson, objectName);
        features.value = geoFeatures;
        
        // Create projection
        const mapTypeValue = props.mapType || 'us';
        const proj = createProjection(mapTypeValue, width.value, height.value);
        projection.value = proj;
        
        // Create path generator
        pathGenerator.value = createPathGenerator(proj);
        
        // Set up resize observer after initial render
        await nextTick();
        if (containerRef.value) {
          const resizeObserver = new ResizeObserver(() => {
            updateDimensions();
          });
          resizeObserver.observe(containerRef.value);
          
          // Cleanup on unmount
          onBeforeUnmount(() => {
            resizeObserver.disconnect();
          });
        }
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading map data:', err);
        error.value = err.message || 'Failed to load map data';
        loading.value = false;
      }
    });
    
    // Watch for mapType changes
    watch(() => props.mapType, async (newMapType) => {
      if (!newMapType) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        const mapUrls = getDefaultMapUrls();
        const url = newMapType === 'us' ? mapUrls.us : mapUrls.world;
        const objectName = newMapType === 'us' ? 'states' : 'countries';
        
        const topoJson = await loadTopoJSON(url);
        topoJsonData.value = topoJson;
        
        const geoFeatures = getGeoJSONFeatures(topoJson, objectName);
        features.value = geoFeatures;
        
        const proj = createProjection(newMapType, width.value, height.value);
        projection.value = proj;
        pathGenerator.value = createPathGenerator(proj);
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading map data:', err);
        error.value = err.message || 'Failed to load map data';
        loading.value = false;
      }
    });
    
    // Watch for drill-down state changes
    watch(() => props.drillDownState, async (newState) => {
      if (!newState || !props.mapType || props.mapType !== 'world') return;
      
      // If drilling down to a country
      if (newState.level === 'country' && newState.selectedCountry) {
        try {
          loading.value = true;
          error.value = null;
          
          const countryUrl = getCountryMapUrl(newState.selectedCountry);
          if (!countryUrl) {
            error.value = `Detailed map data not available for ${newState.selectedCountry}`;
            loading.value = false;
            return;
          }
          
          const objectName = getCountryObjectName(newState.selectedCountry);
          const topoJson = await loadTopoJSON(countryUrl);
          topoJsonData.value = topoJson;
          
          const geoFeatures = getGeoJSONFeatures(topoJson, objectName);
          features.value = geoFeatures;
          
          // Create projection focused on the country
          const proj = createProjection('us', width.value, height.value);
          projection.value = proj;
          
          // Fit projection to features
          if (geoFeatures.length > 0) {
            fitProjectionToFeatures(proj, geoFeatures, width.value, height.value, 20);
          }
          
          pathGenerator.value = createPathGenerator(proj);
          
          loading.value = false;
        } catch (err) {
          console.error('Error loading country map data:', err);
          error.value = err.message || 'Failed to load country map data';
          loading.value = false;
        }
      } else if (newState.level === 'world') {
        // Return to world view
        try {
          loading.value = true;
          error.value = null;
          
          const mapUrls = getDefaultMapUrls();
          const topoJson = await loadTopoJSON(mapUrls.world);
          topoJsonData.value = topoJson;
          
          const geoFeatures = getGeoJSONFeatures(topoJson, 'countries');
          features.value = geoFeatures;
          
          const proj = createProjection('world', width.value, height.value);
          projection.value = proj;
          pathGenerator.value = createPathGenerator(proj);
          
          loading.value = false;
        } catch (err) {
          console.error('Error loading world map data:', err);
          error.value = err.message || 'Failed to load world map data';
          loading.value = false;
        }
      }
    }, { deep: true });
    
    // Handle feature click for drill-down
    const handleFeatureClick = (feature) => {
      if (props.mapType === 'world' && props.drillDownState?.level === 'world') {
        const countryName = feature.properties?.name;
        if (countryName && props.onDrillDown) {
          props.onDrillDown(countryName);
        }
      }
    };
    
    return () => {
      if (loading.value) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-gray-500' }, 'Loading map...')
        ]);
      }
      
      if (error.value) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-red-500' }, `Error: ${error.value}`)
        ]);
      }
      
      if (!pathGenerator.value || !features.value.length) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-gray-500' }, 'No map data available')
        ]);
      }
      
      // Determine which features to render
      const featuresToRender = props.showAllRegions !== false 
        ? features.value 
        : features.value.filter(f => {
            const featureName = f.properties?.name;
            // Check if any data region matches this feature
            return Array.from(dataFeatureMap.value.keys()).some(name => {
              const mappedFeature = dataFeatureMap.value.get(name);
              return mappedFeature && mappedFeature.properties?.name === featureName;
            });
          });
      
      return h('div', {
        ref: containerRef,
        class: 'w-full h-full'
      }, [
        h('svg', {
          width: width.value,
          height: height.value,
          viewBox: `0 0 ${width.value} ${height.value}`,
          class: 'w-full h-full',
          role: 'img',
          'aria-label': 'Choropleth map showing regional data values'
        }, [
        // Render all features
        ...featuresToRender.map((feature, index) => {
          const featureName = feature.properties?.name;
          const hasData = dataFeatureMap.value.has(featureName);
          const dataRegion = hasData ? props.data.find(r => r.name === featureName) : null;
          
          const color = dataRegion 
            ? colorScale.value(dataRegion.value)
            : defaultColor;
          
          const pathData = pathGenerator.value(feature);
          if (!pathData) return null;
          
          // Calculate centroid for label
          const centroid = getFeatureCentroid(feature);
          const [centroidX, centroidY] = projection.value(centroid) || [0, 0];
          
          const isClickable = props.mapType === 'world' && props.drillDownState?.level === 'world';
          
          return h('g', { key: `region-${index}` }, [
            h('path', {
              d: pathData,
              fill: color,
              stroke: '#fff',
              'stroke-width': 0.5,
              'aria-label': dataRegion 
                ? `${featureName}: ${dataRegion.value}` 
                : featureName,
              tabindex: isClickable ? 0 : -1,
              role: isClickable ? 'button' : 'img',
              style: { cursor: isClickable ? 'pointer' : 'default', transition: 'all 0.2s' },
              onClick: isClickable ? () => handleFeatureClick(feature) : undefined,
              onMouseenter: isClickable ? (e) => {
                e.target.style.fill = color === defaultColor ? '#9ca3af' : color;
                e.target.style.opacity = '0.9';
                e.target.style.stroke = '#6366f1';
                e.target.style.strokeWidth = '2';
                e.target.setAttribute('title', `Click to view regions of ${featureName}`);
              } : undefined,
              onMouseleave: isClickable ? (e) => {
                e.target.style.fill = color;
                e.target.style.opacity = '1';
                e.target.style.stroke = '#fff';
                e.target.style.strokeWidth = '0.5';
                e.target.removeAttribute('title');
              } : undefined
            }),
            // Only show label if there's data for this region
            dataRegion ? h('text', {
              x: centroidX,
              y: centroidY,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              fill: '#000',
              'font-size': 12,
              'font-weight': 'bold',
              style: { pointerEvents: 'none' }
            }, featureName) : null
          ]);
        })
      ])
      ]);
    };
  }
};

// Flow Map SVG Component
const FlowMapSVG = {
  props: ['data', 'colors', 'mapType'],
  setup(props) {
    const containerRef = ref(null);
    const width = ref(800);
    const height = ref(500);
    const loading = ref(true);
    const error = ref(null);
    const topoJsonData = ref(null);
    const features = ref([]);
    const projection = ref(null);
    const pathGenerator = ref(null);
    
    // Update dimensions on resize
    const updateDimensions = () => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect();
        width.value = rect.width || 800;
        height.value = rect.height || 500;
        
        // Recreate projection with new dimensions
        if (props.mapType) {
          const mapTypeValue = props.mapType || 'us';
          const proj = createProjection(mapTypeValue, width.value, height.value);
          projection.value = proj;
          pathGenerator.value = createPathGenerator(proj);
        }
      }
    };
    
    // Project nodes to screen coordinates
    const nodes = computed(() => {
      if (!projection.value || !props.data?.nodes) return [];
      
      return props.data.nodes.map((node, index) => {
        let x, y;
        
        // Use lat/lng if available, otherwise fall back to x/y
        if (node.lat !== undefined && node.lng !== undefined) {
          const projected = projectCoordinates(projection.value, node.lng, node.lat);
          if (projected) {
            [x, y] = projected;
          } else {
            // Fallback to x/y if projection fails
            x = node.x || 200;
            y = node.y || 200;
          }
        } else if (node.x !== undefined && node.y !== undefined) {
          x = node.x;
          y = node.y;
        } else {
          // Default position
          x = 200;
          y = 200;
        }
        
        return {
          ...node,
          x,
          y,
          color: props.colors[index % props.colors.length],
          radius: 15
        };
      });
    });
    
    const links = computed(() => {
      if (!props.data?.links) return [];
      
      return props.data.links.map((link, index) => {
        const sourceNode = nodes.value.find(n => n.id === link.source);
        const targetNode = nodes.value.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;
        
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Use a consistent color based on link index instead of random
        const colorIndex = index % props.colors.length;
        const color = props.colors[colorIndex] || '#888';
        
        return {
          ...link,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          distance,
          angle,
          strokeWidth: Math.max(2, link.value / 10),
          color: color + '80' // Add transparency
        };
      }).filter(Boolean);
    });
    
    // Load TopoJSON data
    onMounted(async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const mapType = props.mapType || 'us';
        const mapUrls = getDefaultMapUrls();
        const url = mapType === 'us' ? mapUrls.us : mapUrls.world;
        const objectName = mapType === 'us' ? 'states' : 'countries';
        
        // Load TopoJSON
        const topoJson = await loadTopoJSON(url);
        topoJsonData.value = topoJson;
        
        // Convert to GeoJSON features
        const geoFeatures = getGeoJSONFeatures(topoJson, objectName);
        features.value = geoFeatures;
        
        // Create projection
        const mapTypeValue = props.mapType || 'us';
        const proj = createProjection(mapTypeValue, width.value, height.value);
        projection.value = proj;
        
        // Create path generator
        pathGenerator.value = createPathGenerator(proj);
        
        // Set up resize observer after initial render
        await nextTick();
        if (containerRef.value) {
          const resizeObserver = new ResizeObserver(() => {
            updateDimensions();
          });
          resizeObserver.observe(containerRef.value);
          
          // Cleanup on unmount
          onBeforeUnmount(() => {
            resizeObserver.disconnect();
          });
        }
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading map data:', err);
        error.value = err.message || 'Failed to load map data';
        loading.value = false;
      }
    });
    
    // Watch for mapType changes
    watch(() => props.mapType, async (newMapType) => {
      if (!newMapType) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        const mapUrls = getDefaultMapUrls();
        const url = newMapType === 'us' ? mapUrls.us : mapUrls.world;
        const objectName = newMapType === 'us' ? 'states' : 'countries';
        
        const topoJson = await loadTopoJSON(url);
        topoJsonData.value = topoJson;
        
        const geoFeatures = getGeoJSONFeatures(topoJson, objectName);
        features.value = geoFeatures;
        
        const proj = createProjection(newMapType, width.value, height.value);
        projection.value = proj;
        pathGenerator.value = createPathGenerator(proj);
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading map data:', err);
        error.value = err.message || 'Failed to load map data';
        loading.value = false;
      }
    });
    
    return () => {
      if (loading.value) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-gray-500' }, 'Loading map...')
        ]);
      }
      
      if (error.value) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-red-500' }, `Error: ${error.value}`)
        ]);
      }
      
      if (!pathGenerator.value || !features.value.length) {
        return h('div', {
          class: 'flex items-center justify-center w-full h-full',
          style: { minHeight: '300px' }
        }, [
          h('div', { class: 'text-gray-500' }, 'No map data available')
        ]);
      }
      
      return h('div', {
        ref: containerRef,
        class: 'w-full h-full'
      }, [
        h('svg', {
          width: width.value,
          height: height.value,
          viewBox: `0 0 ${width.value} ${height.value}`,
          class: 'w-full h-full',
          role: 'img',
          'aria-label': 'Flow map showing movement between locations'
        }, [
        // Map background - render all features
        ...features.value.map((feature, index) => {
          const pathData = pathGenerator.value(feature);
          if (!pathData) return null;
          
          return h('path', {
            key: `map-feature-${index}`,
            d: pathData,
            fill: '#f0f0f0',
            stroke: '#ccc',
            'stroke-width': 0.5,
            opacity: 0.3
          });
        }),
        // Links (curved paths) - render behind nodes
        ...links.value.map((link, index) => {
          const midX = (link.sourceX + link.targetX) / 2;
          const midY = (link.sourceY + link.targetY) / 2;
          const controlOffset = link.distance * 0.3;
          const controlX = midX - Math.sin(link.angle) * controlOffset;
          const controlY = midY + Math.cos(link.angle) * controlOffset;
          const path = `M ${link.sourceX} ${link.sourceY} Q ${controlX} ${controlY} ${link.targetX} ${link.targetY}`;
          
          return h('path', {
            key: `link-${index}`,
            d: path,
            stroke: link.color,
            'stroke-width': link.strokeWidth,
            fill: 'none',
            opacity: 0.6,
            'aria-label': `Flow from ${props.data.nodes.find(n => n.id === link.source)?.label || link.source} to ${props.data.nodes.find(n => n.id === link.target)?.label || link.target}: ${link.value}`
          });
        }),
        // Nodes
        ...nodes.value.map((node, index) => 
          h('g', { key: `node-${index}` }, [
            h('circle', {
              cx: node.x,
              cy: node.y,
              r: node.radius,
              fill: node.color,
              stroke: '#fff',
              'stroke-width': 2,
              'aria-label': `Location: ${node.label}`,
              tabindex: 0,
              role: 'button',
              style: { cursor: 'pointer' }
            }),
            h('text', {
              x: node.x,
              y: node.y + node.radius + 15,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              fill: '#000',
              'font-size': 12,
              'font-weight': 'bold',
              style: { pointerEvents: 'none' }
            }, node.label)
          ])
        )
        ])
      ]);
    };
  }
};

// Drill-down handlers
const handleDrillDown = (countryName) => {
  drillDownState.value = {
    level: 'country',
    selectedCountry: countryName,
    breadcrumbs: [...drillDownState.value.breadcrumbs, countryName]
  };
};

const handleDrillUp = () => {
  drillDownState.value = {
    level: 'world',
    selectedCountry: null,
    breadcrumbs: []
  };
};

// Reset drill-down when map type changes
const handleMapTypeChange = () => {
  drillDownState.value = {
    level: 'world',
    selectedCountry: null,
    breadcrumbs: []
  };
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

