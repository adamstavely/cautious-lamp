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
        <div class="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <button
              v-if="canRegister"
              type="button"
              class="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
              @click="router.push('/admin/applications/register')"
            >
              <span class="material-symbols-outlined text-lg" aria-hidden="true">add</span>
              Register New Application
            </button>

            <Dropdown
              v-model="filterCapability"
              :options="[
                { value: '', label: 'All Applications' },
                { value: 'governance', label: 'With Governance' },
                { value: 'visualRegression', label: 'With Visual Regression' },
                { value: 'sessionReplay', label: 'With Session Replay' },
              ]"
              :is-dark-mode="isDarkMode"
              label="Filter by capability"
            />

            <!-- Workspace admins without admin:governance can only change their workspaces' applications -->
            <Dropdown
              v-if="!isGovernance"
              v-model="scope"
              :options="[
                { value: 'mine', label: 'Workspaces I administer' },
                { value: 'all', label: 'All applications' },
              ]"
              :is-dark-mode="isDarkMode"
              label="Show applications from"
            />
          </div>
        </div>

        <div class="max-w-7xl mx-auto mb-6">
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
        </div>

        <!-- Applications Table -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-lg shadow-sm border overflow-x-auto" :class="c.card">
            <div v-if="loading" class="p-8 text-center" :class="c.muted">Loading applications...</div>

            <div v-else-if="loadError" class="p-8 text-center" :class="c.muted">
              {{ loadError }}
              <button type="button" class="ml-2 underline text-indigo-600" @click="loadAll">Try again</button>
            </div>

            <div v-else-if="filteredApplications.length === 0" class="p-8 text-center" :class="c.muted">
              {{ scope === 'mine' && !isGovernance ? 'No applications in the workspaces you administer.' : 'No applications found.' }}
              <router-link v-if="canRegister" to="/admin/applications/register" class="text-indigo-600 hover:text-indigo-700 underline">Register your first application</router-link>
            </div>

            <table v-else class="w-full">
              <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <tr>
                  <th v-for="heading in ['Application', 'Workspace', 'Design System Version', 'Capabilities', 'Metadata', 'Registered']" :key="heading" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="c.text">
                    {{ heading }}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" :class="c.text">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <tr v-for="app in filteredApplications" :key="app.id" class="transition-colors" :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium" :class="c.heading">{{ app.name }}</div>
                    <div v-if="app.description" class="text-sm" :class="c.muted">{{ app.description }}</div>
                    <div v-if="safeHttpUrl(app.repository)" class="text-xs mt-1">
                      <a :href="safeHttpUrl(app.repository)" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-700 break-all">{{ app.repository }}</a>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span v-if="app.workspaceId" class="px-2 py-1 text-xs rounded font-medium" :class="isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'">
                      {{ workspaceName(app.workspaceId) }}
                    </span>
                    <span v-else class="px-2 py-1 text-xs rounded font-medium" :class="isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'">No workspace</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span v-if="app.designSystemVersion" class="text-sm font-medium" :class="versionClass(app.designSystemVersion)">v{{ app.designSystemVersion }}</span>
                      <span v-else class="text-sm" :class="c.faint">Not set</span>
                      <span v-if="isBehind(app.designSystemVersion)" class="material-symbols-outlined text-sm text-yellow-500" title="Needs upgrade" aria-label="Needs upgrade">warning</span>
                      <span v-else-if="app.designSystemVersion" class="material-symbols-outlined text-sm text-green-500" title="Up to date" aria-label="Up to date">check_circle</span>
                    </div>
                    <button
                      v-if="currentVersion && isBehind(app.designSystemVersion) && canWrite(app)"
                      type="button"
                      class="text-xs mt-1 text-indigo-600 hover:text-indigo-700"
                      @click="confirmVersionUpdate(app)"
                    >
                      Update to v{{ currentVersion }}
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      <span v-if="app.capabilities?.governance?.enabled" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" :class="isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'">Governance</span>
                      <span v-if="app.capabilities?.visualRegression?.enabled" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" :class="isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'">Visual Regression</span>
                      <span v-if="app.capabilities?.sessionReplay?.enabled" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" :class="isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'">Session Replay</span>
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
                    <div class="text-sm space-y-1" :class="c.text">
                      <div v-if="app.metadata?.environment"><span class="font-medium">Env:</span> {{ app.metadata.environment }}</div>
                      <div v-if="app.metadata?.framework"><span class="font-medium">Framework:</span> {{ app.metadata.framework }}</div>
                      <div v-if="app.metadata?.tags?.length" class="flex flex-wrap gap-1 mt-1">
                        <span v-for="tag in app.metadata.tags" :key="tag" class="inline-flex items-center px-2 py-0.5 rounded text-xs" :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'">{{ tag }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="c.text">{{ formatDate(app.registeredAt) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div v-if="canWrite(app)" class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        class="transition-colors"
                        :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'"
                        title="Edit application"
                        :aria-label="`Edit ${app.name}`"
                        @click="openEdit(app)"
                      >
                        <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                      </button>
                      <button
                        type="button"
                        class="transition-colors"
                        :class="isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'"
                        title="Delete application"
                        :aria-label="`Delete ${app.name}`"
                        @click="deleteApplication(app)"
                      >
                        <span class="material-symbols-outlined" aria-hidden="true">delete</span>
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
          <div class="rounded-lg shadow-sm border" :class="c.card">
            <div class="p-6 border-b" :class="c.border">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="c.heading">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">upgrade</span>
                Migration Planning
              </h3>
              <p class="text-sm mt-1" :class="c.muted">Track design system versions and plan upgrades across applications</p>
            </div>
            <div class="p-6">
              <p v-if="migrationError" class="text-sm mb-4" :class="c.muted">{{ migrationError }}</p>
              <!-- Summary Cards -->
              <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="c.muted">Current DS Version</div>
                  <div class="text-2xl font-bold" :class="c.heading">{{ currentVersion ? `v${currentVersion}` : '—' }}</div>
                  <div v-if="versionSource" class="text-xs mt-1" :class="c.faint">From {{ versionSource === 'DESIGN_SYSTEM_VERSION' ? 'the DESIGN_SYSTEM_VERSION setting' : "the backend's package version" }}</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="c.muted">Up to Date</div>
                  <div class="text-2xl font-bold" :class="c.heading">{{ migrationData?.upgradeSummary?.upToDate ?? 0 }}</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="c.muted">Needs Upgrade</div>
                  <div class="text-2xl font-bold" :class="c.heading">{{ migrationData?.upgradeSummary?.needsUpgrade ?? 0 }}</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="c.muted">Major Upgrades</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">{{ migrationData?.upgradeSummary?.needsMajorUpgrade ?? 0 }}</div>
                </div>
              </div>

              <!-- Recommended Actions -->
              <div v-if="migrationData?.recommendedActions?.length" class="mb-6">
                <h4 class="text-sm font-semibold mb-3" :class="c.text">Recommended Actions</h4>
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
                        <span class="font-medium" :class="c.heading">{{ action.applicationName }}</span>
                        <span
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="action.priority === 'high'
                            ? (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                            : (isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700')"
                        >
                          {{ action.priority }}
                        </span>
                      </div>
                      <p class="text-xs" :class="c.muted">{{ action.reason }}</p>
                      <div class="flex items-center gap-2 mt-1 text-xs" :class="c.faint">
                        <span>{{ action.currentVersion === 'unknown' ? 'unknown' : `v${action.currentVersion}` }}</span>
                        <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                        <span>v{{ action.targetVersion }}</span>
                      </div>
                    </div>
                    <button
                      v-if="canWriteId(action.applicationId)"
                      type="button"
                      :disabled="updatingVersion === action.applicationId"
                      class="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ml-4"
                      :class="updatingVersion === action.applicationId ? c.disabled : c.primary"
                      @click="updateApplicationVersion(action.applicationId, action.targetVersion)"
                    >
                      <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': updatingVersion === action.applicationId }" aria-hidden="true">
                        {{ updatingVersion === action.applicationId ? 'refresh' : 'update' }}
                      </span>
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <!-- Applications by Version -->
              <div>
                <h4 class="text-sm font-semibold mb-3" :class="c.text">Applications by Version</h4>
                <p v-if="!migrationData || Object.keys(migrationData.applicationsByVersion).length === 0" class="text-sm" :class="c.muted">No applications yet</p>
                <div class="space-y-4">
                  <div
                    v-for="(apps, version) in migrationData?.applicationsByVersion"
                    :key="version"
                    class="border-b last:border-b-0 pb-4 last:pb-0"
                    :class="c.border"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="font-medium" :class="c.heading">{{ version === 'unknown' ? 'Version not set' : `v${version}` }}</span>
                        <span
                          v-if="version !== 'unknown' && compareVersions(version, currentVersion) === 0"
                          class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'"
                        >
                          Current
                        </span>
                      </div>
                      <span class="text-xs" :class="c.muted">{{ apps.length }} app{{ apps.length !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="app in apps" :key="app.id" class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'">{{ app.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Application Modal -->
    <WorkspaceModal
      :open="!!edit.app"
      :title="edit.app ? `Edit ${edit.app.name}` : ''"
      icon="edit"
      :is-dark-mode="isDarkMode"
      :busy="edit.saving"
      size="lg"
      @close="edit.app = null"
    >
      <form v-if="edit.app" class="space-y-6" @submit.prevent="saveEdit">
        <InlineNotice :notice="edit.error ? { type: 'error', message: edit.error } : null" @dismiss="edit.error = null" />
        <div class="border-b" :class="c.border">
          <div class="flex gap-4" role="tablist">
            <button
              v-for="tab in editTabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="edit.tab === tab.id"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="edit.tab === tab.id
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
              @click="edit.tab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-show="edit.tab === 'details'" class="space-y-4">
          <ApplicationDetailsForm v-model="edit.details" :is-dark-mode="isDarkMode" />
          <div>
            <div class="block text-sm font-medium mb-2" :class="c.label">Workspace</div>
            <Dropdown v-model="edit.workspaceId" :options="moveOptions" :is-dark-mode="isDarkMode" />
            <p class="text-xs mt-1" :class="c.faint">Moving needs the admin role in both workspaces (or admin:governance).</p>
          </div>
        </div>
        <div v-show="edit.tab === 'capabilities'">
          <ApplicationCapabilitiesForm v-model="edit.capabilities" :is-dark-mode="isDarkMode" />
        </div>

        <div class="flex justify-end gap-4 pt-4 border-t" :class="c.border">
          <button type="button" class="px-6 py-3 rounded-lg font-semibold transition-colors" :class="c.secondary" :disabled="edit.saving" @click="edit.app = null">Cancel</button>
          <button type="submit" class="px-6 py-3 rounded-lg font-semibold text-white transition-colors" :class="edit.saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'" :disabled="edit.saving">
            {{ edit.saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import InlineNotice from '../components/InlineNotice.vue';
import ApplicationCapabilitiesForm from '../components/applications/ApplicationCapabilitiesForm.vue';
import ApplicationDetailsForm from '../components/applications/ApplicationDetailsForm.vue';
import { capabilitiesForm, capabilitiesPayload } from '../components/applications/capabilities.js';
import { detailsForm, updateFields } from '../components/applications/details.js';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import WorkspaceModal from '../components/workspaces/WorkspaceModal.vue';
import { safeHttpUrl } from '../components/workspaces/safeContent.js';
import { atLeast, formatDate, ui } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useDrawer } from '../composables/useDrawer.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { compareVersions, parseVersion } from '../utils/semver.js';

/**
 * Registered applications and migration planning (docs/WORKSPACES.md).
 * Anyone signed in can read; editing needs admin:governance or the admin role
 * in the application's workspace, which the server enforces. The route lets in
 * workspace admins (router/rbacGuards.js), who see their workspaces'
 * applications first and can switch to all of them read-only.
 */
const router = useRouter();
const isDarkMode = useDarkMode();
const c = computed(() => ui(isDarkMode.value));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const loading = ref(false);
const loadError = ref(null);
const applications = ref([]);
const workspaces = ref([]);
const filterCapability = ref('');
// Without admin:governance, start with the applications this user can change
const scope = ref('mine');
const migrationData = ref(null);
const migrationError = ref(null);
const currentVersion = ref(null);
const versionSource = ref(null);
const updatingVersion = ref(null);

const isGovernance = computed(() => hasPermission('admin:governance'));
const adminWorkspaces = computed(() => workspaces.value.filter((ws) => atLeast(ws.effectiveRole, 'admin')));
const canRegister = computed(() => isGovernance.value || adminWorkspaces.value.length > 0);
const canWrite = (app) => isGovernance.value || (!!app.workspaceId && adminWorkspaces.value.some((ws) => ws.id === app.workspaceId));
const canWriteId = (id) => {
  const app = applications.value.find((a) => a.id === id);
  return !!app && canWrite(app);
};

const filteredApplications = computed(() =>
  applications.value.filter(
    (app) =>
      (!filterCapability.value || app.capabilities?.[filterCapability.value]?.enabled === true) &&
      (isGovernance.value || scope.value === 'all' || canWrite(app)),
  ),
);

const workspaceName = (id) => workspaces.value.find((ws) => ws.id === id)?.name ?? 'Another workspace';
const isBehind = (version) => !!currentVersion.value && (!parseVersion(version) || compareVersions(version, currentVersion.value) < 0);
const versionClass = (version) => {
  if (!version) return c.value.faint;
  if (!isBehind(version)) return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
};

const loadApplications = async () => {
  const response = await apiClient.get('/api/v1/applications');
  applications.value = response.data.applications ?? [];
};

const loadWorkspaces = async () => {
  try {
    workspaces.value = (await apiClient.get('/api/v1/workspaces')).data ?? [];
  } catch {
    workspaces.value = [];
  }
};

const loadMigrationData = async () => {
  migrationError.value = null;
  try {
    const [migration, version] = await Promise.all([
      apiClient.get('/api/v1/applications/version-tracking'),
      apiClient.get('/api/v1/design-system/current-version'),
    ]);
    migrationData.value = migration.data;
    currentVersion.value = version.data.version;
    versionSource.value = version.data.source;
  } catch (error) {
    migrationData.value = null;
    migrationError.value = apiErrorMessage(error, 'Migration data could not be loaded.');
  }
};

const loadAll = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    await Promise.all([loadApplications(), loadWorkspaces(), loadMigrationData()]);
  } catch (error) {
    applications.value = [];
    loadError.value = apiErrorMessage(error, 'Applications could not be loaded.');
  } finally {
    loading.value = false;
  }
};

const refresh = async () => {
  try {
    await Promise.all([loadApplications(), loadMigrationData()]);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Applications could not be reloaded.'), 'error');
  }
};

// ---------- Versions ----------
const updateApplicationVersion = async (applicationId, version) => {
  updatingVersion.value = applicationId;
  try {
    await apiClient.patch(`/api/v1/applications/${encodeURIComponent(applicationId)}/design-system-version`, { version });
    showNotice('Application version updated.', 'success');
    await refresh();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application version could not be updated.'), 'error');
  } finally {
    updatingVersion.value = null;
  }
};

const confirmVersionUpdate = async (app) => {
  const ok = await askConfirm({
    title: 'Update design system version?',
    message: `Record that ${app.name} now uses v${currentVersion.value}${app.designSystemVersion ? ` (was v${app.designSystemVersion})` : ''}.`,
    confirmText: 'Update',
  });
  if (ok) updateApplicationVersion(app.id, currentVersion.value);
};

// ---------- Edit ----------
const editTabs = [
  { id: 'details', label: 'Details' },
  { id: 'capabilities', label: 'Capabilities' },
];
const edit = reactive({ app: null, tab: 'details', details: detailsForm(), capabilities: capabilitiesForm(), workspaceId: '', saving: false, error: null });

const moveOptions = computed(() => {
  const options = adminWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name }));
  const current = edit.app?.workspaceId;
  if (current && !options.some((o) => o.value === current)) options.unshift({ value: current, label: workspaceName(current) });
  if (isGovernance.value || !current) options.unshift({ value: '', label: 'No workspace' });
  return options;
});

const openEdit = (app) => {
  Object.assign(edit, {
    app,
    tab: 'details',
    details: detailsForm(app),
    capabilities: capabilitiesForm(app),
    workspaceId: app.workspaceId ?? '',
    saving: false,
    error: null,
  });
};

const saveEdit = async () => {
  const app = edit.app;
  const base = `/api/v1/applications/${encodeURIComponent(app.id)}`;
  const fields = updateFields(edit.details, app);
  const capabilities = capabilitiesPayload(edit.capabilities, app);
  const targetWorkspace = edit.workspaceId || null;
  edit.saving = true;
  edit.error = null;
  try {
    // Move first, so the other changes are checked against the workspace they'll live in
    if (targetWorkspace !== (app.workspaceId ?? null)) await apiClient.patch(`${base}/workspace`, { workspaceId: targetWorkspace });
    if (Object.keys(fields).length) await apiClient.put(base, fields);
    if (Object.keys(capabilities).length) await apiClient.patch(`${base}/capabilities`, capabilities);
    edit.app = null;
    showNotice(`${app.name} saved.`, 'success');
  } catch (error) {
    edit.error = apiErrorMessage(error, 'The changes could not be saved.');
  } finally {
    edit.saving = false;
    await refresh();
  }
};

// ---------- Delete ----------
const deleteApplication = async (app) => {
  const linked = [
    app.capabilities?.visualRegression?.projectId ? 'its visual-regression project' : '',
    app.capabilities?.sessionReplay?.projectId ? 'its session-replay project' : '',
  ].filter(Boolean);
  const ok = await askConfirm({
    title: 'Delete application?',
    message: `"${app.name}"${linked.length ? ` and ${linked.join(' and ')}` : ''} will be deleted. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  try {
    await apiClient.delete(`/api/v1/applications/${encodeURIComponent(app.id)}`);
    showNotice(`${app.name} deleted.`, 'success');
    await refresh();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application could not be deleted.'), 'error');
  }
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  loadAll();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
