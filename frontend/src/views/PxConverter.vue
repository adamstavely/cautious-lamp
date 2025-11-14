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
                      PX Unit Converter
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Convert pixel values to REM, EM, percentage, and Tailwind units. Supports bidirectional conversion with customizable base sizes.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">straighten</span>
                      Unit Converter
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
                        <linearGradient id="converterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized converter icon -->
                      <rect x="30" y="80" width="140" height="40" rx="4" fill="url(#converterGradient)" opacity="0.3"/>
                      <circle cx="50" cy="100" r="15" fill="url(#converterGradient)" opacity="0.5"/>
                      <path d="M 80 100 L 120 100" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="150" cy="100" r="15" fill="url(#converterGradient)" opacity="0.7"/>
                      <!-- Additional conversion indicators -->
                      <text x="100" y="50" text-anchor="middle" fill="url(#converterGradient)" opacity="0.6" font-size="14" font-weight="bold">PX</text>
                      <text x="100" y="170" text-anchor="middle" fill="url(#converterGradient)" opacity="0.6" font-size="14" font-weight="bold">REM/EM/%</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Conversion Mode Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">swap_horiz</span>
                Conversion Mode
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Typography Units Card -->
                <div 
                  class="rounded-lg border p-4"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'"
                >
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">Typography Units</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="mode in typographyModes"
                      :key="mode.value"
                      @click="selectedMode = mode.value"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      :class="selectedMode === mode.value
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                    >
                      {{ mode.label }}
                    </button>
                  </div>
                </div>

                <!-- Physical Units Card -->
                <div 
                  class="rounded-lg border p-4"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'"
                >
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">Physical Units</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="mode in physicalModes"
                      :key="mode.value"
                      @click="selectedMode = mode.value"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      :class="selectedMode === mode.value
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                    >
                      {{ mode.label }}
                    </button>
                  </div>
                </div>

                <!-- Viewport Units Card -->
                <div 
                  class="rounded-lg border p-4"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'"
                >
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">Viewport Units</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="mode in viewportModes"
                      :key="mode.value"
                      @click="selectedMode = mode.value"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      :class="selectedMode === mode.value
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                    >
                      {{ mode.label }}
                    </button>
                  </div>
                </div>

                <!-- Frameworks Card -->
                <div 
                  class="rounded-lg border p-4"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'"
                >
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">Frameworks</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="mode in frameworkModes"
                      :key="mode.value"
                      @click="selectedMode = mode.value"
                      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      :class="selectedMode === mode.value
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                    >
                      {{ mode.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Converter Section -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">calculate</span>
                Converter
              </h2>

              <!-- Configuration Panel -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Root Font Size (px)
                    </label>
                    <input
                      v-model.number="rootFontSize"
                      type="number"
                      min="1"
                      step="0.1"
                      class="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Parent Font Size (px)
                  </label>
                  <input
                    v-model.number="parentFontSize"
                    type="number"
                    min="1"
                    step="0.1"
                    class="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="needsViewportWidth">
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Viewport Width (px)
                  </label>
                  <input
                    v-model.number="viewportWidth"
                    type="number"
                    min="1"
                    step="1"
                    class="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="needsViewportHeight">
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Viewport Height (px)
                  </label>
                  <input
                    v-model.number="viewportHeight"
                    type="number"
                    min="1"
                    step="1"
                    class="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="selectedMode === 'px-to-percent' || selectedMode === 'percent-to-vw'">
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Context
                  </label>
                  <select
                    v-model="percentageContext"
                    class="w-full px-3 py-2 border rounded-lg text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="font-size">Font Size</option>
                    <option value="dimension">Width/Height</option>
                  </select>
                </div>
              </div>

              <!-- Conversion Input/Output Fields -->
              <div class="space-y-4">
                <!-- PX to REM -->
                <div v-if="selectedMode === 'px-to-rem'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToRem"
                        placeholder="16"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">REM</label>
                    <div class="relative">
                      <input
                        v-model.number="remValue"
                        type="number"
                        step="0.0001"
                        @input="convertRemToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">rem</span>
                      <button
                        @click="copyToClipboard(remValue + 'rem')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to EM -->
                <div v-if="selectedMode === 'px-to-em'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToEm"
                        placeholder="16"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">EM</label>
                    <div class="relative">
                      <input
                        v-model.number="emValue"
                        type="number"
                        step="0.0001"
                        @input="convertEmToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">em</span>
                      <button
                        @click="copyToClipboard(emValue + 'em')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to Percentage -->
                <div v-if="selectedMode === 'px-to-percent'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToPercent"
                        placeholder="16"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Percentage</label>
                    <div class="relative">
                      <input
                        v-model.number="percentValue"
                        type="number"
                        step="0.01"
                        @input="convertPercentToPx"
                        placeholder="100"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">%</span>
                      <button
                        @click="copyToClipboard(percentValue + '%')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Base Unit to PX -->
                <div v-if="selectedMode === 'base-to-px'" class="space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Base Unit</label>
                      <div class="relative">
                        <input
                          v-model="baseUnitValue"
                          type="text"
                          @input="convertBaseToPx"
                          placeholder="1rem, 1em, or 100%"
                          class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(baseUnitValue)"
                          class="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                          title="Copy"
                        >
                          <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div class="text-2xl text-gray-400">→</div>
                    <div class="flex-1">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                      <div class="relative">
                        <input
                          :value="baseToPxResult"
                          type="number"
                          readonly
                          class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                        <button
                          @click="copyToClipboard(baseToPxResult + 'px')"
                          class="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                          title="Copy"
                        >
                          <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- PX to Tailwind -->
                <div v-if="selectedMode === 'px-to-tailwind'" class="space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                      <div class="relative">
                        <input
                          v-model.number="pxValue"
                          type="number"
                          step="0.1"
                          @input="convertPxToTailwind"
                          placeholder="16"
                          class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                        <button
                          @click="copyToClipboard(pxValue + 'px')"
                          class="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                          title="Copy"
                        >
                          <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div class="text-2xl text-gray-400">→</div>
                    <div class="flex-1">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Tailwind Value</label>
                      <div class="relative">
                        <input
                          :value="tailwindValue"
                          type="text"
                          readonly
                          class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(tailwindValue)"
                          class="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                          title="Copy"
                        >
                          <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="tailwindClass" class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Tailwind Class Examples:</p>
                    <div class="flex flex-wrap gap-2">
                      <code class="px-3 py-1 rounded text-sm font-mono" :class="isDarkMode ? 'bg-slate-700 text-indigo-400' : 'bg-white text-indigo-600 border border-gray-300'">{{ tailwindClass }}</code>
                      <code class="px-3 py-1 rounded text-sm font-mono" :class="isDarkMode ? 'bg-slate-700 text-indigo-400' : 'bg-white text-indigo-600 border border-gray-300'">m-{{ tailwindValue }}</code>
                      <code class="px-3 py-1 rounded text-sm font-mono" :class="isDarkMode ? 'bg-slate-700 text-indigo-400' : 'bg-white text-indigo-600 border border-gray-300'">gap-{{ tailwindValue }}</code>
                    </div>
                  </div>
                </div>

                <!-- PX to VH -->
                <div v-if="selectedMode === 'px-to-vh'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToVh"
                        placeholder="108"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VH</label>
                    <div class="relative">
                      <input
                        v-model.number="vhValue"
                        type="number"
                        step="0.0001"
                        @input="convertVhToPx"
                        placeholder="10"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vh</span>
                      <button
                        @click="copyToClipboard(vhValue + 'vh')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to PT -->
                <div v-if="selectedMode === 'px-to-pt'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToPt"
                        placeholder="16"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PT</label>
                    <div class="relative">
                      <input
                        v-model.number="ptValue"
                        type="number"
                        step="0.01"
                        @input="convertPtToPx"
                        placeholder="12"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">pt</span>
                      <button
                        @click="copyToClipboard(ptValue + 'pt')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to IN -->
                <div v-if="selectedMode === 'px-to-in'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToIn"
                        placeholder="96"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">IN</label>
                    <div class="relative">
                      <input
                        v-model.number="inValue"
                        type="number"
                        step="0.0001"
                        @input="convertInToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">in</span>
                      <button
                        @click="copyToClipboard(inValue + 'in')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to PC -->
                <div v-if="selectedMode === 'px-to-pc'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToPc"
                        placeholder="16"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PC</label>
                    <div class="relative">
                      <input
                        v-model.number="pcValue"
                        type="number"
                        step="0.0001"
                        @input="convertPcToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">pc</span>
                      <button
                        @click="copyToClipboard(pcValue + 'pc')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to CM -->
                <div v-if="selectedMode === 'px-to-cm'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToCm"
                        placeholder="37.795"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">CM</label>
                    <div class="relative">
                      <input
                        v-model.number="cmValue"
                        type="number"
                        step="0.0001"
                        @input="convertCmToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">cm</span>
                      <button
                        @click="copyToClipboard(cmValue + 'cm')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PX to MM -->
                <div v-if="selectedMode === 'px-to-mm'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</label>
                    <div class="relative">
                      <input
                        v-model.number="pxValue"
                        type="number"
                        step="0.1"
                        @input="convertPxToMm"
                        placeholder="3.7795"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">px</span>
                      <button
                        @click="copyToClipboard(pxValue + 'px')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">MM</label>
                    <div class="relative">
                      <input
                        v-model.number="mmValue"
                        type="number"
                        step="0.0001"
                        @input="convertMmToPx"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">mm</span>
                      <button
                        @click="copyToClipboard(mmValue + 'mm')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- REM to VW -->
                <div v-if="selectedMode === 'rem-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">REM</label>
                    <div class="relative">
                      <input
                        v-model.number="remValue"
                        type="number"
                        step="0.0001"
                        @input="convertRemToVw"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">rem</span>
                      <button
                        @click="copyToClipboard(remValue + 'rem')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToRem"
                        placeholder="0.833"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- EM to VW -->
                <div v-if="selectedMode === 'em-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">EM</label>
                    <div class="relative">
                      <input
                        v-model.number="emValue"
                        type="number"
                        step="0.0001"
                        @input="convertEmToVw"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">em</span>
                      <button
                        @click="copyToClipboard(emValue + 'em')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToEm"
                        placeholder="0.833"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- VH to VW -->
                <div v-if="selectedMode === 'vh-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VH</label>
                    <div class="relative">
                      <input
                        v-model.number="vhValue"
                        type="number"
                        step="0.0001"
                        @input="convertVhToVw"
                        placeholder="10"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vh</span>
                      <button
                        @click="copyToClipboard(vhValue + 'vh')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToVh"
                        placeholder="17.778"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PT to VW -->
                <div v-if="selectedMode === 'pt-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PT</label>
                    <div class="relative">
                      <input
                        v-model.number="ptValue"
                        type="number"
                        step="0.01"
                        @input="convertPtToVw"
                        placeholder="12"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">pt</span>
                      <button
                        @click="copyToClipboard(ptValue + 'pt')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToPt"
                        placeholder="0.625"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- IN to VW -->
                <div v-if="selectedMode === 'in-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">IN</label>
                    <div class="relative">
                      <input
                        v-model.number="inValue"
                        type="number"
                        step="0.0001"
                        @input="convertInToVw"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">in</span>
                      <button
                        @click="copyToClipboard(inValue + 'in')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToIn"
                        placeholder="5.208"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- PC to VW -->
                <div v-if="selectedMode === 'pc-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PC</label>
                    <div class="relative">
                      <input
                        v-model.number="pcValue"
                        type="number"
                        step="0.0001"
                        @input="convertPcToVw"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">pc</span>
                      <button
                        @click="copyToClipboard(pcValue + 'pc')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToPc"
                        placeholder="0.833"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- CM to VW -->
                <div v-if="selectedMode === 'cm-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">CM</label>
                    <div class="relative">
                      <input
                        v-model.number="cmValue"
                        type="number"
                        step="0.0001"
                        @input="convertCmToVw"
                        placeholder="1"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">cm</span>
                      <button
                        @click="copyToClipboard(cmValue + 'cm')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToCm"
                        placeholder="1.97"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- MM to VW -->
                <div v-if="selectedMode === 'mm-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">MM</label>
                    <div class="relative">
                      <input
                        v-model.number="mmValue"
                        type="number"
                        step="0.0001"
                        @input="convertMmToVw"
                        placeholder="10"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">mm</span>
                      <button
                        @click="copyToClipboard(mmValue + 'mm')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToMm"
                        placeholder="0.197"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Percentage to VW -->
                <div v-if="selectedMode === 'percent-to-vw'" class="flex items-center gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Percentage</label>
                    <div class="relative">
                      <input
                        v-model.number="percentValue"
                        type="number"
                        step="0.01"
                        @input="convertPercentToVw"
                        placeholder="100"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">%</span>
                      <button
                        @click="copyToClipboard(percentValue + '%')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-2xl text-gray-400">⇄</div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VW</label>
                    <div class="relative">
                      <input
                        v-model.number="vwValue"
                        type="number"
                        step="0.0001"
                        @input="convertVwToPercent"
                        placeholder="52.083"
                        class="w-full pl-10 pr-20 py-3 border rounded-lg text-2xl font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600 font-semibold">vw</span>
                      <button
                        @click="copyToClipboard(vwValue + 'vw')"
                        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        title="Copy"
                      >
                        <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Calculation Basis Note -->
                <div class="mt-4 text-sm text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                  <span v-if="selectedMode === 'px-to-rem'">Calculation based on a root font-size of {{ rootFontSize }} pixel.</span>
                  <span v-else-if="selectedMode === 'px-to-em'">Calculation based on a parent font-size of {{ parentFontSize }} pixel.</span>
                  <span v-else-if="selectedMode === 'px-to-vh'">Calculation based on a viewport height of {{ viewportHeight }} pixel.</span>
                  <span v-else-if="selectedMode === 'px-to-percent'">Calculation based on a parent size of {{ percentageContext === 'font-size' ? parentFontSize : 100 }} pixel.</span>
                  <span v-else-if="selectedMode.includes('vw')">Calculation based on a viewport width of {{ viewportWidth }} pixel.</span>
                  <span v-else-if="selectedMode === 'px-to-tailwind'">Tailwind uses 0.25rem increments ({{ rootFontSize * 0.25 }}px at {{ rootFontSize }}px root).</span>
                </div>
              </div>
            </div>

            <!-- Viewport Breakpoints -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">monitor</span>
                Breakpoints
              </h2>
              
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Common screen breakpoints showing PX to VW conversion for {{ pxValue || 192 }}px at each breakpoint.
              </p>

              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                <div 
                  v-for="(bp, index) in breakpointsTable" 
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:bg-slate-700' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-mono font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ bp.px }}px</p>
                    <button
                      @click="copyToClipboard(bp.px + 'px')"
                      class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                      title="Copy"
                    >
                      <span class="material-symbols-outlined text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                    </button>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-mono text-indigo-600 font-semibold">{{ bp.vw }}vw</p>
                    <button
                      @click="copyToClipboard(bp.vw + 'vw')"
                      class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                      title="Copy"
                    >
                      <span class="material-symbols-outlined text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conversion Tables -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">table_chart</span>
                Conversion Tables
              </h2>

              <!-- Table Mode Selector -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="tableMode in tableModes"
                  :key="tableMode.value"
                  @click="selectedTableMode = tableMode.value"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedTableMode === tableMode.value
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  {{ tableMode.label }}
                </button>
              </div>

              <!-- PX to REM Table -->
              <div v-if="selectedTableMode === 'px-to-rem'" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr :class="isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">REM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in pxToRemTable" 
                      :key="index"
                      :class="[
                        isDarkMode ? 'border-b border-gray-800 hover:bg-slate-800' : 'border-b border-gray-100 hover:bg-gray-50',
                        row.highlight ? (isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50') : ''
                      ]"
                    >
                      <td class="py-2 px-4 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ row.px }}px</td>
                      <td class="py-2 px-4 font-mono text-indigo-600 font-semibold">{{ row.rem }}rem</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- REM to PX Table -->
              <div v-if="selectedTableMode === 'rem-to-px'" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr :class="isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">REM</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in remToPxTable" 
                      :key="index"
                      :class="[
                        isDarkMode ? 'border-b border-gray-800 hover:bg-slate-800' : 'border-b border-gray-100 hover:bg-gray-50',
                        row.highlight ? (isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50') : ''
                      ]"
                    >
                      <td class="py-2 px-4 font-mono text-indigo-600 font-semibold">{{ row.rem }}rem</td>
                      <td class="py-2 px-4 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ row.px }}px</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- PX to EM Table -->
              <div v-if="selectedTableMode === 'px-to-em'" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr :class="isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">EM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in pxToEmTable" 
                      :key="index"
                      :class="[
                        isDarkMode ? 'border-b border-gray-800 hover:bg-slate-800' : 'border-b border-gray-100 hover:bg-gray-50',
                        row.highlight ? (isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50') : ''
                      ]"
                    >
                      <td class="py-2 px-4 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ row.px }}px</td>
                      <td class="py-2 px-4 font-mono text-indigo-600 font-semibold">{{ row.em }}em</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- PX to Percentage Table -->
              <div v-if="selectedTableMode === 'px-to-percent'" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr :class="isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in pxToPercentTable" 
                      :key="index"
                      :class="isDarkMode ? 'border-b border-gray-800 hover:bg-slate-800' : 'border-b border-gray-100 hover:bg-gray-50'"
                    >
                      <td class="py-2 px-4 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ row.px }}px</td>
                      <td class="py-2 px-4 font-mono text-indigo-600 font-semibold">{{ row.percent }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- PX to Tailwind Table -->
              <div v-if="selectedTableMode === 'px-to-tailwind'" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr :class="isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Pixels</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Tailwind Value</th>
                      <th class="text-left py-2 px-4 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Class Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(row, index) in pxToTailwindTable" 
                      :key="index"
                      :class="isDarkMode ? 'border-b border-gray-800 hover:bg-slate-800' : 'border-b border-gray-100 hover:bg-gray-50'"
                    >
                      <td class="py-2 px-4 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ row.px }}px</td>
                      <td class="py-2 px-4 font-mono text-indigo-600 font-semibold">{{ row.tw }}</td>
                      <td class="py-2 px-4 font-mono text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">p-{{ row.tw }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Educational Content -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">school</span>
                Understanding CSS Units
              </h2>

              <div class="space-y-6">
                <!-- REM Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">REM (Root EM)</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    The CSS <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">rem</code> unit allows defining a size relative to the <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">font-size</code> of the HTML root tag. Inside a single document, the length of a REM unit is everywhere the same, it can just differ between documents.
                  </p>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <strong>Example:</strong> If the default size is used, 1px represents 0.0625rem. In the other direction, 1rem represents 16px.
                  </p>
                </div>

                <!-- EM Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">EM</h3>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    EM on the other side can differ between every element, because it is relative to the element's own <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">font-size</code> (exception is the <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">font-size</code> itself, in it EM is relative to the parent).
                  </p>
                </div>

                <!-- EM vs REM -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">EM vs. REM: The differences</h3>
                  <ul class="list-disc list-inside space-y-1 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li><strong>REM:</strong> Inside a single document, the length of a REM unit is everywhere the same, it can just differ between documents.</li>
                    <li><strong>EM:</strong> EM on the other side can differ between every element, because it is relative to the element's own font-size (exception is the font-size itself, in it EM is relative to the parent).</li>
                    <li><strong>REM is the newer unit,</strong> older browsers don't support it.</li>
                  </ul>
                </div>

                <!-- Percentage Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Percentage (%)</h3>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Percentage units are relative to the parent element's value. For <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">font-size</code>, percentages are relative to the parent's font-size. For dimensions like <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">width</code> and <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">height</code>, percentages are relative to the parent container's size.
                  </p>
                </div>

                <!-- Tailwind Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Tailwind CSS Spacing Scale</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Tailwind CSS uses a spacing scale based on 0.25rem increments. Each unit in the Tailwind scale equals 0.25rem (4px at the default 16px root font size). This creates a consistent spacing system that works across padding, margin, gap, and other spacing utilities.
                  </p>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <strong>Examples:</strong> <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">p-4</code> = 1rem = 16px, <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">m-8</code> = 2rem = 32px, <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">gap-2</code> = 0.5rem = 8px
                  </p>
                </div>

                <!-- PX to VW Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">How to convert PX to VW?</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To convert px to vw, you should know total viewport width for example 1920px
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Then, just apply formula: <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">px / viewport total width * 100</code>
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    For example, with a viewport of 1920px, 192px will be converted to: <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">192 / 1920 * 100 = 10vw</code>
                  </p>
                </div>

                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">What is the PX to VW formula?</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">px / viewport total width * 100</code>
                  </p>
                </div>

                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">What is vw unit? (Viewport Width)</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Used in responsive design, Viewport Width (VW) is a unit relative to web page display area called viewport.
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    1vw corresponds to 1% of display. So, to make an element full width, you should use 100vw.
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    You can also use decimal values. Please note that, depending on browsers, decimal precision can change.
                  </p>
                </div>

                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">What is px unit? (Pixels)</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Pixel unit is the theorical smallest dot displayed on a computer screen.
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Nowadays, pixel unit can differ between physical resolution and logical resolution.
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    This difference is called device pixel ratio or DPR:
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">Logical resolution = physical resolution / device pixel ratio.</code>
                  </p>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    So, a screen with 1024x768 physical resolution with a DPR of 2 will have a 512x384 logical resolution.
                  </p>
                </div>

                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">What are common breakpoints for media queries?</h3>
                  <ul class="list-disc list-inside space-y-1 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li><strong>Mobile devices</strong> – 320px — 480px.</li>
                    <li><strong>iPads, Tablets</strong> – 481px — 768px.</li>
                    <li><strong>Small screens, laptops</strong> – 769px — 1024px.</li>
                    <li><strong>Desktops, large screens</strong> – 1025px — 1920px.</li>
                    <li><strong>Extra large screens, TV</strong> – 2560px, and more.</li>
                  </ul>
                </div>

                <!-- Browser Support -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Browser Support</h3>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    REM units are supported in all modern browsers (Chrome 4+, Firefox 3.6+, Safari 5+, IE 9+). EM and percentage units have been supported since the early days of CSS. Viewport units (vw, vh) are supported in all modern browsers (Chrome 20+, Firefox 19+, Safari 6+, IE 9+). For older browser support, consider providing pixel fallbacks or using a CSS preprocessor.
                  </p>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

// Conversion modes grouped by category
const typographyModes = [
  { label: 'PX → REM', value: 'px-to-rem' },
  { label: 'PX → EM', value: 'px-to-em' },
  { label: 'PX → %', value: 'px-to-percent' },
  { label: 'Base → PX', value: 'base-to-px' }
];

const physicalModes = [
  { label: 'PX → PT', value: 'px-to-pt' },
  { label: 'PX → IN', value: 'px-to-in' },
  { label: 'PX → PC', value: 'px-to-pc' },
  { label: 'PX → CM', value: 'px-to-cm' },
  { label: 'PX → MM', value: 'px-to-mm' }
];

const viewportModes = [
  { label: 'PX → VH', value: 'px-to-vh' },
  { label: 'VH → VW', value: 'vh-to-vw' },
  { label: 'REM → VW', value: 'rem-to-vw' },
  { label: 'EM → VW', value: 'em-to-vw' },
  { label: '% → VW', value: 'percent-to-vw' },
  { label: 'PT → VW', value: 'pt-to-vw' },
  { label: 'IN → VW', value: 'in-to-vw' },
  { label: 'PC → VW', value: 'pc-to-vw' },
  { label: 'CM → VW', value: 'cm-to-vw' },
  { label: 'MM → VW', value: 'mm-to-vw' }
];

const frameworkModes = [
  { label: 'PX → Tailwind', value: 'px-to-tailwind' }
];

// Combined array for backward compatibility
const conversionModes = [
  ...typographyModes,
  ...physicalModes,
  ...viewportModes,
  ...frameworkModes
];

const selectedMode = ref('px-to-rem');

// Configuration
const rootFontSize = ref(16);
const parentFontSize = ref(16);
const viewportWidth = ref(1920);
const viewportHeight = ref(1080);
const percentageContext = ref('font-size');

// Input values
const pxValue = ref(16);
const remValue = ref(1);
const emValue = ref(1);
const vhValue = ref(1);
const ptValue = ref(12);
const inValue = ref(0.167);
const pcValue = ref(1);
const cmValue = ref(0.424);
const mmValue = ref(4.233);
const percentValue = ref(100);
const vwValue = ref(1);
const baseUnitValue = ref('1rem');
const baseToPxResult = ref(16);
const tailwindValue = ref('');
const tailwindClass = ref('');

// Table mode
const tableModes = [
  { label: 'PX to REM', value: 'px-to-rem' },
  { label: 'REM to PX', value: 'rem-to-px' },
  { label: 'PX to EM', value: 'px-to-em' },
  { label: 'PX to %', value: 'px-to-percent' },
  { label: 'PX to Tailwind', value: 'px-to-tailwind' }
];
const selectedTableMode = ref('px-to-rem');

// Tailwind spacing scale
const tailwindScale = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];

// Common breakpoints
const commonBreakpoints = [320, 375, 400, 425, 480, 700, 768, 960, 1024, 1280, 1366, 1440, 1600, 1920, 2560, 3840];

// Computed properties
const needsViewportWidth = computed(() => {
  return selectedMode.value.includes('vw') || selectedMode.value === 'px-to-vh';
});

const needsViewportHeight = computed(() => {
  return selectedMode.value === 'px-to-vh' || selectedMode.value === 'vh-to-vw';
});

const breakpointsTable = computed(() => {
  const testPx = pxValue.value || 192;
  return commonBreakpoints.map(bp => {
    return {
      px: bp,
      vw: parseFloat(((testPx / bp) * 100).toFixed(3))
    };
  });
});

// Conversion functions
const convertPxToRem = () => {
  if (pxValue.value && rootFontSize.value) {
    remValue.value = parseFloat((pxValue.value / rootFontSize.value).toFixed(4));
  }
};

const convertRemToPx = () => {
  if (remValue.value && rootFontSize.value) {
    pxValue.value = parseFloat((remValue.value * rootFontSize.value).toFixed(1));
  }
};

const convertPxToEm = () => {
  if (pxValue.value && parentFontSize.value) {
    emValue.value = parseFloat((pxValue.value / parentFontSize.value).toFixed(4));
  }
};

const convertEmToPx = () => {
  if (emValue.value && parentFontSize.value) {
    pxValue.value = parseFloat((emValue.value * parentFontSize.value).toFixed(1));
  }
};

const convertPxToPercent = () => {
  if (pxValue.value) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    percentValue.value = parseFloat(((pxValue.value / baseSize) * 100).toFixed(2));
  }
};

const convertPercentToPx = () => {
  if (percentValue.value) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    pxValue.value = parseFloat(((percentValue.value / 100) * baseSize).toFixed(1));
  }
};

const convertBaseToPx = () => {
  const value = baseUnitValue.value.trim();
  const remMatch = value.match(/^([\d.]+)\s*rem$/i);
  const emMatch = value.match(/^([\d.]+)\s*em$/i);
  const percentMatch = value.match(/^([\d.]+)\s*%$/);
  
  if (remMatch) {
    baseToPxResult.value = parseFloat((parseFloat(remMatch[1]) * rootFontSize.value).toFixed(1));
  } else if (emMatch) {
    baseToPxResult.value = parseFloat((parseFloat(emMatch[1]) * parentFontSize.value).toFixed(1));
  } else if (percentMatch) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    baseToPxResult.value = parseFloat(((parseFloat(percentMatch[1]) / 100) * baseSize).toFixed(1));
  } else {
    baseToPxResult.value = '';
  }
};

const convertPxToTailwind = () => {
  if (!pxValue.value || !rootFontSize.value) {
    tailwindValue.value = '';
    tailwindClass.value = '';
    return;
  }
  
  // Convert px to rem first
  const rem = pxValue.value / rootFontSize.value;
  // Convert rem to Tailwind units (each Tailwind unit = 0.25rem)
  const twUnits = rem / 0.25;
  
  // Find closest Tailwind value
  let closest = tailwindScale[0];
  let minDiff = Math.abs(twUnits - closest);
  
  for (const val of tailwindScale) {
    const diff = Math.abs(twUnits - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = val;
    }
  }
  
  tailwindValue.value = closest.toString();
  tailwindClass.value = `p-${closest}`;
};

// PX to VH conversions
const convertPxToVh = () => {
  if (pxValue.value && viewportHeight.value) {
    vhValue.value = parseFloat(((pxValue.value / viewportHeight.value) * 100).toFixed(4));
  }
};

const convertVhToPx = () => {
  if (vhValue.value && viewportHeight.value) {
    pxValue.value = parseFloat(((vhValue.value / 100) * viewportHeight.value).toFixed(1));
  }
};

// PX to PT conversions
const convertPxToPt = () => {
  if (pxValue.value) {
    ptValue.value = parseFloat((pxValue.value * 0.75).toFixed(2));
  }
};

const convertPtToPx = () => {
  if (ptValue.value) {
    pxValue.value = parseFloat((ptValue.value / 0.75).toFixed(1));
  }
};

// PX to IN conversions
const convertPxToIn = () => {
  if (pxValue.value) {
    inValue.value = parseFloat((pxValue.value / 96).toFixed(4));
  }
};

const convertInToPx = () => {
  if (inValue.value) {
    pxValue.value = parseFloat((inValue.value * 96).toFixed(1));
  }
};

// PX to PC conversions
const convertPxToPc = () => {
  if (pxValue.value) {
    pcValue.value = parseFloat((pxValue.value / 16).toFixed(4));
  }
};

const convertPcToPx = () => {
  if (pcValue.value) {
    pxValue.value = parseFloat((pcValue.value * 16).toFixed(1));
  }
};

// PX to CM conversions
const convertPxToCm = () => {
  if (pxValue.value) {
    cmValue.value = parseFloat((pxValue.value / 37.795).toFixed(4));
  }
};

const convertCmToPx = () => {
  if (cmValue.value) {
    pxValue.value = parseFloat((cmValue.value * 37.795).toFixed(1));
  }
};

// PX to MM conversions
const convertPxToMm = () => {
  if (pxValue.value) {
    mmValue.value = parseFloat((pxValue.value / 3.7795).toFixed(4));
  }
};

const convertMmToPx = () => {
  if (mmValue.value) {
    pxValue.value = parseFloat((mmValue.value * 3.7795).toFixed(1));
  }
};

// REM to VW conversions
const convertRemToVw = () => {
  if (remValue.value && rootFontSize.value && viewportWidth.value) {
    const px = remValue.value * rootFontSize.value;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToRem = () => {
  if (vwValue.value && rootFontSize.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    remValue.value = parseFloat((px / rootFontSize.value).toFixed(4));
  }
};

// EM to VW conversions
const convertEmToVw = () => {
  if (emValue.value && parentFontSize.value && viewportWidth.value) {
    const px = emValue.value * parentFontSize.value;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToEm = () => {
  if (vwValue.value && parentFontSize.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    emValue.value = parseFloat((px / parentFontSize.value).toFixed(4));
  }
};

// VH to VW conversions
const convertVhToVw = () => {
  if (vhValue.value && viewportHeight.value && viewportWidth.value) {
    vwValue.value = parseFloat(((vhValue.value / 100) * viewportHeight.value / viewportWidth.value * 100).toFixed(4));
  }
};

const convertVwToVh = () => {
  if (vwValue.value && viewportHeight.value && viewportWidth.value) {
    vhValue.value = parseFloat(((vwValue.value / 100) * viewportWidth.value / viewportHeight.value * 100).toFixed(4));
  }
};

// PT to VW conversions
const convertPtToVw = () => {
  if (ptValue.value && viewportWidth.value) {
    const px = ptValue.value / 0.75;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPt = () => {
  if (vwValue.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    ptValue.value = parseFloat((px * 0.75).toFixed(2));
  }
};

// IN to VW conversions
const convertInToVw = () => {
  if (inValue.value && viewportWidth.value) {
    const px = inValue.value * 96;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToIn = () => {
  if (vwValue.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    inValue.value = parseFloat((px / 96).toFixed(4));
  }
};

// PC to VW conversions
const convertPcToVw = () => {
  if (pcValue.value && viewportWidth.value) {
    const px = pcValue.value * 16;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPc = () => {
  if (vwValue.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    pcValue.value = parseFloat((px / 16).toFixed(4));
  }
};

// CM to VW conversions
const convertCmToVw = () => {
  if (cmValue.value && viewportWidth.value) {
    const px = cmValue.value * 37.795;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToCm = () => {
  if (vwValue.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    cmValue.value = parseFloat((px / 37.795).toFixed(4));
  }
};

// MM to VW conversions
const convertMmToVw = () => {
  if (mmValue.value && viewportWidth.value) {
    const px = mmValue.value * 3.7795;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToMm = () => {
  if (vwValue.value && viewportWidth.value) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    mmValue.value = parseFloat((px / 3.7795).toFixed(4));
  }
};

// Percentage to VW conversions
const convertPercentToVw = () => {
  if (percentValue.value && viewportWidth.value) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    const px = (percentValue.value / 100) * baseSize;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPercent = () => {
  if (vwValue.value && viewportWidth.value) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    const px = (vwValue.value / 100) * viewportWidth.value;
    percentValue.value = parseFloat(((px / baseSize) * 100).toFixed(2));
  }
};

// Generate conversion tables
const pxToRemTable = computed(() => {
  const table = [];
  for (let px = 1; px <= 100; px++) {
    const rem = parseFloat((px / rootFontSize.value).toFixed(4));
    table.push({
      px,
      rem,
      highlight: px === 4 || px === 8 || px === 16 || px === 24 || px === 32
    });
  }
  return table;
});

const remToPxTable = computed(() => {
  const table = [];
  const remValues = [0.01, 0.03, 0.05, 0.08, 0.1, 0.15, 0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 100];
  for (const rem of remValues) {
    const px = parseFloat((rem * rootFontSize.value).toFixed(1));
    table.push({
      rem,
      px,
      highlight: rem === 0.5 || rem === 1 || rem === 1.5 || rem === 2
    });
  }
  return table;
});

const pxToEmTable = computed(() => {
  const table = [];
  for (let px = 1; px <= 100; px++) {
    const em = parseFloat((px / parentFontSize.value).toFixed(4));
    table.push({
      px,
      em,
      highlight: px === 4 || px === 8 || px === 16 || px === 24 || px === 32
    });
  }
  return table;
});

const pxToPercentTable = computed(() => {
  const table = [];
  const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
  const pxValues = [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 50, 64, 72, 80, 96, 100];
  for (const px of pxValues) {
    const percent = parseFloat(((px / baseSize) * 100).toFixed(2));
    table.push({ px, percent });
  }
  return table;
});

const pxToTailwindTable = computed(() => {
  const table = [];
  const pxValues = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 128, 160, 192, 224, 256, 320, 384];
  for (const px of pxValues) {
    const rem = px / rootFontSize.value;
    const twUnits = rem / 0.25;
    let closest = tailwindScale[0];
    let minDiff = Math.abs(twUnits - closest);
    for (const val of tailwindScale) {
      const diff = Math.abs(twUnits - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = val;
      }
    }
    table.push({ px, tw: closest.toString() });
  }
  return table;
});

// Copy to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

// Watch for mode changes to reset values
watch(selectedMode, () => {
  pxValue.value = 16;
  remValue.value = 1;
  emValue.value = 1;
  vhValue.value = 1;
  ptValue.value = 12;
  inValue.value = 0.167;
  pcValue.value = 1;
  cmValue.value = 0.424;
  mmValue.value = 4.233;
  percentValue.value = 100;
  vwValue.value = 1;
  baseUnitValue.value = '1rem';
  tailwindValue.value = '';
  tailwindClass.value = '';
});

// Watch for configuration changes
watch([rootFontSize, parentFontSize, percentageContext, viewportWidth, viewportHeight], () => {
  if (selectedMode.value === 'px-to-rem') {
    convertPxToRem();
  } else if (selectedMode.value === 'px-to-em') {
    convertPxToEm();
  } else if (selectedMode.value === 'px-to-vh') {
    convertPxToVh();
  } else if (selectedMode.value === 'px-to-pt') {
    convertPxToPt();
  } else if (selectedMode.value === 'px-to-in') {
    convertPxToIn();
  } else if (selectedMode.value === 'px-to-pc') {
    convertPxToPc();
  } else if (selectedMode.value === 'px-to-cm') {
    convertPxToCm();
  } else if (selectedMode.value === 'px-to-mm') {
    convertPxToMm();
  } else if (selectedMode.value === 'px-to-percent') {
    convertPxToPercent();
  } else if (selectedMode.value === 'rem-to-vw') {
    convertRemToVw();
  } else if (selectedMode.value === 'em-to-vw') {
    convertEmToVw();
  } else if (selectedMode.value === 'vh-to-vw') {
    convertVhToVw();
  } else if (selectedMode.value === 'pt-to-vw') {
    convertPtToVw();
  } else if (selectedMode.value === 'in-to-vw') {
    convertInToVw();
  } else if (selectedMode.value === 'pc-to-vw') {
    convertPcToVw();
  } else if (selectedMode.value === 'cm-to-vw') {
    convertCmToVw();
  } else if (selectedMode.value === 'mm-to-vw') {
    convertMmToVw();
  } else if (selectedMode.value === 'percent-to-vw') {
    convertPercentToVw();
  } else if (selectedMode.value === 'base-to-px') {
    convertBaseToPx();
  } else if (selectedMode.value === 'px-to-tailwind') {
    convertPxToTailwind();
  }
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Initialize conversions based on selected mode
  if (selectedMode.value === 'px-to-rem') {
    convertPxToRem();
  } else if (selectedMode.value === 'px-to-em') {
    convertPxToEm();
  } else if (selectedMode.value === 'px-to-vh') {
    convertPxToVh();
  } else if (selectedMode.value === 'px-to-pt') {
    convertPxToPt();
  } else if (selectedMode.value === 'px-to-in') {
    convertPxToIn();
  } else if (selectedMode.value === 'px-to-pc') {
    convertPxToPc();
  } else if (selectedMode.value === 'px-to-cm') {
    convertPxToCm();
  } else if (selectedMode.value === 'px-to-mm') {
    convertPxToMm();
  } else if (selectedMode.value === 'px-to-percent') {
    convertPxToPercent();
  } else if (selectedMode.value === 'rem-to-vw') {
    convertRemToVw();
  } else if (selectedMode.value === 'em-to-vw') {
    convertEmToVw();
  } else if (selectedMode.value === 'vh-to-vw') {
    convertVhToVw();
  } else if (selectedMode.value === 'pt-to-vw') {
    convertPtToVw();
  } else if (selectedMode.value === 'in-to-vw') {
    convertInToVw();
  } else if (selectedMode.value === 'pc-to-vw') {
    convertPcToVw();
  } else if (selectedMode.value === 'cm-to-vw') {
    convertCmToVw();
  } else if (selectedMode.value === 'mm-to-vw') {
    convertMmToVw();
  } else if (selectedMode.value === 'percent-to-vw') {
    convertPercentToVw();
  } else if (selectedMode.value === 'base-to-px') {
    convertBaseToPx();
  } else if (selectedMode.value === 'px-to-tailwind') {
    convertPxToTailwind();
  }
  
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

