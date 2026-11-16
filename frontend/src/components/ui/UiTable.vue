<template>
  <!-- While the table is wider than its box, the box is a named, focusable region so keyboard users can scroll it -->
  <div
    ref="wrap"
    class="ui-table-wrap"
    :class="{ 'ui-table-bordered': bordered }"
    :tabindex="scrollable ? 0 : undefined"
    :role="scrollable ? 'region' : undefined"
    :aria-label="scrollable ? caption : undefined"
  >
    <table ref="table" class="ui-table" :class="{ 'ui-table-compact': compact }">
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <slot />
    </table>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Styles a native table: write <thead>/<tbody>/<tr>/<th scope>/<td> inside.
 * `caption` names it for assistive technology. Put it in a flush UiPanel, or
 * set `bordered` when it stands alone. Wide tables scroll sideways.
 */
defineProps({
  caption: { type: String, required: true },
  bordered: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
});

const wrap = ref(null);
const table = ref(null);
const scrollable = ref(false);
let observer = null;
const measure = () => {
  if (wrap.value) scrollable.value = wrap.value.scrollWidth > wrap.value.clientWidth + 1;
};
onMounted(() => {
  measure();
  if (typeof ResizeObserver === 'undefined') return;
  observer = new ResizeObserver(measure);
  observer.observe(wrap.value);
  if (table.value) observer.observe(table.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.ui-table-wrap {
  @apply w-full overflow-x-auto;
}
.ui-table-bordered {
  @apply rounded-card border border-line bg-surface-raised;
}
.ui-table {
  @apply w-full text-sm text-left;
}
.ui-table :deep(th) {
  @apply px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted bg-surface-sunken border-b border-line whitespace-nowrap;
}
/* Row headers (th scope="row") read like cells, in a stronger weight */
.ui-table :deep(tbody th) {
  @apply px-6 py-4 text-sm font-medium normal-case tracking-normal text-ink-strong bg-transparent border-b border-line-faint whitespace-normal;
}
.ui-table :deep(td) {
  @apply px-6 py-4 text-ink border-b border-line-faint align-middle;
}
.ui-table :deep(tbody tr:last-child td),
.ui-table :deep(tbody tr:last-child th) {
  @apply border-b-0;
}
.ui-table :deep(tbody tr:hover) {
  @apply bg-fill-hover;
}
.ui-table-compact :deep(th),
.ui-table-compact :deep(tbody th),
.ui-table-compact :deep(td) {
  @apply px-4 py-2;
}
</style>
