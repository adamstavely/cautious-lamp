<template>
  <UiField :label="label" :hint="hint" :id="id">
    <template #label-aside="{ id: controlId }">
      <output :for="controlId" class="ui-range-value">{{ display }}</output>
    </template>
    <template #default="{ id: controlId, describedBy }">
      <input
        :id="controlId"
        type="range"
        class="ui-range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :aria-describedby="describedBy"
        :aria-valuetext="display"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />
    </template>
  </UiField>
</template>

<script setup>
import { computed } from 'vue';
import UiField from './UiField.vue';

/** A slider with its label and current value; `unit` is appended to the value shown */
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  unit: { type: String, default: '' },
  id: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
const display = computed(() => `${props.modelValue}${props.unit}`);
</script>

<style scoped>
.ui-range-value {
  @apply text-sm tabular-nums text-ink-secondary;
}
.ui-range {
  @apply w-full h-2 rounded-pill bg-fill-strong appearance-none cursor-pointer accent-accent;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 outline-focus;
}
.ui-range::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 rounded-pill bg-accent border-2 border-solid border-surface-raised shadow-control;
}
.ui-range::-moz-range-thumb {
  @apply w-4 h-4 rounded-pill bg-accent border-2 border-solid border-surface-raised shadow-control;
}
</style>
