<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Component dependency graph"
      lead="Which components are built from which, as recorded on each component in the library."
      spot="foundations/component-dependency-graph"
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
      <PageSection title="Graph" description="Arrows point from a component to the components that use it. Foundations sit at the top.">
        <UiEmptyState
          v-if="!edges.length"
          title="No dependencies recorded"
          :body="canEdit ? 'No component lists what it depends on yet. Record dependencies on a component below and the graph appears here.' : 'No component lists what it depends on yet. People who can edit components record them here.'"
          spot="foundations/component-dependency-graph"
        />

        <template v-else>
          <div class="flex flex-wrap items-end gap-4 mb-4">
            <UiSelect
              width="md"
              id="focus-component"
              v-model="focusId"
              label="Focus on"
              :options="[{ value: '', label: 'All components' }, ...components.map((c) => ({ value: c.id, label: c.name }))]"
            />
            <UiCheckbox v-if="focusId" v-model="showDependents" label="Include components that use it" />
          </div>

          <p :id="graphHelpId" class="mb-4 text-sm text-ink-secondary">
            Select a component to focus on it. The ring around each one shows its status, as in the key below.
            <UiLink href="#dependencies-list">The same relationships as a list</UiLink>
          </p>

          <UiPanel flush>
            <div class="graph-well">
              <!-- A group, not an image: the nodes inside are buttons and keep their own names -->
              <svg class="w-full" :viewBox="`0 0 ${layout.width} ${layout.height}`" role="group" :aria-label="graphSummary" :aria-describedby="graphHelpId">
                <defs>
                  <marker id="graph-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" class="fill-chart-neutral" />
                  </marker>
                </defs>
                <line
                  v-for="edge in visibleEdges"
                  :key="`${edge.from}-${edge.to}`"
                  :x1="layout.positions.get(edge.from).x"
                  :y1="layout.positions.get(edge.from).y + NODE_RADIUS + LABEL_SPACE"
                  :x2="layout.positions.get(edge.to).x"
                  :y2="layout.positions.get(edge.to).y - NODE_RADIUS - 4"
                  class="stroke-chart-neutral"
                  stroke-width="2"
                  marker-end="url(#graph-arrowhead)"
                />
                <g
                  v-for="node in visibleNodes"
                  :key="node.id"
                  class="graph-node"
                  role="button"
                  tabindex="0"
                  :aria-label="`Focus on ${node.name}, ${statusLabel(node.status)}`"
                  :aria-pressed="focusId === node.id"
                  @click="focusId = node.id"
                  @keydown.enter.prevent="focusId = node.id"
                  @keydown.space.prevent="focusId = node.id"
                >
                  <!-- Status without colour: a solid, dashed or dotted ring, or a strike for deprecated -->
                  <circle
                    v-if="node.status !== 'deprecated'"
                    :cx="layout.positions.get(node.id).x"
                    :cy="layout.positions.get(node.id).y"
                    :r="NODE_RADIUS + 5"
                    class="status-ring"
                    :class="statusRing(node.status)"
                  />
                  <circle
                    :cx="layout.positions.get(node.id).x"
                    :cy="layout.positions.get(node.id).y"
                    :r="NODE_RADIUS"
                    :class="[statusFill(node.status), focusId === node.id ? 'stroke-accent' : 'stroke-line']"
                    :stroke-width="focusId === node.id ? 4 : 2"
                  />
                  <line
                    v-if="node.status === 'deprecated'"
                    :x1="layout.positions.get(node.id).x - NODE_RADIUS - 4"
                    :y1="layout.positions.get(node.id).y + NODE_RADIUS + 4"
                    :x2="layout.positions.get(node.id).x + NODE_RADIUS + 4"
                    :y2="layout.positions.get(node.id).y - NODE_RADIUS - 4"
                    class="status-strike"
                  />
                  <text
                    :x="layout.positions.get(node.id).x"
                    :y="layout.positions.get(node.id).y + NODE_RADIUS + 18"
                    text-anchor="middle"
                    class="text-xs font-medium fill-ink pointer-events-none"
                  >
                    {{ node.name }}
                  </text>
                </g>
              </svg>

              <ul class="graph-legend" aria-label="Status key">
                <li v-for="stage in STATUSES" :key="stage.value" class="flex items-center gap-2">
                  <svg class="w-5 h-5" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                    <circle v-if="stage.value !== 'deprecated'" cx="10" cy="10" r="8.5" class="status-ring" :class="statusRing(stage.value)" />
                    <circle cx="10" cy="10" r="6" :class="statusFill(stage.value)" />
                    <line v-if="stage.value === 'deprecated'" x1="2" y1="18" x2="18" y2="2" class="status-strike" />
                  </svg>
                  <span class="text-xs text-ink-secondary">{{ stage.label }}</span>
                </li>
              </ul>
            </div>
          </UiPanel>
        </template>
      </PageSection>

      <PageSection id="dependencies-list" title="Dependencies by component" description="The same relationships as a list." divided>
        <UiTable caption="Component dependencies" bordered>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Status</th>
              <th scope="col">Depends on</th>
              <th scope="col">Used by</th>
              <th v-if="canEdit" scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="component in components" :key="component.id">
              <th scope="row" class="font-medium text-ink-strong whitespace-nowrap">{{ component.name }}</th>
              <td class="whitespace-nowrap"><UiChip :tone="statusTone(component.status)">{{ statusLabel(component.status) }}</UiChip></td>
              <td class="text-ink-secondary">{{ names(dependenciesOf(component.id)) }}</td>
              <td class="text-ink-secondary">{{ names(dependentsOf(component.id)) }}</td>
              <td v-if="canEdit" class="whitespace-nowrap">
                <UiButton size="sm" icon="pencil" @click="openEdit(component)">Edit<span class="sr-only"> dependencies of {{ component.name }}</span></UiButton>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </PageSection>
    </template>

    <UiDialog :open="!!editing" :title="editing ? `What ${editing.component.name} depends on` : 'Dependencies'" @update:open="(open) => { if (!open) editing = null; }">
      <div v-if="editing" class="space-y-4">
        <p class="text-ink-secondary">Choose the components it's built from. A component can't depend on one that already depends on it.</p>
        <div class="grid sm:grid-cols-2 gap-3">
          <UiCheckbox
            v-for="option in components.filter((c) => c.id !== editing.component.id)"
            :key="option.id"
            v-model="editing.dependencies"
            :value="option.id"
            :label="option.name"
          />
        </div>
        <UiCallout v-if="editing.error" tone="danger" role="alert">{{ editing.error }}</UiCallout>
      </div>
      <template #footer>
        <UiButton @click="editing = null">Cancel</UiButton>
        <UiButton variant="primary" :loading="saving" @click="saveDependencies">Save dependencies</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { computed, ref, useId } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiChip, UiDialog, UiEmptyState, UiLink, UiPanel, UiSelect, UiSpinner, UiTable } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import { STATUSES, statusLabel, statusTone, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * The dependency graph of the components the caller can see, from each
 * component's `dependencies` (GET /api/v1/components). component:edit holders
 * record dependencies with PUT /components/:id/dependencies.
 */
const { components, loadingComponents, componentsError, loadComponents, upsertComponent } = useComponentPatternStatus();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const canEdit = computed(() => hasPermission('component:edit'));

const NODE_RADIUS = 24;
/** Room under a node for its name, so arrows start below it */
const LABEL_SPACE = 26;
const COLUMN = 150;
const ROW = 120;

/** Fill colour plus a ring style, so status doesn't rely on colour alone (deprecated gets a strike instead of a ring) */
const STATUS_CLASSES = {
  production: { fill: 'fill-success-solid', ring: 'status-ring-solid' },
  'in-progress': { fill: 'fill-warning-solid', ring: 'status-ring-dashed' },
  planned: { fill: 'fill-info-solid', ring: 'status-ring-dotted' },
  deprecated: { fill: 'fill-danger-solid', ring: '' },
};
const statusFill = (status) => STATUS_CLASSES[status]?.fill ?? 'fill-chart-neutral';
const statusRing = (status) => STATUS_CLASSES[status]?.ring ?? 'status-ring-solid';
const graphHelpId = useId();

const byId = computed(() => new Map(components.value.map((c) => [c.id, c])));

/** Dependency → dependent, only between components the caller can see */
const edges = computed(() =>
  components.value.flatMap((c) => (c.dependencies ?? []).filter((dep) => byId.value.has(dep)).map((dep) => ({ from: dep, to: c.id }))),
);

const dependenciesOf = (id) => edges.value.filter((e) => e.to === id).map((e) => e.from);
const dependentsOf = (id) => edges.value.filter((e) => e.from === id).map((e) => e.to);
const names = (ids) => (ids.length ? ids.map((id) => byId.value.get(id)?.name ?? id).join(', ') : 'Nothing');

const focusId = ref('');
const showDependents = ref(true);

const visibleIds = computed(() => {
  if (!focusId.value) return new Set(components.value.map((c) => c.id));
  const ids = new Set([focusId.value, ...dependenciesOf(focusId.value)]);
  if (showDependents.value) dependentsOf(focusId.value).forEach((id) => ids.add(id));
  return ids;
});
const visibleNodes = computed(() => components.value.filter((c) => visibleIds.value.has(c.id)));
const visibleEdges = computed(() => edges.value.filter((e) => visibleIds.value.has(e.from) && visibleIds.value.has(e.to)));

/** Rows by depth: components with no dependencies first, each other one a row below its deepest dependency */
const layout = computed(() => {
  const depth = new Map();
  const depthOf = (id, trail = new Set()) => {
    if (depth.has(id)) return depth.get(id);
    if (trail.has(id)) return 0; // the server refuses cycles; this only guards the drawing
    trail.add(id);
    const deps = dependenciesOf(id).filter((dep) => visibleIds.value.has(dep));
    const level = deps.length ? Math.max(...deps.map((dep) => depthOf(dep, trail))) + 1 : 0;
    depth.set(id, level);
    return level;
  };
  const rows = [];
  for (const node of visibleNodes.value) {
    const level = depthOf(node.id);
    (rows[level] ??= []).push(node.id);
  }
  const widest = Math.max(1, ...rows.map((row) => row?.length ?? 0));
  const width = widest * COLUMN;
  const positions = new Map();
  rows.forEach((row, level) => {
    row.forEach((id, index) => {
      positions.set(id, { x: width / 2 + (index - (row.length - 1) / 2) * COLUMN, y: ROW / 2 + level * ROW });
    });
  });
  return { width, height: rows.length * ROW + NODE_RADIUS, positions };
});

const graphSummary = computed(() => {
  const parts = visibleNodes.value
    .map((node) => ({ node, deps: dependenciesOf(node.id).filter((id) => visibleIds.value.has(id)) }))
    .filter(({ deps }) => deps.length)
    .map(({ node, deps }) => `${node.name} depends on ${names(deps)}`);
  return `Component dependency graph. ${parts.join('. ')}.`;
});

const editing = ref(null);
const saving = ref(false);

const openEdit = (component) => {
  editing.value = { component, dependencies: [...dependenciesOf(component.id)], error: '' };
};

const saveDependencies = async () => {
  const { component, dependencies } = editing.value;
  saving.value = true;
  try {
    const { data } = await apiClient.put(`/api/v1/components/${encodeURIComponent(component.id)}/dependencies`, { dependencies });
    upsertComponent(data);
    showNotice(`Saved what ${data.name} depends on.`, 'success');
    editing.value = null;
  } catch (error) {
    editing.value.error = apiErrorMessage(error, "The dependencies couldn't be saved.");
  } finally {
    saving.value = false;
  }
};

loadComponents();
</script>

<style scoped>
.graph-well {
  @apply relative p-6 bg-surface-sunken;
}
.graph-node {
  @apply cursor-pointer focus-visible:outline focus-visible:outline-2 outline-focus;
}
.graph-node circle {
  @apply transition-opacity;
}
.graph-node:hover circle {
  @apply opacity-80;
}
.status-ring {
  @apply fill-none stroke-ink-strong;
  stroke-width: 2;
}
.status-ring-dashed {
  stroke-dasharray: 6 4;
}
.status-ring-dotted {
  stroke-dasharray: 0 5;
  stroke-linecap: round;
  stroke-width: 3;
}
.status-strike {
  @apply stroke-ink-strong pointer-events-none;
  stroke-width: 3;
  stroke-linecap: round;
}
.graph-legend {
  @apply mt-4 flex flex-wrap gap-4;
}
</style>
