import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Whether the app is in dark mode, kept in sync with the `dark` class on <html>.
 * One MutationObserver per component, disconnected on unmount. Replaces the
 * old pattern of an observer plus a 100ms setInterval in every view.
 */
export function useDarkMode() {
  const isDarkMode = ref(document.documentElement.classList.contains('dark'));
  let observer = null;

  onMounted(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
    observer = new MutationObserver(() => {
      isDarkMode.value = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return isDarkMode;
}
