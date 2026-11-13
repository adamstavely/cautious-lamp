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
                  Role & Permission Management
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Manage user roles and their access to design system features and permissions.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="rbacGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Central hub representing the system -->
                    <circle cx="100" cy="100" r="35" fill="url(#rbacGradient)" opacity="0.3"/>
                    <circle cx="100" cy="100" r="25" fill="url(#rbacGradient)" opacity="0.4"/>
                    <circle cx="100" cy="100" r="15" fill="url(#rbacGradient)" opacity="0.6"/>
                    
                    <!-- Role badges around the center -->
                    <!-- Top role badge -->
                    <rect x="75" y="30" width="50" height="30" rx="4" fill="url(#rbacGradient)" opacity="0.5"/>
                    <circle cx="100" cy="45" r="8" fill="url(#rbacGradient)" opacity="0.7"/>
                    <line x1="100" y1="60" x2="100" y2="75" stroke="url(#rbacGradient)" stroke-width="2" opacity="0.4"/>
                    
                    <!-- Right role badge -->
                    <rect x="120" y="75" width="50" height="30" rx="4" fill="url(#rbacGradient)" opacity="0.5"/>
                    <circle cx="145" cy="90" r="8" fill="url(#rbacGradient)" opacity="0.7"/>
                    <line x1="120" y1="90" x2="100" y2="90" stroke="url(#rbacGradient)" stroke-width="2" opacity="0.4"/>
                    
                    <!-- Bottom role badge -->
                    <rect x="75" y="140" width="50" height="30" rx="4" fill="url(#rbacGradient)" opacity="0.5"/>
                    <circle cx="100" cy="155" r="8" fill="url(#rbacGradient)" opacity="0.7"/>
                    <line x1="100" y1="140" x2="100" y2="125" stroke="url(#rbacGradient)" stroke-width="2" opacity="0.4"/>
                    
                    <!-- Left role badge -->
                    <rect x="30" y="75" width="50" height="30" rx="4" fill="url(#rbacGradient)" opacity="0.5"/>
                    <circle cx="55" cy="90" r="8" fill="url(#rbacGradient)" opacity="0.7"/>
                    <line x1="80" y1="90" x2="100" y2="90" stroke="url(#rbacGradient)" stroke-width="2" opacity="0.4"/>
                    
                    <!-- Permission keys/locks around roles -->
                    <rect x="85" y="25" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    <rect x="107" y="25" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    
                    <rect x="155" y="80" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    <rect x="155" y="95" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    
                    <rect x="85" y="163" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    <rect x="107" y="163" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    
                    <rect x="37" y="80" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                    <rect x="37" y="95" width="8" height="12" rx="1" fill="white" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

    <div class="max-w-7xl mx-auto mb-4">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
    </div>

    <!-- Roles Section -->
    <div class="max-w-7xl mx-auto mb-8">
      <section
        class="rounded-lg shadow-sm border p-6"
        :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-[#fff] border-gray-200'"
        aria-labelledby="roles-heading"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 id="roles-heading" class="text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">badge</span>
            Roles
          </h2>
        </div>

        <div v-if="loadState === 'loading'" class="text-center py-12" role="status">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" aria-hidden="true"></div>
          <p class="mt-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading roles…</p>
        </div>

        <div v-else-if="loadState === 'error'" class="py-8 text-center" role="alert">
          <p class="mb-4" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">{{ loadError }}</p>
          <button
            type="button"
            class="rounded-lg border border-solid px-4 py-2 text-sm font-medium transition-colors"
            :class="isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-slate-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
            @click="load"
          >
            Try again
          </button>
        </div>

        <p v-else-if="!roles.length" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No roles found.</p>

        <ul v-else class="space-y-4">
          <li
            v-for="role in roles"
            :key="role.id"
            class="border border-solid rounded-lg p-4 transition-all"
            :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
          >
            <article :aria-labelledby="`role-${role.id}-name`">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                    <h3 :id="`role-${role.id}-name`" class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ role.name }}
                    </h3>
                    <code class="px-2 py-1 rounded text-xs font-medium" :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'">{{ role.id }}</code>
                    <span v-if="myRoles.includes(role.id)" class="rounded px-2 py-0.5 text-xs" :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'">Your role</span>
                  </div>
                  <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ role.description }}</p>
                </div>
                <button
                  v-if="canManageRoles"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-solid px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  :class="isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
                  :disabled="!catalogue.length"
                  :aria-label="`Edit permissions of ${role.name}`"
                  @click="openEdit(role)"
                >
                  <span class="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                  Edit permissions
                </button>
              </div>

              <!-- Permissions by Category -->
              <h4 class="sr-only">Permissions</h4>
              <div v-if="role.permissions.length" class="grid gap-3 md:grid-cols-2">
                <div
                  v-for="group in groupPermissions(role.permissions, catalogue)"
                  :key="group.name"
                  class="border border-solid rounded p-3"
                  :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-[#fff]'"
                >
                  <h5 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ group.name }}
                  </h5>
                  <ul class="flex flex-wrap gap-2">
                    <li
                      v-for="permission in group.permissions"
                      :key="permission.value"
                      class="px-2 py-1 rounded text-xs border border-solid"
                      :class="isDarkMode ? 'bg-green-900/30 text-green-300 border-green-400/30' : 'bg-green-100 text-green-800 border-green-200'"
                      :title="permission.value"
                    >
                      {{ permission.label }}
                    </li>
                  </ul>
                </div>
              </div>
              <p v-else class="text-sm italic" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">No permissions assigned</p>

              <!-- Members -->
              <div class="mt-4 border-t border-solid pt-4" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">
                    Members<template v-if="members[role.id]?.state === 'ready'"> ({{ members[role.id].items.length }})</template>
                  </h4>
                  <button
                    v-if="canManageRoles"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                    :class="isDarkMode ? 'text-indigo-300 hover:bg-slate-700' : 'text-indigo-700 hover:bg-indigo-50'"
                    :aria-label="`Add a member to ${role.name}`"
                    @click="openAddMember(role)"
                  >
                    <span class="material-symbols-outlined text-base" aria-hidden="true">person_add</span>
                    Add member
                  </button>
                </div>
                <p v-if="!members[role.id] || members[role.id].state === 'loading'" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Loading members…</p>
                <div v-else-if="members[role.id].state === 'error'" class="flex flex-wrap items-center gap-3 text-sm" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">
                  <span>{{ members[role.id].error }}</span>
                  <button type="button" class="underline" @click="loadMembers(role.id)">Try again</button>
                </div>
                <p v-else-if="!members[role.id].items.length" class="text-sm italic" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">No users assigned</p>
                <ul v-else class="space-y-2">
                  <li
                    v-for="member in members[role.id].items"
                    :key="member.id"
                    class="flex items-center justify-between gap-3 rounded p-2"
                    :class="isDarkMode ? 'bg-slate-900' : 'bg-[#fff]'"
                  >
                    <div class="min-w-0 text-sm">
                      <span class="font-medium" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ member.name }}</span>
                      <span v-if="member.id === currentUserId" class="ml-2 rounded px-1.5 py-0.5 text-xs" :class="isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700'">You</span>
                      <span class="block truncate text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ member.email }}</span>
                    </div>
                    <button
                      v-if="canManageRoles"
                      type="button"
                      class="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      :aria-label="`Remove ${member.name} from ${role.name}`"
                      @click="confirmRemove(member, role)"
                    >
                      <span class="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                    </button>
                  </li>
                </ul>
              </div>
            </article>
          </li>
        </ul>
      </section>
    </div>

    <!-- Roles for a user -->
    <div class="max-w-7xl mx-auto mb-8">
      <section
        class="rounded-lg shadow-sm border p-6"
        :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-[#fff] border-gray-200'"
        aria-labelledby="user-roles-heading"
      >
        <h2 id="user-roles-heading" class="mb-2 text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
          <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">group</span>
          Roles for a user
        </h2>
        <p class="mb-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          Look someone up to see and change all of their roles at once.
        </p>

        <p v-if="!canSearchUsers" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          Searching for users needs the User Management permission (admin:users).
        </p>
        <template v-else>
          <div class="max-w-xl">
            <UserPicker label="Find a user" @select="selectLookup" />
          </div>

          <div v-if="lookup.user" class="mt-6 rounded-lg border border-solid p-4" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ lookup.user.name }}
                  <span v-if="lookup.user.id === currentUserId" class="ml-1 text-xs font-normal">(you)</span>
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ lookup.user.email }}</p>
              </div>
              <button
                type="button"
                class="rounded-lg p-2 transition-colors"
                :class="isDarkMode ? 'text-gray-400 hover:bg-slate-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'"
                aria-label="Clear the selected user"
                @click="clearLookup"
              >
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <p v-if="lookup.state === 'loading'" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" role="status">Loading roles…</p>
            <p v-else-if="lookup.state === 'error'" class="text-sm" :class="isDarkMode ? 'text-red-300' : 'text-red-700'" role="alert">{{ lookup.error }}</p>
            <template v-else>
              <p v-if="!lookup.roles.length" class="mb-3 text-sm italic" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">No roles</p>
              <ul v-else class="mb-3 space-y-2">
                <li
                  v-for="role in lookup.roles"
                  :key="role.id"
                  class="flex items-center justify-between gap-3 rounded p-2"
                  :class="isDarkMode ? 'bg-slate-900' : 'bg-[#fff]'"
                >
                  <div class="text-sm">
                    <span class="font-medium" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ role.name }}</span>
                    <span class="block text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ role.permissions.length }} permissions</span>
                  </div>
                  <button
                    v-if="canManageRoles"
                    type="button"
                    class="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    :aria-label="`Remove ${role.name} from ${lookup.user.name}`"
                    @click="confirmRemove(lookup.user, role)"
                  >
                    <span class="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                  </button>
                </li>
              </ul>
              <form v-if="canManageRoles" class="flex flex-wrap items-end gap-3" @submit.prevent="assignToLookup">
                <div class="min-w-[14rem]">
                  <label for="lookup-assign" class="mb-2 block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Add a role</label>
                  <select
                    id="lookup-assign"
                    v-model="lookup.roleToAdd"
                    class="w-full rounded-lg border border-solid px-3 py-2 text-sm"
                    :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-[#fff] text-gray-900'"
                    :disabled="!lookupAssignable.length"
                  >
                    <option value="">{{ lookupAssignable.length ? 'Select a role' : 'Every role is assigned' }}</option>
                    <option v-for="role in lookupAssignable" :key="role.id" :value="role.id">{{ role.name }}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'"
                  :disabled="!lookup.roleToAdd || lookup.assigning"
                >
                  {{ lookup.assigning ? 'Adding…' : 'Add role' }}
                </button>
              </form>
            </template>
          </div>
        </template>
      </section>
    </div>
        </div>
      </div>
    </div>

    <EditRolePermissionsDialog
      v-model="edit.open"
      :role="edit.role"
      :catalogue="catalogue"
      :member-count="edit.role && members[edit.role.id]?.state === 'ready' ? members[edit.role.id].items.length : null"
      :affects-me="!!edit.role && myRoles.includes(edit.role.id)"
      @saved="onRoleSaved"
    />

    <AdminDialog
      v-model="add.open"
      :title="`Add a member to ${add.role?.name ?? ''}`"
      :persistent="add.busy"
      :max-width="560"
    >
      <div class="space-y-4">
        <InlineNotice :notice="add.error ? { type: 'error', message: add.error } : null" @dismiss="add.error = ''" />
        <p v-if="!canSearchUsers" class="text-sm text-gray-600 dark:text-gray-400">
          Searching for users needs the User Management permission (admin:users).
        </p>
        <UserPicker
          v-else
          label="Find a user"
          :exclude-ids="add.role ? (members[add.role.id]?.items ?? []).map((m) => m.id) : []"
          excluded-text="Already a member"
          @select="(u) => { add.user = u; add.error = ''; }"
        />
        <div
          v-if="add.user"
          class="flex items-center justify-between gap-3 rounded-lg border border-solid border-indigo-200 bg-indigo-50 p-3 text-sm dark:border-indigo-800 dark:bg-indigo-950/40"
        >
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{ add.user.name }}</span>
            <span class="block text-xs text-gray-600 dark:text-gray-400">{{ add.user.email }}</span>
            <span v-if="add.user.status === 'disabled'" class="block text-xs text-amber-700 dark:text-amber-300">This user is disabled.</span>
          </div>
          <button
            type="button"
            class="rounded p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="Clear the selected user"
            @click="add.user = null"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </div>
      </div>
      <template #actions>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
          :disabled="add.busy"
          @click="add.open = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :disabled="!add.user || add.busy"
          @click="addMember"
        >
          {{ add.busy ? 'Adding…' : 'Add member' }}
        </button>
      </template>
    </AdminDialog>

    <ConfirmActionDialog
      v-model="remove.open"
      title="Remove role?"
      :message="remove.user && remove.role ? `${remove.user.name} (${remove.user.email}) will lose the &quot;${remove.role.name}&quot; role and the permissions only it grants.` : ''"
      confirm-text="Remove role"
      busy-text="Removing…"
      danger
      :busy="remove.busy"
      :error="remove.error"
      @clear-error="remove.error = ''"
      @confirm="removeMember"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import AdminDialog from '../components/admin/AdminDialog.vue';
import ConfirmActionDialog from '../components/admin/ConfirmActionDialog.vue';
import EditRolePermissionsDialog from '../components/admin/EditRolePermissionsDialog.vue';
import UserPicker from '../components/admin/UserPicker.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import { adminErrorMessage, groupPermissions, rbacApi } from '../composables/useAccessAdmin.js';

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const { user: authUser, hasPermission, refreshMe } = useAuth();

const currentUserId = computed(() => authUser.value?.id ?? null);
const myRoles = computed(() => authUser.value?.roles ?? []);
const canManageRoles = computed(() => hasPermission('admin:rbac'));
// The user picker searches GET /users, which needs admin:users
const canSearchUsers = computed(() => hasPermission('admin:users'));

const roles = ref([]);
const catalogue = ref([]);
const loadState = ref('idle');
const loadError = ref('');
/** roleId → { state: 'loading' | 'ready' | 'error', items: UserSummary[], error } */
const members = reactive({});

const edit = reactive({ open: false, role: null });
const add = reactive({ open: false, role: null, user: null, busy: false, error: '' });
const remove = reactive({ open: false, user: null, role: null, busy: false, error: '' });
const lookup = reactive({ user: null, roles: [], state: 'idle', error: '', roleToAdd: '', assigning: false });

const lookupAssignable = computed(() => roles.value.filter((role) => !lookup.roles.some((r) => r.id === role.id)));

const byName = (a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email);

const loadMembers = async (roleId) => {
  members[roleId] = { state: 'loading', items: members[roleId]?.items ?? [], error: '' };
  try {
    const items = await rbacApi.members(roleId);
    members[roleId] = { state: 'ready', items: [...items].sort(byName), error: '' };
  } catch (error) {
    members[roleId] = { state: 'error', items: [], error: adminErrorMessage(error, "Couldn't load members.") };
  }
};

const load = async () => {
  loadState.value = 'loading';
  loadError.value = '';
  try {
    const [roleList, permissionList] = await Promise.all([rbacApi.roles(), rbacApi.permissions()]);
    roles.value = roleList;
    catalogue.value = permissionList;
    loadState.value = 'ready';
    roleList.forEach((role) => loadMembers(role.id));
  } catch (error) {
    loadState.value = 'error';
    loadError.value = adminErrorMessage(error, "Couldn't load roles.");
  }
};

const loadLookupRoles = async () => {
  if (!lookup.user) return;
  const userId = lookup.user.id;
  lookup.state = 'loading';
  lookup.error = '';
  try {
    const result = await rbacApi.userRoles(userId);
    if (lookup.user?.id !== userId) return;
    lookup.roles = result;
    lookup.state = 'ready';
  } catch (error) {
    if (lookup.user?.id !== userId) return;
    lookup.state = 'error';
    lookup.error = adminErrorMessage(error, "Couldn't load this user's roles.");
  }
};

const selectLookup = (user) => {
  lookup.user = user;
  lookup.roles = [];
  lookup.roleToAdd = '';
  loadLookupRoles();
};

const clearLookup = () => {
  lookup.user = null;
  lookup.roles = [];
  lookup.state = 'idle';
};

/** After an assignment change: refresh the affected lists, and my permissions if it was me */
const afterAssignmentChange = async (userId, roleId) => {
  await loadMembers(roleId);
  if (lookup.user?.id === userId) await loadLookupRoles();
  if (userId === currentUserId.value) await refreshMe();
};

const openEdit = (role) => {
  edit.role = role;
  edit.open = true;
};

const onRoleSaved = async (updated, diff) => {
  const index = roles.value.findIndex((role) => role.id === updated.id);
  if (index >= 0) roles.value.splice(index, 1, updated);
  if (lookup.user) loadLookupRoles();
  showNotice(`Saved ${updated.name}: ${diff.added} added, ${diff.removed} removed.`, 'success');
  if (myRoles.value.includes(updated.id)) await refreshMe();
};

const openAddMember = (role) => {
  Object.assign(add, { open: true, role, user: null, busy: false, error: '' });
};

const addMember = async () => {
  if (!add.user || !add.role) return;
  add.busy = true;
  add.error = '';
  const { user, role } = add;
  try {
    await rbacApi.assign(user.id, role.id);
    add.open = false;
    showNotice(`Added ${user.name} to ${role.name}.`, 'success');
    await afterAssignmentChange(user.id, role.id);
  } catch (error) {
    add.error = adminErrorMessage(error, "Couldn't add the member.");
  } finally {
    add.busy = false;
  }
};

const assignToLookup = async () => {
  const roleId = lookup.roleToAdd;
  const user = lookup.user;
  if (!roleId || !user) return;
  lookup.assigning = true;
  try {
    await rbacApi.assign(user.id, roleId);
    lookup.roleToAdd = '';
    const role = roles.value.find((r) => r.id === roleId);
    showNotice(`Added ${user.name} to ${role?.name ?? roleId}.`, 'success');
    await afterAssignmentChange(user.id, roleId);
  } catch (error) {
    showNotice(adminErrorMessage(error, "Couldn't add the role."), 'error');
  } finally {
    lookup.assigning = false;
  }
};

const confirmRemove = (user, role) => {
  Object.assign(remove, { open: true, user, role, busy: false, error: '' });
};

const removeMember = async () => {
  const { user, role } = remove;
  remove.busy = true;
  remove.error = '';
  try {
    await rbacApi.remove(user.id, role.id);
    remove.open = false;
    showNotice(`Removed ${user.name} from ${role.name}.`, 'success');
    await afterAssignmentChange(user.id, role.id);
  } catch (error) {
    // 409 when this would leave no active user with admin:rbac
    remove.error = adminErrorMessage(error, "Couldn't remove the role.");
  } finally {
    remove.busy = false;
  }
};

onMounted(load);
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

