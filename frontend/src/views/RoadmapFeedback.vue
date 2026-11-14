<template>
  <PageShell>
    <PageHero
      eyebrow="Community"
      title="Roadmap and feedback"
      lead="See what's new, share your feedback, and track our roadmap for design system evolution."
      spot="site/roadmap-feedback"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="mainTabs" label="Roadmap and feedback">
      <!-- What's New Tab -->
      <template #whats-new>
        <PageSection title="Release notes" description="Latest features, improvements, and updates to the design system.">
          <template v-if="canEditReleaseNotes" #actions>
            <UiButton variant="primary" icon="add" @click="showReleaseNotesModal = true; editingReleaseNote = null">Add release note</UiButton>
          </template>

          <div v-if="releaseNotes.length" class="space-y-6">
            <UiPanel v-for="release in releaseNotes" :key="release.version" :title="`Version ${release.version}`" heading-tag="h3">
              <template #actions>
                <UiChip :tone="releaseTone[release.type] || 'neutral'">{{ release.type }}</UiChip>
                <span class="text-sm text-ink-muted">{{ formatDate(release.date) }}</span>
              </template>
              <p class="text-sm text-ink-secondary mb-4">{{ release.description }}</p>
              <div class="space-y-3">
                <template v-for="group in releaseGroups" :key="group.key">
                  <div v-if="release[group.key] && release[group.key].length > 0">
                    <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="group.text">
                      <span class="material-symbols-outlined text-base" aria-hidden="true">{{ group.icon }}</span>
                      {{ group.label }}
                    </h4>
                    <ul class="space-y-1 ml-6 list-disc text-sm text-ink">
                      <li v-for="entry in release[group.key]" :key="entry">{{ entry }}</li>
                    </ul>
                  </div>
                </template>
              </div>
            </UiPanel>
          </div>
          <UiEmptyState
            v-else
            title="No release notes yet"
            body="Release notes will appear here as new versions are published."
            spot="site/roadmap-feedback"
          />
        </PageSection>
      </template>

      <!-- Roadmap Tab -->
      <template #roadmap>
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <UiSegmented v-model="statusFilter" :options="statusFilterOptions" aria-label="Filter roadmap items by status" />
          <UiButton v-if="canEditRoadmap" variant="primary" icon="add" @click="showCreateModal = true">Add item</UiButton>
        </div>

        <div v-if="filteredRoadmapItems.length" class="space-y-4">
          <UiPanel v-for="item in filteredRoadmapItems" :key="item.id" :title="item.title" heading-tag="h3">
            <template v-if="canEditRoadmap" #actions>
              <UiButton variant="ghost" size="sm" icon="edit" icon-only :label="`Edit ${item.title}`" @click="editRoadmapItem(item)" />
              <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Delete ${item.title}`" @click="deleteRoadmapItem(item.id)" />
            </template>
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <UiChip :tone="roadmapStatusTone[item.status] || 'info'">{{ item.status }}</UiChip>
              <UiChip :tone="priorityTone[item.priority] || 'warning'">{{ item.priority }} priority</UiChip>
              <UiChip :tone="categoryTone[item.category] || 'accent'">{{ item.category }}</UiChip>
            </div>
            <p class="text-sm text-ink-secondary mb-3">{{ item.description }}</p>
            <div class="flex items-center gap-4 text-xs text-ink-muted">
              <span v-if="item.targetDate" class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
                Target: {{ formatDate(item.targetDate) }}
              </span>
              <span v-if="item.votes !== undefined" class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">thumb_up</span>
                {{ item.votes }} votes
              </span>
            </div>
          </UiPanel>
        </div>
        <UiEmptyState
          v-else
          title="No roadmap items"
          :body="statusFilter === 'all' ? 'Create your first roadmap item to get started.' : `No items with status &quot;${statusFilter}&quot;.`"
          spot="site/roadmap-feedback"
        >
          <template v-if="statusFilter === 'all' && canEditRoadmap" #actions>
            <UiButton variant="primary" @click="showCreateModal = true">Add item</UiButton>
          </template>
        </UiEmptyState>
      </template>

      <!-- Feedback Tab -->
      <template #feedback>
        <div class="mb-8 flex flex-wrap gap-3">
          <UiButton variant="primary" icon="add_circle" @click="openRequestModal">Request feature</UiButton>
          <UiButton icon="bug_report" @click="openIssueModal">Report issue</UiButton>
          <UiButton variant="ghost" icon="refresh" @click="loadRequests">Refresh</UiButton>
        </div>

        <UiTabs v-model="feedbackTab" :tabs="feedbackTabs" label="Feedback">
          <template #requests>
            <UiSpinner v-if="loadingRequests" label="Loading requests…" />
            <UiEmptyState
              v-else-if="requests.length === 0"
              title="No requests yet"
              body="No requests yet. Be the first to request a feature!"
              spot="site/contribute"
            />
            <ul v-else class="space-y-4">
              <li v-for="request in requests" :key="request.id" class="request-card" @click="openRequestDetails(request)">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-ink-strong">
                        <button type="button" class="request-title" @click.stop="openRequestDetails(request)">{{ request.title }}</button>
                      </h3>
                      <UiChip :tone="requestStatusTone(request.status)">{{ request.status }}</UiChip>
                      <UiChip v-if="request.priority" :tone="priorityTone[request.priority] || 'warning'">{{ request.priority }}</UiChip>
                    </div>
                    <p class="text-sm text-ink-secondary mb-3">{{ request.description }}</p>
                    <div class="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                      <span>Requested by {{ request.requestedBy }}</span>
                      <span>{{ formatDate(request.createdAt) }}</span>
                      <span v-if="request.assignedTo">Assigned to {{ request.assignedTo }}</span>
                      <span v-if="request.componentId" class="text-accent-text">Linked to component</span>
                    </div>
                  </div>
                  <UiButton
                    size="sm"
                    :variant="isUserVoted(request.id) ? 'primary' : 'secondary'"
                    icon="thumb_up"
                    :aria-pressed="isUserVoted(request.id)"
                    :aria-label="`Vote for ${request.title}: ${request.votes} votes`"
                    @click.stop="voteRequest(request.id)"
                  >
                    {{ request.votes }}
                  </UiButton>
                </div>
                <p v-if="request.comments && request.comments.length > 0" class="mt-4 pt-4 border-t border-line-faint text-xs text-ink-muted">
                  {{ request.comments.length }} comment{{ request.comments.length !== 1 ? 's' : '' }}
                </p>
              </li>
            </ul>
          </template>

          <template #issues>
            <UiSpinner v-if="loadingIssues" label="Loading issues…" />
            <UiEmptyState
              v-else-if="issues.length === 0"
              title="No issues reported"
              body="No issues reported. Great job!"
              spot="site/system-health"
            />
            <div v-else class="space-y-4">
              <UiPanel v-for="issue in issues" :key="issue.id" :title="issue.title" heading-tag="h3">
                <template #actions>
                  <UiChip :tone="severityTone[issue.severity] || 'neutral'">{{ issue.severity }}</UiChip>
                  <UiChip :tone="requestStatusTone(issue.status)">{{ issue.status }}</UiChip>
                </template>
                <p class="text-sm text-ink-secondary mb-3">{{ issue.description }}</p>
                <div class="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  <span>Reported by {{ issue.reportedBy }}</span>
                  <span>{{ formatDate(issue.createdAt) }}</span>
                  <span v-if="issue.componentId">Component: {{ issue.componentId }}</span>
                  <span v-if="issue.assignedTo">Assigned to {{ issue.assignedTo }}</span>
                </div>
              </UiPanel>
            </div>
          </template>
        </UiTabs>
      </template>
    </UiTabs>

    <!-- Roadmap Create/Edit Modal -->
    <UiDialog v-model:open="roadmapModalOpen" :title="editingRoadmapItem ? 'Edit roadmap item' : 'Create roadmap item'">
      <InlineNotice :notice="formNotice" class="mb-4" @dismiss="clearFormNotice" />
      <form id="roadmap-item-form" class="space-y-4" @submit.prevent="saveRoadmapItem">
        <UiInput v-model="roadmapForm.title" label="Title" required placeholder="e.g., Dark Mode Support" />
        <UiTextarea v-model="roadmapForm.description" label="Description" required :rows="4" placeholder="Describe the roadmap item..." />
        <div class="grid grid-cols-2 gap-4">
          <UiSelect v-model="roadmapForm.category" label="Category" required :options="roadmapCategoryOptions" />
          <UiSelect v-model="roadmapForm.priority" label="Priority" required :options="roadmapPriorityOptions" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UiSelect v-model="roadmapForm.status" label="Status" required :options="roadmapStatusOptions" />
          <UiInput v-model="roadmapForm.targetDate" type="date" label="Target date" />
        </div>
      </form>
      <template #footer>
        <UiButton @click="closeRoadmapModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="roadmap-item-form">{{ editingRoadmapItem ? 'Update item' : 'Create item' }}</UiButton>
      </template>
    </UiDialog>

    <!-- Request Modal -->
    <UiDialog v-model:open="showRequestModal" title="Request new feature">
      <InlineNotice :notice="formNotice" class="mb-4" @dismiss="clearFormNotice" />
      <form id="feature-request-form" class="space-y-4" @submit.prevent="submitRequest">
        <UiInput id="request-title" v-model="requestForm.title" label="Title" required placeholder="e.g., Data Table Component" />
        <UiTextarea
          id="request-description"
          v-model="requestForm.description"
          label="Description"
          required
          :rows="4"
          placeholder="Describe the component or feature you'd like to see..."
        />
        <UiTextarea
          id="request-use-case"
          v-model="requestForm.useCase"
          label="Detailed use case"
          :rows="5"
          placeholder="Provide a detailed use case: What problem does this solve? Where would it be used? What are the specific requirements?"
          hint="Include: Problem statement, use cases, specific requirements, and any design considerations."
        />
        <UiSelect
          id="request-category"
          v-model="requestForm.category"
          label="Category"
          required
          placeholder="Select category"
          :options="categoryOptions.filter((option) => option.value)"
        />
        <UiSelect id="request-priority" v-model="requestForm.priority" label="Priority" :options="priorityOptions" />
      </form>
      <template #footer>
        <UiButton @click="showRequestModal = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="feature-request-form" :loading="submittingRequest">
          {{ submittingRequest ? 'Submitting...' : 'Submit request' }}
        </UiButton>
      </template>
    </UiDialog>

    <!-- Issue Modal -->
    <UiDialog v-model:open="showIssueModal" title="Report issue">
      <InlineNotice :notice="formNotice" class="mb-4" @dismiss="clearFormNotice" />
      <form id="issue-report-form" class="space-y-4" @submit.prevent="submitIssue">
        <UiInput id="issue-title" v-model="issueForm.title" label="Title" required placeholder="Brief description of the issue" />
        <UiTextarea id="issue-description" v-model="issueForm.description" label="Description" required :rows="4" placeholder="Describe the issue in detail..." />
        <UiSelect
          id="issue-category"
          v-model="issueForm.category"
          label="Category"
          required
          placeholder="Select category"
          :options="issueCategoryOptions.filter((option) => option.value)"
        />
        <UiSelect id="issue-severity" v-model="issueForm.severity" label="Severity" required :options="severityOptions" />
      </form>
      <template #footer>
        <UiButton @click="showIssueModal = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="issue-report-form" :loading="submittingIssue">
          {{ submittingIssue ? 'Submitting...' : 'Submit issue' }}
        </UiButton>
      </template>
    </UiDialog>

    <!-- Request Details Modal -->
    <UiDialog v-model:open="requestDetailsOpen" :title="selectedRequest ? selectedRequest.title : 'Request'" size="lg">
      <div v-if="selectedRequest" class="space-y-6">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />
        <section>
          <h3 class="text-sm font-medium text-ink-secondary mb-2">Description</h3>
          <p class="text-ink">{{ selectedRequest.description }}</p>
        </section>
        <section v-if="selectedRequest.useCase">
          <h3 class="text-sm font-medium text-ink-secondary mb-2">Use case</h3>
          <p class="text-ink">{{ selectedRequest.useCase }}</p>
        </section>
        <div class="grid grid-cols-2 gap-4">
          <section>
            <h3 class="text-sm font-medium text-ink-secondary mb-2">Status</h3>
            <UiChip :tone="requestStatusTone(selectedRequest.status)">{{ selectedRequest.status }}</UiChip>
          </section>
          <section>
            <h3 class="text-sm font-medium text-ink-secondary mb-2">Priority</h3>
            <UiChip :tone="priorityTone[selectedRequest.priority] || 'warning'">{{ selectedRequest.priority }}</UiChip>
          </section>
        </div>

        <!-- Approval Workflow -->
        <section
          v-if="selectedRequest.metadata && (selectedRequest.status === 'under-review' || selectedRequest.status === 'approved')"
          class="p-4 rounded-tile border border-line-faint bg-surface-sunken"
        >
          <h3 class="text-sm font-medium text-ink mb-4">Approval workflow</h3>
          <ul class="space-y-3">
            <li v-for="step in approvalSteps" :key="step.stage" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-2 text-sm text-ink">
                <span class="material-symbols-outlined text-lg" :class="step.done ? 'text-success' : 'text-ink-muted'" aria-hidden="true">
                  {{ step.done ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                {{ step.label }}
              </span>
              <span v-if="step.approved" class="text-xs text-success">Approved</span>
              <UiButton v-else-if="step.canAct" variant="primary" size="sm" @click="approveRequest(selectedRequest.id, step.stage)">
                {{ step.action }}
              </UiButton>
            </li>
          </ul>
        </section>

        <!-- Status Transition Actions -->
        <div v-if="canApprove" class="flex gap-2 flex-wrap">
          <UiButton v-if="selectedRequest.status === 'submitted'" variant="primary" size="sm" @click="transitionStatus(selectedRequest.id, 'under-review')">Start review</UiButton>
          <UiButton v-if="selectedRequest.status === 'approved'" variant="primary" size="sm" @click="transitionStatus(selectedRequest.id, 'in-progress')">Start implementation</UiButton>
          <UiButton v-if="selectedRequest.status === 'in-progress'" variant="primary" size="sm" @click="transitionStatus(selectedRequest.id, 'completed')">Mark complete</UiButton>
          <UiButton v-if="selectedRequest.status === 'completed'" variant="primary" size="sm" @click="transitionStatus(selectedRequest.id, 'released')">Release</UiButton>
          <UiButton
            v-if="['submitted', 'under-review', 'needs-more-info'].includes(selectedRequest.status)"
            variant="danger"
            size="sm"
            @click="showRejectModal = true"
          >
            Reject
          </UiButton>
        </div>

        <section v-if="selectedRequest.comments && selectedRequest.comments.length > 0">
          <h3 class="text-sm font-medium text-ink-secondary mb-4">Comments</h3>
          <ul class="space-y-4">
            <li v-for="comment in selectedRequest.comments" :key="comment.id" class="p-4 rounded-tile bg-surface-sunken">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-ink-strong">{{ comment.author }}</span>
                <span class="text-xs text-ink-muted">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="text-ink">{{ comment.content }}</p>
            </li>
          </ul>
        </section>

        <form class="flex items-end gap-2" @submit.prevent="addComment(selectedRequest.id)">
          <div class="flex-1">
            <UiInput v-model="newComment" label="Add comment" placeholder="Add a comment..." />
          </div>
          <UiButton variant="primary" type="submit">Comment</UiButton>
        </form>
      </div>
    </UiDialog>

    <!-- Reject Request Modal -->
    <UiDialog v-model:open="showRejectModal" title="Reject request" size="sm">
      <UiTextarea
        v-model="rejectReason"
        label="Reason for rejection"
        required
        :rows="4"
        placeholder="Please provide a reason for rejecting this request..."
      />
      <template #footer>
        <UiButton @click="showRejectModal = false">Cancel</UiButton>
        <UiButton variant="danger" :disabled="!rejectReason.trim()" @click="rejectRequest(selectedRequest?.id, rejectReason)">Reject request</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiTabs,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import { useAuth } from '../composables/useAuth.js';

// Page messages, and messages shown inside the open dialog
const { notice, showNotice, clearNotice } = useNotice();
const { notice: formNotice, showNotice: showFormNotice, clearNotice: clearFormNotice } = useNotice();

const mainTabs = [
  { value: 'whats-new', label: "What's new" },
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'feedback', label: 'Feedback and requests' },
];
const feedbackTabs = [
  { value: 'requests', label: 'Feature requests' },
  { value: 'issues', label: 'Reported issues' },
];
const statusFilterOptions = ['all', 'planned', 'in-progress', 'completed', 'cancelled'].map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

const releaseGroups = [
  { key: 'features', label: 'New features', icon: 'add_circle', text: 'text-success' },
  { key: 'improvements', label: 'Improvements', icon: 'trending_up', text: 'text-info' },
  { key: 'fixes', label: 'Bug fixes', icon: 'bug_report', text: 'text-warning' },
  { key: 'breaking', label: 'Breaking changes', icon: 'warning', text: 'text-danger' },
];

const roadmapCategoryOptions = [
  { value: 'feature', label: 'Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug-fix', label: 'Bug Fix' },
  { value: 'deprecation', label: 'Deprecation' },
  { value: 'integration', label: 'Integration' },
];
const roadmapPriorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];
const roadmapStatusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const activeTab = ref('whats-new');
const feedbackTab = ref('requests');
const statusFilter = ref('all');
const showCreateModal = ref(false);
const editingRoadmapItem = ref(null);
const showRequestModal = ref(false);
const showIssueModal = ref(false);
const showReleaseNotesModal = ref(false);
const editingReleaseNote = ref(null);
const loadingRequests = ref(false);
const loadingIssues = ref(false);
const submittingRequest = ref(false);
const submittingIssue = ref(false);
const selectedRequest = ref(null);
const newComment = ref('');
const canEditRoadmap = ref(false);
const canEditReleaseNotes = ref(false);
const canApprove = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref('');
const requestAnalytics = ref(null);
const loadingAnalytics = ref(false);

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

// What the signed-in user may do here comes from their RBAC permissions
// (docs/AUTH.md). The server enforces the same permissions.
const { user: authUser, hasPermission } = useAuth();
// Sent where the API still expects an id; the server takes identity from the token
const currentUserId = computed(() => authUser.value?.id ?? '');
const currentUserName = computed(() => authUser.value?.name || authUser.value?.email || '');

const checkPermissions = async () => {
  const canEdit = hasPermission('roadmap:edit');
  canEditRoadmap.value = canEdit;
  canEditReleaseNotes.value = canEdit; // Same permission for release notes
  canApprove.value = canEdit;
};

const releaseNotes = ref([
  {
    version: '2.1.0',
    type: 'minor',
    date: '2024-01-20',
    description: 'Enhanced component playground integration and improved feedback system.',
    features: [
      'Integrated interactive playground into component pages',
      'Added props editor and live preview to component documentation',
      'Combined roadmap and feedback into unified page',
      'Added "What\'s New" release notes section'
    ],
    improvements: [
      'Improved code export functionality (Vue, React, HTML)',
      'Enhanced dark mode support across all pages',
      'Better mobile responsiveness'
    ],
    fixes: [
      'Fixed component preview rendering issues',
      'Resolved code generation formatting problems'
    ]
  },
  {
    version: '2.0.0',
    type: 'major',
    date: '2024-01-15',
    description: 'Major update with new governance features and enhanced design system tools.',
    features: [
      'Design System Governance and Compliance Scanner',
      'Component Request Workflow',
      'Performance Budgets',
      'Bundle Size Analysis',
      'Public Roadmap',
      'AI-Powered Design System Assistant (Eero)'
    ],
    improvements: [
      'Enhanced component versioning system',
      'Improved token management',
      'Better accessibility compliance checking'
    ],
    fixes: [
      'Fixed various dark mode issues',
      'Resolved navigation drawer problems'
    ]
  },
  {
    version: '1.5.0',
    type: 'minor',
    date: '2024-01-01',
    description: 'New tools and improvements to the design system.',
    features: [
      'Color Scale Generator',
      'Color Converter',
      'Color Contrast Checker',
      'Icon Library with Lucide icons',
      'Token Studio with Style Dictionary support'
    ],
    improvements: [
      'Enhanced color utilities',
      'Improved icon management',
      'Better token organization'
    ]
  }
]);

// Roadmap Data
const roadmapItems = ref([]);
const roadmapForm = ref({
  title: '',
  description: '',
  category: 'feature',
  priority: 'medium',
  status: 'planned',
  targetDate: ''
});

// Request/Issue Data
const requests = ref([]);
const issues = ref([]);
const userVotes = ref(new Set());

const requestForm = ref({
  title: '',
  description: '',
  useCase: '',
  category: '',
  priority: 'medium'
});

const issueForm = ref({
  category: '',
  title: '',
  severity: 'medium',
  description: ''
});

// Dropdown options
const categoryOptions = ref([
  { value: '', label: 'Select category' },
  { value: 'form-controls', label: 'Form Controls' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'utilities', label: 'Utilities' }
]);

const priorityOptions = ref([
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]);

const issueCategoryOptions = ref([
  { value: '', label: 'Select category' },
  { value: 'bug', label: 'Bug' },
  { value: 'components', label: 'Components' },
  { value: 'tokens', label: 'Tokens' },
  { value: 'guidelines', label: 'Guidelines' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' }
]);

const severityOptions = ref([
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]);

const filteredRoadmapItems = computed(() => {
  if (statusFilter.value === 'all') return roadmapItems.value;
  return roadmapItems.value.filter(item => item.status === statusFilter.value);
});





const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Roadmap Functions
const loadRoadmap = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/roadmap`);
    roadmapItems.value = response.data;
  } catch (error) {
    console.error('Error loading roadmap:', error);
  }
};

const saveRoadmapItem = async () => {
  try {
    if (editingRoadmapItem.value) {
      await apiClient.put(
        `${API_BASE_URL}/roadmap/items/${editingRoadmapItem.value.id}`,
        roadmapForm.value
      );
    } else {
      await apiClient.post(
        `${API_BASE_URL}/roadmap/items`,
        roadmapForm.value
      );
    }
    closeRoadmapModal();
    loadRoadmap();
  } catch (error) {
    console.error('Error saving roadmap item:', error);
    showFormNotice('Error saving roadmap item. Please try again.', 'error');
  }
};

const editRoadmapItem = (item) => {
  editingRoadmapItem.value = item;
  roadmapForm.value = {
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    status: item.status,
    targetDate: item.targetDate || ''
  };
  showCreateModal.value = true;
};

const deleteRoadmapItem = async (id) => {
  if (!confirm('Are you sure you want to delete this roadmap item?')) return;
  
  try {
    await apiClient.delete(`${API_BASE_URL}/roadmap/items/${id}`);
    loadRoadmap();
  } catch (error) {
    console.error('Error deleting item:', error);
    showNotice('Error deleting roadmap item. Please try again.', 'error');
  }
};

const closeRoadmapModal = () => {
  showCreateModal.value = false;
  editingRoadmapItem.value = null;
  roadmapForm.value = {
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    status: 'planned',
    targetDate: ''
  };
};

// Request/Issue Functions
const loadRequests = async () => {
  loadingRequests.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/component-requests`);
    requests.value = response.data || [];
    requests.value.forEach(req => {
      if (req.voters && req.voters.includes(currentUserId.value)) {
        userVotes.value.add(req.id);
      }
    });
  } catch (error) {
    console.error('Error loading requests:', error);
    // Fallback to empty array if API fails
    requests.value = [];
  } finally {
    loadingRequests.value = false;
  }
};

const loadIssues = async () => {
  loadingIssues.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/issues`);
    issues.value = response.data || [];
  } catch (error) {
    console.error('Error loading issues:', error);
  } finally {
    loadingIssues.value = false;
  }
};

const submitRequest = async () => {
  if (!requestForm.value.title || !requestForm.value.description || !requestForm.value.category) {
    showFormNotice('Please fill in all required fields (Title, Description, and Category)', 'error');
    return;
  }

  submittingRequest.value = true;
  try {
    // Check for duplicates first (optional - don't fail if endpoint isn't available)
    try {
      const duplicateCheck = await apiClient.get(
        `${API_BASE_URL}/component-requests/duplicates`,
        {
          params: {
            title: requestForm.value.title,
            description: requestForm.value.description,
          }
        }
      );

      // If duplicates found, show warning but allow submission
      if (duplicateCheck.data.similar && duplicateCheck.data.similar.length > 0) {
        const similarTitles = duplicateCheck.data.similar.map(s => s.title).join(', ');
        const proceed = confirm(
          `Similar requests found:\n${similarTitles}\n\nDo you want to submit anyway?`
        );
        if (!proceed) {
          submittingRequest.value = false;
          return;
        }
      }
    } catch (duplicateError) {
      // Silently continue if duplicate check fails (endpoint might not be available yet)
      console.warn('Duplicate check failed, continuing with submission:', duplicateError);
    }

    const response = await apiClient.post(
      `${API_BASE_URL}/component-requests`,
      {
        title: requestForm.value.title,
        description: requestForm.value.description,
        useCase: requestForm.value.useCase || undefined,
        requestedBy: currentUserId.value,
        category: requestForm.value.category,
        priority: requestForm.value.priority || 'medium',
      }
    );

    // Handle duplicate warning response
    if (response.data.duplicateWarning) {
      const similarTitles = response.data.similarRequests.map(s => s.title).join(', ');
      showNotice(`Request submitted, but similar requests exist: ${similarTitles}`, 'warning');
      requests.value.unshift(response.data.request);
    } else {
      requests.value.unshift(response.data);
    }

    requestForm.value = { title: '', description: '', useCase: '', category: '', priority: 'medium' };
    showRequestModal.value = false;
  } catch (error) {
    console.error('Error submitting request:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    showFormNotice(`Failed to submit request: ${errorMessage}`, 'error');
  } finally {
    submittingRequest.value = false;
  }
};

const submitIssue = async () => {
  if (!issueForm.value.title || !issueForm.value.description || !issueForm.value.category) {
    return;
  }

  submittingIssue.value = true;
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/issues`,
      {
        title: issueForm.value.title,
        description: issueForm.value.description,
        category: issueForm.value.category,
        severity: issueForm.value.severity,
        reportedBy: currentUserId.value
      }
    );

    issues.value.unshift(response.data);
    issueForm.value = { category: '', title: '', severity: 'medium', description: '' };
    showIssueModal.value = false;
  } catch (error) {
    console.error('Error submitting issue:', error);
    showFormNotice('Failed to submit issue. Please try again.', 'error');
  } finally {
    submittingIssue.value = false;
  }
};

const voteRequest = async (requestId) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/component-requests/${requestId}/vote`,
      { userId: currentUserId.value }
    );

    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      request.votes = response.data.votes;
      request.voters = response.data.voters;
      
      if (userVotes.value.has(requestId)) {
        userVotes.value.delete(requestId);
      } else {
        userVotes.value.add(requestId);
      }
    }
  } catch (error) {
    console.error('Error voting:', error);
  }
};

const isUserVoted = (requestId) => {
  return userVotes.value.has(requestId);
};

const openRequestDetails = async (request) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/component-requests/${request.id}`);
    selectedRequest.value = response.data;
  } catch (error) {
    console.error('Error loading request details:', error);
    selectedRequest.value = request;
  }
};

const addComment = async (requestId) => {
  if (!newComment.value.trim()) return;

  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/component-requests/${requestId}/comments`,
      {
        author: currentUserName.value,
        content: newComment.value
      }
    );

    if (selectedRequest.value) {
      if (!selectedRequest.value.comments) {
        selectedRequest.value.comments = [];
      }
      selectedRequest.value.comments.push(response.data);
    }

    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      if (!request.comments) {
        request.comments = [];
      }
      request.comments.push(response.data);
    }

    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

// Status transition
const transitionStatus = async (requestId, newStatus) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/component-requests/${requestId}/status`,
      {
        status: newStatus,
        userId: currentUserId.value,
        comment: `Status changed to ${newStatus}`
      }
    );

    // Update in list
    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      request.status = response.data.status;
      request.updatedAt = response.data.updatedAt;
    }

    // Update in selected request
    if (selectedRequest.value && selectedRequest.value.id === requestId) {
      selectedRequest.value = response.data;
    }
  } catch (error) {
    console.error('Error transitioning status:', error);
    showFormNotice(error.response?.data?.message || 'Failed to change status', 'error');
  }
};

// Approve request
const approveRequest = async (requestId, stage) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/component-requests/${requestId}/approve`,
      {
        userId: currentUserId.value,
        stage: stage
      }
    );

    // Update in list
    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      request.status = response.data.status;
      request.metadata = response.data.metadata;
      request.updatedAt = response.data.updatedAt;
    }

    // Update in selected request
    if (selectedRequest.value && selectedRequest.value.id === requestId) {
      selectedRequest.value = response.data;
    }
  } catch (error) {
    console.error('Error approving request:', error);
    showFormNotice(error.response?.data?.message || 'Failed to approve request', 'error');
  }
};

// Reject request
const rejectRequest = async (requestId, reason) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/component-requests/${requestId}/reject`,
      {
        userId: currentUserId.value,
        reason: reason
      }
    );

    // Update in list
    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      request.status = response.data.status;
      request.updatedAt = response.data.updatedAt;
    }

    // Update in selected request
    if (selectedRequest.value && selectedRequest.value.id === requestId) {
      selectedRequest.value = response.data;
    }

    showRejectModal.value = false;
    rejectReason.value = '';
  } catch (error) {
    console.error('Error rejecting request:', error);
    showFormNotice(error.response?.data?.message || 'Failed to reject request', 'error');
  }
};

// Load analytics
const loadAnalytics = async () => {
  loadingAnalytics.value = true;
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/component-requests/analytics`
    );
    requestAnalytics.value = response.data;
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loadingAnalytics.value = false;
  }
};

// Chip tones for statuses, priorities and categories
const releaseTone = { major: 'accent', minor: 'info' };
const roadmapStatusTone = { planned: 'info', 'in-progress': 'warning', completed: 'success', cancelled: 'neutral' };
const priorityTone = { critical: 'danger', high: 'danger', medium: 'warning', low: 'neutral' };
const categoryTone = { feature: 'accent', improvement: 'info', 'bug-fix': 'danger', deprecation: 'warning', integration: 'info' };
const severityTone = { low: 'info', medium: 'warning', high: 'warning', critical: 'danger' };
const requestStatusTones = {
  submitted: 'info',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'danger',
  'needs-more-info': 'warning',
  'in-progress': 'accent',
  completed: 'success',
  released: 'accent',
  open: 'danger',
  investigating: 'warning',
  resolved: 'success',
  closed: 'neutral',
};
const requestStatusTone = (status) => requestStatusTones[status] || 'neutral';

const approvalSteps = computed(() => {
  const r = selectedRequest.value;
  if (!r || !r.metadata) return [];
  const { designApproved, technicalApproved } = r.metadata;
  const finalDone = designApproved && technicalApproved && r.status === 'approved';
  return [
    { stage: 'design', label: 'Design review', done: designApproved, approved: designApproved, canAct: canApprove.value, action: 'Approve' },
    { stage: 'technical', label: 'Technical review', done: technicalApproved, approved: technicalApproved, canAct: canApprove.value, action: 'Approve' },
    {
      stage: 'final',
      label: 'Final approval',
      done: finalDone,
      approved: r.status === 'approved',
      canAct: canApprove.value && designApproved && technicalApproved,
      action: 'Final approve',
    },
  ];
});

const roadmapModalOpen = computed({
  get: () => showCreateModal.value || !!editingRoadmapItem.value,
  set: (open) => {
    if (!open) closeRoadmapModal();
  },
});

const requestDetailsOpen = computed({
  get: () => !!selectedRequest.value,
  set: (open) => {
    if (!open) selectedRequest.value = null;
  },
});

const openRequestModal = () => {
  clearFormNotice();
  showRequestModal.value = true;
};
const openIssueModal = () => {
  clearFormNotice();
  showIssueModal.value = true;
};

onMounted(async () => {
  await checkPermissions();
  loadRoadmap();
  loadRequests();
  loadIssues();
  loadAnalytics();
});
</script>

<style scoped>
.request-card {
  @apply p-6 rounded-card border border-line-faint bg-surface-raised cursor-pointer transition-colors hover:border-line;
}
.request-title {
  @apply text-left rounded-control hover:text-accent-text focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
