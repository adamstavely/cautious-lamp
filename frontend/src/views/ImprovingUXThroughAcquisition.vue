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
                    Improving UX Through Acquisition
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Learn how strategic design system adoption and user acquisition strategies work together to create exceptional user experiences that drive engagement and growth.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg 
                      viewBox="0 0 200 200" 
                      class="w-full h-full" 
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg"
                      width="256"
                      height="256"
                    >
                      <defs>
                        <linearGradient id="uxAcquisitionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="uxAcquisitionGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:0.8" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.4" />
                        </linearGradient>
                        <marker 
                          id="arrowhead" 
                          markerWidth="10" 
                          markerHeight="10" 
                          refX="9" 
                          refY="3" 
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="url(#uxAcquisitionGradient)" opacity="0.7"/>
                        </marker>
                      </defs>
                      
                      <!-- Background circle representing user base -->
                      <circle cx="100" cy="100" r="75" fill="url(#uxAcquisitionGradient2)" opacity="0.2"/>
                      
                      <!-- Central hub representing design system -->
                      <circle cx="100" cy="100" r="20" fill="url(#uxAcquisitionGradient)" opacity="0.9"/>
                      <circle cx="100" cy="100" r="12" fill="white" opacity="0.9"/>
                      
                      <!-- User acquisition flow - arrows pointing inward -->
                      <path 
                        d="M 30 50 L 85 85" 
                        stroke="url(#uxAcquisitionGradient)" 
                        stroke-width="3" 
                        fill="none" 
                        opacity="0.7"
                        stroke-linecap="round"
                        marker-end="url(#arrowhead)"
                      />
                      <path 
                        d="M 170 50 L 115 85" 
                        stroke="url(#uxAcquisitionGradient)" 
                        stroke-width="3" 
                        fill="none" 
                        opacity="0.7"
                        stroke-linecap="round"
                        marker-end="url(#arrowhead)"
                      />
                      <path 
                        d="M 30 150 L 85 115" 
                        stroke="url(#uxAcquisitionGradient)" 
                        stroke-width="3" 
                        fill="none" 
                        opacity="0.7"
                        stroke-linecap="round"
                        marker-end="url(#arrowhead)"
                      />
                      <path 
                        d="M 170 150 L 115 115" 
                        stroke="url(#uxAcquisitionGradient)" 
                        stroke-width="3" 
                        fill="none" 
                        opacity="0.7"
                        stroke-linecap="round"
                        marker-end="url(#arrowhead)"
                      />
                      
                      <!-- User nodes at entry points -->
                      <circle cx="30" cy="50" r="10" fill="url(#uxAcquisitionGradient)" opacity="0.8"/>
                      <circle cx="170" cy="50" r="10" fill="url(#uxAcquisitionGradient)" opacity="0.8"/>
                      <circle cx="30" cy="150" r="10" fill="url(#uxAcquisitionGradient)" opacity="0.8"/>
                      <circle cx="170" cy="150" r="10" fill="url(#uxAcquisitionGradient)" opacity="0.8"/>
                      
                      <!-- Growth/engagement indicators - small circles along paths -->
                      <circle cx="57" cy="67" r="4" fill="url(#uxAcquisitionGradient)" opacity="0.6"/>
                      <circle cx="143" cy="67" r="4" fill="url(#uxAcquisitionGradient)" opacity="0.6"/>
                      <circle cx="57" cy="133" r="4" fill="url(#uxAcquisitionGradient)" opacity="0.6"/>
                      <circle cx="143" cy="133" r="4" fill="url(#uxAcquisitionGradient)" opacity="0.6"/>
                      
                      <!-- Growth arrow pointing upward -->
                      <path 
                        d="M 100 30 L 100 15 M 95 20 L 100 15 L 105 20" 
                        stroke="url(#uxAcquisitionGradient)" 
                        stroke-width="2.5" 
                        fill="none" 
                        opacity="0.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      
                      <!-- Success indicators - checkmarks -->
                      <path 
                        d="M 88 100 L 95 107 L 112 90" 
                        stroke="white" 
                        stroke-width="2.5" 
                        fill="none" 
                        opacity="0.9"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-3xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                The Connection Between UX and Acquisition
              </h2>
              <div class="prose max-w-none" :class="isDarkMode ? 'prose-invert' : ''">
                <p class="text-lg leading-relaxed mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  User experience and user acquisition are deeply interconnected. A well-designed, consistent experience not only improves user satisfaction but also drives acquisition through word-of-mouth, reduced friction, and increased engagement. By adopting a design system, you create a foundation for exceptional UX that naturally supports acquisition goals.
                </p>
                <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  When users have positive experiences with your products, they're more likely to return, recommend your services, and become advocates. A design system ensures that every touchpoint delivers on this promise, creating a cohesive experience that builds trust and drives growth.
                </p>
              </div>
            </div>
          </div>

          <!-- Key Strategies -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Key Strategies
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Strategy 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">first_page</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Optimize First Impressions
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Use design system components to create polished, professional first experiences that immediately communicate quality and build trust with new users.
                </p>
              </div>

              <!-- Strategy 2 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">speed</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Reduce Friction
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Streamline user flows with consistent, well-tested components that reduce cognitive load and eliminate unnecessary steps in the acquisition process.
                </p>
              </div>

              <!-- Strategy 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">devices</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Ensure Cross-Platform Consistency
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Deliver consistent experiences across all platforms and devices, ensuring users have a seamless experience regardless of how they access your products.
                </p>
              </div>

              <!-- Strategy 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">psychology</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Build Trust Through Quality
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  High-quality, accessible components demonstrate attention to detail and care for users, building trust that encourages engagement and referrals.
                </p>
              </div>

              <!-- Strategy 5 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">insights</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Enable Rapid Iteration
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Use design system components to quickly test and optimize acquisition flows, allowing you to iterate based on user data and feedback.
                </p>
              </div>

              <!-- Strategy 6 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">share</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Encourage Sharing
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Create delightful experiences that users want to share, leveraging design system components to build shareable moments and features.
                </p>
              </div>
            </div>
          </div>

          <!-- Implementation Tips -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Implementation Tips
            </h2>
            <div class="space-y-6">
              <!-- Tip 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">track_changes</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Focus on Conversion Points
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Prioritize design system adoption for key conversion points in your user journey—landing pages, sign-up flows, onboarding experiences, and core product interactions. These are the moments that make or break acquisition.
                  </p>
                </div>
              </div>

              <!-- Tip 2 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">analytics</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Measure and Optimize
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Track acquisition metrics alongside UX metrics to understand how design system improvements impact user acquisition. Use A/B testing to validate improvements and iterate based on data.
                  </p>
                </div>
              </div>

              <!-- Tip 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">accessibility</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Prioritize Accessibility
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Accessible design expands your potential user base and improves SEO, both of which directly support acquisition goals. Design system components with built-in accessibility ensure you're not excluding potential users.
                  </p>
                </div>
              </div>

              <!-- Tip 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">auto_awesome</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Create Delightful Moments
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use design system components to create moments of delight throughout the user journey. Small, thoughtful interactions and polished details can significantly impact user perception and willingness to engage.
                  </p>
                </div>
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
                  Start Improving UX and Acquisition Today
                </h2>
                <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Begin using the design system to create experiences that both delight users and drive acquisition.
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <router-link
                    to="/getting-started/adopt"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Learn About Adoption
                  </router-link>
                  <router-link
                    to="/components"
                    class="px-6 py-3 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Explore Components
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

