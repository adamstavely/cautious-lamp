import { ref, onMounted } from 'vue';

/**
 * Composable to handle auto-opening drawer when navigating from sidebar
 * Call this in onMounted to check if drawer should auto-open
 */
export function useAutoOpenDrawer() {
  const drawerOpen = ref(false);

  const checkAndOpenDrawer = () => {
    // Check if we should auto-open drawer (set by sidebar click)
    if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
      drawerOpen.value = true;
      sessionStorage.removeItem('openDrawerOnLoad');
    }
  };

  // Call this in onMounted
  onMounted(() => {
    checkAndOpenDrawer();
  });

  return {
    drawerOpen,
    checkAndOpenDrawer,
  };
}

