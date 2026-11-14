<template>
  <PageShell width="full">
    <div class="review-layout">
      <!-- Main content -->
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <!-- Loading -->
        <UiPanel v-if="loadState === 'loading'">
          <UiSpinner label="Loading review…" />
        </UiPanel>

        <!-- Expired, not shared, not found, or failed to load -->
        <div v-else-if="errorState" role="alert">
          <UiEmptyState :title="errorState.title" :body="errorState.message" :spot="errorState.spot">
            <template v-if="errorState.retry" #actions>
              <UiButton variant="primary" icon="refresh" @click="retryLoad">Try again</UiButton>
            </template>
          </UiEmptyState>
        </div>

        <!-- Waiting for the password -->
        <UiEmptyState v-else-if="loadState === 'password'" title="Password required" body="This review is password protected." spot="site/building-trust">
          <template v-if="!passwordRequired" #actions>
            <UiButton variant="primary" icon="lock_open" @click="passwordRequired = true">Enter password</UiButton>
          </template>
        </UiEmptyState>

        <!-- Completed Review Message -->
        <UiEmptyState v-else-if="reviewCompleted" title="Review complete" spot="site/review">
          This review has been marked as complete by the designer.
          Comments and review information are preserved, but the review link is no longer active.
        </UiEmptyState>

        <!-- File Preview Section -->
        <UiPanel v-else :title="metadata.filename" :description="metadata.designer ? `Designer: ${metadata.designer}` : ''" heading-tag="h1">
          <template #actions>
            <DemoDataBadge />
            <UiButton v-if="metadata.versions.length > 1" icon="compare" @click="toggleComparisonMode">
              {{ comparisonMode ? 'Single view' : 'Compare versions' }}
            </UiButton>
            <UiButton v-if="previewUrl && !comparisonMode" icon="open_in_new" @click="openInNewTab">Open in new tab</UiButton>
          </template>

          <!-- Single View Mode -->
          <div v-if="!comparisonMode" class="flex flex-col gap-4">
            <div class="max-w-sm">
              <VersionSelector
                v-model="selectedVersion"
                :versions="metadata.versions"
                @update:modelValue="loadVersion"
              />
            </div>
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
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-3">
              <VersionSelector
                v-model="leftVersion"
                label="Version 1"
                :versions="metadata.versions"
                @update:modelValue="loadLeftVersion"
              />
              <div class="compare-frame">
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
            <div class="flex flex-col gap-3">
              <VersionSelector
                v-model="rightVersion"
                label="Version 2"
                :versions="metadata.versions"
                @update:modelValue="loadRightVersion"
              />
              <div class="compare-frame">
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
        </UiPanel>

        <PasswordPrompt
          v-model="passwordRequired"
          :error="passwordError"
          :loading="passwordSubmitting"
          @submit="submitPassword"
        />
      </div>

      <!-- Right sidebar -->
      <aside v-if="loadState === 'ready'" class="review-sidebar" aria-label="Review tools">
        <!-- Designer tools -->
        <UiPanel v-if="isDesigner && !reviewCompleted" title="Designer tools" heading-tag="h3">
          <div class="flex flex-wrap gap-2">
            <!-- Set or change the password (the API never returns it, only hasPassword) -->
            <UiButton v-if="can('manage-password')" icon-only icon="key" :label="metadata.hasPassword ? 'Change password' : 'Set password'" @click="handleChangePassword" />
            <UiButton v-if="can('extend')" icon-only icon="calendar_month" label="Extend expiration" @click="handleExtendExpiration" />
            <UiButton v-if="can('upload-version')" icon-only icon="upload" label="Upload new version" @click="handleUploadNewVersion" />
            <UiButton v-if="can('manage-sharing')" icon-only icon="share" label="Sharing settings" @click="handleSharingSettings" />
          </div>
        </UiPanel>

        <WorkflowCard
          :workflow-state="metadata.workflowState"
          :allowed-actions="metadata.allowedActions || []"
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
      </aside>
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
      title="Request changes"
      label="What needs to change? (optional)"
      placeholder="Reason for the designer"
      :required="false"
      @submit="confirmReject"
    />

    <!-- Change Password Modal -->
    <PromptModal
      v-model="showPasswordModal"
      :title="metadata.hasPassword ? 'Change password' : 'Set password'"
      label="New password (leave empty to remove the password)"
      placeholder="Enter new password or leave empty"
      type="password"
      :required="false"
      @submit="handlePasswordChanged"
    />

    <!-- Sharing Settings Modal -->
    <UiDialog v-model:open="showSharingModal" title="Sharing settings">
      <form :id="sharingFormId" class="flex flex-col gap-5" @submit.prevent="handleSharingChanged">
        <UiRadioChoices
          v-model="sharingType"
          label="Who can access this review?"
          :options="[
            { value: 'anyone', label: 'Anyone with the link' },
            { value: 'restricted', label: 'Only people I list' },
          ]"
        />
        <ApprovedPeopleEditor v-if="sharingType === 'restricted'" v-model="approvedPeople" />
      </form>
      <template #footer>
        <UiButton variant="ghost" @click="showSharingModal = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" :form="sharingFormId">Save changes</UiButton>
      </template>
    </UiDialog>

    <!-- Confirm Completion Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="Mark as complete"
      confirm-color="primary"
      @confirm="confirmMarkCompleted"
    />
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, useId } from 'vue';
import { useRoute } from 'vue-router';
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
import ApprovedPeopleEditor from '../components/review-ui/ApprovedPeopleEditor.vue';
import { PageShell, UiButton, UiDialog, UiEmptyState, UiPanel, UiSpinner } from '../components/ui';
import UiRadioChoices from '../components/ui/UiRadioChoices.vue';
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
import { useNotice } from '../composables/useNotice.js';

const route = useRoute();
// The review shown follows the route, so navigating between reviews reloads
const reviewId = computed(() => String(route.params.id || ''));

const { notice, showNotice, clearNotice } = useNotice();

// The acting user, read once (identity is switched elsewhere and the page reloaded)
const user = getCurrentUser();
// For labels only ('designer', 'client', 'art_director', 'creative_director', 'admin'); permissions come from allowedActions
const currentUserRole = ref(user.role || 'designer');

const REVIEW_STAGES = ['client_review', 'art_director_review', 'creative_director_review'];
const emptyReview = () => ({ filename: '', versions: [], workflowState: 'draft', workflowHistory: [], hasPassword: false, allowedActions: [] });

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
const sharingFormId = `sharing-${useId()}`;

/** 410 means either completed or expired; the API says which */
const goneState = (error) => (error?.response?.data?.reason === 'completed' ? 'completed' : 'expired');

const errorStates = {
  expired: { title: 'This review link has expired', message: 'Ask the designer to extend it if you still need access.', spot: 'guidelines/time' },
  completed: { title: 'Review complete', message: 'The designer has marked this review as complete, so it no longer accepts feedback.', spot: 'site/review' },
  forbidden: { title: "This review hasn't been shared with you", message: 'Ask the designer to add your email address to the review.', spot: 'site/building-trust' },
  notfound: { title: 'Review not found', message: 'The link may be wrong, or the review may have been deleted.', spot: 'site/not-found' },
};
const errorState = computed(() => {
  if (loadState.value === 'error') return { title: 'The review could not be loaded', message: loadErrorMessage.value, retry: true, spot: 'patterns/error-handling' };
  return errorStates[loadState.value] || null;
});

// What the caller may do with this review, as the server says (allowedActions, docs/REVIEW_API.md)
const can = (action) => (metadata.value.allowedActions || []).includes(action);
const DESIGNER_TOOL_ACTIONS = ['manage-password', 'extend', 'upload-version', 'manage-sharing'];
const isDesigner = computed(() => DESIGNER_TOOL_ACTIONS.some(can));

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

<style scoped>
.review-layout {
  @apply flex flex-col gap-4 xl:flex-row xl:items-start;
}
.review-sidebar {
  @apply flex w-full shrink-0 flex-col gap-4 xl:w-80;
}
.compare-frame {
  @apply overflow-hidden rounded-tile border-2 border-accent-highlight;
}
</style>
