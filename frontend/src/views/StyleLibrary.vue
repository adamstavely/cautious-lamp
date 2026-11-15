<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tokens', label: 'Design tokens' }"
      title="Style library"
      lead="The style dictionaries saved in your workspaces from Token studio, AI tokens and the Design extractor. View their tokens, copy values and export them."
      spot="foundations/design-themes"
      size="tool"
    >
      <template #actions>
        <UiButton to="/tokens/studio" icon="plus">New in Token studio</UiButton>
      </template>
    </PageHero>

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <!-- One dictionary -->
    <PageSection v-if="selected" :title="selected.name" :description="selected.description">
      <template #actions>
        <UiButton variant="ghost" icon="arrow-left" @click="selectedId = null">All dictionaries</UiButton>
      </template>

      <div class="flex flex-wrap items-center gap-2 mb-6 text-sm text-ink-secondary">
        <UiChip v-if="isRetired(selected)" tone="warning">Retired</UiChip>
        <UiChip>{{ countLabel(selectedTokens.length) }}</UiChip>
        <span v-if="workspaceName(selected.workspaceId)">In {{ workspaceName(selected.workspaceId) }}</span>
        <span v-if="selected.updatedAt">· Updated {{ formatDate(selected.updatedAt) }}</span>
      </div>

      <div class="flex flex-wrap items-end gap-3 mb-8">
        <UiSelect v-model="exportFormat" label="Export format" :options="EXPORT_FORMATS" size="sm" class="w-48" />
        <UiButton icon="download" @click="exportDictionary(selected)">Export</UiButton>
        <UiButton variant="secondary" icon="copy" @click="copyAll(selected)">Copy JSON</UiButton>
        <UiButton variant="secondary" icon="pencil" :to="`/tokens/studio?load=${encodeURIComponent(selected.id)}`">Open in Token studio</UiButton>
        <UiButton
          v-if="canEdit(selected)"
          variant="ghost"
          :icon="isRetired(selected) ? 'archive-restore' : 'archive'"
          :loading="retiring"
          @click="toggleRetired(selected)"
        >
          {{ isRetired(selected) ? 'Restore' : 'Retire' }}
        </UiButton>
      </div>

      <UiEmptyState v-if="!selectedTokens.length" title="No tokens" body="This dictionary has no tokens yet. Open it in Token studio to add some." />
      <div v-else class="flex flex-col gap-6">
        <UiPanel v-for="group in groupedTokens" :key="group.category" heading-tag="h3" :title="group.category" :description="countLabel(group.tokens.length)">
          <TokenList :tokens="group.tokens">
            <template #actions="{ token }">
              <UiButton icon-only icon="copy" variant="ghost" size="sm" :label="`Copy the value of ${token.name}`" @click="copyValue(token)" />
            </template>
          </TokenList>
        </UiPanel>
      </div>
    </PageSection>

    <!-- All dictionaries -->
    <PageSection v-else title="Dictionaries" :description="summary">
      <template #actions>
        <UiSegmented v-model="filter" label="Show" hide-label :options="filterOptions" />
      </template>

      <div v-if="loading && !loaded" class="flex justify-center py-12"><UiSpinner label="Loading style dictionaries" /></div>

      <UiCallout v-else-if="error" tone="danger" title="The style library didn't load">
        {{ error }}
        <template #actions><UiButton variant="secondary" size="sm" icon="refresh-cw" @click="load">Try again</UiButton></template>
      </UiCallout>

      <UiEmptyState
        v-else-if="!shown.length && filter === 'active'"
        spot="foundations/design-themes"
        title="No style dictionaries yet"
        body="Build tokens in Token studio or extract them from a website, then save them to a workspace."
      >
        <template #actions>
          <UiButton to="/tokens/studio" icon="plus">Open Token studio</UiButton>
          <UiButton to="/tokens/extract" variant="secondary" icon="globe">Design extractor</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState v-else-if="!shown.length" title="No retired dictionaries" body="Dictionaries you retire stay here for reference." />

      <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <UiPanel v-for="dictionary in shown" :key="dictionary.id">
          <div class="flex flex-col gap-3 h-full">
            <div>
              <h3 class="text-lg font-semibold text-ink-strong">
                <button type="button" class="dictionary-link" @click="selectedId = dictionary.id">{{ dictionary.name }}</button>
              </h3>
              <p class="text-sm text-ink-muted">
                {{ countLabel(tokenCount(dictionary)) }}<template v-if="workspaceName(dictionary.workspaceId)"> · {{ workspaceName(dictionary.workspaceId) }}</template>
              </p>
            </div>
            <p v-if="dictionary.description" class="text-sm text-ink-secondary line-clamp-2">{{ dictionary.description }}</p>
            <div v-if="colorPreview(dictionary).length" class="flex flex-wrap gap-1">
              <UiSwatch v-for="token in colorPreview(dictionary)" :key="token.name" :color="token.$value" size="sm" :label="`${token.name}: ${token.$value}`" />
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-auto pt-2">
              <UiChip v-if="isRetired(dictionary)" tone="warning">Retired</UiChip>
              <span class="flex-1" />
              <UiButton size="sm" variant="secondary" icon="eye" @click="selectedId = dictionary.id">View</UiButton>
              <UiButton size="sm" variant="ghost" icon-only icon="copy" :label="`Copy ${dictionary.name} as JSON`" @click="copyAll(dictionary)" />
            </div>
          </div>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import TokenList from '../components/tokens/TokenList.vue';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiEmptyState, UiPanel, UiSegmented, UiSelect, UiSpinner, UiSwatch,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { useResourceLibrary } from '../composables/useResourceLibrary.js';
import { dictionaryTokens, isRetired, withRetired } from '../utils/styleDictionary.js';
import { EXPORT_FORMATS, downloadText, exportTokenFile } from '../utils/tokenExport.js';

// Saved style dictionaries: the `style-dictionaries` item kind across the user's workspaces
const { items, loading, loaded, error, load, canEdit, workspaceName, update } = useResourceLibrary('style-dictionaries');
const { notice, showNotice, clearNotice } = useNotice();

const filter = ref('active');
const selectedId = ref(null);
const exportFormat = ref('json');
const retiring = ref(false);

const active = computed(() => items.value.filter((d) => !isRetired(d)));
const retired = computed(() => items.value.filter((d) => isRetired(d)));
const shown = computed(() => (filter.value === 'active' ? active.value : retired.value));
const filterOptions = computed(() => [
  { value: 'active', label: `Active (${active.value.length})` },
  { value: 'retired', label: `Retired (${retired.value.length})` },
]);

const tokenCount = (dictionary) => dictionaryTokens(dictionary).length;
const countLabel = (n) => `${n} token${n === 1 ? '' : 's'}`;
const summary = computed(() => {
  if (!loaded.value) return '';
  const total = active.value.reduce((sum, d) => sum + tokenCount(d), 0);
  return `${active.value.length} active dictionar${active.value.length === 1 ? 'y' : 'ies'} with ${countLabel(total)}.`;
});

const isColor = (token) => token.$type === 'color' && typeof token.$value === 'string' && !token.$value.trim().startsWith('{');
const colorPreview = (dictionary) => dictionaryTokens(dictionary).filter(isColor).slice(0, 16);

const selected = computed(() => items.value.find((d) => d.id === selectedId.value) ?? null);
const selectedTokens = computed(() => dictionaryTokens(selected.value));
const groupedTokens = computed(() => {
  const groups = new Map();
  for (const token of selectedTokens.value) {
    if (!groups.has(token.category)) groups.set(token.category, []);
    groups.get(token.category).push(token);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, tokens]) => ({ category, tokens }));
});

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fileBase = (dictionary) => `${dictionary.name.trim().replace(/\s+/g, '-').toLowerCase() || 'style-dictionary'}-tokens`;

const copyText = async (text, message) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(message, 'success');
  } catch {
    showNotice('The browser did not allow copying to the clipboard.', 'error');
  }
};

const copyValue = (token) => {
  const value = token.$value && typeof token.$value === 'object' ? JSON.stringify(token.$value) : String(token.$value ?? '');
  copyText(value, `Copied ${token.name}.`);
};

const copyAll = (dictionary) => copyText(JSON.stringify(dictionary.tokens ?? {}, null, 2), `Copied ${dictionary.name} as DTCG JSON.`);

const exportDictionary = (dictionary) => {
  downloadText(exportTokenFile(dictionary.tokens ?? {}, exportFormat.value, fileBase(dictionary)));
};

const toggleRetired = async (dictionary) => {
  const retire = !isRetired(dictionary);
  retiring.value = true;
  try {
    await update(dictionary, { tags: withRetired(dictionary.tags, retire) });
    showNotice(retire ? `${dictionary.name} is retired.` : `${dictionary.name} is active again.`, 'success');
  } catch (err) {
    showNotice(err.message, 'error');
  } finally {
    retiring.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.dictionary-link {
  @apply text-left hover:text-accent-text hover:underline focus-visible:outline focus-visible:outline-2 outline-focus rounded-control;
}
</style>
