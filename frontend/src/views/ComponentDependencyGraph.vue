<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Dependency Graph
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Visualize component relationships, dependencies, and understand how components work together.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="max-w-7xl mx-auto mb-6">
          <div class="flex flex-wrap items-center gap-4">
            <select
              v-model="selectedComponent"
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="">All Components</option>
              <option v-for="comp in components" :key="comp.id" :value="comp.id">
                {{ comp.name }}
              </option>
            </select>
            <button
              @click="layoutType = 'hierarchical'"
              class="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
              :class="layoutType === 'hierarchical'
                ? (isDarkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                : (isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')"
            >
              Hierarchical
            </button>
            <button
              @click="layoutType = 'force'"
              class="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
              :class="layoutType === 'force'
                ? (isDarkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                : (isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')"
            >
              Force-Directed
            </button>
            <button
              @click="showDependents = !showDependents"
              class="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
              :class="showDependents
                ? (isDarkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                : (isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')"
            >
              Show Dependents
            </button>
          </div>
        </div>

        <!-- Graph Visualization -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Component Relationships
              </h3>
            </div>
            <div class="p-8 min-h-[600px] relative" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
              <svg ref="graphSvg" class="w-full h-full" viewBox="0 0 800 600">
                <!-- Render nodes and edges -->
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
                <g v-for="node in filteredNodes" :key="node.id">
                  <circle
                    :cx="getNodePosition(node.id).x"
                    :cy="getNodePosition(node.id).y"
                    :r="node.size || 30"
                    :fill="getNodeColor(node.status)"
                    :stroke="selectedComponent === node.id ? '#818cf8' : '#e5e7eb'"
                    :stroke-width="selectedComponent === node.id ? '3' : '2'"
                    class="cursor-pointer transition-all"
                    @click="selectedComponent = selectedComponent === node.id ? '' : node.id"
                  />
                  <text
                    :x="getNodePosition(node.id).x"
                    :y="getNodePosition(node.id).y + 5"
                    text-anchor="middle"
                    class="text-xs font-medium fill-white pointer-events-none"
                  >
                    {{ node.name.substring(0, 8) }}
                  </text>
                </g>
              </svg>
              
              <!-- Legend -->
              <div class="absolute bottom-4 left-4 flex flex-wrap gap-4 p-4 rounded-lg backdrop-blur-sm"
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
        </div>

        <!-- Component Details -->
        <div v-if="selectedComponent" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ getComponent(selectedComponent)?.name }}
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Dependencies ({{ getDependencies(selectedComponent).length }})
                </h4>
                <div v-if="getDependencies(selectedComponent).length === 0" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No dependencies
                </div>
                <div v-else class="space-y-2">
                  <router-link
                    v-for="dep in getDependencies(selectedComponent)"
                    :key="dep"
                    :to="`/components/${dep}`"
                    class="block px-3 py-2 rounded-lg border transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
                  >
                    {{ getComponent(dep)?.name }}
                  </router-link>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Used By ({{ getDependents(selectedComponent).length }})
                </h4>
                <div v-if="getDependents(selectedComponent).length === 0" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Not used by other components
                </div>
                <div v-else class="space-y-2">
                  <router-link
                    v-for="dep in getDependents(selectedComponent)"
                    :key="dep"
                    :to="`/components/${dep}`"
                    class="block px-3 py-2 rounded-lg border transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
                  >
                    {{ getComponent(dep)?.name }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Component List -->
        <div class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                All Components
              </h3>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="comp in components"
                  :key="comp.id"
                  @click="selectedComponent = selectedComponent === comp.id ? '' : comp.id"
                  class="p-4 rounded-lg border cursor-pointer transition-all"
                  :class="selectedComponent === comp.id
                    ? (isDarkMode ? 'border-indigo-400 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50')
                    : (isDarkMode ? 'border-gray-700 bg-slate-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300')"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="getStatusColor(comp.status)"
                    ></div>
                    <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ comp.name }}
                    </h4>
                  </div>
                  <p class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ comp.description }}
                  </p>
                  <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    <span>{{ getDependencies(comp.id).length }} deps</span>
                    <span>{{ getDependents(comp.id).length }} used by</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');
const layoutType = ref('hierarchical');
const showDependents = ref(true);
const graphSvg = ref(null);

// Component data with dependencies
const components = ref([
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
]);

// Dependency edges
const edges = computed(() => {
  const edgeList = [];
  components.value.forEach(comp => {
    comp.dependencies.forEach(dep => {
      edgeList.push({ from: dep, to: comp.id });
    });
  });
  return edgeList;
});

const filteredNodes = computed(() => {
  if (!selectedComponent.value) {
    return components.value.map(c => ({ ...c, size: 30 }));
  }
  
  const selected = components.value.find(c => c.id === selectedComponent.value);
  const related = new Set([selectedComponent.value]);
  
  // Add dependencies
  selected.dependencies.forEach(dep => related.add(dep));
  
  // Add dependents
  if (showDependents.value) {
    edges.value
      .filter(e => e.from === selectedComponent.value)
      .forEach(e => related.add(e.to));
  }
  
  return components.value
    .filter(c => related.has(c.id))
    .map(c => ({ 
      ...c, 
      size: c.id === selectedComponent.value ? 40 : 30 
    }));
});

const filteredEdges = computed(() => {
  if (!selectedComponent.value) {
    return edges.value;
  }
  
  const related = new Set([selectedComponent.value]);
  const selected = components.value.find(c => c.id === selectedComponent.value);
  
  selected.dependencies.forEach(dep => related.add(dep));
  if (showDependents.value) {
    edges.value
      .filter(e => e.from === selectedComponent.value)
      .forEach(e => related.add(e.to));
  }
  
  return edges.value.filter(e => 
    related.has(e.from) && related.has(e.to)
  );
});

const getNodePosition = (nodeId) => {
  const index = filteredNodes.value.findIndex(n => n.id === nodeId);
  if (index === -1) return { x: 400, y: 300 };
  
  const total = filteredNodes.value.length;
  const angle = (index / total) * Math.PI * 2;
  const radius = 200;
  const centerX = 400;
  const centerY = 300;
  
  if (layoutType.value === 'hierarchical') {
    // Hierarchical layout
    const level = getNodeLevel(nodeId);
    const nodesInLevel = filteredNodes.value.filter(n => getNodeLevel(n.id) === level);
    const levelIndex = nodesInLevel.findIndex(n => n.id === nodeId);
    const spacing = 150;
    const startX = centerX - (nodesInLevel.length - 1) * spacing / 2;
    
    return {
      x: startX + levelIndex * spacing,
      y: 100 + level * 120
    };
  } else {
    // Force-directed (circular for now)
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }
};

const getNodeLevel = (nodeId) => {
  const comp = components.value.find(c => c.id === nodeId);
  if (!comp || comp.dependencies.length === 0) return 0;
  
  const maxDepLevel = Math.max(
    ...comp.dependencies.map(dep => getNodeLevel(dep))
  );
  return maxDepLevel + 1;
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

const getComponent = (id) => {
  return components.value.find(c => c.id === id);
};

const getDependencies = (id) => {
  const comp = components.value.find(c => c.id === id);
  return comp ? comp.dependencies : [];
};

const getDependents = (id) => {
  return edges.value
    .filter(e => e.from === id)
    .map(e => e.to);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
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
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

