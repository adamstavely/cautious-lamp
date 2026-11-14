<template>
  <PageShell>
    <PageHero
      :back="{ to: '/review', label: 'Review' }"
      title="Design-dev handoff"
      lead="Streamline collaboration between design and development. Generate specs, match design tokens, and export everything developers need."
      spot="site/handoff-tools"
      size="tool"
    />

    <PageSection>
      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

      <UiTabs v-model="activeTab" :tabs="tabs" label="Handoff role">
        <!-- Designer workflow -->
        <template #designer>
          <div class="flex flex-col gap-6">
            <UiPanel title="1. Upload your design" description="Upload a screenshot or design file to extract specs automatically. We'll identify colors, spacing, typography, and measurements.">
              <UiFileDropZone
                label="Design file"
                :file="uploadedFile"
                accept="image/*,.fig,.sketch"
                prompt="Drop your design file here, or choose one."
                hint="Supports PNG, JPG, SVG, Figma files, and Sketch files"
                @select="selectDesignFile"
                @remove="uploadedFile = null"
              />
            </UiPanel>

            <UiPanel title="2. Design specifications" description="Enter or adjust the design specifications. These will be used to generate developer-ready code and match design tokens.">
              <div class="grid md:grid-cols-2 gap-8">
                <!-- Colors -->
                <fieldset class="spec-group">
                  <legend class="spec-legend">Colors used</legend>
                  <ul class="flex flex-col gap-2">
                    <li v-for="(color, index) in designSpecs.colors" :key="index" class="flex items-center gap-2">
                      <button
                        type="button"
                        class="swatch-button"
                        :aria-label="`Pick color ${index + 1}`"
                        :title="`Pick color ${index + 1}`"
                        @click="openColorPicker(index, $event)"
                      >
                        <UiSwatch :color="color.value" size="fill" :label="color.value" />
                      </button>
                      <div class="flex-1">
                        <UiInput v-model="color.value" mono :aria-label="`Color ${index + 1} value`" />
                      </div>
                      <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove color ${index + 1}`" @click="designSpecs.colors.splice(index, 1)" />
                    </li>
                  </ul>
                  <div>
                    <UiButton size="sm" variant="ghost" icon="add" @click="addColor">Add color</UiButton>
                  </div>
                </fieldset>

                <!-- Typography -->
                <fieldset class="spec-group">
                  <legend class="spec-legend">Typography</legend>
                  <UiInput v-model="designSpecs.typography.fontFamily" label="Font family" placeholder="Inter, Roboto, etc." />
                  <div class="grid grid-cols-2 gap-3">
                    <UiInput v-model="designSpecs.typography.fontSize" type="number" label="Size" suffix="px" />
                    <UiInput v-model="designSpecs.typography.fontWeight" type="number" label="Weight" />
                  </div>
                </fieldset>

                <!-- Spacing -->
                <fieldset class="spec-group">
                  <legend class="spec-legend">Spacing</legend>
                  <div class="grid grid-cols-2 gap-3">
                    <UiInput v-model="designSpecs.spacing.padding" type="number" label="Padding" suffix="px" />
                    <UiInput v-model="designSpecs.spacing.margin" type="number" label="Margin" suffix="px" />
                  </div>
                  <UiInput v-model="designSpecs.spacing.borderRadius" type="number" label="Border radius" suffix="px" />
                </fieldset>

                <!-- Dimensions -->
                <fieldset class="spec-group">
                  <legend class="spec-legend">Dimensions</legend>
                  <div class="grid grid-cols-2 gap-3">
                    <UiInput v-model="designSpecs.dimensions.width" type="number" label="Width" suffix="px" />
                    <UiInput v-model="designSpecs.dimensions.height" type="number" label="Height" suffix="px" />
                  </div>
                </fieldset>
              </div>
            </UiPanel>

            <UiPanel title="3. Generate handoff documentation" description="Generate handoff documentation with matched design tokens and ready-to-use code.">
              <div class="flex flex-wrap items-end gap-3">
                <div class="w-64">
                  <UiSelect v-model="handoffFormat" label="Format" :options="handoffFormats" />
                </div>
                <UiButton variant="primary" icon="description" @click="generateHandoff">Generate handoff</UiButton>
              </div>
              <template v-if="generatedHandoff">
                <UiCodeBlock :code="generatedHandoff" label="Handoff document" @copy-failed="showNotice('Could not copy to the clipboard.', 'error')" />
                <div>
                  <UiButton icon="download" @click="downloadHandoff">Download</UiButton>
                </div>
              </template>
            </UiPanel>
          </div>
        </template>

        <!-- Developer workflow -->
        <template #developer>
          <div class="flex flex-col gap-6">
            <UiPanel title="Design specifications" description="The design specifications provided by the design team: measurements, colors and typography.">
              <UiEmptyState
                v-if="!designSpecsLoaded"
                title="No design specs yet"
                body="No design specs available. Ask your designer to generate a handoff document."
                spot="tools/documentation-generator"
                :bordered="false"
              />
              <div v-else class="grid md:grid-cols-2 gap-4">
                <div class="spec-tile">
                  <p class="spec-tile-label">Colors</p>
                  <div class="flex flex-wrap gap-3">
                    <span v-for="(color, index) in designSpecs.colors" :key="index" class="flex items-center gap-2">
                      <UiSwatch :color="color.value" size="sm" />
                      <UiCode>{{ color.value }}</UiCode>
                    </span>
                  </div>
                </div>
                <div class="spec-tile">
                  <p class="spec-tile-label">Typography</p>
                  <p class="text-sm text-ink">
                    {{ designSpecs.typography.fontFamily || 'Not specified' }},
                    {{ designSpecs.typography.fontSize || 'N/A' }}px,
                    Weight {{ designSpecs.typography.fontWeight || 'N/A' }}
                  </p>
                </div>
                <div class="spec-tile">
                  <p class="spec-tile-label">Spacing</p>
                  <p class="text-sm text-ink">
                    Padding: {{ designSpecs.spacing.padding || 0 }}px<br />
                    Margin: {{ designSpecs.spacing.margin || 0 }}px<br />
                    Border Radius: {{ designSpecs.spacing.borderRadius || 0 }}px
                  </p>
                </div>
                <div class="spec-tile">
                  <p class="spec-tile-label">Dimensions</p>
                  <p class="text-sm text-ink">{{ designSpecs.dimensions.width || 0 }}px × {{ designSpecs.dimensions.height || 0 }}px</p>
                </div>
              </div>
            </UiPanel>

            <UiPanel title="Matched design tokens" description="Your design specs matched to existing design tokens. Use these tokens instead of hardcoded values for consistency.">
              <ul v-if="matchedTokens.length" class="flex flex-col gap-3">
                <li v-for="(match, index) in matchedTokens" :key="index" class="spec-row">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-ink-strong">{{ match.type }}</p>
                    <p class="text-sm text-ink-secondary">Design value: <UiCode>{{ match.designValue }}</UiCode></p>
                    <p class="text-sm text-accent-text">Use token: <UiCode>{{ match.token }}</UiCode></p>
                  </div>
                  <UiButton size="sm" icon="content_copy" @click="copyToken(match.token)">Copy<span class="sr-only"> {{ match.token }}</span></UiButton>
                </li>
              </ul>
              <p v-else class="py-6 text-center text-sm text-ink-muted">
                No token matches found. Check the design system token library for available tokens.
              </p>
            </UiPanel>

            <UiPanel title="Generate code" description="Generate ready-to-use code with design tokens. Choose your framework and copy the code directly.">
              <div class="flex flex-wrap items-end gap-3">
                <div class="w-64">
                  <UiSelect v-model="codeFormat" label="Format" :options="codeFormats" />
                </div>
                <UiButton variant="primary" icon="code" @click="generateCode">Generate code</UiButton>
              </div>
              <UiCodeBlock
                v-if="generatedCode"
                :code="generatedCode"
                :label="codeFormats.find((format) => format.value === codeFormat)?.label || 'Code'"
                @copy-failed="showNotice('Could not copy to the clipboard.', 'error')"
              />
            </UiPanel>

            <UiPanel title="Similar components" description="Check if there's already a component in the design system that matches this design. Reuse existing components when possible.">
              <ul v-if="similarComponents.length" class="flex flex-col gap-3">
                <li v-for="(component, index) in similarComponents" :key="index" class="spec-row">
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-ink-strong">{{ component.name }}</p>
                    <p class="text-sm text-ink-secondary">{{ component.description }}</p>
                  </div>
                  <UiButton size="sm" :href="component.link" trailing-icon="arrow_forward">View component</UiButton>
                </li>
              </ul>
              <p v-else class="py-6 text-center text-sm text-ink-muted">
                No similar components found. You may need to build a new component.
              </p>
            </UiPanel>
          </div>
        </template>
      </UiTabs>
    </PageSection>

    <!-- Color picker (positions itself next to the swatch from `position`) -->
    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCode,
  UiCodeBlock,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiSwatch,
  UiTabs,
} from '../components/ui';
import UiFileDropZone from '../components/ui/UiFileDropZone.vue';

const { notice, showNotice, clearNotice } = useNotice();
const activeTab = ref('designer');
const tabs = [
  { value: 'designer', label: 'For designers', icon: 'palette' },
  { value: 'developer', label: 'For developers', icon: 'code' },
];
const handoffFormats = [
  { value: 'markdown', label: 'Markdown document' },
  { value: 'html', label: 'HTML page' },
  { value: 'pdf', label: 'PDF document' },
  { value: 'json', label: 'JSON spec' },
];
const codeFormats = [
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'vue', label: 'Vue Component' },
  { value: 'react', label: 'React Component' },
  { value: 'tailwind', label: 'Tailwind CSS' },
];
const uploadedFile = ref(null);
const handoffFormat = ref('markdown');
const codeFormat = ref('css');
const generatedHandoff = ref('');
const generatedCode = ref('');
const designSpecsLoaded = ref(false);

const designSpecs = ref({
  colors: [
    { value: '#4f46e5', name: 'Primary' },
    { value: '#6366f1', name: 'Secondary' }
  ],
  typography: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 400
  },
  spacing: {
    padding: 12,
    margin: 8,
    borderRadius: 8
  },
  dimensions: {
    width: 200,
    height: 48
  }
});

const matchedTokens = ref([
  { type: 'Color', designValue: '#4f46e5', token: '--color-primary' },
  { type: 'Spacing', designValue: '12px', token: '--spacing-md' },
  { type: 'Border Radius', designValue: '8px', token: '--radius-md' }
]);

const similarComponents = ref([
  { name: 'Button', description: 'Primary action button component', link: '/components/button' },
  { name: 'Card', description: 'Container component with padding and border radius', link: '/components/card' }
]);

// Color picker state
const showColorPicker = ref(false);
const currentColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });

// New colours start black, like the colour picker
const addColor = () => designSpecs.value.colors.push({ value: '#000000', name: '' });

// In a real implementation, this would extract specs from the file
const selectDesignFile = (file) => {
  uploadedFile.value = file;
  designSpecsLoaded.value = true;
};

const openColorPicker = (index, event) => {
  event.stopPropagation();
  currentColorIndex.value = index;
  const color = designSpecs.value.colors[index];
  pickerColor.value = color ? color.value : '#000000';
  
  // Calculate position - ColorPicker uses fixed positioning, so coordinates are relative to viewport
  const rect = event.currentTarget.getBoundingClientRect();
  const pickerWidth = 280;
  const pickerHeight = 400;
  const padding = 16;
  const gap = 16;
  
  // Horizontal positioning
  let left = rect.right + gap;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth - padding) {
    left = rect.left - pickerWidth - gap;
  }
  
  // Ensure picker doesn't go off left or right edge
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
  
  // Vertical positioning - check available space above and below
  const spaceBelow = window.innerHeight - rect.bottom - padding;
  const spaceAbove = rect.top - padding;
  
  let top;
  
  // If there's enough space below, position below the button
  if (spaceBelow >= pickerHeight) {
    top = rect.bottom + gap;
  }
  // If there's more space above than below, position above
  else if (spaceAbove >= pickerHeight) {
    top = rect.top - pickerHeight - gap;
  }
  // If there's not enough space in either direction, use the one with more space
  else if (spaceAbove > spaceBelow) {
    top = Math.max(padding, rect.top - pickerHeight - gap);
  }
  else {
    top = Math.min(window.innerHeight - pickerHeight - padding, rect.bottom + gap);
  }
  
  // Final bounds check to ensure picker stays within viewport
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
  
  pickerPosition.value = { left: left, top: top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentColorIndex.value !== null) {
    designSpecs.value.colors[currentColorIndex.value].value = color;
  }
  showColorPicker.value = false;
  currentColorIndex.value = null;
};

const generateHandoff = () => {
  const specs = designSpecs.value;
  
  if (handoffFormat.value === 'markdown') {
    generatedHandoff.value = `# Design Handoff Document

## Colors
${specs.colors.map(c => `- **${c.name || 'Color'}**: \`${c.value}\``).join('\n')}

## Typography
- **Font Family**: ${specs.typography.fontFamily}
- **Font Size**: ${specs.typography.fontSize}px
- **Font Weight**: ${specs.typography.fontWeight}

## Spacing
- **Padding**: ${specs.spacing.padding}px
- **Margin**: ${specs.spacing.margin}px
- **Border Radius**: ${specs.spacing.borderRadius}px

## Dimensions
- **Width**: ${specs.dimensions.width}px
- **Height**: ${specs.dimensions.height}px

## Design Tokens to Use
${matchedTokens.value.map(t => `- \`${t.token}\` (matches ${t.designValue})`).join('\n')}
`;
  } else if (handoffFormat.value === 'json') {
    generatedHandoff.value = JSON.stringify({
      colors: specs.colors,
      typography: specs.typography,
      spacing: specs.spacing,
      dimensions: specs.dimensions,
      matchedTokens: matchedTokens.value
    }, null, 2);
  } else {
    generatedHandoff.value = 'HTML/PDF generation would be implemented here';
  }
};

const downloadHandoff = () => {
  if (!generatedHandoff.value) return;
  const extension = handoffFormat.value === 'json' ? 'json' : handoffFormat.value === 'pdf' ? 'pdf' : handoffFormat.value === 'html' ? 'html' : 'md';
  const filename = `design-handoff.${extension}`;
  
  const blob = new Blob([generatedHandoff.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateCode = () => {
  const specs = designSpecs.value;
  
  if (codeFormat.value === 'css') {
    generatedCode.value = `.component {
  width: ${specs.dimensions.width}px;
  height: ${specs.dimensions.height}px;
  padding: ${specs.spacing.padding}px;
  margin: ${specs.spacing.margin}px;
  border-radius: ${specs.spacing.borderRadius}px;
  background-color: ${specs.colors[0]?.value || '#000'};
  font-family: ${specs.typography.fontFamily};
  font-size: ${specs.typography.fontSize}px;
  font-weight: ${specs.typography.fontWeight};
}`;
  } else if (codeFormat.value === 'tailwind') {
    // style-check: allow generated Tailwind output (content the tool produces, not this page's styling)
    generatedCode.value = `<div class="w-[${specs.dimensions.width}px] h-[${specs.dimensions.height}px] p-[${specs.spacing.padding}px] m-[${specs.spacing.margin}px] rounded-[${specs.spacing.borderRadius}px]" style="background-color: ${specs.colors[0]?.value || '#000'}; font-family: ${specs.typography.fontFamily}; font-size: ${specs.typography.fontSize}px; font-weight: ${specs.typography.fontWeight};">
  Content
</div>`;
  } else if (codeFormat.value === 'vue') {
    const templateTag = '<' + 'template' + '>';
    const templateClose = '<' + '/' + 'template' + '>';
    const scriptTag = '<' + 'script setup' + '>';
    const scriptClose = '<' + '/' + 'script' + '>';
    generatedCode.value = `${templateTag}
  <div class="component" :style="componentStyle">
    <slot></slot>
  </div>
${templateClose}

${scriptTag}
const componentStyle = {
  width: '${specs.dimensions.width}px',
  height: '${specs.dimensions.height}px',
  padding: '${specs.spacing.padding}px',
  margin: '${specs.spacing.margin}px',
  borderRadius: '${specs.spacing.borderRadius}px',
  backgroundColor: '${specs.colors[0]?.value || '#000'}',
  fontFamily: '${specs.typography.fontFamily}',
  fontSize: '${specs.typography.fontSize}px',
  fontWeight: ${specs.typography.fontWeight}
}
${scriptClose}`;
  } else if (codeFormat.value === 'react') {
    generatedCode.value = `import React from 'react';

const Component = ({ children }) => {
  const style = {
    width: '${specs.dimensions.width}px',
    height: '${specs.dimensions.height}px',
    padding: '${specs.spacing.padding}px',
    margin: '${specs.spacing.margin}px',
    borderRadius: '${specs.spacing.borderRadius}px',
    backgroundColor: '${specs.colors[0]?.value || '#000'}',
    fontFamily: '${specs.typography.fontFamily}',
    fontSize: '${specs.typography.fontSize}px',
    fontWeight: ${specs.typography.fontWeight}
  };

  return <div style={style}>{children}</div>;
};

export default Component;`;
  }
};

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
    showNotice(`Copied ${token}.`, 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};
</script>

<style scoped>
.spec-group {
  @apply flex flex-col gap-3;
}
.spec-legend {
  @apply mb-3 text-sm font-semibold text-ink-strong;
}
.swatch-button {
  @apply h-11 w-12 shrink-0 rounded-field p-1 border border-line-control hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.spec-tile {
  @apply rounded-tile bg-surface-sunken p-4;
}
.spec-tile-label {
  @apply mb-2 text-xs font-medium text-ink-muted;
}
.spec-row {
  @apply flex flex-wrap items-center gap-3 rounded-tile border border-line bg-surface-sunken p-4;
}
</style>
