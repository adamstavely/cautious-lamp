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
                  Deprecation & Migration Assistant
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Track deprecated components and migrate components and design tokens from old versions to new versions. Automated migration with step-by-step guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="activeTab = 'components'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'components'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Component Migration
              <div 
                v-if="activeTab === 'components'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'tokens'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'tokens'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Token Migration
              <div 
                v-if="activeTab === 'tokens'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'deprecation'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'deprecation'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Deprecation Manager
              <div 
                v-if="activeTab === 'deprecation'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
          </div>
        </div>

        <!-- Component Migration Tab -->
        <div v-if="activeTab === 'components'" class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Migration Setup -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Migration Setup -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">swap_horiz</span>
                Component Migration Setup
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Type
                  </label>
                  <select
                    v-model="componentMigration.type"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="single">Single Component</option>
                    <option value="batch">Batch Migration</option>
                    <option value="template">Migration Template</option>
                  </select>
                </div>
                <div v-if="componentMigration.type === 'single'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Component
                  </label>
                  <select
                    v-model="componentMigration.component"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="">Select component...</option>
                    <option value="button">Button</option>
                    <option value="card">Card</option>
                    <option value="modal">Modal</option>
                    <option value="input">Input</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div v-if="componentMigration.type === 'batch'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Components (comma-separated)
                  </label>
                  <input
                    v-model="componentMigration.components"
                    type="text"
                    placeholder="button, card, modal"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Version
                  </label>
                  <input
                    v-model="componentMigration.fromVersion"
                    type="text"
                    placeholder="2.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Version
                  </label>
                  <input
                    v-model="componentMigration.toVersion"
                    type="text"
                    placeholder="3.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="componentMigration.dryRun"
                    id="dry-run"
                    class="accent-indigo-600"
                  />
                  <label for="dry-run" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Dry Run (Preview Only)
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="componentMigration.generateCodemod"
                    id="codemod"
                    class="accent-indigo-600"
                  />
                  <label for="codemod" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Generate Codemod
                  </label>
                </div>
                <button
                  @click="analyzeComponentMigration"
                  :disabled="!canAnalyzeComponent"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="canAnalyzeComponent
                    ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Analyze Migration
                </button>
              </div>
            </div>

            <!-- Migration Templates -->
            <div 
              v-if="componentMigration.type === 'template'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">description</span>
                Templates
              </h3>
              <div class="space-y-2">
                <button
                  v-for="template in componentMigrationTemplates"
                  :key="template.id"
                  @click="loadComponentTemplate(template)"
                  class="w-full p-3 rounded-lg border text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                >
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ template.name }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ template.fromVersion }} → {{ template.toVersion }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Rollback -->
            <div 
              v-if="componentMigrationResults && !componentMigration.dryRun"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">undo</span>
                Rollback
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Revert the migration if needed
              </p>
              <button
                @click="rollbackComponentMigration"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Rollback Migration
              </button>
            </div>
          </div>

          <!-- Right Column: Migration Plan & Results -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Migration Progress -->
            <div 
              v-if="componentMigrationProgress.isRunning"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">progress_activity</span>
                Migration Progress
              </h3>
              <div class="space-y-3">
                <div class="w-full bg-gray-200 rounded-full h-2.5" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="`width: ${componentMigrationProgress.percentage}%`"
                  ></div>
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ componentMigrationProgress.currentStep }} / {{ componentMigrationProgress.totalSteps }} steps completed
                </div>
                <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ componentMigrationProgress.currentFile }}
                </div>
              </div>
            </div>

            <!-- Migration Plan -->
            <div 
              v-if="componentMigrationPlan"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">list</span>
                  Migration Plan
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    v-if="componentMigration.generateCodemod && componentCodemodScript"
                    @click="downloadComponentCodemod"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'"
                  >
                    Download Codemod
                  </button>
                  <button
                    @click="executeComponentMigration"
                    :disabled="componentMigration.dryRun || componentMigrationProgress.isRunning"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="!componentMigration.dryRun && !componentMigrationProgress.isRunning
                      ? (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Execute Migration
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(step, index) in componentMigrationPlan.steps"
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="step.type === 'breaking'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200')"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="step.type === 'breaking' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ step.title }}
                      </div>
                      <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ step.description }}
                      </div>
                      <div v-if="step.code" class="rounded-lg overflow-hidden mt-2" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                        <div class="p-3">
                          <div class="text-xs text-green-400 font-mono whitespace-pre-wrap" v-pre><code>{{ step.code }}</code></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Migration Results -->
            <div 
              v-if="componentMigrationResults"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">check_circle</span>
                Migration Results
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500">check_circle</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ componentMigrationResults.filesMigrated }} files migrated
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">info</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ componentMigrationResults.warnings }} warnings
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-yellow-500">warning</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ componentMigrationResults.manualSteps }} manual steps required
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Token Migration Tab -->
        <div v-if="activeTab === 'tokens'" class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Token Migration Setup -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Token Migration Setup -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">palette</span>
                Token Migration Setup
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Type
                  </label>
                  <select
                    v-model="tokenMigration.type"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="format">Format Conversion</option>
                    <option value="version">Version Migration</option>
                    <option value="rename">Token Rename</option>
                    <option value="merge">Merge Tokens</option>
                  </select>
                </div>
                <div v-if="tokenMigration.type === 'format'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Format
                  </label>
                  <select
                    v-model="tokenMigration.fromFormat"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="dtcg">DTCG JSON</option>
                    <option value="css">CSS Variables</option>
                    <option value="scss">SCSS Variables</option>
                    <option value="ios">iOS (Plist)</option>
                    <option value="android">Android (XML)</option>
                    <option value="style-dictionary">Style Dictionary</option>
                  </select>
                </div>
                <div v-if="tokenMigration.type === 'format'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Format
                  </label>
                  <select
                    v-model="tokenMigration.toFormat"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="dtcg">DTCG JSON</option>
                    <option value="css">CSS Variables</option>
                    <option value="scss">SCSS Variables</option>
                    <option value="ios">iOS (Plist)</option>
                    <option value="android">Android (XML)</option>
                    <option value="style-dictionary">Style Dictionary</option>
                  </select>
                </div>
                <div v-if="tokenMigration.type === 'version'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Version
                  </label>
                  <input
                    v-model="tokenMigration.fromVersion"
                    type="text"
                    placeholder="1.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'version'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Version
                  </label>
                  <input
                    v-model="tokenMigration.toVersion"
                    type="text"
                    placeholder="2.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'rename'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Old Token Name
                  </label>
                  <input
                    v-model="tokenMigration.oldName"
                    type="text"
                    placeholder="color.primary"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'rename'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    New Token Name
                  </label>
                  <input
                    v-model="tokenMigration.newName"
                    type="text"
                    placeholder="color.brand.primary"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Upload Token File
                  </label>
                  <input
                    type="file"
                    @change="handleTokenFileUpload"
                    accept=".json,.css,.scss,.plist,.xml"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="tokenMigration.dryRun"
                    id="token-dry-run"
                    class="accent-indigo-600"
                  />
                  <label for="token-dry-run" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Dry Run (Preview Only)
                  </label>
                </div>
                <button
                  @click="analyzeTokenMigration"
                  :disabled="!canAnalyzeToken"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="canAnalyzeToken
                    ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Analyze Migration
                </button>
              </div>
            </div>

            <!-- Rollback -->
            <div 
              v-if="tokenMigrationResults && !tokenMigration.dryRun"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">undo</span>
                Rollback
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Revert the migration if needed
              </p>
              <button
                @click="rollbackTokenMigration"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Rollback Migration
              </button>
            </div>
          </div>

          <!-- Right Column: Token Migration Plan & Results -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Migration Progress -->
            <div 
              v-if="tokenMigrationProgress.isRunning"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">progress_activity</span>
                Migration Progress
              </h3>
              <div class="space-y-3">
                <div class="w-full bg-gray-200 rounded-full h-2.5" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="`width: ${tokenMigrationProgress.percentage}%`"
                  ></div>
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ tokenMigrationProgress.currentStep }} / {{ tokenMigrationProgress.totalSteps }} steps completed
                </div>
                <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ tokenMigrationProgress.currentFile }}
                </div>
              </div>
            </div>

            <!-- Migration Plan -->
            <div 
              v-if="tokenMigrationPlan"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Token Migration Plan
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    v-if="tokenMigrationPlan.outputFile"
                    @click="downloadTokenOutput"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'"
                  >
                    Download Output
                  </button>
                  <button
                    @click="executeTokenMigration"
                    :disabled="tokenMigration.dryRun || tokenMigrationProgress.isRunning"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="!tokenMigration.dryRun && !tokenMigrationProgress.isRunning
                      ? (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Execute Migration
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(step, index) in tokenMigrationPlan.steps"
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="step.type === 'breaking'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200')"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="step.type === 'breaking' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ step.title }}
                      </div>
                      <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ step.description }}
                      </div>
                      <div v-if="step.code" class="rounded-lg overflow-hidden mt-2" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                        <div class="p-3">
                          <div class="text-xs text-green-400 font-mono whitespace-pre-wrap" v-pre><code>{{ step.code }}</code></div>
                        </div>
                      </div>
                      <div v-if="step.example" class="mt-2 p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                        <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Example:</div>
                        <div class="text-xs font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ step.example }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Migration Results -->
            <div 
              v-if="tokenMigrationResults"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Token Migration Results
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500">check_circle</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.tokensMigrated }} tokens migrated
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">info</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.filesProcessed }} files processed
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-yellow-500">warning</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.warnings }} warnings
                  </span>
                </div>
                <div v-if="tokenMigrationResults.outputPreview" class="mt-4">
                  <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Output Preview
                  </div>
                  <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                    <div class="p-3">
                      <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">{{ tokenMigrationResults.outputPreview }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Deprecation Manager Tab -->
        <div v-if="activeTab === 'deprecation'" class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Deprecation List -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Filter -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">filter_list</span>
                Filter
              </h3>
              <Dropdown
                :model-value="filterStatus"
                @update:model-value="filterStatus = $event"
                :options="filterOptions"
                :is-dark-mode="isDarkMode"
              />
            </div>

            <!-- Deprecated Components -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">warning</span>
                Deprecated Components
              </h3>
              <div class="space-y-2">
                <div
                  v-for="component in filteredDeprecated"
                  :key="component.id"
                  @click="selectedComponent = component"
                  class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                  :class="selectedComponent?.id === component.id
                    ? (isDarkMode ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200')
                    : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100')"
                >
                  <span class="material-symbols-outlined text-indigo-600 flex-shrink-0">widgets</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ component.name }}
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ component.status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Component Details -->
            <div 
              v-if="selectedComponent"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">widgets</span>
                  {{ selectedComponent.name }}
                </h3>
                <span 
                  class="px-3 py-1 rounded text-sm font-medium"
                  :class="selectedComponent.status === 'deprecated'
                    ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                    : selectedComponent.status === 'sunset'
                    ? (isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700')
                    : (isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700')"
                >
                  {{ selectedComponent.status }}
                </span>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Deprecation Date
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatDate(selectedComponent.deprecationDate) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Sunset Date
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ formatDate(selectedComponent.sunsetDate) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Replacement Component
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    {{ selectedComponent.replacement }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Reason
                  </label>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ selectedComponent.reason }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Guide
                  </label>
                  <div class="rounded-lg p-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <pre class="text-xs font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"><code>{{ selectedComponent.migrationGuide }}</code></pre>
                  </div>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Usage Count
                  </label>
                  <div class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ selectedComponent.usageCount }} projects
                  </div>
                </div>
              </div>
            </div>

            <!-- Deprecation Schedule -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">calendar_today</span>
                Deprecation Schedule
              </h3>
              <div class="space-y-3">
                <div
                  v-for="item in deprecationSchedule"
                  :key="item.id"
                  class="flex items-center gap-4 p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ item.component }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ item.action }} on {{ formatDate(item.date) }}
                    </div>
                  </div>
                  <div class="text-xs" :class="getDaysUntil(item.date) < 30 ? 'text-red-500' : getDaysUntil(item.date) < 90 ? 'text-yellow-500' : 'text-gray-500'">
                    {{ getDaysUntil(item.date) }} days
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
import Dropdown from '../components/Dropdown.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('components');

// Deprecation Manager State
const selectedComponent = ref(null);
const filterStatus = ref('all');
const deprecatedComponents = ref([
  {
    id: 1,
    name: 'OldButton',
    status: 'deprecated',
    deprecationDate: new Date('2024-01-15'),
    sunsetDate: new Date('2024-07-15'),
    replacement: 'Button',
    reason: 'Replaced with improved Button component with better accessibility',
    migrationGuide: 'Replace <OldButton> with <Button>\nAll props are compatible.',
    usageCount: 12
  },
  {
    id: 2,
    name: 'LegacyCard',
    status: 'sunset',
    deprecationDate: new Date('2023-11-01'),
    sunsetDate: new Date('2024-05-01'),
    replacement: 'Card',
    reason: 'Legacy component, use new Card component',
    migrationGuide: 'Migrate to Card component:\n1. Replace import\n2. Update props\n3. Test functionality',
    usageCount: 5
  },
  {
    id: 3,
    name: 'DeprecatedModal',
    status: 'retired',
    deprecationDate: new Date('2023-06-01'),
    sunsetDate: new Date('2024-01-01'),
    replacement: 'Modal',
    reason: 'Component retired, use Modal instead',
    migrationGuide: 'Component has been retired. Use Modal component.',
    usageCount: 0
  }
]);

const deprecationSchedule = ref([
  { id: 1, component: 'OldButton', action: 'Sunset', date: new Date('2024-07-15') },
  { id: 2, component: 'LegacyCard', action: 'Retire', date: new Date('2024-05-01') }
]);

const filterOptions = computed(() => [
  { label: 'All Status', value: 'all' },
  { label: 'Deprecated', value: 'deprecated' },
  { label: 'Sunset Scheduled', value: 'sunset' },
  { label: 'Retired', value: 'retired' }
]);

const filteredDeprecated = computed(() => {
  if (filterStatus.value === 'all') return deprecatedComponents.value;
  return deprecatedComponents.value.filter(c => c.status === filterStatus.value);
});

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getDaysUntil = (date) => {
  const now = new Date();
  const diff = date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Component Migration State
const componentMigration = ref({
  type: 'single',
  component: '',
  components: '',
  fromVersion: '',
  toVersion: '',
  dryRun: true,
  generateCodemod: false
});
const componentMigrationPlan = ref(null);
const componentMigrationResults = ref(null);
const componentMigrationProgress = ref({
  isRunning: false,
  percentage: 0,
  currentStep: 0,
  totalSteps: 0,
  currentFile: ''
});
const componentCodemodScript = ref('');
const componentMigrationTemplates = ref([
  { id: 1, name: 'Button v2 → v3', fromVersion: '2.0.0', toVersion: '3.0.0', component: 'button' },
  { id: 2, name: 'Card v1 → v2', fromVersion: '1.0.0', toVersion: '2.0.0', component: 'card' },
  { id: 3, name: 'Modal v2 → v3', fromVersion: '2.0.0', toVersion: '3.0.0', component: 'modal' }
]);

// Token Migration State
const tokenMigration = ref({
  type: 'format',
  fromFormat: 'dtcg',
  toFormat: 'css',
  fromVersion: '',
  toVersion: '',
  oldName: '',
  newName: '',
  dryRun: true,
  uploadedFile: null
});
const tokenMigrationPlan = ref(null);
const tokenMigrationResults = ref(null);
const tokenMigrationProgress = ref({
  isRunning: false,
  percentage: 0,
  currentStep: 0,
  totalSteps: 0,
  currentFile: ''
});

const canAnalyzeComponent = computed(() => {
  if (componentMigration.value.type === 'single') {
    return componentMigration.value.component && componentMigration.value.fromVersion && componentMigration.value.toVersion;
  } else if (componentMigration.value.type === 'batch') {
    return componentMigration.value.components && componentMigration.value.fromVersion && componentMigration.value.toVersion;
  }
  return componentMigration.value.fromVersion && componentMigration.value.toVersion;
});

const canAnalyzeToken = computed(() => {
  if (tokenMigration.value.type === 'format') {
    return tokenMigration.value.fromFormat && tokenMigration.value.toFormat && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'version') {
    return tokenMigration.value.fromVersion && tokenMigration.value.toVersion && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'rename') {
    return tokenMigration.value.oldName && tokenMigration.value.newName && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'merge') {
    return tokenMigration.value.uploadedFile;
  }
  return false;
});

const handleTokenFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    tokenMigration.value.uploadedFile = file;
  }
};

const analyzeComponentMigration = () => {
  if (!canAnalyzeComponent.value) return;
  
  const components = componentMigration.value.type === 'batch' 
    ? componentMigration.value.components.split(',').map(c => c.trim())
    : [componentMigration.value.component];
  
  componentMigrationPlan.value = {
    components: components,
    fromVersion: componentMigration.value.fromVersion,
    toVersion: componentMigration.value.toVersion,
    steps: [
      {
        type: 'breaking',
        title: 'Update Import Statement',
        description: 'Change import path to new version',
        code: `// Old\nimport Button from '@/components/v${componentMigration.value.fromVersion}/Button';\n\n// New\nimport Button from '@/components/v${componentMigration.value.toVersion}/Button';`
      },
      {
        type: 'breaking',
        title: 'Update Prop Names',
        description: 'Rename "isOpen" prop to "open"',
        code: `// Old\n<Button isOpen={true} />\n\n// New\n<Button open={true} />`
      },
      {
        type: 'update',
        title: 'Update Event Handlers',
        description: 'Update event handler names',
        code: `// Old\n@click="handleClick"\n\n// New\n@click="onClick"`
      }
    ]
  };
  
  if (componentMigration.value.generateCodemod) {
    generateComponentCodemod();
  }
};

const generateComponentCodemod = () => {
  componentCodemodScript.value = `// Codemod for ${componentMigration.value.component || 'components'} ${componentMigration.value.fromVersion} → ${componentMigration.value.toVersion}
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Transform imports
  root.find(j.ImportDeclaration)
    .filter(path => path.value.source.value.includes('v${componentMigration.value.fromVersion}'))
    .replaceWith(path => {
      return j.importDeclaration(
        path.value.specifiers,
        j.literal(path.value.source.value.replace('v${componentMigration.value.fromVersion}', 'v${componentMigration.value.toVersion}'))
      );
    });
  
  // Transform props
  root.find(j.JSXAttribute, { name: { name: 'isOpen' } })
    .replaceWith(path => {
      return j.jsxAttribute(j.jsxIdentifier('open'), path.value.value);
    });
  
  return root.toSource();
};`;
};

const analyzeTokenMigration = async () => {
  if (!canAnalyzeToken.value) return;
  
  const file = tokenMigration.value.uploadedFile;
  if (!file) return;

  try {
    const fileContent = await readFileContent(file);
    
    if (tokenMigration.value.type === 'format') {
      // Format conversion migration
      tokenMigrationPlan.value = {
        type: 'format',
        fromFormat: tokenMigration.value.fromFormat,
        toFormat: tokenMigration.value.toFormat,
        steps: [
          {
            type: 'update',
            title: 'Parse Source Format',
            description: `Reading tokens from ${tokenMigration.value.fromFormat.toUpperCase()} format`,
            code: `// Reading from ${tokenMigration.value.fromFormat}\nconst tokens = parse${tokenMigration.value.fromFormat.toUpperCase()}(fileContent);`
          },
          {
            type: 'update',
            title: 'Convert Token Structure',
            description: `Converting to ${tokenMigration.value.toFormat.toUpperCase()} format`,
            code: `// Converting to ${tokenMigration.value.toFormat}\nconst converted = convertTo${tokenMigration.value.toFormat.toUpperCase()}(tokens);`
          },
          {
            type: 'update',
            title: 'Generate Output',
            description: `Generating ${tokenMigration.value.toFormat.toUpperCase()} output file`,
            code: `// Output format: ${tokenMigration.value.toFormat}\nconst output = generate${tokenMigration.value.toFormat.toUpperCase()}(converted);`
          }
        ],
        outputFile: `tokens.${getFileExtension(tokenMigration.value.toFormat)}`
      };
      
      // Generate preview
      const preview = generateTokenPreview(fileContent, tokenMigration.value.fromFormat, tokenMigration.value.toFormat);
      tokenMigrationPlan.value.outputPreview = preview;
    } else if (tokenMigration.value.type === 'version') {
      // Version migration
      tokenMigrationPlan.value = {
        type: 'version',
        fromVersion: tokenMigration.value.fromVersion,
        toVersion: tokenMigration.value.toVersion,
        steps: [
          {
            type: 'breaking',
            title: 'Update Token References',
            description: `Updating token references from v${tokenMigration.value.fromVersion} to v${tokenMigration.value.toVersion}`,
            code: `// Old\ncolor.primary.v${tokenMigration.value.fromVersion}\n\n// New\ncolor.primary.v${tokenMigration.value.toVersion}`
          },
          {
            type: 'update',
            title: 'Update Import Paths',
            description: 'Updating import statements to new version',
            code: `// Old\nimport tokens from '@/tokens/v${tokenMigration.value.fromVersion}';\n\n// New\nimport tokens from '@/tokens/v${tokenMigration.value.toVersion}';`
          }
        ]
      };
    } else if (tokenMigration.value.type === 'rename') {
      // Token rename migration
      tokenMigrationPlan.value = {
        type: 'rename',
        oldName: tokenMigration.value.oldName,
        newName: tokenMigration.value.newName,
        steps: [
          {
            type: 'breaking',
            title: 'Rename Token References',
            description: `Renaming token from "${tokenMigration.value.oldName}" to "${tokenMigration.value.newName}"`,
            code: `// Old\n\${tokens['${tokenMigration.value.oldName}']}\n\n// New\n\${tokens['${tokenMigration.value.newName}']}`
          },
          {
            type: 'update',
            title: 'Update CSS Variables',
            description: 'Updating CSS variable names',
            code: `// Old\n--${tokenMigration.value.oldName.replace(/\./g, '-')}\n\n// New\n--${tokenMigration.value.newName.replace(/\./g, '-')}`
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error analyzing token migration:', error);
    alert('Error analyzing token migration. Please check the file format.');
  }
};

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const generateTokenPreview = (content, fromFormat, toFormat) => {
  // Generate a preview of the converted tokens
  if (toFormat === 'css') {
    return `:root {\n  --color-primary: #6366f1;\n  --color-secondary: #8b5cf6;\n  --spacing-sm: 0.5rem;\n  --spacing-md: 1rem;\n}`;
  } else if (toFormat === 'scss') {
    return `$color-primary: #6366f1;\n$color-secondary: #8b5cf6;\n$spacing-sm: 0.5rem;\n$spacing-md: 1rem;`;
  } else if (toFormat === 'dtcg') {
    return `{\n  "color": {\n    "primary": {\n      "$value": "#6366f1",\n      "$type": "color"\n    }\n  }\n}`;
  }
  return content.substring(0, 200) + '...';
};

const getFileExtension = (format) => {
  const extensions = {
    'dtcg': 'json',
    'css': 'css',
    'scss': 'scss',
    'ios': 'plist',
    'android': 'xml',
    'style-dictionary': 'json'
  };
  return extensions[format] || 'json';
};

const loadComponentTemplate = (template) => {
  componentMigration.value.component = template.component;
  componentMigration.value.fromVersion = template.fromVersion;
  componentMigration.value.toVersion = template.toVersion;
  analyzeComponentMigration();
};

const downloadComponentCodemod = () => {
  const blob = new Blob([componentCodemodScript.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `codemod-${componentMigration.value.component || 'components'}.js`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadTokenOutput = () => {
  if (!tokenMigrationPlan.value || !tokenMigrationPlan.value.outputPreview) return;
  
  const blob = new Blob([tokenMigrationPlan.value.outputPreview], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = tokenMigrationPlan.value.outputFile || 'tokens-migrated.json';
  link.click();
  URL.revokeObjectURL(url);
};

const executeComponentMigration = async () => {
  if (componentMigration.value.dryRun) return;
  
  componentMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: componentMigrationPlan.value.steps.length,
    currentFile: ''
  };
  
  // Simulate migration with progress
  for (let i = 0; i < componentMigrationPlan.value.steps.length; i++) {
    componentMigrationProgress.value.currentStep = i + 1;
    componentMigrationProgress.value.percentage = Math.round(((i + 1) / componentMigrationPlan.value.steps.length) * 100);
    componentMigrationProgress.value.currentFile = `Migrating ${componentMigrationPlan.value.components[0]}...`;
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  componentMigrationProgress.value.isRunning = false;
  
  componentMigrationResults.value = {
    filesMigrated: componentMigration.value.type === 'batch' ? componentMigrationPlan.value.components.length * 4 : 12,
    warnings: 3,
    manualSteps: 2
  };
};

const executeTokenMigration = async () => {
  if (tokenMigration.value.dryRun) return;
  
  tokenMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: tokenMigrationPlan.value.steps.length,
    currentFile: ''
  };
  
  // Simulate migration with progress
  for (let i = 0; i < tokenMigrationPlan.value.steps.length; i++) {
    tokenMigrationProgress.value.currentStep = i + 1;
    tokenMigrationProgress.value.percentage = Math.round(((i + 1) / tokenMigrationPlan.value.steps.length) * 100);
    tokenMigrationProgress.value.currentFile = `Processing tokens...`;
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  tokenMigrationProgress.value.isRunning = false;
  
  tokenMigrationResults.value = {
    tokensMigrated: 45,
    filesProcessed: 12,
    warnings: 2,
    outputPreview: tokenMigrationPlan.value.outputPreview
  };
};

const rollbackComponentMigration = async () => {
  if (!confirm('Are you sure you want to rollback this migration?')) return;
  
  componentMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: componentMigrationPlan.value.steps.length,
    currentFile: 'Rolling back...'
  };
  
  // Simulate rollback
  for (let i = 0; i < componentMigrationPlan.value.steps.length; i++) {
    componentMigrationProgress.value.currentStep = i + 1;
    componentMigrationProgress.value.percentage = Math.round(((i + 1) / componentMigrationPlan.value.steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  componentMigrationProgress.value.isRunning = false;
  componentMigrationResults.value = null;
  componentMigrationPlan.value = null;
  alert('Migration rolled back successfully');
};

const rollbackTokenMigration = async () => {
  if (!confirm('Are you sure you want to rollback this migration?')) return;
  
  tokenMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: tokenMigrationPlan.value.steps.length,
    currentFile: 'Rolling back...'
  };
  
  // Simulate rollback
  for (let i = 0; i < tokenMigrationPlan.value.steps.length; i++) {
    tokenMigrationProgress.value.currentStep = i + 1;
    tokenMigrationProgress.value.percentage = Math.round(((i + 1) / tokenMigrationPlan.value.steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  tokenMigrationProgress.value.isRunning = false;
  tokenMigrationResults.value = null;
  tokenMigrationPlan.value = null;
  alert('Token migration rolled back successfully');
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
  selectedComponent.value = deprecatedComponents.value[0];
  
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
