<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens', label: 'Tokens' }"
      title="Token relationship mapping"
      lead="Visualize how design tokens connect, reference each other, and understand the impact of changes."
      spot="foundations/token-relationships"
      size="tool"
    />

    <UiPanel class="mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex-1 min-w-48">
          <UiInput v-model="searchQuery" type="search" icon="search" label="Search tokens" placeholder="Search tokens..." />
        </div>
        <UiSegmented v-model="viewMode" :options="viewOptions" label="View" />
        <UiButton icon="restart_alt" @click="resetView">Reset view</UiButton>
      </div>
    </UiPanel>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 min-w-0">
        <!-- Tree View -->
        <UiPanel v-if="viewMode === 'tree'" title="Reference chains">
          <UiSpinner v-if="loading" label="Loading relationships…" />
          <ul v-else class="space-y-3">
            <li v-for="chain in referenceChains" :key="chain.root" class="rounded-tile border border-line-faint bg-surface-sunken p-4">
              <div class="flex items-start gap-3">
                <UiButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="expandedChains.has(chain.root) ? 'expand_more' : 'chevron_right'"
                  :label="`${expandedChains.has(chain.root) ? 'Collapse' : 'Expand'} ${chain.root}`"
                  :aria-expanded="expandedChains.has(chain.root)"
                  @click="toggleChain(chain.root)"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="font-code text-sm font-semibold text-ink-strong">{{ chain.root }}</span>
                    <UiChip v-if="getTokenData(chain.root)?.isBase" tone="success">Base</UiChip>
                    <span class="text-xs font-code text-ink-secondary">{{ getTokenData(chain.root)?.value }}</span>
                  </div>
                  <div v-if="expandedChains.has(chain.root)" class="ml-6 space-y-2 mt-2">
                    <div v-for="(ref, index) in chain.references" :key="ref" class="flex items-center gap-2">
                      <span class="text-xs text-ink-muted" aria-hidden="true">{{ '─'.repeat(index + 1) }}→</span>
                      <button type="button" class="token-link" @click="selectToken(ref)">{{ ref }}</button>
                      <span class="text-xs font-code text-ink-muted">{{ getTokenData(ref)?.value }}</span>
                    </div>
                    <p v-if="chain.references.length === 0" class="text-xs italic text-ink-muted">No references</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </UiPanel>

        <!-- Table View -->
        <UiPanel v-if="viewMode === 'table'" title="Token relationships" flush>
          <UiSpinner v-if="loading" label="Loading relationships…" class="p-6" />
          <UiTable v-else caption="Tokens with the tokens they reference and are referenced by">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">References</th>
                <th scope="col">Referenced by</th>
                <th scope="col">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="node in filteredNodes"
                :key="node.id"
                class="cursor-pointer"
                :class="{ 'bg-accent-subtle': selectedToken === node.id }"
                @click="selectToken(node.id)"
              >
                <td>
                  <div class="flex items-center gap-2">
                    <button type="button" class="token-link font-medium" :aria-pressed="selectedToken === node.id" @click.stop="selectToken(node.id)">{{ node.name }}</button>
                    <UiChip v-if="node.isBase" tone="success">Base</UiChip>
                    <UiChip v-if="node.isAlias" tone="info">Alias</UiChip>
                  </div>
                </td>
                <td><span class="font-code text-xs">{{ node.value }}</span></td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="ref in (relationships?.references[node.id] || []).slice(0, 3)"
                      :key="ref"
                      type="button"
                      class="token-pill"
                      :title="ref"
                      @click.stop="selectToken(ref)"
                    >
                      {{ ref.split('.').pop() }}
                    </button>
                    <span v-if="(relationships?.references[node.id] || []).length > 3" class="text-xs text-ink-muted">
                      +{{ (relationships?.references[node.id] || []).length - 3 }} more
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="ref in (relationships?.referencedBy[node.id] || []).slice(0, 3)"
                      :key="ref"
                      type="button"
                      class="token-pill"
                      :title="ref"
                      @click.stop="selectToken(ref)"
                    >
                      {{ ref.split('.').pop() }}
                    </button>
                    <span v-if="(relationships?.referencedBy[node.id] || []).length > 3" class="text-xs text-ink-muted">
                      +{{ (relationships?.referencedBy[node.id] || []).length - 3 }} more
                    </span>
                  </div>
                </td>
                <td><UiChip>{{ node.category }}</UiChip></td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>

        <!-- Graph/Network View -->
        <UiPanel v-if="viewMode === 'graph'" title="Network view">
          <template #actions>
            <ul class="flex items-center gap-4 text-xs text-ink-secondary" aria-label="Edge types">
              <li v-for="item in edgeLegend" :key="item.label" class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-pill" :class="item.swatch" aria-hidden="true"></span>
                {{ item.label }}
              </li>
            </ul>
          </template>

          <div ref="graphContainer" class="graph-box">
            <svg ref="graphSvg" :width="graphWidth" :height="graphHeight" class="absolute" role="group" aria-label="Token relationship network">
              <!-- Edges -->
              <g v-for="edge in filteredEdges" :key="`${edge.from}-${edge.to}`">
                <line
                  :x1="getNodeX(edge.from)"
                  :y1="getNodeY(edge.from)"
                  :x2="getNodeX(edge.to)"
                  :y2="getNodeY(edge.to)"
                  :class="[getEdgeColor(edge.type), selectedToken && (edge.from === selectedToken || edge.to === selectedToken) ? 'opacity-100' : 'opacity-40']"
                  :stroke-width="edge.strength * 2"
                />
              </g>

              <!-- Nodes -->
              <g v-for="node in filteredNodes" :key="node.id">
                <circle
                  :cx="getNodeX(node.id)"
                  :cy="getNodeY(node.id)"
                  :r="getNodeRadius(node)"
                  :class="[getNodeColor(node), selectedToken === node.id ? 'stroke-accent' : 'stroke-transparent']"
                  :stroke-width="selectedToken === node.id ? 3 : 0"
                  class="cursor-pointer transition-all hover:opacity-80"
                  role="button"
                  tabindex="0"
                  :aria-label="node.name"
                  :aria-pressed="selectedToken === node.id"
                  @click="selectToken(node.id)"
                  @keydown.enter.prevent="selectToken(node.id)"
                  @keydown.space.prevent="selectToken(node.id)"
                />
                <text
                  :x="getNodeX(node.id)"
                  :y="getNodeY(node.id) + getNodeRadius(node) + 15"
                  class="fill-ink-secondary pointer-events-none"
                  font-size="10"
                  text-anchor="middle"
                  aria-hidden="true"
                >
                  {{ node.name.split('.').pop() }}
                </text>
              </g>
            </svg>

            <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
              <UiSpinner label="Loading relationships…" />
            </div>
          </div>
        </UiPanel>
      </div>

      <!-- Sidebar: Token Details & Impact Analysis -->
      <div class="space-y-6">
        <UiPanel v-if="selectedToken" title="Token details" heading-tag="h3">
          <dl v-if="selectedTokenData" class="space-y-3 text-sm">
            <div>
              <dt class="text-xs font-medium text-ink-secondary mb-1">Name</dt>
              <dd class="font-code text-ink-strong">{{ selectedTokenData.name }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-ink-secondary mb-1">Value</dt>
              <dd class="font-code text-ink-strong">{{ selectedTokenData.value }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-ink-secondary mb-1">Category</dt>
              <dd class="text-ink-strong">{{ selectedTokenData.category }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-ink-secondary mb-1">Type</dt>
              <dd class="text-ink-strong">{{ selectedTokenData.type }}</dd>
            </div>
            <div v-if="selectedTokenData.isBase || selectedTokenData.isAlias" class="flex items-center gap-2 pt-3 border-t border-line-faint">
              <UiChip v-if="selectedTokenData.isBase" tone="success">Base token</UiChip>
              <UiChip v-if="selectedTokenData.isAlias" tone="info">Alias</UiChip>
            </div>
          </dl>
        </UiPanel>

        <UiPanel v-if="selectedToken && impactAnalysis" title="Impact analysis" heading-tag="h3">
          <div class="space-y-4">
            <UiStat label="Total impact" :value="impactAnalysis.totalImpact" />

            <div v-if="impactAnalysis.directlyAffected.length > 0">
              <h4 class="text-xs font-medium text-ink-secondary mb-2">Directly affected tokens</h4>
              <ul class="space-y-1">
                <li v-for="token in impactAnalysis.directlyAffected" :key="token">
                  <button type="button" class="token-row" @click="selectToken(token)">{{ token }}</button>
                </li>
              </ul>
            </div>

            <div v-if="impactAnalysis.affectedComponents.length > 0">
              <h4 class="text-xs font-medium text-ink-secondary mb-2">Affected components</h4>
              <ul class="space-y-1">
                <li v-for="component in impactAnalysis.affectedComponents" :key="component" class="text-xs px-2 py-1 rounded-control bg-fill-subtle text-ink">
                  {{ component }}
                </li>
              </ul>
            </div>
          </div>
        </UiPanel>

        <UiPanel v-if="selectedToken && relationships" title="Relationships" heading-tag="h3">
          <div class="space-y-3">
            <div v-if="relationships.references[selectedToken]?.length > 0">
              <h4 class="text-xs font-medium text-ink-secondary mb-2">References</h4>
              <ul class="space-y-1">
                <li v-for="token in relationships.references[selectedToken]" :key="token">
                  <button type="button" class="token-row" @click="selectToken(token)">{{ token }}</button>
                </li>
              </ul>
            </div>
            <div v-if="relationships.referencedBy[selectedToken]?.length > 0">
              <h4 class="text-xs font-medium text-ink-secondary mb-2">Referenced by</h4>
              <ul class="space-y-1">
                <li v-for="token in relationships.referencedBy[selectedToken]" :key="token">
                  <button type="button" class="token-row" @click="selectToken(token)">{{ token }}</button>
                </li>
              </ul>
            </div>
          </div>
        </UiPanel>
      </div>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import apiClient from '../services/api.js';
import {
  PageHero,
  PageShell,
  UiButton,
  UiChip,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSpinner,
  UiStat,
  UiTable,
} from '../components/ui';

const graphContainer = ref(null);
const graphSvg = ref(null);
const graphWidth = ref(1200);
const graphHeight = ref(600);

const loading = ref(false);
const relationshipsData = ref(null);
const selectedToken = ref(null);
const searchQuery = ref('');
const viewMode = ref('tree'); // 'tree', 'table', or 'graph'
const expandedChains = ref(new Set());

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

// Computed properties
const filteredNodes = computed(() => {
  if (!relationshipsData.value) return [];
  let nodes = relationshipsData.value.nodes;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    nodes = nodes.filter(node => node.name.toLowerCase().includes(query));
  }
  
  return nodes;
});

const filteredEdges = computed(() => {
  if (!relationshipsData.value) return [];
  return relationshipsData.value.edges.filter(edge => {
    const fromNode = filteredNodes.value.find(n => n.id === edge.from);
    const toNode = filteredNodes.value.find(n => n.id === edge.to);
    return fromNode && toNode;
  });
});

// Build reference chains for tree view
const referenceChains = computed(() => {
  if (!relationshipsData.value) return [];
  
  const chains = [];
  const processed = new Set();
  
  // Find base tokens (tokens that are not aliases)
  const baseTokens = relationshipsData.value.nodes.filter(n => n.isBase);
  
  baseTokens.forEach(baseToken => {
    if (processed.has(baseToken.id)) return;
    
    const chain = [];
    const visited = new Set();
    
    // Build chain by following references
    const buildChain = (tokenId) => {
      if (visited.has(tokenId)) return;
      visited.add(tokenId);
      
      const refs = relationshipsData.value.relationships.references[tokenId] || [];
      refs.forEach(ref => {
        if (!chain.includes(ref)) {
          chain.push(ref);
          buildChain(ref);
        }
      });
    };
    
    buildChain(baseToken.id);
    
    if (chain.length > 0 || baseToken.id.includes(searchQuery.value.toLowerCase())) {
      chains.push({
        root: baseToken.id,
        references: chain,
      });
      processed.add(baseToken.id);
      chain.forEach(t => processed.add(t));
    }
  });
  
  // Also include alias tokens that match search
  if (searchQuery.value) {
    relationshipsData.value.nodes.forEach(node => {
      if (!processed.has(node.id) && node.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
        chains.push({
          root: node.id,
          references: relationshipsData.value.relationships.references[node.id] || [],
        });
      }
    });
  }
  
  return chains.sort((a, b) => a.root.localeCompare(b.root));
});

const selectedTokenData = computed(() => {
  if (!selectedToken.value || !relationshipsData.value) return null;
  return relationshipsData.value.nodes.find(n => n.id === selectedToken.value);
});

const relationships = computed(() => {
  return relationshipsData.value?.relationships || null;
});

const impactAnalysis = ref(null);

// Graph layout (simple force-directed-like layout)
const nodePositions = ref({});

const getNodeX = (nodeId) => {
  if (nodePositions.value[nodeId]) {
    return nodePositions.value[nodeId].x;
  }
  // Simple grid layout fallback
  const index = filteredNodes.value.findIndex(n => n.id === nodeId);
  const cols = Math.ceil(Math.sqrt(filteredNodes.value.length));
  const row = Math.floor(index / cols);
  const col = index % cols;
  return 100 + col * 150;
};

const getNodeY = (nodeId) => {
  if (nodePositions.value[nodeId]) {
    return nodePositions.value[nodeId].y;
  }
  // Simple grid layout fallback
  const index = filteredNodes.value.findIndex(n => n.id === nodeId);
  const cols = Math.ceil(Math.sqrt(filteredNodes.value.length));
  const row = Math.floor(index / cols);
  return 100 + row * 150;
};

const getNodeRadius = (node) => {
  if (node.isBase) return 12;
  if (node.isAlias) return 10;
  return 8;
};

// Series classes (chart tokens) for each token category and edge type
const getNodeColor = (node) => {
  const categoryClasses = {
    colors: 'fill-chart-1',
    spacing: 'fill-chart-2',
    typography: 'fill-chart-3',
    shadows: 'fill-chart-4',
    borders: 'fill-chart-5',
  };
  return categoryClasses[node.category] || 'fill-chart-neutral';
};

const getEdgeColor = (type) => {
  const classes = {
    reference: 'stroke-chart-1',
    semantic: 'stroke-chart-2',
    scale: 'stroke-chart-4',
    category: 'stroke-chart-neutral',
  };
  return classes[type] || 'stroke-chart-neutral';
};

const edgeLegend = [
  { label: 'Reference', swatch: 'bg-chart-1' },
  { label: 'Semantic', swatch: 'bg-chart-2' },
  { label: 'Scale', swatch: 'bg-chart-4' },
];

const viewOptions = [
  { value: 'tree', label: 'Tree' },
  { value: 'table', label: 'Table' },
  { value: 'graph', label: 'Network' },
];

// The graph box is as tall as the drawing area
const graphBoxHeight = computed(() => `${graphHeight.value}px`);

// Methods
const loadRelationships = async (tokenName = null) => {
  loading.value = true;
  try {
    const url = tokenName 
      ? `${API_BASE_URL}/tokens/relationships?token=${encodeURIComponent(tokenName)}`
      : `${API_BASE_URL}/tokens/relationships`;
    const response = await apiClient.get(url);
    relationshipsData.value = response.data;
    calculateLayout();
  } catch (error) {
    console.error('Error loading relationships:', error);
  } finally {
    loading.value = false;
  }
};

const calculateLayout = () => {
  if (!relationshipsData.value) return;
  
  // Simple force-directed layout simulation
  const nodes = filteredNodes.value;
  const edges = filteredEdges.value;
  
  // Initialize positions
  nodes.forEach((node, index) => {
    if (!nodePositions.value[node.id]) {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      nodePositions.value[node.id] = {
        x: 150 + col * 200,
        y: 150 + row * 200,
      };
    }
  });
  
  // Simple force simulation (simplified)
  for (let iter = 0; iter < 50; iter++) {
    nodes.forEach(node => {
      let fx = 0, fy = 0;
      
      // Repulsion from other nodes
      nodes.forEach(other => {
        if (other.id !== node.id) {
          const dx = nodePositions.value[node.id].x - nodePositions.value[other.id].x;
          const dy = nodePositions.value[node.id].y - nodePositions.value[other.id].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        }
      });
      
      // Attraction along edges
      edges.forEach(edge => {
        if (edge.from === node.id) {
          const target = nodePositions.value[edge.to];
          if (target) {
            const dx = target.x - nodePositions.value[node.id].x;
            const dy = target.y - nodePositions.value[node.id].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * 0.01;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }
      });
      
      // Update position
      nodePositions.value[node.id].x += fx * 0.1;
      nodePositions.value[node.id].y += fy * 0.1;
      
      // Keep within bounds
      nodePositions.value[node.id].x = Math.max(50, Math.min(graphWidth.value - 50, nodePositions.value[node.id].x));
      nodePositions.value[node.id].y = Math.max(50, Math.min(graphHeight.value - 50, nodePositions.value[node.id].y));
    });
  }
};

const selectToken = async (tokenId) => {
  selectedToken.value = tokenId;
  
  // Load impact analysis
  try {
    const response = await apiClient.get(`${API_BASE_URL}/tokens/${encodeURIComponent(tokenId)}/impact`);
    impactAnalysis.value = response.data;
  } catch (error) {
    console.error('Error loading impact analysis:', error);
  }
};

const toggleChain = (root) => {
  if (expandedChains.value.has(root)) {
    expandedChains.value.delete(root);
  } else {
    expandedChains.value.add(root);
  }
};

const getTokenData = (tokenId) => {
  if (!relationshipsData.value) return null;
  return relationshipsData.value.nodes.find(n => n.id === tokenId);
};

const resetView = () => {
  selectedToken.value = null;
  impactAnalysis.value = null;
  searchQuery.value = '';
  expandedChains.value.clear();
  loadRelationships();
};





// Watch for changes
watch([filteredNodes, filteredEdges], () => {
  nextTick(() => {
    calculateLayout();
  });
});

onMounted(loadRelationships);
</script>

<style scoped>
.graph-box {
  @apply relative w-full overflow-auto rounded-tile border border-line-faint bg-surface-sunken;
  height: v-bind(graphBoxHeight);
}
.token-link {
  @apply font-code text-sm text-left text-ink rounded-control hover:text-accent-text focus-visible:outline focus-visible:outline-2 outline-focus;
}
.token-pill {
  @apply px-2 py-0.5 rounded-control text-xs font-code bg-fill-subtle text-ink hover:bg-fill-hover focus-visible:outline focus-visible:outline-2 outline-focus;
}
.token-row {
  @apply block w-full text-left text-xs px-2 py-1 rounded-control font-code bg-fill-subtle text-ink hover:bg-fill-hover focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
