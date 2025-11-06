<template>
  <v-app>
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 flex flex-col">
      <div class="flex flex-1 min-h-0">
        <Sidebar />
        <div class="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <main class="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900">
            <router-view :key="$route.path" />
          </main>
        </div>
      </div>
      
      <!-- Floating Action Button and Chatbot -->
      <FloatingActionButton :isChatOpen="chatOpen" @toggle-chat="handleToggleChat" />
      <EeroChatbot :isOpen="chatOpen" @close="handleCloseChat" />
    </div>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from './components/Sidebar.vue';
import TopNav from './components/TopNav.vue';
import FloatingActionButton from './components/FloatingActionButton.vue';
import EeroChatbot from './components/EeroChatbot.vue';

const chatOpen = ref(false);

const handleToggleChat = () => {
  chatOpen.value = !chatOpen.value;
};

const handleCloseChat = () => {
  chatOpen.value = false;
};

// Listen for custom event from TopNav to open chat
const handleOpenChatEvent = () => {
  chatOpen.value = true;
};

onMounted(() => {
  window.addEventListener('open-eero-chat', handleOpenChatEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener('open-eero-chat', handleOpenChatEvent);
});
</script>

