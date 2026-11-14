<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Font stack and subsetting"
      lead="Build font stacks with fallback fonts, and generate smaller Google Fonts URLs by subsetting character sets."
      spot="foundations/font-stack"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <!-- Font stack -->
        <UiPanel title="Font stack builder">
          <UiCallout title="What is a font stack?">
            A list of fonts that browsers try in order. If the first isn't available, the browser falls back to the next, so text stays
            readable even when the primary font fails to load. The builder writes a CSS <UiCode>font-family</UiCode> declaration with
            sensible fallbacks.
          </UiCallout>

          <UiSelect :model-value="selectedFontForStack" label="Primary font" :options="fontOptions" @update:model-value="selectFontForStack" />

          <template v-if="selectedFontForStack">
            <div v-if="getSelectedFontForStack()?.pairsWellWith?.length">
              <h3 class="mb-2 text-sm font-medium text-ink">Pairs well with</h3>
              <div class="flex flex-wrap gap-2">
                <UiButton
                  v-for="pair in getSelectedFontForStack().pairsWellWith"
                  :key="pair"
                  size="sm"
                  icon="add"
                  @click="addToFontStack(pair)"
                >
                  {{ pair }}
                </UiButton>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3 mb-2">
                <h3 class="text-sm font-medium text-ink">Font stack</h3>
                <UiButton size="sm" variant="ghost" icon="restart_alt" @click="resetFontStack">Reset to default</UiButton>
              </div>
              <ol class="flex flex-wrap items-center gap-2" aria-label="Fonts in the stack, in order">
                <li v-for="(fontName, index) in fontStack" :key="`${fontName}-${index}`" class="stack-item">
                  <span class="font-code text-sm text-ink">{{ fontName }}</span>
                  <UiButton
                    v-if="index > 0"
                    icon-only
                    icon="close"
                    size="sm"
                    variant="ghost"
                    :label="`Remove ${fontName} from the stack`"
                    @click="removeFromFontStack(index)"
                  />
                </li>
              </ol>
            </div>

            <div class="flex items-end gap-2">
              <div class="flex-1">
                <UiInput
                  v-model="newFontInStack"
                  label="Add a font"
                  placeholder="Type a font name (e.g. Arial, Georgia)…"
                  @keyup.enter="addToFontStack(newFontInStack)"
                />
              </div>
              <UiButton variant="primary" icon="add" @click="addToFontStack(newFontInStack)">Add</UiButton>
            </div>

            <div>
              <h3 class="mb-2 text-sm font-medium text-ink">Preview</h3>
              <UiTypeSample tag="p" class="leading-relaxed text-ink-strong" :family="fontFamilyValue">
                The quick brown fox jumps over the lazy dog. This demonstrates how the font stack falls back to system fonts if the primary font fails to load.
              </UiTypeSample>
            </div>

            <UiCodeBlock :code="fontStackCss" label="CSS" @copied="onStackCopied" @copy-failed="onStackCopyFailed" />
            <InlineNotice :notice="stackNotice" @dismiss="clearStackNotice" />
          </template>
        </UiPanel>

        <!-- Subsetting -->
        <UiPanel title="Font subsetting">
          <UiCallout title="What is font subsetting?">
            Include only the character sets you need, which makes the font smaller and faster to load. Pick the sets your project
            needs to generate a Google Fonts URL.
          </UiCallout>

          <UiSelect :model-value="selectedFontForSubsetting" label="Font" :options="fontOptions" @update:model-value="selectFontForSubsetting" />

          <UiSelect v-if="selectedFontForSubsetting" v-model="selectedWeightForSubsetting" label="Weight" :options="weightOptions" />

          <fieldset v-if="selectedFontForSubsetting" class="flex flex-col gap-3">
            <legend class="mb-1 text-sm font-medium text-ink">Character sets to include</legend>
            <p class="text-xs text-ink-muted">Only sets this font supports are shown.</p>
            <p v-if="getAvailableSubsetsForFont().length === 0" class="text-sm text-ink-muted">No character sets available for this font.</p>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <UiCheckbox
                v-for="subset in getAvailableSubsetsForFont()"
                :key="subset.value"
                v-model="selectedSubsets"
                :value="subset.value"
                :label="subset.label"
              />
            </div>
          </fieldset>

          <template v-if="subsetUrl">
            <UiCodeBlock :code="subsetUrl" label="Google Fonts URL" @copied="onSubsetCopied" @copy-failed="onSubsetCopyFailed" />
            <InlineNotice :notice="subsetNotice" @dismiss="clearSubsetNotice" />
          </template>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiCode, UiCodeBlock, UiInput, UiPanel, UiSelect } from '../components/ui';
import UiTypeSample from '../components/ui/UiTypeSample.vue';
import fontData from '../assets/fonts.json';

const { notice: stackNotice, showNotice: showStackNotice, clearNotice: clearStackNotice } = useNotice();
const { notice: subsetNotice, showNotice: showSubsetNotice, clearNotice: clearSubsetNotice } = useNotice();
const selectedFontForStack = ref('');
const fontStack = ref(['Arial', 'Helvetica', 'sans-serif']);
const newFontInStack = ref('');
const defaultFontStack = ref(['Arial', 'Helvetica', 'sans-serif']);
const selectedFontForSubsetting = ref('');
const selectedWeightForSubsetting = ref('');
const selectedSubsets = ref([]);

// CSS generic families are keywords and must not be quoted ('sans-serif' in
// quotes means a font literally named "sans-serif").
const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong',
]);

const formatFamily = (name) => {
  if (GENERIC_FAMILIES.has(name.toLowerCase())) return name.toLowerCase();
  return `'${name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
};

const fontFamilyValue = computed(() => fontStack.value.map(formatFamily).join(', '));

// Load the selected Google font so the preview actually shows it.
const loadedFontLinks = new Map();
watch(selectedFontForStack, (name) => {
  const font = fontData.find((f) => f.name === name);
  if (!font?.url || loadedFontLinks.has(font.url) || !font.url.startsWith('https://fonts.googleapis.com/')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.url;
  document.head.appendChild(link);
  loadedFontLinks.set(font.url, link);
});

onBeforeUnmount(() => {
  loadedFontLinks.forEach((link) => link.remove());
  loadedFontLinks.clear();
});

// Create font options for dropdown
const fontOptions = computed(() => {
  return [
    { label: 'Choose a font…', value: '' },
    ...fontData.map(font => ({ label: font.name, value: font.name }))
  ];
});

function getSelectedFontForStack() {
  if (!selectedFontForStack.value) return null;
  return fontData.find(f => f.name === selectedFontForStack.value);
}

function addToFontStack(fontName) {
  // Strip quotes/separators people paste from CSS ("'Inter', ...").
  const trimmed = (fontName || '').replace(/["';,{}]/g, '').trim();
  if (!trimmed) return;
  if (!fontStack.value.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
    // Keep a trailing generic family last, so it stays the final fallback.
    const last = fontStack.value[fontStack.value.length - 1];
    if (last && GENERIC_FAMILIES.has(last.toLowerCase()) && !GENERIC_FAMILIES.has(trimmed.toLowerCase())) {
      fontStack.value.splice(fontStack.value.length - 1, 0, trimmed);
    } else {
      fontStack.value.push(trimmed);
    }
  }
  newFontInStack.value = '';
}

function removeFromFontStack(index) {
  if (index > 0 && index < fontStack.value.length) {
    fontStack.value.splice(index, 1);
  }
}

function resetFontStack() {
  if (selectedFontForStack.value) {
    fontStack.value = buildFontStack(selectedFontForStack.value);
  } else {
    fontStack.value = [...defaultFontStack.value];
  }
}

const fontStackCss = computed(() => `font-family: ${fontFamilyValue.value};`);

// The code block copies; these report the result as before.
const onStackCopied = () => showStackNotice('Font stack CSS copied to clipboard.', 'success');
const onStackCopyFailed = () => showStackNotice('Failed to copy to clipboard.', 'error');

function selectFontForStack(name) {
  selectedFontForStack.value = name;
  fontStack.value = buildFontStack(name);
}

function selectFontForSubsetting(name) {
  selectedFontForSubsetting.value = name;
  selectedSubsets.value = [];
  selectedWeightForSubsetting.value = '';
}

function buildFontStack(fontName) {
  const stacks = {
    'serif': [fontName, 'Georgia', 'Times New Roman', 'serif'],
    'sans-serif': [fontName, 'Arial', 'Helvetica', 'sans-serif'],
    'monospace': [fontName, 'Courier New', 'Courier', 'monospace'],
    'display': [fontName, 'Impact', 'Arial Black', 'sans-serif'],
    'handwriting': [fontName, 'cursive']
  };
  
  const font = fontData.find(f => f.name === fontName);
  const stack = (font?.tags?.length && stacks[font.tags[0]]) || stacks['sans-serif'];
  // Drop duplicates (e.g. choosing Arial itself)
  return stack.filter((name, i) => stack.indexOf(name) === i);
}

// Font Subsetting functions
function getSelectedFontForSubsetting() {
  if (!selectedFontForSubsetting.value) return null;
  return fontData.find(f => f.name === selectedFontForSubsetting.value);
}

function getAvailableWeightsForSubsetting() {
  const font = getSelectedFontForSubsetting();
  if (!font || !font.weights) return [];
  // Copy before sorting: don't mutate the shared font data.
  return [...font.weights].sort((a, b) => parseInt(a) - parseInt(b));
}

function getAvailableSubsetsForFont() {
  const font = getSelectedFontForSubsetting();
  if (!font || !font.supports) return [];
  
  const allSubsets = [
    { value: 'latin', label: 'Latin', base: 'latin' },
    { value: 'latin-ext', label: 'Latin Extended', base: 'latin' },
    { value: 'cyrillic', label: 'Cyrillic', base: 'cyrillic' },
    { value: 'cyrillic-ext', label: 'Cyrillic Extended', base: 'cyrillic' },
    { value: 'greek', label: 'Greek', base: 'greek' },
    { value: 'greek-ext', label: 'Greek Extended', base: 'greek' },
    { value: 'arabic', label: 'Arabic', base: 'arabic' },
    { value: 'devanagari', label: 'Devanagari', base: 'devanagari' },
    { value: 'chinese-simplified', label: 'Chinese (Simplified)', base: 'chinese' }
  ];
  
  // Filter to only show subsets for scripts the font supports
  return allSubsets.filter(subset => {
    return font.supports.includes(subset.base);
  });
}

// The css2 API ignores `subset`; the original css API still honours it.
const subsetUrl = computed(() => {
  if (!selectedFontForSubsetting.value || selectedSubsets.value.length === 0 || !selectedWeightForSubsetting.value) return '';
  const family = encodeURIComponent(selectedFontForSubsetting.value).replace(/%20/g, '+');
  const weight = encodeURIComponent(selectedWeightForSubsetting.value);
  const subsets = selectedSubsets.value.map(encodeURIComponent).join(',');
  return `https://fonts.googleapis.com/css?family=${family}:${weight}&subset=${subsets}&display=swap`;
});

const onSubsetCopied = () => showSubsetNotice('Font subset URL copied to clipboard.', 'success');
const onSubsetCopyFailed = () => showSubsetNotice('Failed to copy to clipboard.', 'error');

function getWeightName(weight) {
  const weightNames = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  return weightNames[weight.toString()] || 'Unknown';
}

// Create weight options for dropdown
const weightOptions = computed(() => {
  const weights = getAvailableWeightsForSubsetting();
  return [
    { label: 'Choose a weight…', value: '' },
    ...weights.map(weight => ({ 
      label: `${getWeightName(weight)} (${weight})`, 
      value: weight 
    }))
  ];
});





</script>

<style scoped>
.stack-item {
  @apply inline-flex items-center gap-1 h-9 pl-3 pr-1 rounded-control border border-line bg-surface-control;
}
.stack-item:first-child {
  @apply pr-3;
}
</style>
