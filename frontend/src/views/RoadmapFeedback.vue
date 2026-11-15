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
        <PageSection
          title="Release notes"
          description="Changes to components, tokens and patterns, grouped by the version they were released in. They come from the design system changelog."
        >
          <UiSpinner v-if="loadingReleaseNotes" label="Loading release notes…" />
          <div v-else-if="releaseNotes.length" class="space-y-6">
            <UiPanel v-for="release in releaseNotes" :key="release.version" :title="`Version ${release.version}`" heading-tag="h3">
              <template #actions>
                <UiChip v-if="release.breaking.length" tone="danger">Breaking</UiChip>
                <span class="text-sm text-ink-muted">{{ formatDate(release.date) }}</span>
              </template>
              <p class="text-sm text-ink-secondary mb-4">{{ release.count }} {{ release.count === 1 ? 'change' : 'changes' }}</p>
              <div class="space-y-3">
                <template v-for="group in releaseGroups" :key="group.key">
                  <div v-if="release[group.key].length">
                    <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="group.text">
                      <AppIcon :name="group.icon" class="text-base" />
                      {{ group.label }}
                    </h4>
                    <ul class="space-y-1 ml-6 list-disc text-sm text-ink">
                      <li v-for="entry in release[group.key]" :key="entry.id">
                        <UiLink v-if="entry.link" :to="entry.link">{{ entry.text }}</UiLink>
                        <template v-else>{{ entry.text }}</template>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </UiPanel>
          </div>
          <UiEmptyState
            v-else
            title="No release notes yet"
            :body="releaseNotesError
              ? 'The changelog could not be loaded, so release notes are not shown. Try again later.'
              : 'Release notes appear here when components, tokens or patterns change with a version number.'"
            spot="site/roadmap-feedback"
          />
        </PageSection>
      </template>

      <!-- Roadmap Tab -->
      <template #roadmap>
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <UiSegmented v-model="statusFilter" :options="statusFilterOptions" aria-label="Filter roadmap items by status" />
          <UiButton v-if="canEditRoadmap" variant="primary" icon="plus" @click="showCreateModal = true">Add item</UiButton>
        </div>

        <div v-if="filteredRoadmapItems.length" class="space-y-4">
          <UiPanel v-for="item in filteredRoadmapItems" :key="item.id" :title="item.title" heading-tag="h3">
            <template v-if="canEditRoadmap" #actions>
              <UiButton variant="ghost" size="sm" icon="pencil" icon-only :label="`Edit ${item.title}`" @click="editRoadmapItem(item)" />
              <UiButton variant="ghost" size="sm" icon="trash-2" icon-only :label="`Delete ${item.title}`" @click="deleteRoadmapItem(item.id)" />
            </template>
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <UiChip :tone="roadmapStatusTone[item.status] || 'info'">{{ item.status }}</UiChip>
              <UiChip :tone="priorityTone[item.priority] || 'warning'">{{ item.priority }} priority</UiChip>
              <UiChip :tone="categoryTone[item.category] || 'accent'">{{ item.category }}</UiChip>
            </div>
            <p class="text-sm text-ink-secondary mb-3">{{ item.description }}</p>
            <div class="flex items-center gap-4 text-xs text-ink-muted">
              <span v-if="item.targetDate" class="flex items-center gap-1">
                <AppIcon name="clock" class="text-sm" />
                Target: {{ formatDate(item.targetDate) }}
              </span>
              <span v-if="item.votes !== undefined" class="flex items-center gap-1">
                <AppIcon name="thumbs-up" class="text-sm" />
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
          <UiButton icon="bug" @click="openIssueModal">Report issue</UiButton>
        </div>

        <UiTabs v-model="feedbackTab" :tabs="feedbackTabs" label="Feedback">
          <template #requests>
            <ComponentRequests />
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

  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import ComponentRequests from '../components/feedback/ComponentRequests.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiLink,
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
import { buildReleaseNotes } from '../utils/releaseNotes.js';

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
  { key: 'breaking', label: 'Breaking changes', icon: 'triangle-alert', text: 'text-danger' },
  { key: 'features', label: 'New', icon: 'circle-plus', text: 'text-success' },
  { key: 'improvements', label: 'Updated', icon: 'trending-up', text: 'text-info' },
  { key: 'deprecations', label: 'Deprecated or removed', icon: 'circle-minus', text: 'text-warning' },
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
const showIssueModal = ref(false);
const loadingIssues = ref(false);
const submittingIssue = ref(false);
const canEditRoadmap = ref(false);

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

// What the signed-in user may do here comes from their RBAC permissions
// (docs/AUTH.md). The server enforces the same permissions.
const { user: authUser, hasPermission } = useAuth();
// Sent where the API still expects an id; the server takes identity from the token
const currentUserId = computed(() => authUser.value?.id ?? '');

const checkPermissions = async () => {
  const canEdit = hasPermission('roadmap:edit');
  canEditRoadmap.value = canEdit;
};

// Release notes come from the changelog, grouped by version
const releaseNotes = ref([]);
const loadingReleaseNotes = ref(false);
const releaseNotesError = ref(false);

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

// Issue Data
const issues = ref([]);

const issueForm = ref({
  category: '',
  title: '',
  severity: 'medium',
  description: ''
});

// Dropdown options
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

const loadReleaseNotes = async () => {
  loadingReleaseNotes.value = true;
  releaseNotesError.value = false;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/changelog/entries`);
    releaseNotes.value = buildReleaseNotes(response.data || []);
  } catch (error) {
    console.error('Error loading release notes:', error);
    releaseNotes.value = [];
    releaseNotesError.value = true;
  } finally {
    loadingReleaseNotes.value = false;
  }
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

// Issue Functions
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

// Chip tones for statuses, priorities and categories
const roadmapStatusTone = { planned: 'info', 'in-progress': 'warning', completed: 'success', cancelled: 'neutral' };
const priorityTone = { critical: 'danger', high: 'danger', medium: 'warning', low: 'neutral' };
const categoryTone = { feature: 'accent', improvement: 'info', 'bug-fix': 'danger', deprecation: 'warning', integration: 'info' };
const severityTone = { low: 'info', medium: 'warning', high: 'warning', critical: 'danger' };
const requestStatusTones = {
  'in-progress': 'accent',
  open: 'danger',
  investigating: 'warning',
  resolved: 'success',
  closed: 'neutral',
};
const requestStatusTone = (status) => requestStatusTones[status] || 'neutral';

const roadmapModalOpen = computed({
  get: () => showCreateModal.value || !!editingRoadmapItem.value,
  set: (open) => {
    if (!open) closeRoadmapModal();
  },
});

const openIssueModal = () => {
  clearFormNotice();
  showIssueModal.value = true;
};

onMounted(async () => {
  await checkPermissions();
  loadReleaseNotes();
  loadRoadmap();
  loadIssues();
});
</script>
