import { ref, watch } from 'vue';

/**
 * The light/dark theme, shared by the side nav and the phone menu. main.js
 * applies the saved (or system) theme before the app renders; this keeps the
 * `dark` class on <html> and the saved choice in step with the toggle, and
 * follows the system while nothing has been saved.
 */
const initial = () => {
  if (document.documentElement.classList.contains('dark')) return true;
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

let darkTheme;

function setup() {
  darkTheme = ref(initial());
  const apply = () => document.documentElement.classList.toggle('dark', darkTheme.value);
  apply();
  watch(darkTheme, () => {
    apply();
    localStorage.setItem('darkMode', String(darkTheme.value));
  });
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (localStorage.getItem('darkMode') === null) darkTheme.value = event.matches;
  });
}

export function useTheme() {
  if (!darkTheme) setup();
  return {
    darkTheme,
    toggleDarkMode: () => {
      darkTheme.value = !darkTheme.value;
    },
  };
}
