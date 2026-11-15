<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Component status"
      lead="Track the development status, availability and documentation coverage of every component in the design system."
      spot="admin/component-status"
    />

    <PageSection title="Status overview" description="How many components sit at each stage.">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <UiStat v-for="stage in stages" :key="stage.value" :label="stage.label" :icon="stage.icon" :tone="counts[stage.value] ? stage.statTone : 'neutral'" :value="counts[stage.value]" />
      </div>
    </PageSection>

    <PageSection title="All components" description="Choose a component to open its documentation." divided>
      <UiSegmented v-model="selectedStatus" label="Filter by status" :options="filterOptions" class="mb-6" />

      <UiTable v-if="filteredComponents.length" caption="Component status" bordered>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Status</th>
            <th scope="col">Version</th>
            <th scope="col">Documentation</th>
            <th scope="col">Last updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="component in filteredComponents" :key="component.name">
            <th scope="row">
              <router-link :to="getComponentRoute(component.name)" class="status-name">
                <AppIcon :name="component.icon" class="text-lg text-accent-text" />
                {{ component.name }}
              </router-link>
            </th>
            <td><UiChip :tone="statusTone(component.status)">{{ component.status }}</UiChip></td>
            <td class="text-ink-secondary whitespace-nowrap">{{ component.version }}</td>
            <td><UiChip :tone="documentationTone(component.documentation)">{{ component.documentation }}</UiChip></td>
            <td class="text-ink-secondary whitespace-nowrap">{{ component.lastUpdated }}</td>
          </tr>
        </tbody>
      </UiTable>

      <UiEmptyState v-else title="No components at this stage" :body="`Nothing is marked ${selectedStatus} right now.`">
        <template #actions>
          <UiButton @click="selectedStatus = ALL">Show all components</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiChip, UiEmptyState, UiSegmented, UiStat, UiTable } from '../components/ui';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const { components } = useComponentPatternStatus();

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
  Object.fromEntries(stages.map((stage) => [stage.value, components.value.filter((c) => c.status === stage.value).length])),
);

const filterOptions = computed(() => [
  { value: ALL, label: `All (${components.value.length})` },
  ...stages.map((stage) => ({ value: stage.value, label: `${stage.label} (${counts.value[stage.value]})` })),
]);

const filteredComponents = computed(() =>
  selectedStatus.value === ALL ? components.value : components.value.filter((c) => c.status === selectedStatus.value),
);

const statusTone = (status) => stages.find((stage) => stage.value === status)?.chipTone ?? 'neutral';

const documentationTone = (documentation) => {
  if (documentation === 'Complete') return 'success';
  if (documentation === 'Partial') return 'warning';
  return 'neutral';
};

// Components without a page of their own fall back to the components index
const routeMap = {
  Button: '/components/buttons',
  Input: '/components/forms',
  Card: '/components/cards',
  Modal: '/components',
  Dropdown: '/components',
  Checkbox: '/components/forms',
  Radio: '/components/forms',
  Switch: '/components/forms',
  'Color Picker': '/components/color-picker',
  Tabs: '/components/navigation',
  Accordion: '/components',
  Tooltip: '/components',
  Popover: '/components',
  Breadcrumbs: '/components/navigation',
  Pagination: '/components/navigation',
  'Data Table': '/components/data-display',
};

const getComponentRoute = (name) => routeMap[name] ?? `/components/${name.toLowerCase().replace(/\s+/g, '-')}`;
</script>

<style scoped>
.status-name {
  @apply inline-flex items-center gap-3 font-medium text-ink-strong whitespace-nowrap hover:text-accent-text hover:underline underline-offset-4;
  @apply rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
