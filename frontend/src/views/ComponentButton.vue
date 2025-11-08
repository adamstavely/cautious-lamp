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
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Button
                    </h1>
                    <span 
                      class="px-3 py-1 rounded-full text-sm font-medium border"
                      :class="getComponentStatusBadgeClass(componentStatus)"
                    >
                      {{ componentStatus || 'Production Ready' }}
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    A versatile button component for triggering actions throughout your application. Supports multiple variants, sizes, and states.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Version 1.0.0
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
                        <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized button icon -->
                      <rect x="40" y="80" width="120" height="40" rx="8" fill="url(#buttonGradient)" opacity="0.8"/>
                      <text x="100" y="105" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">Button</text>
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
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Experiment with the Button component. Edit props, see live previews, and export code snippets.</p>
            </div>

            <!-- Export Buttons -->
            <div class="mb-6 flex items-center gap-4">
              <button
                @click="copyCode"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-base">content_copy</span>
                Copy Code
              </button>
              <button
                @click="exportAsVue"
                class="px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                <span class="material-symbols-outlined text-base">code</span>
                Export Vue
              </button>
              <button
                @click="exportAsReact"
                class="px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                <span class="material-symbols-outlined text-base">code</span>
                Export React
              </button>
              <button
                @click="exportAsHTML"
                class="px-4 py-2 border rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                <span class="material-symbols-outlined text-base">code</span>
                Export HTML
              </button>
            </div>

            <div class="grid lg:grid-cols-2 gap-6 mb-6">
              <!-- Props Editor -->
              <div 
                class="rounded-lg shadow-sm border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">tune</span>
                    Props Editor
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Label
                        <span class="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        v-model="propValues.label"
                        type="text"
                        placeholder="Click me"
                        class="w-full px-3 py-2 border rounded-lg text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Button text
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Variant
                      </label>
                      <select
                        v-model="propValues.variant"
                        class="w-full px-3 py-2 border rounded-lg text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="tertiary">Tertiary</option>
                        <option value="danger">Danger</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Size
                      </label>
                      <select
                        v-model="propValues.size"
                        class="w-full px-3 py-2 border rounded-lg text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>
                    <div>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="propValues.disabled"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Disabled
                        </span>
                      </label>
                    </div>
                    <div>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="propValues.loading"
                          class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Loading
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Preview -->
              <div 
                class="rounded-lg shadow-sm border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Live Preview
                  </h3>
                  <div class="flex items-center gap-2">
                    <button
                      @click="previewDarkMode = !previewDarkMode"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      :class="previewDarkMode
                        ? (isDarkMode 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-600 text-white')
                        : (isDarkMode 
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                    >
                      <span class="material-symbols-outlined text-base">{{ previewDarkMode ? 'dark_mode' : 'light_mode' }}</span>
                      {{ previewDarkMode ? 'Dark' : 'Light' }}
                    </button>
                    <button
                      @click="toggleFullscreen"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
                      aria-label="Toggle fullscreen"
                    >
                      <span class="material-symbols-outlined">fullscreen</span>
                    </button>
                  </div>
                </div>
                <div class="p-8 min-h-[400px] flex items-center justify-center" :class="previewDarkMode ? 'bg-slate-950 dark' : 'bg-gray-50'">
                  <component-preview 
                    :key="`button-${JSON.stringify(propValues)}`"
                    component="button"
                    :props="propValues"
                    :is-dark-mode="previewDarkMode"
                  />
                </div>
              </div>
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
                  <span class="material-symbols-outlined text-indigo-600">code</span>
                  Generated Code
                </h3>
                <div class="flex gap-2">
                  <button
                    @click="codeFormat = 'vue'"
                    class="px-3 py-1 rounded text-xs font-medium transition-colors"
                    :class="codeFormat === 'vue' 
                      ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                  >
                    Vue
                  </button>
                  <button
                    @click="codeFormat = 'react'"
                    class="px-3 py-1 rounded text-xs font-medium transition-colors"
                    :class="codeFormat === 'react' 
                      ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                  >
                    React
                  </button>
                  <button
                    @click="codeFormat = 'html'"
                    class="px-3 py-1 rounded text-xs font-medium transition-colors"
                    :class="codeFormat === 'html' 
                      ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                  >
                    HTML
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>{{ generatedCode }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Variants Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Variants</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Explore different button styles and use cases.</p>
            </div>
            
            <div class="space-y-8">
              <!-- Primary Variant -->
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Primary</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Use for the main action on a page or in a form.</p>
                </div>
                <div class="rounded-lg p-6 mb-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Primary Button
                  </button>
                </div>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"&gt;
    Primary Button
&lt;/button&gt;</code></pre>
                </div>
              </div>

              <!-- Secondary Variant -->
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Secondary</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Use for secondary actions that are less prominent.</p>
                </div>
                <div class="rounded-lg p-6 mb-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <button 
                    class="px-6 py-3 border-2 border-indigo-600 rounded-lg transition-colors font-medium"
                    :class="isDarkMode 
                      ? 'bg-slate-700 text-indigo-400 hover:bg-slate-600' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'"
                  >
                    Secondary Button
                  </button>
                </div>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;button class="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"&gt;
    Secondary Button
&lt;/button&gt;</code></pre>
                </div>
              </div>

              <!-- Sizes -->
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Sizes</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Choose from small, medium, or large button sizes.</p>
                </div>
                <div class="rounded-lg p-6 mb-4 flex items-center gap-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <button class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Small
                  </button>
                  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Medium
                  </button>
                  <button class="px-8 py-4 text-lg bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Large
                  </button>
                </div>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;!-- Small --&gt;
&lt;button class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg"&gt;Small&lt;/button&gt;

&lt;!-- Medium --&gt;
&lt;button class="px-6 py-3 bg-indigo-600 text-white rounded-lg"&gt;Medium&lt;/button&gt;

&lt;!-- Large --&gt;
&lt;button class="px-8 py-4 text-lg bg-indigo-600 text-white rounded-lg"&gt;Large&lt;/button&gt;</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Props/API Documentation -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">API Reference</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Complete list of props and options available for the Button component.</p>
            </div>
            
            <div 
              class="rounded-2xl border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Prop</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Default</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Description</th>
                    </tr>
                  </thead>
                  <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">variant</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">'primary' | 'secondary' | 'tertiary'</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">'primary'</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        The visual style variant of the button.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">size</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">'sm' | 'md' | 'lg'</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">'md'</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        The size of the button.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">disabled</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">boolean</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">false</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Whether the button is disabled.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">loading</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">boolean</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">false</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Shows a loading spinner when true.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Usage Examples -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Usage Examples</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Common patterns and use cases for the Button component.</p>
            </div>
            
            <div class="space-y-6">
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Form Submission</h3>
                <div class="rounded-lg p-4 overflow-x-auto mb-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono" v-pre><code>&lt;form @submit.prevent="handleSubmit"&gt;
  &lt;input v-model="email" type="email" placeholder="Email" /&gt;
  &lt;button 
    type="submit" 
    class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    :disabled="isSubmitting"
  &gt;
    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
  &lt;/button&gt;
&lt;/form&gt;</code></pre>
                </div>
              </div>

              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Action Buttons</h3>
                <div class="rounded-lg p-4 overflow-x-auto mb-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;div class="flex gap-4"&gt;
  &lt;button class="px-6 py-3 bg-indigo-600 text-white rounded-lg"&gt;
    Save Changes
  &lt;/button&gt;
  &lt;button class="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg"&gt;
    Cancel
  &lt;/button&gt;
&lt;/div&gt;</code></pre>
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
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Buttons should have descriptive text that clearly indicates their action</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Use <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-label</code> for icon-only buttons</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Disabled buttons should not be focusable via keyboard navigation</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Ensure sufficient color contrast (WCAG AA minimum)</span>
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
              <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">speed</span>
                  Performance Metrics
                </h2>
                <button
                  v-if="performanceData"
                  @click="loadPerformanceData"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  :class="isDarkMode 
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  <span class="material-symbols-outlined text-base">refresh</span>
                  Refresh
                </button>
              </div>
              
              <div v-if="performanceLoading" class="p-12 text-center">
                <div class="flex justify-center mb-4">
                  <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Loading performance data...
                </p>
              </div>

              <div v-else-if="performanceData" class="p-6">
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code</span>
                      Vue Size
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(performanceData.vueSize) }}
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code</span>
                      React Size
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(performanceData.reactSize) }}
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">storage</span>
                      Total Size
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(performanceData.totalSize) }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      + {{ formatSize(performanceData.dependenciesSize) }} deps
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">compress</span>
                      Gzipped
                    </div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(performanceData.gzippedSize) }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ Math.round((performanceData.gzippedSize / performanceData.totalSize) * 100) }}% compression
                    </div>
                  </div>
                </div>

                <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">info</span>
                      Status
                    </h3>
                    <span 
                      class="px-3 py-1 text-sm rounded-full font-medium"
                      :class="getPerformanceStatusClass(performanceData.status)"
                    >
                      {{ performanceData.status === 'pass' ? 'Optimal' : performanceData.status === 'warning' ? 'Warning' : 'Error' }}
                    </span>
                  </div>
                  <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <span v-if="performanceData.dependencies && performanceData.dependencies.length > 0">
                      Dependencies: {{ performanceData.dependencies.join(', ') }}
                    </span>
                    <span v-else>No dependencies</span>
                  </p>
                </div>

                <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h3 class="text-lg font-semibold flex items-center gap-2 mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">language</span>
                    Supported Browsers
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                      v-for="browser in getSupportedBrowsers()"
                      :key="browser.name"
                      class="flex items-center gap-2 p-3 rounded-lg border"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'"
                    >
                      <div 
                        class="w-8 h-8 flex-shrink-0"
                        :title="`${browser.name} ${browser.version}+`"
                        v-html="getBrowserIcon(browser.name)"
                      ></div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ browser.name }}
                        </div>
                        <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ browser.version }}+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="p-12 text-center">
                <span class="material-symbols-outlined text-4xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">speed</span>
                <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Performance data unavailable
                </p>
                <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Unable to load performance metrics for this component.
                </p>
              </div>
            </div>
          </div>

          <!-- Version History -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Version History</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Track component versions, view changelogs, and manage breaking changes.</p>
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
                <span>Released: {{ formatDate(currentVersion.releasedAt) }}</span>
                <span v-if="currentVersion.lastUpdated">Last Updated: {{ formatDate(currentVersion.lastUpdated) }}</span>
              </div>
            </div>

            <!-- Version History List -->
            <div 
              v-if="componentVersions.length > 0"
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <div
                  v-for="version in componentVersions"
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
                        Released: {{ formatDate(version.releasedAt) }}
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

          <!-- Related Components -->
          <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Related Components</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components that work well with Button or serve similar purposes.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
              <router-link 
                to="/components/forms" 
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">description</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    Forms
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Form components that work seamlessly with buttons for submission and actions.
                </p>
              </router-link>

              <router-link 
                to="/components/cards" 
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">view_module</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    Cards
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Card components often include action buttons for user interactions.
                </p>
              </router-link>

              <router-link 
                to="/components/navigation" 
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">navigation</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    Navigation
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Navigation components that complement button usage patterns.
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
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ComponentPreview from '../components/ComponentPreview.vue';
import axios from 'axios';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const route = useRoute();
const { getComponent } = useComponentPatternStatus();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const previewDarkMode = ref(false);
const codeFormat = ref('vue');

// Get component status from shared store
const componentStatus = computed(() => {
  const component = getComponent('Button');
  return component?.status || 'Production Ready';
});
const propValues = reactive({
  label: 'Click me',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
});

// Performance data
const performanceData = ref(null);
const performanceLoading = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

// Map route paths to component IDs
const getComponentId = () => {
  const routeToIdMap = {
    '/components/buttons': 'button',
    '/components/color-picker': 'color-picker',
    '/components/forms': 'input',
    '/components/cards': 'card',
    '/components/navigation': 'navigation',
    '/components/data-display': 'table'
  };
  return routeToIdMap[route.path] || null;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getPerformanceStatusClass = (status) => {
  if (status === 'error') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (status === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
};

const getSupportedBrowsers = () => {
  // Default browser support - can be customized per component
  return [
    { name: 'Chrome', version: '90' },
    { name: 'Firefox', version: '88' },
    { name: 'Safari', version: '14' },
    { name: 'Edge', version: '90' }
  ];
};

const getBrowserIcon = (browserName) => {
  const icons = {
    'Chrome': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 276 276" class="w-full h-full"><linearGradient id="chrome-a" x1="145" x2="34" y1="253" y2="61" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1e8e3e"/><stop offset="1" stop-color="#34a853"/></linearGradient><linearGradient id="chrome-b" x1="111" x2="222" y1="254" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fcc934"/><stop offset="1" stop-color="#fbbc04"/></linearGradient><linearGradient id="chrome-c" x1="17" x2="239" y1="80" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d93025"/><stop offset="1" stop-color="#ea4335"/></linearGradient><circle cx="128" cy="128" r="64" fill="#fff"/><path fill="url(#chrome-a)" d="M96 183.4A63.7 63.7 0 0 1 72.6 160L17.2 64A128 128 0 0 0 128 256l55.4-96A64 64 0 0 1 96 183.4Z"/><path fill="url(#chrome-b)" d="M192 128a63.7 63.7 0 0 1-8.6 32L128 256A128 128 0 0 0 238.9 64h-111a64 64 0 0 1 64 64Z"/><circle cx="128" cy="128" r="52" fill="#1a73e8"/><path fill="url(#chrome-c)" d="M96 72.6a63.7 63.7 0 0 1 32-8.6h110.8a128 128 0 0 0-221.7 0l55.5 96A64 64 0 0 1 96 72.6Z"/></svg>`,
    'Firefox': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:x="http://www.w3.org/1999/xlink" viewBox="0 0 51500 51500" class="w-full h-full"><radialGradient id="firefox-b" cx="87.4%" cy="-12.9%" r="128%" gradientTransform="matrix(.8 0 0 1 .18 .13)"><stop offset=".13" stop-color="#ffbd4f"/><stop offset=".28" stop-color="#ff980e"/><stop offset=".47" stop-color="#ff3750"/><stop offset=".78" stop-color="#eb0878"/><stop offset=".86" stop-color="#e50080"/></radialGradient><radialGradient id="firefox-d" cx="49%" cy="40%" r="128%" gradientTransform="matrix(.82 0 0 1 .09 0)"><stop offset=".3" stop-color="#960e18"/><stop offset=".35" stop-color="#b11927" stop-opacity=".74"/><stop offset=".43" stop-color="#db293d" stop-opacity=".34"/><stop offset=".5" stop-color="#f5334b" stop-opacity=".1"/><stop offset=".53" stop-color="#ff3750" stop-opacity="0"/></radialGradient><radialGradient id="firefox-e" cx="48%" cy="-12%" r="140%"><stop offset=".13" stop-color="#fff44f"/><stop offset=".53" stop-color="#ff980e"/></radialGradient><radialGradient id="firefox-f" cx="22.76%" cy="110.11%" r="100%"><stop offset=".35" stop-color="#3a8ee6"/><stop offset=".67" stop-color="#9059ff"/><stop offset="1" stop-color="#c139e6"/></radialGradient><radialGradient id="firefox-h" cx="52%" cy="33%" r="59%" gradientTransform="scale(.9 1)"><stop offset=".21" stop-color="#9059ff" stop-opacity="0"/><stop offset=".97" stop-color="#6e008b" stop-opacity=".6"/></radialGradient><radialGradient id="firefox-i" cx="210%" cy="-100%" r="290%"><stop offset=".1" stop-color="#ffe226"/><stop offset=".79" stop-color="#ff7139"/></radialGradient><radialGradient id="firefox-j" cx="84%" cy="-41%" r="180%"><stop offset=".11" stop-color="#fff44f"/><stop offset=".46" stop-color="#ff980e"/><stop offset=".72" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-k" cx="16.1%" cy="-18.6%" r="348.8%" gradientTransform="matrix(.10453 .46743 -.99452 .04913 -.05 -.26)"><stop offset="0" stop-color="#fff44f"/><stop offset=".3" stop-color="#ff980e"/><stop offset=".57" stop-color="#ff3647"/><stop offset=".74" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-l" cx="18.9%" cy="-42.5%" r="238.4%"><stop offset=".14" stop-color="#fff44f"/><stop offset=".48" stop-color="#ff980e"/><stop offset=".66" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-m" cx="159.3%" cy="-44.72%" r="313.1%"><stop offset=".09" stop-color="#fff44f"/><stop offset=".63" stop-color="#ff980e"/></radialGradient><linearGradient id="firefox-a" x1="87.25%" x2="9.4%" y1="15.5%" y2="93.1%"><stop offset=".05" stop-color="#fff44f"/><stop offset=".37" stop-color="#ff980e"/><stop offset=".53" stop-color="#ff3647"/><stop offset=".7" stop-color="#e31587"/></linearGradient><linearGradient id="firefox-n" x1="80%" x2="18%" y1="14%" y2="84%"><stop offset=".17" stop-color="#fff44f" stop-opacity=".8"/><stop offset=".6" stop-color="#fff44f" stop-opacity="0"/></linearGradient><path id="firefox-c" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294 0-6 2 5 4 22l4 26c2268 6147 1032 12398-748 16218-2754 5910-9420 11967-19857 11670-11276-318-21210-8683-23064-19643-338-1728 0-2605 170-4008-207 1080-286 1394-390 3315l-2 123c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075z"/><path id="firefox-g" d="M25677 21050c-40 598-2150 2660-2890 2660-6834 0-7943 4133-7943 4133 303 3480 2726 6348 5660 7865 134 70 270 130 405 193a13277 13277 0 00706 289 10674 10674 0 003127 603c11978 562 14300-14320 5655-18640 2213-385 4510 505 5794 1407-2100-3672-6025-6150-10530-6150-285 0-564 24-844 43a12025 12025 0 00-6614 2549c366 310 780 724 1650 1583 1630 1606 5813 3270 5822 3465z"/><path fill="url(#firefox-a)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350a12025 12025 0 00-6614 2548 7136 7136 0 00-622-470 11134 11134 0 01-68-5873c-2468 1124-4390 2900-5785 4470h-10c-953-1206-886-5187-832-6018-10-52-710 363-802 425a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39700 39700 0 00-237 1500l-5 52a22907 22907 0 00-390 3316l-1 120c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zM20170 35545c113 53 220 112 334 164l16 10a12620 12620 0 01-350-174zm5506-14493zm19813-3060l-3-23 4 26z"/><use fill="url(#firefox-b)" x:href="#firefox-c"/><use fill="url(#firefox-d)" x:href="#firefox-c"/><path fill="url(#firefox-e)" d="M36192 19560l150 110a13070 13070 0 00-2231-2911C26640 9290 32150 563 33080 120l10-13c-6037 3535-8085 10076-8273 13348 280-20 560-43 844-43 4505 0 8430 2477 10530 6150z"/><use fill="url(#firefox-f)" x:href="#firefox-g"/><use fill="url(#firefox-h)" x:href="#firefox-g"/><path fill="url(#firefox-i)" d="M17083 15204a24404 24404 0 01498 330 11134 11134 0 01-67-5874c-2470 1125-4390 2900-5785 4470 115-3 3600-66 5354 1074z"/><path fill="url(#firefox-j)" d="M1822 26240c1855 10960 11788 19325 23063 19644 10437 296 17104-5762 19858-11670 1780-3820 3016-10070 748-16218v-2l-4-24c-2-17-4-28-4-22l5 40c853 5566-1980 10958-6405 14604l-13 30c-8625 7023-16878 4237-18550 3097a14410 14410 0 01-350-174c-5028-2403-7105-6984-6660-10913-4245 0-5693-3580-5693-3580s3812-2718 8836-355c4653 2190 9023 355 9023 354-10-195-4192-1860-5822-3465-872-860-1285-1272-1652-1583a7136 7136 0 00-622-470 28293 28293 0 00-498-330c-1753-1140-5240-1076-5355-1073h-10c-953-1207-886-5188-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280c-10 52-865 3784-444 5720z"/><path fill="url(#firefox-k)" d="M34110 16760a13070 13070 0 012231 2910l360 296c5450 5020 2594 12120 2380 12626 4426-3646 7258-9038 6405-14604-2716-6774-7323-9506-11086-15453l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10c-930 443-6440 9170 1030 16640z"/><path fill="url(#firefox-l)" d="M36702 19965a4743 4743 0 00-360-295l-150-110c-1283-900-3580-1792-5794-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l16 10c1670 1140 9924 3925 18550-3097l13-30c213-506 3068-7606-2380-12626z"/><path fill="url(#firefox-m)" d="M14844 27844s1110-4133 7943-4133c740 0 2850-2062 2890-2660s-4370 1836-9023-354c-5024-2363-8836 354-8836 354s1448 3580 5693 3580c-445 3930 1632 8510 6660 10913 113 53 218 112 334 164-2935-1517-5358-4384-5660-7865z"/><path fill="url(#firefox-n)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350 280-20 560-43 845-43 4505 0 8430 2477 10530 6148-1284-900-3580-1792-5795-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l17 10a14410 14410 0 01-350-174c112 53 218 112 333 164-2935-1517-5358-4384-5660-7865 0 0 1108-4133 7942-4133 740 0 2850-2062 2890-2660-10-195-4190-1860-5822-3465-870-860-1285-1272-1650-1583a7136 7136 0 00-623-470 11134 11134 0 01-67-5873c-2470 1124-4390 2900-5785 4470h-10c-953-1207-886-5187-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2243 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39787 39787 0 00-277 1515c-2 18 2-17 0 0a27956 27956 0 00-355 3353l-3 122c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zm-2384 1234l4 26v-2l-4-24z"/></svg>`,
    'Safari': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="194.5 190.1 135.1 135.1" class="w-full h-full"><style>.b{color-interpolation-filters:srgb}.c{flood-opacity:.31}</style><defs><linearGradient id="safari-a" x1="132.55" x2="134.37" y1="111.67" y2="-105.3" xlink:href="#safari-b"><stop offset="0" stop-color="#d2d2d2"/><stop offset=".53" stop-color="#f2f2f2"/><stop offset="1" stop-color="#fff"/></linearGradient><linearGradient id="safari-b" gradientUnits="userSpaceOnUse"/><linearGradient id="safari-c" x1="65.44" x2="67.4" y1="115.72" y2="17.14" xlink:href="#safari-b"><stop offset="0" stop-color="#005ad5"/><stop offset=".16" stop-color="#0875f0"/><stop offset=".31" stop-color="#218cee"/><stop offset=".63" stop-color="#27a5f3"/><stop offset=".81" stop-color="#25aaf2"/><stop offset="1" stop-color="#21aaef"/></linearGradient><linearGradient id="safari-d" x1="158.7" x2="176.28" y1="96.71" y2="79.53" xlink:href="#safari-b"><stop offset="0" stop-color="#c72e24"/><stop offset="1" stop-color="#fd3b2f"/></linearGradient><filter id="safari-e" class="b"><feFlood flood-opacity=".28"/><feComposite in2="SourceGraphic" operator="in"/><feGaussianBlur stdDeviation="3"/><feOffset dx=".3" dy="2.8"/><feComposite in="SourceGraphic"/></filter><filter id="safari-f" class="b"><feFlood class="c"/><feComposite class="c" in2="SourceGraphic" operator="out"/><feGaussianBlur flood-opacity=".3" stdDeviation=".7"/><feOffset dy="1.8"/><feComposite in2="SourceGraphic" operator="atop"/></filter><filter id="safari-g" class="b"><feFlood flood-opacity=".61"/><feComposite in2="SourceGraphic" operator="in"/><feGaussianBlur stdDeviation=".5"/><feOffset dx=".8" dy=".8"/><feComposite in="SourceGraphic" result="A"/><feColorMatrix values="0 0 0 -1 0 0 0 0 -1 0 0 0 0 -1 0 0 0 0 1 0"/><feFlood flood-opacity=".4"/><feComposite in2="A" operator="in"/><feGaussianBlur stdDeviation="3.8"/><feOffset dx="2.3" dy="3.3"/><feComposite in="A"/></filter><filter id="safari-h" width="110%" height="110%" x="-1%" y="-1%"><feGaussianBlur in="SourceAlpha" stdDeviation=".4"/><feOffset dx=".1" dy=".2"/><feComponentTransfer result="A"><feFuncA type="linear"/></feComponentTransfer><feFlood flood-color="rgba(0,0,0,0.5)"/><feComposite in2="A" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="safari-i" cx="-69.88" cy="69.29" r="54.01" gradientTransform="matrix(.9023 -.01249 .0377 2.7234 -9.44 -120.29)" xlink:href="#safari-b"><stop offset="0" stop-color="#24a5f3" stop-opacity=".01"/><stop offset="1" stop-color="#1e8ceb" stop-opacity=".98"/></radialGradient><radialGradient id="safari-j" cx="109.35" cy="13.76" r="93.08" gradientTransform="matrix(-.01822 1.0922 -1.042 -.01765 136.95 -115.33)" xlink:href="#safari-b"><stop offset="0" stop-opacity="0"/><stop offset=".96" stop-color="#5488d6" stop-opacity="0"/><stop offset="1" stop-color="#5d96eb"/></radialGradient></defs><rect width="220" height="220" x="22" y="-106.53" fill="url(#safari-a)" filter="url(#safari-e)" ry="49" transform="matrix(.56938 0 0 .56921 186.86 255.75)"/><g filter="url(#safari-f)" transform="translate(194.2 190.07)"><ellipse cx="67.77" cy="67.73" fill="url(#safari-c)" paint-order="stroke fill markers" rx="54.01" ry="53.98"/><ellipse cx="-69.88" cy="69.29" fill="url(#safari-i)" rx="54.01" ry="53.98" transform="translate(137.65 -1.55)"/></g><ellipse cx="120" cy="14.15" fill="url(#safari-j)" rx="93.08" ry="93.67" transform="matrix(.58082 0 0 .57636 192.3 249.63)"/><g filter="url(#safari-g)" transform="matrix(.58289 0 0 .56508 196.8 181.63)"><path fill="#cac7c8" d="m46 191.66.73.35 72.18-48.2-7.34-8.95L46 191.66Z"/><path fill="#fbfffc" d="m45.8 190.87.2.8 65.57-56.8-6.95-8.92-58.83 64.92Z"/><path fill="url(#safari-d)" d="m118.91 143.81-7.35-8.95 66.08-57.2.27.73-59 65.42Z"/><path fill="#fb645c" d="m104.62 125.95 6.94 8.92 66.08-57.2-.65-.35-72.37 48.63Z"/></g><path stroke="#fff" stroke-linecap="round" stroke-miterlimit="1" stroke-width="1.33" d="m286.59 278.44 3.14-2.14m-11.23-17.8 7.8-1.37m-8.32-2.9 3.78-.3m-3.3-12.47 7.8 1.38m-8.2 3.03 3.76.38m-1.2-13.05 7.47 2.73m-3.77-10.5 6.86 3.96m-1.87-10.96 6.07 5.09m.05-11.07 5.09 6.07m1.97-10.99 3.97 6.86m3.7-10.53 2.71 7.43m5.62-9.62 1.37 7.8m15.62-7.89-1.38 7.8m9.82-5.6-2.72 7.42m10.5-3.75-3.96 6.86m10.98-1.89-5.12 6.07m16.18 6.96-6.87 3.96m10.45 3.88-7.45 2.7m9.64 5.6-7.82 1.38m7.81 15.79-7.82-1.39m5.6 9.7-7.44-2.71m3.8 10.47-6.87-3.95m1.91 10.98-6.07-5.07m-.05 11.2-5.1-6.08m-1.95 10.99-4-6.88m-3.87 10.5-2.7-7.43m-5.61 9.61-1.37-7.78m-15.78 7.75 1.4-7.86m-9.7 5.58 2.72-7.47m-10.5 3.73 3.97-6.87m-10.96 1.9 5.08-6.03m-8.26 3.13 2.75-2.68m3.84 8.23 2.2-3.1m5.2 7.44 1.66-3.45m6.43 6.47 1.02-3.7m7.52 5.32.43-3.82m8.08 3.8-.31-3.84m8.81 2.33-.97-3.69m9.06.75-1.58-3.48m9.05-.76-2.16-3.18m8.78-2.38-2.68-2.73m8.24-3.85-3.11-2.2m7.42-5.2-3.47-1.67m6.42-6.41-3.7-1.03m5.17-7.46-3.78-.37m3.8-8.24-3.81.3m2.35-8.8-3.7.97m.8-9.06-3.49 1.61m-1.03-9.12-3.2 2.2m-2.12-8.62-2.72 2.7m-3.84-8.28-2.23 3.12m-5.21-7.45-1.66 3.44m-6.55-6.32-1.02 3.63m-7.42-5.2-.38 3.81m-8.09-3.66.28 3.8m-8.79-2.34.95 3.68m-8.9-.72 1.61 3.46m-9.06.82 2.18 3.16m-8.82 2.27 2.68 2.7m-8.25 3.85 3.1 2.23m-7.44 5.17 3.42 1.66m-6.3 6.36 3.7 1.05m-3.71 24.39 3.7-.91m-2.44 5.03 7.48-2.72m-5.86 6.73 3.5-1.61m-1.53 5.43 6.87-3.95m-13.33-20.52 7.96.01m41.16-41.44v-7.96m.02 98.74.01-7.94m49.33-41.4-7.95-.01" filter="url(#safari-h)" transform="translate(-65 7.73)"/></svg>`,
    'Edge': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 27600 27600" class="w-full h-full" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="edge-a" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0078d4"/><stop offset="1" stop-color="#0078d4"/></linearGradient><linearGradient id="edge-b" x1="6870" x2="24704" y1="18705" y2="18705" xlink:href="#edge-a"><stop offset="0" stop-color="#0c59a4"/><stop offset="1" stop-color="#114a8b"/></linearGradient><linearGradient id="edge-c" x1="16272" x2="5133" y1="10968" y2="23102" xlink:href="#edge-a"><stop offset="0" stop-color="#1b9de2"/><stop offset=".16" stop-color="#1595df"/><stop offset=".67" stop-color="#0680d7"/><stop offset="1" stop-color="#0078d4"/></linearGradient><radialGradient id="edge-d" cx="16720" cy="18747" r="9538" xlink:href="#edge-a"><stop offset=".72" stop-opacity="0"/><stop offset=".95" stop-opacity=".53"/><stop offset="1"/></radialGradient><radialGradient id="edge-e" cx="7130" cy="19866" r="14324" gradientTransform="matrix(.14843 -.98892 .79688 .1196 -8759 25542)" xlink:href="#edge-a"><stop offset=".76" stop-opacity="0"/><stop offset=".95" stop-opacity=".5"/><stop offset="1"/></radialGradient><radialGradient id="edge-f" cx="2523" cy="4680" r="20243" gradientTransform="matrix(-.03715 .99931 -2.12836 -.07913 13579 3530)" xlink:href="#edge-a"><stop offset="0" stop-color="#35c1f1"/><stop offset=".11" stop-color="#34c1ed"/><stop offset=".23" stop-color="#2fc2df"/><stop offset=".31" stop-color="#2bc3d2"/><stop offset=".67" stop-color="#36c752"/></radialGradient><radialGradient id="edge-g" cx="24247" cy="7758" r="9734" gradientTransform="matrix(.28109 .95968 -.78353 .22949 24510 -16292)" xlink:href="#edge-a"><stop offset="0" stop-color="#66eb6e"/><stop offset="1" stop-color="#66eb6e" stop-opacity="0"/></radialGradient></defs><path id="edge-h" d="M24105 20053a9345 9345 0 01-1053 472 10202 10202 0 01-3590 646c-4732 0-8855-3255-8855-7432 0-1175 680-2193 1643-2729-4280 180-5380 4640-5380 7253 0 7387 6810 8137 8276 8137 791 0 1984-230 2704-456l130-44a12834 12834 0 006660-5282c220-350-168-757-535-565z"/><path id="edge-i" d="M11571 25141a7913 7913 0 01-2273-2137 8145 8145 0 01-1514-4740 8093 8093 0 013093-6395 8082 8082 0 011373-859c312-148 846-414 1554-404a3236 3236 0 012569 1297 3184 3184 0 01636 1866c0-21 2446-7960-8005-7960-4390 0-8004 4166-8004 7820 0 2319 538 4170 1212 5604a12833 12833 0 007684 6757 12795 12795 0 003908 610c1414 0 2774-233 4045-656a7575 7575 0 01-6278-803z"/><path id="edge-j" d="M16231 15886c-80 105-330 250-330 566 0 260 170 512 472 723 1438 1003 4149 868 4156 868a5954 5954 0 003027-839 6147 6147 0 001133-850 6180 6180 0 001910-4437c26-2242-796-3732-1133-4392-2120-4141-6694-6525-11668-6525-7011 0-12703 5635-12798 12620 47-3654 3679-6605 7996-6605 350 0 2346 34 4200 1007 1634 858 2490 1894 3086 2921 618 1067 728 2415 728 2952s-271 1333-780 1990z"/><use fill="url(#edge-b)" xlink:href="#edge-h"/><use fill="url(#edge-d)" opacity=".35" xlink:href="#edge-h"/><use fill="url(#edge-c)" xlink:href="#edge-i"/><use fill="url(#edge-e)" opacity=".4" xlink:href="#edge-i"/><use fill="url(#edge-f)" xlink:href="#edge-j"/><use fill="url(#edge-g)" xlink:href="#edge-j"/></svg>`
  };
  return icons[browserName] || icons['Chrome'];
};

const loadPerformanceData = async () => {
  const componentId = getComponentId();
  if (!componentId) {
    performanceData.value = null;
    return;
  }

  performanceLoading.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    performanceData.value = response.data;
  } catch (error) {
    console.error('Error loading performance data:', error);
    performanceData.value = null;
  } finally {
    performanceLoading.value = false;
  }
};

const generatedCode = computed(() => {
  const props = Object.entries(propValues)
    .filter(([key, value]) => {
      if (key === 'label') return false; // Label is handled separately
      return value !== '' && value !== false && value !== null && value !== undefined;
    })
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  const label = propValues.label || 'Button';

  if (codeFormat.value === 'vue') {
    return `<button${props ? '\n' + props + '\n' : ''}>${label}</button>`;
  } else if (codeFormat.value === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<Button${reactProps ? '\n' + reactProps + '\n' : ''}>${label}</Button>`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<button${htmlProps}>${label}</button>`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const generateCodeForFormat = (format) => {
  const props = Object.entries(propValues)
    .filter(([key, value]) => {
      if (key === 'label') return false; // Label is handled separately
      return value !== '' && value !== false && value !== null && value !== undefined;
    })
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  const label = propValues.label || 'Button';

  if (format === 'vue') {
    return `<button${props ? '\n' + props + '\n' : ''}>${label}</button>`;
  } else if (format === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<Button${reactProps ? '\n' + reactProps + '\n' : ''}>${label}</Button>`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<button${htmlProps}>${label}</button>`;
  }
};

const exportAsVue = async () => {
  codeFormat.value = 'vue';
  await nextTick();
  const vueCode = generateCodeForFormat('vue');
  await navigator.clipboard.writeText(vueCode);
};

const exportAsReact = async () => {
  codeFormat.value = 'react';
  await nextTick();
  const reactCode = generateCodeForFormat('react');
  await navigator.clipboard.writeText(reactCode);
};

const exportAsHTML = async () => {
  codeFormat.value = 'html';
  await nextTick();
  const htmlCode = generateCodeForFormat('html');
  await navigator.clipboard.writeText(htmlCode);
};

const toggleFullscreen = () => {
  // Could implement fullscreen preview
};

// Component-specific version data - in a real app, this would come from an API
const componentVersions = ref([
  {
    version: '2.1.0',
    status: 'Current',
    description: 'Added loading state and improved accessibility',
    releasedAt: '2024-01-15',
    lastUpdated: '2024-01-20',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Added loading prop and spinner animation' },
      { type: 'added', description: 'Added aria-busy attribute for screen readers' },
      { type: 'improved', description: 'Enhanced focus indicators for better accessibility' },
      { type: 'fixed', description: 'Fixed button text alignment in small sizes' },
    ]
  },
  {
    version: '2.0.0',
    status: 'Stable',
    description: 'Major refactor with new variant system',
    releasedAt: '2023-12-01',
    breaking: true,
    migrationGuide: 'The "type" prop has been renamed to "variant". Update all instances: type="primary" → variant="primary"',
    changelog: [
      { type: 'breaking', description: 'Renamed "type" prop to "variant" for consistency' },
      { type: 'breaking', description: 'Removed "outline" variant, use "secondary" instead' },
      { type: 'added', description: 'Added "tertiary" variant' },
      { type: 'added', description: 'Added size prop (sm, md, lg)' },
      { type: 'improved', description: 'Improved button styling and hover states' },
    ]
  },
  {
    version: '1.5.2',
    status: 'Stable',
    description: 'Bug fixes and minor improvements',
    releasedAt: '2023-10-15',
    breaking: false,
    changelog: [
      { type: 'fixed', description: 'Fixed disabled state styling' },
      { type: 'fixed', description: 'Fixed button width in flex containers' },
    ]
  },
  {
    version: '1.5.0',
    status: 'Stable',
    description: 'Added new button variants',
    releasedAt: '2023-09-01',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Added "outline" variant' },
      { type: 'added', description: 'Added "ghost" variant' },
      { type: 'improved', description: 'Improved button spacing' },
    ]
  },
]);

const currentVersion = computed(() => {
  return componentVersions.value.find(v => v.status === 'Current') || componentVersions.value[0] || {};
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
  
  // Load performance data
  loadPerformanceData();
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

