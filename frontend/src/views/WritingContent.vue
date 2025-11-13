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
                    Writing & Content
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Clear, concise, and user-focused content is essential for great user experiences. Learn how to write effective copy that guides and supports users.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="writingContentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Document/writing icon -->
                      <rect x="60" y="50" width="80" height="100" rx="4" fill="url(#writingContentGradient)" opacity="0.8"/>
                      <line x1="75" y1="75" x2="125" y2="75" stroke="white" stroke-width="3" opacity="0.7"/>
                      <line x1="75" y1="95" x2="125" y2="95" stroke="white" stroke-width="3" opacity="0.7"/>
                      <line x1="75" y1="115" x2="110" y2="115" stroke="white" stroke-width="3" opacity="0.7"/>
                      <!-- Pen/pencil -->
                      <line x1="130" y1="60" x2="145" y2="45" stroke="url(#writingContentGradient)" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
                      <circle cx="145" cy="45" r="3" fill="url(#writingContentGradient)" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Content Writing Guidelines
              </h2>
              <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Good content is clear, concise, and user-centered. Our content guidelines help you write copy that supports users and enhances their experience.
              </p>
              
              <div class="space-y-6 mt-8">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Clarity & Simplicity
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use plain language and avoid jargon. Write in a way that's easy to understand, using short sentences and clear structure. Users should never have to guess what you mean.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    User-Centered Language
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Write from the user's perspective. Use "you" and "your" to speak directly to users. Focus on what users can do and what benefits they'll receive.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Consistency
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Maintain consistent terminology, tone, and style throughout your interface. Consistency in language helps users build understanding and trust.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Action-Oriented
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use active voice and action verbs. Button labels and calls-to-action should clearly indicate what will happen when users interact with them.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Accessibility in Content
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Write content that's accessible to all users. Use descriptive link text, provide alt text for images, and ensure content is readable by screen readers.
                  </p>
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

