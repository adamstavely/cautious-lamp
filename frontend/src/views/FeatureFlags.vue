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
                  Feature Flags
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="flagsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Flag pole -->
                    <line x1="50" y1="30" x2="50" y2="170" stroke="url(#flagsGradient)" stroke-width="4" opacity="0.6"/>
                    <!-- Flag 1 (enabled) -->
                    <rect x="50" y="40" width="60" height="40" fill="url(#flagsGradient)" opacity="0.8"/>
                    <path d="M 50 40 L 110 40 L 110 80 L 50 80 Z" fill="url(#flagsGradient)" opacity="0.4"/>
                    <!-- Flag 2 (enabled) -->
                    <rect x="50" y="90" width="60" height="40" fill="url(#flagsGradient)" opacity="0.8"/>
                    <path d="M 50 90 L 110 90 L 110 130 L 50 130 Z" fill="url(#flagsGradient)" opacity="0.4"/>
                    <!-- Flag 3 (disabled) -->
                    <rect x="50" y="140" width="60" height="40" fill="url(#flagsGradient)" opacity="0.3"/>
                    <line x1="50" y1="160" x2="110" y2="160" stroke="url(#flagsGradient)" stroke-width="2" opacity="0.5"/>
                    <!-- Toggle switches -->
                    <circle cx="130" cy="60" r="8" fill="url(#flagsGradient)" opacity="0.6"/>
                    <circle cx="130" cy="110" r="8" fill="url(#flagsGradient)" opacity="0.6"/>
                    <circle cx="130" cy="160" r="8" fill="white" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Flags Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Feature Flags
              </h2>
              <button
                @click="showCreateModal = true"
                class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                :class="isDarkMode 
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'"
              >
                <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                Create Flag
              </button>
            </div>

            <div v-if="loading" class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-400">Loading feature flags...</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="flag in flags"
                :key="flag.id"
                class="border rounded-lg p-4 transition-all"
                :class="isDarkMode 
                  ? 'border-gray-700 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-200 bg-gray-50 hover:border-indigo-500'"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ flag.name }}
                      </h3>
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="flag.enabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'"
                      >
                        {{ flag.enabled ? 'Enabled' : 'Disabled' }}
                      </span>
                      <span class="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {{ flag.key }}
                      </span>
                    </div>
                    <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ flag.description || 'No description provided' }}
                    </p>
                    
                    <!-- Metadata -->
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span 
                        v-if="flag.metadata?.category"
                        class="px-2 py-1 rounded text-xs"
                        :class="isDarkMode 
                          ? 'bg-slate-700 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'"
                      >
                        {{ flag.metadata.category }}
                      </span>
                      <span
                        v-for="tag in flag.metadata?.tags"
                        :key="tag"
                        class="px-2 py-1 rounded text-xs"
                        :class="isDarkMode 
                          ? 'bg-slate-700 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'"
                      >
                        {{ tag }}
                      </span>
                    </div>

                    <!-- Targeting Info -->
                    <div v-if="flag.targeting" class="text-xs space-y-1 mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <div v-if="flag.targeting.users && flag.targeting.users.length > 0">
                        <strong>Target Users:</strong> {{ flag.targeting.users.join(', ') }}
                      </div>
                      <div v-if="flag.targeting.groups && flag.targeting.groups.length > 0">
                        <strong>Target Groups:</strong> {{ flag.targeting.groups.join(', ') }}
                      </div>
                      <div v-if="flag.targeting.percentage !== undefined">
                        <strong>Rollout:</strong> {{ flag.targeting.percentage }}% of users
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 flex gap-2">
                    <button
                      @click="toggleFlag(flag.id)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? flag.enabled
                          ? 'text-green-400 hover:text-green-300 hover:bg-slate-700'
                          : 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : flag.enabled
                          ? 'text-green-600 hover:text-green-700 hover:bg-gray-100'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
                      :title="flag.enabled ? 'Disable' : 'Enable'"
                    >
                      <span class="material-symbols-outlined">{{ flag.enabled ? 'toggle_on' : 'toggle_off' }}</span>
                    </button>
                    <button
                      @click="editFlag(flag)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
                      title="Edit Flag"
                    >
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      @click="deleteFlag(flag.id)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-red-400 hover:text-red-300 hover:bg-slate-700' 
                        : 'text-red-600 hover:text-red-700 hover:bg-gray-100'"
                      title="Delete Flag"
                    >
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="flags.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
                No feature flags found. Create your first flag to get started.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="sticky top-0 p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-white'"
        >
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            {{ showEditModal ? 'Edit Feature Flag' : 'Create Feature Flag' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveFlag" class="p-6 space-y-4">
          <!-- Help Section -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">info</span>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">How Feature Flags Work</h4>
                <p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
                  Feature flags control access to pages and capabilities. Select a page/route below, and we'll automatically generate the flag key. 
                  When disabled, users will be redirected away from that page.
                </p>
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Example:</strong> Selecting "/components/testing" creates flag "component-testing" which controls access to the Component Testing page.
                </p>
              </div>
            </div>
          </div>

          <!-- Route/Page Selector -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Page / Route <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedRoute"
              @change="updateFlagFromRoute"
              :disabled="showEditModal"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="">-- Select a page or route --</option>
              <optgroup label="Components">
                <option value="/components">Components Overview</option>
                <option value="/components/status">Component Status</option>
                <option value="/components/loupe">Loupe Tool</option>
                <option value="/components/snippets">Code Snippets</option>
                <option value="/components/testing">Component Testing</option>
                <option value="/components/documentation">Documentation Generator</option>
                <option value="/components/handoff">Design-Dev Handoff</option>
                <option value="/components/composition">Component Composition</option>
                <option value="/components/dependencies">Dependency Graph</option>
              </optgroup>
              <optgroup label="Tokens">
                <option value="/tokens">Tokens Overview</option>
                <option value="/tokens/studio">Token Studio</option>
                <option value="/tokens/playground">Token Playground</option>
                <option value="/tokens/library">Style Library</option>
              </optgroup>
              <optgroup label="Review">
                <option value="/review">Review System</option>
                <option value="/review/my-requests">Review Kanban</option>
                <option value="/review/admin">Review Admin</option>
              </optgroup>
              <optgroup label="Admin">
                <option value="/admin/health">System Health</option>
                <option value="/admin/governance">Governance</option>
                <option value="/admin/audit">Audit Logs</option>
                <option value="/admin/roles">Role Management</option>
                <option value="/admin/feature-flags">Feature Flags</option>
              </optgroup>
              <optgroup label="Tools">
                <option value="/tools/gradient-generator">Gradient Generator</option>
                <option value="/tools/lorem-ipsum">Lorem Ipsum Generator</option>
                <option value="/tools/seo-tagging">SEO Tagging</option>
                <option value="/tools/color-scale">Color Scale Generator</option>
                <option value="/tools/color-converter">Color Converter</option>
                <option value="/tools/color-contrast">Color Contrast Checker</option>
                <option value="/tools/nasa-tlx">NASA-TLX</option>
                <option value="/tools/sus">System Usability Scale</option>
                <option value="/tools/png-to-ico">PNG to ICO Converter</option>
                <option value="/tools/heuristic-evaluation">Heuristic Evaluation</option>
                <option value="/palette-builder">Palette Builder</option>
                <option value="/theme-builder">Theme Builder</option>
                <option value="/code-quality">Code Quality Checks</option>
                <option value="/security">Vulnerability Scanner</option>
                <option value="/tools/migration">Migration Assistant</option>
              </optgroup>
              <optgroup label="Fonts">
                <option value="/fonts">Fonts Overview</option>
                <option value="/fonts/library">Font Library</option>
                <option value="/fonts/scale">Font Scale</option>
                <option value="/fonts/stack">Font Stack</option>
                <option value="/fonts/subsetting">Font Subsetting</option>
              </optgroup>
              <optgroup label="Other">
                <option value="/patterns">Patterns System</option>
                <option value="/design-assets/icons">Icon Library</option>
                <option value="/getting-started">Getting Started</option>
                <option value="/research">Research Repository</option>
                <option value="/research/user-personas">User Persona Generator</option>
                <option value="/guidelines">Guidelines Documentation</option>
                <option value="/ai-suggestions">AI Suggestions</option>
                <option value="/api">Design System API</option>
                <option value="/feedback">Feedback & Roadmap</option>
                <option value="/notifications">Change Notifications</option>
                <option value="/brands">Multi-Brand Support</option>
              </optgroup>
              <option value="custom">-- Custom (Manual Entry) --</option>
            </select>
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Select the page or route this flag will control. The flag key will be auto-generated.
            </p>
          </div>

          <!-- Flag Key (auto-generated or manual) -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Flag Key <span class="text-red-500">*</span>
            </label>
            <input
              v-model="flagForm.key"
              type="text"
              required
              :disabled="showEditModal || (selectedRoute && selectedRoute !== 'custom')"
              placeholder="feature-key-name"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              <span v-if="selectedRoute && selectedRoute !== 'custom'">
                Auto-generated from route. This will be used to control access to the selected page.
              </span>
              <span v-else>
                Unique identifier for the feature flag (cannot be changed after creation). Use lowercase with hyphens (e.g., "my-new-feature").
                <span class="block mt-1 text-orange-600 dark:text-orange-400">
                  <strong>Note:</strong> For custom flags to work with route protection, you'll need to add the route-to-flag mapping in the router guard configuration.
                </span>
              </span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="flagForm.name"
              type="text"
              required
              placeholder="Feature Name"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description
            </label>
            <textarea
              v-model="flagForm.description"
              rows="3"
              placeholder="Describe what this feature flag controls"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            ></textarea>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="flagForm.enabled"
                type="checkbox"
                class="rounded"
                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
              />
              <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Enabled
              </span>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="flagForm.metadata.category"
              required
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="">-- Select a category --</option>
              <option value="Getting Started">Getting Started</option>
              <option value="Guidelines">Guidelines</option>
              <option value="Components">Components</option>
              <option value="Tokens">Tokens</option>
              <option value="Patterns">Patterns</option>
              <option value="Fonts">Fonts</option>
              <option value="Research Repo">Research Repo</option>
              <option value="Design Assets">Design Assets</option>
              <option value="Review">Review</option>
              <option value="Tools">Tools</option>
              <option value="Admin">Admin</option>
              <option value="AI">AI</option>
              <option value="API">API</option>
              <option value="Feedback">Feedback</option>
              <option value="Notifications">Notifications</option>
              <option value="Branding">Branding</option>
              <option value="Governance">Governance</option>
              <option value="Documentation">Documentation</option>
            </select>
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Select the sidenav section this feature belongs to
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Tags (comma-separated)
            </label>
            <input
              v-model="flagForm.metadata.tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>

          <div class="border-t pt-4" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h3 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Targeting (Optional)
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Target Users (comma-separated user IDs)
                </label>
                <input
                  v-model="flagForm.targeting.users"
                  type="text"
                  placeholder="user1@example.com, user2@example.com"
                  class="w-full px-3 py-2 border rounded-lg"
                  :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Target Groups (comma-separated group names)
                </label>
                <input
                  v-model="flagForm.targeting.groups"
                  type="text"
                  placeholder="beta-testers, admins"
                  class="w-full px-3 py-2 border rounded-lg"
                  :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Percentage Rollout (0-100)
                </label>
                <input
                  v-model.number="flagForm.targeting.percentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  class="w-full px-3 py-2 border rounded-lg"
                  :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                  Enable for a percentage of users (0-100). Leave empty to enable for all users when flag is enabled.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t"
            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
          >
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
            >
              {{ showEditModal ? 'Save Changes' : 'Create Flag' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let darkModeObserver = null;
let darkModeInterval = null;

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const flags = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingFlag = ref(null);
const selectedRoute = ref('');

// Route to flag key mapping (reverse of featureFlagGuards)
const routeToFlagKey = {
  '/components': 'component-status',
  '/components/status': 'component-status',
  '/components/loupe': 'component-loupe',
  '/components/snippets': 'component-snippets',
  '/components/testing': 'component-testing',
  '/components/documentation': 'component-documentation',
  '/components/handoff': 'component-handoff',
  '/components/composition': 'component-composition',
  '/components/dependencies': 'component-dependencies',
  '/tokens': 'token-studio',
  '/tokens/studio': 'token-studio',
  '/tokens/playground': 'token-playground',
  '/tokens/library': 'token-library',
  '/review': 'review-system',
  '/review/my-requests': 'review-kanban',
  '/review/admin': 'review-admin',
  '/admin/health': 'admin-system-health',
  '/admin/governance': 'admin-governance',
  '/admin/audit': 'admin-audit',
  '/admin/roles': 'admin-rbac',
  '/admin/feature-flags': 'admin-feature-flags',
  '/tools/gradient-generator': 'gradient-generator',
  '/tools/lorem-ipsum': 'lorem-ipsum',
  '/tools/seo-tagging': 'seo-tagging',
  '/tools/color-scale': 'color-scale',
  '/tools/color-converter': 'color-converter',
  '/tools/color-contrast': 'color-contrast',
  '/tools/nasa-tlx': 'nasa-tlx',
  '/tools/sus': 'sus',
  '/tools/png-to-ico': 'png-to-ico',
  '/tools/heuristic-evaluation': 'heuristic-evaluation',
  '/palette-builder': 'palette-builder',
  '/theme-builder': 'theme-builder',
  '/code-quality': 'code-quality',
  '/security': 'vulnerability-scanner',
  '/tools/migration': 'migration-assistant',
  '/fonts': 'font-library',
  '/fonts/library': 'font-library',
  '/fonts/scale': 'font-scale',
  '/fonts/stack': 'font-stack',
  '/fonts/subsetting': 'font-subsetting',
  '/patterns': 'patterns-system',
  '/design-assets/icons': 'icon-library',
  '/getting-started': 'getting-started-section',
  '/research': 'research-repo',
  '/research/user-personas': 'user-persona-generator',
  '/guidelines': 'guidelines-vitepress',
  '/ai-suggestions': 'ai-suggestions',
  '/api': 'design-system-api',
  '/feedback': 'feedback-roadmap',
  '/notifications': 'change-notifications',
  '/brands': 'multi-brand-support',
};

// Route to name mapping
const routeToName = {
  '/components': 'Components Overview',
  '/components/status': 'Component Status',
  '/components/loupe': 'Loupe Tool',
  '/components/snippets': 'Code Snippets',
  '/components/testing': 'Component Testing',
  '/components/documentation': 'Documentation Generator',
  '/components/handoff': 'Design-Dev Handoff',
  '/components/composition': 'Component Composition',
  '/components/dependencies': 'Dependency Graph',
  '/tokens': 'Tokens Overview',
  '/tokens/studio': 'Token Studio',
  '/tokens/playground': 'Token Playground',
  '/tokens/library': 'Style Library',
  '/review': 'Review System',
  '/review/my-requests': 'Review Kanban',
  '/review/admin': 'Review Admin',
  '/admin/health': 'System Health',
  '/admin/governance': 'Governance',
  '/admin/audit': 'Audit Logs',
  '/admin/roles': 'Role Management',
  '/admin/feature-flags': 'Feature Flags',
  '/tools/gradient-generator': 'Gradient Generator',
  '/tools/lorem-ipsum': 'Lorem Ipsum Generator',
  '/tools/seo-tagging': 'SEO Tagging',
  '/tools/color-scale': 'Color Scale Generator',
  '/tools/color-converter': 'Color Converter',
  '/tools/color-contrast': 'Color Contrast Checker',
  '/tools/nasa-tlx': 'NASA-TLX',
  '/tools/sus': 'System Usability Scale',
  '/tools/png-to-ico': 'PNG to ICO Converter',
  '/tools/heuristic-evaluation': 'Heuristic Evaluation',
  '/palette-builder': 'Palette Builder',
  '/theme-builder': 'Theme Builder',
  '/code-quality': 'Code Quality Checks',
  '/security': 'Vulnerability Scanner',
  '/tools/migration': 'Migration Assistant',
  '/fonts': 'Fonts Overview',
  '/fonts/library': 'Font Library',
  '/fonts/scale': 'Font Scale',
  '/fonts/stack': 'Font Stack',
  '/fonts/subsetting': 'Font Subsetting',
  '/patterns': 'Patterns System',
  '/design-assets/icons': 'Icon Library',
  '/getting-started': 'Getting Started',
  '/research': 'Research Repository',
  '/research/user-personas': 'User Persona Generator',
  '/guidelines': 'Guidelines Documentation',
  '/ai-suggestions': 'AI Suggestions',
  '/api': 'Design System API',
  '/feedback': 'Feedback & Roadmap',
  '/notifications': 'Change Notifications',
  '/brands': 'Multi-Brand Support',
};

// Helper to convert route to flag key
const routeToFlagKeyHelper = (route) => {
  if (routeToFlagKey[route]) {
    return routeToFlagKey[route];
  }
  // Auto-generate from route path
  return route
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase();
};

// Helper to get category from route (matching sidenav sections)
const getCategoryFromRoute = (route) => {
  if (route.startsWith('/components')) return 'Components';
  if (route.startsWith('/tokens')) return 'Tokens';
  if (route.startsWith('/review')) return 'Review';
  if (route.startsWith('/admin')) return 'Admin';
  if (route.startsWith('/tools') || route === '/palette-builder' || route === '/theme-builder' || route === '/code-quality' || route === '/security') return 'Tools';
  if (route.startsWith('/fonts')) return 'Fonts';
  if (route.startsWith('/patterns')) return 'Patterns';
  if (route.startsWith('/design-assets')) return 'Design Assets';
  if (route.startsWith('/getting-started')) return 'Getting Started';
  if (route.startsWith('/research')) return 'Research Repo';
  if (route.startsWith('/guidelines')) return 'Guidelines';
  if (route.startsWith('/ai')) return 'AI';
  if (route === '/api') return 'API';
  if (route === '/feedback') return 'Feedback';
  if (route === '/notifications') return 'Notifications';
  if (route === '/brands') return 'Branding';
  return 'Tools'; // Default to Tools
};

const updateFlagFromRoute = () => {
  if (!selectedRoute.value || selectedRoute.value === 'custom') {
    return;
  }

  const route = selectedRoute.value;
  const flagKey = routeToFlagKeyHelper(route);
  const name = routeToName[route] || route.replace(/^\//, '').replace(/\//g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const category = getCategoryFromRoute(route);

  flagForm.value.key = flagKey;
  flagForm.value.name = name;
  flagForm.value.metadata.category = category;
  
  // Auto-generate description if empty
  if (!flagForm.value.description) {
    flagForm.value.description = `Controls access to ${name}`;
  }
};

const flagForm = ref({
  key: '',
  name: '',
  description: '',
  enabled: false,
  targeting: {
    users: '',
    groups: '',
    percentage: undefined,
  },
  metadata: {
    category: '',
    tags: '',
  },
});

const loadFlags = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/feature-flags`);
    flags.value = response.data;
  } catch (error) {
    console.error('Failed to load feature flags:', error);
    alert('Failed to load feature flags. Please try again.');
  } finally {
    loading.value = false;
  }
};

const toggleFlag = async (id) => {
  try {
    await axios.put(`${API_BASE_URL}/api/v1/feature-flags/${id}/toggle`);
    await loadFlags();
  } catch (error) {
    console.error('Failed to toggle feature flag:', error);
    alert('Failed to toggle feature flag. Please try again.');
  }
};

const editFlag = (flag) => {
  editingFlag.value = flag;
  selectedRoute.value = ''; // Clear route selection for edit mode
  flagForm.value = {
    key: flag.key,
    name: flag.name,
    description: flag.description || '',
    enabled: flag.enabled,
    targeting: {
      users: flag.targeting?.users?.join(', ') || '',
      groups: flag.targeting?.groups?.join(', ') || '',
      percentage: flag.targeting?.percentage,
    },
    metadata: {
      category: flag.metadata?.category || '',
      tags: flag.metadata?.tags?.join(', ') || '',
    },
  };
  showEditModal.value = true;
};

const deleteFlag = async (id) => {
  if (!confirm('Are you sure you want to delete this feature flag?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/v1/feature-flags/${id}`);
    await loadFlags();
  } catch (error) {
    console.error('Failed to delete feature flag:', error);
    alert('Failed to delete feature flag. Please try again.');
  }
};

const saveFlag = async () => {
  try {
    const payload = {
      key: flagForm.value.key,
      name: flagForm.value.name,
      description: flagForm.value.description || undefined,
      enabled: flagForm.value.enabled,
      targeting: {
        users: flagForm.value.targeting.users ? flagForm.value.targeting.users.split(',').map(u => u.trim()).filter(Boolean) : undefined,
        groups: flagForm.value.targeting.groups ? flagForm.value.targeting.groups.split(',').map(g => g.trim()).filter(Boolean) : undefined,
        percentage: flagForm.value.targeting.percentage !== undefined && flagForm.value.targeting.percentage !== '' ? Number(flagForm.value.targeting.percentage) : undefined,
      },
      metadata: {
        category: flagForm.value.metadata.category || undefined,
        tags: flagForm.value.metadata.tags ? flagForm.value.metadata.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      },
    };

    // Remove undefined values
    Object.keys(payload.targeting).forEach(key => {
      if (payload.targeting[key] === undefined) delete payload.targeting[key];
    });
    if (Object.keys(payload.targeting).length === 0) delete payload.targeting;

    Object.keys(payload.metadata).forEach(key => {
      if (payload.metadata[key] === undefined) delete payload.metadata[key];
    });
    if (Object.keys(payload.metadata).length === 0) delete payload.metadata;

    if (showEditModal.value && editingFlag.value) {
      await axios.put(`${API_BASE_URL}/api/v1/feature-flags/${editingFlag.value.id}`, payload);
    } else {
      await axios.post(`${API_BASE_URL}/api/v1/feature-flags`, payload);
    }

    await loadFlags();
    closeModal();
  } catch (error) {
    console.error('Failed to save feature flag:', error);
    alert(error.response?.data?.error || 'Failed to save feature flag. Please try again.');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingFlag.value = null;
  selectedRoute.value = '';
  flagForm.value = {
    key: '',
    name: '',
    description: '',
    enabled: false,
    targeting: {
      users: '',
      groups: '',
      percentage: undefined,
    },
    metadata: {
      category: '',
      tags: '',
    },
  };
};

onMounted(() => {
  loadFlags();
  
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

