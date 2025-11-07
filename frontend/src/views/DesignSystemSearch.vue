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
                  Design System Search
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Search across components, tokens, patterns, guidelines, and more. Find exactly what you need, fast.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Interface -->
        <div class="max-w-7xl mx-auto">
          <!-- Search Bar -->
          <div class="mb-8">
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none"
                :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                aria-hidden="true"
              >
                search
              </span>
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search components, tokens, patterns, guidelines..."
                class="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
                @input="performSearch"
                aria-label="Search design system"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="mb-6 flex flex-wrap gap-3">
            <button
              v-for="filter in filters"
              :key="filter.id"
              @click="toggleFilter(filter.id)"
              class="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
              :class="activeFilters.includes(filter.id)
                ? (isDarkMode 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-indigo-600 border-indigo-600 text-white')
                : (isDarkMode 
                  ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')"
            >
              {{ filter.label }}
            </button>
          </div>

          <!-- Results -->
          <div v-if="searchQuery || activeFilters.length > 0">
            <div class="mb-4">
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Found {{ filteredResults.length }} result{{ filteredResults.length !== 1 ? 's' : '' }}
              </p>
            </div>

            <div v-if="filteredResults.length === 0" class="text-center py-12">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                search_off
              </span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No results found
              </p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Try adjusting your search or filters
              </p>
            </div>

            <div v-else class="space-y-4">
              <router-link
                v-for="result in filteredResults"
                :key="result.id"
                :to="result.path"
                class="block rounded-lg border p-6 transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                  : 'border-gray-200 bg-white hover:border-indigo-500'"
              >
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'"
                  >
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      {{ result.icon }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ result.title }}
                      </h3>
                      <span 
                        class="px-2 py-0.5 rounded text-xs font-medium"
                        :class="getCategoryBadgeClass(result.category)"
                      >
                        {{ result.category }}
                      </span>
                    </div>
                    <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ result.description }}
                    </p>
                    <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span>{{ result.path }}</span>
                      <span v-if="result.tags && result.tags.length > 0" class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">label</span>
                        {{ result.tags.join(', ') }}
                      </span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined flex-shrink-0" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                    chevron_right
                  </span>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
              search
            </span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Start searching
            </p>
            <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              Search for components, tokens, patterns, guidelines, and more
            </p>
            <div class="flex flex-wrap justify-center gap-2">
              <span 
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                @click="searchQuery = suggestion; performSearch()"
                class="px-3 py-1 rounded-full border cursor-pointer transition-colors text-sm"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
              >
                {{ suggestion }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const searchQuery = ref('');
const activeFilters = ref([]);

const filters = [
  { id: 'components', label: 'Components' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'tools', label: 'Tools' },
];

const searchSuggestions = [
  'button', 'color', 'form', 'card', 'navigation', 'typography', 'spacing', 'shadow'
];

// Search index - in a real app, this would come from an API or be generated
const searchIndex = [
  { id: 'button', title: 'Button', description: 'Primary, secondary, and tertiary button variants with different sizes and states', category: 'Components', path: '/components/buttons', icon: 'smart_button', tags: ['interactive', 'form', 'action'] },
  { id: 'component-status', title: 'Component Status', description: 'Track component development status and availability', category: 'Components', path: '/components/status', icon: 'check_circle', tags: ['status', 'tracking'] },
  { id: 'forms', title: 'Forms', description: 'Input fields, selects, checkboxes, and form controls', category: 'Components', path: '/components/forms', icon: 'description', tags: ['form', 'input', 'validation'] },
  { id: 'cards', title: 'Cards', description: 'Card components for displaying content and actions', category: 'Components', path: '/components/cards', icon: 'view_module', tags: ['layout', 'content'] },
  { id: 'navigation', title: 'Navigation', description: 'Menus, breadcrumbs, tabs, and navigation components', category: 'Components', path: '/components/navigation', icon: 'navigation', tags: ['navigation', 'menu'] },
  { id: 'data-display', title: 'Data Display', description: 'Tables, lists, and data visualization components', category: 'Components', path: '/components/data-display', icon: 'table_chart', tags: ['data', 'table', 'list'] },
  { id: 'token-studio', title: 'Token Studio', description: 'Create and manage design tokens with Style Dictionary', category: 'Tokens', path: '/tokens/studio', icon: 'tune', tags: ['tokens', 'design', 'style'] },
  { id: 'style-library', title: 'Style Library', description: 'View, edit, download, and retire style dictionaries', category: 'Tokens', path: '/tokens/library', icon: 'library_books', tags: ['tokens', 'library'] },
  { id: 'pattern-navigation', title: 'Navigation Pattern', description: 'Navigation patterns and best practices', category: 'Patterns', path: '/patterns/navigation', icon: 'navigation', tags: ['pattern', 'navigation'] },
  { id: 'pattern-layout', title: 'Layout Pattern', description: 'Grid systems, containers, and responsive layouts', category: 'Patterns', path: '/patterns/layout', icon: 'view_quilt', tags: ['pattern', 'layout'] },
  { id: 'pattern-forms', title: 'Form Pattern', description: 'Form patterns and validation guidelines', category: 'Patterns', path: '/patterns/forms', icon: 'description', tags: ['pattern', 'form'] },
  { id: 'pattern-feedback', title: 'Feedback Pattern', description: 'User feedback patterns and notifications', category: 'Patterns', path: '/patterns/feedback', icon: 'feedback', tags: ['pattern', 'feedback'] },
  { id: 'font-library', title: 'Font Library', description: 'Browse and preview hundreds of Google Fonts', category: 'Fonts', path: '/fonts/library', icon: 'library_books', tags: ['font', 'typography'] },
  { id: 'font-scale', title: 'Font Scale', description: 'Typography scale and sizing system', category: 'Fonts', path: '/fonts/scale', icon: 'format_line_spacing', tags: ['font', 'scale', 'typography'] },
  { id: 'font-stack', title: 'Font Stack', description: 'Font fallback stacks and combinations', category: 'Fonts', path: '/fonts/stack', icon: 'font_download', tags: ['font', 'stack'] },
  { id: 'font-subsetting', title: 'Font Subsetting', description: 'Optimize fonts by subsetting character sets', category: 'Fonts', path: '/fonts/subsetting', icon: 'content_cut', tags: ['font', 'optimization'] },
  { id: 'icon-library', title: 'Icon Library', description: 'Upload and manage icon sets from Material and Lucide', category: 'Design Assets', path: '/design-assets/icons', icon: 'star', tags: ['icons', 'assets'] },
  { id: 'color-converter', title: 'Color Converter', description: 'Convert colors between different formats (HEX, RGB, HSL, etc.)', category: 'Tools', path: '/tools/color-converter', icon: 'palette', tags: ['color', 'converter', 'tool'] },
  { id: 'color-contrast', title: 'Color Contrast Checker', description: 'Check color contrast ratios for accessibility', category: 'Tools', path: '/tools/color-contrast', icon: 'contrast', tags: ['color', 'accessibility', 'contrast'] },
  { id: 'gradient-generator', title: 'Gradient Generator', description: 'Create beautiful gradients with custom stops and directions', category: 'Tools', path: '/tools/gradient-generator', icon: 'gradient', tags: ['gradient', 'color', 'tool'] },
  { id: 'lorem-ipsum', title: 'Lorem Ipsum Generator', description: 'Generate placeholder text with various options', category: 'Tools', path: '/tools/lorem-ipsum', icon: 'text_fields', tags: ['text', 'placeholder', 'tool'] },
  { id: 'seo-tagging', title: 'SEO Tagging Generator', description: 'Generate SEO meta tags for your pages', category: 'Tools', path: '/tools/seo-tagging', icon: 'search', tags: ['seo', 'meta', 'tool'] },
  { id: 'color-scale', title: 'Color Scale Generator', description: 'Generate color scales with accessibility checks', category: 'Tools', path: '/tools/color-scale', icon: 'palette', tags: ['color', 'scale', 'accessibility'] },
  { id: 'guidelines-colors', title: 'Color Guidelines', description: 'Color system and usage guidelines', category: 'Guidelines', path: '/guidelines/colors', icon: 'palette', tags: ['guidelines', 'color'] },
  { id: 'guidelines-typography', title: 'Typography Guidelines', description: 'Typography system and best practices', category: 'Guidelines', path: '/guidelines/typography', icon: 'text_fields', tags: ['guidelines', 'typography'] },
  { id: 'guidelines-spacing', title: 'Spacing Guidelines', description: 'Spacing system and layout guidelines', category: 'Guidelines', path: '/guidelines/spacing', icon: 'space_dashboard', tags: ['guidelines', 'spacing'] },
];

const filteredResults = computed(() => {
  let results = searchIndex;

  // Filter by category if filters are active
  if (activeFilters.value.length > 0) {
    results = results.filter(item => activeFilters.value.includes(item.category.toLowerCase()));
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(item => {
      return item.title.toLowerCase().includes(query) ||
             item.description.toLowerCase().includes(query) ||
             item.tags.some(tag => tag.toLowerCase().includes(query)) ||
             item.category.toLowerCase().includes(query);
    });
  }

  return results;
});

const toggleFilter = (filterId) => {
  const index = activeFilters.value.indexOf(filterId);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterId);
  }
};

const performSearch = () => {
  // Search is performed reactively via computed property
};

const getCategoryBadgeClass = (category) => {
  const classes = {
    'Components': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Tokens': isDarkMode.value ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    'Patterns': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'Guidelines': isDarkMode.value ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
    'Fonts': isDarkMode.value ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700',
    'Tools': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    'Design Assets': isDarkMode.value ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700',
  };
  return classes[category] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for dark mode changes
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

