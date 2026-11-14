<template>
  <UiPanel :title="spec.label">
    <template v-if="canEdit" #actions>
      <UiButton variant="primary" size="sm" icon="add" @click="openForm()">Add {{ spec.singular }}</UiButton>
    </template>

    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <UiSpinner v-if="resource.loading.value" :label="`Loading ${spec.label.toLowerCase()}…`" />
    <UiCallout v-else-if="resource.error.value" tone="danger" role="alert">
      {{ resource.error.value }}
      <template #actions>
        <UiButton size="sm" @click="resource.load()">Try again</UiButton>
      </template>
    </UiCallout>
    <p v-else-if="resource.items.value.length === 0" class="py-6 text-center text-sm text-ink-muted">No {{ spec.label.toLowerCase() }} yet</p>

    <ul v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="item in resource.items.value" :key="item.id" class="flex flex-col gap-2 rounded-tile border border-line bg-surface-sunken p-4">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-semibold text-ink-strong break-words">{{ item[spec.titleField] }}</h3>
            <p v-if="subtitleOf(item)" class="mt-1 text-sm text-ink-secondary break-words">{{ subtitleOf(item) }}</p>
          </div>
          <UiChip :tone="badgeTone(item)" class="shrink-0">{{ badgeText(item) }}</UiChip>
        </div>

        <!-- Previews: images by http(s) URL only, SVG as a sanitized image, Markdown sanitized -->
        <img
          v-if="spec.image && previewUrl(item)"
          :src="previewUrl(item)"
          :alt="item[spec.titleField]"
          class="max-h-32 w-full object-contain rounded-control"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <img v-if="spec.svg && svgSrc(item)" :src="svgSrc(item)" :alt="item[spec.titleField]" class="h-12 w-12 object-contain" />
        <p v-if="item.description" class="text-xs text-ink-secondary line-clamp-3">{{ item.description }}</p>
        <div v-if="spec.markdown && item[spec.markdown]" class="resource-markdown line-clamp-6" v-html="markdownHtml(item)" />
        <UiLink v-if="safeHttpUrl(item.url) && !spec.image" :href="safeHttpUrl(item.url)" external class="text-xs break-all">{{ item.url }}</UiLink>
        <div v-if="item.tags?.length" class="flex flex-wrap gap-1">
          <UiChip v-for="tag in item.tags" :key="tag">{{ tag }}</UiChip>
        </div>

        <div v-if="owned(item) && canEdit" class="flex flex-wrap items-center gap-2 mt-auto pt-2">
          <UiButton size="sm" @click="openForm(item)">Edit</UiButton>
          <UiButton size="sm" @click="openShare(item)">Share</UiButton>
          <UiButton size="sm" variant="danger" @click="confirmDelete(item)">Delete</UiButton>
        </div>
        <p v-else-if="!owned(item)" class="mt-auto pt-2 text-xs text-ink-muted">From {{ workspaceName(item.workspaceId) }} · read-only</p>
      </li>
    </ul>

    <!-- Add / edit -->
    <WorkspaceModal :open="form.open" :title="form.item ? `Edit ${spec.singular}` : `Add ${spec.singular}`" :busy="form.saving" size="md" @close="form.open = false">
      <form :id="formId" class="flex flex-col gap-5" @submit.prevent="saveForm">
        <InlineNotice :notice="form.error ? { type: 'error', message: form.error } : null" @dismiss="form.error = null" />
        <template v-for="field in spec.fields" :key="field.key">
          <UiSelect
            v-if="field.type === 'select'"
            v-model="form.values[field.key]"
            :label="field.label"
            :required="field.required"
            :options="field.required ? field.options : [{ value: '', label: '—' }, ...field.options]"
          />
          <UiTextarea
            v-else-if="['textarea', 'json', 'svg', 'markdown', 'stages'].includes(field.type)"
            v-model="form.values[field.key]"
            :label="field.label"
            :required="field.required"
            :rows="field.type === 'textarea' ? 3 : 6"
            :placeholder="field.placeholder"
            :mono="field.type === 'json' || field.type === 'svg'"
          />
          <UiInput
            v-else
            v-model="form.values[field.key]"
            :label="field.label"
            :type="field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'"
            :required="field.required"
            :placeholder="field.placeholder"
          />
        </template>
      </form>
      <template #footer>
        <UiButton :disabled="form.saving" @click="form.open = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" :form="formId" :loading="form.saving">
          {{ form.saving ? 'Saving…' : form.item ? 'Save' : `Add ${spec.singular}` }}
        </UiButton>
      </template>
    </WorkspaceModal>

    <ShareDialog
      :open="share.open"
      :item-name="share.item ? share.item[spec.titleField] : ''"
      :sharing="share.item ?? undefined"
      :workspace="workspace"
      :workspaces="workspaces"
      :is-admin="canAdmin"
      :busy="share.saving"
      :error="share.error"
      @close="share.open = false"
      @clear-error="share.error = null"
      @save="saveShare"
    />

    <ConfirmDialog :state="confirmState" />
  </UiPanel>
</template>

<script setup>
import { computed, reactive, toRef, useId, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCallout, UiChip, UiInput, UiLink, UiPanel, UiSelect, UiSpinner, UiTextarea } from '../ui';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import { useWorkspaceResource } from '../../composables/useWorkspaceResource.js';
import ConfirmDialog from './ConfirmDialog.vue';
import ShareDialog from './ShareDialog.vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { bodyFromForm, formValuesFor, resourceKind } from './resourceKinds.js';
import { renderMarkdown, safeHttpUrl, svgDataUri } from './safeContent.js';

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
});

const formId = `resource-form-${useId()}`;
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
const badgeTone = (item) => (item.isGlobal ? 'success' : !owned(item) ? 'warning' : 'info');
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

<style scoped>
/* Sanitized Markdown from the item */
.resource-markdown {
  @apply text-sm text-ink-secondary;
}
.resource-markdown :deep(h1),
.resource-markdown :deep(h2),
.resource-markdown :deep(h3),
.resource-markdown :deep(h4) {
  @apply font-semibold text-ink-strong;
}
.resource-markdown :deep(p),
.resource-markdown :deep(ul),
.resource-markdown :deep(ol) {
  @apply mb-2;
}
.resource-markdown :deep(ul) {
  @apply list-disc pl-5;
}
.resource-markdown :deep(ol) {
  @apply list-decimal pl-5;
}
.resource-markdown :deep(a) {
  @apply text-accent-text underline;
}
.resource-markdown :deep(code) {
  @apply font-code text-xs rounded-control bg-fill px-1;
}
</style>
