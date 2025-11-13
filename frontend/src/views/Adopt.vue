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
          <div class="max-w-7xl mx-auto mb-12">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Adopt
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Learn how to successfully adopt the design system in your organization. Follow our proven approach to implementation and adoption.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="adoptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Growth/adoption tree icon -->
                      <path d="M100 180 L100 120 M100 120 L60 80 M100 120 L140 80 M60 80 L40 50 M60 80 L80 50 M140 80 L120 50 M140 80 L160 50" 
                            stroke="url(#adoptGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                      <!-- Growth nodes -->
                      <circle cx="100" cy="120" r="12" fill="url(#adoptGradient)" opacity="0.7"/>
                      <circle cx="60" cy="80" r="10" fill="url(#adoptGradient)" opacity="0.6"/>
                      <circle cx="140" cy="80" r="10" fill="url(#adoptGradient)" opacity="0.6"/>
                      <circle cx="40" cy="50" r="8" fill="url(#adoptGradient)" opacity="0.5"/>
                      <circle cx="80" cy="50" r="8" fill="url(#adoptGradient)" opacity="0.5"/>
                      <circle cx="120" cy="50" r="8" fill="url(#adoptGradient)" opacity="0.5"/>
                      <circle cx="160" cy="50" r="8" fill="url(#adoptGradient)" opacity="0.5"/>
                      <!-- Base/ground -->
                      <rect x="80" y="180" width="40" height="20" rx="4" fill="url(#adoptGradient)" opacity="0.4"/>
                      <!-- Progress indicators -->
                      <circle cx="100" cy="30" r="6" fill="url(#adoptGradient)" opacity="0.8"/>
                      <circle cx="100" cy="30" r="12" fill="none" stroke="url(#adoptGradient)" stroke-width="2" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Adoption Overview Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-3xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Adoption Overview
              </h2>
              <div class="prose max-w-none" :class="isDarkMode ? 'prose-invert' : ''">
                <p class="text-lg leading-relaxed mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Successfully adopting a design system requires careful planning, clear communication, and a phased approach. Whether you're starting fresh or migrating from existing patterns, this guide will help you navigate the adoption process effectively.
                </p>
                <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Our adoption strategy is designed to minimize disruption while maximizing value. We recommend starting small, demonstrating value, and gradually expanding usage across teams and products.
                </p>
              </div>
            </div>
          </div>

          <!-- Adoption Phases -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Adoption Phases
            </h2>
            <div class="space-y-6">
              <!-- Phase 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">1</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Discovery and Planning
                    </h3>
                    <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Understand your current state, identify opportunities, and create an adoption roadmap tailored to your organization.
                    </p>
                    <ul class="list-disc list-inside space-y-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Audit existing components and patterns</li>
                      <li>Identify key stakeholders and champions</li>
                      <li>Define success metrics and goals</li>
                      <li>Create a phased rollout plan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Phase 2 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">2</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Pilot Program
                    </h3>
                    <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Start with a small pilot project to validate the approach, gather feedback, and demonstrate value.
                    </p>
                    <ul class="list-disc list-inside space-y-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Select a pilot team or project</li>
                      <li>Set up development environment</li>
                      <li>Build initial components or features</li>
                      <li>Collect feedback and measure impact</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Phase 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">3</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Team Expansion
                    </h3>
                    <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Expand adoption to additional teams, providing training and support as you scale.
                    </p>
                    <ul class="list-disc list-inside space-y-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Conduct training sessions</li>
                      <li>Establish design system governance</li>
                      <li>Create internal documentation</li>
                      <li>Set up support channels</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Phase 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">4</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Organization-Wide Adoption
                    </h3>
                    <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Scale adoption across the entire organization, establishing the design system as the standard.
                    </p>
                    <ul class="list-disc list-inside space-y-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Migrate existing products</li>
                      <li>Establish design system as default</li>
                      <li>Create ongoing maintenance processes</li>
                      <li>Measure and optimize adoption metrics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Practices -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Adoption Best Practices
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Practice 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">groups</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Build Champions
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Identify and empower design system champions across teams who can advocate for adoption and help others get started.
                </p>
              </div>

              <!-- Practice 2 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">school</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Provide Training
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Offer comprehensive training sessions, workshops, and documentation to help teams understand and use the design system effectively.
                </p>
              </div>

              <!-- Practice 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">feedback</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Gather Feedback
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Continuously collect feedback from teams using the design system and iterate based on their needs and experiences.
                </p>
              </div>

              <!-- Practice 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">analytics</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Measure Success
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Track adoption metrics, usage patterns, and impact to demonstrate value and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="text-center">
                <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Ready to Start Adopting?
                </h2>
                <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Begin your adoption journey today with our comprehensive guides and resources.
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <router-link
                    to="/getting-started/quick-start"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Start Quick Start Guide
                  </router-link>
                  <router-link
                    to="/getting-started/get-in-touch"
                    class="px-6 py-3 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Get Adoption Support
                  </router-link>
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
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
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

