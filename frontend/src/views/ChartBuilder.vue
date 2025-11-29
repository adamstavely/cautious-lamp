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
                      Chart Builder
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create beautiful, customizable charts and graphs. Support for line, bar, pie, doughnut, scatter plots, and more.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">bar_chart</span>
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
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Chart representation -->
                      <rect x="30" y="120" width="20" height="50" rx="2" fill="url(#chartGradient)" opacity="0.7"/>
                      <rect x="60" y="100" width="20" height="70" rx="2" fill="url(#chartGradient)" opacity="0.7"/>
                      <rect x="90" y="80" width="20" height="90" rx="2" fill="url(#chartGradient)" opacity="0.7"/>
                      <rect x="120" y="110" width="20" height="60" rx="2" fill="url(#chartGradient)" opacity="0.7"/>
                      <rect x="150" y="90" width="20" height="80" rx="2" fill="url(#chartGradient)" opacity="0.7"/>
                      <!-- Line chart overlay -->
                      <path d="M 40 140 L 70 120 L 100 100 L 130 130 L 160 110" stroke="rgba(255,255,255,0.6)" stroke-width="3" fill="none" stroke-linecap="round"/>
                      <!-- Pie chart circle -->
                      <circle cx="100" cy="50" r="25" fill="url(#chartGradient)" opacity="0.4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Chart Type Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 
                @click="chartTypeSectionExpanded = !chartTypeSectionExpanded"
                class="text-lg font-semibold mb-6 flex items-center justify-between gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-600">show_chart</span>
                  Chart Type
                </div>
                <span 
                  class="material-symbols-outlined text-gray-500 transition-transform duration-200"
                  :class="chartTypeSectionExpanded ? 'rotate-180' : ''"
                >
                  expand_more
                </span>
              </h2>
              
              <transition name="slide-fade">
                <div v-show="chartTypeSectionExpanded" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  v-for="type in chartTypes"
                  :key="type.value"
                  @click="selectedChartType = type.value"
                  class="rounded-lg border p-4 transition-all text-left"
                  :class="selectedChartType === type.value
                    ? (isDarkMode 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-indigo-600 border-indigo-500 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 border-gray-700 text-gray-300 hover:border-indigo-400' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500')"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined text-2xl">{{ type.icon }}</span>
                    <span class="font-semibold">{{ type.label }}</span>
                  </div>
                  <p class="text-xs opacity-80">{{ type.description }}</p>
                </button>
              </div>
              </transition>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Chart Configuration -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6 sticky top-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">tune</span>
                    Configuration
                  </h2>

                  <!-- Chart Title (Required) -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Chart Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="chartConfig.title"
                      type="text"
                      placeholder="Enter chart title"
                      required
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? (chartConfig.title ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-800 border-red-500 text-white placeholder-gray-500')
                        : (chartConfig.title ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white border-red-500 text-gray-900 placeholder-gray-400')"
                    />
                    <p v-if="!chartConfig.title" class="mt-1 text-xs text-red-500">Chart title is required for accessibility compliance.</p>
                  </div>

                  <!-- Chart Summary (Required) -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Chart Summary <span class="text-red-500">*</span>
                      <span class="text-xs font-normal text-gray-500 ml-1">(1-2 sentences)</span>
                    </label>
                    <textarea
                      v-model="chartConfig.summary"
                      rows="2"
                      placeholder="Enter a brief summary describing what this chart shows"
                      required
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                      :class="isDarkMode 
                        ? (chartConfig.summary ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-800 border-red-500 text-white placeholder-gray-500')
                        : (chartConfig.summary ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white border-red-500 text-gray-900 placeholder-gray-400')"
                    ></textarea>
                    <p v-if="!chartConfig.summary" class="mt-1 text-xs text-red-500">Chart summary is required for accessibility compliance.</p>
                  </div>

                  <!-- Key Insight (Required) -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Key Insight <span class="text-red-500">*</span>
                      <span class="text-xs font-normal text-gray-500 ml-1">(Primary takeaway)</span>
                    </label>
                    <div class="space-y-2">
                      <textarea
                        v-model="chartConfig.keyInsight"
                        rows="2"
                        placeholder="Enter the primary insight or takeaway from this chart"
                        required
                        class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                        :class="isDarkMode 
                          ? (chartConfig.keyInsight ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' : 'bg-slate-800 border-red-500 text-white placeholder-gray-500')
                          : (chartConfig.keyInsight ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-white border-red-500 text-gray-900 placeholder-gray-400')"
                      ></textarea>
                      <button
                        v-if="generatedInsights.primary"
                        @click="chartConfig.keyInsight = generatedInsights.primary"
                        type="button"
                        class="text-xs px-3 py-1.5 rounded-lg border border-dashed transition-colors flex items-center gap-1"
                        :class="isDarkMode 
                          ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-900/20' 
                          : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'"
                      >
                        <span class="material-symbols-outlined text-sm">auto_awesome</span>
                        Use suggested: "{{ generatedInsights.primary }}"
                      </button>
                      <p v-if="!chartConfig.keyInsight" class="mt-1 text-xs text-red-500">Key insight is required for accessibility compliance.</p>
                    </div>
                  </div>

                  <!-- Multi-Dataset Input (for stacked/grouped/combo/multi-line) -->
                  <div v-if="selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo' || selectedChartType === 'line'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Datasets
                    </label>
                    <div class="space-y-4">
                      <div 
                        v-for="(dataset, datasetIndex) in multiDatasetData"
                        :key="datasetIndex"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <input
                            v-model="dataset.label"
                            type="text"
                            placeholder="Dataset Label"
                            class="flex-1 px-3 py-1.5 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <button
                            @click="removeDataset(datasetIndex)"
                            class="ml-2 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            :disabled="multiDatasetData.length <= 1"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                        <div class="space-y-2">
                          <div 
                            v-for="(item, itemIndex) in dataset.data"
                            :key="itemIndex"
                            class="flex gap-2"
                          >
                            <input
                              v-model="item.label"
                              type="text"
                              placeholder="Label"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model.number="item.value"
                              type="number"
                              placeholder="Value"
                              class="w-20 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <button
                              @click="removeMultiDataItem(datasetIndex, itemIndex)"
                              class="px-1.5 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              :disabled="dataset.data.length <= 1"
                            >
                              <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <button
                            @click="addMultiDataItem(datasetIndex)"
                            class="w-full px-2 py-1.5 rounded border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-xs align-middle mr-1">add</span>
                            Add Point
                          </button>
                        </div>
                      </div>
                      <button
                        @click="addDataset"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Dataset
                      </button>
                    </div>
                  </div>

                  <!-- Gauge Chart Input -->
                  <div v-else-if="selectedChartType === 'gauge'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Gauge Settings
                    </label>
                    <div class="space-y-2">
                      <div class="flex gap-2">
                        <input
                          v-model.number="gaugeData.value"
                          type="number"
                          placeholder="Value"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="gaugeData.min"
                          type="number"
                          placeholder="Min"
                          class="w-24 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="gaugeData.max"
                          type="number"
                          placeholder="Max"
                          class="w-24 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="gaugeData.target"
                          type="number"
                          placeholder="Target"
                          class="w-24 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Waterfall Chart Input -->
                  <div v-else-if="selectedChartType === 'waterfall'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Waterfall Data
                    </label>
                    <div class="space-y-2">
                      <div class="flex gap-2">
                        <label class="text-xs self-center w-16" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Base:</label>
                        <input
                          v-model.number="waterfallData.base"
                          type="number"
                          placeholder="Base Value"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                      </div>
                      <div 
                        v-for="(change, index) in waterfallData.changes"
                        :key="index"
                        class="flex gap-2"
                      >
                        <input
                          v-model="change.label"
                          type="text"
                          placeholder="Label"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="change.value"
                          type="number"
                          placeholder="Change"
                          class="w-32 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <button
                          @click="waterfallData.changes.splice(index, 1)"
                          class="px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          :disabled="waterfallData.changes.length <= 1"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <button
                        @click="waterfallData.changes.push({ label: `Change ${waterfallData.changes.length + 1}`, value: 0 })"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Change
                      </button>
                    </div>
                  </div>

                  <!-- Candlestick Chart Input -->
                  <div v-else-if="selectedChartType === 'candlestick'" class="mb-4">
                    <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      OHLC Data
                    </label>
                    <div class="space-y-3">
                      <!-- Header Row -->
                      <div class="grid grid-cols-12 gap-2 text-xs font-semibold px-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <div class="col-span-3">Date</div>
                        <div class="col-span-2">Open</div>
                        <div class="col-span-2">High</div>
                        <div class="col-span-2">Low</div>
                        <div class="col-span-2">Close</div>
                        <div class="col-span-1"></div>
                      </div>
                      
                      <!-- Data Rows -->
                      <div 
                        v-for="(item, index) in candlestickData"
                        :key="index"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="grid grid-cols-12 gap-2 items-center">
                          <input
                            v-model="item.date"
                            type="date"
                            class="col-span-3 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'"
                          />
                          <input
                            v-model.number="item.open"
                            type="number"
                            placeholder="Open"
                            step="0.01"
                            class="col-span-2 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <input
                            v-model.number="item.high"
                            type="number"
                            placeholder="High"
                            step="0.01"
                            class="col-span-2 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <input
                            v-model.number="item.low"
                            type="number"
                            placeholder="Low"
                            step="0.01"
                            class="col-span-2 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <input
                            v-model.number="item.close"
                            type="number"
                            placeholder="Close"
                            step="0.01"
                            class="col-span-2 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <button
                            @click="candlestickData.splice(index, 1)"
                            class="col-span-1 px-2 py-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
                            :disabled="candlestickData.length <= 1"
                            title="Remove row"
                          >
                            <span class="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      <button
                        @click="candlestickData.push({ date: new Date().toISOString().split('T')[0], open: 100, high: 110, low: 95, close: 105 })"
                        class="w-full px-4 py-2.5 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Candlestick
                      </button>
                    </div>
                  </div>

                  <!-- Heatmap Chart Input -->
                  <div v-else-if="selectedChartType === 'heatmap'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Heatmap Matrix
                    </label>
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Rows:</label>
                        <input
                          :value="heatmapData.rows.join(',')"
                          @input="heatmapData.rows = $event.target.value.split(',').map(r => r.trim()).filter(r => r)"
                          type="text"
                          placeholder="Mon, Tue, Wed, Thu, Fri"
                          class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                      </div>
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Columns:</label>
                        <input
                          :value="heatmapData.columns.join(',')"
                          @input="heatmapData.columns = $event.target.value.split(',').map(c => c.trim()).filter(c => c)"
                          type="text"
                          placeholder="Week 1, Week 2, Week 3, Week 4"
                          class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          <thead>
                            <tr>
                              <th class="px-2 py-1 text-left"></th>
                              <th v-for="(col, colIndex) in heatmapData.columns" :key="colIndex" class="px-2 py-1 text-center border" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                                {{ col }}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(row, rowIndex) in heatmapData.rows" :key="rowIndex">
                              <td class="px-2 py-1 font-medium border" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">{{ row }}</td>
                              <td v-for="(col, colIndex) in heatmapData.columns" :key="colIndex" class="px-2 py-1 border" :class="isDarkMode ? 'border-gray-600 bg-slate-800' : 'border-gray-300 bg-white'">
                                <input
                                  v-model.number="heatmapData.values[rowIndex][colIndex]"
                                  type="number"
                                  class="w-full px-1 py-0.5 text-center rounded border-0 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  :class="isDarkMode 
                                    ? 'bg-slate-700 text-white' 
                                    : 'bg-gray-50 text-gray-900'"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Treemap Chart Input -->
                  <div v-else-if="selectedChartType === 'treemap'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Hierarchical Data
                    </label>
                    <div class="space-y-2 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <p>Treemap uses hierarchical data structure. Edit the data structure in the code or use sample data.</p>
                      <div class="p-3 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                        <div class="font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Root: {{ treemapData.name }} ({{ treemapData.value }})</div>
                        <div v-for="(child, index) in treemapData.children" :key="index" class="ml-4 mt-1">
                          <div class="font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ child.name }} ({{ child.value }})</div>
                          <div v-for="(grandchild, gIndex) in child.children" :key="gIndex" class="ml-4 text-xs">
                            {{ grandchild.name }} ({{ grandchild.value }})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Sankey Diagram Input -->
                  <div v-else-if="selectedChartType === 'sankey'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Flow Data
                    </label>
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Nodes:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(node, index) in sankeyData.nodes"
                            :key="index"
                            class="flex gap-2"
                          >
                            <input
                              v-model="node.id"
                              type="text"
                              placeholder="Node ID"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <input
                              v-model="node.label"
                              type="text"
                              placeholder="Label"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <button
                              @click="sankeyData.nodes.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              :disabled="sankeyData.nodes.length <= 2"
                            >
                              <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <button
                            @click="sankeyData.nodes.push({ id: `Node${sankeyData.nodes.length + 1}`, label: `Node ${sankeyData.nodes.length + 1}` })"
                            class="w-full px-3 py-1.5 rounded border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-xs align-middle mr-1">add</span>
                            Add Node
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Links:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(link, index) in sankeyData.links"
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
                              <option v-for="node in sankeyData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                            </select>
                            <span class="self-center text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">→</span>
                            <select
                              v-model="link.target"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option v-for="node in sankeyData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
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
                              @click="sankeyData.links.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <button
                            @click="sankeyData.links.push({ source: sankeyData.nodes[0]?.id || '', target: sankeyData.nodes[1]?.id || '', value: 10 })"
                            class="w-full px-3 py-1.5 rounded border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-xs align-middle mr-1">add</span>
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Funnel Chart Input -->
                  <div v-else-if="selectedChartType === 'funnel'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Funnel Stages
                    </label>
                    <div class="space-y-2">
                      <div 
                        v-for="(item, index) in funnelData"
                        :key="index"
                        class="flex gap-2"
                      >
                        <input
                          v-model="item.label"
                          type="text"
                          placeholder="Stage Label"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="item.value"
                          type="number"
                          placeholder="Value"
                          class="w-32 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <button
                          @click="funnelData.splice(index, 1)"
                          class="px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          :disabled="funnelData.length <= 1"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <button
                        @click="funnelData.push({ label: `Stage ${funnelData.length + 1}`, value: 0 })"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Stage
                      </button>
                    </div>
                  </div>

                  <!-- Choropleth Map Input -->

                  <!-- Bullet Graph Input -->
                  <div v-else-if="selectedChartType === 'bulletGraph'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Bullet Items
                    </label>
                    <div class="space-y-3">
                      <div 
                        v-for="(item, index) in bulletGraphData"
                        :key="index"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <input
                            v-model="item.label"
                            type="text"
                            placeholder="Item label"
                            class="flex-1 px-3 py-1.5 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <button
                            @click="bulletGraphData.splice(index, 1)"
                            class="ml-2 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            :disabled="bulletGraphData.length <= 1"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Value</label>
                            <input
                              v-model.number="item.value"
                              type="number"
                              class="w-full px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            />
                          </div>
                          <div>
                            <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Target</label>
                            <input
                              v-model.number="item.target"
                              type="number"
                              class="w-full px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            />
                          </div>
                          <div>
                            <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Max</label>
                            <input
                              v-model.number="item.max"
                              type="number"
                              class="w-full px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            />
                          </div>
                          <div>
                            <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Good Range</label>
                            <input
                              v-model.number="item.ranges.good"
                              type="number"
                              class="w-full px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        @click="bulletGraphData.push({ label: `Item ${bulletGraphData.length + 1}`, value: 50, target: 60, max: 100, ranges: { poor: 0, fair: 30, good: 60, excellent: 80 } })"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Bullet Item
                      </button>
                    </div>
                  </div>

                  <!-- Chord Diagram Input -->
                  <div v-else-if="selectedChartType === 'chordDiagram'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Relationship Data
                    </label>
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Entities:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(node, index) in chordDiagramData.nodes"
                            :key="index"
                            class="flex gap-2"
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
                              placeholder="Entity name"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                            />
                            <button
                              @click="chordDiagramData.nodes.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              :disabled="chordDiagramData.nodes.length <= 2"
                            >
                              <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <button
                            @click="chordDiagramData.nodes.push({ id: `Entity${chordDiagramData.nodes.length + 1}`, label: `Entity ${chordDiagramData.nodes.length + 1}` })"
                            class="w-full px-3 py-1.5 rounded border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-xs align-middle mr-1">add</span>
                            Add Entity
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="text-xs mb-1 block" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Relationships:</label>
                        <div class="space-y-2">
                          <div 
                            v-for="(link, index) in chordDiagramData.links"
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
                              <option v-for="node in chordDiagramData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                            </select>
                            <span class="self-center text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">↔</span>
                            <select
                              v-model="link.target"
                              class="flex-1 px-2 py-1.5 rounded border text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option v-for="node in chordDiagramData.nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
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
                              @click="chordDiagramData.links.splice(index, 1)"
                              class="px-2 py-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <button
                            @click="chordDiagramData.links.push({ source: chordDiagramData.nodes[0]?.id || '', target: chordDiagramData.nodes[1]?.id || '', value: 10 })"
                            class="w-full px-3 py-1.5 rounded border border-dashed text-xs font-medium transition-colors"
                            :class="isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                              : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                          >
                            <span class="material-symbols-outlined text-xs align-middle mr-1">add</span>
                            Add Relationship
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Single Dataset Input -->
                  <div v-else class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Data
                    </label>
                    <div class="space-y-2">
                      <div 
                        v-for="(item, index) in chartData"
                        :key="index"
                        class="flex gap-2"
                      >
                        <input
                          v-model="item.label"
                          type="text"
                          placeholder="Label"
                          class="flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <input
                          v-model.number="item.value"
                          type="number"
                          placeholder="Value"
                          class="w-24 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                        <button
                          @click="removeDataItem(index)"
                          class="px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          :disabled="chartData.length <= 1"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <button
                        @click="addDataItem"
                        class="w-full px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-400' 
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-1">add</span>
                        Add Data Point
                      </button>
                    </div>
                  </div>

                  <!-- Color Scheme -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Color Scheme
                    </label>
                    <Dropdown
                      v-model="chartConfig.colorScheme"
                      :options="colorSchemeOptions"
                      :is-dark-mode="isDarkMode"
                      @update:modelValue="initializeCustomColors"
                    />
                  </div>

                  <!-- Custom Colors - Always show when custom is selected, or show for all schemes -->
                  <div v-if="chartConfig.colorScheme === 'custom' || getDataForColors().length > 0" class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ chartConfig.colorScheme === 'custom' ? 'Custom Colors' : 'Chart Colors' }}
                      </label>
                      <button
                        v-if="chartConfig.colorScheme !== 'custom'"
                        @click="chartConfig.colorScheme = 'custom'; initializeCustomColors()"
                        class="text-xs px-2 py-1 rounded text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        Customize
                      </button>
                    </div>
                    <div v-if="chartConfig.colorScheme === 'custom'" class="space-y-2 max-h-64 overflow-y-auto">
                      <div 
                        v-for="(item, index) in getDataForColors()"
                        :key="index"
                        class="flex items-center gap-2"
                      >
                        <span class="text-xs w-24 truncate" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ item.label || `Item ${index + 1}` }}
                        </span>
                        <input
                          v-model="customColors[index]"
                          type="color"
                          class="w-12 h-8 rounded border cursor-pointer flex-shrink-0"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        />
                        <input
                          v-model="customColors[index]"
                          type="text"
                          placeholder="#6366f1"
                          class="flex-1 px-2 py-1.5 rounded border text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                        />
                      </div>
                      <div v-if="getDataForColors().length === 0" class="text-xs text-center py-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                        Add data points to customize colors
                      </div>
                    </div>
                    <div v-else class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Using {{ chartConfig.colorScheme }} color scheme. Click "Customize" to set individual colors.
                    </div>
                  </div>

                  <!-- Show Legend -->
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="chartConfig.showLegend"
                        type="checkbox"
                        class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Show Legend
                      </span>
                    </label>
                  </div>

                  <!-- Axis Labels (only for charts with scales) -->
                  <div v-if="selectedChartType !== 'pie' && selectedChartType !== 'doughnut' && selectedChartType !== 'polar' && selectedChartType !== 'gauge'" class="mb-4 space-y-3">
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        X Axis Label
                      </label>
                      <input
                        v-model="chartConfig.xAxisLabel"
                        type="text"
                        placeholder="Enter X axis label"
                        class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Y Axis Label
                      </label>
                      <input
                        v-model="chartConfig.yAxisLabel"
                        type="text"
                        placeholder="Enter Y axis label"
                        class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <!-- Motion Controls -->
                  <div class="mb-4 space-y-3 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <h3 class="text-sm font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-indigo-600">accessibility</span>
                      Motion & Animation Controls
                    </h3>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="chartConfig.reduceMotion"
                        type="checkbox"
                        class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Reduce Motion
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="chartConfig.pauseAnimation"
                        type="checkbox"
                        class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Pause Animation
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="chartConfig.disableAutoUpdate"
                        type="checkbox"
                        class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Disable Auto-Update
                      </span>
                    </label>
                  </div>

                  <!-- Secondary Encoding (Color Independence) -->
                  <div v-if="selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo' || selectedChartType === 'line' || selectedChartType === 'pie' || selectedChartType === 'doughnut' || selectedChartType === 'polar'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Secondary Encoding
                      <span v-if="colorOnlyEncoding" class="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      v-model="chartConfig.secondaryEncoding"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? (colorOnlyEncoding ? 'bg-slate-800 border-red-500 text-white' : 'bg-slate-800 border-gray-600 text-white')
                        : (colorOnlyEncoding ? 'bg-white border-red-500 text-gray-900' : 'bg-white border-gray-300 text-gray-900')"
                    >
                      <option value="none">None</option>
                      <option value="shape">Shape Patterns</option>
                      <option value="pattern">Pattern Fills</option>
                      <option value="lineStyle">Line Styles</option>
                      <option value="icon">Icon Labels</option>
                      <option value="text">Text Labels</option>
                    </select>
                    <p v-if="colorOnlyEncoding" class="mt-1 text-xs text-red-500">
                      This chart relies solely on color to communicate meaning. Add a second visual channel to continue.
                    </p>
                  </div>

                  <!-- Data Unit -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Data Unit (Optional)
                    </label>
                    <input
                      v-model="chartConfig.dataUnit"
                      type="text"
                      placeholder="e.g., %, $, kg"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                    />
                  </div>

                  <!-- Accessibility Scoring Panel -->
                  <div class="mb-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        <span class="material-symbols-outlined text-indigo-600">verified</span>
                        Accessibility Score
                      </h3>
                      <div class="flex items-center gap-2">
                        <span 
                          class="text-lg font-bold"
                          :class="accessibilityScore >= 100 
                            ? 'text-green-600' 
                            : accessibilityScore >= 70 
                              ? 'text-yellow-600' 
                              : 'text-red-600'"
                        >
                          {{ accessibilityScore }}%
                        </span>
                      </div>
                    </div>
                    
                    <div class="space-y-2 text-xs">
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Alt Text</span>
                        <span :class="chartConfig.title && chartConfig.summary && chartConfig.keyInsight ? 'text-green-600' : 'text-red-500'">
                          <span class="material-symbols-outlined text-sm">{{ chartConfig.title && chartConfig.summary && chartConfig.keyInsight ? 'check_circle' : 'error' }}</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Color Independence</span>
                        <span :class="!colorOnlyEncoding ? 'text-green-600' : 'text-red-500'">
                          <span class="material-symbols-outlined text-sm">{{ !colorOnlyEncoding ? 'check_circle' : 'error' }}</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Contrast</span>
                        <span :class="contrastIssues.length === 0 ? 'text-green-600' : 'text-red-500'">
                          <span class="material-symbols-outlined text-sm">{{ contrastIssues.length === 0 ? 'check_circle' : 'error' }}</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Keyboard Navigation</span>
                        <span class="text-green-600">
                          <span class="material-symbols-outlined text-sm">check_circle</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Screen Reader</span>
                        <span class="text-green-600">
                          <span class="material-symbols-outlined text-sm">check_circle</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Motion Safety</span>
                        <span :class="chartConfig.reduceMotion || chartConfig.pauseAnimation ? 'text-green-600' : 'text-yellow-500'">
                          <span class="material-symbols-outlined text-sm">{{ chartConfig.reduceMotion || chartConfig.pauseAnimation ? 'check_circle' : 'warning' }}</span>
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Zoom Integrity</span>
                        <span :class="zoomIssues.length === 0 ? 'text-green-600' : 'text-yellow-500'">
                          <span class="material-symbols-outlined text-sm">{{ zoomIssues.length === 0 ? 'check_circle' : 'warning' }}</span>
                        </span>
                      </div>
                    </div>

                    <!-- Fix It Guidance -->
                    <div v-if="accessibilityScore < 100" class="mt-3 p-3 rounded-lg" :class="isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'">
                      <h4 class="text-xs font-semibold mb-2 flex items-center gap-1" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-800'">
                        <span class="material-symbols-outlined text-sm">info</span>
                        Fix Required
                      </h4>
                      <ul class="space-y-1 text-xs" :class="isDarkMode ? 'text-yellow-200' : 'text-yellow-700'">
                        <li v-if="!chartConfig.title || !chartConfig.summary || !chartConfig.keyInsight">
                          • Add required metadata: title, summary, and key insight
                        </li>
                        <li v-if="colorOnlyEncoding">
                          • Add secondary encoding (shape, pattern, line style, icon, or text labels)
                        </li>
                        <li v-if="contrastIssues.length > 0">
                          • Fix contrast issues: {{ contrastIssues.length }} color(s) below WCAG AA minimum
                        </li>
                        <li v-if="zoomIssues.length > 0">
                          • Zoom/Scaling warnings: {{ zoomIssues.join('; ') }}
                        </li>
                      </ul>
                    </div>

                    <!-- Run axe-core Scan Button -->
                    <button
                      @click="runAxeCoreScan"
                      :disabled="axeScanRunning"
                      class="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (axeScanRunning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                        : (axeScanRunning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white')"
                    >
                      <span v-if="axeScanRunning" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                      <span v-else class="material-symbols-outlined text-sm">bug_report</span>
                      {{ axeScanRunning ? 'Scanning...' : 'Run Accessibility Check' }}
                    </button>
                    
                    <!-- axe-core Results -->
                    <div v-if="axeScanResults" class="mt-3 space-y-2">
                      <div v-if="axeScanResults.error" class="p-2 rounded text-xs bg-yellow-900/30 text-yellow-300 border border-yellow-700">
                        <div class="font-semibold">Scan Error</div>
                        <div class="mt-1">{{ axeScanResults.error }}</div>
                      </div>
                      <div 
                        v-for="(violation, index) in axeScanResults.violations"
                        :key="index"
                        class="p-2 rounded text-xs border"
                        :class="isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-200'"
                      >
                        <div class="font-semibold flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm">{{ violation.impact === 'critical' ? 'error' : 'warning' }}</span>
                          {{ violation.id }} ({{ violation.impact || 'moderate' }})
                        </div>
                        <div class="mt-1">{{ violation.description }}</div>
                        <div class="mt-1 text-xs opacity-80">{{ violation.help }}</div>
                        <div v-if="violation.nodes && violation.nodes.length > 0" class="mt-2 text-xs opacity-70">
                          Found in {{ violation.nodes.length }} element(s)
                        </div>
                      </div>
                      <div v-if="axeScanResults.violations && axeScanResults.violations.length === 0 && !axeScanResults.error" class="p-2 rounded text-xs text-green-600 border border-green-200" :class="isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50'">
                        <div class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm">check_circle</span>
                          No accessibility violations found!
                        </div>
                      </div>
                      <div v-if="axeScanResults.passes && axeScanResults.passes.length > 0" class="mt-2 text-xs opacity-60" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ axeScanResults.passes.length }} accessibility check(s) passed
                      </div>
                    </div>
                  </div>

                  <!-- Export Buttons -->
                  <div class="space-y-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <button
                      @click="exportChart('html')"
                      :disabled="!canExport"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (canExport ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                        : (canExport ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                    >
                      <span class="material-symbols-outlined text-lg">html</span>
                      Export as HTML
                    </button>
                    <button
                      @click="exportChart('png')"
                      :disabled="!canExport"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (canExport ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                        : (canExport ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                    >
                      <span class="material-symbols-outlined text-lg">download</span>
                      Export as PNG
                    </button>
                    <button
                      @click="exportChart('json')"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    >
                      <span class="material-symbols-outlined text-lg">code</span>
                      Export Config (JSON)
                    </button>
                    <button
                      @click="exportChart('pdf')"
                      :disabled="!canExport"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (canExport ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                        : (canExport ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                    >
                      <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
                      Export as PDF
                    </button>
                    <button
                      @click="exportChart('ppt')"
                      :disabled="!canExport"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (canExport ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                        : (canExport ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                    >
                      <span class="material-symbols-outlined text-lg">slideshow</span>
                      Export as PPT
                    </button>
                    <button
                      @click="exportChart('word')"
                      :disabled="!canExport"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? (canExport ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed')
                        : (canExport ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                    >
                      <span class="material-symbols-outlined text-lg">description</span>
                      Export as Word
                    </button>
                    <p v-if="accessibilityScore < 100" class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Accessibility score: {{ accessibilityScore }}%. Export will show warnings but is allowed.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Chart Preview -->
              <div class="lg:col-span-2">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-indigo-600">preview</span>
                      Preview
                    </h2>
                    <div class="flex items-center gap-2">
                      <button
                        @click="loadSampleData"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Load Sample Data
                      </button>
                    </div>
                  </div>

                  <div class="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                    <figure 
                      class="w-full" 
                      style="max-width: 100%; height: 400px;"
                      role="img"
                      :aria-label="chartConfig.title || 'Chart'"
                      :aria-describedby="`chart-summary-${chartKey} chart-data-table-${chartKey}`"
                      tabindex="0"
                      @keydown="handleChartKeyboard"
                      @focus="chartFocused = true"
                      @blur="chartFocused = false"
                      :class="chartFocused ? 'ring-2 ring-indigo-500 ring-offset-2' : ''"
                    >
                      <div class="w-full h-full">
                        <LineChart
                        v-if="selectedChartType === 'line' || selectedChartType === 'area'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <BarChart
                        v-else-if="selectedChartType === 'bar' || selectedChartType === 'horizontalBar' || selectedChartType === 'stackedBar' || selectedChartType === 'groupedBar' || selectedChartType === 'combo'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <PieChart
                        v-else-if="selectedChartType === 'pie'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <DoughnutChart
                        v-else-if="selectedChartType === 'doughnut'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <ScatterChart
                        v-else-if="selectedChartType === 'scatter'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="scatterDataForDisplay"
                        :options="chartOptions"
                      />
                      <RadarChart
                        v-else-if="selectedChartType === 'radar'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <BubbleChart
                        v-else-if="selectedChartType === 'bubble'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="bubbleDataForDisplay"
                        :options="chartOptions"
                      />
                      <PolarAreaChart
                        v-else-if="selectedChartType === 'polar'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <DoughnutChart
                        v-else-if="selectedChartType === 'gauge'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <BarChart
                        v-else-if="selectedChartType === 'waterfall' || selectedChartType === 'funnel'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <Chart
                        v-else-if="selectedChartType === 'candlestick'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        type="candlestick"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <Chart
                        v-else-if="selectedChartType === 'heatmap'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        type="matrix"
                        :data="chartDataForDisplay"
                        :options="chartOptions"
                      />
                      <!-- Custom SVG Treemap -->
                      <div
                        v-else-if="selectedChartType === 'treemap'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        class="w-full h-full"
                      >
                        <TreemapSVG :data="treemapData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                      </div>
                      <!-- Custom SVG Sankey -->
                      <div
                        v-else-if="selectedChartType === 'sankey'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        class="w-full h-full"
                      >
                        <SankeySVG :data="sankeyData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                      </div>
                      <!-- Custom SVG Bullet Graph -->
                      <div
                        v-else-if="selectedChartType === 'bulletGraph'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        class="w-full h-full"
                      >
                        <BulletGraphSVG :data="bulletGraphData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                      </div>
                      <!-- Custom SVG Chord Diagram -->
                      <div
                        v-else-if="selectedChartType === 'chordDiagram'"
                        :key="`chart-${selectedChartType}-${chartKey}`"
                        class="w-full h-full"
                      >
                        <ChordDiagramSVG :data="chordDiagramData" :colors="colorSchemes[chartConfig.colorScheme] || colorSchemes.default" />
                      </div>
                      </div>
                      <figcaption :id="`chart-summary-${chartKey}`" class="sr-only">
                        {{ chartConfig.summary || 'Chart visualization' }}
                      </figcaption>
                    </figure>
                  </div>

                  <!-- Data Table -->
                  <div class="mt-6">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        <span class="material-symbols-outlined text-indigo-600">table_chart</span>
                        Data Table
                      </h3>
                      <button
                        @click="dataTableVisible = !dataTableVisible"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                        :aria-expanded="dataTableVisible"
                        aria-controls="chart-data-table"
                      >
                        <span class="material-symbol-outlined text-sm">{{ dataTableVisible ? 'expand_less' : 'expand_more' }}</span>
                        {{ dataTableVisible ? 'Hide' : 'Show' }} Table
                      </button>
                    </div>
                    <div 
                      v-show="dataTableVisible"
                      id="chart-data-table"
                      :id="`chart-data-table-${chartKey}`"
                      class="overflow-x-auto"
                    >
                      <table class="w-full border-collapse text-sm" role="table">
                        <thead>
                          <tr>
                            <th 
                              v-for="(header, index) in dataTableHeaders"
                              :key="index"
                              scope="col"
                              class="px-4 py-2 text-left border-b font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              :class="isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'"
                              @click="toggleDataTableSort(header.key)"
                              @keydown.enter="toggleDataTableSort(header.key)"
                              tabindex="0"
                              :aria-sort="dataTableSortColumn === header.key ? (dataTableSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                            >
                              <div class="flex items-center gap-2">
                                {{ header.label }}
                                <span v-if="dataTableSortColumn === header.key" class="material-symbols-outlined text-xs">
                                  {{ dataTableSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                                </span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr 
                            v-for="(row, rowIndex) in sortedDataTable"
                            :key="rowIndex"
                            class="border-b"
                            :class="isDarkMode ? 'border-gray-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50'"
                          >
                            <td 
                              v-for="(header, colIndex) in dataTableHeaders"
                              :key="colIndex"
                              class="px-4 py-2"
                              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                            >
                              {{ typeof row[header.key] === 'number' ? row[header.key].toLocaleString() : row[header.key] }}
                              <span v-if="header.key === 'value' && chartConfig.dataUnit" class="text-xs text-gray-500 ml-1">
                                {{ chartConfig.dataUnit }}
                              </span>
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
        </div>
      </div>
    </div>
    
    <!-- Screen Reader Announcements -->
    <div id="chart-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, h } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import { calculateContrast } from '../composables/useContrast.js';
import axe from 'axe-core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line as LineChart, Bar as BarChart, Pie as PieChart, Doughnut as DoughnutChart, Scatter as ScatterChart, Radar as RadarChart, Bubble as BubbleChart, PolarArea as PolarAreaChart, Chart } from 'vue-chartjs';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
// Map utilities removed - maps moved to MapMaker.vue
// import { loadTopoJSON, getGeoJSONFeatures, mapDataToFeatures, getFeatureCentroid, getDefaultMapUrls } from '../utils/mapData.js';
// import { createProjection, createPathGenerator, projectCoordinates } from '../utils/mapProjections.js';

// Helper function to draw the color scale legend
function drawLegend(ctx, x, y, width, height, options, chartArea) {
  // Draw gradient background
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (options.colors && options.colors.length > 0) {
    options.colors.forEach((color, index) => {
      gradient.addColorStop(index / (options.colors.length - 1), color);
    });
  }
  
  // Draw gradient rectangle
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Draw border
  ctx.strokeStyle = options.gridColor || '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Draw min/max labels
  ctx.fillStyle = options.textColor || '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(options.min.toFixed(1), x, y + height + 5);
  ctx.textAlign = 'right';
  ctx.fillText(options.max.toFixed(1), x + width, y + height + 5);
}

// Custom color scale legend plugin for heatmaps
const colorScaleLegendPlugin = {
  id: 'colorScaleLegend',
  afterDraw: (chart) => {
    try {
      // Check chart type - try multiple ways to detect matrix chart
      const chartType = chart.config?.type || chart.chart?.config?.type || chart.type;
      if (chartType !== 'matrix') {
        return;
      }
      
      const ctx = chart.ctx;
      if (!ctx) return;
      
      const chartArea = chart.chartArea;
      if (!chartArea) return;
      
      const options = chart.options?.plugins?.colorScaleLegend;
      if (!options || !options.show) return;
      
      // Get canvas dimensions to ensure we draw within bounds
      const canvas = ctx.canvas;
      const canvasHeight = canvas.height;
      
      const legendHeight = 30;
      const legendWidth = 200;
      const labelHeight = 15;
      const totalHeight = legendHeight + labelHeight + 5;
      
      // Center horizontally, position below chart area
      const legendX = (chartArea.left + chartArea.right - legendWidth) / 2;
      const legendY = chartArea.bottom + 20;
      
      // Ensure legend is within canvas bounds
      if (legendY + totalHeight > canvasHeight) {
        // If not enough space below, position above chart
        const newY = chartArea.top - totalHeight - 20;
        if (newY >= 0) {
          drawLegend(ctx, legendX, newY, legendWidth, legendHeight, options, chartArea);
        }
      } else {
        drawLegend(ctx, legendX, legendY, legendWidth, legendHeight, options, chartArea);
      }
    } catch (error) {
      console.error('Error drawing color scale legend:', error);
    }
  }
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  CandlestickController,
  CandlestickElement,
  MatrixController,
  MatrixElement,
  colorScaleLegendPlugin
);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();

const selectedChartType = ref('line');
const chartTypeSectionExpanded = ref(true);
const chartKey = ref(0);
const chartData = ref([
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 56 },
  { label: 'Jun', value: 55 }
]);

// Multi-dataset support for stacked/grouped/combo charts
const multiDatasetData = ref([
  {
    label: 'Dataset 1',
    data: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 }
    ]
  },
  {
    label: 'Dataset 2',
    data: [
      { label: 'Jan', value: 45 },
      { label: 'Feb', value: 49 },
      { label: 'Mar', value: 60 },
      { label: 'Apr', value: 71 }
    ]
  }
]);

// Gauge chart data
const gaugeData = ref({
  value: 75,
  min: 0,
  max: 100,
  target: 80
});

// Waterfall chart data
const waterfallData = ref({
  base: 100,
  changes: [
    { label: 'Q1', value: 20 },
    { label: 'Q2', value: -10 },
    { label: 'Q3', value: 30 },
    { label: 'Q4', value: -5 }
  ]
});

// Candlestick chart data (OHLC)
const candlestickData = ref([
  { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
  { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
  { date: '2024-01-03', open: 112, high: 120, low: 108, close: 115 },
  { date: '2024-01-04', open: 115, high: 118, low: 110, close: 113 }
]);

// Heatmap data (matrix)
const heatmapData = ref({
  rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  columns: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  values: [
    [10, 20, 30, 40],
    [15, 25, 35, 45],
    [20, 30, 40, 50],
    [25, 35, 45, 55],
    [30, 40, 50, 60]
  ]
});

// Funnel chart data
const funnelData = ref([
  { label: 'Visitors', value: 1000 },
  { label: 'Leads', value: 500 },
  { label: 'Qualified', value: 250 },
  { label: 'Proposals', value: 100 },
  { label: 'Closed', value: 50 }
]);

// Treemap chart data (hierarchical)
const treemapData = ref({
  name: 'Root',
  value: 100,
  children: [
    { name: 'Category A', value: 40, children: [
      { name: 'Item A1', value: 20 },
      { name: 'Item A2', value: 20 }
    ]},
    { name: 'Category B', value: 35, children: [
      { name: 'Item B1', value: 15 },
      { name: 'Item B2', value: 20 }
    ]},
    { name: 'Category C', value: 25, children: [
      { name: 'Item C1', value: 25 }
    ]}
  ]
});

// Sankey diagram data
const sankeyData = ref({
  nodes: [
    { id: 'Source1', label: 'Source 1' },
    { id: 'Source2', label: 'Source 2' },
    { id: 'Process1', label: 'Process 1' },
    { id: 'Process2', label: 'Process 2' },
    { id: 'Target1', label: 'Target 1' },
    { id: 'Target2', label: 'Target 2' }
  ],
  links: [
    { source: 'Source1', target: 'Process1', value: 30 },
    { source: 'Source1', target: 'Process2', value: 20 },
    { source: 'Source2', target: 'Process1', value: 25 },
    { source: 'Source2', target: 'Process2', value: 15 },
    { source: 'Process1', target: 'Target1', value: 40 },
    { source: 'Process1', target: 'Target2', value: 15 },
    { source: 'Process2', target: 'Target1', value: 20 },
    { source: 'Process2', target: 'Target2', value: 15 }
  ]
});


// Bullet graph data
const bulletGraphData = ref([
  { label: 'Revenue', value: 75, target: 80, max: 100, ranges: { poor: 0, fair: 50, good: 75, excellent: 90 } },
  { label: 'Profit', value: 60, target: 70, max: 100, ranges: { poor: 0, fair: 40, good: 60, excellent: 85 } },
  { label: 'Growth', value: 85, target: 90, max: 100, ranges: { poor: 0, fair: 60, good: 80, excellent: 95 } }
]);

// Chord diagram data
const chordDiagramData = ref({
  nodes: [
    { id: 'A', label: 'Category A' },
    { id: 'B', label: 'Category B' },
    { id: 'C', label: 'Category C' },
    { id: 'D', label: 'Category D' }
  ],
  links: [
    { source: 'A', target: 'B', value: 30 },
    { source: 'A', target: 'C', value: 20 },
    { source: 'B', target: 'D', value: 25 },
    { source: 'C', target: 'D', value: 15 }
  ]
});

const chartConfig = ref({
  title: 'My Chart',
  summary: '',
  keyInsight: '',
  colorScheme: 'default',
  showLegend: true,
  xAxisLabel: '',
  yAxisLabel: '',
  // Accessibility settings
  reduceMotion: false,
  pauseAnimation: false,
  disableAutoUpdate: false,
  // Secondary encoding for color independence
  secondaryEncoding: 'none', // 'none', 'shape', 'pattern', 'lineStyle', 'icon', 'text'
  // Units for data table
  dataUnit: ''
});

// Custom colors for individual data points
const customColors = ref([]);

// Get data items for color customization
const getDataForColors = () => {
  const chartType = selectedChartType.value;
  
  // For multi-dataset charts, use first dataset
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length > 0 && multiDatasetData.value[0].data.length > 0) {
      return multiDatasetData.value[0].data;
    }
    return [];
  }
  
  // For single dataset charts
  if (chartData.value && chartData.value.length > 0) {
    return chartData.value;
  }
  
  return [];
};

// Initialize custom colors array
const initializeCustomColors = () => {
  if (chartConfig.value.colorScheme !== 'custom') {
    return;
  }
  
  const dataItems = getDataForColors();
  const defaultColors = colorSchemes.default;
  
  // Initialize or resize customColors array
  while (customColors.value.length < dataItems.length) {
    const colorIndex = customColors.value.length % defaultColors.length;
    customColors.value.push(defaultColors[colorIndex]);
  }
  
  // Trim if too long
  if (customColors.value.length > dataItems.length) {
    customColors.value = customColors.value.slice(0, dataItems.length);
  }
};

// Auto-Generated Insight Engine
const generatedInsights = computed(() => {
  const chartType = selectedChartType.value;
  let values = [];
  let labels = [];
  
  // Extract values based on chart type
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    // For multi-dataset, analyze all datasets
    multiDatasetData.value.forEach(dataset => {
      dataset.data.forEach(item => {
        values.push(item.value);
        labels.push(item.label);
      });
    });
  } else if (chartType === 'gauge') {
    values = [gaugeData.value.value];
    labels = ['Value'];
  } else if (chartType === 'waterfall') {
    values = [waterfallData.value.base, ...waterfallData.value.changes.map(c => c.value)];
    labels = ['Base', ...waterfallData.value.changes.map(c => c.label)];
  } else if (chartType === 'funnel') {
    values = funnelData.value.map(item => item.value);
    labels = funnelData.value.map(item => item.label);
  } else if (chartType === 'choropleth') {
    // Maps moved to MapMaker.vue
    values = [];
    labels = [];
  } else if (chartType === 'flowMap') {
    // Maps moved to MapMaker.vue
    values = [];
    labels = [];
  } else if (chartType === 'bulletGraph') {
    values = bulletGraphData.value.map(item => item.value);
    labels = bulletGraphData.value.map(item => item.label);
  } else if (chartType === 'chordDiagram') {
    values = chordDiagramData.value.links.map(link => link.value);
    labels = chordDiagramData.value.links.map(link => {
      const sourceNode = chordDiagramData.value.nodes.find(n => n.id === link.source);
      const targetNode = chordDiagramData.value.nodes.find(n => n.id === link.target);
      return `${sourceNode?.label || link.source} ↔ ${targetNode?.label || link.target}`;
    });
  } else if (chartData.value && chartData.value.length > 0) {
    values = chartData.value.map(item => item.value);
    labels = chartData.value.map(item => item.label);
  }
  
  if (values.length === 0) {
    return {
      max: null,
      min: null,
      trend: null,
      outliers: [],
      primary: null
    };
  }
  
  // Calculate max and min
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);
  const maxLabel = labels[maxIndex] || '';
  const minLabel = labels[minIndex] || '';
  
  // Trend analysis (up/down/flat)
  let trend = 'flat';
  if (values.length >= 2) {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
  }
  
  // Outlier detection (values more than 2 standard deviations from mean)
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const outliers = values
    .map((val, idx) => ({ value: val, label: labels[idx], index: idx }))
    .filter(item => Math.abs(item.value - mean) > 2 * stdDev);
  
  // Generate primary insight
  let primary = '';
  if (trend === 'up') {
    primary = `Data shows an upward trend, with ${maxLabel} reaching the highest value of ${maxValue}`;
  } else if (trend === 'down') {
    primary = `Data shows a downward trend, with ${minLabel} at the lowest value of ${minValue}`;
  } else {
    primary = `${maxLabel} has the highest value of ${maxValue}, while ${minLabel} has the lowest value of ${minValue}`;
  }
  
  if (outliers.length > 0) {
    primary += `. Notable outliers detected: ${outliers.map(o => o.label).join(', ')}`;
  }
  
  return {
    max: { value: maxValue, label: maxLabel },
    min: { value: minValue, label: minLabel },
    trend,
    outliers,
    primary
  };
});

// Validation functions
const validationErrors = computed(() => {
  const errors = [];
  
  // Required metadata fields
  if (!chartConfig.value.title || chartConfig.value.title.trim() === '') {
    errors.push({ field: 'title', message: 'Chart title is required' });
  }
  if (!chartConfig.value.summary || chartConfig.value.summary.trim() === '') {
    errors.push({ field: 'summary', message: 'Chart summary is required' });
  }
  if (!chartConfig.value.keyInsight || chartConfig.value.keyInsight.trim() === '') {
    errors.push({ field: 'keyInsight', message: 'Key insight is required' });
  }
  
  // Data validation
  const chartType = selectedChartType.value;
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length === 0 || multiDatasetData.value.some(d => d.data.length === 0)) {
      errors.push({ field: 'data', message: 'Chart data cannot be empty' });
    }
  } else if (chartData.value.length === 0) {
    errors.push({ field: 'data', message: 'Chart data cannot be empty' });
  }
  
  return errors;
});

// Color-Independent Encoding Check
const colorOnlyEncoding = computed(() => {
  const chartType = selectedChartType.value;
  
  // Only applies to charts with multiple series
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    if (multiDatasetData.value.length > 1 && chartConfig.value.secondaryEncoding === 'none') {
      return true;
    }
  } else if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar') {
    // Pie charts with multiple slices need secondary encoding if more than 3-4 slices
    const dataLength = chartData.value.length;
    if (dataLength > 4 && chartConfig.value.secondaryEncoding === 'none') {
      return true;
    }
  }
  
  return false;
});

// Contrast Checking
const contrastIssues = computed(() => {
  const issues = [];
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  // Background color (white or dark based on theme)
  const bgColor = isDarkMode.value ? '#0f172a' : '#ffffff';
  
  // Check each color against background
  colors.forEach((color, index) => {
    const contrast = calculateContrast(color, bgColor);
    if (contrast) {
      // Text needs 4.5:1, graphical objects need 3:1
      if (contrast.ratio < 4.5) {
        issues.push({
          element: `Color ${index + 1} (${color})`,
          ratio: contrast.ratio,
          required: 4.5,
          type: 'text'
        });
      } else if (contrast.ratio < 3) {
        issues.push({
          element: `Color ${index + 1} (${color})`,
          ratio: contrast.ratio,
          required: 3,
          type: 'graphical'
        });
      }
    }
  });
  
  return issues;
});

// Zoom and Scaling Validation
const zoomIssues = computed(() => {
  const issues = [];
  
  // Check if chart would work at 200% zoom
  // This is a simplified check - in a real implementation, you'd render at 200% and check for clipping
  const chartType = selectedChartType.value;
  
  // Check for potential label overlap issues
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const totalDataPoints = multiDatasetData.value.reduce((sum, dataset) => sum + dataset.data.length, 0);
    if (totalDataPoints > 20) {
      issues.push('High number of data points may cause label overlap at 200% zoom');
    }
  } else if (chartData.value.length > 15) {
    issues.push('High number of data points may cause label overlap at 200% zoom');
  }
  
  // Check for long labels that might truncate
  const hasLongLabels = chartData.value.some(item => item.label && item.label.length > 20);
  if (hasLongLabels) {
    issues.push('Long labels may truncate at 200% zoom or on mobile viewports');
  }
  
  // Check legend visibility
  if (chartConfig.value.showLegend && chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar') {
    if (chartData.value.length > 8) {
      issues.push('Legend with many items may be truncated on mobile viewports');
    }
  }
  
  return issues;
});

// Accessibility Score (0-100%)
const accessibilityScore = computed(() => {
  let score = 0;
  let maxScore = 0;
  
  // Alt Text (required fields) - 20 points
  maxScore += 20;
  if (chartConfig.value.title && chartConfig.value.title.trim() !== '') score += 7;
  if (chartConfig.value.summary && chartConfig.value.summary.trim() !== '') score += 7;
  if (chartConfig.value.keyInsight && chartConfig.value.keyInsight.trim() !== '') score += 6;
  
  // Color Independence - 15 points
  maxScore += 15;
  if (!colorOnlyEncoding.value) score += 15;
  
  // Contrast - 20 points
  maxScore += 20;
  if (contrastIssues.value.length === 0) score += 20;
  else {
    const passingColors = (chartConfig.value.colorScheme === 'custom' ? customColors.value.length : 6) - contrastIssues.value.length;
    const totalColors = chartConfig.value.colorScheme === 'custom' ? customColors.value.length : 6;
    score += (passingColors / totalColors) * 20;
  }
  
  // Keyboard Navigation - 15 points (will be checked dynamically)
  maxScore += 15;
  score += 15; // Assume implemented
  
  // Screen Reader (ARIA) - 15 points (will be checked dynamically)
  maxScore += 15;
  score += 15; // Assume implemented
  
  // Motion Safety - 10 points
  maxScore += 10;
  if (chartConfig.value.reduceMotion || chartConfig.value.pauseAnimation) score += 10;
  
  // Zoom Integrity - 5 points
  maxScore += 5;
  if (zoomIssues.value.length === 0) score += 5;
  else score += 2; // Partial credit if warnings but not critical failures
  
  return Math.round((score / maxScore) * 100);
});

// Data Table Generation
const dataTableVisible = ref(false);
const dataTableSortColumn = ref(null);
const dataTableSortDirection = ref('asc');
const chartFocused = ref(false);
const currentDataPointIndex = ref(0);

const generateDataTable = () => {
  const chartType = selectedChartType.value;
  let tableData = [];
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    // Multi-dataset table
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    tableData = labels.map((label, labelIndex) => {
      const row = { label };
      multiDatasetData.value.forEach((dataset, datasetIndex) => {
        const value = dataset.data[labelIndex]?.value || 0;
        row[dataset.label] = value;
      });
      return row;
    });
  } else if (chartType === 'gauge') {
    tableData = [{ label: 'Value', value: gaugeData.value.value, min: gaugeData.value.min, max: gaugeData.value.max, target: gaugeData.value.target }];
  } else if (chartType === 'waterfall') {
    tableData = [
      { label: 'Base', value: waterfallData.value.base },
      ...waterfallData.value.changes.map(c => ({ label: c.label, value: c.value })),
      { label: 'Total', value: waterfallData.value.base + waterfallData.value.changes.reduce((sum, c) => sum + c.value, 0) }
    ];
  } else if (chartType === 'funnel') {
    tableData = funnelData.value.map(item => ({ label: item.label, value: item.value }));
  } else if (chartType === 'choropleth') {
    // Maps moved to MapMaker.vue
    tableData = [];
  } else if (chartType === 'flowMap') {
    // Maps moved to MapMaker.vue
    tableData = [];
  } else if (chartType === 'bulletGraph') {
    tableData = bulletGraphData.value.map(item => ({
      label: item.label,
      value: item.value,
      target: item.target,
      max: item.max,
      'poor range': `0-${item.ranges.fair}`,
      'fair range': `${item.ranges.fair}-${item.ranges.good}`,
      'good range': `${item.ranges.good}-${item.ranges.excellent}`
    }));
  } else if (chartType === 'chordDiagram') {
    tableData = chordDiagramData.value.links.map(link => {
      const sourceNode = chordDiagramData.value.nodes.find(n => n.id === link.source);
      const targetNode = chordDiagramData.value.nodes.find(n => n.id === link.target);
      return {
        label: `${sourceNode?.label || link.source} ↔ ${targetNode?.label || link.target}`,
        value: link.value
      };
    });
  } else if (chartData.value && chartData.value.length > 0) {
    tableData = chartData.value.map(item => ({ label: item.label, value: item.value }));
  }
  
  return tableData;
};

const sortedDataTable = computed(() => {
  const data = generateDataTable();
  if (!dataTableSortColumn.value || data.length === 0) return data;
  
  const sorted = [...data].sort((a, b) => {
    const aVal = a[dataTableSortColumn.value];
    const bVal = b[dataTableSortColumn.value];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dataTableSortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    if (dataTableSortDirection.value === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });
  
  return sorted;
});

const toggleDataTableSort = (column) => {
  if (dataTableSortColumn.value === column) {
    dataTableSortDirection.value = dataTableSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    dataTableSortColumn.value = column;
    dataTableSortDirection.value = 'asc';
  }
};

const dataTableHeaders = computed(() => {
  const chartType = selectedChartType.value;
  const headers = [{ key: 'label', label: 'Label' }];
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    multiDatasetData.value.forEach(dataset => {
      headers.push({ 
        key: dataset.label, 
        label: `${dataset.label}${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` 
      });
    });
  } else if (chartType === 'gauge') {
    headers.push(
      { key: 'value', label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'min', label: `Min${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'max', label: `Max${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'target', label: `Target${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` }
    );
  } else if (chartType === 'bulletGraph') {
    headers.push(
      { key: 'value', label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'target', label: `Target${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'max', label: `Max${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` },
      { key: 'poor range', label: 'Poor Range' },
      { key: 'fair range', label: 'Fair Range' },
      { key: 'good range', label: 'Good Range' }
    );
  } else {
    headers.push({ 
      key: 'value', 
      label: `Value${chartConfig.value.dataUnit ? ` (${chartConfig.value.dataUnit})` : ''}` 
    });
  }
  
  return headers;
});

// Keyboard Navigation Handler
const handleChartKeyboard = (event) => {
  const chartType = selectedChartType.value;
  let dataLength = 0;
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    dataLength = multiDatasetData.value[0]?.data.length || 0;
  } else {
    dataLength = chartData.value.length;
  }
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      currentDataPointIndex.value = Math.min(currentDataPointIndex.value + 1, dataLength - 1);
      // Announce data point to screen reader
      announceDataPoint(currentDataPointIndex.value);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      currentDataPointIndex.value = Math.max(currentDataPointIndex.value - 1, 0);
      announceDataPoint(currentDataPointIndex.value);
      break;
    case 'Enter':
      event.preventDefault();
      // Select/focus current data point
      announceDataPoint(currentDataPointIndex.value, true);
      break;
    case 'Escape':
      event.preventDefault();
      chartFocused.value = false;
      event.target.blur();
      break;
    case ' ':
      event.preventDefault();
      // Toggle legend
      chartConfig.value.showLegend = !chartConfig.value.showLegend;
      break;
  }
};

const announceDataPoint = (index, select = false) => {
  const chartType = selectedChartType.value;
  let label = '';
  let value = '';
  
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    label = labels[index] || '';
    const datasets = multiDatasetData.value.map(d => {
      const val = d.data[index]?.value || 0;
      return `${d.label}: ${val}`;
    });
    value = datasets.join(', ');
  } else {
    label = chartData.value[index]?.label || '';
    value = chartData.value[index]?.value || 0;
  }
  
  // Create live region announcement
  const announcement = select 
    ? `Selected: ${label}, ${value}${chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : ''}`
    : `${label}, ${value}${chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : ''}`;
  
  // Use aria-live region for screen reader announcement
  const liveRegion = document.getElementById('chart-announcements');
  if (liveRegion) {
    liveRegion.textContent = announcement;
  }
};

const canExport = computed(() => {
  // Allow export regardless of accessibility status
  // Warnings will still be shown in the accessibility panel
  return true;
});

// axe-core Integration
const axeScanRunning = ref(false);
const axeScanResults = ref(null);

// Generate data table HTML for export
const generateDataTableHTMLHeaders = () => {
  const headers = dataTableHeaders.value;
  return headers.map(h => `<th scope="col" style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">${h.label}</th>`).join('\n                        ');
};

const generateDataTableHTMLRows = () => {
  const data = generateDataTable();
  return data.map(row => {
    const cells = dataTableHeaders.value.map(header => {
      const value = typeof row[header.key] === 'number' 
        ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
        : row[header.key];
      return `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${value}</td>`;
    }).join('\n                            ');
    return `<tr>\n                            ${cells}\n                        </tr>`;
  }).join('\n                    ');
};

const runAxeCoreScan = async () => {
  axeScanRunning.value = true;
  axeScanResults.value = null;
  
  try {
    // Wait for next tick to ensure DOM is updated and chart is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the chart preview container (the parent div that contains the chart)
    // This includes the figure element and potentially the data table
    const previewSection = document.querySelector('.lg\\:col-span-2 .rounded-lg.shadow-sm.border');
    const chartContainer = document.querySelector('figure[role="img"]');
    
    // Use the preview section if available, otherwise fall back to chart container
    const scanTarget = previewSection || chartContainer;
    
    if (!scanTarget) {
      axeScanResults.value = {
        violations: [{
          id: 'scan-error',
          description: 'Chart container not found. Please ensure the chart is rendered.',
          help: 'Try refreshing the page or reloading the chart data.',
          impact: 'critical'
        }],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
      return;
    }
    
    // Run axe-core scan on the entire preview section
    // This will catch issues with the chart, data table, and surrounding elements
    const results = await axe.run(scanTarget, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
      },
      rules: {
        'color-contrast': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'image-alt': { enabled: true },
        'aria-label': { enabled: true },
        'aria-labelledby': { enabled: true },
        'button-name': { enabled: true },
        'keyboard': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'focusable-content': { enabled: true },
        'document-title': { enabled: false }, // Disable document-level checks
        'html-has-lang': { enabled: false },
        'html-lang-valid': { enabled: false },
        'page-has-heading-one': { enabled: false },
        'landmark-one-main': { enabled: false }
      }
    });
    
    console.log('axe-core scan results:', results);
    axeScanResults.value = results;
  } catch (error) {
    console.error('axe-core scan error:', error);
    axeScanResults.value = {
      violations: [{
        id: 'scan-error',
        description: `Error running accessibility scan: ${error.message}`,
        help: 'Please check the browser console for more details.',
        impact: 'critical'
      }],
      passes: [],
      incomplete: [],
      inapplicable: [],
      error: error.message
    };
  } finally {
    axeScanRunning.value = false;
  }
};

const chartTypes = [
  { value: 'line', label: 'Line Graph', icon: 'show_chart', description: 'Display trends over time (supports multiple lines)' },
  { value: 'area', label: 'Area Chart', icon: 'area_chart', description: 'Filled line chart showing cumulative values' },
  { value: 'bar', label: 'Bar Graph', icon: 'bar_chart', description: 'Compare categories' },
  { value: 'horizontalBar', label: 'Horizontal Bar', icon: 'horizontal_rule', description: 'Bar chart rotated horizontally' },
  { value: 'stackedBar', label: 'Stacked Bar', icon: 'stacked_bar_chart', description: 'Multiple datasets stacked vertically' },
  { value: 'groupedBar', label: 'Grouped Bar', icon: 'grouped_bar_chart', description: 'Multiple datasets side by side' },
  { value: 'combo', label: 'Combo Chart', icon: 'multiline_chart', description: 'Mix of bar and line charts' },
  { value: 'gauge', label: 'Gauge Chart', icon: 'speed', description: 'Single metric with min/max/target' },
  { value: 'waterfall', label: 'Waterfall Chart', icon: 'waterfall_chart', description: 'Shows cumulative changes' },
  { value: 'candlestick', label: 'Candlestick', icon: 'candlestick_chart', description: 'Financial OHLC data' },
  { value: 'heatmap', label: 'Heatmap', icon: 'grid_on', description: 'Matrix visualization' },
  { value: 'funnel', label: 'Funnel Chart', icon: 'filter_alt', description: 'Conversion funnel stages' },
  { value: 'treemap', label: 'Treemap', icon: 'account_tree', description: 'Hierarchical data visualization' },
  { value: 'sankey', label: 'Sankey Diagram', icon: 'timeline', description: 'Flow diagram showing connections' },
  { value: 'pie', label: 'Pie Chart', icon: 'pie_chart', description: 'Show proportions' },
  { value: 'doughnut', label: 'Doughnut Chart', icon: 'donut_large', description: 'Pie chart with center' },
  { value: 'scatter', label: 'Scatter Plot', icon: 'scatter_plot', description: 'Correlation analysis' },
  { value: 'radar', label: 'Radar Chart', icon: 'insights', description: 'Multi-dimensional data' },
  { value: 'bubble', label: 'Bubble Chart', icon: 'bubble_chart', description: 'Three variables' },
  { value: 'polar', label: 'Polar Area', icon: 'pie_chart', description: 'Circular segments' },
  { value: 'bulletGraph', label: 'Bullet Graph', icon: 'track_changes', description: 'Horizontal bars with targets and ranges' },
  { value: 'chordDiagram', label: 'Chord Diagram', icon: 'hub', description: 'Circular diagram showing relationships' }
];

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
  { value: 'orange', label: 'Orange' },
  { value: 'custom', label: 'Custom Colors' }
];

const chartDataForDisplay = computed(() => {
  // Use custom colors if custom scheme is selected, otherwise use predefined scheme
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  const chartType = selectedChartType.value;
  
  // Handle gauge chart (custom doughnut-based)
  if (chartType === 'gauge') {
    const value = gaugeData.value.value;
    const min = gaugeData.value.min;
    const max = gaugeData.value.max;
    const target = gaugeData.value.target;
    const range = max - min;
    const valuePercent = ((value - min) / range) * 100;
    const targetPercent = ((target - min) / range) * 100;
    const remaining = 100 - valuePercent;
    
    return {
      labels: ['Value', 'Remaining'],
      datasets: [{
        data: [valuePercent, remaining],
        backgroundColor: [colors[0], '#e5e7eb'],
        borderWidth: 0
      }]
    };
  }
  
  // Handle waterfall chart
  if (chartType === 'waterfall') {
    const base = waterfallData.value.base;
    const changes = waterfallData.value.changes;
    const labels = ['Base', ...changes.map(c => c.label), 'Total'];
    const values = [base];
    let runningTotal = base;
    
    changes.forEach(change => {
      runningTotal += change.value;
      values.push(runningTotal);
    });
    
    const data = [];
    const backgroundColors = [];
    data.push(base);
    backgroundColors.push(colors[0]);
    
    changes.forEach((change, index) => {
      data.push(change.value);
      backgroundColors.push(change.value >= 0 ? colors[1] : colors[2]);
    });
    
    data.push(runningTotal);
    backgroundColors.push(colors[0]);
    
    return {
      labels,
      datasets: [{
        label: chartConfig.value.title || 'Waterfall',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 2
      }]
    };
  }
  
  // Handle candlestick chart
  if (chartType === 'candlestick') {
    return {
      labels: candlestickData.value.map(item => item.date),
      datasets: [{
        label: chartConfig.value.title || 'OHLC',
        data: candlestickData.value.map((item, index) => ({
          x: index,
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close
        }))
      }]
    };
  }
  
  // Handle heatmap
  if (chartType === 'heatmap') {
    const data = [];
    heatmapData.value.rows.forEach((row, rowIndex) => {
      heatmapData.value.columns.forEach((col, colIndex) => {
        if (heatmapData.value.values[rowIndex] && heatmapData.value.values[rowIndex][colIndex] !== undefined) {
          data.push({
            x: colIndex,
            y: rowIndex,
            v: heatmapData.value.values[rowIndex][colIndex],
            w: 1,
            h: 1
          });
        }
      });
    });
    
    const allValues = heatmapData.value.values.flat().filter(v => v !== undefined);
    const max = allValues.length > 0 ? Math.max(...allValues) : 0;
    const min = allValues.length > 0 ? Math.min(...allValues) : 0;
    const numColumns = heatmapData.value.columns.length;
    const numRows = heatmapData.value.rows.length;
    
    return {
      datasets: [{
        label: chartConfig.value.title || 'Heatmap',
        data,
        borderWidth: 0,
        borderColor: 'transparent',
        // Set width and height as dataset-level functions to fill cells
        width: ({ chart }) => {
          const chartArea = chart.chartArea || {};
          const availableWidth = chartArea.right - chartArea.left;
          return availableWidth / numColumns;
        },
        height: ({ chart }) => {
          const chartArea = chart.chartArea || {};
          const availableHeight = chartArea.bottom - chartArea.top;
          return availableHeight / numRows;
        },
        backgroundColor: (ctx) => {
          const value = ctx.raw.v;
          if (allValues.length === 0) return colors[0];
          if (max === min) return colors[0];
          const ratio = (value - min) / (max - min);
          return colors[Math.floor(ratio * (colors.length - 1))];
        }
      }]
    };
  }
  
  // Handle funnel chart
  if (chartType === 'funnel') {
    const maxValue = Math.max(...funnelData.value.map(item => item.value));
    return {
      labels: funnelData.value.map(item => item.label),
      datasets: [{
        label: chartConfig.value.title || 'Funnel',
        data: funnelData.value.map(item => item.value),
        backgroundColor: colors.slice(0, funnelData.value.length),
        borderColor: colors.slice(0, funnelData.value.length),
        borderWidth: 2
      }]
    };
  }
  
  // Handle treemap (will use custom SVG rendering)
  if (chartType === 'treemap') {
    return { type: 'treemap', data: treemapData.value };
  }
  
  // Handle sankey (will use custom SVG rendering)
  if (chartType === 'sankey') {
    return { type: 'sankey', data: sankeyData.value };
  }
  
  // Handle choropleth map - MOVED TO MapMaker.vue
  if (chartType === 'choropleth') {
    return { type: 'choropleth', data: [] };
  }
  
  // Handle flow map - MOVED TO MapMaker.vue
  if (chartType === 'flowMap') {
    return { type: 'flowMap', data: { nodes: [], links: [] } };
  }
  
  // Handle bullet graph (will use custom SVG rendering)
  if (chartType === 'bulletGraph') {
    return { type: 'bulletGraph', data: bulletGraphData.value };
  }
  
  // Handle chord diagram (will use custom SVG rendering)
  if (chartType === 'chordDiagram') {
    return { type: 'chordDiagram', data: chordDiagramData.value };
  }
  
  // Handle multi-dataset charts (stacked, grouped, combo, multi-line)
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
    const datasets = multiDatasetData.value.map((dataset, index) => {
      const isLine = chartType === 'combo' && index === multiDatasetData.value.length - 1;
      const isMultiLine = chartType === 'line';
      return {
        label: dataset.label,
        data: dataset.data.map(item => item.value),
        backgroundColor: isLine || isMultiLine ? 'transparent' : (colors[index % colors.length] + '80'),
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        type: isLine ? 'line' : (isMultiLine ? 'line' : 'bar'),
        fill: isMultiLine ? false : (isLine ? false : undefined),
        tension: isMultiLine ? 0.4 : undefined // Smooth curves for multi-line
      };
    });
    
    return { labels, datasets };
  }
  
  // Handle area chart
  if (chartType === 'area') {
    return {
      labels: chartData.value.map(item => item.label),
      datasets: [{
        label: chartConfig.value.title || 'Dataset',
        data: chartData.value.map(item => item.value),
        backgroundColor: colors[0] + '80',
        borderColor: colors[0],
        borderWidth: 2,
        fill: true
      }]
    };
  }
  
  // Handle single dataset charts
  return {
    labels: chartData.value.map(item => item.label),
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map(item => item.value),
      backgroundColor: chartType === 'line' || chartType === 'bar' || chartType === 'radar' || chartType === 'horizontalBar'
        ? colors[0] + '80'
        : colors.slice(0, chartData.value.length),
      borderColor: chartType === 'line' || chartType === 'bar' || chartType === 'radar' || chartType === 'horizontalBar'
        ? colors[0]
        : colors.slice(0, chartData.value.length),
      borderWidth: 2,
      fill: chartType === 'line' ? false : undefined
    }]
  };
});

const scatterDataForDisplay = computed(() => {
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  return {
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map((item, index) => ({
        x: index,
        y: item.value
      })),
      backgroundColor: colors[0] + '80',
      borderColor: colors[0],
      borderWidth: 2
    }]
  };
});

const bubbleDataForDisplay = computed(() => {
  const colors = chartConfig.value.colorScheme === 'custom' 
    ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
    : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
  
  return {
    datasets: [{
      label: chartConfig.value.title || 'Dataset',
      data: chartData.value.map((item, index) => ({
        x: index,
        y: item.value,
        r: Math.abs(item.value) / 5 + 5
      })),
      backgroundColor: colors[0] + '80',
      borderColor: colors[0],
      borderWidth: 2
    }]
  };
});

const chartOptions = computed(() => {
  const isDark = isDarkMode.value;
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const chartType = selectedChartType.value;
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldReduceMotion = chartConfig.value.reduceMotion || prefersReducedMotion || chartConfig.value.pauseAnimation;
  
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: shouldReduceMotion ? false : {
      duration: chartConfig.value.pauseAnimation ? 0 : 1000,
      easing: 'easeInOut'
    },
    transitions: shouldReduceMotion ? {
      active: {
        animation: {
          duration: 0
        }
      }
    } : undefined,
    plugins: {
      title: {
        display: !!chartConfig.value.title,
        text: chartConfig.value.title,
        color: textColor,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      legend: {
        display: chartConfig.value.showLegend,
        position: 'top',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 15
        },
        onClick: (e, legendItem) => {
          // Make legend keyboard accessible - toggle on click
          const index = legendItem.datasetIndex;
          const chart = e.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        animation: shouldReduceMotion ? false : undefined
      }
    }
  };
  
  // Charts without scales (pie, doughnut, polar, gauge)
  if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar' || chartType === 'gauge') {
    if (chartType === 'gauge') {
      return {
        ...baseOptions,
        cutout: '75%',
        circumference: 270,
        rotation: 225
      };
    }
    return baseOptions;
  }
  
  // Candlestick chart options
  if (chartType === 'candlestick') {
    return {
      ...baseOptions,
      scales: {
        x: {
          type: 'category',
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Date',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          type: 'linear',
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Price',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Heatmap options
  if (chartType === 'heatmap') {
    const allValues = heatmapData.value.values.flat().filter(v => v !== undefined);
    const max = allValues.length > 0 ? Math.max(...allValues) : 0;
    const min = allValues.length > 0 ? Math.min(...allValues) : 0;
    const colors = chartConfig.value.colorScheme === 'custom' 
      ? (customColors.value.length > 0 ? customColors.value : colorSchemes.default)
      : (colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default);
    
    return {
      ...baseOptions,
      layout: {
        padding: {
          bottom: chartConfig.value.showLegend ? 60 : 0 // Reserve space for legend below chart
        }
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          display: false // Disable default legend for matrix charts
        },
        colorScaleLegend: {
          show: chartConfig.value.showLegend,
          colors: colors,
          min: min,
          max: max,
          textColor: textColor,
          gridColor: gridColor
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.columns.length - 0.5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return heatmapData.value.columns[value] || '';
            },
            color: textColor
          },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Columns',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.rows.length - 0.5,
          reverse: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return heatmapData.value.rows[value] || '';
            },
            color: textColor
          },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Rows',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Funnel chart options (use bar with special styling)
  if (chartType === 'funnel') {
    return {
      ...baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Waterfall chart options
  if (chartType === 'waterfall') {
    return {
      ...baseOptions,
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Horizontal bar chart
  if (chartType === 'horizontalBar') {
    return {
      ...baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Stacked bar chart
  if (chartType === 'stackedBar') {
    return {
      ...baseOptions,
      scales: {
        x: {
          stacked: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.xAxisLabel || 'Category',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          stacked: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: chartConfig.value.yAxisLabel || 'Value',
            color: textColor,
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  }
  
  // Default scales for other charts (line, bar, scatter, bubble, area, groupedBar, combo, radar)
  return {
    ...baseOptions,
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: {
          display: true,
          text: chartConfig.value.xAxisLabel || (chartType === 'scatter' || chartType === 'bubble' ? 'X Value' : 'Category'),
          color: textColor,
          font: { size: 14, weight: 'bold' }
        }
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: {
          display: true,
          text: chartConfig.value.yAxisLabel || (chartType === 'scatter' || chartType === 'bubble' ? 'Y Value' : 'Value'),
          color: textColor,
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };
});

const addDataItem = () => {
  chartData.value.push({ label: `Item ${chartData.value.length + 1}`, value: 0 });
};

const removeDataItem = (index) => {
  if (chartData.value.length > 1) {
    chartData.value.splice(index, 1);
  }
};

// Multi-dataset management functions
const addDataset = () => {
  const baseLabels = multiDatasetData.value[0]?.data.map(item => item.label) || ['A', 'B', 'C', 'D'];
  multiDatasetData.value.push({
    label: `Dataset ${multiDatasetData.value.length + 1}`,
    data: baseLabels.map(label => ({ label, value: 0 }))
  });
};

const removeDataset = (index) => {
  if (multiDatasetData.value.length > 1) {
    multiDatasetData.value.splice(index, 1);
  }
};

const addMultiDataItem = (datasetIndex) => {
  const dataset = multiDatasetData.value[datasetIndex];
  dataset.data.push({ label: `Item ${dataset.data.length + 1}`, value: 0 });
  // Sync labels across all datasets
  syncMultiDatasetLabels();
};

const removeMultiDataItem = (datasetIndex, itemIndex) => {
  const dataset = multiDatasetData.value[datasetIndex];
  if (dataset.data.length > 1) {
    dataset.data.splice(itemIndex, 1);
    // Sync labels across all datasets
    syncMultiDatasetLabels();
  }
};

const syncMultiDatasetLabels = () => {
  if (multiDatasetData.value.length === 0) return;
  const firstDatasetLabels = multiDatasetData.value[0].data.map(item => item.label);
  multiDatasetData.value.forEach((dataset, index) => {
    if (index > 0) {
      dataset.data.forEach((item, itemIndex) => {
        if (firstDatasetLabels[itemIndex]) {
          item.label = firstDatasetLabels[itemIndex];
        }
      });
    }
  });
};

const loadSampleData = () => {
  const chartType = selectedChartType.value;
  
  // Handle gauge chart
  if (chartType === 'gauge') {
    gaugeData.value = { value: 75, min: 0, max: 100, target: 80 };
    chartConfig.value.title = 'Gauge Chart Example';
    return;
  }
  
  // Handle waterfall chart
  if (chartType === 'waterfall') {
    waterfallData.value = {
      base: 100,
      changes: [
        { label: 'Q1', value: 20 },
        { label: 'Q2', value: -10 },
        { label: 'Q3', value: 30 },
        { label: 'Q4', value: -5 }
      ]
    };
    chartConfig.value.title = 'Waterfall Chart Example';
    return;
  }
  
  // Handle candlestick chart
  if (chartType === 'candlestick') {
    candlestickData.value = [
      { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
      { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
      { date: '2024-01-03', open: 112, high: 120, low: 108, close: 115 },
      { date: '2024-01-04', open: 115, high: 118, low: 110, close: 113 }
    ];
    chartConfig.value.title = 'Candlestick Chart Example';
    return;
  }
  
  // Handle heatmap
  if (chartType === 'heatmap') {
    heatmapData.value = {
      rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      columns: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [
        [10, 20, 30, 40],
        [15, 25, 35, 45],
        [20, 30, 40, 50],
        [25, 35, 45, 55],
        [30, 40, 50, 60]
      ]
    };
    chartConfig.value.title = 'Heatmap Example';
    return;
  }
  
  // Handle funnel chart
  if (chartType === 'funnel') {
    funnelData.value = [
      { label: 'Visitors', value: 1000 },
      { label: 'Leads', value: 500 },
      { label: 'Qualified', value: 250 },
      { label: 'Proposals', value: 100 },
      { label: 'Closed', value: 50 }
    ];
    chartConfig.value.title = 'Funnel Chart Example';
    return;
  }
  
  // Handle treemap
  if (chartType === 'treemap') {
    treemapData.value = {
      name: 'Root',
      value: 100,
      children: [
        { name: 'Category A', value: 40, children: [
          { name: 'Item A1', value: 20 },
          { name: 'Item A2', value: 20 }
        ]},
        { name: 'Category B', value: 35, children: [
          { name: 'Item B1', value: 15 },
          { name: 'Item B2', value: 20 }
        ]},
        { name: 'Category C', value: 25, children: [
          { name: 'Item C1', value: 25 }
        ]}
      ]
    };
    chartConfig.value.title = 'Treemap Example';
    return;
  }
  
  // Handle sankey
  if (chartType === 'sankey') {
    sankeyData.value = {
      nodes: [
        { id: 'Source1', label: 'Source 1' },
        { id: 'Source2', label: 'Source 2' },
        { id: 'Process1', label: 'Process 1' },
        { id: 'Process2', label: 'Process 2' },
        { id: 'Target1', label: 'Target 1' },
        { id: 'Target2', label: 'Target 2' }
      ],
      links: [
        { source: 'Source1', target: 'Process1', value: 30 },
        { source: 'Source1', target: 'Process2', value: 20 },
        { source: 'Source2', target: 'Process1', value: 25 },
        { source: 'Source2', target: 'Process2', value: 15 },
        { source: 'Process1', target: 'Target1', value: 40 },
        { source: 'Process1', target: 'Target2', value: 15 },
        { source: 'Process2', target: 'Target1', value: 20 },
        { source: 'Process2', target: 'Target2', value: 15 }
      ]
    };
    chartConfig.value.title = 'Sankey Diagram Example';
    return;
  }
  
  // Handle multi-dataset charts
  if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo' || chartType === 'line') {
    multiDatasetData.value = [
      {
        label: chartType === 'line' ? 'Series 1' : 'Sales',
        data: [
          { label: 'Q1', value: 45 },
          { label: 'Q2', value: 78 },
          { label: 'Q3', value: 92 },
          { label: 'Q4', value: 65 }
        ]
      },
      {
        label: chartType === 'line' ? 'Series 2' : 'Revenue',
        data: [
          { label: 'Q1', value: 35 },
          { label: 'Q2', value: 68 },
          { label: 'Q3', value: 82 },
          { label: 'Q4', value: 55 }
        ]
      },
      ...(chartType === 'combo' ? [{
        label: 'Target',
        data: [
          { label: 'Q1', value: 50 },
          { label: 'Q2', value: 75 },
          { label: 'Q3', value: 90 },
          { label: 'Q4', value: 70 }
        ]
      }] : []),
      ...(chartType === 'line' ? [{
        label: 'Series 3',
        data: [
          { label: 'Q1', value: 55 },
          { label: 'Q2', value: 72 },
          { label: 'Q3', value: 88 },
          { label: 'Q4', value: 60 }
        ]
      }] : [])
    ];
    chartConfig.value.title = `${chartTypes.find(t => t.value === chartType)?.label || 'Chart'} Example`;
    return;
  }
  
  // Single dataset charts
  const samples = {
    line: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 55 }
    ],
    area: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 55 }
    ],
    bar: [
      { label: 'Q1', value: 45 },
      { label: 'Q2', value: 78 },
      { label: 'Q3', value: 92 },
      { label: 'Q4', value: 65 }
    ],
    horizontalBar: [
      { label: 'Product A', value: 85 },
      { label: 'Product B', value: 72 },
      { label: 'Product C', value: 90 },
      { label: 'Product D', value: 65 }
    ],
    pie: [
      { label: 'Desktop', value: 45 },
      { label: 'Mobile', value: 30 },
      { label: 'Tablet', value: 15 },
      { label: 'Other', value: 10 }
    ],
    doughnut: [
      { label: 'Chrome', value: 60 },
      { label: 'Firefox', value: 25 },
      { label: 'Safari', value: 10 },
      { label: 'Edge', value: 5 }
    ],
    scatter: [
      { label: 'Point 1', value: 20 },
      { label: 'Point 2', value: 35 },
      { label: 'Point 3', value: 50 },
      { label: 'Point 4', value: 45 },
      { label: 'Point 5', value: 60 },
      { label: 'Point 6', value: 70 }
    ],
    radar: [
      { label: 'Speed', value: 80 },
      { label: 'Reliability', value: 90 },
      { label: 'Comfort', value: 70 },
      { label: 'Safety', value: 85 },
      { label: 'Efficiency', value: 75 }
    ],
    bubble: [
      { label: 'A', value: 30 },
      { label: 'B', value: 50 },
      { label: 'C', value: 40 },
      { label: 'D', value: 60 },
      { label: 'E', value: 45 }
    ],
    polar: [
      { label: 'Red', value: 11 },
      { label: 'Blue', value: 16 },
      { label: 'Yellow', value: 7 },
      { label: 'Green', value: 3 },
      { label: 'Purple', value: 14 }
    ]
  };
  
  chartData.value = samples[chartType] || samples.line;
  chartConfig.value.title = `${chartTypes.find(t => t.value === chartType)?.label || 'Chart'} Example`;
};

const exportChart = async (format) => {
  // Show warning if accessibility requirements aren't met, but allow export
  const warnings = [];
  
  if (!chartConfig.value.title || chartConfig.value.title.trim() === '') {
    warnings.push('Chart title is missing');
  }
  if (!chartConfig.value.summary || chartConfig.value.summary.trim() === '') {
    warnings.push('Chart summary is missing');
  }
  if (!chartConfig.value.keyInsight || chartConfig.value.keyInsight.trim() === '') {
    warnings.push('Key insight is missing');
  }
  if (colorOnlyEncoding.value) {
    warnings.push('Chart relies solely on color - consider adding secondary encoding');
  }
  if (contrastIssues.value.length > 0) {
    warnings.push(`${contrastIssues.value.length} contrast issue(s) found`);
  }
  if (accessibilityScore.value < 100) {
    warnings.push(`Accessibility score is ${accessibilityScore.value}%`);
  }
  
  if (warnings.length > 0) {
    const proceed = confirm('Accessibility warnings detected:\n\n' + warnings.join('\n') + '\n\nDo you want to export anyway?');
    if (!proceed) {
      return;
    }
  }
  
  if (format === 'json') {
    const config = {
      type: selectedChartType.value,
      title: chartConfig.value.title,
      data: chartData.value,
      colorScheme: chartConfig.value.colorScheme,
      showLegend: chartConfig.value.showLegend
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'html') {
    const colors = colorSchemes[chartConfig.value.colorScheme] || colorSchemes.default;
    const chartType = selectedChartType.value;
    
    // SVG-based charts (choropleth, flowMap, bulletGraph, chordDiagram, treemap, sankey) 
    // don't work with Chart.js HTML export - recommend PNG/PDF instead
    if (chartType === 'choropleth' || chartType === 'flowMap' || chartType === 'bulletGraph' || 
        chartType === 'chordDiagram' || chartType === 'treemap' || chartType === 'sankey') {
      alert('HTML export is not available for SVG-based charts. Please use PNG or PDF export instead.');
      return;
    }
    
    // Prepare chart data based on chart type
    let chartDataConfig = '';
    let chartTypeForExport = chartType;
    
    // Handle gauge chart
    if (chartType === 'gauge') {
      const value = gaugeData.value.value;
      const min = gaugeData.value.min;
      const max = gaugeData.value.max;
      const range = max - min;
      const valuePercent = ((value - min) / range) * 100;
      const remaining = 100 - valuePercent;
      chartDataConfig = JSON.stringify({
        labels: ['Value', 'Remaining'],
        datasets: [{
          data: [valuePercent, remaining],
          backgroundColor: [colors[0], '#e5e7eb'],
          borderWidth: 0
        }]
      }, null, 2);
      chartTypeForExport = 'doughnut';
    } else if (chartType === 'waterfall') {
      const base = waterfallData.value.base;
      const changes = waterfallData.value.changes;
      const labels = ['Base', ...changes.map(c => c.label), 'Total'];
      const data = [base];
      let runningTotal = base;
      changes.forEach(change => {
        data.push(change.value);
        runningTotal += change.value;
      });
      data.push(runningTotal);
      const backgroundColors = [colors[0], ...changes.map(c => c.value >= 0 ? colors[1] : colors[2]), colors[0]];
      chartDataConfig = JSON.stringify({
        labels,
        datasets: [{
          label: chartConfig.value.title || 'Waterfall',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 2
        }]
      }, null, 2);
      chartTypeForExport = 'bar';
    } else if (chartType === 'candlestick') {
      chartDataConfig = JSON.stringify({
        datasets: [{
          label: chartConfig.value.title || 'OHLC',
          data: candlestickData.value.map(item => ({
            x: new Date(item.date).getTime(),
            o: item.open,
            h: item.high,
            l: item.low,
            c: item.close
          }))
        }]
      }, null, 2);
      chartTypeForExport = 'candlestick';
    } else if (chartType === 'heatmap') {
      const data = [];
      heatmapData.value.rows.forEach((row, rowIndex) => {
        heatmapData.value.columns.forEach((col, colIndex) => {
          if (heatmapData.value.values[rowIndex] && heatmapData.value.values[rowIndex][colIndex] !== undefined) {
            data.push({
              x: colIndex,
              y: rowIndex,
              v: heatmapData.value.values[rowIndex][colIndex]
            });
          }
        });
      });
      chartDataConfig = JSON.stringify({
        datasets: [{
          label: chartConfig.value.title || 'Heatmap',
          data
        }]
      }, null, 2);
      chartTypeForExport = 'matrix';
    } else if (chartType === 'funnel') {
      chartDataConfig = JSON.stringify({
        labels: funnelData.value.map(item => item.label),
        datasets: [{
          label: chartConfig.value.title || 'Funnel',
          data: funnelData.value.map(item => item.value),
          backgroundColor: colors.slice(0, funnelData.value.length),
          borderColor: colors.slice(0, funnelData.value.length),
          borderWidth: 2
        }]
      }, null, 2);
      chartTypeForExport = 'bar';
    } else if (chartType === 'treemap' || chartType === 'sankey') {
      // For treemap and sankey, we'll export as JSON note since they use custom SVG
      alert('Treemap and Sankey charts use custom SVG rendering and cannot be exported as standalone HTML. Please use JSON export instead.');
      return;
    } else if (chartType === 'stackedBar' || chartType === 'groupedBar' || chartType === 'combo') {
      const labels = multiDatasetData.value[0]?.data.map(item => item.label) || [];
      const datasets = multiDatasetData.value.map((dataset, index) => {
        const isLine = chartType === 'combo' && index === multiDatasetData.value.length - 1;
        return {
          label: dataset.label,
          data: dataset.data.map(item => item.value),
          backgroundColor: isLine ? 'transparent' : (colors[index % colors.length] + '80'),
          borderColor: colors[index % colors.length],
          borderWidth: 2,
          type: isLine ? 'line' : 'bar',
          fill: false
        };
      });
      chartDataConfig = JSON.stringify({ labels, datasets }, null, 2);
      chartTypeForExport = 'bar';
    } else if (chartType === 'scatter') {
      const scatterData = chartData.value.map((item, index) => ({
        x: index,
        y: item.value
      }));
      chartDataConfig = JSON.stringify({
        datasets: [{
          label: chartConfig.value.title || 'Dataset',
          data: scatterData,
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2
        }]
      }, null, 2);
    } else if (chartType === 'bubble') {
      const bubbleData = chartData.value.map((item, index) => ({
        x: index,
        y: item.value,
        r: Math.abs(item.value) / 5 + 5
      }));
      chartDataConfig = JSON.stringify({
        datasets: [{
          label: chartConfig.value.title || 'Dataset',
          data: bubbleData,
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2
        }]
      }, null, 2);
    } else if (chartType === 'area') {
      chartDataConfig = JSON.stringify({
        labels: chartData.value.map(item => item.label),
        datasets: [{
          label: chartConfig.value.title || 'Dataset',
          data: chartData.value.map(item => item.value),
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2,
          fill: true
        }]
      }, null, 2);
      chartTypeForExport = 'line';
    } else if (chartType === 'horizontalBar') {
      chartDataConfig = JSON.stringify({
        labels: chartData.value.map(item => item.label),
        datasets: [{
          label: chartConfig.value.title || 'Dataset',
          data: chartData.value.map(item => item.value),
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2
        }]
      }, null, 2);
      chartTypeForExport = 'bar';
    } else {
      const backgroundColor = (chartType === 'line' || chartType === 'bar' || chartType === 'radar')
        ? colors[0] + '80'
        : colors.slice(0, chartData.value.length);
      const borderColor = (chartType === 'line' || chartType === 'bar' || chartType === 'radar')
        ? colors[0]
        : colors.slice(0, chartData.value.length);
      
      chartDataConfig = JSON.stringify({
        labels: chartData.value.map(item => item.label),
        datasets: [{
          label: chartConfig.value.title || 'Dataset',
          data: chartData.value.map(item => item.value),
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 2,
          fill: chartType === 'line' ? false : undefined
        }]
      }, null, 2);
    }
    
    // Prepare chart options
    let chartOptionsConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: !!chartConfig.value.title,
          text: chartConfig.value.title,
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          display: chartConfig.value.showLegend,
          position: 'top'
        }
      }
    };
    
    // Add scales and special options for charts that need them
    if (chartTypeForExport === 'bar') {
      if (chartType === 'horizontalBar' || chartType === 'funnel') {
        chartOptionsConfig.indexAxis = 'y';
      }
      if (chartType === 'stackedBar') {
        chartOptionsConfig.scales = {
          x: { stacked: true, ticks: {}, grid: {} },
          y: { stacked: true, ticks: {}, grid: {} }
        };
      } else if (chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polar' && chartType !== 'gauge') {
        chartOptionsConfig.scales = {
          x: { ticks: {}, grid: {} },
          y: { ticks: {}, grid: {} }
        };
      }
    } else if (chartTypeForExport === 'line' && chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polar' && chartType !== 'gauge') {
      chartOptionsConfig.scales = {
        x: { ticks: {}, grid: {} },
        y: { ticks: {}, grid: {} }
      };
    } else if (chartTypeForExport === 'doughnut' && chartType === 'gauge') {
      chartOptionsConfig.cutout = '75%';
      chartOptionsConfig.circumference = 270;
      chartOptionsConfig.rotation = 225;
    } else if (chartTypeForExport === 'candlestick') {
      chartOptionsConfig.scales = {
        x: { ticks: {}, grid: {} },
        y: { ticks: {}, grid: {} }
      };
    } else if (chartTypeForExport === 'matrix') {
      // Matrix chart scales will be set in the HTML script
      chartOptionsConfig.scales = {
        x: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.columns.length - 0.5,
          ticks: {
            stepSize: 1
          },
          grid: {}
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: heatmapData.value.rows.length - 0.5,
          reverse: true,
          ticks: {
            stepSize: 1
          },
          grid: {}
        }
      };
    }
    
    const chartOptionsConfigStr = JSON.stringify(chartOptionsConfig, null, 2);
    
    // Construct closing tags to avoid Vue parser issues
    const closeHead = '</' + 'head>';
    const closeBody = '</' + 'body>';
    const closeHtml = '</' + 'html>';
    const closeStyle = '</' + 'style>';
    
    const htmlParts = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `    <title>${chartConfig.value.title || 'Chart'}</title>`,
      '    <' + 'script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></' + 'script>',
      ...(chartTypeForExport === 'candlestick' ? [
        '    <' + 'script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial@latest/dist/chartjs-chart-financial.min.js"></' + 'script>'
      ] : []),
      ...(chartTypeForExport === 'matrix' ? [
        '    <' + 'script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@latest/dist/chartjs-chart-matrix.min.js"></' + 'script>'
      ] : []),
      '    <style>',
      '        * {',
      '            margin: 0;',
      '            padding: 0;',
      '            box-sizing: border-box;',
      '        }',
      '        body {',
      '            font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;',
      '            background: linear-gradient(to bottom right, #f5f5f5, #e0e0e0);',
      '            min-height: 100vh;',
      '            display: flex;',
      '            align-items: center;',
      '            justify-content: center;',
      '            padding: 20px;',
      '        }',
      '        .chart-container {',
      '            background: white;',
      '            border-radius: 12px;',
      '            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);',
      '            padding: 40px;',
      '            max-width: 900px;',
      '            width: 100%;',
      '        }',
      '        h1 {',
      '            color: #1e293b;',
      '            margin-bottom: 30px;',
      '            text-align: center;',
      '            font-size: 24px;',
      '            font-weight: 600;',
      '        }',
      '        canvas {',
      '            max-width: 100%;',
      '            height: auto !important;',
      '        }',
      '    ' + closeStyle,
      closeHead,
      '<body>',
      '    <div class="chart-container">',
      `        <h1>${chartConfig.value.title || 'Chart'}</h1>`,
      '        <figure role="img" aria-label="' + (chartConfig.value.title || 'Chart') + '" aria-describedby="chart-summary chart-data-table">',
      '            <canvas id="chartCanvas"></canvas>',
      `            <figcaption id="chart-summary">${chartConfig.value.summary || ''}</figcaption>`,
      '        </figure>',
      '        <div id="chart-data-table" style="margin-top: 30px;">',
      '            <h2>Data Table</h2>',
      '            <table role="table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">',
      '                <thead>',
      '                    <tr>',
      generateDataTableHTMLHeaders(),
      '                    </tr>',
      '                </thead>',
      '                <tbody>',
      generateDataTableHTMLRows(),
      '                </tbody>',
      '            </table>',
      '        </div>',
      '    </div>',
      '    <' + 'script>',
      '        const ctx = document.getElementById(\'chartCanvas\').getContext(\'2d\');',
      `        const chartData = ${chartDataConfig};`,
      `        const chartOptions = ${chartOptionsConfigStr};`,
      '        ',
      ...(chartTypeForExport === 'matrix' ? [
        '        // Set up matrix chart labels',
        `        const columnLabels = ${JSON.stringify(heatmapData.value.columns)};`,
        `        const rowLabels = ${JSON.stringify(heatmapData.value.rows)};`,
        '        chartOptions.scales.x.ticks.callback = function(value) { return columnLabels[value] || ""; };',
        '        chartOptions.scales.y.ticks.callback = function(value) { return rowLabels[value] || ""; };'
      ] : []),
      '        new Chart(ctx, {',
      `            type: '${chartTypeForExport}',`,
      '            data: chartData,',
      '            options: chartOptions',
      '        });',
      '    </' + 'script>',
      closeBody,
      closeHtml
    ];
    
    const htmlContent = htmlParts.join('\n');
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'png') {
    // PNG export with html2canvas
    try {
      const html2canvas = (await import('html2canvas')).default;
      const chartElement = document.querySelector('figure[role="img"]');
      if (!chartElement) {
        alert('Chart element not found');
        return;
      }
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode.value ? '#0f172a' : '#ffffff',
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
      
      // Create caption file
      const captionText = `${chartConfig.value.title}\n\n${chartConfig.value.summary}\n\nKey Insight: ${chartConfig.value.keyInsight}`;
      const captionBlob = new Blob([captionText], { type: 'text/plain' });
      const captionUrl = URL.createObjectURL(captionBlob);
      const captionLink = document.createElement('a');
      captionLink.href = captionUrl;
      captionLink.download = `chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-caption.txt`;
      captionLink.click();
      URL.revokeObjectURL(captionUrl);
    } catch (error) {
      console.error('PNG export error:', error);
      alert('PNG export failed. Please try HTML or JSON export.');
    }
  } else if (format === 'pdf') {
    // PDF export with jsPDF
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const chartElement = document.querySelector('figure[role="img"]');
      if (!chartElement) {
        alert('Chart element not found');
        return;
      }
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode.value ? '#0f172a' : '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add chart image with alt text
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, chartConfig.value.title, true);
      
      // Add summary and key insight
      let yPos = imgHeight + 20;
      pdf.setFontSize(16);
      pdf.text(chartConfig.value.title, 10, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      pdf.text('Summary:', 10, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      const summaryLines = pdf.splitTextToSize(chartConfig.value.summary, 270);
      pdf.text(summaryLines, 10, yPos);
      yPos += summaryLines.length * 7 + 5;
      pdf.setFontSize(12);
      pdf.text('Key Insight:', 10, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      const insightLines = pdf.splitTextToSize(chartConfig.value.keyInsight, 270);
      pdf.text(insightLines, 10, yPos);
      yPos += insightLines.length * 7 + 10;
      
      // Add data table
      pdf.setFontSize(12);
      pdf.text('Data Table', 10, yPos);
      yPos += 7;
      pdf.setFontSize(8);
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      
      // Table headers
      let xPos = 10;
      headers.forEach(header => {
        pdf.text(header.label, xPos, yPos);
        xPos += 40;
      });
      yPos += 5;
      
      // Table rows
      tableData.forEach(row => {
        xPos = 10;
        headers.forEach(header => {
          const value = typeof row[header.key] === 'number' 
            ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
            : String(row[header.key] || '');
          pdf.text(value, xPos, yPos);
          xPos += 40;
        });
        yPos += 5;
        if (yPos > 280) {
          pdf.addPage();
          yPos = 10;
        }
      });
      
      pdf.save(`chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF export failed. Please try HTML or JSON export.');
    }
  } else if (format === 'ppt') {
    // PPT export with pptxgenjs
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const html2canvas = (await import('html2canvas')).default;
      const chartElement = document.querySelector('figure[role="img"]');
      if (!chartElement) {
        alert('Chart element not found');
        return;
      }
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode.value ? '#0f172a' : '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pptx = new PptxGenJS();
      
      // Add slide with chart
      const slide = pptx.addSlide();
      slide.addText(chartConfig.value.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true
      });
      
      slide.addImage({
        data: imgData,
        x: 0.5,
        y: 1,
        w: 9,
        h: 5,
        altText: chartConfig.value.title + '. ' + chartConfig.value.summary
      });
      
      slide.addText(chartConfig.value.summary, {
        x: 0.5,
        y: 6.5,
        w: 9,
        h: 0.8,
        fontSize: 12
      });
      
      slide.addText('Key Insight: ' + chartConfig.value.keyInsight, {
        x: 0.5,
        y: 7.3,
        w: 9,
        h: 0.8,
        fontSize: 12,
        bold: true
      });
      
      // Add data table slide
      const tableSlide = pptx.addSlide();
      tableSlide.addText('Data Table', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true
      });
      
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      const tableRows = [
        headers.map(h => h.label),
        ...tableData.map(row => headers.map(header => {
          const value = typeof row[header.key] === 'number' 
            ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
            : String(row[header.key] || '');
          return value;
        }))
      ];
      
      tableSlide.addTable(tableRows, {
        x: 0.5,
        y: 1,
        w: 9,
        colW: [2, 2, 2, 2, 1],
        fontSize: 10
      });
      
      await pptx.writeFile({ fileName: `chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-${Date.now()}.pptx` });
    } catch (error) {
      console.error('PPT export error:', error);
      alert('PPT export failed. Please try HTML or JSON export.');
    }
  } else if (format === 'word') {
    // Word export with docx
    try {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType } = await import('docx');
      const html2canvas = (await import('html2canvas')).default;
      const chartElement = document.querySelector('figure[role="img"]');
      if (!chartElement) {
        alert('Chart element not found');
        return;
      }
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode.value ? '#0f172a' : '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgBuffer = Buffer.from(imgData.split(',')[1], 'base64');
      
      // Create data table
      const tableData = generateDataTable();
      const headers = dataTableHeaders.value;
      const tableRows = [
        new TableRow({
          children: headers.map(header => new TableCell({
            children: [new Paragraph(header.label)],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }))
        }),
        ...tableData.map(row => new TableRow({
          children: headers.map(header => new TableCell({
            children: [new Paragraph(
              typeof row[header.key] === 'number' 
                ? row[header.key].toLocaleString() + (header.key === 'value' && chartConfig.value.dataUnit ? ' ' + chartConfig.value.dataUnit : '')
                : String(row[header.key] || '')
            )],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }))
        }))
      ];
      
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: chartConfig.value.title,
              heading: 'Heading1',
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                {
                  type: 'image',
                  data: imgBuffer,
                  width: 500,
                  height: 300,
                  altText: chartConfig.value.title + '. ' + chartConfig.value.summary
                }
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: 'Summary:',
              heading: 'Heading2'
            }),
            new Paragraph({
              text: chartConfig.value.summary
            }),
            new Paragraph({
              text: '',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: 'Key Insight:',
              heading: 'Heading2'
            }),
            new Paragraph({
              text: chartConfig.value.keyInsight
            }),
            new Paragraph({
              text: '',
              spacing: { after: 400 }
            }),
            new Paragraph({
              text: 'Data Table',
              heading: 'Heading2'
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-${chartConfig.value.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chart'}-${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Word export error:', error);
      alert('Word export failed. Please try HTML or JSON export.');
    }
  }
};





let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
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
  
  // Load sample data on mount
  loadSampleData();
  // Initialize custom colors if custom scheme is selected
  initializeCustomColors();
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});

// Watch for chart type changes and load appropriate sample data
watch(selectedChartType, () => {
  chartKey.value++;
  loadSampleData();
  initializeCustomColors();
});

// Watch for data changes to update custom colors
watch([chartData, multiDatasetData], () => {
  if (chartConfig.value.colorScheme === 'custom') {
    initializeCustomColors();
  }
}, { deep: true });

// Treemap SVG Component
const TreemapSVG = {
  props: ['data', 'colors'],
  setup(props, { expose }) {
    const containerRef = ref(null);
    const width = ref(400);
    const height = ref(300);
    
    // Flatten tree to get all leaf nodes
    const flattenTree = (node, level = 0, path = '') => {
      const result = [];
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, idx) => {
          result.push(...flattenTree(child, level + 1, path ? `${path}.${idx}` : `${idx}`));
        });
      } else {
        result.push({ 
          name: node.name || 'Item',
          value: node.value || 0,
          level,
          path
        });
      }
      return result;
    };
    
    const items = computed(() => {
      const flat = flattenTree(props.data);
      const total = flat.reduce((sum, item) => sum + item.value, 0);
      if (total === 0) return [];
      
      // Sort by value descending for better layout
      return flat
        .map((item, index) => ({
          ...item,
          ratio: item.value / total,
          color: props.colors[index % props.colors.length]
        }))
        .sort((a, b) => b.value - a.value);
    });
    
    // Squarified treemap layout algorithm
    const layout = computed(() => {
      if (items.value.length === 0) return [];
      
      const rects = [];
      const w = width.value;
      const h = height.value;
      
      // Squarified treemap algorithm
      const squarify = (items, x, y, w, h) => {
        if (items.length === 0) return;
        if (items.length === 1) {
          const item = items[0];
          rects.push({
            ...item,
            x,
            y,
            width: w,
            height: h
          });
          return;
        }
        
        const total = items.reduce((sum, item) => sum + item.value, 0);
        const area = w * h;
        
        // Determine if we should layout horizontally or vertically
        const shouldLayoutHorizontally = w >= h;
        
        if (shouldLayoutHorizontally) {
          // Layout horizontally (rows)
          let currentY = y;
          let remainingHeight = h;
          let itemIndex = 0;
          
          while (itemIndex < items.length && remainingHeight > 0) {
            const rowItems = [];
            let rowSum = 0;
            let bestRow = [];
            let bestWorst = Infinity;
            
            // Build the best row
            for (let i = itemIndex; i < items.length; i++) {
              const testRow = items.slice(itemIndex, i + 1);
              const testSum = testRow.reduce((sum, item) => sum + item.value, 0);
              const rowHeight = (testSum / total) * h;
              const rowWidth = w;
              
              // Calculate worst aspect ratio
              let worst = 0;
              testRow.forEach(item => {
                const itemWidth = (item.value / testSum) * rowWidth;
                const itemHeight = rowHeight;
                const aspectRatio = Math.max(itemWidth / itemHeight, itemHeight / itemWidth);
                worst = Math.max(worst, aspectRatio);
              });
              
              if (worst < bestWorst) {
                bestWorst = worst;
                bestRow = testRow;
                rowSum = testSum;
              } else {
                break;
              }
            }
            
            const rowHeight = (rowSum / total) * h;
            let currentX = x;
            
            bestRow.forEach((item, idx) => {
              const itemWidth = (item.value / rowSum) * w;
              rects.push({
                ...item,
                x: currentX,
                y: currentY,
                width: itemWidth,
                height: rowHeight
              });
              currentX += itemWidth;
            });
            
            currentY += rowHeight;
            remainingHeight -= rowHeight;
            itemIndex += bestRow.length;
          }
        } else {
          // Layout vertically (columns)
          let currentX = x;
          let remainingWidth = w;
          let itemIndex = 0;
          
          while (itemIndex < items.length && remainingWidth > 0) {
            const colItems = [];
            let colSum = 0;
            let bestCol = [];
            let bestWorst = Infinity;
            
            // Build the best column
            for (let i = itemIndex; i < items.length; i++) {
              const testCol = items.slice(itemIndex, i + 1);
              const testSum = testCol.reduce((sum, item) => sum + item.value, 0);
              const colWidth = (testSum / total) * w;
              const colHeight = h;
              
              // Calculate worst aspect ratio
              let worst = 0;
              testCol.forEach(item => {
                const itemHeight = (item.value / testSum) * colHeight;
                const itemWidth = colWidth;
                const aspectRatio = Math.max(itemWidth / itemHeight, itemHeight / itemWidth);
                worst = Math.max(worst, aspectRatio);
              });
              
              if (worst < bestWorst) {
                bestWorst = worst;
                bestCol = testCol;
                colSum = testSum;
              } else {
                break;
              }
            }
            
            const colWidth = (colSum / total) * w;
            let currentY = y;
            
            bestCol.forEach((item, idx) => {
              const itemHeight = (item.value / colSum) * h;
              rects.push({
                ...item,
                x: currentX,
                y: currentY,
                width: colWidth,
                height: itemHeight
              });
              currentY += itemHeight;
            });
            
            currentX += colWidth;
            remainingWidth -= colWidth;
            itemIndex += bestCol.length;
          }
        }
      };
      
      squarify(items.value, 0, 0, w, h);
      return rects;
    });
    
    let resizeObserver = null;
    let handleResize = null;
    
    onMounted(() => {
      const updateSize = () => {
        if (containerRef.value) {
          const rect = containerRef.value.getBoundingClientRect();
          width.value = rect.width || 400;
          height.value = rect.height || 300;
        }
      };
      updateSize();
      
      handleResize = () => updateSize();
      window.addEventListener('resize', handleResize);
      
      // Use ResizeObserver to watch for container size changes
      resizeObserver = new ResizeObserver(updateSize);
      if (containerRef.value) {
        resizeObserver.observe(containerRef.value);
      }
    });
    
    onBeforeUnmount(() => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });
    
    return () => h('div', {
      ref: containerRef,
      class: 'w-full h-full min-h-[400px]'
    }, [
      h('svg', {
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full'
      }, [
        ...layout.value.map((rect, index) => 
          h('g', { key: index }, [
            h('rect', {
              x: Math.max(0, rect.x),
              y: Math.max(0, rect.y),
              width: Math.max(1, rect.width),
              height: Math.max(1, rect.height),
              fill: rect.color,
              stroke: '#fff',
              'stroke-width': 2,
              rx: 2,
              style: { cursor: 'pointer' }
            }),
            rect.width > 40 && rect.height > 20 ? h('text', {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              fill: '#fff',
              'font-size': Math.min(rect.width, rect.height) / 8,
              'font-weight': 'bold',
              style: { pointerEvents: 'none' }
            }, [
              h('tspan', {
                x: rect.x + rect.width / 2,
                dy: rect.height > 40 ? '-0.3em' : '0'
              }, rect.name),
              rect.height > 40 ? h('tspan', {
                x: rect.x + rect.width / 2,
                dy: '1.2em',
                'font-size': Math.min(rect.width, rect.height) / 10
              }, rect.value) : null
            ]) : null
          ])
        )
      ])
    ]);
  }
};

// Sankey SVG Component
const SankeySVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = 300;
    const nodeWidth = 80;
    const nodeHeight = 30;
    const nodeSpacing = 20;
    
    const nodes = computed(() => {
      const cols = 3; // Source, Process, Target
      const nodesByCol = [[], [], []];
      
      props.data.nodes.forEach((node, index) => {
        let col = 0;
        if (node.id.includes('Process')) col = 1;
        else if (node.id.includes('Target')) col = 2;
        nodesByCol[col].push({ ...node, col, index });
      });
      
      const positioned = [];
      nodesByCol.forEach((colNodes, colIndex) => {
        const colX = colIndex * (width / 3) + (width / 3 - nodeWidth) / 2;
        colNodes.forEach((node, nodeIndex) => {
          const nodeY = (height / (colNodes.length + 1)) * (nodeIndex + 1) - nodeHeight / 2;
          positioned.push({
            ...node,
            x: colX,
            y: nodeY,
            width: nodeWidth,
            height: nodeHeight
          });
        });
      });
      
      return positioned;
    });
    
    const links = computed(() => {
      return props.data.links.map(link => {
        const sourceNode = nodes.value.find(n => n.id === link.source);
        const targetNode = nodes.value.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;
        
        return {
          ...link,
          sourceX: sourceNode.x + sourceNode.width,
          sourceY: sourceNode.y + sourceNode.height / 2,
          targetX: targetNode.x,
          targetY: targetNode.y + targetNode.height / 2,
          color: props.colors[Math.floor(Math.random() * props.colors.length)] + '80'
        };
      }).filter(Boolean);
    });
    
    return () => h('svg', {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'w-full h-full'
    }, [
      // Links (paths)
      ...links.value.map((link, index) => {
        const path = `M ${link.sourceX} ${link.sourceY} C ${link.sourceX + 50} ${link.sourceY}, ${link.targetX - 50} ${link.targetY}, ${link.targetX} ${link.targetY}`;
        return h('path', {
          key: `link-${index}`,
          d: path,
          stroke: link.color,
          'stroke-width': Math.max(2, link.value / 5),
          fill: 'none',
          opacity: 0.6
        });
      }),
      // Nodes
      ...nodes.value.map((node, index) => 
        h('g', { key: `node-${index}` }, [
          h('rect', {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            fill: props.colors[index % props.colors.length],
            stroke: '#fff',
            'stroke-width': 2,
            rx: 4
          }),
          h('text', {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#fff',
            'font-size': 12,
            'font-weight': 'bold'
          }, node.label)
        ])
      )
    ]);
  }
};

// Choropleth Map SVG Component - MOVED TO MapMaker.vue
/*
const ChoroplethMapSVG = {
  props: ['data', 'colors', 'mapType', 'showAllRegions'],
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
          
          return h('g', { key: `region-${index}` }, [
            h('path', {
              d: pathData,
              fill: color,
              stroke: '#fff',
              'stroke-width': 0.5,
              'aria-label': dataRegion 
                ? `${featureName}: ${dataRegion.value}` 
                : featureName,
              tabindex: 0,
              role: 'button',
              style: { cursor: 'pointer' }
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
*/

// Flow Map SVG Component - MOVED TO MapMaker.vue
/*
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
*/

// Bullet Graph SVG Component
const BulletGraphSVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = computed(() => props.data.length * 60 + 40);
    
    const items = computed(() => {
      return props.data.map((item, index) => {
        const y = index * 60 + 30;
        const barWidth = width - 100;
        const valueWidth = (item.value / item.max) * barWidth;
        const targetX = (item.target / item.max) * barWidth;
        const poorWidth = (item.ranges.fair / item.max) * barWidth;
        const fairWidth = ((item.ranges.good - item.ranges.fair) / item.max) * barWidth;
        const goodWidth = ((item.ranges.excellent - item.ranges.good) / item.max) * barWidth;
        
        return {
          ...item,
          y,
          barWidth,
          valueWidth,
          targetX,
          poorWidth,
          fairWidth,
          goodWidth,
          color: props.colors[index % props.colors.length]
        };
      });
    });
    
    return () => h('svg', {
      width: width,
      height: height.value,
      viewBox: `0 0 ${width} ${height.value}`,
      class: 'w-full h-full',
      role: 'img',
      'aria-label': 'Bullet graph showing values, targets, and ranges'
    }, [
      ...items.value.map((item, index) => 
        h('g', { key: `bullet-${index}` }, [
          // Range backgrounds
          h('rect', {
            x: 80,
            y: item.y - 15,
            width: item.poorWidth,
            height: 30,
            fill: '#d32f2f',
            opacity: 0.3,
            'aria-label': `Poor range: 0 to ${item.ranges.fair}`
          }),
          h('rect', {
            x: 80 + item.poorWidth,
            y: item.y - 15,
            width: item.fairWidth,
            height: 30,
            fill: '#f57c00',
            opacity: 0.3,
            'aria-label': `Fair range: ${item.ranges.fair} to ${item.ranges.good}`
          }),
          h('rect', {
            x: 80 + item.poorWidth + item.fairWidth,
            y: item.y - 15,
            width: item.goodWidth,
            height: 30,
            fill: '#388e3c',
            opacity: 0.3,
            'aria-label': `Good range: ${item.ranges.good} to ${item.ranges.excellent}`
          }),
          // Value bar
          h('rect', {
            x: 80,
            y: item.y - 10,
            width: item.valueWidth,
            height: 20,
            fill: item.color,
            'aria-label': `Value: ${item.value}, Target: ${item.target}, Max: ${item.max}`
          }),
          // Target marker
          h('line', {
            x1: 80 + item.targetX,
            y1: item.y - 20,
            x2: 80 + item.targetX,
            y2: item.y + 20,
            stroke: '#000',
            'stroke-width': 3,
            'stroke-dasharray': '5,5',
            'aria-label': `Target: ${item.target}`
          }),
          // Label
          h('text', {
            x: 5,
            y: item.y + 5,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            fill: '#000',
            'font-size': 12,
            'font-weight': 'bold'
          }, item.label),
          // Value text
          h('text', {
            x: 85 + item.valueWidth,
            y: item.y + 5,
            'text-anchor': 'start',
            'dominant-baseline': 'middle',
            fill: '#000',
            'font-size': 11
          }, item.value)
        ])
      )
    ]);
  }
};

// Chord Diagram SVG Component
const ChordDiagramSVG = {
  props: ['data', 'colors'],
  setup(props) {
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;
    
    const nodes = computed(() => {
      return props.data.nodes.map((node, index) => {
        const angle = (index / props.data.nodes.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        return {
          ...node,
          x,
          y,
          angle,
          color: props.colors[index % props.colors.length]
        };
      });
    });
    
    const links = computed(() => {
      return props.data.links.map(link => {
        const sourceNode = nodes.value.find(n => n.id === link.source);
        const targetNode = nodes.value.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;
        
        // Create curved path for chord
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const sweep = link.value > 0 ? 1 : 0;
        
        return {
          ...link,
          sourceX: sourceNode.x,
          sourceY: sourceNode.y,
          targetX: targetNode.x,
          targetY: targetNode.y,
          path: `M ${sourceNode.x} ${sourceNode.y} A ${dr} ${dr} 0 0 ${sweep} ${targetNode.x} ${targetNode.y}`,
          strokeWidth: Math.max(2, link.value / 5),
          color: props.colors[Math.floor(Math.random() * props.colors.length)] + '80'
        };
      }).filter(Boolean);
    });
    
    return () => h('svg', {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'w-full h-full',
      role: 'img',
      'aria-label': 'Chord diagram showing relationships between entities'
    }, [
      // Links (chords)
      ...links.value.map((link, index) => 
        h('path', {
          key: `chord-${index}`,
          d: link.path,
          stroke: link.color,
          'stroke-width': link.strokeWidth,
          fill: 'none',
          opacity: 0.6,
          'aria-label': `Relationship between ${props.data.nodes.find(n => n.id === link.source)?.label || link.source} and ${props.data.nodes.find(n => n.id === link.target)?.label || link.target}: ${link.value}`
        })
      ),
      // Nodes
      ...nodes.value.map((node, index) => 
        h('g', { key: `node-${index}` }, [
          h('circle', {
            cx: node.x,
            cy: node.y,
            r: 20,
            fill: node.color,
            stroke: '#fff',
            'stroke-width': 2,
            'aria-label': `Entity: ${node.label}`,
            tabindex: 0,
            role: 'button',
            style: { cursor: 'pointer' }
          }),
          h('text', {
            x: node.x + (node.x > centerX ? 30 : -30),
            y: node.y,
            'text-anchor': node.x > centerX ? 'start' : 'end',
            'dominant-baseline': 'middle',
            fill: '#000',
            'font-size': 11,
            'font-weight': 'bold',
            style: { pointerEvents: 'none' }
          }, node.label)
        ])
      )
    ]);
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

