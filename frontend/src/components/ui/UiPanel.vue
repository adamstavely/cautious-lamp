<template>
  <section class="ui-panel" :aria-labelledby="title ? headingId : undefined">
    <div v-if="title || $slots.actions" class="ui-panel-head">
      <div class="min-w-0">
        <component :is="headingTag" v-if="title" :id="headingId" class="ui-panel-title">{{ title }}</component>
        <p v-if="description" class="ui-panel-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2"><slot name="actions" /></div>
    </div>
    <div class="ui-panel-body" :class="{ 'ui-panel-body-flush': flush }"><slot /></div>
    <div v-if="$slots.footer" class="ui-panel-foot"><slot name="footer" /></div>
  </section>
</template>

<script setup>
import { useId } from 'vue';

/**
 * A flat bordered container: forms, tool controls, previews, tables. `flush`
 * removes the body padding (tables, lists that run edge to edge).
 */
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  headingTag: { type: String, default: 'h2' },
  flush: { type: Boolean, default: false },
});

const headingId = useId();
</script>

<style scoped>
.ui-panel {
  @apply flex flex-col rounded-card border border-line bg-surface-raised overflow-hidden;
}
.ui-panel-head {
  @apply flex flex-wrap items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-line;
}
.ui-panel-title {
  @apply text-lg font-semibold text-ink-strong;
}
.ui-panel-description {
  @apply mt-1 text-sm text-ink-secondary;
}
.ui-panel-body {
  @apply flex-1 flex flex-col gap-5 p-6;
}
.ui-panel-body-flush {
  @apply p-0 gap-0;
}
.ui-panel-foot {
  @apply flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-line bg-surface-sunken text-xs text-ink-muted;
}
</style>
