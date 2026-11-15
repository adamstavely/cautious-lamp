<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Documentation generator"
      lead="Generate component documentation from real code: a design-system component, or a Vue single-file component you upload or paste. Props, events and slots are read with Vue's own compiler."
      spot="tools/documentation-generator"
      size="tool"
    />

    <PageSection title="Generate" description="Pick a design-system component, or upload or paste a component, choose what to include, then generate.">
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-1">
          <UiPanel title="Source">
            <div class="space-y-4">
              <UiSpinner v-if="componentsLoading" label="Loading components…" />
              <UiCallout v-else-if="componentsError" tone="danger" title="Couldn't load the components">
                {{ componentsError }}
                <template #actions>
                  <UiButton size="sm" icon="refresh-cw" @click="loadComponents">Try again</UiButton>
                </template>
              </UiCallout>
              <UiSelect
                v-else
                v-model="selectedComponent"
                label="Design-system component"
                placeholder="Choose a component..."
                :options="componentOptions"
                @update:model-value="loadComponent"
              />
              <UiFileDropZone
                label="Or upload a component file"
                accept=".vue,.js,.ts,.jsx,.tsx"
                :file="uploadedFile"
                hint=".vue, or a .js or .ts file with a component definition"
                @select="handleFileUpload"
                @remove="clearUpload"
              />
              <UiTextarea v-model="pastedCode" label="Or paste a Vue component" rows="6" mono />
              <UiButton size="sm" icon="file-code" :disabled="!pastedCode.trim()" @click="usePasted">Use pasted code</UiButton>
            </div>
          </UiPanel>

          <UiPanel title="Generation options">
            <fieldset class="space-y-2">
              <legend class="sr-only">Sections to include</legend>
              <UiCheckbox v-model="options.includeProps" label="Props" />
              <UiCheckbox v-model="options.includeEvents" label="Events" />
              <UiCheckbox v-model="options.includeSlots" label="Slots" />
              <UiCheckbox v-model="options.includeExamples" label="Examples" />
              <UiCheckbox v-model="options.includeAccessibility" label="Accessibility" />
            </fieldset>
          </UiPanel>

          <UiButton variant="primary" class="w-full" :disabled="!sourceDoc" @click="generateDocumentation">
            Generate documentation
          </UiButton>
        </div>

        <div class="space-y-6 lg:col-span-2">
          <InlineNotice v-if="notice" :notice="notice" @dismiss="clearNotice" />

          <UiCallout v-if="sourceDoc?.errors?.length" tone="warning" title="Part of the source couldn't be read">
            <ul class="list-disc pl-5">
              <li v-for="error in sourceDoc.errors" :key="error">{{ error }}</li>
            </ul>
          </UiCallout>

          <template v-if="generatedDocs">
            <UiPanel title="Generated documentation">
              <template #actions>
                <div class="flex items-end gap-2">
                  <UiSelect v-model="outputFormat" label="Format" :options="formatOptions" />
                  <UiButton variant="primary" size="sm" icon="download" @click="downloadDocs">Download</UiButton>
                </div>
              </template>
              <div class="docs-output">
                <UiCodeBlock :code="outputText" :label="formatLabel" @copied="onCopied" @copy-failed="onCopyFailed" />
              </div>
            </UiPanel>

            <UiPanel title="Preview">
              <!-- Sanitised with DOMPurify in renderedMarkdown -->
              <div class="docs-preview" v-html="renderedMarkdown"></div>
            </UiPanel>
          </template>

          <UiEmptyState
            v-else
            title="No documentation generated yet"
            body="Select a component, or upload or paste one, to generate documentation"
            spot="tools/documentation-generator"
          />
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiCodeBlock,
  UiEmptyState,
  UiFileDropZone,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { componentMarkdown, docFromComponent, parseVueComponent } from '../utils/componentDocs.js';

const { notice, showNotice, clearNotice } = useNotice();
const components = ref([]);
const componentsLoading = ref(false);
const componentsError = ref('');
const selectedComponent = ref('');
const uploadedFile = ref(null);
const pastedCode = ref('');
// The parsed source the docs are generated from
const sourceDoc = ref(null);
const outputFormat = ref('markdown');
const generatedDocs = ref('');
const options = ref({
  includeProps: true,
  includeEvents: true,
  includeSlots: true,
  includeExamples: true,
  includeAccessibility: true,
});

const loadComponents = async () => {
  componentsLoading.value = true;
  componentsError.value = '';
  try {
    const { data } = await apiClient.get('/api/v1/components');
    components.value = data.components ?? [];
  } catch (error) {
    componentsError.value = apiErrorMessage(error, 'The component library did not answer.');
  } finally {
    componentsLoading.value = false;
  }
};

const componentOptions = computed(() =>
  [...components.value].sort((a, b) => a.name.localeCompare(b.name)).map((component) => ({ value: component.id, label: component.name })),
);

// Rendered + sanitised HTML. Uploaded files feed straight into the Markdown,
// so marked's output must never reach v-html (or the HTML export) unsanitised.
const renderedMarkdown = computed(() => {
  if (!generatedDocs.value) return '';
  return DOMPurify.sanitize(marked.parse(generatedDocs.value, { async: false }));
});

const docTitle = computed(() => {
  const heading = generatedDocs.value.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : 'Component Documentation';
});

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatOptions = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'vuepress', label: 'VitePress' },
];
const formatLabel = computed(() => formatOptions.find((f) => f.value === outputFormat.value)?.label ?? 'Code');

// What Copy and Download produce for the chosen format.
const outputText = computed(() => {
  if (!generatedDocs.value) return '';
  if (outputFormat.value === 'html') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(docTitle.value)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 0.4em 0.6em; }
  </style>
</head>
<body>
${renderedMarkdown.value}
</body>
</html>`;
  }
  if (outputFormat.value === 'vuepress') {
    const title = docTitle.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `---\ntitle: "${title}"\n---\n\n${generatedDocs.value}`;
  }
  return generatedDocs.value;
});

const loadComponent = () => {
  const component = components.value.find((c) => c.id === selectedComponent.value);
  if (!component) return;
  uploadedFile.value = null;
  sourceDoc.value = docFromComponent(component);
  generateDocumentation();
};

// A .js/.ts file is a component's script on its own: parse it as an SFC's <script>
const asSfc = (code, name) => {
  if (/\.vue$/i.test(name)) return code;
  const lang = (/\.(ts|tsx|jsx)$/i.exec(name)?.[1] ?? 'js').toLowerCase();
  return `<script${lang === 'js' ? '' : ` lang="${lang}"`}>\n${code}\n</${'script'}>`;
};

const useSource = (code, name) => {
  selectedComponent.value = '';
  sourceDoc.value = parseVueComponent(asSfc(code, name), name);
  generateDocumentation();
};

const handleFileUpload = async (file) => {
  if (!/\.(vue|js|ts|jsx|tsx)$/i.test(file.name)) {
    showNotice(`${file.name} isn't a component file. Upload a .vue, .js or .ts file.`, 'error');
    return;
  }
  uploadedFile.value = file;
  try {
    useSource(await (typeof file.text === 'function' ? file.text() : new Response(file).text()), file.name);
    showNotice(`Generated documentation from ${file.name}.`, 'success');
  } catch {
    showNotice(`Could not read ${file.name}.`, 'error');
  }
};

const clearUpload = () => {
  uploadedFile.value = null;
};

const usePasted = () => {
  uploadedFile.value = null;
  useSource(pastedCode.value, 'Component.vue');
};

const generateDocumentation = () => {
  generatedDocs.value = sourceDoc.value ? componentMarkdown(sourceDoc.value, options.value) : '';
};

// Changing what's included regenerates what's shown
watch(options, generateDocumentation, { deep: true });

// UiCodeBlock copies outputText; these report the result
const onCopied = () => showNotice('Copied to clipboard.', 'success');
const onCopyFailed = () => showNotice('Could not copy to the clipboard.', 'error');

const downloadDocs = () => {
  if (!outputText.value) return;
  const extension = outputFormat.value === 'html' ? 'html' : 'md';
  const base = (sourceDoc.value?.name || 'component').replace(/[^\w-]+/g, '-');
  const filename = `${base}.${extension}`;
  const content = outputText.value;

  const blob = new Blob([content], { type: outputFormat.value === 'html' ? 'text/html' : 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

onMounted(loadComponents);
</script>

<style scoped>
.docs-output :deep(pre) {
  @apply max-h-screen overflow-y-auto whitespace-pre-wrap;
}
.docs-preview {
  @apply max-w-none text-ink;
}
.docs-preview :deep(h1) { @apply mb-4 text-3xl font-semibold text-ink-strong; }
.docs-preview :deep(h2) { @apply mb-3 mt-8 text-2xl font-semibold text-ink-strong; }
.docs-preview :deep(h3) { @apply mb-2 mt-6 text-lg font-semibold text-ink-strong; }
.docs-preview :deep(p) { @apply mb-4 leading-relaxed; }
.docs-preview :deep(ul) { @apply mb-4 list-disc space-y-1 pl-6; }
.docs-preview :deep(ol) { @apply mb-4 list-decimal space-y-1 pl-6; }
.docs-preview :deep(a) { @apply text-accent-text underline; }
.docs-preview :deep(strong) { @apply font-semibold text-ink-strong; }
.docs-preview :deep(code) { @apply rounded-control bg-fill px-1 py-0.5 font-code text-sm; }
.docs-preview :deep(pre) { @apply mb-4 overflow-x-auto rounded-tile border border-line bg-surface-sunken p-4; }
.docs-preview :deep(pre code) { @apply bg-transparent p-0; }
.docs-preview :deep(table) { @apply mb-4 w-full border-collapse text-sm; }
.docs-preview :deep(th) { @apply border-b border-line px-3 py-2 text-left font-semibold text-ink-strong; }
.docs-preview :deep(td) { @apply border-b border-line-faint px-3 py-2 align-top; }
</style>
