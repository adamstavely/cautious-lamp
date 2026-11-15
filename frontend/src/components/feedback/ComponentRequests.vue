<template>
  <div>
    <div class="mb-6 flex flex-wrap gap-3">
      <UiButton variant="primary" icon="circle-plus" @click="openCreate">Request feature</UiButton>
      <UiButton variant="ghost" icon="refresh-cw" @click="loadRequests">Refresh</UiButton>
    </div>

    <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

    <UiSpinner v-if="loading" label="Loading requests…" />
    <UiEmptyState
      v-else-if="requests.length === 0 && !loadFailed"
      title="No requests yet"
      body="Be the first to request a feature."
      spot="site/contribute"
    />
    <ul v-else class="space-y-4">
      <li v-for="request in requests" :key="request.id" class="request-card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold text-ink-strong">
                <button type="button" class="request-title" @click="openDetails(request)">{{ request.title }}</button>
              </h3>
              <UiChip :tone="statusTone(request.status)">{{ statusLabel(request.status) }}</UiChip>
              <UiChip :tone="priorityTone[request.priority] || 'warning'">{{ request.priority }}</UiChip>
            </div>
            <p class="text-sm text-ink-secondary mb-3">{{ request.description }}</p>
            <div class="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span>Requested by {{ request.requestedByName || request.requestedBy }}</span>
              <span>{{ formatDate(request.createdAt) }}</span>
              <span v-if="request.assignedTo">Assigned to {{ request.assignedToName || request.assignedTo }}</span>
              <span v-if="request.componentId" class="text-accent-text">Linked to {{ request.componentId }}</span>
              <span v-if="request.commentCount">{{ request.commentCount }} comment{{ request.commentCount === 1 ? '' : 's' }}</span>
            </div>
          </div>
          <UiButton
            size="sm"
            :variant="hasVoted(request) ? 'primary' : 'secondary'"
            icon="thumbs-up"
            :aria-pressed="hasVoted(request)"
            :aria-label="`Vote for ${request.title}: ${request.votes} votes`"
            @click="vote(request.id)"
          >
            {{ request.votes }}
          </UiButton>
        </div>
      </li>
    </ul>

    <!-- New request -->
    <UiDialog v-model:open="createOpen" title="Request new feature">
      <InlineNotice :notice="formNotice" class="mb-4" @dismiss="clearFormNotice" />
      <form id="feature-request-form" class="space-y-4" @submit.prevent="submitRequest">
        <UiInput id="request-title" v-model="createForm.title" label="Title" required placeholder="e.g., Data table component" />
        <UiTextarea
          id="request-description"
          v-model="createForm.description"
          label="Description"
          required
          :rows="4"
          placeholder="Describe the component or feature you'd like to see..."
        />
        <UiTextarea
          id="request-use-case"
          v-model="createForm.useCase"
          label="Detailed use case"
          :rows="5"
          placeholder="What problem does this solve? Where would it be used?"
          hint="Include the problem, where it's used, specific requirements and any design considerations."
        />
        <UiSelect id="request-category" v-model="createForm.category" label="Category" required placeholder="Select category" :options="categoryOptions" />
        <UiSelect id="request-priority" v-model="createForm.priority" label="Priority" :options="priorityOptions" />
      </form>
      <template #footer>
        <UiButton @click="createOpen = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="feature-request-form" :loading="submitting">Submit request</UiButton>
      </template>
    </UiDialog>

    <!-- Request details -->
    <UiDialog v-model:open="detailsOpen" :title="selected ? selected.title : 'Request'" size="lg">
      <div v-if="selected" class="space-y-6">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />

        <form v-if="editing" id="request-edit-form" class="space-y-4" @submit.prevent="saveEdit">
          <UiInput v-model="editForm.title" label="Title" required />
          <UiTextarea v-model="editForm.description" label="Description" required :rows="4" />
          <UiTextarea v-model="editForm.useCase" label="Use case" :rows="4" />
          <div class="flex gap-2">
            <UiButton variant="primary" type="submit" size="sm" :loading="saving">Save changes</UiButton>
            <UiButton size="sm" @click="editing = false">Cancel</UiButton>
          </div>
        </form>
        <template v-else>
          <section>
            <h3 class="text-sm font-medium text-ink-secondary mb-2">Description</h3>
            <p class="text-ink">{{ selected.description }}</p>
          </section>
          <section v-if="selected.useCase">
            <h3 class="text-sm font-medium text-ink-secondary mb-2">Use case</h3>
            <p class="text-ink">{{ selected.useCase }}</p>
          </section>
        </template>

        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="font-medium text-ink-secondary mb-1">Status</dt>
            <dd><UiChip :tone="statusTone(selected.status)">{{ statusLabel(selected.status) }}</UiChip></dd>
          </div>
          <div>
            <dt class="font-medium text-ink-secondary mb-1">Priority</dt>
            <dd><UiChip :tone="priorityTone[selected.priority] || 'warning'">{{ selected.priority }}</UiChip></dd>
          </div>
          <div>
            <dt class="font-medium text-ink-secondary mb-1">Requested by</dt>
            <dd class="text-ink">{{ selected.requestedByName || selected.requestedBy }}</dd>
          </div>
          <div>
            <dt class="font-medium text-ink-secondary mb-1">Assigned to</dt>
            <dd class="text-ink">{{ selected.assignedToName || selected.assignedTo || 'Nobody yet' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-ink-secondary mb-1">Component</dt>
            <dd class="text-ink">{{ selected.componentId || 'Not linked' }}</dd>
          </div>
          <div v-if="selected.metadata?.rejectionReason">
            <dt class="font-medium text-ink-secondary mb-1">Rejection reason</dt>
            <dd class="text-ink">{{ selected.metadata.rejectionReason }}</dd>
          </div>
        </dl>

        <div v-if="canEditSelected || canDeleteSelected" class="flex flex-wrap gap-2">
          <UiButton v-if="canEditSelected && !editing" size="sm" icon="pencil" @click="startEdit">Edit request</UiButton>
          <UiButton v-if="canDeleteSelected" size="sm" variant="danger" icon="trash-2" @click="deleteRequest">Delete request</UiButton>
        </div>

        <!-- Triage: roadmap editors only -->
        <section v-if="canTriage" class="triage-panel space-y-4" aria-labelledby="triage-heading">
          <h3 id="triage-heading" class="text-sm font-medium text-ink">Triage</h3>

          <ul v-if="showApprovals" class="space-y-3">
            <li v-for="step in approvalSteps" :key="step.stage" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-2 text-sm text-ink">
                <AppIcon :name="step.done ? 'circle-check' : 'circle'" class="text-lg" :class="step.done ? 'text-success' : 'text-ink-muted'" />
                {{ step.label }}
              </span>
              <span v-if="step.done" class="text-xs text-success">Approved</span>
              <UiButton v-else-if="step.canAct" variant="primary" size="sm" @click="approve(step.stage)">{{ step.action }}</UiButton>
            </li>
          </ul>

          <div class="flex flex-wrap gap-2">
            <UiButton v-for="action in statusActions" :key="action.status" variant="primary" size="sm" @click="transition(action.status)">
              {{ action.label }}
            </UiButton>
            <UiButton v-if="canReject" variant="danger" size="sm" @click="rejectOpen = true">Reject</UiButton>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <UiSelect :model-value="selected.priority" label="Priority" size="sm" :options="priorityOptions" @update:model-value="setPriority" />
            <div class="space-y-2">
              <UserPicker v-if="canPickUsers" label="Assign to" :exclude-ids="selected.assignedTo ? [selected.assignedTo] : []" excluded-text="Assigned" @select="(person) => assign(person.id)" />
              <div class="flex flex-wrap gap-2">
                <UiButton v-if="selected.assignedTo !== currentUserId" size="sm" icon="user" @click="assign(currentUserId)">Assign to me</UiButton>
                <UiButton v-if="selected.assignedTo" size="sm" variant="ghost" icon="x" @click="unassign">Unassign</UiButton>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <UiSelect
              v-model="componentChoice"
              label="Component"
              size="sm"
              :placeholder="componentOptions.length ? 'Choose a component' : 'No components available'"
              :options="componentOptions"
            />
            <div class="flex flex-wrap gap-2">
              <UiButton v-if="canPromote" size="sm" variant="primary" icon="rocket" :disabled="!componentChoice" @click="linkComponent('promote')">
                Promote to system
              </UiButton>
              <UiButton size="sm" icon="link" :disabled="!componentChoice" @click="linkComponent('link-component')">Link component</UiButton>
              <UiButton v-if="selected.componentId" size="sm" variant="ghost" icon="x" @click="unlinkComponent">Unlink</UiButton>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-sm font-medium text-ink-secondary mb-4">Comments</h3>
          <ul v-if="selected.comments?.length" class="space-y-4 mb-4">
            <li v-for="comment in selected.comments" :key="comment.id" class="p-4 rounded-tile bg-surface-sunken">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-ink-strong">{{ comment.authorName || comment.author }}</span>
                <span class="text-xs text-ink-muted">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="text-ink">{{ comment.content }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted mb-4">No comments yet.</p>
          <form class="flex items-end gap-2" @submit.prevent="addComment">
            <div class="flex-1">
              <UiInput v-model="newComment" label="Add comment" placeholder="Add a comment..." />
            </div>
            <UiButton variant="primary" type="submit" icon="send" :disabled="!newComment.trim()">Comment</UiButton>
          </form>
        </section>
      </div>
    </UiDialog>

    <UiDialog v-model:open="rejectOpen" title="Reject request" size="sm">
      <UiTextarea v-model="rejectReason" label="Reason for rejection" required :rows="4" placeholder="Why is this request being rejected?" />
      <template #footer>
        <UiButton @click="rejectOpen = false">Cancel</UiButton>
        <UiButton variant="danger" :disabled="!rejectReason.trim()" @click="reject">Reject request</UiButton>
      </template>
    </UiDialog>

    <ConfirmDialog :state="confirmState" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import ConfirmDialog from '../workspaces/ConfirmDialog.vue';
import UserPicker from '../admin/UserPicker.vue';
import { UiButton, UiChip, UiDialog, UiEmptyState, UiInput, UiSelect, UiSpinner, UiTextarea } from '../ui';
import { useAuth } from '../../composables/useAuth.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { useNotice } from '../../composables/useNotice.js';
import apiClient from '../../services/api.js';

const API = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/component-requests`;
const COMPONENTS_API = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/components`;

/** Statuses in which the author may still edit or withdraw their request (the server enforces the same) */
const OPEN_STATUSES = ['submitted', 'under-review', 'needs-more-info'];

const categoryOptions = [
  { value: 'form-controls', label: 'Form controls' },
  { value: 'data-display', label: 'Data display' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'utilities', label: 'Utilities' },
];
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];
const priorityTone = { critical: 'danger', high: 'danger', medium: 'warning', low: 'neutral' };
const statusTones = {
  submitted: 'info',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'danger',
  'needs-more-info': 'warning',
  'in-progress': 'accent',
  completed: 'success',
  released: 'accent',
};
const statusTone = (status) => statusTones[status] || 'neutral';
const statusLabel = (status) => (status ? (status.charAt(0).toUpperCase() + status.slice(1)).replace(/-/g, ' ') : '');

/** The next steps triage can take from each status (approval and rejection have their own controls) */
const NEXT_STEPS = {
  submitted: [{ status: 'under-review', label: 'Start review' }],
  'under-review': [{ status: 'needs-more-info', label: 'Ask for more info' }],
  'needs-more-info': [{ status: 'under-review', label: 'Resume review' }],
  approved: [{ status: 'in-progress', label: 'Start implementation' }],
  'in-progress': [{ status: 'completed', label: 'Mark complete' }],
  completed: [{ status: 'released', label: 'Release' }],
};

const { notice, showNotice, clearNotice } = useNotice();
const { notice: formNotice, showNotice: showFormNotice, clearNotice: clearFormNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

// What the signed-in user may do comes from their permissions (docs/AUTH.md); the server enforces the same
const { user, hasPermission } = useAuth();
const currentUserId = computed(() => user.value?.id ?? '');
const canTriage = computed(() => hasPermission('roadmap:edit'));
// Only user admins can search people; every roadmap editor can assign a request to themselves
const canPickUsers = computed(() => hasPermission('admin:users'));

const requests = ref([]);
const loading = ref(false);
// A failed load shows its error, not an empty state that claims there are no requests
const loadFailed = ref(false);
const createOpen = ref(false);
const submitting = ref(false);
const createForm = ref(emptyForm());
const selected = ref(null);
const editing = ref(false);
const saving = ref(false);
const editForm = ref({ title: '', description: '', useCase: '' });
const newComment = ref('');
const rejectOpen = ref(false);
const rejectReason = ref('');
const componentChoice = ref('');
const componentOptions = ref([]);

function emptyForm() {
  return { title: '', description: '', useCase: '', category: '', priority: 'medium' };
}

const errorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

const hasVoted = (request) => (request.voters ?? []).includes(currentUserId.value);

const detailsOpen = computed({
  get: () => !!selected.value,
  set: (open) => {
    if (!open) selected.value = null;
  },
});

const isOpen = (request) => OPEN_STATUSES.includes(request.status);
const isAuthor = (request) => !!currentUserId.value && request.requestedBy === currentUserId.value;
const canEditSelected = computed(() => !!selected.value && isAuthor(selected.value) && isOpen(selected.value));
const canDeleteSelected = computed(() => !!selected.value && (canTriage.value || (isAuthor(selected.value) && isOpen(selected.value))));
const canReject = computed(() => !!selected.value && ['submitted', 'under-review', 'needs-more-info', 'approved', 'in-progress'].includes(selected.value.status));
const canPromote = computed(() => !!selected.value && ['approved', 'in-progress'].includes(selected.value.status));
const statusActions = computed(() => (selected.value ? NEXT_STEPS[selected.value.status] ?? [] : []));
const showApprovals = computed(() => !!selected.value && isOpen(selected.value));

const approvalSteps = computed(() => {
  const meta = selected.value?.metadata ?? {};
  return [
    { stage: 'design', label: 'Design review', done: !!meta.designApproved, canAct: true, action: 'Approve' },
    { stage: 'technical', label: 'Technical review', done: !!meta.technicalApproved, canAct: true, action: 'Approve' },
    {
      stage: 'final',
      label: 'Final approval',
      done: false,
      canAct: !!meta.designApproved && !!meta.technicalApproved && selected.value?.status === 'under-review',
      action: 'Final approve',
    },
  ];
});

/**
 * Puts the request the server returned into the list and the open dialog,
 * replacing the old copy (cleared fields come back absent), keeping the dialog's comments
 */
const applyUpdate = (updated) => {
  const index = requests.value.findIndex((r) => r.id === updated.id);
  if (index !== -1) requests.value[index] = updated;
  if (selected.value?.id === updated.id) selected.value = { ...updated, comments: selected.value.comments ?? [] };
};

const loadRequests = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(API);
    requests.value = Array.isArray(response.data) ? response.data : [];
    loadFailed.value = false;
    clearNotice();
  } catch (error) {
    loadFailed.value = true;
    showNotice(errorMessage(error, 'Could not load requests. Try again.'), 'error');
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  clearFormNotice();
  createOpen.value = true;
};

const submitRequest = async () => {
  const form = createForm.value;
  if (!form.title.trim() || !form.description.trim() || !form.category) {
    showFormNotice('Fill in the title, description and category.', 'error');
    return;
  }
  submitting.value = true;
  try {
    const duplicates = await apiClient
      .get(`${API}/duplicates`, { params: { title: form.title, description: form.description } })
      .then((response) => response.data?.similar ?? [])
      .catch(() => []);
    if (duplicates.length) {
      const proceed = await askConfirm({
        title: 'Similar requests exist',
        message: `Similar requests: ${duplicates.map((d) => d.title).join(', ')}. Submit yours anyway?`,
        confirmText: 'Submit anyway',
      });
      if (!proceed) return;
    }
    const response = await apiClient.post(API, {
      title: form.title,
      description: form.description,
      ...(form.useCase.trim() ? { useCase: form.useCase } : {}),
      category: form.category,
      priority: form.priority || 'medium',
    });
    const created = response.data?.request ?? response.data;
    requests.value.unshift(created);
    createForm.value = emptyForm();
    createOpen.value = false;
    showNotice('Request submitted.', 'success');
  } catch (error) {
    showFormNotice(errorMessage(error, 'Could not submit the request. Try again.'), 'error');
  } finally {
    submitting.value = false;
  }
};

const vote = async (id) => {
  try {
    applyUpdate((await apiClient.post(`${API}/${id}/vote`)).data);
  } catch (error) {
    showNotice(errorMessage(error, 'Could not record your vote.'), 'error');
  }
};

/** The components a roadmap editor can link, loaded once */
const loadComponentOptions = () => {
  if (!canTriage.value || componentOptions.value.length) return;
  apiClient
    .get(COMPONENTS_API)
    .then((response) => {
      componentOptions.value = (response.data?.components ?? []).map((c) => ({ value: c.id, label: c.name || c.id }));
    })
    .catch(() => {
      componentOptions.value = [];
    });
};

const openDetails = async (request) => {
  clearFormNotice();
  editing.value = false;
  newComment.value = '';
  componentChoice.value = request.componentId ?? '';
  selected.value = { ...request, comments: [] };
  loadComponentOptions();
  try {
    selected.value = (await apiClient.get(`${API}/${request.id}`)).data;
  } catch (error) {
    showFormNotice(errorMessage(error, 'Could not load the request details.'), 'error');
  }
};

const startEdit = () => {
  const { title, description, useCase } = selected.value;
  editForm.value = { title, description, useCase: useCase ?? '' };
  editing.value = true;
};

const saveEdit = async () => {
  saving.value = true;
  try {
    const { title, description, useCase } = editForm.value;
    applyUpdate((await apiClient.put(`${API}/${selected.value.id}`, { title, description, useCase })).data);
    editing.value = false;
  } catch (error) {
    showFormNotice(errorMessage(error, 'Could not save your changes.'), 'error');
  } finally {
    saving.value = false;
  }
};

const deleteRequest = async () => {
  const request = selected.value;
  const confirmed = await askConfirm({
    title: 'Delete this request?',
    message: `"${request.title}", its votes and comments will be deleted. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!confirmed) return;
  try {
    await apiClient.delete(`${API}/${request.id}`);
    requests.value = requests.value.filter((r) => r.id !== request.id);
    selected.value = null;
    showNotice('Request deleted.', 'success');
  } catch (error) {
    showFormNotice(errorMessage(error, 'Could not delete the request.'), 'error');
  }
};

const addComment = async () => {
  const content = newComment.value.trim();
  if (!content || !selected.value) return;
  const id = selected.value.id;
  try {
    const comment = (await apiClient.post(`${API}/${id}/comments`, { content })).data;
    const commentCount = (selected.value.commentCount ?? 0) + 1;
    selected.value = { ...selected.value, commentCount, comments: [...(selected.value.comments ?? []), comment] };
    const listed = requests.value.find((r) => r.id === id);
    if (listed) listed.commentCount = commentCount;
    newComment.value = '';
  } catch (error) {
    showFormNotice(errorMessage(error, 'Could not add your comment.'), 'error');
  }
};

/** Runs a triage call on the open request and shows its result */
const triage = async (call, fallback) => {
  try {
    applyUpdate((await call(selected.value.id)).data);
    return true;
  } catch (error) {
    showFormNotice(errorMessage(error, fallback), 'error');
    return false;
  }
};

const transition = (status) => triage((id) => apiClient.patch(`${API}/${id}/status`, { status }), 'Could not change the status.');
const approve = (stage) => triage((id) => apiClient.post(`${API}/${id}/approve`, { stage }), 'Could not approve the request.');
const setPriority = (priority) => triage((id) => apiClient.patch(`${API}/${id}/priority`, { priority }), 'Could not change the priority.');
const assign = (userId) => triage((id) => apiClient.post(`${API}/${id}/assign`, { userId }), 'Could not assign the request.');
const unassign = () => triage((id) => apiClient.delete(`${API}/${id}/assign`), 'Could not unassign the request.');
const unlinkComponent = () => triage((id) => apiClient.post(`${API}/${id}/unlink-component`), 'Could not unlink the component.');
/** `promote` (approved work starts) or `link-component` */
const linkComponent = (route) =>
  triage((id) => apiClient.post(`${API}/${id}/${route}`, { componentId: componentChoice.value }), 'Could not link the component.');

const reject = async () => {
  const reason = rejectReason.value.trim();
  if (await triage((id) => apiClient.post(`${API}/${id}/reject`, { reason }), 'Could not reject the request.')) {
    rejectOpen.value = false;
    rejectReason.value = '';
  }
};

onMounted(loadRequests);

defineExpose({ loadRequests });
</script>

<style scoped>
.request-card {
  @apply p-6 rounded-card border border-line-faint bg-surface-raised transition-colors hover:border-line;
}
.request-title {
  @apply text-left rounded-control hover:text-accent-text focus-visible:outline focus-visible:outline-2 outline-focus;
}
.triage-panel {
  @apply p-4 rounded-tile border border-line-faint bg-surface-sunken;
}
</style>
