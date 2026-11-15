<template>
  <PageShell>
    <PageHero
      :back="{ to: '/patterns', label: 'Patterns' }"
      title="Pattern status"
      lead="Where every pattern in the patterns library stands, from planned to deprecated."
      spot="admin/pattern-status"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiSpinner v-if="loadingPatterns && !patterns.length" label="Loading patterns…" />

    <UiCallout v-else-if="patternsError" tone="danger" title="Patterns couldn't be loaded" role="alert">
      {{ apiErrorMessage(patternsError) }}
      <template #actions>
        <UiButton size="sm" icon="refresh-cw" @click="loadPatterns">Try again</UiButton>
      </template>
    </UiCallout>

    <template v-else>
      <PageSection title="Status overview" description="How many patterns sit at each stage.">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UiStat
            v-for="stage in STATUSES"
            :key="stage.value"
            :label="stage.label"
            :icon="stage.icon"
            :tone="counts[stage.value] ? statTone(stage.tone) : 'neutral'"
            :value="counts[stage.value]"
          />
        </div>
      </PageSection>

      <PageSection
        title="All patterns"
        :description="canEdit ? 'Change a status to save it for everyone.' : 'Statuses are set by people who can edit patterns.'"
        divided
      >
        <UiSegmented v-model="selectedStatus" label="Filter by status" :options="filterOptions" class="mb-6" />

        <UiTable v-if="filteredPatterns.length" caption="Pattern status" bordered>
          <thead>
            <tr>
              <th scope="col">Pattern</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Last changed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pattern in filteredPatterns" :key="pattern.id">
              <th scope="row">
                <router-link v-if="patternPage(pattern.name)" :to="patternPage(pattern.name)" class="status-name">{{ pattern.name }}</router-link>
                <span v-else class="status-name">{{ pattern.name }}</span>
                <span class="block text-sm font-normal text-ink-secondary">{{ pattern.description }}</span>
              </th>
              <td class="whitespace-nowrap"><UiChip :tone="pattern.category === 'anti-pattern' ? 'warning' : 'neutral'">{{ categoryLabel(pattern.category) }}</UiChip></td>
              <td class="whitespace-nowrap">
                <div v-if="canEdit" class="w-44">
                  <UiSelect
                    :id="`status-${pattern.id}`"
                    :key="`${pattern.id}-${revision}`"
                    :model-value="pattern.status"
                    :label="`Status of ${pattern.name}`"
                    hide-label
                    size="sm"
                    :options="STATUS_OPTIONS"
                    @update:model-value="(status) => changeStatus(pattern, status)"
                  />
                </div>
                <UiChip v-else :tone="statusTone(pattern.status)">{{ statusLabel(pattern.status) }}</UiChip>
              </td>
              <td class="text-ink-secondary whitespace-nowrap">{{ formatDate(pattern.updatedAt) }}</td>
            </tr>
          </tbody>
        </UiTable>

        <UiEmptyState v-else-if="patterns.length" title="No patterns at this stage" :body="`Nothing is marked ${statusLabel(selectedStatus).toLowerCase()} right now.`">
          <template #actions>
            <UiButton @click="selectedStatus = ALL">Show all patterns</UiButton>
          </template>
        </UiEmptyState>

        <UiEmptyState v-else title="No patterns yet" body="Patterns added to the patterns library appear here with their status." />
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiEmptyState, UiSegmented, UiSelect, UiSpinner, UiStat, UiTable } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import { STATUSES, STATUS_OPTIONS, categoryLabel, patternPage, statusLabel, statusTone, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { useNotice } from '../composables/useNotice.js';
import { apiErrorMessage } from '../services/api.js';

/**
 * The patterns library's patterns and their lifecycle status
 * (GET /patterns-library/patterns). People with pattern:edit change a status
 * here; the server checks it again.
 */
const { patterns, loadingPatterns, patternsError, loadPatterns, updatePatternStatus } = useComponentPatternStatus();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const canEdit = computed(() => hasPermission('pattern:edit'));

const ALL = 'all';
const revision = ref(0);
const selectedStatus = ref(ALL);

// UiStat has no info tone
const statTone = (tone) => (tone === 'info' ? 'neutral' : tone);

const counts = computed(() => Object.fromEntries(STATUSES.map((stage) => [stage.value, patterns.value.filter((p) => p.status === stage.value).length])));

const filterOptions = computed(() => [
  { value: ALL, label: `All (${patterns.value.length})` },
  ...STATUSES.map((stage) => ({ value: stage.value, label: `${stage.label} (${counts.value[stage.value]})` })),
]);

const filteredPatterns = computed(() =>
  selectedStatus.value === ALL ? patterns.value : patterns.value.filter((p) => p.status === selectedStatus.value),
);

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not recorded');

const changeStatus = async (pattern, status) => {
  if (status === pattern.status) return;
  try {
    await updatePatternStatus(pattern.id, status);
    showNotice(`${pattern.name} is now ${statusLabel(status).toLowerCase()}.`, 'success');
  } catch (error) {
    // Redraw the selects so the refused choice doesn't stay on screen
    revision.value += 1;
    showNotice(apiErrorMessage(error, `${pattern.name}'s status couldn't be saved.`), 'error');
  }
};

loadPatterns();
</script>

<style scoped>
.status-name {
  @apply font-medium text-ink-strong;
}

a.status-name {
  @apply hover:text-accent-text hover:underline underline-offset-4;
  @apply rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
