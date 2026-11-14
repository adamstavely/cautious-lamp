<template>
  <WorkspaceModal :open="state.open" :title="state.title" size="sm" @close="settle(false)">
    <p v-if="state.message" class="text-ink">{{ state.message }}</p>
    <template #footer>
      <UiButton @click="settle(false)">Cancel</UiButton>
      <UiButton :variant="state.danger ? 'danger' : 'primary'" @click="settle(true)">{{ state.confirmText }}</UiButton>
    </template>
  </WorkspaceModal>
</template>

<script setup>
import { UiButton } from '../ui';
import WorkspaceModal from './WorkspaceModal.vue';

/** Renders the state from useConfirmDialog() */
const props = defineProps({
  state: { type: Object, required: true },
});

const settle = (answer) => {
  const resolve = props.state.resolve;
  // eslint-disable-next-line vue/no-mutating-props
  props.state.open = false;
  // eslint-disable-next-line vue/no-mutating-props
  props.state.resolve = null;
  resolve?.(answer);
};
</script>
