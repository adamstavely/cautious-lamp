<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  AI-Powered Suggestions
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Get intelligent recommendations for components, accessibility improvements, and design patterns powered by AI.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Input -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Component Analyzer -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Analyze Component
              </h3>
              <textarea
                v-model="componentCode"
                placeholder="Paste component code here..."
                rows="10"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
              ></textarea>
              <button
                @click="analyzeComponent"
                :disabled="!componentCode.trim()"
                class="w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors"
                :class="componentCode.trim()
                  ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                  : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
              >
                Analyze
              </button>
            </div>

            <!-- Quick Suggestions -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Quick Suggestions
              </h3>
              <div class="space-y-2">
                <button
                  @click="getAccessibilitySuggestions"
                  class="w-full px-4 py-2 rounded-lg text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'"
                >
                  <span class="material-symbols-outlined text-sm align-middle mr-2">accessibility</span>
                  Accessibility Improvements
                </button>
                <button
                  @click="getComponentRecommendations"
                  class="w-full px-4 py-2 rounded-lg text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'"
                >
                  <span class="material-symbols-outlined text-sm align-middle mr-2">lightbulb</span>
                  Component Recommendations
                </button>
                <button
                  @click="getPatternSuggestions"
                  class="w-full px-4 py-2 rounded-lg text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'"
                >
                  <span class="material-symbols-outlined text-sm align-middle mr-2">pattern</span>
                  Design Patterns
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Suggestions -->
          <div class="lg:col-span-2 space-y-6">
            <!-- AI Suggestions -->
            <div 
              v-if="suggestions.length > 0"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  AI Suggestions
                </h3>
                <button
                  @click="suggestions = []"
                  class="px-3 py-1 rounded text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Clear
                </button>
              </div>
              <div class="space-y-4">
                <div
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                  class="p-4 rounded-lg border"
                  :class="suggestion.type === 'error'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : suggestion.type === 'warning'
                    ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                    : (isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-sm" :class="suggestion.type === 'error' ? 'text-red-500' : suggestion.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'">
                        {{ suggestion.type === 'error' ? 'error' : suggestion.type === 'warning' ? 'warning' : 'info' }}
                      </span>
                      <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ suggestion.title }}
                      </span>
                    </div>
                    <span 
                      class="text-xs px-2 py-1 rounded"
                      :class="suggestion.category === 'accessibility'
                        ? (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700')
                        : suggestion.category === 'performance'
                        ? (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700')"
                    >
                      {{ suggestion.category }}
                    </span>
                  </div>
                  <div class="text-sm mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ suggestion.description }}
                  </div>
                  <div v-if="suggestion.fix" class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                    <div class="p-3">
                      <div class="text-xs font-semibold mb-2 text-green-400">Suggested Fix:</div>
                      <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ suggestion.fix }}</code></pre>
                    </div>
                  </div>
                  <button
                    @click="applySuggestion(suggestion)"
                    class="mt-3 px-3 py-1 rounded text-xs font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </div>

            <!-- Component Recommendations -->
            <div 
              v-if="recommendations.length > 0"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Recommended Components
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div
                  v-for="rec in recommendations"
                  :key="rec.id"
                  class="p-4 rounded-lg border cursor-pointer transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                >
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ rec.name }}
                  </div>
                  <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ rec.description }}
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'">
                      {{ rec.matchScore }}% match
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="suggestions.length === 0 && recommendations.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-white'">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                psychology
              </span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No suggestions yet
              </p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Analyze a component or use quick suggestions to get AI-powered recommendations
              </p>
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const componentCode = ref('');
const suggestions = ref([]);
const recommendations = ref([]);

const analyzeComponent = () => {
  if (!componentCode.value.trim()) return;
  
  // Mock AI analysis
  suggestions.value = [
    {
      id: 1,
      type: 'warning',
      category: 'accessibility',
      title: 'Missing ARIA Label',
      description: 'Interactive elements should have proper ARIA labels for screen readers.',
      fix: '<button aria-label="Close dialog">×</button>'
    },
    {
      id: 2,
      type: 'error',
      category: 'accessibility',
      title: 'Low Color Contrast',
      description: 'Text color does not meet WCAG AA contrast requirements.',
      fix: 'color: #000000; // Use darker color for better contrast'
    },
    {
      id: 3,
      type: 'info',
      category: 'performance',
      title: 'Consider Using CSS Variables',
      description: 'Using CSS variables for colors improves maintainability.',
      fix: 'background-color: var(--color-primary);'
    }
  ];
};

const getAccessibilitySuggestions = () => {
  suggestions.value = [
    {
      id: 4,
      type: 'warning',
      category: 'accessibility',
      title: 'Add Keyboard Navigation',
      description: 'Ensure all interactive elements are keyboard accessible.',
      fix: '@keydown.enter="handleClick"\n@keydown.space.prevent="handleClick"'
    },
    {
      id: 5,
      type: 'warning',
      category: 'accessibility',
      title: 'Add Focus Indicators',
      description: 'Visible focus indicators help keyboard users navigate.',
      fix: ':focus-visible {\n  outline: 2px solid #4f46e5;\n  outline-offset: 2px;\n}'
    }
  ];
};

const getComponentRecommendations = () => {
  recommendations.value = [
    {
      id: 1,
      name: 'Button',
      description: 'Based on your usage patterns, consider using the Button component',
      matchScore: 95
    },
    {
      id: 2,
      name: 'Card',
      description: 'Similar patterns found in Card component',
      matchScore: 87
    },
    {
      id: 3,
      name: 'Modal',
      description: 'You might benefit from the Modal component',
      matchScore: 72
    }
  ];
};

const getPatternSuggestions = () => {
  suggestions.value = [
    {
      id: 6,
      type: 'info',
      category: 'pattern',
      title: 'Consider Compound Component Pattern',
      description: 'Your component could benefit from the compound component pattern for better flexibility.',
      fix: '// Use composition instead of props\n<Card>\n  <Card.Header>Title</Card.Header>\n  <Card.Body>Content</Card.Body>\n</Card>'
    }
  ];
};

const applySuggestion = (suggestion) => {
  if (suggestion.fix) {
    componentCode.value = suggestion.fix;
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

