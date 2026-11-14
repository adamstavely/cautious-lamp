<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="CSS animation generator"
      lead="Create smooth CSS animations with a keyframe editor, for transform, opacity, colors and more."
      spot="tools/css-animation-generator"
      size="tool"
    />

    <PageSection title="Build">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UiPanel title="Animation settings">
          <div class="space-y-4">
            <UiInput v-model="animationName" placeholder="fadeIn" label="Animation name" />
            <div class="grid grid-cols-2 gap-4">
              <UiInput v-model.number="duration" type="number" min="0" step="100" label="Duration" suffix="ms" />
              <UiInput v-model.number="delay" type="number" min="0" step="100" label="Delay" suffix="ms" />
            </div>
            <UiSelect v-model="timingFunction" :options="timingOptions" label="Timing function" />
            <div class="grid grid-cols-2 gap-4">
              <UiInput v-model="iterationCount" placeholder="1 or infinite" label="Iteration count" />
              <UiSelect v-model="direction" :options="directionOptions" label="Direction" />
            </div>
            <UiSelect v-model="fillMode" :options="fillModeOptions" label="Fill mode" />
          </div>
        </UiPanel>

        <UiPanel title="Keyframes">
          <template #actions>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Presets">
              <UiButton v-for="preset in presets" :key="preset.name" size="sm" :label="preset.name" @click="loadPreset(preset)" />
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="(keyframe, index) in keyframes" :key="keyframe.id" class="p-4 rounded-tile border border-line-faint bg-surface-sunken">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium text-sm text-ink-strong">{{ keyframeTitle(keyframe, index) }}</h3>
                <UiButton
                  v-if="keyframes.length > 2"
                  variant="ghost"
                  size="sm"
                  icon="delete"
                  icon-only
                  :label="`Remove ${keyframeTitle(keyframe, index).toLowerCase()}`"
                  @click="removeKeyframe(index)"
                />
              </div>
              <div v-if="index > 0 && index < keyframes.length - 1" class="mb-3">
                <UiInput v-model.number="keyframe.offset" type="number" min="0" max="1" step="0.01" label="Offset (0 to 1)" />
              </div>
              <div class="space-y-2">
                <div v-for="property in animatableProperties" :key="property.name" class="grid grid-cols-content-aside items-center gap-2 min-h-11">
                  <UiCheckbox
                    :model-value="keyframe.properties[property.name] !== undefined"
                    :label="property.label"
                    @update:model-value="toggleProperty(keyframe, property.name, $event)"
                  />
                  <div v-if="keyframe.properties[property.name] !== undefined" class="w-40">
                    <UiInput
                      v-model="keyframe.properties[property.name]"
                      :type="property.type"
                      :placeholder="property.placeholder"
                      :aria-label="`${property.label} value`"
                    />
                  </div>
                </div>
              </div>
            </div>
            <UiButton icon="add" label="Add keyframe" @click="addKeyframe" />
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Preview" divided>
      <UiPanel title="Live preview">
        <template #actions>
          <UiButton size="sm" icon="replay" label="Replay" @click="replayPreview" />
        </template>
        <div class="w-full h-64 rounded-tile flex items-center justify-center bg-surface-sunken">
          <div :key="previewKey" class="anim-preview flex items-center justify-center font-medium">Preview</div>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection title="Code" divided>
      <UiCodeBlock :code="cssCode" label="CSS" />
    </PageSection>

    <PageSection title="Export" description="Download the animation as CSS, a Tailwind config or JSON." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton v-for="item in exportButtons" :key="item.format" :icon="item.icon" :label="item.label" @click="exportFormat(item.format)" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watchEffect, onBeforeUnmount } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiCodeBlock, UiInput, UiPanel, UiSelect } from '../components/ui';

const animationName = ref('fadeIn');
const duration = ref(300);
const delay = ref(0);
const timingFunction = ref('ease');
const iterationCount = ref('1');
const direction = ref('normal');
const fillMode = ref('forwards');

const animatableProperties = [
  { name: 'opacity', label: 'Opacity', type: 'number', placeholder: '0-1' },
  { name: 'transform', label: 'Transform', type: 'text', placeholder: 'translateX(10px)' },
  { name: 'backgroundColor', label: 'Background Color', type: 'color', placeholder: '#000000' },
  { name: 'color', label: 'Color', type: 'color', placeholder: '#000000' },
  { name: 'width', label: 'Width', type: 'text', placeholder: '100px' },
  { name: 'height', label: 'Height', type: 'text', placeholder: '100px' },
  { name: 'borderRadius', label: 'Border Radius', type: 'text', placeholder: '50%' },
  { name: 'boxShadow', label: 'Box Shadow', type: 'text', placeholder: '0 4px 6px rgba(0,0,0,0.1)' }
];

// Sensible starting values when a property is switched on (placeholders such
// as "0-1" are hints, not valid CSS values).
const propertyDefaults = {
  opacity: 1,
  transform: 'translateX(0)',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  width: '96px',
  height: '96px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

let keyframeIdCounter = 0;
const withId = (kf) => ({ id: keyframeIdCounter++, offset: kf.offset, properties: { ...kf.properties } });

const keyframes = ref([
  { offset: 0, properties: { opacity: 0 } },
  { offset: 1, properties: { opacity: 1 } }
].map(withId));

const presets = [
  {
    name: 'Fade',
    keyframes: [
      { offset: 0, properties: { opacity: 0 } },
      { offset: 1, properties: { opacity: 1 } }
    ],
    duration: 300,
    timingFunction: 'ease'
  },
  {
    name: 'Slide',
    keyframes: [
      { offset: 0, properties: { transform: 'translateX(-100px)', opacity: 0 } },
      { offset: 1, properties: { transform: 'translateX(0)', opacity: 1 } }
    ],
    duration: 400,
    timingFunction: 'ease-out'
  },
  {
    name: 'Bounce',
    keyframes: [
      { offset: 0, properties: { transform: 'translateY(0)' } },
      { offset: 0.5, properties: { transform: 'translateY(-20px)' } },
      { offset: 1, properties: { transform: 'translateY(0)' } }
    ],
    duration: 600,
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite'
  },
  {
    name: 'Spin',
    keyframes: [
      { offset: 0, properties: { transform: 'rotate(0deg)' } },
      { offset: 1, properties: { transform: 'rotate(360deg)' } }
    ],
    duration: 1000,
    timingFunction: 'linear',
    iterationCount: 'infinite'
  },
  {
    name: 'Pulse',
    keyframes: [
      { offset: 0, properties: { transform: 'scale(1)' } },
      { offset: 0.5, properties: { transform: 'scale(1.1)' } },
      { offset: 1, properties: { transform: 'scale(1)' } }
    ],
    duration: 1000,
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite'
  },
  {
    name: 'Scale',
    keyframes: [
      { offset: 0, properties: { transform: 'scale(0)' } },
      { offset: 1, properties: { transform: 'scale(1)' } }
    ],
    duration: 300,
    timingFunction: 'ease-out'
  }
];

const toKebab = (key) => key.replace(/([A-Z])/g, '-$1').toLowerCase();

// The name is used as a CSS identifier: keep it to letters, digits, - and _,
// never starting with a digit, so it can't break out of the generated CSS.
const safeName = computed(() => {
  const cleaned = String(animationName.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').replace(/^-+/, '');
  if (!cleaned) return 'animation';
  // Identifiers can't start with a digit; CSS-wide keywords and "none" aren't valid names.
  if (/^\d/.test(cleaned) || ['none', 'initial', 'inherit', 'unset', 'revert', 'default'].includes(cleaned.toLowerCase())) {
    return `anim-${cleaned}`;
  }
  return cleaned;
});

// Property values must not close the declaration/block they sit in.
const safeValue = (value) => String(value ?? '').replace(/[{};<>]/g, '').trim();

const clampOffset = (offset) => {
  const n = Number(offset);
  return offset === '' || !Number.isFinite(n) ? 0 : Math.min(1, Math.max(0, n));
};

const formatOffset = (offset) => Math.round(clampOffset(offset) * 10000) / 100;

const msValue = (value, { allowNegative = false } = {}) => {
  const n = Number(value);
  if (value === '' || value === null || !Number.isFinite(n)) return 0;
  return allowNegative ? n : Math.max(0, n);
};

// animation-iteration-count: "infinite" or a non-negative number.
const safeIterationCount = computed(() => {
  const raw = String(iterationCount.value ?? '').trim().toLowerCase();
  if (raw === 'infinite') return 'infinite';
  const n = Number(raw);
  return raw !== '' && Number.isFinite(n) && n >= 0 ? String(n) : '1';
});

// Keyframes in offset order, with only properties that have a value.
const orderedKeyframes = computed(() =>
  [...keyframes.value]
    .map((kf) => ({
      offset: formatOffset(kf.offset),
      properties: Object.entries(kf.properties)
        .map(([key, value]) => [key, safeValue(value)])
        .filter(([, value]) => value !== '')
    }))
    .sort((a, b) => a.offset - b.offset)
);

const animationShorthand = computed(() =>
  `${safeName.value} ${msValue(duration.value)}ms ${timingFunction.value} ${msValue(delay.value, { allowNegative: true })}ms ${safeIterationCount.value} ${direction.value} ${fillMode.value}`
);

const keyframesCss = (indent) =>
  orderedKeyframes.value.map((kf) => {
    const props = kf.properties
      .map(([key, value]) => `${indent}  ${toKebab(key)}: ${value};`)
      .join('\n');
    return `${indent}${kf.offset}% {\n${props}\n${indent}}`;
  }).join('\n\n');

// One <style> element for this page's preview, kept in sync and removed on unmount.
const styleEl = document.createElement('style');
styleEl.setAttribute('data-css-animation-generator', '');
document.head.appendChild(styleEl);

watchEffect(() => {
  styleEl.textContent = `@keyframes ${safeName.value} {\n${keyframesCss('  ')}\n}`;
});

onBeforeUnmount(() => {
  styleEl.remove();
});

// Before the animation starts (with a delay), the preview shows the first
// keyframe. These reach the preview through v-bind() in <style>; a property the
// first keyframe doesn't set falls back to the preview's own look.
const firstKeyframe = computed(() => Object.fromEntries(orderedKeyframes.value[0]?.properties ?? []));
const previewFallbacks = {
  opacity: '1',
  transform: 'none',
  backgroundColor: 'var(--tc-accent)',
  color: 'var(--app-text-on-accent)',
  width: '6rem',
  height: '6rem',
  borderRadius: 'var(--tc-radius-lg)',
  boxShadow: 'none',
};
const firstValue = (key) => computed(() => firstKeyframe.value[key] ?? previewFallbacks[key]);
const previewOpacity = firstValue('opacity');
const previewTransform = firstValue('transform');
const previewBackground = firstValue('backgroundColor');
const previewColor = firstValue('color');
const previewWidth = firstValue('width');
const previewHeight = firstValue('height');
const previewRadius = firstValue('borderRadius');
const previewShadow = firstValue('boxShadow');

const cssCode = computed(() => `@keyframes ${safeName.value} {\n${keyframesCss('  ')}\n}\n\n.animated-element {\n  animation: ${animationShorthand.value};\n}\n`);

const timingOptions = [
  { value: 'ease', label: 'ease' },
  { value: 'linear', label: 'linear' },
  { value: 'ease-in', label: 'ease-in' },
  { value: 'ease-out', label: 'ease-out' },
  { value: 'ease-in-out', label: 'ease-in-out' },
  { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'cubic-bezier (default)' },
];
const directionOptions = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
const fillModeOptions = ['none', 'forwards', 'backwards', 'both'];

const keyframeTitle = (keyframe, index) => {
  if (index === 0) return 'Keyframe from (0%)';
  if (index === keyframes.value.length - 1) return 'Keyframe to (100%)';
  return `Keyframe ${formatOffset(keyframe.offset)}%`;
};

const exportButtons = [
  { format: 'css', icon: 'code', label: 'Export CSS' },
  { format: 'tailwind', icon: 'settings', label: 'Export Tailwind' },
  { format: 'json', icon: 'data_object', label: 'Export JSON' },
];

const previewKey = ref(0);
const replayPreview = () => {
  previewKey.value++;
};

const toggleProperty = (keyframe, propertyName, enabled) => {
  if (enabled) {
    const property = animatableProperties.find(p => p.name === propertyName);
    keyframe.properties[propertyName] = propertyDefaults[propertyName] ?? property?.placeholder ?? '';
  } else {
    delete keyframe.properties[propertyName];
  }
};

const addKeyframe = () => {
  // Insert halfway between the last two keyframes (the end keyframe stays last).
  const list = keyframes.value;
  const before = clampOffset(list[list.length - 2]?.offset ?? 0);
  const after = clampOffset(list[list.length - 1]?.offset ?? 1);
  list.splice(list.length - 1, 0, withId({
    offset: Math.round(((before + after) / 2) * 100) / 100,
    properties: {}
  }));
};

const removeKeyframe = (index) => {
  if (keyframes.value.length > 2) {
    keyframes.value.splice(index, 1);
  }
};

const loadPreset = (preset) => {
  animationName.value = preset.name.toLowerCase().replace(/\s+/g, '');
  keyframes.value = preset.keyframes.map(withId);
  duration.value = preset.duration || 300;
  timingFunction.value = preset.timingFunction || 'ease';
  // Reset, so e.g. Bounce (infinite) followed by Fade doesn't stay infinite.
  iterationCount.value = preset.iterationCount || '1';
  replayPreview();
};

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
  const name = safeName.value;

  if (format === 'css') {
    downloadFile(cssCode.value, 'text/css', `animation-${name}-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    // Tailwind expects keyframes as a JS object: { '0%': { opacity: '0' } }.
    const keyframeObject = {};
    orderedKeyframes.value.forEach((kf) => {
      const props = {};
      kf.properties.forEach(([key, value]) => {
        props[key] = value;
      });
      keyframeObject[`${kf.offset}%`] = props;
    });
    const keyframesJs = JSON.stringify(keyframeObject, null, 2).replace(/\n/g, '\n        ');
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      keyframes: {\n        ${JSON.stringify(name)}: ${keyframesJs},\n      },\n      animation: {\n        ${JSON.stringify(name)}: ${JSON.stringify(animationShorthand.value)},\n      },\n    },\n  },\n};\n`;
    downloadFile(config, 'text/javascript', `animation-${name}-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'css-animation',
      name,
      duration: msValue(duration.value),
      delay: msValue(delay.value, { allowNegative: true }),
      timingFunction: timingFunction.value,
      iterationCount: safeIterationCount.value,
      direction: direction.value,
      fillMode: fillMode.value,
      keyframes: orderedKeyframes.value.map((kf) => ({
        offset: kf.offset / 100,
        properties: Object.fromEntries(kf.properties)
      }))
    };
    downloadFile(JSON.stringify(config, null, 2), 'application/json', `animation-${name}-${Date.now()}.json`);
  }
};
</script>

<style scoped>
/* The @keyframes rule lives in the page-level <style> element the script keeps in sync */
.anim-preview {
  opacity: v-bind(previewOpacity);
  transform: v-bind(previewTransform);
  background-color: v-bind(previewBackground);
  color: v-bind(previewColor);
  width: v-bind(previewWidth);
  height: v-bind(previewHeight);
  border-radius: v-bind(previewRadius);
  box-shadow: v-bind(previewShadow);
  animation: v-bind(animationShorthand);
}
</style>
