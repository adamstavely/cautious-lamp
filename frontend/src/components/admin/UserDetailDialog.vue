<template>
  <AdminDialog
    :model-value="modelValue"
    :title="current?.name || 'User'"
    :subtitle="current?.email || ''"
    :persistent="busy"
    :max-width="720"
    @update:model-value="close"
  >
    <div v-if="current" class="space-y-8">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />

      <!-- Account -->
      <section :aria-labelledby="`${uid}-account`">
        <h3 :id="`${uid}-account`" class="mb-3 font-semibold text-gray-900 dark:text-white">Account</h3>
        <dl class="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Status</dt>
            <dd class="mt-0.5 flex flex-wrap items-center gap-2">
              <StatusBadge :status="current.status" />
              <span
                v-if="current.mustChangePassword"
                class="rounded px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >Must change password</span>
            </dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Last sign-in</dt>
            <dd class="mt-0.5 text-gray-900 dark:text-white">{{ formatDateTime(current.lastLoginAt) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Created</dt>
            <dd class="mt-0.5 text-gray-900 dark:text-white">{{ formatDateTime(current.createdAt, '—') }}</dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-gray-400">User ID</dt>
            <dd class="mt-0.5 break-all font-mono text-xs text-gray-700 dark:text-gray-300">{{ current.id }}</dd>
          </div>
        </dl>

        <form class="flex flex-wrap items-end gap-3" novalidate @submit.prevent="saveName">
          <div class="min-w-[14rem] flex-1">
            <label :for="`${uid}-name`" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              :id="`${uid}-name`"
              v-model="nameDraft"
              type="text"
              maxlength="200"
              autocomplete="off"
              :disabled="!canManageUsers"
              :aria-invalid="nameError ? 'true' : 'false'"
              :aria-describedby="nameError ? `${uid}-name-error` : undefined"
              class="w-full rounded-lg border border-solid px-3 py-2 text-sm bg-[#fff] text-gray-900 disabled:opacity-60 dark:bg-slate-700 dark:text-white"
              :class="nameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            />
          </div>
          <button
            v-if="canManageUsers"
            type="submit"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            :disabled="savingName || nameDraft.trim() === current.name"
          >
            {{ savingName ? 'Saving…' : 'Save name' }}
          </button>
          <p v-if="nameError" :id="`${uid}-name-error`" class="basis-full text-xs text-red-600 dark:text-red-400">{{ nameError }}</p>
        </form>

        <div v-if="canManageUsers" class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-solid px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="current.status === 'active'
              ? 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20'
              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20'"
            :disabled="isSelf && current.status === 'active'"
            :aria-describedby="isSelf ? `${uid}-self-hint` : undefined"
            @click="openStatusConfirm"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">{{ current.status === 'active' ? 'block' : 'check_circle' }}</span>
            {{ current.status === 'active' ? 'Disable user' : 'Enable user' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-solid border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
            :disabled="isSelf"
            :aria-describedby="isSelf ? `${uid}-self-hint` : undefined"
            @click="resetOpen = true"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">lock_reset</span>
            Reset password
          </button>
          <p v-if="isSelf" :id="`${uid}-self-hint`" class="basis-full text-xs text-gray-500 dark:text-gray-400">
            This is you. You can't disable your own account, and you change your own password with Change password in the user menu.
          </p>
        </div>
      </section>

      <!-- Roles -->
      <section :aria-labelledby="`${uid}-roles`">
        <h3 :id="`${uid}-roles`" class="mb-3 font-semibold text-gray-900 dark:text-white">Roles</h3>
        <p v-if="!current.roles.length" class="mb-3 text-sm text-gray-500 dark:text-gray-400">No roles. This user can sign in but can't do anything that needs a permission.</p>
        <ul v-else class="mb-3 space-y-2">
          <li
            v-for="roleId in current.roles"
            :key="roleId"
            class="flex items-center justify-between gap-3 rounded-lg border border-solid border-gray-200 p-3 dark:border-gray-700"
          >
            <div class="min-w-0">
              <div class="font-medium text-gray-900 dark:text-white">{{ roleName(roleId) }}</div>
              <div v-if="roleById(roleId)?.description" class="text-xs text-gray-500 dark:text-gray-400">{{ roleById(roleId).description }}</div>
            </div>
            <button
              v-if="canManageRoles"
              type="button"
              class="shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              :aria-label="`Remove role ${roleName(roleId)}`"
              @click="openRemoveRole(roleId)"
            >
              <span class="material-symbols-outlined text-base" aria-hidden="true">delete</span>
            </button>
          </li>
        </ul>
        <form v-if="canManageRoles" class="flex flex-wrap items-end gap-3" @submit.prevent="assignRole">
          <div class="min-w-[14rem] flex-1">
            <label :for="`${uid}-assign`" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Add a role</label>
            <select
              :id="`${uid}-assign`"
              v-model="roleToAssign"
              class="w-full rounded-lg border border-solid border-gray-300 px-3 py-2 text-sm bg-[#fff] text-gray-900 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
              :disabled="!assignableRoles.length"
            >
              <option value="">{{ assignableRoles.length ? 'Select a role' : 'Every role is assigned' }}</option>
              <option v-for="role in assignableRoles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <button
            type="submit"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            :disabled="!roleToAssign || assigning"
          >
            {{ assigning ? 'Adding…' : 'Add role' }}
          </button>
        </form>
        <p v-else class="text-xs text-gray-500 dark:text-gray-400">Changing roles needs the Role Management permission (admin:rbac).</p>
      </section>

      <!-- Workspaces (read-only) -->
      <section :aria-labelledby="`${uid}-workspaces`">
        <h3 :id="`${uid}-workspaces`" class="mb-3 font-semibold text-gray-900 dark:text-white">Workspaces</h3>
        <p v-if="workspaces.state === 'loading'" class="text-sm text-gray-500 dark:text-gray-400">Loading workspaces…</p>
        <p v-else-if="workspaces.state === 'unavailable'" class="text-sm text-gray-500 dark:text-gray-400">
          Workspace memberships aren't available yet.
        </p>
        <div v-else-if="workspaces.state === 'error'" class="flex flex-wrap items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <span>{{ workspaces.error }}</span>
          <button type="button" class="underline" @click="loadWorkspaces">Try again</button>
        </div>
        <p v-else-if="!workspaces.items.length" class="text-sm text-gray-500 dark:text-gray-400">Not a member of any workspace.</p>
        <ul v-else class="space-y-2">
          <li
            v-for="ws in workspaces.items"
            :key="ws.workspaceId"
            class="flex items-center justify-between gap-3 rounded-lg border border-solid border-gray-200 p-3 dark:border-gray-700"
          >
            <router-link
              :to="`/admin/workspaces/${encodeURIComponent(ws.workspaceId)}`"
              class="flex min-w-0 items-center gap-2 font-medium text-indigo-700 hover:underline dark:text-indigo-300"
              @click="close(false)"
            >
              <span class="material-symbols-outlined text-base" aria-hidden="true">folder</span>
              <span class="truncate">{{ ws.name }}</span>
            </router-link>
            <span class="shrink-0 rounded px-2 py-0.5 text-xs capitalize bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{{ ws.role }}</span>
          </li>
        </ul>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Memberships are managed on each workspace's page.</p>
      </section>
    </div>

    <template #actions>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        :disabled="busy"
        @click="close(false)"
      >
        Close
      </button>
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
