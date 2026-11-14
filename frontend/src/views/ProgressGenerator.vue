<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Progress indicator generator"
      lead="Create customizable progress bars, circular progress indicators, and step indicators. Generate React or Vue components with animations."
      spot="tools/progress-generator"
      size="tool"
    />

    <PageSection title="Build" description="Pick a type and state, set the value and colours, then export the component.">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UiPanel title="Configuration" class="lg:col-span-1">
          <div class="space-y-5">
            <UiSegmented v-model="config.type" label="Type" :options="progressTypes" />
            <UiRange v-model="config.value" label="Value" :min="0" :max="100" unit="%" />
            <UiSegmented v-model="config.state" label="State" :options="progressStates" />
            <UiSelect v-model="config.size" label="Size" :options="sizeOptions" />
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput v-model="config.fillColor" label="Fill color" mono :placeholder="DEFAULT_FILL" />
              <UiInput v-model="config.fillColor" type="color" label="Picker" aria-label="Fill color picker" />
            </div>
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput v-model="config.trackColor" label="Track color" mono :placeholder="DEFAULT_TRACK" />
              <UiInput v-model="config.trackColor" type="color" label="Picker" aria-label="Track color picker" />
            </div>
            <UiInput v-model="config.label" label="Label" placeholder="Loading..." />
            <UiSelect v-model="config.labelPosition" label="Label position" :options="labelPositions" />
            <div class="space-y-2">
              <UiCheckbox v-model="config.animated" label="Animated" />
              <UiCheckbox v-if="config.type === 'linear'" v-model="config.striped" label="Striped Pattern" />
              <UiCheckbox v-model="config.showPercentage" label="Show Percentage" />
            </div>
          </div>
        </UiPanel>

        <div class="space-y-6 lg:col-span-2">
          <UiPanel title="Preview">
            <div class="space-y-8 rounded-tile bg-surface-sunken p-8">
              <!-- Linear progress -->
              <div v-if="config.type === 'linear'">
                <div
                  class="progress-track"
                  :class="`progress-track-${config.size}`"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="progressValue"
                  :aria-label="config.label || 'Progress'"
                >
                  <div class="progress-fill" :class="{ 'is-animated': config.animated, 'is-striped': config.striped }">
                    <span v-if="config.labelPosition === 'inside' && config.label" class="progress-inside-label">
                      {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                    </span>
                  </div>
                </div>
                <p v-if="config.labelPosition === 'outside' && config.label" class="mt-2 text-sm text-ink">
                  {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                </p>
              </div>

              <!-- Circular progress -->
              <div v-if="config.type === 'circular'" class="flex justify-center">
                <div
                  class="relative inline-flex"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="progressValue"
                  :aria-label="config.label || 'Progress'"
                >
                  <svg :width="getCircularSize()" :height="getCircularSize()" class="-rotate-90 transform" aria-hidden="true">
                    <circle
                      :cx="getCircularSize() / 2"
                      :cy="getCircularSize() / 2"
                      :r="(getCircularSize() - 16) / 2"
                      fill="none"
                      :stroke="stateColors.track"
                      stroke-width="8"
                    />
                    <circle
                      :cx="getCircularSize() / 2"
                      :cy="getCircularSize() / 2"
                      :r="(getCircularSize() - 16) / 2"
                      fill="none"
                      :stroke="stateColors.fill"
                      stroke-width="8"
                      :stroke-dasharray="getCircularCircumference()"
                      :stroke-dashoffset="getCircularOffset()"
                      :class="{ 'circle-animated': config.animated }"
                    />
                  </svg>
                  <div v-if="config.labelPosition !== 'none'" class="absolute inset-0 flex flex-col items-center justify-center">
                    <span v-if="config.label" class="text-sm font-medium text-ink">{{ config.label }}</span>
                    <span v-if="config.showPercentage" class="text-lg font-bold text-ink-strong">{{ config.value }}%</span>
                  </div>
                </div>
              </div>

              <!-- Step indicator -->
              <div v-if="config.type === 'steps'" class="space-y-4">
                <div
                  class="flex items-center justify-between"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="progressValue"
                  :aria-valuetext="`Step ${completedSteps} of ${STEP_COUNT} complete`"
                  :aria-label="config.label || 'Progress'"
                >
                  <div v-for="(step, index) in STEP_COUNT" :key="index" class="flex items-center">
                    <div class="step-dot" :class="[`step-dot-${config.size}`, { 'is-complete': index < completedSteps }]">
                      <span v-if="index < completedSteps" class="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                      <span v-else class="text-xs">{{ index + 1 }}</span>
                    </div>
                    <div v-if="index < STEP_COUNT - 1" class="step-line" :class="{ 'is-complete': index < completedSteps }"></div>
                  </div>
                </div>
                <p v-if="config.label" class="text-center text-sm text-ink">
                  {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                </p>
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
const STEP_COUNT = 5;

const progressTypes = [
  { label: 'Linear Bar', value: 'linear', icon: 'linear_scale' },
  { label: 'Circular', value: 'circular', icon: 'radio_button_checked' },
  { label: 'Step Indicator', value: 'steps', icon: 'steps' }
];

const progressStates = [
  { label: 'Default', value: 'default' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' }
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

const labelPositions = [
  { value: 'inside', label: 'Inside' },
  { value: 'outside', label: 'Outside' },
  { value: 'none', label: 'None' }
];

const DEFAULT_FILL = '#6366f1';
const DEFAULT_TRACK = '#e5e7eb';

const config = ref({
  type: 'linear',
  value: 65,
  state: 'default',
  size: 'md',
  fillColor: '#6366f1',
  trackColor: '#e5e7eb',
  label: 'Loading...',
  labelPosition: 'inside',
  animated: false,
  striped: false,
  showPercentage: true
});

const selectedExportFormat = ref('react');

// 0-100, whatever the input gives.
const progressValue = computed(() => {
  const n = Number(config.value.value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
});

const completedSteps = computed(() => Math.floor(progressValue.value / (100 / STEP_COUNT)));

const getStateColors = () => {
  const stateMap = {
    default: { fill: config.value.fillColor, track: config.value.trackColor },
    success: { fill: '#10b981', track: '#d1fae5' },
    warning: { fill: '#f59e0b', track: '#fef3c7' },
    error: { fill: '#ef4444', track: '#fee2e2' }
  };
  return stateMap[config.value.state] || stateMap.default;
};

// Preview colours and sizes are the user's design: they reach CSS through
// v-bind() in the <style> block
const stateColors = computed(() => getStateColors());
const fillWidth = computed(() => `${progressValue.value}%`);

const getCircularSize = () => {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160
  };
  return sizeMap[config.value.size];
};

const getCircularCircumference = () => {
  const radius = (getCircularSize() - 16) / 2;
  return 2 * Math.PI * radius;
};

const getCircularOffset = () => {
  const circumference = getCircularCircumference();
  return circumference - (progressValue.value / 100) * circumference;
};

// Generated code (output, not page styling) uses Tailwind's white for the inside label
// style-check: allow generated output
const GENERATED_LABEL_TEXT = 'text-white';

const STRIPES = 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)';

const generatedCode = computed(() => {
  const c = config.value;
  const colors = getStateColors();
  // Strings go through JSON.stringify so quotes in the label can't break the code.
  const q = (value) => JSON.stringify(String(value ?? ''));
  const value = progressValue.value;

  if (selectedExportFormat.value === 'react') {
    if (c.type === 'linear') {
      return `import React from 'react';

// Needs this keyframe once in your CSS for animated stripes:
// @keyframes progress-stripes { from { background-position: 1rem 0; } to { background-position: 0 0; } }

export interface ProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'none';
  animated?: boolean;
  striped?: boolean;
  showPercentage?: boolean;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: '8px' },
  md: { height: '12px' },
  lg: { height: '16px' }
};

export const Progress: React.FC<ProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  labelPosition = ${q(c.labelPosition)},
  animated = ${Boolean(c.animated)},
  striped = ${Boolean(c.striped)},
  showPercentage = ${Boolean(c.showPercentage)}
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const text = [label, showPercentage ? \`\${clamped}%\` : ''].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: '100%', backgroundColor: trackColor, ...sizeStyles[size] }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: \`\${clamped}%\`,
            backgroundColor: fillColor,
            transition: animated ? 'width 0.3s ease' : 'none',
            backgroundImage: striped ? '${STRIPES}' : 'none',
            backgroundSize: striped ? '1rem 1rem' : 'auto',
            animation: striped && animated ? 'progress-stripes 1s linear infinite' : 'none'
          }}
        />
        {labelPosition === 'inside' && text && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium ${GENERATED_LABEL_TEXT}">
            {text}
          </span>
        )}
      </div>
      {labelPosition === 'outside' && text && <p className="text-sm mt-2">{text}</p>}
    </div>
  );
};`;
    } else if (c.type === 'circular') {
      return `import React from 'react';

export interface CircularProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'none';
  animated?: boolean;
  showPercentage?: boolean;
}

const sizeMap: Record<string, number> = { sm: 80, md: 120, lg: 160 };

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  labelPosition = ${q(c.labelPosition)},
  animated = ${Boolean(c.animated)},
  showPercentage = ${Boolean(c.showPercentage)}
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const diameter = sizeMap[size];
  const radius = (diameter - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative"
      style={{ width: \`\${diameter}px\`, height: \`\${diameter}px\` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label || 'Progress'}
    >
      <svg width={diameter} height={diameter} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={diameter / 2} cy={diameter / 2} r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animated ? 'stroke-dashoffset 0.3s ease' : 'none' }}
        />
      </svg>
      {labelPosition !== 'none' && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && <span className="text-lg font-bold">{clamped}%</span>}
        </div>
      )}
    </div>
  );
};`;
    } else {
      return `import React from 'react';

export interface StepProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  showPercentage?: boolean;
  steps?: number;
}

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '40px', height: '40px', fontSize: '14px' },
  lg: { width: '48px', height: '48px', fontSize: '16px' }
};

export const StepProgress: React.FC<StepProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  showPercentage = ${Boolean(c.showPercentage)},
  steps = ${STEP_COUNT}
}) => {
  const stepCount = Math.max(1, Math.floor(steps));
  const clamped = Math.min(100, Math.max(0, value));
  const completedSteps = Math.floor(clamped / (100 / stepCount));

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-valuetext={\`Step \${completedSteps} of \${stepCount} complete\`}
        aria-label={label || 'Progress'}
      >
        {Array.from({ length: stepCount }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className="rounded-full flex items-center justify-center font-medium"
              style={{
                ...sizeMap[size],
                backgroundColor: index < completedSteps ? fillColor : trackColor,
                color: index < completedSteps ? '#ffffff' : '#6b7280'
              }}
            >
              {index < completedSteps ? '✓' : index + 1}
            </div>
            {index < stepCount - 1 && (
              <div
                className="h-1 mx-1"
                style={{ width: '40px', backgroundColor: index < completedSteps ? fillColor : trackColor }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {label && (
        <p className="text-sm text-center mt-4">
          {label} {showPercentage && \`\${clamped}%\`}
        </p>
      )}
    </div>
  );
};`;
    }
  } else if (selectedExportFormat.value === 'vue') {
    const templateOpen = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateClose = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupOpen = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);

    let template;
    if (c.type === 'linear') {
      template = `
  <div class="w-full">
    <div
      class="relative rounded-full overflow-hidden"
      :style="{ width: '100%', backgroundColor: trackColor, height: heights[size] }"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="clamped"
      :aria-label="label || 'Progress'"
    >
      <div class="h-full rounded-full" :style="fillStyle"></div>
      <span
        v-if="labelPosition === 'inside' && text"
        class="absolute inset-0 flex items-center justify-center text-xs font-medium ${GENERATED_LABEL_TEXT}"
      >{{ text }}</span>
    </div>
    <p v-if="labelPosition === 'outside' && text" class="text-sm mt-2">{{ text }}</p>
  </div>
`;
    } else if (c.type === 'circular') {
      template = `
  <div
    class="relative"
    :style="{ width: diameter + 'px', height: diameter + 'px' }"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="clamped"
    :aria-label="label || 'Progress'"
  >
    <svg :width="diameter" :height="diameter" style="transform: rotate(-90deg)" aria-hidden="true">
      <circle :cx="diameter / 2" :cy="diameter / 2" :r="radius" fill="none" :stroke="trackColor" stroke-width="8" />
      <circle
        :cx="diameter / 2"
        :cy="diameter / 2"
        :r="radius"
        fill="none"
        :stroke="fillColor"
        stroke-width="8"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference - (clamped / 100) * circumference"
        :style="{ transition: animated ? 'stroke-dashoffset 0.3s ease' : 'none' }"
      />
    </svg>
    <div v-if="labelPosition !== 'none'" class="absolute inset-0 flex items-center justify-center flex-col">
      <span v-if="label" class="text-sm font-medium">{{ label }}</span>
      <span v-if="showPercentage" class="text-lg font-bold">{{ clamped }}%</span>
    </div>
  </div>
`;
    } else {
      template = `
  <div class="w-full">
    <div
      class="flex items-center justify-between"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="clamped"
      :aria-valuetext="\`Step \${completedSteps} of \${steps} complete\`"
      :aria-label="label || 'Progress'"
    >
      <template v-for="(step, index) in steps" :key="index">
        <div
          class="rounded-full flex items-center justify-center font-medium"
          :style="{
            ...stepSizes[size],
            backgroundColor: index < completedSteps ? fillColor : trackColor,
            color: index < completedSteps ? '#ffffff' : '#6b7280'
          }"
        >{{ index < completedSteps ? '✓' : index + 1 }}</div>
        <div
          v-if="index < steps - 1"
          class="h-1 mx-1"
          :style="{ width: '40px', backgroundColor: index < completedSteps ? fillColor : trackColor }"
        ></div>
      </template>
    </div>
    <p v-if="text" class="text-sm text-center mt-4">{{ text }}</p>
  </div>
`;
    }

    return templateOpen + template + templateClose + `

` + scriptSetupOpen + `
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: ${value} },
  size: { type: String, default: ${q(c.size)} },
  fillColor: { type: String, default: ${q(colors.fill)} },
  trackColor: { type: String, default: ${q(colors.track)} },
  label: { type: String, default: ${q(c.label)} },
  labelPosition: { type: String, default: ${q(c.labelPosition)} },
  animated: { type: Boolean, default: ${Boolean(c.animated)} },
  striped: { type: Boolean, default: ${Boolean(c.striped)} },
  showPercentage: { type: Boolean, default: ${Boolean(c.showPercentage)} },
  steps: { type: Number, default: ${STEP_COUNT} }
});

const heights = { sm: '8px', md: '12px', lg: '16px' };
const stepSizes = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '40px', height: '40px', fontSize: '14px' },
  lg: { width: '48px', height: '48px', fontSize: '16px' }
};
const diameters = { sm: 80, md: 120, lg: 160 };

const clamped = computed(() => Math.min(100, Math.max(0, props.value)));
const text = computed(() => [props.label, props.showPercentage ? \`\${clamped.value}%\` : ''].filter(Boolean).join(' '));
const diameter = computed(() => diameters[props.size]);
const radius = computed(() => (diameter.value - 16) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const completedSteps = computed(() => Math.floor(clamped.value / (100 / Math.max(1, props.steps))));

const fillStyle = computed(() => ({
  width: \`\${clamped.value}%\`,
  backgroundColor: props.fillColor,
  transition: props.animated ? 'width 0.3s ease' : 'none',
  backgroundImage: props.striped ? '${STRIPES}' : 'none',
  backgroundSize: props.striped ? '1rem 1rem' : 'auto',
  animation: props.striped && props.animated ? 'progress-stripes 1s linear infinite' : 'none'
}));
` + scriptClose + `

<style>
@keyframes progress-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}
</style>`;
  } else {
    const heights = { sm: '8px', md: '12px', lg: '16px' };
    return `/* CSS for Progress Indicator */
.progress-linear {
  position: relative;
  width: 100%;
  height: ${heights[c.size] || '12px'};
  background-color: ${colors.track};
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  width: ${value}%; /* set from your progress value */
  height: 100%;
  background-color: ${colors.fill};
  border-radius: 9999px;
  transition: ${c.animated ? 'width 0.3s ease' : 'none'};
}

.progress-fill.progress-striped {
  background-image: ${STRIPES};
  background-size: 1rem 1rem;
}

.progress-fill.progress-striped.progress-animated {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}

/* Usage:
<div class="progress-linear" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
  <div class="progress-fill${c.striped ? ' progress-striped' : ''}${c.striped && c.animated ? ' progress-animated' : ''}"></div>
</div>
*/`;
  }
});

const exportLabel = computed(() => exportFormats.find((f) => f.value === selectedExportFormat.value)?.label ?? 'Code');

// UiCodeBlock copies the code; these report the result
const onCopied = () => showNotice('Code copied to clipboard.', 'success');
const onCopyFailed = () => showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
</script>

<style scoped>
.progress-track {
  @apply relative w-full overflow-hidden rounded-pill;
  background-color: v-bind('stateColors.track');
}
.progress-track-sm { @apply h-2; }
.progress-track-md { @apply h-3; }
.progress-track-lg { @apply h-4; }
.progress-fill {
  @apply h-full rounded-pill;
  width: v-bind(fillWidth);
  background-color: v-bind('stateColors.fill');
}
.progress-fill.is-animated {
  transition: width 0.3s ease;
}
.progress-fill.is-striped {
  background-image: v-bind(STRIPES);
  background-size: 1rem 1rem;
  background-repeat: repeat;
}
.progress-fill.is-striped.is-animated {
  animation: progress-stripes 1s linear infinite;
}
@keyframes progress-stripes {
  0% { background-position: 0 0; }
  100% { background-position: 1rem 0; }
}
.progress-inside-label {
  @apply absolute inset-0 z-10 flex items-center justify-center text-xs font-medium text-ink-on-accent;
}
.circle-animated {
  transition: stroke-dashoffset 0.3s ease;
}
.step-dot {
  @apply flex items-center justify-center rounded-pill font-medium text-ink-muted;
  background-color: v-bind('stateColors.track');
}
.step-dot.is-complete {
  @apply text-ink-on-accent;
  background-color: v-bind('stateColors.fill');
}
.step-dot-sm { @apply h-8 w-8 text-xs; }
.step-dot-md { @apply h-10 w-10 text-sm; }
.step-dot-lg { @apply h-12 w-12 text-base; }
.step-line {
  @apply mx-1 h-1 w-10;
  background-color: v-bind('stateColors.track');
}
.step-line.is-complete {
  background-color: v-bind('stateColors.fill');
}
</style>
