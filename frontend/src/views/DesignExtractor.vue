<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design tokens"
      title="Design extractor"
      lead="Extract design tokens from any website URL and import them into your style library as DTCG-compliant tokens."
      spot="tools/design-extractor"
    />

    <UiCallout v-if="error" tone="danger" role="alert" class="mb-6">{{ error }}</UiCallout>

    <!-- URL input -->
    <UiPanel v-if="!extractedData" title="Extract design tokens">
      <form class="space-y-5" @submit.prevent="extractTokens">
        <UiInput v-model="url" label="Website URL" placeholder="https://example.com" />
        <fieldset>
          <legend class="sr-only">Extraction options</legend>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <UiCheckbox v-model="options.darkMode" label="Extract from dark mode" />
            <UiCheckbox v-model="options.mobile" label="Mobile viewport" />
            <UiCheckbox v-model="options.slow" label="Slow loading site (3x timeout)" />
          </div>
        </fieldset>
        <UiButton variant="primary" type="submit" icon="travel_explore" :disabled="!url" :loading="extracting">
          {{ extracting ? 'Extracting design tokens…' : 'Extract design tokens' }}
        </UiButton>
      </form>
    </UiPanel>

    <!-- Token review -->
    <UiPanel v-if="extractedData && !saving" title="Review extracted tokens">
      <template #actions>
        <UiButton variant="ghost" icon="close" icon-only label="Discard and start over" @click="extractedData = null; url = ''; error = null" />
      </template>

      <p class="mb-6 text-sm text-ink-secondary">
        Extracted from: <UiLink :href="extractedData.url" external>{{ extractedData.url }}</UiLink>
      </p>

      <div class="mb-6">
        <UiInput v-model="dictionaryName" label="Style dictionary name" placeholder="Extracted from example.com" />
      </div>

      <div class="space-y-6">
        <section v-for="category in tokenCategories" :key="category" class="space-y-3">
          <h3 class="text-lg font-semibold text-ink-strong">{{ formatCategoryName(category) }}</h3>
          <ul class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <li
              v-for="(token, key) in getTokensByCategory(category)"
              :key="`${category}-${key}`"
              class="rounded-tile border border-line bg-surface-sunken p-4 transition-colors hover:border-accent-border"
            >
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex-1 min-w-0">
                  <code class="block truncate font-code text-sm font-semibold text-ink-strong">{{ key }}</code>
                  <div v-if="isColorToken(token)" class="mt-2 h-12 w-full overflow-hidden rounded-control border border-line-control">
                    <UiSwatch :color="String(getTokenValue(token))" :label="`${key}: ${getTokenValue(token)}`" size="fill" />
                  </div>
                  <div v-else class="mt-2 break-words font-code text-sm text-ink">{{ getTokenValue(token) }}</div>
                </div>
                <UiButton size="sm" variant="ghost" icon="delete" icon-only :label="`Remove token ${key}`" @click="removeToken(category, key)" />
              </div>
              <p v-if="getTokenDescription(token)" class="text-xs text-ink-muted">{{ getTokenDescription(token) }}</p>
              <UiChip tone="accent" class="mt-2">{{ getTokenType(token) }}</UiChip>
            </li>
          </ul>
        </section>
      </div>

      <template #footer>
        <div class="space-y-4">
          <UiSelect
            v-model="workspaceId"
            id="extract-workspace"
            label="Workspace"
            :options="workspaceOptions"
            :disabled="!writableWorkspaces.length"
          />
          <p v-if="!workspacesLoading && !writableWorkspaces.length" class="text-sm text-ink-secondary">
            You need editor access to a workspace to save a style dictionary.
            <UiLink to="/admin/workspaces">Open workspaces</UiLink>
          </p>
          <UiButton variant="primary" icon="save" :disabled="!dictionaryName || !workspaceId || saving" @click="saveToStyleLibrary">
            Save to style library
          </UiButton>
        </div>
      </template>
    </UiPanel>

    <UiPanel v-if="saving">
      <UiSpinner label="Saving to style library…" class="py-6" />
    </UiPanel>

    <UiCallout v-if="savedDictionary" tone="success" title="Successfully saved to style library" role="status" class="mt-6">
      Your style dictionary "{{ savedDictionary.name }}" has been created with {{ tokenCount }} tokens.
      <div class="mt-4 flex flex-wrap gap-3">
        <UiButton variant="primary" to="/tokens/library">View style library</UiButton>
        <UiButton @click="reset">Extract another</UiButton>
      </div>
    </UiCallout>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { designExtractionAPI } from '../services/api.js';
import apiClient from '../services/api.js';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiInput,
  UiLink,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiSwatch,
} from '../components/ui';

const route = useRoute();

// Workspaces the user can save into (editor or above)
const workspaces = ref([]);
const workspacesLoading = ref(true);
const workspaceId = ref(route.params.workspaceId || route.query.workspace || '');
const writableWorkspaces = computed(() =>
  workspaces.value.filter((ws) => ['owner', 'admin', 'editor'].includes(ws.effectiveRole)),
);
const workspaceOptions = computed(() => writableWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name })));

const loadWorkspaces = async () => {
  workspacesLoading.value = true;
  try {
    const response = await apiClient.get('/api/v1/workspaces', { params: { mine: 'true' } });
    workspaces.value = response.data || [];
    if (!writableWorkspaces.value.some((ws) => ws.id === workspaceId.value)) {
      workspaceId.value = writableWorkspaces.value[0]?.id || '';
    }
  } catch (err) {
    workspaces.value = [];
    error.value = err.response?.data?.message || 'Could not load your workspaces.';
  } finally {
    workspacesLoading.value = false;
  }
};

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
    if (!workspaceId.value) {
      error.value = 'Choose a workspace to save to';
      return;
    }

    const response = await apiClient.post(`/api/v1/workspaces/${encodeURIComponent(workspaceId.value)}/style-dictionaries`, {
      name: dictionaryName.value.trim(),
      description: `Extracted from ${extractedData.value.url} on ${new Date(extractedData.value.extractedAt).toLocaleDateString()}`,
      format: 'json',
      tokens: extractedData.value.dtcg,
      url: extractedData.value.url,
      tags: ['extracted', 'dembrandt'],
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

onMounted(() => {
  loadWorkspaces();
});
</script>
