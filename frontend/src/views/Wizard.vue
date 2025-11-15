<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
    <!-- Breadcrumbs -->
    <Breadcrumbs />
    
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
      <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
        <!-- Background texture/grain effect -->
        <div class="absolute inset-0 opacity-10 texture-pattern"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div class="flex-1">
            <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Palette Builder
            </h1>
            <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              The only tool that instantly diagnoses your color palette's flaws and provides one-click fixes in just 60 seconds.
            </p>
          </div>
          <div class="hidden md:block flex-shrink-0">
            <div class="w-64 h-64 relative">
              <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                <defs>
                  <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <!-- Stylized palette icon -->
                <circle cx="50" cy="50" r="25" fill="url(#paletteGradient)" opacity="0.4"/>
                <circle cx="150" cy="50" r="25" fill="url(#paletteGradient)" opacity="0.5"/>
                <circle cx="50" cy="150" r="25" fill="url(#paletteGradient)" opacity="0.6"/>
                <circle cx="150" cy="150" r="25" fill="url(#paletteGradient)" opacity="0.4"/>
                <circle cx="100" cy="100" r="30" fill="url(#paletteGradient)" opacity="0.3"/>
                <path d="M 50 50 L 100 100 M 150 50 L 100 100 M 50 150 L 100 100 M 150 150 L 100 100" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Card -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div 
        class="rounded-2xl shadow-lg border p-6 transition-colors duration-300"
        :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Total Colors -->
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300"
              :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'"
            >
              <span 
                class="material-symbols-outlined text-2xl transition-colors duration-300"
                :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
              >
                palette
              </span>
            </div>
            <div>
              <p 
                class="text-sm font-medium transition-colors duration-300"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Total Colors
              </p>
              <p 
                class="text-2xl font-bold transition-colors duration-300"
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ paletteColorsCount }}
              </p>
            </div>
          </div>

          <!-- Color Scales -->
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300"
              :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'"
            >
              <span 
                class="material-symbols-outlined text-2xl transition-colors duration-300"
                :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'"
              >
                format_color_fill
              </span>
            </div>
            <div>
              <p 
                class="text-sm font-medium transition-colors duration-300"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Color Scales
              </p>
              <p 
                class="text-2xl font-bold transition-colors duration-300"
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ colorScalesCount }}
              </p>
            </div>
          </div>

          <!-- Variants -->
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300"
              :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'"
            >
              <span 
                class="material-symbols-outlined text-2xl transition-colors duration-300"
                :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'"
              >
                tune
              </span>
            </div>
            <div>
              <p 
                class="text-sm font-medium transition-colors duration-300"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Variants
              </p>
              <p 
                class="text-2xl font-bold transition-colors duration-300"
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ variantsCount }}
              </p>
            </div>
          </div>

          <!-- Dark Mode Colors -->
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300"
              :class="isDarkMode ? 'bg-slate-700' : 'bg-slate-100'"
            >
              <span 
                class="material-symbols-outlined text-2xl transition-colors duration-300"
                :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'"
              >
                dark_mode
              </span>
            </div>
            <div>
              <p 
                class="text-sm font-medium transition-colors duration-300"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Dark Mode
              </p>
              <p 
                class="text-2xl font-bold transition-colors duration-300"
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ darkModeColorsCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
                  class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300"
                  :class="[
                    currentStep > index
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : currentStep === index
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-gray-300 text-gray-400',
                    currentStep > index
                      ? ''
                      : isDarkMode ? 'bg-slate-700' : 'bg-white'
                  ]"
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
                  class="text-sm font-medium text-center transition-colors duration-300"
                  :class="
                    currentStep >= index 
                      ? (isDarkMode ? 'text-white' : 'text-gray-900')
                      : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
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
      <div 
        class="rounded-lg shadow-lg transition-colors duration-300"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <!-- Header with Palette Title and Health Score -->
        <div 
          class="border-b px-8 py-6 transition-colors duration-300"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 
                class="text-2xl font-bold transition-colors duration-300"
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ palette.name || 'My Color Palette' }}
              </h2>
              <p 
                class="text-sm mt-1 transition-colors duration-300"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
              >
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import Step1Build from '../components/Step1Build.vue';
import Step2Harmony from '../components/Step2Harmony.vue';
import Step3Contrast from '../components/Step3Contrast.vue';
import Step4Roles from '../components/Step4Roles.vue';
import Step5Use from '../components/Step5Use.vue';
import PaletteHealthScore from '../components/PaletteHealthScore.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

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

const exportPalette = async () => {
  // Export logic will be implemented
  console.log('Exporting palette:', palette.value);
  alert('Palette exported successfully!');
};

// Watch for dark mode changes and force update
watch(isDarkMode, () => {
  // Force a reactive update when dark mode changes
  nextTick(() => {
    // Trigger any necessary re-renders
  });
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Improved dark mode detection with immediate callback
  const updateDarkMode = () => {
    const wasDark = isDarkMode.value;
    isDarkMode.value = document.documentElement.classList.contains('dark');
    // Force update if state changed
    if (wasDark !== isDarkMode.value) {
      // Trigger reactivity
      nextTick(() => {});
    }
  };
  
  darkModeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateDarkMode();
      }
    });
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true
  });
  
  // Initial check
  updateDarkMode();
  
  // Fallback interval check
  darkModeInterval = setInterval(updateDarkMode, 50);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

<style>
/* Force transitions on all background color changes */
[class*="bg-white"][class*="bg-slate-800"],
[class*="bg-slate-800"][class*="bg-white"],
[class*="bg-indigo-100"][class*="bg-indigo-900"],
[class*="bg-purple-100"][class*="bg-purple-900"],
[class*="bg-blue-100"][class*="bg-blue-900"],
[class*="bg-slate-100"][class*="bg-slate-700"] {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Force transitions on text colors */
[class*="text-gray-900"][class*="text-white"],
[class*="text-white"][class*="text-gray-900"],
[class*="text-gray-500"][class*="text-gray-400"],
[class*="text-gray-400"][class*="text-gray-500"],
[class*="text-indigo-600"][class*="text-indigo-400"],
[class*="text-purple-600"][class*="text-purple-400"],
[class*="text-blue-600"][class*="text-blue-400"],
[class*="text-slate-600"][class*="text-slate-300"] {
  transition: color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Force transitions on border colors */
[class*="border-gray-200"][class*="border-gray-700"],
[class*="border-gray-700"][class*="border-gray-200"] {
  transition: border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>

