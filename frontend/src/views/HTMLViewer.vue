<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="HTML viewer"
      lead="View and render HTML, CSS, and JavaScript code in real-time. Preview your code exactly as it would appear in a web browser."
      spot="tools/html-viewer"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Input">
          <template #actions>
            <UiSwitch v-model="autoUpdate" label="Auto update" />
            <UiButton v-if="!autoUpdate" variant="primary" size="sm" icon="play_arrow" @click="runPreview">Run</UiButton>
          </template>

          <UiTabs v-model="activeTab" :tabs="tabs" label="Code language">
            <div class="flex flex-col gap-3">
              <div class="flex flex-wrap justify-end gap-1" role="toolbar" aria-label="Editor tools">
                <UiButton v-for="tool in editorTools" :key="tool.label" icon-only size="sm" variant="ghost" :icon="tool.icon" :label="tool.label" @click="tool.action" />
              </div>
              <UiTextarea
                v-model="codeInputs[activeTab]"
                :label="`${activeLabel} code`"
                mono
                rows="16"
                class="resize-none"
                :placeholder="`Type or paste ${activeTab.toUpperCase()} here`"
                @input="handleInput"
              />
            </div>
          </UiTabs>
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
        </UiPanel>

        <UiPanel title="Output" flush>
          <div class="h-full min-h-96">
            <!-- Sandboxed (allow-scripts only, opaque origin): previewed code can't reach this page -->
            <iframe
              ref="outputFrame"
              :key="previewRun"
              :srcdoc="outputDoc"
              title="HTML preview"
              class="w-full h-full min-h-96 border-0"
              sandbox="allow-scripts"
            ></iframe>
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="What is an online HTML viewer" divided>
      <p class="text-sm leading-relaxed text-ink-secondary max-w-3xl">
        An Online HTML Beautifier/Viewer is a tool that allows you to view and render HTML code in real-time, showing exactly how the code would appear in a web browser. It is commonly used by developers, students, and designers to preview and test HTML code without needing to save it to a file or upload it to a server.
      </p>
    </PageSection>

    <PageSection title="What does an HTML viewer online do" divided>
      <ul class="list-disc pl-5 space-y-2 text-sm text-ink-secondary">
        <li>Renders HTML just like a web browser would.</li>
        <li>Displays the visual output of HTML code instantly.</li>
        <li>Helps spot errors or formatting issues in the layout.</li>
        <li>Often supports live editing, where changes appear immediately.</li>
      </ul>
    </PageSection>

    <PageSection title="How to use this HTML code viewer" divided>
      <ol class="list-decimal pl-5 space-y-2 text-sm text-ink-secondary">
        <li><strong class="text-ink">Input your code:</strong> Choose the HTML, CSS, or JS tab and start typing or paste your code directly into the editor.</li>
        <li><strong class="text-ink">Auto update and manual run:</strong> Auto update is on by default, so changes appear instantly in the output; to update manually, turn it off and press Run.</li>
        <li><strong class="text-ink">View the output:</strong> See the live rendered result in the Output panel.</li>
        <li><strong class="text-ink">Use the editor toolbar:</strong> Use the toolbar above the editor to format, copy, reset, download, or enter fullscreen mode.</li>
      </ol>
    </PageSection>

    <PageSection title="Common use cases of this HTML visualizer" divided>
      <ul class="list-disc pl-5 space-y-2 text-sm text-ink-secondary">
        <li>Previewing static webpages or email templates</li>
        <li>Learning and experimenting with HTML tags</li>
        <li>Debugging HTML code</li>
        <li>Quickly testing code snippets shared online.</li>
      </ul>
    </PageSection>

    <UiDialog v-model:open="isFullscreen" title="Fullscreen editor" size="full">
      <UiTextarea
        v-model="codeInputs[activeTab]"
        :label="`${activeLabel} code`"
        mono
        rows="24"
        class="resize-none"
        :placeholder="`Type or paste ${activeTab.toUpperCase()} here`"
        @input="handleInput"
      />
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiDialog, UiPanel, UiSwitch, UiTabs, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
// What the preview iframe shows. Only updated by updateOutput(), so turning
// auto-update off really does hold the preview until RUN is pressed. The
// iframe is sandboxed with allow-scripts only (opaque origin), so previewed
// code cannot reach this page, its storage or its API key.
const outputDoc = ref('');
const previewRun = ref(0);
const autoUpdate = ref(true);
const activeTab = ref('html');
const isFullscreen = ref(false);
const outputFrame = ref(null);

const tabs = [
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JS', value: 'js' }
];
const activeLabel = computed(() => tabs.find((tab) => tab.value === activeTab.value)?.label ?? '');

const codeInputs = ref({
  html: '<h1>Hello, World!</h1>\n<p>Welcome to the HTML Viewer.</p>',
  css: 'h1 {\n  color: #4f46e5;\n  font-size: 2rem;\n}\n\np {\n  color: #64748b;\n}',
  js: 'console.log("Hello from JavaScript!");\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Page loaded!");\n});'
});

const renderedHTML = computed(() => {
  const html = codeInputs.value.html || '';
  const css = codeInputs.value.css || '';
  const js = codeInputs.value.js || '';
  
  // Escape script tag to avoid Vue template parser issues
  const scriptOpen = '<script>';
  const scriptClose = '</' + 'script>';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Viewer Output</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  ${scriptOpen}
    ${js}
  ${scriptClose}
</body>
</html>`;
});

// The deep watcher on codeInputs below already re-renders on every edit.
const handleInput = () => {};

// RUN: always re-run, even when nothing changed since the last render.
const runPreview = () => {
  previewRun.value += 1;
  updateOutput();
};

const updateOutput = () => {
  outputDoc.value = renderedHTML.value;
};

const formatCode = () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  try {
    if (activeTab.value === 'html') {
      // Basic HTML formatting
      let formatted = code
        .replace(/>\s+</g, '><')
        .replace(/></g, '>\n<');
      
      // Add indentation
      let indent = 0;
      const lines = formatted.split('\n');
      formatted = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        const result = '  '.repeat(indent) + trimmed;
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent++;
        }
        return result;
      }).join('\n');
      
      codeInputs.value[activeTab.value] = formatted;
    } else if (activeTab.value === 'css') {
      // Basic CSS formatting
      let formatted = code
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      codeInputs.value[activeTab.value] = formatted;
    } else if (activeTab.value === 'js') {
      // Basic JS formatting (very simple)
      let formatted = code
        .replace(/;\s*/g, ';\n')
        .replace(/\{\s*/g, ' {\n  ')
        .replace(/\}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      codeInputs.value[activeTab.value] = formatted;
    }
    
    if (autoUpdate.value) {
      updateOutput();
    }
  } catch (error) {
    console.error('Formatting error:', error);
  }
};

const copyCode = async () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  try {
    await navigator.clipboard.writeText(code);
    showNotice('Copied to clipboard.', 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

const resetCode = () => {
  if (confirm('Are you sure you want to reset the current tab?')) {
    codeInputs.value[activeTab.value] = '';
    if (autoUpdate.value) {
      updateOutput();
    }
  }
};

const downloadCode = () => {
  const code = codeInputs.value[activeTab.value];
  if (!code) return;
  
  const extension = activeTab.value === 'html' ? 'html' : activeTab.value === 'css' ? 'css' : 'js';
  const blob = new Blob([code], { type: `text/${extension}` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const editorTools = [
  { label: 'Format', icon: 'format_align_left', action: formatCode },
  { label: 'Copy', icon: 'content_copy', action: copyCode },
  { label: 'Reset', icon: 'refresh', action: resetCode },
  { label: 'Download', icon: 'download', action: downloadCode },
  { label: 'Fullscreen', icon: 'fullscreen', action: toggleFullscreen },
];

// Watch for auto-update changes
watch(autoUpdate, (newVal) => {
  if (newVal) {
    updateOutput();
  }
});

// Watch for code changes when auto-update is enabled
watch(() => codeInputs.value, () => {
  if (autoUpdate.value) {
    updateOutput();
  }
}, { deep: true });

onMounted(() => {
  // Initial render
  updateOutput();
});
</script>
