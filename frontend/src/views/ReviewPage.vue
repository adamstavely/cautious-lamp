<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50" :class="isDarkMode ? 'dark:bg-slate-900' : ''">
    <div class="flex gap-4" style="min-height: calc(100vh - 200px);">
      <!-- Main Content Area -->
      <div class="flex-1 overflow-y-auto space-y-4">
      <!-- Completed Review Message -->
      <div v-if="reviewCompleted" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div class="p-8 text-center">
          <div class="flex justify-center mb-4">
            <div :class="isDarkMode ? 'bg-green-900/20' : 'bg-green-100'" class="w-16 h-16 rounded-full flex items-center justify-center">
              <svg :class="isDarkMode ? 'text-green-400' : 'text-green-600'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-2xl font-bold mb-2">Review Complete</h2>
          <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="mb-4">This review has been marked as complete by the designer.</p>
          <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">Comments and review information are preserved, but the review link is no longer active.</p>
        </div>
      </div>

      <!-- File Preview Section -->
      <div v-if="!reviewCompleted && (!passwordRequired || passwordValidated)" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'" class="border-b px-6 py-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex-1">
              <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-xl font-bold mb-2">{{ metadata.filename }}</h2>
              <p v-if="metadata.designer" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'" class="text-sm">Designer: {{ metadata.designer }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="metadata.versions.length > 1"
                @click="toggleComparisonMode"
                class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm compare-versions-btn"
                :class="isDarkMode 
                  ? 'bg-indigo-500 hover:bg-indigo-400' 
                  : 'bg-indigo-600 hover:bg-indigo-700'"
              >
                <span class="material-symbols-outlined text-base">compare</span>
                {{ comparisonMode ? 'Single View' : 'Compare Versions' }}
              </button>
              <button
                v-if="previewUrl && !comparisonMode"
                @click="openInNewTab"
                class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm open-new-tab-btn"
                :class="isDarkMode 
                  ? 'bg-indigo-500 hover:bg-indigo-400' 
                  : 'bg-indigo-600 hover:bg-indigo-700'"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <!-- Single View Mode -->
          <div v-if="!comparisonMode">
        <VersionSelector
          v-model="selectedVersion"
          :versions="metadata.versions"
          @update:modelValue="loadVersion"
        />
        <PreviewFrame 
          ref="previewFrameRef"
          :url="previewUrl" 
          :review-id="reviewId"
          :read-only="reviewCompleted"
          @annotation-added="handleAnnotationAdded"
          @annotation-updated="handleAnnotationUpdated"
          @annotation-deleted="handleAnnotationDeleted"
        />
          </div>
          
          <!-- Comparison Mode -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-6">
              <!-- Left Version -->
              <div>
                <div class="mb-3">
                  <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'" class="block text-sm font-medium mb-2">Version 1</label>
                  <VersionSelector
                    v-model="leftVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadLeftVersion"
                  />
                </div>
                <div :class="isDarkMode ? 'border-indigo-800' : 'border-indigo-200'" class="border-2 rounded-lg overflow-hidden">
                  <PreviewFrame 
                    :url="leftPreviewUrl" 
                    :review-id="reviewId"
                    :read-only="reviewCompleted"
                  />
                </div>
              </div>
              
              <!-- Right Version -->
              <div>
                <div class="mb-3">
                  <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'" class="block text-sm font-medium mb-2">Version 2</label>
                  <VersionSelector
                    v-model="rightVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadRightVersion"
                  />
                </div>
                <div :class="isDarkMode ? 'border-indigo-800' : 'border-indigo-200'" class="border-2 rounded-lg overflow-hidden">
                  <PreviewFrame 
                    :url="rightPreviewUrl" 
                    :review-id="reviewId"
                    :read-only="reviewCompleted"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <PasswordPrompt
      v-model="passwordRequired"
      @submit="submitPassword"
    />
    </div>

    <!-- Right Sidebar -->
    <div v-if="passwordValidated || reviewCompleted" class="w-72 flex-shrink-0">
      <div class="space-y-4">
        <!-- Designer Tools Card -->
        <div v-if="isDesigner && !reviewCompleted" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
          <div class="p-4">
            <div class="flex items-center gap-2 mb-3">
              <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm font-bold uppercase tracking-wider">DESIGNER TOOLS</h3>
            </div>
            <div class="grid gap-2" :class="metadata.password ? 'grid-cols-4' : 'grid-cols-3'">
              <!-- Change Password -->
              <v-tooltip v-if="metadata.password" text="Change Password">
                <template #activator="{ props }">
                  <button
                    @click="handleChangePassword"
                    class="flex items-center justify-center p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'hover:bg-slate-600 bg-slate-800' 
                      : 'hover:bg-white bg-white'"
                    v-bind="props"
                  >
                    <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Extend Expiration -->
              <v-tooltip text="Extend Expiration">
                <template #activator="{ props }">
                  <button
                    @click="handleExtendExpiration"
                    class="flex items-center justify-center p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'hover:bg-slate-600 bg-slate-800' 
                      : 'hover:bg-white bg-white'"
                    v-bind="props"
                  >
                    <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Upload New Version -->
              <v-tooltip text="Upload New Version">
                <template #activator="{ props }">
                  <button
                    @click="handleUploadNewVersion"
                    class="flex items-center justify-center p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'hover:bg-slate-600 bg-slate-800' 
                      : 'hover:bg-white bg-white'"
                    v-bind="props"
                  >
                    <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Sharing Settings -->
              <v-tooltip text="Sharing Settings">
                <template #activator="{ props }">
                  <button
                    @click="handleSharingSettings"
                    class="flex items-center justify-center p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'hover:bg-slate-600 bg-slate-800' 
                      : 'hover:bg-white bg-white'"
                    v-bind="props"
                  >
                    <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </div>
        </div>
        
        <WorkflowCard
          :workflow-state="metadata.workflowState"
          :current-user-role="currentUserRole"
          :designer="metadata.designer"
          :workflow-history="metadata.workflowHistory || []"
          :review-completed="reviewCompleted"
          @workflow-approve="handleApprove"
          @workflow-reject="handleReject"
          @workflow-move-to-client-review="handleMoveToClientReview"
          @workflow-move-to-art-director-review="handleMoveToArtDirectorReview"
          @workflow-resubmit="handleResubmitForReview"
          @workflow-completed="handleMarkCompleted"
        />
        
        <CommentsSidebar
          :comments="comments"
          :version-id="selectedVersion"
          :read-only="reviewCompleted"
          :current-user-role="currentUserRole"
          @comment-added="handleCommentAdded"
          @comment-updated="handleCommentUpdated"
          @reply-added="handleReplyAdded"
          @emoji-reaction-toggled="handleEmojiReactionToggled"
          @emoji-reaction-toggled-reply="handleEmojiReactionToggledReply"
        />
      </div>
    </div>

    <!-- Version Upload Modal -->
    <VersionUploadModal
      v-model="showUploadModal"
      :review-id="reviewId"
      @version-uploaded="handleVersionUploaded"
    />

    <!-- Change Password Modal -->
    <PromptModal
      v-model="showPasswordModal"
      title="Change Password"
      label="Enter new password (leave empty to remove password)"
      placeholder="Enter new password or leave empty"
      type="password"
      :required="false"
      @submit="handlePasswordChanged"
    />

    <!-- Sharing Settings Modal -->
    <v-dialog :model-value="showSharingModal" @update:model-value="showSharingModal = $event" max-width="600">
      <v-card :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" style="background-color: var(--v-theme-surface) !important;">
        <v-card-title :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="d-flex align-center justify-space-between px-6 pt-6 pb-4" style="background-color: var(--v-theme-surface) !important;">
          <div class="d-flex align-center">
            <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-lg font-bold">Sharing Settings</span>
          </div>
          <button @click.stop="showSharingModal = false" 
            :class="isDarkMode 
              ? 'text-gray-500 hover:text-gray-400' 
              : 'text-gray-400 hover:text-gray-600'" 
            class="transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </v-card-title>
        <v-divider />
        <v-card-text :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="px-6 py-4" style="background-color: var(--v-theme-surface) !important;">
          <div class="space-y-4">
            <!-- Sharing Type Selection -->
            <div>
              <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'" class="block text-sm font-medium mb-2">Who can access this review?</label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    v-model="sharingType"
                    value="anyone"
                    :class="isDarkMode 
                      ? 'text-indigo-400 focus:ring-indigo-400' 
                      : 'text-indigo-600 focus:ring-indigo-500'"
                    class="w-4 h-4"
                  />
                  <span :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm">Anyone with the link</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    v-model="sharingType"
                    value="restricted"
                    :class="isDarkMode 
                      ? 'text-indigo-400 focus:ring-indigo-400' 
                      : 'text-indigo-600 focus:ring-indigo-500'"
                    class="w-4 h-4"
                  />
                  <span :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm">Only people I list</span>
                </label>
              </div>
            </div>

            <!-- Approved People List -->
            <div v-if="sharingType === 'restricted'">
              <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'" class="block text-sm font-medium mb-2">Approved People</label>
              <div class="space-y-2">
                <div v-for="(person, index) in approvedPeople" :key="index" class="flex items-center gap-2">
                  <input
                    type="email"
                    v-model="approvedPeople[index]"
                    placeholder="email@example.com"
                    class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-sm"
                    :class="isDarkMode 
                      ? 'border-slate-600 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-700 text-gray-100 placeholder-gray-400' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500'"
                  />
                  <button
                    type="button"
                    @click="removeApprovedPerson(index)"
                    :class="isDarkMode 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-700'"
                    class="transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addApprovedPerson"
                  :class="isDarkMode 
                    ? 'text-indigo-400 hover:text-indigo-300' 
                    : 'text-indigo-600 hover:text-indigo-700'"
                  class="text-sm font-medium transition-colors"
                >
                  + Add Person
                </button>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="px-6 py-4" style="background-color: var(--v-theme-surface) !important;">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showSharingModal = false"
            :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleSharingChanged"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Completion Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="Mark as Complete"
      confirm-color="primary"
      @confirm="confirmMarkCompleted"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-model="showAlert"
      :title="alertTitle"
      :message="alertMessage"
      :type="alertType"
    />
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import VersionSelector from '../components/review-ui/VersionSelector.vue';
import PreviewFrame from '../components/review-ui/PreviewFrame.vue';
import CommentsSidebar from '../components/review-ui/CommentsSidebar.vue';
import WorkflowCard from '../components/review-ui/WorkflowCard.vue';
import VersionUploadModal from '../components/review-ui/VersionUploadModal.vue';
import PromptModal from '../components/review-ui/PromptModal.vue';
import PasswordPrompt from '../components/review-ui/PasswordPrompt.vue';
import AlertModal from '../components/review-ui/AlertModal.vue';
import ConfirmModal from '../components/review-ui/ConfirmModal.vue';
import { mockAPI, isMockMode, mockReviews } from '../mockData.js';
import { reviewAPI, workflowAPI, commentAPI, versionAPI, passwordAPI } from '../services/api.js';

const route = useRoute();
const reviewId = route.params.id;

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

const previewFrameRef = ref(null);

const metadata = ref({ filename: '', versions: [], workflowState: 'draft', workflowHistory: [] });
const selectedVersion = ref('');
const previewUrl = ref('');
const password = ref('');
const passwordRequired = ref(false);
const passwordValidated = ref(false);
const comments = ref([]);
const reviewCompleted = ref(false);
const currentUser = ref('Current User'); // In real app, this would come from auth
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer'); // 'designer', 'client', 'art_director', 'creative_director'

// Comparison mode state
const comparisonMode = ref(false);
const leftVersion = ref('');
const rightVersion = ref('');
const leftPreviewUrl = ref('');
const rightPreviewUrl = ref('');

// Alert modal state
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('error');

// Designer tools modals state
const showUploadModal = ref(false);
const showPasswordModal = ref(false);
const showSharingModal = ref(false);
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const sharingType = ref('anyone'); // 'anyone' or 'restricted'
const approvedPeople = ref(['']);

const loadVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, selectedVersion.value);
      previewUrl.value = res.url;
      await loadComments();
    } else {
      const url = await reviewAPI.getVersion(reviewId, selectedVersion.value);
      previewUrl.value = url;
      await loadComments();
    }
  } catch (error) {
    console.error('Failed to load version:', error);
  }
};

const loadLeftVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, leftVersion.value);
      leftPreviewUrl.value = res.url;
    } else {
      const url = await reviewAPI.getVersion(reviewId, leftVersion.value);
      leftPreviewUrl.value = url;
    }
  } catch (error) {
    console.error('Failed to load left version:', error);
  }
};

const loadRightVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, rightVersion.value);
      rightPreviewUrl.value = res.url;
    } else {
      const url = await reviewAPI.getVersion(reviewId, rightVersion.value);
      rightPreviewUrl.value = url;
    }
  } catch (error) {
    console.error('Failed to load right version:', error);
  }
};

const toggleComparisonMode = () => {
  comparisonMode.value = !comparisonMode.value;
  
  if (comparisonMode.value && metadata.value.versions.length >= 2) {
    // Initialize comparison with first two versions
    leftVersion.value = metadata.value.versions[0].id;
    rightVersion.value = metadata.value.versions.length > 1 ? metadata.value.versions[1].id : metadata.value.versions[0].id;
    loadLeftVersion();
    loadRightVersion();
  }
};

const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank');
  }
};


const submitPassword = async (input) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId, input);
      metadata.value = res;
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    } else {
      const res = await reviewAPI.getReview(reviewId, input);
      metadata.value = res;
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    }
  } catch {
    showAlertMessage('Error', 'Invalid password', 'error');
  }
};

const showAlertMessage = (title, message, type = 'error') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

// Comment handling functions
const handleCommentAdded = async (comment) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.addComment(reviewId, comment);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await commentAPI.addComment(reviewId, comment.text, comment.version, comment.type, comment.resolved);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};

const handleCommentUpdated = async (commentId, updates) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.updateComment(reviewId, commentId, updates);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await commentAPI.updateComment(reviewId, commentId, updates);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to update comment:', error);
  }
};

const handleReplyAdded = async (commentId, reply) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.addReply(reviewId, commentId, reply);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await commentAPI.addReply(reviewId, commentId, reply.text);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to add reply:', error);
  }
};

const handleEmojiReactionToggled = async (commentId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReaction(reviewId, commentId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await commentAPI.toggleReaction(reviewId, commentId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to toggle emoji reaction:', error);
  }
};

const handleEmojiReactionToggledReply = async (commentId, replyId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReactionReply(reviewId, commentId, replyId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await commentAPI.toggleReplyReaction(reviewId, commentId, replyId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to toggle emoji reaction on reply:', error);
  }
};

// Annotation handling functions (from WebViewer - syncs with backend)
const handleAnnotationAdded = async (comment) => {
  // Annotation already saved to backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

const handleAnnotationUpdated = async (comment) => {
  // Annotation already updated in backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

const handleAnnotationDeleted = async (comment) => {
  // Annotation already deleted from backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

// History helper functions (moved from CommentsSidebar)
const sortedHistory = computed(() => {
  if (!metadata.value.workflowHistory || !Array.isArray(metadata.value.workflowHistory) || metadata.value.workflowHistory.length === 0) {
    return [];
  }
  // Sort by timestamp, newest first
  const sorted = [...metadata.value.workflowHistory].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA; // Newest first
  });
  return sorted;
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
};

const getHistoryLabel = (stage, action) => {
  const stageLabels = {
    'draft': 'Draft',
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'Art Director Review',
    'art_director_approved': 'Art Director Approved',
    'ad_changes_requested': 'AD Changes Requested',
    'creative_director_review': 'Creative Director Review',
    'cd_changes_requested': 'CD Changes Requested',
    'approved': 'Approved & Released'
  };
  
  const actionLabels = {
    'uploaded': 'Uploaded',
    'created_from_url': 'Created from URL',
    'moved_to_review': 'Moved to Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'resubmitted': 'Resubmitted',
    'version_uploaded': 'Version Uploaded',
    'extended': 'Expiration Extended',
    'password_set': 'Password Set',
    'password_removed': 'Password Removed'
  };
  
  const stageLabel = stageLabels[stage] || stage;
  const actionLabel = actionLabels[action] || action;
  
  // For version uploads, include version label if available
  if (action === 'version_uploaded') {
    return actionLabel;
  }
  
  return `${stageLabel} - ${actionLabel}`;
};

const loadComments = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Load all comments for the review (not filtered by version)
      // This allows seeing all comments across versions
      const res = await mockAPI.getComments(reviewId);
      // Create new object references to ensure Vue reactivity detects nested changes
      comments.value = res.map(comment => ({
        ...comment,
        reactions: comment.reactions ? [...comment.reactions] : [],
        replies: comment.replies ? comment.replies.map(reply => ({
          ...reply,
          reactions: reply.reactions ? [...reply.reactions] : []
        })) : []
      }));
    } else {
      const res = await commentAPI.getComments(reviewId, selectedVersion.value);
      // Create new object references to ensure Vue reactivity detects nested changes
      comments.value = res.map(comment => ({
        ...comment,
        reactions: comment.reactions ? [...comment.reactions] : [],
        replies: comment.replies ? comment.replies.map(reply => ({
          ...reply,
          reactions: reply.reactions ? [...reply.reactions] : []
        })) : []
      }));
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
    comments.value = [];
  }
};

const getHistoryColor = (action) => {
  const colors = {
    'uploaded': 'blue',
    'created_from_url': 'blue',
    'moved_to_review': 'indigo',
    'approved': 'green',
    'rejected': 'red',
    'resubmitted': 'orange',
    'version_uploaded': 'purple',
    'extended': 'teal',
    'password_set': 'amber',
    'password_removed': 'orange'
  };
  return colors[action] || 'grey';
};

// Workflow helper functions
const getWorkflowLabel = (state) => {
  const labels = {
    'draft': 'Draft',
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'Art Director Review',
    'art_director_approved': 'Art Director Approved',
    'ad_changes_requested': 'AD Changes Requested',
    'creative_director_review': 'Creative Director Review',
    'cd_changes_requested': 'CD Changes Requested',
    'approved': 'Approved & Released'
  };
  return labels[state] || state;
};

const getWorkflowColor = (state) => {
  const colors = {
    'draft': 'grey',
    'client_review': 'blue',
    'client_approved': 'light-blue',
    'art_director_review': 'purple',
    'art_director_approved': 'deep-purple',
    'ad_changes_requested': 'orange',
    'creative_director_review': 'indigo',
    'cd_changes_requested': 'orange',
    'approved': 'green'
  };
  return colors[state] || 'grey';
};

const isDesigner = computed(() => {
  return currentUserRole.value === 'designer' || metadata.value.designer === currentUser.value;
});

const canApproveWorkflow = computed(() => {
  const state = metadata.value.workflowState;
  const role = currentUserRole.value;
  
  if (state === 'client_review' && role === 'client') return true;
  if (state === 'art_director_review' && role === 'art_director') return true;
  if (state === 'creative_director_review' && role === 'creative_director') return true;
  
  return false;
});

const getWorkflowActionText = () => {
  const state = metadata.value.workflowState;
  if (state === 'client_review') return 'Client Approval';
  if (state === 'art_director_review') return 'Approve for Creative Director Review';
  if (state === 'creative_director_review') return 'Approve and Release';
  return '';
};

const handleApprove = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    
    if (useMockMode) {
      const updatedReview = await mockAPI.approveWorkflowStage(reviewId, state, currentUser.value);
      // Update metadata with the returned review data
      if (updatedReview) {
        metadata.value = { ...updatedReview };
      } else {
        // Fallback: reload review data
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      const updatedReview = await workflowAPI.approve(reviewId, state);
      // Update metadata with the returned review data
      metadata.value = { ...updatedReview };
    }
    
    showAlertMessage('Success', 'Workflow stage approved successfully', 'success');
  } catch (error) {
    console.error('Failed to approve workflow stage:', error);
    showAlertMessage('Error', 'Failed to approve workflow stage', 'error');
  }
};

const handleReject = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    
    if (useMockMode) {
      await mockAPI.rejectWorkflowStage(reviewId, state, currentUser.value);
    } else {
      const updatedReview = await workflowAPI.reject(reviewId, state);
      metadata.value = { ...updatedReview };
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await reviewAPI.getReview(reviewId);
      metadata.value = { ...res };
    }
    
    const rejectionMessage = state === 'art_director_review' 
      ? 'Art Director changes requested.' 
      : state === 'creative_director_review'
      ? 'Creative Director changes requested.'
      : 'Workflow stage rejected. Sent back to client review.';
    showAlertMessage('Success', rejectionMessage, 'success');
  } catch (error) {
    console.error('Failed to reject workflow stage:', error);
    showAlertMessage('Error', 'Failed to reject workflow stage', 'error');
  }
};

const handleMoveToClientReview = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      await mockAPI.moveToClientReview(reviewId);
    } else {
      const updatedReview = await workflowAPI.moveToClientReview(reviewId);
      metadata.value = { ...updatedReview };
      showAlertMessage('Success', 'Review sent to client for approval', 'success');
      return;
    }
    
    // Reload review data
    const res = await mockAPI.getReview(reviewId);
    metadata.value = { ...res }; // Create new object reference for reactivity
    
    showAlertMessage('Success', 'Review sent to client for approval', 'success');
  } catch (error) {
    console.error('Failed to move to client review:', error);
    showAlertMessage('Error', 'Failed to send to client review', 'error');
  }
};

const handleMoveToArtDirectorReview = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      await mockAPI.moveToArtDirectorReview(reviewId);
    } else {
      const updatedReview = await workflowAPI.moveToArtDirectorReview(reviewId);
      metadata.value = { ...updatedReview };
      return;
    }
    
    // Reload review data
    const res = await mockAPI.getReview(reviewId);
    metadata.value = { ...res }; // Create new object reference for reactivity
    
    showAlertMessage('Success', 'Review sent to Art Director for approval', 'success');
  } catch (error) {
    console.error('Failed to move to Art Director review:', error);
    showAlertMessage('Error', 'Failed to send to Art Director review', 'error');
  }
};

const handleResubmitForReview = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    const targetStage = state === 'ad_changes_requested' ? 'art_director_review' : 'creative_director_review';
    
    if (useMockMode) {
      await mockAPI.resubmitForReview(reviewId, state);
    } else {
      const updatedReview = await workflowAPI.resubmit(reviewId, targetStage);
      metadata.value = { ...updatedReview };
      const stageLabel = targetStage === 'art_director_review' ? 'Art Director' : 'Creative Director';
      showAlertMessage('Success', `Review resubmitted for ${stageLabel} review`, 'success');
      return;
    }
    
    // Reload review data
    const res = await mockAPI.getReview(reviewId);
    metadata.value = { ...res }; // Create new object reference for reactivity
    
    const stageLabel = state === 'ad_changes_requested' ? 'Art Director' : 'Creative Director';
    showAlertMessage('Success', `Review resubmitted for ${stageLabel} review`, 'success');
  } catch (error) {
    console.error('Failed to resubmit for review:', error);
    showAlertMessage('Error', 'Failed to resubmit for review', 'error');
  }
};

// Designer tools handler functions
const handleMarkCompleted = () => {
  confirmModalTitle.value = 'Mark Review as Complete';
  confirmModalMessage.value = `Are you sure you want to mark "${metadata.value.filename}" as complete? The review link will be disabled, but comments and information will be preserved.`;
  showConfirmModal.value = true;
};

const confirmMarkCompleted = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Use mockAPI to mark review as completed (this will also deactivate the link)
      await mockAPI.markReviewCompleted(reviewId, currentUser.value);
    } else {
      // Use real API
      const updatedReview = await reviewAPI.completeReview(reviewId);
      metadata.value = { ...updatedReview };
      reviewCompleted.value = true;
      showConfirmModal.value = false;
      showAlertMessage('Success', 'Review marked as complete', 'success');
      return;
    }
    
    // Reload review data
    const res = await mockAPI.getReview(reviewId);
    metadata.value = { ...res };
    reviewCompleted.value = res.completed || false;
    
    showAlertMessage('Success', 'Review marked as complete. The link is now disabled.', 'success');
  } catch (error) {
    console.error('Failed to mark review as complete:', error);
    showAlertMessage('Error', 'Failed to mark review as complete. Please try again.', 'error');
  }
};

const handleChangePassword = () => {
  showPasswordModal.value = true;
};

const handleSharingSettings = () => {
  // Initialize sharing settings from metadata
  sharingType.value = metadata.value.sharingMode || 'anyone';
  approvedPeople.value = metadata.value.approvedEmails && metadata.value.approvedEmails.length > 0
    ? [...metadata.value.approvedEmails, '']
    : [''];
  showSharingModal.value = true;
};

const addApprovedPerson = () => {
  approvedPeople.value.push('');
};

const removeApprovedPerson = (index) => {
  if (approvedPeople.value.length > 1) {
    approvedPeople.value.splice(index, 1);
  } else {
    approvedPeople.value[0] = '';
  }
};

const handleSharingChanged = async () => {
  try {
    const useMockMode = await isMockMode();
    const finalSharingMode = sharingType.value === 'restricted' ? 'restricted' : 'anyone';
    const finalApprovedEmails = sharingType.value === 'restricted'
      ? approvedPeople.value.filter(email => email.trim() !== '')
      : [];
    
    if (useMockMode) {
      // Update mock data
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.sharingMode = finalSharingMode;
        review.approvedEmails = finalApprovedEmails;
        
        // Add history entry for sharing change
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'sharing_changed',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString()
        });
        
        // Reload review data to get updated history
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      // Use real API
      const updatedReview = await reviewAPI.updateSharing(reviewId, finalSharingMode, finalApprovedEmails);
      metadata.value = { ...updatedReview };
    }
    
    showSharingModal.value = false;
    showAlertMessage('Success', 'Sharing settings updated successfully!', 'success');
  } catch (error) {
    console.error('Failed to update sharing settings:', error);
    showAlertMessage('Error', 'Failed to update sharing settings. Please try again.', 'error');
  }
};

const handlePasswordChanged = async (passwordValue) => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.password = passwordValue;
        
        // Add history entry for any password change
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: passwordValue ? 'password_set' : 'password_removed',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString()
        });
        
        // Reload review data to get updated history
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      // Use real API
      const updatedReview = await passwordAPI.updatePassword(reviewId, passwordValue);
      metadata.value = { ...updatedReview };
    }
    
    const message = passwordValue 
      ? 'Password updated successfully!'
      : 'Password removed successfully!';
    showAlertMessage('Success', message, 'success');
  } catch (error) {
    console.error('Failed to change password:', error);
    showAlertMessage('Error', 'Failed to change password. Please try again.', 'error');
  }
};

const handleExtendExpiration = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);
        newExpiresAt.setHours(23, 59, 59, 999);
        review.expiresAt = newExpiresAt.toISOString();
        
        // Add history entry
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'extended',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString(),
          days: 30
        });
        
        // Reload review data to get updated history
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      // Use real API
      const updatedReview = await passwordAPI.extendExpiration(reviewId, 30);
      metadata.value = { ...updatedReview };
    }
    
    showAlertMessage('Success', 'Expiration date extended by 30 days!', 'success');
  } catch (error) {
    console.error('Failed to extend expiration:', error);
    showAlertMessage('Error', 'Failed to extend expiration date. Please try again.', 'error');
  }
};

const handleUploadNewVersion = () => {
  showUploadModal.value = true;
};

const handleVersionUploaded = async () => {
  // Reload review data to get new version
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res };
      // Auto-select the new version
      if (res.versions && res.versions.length > 0) {
        selectedVersion.value = res.versions[res.versions.length - 1].id;
        await loadVersion();
      }
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
      if (res.data.versions && res.data.versions.length > 0) {
        selectedVersion.value = res.data.versions[res.data.versions.length - 1].id;
        await loadVersion();
      }
    }
    showAlertMessage('Success', 'New version uploaded successfully!', 'success');
  } catch (error) {
    console.error('Failed to reload review after version upload:', error);
  }
};

// Track when a review is viewed (for clients)
const trackReviewView = (reviewId) => {
  if (currentUserRole.value !== 'client') return;
  
  try {
    const stored = localStorage.getItem('recentlyViewedLinks');
    const viewedIds = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (to move to front)
    const index = viewedIds.indexOf(reviewId);
    if (index > -1) {
      viewedIds.splice(index, 1);
    }
    
    // Add to front
    viewedIds.unshift(reviewId);
    
    // Keep only last 20
    const trimmed = viewedIds.slice(0, 20);
    
    localStorage.setItem('recentlyViewedLinks', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to track review view:', error);
  }
};

// Update document title when metadata changes
watch(() => metadata.value.filename, (newFilename) => {
  if (newFilename) {
    document.title = `${newFilename} - Design Review`;
  } else {
    document.title = 'Design Review';
  }
});

onMounted(async () => {
  // Set up dark mode observer
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also check periodically as a fallback
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  // Check immediately
  checkDarkMode();
  
  // Check every 100ms as fallback
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      console.log('Loaded review:', res);
      console.log('WorkflowHistory:', res.workflowHistory);
      metadata.value = { ...res }; // Create new object reference for reactivity
      reviewCompleted.value = res.completed || false;
      
      // Track view for clients
      if (currentUserRole.value === 'client') {
        trackReviewView(reviewId);
      }
      
      if (reviewCompleted.value) {
        // Comments are loaded automatically by WebViewer when document loads
        return;
      }
      
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
      
      // Initialize comparison versions if switching to comparison mode
      if (comparisonMode.value && res.versions.length >= 2) {
        leftVersion.value = res.versions[0].id;
        rightVersion.value = res.versions.length > 1 ? res.versions[1].id : res.versions[0].id;
      }
    } else {
      const res = await reviewAPI.getReview(reviewId);
      console.log('Loaded review:', res);
      console.log('WorkflowHistory:', res.workflowHistory);
      metadata.value = { ...res }; // Create new object reference for reactivity
      reviewCompleted.value = res.completed || false;
      
      // Track view for clients
      if (currentUserRole.value === 'client') {
        trackReviewView(reviewId);
      }
      
      if (reviewCompleted.value) {
        // Comments are loaded automatically by WebViewer when document loads
        return;
      }
      
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
      
      // Initialize comparison versions if switching to comparison mode
      if (comparisonMode.value && res.versions.length >= 2) {
        leftVersion.value = res.versions[0].id;
        rightVersion.value = res.versions.length > 1 ? res.versions[1].id : res.versions[0].id;
      }
    }
  } catch (err) {
    if (err.response?.status === 401) {
      passwordRequired.value = true;
    }
  }
});

// Cleanup observer and interval on unmount
onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>
