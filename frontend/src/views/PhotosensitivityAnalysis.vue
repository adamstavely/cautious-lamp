<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Photosensitivity Analysis
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Analyze video content for photosensitive epileptic risks using EA's IRIS tool. Detect luminance flashes, red saturation flashes, and spatial patterns.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="photosensitivityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Video frame representation -->
                    <rect x="30" y="40" width="140" height="100" rx="4" fill="url(#photosensitivityGradient)" opacity="0.3" stroke="url(#photosensitivityGradient)" stroke-width="2"/>
                    <!-- Static indicators (no animation for photosensitivity safety) -->
                    <circle cx="60" cy="70" r="8" fill="#ffffff" opacity="0.8"/>
                    <circle cx="100" cy="90" r="6" fill="#ffffff" opacity="0.7"/>
                    <circle cx="140" cy="110" r="7" fill="#ffffff" opacity="0.6"/>
                    <!-- Shield representing safety -->
                    <path d="M 100 150 L 120 160 L 120 180 Q 120 190, 100 195 Q 80 190, 80 180 L 80 160 Z" fill="url(#photosensitivityGradient)" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Video Upload Section -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">upload_file</span>
              Upload Video for Analysis
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Application Name (optional)
                </label>
                <input
                  v-model="applicationName"
                  type="text"
                  placeholder="Enter application name"
                  class="w-full px-4 py-2 rounded-lg border"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                />
              </div>

              <div>
                <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Video File
                </label>
                <div 
                  @click="triggerFileInput"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                  class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                  :class="isDragging
                    ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50')
                    : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="video/*"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                  <span class="material-symbols-outlined text-4xl mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    video_library
                  </span>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Click to upload or drag and drop
                  </p>
                  <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Supported formats: MP4, AVI, MOV, WebM (max 500MB)
                  </p>
                  <p v-if="selectedFile" class="text-sm mt-2 font-medium" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    Selected: {{ selectedFile.name }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="enablePatternDetection"
                    type="checkbox"
                    class="accent-indigo-600"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Enable Pattern Detection
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="outputJson"
                    type="checkbox"
                    class="accent-indigo-600"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Output JSON (instead of CSV)
                  </span>
                </label>
              </div>

              <button
                @click="analyzeVideo"
                :disabled="!selectedFile || isAnalyzing"
                class="w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                :class="!selectedFile || isAnalyzing
                  ? (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                  : (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')"
              >
                <span v-if="isAnalyzing" class="material-symbols-outlined animate-spin">sync</span>
                <span v-else class="material-symbols-outlined">play_arrow</span>
                {{ isAnalyzing ? 'Analyzing...' : 'Analyze Video' }}
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div 
            v-if="analysisResult"
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">assessment</span>
              Analysis Results
            </h2>

            <!-- Summary -->
            <div class="mb-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="analysisResult.summary.status === 'failure' ? 'text-red-400' : analysisResult.summary.status === 'warning' ? 'text-yellow-400' : 'text-green-400'">
                    {{ analysisResult.summary.status === 'failure' ? '✗' : analysisResult.summary.status === 'warning' ? '⚠' : '✓' }}
                  </div>
                  <div class="text-xs capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ analysisResult.summary.status }}
                  </div>
                </div>
                <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ analysisResult.summary.luminanceFailures + analysisResult.summary.redFailures + analysisResult.summary.patternFailures }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Failures</div>
                </div>
                <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">
                    {{ analysisResult.summary.luminanceWarnings + analysisResult.summary.redWarnings }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Warnings</div>
                </div>
                <div class="p-4 rounded-lg text-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    {{ analysisResult.summary.totalFrames }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Frames</div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'">
                  <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">
                    Luminance Failures
                  </div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ analysisResult.summary.luminanceFailures }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-red-400/70' : 'text-red-600/70'">
                    Max transitions: {{ analysisResult.summary.maxLuminanceTransitions }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'">
                  <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">
                    Red Saturation Failures
                  </div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ analysisResult.summary.redFailures }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-red-400/70' : 'text-red-600/70'">
                    Max transitions: {{ analysisResult.summary.maxRedTransitions }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'">
                  <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">
                    Pattern Failures
                  </div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    {{ analysisResult.summary.patternFailures }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Compliance Checks -->
            <div v-if="analysisResult.complianceChecks && analysisResult.complianceChecks.length > 0" class="mt-6">
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Compliance Checks
              </h3>
              <div class="space-y-2">
                <div
                  v-for="check in analysisResult.complianceChecks"
                  :key="check.id"
                  class="p-4 rounded-lg border"
                  :class="check.status === 'pass'
                    ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                    : check.status === 'warning'
                    ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                    : (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')"
                >
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined flex-shrink-0" :class="check.status === 'pass' ? 'text-green-500' : check.status === 'warning' ? 'text-yellow-500' : 'text-red-500'">
                      {{ check.status === 'pass' ? 'check_circle' : check.status === 'warning' ? 'warning' : 'error' }}
                    </span>
                    <div class="flex-1">
                      <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ check.rule }}
                      </div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ check.message }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div 
            v-if="error"
            class="rounded-lg shadow-sm border p-4"
            :class="isDarkMode 
              ? 'bg-red-900/20 border-red-700' 
              : 'bg-red-50 border-red-200'"
          >
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-red-500">error</span>
              <div class="text-sm" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
let darkModeObserver = null;
let darkModeInterval = null;

const selectedFile = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
const isAnalyzing = ref(false);
const analysisResult = ref(null);
const error = ref(null);
const applicationName = ref('');
const enablePatternDetection = ref(true);
const outputJson = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    selectedFile.value = file;
    error.value = null;
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files?.[0];
  if (file && file.type.startsWith('video/')) {
    selectedFile.value = file;
    error.value = null;
  } else {
    error.value = 'Please drop a valid video file';
  }
};

const analyzeVideo = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a video file';
    return;
  }

  isAnalyzing.value = true;
  error.value = null;
  analysisResult.value = null;

  try {
    const formData = new FormData();
    formData.append('video', selectedFile.value);
    formData.append('enablePatternDetection', enablePatternDetection.value ? 'true' : 'false');
    formData.append('outputJson', outputJson.value ? 'true' : 'false');
    if (applicationName.value) {
      formData.append('applicationName', applicationName.value);
    }

    const response = await axios.post('/api/v1/photosensitivity/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minute timeout
    });

    analysisResult.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to analyze video. Make sure IRIS is installed and accessible.';
    console.error('IRIS analysis error:', err);
  } finally {
    isAnalyzing.value = false;
  }
};

onMounted(() => {
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

