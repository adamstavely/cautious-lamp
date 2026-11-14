<template>
  <UiPanel title="Workflow" heading-tag="h3">
    <template #actions>
      <UiButton size="sm" variant="ghost" icon="history" @click="showHistoryModal = true">View history</UiButton>
    </template>

    <p class="flex flex-wrap items-center gap-2 text-sm">
      <span class="font-medium text-ink">Status:</span>
      <UiChip :tone="workflowTone(workflowState)">{{ workflowLabel(workflowState) }}</UiChip>
    </p>

    <!-- Reviewer actions -->
    <div v-if="canApproveWorkflow" class="flex flex-col gap-3">
      <p v-if="getWorkflowActionText()" class="text-sm font-semibold text-ink-strong">{{ getWorkflowActionText() }}</p>
      <div class="flex flex-wrap gap-2">
        <UiButton v-if="can('approve')" variant="primary" icon="approval" @click="handleApprove">Approve</UiButton>
        <UiButton v-if="can('reject')" icon="source_notes" @click="handleReject">Rework</UiButton>
      </div>
    </div>

    <!-- Designer / team actions -->
    <div v-else-if="canDriveWorkflow">
      <!-- Mark as Completed (only after approved) -->
      <UiButton v-if="workflowState === 'approved' && !reviewCompleted && can('complete')" variant="primary" icon="done_all" @click="handleMarkCompleted">
        Mark as complete
      </UiButton>

      <!-- Draft after a rejection: resubmit to the stage that asked for changes -->
      <UiButton v-else-if="workflowState === 'draft' && resubmitTarget && can('resubmit')" variant="primary" icon="refresh" @click="handleResubmitForReview">
        Resubmit for {{ workflowLabel(resubmitTarget) }}
      </UiButton>

      <!-- Move to Client Review (or straight to the Art Director when the review bypasses the client) -->
      <UiButton
        v-else-if="workflowState === 'draft' && (can('move-to-client-review') || (bypassClientReview && can('move-to-art-director-review')))"
        variant="primary"
        icon="check_circle"
        @click="handleMoveToClientReview"
      >
        {{ bypassClientReview ? 'Send to Art Director review' : 'Send to client review' }}
      </UiButton>

      <!-- Request Art Director Review -->
      <UiButton v-else-if="workflowState === 'client_approved' && can('move-to-art-director-review')" variant="primary" icon="check_circle" @click="handleMoveToArtDirectorReview">
        Request Art Director review
      </UiButton>

      <!-- Resubmit for Review -->
      <UiButton
        v-else-if="(workflowState === 'ad_changes_requested' || workflowState === 'cd_changes_requested') && can('resubmit')"
        variant="primary"
        icon="refresh"
        @click="handleResubmitForReview"
      >
        Resubmit for review
      </UiButton>
    </div>
  </UiPanel>

  <!-- History -->
  <UiDialog v-model:open="showHistoryModal" title="Review history">
    <p v-if="sortedHistory.length === 0" class="py-6 text-center text-ink-muted">No history available</p>

    <ol v-else class="history">
      <li v-for="(entry, index) in sortedHistory" :key="`history-${index}-${entry.timestamp}`" class="history-item">
        <span class="history-icon" :class="`history-icon-${historyTone(entry.action)}`" aria-hidden="true">
          <span class="material-symbols-outlined text-base">{{ historyIcon(entry) }}</span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-ink-strong">{{ getHistoryLabel(entry.stage, entry.action) }}</p>
          <p class="text-xs text-ink-secondary">
            <span class="font-medium">{{ entry.user }}</span>
            <span v-if="entry.versionLabel" class="ml-2 text-ink-muted">({{ entry.versionLabel }})</span>
          </p>
          <p class="text-xs text-ink-muted">{{ formatTimestamp(entry.timestamp) }}</p>
          <p v-if="entry.reason" class="mt-1 text-xs italic text-ink-secondary">Reason: {{ entry.reason }}</p>
        </div>
      </li>
    </ol>
  </UiDialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { UiButton, UiChip, UiDialog, UiPanel } from '../ui';
import { workflowLabel, workflowTone, WORKFLOW_LABELS } from './workflow.js';

const props = defineProps({
  workflowState: {
    type: String,
    default: 'draft'
  },
  // What the caller may do, from the server (review.allowedActions, docs/REVIEW_API.md)
  allowedActions: {
    type: Array,
    default: () => []
  },
  designer: {
    type: String,
    default: ''
  },
  reviewCompleted: {
    type: Boolean,
    default: false
  },
  workflowHistory: {
    type: Array,
    default: () => []
  },
  // Review stage to resubmit to after a rejection sent the review back to draft
  resubmitTarget: {
    type: String,
    default: null
  },
  // Drafts go straight to Art Director review
  bypassClientReview: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'workflow-approve',
  'workflow-reject',
  'workflow-move-to-client-review',
  'workflow-move-to-art-director-review',
  'workflow-resubmit',
  'workflow-completed'
]);

const showHistoryModal = ref(false);

// The server decides who may do what; the card only shows those controls
const can = (action) => props.allowedActions.includes(action);

const DRIVE_ACTIONS = ['move-to-client-review', 'move-to-art-director-review', 'resubmit', 'complete'];
const canDriveWorkflow = computed(() => DRIVE_ACTIONS.some(can));

const canApproveWorkflow = computed(() => can('approve') || can('reject'));

const getWorkflowActionText = () => {
  const state = props.workflowState;
  if (state === 'client_review') return 'Client Approval';
  if (state === 'art_director_review') return 'Approve for Creative Director Review';
  if (state === 'creative_director_review') return 'Approve and Release';
  return '';
};

// Workflow action handlers
const handleApprove = () => {
  emit('workflow-approve');
};

const handleReject = () => {
  emit('workflow-reject');
};

const handleMoveToClientReview = () => {
  emit('workflow-move-to-client-review');
};

const handleMoveToArtDirectorReview = () => {
  emit('workflow-move-to-art-director-review');
};

const handleResubmitForReview = () => {
  emit('workflow-resubmit');
};

const handleMarkCompleted = () => {
  emit('workflow-completed');
};

// History helper functions
const sortedHistory = computed(() => {
  if (!props.workflowHistory || !Array.isArray(props.workflowHistory) || props.workflowHistory.length === 0) {
    return [];
  }
  // Sort by timestamp, newest first
  const sorted = [...props.workflowHistory].sort((a, b) => {
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
  
  const actionLabels = {
    'uploaded': 'Uploaded',
    'created_from_url': 'Created from URL',
    'moved_to_review': 'Moved to Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'resubmitted': 'Resubmitted',
    'version_uploaded': 'Version Uploaded',
    'extended': 'Expiration Extended',
    'expiration_extended': 'Expiration Extended',
    'password_set': 'Password Set',
    'password_removed': 'Password Removed',
    'sharing_changed': 'Sharing Changed',
    'completed': 'Completed'
  };
  
  const stageLabel = WORKFLOW_LABELS[stage] || stage;
  const actionLabel = actionLabels[action] || action;
  
  // For version uploads, include version label if available
  if (action === 'version_uploaded') {
    return actionLabel;
  }
  
  return `${stageLabel} - ${actionLabel}`;
};

// History entry icon and tone
const HISTORY_ICONS = {
  uploaded: 'cloud_upload',
  created_from_url: 'cloud_upload',
  version_uploaded: 'difference',
  approved: 'approval',
  completed: 'done_all',
  rejected: 'source_notes',
  moved_to_review: 'graph_1',
  password_set: 'lock',
  password_removed: 'lock',
  resubmitted: 'refresh',
  sharing_changed: 'share',
};

const historyIcon = (entry) => {
  if (entry.action === 'extended' || entry.action === 'expiration_extended') {
    return !entry.days || entry.days <= 7 ? 'schedule' : 'calendar_today';
  }
  return HISTORY_ICONS[entry.action] || 'history';
};

const HISTORY_TONES = {
  uploaded: 'accent',
  created_from_url: 'accent',
  moved_to_review: 'accent',
  version_uploaded: 'info',
  extended: 'info',
  expiration_extended: 'info',
  resubmitted: 'info',
  approved: 'success',
  completed: 'success',
  rejected: 'warning',
  password_set: 'danger',
  password_removed: 'danger',
  sharing_changed: 'danger',
};

const historyTone = (action) => HISTORY_TONES[action] || 'neutral';
</script>

<style scoped>
.history {
  @apply flex flex-col gap-4;
}
.history-item {
  @apply flex items-start gap-3 text-sm;
}
.history-icon {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border;
}
.history-icon-neutral {
  @apply border-line bg-fill-subtle text-ink-secondary;
}
.history-icon-accent {
  @apply border-accent-highlight bg-accent-subtle text-accent-text;
}
.history-icon-info {
  @apply border-info-border bg-info-bg text-info;
}
.history-icon-success {
  @apply border-success-border bg-success-bg text-success;
}
.history-icon-warning {
  @apply border-warning-border bg-warning-bg text-warning;
}
.history-icon-danger {
  @apply border-danger-border bg-danger-bg text-danger;
}
</style>
