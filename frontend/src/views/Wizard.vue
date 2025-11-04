<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">
          🎨 Color Palette Workbench
        </h1>
        <p class="mt-2 text-gray-600">
          The only tool that instantly diagnoses your color palette's flaws and provides one-click fixes in just 60 seconds.
        </p>
      </div>
    </header>

    <!-- Progress Steps -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center flex-1"
          >
            <div class="flex items-center flex-1">
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
                <span v-if="currentStep > index">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="ml-4 hidden sm:block">
                <div
                  class="text-sm font-medium"
                  :class="
                    currentStep >= index ? 'text-gray-900' : 'text-gray-500'
                  "
                >
                  {{ step.title }}
                </div>
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

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Step 1: Build Palette -->
        <Step1Build
          v-if="currentStep === 0"
          :palette="palette"
          @update-palette="updatePalette"
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
          @back="prevStep"
          @next="nextStep"
        />

        <!-- Step 4: Assign Roles -->
        <Step4Roles
          v-if="currentStep === 3"
          :palette="palette"
          @update-palette="updatePalette"
          @back="prevStep"
          @export="exportPalette"
        />
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

const currentStep = ref(0);
const steps = [
  { title: 'Build Your Color Palette' },
  { title: 'Harmony Check' },
  { title: 'Contrast Testing' },
  { title: 'Assign Color Roles' },
];

const palette = ref({
  name: 'My Color Palette',
  colors: [],
});

const updatePalette = (newPalette) => {
  palette.value = { ...palette.value, ...newPalette };
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

