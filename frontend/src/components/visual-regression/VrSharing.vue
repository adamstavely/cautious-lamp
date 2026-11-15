<template>
  <UiPanel
    title="Sharing"
    heading-tag="h3"
    :description="workspaceNote"
  >
    <form id="vr-share" class="grid gap-4 sm:grid-cols-3 items-end" @submit.prevent="share">
      <div class="sm:col-span-2">
        <UiInput v-model="email" type="email" label="Email" required placeholder="name@example.com" autocomplete="off" />
      </div>
      <UiSelect v-model="role" id="share-role" label="Role" :options="roleOptions" />
    </form>
    <InlineNotice :notice="notice" class="mt-4" @dismiss="clearNotice" />

    <UiSpinner v-if="loading" label="Loading people…" class="py-6" />
    <p v-else-if="cannotManage" class="mt-4 text-sm text-ink-secondary">Only people who manage this project can see and change who it is shared with.</p>
    <ul v-else-if="shares.length" class="mt-5 divide-y divide-line">
      <li v-for="item in shares" :key="item.userId" class="flex flex-wrap items-center justify-between gap-3 py-3">
        <div>
          <p class="font-medium text-ink">{{ item.name }}</p>
          <p class="text-xs text-ink-secondary">{{ item.email }} · shared by {{ item.grantedBy?.name }} {{ formatDateTime(item.grantedAt) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UiChip :tone="item.role === 'editor' ? 'accent' : 'neutral'">{{ item.role === 'editor' ? 'Editor' : 'Viewer' }}</UiChip>
          <UiButton size="sm" variant="ghost" icon="trash-2" :disabled="busy" @click="unshare(item)">
            Remove<span class="sr-only"> {{ item.name }}</span>
          </UiButton>
        </div>
      </li>
    </ul>
    <p v-else class="mt-4 text-sm text-ink-secondary">Not shared with anyone outside its {{ project.workspaceId ? 'workspace' : 'creator' }}.</p>

    <template #footer>
      <div class="flex justify-end">
        <UiButton variant="primary" icon="user-plus" type="submit" form="vr-share" :loading="busy">Share</UiButton>
      </div>
    </template>
  </UiPanel>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiChip, UiInput, UiPanel, UiSelect, UiSpinner } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import apiClient from '../../services/api.js';
import { formatDateTime, vrErrorMessage } from './vrApi.js';

/** People given access to this project alone (besides its workspace) */
const props = defineProps({
  project: { type: Object, required: true },
  projectPath: { type: String, required: true },
});

const roleOptions = [
  { value: 'viewer', label: 'Viewer: see runs and results' },
  { value: 'editor', label: 'Editor: also review diffs and baselines' },
];

const { notice, showNotice, clearNotice } = useNotice();
const shares = ref([]);
const loading = ref(false);
const busy = ref(false);
const cannotManage = ref(false);
const email = ref('');
const role = ref('viewer');

const workspaceNote = computed(() =>
  props.project.workspaceId
    ? "Members of the project's workspace already have access by their role. Share it with someone else here."
    : 'Only you can use this project. Share it with someone here.'
);

const load = async () => {
  loading.value = true;
  cannotManage.value = false;
  try {
    shares.value = (await apiClient.get(`${props.projectPath}/shares`)).data ?? [];
  } catch (error) {
    if (error?.response?.status === 403) cannotManage.value = true;
    else showNotice(vrErrorMessage(error, 'Sharing could not be loaded.'), 'error');
  } finally {
    loading.value = false;
  }
};

const share = async () => {
  if (!email.value.trim()) return;
  busy.value = true;
  clearNotice();
  try {
    const { data } = await apiClient.post(`${props.projectPath}/share`, { email: email.value.trim(), role: role.value });
    showNotice(`Shared with ${data.name} as ${data.role}.`, 'success');
    email.value = '';
    await load();
  } catch (error) {
    showNotice(vrErrorMessage(error, 'The project could not be shared.'), 'error');
  } finally {
    busy.value = false;
  }
};

const unshare = async (item) => {
  if (!window.confirm(`Stop sharing this project with ${item.name}?`)) return;
  busy.value = true;
  clearNotice();
  try {
    await apiClient.delete(`${props.projectPath}/share/${encodeURIComponent(item.userId)}`);
    showNotice(`${item.name} no longer has access through a share.`, 'success');
    await load();
  } catch (error) {
    showNotice(vrErrorMessage(error, 'The share could not be removed.'), 'error');
  } finally {
    busy.value = false;
  }
};

watch(() => props.projectPath, load);
onMounted(load);
</script>
