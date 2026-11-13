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
          <form class="space-y-6" @submit.prevent="registerApplication">
            <InlineNotice :notice="notice" @dismiss="clearNotice" />

            <div v-if="!loadingWorkspaces && !canRegister" class="rounded-lg border p-6 text-sm" :class="[c.card, c.muted]">
              You can register applications in workspaces where you are an admin, or anywhere with the admin:governance permission.
              You don't have either yet; ask a workspace owner to make you an admin.
            </div>

            <!-- Basic Information -->
            <div class="rounded-lg shadow-sm border p-6" :class="c.card">
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="c.heading">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">info</span>
                Basic Information
              </h2>

              <div class="mb-4">
                <div class="block text-sm font-medium mb-2" :class="c.label">Workspace{{ isGovernance ? '' : ' *' }}</div>
                <p v-if="loadingWorkspaces" class="text-sm" :class="c.muted">Loading workspaces…</p>
                <p v-else-if="workspacesError" class="text-sm" :class="c.muted">{{ workspacesError }}</p>
                <Dropdown v-else v-model="workspaceId" :options="workspaceOptions" :is-dark-mode="isDarkMode" />
                <p class="text-xs mt-1" :class="c.faint">Admins of the workspace can edit the application later.</p>
              </div>

              <ApplicationDetailsForm v-model="details" :is-dark-mode="isDarkMode" show-design-system-version />
            </div>

            <!-- Capabilities -->
            <div class="rounded-lg shadow-sm border p-6" :class="c.card">
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="c.heading">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">tune</span>
                Capabilities
              </h2>
              <ApplicationCapabilitiesForm v-model="capabilities" :is-dark-mode="isDarkMode" />
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end gap-4">
              <button type="button" class="px-6 py-3 rounded-lg font-semibold transition-colors" :class="c.secondary" @click="router.push('/admin/applications')">
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!canSubmit"
                class="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                :class="canSubmit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'"
              >
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import InlineNotice from '../components/InlineNotice.vue';
import ApplicationCapabilitiesForm from '../components/applications/ApplicationCapabilitiesForm.vue';
import ApplicationDetailsForm from '../components/applications/ApplicationDetailsForm.vue';
import { capabilitiesForm, capabilitiesPayload } from '../components/applications/capabilities.js';
import { detailsForm, registrationFields } from '../components/applications/details.js';
import { atLeast, ui } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useDrawer } from '../composables/useDrawer.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Registers an application (docs/WORKSPACES.md). Needs admin:governance, or
 * the admin role in the chosen workspace. Enabling visual regression or
 * session replay creates those projects; if that fails, nothing is registered
 * and the error is shown.
 */
const router = useRouter();
const isDarkMode = useDarkMode();
const c = computed(() => ui(isDarkMode.value));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const isGovernance = computed(() => hasPermission('admin:governance'));
const workspaces = ref([]);
const loadingWorkspaces = ref(true);
const workspacesError = ref(null);
const workspaceId = ref('');
const details = ref(detailsForm());
const capabilities = ref(capabilitiesForm());
const isSubmitting = ref(false);

/** Workspaces the user can register into: those they administer */
const adminWorkspaces = computed(() => workspaces.value.filter((ws) => atLeast(ws.effectiveRole, 'admin')));
const workspaceOptions = computed(() => [
  ...(isGovernance.value ? [{ value: '', label: 'No workspace' }] : []),
  ...adminWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name })),
]);
const canRegister = computed(() => isGovernance.value || adminWorkspaces.value.length > 0);
const canSubmit = computed(() => !isSubmitting.value && canRegister.value && !!details.value.name.trim() && (isGovernance.value || !!workspaceId.value));

const loadWorkspaces = async () => {
  loadingWorkspaces.value = true;
  workspacesError.value = null;
  try {
    workspaces.value = (await apiClient.get('/api/v1/workspaces')).data ?? [];
    if (!isGovernance.value && adminWorkspaces.value.length === 1) workspaceId.value = adminWorkspaces.value[0].id;
  } catch (error) {
    workspaces.value = [];
    workspacesError.value = apiErrorMessage(error, 'Workspaces could not be loaded.');
  } finally {
    loadingWorkspaces.value = false;
  }
};

const registerApplication = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  clearNotice();
  try {
    const payload = {
      ...registrationFields(details.value),
      ...(workspaceId.value ? { workspaceId: workspaceId.value } : {}),
      capabilities: capabilitiesPayload(capabilities.value),
    };
    await apiClient.post('/api/v1/applications/register', payload);
    router.push('/admin/applications');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application could not be registered.'), 'error');
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
  loadWorkspaces();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
