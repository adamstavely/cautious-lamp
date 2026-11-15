<template>
  <PageShell>
    <PageHero
      :back="{ to: '/patterns', label: 'Patterns' }"
      title="Pattern status"
      lead="Track the development status, availability and documentation coverage of every design and code pattern in the design system."
      spot="admin/pattern-status"
    />

    <PageSection title="Status overview" description="How many patterns sit at each stage.">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <UiStat v-for="stage in stages" :key="stage.value" :label="stage.label" :icon="stage.icon" :tone="counts[stage.value] ? stage.statTone : 'neutral'" :value="counts[stage.value]" />
      </div>
    </PageSection>

    <PageSection title="All patterns" description="Choose a pattern to open its guidance." divided>
      <UiSegmented v-model="selectedStatus" label="Filter by status" :options="filterOptions" class="mb-6" />

      <UiTable v-if="filteredPatterns.length" caption="Pattern status" bordered>
        <thead>
          <tr>
            <th scope="col">Pattern</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Category</th>
            <th scope="col">Documentation</th>
            <th scope="col">Last updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pattern in filteredPatterns" :key="pattern.name">
            <th scope="row">
              <router-link :to="pattern.route" class="status-name">
                <AppIcon :name="pattern.icon" class="text-lg text-accent-text" />
                {{ pattern.name }}
              </router-link>
            </th>
            <td><UiChip :tone="pattern.type === 'Design Pattern' ? 'accent' : 'info'">{{ pattern.type }}</UiChip></td>
            <td><UiChip :tone="statusTone(pattern.status)">{{ pattern.status }}</UiChip></td>
            <td class="text-ink-secondary whitespace-nowrap">{{ pattern.category }}</td>
            <td><UiChip :tone="documentationTone(pattern.documentation)">{{ pattern.documentation }}</UiChip></td>
            <td class="text-ink-secondary whitespace-nowrap">{{ pattern.lastUpdated }}</td>
          </tr>
        </tbody>
      </UiTable>

      <UiEmptyState v-else title="No patterns at this stage" :body="`Nothing is marked ${selectedStatus} right now.`">
        <template #actions>
          <UiButton @click="selectedStatus = ALL">Show all patterns</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiChip, UiEmptyState, UiSegmented, UiStat, UiTable } from '../components/ui';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const { patterns } = useComponentPatternStatus();

const ALL = 'all';
const selectedStatus = ref(ALL);

const stages = [
  { value: 'Production Ready', label: 'Production ready', icon: 'circle-check', statTone: 'success', chipTone: 'success' },
  { value: 'Planned', label: 'Planned', icon: 'calendar-check', statTone: 'neutral', chipTone: 'info' },
  { value: 'In Progress', label: 'In progress', icon: 'loader-circle', statTone: 'accent', chipTone: 'accent' },
  { value: 'Sunsetting', label: 'Sunsetting', icon: 'clock', statTone: 'warning', chipTone: 'warning' },
  { value: 'Experimental', label: 'Experimental', icon: 'flask-conical', statTone: 'neutral', chipTone: 'neutral' },
  { value: 'Deprecated', label: 'Deprecated', icon: 'triangle-alert', statTone: 'danger', chipTone: 'danger' },
];

const counts = computed(() =>
  Object.fromEntries(stages.map((stage) => [stage.value, patterns.value.filter((p) => p.status === stage.value).length])),
);

const filterOptions = computed(() => [
  { value: ALL, label: `All (${patterns.value.length})` },
  ...stages.map((stage) => ({ value: stage.value, label: `${stage.label} (${counts.value[stage.value]})` })),
]);

const filteredPatterns = computed(() =>
  selectedStatus.value === ALL ? patterns.value : patterns.value.filter((p) => p.status === selectedStatus.value),
);

const statusTone = (status) => stages.find((stage) => stage.value === status)?.chipTone ?? 'neutral';

const documentationTone = (documentation) => {
  if (documentation === 'Complete') return 'success';
  if (documentation === 'Partial') return 'warning';
  return 'neutral';
};
</script>

<style scoped>
.status-name {
  @apply inline-flex items-center gap-3 font-medium text-ink-strong whitespace-nowrap hover:text-accent-text hover:underline underline-offset-4;
  @apply rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
