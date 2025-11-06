<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Main Content Area -->
    <div class="flex-1 h-full transition-all duration-300 relative overflow-y-auto" style="margin-left: 48px;">
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

        <!-- Review Features Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Review features
            </h2>
            <button class="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
              View all features
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Feature Card 1: Upload -->
            <a href="#" class="group rounded-2xl p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
              <div class="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-5xl">upload</span>
              </div>
              <h3 class="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Upload
              </h3>
            </a>

            <!-- Feature Card 2: Comments -->
            <a href="#" class="group rounded-2xl p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
              <div class="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-5xl">comment</span>
              </div>
              <h3 class="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Comments
              </h3>
            </a>

            <!-- Feature Card 3: Approvals -->
            <a href="#" class="group rounded-2xl p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
              <div class="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h3 class="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Approvals
              </h3>
            </a>

            <!-- Feature Card 4: Versions -->
            <a href="#" class="group rounded-2xl p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
              <div class="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-5xl">history</span>
              </div>
              <h3 class="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Versions
              </h3>
            </a>

            <!-- Feature Card 5: Teams -->
            <a href="#" class="group rounded-2xl p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all relative">
              <div class="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400">
                <span class="material-symbols-outlined text-5xl">groups</span>
              </div>
              <h3 class="text-gray-900 dark:text-white font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Teams
              </h3>
              <span class="material-symbols-outlined absolute top-4 right-4 text-gray-400 dark:text-gray-500 text-xl">
                chevron_right
              </span>
            </a>
          </div>
        </div>

        <!-- Review Interface Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Start reviewing
              </h2>
              <button class="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                View all reviews
              </button>
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

        <!-- Review Interface Component -->
        <div class="max-w-7xl mx-auto mt-16">
          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p class="text-red-800 dark:text-red-200 font-semibold">Error loading review interface:</p>
            <p class="text-red-600 dark:text-red-300 text-sm mt-2">{{ error }}</p>
            <pre class="text-xs mt-2 overflow-auto text-gray-800 dark:text-gray-200">{{ errorStack }}</pre>
          </div>
          
          <component v-else-if="mounted && UploadPageComponent" :is="UploadPageComponent" />
          
          <div v-else class="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p class="text-gray-500 dark:text-gray-400">Loading review interface...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onErrorCaptured } from 'vue';

const UploadPageComponent = ref(null);
const mounted = ref(false);
const error = ref(null);
const errorStack = ref(null);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
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
    error.value = err.message;
    errorStack.value = err.stack;
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

onErrorCaptured((err) => {
  error.value = err.message;
  errorStack.value = err.stack;
  console.error('Error in Review page:', err);
  return false;
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
