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
                  Research Repo
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore journey maps, user personas, HCD reports, and other human-centered design research artifacts that inform our design decisions.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="researchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Microscope/research icon -->
                    <circle cx="100" cy="80" r="25" fill="none" stroke="url(#researchGradient)" stroke-width="3" opacity="0.5"/>
                    <rect x="85" y="105" width="30" height="60" rx="4" fill="url(#researchGradient)" opacity="0.4"/>
                    <rect x="90" y="165" width="20" height="10" rx="2" fill="url(#researchGradient)" opacity="0.6"/>
                    <!-- Data points representing research findings -->
                    <circle cx="50" cy="50" r="4" fill="url(#researchGradient)" opacity="0.6"/>
                    <circle cx="150" cy="60" r="4" fill="url(#researchGradient)" opacity="0.5"/>
                    <circle cx="60" cy="140" r="4" fill="url(#researchGradient)" opacity="0.4"/>
                    <circle cx="140" cy="150" r="4" fill="url(#researchGradient)" opacity="0.5"/>
                    <!-- Chart bars representing data -->
                    <rect x="35" y="120" width="8" height="30" rx="2" fill="url(#researchGradient)" opacity="0.3"/>
                    <rect x="47" y="110" width="8" height="40" rx="2" fill="url(#researchGradient)" opacity="0.4"/>
                    <rect x="145" y="100" width="8" height="50" rx="2" fill="url(#researchGradient)" opacity="0.3"/>
                    <rect x="157" y="115" width="8" height="35" rx="2" fill="url(#researchGradient)" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Research Repo Cards Grid -->
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <!-- User Personas Card -->
            <router-link 
              to="/research/personas"
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
                User Personas
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Explore detailed user personas and archetypes that guide our design decisions.
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

            <!-- User Studies Card -->
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
                User Studies
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

