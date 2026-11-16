<template>
  <PageShell>
    <PageHero
      :back="{ to: '/admin/applications', label: 'Applications' }"
      title="Register application"
      lead="Register your application with the design system and enable scanners and capabilities."
      spot="admin/application-registration"
      size="tool"
    />

    <!-- novalidate: the page checks the required fields itself, shows each problem by its field and focuses the first -->
    <form ref="formEl" class="flex flex-col gap-6" novalidate @submit.prevent="registerApplication">
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
          :error="errors.workspaceId"
        />

        <ApplicationDetailsForm v-model="details" show-design-system-version :errors="errors" />
      </UiPanel>

      <UiPanel title="Capabilities">
        <ApplicationCapabilitiesForm v-model="capabilities" />
      </UiPanel>

      <div class="flex justify-end gap-3">
        <UiButton to="/admin/applications">Cancel</UiButton>
        <!-- Always enabled: submitting explains what is missing rather than the button staying silently disabled -->
        <UiButton variant="primary" type="submit" :loading="isSubmitting">
          {{ isSubmitting ? 'Registering…' : 'Register application' }}
        </UiButton>
      </div>
    </form>
  </PageShell>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
const route = useRoute();
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
const formEl = ref(null);
const errors = reactive({ name: '', workspaceId: '' });

const validate = () => {
  errors.name = details.value.name.trim() ? '' : 'Enter a name for the application.';
  errors.workspaceId = '';
  if (!isGovernance.value && !workspaceId.value) {
    errors.workspaceId = canRegister.value
      ? 'Choose a workspace.'
      : "You need to be an admin of a workspace to register an application there.";
  }
  return !errors.name && !errors.workspaceId;
};

/** Moves focus to the first field with an error, so keyboard and screen reader users land on it */
const focusFirstInvalid = async () => {
  await nextTick();
  formEl.value?.querySelector('[aria-invalid="true"]')?.focus();
};

const loadWorkspaces = async () => {
  loadingWorkspaces.value = true;
  workspacesError.value = null;
  try {
    workspaces.value = (await apiClient.get('/api/v1/workspaces')).data ?? [];
    // Coming from a workspace page (?workspaceId=…) preselects it, if the user can register there
    const requested = typeof route.query.workspaceId === 'string' ? route.query.workspaceId : '';
    if (requested && adminWorkspaces.value.some((ws) => ws.id === requested)) workspaceId.value = requested;
    else if (!isGovernance.value && adminWorkspaces.value.length === 1) workspaceId.value = adminWorkspaces.value[0].id;
  } catch (error) {
    workspaces.value = [];
    workspacesError.value = apiErrorMessage(error, 'Workspaces could not be loaded.');
  } finally {
    loadingWorkspaces.value = false;
  }
};

const registerApplication = async () => {
  if (isSubmitting.value) return;
  if (!validate()) return focusFirstInvalid();
  // The format checks (URLs, team ID, version) are the browser's: show its message on the first field that fails one
  const badFormat = [...(formEl.value?.elements ?? [])].find((el) => el.validity && !el.validity.valid && !el.validity.valueMissing);
  if (badFormat) {
    badFormat.reportValidity();
    return;
  }
  isSubmitting.value = true;
  clearNotice();
  try {
    const payload = {
      ...registrationFields(details.value),
      ...(workspaceId.value ? { workspaceId: workspaceId.value } : {}),
      capabilities: capabilitiesPayload(capabilities.value),
    };
    const { data } = await apiClient.post('/api/v1/applications/register', payload);
    // The list says it worked (the notice would be lost if shown here)
    router.push({ path: '/admin/applications', query: { registered: data?.name ?? payload.name } });
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application could not be registered.'), 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadWorkspaces);
</script>
