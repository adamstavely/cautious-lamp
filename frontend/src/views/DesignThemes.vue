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
                    Design Themes
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Actionable design themes that expand on our principles. These themes guide day-to-day design decisions and help teams create consistent, user-centered experiences.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="themesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized themes icon: layered elements -->
                      <rect x="40" y="40" width="120" height="20" rx="4" fill="url(#themesGradient)" opacity="0.3" transform="rotate(-5 100 50)"/>
                      <rect x="40" y="70" width="120" height="20" rx="4" fill="url(#themesGradient)" opacity="0.4" transform="rotate(2 100 80)"/>
                      <rect x="40" y="100" width="120" height="20" rx="4" fill="url(#themesGradient)" opacity="0.5" transform="rotate(-3 100 110)"/>
                      <rect x="40" y="130" width="120" height="20" rx="4" fill="url(#themesGradient)" opacity="0.4" transform="rotate(1 100 140)"/>
                      <circle cx="100" cy="100" r="8" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Introduction -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Design themes are specific, actionable guidelines that expand on our core principles. They provide concrete direction for design decisions, helping teams create experiences that are user-centric, accessible, consistent, and exceptional. Each theme connects to one or more of our design principles and offers practical guidance for implementation.
              </p>
            </div>
          </div>

          <!-- Design Themes -->
          <div class="max-w-7xl mx-auto space-y-12">
            <!-- Theme Category: User-Centric -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                User-Centric Themes
              </h2>
              <div class="space-y-6">
                <!-- Theme: Research-Driven Design -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Research-Driven Design
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Every design decision should be informed by user research, not assumptions. Conduct research early and often throughout the design process.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Conduct user interviews and usability testing before, during, and after design</li>
                      <li>Use quantitative data to validate qualitative insights</li>
                      <li>Document research findings and make them accessible to the team</li>
                      <li>Prioritize user needs over personal preferences or assumptions</li>
                    </ul>
                  </div>
                </div>

                <!-- Theme: Meet Users Where They Are -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Meet Users Where They Are
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design experiences that accommodate users' contexts, constraints, and environments—whether they're in an office, in the field, or working remotely.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Design for multiple devices and screen sizes</li>
                      <li>Consider network conditions and offline capabilities</li>
                      <li>Account for different work environments and contexts</li>
                      <li>Provide flexible workflows that adapt to user preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Category: Data-Informed -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Data-Informed Themes
              </h2>
              <div class="space-y-6">
                <!-- Theme: Transparent Decision-Making -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Transparent Decision-Making
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Acknowledge when designs don't work as expected and communicate the reasoning behind decisions to stakeholders and users.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Document design decisions and the data that informed them</li>
                      <li>Share learnings from failed experiments with the team</li>
                      <li>Be honest about limitations and trade-offs</li>
                      <li>Create feedback loops for continuous improvement</li>
                    </ul>
                  </div>
                </div>

                <!-- Theme: Continuous Iteration -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Continuous Iteration
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use qualitative and quantitative data to continuously improve designs. No design is ever "done"—it evolves based on user feedback and changing needs.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Set up analytics and monitoring from day one</li>
                      <li>Regularly review user feedback and usage patterns</li>
                      <li>Plan for iterative releases rather than big-bang launches</li>
                      <li>Use A/B testing and experimentation to validate improvements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Category: Design for All -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Design for All Themes
              </h2>
              <div class="space-y-6">
                <!-- Theme: Accessibility First -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Accessibility First
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Accessibility is not an afterthought—it's integrated into every stage of the design and development process, ensuring our capabilities work for everyone.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Test with assistive technologies throughout development</li>
                      <li>Ensure WCAG 2.1 AA compliance as a minimum standard</li>
                      <li>Design keyboard-accessible interfaces</li>
                      <li>Provide alternative text, captions, and transcripts</li>
                      <li>Use semantic HTML and ARIA attributes appropriately</li>
                    </ul>
                  </div>
                </div>

                <!-- Theme: Inclusive by Design -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Inclusive by Design
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design for the full spectrum of human diversity—different abilities, backgrounds, experiences, and contexts. Don't design for an "average" user that doesn't exist.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Include diverse users in research and testing</li>
                      <li>Consider cultural, linguistic, and regional differences</li>
                      <li>Design for various technical skill levels</li>
                      <li>Provide multiple ways to accomplish tasks</li>
                      <li>Use inclusive language and imagery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Category: Consistent Integrated -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Consistent Integrated Themes
              </h2>
              <div class="space-y-6">
                <!-- Theme: Cross-Organizational Collaboration -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Cross-Organizational Collaboration
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Work across organizational boundaries to ensure capabilities work together seamlessly. Engage mission partners to leverage their domain expertise.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Establish shared design patterns and components</li>
                      <li>Create clear APIs and integration points</li>
                      <li>Document integration requirements and guidelines</li>
                      <li>Regularly sync with partner teams on design decisions</li>
                    </ul>
                  </div>
                </div>

                <!-- Theme: Living Products -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Living Products
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design flexible, enduring systems that can adapt to shifting mission priorities, security requirements, and user needs without requiring complete redesigns.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Build modular, composable components</li>
                      <li>Design for extensibility and customization</li>
                      <li>Plan for versioning and migration paths</li>
                      <li>Create flexible layouts that adapt to content</li>
                      <li>Document deprecation policies and upgrade paths</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Category: Raise Expectations -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Raise Expectations Themes
              </h2>
              <div class="space-y-6">
                <!-- Theme: Exceptional Experiences -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Exceptional Experiences
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Well-designed products can transform how people perceive Enterprise IT. Every interaction should feel polished, thoughtful, and delightful—not just functional.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Pay attention to micro-interactions and transitions</li>
                      <li>Use thoughtful animations that enhance understanding</li>
                      <li>Provide clear, helpful feedback for all user actions</li>
                      <li>Design for emotional connection, not just efficiency</li>
                      <li>Polish details that show care and attention</li>
                    </ul>
                  </div>
                </div>

                <!-- Theme: Setting the Standard -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Setting the Standard
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    As a service provider, we have a responsibility to set the standard for digital capabilities and train mission partners on design best practices.
                  </p>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Practices:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Document and share design patterns and best practices</li>
                      <li>Provide training and resources for mission partners</li>
                      <li>Create reusable components and templates</li>
                      <li>Establish design review processes and guidelines</li>
                      <li>Lead by example in all design work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Link back to Design Principles -->
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
                    Built on Design Principles
                  </h3>
                  <p class="text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    These themes expand on our core design principles. Review the principles that guide all our design decisions.
                  </p>
                </div>
                <router-link
                  to="/getting-started/principles"
                  class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                >
                  View Design Principles →
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

