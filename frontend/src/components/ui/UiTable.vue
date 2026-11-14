<template>
  <div class="ui-table-wrap" :class="{ 'ui-table-bordered': bordered }">
    <table class="ui-table" :class="{ 'ui-table-compact': compact }">
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <slot />
    </table>
  </div>
</template>

<script setup>
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
