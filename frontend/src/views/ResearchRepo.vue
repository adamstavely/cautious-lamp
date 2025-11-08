<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Human-Centered Design
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore journey maps, user personas, HCD reports, and other human-centered design research artifacts that inform our design decisions.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="hcdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Person/user icon representing human-centered focus -->
                    <circle cx="100" cy="70" r="20" fill="url(#hcdGradient)" opacity="0.6"/>
                    <path d="M 100 90 Q 70 90 70 120 L 70 150 L 130 150 L 130 120 Q 130 90 100 90" fill="url(#hcdGradient)" opacity="0.5"/>
                    <!-- Design elements - circles representing ideas/insights -->
                    <circle cx="50" cy="50" r="8" fill="url(#hcdGradient)" opacity="0.4"/>
                    <circle cx="150" cy="50" r="8" fill="url(#hcdGradient)" opacity="0.4"/>
                    <circle cx="50" cy="150" r="8" fill="url(#hcdGradient)" opacity="0.4"/>
                    <circle cx="150" cy="150" r="8" fill="url(#hcdGradient)" opacity="0.4"/>
                    <!-- Connecting lines representing relationships and connections -->
                    <line x1="100" y1="70" x2="50" y2="50" stroke="url(#hcdGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="100" y1="70" x2="150" y2="50" stroke="url(#hcdGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="100" y1="120" x2="50" y2="150" stroke="url(#hcdGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="100" y1="120" x2="150" y2="150" stroke="url(#hcdGradient)" stroke-width="2" opacity="0.3"/>
                    <!-- Heart shape representing empathy and care -->
                    <path d="M 100 100 Q 90 90 85 95 Q 80 100 85 105 Q 90 110 100 120 Q 110 110 115 105 Q 120 100 115 95 Q 110 90 100 100" fill="url(#hcdGradient)" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Research Repo Cards Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse research
            </h2>
            <button 
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              View all resources
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Journey Maps Card -->
            <router-link 
              to="/research/journey-maps"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">map</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Journey Maps
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Visualize user journeys and experiences across different touchpoints and interactions.
              </p>
            </router-link>

            <!-- User Persona Generator Card -->
            <router-link 
              to="/research/user-personas"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">person</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                User Persona Generator
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create detailed user personas from research data to inform design decisions.
              </p>
            </router-link>

            <!-- HCD Reports Card -->
            <router-link 
              to="/research/hcd-reports"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">description</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                HCD Reports
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Access comprehensive human-centered design research reports and findings.
              </p>
            </router-link>

            <!-- User Personas Card -->
            <router-link 
              to="/research/user-studies"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">groups</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                User Personas
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Browse comprehensive user research studies, interviews, and observations.
              </p>
            </router-link>

            <!-- Research Artifacts Card -->
            <router-link 
              to="/research/artifacts"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">folder</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Research Artifacts
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Explore additional research artifacts including surveys, interviews, and analysis documents.
              </p>
            </router-link>

            <!-- Insights & Findings Card -->
            <router-link 
              to="/research/insights"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">insights</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Insights & Findings
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Discover key insights, patterns, and actionable findings from our research activities.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured UX Research Tools Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                UX Research Tools
              </h2>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <!-- User Persona Generator Card -->
              <router-link 
                to="/research/user-personas" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <span class="material-symbols-outlined text-5xl">person</span>
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">User Persona Generator</h3>
                <p class="text-white/80 text-sm">Create detailed user personas from research data to inform design decisions.</p>
              </router-link>

              <!-- NASA-TLX Card -->
              <router-link 
                to="/tools/nasa-tlx" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <span class="material-symbols-outlined text-5xl">psychology</span>
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">NASA-TLX</h3>
                <p class="text-white/80 text-sm">Assess task workload across six dimensions for usability analysis.</p>
              </router-link>

              <!-- System Usability Scale Card -->
              <router-link 
                to="/tools/sus" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <MonitorCog :size="48" :stroke-width="2" />
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">System Usability Scale</h3>
                <p class="text-white/80 text-sm">Quick and reliable tool for measuring system usability.</p>
              </router-link>

              <!-- Heuristic Evaluation Card -->
              <router-link 
                to="/tools/heuristic-evaluation" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <Checklist :size="48" :stroke-width="2" />
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">Heuristic Evaluation</h3>
                <p class="text-white/80 text-sm">Evaluate interfaces using Nielsen's 10 Usability Heuristics.</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const route = useRoute();
const drawerOpen = ref(false);
const isDarkMode = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
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

