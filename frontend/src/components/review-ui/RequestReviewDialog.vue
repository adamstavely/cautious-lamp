<template>
  <UiDialog :open="modelValue" title="Design review request" size="lg" @update:open="setOpen">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p>Upload design files or link to a website under development for client review.</p>
      <DemoDataBadge />
    </div>
    <FileUpload @uploaded="handleUploaded" />
    <UiCallout v-if="resultUrl" tone="success" title="Review created. Share this link:" role="status">
      <UiLink :href="resultUrl" external class="break-all">{{ resultUrl }}</UiLink>
    </UiCallout>
  </UiDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import FileUpload from './FileUpload.vue';
import DemoDataBadge from './DemoDataBadge.vue';
import { UiCallout, UiDialog, UiLink } from '../ui';

const props = defineProps({
  modelValue: Boolean,
});

// created: ({ reviewId, url }) after each review is created
const emit = defineEmits(['update:modelValue', 'created']);

const resultUrl = ref('');

const setOpen = (open) => emit('update:modelValue', open);

// Start fresh each time the dialog opens
watch(() => props.modelValue, (open) => {
  if (open) resultUrl.value = '';
});

const handleUploaded = (result) => {
  resultUrl.value = result.url;
  emit('created', result);
};
</script>
