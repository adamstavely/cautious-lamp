<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens', label: 'Design tokens' }"
      title="Token studio"
      lead="Create design tokens in the Design Token Community Group (DTCG) format, save them to a workspace's style library, and export them for the web, iOS and Android."
      spot="foundations/token-studio"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="save" :disabled="!tokens.length" @click="showSaveDialog = true">Save to library</UiButton>
        <UiButton icon="upload" @click="fileInput?.click()">Import JSON</UiButton>
        <UiButton icon="library" to="/tokens/library">Style library</UiButton>
      </template>
    </PageHero>
    <input ref="fileInput" type="file" accept=".json,application/json" class="sr-only" tabindex="-1" aria-hidden="true" @change="importFile" />

    <div class="flex flex-col gap-4 mb-6">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
      <UiCallout v-if="loadedDictionary" tone="info" role="status">
        Editing <strong>{{ loadedDictionary.name }}</strong> from {{ library.workspaceName(loadedDictionary.workspaceId) ?? 'a shared workspace' }}.
        <template v-if="!library.canEdit(loadedDictionary)"> You can read it but not change it; saving makes a copy.</template>
      </UiCallout>
      <p v-if="openingDictionary" class="flex items-center gap-2 text-sm text-ink-secondary"><UiSpinner /> Opening the style dictionary…</p>
    </div>

    <div class="grid lg:grid-cols-4 gap-6 pb-12">
      <div class="lg:col-span-1 flex flex-col gap-6">
        <UiPanel title="Categories">
          <template #actions>
            <UiButton icon-only icon="plus" variant="ghost" size="sm" label="Add category" @click="showCategoryDialog = true" />
          </template>
          <nav aria-label="Token categories">
            <ul class="flex flex-col gap-1">
              <li v-for="category in categories" :key="category.id">
                <button
                  type="button"
                  class="category-button"
                  :class="{ 'category-button-active': selectedCategory === category.id }"
                  :aria-current="selectedCategory === category.id ? 'true' : undefined"
                  @click="selectedCategory = category.id"
                >
                  <span class="flex items-center gap-2 min-w-0"><AppIcon :name="category.icon" class="text-base shrink-0" /><span class="truncate">{{ category.name }}</span></span>
                  <span class="text-xs text-ink-muted">{{ categoryCount(category.id) }}</span>
                </button>
              </li>
            </ul>
          </nav>
        </UiPanel>

        <UiPanel title="Export" description="Every token, in one file.">
          <div class="flex flex-col gap-2">
            <UiButton v-for="format in EXPORT_FORMATS" :key="format.value" :icon="format.icon" size="sm" :disabled="!tokens.length" @click="exportTokens(format.value)">
              {{ format.label }}
            </UiButton>
          </div>
        </UiPanel>
      </div>

      <div class="lg:col-span-3">
        <UiPanel :title="`${categoryName(selectedCategory)} tokens`" :description="`${filteredTokens.length} token${filteredTokens.length === 1 ? '' : 's'}`">
          <template #actions>
            <UiButton variant="primary" icon="plus" size="sm" @click="openNewToken">Add token</UiButton>
          </template>
          <TokenList v-if="filteredTokens.length" :tokens="filteredTokens" @edit="editToken" @delete="deleteToken" />
          <UiEmptyState
            v-else
            title="No tokens yet"
            :body="`Add your first ${categoryName(selectedCategory).toLowerCase()} token, import a DTCG JSON file, or open a dictionary from the style library.`"
            :bordered="false"
          >
            <template #actions>
              <UiButton variant="primary" icon="plus" @click="openNewToken">Add token</UiButton>
            </template>
          </UiEmptyState>
        </UiPanel>
      </div>
    </div>

    <UiDialog v-model:open="showTokenDialog" :title="editingToken ? 'Edit token' : 'Add token'">
      <form id="token-studio-token-form" class="flex flex-col gap-5" @submit.prevent="saveToken">
        <UiInput v-model="tokenForm.name" label="Token name" required mono placeholder="color.primary.500" hint="Dot notation, e.g. color.primary.500" :error="tokenFormErrors.name" @blur="validateTokenName" />
        <UiSelect v-model="tokenForm.$type" label="Type" :options="tokenTypeOptions" required />
        <UiCheckbox v-if="tokenForm.$type === 'color'" v-model="tokenForm.useAlias" label="Reference another token (alias)" />
        <UiInput
          v-model="tokenForm.$value"
          label="Value"
          required
          mono
          :placeholder="tokenForm.useAlias ? '{color.primary.500}' : valuePlaceholder(tokenForm.$type)"
          :hint="tokenForm.useAlias ? 'The name of another token in braces' : valueHint(tokenForm.$type)"
          :error="tokenFormErrors.value"
          @blur="validateTokenValue"
        />
        <div v-if="tokenForm.$type === 'color' && !tokenForm.useAlias" class="w-32">
          <UiInput
            type="color"
            label="Pick a colour"
            :model-value="pickerValue(tokenForm.$value)"
            @update:model-value="tokenForm.$value = $event"
          />
        </div>
        <UiTextarea v-model="tokenForm.$description" label="Description" :rows="3" placeholder="What the token is for" />
      </form>
      <template #footer>
        <UiButton @click="showTokenDialog = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="token-studio-token-form" :disabled="!tokenForm.name || !tokenForm.$type || !tokenForm.$value">
          {{ editingToken ? 'Save token' : 'Add token' }}
        </UiButton>
      </template>
    </UiDialog>

    <UiDialog v-model:open="showCategoryDialog" title="Add category" size="sm">
      <form id="token-studio-category-form" class="flex flex-col gap-5" @submit.prevent="addCategory">
        <UiInput v-model="newCategoryName" label="Category name" required placeholder="e.g. Motion" :error="categoryError" @blur="validateCategoryName" />
      </form>
      <template #footer>
        <UiButton @click="showCategoryDialog = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="token-studio-category-form" :disabled="!newCategoryName.trim()">Add category</UiButton>
      </template>
    </UiDialog>

    <SaveDictionaryDialog v-model:open="showSaveDialog" :tokens="tokens" :dictionary="loadedDictionary" :library="library" @saved="onSaved" />
    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import SaveDictionaryDialog from '../components/tokens/SaveDictionaryDialog.vue';
import TokenList from '../components/tokens/TokenList.vue';
import {
  PageHero, PageShell, UiButton, UiCallout, UiCheckbox, UiDialog, UiEmptyState, UiInput, UiPanel, UiSelect, UiSpinner, UiTextarea,
} from '../components/ui';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';
import { useResourceLibrary } from '../composables/useResourceLibrary.js';
import { categoryFromName, dictionaryTokens, dtcgToTokens, tokensToDtcg } from '../utils/styleDictionary.js';
import { EXPORT_FORMATS, downloadText, exportTokenFile } from '../utils/tokenExport.js';

const route = useRoute();
const router = useRouter();
const { notice, showNotice, clearNotice } = useNotice();
const library = useResourceLibrary('style-dictionaries');

// The working draft stays in this browser between visits; saved dictionaries live in a workspace
const DRAFT_KEY = 'designTokens';
const CATEGORIES_KEY = 'tokenCategories';

const tokenTypeOptions = [
  { label: 'Color', value: 'color' },
  { label: 'Dimension', value: 'dimension' },
  { label: 'Font family', value: 'fontFamily' },
  { label: 'Font weight', value: 'fontWeight' },
  { label: 'Duration', value: 'duration' },
  { label: 'Cubic bezier', value: 'cubicBezier' },
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
];

const categories = ref([
  { id: 'color', name: 'Colors', icon: 'palette' },
  { id: 'spacing', name: 'Spacing', icon: 'layout-panel-left' },
  { id: 'typography', name: 'Typography', icon: 'type' },
  { id: 'shadow', name: 'Shadows', icon: 'layers' },
  { id: 'border', name: 'Borders', icon: 'square-dashed' },
  { id: 'radius', name: 'Border radius', icon: 'circle-dot' },
  { id: 'opacity', name: 'Opacity', icon: 'droplet' },
  { id: 'duration', name: 'Duration', icon: 'clock' },
]);

const selectedCategory = ref('color');
const tokens = ref([]);
const loadedDictionary = ref(null);
const openingDictionary = ref(false);
const fileInput = ref(null);

const showTokenDialog = ref(false);
const showCategoryDialog = ref(false);
const showSaveDialog = ref(false);
const editingToken = ref(null);
const newCategoryName = ref('');
const categoryError = ref('');

const blankForm = () => ({ name: '', $type: 'color', $value: '', $description: '', useAlias: false });
const tokenForm = ref(blankForm());
const tokenFormErrors = ref({ name: '', value: '' });

const tokenCategory = (token) => token.category || categoryFromName(token.name);
const filteredTokens = computed(() => tokens.value.filter((token) => tokenCategory(token) === selectedCategory.value));
const categoryCount = (id) => tokens.value.filter((token) => tokenCategory(token) === id).length;
const categoryName = (id) => categories.value.find((c) => c.id === id)?.name ?? id;

const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value ?? ''));
// A native colour input only takes #rrggbb
const pickerValue = (value) => (isHex(value) ? value : '#000000');
const isAlias = (value) => typeof value === 'string' && /^\{[^{}]+\}$/.test(value.trim());

const PLACEHOLDERS = {
  color: '#2f5ea8', dimension: '16px', fontFamily: 'Inter, sans-serif', fontWeight: '400',
  duration: '200ms', cubicBezier: '0.4, 0.0, 0.2, 1', number: '1.5', string: 'value',
};
const HINTS = {
  color: 'Hex, RGB or HSL',
  dimension: 'A value with a unit (px, rem, em)',
  fontFamily: 'A font family or stack',
  fontWeight: 'A weight from 100 to 900',
  duration: 'A time with a unit (ms, s)',
  cubicBezier: 'Four comma-separated numbers',
  number: 'A number',
  string: 'Text',
};
const valuePlaceholder = (type) => PLACEHOLDERS[type] ?? '';
const valueHint = (type) => HINTS[type] ?? '';

const saveDraft = () => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(tokens.value));
  } catch {
    // Storage can be full or blocked; the draft just won't survive a reload
  }
};

const loadDraft = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    tokens.value = Array.isArray(stored) ? stored : [];
  } catch {
    tokens.value = [];
  }
};

const loadCategories = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    for (const category of Array.isArray(stored) ? stored : []) {
      if (category?.id && !categories.value.some((c) => c.id === category.id)) categories.value.push(category);
    }
  } catch {
    // Ignore a damaged list; the built-in categories still show
  }
};

const validateTokenName = () => {
  const name = tokenForm.value.name.trim();
  if (!name) tokenFormErrors.value.name = 'Give the token a name';
  else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(name)) tokenFormErrors.value.name = 'Start with a letter; use only letters, numbers, dots, underscores and hyphens';
  else if (tokens.value.some((t) => t.name === name && t.id !== editingToken.value?.id)) tokenFormErrors.value.name = 'A token with this name already exists';
  else tokenFormErrors.value.name = '';
};

const validateTokenValue = () => {
  const value = String(tokenForm.value.$value ?? '').trim();
  if (!value) tokenFormErrors.value.value = 'Give the token a value';
  else if (tokenForm.value.useAlias && !isAlias(value)) tokenFormErrors.value.value = 'An alias is another token\'s name in braces, e.g. {color.primary.500}';
  else tokenFormErrors.value.value = '';
};

const openNewToken = () => {
  editingToken.value = null;
  tokenForm.value = blankForm();
  tokenFormErrors.value = { name: '', value: '' };
  showTokenDialog.value = true;
};

const editToken = (token) => {
  editingToken.value = token;
  tokenForm.value = {
    name: token.name,
    $type: token.$type || 'string',
    $value: typeof token.$value === 'object' ? JSON.stringify(token.$value) : String(token.$value ?? ''),
    $description: token.$description || '',
    useAlias: isAlias(token.$value),
  };
  tokenFormErrors.value = { name: '', value: '' };
  showTokenDialog.value = true;
};

const { confirmState, askConfirm } = useConfirmDialog();

const deleteToken = async (token) => {
  const ok = await askConfirm({
    title: `Delete ${token.name}?`,
    message: 'The token is removed from this draft. Save the dictionary to keep the change.',
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  tokens.value = tokens.value.filter((t) => t.id !== token.id);
  saveDraft();
};

const saveToken = () => {
  validateTokenName();
  validateTokenValue();
  if (tokenFormErrors.value.name || tokenFormErrors.value.value) return;
  const token = {
    id: editingToken.value?.id ?? `${Date.now()}-${tokens.value.length}`,
    name: tokenForm.value.name.trim(),
    category: editingToken.value ? tokenCategory(editingToken.value) : selectedCategory.value,
    $type: tokenForm.value.$type,
    $value: tokenForm.value.$value.trim(),
  };
  if (tokenForm.value.$description.trim()) token.$description = tokenForm.value.$description.trim();
  tokens.value = editingToken.value ? tokens.value.map((t) => (t.id === editingToken.value.id ? token : t)) : [...tokens.value, token];
  saveDraft();
  showTokenDialog.value = false;
};

const validateCategoryName = () => {
  const name = newCategoryName.value.trim();
  if (!name) categoryError.value = 'Give the category a name';
  else if (categories.value.some((c) => c.name.toLowerCase() === name.toLowerCase())) categoryError.value = 'A category with this name already exists';
  else categoryError.value = '';
};

const addCategory = () => {
  validateCategoryName();
  if (categoryError.value) return;
  const name = newCategoryName.value.trim();
  const category = { id: name.toLowerCase().replace(/\s+/g, '-'), name, icon: 'folder' };
  categories.value.push(category);
  selectedCategory.value = category.id;
  newCategoryName.value = '';
  showCategoryDialog.value = false;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories.value.filter((c) => c.icon === 'folder')));
  } catch {
    // The category still works for this visit
  }
};

const exportTokens = (format) => {
  downloadText(exportTokenFile(tokensToDtcg(tokens.value), format, loadedDictionary.value?.name?.replace(/\s+/g, '-') || 'tokens'));
};

const importFile = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const imported = dtcgToTokens(JSON.parse(await file.text()));
    if (!imported.length) {
      showNotice('No tokens found. Tokens need a "$value" (DTCG format).', 'error');
      return;
    }
    const existing = new Set(tokens.value.map((t) => t.name));
    const added = imported.filter((t) => !existing.has(t.name));
    tokens.value = [...tokens.value, ...added];
    saveDraft();
    const skipped = imported.length - added.length;
    showNotice(`Imported ${added.length} token${added.length === 1 ? '' : 's'}${skipped ? `; ${skipped} already existed` : ''}.`, 'success');
  } catch (err) {
    showNotice(`Could not import the file: ${err.message}`, 'error');
  }
};

const openDictionary = async (id) => {
  openingDictionary.value = true;
  try {
    if (!library.loaded.value) await library.load();
    if (library.error.value) {
      showNotice(`Could not open the style dictionary: ${library.error.value}`, 'error');
      return;
    }
    const dictionary = library.items.value.find((item) => item.id === String(id));
    if (!dictionary) {
      showNotice('That style dictionary was not found, or you can\'t see it. Your draft is unchanged.', 'error');
      return;
    }
    loadedDictionary.value = dictionary;
    tokens.value = dictionaryTokens(dictionary);
    saveDraft();
  } finally {
    openingDictionary.value = false;
  }
};

const onSaved = (saved, { created }) => {
  loadedDictionary.value = saved;
  showNotice(created ? `Saved ${saved.name} to the style library.` : `Saved changes to ${saved.name}.`, 'success');
  if (route.query.load !== saved.id) router.replace({ query: { ...route.query, load: saved.id } });
};

watch(
  () => route.query.load,
  (id) => {
    if (id && id !== loadedDictionary.value?.id) openDictionary(id);
  },
);

onMounted(() => {
  loadCategories();
  loadDraft();
  if (route.query.load) openDictionary(route.query.load);
  // Workspaces for the save dialog
  else library.load();
});
</script>

<style scoped>
.category-button {
  @apply flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-secondary hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.category-button-active {
  @apply bg-accent-subtle text-accent-text;
}
</style>
