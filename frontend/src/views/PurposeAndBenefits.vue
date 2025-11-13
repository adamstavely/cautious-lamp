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
                    Purpose and Benefits
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Discover the core purpose of our design system and the tangible benefits it brings to your team, products, and users.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="purposeBenefitsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Target/bullseye icon representing purpose -->
                      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#purposeBenefitsGradient)" stroke-width="3" opacity="0.3"/>
                      <circle cx="100" cy="100" r="40" fill="none" stroke="url(#purposeBenefitsGradient)" stroke-width="3" opacity="0.5"/>
                      <circle cx="100" cy="100" r="20" fill="url(#purposeBenefitsGradient)" opacity="0.6"/>
                      <!-- Benefit indicators -->
                      <circle cx="100" cy="40" r="8" fill="url(#purposeBenefitsGradient)" opacity="0.7"/>
                      <circle cx="160" cy="100" r="8" fill="url(#purposeBenefitsGradient)" opacity="0.7"/>
                      <circle cx="100" cy="160" r="8" fill="url(#purposeBenefitsGradient)" opacity="0.7"/>
                      <circle cx="40" cy="100" r="8" fill="url(#purposeBenefitsGradient)" opacity="0.7"/>
                      <!-- Connecting lines -->
                      <line x1="100" y1="48" x2="100" y2="80" stroke="url(#purposeBenefitsGradient)" stroke-width="2" opacity="0.4"/>
                      <line x1="152" y1="100" x2="120" y2="100" stroke="url(#purposeBenefitsGradient)" stroke-width="2" opacity="0.4"/>
                      <line x1="100" y1="152" x2="100" y2="120" stroke="url(#purposeBenefitsGradient)" stroke-width="2" opacity="0.4"/>
                      <line x1="48" y1="100" x2="80" y2="100" stroke="url(#purposeBenefitsGradient)" stroke-width="2" opacity="0.4"/>
                      <circle cx="100" cy="100" r="6" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Purpose Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-3xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Our Purpose
              </h2>
              <div class="prose max-w-none" :class="isDarkMode ? 'prose-invert' : ''">
                <p class="text-lg leading-relaxed mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  The design system exists to empower teams to build exceptional digital experiences that serve our users effectively. We provide a comprehensive foundation of components, patterns, and guidelines that enable consistency, quality, and innovation at scale.
                </p>
                <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Our purpose is to eliminate redundant work, reduce decision fatigue, and ensure that every product we build meets our high standards for accessibility, usability, and design excellence. By centralizing our design language, we create a shared understanding that bridges design and engineering, enabling faster iteration and better outcomes.
                </p>
              </div>
            </div>
          </div>

          <!-- Benefits Grid -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Key Benefits
            </h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Benefit 1: Efficiency -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">bolt</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Increased Efficiency
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Reduce development time by up to 50% with pre-built, tested components. Teams can focus on solving unique problems instead of rebuilding common patterns.
                </p>
              </div>

              <!-- Benefit 2: Consistency -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">tune</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Design Consistency
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Ensure visual and functional consistency across all products and platforms, creating a cohesive user experience that builds trust and reduces cognitive load.
                </p>
              </div>

              <!-- Benefit 3: Quality -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">verified</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Built-in Quality
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Every component includes accessibility features, performance optimizations, and best practices, ensuring quality from the start.
                </p>
              </div>

              <!-- Benefit 4: Collaboration -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">handshake</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Better Collaboration
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Create a shared language between design and engineering teams, reducing miscommunication and enabling faster iteration cycles.
                </p>
              </div>

              <!-- Benefit 5: Scalability -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">trending_up</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Scalability
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Scale your design and development efforts efficiently as your organization grows, with components and patterns that work across teams and products.
                </p>
              </div>

              <!-- Benefit 6: Cost Savings -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">savings</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Cost Savings
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Reduce maintenance costs and technical debt by centralizing design decisions and component updates in one place.
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
                  Ready to Experience the Benefits?
                </h2>
                <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Start using the design system today and see how it transforms your development workflow.
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <router-link
                    to="/getting-started/quick-start"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Get Started
                  </router-link>
                  <router-link
                    to="/getting-started/adopt"
                    class="px-6 py-3 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Learn About Adoption
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

