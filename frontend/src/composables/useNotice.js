import { ref, onBeforeUnmount } from 'vue';

/**
 * A short inline message for a page (shown with <InlineNotice>), used instead
 * of window.alert(). Success and info messages clear themselves; errors stay
 * until replaced or dismissed.
 */
export function useNotice() {
  const notice = ref(null);
  let timer = null;

  const clearNotice = () => {
    clearTimeout(timer);
    notice.value = null;
  };

  /** type: 'success' | 'error' | 'info' | 'warning' */
  const showNotice = (message, type = 'info') => {
    clearTimeout(timer);
    notice.value = { message, type };
    if (type === 'success' || type === 'info') {
      timer = setTimeout(clearNotice, 5000);
    }
  };

  onBeforeUnmount(() => clearTimeout(timer));

  return { notice, showNotice, clearNotice };
}
