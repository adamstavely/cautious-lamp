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
                      Design Extractor
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Extract design tokens from any website URL and import them into your style library as DTCG-compliant tokens.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="extractorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized extractor icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#extractorGradient)" opacity="0.3"/>
                      <circle cx="100" cy="100" r="40" fill="url(#extractorGradient)" opacity="0.5"/>
                      <path d="M 70 100 L 100 70 L 130 100 L 100 130 Z" fill="rgba(255,255,255,0.4)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- URL Input Section -->
            <div 
              v-if="!extractedData"
              class="rounded-lg border p-6 mb-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Extract Design Tokens
              </h2>
              
              <div class="space-y-4">
                <!-- URL Input -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Website URL
                  </label>
                  <input
                    v-model="url"
                    type="text"
                    placeholder="https://example.com"
                    class="w-full px-4 py-2 rounded-lg border transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'"
                    @keyup.enter="extractTokens"
                  />
                </div>

                <!-- Options -->
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="options.darkMode"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Extract from dark mode
                    </span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="options.mobile"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Mobile viewport
                    </span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="options.slow"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Slow loading site (3x timeout)
                    </span>
                  </label>
                </div>

                <!-- Extract Button -->
                <button
                  @click="extractTokens"
                  :disabled="!url || extracting"
                  class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                >
                  <span v-if="extracting" class="flex items-center justify-center gap-2">
                    <span class="animate-spin">⏳</span>
                    Extracting design tokens...
                  </span>
                  <span v-else>Extract Design Tokens</span>
                </button>

                <!-- Error Message -->
                <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Token Review Section -->
            <div 
              v-if="extractedData && !saving"
              class="space-y-6"
            >
              <!-- Header with Save -->
              <div 
                class="rounded-lg border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Review Extracted Tokens
                    </h2>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Extracted from: <a :href="extractedData.url" target="_blank" class="text-indigo-600 hover:underline">{{ extractedData.url }}</a>
                    </p>
                  </div>
                  <button
                    @click="extractedData = null; url = ''; error = null"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
                  >
                    <span class="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <!-- Dictionary Name Input -->
                <div class="mb-6">
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Style Dictionary Name
                  </label>
                  <input
                    v-model="dictionaryName"
                    type="text"
                    placeholder="Extracted from example.com"
                    class="w-full px-4 py-2 rounded-lg border transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'"
                  />
                </div>

                <!-- Tokens by Category -->
                <div class="space-y-6">
                  <div
                    v-for="category in tokenCategories"
                    :key="category"
                    class="space-y-3"
                  >
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatCategoryName(category) }}
                    </h3>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div
                        v-for="(token, key) in getTokensByCategory(category)"
                        :key="`${category}-${key}`"
                        class="rounded-lg border p-4 transition-all group"
                        :class="isDarkMode 
                          ? 'border-gray-700 bg-slate-800 hover:border-indigo-600' 
                          : 'border-gray-200 bg-gray-50 hover:border-indigo-300'"
                      >
                        <div class="flex items-start justify-between mb-3">
                          <div class="flex-1 min-w-0">
                            <code class="text-sm font-mono font-semibold block truncate" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ key }}
                            </code>
                            <div 
                              v-if="isColorToken(token)"
                              class="w-full h-12 rounded border-2 mt-2"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                              :style="{ backgroundColor: getTokenValue(token) }"
                            ></div>
                            <div 
                              v-else
                              class="mt-2 text-sm font-mono break-words"
                              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                            >
                              {{ getTokenValue(token) }}
                            </div>
                          </div>
                          <button
                            @click="removeToken(category, key)"
                            class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            :class="isDarkMode 
                              ? 'text-gray-400 hover:text-red-400 hover:bg-slate-700' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-white'"
                            title="Remove token"
                          >
                            <span class="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <div 
                          v-if="getTokenDescription(token)"
                          class="text-xs"
                          :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
                        >
                          {{ getTokenDescription(token) }}
                        </div>
                        <div class="mt-2">
                          <span 
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            :class="isDarkMode 
                              ? 'bg-indigo-900/30 text-indigo-300' 
                              : 'bg-indigo-100 text-indigo-700'"
                          >
                            {{ getTokenType(token) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button
                    @click="saveToStyleLibrary"
                    :disabled="!dictionaryName || saving"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                  >
                    Save to Style Library
                  </button>
                </div>
              </div>
            </div>

            <!-- Saving State -->
            <div 
              v-if="saving"
              class="rounded-lg border p-6 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="animate-spin text-4xl mb-4">⏳</div>
              <p class="text-lg font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Saving to Style Library...
              </p>
            </div>

            <!-- Success State -->
            <div 
              v-if="savedDictionary"
              class="rounded-lg border p-6"
              :class="isDarkMode 
                ? 'bg-green-900/20 border-green-700' 
                : 'bg-green-50 border-green-200'"
            >
              <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                <h3 class="text-lg font-semibold text-green-900 dark:text-green-300">
                  Successfully saved to Style Library!
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-green-300' : 'text-green-700'">
                Your style dictionary "{{ savedDictionary.name }}" has been created with {{ tokenCount }} tokens.
              </p>
              <div class="flex gap-3">
                <router-link
                  to="/tokens/library"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Style Library
                </router-link>
                <button
                  @click="reset"
                  class="px-4 py-2 border rounded-lg transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
                >
                  Extract Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { designExtractionAPI } from '../services/api.js';
import apiClient from '../services/api.js';

const router = useRouter();
const route = useRoute();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const url = ref('');
const options = ref({
  darkMode: false,
  mobile: false,
  slow: false,
});
const extracting = ref(false);
const extractedData = ref(null);
const error = ref(null);
const dictionaryName = ref('');
const saving = ref(false);
const savedDictionary = ref(null);

const tokenCategories = computed(() => {
  if (!extractedData.value?.dtcg) return [];
  
  // Define the order of categories
  const categoryOrder = [
    'logo',
    'favicons',
    'color',
    'typography',
    'spacing',
    'radius',
    'border',
    'shadow',
    'components',
    'breakpoints',
    'icons',
    'frameworks',
  ];
  
  const availableCategories = Object.keys(extractedData.value.dtcg).filter(category => {
    const categoryData = extractedData.value.dtcg[category];
    return categoryData && typeof categoryData === 'object' && Object.keys(categoryData).length > 0;
  });
  
  // Sort by predefined order, then add any remaining categories
  const sorted = categoryOrder.filter(cat => availableCategories.includes(cat));
  const remaining = availableCategories.filter(cat => !categoryOrder.includes(cat));
  
  return [...sorted, ...remaining];
});

const tokenCount = computed(() => {
  if (!extractedData.value?.dtcg) return 0;
  let count = 0;
  const countTokens = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object' && value.$type && value.$value !== undefined) {
        count++;
      } else if (value && typeof value === 'object' && !value.$type) {
        countTokens(value);
      }
    }
  };
  countTokens(extractedData.value.dtcg);
  return count;
});

const extractTokens = async () => {
  const inputUrl = url.value.trim();
  
  if (!inputUrl) {
    error.value = 'Please enter a URL';
    return;
  }

  // Validate URL format before sending
  try {
    // Basic URL validation
    if (inputUrl.includes('Cannot POST') || inputUrl.includes('/api/') || inputUrl.includes('Error')) {
      error.value = 'Invalid URL format. Please enter a valid website URL (e.g., example.com or https://example.com)';
      return;
    }
    
    // Try to create a URL object to validate
    const testUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
    new URL(testUrl);
  } catch (e) {
    error.value = 'Invalid URL format. Please enter a valid website URL (e.g., example.com or https://example.com)';
    return;
  }

  extracting.value = true;
  error.value = null;
  extractedData.value = null;

  try {
    const result = await designExtractionAPI.extract(inputUrl, options.value);
    extractedData.value = result;
    dictionaryName.value = `Extracted from ${new URL(result.url).hostname}`;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to extract design tokens. Please try again.';
    error.value = errorMessage;
    console.error('Extraction error:', err);
    console.error('Request URL was:', inputUrl);
    console.error('Error response:', err.response?.data);
  } finally {
    extracting.value = false;
  }
};

const getTokensByCategory = (category) => {
  if (!extractedData.value?.dtcg || !extractedData.value.dtcg[category]) return {};
  
  // Flatten nested structure for display
  const categoryData = extractedData.value.dtcg[category];
  const flattened = {};
  
  const flatten = (obj, prefix = '') => {
    for (const key in obj) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && value.$type && value.$value !== undefined) {
        // This is a token
        flattened[fullKey] = value;
      } else if (value && typeof value === 'object' && !value.$type && !Array.isArray(value)) {
        // This is a nested object, recurse
        flatten(value, fullKey);
      } else if (Array.isArray(value)) {
        // Handle arrays (like favicons)
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            flatten(item, `${fullKey}[${index}]`);
          }
        });
      }
    }
  };
  
  flatten(categoryData);
  return flattened;
};

const getTokenType = (token) => {
  if (!token) return 'string';
  if (typeof token === 'object' && token.$type) {
    return token.$type;
  }
  return 'string';
};

const getTokenValue = (token) => {
  if (!token) return '';
  if (typeof token === 'object' && token.$value !== undefined) {
    return token.$value;
  }
  if (typeof token === 'string' || typeof token === 'number') {
    return token;
  }
  return '';
};

const getTokenDescription = (token) => {
  if (!token || typeof token !== 'object') return '';
  return token.$description || '';
};

const isColorToken = (token) => {
  return getTokenType(token) === 'color';
};

const formatCategoryName = (category) => {
  // Capitalize first letter and add spaces
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const removeToken = (category, key) => {
  if (extractedData.value?.dtcg && extractedData.value.dtcg[category]) {
    delete extractedData.value.dtcg[category][key];
    // Remove category if empty
    if (Object.keys(extractedData.value.dtcg[category]).length === 0) {
      delete extractedData.value.dtcg[category];
    }
  }
};

const saveToStyleLibrary = async () => {
  if (!dictionaryName.value.trim()) {
    error.value = 'Please enter a dictionary name';
    return;
  }

  saving.value = true;
  error.value = null;

  try {
    // Get workspace ID - use default or get from route/context
    const workspaceId = route.params.workspaceId || 'default-workspace';
    
    // Flatten DTCG tokens for storage
    const flattenedTokens = flattenDTCG(extractedData.value.dtcg);

    const response = await apiClient.post(`/workspaces/${workspaceId}/style-dictionaries`, {
      name: dictionaryName.value.trim(),
      description: `Extracted from ${extractedData.value.url} on ${new Date(extractedData.value.extractedAt).toLocaleDateString()}`,
      format: 'json',
      tokens: extractedData.value.dtcg,
      url: extractedData.value.url,
      tags: ['extracted', 'dembrandt'],
      createdBy: 'current-user', // TODO: Get from user context
    });

    savedDictionary.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to save style dictionary. Please try again.';
    console.error('Save error:', err);
  } finally {
    saving.value = false;
  }
};

const flattenDTCG = (dtcg, prefix = '') => {
  const tokens = [];
  for (const key in dtcg) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (dtcg[key].$type && dtcg[key].$value !== undefined) {
      tokens.push({
        name: fullKey,
        ...dtcg[key],
      });
    } else if (typeof dtcg[key] === 'object') {
      tokens.push(...flattenDTCG(dtcg[key], fullKey));
    }
  }
  return tokens;
};

const reset = () => {
  extractedData.value = null;
  url.value = '';
  dictionaryName.value = '';
  error.value = null;
  savedDictionary.value = null;
  saving.value = false;
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

