<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="PX unit converter"
      lead="Convert pixel values to REM, EM, percentage, physical, viewport and Tailwind units. Converts both ways, with customizable base sizes."
      spot="tools/px-converter"
      size="tool"
    />

    <PageSection title="Conversion mode">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiSegmented v-for="group in modeGroups" :key="group.label" v-model="selectedMode" :options="group.modes" :label="group.label" />
      </div>
    </PageSection>

    <PageSection title="Converter" divided>
      <div class="space-y-6">
        <UiPanel title="Settings">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UiInput v-model.number="rootFontSize" type="number" min="1" step="0.1" mono label="Root font size" suffix="px" />
            <UiInput v-model.number="parentFontSize" type="number" min="1" step="0.1" mono label="Parent font size" suffix="px" />
            <UiInput v-if="needsViewportWidth" v-model.number="viewportWidth" type="number" min="1" step="1" mono label="Viewport width" suffix="px" />
            <UiInput v-if="needsViewportHeight" v-model.number="viewportHeight" type="number" min="1" step="1" mono label="Viewport height" suffix="px" />
            <UiSelect
              v-if="selectedMode === 'px-to-percent' || selectedMode === 'percent-to-vw'"
              v-model="percentageContext"
              :options="contextOptions"
              label="Context"
            />
          </div>
        </UiPanel>

        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <UiPanel title="Convert">
          <!-- Two-way converters -->
          <div v-if="currentPair" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="item in currentPair" :key="item.label" class="grid grid-cols-content-aside items-end gap-2">
              <UiInput
                :model-value="item.model.value"
                type="number"
                :step="item.step"
                :placeholder="item.placeholder"
                :label="item.label"
                :suffix="item.unit"
                mono
                @update:model-value="setField(item, $event)"
              />
              <UiButton variant="ghost" icon="content_copy" icon-only :label="`Copy ${item.label} value`" @click="copyToClipboard(item.model.value + item.unit)" />
            </div>
          </div>

          <!-- Base unit to PX -->
          <div v-else-if="selectedMode === 'base-to-px'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput :model-value="baseUnitValue" placeholder="1rem, 1em, or 100%" label="Base unit" mono @update:model-value="onBaseUnit" />
              <UiButton variant="ghost" icon="content_copy" icon-only label="Copy base unit" @click="copyToClipboard(baseUnitValue)" />
            </div>
            <div class="grid grid-cols-content-aside items-end gap-2">
              <UiInput :model-value="baseToPxResult" type="number" readonly label="Pixels" suffix="px" mono />
              <UiButton variant="ghost" icon="content_copy" icon-only label="Copy pixels" @click="copyToClipboard(baseToPxResult + 'px')" />
            </div>
          </div>

          <!-- PX to Tailwind -->
          <div v-else-if="selectedMode === 'px-to-tailwind'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="grid grid-cols-content-aside items-end gap-2">
                <UiInput :model-value="pxValue" type="number" step="0.1" placeholder="16" label="Pixels" suffix="px" mono @update:model-value="onPxForTailwind" />
                <UiButton variant="ghost" icon="content_copy" icon-only label="Copy pixels" @click="copyToClipboard(pxValue + 'px')" />
              </div>
              <div class="grid grid-cols-content-aside items-end gap-2">
                <UiInput :model-value="tailwindValue" readonly label="Tailwind value" mono />
                <UiButton variant="ghost" icon="content_copy" icon-only label="Copy Tailwind value" @click="copyToClipboard(tailwindValue)" />
              </div>
            </div>
            <div v-if="tailwindClass" class="p-4 rounded-tile bg-surface-sunken">
              <p class="text-sm mb-2 text-ink-secondary">Tailwind class examples:</p>
              <div class="flex flex-wrap gap-2">
                <UiCode>{{ tailwindClass }}</UiCode>
                <UiCode>m-{{ tailwindValue }}</UiCode>
                <UiCode>gap-{{ tailwindValue }}</UiCode>
              </div>
            </div>
          </div>

          <template v-if="calculationNote" #footer>
            <p class="text-sm text-ink-muted">{{ calculationNote }}</p>
          </template>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Breakpoints" :description="`Common screen breakpoints showing PX to VW conversion for ${pxValue || 192}px at each breakpoint.`" divided>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="bp in breakpointsTable" :key="bp.px" class="p-3 rounded-tile border border-line-faint bg-surface-raised space-y-1">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-code font-semibold text-ink">{{ bp.px }}px</p>
            <UiButton size="sm" variant="ghost" icon="content_copy" icon-only :label="`Copy ${bp.px}px`" @click="copyToClipboard(bp.px + 'px')" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-code font-semibold text-accent-text">{{ bp.vw }}vw</p>
            <UiButton size="sm" variant="ghost" icon="content_copy" icon-only :label="`Copy ${bp.vw}vw`" @click="copyToClipboard(bp.vw + 'vw')" />
          </div>
        </div>
      </div>
    </PageSection>

    <PageSection title="CSS style properties" divided>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="example in cssExamples" :key="example.label" class="p-4 rounded-tile border border-line-faint bg-surface-sunken">
          <p class="text-xs font-semibold mb-2 text-ink-secondary">{{ example.label }}</p>
          <code class="text-sm font-code text-ink block whitespace-pre-wrap">{{ example.code }}</code>
        </div>
      </div>
    </PageSection>

    <PageSection title="Unit conversion table for PX to REM" divided>
      <UiPanel flush>
        <UiTable caption="Unit conversion table: EM, pixel, REM, percent and point" compact>
          <thead>
            <tr>
              <th scope="col">EM</th>
              <th scope="col">Pixel</th>
              <th scope="col">REM</th>
              <th scope="col">Percent</th>
              <th scope="col">Point</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in unifiedConversionTable" :key="row.px" class="font-code">
              <td>{{ row.em }}em</td>
              <td>{{ row.px }}px</td>
              <td>{{ row.rem }}rem</td>
              <td>{{ row.percent }}%</td>
              <td>{{ row.point }}pt</td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <PageSection title="Understanding CSS units" divided>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm leading-relaxed text-ink-secondary">
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">REM (Root EM)</h3>
          <p>
            The CSS <UiCode>rem</UiCode> unit allows defining a size relative to the <UiCode>font-size</UiCode> of the HTML root tag. Inside a single document, the length of a REM unit is everywhere the same, it can just differ between documents.
          </p>
          <p><strong class="text-ink">Example:</strong> If the default size is used, 1px represents 0.0625rem. In the other direction, 1rem represents 16px.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">EM</h3>
          <p>
            EM on the other side can differ between every element, because it is relative to the element's own <UiCode>font-size</UiCode> (exception is the <UiCode>font-size</UiCode> itself, in it EM is relative to the parent).
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">EM vs. REM: The differences</h3>
          <ul class="list-disc list-inside space-y-1">
            <li><strong class="text-ink">REM:</strong> Inside a single document, the length of a REM unit is everywhere the same, it can just differ between documents.</li>
            <li><strong class="text-ink">EM:</strong> EM on the other side can differ between every element, because it is relative to the element's own font-size (exception is the font-size itself, in it EM is relative to the parent).</li>
            <li><strong class="text-ink">REM is the newer unit,</strong> older browsers don't support it.</li>
          </ul>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">Percentage (%)</h3>
          <p>
            Percentage units are relative to the parent element's value. For <UiCode>font-size</UiCode>, percentages are relative to the parent's font-size. For dimensions like <UiCode>width</UiCode> and <UiCode>height</UiCode>, percentages are relative to the parent container's size.
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">Tailwind CSS spacing scale</h3>
          <p>
            Tailwind CSS uses a spacing scale based on 0.25rem increments. Each unit in the Tailwind scale equals 0.25rem (4px at the default 16px root font size). This creates a consistent spacing system that works across padding, margin, gap, and other spacing utilities.
          </p>
          <p>
            <strong class="text-ink">Examples:</strong> <UiCode>p-4</UiCode> = 1rem = 16px, <UiCode>m-8</UiCode> = 2rem = 32px, <UiCode>gap-2</UiCode> = 0.5rem = 8px
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">How to convert PX to VW?</h3>
          <p>To convert px to vw, you should know total viewport width for example 1920px</p>
          <p>Then, just apply formula: <UiCode>px / viewport total width * 100</UiCode></p>
          <p>For example, with a viewport of 1920px, 192px will be converted to: <UiCode>192 / 1920 * 100 = 10vw</UiCode></p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">What is the PX to VW formula?</h3>
          <p><UiCode>px / viewport total width * 100</UiCode></p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">What is vw unit? (Viewport Width)</h3>
          <p>Used in responsive design, Viewport Width (VW) is a unit relative to web page display area called viewport.</p>
          <p>1vw corresponds to 1% of display. So, to make an element full width, you should use 100vw.</p>
          <p>You can also use decimal values. Please note that, depending on browsers, decimal precision can change.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">What is px unit? (Pixels)</h3>
          <p>Pixel unit is the theorical smallest dot displayed on a computer screen.</p>
          <p>Nowadays, pixel unit can differ between physical resolution and logical resolution.</p>
          <p>This difference is called device pixel ratio or DPR:</p>
          <p><UiCode>Logical resolution = physical resolution / device pixel ratio.</UiCode></p>
          <p>So, a screen with 1024x768 physical resolution with a DPR of 2 will have a 512x384 logical resolution.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">What are common breakpoints for media queries?</h3>
          <ul class="list-disc list-inside space-y-1">
            <li><strong class="text-ink">Mobile devices</strong> – 320px — 480px.</li>
            <li><strong class="text-ink">iPads, Tablets</strong> – 481px — 768px.</li>
            <li><strong class="text-ink">Small screens, laptops</strong> – 769px — 1024px.</li>
            <li><strong class="text-ink">Desktops, large screens</strong> – 1025px — 1920px.</li>
            <li><strong class="text-ink">Extra large screens, TV</strong> – 2560px, and more.</li>
          </ul>
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">Browser support</h3>
          <p>
            REM units are supported in all modern browsers (Chrome 4+, Firefox 3.6+, Safari 5+, IE 9+). EM and percentage units have been supported since the early days of CSS. Viewport units (vw, vh) are supported in all modern browsers (Chrome 20+, Firefox 19+, Safari 6+, IE 9+). For older browser support, consider providing pixel fallbacks or using a CSS preprocessor.
          </p>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiCode, UiInput, UiPanel, UiSegmented, UiSelect, UiTable } from '../components/ui';

const { notice, showNotice, clearNotice } = useNotice();

// Conversion modes grouped by category
const typographyModes = [
  { label: 'PX → REM', value: 'px-to-rem' },
  { label: 'PX → EM', value: 'px-to-em' },
  { label: 'PX → %', value: 'px-to-percent' },
  { label: 'Base → PX', value: 'base-to-px' }
];

const physicalModes = [
  { label: 'PX → PT', value: 'px-to-pt' },
  { label: 'PX → IN', value: 'px-to-in' },
  { label: 'PX → PC', value: 'px-to-pc' },
  { label: 'PX → CM', value: 'px-to-cm' },
  { label: 'PX → MM', value: 'px-to-mm' }
];

const viewportModes = [
  { label: 'PX → VH', value: 'px-to-vh' },
  { label: 'VH → VW', value: 'vh-to-vw' },
  { label: 'REM → VW', value: 'rem-to-vw' },
  { label: 'EM → VW', value: 'em-to-vw' },
  { label: '% → VW', value: 'percent-to-vw' },
  { label: 'PT → VW', value: 'pt-to-vw' },
  { label: 'IN → VW', value: 'in-to-vw' },
  { label: 'PC → VW', value: 'pc-to-vw' },
  { label: 'CM → VW', value: 'cm-to-vw' },
  { label: 'MM → VW', value: 'mm-to-vw' }
];

const frameworkModes = [
  { label: 'PX → Tailwind', value: 'px-to-tailwind' }
];

// Combined array for backward compatibility
const conversionModes = [
  ...typographyModes,
  ...physicalModes,
  ...viewportModes,
  ...frameworkModes
];

const selectedMode = ref('px-to-rem');

// Configuration
const rootFontSize = ref(16);
const parentFontSize = ref(16);
const viewportWidth = ref(1920);
const viewportHeight = ref(1080);
const percentageContext = ref('font-size');

// Input values
const pxValue = ref(16);
const remValue = ref(1);
const emValue = ref(1);
const vhValue = ref(1);
const ptValue = ref(12);
const inValue = ref(0.167);
const pcValue = ref(1);
const cmValue = ref(0.424);
const mmValue = ref(4.233);
const percentValue = ref(100);
const vwValue = ref(1);
const baseUnitValue = ref('1rem');
const baseToPxResult = ref(16);
const tailwindValue = ref('');
const tailwindClass = ref('');

// Table mode
const tableModes = [
  { label: 'PX to REM', value: 'px-to-rem' },
  { label: 'REM to PX', value: 'rem-to-px' },
  { label: 'PX to EM', value: 'px-to-em' },
  { label: 'PX to %', value: 'px-to-percent' },
  { label: 'PX to Tailwind', value: 'px-to-tailwind' }
];
const selectedTableMode = ref('px-to-rem');

// Tailwind spacing scale
const tailwindScale = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];

// Common breakpoints
const commonBreakpoints = [320, 375, 400, 425, 480, 700, 768, 960, 1024, 1280, 1366, 1440, 1600, 1920, 2560, 3840];

// Computed properties
const needsViewportWidth = computed(() => {
  return selectedMode.value.includes('vw') || selectedMode.value === 'px-to-vh';
});

const needsViewportHeight = computed(() => {
  return selectedMode.value === 'px-to-vh' || selectedMode.value === 'vh-to-vw';
});

const breakpointsTable = computed(() => {
  const testPx = hasValue(pxValue.value) ? pxValue.value : 192;
  return commonBreakpoints.map(bp => {
    return {
      px: bp,
      vw: parseFloat(((testPx / bp) * 100).toFixed(3))
    };
  });
});

// A typed number, including 0 (v-model.number gives '' for an empty field).
const hasValue = (v) => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));
// A usable divisor / base size.
const isNonZero = (v) => hasValue(v) && Number(v) !== 0;

// Conversion functions
const convertPxToRem = () => {
  if (hasValue(pxValue.value) && isNonZero(rootFontSize.value)) {
    remValue.value = parseFloat((pxValue.value / rootFontSize.value).toFixed(4));
  }
};

const convertRemToPx = () => {
  if (hasValue(remValue.value) && isNonZero(rootFontSize.value)) {
    pxValue.value = parseFloat((remValue.value * rootFontSize.value).toFixed(1));
  }
};

const convertPxToEm = () => {
  if (hasValue(pxValue.value) && isNonZero(parentFontSize.value)) {
    emValue.value = parseFloat((pxValue.value / parentFontSize.value).toFixed(4));
  }
};

const convertEmToPx = () => {
  if (hasValue(emValue.value) && isNonZero(parentFontSize.value)) {
    pxValue.value = parseFloat((emValue.value * parentFontSize.value).toFixed(1));
  }
};

const convertPxToPercent = () => {
  if (hasValue(pxValue.value) && (percentageContext.value !== 'font-size' || isNonZero(parentFontSize.value))) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    percentValue.value = parseFloat(((pxValue.value / baseSize) * 100).toFixed(2));
  }
};

const convertPercentToPx = () => {
  if (hasValue(percentValue.value)) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    pxValue.value = parseFloat(((percentValue.value / 100) * baseSize).toFixed(1));
  }
};

const convertBaseToPx = () => {
  const value = baseUnitValue.value.trim();
  const remMatch = value.match(/^([\d.]+)\s*rem$/i);
  const emMatch = value.match(/^([\d.]+)\s*em$/i);
  const percentMatch = value.match(/^([\d.]+)\s*%$/);
  
  if (remMatch) {
    baseToPxResult.value = parseFloat((parseFloat(remMatch[1]) * rootFontSize.value).toFixed(1));
  } else if (emMatch) {
    baseToPxResult.value = parseFloat((parseFloat(emMatch[1]) * parentFontSize.value).toFixed(1));
  } else if (percentMatch) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    baseToPxResult.value = parseFloat(((parseFloat(percentMatch[1]) / 100) * baseSize).toFixed(1));
  } else {
    baseToPxResult.value = '';
  }
};

const convertPxToTailwind = () => {
  if (!hasValue(pxValue.value) || !isNonZero(rootFontSize.value)) {
    tailwindValue.value = '';
    tailwindClass.value = '';
    return;
  }
  
  // Convert px to rem first
  const rem = pxValue.value / rootFontSize.value;
  // Convert rem to Tailwind units (each Tailwind unit = 0.25rem)
  const twUnits = rem / 0.25;
  
  // Find closest Tailwind value
  let closest = tailwindScale[0];
  let minDiff = Math.abs(twUnits - closest);
  
  for (const val of tailwindScale) {
    const diff = Math.abs(twUnits - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = val;
    }
  }
  
  tailwindValue.value = closest.toString();
  tailwindClass.value = `p-${closest}`;
};

// PX to VH conversions
const convertPxToVh = () => {
  if (hasValue(pxValue.value) && isNonZero(viewportHeight.value)) {
    vhValue.value = parseFloat(((pxValue.value / viewportHeight.value) * 100).toFixed(4));
  }
};

const convertVhToPx = () => {
  if (hasValue(vhValue.value) && isNonZero(viewportHeight.value)) {
    pxValue.value = parseFloat(((vhValue.value / 100) * viewportHeight.value).toFixed(1));
  }
};

// PX to PT conversions
const convertPxToPt = () => {
  if (hasValue(pxValue.value)) {
    ptValue.value = parseFloat((pxValue.value * 0.75).toFixed(2));
  }
};

const convertPtToPx = () => {
  if (hasValue(ptValue.value)) {
    pxValue.value = parseFloat((ptValue.value / 0.75).toFixed(1));
  }
};

// PX to IN conversions
const convertPxToIn = () => {
  if (hasValue(pxValue.value)) {
    inValue.value = parseFloat((pxValue.value / 96).toFixed(4));
  }
};

const convertInToPx = () => {
  if (hasValue(inValue.value)) {
    pxValue.value = parseFloat((inValue.value * 96).toFixed(1));
  }
};

// PX to PC conversions
const convertPxToPc = () => {
  if (hasValue(pxValue.value)) {
    pcValue.value = parseFloat((pxValue.value / 16).toFixed(4));
  }
};

const convertPcToPx = () => {
  if (hasValue(pcValue.value)) {
    pxValue.value = parseFloat((pcValue.value * 16).toFixed(1));
  }
};

// PX to CM conversions
const convertPxToCm = () => {
  if (hasValue(pxValue.value)) {
    cmValue.value = parseFloat((pxValue.value / 37.795).toFixed(4));
  }
};

const convertCmToPx = () => {
  if (hasValue(cmValue.value)) {
    pxValue.value = parseFloat((cmValue.value * 37.795).toFixed(1));
  }
};

// PX to MM conversions
const convertPxToMm = () => {
  if (hasValue(pxValue.value)) {
    mmValue.value = parseFloat((pxValue.value / 3.7795).toFixed(4));
  }
};

const convertMmToPx = () => {
  if (hasValue(mmValue.value)) {
    pxValue.value = parseFloat((mmValue.value * 3.7795).toFixed(1));
  }
};

// REM to VW conversions
const convertRemToVw = () => {
  if (hasValue(remValue.value) && isNonZero(rootFontSize.value) && isNonZero(viewportWidth.value)) {
    const px = remValue.value * rootFontSize.value;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToRem = () => {
  if (hasValue(vwValue.value) && isNonZero(rootFontSize.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    remValue.value = parseFloat((px / rootFontSize.value).toFixed(4));
  }
};

// EM to VW conversions
const convertEmToVw = () => {
  if (hasValue(emValue.value) && isNonZero(parentFontSize.value) && isNonZero(viewportWidth.value)) {
    const px = emValue.value * parentFontSize.value;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToEm = () => {
  if (hasValue(vwValue.value) && isNonZero(parentFontSize.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    emValue.value = parseFloat((px / parentFontSize.value).toFixed(4));
  }
};

// VH to VW conversions
const convertVhToVw = () => {
  if (hasValue(vhValue.value) && isNonZero(viewportHeight.value) && isNonZero(viewportWidth.value)) {
    vwValue.value = parseFloat(((vhValue.value / 100) * viewportHeight.value / viewportWidth.value * 100).toFixed(4));
  }
};

const convertVwToVh = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportHeight.value) && isNonZero(viewportWidth.value)) {
    vhValue.value = parseFloat(((vwValue.value / 100) * viewportWidth.value / viewportHeight.value * 100).toFixed(4));
  }
};

// PT to VW conversions
const convertPtToVw = () => {
  if (hasValue(ptValue.value) && isNonZero(viewportWidth.value)) {
    const px = ptValue.value / 0.75;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPt = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    ptValue.value = parseFloat((px * 0.75).toFixed(2));
  }
};

// IN to VW conversions
const convertInToVw = () => {
  if (hasValue(inValue.value) && isNonZero(viewportWidth.value)) {
    const px = inValue.value * 96;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToIn = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    inValue.value = parseFloat((px / 96).toFixed(4));
  }
};

// PC to VW conversions
const convertPcToVw = () => {
  if (hasValue(pcValue.value) && isNonZero(viewportWidth.value)) {
    const px = pcValue.value * 16;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPc = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    pcValue.value = parseFloat((px / 16).toFixed(4));
  }
};

// CM to VW conversions
const convertCmToVw = () => {
  if (hasValue(cmValue.value) && isNonZero(viewportWidth.value)) {
    const px = cmValue.value * 37.795;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToCm = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    cmValue.value = parseFloat((px / 37.795).toFixed(4));
  }
};

// MM to VW conversions
const convertMmToVw = () => {
  if (hasValue(mmValue.value) && isNonZero(viewportWidth.value)) {
    const px = mmValue.value * 3.7795;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToMm = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value)) {
    const px = (vwValue.value / 100) * viewportWidth.value;
    mmValue.value = parseFloat((px / 3.7795).toFixed(4));
  }
};

// Percentage to VW conversions
const convertPercentToVw = () => {
  if (hasValue(percentValue.value) && isNonZero(viewportWidth.value)) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    const px = (percentValue.value / 100) * baseSize;
    vwValue.value = parseFloat(((px / viewportWidth.value) * 100).toFixed(4));
  }
};

const convertVwToPercent = () => {
  if (hasValue(vwValue.value) && isNonZero(viewportWidth.value) && (percentageContext.value !== 'font-size' || isNonZero(parentFontSize.value))) {
    const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
    const px = (vwValue.value / 100) * viewportWidth.value;
    percentValue.value = parseFloat(((px / baseSize) * 100).toFixed(2));
  }
};

// Generate conversion tables
const pxToRemTable = computed(() => {
  const table = [];
  for (let px = 1; px <= 100; px++) {
    const rem = parseFloat((px / rootFontSize.value).toFixed(4));
    table.push({
      px,
      rem,
      highlight: px === 4 || px === 8 || px === 16 || px === 24 || px === 32
    });
  }
  return table;
});

const remToPxTable = computed(() => {
  const table = [];
  const remValues = [0.01, 0.03, 0.05, 0.08, 0.1, 0.15, 0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 100];
  for (const rem of remValues) {
    const px = parseFloat((rem * rootFontSize.value).toFixed(1));
    table.push({
      rem,
      px,
      highlight: rem === 0.5 || rem === 1 || rem === 1.5 || rem === 2
    });
  }
  return table;
});

const pxToEmTable = computed(() => {
  const table = [];
  for (let px = 1; px <= 100; px++) {
    const em = parseFloat((px / parentFontSize.value).toFixed(4));
    table.push({
      px,
      em,
      highlight: px === 4 || px === 8 || px === 16 || px === 24 || px === 32
    });
  }
  return table;
});

const pxToPercentTable = computed(() => {
  const table = [];
  const baseSize = percentageContext.value === 'font-size' ? parentFontSize.value : 100;
  const pxValues = [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 50, 64, 72, 80, 96, 100];
  for (const px of pxValues) {
    const percent = parseFloat(((px / baseSize) * 100).toFixed(2));
    table.push({ px, percent });
  }
  return table;
});

const pxToTailwindTable = computed(() => {
  const table = [];
  const pxValues = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 128, 160, 192, 224, 256, 320, 384];
  for (const px of pxValues) {
    const rem = px / rootFontSize.value;
    const twUnits = rem / 0.25;
    let closest = tailwindScale[0];
    let minDiff = Math.abs(twUnits - closest);
    for (const val of tailwindScale) {
      const diff = Math.abs(twUnits - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = val;
      }
    }
    table.push({ px, tw: closest.toString() });
  }
  return table;
});

// Unified conversion table with all units
const unifiedConversionTable = computed(() => {
  const table = [];
  const baseSize = isNonZero(parentFontSize.value) ? parentFontSize.value : rootFontSize.value;
  
  // Generate values starting from 8px and incrementing
  // Based on the reference image, we'll generate a comprehensive table
  const pxValues = [];
  for (let px = 8; px <= 100; px++) {
    pxValues.push(px);
  }
  
  for (const px of pxValues) {
    const em = parseFloat((px / baseSize).toFixed(4));
    const rem = parseFloat((px / rootFontSize.value).toFixed(4));
    const percent = parseFloat(((px / baseSize) * 100).toFixed(2));
    const point = parseFloat((px * 0.75).toFixed(2));
    
    table.push({
      em,
      px,
      rem,
      percent,
      point
    });
  }
  
  return table;
});

// Copy to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(`Copied ${text}.`, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

// ---------------------------------------------------------------------------
// The two-way converters: each mode shows two fields that convert into each
// other as you type.
// ---------------------------------------------------------------------------
const field = (label, model, unit, step, placeholder, convert) => ({ label, model, unit, step, placeholder, convert });
const pxField = (placeholder, convert) => field('Pixels', pxValue, 'px', '0.1', placeholder, convert);

const converterPairs = {
  'px-to-rem': [pxField('16', convertPxToRem), field('REM', remValue, 'rem', '0.0001', '1', convertRemToPx)],
  'px-to-em': [pxField('16', convertPxToEm), field('EM', emValue, 'em', '0.0001', '1', convertEmToPx)],
  'px-to-percent': [pxField('16', convertPxToPercent), field('Percentage', percentValue, '%', '0.01', '100', convertPercentToPx)],
  'px-to-vh': [pxField('108', convertPxToVh), field('VH', vhValue, 'vh', '0.0001', '10', convertVhToPx)],
  'px-to-pt': [pxField('16', convertPxToPt), field('PT', ptValue, 'pt', '0.01', '12', convertPtToPx)],
  'px-to-in': [pxField('96', convertPxToIn), field('IN', inValue, 'in', '0.0001', '1', convertInToPx)],
  'px-to-pc': [pxField('16', convertPxToPc), field('PC', pcValue, 'pc', '0.0001', '1', convertPcToPx)],
  'px-to-cm': [pxField('37.795', convertPxToCm), field('CM', cmValue, 'cm', '0.0001', '1', convertCmToPx)],
  'px-to-mm': [pxField('3.7795', convertPxToMm), field('MM', mmValue, 'mm', '0.0001', '1', convertMmToPx)],
  'rem-to-vw': [field('REM', remValue, 'rem', '0.0001', '1', convertRemToVw), field('VW', vwValue, 'vw', '0.0001', '0.833', convertVwToRem)],
  'em-to-vw': [field('EM', emValue, 'em', '0.0001', '1', convertEmToVw), field('VW', vwValue, 'vw', '0.0001', '0.833', convertVwToEm)],
  'vh-to-vw': [field('VH', vhValue, 'vh', '0.0001', '10', convertVhToVw), field('VW', vwValue, 'vw', '0.0001', '17.778', convertVwToVh)],
  'pt-to-vw': [field('PT', ptValue, 'pt', '0.01', '12', convertPtToVw), field('VW', vwValue, 'vw', '0.0001', '0.625', convertVwToPt)],
  'in-to-vw': [field('IN', inValue, 'in', '0.0001', '1', convertInToVw), field('VW', vwValue, 'vw', '0.0001', '5.208', convertVwToIn)],
  'pc-to-vw': [field('PC', pcValue, 'pc', '0.0001', '1', convertPcToVw), field('VW', vwValue, 'vw', '0.0001', '0.833', convertVwToPc)],
  'cm-to-vw': [field('CM', cmValue, 'cm', '0.0001', '1', convertCmToVw), field('VW', vwValue, 'vw', '0.0001', '1.97', convertVwToCm)],
  'mm-to-vw': [field('MM', mmValue, 'mm', '0.0001', '10', convertMmToVw), field('VW', vwValue, 'vw', '0.0001', '0.197', convertVwToMm)],
  'percent-to-vw': [field('Percentage', percentValue, '%', '0.01', '100', convertPercentToVw), field('VW', vwValue, 'vw', '0.0001', '52.083', convertVwToPercent)],
};
const currentPair = computed(() => converterPairs[selectedMode.value] ?? null);

const setField = (item, value) => {
  item.model.value = value;
  item.convert();
};
const onPxForTailwind = (value) => {
  pxValue.value = value;
  convertPxToTailwind();
};
const onBaseUnit = (value) => {
  baseUnitValue.value = value;
  convertBaseToPx();
};

const modeGroups = [
  { label: 'Typography units', modes: typographyModes },
  { label: 'Physical units', modes: physicalModes },
  { label: 'Viewport units', modes: viewportModes },
  { label: 'Frameworks', modes: frameworkModes },
];

const contextOptions = [
  { value: 'font-size', label: 'Font Size' },
  { value: 'dimension', label: 'Width/Height' },
];

const calculationNote = computed(() => {
  const mode = selectedMode.value;
  if (mode === 'px-to-rem') return `Calculation based on a root font-size of ${rootFontSize.value} pixel.`;
  if (mode === 'px-to-em') return `Calculation based on a parent font-size of ${parentFontSize.value} pixel.`;
  if (mode === 'px-to-vh') return `Calculation based on a viewport height of ${viewportHeight.value} pixel.`;
  if (mode === 'px-to-percent') return `Calculation based on a parent size of ${percentageContext.value === 'font-size' ? parentFontSize.value : 100} pixel.`;
  if (mode.includes('vw')) return `Calculation based on a viewport width of ${viewportWidth.value} pixel.`;
  if (mode === 'px-to-tailwind') return `Tailwind uses 0.25rem increments (${rootFontSize.value * 0.25}px at ${rootFontSize.value}px root).`;
  return '';
});

const cssExamples = [
  { label: 'EM', code: 'h1 { font-size: 2em; }' },
  { label: 'Pixel', code: 'h1 { font-size: 32px; }' },
  { label: 'REM', code: 'h1 { font-size: 2rem; }' },
  { label: 'Percent', code: 'h1 { font-size: 200%; }' },
  { label: 'Point', code: 'h1 { font-size: 24pt; }' },
];

// Watch for mode changes to reset values
watch(selectedMode, () => {
  pxValue.value = 16;
  remValue.value = 1;
  emValue.value = 1;
  vhValue.value = 1;
  ptValue.value = 12;
  inValue.value = 0.167;
  pcValue.value = 1;
  cmValue.value = 0.424;
  mmValue.value = 4.233;
  percentValue.value = 100;
  vwValue.value = 1;
  baseUnitValue.value = '1rem';
  tailwindValue.value = '';
  tailwindClass.value = '';
  runCurrentConversion();
});

// Re-run the conversion for the current mode (after a mode or setting change).
const runCurrentConversion = () => {
  if (selectedMode.value === 'px-to-rem') {
    convertPxToRem();
  } else if (selectedMode.value === 'px-to-em') {
    convertPxToEm();
  } else if (selectedMode.value === 'px-to-vh') {
    convertPxToVh();
  } else if (selectedMode.value === 'px-to-pt') {
    convertPxToPt();
  } else if (selectedMode.value === 'px-to-in') {
    convertPxToIn();
  } else if (selectedMode.value === 'px-to-pc') {
    convertPxToPc();
  } else if (selectedMode.value === 'px-to-cm') {
    convertPxToCm();
  } else if (selectedMode.value === 'px-to-mm') {
    convertPxToMm();
  } else if (selectedMode.value === 'px-to-percent') {
    convertPxToPercent();
  } else if (selectedMode.value === 'rem-to-vw') {
    convertRemToVw();
  } else if (selectedMode.value === 'em-to-vw') {
    convertEmToVw();
  } else if (selectedMode.value === 'vh-to-vw') {
    convertVhToVw();
  } else if (selectedMode.value === 'pt-to-vw') {
    convertPtToVw();
  } else if (selectedMode.value === 'in-to-vw') {
    convertInToVw();
  } else if (selectedMode.value === 'pc-to-vw') {
    convertPcToVw();
  } else if (selectedMode.value === 'cm-to-vw') {
    convertCmToVw();
  } else if (selectedMode.value === 'mm-to-vw') {
    convertMmToVw();
  } else if (selectedMode.value === 'percent-to-vw') {
    convertPercentToVw();
  } else if (selectedMode.value === 'base-to-px') {
    convertBaseToPx();
  } else if (selectedMode.value === 'px-to-tailwind') {
    convertPxToTailwind();
  }
};

// Watch for configuration changes
watch([rootFontSize, parentFontSize, percentageContext, viewportWidth, viewportHeight], runCurrentConversion);

onMounted(runCurrentConversion);
</script>
