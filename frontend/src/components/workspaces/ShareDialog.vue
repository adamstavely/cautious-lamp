<template>
  <WorkspaceModal :open="open" :title="`Share ${itemName}`" icon="share" :is-dark-mode="isDarkMode" :busy="busy" size="sm" @close="emit('close')">
    <div class="space-y-4">
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="emit('clear-error')" />

      <p v-if="!settings.allowExternalSharing" class="text-sm" :class="c.muted">
        External sharing is turned off in this workspace's settings, so items can't be shared with other workspaces.
      </p>
      <template v-else>
        <p v-if="settings.requireApprovalForSharing && !isAdmin" class="text-sm" :class="c.muted">
          This workspace requires an admin to share items. Ask a workspace admin to share it.
        </p>

        <label v-if="isAdmin" class="flex items-start gap-2 p-2 rounded" :class="c.text">
          <input v-model="isGlobal" type="checkbox" class="w-4 h-4 mt-0.5 rounded accent-indigo-600" />
          <span class="text-sm">
            <span class="font-medium">Global</span>
            <span class="block text-xs" :class="c.muted">Every workspace can see it. Only workspace admins can change this.</span>
          </span>
        </label>

        <div v-if="!isGlobal">
          <div class="block text-sm mb-2" :class="c.label">Share with workspaces</div>
          <p v-if="targets.length === 0" class="text-sm" :class="c.muted">There are no other workspaces you can see.</p>
          <div v-else class="space-y-1 max-h-56 overflow-y-auto">
            <label
              v-for="ws in targets"
              :key="ws.id"
              class="flex items-center gap-2 p-2 rounded cursor-pointer"
              :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'"
            >
              <input v-model="selected" type="checkbox" :value="ws.id" class="w-4 h-4 rounded accent-indigo-600" :disabled="!canShare" />
              <span class="text-sm" :class="c.heading">{{ ws.name }}</span>
            </label>
          </div>
          <p v-if="hidden.length" class="text-xs mt-2" :class="c.faint">
            Also shared with {{ hidden.length }} workspace{{ hidden.length === 1 ? '' : 's' }} you can't see.
          </p>
          <p class="text-xs mt-2" :class="c.faint">Shared items are read-only in other workspaces.</p>
        </div>
      </template>

      <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
        <button
          type="button"
          class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
          :class="canSave ? c.primary : c.disabled"
          :disabled="!canSave"
          @click="save"
        >
          {{ busy ? 'Saving…' : 'Save sharing' }}
        </button>
        <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="c.secondary" :disabled="busy" @click="emit('close')">
          Cancel
        </button>
      </div>
    </div>
  </WorkspaceModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { ui } from './ui.js';

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
  isDarkMode: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  error: { type: String, default: null },
});
const emit = defineEmits(['close', 'save', 'clear-error']);

const c = computed(() => ui(props.isDarkMode));
const settings = computed(() => props.workspace.settings ?? {});
const targets = computed(() => props.workspaces.filter((ws) => ws.id !== props.workspace.id));
const canShare = computed(() => settings.value.allowExternalSharing && (props.isAdmin || !settings.value.requireApprovalForSharing));
const canSave = computed(() => canShare.value && !props.busy);

const selected = ref([]);
/** Shares with workspaces this user can't see are kept as they are */
const hidden = computed(() => (props.sharing.sharedWith ?? []).filter((id) => !targets.value.some((ws) => ws.id === id)));
const save = () => emit('save', { workspaceIds: isGlobal.value ? [] : [...selected.value, ...hidden.value], isGlobal: isGlobal.value });
const isGlobal = ref(false);

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
