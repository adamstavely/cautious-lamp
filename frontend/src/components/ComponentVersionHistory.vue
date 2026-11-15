<template>
  <div data-version-history>
    <div v-if="loading && !loaded" class="flex justify-center py-12">
      <UiSpinner label="Loading version history…" />
    </div>

    <UiCallout v-else-if="error" tone="danger" role="alert" title="Version history couldn't be loaded">
      {{ error }}
      <template #actions>
        <UiButton size="sm" icon="refresh-cw" label="Try again" @click="$emit('retry')" />
      </template>
    </UiCallout>

    <template v-else>
      <UiPanel v-if="versions.length > 0" flush>
        <ol class="divide-y divide-line-faint">
          <li v-for="version in versions" :key="version.version" class="p-6 space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <h3 class="text-lg font-semibold text-ink-strong">v{{ version.version }}</h3>
              <UiChip :tone="version.status === 'Current' ? 'success' : 'neutral'">{{ version.status }}</UiChip>
              <UiChip v-if="version.breaking" tone="danger">Breaking changes</UiChip>
            </div>
            <p class="text-sm text-ink">{{ version.description }}</p>
            <p class="flex flex-wrap gap-4 text-xs text-ink-muted">
              <span>Released {{ formatDate(version.releasedAt) }}</span>
              <span v-if="version.lastUpdated">Last updated {{ formatDate(version.lastUpdated) }}</span>
            </p>
            <ChangeList :changes="version.changelog" />
          </li>
        </ol>
      </UiPanel>

      <UiEmptyState
        v-else
        title="No versions recorded"
        body="Versions appear here when changes to this component are recorded with a version number in the design-system changelog."
        spot="admin/deprecation-manager"
      />

      <UiPanel v-if="unversioned.length > 0" title="Changes without a version" description="Recorded in the changelog, not yet part of a version." class="mt-6" flush>
        <ul class="divide-y divide-line-faint">
          <li v-for="entry in unversioned" :key="entry.id" class="px-6 py-4 space-y-2">
            <p class="flex flex-wrap gap-3 text-xs text-ink-muted">
              <span>{{ formatDate(entry.createdAt) }}</span>
              <span v-if="entry.author">{{ entry.author }}</span>
            </p>
            <ChangeList :changes="entry.changes" />
          </li>
        </ul>
      </UiPanel>
    </template>
  </div>
</template>

<script setup>
import { h } from 'vue';
import { AppIcon, UiButton, UiCallout, UiChip, UiEmptyState, UiPanel, UiSpinner } from './ui';

/**
 * A component's version history from the design-system changelog
 * (useComponentChangelog): each version with its changes, then changes that
 * aren't part of a version yet.
 */
defineProps({
  versions: { type: Array, default: () => [] },
  unversioned: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loaded: { type: Boolean, default: false },
  error: { type: String, default: '' },
});
defineEmits(['retry']);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

const CHANGE_ICONS = {
  added: { icon: 'plus', tone: 'text-success', label: 'Added' },
  changed: { icon: 'arrow-right', tone: 'text-info', label: 'Changed' },
  deprecated: { icon: 'triangle-alert', tone: 'text-warning', label: 'Deprecated' },
  removed: { icon: 'minus', tone: 'text-danger', label: 'Removed' },
  breaking: { icon: 'triangle-alert', tone: 'text-danger', label: 'Breaking' },
};

const ChangeList = (props) =>
  h(
    'ul',
    { class: 'space-y-1 text-sm text-ink-secondary' },
    props.changes.map((change, index) => {
      const kind = CHANGE_ICONS[change.type] || CHANGE_ICONS.changed;
      return h('li', { key: index, class: 'flex items-start gap-2' }, [
        h(AppIcon, { name: kind.icon, class: `mt-0.5 shrink-0 ${kind.tone}`, 'aria-hidden': 'true' }),
        h('span', [h('span', { class: 'sr-only' }, `${kind.label}: `), change.description]),
      ]);
    }),
  );
ChangeList.props = ['changes'];
</script>
