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
                      NASA-TLX
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    NASA Task Load Index - Assess the workload of a task across six dimensions: Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, and Frustration.
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
                        <linearGradient id="nasatlxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized workload assessment icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#nasatlxGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="45" fill="url(#nasatlxGradient)" opacity="0.3"/>
                      <circle cx="100" cy="100" r="30" fill="url(#nasatlxGradient)" opacity="0.4"/>
                      <circle cx="100" cy="100" r="15" fill="white" opacity="0.8"/>
                      <!-- Six dimension indicators -->
                      <circle cx="100" cy="40" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
                      <circle cx="160" cy="80" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
                      <circle cx="160" cy="120" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
                      <circle cx="100" cy="160" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
                      <circle cx="40" cy="120" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
                      <circle cx="40" cy="80" r="8" fill="url(#nasatlxGradient)" opacity="0.5"/>
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

                <!-- Task Description -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Task Description
                  </label>
                  <textarea
                    v-model="form.task"
                    required
                    rows="3"
                    placeholder="Describe the task you are evaluating..."
                    class="w-full px-3 py-2 border rounded-lg"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  ></textarea>
                </div>

                <!-- NASA-TLX Dimensions -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Rate each dimension (0 = Very Low, 100 = Very High)
                  </h3>

                  <!-- Mental Demand -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Mental Demand
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.mentalDemand }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.mentalDemand"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <!-- Physical Demand -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Physical Demand
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.physicalDemand }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.physicalDemand"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <!-- Temporal Demand -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Temporal Demand
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.temporalDemand }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.temporalDemand"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <!-- Performance -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Performance
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.performance }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.performance"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Perfect</span>
                      <span>Failure</span>
                    </div>
                  </div>

                  <!-- Effort -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Effort
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.effort }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.effort"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  <!-- Frustration -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Frustration
                      </label>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        {{ form.frustration }}
                      </span>
                    </div>
                    <input
                      v-model.number="form.frustration"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-4">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                    :class="isSubmitting
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
                <span>Assessment submitted successfully! Data has been saved to Elasticsearch for analysis.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isSubmitting = ref(false);
const showSuccess = ref(false);

const form = ref({
  systemName: '',
  task: '',
  mentalDemand: 50,
  physicalDemand: 50,
  temporalDemand: 50,
  performance: 50,
  effort: 50,
  frustration: 50,
});

const systemOptions = ref([
  { value: 'Marketing Site', label: 'Marketing Site' },
  { value: 'Admin Dashboard', label: 'Admin Dashboard' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Design System', label: 'Design System' },
  { value: 'Other', label: 'Other' },
]);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const submitForm = async () => {
  if (!form.value.systemName || !form.value.task) {
    alert('Please fill in all required fields.');
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

    await axios.post('http://localhost:3000/api/v1/nasa-tlx', payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    showSuccess.value = true;
    
    // Reset form
    form.value = {
      systemName: '',
      task: '',
      mentalDemand: 50,
      physicalDemand: 50,
      temporalDemand: 50,
      performance: 50,
      effort: 50,
      frustration: 50,
    };

    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.error('Failed to submit NASA-TLX:', error);
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

