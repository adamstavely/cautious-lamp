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
                      Image Converter
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Convert images between different formats: PNG to ICO, BMP to PNG, and WebP to PNG/JPG. Supports multiple sizes in ICO files.
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
                        <linearGradient id="icoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized image conversion icon -->
                      <rect x="40" y="50" width="50" height="50" rx="4" fill="url(#icoGradient)" opacity="0.4"/>
                      <path d="M 100 75 L 130 75" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="150" cy="75" r="25" fill="url(#icoGradient)" opacity="0.6"/>
                      <circle cx="150" cy="75" r="15" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Conversion Mode Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">swap_horiz</span>
                Conversion Mode
              </h2>
              
              <div class="flex flex-wrap gap-2">
                <button
                  @click="switchMode('png-to-ico')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'png-to-ico'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  PNG → ICO
                </button>
                <button
                  @click="switchMode('bmp-to-png')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'bmp-to-png'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  BMP → PNG
                </button>
                <button
                  @click="switchMode('webp-to-png')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'webp-to-png'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  WebP → PNG
                </button>
                <button
                  @click="switchMode('webp-to-jpg')"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="conversionMode === 'webp-to-jpg'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  WebP → JPG
                </button>
              </div>
            </div>

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
                  {{ getUploadLabel() }}
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
                    :accept="getAcceptType()"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-symbols-outlined text-5xl" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      upload
                    </span>
                    <div>
                      <p class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Drag and drop {{ getFileTypeLabel() }} here, or
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
                      Maximum file size: 10MB
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

                <!-- Output Format (only for WebP conversions) -->
                <div v-if="conversionMode === 'webp-to-png' || conversionMode === 'webp-to-jpg'" class="mb-4">
                  <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Output Format
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-if="conversionMode === 'webp-to-png'"
                      @click="webpOutputFormat = 'png'"
                      class="px-3 py-2 rounded border text-sm font-medium transition-colors"
                      :class="webpOutputFormat === 'png'
                        ? (isDarkMode 
                          ? 'border-indigo-400 bg-indigo-900/20 text-indigo-400' 
                          : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                        : (isDarkMode 
                          ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100')"
                    >
                      PNG
                    </button>
                    <button
                      v-if="conversionMode === 'webp-to-jpg'"
                      @click="webpOutputFormat = 'jpg'"
                      class="px-3 py-2 rounded border text-sm font-medium transition-colors"
                      :class="webpOutputFormat === 'jpg'
                        ? (isDarkMode 
                          ? 'border-indigo-400 bg-indigo-900/20 text-indigo-400' 
                          : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                        : (isDarkMode 
                          ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100')"
                    >
                      JPG
                    </button>
                  </div>
                </div>

                <!-- ICO Sizes (only for PNG to ICO) -->
                <div v-if="conversionMode === 'png-to-ico'" class="mb-4">
                  <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    ICO Sizes (select multiple)
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <label
                      v-for="size in icoSizes"
                      :key="size"
                      class="flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors"
                      :class="selectedSizes.includes(size)
                        ? (isDarkMode 
                          ? 'border-indigo-400 bg-indigo-900/20' 
                          : 'border-indigo-500 bg-indigo-50')
                        : (isDarkMode 
                          ? 'border-gray-600 bg-slate-800' 
                          : 'border-gray-300 bg-white')"
                    >
                      <input
                        type="checkbox"
                        :value="size"
                        v-model="selectedSizes"
                        class="w-4 h-4"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ size }}×{{ size }}
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Convert Button -->
                <button
                  @click="handleConvert()"
                  :disabled="!selectedFile || (conversionMode === 'png-to-ico' && selectedSizes.length === 0) || isConverting"
                  class="w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                  :class="(!selectedFile || (conversionMode === 'png-to-ico' && selectedSizes.length === 0) || isConverting)
                    ? (isDarkMode 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                    : (isDarkMode 
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700')"
                >
                  <span v-if="isConverting" class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                    Converting...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">download</span>
                    {{ getConvertButtonText() }}
                  </span>
                </button>
              </div>

              <!-- Right Column: Preview -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Preview
                </h2>
                
                <div v-if="previewUrl" class="space-y-4">
                  <div class="flex items-center justify-center p-8 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                    <img :src="previewUrl" alt="Preview" class="max-w-full max-h-64" />
                  </div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <p><strong>Original Size:</strong> {{ imageWidth }}×{{ imageHeight }}px</p>
                    <p v-if="selectedSizes.length > 0"><strong>ICO Sizes:</strong> {{ selectedSizes.join('×') }}, {{ selectedSizes.join('×') }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center justify-center p-12 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                    Upload {{ getFileTypeLabel() }} to see preview
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
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isDragging = ref(false);
const isConverting = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const imageWidth = ref(0);
const imageHeight = ref(0);
const fileInput = ref(null);
const conversionMode = ref('png-to-ico');
const webpOutputFormat = ref('png');

const icoSizes = [16, 32, 48, 64, 128, 256];
const selectedSizes = ref([16, 32, 48]);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const switchMode = (mode) => {
  if (conversionMode.value !== mode) {
    conversionMode.value = mode;
    if (mode === 'webp-to-png') {
      webpOutputFormat.value = 'png';
    } else if (mode === 'webp-to-jpg') {
      webpOutputFormat.value = 'jpg';
    }
    clearFile();
  }
};

const getUploadLabel = () => {
  if (conversionMode.value === 'png-to-ico') return 'Upload PNG Image';
  if (conversionMode.value === 'bmp-to-png') return 'Upload BMP Image';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'Upload WebP Image';
  return 'Upload Image';
};

const getAcceptType = () => {
  if (conversionMode.value === 'png-to-ico') return 'image/png';
  if (conversionMode.value === 'bmp-to-png') return 'image/bmp';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'image/webp';
  return 'image/*';
};

const getFileTypeLabel = () => {
  if (conversionMode.value === 'png-to-ico') return 'a PNG';
  if (conversionMode.value === 'bmp-to-png') return 'a BMP';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'a WebP';
  return 'an image';
};

const getConvertButtonText = () => {
  if (conversionMode.value === 'png-to-ico') return 'Convert to ICO';
  if (conversionMode.value === 'bmp-to-png') return 'Convert to PNG';
  if (conversionMode.value === 'webp-to-png') return 'Convert to PNG';
  if (conversionMode.value === 'webp-to-jpg') return 'Convert to JPG';
  return 'Convert';
};

const handleConvert = () => {
  if (conversionMode.value === 'png-to-ico') {
    convertToICO();
  } else if (conversionMode.value === 'bmp-to-png') {
    convertBmpToPng();
  } else if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') {
    convertWebP();
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    let isValid = false;
    
    if (conversionMode.value === 'png-to-ico') {
      isValid = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    } else if (conversionMode.value === 'bmp-to-png') {
      isValid = file.type === 'image/bmp' || file.name.toLowerCase().endsWith('.bmp');
    } else if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') {
      isValid = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
    }
    
    if (isValid) {
      processFile(file);
    } else {
      const expectedType = conversionMode.value === 'png-to-ico' ? 'PNG' : 
                           conversionMode.value === 'bmp-to-png' ? 'BMP' : 'WebP';
      alert(`Please upload a ${expectedType} image file.`);
    }
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    let isValid = false;
    
    if (conversionMode.value === 'png-to-ico') {
      isValid = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    } else if (conversionMode.value === 'bmp-to-png') {
      isValid = file.type === 'image/bmp' || file.name.toLowerCase().endsWith('.bmp');
    } else if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') {
      isValid = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
    }
    
    if (isValid) {
      processFile(file);
    } else {
      const expectedType = conversionMode.value === 'png-to-ico' ? 'PNG' : 
                           conversionMode.value === 'bmp-to-png' ? 'BMP' : 'WebP';
      alert(`Please select a ${expectedType} image file.`);
    }
  }
};

const processFile = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB.');
    return;
  }
  
  selectedFile.value = file;
  
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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const convertBmpToPng = async () => {
  if (!selectedFile.value) {
    return;
  }

  isConverting.value = true;

  try {
    // Read the BMP file
    const arrayBuffer = await selectedFile.value.arrayBuffer();
    
    // Create an image from the BMP data
    const blob = new Blob([arrayBuffer], { type: 'image/bmp' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      // Create a canvas and draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to PNG blob
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          // Download the PNG file
          const downloadUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = selectedFile.value.name.replace(/\.bmp$/i, '.png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
        URL.revokeObjectURL(url);
        isConverting.value = false;
      }, 'image/png');
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Failed to convert BMP image. Please try again.');
      isConverting.value = false;
    };
    
    img.src = url;
  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to convert image. Please try again.');
    isConverting.value = false;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const convertToICO = async () => {
  if (!selectedFile.value || selectedSizes.value.length === 0) {
    return;
  }

  isConverting.value = true;

  try {
    // Read the PNG file
    const arrayBuffer = await selectedFile.value.arrayBuffer();
    
    // Create ICO file
    const icoData = await createICOFile(arrayBuffer, selectedSizes.value);
    
    // Download the ICO file
    const blob = new Blob([icoData], { type: 'image/x-icon' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.value.name.replace('.png', '.ico');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to convert image. Please try again.');
  } finally {
    isConverting.value = false;
  }
};

const createICOFile = async (pngData, sizes) => {
  // This is a simplified ICO creation
  // In a production environment, you'd want to use a proper ICO library
  // For now, we'll create a basic ICO structure
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        // ICO file structure:
        // Header (6 bytes): Reserved (2), Type (2), Count (2)
        // Directory entries (16 bytes each): Width, Height, Colors, Reserved, Planes, BitCount, Size, Offset
        // Image data for each size
        
        const entries = sizes.length;
        const headerSize = 6;
        const directorySize = entries * 16;
        let offset = headerSize + directorySize;
        
        // Calculate total size
        let totalSize = offset;
        const imageDataArray = [];
        
        sizes.forEach(size => {
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          const pngData = canvas.toDataURL('image/png').split(',')[1];
          const decoded = atob(pngData);
          const bytes = new Uint8Array(decoded.length);
          for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i);
          }
          imageDataArray.push(bytes);
          totalSize += bytes.length;
        });
        
        // Create ICO buffer
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        
        // Write header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Type (1 = ICO)
        view.setUint16(4, entries, true); // Count
        
        // Write directory entries and collect image data
        sizes.forEach((size, index) => {
          const entryOffset = 6 + (index * 16);
          const imageData = imageDataArray[index];
          
          // Directory entry
          view.setUint8(entryOffset, size === 256 ? 0 : size); // Width
          view.setUint8(entryOffset + 1, size === 256 ? 0 : size); // Height
          view.setUint8(entryOffset + 2, 0); // Colors (0 = no palette)
          view.setUint8(entryOffset + 3, 0); // Reserved
          view.setUint16(entryOffset + 4, 1, true); // Planes
          view.setUint16(entryOffset + 6, 32, true); // BitCount (32 = RGBA)
          view.setUint32(entryOffset + 8, imageData.length, true); // Size
          view.setUint32(entryOffset + 12, offset, true); // Offset
          
          // Write image data
          const imageView = new Uint8Array(buffer, offset, imageData.length);
          imageView.set(imageData);
          
          offset += imageData.length;
        });
        
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = reject;
    const blob = new Blob([pngData], { type: 'image/png' });
    img.src = URL.createObjectURL(blob);
  });
};

const convertWebP = async () => {
  if (!selectedFile.value) {
    return;
  }

  isConverting.value = true;

  try {
    // Read the WebP file
    const arrayBuffer = await selectedFile.value.arrayBuffer();
    
    // Create an image from the WebP data
    const blob = new Blob([arrayBuffer], { type: 'image/webp' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      // Create a canvas and draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Determine MIME type and format
      let mimeType = 'image/png';
      let quality = undefined;
      let extension = 'png';
      
      if (webpOutputFormat.value === 'jpg' || conversionMode.value === 'webp-to-jpg') {
        mimeType = 'image/jpeg';
        quality = 0.92;
        extension = 'jpg';
      }
      
      // Convert canvas to blob
      const blobCallback = (convertedBlob) => {
        if (convertedBlob) {
          // Download the converted file
          const downloadUrl = URL.createObjectURL(convertedBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = selectedFile.value.name.replace(/\.webp$/i, `.${extension}`);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }
        URL.revokeObjectURL(url);
        isConverting.value = false;
      };
      
      if (mimeType === 'image/jpeg') {
        canvas.toBlob(blobCallback, mimeType, quality);
      } else {
        canvas.toBlob(blobCallback, mimeType);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Failed to convert WebP image. Please try again.');
      isConverting.value = false;
    };
    
    img.src = url;
  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to convert image. Please try again.');
    isConverting.value = false;
  }
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

