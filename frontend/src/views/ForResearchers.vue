<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <div class="mb-4">
                  <router-link 
                    to="/" 
                    class="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm mb-4"
                  >
                    <span class="material-symbols-outlined mr-2 text-lg">arrow_back</span>
                    Back to Home
                  </router-link>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Tools for Researchers
                  <span class="block text-indigo-400 mt-2 text-3xl md:text-4xl">Research, HCD, and user insights</span>
                </h1>
                <p class="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">
                  Comprehensive research tools, HCD methodologies, and user insights to inform design decisions and improve user experiences.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="researcherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Research-focused illustration -->
                    <circle cx="100" cy="100" r="60" fill="url(#researcherGradient)" opacity="0.3"/>
                    <circle cx="80" cy="80" r="20" fill="url(#researcherGradient)" opacity="0.4"/>
                    <circle cx="120" cy="80" r="20" fill="url(#researcherGradient)" opacity="0.4"/>
                    <circle cx="100" cy="120" r="25" fill="url(#researcherGradient)" opacity="0.5"/>
                    <line x1="80" y1="80" x2="100" y2="120" stroke="url(#researcherGradient)" stroke-width="3" opacity="0.6"/>
                    <line x1="120" y1="80" x2="100" y2="120" stroke="url(#researcherGradient)" stroke-width="3" opacity="0.6"/>
                    <circle cx="100" cy="100" r="8" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Tools Grid -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Research Repository
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Research Repository -->
            <router-link 
              to="/research" 
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
                Research Repository
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Centralized repository for all research artifacts and findings.
              </p>
            </router-link>

            <!-- User Personas -->
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
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create structured user personas from research data.
              </p>
            </router-link>

            <!-- Journey Maps -->
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
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Visualize user journeys and identify pain points.
              </p>
            </router-link>

            <!-- HCD Reports -->
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
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Usability, accessibility, and heuristic evaluation reports.
              </p>
            </router-link>

            <!-- User Studies -->
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
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Manage and organize user research studies.
              </p>
            </router-link>

            <!-- Insights & Findings -->
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
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                User needs, pain points, opportunities, and findings.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            UX Research Tools
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- NASA-TLX -->
            <router-link 
              to="/tools/nasa-tlx" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">psychology</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                NASA-TLX
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Task Load Index for measuring mental workload.
              </p>
            </router-link>

            <!-- System Usability Scale -->
            <router-link 
              to="/tools/sus" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">psychology</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                System Usability Scale
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Quick and reliable usability assessment tool.
              </p>
            </router-link>

            <!-- Heuristic Evaluation -->
            <router-link 
              to="/tools/heuristic-evaluation" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">checklist</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Heuristic Evaluation
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Evaluate interfaces against usability heuristics.
              </p>
            </router-link>

            <!-- Session Replay -->
            <router-link 
              to="/hcd/session-replay" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">videocam</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Session Replay
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Record and replay user sessions with heatmaps.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Accessibility & Analysis
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Accessibility -->
            <router-link 
              to="/hcd/accessibility" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">accessibility</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Accessibility
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Accessibility guidelines and evaluation tools.
              </p>
            </router-link>

            <!-- Photosensitivity Analysis -->
            <router-link 
              to="/tools/photosensitivity" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">visibility</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Photosensitivity Analysis
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Analyze video content for photosensitive epilepsy risks.
              </p>
            </router-link>

            <!-- HCD Principles -->
            <router-link 
              to="/hcd/principles" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">lightbulb</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                HCD Principles
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Human-centered design principles and methodologies.
              </p>
            </router-link>

            <!-- Laws of UX -->
            <router-link 
              to="/hcd/laws-of-ux" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">gavel</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Laws of UX
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Essential UX principles and psychological laws.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Workflows Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Workflows
          </h2>
          
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Create User Personas -->
            <router-link 
              to="/research/user-personas" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">person</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Create User Personas
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate structured user personas from research data to inform design decisions.
              </p>
            </router-link>

            <!-- Conduct Usability Testing -->
            <router-link 
              to="/tools/sus" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">psychology</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Conduct Usability Testing
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Use NASA-TLX, SUS, and heuristic evaluation to assess usability and user experience.
              </p>
            </router-link>

            <!-- Analyze User Sessions -->
            <router-link 
              to="/hcd/session-replay" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">videocam</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Analyze User Sessions
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Record and analyze user sessions with replay and heatmap tools to understand user behavior.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Getting Started Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Getting Started
            </h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl">
              New to research and HCD? Start here with our researcher-focused guides and methodologies.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <router-link 
                to="/research" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  Research Repository Guide
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Learn how to organize and manage research artifacts.
                </p>
              </router-link>
              <router-link 
                to="/hcd/principles" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  HCD Principles
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Understand human-centered design principles and methodologies.
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
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

