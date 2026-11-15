<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Component composition"
      lead="Build complex components from primitives. Drag primitives onto the canvas, or use their Add buttons, then save the composition to a workspace."
      spot="foundations/component-composition"
      size="tool"
    />

    <PageSection title="Build" description="Add primitives, nest them inside each other, and edit their properties.">
      <template #actions>
        <UiButton
          variant="primary"
          icon="save"
          :label="openedEditable ? 'Save changes' : 'Save'"
          :disabled="composition.length === 0"
          :loading="saving"
          @click="save"
        />
        <UiButton v-if="opened" icon="copy" label="Save as new" :disabled="composition.length === 0" @click="openSaveDialog" />
        <UiButton variant="ghost" icon="x" label="Clear" :disabled="composition.length === 0" @click="clearCanvas" />
      </template>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />
      <p v-if="opened" class="mb-6 text-sm text-ink-secondary">
        Editing <span class="font-semibold text-ink-strong">{{ opened.name }}</span>
        <template v-if="workspaceName(opened.workspaceId)"> in {{ workspaceName(opened.workspaceId) }}</template>
        <template v-if="!openedEditable"> (read-only: save it as a new composition to keep your changes)</template>
      </p>

      <div class="grid lg:grid-cols-4 gap-6">
        <!-- Primitives, templates and layout -->
        <div class="space-y-6">
          <UiPanel title="Primitives">
            <UiSelect v-model="primitiveFilter" label="Show" size="sm" :options="primitiveFilterOptions" class="mb-4" />
            <ul class="space-y-2">
              <li
                v-for="primitive in filteredPrimitives"
                :key="primitive.id"
                class="primitive"
                draggable="true"
                @dragstart="handleDragStart($event, primitive)"
              >
                <AppIcon name="grip-vertical" class="text-base text-ink-muted" />
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-medium text-ink-strong">{{ primitive.name }}</span>
                  <span class="block text-xs text-ink-secondary">{{ primitive.type }}</span>
                </span>
                <UiButton
                  size="sm"
                  variant="ghost"
                  icon="plus"
                  icon-only
                  :label="selectedItem ? `Add ${primitive.name} to ${selectedItem.name}` : `Add ${primitive.name} to the canvas`"
                  @click="addPrimitive(primitive)"
                />
              </li>
            </ul>
          </UiPanel>

          <UiPanel title="Templates">
            <ul class="space-y-2">
              <li v-for="template in templates" :key="template.id">
                <button type="button" class="template" @click="loadTemplate(template)">
                  <span class="block text-sm font-medium text-ink-strong">{{ template.name }}</span>
                  <span class="block text-xs text-ink-secondary">{{ countNodes(template.components) }} components</span>
                </button>
              </li>
            </ul>
          </UiPanel>

          <UiPanel title="Layout">
            <UiRadioChoices v-model="layoutType" aria-label="Top-level layout" :options="layoutOptions" />
          </UiPanel>
        </div>

        <!-- Canvas and preview -->
        <div class="lg:col-span-2 space-y-6">
          <UiPanel title="Canvas" description="Drop a primitive here, or onto an item to nest it.">
            <div class="canvas" :class="{ 'canvas-over': dragOverCanvas }" @drop="handleDrop" @dragover.prevent="dragOverCanvas = true" @dragleave="dragOverCanvas = false">
              <UiEmptyState
                v-if="composition.length === 0"
                title="Nothing on the canvas yet"
                body="Drag primitives here, use their Add buttons, or start from a template or a saved composition."
                spot="foundations/component-composition"
              />
              <ul v-else class="space-y-3">
                <li
                  v-for="(item, index) in composition"
                  :key="item.id"
                  class="canvas-item"
                  :class="{ 'canvas-item-on': selectedItemIndex === index }"
                  @drop="handleNestedDrop($event, index)"
                  @dragover.prevent
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <AppIcon name="grip-vertical" class="text-base text-ink-muted" />
                    <button type="button" class="canvas-item-name" :aria-pressed="selectedItemIndex === index" @click="selectedItemIndex = index">
                      {{ item.name }}
                    </button>
                    <UiChip v-if="item.children?.length" tone="accent">{{ item.children.length }} nested</UiChip>
                    <span class="flex-1 text-xs text-ink-secondary">{{ item.type }}</span>
                    <UiButton size="sm" variant="ghost" icon="settings" icon-only :label="`Edit ${item.name} properties`" @click="selectedItemIndex = index" />
                    <UiButton size="sm" variant="ghost" icon="x" icon-only :label="`Remove ${item.name}`" @click="removeFromComposition(index)" />
                  </div>
                  <dl v-if="item.props && Object.keys(item.props).length" class="canvas-props">
                    <div v-for="(value, key) in item.props" :key="key" class="flex gap-2">
                      <dt class="font-code text-ink">{{ key }}:</dt>
                      <dd class="text-ink-secondary">{{ value }}</dd>
                    </div>
                  </dl>
                  <ul v-if="item.children?.length" class="canvas-children">
                    <li v-for="(child, childIndex) in item.children" :key="child.id ?? childIndex" class="canvas-child">
                      <span class="flex-1">{{ child.name }}</span>
                      <UiButton size="sm" variant="ghost" icon="x" icon-only :label="`Remove ${child.name} from ${item.name}`" @click="item.children.splice(childIndex, 1)" />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </UiPanel>

          <UiPanel title="Live preview">
            <template #actions>
              <UiButton
                size="sm"
                variant="ghost"
                :icon="previewDarkMode ? 'moon' : 'sun'"
                :label="previewDarkMode ? 'Dark' : 'Light'"
                :aria-pressed="previewDarkMode"
                @click="previewDarkMode = !previewDarkMode"
              />
              <UiButton size="sm" variant="ghost" icon="refresh-cw" icon-only label="Refresh preview" @click="refreshPreview" />
            </template>
            <div class="preview-stage" :class="previewDarkMode ? 'bg-surface-inverse dark' : 'bg-surface-sunken'">
              <p v-if="composition.length === 0" class="py-12 text-center text-sm text-ink-muted">The preview appears here</p>
              <div v-else :class="layoutClass">
                <PreviewNode v-for="item in composition" :key="`${item.id}-${previewKey}`" :item="item" />
              </div>
            </div>
          </UiPanel>
        </div>

        <!-- Properties, code and relationships -->
        <div class="space-y-6">
          <UiPanel v-if="selectedItem" :title="`${selectedItem.name} properties`">
            <div class="space-y-3">
              <template v-for="prop in selectedProps" :key="prop.name">
                <UiCheckbox v-if="prop.type === 'boolean'" v-model="selectedItem.props[prop.name]" :label="prop.name" />
                <UiInput
                  v-else-if="prop.type === 'number'"
                  :model-value="selectedItem.props[prop.name]"
                  type="number"
                  :label="prop.name"
                  size="sm"
                  @update:model-value="selectedItem.props[prop.name] = Number($event)"
                />
                <UiInput v-else v-model="selectedItem.props[prop.name]" :label="prop.name" size="sm" />
              </template>
              <p v-if="selectedProps.length === 0" class="text-sm text-ink-secondary">This item has no properties.</p>
            </div>
          </UiPanel>

          <UiPanel title="Generated code">
            <template #actions>
              <UiButton size="sm" variant="ghost" icon="download" label="Export" :disabled="composition.length === 0" @click="exportCode" />
            </template>
            <UiSelect v-model="codeFormat" label="Format" size="sm" :options="codeFormatOptions" class="mb-4" />
            <UiCodeBlock v-if="composition.length > 0" :code="generatedCode" :label="codeFormatLabel" />
            <p v-else class="text-sm text-ink-secondary">Add components to generate code.</p>
          </UiPanel>

          <UiPanel v-if="composition.length > 1" title="Relationships">
            <ul class="space-y-2 text-sm">
              <li v-for="item in composition" :key="item.id" class="relationship">
                <span class="block font-medium text-ink-strong">{{ item.name }}</span>
                <span v-if="item.children?.length" class="block text-xs text-ink-secondary">Contains: {{ item.children.map((c) => c.name).join(', ') }}</span>
              </li>
            </ul>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <PageSection title="Saved compositions" description="Compositions saved to the workspaces you belong to. Open one to keep working on it." divided>
      <template #actions>
        <UiButton size="sm" variant="ghost" icon="refresh-cw" label="Refresh" :loading="loading" @click="load" />
      </template>

      <UiCallout v-if="error" tone="danger" role="alert" class="mb-6">Saved compositions couldn't be loaded. {{ error }}</UiCallout>
      <UiCallout v-else-if="loaded && editableWorkspaces.length === 0" tone="info" role="status" class="mb-6" title="You can't save compositions yet">
        Saving needs editor access to a workspace. Ask a workspace admin to add you as an editor, or create a workspace under Admin, Workspaces.
      </UiCallout>

      <div v-if="loading && !loaded" class="flex justify-center p-8"><UiSpinner label="Loading saved compositions…" /></div>
      <UiEmptyState
        v-else-if="loaded && items.length === 0"
        title="No saved compositions"
        body="Build a composition above and save it to a workspace; it will be listed here."
        spot="foundations/component-composition"
      />
      <UiPanel v-else-if="items.length > 0" flush>
        <ul class="divide-y divide-line">
          <li v-for="saved in items" :key="saved.id" class="saved-row">
            <div class="flex-1 min-w-0">
              <p class="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-strong">
                {{ saved.name }}
                <UiChip v-if="opened?.id === saved.id" tone="accent">Open</UiChip>
              </p>
              <p class="text-xs text-ink-secondary">
                {{ [workspaceName(saved.workspaceId), `${countNodes(saved.components)} components`, saved.layout, `updated ${formatDate(saved.updatedAt || saved.createdAt)}`].filter(Boolean).join(' · ') }}
              </p>
            </div>
            <UiButton size="sm" icon="folder-open" label="Open" :aria-label="`Open ${saved.name}`" @click="openSaved(saved)" />
            <UiButton
              v-if="canEdit(saved)"
              size="sm"
              variant="ghost"
              icon="trash-2"
              icon-only
              :label="`Delete ${saved.name}`"
              @click="deleteSaved(saved)"
            />
          </li>
        </ul>
      </UiPanel>
    </PageSection>

    <UiDialog v-model:open="saveDialogOpen" title="Save composition" size="sm">
      <form id="save-composition-form" class="space-y-4" @submit.prevent="saveAsNew">
        <UiInput v-model="saveForm.name" label="Name" required :error="saveFormError" />
        <UiSelect
          v-if="editableWorkspaces.length > 1"
          v-model="saveForm.workspaceId"
          label="Workspace"
          :options="editableWorkspaces.map((ws) => ({ value: ws.id, label: ws.name }))"
          required
        />
        <p v-else-if="editableWorkspaces.length === 1" class="text-sm text-ink-secondary">Saved to {{ editableWorkspaces[0].name }}.</p>
        <UiCallout v-else tone="warning">Saving needs editor access to a workspace.</UiCallout>
      </form>
      <template #footer>
        <UiButton variant="ghost" label="Cancel" @click="saveDialogOpen = false" />
        <UiButton
          variant="primary"
          type="submit"
          form="save-composition-form"
          label="Save"
          :loading="saving"
          :disabled="editableWorkspaces.length === 0"
        />
      </template>
    </UiDialog>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import {
  AppIcon,
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiCodeBlock,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiRadioChoices,
  UiSelect,
  UiSpinner,
} from '../components/ui';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import { useNotice } from '../composables/useNotice.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useResourceLibrary } from '../composables/useResourceLibrary.js';

// ---------- Preview: one recursive renderer, token classes only ----------

const GRID_COLUMNS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' };
const BUTTON_VARIANTS = {
  primary: 'bg-accent text-ink-on-accent hover:bg-accent-hover',
  secondary: 'border border-accent text-accent-text hover:bg-accent-subtle',
  tertiary: 'bg-fill text-ink hover:bg-fill-hover',
};
const BUTTON_SIZES = { small: 'px-2 py-1 text-xs', medium: 'px-4 py-2 text-sm', large: 'px-6 py-3 text-lg' };

const children = (item) => (item.children ?? []).map((child, i) => h(PreviewNode, { item: child, key: child.id ?? i }));
const caption = (text) => h('p', { class: 'mb-2 text-xs font-medium text-ink-secondary' }, text);

const PreviewNode = {
  name: 'PreviewNode',
  props: { item: { type: Object, required: true } },
  setup(props) {
    return () => {
      const { item } = props;
      const p = item.props ?? {};
      switch (item.name) {
        case 'Button':
          return h(
            'button',
            {
              type: 'button',
              class: ['rounded-pill font-medium transition-colors', BUTTON_VARIANTS[p.variant] ?? BUTTON_VARIANTS.primary, BUTTON_SIZES[p.size] ?? BUTTON_SIZES.medium],
              disabled: !!p.disabled,
            },
            p.label || 'Button',
          );
        case 'Input':
          return h('input', {
            type: p.type || 'text',
            placeholder: p.placeholder || 'Enter text…',
            'aria-label': p.placeholder || 'Preview input',
            class: 'w-full rounded-field border border-line-control bg-surface-control px-3 py-2 text-sm text-ink placeholder:text-ink-muted',
          });
        case 'Text':
          return h('p', { class: 'text-sm text-ink' }, p.content || 'Text content');
        case 'Card':
          return h('div', { class: 'rounded-tile border border-line bg-surface-raised p-4' }, [
            h('p', { class: 'mb-2 text-sm font-semibold text-ink-strong' }, p.title || 'Card title'),
            h('p', { class: 'text-xs text-ink-secondary' }, p.content || 'Card content'),
            item.children?.length ? h('div', { class: 'mt-3 space-y-2' }, children(item)) : null,
          ]);
        case 'Modal':
          return h('div', { class: 'rounded-tile border border-line bg-surface-overlay p-4 shadow-overlay' }, [
            h('div', { class: 'mb-2 flex items-center justify-between' }, [
              h('p', { class: 'text-sm font-semibold text-ink-strong' }, p.title || 'Modal'),
              h(AppIcon, { name: 'x', class: 'text-base text-ink-muted' }),
            ]),
            h('p', { class: 'text-xs text-ink-secondary' }, p.content || 'Modal content'),
            item.children?.length ? h('div', { class: 'mt-3 space-y-2' }, children(item)) : null,
          ]);
        case 'Form':
          return h('form', { class: 'space-y-3 rounded-tile border border-line bg-surface-raised p-4', onSubmit: (e) => e.preventDefault() }, [caption('Form'), ...children(item)]);
        case 'Container':
          return h('div', { class: 'rounded-tile border border-line bg-surface-sunken p-4' }, [caption('Container'), h('div', { class: 'space-y-2' }, children(item))]);
        case 'Stack':
          return h('div', { class: 'flex flex-col gap-2 rounded-control bg-fill-subtle p-2' }, [caption('Stack'), ...children(item)]);
        case 'Grid':
          return h('div', { class: ['grid gap-2 rounded-control bg-fill-subtle p-2', GRID_COLUMNS[p.columns] ?? GRID_COLUMNS[3]] }, [
            h('p', { class: 'col-span-full text-xs font-medium text-ink-secondary' }, 'Grid'),
            ...children(item),
          ]);
        default:
          return h('div', { class: 'rounded-control border border-line bg-fill-subtle p-3 text-xs text-ink' }, item.name);
      }
    };
  },
};

// ---------- Building ----------

const primitives = [
  { id: 1, name: 'Button', type: 'component', props: { label: 'Click me', variant: 'primary', size: 'medium' } },
  { id: 2, name: 'Card', type: 'component', props: { padding: 'medium', shadow: true } },
  { id: 3, name: 'Input', type: 'component', props: { placeholder: 'Enter text', type: 'text' } },
  { id: 4, name: 'Text', type: 'element', props: { content: 'Text content' } },
  { id: 5, name: 'Container', type: 'layout', props: { maxWidth: 'lg', padding: true } },
  { id: 6, name: 'Stack', type: 'layout', props: { direction: 'vertical', gap: 'medium' } },
  { id: 7, name: 'Grid', type: 'layout', props: { columns: 3, gap: 'medium' } },
  { id: 8, name: 'Modal', type: 'component', props: { title: 'Modal title', isOpen: false } },
  { id: 9, name: 'Form', type: 'component', props: { onSubmit: 'handleSubmit' } },
];

const templates = [
  {
    id: 1,
    name: 'Login form',
    components: [
      {
        name: 'Form', type: 'component', props: {}, children: [
          { name: 'Input', type: 'component', props: { placeholder: 'Email' } },
          { name: 'Input', type: 'component', props: { placeholder: 'Password', type: 'password' } },
          { name: 'Button', type: 'component', props: { label: 'Log in' } },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Card with actions',
    components: [
      {
        name: 'Card', type: 'component', props: {}, children: [
          { name: 'Text', type: 'element', props: { content: 'Card title' } },
          { name: 'Text', type: 'element', props: { content: 'Card description' } },
          { name: 'Button', type: 'component', props: { label: 'Action' } },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Data table',
    components: [
      {
        name: 'Container', type: 'layout', props: {}, children: [
          { name: 'Input', type: 'component', props: { placeholder: 'Search…' } },
          { name: 'Grid', type: 'layout', props: { columns: 3 } },
        ],
      },
    ],
  },
];

const primitiveFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'component', label: 'Components' },
  { value: 'layout', label: 'Layouts' },
  { value: 'element', label: 'Elements' },
];
const layoutOptions = [
  { value: 'stack', label: 'Stack (vertical)' },
  { value: 'flex', label: 'Flex (horizontal)' },
  { value: 'grid', label: 'Grid' },
];
const codeFormatOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'html', label: 'HTML' },
];

const previewDarkMode = ref(false);
const composition = ref([]);
const draggedItem = ref(null);
const dragOverCanvas = ref(false);
const selectedItemIndex = ref(null);
const primitiveFilter = ref('all');
const layoutType = ref('stack');
const codeFormat = ref('vue');
const previewKey = ref(0);
let idCounter = 0;

const filteredPrimitives = computed(() =>
  primitiveFilter.value === 'all' ? primitives : primitives.filter((p) => p.type === primitiveFilter.value),
);
const selectedItem = computed(() => (selectedItemIndex.value === null ? null : composition.value[selectedItemIndex.value] ?? null));
const selectedProps = computed(() =>
  Object.entries(selectedItem.value?.props ?? {}).map(([name, value]) => ({ name, type: typeof value })),
);

/** A fresh canvas node from a primitive or a stored node, with new ids all the way down */
const instantiate = (node) => ({
  id: ++idCounter,
  name: node.name,
  type: node.type,
  props: { ...(node.props ?? {}) },
  children: (node.children ?? []).map(instantiate),
});

/** Nodes as stored: no canvas ids */
const serialize = (nodes) => nodes.map(({ name, type, props, children: kids }) => ({ name, type, props: { ...props }, children: serialize(kids ?? []) }));

const countNodes = (nodes) => (Array.isArray(nodes) ? nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0) : 0);

const handleDragStart = (event, primitive) => {
  draggedItem.value = primitive;
  event.dataTransfer.effectAllowed = 'copy';
};

const handleDrop = (event) => {
  event.preventDefault();
  dragOverCanvas.value = false;
  if (!draggedItem.value) return;
  composition.value.push(instantiate(draggedItem.value));
  draggedItem.value = null;
};

const handleNestedDrop = (event, parentIndex) => {
  event.preventDefault();
  event.stopPropagation();
  dragOverCanvas.value = false;
  if (!draggedItem.value) return;
  composition.value[parentIndex].children.push(instantiate(draggedItem.value));
  draggedItem.value = null;
};

/** The keyboard path: into the selected item, or onto the canvas */
const addPrimitive = (primitive) => {
  if (selectedItem.value) selectedItem.value.children.push(instantiate(primitive));
  else composition.value.push(instantiate(primitive));
};

const removeFromComposition = (index) => {
  composition.value.splice(index, 1);
  if (selectedItemIndex.value === index) selectedItemIndex.value = null;
  else if (selectedItemIndex.value > index) selectedItemIndex.value--;
};

const clearCanvas = () => {
  composition.value = [];
  selectedItemIndex.value = null;
  opened.value = null;
};

const loadTemplate = (template) => {
  composition.value = template.components.map(instantiate);
  selectedItemIndex.value = null;
  opened.value = null;
};

const refreshPreview = () => {
  previewKey.value++;
};

watch([composition, layoutType], refreshPreview, { deep: true });

const layoutClass = computed(
  () => ({ flex: 'flex flex-wrap gap-4', grid: 'grid grid-cols-3 gap-4' })[layoutType.value] ?? 'flex flex-col gap-4',
);

// ---------- Code ----------

const codeFormatLabel = computed(() => codeFormatOptions.find((f) => f.value === codeFormat.value)?.label ?? 'Code');

const generatedCode = computed(() => {
  const itemCode = (item, indent = 0) => {
    const pad = '  '.repeat(indent);
    const props = Object.entries(item.props ?? {})
      .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : typeof v === 'boolean' ? (v ? k : '') : `:${k}="${v}"`))
      .filter(Boolean)
      .join(' ');
    const open = `${item.name}${props ? ` ${props}` : ''}`;
    if (item.children?.length) {
      return `${pad}<${open}>\n${item.children.map((c) => itemCode(c, indent + 1)).join('\n')}\n${pad}</${item.name}>`;
    }
    return codeFormat.value === 'html' ? `${pad}<${open}></${item.name}>` : `${pad}<${open} />`;
  };
  return composition.value.map((item) => itemCode(item)).join('\n\n');
});

const exportCode = () => {
  const extension = { vue: 'vue', react: 'jsx', html: 'html' }[codeFormat.value];
  const url = URL.createObjectURL(new Blob([generatedCode.value], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${opened.value?.name?.replace(/[^\w-]+/g, '-') || 'composition'}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
};

// ---------- Saved compositions (workspace items of kind "compositions") ----------

const { items, editableWorkspaces, loading, loaded, error, load, canEdit, workspaceName, create, update, remove } = useResourceLibrary('compositions');
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

/** The saved composition on the canvas, if one was opened or saved */
const opened = ref(null);
const openedEditable = computed(() => !!opened.value && canEdit(opened.value));
const saving = ref(false);
const saveDialogOpen = ref(false);
const saveForm = reactive({ name: '', workspaceId: '' });
const saveFormError = ref('');

const openSaveDialog = () => {
  saveForm.name = opened.value ? `${opened.value.name} (copy)` : `Composition ${items.value.length + 1}`;
  saveForm.workspaceId = editableWorkspaces.value[0]?.id ?? '';
  saveFormError.value = '';
  saveDialogOpen.value = true;
};

/** Save: updates the opened composition when the user may change it, otherwise asks where to save a new one */
const save = async () => {
  if (!openedEditable.value) {
    openSaveDialog();
    return;
  }
  saving.value = true;
  try {
    opened.value = await update(opened.value, { components: serialize(composition.value), layout: layoutType.value });
    showNotice(`Saved ${opened.value.name}.`, 'success');
  } catch (err) {
    showNotice(err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const saveAsNew = async () => {
  const name = saveForm.name.trim();
  if (!name) {
    saveFormError.value = 'Enter a name.';
    return;
  }
  const workspaceId = editableWorkspaces.value.length === 1 ? editableWorkspaces.value[0].id : saveForm.workspaceId;
  if (!workspaceId) return;
  saving.value = true;
  try {
    opened.value = await create(workspaceId, { name, layout: layoutType.value, components: serialize(composition.value) });
    saveDialogOpen.value = false;
    showNotice(`Saved ${name} to ${workspaceName(workspaceId) ?? 'the workspace'}.`, 'success');
  } catch (err) {
    saveFormError.value = err.message;
  } finally {
    saving.value = false;
  }
};

const openSaved = (saved) => {
  composition.value = (saved.components ?? []).map(instantiate);
  layoutType.value = saved.layout || 'stack';
  selectedItemIndex.value = null;
  opened.value = saved;
  showNotice(`Opened ${saved.name}.`, 'info');
};

const deleteSaved = async (saved) => {
  const ok = await askConfirm({ title: `Delete ${saved.name}?`, message: 'The saved composition is removed from its workspace.', confirmText: 'Delete', danger: true });
  if (!ok) return;
  try {
    await remove(saved);
    if (opened.value?.id === saved.id) opened.value = null;
    showNotice(`Deleted ${saved.name}.`, 'success');
  } catch (err) {
    showNotice(err.message, 'error');
  }
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

onMounted(load);
</script>

<style scoped>
.primitive {
  @apply flex items-center gap-2 rounded-control border border-line bg-surface-sunken px-3 py-2 cursor-move transition-colors hover:border-accent-border;
}
.template {
  @apply w-full rounded-control border border-line bg-surface-sunken px-3 py-2 text-left transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.canvas {
  @apply min-h-96 rounded-tile border-2 border-dashed border-line p-4 transition-colors;
}
.canvas-over {
  @apply border-accent-border bg-accent-subtle;
}
.canvas-item {
  @apply rounded-tile border border-line bg-surface-sunken p-4;
}
.canvas-item-on {
  @apply border-accent-border bg-accent-subtle;
}
.canvas-item-name {
  @apply rounded-control text-sm font-medium text-ink-strong hover:underline underline-offset-4;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.canvas-props {
  @apply mt-2 space-y-0.5 rounded-control bg-fill-subtle p-2 text-xs;
}
.canvas-children {
  @apply mt-3 ml-4 space-y-2 border-l-2 border-line pl-3;
}
.canvas-child {
  @apply flex items-center gap-2 rounded-control bg-fill-subtle px-2 py-1 text-xs text-ink;
}
.preview-stage {
  @apply min-h-48 rounded-tile p-6;
}
.relationship {
  @apply rounded-control bg-surface-sunken p-2;
}
.saved-row {
  @apply flex flex-wrap items-center gap-3 px-6 py-4;
}
</style>
