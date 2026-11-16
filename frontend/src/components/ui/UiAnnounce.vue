<template>
  <!-- Always in the page and visually hidden: screen readers announce each new
       `text` (a result count, "Copied", "Analysis complete"). Changing it to
       the same text again announces it again. -->
  <p class="sr-only" :aria-live="assertive ? 'assertive' : 'polite'" aria-atomic="true">{{ spoken }}</p>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';

/**
 * A live region for things that change without the page saying so out loud.
 * Keep it mounted (no v-if) and bind `text`; use `assertive` only for errors.
 * For a visible message with a dismiss button, use InlineNotice instead.
 */
const props = defineProps({
  text: { type: String, default: '' },
  assertive: { type: Boolean, default: false },
});

const spoken = ref('');
watch(
  () => props.text,
  async (text) => {
    spoken.value = '';
    if (!text) return;
    await nextTick();
    spoken.value = text;
  },
  { immediate: true },
);
</script>
