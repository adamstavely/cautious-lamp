<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Feature flags"
      lead="Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts."
      spot="admin/feature-flags"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <PageSection title="Flags">
      <template #actions>
        <UiButton variant="primary" icon="add" @click="showCreateModal = true">Create flag</UiButton>
      </template>

      <UiSpinner v-if="loading" label="Loading feature flags…" />

      <UiEmptyState
        v-else-if="flags.length === 0"
        spot="admin/feature-flags"
        title="No feature flags found"
        body="Create your first flag to get started."
      />

      <ul v-else class="space-y-4">
        <li v-for="flag in flags" :key="flag.id" class="flag-card">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-ink-strong">{{ flag.name }}</h3>
              <UiChip :tone="flag.enabled ? 'success' : 'neutral'">{{ flag.enabled ? 'Enabled' : 'Disabled' }}</UiChip>
              <UiCode>{{ flag.key }}</UiCode>
            </div>
            <p class="text-sm mb-4 text-ink-secondary">{{ flag.description || 'No description provided' }}</p>

            <div v-if="flag.metadata?.category || flag.metadata?.tags?.length" class="flex flex-wrap gap-2 mb-4">
              <UiChip v-if="flag.metadata?.category" tone="accent">{{ flag.metadata.category }}</UiChip>
              <UiChip v-for="tag in flag.metadata?.tags" :key="tag">{{ tag }}</UiChip>
            </div>

            <dl v-if="flag.targeting" class="text-xs space-y-1 text-ink-secondary">
              <div v-if="flag.targeting.users && flag.targeting.users.length > 0">
                <dt class="inline font-semibold">Target users:</dt> <dd class="inline">{{ flag.targeting.users.join(', ') }}</dd>
              </div>
              <div v-if="flag.targeting.groups && flag.targeting.groups.length > 0">
                <dt class="inline font-semibold">Target groups:</dt> <dd class="inline">{{ flag.targeting.groups.join(', ') }}</dd>
              </div>
              <div v-if="flag.targeting.percentage !== undefined">
                <dt class="inline font-semibold">Rollout:</dt> <dd class="inline">{{ flag.targeting.percentage }}% of users</dd>
              </div>
            </dl>
          </div>
          <div class="flex gap-1">
            <UiButton
              icon-only
              variant="ghost"
              :icon="flag.enabled ? 'toggle_on' : 'toggle_off'"
              :class="{ 'text-success': flag.enabled }"
              :label="`${flag.enabled ? 'Disable' : 'Enable'} ${flag.name}`"
              @click="toggleFlag(flag.id)"
            />
            <UiButton icon-only variant="ghost" icon="edit" :label="`Edit ${flag.name}`" @click="editFlag(flag)" />
            <UiButton icon-only variant="ghost" icon="delete" :label="`Delete ${flag.name}`" @click="deleteFlag(flag)" />
          </div>
        </li>
      </ul>
    </PageSection>

    <!-- Create/Edit -->
    <UiDialog
      :open="showCreateModal || showEditModal"
      :title="showEditModal ? 'Edit feature flag' : 'Create feature flag'"
      size="lg"
      @update:open="(open) => { if (!open) closeModal(); }"
    >
      <form id="feature-flag-form" class="space-y-5" @submit.prevent="saveFlag">
        <UiCallout title="How feature flags work">
          <p class="mb-2">
            Feature flags control access to pages and capabilities. Select a page/route below, and we'll automatically generate the flag key.
            When disabled, users will be redirected away from that page.
          </p>
          <p><strong>Example:</strong> Selecting "/components/testing" creates flag "component-testing" which controls access to the Component Testing page.</p>
        </UiCallout>

        <UiField
          label="Page / route"
          required
          hint="Select the page or route this flag will control. The flag key will be auto-generated."
          v-slot="{ id, describedBy }"
        >
          <div class="relative">
            <select
              :id="id"
              v-model="selectedRoute"
              class="route-select"
              :disabled="showEditModal"
              :aria-describedby="describedBy"
              @change="updateFlagFromRoute"
            >
              <option value="">-- Select a page or route --</option>
          <optgroup label="Components">
          <option value="/components">Components Overview</option>
          <option value="/components/status">Component Status</option>
          <option value="/components/loupe">Loupe</option>
          <option value="/components/testing">Component Testing</option>
          <option value="/components/documentation">Documentation Generator</option>
          <option value="/review/handoff">Design-Dev Handoff</option>
          <option value="/components/composition">Component Composition</option>
          <option value="/admin/dependencies">Dependency Graph</option>
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
          <option value="/review/management">Review Management</option>
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
          <option value="/research">HCD</option>
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
            <span class="material-symbols-outlined route-select-chevron" aria-hidden="true">expand_more</span>
          </div>
        </UiField>

        <div>
          <UiInput
            v-model="flagForm.key"
            label="Flag key"
            required
            mono
            :disabled="showEditModal || (!!selectedRoute && selectedRoute !== 'custom')"
            placeholder="feature-key-name"
            :hint="selectedRoute && selectedRoute !== 'custom'
              ? 'Auto-generated from route. This will be used to control access to the selected page.'
              : 'Unique identifier for the feature flag (cannot be changed after creation). Use lowercase with hyphens (e.g., &quot;my-new-feature&quot;).'"
          />
          <UiCallout v-if="!selectedRoute || selectedRoute === 'custom'" tone="warning" class="mt-2">
            <strong>Note:</strong> For custom flags to work with route protection, you'll need to add the route-to-flag mapping in the router guard configuration.
          </UiCallout>
        </div>

        <UiInput v-model="flagForm.name" label="Name" required placeholder="Feature Name" />
        <UiTextarea v-model="flagForm.description" label="Description" rows="3" placeholder="Describe what this feature flag controls" />
        <UiCheckbox v-model="flagForm.enabled" label="Enabled" />
        <UiSelect
          v-model="flagForm.metadata.category"
          label="Category"
          required
          placeholder="-- Select a category --"
          hint="Select the sidenav section this feature belongs to"
          :options="CATEGORY_OPTIONS"
        />
        <UiInput v-model="flagForm.metadata.tags" label="Tags (comma-separated)" placeholder="tag1, tag2, tag3" />

        <fieldset class="space-y-4 border-t border-line pt-4">
          <legend class="text-base font-semibold text-ink-strong float-left w-full mb-3">Targeting (optional)</legend>
          <UiInput v-model="flagForm.targeting.users" label="Target users (comma-separated user IDs)" placeholder="user1@example.com, user2@example.com" />
          <UiInput v-model="flagForm.targeting.groups" label="Target groups (comma-separated group names)" placeholder="beta-testers, admins" />
          <UiInput
            v-model="flagForm.targeting.percentage"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            label="Percentage rollout (0-100)"
            hint="Enable for a percentage of users (0-100). Leave empty to enable for all users when flag is enabled."
          />
        </fieldset>

        <UiCallout v-if="saveError" tone="danger" role="alert">{{ saveError }}</UiCallout>
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton type="submit" form="feature-flag-form" variant="primary" :loading="saving">{{ showEditModal ? 'Save changes' : 'Create flag' }}</UiButton>
      </template>
    </UiDialog>

    <!-- Delete confirmation -->
    <UiDialog :open="!!flagToDelete" title="Delete feature flag?" size="sm" @update:open="(open) => { if (!open) flagToDelete = null; }">
      <p class="text-sm text-ink">Are you sure you want to delete the feature flag "{{ flagToDelete?.name }}"? This cannot be undone.</p>
      <template #footer>
        <UiButton @click="flagToDelete = null">Cancel</UiButton>
        <UiButton variant="danger" icon="delete" @click="confirmDeleteFlag">Delete</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api.js';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiCode,
  UiDialog,
  UiEmptyState,
  UiField,
  UiInput,
  UiSelect,
  UiSpinner,
  UiTextarea,
} from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const { notice, showNotice, clearNotice } = useNotice();

// The sidenav sections a flag can belong to
const CATEGORY_OPTIONS = [
  'Getting Started',
  'Guidelines',
  'Components',
  'Tokens',
  'Patterns',
  'Fonts',
  'HCD',
  'Design Assets',
  'Review',
  'Tools',
  'Admin',
  'AI',
  'API',
  'Feedback',
  'Notifications',
  'Branding',
  'Governance',
  'Documentation',
];

const flags = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingFlag = ref(null);
const selectedRoute = ref('');
const saving = ref(false);
const saveError = ref('');
const flagToDelete = ref(null);

// Route to flag key mapping (reverse of featureFlagGuards)
const routeToFlagKey = {
  '/components': 'component-status',
  '/components/status': 'component-status',
  '/components/loupe': 'component-loupe',
  '/components/testing': 'component-testing',
  '/components/documentation': 'component-documentation',
  '/review/handoff': 'component-handoff',
  '/components/composition': 'component-composition',
  '/admin/dependencies': 'component-dependencies',
  '/tokens': 'token-studio',
  '/tokens/studio': 'token-studio',
  '/tokens/playground': 'token-playground',
  '/tokens/library': 'token-library',
  '/review': 'review-system',
  '/review/my-requests': 'review-kanban',
  '/review/management': 'review-admin',
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
  '/components/loupe': 'Loupe',
  '/components/testing': 'Component Testing',
  '/components/documentation': 'Documentation Generator',
  '/review/handoff': 'Design-Dev Handoff',
  '/components/composition': 'Component Composition',
  '/admin/dependencies': 'Dependency Graph',
  '/tokens': 'Tokens Overview',
  '/tokens/studio': 'Token Studio',
  '/tokens/playground': 'Token Playground',
  '/tokens/library': 'Style Library',
  '/review': 'Review System',
  '/review/my-requests': 'Review Kanban',
  '/review/management': 'Review Management',
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
  '/fonts': 'Fonts Overview',
  '/fonts/library': 'Font Library',
  '/fonts/scale': 'Font Scale',
  '/fonts/stack': 'Font Stack',
  '/fonts/subsetting': 'Font Subsetting',
  '/patterns': 'Patterns System',
  '/design-assets/icons': 'Icon Library',
  '/getting-started': 'Getting Started',
  '/research': 'HCD',
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
  if (route.startsWith('/tools') || route === '/palette-builder' || route === '/theme-builder') return 'Tools';
  if (route.startsWith('/fonts')) return 'Fonts';
  if (route.startsWith('/patterns')) return 'Patterns';
  if (route.startsWith('/design-assets')) return 'Design Assets';
  if (route.startsWith('/getting-started')) return 'Getting Started';
  if (route.startsWith('/research')) return 'HCD';
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
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/feature-flags`);
    flags.value = response.data;
  } catch (error) {
    console.error('Failed to load feature flags:', error);
    showNotice('Failed to load feature flags. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleFlag = async (id) => {
  try {
    await apiClient.put(`${API_BASE_URL}/api/v1/feature-flags/${id}/toggle`);
    await loadFlags();
    // Refresh feature flag cache and notify all components
    if (window.OpenFeature) {
      await window.OpenFeature.refreshCache();
    }
    // Dispatch event to notify all components to refresh their flags
    window.dispatchEvent(new CustomEvent('feature-flags-updated'));
  } catch (error) {
    console.error('Failed to toggle feature flag:', error);
    showNotice('Failed to toggle feature flag. Please try again.', 'error');
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

// Asks first (in a dialog), then deletes
const deleteFlag = (flag) => {
  flagToDelete.value = flag;
};

const confirmDeleteFlag = async () => {
  const id = flagToDelete.value?.id;
  flagToDelete.value = null;
  if (!id) return;
  try {
    await apiClient.delete(`${API_BASE_URL}/api/v1/feature-flags/${id}`);
    await loadFlags();
  } catch (error) {
    console.error('Failed to delete feature flag:', error);
    showNotice('Failed to delete feature flag. Please try again.', 'error');
  }
};

const saveFlag = async () => {
  saving.value = true;
  saveError.value = '';
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
      await apiClient.put(`${API_BASE_URL}/api/v1/feature-flags/${editingFlag.value.id}`, payload);
    } else {
      await apiClient.post(`${API_BASE_URL}/api/v1/feature-flags`, payload);
    }

    await loadFlags();
    // Refresh feature flag cache and notify all components
    if (window.OpenFeature) {
      await window.OpenFeature.refreshCache();
    }
    // Dispatch event to notify all components to refresh their flags
    window.dispatchEvent(new CustomEvent('feature-flags-updated'));
    closeModal();
  } catch (error) {
    console.error('Failed to save feature flag:', error);
    saveError.value = error.response?.data?.error || 'Failed to save feature flag. Please try again.';
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingFlag.value = null;
  selectedRoute.value = '';
  saveError.value = '';
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
});
</script>

<style scoped>
.flag-card {
  @apply flex items-start justify-between gap-4 rounded-card border border-line bg-surface-raised p-5 transition-colors hover:border-accent-border;
}
.route-select {
  @apply w-full h-11 pl-3.5 pr-10 appearance-none rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50;
}
.route-select-chevron {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-lg text-ink-muted pointer-events-none;
}
</style>
