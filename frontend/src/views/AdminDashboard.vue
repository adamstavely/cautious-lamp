<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/review', label: 'Review' }"
      title="Review management"
      lead="Manage review links, teams, and batch operations. Control access, extend expiration dates, and oversee all review activities."
      spot="admin/admin-dashboard"
      size="tool"
    >
      <template #actions>
        <DemoDataBadge />
        <span v-if="canManageReviews" class="text-sm text-ink-muted" aria-live="polite">
          {{ loadingLinks ? 'Loading…' : loadedAt ? `Updated ${loadedAt.toLocaleTimeString()}` : '' }}
        </span>
      </template>
    </PageHero>

    <PageSection>
      <UiTabs v-model="activeTab" :tabs="tabs" label="Review management">
        <!-- Review links -->
        <template #links>
          <div class="flex flex-col gap-4">
            <!-- Managing review links needs the admin:users permission (the server's /admin routes check it) -->
            <UiCallout v-if="!canManageReviews" tone="warning" role="status">
              You don't have access to manage review links. Ask an administrator for the admin:users permission.
            </UiCallout>
            <InlineNotice :notice="notice" @dismiss="clearNotice" />

            <UiPanel flush>
              <template #actions>
                <span class="text-sm text-ink-secondary" aria-live="polite">{{ selectedIds.length }} selected</span>
                <UiButton
                  variant="danger"
                  size="sm"
                  icon="delete"
                  :disabled="!selectedIds.length"
                  title="Delete all selected links"
                  @click="openBatchDeleteConfirm"
                >
                  Delete selected
                </UiButton>
              </template>

              <UiTable caption="Review links" :aria-busy="loadingLinks || undefined">
                <thead>
                  <tr>
                    <th scope="col" class="w-10">
                      <input
                        type="checkbox"
                        class="row-check"
                        :checked="allOnPageSelected"
                        :indeterminate.prop="someOnPageSelected && !allOnPageSelected"
                        :disabled="!pageLinks.length"
                        aria-label="Select all links on this page"
                        @change="toggleAllOnPage($event.target.checked)"
                      />
                    </th>
                    <th v-for="column in columns" :key="column.key" scope="col" :class="{ 'text-center': column.center }" :aria-sort="ariaSort(column)">
                      <button v-if="column.sortable" type="button" class="sort-button" @click="sortBy(column.key)">
                        {{ column.title }}
                        <span class="material-symbols-outlined text-base" aria-hidden="true">{{ sortIcon(column) }}</span>
                      </button>
                      <template v-else>{{ column.title }}</template>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingLinks && !filteredLinks.length">
                    <td :colspan="columns.length + 1"><UiSpinner label="Loading review links…" /></td>
                  </tr>
                  <tr v-else-if="!filteredLinks.length">
                    <td :colspan="columns.length + 1" class="text-center text-ink-muted">No review links</td>
                  </tr>
                  <tr v-for="item in pageLinks" :key="item.id">
                    <td>
                      <input
                        type="checkbox"
                        class="row-check"
                        :checked="selectedIds.includes(item.id)"
                        :aria-label="`Select ${item.filename || item.id}`"
                        @change="toggleSelected(item.id, $event.target.checked)"
                      />
                    </td>
                    <td class="font-medium text-ink-strong">{{ item.filename }}</td>
                    <td>{{ item.designer }}</td>
                    <td class="text-center">
                      <UiChip v-if="item.hasPassword" tone="danger" icon="lock">Protected</UiChip>
                      <UiChip v-else tone="success" icon="public">Public</UiChip>
                    </td>
                    <td class="whitespace-nowrap">{{ formatDate(item.expiresAt) }}</td>
                    <td class="text-center">
                      <UiChip :tone="item.extended ? 'info' : 'neutral'">{{ item.extended ? 'Yes' : 'No' }}</UiChip>
                    </td>
                    <td>
                      <div class="flex gap-1">
                        <UiButton icon-only size="sm" variant="ghost" icon="content_copy" label="Copy review URL" @click="copyReviewUrl(item)" />
                        <UiButton v-if="isExpired(item)" icon-only size="sm" variant="ghost" icon="refresh" label="Reactivate expired link" @click="reactivate(item.id)" />
                        <UiButton v-else icon-only size="sm" variant="ghost" icon="schedule" label="Extend expiration by 7 days" @click="extend(item.id)" />
                        <UiButton icon-only size="sm" variant="ghost" icon="calendar_month" label="Override expiration date" @click="openOverrideDialog(item.id)" />
                        <UiButton icon-only size="sm" variant="ghost" icon="key" label="Reset password" @click="openPasswordDialog(item.id)" />
                        <UiButton icon-only size="sm" variant="ghost" icon="delete" label="Delete this link" @click="openDeleteConfirm(item.id)" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </UiTable>

              <template v-if="pageCount > 1" #footer>
                <span>{{ pageStart + 1 }}–{{ Math.min(pageStart + PAGE_SIZE, sortedLinks.length) }} of {{ sortedLinks.length }}</span>
                <div class="flex gap-2">
                  <UiButton size="sm" variant="ghost" icon="chevron_left" :disabled="page === 1" @click="page -= 1">Previous</UiButton>
                  <UiButton size="sm" variant="ghost" trailing-icon="chevron_right" :disabled="page === pageCount" @click="page += 1">Next</UiButton>
                </div>
              </template>
            </UiPanel>
          </div>
        </template>

        <!-- Teams -->
        <template #teams>
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-ink-strong">Teams</h2>
              <UiButton variant="primary" icon="add" @click="showCreateTeamModal = true">Create team</UiButton>
            </div>

            <UiEmptyState
              v-if="teams.length === 0"
              title="No teams yet"
              body="Create your first team to start collaborating."
              spot="admin/user-management"
            />

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <UiCard v-for="team in teams" :key="team.id">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="text-lg font-semibold text-ink-strong">{{ team.name }}</h3>
                    <p class="text-sm text-ink-secondary">{{ team.description || 'No description' }}</p>
                  </div>
                  <div class="flex shrink-0">
                    <UiButton icon-only size="sm" variant="ghost" icon="edit" :label="`Edit ${team.name}`" @click="editTeam(team)" />
                    <UiButton icon-only size="sm" variant="ghost" icon="delete" :label="`Delete ${team.name}`" @click="confirmDeleteTeam(team)" />
                  </div>
                </div>

                <dl class="mt-4 flex flex-col gap-2 text-sm">
                  <div class="flex items-center justify-between">
                    <dt class="text-ink-secondary">Members</dt>
                    <dd class="font-medium text-ink-strong">{{ team.members?.length || 0 }}</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-ink-secondary">Reviews</dt>
                    <dd class="font-medium text-ink-strong">{{ team.reviews?.length || 0 }}</dd>
                  </div>
                </dl>

                <div v-if="team.members && team.members.length > 0" class="mt-4">
                  <p class="mb-2 text-xs font-medium text-ink-muted">Members:</p>
                  <div class="flex flex-wrap gap-2">
                    <UiChip v-for="member in team.members.slice(0, 5)" :key="member.email" :tone="member.role === 'Art Director' ? 'info' : 'accent'">
                      {{ member.name || member.email }} ({{ member.role || 'Designer' }})
                    </UiChip>
                    <UiChip v-if="team.members.length > 5">+{{ team.members.length - 5 }} more</UiChip>
                  </div>
                </div>

                <template #footer>
                  <UiButton variant="primary" size="sm" icon="group" class="w-full" @click.stop="manageTeamMembers(team)">Manage members</UiButton>
                </template>
              </UiCard>
            </div>
          </div>
        </template>
      </UiTabs>
    </PageSection>

    <!-- Modals -->
    <DatePickerModal
      v-model="showOverrideDialog"
      title="Override expiration date"
      label="New expiration date"
      :min-date="minDate"
      required
      @submit="handleOverrideSubmit"
    />

    <PromptModal
      v-model="showPasswordDialog"
      title="Reset password"
      label="New password (leave empty to remove the password)"
      placeholder="Enter password"
      type="password"
      :required="false"
      @submit="handlePasswordSubmit"
      @cancel="pendingPasswordId = null"
    />

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Delete link"
      message="Are you sure you want to delete this link?"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteConfirm"
    />

    <ConfirmModal
      v-model="showBatchDeleteConfirm"
      title="Delete selected links"
      message="Are you sure you want to delete all selected links?"
      confirm-text="Delete all"
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
      title="Create new team"
      label="Team name"
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
      :team="selectedTeam || null"
      @members-updated="handleMembersUpdated"
    />

    <ConfirmModal
      v-model="showDeleteTeamConfirm"
      title="Delete team"
      :message="`Are you sure you want to delete '${deletingTeam?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteTeam"
    />
  </PageShell>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getCurrentUser, isMockMode } from '../mockData.js';
import { useAuth } from '../composables/useAuth.js';
import {
  adminAPI,
  teamsAPI,
  apiErrorMessage,
} from '../services/api.js';
import { useNotice } from '../composables/useNotice.js';
import InlineNotice from '../components/InlineNotice.vue';
import PromptModal from '../components/review-ui/PromptModal.vue';
import ConfirmModal from '../components/review-ui/ConfirmModal.vue';
import AlertModal from '../components/review-ui/AlertModal.vue';
import DatePickerModal from '../components/review-ui/DatePickerModal.vue';
import TeamEditModal from '../components/review-ui/TeamEditModal.vue';
import TeamMembersModal from '../components/review-ui/TeamMembersModal.vue';
import DemoDataBadge from '../components/review-ui/DemoDataBadge.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCard,
  UiChip,
  UiEmptyState,
  UiPanel,
  UiSpinner,
  UiTable,
  UiTabs,
} from '../components/ui';

const DAY = 24 * 60 * 60 * 1000;

const { notice, showNotice, clearNotice } = useNotice();
const links = ref([]);
const selectedIds = ref([]);
const teams = ref([]);
const activeTab = ref('links');
const loadingLinks = ref(false);
const loadedAt = ref(null);

const showCreateTeamModal = ref(false);
const showEditTeamModal = ref(false);
const showMembersModal = ref(false);
const showDeleteTeamConfirm = ref(false);
const editingTeam = ref(null);
const selectedTeam = ref(null);
const deletingTeam = ref(null);
const newTeamName = ref('');

// Review links are managed with the signed-in user's token; the server requires admin:users
const demoMode = isMockMode();
const { hasPermission } = useAuth();
const canManageReviews = computed(() => hasPermission('admin:users'));

// The signed-in user, read once when the page opens
const currentUser = getCurrentUser();

// The admin API returns every review. Demo mode mimics role scoping so each demo role sees a sensible list.
const filteredLinks = computed(() => {
  if (!demoMode) return links.value;
  if (currentUser.role === 'art_director') {
    return links.value.filter(link => link.teamId === currentUser.teamId);
  }
  if (currentUser.role === 'designer') {
    return links.value.filter(link => link.designerEmail === currentUser.email);
  }
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

const tabs = [
  { value: 'links', label: 'Review links', icon: 'link' },
  { value: 'teams', label: 'Teams', icon: 'group' },
];

// Links table: columns, sorting, paging and selection
const columns = [
  { title: 'Filename', key: 'filename', sortable: true },
  { title: 'Designer', key: 'designer', sortable: true },
  { title: 'Password', key: 'hasPassword', center: true },
  { title: 'Expires', key: 'expiresAt', sortable: true },
  { title: 'Extended', key: 'extended', sortable: true, center: true },
  { title: 'Actions', key: 'actions' },
];
const PAGE_SIZE = 10;
const sortKey = ref(null);
const sortDesc = ref(false);
const page = ref(1);

const sortValue = (item, key) => {
  if (key === 'expiresAt') return item.expiresAt ? new Date(item.expiresAt).getTime() : 0;
  if (key === 'extended') return item.extended ? 1 : 0;
  return String(item[key] ?? '').toLowerCase();
};

const sortedLinks = computed(() => {
  if (!sortKey.value) return filteredLinks.value;
  const key = sortKey.value;
  const direction = sortDesc.value ? -1 : 1;
  return [...filteredLinks.value].sort((a, b) => {
    const x = sortValue(a, key);
    const y = sortValue(b, key);
    return x < y ? -direction : x > y ? direction : 0;
  });
});

const pageCount = computed(() => Math.max(1, Math.ceil(sortedLinks.value.length / PAGE_SIZE)));
const pageStart = computed(() => (page.value - 1) * PAGE_SIZE);
const pageLinks = computed(() => sortedLinks.value.slice(pageStart.value, pageStart.value + PAGE_SIZE));
watch(pageCount, (count) => {
  if (page.value > count) page.value = count;
});

// Ascending, then descending, then unsorted
const sortBy = (key) => {
  if (sortKey.value !== key) {
    sortKey.value = key;
    sortDesc.value = false;
  } else if (!sortDesc.value) {
    sortDesc.value = true;
  } else {
    sortKey.value = null;
  }
  page.value = 1;
};
const ariaSort = (column) => {
  if (!column.sortable) return undefined;
  if (sortKey.value !== column.key) return 'none';
  return sortDesc.value ? 'descending' : 'ascending';
};
const sortIcon = (column) => {
  if (sortKey.value !== column.key) return 'unfold_more';
  return sortDesc.value ? 'arrow_downward' : 'arrow_upward';
};

const allOnPageSelected = computed(() => pageLinks.value.length > 0 && pageLinks.value.every((item) => selectedIds.value.includes(item.id)));
const someOnPageSelected = computed(() => pageLinks.value.some((item) => selectedIds.value.includes(item.id)));
const toggleSelected = (id, checked) => {
  selectedIds.value = checked ? [...new Set([...selectedIds.value, id])] : selectedIds.value.filter((selected) => selected !== id);
};
const toggleAllOnPage = (checked) => {
  const ids = pageLinks.value.map((item) => item.id);
  selectedIds.value = checked
    ? [...new Set([...selectedIds.value, ...ids])]
    : selectedIds.value.filter((id) => !ids.includes(id));
};

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

/** Report a failed admin call (a 403 reads "You don't have access to this"). */
const handleAdminError = (error, fallback) => {
  console.error(fallback, error);
  showNotice(apiErrorMessage(error, fallback), 'error');
};

const loadLinks = async () => {
  if (!canManageReviews.value) return;
  loadingLinks.value = true;
  try {
    links.value = await adminAPI.getReviews(true); // always load all, including expired
    // Drop selections for reviews that no longer exist
    const ids = new Set(links.value.map(link => link.id));
    selectedIds.value = selectedIds.value.filter(id => ids.has(id));
    loadedAt.value = new Date();
  } catch (error) {
    handleAdminError(error, 'Failed to load review links.');
  } finally {
    loadingLinks.value = false;
  }
};

const isExpired = (item) => {
  if (!item.expiresAt) return false;
  return new Date(item.expiresAt) < new Date();
};

/** Run an admin action, then reload the list. */
const runAdminAction = async (action, successMessage, failureMessage) => {
  try {
    const result = await action();
    if (successMessage) showNotice(typeof successMessage === 'function' ? successMessage(result) : successMessage, 'success');
    await loadLinks();
    return true;
  } catch (error) {
    handleAdminError(error, failureMessage);
    return false;
  }
};

const reactivate = (id) => runAdminAction(
  () => adminAPI.reactivateReview(id),
  'Link reactivated.',
  'Failed to reactivate link.'
);

const extend = (id) => runAdminAction(
  () => adminAPI.extendReview(id, 7),
  'Expiration extended by 7 days.',
  'Failed to extend link expiration.'
);

const openOverrideDialog = (id) => {
  pendingOverrideId.value = id;
  showOverrideDialog.value = true;
};

// Set a new expiry date by extending by the days between the current expiry (or today) and that date
const handleOverrideSubmit = async (date) => {
  const id = pendingOverrideId.value;
  pendingOverrideId.value = null;
  if (!date || !id) return;

  const item = links.value.find(link => link.id === id);
  const from = Math.max(Date.now(), item?.expiresAt ? new Date(item.expiresAt).getTime() : 0);
  // End of the chosen day, local time
  const target = new Date(`${date}T23:59:59`).getTime();
  const days = Math.ceil((target - from) / DAY);
  if (!(days >= 1 && days <= 365)) {
    showNotice(
      days < 1
        ? 'Pick a date after the current expiration date.'
        : 'The expiration can be extended by at most 365 days at a time.',
      'error'
    );
    return;
  }
  await runAdminAction(
    () => adminAPI.extendReview(id, days),
    `Expiration extended by ${days} day${days === 1 ? '' : 's'}.`,
    'Failed to change the expiration date.'
  );
};

const openPasswordDialog = (id) => {
  pendingPasswordId.value = id;
  showPasswordDialog.value = true;
};

const handlePasswordSubmit = async (newPassword) => {
  const id = pendingPasswordId.value;
  pendingPasswordId.value = null;
  if (!id) return;
  const password = (newPassword || '').trim();
  await runAdminAction(
    () => adminAPI.resetPassword(id, password),
    password ? 'Password updated.' : 'Password removed.',
    'Failed to update the password.'
  );
};

const openDeleteConfirm = (id) => {
  pendingDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  const id = pendingDeleteId.value;
  pendingDeleteId.value = null;
  if (!id) return;
  await runAdminAction(() => adminAPI.deleteReview(id), 'Review deleted.', 'Failed to delete the review.');
};

const openBatchDeleteConfirm = () => {
  if (!selectedIds.value.length) return;
  showBatchDeleteConfirm.value = true;
};

const handleBatchDeleteConfirm = async () => {
  const ids = [...selectedIds.value];
  if (!ids.length) return;
  const ok = await runAdminAction(
    () => adminAPI.batchDelete(ids),
    (result) => `${result?.deleted ?? ids.length} review${(result?.deleted ?? ids.length) === 1 ? '' : 's'} deleted.`,
    'Failed to delete the selected reviews.'
  );
  if (ok) selectedIds.value = [];
};

const copyReviewUrl = async (item) => {
  const reviewUrl = `${window.location.origin}/review/${encodeURIComponent(item.id)}`;
  try {
    await navigator.clipboard.writeText(reviewUrl);
    showNotice('Review URL copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    showNotice(`Couldn't copy automatically. The link is ${reviewUrl}`, 'warning');
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
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

// Teams functions
const loadTeams = async () => {
  try {
    teams.value = await teamsAPI.getTeams();
  } catch (error) {
    console.error('Failed to load teams:', error);
    showAlertMessage('Error', apiErrorMessage(error, 'Failed to load teams.'), 'error');
  }
};

const handleCreateTeam = async (teamName) => {
  if (!teamName || !teamName.trim()) return;

  try {
    await teamsAPI.createTeam(teamName.trim());
    showCreateTeamModal.value = false;
    newTeamName.value = '';
    showAlertMessage('Success', 'Team created successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to create team:', error);
    showAlertMessage('Error', apiErrorMessage(error, 'Failed to create team.'), 'error');
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
  if (!team || typeof team !== 'object') {
    console.error('Invalid team object:', team);
    return;
  }
  selectedTeam.value = team;
  showMembersModal.value = true;
};

// The members dialog stays open and reports each change itself; just refresh the list behind it
const handleMembersUpdated = () => {
  loadTeams();
};

const confirmDeleteTeam = (team) => {
  deletingTeam.value = team;
  showDeleteTeamConfirm.value = true;
};

const handleDeleteTeam = async () => {
  if (!deletingTeam.value) return;

  try {
    await teamsAPI.deleteTeam(deletingTeam.value.id);
    showDeleteTeamConfirm.value = false;
    deletingTeam.value = null;
    showAlertMessage('Success', 'Team deleted successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to delete team:', error);
    showAlertMessage('Error', apiErrorMessage(error, 'Failed to delete team.'), 'error');
  }
};

onMounted(() => {
  loadLinks();
  loadTeams();
});
</script>

<style scoped>
.row-check {
  @apply w-4 h-4 accent-accent cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.sort-button {
  @apply inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink focus-visible:outline focus-visible:outline-2 outline-focus rounded-control;
}
</style>
