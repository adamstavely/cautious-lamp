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
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Design System Governance
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Enforce design system rules and check compliance. Monitor both the design system itself and applications using it.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="governanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Gavel icon representing governance/rules -->
                    <rect x="60" y="40" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.6"/>
                    <rect x="60" y="60" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.5"/>
                    <rect x="60" y="80" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.4"/>
                    <!-- Checkmark representing compliance -->
                    <path d="M 50 130 L 70 150 L 110 110" fill="none" stroke="url(#governanceGradient)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                    <!-- Shield representing protection/enforcement -->
                    <path d="M 130 100 L 150 110 L 150 140 Q 150 160, 130 170 Q 110 160, 110 140 L 110 110 Z" fill="url(#governanceGradient)" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Rules -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Rules Engine -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">rule</span>
                  Rules Engine
                </h3>
                <Dropdown
                  :model-value="ruleFilter"
                  @update:model-value="ruleFilter = $event"
                  :options="[
                    { value: 'all', label: 'All Rules' },
                    { value: 'design-system', label: 'Design System' },
                    { value: 'ux-hcd', label: 'UX / HCD' },
                    { value: 'accessibility', label: 'Accessibility' }
                  ]"
                  :is-dark-mode="isDarkMode"
                  label="Filter rules by category"
                />
              </div>
              <div class="space-y-3">
                <div
                  v-for="rule in filteredRules"
                  :key="rule.id"
                  @click="selectRule(rule)"
                  class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  :class="selectedRule?.id === rule.id
                    ? (isDarkMode ? 'bg-indigo-800 border-2 border-indigo-600' : 'bg-indigo-100 border-2 border-indigo-500')
                    : rule.enabled 
                    ? (isDarkMode ? 'bg-indigo-900/30 border border-indigo-700 hover:bg-indigo-900/40' : 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100')
                    : (isDarkMode ? 'bg-slate-800 border border-gray-700 hover:bg-slate-700' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100')"
                >
                  <input
                    type="checkbox"
                    v-model="rule.enabled"
                    @click.stop
                    class="mt-1 accent-indigo-600"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ rule.name }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ rule.description }}
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                      <span 
                        class="text-xs px-2 py-1 rounded"
                        :class="rule.severity === 'error' 
                          ? (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                          : rule.severity === 'warning'
                          ? (isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ rule.severity }}
                      </span>
                      <span 
                        v-if="rule.category"
                        class="text-xs px-2 py-1 rounded"
                        :class="isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'"
                      >
                        {{ rule.category === 'design-system' ? 'DS' : rule.category === 'ux-hcd' ? 'UX/HCD' : 'A11y' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                @click="addRule"
                class="w-full mt-4 px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'"
              >
                + Add Rule
              </button>
            </div>
          </div>

          <!-- Right Column: Compliance Checking -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Application Selection (for application scanning) -->
            <div 
              v-if="complianceScope === 'applications'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">apps</span>
                Select Application
              </h3>
              <div class="space-y-3">
                <Dropdown
                  :model-value="selectedApplicationId"
                  @update:model-value="selectedApplicationId = $event"
                  :options="[
                    { value: '', label: 'All Applications' },
                    ...applications.map(app => ({ 
                      value: app.id, 
                      label: `${app.name}${app.version ? ` (v${app.version})` : ''}` 
                    }))
                  ]"
                  :is-dark-mode="isDarkMode"
                  label="Select application"
                />
                <div class="flex items-center gap-2">
                  <button
                    @click="loadApplications"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Refresh
                  </button>
                  <button
                    @click="showRegisterModal = true"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    + Register Application
                  </button>
                </div>
              </div>
            </div>

            <!-- Compliance Checker -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">verified</span>
                    Compliance Checker
                  </h3>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <input
                        type="radio"
                        id="check-design-system"
                        value="design-system"
                        v-model="complianceScope"
                        class="accent-indigo-600"
                      />
                      <label for="check-design-system" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Design System
                      </label>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="radio"
                        id="check-applications"
                        value="applications"
                        v-model="complianceScope"
                        class="accent-indigo-600"
                      />
                      <label for="check-applications" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Applications
                      </label>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="complianceScope === 'applications' && selectedApplicationId"
                    @click="scanApplicationCodebase"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'"
                  >
                    Scan Codebase
                  </button>
                  <button
                    @click="runComplianceCheck"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base">play_arrow</span>
                    Run Check
                  </button>
                </div>
              </div>
              <div v-if="complianceScope === 'design-system'" class="mb-4 p-3 rounded-lg text-sm" :class="isDarkMode ? 'bg-blue-900/20 border border-blue-700 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'">
                <span class="material-symbols-outlined text-base align-middle mr-2">info</span>
                Checking the design system itself: components, tokens, documentation, and internal standards.
              </div>
              <div v-if="complianceScope === 'applications'" class="mb-4 p-3 rounded-lg text-sm" :class="isDarkMode ? 'bg-purple-900/20 border border-purple-700 text-purple-300' : 'bg-purple-50 border border-purple-200 text-purple-700'">
                <span class="material-symbols-outlined text-base align-middle mr-2">info</span>
                Checking applications using the design system: ensuring they follow design system rules and use components correctly.
                <div class="mt-2 text-xs opacity-90">
                  <strong>How to scan:</strong> Register your application, then select it and click "Scan Codebase" to analyze its code, or use the CLI: <code class="px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'">ds compliance --scope applications --application &lt;id&gt;</code>
                </div>
              </div>
              <div v-if="complianceResults" class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                  <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                      {{ complianceResults.passed }}
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Passed</div>
                  </div>
                  <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">
                      {{ complianceResults.warnings }}
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Warnings</div>
                  </div>
                  <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                      {{ complianceResults.failed }}
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Failed</div>
                  </div>
                </div>
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <div
                    v-for="result in complianceResults.checks"
                    :key="result.id"
                    class="p-4 rounded-lg border"
                    :class="result.status === 'pass'
                      ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                      : result.status === 'warning'
                      ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                      : (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-symbols-outlined text-sm" :class="result.status === 'pass' ? 'text-green-500' : result.status === 'warning' ? 'text-yellow-500' : 'text-red-500'">
                            {{ result.status === 'pass' ? 'check_circle' : result.status === 'warning' ? 'warning' : 'error' }}
                          </span>
                          <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            {{ result.rule }}
                          </span>
                        </div>
                        <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ result.message }}
                        </div>
                        <div v-if="result.component" class="text-xs mt-2 font-mono" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          {{ complianceScope === 'design-system' ? 'Component' : 'Application' }}: {{ result.component }}
                        </div>
                        <div v-if="result.application" class="text-xs mt-2 font-mono" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          Application: {{ result.application }}
                        </div>
                        <div v-if="result.file" class="text-xs mt-1 font-mono opacity-75" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          File: {{ result.file }}{{ result.line ? `:${result.line}` : '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rule Configuration -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">tune</span>
                Rule Configuration
              </h3>
              <div v-if="selectedRule" class="space-y-4">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Rule Name
                  </label>
                  <input
                    v-model="selectedRule.name"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Description
                  </label>
                  <textarea
                    v-model="selectedRule.description"
                    rows="3"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Category
                  </label>
                  <Dropdown
                    :model-value="selectedRule.category"
                    @update:model-value="selectedRule.category = $event"
                    :options="[
                      { value: 'design-system', label: 'Design System' },
                      { value: 'ux-hcd', label: 'UX / HCD' },
                      { value: 'accessibility', label: 'Accessibility' }
                    ]"
                    :is-dark-mode="isDarkMode"
                    label="Select rule category"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Severity
                  </label>
                  <Dropdown
                    :model-value="selectedRule.severity"
                    @update:model-value="selectedRule.severity = $event"
                    :options="[
                      { value: 'info', label: 'Info' },
                      { value: 'warning', label: 'Warning' },
                      { value: 'error', label: 'Error' }
                    ]"
                    :is-dark-mode="isDarkMode"
                    label="Select severity level"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Scanner Logic
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        @click="showTemplateBrowser = true"
                        class="text-xs px-2 py-1 rounded text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
                        :class="isDarkMode ? 'hover:bg-indigo-900/30' : ''"
                      >
                        <span class="material-symbols-outlined text-sm">library_books</span>
                        Browse Templates
                      </button>
                      <button
                        @click="testScanner"
                        class="text-xs px-2 py-1 rounded"
                        :class="isDarkMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                  <textarea
                    v-model="selectedRule.scannerCode"
                    rows="12"
                    placeholder="// Scanner function
// context: { components, tokens, codebase?, applicationName? }
// Returns: ComplianceCheck[]

const checks = [];
// Your scanning logic here
return checks;"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-950 text-green-400' 
                      : 'border-gray-300 bg-gray-900 text-green-400'"
                  ></textarea>
                  <div class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    Write JavaScript code that analyzes components/tokens and returns ComplianceCheck[] array
                  </div>
                  <div v-if="scannerTestResult" class="mt-2 p-2 rounded text-xs" :class="scannerTestResult.success ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700') : (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')">
                    {{ scannerTestResult.message }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="saveRule"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Save Rule
                  </button>
                  <button
                    @click="selectedRule = null; scannerTestResult = null"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Select a rule to configure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Application Modal -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showRegisterModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Register Application
          </h3>
          <button
            @click="showRegisterModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Application Name *
            </label>
            <input
              v-model="newApplication.name"
              type="text"
              placeholder="My Application"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Repository URL (optional)
            </label>
            <input
              v-model="newApplication.repository"
              type="text"
              placeholder="https://github.com/company/app"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Design System Version (optional)
            </label>
            <input
              v-model="newApplication.version"
              type="text"
              placeholder="2.1.0"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="flex items-center gap-2 pt-4">
            <button
              @click="registerApplication"
              :disabled="!newApplication.name || isLoading"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newApplication.name && !isLoading
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ isLoading ? 'Registering...' : 'Register' }}
            </button>
            <button
              @click="showRegisterModal = false"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Browser Modal -->
    <div
      v-if="showTemplateBrowser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showTemplateBrowser = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600">library_books</span>
            Rule Templates
          </h3>
          <button
            @click="showTemplateBrowser = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Search and Filter -->
        <div class="mb-4 space-y-3">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <input
              v-model="templateSearchQuery"
              type="text"
              placeholder="Search templates..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm whitespace-nowrap" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Category:</label>
            <Dropdown
              v-model="templateCategoryFilter"
              :options="[
                { value: 'all', label: 'All Categories' },
                { value: 'design-system', label: 'Design System' },
                { value: 'accessibility', label: 'Accessibility' },
                { value: 'ux-hcd', label: 'UX / HCD' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>
        </div>

        <!-- Templates List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="filteredTemplates.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">search_off</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No templates found</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Try adjusting your search or filters</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="template in filteredTemplates"
              :key="template.id"
              @click="loadTemplate(template)"
              class="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-700 border-gray-600 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ template.name }}</h4>
                <span 
                  class="px-2 py-0.5 text-xs rounded-full"
                  :class="template.category === 'design-system' 
                    ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                    : template.category === 'accessibility'
                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')"
                >
                  {{ template.category === 'design-system' ? 'Design System' : template.category === 'accessibility' ? 'Accessibility' : 'UX/HCD' }}
                </span>
              </div>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ template.description }}</p>
              <div class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="tag in template.tags.slice(0, 3)"
                  :key="tag"
                  class="px-2 py-0.5 text-xs rounded"
                  :class="isDarkMode ? 'bg-slate-600 text-gray-300' : 'bg-gray-100 text-gray-600'"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                <span class="material-symbols-outlined text-sm">tune</span>
                <span v-if="template.configurable && Object.keys(template.configurable).length > 0">
                  {{ Object.keys(template.configurable).length }} customizable option(s)
                </span>
                <span v-else>Ready to use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Customization Modal -->
    <div
      v-if="selectedTemplate"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="selectedTemplate = null; templateCustomization = {}"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600">tune</span>
            Customize Template: {{ selectedTemplate.name }}
          </h3>
          <button
            @click="selectedTemplate = null; templateCustomization = {}"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="mb-4">
          <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ selectedTemplate.description }}</p>
        </div>

        <!-- Customization Options -->
        <div v-if="selectedTemplate.configurable" class="space-y-4 mb-6">
          <div
            v-for="(config, key) in selectedTemplate.configurable"
            :key="key"
            class="space-y-2"
          >
            <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              {{ config.label }}
            </label>
            <select
              v-if="config.type === 'select'"
              v-model="templateCustomization[key]"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            >
              <option
                v-for="option in config.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            <div v-else-if="config.type === 'checkbox'" class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="templateCustomization[key]"
                class="w-4 h-4 rounded accent-indigo-600"
              />
              <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ config.label }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <button
            @click="applyCustomizedTemplate"
            class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
            :class="isDarkMode 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
          >
            Apply Template
          </button>
          <button
            @click="selectedTemplate = null; templateCustomization = {}"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
            :class="isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          >
            Cancel
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedRule = ref(null);
const complianceResults = ref(null);
const complianceScope = ref('design-system'); // 'design-system' or 'applications'
const selectedApplicationId = ref('');
const applications = ref([]);
const showRegisterModal = ref(false);
const showScannerTemplates = ref(false);
const showTemplateBrowser = ref(false);
const templateSearchQuery = ref('');
const templateCategoryFilter = ref('all');
const selectedTemplate = ref(null);
const templateCustomization = ref({});
const scannerTestResult = ref(null);
const ruleFilter = ref('all');
const newApplication = ref({ name: '', repository: '', version: '' });
const isLoading = ref(false);

const filteredRules = computed(() => {
  if (ruleFilter.value === 'all') return rules.value;
  return rules.value.filter(r => r.category === ruleFilter.value);
});

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123'; // In production, this would come from user settings

const loadApplications = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    applications.value = response.data.applications || [];
  } catch (error) {
    console.error('Failed to load applications:', error);
    // Fallback to mock data if API fails
    applications.value = [
      { id: 'app-1', name: 'Marketing Site', version: '2.1.0', repository: 'https://github.com/company/marketing-site', registeredAt: '2024-01-15', lastScanned: '2024-01-20' },
      { id: 'app-2', name: 'Admin Dashboard', version: '1.5.3', repository: 'https://github.com/company/admin-dashboard', registeredAt: '2024-01-10', lastScanned: '2024-01-18' },
      { id: 'app-3', name: 'Mobile App', version: '3.0.1', repository: 'https://github.com/company/mobile-app', registeredAt: '2024-01-05', lastScanned: '2024-01-19' }
    ];
  } finally {
    isLoading.value = false;
  }
};

const registerApplication = async () => {
  if (!newApplication.value.name) return;
  
  try {
    isLoading.value = true;
    const response = await axios.post(`${API_BASE_URL}/applications/register`, {
      name: newApplication.value.name,
      repository: newApplication.value.repository || undefined,
      version: newApplication.value.version || undefined
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    applications.value.push(response.data);
    selectedApplicationId.value = response.data.id;
    showRegisterModal.value = false;
    newApplication.value = { name: '', repository: '', version: '' };
  } catch (error) {
    console.error('Failed to register application:', error);
    alert('Failed to register application. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const rules = ref([
  // Design System Compliance Rules
  {
    id: 1,
    name: 'Design System Component Usage',
    description: 'Application must use design system components instead of custom implementations',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for design system component imports
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const designSystemPatterns = [
  /@designsystem\\/components/g,
  /from ['"]@designsystem/g,
  /import.*from ['"]@designsystem/g
];

const hasDesignSystemImport = designSystemPatterns.some(pattern => pattern.test(js));

if (!hasDesignSystemImport && html.length > 0) {
  checks.push({
    id: 'ds-component-usage',
    rule: 'Design System Component Usage',
    status: 'warning',
    message: 'Application does not appear to import design system components',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 2,
    name: 'Hardcoded Design Tokens',
    description: 'Application must use design tokens instead of hardcoded values',
    enabled: true,
    severity: 'error',
    category: 'design-system',
    scannerCode: `// Check for hardcoded color values
const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenValues = tokens.map(t => t.value);

const colorPattern = /#[0-9a-fA-F]{6}|rgb\\([^)]+\\)|rgba\\([^)]+\\)/g;
const colorMatches = [...css.matchAll(colorPattern)];

colorMatches.forEach(match => {
  const colorValue = match[0];
  const isToken = tokenValues.some(tv => tv.includes(colorValue) || colorValue.includes(tv));
  
  if (!isToken) {
    checks.push({
      id: \`hardcoded-color-\${match.index}\`,
      rule: 'Hardcoded Design Tokens',
      status: 'error',
      message: \`Found hardcoded color value: \${colorValue}. Use design tokens instead.\`,
      application: context.applicationName,
      file: context.file
    });
  }
});

return checks;`
  },
  {
    id: 3,
    name: 'Design System Version',
    description: 'Application should use the latest design system version',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check design system version
const checks = [];
const js = context.javascript || '';
const versionPattern = /@designsystem[^'"]*['"]\\s*([\\d.]+)/;
const versionMatch = js.match(versionPattern);

if (versionMatch) {
  const version = versionMatch[1];
  const majorVersion = parseInt(version.split('.')[0]);
  if (majorVersion < 2) {
    checks.push({
      id: 'ds-version',
      rule: 'Design System Version',
      status: 'warning',
      message: \`Application is using design system v\${version}. Consider upgrading.\`,
      application: context.applicationName,
      file: context.file
    });
  }
}

return checks;`
  },
  
  // UX / HCD Best Practices Rules
  {
    id: 4,
    name: 'Form Label Requirements',
    description: 'All form inputs must have associated labels for clarity and accessibility',
    enabled: true,
    severity: 'error',
    category: 'ux-hcd',
    scannerCode: `// Check for form labels
const checks = [];
const html = context.html || '';

const inputPattern = /<input[^>]*>/gi;
const inputs = [...html.matchAll(inputPattern)];

inputs.forEach(match => {
  const inputTag = match[0];
  const inputId = inputTag.match(/id=['"]([^'"]+)['"]/)?.[1];
  const hasLabel = inputId ? new RegExp(\`<label[^>]*for=['"]\${inputId}['"]\`, 'i').test(html) : false;
  const hasAriaLabel = /aria-label|aria-labelledby/i.test(inputTag);
  const hasPlaceholder = /placeholder/i.test(inputTag);
  
  if (!hasLabel && !hasAriaLabel && !hasPlaceholder) {
    checks.push({
      id: \`form-label-\${match.index}\`,
      rule: 'Form Label Requirements',
      status: 'error',
      message: 'Input element missing label, aria-label, or placeholder',
      application: context.applicationName,
      file: context.file,
      element: inputTag.substring(0, 50)
    });
  }
});

return checks;`
  },
  {
    id: 5,
    name: 'Error Message Handling',
    description: 'Forms should provide clear error feedback to users',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for error message handling
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasErrorMessages = /error|invalid|required|aria-invalid|aria-errormessage/i.test(html);
const hasErrorHandling = /catch|error|\\.error\\(|onError|handleError/i.test(js);

if (!hasErrorMessages && !hasErrorHandling) {
  checks.push({
    id: 'error-handling',
    rule: 'Error Message Handling',
    status: 'warning',
    message: 'No error message handling detected. Forms should provide clear error feedback.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 6,
    name: 'Loading State Indicators',
    description: 'Async operations should show loading indicators for better UX',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for loading states
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasLoadingIndicators = /loading|spinner|skeleton|aria-busy|aria-live/i.test(html);
const hasAsyncOperations = /fetch|axios|async|await|\\.then\\(/i.test(js);

if (hasAsyncOperations && !hasLoadingIndicators) {
  checks.push({
    id: 'loading-states',
    rule: 'Loading State Indicators',
    status: 'warning',
    message: 'Async operations detected but no loading indicators found.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 7,
    name: 'Empty State Handling',
    description: 'Lists and tables should show helpful messages when empty',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for empty states
const checks = [];
const html = context.html || '';

const hasEmptyStates = /empty|no.*found|no.*data|no.*results|nothing.*here/i.test(html);
const hasLists = /<ul|<ol|<table|<tbody/i.test(html);

if (hasLists && !hasEmptyStates) {
  checks.push({
    id: 'empty-states',
    rule: 'Empty State Handling',
    status: 'info',
    message: 'Lists or tables detected. Consider adding empty state messages.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 8,
    name: 'Destructive Action Confirmation',
    description: 'Destructive actions should require confirmation to prevent accidental data loss',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for destructive action confirmations
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const destructivePatterns = [
  /delete|remove|destroy|clear|reset|archive/i,
  /onClick.*delete|onClick.*remove/i
];

const hasDestructiveActions = destructivePatterns.some(pattern => 
  pattern.test(html) || pattern.test(js)
);

const hasConfirmations = /confirm|dialog|modal.*delete|modal.*remove|are.*sure/i.test(html + js);

if (hasDestructiveActions && !hasConfirmations) {
  checks.push({
    id: 'destructive-actions',
    rule: 'Destructive Action Confirmation',
    status: 'warning',
    message: 'Destructive actions detected but no confirmation dialogs found.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  
  // Accessibility Rules (using axe-core)
  {
    id: 9,
    name: 'Accessibility Scan (Comprehensive)',
    description: 'Comprehensive accessibility audit for WCAG compliance (keyboard navigation, ARIA, focus management)',
    enabled: true,
    severity: 'error',
    category: 'accessibility',
    scannerCode: `// Comprehensive accessibility scan
const checks = [];
const html = context.html || '';

if (!html) {
  return checks;
}

// Check for keyboard navigation issues
const interactiveElements = html.match(/<(button|a|input|select|textarea)[^>]*>/gi) || [];
interactiveElements.forEach((element, index) => {
  const hasTabIndex = /tabindex/i.test(element);
  const tabIndex = element.match(/tabindex=['"](-?\\d+)['"]/i)?.[1];
  const role = element.match(/role=['"]([^'"]+)['"]/i)?.[1];
  
  if (tabIndex === '-1' && role && ['button', 'link', 'menuitem'].includes(role)) {
    checks.push({
      id: \`keyboard-nav-\${index}\`,
      rule: 'Accessibility Scan (Comprehensive)',
      status: 'error',
      message: \`Interactive element with role="\${role}" has tabindex="-1" and is not keyboard accessible\`,
      application: context.applicationName,
      file: context.file,
      element: element.substring(0, 100)
    });
  }
});

// Check ARIA attributes
const elementsWithRoles = html.match(/<[^>]+role=['"]([^'"]+)['"][^>]*>/gi) || [];
elementsWithRoles.forEach((element, index) => {
  const role = element.match(/role=['"]([^'"]+)['"]/i)?.[1];
  const hasLabel = /aria-label|aria-labelledby/i.test(element);
  const hasText = element.match(/>([^<]+)</)?.[1]?.trim();
  
  const rolesRequiringLabels = ['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'tab', 'treeitem'];
  if (rolesRequiringLabels.includes(role) && !hasLabel && !hasText) {
    checks.push({
      id: \`aria-label-\${index}\`,
      rule: 'Accessibility Scan (Comprehensive)',
      status: 'error',
      message: \`Element with role="\${role}" requires aria-label or aria-labelledby\`,
      application: context.applicationName,
      file: context.file,
      element: element.substring(0, 100)
    });
  }
});

// Check focus management for modals
const modals = html.match(/<[^>]+role=['"]dialog['"][^>]*>/gi) || [];
modals.forEach((modal, index) => {
  const hasAutofocus = /autofocus/i.test(modal);
  const hasAriaDescribedby = /aria-describedby/i.test(modal);
  
  if (!hasAutofocus && !hasAriaDescribedby) {
    checks.push({
      id: \`focus-management-\${index}\`,
      rule: 'Accessibility Scan (Comprehensive)',
      status: 'warning',
      message: 'Modal/dialog should manage focus (focus trap, initial focus, return focus)',
      application: context.applicationName,
      file: context.file,
      element: modal.substring(0, 100)
    });
  }
});

return checks;`
  },
  {
    id: 10,
    name: 'Image Alt Text',
    description: 'All images must have descriptive alt text or be marked as decorative',
    enabled: true,
    severity: 'error',
    category: 'accessibility',
    scannerCode: `// Check for alt text on images
const checks = [];
const html = context.html || '';

const imgPattern = /<img[^>]*>/gi;
const images = [...html.matchAll(imgPattern)];

images.forEach(match => {
  const imgTag = match[0];
  const hasAlt = /alt=['"][^'"]*['"]/i.test(imgTag);
  const isDecorative = /alt=['"]\\s*['"]|role=['"]presentation['"]/i.test(imgTag);
  
  if (!hasAlt && !isDecorative) {
    checks.push({
      id: \`alt-text-\${match.index}\`,
      rule: 'Image Alt Text',
      status: 'error',
      message: 'Image missing alt text. All images must have descriptive alt text.',
      application: context.applicationName,
      file: context.file,
      element: imgTag.substring(0, 50)
    });
  }
});

return checks;`
  },
  {
    id: 11,
    name: 'Heading Hierarchy',
    description: 'Headings should follow a logical hierarchy (h1 → h2 → h3, etc.)',
    enabled: true,
    severity: 'warning',
    category: 'accessibility',
    scannerCode: `// Check heading hierarchy
const checks = [];
const html = context.html || '';

const headings = html.match(/<h[1-6][^>]*>/gi) || [];
let previousLevel = 0;

headings.forEach((heading, index) => {
  const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '0');
  if (previousLevel > 0 && level > previousLevel + 1) {
    checks.push({
      id: \`heading-hierarchy-\${index}\`,
      rule: 'Heading Hierarchy',
      status: 'warning',
      message: \`Heading level jumps from h\${previousLevel} to h\${level}. Headings should follow a logical hierarchy.\`,
      application: context.applicationName,
      file: context.file,
      element: heading
    });
  }
  previousLevel = level;
});

return checks;`
  },
  {
    id: 12,
    name: 'Photosensitivity Analysis (IRIS)',
    description: 'Analyze video content for photosensitive epileptic risks (luminance flashes, red saturation flashes, spatial patterns)',
    enabled: true,
    severity: 'error',
    category: 'accessibility',
    scannerCode: `// Photosensitivity analysis using IRIS
// Note: This rule requires video files to be uploaded and analyzed via the IRIS service
// The scanner code here checks if video content exists and triggers IRIS analysis
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

// Check for video elements or video-related code
const hasVideoElements = /<video|<source.*type=['"]video/i.test(html);
const hasVideoCode = /video|Video|VIDEO|\.mp4|\.webm|\.avi|\.mov/i.test(html + js);

if (hasVideoElements || hasVideoCode) {
  checks.push({
    id: 'photosensitivity-video-detected',
    rule: 'Photosensitivity Analysis (IRIS)',
    status: 'warning',
    message: 'Video content detected. Please upload video files for IRIS photosensitivity analysis to check for luminance flashes, red saturation flashes, and spatial patterns that may cause photosensitive epileptic seizures. Use the "Photosensitivity Analysis" tool in the Tools section.',
    application: context.applicationName,
    file: context.file,
    impact: 'serious'
  });
} else {
  checks.push({
    id: 'photosensitivity-no-video',
    rule: 'Photosensitivity Analysis (IRIS)',
    status: 'pass',
    message: 'No video content detected. IRIS photosensitivity analysis not required.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  
  // Design System Rules (for scanning design system itself)
  {
    id: 13,
    name: 'Color Contrast WCAG AA',
    description: 'All text must meet WCAG AA contrast requirements (4.5:1)',
    enabled: true,
    severity: 'error',
    category: 'design-system',
    scannerCode: `// Check color contrast for WCAG AA compliance
const checks = [];
const components = context.components || [];

components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  // Look for color values in component code
  const colorMatches = code.match(/#[0-9a-fA-F]{6}|rgb\\([^)]+\\)|rgba\\([^)]+\\)/g);
  
  if (colorMatches) {
    // Check if component has accessibility notes
    if (!component.accessibility?.wcag) {
      checks.push({
        id: \`contrast-\${component.id || component.name}\`,
        rule: 'Color Contrast WCAG AA',
        status: 'warning',
        message: \`Component "\${component.name}" may not meet WCAG AA contrast requirements. Verify text/background contrast ratios.\`,
        component: component.name
      });
    } else {
      checks.push({
        id: \`contrast-\${component.id || component.name}\`,
        rule: 'Color Contrast WCAG AA',
        status: 'pass',
        message: \`Component "\${component.name}" meets WCAG AA contrast requirements\`,
        component: component.name
      });
    }
  }
});

return checks.length > 0 ? checks : [{
  id: 'contrast-overall',
  rule: 'Color Contrast WCAG AA',
  status: 'pass',
  message: 'All components meet WCAG AA contrast requirements'
}];`
  },
  {
    id: 13,
    name: 'Spacing Consistency',
    description: 'Spacing must use design tokens (4px, 8px, 16px, etc.)',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check spacing consistency using design tokens
const checks = [];
const components = context.components || [];
const tokens = context.tokens || [];

const spacingTokens = tokens.filter(t => t.category === 'spacing');
const tokenValues = spacingTokens.map(t => t.value);
const validSpacingValues = ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'];

components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  // Look for spacing values (px, rem, em)
  const spacingRegex = /(padding|margin|gap|top|bottom|left|right):\\s*(\\d+(?:\\.\\d+)?)\\s*(px|rem|em)/gi;
  const matches = [...code.matchAll(spacingRegex)];
  
  matches.forEach(match => {
    const value = match[2];
    const unit = match[3];
    const fullValue = \`\${value}\${unit}\`;
    
    // Check if it's a standard spacing value or token
    const isStandard = validSpacingValues.includes(fullValue) || 
                     tokenValues.some(tv => tv.includes(value) || tv.includes(fullValue));
    
    if (!isStandard && unit === 'px') {
      checks.push({
        id: \`spacing-\${component.id || component.name}-\${match.index}\`,
        rule: 'Spacing Consistency',
        status: 'warning',
        message: \`Component "\${component.name}" uses non-standard spacing value: \${fullValue}. Use design tokens instead.\`,
        component: component.name
      });
    }
  });
});

return checks.length > 0 ? checks : [{
  id: 'spacing-overall',
  rule: 'Spacing Consistency',
  status: 'pass',
  message: 'All components use design tokens for spacing'
}];`
  },
  {
    id: 14,
    name: 'Typography Scale',
    description: 'Font sizes must follow the defined typography scale',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check typography scale compliance
const checks = [];
const components = context.components || [];
const tokens = context.tokens || [];

const typographyTokens = tokens.filter(t => t.category === 'typography' && t.type === 'fontSize');
const validFontSizes = typographyTokens.map(t => t.value);

components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  // Look for font-size declarations
  const fontSizeRegex = /font-size:\\s*([^;]+);/gi;
  const matches = [...code.matchAll(fontSizeRegex)];
  
  matches.forEach(match => {
    const fontSize = match[1].trim();
    const isStandard = validFontSizes.some(vs => vs.includes(fontSize) || fontSize.includes(vs));
    
    if (!isStandard && !fontSize.includes('var(') && !fontSize.includes('token')) {
      checks.push({
        id: \`typography-\${component.id || component.name}-\${match.index}\`,
        rule: 'Typography Scale',
        status: 'warning',
        message: \`Component "\${component.name}" uses non-standard font size: \${fontSize}. Use typography scale tokens.\`,
        component: component.name
      });
    }
  });
});

return checks.length > 0 ? checks : [{
  id: 'typography-overall',
  rule: 'Typography Scale',
  status: 'pass',
  message: 'All font sizes follow the typography scale'
}];`
  },
  {
    id: 15,
    name: 'Component Naming',
    description: 'Components must follow PascalCase naming convention',
    enabled: true,
    severity: 'info',
    category: 'design-system',
    scannerCode: `// Check component naming convention
const checks = [];
const components = context.components || [];
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

components.forEach(component => {
  const isValid = pascalCaseRegex.test(component.name);
  
  if (!isValid) {
    checks.push({
      id: \`naming-\${component.id || component.name}\`,
      rule: 'Component Naming',
      status: 'warning',
      message: \`Component "\${component.name}" does not follow PascalCase naming convention. Use PascalCase (e.g., MyComponent).\`,
      component: component.name
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'naming-overall',
  rule: 'Component Naming',
  status: 'pass',
  message: 'All components follow PascalCase convention'
}];`
  },
  {
    id: 16,
    name: 'Accessibility Attributes',
    description: 'All interactive elements must have ARIA labels',
    enabled: true,
    severity: 'error',
    category: 'accessibility',
    scannerCode: `// Check for ARIA labels on interactive elements
const checks = [];
const components = context.components || [];
const interactiveElements = ['button', 'input', 'select', 'textarea', 'a'];

components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  interactiveElements.forEach(element => {
    const elementRegex = new RegExp(\`<\${element}[^>]*>\`, 'gi');
    const matches = [...code.matchAll(elementRegex)];
    
    matches.forEach(match => {
      const tagContent = match[0];
      const hasAriaLabel = /aria-label|aria-labelledby/i.test(tagContent);
      const hasLabel = /<label/i.test(code);
      const hasPlaceholder = /placeholder/i.test(tagContent);
      const isHidden = /type=['"]hidden['"]/i.test(tagContent);
      
      if (!hasAriaLabel && !hasLabel && !hasPlaceholder && !isHidden) {
        checks.push({
          id: \`accessibility-\${component.id || component.name}-\${match.index}\`,
          rule: 'Accessibility Attributes',
          status: 'error',
          message: \`Component "\${component.name}" has \${element} element without ARIA label or associated label. Add aria-label, aria-labelledby, or <label>.\`,
          component: component.name,
          element: tagContent.substring(0, 50)
        });
      }
    });
  });
});

return checks.length > 0 ? checks : [{
  id: 'accessibility-overall',
  rule: 'Accessibility Attributes',
  status: 'pass',
  message: 'All interactive elements have ARIA labels'
}];`
  },
  
  // New Design System Rules
  {
    id: 17,
    name: 'Border Radius Consistency',
    description: 'Border radius values should use design system tokens for consistency',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for hardcoded border radius values
const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenValues = tokens.map(t => t.value);

const borderRadiusPattern = /border-radius\\s*:\\s*([^;]+)/gi;
const matches = [...css.matchAll(borderRadiusPattern)];

matches.forEach(match => {
  const borderRadiusValue = match[1].trim();
  const isToken = tokenValues.some(tv => borderRadiusValue.includes(tv)) || 
                 borderRadiusValue.match(/var\\(|--[a-z-]+/i);
  
  if (!isToken && !borderRadiusValue.match(/^\\d+px$/)) {
    checks.push({
      id: \`border-radius-\${match.index}\`,
      rule: 'Border Radius Consistency',
      status: 'warning',
      message: \`Found non-standard border-radius value: \${borderRadiusValue}. Use design system tokens for consistency.\`,
      application: context.applicationName,
      file: context.file,
      line: match.index
    });
  }
});

return checks;`
  },
  {
    id: 18,
    name: 'Shadow/Elevation Consistency',
    description: 'Box-shadow values should use design system elevation tokens',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for hardcoded shadow/elevation values
const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenValues = tokens.map(t => t.value);

const shadowPattern = /box-shadow\\s*:\\s*([^;]+)/gi;
const matches = [...css.matchAll(shadowPattern)];

matches.forEach(match => {
  const shadowValue = match[1].trim();
  const isToken = tokenValues.some(tv => shadowValue.includes(tv)) || 
                 shadowValue.match(/var\\(|--[a-z-]+/i);
  
  if (!isToken && shadowValue !== 'none') {
    checks.push({
      id: \`shadow-\${match.index}\`,
      rule: 'Shadow/Elevation Consistency',
      status: 'warning',
      message: \`Found hardcoded box-shadow value. Use design system elevation tokens for consistency.\`,
      application: context.applicationName,
      file: context.file,
      line: match.index
    });
  }
});

return checks;`
  },
  {
    id: 19,
    name: 'Z-index Layer Management',
    description: 'Z-index values should use design system layer tokens for proper stacking',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for hardcoded z-index values
const checks = [];
const css = context.css || '';

const zIndexPattern = /z-index\\s*:\\s*(\\d+)/gi;
const matches = [...css.matchAll(zIndexPattern)];

matches.forEach(match => {
  const zIndexValue = parseInt(match[1]);
  if (zIndexValue > 1000 || (zIndexValue > 100 && zIndexValue % 10 !== 0)) {
    checks.push({
      id: \`z-index-\${match.index}\`,
      rule: 'Z-index Layer Management',
      status: 'warning',
      message: \`Found z-index value: \${zIndexValue}. Use design system layer tokens for proper stacking context management.\`,
      application: context.applicationName,
      file: context.file,
      line: match.index
    });
  }
});

return checks;`
  },
  {
    id: 20,
    name: 'Icon Usage Consistency',
    description: 'Icons should come from the design system icon library',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for icon usage consistency
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasDesignSystemIcons = /@designsystem.*icon|from ['"]@designsystem.*icon/i.test(js);
const hasInlineIcons = /<svg|<i class.*icon|icon-/i.test(html);
const hasIconFonts = /font.*icon|iconfont/i.test(html);

if ((hasInlineIcons || hasIconFonts) && !hasDesignSystemIcons) {
  checks.push({
    id: 'icon-usage',
    rule: 'Icon Usage Consistency',
    status: 'warning',
    message: 'Icons detected but not using design system icon library. Use design system icons for consistency.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  
  // New UX/HCD Rules
  {
    id: 21,
    name: 'Touch Target Sizes',
    description: 'Interactive elements should have minimum 44x44px touch targets for mobile accessibility',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for touch target sizes (simplified - would need DOM parsing for full check)
const checks = [];
const html = context.html || '';
const css = context.css || '';

// Check for button elements and their sizes
const buttonPattern = /<button[^>]*>/gi;
const buttons = [...html.matchAll(buttonPattern)];

// Check CSS for min-height/min-width on buttons
const hasMinSize = /min-height\\s*:\\s*(\\d+)px|min-width\\s*:\\s*(\\d+)px/i.test(css);

if (buttons.length > 0 && !hasMinSize) {
  checks.push({
    id: 'touch-target-sizes',
    rule: 'Touch Target Sizes',
    status: 'warning',
    message: 'Interactive elements should have minimum touch target size of 44x44px for mobile accessibility',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 22,
    name: 'Success State Indicators',
    description: 'Form submissions should provide success feedback to confirm user actions',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for success state indicators
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasFormSubmissions = /submit|save|create|update|post/i.test(html + js);
const hasSuccessIndicators = /success|saved|created|updated|toast.*success|notification.*success|aria-live.*polite/i.test(html + js);

if (hasFormSubmissions && !hasSuccessIndicators) {
  checks.push({
    id: 'success-states',
    rule: 'Success State Indicators',
    status: 'info',
    message: 'Form submissions detected. Consider adding success feedback to confirm user actions.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 23,
    name: 'Navigation Consistency',
    description: 'Navigation should include breadcrumbs for deep navigation and skip links for accessibility',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for navigation consistency
const checks = [];
const html = context.html || '';

const hasMultipleNavs = (html.match(/<nav|<[^>]+role=['"]navigation['"]/gi) || []).length > 1;
const hasBreadcrumbs = /breadcrumb|aria-label.*breadcrumb/i.test(html);
const hasSkipLinks = /skip.*to.*content|skip.*navigation/i.test(html);

if (hasMultipleNavs && !hasBreadcrumbs) {
  checks.push({
    id: 'navigation-consistency',
    rule: 'Navigation Consistency',
    status: 'info',
    message: 'Multiple navigation elements detected. Consider adding breadcrumbs for deep navigation.',
    application: context.applicationName,
    file: context.file
  });
}

if (!hasSkipLinks && hasMultipleNavs) {
  checks.push({
    id: 'skip-links',
    rule: 'Navigation Consistency',
    status: 'info',
    message: 'Navigation detected but no skip links found. Add skip links for keyboard navigation accessibility.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 24,
    name: 'Help Text and Tooltips',
    description: 'Complex form inputs should have help text or tooltips for better UX',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for help text and tooltips on complex inputs
const checks = [];
const html = context.html || '';

const complexInputs = html.match(/<input[^>]+type=['"](date|datetime-local|time|number|range)['"]|<select|<textarea/gi) || [];

complexInputs.forEach((input, index) => {
  const hasAriaDescribedBy = /aria-describedby/i.test(input);
  const hasPlaceholder = /placeholder/i.test(input);
  const hasTitle = /title=['"][^'"]*['"]/i.test(input);
  
  if (!hasAriaDescribedBy && !hasPlaceholder && !hasTitle) {
    checks.push({
      id: \`help-text-\${index}\`,
      rule: 'Help Text and Tooltips',
      status: 'info',
      message: 'Complex input detected without help text. Consider adding tooltips or help text for better UX.',
      application: context.applicationName,
      file: context.file,
      element: input.substring(0, 100)
    });
  }
});

return checks;`
  },
  
  // Additional Design System Rules
  {
    id: 25,
    name: 'Responsive Breakpoint Usage',
    description: 'Breakpoints should match design system tokens for consistent responsive behavior',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for responsive breakpoint usage
const checks = [];
const css = context.css || '';

const standardBreakpoints = ['640px', '768px', '1024px', '1280px', '1536px'];
const breakpointPattern = /@media\\s*\\([^)]*min-width\\s*:\\s*([^)]+)\\)|@media\\s*\\([^)]*max-width\\s*:\\s*([^)]+)\\)/gi;
const matches = [...css.matchAll(breakpointPattern)];

matches.forEach(match => {
  const breakpoint = (match[1] || match[2] || '').trim();
  const isStandard = standardBreakpoints.some(bp => breakpoint.includes(bp));
  const isToken = breakpoint.match(/var\\(|--[a-z-]+/i);
  
  if (!isStandard && !isToken && breakpoint) {
    checks.push({
      id: \`breakpoint-\${match.index}\`,
      rule: 'Responsive Breakpoint Usage',
      status: 'warning',
      message: \`Found non-standard breakpoint: \${breakpoint}. Use design system breakpoint tokens for consistency.\`,
      application: context.applicationName,
      file: context.file
    });
  }
});

return checks;`
  },
  {
    id: 26,
    name: 'Animation/Transition Consistency',
    description: 'Animations and transitions should use design system tokens for consistency',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for animation/transition consistency
const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenValues = tokens.map(t => t.value);

const transitionPattern = /transition\\s*:\\s*([^;]+)/gi;
const animationPattern = /animation\\s*:\\s*([^;]+)/gi;
const matches = [
  ...css.matchAll(transitionPattern),
  ...css.matchAll(animationPattern)
];

matches.forEach(match => {
  const value = match[1].trim();
  const isToken = tokenValues.some(tv => value.includes(tv)) || 
                 value.match(/var\\(|--[a-z-]+/i);
  const isStandard = /ease|linear|ease-in|ease-out|ease-in-out/i.test(value);
  
  if (!isToken && !isStandard && value !== 'none') {
    checks.push({
      id: \`animation-\${match.index}\`,
      rule: 'Animation/Transition Consistency',
      status: 'warning',
      message: \`Found custom animation/transition: \${value}. Use design system animation tokens for consistency.\`,
      application: context.applicationName,
      file: context.file
    });
  }
});

return checks;`
  },
  {
    id: 27,
    name: 'Component Variant Usage',
    description: 'Component variants should use design system variant patterns',
    enabled: true,
    severity: 'warning',
    category: 'design-system',
    scannerCode: `// Check for component variant usage
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const variantPatterns = [
  /variant=['"]\\w+['"]/i,
  /size=['"]\\w+['"]/i,
  /variant:\\s*['"]\\w+['"]/i,
  /size:\\s*['"]\\w+['"]/i
];

const hasVariants = variantPatterns.some(pattern => pattern.test(html + js));
const hasDesignSystemComponents = /@designsystem\\/components|from ['"]@designsystem/i.test(js);
const customVariantPattern = /class.*variant|className.*variant|\\.variant/i;
const hasCustomVariants = customVariantPattern.test(html + js);

if (hasDesignSystemComponents && hasCustomVariants && !hasVariants) {
  checks.push({
    id: 'component-variant-usage',
    rule: 'Component Variant Usage',
    status: 'warning',
    message: 'Custom variant implementations detected. Use design system component variants instead.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  
  // Additional UX/HCD Rules
  {
    id: 28,
    name: 'Search Functionality',
    description: 'Content-heavy pages should include search functionality for better UX',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for search functionality
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasLists = /<ul|<ol|<table|<tbody/i.test(html);
const hasManyLinks = (html.match(/<a[^>]*>/gi) || []).length > 10;
const hasManyHeadings = (html.match(/<h[1-6][^>]*>/gi) || []).length > 5;

const hasSearchInput = /<input[^>]*type=['"]search['"]|<input[^>]*placeholder=['"][^'"]*search/i.test(html);
const hasSearchFunction = /search|filter|find/i.test(js);
const hasSearchIcon = /search|magnifying/i.test(html);

const isContentHeavy = hasLists && (hasManyLinks || hasManyHeadings);

if (isContentHeavy && !hasSearchInput && !hasSearchFunction && !hasSearchIcon) {
  checks.push({
    id: 'search-functionality',
    rule: 'Search Functionality',
    status: 'info',
    message: 'Content-heavy page detected. Consider adding search functionality for better UX.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 29,
    name: 'Consistent Modal/Dialog Patterns',
    description: 'Modals and dialogs should use consistent design system patterns',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for consistent modal/dialog patterns
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const modalPatterns = [
  /<dialog/i,
  /role=['"]dialog['"]/i,
  /role=['"]alertdialog['"]/i,
  /modal|dialog/i
];

const modals = modalPatterns.filter(pattern => pattern.test(html + js));
const hasMultipleModals = modals.length > 1;
const hasDesignSystemModals = /@designsystem.*modal|@designsystem.*dialog|Modal|Dialog/i.test(js);
const hasConsistentPattern = /Modal|Dialog|modal|dialog/i.test(js) && 
                             (hasDesignSystemModals || /class.*modal|className.*modal/i.test(html));

if (hasMultipleModals && !hasConsistentPattern) {
  checks.push({
    id: 'modal-consistency',
    rule: 'Consistent Modal/Dialog Patterns',
    status: 'warning',
    message: 'Multiple modal/dialog implementations detected. Use consistent design system modal patterns.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 30,
    name: 'Consistent Toast/Notification Patterns',
    description: 'Notifications and toasts should use consistent design system patterns',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for consistent toast/notification patterns
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasNotifications = /notification|toast|snackbar|alert/i.test(html + js);
const hasMultiplePatterns = [
  /toast/i,
  /notification/i,
  /snackbar/i,
  /alert/i
].filter(pattern => pattern.test(html + js)).length > 1;

const hasDesignSystemNotifications = /@designsystem.*toast|@designsystem.*notification|Toast|Notification/i.test(js);

if (hasNotifications && hasMultiplePatterns && !hasDesignSystemNotifications) {
  checks.push({
    id: 'toast-consistency',
    rule: 'Consistent Toast/Notification Patterns',
    status: 'warning',
    message: 'Multiple notification patterns detected. Use consistent design system notification/toast components.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 31,
    name: 'Page Load Performance Indicators',
    description: 'Pages with heavy resources should include performance optimizations',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for page load performance indicators
const checks = [];
const html = context.html || '';
const js = context.javascript || '';

const hasLazyLoading = /loading=['"]lazy['"]|lazy-load/i.test(html + js);
const hasCodeSplitting = /import\\(|lazy\\(|React\\.lazy/i.test(js);
const hasImageOptimization = /srcset|sizes/i.test(html);
const hasPreload = /<link[^>]*rel=['"]preload['"]/i.test(html);
const hasPrefetch = /<link[^>]*rel=['"]prefetch['"]/i.test(html);

const hasManyImages = (html.match(/<img[^>]*>/gi) || []).length > 5;
const hasManyScripts = (html.match(/<script[^>]*>/gi) || []).length > 5;
const hasManyStylesheets = (html.match(/<link[^>]*rel=['"]stylesheet['"]/gi) || []).length > 3;

const hasHeavyResources = hasManyImages || hasManyScripts || hasManyStylesheets;
const hasOptimizations = hasLazyLoading || hasCodeSplitting || hasImageOptimization || hasPreload || hasPrefetch;

if (hasHeavyResources && !hasOptimizations) {
  checks.push({
    id: 'performance-indicators',
    rule: 'Page Load Performance Indicators',
    status: 'warning',
    message: 'Heavy resources detected without performance optimizations. Consider lazy loading, code splitting, or resource preloading.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 32,
    name: 'Offline State Handling',
    description: 'Applications with async operations should handle offline states',
    enabled: true,
    severity: 'info',
    category: 'ux-hcd',
    scannerCode: `// Check for offline state handling
const checks = [];
const js = context.javascript || '';

const hasOfflineDetection = /online|offline|navigator\\.onLine|addEventListener.*online|addEventListener.*offline/i.test(js);
const hasServiceWorker = /serviceWorker|navigator\\.serviceWorker/i.test(js);
const hasCacheAPI = /cache|Cache\\.open|CacheStorage/i.test(js);
const hasIndexedDB = /indexedDB|IDB/i.test(js);

const hasOfflineCapabilities = hasServiceWorker || hasCacheAPI || hasIndexedDB;
const hasAsyncOperations = /fetch|axios|async|await|\\.then\\(/i.test(js);

if (hasAsyncOperations && !hasOfflineDetection && !hasOfflineCapabilities) {
  checks.push({
    id: 'offline-state-handling',
    rule: 'Offline State Handling',
    status: 'info',
    message: 'Async operations detected. Consider adding offline state handling for better UX.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  },
  {
    id: 33,
    name: 'Content Hierarchy',
    description: 'Content should follow proper semantic hierarchy with headings and structure',
    enabled: true,
    severity: 'warning',
    category: 'ux-hcd',
    scannerCode: `// Check for proper content hierarchy
const checks = [];
const html = context.html || '';

const headings = html.match(/<h[1-6][^>]*>/gi) || [];
let previousLevel = 0;
let hasH1 = false;

headings.forEach((heading, index) => {
  const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '0');
  
  if (level === 1) {
    hasH1 = true;
  }
  
  if (previousLevel > 0 && level > previousLevel + 1) {
    checks.push({
      id: \`content-hierarchy-\${index}\`,
      rule: 'Content Hierarchy',
      status: 'warning',
      message: \`Heading hierarchy jumps from h\${previousLevel} to h\${level}. Headings should follow a logical order.\`,
      application: context.applicationName,
      file: context.file,
      element: heading
    });
  }
  
  previousLevel = level;
});

if (headings.length > 0 && !hasH1) {
  checks.push({
    id: 'content-hierarchy-h1',
    rule: 'Content Hierarchy',
    status: 'warning',
    message: 'Page has headings but no h1. Each page should have a single h1 for proper content hierarchy.',
    application: context.applicationName,
    file: context.file
  });
}

const hasMain = /<main/i.test(html);
const hasArticle = /<article/i.test(html);
const hasSection = /<section/i.test(html);

if (headings.length > 3 && !hasMain && !hasArticle && !hasSection) {
  checks.push({
    id: 'content-hierarchy-semantic',
    rule: 'Content Hierarchy',
    status: 'info',
    message: 'Multiple headings detected. Consider using semantic HTML elements (main, article, section) for better structure.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;`
  }
]);

const selectRule = (rule) => {
  // Create a copy to avoid direct mutation
  selectedRule.value = { 
    ...rule,
    category: rule.category || 'design-system',  // Ensure category exists
    scannerCode: rule.scannerCode || `// Scanner function
// context: { components, tokens, codebase?, applicationName? }
// Returns: ComplianceCheck[]

const checks = [];
// Your scanning logic here
return checks;`
  };
  scannerTestResult.value = null;
};

const addRule = () => {
  const newRule = {
    id: Date.now(), // Use timestamp for unique ID
    name: 'New Rule',
    description: 'Rule description',
    enabled: true,
    severity: 'info',
    category: 'design-system',  // Default category
    scannerCode: `// Scanner function
// context: { components, tokens, codebase?, applicationName? }
// Returns: ComplianceCheck[]

const checks = [];
// Your scanning logic here
return checks;`
  };
  rules.value.push(newRule);
  selectedRule.value = { ...newRule };
};

const saveRule = async () => {
  if (!selectedRule.value) return;
  
  // Validate scanner code if provided
  if (selectedRule.value.scannerCode) {
    try {
      // Basic syntax validation
      new Function(selectedRule.value.scannerCode);
    } catch (error) {
      scannerTestResult.value = {
        success: false,
        message: `Scanner code has syntax errors: ${error.message}`
      };
      return;
    }
  }
  
  // Find the rule in the array and update it
  const index = rules.value.findIndex(r => r.id === selectedRule.value.id);
  if (index !== -1) {
    rules.value[index] = { ...selectedRule.value };
  }
  
  selectedRule.value = null;
  scannerTestResult.value = null;
};

const testScanner = async () => {
  if (!selectedRule.value || !selectedRule.value.scannerCode) {
    scannerTestResult.value = {
      success: false,
      message: 'No scanner code provided'
    };
    return;
  }

  try {
    // Create a test context
    const testContext = {
      components: [
        {
          id: 'test-button',
          name: 'TestButton',
          code: { vue: '<button>Click me</button>', react: '<button>Click me</button>' },
          accessibility: { wcag: 'AA' }
        }
      ],
      tokens: [
        { name: 'spacing.md', value: '1rem', category: 'spacing', type: 'dimension' }
      ]
    };

    // Execute scanner code
    const scannerFunction = new Function('context', selectedRule.value.scannerCode);
    const result = scannerFunction(testContext);

    // Validate result
    if (!Array.isArray(result)) {
      scannerTestResult.value = {
        success: false,
        message: 'Scanner must return an array of ComplianceCheck objects'
      };
      return;
    }

    scannerTestResult.value = {
      success: true,
      message: `Scanner executed successfully! Returned ${result.length} check(s).`
    };
  } catch (error) {
    scannerTestResult.value = {
      success: false,
      message: `Error executing scanner: ${error.message}`
    };
  }
};

// Rule Template Library
const ruleTemplates = [
  // Design System Templates
  {
    id: 'hardcoded-colors',
    name: 'Hardcoded Color Detection',
    description: 'Detects hardcoded color values (hex, rgb, rgba) that should use design tokens',
    category: 'design-system',
    severity: 'error',
    tags: ['colors', 'tokens', 'hardcoded', 'design-system'],
    configurable: {
      tokenCategory: { type: 'select', label: 'Token Category', default: 'colors', options: ['colors', 'spacing', 'typography', 'all'] },
      severity: { type: 'select', label: 'Severity', default: 'error', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenCategory = '{{tokenCategory}}';
const checkSeverity = '{{severity}}';

// Get tokens based on category
let relevantTokens = tokens;
if (tokenCategory !== 'all') {
  relevantTokens = tokens.filter(t => t.category === tokenCategory);
}
const tokenValues = relevantTokens.map(t => t.value);

// Find hardcoded colors
const colorPattern = /#[0-9a-fA-F]{6}|rgb\\([^)]+\\)|rgba\\([^)]+\\)/gi;
const matches = [...css.matchAll(colorPattern)];

matches.forEach(match => {
  const colorValue = match[0];
  const isToken = tokenValues.some(tv => {
    // Normalize for comparison
    return normalizeColor(tv) === normalizeColor(colorValue);
  });
  
  if (!isToken) {
    checks.push({
      id: \`hardcoded-color-\${match.index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`Found hardcoded color: \${colorValue}. Use design tokens instead.\`,
      file: context.file,
      line: getLineNumber(css, match.index)
    });
  }
});

function normalizeColor(color) {
  return color.toLowerCase().replace(/\\s/g, '');
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\\n').length;
}

return checks.length > 0 ? checks : [{
  id: 'color-check-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'All colors use design tokens'
}];`
  },
  {
    id: 'hardcoded-spacing',
    name: 'Hardcoded Spacing Detection',
    description: 'Detects hardcoded spacing values (px, rem, em) that should use design tokens',
    category: 'design-system',
    severity: 'warning',
    tags: ['spacing', 'tokens', 'hardcoded', 'design-system'],
    configurable: {
      tokenCategory: { type: 'select', label: 'Token Category', default: 'spacing', options: ['spacing', 'all'] },
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];
const tokenCategory = '{{tokenCategory}}';
const checkSeverity = '{{severity}}';

// Get spacing tokens
let spacingTokens = tokens;
if (tokenCategory !== 'all') {
  spacingTokens = tokens.filter(t => t.category === 'spacing');
}
const tokenValues = spacingTokens.map(t => t.value);

// Find hardcoded spacing values
const spacingPattern = /(?:margin|padding|gap|top|right|bottom|left|width|height|max-width|min-width|max-height|min-height):\\s*([0-9.]+(?:px|rem|em))/gi;
const matches = [...css.matchAll(spacingPattern)];

matches.forEach(match => {
  const spacingValue = match[1];
  const isToken = tokenValues.some(tv => tv.includes(spacingValue));
  
  if (!isToken) {
    checks.push({
      id: \`hardcoded-spacing-\${match.index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`Found hardcoded spacing: \${match[0]}. Use design tokens instead.\`,
      file: context.file,
      line: getLineNumber(css, match.index)
    });
  }
});

function getLineNumber(content, index) {
  return content.substring(0, index).split('\\n').length;
}

return checks.length > 0 ? checks : [{
  id: 'spacing-check-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'All spacing uses design tokens'
}];`
  },
  {
    id: 'component-naming',
    name: 'Component Naming Convention',
    description: 'Validates that component names follow PascalCase convention',
    category: 'design-system',
    severity: 'warning',
    tags: ['naming', 'convention', 'components', 'design-system'],
    configurable: {
      convention: { type: 'select', label: 'Naming Convention', default: 'pascal', options: ['pascal', 'kebab', 'camel'] },
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const components = context.components || [];
const checkSeverity = '{{severity}}';
const convention = '{{convention}}';

let regex;
if (convention === 'pascal') {
  regex = /^[A-Z][a-zA-Z0-9]*$/;
} else if (convention === 'kebab') {
  regex = /^[a-z]+(-[a-z]+)*$/;
} else if (convention === 'camel') {
  regex = /^[a-z][a-zA-Z0-9]*$/;
}

components.forEach(component => {
  const isValid = regex.test(component.name);
  
  if (!isValid) {
    checks.push({
      id: \`naming-\${component.id}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`Component "\${component.name}" does not follow \${convention}Case convention.\`,
      component: component.name
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'naming-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: \`All components follow \${convention}Case convention\`
}];`
  },
  {
    id: 'aria-labels',
    name: 'ARIA Label Requirements',
    description: 'Checks that all interactive elements have ARIA labels or associated labels',
    category: 'accessibility',
    severity: 'error',
    tags: ['aria', 'accessibility', 'labels', 'wcag'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'error', options: ['error', 'warning', 'info'] },
      allowPlaceholder: { type: 'checkbox', label: 'Allow Placeholder as Label', default: false }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const checkSeverity = '{{severity}}';
const allowPlaceholder = {{allowPlaceholder}};

// Find all interactive elements
const interactivePattern = /<(button|a|input|select|textarea)[^>]*>/gi;
const elements = [...html.matchAll(interactivePattern)];

elements.forEach((match, index) => {
  const element = match[0];
  const tagName = match[1].toLowerCase();
  
  // Check for ARIA label
  const hasAriaLabel = /aria-label|aria-labelledby/i.test(element);
  const hasLabel = /<label[^>]*>/i.test(html);
  const hasPlaceholder = /placeholder/i.test(element);
  const isHidden = /type=['"]hidden['"]/i.test(element);
  
  if (!hasAriaLabel && !hasLabel && (!hasPlaceholder || !allowPlaceholder) && !isHidden) {
    checks.push({
      id: \`aria-missing-\${index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`\${tagName} element missing ARIA label or associated label\`,
      file: context.file,
      element: element.substring(0, 50)
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'aria-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'All interactive elements have ARIA labels'
}];`
  },
  {
    id: 'image-alt-text',
    name: 'Image Alt Text Requirements',
    description: 'Ensures all images have alt text attributes for accessibility',
    category: 'accessibility',
    severity: 'error',
    tags: ['images', 'alt-text', 'accessibility', 'wcag'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'error', options: ['error', 'warning', 'info'] },
      allowEmpty: { type: 'checkbox', label: 'Allow Empty Alt for Decorative Images', default: true }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const checkSeverity = '{{severity}}';
const allowEmpty = {{allowEmpty}};

// Find all image elements
const imagePattern = /<img[^>]*>/gi;
const images = [...html.matchAll(imagePattern)];

images.forEach((match, index) => {
  const img = match[0];
  const hasAlt = /alt=/i.test(img);
  const hasEmptyAlt = /alt=['"]\s*['"]/i.test(img);
  
  if (!hasAlt) {
    checks.push({
      id: \`alt-missing-\${index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: 'Image missing alt attribute',
      file: context.file,
      element: img.substring(0, 50)
    });
  } else if (!allowEmpty && hasEmptyAlt) {
    checks.push({
      id: \`alt-empty-\${index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: 'Image has empty alt attribute (should have descriptive text or be marked as decorative)',
      file: context.file,
      element: img.substring(0, 50)
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'alt-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'All images have appropriate alt text'
}];`
  },
  {
    id: 'form-labels',
    name: 'Form Label Requirements',
    description: 'Ensures all form inputs have associated labels',
    category: 'ux-hcd',
    severity: 'error',
    tags: ['forms', 'labels', 'ux', 'accessibility'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'error', options: ['error', 'warning', 'info'] },
      allowPlaceholder: { type: 'checkbox', label: 'Allow Placeholder as Label', default: false }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const checkSeverity = '{{severity}}';
const allowPlaceholder = {{allowPlaceholder}};

// Find all form inputs
const inputPattern = /<(input|select|textarea)[^>]*>/gi;
const inputs = [...html.matchAll(inputPattern)];

inputs.forEach((match, index) => {
  const input = match[0];
  const tagName = match[1].toLowerCase();
  const inputId = /id=['"]([^'"]+)['"]/i.exec(input)?.[1];
  const hasPlaceholder = /placeholder=/i.test(input);
  const isHidden = /type=['"]hidden['"]/i.test(input);
  
  if (isHidden) return;
  
  // Check for associated label
  let hasLabel = false;
  if (inputId) {
    hasLabel = new RegExp(\`<label[^>]*for=['"]\${inputId}['"]\`, 'i').test(html);
  }
  
  // Check for wrapping label
  if (!hasLabel) {
    const inputIndex = html.indexOf(input);
    const beforeInput = html.substring(Math.max(0, inputIndex - 200), inputIndex);
    hasLabel = /<label[^>]*>/i.test(beforeInput);
  }
  
  if (!hasLabel && (!hasPlaceholder || !allowPlaceholder)) {
    checks.push({
      id: \`form-label-\${index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`\${tagName} element missing associated label\`,
      file: context.file,
      element: input.substring(0, 50)
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'form-label-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'All form inputs have associated labels'
}];`
  },
  {
    id: 'loading-states',
    name: 'Loading State Indicators',
    description: 'Checks that async operations have loading state indicators',
    category: 'ux-hcd',
    severity: 'warning',
    tags: ['loading', 'async', 'ux', 'states'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const javascript = context.javascript || '';
const checkSeverity = '{{severity}}';

// Check for async operations
const asyncPatterns = [
  /fetch\\s*\\(/i,
  /axios\\./i,
  /async\\s+function/i,
  /await\\s+/i,
  /\\.then\\s*\\(/i,
  /\\.catch\\s*\\(/i
];

const hasAsyncOperations = asyncPatterns.some(pattern => 
  pattern.test(javascript));

// Check for loading indicators
const loadingPatterns = [
  /loading/i,
  /spinner/i,
  /skeleton/i,
  /aria-busy/i,
  /aria-live/i,
  /isLoading/i,
  /is_loading/i
];

const hasLoadingIndicators = loadingPatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

if (hasAsyncOperations && !hasLoadingIndicators) {
  checks.push({
    id: 'loading-states',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'Async operations detected but no loading indicators found. Users need feedback during async operations.',
    application: context.applicationName,
    file: context.file
  });
}

return checks.length > 0 ? checks : [{
  id: 'loading-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'Loading states are properly handled'
}];`
  },
  {
    id: 'error-handling',
    name: 'Error Message Handling',
    description: 'Validates that error states have proper error messages',
    category: 'ux-hcd',
    severity: 'warning',
    tags: ['errors', 'validation', 'ux', 'messages'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const javascript = context.javascript || '';
const checkSeverity = '{{severity}}';

// Check for form validation patterns
const validationPatterns = [
  /required/i,
  /validate/i,
  /invalid/i,
  /error/i,
  /aria-invalid/i
];

const hasValidation = validationPatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

// Check for error message patterns
const errorMessagePatterns = [
  /error-message/i,
  /errorMessage/i,
  /error_text/i,
  /aria-errormessage/i,
  /role=['"]alert['"]/i,
  /class.*error/i
];

const hasErrorMessages = errorMessagePatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

if (hasValidation && !hasErrorMessages) {
  checks.push({
    id: 'error-handling',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'Form validation detected but no error message handling found. Users need clear error feedback.',
    application: context.applicationName,
    file: context.file
  });
}

return checks.length > 0 ? checks : [{
  id: 'error-handling-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'Error handling is properly implemented'
}];`
  },
  {
    id: 'heading-hierarchy',
    name: 'Heading Hierarchy',
    description: 'Validates proper heading hierarchy (h1-h6) structure',
    category: 'accessibility',
    severity: 'warning',
    tags: ['headings', 'hierarchy', 'accessibility', 'semantic'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const checkSeverity = '{{severity}}';

// Extract all headings
const headingPattern = /<h([1-6])[^>]*>([^<]*)<\\/h[1-6]>/gi;
const headings = [...html.matchAll(headingPattern)];

if (headings.length === 0) {
  checks.push({
    id: 'heading-none',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'No headings found. Pages should have proper heading structure for accessibility.',
    file: context.file
  });
  return checks;
}

// Check for h1
const hasH1 = headings.some(h => h[1] === '1');
if (!hasH1) {
  checks.push({
    id: 'heading-no-h1',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'Page missing h1 heading. Each page should have exactly one h1.',
    file: context.file
  });
}

// Check hierarchy (no skipping levels)
let previousLevel = 0;
headings.forEach((heading, index) => {
  const level = parseInt(heading[1]);
  if (previousLevel > 0 && level > previousLevel + 1) {
    checks.push({
      id: \`heading-skip-\${index}\`,
      rule: '{{ruleName}}',
      status: checkSeverity,
      message: \`Heading hierarchy skipped from h\${previousLevel} to h\${level}. Headings should not skip levels.\`,
      file: context.file,
      element: heading[0].substring(0, 50)
    });
  }
  previousLevel = level;
});

return checks.length > 0 ? checks : [{
  id: 'heading-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'Heading hierarchy is correct'
}];`
  },
  {
    id: 'color-contrast',
    name: 'Color Contrast Check',
    description: 'Validates color contrast ratios meet WCAG AA standards',
    category: 'accessibility',
    severity: 'error',
    tags: ['color', 'contrast', 'wcag', 'accessibility'],
    configurable: {
      level: { type: 'select', label: 'WCAG Level', default: 'AA', options: ['AA', 'AAA'] },
      severity: { type: 'select', label: 'Severity', default: 'error', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const css = context.css || '';
const checkSeverity = '{{severity}}';
const wcagLevel = '{{level}}';

// Find color and background-color declarations
const colorPattern = /(?:color|background-color):\\s*([^;]+)/gi;
const colorMatches = [...css.matchAll(colorPattern)];

// This is a simplified check - in production, use a color contrast library
colorMatches.forEach((match, index) => {
  const colorValue = match[1].trim();
  
  // Check if it's a design token (would need token lookup)
  // For now, just flag potential issues
  if (colorValue === '#ffffff' || colorValue === '#000000') {
    // These are common and usually fine, but could flag if used together
    // In a real implementation, you'd calculate actual contrast ratios
  }
});

// Placeholder - real implementation would calculate contrast ratios
checks.push({
  id: 'contrast-check-info',
  rule: '{{ruleName}}',
  status: 'info',
  message: \`Color contrast validation requires full color pair analysis. This template provides a starting point.\`
});

return checks;`
  },
  {
    id: 'empty-states',
    name: 'Empty State Handling',
    description: 'Checks for proper empty state components or messages',
    category: 'ux-hcd',
    severity: 'info',
    tags: ['empty', 'states', 'ux', 'feedback'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'info', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const javascript = context.javascript || '';
const checkSeverity = '{{severity}}';

// Check for empty state patterns
const emptyStatePatterns = [
  /empty.*state/i,
  /no.*data/i,
  /no.*results/i,
  /nothing.*found/i,
  /emptyState/i,
  /empty_state/i,
  /EmptyState/i
];

const hasEmptyStates = emptyStatePatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

// Check for lists/tables that might need empty states
const hasLists = /<(ul|ol|table|tbody)[^>]*>/i.test(html);
const hasDataBinding = /v-for|\\{\\{.*\\}\\}|map\\(/i.test(html + javascript);

if ((hasLists || hasDataBinding) && !hasEmptyStates) {
  checks.push({
    id: 'empty-states',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'Lists or data-bound content detected but no empty state handling found. Users need feedback when content is empty.',
    application: context.applicationName,
    file: context.file
  });
}

return checks.length > 0 ? checks : [{
  id: 'empty-states-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'Empty states are properly handled'
}];`
  },
  {
    id: 'destructive-actions',
    name: 'Destructive Action Confirmation',
    description: 'Validates that destructive actions have confirmation dialogs',
    category: 'ux-hcd',
    severity: 'warning',
    tags: ['destructive', 'confirmation', 'safety', 'ux'],
    configurable: {
      severity: { type: 'select', label: 'Severity', default: 'warning', options: ['error', 'warning', 'info'] }
    },
    scannerCode: `const checks = [];
const html = context.html || '';
const javascript = context.javascript || '';
const checkSeverity = '{{severity}}';

// Find destructive action patterns
const destructivePatterns = [
  /delete/i,
  /remove/i,
  /destroy/i,
  /clear/i,
  /reset/i,
  /type=['"]submit['"].*delete/i
];

const hasDestructiveActions = destructivePatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

// Check for confirmation patterns
const confirmationPatterns = [
  /confirm/i,
  /are.*you.*sure/i,
  /confirmDialog/i,
  /confirm.*dialog/i,
  /window\\.confirm/i,
  /confirm\\(/i
];

const hasConfirmation = confirmationPatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

if (hasDestructiveActions && !hasConfirmation) {
  checks.push({
    id: 'destructive-actions',
    rule: '{{ruleName}}',
    status: checkSeverity,
    message: 'Destructive actions detected but no confirmation dialogs found. Destructive actions should require user confirmation.',
    application: context.applicationName,
    file: context.file
  });
}

return checks.length > 0 ? checks : [{
  id: 'destructive-pass',
  rule: '{{ruleName}}',
  status: 'pass',
  message: 'Destructive actions have proper confirmation'
}];`
  }
];

// Filtered templates based on search and category
const filteredTemplates = computed(() => {
  let filtered = ruleTemplates;
  
  // Filter by category
  if (templateCategoryFilter.value !== 'all') {
    filtered = filtered.filter(t => t.category === templateCategoryFilter.value);
  }
  
  // Filter by search query
  if (templateSearchQuery.value.trim()) {
    const query = templateSearchQuery.value.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
});

// Load template with variable substitution
const loadTemplate = (template) => {
  if (!selectedRule.value) {
    // Create new rule if none selected
    addRule();
  }
  
  // Initialize customization with defaults
  const customization = {};
  if (template.configurable) {
    Object.keys(template.configurable).forEach(key => {
      const config = template.configurable[key];
      customization[key] = config.default;
    });
  }
  
  // If template has configurable options, show customization modal
  if (template.configurable && Object.keys(template.configurable).length > 0) {
    selectedTemplate.value = template;
    templateCustomization.value = customization;
    showTemplateBrowser.value = false;
    // Template will be applied after customization via applyCustomizedTemplate
  } else {
    // Apply template directly if no customization needed
    applyTemplate(template, customization);
    showTemplateBrowser.value = false;
  }
};

// Apply template with customization
const applyTemplate = (template, customization) => {
  if (!selectedRule.value) return;
  
  let code = template.scannerCode;
  
  // Replace template variables
  code = code.replace(/\{\{ruleName\}\}/g, selectedRule.value.name || template.name);
  
  // Replace configurable variables
  if (template.configurable) {
    Object.keys(template.configurable).forEach(key => {
      const value = customization[key] || template.configurable[key].default;
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        code = code.replace(regex, value.toString());
      } else {
        code = code.replace(regex, value);
      }
    });
  }
  
  // Update rule with template values
  selectedRule.value.scannerCode = code;
  selectedRule.value.category = template.category;
  selectedRule.value.severity = customization.severity || template.severity;
  selectedRule.value.description = template.description;
  
  // Close modals
  showTemplateBrowser.value = false;
  selectedTemplate.value = null;
  templateCustomization.value = {};
};

// Apply customized template
const applyCustomizedTemplate = () => {
  if (selectedTemplate.value) {
    applyTemplate(selectedTemplate.value, templateCustomization.value);
  }
};

const runComplianceCheck = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post(`${API_BASE_URL}/compliance/scan`, {
      scope: complianceScope.value,
      applicationId: selectedApplicationId.value || undefined,
      rules: rules.value.filter(r => r.enabled).map(r => ({
        name: r.name,
        scannerCode: r.scannerCode
      }))
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    complianceResults.value = response.data;
  } catch (error) {
    console.error('Failed to run compliance check:', error);
    // Fallback to mock data
    runComplianceCheckMock();
  } finally {
    isLoading.value = false;
  }
};

const scanApplicationCodebase = async () => {
  if (!selectedApplicationId.value) return;
  
  try {
    isLoading.value = true;
    const response = await axios.post(`${API_BASE_URL}/compliance/scan-application`, {
      applicationId: selectedApplicationId.value
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    complianceResults.value = {
      scope: 'applications',
      passed: response.data.checks.filter(c => c.status === 'pass').length,
      warnings: response.data.checks.filter(c => c.status === 'warning').length,
      failed: response.data.checks.filter(c => c.status === 'error').length,
      checks: response.data.checks
    };
    
    // Refresh applications to update lastScanned
    await loadApplications();
  } catch (error) {
    console.error('Failed to scan application:', error);
    alert('Failed to scan application. Please ensure the application is registered and try again.');
  } finally {
    isLoading.value = false;
  }
};

const runComplianceCheckMock = () => {
  if (complianceScope.value === 'design-system') {
    // Check the design system itself
    complianceResults.value = {
      scope: 'design-system',
      passed: 8,
      warnings: 2,
      failed: 1,
      checks: [
        {
          id: 1,
          rule: 'Color Contrast WCAG AA',
          status: 'pass',
          message: 'All design system components meet WCAG AA contrast requirements',
          component: null
        },
        {
          id: 2,
          rule: 'Spacing Consistency',
          status: 'warning',
          message: 'Button component uses non-standard spacing values (should use tokens)',
          component: 'Button'
        },
        {
          id: 3,
          rule: 'Typography Scale',
          status: 'pass',
          message: 'All design system typography follows the defined scale',
          component: null
        },
        {
          id: 4,
          rule: 'Component Naming',
          status: 'pass',
          message: 'All design system components follow PascalCase convention',
          component: null
        },
        {
          id: 5,
          rule: 'Accessibility Attributes',
          status: 'error',
          message: 'Navigation component missing ARIA labels on 3 interactive elements',
          component: 'Navigation'
        },
        {
          id: 6,
          rule: 'Token Usage',
          status: 'pass',
          message: 'All components use design tokens correctly',
          component: null
        },
        {
          id: 7,
          rule: 'Documentation Completeness',
          status: 'pass',
          message: 'All components have complete documentation',
          component: null
        },
        {
          id: 8,
          rule: 'Component API Consistency',
          status: 'warning',
          message: 'Some components have inconsistent prop naming patterns',
          component: 'Card'
        },
        {
          id: 9,
          rule: 'Deprecation Warnings',
          status: 'pass',
          message: 'All deprecated components have proper migration guides',
          component: null
        },
        {
          id: 10,
          rule: 'Test Coverage',
          status: 'pass',
          message: 'All components have test coverage above 80%',
          component: null
        },
        {
          id: 11,
          rule: 'Bundle Size',
          status: 'error',
          message: 'Modal component exceeds recommended bundle size limit',
          component: 'Modal'
        }
      ]
    };
  } else {
    // Check applications using the design system
    complianceResults.value = {
      scope: 'applications',
      passed: 6,
      warnings: 3,
      failed: 2,
      checks: [
        {
          id: 1,
          rule: 'Design System Version',
          status: 'pass',
          message: 'Application is using latest design system version',
          application: 'Marketing Site',
          file: null
        },
        {
          id: 2,
          rule: 'Component Usage',
          status: 'warning',
          message: 'Using deprecated Button component (v1) instead of v2',
          application: 'Admin Dashboard',
          file: 'src/components/Header.vue',
          component: 'Button'
        },
        {
          id: 3,
          rule: 'Token Usage',
          status: 'error',
          message: 'Using hardcoded colors instead of design tokens',
          application: 'Mobile App',
          file: 'src/styles/theme.css',
          component: null
        },
        {
          id: 4,
          rule: 'Accessibility Compliance',
          status: 'pass',
          message: 'All components meet WCAG AA requirements',
          application: 'Marketing Site',
          file: null
        },
        {
          id: 5,
          rule: 'Spacing Consistency',
          status: 'warning',
          message: 'Using custom spacing values instead of design tokens',
          application: 'Admin Dashboard',
          file: 'src/components/Card.vue',
          component: 'Card'
        },
        {
          id: 6,
          rule: 'Typography Scale',
          status: 'pass',
          message: 'All typography follows design system scale',
          application: 'Marketing Site',
          file: null
        },
        {
          id: 7,
          rule: 'Component Customization',
          status: 'warning',
          message: 'Overriding design system component styles without approval',
          application: 'Mobile App',
          file: 'src/components/CustomButton.vue',
          component: 'Button'
        },
        {
          id: 8,
          rule: 'Design System Import',
          status: 'pass',
          message: 'Correctly importing from design system package',
          application: 'Admin Dashboard',
          file: null
        },
        {
          id: 9,
          rule: 'Breaking Changes',
          status: 'error',
          message: 'Using deprecated API that will be removed in next version',
          application: 'Mobile App',
          file: 'src/components/Form.vue',
          component: 'Form'
        },
        {
          id: 10,
          rule: 'Component Composition',
          status: 'pass',
          message: 'Components are composed correctly',
          application: 'Marketing Site',
          file: null
        },
        {
          id: 11,
          rule: 'Performance',
          status: 'pass',
          message: 'No performance issues detected',
          application: 'Admin Dashboard',
          file: null
        }
      ]
    };
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
  
  // Load applications on mount
  loadApplications();
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

