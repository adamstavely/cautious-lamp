<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
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

    <!-- Roles Section -->
    <div class="max-w-7xl mx-auto mb-8">
      <div 
        class="rounded-lg shadow-sm border p-6"
        :class="isDarkMode 
          ? 'bg-slate-900 border-gray-700' 
          : 'bg-white border-gray-200'"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600">badge</span>
            Roles
          </h2>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading roles...</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="role in roles"
            :key="role.id"
            class="border rounded-lg p-4 transition-all"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-800 hover:border-indigo-400' 
              : 'border-gray-200 bg-gray-50 hover:border-indigo-500'"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ role.name }}
                  </h3>
                  <span class="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {{ role.id }}
                  </span>
                </div>
                <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ role.description }}
                </p>
                
                <!-- Permissions by Category -->
                <div v-if="role.permissions && role.permissions.length > 0" class="space-y-3">
                  <div
                    v-for="category in getPermissionsByCategory(role.permissions)"
                    :key="category.name"
                    class="border rounded p-3"
                    :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-white'"
                  >
                    <h4 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ category.name }}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="permission in category.permissions"
                        :key="permission"
                        class="px-2 py-1 rounded text-xs"
                        :class="isDarkMode 
                          ? 'bg-green-900/30 text-green-300 border border-green-400/30' 
                          : 'bg-green-100 text-green-800 border border-green-200'"
                      >
                        {{ getPermissionLabel(permission) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                  No permissions assigned
                </div>
              </div>
              <div class="ml-4">
                <button
                  @click="editRole(role)"
                  class="p-2 rounded-lg transition-colors"
                  :class="isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
                  title="Edit Role Permissions"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Role Assignments Section -->
    <div class="max-w-7xl mx-auto mb-8">
      <div 
        class="rounded-lg shadow-sm border p-6"
        :class="isDarkMode 
          ? 'bg-slate-900 border-gray-700' 
          : 'bg-white border-gray-200'"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600">group</span>
            User Role Assignments
          </h2>
          <button
            @click="showAssignModal = true"
            class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            :class="isDarkMode 
              ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          >
            <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
            Assign Role
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="role in roles"
            :key="role.id"
            class="border rounded-lg p-4 transition-all"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-800 hover:border-indigo-400' 
              : 'border-gray-200 bg-gray-50 hover:border-indigo-500'"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ role.name }}
              </h3>
              <button
                @click="loadUsersForRole(role.id)"
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Users
              </button>
            </div>
            <div v-if="roleUsers[role.id] && roleUsers[role.id].length > 0" class="space-y-2">
              <div
                v-for="userId in roleUsers[role.id]"
                :key="userId"
                class="flex items-center justify-between p-2 rounded"
                :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
              >
                <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  {{ userId }}
                </span>
                <button
                  @click="removeRoleFromUser(userId, role.id)"
                  class="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove Role"
                >
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
              No users assigned
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div
      v-if="showEditModal && editingRole"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showEditModal = false"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="sticky top-0 p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-white'"
        >
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Edit Role: {{ editingRole.name }}
          </h2>
          <button
            @click="showEditModal = false"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="category in permissionCategories"
              :key="category.name"
              class="border rounded-lg p-4"
              :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-gray-50'"
            >
              <h3 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ category.name }}
              </h3>
              <div class="space-y-2">
                <label
                  v-for="permission in category.permissions"
                  :key="permission.value"
                  class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-opacity-50"
                  :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'"
                >
                  <input
                    type="checkbox"
                    :value="permission.value"
                    :checked="selectedPermissions.includes(permission.value)"
                    @change="togglePermission(permission.value)"
                    class="rounded"
                    :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ permission.label }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t"
            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
          >
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Cancel
            </button>
            <button
              @click="saveRolePermissions"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Role Modal -->
    <div
      v-if="showAssignModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showAssignModal = false"
    >
      <div
        class="w-full max-w-2xl rounded-lg shadow-xl"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <h2 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Assign Role to User
          </h2>
          <button
            @click="showAssignModal = false"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="assignRole" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              User ID
            </label>
            <input
              v-model="assignForm.userId"
              type="text"
              required
              placeholder="user@example.com or user-id"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Role
            </label>
            <select
              v-model="assignForm.roleId"
              required
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="">Select a role</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showAssignModal = false"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
            >
              Assign Role
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let darkModeObserver = null;
let darkModeInterval = null;

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const roles = ref([]);
const loading = ref(false);
const showEditModal = ref(false);
const showAssignModal = ref(false);
const editingRole = ref(null);
const selectedPermissions = ref([]);
const roleUsers = ref({});
const assignForm = ref({
  userId: '',
  roleId: '',
});

const allPermissions = ref([]);

const permissionCategories = computed(() => {
  const categories = {};
  allPermissions.value.forEach(perm => {
    if (!categories[perm.category]) {
      categories[perm.category] = {
        name: perm.category,
        permissions: [],
      };
    }
    categories[perm.category].permissions.push(perm);
  });
  return Object.values(categories);
});

const loadRoles = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/rbac/roles`);
    roles.value = response.data;
  } catch (error) {
    console.error('Failed to load roles:', error);
    alert('Failed to load roles. Please try again.');
  } finally {
    loading.value = false;
  }
};

const loadPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/rbac/permissions`);
    allPermissions.value = response.data;
  } catch (error) {
    console.error('Failed to load permissions:', error);
  }
};

const getPermissionsByCategory = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  const categories = {};
  permissions.forEach(perm => {
    const permInfo = allPermissions.value.find(p => p.value === perm);
    if (permInfo) {
      if (!categories[permInfo.category]) {
        categories[permInfo.category] = {
          name: permInfo.category,
          permissions: [],
        };
      }
      categories[permInfo.category].permissions.push(perm);
    }
  });
  return Object.values(categories);
};

const getPermissionLabel = (permission) => {
  if (!permission) return '';
  const permInfo = allPermissions.value.find(p => p.value === permission);
  return permInfo ? permInfo.label : permission;
};

const editRole = (role) => {
  editingRole.value = role;
  selectedPermissions.value = role.permissions ? [...role.permissions] : [];
  showEditModal.value = true;
};

const togglePermission = (permission) => {
  const index = selectedPermissions.value.indexOf(permission);
  if (index > -1) {
    selectedPermissions.value.splice(index, 1);
  } else {
    selectedPermissions.value.push(permission);
  }
};

const saveRolePermissions = async () => {
  if (!editingRole.value) return;

  try {
    await axios.put(
      `${API_BASE_URL}/api/v1/rbac/roles/${editingRole.value.id}`,
      { permissions: selectedPermissions.value }
    );
    
    await loadRoles();
    showEditModal.value = false;
    alert('Role permissions updated successfully!');
  } catch (error) {
    console.error('Failed to update role:', error);
    alert('Failed to update role permissions. Please try again.');
  }
};

const loadUsersForRole = async (roleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/rbac/roles/${roleId}/users`);
    roleUsers.value[roleId] = response.data;
  } catch (error) {
    console.error('Failed to load users for role:', error);
    roleUsers.value[roleId] = [];
  }
};

const assignRole = async () => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/v1/rbac/users/${assignForm.value.userId}/roles`,
      { roleId: assignForm.value.roleId }
    );
    
    await loadUsersForRole(assignForm.value.roleId);
    showAssignModal.value = false;
    assignForm.value = { userId: '', roleId: '' };
    alert('Role assigned successfully!');
  } catch (error) {
    console.error('Failed to assign role:', error);
    alert('Failed to assign role. Please try again.');
  }
};

const removeRoleFromUser = async (userId, roleId) => {
  if (!confirm(`Remove ${roleId} role from ${userId}?`)) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/v1/rbac/users/${userId}/roles/${roleId}`);
    await loadUsersForRole(roleId);
    alert('Role removed successfully!');
  } catch (error) {
    console.error('Failed to remove role:', error);
    alert('Failed to remove role. Please try again.');
  }
};

onMounted(() => {
  loadRoles();
  loadPermissions();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

