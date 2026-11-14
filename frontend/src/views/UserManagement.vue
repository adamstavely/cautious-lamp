<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="User management"
      lead="Create and manage the people who can sign in: their accounts, passwords and roles."
      spot="admin/user-management"
    />

    <PageSection title="Users" description="Search, filter and manage accounts.">
      <template v-if="canManageUsers" #actions>
        <UiButton variant="primary" icon="person_add" @click="createOpen = true">Create user</UiButton>
      </template>

      <div class="flex flex-col gap-4">
        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <!-- Filters -->
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-0 flex-1 basis-64">
            <UiInput id="user-search" v-model="search" type="search" label="Search" icon="search" placeholder="Name or email" autocomplete="off" />
          </div>
          <div class="w-44">
            <UiSelect id="user-status" v-model="statusFilter" label="Status" :options="statusOptions" />
          </div>
          <div v-if="canReadRoles" class="w-52">
            <UiSelect id="user-role" v-model="roleFilter" label="Role" :options="roleOptions" />
          </div>
        </div>

        <UiSpinner v-if="loadState === 'loading' && !users.length" label="Loading users…" />

        <UiCallout v-else-if="loadState === 'error'" tone="danger" role="alert">
          {{ loadError }}
          <template #actions>
            <UiButton size="sm" @click="loadUsers">Try again</UiButton>
          </template>
        </UiCallout>

        <UiEmptyState
          v-else-if="!filteredUsers.length"
          :title="hasFilters ? 'No users match these filters.' : 'No users yet.'"
          :spot="hasFilters ? '' : 'admin/user-management'"
        />

        <UiPanel v-else flush>
          <UiTable caption="Users, sorted by email">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Status</th>
                <th scope="col">Roles</th>
                <th scope="col">Last sign-in</th>
                <th scope="col" class="text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in pagedUsers" :key="u.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" aria-hidden="true">{{ initialsFor(u) }}</div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 font-medium text-ink-strong">
                        <span class="truncate">{{ u.name }}</span>
                        <UiChip v-if="u.id === currentUserId" tone="accent">You</UiChip>
                      </div>
                      <div class="truncate text-xs text-ink-muted">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap">
                  <div class="flex flex-col items-start gap-1">
                    <StatusBadge :status="u.status" />
                    <span v-if="u.mustChangePassword" class="text-xs text-warning">Must change password</span>
                  </div>
                </td>
                <td>
                  <span v-if="!u.roles.length" class="text-ink-muted">None</span>
                  <ul v-else class="flex flex-wrap gap-1.5">
                    <li v-for="roleId in u.roles" :key="roleId"><UiChip tone="accent">{{ roleName(roleId) }}</UiChip></li>
                  </ul>
                </td>
                <td class="whitespace-nowrap text-ink-secondary">{{ formatDateTime(u.lastLoginAt) }}</td>
                <td class="whitespace-nowrap text-right">
                  <UiButton variant="ghost" size="sm" icon="manage_accounts" :aria-label="`Manage ${u.name} (${u.email})`" @click="openUser(u)">
                    Manage
                  </UiButton>
                </td>
              </tr>
            </tbody>
          </UiTable>

          <template v-if="filteredUsers.length > PAGE_SIZE" #footer>
            <nav class="flex w-full flex-wrap items-center justify-between gap-3 text-sm text-ink-secondary" aria-label="Users pages">
              <span>Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredUsers.length }}</span>
              <div class="flex items-center gap-2">
                <UiButton size="sm" icon="chevron_left" :disabled="page === 0" @click="page--">Previous</UiButton>
                <span aria-live="polite">Page {{ page + 1 }} of {{ pageCount }}</span>
                <UiButton size="sm" trailing-icon="chevron_right" :disabled="page >= pageCount - 1" @click="page++">Next</UiButton>
              </div>
            </nav>
          </template>
        </UiPanel>
        <p class="sr-only" role="status" aria-live="polite">{{ resultsAnnouncement }}</p>
      </div>
    </PageSection>

    <CreateUserDialog
      v-model="createOpen"
      :roles="roles"
      :can-assign-roles="canManageRoles && rolesLoaded"
      @created="onCreated"
    />

    <UserDetailDialog
      v-model="detailOpen"
      :user="selectedUser"
      :roles="roles"
      :current-user-id="currentUserId"
      :can-manage-users="canManageUsers"
      :can-manage-roles="canManageRoles && rolesLoaded"
      @updated="onUpdated"
    />
  </PageShell>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiTable,
} from '../components/ui';
import StatusBadge from '../components/admin/StatusBadge.vue';
import CreateUserDialog from '../components/admin/CreateUserDialog.vue';
import UserDetailDialog from '../components/admin/UserDetailDialog.vue';
import { useNotice } from '../composables/useNotice.js';
import { initialsFor, useAuth } from '../composables/useAuth.js';
import { adminErrorMessage, formatDateTime, rbacApi, usersApi } from '../composables/useAccessAdmin.js';

const PAGE_SIZE = 25;

const { notice, showNotice, clearNotice } = useNotice();
const { user: authUser, hasPermission, refreshMe } = useAuth();

const currentUserId = computed(() => authUser.value?.id ?? null);
const canManageUsers = computed(() => hasPermission('admin:users'));
// Role names and role changes need admin:rbac; without it roles show as ids
const canReadRoles = computed(() => hasPermission('admin:rbac'));
const canManageRoles = canReadRoles;

const users = ref([]);
const loadState = ref('idle');
const loadError = ref('');
const roles = ref([]);
const rolesLoaded = ref(false);
const search = ref('');
const statusFilter = ref('');
const roleFilter = ref('');
const page = ref(0);
const createOpen = ref(false);
const detailOpen = ref(false);
const selectedUser = ref(null);

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];
const roleOptions = computed(() => [
  { value: '', label: 'Any role' },
  { value: '__none', label: 'No roles' },
  ...roles.value.map((role) => ({ value: role.id, label: role.name })),
]);

const roleName = (id) => roles.value.find((role) => role.id === id)?.name ?? id;

const hasFilters = computed(() => !!(search.value.trim() || statusFilter.value || roleFilter.value));
const filteredUsers = computed(() => {
  if (!roleFilter.value) return users.value;
  if (roleFilter.value === '__none') return users.value.filter((u) => !u.roles.length);
  return users.value.filter((u) => u.roles.includes(roleFilter.value));
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const pageStart = computed(() => page.value * PAGE_SIZE);
const pageEnd = computed(() => Math.min(filteredUsers.value.length, pageStart.value + PAGE_SIZE));
const pagedUsers = computed(() => filteredUsers.value.slice(pageStart.value, pageEnd.value));
const resultsAnnouncement = computed(() =>
  loadState.value === 'ready' ? `${filteredUsers.value.length} user${filteredUsers.value.length === 1 ? '' : 's'}` : ''
);

watch(pageCount, (count) => {
  if (page.value > count - 1) page.value = count - 1;
});
watch(roleFilter, () => {
  page.value = 0;
});

let seq = 0;
const loadUsers = async () => {
  const mine = ++seq;
  loadState.value = 'loading';
  loadError.value = '';
  try {
    const result = await usersApi.list({ q: search.value.trim() || undefined, status: statusFilter.value || undefined });
    if (mine !== seq) return;
    users.value = Array.isArray(result?.users) ? result.users : [];
    loadState.value = 'ready';
  } catch (error) {
    if (mine !== seq) return;
    users.value = [];
    loadState.value = 'error';
    loadError.value = adminErrorMessage(error, "Couldn't load users.");
  }
};

const loadRoles = async () => {
  if (!canReadRoles.value) return;
  try {
    roles.value = await rbacApi.roles();
    rolesLoaded.value = true;
  } catch (error) {
    rolesLoaded.value = false;
    showNotice(`${adminErrorMessage(error, "Couldn't load roles.")} Roles are shown by id and can't be changed.`, 'warning');
  }
};

let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 0;
    loadUsers();
  }, 300);
});
watch(statusFilter, () => {
  page.value = 0;
  loadUsers();
});

const openUser = (u) => {
  selectedUser.value = u;
  detailOpen.value = true;
};

const replaceUser = (updated) => {
  const index = users.value.findIndex((u) => u.id === updated.id);
  if (index >= 0) users.value.splice(index, 1, updated);
};

const onUpdated = (updated) => {
  replaceUser(updated);
  // My own roles may have changed: reload my permissions so the UI matches
  if (updated.id === currentUserId.value) refreshMe();
};

const onCreated = (created) => {
  showNotice(`Created ${created.email}.`, 'success');
  loadUsers();
};

// When the detail dialog closes, re-sync with the server (filters may no longer match)
watch(detailOpen, (open) => {
  if (!open) loadUsers();
});

onMounted(() => {
  loadUsers();
  loadRoles();
});

onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<style scoped>
.user-avatar {
  @apply flex w-10 h-10 shrink-0 items-center justify-center rounded-pill bg-fill text-sm font-semibold text-ink-secondary;
}
</style>
