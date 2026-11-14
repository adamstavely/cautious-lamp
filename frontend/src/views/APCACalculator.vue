<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="APCA calculator"
      lead="Compose colors with consistent APCA (Advanced Perceptual Contrast Algorithm) contrast. Calculate accessible color combinations using the modern contrast standard."
      spot="tools/apca-calculator"
      size="tool"
    />

    <PageSection title="Compose" description="Pick a contrast model, a reference color and the contrast you want.">
      <div class="flex flex-col gap-6">
        <UiPanel title="Contrast model">
          <UiSegmented v-model="contrastModel" :options="modelOptions" aria-label="Contrast model" />
        </UiPanel>

        <UiPanel title="Color composition">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-4">
              <div class="flex items-end gap-2">
                <div class="flex-1 min-w-0">
                  <UiInput
                    v-model="referenceColor"
                    :label="`Reference color (${colorPosition === 'bg' ? 'Background' : 'Foreground'})`"
                    :placeholder="referencePlaceholder"
                    mono
                  />
                </div>
                <div class="w-16 shrink-0">
                  <UiInput v-model="referenceColor" type="color" label="Pick" />
                </div>
              </div>
              <UiSegmented v-model="colorPosition" :options="positionOptions" label="Reference is the" />
            </div>

            <div class="flex flex-col gap-4">
              <UiRange
                :model-value="Number(contrastRatio) || 0"
                :label="`Desired contrast (${contrastRangeLabel})`"
                :min="contrastMin"
                :max="contrastMax"
                :step="0.1"
                @update:model-value="contrastRatio = $event"
              />
              <UiInput v-model="contrastRatio" type="number" label="Exact contrast" :min="contrastMin" :max="contrastMax" step="0.1" />
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-4">
              <UiRange
                :model-value="Number(chroma) || 0"
                label="Chroma (0-0.37)"
                :min="0"
                :max="0.37"
                :step="0.01"
                @update:model-value="chroma = $event"
              />
              <UiInput v-model="chroma" type="number" label="Exact chroma" min="0" max="0.37" step="0.01" />
              <UiSwitch v-model="useMaxChroma" label="Use max chroma" />
              <UiInput v-if="useMaxChroma" v-model="maxChromaLimit" type="number" label="Max chroma limit" min="0" max="0.37" step="0.01" placeholder="Limit" />
            </div>

            <div class="flex flex-col gap-4">
              <UiRange :model-value="Number(hue) || 0" label="Hue (0-360)" :min="0" :max="360" :step="1" @update:model-value="hue = $event" />
              <UiInput v-model="hue" type="number" label="Exact hue" min="0" max="360" step="1" />
            </div>

            <UiSelect v-model="searchDirection" label="Search direction" :options="directionOptions" />
          </div>

          <template #footer>
            <div class="flex flex-col gap-3 w-full py-2">
              <div><UiButton variant="primary" icon="calculate" @click="calculateColor">Calculate color</UiButton></div>
              <InlineNotice :notice="notice" @dismiss="clearNotice" />
            </div>
          </template>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection v-if="calculatedColor" title="Result" description="The color apcach found, in each format, and a sample of the pair." divided>
      <div class="flex flex-col gap-6">
        <UiPanel title="Calculated color">
          <InlineNotice :notice="copyNotice" @dismiss="clearCopyNotice" />
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-medium text-ink">Color preview</h3>
              <span class="block h-32"><UiSwatch :color="calculatedColorHex" size="fill" :label="`Calculated color: ${calculatedColorHex}`" /></span>
              <div class="sample-pair">Sample Text</div>
            </div>

            <div class="flex flex-col gap-3">
              <h3 class="text-sm font-medium text-ink">Color formats</h3>
              <div v-for="format in colorFormats" :key="format.label" class="flex items-end gap-2">
                <div class="flex-1 min-w-0">
                  <UiInput :model-value="format.value" :label="format.label" readonly mono />
                </div>
                <UiButton icon-only icon="content_copy" :label="`Copy ${format.label} value`" @click="copyToClipboard(format.value)" />
              </div>
            </div>
          </div>
        </UiPanel>

        <UiPanel title="Adjust color">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-2">
              <UiInput v-model="contrastAdjustment" type="number" label="Adjust contrast" :min="-contrastMax" :max="contrastMax" step="0.1" />
              <UiButton @click="adjustContrast">Apply</UiButton>
            </div>
            <div class="flex flex-col gap-2">
              <UiInput v-model="chromaAdjustment" type="number" label="Adjust chroma" min="-0.37" max="0.37" step="0.01" />
              <UiButton @click="adjustChroma">Apply</UiButton>
            </div>
            <div class="flex flex-col gap-2">
              <UiInput v-model="hueAdjustment" type="number" label="Adjust hue" min="-360" max="360" step="1" />
              <UiButton @click="adjustHue">Apply</UiButton>
            </div>
          </div>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiSwatch, UiSwitch } from '../components/ui';
import { apcach, crToBg, crToFg, maxChroma, apcachToCss, setContrast, setChroma, setHue } from 'apcach';

const { notice, showNotice, clearNotice } = useNotice();
const { notice: copyNotice, showNotice: showCopyNotice, clearNotice: clearCopyNotice } = useNotice();

// Calculator state
const contrastModel = ref('apca');
const referenceColor = ref('#ffffff');
const colorPosition = ref('bg');
const contrastRatio = ref(60);
const chroma = ref(0.2);
const hue = ref(145);
const useMaxChroma = ref(false);
const maxChromaLimit = ref(0.37);
const searchDirection = ref('auto');
const calculatedColor = ref(null);

// Adjustment values
const contrastAdjustment = ref(0);
const chromaAdjustment = ref(0);
const hueAdjustment = ref(0);

// Computed color formats
const calculatedColorOklch = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'oklch');
  } catch (e) {
    return '';
  }
});

const calculatedColorHex = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'hex');
  } catch (e) {
    return '';
  }
});

const calculatedColorRgb = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'rgb');
  } catch (e) {
    return '';
  }
});

const calculatedColorP3 = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'p3');
  } catch (e) {
    return '';
  }
});

// Contrast limits per model: APCA Lc 0..108, WCAG ratio 1..21.
const contrastRange = () => (contrastModel.value === 'apca' ? [0, 108] : [1, 21]);
const clampContrast = (value) => {
  const [min, max] = contrastRange();
  return Math.max(min, Math.min(max, value));
};
const wrapHue = (h) => ((h % 360) + 360) % 360;

// The two scales are not comparable, so switching model resets to a sensible default.
watch(contrastModel, (model) => {
  contrastRatio.value = model === 'apca' ? 60 : 4.5;
});

// With the reference as background, the calculated color is the text, and vice versa.
const sampleColors = computed(() =>
  colorPosition.value === 'bg'
    ? { bg: referenceColor.value, fg: calculatedColorHex.value }
    : { bg: calculatedColorHex.value, fg: referenceColor.value }
);

// Sync the inputs with the color apcach actually produced.
const syncInputs = (color) => {
  contrastRatio.value = color.contrastConfig?.cr ?? contrastRatio.value;
  if (typeof color.chroma === 'number') chroma.value = Math.round(color.chroma * 1000) / 1000;
  if (typeof color.hue === 'number') hue.value = Math.round(color.hue * 10) / 10;
};

const calculateColor = () => {
  const cr = Number(contrastRatio.value);
  const c = Number(chroma.value);
  const h = Number(hue.value);
  const limit = Number(maxChromaLimit.value);
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(referenceColor.value).trim()) && !/^(rgb|hsl|oklch|oklab|lab|lch|color)\(/i.test(String(referenceColor.value).trim())) {
    showNotice('Enter the reference color as a hex value (e.g. #ffffff) or a CSS color function.', 'error');
    return;
  }
  if (!Number.isFinite(cr)) {
    showNotice('Enter a contrast value.', 'error');
    return;
  }
  if (!useMaxChroma.value && (!Number.isFinite(c) || c < 0)) {
    showNotice('Chroma must be a number of 0 or more.', 'error');
    return;
  }
  if (!Number.isFinite(h)) {
    showNotice('Hue must be a number between 0 and 360.', 'error');
    return;
  }

  try {
    const chromaValue = useMaxChroma.value
      ? (Number.isFinite(limit) && limit > 0 ? maxChroma(Math.min(limit, 0.37)) : maxChroma())
      : Math.min(c, 0.37);

    // crToBg: the reference is the background and we solve for the foreground;
    // crToFg: the reference is the foreground and we solve for the background.
    // Signature: crToBg(color, contrast, model?, direction?)
    const crFunction = colorPosition.value === 'bg' ? crToBg : crToFg;
    const contrastConfig = crFunction(
      referenceColor.value.trim(),
      clampContrast(cr),
      contrastModel.value,
      searchDirection.value
    );

    const result = apcach(contrastConfig, chromaValue, wrapHue(h));
    if (!Number.isFinite(result?.lightness)) {
      throw new Error('apcach returned no lightness');
    }
    calculatedColor.value = result;
    syncInputs(result);
    clearNotice();
  } catch (error) {
    console.error('Error calculating color:', error);
    showNotice('Could not calculate a color. Please check your inputs.', 'error');
  }
};

// apcach's setters mutate the contrast config they are given, so hand them a copy.
const cloneColor = (color) => ({ ...color, contrastConfig: { ...color.contrastConfig } });

const adjustContrast = () => {
  if (!calculatedColor.value) return;
  const delta = Number(contrastAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    const current = Number(calculatedColor.value.contrastConfig?.cr ?? contrastRatio.value);
    const clampedContrast = clampContrast(current + delta);
    calculatedColor.value = setContrast(cloneColor(calculatedColor.value), clampedContrast);
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting contrast:', error);
    showNotice('Could not adjust the contrast.', 'error');
  }
};

const adjustChroma = () => {
  if (!calculatedColor.value) return;
  const delta = Number(chromaAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    calculatedColor.value = setChroma(cloneColor(calculatedColor.value), (c) => Number(c) + delta);
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting chroma:', error);
    showNotice('Could not adjust the chroma.', 'error');
  }
};

const adjustHue = () => {
  if (!calculatedColor.value) return;
  const delta = Number(hueAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    // Hue is an angle: wrap it (apcach would clamp 370 to 360).
    calculatedColor.value = setHue(cloneColor(calculatedColor.value), wrapHue(Number(calculatedColor.value.hue) + delta));
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting hue:', error);
    showNotice('Could not adjust the hue.', 'error');
  }
};

const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showCopyNotice(`Copied ${text}`, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showCopyNotice('Could not copy to the clipboard.', 'error');
  }
};

const modelOptions = [
  { value: 'apca', label: 'APCA (0-108)' },
  { value: 'wcag', label: 'WCAG (1-21)' },
];
const positionOptions = [
  { value: 'bg', label: 'Background' },
  { value: 'fg', label: 'Foreground' },
];
const directionOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'lighter', label: 'Lighter' },
  { value: 'darker', label: 'Darker' },
];
const referencePlaceholder = '#ffffff';

const contrastMin = computed(() => (contrastModel.value === 'apca' ? 0 : 1));
const contrastMax = computed(() => (contrastModel.value === 'apca' ? 108 : 21));
const contrastRangeLabel = computed(() => (contrastModel.value === 'apca' ? '0-108' : '1-21'));

// The calculated colour in each format, each with a copy button
const colorFormats = computed(() => [
  { label: 'OKLCH', value: calculatedColorOklch.value },
  { label: 'HEX', value: calculatedColorHex.value },
  { label: 'RGB', value: calculatedColorRgb.value },
  { label: 'Display P3', value: calculatedColorP3.value },
]);
</script>

<style scoped>
.sample-pair {
  @apply flex items-center justify-center h-32 rounded-control border border-line text-lg font-semibold;
  background: v-bind('sampleColors.bg');
  color: v-bind('sampleColors.fg');
}
</style>
