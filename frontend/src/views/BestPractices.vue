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
                    Best Practices
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Recommended practices for using the design system effectively. Follow these guidelines to ensure consistency, accessibility, and maintainability.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="bestPracticesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized checkmark/best practices icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#bestPracticesGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="45" fill="url(#bestPracticesGradient)" opacity="0.3"/>
                      <path d="M 70 100 L 90 120 L 130 70" stroke="url(#bestPracticesGradient)" stroke-width="6" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Practices Content -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- Use Design Tokens -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Use Design Tokens
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Always use design tokens instead of hardcoded values. This ensures consistency and makes it easier to update the design system globally.
              </p>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">❌ Don't:</p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-red-700 text-gray-100' 
                      : 'bg-red-50 border border-red-200 text-gray-900'"
                  >
                    <div>color: #6366f1;</div>
                    <div>padding: 16px;</div>
                    <div>font-size: 14px;</div>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">✅ Do:</p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-green-700 text-gray-100' 
                      : 'bg-green-50 border border-green-200 text-gray-900'"
                  >
                    <div>color: tokens.color.indigo.600;</div>
                    <div>padding: tokens.spacing.4;</div>
                    <div>font-size: tokens.typography.size.sm;</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Use Components -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Use Existing Components
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Before building custom components, check if the design system already provides what you need. Customize components using props and variants rather than creating new ones.
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Browse the component library first</li>
                <li>Use component variants and props for customization</li>
                <li>Compose existing components to create new patterns</li>
                <li>Propose new components if there's a clear gap</li>
              </ul>
            </div>

            <!-- Accessibility -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Prioritize Accessibility
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                All components are built with accessibility in mind, but you must use them correctly. Follow these guidelines:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Always provide labels for form inputs</li>
                <li>Use semantic HTML elements</li>
                <li>Ensure keyboard navigation works</li>
                <li>Maintain proper color contrast ratios</li>
                <li>Test with screen readers</li>
                <li>Provide alternative text for images</li>
              </ul>
            </div>

            <!-- Performance -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Optimize for Performance
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Keep your applications fast and efficient:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Import only the components you need (tree-shaking)</li>
                <li>Lazy load components when possible</li>
                <li>Optimize images and assets</li>
                <li>Monitor bundle size</li>
                <li>Use code splitting for large applications</li>
              </ul>
            </div>

            <!-- Consistency -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Maintain Consistency
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Consistency is key to a great user experience. Follow these practices:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Use consistent spacing and typography</li>
                <li>Follow established patterns and layouts</li>
                <li>Maintain consistent interaction patterns</li>
                <li>Use the same component variants across similar contexts</li>
                <li>Document any deviations from standard patterns</li>
              </ul>
            </div>

            <!-- Versioning -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Stay Up to Date
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Keep your design system version current and plan for updates:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Regularly update to the latest stable version</li>
                <li>Review changelogs before upgrading</li>
                <li>Test updates in a development environment first</li>
                <li>Plan migration for breaking changes</li>
                <li>Subscribe to release notifications</li>
              </ul>
            </div>

            <!-- Testing -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Test Thoroughly
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Ensure your implementations work correctly:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Write unit tests for custom implementations</li>
                <li>Test across different browsers and devices</li>
                <li>Verify accessibility with automated and manual testing</li>
                <li>Test with real users when possible</li>
                <li>Use visual regression testing for UI changes</li>
              </ul>
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

