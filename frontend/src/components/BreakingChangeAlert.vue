<template>
  <div v-if="shouldShow" class="mt-8">
    <UiCallout tone="danger" icon="warning" role="alert">
      <div class="flex flex-wrap items-center gap-2 mb-1">
        <p class="font-semibold text-danger">Breaking changes detected</p>
        <UiChip tone="danger">{{ breakingChangesCount }} {{ breakingChangesCount === 1 ? 'change' : 'changes' }}</UiChip>
      </div>
      <p class="mb-3">This component has breaking changes that may require code updates. Review the migration guide below.</p>

      <ul class="flex flex-col gap-2 mb-4">
        <li v-for="(change, idx) in breakingChangesList" :key="idx" class="breaking-change">
          <span class="material-symbols-outlined text-base text-danger" aria-hidden="true">error</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-ink">{{ change.description }}</p>
            <p v-if="change.version" class="text-xs text-ink-muted mt-0.5">Introduced in v{{ change.version }}</p>
          </div>
        </li>
      </ul>

      <div class="flex flex-wrap items-center gap-3">
        <UiButton variant="danger" size="sm" icon="arrow_downward" label="View migration guide" @click="scrollToMigration" />
        <UiButton variant="ghost" size="sm" label="Dismiss" @click="dismissAlert" />
      </div>
    </UiCallout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { UiButton, UiCallout, UiChip } from './ui';

/**
 * Warns that a component's versions include breaking changes, lists them,
 * and links to the migration section (`[data-migration-section]`, else
 * `[data-version-history]`). Dismissal is remembered per `componentId` in
 * localStorage and emits `dismiss`.
 */
const props = defineProps({
  componentVersions: {
    type: Array,
    default: () => [],
  },
  componentId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['dismiss']);

const isDismissed = ref(false);

// Check if already dismissed on mount
const checkDismissed = () => {
  if (!props.componentId) {
    isDismissed.value = false;
    return;
  }
  const dismissed = JSON.parse(localStorage.getItem('dismissedBreakingChanges') || '[]');
  isDismissed.value = dismissed.includes(props.componentId);
};

const hasBreakingChanges = computed(() => {
  return props.componentVersions.some((v) => v.breaking === true);
});

const breakingChangesCount = computed(() => {
  return props.componentVersions.filter((v) => v.breaking === true).length;
});

const breakingChangesList = computed(() => {
  return props.componentVersions
    .filter((v) => v.breaking === true)
    .map((v) => ({
      version: v.version,
      description: v.migrationGuide || v.description || 'Breaking change in this version',
      changelog: v.changelog?.filter((c) => c.type === 'breaking') || [],
    }))
    .flatMap((v) =>
      v.changelog.length > 0
        ? v.changelog.map((c) => ({ version: v.version, description: c.description }))
        : [{ version: v.version, description: v.description }],
    );
});

const scrollToMigration = () => {
  // Find the migration section on the page
  const migrationSection = document.querySelector('[data-migration-section]');
  if (migrationSection) {
    migrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Fallback: scroll to version history
    const versionSection = document.querySelector('[data-version-history]');
    if (versionSection) {
      versionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const dismissAlert = () => {
  // Store dismissal in localStorage
  const dismissed = JSON.parse(localStorage.getItem('dismissedBreakingChanges') || '[]');
  if (!dismissed.includes(props.componentId)) {
    dismissed.push(props.componentId);
    localStorage.setItem('dismissedBreakingChanges', JSON.stringify(dismissed));
  }
  isDismissed.value = true;
  emit('dismiss');
};

const shouldShow = computed(() => {
  return hasBreakingChanges.value && !isDismissed.value;
});

onMounted(() => {
  checkDismissed();
});
</script>

<style scoped>
.breaking-change {
  @apply flex items-start gap-2 p-3 rounded-tile border border-danger-border bg-surface-raised;
}
</style>
