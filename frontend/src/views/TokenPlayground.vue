<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens', label: 'Design tokens' }"
      title="Token playground"
      lead="Pick tokens from the design system and see how they work together. Export the combination as CSS, SCSS or JSON."
      spot="foundations/token-playground"
      size="tool"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <div v-if="loading" class="flex justify-center py-12"><UiSpinner label="Loading the design system's tokens" /></div>

    <UiCallout v-else-if="error" tone="danger" title="The tokens didn't load">
      {{ error }}
      <template #actions><UiButton variant="secondary" size="sm" icon="refresh-cw" @click="loadTokens">Try again</UiButton></template>
    </UiCallout>

    <UiEmptyState
      v-else-if="!allTokens.length"
      spot="foundations/token-playground"
      title="No tokens yet"
      body="The design system has no tokens to try. Add them in Token studio or sync them from a design tool."
    >
      <template #actions>
        <UiButton to="/tokens/sync" icon="refresh-cw">Token sync</UiButton>
      </template>
    </UiEmptyState>

    <template v-else>
      <PageSection title="Choose tokens" description="Filter by category or search, then select the tokens to preview.">
        <div class="grid lg:grid-cols-aside-content gap-6">
          <UiPanel title="Selected" :description="selectedTokens.length ? `${selectedTokens.length} selected` : 'Nothing selected yet'" heading-tag="h3">
            <ul v-if="selectedTokens.length" class="flex flex-col divide-y divide-line">
              <li v-for="token in selectedTokens" :key="token.name" class="flex items-center gap-3 py-2">
                <UiSwatch v-if="isColor(token)" :color="token.resolved" size="sm" :label="token.resolved" />
                <div class="min-w-0 flex-1">
                  <p class="font-code text-sm text-ink-strong break-all">{{ token.name }}</p>
                  <p class="font-code text-xs text-ink-muted break-all">{{ display(token.value) }}</p>
                </div>
                <UiButton icon-only icon="x" variant="ghost" size="sm" :label="`Remove ${token.name}`" @click="toggleToken(token)" />
              </li>
            </ul>
            <p v-else class="text-sm text-ink-muted">Select tokens from the list to add them to the preview.</p>
            <template v-if="selectedTokens.length" #footer>
              <UiButton variant="ghost" size="sm" icon="x" @click="selectedNames = []">Clear selection</UiButton>
            </template>
          </UiPanel>

          <UiPanel title="Available tokens" :description="`${filteredTokens.length} of ${allTokens.length}`" heading-tag="h3">
            <div class="flex flex-col sm:flex-row gap-3 mb-4">
              <UiSelect v-model="selectedCategory" label="Category" :options="categoryOptions" size="sm" class="sm:w-48" />
              <UiInput v-model="tokenSearch" label="Search tokens" icon="search" size="sm" placeholder="Name or value" class="flex-1" />
            </div>
            <p v-if="!filteredTokens.length" class="text-sm text-ink-muted py-6 text-center">No tokens match.</p>
            <div v-else class="token-grid">
              <button
                v-for="token in filteredTokens"
                :key="token.name"
                type="button"
                class="token-option"
                :class="{ 'token-option-on': isSelected(token) }"
                :aria-pressed="isSelected(token)"
                @click="toggleToken(token)"
              >
                <span class="flex items-start justify-between gap-2">
                  <span class="min-w-0">
                    <span class="block font-code text-sm text-ink-strong break-all">{{ token.name }}</span>
                    <span class="block text-xs text-ink-muted">{{ token.category || token.type }}</span>
                  </span>
                  <UiSwatch v-if="isColor(token)" :color="token.resolved" size="md" :label="token.resolved" />
                </span>
                <span class="block font-code text-xs text-ink-secondary mt-2 break-all">{{ display(token.value) }}</span>
              </button>
            </div>
          </UiPanel>
        </div>
      </PageSection>

      <PageSection title="Preview" description="The selected tokens, and a card drawn from the tokens you choose for each role." divided>
        <div class="grid lg:grid-cols-2 gap-6">
          <UiPanel title="Selected tokens" heading-tag="h3">
            <p v-if="!colorTokens.length && !sizeTokens.length && !spacingTokens.length" class="text-sm text-ink-muted">
              Select colour, font size or spacing tokens to see them here.
            </p>
            <div v-if="sizeTokens.length" class="mb-6">
              <h4 class="text-sm font-semibold text-ink-secondary mb-2">Typography</h4>
              <div class="flex flex-col gap-2">
                <UiTypeSample
                  v-for="token in sizeTokens"
                  :key="token.name"
                  :size="token.resolved"
                  :family="previewFamily"
                  :weight="previewWeight"
                  class="text-ink-strong"
                >
                  {{ token.name.split('.').pop() }}: the quick brown fox
                </UiTypeSample>
              </div>
            </div>
            <div v-if="colorTokens.length" class="mb-6">
              <h4 class="text-sm font-semibold text-ink-secondary mb-2">Colours</h4>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <UiColorSample
                  v-for="token in colorTokens"
                  :key="token.name"
                  :color="token.resolved"
                  :text-color="readableOn(token.resolved)"
                  class="aspect-square rounded-tile border flex items-end p-2"
                >
                  <span class="text-xs font-medium break-all">{{ token.name.replace(/^colou?r\./, '') }}</span>
                </UiColorSample>
              </div>
            </div>
            <div v-if="spacingTokens.length">
              <h4 class="text-sm font-semibold text-ink-secondary mb-2">Spacing</h4>
              <ul class="flex flex-col gap-2">
                <li v-for="token in spacingTokens" :key="token.name" class="grid grid-cols-3 items-center gap-3">
                  <span class="font-code text-xs text-ink-secondary break-all">{{ token.name }}</span>
                  <TokenSpacingBar :size="token.resolved" />
                  <span class="font-code text-xs text-ink-muted">{{ token.resolved }}</span>
                </li>
              </ul>
            </div>
          </UiPanel>

          <UiPanel title="Component preview" heading-tag="h3">
            <div class="grid sm:grid-cols-2 gap-3 mb-6">
              <UiSelect v-for="role in ROLES" :key="role.key" v-model="roles[role.key]" :label="role.label" :options="roleOptions(role)" size="sm" />
            </div>
            <div class="rounded-tile border border-line bg-surface-sunken p-6">
              <TokenPreviewCard
                :surface="roleValue('surface')"
                :text="roleValue('text')"
                :accent="roleValue('accent')"
                :padding="roleValue('padding')"
                :radius="roleValue('radius')"
                :shadow="roleValue('shadow')"
                :family="roleValue('family')"
              />
            </div>
          </UiPanel>
        </div>
      </PageSection>

      <PageSection title="Export" description="The selected tokens, with aliases resolved to their values." divided>
        <UiCallout v-if="!selectedTokens.length" tone="info">Select tokens to export them.</UiCallout>
        <template v-else>
          <div class="flex flex-wrap gap-3 mb-4">
            <UiButton icon="download" @click="download('css')">Export CSS variables</UiButton>
            <UiButton variant="secondary" icon="download" @click="download('scss')">Export SCSS</UiButton>
            <UiButton variant="secondary" icon="download" @click="download('json')">Export JSON</UiButton>
          </div>
          <UiCodeBlock :code="exportText('css')" label="CSS" />
        </template>
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import TokenPreviewCard from '../components/tokens/TokenPreviewCard.vue';
import TokenSpacingBar from '../components/tokens/TokenSpacingBar.vue';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiCodeBlock, UiColorSample, UiEmptyState, UiInput, UiPanel, UiSelect, UiSpinner, UiSwatch, UiTypeSample,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { readableOn } from '../utils/contrast.js';
import { fromDesignSystemTokens } from '../utils/designTokens.js';
import { downloadText } from '../utils/tokenExport.js';

const { notice, showNotice, clearNotice } = useNotice();

// The design system's own tokens (GET /api/v1/tokens), with aliases resolved
const allTokens = ref([]);
const loading = ref(true);
const error = ref('');

const selectedCategory = ref('');
const tokenSearch = ref('');
const selectedNames = ref([]);

const display = (value) => (value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
const isColor = (token) => token.type === 'color' && typeof token.resolved === 'string';
const isSize = (token) => token.type === 'fontSize' && typeof token.resolved === 'string';
const isSpacing = (token) => token.type === 'dimension' && token.category === 'spacing' && typeof token.resolved === 'string';

const categoryOptions = computed(() => [
  { value: '', label: 'All categories' },
  ...[...new Set(allTokens.value.map((t) => t.category).filter(Boolean))].sort().map((c) => ({ value: c, label: c })),
]);

const filteredTokens = computed(() => {
  const query = tokenSearch.value.trim().toLowerCase();
  return allTokens.value.filter((token) => {
    if (selectedCategory.value && token.category !== selectedCategory.value) return false;
    if (!query) return true;
    return token.name.toLowerCase().includes(query) || display(token.value).toLowerCase().includes(query);
  });
});

const selectedTokens = computed(() => selectedNames.value.map((name) => allTokens.value.find((t) => t.name === name)).filter(Boolean));
const colorTokens = computed(() => selectedTokens.value.filter(isColor));
const sizeTokens = computed(() => selectedTokens.value.filter(isSize));
const spacingTokens = computed(() => selectedTokens.value.filter(isSpacing));
const previewFamily = computed(() => selectedTokens.value.find((t) => t.type === 'fontFamily')?.resolved ?? '');
const previewWeight = computed(() => selectedTokens.value.find((t) => t.type === 'fontWeight')?.resolved ?? null);

const isSelected = (token) => selectedNames.value.includes(token.name);
const toggleToken = (token) => {
  selectedNames.value = isSelected(token) ? selectedNames.value.filter((n) => n !== token.name) : [...selectedNames.value, token.name];
};

// Component preview: each role takes a token of a matching type; `prefer` picks a sensible default by name
const ROLES = [
  { key: 'surface', label: 'Surface colour', match: (t) => t.type === 'color', prefer: ['color.surface', 'color.background', 'color.neutral.50'] },
  { key: 'text', label: 'Text colour', match: (t) => t.type === 'color', prefer: ['color.text.primary', 'color.text', 'color.neutral.900'] },
  { key: 'accent', label: 'Button colour', match: (t) => t.type === 'color', prefer: ['color.button.primary', 'color.primary'] },
  { key: 'padding', label: 'Padding', match: (t) => t.type === 'dimension' && t.category === 'spacing', prefer: ['spacing.lg', 'spacing.md'] },
  { key: 'radius', label: 'Corner radius', match: (t) => t.type === 'dimension' && /radius/i.test(t.name), prefer: ['border.radius.md'] },
  { key: 'shadow', label: 'Shadow', match: (t) => t.type === 'shadow', prefer: ['shadow.md'] },
  { key: 'family', label: 'Font family', match: (t) => t.type === 'fontFamily', prefer: ['typography.fontFamily.primary'] },
];
const roles = reactive(Object.fromEntries(ROLES.map((role) => [role.key, ''])));

const roleOptions = (role) => [
  { value: '', label: 'App default' },
  ...allTokens.value.filter((t) => role.match(t) && t.resolved != null).map((t) => ({ value: t.name, label: t.name })),
];
const roleValue = (key) => {
  const token = allTokens.value.find((t) => t.name === roles[key]);
  return token && typeof token.resolved === 'string' ? token.resolved : '';
};
const pickDefaults = () => {
  for (const role of ROLES) {
    const candidates = allTokens.value.filter((t) => role.match(t) && t.resolved != null);
    roles[role.key] = role.prefer.find((name) => candidates.some((t) => t.name === name)) ?? '';
  }
};

const exportValue = (token) => display(token.resolved ?? token.value);
const exportText = (format) => {
  const tokens = selectedTokens.value;
  if (format === 'json') return JSON.stringify(Object.fromEntries(tokens.map((t) => [t.name, t.resolved ?? t.value])), null, 2);
  if (format === 'scss') return tokens.map((t) => `$${t.name.replace(/\./g, '-')}: ${exportValue(t)};`).join('\n');
  return `:root {\n${tokens.map((t) => `  --${t.name.replace(/\./g, '-')}: ${exportValue(t)};`).join('\n')}\n}`;
};
const FILES = { css: ['tokens.css', 'text/css'], scss: ['tokens.scss', 'text/x-scss'], json: ['tokens.json', 'application/json'] };
const download = (format) => {
  const [filename, mime] = FILES[format];
  downloadText({ content: exportText(format), filename, mime });
  showNotice(`Downloaded ${filename}.`, 'success');
};

const loadTokens = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/api/v1/tokens');
    const list = data?.tokens ?? [];
    const categories = new Map(list.map((t) => [t.name, t.category ?? '']));
    allTokens.value = fromDesignSystemTokens(list).map((t) => ({ ...t, category: categories.get(t.name) }));
    pickDefaults();
  } catch (err) {
    error.value = apiErrorMessage(err, 'The token library did not answer.');
  } finally {
    loading.value = false;
  }
};

onMounted(loadTokens);
</script>

<style scoped>
.token-grid {
  @apply grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1;
}
.token-option {
  @apply rounded-tile border border-line bg-surface-raised p-3 text-left transition-colors hover:border-accent-border focus-visible:outline focus-visible:outline-2 outline-focus;
}
.token-option-on {
  @apply border-line-selected bg-accent-subtle;
}
</style>
