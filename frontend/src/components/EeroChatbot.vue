<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-lg">psychology</span>
          </div>
          <div>
            <h3 class="font-semibold text-sm">Eero</h3>
            <p class="text-xs text-white/80">AI Assistant</p>
          </div>
        </div>
        <button
          @click="close"
          class="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesRef">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100'
            ]"
          >
            <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            <p class="text-xs mt-1 opacity-70">
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-100 dark:bg-slate-700 rounded-lg px-4 py-2">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 dark:border-slate-700 p-4">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Ask Eero anything..."
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
            :disabled="isLoading"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isLoading"
            class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const inputMessage = ref('');
const messages = ref([
  {
    role: 'assistant',
    content: "Hi! I'm Eero, your AI design assistant. How can I help you today?",
    timestamp: new Date()
  }
]);
const isLoading = ref(false);
const messagesRef = ref(null);

const close = () => {
  emit('close');
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage = inputMessage.value.trim();
  inputMessage.value = '';

  // Add user message
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  await scrollToBottom();

  // Simulate AI response (replace with actual API call)
  isLoading.value = true;
  
  setTimeout(() => {
    // Mock response - replace with actual AI API integration
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand what you're looking for. Here's what I think...",
      "Based on your design system, I'd recommend...",
      "That's an interesting challenge. Let me suggest a few approaches...",
      "I can help you with that! Here's what you should consider..."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    messages.value.push({
      role: 'assistant',
      content: `${randomResponse}\n\nThis is a placeholder response. In a real implementation, this would connect to your AI service (like OpenAI, Anthropic, etc.) to provide intelligent assistance based on your design system context.`,
      timestamp: new Date()
    });

    isLoading.value = false;
    scrollToBottom();
  }, 1000);
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    scrollToBottom();
  }
});

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>

