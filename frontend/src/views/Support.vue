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
                    Support & Help
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Get help when you need it. Find answers to common questions, report issues, or contact the design system team.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="supportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized help/support icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#supportGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="50" fill="none" stroke="url(#supportGradient)" stroke-width="4" opacity="0.4"/>
                      <circle cx="100" cy="80" r="20" fill="url(#supportGradient)" opacity="0.5"/>
                      <path d="M 100 100 Q 100 120 80 130 L 100 140 L 120 130 Q 100 120 100 100" fill="url(#supportGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Support Options -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- FAQ -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Frequently Asked Questions
              </h2>
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    How do I customize components?
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Most components support customization through props and variants. For more advanced customization, you can extend components or use design tokens to create your own variants. See the <router-link to="/getting-started/best-practices" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">Best Practices</router-link> guide for details.
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Can I use components in my existing project?
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Yes! The design system is framework-agnostic and can be integrated into Vue, React, Angular, and vanilla JavaScript projects. See the <router-link to="/getting-started/installation" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">Installation</router-link> guide for framework-specific instructions.
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    How do I report a bug or request a feature?
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use our feedback system or create an issue in the GitHub repository. For feature requests, you can also use the <router-link to="/roadmap-feedback" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">Roadmap & Feedback</router-link> page.
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Is the design system accessible?
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Yes! All components are built to meet WCAG 2.1 AA standards. However, proper implementation is key—always use components as documented and provide appropriate labels and ARIA attributes when needed.
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    How often is the design system updated?
                  </h3>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    We release regular updates with new components, improvements, and bug fixes. Major version updates are announced in advance, and we maintain backward compatibility when possible. Check the <router-link to="/roadmap-feedback" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">Roadmap</router-link> for upcoming features.
                  </p>
                </div>
              </div>
            </div>

            <!-- Contact Options -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Get in Touch
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">chat</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Live Chat
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Chat with our team in real-time for quick questions and support.
                  </p>
                  <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Start Chat
                  </button>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">email</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Email Support
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Send us an email for detailed questions or support requests.
                  </p>
                  <a
                    href="mailto:design-system@example.com"
                    class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Send Email
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">forum</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Community Forum
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Ask questions and get help from the community of design system users.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Visit Forum →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    <span class="material-symbols-outlined text-5xl">bug_report</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Report Issues
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Found a bug? Report it on GitHub or through our feedback system.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Report Issue →
                  </a>
                </div>
              </div>
            </div>

            <!-- Office Hours -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Office Hours
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Join our weekly office hours for live Q&A sessions with the design system team. Get help with implementation, discuss best practices, and share feedback.
              </p>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold mb-1" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">When:</p>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Every Tuesday, 2:00 PM - 3:00 PM EST</p>
                </div>
                <div>
                  <p class="font-semibold mb-1" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">Where:</p>
                  <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Virtual meeting (link provided upon request)</p>
                </div>
              </div>
              <button
                class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
              >
                Request Invite
              </button>
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

