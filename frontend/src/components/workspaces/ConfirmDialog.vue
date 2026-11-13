<template>
  <WorkspaceModal
    :open="state.open"
    :title="state.title"
    :icon="state.danger ? 'warning' : 'help'"
    :is-dark-mode="isDarkMode"
    size="sm"
    @close="settle(false)"
  >
    <p v-if="state.message" class="text-sm mb-4" :class="c.text">{{ state.message }}</p>
    <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
      <button
        type="button"
        class="px-4 py-2 rounded-lg font-medium transition-colors flex-1 text-white"
        :class="state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'"
        @click="settle(true)"
      >
        {{ state.confirmText }}
      </button>
      <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="c.secondary" @click="settle(false)">
        Cancel
      </button>
    </div>
  </WorkspaceModal>
</template>

<script setup>
import { computed } from 'vue';
import WorkspaceModal from './WorkspaceModal.vue';
import { ui } from './ui.js';

/** Renders the state from useConfirmDialog() */
const props = defineProps({
  state: { type: Object, required: true },
  isDarkMode: { type: Boolean, default: false },
});

const c = computed(() => ui(props.isDarkMode));

const settle = (answer) => {
  const resolve = props.state.resolve;
  // eslint-disable-next-line vue/no-mutating-props
  props.state.open = false;
  // eslint-disable-next-line vue/no-mutating-props
  props.state.resolve = null;
  resolve?.(answer);
};
</script>
