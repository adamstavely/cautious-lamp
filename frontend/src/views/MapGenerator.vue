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
                      Interactive Map Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create interactive maps with markers, regions, and tooltips. Generate React or Vue components with Leaflet integration.
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
                      <rect x="20" y="20" width="160" height="160" rx="8" fill="url(#mapGradient)" opacity="0.3"/>
                      <circle cx="60" cy="60" r="6" fill="#ef4444" opacity="0.9"/>
                      <circle cx="140" cy="100" r="6" fill="#10b981" opacity="0.9"/>
                      <circle cx="100" cy="140" r="6" fill="#3b82f6" opacity="0.9"/>
                      <path d="M 60 60 L 140 100 L 100 140 Z" fill="none" stroke="#6366f1" stroke-width="2" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Configuration Panel -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6 sticky top-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">settings</span>
                    Configuration
                  </h2>

                  <!-- Map Style -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Map Style
                    </label>
                    <select
                      v-model="mapConfig.mapStyle"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="street">Street</option>
                      <option value="satellite">Satellite</option>
                      <option value="terrain">Terrain</option>
                      <option value="dark">Dark Theme</option>
                    </select>
                  </div>

                  <!-- Center Coordinates -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Center (Lat, Lng)
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <input
                        v-model.number="mapConfig.center[0]"
                        type="number"
                        step="0.0001"
                        placeholder="Latitude"
                        class="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                      <input
                        v-model.number="mapConfig.center[1]"
                        type="number"
                        step="0.0001"
                        placeholder="Longitude"
                        class="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <!-- Zoom Level -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Zoom Level: {{ mapConfig.zoom }}
                    </label>
                    <input
                      v-model.number="mapConfig.zoom"
                      type="range"
                      min="1"
                      max="18"
                      step="1"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                  </div>

                  <!-- Map Dimensions -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Map Height
                    </label>
                    <input
                      v-model="mapConfig.height"
                      type="text"
                      placeholder="500px or 100%"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                    />
                  </div>

                  <!-- Controls Toggle -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Controls
                    </label>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 cursor-pointer text-sm flex-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          <input
                            v-model="mapConfig.controls.zoom"
                            type="checkbox"
                            class="w-4 h-4"
                            :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                          />
                          Zoom Controls
                        </label>
                        <select
                          v-if="mapConfig.controls.zoom"
                          v-model="mapConfig.controls.zoomPosition"
                          class="px-2 py-1 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'"
                        >
                          <option value="topleft">Top Left</option>
                          <option value="topright">Top Right</option>
                          <option value="bottomleft">Bottom Left</option>
                          <option value="bottomright">Bottom Right</option>
                        </select>
                      </div>
                      <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 cursor-pointer text-sm flex-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          <input
                            v-model="mapConfig.controls.attribution"
                            type="checkbox"
                            class="w-4 h-4"
                            :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                          />
                          Attribution
                        </label>
                        <select
                          v-if="mapConfig.controls.attribution"
                          v-model="mapConfig.controls.attributionPosition"
                          class="px-2 py-1 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'"
                        >
                          <option value="topleft">Top Left</option>
                          <option value="topright">Top Right</option>
                          <option value="bottomleft">Bottom Left</option>
                          <option value="bottomright">Bottom Right</option>
                        </select>
                      </div>
                      <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 cursor-pointer text-sm flex-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          <input
                            v-model="mapConfig.controls.scale"
                            type="checkbox"
                            class="w-4 h-4"
                            :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                          />
                          Scale
                        </label>
                        <select
                          v-if="mapConfig.controls.scale"
                          v-model="mapConfig.controls.scalePosition"
                          class="px-2 py-1 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'"
                        >
                          <option value="topleft">Top Left</option>
                          <option value="topright">Top Right</option>
                          <option value="bottomleft">Bottom Left</option>
                          <option value="bottomright">Bottom Right</option>
                        </select>
                      </div>
                      <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <input
                          v-model="mapConfig.controls.fullscreen"
                          type="checkbox"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        Fullscreen
                      </label>
                    </div>
                  </div>

                  <!-- Interactions -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Interactions
                    </label>
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <input
                          v-model="mapConfig.interactions.dragging"
                          type="checkbox"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        Dragging
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <input
                          v-model="mapConfig.interactions.scrollWheelZoom"
                          type="checkbox"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        Scroll Wheel Zoom
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <input
                          v-model="mapConfig.interactions.doubleClickZoom"
                          type="checkbox"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        Double Click Zoom
                      </label>
                    </div>
                  </div>

                  <!-- Markers Section -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-3">
                      <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Markers ({{ markers.length }})
                      </label>
                      <button
                        @click="addMarker"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                        Add
                      </button>
                    </div>

                    <div class="space-y-3 max-h-64 overflow-y-auto">
                      <div
                        v-for="(marker, index) in markers"
                        :key="marker.id"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            Marker {{ index + 1 }}
                          </span>
                          <button
                            @click="removeMarker(marker.id)"
                            class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        <div class="space-y-2">
                          <div class="grid grid-cols-2 gap-2">
                            <input
                              v-model.number="marker.lat"
                              type="number"
                              step="0.0001"
                              placeholder="Lat"
                              class="px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model.number="marker.lng"
                              type="number"
                              step="0.0001"
                              placeholder="Lng"
                              class="px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                          </div>
                          <input
                            v-model="marker.title"
                            type="text"
                            placeholder="Title"
                            class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <textarea
                            v-model="marker.popup"
                            placeholder="Popup content"
                            rows="2"
                            class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          ></textarea>
                          <div class="flex gap-2">
                            <input
                              v-model="marker.color"
                              type="color"
                              class="w-10 h-8 rounded border cursor-pointer"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                            />
                            <select
                              v-model="marker.icon"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option value="default">Default</option>
                              <option value="pin">Pin</option>
                              <option value="circle">Circle</option>
                              <option value="star">Star</option>
                              <option value="custom">Custom Image</option>
                            </select>
                          </div>
                          <div v-if="marker.icon === 'custom'" class="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              @change="handleImageUpload($event, marker)"
                              class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white file:bg-indigo-600 file:text-white' 
                                : 'bg-white border-gray-300 text-gray-900 file:bg-indigo-600 file:text-white'"
                            />
                            <div v-if="marker.customImageUrl" class="relative">
                              <img 
                                :src="marker.customImageUrl" 
                                alt="Custom marker preview"
                                class="w-16 h-16 object-contain rounded border"
                                :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                              />
                              <button
                                @click="marker.customImageUrl = null; marker.icon = 'default'"
                                class="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white text-xs"
                                title="Remove image"
                              >
                                <span class="material-symbols-outlined text-xs">close</span>
                              </button>
                            </div>
                          </div>
                          <div class="grid grid-cols-2 gap-2">
                            <div>
                              <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                Size
                              </label>
                              <select
                                v-model="marker.size"
                                class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                :class="isDarkMode 
                                  ? 'bg-slate-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'"
                              >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                Popup Position
                              </label>
                              <select
                                v-model="marker.popupPosition"
                                class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                :class="isDarkMode 
                                  ? 'bg-slate-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'"
                              >
                                <option value="auto">Auto</option>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                          <div class="flex gap-4">
                            <label class="flex items-center gap-2 cursor-pointer text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="marker.draggable"
                                type="checkbox"
                                class="w-3 h-3"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                              Draggable
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="marker.autoOpen"
                                type="checkbox"
                                class="w-3 h-3"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                              Auto-open Popup
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Regions Section -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-3">
                      <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Regions ({{ regions.length }})
                      </label>
                      <div class="flex gap-2">
                        <button
                          @click="addRegion('circle')"
                          class="px-2 py-1 rounded text-xs font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                          title="Add Circle"
                        >
                          <span class="material-symbols-outlined text-xs">radio_button_unchecked</span>
                        </button>
                        <button
                          @click="addRegion('rectangle')"
                          class="px-2 py-1 rounded text-xs font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                          title="Add Rectangle"
                        >
                          <span class="material-symbols-outlined text-xs">crop_free</span>
                        </button>
                        <button
                          @click="addRegion('polygon')"
                          class="px-2 py-1 rounded text-xs font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                          title="Add Polygon"
                        >
                          <span class="material-symbols-outlined text-xs">change_circle</span>
                        </button>
                      </div>
                    </div>

                    <div class="space-y-3 max-h-48 overflow-y-auto">
                      <div
                        v-for="(region, index) in regions"
                        :key="region.id"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-xs font-medium capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            {{ region.type }} {{ index + 1 }}
                          </span>
                          <button
                            @click="removeRegion(region.id)"
                            class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        <div class="space-y-2">
                          <input
                            v-model="region.label"
                            type="text"
                            placeholder="Label"
                            class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <textarea
                            v-model="region.description"
                            placeholder="Description (optional)"
                            rows="2"
                            class="w-full px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          ></textarea>
                          <div class="flex gap-2">
                            <input
                              v-model="region.fillColor"
                              type="color"
                              class="w-10 h-8 rounded border cursor-pointer"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                            />
                            <input
                              v-model="region.strokeColor"
                              type="color"
                              class="w-10 h-8 rounded border cursor-pointer"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                            />
                            <input
                              v-model.number="region.opacity"
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              placeholder="Opacity"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                              Border Width: {{ region.borderWidth || 2 }}px
                            </label>
                            <input
                              v-model.number="region.borderWidth"
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                              :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview and Export Panel -->
              <div class="lg:col-span-2">
                <!-- Preview Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Preview
                  </h2>
                  
                  <div 
                    class="rounded-lg overflow-hidden border"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'"
                    :style="{ height: mapConfig.height || '500px' }"
                  >
                    <div 
                      ref="mapContainer"
                      class="w-full h-full"
                      style="min-height: 400px;"
                    ></div>
                  </div>
                </div>

                <!-- Export Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">download</span>
                    Export
                  </h2>

                  <div class="space-y-4">
                    <!-- Export Format Selector -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Export Format
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="format in exportFormats"
                          :key="format.value"
                          @click="selectedExportFormat = format.value"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="selectedExportFormat === format.value
                            ? (isDarkMode 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-600 text-white')
                            : (isDarkMode
                              ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                        >
                          {{ format.label }}
                        </button>
                      </div>
                    </div>

                    <!-- Code Preview -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Generated Code
                        </label>
                        <button
                          @click="copyCode"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                        >
                          <span class="material-symbols-outlined text-sm mr-1 align-middle">content_copy</span>
                          Copy
                        </button>
                      </div>
                      <textarea
                        :value="generatedCode"
                        readonly
                        class="w-full h-64 px-4 py-3 border rounded-lg font-mono text-sm resize-none"
                        :class="isDarkMode 
                          ? 'bg-slate-950 text-gray-100 border-gray-700' 
                          : 'bg-gray-50 text-gray-900 border-gray-300'"
                      ></textarea>
                    </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const mapContainer = ref(null);
let map = null;
let mapMarkers = [];
let mapRegions = [];
let zoomControl = null;
let attributionControl = null;
let scaleControl = null;

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'HTML', value: 'html' }
];

const mapConfig = ref({
  mapStyle: 'street',
  center: [40.7128, -74.0060], // New York City
  zoom: 10,
  height: '500px',
  controls: {
    zoom: true,
    zoomPosition: 'topright',
    attribution: true,
    attributionPosition: 'bottomright',
    scale: false,
    scalePosition: 'bottomleft',
    fullscreen: false
  },
  interactions: {
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true
  }
});

const markers = ref([
  {
    id: '1',
    lat: 40.7128,
    lng: -74.0060,
    title: 'New York',
    popup: 'New York City',
    color: '#ef4444',
    icon: 'default',
    size: 'medium',
    draggable: true,
    popupPosition: 'auto',
    autoOpen: false,
    customImageUrl: null
  }
]);

const regions = ref([]);

const selectedExportFormat = ref('react');

// Get tile layer URL based on map style
const getTileLayerUrl = (style) => {
  const tileLayers = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  return tileLayers[style] || tileLayers.street;
};

// Initialize map
const initMap = () => {
  if (!mapContainer.value || map) return;

  map = L.map(mapContainer.value, {
    center: mapConfig.value.center,
    zoom: mapConfig.value.zoom,
    dragging: mapConfig.value.interactions.dragging,
    scrollWheelZoom: mapConfig.value.interactions.scrollWheelZoom,
    doubleClickZoom: mapConfig.value.interactions.doubleClickZoom,
    zoomControl: false, // Disable default zoom control - we'll add it manually if needed
    attributionControl: false // Disable default attribution control - we'll add it manually if needed
  });

  // Add tile layer
  const tileLayer = L.tileLayer(getTileLayerUrl(mapConfig.value.mapStyle), {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });
  tileLayer.addTo(map);

  // Add controls
  updateMapControls();

  // Add click handler to add markers
  map.on('click', (e) => {
    addMarkerAtPosition(e.latlng.lat, e.latlng.lng);
  });

  updateMapMarkers();
  updateMapRegions();
};

// Get icon size based on marker size
const getIconSize = (size, iconType) => {
  const sizeMultipliers = {
    small: 0.7,
    medium: 1,
    large: 1.4
  };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (iconType === 'default') {
    return {
      iconSize: [Math.round(25 * multiplier), Math.round(41 * multiplier)],
      iconAnchor: [Math.round(12 * multiplier), Math.round(41 * multiplier)],
      popupAnchor: [1, Math.round(-34 * multiplier)],
      shadowSize: [Math.round(41 * multiplier), Math.round(41 * multiplier)]
    };
  } else if (iconType === 'circle') {
    const baseSize = 20;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier / 2)]
    };
  } else {
    const baseSize = 24;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier)]
    };
  }
};

// Get popup anchor based on position
const getPopupAnchor = (position, iconType, size) => {
  const sizeMultipliers = {
    small: 0.7,
    medium: 1,
    large: 1.4
  };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (position === 'top') {
    return iconType === 'default' ? [0, Math.round(41 * multiplier)] : [0, Math.round(24 * multiplier)];
  } else if (position === 'bottom') {
    return iconType === 'default' ? [0, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
  } else if (position === 'left') {
    return iconType === 'default' ? [Math.round(25 * multiplier), 0] : [Math.round(24 * multiplier), 0];
  } else if (position === 'right') {
    return iconType === 'default' ? [Math.round(-25 * multiplier), 0] : [Math.round(-24 * multiplier), 0];
  }
  // auto/default
  return iconType === 'default' ? [1, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
};

// Update markers on map
const updateMapMarkers = () => {
  // Remove existing markers
  mapMarkers.forEach(marker => map.removeLayer(marker));
  mapMarkers = [];

  // Add new markers
  markers.value.forEach(marker => {
    const markerSize = marker.size || 'medium';
    let icon;
    const iconSizes = getIconSize(markerSize, marker.icon);
    
    if (marker.icon === 'default') {
      icon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor,
        popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'default', markerSize),
        shadowSize: iconSizes.shadowSize
      });
    } else if (marker.icon === 'circle') {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${marker.color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    } else if (marker.icon === 'pin') {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="color: ${marker.color}; font-size: ${size}px;">📍</div>`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    } else if (marker.icon === 'custom' && marker.customImageUrl) {
      const size = iconSizes.iconSize[0];
      icon = L.icon({
        iconUrl: marker.customImageUrl,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor,
        popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'custom', markerSize)
      });
    } else {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="color: ${marker.color}; font-size: ${size}px;">⭐</div>`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    }

    const leafletMarker = L.marker([marker.lat, marker.lng], { 
      icon,
      draggable: marker.draggable !== false
    });
    
    // Handle dragend to update coordinates
    if (marker.draggable !== false) {
      leafletMarker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        marker.lat = latlng.lat;
        marker.lng = latlng.lng;
      });
    }
    
    if (marker.popup) {
      leafletMarker.bindPopup(marker.popup);
      if (marker.autoOpen) {
        leafletMarker.openPopup();
      }
    }
    leafletMarker.addTo(map);
    mapMarkers.push(leafletMarker);
  });
};

// Update controls on map
const updateMapControls = () => {
  if (!map) return;

  // Remove existing controls
  if (zoomControl) {
    map.removeControl(zoomControl);
    zoomControl = null;
  }
  if (attributionControl) {
    map.removeControl(attributionControl);
    attributionControl = null;
  }
  if (scaleControl) {
    map.removeControl(scaleControl);
    scaleControl = null;
  }

  // Add controls based on config
  if (mapConfig.value.controls.zoom) {
    zoomControl = L.control.zoom({ position: mapConfig.value.controls.zoomPosition || 'topright' });
    zoomControl.addTo(map);
  }
  if (mapConfig.value.controls.attribution) {
    attributionControl = L.control.attribution({ position: mapConfig.value.controls.attributionPosition || 'bottomright' });
    attributionControl.addTo(map);
  }
  if (mapConfig.value.controls.scale) {
    scaleControl = L.control.scale({ position: mapConfig.value.controls.scalePosition || 'bottomleft' });
    scaleControl.addTo(map);
  }
  // Fullscreen control requires leaflet-fullscreen plugin
  // For now, we'll add a note in the exported code
};

// Update regions on map
const updateMapRegions = () => {
  // Remove existing regions
  mapRegions.forEach(region => map.removeLayer(region));
  mapRegions = [];

  // Add new regions
  regions.value.forEach(region => {
    let layer;
    const borderWidth = region.borderWidth || 2;
    const popupContent = region.description 
      ? `<strong>${region.label || 'Region'}</strong><br>${region.description}`
      : (region.label || '');
    
    if (region.type === 'circle') {
      layer = L.circle([region.center[0], region.center[1]], {
        radius: region.radius || 1000,
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    } else if (region.type === 'rectangle') {
      const bounds = region.bounds || [
        [region.center[0] - 0.01, region.center[1] - 0.01],
        [region.center[0] + 0.01, region.center[1] + 0.01]
      ];
      layer = L.rectangle(bounds, {
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    } else if (region.type === 'polygon') {
      layer = L.polygon(region.coordinates || [], {
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    }

    if (layer) {
      if (popupContent) {
        layer.bindPopup(popupContent);
      }
      layer.addTo(map);
      mapRegions.push(layer);
    }
  });
};

// Watch for config changes
watch(() => mapConfig.value.mapStyle, () => {
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    const tileLayer = L.tileLayer(getTileLayerUrl(mapConfig.value.mapStyle), {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });
    tileLayer.addTo(map);
  }
});

watch(() => mapConfig.value.center, () => {
  if (map) {
    map.setView(mapConfig.value.center, mapConfig.value.zoom);
  }
}, { deep: true });

watch(() => mapConfig.value.zoom, (newZoom) => {
  if (map) {
    map.setZoom(newZoom);
  }
});

watch(() => mapConfig.value.interactions, () => {
  if (map) {
    map.dragging.enable(mapConfig.value.interactions.dragging);
    map.scrollWheelZoom.enable(mapConfig.value.interactions.scrollWheelZoom);
    map.doubleClickZoom.enable(mapConfig.value.interactions.doubleClickZoom);
  }
}, { deep: true });

watch(() => mapConfig.value.controls, () => {
  updateMapControls();
}, { deep: true });

watch(() => markers.value, () => {
  updateMapMarkers();
}, { deep: true });

watch(() => regions.value, () => {
  updateMapRegions();
}, { deep: true });

const handleImageUpload = (event, marker) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      marker.customImageUrl = e.target.result;
      marker.icon = 'custom';
    };
    reader.readAsDataURL(file);
  }
};

const addMarker = () => {
  markers.value.push({
    id: Date.now().toString(),
    lat: mapConfig.value.center[0],
    lng: mapConfig.value.center[1],
    title: '',
    popup: '',
    color: '#ef4444',
    icon: 'default',
    size: 'medium',
    draggable: true,
    popupPosition: 'auto',
    autoOpen: false,
    customImageUrl: null
  });
};

const addMarkerAtPosition = (lat, lng) => {
  markers.value.push({
    id: Date.now().toString(),
    lat,
    lng,
    title: '',
    popup: '',
    color: '#ef4444',
    icon: 'default',
    size: 'medium',
    draggable: true,
    popupPosition: 'auto',
    autoOpen: false,
    customImageUrl: null
  });
};

const removeMarker = (id) => {
  const index = markers.value.findIndex(m => m.id === id);
  if (index > -1) {
    markers.value.splice(index, 1);
  }
};

const addRegion = (type) => {
  const center = mapConfig.value.center;
  
  if (type === 'circle') {
    regions.value.push({
      id: Date.now().toString(),
      type: 'circle',
      center: [...center],
      radius: 1000,
      fillColor: '#3388ff',
      strokeColor: '#3388ff',
      opacity: 0.3,
      borderWidth: 2,
      label: '',
      description: ''
    });
  } else if (type === 'rectangle') {
    regions.value.push({
      id: Date.now().toString(),
      type: 'rectangle',
      center: [...center],
      bounds: [
        [center[0] - 0.01, center[1] - 0.01],
        [center[0] + 0.01, center[1] + 0.01]
      ],
      fillColor: '#3388ff',
      strokeColor: '#3388ff',
      opacity: 0.3,
      borderWidth: 2,
      label: '',
      description: ''
    });
  } else if (type === 'polygon') {
    // Create a simple triangle polygon around center
    regions.value.push({
      id: Date.now().toString(),
      type: 'polygon',
      coordinates: [
        [center[0] + 0.01, center[1] + 0.01],
        [center[0] - 0.01, center[1] + 0.01],
        [center[0], center[1] - 0.01],
        [center[0] + 0.01, center[1] + 0.01]
      ],
      fillColor: '#3388ff',
      strokeColor: '#3388ff',
      opacity: 0.3,
      borderWidth: 2,
      label: '',
      description: ''
    });
  }
};

const removeRegion = (id) => {
  const index = regions.value.findIndex(r => r.id === id);
  if (index > -1) {
    regions.value.splice(index, 1);
  }
};

const generatedCode = computed(() => {
  const markersData = markers.value.map(m => ({
    lat: m.lat,
    lng: m.lng,
    title: m.title,
    popup: m.popup,
    color: m.color,
    icon: m.icon,
    size: m.size || 'medium',
    draggable: m.draggable !== false,
    popupPosition: m.popupPosition || 'auto',
    autoOpen: m.autoOpen || false,
    customImageUrl: m.customImageUrl || null
  }));

  const regionsData = regions.value.map(r => ({
    type: r.type,
    ...(r.type === 'circle' ? { center: r.center, radius: r.radius } : 
        r.type === 'rectangle' ? { bounds: r.bounds } : 
        { coordinates: r.coordinates }),
    fillColor: r.fillColor,
    strokeColor: r.strokeColor,
    opacity: r.opacity,
    borderWidth: r.borderWidth || 2,
    label: r.label,
    description: r.description || ''
  }));

  if (selectedExportFormat.value === 'react') {
    return `import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface Marker {
  lat: number;
  lng: number;
  title?: string;
  popup?: string;
  color?: string;
  icon?: 'default' | 'pin' | 'circle' | 'star' | 'custom';
  size?: 'small' | 'medium' | 'large';
  draggable?: boolean;
  popupPosition?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  autoOpen?: boolean;
  customImageUrl?: string;
}

export interface Region {
  type: 'circle' | 'rectangle' | 'polygon';
  center?: [number, number];
  radius?: number;
  bounds?: [[number, number], [number, number]];
  coordinates?: [number, number][];
  fillColor?: string;
  strokeColor?: string;
  opacity?: number;
  borderWidth?: number;
  label?: string;
  description?: string;
}

export interface MapProps {
  center?: [number, number];
  zoom?: number;
  mapStyle?: 'street' | 'satellite' | 'terrain' | 'dark';
  height?: string;
  markers?: Marker[];
  regions?: Region[];
  controls?: {
    zoom?: boolean;
    zoomPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    attribution?: boolean;
    attributionPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    scale?: boolean;
    scalePosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    fullscreen?: boolean;
  };
  interactions?: {
    dragging?: boolean;
    scrollWheelZoom?: boolean;
    doubleClickZoom?: boolean;
  };
}

const getTileLayerUrl = (style: string) => {
  const tileLayers = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  return tileLayers[style] || tileLayers.street;
};

const getIconSize = (size: string, iconType: string) => {
  const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (iconType === 'default') {
    return {
      iconSize: [Math.round(25 * multiplier), Math.round(41 * multiplier)],
      iconAnchor: [Math.round(12 * multiplier), Math.round(41 * multiplier)],
      popupAnchor: [1, Math.round(-34 * multiplier)],
      shadowSize: [Math.round(41 * multiplier), Math.round(41 * multiplier)]
    };
  } else if (iconType === 'circle') {
    const baseSize = 20;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier / 2)]
    };
  } else {
    const baseSize = 24;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier)]
    };
  }
};

const getPopupAnchor = (position: string, iconType: string, size: string) => {
  const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (position === 'top') {
    return iconType === 'default' ? [0, Math.round(41 * multiplier)] : [0, Math.round(24 * multiplier)];
  } else if (position === 'bottom') {
    return iconType === 'default' ? [0, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
  } else if (position === 'left') {
    return iconType === 'default' ? [Math.round(25 * multiplier), 0] : [Math.round(24 * multiplier), 0];
  } else if (position === 'right') {
    return iconType === 'default' ? [Math.round(-25 * multiplier), 0] : [Math.round(-24 * multiplier), 0];
  }
  return iconType === 'default' ? [1, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
};

export const InteractiveMap: React.FC<MapProps> = ({
  center = ${JSON.stringify(mapConfig.value.center)},
  zoom = ${mapConfig.value.zoom},
  mapStyle = '${mapConfig.value.mapStyle}',
  height = '${mapConfig.value.height}',
  markers = ${JSON.stringify(markersData, null, 2)},
  regions = ${JSON.stringify(regionsData, null, 2)},
  controls = ${JSON.stringify(mapConfig.value.controls, null, 2)},
  interactions = ${JSON.stringify(mapConfig.value.interactions, null, 2)}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const regionsRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      dragging: interactions?.dragging ?? true,
      scrollWheelZoom: interactions?.scrollWheelZoom ?? true,
      doubleClickZoom: interactions?.doubleClickZoom ?? true,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer(getTileLayerUrl(mapStyle), {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });
    tileLayer.addTo(map);

    if (controls?.zoom) {
      L.control.zoom({ position: controls.zoomPosition || 'topright' }).addTo(map);
    }
    if (controls?.attribution) {
      L.control.attribution({ position: controls.attributionPosition || 'bottomright' }).addTo(map);
    }
    if (controls?.scale) {
      L.control.scale({ position: controls.scalePosition || 'bottomleft' }).addTo(map);
    }
    if (controls?.fullscreen) {
      // Fullscreen control requires leaflet-fullscreen plugin
      // Install: npm install leaflet-fullscreen
      // Import: import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
      // Import: import 'leaflet-fullscreen';
      // Then use: L.control.fullscreen().addTo(map);
    }

    // Add markers
    markers.forEach(marker => {
      const markerSize = marker.size || 'medium';
      const iconType = marker.icon || 'default';
      let icon;
      const iconSizes = getIconSize(markerSize, iconType);
      
      if (iconType === 'default') {
        icon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: iconSizes.iconSize,
          iconAnchor: iconSizes.iconAnchor,
          popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'default', markerSize),
          shadowSize: iconSizes.shadowSize
        });
      } else if (iconType === 'circle') {
        const size = iconSizes.iconSize[0];
        icon = L.divIcon({
          className: 'custom-marker',
          html: \`<div style="background-color: \${marker.color || '#ef4444'}; width: \${size}px; height: \${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
          iconSize: iconSizes.iconSize,
          iconAnchor: iconSizes.iconAnchor
        });
      } else if (iconType === 'pin') {
        const size = iconSizes.iconSize[0];
        icon = L.divIcon({
          className: 'custom-marker',
          html: \`<div style="color: \${marker.color || '#ef4444'}; font-size: \${size}px;">📍</div>\`,
          iconSize: iconSizes.iconSize,
          iconAnchor: iconSizes.iconAnchor
        });
      } else if (iconType === 'custom' && marker.customImageUrl) {
        icon = L.icon({
          iconUrl: marker.customImageUrl,
          iconSize: iconSizes.iconSize,
          iconAnchor: iconSizes.iconAnchor,
          popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'custom', markerSize)
        });
      } else {
        const size = iconSizes.iconSize[0];
        icon = L.divIcon({
          className: 'custom-marker',
          html: \`<div style="color: \${marker.color || '#ef4444'}; font-size: \${size}px;">⭐</div>\`,
          iconSize: iconSizes.iconSize,
          iconAnchor: iconSizes.iconAnchor
        });
      }

      const leafletMarker = L.marker([marker.lat, marker.lng], { 
        icon,
        draggable: marker.draggable !== false
      });
      
      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
        if (marker.autoOpen) {
          leafletMarker.openPopup();
        }
      }
      leafletMarker.addTo(map);
      markersRef.current.push(leafletMarker);
    });

    // Add regions
    regions.forEach(region => {
      let layer;
      const borderWidth = region.borderWidth || 2;
      const popupContent = region.description 
        ? \`<strong>\${region.label || 'Region'}</strong><br>\${region.description}\`
        : (region.label || '');
      
      if (region.type === 'circle' && region.center && region.radius) {
        layer = L.circle(region.center, {
          radius: region.radius,
          fillColor: region.fillColor || '#3388ff',
          color: region.strokeColor || '#3388ff',
          weight: borderWidth,
          opacity: region.opacity || 0.5,
          fillOpacity: region.opacity || 0.2
        });
      } else if (region.type === 'rectangle' && region.bounds) {
        layer = L.rectangle(region.bounds, {
          fillColor: region.fillColor || '#3388ff',
          color: region.strokeColor || '#3388ff',
          weight: borderWidth,
          opacity: region.opacity || 0.5,
          fillOpacity: region.opacity || 0.2
        });
      } else if (region.type === 'polygon' && region.coordinates) {
        layer = L.polygon(region.coordinates, {
          fillColor: region.fillColor || '#3388ff',
          color: region.strokeColor || '#3388ff',
          weight: borderWidth,
          opacity: region.opacity || 0.5,
          fillOpacity: region.opacity || 0.2
        });
      }

      if (layer) {
        if (popupContent) {
          layer.bindPopup(popupContent);
        }
        layer.addTo(map);
        regionsRef.current.push(layer);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      regionsRef.current = [];
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height }}
    />
  );
};`;
  } else if (selectedExportFormat.value === 'vue') {
    const templateTag = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateCloseTag = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupTag = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    
    return templateTag + `
  <div ref="mapContainer" :style="{ width: '100%', height: height || '500px' }"></div>
` + templateCloseTag + `

` + scriptSetupTag + `
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const props = defineProps({
  center: {
    type: Array,
    default: () => ${JSON.stringify(mapConfig.value.center)}
  },
  zoom: {
    type: Number,
    default: ${mapConfig.value.zoom}
  },
  mapStyle: {
    type: String,
    default: '${mapConfig.value.mapStyle}'
  },
  height: {
    type: String,
    default: '${mapConfig.value.height}'
  },
  markers: {
    type: Array,
    default: () => ${JSON.stringify(markersData, null, 4)}
  },
  regions: {
    type: Array,
    default: () => ${JSON.stringify(regionsData, null, 4)}
  },
  controls: {
    type: Object,
    default: () => ${JSON.stringify(mapConfig.value.controls, null, 4)}
  },
  interactions: {
    type: Object,
    default: () => ${JSON.stringify(mapConfig.value.interactions, null, 4)}
  }
});

const mapContainer = ref(null);
let map = null;
let mapMarkers = [];
let mapRegions = [];

const getTileLayerUrl = (style) => {
  const tileLayers = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  return tileLayers[style] || tileLayers.street;
};

const getIconSize = (size, iconType) => {
  const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (iconType === 'default') {
    return {
      iconSize: [Math.round(25 * multiplier), Math.round(41 * multiplier)],
      iconAnchor: [Math.round(12 * multiplier), Math.round(41 * multiplier)],
      popupAnchor: [1, Math.round(-34 * multiplier)],
      shadowSize: [Math.round(41 * multiplier), Math.round(41 * multiplier)]
    };
  } else if (iconType === 'circle') {
    const baseSize = 20;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier / 2)]
    };
  } else {
    const baseSize = 24;
    return {
      iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
      iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier)]
    };
  }
};

const getPopupAnchor = (position, iconType, size) => {
  const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
  const multiplier = sizeMultipliers[size] || 1;
  
  if (position === 'top') {
    return iconType === 'default' ? [0, Math.round(41 * multiplier)] : [0, Math.round(24 * multiplier)];
  } else if (position === 'bottom') {
    return iconType === 'default' ? [0, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
  } else if (position === 'left') {
    return iconType === 'default' ? [Math.round(25 * multiplier), 0] : [Math.round(24 * multiplier), 0];
  } else if (position === 'right') {
    return iconType === 'default' ? [Math.round(-25 * multiplier), 0] : [Math.round(-24 * multiplier), 0];
  }
  return iconType === 'default' ? [1, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
};

const initMap = () => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    dragging: props.interactions.dragging ?? true,
    scrollWheelZoom: props.interactions.scrollWheelZoom ?? true,
    doubleClickZoom: props.interactions.doubleClickZoom ?? true,
    zoomControl: false,
    attributionControl: false
  });

  const tileLayer = L.tileLayer(getTileLayerUrl(props.mapStyle), {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });
  tileLayer.addTo(map);

  if (props.controls.zoom) {
    L.control.zoom({ position: props.controls.zoomPosition || 'topright' }).addTo(map);
  }
  if (props.controls.attribution) {
    L.control.attribution({ position: props.controls.attributionPosition || 'bottomright' }).addTo(map);
  }
  if (props.controls.scale) {
    L.control.scale({ position: props.controls.scalePosition || 'bottomleft' }).addTo(map);
  }
  if (props.controls.fullscreen) {
    // Fullscreen control requires leaflet-fullscreen plugin
    // Include: ${htmlOpen}link rel="stylesheet" href="https://unpkg.com/leaflet-fullscreen/dist/leaflet.fullscreen.css" ${htmlClose}${htmlSlash}${htmlClose}
    // Include: ${htmlOpen}script src="https://unpkg.com/leaflet-fullscreen/dist/Leaflet.fullscreen.min.js"${htmlClose}${htmlOpen}${htmlSlash}script${htmlClose}
    // Then use: L.control.fullscreen().addTo(map);
  }

  // Add markers
  props.markers.forEach(marker => {
    const markerSize = marker.size || 'medium';
    const iconType = marker.icon || 'default';
    let icon;
    const iconSizes = getIconSize(markerSize, iconType);
    
    if (iconType === 'default') {
      icon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor,
        popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'default', markerSize),
        shadowSize: iconSizes.shadowSize
      });
    } else if (iconType === 'circle') {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: \`<div style="background-color: \${marker.color || '#ef4444'}; width: \${size}px; height: \${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    } else if (iconType === 'pin') {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: \`<div style="color: \${marker.color || '#ef4444'}; font-size: \${size}px;">📍</div>\`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    } else if (iconType === 'custom' && marker.customImageUrl) {
      icon = L.icon({
        iconUrl: marker.customImageUrl,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor,
        popupAnchor: getPopupAnchor(marker.popupPosition || 'auto', 'custom', markerSize)
      });
    } else {
      const size = iconSizes.iconSize[0];
      icon = L.divIcon({
        className: 'custom-marker',
        html: \`<div style="color: \${marker.color || '#ef4444'}; font-size: \${size}px;">⭐</div>\`,
        iconSize: iconSizes.iconSize,
        iconAnchor: iconSizes.iconAnchor
      });
    }

    const leafletMarker = L.marker([marker.lat, marker.lng], { 
      icon,
      draggable: marker.draggable !== false
    });
    
    if (marker.popup) {
      leafletMarker.bindPopup(marker.popup);
      if (marker.autoOpen) {
        leafletMarker.openPopup();
      }
    }
    leafletMarker.addTo(map);
    mapMarkers.push(leafletMarker);
  });

  // Add regions
  props.regions.forEach(region => {
    let layer;
    const borderWidth = region.borderWidth || 2;
    const popupContent = region.description 
      ? \`<strong>\${region.label || 'Region'}</strong><br>\${region.description}\`
      : (region.label || '');
    
    if (region.type === 'circle' && region.center && region.radius) {
      layer = L.circle(region.center, {
        radius: region.radius,
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    } else if (region.type === 'rectangle' && region.bounds) {
      layer = L.rectangle(region.bounds, {
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    } else if (region.type === 'polygon' && region.coordinates) {
      layer = L.polygon(region.coordinates, {
        fillColor: region.fillColor || '#3388ff',
        color: region.strokeColor || '#3388ff',
        weight: borderWidth,
        opacity: region.opacity || 0.5,
        fillOpacity: region.opacity || 0.2
      });
    }

    if (layer) {
      if (popupContent) {
        layer.bindPopup(popupContent);
      }
      layer.addTo(map);
      mapRegions.push(layer);
    }
  });
};

onMounted(() => {
  nextTick(() => {
    initMap();
  });
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
    mapMarkers = [];
    mapRegions = [];
  }
});
` + scriptClose;
  } else {
    // HTML export - use String.fromCharCode to avoid Vue template parser issues
    const htmlOpen = String.fromCharCode(60); // <
    const htmlClose = String.fromCharCode(62); // >
    const htmlSlash = String.fromCharCode(47); // /
    
    return `<!DOCTYPE html>
${htmlOpen}html lang="en"${htmlClose}
${htmlOpen}head${htmlClose}
  ${htmlOpen}meta charset="UTF-8"${htmlClose}
  ${htmlOpen}meta name="viewport" content="width=device-width, initial-scale=1.0"${htmlClose}
  ${htmlOpen}title${htmlClose}Interactive Map${htmlOpen}${htmlSlash}title${htmlClose}
  ${htmlOpen}link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" ${htmlClose}${htmlSlash}${htmlClose}
  ${htmlOpen}style${htmlClose}
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #map {
      width: 100%;
      height: ${mapConfig.value.height || '500px'};
    }
  ${htmlOpen}${htmlSlash}style${htmlClose}
${htmlOpen}${htmlSlash}head${htmlClose}
${htmlOpen}body${htmlClose}
  ${htmlOpen}div id="map"${htmlClose}${htmlOpen}${htmlSlash}div${htmlClose}
  
  ${htmlOpen}script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"${htmlClose}${htmlOpen}${htmlSlash}script${htmlClose}
  ${htmlOpen}script${htmlClose}
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView(${JSON.stringify(mapConfig.value.center)}, ${mapConfig.value.zoom});
    
    L.tileLayer('${getTileLayerUrl(mapConfig.value.mapStyle)}', {
      attribution: '&copy; ${htmlOpen}a href="https://www.openstreetmap.org/copyright"${htmlClose}OpenStreetMap${htmlOpen}${htmlSlash}a${htmlClose} contributors',
      maxZoom: 19
    }).addTo(map);

    ${mapConfig.value.controls.zoom ? `L.control.zoom({ position: '${mapConfig.value.controls.zoomPosition || 'topright'}' }).addTo(map);` : ''}
    ${mapConfig.value.controls.attribution ? `L.control.attribution({ position: '${mapConfig.value.controls.attributionPosition || 'bottomright'}' }).addTo(map);` : ''}
    ${mapConfig.value.controls.scale ? `L.control.scale({ position: '${mapConfig.value.controls.scalePosition || 'bottomleft'}' }).addTo(map);` : ''}
    ${mapConfig.value.controls.fullscreen ? `// Fullscreen control requires leaflet-fullscreen plugin
    // Include: ${htmlOpen}link rel="stylesheet" href="https://unpkg.com/leaflet-fullscreen/dist/leaflet.fullscreen.css" ${htmlClose}${htmlSlash}${htmlClose}
    // Include: ${htmlOpen}script src="https://unpkg.com/leaflet-fullscreen/dist/Leaflet.fullscreen.min.js"${htmlClose}${htmlOpen}${htmlSlash}script${htmlClose}
    // Then use: L.control.fullscreen().addTo(map);` : ''}

    // Helper functions for marker sizing and popup positioning
    const getIconSize = (size, iconType) => {
      const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
      const multiplier = sizeMultipliers[size] || 1;
      if (iconType === 'default') {
        return {
          iconSize: [Math.round(25 * multiplier), Math.round(41 * multiplier)],
          iconAnchor: [Math.round(12 * multiplier), Math.round(41 * multiplier)],
          popupAnchor: [1, Math.round(-34 * multiplier)],
          shadowSize: [Math.round(41 * multiplier), Math.round(41 * multiplier)]
        };
      } else if (iconType === 'circle') {
        const baseSize = 20;
        return {
          iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
          iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier / 2)]
        };
      } else {
        const baseSize = 24;
        return {
          iconSize: [Math.round(baseSize * multiplier), Math.round(baseSize * multiplier)],
          iconAnchor: [Math.round(baseSize * multiplier / 2), Math.round(baseSize * multiplier)]
        };
      }
    };

    const getPopupAnchor = (position, iconType, size) => {
      const sizeMultipliers = { small: 0.7, medium: 1, large: 1.4 };
      const multiplier = sizeMultipliers[size] || 1;
      if (position === 'top') {
        return iconType === 'default' ? [0, Math.round(41 * multiplier)] : [0, Math.round(24 * multiplier)];
      } else if (position === 'bottom') {
        return iconType === 'default' ? [0, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
      } else if (position === 'left') {
        return iconType === 'default' ? [Math.round(25 * multiplier), 0] : [Math.round(24 * multiplier), 0];
      } else if (position === 'right') {
        return iconType === 'default' ? [Math.round(-25 * multiplier), 0] : [Math.round(-24 * multiplier), 0];
      }
      return iconType === 'default' ? [1, Math.round(-34 * multiplier)] : [0, Math.round(-24 * multiplier)];
    };

    ${markers.value.map(marker => {
      const markerSize = marker.size || 'medium';
      const iconType = marker.icon || 'default';
      const iconSizes = `getIconSize('${markerSize}', '${iconType}')`;
      let iconCode = '';
      
      if (iconType === 'default') {
        const popupAnchor = `getPopupAnchor('${marker.popupPosition || 'auto'}', 'default', '${markerSize}')`;
        iconCode = `L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: ${iconSizes}.iconSize,
          iconAnchor: ${iconSizes}.iconAnchor,
          popupAnchor: ${popupAnchor},
          shadowSize: ${iconSizes}.shadowSize
        })`;
      } else if (iconType === 'circle') {
        iconCode = `L.divIcon({
          className: 'custom-marker',
          html: '${htmlOpen}div style="background-color: ${marker.color || '#ef4444'}; width: ' + ${iconSizes}.iconSize[0] + 'px; height: ' + ${iconSizes}.iconSize[0] + 'px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"${htmlClose}${htmlOpen}${htmlSlash}div${htmlClose}',
          iconSize: ${iconSizes}.iconSize,
          iconAnchor: ${iconSizes}.iconAnchor
        })`;
      } else if (iconType === 'pin') {
        iconCode = `L.divIcon({
          className: 'custom-marker',
          html: '${htmlOpen}div style="color: ${marker.color || '#ef4444'}; font-size: ' + ${iconSizes}.iconSize[0] + 'px;"${htmlClose}📍${htmlOpen}${htmlSlash}div${htmlClose}',
          iconSize: ${iconSizes}.iconSize,
          iconAnchor: ${iconSizes}.iconAnchor
        })`;
      } else if (iconType === 'custom' && marker.customImageUrl) {
        const popupAnchor = `getPopupAnchor('${marker.popupPosition || 'auto'}', 'custom', '${markerSize}')`;
        iconCode = `L.icon({
          iconUrl: '${marker.customImageUrl.replace(/'/g, "\\'")}',
          iconSize: ${iconSizes}.iconSize,
          iconAnchor: ${iconSizes}.iconAnchor,
          popupAnchor: ${popupAnchor}
        })`;
      } else {
        iconCode = `L.divIcon({
          className: 'custom-marker',
          html: '${htmlOpen}div style="color: ${marker.color || '#ef4444'}; font-size: ' + ${iconSizes}.iconSize[0] + 'px;"${htmlClose}⭐${htmlOpen}${htmlSlash}div${htmlClose}',
          iconSize: ${iconSizes}.iconSize,
          iconAnchor: ${iconSizes}.iconAnchor
        })`;
      }
      
      const draggable = marker.draggable !== false ? ', draggable: true' : '';
      const autoOpen = marker.autoOpen ? `\n    marker${marker.id}.openPopup();` : '';
      
      return `const marker${marker.id} = L.marker([${marker.lat}, ${marker.lng}], { icon: ${iconCode}${draggable} });
${marker.popup ? `marker${marker.id}.bindPopup('${marker.popup.replace(/'/g, "\\'")}');` : ''}${autoOpen}
marker${marker.id}.addTo(map);`;
    }).join('\n    ')}

    ${regions.value.map(region => {
      const borderWidth = region.borderWidth || 2;
      const popupContent = region.description 
        ? `<strong>${region.label || 'Region'}</strong><br>${region.description}`
        : (region.label || '');
      const popupCode = popupContent ? `region${region.id}.bindPopup('${popupContent.replace(/'/g, "\\'")}');` : '';
      
      if (region.type === 'circle' && region.center && region.radius) {
        return `const region${region.id} = L.circle([${region.center[0]}, ${region.center[1]}], {
      radius: ${region.radius},
      fillColor: '${region.fillColor || '#3388ff'}',
      color: '${region.strokeColor || '#3388ff'}',
      weight: ${borderWidth},
      opacity: ${region.opacity || 0.5},
      fillOpacity: ${region.opacity || 0.2}
    });
${popupCode}
region${region.id}.addTo(map);`;
      } else if (region.type === 'rectangle' && region.bounds) {
        return `const region${region.id} = L.rectangle(${JSON.stringify(region.bounds)}, {
      fillColor: '${region.fillColor || '#3388ff'}',
      color: '${region.strokeColor || '#3388ff'}',
      weight: ${borderWidth},
      opacity: ${region.opacity || 0.5},
      fillOpacity: ${region.opacity || 0.2}
    });
${popupCode}
region${region.id}.addTo(map);`;
      } else if (region.type === 'polygon' && region.coordinates) {
        return `const region${region.id} = L.polygon(${JSON.stringify(region.coordinates)}, {
      fillColor: '${region.fillColor || '#3388ff'}',
      color: '${region.strokeColor || '#3388ff'}',
      weight: ${borderWidth},
      opacity: ${region.opacity || 0.5},
      fillOpacity: ${region.opacity || 0.2}
    });
${popupCode}
region${region.id}.addTo(map);`;
      }
      return '';
    }).join('\n    ')}
  ${htmlOpen}${htmlSlash}script${htmlClose}
${htmlOpen}${htmlSlash}body${htmlClose}
${htmlOpen}${htmlSlash}html${htmlClose}`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
  } catch (error) {
    console.error('Copy failed:', error);
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

  // Initialize map after component is mounted
  nextTick(() => {
    initMap();
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

:deep(.leaflet-container) {
  font-family: inherit;
}
</style>

