<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Team Workspaces
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Create isolated workspaces for different teams. Manage team-specific components, access control, and collaboration.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="workspaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Team workspaces - interconnected but isolated -->
                      <!-- Team 1 Workspace -->
                      <g opacity="0.6">
                        <rect x="20" y="30" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="35" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="50" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="65" cy="45" r="4" fill="white" opacity="0.8"/>
                        <rect x="30" y="55" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="30" y="67" width="30" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 2 Workspace -->
                      <g opacity="0.7">
                        <rect x="120" y="30" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="135" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="150" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="165" cy="45" r="4" fill="white" opacity="0.8"/>
                        <rect x="130" y="55" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="130" y="67" width="35" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 3 Workspace -->
                      <g opacity="0.5">
                        <rect x="20" y="110" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="35" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="50" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="65" cy="125" r="4" fill="white" opacity="0.8"/>
                        <rect x="30" y="135" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="30" y="147" width="35" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 4 Workspace -->
                      <g opacity="0.8">
                        <rect x="120" y="110" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="135" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="150" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="165" cy="125" r="4" fill="white" opacity="0.8"/>
                        <rect x="130" y="135" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="130" y="147" width="30" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Connection lines showing collaboration/sharing -->
                      <path d="M 80 60 L 120 60" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 80 140 L 120 140" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 50 90 L 50 110" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 150 90 L 150 110" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="max-w-7xl mx-auto mb-6 flex items-center justify-between">
            <button
              @click="showCreateWorkspaceModal = true"
              class="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              Create Workspace
            </button>
          </div>

          <!-- Workspaces Grid -->
          <div class="max-w-7xl mx-auto">
            <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              <div class="flex justify-center mb-4">
                <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              Loading workspaces...
            </div>

            <div v-else-if="workspaces.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">workspaces</span>
              <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">No workspaces yet</h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Create your first workspace to get started</p>
              <button
                @click="showCreateWorkspaceModal = true"
                class="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Create Workspace
              </button>
            </div>

            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="workspace in workspaces"
                :key="workspace.id"
                class="rounded-lg border p-6 transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspace.name }}
                    </h3>
                    <p v-if="workspace.description" class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ workspace.description }}
                    </p>
                    <div class="flex items-center gap-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span class="material-symbols-outlined text-sm">people</span>
                      <span>{{ workspace.members.length }} member{{ workspace.members.length !== 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewWorkspace(workspace.id)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      title="View Workspace"
                    >
                      <span class="material-symbols-outlined text-base">visibility</span>
                    </button>
                    <button
                      @click="editWorkspace(workspace)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      title="Edit Workspace"
                    >
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspaceAnalytics[workspace.id]?.totalComponents || 0 }}
                    </div>
                  </div>
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Applications</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspaceAnalytics[workspace.id]?.totalApplications || 0 }}
                    </div>
                  </div>
                </div>

                <!-- Health Score -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Health Score</span>
                    <span class="text-xs font-semibold" :class="getHealthScoreColor(workspaceAnalytics[workspace.id]?.healthScore || 0)">
                      {{ workspaceAnalytics[workspace.id]?.healthScore || 0 }}/100
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div 
                      class="h-2 rounded-full transition-all"
                      :class="getHealthScoreBarColor(workspaceAnalytics[workspace.id]?.healthScore || 0)"
                      :style="`width: ${workspaceAnalytics[workspace.id]?.healthScore || 0}%`"
                    ></div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button
                    @click="viewWorkspace(workspace.id)"
                    class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    View Details
                  </button>
                  <button
                    @click="manageMembers(workspace)"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    title="Manage Members"
                  >
                    <span class="material-symbols-outlined text-base">group</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Workspace Modal -->
    <div
      v-if="showCreateWorkspaceModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showCreateWorkspaceModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">folder</span>
            Create Workspace
          </h3>
          <button
            @click="showCreateWorkspaceModal = false; resetCreateForm()"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Workspace Name *
            </label>
            <input
              v-model="newWorkspace.name"
              type="text"
              placeholder="e.g., Marketing Team, Product Team"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description
            </label>
            <textarea
              v-model="newWorkspace.description"
              rows="3"
              placeholder="Describe the workspace purpose..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            ></textarea>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="createWorkspace"
              :disabled="!newWorkspace.name || creating"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newWorkspace.name && !creating
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ creating ? 'Creating...' : 'Create Workspace' }}
            </button>
            <button
              @click="showCreateWorkspaceModal = false; resetCreateForm()"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace Detail Modal -->
    <div
      v-if="selectedWorkspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="selectedWorkspace = null"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-indigo-600 text-3xl">folder</span>
            <div>
              <h3 class="text-2xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedWorkspace.name }}
              </h3>
              <p v-if="selectedWorkspace.description" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ selectedWorkspace.description }}
              </p>
            </div>
          </div>
          <button
            @click="selectedWorkspace = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b mb-6" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center gap-4 overflow-x-auto">
            <button
              @click="workspaceTab = 'overview'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'overview'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Overview
            </button>
            <button
              @click="workspaceTab = 'components'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'components'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Components
            </button>
            <button
              @click="workspaceTab = 'fonts'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'fonts'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Fonts
            </button>
            <button
              @click="workspaceTab = 'assets'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'assets'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Assets
            </button>
            <button
              @click="workspaceTab = 'tokens'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'tokens'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Tokens
            </button>
            <button
              @click="workspaceTab = 'reviews'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'reviews'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Reviews
            </button>
            <button
              @click="workspaceTab = 'session-replays'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'session-replays'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Session Replays
            </button>
            <button
              @click="workspaceTab = 'journey-maps'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'journey-maps'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Journey Maps
            </button>
            <button
              @click="workspaceTab = 'hcd-reports'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'hcd-reports'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              HCD Reports
            </button>
            <button
              @click="workspaceTab = 'user-personas'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'user-personas'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              User Personas
            </button>
            <button
              @click="workspaceTab = 'research-artifacts'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'research-artifacts'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Research Artifacts
            </button>
            <button
              @click="workspaceTab = 'insights'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'insights'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Insights
            </button>
            <button
              @click="workspaceTab = 'patterns'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'patterns'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Patterns
            </button>
            <button
              @click="workspaceTab = 'icons'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'icons'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Icons
            </button>
            <button
              @click="workspaceTab = 'interactives'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'interactives'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Interactives
            </button>
            <button
              @click="workspaceTab = 'stock-photos'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'stock-photos'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Stock Photos
            </button>
            <button
              @click="workspaceTab = 'illustrations'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'illustrations'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Illustrations
            </button>
            <button
              @click="workspaceTab = 'capability-logos'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'capability-logos'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Capability Logos
            </button>
            <button
              @click="workspaceTab = 'style-dictionaries'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'style-dictionaries'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Style Dictionaries
            </button>
            <button
              @click="workspaceTab = 'guidelines'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'guidelines'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Guidelines
            </button>
            <button
              @click="workspaceTab = 'members'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'members'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Members
            </button>
            <button
              @click="workspaceTab = 'analytics'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'analytics'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Analytics
            </button>
            <button
              @click="workspaceTab = 'settings'"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="workspaceTab === 'settings'
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
            >
              Settings
            </button>
          </div>
        </div>

        <!-- Overview Tab -->
        <div v-if="workspaceTab === 'overview'" class="space-y-6">
          <!-- Analytics Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</div>
              <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ workspaceAnalytics[selectedWorkspace.id]?.totalComponents || 0 }}
              </div>
            </div>
            <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Applications</div>
              <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ workspaceAnalytics[selectedWorkspace.id]?.totalApplications || 0 }}
              </div>
            </div>
            <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Adoption Rate</div>
              <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ workspaceAnalytics[selectedWorkspace.id]?.adoptionRate || 0 }}%
              </div>
            </div>
            <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Health Score</div>
              <div class="text-2xl font-bold" :class="getHealthScoreColor(workspaceAnalytics[selectedWorkspace.id]?.healthScore || 0)">
                {{ workspaceAnalytics[selectedWorkspace.id]?.healthScore || 0 }}
              </div>
            </div>
          </div>

          <!-- Components by Status -->
          <div v-if="workspaceAnalytics[selectedWorkspace.id]?.componentsByStatus" class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <h4 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Components by Status</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-for="(count, status) in workspaceAnalytics[selectedWorkspace.id].componentsByStatus" :key="status">
                <div class="text-xs mb-1 capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ status }}</div>
                <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ count }}</div>
              </div>
            </div>
          </div>

          <!-- Most Used Components -->
          <div v-if="workspaceAnalytics[selectedWorkspace.id]?.mostUsedComponents?.length > 0" class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <h4 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Most Used Components</h4>
            <div class="space-y-2">
              <div
                v-for="comp in workspaceAnalytics[selectedWorkspace.id].mostUsedComponents"
                :key="comp.id"
                class="flex items-center justify-between p-2 rounded"
                :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
              >
                <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ comp.name }}</span>
                <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'">
                  {{ comp.usage }}% usage
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Components Tab -->
        <div v-if="workspaceTab === 'components'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Components</h4>
            <button
              @click="shareComponentModal = true"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              Share Component
            </button>
          </div>
          <div v-if="workspaceComponents.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            No components in this workspace yet
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="component in workspaceComponents"
              :key="component.id"
              class="p-4 rounded-lg border"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ component.name }}</h5>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ component.description }}</p>
                </div>
                <span 
                  class="px-2 py-1 text-xs rounded"
                  :class="component.isGlobal 
                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                >
                  {{ component.isGlobal ? 'Global' : getWorkspaceName(component.workspaceId) }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <button
                  v-if="!component.isGlobal"
                  @click="shareComponent(component)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Share
                </button>
                <button
                  v-if="!component.isGlobal && component.workspaceId === selectedWorkspace.id"
                  @click="makeGlobal(component)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Make Global
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fonts Tab -->
        <div v-if="workspaceTab === 'fonts'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Fonts</h4>
            <button
              @click="showAddFontModal = true"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              <span class="material-symbols-outlined text-base mr-1">add</span>
              Add Font
            </button>
          </div>
          <div v-if="workspaceFonts.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">font_download</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No fonts yet</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Add fonts to your workspace to get started</p>
          </div>
          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="font in workspaceFonts"
              :key="font.id"
              class="rounded-lg border p-4"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ font.name }}</h5>
                  <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ font.family }}</p>
                </div>
                <span 
                  class="px-2 py-1 text-xs rounded"
                  :class="font.isGlobal 
                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                >
                  {{ font.isGlobal ? 'Global' : getWorkspaceName(font.workspaceId) }}
                </span>
              </div>
              <div class="text-xs space-y-1 mt-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                <div><span class="font-medium">Source:</span> {{ font.source }}</div>
                <div><span class="font-medium">Weights:</span> {{ font.weights.join(', ') }}</div>
                <div><span class="font-medium">Styles:</span> {{ font.styles.join(', ') }}</div>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <button
                  v-if="!font.isGlobal"
                  @click="shareFont(font)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Share
                </button>
                <button
                  v-if="!font.isGlobal && font.workspaceId === selectedWorkspace.id"
                  @click="makeFontGlobal(font)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Make Global
                </button>
                <button
                  v-if="font.workspaceId === selectedWorkspace.id"
                  @click="deleteFont(font.id)"
                  class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                  :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Assets Tab -->
        <div v-if="workspaceTab === 'assets'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Assets</h4>
            <button
              @click="showAddAssetModal = true"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              <span class="material-symbols-outlined text-base mr-1">add</span>
              Add Asset
            </button>
          </div>
          <div v-if="workspaceAssets.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">image</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No assets yet</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Add design assets to your workspace</p>
          </div>
          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="asset in workspaceAssets"
              :key="asset.id"
              class="rounded-lg border p-4"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div v-if="asset.thumbnailUrl || asset.url" class="mb-3 rounded overflow-hidden bg-gray-100" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                <img :src="asset.thumbnailUrl || asset.url" :alt="asset.name" class="w-full h-32 object-contain" />
              </div>
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ asset.name }}</h5>
                  <p class="text-xs mt-1 capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ asset.type }}</p>
                </div>
                <span 
                  class="px-2 py-1 text-xs rounded"
                  :class="asset.isGlobal 
                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                >
                  {{ asset.isGlobal ? 'Global' : getWorkspaceName(asset.workspaceId) }}
                </span>
              </div>
              <div v-if="asset.description" class="text-xs mt-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ asset.description }}
              </div>
              <div class="flex items-center gap-2 mt-3">
                <button
                  v-if="!asset.isGlobal"
                  @click="shareAsset(asset)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Share
                </button>
                <button
                  v-if="!asset.isGlobal && asset.workspaceId === selectedWorkspace.id"
                  @click="makeAssetGlobal(asset)"
                  class="text-xs px-2 py-1 rounded transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Make Global
                </button>
                <button
                  v-if="asset.workspaceId === selectedWorkspace.id"
                  @click="deleteAsset(asset.id)"
                  class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                  :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tokens Tab -->
        <div v-if="workspaceTab === 'tokens'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Tokens</h4>
            <button
              @click="showAddTokenModal = true"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              <span class="material-symbols-outlined text-base mr-1">add</span>
              Add Token
            </button>
          </div>
          <div v-if="workspaceTokens.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">palette</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No tokens yet</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Add design tokens to your workspace</p>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="token in workspaceTokens"
              :key="token.id"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-center gap-4 flex-1">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <code class="text-sm font-semibold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ token.name }}</code>
                    <span 
                      class="px-2 py-0.5 text-xs rounded"
                      :class="token.isGlobal 
                        ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                    >
                      {{ token.isGlobal ? 'Global' : getWorkspaceName(token.workspaceId) }}
                    </span>
                  </div>
                  <div class="text-xs mt-1 flex items-center gap-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <span>{{ token.value }}</span>
                    <span class="capitalize">{{ token.category }}</span>
                    <span>{{ token.type }}</span>
                  </div>
                  <div v-if="token.description" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    {{ token.description }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="!token.isGlobal"
                    @click="shareToken(token)"
                    class="text-xs px-2 py-1 rounded transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Share
                  </button>
                  <button
                    v-if="!token.isGlobal && token.workspaceId === selectedWorkspace.id"
                    @click="makeTokenGlobal(token)"
                    class="text-xs px-2 py-1 rounded transition-colors"
                    :class="isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Make Global
                  </button>
                  <button
                    v-if="token.workspaceId === selectedWorkspace.id"
                    @click="deleteToken(token.id)"
                    class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                    :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="workspaceTab === 'reviews'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Reviews</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">rate_review</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Reviews coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage design reviews and feedback</p>
          </div>
        </div>

        <!-- Session Replays Tab -->
        <div v-if="workspaceTab === 'session-replays'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Session Replays</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">videocam</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Session replays coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage user session recordings</p>
          </div>
        </div>

        <!-- Journey Maps Tab -->
        <div v-if="workspaceTab === 'journey-maps'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Journey Maps</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">map</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Journey maps coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage user journey maps</p>
          </div>
        </div>

        <!-- HCD Reports Tab -->
        <div v-if="workspaceTab === 'hcd-reports'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace HCD Reports</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">description</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">HCD reports coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage human-centered design reports</p>
          </div>
        </div>

        <!-- User Personas Tab -->
        <div v-if="workspaceTab === 'user-personas'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace User Personas</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">person</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">User personas coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage user personas and profiles</p>
          </div>
        </div>

        <!-- Research Artifacts Tab -->
        <div v-if="workspaceTab === 'research-artifacts'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Research Artifacts</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">science</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Research artifacts coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage research interviews, surveys, and observations</p>
          </div>
        </div>

        <!-- Insights Tab -->
        <div v-if="workspaceTab === 'insights'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Insights</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">lightbulb</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Insights coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage user insights and findings</p>
          </div>
        </div>

        <!-- Patterns Tab -->
        <div v-if="workspaceTab === 'patterns'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Patterns</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">pattern</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Patterns coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage design patterns</p>
          </div>
        </div>

        <!-- Icons Tab -->
        <div v-if="workspaceTab === 'icons'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Icons</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">image</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Icons coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage icon sets and individual icons</p>
          </div>
        </div>

        <!-- Interactives Tab -->
        <div v-if="workspaceTab === 'interactives'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Interactives</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">interactive_space</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Interactives coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage prototypes, demos, and sandboxes</p>
          </div>
        </div>

        <!-- Stock Photos Tab -->
        <div v-if="workspaceTab === 'stock-photos'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Stock Photos</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">photo_library</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Stock photos coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage stock photography library</p>
          </div>
        </div>

        <!-- Illustrations Tab -->
        <div v-if="workspaceTab === 'illustrations'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Illustrations</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">draw</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Illustrations coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage illustration library</p>
          </div>
        </div>

        <!-- Capability Logos Tab -->
        <div v-if="workspaceTab === 'capability-logos'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Capability Logos</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">workspace_premium</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Capability logos coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage capability and service logos</p>
          </div>
        </div>

        <!-- Style Dictionaries Tab -->
        <div v-if="workspaceTab === 'style-dictionaries'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Style Dictionaries</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">book</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Style dictionaries coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage style dictionaries and token collections</p>
          </div>
        </div>

        <!-- Guidelines Tab -->
        <div v-if="workspaceTab === 'guidelines'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Guidelines</h4>
          </div>
          <div class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">rule</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Guidelines coming soon</p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Manage design guidelines and standards</p>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-if="workspaceTab === 'members'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Members</h4>
            <button
              @click="showAddMemberModal = true"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              Add Member
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="member in selectedWorkspace.members"
              :key="member.userId"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">person</span>
                </div>
                <div>
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ member.email }}</div>
                  <div class="text-xs flex items-center gap-2 mt-1">
                    <span 
                      class="px-2 py-0.5 rounded capitalize"
                      :class="member.role === 'owner'
                        ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')
                        : member.role === 'admin'
                        ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                        : member.role === 'editor'
                        ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ member.role }}
                    </span>
                    <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Added {{ formatDate(member.addedAt) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Dropdown
                  v-if="member.role !== 'owner'"
                  :model-value="member.role"
                  @update:model-value="updateMemberRole(member.userId, $event)"
                  :options="[
                    { value: 'admin', label: 'Admin' },
                    { value: 'editor', label: 'Editor' },
                    { value: 'viewer', label: 'Viewer' }
                  ]"
                  :is-dark-mode="isDarkMode"
                />
                <button
                  v-if="member.role !== 'owner'"
                  @click="removeMember(member.userId)"
                  class="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                  :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                  title="Remove Member"
                >
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="workspaceTab === 'analytics'" class="space-y-6">
          <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <h4 class="font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Analytics</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Components</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ workspaceAnalytics[selectedWorkspace.id]?.totalComponents || 0 }}
                </div>
              </div>
              <div>
                <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Design Debt</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ workspaceAnalytics[selectedWorkspace.id]?.designDebt || 0 }}
                </div>
              </div>
              <div>
                <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Adoption Rate</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ workspaceAnalytics[selectedWorkspace.id]?.adoptionRate || 0 }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="workspaceTab === 'settings'" class="space-y-4">
          <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <h4 class="font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Settings</h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Allow External Sharing</label>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Allow components to be shared with other workspaces
                  </p>
                </div>
                <input
                  type="checkbox"
                  :checked="selectedWorkspace.settings?.allowExternalSharing !== false"
                  @change="updateWorkspaceSetting('allowExternalSharing', $event.target.checked)"
                  class="w-4 h-4 rounded accent-indigo-600"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Require Approval for Sharing</label>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Require admin approval before sharing components
                  </p>
                </div>
                <input
                  type="checkbox"
                  :checked="selectedWorkspace.settings?.requireApprovalForSharing === true"
                  @change="updateWorkspaceSetting('requireApprovalForSharing', $event.target.checked)"
                  class="w-4 h-4 rounded accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div
      v-if="showAddMemberModal && selectedWorkspace"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddMemberModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Add Member
          </h3>
          <button
            @click="showAddMemberModal = false; resetAddMemberForm()"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Email *
            </label>
            <input
              v-model="newMember.email"
              type="email"
              placeholder="user@example.com"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Role *
            </label>
            <Dropdown
              v-model="newMember.role"
              :options="[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="addMember"
              :disabled="!newMember.email || addingMember"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newMember.email && !addingMember
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ addingMember ? 'Adding...' : 'Add Member' }}
            </button>
            <button
              @click="showAddMemberModal = false; resetAddMemberForm()"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Component Modal -->
    <div
      v-if="shareComponentModal && selectedWorkspace"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="shareComponentModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Share Component
          </h3>
          <button
            @click="shareComponentModal = false; sharingComponent = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Select Component
            </label>
            <Dropdown
              v-model="sharingComponent"
              :options="workspaceComponents.map(c => ({ value: c.id, label: c.name }))"
              :is-dark-mode="isDarkMode"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Share With Workspaces
            </label>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <label
                v-for="ws in workspaces.filter(w => w.id !== selectedWorkspace.id)"
                :key="ws.id"
                class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                :class="isDarkMode ? 'hover:bg-slate-700' : ''"
              >
                <input
                  type="checkbox"
                  :value="ws.id"
                  v-model="selectedWorkspacesForSharing"
                  class="w-4 h-4 rounded accent-indigo-600"
                />
                <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ ws.name }}</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="shareComponentWithWorkspaces"
              :disabled="!sharingComponent || selectedWorkspacesForSharing.length === 0 || sharing"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="sharingComponent && selectedWorkspacesForSharing.length > 0 && !sharing
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ sharing ? 'Sharing...' : 'Share Component' }}
            </button>
            <button
              @click="shareComponentModal = false; sharingComponent = null; selectedWorkspacesForSharing = []"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const workspaces = ref([]);
const loading = ref(false);
const showCreateWorkspaceModal = ref(false);
const selectedWorkspace = ref(null);
const workspaceTab = ref('overview');
const workspaceComponents = ref([]);
const workspaceAnalytics = ref({});
const workspaceFonts = ref([]);
const workspaceAssets = ref([]);
const workspaceTokens = ref([]);
const newWorkspace = ref({ name: '', description: '' });
const creating = ref(false);
const showAddMemberModal = ref(false);
const newMember = ref({ email: '', role: 'viewer' });
const addingMember = ref(false);
const shareComponentModal = ref(false);
const sharingComponent = ref(null);
const selectedWorkspacesForSharing = ref([]);
const showAddFontModal = ref(false);
const showAddAssetModal = ref(false);
const showAddTokenModal = ref(false);
const newFont = ref({ name: '', family: '', weights: [], styles: [], source: 'google', url: '', fallback: '' });
const newAsset = ref({ name: '', type: 'image', url: '', description: '', tags: [] });
const newToken = ref({ name: '', value: '', type: 'color', category: 'colors', description: '', tags: [] });
const sharing = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';
const CURRENT_USER_ID = 'user-123'; // In production, get from auth context
const CURRENT_USER_EMAIL = 'user@example.com'; // In production, get from auth context

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadWorkspaces = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_BASE_URL}/workspaces?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaces.value = response.data || [];
    
    // Load analytics for each workspace
    for (const workspace of workspaces.value) {
      await loadWorkspaceAnalytics(workspace.id);
    }
  } catch (error) {
    console.error('Failed to load workspaces:', error);
    // Fallback to mock data
    workspaces.value = [
      {
        id: 'workspace-1',
        name: 'Marketing Team',
        description: 'Marketing team workspace for promotional components',
        slug: 'marketing-team',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        ownerId: CURRENT_USER_ID,
        members: [
          { userId: CURRENT_USER_ID, email: CURRENT_USER_EMAIL, role: 'owner', addedAt: new Date('2024-01-15'), addedBy: CURRENT_USER_ID },
          { userId: 'user-456', email: 'marketing@example.com', role: 'editor', addedAt: new Date('2024-01-16'), addedBy: CURRENT_USER_ID },
        ],
        settings: {
          allowExternalSharing: true,
          requireApprovalForSharing: false,
        },
      },
      {
        id: 'workspace-2',
        name: 'Product Team',
        description: 'Product team workspace for core product components',
        slug: 'product-team',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        ownerId: 'user-789',
        members: [
          { userId: 'user-789', email: 'product@example.com', role: 'owner', addedAt: new Date('2024-01-10'), addedBy: 'user-789' },
          { userId: CURRENT_USER_ID, email: CURRENT_USER_EMAIL, role: 'viewer', addedAt: new Date('2024-01-12'), addedBy: 'user-789' },
        ],
        settings: {
          allowExternalSharing: true,
          requireApprovalForSharing: true,
        },
      },
    ];
  } finally {
    loading.value = false;
  }
};

const loadWorkspaceAnalytics = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/analytics`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceAnalytics.value[workspaceId] = response.data;
  } catch (error) {
    console.error(`Failed to load analytics for workspace ${workspaceId}:`, error);
    // Fallback to mock data
    workspaceAnalytics.value[workspaceId] = {
      totalComponents: Math.floor(Math.random() * 20) + 5,
      componentsByStatus: {
        production: Math.floor(Math.random() * 10) + 3,
        'in-progress': Math.floor(Math.random() * 5) + 1,
        planned: Math.floor(Math.random() * 3),
        deprecated: Math.floor(Math.random() * 2),
      },
      totalApplications: Math.floor(Math.random() * 5) + 1,
      adoptionRate: Math.floor(Math.random() * 20) + 75,
      designDebt: Math.floor(Math.random() * 3),
      mostUsedComponents: [],
      healthScore: Math.floor(Math.random() * 20) + 75,
    };
  }
};

const loadWorkspaceComponents = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/components?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceComponents.value = response.data.components || [];
  } catch (error) {
    console.error(`Failed to load components for workspace ${workspaceId}:`, error);
    workspaceComponents.value = [];
  }
};

const loadWorkspaceFonts = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/fonts?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceFonts.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load fonts for workspace ${workspaceId}:`, error);
    workspaceFonts.value = [];
  }
};

const loadWorkspaceAssets = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/assets?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceAssets.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load assets for workspace ${workspaceId}:`, error);
    workspaceAssets.value = [];
  }
};

const loadWorkspaceTokens = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/tokens?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceTokens.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load tokens for workspace ${workspaceId}:`, error);
    workspaceTokens.value = [];
  }
};

const createWorkspace = async () => {
  if (!newWorkspace.value.name) return;

  try {
    creating.value = true;
    const response = await axios.post(`${API_BASE_URL}/workspaces`, {
      name: newWorkspace.value.name,
      description: newWorkspace.value.description,
      ownerId: CURRENT_USER_ID,
      ownerEmail: CURRENT_USER_EMAIL,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    workspaces.value.push(response.data);
    await loadWorkspaceAnalytics(response.data.id);
    showCreateWorkspaceModal.value = false;
    resetCreateForm();
  } catch (error) {
    console.error('Failed to create workspace:', error);
    alert('Failed to create workspace. Please try again.');
  } finally {
    creating.value = false;
  }
};

const resetCreateForm = () => {
  newWorkspace.value = { name: '', description: '' };
};

const viewWorkspace = async (workspaceId) => {
  router.push(`/admin/workspaces/${workspaceId}`);
};

const editWorkspace = (workspace) => {
  selectedWorkspace.value = workspace;
  workspaceTab.value = 'settings';
};

const manageMembers = (workspace) => {
  selectedWorkspace.value = workspace;
  workspaceTab.value = 'members';
};

const addMember = async () => {
  if (!newMember.value.email || !selectedWorkspace.value) return;

  try {
    addingMember.value = true;
    const response = await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/members`, {
      userId: `user-${Date.now()}`, // In production, lookup by email
      email: newMember.value.email,
      role: newMember.value.role,
      addedBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    selectedWorkspace.value = response.data;
    showAddMemberModal.value = false;
    resetAddMemberForm();
  } catch (error) {
    console.error('Failed to add member:', error);
    alert('Failed to add member. Please try again.');
  } finally {
    addingMember.value = false;
  }
};

const resetAddMemberForm = () => {
  newMember.value = { email: '', role: 'viewer' };
};

const removeMember = async (userId) => {
  if (!selectedWorkspace.value) return;
  if (!confirm('Are you sure you want to remove this member?')) return;

  try {
    const response = await axios.delete(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/members/${userId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    selectedWorkspace.value = response.data;
  } catch (error) {
    console.error('Failed to remove member:', error);
    alert('Failed to remove member. Please try again.');
  }
};

const updateMemberRole = async (userId, role) => {
  if (!selectedWorkspace.value) return;

  try {
    const response = await axios.patch(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/members/${userId}/role`, {
      role,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    selectedWorkspace.value = response.data;
  } catch (error) {
    console.error('Failed to update member role:', error);
    alert('Failed to update member role. Please try again.');
  }
};

const updateWorkspaceSetting = async (setting, value) => {
  if (!selectedWorkspace.value) return;

  try {
    const response = await axios.put(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}`, {
      settings: {
        ...selectedWorkspace.value.settings,
        [setting]: value,
      },
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    selectedWorkspace.value = response.data;
  } catch (error) {
    console.error('Failed to update workspace setting:', error);
    alert('Failed to update setting. Please try again.');
  }
};

const shareComponent = (component) => {
  sharingComponent.value = component.id;
  shareComponentModal.value = true;
  // Load current shares
  selectedWorkspacesForSharing.value = component.sharedWith || [];
};

const shareComponentWithWorkspaces = async () => {
  if (!sharingComponent.value || !selectedWorkspace.value || selectedWorkspacesForSharing.value.length === 0) return;

  try {
    sharing.value = true;
  const response = await axios.post(`${API_BASE_URL}/components/${sharingComponent.value}/share`, {
      workspaceIds: selectedWorkspacesForSharing.value,
      requestingWorkspaceId: selectedWorkspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceComponents(selectedWorkspace.value.id);
    shareComponentModal.value = false;
    sharingComponent.value = null;
    selectedWorkspacesForSharing.value = [];
  } catch (error) {
    console.error('Failed to share component:', error);
    alert('Failed to share component. Please try again.');
  } finally {
    sharing.value = false;
  }
};

const makeGlobal = async (component) => {
  if (!selectedWorkspace.value) return;
  if (!confirm('Make this component available to all workspaces? This action cannot be undone.')) return;

  try {
    await axios.post(`${API_BASE_URL}/components/${component.id}/make-global`, {
      requestingWorkspaceId: selectedWorkspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceComponents(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to make component global:', error);
    alert('Failed to make component global. Please try again.');
  }
};

// Font functions
const addFont = async () => {
  if (!newFont.value.name || !newFont.value.family || !selectedWorkspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/fonts`, {
      ...newFont.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(selectedWorkspace.value.id);
    showAddFontModal.value = false;
    newFont.value = { name: '', family: '', weights: [], styles: [], source: 'google', url: '', fallback: '' };
  } catch (error) {
    console.error('Failed to add font:', error);
    alert('Failed to add font. Please try again.');
  }
};

const deleteFont = async (fontId) => {
  if (!selectedWorkspace.value || !confirm('Delete this font?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/fonts/${fontId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to delete font:', error);
    alert('Failed to delete font. Please try again.');
  }
};

const shareFont = (font) => {
  sharingComponent.value = font.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = font.sharedWith || [];
};

const makeFontGlobal = async (font) => {
  if (!selectedWorkspace.value || !confirm('Make this font available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/fonts/${font.id}/make-global`, {
      requestingWorkspaceId: selectedWorkspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to make font global:', error);
    alert('Failed to make font global. Please try again.');
  }
};

// Asset functions
const addAsset = async () => {
  if (!newAsset.value.name || !newAsset.value.url || !selectedWorkspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/assets`, {
      ...newAsset.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(selectedWorkspace.value.id);
    showAddAssetModal.value = false;
    newAsset.value = { name: '', type: 'image', url: '', description: '', tags: [] };
  } catch (error) {
    console.error('Failed to add asset:', error);
    alert('Failed to add asset. Please try again.');
  }
};

const deleteAsset = async (assetId) => {
  if (!selectedWorkspace.value || !confirm('Delete this asset?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/assets/${assetId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to delete asset:', error);
    alert('Failed to delete asset. Please try again.');
  }
};

const shareAsset = (asset) => {
  sharingComponent.value = asset.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = asset.sharedWith || [];
};

const makeAssetGlobal = async (asset) => {
  if (!selectedWorkspace.value || !confirm('Make this asset available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/assets/${asset.id}/make-global`, {
      requestingWorkspaceId: selectedWorkspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to make asset global:', error);
    alert('Failed to make asset global. Please try again.');
  }
};

// Token functions
const addToken = async () => {
  if (!newToken.value.name || !newToken.value.value || !selectedWorkspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/tokens`, {
      ...newToken.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(selectedWorkspace.value.id);
    showAddTokenModal.value = false;
    newToken.value = { name: '', value: '', type: 'color', category: 'colors', description: '', tags: [] };
  } catch (error) {
    console.error('Failed to add token:', error);
    alert('Failed to add token. Please try again.');
  }
};

const deleteToken = async (tokenId) => {
  if (!selectedWorkspace.value || !confirm('Delete this token?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/tokens/${tokenId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to delete token:', error);
    alert('Failed to delete token. Please try again.');
  }
};

const shareToken = (token) => {
  sharingComponent.value = token.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = token.sharedWith || [];
};

const makeTokenGlobal = async (token) => {
  if (!selectedWorkspace.value || !confirm('Make this token available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${selectedWorkspace.value.id}/tokens/${token.id}/make-global`, {
      requestingWorkspaceId: selectedWorkspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(selectedWorkspace.value.id);
  } catch (error) {
    console.error('Failed to make token global:', error);
    alert('Failed to make token global. Please try again.');
  }
};

const getWorkspaceName = (workspaceId) => {
  if (!workspaceId) return 'Unknown';
  const workspace = workspaces.value.find(w => w.id === workspaceId);
  return workspace ? workspace.name : 'Unknown';
};

const getHealthScoreColor = (score) => {
  if (score >= 80) return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (score >= 60) return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
  return isDarkMode.value ? 'text-red-400' : 'text-red-600';
};

const getHealthScoreBarColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

let darkModeObserver = null;

onMounted(() => {
  loadWorkspaces();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

