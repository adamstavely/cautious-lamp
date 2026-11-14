import { onBeforeUnmount, onMounted, shallowRef } from 'vue';

/**
 * The map colour tokens (--app-seq-*, --app-div-*, --app-cat-* in
 * src/styles/tokens.css) resolved to real colours for the current theme. SVG
 * fills that come from data need actual values, and the tokens are
 * light-dark() pairs, so each is resolved through a hidden probe element and
 * read back with getComputedStyle. Read again whenever the app switches theme
 * (it toggles .dark on <html>).
 */

export const SEQUENTIAL = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
];
export const DIVERGING = [
  { value: 'blue-red', label: 'Blue to red' },
  { value: 'purple-orange', label: 'Purple to orange' },
];
export const STEPS = 7;
export const CATEGORY_SLOTS = 3;

const ramp = (prefix) => Array.from({ length: STEPS }, (_, i) => `--app-${prefix}-${i + 1}`);

function readPalette() {
  if (typeof document === 'undefined' || !document.body) return null;
  const probe = document.createElement('span');
  probe.hidden = true;
  document.body.appendChild(probe);
  const resolve = (token) => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
  };
  try {
    return {
      sequential: Object.fromEntries(SEQUENTIAL.map(({ value }) => [value, ramp(`seq-${value}`).map(resolve)])),
      diverging: Object.fromEntries(DIVERGING.map(({ value }) => [value, ramp(`div-${value}`).map(resolve)])),
      categorical: Array.from({ length: CATEGORY_SLOTS }, (_, i) => resolve(`--app-cat-${i + 1}`)),
      neutral: resolve('--tc-chart-neutral'),
    };
  } finally {
    probe.remove();
  }
}

/** @returns {import('vue').ShallowRef<ReturnType<typeof readPalette>>} */
export function useMapPalette() {
  const palette = shallowRef(readPalette());
  let observer = null;
  onMounted(() => {
    palette.value = readPalette();
    if (typeof MutationObserver === 'undefined') return;
    observer = new MutationObserver(() => {
      palette.value = readPalette();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-tc-look'] });
  });
  onBeforeUnmount(() => observer?.disconnect());
  return palette;
}
