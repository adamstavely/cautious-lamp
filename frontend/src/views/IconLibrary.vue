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
                      Icon Library
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Upload and manage icon sets from Material Icons, Lucide, and custom collections. Browse, search, and copy icons for your projects.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Icon Management
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
                        <linearGradient id="iconLibraryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized icon library icon -->
                      <circle cx="50" cy="50" r="20" fill="url(#iconLibraryGradient)" opacity="0.6"/>
                      <circle cx="150" cy="50" r="20" fill="url(#iconLibraryGradient)" opacity="0.5"/>
                      <circle cx="50" cy="150" r="20" fill="url(#iconLibraryGradient)" opacity="0.7"/>
                      <circle cx="150" cy="150" r="20" fill="url(#iconLibraryGradient)" opacity="0.4"/>
                      <rect x="100" y="90" width="20" height="20" rx="4" fill="url(#iconLibraryGradient)" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div 
              class="rounded-lg border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">upload</span>
                  Upload Icon Set
                </h2>
                <button
                  @click="showUploadModal = true"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">upload</span>
                  Upload Icons
                </button>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Upload icon sets from Material Icons, Lucide, or your own custom SVG collections. Supported formats: SVG files, SVG sprite sheets, and icon font files.
              </p>
            </div>
          </div>

          <!-- Icon Sets Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Icon Sets</h2>
              <div class="flex items-center gap-4">
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">search</span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search icons..."
                    class="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <Dropdown
                  :model-value="selectedSet"
                  @update:model-value="selectedSet = $event"
                  :options="[
                    { value: '', label: 'All Sets' },
                    ...iconSets.map(set => ({ value: set.id, label: set.name }))
                  ]"
                  :is-dark-mode="isDarkMode"
                />
              </div>
            </div>

            <!-- Icon Sets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div
                v-for="set in filteredSets"
                :key="set.id"
                class="rounded-lg border p-6 transition-all cursor-pointer"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
                @click="selectedSet = set.id"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span v-if="set.id === 'material'" class="material-symbols-outlined text-indigo-600">palette</span>
                    <span v-else-if="set.id === 'lucide'" class="w-6 h-6 flex-shrink-0" v-html="lucideLogo"></span>
                    <span v-else class="material-symbols-outlined text-indigo-600">{{ set.sourceIcon }}</span>
                    {{ set.name }}
                  </h3>
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="isDarkMode 
                      ? 'bg-indigo-900/30 text-indigo-300' 
                      : 'bg-indigo-100 text-indigo-700'"
                  >
                    {{ set.iconCount }} icons
                  </span>
                </div>
                <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ set.description }}</p>
                <div class="flex items-center gap-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  <span class="material-symbols-outlined text-base">{{ set.sourceIcon }}</span>
                  {{ set.source }}
                </div>
              </div>
            </div>

            <!-- Icons Grid -->
            <div 
              v-if="selectedSet" 
              class="flex gap-6"
            >
              <!-- Main Icons Area -->
              <div 
                class="flex-1 rounded-lg border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-4">
                    <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ getSelectedSet()?.name }} Icons
                    </h3>
                    <div v-if="selectedIcons.length > 0" class="flex items-center gap-2">
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ selectedIcons.length }} selected
                      </span>
                      <button
                        @click="copySelectedIcons"
                        class="px-3 py-1 text-sm rounded-lg transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                      >
                        Copy Selected
                      </button>
                      <button
                        @click="downloadSelectedIcons"
                        class="px-3 py-1 text-sm rounded-lg transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                      >
                        Download Selected
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewMode = 'grid'"
                      class="p-2 rounded-lg transition-colors"
                      :class="viewMode === 'grid' 
                        ? (isDarkMode 
                          ? 'bg-indigo-900/30 text-indigo-400' 
                          : 'bg-indigo-100 text-indigo-600')
                        : (isDarkMode
                          ? 'text-gray-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:bg-gray-100')"
                    >
                      <span class="material-symbols-outlined">grid_view</span>
                    </button>
                    <button
                      @click="viewMode = 'list'"
                      class="p-2 rounded-lg transition-colors"
                      :class="viewMode === 'list' 
                        ? (isDarkMode 
                          ? 'bg-indigo-900/30 text-indigo-400' 
                          : 'bg-indigo-100 text-indigo-600')
                        : (isDarkMode
                          ? 'text-gray-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:bg-gray-100')"
                    >
                      <span class="material-symbols-outlined">view_list</span>
                    </button>
                  </div>
                </div>

              <div v-if="loadingLucide && selectedSet === 'lucide'" class="flex items-center justify-center py-12">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading Lucide icons...</p>
                </div>
              </div>
              
              <div v-else-if="viewMode === 'grid'" class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon.id"
                  class="group relative rounded-lg p-4 transition-colors cursor-pointer border-2"
                  :class="isIconSelected(icon.id)
                    ? (isDarkMode 
                      ? 'bg-indigo-900/30 border-indigo-500' 
                      : 'bg-indigo-50 border-indigo-500')
                    : (isDarkMode 
                      ? 'bg-slate-700 border-transparent hover:bg-indigo-900/20 hover:border-indigo-700' 
                      : 'bg-gray-50 border-transparent hover:bg-indigo-50 hover:border-indigo-300')"
                  @click="toggleIconSelection(icon)"
                >
                  <div class="flex flex-col items-center gap-2">
                    <div 
                      class="text-2xl transition-all" 
                      :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                      :style="{ 
                        color: iconColor,
                        fontSize: `${iconSize}px`,
                        filter: `drop-shadow(0 0 ${absoluteStrokeWidth ? iconStrokeWidth : iconStrokeWidth / 24}px currentColor)`
                      }"
                      v-html="getCustomizedIcon(icon)"
                    ></div>
                    <span class="text-xs text-center truncate w-full" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ icon.name }}</span>
                  </div>
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      @click.stop="copyIcon(icon)"
                      class="p-1 rounded shadow-lg transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 text-gray-400 hover:text-indigo-400' 
                        : 'bg-white text-gray-600 hover:text-indigo-600'"
                      title="Copy icon"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button
                      @click.stop="downloadIcon(icon)"
                      class="p-1 rounded shadow-lg transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 text-gray-400 hover:text-indigo-400' 
                        : 'bg-white text-gray-600 hover:text-indigo-600'"
                      title="Download icon"
                    >
                      <span class="material-symbols-outlined text-sm">download</span>
                    </button>
                  </div>
                  <div v-if="isIconSelected(icon.id)" class="absolute top-2 left-2">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center"
                      :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'"
                    >
                      <span class="material-symbols-outlined text-white text-xs">check</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon.id"
                  class="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer border-2"
                  :class="isIconSelected(icon.id)
                    ? (isDarkMode 
                      ? 'bg-indigo-900/30 border-indigo-500' 
                      : 'bg-indigo-50 border-indigo-500')
                    : (isDarkMode 
                      ? 'bg-slate-700 border-transparent hover:bg-indigo-900/20' 
                      : 'bg-gray-50 border-transparent hover:bg-indigo-50')"
                  @click="toggleIconSelection(icon)"
                >
                  <div class="flex items-center gap-4">
                    <div 
                      class="text-xl transition-all" 
                      :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                      :style="{ 
                        color: iconColor,
                        fontSize: `${iconSize}px`
                      }"
                      v-html="getCustomizedIcon(icon)"
                    ></div>
                    <div>
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ icon.name }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ icon.category }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div v-if="isIconSelected(icon.id)" class="w-5 h-5 rounded-full flex items-center justify-center"
                      :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'"
                    >
                      <span class="material-symbols-outlined text-white text-xs">check</span>
                    </div>
                    <button
                      @click.stop="copyIcon(icon)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-800' 
                        : 'text-gray-400 hover:text-indigo-600 hover:bg-white'"
                      title="Copy icon"
                    >
                      <span class="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button
                      @click.stop="downloadIcon(icon)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-800' 
                        : 'text-gray-400 hover:text-indigo-600 hover:bg-white'"
                      title="Download icon"
                    >
                      <span class="material-symbols-outlined text-lg">download</span>
                    </button>
                  </div>
                </div>
              </div>
              </div>

              <!-- Right Sidebar: Customizer & Categories -->
              <div 
                class="w-80 flex-shrink-0 rounded-lg border p-6 h-fit sticky top-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <!-- Customizer -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Customizer</h3>
                    <button
                      @click="resetCustomizer"
                      class="p-1 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
                      title="Reset customizer"
                    >
                      <span class="material-symbols-outlined text-lg">refresh</span>
                    </button>
                  </div>
                  
                  <!-- Color -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Color</label>
                    <div class="flex items-center gap-3">
                      <button
                        @click="openColorPicker('icon', $event)"
                        class="w-10 h-10 rounded-full border-2 cursor-pointer transition-colors"
                        :class="isDarkMode 
                          ? 'border-gray-600 hover:border-indigo-400' 
                          : 'border-gray-300 hover:border-indigo-500'"
                        :style="{ backgroundColor: iconColor }"
                        title="Pick color"
                      ></button>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">current</span>
                    </div>
                  </div>
                  
                  <!-- Stroke Width -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Stroke width
                    </label>
                    <div class="flex items-center gap-3">
                      <input
                        v-model.number="iconStrokeWidth"
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'"
                      />
                      <span class="text-sm font-mono w-12 text-right" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ iconStrokeWidth }}px
                      </span>
                    </div>
                  </div>
                  
                  <!-- Size -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Size
                    </label>
                    <div class="flex items-center gap-3">
                      <input
                        v-model.number="iconSize"
                        type="range"
                        min="16"
                        max="48"
                        step="2"
                        class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'"
                      />
                      <span class="text-sm font-mono w-12 text-right" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ iconSize }}px
                      </span>
                    </div>
                  </div>
                  
                  <!-- Absolute Stroke Width -->
                  <div class="mb-4">
                    <label class="flex items-center justify-between cursor-pointer">
                      <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Absolute Stroke width
                      </span>
                      <button
                        @click="absoluteStrokeWidth = !absoluteStrokeWidth"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        :class="absoluteStrokeWidth 
                          ? (isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600')
                          : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')"
                      >
                        <span
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          :class="absoluteStrokeWidth ? 'translate-x-6' : 'translate-x-1'"
                        ></span>
                      </button>
                    </label>
                  </div>
                </div>

                <!-- Include External Libs -->
                <div class="mb-6">
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Include external libs
                  </h3>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="includeLab"
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      :class="isDarkMode 
                        ? 'accent-indigo-500' 
                        : 'accent-indigo-600'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Lab</span>
                  </label>
                </div>

                <!-- View Filter -->
                <div class="mb-6">
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">View</h3>
                  <div class="flex gap-2">
                    <button
                      @click="viewFilter = 'all'"
                      class="px-3 py-1 text-sm rounded transition-colors"
                      :class="viewFilter === 'all'
                        ? (isDarkMode 
                          ? 'bg-red-900/30 text-red-300' 
                          : 'bg-red-100 text-red-700')
                        : (isDarkMode
                          ? 'text-gray-400 hover:text-gray-300' 
                          : 'text-gray-600 hover:text-gray-900')"
                    >
                      All
                    </button>
                  </div>
                </div>

                <!-- Categories -->
                <div>
                  <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Categories</h3>
                  <div class="space-y-1">
                    <button
                      v-for="category in categoriesWithCounts"
                      :key="category.name"
                      @click="selectedCategory = selectedCategory === category.name ? null : category.name"
                      class="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors text-left relative"
                      :class="selectedCategory === category.name
                        ? (isDarkMode 
                          ? 'bg-indigo-900/30 text-indigo-300' 
                          : 'bg-indigo-50 text-indigo-700')
                        : (isDarkMode
                          ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')"
                    >
                      <span class="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" 
                        :class="selectedCategory === category.name 
                          ? (isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600')
                          : ''"
                      ></span>
                      <span class="pl-2">{{ category.name }}</span>
                      <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        {{ category.count }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showUploadModal = false"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Upload Icon Set</h3>
            <button
              @click="showUploadModal = false"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Icon Set Name
            </label>
            <input
              v-model="newSetName"
              type="text"
              placeholder="e.g., Material Icons, Lucide Icons, Custom Set"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Source Type
            </label>
            <select
              v-model="newSetSource"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="material">Material Icons</option>
              <option value="lucide">Lucide Icons</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Upload Files
            </label>
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
              :class="isDragging 
                ? (isDarkMode 
                  ? 'border-indigo-500 bg-indigo-900/20' 
                  : 'border-indigo-500 bg-indigo-50')
                : (isDarkMode 
                  ? 'border-gray-600' 
                  : 'border-gray-300')"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".svg,.woff,.woff2,.ttf,.eot"
                @change="handleFileSelect"
                class="hidden"
              />
              <span class="material-symbols-outlined text-4xl mb-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">cloud_upload</span>
              <p class="mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Drag and drop icon files here, or
                <button
                  @click="fileInput?.click()"
                  class="hover:underline"
                  :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
                >
                  browse
                </button>
              </p>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Supported formats: SVG files, SVG sprite sheets, icon fonts (WOFF, WOFF2, TTF, EOT)
              </p>
            </div>
            <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-50'"
              >
                <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ file.name }}</span>
                <button
                  @click="removeFile(index)"
                  class="transition-colors"
                  :class="isDarkMode 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-red-600 hover:text-red-700'"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button
              @click="showUploadModal = false"
              class="px-4 py-2 border rounded-lg transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
            <button
              @click="uploadIconSet"
              :disabled="!newSetName || selectedFiles.length === 0"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
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
import { ref, computed, onMounted, onBeforeUnmount, h, createApp, watch } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ColorPicker from '../components/ColorPicker.vue';
import Dropdown from '../components/Dropdown.vue';
import * as LucideIcons from 'lucide-vue-next';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const showUploadModal = ref(false);
const searchQuery = ref('');
const selectedSet = ref('');
const viewMode = ref('grid');
const newSetName = ref('');
const newSetSource = ref('custom');
const selectedFiles = ref([]);
const isDragging = ref(false);
const fileInput = ref(null);
const loadingLucide = ref(false);

// Customizer state
const iconColor = ref(isDarkMode.value ? '#ffffff' : '#000000');
const iconStrokeWidth = ref(2);
const iconSize = ref(24);
const absoluteStrokeWidth = ref(false);
const includeLab = ref(false);
const viewFilter = ref('all');
const selectedCategory = ref(null);
const selectedIcons = ref([]);
const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const currentPickerType = ref('icon');

// Load Lucide icons dynamically
const loadLucideIcons = async () => {
  loadingLucide.value = true;
  try {
    // Curated list of popular Lucide icons
    const lucideIconList = [
      'Home', 'Search', 'Heart', 'Star', 'User', 'Settings', 'Menu', 'X', 'Check', 'Plus', 'Minus',
      'Edit', 'Trash', 'Download', 'Upload', 'Share', 'Copy', 'Save', 'File', 'Folder', 'Image',
      'Video', 'Music', 'Mail', 'Phone', 'Message', 'Bell', 'Calendar', 'Clock', 'Map', 'Globe',
      'Link', 'ExternalLink', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ChevronLeft',
      'ChevronRight', 'ChevronUp', 'ChevronDown', 'Filter', 'Sort', 'Grid', 'List', 'Eye',
      'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield', 'AlertCircle', 'AlertTriangle', 'Info',
      'CheckCircle', 'XCircle', 'HelpCircle', 'Zap', 'Sun', 'Moon', 'Cloud', 'CloudRain', 'Wind',
      'Activity', 'BarChart', 'LineChart', 'PieChart', 'TrendingUp', 'TrendingDown', 'DollarSign',
      'CreditCard', 'ShoppingCart', 'Package', 'Tag', 'Tags', 'Bookmark', 'Book', 'BookOpen',
      'FileText', 'FileCode', 'Code', 'Terminal', 'Database', 'Server', 'Wifi', 'Bluetooth',
      'Camera', 'Mic', 'Volume', 'VolumeX', 'Play', 'Pause', 'SkipForward', 'SkipBack',
      'Github', 'Twitter', 'Facebook', 'Instagram', 'Linkedin', 'Youtube', 'Discord', 'Slack',
      'Monitor', 'Laptop', 'Smartphone', 'Tablet', 'Watch', 'Headphones', 'Speaker', 'Printer',
      'Scan', 'QrCode', 'Barcode', 'Fingerprint', 'Wand', 'Sparkles', 'Palette', 'Paintbrush',
      'Brush', 'Eraser', 'Crop', 'RotateCw', 'RotateCcw', 'FlipHorizontal', 'FlipVertical',
      'ZoomIn', 'ZoomOut', 'Target', 'Layers', 'Layout', 'Sidebar', 'Panel', 'Columns', 'Rows',
      'Bold', 'Italic', 'Underline', 'Strikethrough', 'Heading', 'Paragraph', 'Quote',
      'Circle', 'Square', 'Triangle', 'Hexagon', 'Diamond', 'Smile', 'ThumbsUp', 'ThumbsDown',
      'Flag', 'Award', 'Trophy', 'Gift', 'Coffee', 'Pizza', 'Burger', 'Apple', 'Banana'
    ];

    const lucideIcons = [];
    const categories = {
      'Navigation': ['Home', 'Search', 'Menu', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown', 'ChevronsLeft', 'ChevronsRight', 'ChevronsUp', 'ChevronsDown'],
      'Actions': ['Plus', 'Minus', 'X', 'Check', 'Edit', 'Trash', 'Copy', 'Save', 'Download', 'Upload', 'Share', 'Heart', 'Star', 'Bookmark', 'Flag'],
      'Media': ['Play', 'Pause', 'SkipForward', 'SkipBack', 'Repeat', 'Shuffle', 'Volume', 'VolumeX', 'Mic', 'Camera', 'Image', 'Video', 'Music'],
      'Communication': ['Mail', 'Phone', 'Message', 'Bell', 'Send', 'Reply', 'Forward', 'Archive', 'Inbox', 'Outbox'],
      'Files': ['File', 'Folder', 'FileText', 'FileCode', 'Save', 'Download', 'Upload', 'Archive', 'FolderOpen', 'FolderPlus'],
      'Settings': ['Settings', 'User', 'Users', 'Shield', 'Lock', 'Unlock', 'Key', 'Cog', 'Sliders', 'Filter'],
      'Shapes': ['Circle', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'Diamond', 'Star', 'Heart'],
      'Charts': ['BarChart', 'LineChart', 'PieChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Gauge'],
      'Weather': ['Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'Wind', 'Droplet', 'Umbrella'],
      'Food': ['Coffee', 'Pizza', 'Burger', 'IceCream', 'Apple', 'Banana', 'Cherry', 'Grape'],
      'Objects': ['Box', 'Package', 'Gift', 'ShoppingCart', 'CreditCard', 'Wallet', 'Key', 'Lock'],
      'Arrows': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'MoveUp', 'MoveDown', 'MoveLeft', 'MoveRight'],
      'Status': ['CheckCircle', 'XCircle', 'AlertCircle', 'Info', 'HelpCircle', 'Zap', 'AlertTriangle'],
      'Social': ['Github', 'Twitter', 'Facebook', 'Instagram', 'Linkedin', 'Youtube', 'Discord', 'Slack'],
      'Devices': ['Monitor', 'Laptop', 'Smartphone', 'Tablet', 'Watch', 'Headphones', 'Speaker', 'Printer'],
      'Editing': ['Edit', 'Crop', 'RotateCw', 'RotateCcw', 'FlipHorizontal', 'FlipVertical', 'ZoomIn', 'ZoomOut'],
      'Layout': ['Grid', 'List', 'Columns', 'Rows', 'Sidebar', 'Layout', 'Layers', 'Panel'],
      'Text': ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Heading', 'Paragraph', 'List', 'ListOrdered'],
      'Misc': ['Zap', 'Sparkles', 'Wand', 'Palette', 'Paintbrush', 'Brush', 'Eraser', 'Target']
    };

    // Load icons dynamically
    for (const iconName of lucideIconList) {
      try {
        const IconComponent = LucideIcons[iconName];
        if (IconComponent && typeof IconComponent === 'function') {
          // Create SVG string from icon using renderToString approach
          const tempDiv = document.createElement('div');
          const app = createApp({
            render: () => h(IconComponent, { size: 24, strokeWidth: 2 })
          });
          app.mount(tempDiv);
          
          await new Promise(resolve => setTimeout(resolve, 0)); // Wait for render
          
          const svgElement = tempDiv.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('stroke', 'currentColor');
            svgElement.setAttribute('fill', 'none');
            svgElement.setAttribute('viewBox', '0 0 24 24');
            
            // Find category
            let category = 'Misc';
            for (const [cat, icons] of Object.entries(categories)) {
              if (icons.includes(iconName)) {
                category = cat;
                break;
              }
            }
            
            lucideIcons.push({
              id: `lucide-${iconName.toLowerCase()}`,
              name: iconName.toLowerCase(),
              category: category,
              svg: svgElement.outerHTML
            });
          }
          app.unmount();
        }
      } catch (error) {
        console.warn(`Failed to load icon ${iconName}:`, error);
      }
    }

    // Update Lucide icon set
    const lucideSet = iconSets.value.find(set => set.id === 'lucide');
    if (lucideSet) {
      lucideSet.icons = lucideIcons;
      lucideSet.iconCount = lucideIcons.length;
    }
  } catch (error) {
    console.error('Error loading Lucide icons:', error);
  } finally {
    loadingLucide.value = false;
  }
};

const iconSets = ref([
  {
    id: 'material',
    name: 'Material Icons',
    source: 'Google',
    sourceIcon: 'palette',
    description: 'Material Design icons from Google',
    iconCount: 2000,
    icons: [
      { id: 'home', name: 'home', category: 'Navigation', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
      { id: 'search', name: 'search', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>' },
      { id: 'favorite', name: 'favorite', category: 'Action', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
    ]
  },
  {
    id: 'lucide',
    name: 'Lucide Icons',
    source: 'Lucide',
    sourceIcon: 'auto_awesome',
    description: 'Beautiful & consistent icon toolkit',
    iconCount: 0,
    icons: []
  }
]);

const filteredSets = computed(() => {
  if (!searchQuery.value) return iconSets.value;
  const query = searchQuery.value.toLowerCase();
  return iconSets.value.filter(set =>
    set.name.toLowerCase().includes(query) ||
    set.description.toLowerCase().includes(query) ||
    set.source.toLowerCase().includes(query)
  );
});

const filteredIcons = computed(() => {
  const set = getSelectedSet();
  if (!set) return [];
  let icons = set.icons || [];
  
  // Filter by category
  if (selectedCategory.value) {
    icons = icons.filter(icon => icon.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    icons = icons.filter(icon =>
      icon.name.toLowerCase().includes(query) ||
      icon.category.toLowerCase().includes(query)
    );
  }
  
  return icons;
});

// Categories with counts
const categoriesWithCounts = computed(() => {
  const set = getSelectedSet();
  if (!set) return [];
  
  const categoryMap = {};
  set.icons?.forEach(icon => {
    const cat = icon.category || 'Misc';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  
  return Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Get customized icon SVG
const getCustomizedIcon = (icon) => {
  if (!icon.svg) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svg, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (!svgElement) return icon.svg;
  
  // Check if icon uses fill or stroke
  const hasFill = svgElement.getAttribute('fill') && svgElement.getAttribute('fill') !== 'none';
  const hasStroke = svgElement.getAttribute('stroke') && svgElement.getAttribute('stroke') !== 'none';
  
  // Apply customizations
  if (hasFill) {
    svgElement.setAttribute('fill', iconColor.value);
  } else if (hasStroke) {
    svgElement.setAttribute('stroke', iconColor.value);
    svgElement.setAttribute('fill', 'none');
    
    const strokeWidth = absoluteStrokeWidth.value 
      ? iconStrokeWidth.value 
      : (iconStrokeWidth.value / 24) * iconSize.value;
    
    svgElement.setAttribute('stroke-width', strokeWidth.toString());
  } else {
    // Default to stroke for Lucide icons
    svgElement.setAttribute('stroke', iconColor.value);
    svgElement.setAttribute('fill', 'none');
    
    const strokeWidth = absoluteStrokeWidth.value 
      ? iconStrokeWidth.value 
      : (iconStrokeWidth.value / 24) * iconSize.value;
    
    svgElement.setAttribute('stroke-width', strokeWidth.toString());
  }
  
  svgElement.setAttribute('width', `${iconSize.value}`);
  svgElement.setAttribute('height', `${iconSize.value}`);
  
  return svgElement.outerHTML;
};

// Icon selection
const toggleIconSelection = (icon) => {
  const index = selectedIcons.value.findIndex(i => i.id === icon.id);
  if (index > -1) {
    selectedIcons.value.splice(index, 1);
  } else {
    selectedIcons.value.push(icon);
  }
};

const isIconSelected = (iconId) => {
  return selectedIcons.value.some(i => i.id === iconId);
};

// Copy/Download functions
const copyIcon = async (icon) => {
  try {
    const customizedSvg = getCustomizedIcon(icon);
    await navigator.clipboard.writeText(customizedSvg);
    // Could add toast notification here
    alert('Icon copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy icon:', err);
  }
};

const downloadIcon = (icon) => {
  const customizedSvg = getCustomizedIcon(icon);
  const blob = new Blob([customizedSvg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${icon.name}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const copySelectedIcons = async () => {
  if (selectedIcons.value.length === 0) return;
  
  try {
    const svgs = selectedIcons.value.map(icon => getCustomizedIcon(icon)).join('\n\n');
    await navigator.clipboard.writeText(svgs);
    alert(`${selectedIcons.value.length} icons copied to clipboard!`);
  } catch (err) {
    console.error('Failed to copy icons:', err);
  }
};

const downloadSelectedIcons = () => {
  if (selectedIcons.value.length === 0) return;
  
  selectedIcons.value.forEach((icon, index) => {
    setTimeout(() => {
      downloadIcon(icon);
    }, index * 100); // Stagger downloads
  });
};

// Reset customizer
const resetCustomizer = () => {
  iconColor.value = isDarkMode.value ? '#ffffff' : '#000000';
  iconStrokeWidth.value = 2;
  iconSize.value = 24;
  absoluteStrokeWidth.value = false;
};

// Color picker
const openColorPicker = (type, event) => {
  if (event) {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    // Calculate position relative to viewport
    let left = rect.right + padding;
    let top = rect.top;
    
    // Check if picker would go off right edge
    if (left + pickerWidth > window.innerWidth) {
      left = rect.left - pickerWidth - padding;
    }
    
    // Check if picker would go off left edge
    if (left < padding) {
      left = padding;
    }
    
    // Check if picker would go off bottom edge
    if (top + pickerHeight > window.innerHeight - padding) {
      top = window.innerHeight - pickerHeight - padding;
    }
    
    // Check if picker would go off top edge
    if (top < padding) {
      top = padding;
    }
    
    // Ensure picker stays within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  
  currentPickerType.value = type;
  pickerColor.value = iconColor.value;
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentPickerType.value === 'icon') {
    iconColor.value = color;
  }
  showColorPicker.value = false;
};

const getSelectedSet = () => {
  return iconSets.value.find(set => set.id === selectedSet.value);
};

const lucideLogo = computed(() => {
  // Lucide logo SVG - dark mode version
  if (isDarkMode.value) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M14 12C14 9.79086 12.2091 8 10 8C7.79086 8 6 9.79086 6 12C6 16.4183 9.58172 20 14 20C18.4183 20 22 16.4183 22 12C22 8.446 20.455 5.25285 18 3.05557" stroke="#fff" />
      <path d="M10 12C10 14.2091 11.7909 16 14 16C16.2091 16 18 14.2091 18 12C18 7.58172 14.4183 4 10 4C5.58172 4 2 7.58172 2 12C2 15.5841 3.57127 18.8012 6.06253 21" stroke="#F56565" />
    </svg>`;
  }
  // Lucide logo SVG - light mode version
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
    <path d="M14 12C14 9.79086 12.2091 8 10 8C7.79086 8 6 9.79086 6 12C6 16.4183 9.58172 20 14 20C18.4183 20 22 16.4183 22 12C22 8.446 20.455 5.25285 18 3.05557" stroke="#2D3748" />
    <path d="M10 12C10 14.2091 11.7909 16 14 16C16.2091 16 18 14.2091 18 12C18 7.58172 14.4183 4 10 4C5.58172 4 2 7.58172 2 12C2 15.5841 3.57127 18.8012 6.06253 21" stroke="#F56565" />
  </svg>`;
});

const handleDrop = (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  addFiles(files);
};

const addFiles = (files) => {
  const validFiles = files.filter(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['svg', 'woff', 'woff2', 'ttf', 'eot'].includes(ext);
  });
  selectedFiles.value.push(...validFiles);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const uploadIconSet = async () => {
  if (!newSetName.value || selectedFiles.value.length === 0) return;
  
  // TODO: Implement actual upload logic
  // For now, just add to iconSets
  const newSet = {
    id: newSetName.value.toLowerCase().replace(/\s+/g, '-'),
    name: newSetName.value,
    source: newSetSource.value === 'material' ? 'Google' : newSetSource.value === 'lucide' ? 'Lucide' : 'Custom',
    sourceIcon: newSetSource.value === 'material' ? 'palette' : newSetSource.value === 'lucide' ? 'auto_awesome' : 'upload',
    description: `Custom icon set uploaded from ${newSetSource.value}`,
    iconCount: selectedFiles.value.length,
    icons: [] // Would be parsed from uploaded files
  };
  
  iconSets.value.push(newSet);
  selectedSet.value = newSet.id;
  showUploadModal.value = false;
  newSetName.value = '';
  selectedFiles.value = [];
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

watch(selectedSet, () => {
  selectedIcons.value = [];
  selectedCategory.value = null;
});

watch(selectedCategory, () => {
  selectedIcons.value = [];
});

watch(isDarkMode, (newValue) => {
  // Update icon color to match theme
  if (iconColor.value === '#000000' || iconColor.value === '#ffffff') {
    iconColor.value = newValue ? '#ffffff' : '#000000';
  }
});

onMounted(() => {
  // Load Lucide icons on mount
  loadLucideIcons();
  
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

