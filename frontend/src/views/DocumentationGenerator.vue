<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Documentation Generator
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Auto-generate component documentation from code comments. Extract props, examples, and usage guidelines automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Component Selector -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Component Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Select Component
              </h3>
              <select
                v-model="selectedComponent"
                @change="loadComponent"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Choose a component...</option>
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="select">Select</option>
                <option value="modal">Modal</option>
              </select>
            </div>

            <!-- Upload Component -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Upload Component File
              </h3>
              <input
                type="file"
                @change="handleFileUpload"
                accept=".vue,.jsx,.tsx,.js,.ts"
                class="hidden"
                ref="fileInput"
                id="component-file"
              />
              <label
                for="component-file"
                class="block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 text-gray-300 hover:border-gray-500' 
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'"
              >
                <span class="material-symbols-outlined text-2xl mb-2 block">upload</span>
                <span class="text-sm">Click to upload component file</span>
              </label>
            </div>

            <!-- Generation Options -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Generation Options
              </h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="options.includeProps" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Include Props</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="options.includeExamples" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Include Examples</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="options.includeAccessibility" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Accessibility Info</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="options.includeChangelog" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Changelog</span>
                </label>
              </div>
            </div>

            <!-- Generate Button -->
            <button
              @click="generateDocumentation"
              :disabled="!selectedComponent && !uploadedCode"
              class="w-full px-6 py-3 rounded-lg font-medium transition-colors"
              :class="selectedComponent || uploadedCode
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              Generate Documentation
            </button>
          </div>

          <!-- Right Column: Generated Documentation -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Generated Docs Preview -->
            <div 
              v-if="generatedDocs"
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Generated Documentation
                </h3>
                <div class="flex items-center gap-2">
                  <select
                    v-model="outputFormat"
                    class="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="vuepress">VitePress</option>
                  </select>
                  <button
                    @click="copyDocs"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-sm">content_copy</span>
                    Copy
                  </button>
                  <button
                    @click="downloadDocs"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-sm">download</span>
                    Download
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
                  <div class="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
                    <pre class="text-sm font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"><code>{{ generatedDocs }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documentation Preview -->
            <div 
              v-if="generatedDocs && outputFormat === 'markdown'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Preview
              </h3>
              <div class="prose prose-slate dark:prose-invert max-w-none" v-html="renderedMarkdown"></div>
            </div>

            <!-- Empty State -->
            <div v-if="!generatedDocs" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-white'">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                description
              </span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No documentation generated yet
              </p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Select a component or upload a file to generate documentation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { marked } from 'marked';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
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

const renderedMarkdown = computed(() => {
  if (!generatedDocs.value || outputFormat.value !== 'markdown') return '';
  return marked(generatedDocs.value);
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
    parseComponentCode(uploadedCode.value);
  };
  reader.readAsText(file);
};

const parseComponentCode = (code) => {
  // Extract JSDoc comments
  const jsdocMatch = code.match(/\/\*\*([\s\S]*?)\*\//);
  if (jsdocMatch) {
    generateDocumentation();
  }
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

  // Extract props
  const propsMatch = code.match(/props:\s*\{([\s\S]*?)\}/);
  if (propsMatch && options.value.includeProps) {
    docs += `## Props\n\n`;
    docs += `| Name | Type | Default | Required | Description |\n`;
    docs += `|------|------|---------|----------|-------------|\n`;
    
    // Extract individual props
    const propRegex = /(\w+):\s*\{([\s\S]*?)\}/g;
    let propMatch;
    while ((propMatch = propRegex.exec(propsMatch[1])) !== null) {
      const propName = propMatch[1];
      const propDef = propMatch[2];
      const typeMatch = propDef.match(/type:\s*(\w+)/);
      const defaultMatch = propDef.match(/default:\s*(.+)/);
      const requiredMatch = propDef.match(/required:\s*(true|false)/);
      const descMatch = propDef.match(/\/\*\*([\s\S]*?)\*\//);
      
      docs += `| \`${propName}\` | \`${typeMatch ? typeMatch[1] : 'any'}\` | ${defaultMatch ? `\`${defaultMatch[1]}\`` : '-'} | ${requiredMatch && requiredMatch[1] === 'true' ? 'Yes' : 'No'} | ${descMatch ? descMatch[1].trim() : ''} |\n`;
    }
    docs += `\n`;
  }

  return docs;
};

const copyDocs = async () => {
  if (!generatedDocs.value) return;
  try {
    await navigator.clipboard.writeText(generatedDocs.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadDocs = () => {
  if (!generatedDocs.value) return;
  const extension = outputFormat.value === 'html' ? 'html' : outputFormat.value === 'vuepress' ? 'md' : 'md';
  const filename = `${selectedComponent.value || 'component'}.${extension}`;
  
  let content = generatedDocs.value;
  if (outputFormat.value === 'html') {
    content = `<!DOCTYPE html>
<html>
<head>
  <title>Component Documentation</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
${renderedMarkdown.value}
</body>
</html>`;
  }
  
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

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

