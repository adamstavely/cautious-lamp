<template>
  <UiField :label="label" :hint="hint" :error="error" :required="required" :id="id" v-slot="{ id: controlId, describedBy, invalid }">
    <div class="ui-input-wrap">
      <span v-if="icon" class="material-symbols-outlined ui-input-icon" aria-hidden="true">{{ icon }}</span>
      <input
        :id="controlId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :required="required"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        class="ui-control ui-input"
        :class="{ 'pl-10': icon, 'font-code': mono }"
        @input="onInput"
      />
      <span v-if="suffix" class="ui-input-suffix">{{ suffix }}</span>
    </div>
  </UiField>
</template>

<script setup>
import UiField from './UiField.vue';

/** A text, number, email, url, search, password, date or colour input with its label. Other attributes (min, max, step, placeholder…) pass through. */
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  id: { type: String, default: '' },
  /** Material Symbols name shown inside the field, e.g. "search" */
  icon: { type: String, default: '' },
  /** A unit after the value, e.g. "px" */
  suffix: { type: String, default: '' },
  mono: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const onInput = (event) => {
  const { value, valueAsNumber } = event.target;
  emit('update:modelValue', props.type === 'number' && value !== '' && !Number.isNaN(valueAsNumber) ? valueAsNumber : value);
};
</script>

<style scoped>
.ui-input-wrap {
  @apply relative flex items-center;
}
.ui-input {
  @apply w-full h-11 px-3.5;
}
.ui-input-icon {
  @apply absolute left-3 text-lg text-ink-muted pointer-events-none;
}
.ui-input-suffix {
  @apply absolute right-3 text-sm text-ink-muted pointer-events-none;
}
.ui-control {
  @apply rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink placeholder:text-ink-muted;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.ui-control[aria-invalid='true'] {
  @apply border-danger-solid;
}
</style>
