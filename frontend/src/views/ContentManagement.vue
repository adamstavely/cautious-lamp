<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Component and pattern lifecycle management"
      lead="Add components and patterns to the library, and move them through their lifecycle."
      spot="admin/content-management"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="tabs" label="Lifecycle management">
      <template #create>
        <UiPanel title="Add to the library">
          <UiEmptyState
            v-if="!contentTypeOptions.length"
            :bordered="false"
            title="You can't add components or patterns"
            body="Adding a component needs component:create, and adding a pattern needs pattern:create. Ask an administrator for the permission you need."
          />
          <form v-else class="space-y-6" @submit.prevent="handleCreateSubmit">
            <UiSegmented v-model="newItem.type" label="Content type" :options="contentTypeOptions" />
            <p class="-mt-4 text-sm text-ink-secondary">
              {{
                newItem.type === 'component'
                  ? 'Adds a component record to the component library. Its documentation page is written separately.'
                  : 'Adds a pattern to the patterns library.'
              }}
            </p>

            <UiInput id="name" v-model="newItem.name" label="Name" required :error="errors.name" placeholder="e.g. Stepper" />

            <UiInput
              v-if="newItem.type === 'component'"
              id="componentId"
              v-model="newItem.id"
              label="Component id"
              mono
              :error="errors.id"
              :placeholder="toComponentId(newItem.name) || 'stepper'"
              hint="Lowercase letters, numbers and hyphens. Left empty, it's made from the name."
            />

            <UiTextarea id="description" v-model="newItem.description" label="Description" required :error="errors.description" :rows="3" />

            <UiSelect
              v-if="newItem.type === 'pattern'"
              id="category"
              v-model="newItem.category"
              label="Category"
              required
              placeholder="Select a category"
              :error="errors.category"
              :options="PATTERN_CATEGORIES"
            />

            <UiSelect id="status" v-model="newItem.status" label="Status" required :options="STATUS_OPTIONS" />

            <div class="flex gap-3 pt-2">
              <UiButton type="submit" variant="primary" :loading="creating">Add {{ newItem.type }}</UiButton>
              <UiButton @click="resetForm">Reset</UiButton>
            </div>
          </form>
        </UiPanel>
      </template>

      <template #manage>
        <div class="space-y-6">
          <UiPanel title="Components" flush>
            <UiSpinner v-if="loadingComponents && !components.length" label="Loading components…" class="p-6" />
            <UiCallout v-else-if="componentsError" tone="danger" title="Components couldn't be loaded" role="alert" class="m-6">
              {{ apiErrorMessage(componentsError) }}
            </UiCallout>
            <UiEmptyState v-else-if="!components.length" :bordered="false" title="No components yet" />
            <UiTable v-else caption="Components and their lifecycle status">
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Id</th>
                  <th scope="col">Status</th>
                  <th v-if="canEditComponents" scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="component in components" :key="component.id">
                  <th scope="row" class="whitespace-nowrap font-medium text-ink-strong">{{ component.name }}</th>
                  <td class="whitespace-nowrap font-mono text-sm text-ink-secondary">{{ component.id }}</td>
                  <td class="whitespace-nowrap"><UiChip :tone="statusTone(component.status)">{{ statusLabel(component.status) }}</UiChip></td>
                  <td v-if="canEditComponents" class="whitespace-nowrap">
                    <UiButton size="sm" icon="pencil" @click="editItem('component', component)">Edit<span class="sr-only"> {{ component.name }}</span></UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>

          <UiPanel title="Patterns" flush>
            <UiSpinner v-if="loadingPatterns && !patterns.length" label="Loading patterns…" class="p-6" />
            <UiCallout v-else-if="patternsError" tone="danger" title="Patterns couldn't be loaded" role="alert" class="m-6">
              {{ apiErrorMessage(patternsError) }}
            </UiCallout>
            <UiEmptyState v-else-if="!patterns.length" :bordered="false" title="No patterns yet" />
            <UiTable v-else caption="Patterns and their lifecycle status">
              <thead>
                <tr>
                  <th scope="col">Pattern</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th v-if="canEditPatterns" scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pattern in patterns" :key="pattern.id">
                  <th scope="row" class="whitespace-nowrap font-medium text-ink-strong">{{ pattern.name }}</th>
                  <td class="whitespace-nowrap text-ink-secondary">{{ categoryLabel(pattern.category) }}</td>
                  <td class="whitespace-nowrap"><UiChip :tone="statusTone(pattern.status)">{{ statusLabel(pattern.status) }}</UiChip></td>
                  <td v-if="canEditPatterns" class="whitespace-nowrap">
                    <UiButton size="sm" icon="pencil" @click="editItem('pattern', pattern)">Edit<span class="sr-only"> {{ pattern.name }}</span></UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </div>
      </template>
    </UiTabs>

    <!-- Edit status -->
    <UiDialog :open="!!editing" title="Edit status" size="sm" @update:open="(open) => { if (!open) closeEditModal(); }">
      <div v-if="editing" class="space-y-5">
        <div>
          <div class="font-semibold text-ink-strong">{{ editing.item.name }}</div>
          <div class="text-sm text-ink-secondary">{{ editing.type === 'component' ? 'Component' : 'Pattern' }}</div>
        </div>
        <UiSelect id="editStatus" v-model="editing.status" label="Status" required :options="STATUS_OPTIONS" />
        <UiCallout v-if="editing.error" tone="danger" role="alert">{{ editing.error }}</UiCallout>
      </div>
      <template #footer>
        <UiButton @click="closeEditModal">Cancel</UiButton>
        <UiButton variant="primary" :loading="saving" @click="saveStatusChange">Save changes</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useAuth } from '../composables/useAuth.js';
import {
  PATTERN_CATEGORIES,
  STATUS_OPTIONS,
  categoryLabel,
  statusLabel,
  statusTone,
  toComponentId,
  useComponentPatternStatus,
} from '../composables/useComponentPatternStatus.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiTable,
  UiTabs,
  UiTextarea,
} from '../components/ui';

/**
 * Adds components (POST /api/v1/components, component:create) and patterns
 * (POST /patterns-library/patterns, pattern:create) to the library, and
 * changes their status (component:edit, pattern:edit). The server checks
 * every permission again.
 */
const {
  components,
  patterns,
  loadingComponents,
  loadingPatterns,
  componentsError,
  patternsError,
  loadComponents,
  loadPatterns,
  updateComponentStatus,
  updatePatternStatus,
  upsertComponent,
  upsertPattern,
} = useComponentPatternStatus();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const canEditComponents = computed(() => hasPermission('component:edit'));
const canEditPatterns = computed(() => hasPermission('pattern:edit'));

const activeTab = ref('create');
const tabs = [
  { value: 'create', label: 'Add new', icon: 'circle-plus' },
  { value: 'manage', label: 'Manage existing', icon: 'list' },
];

const contentTypeOptions = computed(() => [
  ...(hasPermission('component:create') ? [{ value: 'component', label: 'Component', icon: 'blocks' }] : []),
  ...(hasPermission('pattern:create') ? [{ value: 'pattern', label: 'Pattern', icon: 'layout-template' }] : []),
]);

const blankItem = () => ({
  type: contentTypeOptions.value[0]?.value ?? 'component',
  name: '',
  id: '',
  description: '',
  category: '',
  status: 'in-progress',
});

const newItem = ref(blankItem());
const errors = reactive({});
const creating = ref(false);

// Permissions can arrive after the page opens
watch(contentTypeOptions, (options) => {
  if (!options.some((o) => o.value === newItem.value.type) && options.length) newItem.value.type = options[0].value;
});

const resetForm = () => {
  newItem.value = blankItem();
  Object.keys(errors).forEach((key) => delete errors[key]);
};

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);
  const item = newItem.value;
  if (!item.name.trim()) errors.name = 'Enter a name.';
  if (!item.description.trim()) errors.description = 'Enter a description.';
  if (item.type === 'component') {
    const id = item.id.trim() || toComponentId(item.name);
    if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(id)) errors.id = 'Use lowercase letters, numbers and hyphens.';
  }
  if (item.type === 'pattern' && !item.category) errors.category = 'Choose a category.';
  return Object.keys(errors).length === 0;
};

const handleCreateSubmit = async () => {
  if (!validate()) return;
  const item = newItem.value;
  creating.value = true;
  try {
    if (item.type === 'component') {
      const { data } = await apiClient.post('/api/v1/components', {
        id: item.id.trim() || toComponentId(item.name),
        name: item.name.trim(),
        description: item.description.trim(),
        status: item.status,
      });
      upsertComponent(data);
      showNotice(`Added ${data.name} to the component library.`, 'success');
    } else {
      const { data } = await apiClient.post('/patterns-library/patterns', {
        name: item.name.trim(),
        description: item.description.trim(),
        category: item.category,
        status: item.status,
      });
      upsertPattern(data);
      showNotice(`Added ${data.name} to the patterns library.`, 'success');
    }
    resetForm();
    activeTab.value = 'manage';
  } catch (error) {
    showNotice(apiErrorMessage(error, `The ${item.type} couldn't be added.`), 'error');
  } finally {
    creating.value = false;
  }
};

const editing = ref(null);
const saving = ref(false);

const editItem = (type, item) => {
  editing.value = { type, item, status: item.status, error: '' };
};

const closeEditModal = () => {
  editing.value = null;
};

const saveStatusChange = async () => {
  if (!editing.value) return;
  const { type, item, status } = editing.value;
  saving.value = true;
  try {
    if (type === 'component') await updateComponentStatus(item.id, status);
    else await updatePatternStatus(item.id, status);
    showNotice(`${item.name} is now ${statusLabel(status).toLowerCase()}.`, 'success');
    closeEditModal();
  } catch (error) {
    editing.value.error = apiErrorMessage(error, `${item.name}'s status couldn't be saved.`);
  } finally {
    saving.value = false;
  }
};

loadComponents();
loadPatterns();
</script>
