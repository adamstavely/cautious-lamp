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
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Application Management
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Register and manage applications with the design system. Enable scanners and capabilities for governance, visual regression, and session replay.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="appMgmtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Application grid -->
                    <rect x="30" y="40" width="50" height="50" rx="4" fill="url(#appMgmtGradient)" opacity="0.4"/>
                    <rect x="100" y="40" width="50" height="50" rx="4" fill="url(#appMgmtGradient)" opacity="0.5"/>
                    <rect x="30" y="110" width="50" height="50" rx="4" fill="url(#appMgmtGradient)" opacity="0.3"/>
                    <rect x="100" y="110" width="50" height="50" rx="4" fill="url(#appMgmtGradient)" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="max-w-7xl mx-auto mb-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="router.push('/admin/applications/register')"
              class="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              Register New Application
            </button>
            
            <Dropdown
              :model-value="filterCapability"
              @update:model-value="filterCapability = $event"
              :options="[
                { value: '', label: 'All Applications' },
                { value: 'governance', label: 'With Governance' },
                { value: 'visualRegression', label: 'With Visual Regression' },
                { value: 'sessionReplay', label: 'With Session Replay' }
              ]"
              :is-dark-mode="isDarkMode"
              label="Filter by capability"
            />
          </div>
        </div>

        <!-- Applications Table -->
        <div class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div v-if="loading" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Loading applications...
            </div>
            
            <div v-else-if="filteredApplications.length === 0" class="p-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No applications found. <router-link to="/admin/applications/register" class="text-indigo-600 hover:text-indigo-700 underline">Register your first application</router-link>
            </div>

            <table v-else class="w-full">
              <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Application</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Workspace</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Design System Version</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Capabilities</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Metadata</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Registered</th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <tr
                  v-for="app in filteredApplications"
                  :key="app.id"
                  class="hover:bg-opacity-50 transition-colors"
                  :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ app.name }}</div>
                      <div v-if="app.description" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ app.description }}</div>
                      <div v-if="app.repository" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                        <a :href="app.repository" target="_blank" class="text-indigo-600 hover:text-indigo-700">{{ app.repository }}</a>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      v-if="app.workspaceId"
                      class="px-2 py-1 text-xs rounded font-medium"
                      :class="isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'"
                    >
                      {{ getWorkspaceName(app.workspaceId) }}
                    </span>
                    <span 
                      v-else
                      class="px-2 py-1 text-xs rounded font-medium"
                      :class="isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'"
                    >
                      No workspace
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span 
                        v-if="app.designSystemVersion"
                        class="text-sm font-medium"
                        :class="getVersionStatusClass(app.designSystemVersion)"
                      >
                        v{{ app.designSystemVersion }}
                      </span>
                      <span 
                        v-else
                        class="text-sm"
                        :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                      >
                        Not set
                      </span>
                      <span 
                        v-if="app.designSystemVersion && needsUpgrade(app.designSystemVersion)"
                        class="material-symbols-outlined text-sm text-yellow-500"
                        title="Needs upgrade"
                      >
                        warning
                      </span>
                      <span 
                        v-if="app.designSystemVersion === currentDesignSystemVersion"
                        class="material-symbols-outlined text-sm text-green-500"
                        title="Up to date"
                      >
                        check_circle
                      </span>
                    </div>
                    <button
                      v-if="app.designSystemVersion && needsUpgrade(app.designSystemVersion)"
                      @click="showVersionUpdateModal(app)"
                      class="text-xs mt-1 text-indigo-600 hover:text-indigo-700"
                    >
                      Update to v{{ currentDesignSystemVersion }}
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-if="app.capabilities?.governance?.enabled"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        :class="isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'"
                      >
                        Governance
                      </span>
                      <span
                        v-if="app.capabilities?.visualRegression?.enabled"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        :class="isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'"
                      >
                        Visual Regression
                      </span>
                      <span
                        v-if="app.capabilities?.sessionReplay?.enabled"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        :class="isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'"
                      >
                        Session Replay
                      </span>
                      <span
                        v-if="!app.capabilities?.governance?.enabled && !app.capabilities?.visualRegression?.enabled && !app.capabilities?.sessionReplay?.enabled"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        :class="isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'"
                      >
                        No Capabilities
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm space-y-1">
                      <div v-if="app.metadata?.environment" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <span class="font-medium">Env:</span> {{ app.metadata.environment }}
                      </div>
                      <div v-if="app.metadata?.framework" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        <span class="font-medium">Framework:</span> {{ app.metadata.framework }}
                      </div>
                      <div v-if="app.metadata?.tags && app.metadata.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="tag in app.metadata.tags"
                          :key="tag"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                          :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ formatDate(app.registeredAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="editApplication(app)"
                        class="text-indigo-600 hover:text-indigo-700 transition-colors"
                        :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                        title="Edit capabilities"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        @click="deleteApplication(app)"
                        class="text-red-600 hover:text-red-700 transition-colors"
                        :class="isDarkMode ? 'text-red-400 hover:text-red-300' : ''"
                        title="Delete application"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Migration Planning Section -->
        <div class="max-w-7xl mx-auto mt-8 mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">upgrade</span>
                Migration Planning
              </h3>
              <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Track design system versions and plan upgrades across applications
              </p>
            </div>
            <div class="p-6">
              <!-- Summary Cards -->
              <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Current DS Version</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    v{{ currentDesignSystemVersion }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Up to Date</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ migrationData?.upgradeSummary?.upToDate || 0 }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Needs Upgrade</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ migrationData?.upgradeSummary?.needsUpgrade || 0 }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Major Upgrades</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ migrationData?.upgradeSummary?.needsMajorUpgrade || 0 }}
                  </div>
                </div>
              </div>

              <!-- Recommended Actions -->
              <div v-if="migrationData?.recommendedActions?.length > 0" class="mb-6">
                <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Recommended Actions</h4>
                <div class="space-y-2">
                  <div
                    v-for="action in migrationData.recommendedActions.slice(0, 5)"
                    :key="action.applicationId"
                    class="p-3 rounded-lg border flex items-center justify-between"
                    :class="action.priority === 'high'
                      ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                      : (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ action.applicationName }}
                        </span>
                        <span 
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="action.priority === 'high'
                            ? (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                            : (isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700')"
                        >
                          {{ action.priority }}
                        </span>
                      </div>
                      <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ action.reason }}
                      </p>
                      <div class="flex items-center gap-2 mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        <span>v{{ action.currentVersion }}</span>
                        <span class="material-symbols-outlined text-base">arrow_forward</span>
                        <span>v{{ action.targetVersion }}</span>
                      </div>
                    </div>
                    <button
                      @click="updateApplicationVersion(action.applicationId, action.targetVersion)"
                      :disabled="updatingVersion === action.applicationId"
                      class="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ml-4"
                      :class="updatingVersion === action.applicationId
                        ? (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                        : (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')"
                    >
                      <span v-if="updatingVersion === action.applicationId" class="material-symbols-outlined text-sm animate-spin">refresh</span>
                      <span v-else class="material-symbols-outlined text-sm">update</span>
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <!-- Applications by Version -->
              <div>
                <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Applications by Version</h4>
                <div class="space-y-4">
                  <div
                    v-for="(apps, version) in migrationData?.applicationsByVersion"
                    :key="version"
                    class="border-b last:border-b-0 pb-4 last:pb-0"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          v{{ version }}
                        </span>
                        <span 
                          v-if="version === currentDesignSystemVersion"
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'"
                        >
                          Current
                        </span>
                      </div>
                      <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ apps.length }} app{{ apps.length !== 1 ? 's' : '' }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="app in apps"
                        :key="app.id"
                        class="text-xs px-2 py-1 rounded"
                        :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'"
                      >
                        {{ app.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Capabilities Modal -->
    <div
      v-if="editingApplication"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="closeEditModal"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Edit Capabilities: {{ editingApplication.name }}
          </h2>
          <button
            @click="closeEditModal"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveCapabilities" class="p-6 space-y-6">
          <!-- Governance -->
          <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="editForm.capabilities.governance.enabled"
                  class="w-5 h-5 accent-indigo-600"
                />
                <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Design System Governance
                </label>
              </div>
            </div>
            <div v-if="editForm.capabilities.governance.enabled" class="mt-4">
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Scan Schedule
              </label>
              <Dropdown
                :model-value="editForm.capabilities.governance.scanSchedule"
                @update:model-value="editForm.capabilities.governance.scanSchedule = $event"
                :options="[
                  { value: 'manual', label: 'Manual' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'on-commit', label: 'On Commit' }
                ]"
                :is-dark-mode="isDarkMode"
              />
            </div>
          </div>

          <!-- Visual Regression -->
          <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="editForm.capabilities.visualRegression.enabled"
                  class="w-5 h-5 accent-indigo-600"
                />
                <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Visual Regression Testing
                </label>
              </div>
            </div>
            <div v-if="editForm.capabilities.visualRegression.enabled" class="mt-4 space-y-3">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Argos Project ID *
                </label>
                <input
                  v-model="editForm.capabilities.visualRegression.argosProjectId"
                  type="text"
                  :required="editForm.capabilities.visualRegression.enabled"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                  Branch: <strong>develop</strong> (default) | Argos URL: <strong>{{ defaultArgosUrl }}</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Session Replay -->
          <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="editForm.capabilities.sessionReplay.enabled"
                  class="w-5 h-5 accent-indigo-600"
                />
                <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Session Replay
                </label>
              </div>
            </div>
            <div v-if="editForm.capabilities.sessionReplay.enabled" class="mt-4 space-y-3">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  OpenReplay Project Key *
                </label>
                <input
                  v-model="editForm.capabilities.sessionReplay.openreplayProjectKey"
                  type="text"
                  :required="editForm.capabilities.sessionReplay.enabled"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  OpenReplay Base URL
                </label>
                <input
                  v-model="editForm.capabilities.sessionReplay.openreplayBaseUrl"
                  type="url"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Privacy Settings
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="editForm.capabilities.sessionReplay.privacySettings.maskAllInputs"
                      class="accent-indigo-600"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Mask All Inputs</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="editForm.capabilities.sessionReplay.privacySettings.maskAllText"
                      class="accent-indigo-600"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Mask All Text</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="editForm.capabilities.sessionReplay.privacySettings.respectDoNotTrack"
                      class="accent-indigo-600"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Respect Do Not Track</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              type="button"
              @click="closeEditModal"
              class="px-6 py-3 rounded-lg font-semibold transition-colors"
              :class="isDarkMode 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              :class="isSaving
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'"
            >
              <span v-if="isSaving" class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const router = useRouter();
const drawerOpen = ref(false);
const isDarkMode = ref(false);
const loading = ref(false);
const isSaving = ref(false);
const applications = ref([]);
const workspaces = ref([]);
const filterCapability = ref('');
const editingApplication = ref(null);
const migrationData = ref(null);
const currentDesignSystemVersion = ref('2.1.0');
const updatingVersion = ref(null);

const defaultArgosUrl = 'https://app.argos-ci.com';

const editForm = ref({
  capabilities: {
    governance: {
      enabled: false,
      scanSchedule: 'manual'
    },
    visualRegression: {
      enabled: false,
      argosProjectId: '',
      argosBaseUrl: defaultArgosUrl,
      argosBranch: 'develop'
    },
    sessionReplay: {
      enabled: false,
      openreplayProjectKey: '',
      openreplayBaseUrl: '',
      privacySettings: {
        maskAllInputs: false,
        maskAllText: false,
        respectDoNotTrack: false
      }
    }
  }
});

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const filteredApplications = computed(() => {
  if (!filterCapability.value) {
    return applications.value;
  }
  return applications.value.filter(app => {
    const cap = app.capabilities?.[filterCapability.value];
    return cap?.enabled === true;
  });
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadApplications = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filterCapability.value) {
      params.append('capability', filterCapability.value);
    }
    const response = await axios.get(`${API_BASE_URL}/applications?${params.toString()}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    applications.value = response.data.applications || [];
    // Also load migration data
    await loadMigrationData();
  } catch (error) {
    console.error('Failed to load applications:', error);
    window.showToast?.('Failed to load applications', 'error');
  } finally {
    loading.value = false;
  }
};

const loadMigrationData = async () => {
  try {
    const [migrationResponse, versionResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/applications/version-tracking`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }),
      axios.get(`${API_BASE_URL}/design-system/current-version`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      })
    ]);
    migrationData.value = migrationResponse.data;
    currentDesignSystemVersion.value = versionResponse.data.version;
  } catch (error) {
    console.error('Failed to load migration data:', error);
  }
};

const updateApplicationVersion = async (applicationId, version) => {
  updatingVersion.value = applicationId;
  try {
    await axios.patch(`${API_BASE_URL}/applications/${applicationId}/design-system-version`, 
      { version },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    window.showToast?.('Application version updated successfully', 'success');
    await loadApplications();
  } catch (error) {
    console.error('Error updating application version:', error);
    window.showToast?.('Failed to update application version', 'error');
  } finally {
    updatingVersion.value = null;
  }
};

const showVersionUpdateModal = (app) => {
  if (confirm(`Update ${app.name} from v${app.designSystemVersion} to v${currentDesignSystemVersion.value}?`)) {
    updateApplicationVersion(app.id, currentDesignSystemVersion.value);
  }
};

const needsUpgrade = (version) => {
  if (!version) return true;
  return version !== currentDesignSystemVersion.value;
};

const getVersionStatusClass = (version) => {
  if (!version) return isDarkMode.value ? 'text-gray-500' : 'text-gray-400';
  if (version === currentDesignSystemVersion.value) {
    return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  }
  return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
};

const getWorkspaceName = (workspaceId) => {
  if (!workspaceId) return 'Unknown';
  const workspace = workspaces.value.find(w => w.id === workspaceId);
  return workspace ? workspace.name : 'Unknown';
};

const loadWorkspaces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaces.value = response.data || [];
  } catch (error) {
    console.error('Failed to load workspaces:', error);
    workspaces.value = [];
  }
};

const editApplication = (app) => {
    editingApplication.value = app;
    editForm.value = {
      capabilities: {
        governance: {
          enabled: app.capabilities?.governance?.enabled || false,
          scanSchedule: app.capabilities?.governance?.scanSchedule || 'manual'
        },
        visualRegression: {
          enabled: app.capabilities?.visualRegression?.enabled || false,
          argosProjectId: app.capabilities?.visualRegression?.argosProjectId || '',
          argosBaseUrl: defaultArgosUrl,
          argosBranch: 'develop'
        },
      sessionReplay: {
        enabled: app.capabilities?.sessionReplay?.enabled || false,
        openreplayProjectKey: app.capabilities?.sessionReplay?.openreplayProjectKey || '',
        openreplayBaseUrl: app.capabilities?.sessionReplay?.openreplayBaseUrl || '',
        privacySettings: {
          maskAllInputs: app.capabilities?.sessionReplay?.privacySettings?.maskAllInputs || false,
          maskAllText: app.capabilities?.sessionReplay?.privacySettings?.maskAllText || false,
          respectDoNotTrack: app.capabilities?.sessionReplay?.privacySettings?.respectDoNotTrack || false
        }
      }
    }
  };
};

const closeEditModal = () => {
  editingApplication.value = null;
};

const saveCapabilities = async () => {
  if (!editingApplication.value) return;
  
  isSaving.value = true;
  try {
    const payload = {
      governance: editForm.value.capabilities.governance.enabled ? {
        enabled: true,
        scanSchedule: editForm.value.capabilities.governance.scanSchedule
      } : { enabled: false },
      visualRegression: editForm.value.capabilities.visualRegression.enabled ? {
        enabled: true,
        argosProjectId: editForm.value.capabilities.visualRegression.argosProjectId,
        argosBaseUrl: defaultArgosUrl,
        argosBranch: 'develop'
      } : { enabled: false },
      sessionReplay: editForm.value.capabilities.sessionReplay.enabled ? {
        enabled: true,
        openreplayProjectKey: editForm.value.capabilities.sessionReplay.openreplayProjectKey,
        openreplayBaseUrl: editForm.value.capabilities.sessionReplay.openreplayBaseUrl || undefined,
        privacySettings: editForm.value.capabilities.sessionReplay.privacySettings
      } : { enabled: false }
    };

    await axios.patch(`${API_BASE_URL}/applications/${editingApplication.value.id}/capabilities`, payload, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    window.showToast?.('Capabilities updated successfully', 'success');
    closeEditModal();
    await loadApplications();
  } catch (error) {
    console.error('Failed to update capabilities:', error);
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update capabilities';
    window.showToast?.(errorMsg, 'error');
  } finally {
    isSaving.value = false;
  }
};

const deleteApplication = async (app) => {
  if (!confirm(`Are you sure you want to delete "${app.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/applications/${app.id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    window.showToast?.('Application deleted successfully', 'success');
    await loadApplications();
  } catch (error) {
    console.error('Failed to delete application:', error);
    const errorMsg = error.response?.data?.message || error.message || 'Failed to delete application';
    window.showToast?.(errorMsg, 'error');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

onMounted(async () => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  // Load workspaces and applications
  await loadWorkspaces();
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  await loadApplications();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

