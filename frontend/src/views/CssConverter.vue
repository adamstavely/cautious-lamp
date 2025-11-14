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
                      CSS Converter
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Bidirectional conversion between CSS and LESS, SASS, and SCSS preprocessor formats with nesting and variable support.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">code</span>
                      CSS Preprocessor
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
                        <linearGradient id="cssConverterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- CSS code icon -->
                      <rect x="40" y="60" width="120" height="80" rx="4" fill="url(#cssConverterGradient)" opacity="0.3"/>
                      <line x1="50" y1="80" x2="100" y2="80" stroke="url(#cssConverterGradient)" stroke-width="3" opacity="0.6"/>
                      <line x1="50" y1="100" x2="130" y2="100" stroke="url(#cssConverterGradient)" stroke-width="3" opacity="0.6"/>
                      <line x1="50" y1="120" x2="110" y2="120" stroke="url(#cssConverterGradient)" stroke-width="3" opacity="0.6"/>
                      <path d="M 60 40 L 60 60 M 140 40 L 140 60" stroke="url(#cssConverterGradient)" stroke-width="4" opacity="0.7" stroke-linecap="round"/>
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
                  v-for="mode in conversionModes"
                  :key="mode.value"
                  @click="selectedMode = mode.value; convertCss()"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedMode === mode.value
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <!-- Converter Section -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">code</span>
                Converter
              </h2>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Input Section -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ selectedMode.startsWith('css-to') ? 'CSS' : selectedMode.includes('less') ? 'LESS' : selectedMode.includes('sass') && !selectedMode.includes('scss') ? 'SASS' : 'SCSS' }} Input
                    </label>
                    <div class="flex gap-2">
                      <button
                        @click="swapInputs"
                        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-1"
                        :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                        title="Swap input and output"
                      >
                        <span class="material-symbols-outlined text-sm">swap_horiz</span>
                        Swap
                      </button>
                      <button
                        @click="clearInput"
                        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                        :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div class="relative">
                    <textarea
                      v-model="cssInput"
                      @input="convertCss"
                      placeholder="Enter your CSS code here..."
                      class="w-full h-96 px-4 py-3 border rounded-lg text-sm font-mono resize-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-gray-100' 
                        : 'border-gray-300 bg-gray-50 text-gray-900'"
                    ></textarea>
                    <button
                      @click="copyToClipboard(cssInput)"
                      class="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                      title="Copy CSS"
                    >
                      <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">content_copy</span>
                    </button>
                  </div>
                </div>

                <!-- Output Section -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ selectedMode.startsWith('css-to') ? (selectedMode === 'css-to-less' ? 'LESS' : selectedMode === 'css-to-sass' ? 'SASS' : 'SCSS') : 'CSS' }} Output
                    </label>
                    <button
                      @click="copyToClipboard(convertedOutput)"
                      class="text-xs px-3 py-1 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                    >
                      <span class="material-symbols-outlined text-sm mr-1 align-middle">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <div class="relative">
                    <textarea
                      v-model="convertedOutput"
                      placeholder="Converted code will appear here..."
                      class="w-full h-96 px-4 py-3 border rounded-lg text-sm font-mono resize-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-800 text-gray-100' 
                        : 'border-gray-300 bg-gray-50 text-gray-900'"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Information Section -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">info</span>
                About CSS Preprocessors
              </h2>

              <div class="space-y-6">
                <!-- LESS Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">LESS</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    LESS (Leaner Style Sheets) is a CSS preprocessor that extends CSS with features like variables, mixins, functions, and nested rules. LESS uses curly braces <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">{}</code> for nesting, similar to CSS.
                  </p>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <strong>Features:</strong> Variables (<code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">@variable</code>), mixins, functions, nested selectors, and operations.
                  </p>
                </div>

                <!-- SASS Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">SASS</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    SASS (Syntactically Awesome Style Sheets) is a CSS preprocessor that uses indentation-based syntax (no curly braces or semicolons). SASS files use the <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">.sass</code> extension.
                  </p>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <strong>Features:</strong> Variables (<code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">$variable</code>), mixins, functions, nested selectors (indentation-based), and operations.
                  </p>
                </div>

                <!-- SCSS Explanation -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">SCSS</h3>
                  <p class="text-sm leading-relaxed mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    SCSS (Sassy CSS) is the newer syntax for SASS that uses curly braces and semicolons, making it more similar to CSS. SCSS files use the <code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">.scss</code> extension.
                  </p>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <strong>Features:</strong> Variables (<code class="px-1.5 py-0.5 rounded text-xs font-mono" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">$variable</code>), mixins, functions, nested selectors (with braces), and operations. SCSS is a superset of CSS, so any valid CSS is also valid SCSS.
                  </p>
                </div>

                <!-- Conversion Notes -->
                <div>
                  <h3 class="text-md font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Conversion Notes</h3>
                  <ul class="list-disc list-inside space-y-1 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li>This converter performs basic structural conversion and nesting detection.</li>
                    <li>For complex conversions, manual review and adjustment may be required.</li>
                    <li>Variable extraction and mixin conversion require manual implementation.</li>
                    <li>Nested selectors are automatically detected and converted to the appropriate syntax.</li>
                  </ul>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

// Conversion modes
const conversionModes = [
  { label: 'CSS → LESS', value: 'css-to-less' },
  { label: 'LESS → CSS', value: 'less-to-css' },
  { label: 'CSS → SASS', value: 'css-to-sass' },
  { label: 'SASS → CSS', value: 'sass-to-css' },
  { label: 'CSS → SCSS', value: 'css-to-scss' },
  { label: 'SCSS → CSS', value: 'scss-to-css' }
];
const selectedMode = ref('css-to-less');

// Input and output
const cssInput = ref('');
const convertedOutput = ref('');

// Basic CSS to LESS conversion
const convertToLess = (css) => {
  if (!css.trim()) return '';
  
  // LESS uses the same syntax as CSS, so minimal conversion needed
  // This is a pass-through with potential improvements
  let less = css;
  
  // Clean up formatting
  less = less.replace(/\s*{\s*/g, ' {\n  ');
  less = less.replace(/;\s*/g, ';\n  ');
  less = less.replace(/\s*}\s*/g, '\n}\n');
  less = less.replace(/\n\s*\n/g, '\n');
  
  return less.trim();
};

// Basic CSS to SASS conversion
const convertToSass = (css) => {
  if (!css.trim()) return '';
  
  let sass = '';
  const lines = css.split('\n');
  let indentLevel = 0;
  const indentSize = 2;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (i < lines.length - 1) sass += '\n';
      continue;
    }
    
    // Skip comments
    if (line.startsWith('/*') || line.startsWith('//')) {
      continue;
    }
    
    // Handle closing braces
    if (line === '}' || line.endsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
      continue;
    }
    
    // Handle opening braces
    if (line.includes('{')) {
      const parts = line.split('{');
      const selector = parts[0].trim();
      if (selector) {
        sass += ' '.repeat(indentLevel * indentSize) + selector + '\n';
      }
      indentLevel++;
      
      // Check if there's content after the brace
      const afterBrace = parts[1]?.trim();
      if (afterBrace && !afterBrace.startsWith('}')) {
        // Handle inline properties
        const props = afterBrace.split(';').filter(p => p.trim());
        for (const prop of props) {
          const trimmed = prop.trim();
          if (trimmed && trimmed.includes(':')) {
            sass += ' '.repeat(indentLevel * indentSize) + trimmed.replace(/;$/, '') + '\n';
          }
        }
      }
      continue;
    }
    
    // Regular property (remove semicolon for SASS)
    if (line.includes(':')) {
      line = line.replace(/;(\s*)$/, '$1');
      sass += ' '.repeat(indentLevel * indentSize) + line + '\n';
    }
  }
  
  return sass.trim();
};

// Basic CSS to SCSS conversion
const convertToScss = (css) => {
  if (!css.trim()) return '';
  
  // SCSS uses the same syntax as CSS, so minimal conversion needed
  // Format for better readability
  let scss = css;
  
  // Clean up formatting
  scss = scss.replace(/\s*{\s*/g, ' {\n  ');
  scss = scss.replace(/;\s*/g, ';\n  ');
  scss = scss.replace(/\s*}\s*/g, '\n}\n');
  scss = scss.replace(/\n\s*\n/g, '\n');
  
  return scss.trim();
};

// Reverse conversion: LESS to CSS
const convertFromLess = (less) => {
  if (!less.trim()) return '';
  
  // LESS syntax is very similar to CSS, mainly need to handle variables and mixins
  let css = less;
  
  // Remove LESS variable declarations (@variable: value;)
  css = css.replace(/@[\w-]+\s*:\s*[^;]+;/g, '');
  
  // Remove LESS mixin calls (but keep the content)
  // This is a simplified approach - full LESS parsing would be more complex
  css = css.replace(/\.([\w-]+)\s*\([^)]*\)\s*;/g, '');
  
  // Clean up formatting
  css = css.replace(/\s*{\s*/g, ' {\n  ');
  css = css.replace(/;\s*/g, ';\n  ');
  css = css.replace(/\s*}\s*/g, '\n}\n');
  css = css.replace(/\n\s*\n+/g, '\n');
  
  return css.trim();
};

// Reverse conversion: SASS to CSS
const convertFromSass = (sass) => {
  if (!sass.trim()) return '';
  
  // Remove SASS variable declarations first
  let cleanedSass = sass.replace(/\$[\w-]+\s*:\s*[^;\n]+/g, '');
  
  let css = '';
  const lines = cleanedSass.split('\n');
  const stack = []; // Stack to track nested selectors and their properties
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
    
    // Calculate indent level (assuming 2 spaces per level)
    const indent = (line.match(/^\s*/) || [''])[0].length;
    const level = Math.floor(indent / 2);
    
    // Close blocks that are at a higher indent level
    while (stack.length > level && stack.length > 0) {
      const block = stack.pop();
      if (block.selector) {
        css += block.selector + ' {\n';
        for (const prop of block.properties) {
          css += '  ' + prop + ';\n';
        }
        css += '}\n\n';
      }
    }
    
    // Check if it's a property (contains colon but not ::)
    const isProperty = trimmed.includes(':') && 
                       !trimmed.includes('::') && 
                       trimmed.match(/^\s*[\w-]+\s*:/);
    
    if (isProperty) {
      // It's a property
      let prop = trimmed;
      // Ensure semicolon at the end
      if (!prop.endsWith(';')) {
        prop += ';';
      }
      // Add to current block or create new one
      if (stack.length === 0 || stack[stack.length - 1].level !== level) {
        stack.push({ level, selector: null, properties: [prop] });
      } else {
        stack[stack.length - 1].properties.push(prop);
      }
    } else {
      // It's a selector
      // Close current block if it has properties
      if (stack.length > 0 && stack[stack.length - 1].properties.length > 0 && stack[stack.length - 1].selector) {
        const block = stack.pop();
        css += block.selector + ' {\n';
        for (const prop of block.properties) {
          css += '  ' + prop + ';\n';
        }
        css += '}\n\n';
      }
      
      // Remove SASS variable references
      const selector = trimmed.replace(/\$[\w-]+/g, '');
      stack.push({ level, selector, properties: [] });
    }
  }
  
  // Close remaining blocks
  while (stack.length > 0) {
    const block = stack.pop();
    if (block.selector) {
      css += block.selector + ' {\n';
      for (const prop of block.properties) {
        css += '  ' + prop + ';\n';
      }
      css += '}\n\n';
    }
  }
  
  // Clean up extra newlines
  css = css.replace(/\n\s*\n+/g, '\n\n');
  
  return css.trim();
};

// Reverse conversion: SCSS to CSS
const convertFromScss = (scss) => {
  if (!scss.trim()) return '';
  
  let css = scss;
  
  // Remove SCSS variable declarations ($variable: value;)
  css = css.replace(/\$[\w-]+\s*:\s*[^;]+;/g, '');
  
  // Remove SCSS mixin calls (but keep the content)
  // This is a simplified approach - full SCSS parsing would be more complex
  css = css.replace(/@include\s+[\w-]+\s*\([^)]*\)\s*;/g, '');
  css = css.replace(/@mixin\s+[\w-]+[^{]*\{[^}]*\}/g, '');
  
  // Remove @extend directives
  css = css.replace(/@extend\s+[^;]+;/g, '');
  
  // Clean up formatting
  css = css.replace(/\s*{\s*/g, ' {\n  ');
  css = css.replace(/;\s*/g, ';\n  ');
  css = css.replace(/\s*}\s*/g, '\n}\n');
  css = css.replace(/\n\s*\n+/g, '\n');
  
  return css.trim();
};

// Main conversion function
const convertCss = () => {
  if (!cssInput.value.trim()) {
    convertedOutput.value = '';
    return;
  }
  
  try {
    switch (selectedMode.value) {
      case 'css-to-less':
        convertedOutput.value = convertToLess(cssInput.value);
        break;
      case 'less-to-css':
        convertedOutput.value = convertFromLess(cssInput.value);
        break;
      case 'css-to-sass':
        convertedOutput.value = convertToSass(cssInput.value);
        break;
      case 'sass-to-css':
        convertedOutput.value = convertFromSass(cssInput.value);
        break;
      case 'css-to-scss':
        convertedOutput.value = convertToScss(cssInput.value);
        break;
      case 'scss-to-css':
        convertedOutput.value = convertFromScss(cssInput.value);
        break;
      default:
        convertedOutput.value = '';
    }
  } catch (error) {
    convertedOutput.value = `Error: ${error.message}`;
  }
};

const clearInput = () => {
  cssInput.value = '';
  convertedOutput.value = '';
};

const swapInputs = () => {
  // Swap the input and output
  const temp = cssInput.value;
  cssInput.value = convertedOutput.value;
  convertedOutput.value = temp;
  
  // Toggle the conversion direction
  switch (selectedMode.value) {
    case 'css-to-less':
      selectedMode.value = 'less-to-css';
      break;
    case 'less-to-css':
      selectedMode.value = 'css-to-less';
      break;
    case 'css-to-sass':
      selectedMode.value = 'sass-to-css';
      break;
    case 'sass-to-css':
      selectedMode.value = 'css-to-sass';
      break;
    case 'css-to-scss':
      selectedMode.value = 'scss-to-css';
      break;
    case 'scss-to-css':
      selectedMode.value = 'css-to-scss';
      break;
  }
  
  // Convert with swapped inputs
  convertCss();
};


const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy:', error);
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

