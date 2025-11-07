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
      role="dialog"
      aria-modal="true"
      aria-labelledby="eero-chat-title"
    >
      <!-- Header -->
      <div class="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-lg" aria-hidden="true">psychology</span>
          </div>
          <div>
            <h3 id="eero-chat-title" class="font-semibold text-sm">Eero</h3>
            <p class="text-xs text-white/80">Design System AI Assistant</p>
          </div>
        </div>
        <button
          @click="close"
          class="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close chat"
        >
          <span class="material-symbols-outlined text-lg" aria-hidden="true">close</span>
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
            <div class="text-sm whitespace-pre-wrap" v-html="formatMessage(message.content)"></div>
            <p class="text-xs mt-1 opacity-70">
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
        
        <!-- Suggestions -->
        <div v-if="currentSuggestions && currentSuggestions.length > 0" class="space-y-2">
          <p class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            Suggested questions:
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(suggestion, idx) in currentSuggestions"
              :key="idx"
              @click="sendSuggestion(suggestion)"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
        
        <!-- Related Links -->
        <div v-if="relatedComponents.length > 0 || relatedTokens.length > 0" class="space-y-2 pt-2 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <p class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            Related:
          </p>
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="componentId in relatedComponents"
              :key="`component-${componentId}`"
              :to="`/components/${componentId}`"
              @click="close"
              class="px-3 py-1.5 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {{ componentId }}
            </router-link>
            <router-link
              v-for="tokenName in relatedTokens"
              :key="`token-${tokenName}`"
              :to="`/tokens?search=${encodeURIComponent(tokenName)}`"
              @click="close"
              class="px-3 py-1.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {{ tokenName }}
            </router-link>
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
            placeholder="Ask Eero about components, tokens, or compliance..."
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
            :disabled="isLoading"
            aria-label="Type your question"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isLoading"
            class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <span class="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const inputMessage = ref('');
const messages = ref([
  {
    role: 'assistant',
    content: "Hi! I'm **Eero**, your Design System AI Assistant. I can help you with:\n\n• **Components** - Find and learn about design system components\n• **Design Tokens** - Discover colors, spacing, typography, and more\n• **Compliance** - Understand rules and scan applications\n• **Best Practices** - Get guidance on UX/HCD and accessibility\n\nWhat would you like to know?",
    timestamp: new Date()
  }
]);
const isLoading = ref(false);
const messagesRef = ref(null);
const currentSuggestions = ref([]);
const relatedComponents = ref([]);
const relatedTokens = ref([]);

const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

const close = () => {
  emit('close');
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessage = (content) => {
  // Convert markdown-style formatting to HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/\n/g, '<br>');
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

const sendSuggestion = (suggestion) => {
  inputMessage.value = suggestion;
  sendMessage();
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage = inputMessage.value.trim();
  inputMessage.value = '';
  currentSuggestions.value = [];
  relatedComponents.value = [];
  relatedTokens.value = [];

  // Add user message
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  await scrollToBottom();

  // Call AI API
  isLoading.value = true;
  
  try {
    // Build conversation history
    const conversationHistory = messages.value
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const response = await axios.post(
      `${API_BASE_URL}/ai/chat`,
      {
        message: userMessage,
        conversationHistory: conversationHistory.slice(-10) // Last 10 messages for context
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    // Add AI response
    messages.value.push({
      role: 'assistant',
      content: response.data.response,
      timestamp: new Date()
    });

    // Update suggestions and related items
    if (response.data.suggestions) {
      currentSuggestions.value = response.data.suggestions;
    }
    if (response.data.relatedComponents) {
      relatedComponents.value = response.data.relatedComponents;
    }
    if (response.data.relatedTokens) {
      relatedTokens.value = response.data.relatedTokens;
    }

  } catch (error) {
    console.error('Error calling AI API:', error);
    messages.value.push({
      role: 'assistant',
      content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
      timestamp: new Date()
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// Handle Escape key to close
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    scrollToBottom();
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('keydown', handleEscape);
  }
});

onMounted(() => {
  scrollToBottom();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
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

