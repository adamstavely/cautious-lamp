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
                      Heuristic Evaluation
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Evaluate interfaces using Nielsen's 10 Usability Heuristics. Identify usability issues and prioritize improvements based on severity ratings.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">checklist</span>
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
                        <linearGradient id="heuristicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized checklist icon -->
                      <rect x="40" y="40" width="120" height="20" rx="4" fill="url(#heuristicGradient)" opacity="0.4"/>
                      <rect x="40" y="70" width="120" height="20" rx="4" fill="url(#heuristicGradient)" opacity="0.5"/>
                      <rect x="40" y="100" width="120" height="20" rx="4" fill="url(#heuristicGradient)" opacity="0.4"/>
                      <rect x="40" y="130" width="120" height="20" rx="4" fill="url(#heuristicGradient)" opacity="0.5"/>
                      <circle cx="50" cy="50" r="6" fill="white" opacity="0.8"/>
                      <circle cx="50" cy="80" r="6" fill="white" opacity="0.8"/>
                      <circle cx="50" cy="110" r="6" fill="white" opacity="0.8"/>
                      <circle cx="50" cy="140" r="6" fill="white" opacity="0.8"/>
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
              <form @submit.prevent="submitEvaluation" class="space-y-6">
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

                <!-- Evaluator Name -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Evaluator Name
                  </label>
                  <input
                    v-model="form.evaluator"
                    type="text"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="Enter your name"
                  />
                </div>

                <!-- Heuristics Evaluation -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Nielsen's 10 Usability Heuristics
                  </h3>
                  
                  <div v-for="(heuristic, index) in heuristics" :key="index" class="border rounded-lg p-4"
                    :class="isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h4 class="font-semibold mb-1" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                          {{ index + 1 }}. {{ heuristic.name }}
                        </h4>
                        <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ heuristic.description }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Issues Found -->
                    <div class="mt-4">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Issues Found
                      </label>
                      <textarea
                        v-model="form.heuristics[index].issues"
                        rows="3"
                        class="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :class="isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 bg-white text-gray-900'"
                        :placeholder="`Describe any issues related to ${heuristic.name.toLowerCase()}...`"
                      ></textarea>
                    </div>
                    
                    <!-- Severity Rating -->
                    <div class="mt-4">
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Severity Rating
                      </label>
                      <div class="flex items-center gap-4">
                        <label 
                          v-for="severity in severityOptions" 
                          :key="severity.value"
                          class="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            :value="severity.value"
                            v-model="form.heuristics[index].severity"
                            class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            :class="isDarkMode ? 'accent-indigo-500' : ''"
                          />
                          <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            {{ severity.label }}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Overall Assessment -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Overall Assessment
                  </label>
                  <textarea
                    v-model="form.overallAssessment"
                    rows="4"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                    placeholder="Provide an overall assessment and recommendations..."
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end gap-4">
                  <button
                    type="button"
                    @click="resetForm"
                    class="px-6 py-2 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    <span v-if="isSubmitting">Submitting...</span>
                    <span v-else>Submit Evaluation</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Results Summary -->
            <div 
              v-if="results"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                Evaluation Summary
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Issues</div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ results.totalIssues }}
                    </div>
                  </div>
                  <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Critical Issues</div>
                    <div class="text-2xl font-bold text-red-600">
                      {{ results.criticalIssues }}
                    </div>
                  </div>
                  <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Overall Score</div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      {{ results.overallScore }}/10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
const isSubmitting = ref(false);
const results = ref(null);

const systemOptions = [
  { value: 'design-system', label: 'Design System' },
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'admin-panel', label: 'Admin Panel' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'other', label: 'Other' }
];

const severityOptions = [
  { value: 0, label: 'No Issues' },
  { value: 1, label: 'Cosmetic' },
  { value: 2, label: 'Minor' },
  { value: 3, label: 'Major' },
  { value: 4, label: 'Critical' }
];

const heuristics = [
  {
    name: 'Visibility of System Status',
    description: 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.'
  },
  {
    name: 'Match Between System and Real World',
    description: 'The system should speak the users\' language, with words, phrases and concepts familiar to the user, rather than system-oriented terms.'
  },
  {
    name: 'User Control and Freedom',
    description: 'Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state.'
  },
  {
    name: 'Consistency and Standards',
    description: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.'
  },
  {
    name: 'Error Prevention',
    description: 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.'
  },
  {
    name: 'Recognition Rather Than Recall',
    description: 'Minimize the user\'s memory load by making objects, actions, and options visible.'
  },
  {
    name: 'Flexibility and Efficiency of Use',
    description: 'Accelerators — unseen by the novice user — may often speed up the interaction for the expert user.'
  },
  {
    name: 'Aesthetic and Minimalist Design',
    description: 'Dialogues should not contain information which is irrelevant or rarely needed.'
  },
  {
    name: 'Help Users Recognize, Diagnose, and Recover from Errors',
    description: 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.'
  },
  {
    name: 'Help and Documentation',
    description: 'Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.'
  }
];

const form = reactive({
  systemName: '',
  evaluator: '',
  heuristics: heuristics.map(() => ({
    issues: '',
    severity: 0
  })),
  overallAssessment: ''
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const resetForm = () => {
  form.systemName = '';
  form.evaluator = '';
  form.heuristics = heuristics.map(() => ({
    issues: '',
    severity: 0
  }));
  form.overallAssessment = '';
  results.value = null;
};

const calculateResults = () => {
  const totalIssues = form.heuristics.filter(h => h.issues.trim().length > 0).length;
  const criticalIssues = form.heuristics.filter(h => h.severity === 4).length;
  
  // Calculate overall score (10 - average severity, normalized to 0-10)
  const severities = form.heuristics.map(h => h.severity);
  const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
  const overallScore = Math.max(0, Math.min(10, 10 - avgSeverity));
  
  return {
    totalIssues,
    criticalIssues,
    overallScore: Math.round(overallScore * 10) / 10
  };
};

const submitEvaluation = async () => {
  isSubmitting.value = true;
  
  try {
    const evaluationData = {
      systemName: form.systemName,
      evaluator: form.evaluator,
      heuristics: form.heuristics.map((h, index) => ({
        heuristic: heuristics[index].name,
        issues: h.issues,
        severity: h.severity
      })),
      overallAssessment: form.overallAssessment,
      timestamp: new Date().toISOString()
    };
    
    // Calculate and display results
    results.value = calculateResults();
    
    // Submit to backend (similar to NASA-TLX)
    const response = await axios.post(
      'http://localhost:3000/api/v1/heuristic-evaluation',
      evaluationData,
      {
        headers: {
          'Authorization': 'Bearer dev-key',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Evaluation submitted:', response.data);
    
    // Show success message (you could add a toast notification here)
    alert('Evaluation submitted successfully!');
    
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    // Still show results even if backend submission fails
    results.value = calculateResults();
    alert('Evaluation saved locally. Backend submission failed.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
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

