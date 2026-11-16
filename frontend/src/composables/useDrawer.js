import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { mediaMatches } from './useMediaQuery.js';
import { PHONE_QUERY } from '../navigation.js';

// Shared drawer state across all views
const globalDrawerOpen = ref(false);
const shouldAutoOpen = ref(false);

export function useDrawer() {
  const route = useRoute();

  // Auto-open drawer when navigating from sidebar
  watch(() => route.path, (newPath) => {
    // Check if we should auto-open (set by sidebar click)
    // On phones the drawer covers the page, so it never opens by itself there
    if (shouldAutoOpen.value) {
      if (!mediaMatches(PHONE_QUERY)) globalDrawerOpen.value = true;
      shouldAutoOpen.value = false; // Reset after opening
    }
  }, { immediate: true });

  return {
    drawerOpen: globalDrawerOpen,
    shouldAutoOpen,
    openDrawer: () => {
      globalDrawerOpen.value = true;
    },
    closeDrawer: () => {
      globalDrawerOpen.value = false;
    },
    toggleDrawer: () => {
      globalDrawerOpen.value = !globalDrawerOpen.value;
    },
  };
}

