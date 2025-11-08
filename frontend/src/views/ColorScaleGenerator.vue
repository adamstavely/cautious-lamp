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
                      Color Scale Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate accessible color scales with precise contrast control. Create sequential, diverging, and qualitative scales that meet WCAG accessibility standards.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">palette</span>
                      Color Tool
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
                        <linearGradient id="scaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized scale icon -->
                      <rect x="20" y="40" width="160" height="20" rx="4" fill="url(#scaleGradient)" opacity="0.3"/>
                      <rect x="20" y="70" width="160" height="20" rx="4" fill="url(#scaleGradient)" opacity="0.5"/>
                      <rect x="20" y="100" width="160" height="20" rx="4" fill="url(#scaleGradient)" opacity="0.7"/>
                      <rect x="20" y="130" width="160" height="20" rx="4" fill="url(#scaleGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-3 gap-6">
              <!-- Left Column: Controls and Visualizations -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Combined Scale Type, Base Colors, Settings, and Preview -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <!-- Scale Type Section -->
                  <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">tune</span>
                      Scale Type
                    </h2>
                    <div class="grid grid-cols-3 gap-3">
                      <button
                        v-for="type in scaleTypes"
                        :key="type.value"
                        @click="scaleType = type.value; generateScale()"
                        class="px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium"
                        :class="scaleType === type.value
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

                  <!-- Divider -->
                  <div class="border-t mb-6" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"></div>

                  <!-- Base Colors Section -->
                  <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                      Base Colors
                    </h2>
                    
                    <!-- Sequential Scale -->
                    <div v-if="scaleType === 'sequential'" class="space-y-4">
                      <div
                        v-for="(color, index) in sequentialColors"
                        :key="index"
                        class="space-y-2"
                      >
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            Color {{ index + 1 }}
                          </label>
                          <button
                            v-if="sequentialColors.length > 1"
                            @click="removeSequentialColor(index)"
                            class="text-red-500 hover:text-red-600 transition-colors"
                            title="Remove color"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <div class="flex items-center gap-3">
                          <button
                            @click="openColorPicker(`sequential-${index}`, $event)"
                            class="w-16 h-16 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                            :class="isDarkMode 
                              ? 'border-gray-600 hover:border-indigo-400' 
                              : 'border-gray-300 hover:border-indigo-500'"
                            :style="{ backgroundColor: color }"
                            title="Pick color"
                          ></button>
                          <input
                            v-model="sequentialColors[index]"
                            type="text"
                            @input="generateScale"
                            placeholder="#000000"
                            class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                            :class="isDarkMode 
                              ? 'border-gray-600 bg-slate-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'"
                          />
                        </div>
                      </div>
                      <button
                        @click="addSequentialColor"
                        class="w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium"
                        :class="isDarkMode 
                          ? 'border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-300' 
                          : 'border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm align-middle mr-2">add</span>
                        Add Color
                      </button>
                    </div>

                    <!-- Diverging Scale -->
                    <div v-if="scaleType === 'diverging'" class="space-y-4">
                      <div
                        v-for="(color, index) in divergingColors"
                        :key="index"
                        class="space-y-2"
                      >
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            Color {{ index + 1 }}
                          </label>
                          <button
                            v-if="divergingColors.length > 1"
                            @click="removeDivergingColor(index)"
                            class="text-red-500 hover:text-red-600 transition-colors"
                            title="Remove color"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <div class="flex items-center gap-3">
                          <button
                            @click="openColorPicker(`diverging-${index}`, $event)"
                            class="w-16 h-16 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                            :class="isDarkMode 
                              ? 'border-gray-600 hover:border-indigo-400' 
                              : 'border-gray-300 hover:border-indigo-500'"
                            :style="{ backgroundColor: color }"
                            title="Pick color"
                          ></button>
                          <input
                            v-model="divergingColors[index]"
                            type="text"
                            @input="generateScale"
                            placeholder="#000000"
                            class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                            :class="isDarkMode 
                              ? 'border-gray-600 bg-slate-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'"
                          />
                        </div>
                      </div>
                      <button
                        @click="addDivergingColor"
                        class="w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium"
                        :class="isDarkMode 
                          ? 'border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-300' 
                          : 'border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm align-middle mr-2">add</span>
                        Add Color
                      </button>
                    </div>

                    <!-- Qualitative Scale -->
                    <div v-if="scaleType === 'qualitative'" class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Base Colors (comma-separated)</label>
                        <textarea
                          v-model="qualitativeColorsInput"
                          @input="updateQualitativeColors"
                          rows="3"
                          placeholder="#ff0000, #00ff00, #0000ff"
                          class="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        ></textarea>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Enter colors separated by commas</p>
                      </div>
                    </div>
                  </div>

                  <!-- Divider -->
                  <div class="border-t mb-6" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"></div>

                  <!-- Settings Section -->
                  <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">settings</span>
                      Settings
                    </h2>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Number of Steps</label>
                        <input
                          v-model.number="settings.steps"
                          type="number"
                          min="3"
                          max="20"
                          @input="generateScale"
                          class="w-full px-3 py-2 border rounded-lg text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Contrast Ratio</label>
                        <Dropdown
                          v-model="settings.contrast"
                          :options="contrastOptions"
                          :is-dark-mode="isDarkMode"
                          @update:modelValue="generateScale"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Brightness</label>
                        <input
                          v-model.number="settings.brightness"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          @input="generateScale"
                          class="w-full"
                        />
                        <div class="text-xs mt-1 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ settings.brightness }}%</div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Saturation</label>
                        <input
                          v-model.number="settings.saturation"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          @input="generateScale"
                          class="w-full"
                        />
                        <div class="text-xs mt-1 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ settings.saturation }}%</div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Background Color</label>
                        <div class="flex items-center gap-3">
                          <button
                            @click="openColorPicker('background', $event)"
                            class="w-16 h-16 rounded cursor-pointer transition-colors flex-shrink-0"
                            :class="[
                              isLightColor(settings.backgroundColor)
                                ? 'border-2 border-gray-400'
                                : (isDarkMode 
                                  ? 'border-2 border-gray-600 hover:border-indigo-400' 
                                  : 'border-2 border-gray-300 hover:border-indigo-500')
                            ]"
                            :style="{ backgroundColor: settings.backgroundColor }"
                            title="Pick background color"
                          ></button>
                          <input
                            v-model="settings.backgroundColor"
                            type="text"
                            @input="generateScale"
                            placeholder="#ffffff"
                            class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                            :class="isDarkMode 
                              ? 'border-gray-600 bg-slate-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'"
                          />
                        </div>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Used for contrast checking</p>
                      </div>
                    </div>
                  </div>

                  <!-- Divider -->
                  <div class="border-t mb-6" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"></div>

                  <!-- Preview Section -->
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">preview</span>
                        Preview
                      </h2>
                      <button
                        @click="previewDarkMode = !previewDarkMode"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        :class="previewDarkMode
                          ? (isDarkMode 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-600 text-white')
                          : (isDarkMode 
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        <span class="material-symbols-outlined text-base">{{ previewDarkMode ? 'dark_mode' : 'light_mode' }}</span>
                        {{ previewDarkMode ? 'Dark' : 'Light' }}
                      </button>
                    </div>
                    
                    <div class="space-y-4">
                      <!-- Scale Swatches -->
                      <div class="rounded-lg overflow-hidden border" :class="previewDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-white'">
                        <div class="flex h-24">
                          <div
                            v-for="(color, index) in generatedScale"
                            :key="index"
                            class="flex-1 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                            :style="{ backgroundColor: color }"
                            @click="copyColor(color)"
                            :title="`${color} - Click to copy`"
                          >
                            <span class="text-xs font-mono px-1 py-0.5 rounded" :class="getTextColor(color)">{{ color }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Color List -->
                      <div class="space-y-2 max-h-48 overflow-y-auto">
                        <div
                          v-for="(color, index) in generatedScale"
                          :key="index"
                          class="flex items-center gap-3 p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          :class="isDarkMode 
                            ? 'border-gray-600 hover:bg-slate-700' 
                            : 'border-gray-200 hover:bg-gray-50'"
                          @click="copyColor(color)"
                        >
                          <div 
                            class="w-8 h-8 rounded border flex-shrink-0"
                            :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                            :style="{ backgroundColor: color }"
                          ></div>
                          <div class="flex-1 min-w-0">
                            <div class="text-sm font-mono" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ color }}</div>
                            <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Step {{ index + 1 }}</div>
                          </div>
                          <button
                            @click.stop="copyColor(color)"
                            class="p-1 rounded transition-colors"
                            :class="isDarkMode 
                              ? 'text-gray-400 hover:text-indigo-400' 
                              : 'text-gray-400 hover:text-indigo-600'"
                            title="Copy color"
                          >
                            <span class="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Colorblindness Simulation Section -->
                  <div v-if="generatedScale.length > 0" class="mt-6 rounded-lg p-6" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">visibility</span>
                      Colorblindness Simulation
                    </h2>
                    <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Simulated colors are ordered by hue and saturation for best comparison of similar colors.
                    </p>
                    
                    <div class="space-y-6">
                      <!-- Protanopia -->
                      <div>
                        <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Protanopia</h3>
                        <div class="flex gap-1">
                          <div
                            v-for="(color, index) in generatedScale"
                            :key="`protanopia-${index}`"
                            class="flex-1 aspect-square rounded relative group"
                            :style="{ backgroundColor: simulateColorBlindness(color, 'protanopia') }"
                            :title="`${color} → ${simulateColorBlindness(color, 'protanopia')}`"
                          >
                            <!-- Small original color indicator -->
                            <div 
                              class="absolute bottom-1 left-1 w-3 h-3 rounded border border-white"
                              :style="{ backgroundColor: color }"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <!-- Deuteranopia -->
                      <div>
                        <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Deuteranopia</h3>
                        <div class="flex gap-1">
                          <div
                            v-for="(color, index) in generatedScale"
                            :key="`deuteranopia-${index}`"
                            class="flex-1 aspect-square rounded relative group"
                            :style="{ backgroundColor: simulateColorBlindness(color, 'deuteranopia') }"
                            :title="`${color} → ${simulateColorBlindness(color, 'deuteranopia')}`"
                          >
                            <!-- Small original color indicator -->
                            <div 
                              class="absolute bottom-1 left-1 w-3 h-3 rounded border border-white"
                              :style="{ backgroundColor: color }"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <!-- Tritanopia -->
                      <div>
                        <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Tritanopia</h3>
                        <div class="flex gap-1">
                          <div
                            v-for="(color, index) in generatedScale"
                            :key="`tritanopia-${index}`"
                            class="flex-1 aspect-square rounded relative group"
                            :style="{ backgroundColor: simulateColorBlindness(color, 'tritanopia') }"
                            :title="`${color} → ${simulateColorBlindness(color, 'tritanopia')}`"
                          >
                            <!-- Small original color indicator -->
                            <div 
                              class="absolute bottom-1 left-1 w-3 h-3 rounded border border-white"
                              :style="{ backgroundColor: color }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Visualizations Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">bar_chart</span>
                    Visualizations
                  </h2>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                  <!-- Heatmap Grid -->
                  <div>
                    <h3 class="text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Heatmap</h3>
                    <div class="rounded-lg overflow-hidden border" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                      <div 
                        class="grid grid-cols-10 gap-0.5 p-2"
                        :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                      >
                        <div
                          v-for="(value, index) in heatmapData"
                          :key="index"
                          class="aspect-square"
                          :style="{ backgroundColor: getColorForValue(value) }"
                          :title="`Value: ${value.toFixed(2)}`"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Scatter Plot -->
                  <div>
                    <h3 class="text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Scatter Plot</h3>
                    <div class="rounded-lg overflow-hidden border relative" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                      <svg width="100%" height="100%" class="absolute inset-0">
                        <g v-for="(point, index) in scatterData" :key="index">
                          <circle
                            :cx="point.x + '%'"
                            :cy="point.y + '%'"
                            r="4"
                            :fill="getColorForValue(point.value)"
                            :opacity="0.7"
                            :title="`Value: ${point.value.toFixed(2)}`"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>

                  <!-- Bar Chart -->
                  <div>
                    <h3 class="text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Bar Chart</h3>
                    <div class="rounded-lg overflow-hidden border" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                      <div class="flex items-end justify-around h-full p-4 gap-2">
                        <div
                          v-for="(value, index) in barChartData"
                          :key="index"
                          class="flex-1 flex flex-col items-center"
                        >
                          <div
                            class="w-full rounded-t transition-all hover:opacity-80"
                            :style="{ 
                              height: (value * 100) + '%',
                              backgroundColor: getColorForValue(value),
                              minHeight: '4px'
                            }"
                            :title="`Value: ${value.toFixed(2)}`"
                          ></div>
                          <span class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ index + 1 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Area Chart -->
                  <div>
                    <h3 class="text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Area Chart</h3>
                    <div class="rounded-lg overflow-hidden border relative" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                      <svg width="100%" height="100%" class="absolute inset-0">
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop
                              v-for="(color, index) in generatedScale"
                              :key="index"
                              :offset="(index / (generatedScale.length - 1)) * 100 + '%'"
                              :stop-color="color"
                              stop-opacity="0.6"
                            />
                          </linearGradient>
                        </defs>
                        <polygon
                          :points="areaChartPoints"
                          fill="url(#areaGradient)"
                          :stroke="generatedScale[Math.floor(generatedScale.length / 2)]"
                          stroke-width="2"
                        />
                        <polyline
                          :points="areaChartPoints"
                          :stroke="generatedScale[Math.floor(generatedScale.length / 2)]"
                          stroke-width="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              <!-- Right Sidebar: Export and Color Analysis -->
              <div class="space-y-6">
                <!-- Export Options -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">download</span>
                    Export
                  </h2>
                  
                  <div class="flex flex-col gap-2">
                    <button
                      @click="exportCSS"
                      class="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      :class="isDarkMode 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                    >
                      Export CSS Variables
                    </button>
                    <button
                      @click="exportJSON"
                      class="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      :class="isDarkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Export JSON
                    </button>
                    <button
                      @click="exportTableau"
                      class="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      :class="isDarkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Export Tableau XML
                    </button>
                  </div>
                </div>

                <!-- Color Analysis -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">analytics</span>
                    Color Analysis
                  </h2>
                  
                  <div class="grid grid-cols-3 gap-4">
                    <div v-if="generatedScale.length >= 3" class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ getLuminance(generatedScale[0]).toFixed(2) }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Start Luminance</div>
                    </div>
                    <div v-if="generatedScale.length >= 3" class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ getLuminance(generatedScale[Math.floor(generatedScale.length / 2)]).toFixed(2) }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Mid Luminance</div>
                    </div>
                    <div v-if="generatedScale.length >= 3" class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ getLuminance(generatedScale[generatedScale.length - 1]).toFixed(2) }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">End Luminance</div>
                    </div>
                    <div class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ generatedScale.length >= 2 ? getContrastRatio(generatedScale[0], generatedScale[generatedScale.length - 1]).toFixed(2) : '0.00' }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Contrast Ratio</div>
                    </div>
                    <div class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ generatedScale.length }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Colors</div>
                    </div>
                    <div class="text-center p-4 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                      <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ generatedScale.length > 0 ? getAverageSaturation().toFixed(0) : '0' }}%
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Avg Saturation</div>
                    </div>
                  </div>

                  <!-- Accessibility Contrast Check -->
                  <div v-if="generatedScale.length >= 2" class="mt-6">
                    <h3 class="text-sm font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">accessibility</span>
                      Accessibility Contrast Check
                    </h3>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                            <th class="text-left py-2 px-3 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">COMPARED COLORS</th>
                            <th class="text-left py-2 px-3 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PREVIEW</th>
                            <th class="text-left py-2 px-3 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">STATUS</th>
                            <th class="text-left py-2 px-3 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">CONTRAST</th>
                            <th class="text-left py-2 px-3 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">COLOR DIFFERENCE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <!-- Start color vs Background -->
                          <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                            <td class="py-3 px-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Start color vs Background</td>
                            <td class="py-3 px-3">
                              <div class="flex items-center gap-2">
                                <div class="w-16 h-8 rounded border flex overflow-hidden" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                                  <div class="flex-1" :style="{ backgroundColor: generatedScale[0] }"></div>
                                  <div class="flex-1" :style="{ backgroundColor: settings.backgroundColor }"></div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-3">
                              <span 
                                class="px-2 py-1 rounded text-xs font-medium"
                                :class="getContrastStatus(generatedScale[0], settings.backgroundColor) === 'Pass' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'"
                              >
                                {{ getContrastStatus(generatedScale[0], settings.backgroundColor) }}
                              </span>
                            </td>
                            <td class="py-3 px-3 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ getContrastRatio(generatedScale[0], settings.backgroundColor).toFixed(2) }}:1
                            </td>
                            <td class="py-3 px-3">
                              <div class="space-y-1">
                                <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                  Delta E {{ getDeltaE(generatedScale[0], settings.backgroundColor).toFixed(2) }}
                                </div>
                                <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                                  <div 
                                    class="h-full transition-all"
                                    :class="getDeltaE(generatedScale[0], settings.backgroundColor) > 50 ? 'bg-teal-500' : 'bg-teal-400'"
                                    :style="{ width: Math.min(100, (getDeltaE(generatedScale[0], settings.backgroundColor) / 100) * 100) + '%' }"
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <!-- End color vs Background -->
                          <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                            <td class="py-3 px-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">End color vs Background</td>
                            <td class="py-3 px-3">
                              <div class="flex items-center gap-2">
                                <div class="w-16 h-8 rounded border flex overflow-hidden" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                                  <div class="flex-1" :style="{ backgroundColor: generatedScale[generatedScale.length - 1] }"></div>
                                  <div class="flex-1" :style="{ backgroundColor: settings.backgroundColor }"></div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-3">
                              <span 
                                class="px-2 py-1 rounded text-xs font-medium"
                                :class="getContrastStatus(generatedScale[generatedScale.length - 1], settings.backgroundColor) === 'Pass' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'"
                              >
                                {{ getContrastStatus(generatedScale[generatedScale.length - 1], settings.backgroundColor) }}
                              </span>
                            </td>
                            <td class="py-3 px-3 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ getContrastRatio(generatedScale[generatedScale.length - 1], settings.backgroundColor).toFixed(2) }}:1
                            </td>
                            <td class="py-3 px-3">
                              <div class="space-y-1">
                                <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                  Delta E {{ getDeltaE(generatedScale[generatedScale.length - 1], settings.backgroundColor).toFixed(2) }}
                                </div>
                                <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                                  <div 
                                    class="h-full transition-all"
                                    :class="getDeltaE(generatedScale[generatedScale.length - 1], settings.backgroundColor) > 50 ? 'bg-teal-500' : 'bg-teal-400'"
                                    :style="{ width: Math.min(100, (getDeltaE(generatedScale[generatedScale.length - 1], settings.backgroundColor) / 100) * 100) + '%' }"
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <!-- Start color vs End color -->
                          <tr>
                            <td class="py-3 px-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Start color vs End color</td>
                            <td class="py-3 px-3">
                              <div class="flex items-center gap-2">
                                <div class="w-16 h-8 rounded border flex overflow-hidden" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                                  <div class="flex-1" :style="{ backgroundColor: generatedScale[0] }"></div>
                                  <div class="flex-1" :style="{ backgroundColor: generatedScale[generatedScale.length - 1] }"></div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-3">
                              <span 
                                class="px-2 py-1 rounded text-xs font-medium"
                                :class="getContrastStatus(generatedScale[0], generatedScale[generatedScale.length - 1]) === 'Pass' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'"
                              >
                                {{ getContrastStatus(generatedScale[0], generatedScale[generatedScale.length - 1]) }}
                              </span>
                            </td>
                            <td class="py-3 px-3 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ getContrastRatio(generatedScale[0], generatedScale[generatedScale.length - 1]).toFixed(2) }}:1
                            </td>
                            <td class="py-3 px-3">
                              <div class="space-y-1">
                                <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                  Delta E {{ getDeltaE(generatedScale[0], generatedScale[generatedScale.length - 1]).toFixed(2) }}
                                </div>
                                <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                                  <div 
                                    class="h-full transition-all"
                                    :class="getDeltaE(generatedScale[0], generatedScale[generatedScale.length - 1]) > 50 ? 'bg-teal-500' : 'bg-teal-400'"
                                    :style="{ width: Math.min(100, (getDeltaE(generatedScale[0], generatedScale[generatedScale.length - 1]) / 100) * 100) + '%' }"
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Color Space Visualizations -->
                  <div class="mt-6">
                    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                      Color Space Visualizations
                    </h3>
                    
                    <div class="space-y-6">
                      <!-- Color Wheel / Chromaticity Diagram -->
                      <div>
                        <h4 class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Color Wheel</h4>
                        <div class="rounded-lg overflow-hidden border relative" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                          <canvas ref="colorWheelCanvas" class="w-full h-full"></canvas>
                        </div>
                      </div>

                      <!-- RGB Channels Graph -->
                      <div>
                        <h4 class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">RGB Channels</h4>
                        <div class="rounded-lg overflow-hidden border relative" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                          <svg width="100%" height="100%" class="absolute inset-0">
                            <defs>
                              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" :stroke="isDarkMode ? '#475569' : '#e2e8f0'" stroke-width="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridPattern)" />
                            <g v-for="(channel, index) in rgbChannels" :key="index">
                              <polyline
                                :points="channel.points"
                                :stroke="channel.color"
                                stroke-width="2"
                                fill="none"
                              />
                            </g>
                          </svg>
                        </div>
                      </div>

                      <!-- 3D Color Space Plot -->
                      <div>
                        <h4 class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">3D Color Space</h4>
                        <div class="rounded-lg overflow-hidden border relative" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-gray-50'" style="height: 200px;">
                          <canvas ref="color3dCanvas" class="w-full h-full"></canvas>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ColorPicker from '../components/ColorPicker.vue';
import Dropdown from '../components/Dropdown.vue';
import chroma from 'chroma-js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const previewDarkMode = ref(false);
const scaleType = ref('sequential');
const generatedScale = ref([]);

const scaleTypes = [
  { label: 'Sequential', value: 'sequential' },
  { label: 'Diverging', value: 'diverging' },
  { label: 'Qualitative', value: 'qualitative' },
];

const contrastOptions = [
  { label: '1.0 (No contrast)', value: '1.0' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2.0' },
  { label: '3.0 (AA Large)', value: '3.0' },
  { label: '4.5 (AA)', value: '4.5' },
  { label: '7.0 (AAA)', value: '7.0' },
];

const sequentialColors = ref(['#3b82f6']);

const divergingColors = ref(['#3b82f6', '#ef4444']);

const qualitativeColorsInput = ref('#3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6');
const qualitativeColors = ref(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

const settings = ref({
  steps: 9,
  contrast: '4.5',
  brightness: 50,
  saturation: 100,
  backgroundColor: '#ffffff',
});

// Visualization data
const heatmapData = ref([]);
const scatterData = ref([]);
const barChartData = ref([]);
const areaChartData = ref([]);
const rgbChannels = ref([]);
const colorWheelCanvas = ref(null);
const color3dCanvas = ref(null);

const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const pickerTarget = ref(null);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const addSequentialColor = () => {
  sequentialColors.value.push('#808080');
  generateScale();
};

const removeSequentialColor = (index) => {
  if (sequentialColors.value.length > 1) {
    sequentialColors.value.splice(index, 1);
    generateScale();
  }
};

const addDivergingColor = () => {
  divergingColors.value.push('#808080');
  generateScale();
};

const removeDivergingColor = (index) => {
  if (divergingColors.value.length > 1) {
    divergingColors.value.splice(index, 1);
    generateScale();
  }
};

const updateQualitativeColors = () => {
  qualitativeColors.value = qualitativeColorsInput.value
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);
  generateScale();
};

const generateScale = () => {
  try {
    if (scaleType.value === 'sequential') {
      generateSequentialScale();
    } else if (scaleType.value === 'diverging') {
      generateDivergingScale();
    } else if (scaleType.value === 'qualitative') {
      generateQualitativeScale();
    }
  } catch (error) {
    console.error('Error generating scale:', error);
  }
};

const generateSequentialScale = () => {
  if (sequentialColors.value.length === 0) return;
  
  const contrastRatio = parseFloat(settings.value.contrast) || 1.0;
  const bgColor = settings.value.backgroundColor || '#ffffff';
  
  try {
    // Use contrast-based generation if contrast ratio > 1.0
    if (contrastRatio > 1.0) {
      let scale = [];
      
      if (sequentialColors.value.length === 1) {
        // Single color: generate scale from base to target contrast
        scale = generateContrastBasedScale(sequentialColors.value[0], bgColor, contrastRatio, settings.value.steps, 'sequential');
      } else {
        // Multiple colors: generate contrast-based scales between each pair
        const segments = sequentialColors.value.length - 1;
        const stepsPerSegment = Math.ceil(settings.value.steps / sequentialColors.value.length);
        
        for (let i = 0; i < segments; i++) {
          const startColor = sequentialColors.value[i];
          const endColor = sequentialColors.value[i + 1];
          
          // Generate contrast-based scale for this segment
          const segmentScale = generateContrastBasedScaleBetweenColors(
            startColor,
            endColor,
            bgColor,
            contrastRatio,
            stepsPerSegment
          );
          
          // Add colors (avoid duplicates at boundaries)
          if (i === 0) {
            scale.push(...segmentScale);
          } else {
            scale.push(...segmentScale.slice(1)); // Skip first to avoid duplicate
          }
        }
        
        // Trim to desired number of steps
        scale = scale.slice(0, settings.value.steps);
        
        // If we have fewer colors than steps, interpolate the final segment
        if (scale.length < settings.value.steps) {
          const remainingSteps = settings.value.steps - scale.length;
          const lastColor = sequentialColors.value[sequentialColors.value.length - 1];
          const finalSegment = generateContrastBasedScale(lastColor, bgColor, contrastRatio, remainingSteps + 1, 'sequential');
          scale.push(...finalSegment.slice(1));
        }
      }
      
      generatedScale.value = applyAdjustments(scale);
    } else {
      // Fallback to chroma for no contrast requirement
      if (sequentialColors.value.length === 1) {
        const baseColor = sequentialColors.value[0];
        const scale = chroma.scale([baseColor, chroma(baseColor).darken(2)])
          .mode('lch')
          .colors(settings.value.steps);
        
        generatedScale.value = applyAdjustments(scale);
      } else {
        const scale = chroma.scale(sequentialColors.value)
          .mode('lch')
          .colors(settings.value.steps);
        
        generatedScale.value = applyAdjustments(scale);
      }
    }
  } catch (error) {
    console.error('Error generating sequential scale:', error);
    // Fallback to chroma
    if (sequentialColors.value.length === 1) {
      const baseColor = sequentialColors.value[0];
      const scale = chroma.scale([baseColor, chroma(baseColor).darken(2)])
        .mode('lch')
        .colors(settings.value.steps);
      
      generatedScale.value = applyAdjustments(scale);
    } else {
      const scale = chroma.scale(sequentialColors.value)
        .mode('lch')
        .colors(settings.value.steps);
      
      generatedScale.value = applyAdjustments(scale);
    }
  }
};

const generateDivergingScale = () => {
  if (divergingColors.value.length === 0) return;
  
  const contrastRatio = parseFloat(settings.value.contrast) || 1.0;
  const bgColor = settings.value.backgroundColor || '#ffffff';
  
  try {
    // Use contrast-based generation if contrast ratio > 1.0
    if (contrastRatio > 1.0) {
      let scale = [];
      
      if (divergingColors.value.length === 1) {
        // Single color: generate scale from background to target contrast
        scale = generateContrastBasedScale(divergingColors.value[0], bgColor, contrastRatio, settings.value.steps, 'diverging');
      } else {
        // Multiple colors: generate contrast-based scales between colors
        const midPoint = Math.floor(settings.value.steps / 2);
        const leftSteps = midPoint + (settings.value.steps % 2);
        const rightSteps = settings.value.steps - leftSteps + 1;
        
        // Left side: from first color to background
        const leftScale = generateContrastBasedScaleBetweenColors(
          divergingColors.value[0],
          bgColor,
          bgColor,
          contrastRatio,
          leftSteps
        );
        
        // Right side: from background to last color
        const rightScale = generateContrastBasedScaleBetweenColors(
          bgColor,
          divergingColors.value[divergingColors.value.length - 1],
          bgColor,
          contrastRatio,
          rightSteps
        );
        
        // Combine scales (avoid duplicate at midpoint)
        scale = [...leftScale, ...rightScale.slice(1)];
        
        // Trim to desired number of steps
        scale = scale.slice(0, settings.value.steps);
      }
      
      generatedScale.value = applyAdjustments(scale);
    } else {
      // Fallback to chroma
      if (divergingColors.value.length === 1) {
        const scale = chroma.scale(['#ffffff', divergingColors.value[0]])
          .mode('lch')
          .colors(settings.value.steps);
        
        generatedScale.value = applyAdjustments(scale);
      } else {
        const colors = divergingColors.value.length === 2 
          ? [divergingColors.value[0], '#ffffff', divergingColors.value[1]]
          : divergingColors.value;
        
        const scale = chroma.scale(colors)
          .mode('lch')
          .colors(settings.value.steps);
        
        generatedScale.value = applyAdjustments(scale);
      }
    }
  } catch (error) {
    console.error('Error generating diverging scale:', error);
    // Fallback to chroma
    if (divergingColors.value.length === 1) {
      const scale = chroma.scale(['#ffffff', divergingColors.value[0]])
        .mode('lch')
        .colors(settings.value.steps);
      
      generatedScale.value = applyAdjustments(scale);
    } else {
      const colors = divergingColors.value.length === 2 
        ? [divergingColors.value[0], '#ffffff', divergingColors.value[1]]
        : divergingColors.value;
      
      const scale = chroma.scale(colors)
        .mode('lch')
        .colors(settings.value.steps);
      
      generatedScale.value = applyAdjustments(scale);
    }
  }
};

// Calculate relative luminance (WCAG formula)
const getLuminance = (color) => {
  try {
    const rgb = chroma(color).rgb();
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch {
    return 0;
  }
};

// Calculate contrast ratio between two colors
const calculateContrastRatio = (color1, color2) => {
  if (!color1 || !color2) return 1;
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Find a color that meets a target contrast ratio against a background
const findColorAtContrast = (baseColor, bgColor, targetRatio, isSequential = true) => {
  try {
    const bgLum = getLuminance(bgColor);
    const baseLum = getLuminance(baseColor);
    
    // Determine if we need lighter or darker color
    const needsLighter = bgLum < baseLum;
    
    // Calculate target luminance
    // contrast = (lighter + 0.05) / (darker + 0.05)
    // If bg is darker, we need: targetRatio = (colorLum + 0.05) / (bgLum + 0.05)
    // If bg is lighter, we need: targetRatio = (bgLum + 0.05) / (colorLum + 0.05)
    
    let targetLum;
    if (needsLighter) {
      // Background is darker, color needs to be lighter
      targetLum = targetRatio * (bgLum + 0.05) - 0.05;
    } else {
      // Background is lighter, color needs to be darker
      targetLum = (bgLum + 0.05) / targetRatio - 0.05;
    }
    
    // Clamp luminance between 0 and 1
    targetLum = Math.max(0, Math.min(1, targetLum));
    
    // Convert base color to HSL to preserve hue and saturation
    const baseHsl = chroma(baseColor).hsl();
    const hue = baseHsl[0] || 0;
    const saturation = baseHsl[1] || 0;
    
    // Binary search for the right lightness
    let minLightness = 0;
    let maxLightness = 1;
    let bestColor = baseColor;
    let bestRatio = calculateContrastRatio(baseColor, bgColor);
    
    // Try to find a color close to the target contrast
    for (let i = 0; i < 50; i++) {
      const lightness = (minLightness + maxLightness) / 2;
      const testColor = chroma.hsl(hue, saturation, lightness).hex();
      const testLum = getLuminance(testColor);
      const testRatio = calculateContrastRatio(testColor, bgColor);
      
      if (Math.abs(testRatio - targetRatio) < Math.abs(bestRatio - targetRatio)) {
        bestRatio = testRatio;
        bestColor = testColor;
      }
      
      if (needsLighter) {
        if (testLum < targetLum) {
          minLightness = lightness;
        } else {
          maxLightness = lightness;
        }
      } else {
        if (testLum > targetLum) {
          maxLightness = lightness;
        } else {
          minLightness = lightness;
        }
      }
      
      if (Math.abs(testRatio - targetRatio) < 0.01) {
        break;
      }
    }
    
    return bestColor;
  } catch (error) {
    console.error('Error finding color at contrast:', error);
    return baseColor;
  }
};

// Generate a contrast-based color scale
const generateContrastBasedScale = (baseColor, bgColor, targetRatio, steps, type = 'sequential') => {
  const scale = [];
  const ratios = [];
  
  // Generate ratios from 1.0 (no contrast) to targetRatio
  for (let i = 0; i < steps; i++) {
    const ratio = 1.0 + (targetRatio - 1.0) * (i / (steps - 1));
    ratios.push(ratio);
  }
  
  // For diverging, we want to go from background to target contrast
  // For sequential, we go from base color to target contrast
  if (type === 'diverging') {
    // Start with background color (or very close to it)
    scale.push(bgColor);
    
    // Generate colors at increasing contrast ratios
    for (let i = 1; i < steps; i++) {
      const ratio = ratios[i];
      const color = findColorAtContrast(baseColor, bgColor, ratio, false);
      scale.push(color);
    }
  } else {
    // Sequential: start from base color, increase contrast
    for (let i = 0; i < steps; i++) {
      const ratio = ratios[i];
      const color = findColorAtContrast(baseColor, bgColor, ratio, true);
      scale.push(color);
    }
  }
  
  // Ensure smooth transitions by interpolating between generated colors
  if (scale.length > 2) {
    const smoothed = chroma.scale(scale).mode('lch').colors(steps);
    return smoothed;
  }
  
  return scale;
};

// Generate a contrast-based scale between two colors
const generateContrastBasedScaleBetweenColors = (startColor, endColor, bgColor, targetRatio, steps) => {
  const scale = [];
  
  // Generate intermediate colors between start and end
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // 0 to 1
    
    // Interpolate between start and end colors
    const interpolatedColor = chroma.mix(startColor, endColor, t, 'lch').hex();
    
    // Calculate what contrast ratio this interpolated color has
    const currentRatio = calculateContrastRatio(interpolatedColor, bgColor);
    
    // If contrast is below target, adjust the color to meet contrast requirement
    if (currentRatio < targetRatio) {
      // Find a color that meets the contrast requirement while preserving hue/saturation
      const adjustedColor = findColorAtContrast(interpolatedColor, bgColor, targetRatio, true);
      scale.push(adjustedColor);
    } else {
      // Color already meets contrast requirement
      scale.push(interpolatedColor);
    }
  }
  
  return scale;
};

const applyAdjustments = (scale) => {
  return scale.map(color => {
    let c = chroma(color);
    if (settings.value.brightness !== 50) {
      const brightnessDiff = (settings.value.brightness - 50) / 50;
      c = c.brighten(brightnessDiff);
    }
    if (settings.value.saturation !== 100) {
      const satDiff = (settings.value.saturation - 100) / 100;
      c = c.saturate(satDiff);
    }
    return c.hex();
  });
};

const generateQualitativeScale = () => {
  if (qualitativeColors.value.length === 0) return;
  
  // Generate intermediate colors between the provided colors
  const stepsPerColor = Math.ceil(settings.value.steps / qualitativeColors.value.length);
  const scale = [];
  
  for (let i = 0; i < qualitativeColors.value.length; i++) {
    const currentColor = qualitativeColors.value[i];
    const nextColor = qualitativeColors.value[(i + 1) % qualitativeColors.value.length];
    
    const colorScale = chroma.scale([currentColor, nextColor])
      .mode('lch')
      .colors(stepsPerColor);
    
    scale.push(...colorScale);
  }
  
  // Trim to desired number of steps
  const trimmedScale = scale.slice(0, settings.value.steps);
  generatedScale.value = applyAdjustments(trimmedScale);
};

const getTextColor = (bgColor) => {
  const luminance = chroma(bgColor).luminance();
  return luminance > 0.5 
    ? (isDarkMode.value ? 'text-gray-900 bg-white/80' : 'text-gray-900 bg-white/80')
    : (isDarkMode.value ? 'text-white bg-black/40' : 'text-white bg-black/40');
};


const isLightColor = (color) => {
  try {
    const rgb = chroma(color).rgb();
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.8; // Consider colors with luminance > 0.8 as light
  } catch {
    return false;
  }
};

const getContrastRatio = (color1, color2) => {
  return calculateContrastRatio(color1, color2);
};

// Colorblindness simulation functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const simulateColorBlindness = (hex, type) => {
  if (type === 'normal' || !type) return hex;
  
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Color blindness simulation matrices (based on Brettel et al. 1997)
  switch (type) {
    case 'protanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.567 + rgb.g * 0.433),
        Math.round(rgb.r * 0.558 + rgb.g * 0.442),
        Math.round(rgb.r * 0 + rgb.g * 0.242 + rgb.b * 0.758)
      );
    case 'deuteranopia':
      return rgbToHex(
        Math.round(rgb.r * 0.625 + rgb.g * 0.375),
        Math.round(rgb.r * 0.7 + rgb.g * 0.3),
        Math.round(rgb.r * 0 + rgb.g * 0.3 + rgb.b * 0.7)
      );
    case 'tritanopia':
      return rgbToHex(
        Math.round(rgb.r * 0.95 + rgb.g * 0.05),
        Math.round(rgb.r * 0 + rgb.g * 0.433 + rgb.b * 0.567),
        Math.round(rgb.r * 0 + rgb.g * 0.475 + rgb.b * 0.525)
      );
    default:
      return hex;
  }
};

const getAverageSaturation = () => {
  if (generatedScale.value.length === 0) return 0;
  try {
    const totalSaturation = generatedScale.value.reduce((sum, color) => {
      if (!color) return sum;
      return sum + chroma(color).get('hsl.s') * 100;
    }, 0);
    return totalSaturation / generatedScale.value.length;
  } catch (e) {
    return 0;
  }
};

const getContrastStatus = (color1, color2) => {
  if (!color1 || !color2) return 'Fail';
  try {
    const ratio = getContrastRatio(color1, color2);
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    // We'll use 4.5:1 as the threshold for "Pass"
    return ratio >= 4.5 ? 'Pass' : 'Fail';
  } catch (e) {
    return 'Fail';
  }
};

const getDeltaE = (color1, color2) => {
  if (!color1 || !color2) return 0;
  try {
    // Convert colors to Lab color space for Delta E calculation
    const lab1 = chroma(color1).lab();
    const lab2 = chroma(color2).lab();
    
    // Calculate Delta E using CIE76 formula
    const deltaL = lab1[0] - lab2[0];
    const deltaA = lab1[1] - lab2[1];
    const deltaB = lab1[2] - lab2[2];
    
    const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    return deltaE;
  } catch (e) {
    return 0;
  }
};

const getColorForValue = (value) => {
  // Normalize value to 0-1 range
  const normalized = Math.max(0, Math.min(1, value));
  // Map to scale index
  const index = Math.floor(normalized * (generatedScale.value.length - 1));
  return generatedScale.value[index] || generatedScale.value[0];
};

const generateVisualizationData = () => {
  // Generate heatmap data (10x10 grid = 100 values)
  heatmapData.value = Array.from({ length: 100 }, () => Math.random());
  
  // Generate scatter plot data (50 points)
  scatterData.value = Array.from({ length: 50 }, () => ({
    x: Math.random() * 80 + 10, // 10-90%
    y: Math.random() * 80 + 10, // 10-90%
    value: Math.random(),
  }));
  
  // Generate bar chart data (12 bars)
  barChartData.value = Array.from({ length: 12 }, () => Math.random());
  
  // Generate area chart data (20 points)
  areaChartData.value = Array.from({ length: 20 }, (_, i) => ({
    x: (i / 19) * 100,
    y: Math.sin(i / 3) * 0.3 + 0.5 + Math.random() * 0.2,
  }));

  // Generate RGB channels data
  generateRGBChannels();

  // Draw color wheel and 3D plot
  nextTick(() => {
    drawColorWheel();
    draw3DColorSpace();
  });
};

const generateRGBChannels = () => {
  if (generatedScale.value.length === 0) return;
  
  const steps = generatedScale.value.length;
  const channelData = {
    r: [],
    g: [],
    b: [],
  };
  
  generatedScale.value.forEach((color, index) => {
    const rgb = chroma(color).rgb();
    const x = (index / (steps - 1)) * 100;
    channelData.r.push({ x, y: rgb[0] });
    channelData.g.push({ x, y: rgb[1] });
    channelData.b.push({ x, y: rgb[2] });
  });
  
  rgbChannels.value = [
    {
      name: 'Red',
      color: '#ef4444',
      points: channelData.r.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '), // Scale to 0-100
    },
    {
      name: 'Green',
      color: '#10b981',
      points: channelData.g.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '),
    },
    {
      name: 'Blue',
      color: '#3b82f6',
      points: channelData.b.map(p => `${p.x},${100 - p.y * 0.392}`).join(' '),
    },
  ];
};

const drawColorWheel = () => {
  const canvas = colorWheelCanvas.value;
  if (!canvas || generatedScale.value.length === 0) return;
  
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
  
  // Clear canvas
  ctx.fillStyle = isDarkMode.value ? '#1e293b' : '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw color wheel background (simplified hue circle)
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= radius) {
        const angle = Math.atan2(dy, dx);
        const hue = (angle + Math.PI) / (2 * Math.PI) * 360;
        const saturation = Math.min(100, (dist / radius) * 100);
        const lightness = 50;
        
        const color = chroma.hsl(hue, saturation / 100, lightness / 100);
        const rgb = color.rgb();
        
        const idx = (y * canvas.width + x) * 4;
        imageData.data[idx] = rgb[0];
        imageData.data[idx + 1] = rgb[1];
        imageData.data[idx + 2] = rgb[2];
        imageData.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  
  // Draw color path on wheel
  if (generatedScale.value.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    generatedScale.value.forEach((color, index) => {
      const hsl = chroma(color).hsl();
      const hue = hsl[0] || 0;
      const saturation = hsl[1] || 0;
      const angle = (hue / 360) * 2 * Math.PI - Math.PI / 2;
      const dist = (saturation * radius);
      
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw start and end points
    const startColor = generatedScale.value[0];
    const endColor = generatedScale.value[generatedScale.value.length - 1];
    
    [startColor, endColor].forEach((color, idx) => {
      const hsl = chroma(color).hsl();
      const hue = hsl[0] || 0;
      const saturation = hsl[1] || 0;
      const angle = (hue / 360) * 2 * Math.PI - Math.PI / 2;
      const dist = (saturation * radius);
      
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
};

const draw3DColorSpace = () => {
  const canvas = color3dCanvas.value;
  if (!canvas || generatedScale.value.length === 0) return;
  
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = isDarkMode.value ? '#1e293b' : '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw 3D axes
  const padding = 20;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  
  ctx.strokeStyle = isDarkMode.value ? '#64748b' : '#cbd5e1';
  ctx.lineWidth = 1;
  
  // X axis (bottom)
  ctx.beginPath();
  ctx.moveTo(padding, height + padding);
  ctx.lineTo(width + padding, height + padding);
  ctx.stroke();
  
  // Y axis (left)
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height + padding);
  ctx.stroke();
  
  // Z axis (diagonal)
  ctx.beginPath();
  ctx.moveTo(padding, height + padding);
  ctx.lineTo(padding + width * 0.3, padding + height * 0.3);
  ctx.stroke();
  
  // Draw color path in 3D space
  if (generatedScale.value.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    generatedScale.value.forEach((color, index) => {
      const rgb = chroma(color).rgb();
      const normalized = index / (generatedScale.value.length - 1);
      
      // Map RGB to 3D coordinates
      const x = padding + normalized * width;
      const y = padding + height - (rgb[1] / 255) * height;
      const z = (rgb[2] / 255) * width * 0.3;
      
      const x3d = x + z * 0.5;
      const y3d = y - z * 0.5;
      
      if (index === 0) {
        ctx.moveTo(x3d, y3d);
      } else {
        ctx.lineTo(x3d, y3d);
      }
    });
    
    // Create gradient for the path
    const gradient = ctx.createLinearGradient(padding, padding, width + padding, height + padding);
    generatedScale.value.forEach((color, index) => {
      gradient.addColorStop(index / (generatedScale.value.length - 1), color);
    });
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Draw points along the path
    generatedScale.value.forEach((color, index) => {
      const rgb = chroma(color).rgb();
      const normalized = index / (generatedScale.value.length - 1);
      
      const x = padding + normalized * width;
      const y = padding + height - (rgb[1] / 255) * height;
      const z = (rgb[2] / 255) * width * 0.3;
      
      const x3d = x + z * 0.5;
      const y3d = y - z * 0.5;
      
      ctx.beginPath();
      ctx.arc(x3d, y3d, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
};

const areaChartPoints = computed(() => {
  if (areaChartData.value.length === 0) return '';
  
  const width = 100;
  const height = 100;
  const padding = 10;
  
  const points = areaChartData.value.map((point, index) => {
    const x = padding + (point.x / 100) * (width - padding * 2);
    const y = height - padding - (point.y * (height - padding * 2));
    return `${x},${y}`;
  });
  
  // Add bottom corners for area fill
  const firstX = padding + (areaChartData.value[0].x / 100) * (width - padding * 2);
  const lastX = padding + (areaChartData.value[areaChartData.value.length - 1].x / 100) * (width - padding * 2);
  const bottomY = height - padding;
  
  return `${firstX},${bottomY} ${points.join(' ')} ${lastX},${bottomY}`;
});

const copyColor = async (color) => {
  try {
    await navigator.clipboard.writeText(color);
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const exportCSS = () => {
  const css = generatedScale.value.map((color, index) => {
    return `  --color-scale-${index + 1}: ${color};`;
  }).join('\n');
  
  const fullCSS = `:root {\n${css}\n}`;
  
  navigator.clipboard.writeText(fullCSS).then(() => {
    alert('CSS variables copied to clipboard!');
  });
};

const exportJSON = () => {
  const json = JSON.stringify({
    type: scaleType.value,
    colors: generatedScale.value,
    settings: settings.value,
  }, null, 2);
  
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON copied to clipboard!');
  });
};

const exportTableau = () => {
  // Map scale type to Tableau palette type
  const tableauTypeMap = {
    sequential: 'ordered-sequential',
    diverging: 'ordered-diverging',
    qualitative: 'regular',
  };
  
  const tableauType = tableauTypeMap[scaleType.value] || 'regular';
  const paletteName = `Custom ${scaleType.value.charAt(0).toUpperCase() + scaleType.value.slice(1)} Palette`;
  
  // Generate Tableau XML
  let xmlContent = `<?xml version='1.0'?>\n`;
  xmlContent += `<workbook>\n`;
  xmlContent += `  <preferences>\n`;
  xmlContent += `    <color-palette name="${paletteName}" type="${tableauType}">\n`;
  
  generatedScale.value.forEach((color) => {
    // Ensure color is in hex format without alpha
    const hexColor = chroma(color).hex().toUpperCase();
    xmlContent += `      <color>${hexColor}</color>\n`;
  });
  
  xmlContent += `    </color-palette>\n`;
  xmlContent += `  </preferences>\n`;
  xmlContent += `</workbook>`;
  
  // Create and download file
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Preferences.tps';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  alert('Tableau XML file downloaded! Place it in your "My Tableau Repository" directory and restart Tableau.');
};

const openColorPicker = (target, event) => {
  event.stopPropagation();
  pickerTarget.value = target;
  
  let color = '#000000';
  if (target.startsWith('sequential-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && sequentialColors.value[index]) {
      color = sequentialColors.value[index];
    }
  } else if (target.startsWith('diverging-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && divergingColors.value[index]) {
      color = divergingColors.value[index];
    }
  } else if (target.startsWith('qualitative-')) {
    const index = parseInt(target.split('-')[1]);
    if (!isNaN(index) && qualitativeColors.value[index]) {
      color = qualitativeColors.value[index];
    }
  } else if (target === 'background') {
    color = settings.value.backgroundColor;
  }
  
  pickerColor.value = color;
  
  const rect = event.target.getBoundingClientRect();
  
  const pickerWidth = 280;
  const pickerHeight = 550;
  const padding = 16;
  
  // Use viewport coordinates for fixed positioning
  let left = rect.right + padding;
  let top = rect.top;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth) {
    left = rect.left - pickerWidth - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  // Check if there's enough space below the button
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // If there's not enough space below, try above
  if (spaceBelow < pickerHeight + padding && spaceAbove > spaceBelow) {
    top = rect.top - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  // If still too tall for viewport, center it vertically or position at top
  if (top + pickerHeight > window.innerHeight) {
    const centeredTop = Math.max(padding, (window.innerHeight - pickerHeight) / 2);
    top = Math.min(centeredTop, padding);
  }
  
  // Final safety check: ensure it's within bounds
  if (top < padding) {
    top = padding;
  }
  if (top + pickerHeight > window.innerHeight) {
    top = window.innerHeight - pickerHeight - padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (pickerTarget.value.startsWith('sequential-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && sequentialColors.value[index] !== undefined) {
      sequentialColors.value[index] = color;
      generateScale();
    }
  } else if (pickerTarget.value.startsWith('diverging-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && divergingColors.value[index] !== undefined) {
      divergingColors.value[index] = color;
      generateScale();
    }
  } else if (pickerTarget.value.startsWith('qualitative-')) {
    const index = parseInt(pickerTarget.value.split('-')[1]);
    if (!isNaN(index) && qualitativeColors.value[index] !== undefined) {
      qualitativeColors.value[index] = color;
      qualitativeColorsInput.value = qualitativeColors.value.join(', ');
      generateScale();
    }
  } else if (pickerTarget.value === 'background') {
    settings.value.backgroundColor = color;
    generateScale();
  }
  showColorPicker.value = false;
  pickerTarget.value = null;
};

watch(scaleType, () => {
  generateScale();
});

watch(generatedScale, () => {
  generateVisualizationData();
}, { deep: true });

watch(isDarkMode, () => {
  nextTick(() => {
    drawColorWheel();
    draw3DColorSpace();
  });
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  generateScale();
  generateVisualizationData();
  
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

/* Custom range slider styles for brand blue */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-runnable-track {
  background: #e0e7ff; /* indigo-100 */
  border-radius: 9999px;
  height: 8px;
}

html.dark input[type="range"]::-webkit-slider-runnable-track {
  background: #6366f1; /* indigo-500 */
}

input[type="range"]::-moz-range-track {
  background: #e0e7ff; /* indigo-100 */
  border-radius: 9999px;
  height: 8px;
}

html.dark input[type="range"]::-moz-range-track {
  background: #6366f1; /* indigo-500 */
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background-color: #4f46e5; /* indigo-600 - brand blue */
  border: 2px solid #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  margin-top: -4px;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  transition: background-color 0.2s, box-shadow 0.2s;
}

html.dark input[type="range"]::-webkit-slider-thumb {
  background-color: #6366f1; /* indigo-500 - brand blue for dark mode */
  border-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  background-color: #4338ca; /* indigo-700 */
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}

html.dark input[type="range"]::-webkit-slider-thumb:hover {
  background-color: #818cf8; /* indigo-400 */
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
}

input[type="range"]::-moz-range-thumb {
  background-color: #4f46e5; /* indigo-600 - brand blue */
  border: 2px solid #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  transition: background-color 0.2s, box-shadow 0.2s;
}

html.dark input[type="range"]::-moz-range-thumb {
  background-color: #6366f1; /* indigo-500 - brand blue for dark mode */
  border-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input[type="range"]::-moz-range-thumb:hover {
  background-color: #4338ca; /* indigo-700 */
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}

html.dark input[type="range"]::-moz-range-thumb:hover {
  background-color: #818cf8; /* indigo-400 */
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
}
</style>

