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
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">show_chart</span>
                Chart Type
              </h2>
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

                  <!-- Chart Title -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Chart Title
                    </label>
                    <input
                      v-model="chartConfig.title"
                      type="text"
                      placeholder="Enter chart title"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                    />
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

                  <!-- Export Buttons -->
                  <div class="space-y-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <button
                      @click="exportChart('html')"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                    >
                      <span class="material-symbols-outlined text-lg">html</span>
                      Export as HTML
                    </button>
                    <button
                      @click="exportChart('png')"
                      class="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      :class="isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
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
                    <div class="w-full" style="max-width: 100%; height: 400px;">
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
import { ref, computed, watch, onMounted, onBeforeUnmount, h } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
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
  MatrixElement
);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const selectedChartType = ref('line');
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

const chartConfig = ref({
  title: 'My Chart',
  colorScheme: 'default',
  showLegend: true
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
  { value: 'polar', label: 'Polar Area', icon: 'pie_chart', description: 'Circular segments' }
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
            v: heatmapData.value.values[rowIndex][colIndex]
          });
        }
      });
    });
    
    return {
      datasets: [{
        label: chartConfig.value.title || 'Heatmap',
        data,
        backgroundColor: (ctx) => {
          const value = ctx.raw.v;
          const allValues = heatmapData.value.values.flat().filter(v => v !== undefined);
          if (allValues.length === 0) return colors[0];
          const max = Math.max(...allValues);
          const min = Math.min(...allValues);
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
  
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1
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
          grid: { color: gridColor }
        },
        y: {
          type: 'linear',
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    };
  }
  
  // Heatmap options
  if (chartType === 'heatmap') {
    return {
      ...baseOptions,
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
          grid: { color: gridColor }
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
          grid: { color: gridColor }
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
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
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
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
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
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
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
          grid: { color: gridColor }
        },
        y: {
          stacked: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    };
  }
  
  // Default scales for other charts
  return {
    ...baseOptions,
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor }
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
      '        <canvas id="chartCanvas"></canvas>',
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
    // For PNG export, we'd need to use html2canvas or similar
    // This is a simplified version - you might want to add html2canvas
    alert('PNG export requires additional setup. HTML and JSON export are available.');
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
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

