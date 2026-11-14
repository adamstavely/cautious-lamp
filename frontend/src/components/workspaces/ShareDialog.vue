<template>
  <WorkspaceModal :open="open" :title="`Share ${itemName}`" :busy="busy" size="sm" @close="emit('close')">
    <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="emit('clear-error')" />

    <UiCallout v-if="!settings.allowExternalSharing" tone="info">
      External sharing is turned off in this workspace's settings, so items can't be shared with other workspaces.
    </UiCallout>
    <template v-else>
      <UiCallout v-if="settings.requireApprovalForSharing && !isAdmin" tone="info">
        This workspace requires an admin to share items. Ask a workspace admin to share it.
      </UiCallout>

      <UiCheckbox v-if="isAdmin" v-model="isGlobal" label="Global" hint="Every workspace can see it. Only workspace admins can change this." />

      <fieldset v-if="!isGlobal" class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-medium text-ink-strong">Share with workspaces</legend>
        <p v-if="targets.length === 0" class="text-ink-muted">There are no other workspaces you can see.</p>
        <div v-else class="flex flex-col gap-2 max-h-56 overflow-y-auto">
          <UiCheckbox v-for="ws in targets" :key="ws.id" v-model="selected" :value="ws.id" :label="ws.name" :disabled="!canShare" />
        </div>
        <p v-if="hidden.length" class="text-xs text-ink-muted">
          Also shared with {{ hidden.length }} workspace{{ hidden.length === 1 ? '' : 's' }} you can't see.
        </p>
        <p class="text-xs text-ink-muted">Shared items are read-only in other workspaces.</p>
      </fieldset>
    </template>

    <template #footer>
      <UiButton :disabled="busy" @click="emit('close')">Cancel</UiButton>
      <UiButton variant="primary" :disabled="!canSave" :loading="busy" @click="save">{{ busy ? 'Saving…' : 'Save sharing' }}</UiButton>
    </template>
  </WorkspaceModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCallout, UiCheckbox } from '../ui';
import WorkspaceModal from './WorkspaceModal.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  itemName: { type: String, default: 'item' },
  /** { sharedWith: string[], isGlobal: boolean } */
  sharing: { type: Object, default: () => ({ sharedWith: [], isGlobal: false }) },
  /** The workspace that owns the item */
  workspace: { type: Object, required: true },
  /** Workspaces the user can see, [{ id, name }] */
  workspaces: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  error: { type: String, default: null },
});
const emit = defineEmits(['close', 'save', 'clear-error']);

const settings = computed(() => props.workspace.settings ?? {});
const targets = computed(() => props.workspaces.filter((ws) => ws.id !== props.workspace.id));
const canShare = computed(() => settings.value.allowExternalSharing && (props.isAdmin || !settings.value.requireApprovalForSharing));
const canSave = computed(() => canShare.value && !props.busy);

const selected = ref([]);
const isGlobal = ref(false);
/** Shares with workspaces this user can't see are kept as they are */
const hidden = computed(() => (props.sharing.sharedWith ?? []).filter((id) => !targets.value.some((ws) => ws.id === id)));
const save = () => emit('save', { workspaceIds: isGlobal.value ? [] : [...selected.value, ...hidden.value], isGlobal: isGlobal.value });

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    selected.value = [...(props.sharing.sharedWith ?? [])];
    isGlobal.value = props.sharing.isGlobal === true;
  },
  { immediate: true },
);
</script>
