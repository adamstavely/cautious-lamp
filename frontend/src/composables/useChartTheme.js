import { nextTick, onMounted, ref, watch } from 'vue';
import { useDarkMode } from './useDarkMode.js';

/**
 * Design-token colours resolved to concrete values, for charts drawn on a
 * <canvas> (Chart.js) or rasterised (html2canvas), which can't use CSS
 * variables or classes. SVG charts should use token classes
 * (fill-chart-neutral, fill-ink-muted…) instead.
 *
 * Each token is read from a hidden probe element styled with its Tailwind
 * class, so light-dark() tokens come back resolved for the current theme;
 * the values are read again whenever the theme changes.
 */
const TOKEN_CLASSES = {
  /** Axis ticks, legend and axis titles */
  text: 'text-ink-secondary',
  /** Chart title */
  title: 'text-ink-strong',
  /** Gridlines */
  grid: 'text-line-faint',
  /** Tooltip background and border */
  tooltip: 'text-surface-overlay',
  border: 'text-line',
  /** The surface the chart sits on (contrast checks, image exports) */
  surface: 'text-surface-raised',
  /** Unfilled parts of a chart, e.g. a gauge's remaining track */
  neutral: 'text-chart-neutral',
};

// Used until the page mounts, and where the browser can't compute styles (tests)
const FALLBACK = {
  text: 'rgb(71, 85, 105)',
  title: 'rgb(15, 23, 42)',
  grid: 'rgba(0, 0, 0, 0.1)',
  tooltip: 'rgb(255, 255, 255)',
  border: 'rgba(0, 0, 0, 0.2)',
  surface: 'rgb(255, 255, 255)',
  neutral: 'rgb(209, 213, 219)',
};

/** rgb()/rgba() → #rrggbb (alpha dropped), for helpers that only take hex */
export function rgbToHex(value) {
  const match = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(String(value || ''));
  if (!match) return value;
  return `#${match.slice(1, 4).map((n) => Math.round(Number(n)).toString(16).padStart(2, '0')).join('')}`;
}

export function useChartTheme() {
  const theme = ref({ ...FALLBACK });
  const darkClass = useDarkMode();

  const resolve = () => {
    if (typeof document === 'undefined' || !document.body) return;
    const probe = document.createElement('span');
    probe.hidden = true;
    probe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(probe);
    const next = {};
    for (const [key, className] of Object.entries(TOKEN_CLASSES)) {
      probe.className = className;
      next[key] = window.getComputedStyle(probe).color || FALLBACK[key];
    }
    probe.remove();
    theme.value = next;
  };

  onMounted(resolve);
  watch(darkClass, () => nextTick(resolve));

  return theme;
}
