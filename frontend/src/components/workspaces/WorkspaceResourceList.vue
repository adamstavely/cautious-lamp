<template>
  <div class="rounded-lg border p-6" :class="c.card">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h2 class="text-xl font-semibold flex items-center gap-2" :class="c.heading">
        <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">{{ spec.icon }}</span>
        {{ spec.label }}
      </h2>
      <button
        v-if="canEdit"
        type="button"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
        :class="c.primary"
        @click="openForm()"
      >
        <span class="material-symbols-outlined text-base" aria-hidden="true">add</span>
        Add {{ spec.singular }}
      </button>
    </div>

    <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

    <div v-if="resource.loading.value" class="text-center py-8 text-sm" :class="c.muted">Loading {{ spec.label.toLowerCase() }}…</div>
    <div v-else-if="resource.error.value" class="text-center py-8 text-sm" :class="c.muted">
      {{ resource.error.value }}
      <button type="button" class="ml-2 underline text-indigo-600" @click="resource.load()">Try again</button>
    </div>
    <div v-else-if="resource.items.value.length === 0" class="text-center py-8 text-sm" :class="c.muted">
      No {{ spec.label.toLowerCase() }} yet
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in resource.items.value" :key="item.id" class="rounded-lg border p-4 flex flex-col" :class="c.subCard">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0">
            <h5 class="font-semibold break-words" :class="c.heading">{{ item[spec.titleField] }}</h5>
            <p v-if="subtitleOf(item)" class="text-sm mt-1 break-words" :class="c.muted">{{ subtitleOf(item) }}</p>
          </div>
          <span class="px-2 py-1 text-xs rounded shrink-0" :class="badgeClass(item)">{{ badgeText(item) }}</span>
        </div>

        <!-- Previews: images by http(s) URL only, SVG as a sanitized image, Markdown sanitized -->
        <img
          v-if="spec.image && previewUrl(item)"
          :src="previewUrl(item)"
          :alt="item[spec.titleField]"
          class="mt-2 max-h-32 w-full object-contain rounded"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <img v-if="spec.svg && svgSrc(item)" :src="svgSrc(item)" :alt="item[spec.titleField]" class="mt-2 h-12 w-12 object-contain" />
        <p v-if="item.description" class="text-xs mt-2 line-clamp-3" :class="c.muted">{{ item.description }}</p>
        <div
          v-if="spec.markdown && item[spec.markdown]"
          class="mt-2 text-sm prose prose-sm max-w-none dark:prose-invert line-clamp-6"
          v-html="markdownHtml(item)"
        />
        <a
          v-if="safeHttpUrl(item.url) && !spec.image"
          :href="safeHttpUrl(item.url)"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs mt-2 text-indigo-600 hover:text-indigo-700 break-all"
        >
          {{ item.url }}
        </a>
        <div v-if="item.tags?.length" class="flex flex-wrap gap-1 mt-2">
          <span v-for="tag in item.tags" :key="tag" class="px-2 py-0.5 rounded text-xs" :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'">{{ tag }}</span>
        </div>

        <div v-if="owned(item) && canEdit" class="flex items-center gap-2 mt-auto pt-3">
          <button type="button" class="text-xs px-2 py-1 rounded transition-colors" :class="c.chip" @click="openForm(item)">Edit</button>
          <button type="button" class="text-xs px-2 py-1 rounded transition-colors" :class="c.chip" @click="openShare(item)">Share</button>
          <button type="button" class="text-xs px-2 py-1 rounded transition-colors" :class="c.danger" @click="confirmDelete(item)">Delete</button>
        </div>
        <p v-else-if="!owned(item)" class="text-xs mt-auto pt-3" :class="c.faint">
          From {{ workspaceName(item.workspaceId) }} · read-only
        </p>
      </div>
    </div>

    <!-- Add / edit -->
    <WorkspaceModal
      :open="form.open"
      :title="form.item ? `Edit ${spec.singular}` : `Add ${spec.singular}`"
      :icon="spec.icon"
      :is-dark-mode="isDarkMode"
      :busy="form.saving"
      size="md"
      @close="form.open = false"
    >
      <form class="space-y-4" @submit.prevent="saveForm">
        <InlineNotice :notice="form.error ? { type: 'error', message: form.error } : null" @dismiss="form.error = null" />
        <div v-for="field in spec.fields" :key="field.key">
          <label :for="`f-${uid}-${field.key}`" class="block text-sm mb-2" :class="c.label">
            {{ field.label }}{{ field.required ? ' *' : '' }}
          </label>
          <select
            v-if="field.type === 'select'"
            :id="`f-${uid}-${field.key}`"
            v-model="form.values[field.key]"
            :required="field.required"
            :class="[inputClass, c.input]"
          >
            <option v-if="!field.required" value="">—</option>
            <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
          </select>
          <textarea
            v-else-if="['textarea', 'json', 'svg', 'markdown', 'stages'].includes(field.type)"
            :id="`f-${uid}-${field.key}`"
            v-model="form.values[field.key]"
            :rows="field.type === 'textarea' ? 3 : 6"
            :placeholder="field.placeholder"
            :class="[inputClass, c.input, field.type === 'json' || field.type === 'svg' ? 'font-mono text-xs' : '']"
          />
          <input
            v-else
            :id="`f-${uid}-${field.key}`"
            v-model="form.values[field.key]"
            :type="field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'"
            :required="field.required"
            :placeholder="field.placeholder"
            :class="[inputClass, c.input]"
          />
        </div>
        <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
          <button type="submit" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="form.saving ? c.disabled : c.primary" :disabled="form.saving">
            {{ form.saving ? 'Saving…' : form.item ? 'Save' : `Add ${spec.singular}` }}
          </button>
          <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="c.secondary" :disabled="form.saving" @click="form.open = false">
            Cancel
          </button>
        </div>
      </form>
    </WorkspaceModal>

    <ShareDialog
      :open="share.open"
      :item-name="share.item ? share.item[spec.titleField] : ''"
      :sharing="share.item ?? undefined"
      :workspace="workspace"
      :workspaces="workspaces"
      :is-admin="canAdmin"
      :is-dark-mode="isDarkMode"
      :busy="share.saving"
      :error="share.error"
      @close="share.open = false"
      @clear-error="share.error = null"
      @save="saveShare"
    />

    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </div>
</template>

<script setup>
import { computed, reactive, toRef, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import { useWorkspaceResource } from '../../composables/useWorkspaceResource.js';
import ConfirmDialog from './ConfirmDialog.vue';
import ShareDialog from './ShareDialog.vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { bodyFromForm, formValuesFor, resourceKind } from './resourceKinds.js';
import { renderMarkdown, safeHttpUrl, svgDataUri } from './safeContent.js';
import { inputClass, ui } from './ui.js';

/**
 * One kind of workspace item: list, add, edit, delete and share, through
 * useWorkspaceResource(kind). Items shared from other workspaces are read-only.
 */
const props = defineProps({
  /** The workspace being viewed (needs id and settings) */
  workspace: { type: Object, required: true },
  kind: { type: String, required: true },
  /** Workspaces the user can see, for sharing and for naming an item's source */
  workspaces: { type: Array, default: () => [] },
  canEdit: { type: Boolean, default: false },
  canAdmin: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
});

let uidSeq = 0;
const uid = `wr${++uidSeq}${Math.random().toString(36).slice(2, 6)}`;
const c = computed(() => ui(props.isDarkMode));
const spec = computed(() => resourceKind(props.kind));
const resource = useWorkspaceResource(computed(() => props.workspace.id), toRef(props, 'kind'));
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

watch(
  () => [props.workspace.id, props.kind],
  () => {
    resource.reset();
    clearNotice();
    resource.load();
  },
  { immediate: true },
);

const owned = (item) => item.workspaceId === props.workspace.id;
const workspaceName = (id) => props.workspaces.find((ws) => ws.id === id)?.name ?? 'another workspace';
const subtitleOf = (item) => {
  try {
    return spec.value.subtitle?.(item) || '';
  } catch {
    return '';
  }
};
const badgeText = (item) => (item.isGlobal ? 'Global' : !owned(item) ? 'Shared' : item.sharedWith?.length ? `Shared ×${item.sharedWith.length}` : 'Workspace');
const badgeClass = (item) =>
  item.isGlobal
    ? props.isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
    : !owned(item)
      ? props.isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
      : props.isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700';
const previewUrl = (item) => safeHttpUrl(item.thumbnailUrl) || safeHttpUrl(item[spec.value.image]);
const svgSrc = (item) => svgDataUri(item[spec.value.svg]);
const markdownHtml = (item) => renderMarkdown(item[spec.value.markdown]);

// ---------- Add / edit ----------
const form = reactive({ open: false, item: null, values: {}, saving: false, error: null });

const openForm = (item = null) => {
  Object.assign(form, { open: true, item, values: formValuesFor(spec.value, item), saving: false, error: null });
};

const saveForm = async () => {
  let body;
  try {
    body = bodyFromForm(spec.value, form.values, form.item);
  } catch (err) {
    form.error = err.message;
    return;
  }
  if (form.item && Object.keys(body).length === 0) {
    form.open = false;
    return;
  }
  form.saving = true;
  form.error = null;
  try {
    if (form.item) await resource.update(form.item.id, body);
    else await resource.create(body);
    form.open = false;
    showNotice(`${spec.value.singular} ${form.item ? 'saved' : 'added'}.`, 'success');
  } catch (err) {
    form.error = err.message;
  } finally {
    form.saving = false;
  }
};

// ---------- Delete ----------
const confirmDelete = async (item) => {
  const ok = await askConfirm({
    title: `Delete ${spec.value.singular.toLowerCase()}?`,
    message: `"${item[spec.value.titleField]}" will be deleted${item.isGlobal || item.sharedWith?.length ? ' and disappear from the workspaces it is shared with' : ''}. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  try {
    await resource.remove(item.id);
    showNotice(`${spec.value.singular} deleted.`, 'success');
  } catch (err) {
    showNotice(err.message, 'error');
  }
};

// ---------- Share ----------
const share = reactive({ open: false, item: null, saving: false, error: null });

const openShare = (item) => Object.assign(share, { open: true, item, saving: false, error: null });

const saveShare = async (sharing) => {
  share.saving = true;
  share.error = null;
  try {
    await resource.setSharing(share.item.id, sharing);
    share.open = false;
    showNotice('Sharing updated.', 'success');
  } catch (err) {
    share.error = err.message;
  } finally {
    share.saving = false;
  }
};
</script>
