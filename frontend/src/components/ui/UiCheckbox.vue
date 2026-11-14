<template>
  <label class="ui-check" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
    <input
      type="checkbox"
      class="ui-check-box"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      :aria-describedby="hint ? hintId : undefined"
      @change="onChange"
    />
    <span class="flex flex-col">
      <span class="ui-check-label"><slot>{{ label }}</slot></span>
      <span v-if="hint" :id="hintId" class="ui-check-hint">{{ hint }}</span>
    </span>
  </label>
</template>

<script setup>
import { computed, useId } from 'vue';

/** A checkbox with its label. v-model is a boolean, or an array when `value` is set (a group of checkboxes sharing one array). */
const props = defineProps({
  modelValue: { type: [Boolean, Array], default: false },
  value: { type: [String, Number], default: undefined },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const hintId = `check-${useId()}-hint`;

const isChecked = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.includes(props.value) : props.modelValue));

const onChange = (event) => {
  if (Array.isArray(props.modelValue)) {
    const next = props.modelValue.filter((v) => v !== props.value);
    emit('update:modelValue', event.target.checked ? [...next, props.value] : next);
  } else {
    emit('update:modelValue', event.target.checked);
  }
};
</script>

<style scoped>
.ui-check {
  @apply inline-flex items-start gap-2.5 cursor-pointer text-sm;
}
.ui-check-box {
  @apply mt-0.5 w-4 h-4 shrink-0 accent-accent cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.ui-check-label {
  @apply text-ink;
}
.ui-check-hint {
  @apply text-xs text-ink-muted;
}
</style>
