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
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      HTML Escaper
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Escape and unescape HTML special characters. Convert HTML entities to their character equivalents and vice versa.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">code</span>
                      Developer Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="htmlEscaperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized HTML escape icon -->
                      <rect x="30" y="30" width="140" height="140" rx="4" fill="url(#htmlEscaperGradient)" opacity="0.3"/>
                      <text x="100" y="90" font-family="monospace" font-size="24" fill="white" text-anchor="middle">&lt;&gt;</text>
                      <text x="100" y="130" font-family="monospace" font-size="20" fill="white" text-anchor="middle">&amp;</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Conversion Mode Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">swap_horiz</span>
                Conversion Mode
              </h2>
              
              <div class="flex flex-wrap gap-2">
                <button
                  @click="conversionMode = 'escape'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'escape'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  Escape HTML
                </button>
                <button
                  @click="conversionMode = 'unescape'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'unescape'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  Unescape HTML
                </button>
              </div>
            </div>

            <div class="grid lg:grid-cols-2 gap-6">
              <!-- Left Column: Input -->
              <div 
                class="rounded-lg shadow-sm border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-indigo-600">input</span>
                      Input
                    </h2>
                    <div class="flex items-center gap-2">
                      <button
                        @click="clearInput"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Clear
                      </button>
                      <button
                        @click="copyInput"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <textarea
                    v-model="inputText"
                    @input="handleConversion"
                    :placeholder="conversionMode === 'escape' ? 'Enter HTML to escape...' : 'Enter escaped HTML to unescape...'"
                    class="w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm resize-none"
                    :class="isDarkMode 
                      ? 'bg-slate-950 text-gray-100 border-gray-700' 
                      : 'bg-gray-50 text-gray-900 border-gray-300'"
                  ></textarea>
                </div>
              </div>

              <!-- Right Column: Output -->
              <div 
                class="rounded-lg shadow-sm border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-indigo-600">output</span>
                      Output
                    </h2>
                    <div class="flex items-center gap-2">
                      <button
                        @click="copyOutput"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        Copy
                      </button>
                      <button
                        @click="downloadOutput"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <textarea
                    :value="outputText"
                    readonly
                    placeholder="Converted output will appear here..."
                    class="w-full h-64 px-4 py-3 border rounded-lg font-mono text-sm resize-none"
                    :class="isDarkMode 
                      ? 'bg-slate-950 text-gray-100 border-gray-700' 
                      : 'bg-gray-50 text-gray-900 border-gray-300'"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Information Sections -->
            <div class="space-y-6 mt-6">
              <!-- What Is Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">info</span>
                  What Is HTML Escaping
                </h2>
                <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  HTML escaping is the process of converting special characters in HTML to their corresponding HTML entities. This is essential for displaying HTML code as text, preventing XSS attacks, and ensuring proper rendering in web applications.
                </p>
              </div>

              <!-- Common Characters Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">list</span>
                  Common HTML Entities
                </h2>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&lt;</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;lt;</code>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&gt;</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;gt;</code>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;amp;</code>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">"</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;quot;</code>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">'</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;#39;</code>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">©</code>
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">→</span>
                      <code class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'">&amp;copy;</code>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Use Cases Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">apps</span>
                  Common Use Cases
                </h2>
                <ul class="list-disc list-inside space-y-2 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Preventing XSS (Cross-Site Scripting) attacks by escaping user input</li>
                  <li>Displaying HTML code as text in documentation or tutorials</li>
                  <li>Encoding special characters in URLs and data attributes</li>
                  <li>Converting HTML entities back to readable text</li>
                  <li>Preparing content for safe storage in databases</li>
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

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const conversionMode = ref('escape');
const inputText = ref('');

const outputText = computed(() => {
  if (!inputText.value) return '';
  
  if (conversionMode.value === 'escape') {
    return escapeHTML(inputText.value);
  } else {
    return unescapeHTML(inputText.value);
  }
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

const unescapeHTML = (text) => {
  // Named entities - must be replaced first
  const namedEntities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
  };
  
  // Replace named entities
  let result = text;
  for (const [entity, char] of Object.entries(namedEntities)) {
    result = result.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
  }
  
  // Then replace numeric entities (decimal) - must come after named entities
  result = result.replace(/&#(\d+);/g, (match, dec) => {
    const code = parseInt(dec, 10);
    // Only replace valid character codes
    if (code >= 0 && code <= 0x10FFFF) {
      return String.fromCharCode(code);
    }
    return match;
  });
  
  // Then replace numeric entities (hexadecimal)
  result = result.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
    const code = parseInt(hex, 16);
    // Only replace valid character codes
    if (code >= 0 && code <= 0x10FFFF) {
      return String.fromCharCode(code);
    }
    return match;
  });
  
  return result;
};

const handleConversion = () => {
  // Conversion happens automatically via computed property
};

const clearInput = () => {
  inputText.value = '';
};

const copyInput = async () => {
  if (!inputText.value) return;
  
  try {
    await navigator.clipboard.writeText(inputText.value);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const copyOutput = async () => {
  if (!outputText.value) return;
  
  try {
    await navigator.clipboard.writeText(outputText.value);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const downloadOutput = () => {
  if (!outputText.value) return;
  
  const blob = new Blob([outputText.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `html-${conversionMode.value === 'escape' ? 'escaped' : 'unescaped'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Watch for mode changes to update output
watch(conversionMode, () => {
  // Output updates automatically via computed property
});

onMounted(() => {
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

