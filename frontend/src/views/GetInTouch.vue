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
                    Get in Touch
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Have questions, feedback, or need support? We're here to help. Reach out to our team and join the conversation.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="getInTouchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Envelope/message icon -->
                      <rect x="40" y="60" width="120" height="80" rx="4" fill="url(#getInTouchGradient)" opacity="0.3"/>
                      <path d="M40 60 L100 110 L160 60" stroke="url(#getInTouchGradient)" stroke-width="3" fill="none" opacity="0.5"/>
                      <!-- Communication indicators -->
                      <circle cx="60" cy="80" r="4" fill="url(#getInTouchGradient)" opacity="0.6"/>
                      <circle cx="100" cy="80" r="4" fill="url(#getInTouchGradient)" opacity="0.6"/>
                      <circle cx="140" cy="80" r="4" fill="url(#getInTouchGradient)" opacity="0.6"/>
                      <!-- Speech bubbles -->
                      <ellipse cx="50" cy="40" rx="20" ry="15" fill="url(#getInTouchGradient)" opacity="0.4"/>
                      <path d="M50 55 L45 65 L55 65 Z" fill="url(#getInTouchGradient)" opacity="0.4"/>
                      <ellipse cx="150" cy="40" rx="20" ry="15" fill="url(#getInTouchGradient)" opacity="0.4"/>
                      <path d="M150 55 L145 65 L155 65 Z" fill="url(#getInTouchGradient)" opacity="0.4"/>
                      <!-- Connection lines -->
                      <line x1="70" y1="40" x2="100" y2="60" stroke="url(#getInTouchGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="130" y1="40" x2="100" y2="60" stroke="url(#getInTouchGradient)" stroke-width="2" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Methods Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Ways to Reach Us
            </h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Support -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">support_agent</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Support
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Need help with implementation or have technical questions? Our support team is ready to assist.
                </p>
                <a 
                  href="mailto:support@designsystem.example.com"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  support@designsystem.example.com
                </a>
              </div>

              <!-- Feedback -->
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
                  Feedback
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Share your ideas, suggestions, or report issues. Your feedback helps us improve the design system.
                </p>
                <a 
                  href="mailto:feedback@designsystem.example.com"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  feedback@designsystem.example.com
                </a>
              </div>

              <!-- Community -->
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
                  Community
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Join our community discussions, share knowledge, and connect with other users of the design system.
                </p>
                <a 
                  href="#"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Join Community →
                </a>
              </div>

              <!-- Partnerships -->
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
                  Partnerships
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Interested in partnering or collaborating? Let's explore how we can work together.
                </p>
                <a 
                  href="mailto:partnerships@designsystem.example.com"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  partnerships@designsystem.example.com
                </a>
              </div>

              <!-- Documentation -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">menu_book</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Documentation
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Found an issue with our documentation? Help us improve it by reporting errors or suggesting enhancements.
                </p>
                <a 
                  href="mailto:docs@designsystem.example.com"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  docs@designsystem.example.com
                </a>
              </div>

              <!-- General Inquiry -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">mail</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  General Inquiry
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  For all other questions or inquiries, feel free to reach out to our general contact.
                </p>
                <a 
                  href="mailto:hello@designsystem.example.com"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  hello@designsystem.example.com
                </a>
              </div>
            </div>
          </div>

          <!-- Response Times Section -->
          <div class="max-w-7xl mx-auto mb-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-3xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                What to Expect
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Response Times
                  </h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span><strong>Support requests:</strong> Within 24 hours</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span><strong>Feedback:</strong> Acknowledged within 48 hours</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span><strong>General inquiries:</strong> Within 3-5 business days</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    How We Can Help
                  </h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span>Technical implementation guidance</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span>Best practices and recommendations</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span>Component customization support</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-1">check_circle</span>
                      <span>Adoption strategy consultation</span>
                    </li>
                  </ul>
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
                  We're Here to Help
                </h2>
                <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Don't hesitate to reach out. Whether you have a question, need support, or want to share feedback, we'd love to hear from you.
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <a
                    href="mailto:hello@designsystem.example.com"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Send Us a Message
                  </a>
                  <router-link
                    to="/getting-started/support"
                    class="px-6 py-3 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    View Support Resources
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

