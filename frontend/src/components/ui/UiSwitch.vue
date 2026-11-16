<template>
  <button
    type="button"
    role="switch"
    class="ui-switch"
    :aria-checked="modelValue"
    :aria-describedby="hint ? hintId : undefined"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="ui-switch-track" :class="{ 'ui-switch-on': modelValue }"><span class="ui-switch-thumb"></span></span>
    <span class="flex flex-col text-left">
      <span class="ui-switch-label"><slot>{{ label }}</slot></span>
      <span v-if="hint" :id="hintId" class="ui-switch-hint">{{ hint }}</span>
    </span>
  </button>
</template>

<script setup>
import { useId } from 'vue';

/** An on/off setting that takes effect immediately. For choices submitted with a form, use UiCheckbox. */
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
const hintId = `switch-${useId()}-hint`;
</script>

<style scoped>
.ui-switch {
  @apply inline-flex items-start gap-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus rounded-control;
}
/* Off: the control border (at least 3:1) outlines the track, so the switch can be seen and read as off (WCAG 1.4.11) */
.ui-switch-track {
  @apply relative mt-0.5 inline-flex shrink-0 w-9 h-5 rounded-pill border border-solid border-line-control bg-fill-strong transition-colors;
}
.ui-switch-on {
  @apply border-accent bg-accent;
}
.ui-switch-thumb {
  @apply absolute top-px left-px w-4 h-4 rounded-pill bg-surface-raised shadow-control transition-transform;
}
.ui-switch-on .ui-switch-thumb {
  @apply translate-x-4;
}
.ui-switch-label {
  @apply text-ink;
}
.ui-switch-hint {
  @apply text-xs text-ink-muted;
}
</style>
