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
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Alt Text Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate accessible, descriptive alt text for images to improve web accessibility and SEO. Upload an image and get AI-powered suggestions or write your own.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">image</span>
                      Image Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">accessibility</span>
                      Accessibility
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="altTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized image with text representation -->
                      <rect x="40" y="50" width="60" height="60" rx="4" fill="url(#altTextGradient)" opacity="0.4"/>
                      <path d="M 50 70 L 70 70 L 70 90 L 50 90 Z" fill="white" opacity="0.6"/>
                      <circle cx="80" cy="80" r="8" fill="white" opacity="0.6"/>
                      <!-- Text lines representing alt text -->
                      <rect x="40" y="120" width="60" height="4" rx="2" fill="url(#altTextGradient)" opacity="0.6"/>
                      <rect x="40" y="130" width="50" height="4" rx="2" fill="url(#altTextGradient)" opacity="0.6"/>
                      <rect x="40" y="140" width="45" height="4" rx="2" fill="url(#altTextGradient)" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-2 gap-6">
              <!-- Left Column: Upload and Input -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">upload</span>
                  Upload Image
                </h2>
                
                <!-- File Upload -->
                <div
                  @drop.prevent="handleDrop"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  class="border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4"
                  :class="isDragging
                    ? (isDarkMode 
                      ? 'border-indigo-400 bg-indigo-900/20' 
                      : 'border-indigo-500 bg-indigo-50')
                    : (isDarkMode 
                      ? 'border-gray-600 bg-slate-800' 
                      : 'border-gray-300 bg-gray-50')"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-symbols-outlined text-5xl" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      upload
                    </span>
                    <div>
                      <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Drag and drop an image here, or
                      </p>
                      <button
                        @click="$refs.fileInput.click()"
                        type="button"
                        class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        Browse Files
                      </button>
                    </div>
                    <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                      Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                </div>

                <!-- Selected File Info -->
                <div
                  v-if="selectedFile"
                  class="rounded-lg p-4 mb-4"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-gray-700' 
                    : 'bg-gray-50 border border-gray-200'"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                        image
                      </span>
                      <div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ selectedFile.name }}
                        </p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                          {{ formatFileSize(selectedFile.size) }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="clearFile"
                      class="p-1 rounded transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'"
                    >
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>

                <!-- Manual Alt Text Input -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <label for="alt-text-output" class="block text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <Captions :size="18" :stroke-width="2" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" />
                      Alt Text
                    </label>
                    <button
                      v-if="altText"
                      @click="copyAltText"
                      class="flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs font-medium"
                      :class="isDarkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-sm">{{ copied ? 'check' : 'content_copy' }}</span>
                        {{ copied ? 'Copied!' : 'Copy' }}
                      </button>
                  </div>
                  <textarea
                    id="alt-text-output"
                    v-model="altText"
                    rows="4"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                    placeholder="Enter descriptive alt text for the image..."
                  ></textarea>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                    {{ altText.length }} / 125 characters (recommended max)
                  </p>
                </div>

                <!-- Optional context for the generator -->
                <div class="mb-4">
                  <label for="alt-text-context" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Where the image appears (optional)
                  </label>
                  <input
                    id="alt-text-context"
                    v-model="context"
                    type="text"
                    maxlength="500"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    :class="isDarkMode
                      ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                    placeholder="e.g. Hero image on the pricing page"
                  />
                </div>

                <!-- Generate Button -->
                <button
                  @click="generateAltText"
                  :disabled="!selectedFile || isGenerating"
                  class="w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium mb-4"
                  :class="(!selectedFile || isGenerating)
                    ? (isDarkMode 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                    : (isDarkMode 
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700')"
                >
                  <span v-if="isGenerating" class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                    Generating...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    Generate Alt Text
                  </span>
                </button>

                <InlineNotice :notice="notice" @dismiss="clearNotice" />

              </div>

              <!-- Right Column: Guidelines -->
              <div class="space-y-6">
                <!-- Best Practices -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">lightbulb</span>
                    Best Practices
                  </h2>
                  
                  <div class="space-y-3">
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-sm mt-0.5" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      <div>
                        <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Be Descriptive</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Describe the image content and context, not just what it looks like.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-sm mt-0.5" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      <div>
                        <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Keep It Concise</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Aim for 125 characters or less. Be specific but brief.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-sm mt-0.5" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      <div>
                        <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Avoid Redundancy</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Don't start with "Image of" or "Picture of" - screen readers announce images automatically.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-sm mt-0.5" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      <div>
                        <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Include Context</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Mention important details like text, people, actions, or emotions if relevant.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-sm mt-0.5" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">check_circle</span>
                      <div>
                        <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Decorative Images</p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Use empty alt text (<code class="text-xs px-1 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700 text-indigo-300' : 'bg-gray-100 text-indigo-600'">alt=""</code>) for purely decorative images.</p>
                      </div>
                    </div>
                  </div>
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
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { Captions } from 'lucide-vue-next';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const isDragging = ref(false);
const isGenerating = ref(false);
const selectedFile = ref(null);
const altText = ref('');
const context = ref('');
const copied = ref(false);
const fileInput = ref(null);

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) {
    showNotice('Please choose a PNG, JPEG, GIF or WebP image.', 'error');
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    showNotice('Images must be 5MB or smaller.', 'error');
    return;
  }
  clearNotice();
  selectedFile.value = file;
  altText.value = '';
};

const clearFile = () => {
  selectedFile.value = null;
  altText.value = '';
  clearNotice();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const generateAltText = async () => {
  if (!selectedFile.value) {
    return;
  }

  isGenerating.value = true;
  clearNotice();
  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    if (context.value.trim()) formData.append('context', context.value.trim());

    const { data } = await apiClient.post('/api/v1/alt-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    altText.value = data.altText;
    if (data.altText) {
      showNotice('Alt text generated. Check it reads well in context before using it.', 'success');
    } else {
      showNotice('This image looks decorative, so it should have empty alt text (alt="").', 'info');
    }
  } catch (error) {
    const message = error.response?.data?.message;
    showNotice(
      Array.isArray(message) ? message.join(' ') : message || 'Could not reach the alt text service. You can still write alt text by hand.',
      'error',
    );
  } finally {
    isGenerating.value = false;
  }
};

const copyAltText = async () => {
  if (!altText.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(altText.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    showNotice('Copy failed. Select the text and copy it manually.', 'error');
  }
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

