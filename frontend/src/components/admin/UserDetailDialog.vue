<template>
  <AdminDialog
    :model-value="modelValue"
    :title="current?.name || 'User'"
    :subtitle="current?.email || ''"
    :persistent="busy"
    :max-width="720"
    @update:model-value="close"
  >
    <div v-if="current" class="flex flex-col gap-8">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />

      <!-- Account -->
      <section :aria-labelledby="`${uid}-account`">
        <h3 :id="`${uid}-account`" class="detail-heading">Account</h3>
        <dl class="mb-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt class="text-ink-muted">Status</dt>
            <dd class="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge :status="current.status" />
              <UiChip v-if="current.mustChangePassword" tone="warning">Must change password</UiChip>
            </dd>
          </div>
          <div>
            <dt class="text-ink-muted">Last sign-in</dt>
            <dd class="mt-1 text-ink">{{ formatDateTime(current.lastLoginAt) }}</dd>
          </div>
          <div>
            <dt class="text-ink-muted">Created</dt>
            <dd class="mt-1 text-ink">{{ formatDateTime(current.createdAt, '—') }}</dd>
          </div>
          <div>
            <dt class="text-ink-muted">User ID</dt>
            <dd class="mt-1 break-all font-code text-xs text-ink-secondary">{{ current.id }}</dd>
          </div>
        </dl>

        <form class="flex flex-wrap items-end gap-3" novalidate @submit.prevent="saveName">
          <div class="min-w-0 flex-1 basis-56">
            <UiInput
              :id="`${uid}-name`"
              v-model="nameDraft"
              label="Name"
              maxlength="200"
              autocomplete="off"
              :disabled="!canManageUsers"
              :error="nameError"
            />
          </div>
          <UiButton
            v-if="canManageUsers"
            type="submit"
            variant="primary"
            :loading="savingName"
            :disabled="nameDraft.trim() === current.name"
          >
            {{ savingName ? 'Saving…' : 'Save name' }}
          </UiButton>
        </form>

        <div v-if="canManageUsers" class="mt-4 flex flex-wrap gap-3">
          <UiButton
            :variant="current.status === 'active' ? 'danger' : 'secondary'"
            :icon="current.status === 'active' ? 'block' : 'check_circle'"
            :disabled="isSelf && current.status === 'active'"
            :aria-describedby="isSelf ? `${uid}-self-hint` : undefined"
            @click="openStatusConfirm"
          >
            {{ current.status === 'active' ? 'Disable user' : 'Enable user' }}
          </UiButton>
          <UiButton
            icon="lock_reset"
            :disabled="isSelf"
            :aria-describedby="isSelf ? `${uid}-self-hint` : undefined"
            @click="resetOpen = true"
          >
            Reset password
          </UiButton>
          <p v-if="isSelf" :id="`${uid}-self-hint`" class="basis-full text-xs text-ink-muted">
            This is you. You can't disable your own account, and you change your own password with Change password in the user menu.
          </p>
        </div>
      </section>

      <!-- Roles -->
      <section :aria-labelledby="`${uid}-roles`">
        <h3 :id="`${uid}-roles`" class="detail-heading">Roles</h3>
        <p v-if="!current.roles.length" class="mb-3 text-ink-muted">No roles. This user can sign in but can't do anything that needs a permission.</p>
        <ul v-else class="mb-3 flex flex-col gap-2">
          <li v-for="roleId in current.roles" :key="roleId" class="detail-row">
            <div class="min-w-0">
              <div class="font-medium text-ink-strong">{{ roleName(roleId) }}</div>
              <div v-if="roleById(roleId)?.description" class="text-xs text-ink-muted">{{ roleById(roleId).description }}</div>
            </div>
            <UiButton
              v-if="canManageRoles"
              variant="ghost"
              size="sm"
              icon="delete"
              icon-only
              :label="`Remove role ${roleName(roleId)}`"
              @click="openRemoveRole(roleId)"
            />
          </li>
        </ul>
        <form v-if="canManageRoles" class="flex flex-wrap items-end gap-3" @submit.prevent="assignRole">
          <div class="min-w-0 flex-1 basis-56">
            <UiSelect
              :id="`${uid}-assign`"
              v-model="roleToAssign"
              label="Add a role"
              :placeholder="assignableRoles.length ? 'Select a role' : 'Every role is assigned'"
              :options="assignableRoles.map((role) => ({ value: role.id, label: role.name }))"
              :disabled="!assignableRoles.length"
            />
          </div>
          <UiButton type="submit" variant="primary" :loading="assigning" :disabled="!roleToAssign">
            {{ assigning ? 'Adding…' : 'Add role' }}
          </UiButton>
        </form>
        <p v-else class="text-xs text-ink-muted">Changing roles needs the Role Management permission (admin:rbac).</p>
      </section>

      <!-- Workspaces (read-only) -->
      <section :aria-labelledby="`${uid}-workspaces`">
        <h3 :id="`${uid}-workspaces`" class="detail-heading">Workspaces</h3>
        <p v-if="workspaces.state === 'loading'" class="text-ink-muted">Loading workspaces…</p>
        <p v-else-if="workspaces.state === 'unavailable'" class="text-ink-muted">
          Workspace memberships aren't available yet.
        </p>
        <UiCallout v-else-if="workspaces.state === 'error'" tone="danger">
          {{ workspaces.error }}
          <template #actions>
            <UiButton size="sm" @click="loadWorkspaces">Try again</UiButton>
          </template>
        </UiCallout>
        <p v-else-if="!workspaces.items.length" class="text-ink-muted">Not a member of any workspace.</p>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="ws in workspaces.items" :key="ws.workspaceId" class="detail-row">
            <router-link
              :to="`/admin/workspaces/${encodeURIComponent(ws.workspaceId)}`"
              class="detail-link"
              @click="close(false)"
            >
              <span class="material-symbols-outlined text-base" aria-hidden="true">folder</span>
              <span class="truncate">{{ ws.name }}</span>
            </router-link>
            <UiChip class="capitalize">{{ ws.role }}</UiChip>
          </li>
        </ul>
        <p class="mt-2 text-xs text-ink-muted">Memberships are managed on each workspace's page.</p>
      </section>
    </div>

    <template #actions>
      <UiButton :disabled="busy" @click="close(false)">Close</UiButton>
    </template>
  </AdminDialog>

  <ConfirmActionDialog
    v-model="confirm.open"
    :title="confirm.title"
    :message="confirm.message"
    :confirm-text="confirm.confirmText"
    :busy-text="confirm.busyText"
    :danger="confirm.danger"
    :busy="confirm.busy"
    :error="confirm.error"
    @clear-error="confirm.error = ''"
    @confirm="runConfirm"
  />

  <ResetPasswordDialog v-model="resetOpen" :user="current" @reset="onPasswordReset" />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import ConfirmActionDialog from './ConfirmActionDialog.vue';
import ResetPasswordDialog from './ResetPasswordDialog.vue';
import StatusBadge from './StatusBadge.vue';
import InlineNotice from '../InlineNotice.vue';
import UiButton from '../ui/UiButton.vue';
import UiCallout from '../ui/UiCallout.vue';
import UiChip from '../ui/UiChip.vue';
import UiInput from '../ui/UiInput.vue';
import UiSelect from '../ui/UiSelect.vue';
import { useNotice } from '../../composables/useNotice.js';
import {
  adminErrorMessage,
  formatDateTime,
  rbacApi,
  usersApi,
  validationErrors,
} from '../../composables/useAccessAdmin.js';
import { errorStatus } from '../../services/api.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** PublicUser from GET /users */
  user: { type: Object, default: null },
  /** Role definitions (GET /rbac/roles); empty without admin:rbac */
  roles: { type: Array, default: () => [] },
  currentUserId: { type: String, default: null },
  canManageUsers: { type: Boolean, default: false },
  canManageRoles: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'updated']);

const uid = `user-detail-${Math.random().toString(36).slice(2, 10)}`;
const { notice, showNotice, clearNotice } = useNotice();
const current = ref(null);
const nameDraft = ref('');
const nameError = ref('');
const savingName = ref(false);
const roleToAssign = ref('');
const assigning = ref(false);
const resetOpen = ref(false);
const workspaces = reactive({ state: 'idle', items: [], error: '' });
const confirm = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: '',
  busyText: '',
  danger: false,
  busy: false,
  error: '',
  action: null,
});

const isSelf = computed(() => !!current.value && current.value.id === props.currentUserId);
const busy = computed(() => savingName.value || assigning.value || confirm.busy);
const roleById = (id) => props.roles.find((role) => role.id === id);
const roleName = (id) => roleById(id)?.name ?? id;
const assignableRoles = computed(() => props.roles.filter((role) => !current.value?.roles.includes(role.id)));

let workspaceSeq = 0;
const loadWorkspaces = async () => {
  if (!current.value) return;
  const mine = ++workspaceSeq;
  workspaces.state = 'loading';
  workspaces.error = '';
  try {
    const items = await usersApi.workspaces(current.value.id);
    if (mine !== workspaceSeq) return;
    workspaces.items = Array.isArray(items) ? items : [];
    workspaces.state = 'ready';
  } catch (error) {
    if (mine !== workspaceSeq) return;
    workspaces.items = [];
    // 404 until the workspaces module's endpoint exists
    if (errorStatus(error) === 404) workspaces.state = 'unavailable';
    else {
      workspaces.state = 'error';
      workspaces.error = adminErrorMessage(error, "Couldn't load workspace memberships.");
    }
  }
};

watch(
  () => [props.modelValue, props.user?.id],
  ([open]) => {
    if (!open || !props.user) return;
    current.value = { ...props.user, roles: [...(props.user.roles ?? [])] };
    nameDraft.value = props.user.name;
    nameError.value = '';
    roleToAssign.value = '';
    clearNotice();
    loadWorkspaces();
  },
  { immediate: true }
);

const close = (value = false) => {
  if (value || busy.value) return;
  emit('update:modelValue', false);
};

const apply = (user) => {
  current.value = { ...user, roles: [...(user.roles ?? [])] };
  emit('updated', current.value);
};

/** Re-reads the user, e.g. after a role change, so roles match the server */
const refresh = async () => {
  try {
    apply(await usersApi.get(current.value.id));
  } catch {
    // The change itself succeeded; the list reloads on close anyway
  }
};

const saveName = async () => {
  const name = nameDraft.value.trim();
  nameError.value = name ? '' : 'Enter a name.';
  if (nameError.value || name === current.value.name) return;
  savingName.value = true;
  try {
    apply(await usersApi.update(current.value.id, { name }));
    nameDraft.value = current.value.name;
    showNotice('Name saved.', 'success');
  } catch (error) {
    const { fields, general } = validationErrors(error, ['name']);
    nameError.value = fields.name ?? '';
    if (general || !fields.name) showNotice(general || adminErrorMessage(error, "Couldn't save the name."), 'error');
  } finally {
    savingName.value = false;
  }
};

const openConfirm = (options) => {
  Object.assign(confirm, { busy: false, error: '', danger: false, busyText: 'Working…', ...options, open: true });
};

const runConfirm = async () => {
  confirm.busy = true;
  confirm.error = '';
  try {
    await confirm.action();
    confirm.open = false;
  } catch (error) {
    // e.g. 409 "You cannot disable yourself" / "would leave no active user with admin:rbac"
    confirm.error = adminErrorMessage(error, "Couldn't make that change.");
  } finally {
    confirm.busy = false;
  }
};

const openStatusConfirm = () => {
  const disabling = current.value.status === 'active';
  const who = `${current.value.name} (${current.value.email})`;
  openConfirm({
    title: disabling ? 'Disable user?' : 'Enable user?',
    message: disabling
      ? `${who} will be signed out everywhere and won't be able to sign in until re-enabled. Their roles are kept.`
      : `${who} will be able to sign in again with their current password and roles.`,
    confirmText: disabling ? 'Disable' : 'Enable',
    busyText: disabling ? 'Disabling…' : 'Enabling…',
    danger: disabling,
    action: async () => {
      apply(await usersApi.update(current.value.id, { status: disabling ? 'disabled' : 'active' }));
      showNotice(disabling ? 'User disabled.' : 'User enabled.', 'success');
    },
  });
};

const openRemoveRole = (roleId) => {
  openConfirm({
    title: 'Remove role?',
    message: `${current.value.name} will lose the "${roleName(roleId)}" role and the permissions only it grants.`,
    confirmText: 'Remove role',
    busyText: 'Removing…',
    danger: true,
    action: async () => {
      await rbacApi.remove(current.value.id, roleId);
      await refresh();
      showNotice(`Removed the "${roleName(roleId)}" role.`, 'success');
    },
  });
};

const assignRole = async () => {
  const roleId = roleToAssign.value;
  if (!roleId) return;
  assigning.value = true;
  try {
    await rbacApi.assign(current.value.id, roleId);
    roleToAssign.value = '';
    await refresh();
    showNotice(`Added the "${roleName(roleId)}" role.`, 'success');
  } catch (error) {
    showNotice(adminErrorMessage(error, "Couldn't add the role."), 'error');
  } finally {
    assigning.value = false;
  }
};

const onPasswordReset = () => {
  current.value = { ...current.value, mustChangePassword: true };
  emit('updated', current.value);
  showNotice('Password reset. They were signed out and must choose a new password.', 'success');
};
</script>

<style scoped>
.detail-heading {
  @apply mb-3 text-base font-semibold text-ink-strong;
}
.detail-row {
  @apply flex items-center justify-between gap-3 rounded-tile border border-solid border-line p-3;
}
.detail-link {
  @apply flex min-w-0 items-center gap-2 font-medium text-accent-text hover:underline underline-offset-4;
  @apply rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
