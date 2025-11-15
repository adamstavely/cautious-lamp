<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-y-auto"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="min-h-screen p-8 pb-16">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Review
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Collaborate on design reviews with your team. Share designs, gather feedback, track approvals, and streamline your design workflow with powerful review tools.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="reviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized review icon -->
                    <circle cx="100" cy="100" r="60" fill="url(#reviewGradient)" opacity="0.2"/>
                    <circle cx="100" cy="100" r="40" fill="url(#reviewGradient)" opacity="0.4"/>
                    <path d="M 70 100 L 90 120 L 130 80" stroke="rgba(255,255,255,0.6)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="100" cy="100" r="20" fill="url(#reviewGradient)" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Actions Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse review
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Request Review Button -->
            <button 
              @click="openRequestReviewModal"
              class="group rounded-2xl p-8 border transition-all flex flex-col items-center text-center"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-6xl">add_circle</span>
              </div>
              <h3 
                class="font-semibold text-xl mb-2 transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Request Review
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Upload your design files and request feedback from your team.</p>
            </button>

            <!-- My Requested Reviews Button -->
            <router-link 
              to="/review/my-requests" 
              class="group rounded-2xl p-8 border transition-all flex flex-col items-center text-center"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-6xl">rate_review</span>
              </div>
              <h3 
                class="font-semibold text-xl mb-2 transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                My Requested Reviews
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">View all the reviews you've requested as the designer.</p>
            </router-link>

            <!-- Admin Button -->
            <router-link 
              to="/review/management" 
              class="group rounded-2xl p-8 border transition-all flex flex-col items-center text-center"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <FolderKanban :size="64" :stroke-width="2" />
              </div>
              <h3 
                class="font-semibold text-xl mb-2 transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Review Management
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Manage reviews, users, and system settings.</p>
            </router-link>
          </div>
        </div>

        <!-- Review Interface Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Start reviewing
              </h2>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Upload Designs</h3>
                <p class="text-white/80 text-sm">Upload your design files and share them with your team for collaborative review and feedback.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Track Workflow</h3>
                <p class="text-white/80 text-sm">Monitor the approval process with workflow tracking from draft to final approval.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Version Control</h3>
                <p class="text-white/80 text-sm">Manage multiple versions of your designs and compare changes side by side.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hidden UploadPage component for modal access -->
    <div v-if="mounted && UploadPageComponent" style="display: none;">
      <component :is="UploadPageComponent" ref="uploadPageRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { FolderKanban } from 'lucide-vue-next';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const UploadPageComponent = shallowRef(null);
const uploadPageRef = ref(null);
const mounted = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const openRequestReviewModal = async () => {
  if (!mounted.value || !UploadPageComponent.value) {
    console.warn('UploadPage component not loaded yet');
    return;
  }
  
  // Wait for next tick to ensure component is fully rendered
  await nextTick();
  
  if (uploadPageRef.value && uploadPageRef.value.showUploadDesignModal !== undefined) {
    uploadPageRef.value.showUploadDesignModal = true;
  } else {
    console.warn('UploadPage ref not available or showUploadDesignModal not exposed', {
      hasRef: !!uploadPageRef.value,
      refValue: uploadPageRef.value
    });
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  try {
    const module = await import('../components/review-ui/UploadPage.vue');
    UploadPageComponent.value = module.default;
    mounted.value = true;
  } catch (err) {
    console.error('Error loading UploadPage component:', err);
  }
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
