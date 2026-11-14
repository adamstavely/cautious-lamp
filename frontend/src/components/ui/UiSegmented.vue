<template>
  <UiField :label="label" :hint="hint" group v-slot="{ labelId, describedBy }">
    <div class="ui-segmented" role="radiogroup" :aria-labelledby="label ? labelId : undefined" :aria-label="label ? undefined : ariaLabel" :aria-describedby="describedBy">
      <button
        v-for="(option, index) in normalized"
        :key="String(option.value)"
        ref="buttons"
        type="button"
        role="radio"
        class="ui-segment"
        :class="{ 'ui-segment-on': option.value === modelValue }"
        :aria-checked="option.value === modelValue"
        :aria-label="option.srLabel || undefined"
        :disabled="option.disabled"
        :tabindex="option.value === modelValue || (!hasSelection && index === firstEnabled) ? 0 : -1"
        @click="select(option.value)"
        @keydown="onKey($event, index)"
      >
        <span v-if="option.icon" class="material-symbols-outlined text-base" aria-hidden="true">{{ option.icon }}</span>
        {{ option.label }}
      </button>
    </div>
  </UiField>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import UiField from './UiField.vue';

/**
 * One choice from a few short options, shown as round toggles (a radio group).
 * `options` are strings or { value, label, icon, disabled, srLabel } — srLabel
 * is a fuller name for assistive technology when the visible label is terse
 * (a "4" on a rating scale: "4, agree").
 */
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  /** Accessible name when there's no visible label */
  ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const buttons = ref([]);

const normalized = computed(() => props.options.map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) })));
const hasSelection = computed(() => normalized.value.some((o) => o.value === props.modelValue));

const select = (value) => emit('update:modelValue', value);

const firstEnabled = computed(() => Math.max(0, normalized.value.findIndex((o) => !o.disabled)));

const onKey = async (event, index) => {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  const count = normalized.value.length;
  // Skip disabled options; stop if every other option is disabled
  let next = index;
  for (let i = 0; i < count; i++) {
    next = (next + step + count) % count;
    if (!normalized.value[next].disabled) break;
  }
  if (next === index || normalized.value[next].disabled) return;
  select(normalized.value[next].value);
  await nextTick();
  buttons.value[next]?.focus();
};
</script>

<style scoped>
.ui-segmented {
  @apply inline-flex flex-wrap gap-1 p-1 rounded-pill bg-fill;
}
.ui-segment {
  @apply inline-flex items-center gap-1.5 h-8 px-3.5 rounded-pill text-sm font-medium text-ink-secondary transition-colors hover:text-ink;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 outline-focus;
  @apply disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-ink-secondary;
}
.ui-segment-on {
  @apply bg-surface-raised text-ink-strong shadow-control;
}
</style>
