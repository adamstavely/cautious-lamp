<template>
  <UiDialog :open="modelValue" title="Upload new version" @update:open="emit('update:modelValue', $event)">
    <form :id="formId" class="flex flex-col gap-5" @submit.prevent="uploadVersion">
      <UiFileDropZone
        ref="dropZone"
        label="New version file"
        :file="file"
        :accept="ACCEPTED_TYPES.join(',')"
        hint="PDF, PNG, JPEG, GIF, WebP or SVG, up to 50MB"
        @select="selectFile"
        @remove="removeFile"
      />
      <UiInput
        v-model="versionLabel"
        label="Version label"
        hint="For example, “Version 4 - Updated header”"
        required
      />
      <UiTextarea
        v-model="versionNotes"
        label="Version notes (optional)"
        :rows="2"
        placeholder="Describe what changed in this version..."
      />
      <UiSelect v-model="versionType" :options="versionTypes" label="Version type" />
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="cancel">Cancel</UiButton>
      <UiButton
        variant="primary"
        type="submit"
        :form="formId"
        icon="upload"
        :disabled="!file || !versionLabel.trim()"
        :loading="uploading"
      >
        Upload version
      </UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import { versionAPI, apiErrorMessage } from '../../services/api.js';
import { useNotice } from '../../composables/useNotice.js';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiDialog, UiInput, UiSelect, UiTextarea } from '../ui';
import UiFileDropZone from '../ui/UiFileDropZone.vue';

const props = defineProps({
  modelValue: Boolean,
  reviewId: String
});

const emit = defineEmits(['update:modelValue', 'version-uploaded']);

// What the review service accepts (docs/REVIEW_API.md)
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 50 * 1024 * 1024;

const formId = `version-upload-${useId()}`;
const file = ref(null);
const dropZone = ref(null);
const versionLabel = ref('');
const versionNotes = ref('');
const versionType = ref('minor');
const uploading = ref(false);
const { notice, showNotice, clearNotice } = useNotice();

const versionTypes = [
  { label: 'Minor update', value: 'minor' },
  { label: 'Major update', value: 'major' },
  { label: 'Bug fix', value: 'fix' },
  { label: 'Final version', value: 'final' }
];

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    file.value = null;
    versionLabel.value = '';
    versionNotes.value = '';
    versionType.value = 'minor';
    clearNotice();
    dropZone.value?.reset();
  }
});

const selectFile = (selected) => {
  if (!selected) return;
  if (!ACCEPTED_TYPES.includes(selected.type)) {
    showNotice('Choose a PDF, PNG, JPEG, GIF, WebP or SVG file.', 'error');
    return;
  }
  if (selected.size > MAX_SIZE) {
    showNotice('That file is larger than 50MB.', 'error');
    return;
  }
  clearNotice();
  file.value = selected;
};

const removeFile = () => {
  file.value = null;
};

const uploadVersion = async () => {
  if (!file.value || !versionLabel.value.trim() || uploading.value) return;

  uploading.value = true;
  clearNotice();

  try {
    const newVersion = await versionAPI.uploadVersion(
      props.reviewId,
      file.value,
      versionLabel.value.trim(),
      versionNotes.value.trim(),
      versionType.value
    );
    emit('version-uploaded', newVersion);
    emit('update:modelValue', false);
  } catch (error) {
    console.error('Failed to upload version:', error);
    showNotice(apiErrorMessage(error, 'Failed to upload version.'), 'error');
  } finally {
    uploading.value = false;
  }
};

const cancel = () => {
  emit('update:modelValue', false);
};
</script>

