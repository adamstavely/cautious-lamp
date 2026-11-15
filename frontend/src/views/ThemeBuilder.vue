<template>
  <PageShell width="wide">
    <PageHero
      size="tool"
      :back="{ to: '/review', label: 'Review' }"
      title="Theme builder"
      lead="Set a theme's colours for light and dark, its type and spacing, check the contrast, then export it as CSS, SCSS or JSON."
      spot="foundations/theme-builder"
    />

    <PageSection title="Build" description="Changes show in the preview and the code as you make them.">
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="space-y-6">
          <!-- style-check: allow the description shows the hex format the user types -->
          <UiPanel title="Colours" description="Hex values, e.g. #2f5ea8 or #fff.">
            <div class="space-y-4">
              <UiSegmented v-model="editMode" label="Editing" :options="modeOptions" />
              <div v-for="role in COLOR_ROLES" :key="role.name" class="grid grid-cols-content-aside items-start gap-2">
                <UiInput
                  v-model="colors[editMode][role.name]"
                  :label="role.label"
                  :hint="role.hint"
                  :error="colorError(editMode, role.name)"
                  mono
                  spellcheck="false"
                />
                <UiInput
                  :model-value="normalizeHex(colors[editMode][role.name]) || PICKER_FALLBACK"
                  type="color"
                  label="Picker"
                  :aria-label="`${role.label} colour picker`"
                  class="tb-picker"
                  @update:model-value="colors[editMode][role.name] = $event"
                />
              </div>
            </div>
          </UiPanel>

          <UiPanel title="Typography">
            <div class="space-y-4">
              <UiSelect v-model="typography.font" label="Font family" :options="FONT_OPTIONS" hint="The preview uses the font when it's installed here; the exported stack falls back to system fonts." />
              <UiRange v-model="typography.baseSize" label="Base font size" :min="12" :max="20" unit="px" />
            </div>
          </UiPanel>

          <UiPanel title="Spacing scale">
            <div class="grid grid-cols-2 gap-3">
              <UiInput
                v-for="step in SPACING_STEPS"
                :key="step"
                v-model.number="spacing[step]"
                type="number"
                :label="step"
                suffix="px"
                min="0"
                max="128"
                :error="spacingError(step)"
              />
            </div>
          </UiPanel>

          <div class="flex flex-wrap gap-3">
            <UiButton variant="primary" icon="download" :disabled="hasErrors" @click="exportTheme">Export {{ formatLabel }}</UiButton>
            <UiButton icon="rotate-ccw" @click="resetTheme">Reset</UiButton>
          </div>
          <UiCallout v-if="hasErrors" tone="warning" role="status">Fix the highlighted values to export. The preview and code keep the last valid values.</UiCallout>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <UiPanel title="Preview">
            <template #actions>
              <UiSegmented v-model="previewMode" aria-label="Preview mode" :options="modeOptions" />
            </template>
            <div class="tb-preview" :aria-label="`Theme preview, ${previewMode} mode`" role="group">
              <p class="tb-heading">Heading example</p>
              <p class="tb-text">This paragraph shows body text in your theme's font, size and text colour.</p>
              <div class="tb-surface">
                <p class="tb-text">A card on the surface colour, with a <span class="tb-accent">secondary accent</span>.</p>
              </div>
              <div class="tb-actions">
                <span class="tb-button tb-button-primary">Primary button</span>
                <span class="tb-button tb-button-secondary">Secondary button</span>
              </div>
            </div>

            <h3 class="tb-checks-title">Contrast in {{ previewMode }} mode</h3>
            <ul class="tb-checks">
              <li v-for="check in contrastChecks" :key="check.label" class="tb-check">
                <span>{{ check.label }}</span>
                <span class="tb-check-result">
                  <span class="tabular-nums">{{ check.ratio.toFixed(2) }}:1</span>
                  <UiChip :tone="check.tone" :icon="check.pass ? 'circle-check' : 'triangle-alert'">{{ check.verdict }}</UiChip>
                </span>
              </li>
            </ul>
          </UiPanel>

          <UiPanel title="Theme code">
            <template #actions>
              <UiSegmented v-model="codeFormat" aria-label="Code format" :options="FORMAT_OPTIONS" />
            </template>
            <UiCodeBlock :code="themeCode" :label="formatLabel" />
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCodeBlock,
  UiInput,
  UiPanel,
  UiRange,
  UiSegmented,
  UiSelect,
} from '../components/ui';
import { contrastRatio, normalizeHex, readableOn, wcagLevel } from '../utils/contrast.js';

const COLOR_ROLES = [
  { name: 'primary', label: 'Primary', hint: 'Primary buttons and links' },
  { name: 'secondary', label: 'Secondary', hint: 'Accents and highlights' },
  { name: 'background', label: 'Background', hint: 'The page' },
  { name: 'surface', label: 'Surface', hint: 'Cards and panels' },
  { name: 'text', label: 'Text', hint: 'Body text and headings' },
];

// The theme's own colours are data the user edits, not this page's styling
const PICKER_FALLBACK = '#000000';
const DEFAULT_COLORS = {
  light: { primary: '#4f46e5', secondary: '#0e7490', background: '#ffffff', surface: '#f1f5f9', text: '#0f172a' },
  // style-check: allow "dark" is the theme's dark-mode palette
  dark: { primary: '#a5b4fc', secondary: '#67e8f9', background: '#0f172a', surface: '#1e293b', text: '#f1f5f9' },
};

const FONT_OPTIONS = [
  { value: 'system', label: 'System UI', stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { value: 'inter', label: 'Inter', stack: '"Inter", system-ui, sans-serif' },
  { value: 'roboto', label: 'Roboto', stack: '"Roboto", system-ui, sans-serif' },
  { value: 'source-sans', label: 'Source Sans 3', stack: '"Source Sans 3", system-ui, sans-serif' },
  { value: 'georgia', label: 'Georgia (serif)', stack: 'Georgia, "Times New Roman", serif' },
  { value: 'mono', label: 'Monospace', stack: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
];

const SPACING_STEPS = ['xs', 'sm', 'md', 'lg', 'xl'];
const DEFAULT_SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const DEFAULT_TYPOGRAPHY = { font: 'inter', baseSize: 16 };

const FORMAT_OPTIONS = [
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
];
const modeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const colors = ref(clone(DEFAULT_COLORS));
const typography = ref({ ...DEFAULT_TYPOGRAPHY });
const spacing = ref({ ...DEFAULT_SPACING });
const editMode = ref('light');
const previewMode = ref('light');
const codeFormat = ref('css');

// Validation: invalid entries are flagged and replaced by the last valid value
const lastValid = { colors: clone(DEFAULT_COLORS), spacing: { ...DEFAULT_SPACING } };

const colorError = (mode, name) => (normalizeHex(colors.value[mode][name]) ? '' : 'Use a hex colour like #2f5ea8');
const validSpacing = (value) => Number.isFinite(value) && value >= 0 && value <= 128;
const spacingError = (step) => (validSpacing(spacing.value[step]) ? '' : '0 to 128');

const resolvedColors = computed(() => {
  // style-check: allow "dark" is the theme's dark-mode palette
  const out = { light: {}, dark: {} };
  for (const mode of ['light', 'dark']) {
    for (const { name } of COLOR_ROLES) {
      const hex = normalizeHex(colors.value[mode][name]);
      if (hex) lastValid.colors[mode][name] = hex;
      out[mode][name] = lastValid.colors[mode][name];
    }
    out[mode].onPrimary = readableOn(out[mode].primary);
  }
  return out;
});

const resolvedSpacing = computed(() => {
  const out = {};
  for (const step of SPACING_STEPS) {
    if (validSpacing(spacing.value[step])) lastValid.spacing[step] = spacing.value[step];
    out[step] = lastValid.spacing[step];
  }
  return out;
});

const hasErrors = computed(
  () =>
    ['light', 'dark'].some((mode) => COLOR_ROLES.some(({ name }) => colorError(mode, name))) ||
    SPACING_STEPS.some((step) => spacingError(step)),
);

const fontStack = computed(() => (FONT_OPTIONS.find((f) => f.value === typography.value.font) ?? FONT_OPTIONS[0]).stack);
const formatLabel = computed(() => FORMAT_OPTIONS.find((f) => f.value === codeFormat.value).label);

// Preview values, passed to the stylesheet through v-bind()
const preview = computed(() => resolvedColors.value[previewMode.value]);
const px = (n) => `${n}px`;
const previewVars = computed(() => ({
  base: px(typography.value.baseSize),
  heading: px(Math.round(typography.value.baseSize * 1.5)),
  sm: px(resolvedSpacing.value.sm),
  md: px(resolvedSpacing.value.md),
  lg: px(resolvedSpacing.value.lg),
  xl: px(resolvedSpacing.value.xl),
}));

const contrastChecks = computed(() => {
  const c = preview.value;
  const pairs = [
    { label: 'Text on background', fg: c.text, bg: c.background, min: 4.5 },
    { label: 'Text on surface', fg: c.text, bg: c.surface, min: 4.5 },
    { label: 'Button text on primary', fg: c.onPrimary, bg: c.primary, min: 4.5 },
    { label: 'Primary on background (links, outlines)', fg: c.primary, bg: c.background, min: 4.5 },
    { label: 'Secondary on surface', fg: c.secondary, bg: c.surface, min: 3 },
  ];
  return pairs.map(({ label, fg, bg, min }) => {
    const ratio = contrastRatio(fg, bg);
    const pass = ratio >= min;
    const level = wcagLevel(ratio);
    const verdict = min === 3 ? (pass ? 'AA large / UI' : 'Below 3:1') : level === 'Fail' ? 'Below AA' : level;
    return { label, ratio, pass, verdict, tone: pass ? 'success' : 'danger' };
  });
});

const themeCode = computed(() => {
  const { light, dark } = resolvedColors.value;
  const s = resolvedSpacing.value;
  const font = fontStack.value;
  const base = `${typography.value.baseSize}px`;
  const colorLines = (set, indent, fmt) =>
    [...COLOR_ROLES.map(({ name }) => [name, set[name]]), ['on-primary', set.onPrimary]].map(([k, v]) => indent + fmt(k, v));

  if (codeFormat.value === 'css') {
    return [
      ':root {',
      ...colorLines(light, '  ', (k, v) => `--color-${k}: ${v};`),
      `  --font-family: ${font};`,
      `  --font-size-base: ${base};`,
      ...SPACING_STEPS.map((step) => `  --spacing-${step}: ${s[step]}px;`),
      '}',
      '',
      '@media (prefers-color-scheme: dark) {',
      '  :root {',
      ...colorLines(dark, '    ', (k, v) => `--color-${k}: ${v};`),
      '  }',
      '}',
    ].join('\n');
  }
  if (codeFormat.value === 'scss') {
    const map = (name, set) => [`$colors-${name}: (`, ...colorLines(set, '  ', (k, v) => `${k}: ${v},`), ');'];
    return [
      ...map('light', light),
      '',
      ...map('dark', dark),
      '',
      `$font-family: ${font};`,
      `$font-size-base: ${base};`,
      '',
      '$spacing: (',
      ...SPACING_STEPS.map((step) => `  ${step}: ${s[step]}px,`),
      ');',
    ].join('\n');
  }
  const asObject = (set) => Object.fromEntries([...COLOR_ROLES.map(({ name }) => [name, set[name]]), ['onPrimary', set.onPrimary]]);
  return JSON.stringify(
    {
      // style-check: allow "dark" is the theme's dark-mode palette
      colors: { light: asObject(light), dark: asObject(dark) },
      typography: { fontFamily: font, baseSize: base },
      spacing: Object.fromEntries(SPACING_STEPS.map((step) => [step, `${s[step]}px`])),
    },
    null,
    2,
  );
});

const MIME = { css: 'text/css', scss: 'text/x-scss', json: 'application/json' };
const exportTheme = () => {
  if (hasErrors.value) return;
  const url = URL.createObjectURL(new Blob([themeCode.value], { type: MIME[codeFormat.value] }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `theme.${codeFormat.value}`;
  link.click();
  // Let the download start before the URL goes
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const resetTheme = () => {
  colors.value = clone(DEFAULT_COLORS);
  typography.value = { ...DEFAULT_TYPOGRAPHY };
  spacing.value = { ...DEFAULT_SPACING };
};
</script>

<style scoped>
.tb-picker {
  @apply w-16;
}

/* The preview shows the user's theme, so its colours and sizes come from v-bind() */
.tb-preview {
  @apply rounded-card border border-line;
  background: v-bind('preview.background');
  color: v-bind('preview.text');
  font-family: v-bind(fontStack);
  font-size: v-bind('previewVars.base');
  padding: v-bind('previewVars.xl');
}
.tb-heading {
  @apply font-semibold leading-tight;
  font-size: v-bind('previewVars.heading');
}
.tb-text {
  @apply leading-relaxed;
  margin-top: v-bind('previewVars.md');
}
.tb-surface {
  @apply rounded-card;
  background: v-bind('preview.surface');
  margin-top: v-bind('previewVars.lg');
  padding: v-bind('previewVars.lg');
}
.tb-surface .tb-text {
  @apply mt-0;
}
.tb-accent {
  @apply font-semibold;
  color: v-bind('preview.secondary');
}
.tb-actions {
  @apply flex flex-wrap;
  gap: v-bind('previewVars.sm');
  margin-top: v-bind('previewVars.lg');
}
.tb-button {
  @apply inline-flex items-center rounded-pill border-2 border-solid px-5 py-2 font-medium;
}
.tb-button-primary {
  background: v-bind('preview.primary');
  border-color: v-bind('preview.primary');
  color: v-bind('preview.onPrimary');
}
.tb-button-secondary {
  @apply bg-transparent;
  border-color: v-bind('preview.primary');
  color: v-bind('preview.primary');
}

.tb-checks-title {
  @apply mt-6 mb-2 text-sm font-semibold text-ink;
}
.tb-checks {
  @apply divide-y divide-line-faint;
}
.tb-check {
  @apply flex flex-wrap items-center justify-between gap-2 py-2 text-sm text-ink-secondary;
}
.tb-check-result {
  @apply flex items-center gap-2 text-ink;
}
</style>
