<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Component status"
      lead="Where every component in the library stands, from planned to deprecated."
      spot="admin/component-status"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiSpinner v-if="loadingComponents && !components.length" label="Loading components…" />

    <UiCallout v-else-if="componentsError" tone="danger" title="Components couldn't be loaded" role="alert">
      {{ apiErrorMessage(componentsError) }}
      <template #actions>
        <UiButton size="sm" icon="refresh-cw" @click="loadComponents">Try again</UiButton>
      </template>
    </UiCallout>

    <template v-else>
      <PageSection title="Status overview" description="How many components sit at each stage.">
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
        title="All components"
        :description="canEdit ? 'Change a status to save it for everyone.' : 'Statuses are set by people who can edit components.'"
        divided
      >
        <UiSegmented v-model="selectedStatus" label="Filter by status" :options="filterOptions" class="mb-6" />

        <UiTable v-if="filteredComponents.length" caption="Component status" bordered>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Status</th>
              <th scope="col">Depends on</th>
              <th scope="col">Last changed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in filteredComponents" :key="component.id">
              <th scope="row">
                <router-link v-if="componentPage(component.id)" :to="componentPage(component.id)" class="status-name">
                  {{ component.name }}
                </router-link>
                <span v-else class="status-name">{{ component.name }}</span>
                <span class="block text-sm font-normal text-ink-secondary">{{ component.description }}</span>
              </th>
              <td class="whitespace-nowrap">
                <div v-if="canEdit" class="w-44">
                  <UiSelect
                    :id="`status-${component.id}`"
                    :key="`${component.id}-${revision}`"
                    :model-value="component.status"
                    :label="`Status of ${component.name}`"
                    hide-label
                    size="sm"
                    :options="STATUS_OPTIONS"
                    @update:model-value="(status) => changeStatus(component, status)"
                  />
                </div>
                <UiChip v-else :tone="statusTone(component.status)">{{ statusLabel(component.status) }}</UiChip>
              </td>
              <td class="text-ink-secondary">{{ dependencyNames(component) }}</td>
              <td class="text-ink-secondary whitespace-nowrap">{{ component.updatedAt ? formatDate(component.updatedAt) : 'Not recorded' }}</td>
            </tr>
          </tbody>
        </UiTable>

        <UiEmptyState v-else-if="components.length" title="No components at this stage" :body="`Nothing is marked ${statusLabel(selectedStatus).toLowerCase()} right now.`">
          <template #actions>
            <UiButton @click="selectedStatus = ALL">Show all components</UiButton>
          </template>
        </UiEmptyState>

        <UiEmptyState v-else title="No components yet" body="Components added to the library appear here with their status." />
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiEmptyState, UiSegmented, UiSelect, UiSpinner, UiStat, UiTable } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import { STATUSES, STATUS_OPTIONS, componentPage, statusLabel, statusTone, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { useNotice } from '../composables/useNotice.js';
import { apiErrorMessage } from '../services/api.js';

/**
 * The library's components and their lifecycle status (GET /api/v1/components).
 * People with component:edit change a status here; the server checks it again.
 */
const { components, loadingComponents, componentsError, loadComponents, updateComponentStatus } = useComponentPatternStatus();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const canEdit = computed(() => hasPermission('component:edit'));

const ALL = 'all';
const revision = ref(0);
const selectedStatus = ref(ALL);

// UiStat has no info tone
const statTone = (tone) => (tone === 'info' ? 'neutral' : tone);

const counts = computed(() => Object.fromEntries(STATUSES.map((stage) => [stage.value, components.value.filter((c) => c.status === stage.value).length])));

const filterOptions = computed(() => [
  { value: ALL, label: `All (${components.value.length})` },
  ...STATUSES.map((stage) => ({ value: stage.value, label: `${stage.label} (${counts.value[stage.value]})` })),
]);

const filteredComponents = computed(() =>
  selectedStatus.value === ALL ? components.value : components.value.filter((c) => c.status === selectedStatus.value),
);

const namesById = computed(() => new Map(components.value.map((c) => [c.id, c.name])));
const dependencyNames = (component) => {
  const names = (component.dependencies ?? []).map((id) => namesById.value.get(id)).filter(Boolean);
  return names.length ? names.join(', ') : 'Nothing';
};

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const changeStatus = async (component, status) => {
  if (status === component.status) return;
  try {
    await updateComponentStatus(component.id, status);
    showNotice(`${component.name} is now ${statusLabel(status).toLowerCase()}.`, 'success');
  } catch (error) {
    // Redraw the selects so the refused choice doesn't stay on screen
    revision.value += 1;
    showNotice(apiErrorMessage(error, `${component.name}'s status couldn't be saved.`), 'error');
  }
};

loadComponents();
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
