<template>
  <svg
    class="ui-meter"
    :class="`ui-meter-${size}`"
    viewBox="0 0 100 4"
    preserveAspectRatio="none"
    :role="label ? 'meter' : undefined"
    :aria-label="label || undefined"
    :aria-valuenow="label ? clamped : undefined"
    :aria-valuemin="label ? 0 : undefined"
    :aria-valuemax="label ? max : undefined"
    :aria-valuetext="label ? valueText || undefined : undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <title v-if="markerLabel && hasMarker">{{ markerLabel }}</title>
    <rect class="fill-fill-strong" x="0" y="0" width="100" height="4" />
    <rect :class="toneClass" x="0" y="0" :width="percent" height="4" />
    <rect v-if="hasMarker" class="fill-ink-strong" :x="markerPercent - 0.4" y="0" width="0.8" height="4" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

/**
 * A thin bar for a value out of a maximum: a share, a score, a budget used.
 * The width comes from data, so it's an SVG attribute (no style binding).
 * With `label` it's announced as a meter (add `valueText` for how to read it);
 * without one it's decorative, so show the number beside it. `marker` draws a
 * tick at an earlier limit, such as an alert threshold.
 */
const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  tone: { type: String, default: 'accent', validator: (v) => ['accent', 'success', 'warning', 'danger', 'info', 'neutral'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  label: { type: String, default: '' },
  valueText: { type: String, default: '' },
  marker: { type: Number, default: null },
  markerLabel: { type: String, default: '' },
});

const clamped = computed(() => {
  const n = Number(props.value);
  return Number.isFinite(n) ? Math.max(0, Math.min(props.max, n)) : 0;
});
const percent = computed(() => (props.max > 0 ? (clamped.value / props.max) * 100 : 0));
const hasMarker = computed(() => props.marker !== null && props.marker > 0 && props.marker < props.max);
const markerPercent = computed(() => (props.max > 0 && props.marker !== null ? (props.marker / props.max) * 100 : 0));
const toneClass = computed(
  () =>
    ({
      accent: 'fill-accent',
      success: 'fill-success-solid',
      warning: 'fill-warning-solid',
      danger: 'fill-danger-solid',
      info: 'fill-info-solid',
      neutral: 'fill-chart-neutral',
    })[props.tone],
);
</script>

<style scoped>
.ui-meter {
  @apply block w-full rounded-pill overflow-hidden;
}
.ui-meter-sm {
  @apply h-1.5;
}
.ui-meter-md {
  @apply h-2;
}
.ui-meter-lg {
  @apply h-3;
}
</style>
