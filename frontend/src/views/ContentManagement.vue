<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Component and pattern lifecycle management"
      lead="Create new pattern and component pages, and manage statuses throughout their lifecycle."
      spot="admin/content-management"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="tabs" label="Lifecycle management">
      <template #create>
        <UiPanel title="Create new page">
          <form class="space-y-6" @submit.prevent="handleCreateSubmit">
            <UiSegmented v-model="newItem.type" label="Content type" :options="contentTypeOptions" />
            <p class="-mt-4 text-sm text-ink-secondary">
              {{ newItem.type === 'component' ? 'Create a new component page' : 'Create a new pattern page' }}
            </p>

            <UiInput id="name" v-model="newItem.name" label="Name" required placeholder="e.g., Button, Navigation Pattern" />

            <UiSelect
              v-if="newItem.type === 'pattern'"
              id="patternType"
              v-model="newItem.patternType"
              label="Pattern type"
              placeholder="Select pattern type"
              :options="patternTypeOptions"
            />

            <UiInput id="category" v-model="newItem.category" label="Category" placeholder="e.g., Forms, Navigation, Layout" />

            <UiSelect id="status" v-model="newItem.status" label="Status" required :options="statusOptions" />

            <UiInput
              id="icon"
              v-model="newItem.icon"
              label="Icon (Material Symbols name)"
              placeholder="e.g., smart_button, navigation"
              hint="Use Material Symbols icon names. Leave empty for default."
            />

            <UiInput
              id="route"
              v-model="newItem.route"
              label="Route path"
              required
              mono
              :placeholder="newItem.type === 'component' ? '/components/example' : '/patterns/example'"
              hint="URL path for the new page (e.g., /components/button or /patterns/navigation)"
            />

            <div class="flex gap-3 pt-2">
              <UiButton type="submit" variant="primary">Create page</UiButton>
              <UiButton @click="resetForm">Reset</UiButton>
            </div>
          </form>
        </UiPanel>
      </template>

      <template #manage>
        <div class="space-y-6">
          <UiPanel title="Components" flush>
            <UiTable caption="Components and their lifecycle status">
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Status</th>
                  <th scope="col">Version</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="component in components" :key="component.name">
                  <th scope="row" class="whitespace-nowrap">
                    <span class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-accent-text" aria-hidden="true">{{ component.icon }}</span>
                      <span class="font-medium text-ink-strong">{{ component.name }}</span>
                    </span>
                  </th>
                  <td class="whitespace-nowrap"><UiChip :tone="statusTone(component.status)">{{ component.status }}</UiChip></td>
                  <td class="whitespace-nowrap text-ink-secondary">{{ component.version }}</td>
                  <td class="whitespace-nowrap">
                    <UiButton size="sm" icon="edit" @click="editItem('component', component)">Edit<span class="sr-only"> {{ component.name }}</span></UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>

          <UiPanel title="Patterns" flush>
            <UiTable caption="Patterns and their lifecycle status">
              <thead>
                <tr>
                  <th scope="col">Pattern</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Category</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pattern in patterns" :key="pattern.name">
                  <th scope="row" class="whitespace-nowrap">
                    <span class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-accent-text" aria-hidden="true">{{ pattern.icon }}</span>
                      <span class="font-medium text-ink-strong">{{ pattern.name }}</span>
                    </span>
                  </th>
                  <td class="whitespace-nowrap"><UiChip :tone="pattern.type === 'Design Pattern' ? 'accent' : 'info'">{{ pattern.type }}</UiChip></td>
                  <td class="whitespace-nowrap"><UiChip :tone="statusTone(pattern.status)">{{ pattern.status }}</UiChip></td>
                  <td class="whitespace-nowrap text-ink-secondary">{{ pattern.category }}</td>
                  <td class="whitespace-nowrap">
                    <UiButton size="sm" icon="edit" @click="editItem('pattern', pattern)">Edit<span class="sr-only"> {{ pattern.name }}</span></UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </div>
      </template>
    </UiTabs>

    <!-- Edit status -->
    <UiDialog :open="showEditModal" title="Edit status" size="sm" @update:open="(open) => { if (!open) closeEditModal(); }">
      <div v-if="editingItem" class="space-y-5">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-accent-text" aria-hidden="true">{{ editingItem.icon || 'widgets' }}</span>
          <div>
            <div class="font-semibold text-ink-strong">{{ editingItem.name }}</div>
            <div v-if="editingItemType" class="text-sm text-ink-secondary">
              {{ editingItemType === 'component' ? 'Component' : (editingItem.type || 'Pattern') }}
            </div>
          </div>
        </div>
        <UiSelect id="editStatus" v-model="editingItem.status" label="Status" required :options="statusOptions" />
      </div>
      <template #footer>
        <UiButton @click="closeEditModal">Cancel</UiButton>
        <UiButton variant="primary" @click="saveStatusChange">Save changes</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import {
  PageHero,
  PageShell,
  UiButton,
  UiChip,
  UiDialog,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiTable,
  UiTabs,
} from '../components/ui';

const { components, patterns, updateComponentStatus, updatePatternStatus } = useComponentPatternStatus();

const { notice, showNotice, clearNotice } = useNotice();
const activeTab = ref('create');
const tabs = [
  { value: 'create', label: 'Create new', icon: 'add_circle' },
  { value: 'manage', label: 'Manage existing', icon: 'list' },
];
const contentTypeOptions = [
  { value: 'component', label: 'Component', icon: 'widgets' },
  { value: 'pattern', label: 'Pattern', icon: 'pattern' },
];
const patternTypeOptions = [
  { value: 'Design Pattern', label: 'Design Pattern' },
  { value: 'Code Pattern', label: 'Code Pattern' },
];
const showEditModal = ref(false);
const editingItem = ref(null);
const editingItemType = ref(null);

// Form data for creating new items
const newItem = ref({
  type: 'component',
  name: '',
  patternType: '',
  category: '',
  status: 'Production Ready',
  icon: '',
  route: ''
});

// Components and patterns are now loaded from the shared composable

// Status options for dropdowns
const statusOptions = [
  { value: 'Production Ready', label: 'Production Ready' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Planned', label: 'Planned' },
  { value: 'Experimental', label: 'Experimental' },
  { value: 'Sunsetting', label: 'Sunsetting' },
  { value: 'Deprecated', label: 'Deprecated' }
];

const statusTone = (status) =>
  ({
    'Production Ready': 'success',
    'In Progress': 'warning',
    Planned: 'info',
    Experimental: 'accent',
    Sunsetting: 'warning',
    Deprecated: 'danger',
  })[status] || 'neutral';

const resetForm = () => {
  newItem.value = {
    type: 'component',
    name: '',
    patternType: '',
    category: '',
    status: 'Production Ready',
    icon: '',
    route: ''
  };
};

const handleCreateSubmit = () => {
  // In a real app, this would make an API call to create the page
  console.log('Creating new page:', newItem.value);
  
  // Show success message
  showNotice(`Successfully created ${newItem.value.type}: ${newItem.value.name}`, 'success');
  
  // Reset form
  resetForm();
  
  // Switch to manage tab to see the new item
  activeTab.value = 'manage';
};

const updateStatus = (type, name, newStatus) => {
  // Update status using the shared composable
  if (type === 'component') {
    updateComponentStatus(name, newStatus);
  } else if (type === 'pattern') {
    updatePatternStatus(name, newStatus);
  }
  
  // Show success message
  showNotice(`Status updated to ${newStatus}`, 'success');
};

const editItem = (type, item) => {
  editingItemType.value = type;
  // Create a copy with all properties, including type for patterns
  editingItem.value = { 
    ...item,
    type: type === 'component' ? 'component' : item.type || 'Pattern'
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingItem.value = null;
  editingItemType.value = null;
};

const saveStatusChange = () => {
  if (!editingItem.value || !editingItemType.value) return;
  
  // Update status using the shared composable
  if (editingItemType.value === 'component') {
    updateComponentStatus(editingItem.value.name, editingItem.value.status);
  } else if (editingItemType.value === 'pattern') {
    updatePatternStatus(editingItem.value.name, editingItem.value.status);
  }
  
  // Show success message
  showNotice(`Status updated to ${editingItem.value.status}`, 'success');
  
  // Close modal
  closeEditModal();
};
</script>
