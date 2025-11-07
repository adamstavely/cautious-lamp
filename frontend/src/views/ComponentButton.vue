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
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
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

          <!-- Live Preview Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div 
              class="rounded-2xl border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div 
                class="px-6 py-4 border-b"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              >
                <h2 class="text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">preview</span>
                  Live Preview
                </h2>
              </div>
              <div class="p-8" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <div class="flex flex-wrap items-center gap-4">
                  <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Primary
                  </button>
                  <button 
                    class="px-4 py-2 border border-indigo-600 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-700 text-indigo-400 hover:bg-slate-600' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'"
                  >
                    Secondary
                  </button>
                  <button 
                    class="px-4 py-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'"
                  >
                    Tertiary
                  </button>
                  <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors opacity-50 cursor-not-allowed" disabled>
                    Disabled
                  </button>
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
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;form @submit.prevent="handleSubmit"&gt;
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

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

