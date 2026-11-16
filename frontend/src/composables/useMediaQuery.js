import { onBeforeUnmount, onMounted, ref } from 'vue';

/** Whether a media query matches, kept up to date while the component is mounted */
export function useMediaQuery(query) {
  const list = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null;
  const matches = ref(!!list?.matches);
  const update = (event) => {
    matches.value = event.matches;
  };
  onMounted(() => {
    if (!list) return;
    matches.value = list.matches;
    list.addEventListener('change', update);
  });
  onBeforeUnmount(() => list?.removeEventListener('change', update));
  return matches;
}

/** Whether a media query matches right now (for code outside components) */
export const mediaMatches = (query) => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
