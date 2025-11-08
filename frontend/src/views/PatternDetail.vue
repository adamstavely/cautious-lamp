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
      
      <!-- Overview and Markdown Content -->
      <div class="h-full w-full relative overflow-y-auto">
        <div class="p-8">
          <!-- Overview Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Overview</h2>
            </div>
            
            <div 
              class="rounded-2xl border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16">
                  <svg viewBox="0 0 64 64" class="w-full h-full">
                    <defs>
                      <linearGradient id="patternOverviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect x="8" y="8" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.4"/>
                    <rect x="36" y="8" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.5"/>
                    <rect x="8" y="36" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.6"/>
                    <rect x="36" y="36" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.4"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design patterns provide reusable solutions to common interface challenges. This pattern guide covers best practices, implementation details, and examples for creating consistent and effective user interfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Markdown Content -->
        <MarkdownViewer :doc-path="patternPath" />
        
        <!-- Additional Sections -->
        <div class="p-8">
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
                      <span>Ensure all interactive elements are keyboard accessible</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Provide clear focus indicators for keyboard navigation</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Use semantic HTML elements for proper screen reader support</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Include ARIA labels and landmarks where appropriate</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">•</span>
                      <span>Ensure sufficient color contrast for text and backgrounds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div 
              class="rounded-lg shadow-sm border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">speed</span>
                  Pattern Performance
                </h2>
              </div>
              
              <div class="p-6">
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">category</span>
                      Category
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ getPatternCategory() }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Design Pattern
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      Status
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Production Ready
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      v1.0.0
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">devices</span>
                      Responsive
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Yes
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Mobile & Desktop
                    </div>
                  </div>
                  
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">accessibility</span>
                      WCAG
                    </div>
                    <div class="text-lg font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      AA
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Compliant
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Version History -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Version History</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Track pattern versions, view changelogs, and manage breaking changes.</p>
            </div>

            <!-- Current Version Info -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Current Version: v1.0.0
                  </h3>
                  <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Initial release of this design pattern.
                  </p>
                </div>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  Production Ready
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                <span>Released: Jan 10, 2024</span>
              </div>
            </div>
          </div>

          <!-- Related Patterns -->
          <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Related Patterns & Components</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Patterns and components that work well with this pattern or serve similar purposes.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
              <router-link 
                v-for="related in getRelatedItems()"
                :key="related.path"
                :to="related.path"
                class="rounded-2xl border p-6 transition-all group"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ related.icon }}</span>
                  <h3 
                    class="text-lg font-semibold transition-colors"
                    :class="isDarkMode 
                      ? 'text-white group-hover:text-indigo-400' 
                      : 'text-gray-900 group-hover:text-indigo-600'"
                  >
                    {{ related.title }}
                  </h3>
                </div>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ related.description }}
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
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

// Get pattern path from route
const patternPath = computed(() => {
  return route.path;
});

// Get pattern category from route
const getPatternCategory = () => {
  const path = route.path;
  if (path.includes('data-display')) return 'Data Display';
  if (path.includes('layout')) return 'Layout';
  if (path.includes('forms')) return 'Forms';
  if (path.includes('feedback')) return 'Feedback';
  return 'Design Pattern';
};

// Get related items
const getRelatedItems = () => {
  const path = route.path;
  const related = [];
  
  if (path.includes('data-display')) {
    related.push(
      { path: '/patterns/layout', icon: 'view_quilt', title: 'Layout Patterns', description: 'Explore grid systems and layout structures.' },
      { path: '/patterns/forms', icon: 'description', title: 'Form Patterns', description: 'Patterns for form design and user input.' },
      { path: '/patterns/navigation', icon: 'navigation', title: 'Navigation Patterns', description: 'Navigation patterns that complement data display.' }
    );
  } else if (path.includes('layout')) {
    related.push(
      { path: '/patterns/data-display', icon: 'table_chart', title: 'Data Display', description: 'Patterns for displaying data in layouts.' },
      { path: '/patterns/navigation', icon: 'navigation', title: 'Navigation Patterns', description: 'Navigation patterns for layout structures.' },
      { path: '/patterns/forms', icon: 'description', title: 'Form Patterns', description: 'Form patterns that work with layouts.' }
    );
  } else if (path.includes('forms')) {
    related.push(
      { path: '/patterns/form-validation', icon: 'verified', title: 'Form Validation', description: 'Code patterns for form validation.' },
      { path: '/patterns/layout', icon: 'view_quilt', title: 'Layout Patterns', description: 'Layout patterns for form design.' },
      { path: '/patterns/feedback', icon: 'feedback', title: 'Feedback Patterns', description: 'Patterns for form feedback and errors.' }
    );
  } else if (path.includes('feedback')) {
    related.push(
      { path: '/patterns/toast-notification', icon: 'notifications', title: 'Toast Notification', description: 'Code pattern for toast notifications.' },
      { path: '/patterns/forms', icon: 'description', title: 'Form Patterns', description: 'Form patterns with feedback mechanisms.' },
      { path: '/patterns/data-display', icon: 'table_chart', title: 'Data Display', description: 'Data display patterns with feedback.' }
    );
  } else {
    related.push(
      { path: '/patterns/layout', icon: 'view_quilt', title: 'Layout Patterns', description: 'Explore layout structures.' },
      { path: '/patterns/data-display', icon: 'table_chart', title: 'Data Display', description: 'Patterns for displaying data.' },
      { path: '/patterns/navigation', icon: 'navigation', title: 'Navigation Patterns', description: 'Navigation patterns and best practices.' }
    );
  }
  
  return related;
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

