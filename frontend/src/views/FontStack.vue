<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
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
                      Font Stack Builder
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Build optimal font stacks with fallback fonts. Ensure your text is always readable, even if the primary font fails to load.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Typography Tool
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
                        <linearGradient id="fontStackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized font stack icon -->
                      <rect x="30" y="30" width="140" height="20" rx="4" fill="url(#fontStackGradient)" opacity="0.8"/>
                      <rect x="30" y="60" width="140" height="20" rx="4" fill="url(#fontStackGradient)" opacity="0.6"/>
                      <rect x="30" y="90" width="140" height="20" rx="4" fill="url(#fontStackGradient)" opacity="0.4"/>
                      <rect x="30" y="120" width="140" height="20" rx="4" fill="url(#fontStackGradient)" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-3xl mx-auto">

          <!-- Info Box -->
          <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              <strong>What is a font stack?</strong> A font stack is a list of fonts in CSS that browsers try to use in order. If the first font isn't available, the browser falls back to the next font in the list. This ensures your text is always readable, even if the primary font fails to load. The builder helps you create an optimal CSS <code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">font-family</code> declaration with appropriate fallback fonts.
            </p>
          </div>
          
          <!-- Select Primary Font -->
          <div class="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Primary Font</label>
            <select 
              v-model="selectedFontForStack"
              @change="fontStack = buildFontStack(selectedFontForStack)"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <!-- Font Stack Builder -->
          <div v-if="selectedFontForStack" class="space-y-6">
            <!-- Pairs Well With -->
            <div v-if="getSelectedFontForStack()?.pairsWellWith && getSelectedFontForStack().pairsWellWith.length > 0" class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Pairs Well With</h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="pair in getSelectedFontForStack().pairsWellWith" 
                  :key="pair" 
                  @click="addToFontStack(pair)"
                  class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                  title="Click to add to font stack"
                >
                  {{ pair }}
                </button>
              </div>
            </div>
            
            <!-- Font Stack Display -->
            <div class="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Font Stack</div>
                <button @click="resetFontStack" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Reset to Default
                </button>
              </div>
              <div class="flex flex-wrap gap-2 items-center">
                <div 
                  v-for="(fontName, index) in fontStack" 
                  :key="`${fontName}-${index}`"
                  class="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 group"
                >
                  <span class="text-sm font-mono text-gray-900 dark:text-white">{{ fontName }}</span>
                  <button 
                    v-if="index > 0"
                    @click="removeFromFontStack(index)"
                    class="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from stack"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Manually Add Font -->
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Manually Add Font</label>
              <div class="flex gap-2">
                <input 
                  v-model="newFontInStack"
                  type="text"
                  placeholder="Type font name (e.g., Arial, Georgia)..."
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  @keyup.enter="addToFontStack(newFontInStack)"
                />
                <button 
                  @click="addToFontStack(newFontInStack)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            
            <!-- Preview -->
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preview</div>
              <div class="text-gray-900 dark:text-white leading-relaxed" :style="{ fontFamily: fontStack.join(', ') }">
                The quick brown fox jumps over the lazy dog. This demonstrates how the font stack falls back to system fonts if the primary font fails to load.
              </div>
            </div>
            
            <!-- CSS Output -->
            <div class="bg-gray-900 dark:bg-slate-900 rounded-lg border border-gray-700 dark:border-gray-600 p-6">
              <div class="mb-2 text-sm text-gray-400">CSS:</div>
              <div class="text-green-400 dark:text-green-300 font-mono text-sm break-all">
                font-family: {{ fontStack.map(f => `'${f}'`).join(', ') }};
              </div>
            </div>
            
            <!-- Copy Button -->
            <button @click="copyFontStack" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Copy CSS
            </button>
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
import fontData from '../assets/fonts.json';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedFontForStack = ref('');
const fontStack = ref(['Arial', 'Helvetica', 'sans-serif']);
const newFontInStack = ref('');
const defaultFontStack = ref(['Arial', 'Helvetica', 'sans-serif']);

function getSelectedFontForStack() {
  if (!selectedFontForStack.value) return null;
  return fontData.find(f => f.name === selectedFontForStack.value);
}

function addToFontStack(fontName) {
  if (!fontName || !fontName.trim()) return;
  const trimmed = fontName.trim();
  if (!fontStack.value.includes(trimmed)) {
    fontStack.value.push(trimmed);
  }
  newFontInStack.value = '';
}

function removeFromFontStack(index) {
  if (index > 0 && index < fontStack.value.length) {
    fontStack.value.splice(index, 1);
  }
}

function resetFontStack() {
  if (selectedFontForStack.value) {
    fontStack.value = buildFontStack(selectedFontForStack.value);
  } else {
    fontStack.value = [...defaultFontStack.value];
  }
}

function copyFontStack() {
  const css = `font-family: ${fontStack.value.map(f => `'${f}'`).join(', ')};`;
  navigator.clipboard.writeText(css).then(() => {
    alert('Font stack CSS copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy to clipboard');
  });
}

function buildFontStack(fontName) {
  const stacks = {
    'serif': [fontName, 'Georgia', 'Times New Roman', 'serif'],
    'sans-serif': [fontName, 'Arial', 'Helvetica', 'sans-serif'],
    'monospace': [fontName, 'Courier New', 'Courier', 'monospace'],
    'display': [fontName, 'Impact', 'Arial Black', 'sans-serif'],
    'handwriting': [fontName, 'cursive']
  };
  
  const font = fontData.find(f => f.name === fontName);
  if (font && font.tags && font.tags.length > 0) {
    return stacks[font.tags[0]] || stacks['sans-serif'];
  }
  return stacks['sans-serif'];
}

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

