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
                      HTML Viewer
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    View and render HTML, CSS, and JavaScript code in real-time. Preview your code exactly as it would appear in a web browser.
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
                        <linearGradient id="htmlViewerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized HTML viewer icon -->
                      <rect x="30" y="30" width="140" height="140" rx="4" fill="url(#htmlViewerGradient)" opacity="0.3"/>
                      <rect x="40" y="40" width="120" height="100" rx="2" fill="url(#htmlViewerGradient)" opacity="0.5"/>
                      <rect x="50" y="50" width="100" height="80" rx="2" fill="white" opacity="0.8"/>
                      <circle cx="70" cy="70" r="4" fill="url(#htmlViewerGradient)"/>
                      <circle cx="90" cy="70" r="4" fill="url(#htmlViewerGradient)"/>
                      <circle cx="110" cy="70" r="4" fill="url(#htmlViewerGradient)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-2 gap-6 mb-6">
              <!-- Left Column: Input -->
              <div 
                class="rounded-lg shadow-sm border"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        <span class="material-symbols-outlined text-indigo-600">code</span>
                        Input
                      </h2>
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="autoUpdate"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Auto Update</span>
                      </label>
                      <button
                        v-if="!autoUpdate"
                        @click="updateOutput"
                        class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        RUN
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tabs -->
                <div class="flex border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    @click="activeTab = tab.value"
                    class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
                    :class="activeTab === tab.value
                      ? (isDarkMode 
                        ? 'border-indigo-400 text-indigo-400' 
                        : 'border-indigo-600 text-indigo-600')
                      : (isDarkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300' 
                        : 'border-transparent text-gray-500 hover:text-gray-700')"
                  >
                    {{ tab.label }}
                  </button>
                </div>

                <!-- Editor -->
                <div class="relative">
                  <textarea
                    v-model="codeInputs[activeTab]"
                    @input="handleInput"
                    :placeholder="`Type or paste ${activeTab.toUpperCase()} here`"
                    class="w-full h-96 px-4 py-3 border-0 rounded-b-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm resize-none"
                    :class="isDarkMode 
                      ? 'bg-slate-950 text-gray-100' 
                      : 'bg-gray-50 text-gray-900'"
                  ></textarea>
                  
                  <!-- Editor Toolbar -->
                  <div class="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      @click="formatCode"
                      class="p-2 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-white hover:bg-gray-100 text-gray-700'"
                      title="Format"
                    >
                      <span class="material-symbols-outlined text-sm">format_align_left</span>
                    </button>
                    <button
                      @click="copyCode"
                      class="p-2 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-white hover:bg-gray-100 text-gray-700'"
                      title="Copy"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button
                      @click="resetCode"
                      class="p-2 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-white hover:bg-gray-100 text-gray-700'"
                      title="Reset"
                    >
                      <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                    <button
                      @click="downloadCode"
                      class="p-2 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-white hover:bg-gray-100 text-gray-700'"
                      title="Download"
                    >
                      <span class="material-symbols-outlined text-sm">download</span>
                    </button>
                    <button
                      @click="toggleFullscreen"
                      class="p-2 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-white hover:bg-gray-100 text-gray-700'"
                      title="Fullscreen"
                    >
                      <span class="material-symbols-outlined text-sm">fullscreen</span>
                    </button>
                  </div>
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
                  <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Output
                  </h2>
                </div>
                <div class="h-96 rounded-b-lg overflow-hidden">
                  <iframe
                    ref="outputFrame"
                    :srcdoc="renderedHTML"
                    class="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  ></iframe>
                </div>
              </div>
            </div>

            <!-- Information Sections -->
            <div class="space-y-6">
              <!-- What Is Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">info</span>
                  What Is an Online HTML Viewer
                </h2>
                <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  An Online HTML Beautifier/Viewer is a tool that allows you to view and render HTML code in real-time, showing exactly how the code would appear in a web browser. It is commonly used by developers, students, and designers to preview and test HTML code without needing to save it to a file or upload it to a server.
                </p>
              </div>

              <!-- What Does Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">check_circle</span>
                  What Does an HTML Viewer Online Do
                </h2>
                <ul class="list-disc list-inside space-y-2 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Renders HTML just like a web browser would.</li>
                  <li>Displays the visual output of HTML code instantly.</li>
                  <li>Helps spot errors or formatting issues in the layout.</li>
                  <li>Often supports live editing, where changes appear immediately.</li>
                </ul>
              </div>

              <!-- How to Use Section -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">help</span>
                  How to Use This HTML Code Viewer
                </h2>
                <ol class="list-decimal list-inside space-y-2 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li><strong>Input Your Code:</strong> Choose the HTML, CSS, or JS tab and start typing or paste your code directly into the editor.</li>
                  <li><strong>Auto Update & Manual Run:</strong> Auto Update is enabled by default, so changes appear instantly in the output; to update manually, simply uncheck it and click the RUN button.</li>
                  <li><strong>View the Output:</strong> See the live rendered result in the Output section below the editor.</li>
                  <li><strong>Use the Editor Toolbar:</strong> Use the right-side toolbar to format, copy, reset, download, or enter fullscreen mode.</li>
                </ol>
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
                  Common Use Cases of this HTML Visualizer
                </h2>
                <ul class="list-disc list-inside space-y-2 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Previewing static webpages or email templates</li>
                  <li>Learning and experimenting with HTML tags</li>
                  <li>Debugging HTML code</li>
                  <li>Quickly testing code snippets shared online.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <div
      v-if="isFullscreen"
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col"
      @click.self="isFullscreen = false"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 class="text-white font-semibold">Fullscreen Editor</h3>
        <button
          @click="isFullscreen = false"
          class="p-2 rounded hover:bg-gray-800 text-white"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="flex-1 p-4">
        <textarea
          v-model="codeInputs[activeTab]"
          @input="handleInput"
          :placeholder="`Type or paste ${activeTab.toUpperCase()} here`"
          class="w-full h-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm resize-none"
          :class="isDarkMode 
            ? 'bg-slate-950 text-gray-100 border-gray-700' 
            : 'bg-gray-50 text-gray-900 border-gray-300'"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const autoUpdate = ref(true);
const activeTab = ref('html');
const isFullscreen = ref(false);
const outputFrame = ref(null);

const tabs = [
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JS', value: 'js' }
];

const codeInputs = ref({
  html: '<h1>Hello, World!</h1>\n<p>Welcome to the HTML Viewer.</p>',
  css: 'h1 {\n  color: #4f46e5;\n  font-size: 2rem;\n}\n\np {\n  color: #64748b;\n}',
  js: 'console.log("Hello from JavaScript!");\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Page loaded!");\n});'
});

const renderedHTML = computed(() => {
  const html = codeInputs.value.html || '';
  const css = codeInputs.value.css || '';
  const js = codeInputs.value.js || '';
  
  // Escape script tag to avoid Vue template parser issues
  const scriptOpen = '<script>';
  const scriptClose = '</' + 'script>';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Viewer Output</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  ${scriptOpen}
    ${js}
  ${scriptClose}
</body>
</html>`;
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const handleInput = () => {
  if (autoUpdate.value) {
    updateOutput();
  }
};

const updateOutput = () => {
  // Force iframe reload
  if (outputFrame.value) {
    outputFrame.value.srcdoc = renderedHTML.value;
  }
};

const formatCode = () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  try {
    if (activeTab.value === 'html') {
      // Basic HTML formatting
      let formatted = code
        .replace(/>\s+</g, '><')
        .replace(/></g, '>\n<');
      
      // Add indentation
      let indent = 0;
      const lines = formatted.split('\n');
      formatted = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        const result = '  '.repeat(indent) + trimmed;
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent++;
        }
        return result;
      }).join('\n');
      
      codeInputs.value[activeTab.value] = formatted;
    } else if (activeTab.value === 'css') {
      // Basic CSS formatting
      let formatted = code
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      codeInputs.value[activeTab.value] = formatted;
    } else if (activeTab.value === 'js') {
      // Basic JS formatting (very simple)
      let formatted = code
        .replace(/;\s*/g, ';\n')
        .replace(/\{\s*/g, ' {\n  ')
        .replace(/\}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      codeInputs.value[activeTab.value] = formatted;
    }
    
    if (autoUpdate.value) {
      updateOutput();
    }
  } catch (error) {
    console.error('Formatting error:', error);
  }
};

const copyCode = async () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  try {
    await navigator.clipboard.writeText(code);
    // You could add a toast notification here
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const resetCode = () => {
  if (confirm('Are you sure you want to reset the current tab?')) {
    codeInputs.value[activeTab.value] = '';
    if (autoUpdate.value) {
      updateOutput();
    }
  }
};

const downloadCode = () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  const extension = activeTab.value === 'html' ? 'html' : activeTab.value === 'css' ? 'css' : 'js';
  const blob = new Blob([code], { type: `text/${extension}` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// Watch for auto-update changes
watch(autoUpdate, (newVal) => {
  if (newVal) {
    updateOutput();
  }
});

// Watch for code changes when auto-update is enabled
watch(() => codeInputs.value, () => {
  if (autoUpdate.value) {
    updateOutput();
  }
}, { deep: true });

onMounted(() => {
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Initial render
  updateOutput();
});

onBeforeUnmount(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

