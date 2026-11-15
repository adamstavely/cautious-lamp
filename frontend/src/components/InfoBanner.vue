<template>
  <div
    v-if="banners.length > 0"
    class="info-banners"
    :class="drawerOpen ? 'ml-drawer-closed sm:ml-drawer-open' : 'ml-drawer-closed'"
    aria-live="polite"
  >
    <UiCallout
      v-for="banner in banners"
      :key="banner.id"
      :tone="toneFor(banner.type)"
      :title="banner.title"
      :role="banner.type === 'error' ? 'alert' : 'status'"
    >
      {{ banner.message }}
      <template #actions>
        <button type="button" class="info-banner-dismiss" :aria-label="`Dismiss ${banner.title || 'banner'}`" @click="dismissBanner(banner.id)">
          <AppIcon name="x" />
        </button>
      </template>
    </UiCallout>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import apiClient from '../services/api.js';
import { useDrawer } from '../composables/useDrawer.js';
import { UiCallout } from './ui';

const banners = ref([]);
const dismissedBanners = ref(new Set());

// Pages sit beside the docs drawer, so the banners line up with them
const { drawerOpen } = useDrawer();

const toneFor = (type) => ({ error: 'danger', warning: 'warning', success: 'success' })[type] || 'info';

const fetchBanners = async () => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/banners?active=true`);
    banners.value = response.data.filter(banner => !dismissedBanners.value.has(banner.id));
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
};

const dismissBanner = (id) => {
  dismissedBanners.value.add(id);
  banners.value = banners.value.filter(banner => banner.id !== id);
  // Store dismissed banners in localStorage
  localStorage.setItem('dismissedBanners', JSON.stringify(Array.from(dismissedBanners.value)));
};

let interval = null;

onMounted(() => {
  // Load dismissed banners from localStorage
  try {
    const stored = localStorage.getItem('dismissedBanners');
    if (stored) dismissedBanners.value = new Set(JSON.parse(stored));
  } catch {
    // Unreadable storage: show every active banner
  }

  fetchBanners();

  // Refresh banners every 30 seconds
  interval = setInterval(fetchBanners, 30000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
.info-banners {
  @apply flex flex-col gap-3 px-4 pt-4 sm:px-8 transition-all duration-300;
}
.info-banner-dismiss {
  @apply -m-1 flex-shrink-0 self-start rounded p-1 text-ink-secondary transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
</style>
