<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Box shadow generator"
      lead="Create box shadows with custom offsets, blur, spread and color. Layer one shadow or several."
      spot="tools/box-shadow-generator"
      size="tool"
    />

    <PageSection title="Preview">
      <UiPanel title="Live preview">
        <template #actions>
          <UiSwitch v-model="previewDarkMode" label="Dark background" />
        </template>
        <div class="preview-stage h-64 rounded-tile flex items-center justify-center bg-surface-sunken" :class="previewDarkMode ? 'preview-dark' : 'preview-light'">
          <div class="preview-box w-48 h-48 rounded-tile flex items-center justify-center bg-surface-raised">
            <span class="text-sm font-medium text-ink-secondary">Preview box</span>
          </div>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection title="Shadows" description="Start from a preset or add layers; the first shadow is drawn on top." divided>
      <template #actions>
        <UiButton v-for="preset in presetButtons" :key="preset.size" size="sm" :label="preset.label" @click="loadPreset(preset.size)" />
        <UiButton size="sm" variant="primary" icon="add" label="Add shadow" @click="addShadow" />
      </template>
      <div class="space-y-4">
        <UiPanel v-for="(shadow, index) in shadows" :key="shadow.id" :title="`Shadow ${index + 1}`" heading-tag="h3">
          <template #actions>
            <UiButton
              variant="ghost"
              size="sm"
              icon="delete"
              icon-only
              :label="`Remove shadow ${index + 1}`"
              :disabled="shadows.length === 1"
              @click="removeShadow(shadow.id)"
            />
          </template>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UiInput v-model.number="shadow.x" type="number" step="1" label="X offset" suffix="px" />
            <UiInput v-model.number="shadow.y" type="number" step="1" label="Y offset" suffix="px" />
            <UiInput v-model.number="shadow.blur" type="number" min="0" step="1" label="Blur" suffix="px" />
            <UiInput v-model.number="shadow.spread" type="number" step="1" label="Spread" suffix="px" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="grid grid-cols-aside-content gap-2 items-end">
              <div class="w-16"><UiInput v-model="shadow.color" type="color" label="Color" /></div>
              <UiInput v-model="shadow.color" mono label="Color value" />
            </div>
            <div class="grid grid-cols-content-aside gap-2 items-end">
              <UiRange v-model="shadow.opacity" :min="0" :max="1" :step="0.01" label="Opacity" />
              <div class="w-24"><UiInput v-model.number="shadow.opacity" type="number" min="0" max="1" step="0.01" label="Opacity value" /></div>
            </div>
          </div>
          <div class="mt-4">
            <UiCheckbox v-model="shadow.inset" label="Inset shadow" />
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Code" divided>
      <UiCodeBlock :code="cssCode" label="CSS" />
    </PageSection>

    <PageSection title="Export" description="Download the shadow as CSS, a Tailwind config or JSON." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton v-for="item in exportButtons" :key="item.format" :icon="item.icon" :label="item.label" @click="exportFormat(item.format)" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiCodeBlock, UiInput, UiPanel, UiRange, UiSwitch } from '../components/ui';

const previewDarkMode = ref(false);
let shadowIdCounter = 0;

const shadows = ref([
  {
    id: shadowIdCounter++,
    x: 0,
    y: 1,
    blur: 2,
    spread: 0,
    color: '#000000',
    opacity: 0.05,
    inset: false
  }
]);

// Number inputs bound with v-model.number yield '' when cleared; treat that
// (and anything non-numeric) as 0 so the generated CSS stays valid.
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return value === '' || value === null || !Number.isFinite(n) ? fallback : n;
};

const px = (value) => {
  const n = toNumber(value);
  return n === 0 ? '0' : `${n}px`;
};

const hexToRgba = (hex, opacity) => {
  let value = String(hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    value = value.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) value = '000000';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const alpha = Math.min(1, Math.max(0, toNumber(opacity, 1)));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computedBoxShadow = computed(() => {
  const shadowStrings = shadows.value.map(shadow => {
    const rgba = hexToRgba(shadow.color, shadow.opacity);
    const inset = shadow.inset ? 'inset ' : '';
    // Blur radius can't be negative in CSS (the whole declaration would be dropped).
    const blur = Math.max(0, toNumber(shadow.blur));
    return `${inset}${px(shadow.x)} ${px(shadow.y)} ${px(blur)} ${px(shadow.spread)} ${rgba}`;
  });
  return {
    boxShadow: shadowStrings.join(', ')
  };
});

// The preview box reads this through v-bind() in <style>
const previewShadow = computed(() => computedBoxShadow.value.boxShadow);
const cssCode = computed(() => `.shadow-custom {\n  box-shadow: ${computedBoxShadow.value.boxShadow};\n}\n`);

const presetButtons = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
];

const exportButtons = [
  { format: 'css', icon: 'code', label: 'Export CSS' },
  { format: 'tailwind', icon: 'settings', label: 'Export Tailwind' },
  { format: 'json', icon: 'data_object', label: 'Export JSON' },
];

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

const addShadow = () => {
  shadows.value.push({
    id: shadowIdCounter++,
    x: 0,
    y: 4,
    blur: 6,
    spread: 0,
    color: '#000000',
    opacity: 0.1,
    inset: false
  });
};

const removeShadow = (id) => {
  if (shadows.value.length > 1) {
    shadows.value = shadows.value.filter(s => s.id !== id);
  }
};

const loadPreset = (size) => {
  const presets = {
    sm: [{ x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05, inset: false }],
    md: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false }],
    lg: [{ x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false }]
  };
  
  const preset = presets[size];
  shadows.value = preset.map(s => ({
    id: shadowIdCounter++,
    ...s
  }));
};

const exportFormat = (format) => {
  if (format === 'css') {
    downloadFile(cssCode.value, 'text/css', `box-shadow-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      boxShadow: {\n        'custom': '${computedBoxShadow.value.boxShadow}',\n      },\n    },\n  },\n};\n`;
    downloadFile(config, 'text/javascript', `box-shadow-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'box-shadow',
      shadows: shadows.value.map(s => ({
        x: toNumber(s.x),
        y: toNumber(s.y),
        blur: Math.max(0, toNumber(s.blur)),
        spread: toNumber(s.spread),
        color: s.color,
        opacity: Math.min(1, Math.max(0, toNumber(s.opacity, 1))),
        inset: s.inset
      })),
      css: computedBoxShadow.value.boxShadow
    };
    downloadFile(JSON.stringify(config, null, 2), 'application/json', `box-shadow-${Date.now()}.json`);
  }
};
</script>

<style scoped>
/* The preview stage pins its own scheme, so its tokens resolve light or dark whatever the app theme */
.preview-light {
  color-scheme: light;
}
.preview-dark {
  color-scheme: dark;
}
.preview-box {
  @apply transition-shadow;
  box-shadow: v-bind(previewShadow);
}
</style>
