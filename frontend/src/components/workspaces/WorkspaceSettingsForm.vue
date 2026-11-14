<template>
  <form class="flex flex-col gap-6" @submit.prevent="save">
    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <UiPanel title="Details" heading-tag="h3">
      <UiInput v-model="values.name" label="Name" required maxlength="100" :disabled="!canEdit" />
      <UiTextarea v-model="values.description" label="Description" :rows="3" maxlength="2000" :disabled="!canEdit" />
      <UiInput
        v-model="values.slug"
        label="Slug"
        required
        maxlength="60"
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        title="Lowercase letters, digits and single hyphens"
        hint="Used in links. Must be unique."
        :disabled="!canEdit"
      />
    </UiPanel>

    <UiPanel title="Sharing" heading-tag="h3">
      <UiCheckbox
        v-model="values.allowExternalSharing"
        label="Allow external sharing"
        hint="Allow items and components to be shared with other workspaces or made global. Turning this off withdraws everything already shared."
        :disabled="!canEdit"
      />
      <UiCheckbox
        v-model="values.requireApprovalForSharing"
        label="Require approval for sharing"
        hint="Only workspace admins can share items; editors can't."
        :disabled="!canEdit"
      />
      <UiSelect v-model="values.defaultComponentStatus" label="Default component status" :options="statusOptions" />
    </UiPanel>

    <div v-if="canEdit" class="flex justify-end">
      <UiButton variant="primary" type="submit" :loading="saving">{{ saving ? 'Saving…' : 'Save settings' }}</UiButton>
    </div>
    <p v-else class="text-sm text-ink-muted">Only workspace admins can change settings.</p>

    <ConfirmDialog :state="confirmState" />
  </form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCheckbox, UiInput, UiPanel, UiSelect, UiTextarea } from '../ui';
import apiClient, { apiErrorMessage } from '../../services/api.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import ConfirmDialog from './ConfirmDialog.vue';
import { atLeast } from './ui.js';

/** Name, description, slug and sharing settings of a workspace (admin) */
const props = defineProps({
  workspace: { type: Object, required: true },
});
const emit = defineEmits(['saved']);

const statusOptions = [
  { value: 'in-progress', label: 'In progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'production', label: 'Production' },
];

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
