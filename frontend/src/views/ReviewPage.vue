<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <div class="flex-1 h-full transition-all duration-300 relative overflow-hidden" style="margin-left: 48px;">
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-6 min-h-screen">
          <div class="flex gap-4" style="min-height: calc(100vh - 200px);">
            <!-- Main Content Area -->
            <div class="flex-1 overflow-y-auto space-y-4">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />

      <!-- Loading -->
      <div v-if="loadState === 'loading'" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div class="p-8 text-center">
          <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Loading review…</p>
        </div>
      </div>

      <!-- Expired, not shared, not found, or failed to load -->
      <div v-else-if="errorState" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg" role="alert">
        <div class="p-8 text-center">
          <div class="flex justify-center mb-4">
            <div :class="isDarkMode ? 'bg-red-900/20' : 'bg-red-100'" class="w-16 h-16 rounded-full flex items-center justify-center">
              <svg :class="isDarkMode ? 'text-red-400' : 'text-red-600'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-2xl font-bold mb-2">{{ errorState.title }}</h2>
          <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="mb-4">{{ errorState.message }}</p>
          <button
            v-if="errorState.retry"
            @click="retryLoad"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'"
          >
            Try again
          </button>
        </div>
      </div>

      <!-- Waiting for the password -->
      <div v-else-if="loadState === 'password'" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div class="p-8 text-center">
          <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="mb-4">This review is password protected.</p>
          <button
            v-if="!passwordRequired"
            @click="passwordRequired = true"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'"
          >
            Enter password
          </button>
        </div>
      </div>

      <!-- Completed Review Message -->
      <div v-else-if="reviewCompleted" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
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
      <div v-else :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'" class="border-b px-6 py-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex-1">
              <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-xl font-bold mb-2 flex items-center gap-3 flex-wrap">{{ metadata.filename }} <DemoDataBadge /></h2>
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
          :version-id="selectedVersion"
          :content-type="previewContentType"
          :read-only="reviewCompleted"
          @annotations-changed="handleAnnotationsChanged"
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
                    :version-id="leftVersion"
                    :content-type="leftContentType"
                    :sync-annotations="false"
                    read-only
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
                    :version-id="rightVersion"
                    :content-type="rightContentType"
                    :sync-annotations="false"
                    read-only
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <PasswordPrompt
      v-model="passwordRequired"
      :error="passwordError"
      :loading="passwordSubmitting"
      @submit="submitPassword"
    />
    </div>

    <!-- Right Sidebar -->
    <div v-if="loadState === 'ready'" class="w-72 flex-shrink-0">
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
            <div class="grid gap-2 grid-cols-4">
              <!-- Set or change the password (the API never returns it, only hasPassword) -->
              <v-tooltip :text="metadata.hasPassword ? 'Change Password' : 'Set Password'">
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
          :resubmit-target="resubmitTarget"
          :bypass-client-review="!!metadata.bypassClientReview"
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

    <!-- Request Changes Modal -->
    <PromptModal
      v-model="showRejectModal"
      title="Request Changes"
      label="What needs to change? (optional)"
      placeholder="Reason for the designer"
      :required="false"
      @submit="confirmReject"
    />

    <!-- Change Password Modal -->
    <PromptModal
      v-model="showPasswordModal"
      :title="metadata.hasPassword ? 'Change Password' : 'Set Password'"
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

            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import VersionSelector from '../components/review-ui/VersionSelector.vue';
import PreviewFrame from '../components/review-ui/PreviewFrame.vue';
import CommentsSidebar from '../components/review-ui/CommentsSidebar.vue';
import WorkflowCard from '../components/review-ui/WorkflowCard.vue';
import VersionUploadModal from '../components/review-ui/VersionUploadModal.vue';
import PromptModal from '../components/review-ui/PromptModal.vue';
import PasswordPrompt from '../components/review-ui/PasswordPrompt.vue';
import ConfirmModal from '../components/review-ui/ConfirmModal.vue';
import DemoDataBadge from '../components/review-ui/DemoDataBadge.vue';
import { getCurrentUser } from '../mockData.js';
import {
  reviewAPI,
  workflowAPI,
  commentAPI,
  passwordAPI,
  reviewPasswords,
  isPasswordRequired,
  errorStatus,
  apiErrorMessage,
} from '../services/api.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';

const route = useRoute();
// The review shown follows the route, so navigating between reviews reloads
const reviewId = computed(() => String(route.params.id || ''));

const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();

// The acting user, read once (identity is switched elsewhere and the page reloaded)
const user = getCurrentUser();
const currentUserRole = ref(user.role || 'designer'); // 'designer', 'client', 'art_director', 'creative_director'

const REVIEW_STAGES = ['client_review', 'art_director_review', 'creative_director_review'];
const emptyReview = () => ({ filename: '', versions: [], workflowState: 'draft', workflowHistory: [], hasPassword: false });

// 'loading' | 'ready' | 'password' | 'expired' | 'completed' | 'forbidden' | 'notfound' | 'error'
const loadState = ref('loading');
const loadErrorMessage = ref('');

const previewFrameRef = ref(null);
const metadata = ref(emptyReview());
const selectedVersion = ref('');
const previewUrl = ref('');
const previewContentType = ref(null);
const comments = ref([]);
const reviewCompleted = ref(false);

// Password prompt
const passwordRequired = ref(false);
const passwordError = ref('');
const passwordSubmitting = ref(false);

// Comparison mode state
const comparisonMode = ref(false);
const leftVersion = ref('');
const rightVersion = ref('');
const leftPreviewUrl = ref('');
const rightPreviewUrl = ref('');
const leftContentType = ref(null);
const rightContentType = ref(null);

// Designer tools modals state
const showUploadModal = ref(false);
const showPasswordModal = ref(false);
const showSharingModal = ref(false);
const showConfirmModal = ref(false);
const showRejectModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const sharingType = ref('anyone'); // 'anyone' or 'restricted' (API: 'approved_emails')
const approvedPeople = ref(['']);

/** 410 means either completed or expired; the API says which */
const goneState = (error) => (error?.response?.data?.reason === 'completed' ? 'completed' : 'expired');

const errorStates = {
  expired: { title: 'This review link has expired', message: 'Ask the designer to extend it if you still need access.' },
  completed: { title: 'Review complete', message: 'The designer has marked this review as complete, so it no longer accepts feedback.' },
  forbidden: { title: "This review hasn't been shared with you", message: 'Ask the designer to add your email address to the review.' },
  notfound: { title: 'Review not found', message: 'The link may be wrong, or the review may have been deleted.' },
};
const errorState = computed(() => {
  if (loadState.value === 'error') return { title: 'The review could not be loaded', message: loadErrorMessage.value, retry: true };
  return errorStates[loadState.value] || null;
});

const isDesigner = computed(() => {
  return currentUserRole.value === 'designer' || (!!metadata.value.designerEmail && metadata.value.designerEmail === user.email);
});

// After a rejection the review is back in draft; resubmit to the stage that rejected it
const resubmitTarget = computed(() => {
  if (metadata.value.workflowState !== 'draft') return null;
  const history = [...(metadata.value.workflowHistory || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const rejectedAt = history.findIndex((entry) => entry.action === 'rejected');
  if (rejectedAt === -1) return null;
  // Resubmitted since then? Then there's nothing to resubmit.
  if (history.slice(0, rejectedAt).some((entry) => entry.action === 'resubmitted' || entry.action === 'moved_to_review')) return null;
  const stage = history.slice(rejectedAt).find((entry) => REVIEW_STAGES.includes(entry.stage))?.stage;
  return stage || null;
});

/* ---------------------------------------------------------------------- */
/* Errors                                                                  */
/* ---------------------------------------------------------------------- */

/** Handle a failed call: switch to the right page state, or show a notice. */
const handleError = (error, fallback) => {
  console.error(fallback, error);
  const status = errorStatus(error);
  if (isPasswordRequired(error)) {
    reviewPasswords.clear(reviewId.value);
    passwordError.value = '';
    loadState.value = 'password';
    passwordRequired.value = true;
    return;
  }
  if (status === 410) {
    loadState.value = goneState(error);
    return;
  }
  if (status === 403) {
    loadState.value = 'forbidden';
    return;
  }
  showNotice(apiErrorMessage(error, fallback), 'error');
};

/* ---------------------------------------------------------------------- */
/* Loading                                                                 */
/* ---------------------------------------------------------------------- */

// Each load gets a token; responses for an older review or version are dropped
let reviewToken = 0;
let versionToken = 0;
let commentsToken = 0;
const compareTokens = { left: 0, right: 0 };

const applyReview = (review) => {
  metadata.value = { ...emptyReview(), ...review };
  reviewCompleted.value = !!review.completed;
};

const resetPage = () => {
  reviewToken += 1;
  versionToken += 1;
  commentsToken += 1;
  compareTokens.left += 1;
  compareTokens.right += 1;
  loadState.value = 'loading';
  loadErrorMessage.value = '';
  metadata.value = emptyReview();
  selectedVersion.value = '';
  previewUrl.value = '';
  previewContentType.value = null;
  comments.value = [];
  reviewCompleted.value = false;
  comparisonMode.value = false;
  leftVersion.value = '';
  rightVersion.value = '';
  leftPreviewUrl.value = '';
  rightPreviewUrl.value = '';
  passwordRequired.value = false;
  passwordError.value = '';
  clearNotice();
};

// Pick the version to show: keep the current one if it still exists, else the latest
const chooseVersion = (versions, preferred) => {
  if (!versions?.length) return '';
  if (preferred && versions.some((v) => v.id === preferred)) return preferred;
  return versions[versions.length - 1].id;
};

const loadReview = async ({ password } = {}) => {
  const id = reviewId.value;
  if (!id) return;
  const token = ++reviewToken;

  try {
    const review = password !== undefined ? await reviewAPI.getReview(id, password) : await reviewAPI.getReview(id);
    if (token !== reviewToken) return;
    if (password) reviewPasswords.set(id, password);

    applyReview(review);
    passwordRequired.value = false;
    passwordError.value = '';
    loadState.value = 'ready';
    trackReviewView(id);

    selectedVersion.value = chooseVersion(review.versions, selectedVersion.value);
    if (reviewCompleted.value) {
      // Completed reviews show their comments, read-only, without the preview
      await loadComments();
      return;
    }
    await loadVersion();
  } catch (error) {
    if (token !== reviewToken) return;
    if (isPasswordRequired(error)) {
      reviewPasswords.clear(id);
      passwordError.value = password ? 'That password is not correct.' : '';
      loadState.value = 'password';
      passwordRequired.value = true;
      return;
    }
    const status = errorStatus(error);
    if (status === 410) loadState.value = goneState(error);
    else if (status === 403) loadState.value = 'forbidden';
    else if (status === 404) loadState.value = 'notfound';
    else {
      console.error('Failed to load review:', error);
      loadErrorMessage.value = apiErrorMessage(error, 'Please try again.');
      loadState.value = 'error';
    }
  }
};

/** Re-fetch the review after a change (keeps the page as it is on failure). */
const refreshReview = async () => {
  const id = reviewId.value;
  const token = reviewToken;
  try {
    const review = await reviewAPI.getReview(id);
    if (token !== reviewToken || id !== reviewId.value) return null;
    applyReview(review);
    return review;
  } catch (error) {
    handleError(error, 'Failed to refresh the review.');
    return null;
  }
};

const submitPassword = async (input) => {
  passwordSubmitting.value = true;
  try {
    await loadReview({ password: input });
  } finally {
    passwordSubmitting.value = false;
  }
};

const retryLoad = () => {
  loadState.value = 'loading';
  loadReview();
};

/** URL and content type to preview for a version (URL reviews without versions show their link). */
const fetchVersionPreview = async (versionId) => {
  const review = metadata.value;
  if (!versionId) {
    return review.sourceType === 'url' && review.url ? { url: review.url, contentType: null } : { url: '', contentType: null };
  }
  const version = review.versions.find((v) => v.id === versionId);
  const url = await reviewAPI.getVersion(reviewId.value, versionId);
  return { url, contentType: version?.contentType || null };
};

const loadVersion = async () => {
  const token = ++versionToken;
  try {
    const { url, contentType } = await fetchVersionPreview(selectedVersion.value);
    if (token !== versionToken) return;
    previewContentType.value = contentType;
    previewUrl.value = url;
  } catch (error) {
    if (token !== versionToken) return;
    previewUrl.value = '';
    handleError(error, 'Failed to load this version.');
  }
  if (token === versionToken) await loadComments();
};

const loadSide = async (side) => {
  const token = ++compareTokens[side];
  const versionId = side === 'left' ? leftVersion.value : rightVersion.value;
  try {
    const { url, contentType } = await fetchVersionPreview(versionId);
    if (token !== compareTokens[side]) return;
    if (side === 'left') {
      leftContentType.value = contentType;
      leftPreviewUrl.value = url;
    } else {
      rightContentType.value = contentType;
      rightPreviewUrl.value = url;
    }
  } catch (error) {
    if (token !== compareTokens[side]) return;
    handleError(error, 'Failed to load this version.');
  }
};

const loadLeftVersion = () => loadSide('left');
const loadRightVersion = () => loadSide('right');

const toggleComparisonMode = () => {
  comparisonMode.value = !comparisonMode.value;

  const versions = metadata.value.versions;
  if (comparisonMode.value && versions.length >= 2) {
    // Compare the two latest versions
    leftVersion.value = versions[versions.length - 2].id;
    rightVersion.value = versions[versions.length - 1].id;
    loadLeftVersion();
    loadRightVersion();
  }
};

const openInNewTab = async () => {
  // Signed file links expire after 10 minutes, so fetch a fresh one. Open the tab first
  // (synchronously, so it isn't blocked as a popup), then point it at the file.
  const win = window.open('about:blank', '_blank');
  if (!win) {
    showNotice('Your browser blocked the new tab. Allow pop-ups for this site and try again.', 'warning');
    return;
  }
  win.opener = null;
  try {
    const { url } = await fetchVersionPreview(selectedVersion.value);
    if (url) win.location.href = url;
    else win.close();
  } catch (error) {
    win.close();
    handleError(error, 'Failed to open the file.');
  }
};

/* ---------------------------------------------------------------------- */
/* Comments                                                                */
/* ---------------------------------------------------------------------- */

const loadComments = async () => {
  const id = reviewId.value;
  const token = ++commentsToken;
  try {
    // Completed reviews show every version's comments
    const versionId = reviewCompleted.value ? null : selectedVersion.value || null;
    const res = await commentAPI.getComments(id, versionId);
    if (token !== commentsToken) return;
    comments.value = res || [];
  } catch (error) {
    if (token !== commentsToken) return;
    handleError(error, 'Failed to load comments.');
  }
};

/** Run a comment change, then reload the comments. */
const commentAction = async (action, failure) => {
  try {
    await action();
  } catch (error) {
    handleError(error, failure);
  }
  await loadComments();
};

const handleCommentAdded = (comment) =>
  commentAction(() => commentAPI.addComment(reviewId.value, comment), 'Failed to add the comment.');

const handleCommentUpdated = (commentId, updates) =>
  commentAction(() => commentAPI.updateComment(reviewId.value, commentId, updates), 'Failed to update the comment.');

const handleReplyAdded = (commentId, text) =>
  commentAction(() => commentAPI.addReply(reviewId.value, commentId, text), 'Failed to add the reply.');

const handleEmojiReactionToggled = (commentId, emoji) =>
  commentAction(() => commentAPI.toggleReaction(reviewId.value, commentId, emoji), 'Failed to update the reaction.');

const handleEmojiReactionToggledReply = (commentId, replyId, emoji) =>
  commentAction(() => commentAPI.toggleReplyReaction(reviewId.value, commentId, replyId, emoji), 'Failed to update the reaction.');

// Annotations drawn in the viewer are saved as comments by PreviewFrame
const handleAnnotationsChanged = ({ error }) => {
  if (error) handleError(error, 'Failed to save your annotation.');
  loadComments();
};

/* ---------------------------------------------------------------------- */
/* Workflow                                                                */
/* ---------------------------------------------------------------------- */

/** Run a workflow change that returns the updated review. */
const workflowAction = async (action, success, failure) => {
  try {
    const updated = await action();
    if (updated) applyReview(updated);
    showNotice(success, 'success');
  } catch (error) {
    handleError(error, failure);
  }
};

const handleApprove = () => {
  const stage = metadata.value.workflowState;
  return workflowAction(() => workflowAPI.approve(reviewId.value, stage), 'Workflow stage approved.', 'Failed to approve the workflow stage.');
};

const handleReject = () => {
  showRejectModal.value = true;
};

const confirmReject = (reason) => {
  const stage = metadata.value.workflowState;
  return workflowAction(
    () => workflowAPI.reject(reviewId.value, stage, (reason || '').trim() || null),
    'Changes requested. The review is back with the designer.',
    'Failed to request changes.'
  );
};

// Reviews that bypass client review go from draft straight to the Art Director
const handleMoveToClientReview = () =>
  metadata.value.bypassClientReview
    ? workflowAction(
      () => workflowAPI.moveToArtDirectorReview(reviewId.value),
      'Review sent to the Art Director for approval.',
      'Failed to send to Art Director review.'
    )
    : workflowAction(
      () => workflowAPI.moveToClientReview(reviewId.value),
      'Review sent to the client for approval.',
      'Failed to send to client review.'
    );

const handleMoveToArtDirectorReview = () =>
  workflowAction(
    () => workflowAPI.moveToArtDirectorReview(reviewId.value),
    'Review sent to the Art Director for approval.',
    'Failed to send to Art Director review.'
  );

const handleResubmitForReview = () => {
  const targetStage = resubmitTarget.value;
  if (!targetStage) return;
  return workflowAction(
    () => workflowAPI.resubmit(reviewId.value, targetStage),
    'Review resubmitted.',
    'Failed to resubmit the review.'
  );
};

const handleMarkCompleted = () => {
  confirmModalTitle.value = 'Mark Review as Complete';
  confirmModalMessage.value = `Are you sure you want to mark "${metadata.value.filename}" as complete? The review link will be disabled, but comments and information will be preserved.`;
  showConfirmModal.value = true;
};

const confirmMarkCompleted = async () => {
  await workflowAction(
    () => reviewAPI.completeReview(reviewId.value),
    'Review marked as complete.',
    'Failed to mark the review as complete.'
  );
  // Completing a review also expires its link, so further reads would be 410; keep what's on screen.
  if (reviewCompleted.value) {
    comparisonMode.value = false;
  }
};

/* ---------------------------------------------------------------------- */
/* Designer tools                                                          */
/* ---------------------------------------------------------------------- */

const handleChangePassword = () => {
  showPasswordModal.value = true;
};

const handleSharingSettings = () => {
  sharingType.value = metadata.value.sharingMode === 'approved_emails' ? 'restricted' : 'anyone';
  approvedPeople.value = metadata.value.approvedEmails?.length ? [...metadata.value.approvedEmails, ''] : [''];
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
  const restricted = sharingType.value === 'restricted';
  const emails = restricted ? approvedPeople.value.map((email) => email.trim()).filter(Boolean) : [];
  if (restricted && emails.length === 0) {
    showNotice('Add at least one email address, or share with anyone who has the link.', 'error');
    return;
  }
  try {
    const updated = await reviewAPI.updateSharing(reviewId.value, restricted ? 'approved_emails' : 'anyone', emails);
    applyReview(updated);
    showSharingModal.value = false;
    showNotice('Sharing settings updated.', 'success');
  } catch (error) {
    handleError(error, 'Failed to update sharing settings.');
  }
};

const handlePasswordChanged = async (passwordValue) => {
  const password = (passwordValue || '').trim();
  try {
    const { hasPassword } = await passwordAPI.updatePassword(reviewId.value, password);
    metadata.value = { ...metadata.value, hasPassword };
    showNotice(password ? 'Password updated.' : 'Password removed.', 'success');
    refreshReview(); // pick up the history entry
  } catch (error) {
    handleError(error, 'Failed to change the password.');
  }
};

const handleExtendExpiration = () =>
  workflowAction(
    () => passwordAPI.extendExpiration(reviewId.value, 30),
    'Expiration extended by 30 days.',
    'Failed to extend the expiration date.'
  );

const handleUploadNewVersion = () => {
  showUploadModal.value = true;
};

const handleVersionUploaded = async (version) => {
  const review = await refreshReview();
  if (!review) return;
  // Show the new version (or the latest, if the server's id differs)
  selectedVersion.value = chooseVersion(review.versions, version?.id);
  showNotice('New version uploaded.', 'success');
  await loadVersion();
};

// Remember reviews a client opened, for their "recently viewed" list
const trackReviewView = (id) => {
  if (currentUserRole.value !== 'client') return;
  try {
    const stored = localStorage.getItem('recentlyViewedLinks');
    const viewedIds = (stored ? JSON.parse(stored) : []).filter((viewed) => viewed !== id);
    viewedIds.unshift(id);
    localStorage.setItem('recentlyViewedLinks', JSON.stringify(viewedIds.slice(0, 20)));
  } catch (error) {
    console.error('Failed to track review view:', error);
  }
};

// Update document title when metadata changes
watch(() => metadata.value.filename, (newFilename) => {
  document.title = newFilename ? `${newFilename} - Design Review` : 'Design Review';
});

// Load (and reload when the route moves to another review)
watch(reviewId, () => {
  resetPage();
  loadReview();
}, { immediate: true });
</script>
