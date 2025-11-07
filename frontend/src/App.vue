<template>
  <v-app>
    <!-- Skip Links for Keyboard Navigation - WCAG 2.1 AA -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>
    
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      <div class="flex flex-1 min-h-0">
        <Sidebar />
        <div class="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <main id="main-content" class="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" role="main">
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

