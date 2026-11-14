<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Badge & ribbon generator"
      lead="Create customizable badges, labels, ribbons, and tags. Generate React or Vue components with all variants and states."
      spot="tools/badge-generator"
      size="tool"
    />

    <PageSection title="Build" description="Pick a style and state, set the colours, and preview every variant.">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UiPanel title="Configuration" class="lg:col-span-1">
          <div class="space-y-5">
            <UiSegmented v-model="config.style" label="Style" :options="badgeStyles" />
            <UiInput v-model="config.text" label="Text" placeholder="Badge text" />
            <UiSegmented v-model="config.state" label="State" :options="badgeStates" />
            <UiSelect v-model="config.size" label="Size" :options="sizeOptions" />
            <UiSelect v-model="config.icon" label="Icon" :options="iconOptions" />
            <UiSegmented v-if="config.icon" v-model="config.iconPosition" label="Icon position" :options="iconPositions" />
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput v-model="config.backgroundColor" label="Background color" mono :placeholder="DEFAULT_BG" />
              <UiInput v-model="config.backgroundColor" type="color" label="Picker" aria-label="Background color picker" />
            </div>
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput v-model="config.textColor" label="Text color" mono :placeholder="DEFAULT_TEXT" />
              <UiInput v-model="config.textColor" type="color" label="Picker" aria-label="Text color picker" />
            </div>
            <UiRange v-model="config.borderRadius" label="Border radius" :min="0" :max="50" unit="px" />
            <UiCheckbox v-model="config.hasShadow" label="Enable Shadow" />
          </div>
        </UiPanel>

        <div class="space-y-6 lg:col-span-2">
          <UiPanel title="Preview">
            <div class="rounded-tile bg-surface-sunken p-8">
              <span :class="badgeClasses(config.state)">
                <span v-if="config.icon && config.iconPosition === 'left'" class="material-symbols-outlined mr-1 text-sm" aria-hidden="true">{{ getIconName() }}</span>
                <span>{{ config.text || 'Badge' }}</span>
                <span v-if="config.icon && config.iconPosition === 'right'" class="material-symbols-outlined ml-1 text-sm" aria-hidden="true">{{ getIconName() }}</span>
              </span>

              <div class="mt-6 border-t border-line pt-6">
                <h3 class="mb-3 text-sm font-medium text-ink">State examples</h3>
                <div class="flex flex-wrap gap-3">
                  <span v-for="state in badgeStates" :key="state.value" :class="badgeClasses(state.value)">{{ state.label }}</span>
                </div>
              </div>
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
import {
  PageHero,
  PageSection,
  PageShell,
  UiCheckbox,
  UiCodeBlock,
  UiInput,
  UiPanel,
  UiRange,
  UiSegmented,
  UiSelect,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const SHADOW = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
const RIBBON_CLIP = 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)';
const VARIANT_COLORS = {
  success: { bg: '#10b981', text: '#ffffff' },
  warning: { bg: '#f59e0b', text: '#ffffff' },
  error: { bg: '#ef4444', text: '#ffffff' },
  info: { bg: '#3b82f6', text: '#ffffff' }
};

const badgeStyles = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Pill', value: 'pill' },
  { label: 'Ribbon', value: 'ribbon' },
  { label: 'Medal', value: 'medal' },
  { label: 'Tag', value: 'tag' }
];

const badgeStates = [
  { label: 'Default', value: 'default' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Info', value: 'info' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'CSS', value: 'css' }
];

const sizeOptions = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' }
];

const iconOptions = [
  { value: '', label: 'None' },
  { value: 'check', label: 'Check' },
  { value: 'close', label: 'Close' },
  { value: 'star', label: 'Star' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' }
];

const iconPositions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const DEFAULT_BG = '#6366f1';
const DEFAULT_TEXT = '#ffffff';

const config = ref({
  style: 'rounded',
  text: 'Badge',
  state: 'default',
  size: 'md',
  icon: '',
  iconPosition: 'left',
  backgroundColor: '#6366f1',
  textColor: '#ffffff',
  borderRadius: 8,
  hasShadow: false
});

const selectedExportFormat = ref('react');

const getIconName = () => {
  const iconMap = {
    check: 'check',
    close: 'close',
    star: 'star',
    info: 'info',
    warning: 'warning'
  };
  return iconMap[config.value.icon] || 'check';
};

const SIZE_CLASSES = {
  xs: 'text-xs px-2 py-0.5',
  sm: 'text-sm px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
  xl: 'text-lg px-5 py-2.5'
};

// Medal needs special sizing since it's circular
const MEDAL_SIZE_CLASSES = {
  xs: 'text-xs w-8 h-8',
  sm: 'text-sm w-10 h-10',
  md: 'text-base w-12 h-12',
  lg: 'text-lg w-14 h-14',
  xl: 'text-xl w-16 h-16'
};

// Preview classes for a state; the colours, radius and shadow reach CSS
// through v-bind() in the <style> block (they're the user's design)
const badgeClasses = (state) => {
  const c = config.value;
  const size = c.style === 'medal' ? MEDAL_SIZE_CLASSES[c.size] : SIZE_CLASSES[c.size];
  return ['badge-preview', `badge-shape-${c.style}`, `badge-state-${VARIANT_COLORS[state] ? state : 'default'}`, size];
};

const previewRadius = computed(() => `${Math.max(0, Number(config.value.borderRadius) || 0)}px`);
const previewShadow = computed(() => (config.value.hasShadow ? SHADOW : 'none'));

const generatedCode = computed(() => {
  const c = config.value;
  // String values go through JSON.stringify so quotes/backticks in the badge
  // text can't break the generated code.
  const q = (value) => JSON.stringify(String(value ?? ''));
  const radius = Math.max(0, Number(c.borderRadius) || 0);
  const variantColors = JSON.stringify(VARIANT_COLORS, null, 2);

  if (selectedExportFormat.value === 'react') {
    return `import React from 'react';

export interface BadgeProps {
  text?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: 'check' | 'close' | 'star' | 'info' | 'warning' | '';
  iconPosition?: 'left' | 'right';
  style?: 'rounded' | 'pill' | 'ribbon' | 'medal' | 'tag';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  hasShadow?: boolean;
}

const VARIANT_COLORS: Record<string, { bg: string; text: string }> = ${variantColors};

const sizeClasses: Record<string, string> = {
  xs: 'text-xs px-2 py-0.5',
  sm: 'text-sm px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
  xl: 'text-lg px-5 py-2.5'
};

const medalSizeClasses: Record<string, string> = {
  xs: 'text-xs w-8 h-8',
  sm: 'text-sm w-10 h-10',
  md: 'text-base w-12 h-12',
  lg: 'text-lg w-14 h-14',
  xl: 'text-xl w-16 h-16'
};

const iconMap: Record<string, string> = {
  check: '✓',
  close: '✕',
  star: '★',
  info: 'ℹ',
  warning: '⚠'
};

export const Badge: React.FC<BadgeProps> = ({
  text = ${q(c.text || 'Badge')},
  variant = ${q(c.state)},
  size = ${q(c.size)},
  icon = ${q(c.icon || '')},
  iconPosition = ${q(c.iconPosition)},
  style = ${q(c.style)},
  backgroundColor = ${q(c.backgroundColor)},
  textColor = ${q(c.textColor)},
  borderRadius = ${radius},
  hasShadow = ${Boolean(c.hasShadow)}
}) => {
  const colors = VARIANT_COLORS[variant] || { bg: backgroundColor, text: textColor };

  const shapeStyle: React.CSSProperties =
    style === 'medal'
      ? { borderRadius: '50%', aspectRatio: '1', minWidth: '40px', minHeight: '40px', justifyContent: 'center' }
      : style === 'ribbon'
        ? { borderRadius: \`\${borderRadius}px\`, clipPath: '${RIBBON_CLIP}', paddingRight: '12px' }
        : { borderRadius: style === 'pill' ? '9999px' : \`\${borderRadius}px\` };

  const sizeClass = style === 'medal' ? medalSizeClasses[size] : sizeClasses[size];

  return (
    <span
      className={\`inline-flex items-center font-medium \${sizeClass}\`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        boxShadow: hasShadow ? '${SHADOW}' : 'none',
        ...shapeStyle
      }}
    >
      {icon && iconPosition === 'left' && <span className="mr-1" aria-hidden="true">{iconMap[icon]}</span>}
      {text}
      {icon && iconPosition === 'right' && <span className="ml-1" aria-hidden="true">{iconMap[icon]}</span>}
    </span>
  );
};`;
  } else if (selectedExportFormat.value === 'vue') {
    // Use String.fromCharCode to avoid Vue compiler parsing template/script tags
    const templateOpen = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateClose = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupOpen = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    return templateOpen + `
  <span
    :class="badgeClasses"
    :style="badgeStyles"
  >
    <span v-if="icon && iconPosition === 'left'" class="material-symbols-outlined text-sm mr-1" aria-hidden="true">
      {{ iconName }}
    </span>
    {{ text }}
    <span v-if="icon && iconPosition === 'right'" class="material-symbols-outlined text-sm ml-1" aria-hidden="true">
      {{ iconName }}
    </span>
  </span>
` + templateClose + `

` + scriptSetupOpen + `
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ${q(c.text || 'Badge')}
  },
  variant: {
    type: String,
    default: ${q(c.state)},
    validator: (value) => ['default', 'success', 'warning', 'error', 'info'].includes(value)
  },
  size: {
    type: String,
    default: ${q(c.size)},
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  icon: {
    type: String,
    default: ${q(c.icon || '')},
    validator: (value) => ['', 'check', 'close', 'star', 'info', 'warning'].includes(value)
  },
  iconPosition: {
    type: String,
    default: ${q(c.iconPosition)},
    validator: (value) => ['left', 'right'].includes(value)
  },
  style: {
    type: String,
    default: ${q(c.style)},
    validator: (value) => ['rounded', 'pill', 'ribbon', 'medal', 'tag'].includes(value)
  },
  backgroundColor: {
    type: String,
    default: ${q(c.backgroundColor)}
  },
  textColor: {
    type: String,
    default: ${q(c.textColor)}
  },
  borderRadius: {
    type: Number,
    default: ${radius}
  },
  hasShadow: {
    type: Boolean,
    default: ${Boolean(c.hasShadow)}
  }
});

const VARIANT_COLORS = ${variantColors};

const sizeClasses = {
  xs: 'text-xs px-2 py-0.5',
  sm: 'text-sm px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
  xl: 'text-lg px-5 py-2.5'
};

const medalSizeClasses = {
  xs: 'text-xs w-8 h-8',
  sm: 'text-sm w-10 h-10',
  md: 'text-base w-12 h-12',
  lg: 'text-lg w-14 h-14',
  xl: 'text-xl w-16 h-16'
};

const iconMap = {
  check: 'check',
  close: 'close',
  star: 'star',
  info: 'info',
  warning: 'warning'
};

const badgeClasses = computed(() => {
  const sizeClass = props.style === 'medal' ? medalSizeClasses[props.size] : sizeClasses[props.size];
  return \`inline-flex items-center font-medium \${sizeClass}\`;
});

const badgeStyles = computed(() => {
  const colors = VARIANT_COLORS[props.variant] || { bg: props.backgroundColor, text: props.textColor };
  const styles = {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: props.style === 'pill' ? '9999px' : \`\${props.borderRadius}px\`,
    boxShadow: props.hasShadow ? '${SHADOW}' : 'none'
  };
  if (props.style === 'medal') {
    Object.assign(styles, { borderRadius: '50%', aspectRatio: '1', minWidth: '40px', minHeight: '40px', justifyContent: 'center' });
  } else if (props.style === 'ribbon') {
    Object.assign(styles, { clipPath: '${RIBBON_CLIP}', paddingRight: '12px' });
  }
  return styles;
});

const iconName = computed(() => (props.icon ? iconMap[props.icon] : ''));
` + scriptClose;
  } else {
    const shape = c.style === 'pill'
      ? '  border-radius: 9999px;'
      : c.style === 'medal'
        ? '  border-radius: 50%;\n  aspect-ratio: 1;\n  min-width: 40px;\n  min-height: 40px;\n  justify-content: center;'
        : c.style === 'ribbon'
          ? `  border-radius: ${radius}px;\n  clip-path: ${RIBBON_CLIP};\n  padding-right: 12px;`
          : `  border-radius: ${radius}px;`;
    const variants = Object.entries(VARIANT_COLORS)
      .map(([name, colors]) => `.badge-${name} {\n  background-color: ${colors.bg};\n  color: ${colors.text};\n}`)
      .join('\n\n');
    return `.badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  background-color: ${c.backgroundColor};
  color: ${c.textColor};
${shape}${c.hasShadow ? `\n  box-shadow: ${SHADOW};` : ''}
}

${variants}

.badge-xs {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
}

.badge-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.625rem;
}

.badge-md {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.badge-lg {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.badge-xl {
  font-size: 1.125rem;
  padding: 0.625rem 1.25rem;
}

/* Usage: <span class="badge badge-${c.size}${c.state !== 'default' ? ` badge-${c.state}` : ''}">${String(c.text || 'Badge').replace(/[<>&]|\*\//g, '')}</span> */`;
  }
});

const exportLabel = computed(() => exportFormats.find((f) => f.value === selectedExportFormat.value)?.label ?? 'Code');

// UiCodeBlock copies the code; these report the result
const onCopied = () => showNotice('Code copied to clipboard.', 'success');
const onCopyFailed = () => showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
</script>

<style scoped>
.badge-preview {
  @apply inline-flex items-center font-medium;
  border-radius: v-bind(previewRadius);
  box-shadow: v-bind(previewShadow);
}
.badge-state-default {
  background-color: v-bind('config.backgroundColor');
  color: v-bind('config.textColor');
}
.badge-state-success {
  background-color: v-bind('VARIANT_COLORS.success.bg');
  color: v-bind('VARIANT_COLORS.success.text');
}
.badge-state-warning {
  background-color: v-bind('VARIANT_COLORS.warning.bg');
  color: v-bind('VARIANT_COLORS.warning.text');
}
.badge-state-error {
  background-color: v-bind('VARIANT_COLORS.error.bg');
  color: v-bind('VARIANT_COLORS.error.text');
}
.badge-state-info {
  background-color: v-bind('VARIANT_COLORS.info.bg');
  color: v-bind('VARIANT_COLORS.info.text');
}
.badge-shape-pill {
  @apply rounded-pill;
}
.badge-shape-medal {
  @apply justify-center rounded-pill;
  aspect-ratio: 1;
  min-width: 2.5rem;
  min-height: 2.5rem;
}
.badge-shape-ribbon {
  position: relative;
  /* A diagonal cut on the right: the ribbon tail */
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%);
  padding-right: 0.75rem;
}
</style>
