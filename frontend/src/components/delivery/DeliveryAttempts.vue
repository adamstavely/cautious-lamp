<template>
  <div>
    <p v-if="!attempts.length" class="text-sm text-ink-secondary">{{ emptyText }}</p>
    <UiTable v-else :caption="caption" compact>
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">Channel</th>
          <th scope="col">Message</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="attempt in attempts" :key="attempt.id">
          <td class="whitespace-nowrap">
            <time :datetime="attempt.createdAt">{{ formatRelativeTime(attempt.createdAt) }}</time>
          </td>
          <td>
            <span class="block">{{ CHANNEL_LABELS[attempt.channel] || attempt.channel }}</span>
            <span class="block text-xs text-ink-muted break-all">{{ attempt.target }}</span>
          </td>
          <td>
            <span class="block">{{ attempt.title }}</span>
            <UiChip v-if="attempt.test" tone="info" class="mt-1">Test</UiChip>
          </td>
          <td>
            <UiChip :tone="STATUS[attempt.status]?.tone || 'neutral'" :icon="STATUS[attempt.status]?.icon">
              {{ STATUS[attempt.status]?.label || attempt.status }}
            </UiChip>
            <p v-if="attempt.error" class="mt-1 text-xs text-danger">{{ attempt.error }}</p>
            <p v-if="attempt.tries && attempt.tries.length > 1" class="mt-1 text-xs text-ink-muted">{{ attempt.tries.length }} tries</p>
          </td>
        </tr>
      </tbody>
    </UiTable>
  </div>
</template>

<script setup>
import { UiChip, UiTable } from '../ui';
import { formatRelativeTime } from '../../composables/useNotifications.js';

/** Recent deliveries to email, Slack, Teams and webhooks, as recorded by the server */
defineProps({
  attempts: { type: Array, default: () => [] },
  caption: { type: String, default: 'Recent deliveries, newest first' },
  emptyText: { type: String, default: 'Nothing has been sent yet.' },
});

const CHANNEL_LABELS = { email: 'Email', slack: 'Slack', teams: 'Microsoft Teams', webhook: 'Webhook' };
const STATUS = {
  sent: { label: 'Sent', tone: 'success', icon: 'check' },
  failed: { label: 'Failed', tone: 'danger', icon: 'triangle-alert' },
  refused: { label: 'Refused', tone: 'danger', icon: 'octagon-alert' },
  'not-configured': { label: 'Not set up', tone: 'warning', icon: 'triangle-alert' },
};
</script>
