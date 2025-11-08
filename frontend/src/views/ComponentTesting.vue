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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="select">Select</option>
                <option value="modal">Modal</option>
              </select>
            </div>

            <!-- Test Type Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');
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

const generateTests = () => {
  if (!selectedComponent.value) return;

  const activeTypes = Object.entries(testTypes.value)
    .filter(([_, active]) => active)
    .map(([type]) => type);

  if (activeTypes.length === 0) {
    alert('Please select at least one test type');
    return;
  }

  let testCode = '';

  if (testFramework.value === 'vitest' || testFramework.value === 'jest') {
    testCode = generateJestTests(selectedComponent.value, activeTypes);
  } else if (testFramework.value === 'cypress') {
    testCode = generateCypressTests(selectedComponent.value, activeTypes);
  } else if (testFramework.value === 'playwright') {
    testCode = generatePlaywrightTests(selectedComponent.value, activeTypes);
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

const generateJestTests = (component, types) => {
  let code = `import { describe, it, expect, beforeEach } from '${testFramework.value === 'vitest' ? 'vitest' : '@jest/globals'}';
import { mount } from '@vue/test-utils';
import ${component.charAt(0).toUpperCase() + component.slice(1)} from './${component}.vue';

describe('${component.charAt(0).toUpperCase() + component.slice(1)} Component', () => {
`;

  if (types.includes('unit')) {
    code += `  describe('Unit Tests', () => {
    it('should render correctly', () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      expect(wrapper.exists()).toBe(true);
    });

    it('should accept props', () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)}, {
        props: {
          // Add component-specific props here
        }
      });
      expect(wrapper.props()).toBeDefined();
    });
  });

`;
  }

  if (types.includes('integration')) {
    code += `  describe('Integration Tests', () => {
    it('should handle user interactions', async () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      // Add interaction tests
      await wrapper.trigger('click');
      expect(wrapper.emitted()).toBeDefined();
    });
  });

`;
  }

  if (types.includes('visual')) {
    code += `  describe('Visual Regression Tests', () => {
    it('should match visual snapshot', () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  describe('E2E Tests', () => {
    it('should work in full user flow', async () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      // Simulate full user interaction flow
      await wrapper.trigger('click');
      await wrapper.setProps({ disabled: true });
      expect(wrapper.props('disabled')).toBe(true);
    });
  });

`;
  }

  if (types.includes('snapshot')) {
    code += `  describe('Snapshot Tests', () => {
    it('should match component snapshot', () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with props', () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)}, {
        props: { variant: 'primary' }
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

`;
  }

  if (types.includes('api')) {
    code += `  describe('API Integration Tests', () => {
    it('should handle API responses', async () => {
      const wrapper = mount(${component.charAt(0).toUpperCase() + component.slice(1)});
      // Mock API call
      const mockResponse = { data: 'test' };
      await wrapper.vm.fetchData();
      expect(wrapper.vm.data).toEqual(mockResponse);
    });
  });

`;
  }

  code += '});';
  return code;
};

const generateCypressTests = (component, types) => {
  let code = `describe('${component.charAt(0).toUpperCase() + component.slice(1)} Component', () => {
`;

  if (types.includes('unit')) {
    code += `  it('should render correctly', () => {
    cy.visit('/components/${component}');
    cy.get('[data-testid="${component}"]').should('exist');
  });

`;
  }

  if (types.includes('integration')) {
    code += `  it('should handle user interactions', () => {
    cy.visit('/components/${component}');
    cy.get('[data-testid="${component}"]').click();
    // Add interaction assertions
  });

`;
  }

  if (types.includes('crossBrowser')) {
    code += `  it('should work in Chrome', () => {
    cy.visit('/components/${component}', { browser: 'chrome' });
    cy.get('[data-testid="${component}"]').should('exist');
  });

  it('should work in Firefox', () => {
    cy.visit('/components/${component}', { browser: 'firefox' });
    cy.get('[data-testid="${component}"]').should('exist');
  });

  it('should work in Safari', () => {
    cy.visit('/components/${component}', { browser: 'webkit' });
    cy.get('[data-testid="${component}"]').should('exist');
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  it('should complete full user journey', () => {
    cy.visit('/components/${component}');
    cy.get('[data-testid="${component}"]').click();
    cy.get('[data-testid="result"]').should('be.visible');
    // Add more E2E steps
  });

`;
  }

  if (types.includes('api')) {
    code += `  it('should handle API calls', () => {
    cy.intercept('GET', '/api/data', { fixture: 'data.json' }).as('getData');
    cy.visit('/components/${component}');
    cy.wait('@getData');
    cy.get('[data-testid="${component}"]').should('contain', 'Data loaded');
  });

`;
  }

  code += '});';
  return code;
};

const generatePlaywrightTests = (component, types) => {
  let code = `import { test, expect } from '@playwright/test';

test.describe('${component.charAt(0).toUpperCase() + component.slice(1)} Component', () => {
`;

  if (types.includes('unit')) {
    code += `  test('should render correctly', async ({ page }) => {
    await page.goto('/components/${component}');
    await expect(page.locator('[data-testid="${component}"]')).toBeVisible();
  });

`;
  }

  if (types.includes('crossBrowser')) {
    code += `  test('should work in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await page.goto('/components/${component}');
    await expect(page.locator('[data-testid="${component}"]')).toBeVisible();
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox');
    await page.goto('/components/${component}');
    await expect(page.locator('[data-testid="${component}"]')).toBeVisible();
  });

  test('should work in WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit');
    await page.goto('/components/${component}');
    await expect(page.locator('[data-testid="${component}"]')).toBeVisible();
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  test('should complete full user flow', async ({ page }) => {
    await page.goto('/components/${component}');
    await page.click('[data-testid="${component}"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

`;
  }

  if (types.includes('api')) {
    code += `  test('should handle API integration', async ({ page }) => {
    await page.route('**/api/data', route => route.fulfill({ json: { data: 'test' } }));
    await page.goto('/components/${component}');
    await expect(page.locator('[data-testid="${component}"]')).toContainText('test');
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

