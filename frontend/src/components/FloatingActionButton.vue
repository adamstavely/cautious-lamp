<template>
  <button
    @click="toggleChat"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all duration-200 flex items-center justify-center group hover:scale-110"
    :class="{ 'rotate-45': isChatOpen }"
    title="Chat with Eero"
  >
    <span class="material-symbols-outlined text-2xl transition-transform" :class="{ 'rotate-45': isChatOpen }">
      {{ isChatOpen ? 'close' : 'psychology' }}
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  isChatOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-chat']);

const toggleChat = () => {
  emit('toggle-chat');
};
</script>

<style scoped>
/* Ensure button stays above other content */
button {
  z-index: 9999;
}
</style>

