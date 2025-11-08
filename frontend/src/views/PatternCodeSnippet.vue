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
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      {{ pattern.title }}
                    </h1>
                    <span 
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      :class="getComplexityClass(pattern.complexity)"
                    >
                      {{ pattern.complexity }}
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    {{ pattern.description }}
                  </p>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">category</span>
                      {{ getCategoryLabel(pattern.category) }}
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">code</span>
                      {{ pattern.useCase }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient :id="`codePatternHeroGradient-${pattern.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <g v-html="getPatternSVGContent"></g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Playground Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Interactive Playground</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Experiment with the pattern code. Switch between frameworks and copy code snippets.</p>
            </div>

            <!-- Generated Code -->
            <div 
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code</span>
                  Generated Code
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    @click="copyCode"
                    class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium flex items-center gap-1.5"
                  >
                    <span class="material-symbols-outlined text-sm">content_copy</span>
                    Copy
                  </button>
                  <button
                    @click="viewingFramework = 'vue'"
                    class="px-3 py-1.5 border rounded-lg transition-colors text-xs font-medium"
                    :class="viewingFramework === 'vue'
                      ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-600 text-white border-indigo-600')
                      : (isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50')"
                  >
                    Vue
                  </button>
                  <button
                    @click="viewingFramework = 'react'"
                    class="px-3 py-1.5 border rounded-lg transition-colors text-xs font-medium"
                    :class="viewingFramework === 'react'
                      ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-600 text-white border-indigo-600')
                      : (isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50')"
                  >
                    React
                  </button>
                  <button
                    @click="viewingFramework = 'html'"
                    class="px-3 py-1.5 border rounded-lg transition-colors text-xs font-medium"
                    :class="viewingFramework === 'html'
                      ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-600 text-white border-indigo-600')
                      : (isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50')"
                  >
                    HTML
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>{{ currentCode }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage and Props Section -->
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
            <!-- Usage Example -->
            <div 
              class="rounded-2xl border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined">info</span>
                Usage Example
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ pattern.usageExample }}
              </p>
            </div>

            <!-- Props -->
            <div 
              class="rounded-2xl border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined">settings</span>
                Properties
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="prop in pattern.props"
                  :key="prop.name"
                  class="pb-3 border-b last:border-0"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">
                      {{ prop.name }}
                    </code>
                    <span 
                      class="text-xs px-2 py-0.5 rounded"
                      :class="prop.required 
                        ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')"
                    >
                      {{ prop.required ? 'required' : 'optional' }}
                    </span>
                    <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ prop.type }}
                    </span>
                  </div>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ prop.description }}
                  </p>
                  <p v-if="prop.default !== undefined && prop.default !== ''" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Default: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">{{ prop.default }}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Usage Examples -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Usage Examples</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Common patterns and use cases for implementing this pattern in your application.</p>
            </div>
            
            <div class="space-y-6">
              <div 
                v-for="(example, index) in getUsageExamples()"
                :key="index"
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ example.title }}</h3>
                <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ example.description }}</p>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono" v-pre><code>{{ example.code }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Accessibility -->
          <div class="max-w-7xl mx-auto mb-16">
            <div 
              class="border rounded-2xl p-8"
              :class="isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'"
            >
              <div class="flex items-start gap-4">
                <span class="material-symbols-outlined text-3xl flex-shrink-0" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">accessibility</span>
                <div>
                  <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Accessibility</h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li 
                      v-for="(guideline, index) in getAccessibilityGuidelines()"
                      :key="index"
                      class="flex items-start gap-2"
                    >
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span v-html="guideline"></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div 
              class="rounded-lg shadow-sm border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">speed</span>
                  Pattern Performance
                </h2>
              </div>
              
              <div class="p-6">
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code</span>
                      Code Size
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatCodeSize(currentCode) }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ getFrameworkLabel(viewingFramework) }}
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">psychology</span>
                      Complexity
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ pattern.complexity }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ getComplexityDescription(pattern.complexity) }}
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">category</span>
                      Category
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ getCategoryLabel(pattern.category) }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ pattern.useCase }}
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      Status
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Production Ready
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ currentVersion.version }}
                    </div>
                  </div>
                </div>

                <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h3 class="text-lg font-semibold flex items-center gap-2 mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">info</span>
                    Pattern Information
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Frameworks Supported:</p>
                      <div class="flex flex-wrap gap-2">
                        <span 
                          v-for="fw in getSupportedFrameworks()"
                          :key="fw"
                          class="px-2 py-1 rounded text-xs font-medium"
                          :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'"
                        >
                          {{ fw.toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Tags:</p>
                      <div class="flex flex-wrap gap-2">
                        <span 
                          v-for="tag in pattern.tags || []"
                          :key="tag"
                          class="px-2 py-1 rounded text-xs font-medium"
                          :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Version History -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Version History</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Track pattern versions, view changelogs, and manage breaking changes.</p>
            </div>

            <!-- Current Version Info -->
            <div 
              v-if="currentVersion.version"
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Current Version: v{{ currentVersion.version }}
                  </h3>
                  <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ currentVersion.description }}
                  </p>
                </div>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(currentVersion.status)"
                >
                  {{ currentVersion.status }}
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                <span>Released: {{ formatDate(currentVersion.releasedAt || currentVersion.date) }}</span>
                <span v-if="currentVersion.lastUpdated">Last Updated: {{ formatDate(currentVersion.lastUpdated) }}</span>
              </div>
            </div>

            <!-- Version History List -->
            <div 
              v-if="patternVersions.length > 0"
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <div
                  v-for="version in patternVersions"
                  :key="version.version"
                  class="p-6"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          v{{ version.version }}
                        </h4>
                        <span 
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="getStatusBadgeClass(version.status)"
                        >
                          {{ version.status }}
                        </span>
                        <span 
                          v-if="version.breaking"
                          class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        >
                          Breaking Changes
                        </span>
                      </div>
                      <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ version.description }}
                      </p>
                      <div class="text-xs mb-3" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Released: {{ formatDate(version.releasedAt || version.date) }}
                      </div>
                    </div>
                  </div>

                  <!-- Changelog -->
                  <div v-if="version.changelog && version.changelog.length > 0" class="ml-6 border-l-2 pl-4 mb-4"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <h5 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Changelog
                    </h5>
                    <ul class="space-y-1 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <li v-for="(change, idx) in version.changelog" :key="idx" class="flex items-start gap-2">
                        <span class="mt-1" :class="getChangeTypeColor(change.type)">
                          {{ getChangeTypeIcon(change.type) }}
                        </span>
                        <span>{{ change.description }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Migration Guide -->
                  <div v-if="version.migrationGuide" class="mt-4 p-4 rounded-lg"
                    :class="isDarkMode ? 'bg-slate-800 border border-gray-700' : 'bg-yellow-50 border border-yellow-200'"
                  >
                    <div class="flex items-start gap-2 mb-2">
                      <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
                      <h5 class="text-sm font-semibold" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-900'">
                        Migration Guide
                      </h5>
                    </div>
                    <p class="text-sm" :class="isDarkMode ? 'text-yellow-200' : 'text-yellow-800'">
                      {{ version.migrationGuide }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-else
              class="rounded-lg shadow-sm border p-12 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                history
              </span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No version history
              </p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Version history will appear here once versions are added
              </p>
            </div>
          </div>

          <!-- Related Patterns & Components -->
          <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Related Patterns & Components</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Patterns and components that work well with this pattern or serve similar purposes.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
              <router-link 
                v-for="related in getRelatedItems()"
                :key="related.id"
                :to="related.path"
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ related.icon }}</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    {{ related.title }}
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ related.description }}
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { patternSnippets } from '../data/patternSnippets.js';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const viewingFramework = ref('vue');

const pattern = computed(() => {
  // Map route paths to pattern IDs
  const routeToIdMap = {
    '/patterns/form-validation': 'form-validation',
    '/patterns/accessible-modal': 'modal-component',
    '/patterns/sortable-data-table': 'data-table',
    '/patterns/login-form': 'authentication-form',
    '/patterns/responsive-navigation': 'navigation-menu',
    '/patterns/toast-notification': 'toast-notification'
  };
  
  const patternId = routeToIdMap[route.path] || route.params.id;
  return patternSnippets.find(p => p.id === patternId) || patternSnippets[0];
});

const currentCode = computed(() => {
  return pattern.value?.code?.[viewingFramework.value] || pattern.value?.code?.vue || '';
});

const getCategoryLabel = (category) => {
  const labels = {
    'forms': 'Forms',
    'navigation': 'Navigation',
    'data-display': 'Data Display',
    'feedback': 'Feedback',
    'layout': 'Layout',
    'authentication': 'Authentication',
    'utilities': 'Utilities'
  };
  return labels[category] || category;
};

const getComplexityClass = (complexity) => {
  const classes = {
    'Beginner': isDarkMode.value ? 'bg-green-900/30 text-green-400 border border-green-400/30' : 'bg-green-100 text-green-800',
    'Intermediate': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-400/30' : 'bg-yellow-100 text-yellow-800',
    'Advanced': isDarkMode.value ? 'bg-red-900/30 text-red-400 border border-red-400/30' : 'bg-red-100 text-red-800'
  };
  return classes[complexity] || classes['Intermediate'];
};

const getPatternSVGContent = computed(() => {
  const patternId = pattern.value?.id;
  const gradientId = `codePatternHeroGradient-${patternId}`;
  
  // Use consistent opacity values that work well on dark gradient backgrounds
  // Following the same pattern as PatternNavigation and other pattern pages
  const svgContent = {
    'form-validation': `
      <!-- Form with validation checkmark -->
      <rect x="50" y="50" width="100" height="120" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="60" y="60" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="80" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="100" width="60" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="150" cy="70" r="10" fill="url(#${gradientId})" opacity="0.7"/>
      <path d="M 145 70 L 148 73 L 155 66" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <rect x="60" y="120" width="50" height="10" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
    `,
    'modal-component': `
      <!-- Modal dialog -->
      <rect x="40" y="40" width="120" height="120" rx="6" fill="url(#${gradientId})" opacity="0.4"/>
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="50" y="50" width="100" height="20" rx="4" fill="url(#${gradientId})" opacity="0.6"/>
      <line x1="60" y1="80" x2="140" y2="80" stroke="white" stroke-width="2.5" opacity="0.6"/>
      <line x1="60" y1="100" x2="120" y2="100" stroke="white" stroke-width="2.5" opacity="0.6"/>
      <rect x="70" y="120" width="30" height="8" rx="2" fill="url(#${gradientId})" opacity="0.7"/>
      <rect x="110" y="120" width="30" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="140" cy="60" r="6" fill="url(#${gradientId})" opacity="0.7"/>
      <line x1="137" y1="60" x2="143" y2="60" stroke="white" stroke-width="2.5" opacity="0.9"/>
    `,
    'data-table': `
      <!-- Data table -->
      <rect x="40" y="50" width="120" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="40" y="50" width="120" height="15" rx="4" fill="url(#${gradientId})" opacity="0.5"/>
      <line x1="50" y1="65" x2="150" y2="65" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <line x1="50" y1="80" x2="150" y2="80" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="95" x2="150" y2="95" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="110" x2="150" y2="110" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="125" x2="150" y2="125" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="80" y1="50" x2="80" y2="150" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <line x1="120" y1="50" x2="120" y2="150" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <circle cx="140" cy="58" r="4" fill="url(#${gradientId})" opacity="0.7"/>
      <path d="M 137 58 L 140 55 L 143 58 M 140 55 L 140 61" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    `,
    'authentication-form': `
      <!-- Login form with lock -->
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <circle cx="100" cy="70" r="12" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="88" y="70" width="24" height="20" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="60" y="100" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="115" width="80" height="8" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="70" y="130" width="60" height="10" rx="2" fill="url(#${gradientId})" opacity="0.7"/>
    `,
    'navigation-menu': `
      <!-- Navigation menu -->
      <rect x="50" y="50" width="100" height="100" rx="4" fill="url(#${gradientId})" opacity="0.3"/>
      <rect x="60" y="60" width="80" height="6" rx="2" fill="url(#${gradientId})" opacity="0.6"/>
      <rect x="60" y="75" width="60" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="90" width="70" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="105" width="55" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <rect x="60" y="120" width="65" height="6" rx="2" fill="url(#${gradientId})" opacity="0.5"/>
      <circle cx="145" cy="63" r="5" fill="url(#${gradientId})" opacity="0.6"/>
      <path d="M 142 63 L 145 60 L 148 63" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
    `,
    'toast-notification': `
      <!-- Toast notification -->
      <rect x="50" y="80" width="100" height="60" rx="4" fill="url(#${gradientId})" opacity="0.4"/>
      <rect x="50" y="80" width="100" height="15" rx="4" fill="url(#${gradientId})" opacity="0.6"/>
      <line x1="60" y1="105" x2="140" y2="105" stroke="white" stroke-width="2" opacity="0.6"/>
      <line x1="60" y1="120" x2="120" y2="120" stroke="white" stroke-width="2" opacity="0.5"/>
      <circle cx="140" cy="88" r="5" fill="url(#${gradientId})" opacity="0.7"/>
      <line x1="137" y1="88" x2="143" y2="88" stroke="white" stroke-width="2.5" opacity="0.9"/>
      <circle cx="60" cy="88" r="4" fill="url(#${gradientId})" opacity="0.8"/>
      <path d="M 58 88 L 60 90 L 62 88" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    `
  };
  
  return svgContent[patternId] || svgContent['form-validation'];
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(currentCode.value);
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Usage Examples
const getUsageExamples = () => {
  const patternId = pattern.value?.id;
  const examples = {
    'form-validation': [
      {
        title: 'Basic Email Validation',
        description: 'Simple email validation with error messages and accessibility support',
        code: `<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :aria-invalid="errors.email ? 'true' : 'false'"
        :aria-describedby="errors.email ? 'email-error' : undefined"
      />
      <div v-if="errors.email" id="email-error" role="alert" class="error">
        {{ errors.email }}
      </div>
    </div>
    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>` + '<' + 'script setup>' + `
import { ref, computed } from 'vue';

const form = ref({ email: '' });
const errors = ref({});

const isValid = computed(() => {
  return form.value.email && !errors.value.email;
});

const validateEmail = (email) => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

const handleSubmit = () => {
  errors.value = {};
  if (!validateEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }
  if (isValid.value) {
    // Submit form
  }
};
` + '</' + 'script' + '>'
      },
      {
        title: 'Multi-Field Validation',
        description: 'Validate multiple fields with custom rules and real-time feedback',
        code: `<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.name" class="form-group">
      <label :for="field.name">{{ field.label }}</label>
      <input
        :id="field.name"
        v-model="form[field.name]"
        :type="field.type"
        :aria-invalid="errors[field.name] ? 'true' : 'false'"
        :aria-describedby="errors[field.name] ? field.name + '-error' : undefined"
        @blur="validateField(field.name)"
      />
      <div v-if="errors[field.name]" :id="field.name + '-error'" role="alert" class="error">
        {{ errors[field.name] }}
      </div>
    </div>
    <button type="submit" :disabled="!isFormValid">Submit</button>
  </form>
</template>` + '<' + 'script setup>' + `
import { ref, computed } from 'vue';

const form = ref({ name: '', email: '', phone: '' });
const errors = ref({});
const fields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' }
];

const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0 && 
         form.value.name && 
         form.value.email && 
         form.value.phone;
});

const validateField = (fieldName) => {
  // Add validation logic here
};
` + '</' + 'script' + '>'
      }
    ],
    'modal-component': [
      {
        title: 'Basic Modal',
        description: 'Simple modal with focus trap, keyboard support, and accessibility',
        code: `<template>
  <div v-if="isOpen" class="modal-overlay" @click="close" @keydown.esc="close">
    <div 
      class="modal-content" 
      @click.stop
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">Modal Title</h2>
        <button @click="close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <button @click="close">Cancel</button>
        <button @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

` + '<' + 'script setup>' + `
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'confirm']);

const close = () => emit('close');
const confirm = () => emit('confirm');

// Focus trap implementation
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Trap focus logic
  }
});
` + '</' + 'script' + '>'
      }
    ],
    'data-table': [
      {
        title: 'Sortable Table',
        description: 'Table with sortable columns, keyboard navigation, and screen reader support',
        code: `<template>
  <table>
    <thead>
      <tr>
        <th 
          @click="sort('name')"
          :aria-sort="sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
          tabindex="0"
          @keydown.enter="sort('name')"
        >
          Name
          <span v-if="sortColumn === 'name'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
        <th 
          @click="sort('date')"
          :aria-sort="sortColumn === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
          tabindex="0"
          @keydown.enter="sort('date')"
        >
          Date
          <span v-if="sortColumn === 'date'">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in sortedData" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.date }}</td>
      </tr>
    </tbody>
  </table>
</template>

` + '<' + 'script setup>' + `
import { ref, computed } from 'vue';

const data = ref([...]);
const sortColumn = ref(null);
const sortDirection = ref('asc');

const sortedData = computed(() => {
  if (!sortColumn.value) return data.value;
  return [...data.value].sort((a, b) => {
    // Sort logic
  });
});

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};
` + '</' + 'script' + '>'
      }
    ],
    'authentication-form': [
      {
        title: 'Login Form',
        description: 'Complete login form with validation, accessibility, and security best practices',
        code: `<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        autocomplete="username"
        :aria-invalid="errors.username ? 'true' : 'false'"
        required
      />
      <div v-if="errors.username" role="alert" class="error">
        {{ errors.username }}
      </div>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        :aria-invalid="errors.password ? 'true' : 'false'"
        required
      />
      <div v-if="errors.password" role="alert" class="error">
        {{ errors.password }}
      </div>
    </div>
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>` + '<' + 'script setup>' + `
import { ref } from 'vue';

const form = ref({ username: '', password: '' });
const errors = ref({});
const isLoading = ref(false);

const handleLogin = async () => {
  errors.value = {};
  isLoading.value = true;
  try {
    // Authentication logic
  } catch (error) {
    errors.value.general = 'Invalid credentials';
  } finally {
    isLoading.value = false;
  }
};
` + '</' + 'script' + '>'
      }
    ],
    'navigation-menu': [
      {
        title: 'Responsive Navigation',
        description: 'Accessible navigation menu with keyboard support and mobile responsiveness',
        code: `<template>
  <nav role="navigation" aria-label="Main navigation">
    <button 
      @click="toggleMobileMenu"
      aria-expanded="isMobileMenuOpen"
      aria-controls="mobile-menu"
      class="mobile-toggle"
    >
      Menu
    </button>
    <ul :id="isMobileMenuOpen ? 'mobile-menu' : undefined" :class="{ 'mobile-open': isMobileMenuOpen }">
      <li v-for="item in navItems" :key="item.path">
        <router-link
          :to="item.path"
          :aria-current="isCurrentPage(item.path) ? 'page' : undefined"
          @keydown.esc="closeMobileMenu"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

` + '<' + 'script setup>' + `
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMobileMenuOpen = ref(false);
const navItems = ref([...]);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const isCurrentPage = (path) => {
  return route.path === path;
};
` + '</' + 'script' + '>'
      }
    ],
    'toast-notification': [
      {
        title: 'Toast Notification',
        description: 'Accessible toast notifications with auto-dismiss and screen reader announcements',
        code: `<template>
  <div 
    v-if="isVisible"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
    class="toast"
    :class="'toast-' + type"
  >
    <div class="toast-content">
      <span class="toast-icon">{{ getIcon(type) }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
    <button 
      @click="dismiss"
      aria-label="Dismiss notification"
      class="toast-close"
    >
      ×
    </button>
  </div>
</template>

` + '<' + 'script setup>' + `
import { ref, onMounted } from 'vue';

const props = defineProps({
  message: String,
  type: { type: String, default: 'info' },
  duration: { type: Number, default: 5000 }
});

const emit = defineEmits(['dismiss']);
const isVisible = ref(true);

const dismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(dismiss, props.duration);
  }
});

const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
};
` + '</' + 'script' + '>'
      }
    ]
  };
  
  return examples[patternId] || [
    {
      title: 'Basic Implementation',
      description: 'Standard implementation of this pattern',
      code: currentCode.value || '// Code example coming soon'
    }
  ];
};

// Accessibility Guidelines
const getAccessibilityGuidelines = () => {
  const patternId = pattern.value?.id;
  const codeClass = isDarkMode.value ? 'bg-blue-900/30' : 'bg-blue-100';
  const guidelines = {
    'form-validation': [
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-invalid</code> to indicate validation errors`,
      `Provide <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-describedby</code> linking to error messages`,
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">role="alert"</code> for error messages`,
      'Ensure error messages are announced by screen readers',
      'Maintain keyboard navigation throughout the form'
    ],
    'modal-component': [
      'Trap focus within the modal when open',
      'Return focus to the trigger element when closed',
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-modal="true"</code> on the modal container`,
      `Provide an accessible close button with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-label</code>`,
      'Support ESC key to close the modal'
    ],
    'data-table': [
      `Use proper table markup with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">&lt;thead&gt;</code> and <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">&lt;tbody&gt;</code>`,
      `Provide column headers with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">scope</code> attributes`,
      `Indicate sortable columns with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-sort</code>`,
      'Ensure keyboard navigation for sorting',
      'Provide screen reader announcements for sort changes'
    ],
    'authentication-form': [
      'Use proper form labels for all inputs',
      'Provide clear error messages for authentication failures',
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">autocomplete</code> attributes for username and password`,
      'Ensure password fields are properly secured',
      'Provide accessible loading states during authentication'
    ],
    'navigation-menu': [
      `Use semantic navigation markup with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">&lt;nav&gt;</code>`,
      'Provide keyboard navigation with arrow keys',
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-current</code> to indicate the current page`,
      'Ensure focus indicators are visible',
      'Support ESC key to close dropdown menus'
    ],
    'toast-notification': [
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">role="alert"</code> for important notifications`,
      `Use <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">role="status"</code> for informational messages`,
      `Provide a dismissible close button with <code class="px-1.5 py-0.5 rounded text-xs font-mono ${codeClass}">aria-label</code>`,
      'Ensure notifications are announced by screen readers',
      'Allow sufficient time for users to read notifications'
    ]
  };
  
  return guidelines[patternId] || [
    'Follow WCAG 2.1 AA guidelines',
    'Ensure keyboard navigation is fully supported',
    'Provide appropriate ARIA attributes',
    'Test with screen readers',
    'Maintain sufficient color contrast'
  ];
};

// Version History
const patternVersions = ref([
  {
    version: '1.0.0',
    status: 'Current',
    description: 'Initial release with basic pattern implementation',
    releasedAt: '2024-01-15',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Initial pattern implementation' },
      { type: 'added', description: 'Basic functionality and examples' },
      { type: 'added', description: 'Accessibility support' }
    ]
  }
]);

const currentVersion = computed(() => {
  return patternVersions.value.find(v => v.status === 'Current') || patternVersions.value[0] || {};
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'Current': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'Stable': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Deprecated': isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
    'Beta': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
  };
  return classes[status] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

const getChangeTypeIcon = (type) => {
  const icons = {
    'added': '✓',
    'changed': '→',
    'deprecated': '⚠',
    'removed': '✗',
    'fixed': '🔧',
    'improved': '↑',
    'breaking': '⚠',
  };
  return icons[type] || '•';
};

const getChangeTypeColor = (type) => {
  const colors = {
    'added': 'text-green-600 dark:text-green-400',
    'changed': 'text-blue-600 dark:text-blue-400',
    'deprecated': 'text-yellow-600 dark:text-yellow-400',
    'removed': 'text-red-600 dark:text-red-400',
    'fixed': 'text-purple-600 dark:text-purple-400',
    'improved': 'text-indigo-600 dark:text-indigo-400',
    'breaking': 'text-red-600 dark:text-red-400 font-bold',
  };
  return colors[type] || 'text-gray-600 dark:text-gray-400';
};

// Performance helpers
const formatCodeSize = (code) => {
  if (!code) return '0 B';
  const size = new Blob([code]).size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getFrameworkLabel = (framework) => {
  const labels = {
    'vue': 'Vue.js',
    'react': 'React',
    'html': 'HTML'
  };
  return labels[framework] || framework;
};

const getComplexityDescription = (complexity) => {
  const descriptions = {
    'Beginner': 'Easy to implement',
    'Intermediate': 'Moderate complexity',
    'Advanced': 'Requires expertise'
  };
  return descriptions[complexity] || 'Moderate complexity';
};

const getSupportedFrameworks = () => {
  const code = pattern.value?.code || {};
  return Object.keys(code).filter(fw => code[fw]);
};

// Related Items
const getRelatedItems = () => {
  const patternId = pattern.value?.id;
  const related = {
    'form-validation': [
      { id: 'forms', title: 'Forms', description: 'Form components that work with validation patterns', path: '/components/forms', icon: 'description' },
      { id: 'input', title: 'Input', description: 'Input components with built-in validation support', path: '/components/forms', icon: 'edit' },
      { id: 'button', title: 'Button', description: 'Submit buttons for form actions', path: '/components/buttons', icon: 'smart_button' }
    ],
    'modal-component': [
      { id: 'dialog', title: 'Dialog', description: 'Dialog components for modal interactions', path: '/components/navigation', icon: 'open_in_new' },
      { id: 'overlay', title: 'Overlay', description: 'Overlay components for modal backgrounds', path: '/components/navigation', icon: 'layers' },
      { id: 'button', title: 'Button', description: 'Buttons for modal actions', path: '/components/buttons', icon: 'smart_button' }
    ],
    'data-table': [
      { id: 'table', title: 'Table', description: 'Table components for data display', path: '/components/data-display', icon: 'table_chart' },
      { id: 'pagination', title: 'Pagination', description: 'Pagination for large datasets', path: '/components/data-display', icon: 'pagination' },
      { id: 'sortable', title: 'Sortable', description: 'Sortable list components', path: '/components/data-display', icon: 'sort' }
    ],
    'authentication-form': [
      { id: 'forms', title: 'Forms', description: 'Form components for authentication', path: '/components/forms', icon: 'description' },
      { id: 'input', title: 'Input', description: 'Input fields for credentials', path: '/components/forms', icon: 'edit' },
      { id: 'button', title: 'Button', description: 'Login and submit buttons', path: '/components/buttons', icon: 'smart_button' }
    ],
    'navigation-menu': [
      { id: 'navigation', title: 'Navigation', description: 'Navigation components', path: '/components/navigation', icon: 'navigation' },
      { id: 'menu', title: 'Menu', description: 'Menu components for navigation', path: '/components/navigation', icon: 'menu' },
      { id: 'dropdown', title: 'Dropdown', description: 'Dropdown menus for navigation items', path: '/components/navigation', icon: 'arrow_drop_down' }
    ],
    'toast-notification': [
      { id: 'notification', title: 'Notification', description: 'Notification components', path: '/components/feedback', icon: 'notifications' },
      { id: 'alert', title: 'Alert', description: 'Alert components for messages', path: '/components/feedback', icon: 'warning' },
      { id: 'snackbar', title: 'Snackbar', description: 'Snackbar components for brief messages', path: '/components/feedback', icon: 'message' }
    ]
  };
  
  return related[patternId] || [
    { id: 'patterns', title: 'Patterns', description: 'Browse other patterns', path: '/patterns', icon: 'pattern' },
    { id: 'components', title: 'Components', description: 'Browse components', path: '/components', icon: 'widgets' }
  ];
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
  viewingFramework.value = pattern.value?.framework || 'vue';
  
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

