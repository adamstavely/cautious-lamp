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
                      Gradient Generator
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create beautiful gradients for your UI designs with custom stops, angles, and color interpolation.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Design Tool
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
                        <linearGradient id="gradientGeneratorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized gradient icon -->
                      <rect x="20" y="20" width="160" height="160" rx="8" fill="url(#gradientGeneratorGradient)" opacity="0.3"/>
                      <rect x="40" y="40" width="120" height="120" rx="4" fill="url(#gradientGeneratorGradient)" opacity="0.5"/>
                      <rect x="60" y="60" width="80" height="80" rx="4" fill="url(#gradientGeneratorGradient)" opacity="0.7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Gradient Editor -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Gradient Preview -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">preview</span>
                Preview
              </h2>
              <div 
                v-if="animationEnabled" 
                class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="isDarkMode 
                  ? 'bg-indigo-900/30 text-indigo-300' 
                  : 'bg-indigo-100 text-indigo-700'"
              >
                <span class="material-symbols-outlined text-sm animate-spin">sync</span>
                Animating
              </div>
            </div>
            <div
              class="w-full h-64 rounded-lg shadow-inner mb-4 transition-all"
              :class="{ 'animate-gradient': animationEnabled }"
              :style="{ 
                backgroundImage: animationEnabled ? animatedGradient : cssGradientWithBlend,
                backgroundBlendMode: animationEnabled ? 'normal' : cssBlendModes,
                ...animationStyle
              }"
            ></div>
            
            <!-- Preview on Different Backgrounds -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div 
                class="rounded p-2 border"
                :class="isDarkMode 
                  ? 'bg-slate-700 border-gray-600' 
                  : 'bg-white border-gray-200'"
              >
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs mt-1 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">White</p>
              </div>
              <div 
                class="rounded p-2 border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-600' 
                  : 'bg-gray-900 border-gray-200'"
              >
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs mt-1 text-center text-white">Dark</p>
              </div>
              <div 
                class="rounded p-2 border"
                :class="isDarkMode 
                  ? 'bg-slate-600 border-gray-600' 
                  : 'bg-gray-200 border-gray-200'"
              >
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs mt-1 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Gray</p>
              </div>
            </div>

            <!-- Accessibility Check -->
            <div 
              class="pt-4 border-t"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Accessibility Check</label>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Text Color:</label>
                  <button
                    @click="openAccessibilityColorPicker($event)"
                    class="w-8 h-8 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                    :class="isDarkMode 
                      ? 'border-gray-600 hover:border-indigo-400' 
                      : 'border-gray-300 hover:border-indigo-500'"
                    :style="{ backgroundColor: accessibilityTextColor }"
                    title="Pick text color"
                  ></button>
                  <input
                    v-model="accessibilityTextColor"
                    type="text"
                    class="w-20 px-2 py-1 border rounded text-xs font-mono"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="#000000"
                  />
                </div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Ratio:</span>
                  <span 
                    :class="contrastRatio >= 4.5 
                      ? (isDarkMode ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold')
                      : contrastRatio >= 3 
                        ? (isDarkMode ? 'text-yellow-400 font-semibold' : 'text-yellow-600 font-semibold')
                        : (isDarkMode ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold')"
                  >
                    {{ contrastRatio.toFixed(2) }}:1
                  </span>
                  <span 
                    :class="contrastRatio >= 4.5 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-red-400' : 'text-red-600')"
                  >
                    {{ contrastRatio >= 4.5 ? '✓ AA' : '✗ AA' }}
                  </span>
                  <span 
                    :class="contrastRatio >= 7 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-red-400' : 'text-red-600')"
                  >
                    {{ contrastRatio >= 7 ? '✓ AAA' : '✗ AAA' }}
                  </span>
                </div>
                <div 
                  class="flex-1 p-2 rounded border-2" 
                  :class="isDarkMode ? 'border-gray-600' : 'border-gray-200'"
                  :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes, borderColor: accessibilityTextColor }"
                >
                  <p class="text-sm font-semibold text-center" :style="{ color: accessibilityTextColor }">
                    Sample
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Color Stops -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                Color Stops
              </h2>
              <div class="flex items-center gap-2">
                <button
                  @click="fetchPalettes"
                  :disabled="loadingPalettes"
                  class="px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-wait"
                  :class="isDarkMode 
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ loadingPalettes ? 'Loading…' : 'Load from Palette Builder' }}
                </button>
                <button
                  @click="addColorStop"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  Add Stop
                </button>
              </div>
            </div>

            <InlineNotice :notice="paletteNotice" class="mb-4" @dismiss="clearPaletteNotice" />

            <!-- Palette Selector -->
            <div v-if="availablePalettes.length > 0" class="mb-4 space-y-2">
              <select
                v-model="selectedPaletteId"
                class="w-full px-3 py-2 border rounded-lg text-sm"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Select a palette...</option>
                <option v-for="palette in availablePalettes" :key="palette.id" :value="palette.id">
                  {{ palette.name }}
                </option>
              </select>
              <button
                @click="importPaletteColors"
                :disabled="!selectedPaletteId"
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Colors
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(stop, index) in colorStops"
                :key="stop.id"
                class="flex items-center gap-3 p-3 border rounded-lg transition-colors"
                :class="[
                  { 'cursor-move': !isDragging, 'cursor-grabbing': isDragging },
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500 bg-slate-700/50' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                ]"
                @dragover.prevent="handleDragOver(index, $event)"
                @drop="handleDrop(index, $event)"
              >
                <!-- Drag Handle -->
                <div
                  class="cursor-move flex-shrink-0"
                  draggable="true"
                  @dragstart="handleDragStart(index, $event)"
                  @dragend="handleDragEnd"
                  title="Drag to reorder"
                >
                  <span 
                    class="material-symbols-outlined"
                    :class="isDarkMode 
                      ? 'text-gray-500 hover:text-gray-400' 
                      : 'text-gray-400 hover:text-gray-600'"
                  >drag_indicator</span>
                </div>

                <!-- Color Swatch Button -->
                <button
                  @click="openColorPicker(index, $event)"
                  class="w-12 h-12 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                  :class="isDarkMode 
                    ? 'border-gray-600 hover:border-indigo-400' 
                    : 'border-gray-300 hover:border-indigo-500'"
                  :style="{ backgroundColor: stop.color }"
                  title="Pick color"
                  @mousedown.stop
                ></button>
                
                <!-- Hex Input -->
                <input
                  v-model="stop.color"
                  type="text"
                  @input="updateGradient"
                  placeholder="#000000"
                  class="w-24 px-2 py-1 border rounded text-sm font-mono flex-shrink-0"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  @mousedown.stop
                  @click.stop
                />
                
                <!-- Position Slider -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs w-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Position</span>
                    <input
                      v-model.number="stop.position"
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="flex-1"
                    />
                    <input
                      v-model.number="stop.position"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <span class="text-xs w-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">%</span>
                  </div>
                  <!-- Opacity Slider -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs w-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Opacity</span>
                    <input
                      v-model.number="stop.opacity"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="flex-1"
                    />
                    <input
                      v-model.number="stop.opacity"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <span class="text-xs w-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">%</span>
                  </div>
                </div>

                <!-- Remove Button -->
                <button
                  v-if="colorStops.length > 2"
                  @click="removeColorStop(index)"
                  class="p-2 rounded transition-colors flex-shrink-0"
                  :class="isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/20' 
                    : 'text-red-600 hover:bg-red-50'"
                  title="Remove stop"
                  @mousedown.stop
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Gradient Type & Settings -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">settings</span>
                  Settings
                </h2>
                <p v-if="layers.length > 1" class="text-xs mt-0.5" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                  Editing: <span class="font-medium" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">Layer {{ currentLayerIndex + 1 }}</span>
                </p>
              </div>
              <button
                @click="showExportModal = true"
                class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
                title="Export gradient"
              >
                <span class="material-symbols-outlined text-xl">download</span>
                <span class="text-sm font-medium">Export</span>
              </button>
            </div>

            <!-- Layers Management -->
            <div 
              class="mb-6 pb-6 border-b"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">layers</span>
                    <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Layers</label>
                  </div>
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Stack multiple gradients with blend modes</p>
                </div>
                <button
                  @click="addLayer"
                  class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 flex-shrink-0 ml-3"
                >
                  <span class="material-symbols-outlined text-sm">add</span>
                  Add Layer
                </button>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div
                  v-for="(layer, index) in layers"
                  :key="layer.id"
                  class="group relative rounded-lg border-2 transition-all"
                  :class="currentLayerIndex === index 
                    ? (isDarkMode 
                      ? 'border-indigo-400 bg-indigo-900/20 shadow-sm' 
                      : 'border-indigo-500 bg-indigo-50 shadow-sm')
                    : (isDarkMode 
                      ? 'border-gray-600 hover:border-gray-500 bg-slate-700' 
                      : 'border-gray-200 hover:border-gray-300 bg-white')"
                >
                  <!-- Layer Header -->
                  <div class="flex items-center gap-2 p-2">
                    <input
                      type="checkbox"
                      v-model="layer.enabled"
                      class="rounded"
                      @click.stop
                      title="Toggle layer visibility"
                    />
                    <div class="flex-1 flex items-center gap-2 min-w-0">
                      <!-- Layer Preview Swatch -->
                      <div 
                        class="w-8 h-8 rounded border flex-shrink-0"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        :style="getLayerPreview(layer)"
                        title="Layer preview"
                      ></div>
                      <!-- Layer Info -->
                      <div class="flex-1 min-w-0">
                        <button
                          @click="currentLayerIndex = index"
                          class="text-left text-sm font-medium transition-colors w-full"
                          :class="isDarkMode 
                            ? 'text-white hover:text-indigo-400' 
                            : 'text-gray-900 hover:text-indigo-600'"
                        >
                          Layer {{ index + 1 }}
                        </button>
                        <div class="flex items-center gap-2 text-xs mt-0.5" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                          <span class="capitalize">{{ layer.type }}</span>
                          <span>•</span>
                          <span class="capitalize">{{ layer.blendMode }}</span>
                          <span v-if="layer.colorStops.length > 0">•</span>
                          <span v-if="layer.colorStops.length > 0">{{ layer.colorStops.length }} stops</span>
                        </div>
                      </div>
                      <!-- Layer Actions -->
                      <div class="flex items-center gap-1">
                        <button
                          v-if="index > 0"
                          @click="moveLayer(index, index - 1)"
                          class="p-1 rounded transition-colors"
                          :class="isDarkMode 
                            ? 'text-gray-500 hover:text-gray-400' 
                            : 'text-gray-400 hover:text-gray-600'"
                          title="Move up"
                        >
                          <span class="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          v-if="index < layers.length - 1"
                          @click="moveLayer(index, index + 1)"
                          class="p-1 rounded transition-colors"
                          :class="isDarkMode 
                            ? 'text-gray-500 hover:text-gray-400' 
                            : 'text-gray-400 hover:text-gray-600'"
                          title="Move down"
                        >
                          <span class="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          v-if="layers.length > 1"
                          @click="removeLayer(index)"
                          class="p-1 rounded transition-colors"
                          :class="isDarkMode 
                            ? 'text-red-500 hover:text-red-400' 
                            : 'text-red-400 hover:text-red-600'"
                          title="Delete layer"
                        >
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Active Layer Indicator -->
                  <div v-if="currentLayerIndex === index" class="absolute top-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent rounded-tr-lg" :class="isDarkMode ? 'border-t-indigo-400' : 'border-t-indigo-500'"></div>
                  <div v-if="currentLayerIndex === index" class="absolute top-0.5 right-0.5">
                    <span class="material-symbols-outlined text-white text-xs">edit</span>
                  </div>
                </div>
              </div>
              <div v-if="layers.length > 1" class="mt-3 p-2 rounded-lg border" :class="isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'">
                <p class="text-xs flex items-start gap-1.5" :class="isDarkMode ? 'text-blue-300' : 'text-blue-700'">
                  <span class="material-symbols-outlined text-sm mt-0.5">info</span>
                  <span>Layers are stacked from bottom (Layer 1) to top. Click a layer to edit it. Use blend modes to combine layers.</span>
                </p>
              </div>
            </div>

            <!-- Current Layer Settings -->
            <div 
              class="mb-4 pb-4 border-b"
              :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">tune</span>
                <h3 class="text-base font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Current Layer Settings</h3>
              </div>
              
              <!-- Gradient Type -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Gradient Type</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="type in gradientTypes"
                    :key="type.value"
                    @click="gradientType = type.value"
                    class="px-4 py-2 rounded-lg border-2 transition-all"
                    :class="gradientType === type.value
                      ? (isDarkMode 
                        ? 'border-indigo-400 bg-indigo-900/20 text-indigo-300' 
                        : 'border-indigo-500 bg-indigo-50 text-indigo-700')
                      : (isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 bg-slate-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white')"
                  >
                    {{ type.label }}
                  </button>
                </div>
              </div>

              <!-- Linear Gradient Settings -->
              <div v-if="gradientType === 'linear'" class="mb-4">
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Angle</label>
                <div class="flex items-center gap-4">
                  <input
                    v-model.number="linearAngle"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    class="flex-1"
                  />
                  <div class="flex items-center gap-1">
                    <input
                      v-model.number="linearAngle"
                      type="number"
                      min="0"
                      max="360"
                      class="w-14 px-2 py-2 border rounded-lg text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <span class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">°</span>
                  </div>
                </div>
                <div class="mt-2 grid grid-cols-3 gap-2">
                  <button
                    v-for="direction in linearDirections"
                    :key="direction.value"
                    @click="linearAngle = direction.angle"
                    class="px-3 py-1 text-xs rounded-lg border-2 transition-all"
                    :class="linearAngle === direction.angle
                      ? (isDarkMode 
                        ? 'border-indigo-400 bg-indigo-900/20 text-indigo-300' 
                        : 'border-indigo-500 bg-indigo-50 text-indigo-700')
                      : (isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 bg-slate-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white')"
                  >
                    {{ direction.label }}
                  </button>
                </div>
              </div>

              <!-- Radial Gradient Settings -->
              <div v-if="gradientType === 'radial'" class="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Position X</label>
                  <input
                    v-model="radialPosition.x"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Position Y</label>
                  <input
                    v-model="radialPosition.y"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Shape</label>
                  <select
                    v-model="radialShape"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="ellipse">Ellipse</option>
                    <option value="circle">Circle</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Size</label>
                  <select
                    v-model="radialSize"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="farthest-corner">Farthest Corner</option>
                    <option value="farthest-side">Farthest Side</option>
                    <option value="closest-corner">Closest Corner</option>
                    <option value="closest-side">Closest Side</option>
                  </select>
                </div>
              </div>

              <!-- Conic Gradient Settings -->
              <div v-if="gradientType === 'conic'" class="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Position X</label>
                  <input
                    v-model="conicPosition.x"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Position Y</label>
                  <input
                    v-model="conicPosition.y"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Angle</label>
                  <input
                    v-model.number="conicAngle"
                    type="number"
                    min="0"
                    max="360"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
              </div>

              <!-- Blend Mode -->
              <div class="mb-2">
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Blend Mode</label>
                <select
                  v-model="blendMode"
                  class="w-full px-3 py-2 border rounded-lg text-sm"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                  <option value="color-dodge">Color Dodge</option>
                  <option value="color-burn">Color Burn</option>
                  <option value="hard-light">Hard Light</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="difference">Difference</option>
                  <option value="exclusion">Exclusion</option>
                </select>
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">How this layer blends with layers below</p>
              </div>
            </div>

            <!-- Global Animation Settings -->
            <div class="pt-1">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">animation</span>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Animation</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Animates the current active layer</p>
                </div>
              </div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-700 dark:text-gray-300">Enable Animation</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="animationEnabled"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p v-if="animationEnabled" class="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                Animation is active - watch the preview above
              </p>
              <div v-if="animationEnabled" class="space-y-3 mt-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Animation Type</label>
                  <select
                    v-model="animationType"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="position">Position (scrolls gradient)</option>
                    <option value="angle">Angle (rotates gradient)</option>
                    <option value="color">Color (cycles hues)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duration: {{ animationDuration }}s</label>
                  <input
                    v-model.number="animationDuration"
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
                  <select
                    v-model="animationDirection"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="reverse">Reverse</option>
                    <option value="alternate">Alternate</option>
                    <option value="alternate-reverse">Alternate Reverse</option>
                  </select>
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

    <!-- Export Modal -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50"
      @click="showExportModal = false"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">download</span>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Export Gradient</h2>
          </div>
          <button
            @click="showExportModal = false"
            class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <InlineNotice :notice="exportNotice" @dismiss="clearExportNotice" />

          <!-- Export Format Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code Format</label>
            <select
              v-model="exportFormat"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="css">CSS</option>
              <option value="css-vars">CSS Variables</option>
              <option value="tailwind">Tailwind Config</option>
              <option value="scss">SCSS Variables</option>
              <option value="json">JSON</option>
              <option value="react">React (styled-components)</option>
              <option value="vue">Vue (style binding)</option>
            </select>
            <div class="mt-3 bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <code class="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">{{ formattedExportCode }}</code>
            </div>
            <button
              @click="copyFormattedCode"
              class="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Copy {{ exportFormat.toUpperCase() }}
            </button>
          </div>

          <!-- File Export Options -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">File Format</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="exportAsImage"
                class="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">image</span>
                Export as Image
              </button>
              <button
                @click="exportAsSVG"
                class="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">code</span>
                Export as SVG
              </button>
              <button
                @click="exportToAdobe"
                class="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">file_download</span>
                Export to Adobe
              </button>
              <button
                @click="exportToPenpot"
                class="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">file_download</span>
                Export to Penpot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Picker -->
    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice: paletteNotice, showNotice: showPaletteNotice, clearNotice: clearPaletteNotice } = useNotice();
const { notice: exportNotice, showNotice: showExportNotice, clearNotice: clearExportNotice } = useNotice();

const gradientType = ref('linear');
const linearAngle = ref(90);
const radialPosition = ref({ x: '50%', y: '50%' });
const radialShape = ref('ellipse');
const radialSize = ref('farthest-corner');
const conicPosition = ref({ x: '50%', y: '50%' });
const conicAngle = ref(0);
const blendMode = ref('normal');
const layers = ref([
  {
    id: 1,
    type: 'linear',
    linearAngle: 90,
    radialPosition: { x: '50%', y: '50%' },
    radialShape: 'ellipse',
    radialSize: 'farthest-corner',
    conicPosition: { x: '50%', y: '50%' },
    conicAngle: 0,
    colorStops: [
      { id: 1, color: '#3b82f6', position: 0, opacity: 100 },
      { id: 2, color: '#8b5cf6', position: 100, opacity: 100 },
    ],
    blendMode: 'normal',
    opacity: 100,
    enabled: true,
  },
]);
const currentLayerIndex = ref(0);
const animationEnabled = ref(false);
const animationDuration = ref(3);
const animationDirection = ref('alternate');
const animationIterationCount = ref('infinite');
const animationType = ref('position'); // 'position', 'color', 'angle'

const colorStops = ref([
  { id: 1, color: '#3b82f6', position: 0, opacity: 100 },
  { id: 2, color: '#8b5cf6', position: 100, opacity: 100 },
]);

const draggedIndex = ref(null);
const showColorPicker = ref(false);
const pickerColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const isDragging = ref(false);
const exportFormat = ref('css');
const showAccessibilityCheck = ref(false);
const accessibilityTextColor = ref('#000000');
const availablePalettes = ref([]);
const selectedPaletteId = ref('');
const loadingPalettes = ref(false);
const showExportModal = ref(false);

const gradientTypes = [
  { label: 'Linear', value: 'linear' },
  { label: 'Radial', value: 'radial' },
  { label: 'Conic', value: 'conic' },
];

const linearDirections = [
  { label: 'To Right', angle: 90, value: 'to right' },
  { label: 'To Bottom', angle: 180, value: 'to bottom' },
  { label: 'To Left', angle: 270, value: 'to left' },
  { label: 'To Top', angle: 0, value: 'to top' },
  { label: 'To Top Right', angle: 45, value: 'to top right' },
  { label: 'To Bottom Right', angle: 135, value: 'to bottom right' },
  { label: 'To Bottom Left', angle: 225, value: 'to bottom left' },
  { label: 'To Top Left', angle: 315, value: 'to top left' },
];

const updateGradient = () => {
  // Sort stops by position
  colorStops.value.sort((a, b) => a.position - b.position);
};

// Helper to convert hex + opacity to rgba
const hexToRgba = (hex, opacity) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${opacity / 100})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

// Sync current layer with main controls
const syncCurrentLayer = () => {
  if (layers.value[currentLayerIndex.value]) {
    const layer = layers.value[currentLayerIndex.value];
    gradientType.value = layer.type;
    linearAngle.value = layer.linearAngle;
    radialPosition.value = { ...layer.radialPosition };
    radialShape.value = layer.radialShape;
    radialSize.value = layer.radialSize;
    conicPosition.value = { ...layer.conicPosition };
    conicAngle.value = layer.conicAngle;
    colorStops.value = layer.colorStops.map(s => ({ ...s }));
    blendMode.value = layer.blendMode;
  }
};

// Update current layer from main controls
const updateCurrentLayer = () => {
  if (layers.value[currentLayerIndex.value]) {
    layers.value[currentLayerIndex.value] = {
      ...layers.value[currentLayerIndex.value],
      type: gradientType.value,
      linearAngle: linearAngle.value,
      radialPosition: { ...radialPosition.value },
      radialShape: radialShape.value,
      radialSize: radialSize.value,
      conicPosition: { ...conicPosition.value },
      conicAngle: conicAngle.value,
      colorStops: colorStops.value.map(s => ({ ...s })),
      blendMode: blendMode.value,
    };
  }
};

// Watch for changes to sync layers
// Deep, because the position inputs mutate radialPosition/conicPosition in place.
watch([gradientType, linearAngle, radialPosition, radialShape, radialSize, conicPosition, conicAngle, blendMode], () => {
  updateCurrentLayer();
}, { deep: true });

watch(colorStops, () => {
  updateCurrentLayer();
}, { deep: true });

watch(currentLayerIndex, () => {
  syncCurrentLayer();
});

const cssGradient = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  
  if (enabledLayers.length === 0) return '';
  
  const gradientStrings = enabledLayers.map(layer => {
    const stops = layer.colorStops
      .map((stop) => {
        const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
        return `${color} ${stop.position}%`;
      })
      .join(', ');
    
    let gradient = '';
    switch (layer.type) {
      case 'linear':
        gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
        break;
      case 'radial':
        gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
        break;
      case 'conic':
        gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
        break;
      default:
        gradient = `linear-gradient(90deg, ${stops})`;
    }
    
    return gradient;
  });
  
  return gradientStrings.join(', ');
});

const cssGradientWithBlend = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  
  if (enabledLayers.length === 0) return '';
  
  // For multiple layers with blend modes, we need to use background-image with multiple gradients
  const backgrounds = enabledLayers.map((layer) => {
    const stops = layer.colorStops
      .map((stop) => {
        const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
        return `${color} ${stop.position}%`;
      })
      .join(', ');
    
    let gradient = '';
    switch (layer.type) {
      case 'linear':
        gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
        break;
      case 'radial':
        gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
        break;
      case 'conic':
        gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
        break;
      default:
        gradient = `linear-gradient(90deg, ${stops})`;
    }
    
    return gradient;
  });
  
  return backgrounds.join(', ');
});

const cssBlendModes = computed(() => {
  const enabledLayers = layers.value.filter(layer => layer.enabled);
  return enabledLayers.map(layer => layer.blendMode || 'normal').join(', ');
});

const animatedGradient = computed(() => {
  if (!animationEnabled.value) return cssGradientWithBlend.value;
  
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer || currentLayer.colorStops.length < 2) return cssGradientWithBlend.value;
  
  // For color animation, use normal gradient - filter handles it
  if (animationType.value === 'color') {
    return cssGradientWithBlend.value;
  }
  
  // For position and angle animations, create a wider gradient
  if (animationType.value === 'position' || animationType.value === 'angle') {
    if (currentLayer.type === 'linear') {
      const angle = currentLayer.linearAngle;
      // Create stops that extend beyond 100% for seamless scrolling
      const firstStop = currentLayer.colorStops[0];
      const lastStop = currentLayer.colorStops[currentLayer.colorStops.length - 1];
      
      const stops = currentLayer.colorStops
        .map((stop) => {
          const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
          return `${color} ${stop.position * 0.5}%`;
        })
        .concat(
          currentLayer.colorStops.map((stop) => {
            const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
            return `${color} ${stop.position * 0.5 + 50}%`;
          })
        )
        .join(', ');
      
      return `linear-gradient(${angle}deg, ${stops})`;
    }
  }
  
  return cssGradientWithBlend.value;
});

const animationStyle = computed(() => {
  if (!animationEnabled.value) return {};
  
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer) return {};
  
  const style = {};
  
  if (animationType.value === 'color') {
    // Color animation uses filter
    style.animation = `gradient-color ${animationDuration.value}s ${animationDirection.value} ${animationIterationCount.value}`;
  } else if (animationType.value === 'position' || animationType.value === 'angle') {
    if (currentLayer.type === 'linear') {
      // Position and angle animations use background-position
      style.backgroundSize = '200% 200%';
      style.backgroundRepeat = 'no-repeat';
      style.animation = `gradient-${animationType.value} ${animationDuration.value}s ${animationDirection.value} ${animationIterationCount.value}`;
      style.backgroundPosition = '0% 50%'; // Initial position
    }
  }
  
  return style;
});

const addLayer = () => {
  const newLayer = {
    id: Date.now(),
    type: 'linear',
    linearAngle: 90,
    radialPosition: { x: '50%', y: '50%' },
    radialShape: 'ellipse',
    radialSize: 'farthest-corner',
    conicPosition: { x: '50%', y: '50%' },
    conicAngle: 0,
    colorStops: [
      { id: Date.now() + 1, color: '#6366f1', position: 0, opacity: 100 },
      { id: Date.now() + 2, color: '#8b5cf6', position: 100, opacity: 100 },
    ],
    blendMode: 'normal',
    opacity: 100,
    enabled: true,
  };
  layers.value.push(newLayer);
  currentLayerIndex.value = layers.value.length - 1;
  syncCurrentLayer();
};

const removeLayer = (index) => {
  if (layers.value.length > 1) {
    layers.value.splice(index, 1);
    // Keep pointing at the same layer when one before it is removed.
    if (index < currentLayerIndex.value) {
      currentLayerIndex.value -= 1;
    } else if (currentLayerIndex.value >= layers.value.length) {
      currentLayerIndex.value = layers.value.length - 1;
    }
    syncCurrentLayer();
  }
};

const moveLayer = (fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  
  const layer = layers.value.splice(fromIndex, 1)[0];
  layers.value.splice(toIndex, 0, layer);
  
  // Keep the selection on the same layer after the move.
  const current = currentLayerIndex.value;
  if (current === fromIndex) {
    currentLayerIndex.value = toIndex;
  } else if (fromIndex < current && current <= toIndex) {
    currentLayerIndex.value = current - 1;
  } else if (toIndex <= current && current < fromIndex) {
    currentLayerIndex.value = current + 1;
  }
};

// Get preview gradient for a layer
const getLayerPreview = (layer) => {
  if (!layer || !layer.colorStops || layer.colorStops.length === 0) {
    return { background: 'linear-gradient(90deg, #e5e7eb, #e5e7eb)' };
  }
  
  const stops = layer.colorStops
    .map((stop) => {
      const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
      return `${color} ${stop.position}%`;
    })
    .join(', ');
  
  let gradient = '';
  switch (layer.type) {
    case 'linear':
      gradient = `linear-gradient(${layer.linearAngle}deg, ${stops})`;
      break;
    case 'radial':
      gradient = `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
      break;
    case 'conic':
      gradient = `conic-gradient(from ${layer.conicAngle}deg at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
      break;
    default:
      gradient = `linear-gradient(90deg, ${stops})`;
  }
  
  return { background: gradient };
};

const addColorStop = () => {
  const newPosition = colorStops.value.length > 0
    ? Math.min(100, Math.max(0, colorStops.value[colorStops.value.length - 1].position + 10))
    : 50;
  
  // Generate a color between the last two stops if possible
  let newColor = '#6366f1';
  if (colorStops.value.length >= 2) {
    const last = colorStops.value[colorStops.value.length - 1];
    const secondLast = colorStops.value[colorStops.value.length - 2];
    newColor = interpolateColor(secondLast.color, last.color, 0.5);
  } else if (colorStops.value.length === 1) {
    newColor = colorStops.value[0].color;
  }

  colorStops.value.push({
    id: Date.now(),
    color: newColor,
    position: newPosition,
    opacity: 100,
  });
  updateGradient();
};

const removeColorStop = (index) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1);
    updateGradient();
  }
};

const formattedExportCode = computed(() => {
  const gradient = cssGradientWithBlend.value;
  const blendModes = cssBlendModes.value;
  const multiLayer = layers.value.filter((layer) => layer.enabled).length > 1;
  
  switch (exportFormat.value) {
    case 'css':
      if (multiLayer) {
        return `background-image: ${gradient};\nbackground-blend-mode: ${blendModes};`;
      }
      return `background: ${gradient};\nbackground-image: ${gradient};`;
      
    case 'css-vars':
      return `:root {\n  --gradient-primary: ${gradient};\n${multiLayer ? `  --gradient-blend-mode: ${blendModes};\n` : ''}}\n\n.my-element {\n  background-image: var(--gradient-primary);${multiLayer ? '\n  background-blend-mode: var(--gradient-blend-mode);' : ''}\n}`;
      
    case 'tailwind':
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-primary': '${gradient}',\n      },\n    },\n  },\n}`;
      
    case 'scss':
      return `$gradient-primary: ${gradient};\n\n.my-element {\n  background-image: $gradient-primary;\n}`;
      
    case 'json':
      return JSON.stringify({
        layers: layers.value,
        css: gradient,
        blendMode: multiLayer ? blendModes : undefined,
        animation: animationEnabled.value ? {
          type: animationType.value,
          duration: animationDuration.value,
          direction: animationDirection.value,
          iterationCount: animationIterationCount.value,
        } : undefined,
      }, null, 2);
      
    case 'react':
      return `import styled from 'styled-components';\n\nconst GradientComponent = styled.div\`\n  background-image: ${gradient};\n${multiLayer ? `  background-blend-mode: ${blendModes};\n` : ''}\`;`;
      
    case 'vue':
      // Vue component code - using style binding
      return `const gradient = '${gradient}';\n${multiLayer ? `const blendMode = '${blendModes}';\n` : ''}\n// Use in template:\n// <div :style="{ backgroundImage: gradient${multiLayer ? ', backgroundBlendMode: blendMode' : ''} }">Your content</div>`;
      
    default:
      return gradient;
  }
});

const copyFormattedCode = async () => {
  try {
    await navigator.clipboard.writeText(formattedExportCode.value);
    showExportNotice(`${exportFormat.value.toUpperCase()} code copied to clipboard.`, 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showExportNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
  }
};

// Trigger a download, revoking the object URL once the click has been handled.
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Parse a CSS position component ("50%", "120px", "center", "left"...) into pixels.
const parsePosition = (value, size, axis) => {
  const v = String(value ?? '').trim().toLowerCase();
  const keywords = axis === 'x'
    ? { left: 0, center: 50, right: 100 }
    : { top: 0, center: 50, bottom: 100 };
  if (v in keywords) return (keywords[v] / 100) * size;
  const num = parseFloat(v);
  if (!Number.isFinite(num)) return size / 2;
  return v.endsWith('px') ? num : (num / 100) * size;
};

// Start/end points of a CSS linear-gradient(<angle>deg) line inside a w x h box.
// CSS angles: 0deg points up, 90deg right; the line is long enough that the
// corners land exactly on 0% and 100%.
const linearGradientLine = (angleDeg, w, h) => {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  return { x1: cx - dx * half, y1: cy - dy * half, x2: cx + dx * half, y2: cy + dy * half };
};

// Radii of a CSS radial-gradient ending shape centred at (x, y) in a w x h box.
const radialRadii = (shape, size, x, y, w, h) => {
  const sideX = { closest: Math.min(x, w - x), farthest: Math.max(x, w - x) };
  const sideY = { closest: Math.min(y, h - y), farthest: Math.max(y, h - y) };
  const which = size.startsWith('closest') ? 'closest' : 'farthest';
  if (shape === 'circle') {
    if (size.endsWith('side')) {
      const r = which === 'closest'
        ? Math.min(sideX.closest, sideY.closest)
        : Math.max(sideX.farthest, sideY.farthest);
      return { rx: r, ry: r };
    }
    const r = Math.hypot(sideX[which], sideY[which]);
    return { rx: r, ry: r };
  }
  // Ellipse: the "-side" ellipse touches the sides; the "-corner" one keeps that
  // aspect ratio and passes through the corner (a factor of sqrt(2)).
  const factor = size.endsWith('corner') ? Math.SQRT2 : 1;
  return { rx: sideX[which] * factor, ry: sideY[which] * factor };
};

const stopColor = (stop) => hexToRgba(stop.color, stop.opacity ?? 100);
const sortedStops = (layer) => [...layer.colorStops].sort((a, b) => a.position - b.position);
const clampOffset = (position) => Math.min(1, Math.max(0, (Number(position) || 0) / 100));

// Canvas composite operations share their names with CSS blend modes.
const canvasBlendMode = (mode) => (!mode || mode === 'normal' ? 'source-over' : mode);

const exportAsImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    showExportNotice('Your browser could not create the image.', 'error');
    return;
  }
  const w = canvas.width;
  const h = canvas.height;

  // CSS paints the first background layer on top, so draw from the last one up.
  const enabled = layers.value.filter((layer) => layer.enabled).reverse();
  if (enabled.length === 0) {
    showExportNotice('Enable at least one layer to export.', 'warning');
    return;
  }

  enabled.forEach((layer, i) => {
    // Canvas gradients are resolved in the coordinate space active at fill time.
    ctx.save();
    ctx.globalCompositeOperation = i === 0 ? 'source-over' : canvasBlendMode(layer.blendMode);
    let gradient;
    let fill = () => ctx.fillRect(0, 0, w, h);
    if (layer.type === 'radial') {
      const x = parsePosition(layer.radialPosition.x, w, 'x');
      const y = parsePosition(layer.radialPosition.y, h, 'y');
      const { rx, ry } = radialRadii(layer.radialShape, layer.radialSize, x, y, w, h);
      const r = Math.max(rx, 1);
      const sy = Math.max(ry, 1) / r;
      // A circle gradient at the origin, squashed vertically into the ellipse.
      ctx.translate(x, y);
      ctx.scale(1, sy);
      gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      fill = () => ctx.fillRect(-x, -y / sy, w, h / sy);
    } else if (layer.type === 'conic' && typeof ctx.createConicGradient === 'function') {
      const x = parsePosition(layer.conicPosition.x, w, 'x');
      const y = parsePosition(layer.conicPosition.y, h, 'y');
      // CSS conic 0deg is "up"; canvas 0 rad is "right".
      gradient = ctx.createConicGradient(((layer.conicAngle - 90) * Math.PI) / 180, x, y);
    } else {
      const angle = layer.type === 'linear' ? layer.linearAngle : 90;
      const { x1, y1, x2, y2 } = linearGradientLine(angle, w, h);
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    sortedStops(layer).forEach((stop) => {
      gradient.addColorStop(clampOffset(stop.position), stopColor(stop));
    });

    ctx.fillStyle = gradient;
    fill();
    ctx.restore();
  });

  canvas.toBlob((blob) => {
    if (!blob) {
      showExportNotice('Could not create the PNG.', 'error');
      return;
    }
    downloadBlob(blob, 'gradient.png');
  }, 'image/png');
};

const exportAsSVG = () => {
  // Build SVG using DOM methods so every attribute value is escaped.
  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 800;
  const h = 600;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const defs = document.createElementNS(svgNS, 'defs');
  svg.appendChild(defs);

  const enabled = layers.value.filter((layer) => layer.enabled).reverse();
  if (enabled.length === 0) {
    showExportNotice('Enable at least one layer to export.', 'warning');
    return;
  }
  let approximated = false;

  enabled.forEach((layer, i) => {
    const id = `grad-${i}`;
    let gradient;
    if (layer.type === 'radial') {
      const x = parsePosition(layer.radialPosition.x, w, 'x');
      const y = parsePosition(layer.radialPosition.y, h, 'y');
      const { rx, ry } = radialRadii(layer.radialShape, layer.radialSize, x, y, w, h);
      const r = Math.max(rx, 1);
      gradient = document.createElementNS(svgNS, 'radialGradient');
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('cx', '0');
      gradient.setAttribute('cy', '0');
      gradient.setAttribute('r', String(r));
      gradient.setAttribute('gradientTransform', `translate(${x} ${y}) scale(1 ${Math.max(ry, 1) / r})`);
    } else {
      // SVG has no conic gradient; a conic layer is approximated as linear.
      if (layer.type === 'conic') approximated = true;
      const angle = layer.type === 'linear' ? layer.linearAngle : (layer.conicAngle ?? 0) + 90;
      const { x1, y1, x2, y2 } = linearGradientLine(angle, w, h);
      gradient = document.createElementNS(svgNS, 'linearGradient');
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('x1', String(x1));
      gradient.setAttribute('y1', String(y1));
      gradient.setAttribute('x2', String(x2));
      gradient.setAttribute('y2', String(y2));
    }
    gradient.setAttribute('id', id);

    sortedStops(layer).forEach((stop) => {
      const stopEl = document.createElementNS(svgNS, 'stop');
      stopEl.setAttribute('offset', String(clampOffset(stop.position)));
      stopEl.setAttribute('stop-color', stop.color);
      if (stop.opacity !== 100) {
        stopEl.setAttribute('stop-opacity', String((stop.opacity ?? 100) / 100));
      }
      gradient.appendChild(stopEl);
    });
    defs.appendChild(gradient);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', String(h));
    rect.setAttribute('fill', `url(#${id})`);
    if (i > 0 && layer.blendMode && layer.blendMode !== 'normal') {
      rect.setAttribute('style', `mix-blend-mode: ${layer.blendMode}`);
    }
    svg.appendChild(rect);
  });

  const svgString = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), 'gradient.svg');
  if (approximated) {
    showExportNotice('SVG has no conic gradients, so conic layers were exported as linear.', 'warning');
  }
};

// Color interpolation helper
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const interpolateColor = (color1, color2, factor) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  return rgbToHex(r, g, b);
};

// Calculate contrast ratio for accessibility
const calculateLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Sample color at a specific position in the gradient
const sampleGradientColor = (position) => {
  const currentLayer = layers.value[currentLayerIndex.value];
  if (!currentLayer || !currentLayer.colorStops || currentLayer.colorStops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  
  const layerStops = currentLayer.colorStops;
  if (layerStops.length === 1) return hexToRgb(layerStops[0].color);
  
  // Find the two stops that bracket this position
  const sortedStops = [...layerStops].sort((a, b) => a.position - b.position);
  
  if (position <= sortedStops[0].position) {
    return hexToRgb(sortedStops[0].color);
  }
  if (position >= sortedStops[sortedStops.length - 1].position) {
    return hexToRgb(sortedStops[sortedStops.length - 1].color);
  }
  
  // Find the two stops that bracket this position
  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
      const stop1 = sortedStops[i];
      const stop2 = sortedStops[i + 1];
      const range = stop2.position - stop1.position;
      const factor = range > 0 ? (position - stop1.position) / range : 0;
      
      const rgb1 = hexToRgb(stop1.color);
      const rgb2 = hexToRgb(stop2.color);
      
      // Interpolate between the two colors
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
      
      return { r, g, b };
    }
  }
  
  return hexToRgb(sortedStops[0].color);
};

const contrastRatio = computed(() => {
  const textRgb = hexToRgb(accessibilityTextColor.value);
  const textLuminance = calculateLuminance(textRgb);
  
  // Sample multiple points across the gradient (at 0%, 25%, 50%, 75%, 100%)
  const samplePositions = [0, 25, 50, 75, 100];
  const sampleLuminances = samplePositions.map(pos => {
    const gradientRgb = sampleGradientColor(pos);
    return calculateLuminance(gradientRgb);
  });
  
  // Calculate average luminance
  const avgGradientLuminance = sampleLuminances.reduce((sum, lum) => sum + lum, 0) / sampleLuminances.length;
  
  // Use the worst case contrast ratio for accessibility
  const contrastRatios = sampleLuminances.map(lum => {
    const lighter = Math.max(textLuminance, lum);
    const darker = Math.min(textLuminance, lum);
    return (lighter + 0.05) / (darker + 0.05);
  });
  
  // Return the minimum contrast ratio (worst case)
  return Math.min(...contrastRatios);
});

// Turn an API error into a message for the palette panel.
const paletteErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (status === 404) return 'That palette no longer exists.';
  if (status === 503) return 'Palette storage is unavailable right now. Try again in a moment.';
  if (status === 401 || status === 403) return 'You are not authorised to load palettes. Check your API key.';
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  return error.response.data?.message || fallback;
};

// Fetch palettes from backend (first page; the API caps pageSize at 200)
const fetchPalettes = async () => {
  loadingPalettes.value = true;
  try {
    const response = await apiClient.get('/api/palettes', { params: { page: 1, pageSize: 200 } });
    const data = response.data;
    availablePalettes.value = Array.isArray(data) ? data : (data?.items ?? []);
    if (availablePalettes.value.length === 0) {
      showPaletteNotice('No saved palettes yet. Save one in Palette Builder first.', 'info');
    } else {
      clearPaletteNotice();
    }
  } catch (error) {
    console.error('Error fetching palettes:', error);
    showPaletteNotice(paletteErrorMessage(error, 'Error loading palettes.'), 'error');
  } finally {
    loadingPalettes.value = false;
  }
};

// Import colors from selected palette
const importPaletteColors = async () => {
  if (!selectedPaletteId.value) return;

  try {
    const response = await apiClient.get(`/api/palettes/${encodeURIComponent(selectedPaletteId.value)}`);
    const palette = response.data || {};
    const colors = (palette.colors || [])
      .map((c) => (typeof c === 'string' ? c : c?.hex))
      .filter((c) => typeof c === 'string' && /^#?[0-9a-f]{6}$/i.test(c))
      .map((c) => (c.startsWith('#') ? c : `#${c}`));

    if (colors.length === 0) {
      showPaletteNotice('That palette has no colors to import.', 'warning');
      return;
    }

    // A single color still needs two stops to form a gradient.
    const source = colors.length === 1 ? [colors[0], colors[0]] : colors;
    const step = 100 / (source.length - 1);
    const now = Date.now();
    colorStops.value = source.map((color, index) => ({
      id: now + index,
      color,
      position: Math.round(index * step * 100) / 100,
      opacity: 100,
    }));

    updateGradient();
    showPaletteNotice(`Imported ${colors.length} colors from ${palette.name || 'the palette'}.`, 'success');
  } catch (error) {
    console.error('Error importing palette:', error);
    showPaletteNotice(paletteErrorMessage(error, 'Error importing palette colors.'), 'error');
    if (error?.response?.status === 404) {
      availablePalettes.value = availablePalettes.value.filter((p) => p.id !== selectedPaletteId.value);
      selectedPaletteId.value = '';
    }
  }
};

// Export to Adobe XD (CSS format compatible with Adobe XD)
const exportToAdobe = () => {
  const gradientData = {
    css: cssGradient.value,
    type: gradientType.value,
    stops: colorStops.value.map((stop) => ({
      color: stop.color,
      position: stop.position,
      opacity: stop.opacity / 100,
    })),
    settings: {
      angle: gradientType.value === 'linear' ? linearAngle.value : undefined,
      position: gradientType.value === 'radial' ? radialPosition.value : undefined,
      shape: gradientType.value === 'radial' ? radialShape.value : undefined,
      size: gradientType.value === 'radial' ? radialSize.value : undefined,
    },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'gradient-adobe.json');
};

// Export to Penpot (Penpot JSON format)
const exportToPenpot = () => {
  const gradientData = {
    type: 'gradient',
    gradientType: gradientType.value === 'linear' ? 'linear' : gradientType.value === 'radial' ? 'radial' : 'linear',
    stops: colorStops.value.map((stop) => ({
      offset: stop.position / 100,
      color: {
        r: hexToRgb(stop.color).r / 255,
        g: hexToRgb(stop.color).g / 255,
        b: hexToRgb(stop.color).b / 255,
        a: stop.opacity / 100,
      },
    })),
    transform: gradientType.value === 'linear' 
      ? {
          sx: Math.cos(linearAngle.value * Math.PI / 180),
          sy: Math.sin(linearAngle.value * Math.PI / 180),
          tx: 0,
          ty: 0,
        }
      : {
          sx: 1,
          sy: 1,
          tx: 0,
          ty: 0,
        },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'gradient-penpot.json');
};

const handleDragStart = (index, event) => {
  draggedIndex.value = index;
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(index));
};

const handleDragOver = (index, event) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (index, event) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) {
    isDragging.value = false;
    return;
  }
  
  const draggedStop = colorStops.value[draggedIndex.value];
  colorStops.value.splice(draggedIndex.value, 1);
  colorStops.value.splice(index, 0, draggedStop);
  
  updateGradient();
  isDragging.value = false;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  isDragging.value = false;
};

const openColorPicker = (index, event) => {
  event.stopPropagation();
  pickerColorIndex.value = index;
  pickerColor.value = colorStops.value[index].color;
  
  // Calculate position near the color swatch button
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (pickerColorIndex.value === 'accessibility') {
    accessibilityTextColor.value = color;
  } else if (pickerColorIndex.value !== null) {
    colorStops.value[pickerColorIndex.value].color = color;
    updateGradient();
  }
  showColorPicker.value = false;
  pickerColorIndex.value = null;
};

const openAccessibilityColorPicker = (event) => {
  event.stopPropagation();
  pickerColorIndex.value = 'accessibility';
  pickerColor.value = accessibilityTextColor.value;
  
  // Calculate position near the color swatch button
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

onMounted(() => {
  syncCurrentLayer();
  updateGradient();
});
</script>

<style scoped>
/* Scoped styles for component */
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

<style>
/* Global keyframes for animations */
@keyframes gradient-angle {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-position {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gradient-color {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

/* Ensure animations work properly */
.animate-gradient {
  animation-play-state: running !important;
}
</style>
