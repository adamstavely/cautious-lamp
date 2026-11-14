<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Loading spinner generator"
      lead="Create customizable loading animations including spinners, dots, bars, skeleton loaders, and pulse effects. Generate React or Vue components with CSS animations."
      spot="tools/loading-spinner-generator"
      size="tool"
    />

    <PageSection title="Build" description="Pick a style, colour, size and speed, then export the component.">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UiPanel title="Configuration" class="lg:col-span-1">
          <div class="space-y-5">
            <UiSegmented v-model="config.style" label="Style" :options="spinnerStyles" />
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput v-model="config.color" label="Color" mono :placeholder="DEFAULT_COLOR" />
              <UiInput v-model="config.color" type="color" label="Picker" aria-label="Color picker" />
            </div>
            <UiSelect v-model="config.size" label="Size" :options="sizeOptions" />
            <UiRange v-model="config.speed" label="Speed" hint="Seconds per cycle: lower is faster." :min="0.5" :max="3" :step="0.1" unit="s" />
            <div v-if="config.style === 'skeleton'" class="grid grid-cols-2 gap-3">
              <UiInput v-model="config.skeletonRows" type="number" label="Rows" min="1" max="10" />
              <UiInput v-model="config.skeletonColumns" type="number" label="Columns" min="1" max="5" />
            </div>
          </div>
        </UiPanel>

        <div class="space-y-6 lg:col-span-2">
          <UiPanel title="Preview">
            <div class="flex min-h-80 items-center justify-center rounded-tile bg-surface-sunken p-12" role="status" aria-label="Loading">
              <div v-if="config.style === 'spinner'" class="spin-spinner"></div>

              <div v-if="config.style === 'dots'" class="flex gap-2">
                <div v-for="i in 3" :key="i" class="spin-dot" :class="`spin-dot-${i}`"></div>
              </div>

              <div v-if="config.style === 'bars'" class="spin-bars flex items-end gap-1">
                <div v-for="i in 5" :key="i" class="spin-bar" :class="`spin-bar-${i}`"></div>
              </div>

              <div v-if="config.style === 'skeleton'" class="w-full space-y-3">
                <div v-for="row in skeletonRowCount" :key="row" class="flex gap-3">
                  <div v-for="col in skeletonColumnCount" :key="col" class="spin-skeleton"></div>
                </div>
              </div>

              <div v-if="config.style === 'pulse'" class="spin-pulse"></div>
            </div>
          </UiPanel>

          <UiPanel title="Export">
            <div class="space-y-4">
              <UiSegmented v-model="selectedExportFormat" label="Export format" :options="exportFormats" />
              <InlineNotice :notice="notice" @dismiss="clearNotice" />
              <UiCodeBlock :code="generatedCode" :label="exportLabel" @copied="onCopied" @copy-failed="onCopyFailed" />
            </div>
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiCodeBlock, UiInput, UiPanel, UiRange, UiSegmented, UiSelect } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const spinnerStyles = [
  { label: 'Spinner', value: 'spinner', icon: 'refresh' },
  { label: 'Dots', value: 'dots', icon: 'more_horiz' },
  { label: 'Bars', value: 'bars', icon: 'equalizer' },
  { label: 'Skeleton', value: 'skeleton', icon: 'view_agenda' },
  { label: 'Pulse', value: 'pulse', icon: 'radio_button_checked' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'CSS', value: 'css' }
];

const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' }
];

const DEFAULT_COLOR = '#6366f1';

const config = ref({
  style: 'spinner',
  color: '#6366f1',
  size: 'md',
  speed: 1,
  skeletonRows: 3,
  skeletonColumns: 2
});

const selectedExportFormat = ref('react');

const SIZE_MAP = {
  sm: { spinner: '32px', dot: '8px', bar: '4px', pulse: '32px' },
  md: { spinner: '48px', dot: '12px', bar: '6px', pulse: '48px' },
  lg: { spinner: '64px', dot: '16px', bar: '8px', pulse: '64px' }
};
const BAR_HEIGHTS = ['20%', '40%', '60%', '40%', '20%'];

const KEYFRAMES = {
  spinner: '@keyframes spinner-rotate {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}',
  dots: '@keyframes spinner-dot-bounce {\n  0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }\n  40% { transform: translateY(-10px); opacity: 1; }\n}',
  bars: '@keyframes spinner-bar-bounce {\n  0%, 100% { transform: scaleY(0.4); }\n  50% { transform: scaleY(1); }\n}',
  skeleton: '@keyframes skeleton-pulse {\n  0%, 100% { opacity: 0.1; }\n  50% { opacity: 0.2; }\n}',
  pulse: '@keyframes spinner-pulse-scale {\n  0%, 100% { transform: scale(1); opacity: 1; }\n  50% { transform: scale(1.2); opacity: 0.7; }\n}'
};

const clampInt = (value, min, max, fallback) => {
  const n = Math.round(Number(value));
  return value === '' || !Number.isFinite(n) ? fallback : Math.min(max, Math.max(min, n));
};

// Number inputs can be cleared or typed out of range; v-for needs a sane integer.
const skeletonRowCount = computed(() => clampInt(config.value.skeletonRows, 1, 10, 3));
const skeletonColumnCount = computed(() => clampInt(config.value.skeletonColumns, 1, 5, 2));

const speed = computed(() => {
  const n = Number(config.value.speed);
  return Number.isFinite(n) && n > 0 ? n : 1;
});

// The text colour input accepts anything; "#rrggbb" + "20" is only valid for
// 6-digit hex, so expand 3-digit hex and fall back to color-mix otherwise.
const withAlpha = (color, alphaHex = '20') => {
  const value = String(color || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return `${value}${alphaHex}`;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value.slice(1).split('').map((c) => c + c).join('')}${alphaHex}`;
  }
  const percent = Math.round((parseInt(alphaHex, 16) / 255) * 1000) / 10;
  return `color-mix(in srgb, ${value || '#6366f1'} ${percent}%, transparent)`;
};

const getSizeValue = () => SIZE_MAP[config.value.size] || SIZE_MAP.md;

// The preview's colour, sizes and speed are the user's design: they reach CSS
// through v-bind() in the <style> block
const sizes = computed(() => getSizeValue());
const trackColor = computed(() => withAlpha(config.value.color));
const duration = computed(() => `${speed.value}s`);

const COMPONENT_NAMES = {
  spinner: 'Spinner',
  dots: 'DotsSpinner',
  bars: 'BarsSpinner',
  skeleton: 'SkeletonLoader',
  pulse: 'PulseLoader'
};

// JSX markup per style; `s` is the size entry for the chosen size.
const reactMarkup = (style) => ({
  spinner: `<div
        style={{
          width: sizes.spinner,
          height: sizes.spinner,
          border: \`4px solid \${trackColor}\`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: \`spinner-rotate \${speed}s linear infinite\`
        }}
      />`,
  dots: `<div style={{ display: 'flex', gap: '0.5rem' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: sizes.dot,
              height: sizes.dot,
              borderRadius: '50%',
              backgroundColor: color,
              animation: \`spinner-dot-bounce \${speed}s ease-in-out infinite\`,
              animationDelay: \`\${i * 0.15}s\`
            }}
          />
        ))}
      </div>`,
  bars: `<div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: sizes.spinner }}>
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            style={{
              width: sizes.bar,
              height,
              borderRadius: '2px',
              backgroundColor: color,
              transformOrigin: 'bottom',
              animation: \`spinner-bar-bounce \${speed}s ease-in-out infinite\`,
              animationDelay: \`\${i * 0.1}s\`
            }}
          />
        ))}
      </div>`,
  skeleton: `<div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', gap: '0.75rem' }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                style={{
                  flex: 1,
                  height: '60px',
                  borderRadius: '4px',
                  backgroundColor: color,
                  opacity: 0.1,
                  animation: \`skeleton-pulse \${speed}s ease-in-out infinite\`
                }}
              />
            ))}
          </div>
        ))}
      </div>`,
  pulse: `<div
        style={{
          width: sizes.pulse,
          height: sizes.pulse,
          borderRadius: '50%',
          backgroundColor: color,
          animation: \`spinner-pulse-scale \${speed}s ease-in-out infinite\`
        }}
      />`
}[style]);

const vueMarkup = (style) => ({
  spinner: `<div
      :style="{
        width: sizes.spinner,
        height: sizes.spinner,
        border: \`4px solid \${trackColor}\`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: \`spinner-rotate \${speed}s linear infinite\`
      }"
    ></div>`,
  dots: `<div style="display: flex; gap: 0.5rem">
      <div
        v-for="i in 3"
        :key="i"
        :style="{
          width: sizes.dot,
          height: sizes.dot,
          borderRadius: '50%',
          backgroundColor: color,
          animation: \`spinner-dot-bounce \${speed}s ease-in-out infinite\`,
          animationDelay: \`\${(i - 1) * 0.15}s\`
        }"
      ></div>
    </div>`,
  bars: `<div :style="{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', height: sizes.spinner }">
      <div
        v-for="(height, i) in BAR_HEIGHTS"
        :key="i"
        :style="{
          width: sizes.bar,
          height,
          borderRadius: '2px',
          backgroundColor: color,
          transformOrigin: 'bottom',
          animation: \`spinner-bar-bounce \${speed}s ease-in-out infinite\`,
          animationDelay: \`\${i * 0.1}s\`
        }"
      ></div>
    </div>`,
  skeleton: `<div style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem">
      <div v-for="row in rows" :key="row" style="display: flex; gap: 0.75rem">
        <div
          v-for="col in columns"
          :key="col"
          :style="{
            flex: 1,
            height: '60px',
            borderRadius: '4px',
            backgroundColor: color,
            opacity: 0.1,
            animation: \`skeleton-pulse \${speed}s ease-in-out infinite\`
          }"
        ></div>
      </div>
    </div>`,
  pulse: `<div
      :style="{
        width: sizes.pulse,
        height: sizes.pulse,
        borderRadius: '50%',
        backgroundColor: color,
        animation: \`spinner-pulse-scale \${speed}s ease-in-out infinite\`
      }"
    ></div>`
}[style]);

const cssMarkup = (style) => {
  const sizes = getSizeValue();
  const color = config.value.color;
  const s = speed.value;
  switch (style) {
    case 'dots':
      return {
        css: `.loader-dots {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.loader-dots > span {\n  width: ${sizes.dot};\n  height: ${sizes.dot};\n  border-radius: 50%;\n  background-color: ${color};\n  animation: spinner-dot-bounce ${s}s ease-in-out infinite;\n}\n\n.loader-dots > span:nth-child(2) { animation-delay: 0.15s; }\n.loader-dots > span:nth-child(3) { animation-delay: 0.3s; }`,
        html: '<div class="loader-dots" role="status" aria-label="Loading"><span></span><span></span><span></span></div>'
      };
    case 'bars':
      return {
        css: `.loader-bars {\n  display: flex;\n  gap: 0.25rem;\n  align-items: flex-end;\n  height: ${sizes.spinner};\n}\n\n.loader-bars > span {\n  width: ${sizes.bar};\n  border-radius: 2px;\n  background-color: ${color};\n  transform-origin: bottom;\n  animation: spinner-bar-bounce ${s}s ease-in-out infinite;\n}\n\n${BAR_HEIGHTS.map((h, i) => `.loader-bars > span:nth-child(${i + 1}) { height: ${h}; animation-delay: ${Math.round(i * 10) / 100}s; }`).join('\n')}`,
        html: '<div class="loader-bars" role="status" aria-label="Loading"><span></span><span></span><span></span><span></span><span></span></div>'
      };
    case 'skeleton':
      return {
        css: `.skeleton {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n\n.skeleton-row {\n  display: flex;\n  gap: 0.75rem;\n}\n\n.skeleton-cell {\n  flex: 1;\n  height: 60px;\n  border-radius: 4px;\n  background-color: ${color};\n  opacity: 0.1;\n  animation: skeleton-pulse ${s}s ease-in-out infinite;\n}`,
        html: `<div class="skeleton" role="status" aria-label="Loading">\n${Array.from({ length: skeletonRowCount.value }, () => `  <div class="skeleton-row">${'<div class="skeleton-cell"></div>'.repeat(skeletonColumnCount.value)}</div>`).join('\n')}\n</div>`
      };
    case 'pulse':
      return {
        css: `.loader-pulse {\n  width: ${sizes.pulse};\n  height: ${sizes.pulse};\n  border-radius: 50%;\n  background-color: ${color};\n  animation: spinner-pulse-scale ${s}s ease-in-out infinite;\n}`,
        html: '<div class="loader-pulse" role="status" aria-label="Loading"></div>'
      };
    default:
      return {
        css: `.spinner {\n  width: ${sizes.spinner};\n  height: ${sizes.spinner};\n  border: 4px solid ${withAlpha(color)};\n  border-top-color: ${color};\n  border-radius: 50%;\n  animation: spinner-rotate ${s}s linear infinite;\n}`,
        html: '<div class="spinner" role="status" aria-label="Loading"></div>'
      };
  }
};

const generatedCode = computed(() => {
  const style = config.value.style in KEYFRAMES ? config.value.style : 'spinner';
  const name = COMPONENT_NAMES[style];
  const q = (value) => JSON.stringify(String(value ?? ''));
  const keyframes = KEYFRAMES[style];
  const isSkeleton = style === 'skeleton';

  if (selectedExportFormat.value === 'react') {
    return `import React from 'react';

const KEYFRAMES = ${JSON.stringify(keyframes)};

const SIZE_MAP: Record<string, Record<string, string>> = ${JSON.stringify(SIZE_MAP, null, 2)};
${style === 'bars' ? `\nconst BAR_HEIGHTS = ${JSON.stringify(BAR_HEIGHTS)};\n` : ''}
export interface ${name}Props {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  trackColor?: string;
  speed?: number;
  label?: string;${isSkeleton ? '\n  rows?: number;\n  columns?: number;' : ''}
}

export const ${name}: React.FC<${name}Props> = ({
  size = ${q(config.value.size)},
  color = ${q(config.value.color)},
  trackColor = ${q(withAlpha(config.value.color))},
  speed = ${speed.value},
  label = 'Loading'${isSkeleton ? `,\n  rows = ${skeletonRowCount.value},\n  columns = ${skeletonColumnCount.value}` : ''}
}) => {
  const sizes = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div role="status" aria-label={label}${isSkeleton ? ' style={{ width: \'100%\' }}' : ''}>
      <style>{KEYFRAMES}</style>
      ${reactMarkup(style)}
    </div>
  );
};`;
  }

  if (selectedExportFormat.value === 'vue') {
    const templateOpen = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateClose = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupOpen = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    return templateOpen + `
  <div role="status" :aria-label="label"${isSkeleton ? ' style="width: 100%"' : ''}>
    ${vueMarkup(style)}
  </div>
` + templateClose + `

` + scriptSetupOpen + `
import { computed } from 'vue';

const props = defineProps({
  size: { type: String, default: ${q(config.value.size)} },
  color: { type: String, default: ${q(config.value.color)} },
  trackColor: { type: String, default: ${q(withAlpha(config.value.color))} },
  speed: { type: Number, default: ${speed.value} },
  label: { type: String, default: 'Loading' }${isSkeleton ? `,\n  rows: { type: Number, default: ${skeletonRowCount.value} },\n  columns: { type: Number, default: ${skeletonColumnCount.value} }` : ''}
});

const SIZE_MAP = ${JSON.stringify(SIZE_MAP, null, 2)};
${style === 'bars' ? `const BAR_HEIGHTS = ${JSON.stringify(BAR_HEIGHTS)};\n` : ''}
const sizes = computed(() => SIZE_MAP[props.size] || SIZE_MAP.md);
` + scriptClose + `

<style>
${keyframes}
</style>`;
  }

  const { css, html } = cssMarkup(style);
  return `/* CSS for ${name} */
${keyframes}

${css}

/* Usage:
${html}
*/`;
});

const exportLabel = computed(() => exportFormats.find((f) => f.value === selectedExportFormat.value)?.label ?? 'Code');

// UiCodeBlock copies the code; these report the result
const onCopied = () => showNotice('Code copied to clipboard.', 'success');
const onCopyFailed = () => showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
</script>

<style scoped>
.spin-spinner {
  width: v-bind('sizes.spinner');
  height: v-bind('sizes.spinner');
  border: 4px solid v-bind(trackColor);
  border-top-color: v-bind('config.color');
  border-radius: 50%;
  animation: spinner-rotate v-bind(duration) linear infinite;
}
.spin-dot {
  width: v-bind('sizes.dot');
  height: v-bind('sizes.dot');
  background-color: v-bind('config.color');
  border-radius: 50%;
  animation: spinner-dot-bounce v-bind(duration) ease-in-out infinite;
}
.spin-dot-2 { animation-delay: 0.15s; }
.spin-dot-3 { animation-delay: 0.3s; }
.spin-bars {
  height: v-bind('sizes.spinner');
}
.spin-bar {
  width: v-bind('sizes.bar');
  background-color: v-bind('config.color');
  border-radius: 2px;
  transform-origin: bottom;
  animation: spinner-bar-bounce v-bind(duration) ease-in-out infinite;
}
.spin-bar-1 { height: 20%; }
.spin-bar-2 { height: 40%; animation-delay: 0.1s; }
.spin-bar-3 { height: 60%; animation-delay: 0.2s; }
.spin-bar-4 { height: 40%; animation-delay: 0.3s; }
.spin-bar-5 { height: 20%; animation-delay: 0.4s; }
.spin-skeleton {
  flex: 1;
  height: 3.75rem;
  background-color: v-bind('config.color');
  opacity: 0.1;
  border-radius: 4px;
  animation: skeleton-pulse v-bind(duration) ease-in-out infinite;
}
.spin-pulse {
  width: v-bind('sizes.pulse');
  height: v-bind('sizes.pulse');
  background-color: v-bind('config.color');
  border-radius: 50%;
  animation: spinner-pulse-scale v-bind(duration) ease-in-out infinite;
}

@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spinner-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
  40% { transform: translateY(-10px); opacity: 1; }
}
@keyframes spinner-bar-bounce {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}
@keyframes spinner-pulse-scale {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}
</style>
