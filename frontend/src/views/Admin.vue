<template>
  <PageShell>
    <PageHero
      eyebrow="Manage the system"
      title="Admin"
      lead="Manage system health, governance, and administrative settings for your design system."
      spot="admin/admin"
    />

    <PageSection title="Admin tools" description="Health, governance, people, content and performance.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <template v-for="tool in tools" :key="tool.title">
          <UiCard v-if="tool.to && canAccessPath(tool.to)" :to="tool.to" :title="tool.title" :spot="tool.art">{{ tool.body }}</UiCard>
          <UiCard v-else-if="tool.banners && hasPermission('admin:banners')" :title="tool.title" :spot="tool.art">
            {{ tool.body }}
            <template #footer>
              <UiButton size="sm" icon="megaphone" @click="showBannerModal = true">Manage banners</UiButton>
            </template>
          </UiCard>
        </template>
      </div>
    </PageSection>

    <!-- Banner Management Modal -->
    <UiDialog v-model:open="showBannerModal" title="Site banners" size="lg">
      <!-- The page behind is inert while this is open: results of the actions in here are shown (and announced) here -->
      <InlineNotice :notice="bannerNotice" @dismiss="clearBannerNotice" />

      <div class="mb-6 flex justify-between items-center gap-4">
        <h3 class="text-lg font-semibold text-ink-strong">Active banners</h3>
        <UiButton ref="createBannerButton" variant="primary" size="sm" icon="plus" @click="openCreateBanner">Create banner</UiButton>
      </div>

      <UiEmptyState
        v-if="banners.length === 0"
        title="No banners yet"
        body="No banners created yet. Create your first banner to notify users."
        spot="patterns/pattern-notifications-overview"
      />

      <ul v-else ref="bannerList" class="space-y-4">
        <li v-for="banner in banners" :key="banner.id" class="p-4 rounded-tile border border-line-faint bg-surface-sunken">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <UiChip :tone="bannerTone(banner.type)">{{ banner.type.toUpperCase() }}</UiChip>
                <UiChip :tone="banner.isActive ? 'success' : 'neutral'">{{ banner.isActive ? 'Active' : 'Inactive' }}</UiChip>
              </div>
              <h4 class="font-semibold text-ink-strong mb-1">{{ banner.title }}</h4>
              <p class="text-sm text-ink-secondary mb-2">{{ banner.message }}</p>
              <p class="text-xs text-ink-muted">
                Created: {{ new Date(banner.createdAt).toLocaleString() }}
                <span v-if="banner.expiresAt">| Expires: {{ new Date(banner.expiresAt).toLocaleString() }}</span>
              </p>
            </div>
            <div class="flex gap-1">
              <UiButton variant="ghost" size="sm" icon="pencil" icon-only :label="`Edit ${banner.title}`" @click="editBanner(banner)" />
              <UiButton
                variant="ghost"
                size="sm"
                :icon="banner.isActive ? 'eye-off' : 'eye'"
                icon-only
                :label="banner.isActive ? `Deactivate ${banner.title}` : `Activate ${banner.title}`"
                @click="toggleBannerStatus(banner)"
              />
              <UiButton variant="ghost" size="sm" icon="trash-2" icon-only :label="`Delete ${banner.title}`" data-focus-after-remove @click="deleteBanner(banner.id)" />
            </div>
          </div>
        </li>
      </ul>
    </UiDialog>

    <!-- Create/Edit Banner Modal -->
    <UiDialog v-model:open="showBannerForm" :title="editingBanner ? 'Edit banner' : 'Create banner'">
      <form id="admin-banner-form" class="space-y-4" @submit.prevent="saveBanner">
        <UiCallout v-if="saveError" tone="danger" role="alert">{{ saveError }}</UiCallout>
        <UiInput v-model="bannerForm.title" label="Title" required />
        <UiTextarea v-model="bannerForm.message" label="Message" required :rows="3" />
        <UiSelect v-model="bannerForm.type" label="Type" :options="bannerTypes" />
        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-ink mb-2">Expiration date</legend>
          <UiCheckbox
            :model-value="bannerForm.noExpiration"
            label="No expiration (banner will remain active until manually removed)"
            @update:model-value="setNoExpiration"
          />
          <UiInput v-if="!bannerForm.noExpiration" v-model="bannerForm.expiresAt" type="datetime-local" label="Expires at" />
        </fieldset>
      </form>
      <template #footer>
        <UiButton @click="showBannerForm = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="admin-banner-form">{{ editingBanner ? 'Update' : 'Create' }} banner</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { confirmDialog } from '../composables/useConfirm.js';
import { nextTick, ref, onMounted, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCard,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiSelect,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { focusAfterRemoval } from '../utils/focusAfterRemoval.js';
import apiClient from '../services/api.js';
import { canAccessPath } from '../router/rbacGuards.js';
import { hasPermission } from '../services/auth.js';

// Messages for the actions inside the "Site banners" dialog, shown in that dialog
const { notice: bannerNotice, showNotice: showBannerNotice, clearNotice: clearBannerNotice } = useNotice();
const saveError = ref('');
const showBannerModal = ref(false);
const bannerList = ref(null);
const createBannerButton = ref(null);
const showBannerForm = ref(false);
const banners = ref([]);
const editingBanner = ref(null);
const bannerForm = ref({
  title: '',
  message: '',
  type: 'info',
  expiresAt: '',
  noExpiration: true
});

const bannerTypes = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Success' },
];

// Cards in the order the page has always shown them; each shows only to people who can open it
const tools = [
  { title: 'System health', to: '/admin/health', art: 'site/system-health', body: "Monitor your design system's health, track component adoption, and identify improvements." },
  { title: 'Governance', to: '/admin/governance', art: 'admin/governance', body: 'Enforce design system rules and check compliance. Monitor both the design system and applications.' },
  { title: 'Audit logs', to: '/admin/audit', art: 'admin/audit-logs', body: 'Track and monitor all user actions, API calls, and system events with exportable audit trails.' },
  { title: 'Site banners', banners: true, art: 'patterns/pattern-notifications-overview', body: 'Create and manage info banners to notify users of important issues or updates.' },
  { title: 'Team workspaces', to: '/admin/workspaces', art: 'admin/workspace-management', body: 'Create isolated workspaces for different teams. Manage team-specific components, access control, and collaboration.' },
  { title: 'User management', to: '/admin/users', art: 'admin/user-management', body: 'Manage users and their workspace memberships. Assign users to teams and control access.' },
  { title: 'Role management', to: '/admin/roles', art: 'site/role-management', body: 'Manage user roles and their access to design system features and permissions.' },
  { title: 'API keys', to: '/admin/api-keys', art: 'site/design-system-api', body: 'Create keys for CI, the CLI and other machine clients, choose what each may do, and revoke them.' },
  { title: 'Feature flags', to: '/admin/feature-flags', art: 'admin/feature-flags', body: 'Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts.' },
  { title: 'Component and pattern lifecycle management', to: '/admin/content', art: 'admin/content-management', body: 'Create new pattern and component pages, and manage statuses throughout their lifecycle.' },
  { title: 'Performance analysis', to: '/admin/performance', art: 'admin/performance-analysis', body: 'Analyze component bundle sizes and set performance budgets to monitor and prevent regressions.' },
  { title: 'Accessibility reports', to: '/admin/accessibility-reports', art: 'site/accessibility-reports', body: 'Automated WCAG compliance monitoring, trend tracking, and prioritized fix recommendations.' },
  { title: 'Component dependency graph', to: '/admin/dependencies', art: 'foundations/component-dependency-graph', body: 'Visualize component relationships, dependencies, and understand how components work together.' },
  { title: 'Application management', to: '/admin/applications', art: 'admin/application-management', body: 'Register applications, manage capabilities, and configure scanners for governance, visual regression, and session replay.' },
];

// Each visit to the dialog starts without the last visit's message
watch(showBannerModal, (open) => {
  if (open) clearBannerNotice();
});

const fetchBanners = async () => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners`);
    banners.value = response.data;
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
};

const openCreateBanner = () => {
  editingBanner.value = null;
  bannerForm.value = {
    title: '',
    message: '',
    type: 'info',
    expiresAt: '',
    noExpiration: true
  };
  saveError.value = '';
  showBannerForm.value = true;
};

const setNoExpiration = (value) => {
  bannerForm.value.noExpiration = value;
  if (bannerForm.value.noExpiration) {
    bannerForm.value.expiresAt = '';
  }
};

const editBanner = (banner) => {
  editingBanner.value = banner;
  bannerForm.value = {
    title: banner.title,
    message: banner.message,
    type: banner.type,
    expiresAt: banner.expiresAt ? new Date(banner.expiresAt).toISOString().slice(0, 16) : '',
    noExpiration: !banner.expiresAt
  };
  saveError.value = '';
  showBannerForm.value = true;
};

const saveBanner = async () => {
  saveError.value = '';
  try {
    const payload = {
      title: bannerForm.value.title,
      message: bannerForm.value.message,
      type: bannerForm.value.type,
      expiresAt: bannerForm.value.noExpiration ? undefined : (bannerForm.value.expiresAt || undefined)
    };

    if (editingBanner.value) {
      await apiClient.put(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners/${editingBanner.value.id}`, payload);
    } else {
      await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners`, payload);
    }

    const wasEditing = Boolean(editingBanner.value);
    showBannerForm.value = false;
    await fetchBanners();
    showBannerNotice(wasEditing ? 'Banner updated' : 'Banner created', 'success');
  } catch (error) {
    console.error('Failed to save banner:', error);
    // Shown in the form's dialog: the page behind it is inert, so a message there is neither seen nor announced
    saveError.value = error.response?.data?.message || error.message || 'Failed to save banner. Please try again.';
  }
};

const toggleBannerStatus = async (banner) => {
  try {
    await apiClient.put(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners/${banner.id}`, {
      isActive: !banner.isActive
    });

    await fetchBanners();
    showBannerNotice(banner.isActive ? 'Banner deactivated' : 'Banner activated', 'success');
  } catch (error) {
    console.error('Failed to toggle banner status:', error);
    showBannerNotice('Failed to update banner status. Please try again.', 'error');
  }
};

const deleteBanner = async (id) => {
  if (!(await confirmDialog({ title: 'Delete this banner?', message: 'It will stop showing to everyone.', confirmLabel: 'Delete banner', danger: true }))) return;
  const index = banners.value.findIndex((banner) => banner.id === id);

  try {
    await apiClient.delete(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners/${id}`);
    await fetchBanners();
    showBannerNotice('Banner deleted', 'success');
    // Its Delete button went with it: focus the banner now in its place
    await nextTick();
    focusAfterRemoval(bannerList.value, index, { fallback: createBannerButton.value });
  } catch (error) {
    console.error('Failed to delete banner:', error);
    showBannerNotice('Failed to delete banner. Please try again.', 'error');
  }
};

const bannerTone = (type) => ({ error: 'danger', warning: 'warning', success: 'success' })[type] || 'info';

onMounted(fetchBanners);
</script>
