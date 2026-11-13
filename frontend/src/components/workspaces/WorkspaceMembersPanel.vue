<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="font-semibold" :class="c.heading">Workspace Members</h4>
      <button v-if="isAdmin" type="button" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" :class="c.primary" @click="openAdd">
        Add Member
      </button>
    </div>

    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <div class="space-y-2">
      <div
        v-for="member in workspace.members"
        :key="member.userId"
        class="flex items-center justify-between gap-3 p-3 rounded-lg border"
        :class="c.card"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
            <span class="material-symbols-outlined" :class="c.muted" aria-hidden="true">person</span>
          </div>
          <div class="min-w-0">
            <div class="font-medium truncate" :class="c.heading">
              {{ member.name || member.email }}
              <span v-if="member.userId === currentUserId" class="text-xs font-normal" :class="c.faint">(you)</span>
            </div>
            <div class="text-xs truncate" :class="c.muted">{{ member.email }}</div>
            <div class="text-xs flex items-center gap-2 mt-1">
              <span class="px-2 py-0.5 rounded capitalize" :class="c.roleBadge(member.role)">{{ member.role }}</span>
              <span :class="c.faint">Added {{ formatDate(member.addedAt) }}<template v-if="member.addedBy?.name"> by {{ member.addedBy.name }}</template></span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Dropdown
            v-if="canChangeRole(member)"
            :model-value="member.role"
            :options="roleOptions"
            :is-dark-mode="isDarkMode"
            @update:model-value="changeRole(member, $event)"
          />
          <button
            v-if="isOwner && member.role !== 'owner'"
            type="button"
            class="p-2 rounded-lg transition-colors"
            :class="c.chip"
            title="Make owner"
            :aria-label="`Make ${member.email} the owner`"
            @click="transfer(member)"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">workspace_premium</span>
          </button>
          <button
            v-if="canRemove(member)"
            type="button"
            class="p-2 rounded-lg transition-colors"
            :class="c.danger"
            :title="member.userId === currentUserId ? 'Leave workspace' : 'Remove member'"
            :aria-label="member.userId === currentUserId ? 'Leave workspace' : `Remove ${member.email}`"
            @click="remove(member)"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">{{ member.userId === currentUserId ? 'logout' : 'delete' }}</span>
          </button>
        </div>
      </div>
    </div>

    <WorkspaceModal :open="add.open" title="Add Member" icon="person_add" :is-dark-mode="isDarkMode" :busy="add.saving" size="sm" @close="add.open = false">
      <form class="space-y-4" @submit.prevent="submitAdd">
        <InlineNotice :notice="add.error ? { type: 'error', message: add.error } : null" @dismiss="add.error = null" />
        <div>
          <label :for="`member-email-${workspace.id}`" class="block text-sm mb-2" :class="c.label">Email *</label>
          <input
            :id="`member-email-${workspace.id}`"
            v-model="add.email"
            type="email"
            required
            placeholder="user@example.com"
            :class="[inputClass, c.input]"
          />
          <p class="text-xs mt-1" :class="c.faint">They need an account already. Ask an administrator to create one if not.</p>
        </div>
        <div>
          <div class="block text-sm mb-2" :class="c.label">Role *</div>
          <Dropdown v-model="add.role" :options="addRoleOptions" :is-dark-mode="isDarkMode" />
        </div>
        <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
          <button type="submit" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="add.email && !add.saving ? c.primary : c.disabled" :disabled="!add.email || add.saving">
            {{ add.saving ? 'Adding…' : 'Add Member' }}
          </button>
          <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="c.secondary" :disabled="add.saving" @click="add.open = false">Cancel</button>
        </div>
      </form>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import Dropdown from '../Dropdown.vue';
import InlineNotice from '../InlineNotice.vue';
import apiClient, { apiErrorMessage } from '../../services/api.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import ConfirmDialog from './ConfirmDialog.vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { atLeast, formatDate, inputClass, ui } from './ui.js';

/**
 * Members of a workspace. Admins add and manage editors and viewers; only
 * the owner (or an admin:users holder) grants or removes admin and transfers
 * ownership; anyone but the owner can leave. The server enforces all of this.
 */
const props = defineProps({
  workspace: { type: Object, required: true },
  currentUserId: { type: String, default: null },
  isDarkMode: { type: Boolean, default: false },
});
const emit = defineEmits(['updated', 'left']);

const c = computed(() => ui(props.isDarkMode));
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
