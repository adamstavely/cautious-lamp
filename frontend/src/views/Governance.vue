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
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <defs>
                      <linearGradient id="governanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect x="60" y="40" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.6"/>
                    <rect x="60" y="60" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.5"/>
                    <rect x="60" y="80" width="80" height="12" rx="2" fill="url(#governanceGradient)" opacity="0.4"/>
                    <path d="M 50 130 L 70 150 L 110 110" fill="none" stroke="url(#governanceGradient)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                    <path d="M 130 100 L 150 110 L 150 140 Q 150 160, 130 170 Q 110 160, 110 140 L 110 110 Z" fill="url(#governanceGradient)" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto mb-6">
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Rules -->
          <div class="lg:col-span-1 space-y-6">
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <div class="flex items-center justify-between mb-4 gap-2">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="headingClass">
                  <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">rule</span>
                  Rules
                </h3>
                <Dropdown
                  :model-value="ruleFilter"
                  @update:model-value="ruleFilter = $event"
                  :options="[{ value: 'all', label: 'All rules' }, ...CATEGORY_OPTIONS]"
                  :is-dark-mode="isDarkMode"
                  label="Filter rules by category"
                />
              </div>

              <div v-if="rulesLoading" class="text-sm py-6 text-center" :class="mutedClass">Loading rules…</div>
              <div v-else-if="rulesError" class="text-sm py-6 text-center" :class="mutedClass">
                Rules could not be loaded.
                <button type="button" class="underline ml-1" @click="loadRules">Retry</button>
              </div>
              <div v-else-if="filteredRules.length === 0" class="text-sm py-6 text-center" :class="mutedClass">No rules in this category.</div>
              <ul v-else class="space-y-3">
                <li
                  v-for="rule in filteredRules"
                  :key="rule.id"
                  class="flex items-start gap-3 p-3 rounded-lg transition-colors"
                  :class="editingRule?.id === rule.id
                    ? (isDarkMode ? 'bg-indigo-800 border-2 border-indigo-600' : 'bg-indigo-100 border-2 border-indigo-500')
                    : rule.enabled
                    ? (isDarkMode ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200')
                    : (isDarkMode ? 'bg-slate-800 border border-gray-700' : 'bg-gray-50 border border-gray-200')"
                >
                  <input
                    type="checkbox"
                    :checked="rule.enabled"
                    :disabled="!canAdmin || togglingId === rule.id"
                    :aria-label="`${rule.enabled ? 'Disable' : 'Enable'} ${rule.name}`"
                    class="mt-1 accent-indigo-600"
                    @change="toggleRule(rule, $event.target.checked)"
                  />
                  <button type="button" class="flex-1 text-left" @click="selectRule(rule)">
                    <span class="block text-sm font-medium" :class="headingClass">{{ rule.name }}</span>
                    <span class="block text-xs mt-1" :class="mutedClass">{{ rule.description }}</span>
                    <span class="mt-2 flex flex-wrap items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded" :class="severityBadge(rule.severity)">{{ rule.severity }}</span>
                      <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'">
                        {{ categoryLabel(rule.category) }}
                      </span>
                      <span class="text-xs" :class="mutedClass">{{ typeLabel(rule.type) }} · v{{ rule.version }}</span>
                    </span>
                  </button>
                </li>
              </ul>

              <div v-if="canAdmin" class="mt-4 space-y-2">
                <button
                  type="button"
                  class="w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium"
                  :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'"
                  @click="newRule"
                >
                  + Add Rule
                </button>
                <div class="flex gap-2">
                  <label
                    class="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
                    :class="secondaryButton"
                  >
                    Import
                    <input type="file" accept="application/json,.json" class="sr-only" @change="importRules" />
                  </label>
                  <button type="button" class="flex-1 px-3 py-2 rounded-lg text-sm font-medium" :class="secondaryButton" @click="exportRules">
                    Export
                  </button>
                </div>
              </div>
              <button
                v-else
                type="button"
                class="w-full mt-4 px-3 py-2 rounded-lg text-sm font-medium"
                :class="secondaryButton"
                @click="exportRules"
              >
                Export rules
              </button>
            </div>
          </div>

          <!-- Right Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Compliance Checker -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="headingClass">
                    <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">verified</span>
                    Compliance Checker
                  </h3>
                  <fieldset class="flex items-center gap-4">
                    <legend class="sr-only">What to check</legend>
                    <label class="flex items-center gap-2 text-sm cursor-pointer" :class="labelClass">
                      <input v-model="scope" type="radio" value="design-system" class="accent-indigo-600" />
                      Design System
                    </label>
                    <label class="flex items-center gap-2 text-sm cursor-pointer" :class="labelClass">
                      <input v-model="scope" type="radio" value="application" class="accent-indigo-600" :disabled="!canAdmin" />
                      Application
                    </label>
                  </fieldset>
                </div>
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="scanning || !canRunScan"
                  @click="runScan"
                >
                  <span class="material-symbols-outlined text-base" aria-hidden="true">play_arrow</span>
                  {{ scanning ? 'Scanning…' : 'Run Check' }}
                </button>
              </div>

              <p v-if="scope === 'design-system'" class="mb-4 p-3 rounded-lg text-sm" :class="isDarkMode ? 'bg-blue-900/20 border border-blue-700 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'">
                Runs the enabled rules over every design system component's template, styles and scripts.
              </p>

              <div v-else class="mb-4 space-y-4">
                <p class="p-3 rounded-lg text-sm" :class="isDarkMode ? 'bg-purple-900/20 border border-purple-700 text-purple-300' : 'bg-purple-50 border border-purple-200 text-purple-700'">
                  Paste the application's HTML, CSS and JavaScript, or give a public URL: the server fetches that page and checks its HTML and inline styles and scripts (scripts are read, never run).
                </p>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label for="gov-app" class="block text-sm mb-2" :class="labelClass">Application</label>
                    <select id="gov-app" v-model="selectedApplicationId" class="w-full px-4 py-2 border rounded-lg" :class="inputClass">
                      <option value="" disabled>{{ applications.length ? 'Select an application' : 'No applications registered' }}</option>
                      <option v-for="app in applications" :key="app.id" :value="app.id">{{ app.name }}</option>
                    </select>
                    <p class="text-xs mt-1" :class="mutedClass">
                      <router-link to="/admin/applications/register" class="underline">Register an application</router-link>
                      <span v-if="selectedApplication?.lastScanned"> · Last scanned {{ formatDate(selectedApplication.lastScanned) }}</span>
                    </p>
                  </div>
                  <fieldset>
                    <legend class="block text-sm mb-2" :class="labelClass">Scan</legend>
                    <div class="flex items-center gap-4 pt-2">
                      <label class="flex items-center gap-2 text-sm" :class="labelClass">
                        <input v-model="source" type="radio" value="code" class="accent-indigo-600" /> Pasted code
                      </label>
                      <label class="flex items-center gap-2 text-sm" :class="labelClass">
                        <input v-model="source" type="radio" value="url" class="accent-indigo-600" /> Public URL
                      </label>
                    </div>
                  </fieldset>
                </div>
                <div v-if="source === 'url'">
                  <label for="gov-url" class="block text-sm mb-2" :class="labelClass">Page URL</label>
                  <input id="gov-url" v-model.trim="scanUrl" type="url" placeholder="https://app.example.com" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" />
                </div>
                <div v-else class="grid gap-3">
                  <div v-for="field in CODE_FIELDS" :key="field.key">
                    <label :for="`gov-code-${field.key}`" class="block text-sm mb-1" :class="labelClass">{{ field.label }}</label>
                    <textarea
                      :id="`gov-code-${field.key}`"
                      v-model="codebase[field.key]"
                      rows="4"
                      spellcheck="false"
                      class="w-full px-4 py-2 border rounded-lg font-mono text-xs"
                      :class="inputClass"
                    ></textarea>
                  </div>
                  <p class="text-xs" :class="mutedClass">Up to 256 KB per field and 512 KB in total (the server's request size limit may be lower).</p>
                </div>
              </div>

              <div v-if="scanResult" class="space-y-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div v-for="tile in summaryTiles" :key="tile.label" class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-2xl font-bold mb-1" :class="tile.class">{{ tile.value }}</div>
                    <div class="text-xs" :class="mutedClass">{{ tile.label }}</div>
                  </div>
                </div>
                <p class="text-xs" :class="mutedClass">
                  {{ scanResult.scope === 'design-system' ? 'Design system' : scanResult.applicationName }}
                  · {{ formatDate(scanResult.createdAt) }}
                  <span v-if="scanResult.url"> · {{ scanResult.url }}</span>
                  <span v-if="skippedRules.length"> · {{ skippedRules.length }} rule(s) skipped: {{ skippedRules.map((r) => `${r.name} (${r.reason})`).join('; ') }}</span>
                  <span v-if="incompleteRules.length"> · {{ incompleteRules.length }} rule(s) not fully checked (not a pass): {{ incompleteRules.map((r) => `${r.name} (${r.reason})`).join('; ') }}</span>
                  <span v-if="scanResult.truncated"> · Only the first {{ scanResult.checks.length }} results were kept.</span>
                </p>
                <ul class="space-y-2 max-h-96 overflow-y-auto">
                  <li v-for="check in scanResult.checks" :key="check.id" class="p-4 rounded-lg border" :class="statusCard(check.status)">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="material-symbols-outlined text-sm" :class="statusIconClass(check.status)" aria-hidden="true">{{ statusIcon(check.status) }}</span>
                      <span class="text-sm font-medium" :class="headingClass">{{ check.rule }}</span>
                      <span class="sr-only">({{ check.status }})</span>
                    </div>
                    <div class="text-xs mt-1" :class="mutedClass">{{ check.message }}</div>
                    <div v-if="check.component" class="text-xs mt-2 font-mono" :class="mutedClass">Component: {{ check.component }}</div>
                    <div v-if="check.file || check.line" class="text-xs mt-1 font-mono opacity-75" :class="mutedClass">
                      {{ check.file || 'Line' }}{{ check.line ? `:${check.line}` : '' }}
                    </div>
                    <pre v-if="check.element" class="text-xs mt-2 p-2 rounded overflow-x-auto" :class="isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-white text-gray-700'"><code>{{ check.element }}</code></pre>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Rule editor -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="headingClass">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">tune</span>
                {{ editingRule ? (editingRule.id ? 'Rule' : 'New rule') : 'Rule Configuration' }}
                <span v-if="editingRule?.builtIn" class="text-xs font-normal px-2 py-0.5 rounded" :class="isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'">built-in</span>
              </h3>

              <form v-if="editingRule" class="space-y-4" @submit.prevent="saveRule">
                <fieldset :disabled="!canAdmin || saving" class="space-y-4">
                  <p v-if="!canAdmin" class="text-xs" :class="mutedClass">You can view rules; changing them needs the admin:governance permission.</p>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label for="rule-name" class="block text-sm mb-2" :class="labelClass">Name</label>
                      <input id="rule-name" v-model="editingRule.name" type="text" required maxlength="120" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" />
                    </div>
                    <div class="flex items-end gap-2 pb-2">
                      <input id="rule-enabled" v-model="editingRule.enabled" type="checkbox" class="accent-indigo-600" />
                      <label for="rule-enabled" class="text-sm" :class="labelClass">Enabled</label>
                    </div>
                  </div>
                  <div>
                    <label for="rule-description" class="block text-sm mb-2" :class="labelClass">Description</label>
                    <textarea id="rule-description" v-model="editingRule.description" rows="2" maxlength="1000" class="w-full px-4 py-2 border rounded-lg" :class="inputClass"></textarea>
                  </div>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label for="rule-category" class="block text-sm mb-2" :class="labelClass">Category</label>
                      <select id="rule-category" v-model="editingRule.category" class="w-full px-4 py-2 border rounded-lg" :class="inputClass">
                        <option v-for="option in CATEGORY_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                    </div>
                    <div>
                      <label for="rule-severity" class="block text-sm mb-2" :class="labelClass">Severity</label>
                      <select id="rule-severity" v-model="editingRule.severity" class="w-full px-4 py-2 border rounded-lg" :class="inputClass">
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                    <div>
                      <label for="rule-type" class="block text-sm mb-2" :class="labelClass">Check</label>
                      <select id="rule-type" v-model="editingRule.type" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" @change="onTypeChange">
                        <option v-for="option in TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                    </div>
                    <div>
                      <label for="rule-target" class="block text-sm mb-2" :class="labelClass">Applies to</label>
                      <select id="rule-target" v-model="editingRule.target" class="w-full px-4 py-2 border rounded-lg" :class="inputClass">
                        <option v-for="target in TARGETS_BY_TYPE[editingRule.type]" :key="target" :value="target">{{ TARGET_LABELS[target] }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Type-specific fields -->
                  <div v-if="usesSelector">
                    <label for="rule-selector" class="block text-sm mb-2" :class="labelClass">CSS selector</label>
                    <input id="rule-selector" v-model="editingRule.selector" type="text" required maxlength="300" placeholder='img:not([role="presentation"])' class="w-full px-4 py-2 border rounded-lg font-mono text-sm" :class="inputClass" />
                  </div>
                  <div v-if="editingRule.type === 'selector-attribute'">
                    <label for="rule-attribute" class="block text-sm mb-2" :class="labelClass">Required attribute (separate alternatives with |)</label>
                    <input id="rule-attribute" v-model="editingRule.attribute" type="text" required placeholder="alt or aria-label|aria-labelledby" class="w-full px-4 py-2 border rounded-lg font-mono text-sm" :class="inputClass" />
                  </div>
                  <div v-if="editingRule.type === 'selector-count'" class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="rule-min" class="block text-sm mb-2" :class="labelClass">At least</label>
                      <input id="rule-min" v-model="editingRule.min" type="number" min="0" max="10000" step="1" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" />
                    </div>
                    <div>
                      <label for="rule-max" class="block text-sm mb-2" :class="labelClass">At most</label>
                      <input id="rule-max" v-model="editingRule.max" type="number" min="0" max="10000" step="1" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" />
                    </div>
                  </div>
                  <div v-if="usesPattern">
                    <label for="rule-pattern" class="block text-sm mb-2" :class="labelClass">
                      {{ editingRule.type === 'selector-attribute' ? 'Attribute value must match (optional regular expression)' : 'Regular expression' }}
                    </label>
                    <input id="rule-pattern" v-model="editingRule.pattern" type="text" maxlength="300" :required="editingRule.type !== 'selector-attribute'" class="w-full px-4 py-2 border rounded-lg font-mono text-sm" :class="inputClass" />
                    <div class="flex items-center gap-4 mt-2 text-sm" :class="labelClass">
                      <label v-for="flag in FLAGS" :key="flag.value" class="flex items-center gap-1">
                        <input v-model="editingRule.flagList" type="checkbox" :value="flag.value" class="accent-indigo-600" /> {{ flag.label }}
                      </label>
                    </div>
                    <p class="text-xs mt-1" :class="mutedClass">Up to 300 characters. Backreferences, lookbehind and repeated groups that contain quantifiers or alternatives are refused; each match has a time limit.</p>
                  </div>
                  <template v-if="editingRule.type === 'token-usage'">
                    <div>
                      <label for="rule-properties" class="block text-sm mb-2" :class="labelClass">CSS properties (comma-separated; a trailing * matches a prefix)</label>
                      <input id="rule-properties" v-model="editingRule.propertiesText" type="text" required placeholder="color, background-color, margin*" class="w-full px-4 py-2 border rounded-lg font-mono text-sm" :class="inputClass" />
                    </div>
                    <div>
                      <label for="rule-allowed" class="block text-sm mb-2" :class="labelClass">Also allowed (comma-separated)</label>
                      <input id="rule-allowed" v-model="editingRule.allowedValuesText" type="text" placeholder="4px, 8px, 16px" class="w-full px-4 py-2 border rounded-lg font-mono text-sm" :class="inputClass" />
                      <p class="text-xs mt-1" :class="mutedClass">var(--…), design token values and keywords such as inherit or transparent are always allowed.</p>
                    </div>
                  </template>
                  <div v-if="editingRule.type === 'builtin'">
                    <label for="rule-builtin" class="block text-sm mb-2" :class="labelClass">Built-in check</label>
                    <select id="rule-builtin" v-model="editingRule.builtin" class="w-full px-4 py-2 border rounded-lg" :class="inputClass">
                      <option v-for="option in BUILTIN_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label for="rule-message" class="block text-sm mb-2" :class="labelClass">Message for each violation</label>
                    <input id="rule-message" v-model="editingRule.message" type="text" required maxlength="500" class="w-full px-4 py-2 border rounded-lg" :class="inputClass" />
                  </div>
                </fieldset>

                <!-- Test against sample -->
                <details class="rounded-lg border p-4" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'" :open="!!testResult">
                  <summary class="text-sm font-medium cursor-pointer" :class="headingClass">Test against sample code</summary>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label for="test-sample" class="block text-sm mb-1" :class="labelClass">Sample {{ TARGET_LABELS[editingRule.target] }}</label>
                      <textarea id="test-sample" v-model="testSample[editingRule.target]" rows="5" spellcheck="false" class="w-full px-4 py-2 border rounded-lg font-mono text-xs" :class="inputClass"></textarea>
                    </div>
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded text-sm bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                      :disabled="!canAdmin || testing"
                      @click="testRule"
                    >
                      {{ testing ? 'Testing…' : 'Test' }}
                    </button>
                    <p v-if="!canAdmin" class="text-xs" :class="mutedClass">Testing rules needs admin:governance.</p>
                    <div v-if="testResult" class="space-y-2">
                      <p class="text-sm" :class="headingClass">
                        Result: <strong>{{ OUTCOME_LABELS[testResult.outcome] }}</strong>
                        <span v-if="testResult.reason" :class="mutedClass"> — {{ testResult.reason }}</span>
                      </p>
                      <ul class="space-y-1">
                        <li v-for="check in testResult.checks" :key="check.id" class="text-xs p-2 rounded border" :class="statusCard(check.status)">
                          {{ check.message }}<span v-if="check.line"> (line {{ check.line }})</span>
                          <code v-if="check.element" class="block mt-1 opacity-80">{{ check.element }}</code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </details>

                <div class="flex flex-wrap items-center gap-2">
                  <button v-if="canAdmin" type="submit" class="px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50" :disabled="saving">
                    {{ saving ? 'Saving…' : editingRule.id ? 'Save Rule' : 'Create Rule' }}
                  </button>
                  <button type="button" class="px-4 py-2 rounded-lg font-medium" :class="secondaryButton" @click="closeEditor">
                    {{ canAdmin ? 'Cancel' : 'Close' }}
                  </button>
                  <template v-if="canAdmin && editingRule.id">
                    <button
                      v-if="confirmDelete"
                      type="button"
                      class="ml-auto px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white"
                      @click="deleteRule"
                    >
                      Confirm delete
                    </button>
                    <button v-else type="button" class="ml-auto px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmDelete = true">
                      Delete
                    </button>
                  </template>
                </div>
              </form>
              <div v-else class="text-center py-8">
                <p class="text-sm" :class="mutedClass">Select a rule to see or change it{{ canAdmin ? ', or add a new one' : '' }}.</p>
              </div>
            </div>

            <!-- Scan history -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="headingClass">
                  <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">history</span>
                  Scan History
                  <span v-if="scope === 'application' && selectedApplication" class="text-sm font-normal" :class="mutedClass">· {{ selectedApplication.name }}</span>
                </h3>
                <button type="button" class="px-3 py-1 rounded text-sm font-medium" :class="secondaryButton" @click="loadHistory">Refresh</button>
              </div>
              <div v-if="historyLoading" class="text-sm text-center py-4" :class="mutedClass">Loading…</div>
              <div v-else-if="history.length === 0" class="text-sm text-center py-4" :class="mutedClass">No scans yet.</div>
              <ul v-else class="space-y-2">
                <li v-for="scan in history" :key="scan.id">
                  <button
                    type="button"
                    class="w-full text-left p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2"
                    :class="scanResult?.id === scan.id
                      ? (isDarkMode ? 'bg-indigo-900/20 border-indigo-600' : 'bg-indigo-50 border-indigo-500')
                      : (isDarkMode ? 'bg-slate-800 border-gray-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50')"
                    @click="openScan(scan.id)"
                  >
                    <span>
                      <span class="block text-sm font-medium" :class="headingClass">
                        {{ scan.scope === 'design-system' ? 'Design system' : scan.applicationName }}
                        <span class="text-xs font-normal" :class="mutedClass">· {{ SOURCE_LABELS[scan.source] }}</span>
                      </span>
                      <span class="block text-xs" :class="mutedClass">{{ formatDate(scan.createdAt) }} · {{ scan.createdBy?.name }} · {{ scan.rules.length }} rules</span>
                    </span>
                    <span class="flex items-center gap-3 text-xs">
                      <span class="text-green-600">{{ scan.summary.passed }} passed</span>
                      <span class="text-yellow-600">{{ scan.summary.warnings }} warnings</span>
                      <span class="text-red-600">{{ scan.summary.errors }} errors</span>
                      <span class="text-blue-600">{{ scan.summary.info }} info</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

// Rules are declarative (docs/GOVERNANCE.md): this page edits data and the
// server runs it. Nothing here evaluates code.

const CATEGORY_OPTIONS = [
  { value: 'design-system', label: 'Design System' },
  { value: 'ux-hcd', label: 'UX / HCD' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'custom', label: 'Custom' },
];
const TYPE_OPTIONS = [
  { value: 'regex-absent', label: 'Pattern must not appear' },
  { value: 'regex-present', label: 'Pattern must appear' },
  { value: 'selector-attribute', label: 'Elements need an attribute' },
  { value: 'selector-count', label: 'Number of elements' },
  { value: 'token-usage', label: 'CSS uses design tokens' },
  { value: 'builtin', label: 'Built-in check' },
];
const TARGETS_BY_TYPE = {
  'regex-present': ['html', 'css', 'javascript'],
  'regex-absent': ['html', 'css', 'javascript'],
  'selector-attribute': ['html'],
  'selector-count': ['html'],
  'token-usage': ['css'],
  builtin: ['html'],
};
const TARGET_LABELS = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' };
const BUILTIN_OPTIONS = [
  { value: 'axe', label: 'axe-core accessibility scan (WCAG A/AA)' },
  { value: 'form-labels', label: 'Form fields have labels' },
  { value: 'heading-order', label: 'Heading levels do not skip' },
  { value: 'component-naming', label: 'Component names are PascalCase (design system scans)' },
];
const FLAGS = [
  { value: 'i', label: 'Ignore case' },
  { value: 'm', label: 'Multiline' },
  { value: 's', label: 'Dot matches newline' },
];
const CODE_FIELDS = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'javascript', label: 'JavaScript' },
];
const OUTCOME_LABELS = { pass: 'Pass', fail: 'Violations found', skipped: 'Skipped', error: 'Could not run', incomplete: 'Not fully checked' };
const SOURCE_LABELS = { 'design-system': 'components', codebase: 'pasted code', url: 'URL' };

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const { hasPermission } = useAuth();
const canAdmin = computed(() => hasPermission('admin:governance'));

const rules = ref([]);
const rulesLoading = ref(false);
const rulesError = ref(false);
const ruleFilter = ref('all');
const togglingId = ref(null);

const applications = ref([]);
const scope = ref('design-system');
const selectedApplicationId = ref('');
const source = ref('code');
const scanUrl = ref('');
const codebase = ref({ html: '', css: '', javascript: '' });
const scanning = ref(false);
const scanResult = ref(null);

const editingRule = ref(null);
const saving = ref(false);
const confirmDelete = ref(false);
const testing = ref(false);
const testResult = ref(null);
const testSample = ref({ html: '', css: '', javascript: '' });

const history = ref([]);
const historyLoading = ref(false);

// ---------- Presentation helpers ----------
const cardClass = computed(() => (isDarkMode.value ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'));
const headingClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-gray-900'));
const mutedClass = computed(() => (isDarkMode.value ? 'text-gray-400' : 'text-gray-600'));
const labelClass = computed(() => (isDarkMode.value ? 'text-gray-300' : 'text-gray-700'));
const inputClass = computed(() =>
  isDarkMode.value
    ? 'border-gray-600 bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none'
    : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none',
);
const secondaryButton = computed(() => (isDarkMode.value ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'));

const categoryLabel = (value) => CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
const typeLabel = (value) => TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

const severityBadge = (severity) => {
  if (severity === 'error') return isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700';
  if (severity === 'warning') return isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
  return isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700';
};
const statusCard = (status) =>
  ({
    pass: isDarkMode.value ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
    warning: isDarkMode.value ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
    error: isDarkMode.value ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200',
    info: isDarkMode.value ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
  })[status];
const statusIcon = (status) => ({ pass: 'check_circle', warning: 'warning', error: 'error', info: 'info' })[status];
const statusIconClass = (status) => ({ pass: 'text-green-500', warning: 'text-yellow-500', error: 'text-red-500', info: 'text-blue-500' })[status];

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const filteredRules = computed(() => (ruleFilter.value === 'all' ? rules.value : rules.value.filter((r) => r.category === ruleFilter.value)));
const selectedApplication = computed(() => applications.value.find((a) => a.id === selectedApplicationId.value) ?? null);
const usesSelector = computed(() => ['selector-attribute', 'selector-count'].includes(editingRule.value?.type));
const usesPattern = computed(() => ['regex-present', 'regex-absent', 'selector-attribute'].includes(editingRule.value?.type));
const skippedRules = computed(() => (scanResult.value?.ruleResults ?? []).filter((r) => r.outcome === 'skipped'));
const incompleteRules = computed(() => (scanResult.value?.ruleResults ?? []).filter((r) => r.outcome === 'incomplete'));
const summaryTiles = computed(() => {
  const s = scanResult.value?.summary ?? {};
  return [
    { label: 'Passed', value: s.passed ?? 0, class: isDarkMode.value ? 'text-green-400' : 'text-green-600' },
    { label: 'Warnings', value: s.warnings ?? 0, class: isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600' },
    { label: 'Errors', value: s.errors ?? 0, class: isDarkMode.value ? 'text-red-400' : 'text-red-600' },
    { label: 'Info', value: s.info ?? 0, class: isDarkMode.value ? 'text-blue-400' : 'text-blue-600' },
  ];
});
const canRunScan = computed(() => {
  if (scope.value === 'design-system') return true;
  if (!canAdmin.value || !selectedApplicationId.value) return false;
  if (source.value === 'url') return !!scanUrl.value;
  return Object.values(codebase.value).some((v) => v.trim());
});

// ---------- Loading ----------
const loadRules = async () => {
  rulesLoading.value = true;
  rulesError.value = false;
  try {
    const { data } = await apiClient.get('/api/v1/governance/rules');
    rules.value = data.rules ?? [];
  } catch (error) {
    rulesError.value = true;
    showNotice(apiErrorMessage(error, 'Could not load the rules.'), 'error');
  } finally {
    rulesLoading.value = false;
  }
};

const loadApplications = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/applications');
    applications.value = data.applications ?? [];
  } catch (error) {
    applications.value = [];
    showNotice(apiErrorMessage(error, 'Could not load applications.'), 'error');
  }
};

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const params = { limit: 20 };
    if (scope.value === 'design-system') params.scope = 'design-system';
    else if (selectedApplicationId.value) params.applicationId = selectedApplicationId.value;
    else params.scope = 'application';
    const { data } = await apiClient.get('/api/v1/governance/scans', { params });
    history.value = data.scans ?? [];
  } catch (error) {
    history.value = [];
    showNotice(apiErrorMessage(error, 'Could not load scan history.'), 'error');
  } finally {
    historyLoading.value = false;
  }
};

const openScan = async (id) => {
  try {
    const { data } = await apiClient.get(`/api/v1/governance/scans/${encodeURIComponent(id)}`);
    scanResult.value = data;
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not load that scan.'), 'error');
  }
};

// ---------- Scans ----------
const runScan = async () => {
  scanning.value = true;
  try {
    const body = { scope: scope.value };
    if (scope.value === 'application') {
      body.applicationId = selectedApplicationId.value;
      if (source.value === 'url') body.url = scanUrl.value;
      else body.codebase = Object.fromEntries(Object.entries(codebase.value).filter(([, v]) => v.trim()));
    }
    const { data } = await apiClient.post('/api/v1/governance/scans', body);
    scanResult.value = data;
    showNotice(`Scan finished: ${data.summary.errors} errors, ${data.summary.warnings} warnings.`, 'success');
    await Promise.all([loadHistory(), scope.value === 'application' ? loadApplications() : null]);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The scan failed.'), 'error');
  } finally {
    scanning.value = false;
  }
};

// ---------- Rule editor ----------
const toForm = (rule) => ({
  ...rule,
  description: rule.description ?? '',
  pattern: rule.pattern ?? '',
  selector: rule.selector ?? '',
  attribute: rule.attribute ?? '',
  min: rule.min ?? '',
  max: rule.max ?? '',
  builtin: rule.builtin ?? 'axe',
  flagList: (rule.flags ?? '').split('').filter(Boolean),
  propertiesText: (rule.properties ?? []).join(', '),
  allowedValuesText: (rule.allowedValues ?? []).join(', '),
});

const splitList = (text) => String(text ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const toNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(value));

/** Only the fields the rule's type uses; the server rejects anything else */
const toPayload = (form) => {
  const payload = {
    name: form.name,
    description: form.description,
    category: form.category,
    severity: form.severity,
    enabled: !!form.enabled,
    type: form.type,
    target: form.target,
    message: form.message,
  };
  const flags = form.flagList.join('');
  if (['regex-present', 'regex-absent'].includes(form.type) || (form.type === 'selector-attribute' && form.pattern)) {
    payload.pattern = form.pattern;
    if (flags) payload.flags = flags;
  }
  if (form.type === 'selector-attribute' || form.type === 'selector-count') payload.selector = form.selector;
  if (form.type === 'selector-attribute') payload.attribute = form.attribute;
  if (form.type === 'selector-count') {
    if (toNumber(form.min) !== undefined) payload.min = toNumber(form.min);
    if (toNumber(form.max) !== undefined) payload.max = toNumber(form.max);
  }
  if (form.type === 'token-usage') {
    payload.properties = splitList(form.propertiesText);
    const allowed = splitList(form.allowedValuesText);
    if (allowed.length) payload.allowedValues = allowed;
  }
  if (form.type === 'builtin') payload.builtin = form.builtin;
  return payload;
};

const selectRule = (rule) => {
  editingRule.value = toForm(rule);
  confirmDelete.value = false;
  testResult.value = null;
};

const newRule = () => {
  editingRule.value = toForm({
    name: '',
    description: '',
    category: 'custom',
    severity: 'warning',
    enabled: true,
    type: 'regex-absent',
    target: 'html',
    message: '',
  });
  confirmDelete.value = false;
  testResult.value = null;
};

const onTypeChange = () => {
  const allowed = TARGETS_BY_TYPE[editingRule.value.type];
  if (!allowed.includes(editingRule.value.target)) editingRule.value.target = allowed[0];
};

const closeEditor = () => {
  editingRule.value = null;
  testResult.value = null;
  confirmDelete.value = false;
};

const upsertRule = (rule) => {
  const index = rules.value.findIndex((r) => r.id === rule.id);
  if (index === -1) rules.value.push(rule);
  else rules.value.splice(index, 1, rule);
};

const saveRule = async () => {
  saving.value = true;
  try {
    const form = editingRule.value;
    const payload = toPayload(form);
    const { data } = form.id
      ? await apiClient.put(`/api/v1/governance/rules/${encodeURIComponent(form.id)}`, { ...payload, version: form.version })
      : await apiClient.post('/api/v1/governance/rules', payload);
    upsertRule(data);
    editingRule.value = toForm(data);
    showNotice(`Saved "${data.name}" (version ${data.version}).`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not save the rule.'), 'error');
    if (error?.response?.status === 409) await loadRules();
  } finally {
    saving.value = false;
  }
};

const toggleRule = async (rule, enabled) => {
  togglingId.value = rule.id;
  try {
    const { data } = await apiClient.patch(`/api/v1/governance/rules/${encodeURIComponent(rule.id)}`, { enabled, version: rule.version });
    upsertRule(data);
    if (editingRule.value?.id === data.id) editingRule.value = toForm(data);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not change the rule.'), 'error');
    await loadRules();
  } finally {
    togglingId.value = null;
  }
};

const deleteRule = async () => {
  const rule = editingRule.value;
  try {
    await apiClient.delete(`/api/v1/governance/rules/${encodeURIComponent(rule.id)}`);
    rules.value = rules.value.filter((r) => r.id !== rule.id);
    closeEditor();
    showNotice(`Deleted "${rule.name}".`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not delete the rule.'), 'error');
  } finally {
    confirmDelete.value = false;
  }
};

const testRule = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const target = editingRule.value.target;
    const { data } = await apiClient.post('/api/v1/governance/rules/test', {
      rule: toPayload(editingRule.value),
      sample: { [target]: testSample.value[target] ?? '' },
    });
    testResult.value = data;
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The rule could not be tested.'), 'error');
  } finally {
    testing.value = false;
  }
};

// ---------- Import / export ----------
const exportRules = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/governance/rules/export');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `governance-rules-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not export the rules.'), 'error');
  }
};

const importRules = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    showNotice('That file is not valid JSON.', 'error');
    return;
  }
  const list = Array.isArray(parsed) ? parsed : parsed?.rules;
  if (!Array.isArray(list)) {
    showNotice('The file has no "rules" list.', 'error');
    return;
  }
  try {
    const { data } = await apiClient.post('/api/v1/governance/rules/import', { rules: list, mode: 'merge' });
    showNotice(`Imported: ${data.created} created, ${data.updated} updated.`, 'success');
    await loadRules();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The import failed; nothing was changed.'), 'error');
  }
};

watch(selectedApplicationId, (id) => {
  const app = applications.value.find((a) => a.id === id);
  if (app?.applicationUrl && !scanUrl.value) scanUrl.value = app.applicationUrl;
  loadHistory();
});
watch(scope, () => {
  scanResult.value = null;
  loadHistory();
});

onMounted(() => {
  loadRules();
  loadApplications();
  loadHistory();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
