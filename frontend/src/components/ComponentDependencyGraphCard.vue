<template>
  <PageSection title="Component dependencies" description="Visualize dependencies and relationships for this component." divided>
    <UiPanel title="Dependency graph" flush>
      <div class="graph-well">
        <UiEmptyState
          v-if="!currentComponent || componentDependencies.length === 0"
          :bordered="false"
          spot="foundations/component-dependency-graph"
          :title="!currentComponent ? 'Component not found' : 'No dependencies'"
          :body="!currentComponent ? 'Unable to load dependency information.' : 'This component has no dependencies.'"
        />
        <svg
          v-else
          ref="graphSvg"
          class="w-full h-96"
          viewBox="0 0 800 400"
          role="img"
          :aria-label="`${currentComponent.name} depends on ${componentDependencies.map((d) => d.name).join(', ')}`"
        >
          <defs>
            <marker id="dependency-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" class="fill-chart-neutral" />
            </marker>
          </defs>
          <!-- Edges -->
          <line
            v-for="edge in filteredEdges"
            :key="`${edge.from}-${edge.to}`"
            :x1="getNodePosition(edge.from).x"
            :y1="getNodePosition(edge.from).y"
            :x2="getNodePosition(edge.to).x"
            :y2="getNodePosition(edge.to).y"
            class="stroke-chart-neutral"
            stroke-width="2"
            marker-end="url(#dependency-arrowhead)"
          />
          <!-- Nodes -->
          <g
            v-for="node in filteredNodes"
            :key="node.id"
            class="graph-node"
            :class="{ 'graph-node-link': node.id !== componentId }"
            :role="node.id !== componentId ? 'link' : undefined"
            :tabindex="node.id !== componentId ? 0 : undefined"
            :aria-label="node.id !== componentId ? `Open ${node.name}` : undefined"
            @click="handleNodeClick(node.id)"
            @keydown.enter="handleNodeClick(node.id)"
          >
            <circle
              :cx="getNodePosition(node.id).x"
              :cy="getNodePosition(node.id).y"
              :r="node.size || 30"
              :class="[statusFill(node.status), componentId === node.id ? 'stroke-accent' : 'stroke-line']"
              :stroke-width="componentId === node.id ? 3 : 2"
            />
            <text
              :x="getNodePosition(node.id).x"
              :y="getNodePosition(node.id).y + (node.size || 30) + 16"
              text-anchor="middle"
              class="text-xs font-medium fill-ink pointer-events-none"
            >
              {{ node.name }}
            </text>
          </g>
        </svg>

        <!-- Legend -->
        <ul v-if="componentDependencies.length > 0" class="graph-legend" aria-label="Status legend">
          <li v-for="item in legend" :key="item.status" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-pill" :class="statusBg(item.status)" aria-hidden="true"></span>
            <span class="text-xs text-ink-secondary">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </UiPanel>

    <!-- Dependencies list -->
    <UiPanel v-if="componentDependencies.length > 0" :title="`Dependencies (${componentDependencies.length})`" class="mt-6">
      <ul class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <li v-for="dep in componentDependencies" :key="dep.id">
          <router-link :to="`/components/${dep.id}`" class="dependency-link">
            <span class="w-3 h-3 rounded-pill flex-shrink-0 mt-1" :class="statusBg(dep.status)" aria-hidden="true"></span>
            <span class="flex-1 min-w-0">
              <span class="block font-medium text-ink-strong truncate">{{ dep.name }}</span>
              <span class="block text-xs mt-1 text-ink-muted">{{ dep.description }} · {{ statusLabel(dep.status) }}</span>
            </span>
          </router-link>
        </li>
      </ul>
    </UiPanel>
  </PageSection>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PageSection, UiEmptyState, UiPanel } from './ui';

/** A "Component dependencies" page section for a component detail page: a graph of the component and what it depends on, and links to each dependency. */

const props = defineProps({
  componentId: {
    type: String,
    required: false,
    default: null
  }
});

const router = useRouter();
const graphSvg = ref(null);

// Component data with dependencies - this should match the data from ComponentDependencyGraph.vue
const allComponents = ref([
  { id: 'button', name: 'Button', status: 'production', description: 'Primary action component', dependencies: [] },
  { id: 'card', name: 'Card', status: 'production', description: 'Container component', dependencies: ['button'] },
  { id: 'input', name: 'Input', status: 'production', description: 'Text input field', dependencies: [] },
  { id: 'select', name: 'Select', status: 'production', description: 'Dropdown select', dependencies: ['input'] },
  { id: 'checkbox', name: 'Checkbox', status: 'production', description: 'Checkbox input', dependencies: ['input'] },
  { id: 'radio', name: 'Radio', status: 'production', description: 'Radio button group', dependencies: ['input'] },
  { id: 'textarea', name: 'Textarea', status: 'production', description: 'Multi-line text input', dependencies: ['input'] },
  { id: 'badge', name: 'Badge', status: 'production', description: 'Status badge', dependencies: [] },
  { id: 'alert', name: 'Alert', status: 'production', description: 'Alert notification', dependencies: ['button'] },
  { id: 'form', name: 'Form', status: 'in-progress', description: 'Form container', dependencies: ['input', 'select', 'checkbox', 'radio', 'textarea', 'button'] },
  { id: 'modal', name: 'Modal', status: 'production', description: 'Modal dialog', dependencies: ['button', 'card'] },
  { id: 'dropdown', name: 'Dropdown', status: 'production', description: 'Dropdown menu', dependencies: ['button', 'card'] },
  { id: 'tabs', name: 'Tabs', status: 'production', description: 'Tab navigation', dependencies: ['button'] },
  { id: 'table', name: 'Table', status: 'production', description: 'Data table', dependencies: ['button', 'badge'] },
  { id: 'pagination', name: 'Pagination', status: 'production', description: 'Page navigation', dependencies: ['button'] },
  { id: 'color-picker', name: 'Color Picker', status: 'production', description: 'Color selection component', dependencies: [] },
]);

// Get the current component
const currentComponent = computed(() => {
  if (!props.componentId) return null;
  return allComponents.value.find(c => c.id === props.componentId);
});

// Get dependencies for the current component
const componentDependencies = computed(() => {
  if (!currentComponent.value || !props.componentId) return [];
  
  return currentComponent.value.dependencies
    .map(depId => allComponents.value.find(c => c.id === depId))
    .filter(Boolean);
});

// Dependency edges for the graph
const edges = computed(() => {
  const edgeList = [];
  allComponents.value.forEach(comp => {
    comp.dependencies.forEach(dep => {
      edgeList.push({ from: dep, to: comp.id });
    });
  });
  return edgeList;
});

// Filter nodes to show only the current component and its dependencies
const filteredNodes = computed(() => {
  if (!currentComponent.value || !props.componentId) return [];
  
  const related = new Set([props.componentId]);
  
  // Add dependencies
  currentComponent.value.dependencies.forEach(dep => related.add(dep));
  
  return allComponents.value
    .filter(c => related.has(c.id))
    .map(c => ({ 
      ...c, 
      size: c.id === props.componentId ? 40 : 30 
    }));
});

// Filter edges to show only edges related to the current component
const filteredEdges = computed(() => {
  if (!currentComponent.value || !props.componentId) return [];
  
  const related = new Set([props.componentId]);
  currentComponent.value.dependencies.forEach(dep => related.add(dep));
  
  return edges.value.filter(e => 
    related.has(e.from) && related.has(e.to) && e.to === props.componentId
  );
});

const getNodePosition = (nodeId) => {
  const index = filteredNodes.value.findIndex(n => n.id === nodeId);
  if (index === -1) return { x: 400, y: 200 };
  
  const total = filteredNodes.value.length;
  
  if (total === 1) {
    // Only the current component, center it
    return { x: 400, y: 200 };
  }
  
  // Current component in center, dependencies around it
  if (nodeId === props.componentId) {
    return { x: 400, y: 200 };
  }
  
  // Dependencies arranged in a circle around the center
  const depIndex = filteredNodes.value.findIndex(n => n.id === nodeId && n.id !== props.componentId);
  const angle = (depIndex / (total - 1)) * Math.PI * 2;
  const radius = 150;
  const centerX = 400;
  const centerY = 200;
  
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
};

const STATUS = {
  production: { label: 'Production', fill: 'fill-success-solid', bg: 'bg-success-solid' },
  'in-progress': { label: 'In progress', fill: 'fill-warning-solid', bg: 'bg-warning-solid' },
  planned: { label: 'Planned', fill: 'fill-info-solid', bg: 'bg-info-solid' },
  deprecated: { label: 'Deprecated', fill: 'fill-danger-solid', bg: 'bg-danger-solid' },
};
const legend = ['production', 'in-progress', 'planned'].map((status) => ({ status, label: STATUS[status].label }));

const statusFill = (status) => STATUS[status]?.fill || 'fill-chart-neutral';
const statusBg = (status) => STATUS[status]?.bg || 'bg-chart-neutral';
const statusLabel = (status) => STATUS[status]?.label || status;

const handleNodeClick = (nodeId) => {
  if (nodeId !== props.componentId) {
    router.push(`/components/${nodeId}`);
  }
};
</script>

<style scoped>
.graph-well {
  @apply relative p-6 bg-surface-sunken;
}
.graph-node-link {
  @apply cursor-pointer focus-visible:outline focus-visible:outline-2 outline-focus;
}
.graph-node circle {
  @apply transition-opacity;
}
.graph-node-link:hover circle {
  @apply opacity-80;
}
.graph-legend {
  @apply mt-4 flex flex-wrap gap-4;
}
.dependency-link {
  @apply flex items-start gap-3 px-4 py-3 rounded-tile border border-line bg-surface-sunken text-sm transition-colors hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
