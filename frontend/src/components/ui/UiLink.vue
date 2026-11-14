<template>
  <component :is="to ? 'router-link' : 'a'" v-bind="to ? { to } : { href, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined }" class="ui-link group">
    <slot />
    <span v-if="arrow || external" class="material-symbols-outlined ui-link-arrow" aria-hidden="true">{{ external ? 'open_in_new' : 'arrow_forward' }}</span>
    <span v-if="external" class="sr-only">(opens in a new tab)</span>
  </component>
</template>

<script setup>
/** A text link in the accent colour; `arrow` adds a forward arrow, `external` opens a new tab and says so. */
defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  arrow: { type: Boolean, default: false },
  external: { type: Boolean, default: false },
});
</script>

<style scoped>
.ui-link {
  @apply inline-flex items-center gap-1 text-sm font-medium text-accent-text hover:underline underline-offset-4;
}
.ui-link-arrow {
  @apply text-base transition-transform group-hover:translate-x-0.5;
}
</style>
