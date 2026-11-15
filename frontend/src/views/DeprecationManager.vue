<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Deprecation manager"
      lead="Which components are deprecated, what replaces them and when they stop being supported."
      spot="admin/deprecation-manager"
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
      <PageSection title="Overview" description="Deprecated components and how close they are to their sunset date.">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UiStat label="Deprecated" icon="triangle-alert" :tone="deprecated.length ? 'warning' : 'neutral'" :value="deprecated.length" />
          <UiStat label="Sunset within 90 days" icon="calendar-clock" :tone="soon.length ? 'warning' : 'neutral'" :value="soon.length" />
          <UiStat label="Past their sunset date" icon="clock" :tone="past.length ? 'danger' : 'neutral'" :value="past.length" />
        </div>
      </PageSection>

      <PageSection title="Deprecated components" description="Sorted by sunset date, soonest first." divided>
        <div v-if="canEdit" class="mb-6">
          <UiButton variant="primary" icon="triangle-alert" :disabled="!active.length" @click="openDeprecate()">Deprecate a component</UiButton>
        </div>

        <UiCallout v-if="deprecated.length && usageError" tone="warning" class="mb-6">Usage couldn't be loaded, so it isn't shown.</UiCallout>
        <UiCallout v-else-if="deprecated.length && !usageAvailable" tone="info" class="mb-6">
          Usage isn't shown: no application scan has recorded component usage yet.
        </UiCallout>

        <UiTable v-if="deprecated.length" caption="Deprecated components" bordered>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Replacement</th>
              <th scope="col">Sunset</th>
              <th v-if="usageAvailable" scope="col">Usage</th>
              <th v-if="canEdit" scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in deprecated" :key="component.id">
              <th scope="row" class="align-top">
                <span class="font-medium text-ink-strong">{{ component.name }}</span>
                <span v-if="component.deprecation?.reason" class="block text-sm font-normal text-ink-secondary">{{ component.deprecation.reason }}</span>
                <details v-if="component.deprecation?.migrationGuide" class="mt-2 text-sm font-normal">
                  <summary class="cursor-pointer text-accent-text">Migration guide</summary>
                  <pre class="migration-guide">{{ component.deprecation.migrationGuide }}</pre>
                </details>
              </th>
              <td class="align-top whitespace-nowrap">{{ nameOf(component.deprecation?.replacement) ?? 'None named' }}</td>
              <td class="align-top whitespace-nowrap">
                <template v-if="component.deprecation?.sunsetDate">
                  <span class="block">{{ formatDay(component.deprecation.sunsetDate) }}</span>
                  <UiChip :tone="sunsetTone(component.deprecation.sunsetDate)">{{ sunsetLabel(component.deprecation.sunsetDate) }}</UiChip>
                </template>
                <span v-else class="text-ink-secondary">Not set</span>
              </td>
              <td v-if="usageAvailable" class="align-top whitespace-nowrap">{{ usageLabel(component.id) }}</td>
              <td v-if="canEdit" class="align-top whitespace-nowrap">
                <div class="flex gap-2">
                  <UiButton size="sm" icon="pencil" @click="openDeprecate(component)">Edit<span class="sr-only"> {{ component.name }}</span></UiButton>
                  <UiButton size="sm" icon="undo-2" @click="openRestore(component)">Undeprecate<span class="sr-only"> {{ component.name }}</span></UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </UiTable>

        <UiEmptyState v-else title="No deprecated components" body="Every component in the library is current." spot="admin/deprecation-manager" />
      </PageSection>
    </template>

    <!-- Deprecate, or edit a deprecation -->
    <UiDialog :open="!!form" :title="form?.editing ? `Edit deprecation of ${nameOf(form.id)}` : 'Deprecate a component'" @update:open="(open) => { if (!open) form = null; }">
      <form v-if="form" id="deprecation-form" class="space-y-5" @submit.prevent="saveDeprecation">
        <UiSelect
          v-if="!form.editing"
          id="deprecate-component"
          v-model="form.id"
          label="Component"
          required
          placeholder="Select a component"
          :error="form.errors.id"
          :options="active.map((c) => ({ value: c.id, label: c.name }))"
        />
        <UiSelect
          id="deprecate-replacement"
          v-model="form.replacement"
          label="Replacement"
          :options="replacementOptions"
          hint="The component to use instead"
        />
        <UiInput id="deprecate-sunset" v-model="form.sunsetDate" type="date" label="Sunset date" hint="When the component stops being supported" />
        <UiTextarea id="deprecate-reason" v-model="form.reason" label="Reason" :rows="2" />
        <UiTextarea id="deprecate-guide" v-model="form.migrationGuide" label="Migration guide" :rows="4" mono />
        <UiCallout v-if="form.error" tone="danger" role="alert">{{ form.error }}</UiCallout>
      </form>
      <template #footer>
        <UiButton @click="form = null">Cancel</UiButton>
        <UiButton type="submit" form="deprecation-form" variant="primary" :loading="saving">{{ form?.editing ? 'Save changes' : 'Deprecate' }}</UiButton>
      </template>
    </UiDialog>

    <!-- Undeprecate -->
    <UiDialog :open="!!restore" :title="restore ? `Undeprecate ${restore.component.name}` : 'Undeprecate'" size="sm" @update:open="(open) => { if (!open) restore = null; }">
      <div v-if="restore" class="space-y-5">
        <p class="text-ink-secondary">Its replacement, sunset date and migration guide are removed.</p>
        <UiSelect id="restore-status" v-model="restore.status" label="New status" required :options="restoreOptions" />
        <UiCallout v-if="restore.error" tone="danger" role="alert">{{ restore.error }}</UiCallout>
      </div>
      <template #footer>
        <UiButton @click="restore = null">Cancel</UiButton>
        <UiButton variant="primary" :loading="saving" @click="saveRestore">Undeprecate</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiDialog, UiEmptyState, UiInput, UiSelect, UiSpinner, UiStat, UiTable, UiTextarea } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import { STATUS_OPTIONS, statusLabel, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Deprecated components (status 'deprecated' in GET /api/v1/components) with
 * the replacement, sunset date, reason and migration guide stored on each.
 * component:edit holders deprecate (PUT /components/:id/deprecation) and
 * undeprecate (PUT /components/:id/status). Usage comes from application
 * scans (GET /analytics/component-popularity) and is only shown when a scan
 * has recorded some.
 */
const { components, loadingComponents, componentsError, loadComponents, updateComponentStatus, upsertComponent } = useComponentPatternStatus();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const canEdit = computed(() => hasPermission('component:edit'));

const DAY = 24 * 60 * 60 * 1000;
/** Whole days from today to a YYYY-MM-DD date (negative once it has passed) */
const daysUntil = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / DAY);
};

const deprecated = computed(() =>
  components.value
    .filter((c) => c.status === 'deprecated')
    .sort((a, b) => (a.deprecation?.sunsetDate ?? '9999').localeCompare(b.deprecation?.sunsetDate ?? '9999')),
);
const active = computed(() => components.value.filter((c) => c.status !== 'deprecated'));
const soon = computed(() => deprecated.value.filter((c) => c.deprecation?.sunsetDate && daysUntil(c.deprecation.sunsetDate) >= 0 && daysUntil(c.deprecation.sunsetDate) <= 90));
const past = computed(() => deprecated.value.filter((c) => c.deprecation?.sunsetDate && daysUntil(c.deprecation.sunsetDate) < 0));

const namesById = computed(() => new Map(components.value.map((c) => [c.id, c.name])));
const nameOf = (id) => (id ? namesById.value.get(id) ?? id : null);

const formatDay = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
const sunsetLabel = (day) => {
  const days = daysUntil(day);
  if (days < 0) return `${-days} ${-days === 1 ? 'day' : 'days'} ago`;
  if (days === 0) return 'Today';
  return `In ${days} ${days === 1 ? 'day' : 'days'}`;
};
const sunsetTone = (day) => {
  const days = daysUntil(day);
  if (days < 30) return 'danger';
  if (days <= 90) return 'warning';
  return 'neutral';
};

// Usage recorded by application scans
const usage = ref(new Map());
const usageError = ref(null);
const usageAvailable = computed(() => [...usage.value.values()].some((u) => u.totalUsage > 0));
const usageLabel = (id) => {
  const record = usage.value.get(id);
  if (!record || record.totalUsage === 0) return 'Not used';
  return `${record.totalUsage} ${record.totalUsage === 1 ? 'use' : 'uses'} in ${record.applicationCount} ${record.applicationCount === 1 ? 'application' : 'applications'}`;
};
const loadUsage = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/analytics/component-popularity');
    usage.value = new Map((Array.isArray(data) ? data : []).map((u) => [u.componentId, u]));
  } catch (error) {
    usageError.value = error;
  }
};

const saving = ref(false);
const form = ref(null);

const openDeprecate = (component) => {
  const details = component?.deprecation ?? {};
  form.value = {
    editing: !!component,
    id: component?.id ?? '',
    replacement: details.replacement ?? '',
    sunsetDate: details.sunsetDate ?? '',
    reason: details.reason ?? '',
    migrationGuide: details.migrationGuide ?? '',
    errors: {},
    error: '',
  };
};

const replacementOptions = computed(() => [
  { value: '', label: 'No replacement' },
  ...active.value.filter((c) => c.id !== form.value?.id).map((c) => ({ value: c.id, label: c.name })),
]);

const saveDeprecation = async () => {
  const current = form.value;
  current.errors = {};
  current.error = '';
  if (!current.id) {
    current.errors.id = 'Choose a component.';
    return;
  }
  saving.value = true;
  try {
    const { data } = await apiClient.put(`/api/v1/components/${encodeURIComponent(current.id)}/deprecation`, {
      replacement: current.replacement || undefined,
      sunsetDate: current.sunsetDate || undefined,
      reason: current.reason.trim() || undefined,
      migrationGuide: current.migrationGuide.trim() || undefined,
    });
    upsertComponent(data);
    showNotice(current.editing ? `Saved the deprecation of ${data.name}.` : `${data.name} is now deprecated.`, 'success');
    form.value = null;
  } catch (error) {
    current.error = apiErrorMessage(error, "The deprecation couldn't be saved.");
  } finally {
    saving.value = false;
  }
};

const restoreOptions = STATUS_OPTIONS.filter((o) => o.value !== 'deprecated');
const restore = ref(null);
const openRestore = (component) => {
  restore.value = { component, status: 'production', error: '' };
};
const saveRestore = async () => {
  const { component, status } = restore.value;
  saving.value = true;
  try {
    await updateComponentStatus(component.id, status);
    showNotice(`${component.name} is no longer deprecated; it's now ${statusLabel(status).toLowerCase()}.`, 'success');
    restore.value = null;
  } catch (error) {
    restore.value.error = apiErrorMessage(error, `${component.name} couldn't be undeprecated.`);
  } finally {
    saving.value = false;
  }
};

loadComponents();
loadUsage();
</script>

<style scoped>
.migration-guide {
  @apply mt-2 p-3 rounded-md bg-surface-sunken text-ink font-mono text-xs whitespace-pre-wrap;
}
</style>
