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
                      Color Picker
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    A comprehensive color picker component with gradient selector, hue slider, and multiple color format support (RGB, HSL, CMYK, Hex).
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
                        <linearGradient id="colorPickerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Color picker icon -->
                      <rect x="50" y="50" width="100" height="100" rx="8" fill="url(#colorPickerGradient)" opacity="0.8"/>
                      <circle cx="100" cy="100" r="30" fill="white" opacity="0.3"/>
                      <circle cx="100" cy="100" r="20" fill="url(#colorPickerGradient)" opacity="0.9"/>
                      <rect x="60" y="160" width="80" height="8" rx="4" fill="url(#colorPickerGradient)" opacity="0.6"/>
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
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Experiment with the ColorPicker component. Click the color swatch to open the picker.</p>
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
                        Initial Color
                      </label>
                      <input
                        v-model="propValues.initialColor"
                        type="text"
                        placeholder="#000000"
                        class="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                      <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        Hex color value (e.g., #4f46e5)
                      </div>
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
                  </div>
                </div>
                <div class="p-8 min-h-[400px] flex items-center justify-center" :class="previewDarkMode ? 'bg-slate-950 dark' : 'bg-gray-50'">
                  <div class="text-center">
                    <p class="text-sm mb-4" :class="previewDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Click the color swatch to open the picker
                    </p>
                    <button
                      @click.stop="openPicker($event)"
                      class="w-20 h-20 rounded-lg border-2 cursor-pointer transition-colors shadow-lg hover:scale-105"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: selectedColor }"
                      :title="`Current color: ${selectedColor}. Click to change.`"
                      aria-label="Open color picker"
                    ></button>
                    <p class="text-xs mt-2 font-mono" :class="previewDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ selectedColor }}
                    </p>
                  </div>
                  
                  <!-- Color Picker -->
                  <ColorPicker
                    :show="showPicker"
                    :initial-color="selectedColor"
                    :position="pickerPosition"
                    :preview-dark-mode="previewDarkMode"
                    @update:show="showPicker = $event"
                    @apply="handleColorApply"
                    @cancel="showPicker = false"
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
                </div>
              </div>
              <div class="p-6">
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>{{ generatedCode }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Examples -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Usage Examples</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Common patterns and use cases for the ColorPicker component.</p>
            </div>
            
            <div class="space-y-8">
              <!-- Basic Usage -->
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Basic Usage</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Simple color picker with a button trigger.</p>
                </div>
                <div class="rounded-lg p-6 mb-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <button
                    @click="openExamplePicker1($event)"
                    class="w-16 h-16 rounded-lg border-2 cursor-pointer transition-colors"
                    :class="isDarkMode 
                      ? 'border-gray-600 hover:border-indigo-400' 
                      : 'border-gray-300 hover:border-indigo-500'"
                    :style="{ backgroundColor: exampleColor }"
                  ></button>
                  <ColorPicker
                    :show="exampleShowPicker"
                    :initial-color="exampleColor"
                    :position="examplePickerPosition1"
                    :preview-dark-mode="isDarkMode"
                    @update:show="exampleShowPicker = $event"
                    @apply="exampleColor = $event"
                    @cancel="exampleShowPicker = false"
                  />
                </div>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>&lt;template&gt;
  &lt;button
    @click="showPicker = !showPicker"
    :style="{ backgroundColor: selectedColor }"
  &gt;&lt;/button&gt;
  
  &lt;ColorPicker
    :show="showPicker"
    :initial-color="selectedColor"
    :position="{ left: 200, top: 200 }"
    @update:show="showPicker = $event"
    @apply="selectedColor = $event"
    @cancel="showPicker = false"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue';
import ColorPicker from './components/ColorPicker.vue';

const showPicker = ref(false);
const selectedColor = ref('#4f46e5');
&lt;/script&gt;</code></pre>
                </div>
              </div>

              <!-- With Positioning -->
              <div 
                class="rounded-2xl border p-8"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="mb-6">
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Dynamic Positioning</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Position the picker relative to a button or element.</p>
                </div>
                <div class="rounded-lg p-6 mb-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="flex gap-4">
                    <button
                      v-for="(color, index) in exampleColors"
                      :key="index"
                      @click="openExamplePicker(index, $event)"
                      class="w-16 h-16 rounded-lg border-2 cursor-pointer transition-colors"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: color }"
                    ></button>
                  </div>
                  <ColorPicker
                    :show="exampleShowPicker2"
                    :initial-color="exampleColor2"
                    :position="examplePickerPosition"
                    :preview-dark-mode="isDarkMode"
                    @update:show="exampleShowPicker2 = $event"
                    @apply="handleExampleApply"
                    @cancel="exampleShowPicker2 = false"
                  />
                </div>
                <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <pre class="text-green-400 text-sm font-mono"><code>const openColorPicker = (index, event) => {
  const rect = event.target.getBoundingClientRect();
  const pickerWidth = 280;
  const pickerHeight = 400;
  
  let left = rect.right + 16;
  let top = rect.top;
  
  // Adjust if picker would go off screen
  if (left + pickerWidth > window.innerWidth) {
    left = rect.left - pickerWidth - 16;
  }
  
  pickerPosition.value = { left, top };
  showPicker.value = true;
};</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Props/API Documentation -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">API Reference</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Complete list of props and events available for the ColorPicker component.</p>
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
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">show</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">Boolean</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">false</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Controls the visibility of the color picker.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">initialColor</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">String</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">'#000000'</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        The initial color value in hex format (e.g., '#4f46e5').
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">position</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">Object</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">{ left: 0, top: 0 }</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Position object with <code class="text-xs">left</code> and <code class="text-xs">top</code> properties in pixels. Uses fixed positioning.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Events Table -->
            <div 
              class="rounded-2xl border overflow-hidden mt-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Events</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Event</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Payload</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Description</th>
                    </tr>
                  </thead>
                  <tbody :class="isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'">
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">@update:show</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">Boolean</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Emitted when the picker visibility changes. Use <code class="text-xs">v-model:show</code> for two-way binding.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">@apply</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">String</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Emitted when the user applies a color selection. Payload is the selected color in hex format.
                      </td>
                    </tr>
                    <tr 
                      class="transition-colors"
                      :class="isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">@cancel</code>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <code class="text-xs font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">-</code>
                      </td>
                      <td class="px-6 py-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Emitted when the user cancels the color selection (e.g., clicks outside or presses Escape).
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    The ColorPicker component is fully WCAG 2.1 AA compliant and includes comprehensive accessibility features.
                  </p>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Keyboard Navigation:</strong> All interactive elements are keyboard accessible. Use arrow keys to adjust saturation/lightness and hue values. Press <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">Esc</code> to close the picker.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>ARIA Labels:</strong> All inputs, buttons, and interactive elements have descriptive ARIA labels and roles. The gradient canvas and hue slider use <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">role="slider"</code> with proper <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-valuemin</code>, <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-valuemax</code>, and <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-valuenow</code> attributes.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Focus Management:</strong> The picker automatically focuses the gradient canvas when opened, and focus is properly trapped within the modal dialog.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Screen Reader Support:</strong> All color values are announced with <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-live="polite"</code> regions, and the color preview includes descriptive labels.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Color Contrast:</strong> All text and interactive elements meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text and UI components).</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Modal Dialog:</strong> The picker uses <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">role="dialog"</code> with <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-modal="true"</code> to properly announce it as a modal to screen readers.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span><strong>Form Labels:</strong> All input fields have associated labels using the <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">for</code> attribute or <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'">aria-label</code> for better screen reader support.</span>
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
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Related Components</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components that work well with ColorPicker or serve similar purposes.</p>
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
                  Form components often use color pickers for theme customization and color input fields.
                </p>
              </router-link>

              <router-link 
                to="/components/buttons" 
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">smart_button</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    Buttons
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Buttons can trigger color pickers for theme customization and color selection workflows.
                </p>
              </router-link>

              <router-link 
                to="/theme-builder" 
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    Theme Builder
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Theme Builder uses color pickers extensively for customizing design system colors and themes.
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
import ColorPicker from '../components/ColorPicker.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const previewDarkMode = ref(false);
const codeFormat = ref('vue');
const selectedColor = ref('#4f46e5');
const pickerPosition = ref({ left: 400, top: 200 });

const propValues = ref({
  initialColor: '#4f46e5'
});

const showPicker = ref(false);

// Example state
const exampleShowPicker = ref(false);
const exampleColor = ref('#6366f1');
const examplePickerPosition1 = ref({ left: 200, top: 200 });
const exampleShowPicker2 = ref(false);
const exampleColor2 = ref('#4f46e5');
const exampleColors = ref(['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc']);
const examplePickerPosition = ref({ left: 200, top: 200 });
const exampleColorIndex = ref(0);

const openPicker = (event) => {
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
  
  pickerPosition.value = { left, top };
  showPicker.value = true;
};

const handleColorApply = (color) => {
  selectedColor.value = color;
  propValues.value.initialColor = color;
  showPicker.value = false;
};

// Component-specific version data - in a real app, this would come from an API
const componentVersions = ref([
  {
    version: '1.0.0',
    status: 'Current',
    description: 'Initial release with full WCAG 2.1 AA compliance',
    releasedAt: '2024-01-15',
    lastUpdated: '2024-01-15',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Initial release of ColorPicker component' },
      { type: 'added', description: 'Gradient selector for saturation and lightness' },
      { type: 'added', description: 'Hue slider with full color spectrum' },
      { type: 'added', description: 'RGB, Hex, and CMYK color format support' },
      { type: 'added', description: 'Eyedropper tool integration' },
      { type: 'added', description: 'Full keyboard navigation support' },
      { type: 'added', description: 'WCAG 2.1 AA compliant with ARIA labels and roles' },
      { type: 'added', description: 'Dark mode support via previewDarkMode prop' },
      { type: 'added', description: 'Smart positioning to prevent off-screen display' },
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

const openExamplePicker1 = (event) => {
  const rect = event.target.getBoundingClientRect();
  const pickerWidth = 280;
  const pickerHeight = 400;
  const padding = 16;
  const gap = 16;
  
  let left = rect.right + gap;
  if (left + pickerWidth > window.innerWidth - padding) {
    left = rect.left - pickerWidth - gap;
  }
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  const spaceBelow = window.innerHeight - rect.bottom - padding;
  const spaceAbove = rect.top - padding;
  
  let top;
  if (spaceBelow >= pickerHeight) {
    top = rect.bottom + gap;
  } else if (spaceAbove >= pickerHeight) {
    top = rect.top - pickerHeight - gap;
  } else if (spaceAbove > spaceBelow) {
    top = Math.max(padding, rect.top - pickerHeight - gap);
  } else {
    top = Math.min(window.innerHeight - pickerHeight - padding, rect.bottom + gap);
  }
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  examplePickerPosition1.value = { left, top };
  exampleShowPicker.value = true;
};

const openExamplePicker = (index, event) => {
  exampleColorIndex.value = index;
  exampleColor2.value = exampleColors.value[index];
  const rect = event.target.getBoundingClientRect();
  const pickerWidth = 280;
  const pickerHeight = 400;
  const padding = 16;
  const gap = 16;
  
  let left = rect.right + gap;
  if (left + pickerWidth > window.innerWidth - padding) {
    left = rect.left - pickerWidth - gap;
  }
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  const spaceBelow = window.innerHeight - rect.bottom - padding;
  const spaceAbove = rect.top - padding;
  
  let top;
  if (spaceBelow >= pickerHeight) {
    top = rect.bottom + gap;
  } else if (spaceAbove >= pickerHeight) {
    top = rect.top - pickerHeight - gap;
  } else if (spaceAbove > spaceBelow) {
    top = Math.max(padding, rect.top - pickerHeight - gap);
  } else {
    top = Math.min(window.innerHeight - pickerHeight - padding, rect.bottom + gap);
  }
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  examplePickerPosition.value = { left, top };
  exampleShowPicker2.value = true;
};

const handleExampleApply = (color) => {
  exampleColors.value[exampleColorIndex.value] = color;
  exampleShowPicker2.value = false;
};

const generatedCode = computed(() => {
  if (codeFormat.value === 'vue') {
    return `<template>
  <button
    @click="showPicker = !showPicker"
    class="w-16 h-16 rounded-lg border-2 cursor-pointer"
    :style="{ backgroundColor: selectedColor }"
  ></button>
  
  <ColorPicker
    :show="showPicker"
    :initial-color="selectedColor"
    :position="pickerPosition"
    @update:show="showPicker = $event"
    @apply="selectedColor = $event"
    @cancel="showPicker = false"
  />
</template>

<script setup>
import { ref } from 'vue';
import ColorPicker from './components/ColorPicker.vue';

const showPicker = ref(false);
const selectedColor = ref('${propValues.value.initialColor}');
const pickerPosition = ref({ left: 200, top: 200 });
<\/script>`;
  }
  return '';
});

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

