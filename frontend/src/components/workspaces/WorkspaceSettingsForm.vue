<template>
  <form class="space-y-4" @submit.prevent="save">
    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <div class="rounded-lg border p-4 space-y-4" :class="c.card">
      <h4 class="font-semibold" :class="c.heading">Details</h4>
      <div>
        <label :for="`ws-name-${workspace.id}`" class="block text-sm mb-2" :class="c.label">Name *</label>
        <input :id="`ws-name-${workspace.id}`" v-model="values.name" type="text" required maxlength="100" :disabled="!canEdit" :class="[inputClass, c.input]" />
      </div>
      <div>
        <label :for="`ws-desc-${workspace.id}`" class="block text-sm mb-2" :class="c.label">Description</label>
        <textarea :id="`ws-desc-${workspace.id}`" v-model="values.description" rows="3" maxlength="2000" :disabled="!canEdit" :class="[inputClass, c.input]" />
      </div>
      <div>
        <label :for="`ws-slug-${workspace.id}`" class="block text-sm mb-2" :class="c.label">Slug</label>
        <input
          :id="`ws-slug-${workspace.id}`"
          v-model="values.slug"
          type="text"
          required
          maxlength="60"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase letters, digits and single hyphens"
          :disabled="!canEdit"
          :class="[inputClass, c.input]"
        />
        <p class="text-xs mt-1" :class="c.faint">Used in links. Must be unique.</p>
      </div>
    </div>

    <div class="rounded-lg border p-4 space-y-4" :class="c.card">
      <h4 class="font-semibold" :class="c.heading">Sharing</h4>
      <label class="flex items-center justify-between gap-4">
        <span>
          <span class="font-medium" :class="c.heading">Allow External Sharing</span>
          <span class="block text-xs mt-1" :class="c.muted">
            Allow items and components to be shared with other workspaces or made global. Turning this off withdraws everything already shared.
          </span>
        </span>
        <input v-model="values.allowExternalSharing" type="checkbox" class="w-4 h-4 rounded accent-indigo-600" :disabled="!canEdit" />
      </label>
      <label class="flex items-center justify-between gap-4">
        <span>
          <span class="font-medium" :class="c.heading">Require Approval for Sharing</span>
          <span class="block text-xs mt-1" :class="c.muted">Only workspace admins can share items; editors can't.</span>
        </span>
        <input v-model="values.requireApprovalForSharing" type="checkbox" class="w-4 h-4 rounded accent-indigo-600" :disabled="!canEdit" />
      </label>
      <div>
        <div class="block text-sm mb-2" :class="c.label">Default component status</div>
        <Dropdown
          v-model="values.defaultComponentStatus"
          :options="[
            { value: 'in-progress', label: 'In progress' },
            { value: 'planned', label: 'Planned' },
            { value: 'production', label: 'Production' },
          ]"
          :is-dark-mode="isDarkMode"
        />
      </div>
    </div>

    <div v-if="canEdit" class="flex justify-end">
      <button type="submit" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="saving ? c.disabled : c.primary" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save Settings' }}
      </button>
    </div>
    <p v-else class="text-sm" :class="c.muted">Only workspace admins can change settings.</p>

    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import Dropdown from '../Dropdown.vue';
import InlineNotice from '../InlineNotice.vue';
import apiClient, { apiErrorMessage } from '../../services/api.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import ConfirmDialog from './ConfirmDialog.vue';
import { atLeast, inputClass, ui } from './ui.js';

/** Name, description, slug and sharing settings of a workspace (admin) */
const props = defineProps({
  workspace: { type: Object, required: true },
  isDarkMode: { type: Boolean, default: false },
});
const emit = defineEmits(['saved']);

const c = computed(() => ui(props.isDarkMode));
const canEdit = computed(() => atLeast(props.workspace.effectiveRole, 'admin'));
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();
const saving = ref(false);
const values = reactive({});

const reset = () =>
  Object.assign(values, {
    name: props.workspace.name,
    description: props.workspace.description ?? '',
    slug: props.workspace.slug,
    allowExternalSharing: props.workspace.settings?.allowExternalSharing !== false,
    requireApprovalForSharing: props.workspace.settings?.requireApprovalForSharing === true,
    defaultComponentStatus: props.workspace.settings?.defaultComponentStatus ?? 'in-progress',
  });
watch(() => props.workspace, reset, { immediate: true });

const save = async () => {
  const ws = props.workspace;
  const patch = {};
  if (values.name.trim() !== ws.name) patch.name = values.name.trim();
  if (values.description !== (ws.description ?? '')) patch.description = values.description;
  if (values.slug !== ws.slug) patch.slug = values.slug;
  const settings = {};
  for (const key of ['allowExternalSharing', 'requireApprovalForSharing', 'defaultComponentStatus']) {
    if (values[key] !== ws.settings?.[key]) settings[key] = values[key];
  }
  if (Object.keys(settings).length) patch.settings = settings;
  if (Object.keys(patch).length === 0) {
    showNotice('Nothing to save.', 'info');
    return;
  }
  if (settings.allowExternalSharing === false) {
    const ok = await askConfirm({
      title: 'Turn off external sharing?',
      message: 'Everything this workspace has shared with other workspaces, or made global, will be withdrawn.',
      confirmText: 'Turn off',
      danger: true,
    });
    if (!ok) return;
  }
  saving.value = true;
  try {
    const response = await apiClient.patch(`/api/v1/workspaces/${encodeURIComponent(ws.id)}`, patch);
    emit('saved', response.data);
    showNotice('Settings saved.', 'success');
  } catch (err) {
    showNotice(apiErrorMessage(err, 'Could not save the settings.'), 'error');
  } finally {
    saving.value = false;
  }
};
</script>
