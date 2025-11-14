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
                      Image Compressor
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Compress PNG, JPG, and GIF images to reduce file size while maintaining quality. Perfect for optimizing images for web use.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">image</span>
                      Image Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="compressorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized compression icon -->
                      <rect x="40" y="50" width="120" height="100" rx="4" fill="url(#compressorGradient)" opacity="0.3"/>
                      <rect x="50" y="60" width="100" height="80" rx="2" fill="url(#compressorGradient)" opacity="0.5"/>
                      <path d="M 60 80 L 140 80 M 60 100 L 140 100 M 60 120 L 120 120" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-2 gap-6">
              <!-- Left Column: Upload and Settings -->
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
                  @dragover.prevent
                  @dragenter.prevent
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
                    accept="image/png,image/jpeg,image/jpg,image/gif"
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
                      Supports PNG, JPG, GIF (Max: 10MB)
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

                <!-- Compression Settings -->
                <div v-if="selectedFile" class="space-y-4 mb-4">
                  <!-- Quality Slider -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Quality: {{ compressionQuality }}%
                      </label>
                      <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ compressionQuality >= 80 ? 'High' : compressionQuality >= 50 ? 'Medium' : 'Low' }}
                      </span>
                    </div>
                    <input
                      v-model.number="compressionQuality"
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Smaller</span>
                      <span>Larger</span>
                    </div>
                  </div>

                  <!-- Max Width/Height -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Max Width (px)
                      </label>
                      <input
                        v-model.number="maxWidth"
                        type="number"
                        min="100"
                        max="10000"
                        step="100"
                        placeholder="Original"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Max Height (px)
                      </label>
                      <input
                        v-model.number="maxHeight"
                        type="number"
                        min="100"
                        max="10000"
                        step="100"
                        placeholder="Original"
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'"
                      />
                    </div>
                  </div>

                  <!-- Maintain Aspect Ratio -->
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="maintainAspectRatio"
                      class="w-4 h-4"
                      :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Maintain aspect ratio</span>
                  </label>
                </div>

                <!-- Compress Button -->
                <button
                  @click="compressImage"
                  :disabled="!selectedFile || isCompressing"
                  class="w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                  :class="(!selectedFile || isCompressing)
                    ? (isDarkMode 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                    : (isDarkMode 
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700')"
                >
                  <span v-if="isCompressing" class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                    Compressing...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">compress</span>
                    Compress Image
                  </span>
                </button>
              </div>

              <!-- Right Column: Preview and Results -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Preview & Results
                </h2>
                
                <div v-if="previewUrl" class="space-y-4">
                  <div class="flex items-center justify-center p-8 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                    <img :src="previewUrl" alt="Preview" class="max-w-full max-h-64" />
                  </div>
                  
                  <!-- File Size Comparison -->
                  <div v-if="compressedSize > 0" class="rounded-lg p-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Original Size:</span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ formatFileSize(selectedFile?.size || 0) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Compressed Size:</span>
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                          {{ formatFileSize(compressedSize) }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Reduction:</span>
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                          {{ compressionPercentage }}% ({{ formatFileSize((selectedFile?.size || 0) - compressedSize) }} saved)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <p><strong>Dimensions:</strong> {{ imageWidth }}×{{ imageHeight }}px</p>
                  </div>
                  
                  <!-- Download Button -->
                  <button
                    v-if="compressedBlob"
                    @click="downloadCompressed"
                    class="w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    :class="isDarkMode 
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined">download</span>
                      Download Compressed Image
                    </span>
                  </button>
                </div>
                <div v-else class="flex items-center justify-center p-12 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                    Upload an image to see preview and compression results
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
import { ref, computed, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isDragging = ref(false);
const isCompressing = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const imageWidth = ref(0);
const imageHeight = ref(0);
const fileInput = ref(null);
const compressionQuality = ref(80);
const maxWidth = ref(null);
const maxHeight = ref(null);
const maintainAspectRatio = ref(true);
const compressedBlob = ref(null);
const compressedSize = ref(0);

const compressionPercentage = computed(() => {
  if (!selectedFile.value || compressedSize.value === 0) return 0;
  const originalSize = selectedFile.value.size;
  const reduction = ((originalSize - compressedSize.value) / originalSize) * 100;
  return Math.round(reduction);
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const handleDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/') && ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
      processFile(file);
    } else {
      alert('Please upload a PNG, JPG, or GIF image file.');
    }
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.type.startsWith('image/') && ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
      processFile(file);
    } else {
      alert('Please select a PNG, JPG, or GIF image file.');
    }
  }
};

const processFile = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB.');
    return;
  }
  
  selectedFile.value = file;
  compressedBlob.value = null;
  compressedSize.value = 0;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      imageWidth.value = img.width;
      imageHeight.value = img.height;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const clearFile = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  imageWidth.value = 0;
  imageHeight.value = 0;
  compressedBlob.value = null;
  compressedSize.value = 0;
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

const compressImage = async () => {
  if (!selectedFile.value) {
    return;
  }

  isCompressing.value = true;

  try {
    // Read the image file
    const arrayBuffer = await selectedFile.value.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: selectedFile.value.type });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (maxWidth.value && img.width > maxWidth.value) {
        newWidth = maxWidth.value;
        if (maintainAspectRatio.value) {
          newHeight = (img.height / img.width) * newWidth;
        }
      }
      
      if (maxHeight.value && newHeight > maxHeight.value) {
        newHeight = maxHeight.value;
        if (maintainAspectRatio.value && !maxWidth.value) {
          newWidth = (img.width / img.height) * newHeight;
        }
      }
      
      // Create a canvas and draw the image
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(newWidth);
      canvas.height = Math.round(newHeight);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Determine output format and quality
      let mimeType = selectedFile.value.type;
      let quality = compressionQuality.value / 100;
      
      // For PNG, we can't use quality parameter, so we'll convert to JPEG if quality is low
      if (mimeType === 'image/png' && compressionQuality.value < 80) {
        mimeType = 'image/jpeg';
      }
      
      // Convert canvas to blob
      canvas.toBlob((compressedBlobResult) => {
        if (compressedBlobResult) {
          compressedBlob.value = compressedBlobResult;
          compressedSize.value = compressedBlobResult.size;
          
          // Update preview
          const reader = new FileReader();
          reader.onload = (e) => {
            previewUrl.value = e.target.result;
            imageWidth.value = canvas.width;
            imageHeight.value = canvas.height;
          };
          reader.readAsDataURL(compressedBlobResult);
        }
        URL.revokeObjectURL(url);
        isCompressing.value = false;
      }, mimeType, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Failed to compress image. Please try again.');
      isCompressing.value = false;
    };
    
    img.src = url;
  } catch (error) {
    console.error('Compression error:', error);
    alert('Failed to compress image. Please try again.');
    isCompressing.value = false;
  }
};

const downloadCompressed = () => {
  if (!compressedBlob.value) return;
  
  const url = URL.createObjectURL(compressedBlob.value);
  const a = document.createElement('a');
  a.href = url;
  const originalName = selectedFile.value.name.replace(/\.[^/.]+$/, '');
  const extension = compressedBlob.value.type === 'image/jpeg' ? 'jpg' : 
                    compressedBlob.value.type === 'image/png' ? 'png' : 
                    compressedBlob.value.type === 'image/gif' ? 'gif' : 'jpg';
  a.download = `${originalName}-compressed.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onMounted(() => {
  // Watch for dark mode changes
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

