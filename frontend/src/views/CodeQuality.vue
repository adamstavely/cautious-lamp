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
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Code Quality Checks
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Lint, format, and enforce best practices. Ensure code quality across your design system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Check Options -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Check Types -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">checklist</span>
                Check Types
              </h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="checkTypes.linting" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Linting</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="checkTypes.formatting" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Formatting</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="checkTypes.bestPractices" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Best Practices</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="checkTypes.accessibility" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Accessibility</span>
                </label>
              </div>
            </div>

            <!-- File Upload -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">upload_file</span>
                Upload File
              </h3>
              <input
                type="file"
                @change="handleFileUpload"
                accept=".vue,.js,.ts,.jsx,.tsx"
                class="hidden"
                ref="fileInput"
                id="code-file"
              />
              <label
                for="code-file"
                class="block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 text-gray-300 hover:border-gray-500' 
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'"
              >
                <span class="material-symbols-outlined text-2xl mb-2 block">upload</span>
                <span class="text-sm">Click to upload code file</span>
              </label>
            </div>

            <!-- Run Checks -->
            <button
              @click="runChecks"
              :disabled="!uploadedCode && !selectedComponent"
              class="w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              :class="uploadedCode || selectedComponent
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              <span class="material-symbols-outlined text-base">play_arrow</span>
              Run Quality Checks
            </button>
          </div>

          <!-- Right Column: Results -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Quality Results -->
            <div 
              v-if="qualityResults"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">assessment</span>
                  Quality Check Results
                </h3>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-green-500">check_circle</span>
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ qualityResults.passed }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-red-500">error</span>
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ qualityResults.errors }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-yellow-500">warning</span>
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ qualityResults.warnings }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="issue in qualityResults.issues"
                  :key="issue.id"
                  class="p-4 rounded-lg border"
                  :class="issue.severity === 'error'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-sm" :class="issue.severity === 'error' ? 'text-red-500' : 'text-yellow-500'">
                        {{ issue.severity === 'error' ? 'error' : 'warning' }}
                      </span>
                      <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ issue.rule }}
                      </span>
                    </div>
                    <span class="text-xs font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Line {{ issue.line }}
                    </span>
                  </div>
                  <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ issue.message }}
                  </div>
                  <div v-if="issue.fix" class="rounded-lg overflow-hidden mt-2" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                    <div class="p-3">
                      <div class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ issue.fix }}</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Code Metrics -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">analytics</span>
                Code Metrics
              </h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    {{ codeMetrics.complexity }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Complexity</div>
                </div>
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    {{ codeMetrics.maintainability }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Maintainability</div>
                </div>
                <div class="text-center p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                    {{ codeMetrics.score }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Quality Score</div>
                </div>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');
const uploadedCode = ref('');
const fileInput = ref(null);
const checkTypes = ref({
  linting: true,
  formatting: true,
  bestPractices: true,
  accessibility: true
});
const qualityResults = ref(null);
const codeMetrics = ref({
  complexity: 8,
  maintainability: 85,
  score: 92
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedCode.value = e.target?.result || '';
  };
  reader.readAsText(file);
};

const runChecks = () => {
  if (!uploadedCode.value && !selectedComponent.value) return;
  
  qualityResults.value = {
    passed: 15,
    errors: 2,
    warnings: 5,
    issues: [
      {
        id: 1,
        rule: 'no-console',
        severity: 'warning',
        line: 12,
        message: 'Unexpected console statement',
        fix: '// Remove console.log or use logger utility'
      },
      {
        id: 2,
        rule: 'vue/require-v-for-key',
        severity: 'error',
        line: 45,
        message: 'Elements in v-for must have unique keys',
        fix: 'v-for="(item, index) in items" :key="item.id"'
      },
      {
        id: 3,
        rule: 'prefer-const',
        severity: 'warning',
        line: 23,
        message: 'let should be const',
        fix: 'const value = ...'
      }
    ]
  };
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

