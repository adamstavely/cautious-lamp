<template>
  <div class="app-root">
    <!-- Skip Links for Keyboard Navigation - WCAG 2.1 AA -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <!-- The side nav is a menu on phones, opened from the top bar -->
    <a v-if="!bare" href="#navigation" class="skip-link hidden sm:block">Skip to navigation</a>

    <!-- Sign-in screens: no app chrome, and nothing that calls the API -->
    <main v-if="bare" id="main-content" class="min-h-screen bg-surface" role="main">
      <router-view :key="$route.path" />
    </main>

    <div v-else class="min-h-screen bg-surface flex flex-col">
      <div class="flex flex-1 min-h-0">
        <Sidebar />
        <div class="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <PhoneNav />
          <InfoBanner />
          <main id="main-content" class="flex-1 min-w-0 overflow-auto bg-surface" role="main">
            <router-view :key="$route.path" />
          </main>
        </div>
      </div>
      
      <!-- Eero, the AI assistant: a chat panel with its own corner launcher -->
      <EeroChatbot v-if="aiAssistantEnabled" v-model:open="chatOpen" />
      
      <!-- Loupe Tool (now includes breakpoint overlay features) -->
      <LoupeTool v-if="loupeToolEnabled" />
      
      <!-- Toast Notifications -->
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PhoneNav from './components/PhoneNav.vue';
import Sidebar from './components/Sidebar.vue';
import TopNav from './components/TopNav.vue';
import InfoBanner from './components/InfoBanner.vue';
import EeroChatbot from './components/EeroChatbot.vue';
import LoupeTool from './components/LoupeTool.vue';
import Toast from './components/Toast.vue';
import { useFeatureFlag } from './composables/useFeatureFlags';
import { useAuth } from './composables/useAuth.js';

const route = useRoute();
const router = useRouter();
const chatOpen = ref(false);
const { isSignedIn } = useAuth();

// Sign-in screens (and any moment without a signed-in user) render without the chrome
const bare = computed(() => !!route.meta.bare || !isSignedIn.value);

// The RBAC guard sends people without a permission home with ?unauthorized=<permission>
watch(() => route.query.unauthorized, (permission) => {
  if (!permission) return;
  // nextTick: on first load the Toast component mounts after this runs
  nextTick(() => window.showToast?.("You don't have access to this.", 'warning', 5000));
  const { unauthorized, ...rest } = route.query;
  router.replace({ query: rest });
}, { immediate: true });
const { isEnabled: aiAssistantEnabled } = useFeatureFlag('ai-assistant', false);
const { isEnabled: loupeToolEnabled } = useFeatureFlag('component-loupe', false);

// Handle featureDisabled query parameter
watch(() => route.query.featureDisabled, (featureKey) => {
  if (featureKey) {
    // Refresh feature flag cache and try to enable the feature
    if (window.OpenFeature) {
      window.OpenFeature.refreshCache({ force: true }).then(() => {
        // Show notification using window.showToast (exposed by Toast component)
        if (window.showToast) {
          window.showToast(
            `The feature "${featureKey}" is currently disabled. Please contact an administrator to enable it.`,
            'warning',
            5000
          );
        }
        
        // Remove the query parameter after showing the message
        router.replace({ query: {} });
      });
    } else {
      if (window.showToast) {
        window.showToast(
          `The feature "${featureKey}" is currently disabled.`,
          'warning',
          5000
        );
      }
      router.replace({ query: {} });
    }
  }
}, { immediate: true });

// Listen for custom event from TopNav to open chat
const handleOpenChatEvent = () => {
  if (aiAssistantEnabled.value) {
    chatOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('open-eero-chat', handleOpenChatEvent);
  
  // Refresh feature flags cache on mount to ensure we have latest values
  if (window.OpenFeature) {
    window.OpenFeature.refreshCache().catch(err => {
      console.warn('Failed to refresh feature flags cache:', err);
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('open-eero-chat', handleOpenChatEvent);
});
</script>

