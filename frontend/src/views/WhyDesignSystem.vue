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
                    Why a Design System?
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    A design system is more than a collection of components—it's a shared language that enables teams to build better products faster, while ensuring consistency and quality at scale.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="whySystemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized system/network icon -->
                      <circle cx="100" cy="100" r="50" fill="url(#whySystemGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="35" fill="url(#whySystemGradient)" opacity="0.3"/>
                      <circle cx="100" cy="100" r="20" fill="url(#whySystemGradient)" opacity="0.4"/>
                      <!-- Connected nodes -->
                      <circle cx="50" cy="50" r="12" fill="url(#whySystemGradient)" opacity="0.5"/>
                      <circle cx="150" cy="50" r="12" fill="url(#whySystemGradient)" opacity="0.5"/>
                      <circle cx="50" cy="150" r="12" fill="url(#whySystemGradient)" opacity="0.5"/>
                      <circle cx="150" cy="150" r="12" fill="url(#whySystemGradient)" opacity="0.5"/>
                      <!-- Connecting lines -->
                      <line x1="62" y1="62" x2="85" y2="85" stroke="url(#whySystemGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="138" y1="62" x2="115" y2="85" stroke="url(#whySystemGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="62" y1="138" x2="85" y2="115" stroke="url(#whySystemGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="138" y1="138" x2="115" y2="115" stroke="url(#whySystemGradient)" stroke-width="2" opacity="0.3"/>
                      <circle cx="100" cy="100" r="8" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Philosophy Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-3xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Our Philosophy
              </h2>
              <div class="prose max-w-none" :class="isDarkMode ? 'prose-invert' : ''">
                <p class="text-lg leading-relaxed mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  A design system is a living, breathing foundation that empowers teams to create extraordinary digital experiences. It's not just about consistency—it's about enabling innovation, reducing friction, and ensuring that every interaction we build serves our users and mission effectively.
                </p>
                <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  We believe that great design systems don't constrain creativity—they amplify it. By providing a shared vocabulary, reusable components, and clear guidelines, we free teams to focus on solving real problems rather than reinventing the wheel. This system is built for scale, designed for collaboration, and committed to accessibility and excellence.
                </p>
              </div>
            </div>
          </div>

          <!-- Benefits Grid -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              The Value of a Design System
            </h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Benefit 1: Speed -->
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
                  Build Faster
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Pre-built components and patterns mean less time spent on repetitive tasks. Teams can ship features faster while maintaining quality and consistency.
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
                  <span class="material-symbols-outlined text-5xl">view_module</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Ensure Consistency
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Shared components and design tokens create a unified experience across all products and platforms, building trust and reducing cognitive load for users.
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
                  Maintain Quality
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Built-in accessibility, performance optimizations, and best practices ensure that every component meets our high standards from day one.
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
                  <span class="material-symbols-outlined text-5xl">groups</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Enable Collaboration
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  A shared language and common components break down silos between design and engineering, enabling seamless collaboration and faster iteration.
                </p>
              </div>

              <!-- Benefit 5: Scale -->
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
                  Scale with Confidence
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  As your organization grows, the design system scales with you. New teams can onboard quickly, and existing teams can maintain consistency across expanding product portfolios.
                </p>
              </div>

              <!-- Benefit 6: Innovation -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">lightbulb</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Focus on Innovation
                </h3>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  By handling the fundamentals, the design system frees teams to focus on solving unique problems and creating innovative solutions that matter.
                </p>
              </div>
            </div>
          </div>

          <!-- Key Principles Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              What Makes This System Different
            </h2>
            <div class="space-y-6">
              <!-- Principle 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">person</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    User-Centric by Design
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Every component, pattern, and guideline is informed by real user research and testing. We don't design in a vacuum—we design with and for our users, ensuring that every element serves a real need and solves a real problem.
                  </p>
                </div>
              </div>

              <!-- Principle 2 -->
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
                    Accessibility Built-In
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Accessibility isn't an afterthought—it's foundational. Every component meets WCAG 2.1 AA standards, ensuring that our capabilities work for everyone, regardless of ability or context.
                  </p>
                </div>
              </div>

              <!-- Principle 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">autorenew</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Living and Evolving
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    This system is not static. It evolves based on user feedback, changing needs, and new technologies. We continuously iterate, improve, and expand the system to serve our mission better.
                  </p>
                </div>
              </div>

              <!-- Principle 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6 flex gap-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex-shrink-0">
                  <div class="w-12 h-12" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">flag</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Mission-Aligned
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    The user experience of our capabilities directly impacts the success of mission. This system is designed to support that mission by enabling teams to build exceptional experiences that serve users effectively, regardless of geographic location or context.
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
                  Ready to Get Started?
                </h2>
                <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Explore our design principles, components, and patterns to begin building with the design system.
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <router-link
                    to="/getting-started/principles"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    View Design Principles
                  </router-link>
                  <router-link
                    to="/components"
                    class="px-6 py-3 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Browse Components
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

