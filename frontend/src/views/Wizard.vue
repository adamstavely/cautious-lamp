<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-link
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <span class="material-symbols-outlined mr-2">arrow_back</span>
          <span>Back to Home</span>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Palette Builder
        </h1>
        <p class="mt-2 text-gray-600">
          The only tool that instantly diagnoses your color palette's flaws and provides one-click fixes in just 60 seconds.
        </p>
      </div>
    </header>

    <!-- Progress Steps -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center w-full max-w-4xl">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex items-center"
              :class="index < steps.length - 1 ? 'flex-1' : ''"
            >
              <div class="flex items-center justify-center shrink-0">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all"
                  :class="
                    currentStep > index
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : currentStep === index
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  "
                >
                  <span class="text-sm font-semibold">{{ currentStep > index ? '✓' : index + 1 }}</span>
                </div>
              </div>
              <div
                v-if="index < steps.length - 1"
                class="hidden sm:block h-0.5 flex-1 mx-4"
                :class="currentStep > index ? 'bg-indigo-600' : 'bg-gray-300'"
              ></div>
            </div>
          </div>
        </div>
        <!-- Step Labels -->
        <div class="flex items-center justify-center mt-4">
          <div class="flex items-center w-full max-w-4xl">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex items-center"
              :class="index < steps.length - 1 ? 'flex-1' : ''"
            >
              <div class="flex items-center justify-center shrink-0 w-10">
                <div
                  class="text-sm font-medium text-center"
                  :class="
                    currentStep >= index ? 'text-gray-900' : 'text-gray-500'
                  "
                >
                  {{ step.title }}
                </div>
              </div>
              <div
                v-if="index < steps.length - 1"
                class="hidden sm:block flex-1 mx-4"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-lg">
        <!-- Header with Palette Title and Health Score -->
        <div class="border-b border-gray-200 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ palette.name || 'My Color Palette' }}</h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ steps[currentStep].fullTitle }}
              </p>
            </div>
            <PaletteHealthScore :palette="palette" :generated-data="generatedData" />
          </div>
        </div>
        
        <!-- Step Content -->
        <div class="p-8">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Step1Build from '../components/Step1Build.vue';
import Step2Harmony from '../components/Step2Harmony.vue';
import Step3Contrast from '../components/Step3Contrast.vue';
import Step4Roles from '../components/Step4Roles.vue';
import Step5Use from '../components/Step5Use.vue';
import PaletteHealthScore from '../components/PaletteHealthScore.vue';

const currentStep = ref(0);
const steps = [
  { title: 'Build', fullTitle: 'Step 1: Build Your Color Palette' },
  { title: 'Check', fullTitle: 'Step 2: Run a quick Harmony Check' },
  { title: 'Test', fullTitle: 'Step 3: Test Your Color Palette' },
  { title: 'Assign', fullTitle: 'Step 4: Assign Color Roles' },
  { title: 'Use', fullTitle: 'Step 5: Export & Use' },
];

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

const exportPalette = async () => {
  // Export logic will be implemented
  console.log('Exporting palette:', palette.value);
  alert('Palette exported successfully!');
};
</script>

