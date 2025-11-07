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
                    Design Principles
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    The core principles that guide our design decisions and ensure we create extraordinary experiences for all users.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="principlesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized principles icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#principlesGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="45" fill="url(#principlesGradient)" opacity="0.3"/>
                      <circle cx="100" cy="100" r="30" fill="url(#principlesGradient)" opacity="0.4"/>
                      <circle cx="100" cy="100" r="15" fill="white" opacity="0.8"/>
                      <!-- Five principle indicators -->
                      <circle cx="100" cy="40" r="8" fill="url(#principlesGradient)" opacity="0.6"/>
                      <circle cx="160" cy="80" r="8" fill="url(#principlesGradient)" opacity="0.5"/>
                      <circle cx="160" cy="120" r="8" fill="url(#principlesGradient)" opacity="0.5"/>
                      <circle cx="100" cy="160" r="8" fill="url(#principlesGradient)" opacity="0.6"/>
                      <circle cx="40" cy="100" r="8" fill="url(#principlesGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mission Statement -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <p class="text-xl md:text-2xl font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                The User Experience of Our Capabilities Directly Impacts the Success of Mission
              </p>
            </div>
          </div>

          <!-- Design Principles -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- Principle 1: User-Centric -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row gap-8">
                <div class="flex-shrink-0">
                  <div class="w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="userCentricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- User-centric icon: person with listening/communication waves -->
                      <circle cx="100" cy="80" r="25" fill="url(#userCentricGradient)" opacity="0.4"/>
                      <path d="M 50 140 Q 50 120 70 120 L 130 120 Q 150 120 150 140 L 150 180 L 50 180 Z" fill="url(#userCentricGradient)" opacity="0.5"/>
                      <!-- Communication/listening waves -->
                      <path d="M 30 80 Q 20 80 20 70 Q 20 60 30 60" stroke="url(#userCentricGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                      <path d="M 170 80 Q 180 80 180 70 Q 180 60 170 60" stroke="url(#userCentricGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                      <circle cx="100" cy="100" r="3" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    A User-Centric Organization
                  </h2>
                  <div class="space-y-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <p class="text-lg font-semibold mb-2">What this means:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                      <li>Our users are the experts; we listen to, conduct research with, collaborate, and explore their needs, pain points, and goals - early and often</li>
                      <li>We are driven to meet users and mission where they are; providing extraordinary experiences regardless of geographic location</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Principle 2: Data-Informed -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row gap-8">
                <div class="flex-shrink-0">
                  <div class="w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="dataInformedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Data-informed icon: chart/graph with data points -->
                      <rect x="40" y="160" width="120" height="20" rx="4" fill="url(#dataInformedGradient)" opacity="0.3"/>
                      <!-- Bar chart representation -->
                      <rect x="50" y="120" width="20" height="60" rx="2" fill="url(#dataInformedGradient)" opacity="0.5"/>
                      <rect x="80" y="100" width="20" height="80" rx="2" fill="url(#dataInformedGradient)" opacity="0.6"/>
                      <rect x="110" y="80" width="20" height="100" rx="2" fill="url(#dataInformedGradient)" opacity="0.7"/>
                      <rect x="140" y="90" width="20" height="90" rx="2" fill="url(#dataInformedGradient)" opacity="0.6"/>
                      <!-- Data points -->
                      <circle cx="60" cy="120" r="4" fill="white" opacity="0.8"/>
                      <circle cx="90" cy="100" r="4" fill="white" opacity="0.8"/>
                      <circle cx="120" cy="80" r="4" fill="white" opacity="0.8"/>
                      <circle cx="150" cy="90" r="4" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Utilize Data-Informed Design Processes
                  </h2>
                  <div class="space-y-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <p class="text-lg font-semibold mb-2">What this means:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                      <li>Our design decisions are directly informed by user feedback; acknowledging design mistakes and transparently communicating decisions with stakeholders</li>
                      <li>We leverage industry-leading qualitative and quantitative mechanisms to gain user insights; continuously iterating based on feedback and results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Principle 3: Design for All -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row gap-8">
                <div class="flex-shrink-0">
                  <div class="w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="designForAllGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Design for all icon: diverse group of people -->
                      <circle cx="60" cy="70" r="20" fill="url(#designForAllGradient)" opacity="0.4"/>
                      <circle cx="100" cy="70" r="20" fill="url(#designForAllGradient)" opacity="0.5"/>
                      <circle cx="140" cy="70" r="20" fill="url(#designForAllGradient)" opacity="0.4"/>
                      <path d="M 40 140 Q 40 120 50 120 L 70 120 Q 80 120 80 140 L 80 180 L 40 180 Z" fill="url(#designForAllGradient)" opacity="0.5"/>
                      <path d="M 80 140 Q 80 120 90 120 L 110 120 Q 120 120 120 140 L 120 180 L 80 180 Z" fill="url(#designForAllGradient)" opacity="0.6"/>
                      <path d="M 120 140 Q 120 120 130 120 L 150 120 Q 160 120 160 140 L 160 180 L 120 180 Z" fill="url(#designForAllGradient)" opacity="0.5"/>
                      <!-- Accessibility symbol -->
                      <circle cx="100" cy="100" r="30" fill="none" stroke="url(#designForAllGradient)" stroke-width="2" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Design For All People & Abilities
                  </h2>
                  <div class="space-y-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <p class="text-lg font-semibold mb-2">What this means:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                      <li>Accessibility is foundational to the development process; integrated from the beginning ensuring our capabilities work for everyone</li>
                      <li>We understand our users come from a wide variety of experiences and demographics; we don't just build for the "average" user</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Principle 4: Consistent Integrated -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row gap-8">
                <div class="flex-shrink-0">
                  <div class="w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="consistentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Consistent integrated icon: connected nodes/network -->
                      <circle cx="50" cy="50" r="15" fill="url(#consistentGradient)" opacity="0.4"/>
                      <circle cx="150" cy="50" r="15" fill="url(#consistentGradient)" opacity="0.4"/>
                      <circle cx="50" cy="150" r="15" fill="url(#consistentGradient)" opacity="0.4"/>
                      <circle cx="150" cy="150" r="15" fill="url(#consistentGradient)" opacity="0.4"/>
                      <circle cx="100" cy="100" r="20" fill="url(#consistentGradient)" opacity="0.5"/>
                      <!-- Connecting lines -->
                      <line x1="65" y1="50" x2="85" y2="85" stroke="url(#consistentGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="135" y1="50" x2="115" y2="85" stroke="url(#consistentGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="65" y1="150" x2="85" y2="115" stroke="url(#consistentGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="135" y1="150" x2="115" y2="115" stroke="url(#consistentGradient)" stroke-width="2" opacity="0.3"/>
                      <circle cx="100" cy="100" r="5" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Create Consistent Integrated Experiences
                  </h2>
                  <div class="space-y-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <p class="text-lg font-semibold mb-2">What this means:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                      <li>We intentionally work across organizational bounds to ensure our capabilities work together; engaging mission partners to provide expertise in their fields</li>
                      <li>Our capabilities are living products - flexible and enduring; accounting for shifting mission priorities, security requirements, and user need</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Principle 5: Raise Expectations -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row gap-8">
                <div class="flex-shrink-0">
                  <div class="w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="raiseExpectationsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Raise expectations icon: upward arrow/trend with star -->
                      <path d="M 50 150 L 100 50 L 150 150" stroke="url(#raiseExpectationsGradient)" stroke-width="4" fill="none" opacity="0.6"/>
                      <path d="M 70 120 L 100 80 L 130 120" stroke="url(#raiseExpectationsGradient)" stroke-width="3" fill="none" opacity="0.5"/>
                      <!-- Star at top -->
                      <path d="M 100 30 L 105 45 L 120 45 L 108 55 L 113 70 L 100 60 L 87 70 L 92 55 L 80 45 L 95 45 Z" fill="url(#raiseExpectationsGradient)" opacity="0.7"/>
                      <!-- Small stars -->
                      <circle cx="60" cy="130" r="3" fill="url(#raiseExpectationsGradient)" opacity="0.5"/>
                      <circle cx="140" cy="130" r="3" fill="url(#raiseExpectationsGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Raise The Expectation For Digital Capabilities
                  </h2>
                  <div class="space-y-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <p class="text-lg font-semibold mb-2">What this means:</p>
                    <ul class="list-disc list-inside space-y-2 ml-4">
                      <li>We understand that people's experiences with well-designed products can change their perception of engaging with Enterprise IT service providers</li>
                      <li>Our role as a service provider implores us to set the standard and train mission partners on best-practices for designing capabilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Link to Design Themes -->
          <div class="max-w-7xl mx-auto mt-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="flex-1">
                  <h3 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Explore Design Themes
                  </h3>
                  <p class="text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Dive deeper into actionable design themes that expand on these principles and guide day-to-day design decisions.
                  </p>
                </div>
                <router-link
                  to="/getting-started/themes"
                  class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                >
                  View Design Themes →
                </router-link>
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

