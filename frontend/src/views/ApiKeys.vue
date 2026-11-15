<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="API keys"
      lead="Keys let machine clients (CI, the CLI, the MCP server, the ESLint plugin) call the API. Each key is shown once, when it's created."
      spot="site/design-system-api"
    />

    <PageSection title="Keys" description="Keys created here or through the API. Keys set in the server's environment (API_KEYS) aren't listed.">
      <template #actions>
        <UiButton variant="primary" icon="plus" @click="openCreate">Create key</UiButton>
      </template>

      <div class="flex flex-col gap-4">
        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <UiCheckbox v-model="showInactive" label="Show revoked and expired keys" />

        <UiSpinner v-if="loadState === 'loading' && !keys.length" label="Loading API keys…" />

        <UiCallout v-else-if="loadState === 'error'" tone="danger" role="alert">
          {{ loadError }}
          <template #actions>
            <UiButton size="sm" @click="loadKeys">Try again</UiButton>
          </template>
        </UiCallout>

        <UiEmptyState
          v-else-if="!visibleKeys.length"
          :title="keys.length ? 'No active keys.' : 'No API keys yet.'"
          :body="keys.length ? 'Revoked and expired keys are hidden.' : 'Create a key for each client, so you can revoke one without affecting the others.'"
          :spot="keys.length ? '' : 'site/design-system-api'"
        />

        <UiPanel v-else flush>
          <UiTable caption="API keys, newest first">
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Status</th>
                <th scope="col">Permissions</th>
                <th scope="col">Created</th>
                <th scope="col">Last used</th>
                <th scope="col">Expires</th>
                <th scope="col" class="text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="key in visibleKeys" :key="key.id">
                <td>
                  <div class="font-medium text-ink-strong">{{ key.name }}</div>
                  <div class="font-code text-xs text-ink-muted">{{ key.id }}</div>
                </td>
                <td class="whitespace-nowrap">
                  <UiChip :tone="STATUS[statusOf(key)].tone" :icon="STATUS[statusOf(key)].icon">{{ STATUS[statusOf(key)].label }}</UiChip>
                </td>
                <td>
                  <span v-if="!key.scopes?.length" class="text-ink-secondary">Default</span>
                  <ul v-else class="flex flex-wrap gap-1.5" :aria-label="`${key.scopes.length} permissions`">
                    <li v-for="scope in key.scopes" :key="scope"><UiChip>{{ scope }}</UiChip></li>
                  </ul>
                </td>
                <td class="whitespace-nowrap text-ink-secondary">{{ formatDateTime(key.createdAt) }}</td>
                <td class="whitespace-nowrap text-ink-secondary">{{ formatDateTime(key.lastUsed) }}</td>
                <td class="whitespace-nowrap text-ink-secondary">{{ formatDateTime(key.expiresAt, 'Never') }}</td>
                <td class="whitespace-nowrap text-right">
                  <div v-if="statusOf(key) === 'active'" class="flex justify-end gap-1">
                    <UiButton variant="ghost" size="sm" icon="refresh-cw" :aria-label="`Rotate ${key.name}`" @click="askRotate(key)">
                      Rotate
                    </UiButton>
                    <UiButton variant="ghost" size="sm" icon="ban" :aria-label="`Revoke ${key.name}`" @click="askRevoke(key)">
                      Revoke
                    </UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>
        <p class="sr-only" role="status" aria-live="polite">{{ resultsAnnouncement }}</p>
      </div>
    </PageSection>

    <AdminDialog
      v-model="createOpen"
      :title="created ? (created.rotated ? 'Key rotated' : 'Key created') : 'Create API key'"
      :persistent="saving"
      :max-width="620"
    >
      <!-- After creating: the one time the key is shown -->
      <div v-if="created" class="flex flex-col gap-4">
        <UiCallout tone="warning" title="Copy the key now">
          It won't be shown again. Store it as a secret in the client that uses it, such as a CI variable.
        </UiCallout>
        <div class="flex flex-wrap items-end gap-2">
          <div class="min-w-0 flex-1">
            <UiInput id="api-key-value" :model-value="created.apiKey" label="API key" mono readonly spellcheck="false" autocomplete="off" />
          </div>
          <UiButton icon="copy" @click="copyKey">Copy</UiButton>
        </div>
        <p class="sr-only" role="status" aria-live="polite">{{ copyStatus }}</p>
        <p v-if="copyStatus" class="text-xs text-ink-secondary" aria-hidden="true">{{ copyStatus }}</p>
        <p class="text-ink-secondary">
          Send it as <UiCode>Authorization: Bearer &lt;key&gt;</UiCode>.
        </p>
      </div>

      <form v-else :id="formId" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
        <InlineNotice :notice="formError ? { type: 'error', message: formError } : null" @dismiss="formError = ''" />

        <UiInput
          :id="`${formId}-name`"
          v-model="form.name"
          label="Name"
          hint="Say which client uses it, such as “GitHub Actions: web app”."
          required
          maxlength="200"
          autocomplete="off"
          :error="nameError"
        />

        <UiSelect :id="`${formId}-expiry`" v-model="form.expiresInDays" label="Expires" :options="EXPIRY_OPTIONS" />

        <UiRadioChoices v-model="form.access" label="Permissions" :options="accessOptions" />

        <fieldset v-if="form.access === 'chosen'" class="flex flex-col gap-2">
          <legend class="mb-2 text-sm font-medium text-ink">Permissions for this key</legend>
          <p class="text-sm text-ink-secondary">You can only grant permissions you have yourself.</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <UiCheckbox v-for="permission in grantable" :key="permission" v-model="form.scopes" :value="permission" :label="permission" />
          </div>
          <p v-if="scopesError" class="text-xs font-medium text-danger" role="alert">{{ scopesError }}</p>
        </fieldset>
      </form>

      <template #actions>
        <UiButton v-if="created" variant="primary" @click="createOpen = false">Done</UiButton>
        <template v-else>
          <UiButton :disabled="saving" @click="createOpen = false">Cancel</UiButton>
          <UiButton type="submit" :form="formId" variant="primary" :loading="saving">
            {{ saving ? 'Creating…' : 'Create key' }}
          </UiButton>
        </template>
      </template>
    </AdminDialog>

    <ConfirmActionDialog
      v-model="revokeOpen"
      title="Revoke API key"
      :message="revoking ? `Clients using “${revoking.name}” will get 401 TOKEN_REVOKED from now on. This can't be undone.` : ''"
      confirm-text="Revoke key"
      busy-text="Revoking…"
      danger
      :busy="revokeBusy"
      :error="revokeError"
      @confirm="revoke"
      @clear-error="revokeError = ''"
    />

    <ConfirmActionDialog
      v-model="rotateOpen"
      title="Rotate API key"
      :message="rotating ? `A new key with the same permissions replaces “${rotating.name}”, which stops working now. Update every client that uses it.` : ''"
      confirm-text="Rotate key"
      busy-text="Rotating…"
      danger
      :busy="rotateBusy"
      :error="rotateError"
      @confirm="rotate"
      @clear-error="rotateError = ''"
    />
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import AdminDialog from '../components/admin/AdminDialog.vue';
import ConfirmActionDialog from '../components/admin/ConfirmActionDialog.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiCode,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiRadioChoices,
  UiSelect,
  UiSpinner,
  UiTable,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import { adminErrorMessage, apiKeysApi, copyText, formatDateTime } from '../composables/useAccessAdmin.js';
import { errorStatus } from '../services/api.js';

const STATUS = {
  active: { label: 'Active', tone: 'success', icon: 'circle-check' },
  expired: { label: 'Expired', tone: 'warning', icon: 'clock' },
  revoked: { label: 'Revoked', tone: 'neutral', icon: 'ban' },
};

const EXPIRY_OPTIONS = [
  { value: '', label: 'Never' },
  { value: '30', label: 'In 30 days' },
  { value: '90', label: 'In 90 days' },
  { value: '180', label: 'In 180 days' },
  { value: '365', label: 'In a year' },
];

const accessOptions = [
  { value: 'default', label: 'Default', hint: 'Read everything, and create components, reviews and feedback.' },
  { value: 'chosen', label: 'Only the permissions I choose' },
];

const { notice, showNotice, clearNotice } = useNotice();
const { permissions: myPermissions } = useAuth();

const keys = ref([]);
const loadState = ref('idle');
const loadError = ref('');
const showInactive = ref(false);

const keyErrorMessage = (error, fallback) =>
  errorStatus(error) === 503 ? 'API keys are temporarily unavailable. Please try again shortly.' : adminErrorMessage(error, fallback);

const statusOf = (key) => {
  if (key.revoked) return 'revoked';
  if (key.expiresAt && new Date(key.expiresAt).getTime() < Date.now()) return 'expired';
  return 'active';
};

const visibleKeys = computed(() => (showInactive.value ? keys.value : keys.value.filter((key) => statusOf(key) === 'active')));
const resultsAnnouncement = computed(() =>
  loadState.value === 'ready' ? `${visibleKeys.value.length} key${visibleKeys.value.length === 1 ? '' : 's'}` : ''
);
/** What a key may be given: the permissions the signed-in admin holds (the API refuses others) */
const grantable = computed(() => [...myPermissions.value].sort());

const loadKeys = async () => {
  loadState.value = 'loading';
  loadError.value = '';
  try {
    const list = await apiKeysApi.list();
    keys.value = (Array.isArray(list) ? list : []).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    loadState.value = 'ready';
  } catch (error) {
    keys.value = [];
    loadState.value = 'error';
    loadError.value = keyErrorMessage(error, "Couldn't load API keys.");
  }
};

// ---------- Create ----------

const formId = 'create-api-key';
const createOpen = ref(false);
const saving = ref(false);
const form = reactive({ name: '', expiresInDays: '90', access: 'default', scopes: [] });
const nameError = ref('');
const scopesError = ref('');
const formError = ref('');
const created = ref(null);
const copyStatus = ref('');

const openCreate = () => {
  Object.assign(form, { name: '', expiresInDays: '90', access: 'default', scopes: [] });
  nameError.value = '';
  scopesError.value = '';
  formError.value = '';
  created.value = null;
  copyStatus.value = '';
  createOpen.value = true;
};

// Don't keep the key in memory once the dialog closes
watch(createOpen, (open) => {
  if (!open) {
    created.value = null;
    copyStatus.value = '';
  }
});

const submit = async () => {
  formError.value = '';
  nameError.value = form.name.trim() ? '' : 'Enter a name.';
  scopesError.value = form.access === 'chosen' && !form.scopes.length ? 'Choose at least one permission.' : '';
  if (nameError.value || scopesError.value) return;
  saving.value = true;
  try {
    const body = { name: form.name.trim() };
    if (form.expiresInDays) body.expiresInDays = Number(form.expiresInDays);
    if (form.access === 'chosen') body.scopes = [...form.scopes];
    const result = await apiKeysApi.create(body);
    created.value = { apiKey: result.apiKey };
    keys.value = [result.metadata, ...keys.value];
    showNotice(`Created ${result.metadata.name}.`, 'success');
  } catch (error) {
    formError.value = keyErrorMessage(error, "Couldn't create the key.");
  } finally {
    saving.value = false;
  }
};

const copyKey = async () => {
  copyStatus.value = (await copyText(created.value?.apiKey ?? ''))
    ? 'Key copied to the clipboard.'
    : "Couldn't copy. Select the key and copy it yourself.";
};

// ---------- Rotate ----------

const rotateOpen = ref(false);
const rotating = ref(null);
const rotateBusy = ref(false);
const rotateError = ref('');

const askRotate = (key) => {
  rotating.value = key;
  rotateError.value = '';
  rotateOpen.value = true;
};

/** Revokes the key and shows its replacement once, in the same dialog as a new key */
const rotate = async () => {
  const key = rotating.value;
  if (!key) return;
  rotateBusy.value = true;
  rotateError.value = '';
  try {
    const result = await apiKeysApi.rotate(key.id);
    rotateOpen.value = false;
    showNotice(`Rotated ${key.name}.`, 'success');
    await loadKeys();
    copyStatus.value = '';
    created.value = { apiKey: result.newApiKey, rotated: true };
    createOpen.value = true;
  } catch (error) {
    rotateError.value = keyErrorMessage(error, "Couldn't rotate the key.");
  } finally {
    rotateBusy.value = false;
  }
};

// ---------- Revoke ----------

const revokeOpen = ref(false);
const revoking = ref(null);
const revokeBusy = ref(false);
const revokeError = ref('');

const askRevoke = (key) => {
  revoking.value = key;
  revokeError.value = '';
  revokeOpen.value = true;
};

const revoke = async () => {
  const key = revoking.value;
  if (!key) return;
  revokeBusy.value = true;
  revokeError.value = '';
  try {
    await apiKeysApi.revoke(key.id);
    revokeOpen.value = false;
    showNotice(`Revoked ${key.name}.`, 'success');
    await loadKeys();
  } catch (error) {
    revokeError.value = keyErrorMessage(error, "Couldn't revoke the key.");
  } finally {
    revokeBusy.value = false;
  }
};

onMounted(loadKeys);
</script>
