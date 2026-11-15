<template>
  <component :is="icon" v-if="icon" class="app-icon" :size="size" :stroke-width="strokeWidth" :aria-hidden="labelled ? undefined : 'true'" focusable="false" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import { ICONS, LEGACY_NAMES } from './icons.js';

/**
 * A Lucide icon by name, e.g. <AppIcon name="arrow-right" />. Sized by the
 * surrounding font size (1em) unless `size` is set, and coloured by
 * currentColor. Decorative and hidden from assistive technology unless it is
 * given an aria-label (with role="img") as the only thing saying what it means.
 */
const props = defineProps({
  /** A key of ICONS in ./icons.js (Lucide's kebab-case name) */
  name: { type: String, required: true },
  size: { type: [String, Number], default: '1em' },
  strokeWidth: { type: [String, Number], default: 2 },
});

const attrs = useAttrs();
const labelled = computed(() => !!attrs['aria-label']);

const icon = computed(() => {
  const found = ICONS[props.name] ?? ICONS[LEGACY_NAMES[props.name]];
  if (!found && import.meta.env.DEV) console.warn(`AppIcon: no icon "${props.name}" in components/ui/icons.js`);
  return found ?? null;
});
</script>

<style>
/* 24px unless a text size class says otherwise (:where keeps this weaker than any class) */
:where(.app-icon) {
  font-size: 1.5rem;
}
</style>

<style scoped>
.app-icon {
  @apply inline-block shrink-0;
  /* Sit on the text baseline like a glyph */
  vertical-align: -0.125em;
}
</style>
