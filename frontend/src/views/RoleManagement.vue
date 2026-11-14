<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Role & permission management"
      lead="Manage user roles and their access to design system features and permissions."
      spot="site/role-management"
    />

    <InlineNotice :notice="notice" class="mt-8" @dismiss="clearNotice" />

    <PageSection title="Roles" description="What each role can do, and who has it.">
      <UiSpinner v-if="loadState === 'loading'" label="Loading roles…" />

      <UiCallout v-else-if="loadState === 'error'" tone="danger" role="alert">
        {{ loadError }}
        <template #actions>
          <UiButton size="sm" @click="load">Try again</UiButton>
        </template>
      </UiCallout>

      <UiEmptyState v-else-if="!roles.length" title="No roles found." spot="site/role-management" />

      <ul v-else class="flex flex-col gap-6">
        <li v-for="role in roles" :key="role.id">
          <UiPanel :title="role.name" :description="role.description" heading-tag="h3">
            <template v-if="canManageRoles" #actions>
              <UiButton
                size="sm"
                icon="edit"
                :disabled="!catalogue.length"
                :aria-label="`Edit permissions of ${role.name}`"
                @click="openEdit(role)"
              >
                Edit permissions
              </UiButton>
            </template>

            <div class="flex flex-wrap items-center gap-2">
              <UiCode>{{ role.id }}</UiCode>
              <UiChip v-if="myRoles.includes(role.id)" tone="accent">Your role</UiChip>
            </div>

            <!-- Permissions by category -->
            <div>
              <h4 class="sr-only">Permissions</h4>
              <div v-if="role.permissions.length" class="grid gap-3 md:grid-cols-2">
                <div v-for="group in groupPermissions(role.permissions, catalogue)" :key="group.name" class="role-group">
                  <h5 class="mb-2 text-sm font-semibold text-ink">{{ group.name }}</h5>
                  <ul class="flex flex-wrap gap-2">
                    <li v-for="permission in group.permissions" :key="permission.value" :title="permission.value">
                      <UiChip tone="success">{{ permission.label }}</UiChip>
                    </li>
                  </ul>
                </div>
              </div>
              <p v-else class="text-sm text-ink-muted">No permissions assigned</p>
            </div>

            <!-- Members -->
            <div class="border-t border-solid border-line pt-4">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 class="text-sm font-semibold text-ink-strong">
                  Members<template v-if="members[role.id]?.state === 'ready'"> ({{ members[role.id].items.length }})</template>
                </h4>
                <UiButton
                  v-if="canManageRoles"
                  variant="ghost"
                  size="sm"
                  icon="person_add"
                  :aria-label="`Add a member to ${role.name}`"
                  @click="openAddMember(role)"
                >
                  Add member
                </UiButton>
              </div>
              <p v-if="!members[role.id] || members[role.id].state === 'loading'" class="text-sm text-ink-muted">Loading members…</p>
              <UiCallout v-else-if="members[role.id].state === 'error'" tone="danger">
                {{ members[role.id].error }}
                <template #actions>
                  <UiButton size="sm" @click="loadMembers(role.id)">Try again</UiButton>
                </template>
              </UiCallout>
              <p v-else-if="!members[role.id].items.length" class="text-sm text-ink-muted">No users assigned</p>
              <ul v-else class="flex flex-col gap-2">
                <li v-for="member in members[role.id].items" :key="member.id" class="role-row">
                  <div class="min-w-0 text-sm">
                    <span class="font-medium text-ink-strong">{{ member.name }}</span>
                    <UiChip v-if="member.id === currentUserId" tone="accent" class="ml-2">You</UiChip>
                    <span class="block truncate text-xs text-ink-muted">{{ member.email }}</span>
                  </div>
                  <UiButton
                    v-if="canManageRoles"
                    variant="ghost"
                    size="sm"
                    icon="delete"
                    icon-only
                    :label="`Remove ${member.name} from ${role.name}`"
                    @click="confirmRemove(member, role)"
                  />
                </li>
              </ul>
            </div>
          </UiPanel>
        </li>
      </ul>
    </PageSection>

    <PageSection title="Roles for a user" description="Look someone up to see and change all of their roles at once." divided>
      <UiCallout v-if="!canSearchUsers">Searching for users needs the User Management permission (admin:users).</UiCallout>
      <div v-else class="flex flex-col gap-6">
        <div class="max-w-xl">
          <UserPicker label="Find a user" @select="selectLookup" />
        </div>

        <UiPanel v-if="lookup.user" :title="lookup.user.name + (lookup.user.id === currentUserId ? ' (you)' : '')" :description="lookup.user.email" heading-tag="h3">
          <template #actions>
            <UiButton variant="ghost" size="sm" icon="close" icon-only label="Clear the selected user" @click="clearLookup" />
          </template>

          <UiSpinner v-if="lookup.state === 'loading'" label="Loading roles…" />
          <UiCallout v-else-if="lookup.state === 'error'" tone="danger" role="alert">{{ lookup.error }}</UiCallout>
          <template v-else>
            <p v-if="!lookup.roles.length" class="text-sm text-ink-muted">No roles</p>
            <ul v-else class="flex flex-col gap-2">
              <li v-for="role in lookup.roles" :key="role.id" class="role-row">
                <div class="text-sm">
                  <span class="font-medium text-ink-strong">{{ role.name }}</span>
                  <span class="block text-xs text-ink-muted">{{ role.permissions.length }} permissions</span>
                </div>
                <UiButton
                  v-if="canManageRoles"
                  variant="ghost"
                  size="sm"
                  icon="delete"
                  icon-only
                  :label="`Remove ${role.name} from ${lookup.user.name}`"
                  @click="confirmRemove(lookup.user, role)"
                />
              </li>
            </ul>
            <form v-if="canManageRoles" class="flex flex-wrap items-end gap-3" @submit.prevent="assignToLookup">
              <div class="w-64">
                <UiSelect
                  id="lookup-assign"
                  v-model="lookup.roleToAdd"
                  label="Add a role"
                  :placeholder="lookupAssignable.length ? 'Select a role' : 'Every role is assigned'"
                  :options="lookupAssignable.map((role) => ({ value: role.id, label: role.name }))"
                  :disabled="!lookupAssignable.length"
                />
              </div>
              <UiButton type="submit" variant="primary" :loading="lookup.assigning" :disabled="!lookup.roleToAdd">
                {{ lookup.assigning ? 'Adding…' : 'Add role' }}
              </UiButton>
            </form>
          </template>
        </UiPanel>
      </div>
    </PageSection>

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
      <InlineNotice :notice="add.error ? { type: 'error', message: add.error } : null" @dismiss="add.error = ''" />
      <p v-if="!canSearchUsers">Searching for users needs the User Management permission (admin:users).</p>
      <UserPicker
        v-else
        label="Find a user"
        :exclude-ids="add.role ? (members[add.role.id]?.items ?? []).map((m) => m.id) : []"
        excluded-text="Already a member"
        @select="(u) => { add.user = u; add.error = ''; }"
      />
      <div v-if="add.user" class="role-picked">
        <div>
          <span class="font-medium text-ink-strong">{{ add.user.name }}</span>
          <span class="block text-xs text-ink-secondary">{{ add.user.email }}</span>
          <span v-if="add.user.status === 'disabled'" class="block text-xs text-warning">This user is disabled.</span>
        </div>
        <UiButton variant="ghost" size="sm" icon="close" icon-only label="Clear the selected user" @click="add.user = null" />
      </div>
      <template #actions>
        <UiButton :disabled="add.busy" @click="add.open = false">Cancel</UiButton>
        <UiButton variant="primary" :loading="add.busy" :disabled="!add.user" @click="addMember">
          {{ add.busy ? 'Adding…' : 'Add member' }}
        </UiButton>
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
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiEmptyState,
  UiPanel,
  UiSelect,
  UiSpinner,
} from '../components/ui';
import AdminDialog from '../components/admin/AdminDialog.vue';
import ConfirmActionDialog from '../components/admin/ConfirmActionDialog.vue';
import EditRolePermissionsDialog from '../components/admin/EditRolePermissionsDialog.vue';
import UserPicker from '../components/admin/UserPicker.vue';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import { adminErrorMessage, groupPermissions, rbacApi } from '../composables/useAccessAdmin.js';

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
.role-group {
  @apply rounded-tile border border-solid border-line bg-surface-sunken p-3;
}
.role-row {
  @apply flex items-center justify-between gap-3 rounded-tile border border-solid border-line-faint px-3 py-2;
}
.role-picked {
  @apply flex items-center justify-between gap-3 rounded-tile border border-solid border-accent-highlight bg-accent-subtle p-3;
}
</style>
