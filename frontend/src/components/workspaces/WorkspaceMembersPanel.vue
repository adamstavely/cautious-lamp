<template>
  <UiPanel title="Workspace members" heading-tag="h3" flush>
    <template v-if="isAdmin" #actions>
      <UiButton variant="primary" size="sm" icon="person_add" @click="openAdd">Add member</UiButton>
    </template>

    <div v-if="notice" class="px-6 pt-4">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
    </div>

    <ul class="divide-y divide-line-faint">
      <li v-for="member in workspace.members" :key="member.userId" class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div class="flex items-center gap-3 min-w-0">
          <span class="flex items-center justify-center w-10 h-10 shrink-0 rounded-pill bg-fill text-ink-muted">
            <span class="material-symbols-outlined" aria-hidden="true">person</span>
          </span>
          <div class="min-w-0">
            <p class="font-medium text-ink-strong truncate">
              {{ member.name || member.email }}
              <span v-if="member.userId === currentUserId" class="text-xs font-normal text-ink-muted">(you)</span>
            </p>
            <p class="text-xs text-ink-muted truncate">{{ member.email }}</p>
            <p class="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-muted">
              <UiChip :tone="roleTone(member.role)" class="capitalize">{{ member.role }}</UiChip>
              <span>Added {{ formatDate(member.addedAt) }}<template v-if="member.addedBy?.name"> by {{ member.addedBy.name }}</template></span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div v-if="canChangeRole(member)" class="w-36">
            <UiSelect
              :model-value="member.role"
              :options="roleOptions"
              :aria-label="`Role for ${member.email}`"
              @update:model-value="changeRole(member, $event)"
            />
          </div>
          <UiButton
            v-if="isOwner && member.role !== 'owner'"
            variant="ghost"
            size="sm"
            icon="workspace_premium"
            icon-only
            :label="`Make ${member.email} the owner`"
            @click="transfer(member)"
          />
          <UiButton
            v-if="canRemove(member)"
            variant="danger"
            size="sm"
            :icon="member.userId === currentUserId ? 'logout' : 'delete'"
            icon-only
            :label="member.userId === currentUserId ? 'Leave workspace' : `Remove ${member.email}`"
            @click="remove(member)"
          />
        </div>
      </li>
    </ul>

    <WorkspaceModal :open="add.open" title="Add member" :busy="add.saving" size="sm" @close="add.open = false">
      <form :id="addFormId" class="flex flex-col gap-5" @submit.prevent="submitAdd">
        <InlineNotice :notice="add.error ? { type: 'error', message: add.error } : null" @dismiss="add.error = null" />
        <UiInput
          v-model="add.email"
          type="email"
          label="Email"
          required
          placeholder="user@example.com"
          hint="They need an account already. Ask an administrator to create one if not."
        />
        <UiSelect v-model="add.role" :options="addRoleOptions" label="Role" required />
      </form>
      <template #footer>
        <UiButton :disabled="add.saving" @click="add.open = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" :form="addFormId" :disabled="!add.email" :loading="add.saving">
          {{ add.saving ? 'Adding…' : 'Add member' }}
        </UiButton>
      </template>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" />
  </UiPanel>
</template>

<script setup>
import { computed, reactive, useId } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiChip, UiInput, UiPanel, UiSelect } from '../ui';
import apiClient, { apiErrorMessage } from '../../services/api.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import ConfirmDialog from './ConfirmDialog.vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { atLeast, formatDate, roleTone } from './ui.js';

/**
 * Members of a workspace. Admins add and manage editors and viewers; only
 * the owner (or an admin:users holder) grants or removes admin and transfers
 * ownership; anyone but the owner can leave. The server enforces all of this.
 */
const props = defineProps({
  workspace: { type: Object, required: true },
  currentUserId: { type: String, default: null },
});
const emit = defineEmits(['updated', 'left']);

const addFormId = `add-member-${useId()}`;
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const isAdmin = computed(() => atLeast(props.workspace.effectiveRole, 'admin'));
const isOwner = computed(() => atLeast(props.workspace.effectiveRole, 'owner'));
const roleOptions = computed(() =>
  [
    isOwner.value ? { value: 'admin', label: 'Admin' } : null,
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ].filter(Boolean),
);
const addRoleOptions = computed(() => [{ value: 'viewer', label: 'Viewer' }, { value: 'editor', label: 'Editor' }, ...(isOwner.value ? [{ value: 'admin', label: 'Admin' }] : [])]);

const canChangeRole = (member) => member.role !== 'owner' && (isOwner.value || (isAdmin.value && member.role !== 'admin'));
const canRemove = (member) =>
  member.role !== 'owner' && (member.userId === props.currentUserId || isOwner.value || (isAdmin.value && member.role !== 'admin'));

const base = () => `/api/v1/workspaces/${encodeURIComponent(props.workspace.id)}`;

const run = async (request, success) => {
  try {
    const response = await request();
    if (response.data?.left) emit('left');
    else emit('updated', response.data);
    if (success) showNotice(success, 'success');
    return true;
  } catch (err) {
    showNotice(apiErrorMessage(err, 'That change could not be made.'), 'error');
    return false;
  }
};

const changeRole = (member, role) => {
  if (role === member.role) return;
  run(() => apiClient.patch(`${base()}/members/${encodeURIComponent(member.userId)}`, { role }), `${member.email} is now ${role === 'admin' ? 'an' : 'a'} ${role}.`);
};

const remove = async (member) => {
  const leaving = member.userId === props.currentUserId;
  const ok = await askConfirm({
    title: leaving ? 'Leave workspace?' : 'Remove member?',
    message: leaving
      ? `You will lose access to ${props.workspace.name} unless someone adds you again.`
      : `${member.email} will lose access to ${props.workspace.name}.`,
    confirmText: leaving ? 'Leave' : 'Remove',
    danger: true,
  });
  if (ok) run(() => apiClient.delete(`${base()}/members/${encodeURIComponent(member.userId)}`), leaving ? null : `${member.email} removed.`);
};

const transfer = async (member) => {
  const ok = await askConfirm({
    title: 'Transfer ownership?',
    message: `${member.email} becomes the owner of ${props.workspace.name}. The current owner becomes an admin.`,
    confirmText: 'Transfer',
  });
  if (ok) run(() => apiClient.post(`${base()}/transfer-ownership`, { userId: member.userId }), `${member.email} is now the owner.`);
};

const add = reactive({ open: false, email: '', role: 'viewer', saving: false, error: null });
const openAdd = () => Object.assign(add, { open: true, email: '', role: 'viewer', saving: false, error: null });

const submitAdd = async () => {
  add.saving = true;
  add.error = null;
  try {
    const response = await apiClient.post(`${base()}/members`, { email: add.email.trim(), role: add.role });
    emit('updated', response.data);
    showNotice(`${add.email.trim()} added as ${add.role}.`, 'success');
    add.open = false;
  } catch (err) {
    add.error = apiErrorMessage(err, 'Could not add that person.');
  } finally {
    add.saving = false;
  }
};
</script>
