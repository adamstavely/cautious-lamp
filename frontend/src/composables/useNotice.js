import { ref } from 'vue';

/**
 * A short inline message for a page (shown with <InlineNotice>), used instead
 * of window.alert(). A message stays until it is dismissed, replaced by the
 * next one, or the page is left: one that cleared itself after a few seconds
 * could vanish before someone had read it (WCAG 2.2.1).
 */
export function useNotice() {
  const notice = ref(null);

  const clearNotice = () => {
    notice.value = null;
  };

  /** type: 'success' | 'error' | 'info' | 'warning' */
  const showNotice = (message, type = 'info') => {
    notice.value = { message, type };
  };

  return { notice, showNotice, clearNotice };
}
