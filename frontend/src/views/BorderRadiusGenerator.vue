<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Border radius generator"
      lead="Generate border radius values with individual corner controls, for rounded corners on cards, buttons and other UI elements."
      spot="tools/border-radius-generator"
      size="tool"
    />

    <PageSection title="Settings">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UiPanel title="Unified control">
          <template #actions>
            <UiSwitch v-model="locked" label="Lock corners" />
          </template>
          <div class="space-y-4">
            <UiInput v-model.number="unifiedValue" type="number" min="0" step="1" label="Value" />
            <UiSelect v-model="unit" :options="units" label="Unit" @update:model-value="updateUnified" />
            <div class="flex flex-wrap gap-2" role="group" aria-label="Presets">
              <UiButton v-for="preset in presets" :key="preset.name" size="sm" :label="preset.name" @click="loadPreset(preset.value)" />
            </div>
          </div>
        </UiPanel>

        <UiPanel title="Individual corners" :description="locked ? 'Unlock the corners to set each one.' : ''">
          <div class="grid grid-cols-2 gap-4">
            <UiInput
              v-for="corner in corners"
              :key="corner.key"
              :model-value="corner.model.value"
              type="number"
              min="0"
              step="1"
              :label="corner.label"
              :disabled="locked"
              @update:model-value="setCorner(corner, $event)"
            />
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Preview" divided>
      <UiPanel title="Visual preview">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p class="preview-label">Box</p>
            <div class="radius-preview w-full h-24 bg-accent"></div>
          </div>
          <div>
            <p class="preview-label">Card</p>
            <div class="radius-preview w-full h-24 p-4 border border-line bg-surface-raised">
              <div class="w-full h-full rounded-control bg-fill"></div>
            </div>
          </div>
          <div>
            <p class="preview-label">Button</p>
            <div class="radius-preview w-full h-12 flex items-center justify-center font-medium bg-accent text-ink-on-accent">Button</div>
          </div>
          <div>
            <p class="preview-label">Circle</p>
            <div class="radius-preview w-24 h-24 mx-auto bg-accent"></div>
          </div>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection title="Code" divided>
      <UiCodeBlock :code="cssCode" label="CSS" />
    </PageSection>

    <PageSection title="Export" description="Download the radius as CSS, a Tailwind config or JSON." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton v-for="item in exportButtons" :key="item.format" :icon="item.icon" :label="item.label" @click="exportFormat(item.format)" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiCodeBlock, UiInput, UiPanel, UiSelect, UiSwitch } from '../components/ui';

const locked = ref(true);
const unit = ref('px');
const unifiedValue = ref(8);
const topLeft = ref(8);
const topRight = ref(8);
const bottomRight = ref(8);
const bottomLeft = ref(8);

const presets = [
  { name: 'None', value: 0 },
  { name: 'SM', value: 4 },
  { name: 'MD', value: 8 },
  { name: 'LG', value: 12 },
  { name: 'XL', value: 16 },
  { name: '2XL', value: 24 },
  { name: '3XL', value: 32 },
  { name: 'Full', value: 9999 }
];

// Radii can't be negative, and a cleared number input gives ''; both become 0
// so the CSS is always valid.
const radius = (val) => {
  const n = Number(val);
  return val === '' || val === null || !Number.isFinite(n) ? 0 : Math.max(0, n);
};

const computedBorderRadius = computed(() => {
  const formatValue = (val) => {
    const n = radius(val);
    return n === 0 ? '0' : `${n}${unit.value}`;
  };
  const [tl, tr, br, bl] = [topLeft, topRight, bottomRight, bottomLeft].map((r) => formatValue(r.value));

  if (tl === tr && tr === br && br === bl) {
    return { borderRadius: tl };
  }

  return {
    borderRadius: `${tl} ${tr} ${br} ${bl}`
  };
});

// The previews read this through v-bind() in <style>
const previewRadius = computed(() => computedBorderRadius.value.borderRadius);
const cssCode = computed(() => `border-radius: ${computedBorderRadius.value.borderRadius};`);

const units = ['px', 'rem', 'em', '%'];

const corners = [
  { key: 'topLeft', label: 'Top left', model: topLeft },
  { key: 'topRight', label: 'Top right', model: topRight },
  { key: 'bottomRight', label: 'Bottom right', model: bottomRight },
  { key: 'bottomLeft', label: 'Bottom left', model: bottomLeft },
];

const setCorner = (corner, value) => {
  corner.model.value = value;
  updateFromIndividual();
};

const exportButtons = [
  { format: 'css', icon: 'code', label: 'Export CSS' },
  { format: 'tailwind', icon: 'settings', label: 'Export Tailwind' },
  { format: 'json', icon: 'data_object', label: 'Export JSON' },
];

const updateUnified = () => {
  if (locked.value) {
    topLeft.value = unifiedValue.value;
    topRight.value = unifiedValue.value;
    bottomRight.value = unifiedValue.value;
    bottomLeft.value = unifiedValue.value;
  }
};

// Re-locking (or changing the unified value while locked) keeps all four
// corners in step, so "Locked" never shows mismatched corners.
watch([locked, unifiedValue], updateUnified);

const downloadFile = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const updateFromIndividual = () => {
  if (!locked.value) {
    unifiedValue.value = topLeft.value;
  }
};

const loadPreset = (value) => {
  unifiedValue.value = value;
  updateUnified();
};

const exportFormat = (format) => {
  const borderRadius = computedBorderRadius.value.borderRadius;
  
  if (format === 'css') {
    const css = `.rounded-custom {\n  border-radius: ${borderRadius};\n}\n`;
    downloadFile(css, 'text/css', `border-radius-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      borderRadius: {\n        'custom': '${borderRadius}',\n      },\n    },\n  },\n};\n`;
    downloadFile(config, 'text/javascript', `border-radius-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'border-radius',
      unit: unit.value,
      topLeft: radius(topLeft.value),
      topRight: radius(topRight.value),
      bottomRight: radius(bottomRight.value),
      bottomLeft: radius(bottomLeft.value),
      borderRadius: borderRadius
    };
    downloadFile(JSON.stringify(config, null, 2), 'application/json', `border-radius-${Date.now()}.json`);
  }
};
</script>

<style scoped>
.preview-label {
  @apply text-xs font-medium mb-2 uppercase tracking-wide text-center text-ink-muted;
}
.radius-preview {
  border-radius: v-bind(previewRadius);
}
</style>
