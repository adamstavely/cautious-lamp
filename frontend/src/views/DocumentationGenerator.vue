<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Documentation generator"
      lead="Auto-generate component documentation from code comments. Extract props, examples, and usage guidelines automatically."
      spot="tools/documentation-generator"
      size="tool"
    />

    <PageSection title="Generate" description="Pick a bundled component or upload a file, choose what to include, then generate.">
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-1">
          <UiPanel title="Source">
            <div class="space-y-4">
              <UiSelect
                v-model="selectedComponent"
                label="Component"
                placeholder="Choose a component..."
                :options="componentOptions"
                @update:model-value="loadComponent"
              />
              <div>
                <span class="mb-1.5 block text-sm font-medium text-ink">Or upload a component file</span>
                <input
                  id="component-file"
                  ref="fileInput"
                  type="file"
                  accept=".vue,.jsx,.tsx,.js,.ts"
                  class="peer sr-only"
                  aria-describedby="component-file-hint"
                  @change="handleFileUpload"
                />
                <label
                  for="component-file"
                  class="flex w-full cursor-pointer flex-col items-center gap-1 rounded-field border-2 border-dashed border-line-control bg-surface-sunken px-4 py-4 text-center text-ink-secondary transition-colors hover:border-accent-border peer-focus-visible:outline peer-focus-visible:outline-2 outline-focus"
                >
                  <span class="material-symbols-outlined text-2xl" aria-hidden="true">upload</span>
                  <span class="text-sm">Click to upload component file</span>
                </label>
                <p id="component-file-hint" class="mt-1.5 text-xs text-ink-muted">.vue, .jsx, .tsx, .js or .ts</p>
              </div>
            </div>
          </UiPanel>

          <UiPanel title="Generation options">
            <fieldset class="space-y-2">
              <legend class="sr-only">Sections to include</legend>
              <UiCheckbox v-model="options.includeProps" label="Include Props" />
              <UiCheckbox v-model="options.includeExamples" label="Include Examples" />
              <UiCheckbox v-model="options.includeAccessibility" label="Accessibility Info" />
              <UiCheckbox v-model="options.includeChangelog" label="Changelog" />
            </fieldset>
          </UiPanel>

          <UiButton variant="primary" class="w-full" :disabled="!selectedComponent && !uploadedCode" @click="generateDocumentation">
            Generate Documentation
          </UiButton>
        </div>

        <div class="space-y-6 lg:col-span-2">
          <InlineNotice v-if="notice" :notice="notice" @dismiss="clearNotice" />

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
            body="Select a component or upload a file to generate documentation"
            spot="tools/documentation-generator"
          />
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiCodeBlock, UiEmptyState, UiPanel, UiSelect } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
const selectedComponent = ref('');
const uploadedCode = ref('');
const fileInput = ref(null);
const outputFormat = ref('markdown');
const generatedDocs = ref('');
const options = ref({
  includeProps: true,
  includeExamples: true,
  includeAccessibility: true,
  includeChangelog: true
});

// Mock component data with JSDoc comments
const componentData = {
  button: {
    name: 'Button',
    description: 'A versatile button component with multiple variants and sizes.',
    code: `/**
 * Button Component
 * 
 * @component
 * @description A versatile button component with multiple variants and sizes.
 * Supports primary, secondary, and tertiary variants with small, medium, and large sizes.
 * 
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * 
 * @accessibility
 * - Supports keyboard navigation (Enter, Space)
 * - Includes proper ARIA labels
 * - WCAG AA compliant
 */
export default {
  name: 'Button',
  props: {
    /**
     * Button variant style
     * @type {'primary' | 'secondary' | 'tertiary'}
     * @default 'primary'
     */
    variant: {
      type: String,
      default: 'primary'
    },
    /**
     * Button size
     * @type {'sm' | 'md' | 'lg'}
     * @default 'md'
     */
    size: {
      type: String,
      default: 'md'
    },
    /**
     * Whether the button is disabled
     * @type {boolean}
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Button label text
     * @type {string}
     * @required
     */
    label: {
      type: String,
      required: true
    }
  }
}`,
    props: [
      { name: 'variant', type: 'string', default: 'primary', description: 'Button variant style', required: false },
      { name: 'size', type: 'string', default: 'md', description: 'Button size', required: false },
      { name: 'disabled', type: 'boolean', default: false, description: 'Whether the button is disabled', required: false },
      { name: 'label', type: 'string', description: 'Button label text', required: true }
    ],
    examples: [
      { title: 'Primary Button', code: '<Button variant="primary" label="Click me" />' },
      { title: 'Secondary Button', code: '<Button variant="secondary" size="lg" label="Submit" />' }
    ],
    accessibility: {
      keyboard: true,
      aria: true,
      wcag: 'AA'
    }
  }
};

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

const componentOptions = Object.entries(componentData).map(([value, component]) => ({ value, label: component.name }));
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
  if (!selectedComponent.value) return;
  generateDocumentation();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedCode.value = e.target?.result || '';
    // The upload replaces any bundled component selection.
    selectedComponent.value = '';
    generateDocumentation();
    showNotice(`Generated documentation from ${file.name}.`, 'success');
  };
  reader.onerror = () => {
    showNotice(`Could not read ${file.name}.`, 'error');
  };
  reader.readAsText(file);
  // Let the same file be chosen again later.
  event.target.value = '';
};

const generateDocumentation = () => {
  const component = selectedComponent.value ? componentData[selectedComponent.value] : null;
  if (!component && !uploadedCode.value) return;

  let docs = '';

  if (component) {
    docs += `# ${component.name}\n\n`;
    docs += `${component.description}\n\n`;

    if (options.value.includeProps && component.props) {
      docs += `## Props\n\n`;
      docs += `| Name | Type | Default | Required | Description |\n`;
      docs += `|------|------|---------|----------|-------------|\n`;
      component.props.forEach(prop => {
        docs += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.default !== undefined ? `\`${prop.default}\`` : '-'} | ${prop.required ? 'Yes' : 'No'} | ${prop.description || ''} |\n`;
      });
      docs += `\n`;
    }

    if (options.value.includeExamples && component.examples) {
      docs += `## Examples\n\n`;
      component.examples.forEach((example, index) => {
        docs += `### ${example.title}\n\n`;
        docs += `\`\`\`vue\n${example.code}\n\`\`\`\n\n`;
      });
    }

    if (options.value.includeAccessibility && component.accessibility) {
      docs += `## Accessibility\n\n`;
      docs += `- **Keyboard Navigation**: ${component.accessibility.keyboard ? 'Supported' : 'Not supported'}\n`;
      docs += `- **ARIA Attributes**: ${component.accessibility.aria ? 'Included' : 'Not included'}\n`;
      docs += `- **WCAG Compliance**: ${component.accessibility.wcag}\n\n`;
    }

    if (options.value.includeChangelog) {
      docs += `## Changelog\n\n`;
      docs += `### v2.1.0\n`;
      docs += `- Added loading state\n`;
      docs += `- Improved accessibility\n\n`;
      docs += `### v2.0.0\n`;
      docs += `- Breaking: Renamed \`type\` prop to \`variant\`\n`;
      docs += `- Added \`size\` prop\n\n`;
    }
  } else if (uploadedCode.value) {
    // Parse uploaded code
    docs += parseUploadedCode(uploadedCode.value);
  }

  generatedDocs.value = docs;
};

// Text safe inside a Markdown table cell.
const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();

// Index of the brace that closes the one at `open`, or -1.
const matchBrace = (code, open) => {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) return i;
  }
  return -1;
};

const extractPropsBody = (code) => {
  const start = code.search(/(?:\bprops\s*:|defineProps\s*\(\s*)\{/);
  if (start === -1) return null;
  const open = code.indexOf('{', start);
  const close = matchBrace(code, open);
  return close === -1 ? null : code.slice(open + 1, close);
};

// Top-level entries of a props object, with the JSDoc comment above each.
const parsePropEntries = (body) => {
  const entries = [];
  const entryRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(\w+)\s*:\s*/g;
  let m;
  while ((m = entryRegex.exec(body)) !== null) {
    const name = m[2];
    const description = (m[1] || '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter((line) => line && !line.startsWith('@'))
      .join(' ');
    const valueStart = entryRegex.lastIndex;
    if (body[valueStart] === '{') {
      const close = matchBrace(body, valueStart);
      if (close === -1) break;
      entries.push({ name, description, definition: body.slice(valueStart + 1, close), shorthand: false });
      entryRegex.lastIndex = close + 1;
    } else {
      const end = body.slice(valueStart).search(/,|\n|$/);
      entries.push({ name, description, definition: body.slice(valueStart, valueStart + end), shorthand: true });
      entryRegex.lastIndex = valueStart + Math.max(end, 1);
    }
  }
  return entries;
};

const parseUploadedCode = (code) => {
  let docs = '# Component Documentation\n\n';
  
  // Extract component name
  const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
  if (nameMatch) {
    docs += `## ${nameMatch[1]}\n\n`;
  }

  // Extract JSDoc comments
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
  let match;
  while ((match = jsdocRegex.exec(code)) !== null) {
    const jsdoc = match[1];
    const descriptionMatch = jsdoc.match(/@description\s+(.+)/);
    if (descriptionMatch) {
      docs += `${descriptionMatch[1]}\n\n`;
    }
  }

  // Extract props: the balanced { ... } after `props:` (or defineProps({ ... })),
  // then each top-level `name: { ... }` / `name: Type` entry in it.
  const propsBody = extractPropsBody(code);
  if (propsBody !== null && options.value.includeProps) {
    docs += `## Props\n\n`;
    docs += `| Name | Type | Default | Required | Description |\n`;
    docs += `|------|------|---------|----------|-------------|\n`;
    for (const prop of parsePropEntries(propsBody)) {
      const def = prop.definition;
      const typeMatch = def.match(/type:\s*(\[[^\]]*\]|[\w.|]+)/) || (prop.shorthand ? [null, def.trim()] : null);
      const defaultMatch = def.match(/default:\s*([^,\n]+)/);
      const requiredMatch = def.match(/required:\s*(true|false)/);
      docs += `| \`${prop.name}\` | \`${cell(typeMatch ? typeMatch[1] : 'any')}\` | ${defaultMatch ? `\`${cell(defaultMatch[1].trim())}\`` : '-'} | ${requiredMatch && requiredMatch[1] === 'true' ? 'Yes' : 'No'} | ${cell(prop.description)} |\n`;
    }
    docs += `\n`;
  }

  return docs;
};

// UiCodeBlock copies outputText; these report the result
const onCopied = () => showNotice('Copied to clipboard.', 'success');
const onCopyFailed = () => showNotice('Could not copy to the clipboard.', 'error');

const downloadDocs = () => {
  if (!outputText.value) return;
  const extension = outputFormat.value === 'html' ? 'html' : 'md';
  const filename = `${selectedComponent.value || 'component'}.${extension}`;
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
