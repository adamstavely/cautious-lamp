<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
        <div class="flex items-center gap-3">
          <svg class="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h2>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage review links, teams, and batch operations</p>
      </div>
      
      <!-- Tabs -->
      <v-tabs v-model="activeTab" bg-color="transparent" class="px-8">
        <v-tab value="links">
          <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Review Links
        </v-tab>
        <v-tab value="teams">
          <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Teams
        </v-tab>
      </v-tabs>
      
      <v-divider />
      
      <!-- Tab Content -->
      <v-window v-model="activeTab">
        <!-- Design Links Tab -->
        <v-window-item value="links">
          <div class="p-8">
        <v-data-table
          :items="filteredLinks"
          :headers="headers"
          item-value="id"
          show-select
          v-model="selectedIds"
          color="indigo"
        >
          <template #item.expiresAt="{ item }">
            {{ formatDate(item.expiresAt) }}
          </template>
          <template #item.hasPassword="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="item.hasPassword"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Protected
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Public
              </span>
            </div>
          </template>
          <template #item.extended="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="item.extended"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
              >
                Yes
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600"
              >
                No
              </span>
            </div>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-tooltip text="Copy review URL">
                <template #activator="{ props }">
                  <button
                    @click="copyReviewUrl(item)"
                    class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip v-if="isExpired(item)" text="Reactivate expired link">
                <template #activator="{ props }">
                  <button
                    @click="reactivate(item.id)"
                    class="p-2 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip v-if="!isExpired(item)" text="Extend expiration by 7 days">
                <template #activator="{ props }">
                  <button
                    @click="extend(item.id)"
                    class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Override expiration date">
                <template #activator="{ props }">
                  <button
                    @click="openOverrideDialog(item.id)"
                    class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Reset password">
                <template #activator="{ props }">
                  <button
                    @click="openPasswordDialog(item.id)"
                    class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete this link">
                <template #activator="{ props }">
                  <button
                    @click="openDeleteConfirm(item.id)"
                    class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <div class="mt-6">
          <v-tooltip text="Delete all selected links">
            <template #activator="{ props }">
              <button
                class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                :disabled="!selectedIds.length"
                @click="openBatchDeleteConfirm"
                v-bind="props"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </template>
          </v-tooltip>
        </div>
      </div>
        </v-window-item>
        
        <!-- Teams Tab -->
        <v-window-item value="teams">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Teams</h3>
              <button
                @click="showCreateTeamModal = true"
                class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Team
              </button>
            </div>
            
            <div v-if="teams.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-500 dark:text-gray-400 mb-2">No teams yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">Create your first team to start collaborating</p>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="team in teams"
                :key="team.id"
                class="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ team.name }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ team.description || 'No description' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="editTeam(team)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Edit Team"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteTeam(team)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete Team"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="flex flex-col flex-1 space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-300">Members</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ team.members.length }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-300">Reviews</span>
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ team.reviews?.length || 0 }}</span>
                  </div>
                  
                  <!-- Team Members Preview -->
                  <div class="mt-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-300">Members:</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="member in team.members.slice(0, 5)"
                        :key="member.email"
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                        :class="member.role === 'Art Director' 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                          : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'"
                      >
                        {{ member.name || member.email }}
                        <span class="text-xs opacity-75">({{ member.role || 'Designer' }})</span>
                      </span>
                      <span
                        v-if="team.members.length > 5"
                        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                      >
                        +{{ team.members.length - 5 }} more
                      </span>
                    </div>
                  </div>
                  
                  <button
                    @click="manageTeamMembers(team)"
                    class="w-full mt-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors shadow-sm"
                  >
                    Manage Members
                  </button>
                </div>
              </div>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- Modals -->
    <DatePickerModal
      v-model="showOverrideDialog"
      title="Override Expiration Date"
      label="Select new expiration date"
      :min-date="minDate"
      required
      @submit="handleOverrideSubmit"
    />

    <PromptModal
      v-model="showPasswordDialog"
      title="Reset Password"
      label="Enter new password (leave empty to remove password)"
      placeholder="Enter password"
      type="password"
      :required="false"
      @submit="handlePasswordSubmit"
      @cancel="pendingPasswordId = null"
    />

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Delete Link"
      message="Are you sure you want to delete this link?"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteConfirm"
    />

    <ConfirmModal
      v-model="showBatchDeleteConfirm"
      title="Delete Selected Links"
      message="Are you sure you want to delete all selected links?"
      confirm-text="Delete All"
      confirm-color="red"
      @confirm="handleBatchDeleteConfirm"
    />

    <AlertModal
      v-model="showAlert"
      :title="alertTitle"
      :message="alertMessage"
      :type="alertType"
    />

    <!-- Teams Modals -->
    <PromptModal
      v-model="showCreateTeamModal"
      title="Create New Team"
      label="Team Name"
      placeholder="Enter team name"
      type="text"
      :required="true"
      @submit="handleCreateTeam"
      @cancel="newTeamName = ''"
    />

    <TeamEditModal
      v-model="showEditTeamModal"
      :team="editingTeam"
      @team-updated="handleTeamUpdated"
    />

    <TeamMembersModal
      v-model="showMembersModal"
      :team="selectedTeam"
      @members-updated="handleMembersUpdated"
    />

    <ConfirmModal
      v-model="showDeleteTeamConfirm"
      title="Delete Team"
      :message="`Are you sure you want to delete '${deletingTeam?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteTeam"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { mockAPI, isMockMode, mockReviews, getCurrentUser, getFilteredReviews } from '../mockData.js';
import PromptModal from '../components/review-ui/PromptModal.vue';
import ConfirmModal from '../components/review-ui/ConfirmModal.vue';
import AlertModal from '../components/review-ui/AlertModal.vue';
import DatePickerModal from '../components/review-ui/DatePickerModal.vue';
import TeamEditModal from '../components/review-ui/TeamEditModal.vue';
import TeamMembersModal from '../components/review-ui/TeamMembersModal.vue';

const links = ref([]);
const selectedIds = ref([]);
const teams = ref([]);
const activeTab = ref('links');

// Teams modal states
const showCreateTeamModal = ref(false);
const showEditTeamModal = ref(false);
const showMembersModal = ref(false);
const showDeleteTeamConfirm = ref(false);
const editingTeam = ref(null);
const selectedTeam = ref(null);
const deletingTeam = ref(null);
const newTeamName = ref('');

// Get current user context
const currentUser = computed(() => getCurrentUser());
const currentUserRole = computed(() => currentUser.value.role);
const currentUserEmail = computed(() => currentUser.value.email);
const currentUserTeamId = computed(() => currentUser.value.teamId);

// Filter links based on user role
const filteredLinks = computed(() => {
  if (currentUserRole.value === 'creative_director') {
    // Creative Director sees all links across all teams
    return links.value;
  } else if (currentUserRole.value === 'art_director') {
    // Art Director sees all links in their team
    return links.value.filter(link => {
      const review = mockReviews.find(r => r.filename === link.filename);
      return review && review.teamId === currentUserTeamId.value;
    });
  } else if (currentUserRole.value === 'designer') {
    // Designer sees only their own links
    return links.value.filter(link => {
      return link.designer === currentUser.value.name || 
             mockReviews.find(r => r.filename === link.filename)?.designerEmail === currentUserEmail.value;
    });
  }
  // Default: return all (for admins)
  return links.value;
});

// Modal states
const showOverrideDialog = ref(false);
const showPasswordDialog = ref(false);
const showDeleteConfirm = ref(false);
const showBatchDeleteConfirm = ref(false);
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('info');

// Pending actions
const pendingOverrideId = ref(null);
const pendingPasswordId = ref(null);
const pendingDeleteId = ref(null);

const headers = [
  { title: 'Filename', key: 'filename' },
  { title: 'Designer', key: 'designer' },
  { title: 'Password', key: 'hasPassword', sortable: false, align: 'center' },
  { title: 'Expires', key: 'expiresAt' },
  { title: 'Extended', key: 'extended', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const loadLinks = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getAdminLinks(true); // Always load all links
      links.value = res;
    } else {
      const res = await axios.get('/admin', {
        params: { expired: true }, // Always load all links
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
      links.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load links:', error);
  }
};

const isExpired = (item) => {
  if (!item.expiresAt) return false;
  const expirationDate = new Date(item.expiresAt);
  return expirationDate < new Date();
};

const reactivate = async (id) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Reactivate by extending 30 days from now
      await mockAPI.overrideLink(id, 30);
    } else {
      // For real API, set expiration to 30 days from now
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      await axios.post(`/admin/${id}/override`, { 
        expirationDate: newExpirationDate.toISOString().split('T')[0] 
      }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    showAlertMessage('Success', 'Link reactivated successfully! Expiration set to 30 days from now.', 'success');
    loadLinks();
  } catch (error) {
    console.error('Failed to reactivate link:', error);
    showAlertMessage('Error', 'Failed to reactivate link', 'error');
  }
};

const extend = async (id) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.extendLink(id);
    } else {
      await axios.post(`/admin/${id}/extend`, {}, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    loadLinks();
  } catch (error) {
    console.error('Failed to extend link:', error);
    showAlertMessage('Error', 'Failed to extend link expiration', 'error');
  }
};

const openOverrideDialog = (id) => {
  pendingOverrideId.value = id;
  showOverrideDialog.value = true;
};

const handleOverrideSubmit = async (date) => {
  if (!date || !pendingOverrideId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Calculate days from today to selected date
      const today = new Date();
      const selectedDate = new Date(date);
      const diffTime = selectedDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      await mockAPI.overrideLink(pendingOverrideId.value, diffDays);
    } else {
      await axios.post(`/admin/${pendingOverrideId.value}/override`, { expirationDate: date }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    pendingOverrideId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to override link:', error);
    showAlertMessage('Error', 'Failed to override expiration date', 'error');
  }
};

const openPasswordDialog = (id) => {
  pendingPasswordId.value = id;
  showPasswordDialog.value = true;
};

const handlePasswordSubmit = async (newPassword) => {
  if (!pendingPasswordId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.resetPassword(pendingPasswordId.value, newPassword || '');
    } else {
      await axios.post(`/admin/${pendingPasswordId.value}/reset-password`, { password: newPassword || null }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    showAlertMessage('Success', 'Password updated successfully!', 'success');
    pendingPasswordId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to reset password:', error);
    showAlertMessage('Error', 'Failed to update password. Please try again.', 'error');
  }
};

const openDeleteConfirm = (id) => {
  pendingDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (!pendingDeleteId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.deleteLink(pendingDeleteId.value);
    } else {
      await axios.delete(`/admin/${pendingDeleteId.value}`, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    pendingDeleteId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to delete link:', error);
    showAlertMessage('Error', 'Failed to delete link', 'error');
  }
};

const openBatchDeleteConfirm = () => {
  if (!selectedIds.value.length) return;
  showBatchDeleteConfirm.value = true;
};

const handleBatchDeleteConfirm = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.batchDelete(selectedIds.value);
    } else {
      await axios.post('/admin/batch-delete', { ids: selectedIds.value }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    selectedIds.value = [];
    loadLinks();
  } catch (error) {
    console.error('Failed to batch delete:', error);
    showAlertMessage('Error', 'Failed to delete selected links', 'error');
  }
};

const copyReviewUrl = async (item) => {
  try {
    // Extract review ID from admin link ID
    // Admin links have IDs like "admin-1" or "admin-review-123"
    // Reviews have IDs like "review-1" or "review-123"
    let reviewId;
    
    if (item.id.includes('review-')) {
      // Extract review ID: admin-review-123 -> review-123
      const match = item.id.match(/review-[^/]+/);
      reviewId = match ? match[0] : item.id.replace('admin-', 'review-');
    } else if (item.id.startsWith('admin-')) {
      // Legacy format: admin-1 -> review-1
      const num = item.id.replace('admin-', '');
      reviewId = `review-${num}`;
    } else if (item.reviewId) {
      // Use reviewId field if available (from real API)
      reviewId = item.reviewId;
    } else {
      // Fallback: assume it's already a review ID
      reviewId = item.id;
    }
    
    // Generate the full URL
    const reviewUrl = `${window.location.origin}/review/${reviewId}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(reviewUrl);
    
    showAlertMessage('Success', 'Review URL copied to clipboard!', 'success');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    showAlertMessage('Error', 'Failed to copy URL to clipboard', 'error');
  }
};

const showAlertMessage = (title, message, type = 'info') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date, return as-is
    
    // Extract date components using UTC to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    // If it's already a formatted string, try to parse it differently
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      const [y, m, d] = dateOnly.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    }
    return dateString;
  }
};

// Teams functions
const loadTeams = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      teams.value = await mockAPI.getTeams();
    } else {
      const res = await axios.get('/teams');
      teams.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load teams:', error);
    showAlertMessage('Error', 'Failed to load teams', 'error');
  }
};

const handleCreateTeam = async (teamName) => {
  if (!teamName.trim()) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.createTeam(teamName.trim());
    } else {
      await axios.post('/teams', { name: teamName.trim() });
    }
    showCreateTeamModal.value = false;
    newTeamName.value = '';
    showAlertMessage('Success', 'Team created successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to create team:', error);
    showAlertMessage('Error', 'Failed to create team. Please try again.', 'error');
  }
};

const editTeam = (team) => {
  editingTeam.value = team;
  showEditTeamModal.value = true;
};

const handleTeamUpdated = () => {
  showEditTeamModal.value = false;
  editingTeam.value = null;
  loadTeams();
  showAlertMessage('Success', 'Team updated successfully!', 'success');
};

const manageTeamMembers = (team) => {
  selectedTeam.value = team;
  showMembersModal.value = true;
};

const handleMembersUpdated = () => {
  showMembersModal.value = false;
  selectedTeam.value = null;
  loadTeams();
  showAlertMessage('Success', 'Team members updated successfully!', 'success');
};

const confirmDeleteTeam = (team) => {
  deletingTeam.value = team;
  showDeleteTeamConfirm.value = true;
};

const handleDeleteTeam = async () => {
  if (!deletingTeam.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.deleteTeam(deletingTeam.value.id);
    } else {
      await axios.delete(`/teams/${deletingTeam.value.id}`);
    }
    showDeleteTeamConfirm.value = false;
    deletingTeam.value = null;
    showAlertMessage('Success', 'Team deleted successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to delete team:', error);
    showAlertMessage('Error', 'Failed to delete team. Please try again.', 'error');
  }
};

onMounted(() => {
  loadLinks();
  loadTeams();
});
</script>
