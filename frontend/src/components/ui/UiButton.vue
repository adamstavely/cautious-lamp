<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    class="ui-button"
    :class="[`ui-button-${variant}`, `ui-button-${size}`, { 'ui-button-icon-only': iconOnly }]"
    :aria-label="iconOnly ? label : undefined"
    :title="iconOnly ? label : undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="material-symbols-outlined ui-button-icon animate-spin" aria-hidden="true">progress_activity</span>
    <span v-else-if="icon" class="material-symbols-outlined ui-button-icon" aria-hidden="true">{{ icon }}</span>
    <span v-if="!iconOnly"><slot>{{ label }}</slot></span>
    <span v-if="trailingIcon && !iconOnly" class="material-symbols-outlined ui-button-icon" aria-hidden="true">{{ trailingIcon }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue';

/**
 * A pill button, or a link styled as one (`to` for app routes, `href` for
 * anything else). primary: the main action on a page or panel (one per area);
 * secondary: other actions; ghost: low-emphasis and toolbar actions; danger:
 * destructive actions.
 */
const props = defineProps({
  variant: { type: String, default: 'secondary', validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) },
  /** Material Symbols name shown before the label */
  icon: { type: String, default: '' },
  trailingIcon: { type: String, default: '' },
  /** Text when there's no slot; required with `iconOnly`, where it becomes the accessible name */
  label: { type: String, default: '' },
  iconOnly: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const tag = computed(() => (props.to ? 'router-link' : props.href ? 'a' : 'button'));
const linkAttrs = computed(() => {
  if (props.to) return { to: props.to };
  if (props.href) return { href: props.href };
  return { type: props.type, disabled: props.disabled || props.loading };
});
</script>

<style scoped>
.ui-button {
  @apply inline-flex items-center justify-center gap-2 rounded-pill border border-solid font-medium whitespace-nowrap transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.ui-button-md {
  @apply h-11 px-5 text-sm;
}
.ui-button-sm {
  @apply h-8 px-3.5 text-sm;
}
.ui-button-icon-only.ui-button-md {
  @apply w-11 px-0;
}
.ui-button-icon-only.ui-button-sm {
  @apply w-8 px-0;
}
.ui-button-icon {
  @apply text-lg leading-none;
}
.ui-button-primary {
  @apply border-transparent bg-accent text-ink-on-accent enabled:hover:bg-accent-hover;
}
a.ui-button-primary:hover {
  @apply bg-accent-hover;
}
.ui-button-secondary {
  @apply border-line bg-surface-control text-ink enabled:hover:border-line-control-hover enabled:hover:bg-fill-hover;
}
a.ui-button-secondary:hover {
  @apply border-line-control-hover bg-fill-hover;
}
.ui-button-ghost {
  @apply border-transparent bg-transparent text-ink-secondary enabled:hover:bg-fill enabled:hover:text-ink;
}
a.ui-button-ghost:hover {
  @apply bg-fill text-ink;
}
.ui-button-danger {
  @apply border-danger-border bg-danger-bg text-danger enabled:hover:border-danger-solid;
}
</style>
