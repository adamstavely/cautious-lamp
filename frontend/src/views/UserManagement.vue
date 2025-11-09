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
                  User Management
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Manage users and their workspace memberships. Assign users to teams and control access.
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

        <!-- Users Table -->
        <div class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div v-if="loading" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Loading users...
            </div>
            
            <div v-else-if="users.length === 0" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No users found.
            </div>

            <table v-else class="w-full">
              <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Workspaces</th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <tr
                  v-for="user in users"
                  :key="user.userId"
                  class="hover:bg-opacity-50 transition-colors"
                  :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                        <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">person</span>
                      </div>
                      <div>
                        <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ user.email }}</div>
                        <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">ID: {{ user.userId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="user.workspaces.length === 0" class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      No workspaces
                    </div>
                    <div v-else class="flex flex-wrap gap-2">
                      <span
                        v-for="ws in user.workspaces"
                        :key="ws.workspaceId"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        :class="ws.role === 'owner'
                          ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')
                          : ws.role === 'admin'
                          ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                          : ws.role === 'editor'
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')"
                      >
                        {{ ws.workspaceName }}
                        <span class="ml-1 text-xs opacity-75">({{ ws.role }})</span>
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="manageUserWorkspaces(user)"
                      class="text-indigo-600 hover:text-indigo-700 transition-colors"
                      :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                      title="Manage Workspaces"
                    >
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Manage User Workspaces Modal -->
    <div
      v-if="selectedUser"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="selectedUser = null"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-indigo-600 text-3xl">person</span>
            <div>
              <h3 class="text-2xl font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedUser.email }}
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Manage workspace memberships
              </p>
            </div>
          </div>
          <button
            @click="selectedUser = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Current Workspaces -->
        <div class="mb-6">
          <h4 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Current Workspaces</h4>
          <div v-if="selectedUser.workspaces.length === 0" class="text-sm py-4 text-center rounded-lg border" :class="isDarkMode ? 'text-gray-500 border-gray-700' : 'text-gray-500 border-gray-200'">
            User is not a member of any workspace
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="ws in selectedUser.workspaces"
              :key="ws.workspaceId"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-indigo-600">folder</span>
                <div>
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ ws.workspaceName }}</div>
                  <div class="text-xs flex items-center gap-2 mt-1">
                    <span 
                      class="px-2 py-0.5 rounded capitalize"
                      :class="ws.role === 'owner'
                        ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')
                        : ws.role === 'admin'
                        ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                        : ws.role === 'editor'
                        ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ ws.role }}
                    </span>
                  </div>
                </div>
              </div>
              <button
                v-if="ws.role !== 'owner'"
                @click="removeUserFromWorkspace(ws.workspaceId)"
                class="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                title="Remove from workspace"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Add to Workspace -->
        <div class="pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h4 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Add to Workspace</h4>
          <div class="flex items-center gap-3">
            <Dropdown
              v-model="selectedWorkspaceForAdd"
              :options="availableWorkspaces"
              :is-dark-mode="isDarkMode"
              placeholder="Select workspace"
              class="flex-1"
            />
            <Dropdown
              v-model="selectedRole"
              :options="[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' }
              ]"
              :is-dark-mode="isDarkMode"
              placeholder="Role"
            />
            <button
              @click="addUserToWorkspace"
              :disabled="!selectedWorkspaceForAdd || !selectedRole || adding"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="selectedWorkspaceForAdd && selectedRole && !adding
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ adding ? 'Adding...' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const loading = ref(false);
const users = ref([]);
const workspaces = ref([]);
const selectedUser = ref(null);
const selectedWorkspaceForAdd = ref('');
const selectedRole = ref('');
const adding = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';
const CURRENT_USER_ID = 'user-123'; // In production, get from auth context

const availableWorkspaces = ref([]);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    users.value = response.data || [];
  } catch (error) {
    console.error('Failed to load users:', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const loadWorkspaces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaces.value = response.data || [];
    updateAvailableWorkspaces();
  } catch (error) {
    console.error('Failed to load workspaces:', error);
    workspaces.value = [];
  }
};

const updateAvailableWorkspaces = () => {
  if (!selectedUser.value) {
    availableWorkspaces.value = workspaces.value.map(ws => ({ value: ws.id, label: ws.name }));
    return;
  }

  // Filter out workspaces the user is already a member of
  const userWorkspaceIds = selectedUser.value.workspaces.map(ws => ws.workspaceId);
  availableWorkspaces.value = workspaces.value
    .filter(ws => !userWorkspaceIds.includes(ws.id))
    .map(ws => ({ value: ws.id, label: ws.name }));
};

const manageUserWorkspaces = (user) => {
  selectedUser.value = { ...user };
  selectedWorkspaceForAdd.value = '';
  selectedRole.value = '';
  updateAvailableWorkspaces();
};

const addUserToWorkspace = async () => {
  if (!selectedUser.value || !selectedWorkspaceForAdd.value || !selectedRole.value) return;

  try {
    adding.value = true;
    await axios.post(`${API_BASE_URL}/users/${selectedUser.value.userId}/workspaces`, {
      workspaceId: selectedWorkspaceForAdd.value,
      email: selectedUser.value.email,
      role: selectedRole.value,
      addedBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    // Reload users to get updated workspace list
    await loadUsers();
    
    // Update selected user
    const updatedUser = users.value.find(u => u.userId === selectedUser.value.userId);
    if (updatedUser) {
      selectedUser.value = updatedUser;
      updateAvailableWorkspaces();
    }

    selectedWorkspaceForAdd.value = '';
    selectedRole.value = '';
  } catch (error) {
    console.error('Failed to add user to workspace:', error);
    alert('Failed to add user to workspace. Please try again.');
  } finally {
    adding.value = false;
  }
};

const removeUserFromWorkspace = async (workspaceId) => {
  if (!selectedUser.value || !confirm('Remove user from this workspace?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/users/${selectedUser.value.userId}/workspaces/${workspaceId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    // Reload users to get updated workspace list
    await loadUsers();
    
    // Update selected user
    const updatedUser = users.value.find(u => u.userId === selectedUser.value.userId);
    if (updatedUser) {
      selectedUser.value = updatedUser;
      updateAvailableWorkspaces();
    }
  } catch (error) {
    console.error('Failed to remove user from workspace:', error);
    alert('Failed to remove user from workspace. Please try again.');
  }
};

let darkModeObserver = null;

onMounted(() => {
  loadUsers();
  loadWorkspaces();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

