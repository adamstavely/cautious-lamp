<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Tokens"
      title="Multi-brand"
      lead="Brands share the design system's components and override the design tokens that make them their own."
      spot="foundations/design-themes"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiSpinner v-if="loading" label="Loading brands…" />

    <UiCallout v-else-if="loadError" tone="danger" title="Brands couldn't be loaded" role="alert">
      {{ apiErrorMessage(loadError) }}
      <template #actions>
        <UiButton size="sm" icon="refresh-cw" @click="load">Try again</UiButton>
      </template>
    </UiCallout>

    <template v-else>
      <PageSection title="Brands" description="Each brand's token overrides; tokens it doesn't override keep their base value.">
        <div v-if="canCreate" class="mb-6">
          <UiButton variant="primary" icon="plus" @click="openEditor()">Add brand</UiButton>
        </div>

        <UiTable v-if="brands.length" caption="Brands" bordered>
          <thead>
            <tr>
              <th scope="col">Brand</th>
              <th scope="col">Overrides</th>
              <th scope="col">Last changed</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in brands" :key="brand.id">
              <th scope="row">
                <span class="font-medium text-ink-strong">{{ brand.name }}</span>
                <span v-if="brand.description" class="block text-sm font-normal text-ink-secondary">{{ brand.description }}</span>
              </th>
              <td class="whitespace-nowrap">
                <span class="inline-flex items-center gap-2">
                  <UiSwatch v-for="o in colourOverrides(brand).slice(0, 4)" :key="o.token" :color="o.value" :label="`${o.token}: ${o.value}`" size="sm" />
                  {{ brand.tokenOverrides.length }} {{ brand.tokenOverrides.length === 1 ? 'token' : 'tokens' }}
                </span>
              </td>
              <td class="whitespace-nowrap text-ink-secondary">{{ formatDate(brand.updatedAt) }} by {{ brand.updatedBy?.name }}</td>
              <td class="whitespace-nowrap">
                <div class="flex gap-2">
                  <UiButton size="sm" icon="eye" :aria-pressed="selectedId === brand.id" @click="selectedId = brand.id">View<span class="sr-only"> {{ brand.name }}</span></UiButton>
                  <UiButton v-if="canEdit" size="sm" icon="pencil" @click="openEditor(brand)">Edit<span class="sr-only"> {{ brand.name }}</span></UiButton>
                  <UiButton v-if="canDelete" size="sm" variant="danger" icon="trash-2" @click="removeBrand(brand)">Delete<span class="sr-only"> {{ brand.name }}</span></UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </UiTable>

        <UiEmptyState
          v-else
          title="No brands yet"
          :body="canCreate ? 'Add a brand to give it its own values for the design tokens.' : 'People who can create tokens add brands here.'"
          spot="foundations/design-themes"
        />
      </PageSection>

      <PageSection v-if="selected" :title="selected.name" description="Its token values next to the base values." divided>
        <UiTable v-if="selected.tokenOverrides.length" :caption="`Token overrides for ${selected.name}`" bordered>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Base value</th>
              <th scope="col">{{ selected.name }} value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="override in selected.tokenOverrides" :key="override.token">
              <th scope="row" class="font-mono text-sm text-ink-strong">{{ override.token }}</th>
              <td><TokenValue :value="tokensByName.get(override.token)?.value ?? 'Not in the token set'" /></td>
              <td><TokenValue :value="override.value" /></td>
            </tr>
          </tbody>
        </UiTable>
        <UiEmptyState v-else title="No overrides" :body="`${selected.name} uses every base token value.`" />
      </PageSection>
    </template>

    <UiDialog :open="!!editor" :title="editor?.id ? `Edit ${editor.originalName}` : 'Add brand'" size="lg" @update:open="(open) => { if (!open) editor = null; }">
      <form v-if="editor" id="brand-form" class="space-y-5" @submit.prevent="saveBrand">
        <UiInput id="brand-name" v-model="editor.name" label="Name" required :error="editor.errors.name" />
        <UiTextarea id="brand-description" v-model="editor.description" label="Description" :rows="2" />

        <fieldset class="space-y-3">
          <legend class="font-medium text-ink-strong mb-2">Token overrides</legend>
          <p v-if="!editor.overrides.length" class="text-sm text-ink-secondary">No overrides: the brand uses every base value.</p>
          <div v-for="(override, index) in editor.overrides" :key="override.key" class="override-row">
            <UiSelect
              :id="`override-token-${override.key}`"
              v-model="override.token"
              label="Token"
              :hide-label="index > 0"
              size="sm"
              placeholder="Choose a token"
              :options="tokenOptions"
            />
            <UiInput
              :id="`override-value-${override.key}`"
              v-model="override.value"
              label="Value"
              :hide-label="index > 0"
              size="sm"
              mono
              :placeholder="tokensByName.get(override.token)?.value ?? ''"
            />
            <UiButton size="sm" variant="ghost" icon="trash-2" icon-only :label="`Remove override ${index + 1}`" @click="editor.overrides.splice(index, 1)" />
          </div>
          <UiButton size="sm" icon="plus" @click="addOverride">Add override</UiButton>
        </fieldset>

        <UiCallout v-if="editor.error" tone="danger" role="alert">{{ editor.error }}</UiCallout>
      </form>
      <template #footer>
        <UiButton @click="editor = null">Cancel</UiButton>
        <UiButton type="submit" form="brand-form" variant="primary" :loading="saving">{{ editor?.id ? 'Save changes' : 'Add brand' }}</UiButton>
      </template>
    </UiDialog>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, defineComponent, h, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiDialog, UiEmptyState, UiInput, UiSelect, UiSpinner, UiSwatch, UiTable, UiTextarea } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Brands and their design-token overrides (GET/POST/PUT/DELETE /api/v1/brands,
 * stored in Elasticsearch). Overrides name tokens from GET /api/v1/tokens.
 * Changing brands needs token:create, token:edit or token:delete; the server
 * checks again.
 */
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const canCreate = computed(() => hasPermission('token:create'));
const canEdit = computed(() => hasPermission('token:edit'));
const canDelete = computed(() => hasPermission('token:delete'));

const brands = ref([]);
const tokens = ref([]);
const loading = ref(true);
const loadError = ref(null);
const selectedId = ref('');

const tokensByName = computed(() => new Map(tokens.value.map((t) => [t.name, t])));
const tokenOptions = computed(() => tokens.value.map((t) => ({ value: t.name, label: t.name })));
const selected = computed(() => brands.value.find((b) => b.id === selectedId.value) ?? null);

const isColour = (value) => /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(String(value).trim());
const colourOverrides = (brand) => brand.tokenOverrides.filter((o) => isColour(o.value));

/** A token value, with a swatch when it is a colour */
const TokenValue = defineComponent({
  props: { value: { type: String, required: true } },
  setup: (props) => () =>
    h('span', { class: 'inline-flex items-center gap-2 font-mono text-sm' }, [
      isColour(props.value) ? h(UiSwatch, { color: props.value, size: 'sm' }) : null,
      props.value,
    ]),
});

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const load = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    const [brandRes, tokenRes] = await Promise.all([apiClient.get('/api/v1/brands'), apiClient.get('/api/v1/tokens')]);
    brands.value = brandRes.data.brands ?? [];
    tokens.value = tokenRes.data.tokens ?? [];
    if (!selected.value) selectedId.value = brands.value[0]?.id ?? '';
  } catch (error) {
    loadError.value = error;
  } finally {
    loading.value = false;
  }
};

const editor = ref(null);
const saving = ref(false);
let nextKey = 0;

const openEditor = (brand) => {
  editor.value = {
    id: brand?.id ?? null,
    originalName: brand?.name ?? '',
    name: brand?.name ?? '',
    description: brand?.description ?? '',
    overrides: (brand?.tokenOverrides ?? []).map((o) => ({ ...o, key: nextKey++ })),
    errors: {},
    error: '',
  };
};

const addOverride = () => {
  editor.value.overrides.push({ token: '', value: '', key: nextKey++ });
};

const saveBrand = async () => {
  const current = editor.value;
  current.errors = {};
  current.error = '';
  if (!current.name.trim()) {
    current.errors.name = 'Enter a name.';
    return;
  }
  const overrides = current.overrides.filter((o) => o.token || o.value.trim());
  if (overrides.some((o) => !o.token || !o.value.trim())) {
    current.error = 'Each override needs a token and a value.';
    return;
  }
  const body = {
    name: current.name.trim(),
    description: current.description.trim(),
    tokenOverrides: overrides.map((o) => ({ token: o.token, value: o.value.trim() })),
  };
  saving.value = true;
  try {
    const { data } = current.id ? await apiClient.put(`/api/v1/brands/${current.id}`, body) : await apiClient.post('/api/v1/brands', body);
    brands.value = [...brands.value.filter((b) => b.id !== data.id), data].sort((a, b) => a.name.localeCompare(b.name));
    selectedId.value = data.id;
    showNotice(current.id ? `Saved ${data.name}.` : `Added ${data.name}.`, 'success');
    editor.value = null;
  } catch (error) {
    current.error = apiErrorMessage(error, "The brand couldn't be saved.");
  } finally {
    saving.value = false;
  }
};

const removeBrand = async (brand) => {
  const confirmed = await askConfirm({
    title: `Delete ${brand.name}?`,
    message: 'Its token overrides are deleted with it. This can’t be undone.',
    confirmText: 'Delete brand',
    danger: true,
  });
  if (!confirmed) return;
  try {
    await apiClient.delete(`/api/v1/brands/${brand.id}`);
    brands.value = brands.value.filter((b) => b.id !== brand.id);
    if (selectedId.value === brand.id) selectedId.value = brands.value[0]?.id ?? '';
    showNotice(`Deleted ${brand.name}.`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, `${brand.name} couldn't be deleted.`), 'error');
  }
};

load();
</script>

<style scoped>
.override-row {
  @apply flex flex-col sm:flex-row sm:items-end gap-3;
}

.override-row > :not(:last-child) {
  @apply flex-1;
}
</style>
