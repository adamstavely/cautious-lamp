<template>
  <PageShell>
    <PageHero
      :back="{ to: '/admin/applications', label: 'Applications' }"
      title="Register application"
      lead="Register your application with the design system and enable scanners and capabilities."
      spot="admin/application-registration"
      size="tool"
    />

    <form class="flex flex-col gap-6" @submit.prevent="registerApplication">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />

      <UiCallout v-if="!loadingWorkspaces && !canRegister" tone="info">
        You can register applications in workspaces where you are an admin, or anywhere with the admin:governance permission.
        You don't have either yet; ask a workspace owner to make you an admin.
      </UiCallout>

      <UiPanel title="Basic information">
        <UiSpinner v-if="loadingWorkspaces" label="Loading workspaces…" />
        <UiCallout v-else-if="workspacesError" tone="danger" role="alert">{{ workspacesError }}</UiCallout>
        <UiSelect
          v-else
          v-model="workspaceId"
          label="Workspace"
          :required="!isGovernance"
          :options="workspaceOptions"
          :placeholder="isGovernance ? '' : 'Choose a workspace'"
          hint="Admins of the workspace can edit the application later."
        />

        <ApplicationDetailsForm v-model="details" show-design-system-version />
      </UiPanel>

      <UiPanel title="Capabilities">
        <ApplicationCapabilitiesForm v-model="capabilities" />
      </UiPanel>

      <div class="flex justify-end gap-3">
        <UiButton to="/admin/applications">Cancel</UiButton>
        <UiButton variant="primary" type="submit" :disabled="!canSubmit" :loading="isSubmitting">
          {{ isSubmitting ? 'Registering…' : 'Register application' }}
        </UiButton>
      </div>
    </form>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageShell, UiButton, UiCallout, UiPanel, UiSelect, UiSpinner } from '../components/ui';
import ApplicationCapabilitiesForm from '../components/applications/ApplicationCapabilitiesForm.vue';
import ApplicationDetailsForm from '../components/applications/ApplicationDetailsForm.vue';
import { capabilitiesForm, capabilitiesPayload } from '../components/applications/capabilities.js';
import { detailsForm, registrationFields } from '../components/applications/details.js';
import { atLeast } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Registers an application (docs/WORKSPACES.md). Needs admin:governance, or
 * the admin role in the chosen workspace. Enabling visual regression or
 * session replay creates those projects; if that fails, nothing is registered
 * and the error is shown.
 */
const router = useRouter();
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

onMounted(loadWorkspaces);
</script>
