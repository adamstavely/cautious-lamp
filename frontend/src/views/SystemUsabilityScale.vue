<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      System Usability Scale
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    A quick and reliable tool for measuring the usability of a system. Answer 10 questions to get a usability score from 0-100.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">psychology</span>
                      Usability Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="susGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized scale/rating icon -->
                      <rect x="40" y="60" width="120" height="8" rx="4" fill="url(#susGradient)" opacity="0.4"/>
                      <rect x="40" y="80" width="120" height="8" rx="4" fill="url(#susGradient)" opacity="0.5"/>
                      <rect x="40" y="100" width="120" height="8" rx="4" fill="url(#susGradient)" opacity="0.6"/>
                      <rect x="40" y="120" width="120" height="8" rx="4" fill="url(#susGradient)" opacity="0.5"/>
                      <rect x="40" y="140" width="120" height="8" rx="4" fill="url(#susGradient)" opacity="0.4"/>
                      <!-- Scale markers -->
                      <circle cx="50" cy="64" r="4" fill="white" opacity="0.8"/>
                      <circle cx="100" cy="104" r="4" fill="white" opacity="0.8"/>
                      <circle cx="150" cy="144" r="4" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- System/Application Dropdown -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    System / Application
                  </label>
                  <Dropdown
                    v-model="form.systemName"
                    :options="systemOptions"
                    placeholder="Select a system or application"
                    class="w-full"
                  />
                </div>

                <!-- SUS Questions -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Please rate your agreement with each statement (1 = Strongly Disagree, 5 = Strongly Agree)
                  </h3>

                  <div
                    v-for="(question, index) in questions"
                    :key="index"
                    class="border-b pb-4"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ index + 1 }}. {{ question }}
                    </label>
                    <div class="flex items-center gap-4">
                      <label
                        v-for="rating in [1, 2, 3, 4, 5]"
                        :key="rating"
                        class="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          :name="`q${index + 1}`"
                          type="radio"
                          :value="rating"
                          v-model="form[`q${index + 1}`]"
                          class="w-4 h-4"
                          :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                        />
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ rating }}
                        </span>
                      </label>
                      <span class="text-xs ml-auto" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                        {{ getRatingLabel(form[`q${index + 1}`]) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Score Preview -->
                <div
                  v-if="hasAllAnswers"
                  class="rounded-lg p-4 border"
                  :class="isDarkMode 
                    ? 'bg-indigo-900/20 border-indigo-700' 
                    : 'bg-indigo-50 border-indigo-200'"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-900'">
                      Estimated SUS Score:
                    </span>
                    <span class="text-2xl font-bold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      {{ calculateScore() }}
                    </span>
                  </div>
                  <p class="text-xs mt-2" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-700'">
                    {{ getScoreInterpretation(calculateScore()) }}
                  </p>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-4">
                  <button
                    type="submit"
                    :disabled="isSubmitting || !hasAllAnswers"
                    class="px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                    :class="(isSubmitting || !hasAllAnswers)
                      ? (isDarkMode 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                      : (isDarkMode 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700')"
                  >
                    <span v-if="isSubmitting" class="flex items-center gap-2">
                      <span class="material-symbols-outlined animate-spin">refresh</span>
                      Submitting...
                    </span>
                    <span v-else class="flex items-center gap-2">
                      <span class="material-symbols-outlined">save</span>
                      Submit Assessment
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Success Message -->
            <div
              v-if="showSuccess"
              class="rounded-lg p-4 mb-6 border"
              :class="isDarkMode 
                ? 'bg-green-900/30 border-green-700 text-green-300' 
                : 'bg-green-50 border-green-300 text-green-800'"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined">check_circle</span>
                <span>Assessment submitted successfully! Your SUS score: {{ lastScore }}. Data has been saved to Elasticsearch for analysis.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isSubmitting = ref(false);
const showSuccess = ref(false);
const lastScore = ref(0);

const form = ref({
  systemName: '',
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
  q6: null,
  q7: null,
  q8: null,
  q9: null,
  q10: null,
});

const questions = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to be able to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
];

const systemOptions = ref([
  { value: 'Marketing Site', label: 'Marketing Site' },
  { value: 'Admin Dashboard', label: 'Admin Dashboard' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Design System', label: 'Design System' },
  { value: 'Other', label: 'Other' },
]);

const hasAllAnswers = computed(() => {
  return form.value.systemName && 
         form.value.q1 && form.value.q2 && form.value.q3 && form.value.q4 && form.value.q5 &&
         form.value.q6 && form.value.q7 && form.value.q8 && form.value.q9 && form.value.q10;
});

const getRatingLabel = (rating) => {
  if (!rating) return '';
  const labels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree',
  };
  return labels[rating] || '';
};

const calculateScore = () => {
  if (!hasAllAnswers.value) return 0;
  
  let score = 0;
  // Odd questions: score - 1
  score += (form.value.q1 - 1) + (form.value.q3 - 1) + (form.value.q5 - 1) + (form.value.q7 - 1) + (form.value.q9 - 1);
  // Even questions: 5 - score
  score += (5 - form.value.q2) + (5 - form.value.q4) + (5 - form.value.q6) + (5 - form.value.q8) + (5 - form.value.q10);
  score *= 2.5; // Convert to 0-100 scale
  
  return Math.round(score * 10) / 10;
};

const getScoreInterpretation = (score) => {
  if (score >= 80) return 'Excellent - The system has excellent usability.';
  if (score >= 68) return 'Good - The system has good usability.';
  if (score >= 51) return 'OK - The system has acceptable usability but could be improved.';
  return 'Poor - The system has poor usability and needs significant improvement.';
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const submitForm = async () => {
  if (!hasAllAnswers.value) {
    alert('Please answer all questions.');
    return;
  }

  isSubmitting.value = true;
  showSuccess.value = false;

  try {
    const apiKey = localStorage.getItem('apiKey') || 'dev-key';
    const user = localStorage.getItem('currentDesigner') || 'Anonymous User';
    
    const payload = {
      ...form.value,
      user,
    };

    const response = await axios.post('http://localhost:3000/api/v1/sus', payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    lastScore.value = response.data.score;
    showSuccess.value = true;
    
    // Reset form
    form.value = {
      systemName: '',
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null,
      q6: null,
      q7: null,
      q8: null,
      q9: null,
      q10: null,
    };

    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.error('Failed to submit SUS:', error);
    alert('Failed to submit assessment. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

