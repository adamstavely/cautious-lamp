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
                  Register Application
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Register your application with the design system and enable scanners and capabilities.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="appRegGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Application representation -->
                    <rect x="40" y="50" width="120" height="100" rx="4" fill="url(#appRegGradient)" opacity="0.3" stroke="url(#appRegGradient)" stroke-width="2"/>
                    <!-- Checkmarks for capabilities -->
                    <circle cx="60" cy="80" r="8" fill="url(#appRegGradient)" opacity="0.6"/>
                    <circle cx="60" cy="110" r="8" fill="url(#appRegGradient)" opacity="0.6"/>
                    <circle cx="60" cy="140" r="8" fill="url(#appRegGradient)" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Form -->
        <div class="max-w-4xl mx-auto">
          <form @submit.prevent="registerApplication" class="space-y-6">
            <!-- Basic Information -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">info</span>
                Basic Information
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Application Name *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="My Application"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Team ID
                  </label>
                  <input
                    v-model="form.teamId"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="team-123"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Description
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="Brief description of the application"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Repository URL
                  </label>
                  <input
                    v-model="form.repository"
                    type="url"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="https://github.com/company/app"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Application URL
                  </label>
                  <input
                    v-model="form.applicationUrl"
                    type="url"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="https://app.example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Version
                  </label>
                  <input
                    v-model="form.version"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            <!-- Capabilities -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">settings</span>
                Capabilities
              </h2>

              <!-- Governance -->
              <div class="mb-6 p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      v-model="form.capabilities.governance.enabled"
                      class="w-5 h-5 accent-indigo-600"
                    />
                    <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Design System Governance
                    </label>
                  </div>
                </div>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Enable compliance scanning and design system rules enforcement
                </p>
                <div v-if="form.capabilities.governance.enabled" class="space-y-3 mt-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Scan Schedule
                    </label>
                    <Dropdown
                      :model-value="form.capabilities.governance.scanSchedule"
                      @update:model-value="form.capabilities.governance.scanSchedule = $event"
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
              </div>

              <!-- Visual Regression -->
              <div class="mb-6 p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      v-model="form.capabilities.visualRegression.enabled"
                      class="w-5 h-5 accent-indigo-600"
                    />
                    <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Visual Regression Testing
                    </label>
                  </div>
                </div>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Enable Argos visual regression testing
                </p>
                <div v-if="form.capabilities.visualRegression.enabled" class="space-y-3 mt-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Argos Project ID *
                    </label>
                    <input
                      v-model="form.capabilities.visualRegression.argosProjectId"
                      type="text"
                      :required="form.capabilities.visualRegression.enabled"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="argos-project-123"
                    />
                    <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      Branch: <strong>develop</strong> (default) | Argos URL: <strong>{{ defaultArgosUrl }}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Session Replay -->
              <div class="mb-6 p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      v-model="form.capabilities.sessionReplay.enabled"
                      class="w-5 h-5 accent-indigo-600"
                    />
                    <label class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Session Replay
                    </label>
                  </div>
                </div>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Enable OpenReplay session replay and heatmaps
                </p>
                <div v-if="form.capabilities.sessionReplay.enabled" class="space-y-3 mt-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      OpenReplay Project Key *
                    </label>
                    <input
                      v-model="form.capabilities.sessionReplay.openreplayProjectKey"
                      type="text"
                      :required="form.capabilities.sessionReplay.enabled"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="project-key-123"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      OpenReplay Base URL
                    </label>
                    <input
                      v-model="form.capabilities.sessionReplay.openreplayBaseUrl"
                      type="url"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="https://api.openreplay.com"
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
                          v-model="form.capabilities.sessionReplay.privacySettings.maskAllInputs"
                          class="accent-indigo-600"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Mask All Inputs</span>
                      </label>
                      <label class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          v-model="form.capabilities.sessionReplay.privacySettings.maskAllText"
                          class="accent-indigo-600"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Mask All Text</span>
                      </label>
                      <label class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          v-model="form.capabilities.sessionReplay.privacySettings.respectDoNotTrack"
                          class="accent-indigo-600"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Respect Do Not Track</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metadata (Optional) -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">category</span>
                Metadata (Optional)
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Environment
                  </label>
                  <Dropdown
                    :model-value="form.metadata.environment"
                    @update:model-value="form.metadata.environment = $event"
                    :options="[
                      { value: undefined, label: 'Select...' },
                      { value: 'development', label: 'Development' },
                      { value: 'staging', label: 'Staging' },
                      { value: 'production', label: 'Production' }
                    ]"
                    :is-dark-mode="isDarkMode"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Framework
                  </label>
                  <input
                    v-model="form.metadata.framework"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="Vue.js, React, etc."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Language
                  </label>
                  <input
                    v-model="form.metadata.language"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="TypeScript, JavaScript, etc."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Tags (comma-separated)
                  </label>
                  <input
                    v-model="form.metadata.tagsInput"
                    type="text"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="public, marketing, internal"
                    @input="form.metadata.tags = form.metadata.tagsInput.split(',').map(t => t.trim()).filter(t => t)"
                  />
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end gap-4">
              <button
                type="button"
                @click="$router.push('/admin/applications')"
                class="px-6 py-3 rounded-lg font-semibold transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                :class="isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'"
              >
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
                <span v-else>Register Application</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const router = useRouter();
const drawerOpen = ref(false);
const isDarkMode = ref(false);
const isSubmitting = ref(false);

const defaultArgosUrl = 'https://app.argos-ci.com';

const form = ref({
  name: '',
  description: '',
  repository: '',
  version: '',
  applicationUrl: '',
  teamId: '',
  capabilities: {
    governance: {
      enabled: false,
      rules: [],
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
  },
  metadata: {
    environment: undefined,
    framework: '',
    language: '',
    tags: [],
    tagsInput: ''
  }
});

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const registerApplication = async () => {
  isSubmitting.value = true;
  try {
    // Clean up form data
    const payload = {
      name: form.value.name,
      description: form.value.description || undefined,
      repository: form.value.repository || undefined,
      version: form.value.version || undefined,
      applicationUrl: form.value.applicationUrl || undefined,
      teamId: form.value.teamId || undefined,
      capabilities: {
        governance: form.value.capabilities.governance.enabled ? {
          enabled: true,
          rules: form.value.capabilities.governance.rules,
          scanSchedule: form.value.capabilities.governance.scanSchedule
        } : { enabled: false },
        visualRegression: form.value.capabilities.visualRegression.enabled ? {
          enabled: true,
          argosProjectId: form.value.capabilities.visualRegression.argosProjectId,
          argosBaseUrl: defaultArgosUrl,
          argosBranch: 'develop'
        } : { enabled: false },
        sessionReplay: form.value.capabilities.sessionReplay.enabled ? {
          enabled: true,
          openreplayProjectKey: form.value.capabilities.sessionReplay.openreplayProjectKey,
          openreplayBaseUrl: form.value.capabilities.sessionReplay.openreplayBaseUrl || undefined,
          privacySettings: form.value.capabilities.sessionReplay.privacySettings
        } : { enabled: false }
      },
      metadata: {
        environment: form.value.metadata.environment || undefined,
        framework: form.value.metadata.framework || undefined,
        language: form.value.metadata.language || undefined,
        tags: form.value.metadata.tags.length > 0 ? form.value.metadata.tags : undefined
      }
    };

    const response = await axios.post(`${API_BASE_URL}/applications/register`, payload, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    window.showToast?.('Application registered successfully', 'success');
    router.push('/admin/applications');
  } catch (error) {
    console.error('Failed to register application:', error);
    const errorMsg = error.response?.data?.message || error.message || 'Failed to register application';
    window.showToast?.(errorMsg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
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
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

