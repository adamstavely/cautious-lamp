<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
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
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-indigo-600 dark:text-indigo-400">preview</span>
                Preview
              </h2>
              <div v-if="animationEnabled" class="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
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
              <div class="bg-white dark:bg-slate-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">White</p>
              </div>
              <div class="bg-gray-900 dark:bg-slate-900 rounded p-2 border border-gray-200 dark:border-gray-600">
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center text-white">Dark</p>
              </div>
              <div class="bg-gray-200 dark:bg-slate-600 rounded p-2 border border-gray-200 dark:border-gray-600">
                <div class="h-16 rounded" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes }"></div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">Gray</p>
              </div>
            </div>

            <!-- Accessibility Check -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accessibility Check</label>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600 dark:text-gray-400">Text Color:</label>
                  <button
                    @click="openAccessibilityColorPicker($event)"
                    class="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex-shrink-0"
                    :style="{ backgroundColor: accessibilityTextColor }"
                    title="Pick text color"
                  ></button>
                  <input
                    v-model="accessibilityTextColor"
                    type="text"
                    class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="#000000"
                  />
                </div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="font-semibold text-gray-700 dark:text-gray-300">Ratio:</span>
                  <span :class="contrastRatio >= 4.5 ? 'text-green-600 dark:text-green-400 font-semibold' : contrastRatio >= 3 ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'">
                    {{ contrastRatio.toFixed(2) }}:1
                  </span>
                  <span :class="contrastRatio >= 4.5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ contrastRatio >= 4.5 ? '✓ AA' : '✗ AA' }}
                  </span>
                  <span :class="contrastRatio >= 7 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ contrastRatio >= 7 ? '✓ AAA' : '✗ AAA' }}
                  </span>
                </div>
                <div class="flex-1 p-2 rounded border-2 border-gray-200 dark:border-gray-600" :style="{ backgroundImage: cssGradientWithBlend, backgroundBlendMode: cssBlendModes, borderColor: accessibilityTextColor }">
                  <p class="text-sm font-semibold text-center" :style="{ color: accessibilityTextColor }">
                    Sample
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Color Stops -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-indigo-600 dark:text-indigo-400">palette</span>
                Color Stops
              </h2>
              <div class="flex items-center gap-2">
                <button
                  @click="fetchPalettes"
                  class="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                >
                  Load from Palette Builder
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

            <!-- Palette Selector -->
            <div v-if="availablePalettes.length > 0" class="mb-4 space-y-2">
              <select
                v-model="selectedPaletteId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
                class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-slate-700/50"
                :class="{ 'cursor-move': !isDragging, 'cursor-grabbing': isDragging }"
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
                  <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">drag_indicator</span>
                </div>

                <!-- Color Swatch Button -->
                <button
                  @click="openColorPicker(index, $event)"
                  class="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex-shrink-0"
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
                  class="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono flex-shrink-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  @mousedown.stop
                  @click.stop
                />
                
                <!-- Position Slider -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-gray-600 dark:text-gray-400 w-12">Position</span>
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
                      class="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm flex-shrink-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400 w-8">%</span>
                  </div>
                  <!-- Opacity Slider -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400 w-12">Opacity</span>
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
                      class="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm flex-shrink-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400 w-8">%</span>
                  </div>
                </div>

                <!-- Remove Button -->
                <button
                  v-if="colorStops.length > 2"
                  @click="removeColorStop(index)"
                  class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
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
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-xl text-indigo-600 dark:text-indigo-400">settings</span>
                  Settings
                </h2>
                <p v-if="layers.length > 1" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Editing: <span class="font-medium text-indigo-600 dark:text-indigo-400">Layer {{ currentLayerIndex + 1 }}</span>
                </p>
              </div>
              <button
                @click="showExportModal = true"
                class="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                title="Export gradient"
              >
                <span class="material-symbols-outlined text-xl">download</span>
                <span class="text-sm font-medium">Export</span>
              </button>
            </div>

            <!-- Layers Management -->
            <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">layers</span>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Layers</label>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Stack multiple gradients with blend modes</p>
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
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-slate-700'"
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
                        class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                        :style="getLayerPreview(layer)"
                        title="Layer preview"
                      ></div>
                      <!-- Layer Info -->
                      <div class="flex-1 min-w-0">
                        <button
                          @click="currentLayerIndex = index"
                          class="text-left text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full"
                        >
                          Layer {{ index + 1 }}
                        </button>
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                          class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded transition-colors"
                          title="Move up"
                        >
                          <span class="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          v-if="index < layers.length - 1"
                          @click="moveLayer(index, index + 1)"
                          class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded transition-colors"
                          title="Move down"
                        >
                          <span class="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          v-if="layers.length > 1"
                          @click="removeLayer(index)"
                          class="p-1 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title="Delete layer"
                        >
                          <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Active Layer Indicator -->
                  <div v-if="currentLayerIndex === index" class="absolute top-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-indigo-500 dark:border-t-indigo-400 rounded-tr-lg"></div>
                  <div v-if="currentLayerIndex === index" class="absolute top-0.5 right-0.5">
                    <span class="material-symbols-outlined text-white text-xs">edit</span>
                  </div>
                </div>
              </div>
              <div v-if="layers.length > 1" class="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p class="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                  <span class="material-symbols-outlined text-sm mt-0.5">info</span>
                  <span>Layers are stacked from bottom (Layer 1) to top. Click a layer to edit it. Use blend modes to combine layers.</span>
                </p>
              </div>
            </div>

            <!-- Current Layer Settings -->
            <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-lg text-indigo-600 dark:text-indigo-400">tune</span>
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">Current Layer Settings</h3>
              </div>
              
              <!-- Gradient Type -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gradient Type</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="type in gradientTypes"
                    :key="type.value"
                    @click="gradientType = type.value"
                    class="px-4 py-2 rounded-lg border-2 transition-all"
                    :class="gradientType === type.value
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700'"
                  >
                    {{ type.label }}
                  </button>
                </div>
              </div>

              <!-- Linear Gradient Settings -->
              <div v-if="gradientType === 'linear'" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Angle</label>
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
                      class="w-14 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    <span class="text-base text-gray-600 dark:text-gray-400">°</span>
                  </div>
                </div>
                <div class="mt-2 grid grid-cols-3 gap-2">
                  <button
                    v-for="direction in linearDirections"
                    :key="direction.value"
                    @click="linearAngle = direction.angle"
                    class="px-3 py-1 text-xs rounded-lg border-2 transition-all"
                    :class="linearAngle === direction.angle
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700'"
                  >
                    {{ direction.label }}
                  </button>
                </div>
              </div>

              <!-- Radial Gradient Settings -->
              <div v-if="gradientType === 'radial'" class="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position X</label>
                  <input
                    v-model="radialPosition.x"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position Y</label>
                  <input
                    v-model="radialPosition.y"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shape</label>
                  <select
                    v-model="radialShape"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="ellipse">Ellipse</option>
                    <option value="circle">Circle</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</label>
                  <select
                    v-model="radialSize"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position X</label>
                  <input
                    v-model="conicPosition.x"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position Y</label>
                  <input
                    v-model="conicPosition.y"
                    type="text"
                    placeholder="50%"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Angle</label>
                  <input
                    v-model.number="conicAngle"
                    type="number"
                    min="0"
                    max="360"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <!-- Blend Mode -->
              <div class="mb-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blend Mode</label>
                <select
                  v-model="blendMode"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">How this layer blends with layers below</p>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

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
watch([gradientType, linearAngle, radialPosition, radialShape, radialSize, conicPosition, conicAngle, blendMode], () => {
  updateCurrentLayer();
});

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
  
  // Debug: log when animation is enabled
  if (animationEnabled.value) {
    console.log('Animation style:', style);
    console.log('Animation type:', animationType.value);
    console.log('Duration:', animationDuration.value);
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
    if (currentLayerIndex.value >= layers.value.length) {
      currentLayerIndex.value = layers.value.length - 1;
    }
    syncCurrentLayer();
  }
};

const moveLayer = (fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  
  const layer = layers.value.splice(fromIndex, 1)[0];
  layers.value.splice(toIndex, 0, layer);
  
  // Update current layer index
  if (currentLayerIndex.value === fromIndex) {
    currentLayerIndex.value = toIndex;
  } else if (currentLayerIndex.value === toIndex) {
    currentLayerIndex.value = fromIndex;
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
  
  switch (exportFormat.value) {
    case 'css':
      if (layers.value.length > 1) {
        return `background-image: ${gradient};\nbackground-blend-mode: ${blendModes};`;
      }
      return `background: ${gradient};\nbackground-image: ${gradient};`;
      
    case 'css-vars':
      return `:root {\n  --gradient-primary: ${gradient};\n${layers.value.length > 1 ? `  --gradient-blend-mode: ${blendModes};\n` : ''}}\n\n.my-element {\n  background-image: var(--gradient-primary);${layers.value.length > 1 ? '\n  background-blend-mode: var(--gradient-blend-mode);' : ''}\n}`;
      
    case 'tailwind':
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-primary': '${gradient}',\n      },\n    },\n  },\n}`;
      
    case 'scss':
      return `$gradient-primary: ${gradient};\n\n.my-element {\n  background-image: $gradient-primary;\n}`;
      
    case 'json':
      return JSON.stringify({
        layers: layers.value,
        css: gradient,
        blendMode: layers.value.length > 1 ? blendModes : undefined,
        animation: animationEnabled.value ? {
          type: animationType.value,
          duration: animationDuration.value,
          direction: animationDirection.value,
          iterationCount: animationIterationCount.value,
        } : undefined,
      }, null, 2);
      
    case 'react':
      return `import styled from 'styled-components';\n\nconst GradientComponent = styled.div\`\n  background-image: ${gradient};\n${layers.value.length > 1 ? `  background-blend-mode: ${blendModes};\n` : ''}\`;`;
      
    case 'vue':
      // Vue component code - using style binding
      return `const gradient = '${gradient}';\n${layers.value.length > 1 ? `const blendMode = '${blendModes}';\n` : ''}\n// Use in template:\n// <div :style="{ backgroundImage: gradient${layers.value.length > 1 ? ', backgroundBlendMode: blendMode' : ''} }">Your content</div>`;
      
    default:
      return gradient;
  }
});

const copyFormattedCode = async () => {
  try {
    await navigator.clipboard.writeText(formattedExportCode.value);
    alert(`${exportFormat.value.toUpperCase()} code copied to clipboard!`);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const exportAsImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  let gradient;
  if (gradientType.value === 'linear') {
    const radians = (linearAngle.value * Math.PI) / 180;
    const x1 = canvas.width / 2 - (canvas.width / 2) * Math.cos(radians + Math.PI);
    const y1 = canvas.height / 2 - (canvas.height / 2) * Math.sin(radians + Math.PI);
    const x2 = canvas.width / 2 + (canvas.width / 2) * Math.cos(radians + Math.PI);
    const y2 = canvas.height / 2 + (canvas.height / 2) * Math.sin(radians + Math.PI);
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else if (gradientType.value === 'radial') {
    const x = parseFloat(radialPosition.value.x.replace('%', '')) * canvas.width / 100;
    const y = parseFloat(radialPosition.value.y.replace('%', '')) * canvas.height / 100;
    const radius = Math.max(canvas.width, canvas.height) / 2;
    gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  } else {
    // Conic gradients are not directly supported in canvas, use linear as fallback
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  }
  
  colorStops.value.forEach((stop) => {
    const rgb = hexToRgb(stop.color);
    gradient.addColorStop(stop.position / 100, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

const exportAsSVG = () => {
  // Build SVG using DOM methods to avoid Vue parser issues
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  
  const defs = document.createElementNS(svgNS, 'defs');
  
  let gradient;
  if (gradientType.value === 'linear') {
    gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'grad');
    const radians = (linearAngle.value * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians + Math.PI);
    const y1 = 50 - 50 * Math.sin(radians + Math.PI);
    const x2 = 50 + 50 * Math.cos(radians + Math.PI);
    const y2 = 50 + 50 * Math.sin(radians + Math.PI);
    gradient.setAttribute('x1', x1 + '%');
    gradient.setAttribute('y1', y1 + '%');
    gradient.setAttribute('x2', x2 + '%');
    gradient.setAttribute('y2', y2 + '%');
  } else if (gradientType.value === 'radial') {
    gradient = document.createElementNS(svgNS, 'radialGradient');
    gradient.setAttribute('id', 'grad');
    gradient.setAttribute('cx', radialPosition.value.x);
    gradient.setAttribute('cy', radialPosition.value.y);
  } else {
    gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'grad');
  }
  
  colorStops.value.forEach((stop) => {
    const stopEl = document.createElementNS(svgNS, 'stop');
    stopEl.setAttribute('offset', stop.position + '%');
    stopEl.setAttribute('stop-color', stop.color);
    if (stop.opacity !== 100) {
      stopEl.setAttribute('stop-opacity', (stop.opacity / 100).toString());
    }
    gradient.appendChild(stopEl);
  });
  
  defs.appendChild(gradient);
  svg.appendChild(defs);
  
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '800');
  rect.setAttribute('height', '600');
  rect.setAttribute('fill', 'url(#grad)');
  svg.appendChild(rect);
  
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient.svg';
  a.click();
  URL.revokeObjectURL(url);
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

// Fetch palettes from backend
const fetchPalettes = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/palettes');
    availablePalettes.value = response.data || [];
  } catch (error) {
    console.error('Error fetching palettes:', error);
    alert('Error loading palettes. Make sure you have saved palettes in Palette Builder.');
  }
};

// Import colors from selected palette
const importPaletteColors = async () => {
  if (!selectedPaletteId.value) return;
  
  try {
    const response = await axios.get(`http://localhost:3000/api/palettes/${selectedPaletteId.value}`);
    const palette = response.data;
    
    if (palette.colors && palette.colors.length > 0) {
      const colors = palette.colors.map((c) => c.hex || c);
      const step = 100 / (colors.length - 1);
      
      colorStops.value = colors.map((color, index) => ({
        id: Date.now() + index,
        color: typeof color === 'string' ? color : color.hex,
        position: index * step,
        opacity: 100,
      }));
      
      updateGradient();
      alert(`Imported ${colors.length} colors from ${palette.name}`);
    }
  } catch (error) {
    console.error('Error importing palette:', error);
    alert('Error importing palette colors');
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
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient-adobe.json';
  a.click();
  URL.revokeObjectURL(url);
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
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient-penpot.json';
  a.click();
  URL.revokeObjectURL(url);
};

const handleDragStart = (index, event) => {
  draggedIndex.value = index;
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target);
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
