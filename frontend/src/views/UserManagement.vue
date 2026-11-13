<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  User Management
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Create and manage the people who can sign in: their accounts, passwords and roles.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="userMgmtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- User icons representing user management -->
                    <circle cx="50" cy="50" r="15" fill="url(#userMgmtGradient)" opacity="0.6"/>
                    <circle cx="150" cy="50" r="15" fill="url(#userMgmtGradient)" opacity="0.6"/>
                    <circle cx="100" cy="100" r="18" fill="url(#userMgmtGradient)" opacity="0.7"/>
                    <circle cx="50" cy="150" r="15" fill="url(#userMgmtGradient)" opacity="0.6"/>
                    <circle cx="150" cy="150" r="15" fill="url(#userMgmtGradient)" opacity="0.6"/>
                    <!-- Connection lines representing workspace relationships -->
                    <path d="M 50 50 L 100 100" stroke="url(#userMgmtGradient)" stroke-width="2" opacity="0.3"/>
                    <path d="M 150 50 L 100 100" stroke="url(#userMgmtGradient)" stroke-width="2" opacity="0.3"/>
                    <path d="M 50 150 L 100 100" stroke="url(#userMgmtGradient)" stroke-width="2" opacity="0.3"/>
                    <path d="M 150 150 L 100 100" stroke="url(#userMgmtGradient)" stroke-width="2" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="max-w-7xl mx-auto space-y-4">
          <InlineNotice :notice="notice" @dismiss="clearNotice" />

          <!-- Toolbar -->
          <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-[16rem] flex-1">
              <label for="user-search" class="mb-2 block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Search</label>
              <input
                id="user-search"
                v-model="search"
                type="search"
                placeholder="Name or email"
                autocomplete="off"
                class="w-full rounded-lg border border-solid px-3 py-2 text-sm"
                :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-white' : 'border-gray-300 bg-[#fff] text-gray-900'"
              />
            </div>
            <div>
              <label for="user-status" class="mb-2 block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Status</label>
              <select
                id="user-status"
                v-model="statusFilter"
                class="rounded-lg border border-solid px-3 py-2 text-sm"
                :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-white' : 'border-gray-300 bg-[#fff] text-gray-900'"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div v-if="canReadRoles">
              <label for="user-role" class="mb-2 block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Role</label>
              <select
                id="user-role"
                v-model="roleFilter"
                class="rounded-lg border border-solid px-3 py-2 text-sm"
                :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-white' : 'border-gray-300 bg-[#fff] text-gray-900'"
              >
                <option value="">Any role</option>
                <option value="__none">No roles</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
            <button
              v-if="canManageUsers"
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'"
              @click="createOpen = true"
            >
              <span class="material-symbols-outlined text-base" aria-hidden="true">person_add</span>
              Create user
            </button>
          </div>

          <!-- Users Table -->
          <div
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-[#fff] border-gray-200'"
          >
            <div v-if="loadState === 'loading' && !users.length" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'" role="status">
              Loading users…
            </div>

            <div v-else-if="loadState === 'error'" class="p-8 text-center" role="alert">
              <p class="mb-4" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">{{ loadError }}</p>
              <button
                type="button"
                class="rounded-lg border border-solid px-4 py-2 text-sm font-medium transition-colors"
                :class="isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
                @click="loadUsers"
              >
                Try again
              </button>
            </div>

            <div v-else-if="!filteredUsers.length" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              {{ hasFilters ? 'No users match these filters.' : 'No users yet.' }}
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <caption class="sr-only">Users, sorted by email</caption>
                <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">User</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Roles</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Last sign-in</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                  <tr
                    v-for="u in pagedUsers"
                    :key="u.id"
                    class="transition-colors"
                    :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold" :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'" aria-hidden="true">
                          {{ initialsFor(u) }}
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2 text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            <span class="truncate">{{ u.name }}</span>
                            <span v-if="u.id === currentUserId" class="rounded px-1.5 py-0.5 text-xs" :class="isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700'">You</span>
                          </div>
                          <div class="truncate text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ u.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col items-start gap-1">
                        <StatusBadge :status="u.status" />
                        <span v-if="u.mustChangePassword" class="text-xs" :class="isDarkMode ? 'text-amber-300' : 'text-amber-700'">Must change password</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span v-if="!u.roles.length" class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">None</span>
                      <ul v-else class="flex flex-wrap gap-1.5">
                        <li
                          v-for="roleId in u.roles"
                          :key="roleId"
                          class="rounded px-2 py-0.5 text-xs font-medium"
                          :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'"
                        >
                          {{ roleName(roleId) }}
                        </li>
                      </ul>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ formatDateTime(u.lastLoginAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                        :class="isDarkMode ? 'text-indigo-300 hover:bg-slate-800' : 'text-indigo-700 hover:bg-indigo-50'"
                        :aria-label="`Manage ${u.name} (${u.email})`"
                        @click="openUser(u)"
                      >
                        <span class="material-symbols-outlined text-base" aria-hidden="true">manage_accounts</span>
                        Manage
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paging -->
            <nav
              v-if="filteredUsers.length > PAGE_SIZE"
              class="flex flex-wrap items-center justify-between gap-3 border-t border-solid px-6 py-3 text-sm"
              :class="isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'"
              aria-label="Users pages"
            >
              <span>Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredUsers.length }}</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-solid px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  :class="isDarkMode ? 'border-gray-600 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-100'"
                  :disabled="page === 0"
                  @click="page--"
                >
                  Previous
                </button>
                <span aria-live="polite">Page {{ page + 1 }} of {{ pageCount }}</span>
                <button
                  type="button"
                  class="rounded-lg border border-solid px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  :class="isDarkMode ? 'border-gray-600 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-100'"
                  :disabled="page >= pageCount - 1"
                  @click="page++"
                >
                  Next
                </button>
              </div>
            </nav>
          </div>
          <p class="sr-only" role="status" aria-live="polite">{{ resultsAnnouncement }}</p>
        </div>
      </div>
    </div>
    </div>

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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import StatusBadge from '../components/admin/StatusBadge.vue';
import CreateUserDialog from '../components/admin/CreateUserDialog.vue';
import UserDetailDialog from '../components/admin/UserDetailDialog.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import { initialsFor, useAuth } from '../composables/useAuth.js';
import { adminErrorMessage, formatDateTime, rbacApi, usersApi } from '../composables/useAccessAdmin.js';

const PAGE_SIZE = 25;

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
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
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

