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
                          type="button"
                          aria-label="Remove region"
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
                              type="button"
                              aria-label="Remove location"
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
                              type="button"
                              aria-label="Remove flow"
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
                    <div class="flex items-center gap-2 flex-wrap justify-end">
                      <!-- Back button for drill-down -->
                      <button
                        v-if="mapConfig.mapType === 'world' && drillDownState.level === 'country'"
                        type="button"
                        @click="handleDrillUp"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-white hover:bg-slate-700 border border-gray-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
                      >
                        <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
                        Back to World
                      </button>
                      <!-- Export -->
                      <button
                        v-for="format in ['png', 'svg']"
                        :key="format"
                        type="button"
                        @click="format === 'png' ? exportPNG() : exportSVG()"
                        :disabled="format === 'png' && exporting"
                        :aria-label="`Export map as ${format.toUpperCase()}`"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-white hover:bg-slate-700 border border-gray-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
                      >
                        <span class="material-symbols-outlined text-base" aria-hidden="true">download</span>
                        {{ format.toUpperCase() }}
                      </button>
                    </div>
                  </div>

                  <InlineNotice :notice="notice" class="mb-3" @dismiss="clearNotice" />
                  
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
                      ref="mapViewRef"
                      :data="choroplethData" 
                      :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                      :mapType="mapConfig.mapType || 'us'"
                      :projectionType="mapConfig.mapProjection"
                      :showAllRegions="mapConfig.showAllRegions !== false"
                      :drillDownState="drillDownState"
                      :onDrillDown="handleDrillDown"
                      :onDrillUp="handleDrillUp"
                    />
                    
                    <!-- Flow Map -->
                    <FlowMapSVG 
                      v-else-if="selectedMapType === 'flowMap'"
                      ref="mapViewRef"
                      :data="flowMapData" 
                      :colors="colorSchemes[mapConfig.colorScheme] || colorSchemes.default"
                      :mapType="mapConfig.mapType || 'us'"
                      :projectionType="mapConfig.mapProjection"
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
import { ref, shallowRef, computed, watch, onBeforeUnmount, h } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { loadTopoJSON, getGeoJSONFeatures, mapDataByFeatureName, getFeatureCentroid, getDefaultMapUrls, getCountryMapUrl, getCountryObjectName } from '../utils/mapData.js';
import { createProjection, createPathGenerator, projectCoordinates, fitProjectionToFeatures } from '../utils/mapProjections.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();

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

/**
 * Parse a user-entered value as a number. Inputs bound with v-model.number
 * give '' when empty, and pasted values may carry thousands separators.
 * Returns NaN for anything that is not a finite number.
 */
const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/[,\s]/g, ''));
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

const formatValue = (value) => (Number.isFinite(value) ? value.toLocaleString() : String(value));

const formatCompact = (value) => {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  } catch {
    return formatValue(value);
  }
};

/** Text that stays readable on any fill: dark text with a white halo. */
const labelAttrs = {
  fill: '#111827',
  stroke: '#ffffff',
  'stroke-width': 3,
  'stroke-linejoin': 'round',
  'paint-order': 'stroke',
  'font-size': 12,
  'font-weight': 'bold',
  style: { pointerEvents: 'none' }
};

const centeredMessage = (text, className = 'text-gray-500') =>
  h('div', { class: 'absolute inset-0 flex items-center justify-center' }, [
    h('div', { class: className, role: className.includes('red') ? 'alert' : 'status' }, text)
  ]);

/**
 * Shared plumbing for both map components: measures the container (which is
 * always rendered, so the ResizeObserver can attach on mount), loads TopoJSON
 * with a request id so a stale load can never overwrite a newer one, and
 * rebuilds the projection from the current fit whenever the size changes.
 *
 * `getSource` returns { kind, url, objectName } or { error }; kind is 'us',
 * 'world' or 'country' (a drill-down, fitted to the country's features).
 */
function useMapSurface(props, getSource) {
  const containerRef = ref(null);
  const svgRef = ref(null);
  const width = ref(800);
  const height = ref(500);
  const loading = ref(true);
  const error = ref(null);
  const features = shallowRef([]);
  const fit = shallowRef(null);
  let requestId = 0;
  let resizeObserver = null;

  const measure = () => {
    const el = containerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      width.value = Math.round(rect.width);
      height.value = Math.round(rect.height);
    }
  };

  watch(containerRef, (el) => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (!el) return;
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(el);
    }
  }, { flush: 'post' });

  onBeforeUnmount(() => {
    requestId++; // drop any load still in flight
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  // Rebuilt on resize or projection change, keeping the current fit (US
  // states, world sphere or the drilled-down country).
  const projection = computed(() => {
    const current = fit.value;
    if (!current) return null;
    const w = width.value;
    const hgt = height.value;
    if (current.kind === 'country') {
      return fitProjectionToFeatures(createProjection('us', w, hgt), current.features, w, hgt, 20);
    }
    if (current.kind === 'world') {
      return createProjection('world', w, hgt, props.projectionType || 'equalEarth');
    }
    return createProjection('us', w, hgt, undefined, { type: 'FeatureCollection', features: current.features });
  });

  const pathGenerator = computed(() => (projection.value ? createPathGenerator(projection.value) : null));

  // Path strings are the expensive part; compute them once per projection.
  const paths = computed(() => {
    const gen = pathGenerator.value;
    if (!gen) return [];
    return features.value.map((feature) => gen(feature));
  });

  const load = async (sourceKey) => {
    const id = ++requestId;
    const source = JSON.parse(sourceKey);
    loading.value = true;
    error.value = null;
    try {
      if (source.error) throw new Error(source.error);
      const topoJson = await loadTopoJSON(source.url);
      if (id !== requestId) return;
      const geoFeatures = getGeoJSONFeatures(topoJson, source.objectName);
      features.value = geoFeatures;
      fit.value = { kind: source.kind, features: geoFeatures };
    } catch (err) {
      if (id !== requestId) return;
      console.error('Error loading map data:', err);
      error.value = err.message || 'Failed to load map data';
      features.value = [];
      fit.value = null;
    } finally {
      if (id === requestId) loading.value = false;
    }
  };

  // One watcher over everything that decides which file to load, keyed by a
  // string so a new-but-equal drill-down object does not trigger a reload.
  watch(() => JSON.stringify(getSource()), load, { immediate: true });

  /** Wrap content in the always-present, measured container. */
  const renderSurface = (content) => {
    let inner;
    if (loading.value) inner = centeredMessage('Loading map...');
    else if (error.value) inner = centeredMessage(`Error: ${error.value}`, 'text-red-500');
    else if (!projection.value || !features.value.length) inner = centeredMessage('No map data available');
    else inner = content();
    return h('div', { ref: containerRef, class: 'w-full h-full relative', style: { minHeight: '300px' } }, [inner]);
  };

  return { containerRef, svgRef, width, height, loading, error, features, projection, paths, renderSurface };
}

const baseMapSource = (mapType) => {
  const urls = getDefaultMapUrls();
  return mapType === 'world'
    ? { kind: 'world', url: urls.world, objectName: 'countries' }
    : { kind: 'us', url: urls.us, objectName: 'states' };
};

// Choropleth Map SVG Component
const ChoroplethMapSVG = {
  props: ['data', 'colors', 'mapType', 'projectionType', 'showAllRegions', 'drillDownState', 'onDrillDown', 'onDrillUp'],
  setup(props, { expose }) {
    const surface = useMapSurface(props, () => {
      const state = props.drillDownState;
      if (props.mapType === 'world' && state?.level === 'country' && state.selectedCountry) {
        const url = getCountryMapUrl(state.selectedCountry);
        if (!url) return { error: `Detailed map data not available for ${state.selectedCountry}` };
        return { kind: 'country', url, objectName: getCountryObjectName(state.selectedCountry) };
      }
      return baseMapSource(props.mapType);
    });
    const { svgRef, width, height, features, projection, paths, renderSurface } = surface;
    const hovered = ref(null);

    expose({ getSvgElement: () => svgRef.value });

    // Rows with a usable name and a numeric value
    const validData = computed(() => (props.data || [])
      .map((row) => ({ ...row, name: typeof row?.name === 'string' ? row.name.trim() : row?.name, value: toNumber(row?.value) }))
      .filter((row) => row.name && Number.isFinite(row.value)));

    // Keyed by the feature's own name, so "CA" and "California" both colour California
    const regionByFeature = computed(() => {
      if (!features.value.length) return new Map();
      return mapDataByFeatureName(validData.value, features.value);
    });

    // Sequential schemes run dark → light; higher values get the darker colours.
    const ramp = computed(() => {
      const colors = props.colors?.length ? props.colors : ['#6366f1'];
      return [...colors].reverse();
    });

    // Bin the values on the map into equal-width classes, one per colour.
    const scale = computed(() => {
      const values = Array.from(regionByFeature.value.values(), (r) => r.value);
      if (!values.length) return null;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const n = ramp.value.length;
      const span = max - min;
      const binOf = (value) => (span === 0 ? n - 1 : Math.min(n - 1, Math.max(0, Math.floor(((value - min) / span) * n))));
      const bins = span === 0
        ? [{ color: ramp.value[n - 1], from: min, to: max }]
        : ramp.value.map((color, i) => ({ color, from: min + (span * i) / n, to: min + (span * (i + 1)) / n }));
      return { min, max, color: (value) => ramp.value[binOf(value)], bins };
    });

    const defaultColor = '#e5e7eb';

    const isClickable = () => props.mapType === 'world' && props.drillDownState?.level === 'world';

    const handleFeatureClick = (feature) => {
      if (!isClickable()) return;
      const countryName = feature.properties?.name;
      if (countryName && props.onDrillDown) {
        props.onDrillDown(countryName);
      }
    };

    const renderLegend = () => {
      const s = scale.value;
      if (!s) return null;
      const sw = 18;
      const sh = 12;
      const rowH = 18;
      const boxW = 150;
      const boxH = s.bins.length * rowH + 12;
      const x = 12;
      const y = Math.max(12, height.value - boxH - 12);
      return h('g', { transform: `translate(${x}, ${y})`, 'aria-hidden': 'true' }, [
        h('rect', { width: boxW, height: boxH, rx: 6, fill: '#ffffff', 'fill-opacity': 0.85, stroke: '#d1d5db' }),
        ...[...s.bins].reverse().map((bin, i) => h('g', { transform: `translate(8, ${6 + i * rowH})` }, [
          h('rect', { width: sw, height: sh, fill: bin.color, stroke: '#9ca3af', 'stroke-width': 0.5 }),
          h('text', { x: sw + 6, y: sh / 2, 'dominant-baseline': 'middle', 'font-size': 11, fill: '#374151' },
            bin.from === bin.to ? formatCompact(bin.from) : `${formatCompact(bin.from)} – ${formatCompact(bin.to)}`)
        ]))
      ]);
    };

    return () => renderSurface(() => {
      const proj = projection.value;
      const clickable = isClickable();
      const regions = regionByFeature.value;
      const colorFor = scale.value?.color;
      const items = [];
      let hoveredPath = null;

      features.value.forEach((feature, index) => {
        const featureName = feature.properties?.name ?? `Region ${index + 1}`;
        const dataRegion = regions.get(featureName) || null;
        if (props.showAllRegions === false && !dataRegion) return;
        const pathData = paths.value[index];
        if (!pathData) return;

        const color = dataRegion && colorFor ? colorFor(dataRegion.value) : defaultColor;
        const valueText = dataRegion ? `: ${formatValue(dataRegion.value)}` : '';
        const label = clickable ? `${featureName}${valueText}. Activate to view its regions.` : `${featureName}${valueText}`;
        const isHovered = clickable && hovered.value === index;
        if (isHovered) hoveredPath = pathData;

        items.push(h('g', { key: `region-${index}` }, [
          h('path', {
            d: pathData,
            fill: isHovered && color === defaultColor ? '#9ca3af' : color,
            stroke: '#fff',
            'stroke-width': 0.5,
            'aria-label': label,
            tabindex: clickable ? 0 : undefined,
            role: clickable ? 'button' : undefined,
            style: { cursor: clickable ? 'pointer' : 'default', outline: 'none' },
            onClick: clickable ? () => handleFeatureClick(feature) : undefined,
            onKeydown: clickable ? (e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                handleFeatureClick(feature);
              }
            } : undefined,
            onMouseenter: clickable ? () => { hovered.value = index; } : undefined,
            onMouseleave: clickable ? () => { if (hovered.value === index) hovered.value = null; } : undefined,
            onFocus: clickable ? () => { hovered.value = index; } : undefined,
            onBlur: clickable ? () => { if (hovered.value === index) hovered.value = null; } : undefined
          }, [h('title', clickable ? `${featureName}${valueText} — click to view its regions` : `${featureName}${valueText}`)])
        ]));
      });

      // Labels for regions with data, drawn above all shapes
      const labels = [];
      features.value.forEach((feature, index) => {
        const featureName = feature.properties?.name;
        if (!featureName || !regions.has(featureName) || !paths.value[index]) return;
        const point = proj(getFeatureCentroid(feature));
        if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
        labels.push(h('text', { key: `label-${index}`, x: point[0], y: point[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle', ...labelAttrs }, featureName));
      });

      const summary = Array.from(regions.entries(), ([name, row]) => `${name}: ${formatValue(row.value)}`).join('; ');
      const area = props.drillDownState?.level === 'country' && props.mapType === 'world'
        ? props.drillDownState.selectedCountry
        : (props.mapType === 'world' ? 'the world' : 'the United States');

      return h('svg', {
        ref: svgRef,
        xmlns: 'http://www.w3.org/2000/svg',
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full block',
        role: clickable ? 'group' : 'img',
        'aria-label': `Choropleth map of ${area}${summary ? `. ${summary}` : ''}`
      }, [
        ...items,
        hoveredPath ? h('path', { d: hoveredPath, fill: 'none', stroke: '#6366f1', 'stroke-width': 2, style: { pointerEvents: 'none' } }) : null,
        ...labels,
        renderLegend()
      ]);
    });
  }
};

// Flow Map SVG Component
const FlowMapSVG = {
  props: ['data', 'colors', 'mapType', 'projectionType'],
  setup(props, { expose }) {
    const { svgRef, width, height, features, projection, paths, renderSurface } =
      useMapSurface(props, () => baseMapSource(props.mapType));

    expose({ getSvgElement: () => svgRef.value });

    // Project nodes to screen coordinates; nodes without valid coordinates, or
    // outside the projection (e.g. London on the US map), are left out.
    const nodes = computed(() => {
      const proj = projection.value;
      if (!proj || !props.data?.nodes) return [];
      const colors = props.colors?.length ? props.colors : ['#6366f1'];
      return props.data.nodes.flatMap((node, index) => {
        const lat = toNumber(node.lat);
        const lng = toNumber(node.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return [];
        const projected = projectCoordinates(proj, lng, lat);
        if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) return [];
        return [{ ...node, x: projected[0], y: projected[1], color: colors[index % colors.length], radius: 10 }];
      });
    });

    const links = computed(() => {
      if (!props.data?.links) return [];
      const colors = props.colors?.length ? props.colors : ['#888888'];
      const values = props.data.links.map((l) => Math.abs(toNumber(l.value))).filter(Number.isFinite);
      const maxValue = Math.max(0, ...values);

      return props.data.links.map((link, index) => {
        const sourceNode = nodes.value.find((n) => n.id === link.source);
        const targetNode = nodes.value.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode || sourceNode === targetNode) return null;
        const value = toNumber(link.value);

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;

        return {
          ...link,
          value,
          sourceLabel: sourceNode.label || sourceNode.id,
          targetLabel: targetNode.label || targetNode.id,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          distance: Math.sqrt(dx * dx + dy * dy),
          angle: Math.atan2(dy, dx),
          // 2px for the smallest flows up to 12px for the largest
          strokeWidth: maxValue > 0 && Number.isFinite(value) ? 2 + (Math.abs(value) / maxValue) * 10 : 2,
          color: colors[index % colors.length] || '#888888'
        };
      }).filter(Boolean);
    });

    return () => renderSurface(() => {
      const summary = links.value.map((l) => `${l.sourceLabel} to ${l.targetLabel}: ${formatValue(l.value)}`).join('; ');
      return h('svg', {
        ref: svgRef,
        xmlns: 'http://www.w3.org/2000/svg',
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full block',
        role: 'img',
        'aria-label': `Flow map of ${props.mapType === 'world' ? 'the world' : 'the United States'}${summary ? `. ${summary}` : ''}`
      }, [
        // Map background
        ...features.value.map((feature, index) => {
          const pathData = paths.value[index];
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
            'stroke-linecap': 'round',
            fill: 'none',
            opacity: 0.6
          }, [h('title', `${link.sourceLabel} → ${link.targetLabel}: ${formatValue(link.value)}`)]);
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
              'stroke-width': 2
            }, [h('title', node.label || node.id)]),
            h('text', {
              x: node.x,
              y: node.y + node.radius + 12,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              ...labelAttrs
            }, node.label)
          ])
        )
      ]);
    });
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

// ---- Export -------------------------------------------------------------

const mapViewRef = ref(null);
const exporting = ref(false);

// Presentation properties copied from the live SVG onto the export, so it
// looks the same outside the page (no Tailwind, no app fonts).
const EXPORT_STYLE_PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
  'stroke-linejoin', 'opacity', 'paint-order', 'font-family', 'font-size', 'font-weight',
  'text-anchor', 'dominant-baseline'
];

const exportFileName = (ext) => {
  const kind = selectedMapType.value === 'flowMap' ? 'flow-map' : 'choropleth-map';
  const area = mapConfig.value.mapType === 'world' && drillDownState.value.level === 'country' && drillDownState.value.selectedCountry
    ? drillDownState.value.selectedCountry
    : mapConfig.value.mapType;
  const slug = String(area).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${kind}-${slug || 'map'}.${ext}`;
};

const serializeMapSvg = () => {
  const svg = mapViewRef.value?.getSvgElement?.();
  if (!svg) throw new Error('The map has not finished loading yet.');

  const [, , vbWidth, vbHeight] = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  const width = vbWidth || svg.clientWidth || 800;
  const height = vbHeight || svg.clientHeight || 500;

  const clone = svg.cloneNode(true);
  const sources = [svg, ...svg.querySelectorAll('*')];
  const targets = [clone, ...clone.querySelectorAll('*')];
  sources.forEach((source, i) => {
    const target = targets[i];
    const computedStyle = window.getComputedStyle(source);
    const declarations = EXPORT_STYLE_PROPS
      .map((prop) => [prop, computedStyle.getPropertyValue(prop)])
      .filter(([, value]) => value && value !== 'normal' && value !== 'auto')
      .map(([prop, value]) => `${prop}:${value}`);
    target.setAttribute('style', declarations.join(';'));
    target.removeAttribute('class');
    target.removeAttribute('tabindex');
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Same background as the preview panel
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', isDarkMode.value ? '#1e293b' : '#f9fafb');
  clone.insertBefore(background, clone.firstChild);

  const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  return { markup, width, height };
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const exportSVG = () => {
  try {
    const { markup } = serializeMapSvg();
    downloadBlob(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), exportFileName('svg'));
    showNotice('Map exported as SVG.', 'success');
  } catch (err) {
    console.error('SVG export failed:', err);
    showNotice(err.message || 'Could not export the map as SVG.', 'error');
  }
};

const exportPNG = async () => {
  if (exporting.value) return;
  exporting.value = true;
  let url = null;
  try {
    const { markup, width, height } = serializeMapSvg();
    url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Could not render the map as an image.'));
      image.src = url;
    });

    const pixelRatio = 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the PNG.'))), 'image/png');
    });
    downloadBlob(blob, exportFileName('png'));
    showNotice('Map exported as PNG.', 'success');
  } catch (err) {
    console.error('PNG export failed:', err);
    showNotice(err.message || 'Could not export the map as PNG.', 'error');
  } finally {
    if (url) URL.revokeObjectURL(url);
    exporting.value = false;
  }
};
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

