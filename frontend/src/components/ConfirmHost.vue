<template>
  <!-- Mounted once in App.vue; pages call confirmDialog() from composables/useConfirm.js -->
  <UiDialog :open="!!request" :title="request?.title || 'Confirm'" size="sm" @update:open="(open) => !open && answerConfirm(false)">
    <p v-if="request?.message" class="text-sm text-ink whitespace-pre-line">{{ request.message }}</p>
    <template #footer>
      <UiButton @click="answerConfirm(false)">{{ request?.cancelLabel || 'Cancel' }}</UiButton>
      <UiButton :variant="request?.danger ? 'danger' : 'primary'" @click="answerConfirm(true)">{{ request?.confirmLabel || 'Confirm' }}</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { answerConfirm, useConfirmRequest } from '../composables/useConfirm.js';
import { UiButton, UiDialog } from './ui';

const request = useConfirmRequest();
</script>
