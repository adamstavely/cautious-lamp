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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

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

