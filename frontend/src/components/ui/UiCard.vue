<template>
  <component :is="tag" v-bind="linkAttrs" class="ui-card group" :class="{ 'ui-card-link': isLink, 'ui-card-compact': compact }">
    <SpotArt v-if="spot" :name="spot" :size="compact ? 'sm' : 'md'" class="-ml-1 mb-2" />
    <slot name="media" />
    <h3 v-if="title" class="ui-card-title">
      {{ title }}
      <span v-if="isLink" class="material-symbols-outlined ui-card-arrow" aria-hidden="true">{{ external ? 'open_in_new' : 'arrow_forward' }}</span>
    </h3>
    <div v-if="$slots.default" class="ui-card-body"><slot /></div>
    <div v-if="$slots.footer" class="ui-card-footer"><slot name="footer" /></div>
  </component>
</template>

<script setup>
import { computed } from 'vue';
import SpotArt from './SpotArt.vue';

/**
 * A card: optional spot illustration, a title and a short body. With `to` or
 * `href` the whole card is one link (keep other links and buttons out of it).
 */
const props = defineProps({
  title: { type: String, default: '' },
  spot: { type: String, default: '' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  external: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
});

const isLink = computed(() => !!(props.to || props.href));
const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'div'));
const linkAttrs = computed(() => {
  if (props.to) return { to: props.to };
  if (props.href) return { href: props.href, target: props.external ? '_blank' : undefined, rel: props.external ? 'noopener noreferrer' : undefined };
  return {};
});
</script>

<style scoped>
.ui-card {
  @apply flex flex-col rounded-card border border-line bg-surface-raised p-6 transition-all;
}
.ui-card-compact {
  @apply p-5;
}
.ui-card-link {
  @apply hover:border-accent-border hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.ui-card-title {
  @apply flex items-center gap-1.5 mb-1.5 text-lg font-semibold text-ink-strong;
}
.ui-card-arrow {
  @apply text-base text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-text;
}
.ui-card-body {
  @apply text-sm leading-relaxed text-ink-secondary;
}
.ui-card-footer {
  @apply mt-4 pt-4 border-t border-line flex flex-wrap items-center gap-2 text-sm text-ink-secondary;
}
</style>
