<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Palette builder"
      lead="The only tool that instantly diagnoses your color palette's flaws and provides one-click fixes in just 60 seconds."
      spot="foundations/color-palettes"
      size="tool"
    />

    <!-- Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <UiStat icon="palette" label="Total colors" :value="paletteColorsCount" />
      <UiStat icon="format_color_fill" label="Color scales" :value="colorScalesCount" />
      <UiStat icon="tune" label="Variants" :value="variantsCount" />
      <UiStat icon="dark_mode" label="Dark mode" :value="darkModeColorsCount" />
    </div>

    <!-- Progress Steps -->
    <nav aria-label="Palette builder steps" class="mb-8">
      <ol class="flex items-start w-full max-w-4xl mx-auto">
        <li v-for="(step, index) in steps" :key="index" class="flex items-start" :class="index < steps.length - 1 ? 'flex-1' : ''">
          <div class="flex flex-col items-center gap-2 shrink-0 w-16" :aria-current="currentStep === index ? 'step' : undefined">
            <span class="wizard-step-dot" :class="stepState(index)">
              <span v-if="currentStep > index" class="material-symbols-outlined text-lg" aria-hidden="true">check</span>
              <span v-else aria-hidden="true">{{ index + 1 }}</span>
            </span>
            <span class="text-sm font-medium text-center" :class="currentStep >= index ? 'text-ink-strong' : 'text-ink-muted'">
              {{ step.title }}
              <span class="sr-only">{{ currentStep > index ? '(done)' : currentStep === index ? '(current)' : '' }}</span>
            </span>
          </div>
          <span
            v-if="index < steps.length - 1"
            class="hidden sm:block h-0.5 flex-1 mt-5 mx-2 rounded-pill"
            :class="currentStep > index ? 'bg-accent' : 'bg-fill-strong'"
            aria-hidden="true"
          ></span>
        </li>
      </ol>
    </nav>

    <!-- Step Content -->
    <UiPanel :title="palette.name || 'My Color Palette'" :description="steps[currentStep].fullTitle">
      <template #actions>
        <PaletteHealthScore :palette="palette" :generated-data="generatedData" />
      </template>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <!-- Step 1: Build Palette -->
      <Step1Build
        v-if="currentStep === 0"
        :palette="palette"
        @update-palette="updatePalette"
        @update-generated-data="handleGeneratedData"
        @next="nextStep"
      />

      <!-- Step 2: Harmony Check -->
      <Step2Harmony
        v-if="currentStep === 1"
        :palette="palette"
        @update-palette="updatePalette"
        @back="prevStep"
        @next="nextStep"
      />

      <!-- Step 3: Contrast Testing -->
      <Step3Contrast
        v-if="currentStep === 2"
        :palette="palette"
        @update-palette="updatePalette"
        @back="prevStep"
        @next="nextStep"
      />

      <!-- Step 4: Assign Roles -->
      <Step4Roles
        v-if="currentStep === 3"
        :palette="palette"
        :generated-data="generatedData"
        @update-palette="updatePalette"
        @back="prevStep"
        @next="nextStep"
      />

      <!-- Step 5: Export & Use -->
      <Step5Use
        v-if="currentStep === 4"
        :palette="palette"
        :generated-data="generatedData"
        @back="prevStep"
        @export="exportPalette"
        @update-palette="updatePalette"
      />
    </UiPanel>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import Step1Build from '../components/Step1Build.vue';
import Step2Harmony from '../components/Step2Harmony.vue';
import Step3Contrast from '../components/Step3Contrast.vue';
import Step4Roles from '../components/Step4Roles.vue';
import Step5Use from '../components/Step5Use.vue';
import PaletteHealthScore from '../components/PaletteHealthScore.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageShell, UiPanel, UiStat } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const currentStep = ref(0);
const steps = [
  { title: 'Build', fullTitle: 'Step 1: Build Your Color Palette' },
  { title: 'Check', fullTitle: 'Step 2: Run a quick Harmony Check' },
  { title: 'Test', fullTitle: 'Step 3: Test Your Color Palette' },
  { title: 'Assign', fullTitle: 'Step 4: Assign Color Roles' },
  { title: 'Use', fullTitle: 'Step 5: Export & Use' },
];

const stepState = (index) => {
  if (currentStep.value > index) return 'wizard-step-done';
  if (currentStep.value === index) return 'wizard-step-current';
  return 'wizard-step-todo';
};

const palette = ref({
  name: 'My Color Palette',
  colors: [],
});

const generatedData = ref({
  variants: [],
  colorScales: [],
  darkModeColors: [],
  semanticSuggestions: {},
});

// Computed properties for overview card
const paletteColorsCount = computed(() => {
  return palette.value.colors?.length || 0;
});

const colorScalesCount = computed(() => {
  return generatedData.value.colorScales?.length || 0;
});

const variantsCount = computed(() => {
  return generatedData.value.variants?.length || 0;
});

const darkModeColorsCount = computed(() => {
  return generatedData.value.darkModeColors?.length || 0;
});

const updatePalette = (newPalette) => {
  palette.value = { ...palette.value, ...newPalette };
};

const handleGeneratedData = (data) => {
  generatedData.value = { ...generatedData.value, ...data };
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// Step 5 saves the palette, then emits `export` once it is stored.
const exportPalette = () => {
  showNotice('Palette saved successfully.', 'success');
};
</script>

<style scoped>
.wizard-step-dot {
  @apply flex items-center justify-center w-10 h-10 rounded-pill border-2 text-sm font-semibold transition-colors;
}
.wizard-step-done {
  @apply bg-accent border-accent text-ink-on-accent;
}
.wizard-step-current {
  @apply bg-surface-raised border-accent text-accent-text;
}
.wizard-step-todo {
  @apply bg-surface-raised border-line text-ink-muted;
}
</style>
