<template>
  <div class="flex flex-col gap-6">
    <div class="library-toolbar">
      <UiInput ref="searchInput" v-model="query" class="library-search" type="search" icon="search" :label="`Search ${noun}`" :placeholder="`Search by name, description or tag`" />
      <UiSelect v-if="filter && filterOptions.length" v-model="filterValue" :label="filter.label" :options="[{ value: '', label: 'All' }, ...filterOptions]" />
      <UiSelect v-if="sourceOptions.length > 1" v-model="sourceValue" label="Source" :options="[{ value: '', label: 'All sources' }, ...sourceOptions]" />
      <UiButton v-if="canAdd" variant="primary" icon="plus" class="library-add" @click="openForm()">Add {{ singular }}</UiButton>
    </div>

    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <UiSpinner v-if="library.loading.value && !library.loaded.value" :label="`Loading ${noun}…`" />
    <UiCallout v-else-if="library.error.value" tone="danger" role="alert">
      {{ library.error.value }}
      <template #actions>
        <UiButton size="sm" @click="library.load()">Try again</UiButton>
      </template>
    </UiCallout>
    <UiEmptyState v-else-if="library.items.value.length === 0" :spot="spot" :title="`No ${noun} yet`">
      <template v-if="canAdd">Add the first one to a workspace you edit. Workspace members see it here, and so does everyone once it is shared globally.</template>
      <template v-else>
        {{ capitalized }} appear here when a workspace you belong to adds them, or when a workspace shares them globally. Ask an editor of your workspace to add them.
      </template>
      <template v-if="canAdd" #actions>
        <UiButton variant="primary" icon="plus" @click="openForm()">Add {{ singular }}</UiButton>
      </template>
    </UiEmptyState>
    <template v-else>
      <p class="text-sm text-ink-secondary" aria-live="polite">{{ countText }}</p>
      <UiEmptyState v-if="visible.length === 0" title="Nothing matches" body="Try another search or clear the filters.">
        <template #actions>
          <UiButton @click="clearFilters">Clear filters</UiButton>
        </template>
      </UiEmptyState>
      <ul v-else ref="cardList" class="library-grid">
        <li v-for="item in visible" :key="item.id" class="library-card">
          <div v-if="spec.image || spec.svg" class="library-media">
            <img v-if="previewOf(item)" :src="previewOf(item)" alt="" class="library-image" loading="lazy" referrerpolicy="no-referrer" />
            <AppIcon v-else :name="spec.icon" class="text-3xl text-ink-muted" />
          </div>
          <div class="flex flex-col gap-1 min-w-0">
            <h3 class="library-title">
              <button type="button" class="library-open" @click="openDetail(item)">{{ titleOf(item) }}</button>
            </h3>
            <p v-if="subtitleOf(item)" class="text-sm text-ink-secondary break-words">{{ subtitleOf(item) }}</p>
          </div>
          <p v-if="item.description" class="text-sm text-ink-secondary line-clamp-3">{{ item.description }}</p>
          <div class="flex flex-wrap gap-1 mt-auto pt-1">
            <UiChip :tone="item.isGlobal ? 'success' : 'neutral'">{{ sourceOf(item) }}</UiChip>
            <UiChip v-for="tag in (item.tags || []).slice(0, 3)" :key="tag">{{ tag }}</UiChip>
          </div>
        </li>
      </ul>
    </template>

    <!-- Detail -->
    <UiDialog :open="detail !== null" :title="detail ? titleOf(detail) : singular" size="lg" @update:open="(open) => !open && (detail = null)">
      <div v-if="detail" class="flex flex-col gap-5">
        <div v-if="previewOf(detail)" class="library-detail-media">
          <img :src="previewOf(detail, true)" :alt="titleOf(detail)" class="library-detail-image" referrerpolicy="no-referrer" />
        </div>
        <p v-if="detail.description" class="text-ink whitespace-pre-line">{{ detail.description }}</p>
        <dl class="library-fields">
          <template v-for="field in detailFields(detail)" :key="field.key">
            <dt class="library-field-label">{{ field.label }}</dt>
            <dd class="library-field-value">
              <ol v-if="field.type === 'stages'" class="list-decimal pl-5 flex flex-col gap-1">
                <li v-for="(stage, index) in detail[field.key]" :key="index">
                  <span class="font-semibold text-ink">{{ stage.name }}</span><template v-if="stage.description">: {{ stage.description }}</template>
                </li>
              </ol>
              <UiLink v-else-if="field.type === 'url'" :href="safeHttpUrl(detail[field.key])" external class="break-all">{{ detail[field.key] }}</UiLink>
              <pre v-else-if="field.type === 'json'" class="library-json">{{ JSON.stringify(detail[field.key], null, 2) }}</pre>
              <div v-else-if="field.type === 'markdown'" class="library-markdown" v-html="renderMarkdown(detail[field.key])" />
              <span v-else-if="field.type === 'list'">{{ detail[field.key].join(', ') }}</span>
              <span v-else class="whitespace-pre-line">{{ detail[field.key] }}</span>
            </dd>
          </template>
          <dt class="library-field-label">Source</dt>
          <dd class="library-field-value">{{ sourceOf(detail) }}</dd>
          <dt class="library-field-label">Last updated</dt>
          <dd class="library-field-value">{{ formatDate(detail.updatedAt) }}<template v-if="detail.updatedBy?.name"> by {{ detail.updatedBy.name }}</template></dd>
        </dl>
        <div v-if="detail.tags?.length" class="flex flex-wrap gap-1">
          <UiChip v-for="tag in detail.tags" :key="tag">{{ tag }}</UiChip>
        </div>
        <p v-if="!library.canEdit(detail)" class="text-sm text-ink-muted">
          Read-only: only editors of {{ library.workspaceName(detail.workspaceId) ?? 'the workspace that owns it' }} can change it.
        </p>
      </div>
      <template #footer>
        <UiButton v-if="detail && safeHttpUrl(detail.url)" :href="safeHttpUrl(detail.url)" target="_blank" rel="noopener noreferrer" icon="external-link">Open</UiButton>
        <template v-if="detail && library.canEdit(detail)">
          <UiButton icon="pencil" @click="openForm(detail)">Edit</UiButton>
          <UiButton variant="danger" icon="trash-2" @click="confirmDelete(detail)">Delete</UiButton>
        </template>
      </template>
    </UiDialog>

    <!-- Add / edit -->
    <ResourceFormDialog :open="form.open" :spec="spec" :item="form.item" :save="saveForm" @close="form.open = false" @saved="onSaved">
      <UiSelect
        v-if="!form.item"
        v-model="form.workspaceId"
        label="Workspace"
        hint="Its members can see it; editors there can change it."
        required
        :options="library.editableWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name }))"
      />
    </ResourceFormDialog>

    <ConfirmDialog :state="confirmState" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { AppIcon, UiButton, UiCallout, UiChip, UiDialog, UiEmptyState, UiInput, UiLink, UiSelect, UiSpinner } from '../ui';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import { useResourceLibrary } from '../../composables/useResourceLibrary.js';
import ConfirmDialog from './ConfirmDialog.vue';
import ResourceFormDialog from './ResourceFormDialog.vue';
import { resourceKind } from './resourceKinds.js';
import { renderMarkdown, safeHttpUrl, svgDataUri } from './safeContent.js';
import { formatDate } from './ui.js';
import { focusAfterRemoval } from '../../utils/focusAfterRemoval';

/**
 * A browsable library of one workspace item kind across every workspace the
 * user can read (useResourceLibrary): search, filters, a detail view, and
 * add / edit / delete for editors of the workspace that owns an item.
 */
const props = defineProps({
  /** A kind from resourceKinds.js, e.g. "journey-maps" */
  kind: { type: String, required: true },
  /** Plural noun for messages, e.g. "journey maps" */
  noun: { type: String, required: true },
  /** Singular for buttons, e.g. "journey map" */
  singular: { type: String, required: true },
  /** A field to filter by: { key, label }; options come from the items (or `options` when given) */
  filter: { type: Object, default: null },
  /** Spot illustration for the empty state */
  spot: { type: String, default: '' },
});

const spec = computed(() => resourceKind(props.kind));
const library = useResourceLibrary(computed(() => props.kind));
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

onMounted(() => library.load());

const capitalized = computed(() => props.noun.charAt(0).toUpperCase() + props.noun.slice(1));
const canAdd = computed(() => library.editableWorkspaces.value.length > 0);

// ---------- Display ----------
const titleOf = (item) => item[spec.value.titleField] || 'Untitled';
const subtitleOf = (item) => {
  try {
    return spec.value.subtitle?.(item) || '';
  } catch {
    return '';
  }
};
const sourceOf = (item) => (item.isGlobal ? 'Global' : library.workspaceName(item.workspaceId) ?? 'Shared with you');
/** Image URL (http(s) only) or sanitized SVG; the full image rather than the thumbnail when `full` */
const previewOf = (item, full = false) => {
  if (spec.value.svg) return svgDataUri(item[spec.value.svg]);
  if (!spec.value.image) return null;
  const image = safeHttpUrl(item[spec.value.image]);
  return full ? image || safeHttpUrl(item.thumbnailUrl) : safeHttpUrl(item.thumbnailUrl) || image;
};
// The title, description and tags are shown on their own; image kinds' URLs are the preview
const SHOWN_APART = ['description', 'tags', 'thumbnailUrl', 'svg'];
const detailFields = (item) =>
  spec.value.fields.filter((field) => {
    if (field.key === spec.value.titleField || SHOWN_APART.includes(field.key)) return false;
    const value = item[field.key];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (field.type === 'url' && !safeHttpUrl(value)) return false;
    return true;
  });

// ---------- Search and filters ----------
const query = ref('');
const searchInput = ref(null);
const cardList = ref(null);
const filterValue = ref('');
const sourceValue = ref('');

const filterOptions = computed(() => {
  if (!props.filter) return [];
  const field = spec.value.fields.find((f) => f.key === props.filter.key);
  const values = field?.options ?? [...new Set(library.items.value.map((item) => item[props.filter.key]).filter(Boolean))].sort();
  return values.map((value) => ({ value, label: value }));
});

const sourceOptions = computed(() => {
  const seen = new Map();
  for (const item of library.items.value) {
    const key = item.isGlobal ? 'global' : item.workspaceId;
    if (!seen.has(key)) seen.set(key, sourceOf(item));
  }
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
});

const searchText = (item) =>
  [titleOf(item), subtitleOf(item), item.description, ...(item.tags || []), ...spec.value.fields.filter((f) => ['text', 'select'].includes(f.type)).map((f) => item[f.key])]
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase();

const visible = computed(() => {
  const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return library.items.value.filter((item) => {
    if (props.filter && filterValue.value && item[props.filter.key] !== filterValue.value) return false;
    if (sourceValue.value && (item.isGlobal ? 'global' : item.workspaceId) !== sourceValue.value) return false;
    if (!words.length) return true;
    const text = searchText(item);
    return words.every((word) => text.includes(word));
  });
});

const countText = computed(() => {
  const total = library.items.value.length;
  const shown = visible.value.length;
  return shown === total ? `${total} ${total === 1 ? props.singular : props.noun}` : `${shown} of ${total} ${props.noun}`;
});

const clearFilters = () => {
  query.value = '';
  filterValue.value = '';
  sourceValue.value = '';
};

// ---------- Detail ----------
const detail = ref(null);
const openDetail = (item) => {
  detail.value = item;
};

// ---------- Add / edit ----------
const form = reactive({ open: false, item: null, workspaceId: '' });

const openForm = (item = null) => {
  Object.assign(form, { open: true, item, workspaceId: item ? item.workspaceId : (library.editableWorkspaces.value[0]?.id ?? '') });
};

const saveForm = (body) => {
  if (form.item) return library.update(form.item, body);
  if (!form.workspaceId) throw new Error('Choose a workspace.');
  return library.create(form.workspaceId, body);
};

const onSaved = (saved) => {
  showNotice(`${spec.value.singular} ${form.item ? 'saved' : 'added'}.`, 'success');
  if (detail.value && saved?.id === detail.value.id) detail.value = saved;
  form.open = false;
};

// ---------- Delete ----------
const confirmDelete = async (item) => {
  const ok = await askConfirm({
    title: `Delete ${props.singular}?`,
    message: `"${titleOf(item)}" will be deleted${item.isGlobal || item.sharedWith?.length ? ' and disappear from the workspaces it is shared with' : ''}. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  const index = visible.value.findIndex((i) => i.id === item.id);
  try {
    await library.remove(item);
    detail.value = null;
    showNotice(`${spec.value.singular} deleted.`, 'success');
    // The dialog would hand focus back to the deleted card: move it to the card
    // now in its place (or the one before), else the search field
    await nextTick();
    focusAfterRemoval(cardList.value, index, { fallback: searchInput.value?.$el.querySelector('input') });
  } catch (err) {
    showNotice(err.message, 'error');
  }
};
</script>

<style scoped>
.library-toolbar {
  @apply flex flex-wrap items-end gap-4;
}
.library-search {
  @apply flex-1 basis-64;
}
.library-add {
  @apply ml-auto;
}
.library-grid {
  @apply grid sm:grid-cols-2 lg:grid-cols-3 gap-4;
}
.library-card {
  @apply relative flex flex-col gap-3 rounded-card border border-line bg-surface-raised p-5 transition-colors hover:border-accent-border;
}
.library-media {
  @apply flex items-center justify-center h-36 overflow-hidden rounded-tile bg-surface-sunken p-3;
}
.library-image {
  @apply h-full w-full object-contain;
}
.library-title {
  @apply text-lg font-semibold text-ink-strong break-words;
}
/* The title opens the detail; its hit area covers the whole card */
.library-open {
  @apply text-left rounded-control hover:text-accent-text focus-visible:outline focus-visible:outline-2 outline-focus;
}
.library-open::after {
  @apply absolute inset-0 rounded-card;
  content: '';
}
.library-detail-media {
  @apply grid place-items-center rounded-tile bg-surface-sunken p-4;
}
.library-detail-image {
  @apply h-72 w-full object-contain;
}
.library-fields {
  @apply grid sm:grid-cols-aside-content gap-x-6 gap-y-3;
}
.library-field-label {
  @apply text-sm font-semibold text-ink-strong;
}
.library-field-value {
  @apply text-sm text-ink-secondary break-words;
}
.library-json {
  @apply overflow-x-auto rounded-control bg-surface-sunken p-3 font-code text-xs text-ink;
}
.library-markdown {
  @apply text-sm text-ink-secondary;
}
.library-markdown :deep(p),
.library-markdown :deep(ul),
.library-markdown :deep(ol) {
  @apply mb-2;
}
.library-markdown :deep(ul) {
  @apply list-disc pl-5;
}
.library-markdown :deep(a) {
  @apply text-accent-text underline;
}
</style>
