<template>
  <section class="page-section" :class="{ 'page-section-divided': divided }" :aria-labelledby="title ? headingId : undefined">
    <div v-if="title || $slots.actions" class="page-section-head" :class="{ 'page-section-head-split': $slots.actions }">
      <div>
        <h2 v-if="title" :id="headingId" class="page-section-title">{{ title }}</h2>
        <p v-if="description" class="page-section-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap gap-3"><slot name="actions" /></div>
    </div>
    <slot />
  </section>
</template>

<script setup>
import { useId } from 'vue';

/** A page section: a heading with one line of context, optional actions, and content. Sections after the first are `divided`. */
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  /** A hairline above the section; use on every section after the first */
  divided: { type: Boolean, default: false },
});

const headingId = useId();
</script>

<style scoped>
.page-section {
  @apply py-14 md:py-16;
}
.page-section-divided {
  @apply border-t border-line;
}
.page-section-head {
  @apply flex flex-col gap-4 mb-8;
}
.page-section-head-split {
  @apply sm:flex-row sm:items-end sm:justify-between;
}
.page-section-title {
  @apply text-2xl md:text-3xl font-semibold tracking-tight text-ink-strong;
}
.page-section-description {
  @apply mt-1 text-ink-secondary;
}
</style>
