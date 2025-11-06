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
                      Style Library
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Browse and use your saved style dictionaries. View tokens, copy values, and export to your preferred format.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">library_books</span>
                      {{ activeDictionaries.length }} Active Dictionary{{ activeDictionaries.length !== 1 ? 'ies' : '' }}
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">style</span>
                      {{ totalTokens }} Total Tokens
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="libraryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized library icon -->
                      <rect x="20" y="40" width="160" height="120" rx="4" fill="url(#libraryGradient)" opacity="0.3"/>
                      <rect x="30" y="50" width="140" height="100" rx="2" fill="url(#libraryGradient)" opacity="0.5"/>
                      <line x1="50" y1="70" x2="150" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                      <line x1="50" y1="90" x2="150" y2="90" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                      <line x1="50" y1="110" x2="150" y2="110" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                      <line x1="50" y1="130" x2="120" y2="130" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Filter Tabs -->
            <div class="mb-6 flex items-center gap-4">
              <button
                @click="filter = 'active'"
                class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                :class="filter === 'active' 
                  ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                  : (isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-100')"
              >
                Active ({{ activeDictionaries.length }})
              </button>
              <button
                @click="filter = 'retired'"
                class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                :class="filter === 'retired' 
                  ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                  : (isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-100')"
              >
                Retired ({{ retiredDictionaries.length }})
              </button>
            </div>

            <!-- Dictionary Detail View -->
            <div v-if="selectedDictionary" class="mb-8">
              <div 
                class="rounded-lg border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <!-- Header -->
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ selectedDictionary.name }}
                      </h2>
                      <span 
                        v-if="selectedDictionary.retired"
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'"
                      >
                        Retired
                      </span>
                    </div>
                    <p v-if="selectedDictionary.description" class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ selectedDictionary.description }}
                    </p>
                    <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span>{{ selectedDictionary.tokens.length }} tokens</span>
                      <span>Created {{ formatDate(selectedDictionary.createdAt) }}</span>
                      <span>Updated {{ formatDate(selectedDictionary.updatedAt) }}</span>
                    </div>
                  </div>
                  <button
                    @click="selectedDictionary = null"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
                  >
                    <span class="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <!-- Export Actions -->
                <div class="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button
                    @click="exportDictionary(selectedDictionary, 'json')"
                    class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <span class="material-symbols-outlined text-base">code</span>
                    Export JSON
                  </button>
                  <button
                    @click="exportDictionary(selectedDictionary, 'css')"
                    class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <span class="material-symbols-outlined text-base">css</span>
                    Export CSS
                  </button>
                  <button
                    @click="exportDictionary(selectedDictionary, 'ios')"
                    class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <span class="material-symbols-outlined text-base">phone_iphone</span>
                    Export iOS
                  </button>
                  <button
                    @click="exportDictionary(selectedDictionary, 'android')"
                    class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <span class="material-symbols-outlined text-base">phone_android</span>
                    Export Android
                  </button>
                  <router-link
                    :to="`/tokens/studio?load=${selectedDictionary.id}`"
                    class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                  >
                    <span class="material-symbols-outlined text-base">edit</span>
                    Edit in Studio
                  </router-link>
                </div>

                <!-- Tokens by Category -->
                <div class="space-y-6">
                  <div
                    v-for="category in tokenCategories"
                    :key="category"
                    class="space-y-3"
                  >
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ category }}
                    </h3>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div
                        v-for="token in getTokensByCategory(selectedDictionary.tokens, category)"
                        :key="token.id"
                        class="rounded-lg border p-4 transition-all group"
                        :class="isDarkMode 
                          ? 'border-gray-700 bg-slate-800 hover:border-indigo-600' 
                          : 'border-gray-200 bg-gray-50 hover:border-indigo-300'"
                      >
                        <div class="flex items-start justify-between mb-3">
                          <div class="flex-1 min-w-0">
                            <code class="text-sm font-mono font-semibold block truncate" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ token.name }}
                            </code>
                            <div 
                              v-if="getTokenType(token) === 'color'"
                              class="w-full h-12 rounded border-2 mt-2"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                              :style="{ backgroundColor: getTokenValue(token) }"
                            ></div>
                            <div 
                              v-else
                              class="mt-2 text-sm font-mono"
                              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                            >
                              {{ getTokenValue(token) }}
                            </div>
                          </div>
                          <button
                            @click="copyTokenValue(token)"
                            class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            :class="isDarkMode 
                              ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-700' 
                              : 'text-gray-400 hover:text-indigo-600 hover:bg-white'"
                            title="Copy value"
                          >
                            <span class="material-symbols-outlined text-base">content_copy</span>
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
              </div>
            </div>

            <!-- Dictionaries Grid -->
            <div v-if="!selectedDictionary && filteredDictionaries.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="dictionary in filteredDictionaries"
                :key="dictionary.id"
                class="rounded-lg border p-6 transition-all cursor-pointer group"
                :class="isDarkMode 
                  ? 'border-gray-700 bg-slate-900 hover:border-indigo-600' 
                  : 'border-gray-200 bg-white hover:border-indigo-500'"
                @click="selectedDictionary = dictionary"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ dictionary.name }}
                      </h3>
                      <span 
                        v-if="dictionary.retired"
                        class="px-2 py-0.5 text-xs rounded-full font-medium"
                        :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'"
                      >
                        Retired
                      </span>
                    </div>
                    <p v-if="dictionary.description" class="text-sm mb-3 line-clamp-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ dictionary.description }}
                    </p>
                    <div class="flex items-center gap-4 text-xs mb-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span>{{ dictionary.tokens.length }} tokens</span>
                      <span>{{ formatDate(dictionary.updatedAt) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Token Preview -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <div
                    v-for="token in dictionary.tokens.slice(0, 12)"
                    :key="token.id"
                    class="w-8 h-8 rounded border-2 flex-shrink-0"
                    :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    :style="getTokenType(token) === 'color' ? { backgroundColor: getTokenValue(token) } : {}"
                    :title="token.name"
                  >
                    <span 
                      v-if="getTokenType(token) !== 'color'"
                      class="text-xs flex items-center justify-center h-full"
                      :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                    >
                      {{ getTokenType(token).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div v-if="dictionary.tokens.length > 12" class="w-8 h-8 rounded border-2 flex items-center justify-center text-xs" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-600'">
                    +{{ dictionary.tokens.length - 12 }}
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button
                    @click.stop="exportDictionary(dictionary, 'json')"
                    class="flex-1 px-3 py-2 text-sm rounded-lg transition-colors text-center"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    Export
                  </button>
                  <button
                    @click.stop="copyAllTokens(dictionary)"
                    class="px-3 py-2 text-sm rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    title="Copy all tokens"
                  >
                    <span class="material-symbols-outlined text-base">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!selectedDictionary && filteredDictionaries.length === 0" class="text-center py-12">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                library_books
              </span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No {{ filter === 'retired' ? 'retired' : 'active' }} dictionaries
              </p>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                {{ filter === 'retired' ? 'No retired dictionaries yet.' : 'Get started by creating a style dictionary in Token Studio.' }}
              </p>
              <router-link
                v-if="filter === 'active'"
                to="/tokens/studio"
                class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Token Studio
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
import { useRouter, useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const router = useRouter();
const route = useRoute();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const filter = ref('active');
const dictionaries = ref([]);
const selectedDictionary = ref(null);

const activeDictionaries = computed(() => {
  return dictionaries.value.filter(d => !d.retired);
});

const retiredDictionaries = computed(() => {
  return dictionaries.value.filter(d => d.retired);
});

const filteredDictionaries = computed(() => {
  return filter.value === 'active' ? activeDictionaries.value : retiredDictionaries.value;
});

const totalTokens = computed(() => {
  return activeDictionaries.value.reduce((sum, dict) => sum + dict.tokens.length, 0);
});

const tokenCategories = computed(() => {
  if (!selectedDictionary.value) return [];
  const categories = new Set();
  selectedDictionary.value.tokens.forEach(token => {
    const category = token.category || getCategoryFromTokenName(token.name);
    categories.add(category);
  });
  return Array.from(categories).sort();
});

const getTokensByCategory = (tokens, category) => {
  return tokens.filter(token => {
    const tokenCategory = token.category || getCategoryFromTokenName(token.name);
    return tokenCategory === category;
  });
};

const getCategoryFromTokenName = (name) => {
  const parts = name.split('.');
  return parts[0] || 'other';
};

const getTokenType = (token) => {
  return token.$type || 'string';
};

const getTokenValue = (token) => {
  if (token.$value && token.$value.startsWith('{') && token.$value.endsWith('}')) {
    return token.$value;
  }
  return token.$value || '';
};

const getTokenDescription = (token) => {
  return token.$description || '';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const copyTokenValue = async (token) => {
  try {
    await navigator.clipboard.writeText(getTokenValue(token));
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const copyAllTokens = async (dictionary) => {
  try {
    const dtcgTokens = convertToDTCGFormat(dictionary.tokens);
    const json = JSON.stringify(dtcgTokens, null, 2);
    await navigator.clipboard.writeText(json);
    alert('All tokens copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const exportDictionary = (dictionary, format) => {
  const dtcgTokens = convertToDTCGFormat(dictionary.tokens);
  
  if (format === 'json') {
    const json = JSON.stringify(dtcgTokens, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dictionary.name.replace(/\s+/g, '-')}-tokens.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // For other formats, convert tokens to the appropriate format
  let content = '';
  let extension = '';
  let mimeType = '';

  if (format === 'css') {
    content = exportToCSS(dtcgTokens);
    extension = 'css';
    mimeType = 'text/css';
  } else if (format === 'ios') {
    content = exportToIOS(dtcgTokens);
    extension = 'swift';
    mimeType = 'text/plain';
  } else if (format === 'android') {
    content = exportToAndroid(dtcgTokens);
    extension = 'xml';
    mimeType = 'application/xml';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dictionary.name.replace(/\s+/g, '-')}-tokens.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const convertToDTCGFormat = (tokens) => {
  const dtcg = {};
  
  tokens.forEach(token => {
    const parts = token.name.split('.');
    let current = dtcg;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    const tokenData = {
      $value: token.$value,
      $type: token.$type
    };
    
    if (token.$description) {
      tokenData.$description = token.$description;
    }
    
    current[parts[parts.length - 1]] = tokenData;
  });
  
  return dtcg;
};

const exportToCSS = (tokens) => {
  let css = ':root {\n';
  
  const flattenTokens = (obj, prefix = '') => {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      if (value.$value !== undefined) {
        const cssVar = `--${fullKey.replace(/\./g, '-')}`;
        result.push(`  ${cssVar}: ${value.$value};`);
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTokens(value, fullKey));
      }
    }
    return result;
  };
  
  css += flattenTokens(tokens).join('\n');
  css += '\n}';
  
  return css;
};

const exportToIOS = (tokens) => {
  let swift = 'import UIKit\n\n';
  swift += 'extension UIColor {\n';
  
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  const flattenTokens = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}${capitalize(key)}` : capitalize(key);
      if (value.$value !== undefined) {
        if (value.$type === 'color') {
          const hex = value.$value.replace('#', '');
          swift += `  static let ${fullKey} = UIColor(hex: "${hex}")\n`;
        }
      } else if (typeof value === 'object' && value !== null) {
        flattenTokens(value, fullKey);
      }
    }
  };
  
  flattenTokens(tokens);
  swift += '}\n';
  
  return swift;
};

const exportToAndroid = (tokens) => {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<resources>\n';
  
  const flattenTokens = (obj, prefix = '') => {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}_${key}` : key;
      if (value.$value !== undefined) {
        let androidValue = value.$value;
        if (value.$type === 'color') {
          androidValue = convertHexToAndroidColor(androidValue);
        } else if (value.$type === 'dimension') {
          androidValue = androidValue.replace('px', 'dp');
        }
        const tagName = value.$type === 'color' ? 'color' : value.$type === 'dimension' ? 'dimen' : 'string';
        result.push(`  <${tagName} name="${fullKey}">${androidValue}</${tagName}>`);
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTokens(value, fullKey));
      }
    }
    return result;
  };
  
  xml += flattenTokens(tokens).join('\n');
  xml += '\n</resources>';
  
  return xml;
};

const convertHexToAndroidColor = (hex) => {
  if (!hex.startsWith('#')) return hex;
  return hex.toUpperCase();
};

const loadDictionaries = () => {
  const stored = localStorage.getItem('styleDictionaries');
  if (stored) {
    try {
      dictionaries.value = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading dictionaries:', e);
    }
  }
  
  // Generate sample data if no dictionaries exist
  if (dictionaries.value.length === 0) {
    generateSampleDictionaries();
  }
};

const generateSampleDictionaries = () => {
  const sampleDictionaries = [
    {
      id: '1',
      name: 'Brand Colors 2024',
      description: 'Primary brand color palette with semantic colors',
      tokens: [
        { id: '1', name: 'color.primary.50', category: 'color', $type: 'color', $value: '#eef2ff', $description: 'Lightest primary shade' },
        { id: '2', name: 'color.primary.100', category: 'color', $type: 'color', $value: '#e0e7ff', $description: 'Light primary shade' },
        { id: '3', name: 'color.primary.500', category: 'color', $type: 'color', $value: '#6366f1', $description: 'Primary brand color' },
        { id: '4', name: 'color.primary.600', category: 'color', $type: 'color', $value: '#4f46e5', $description: 'Dark primary shade' },
        { id: '5', name: 'color.primary.900', category: 'color', $type: 'color', $value: '#312e81', $description: 'Darkest primary shade' },
        { id: '6', name: 'color.success.500', category: 'color', $type: 'color', $value: '#10b981', $description: 'Success state color' },
        { id: '7', name: 'color.error.500', category: 'color', $type: 'color', $value: '#ef4444', $description: 'Error state color' },
        { id: '8', name: 'color.warning.500', category: 'color', $type: 'color', $value: '#f59e0b', $description: 'Warning state color' },
        { id: '9', name: 'color.info.500', category: 'color', $type: 'color', $value: '#3b82f6', $description: 'Info state color' },
        { id: '10', name: 'spacing.xs', category: 'spacing', $type: 'dimension', $value: '4px', $description: 'Extra small spacing' },
        { id: '11', name: 'spacing.sm', category: 'spacing', $type: 'dimension', $value: '8px', $description: 'Small spacing' },
        { id: '12', name: 'spacing.md', category: 'spacing', $type: 'dimension', $value: '16px', $description: 'Medium spacing' },
        { id: '13', name: 'spacing.lg', category: 'spacing', $type: 'dimension', $value: '24px', $description: 'Large spacing' },
        { id: '14', name: 'spacing.xl', category: 'spacing', $type: 'dimension', $value: '32px', $description: 'Extra large spacing' },
        { id: '15', name: 'typography.fontFamily.primary', category: 'typography', $type: 'fontFamily', $value: 'Inter, sans-serif', $description: 'Primary font family' },
        { id: '16', name: 'typography.fontSize.sm', category: 'typography', $type: 'dimension', $value: '14px', $description: 'Small font size' },
        { id: '17', name: 'typography.fontSize.base', category: 'typography', $type: 'dimension', $value: '16px', $description: 'Base font size' },
        { id: '18', name: 'typography.fontSize.lg', category: 'typography', $type: 'dimension', $value: '18px', $description: 'Large font size' },
        { id: '19', name: 'shadow.sm', category: 'shadow', $type: 'string', $value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', $description: 'Small shadow' },
        { id: '20', name: 'shadow.md', category: 'shadow', $type: 'string', $value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', $description: 'Medium shadow' },
        { id: '21', name: 'shadow.lg', category: 'shadow', $type: 'string', $value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', $description: 'Large shadow' },
        { id: '22', name: 'radius.sm', category: 'radius', $type: 'dimension', $value: '4px', $description: 'Small border radius' },
        { id: '23', name: 'radius.md', category: 'radius', $type: 'dimension', $value: '8px', $description: 'Medium border radius' },
        { id: '24', name: 'radius.lg', category: 'radius', $type: 'dimension', $value: '12px', $description: 'Large border radius' },
        { id: '25', name: 'radius.full', category: 'radius', $type: 'dimension', $value: '9999px', $description: 'Full border radius' }
      ],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      retired: false
    },
    {
      id: '2',
      name: 'Dark Mode Tokens',
      description: 'Complete dark mode color system with high contrast ratios',
      tokens: [
        { id: '1', name: 'color.dark.background', category: 'color', $type: 'color', $value: '#0f172a', $description: 'Dark mode background' },
        { id: '2', name: 'color.dark.surface', category: 'color', $type: 'color', $value: '#1e293b', $description: 'Dark mode surface' },
        { id: '3', name: 'color.dark.text.primary', category: 'color', $type: 'color', $value: '#f1f5f9', $description: 'Primary text color' },
        { id: '4', name: 'color.dark.text.secondary', category: 'color', $type: 'color', $value: '#cbd5e1', $description: 'Secondary text color' },
        { id: '5', name: 'color.dark.border', category: 'color', $type: 'color', $value: '#334155', $description: 'Border color' },
        { id: '6', name: 'color.dark.accent', category: 'color', $type: 'color', $value: '#818cf8', $description: 'Accent color for dark mode' }
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      retired: false
    },
    {
      id: '3',
      name: 'Mobile App Tokens',
      description: 'Design tokens optimized for mobile applications',
      tokens: [
        { id: '1', name: 'spacing.mobile.xs', category: 'spacing', $type: 'dimension', $value: '8px', $description: 'Mobile extra small' },
        { id: '2', name: 'spacing.mobile.sm', category: 'spacing', $type: 'dimension', $value: '12px', $description: 'Mobile small' },
        { id: '3', name: 'spacing.mobile.md', category: 'spacing', $type: 'dimension', $value: '16px', $description: 'Mobile medium' },
        { id: '4', name: 'spacing.mobile.lg', category: 'spacing', $type: 'dimension', $value: '24px', $description: 'Mobile large' },
        { id: '5', name: 'typography.mobile.fontSize.base', category: 'typography', $type: 'dimension', $value: '16px', $description: 'Mobile base font' },
        { id: '6', name: 'typography.mobile.fontSize.heading', category: 'typography', $type: 'dimension', $value: '24px', $description: 'Mobile heading font' },
        { id: '7', name: 'radius.mobile.button', category: 'radius', $type: 'dimension', $value: '8px', $description: 'Mobile button radius' },
        { id: '8', name: 'radius.mobile.card', category: 'radius', $type: 'dimension', $value: '12px', $description: 'Mobile card radius' }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      retired: false
    },
    {
      id: '4',
      name: 'Legacy Design System',
      description: 'Previous design system tokens (deprecated)',
      tokens: [
        { id: '1', name: 'color.legacy.primary', category: 'color', $type: 'color', $value: '#3b82f6', $description: 'Legacy primary color' },
        { id: '2', name: 'color.legacy.secondary', category: 'color', $type: 'color', $value: '#8b5cf6', $description: 'Legacy secondary color' },
        { id: '3', name: 'spacing.legacy.base', category: 'spacing', $type: 'dimension', $value: '12px', $description: 'Legacy base spacing' }
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      retired: true
    }
  ];
  
  dictionaries.value = sampleDictionaries;
  saveDictionaries();
};

const saveDictionaries = () => {
  localStorage.setItem('styleDictionaries', JSON.stringify(dictionaries.value));
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
  loadDictionaries();
  
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
