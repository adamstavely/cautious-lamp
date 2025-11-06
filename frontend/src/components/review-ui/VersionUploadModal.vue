<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <svg class="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload New Version
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-4">
        <v-form @submit.prevent="uploadVersion">
          <!-- Drag and Drop File Upload Card -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Select new version file
            </label>
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @dragenter.prevent="isDragging = true"
              class="relative border-2 border-dashed rounded-lg p-6 transition-colors"
              :class="isDragging 
                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                : file 
                  ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800'"
            >
              <input
                ref="fileInput"
                type="file"
                @change="handleFileChange"
                class="hidden"
                required
              />
              
              <div class="text-center">
                <div class="flex justify-center mb-3">
                  <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span class="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer" @click="openFileDialog">
                    Click to upload
                  </span>
                  <span class="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                </p>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  PDF, AI, Sketch, Figma, or other design files
                </p>
                
                <!-- Selected File Preview -->
                <div v-if="file" class="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="text-left">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ file.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="removeFile"
                      class="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  @click="openFileDialog"
                  class="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors shadow-sm"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
          
          <v-text-field
            v-model="versionLabel"
            label="Version Label (e.g., 'Version 4 - Updated Header')"
            variant="outlined"
            class="mb-3"
            :rules="[v => !!v || 'Version label is required']"
            required
          />
          <v-textarea
            v-model="versionNotes"
            label="Version Notes (optional)"
            rows="2"
            variant="outlined"
            class="mb-3"
            placeholder="Describe what changed in this version..."
          />
          <v-select
            v-model="versionType"
            :items="versionTypes"
            label="Version Type"
            variant="outlined"
            color="primary"
            class="mb-3"
          />
          <div class="d-flex justify-end ga-2">
            <v-btn
              variant="text"
              @click="cancel"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              :disabled="!file || !versionLabel.trim()"
              :loading="uploading"
            >
              Upload Version
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Alert Modal -->
    <AlertModal
      v-model="showAlert"
      title="Upload Error"
      message="Failed to upload version. Please try again."
      type="error"
    />
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { mockAPI, isMockMode } from '../../mockData.js';
import AlertModal from './AlertModal.vue';

const props = defineProps({
  modelValue: Boolean,
  reviewId: String
});

const emit = defineEmits(['update:modelValue', 'version-uploaded']);

const file = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
const versionLabel = ref('');
const versionNotes = ref('');
const versionType = ref('minor');
const uploading = ref(false);
const showAlert = ref(false);

const versionTypes = [
  { title: 'Minor Update', value: 'minor' },
  { title: 'Major Update', value: 'major' },
  { title: 'Bug Fix', value: 'fix' },
  { title: 'Final Version', value: 'final' }
];

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    file.value = null;
    isDragging.value = false;
    versionLabel.value = '';
    versionNotes.value = '';
    versionType.value = 'minor';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
});

const handleFileChange = (event) => {
  file.value = event.target.files[0];
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer.files;
  if (droppedFiles.length > 0) {
    file.value = droppedFiles[0];
  }
};

const removeFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const uploadVersion = async () => {
  if (!file.value || !versionLabel.value.trim()) return;
  
  uploading.value = true;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Use mock API
      const newVersion = await mockAPI.uploadVersion(
        props.reviewId,
        file.value.name,
        versionLabel.value.trim(),
        versionNotes.value.trim(),
        versionType.value
      );
      
      emit('version-uploaded', newVersion);
      
      // Close modal
      emit('update:modelValue', false);
    } else {
      // Use real API
      const formData = new FormData();
      formData.append('file', file.value);
      formData.append('label', versionLabel.value.trim());
      formData.append('notes', versionNotes.value.trim());
      formData.append('type', versionType.value);
      
      const response = await fetch(`/review/${props.reviewId}/versions`, {
        method: 'POST',
        body: formData,
        headers: {
          'x-admin-token': localStorage.getItem('adminToken')
        }
      });
      
      const newVersion = await response.json();
      emit('version-uploaded', newVersion);
      
      // Close modal
      emit('update:modelValue', false);
    }
  } catch (error) {
    console.error('Failed to upload version:', error);
    showAlert.value = true;
  } finally {
    uploading.value = false;
  }
};

const cancel = () => {
  emit('update:modelValue', false);
};
</script>

