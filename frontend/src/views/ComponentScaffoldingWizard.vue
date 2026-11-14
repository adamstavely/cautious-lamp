<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Component scaffolding wizard"
      lead="Create new Stencil.js web components with our interactive wizard. Generate production-ready components with tests, documentation, and framework integrations."
      spot="foundations/component-scaffolding-wizard"
      size="tool"
    />

    <PageSection>
      <!-- Step indicator -->
      <nav aria-label="Wizard progress" class="mb-8">
        <ol class="flex items-center gap-2">
          <li v-for="(step, index) in steps" :key="step.key" class="flex items-center flex-1 last:flex-none gap-2" :aria-current="currentStep === index ? 'step' : undefined">
            <span
              class="step-dot"
              :class="currentStep > index ? 'step-dot-done' : currentStep === index ? 'step-dot-current' : 'step-dot-todo'"
            >
              <span v-if="currentStep > index" class="material-symbols-outlined text-lg" aria-hidden="true">check</span>
              <span v-else aria-hidden="true">{{ index + 1 }}</span>
            </span>
            <span class="text-sm font-medium hidden sm:inline" :class="currentStep >= index ? 'text-ink-strong' : 'text-ink-muted'">
              <span class="sr-only">Step {{ index + 1 }}: </span>{{ step.title }}<span v-if="currentStep > index" class="sr-only"> (done)</span>
            </span>
            <span v-if="index < steps.length - 1" class="step-line" :class="currentStep > index ? 'bg-accent' : 'bg-fill-strong'" aria-hidden="true"></span>
          </li>
        </ol>
      </nav>

      <UiPanel>
        <!-- Getting started guide -->
        <div class="guide">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-2xl text-accent-text" aria-hidden="true">auto_awesome</span>
            <div class="flex-1 flex flex-col gap-4">
              <div>
                <h2 class="text-lg font-semibold text-ink-strong">How to use this wizard</h2>
                <p class="text-sm text-ink-secondary">
                  This wizard generates production-ready Stencil.js web components. Follow these 4 simple steps to create your component:
                </p>
              </div>
              <ol class="flex flex-col gap-3">
                <li v-for="(item, index) in guideSteps" :key="item.title" class="flex items-start gap-3">
                  <span class="guide-number" aria-hidden="true">{{ index + 1 }}</span>
                  <div>
                    <p class="text-sm font-medium text-ink-strong">{{ item.title }}</p>
                    <p class="text-xs text-ink-secondary">{{ item.body }}</p>
                  </div>
                </li>
              </ol>
              <UiCallout title="Quick example: to create a button component">
                <ol class="text-xs flex flex-col gap-1 ml-4 list-decimal">
                  <li>Name: "MyButton", Category: "Form"</li>
                  <li>Add property: name="variant", type="enum", options="primary,secondary"</li>
                  <li>Add property: name="disabled", type="boolean", default="false"</li>
                  <li>Add event: name="buttonClick" (optional)</li>
                  <li>Click "Generate" and review the code</li>
                </ol>
              </UiCallout>
            </div>
          </div>
        </div>

        <!-- Step 1: Basic information -->
        <div v-if="currentStep === 0" class="flex flex-col gap-6">
          <div>
            <h2 class="step-title">Basic information</h2>
            <p class="text-sm text-ink-secondary">
              Start by providing basic information about your component. This information will be used to generate the component class name, HTML tag, and documentation.
            </p>
          </div>

          <UiInput
            v-model="componentData.name"
            label="Component name"
            required
            placeholder="e.g., MyButton, DataTable, Modal"
            hint="Use PascalCase (e.g., &quot;MyButton&quot;, &quot;DataTable&quot;). This becomes your TypeScript class name, and is converted to kebab-case for the tag name (e.g., &quot;MyButton&quot; → &quot;my-button&quot;)."
          />

          <UiTextarea
            v-model="componentData.description"
            label="Description"
            :rows="3"
            required
            placeholder="Describe what this component does and when to use it. Example: 'A versatile button component for triggering actions throughout your application. Supports multiple variants, sizes, and states.'"
            hint="Write a clear, concise description of what your component does and when to use it. It is used in the component's JSDoc comments and generated documentation."
          />

          <UiSelect
            v-model="componentData.category"
            label="Category"
            required
            :options="categoryOptions"
            placeholder="Select a category"
            hint="Categories help organize components in the design system: Form (inputs, buttons), Display (text, images), Navigation (menus, links), Feedback (alerts, modals), Layout (containers, grids), Data (tables, lists), or Custom."
          />

          <UiSelect v-model="componentData.status" label="Initial status" :options="statusOptions" placeholder="Select initial status" />

          <UiSelect
            v-model="selectedTemplateId"
            label="Start from template (optional)"
            :options="templateOptions"
            placeholder="Select a template to start from"
            hint="Templates provide pre-configured properties, events, and styles for common component types (Button, Input, Card, Modal). You can modify all fields after selecting a template."
            @update:model-value="loadTemplate"
          />
        </div>

        <!-- Step 2: Properties -->
        <div v-if="currentStep === 1" class="flex flex-col gap-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex-1 flex flex-col gap-3">
              <h2 class="step-title">Properties</h2>
              <p class="text-sm text-ink-secondary">
                Properties (props) are the inputs your component accepts. They allow parent components to pass data and configure behavior.
              </p>
              <UiCallout title="Tip">
                In Stencil.js, props are defined with the <UiCode>@Prop()</UiCode> decorator. Props can be reflected to HTML attributes, made mutable, and have default values.
              </UiCallout>
            </div>
            <UiButton variant="primary" icon="add" label="Add property" @click="addProperty" />
          </div>

          <div class="flex flex-col gap-4">
            <fieldset v-for="(prop, index) in componentData.props" :key="index" class="item-card">
              <legend class="sr-only">Property {{ index + 1 }}</legend>
              <div class="flex items-start justify-between">
                <p class="font-semibold text-ink-strong" aria-hidden="true">Property {{ index + 1 }}</p>
                <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Remove property ${index + 1}`" @click="removeProperty(index)" />
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput v-model="prop.name" label="Name (camelCase)" required placeholder="e.g., variant, size, disabled" hint="Use camelCase (e.g., &quot;variant&quot;, &quot;isDisabled&quot;)" />
                <UiSelect v-model="prop.type" label="Type" required :options="propTypeOptions" placeholder="Select type" hint="Choose &quot;enum&quot; for predefined options" />
              </div>

              <UiInput
                v-if="prop.type === 'enum'"
                :model-value="prop.optionsString"
                label="Options (comma-separated)"
                required
                placeholder="primary, secondary, tertiary"
                hint="Separate values with commas. These become TypeScript union types (e.g., 'primary' | 'secondary' | 'tertiary')"
                @update:model-value="(value) => { prop.optionsString = value; updatePropOptions(index, value); }"
              />

              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput v-model="prop.defaultValue" label="Default value" />
                <UiInput v-model="prop.description" label="Description" />
              </div>

              <div class="grid sm:grid-cols-3 gap-4">
                <UiCheckbox v-model="prop.required" label="Required" hint="Makes the prop required. TypeScript will mark it as non-optional." />
                <UiCheckbox v-model="prop.reflect" label="Reflect to attribute" hint="Prop changes are reflected to the HTML attribute. Useful for CSS selectors and accessibility." />
                <UiCheckbox v-model="prop.mutable" label="Mutable" hint="Allows the prop to be modified from within the component. By default, props are immutable (read-only)." />
              </div>
            </fieldset>

            <template v-if="componentData.props.length === 0">
              <UiEmptyState
                title="No properties added yet"
                body="Properties are the inputs your component accepts. For example, a button might have &quot;variant&quot; and &quot;size&quot; properties."
              >
                <template #actions>
                  <UiButton variant="primary" icon="add" label="Add your first property" @click="addProperty" />
                </template>
              </UiEmptyState>
              <div class="example-well">
                <p class="text-xs font-medium text-ink-strong">Example: add a "variant" property</p>
                <ul class="text-xs flex flex-col gap-1 ml-4 list-disc text-ink-secondary">
                  <li>Name: <UiCode>variant</UiCode></li>
                  <li>Type: <UiCode>enum</UiCode></li>
                  <li>Options: <UiCode>primary, secondary, tertiary</UiCode></li>
                  <li>Default: <UiCode>primary</UiCode></li>
                </ul>
              </div>
            </template>
          </div>
        </div>

        <!-- Step 3: Events & methods -->
        <div v-if="currentStep === 2" class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="step-title">Events &amp; methods</h2>
            <p class="text-sm text-ink-secondary">
              Events allow your component to communicate with parent components. Methods provide public APIs that can be called from outside the component.
            </p>
            <UiCallout title="Tip">
              Both events and methods are optional. Add them only if your component needs to communicate with parent components or expose public functionality.
            </UiCallout>
          </div>

          <!-- Events -->
          <section class="flex flex-col gap-4" aria-labelledby="wizard-events-heading">
            <div class="flex items-center justify-between">
              <h3 id="wizard-events-heading" class="text-lg font-semibold text-ink-strong">Events</h3>
              <UiButton variant="primary" icon="add" label="Add event" @click="addEvent" />
            </div>

            <fieldset v-for="(event, index) in componentData.events" :key="index" class="item-card">
              <legend class="sr-only">Event {{ index + 1 }}</legend>
              <div class="flex items-start justify-between">
                <p class="font-medium text-ink-strong" aria-hidden="true">Event {{ index + 1 }}</p>
                <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Remove event ${index + 1}`" @click="removeEvent(index)" />
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput v-model="event.name" label="Name (camelCase)" required placeholder="e.g., buttonClick, valueChange" hint="Event name in camelCase. Will be emitted as a CustomEvent." />
                <UiInput v-model="event.detail" label="Detail type (TypeScript)" placeholder="e.g., string, number, { value: string }" hint="TypeScript type for event.detail. Leave empty for no data." />
                <div class="sm:col-span-2">
                  <UiInput v-model="event.description" label="Description" placeholder="When this event is emitted and what it means" />
                </div>
              </div>
            </fieldset>

            <template v-if="componentData.events.length === 0">
              <UiEmptyState
                title="No events added"
                body="Events are optional. Use them to notify parent components when something happens (e.g., button clicked, value changed)."
              />
              <div class="example-well">
                <p class="text-xs font-medium text-ink-strong">Example: add a "buttonClick" event</p>
                <ul class="text-xs flex flex-col gap-1 ml-4 list-disc text-ink-secondary">
                  <li>Name: <UiCode>buttonClick</UiCode></li>
                  <li>Detail type: <UiCode>void</UiCode> (or leave empty)</li>
                  <li>Description: "Emitted when the button is clicked"</li>
                </ul>
              </div>
            </template>
          </section>

          <!-- Methods -->
          <section class="flex flex-col gap-4" aria-labelledby="wizard-methods-heading">
            <div class="flex items-center justify-between">
              <h3 id="wizard-methods-heading" class="text-lg font-semibold text-ink-strong">Methods</h3>
              <UiButton variant="primary" icon="add" label="Add method" @click="addMethod" />
            </div>

            <fieldset v-for="(method, index) in componentData.methods" :key="index" class="item-card">
              <legend class="sr-only">Method {{ index + 1 }}</legend>
              <div class="flex items-start justify-between">
                <p class="font-medium text-ink-strong" aria-hidden="true">Method {{ index + 1 }}</p>
                <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Remove method ${index + 1}`" @click="removeMethod(index)" />
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput v-model="method.name" label="Name (camelCase)" required placeholder="e.g., open, close, reset" hint="Public method name. Can be called from parent components." />
                <UiInput v-model="method.returnType" label="Return type (TypeScript)" placeholder="e.g., void, Promise<string>, boolean" hint="Methods must return Promise. Use &quot;Promise<void>&quot; for no return value." />
                <div class="sm:col-span-2">
                  <UiInput v-model="method.description" label="Description" placeholder="What this method does and when to use it" />
                </div>
              </div>
            </fieldset>

            <template v-if="componentData.methods.length === 0">
              <UiEmptyState
                title="No methods added"
                body="Methods are optional. Use them to expose public functionality that parent components can call (e.g., &quot;open&quot;, &quot;close&quot;, &quot;reset&quot;)."
              />
              <div class="example-well">
                <p class="text-xs font-medium text-ink-strong">Example: add an "open" method</p>
                <ul class="text-xs flex flex-col gap-1 ml-4 list-disc text-ink-secondary">
                  <li>Name: <UiCode>open</UiCode></li>
                  <li>Return type: <UiCode>Promise&lt;void&gt;</UiCode></li>
                  <li>Description: "Opens the component"</li>
                </ul>
              </div>
            </template>
          </section>
        </div>

        <!-- Step 4: Preview & generate -->
        <div v-if="currentStep === 3" class="flex flex-col gap-6">
          <div class="flex flex-col gap-3">
            <h2 class="step-title">Preview &amp; generate</h2>
            <p class="text-sm text-ink-secondary">
              Review your component configuration and generate the Stencil.js code, tests, and documentation.
            </p>
            <UiCallout tone="success" title="What you'll get">
              The wizard generates a complete Stencil.js component file (.tsx), a stylesheet (.css), unit tests (.spec.ts), documentation (Markdown), and a README. All code follows Stencil.js best practices and web component standards.
            </UiCallout>
          </div>

          <div v-if="generatedComponent" class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-ink-strong">Generated files</h3>
              <UiButton :loading="zipping" icon="download" :label="zipping ? 'Zipping...' : 'Download all (.zip)'" :disabled="zipping" @click="downloadAll" />
            </div>
            <UiTabs v-model="activeFile" :tabs="fileTabs" label="Generated files">
              <UiCodeBlock
                :code="getActiveFileContent() || ''"
                :label="fileTabs.find((tab) => tab.value === activeFile)?.label"
                @copied="showNotice('Copied to clipboard.', 'success')"
                @copy-failed="showNotice('Failed to copy to clipboard.', 'error')"
              />
            </UiTabs>

            <UiCallout v-if="createdComponent" tone="success" title="Component created" role="status">
              Registered in the design system as <UiCode>{{ createdComponent.componentId }}</UiCode>
              with {{ createdComponent.files.length }} generated files. Files are not saved on the server; download them here.
              <template #actions>
                <UiButton
                  size="sm"
                  icon="download"
                  :loading="zipping"
                  :disabled="zipping"
                  :label="`Download ${createdComponent.componentId}.zip`"
                  @click="downloadZip(createdComponent.files, createdComponent.componentId)"
                />
              </template>
            </UiCallout>
          </div>

          <UiEmptyState
            v-else
            spot="foundations/component-scaffolding-wizard"
            title="Ready to generate"
            body="Click the button below to generate your Stencil.js component code, tests, and documentation. You'll be able to preview and download all files."
          >
            <template #actions>
              <div class="flex flex-col items-center gap-3">
                <UiButton
                  variant="primary"
                  icon="auto_fix_high"
                  :loading="generating"
                  :label="generating ? 'Generating...' : 'Generate component'"
                  :disabled="generating || !componentData.name || !componentData.description || !componentData.category"
                  @click="generateComponent"
                />
                <p v-if="!componentData.name || !componentData.description || !componentData.category" class="text-xs text-ink-muted">
                  Please complete Step 1 (Basic information) before generating.
                </p>
              </div>
            </template>
          </UiEmptyState>
        </div>

        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <template #footer>
          <UiButton label="Previous" :disabled="currentStep === 0" @click="previousStep" />
          <UiButton v-if="currentStep < steps.length - 1" variant="primary" label="Next" @click="nextStep" />
          <UiButton
            v-else
            variant="primary"
            :loading="creating"
            :label="creating ? 'Creating...' : createdComponent ? 'Created' : 'Create component'"
            :disabled="creating || !!createdComponent || !componentData.name || !componentData.description || !componentData.category"
            @click="createComponent"
          />
        </template>
      </UiPanel>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import JSZip from 'jszip';
import apiClient from '../services/api.js';
import { useNotice } from '../composables/useNotice.js';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiCode,
  UiCodeBlock,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiTabs,
  UiTextarea,
} from '../components/ui';

const SCAFFOLD_API = '/api/v1/component-scaffolding';

const { notice, showNotice, clearNotice } = useNotice();
const currentStep = ref(0);
const selectedTemplateId = ref(null);
const templates = ref([]);
const generatedComponent = ref(null);
const activeFile = ref('component');
const generating = ref(false);
const creating = ref(false);
// { componentId, files: [{ path, content }] } from POST /component-scaffolding/create
const createdComponent = ref(null);
const zipping = ref(false);

const errorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join('; ');
  return message || fallback;
};

const steps = [
  { title: 'Basic Info', key: 'basic' },
  { title: 'Properties', key: 'properties' },
  { title: 'Events & Methods', key: 'events' },
  { title: 'Generate', key: 'generate' },
];

const guideSteps = [
  { title: 'Basic information', body: 'Enter your component name (e.g., "MyButton"), description, and category. Optionally start from a template.' },
  { title: 'Add properties', body: 'Define the inputs your component accepts (e.g., "variant", "size", "disabled"). Click "Add property" for each one.' },
  { title: 'Events & methods (optional)', body: 'Add custom events (e.g., "buttonClick") and public methods (e.g., "open", "close") if needed.' },
  { title: 'Generate & download', body: 'Review the generated code, then click "Create component" to add it to the design system or download the files.' },
];

const fileTabs = [
  { value: 'component', label: 'Component' },
  { value: 'styles', label: 'Styles' },
  { value: 'test', label: 'Test' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'readme', label: 'Readme' },
];

const componentData = reactive({
  name: '',
  description: '',
  category: '',
  status: 'in-progress',
  props: [],
  events: [],
  methods: [],
  slots: ['default'],
  styles: {},
  accessibility: {},
});

const categoryOptions = [
  { value: 'form', label: 'Form' },
  { value: 'display', label: 'Display' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'data', label: 'Data' },
  { value: 'custom', label: 'Custom' },
];

const statusOptions = [
  { value: 'production', label: 'Production Ready' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'experimental', label: 'Experimental' },
];

const propTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
  { value: 'function', label: 'Function' },
  { value: 'date', label: 'Date' },
  { value: 'enum', label: 'Enum' },
];

// Output generated from an earlier configuration no longer matches it
watch(componentData, () => {
  generatedComponent.value = null;
  createdComponent.value = null;
}, { deep: true });

const templateOptions = computed(() => {
  return [
    { value: '', label: 'Start from scratch' },
    ...templates.value.map(t => ({ value: t.id, label: t.name })),
  ];
});

const loadTemplates = async () => {
  try {
    const response = await apiClient.get(`${SCAFFOLD_API}/templates`);
    templates.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    templates.value = [];
    showNotice(errorMessage(error, 'Could not load templates. You can still start from scratch.'), 'warning');
  }
};

const loadTemplate = async (templateId) => {
  if (!templateId) return;
  
  try {
    const template = await apiClient.get(`${SCAFFOLD_API}/templates/${encodeURIComponent(templateId)}`);

    if (template.data) {
      componentData.name = template.data.name;
      componentData.description = template.data.description;
      componentData.category = template.data.category;
      componentData.props = (template.data.defaultProps || []).map(p => ({
        ...p,
        optionsString: p.options?.join(', ') || '',
      }));
      componentData.styles = { ...(template.data.defaultStyles || {}) };
      componentData.slots = [...(template.data.defaultSlots || [])];
      // The configuration changed, so earlier output no longer matches it
      generatedComponent.value = null;
      createdComponent.value = null;
    }
  } catch (error) {
    showNotice(errorMessage(error, 'Could not load that template.'), 'error');
  }
};

const addProperty = () => {
  componentData.props.push({
    name: '',
    type: 'string',
    defaultValue: '',
    required: false,
    reflect: false,
    mutable: false,
    description: '',
    optionsString: '',
  });
};

const removeProperty = (index) => {
  componentData.props.splice(index, 1);
};

const updatePropOptions = (index, value) => {
  componentData.props[index].options = value.split(',').map(v => v.trim()).filter(v => v);
};

const addEvent = () => {
  componentData.events.push({
    name: '',
    detail: '',
    bubbles: true,
    cancelable: true,
    composed: true,
    description: '',
  });
};

const removeEvent = (index) => {
  componentData.events.splice(index, 1);
};

const addMethod = () => {
  componentData.methods.push({
    name: '',
    returnType: 'void',
    parameters: [],
    description: '',
  });
};

const removeMethod = (index) => {
  componentData.methods.splice(index, 1);
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// Props for the API: enum options come from the comma-separated text field
const buildInput = () => ({
  ...componentData,
  props: componentData.props.map(prop => {
    const { optionsString, ...rest } = prop;
    return {
      ...rest,
      options: prop.type === 'enum' && optionsString
        ? optionsString.split(',').map(v => v.trim()).filter(v => v)
        : undefined,
    };
  }),
});

const generateComponent = async () => {
  generating.value = true;
  clearNotice();
  try {
    const response = await apiClient.post(`${SCAFFOLD_API}/scaffold`, buildInput());
    generatedComponent.value = response.data;
    createdComponent.value = null;
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to generate component. Please try again.'), 'error');
  } finally {
    generating.value = false;
  }
};

const createComponent = async () => {
  if (creating.value) return;
  creating.value = true;
  clearNotice();
  try {
    if (!generatedComponent.value) {
      await generateComponent();
      if (!generatedComponent.value) return;
    }
    const response = await apiClient.post(`${SCAFFOLD_API}/create`, buildInput());
    createdComponent.value = {
      componentId: response.data.componentId,
      files: Array.isArray(response.data.files) ? response.data.files : [],
    };
    showNotice(`Component "${response.data.componentId}" was added to the design system.`, 'success');
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to create component. Please try again.'), 'error');
  } finally {
    creating.value = false;
  }
};

const getActiveFileContent = () => {
  if (!generatedComponent.value) return '';
  
  switch (activeFile.value) {
    case 'component':
      return generatedComponent.value.componentCode;
    case 'styles':
      return generatedComponent.value.styleCode || '';
    case 'test':
      return generatedComponent.value.testCode;
    case 'documentation':
      return generatedComponent.value.documentation;
    case 'readme':
      return generatedComponent.value.readme;
    default:
      return '';
  }
};

const kebabName = () => componentData.name
  .trim()
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase()
  .replace(/[-_\s]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'component';

// The same layout the backend returns from /create
const filesFromGenerated = () => {
  const g = generatedComponent.value;
  if (!g) return [];
  const tag = kebabName();
  const files = [
    { path: `src/components/${tag}/${tag}.tsx`, content: g.componentCode },
    { path: `src/components/${tag}/${tag}.css`, content: g.styleCode || '' },
    { path: `src/components/${tag}/${tag}.spec.ts`, content: g.testCode },
    { path: `docs/${tag}.md`, content: g.documentation },
    { path: 'README.md', content: g.readme },
  ];
  if (g.stencilConfig) files.push({ path: 'stencil.config.ts', content: g.stencilConfig });
  return files;
};

const downloadZip = async (files, baseName) => {
  if (!files.length) return;
  zipping.value = true;
  try {
    const zip = new JSZip();
    const folder = zip.folder(baseName);
    files.forEach(file => folder.file(file.path, file.content ?? ''));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch (error) {
    showNotice('Could not build the zip file.', 'error');
  } finally {
    zipping.value = false;
  }
};

const downloadAll = () => {
  if (createdComponent.value) {
    return downloadZip(createdComponent.value.files, createdComponent.value.componentId);
  }
  return downloadZip(filesFromGenerated(), kebabName());
};

onMounted(loadTemplates);
</script>

<style scoped>
.step-dot {
  @apply w-10 h-10 shrink-0 rounded-pill flex items-center justify-center font-semibold transition-colors;
}
.step-dot-done {
  @apply bg-accent text-ink-on-accent;
}
.step-dot-current {
  @apply bg-accent text-ink-on-accent ring-4 ring-accent-subtle;
}
.step-dot-todo {
  @apply bg-fill-strong text-ink-secondary;
}
.step-line {
  @apply flex-1 h-1 rounded-pill;
}
.step-title {
  @apply text-2xl font-bold text-ink-strong mb-2;
}
.guide {
  @apply rounded-tile border border-line bg-surface-sunken p-6;
}
.guide-number {
  @apply shrink-0 w-6 h-6 rounded-pill bg-accent text-ink-on-accent flex items-center justify-center text-xs font-bold;
}
.item-card {
  @apply flex flex-col gap-4 rounded-tile border border-line bg-surface-sunken p-4;
}
.example-well {
  @apply flex flex-col gap-2 rounded-tile border border-line bg-surface-sunken p-3;
}
</style>
