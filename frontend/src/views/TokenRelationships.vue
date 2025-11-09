<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :class="drawerOpen ? 'ml-64' : 'ml-12'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Token Relationship Mapping
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Visualize how design tokens connect, reference each other, and understand the impact of changes.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="tokenRelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Central node -->
                    <circle cx="100" cy="100" r="20" fill="url(#tokenRelGradient)" opacity="0.9" />
                    <!-- Connected nodes -->
                    <circle cx="50" cy="60" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <circle cx="150" cy="60" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <circle cx="50" cy="140" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <circle cx="150" cy="140" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <circle cx="100" cy="40" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <circle cx="100" cy="160" r="12" fill="url(#tokenRelGradient)" opacity="0.6" />
                    <!-- Connection lines -->
                    <line x1="100" y1="100" x2="50" y2="60" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <line x1="100" y1="100" x2="150" y2="60" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <line x1="100" y1="100" x2="50" y2="140" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <line x1="100" y1="100" x2="150" y2="140" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <line x1="100" y1="100" x2="100" y2="40" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <line x1="100" y1="100" x2="100" y2="160" stroke="url(#tokenRelGradient)" stroke-width="2" opacity="0.4" />
                    <!-- Secondary connections -->
                    <line x1="50" y1="60" x2="100" y2="40" stroke="url(#tokenRelGradient)" stroke-width="1.5" opacity="0.3" />
                    <line x1="150" y1="60" x2="100" y2="40" stroke="url(#tokenRelGradient)" stroke-width="1.5" opacity="0.3" />
                    <line x1="50" y1="140" x2="100" y2="160" stroke="url(#tokenRelGradient)" stroke-width="1.5" opacity="0.3" />
                    <line x1="150" y1="140" x2="100" y2="160" stroke="url(#tokenRelGradient)" stroke-width="1.5" opacity="0.3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="max-w-7xl mx-auto mb-6">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex flex-wrap items-center gap-4">
              <!-- Search -->
              <div class="flex-1 min-w-[200px]">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search tokens..."
                  class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>

              <!-- View Toggle -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">View:</span>
                <button
                  @click="viewMode = 'tree'"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  :class="viewMode === 'tree'
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')"
                >
                  Tree
                </button>
                <button
                  @click="viewMode = 'table'"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  :class="viewMode === 'table'
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')"
                >
                  Table
                </button>
                <button
                  @click="viewMode = 'graph'"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  :class="viewMode === 'graph'
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')"
                >
                  Network
                </button>
              </div>

              <!-- Reset View -->
              <button
                @click="resetView"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Main Visualization Area -->
          <div class="lg:col-span-2">
            <!-- Tree View -->
            <div 
              v-if="viewMode === 'tree'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">account_tree</span>
                  Reference Chains
                </h3>
              </div>

              <div v-if="loading" class="text-center py-12">
                <span class="material-symbols-outlined text-5xl mb-4 animate-spin" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                  refresh
                </span>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading relationships...</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="chain in referenceChains"
                  :key="chain.root"
                  class="border rounded-lg p-4"
                  :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                >
                  <div class="flex items-start gap-3">
                    <button
                      @click="toggleChain(chain.root)"
                      class="mt-1"
                    >
                      <span class="material-symbols-outlined text-base transition-transform" :class="expandedChains.has(chain.root) ? 'rotate-90' : '', isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        chevron_right
                      </span>
                    </button>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-mono text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ chain.root }}
                        </span>
                        <span 
                          v-if="getTokenData(chain.root)?.isBase"
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'"
                        >
                          Base
                        </span>
                        <span class="text-xs font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ getTokenData(chain.root)?.value }}
                        </span>
                      </div>
                      <div v-if="expandedChains.has(chain.root)" class="ml-6 space-y-2 mt-2">
                        <div
                          v-for="(ref, index) in chain.references"
                          :key="ref"
                          class="flex items-center gap-2"
                        >
                          <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                            {{ '─'.repeat(index + 1) }}→
                          </span>
                          <button
                            @click="selectToken(ref)"
                            class="font-mono text-sm hover:text-indigo-600 transition-colors text-left"
                            :class="isDarkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700'"
                          >
                            {{ ref }}
                          </button>
                          <span class="text-xs font-mono" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                            {{ getTokenData(ref)?.value }}
                          </span>
                        </div>
                        <div v-if="chain.references.length === 0" class="text-xs italic" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          No references
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table View -->
            <div 
              v-if="viewMode === 'table'"
              class="rounded-lg shadow-sm border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">table_chart</span>
                  Token Relationships
                </h3>
              </div>

              <div v-if="loading" class="text-center py-12">
                <span class="material-symbols-outlined text-5xl mb-4 animate-spin" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                  refresh
                </span>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading relationships...</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Token</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Value</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">References</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Referenced By</th>
                      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Type</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                    <tr
                      v-for="node in filteredNodes"
                      :key="node.id"
                      class="hover:bg-opacity-50 transition-colors cursor-pointer"
                      :class="selectedToken === node.id
                        ? (isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50')
                        : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50')"
                      @click="selectToken(node.id)"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            {{ node.name }}
                          </span>
                          <span 
                            v-if="node.isBase"
                            class="px-2 py-0.5 rounded text-xs font-medium"
                            :class="isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'"
                          >
                            Base
                          </span>
                          <span 
                            v-if="node.isAlias"
                            class="px-2 py-0.5 rounded text-xs font-medium"
                            :class="isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'"
                          >
                            Alias
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="font-mono text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          {{ node.value }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                          <button
                            v-for="ref in (relationships?.references[node.id] || []).slice(0, 3)"
                            :key="ref"
                            @click.stop="selectToken(ref)"
                            class="px-2 py-0.5 rounded text-xs font-mono hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                            :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'"
                          >
                            {{ ref.split('.').pop() }}
                          </button>
                          <span 
                            v-if="(relationships?.references[node.id] || []).length > 3"
                            class="text-xs"
                            :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                          >
                            +{{ (relationships?.references[node.id] || []).length - 3 }} more
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                          <button
                            v-for="ref in (relationships?.referencedBy[node.id] || []).slice(0, 3)"
                            :key="ref"
                            @click.stop="selectToken(ref)"
                            class="px-2 py-0.5 rounded text-xs font-mono hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                            :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'"
                          >
                            {{ ref.split('.').pop() }}
                          </button>
                          <span 
                            v-if="(relationships?.referencedBy[node.id] || []).length > 3"
                            class="text-xs"
                            :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                          >
                            +{{ (relationships?.referencedBy[node.id] || []).length - 3 }} more
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'">
                          {{ node.category }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Graph/Network View -->
            <div 
              v-if="viewMode === 'graph'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">account_tree</span>
                  Network View
                </h3>
                <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                    Reference
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                    Semantic
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                    Scale
                  </span>
                </div>
              </div>

              <!-- Graph Container -->
              <div 
                ref="graphContainer"
                class="w-full h-[600px] border rounded-lg overflow-auto relative"
                :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
              >
                <svg
                  ref="graphSvg"
                  :width="graphWidth"
                  :height="graphHeight"
                  class="absolute"
                >
                  <!-- Edges -->
                  <g v-for="edge in filteredEdges" :key="`${edge.from}-${edge.to}`">
                    <line
                      :x1="getNodeX(edge.from)"
                      :y1="getNodeY(edge.from)"
                      :x2="getNodeX(edge.to)"
                      :y2="getNodeY(edge.to)"
                      :stroke="getEdgeColor(edge.type)"
                      :stroke-width="edge.strength * 2"
                      :opacity="0.4"
                      :class="selectedToken && (edge.from === selectedToken || edge.to === selectedToken) ? 'opacity-100' : ''"
                    />
                  </g>

                  <!-- Nodes -->
                  <g v-for="node in filteredNodes" :key="node.id">
                    <circle
                      :cx="getNodeX(node.id)"
                      :cy="getNodeY(node.id)"
                      :r="getNodeRadius(node)"
                      :fill="getNodeColor(node)"
                      :stroke="selectedToken === node.id ? '#6366f1' : 'transparent'"
                      :stroke-width="selectedToken === node.id ? 3 : 0"
                      class="cursor-pointer transition-all hover:opacity-80"
                      @click="selectToken(node.id)"
                    />
                    <text
                      :x="getNodeX(node.id)"
                      :y="getNodeY(node.id) + getNodeRadius(node) + 15"
                      :fill="isDarkMode ? '#e5e7eb' : '#374151'"
                      font-size="10"
                      text-anchor="middle"
                      class="pointer-events-none"
                    >
                      {{ node.name.split('.').pop() }}
                    </text>
                  </g>
                </svg>

                <!-- Empty State -->
                <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <span class="material-symbols-outlined text-5xl mb-4 animate-spin" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                      refresh
                    </span>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading relationships...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar: Token Details & Impact Analysis -->
          <div class="space-y-6">
            <!-- Selected Token Info -->
            <div 
              v-if="selectedToken"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">info</span>
                Token Details
              </h3>
              <div v-if="selectedTokenData" class="space-y-3">
                <div>
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Name</div>
                  <div class="text-sm font-mono" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedTokenData.name }}</div>
                </div>
                <div>
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Value</div>
                  <div class="text-sm font-mono" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedTokenData.value }}</div>
                </div>
                <div>
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Category</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedTokenData.category }}</div>
                </div>
                <div>
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Type</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedTokenData.type }}</div>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <span 
                    v-if="selectedTokenData.isBase"
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'"
                  >
                    Base Token
                  </span>
                  <span 
                    v-if="selectedTokenData.isAlias"
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'"
                  >
                    Alias
                  </span>
                </div>
              </div>
            </div>

            <!-- Impact Analysis -->
            <div 
              v-if="selectedToken && impactAnalysis"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">warning</span>
                Impact Analysis
              </h3>
              <div class="space-y-4">
                <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Impact</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ impactAnalysis.totalImpact }}
                  </div>
                </div>

                <div v-if="impactAnalysis.directlyAffected.length > 0">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Directly Affected Tokens</div>
                  <div class="space-y-1">
                    <div
                      v-for="token in impactAnalysis.directlyAffected"
                      :key="token"
                      class="text-xs px-2 py-1 rounded font-mono cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'"
                      @click="selectToken(token)"
                    >
                      {{ token }}
                    </div>
                  </div>
                </div>

                <div v-if="impactAnalysis.affectedComponents.length > 0">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Affected Components</div>
                  <div class="space-y-1">
                    <div
                      v-for="component in impactAnalysis.affectedComponents"
                      :key="component"
                      class="text-xs px-2 py-1 rounded"
                      :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'"
                    >
                      {{ component }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Relationship Types -->
            <div 
              v-if="selectedToken && relationships"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">share</span>
                Relationships
              </h3>
              <div class="space-y-3">
                <div v-if="relationships.references[selectedToken]?.length > 0">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">References</div>
                  <div class="space-y-1">
                    <div
                      v-for="token in relationships.references[selectedToken]"
                      :key="token"
                      class="text-xs px-2 py-1 rounded font-mono cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'"
                      @click="selectToken(token)"
                    >
                      {{ token }}
                    </div>
                  </div>
                </div>
                <div v-if="relationships.referencedBy[selectedToken]?.length > 0">
                  <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Referenced By</div>
                  <div class="space-y-1">
                    <div
                      v-for="token in relationships.referencedBy[selectedToken]"
                      :key="token"
                      class="text-xs px-2 py-1 rounded font-mono cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'"
                      @click="selectToken(token)"
                    >
                      {{ token }}
                    </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
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

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

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

const getNodeColor = (node) => {
  const categoryColors = {
    'colors': '#6366f1',
    'spacing': '#10b981',
    'typography': '#f59e0b',
    'shadows': '#8b5cf6',
    'borders': '#ec4899',
  };
  return categoryColors[node.category] || '#6b7280';
};

const getEdgeColor = (type) => {
  const colors = {
    'reference': '#3b82f6',
    'semantic': '#10b981',
    'scale': '#8b5cf6',
    'category': '#6b7280',
  };
  return colors[type] || '#6b7280';
};

// Methods
const loadRelationships = async (tokenName = null) => {
  loading.value = true;
  try {
    const url = tokenName 
      ? `${API_BASE_URL}/tokens/relationships?token=${encodeURIComponent(tokenName)}`
      : `${API_BASE_URL}/tokens/relationships`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
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
    const response = await axios.get(`${API_BASE_URL}/tokens/${encodeURIComponent(tokenId)}/impact`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
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

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for changes
watch([filteredNodes, filteredEdges], () => {
  nextTick(() => {
    calculateLayout();
  });
});

// Dark mode observer
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }

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

  await loadRelationships();
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

