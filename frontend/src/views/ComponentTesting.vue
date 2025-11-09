<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Testing Framework
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Generate tests, run visual regression tests, and ensure component quality with integrated testing tools.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="testingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Test checklist/document -->
                    <rect x="50" y="40" width="100" height="120" rx="4" fill="url(#testingGradient)" opacity="0.3"/>
                    <!-- Checkmarks -->
                    <circle cx="70" cy="70" r="8" fill="url(#testingGradient)" opacity="0.5"/>
                    <path d="M 67 70 L 70 73 L 73 67" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
                    <circle cx="70" cy="100" r="8" fill="url(#testingGradient)" opacity="0.5"/>
                    <path d="M 67 100 L 70 103 L 73 97" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
                    <circle cx="70" cy="130" r="8" fill="url(#testingGradient)" opacity="0.5"/>
                    <path d="M 67 130 L 70 133 L 73 127" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
                    <!-- Test lines -->
                    <line x1="90" y1="70" x2="130" y2="70" stroke="white" stroke-width="2" opacity="0.6"/>
                    <line x1="90" y1="100" x2="130" y2="100" stroke="white" stroke-width="2" opacity="0.6"/>
                    <line x1="90" y1="130" x2="130" y2="130" stroke="white" stroke-width="2" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Test Generator -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Component Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">widgets</span>
                Select Component
              </h3>
              <select
                v-model="selectedComponent"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Choose a component...</option>
                <option 
                  v-for="comp in availableComponents" 
                  :key="comp.id" 
                  :value="comp.id"
                >
                  {{ comp.name }}
                </option>
              </select>
              <div v-if="loadingComponent" class="mt-2 text-sm text-indigo-600 flex items-center gap-2">
                <span class="material-symbols-outlined text-base animate-spin">refresh</span>
                Loading component data...
              </div>
              <div v-if="componentData && componentData.props" class="mt-3 p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Component Props:</div>
                <div class="text-xs space-y-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <div v-for="prop in componentData.props" :key="prop.name" class="flex items-center gap-2">
                    <code class="text-indigo-600">{{ prop.name }}</code>
                    <span class="text-gray-500">({{ prop.type }})</span>
                    <span v-if="prop.required" class="text-red-500 text-xs">required</span>
                    <span v-if="prop.options" class="text-xs text-gray-500">
                      [{{ prop.options.join(', ') }}]
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Test Type Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">checklist</span>
                Test Type
              </h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.unit" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Unit Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.integration" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Integration Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.visual" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Visual Regression</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.accessibility" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Accessibility Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.performance" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Performance Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.e2e" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">E2E Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.snapshot" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Snapshot Tests</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.crossBrowser" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Cross-Browser</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="testTypes.api" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">API Integration</span>
                </label>
              </div>
            </div>

            <!-- CI/CD Integration -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">integration_instructions</span>
                CI/CD Integration
              </h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="cicd.github" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">GitHub Actions</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="cicd.gitlab" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">GitLab CI</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="cicd.jenkins" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Jenkins</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="cicd.circleci" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">CircleCI</span>
                </label>
              </div>
            </div>

            <!-- Generate Button -->
            <button
              @click="generateTests"
              :disabled="!selectedComponent"
              class="w-full px-6 py-3 rounded-lg font-medium transition-colors"
              :class="selectedComponent
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              Generate Tests
            </button>
          </div>

          <!-- Right Column: Test Output -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Test Results -->
            <div 
              v-if="generatedTests"
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">code</span>
                  Generated Tests
                </h3>
                <div class="flex items-center gap-2">
                  <select
                    v-model="testFramework"
                    class="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="vitest">Vitest</option>
                    <option value="jest">Jest</option>
                    <option value="cypress">Cypress</option>
                    <option value="playwright">Playwright</option>
                  </select>
                  <button
                    @click="copyTests"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-sm">content_copy</span>
                    Copy
                  </button>
                  <button
                    @click="downloadTests"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-sm">download</span>
                    Download
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <div class="p-4 overflow-x-auto">
                    <pre class="text-sm text-green-400 font-mono"><code>{{ generatedTests }}</code></pre>
                  </div>
                </div>
                <div v-if="generatedTests" class="p-4 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
                  <button
                    @click="copyTests"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Copy Code
                  </button>
                  <button
                    @click="downloadTests"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            <!-- CI/CD Configurations -->
            <div 
              v-if="cicdConfig && cicdConfig.length > 0"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">settings</span>
                CI/CD Configurations
              </h3>
              <div class="space-y-4">
                <div
                  v-for="(config, index) in cicdConfig"
                  :key="index"
                  class="rounded-lg border overflow-hidden"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <div class="p-3 border-b flex items-center justify-between" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ config.name }}
                    </span>
                    <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ config.filename }}
                    </span>
                  </div>
                  <div class="p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                    <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ config.config }}</code></pre>
                  </div>
                  <div class="p-2 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
                    <button
                      @click="copyCicdConfig(config.config)"
                      class="px-2 py-1 rounded text-xs font-medium transition-colors"
                      :class="isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    >
                      Copy
                    </button>
                    <button
                      @click="downloadCicdConfig(config)"
                      class="px-2 py-1 rounded text-xs font-medium transition-colors"
                      :class="isDarkMode 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Test Runner -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">play_arrow</span>
                Test Runner
              </h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <button
                    @click="runTests"
                    :disabled="!selectedComponent || isRunning"
                    class="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="selectedComponent && !isRunning
                      ? (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    <span v-if="isRunning" class="material-symbols-outlined animate-spin">refresh</span>
                    <span v-else class="material-symbols-outlined">play_arrow</span>
                    {{ isRunning ? 'Running...' : 'Run Tests' }}
                  </button>
                  <button
                    @click="stopTests"
                    :disabled="!isRunning"
                    class="px-6 py-2 rounded-lg font-medium transition-colors"
                    :class="isRunning
                      ? (isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Stop
                  </button>
                </div>

                <!-- Test Results Output -->
                <div v-if="testResults" class="rounded-lg p-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          Passed: {{ testResults.passed }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-red-500">cancel</span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          Failed: {{ testResults.failed }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-yellow-500">schedule</span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          Duration: {{ testResults.duration }}ms
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="(result, index) in testResults.tests"
                      :key="index"
                      class="p-3 rounded-lg text-sm"
                      :class="result.passed
                        ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700')
                        : (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')"
                    >
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">
                          {{ result.passed ? 'check' : 'close' }}
                        </span>
                        <span class="font-medium">{{ result.name }}</span>
                      </div>
                      <div v-if="result.error" class="mt-2 text-xs font-mono opacity-75">
                        {{ result.error }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Regression Tests -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">image</span>
                  Visual Regression Tests
                </h3>
                <button
                  @click="runVisualTests"
                  :disabled="!selectedComponent"
                  class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  :class="selectedComponent
                    ? (isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Run Visual Tests
                </button>
              </div>
              <div v-if="visualTestResults" class="space-y-3">
                <div
                  v-for="result in visualTestResults"
                  :key="result.id"
                  class="p-3 rounded-lg border"
                  :class="result.passed
                    ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                    : (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-symbols-outlined text-sm" :class="result.passed ? 'text-green-500' : 'text-red-500'">
                      {{ result.passed ? 'check_circle' : 'error' }}
                    </span>
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ result.name }}
                    </span>
                  </div>
                  <div v-if="result.diff" class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Diff: {{ result.diff }}px
                  </div>
                </div>
              </div>
            </div>

            <!-- Accessibility Tests -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">accessibility</span>
                  Accessibility Tests
                </h3>
                <button
                  @click="runAccessibilityTests"
                  :disabled="!selectedComponent"
                  class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  :class="selectedComponent
                    ? (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Run A11y Tests
                </button>
              </div>
              <div v-if="a11yTestResults" class="space-y-2">
                <div
                  v-for="result in a11yTestResults"
                  :key="result.id"
                  class="p-3 rounded-lg text-sm"
                  :class="result.passed
                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700')
                    : (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')"
                >
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">{{ result.passed ? 'check' : 'close' }}</span>
                    <span class="font-medium">{{ result.rule }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Tests -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">speed</span>
                  Performance Tests
                </h3>
                <button
                  @click="runPerformanceTests"
                  :disabled="!selectedComponent"
                  class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  :class="selectedComponent
                    ? (isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Run Perf Tests
                </button>
              </div>
              <div v-if="performanceResults" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Render Time</div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ performanceResults.renderTime }}ms
                    </div>
                  </div>
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Bundle Size</div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ performanceResults.bundleSize }}KB
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Test Coverage -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">checklist</span>
                Test Coverage
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Statements</span>
                    <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">85%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: 85%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Branches</span>
                    <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">78%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: 78%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Functions</span>
                    <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">92%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: 92%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Lines</span>
                    <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">88%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: 88%"></div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');
const componentData = ref(null);
const loadingComponent = ref(false);
const availableComponents = ref([]);
const testFramework = ref('vitest');
const testTypes = ref({
  unit: true,
  integration: false,
  visual: false,
  accessibility: false,
  performance: false,
  e2e: false,
  snapshot: false,
  crossBrowser: false,
  api: false
});
const cicd = ref({
  github: false,
  gitlab: false,
  jenkins: false,
  circleci: false
});
const generatedTests = ref('');
const cicdConfig = ref('');
const isRunning = ref(false);
const testResults = ref(null);
const visualTestResults = ref(null);
const a11yTestResults = ref(null);
const performanceResults = ref(null);

// Load available components
const loadComponents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/components`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    availableComponents.value = response.data.components || [];
  } catch (error) {
    console.error('Error loading components:', error);
    // Fallback to hardcoded list
    availableComponents.value = [
      { id: 'button', name: 'Button' },
      { id: 'card', name: 'Card' },
      { id: 'input', name: 'Input' },
      { id: 'select', name: 'Select' },
      { id: 'modal', name: 'Modal' }
    ];
  }
};

// Load component data when selected
watch(selectedComponent, async (newValue) => {
  if (newValue) {
    loadingComponent.value = true;
    try {
      const response = await axios.get(`${API_BASE_URL}/components/${newValue}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      componentData.value = response.data;
    } catch (error) {
      console.error('Error loading component data:', error);
      componentData.value = null;
    } finally {
      loadingComponent.value = false;
    }
  } else {
    componentData.value = null;
  }
});

const generateTests = () => {
  if (!selectedComponent.value) {
    alert('Please select a component first');
    return;
  }

  const activeTypes = Object.entries(testTypes.value)
    .filter(([_, active]) => active)
    .map(([type]) => type);

  if (activeTypes.length === 0) {
    alert('Please select at least one test type');
    return;
  }

  let testCode = '';

  // Use component data if available, otherwise fall back to component name only
  const componentInfo = componentData.value || { 
    id: selectedComponent.value, 
    name: selectedComponent.value.charAt(0).toUpperCase() + selectedComponent.value.slice(1),
    props: []
  };

  if (testFramework.value === 'vitest' || testFramework.value === 'jest') {
    testCode = generateJestTests(componentInfo, activeTypes);
  } else if (testFramework.value === 'cypress') {
    testCode = generateCypressTests(componentInfo, activeTypes);
  } else if (testFramework.value === 'playwright') {
    testCode = generatePlaywrightTests(componentInfo, activeTypes);
  }

  generatedTests.value = testCode;
  
  // Generate CI/CD config if any CI/CD option is selected
  const activeCicd = Object.entries(cicd.value)
    .filter(([_, active]) => active)
    .map(([name]) => name);
  
  if (activeCicd.length > 0) {
    cicdConfig.value = generateCicdConfig(activeCicd, testFramework.value, activeTypes);
  } else {
    cicdConfig.value = '';
  }
};

// Analyze component props to generate intelligent tests
const analyzeProps = (props) => {
  if (!props || props.length === 0) return { hasProps: false, props: [] };
  
  return {
    hasProps: true,
    props: props.map(prop => ({
      name: prop.name,
      type: prop.type,
      required: prop.required || false,
      defaultValue: prop.default,
      options: prop.options || [],
      description: prop.description || '',
      isEnum: !!(prop.options && prop.options.length > 0),
      isBoolean: prop.type === 'boolean' || prop.type === 'Boolean',
      isString: prop.type === 'string' || prop.type === 'String',
      isNumber: prop.type === 'number' || prop.type === 'Number',
      isFunction: prop.type === 'function' || prop.type === 'Function' || prop.name.toLowerCase().includes('on') || prop.name.toLowerCase().includes('handle'),
    }))
  };
};

const generateJestTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `import { describe, it, expect, beforeEach, vi } from '${testFramework.value === 'vitest' ? 'vitest' : '@jest/globals'}';
import { mount } from '@vue/test-utils';
import ${componentName} from './${componentId}.vue';

describe('${componentName} Component', () => {
`;

  if (types.includes('unit')) {
    code += `  describe('Unit Tests', () => {
    it('should render correctly', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.exists()).toBe(true);
    });

    it('should render with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.exists()).toBe(true);
`;

    // Test default values
    props.props.forEach(prop => {
      if (prop.defaultValue !== undefined && prop.defaultValue !== null) {
        code += `      expect(wrapper.props('${prop.name}')).toBe(${JSON.stringify(prop.defaultValue)});\n`;
      }
    });

    code += `    });

`;

    // Test each prop individually
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        // Test each enum value
        prop.options.forEach(option => {
          code += `    it('should render with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper.props('${prop.name}')).toBe('${option}');
    });

`;
        });
      } else if (prop.isBoolean) {
        // Test boolean props
        code += `    it('should handle ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: true }
      });
      expect(wrapper.props('${prop.name}')).toBe(true);
    });

    it('should handle ${prop.name} prop when false', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: false }
      });
      expect(wrapper.props('${prop.name}')).toBe(false);
    });

`;
      } else if (prop.isString) {
        // Test string props
        code += `    it('should accept ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 'test-value' }
      });
      expect(wrapper.props('${prop.name}')).toBe('test-value');
    });

`;
      } else if (prop.isNumber) {
        // Test number props
        code += `    it('should accept ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 42 }
      });
      expect(wrapper.props('${prop.name}')).toBe(42);
    });

`;
      }

      // Test required props
      if (prop.required) {
        code += `    it('should require ${prop.name} prop', () => {
      // Component should handle missing required prop or show warning
      const wrapper = mount(${componentName});
      // Add assertion based on component behavior
    });

`;
      }
    });

    // Test prop combinations (for important combinations)
    const booleanProps = props.props.filter(p => p.isBoolean);
    const enumProps = props.props.filter(p => p.isEnum && p.options.length > 0);
    
    if (booleanProps.length > 0 && enumProps.length > 0) {
      // Test combination of first enum and first boolean
      const firstEnum = enumProps[0];
      const firstBool = booleanProps[0];
      if (firstEnum && firstBool) {
        code += `    it('should handle ${firstEnum.name} and ${firstBool.name} combination', () => {
      const wrapper = mount(${componentName}, {
        props: { ${firstEnum.name}: '${firstEnum.options[0]}', ${firstBool.name}: true }
      });
      expect(wrapper.props('${firstEnum.name}')).toBe('${firstEnum.options[0]}');
      expect(wrapper.props('${firstBool.name}')).toBe(true);
    });

`;
      }
    }

    code += `  });

`;
  }

  if (types.includes('integration')) {
    code += `  describe('Integration Tests', () => {
`;

    // Test event handlers (functions that start with 'on' or 'handle')
    const eventHandlers = props.props.filter(p => p.isFunction);
    eventHandlers.forEach(handler => {
      const eventName = handler.name.replace(/^on|^handle/, '').toLowerCase();
      code += `    it('should handle ${handler.name} event', async () => {
      const ${handler.name} = vi.fn();
      const wrapper = mount(${componentName}, {
        props: { ${handler.name} }
      });
      await wrapper.trigger('${eventName}');
      expect(${handler.name}).toHaveBeenCalled();
    });

`;
    });

    // Test interactions with boolean props (like disabled, loading)
    const interactiveBooleans = props.props.filter(p => 
      p.isBoolean && (p.name.toLowerCase().includes('disabled') || 
                     p.name.toLowerCase().includes('loading') ||
                     p.name.toLowerCase().includes('readonly'))
    );
    
    interactiveBooleans.forEach(prop => {
      code += `    it('should handle interactions when ${prop.name} is true', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: true }
      });
      // Component should prevent interaction when ${prop.name} is true
      await wrapper.trigger('click');
      // Add assertions based on component behavior
    });

`;
    });

    // Test prop changes
    if (props.props.length > 0) {
      const firstProp = props.props[0];
      code += `    it('should update when props change', async () => {
      const wrapper = mount(${componentName});
      await wrapper.setProps({ ${firstProp.name}: ${firstProp.isBoolean ? 'true' : firstProp.isEnum && firstProp.options.length > 0 ? `'${firstProp.options[0]}'` : firstProp.isNumber ? '42' : "'new-value'"}});
      expect(wrapper.props('${firstProp.name}')).toBe(${firstProp.isBoolean ? 'true' : firstProp.isEnum && firstProp.options.length > 0 ? `'${firstProp.options[0]}'` : firstProp.isNumber ? '42' : "'new-value'"});
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('visual')) {
    code += `  describe('Visual Regression Tests', () => {
    it('should match visual snapshot with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.html()).toMatchSnapshot();
    });

`;

    // Generate visual snapshots for each enum prop value
    props.props.filter(p => p.isEnum && p.options.length > 0).forEach(prop => {
      prop.options.forEach(option => {
        code += `    it('should match visual snapshot with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper.html()).toMatchSnapshot();
    });

`;
      });
    });

    code += `  });

`;
  }

  if (types.includes('e2e')) {
    code += `  describe('E2E Tests', () => {
    it('should complete full user interaction flow', async () => {
      const wrapper = mount(${componentName});
`;

    // Add interactions based on props
    const hasClickHandler = props.props.some(p => p.isFunction && (p.name.toLowerCase().includes('click') || p.name.toLowerCase().includes('onclick')));
    if (hasClickHandler) {
      code += `      await wrapper.trigger('click');
`;
    }

    // Test prop changes during interaction
    const interactiveProps = props.props.filter(p => 
      p.isBoolean && !p.name.toLowerCase().includes('disabled') && !p.name.toLowerCase().includes('loading')
    );
    
    if (interactiveProps.length > 0) {
      const firstInteractive = interactiveProps[0];
      code += `      await wrapper.setProps({ ${firstInteractive.name}: true });
      expect(wrapper.props('${firstInteractive.name}')).toBe(true);
`;
    }

    code += `    });

`;

    // Test edge cases
    const disabledProp = props.props.find(p => p.name.toLowerCase().includes('disabled'));
    const loadingProp = props.props.find(p => p.name.toLowerCase().includes('loading'));
    
    if (disabledProp || loadingProp) {
      code += `    it('should handle edge case: disabled and loading states', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${disabledProp ? `${disabledProp.name}: true` : ''}${disabledProp && loadingProp ? ', ' : ''}${loadingProp ? `${loadingProp.name}: true` : ''} }
      });
      // Component should handle both states appropriately
      expect(wrapper.exists()).toBe(true);
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('snapshot')) {
    code += `  describe('Snapshot Tests', () => {
    it('should match component snapshot with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper).toMatchSnapshot();
    });

`;

    // Generate snapshots for each enum prop value
    props.props.filter(p => p.isEnum && p.options.length > 0).forEach(prop => {
      prop.options.forEach(option => {
        code += `    it('should match snapshot with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper).toMatchSnapshot();
    });

`;
      });
    });

    // Generate snapshot for boolean combinations
    const booleanProps = props.props.filter(p => p.isBoolean);
    if (booleanProps.length > 0) {
      code += `    it('should match snapshot with boolean props', () => {
      const wrapper = mount(${componentName}, {
        props: { ${booleanProps.map(p => `${p.name}: true`).join(', ')} }
      });
      expect(wrapper).toMatchSnapshot();
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('api')) {
    code += `  describe('API Integration Tests', () => {
`;

    // Check if component has any async/data-fetching props
    const asyncProps = props.props.filter(p => 
      p.name.toLowerCase().includes('data') || 
      p.name.toLowerCase().includes('fetch') ||
      p.name.toLowerCase().includes('load')
    );

    if (asyncProps.length > 0) {
      asyncProps.forEach(prop => {
        code += `    it('should handle ${prop.name} data', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 'test-data' }
      });
      // Add API integration assertions
      expect(wrapper.exists()).toBe(true);
    });

`;
      });
    } else {
      code += `    it('should handle API responses', async () => {
      const wrapper = mount(${componentName});
      // Mock API call if component has data fetching
      // const mockResponse = { data: 'test' };
      // await wrapper.vm.fetchData();
      // expect(wrapper.vm.data).toEqual(mockResponse);
      expect(wrapper.exists()).toBe(true);
    });

`;
    }

    code += `  });

`;
  }

  code += '});';
  return code;
};

const generateCypressTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `describe('${componentName} Component', () => {
  beforeEach(() => {
    cy.visit('/components/${componentId}');
  });

`;

  if (types.includes('unit')) {
    code += `  describe('Rendering', () => {
    it('should render correctly', () => {
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

`;

    // Test each prop value
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        prop.options.forEach(option => {
          code += `    it('should render with ${prop.name}="${option}"', () => {
      cy.get('[data-testid="${componentId}"]').should('have.attr', 'data-${prop.name}', '${option}');
    });

`;
        });
      }
    });

    code += `  });

`;
  }

  if (types.includes('integration')) {
    code += `  describe('Interactions', () => {
`;

    // Test event handlers
    const eventHandlers = props.props.filter(p => p.isFunction);
    eventHandlers.forEach(handler => {
      code += `    it('should handle ${handler.name} event', () => {
      cy.get('[data-testid="${componentId}"]').click();
      // Verify ${handler.name} was called
    });

`;
    });

    code += `  });

`;
  }

  if (types.includes('crossBrowser')) {
    code += `  describe('Cross-Browser Compatibility', () => {
    it('should work in Chrome', () => {
      cy.visit('/components/${componentId}', { browser: 'chrome' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

    it('should work in Firefox', () => {
      cy.visit('/components/${componentId}', { browser: 'firefox' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

    it('should work in Safari', () => {
      cy.visit('/components/${componentId}', { browser: 'webkit' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  describe('End-to-End Tests', () => {
    it('should complete full user journey', () => {
      cy.get('[data-testid="${componentId}"]').click();
`;

    // Add prop-specific interactions
    const clickableProps = props.props.filter(p => p.isFunction && p.name.toLowerCase().includes('click'));
    if (clickableProps.length > 0) {
      code += `      cy.get('[data-testid="${componentId}"]').should('be.visible');
`;
    }

    code += `      // Add more E2E steps based on component behavior
    });
  });

`;
  }

  if (types.includes('api')) {
    code += `  describe('API Integration', () => {
    it('should handle API calls', () => {
      cy.intercept('GET', '/api/data', { fixture: 'data.json' }).as('getData');
      cy.visit('/components/${componentId}');
      cy.wait('@getData');
      cy.get('[data-testid="${componentId}"]').should('be.visible');
    });
  });

`;
  }

  code += '});';
  return code;
};

const generatePlaywrightTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `import { test, expect } from '@playwright/test';

test.describe('${componentName} Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/${componentId}');
  });

`;

  if (types.includes('unit')) {
    code += `  test('should render correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
  });

`;

    // Test each enum prop
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        prop.options.forEach(option => {
          code += `  test('should render with ${prop.name}="${option}"', async ({ page }) => {
    await expect(page.locator('[data-testid="${componentId}"][data-${prop.name}="${option}"]')).toBeVisible();
  });

`;
        });
      }
    });

    code += `
`;
  }

  if (types.includes('crossBrowser')) {
    code += `  test.describe('Cross-Browser Compatibility', () => {
    test('should work in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });

    test('should work in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });

    test('should work in WebKit', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  test.describe('End-to-End Tests', () => {
    test('should complete full user flow', async ({ page }) => {
      await page.click('[data-testid="${componentId}"]');
`;

    // Add prop-specific assertions
    const eventHandlers = props.props.filter(p => p.isFunction);
    if (eventHandlers.length > 0) {
      code += `      // Verify event handlers were triggered
`;
    }

    code += `      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  if (types.includes('api')) {
    code += `  test.describe('API Integration', () => {
    test('should handle API integration', async ({ page }) => {
      await page.route('**/api/data', route => route.fulfill({ json: { data: 'test' } }));
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  code += '});';
  return code;
};

const runTests = async () => {
  if (!selectedComponent.value) return;
  
  isRunning.value = true;
  testResults.value = null;

  // Simulate test execution
  await new Promise(resolve => setTimeout(resolve, 2000));

  testResults.value = {
    passed: 8,
    failed: 1,
    duration: 1234,
    tests: [
      { name: 'should render correctly', passed: true },
      { name: 'should accept props', passed: true },
      { name: 'should handle user interactions', passed: true },
      { name: 'should have proper ARIA attributes', passed: true },
      { name: 'should be keyboard accessible', passed: true },
      { name: 'should match visual snapshot', passed: true },
      { name: 'should handle edge cases', passed: true },
      { name: 'should have correct styling', passed: true },
      { name: 'should handle error states', passed: false, error: 'Expected error state but got success state' }
    ]
  };

  isRunning.value = false;
};

const stopTests = () => {
  isRunning.value = false;
  testResults.value = null;
};

const runVisualTests = async () => {
  if (!selectedComponent.value) return;
  
  visualTestResults.value = [
    { id: 1, name: 'Button Default State', passed: true, diff: 0 },
    { id: 2, name: 'Button Hover State', passed: true, diff: 0 },
    { id: 3, name: 'Button Disabled State', passed: false, diff: 2 }
  ];
};

const runAccessibilityTests = async () => {
  if (!selectedComponent.value) return;
  
  a11yTestResults.value = [
    { id: 1, rule: 'ARIA labels present', passed: true },
    { id: 2, rule: 'Keyboard navigation', passed: true },
    { id: 3, rule: 'Color contrast WCAG AA', passed: true },
    { id: 4, rule: 'Focus indicators', passed: false }
  ];
};

const runPerformanceTests = async () => {
  if (!selectedComponent.value) return;
  
  performanceResults.value = {
    renderTime: 12,
    bundleSize: 45
  };
};

const generateCicdConfig = (activeCicd, framework, testTypes) => {
  let configs = [];
  
  if (activeCicd.includes('github')) {
    let githubConfig = `name: Component Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test`;
    
    if (framework === 'cypress') {
      githubConfig += `
    
    - name: Cypress run
      uses: cypress-io/github-action@v5`;
    } else if (framework === 'playwright') {
      githubConfig += `
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test`;
    }
    
    configs.push({ name: 'GitHub Actions', config: githubConfig, filename: '.github/workflows/tests.yml' });
  }
  
  if (activeCicd.includes('gitlab')) {
    const gitlabConfig = `test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  artifacts:
    reports:
      junit: junit.xml`;
    
    configs.push({ name: 'GitLab CI', config: gitlabConfig, filename: '.gitlab-ci.yml' });
  }
  
  if (activeCicd.includes('jenkins')) {
    const jenkinsConfig = `pipeline {
  agent any
  
  stages {
    stage('Test') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }
  }
}`;
    
    configs.push({ name: 'Jenkins', config: jenkinsConfig, filename: 'Jenkinsfile' });
  }
  
  if (activeCicd.includes('circleci')) {
    const circleciConfig = `version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Run tests
          command: npm test

workflows:
  version: 2
  test-workflow:
    jobs:
      - test`;
    
    configs.push({ name: 'CircleCI', config: circleciConfig, filename: '.circleci/config.yml' });
  }
  
  return configs;
};

const copyTests = async () => {
  if (!generatedTests.value) return;
  try {
    await navigator.clipboard.writeText(generatedTests.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadTests = () => {
  if (!generatedTests.value) return;
  const extension = testFramework.value === 'cypress' ? 'cy.js' : testFramework.value === 'playwright' ? 'spec.ts' : 'test.js';
  const filename = `${selectedComponent.value}.${extension}`;
  
  const blob = new Blob([generatedTests.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const copyCicdConfig = async (config) => {
  try {
    await navigator.clipboard.writeText(config);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadCicdConfig = (config) => {
  const blob = new Blob([config.config], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = config.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
  // Load available components
  await loadComponents();
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

