<template>
  <div class="max-w-7xl mx-auto mb-16">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-2 flex items-center gap-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
        <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">account_tree</span>
        Component Dependencies
      </h2>
      <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        Visualize dependencies and relationships for this component.
      </p>
    </div>

    <div 
      class="rounded-lg shadow-sm border overflow-hidden"
      :class="isDarkMode 
        ? 'bg-slate-900 border-gray-700' 
        : 'bg-white border-gray-200'"
    >
      <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
        <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
          Dependency Graph
        </h3>
      </div>
      <div class="p-8 min-h-[400px] relative" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
        <div v-if="!currentComponent || componentDependencies.length === 0" class="flex flex-col items-center justify-center h-[400px]">
          <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">account_tree</span>
          <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ !currentComponent ? 'Component not found' : 'No dependencies' }}
          </p>
          <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
            {{ !currentComponent ? 'Unable to load dependency information.' : 'This component has no dependencies.' }}
          </p>
        </div>
        <svg v-else ref="graphSvg" class="w-full h-full" viewBox="0 0 800 400">
          <!-- Render edges -->
          <g v-for="edge in filteredEdges" :key="`${edge.from}-${edge.to}`">
            <line
              :x1="getNodePosition(edge.from).x"
              :y1="getNodePosition(edge.from).y"
              :x2="getNodePosition(edge.to).x"
              :y2="getNodePosition(edge.to).y"
              stroke="#6366f1"
              stroke-width="2"
              opacity="0.4"
              marker-end="url(#arrowhead)"
            />
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
            </marker>
          </defs>
          <!-- Render nodes -->
          <g v-for="node in filteredNodes" :key="node.id">
            <circle
              :cx="getNodePosition(node.id).x"
              :cy="getNodePosition(node.id).y"
              :r="node.size || 30"
              :fill="getNodeColor(node.status)"
              :stroke="componentId === node.id ? '#818cf8' : '#e5e7eb'"
              :stroke-width="componentId === node.id ? '3' : '2'"
              class="cursor-pointer transition-all"
              @click="handleNodeClick(node.id)"
            />
            <text
              :x="getNodePosition(node.id).x"
              :y="getNodePosition(node.id).y + 5"
              text-anchor="middle"
              class="text-xs font-medium fill-white pointer-events-none"
            >
              {{ node.name.substring(0, 10) }}
            </text>
          </g>
        </svg>
        
        <!-- Legend -->
        <div v-if="componentDependencies.length > 0" class="absolute bottom-4 left-4 flex flex-wrap gap-4 p-4 rounded-lg backdrop-blur-sm"
          :class="isDarkMode ? 'bg-slate-900/80 border border-gray-700' : 'bg-white/80 border border-gray-200'"
        >
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-green-500"></div>
            <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Production</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">In Progress</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-blue-500"></div>
            <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Planned</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dependencies List -->
    <div v-if="componentDependencies.length > 0" class="mt-6">
      <div 
        class="rounded-lg shadow-sm border p-6"
        :class="isDarkMode 
          ? 'bg-slate-900 border-gray-700' 
          : 'bg-white border-gray-200'"
      >
        <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
          Dependencies ({{ componentDependencies.length }})
        </h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <router-link
            v-for="dep in componentDependencies"
            :key="dep.id"
            :to="`/components/${dep.id}`"
            class="block px-4 py-3 rounded-lg border transition-colors"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-800 text-gray-300 hover:bg-slate-700' 
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-3 h-3 rounded-full flex-shrink-0"
                :class="getStatusColor(dep.status)"
              ></div>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ dep.name }}</div>
                <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ dep.description }}
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  componentId: {
    type: String,
    required: false,
    default: null
  }
});

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
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

const getNodeColor = (status) => {
  const colors = {
    'production': '#10b981',
    'in-progress': '#f59e0b',
    'planned': '#3b82f6',
    'deprecated': '#ef4444'
  };
  return colors[status] || '#6b7280';
};

const getStatusColor = (status) => {
  const colors = {
    'production': 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    'planned': 'bg-blue-500',
    'deprecated': 'bg-red-500'
  };
  return colors[status] || 'bg-gray-500';
};

const handleNodeClick = (nodeId) => {
  if (nodeId !== props.componentId) {
    router.push(`/components/${nodeId}`);
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
</style>

