<template>
  <PageShell width="wide">
    <UiSpinner v-if="loading" label="Loading session…" class="py-12" />

    <template v-else-if="session">
      <PageHero :back="backLink" title="Session replay" spot="site/session-replay" size="tool">
        <template #lead>
          <span class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Session ID: <span class="font-code">{{ session.sessionId }}</span></span>
            <span v-if="session.userEmail">User: {{ session.userEmail }}</span>
            <span>{{ formatDate(session.startTime) }}</span>
            <UiChip v-if="session.live" tone="info">Live</UiChip>
          </span>
        </template>
        <template #actions>
          <UiButton variant="primary" icon="open_in_new" :href="session.replayUrl" target="_blank" rel="noopener noreferrer">Open in OpenReplay</UiButton>
        </template>
      </PageHero>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <UiStat label="Duration" :value="formatDuration(session.duration)" />
        <UiStat label="Pages" :value="session.pagesCount" />
        <UiStat label="Events" :value="session.eventsCount" />
        <UiStat label="Errors" :tone="session.errorsCount > 0 ? 'danger' : 'neutral'" :value="session.errorsCount" />
        <UiStat label="Issue score" :tone="session.issueScore > 50 ? 'danger' : 'neutral'" :value="session.issueScore" />
      </div>

      <div class="space-y-6">
        <UiPanel title="Session replay">
          <template #actions>
            <UiLink :href="session.replayUrl" external>Open full screen</UiLink>
          </template>
          <iframe
            :src="session.replayUrl"
            class="w-full h-embed rounded-tile border border-line"
            allow="fullscreen"
            title="OpenReplay session replay"
          ></iframe>
          <p class="mt-2 text-center text-xs text-ink-muted">
            If the replay doesn't load, click "Open in OpenReplay" to view in a new window
          </p>
        </UiPanel>

        <UiPanel v-if="session.issueTypes && session.issueTypes.length > 0" title="Issue types">
          <div class="flex flex-wrap gap-2">
            <UiChip v-for="issueType in session.issueTypes" :key="issueType" tone="danger">{{ issueType }}</UiChip>
          </div>
        </UiPanel>

        <UiPanel v-if="session.metadata && Object.keys(session.metadata).length > 0" title="Session metadata">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div v-for="(value, key) in session.metadata" :key="key">
              <dt class="mb-1 font-medium text-ink-secondary">{{ key }}</dt>
              <dd class="break-all text-ink">{{ value }}</dd>
            </div>
          </dl>
        </UiPanel>
      </div>
    </template>

    <template v-else-if="loadProblem">
      <PageHero :back="backLink" title="Session replay" size="tool" />
      <UiEmptyState
        :title="loadProblem.notConfigured ? 'OpenReplay isn\'t connected' : 'This session could not be loaded'"
        :body="loadProblem.message"
        :spot="loadProblem.notConfigured ? 'site/session-replay' : 'patterns/error-handling'"
      />
    </template>
  </PageShell>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageShell, UiButton, UiChip, UiEmptyState, UiLink, UiPanel, UiSpinner, UiStat } from '../components/ui';
import apiClient from '../services/api.js';

const route = useRoute();
const session = ref(null);
const loading = ref(false);
const loadProblem = ref(null);

const backLink = computed(() => ({ to: `/hcd/session-replay/${route.params.id}/sessions`, label: 'Sessions' }));

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const loadSession = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/session-replay/projects/${route.params.id}/sessions/${route.params.sessionId}`
    );
    session.value = response.data;
    loadProblem.value = null;
  } catch (error) {
    const data = error.response?.data;
    loadProblem.value = {
      notConfigured: data?.code === 'OPENREPLAY_NOT_CONFIGURED',
      message: data?.message || 'Try again later.',
    };
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

onMounted(() => {
  loadSession();
});
</script>
