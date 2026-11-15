<template>
  <PageShell width="wide">
    <PageHero :back="backLink" title="Session" spot="site/session-replay" size="tool">
      <template #lead>
        <span class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Session ID: <span class="font-code">{{ sessionId }}</span></span>
          <span v-if="route.query.userId">User: {{ route.query.userId }}</span>
          <span v-if="route.query.start">{{ formatDate(route.query.start) }}</span>
        </span>
      </template>
      <template v-if="replayUrl" #actions>
        <UiButton variant="primary" icon="external-link" :href="replayUrl" target="_blank" rel="noopener noreferrer">Watch in OpenReplay</UiButton>
      </template>
    </PageHero>

    <div class="space-y-6">
      <UiCallout v-if="linkProblem" tone="warning" title="No link to the replay">{{ linkProblem.message }}</UiCallout>
      <p v-else-if="replayUrl" class="text-sm text-ink-secondary">
        The replay plays in OpenReplay, where you sign in with your OpenReplay account. OpenReplay doesn't allow its player inside other sites.
      </p>

      <UiPanel title="Events" heading-tag="h2" :description="eventsDescription">
        <UiSpinner v-if="eventsLoading" label="Loading events…" />
        <UiEmptyState
          v-else-if="eventsProblem"
          :title="eventsProblem.code === 'OPENREPLAY_NOT_CONFIGURED' ? 'OpenReplay isn\'t connected' : 'Events could not be loaded'"
          :body="eventsProblem.message"
          :spot="eventsProblem.code === 'OPENREPLAY_NOT_CONFIGURED' ? 'site/session-replay' : 'patterns/error-handling'"
        />
        <UiEmptyState
          v-else-if="events && events.items.length === 0"
          title="No events in this window"
          body="OpenReplay returned no events for this session in the time shown."
          spot="patterns/empty-loading-states"
        />
        <template v-else-if="events">
          <UiTable caption="Session events" compact>
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Event</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events.items" :key="event.id">
                <td class="whitespace-nowrap">{{ formatTime(event.time) }}</td>
                <td>
                  <span class="flex items-center gap-2">
                    {{ event.name }}
                    <UiChip v-if="!event.autoCaptured" tone="info">Custom</UiChip>
                  </span>
                </td>
                <td class="break-all font-code text-xs text-ink-secondary">{{ summarize(event.properties) }}</td>
              </tr>
            </tbody>
          </UiTable>
          <nav class="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Event pages">
            <p class="text-sm text-ink-secondary" aria-live="polite">{{ pageSummary }}</p>
            <div class="flex gap-2">
              <UiButton size="sm" icon="chevron-left" :disabled="events.page <= 1" @click="loadEvents(events.page - 1)">Previous</UiButton>
              <UiButton size="sm" trailing-icon="chevron-right" :disabled="!hasNextPage" @click="loadEvents(events.page + 1)">Next</UiButton>
            </div>
          </nav>
        </template>
      </UiPanel>
    </div>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageShell, UiButton, UiCallout, UiChip, UiEmptyState, UiPanel, UiSpinner, UiTable } from '../components/ui';
import { REPLAY_API, replayProblem } from '../components/session-replay/replayApi.js';
import apiClient from '../services/api.js';

const route = useRoute();
const sessionId = computed(() => String(route.params.sessionId));
const sessionPath = () => `${REPLAY_API}/projects/${encodeURIComponent(route.params.id)}/sessions/${encodeURIComponent(sessionId.value)}`;
const backLink = computed(() => ({ to: `/hcd/session-replay/${route.params.id}/sessions`, label: 'Sessions' }));

const replayUrl = ref('');
const linkProblem = ref(null);
const events = ref(null);
const eventsLoading = ref(false);
const eventsProblem = ref(null);
const PAGE_SIZE = 50;

const eventsDescription = computed(() =>
  route.query.start ? 'What OpenReplay recorded during the session.' : 'What OpenReplay recorded in this session over the last 30 days.',
);
const hasNextPage = computed(() => !!events.value && events.value.page * events.value.limit < events.value.total);
const pageSummary = computed(() => {
  const p = events.value;
  if (!p || !p.items.length) return '';
  const first = (p.page - 1) * p.limit + 1;
  return `Events ${first}–${first + p.items.length - 1} of ${p.total}`;
});

const loadReplayUrl = async () => {
  try {
    replayUrl.value = (await apiClient.get(`${sessionPath()}/replay-url`)).data.url;
  } catch (error) {
    linkProblem.value = replayProblem(error, 'The link to OpenReplay could not be made.');
  }
};

const loadEvents = async (page = 1) => {
  eventsLoading.value = true;
  eventsProblem.value = null;
  // The session list passes the session's own time window; without it the server searches the last 30 days
  const params = { page, limit: PAGE_SIZE };
  if (route.query.start) params.startDate = String(route.query.start);
  if (route.query.end) params.endDate = String(route.query.end);
  try {
    events.value = (await apiClient.get(`${sessionPath()}/events`, { params })).data;
  } catch (error) {
    events.value = null;
    eventsProblem.value = replayProblem(error, 'Try again later.');
  } finally {
    eventsLoading.value = false;
  }
};

const summarize = (properties) => {
  const entries = Object.entries(properties ?? {}).slice(0, 4);
  return entries.length ? entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : '—';
};
const formatDate = (value) => new Date(String(value)).toLocaleString();
const formatTime = (value) => new Date(value).toLocaleTimeString();

onMounted(() => {
  loadReplayUrl();
  loadEvents();
});
</script>
