<template>
  <UiField :label="label" :hint="hint" group v-slot="{ labelId, describedBy }">
    <div
      class="ui-radios"
      :class="{ 'ui-radios-inline': inline }"
      role="radiogroup"
      :aria-labelledby="label ? labelId : undefined"
      :aria-label="label ? undefined : ariaLabel"
      :aria-describedby="describedBy"
    >
      <label v-for="option in normalized" :key="String(option.value)" class="ui-radio">
        <input
          type="radio"
          class="ui-radio-input"
          :name="name"
          :value="option.value"
          :checked="option.value === modelValue"
          :disabled="option.disabled"
          @change="$emit('update:modelValue', option.value)"
        />
        <span class="flex flex-col">
          <span class="ui-radio-label">{{ option.label }}</span>
          <span v-if="option.hint" class="ui-radio-hint">{{ option.hint }}</span>
        </span>
      </label>
    </div>
  </UiField>
</template>

<script setup>
import { computed, useId } from 'vue';
import UiField from './UiField.vue';

/**
 * One choice from a short list whose labels are too long for UiSegmented:
 * native radio buttons (arrow keys move between them) with a group label.
 * `options` are strings or { value, label, hint, disabled }. `inline` lays
 * them out in a row.
 */
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  /** Accessible name when there's no visible label */
  ariaLabel: { type: String, default: '' },
  inline: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);

const name = `radios-${useId()}`;
const normalized = computed(() => props.options.map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) })));
</script>

<style scoped>
.ui-radios {
  @apply flex flex-col gap-3;
}
.ui-radios-inline {
  @apply flex-row flex-wrap gap-x-6;
}
.ui-radio {
  @apply inline-flex items-start gap-2.5 cursor-pointer text-sm;
}
.ui-radio-input {
  @apply mt-0.5 w-4 h-4 shrink-0 accent-accent cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.ui-radio-input:disabled {
  @apply opacity-50 cursor-not-allowed;
}
.ui-radio-label {
  @apply text-ink;
}
.ui-radio-hint {
  @apply text-xs text-ink-muted;
}
</style>
