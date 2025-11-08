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
          <div 
            class="mb-6 p-4 border rounded-lg" 
            :class="isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'"
          >
            <p 
              class="text-sm" 
              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
            >
              <strong>What is a font stack?</strong> A font stack is a list of fonts in CSS that browsers try to use in order. If the first font isn't available, the browser falls back to the next font in the list. This ensures your text is always readable, even if the primary font fails to load. The builder helps you create an optimal CSS <code 
                class="px-1 py-0.5 rounded text-xs font-mono" 
                :class="isDarkMode ? 'bg-blue-800' : 'bg-blue-100'"
              >font-family</code> declaration with appropriate fallback fonts.
            </p>
          </div>
          
          <!-- Select Primary Font -->
          <div 
            class="mb-6 rounded-lg border p-6" 
            :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
          >
            <label 
              class="text-sm font-medium mb-2 block flex items-center gap-2" 
              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
            >
              <span class="material-symbols-outlined text-indigo-600">font_download</span>
              Select Primary Font
            </label>
            <Dropdown
              :model-value="selectedFontForStack"
              @update:model-value="selectedFontForStack = $event; fontStack = buildFontStack($event)"
              :options="fontOptions"
              :is-dark-mode="isDarkMode"
            />
          </div>
          
          <!-- Font Stack Builder -->
          <div v-if="selectedFontForStack" class="space-y-6">
            <!-- Pairs Well With -->
            <div 
              v-if="getSelectedFontForStack()?.pairsWellWith && getSelectedFontForStack().pairsWellWith.length > 0" 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <h4 
                class="font-semibold mb-3" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                Pairs Well With
              </h4>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="pair in getSelectedFontForStack().pairsWellWith" 
                  :key="pair" 
                  @click="addToFontStack(pair)"
                  class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  :class="isDarkMode 
                    ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'"
                  title="Click to add to font stack"
                >
                  {{ pair }}
                </button>
              </div>
            </div>
            
            <!-- Font Stack Display -->
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
            >
              <div class="flex items-center justify-between mb-3">
                <div 
                  class="text-sm font-medium" 
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                >
                  Font Stack
                </div>
                <button 
                  @click="resetFontStack" 
                  class="text-xs transition-colors"
                  :class="isDarkMode 
                    ? 'text-indigo-400 hover:text-indigo-300' 
                    : 'text-indigo-600 hover:text-indigo-700'"
                >
                  Reset to Default
                </button>
              </div>
              <div class="flex flex-wrap gap-2 items-center">
                <div 
                  v-for="(fontName, index) in fontStack" 
                  :key="`${fontName}-${index}`"
                  class="px-3 py-1 border rounded-lg flex items-center gap-2 group"
                  :class="isDarkMode 
                    ? 'bg-slate-700 border-gray-600' 
                    : 'bg-white border-gray-300'"
                >
                  <span 
                    class="text-sm font-mono" 
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    {{ fontName }}
                  </span>
                  <button 
                    v-if="index > 0"
                    @click="removeFromFontStack(index)"
                    class="transition-colors opacity-0 group-hover:opacity-100"
                    :class="isDarkMode 
                      ? 'text-gray-500 hover:text-red-400' 
                      : 'text-gray-400 hover:text-red-600'"
                    title="Remove from stack"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Manually Add Font -->
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <label 
                class="text-sm font-medium mb-2 block" 
                :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
              >
                Manually Add Font
              </label>
              <div class="flex gap-2">
                <input 
                  v-model="newFontInStack"
                  type="text"
                  placeholder="Type font name (e.g., Arial, Georgia)..."
                  class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-500' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
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
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div 
                class="text-sm font-medium mb-2" 
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
              >
                Preview
              </div>
              <div 
                class="leading-relaxed" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                :style="{ fontFamily: fontStack.join(', ') }"
              >
                The quick brown fox jumps over the lazy dog. This demonstrates how the font stack falls back to system fonts if the primary font fails to load.
              </div>
            </div>
            
            <!-- CSS Output -->
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-900 border-gray-600' : 'bg-gray-900 border-gray-700'"
            >
              <div class="mb-2 text-sm text-gray-400">CSS:</div>
              <div 
                class="font-mono text-sm break-all" 
                :class="isDarkMode ? 'text-green-300' : 'text-green-400'"
              >
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import fontData from '../assets/fonts.json';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedFontForStack = ref('');
const fontStack = ref(['Arial', 'Helvetica', 'sans-serif']);
const newFontInStack = ref('');
const defaultFontStack = ref(['Arial', 'Helvetica', 'sans-serif']);

// Create font options for dropdown
const fontOptions = computed(() => {
  return [
    { label: 'Choose a font...', value: '' },
    ...fontData.map(font => ({ label: font.name, value: font.name }))
  ];
});

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

