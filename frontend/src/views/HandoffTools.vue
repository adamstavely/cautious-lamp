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
                  Design-Dev Handoff
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Streamline collaboration between design and development. Generate comprehensive specs, match design tokens, and export everything developers need.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="handoffGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Design side (left) -->
                    <rect x="30" y="60" width="60" height="80" rx="4" fill="url(#handoffGradient)" opacity="0.3"/>
                    <circle cx="50" cy="80" r="8" fill="url(#handoffGradient)" opacity="0.5"/>
                    <rect x="45" y="100" width="30" height="20" rx="2" fill="url(#handoffGradient)" opacity="0.4"/>
                    <!-- Arrow/transfer -->
                    <path d="M 100 100 L 120 100" stroke="url(#handoffGradient)" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
                    <path d="M 115 95 L 120 100 L 115 105" stroke="url(#handoffGradient)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                    <!-- Development side (right) -->
                    <rect x="110" y="60" width="60" height="80" rx="4" fill="url(#handoffGradient)" opacity="0.3"/>
                    <line x1="120" y1="75" x2="160" y2="75" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="90" x2="150" y2="90" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="105" x2="155" y2="105" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="120" x2="145" y2="120" stroke="white" stroke-width="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role Tabs -->
        <div class="max-w-7xl mx-auto mb-6">
          <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="activeTab = 'designer'"
              class="px-6 py-3 text-sm font-medium transition-colors border-b-2"
              :class="activeTab === 'designer'
                ? (isDarkMode 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-indigo-600 text-indigo-600')
                : (isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-gray-300' 
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              <span class="material-symbols-outlined align-middle mr-2">palette</span>
              For Designers
            </button>
            <button
              @click="activeTab = 'developer'"
              class="px-6 py-3 text-sm font-medium transition-colors border-b-2"
              :class="activeTab === 'developer'
                ? (isDarkMode 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-indigo-600 text-indigo-600')
                : (isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-gray-300' 
                  : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              <span class="material-symbols-outlined align-middle mr-2">code</span>
              For Developers
            </button>
          </div>
        </div>

        <!-- Workflow Content -->
        <div class="max-w-7xl mx-auto">
          <!-- Designer Workflow -->
          <div v-if="activeTab === 'designer'" class="space-y-6">
          <!-- Step 1: Upload Design -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold">1</span>
              </div>
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">upload</span>
                Upload Your Design
              </h3>
            </div>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Upload a screenshot or design file to extract specs automatically. We'll identify colors, spacing, typography, and measurements.
            </p>
            <div 
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              class="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 hover:border-indigo-500' 
                : 'border-gray-300 bg-gray-50 hover:border-indigo-500'"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*,.fig,.sketch"
                @change="handleFileUpload"
                class="hidden"
              />
              <span class="material-symbols-outlined text-5xl mb-4 block" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">cloud_upload</span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Drop your design file here or click to browse
              </p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Supports PNG, JPG, SVG, Figma files, and Sketch files
              </p>
            </div>
            <div v-if="uploadedFile" class="mt-4 p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-indigo-600">image</span>
                  <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ uploadedFile.name }}</span>
                </div>
                <button
                  @click="uploadedFile = null"
                  class="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Design Specs -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold">2</span>
              </div>
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">straighten</span>
                Design Specifications
              </h3>
            </div>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Enter or adjust the design specifications. These will be used to generate developer-ready code and match design tokens.
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Colors -->
              <div>
                <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Colors Used
                </label>
                <div class="space-y-2">
                  <div v-for="(color, index) in designSpecs.colors" :key="index" class="flex items-center gap-3">
                    <button
                      @click="openColorPicker(index, $event)"
                      class="w-12 h-10 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: color.value }"
                      :title="`Pick color ${index + 1}`"
                    ></button>
                    <input
                      v-model="color.value"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <button
                      @click="designSpecs.colors.splice(index, 1)"
                      class="text-red-500 hover:text-red-600"
                    >
                      <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                  <button
                    @click="designSpecs.colors.push({ value: '#000000', name: '' })"
                    class="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-base">add</span>
                    Add Color
                  </button>
                </div>
              </div>

              <!-- Typography -->
              <div>
                <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Typography
                </label>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Font Family</label>
                    <input
                      v-model="designSpecs.typography.fontFamily"
                      type="text"
                      placeholder="Inter, Roboto, etc."
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Size (px)</label>
                      <input
                        v-model.number="designSpecs.typography.fontSize"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Weight</label>
                      <input
                        v-model.number="designSpecs.typography.fontWeight"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Spacing -->
              <div>
                <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Spacing
                </label>
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Padding</label>
                      <input
                        v-model.number="designSpecs.spacing.padding"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Margin</label>
                      <input
                        v-model.number="designSpecs.spacing.margin"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Border Radius</label>
                    <input
                      v-model.number="designSpecs.spacing.borderRadius"
                      type="number"
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                </div>
              </div>

              <!-- Dimensions -->
              <div>
                <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Dimensions
                </label>
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Width (px)</label>
                      <input
                        v-model.number="designSpecs.dimensions.width"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Height (px)</label>
                      <input
                        v-model.number="designSpecs.dimensions.height"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Generate Handoff -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span class="text-indigo-600 dark:text-indigo-400 font-semibold">3</span>
              </div>
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">description</span>
                Generate Handoff Documentation
              </h3>
            </div>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Generate comprehensive handoff documentation with matched design tokens and ready-to-use code.
            </p>
            <div class="flex items-center gap-3 mb-4">
              <select
                v-model="handoffFormat"
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="markdown">Markdown Document</option>
                <option value="html">HTML Page</option>
                <option value="pdf">PDF Document</option>
                <option value="json">JSON Spec</option>
              </select>
              <button
                @click="generateHandoff"
                class="px-6 py-2 rounded-lg font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Generate Handoff
              </button>
            </div>
            <div v-if="generatedHandoff" class="mt-4 rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
              <div class="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                <pre class="text-sm font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-green-400' : 'text-gray-700'"><code>{{ generatedHandoff }}</code></pre>
              </div>
              <div class="p-3 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
                <button
                  @click="copyHandoff"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Copy
                </button>
                <button
                  @click="downloadHandoff"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
          </div>

          <!-- Developer Workflow -->
          <div v-if="activeTab === 'developer'" class="space-y-6">
          <!-- View Specs -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">description</span>
              Design Specifications
            </h3>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              View the design specifications provided by the design team. All measurements, colors, and typography are clearly documented.
            </p>
            <div v-if="!designSpecsLoaded" class="text-center py-12">
              <span class="material-symbols-outlined text-5xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">description</span>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No design specs available. Ask your designer to generate a handoff document.
              </p>
            </div>
            <div v-else class="space-y-4">
              <!-- Specs Display -->
              <div class="grid md:grid-cols-2 gap-4">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Colors</div>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="(color, index) in designSpecs.colors" :key="index" class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded border" :style="{ backgroundColor: color.value }" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"></div>
                      <span class="text-xs font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ color.value }}</span>
                    </div>
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Typography</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ designSpecs.typography.fontFamily || 'Not specified' }}, 
                    {{ designSpecs.typography.fontSize || 'N/A' }}px, 
                    Weight {{ designSpecs.typography.fontWeight || 'N/A' }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Spacing</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Padding: {{ designSpecs.spacing.padding || 0 }}px<br>
                    Margin: {{ designSpecs.spacing.margin || 0 }}px<br>
                    Border Radius: {{ designSpecs.spacing.borderRadius || 0 }}px
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Dimensions</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ designSpecs.dimensions.width || 0 }}px × {{ designSpecs.dimensions.height || 0 }}px
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Token Matching -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">auto_awesome</span>
              Matched Design Tokens
            </h3>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              We've automatically matched your design specs to existing design tokens. Use these tokens instead of hardcoded values for consistency.
            </p>
            <div class="space-y-3">
              <div v-for="(match, index) in matchedTokens" :key="index" class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ match.type }}</div>
                    <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Design value: <span class="font-mono">{{ match.designValue }}</span>
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      → Use token: <span class="font-mono font-semibold">{{ match.token }}</span>
                    </div>
                  </div>
                  <button
                    @click="copyToken(match.token)"
                    class="px-3 py-1 rounded text-xs font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div v-if="matchedTokens.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No token matches found. Check the design system token library for available tokens.
              </div>
            </div>
          </div>

          <!-- Code Generation -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">code</span>
              Generate Code
            </h3>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Generate ready-to-use code with design tokens. Choose your framework and copy the code directly.
            </p>
            <div class="flex items-center gap-3 mb-4">
              <CodeFormatDropdown
                v-model="codeFormat"
                :options="[
                  { value: 'css', label: 'CSS' },
                  { value: 'scss', label: 'SCSS' },
                  { value: 'vue', label: 'Vue Component' },
                  { value: 'react', label: 'React Component' },
                  { value: 'tailwind', label: 'Tailwind CSS' }
                ]"
              />
              <button
                @click="generateCode"
                class="px-6 py-2 rounded-lg font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Generate Code
              </button>
            </div>
            <div v-if="generatedCode" class="mt-4 rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
              <div class="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                <pre class="text-sm font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-green-400' : 'text-gray-700'"><code>{{ generatedCode }}</code></pre>
              </div>
              <div class="p-3 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
                <button
                  @click="copyCode"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>

          <!-- Component Matching -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">widgets</span>
              Similar Components
            </h3>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Check if there's already a component in the design system that matches this design. Reuse existing components when possible.
            </p>
            <div class="space-y-3">
              <div v-for="(component, index) in similarComponents" :key="index" class="p-4 rounded-lg border flex items-center justify-between" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <div>
                  <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ component.name }}</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ component.description }}</div>
                </div>
                <a
                  :href="component.link"
                  class="px-4 py-2 rounded text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  View Component
                </a>
              </div>
              <div v-if="similarComponents.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No similar components found. You may need to build a new component.
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import CodeFormatDropdown from '../components/CodeFormatDropdown.vue';
import ColorPicker from '../components/ColorPicker.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('designer');
const fileInput = ref(null);
const uploadedFile = ref(null);
const handoffFormat = ref('markdown');
const codeFormat = ref('css');
const generatedHandoff = ref('');
const generatedCode = ref('');
const designSpecsLoaded = ref(false);

const designSpecs = ref({
  colors: [
    { value: '#4f46e5', name: 'Primary' },
    { value: '#6366f1', name: 'Secondary' }
  ],
  typography: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 400
  },
  spacing: {
    padding: 12,
    margin: 8,
    borderRadius: 8
  },
  dimensions: {
    width: 200,
    height: 48
  }
});

const matchedTokens = ref([
  { type: 'Color', designValue: '#4f46e5', token: '--color-primary' },
  { type: 'Spacing', designValue: '12px', token: '--spacing-md' },
  { type: 'Border Radius', designValue: '8px', token: '--radius-md' }
]);

const similarComponents = ref([
  { name: 'Button', description: 'Primary action button component', link: '/components/button' },
  { name: 'Card', description: 'Container component with padding and border radius', link: '/components/card' }
]);

// Color picker state
const showColorPicker = ref(false);
const currentColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    uploadedFile.value = file;
    // In a real implementation, this would extract specs from the file
    designSpecsLoaded.value = true;
  }
};

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files?.[0];
  if (file) {
    uploadedFile.value = file;
    designSpecsLoaded.value = true;
  }
};

const openColorPicker = (index, event) => {
  event.stopPropagation();
  currentColorIndex.value = index;
  const color = designSpecs.value.colors[index];
  pickerColor.value = color ? color.value : '#000000';
  
  // Calculate position - ColorPicker uses fixed positioning, so coordinates are relative to viewport
  const rect = event.target.getBoundingClientRect();
  const pickerWidth = 280;
  const pickerHeight = 400;
  const padding = 16;
  const gap = 16;
  
  // Horizontal positioning
  let left = rect.right + gap;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth - padding) {
    left = rect.left - pickerWidth - gap;
  }
  
  // Ensure picker doesn't go off left or right edge
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  // Vertical positioning - check available space above and below
  const spaceBelow = window.innerHeight - rect.bottom - padding;
  const spaceAbove = rect.top - padding;
  
  let top;
  
  // If there's enough space below, position below the button
  if (spaceBelow >= pickerHeight) {
    top = rect.bottom + gap;
  }
  // If there's more space above than below, position above
  else if (spaceAbove >= pickerHeight) {
    top = rect.top - pickerHeight - gap;
  }
  // If there's not enough space in either direction, use the one with more space
  else if (spaceAbove > spaceBelow) {
    top = Math.max(padding, rect.top - pickerHeight - gap);
  }
  else {
    top = Math.min(window.innerHeight - pickerHeight - padding, rect.bottom + gap);
  }
  
  // Final bounds check to ensure picker stays within viewport
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  pickerPosition.value = { left: left, top: top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentColorIndex.value !== null) {
    designSpecs.value.colors[currentColorIndex.value].value = color;
  }
  showColorPicker.value = false;
  currentColorIndex.value = null;
};

const generateHandoff = () => {
  const specs = designSpecs.value;
  
  if (handoffFormat.value === 'markdown') {
    generatedHandoff.value = `# Design Handoff Document

## Colors
${specs.colors.map(c => `- **${c.name || 'Color'}**: \`${c.value}\``).join('\n')}

## Typography
- **Font Family**: ${specs.typography.fontFamily}
- **Font Size**: ${specs.typography.fontSize}px
- **Font Weight**: ${specs.typography.fontWeight}

## Spacing
- **Padding**: ${specs.spacing.padding}px
- **Margin**: ${specs.spacing.margin}px
- **Border Radius**: ${specs.spacing.borderRadius}px

## Dimensions
- **Width**: ${specs.dimensions.width}px
- **Height**: ${specs.dimensions.height}px

## Design Tokens to Use
${matchedTokens.value.map(t => `- \`${t.token}\` (matches ${t.designValue})`).join('\n')}
`;
  } else if (handoffFormat.value === 'json') {
    generatedHandoff.value = JSON.stringify({
      colors: specs.colors,
      typography: specs.typography,
      spacing: specs.spacing,
      dimensions: specs.dimensions,
      matchedTokens: matchedTokens.value
    }, null, 2);
  } else {
    generatedHandoff.value = 'HTML/PDF generation would be implemented here';
  }
};

const copyHandoff = async () => {
  if (!generatedHandoff.value) return;
  try {
    await navigator.clipboard.writeText(generatedHandoff.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadHandoff = () => {
  if (!generatedHandoff.value) return;
  const extension = handoffFormat.value === 'json' ? 'json' : handoffFormat.value === 'pdf' ? 'pdf' : handoffFormat.value === 'html' ? 'html' : 'md';
  const filename = `design-handoff.${extension}`;
  
  const blob = new Blob([generatedHandoff.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateCode = () => {
  const specs = designSpecs.value;
  
  if (codeFormat.value === 'css') {
    generatedCode.value = `.component {
  width: ${specs.dimensions.width}px;
  height: ${specs.dimensions.height}px;
  padding: ${specs.spacing.padding}px;
  margin: ${specs.spacing.margin}px;
  border-radius: ${specs.spacing.borderRadius}px;
  background-color: ${specs.colors[0]?.value || '#000'};
  font-family: ${specs.typography.fontFamily};
  font-size: ${specs.typography.fontSize}px;
  font-weight: ${specs.typography.fontWeight};
}`;
  } else if (codeFormat.value === 'tailwind') {
    generatedCode.value = `<div class="w-[${specs.dimensions.width}px] h-[${specs.dimensions.height}px] p-[${specs.spacing.padding}px] m-[${specs.spacing.margin}px] rounded-[${specs.spacing.borderRadius}px]" style="background-color: ${specs.colors[0]?.value || '#000'}; font-family: ${specs.typography.fontFamily}; font-size: ${specs.typography.fontSize}px; font-weight: ${specs.typography.fontWeight};">
  Content
</div>`;
  } else if (codeFormat.value === 'vue') {
    const templateTag = '<' + 'template' + '>';
    const templateClose = '<' + '/' + 'template' + '>';
    const scriptTag = '<' + 'script setup' + '>';
    const scriptClose = '<' + '/' + 'script' + '>';
    generatedCode.value = `${templateTag}
  <div class="component" :style="componentStyle">
    <slot></slot>
  </div>
${templateClose}

${scriptTag}
const componentStyle = {
  width: '${specs.dimensions.width}px',
  height: '${specs.dimensions.height}px',
  padding: '${specs.spacing.padding}px',
  margin: '${specs.spacing.margin}px',
  borderRadius: '${specs.spacing.borderRadius}px',
  backgroundColor: '${specs.colors[0]?.value || '#000'}',
  fontFamily: '${specs.typography.fontFamily}',
  fontSize: '${specs.typography.fontSize}px',
  fontWeight: ${specs.typography.fontWeight}
}
${scriptClose}`;
  } else if (codeFormat.value === 'react') {
    generatedCode.value = `import React from 'react';

const Component = ({ children }) => {
  const style = {
    width: '${specs.dimensions.width}px',
    height: '${specs.dimensions.height}px',
    padding: '${specs.spacing.padding}px',
    margin: '${specs.spacing.margin}px',
    borderRadius: '${specs.spacing.borderRadius}px',
    backgroundColor: '${specs.colors[0]?.value || '#000'}',
    fontFamily: '${specs.typography.fontFamily}',
    fontSize: '${specs.typography.fontSize}px',
    fontWeight: ${specs.typography.fontWeight}
  };

  return <div style={style}>{children}</div>;
};

export default Component;`;
  }
};

const copyCode = async () => {
  if (!generatedCode.value) return;
  try {
    await navigator.clipboard.writeText(generatedCode.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
  } catch (err) {
    console.error('Failed to copy:', err);
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
