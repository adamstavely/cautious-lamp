<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-auto"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Design-to-Code Sync
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Sync components and tokens from Figma and Penpot directly into your design system. Automatically generate component code and keep everything in sync with bidirectional synchronization.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="designSyncGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Design-to-code icon -->
                    <rect x="30" y="50" width="60" height="60" rx="8" fill="url(#designSyncGradient)" opacity="0.3"/>
                    <rect x="110" y="50" width="60" height="60" rx="8" fill="url(#designSyncGradient)" opacity="0.5"/>
                    <path d="M 90 80 L 110 80" stroke="url(#designSyncGradient)" stroke-width="4" stroke-linecap="round"/>
                    <path d="M 90 80 L 100 70" stroke="url(#designSyncGradient)" stroke-width="4" stroke-linecap="round"/>
                    <path d="M 90 80 L 100 90" stroke="url(#designSyncGradient)" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="50" cy="80" r="4" fill="url(#designSyncGradient)"/>
                    <circle cx="140" cy="80" r="4" fill="url(#designSyncGradient)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Connections Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Connections
            </h2>
            <button 
              @click="showCreateModal = true"
              class="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              New Connection
            </button>
          </div>

          <!-- Connections Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="connections.length > 0">
            <div 
              v-for="connection in connections" 
              :key="connection.id"
              class="rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                    :class="isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'"
                  >
                    <span class="material-symbols-outlined text-2xl"
                      :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
                    >
                      {{ getToolIcon(connection.tool) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ connection.name }}
                    </h3>
                    <p class="text-sm capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ connection.tool }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    class="w-3 h-3 rounded-full"
                    :class="connection.enabled ? 'bg-green-500' : 'bg-gray-400'"
                  ></span>
                </div>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="connection.enabled 
                      ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700')
                      : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')"
                  >
                    {{ connection.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Sync Direction</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium capitalize"
                    :class="isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ connection.syncDirection.replace('-', ' ') }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Auto Sync</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="connection.autoSync 
                      ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700')
                      : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')"
                  >
                    {{ connection.autoSync ? 'On' : 'Off' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm" v-if="connection.lastSync">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Last Sync</span>
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ formatDate(connection.lastSync) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm" v-if="connection.lastSyncVersion">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Version</span>
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ connection.lastSyncVersion }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-4 border-t"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              >
                <button 
                  @click="viewDesignFile(connection.id)"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
                >
                  View File
                </button>
                <button 
                  @click="syncConnection(connection.id)"
                  :disabled="syncingConnections.has(connection.id)"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="syncingConnections.has(connection.id)
                    ? (isDarkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                    : (isDarkMode ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200')"
                >
                  {{ syncingConnections.has(connection.id) ? 'Syncing...' : 'Sync Now' }}
                </button>
                <button 
                  @click="editConnection(connection)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'border border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  Edit
                </button>
                <button 
                  @click="deleteConnection(connection.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div 
            v-else
            class="rounded-2xl p-12 text-center border"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900' 
              : 'border-gray-300 bg-white'"
          >
            <span class="material-symbols-outlined text-6xl mb-4"
              :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'"
            >
              sync_disabled
            </span>
            <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              No connections yet
            </h3>
            <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Connect your design tools to start syncing components and tokens automatically.
            </p>
            <button 
              @click="showCreateModal = true"
              class="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Create First Connection
            </button>
          </div>
        </div>

        <!-- Sync Results Section -->
        <div class="max-w-7xl mx-auto mb-16" v-if="lastSyncResult">
          <div class="rounded-2xl p-6 border"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900' 
              : 'border-gray-300 bg-white'"
          >
            <h3 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Last Sync Results
            </h3>
            <div class="grid md:grid-cols-6 gap-4 mb-6">
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-green-900/20' : 'bg-green-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-green-400' : 'text-green-700'">
                  {{ lastSyncResult.components.added.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-green-300' : 'text-green-600'">
                  Components Added
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-700'">
                  {{ lastSyncResult.components.updated.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-blue-300' : 'text-blue-600'">
                  Components Updated
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-700'">
                  {{ lastSyncResult.components.removed.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-600'">
                  Components Removed
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-green-900/20' : 'bg-green-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-green-400' : 'text-green-700'">
                  {{ lastSyncResult.tokens.added.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-green-300' : 'text-green-600'">
                  Tokens Added
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-700'">
                  {{ lastSyncResult.tokens.updated.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-blue-300' : 'text-blue-600'">
                  Tokens Updated
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-700'">
                  {{ lastSyncResult.tokens.removed.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-600'">
                  Tokens Removed
                </div>
              </div>
            </div>

            <div v-if="lastSyncResult.errors.length > 0" class="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 class="font-semibold mb-2 text-red-700 dark:text-red-400">Errors</h4>
              <ul class="list-disc list-inside text-sm text-red-600 dark:text-red-300">
                <li v-for="(error, index) in lastSyncResult.errors" :key="index">{{ error }}</li>
              </ul>
            </div>

            <div v-if="lastSyncResult.warnings.length > 0" class="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h4 class="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">Warnings</h4>
              <ul class="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300">
                <li v-for="(warning, index) in lastSyncResult.warnings" :key="index">{{ warning }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Design File Modal -->
        <div 
          v-if="showDesignFileModal && selectedDesignFile"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeDesignFileModal"
        >
          <div 
            class="rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto"
            :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedDesignFile.name }}
              </h3>
              <button 
                @click="closeDesignFileModal"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  File Information
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Version</span>
                    <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedDesignFile.version }}</div>
                  </div>
                  <div>
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Last Modified</span>
                    <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatDate(selectedDesignFile.lastModified) }}</div>
                  </div>
                  <div>
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</span>
                    <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedDesignFile.components.length }}</div>
                  </div>
                  <div>
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Tokens</span>
                    <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ selectedDesignFile.tokens.length }}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Components ({{ selectedDesignFile.components.length }})
                </h4>
                <div class="space-y-3">
                  <div 
                    v-for="component in selectedDesignFile.components"
                    :key="component.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-900' 
                      : 'border-gray-200 bg-gray-50'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ component.name }}</div>
                        <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ component.description || 'No description' }}</div>
                      </div>
                      <button 
                        @click="generateComponentCode(component)"
                        class="px-3 py-1 rounded text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' 
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
                      >
                        Generate Code
                      </button>
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ component.properties.length }} properties
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Tokens ({{ selectedDesignFile.tokens.length }})
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div 
                    v-for="token in selectedDesignFile.tokens"
                    :key="token.id"
                    class="p-3 rounded-lg border"
                    :class="isDarkMode 
                      ? 'border-gray-700 bg-slate-900' 
                      : 'border-gray-200 bg-gray-50'"
                  >
                    <div class="font-medium text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ token.name }}</div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ token.value }} • {{ token.type }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Component Code Generation Modal -->
        <div 
          v-if="showCodeModal && selectedComponent"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeCodeModal"
        >
          <div 
            class="rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto"
            :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Generated Code: {{ selectedComponent.name }}
              </h3>
              <button 
                @click="closeCodeModal"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="mb-4">
              <div class="flex items-center gap-2">
                <button 
                  v-for="framework in ['vue', 'react', 'html']"
                  :key="framework"
                  @click="selectedFramework = framework"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize"
                  :class="selectedFramework === framework
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  {{ framework }}
                </button>
              </div>
            </div>

            <div class="rounded-lg border p-4"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900' 
                : 'border-gray-300 bg-gray-50'"
            >
              <pre class="text-sm overflow-auto" :class="isDarkMode ? 'text-gray-300' : 'text-gray-800'"><code>{{ generatedCode }}</code></pre>
            </div>

            <div class="flex items-center gap-3 mt-6">
              <button 
                @click="copyCode"
                class="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
              >
                Copy Code
              </button>
              <button 
                @click="closeCodeModal"
                class="px-6 py-3 rounded-lg border transition-colors font-medium"
                :class="isDarkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <!-- Create/Edit Connection Modal -->
        <div 
          v-if="showCreateModal || editingConnection"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeModal"
        >
          <div 
            class="rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
            :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ editingConnection ? 'Edit Connection' : 'New Connection' }}
              </h3>
              <button 
                @click="closeModal"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="saveConnection" class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Connection Name
                </label>
                <input 
                  v-model="connectionForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="e.g., Figma Design System"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Design Tool
                </label>
                <Dropdown
                  v-model="connectionForm.tool"
                  :options="toolOptions"
                  placeholder="Select a design tool"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Sync Direction
                </label>
                <Dropdown
                  v-model="connectionForm.syncDirection"
                  :options="syncDirectionOptions"
                  placeholder="Select sync direction"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  API Key / Access Token
                </label>
                <input 
                  v-model="connectionForm.apiKey"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="Enter your API key or access token"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  File ID / URL
                </label>
                <input 
                  v-model="connectionForm.fileId"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="Enter file ID or URL"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  File URL (optional)
                </label>
                <input 
                  v-model="connectionForm.fileUrl"
                  type="url"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="https://..."
                />
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="connectionForm.enabled"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Enable Connection
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="connectionForm.autoSync"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Auto Sync
                  </span>
                </label>
              </div>

              <div v-if="connectionForm.autoSync">
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Sync Interval (minutes)
                </label>
                <input 
                  v-model.number="connectionForm.syncInterval"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="e.g., 60"
                />
              </div>

              <div class="flex items-center gap-3 pt-4">
                <button 
                  type="submit"
                  class="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                >
                  {{ editingConnection ? 'Update Connection' : 'Create Connection' }}
                </button>
                <button 
                  type="button"
                  @click="closeModal"
                  class="px-6 py-3 rounded-lg border transition-colors font-medium"
                  :class="isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const connections = ref([]);
const syncingConnections = ref(new Set());
const lastSyncResult = ref(null);
const showCreateModal = ref(false);
const editingConnection = ref(null);
const showDesignFileModal = ref(false);
const selectedDesignFile = ref(null);
const showCodeModal = ref(false);
const selectedComponent = ref(null);
const selectedFramework = ref('vue');
const generatedCode = ref('');
const currentConnectionId = ref(null);

const connectionForm = reactive({
  name: '',
  tool: 'figma',
  syncDirection: 'bidirectional',
  apiKey: '',
  fileId: '',
  fileUrl: '',
  enabled: true,
  autoSync: false,
  syncInterval: 60,
});

const toolOptions = [
  { value: 'figma', label: 'Figma' },
  { value: 'penpot', label: 'Penpot' },
];

const syncDirectionOptions = [
  { value: 'design-to-code', label: 'Design to Code' },
  { value: 'code-to-design', label: 'Code to Design' },
  { value: 'bidirectional', label: 'Bidirectional' },
];

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const getToolIcon = (tool) => {
  const icons = {
    figma: 'design_services',
    penpot: 'brush',
  };
  return icons[tool] || 'sync';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const loadConnections = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/design-sync/connections`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    connections.value = response.data || [];
  } catch (error) {
    console.error('Error loading connections:', error);
    // Use mock data if API fails
    connections.value = [
      {
        id: 'sync-1',
        name: 'Figma Design System',
        tool: 'figma',
        fileId: 'figma-file-123',
        fileUrl: 'https://www.figma.com/file/123',
        enabled: true,
        syncDirection: 'bidirectional',
        autoSync: false,
        lastSync: new Date('2024-01-20'),
        lastSyncVersion: '1.2.3',
      },
      {
        id: 'sync-2',
        name: 'Penpot Components',
        tool: 'penpot',
        fileId: 'penpot-file-456',
        fileUrl: 'https://penpot.app/file/456',
        enabled: false,
        syncDirection: 'design-to-code',
        autoSync: false,
      },
    ];
  }
};

const syncConnection = async (connectionId) => {
  syncingConnections.value.add(connectionId);
  try {
    const connection = connections.value.find(c => c.id === connectionId);
    const response = await axios.post(
      `${API_BASE_URL}/design-sync/connections/${connectionId}/sync`,
      { direction: connection?.syncDirection || 'bidirectional' },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    lastSyncResult.value = response.data;
    await loadConnections();
  } catch (error) {
    console.error('Error syncing connection:', error);
    alert('Failed to sync. Please try again.');
  } finally {
    syncingConnections.value.delete(connectionId);
  }
};

const viewDesignFile = async (connectionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/design-sync/connections/${connectionId}/file`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    selectedDesignFile.value = response.data;
    currentConnectionId.value = connectionId;
    showDesignFileModal.value = true;
  } catch (error) {
    console.error('Error loading design file:', error);
    alert('Failed to load design file. Please try again.');
  }
};

const generateComponentCode = async (component) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/design-sync/components/${component.id}/generate`,
      { framework: selectedFramework.value, connectionId: currentConnectionId.value },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    generatedCode.value = response.data.code;
    selectedComponent.value = component;
    showCodeModal.value = true;
  } catch (error) {
    console.error('Error generating code:', error);
    alert('Failed to generate code. Please try again.');
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    alert('Code copied to clipboard!');
  } catch (error) {
    console.error('Error copying code:', error);
    alert('Failed to copy code.');
  }
};

const closeCodeModal = () => {
  showCodeModal.value = false;
  selectedComponent.value = null;
  generatedCode.value = '';
};

const closeDesignFileModal = () => {
  showDesignFileModal.value = false;
  selectedDesignFile.value = null;
  currentConnectionId.value = null;
};

const editConnection = (connection) => {
  editingConnection.value = connection;
  Object.assign(connectionForm, {
    name: connection.name,
    tool: connection.tool,
    syncDirection: connection.syncDirection,
    apiKey: connection.apiKey || '',
    fileId: connection.fileId,
    fileUrl: connection.fileUrl || '',
    enabled: connection.enabled,
    autoSync: connection.autoSync,
    syncInterval: connection.syncInterval || 60,
  });
  showCreateModal.value = true;
};

const deleteConnection = async (connectionId) => {
  if (!confirm('Are you sure you want to delete this connection?')) return;
  
  try {
    await axios.delete(`${API_BASE_URL}/design-sync/connections/${connectionId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadConnections();
  } catch (error) {
    console.error('Error deleting connection:', error);
    alert('Failed to delete connection. Please try again.');
  }
};

const saveConnection = async () => {
  try {
    const connectionData = {
      name: connectionForm.name,
      tool: connectionForm.tool,
      syncDirection: connectionForm.syncDirection,
      apiKey: connectionForm.apiKey,
      fileId: connectionForm.fileId,
      fileUrl: connectionForm.fileUrl,
      enabled: connectionForm.enabled,
      autoSync: connectionForm.autoSync,
      syncInterval: connectionForm.autoSync ? connectionForm.syncInterval : undefined,
    };

    if (editingConnection.value) {
      await axios.put(
        `${API_BASE_URL}/design-sync/connections/${editingConnection.value.id}`,
        connectionData,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/design-sync/connections`,
        connectionData,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    }

    closeModal();
    await loadConnections();
  } catch (error) {
    console.error('Error saving connection:', error);
    alert('Failed to save connection. Please try again.');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingConnection.value = null;
  Object.assign(connectionForm, {
    name: '',
    tool: 'figma',
    syncDirection: 'bidirectional',
    apiKey: '',
    fileId: '',
    fileUrl: '',
    enabled: true,
    autoSync: false,
    syncInterval: 60,
  });
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  loadConnections();
  
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

