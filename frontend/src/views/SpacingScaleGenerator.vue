<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Spacing scale generator"
      lead="Generate consistent spacing scales from a ratio: harmonious padding, margin and gap values for your design system."
      spot="tools/spacing-scale-generator"
      size="tool"
    />

    <PageSection title="Settings">
      <UiPanel>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UiInput v-model.number="baseSpacing" type="number" min="2" max="32" step="1" label="Base spacing" suffix="px" hint="Starting value for your spacing scale" />
          <div class="space-y-3">
            <UiSelect v-model="selectedRatio" :options="ratioOptions" label="Ratio" />
            <UiInput
              v-if="selectedRatio === 'custom'"
              v-model.number="customRatio"
              type="number"
              min="1.1"
              max="2.0"
              step="0.001"
              placeholder="1.333"
              label="Custom ratio"
            />
          </div>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection title="Scale" divided>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UiPanel title="Spacing scale">
          <ul class="divide-y divide-line-faint">
            <li v-for="(value, name) in computedSpacingScale" :key="name" class="grid grid-cols-aside-content items-center gap-4 py-3">
              <div class="w-16">
                <div class="font-medium text-ink-strong">{{ name.toUpperCase() }}</div>
                <div class="text-xs font-code text-ink-muted">{{ value }}px</div>
              </div>
              <svg class="w-full h-3" :viewBox="`0 0 ${largestStep} 1`" preserveAspectRatio="none" aria-hidden="true">
                <rect :width="value" height="1" class="fill-accent" />
              </svg>
            </li>
          </ul>
        </UiPanel>

        <UiPanel title="Visual preview">
          <div class="space-y-4">
            <div class="sample-card rounded-tile border border-line bg-surface-sunken">
              <h3 class="font-semibold mb-2 text-ink-strong">Card example</h3>
              <p class="text-sm mb-3 text-ink-secondary">
                This card uses <code class="font-code px-1 rounded-control bg-accent-subtle text-accent-text">{{ computedSpacingScale.md }}px</code> padding.
              </p>
              <div class="sample-actions flex">
                <span class="sample-button rounded-control text-sm font-medium bg-accent text-ink-on-accent">Button</span>
                <span class="sample-button rounded-control text-sm font-medium border border-line-control text-ink">Secondary</span>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-medium mb-2 uppercase tracking-wide text-ink-muted">Grid with gap</h3>
              <div class="sample-grid grid grid-cols-3 rounded-tile border border-line bg-surface-sunken">
                <div v-for="i in 6" :key="i" class="sample-cell rounded-control bg-fill-strong">
                  <div class="w-full h-12 rounded-control bg-accent-highlight"></div>
                </div>
              </div>
            </div>
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Export" description="Download the scale as CSS custom properties, a Tailwind config or JSON." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton v-for="item in exportButtons" :key="item.format" :icon="item.icon" :label="item.label" @click="exportFormat(item.format)" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiSelect } from '../components/ui';

const baseSpacing = ref(4);
const selectedRatio = ref('major-third');
const customRatio = ref(1.333);

const ratioOptions = [
  { value: 'major-third', label: 'Major Third (1.333)' },
  { value: 'perfect-fourth', label: 'Perfect Fourth (1.5)' },
  { value: 'golden-ratio', label: 'Golden Ratio (1.618)' },
  { value: 'minor-third', label: 'Minor Third (1.2)' },
  { value: 'custom', label: 'Custom' }
];

const ratios = {
  'major-third': 1.333,
  'perfect-fourth': 1.5,
  'golden-ratio': 1.618,
  'minor-third': 1.2
};

const DEFAULT_BASE = 4;
const DEFAULT_RATIO = 1.333;

// A cleared number input yields ''; 0, negative or non-numeric bases would give
// negative/NaN spacing, so fall back to the default.
const effectiveBase = computed(() => {
  const n = Number(baseSpacing.value);
  return baseSpacing.value === '' || !Number.isFinite(n) || n <= 0 ? DEFAULT_BASE : n;
});

// A ratio of 1 or less makes the scale flat or inverted (and 0 divides by zero),
// so anything outside (1, 4] falls back to the default.
const currentRatio = computed(() => {
  if (selectedRatio.value === 'custom') {
    const n = Number(customRatio.value);
    return customRatio.value === '' || !Number.isFinite(n) || n <= 1 || n > 4 ? DEFAULT_RATIO : n;
  }
  return ratios[selectedRatio.value] ?? DEFAULT_RATIO;
});

const computedSpacingScale = computed(() => {
  const ratio = currentRatio.value;
  const base = effectiveBase.value;
  
  // Generate scale: xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl
  // Using negative powers for smaller values and positive for larger
  return {
    xs: Math.round(base / Math.pow(ratio, 2)),
    sm: Math.round(base / ratio),
    base: base,
    md: Math.round(base * ratio),
    lg: Math.round(base * Math.pow(ratio, 2)),
    xl: Math.round(base * Math.pow(ratio, 3)),
    '2xl': Math.round(base * Math.pow(ratio, 4)),
    '3xl': Math.round(base * Math.pow(ratio, 5)),
    '4xl': Math.round(base * Math.pow(ratio, 6)),
    '5xl': Math.round(base * Math.pow(ratio, 7))
  };
});

// The bars in the scale list are drawn relative to the largest step
const largestStep = computed(() => Math.max(1, ...Object.values(computedSpacingScale.value)));

// The previews read these through v-bind() in <style>
const spaceXs = computed(() => `${computedSpacingScale.value.xs}px`);
const spaceSm = computed(() => `${computedSpacingScale.value.sm}px`);
const spaceBase = computed(() => `${computedSpacingScale.value.base}px`);
const spaceMd = computed(() => `${computedSpacingScale.value.md}px`);

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

const exportFormat = (format) => {
  const scale = computedSpacingScale.value;
  
  if (format === 'css') {
    let css = ':root {\n';
    Object.entries(scale).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value}px;\n`;
    });
    css += '}\n\n';
    css += '/* Usage example */\n';
    css += '.spacing-xs { padding: var(--spacing-xs); }\n';
    css += '.spacing-sm { padding: var(--spacing-sm); }\n';
    css += '.spacing-base { padding: var(--spacing-base); }\n';
    
    downloadFile(css, 'text/css', `spacing-scale-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      spacing: {\n`;
    Object.entries(scale).forEach(([name, value]) => {
      config += `        '${name}': '${value}px',\n`;
    });
    config += `      },\n    },\n  },\n};\n`;
    
    downloadFile(config, 'text/javascript', `spacing-scale-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'spacing-scale',
      base: effectiveBase.value,
      ratio: currentRatio.value,
      ratioName: selectedRatio.value,
      scale: scale
    };
    
    downloadFile(JSON.stringify(config, null, 2), 'application/json', `spacing-scale-${Date.now()}.json`);
  }
};
</script>

<style scoped>
.sample-card {
  padding: v-bind(spaceMd);
}
.sample-actions {
  gap: v-bind(spaceSm);
}
.sample-button {
  padding: v-bind(spaceSm) v-bind(spaceMd);
}
.sample-grid {
  gap: v-bind(spaceBase);
  padding: v-bind(spaceSm);
}
.sample-cell {
  padding: v-bind(spaceXs);
}
</style>
