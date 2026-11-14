<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Font scale generator"
      lead="Generate consistent typography scales using mathematical ratios. Create harmonious heading and body text sizes for your design system."
      spot="tools/font-scale"
      size="tool"
    />

    <PageSection title="Settings" description="Pick a base size and a ratio.">
      <UiPanel>
        <div class="grid lg:grid-cols-2 gap-6">
          <UiInput
            v-model="fontSize"
            type="number"
            label="Base font size"
            suffix="px"
            hint="Starting value for your typography scale"
            min="12"
            max="72"
            step="1"
          />
          <div class="flex flex-col gap-3">
            <UiSelect v-model="selectedRatio" label="Ratio" :options="ratioOptions" />
            <UiInput
              v-if="selectedRatio === 'custom'"
              v-model="customRatio"
              type="number"
              label="Custom ratio"
              hint="Between 1.1 and 2.0"
              min="1.1"
              max="2.0"
              step="0.001"
              placeholder="1.333"
            />
          </div>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection title="Scale" description="Each step is the one below it times the ratio." divided>
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Font scale" flush>
          <ul class="divide-y divide-line-faint">
            <li v-for="(size, name) in computedTypographyScale" :key="name" class="flex items-center gap-4 px-6 py-3">
              <span class="scale-badge" aria-hidden="true">{{ name.charAt(0).toUpperCase() }}</span>
              <span class="flex-1 min-w-0 font-medium text-ink truncate">{{ getSizeLabel(name) }}</span>
              <span class="font-code text-xs text-ink-secondary">{{ size }}px</span>
            </li>
          </ul>
        </UiPanel>

        <UiPanel title="Visual preview">
          <div class="rounded-tile border border-line bg-surface-sunken p-6 flex flex-col gap-3">
            <UiTypeSample tag="p" class="text-ink-strong" :size="computedTypographyScale.h1" weight="bold" :line-height="lineHeight">Article Title</UiTypeSample>
            <UiTypeSample tag="p" class="text-ink-secondary" :size="computedTypographyScale.body" :line-height="lineHeight">
              This is body text using <code class="font-code px-1 py-0.5 rounded-control bg-accent-subtle text-accent-text">{{ computedTypographyScale.body }}px</code> font size. The quick brown fox jumps over the lazy dog.
            </UiTypeSample>
            <UiTypeSample class="text-ink-muted" :size="computedTypographyScale.small" :line-height="lineHeight">Small caption text</UiTypeSample>
          </div>

          <div>
            <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Heading hierarchy</h3>
            <div class="flex flex-col gap-2 font-ui text-ink-strong">
              <UiTypeSample
                v-for="(level, index) in headingSamples"
                :key="level"
                :size="computedTypographyScale[level]"
                weight="bold"
                :line-height="lineHeight"
              >
                Heading {{ index + 1 }}
              </UiTypeSample>
            </div>
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Export" description="Download the scale as CSS custom properties, a Tailwind config or JSON." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton v-for="format in exportFormats" :key="format.value" :icon="format.icon" @click="exportFormat(format.value)">
          {{ format.label }}
        </UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiSelect } from '../components/ui';
import UiTypeSample from '../components/ui/UiTypeSample.vue';

const fontSize = ref(16);
const lineHeight = ref(1.4);
const letterSpacing = ref(0);
const selectedRatio = ref('perfect-fourth');
const customRatio = ref(1.333);

// Musical-interval ratios as used by modular type scales.
const ratios = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'perfect-fifth': 1.5,
  'golden-ratio': 1.618,
};

const ratioOptions = [
  { value: 'minor-third', label: 'Minor Third (1.2)' },
  { value: 'major-third', label: 'Major Third (1.25)' },
  { value: 'perfect-fourth', label: 'Perfect Fourth (1.333)' },
  { value: 'perfect-fifth', label: 'Perfect Fifth (1.5)' },
  { value: 'golden-ratio', label: 'Golden Ratio (1.618)' },
  { value: 'custom', label: 'Custom' }
];

const exportFormats = [
  { value: 'css', label: 'Export CSS', icon: 'code' },
  { value: 'tailwind', label: 'Export Tailwind', icon: 'settings' },
  { value: 'json', label: 'Export JSON', icon: 'data_object' },
];

const headingSamples = ['h1', 'h2', 'h3', 'h4'];

// Inputs are clamped to their min/max so an empty or out-of-range value
// can't produce NaN or a collapsing scale.
const baseSize = computed(() => {
  const n = Number(fontSize.value);
  if (!Number.isFinite(n) || n <= 0) return 16;
  return Math.min(72, Math.max(12, n));
});

const currentRatio = computed(() => {
  if (selectedRatio.value === 'custom') {
    const n = Number(customRatio.value);
    if (!Number.isFinite(n) || n <= 1) return 1.1;
    return Math.min(2, Math.max(1.1, n));
  }
  return ratios[selectedRatio.value] ?? ratios['perfect-fourth'];
});

const round2 = (n) => Math.round(n * 100) / 100;

// Modular scale: each heading level is one step (× ratio) above the next,
// with h6 and body text at the base size and small text one step below.
const computedTypographyScale = computed(() => {
  const ratio = currentRatio.value;
  const base = baseSize.value;
  const step = (n) => round2(base * Math.pow(ratio, n));
  return {
    h1: step(5),
    h2: step(4),
    h3: step(3),
    h4: step(2),
    h5: step(1),
    h6: step(0),
    body: step(0),
    small: step(-1)
  };
});

const getSizeLabel = (name) => {
  const labels = {
    'h1': 'Heading 1',
    'h2': 'Heading 2',
    'h3': 'Heading 3',
    'h4': 'Heading 4',
    'h5': 'Heading 5',
    'h6': 'Heading 6',
    'body': 'Body Text',
    'small': 'Small Text'
  };
  return labels[name] || name;
};

const downloadText = (text, type, filename) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke once the click has been handled, or the download can be cancelled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const exportFormat = (format) => {
  const scale = computedTypographyScale.value;
  
  if (format === 'css') {
    let css = ':root {\n';
    Object.entries(scale).forEach(([name, value]) => {
      css += `  --font-size-${name}: ${value}px;\n`;
    });
    css += `  --line-height: ${lineHeight.value};\n`;
    css += '}\n\n';
    css += '/* Usage example */\n';
    css += '.text-h1 { font-size: var(--font-size-h1); }\n';
    css += '.text-h2 { font-size: var(--font-size-h2); }\n';
    css += '.text-body { font-size: var(--font-size-body); }\n';
    downloadText(css, 'text/css', `font-scale-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n`;
    Object.entries(scale).forEach(([name, value]) => {
      config += `        '${name}': '${value}px',\n`;
    });
    config += `      },\n    },\n  },\n};\n`;
    downloadText(config, 'text/javascript', `font-scale-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'font-scale',
      base: baseSize.value,
      ratio: currentRatio.value,
      ratioName: selectedRatio.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
      scale: scale
    };
    downloadText(JSON.stringify(config, null, 2), 'application/json', `font-scale-${Date.now()}.json`);
  }
};
</script>

<style scoped>
.scale-badge {
  @apply flex items-center justify-center w-8 h-8 shrink-0 rounded-control bg-accent-subtle text-xs font-bold text-accent-text;
}
</style>
