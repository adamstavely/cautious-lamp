<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-upload</v-icon>
      Upload New Version
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="uploadVersion">
        <v-file-input
          v-model="file"
          label="Select new version file"
          outlined
          class="mb-3"
          required
        />
        <v-text-field
          v-model="versionLabel"
          label="Version Label (e.g., 'Version 4 - Updated Header')"
          outlined
          class="mb-3"
          :rules="[v => !!v || 'Version label is required']"
          required
        />
        <v-textarea
          v-model="versionNotes"
          label="Version Notes (optional)"
          rows="2"
          outlined
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
        <div class="d-flex justify-end">
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
</template>

<script setup>
import { ref } from 'vue';
import { mockAPI, isMockMode } from '../../mockData.js';
import AlertModal from './AlertModal.vue';

const emit = defineEmits(['version-uploaded']);

const file = ref(null);
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
      
      // Reset form
      file.value = null;
      versionLabel.value = '';
      versionNotes.value = '';
      versionType.value = 'minor';
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
      
      // Reset form
      file.value = null;
      versionLabel.value = '';
      versionNotes.value = '';
      versionType.value = 'minor';
    }
  } catch (error) {
    console.error('Failed to upload version:', error);
    showAlert.value = true;
  } finally {
    uploading.value = false;
  }
};

const props = defineProps({
  reviewId: String
});
</script>
