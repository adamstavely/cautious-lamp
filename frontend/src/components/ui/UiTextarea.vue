<template>
  <UiField :label="label" :hint="hint" :error="error" :required="required" :id="id" :hide-label="hideLabel">
    <template v-if="$slots['label-aside']" #label-aside><slot name="label-aside" /></template>
    <template #default="{ id: controlId, describedBy, invalid }">
    <textarea
      :id="controlId"
      v-bind="$attrs"
      :value="modelValue"
      :rows="rows"
      :required="required"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      class="ui-textarea"
      :class="{ 'font-code': mono }"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    </template>
  </UiField>
</template>

<script setup>
import UiField from './UiField.vue';

/** A multi-line text field with its label; `mono` for code and markup; `#label-aside` puts a control (a Copy button) beside the label */
defineOptions({ inheritAttrs: false });

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  id: { type: String, default: '' },
  rows: { type: [Number, String], default: 4 },
  mono: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.ui-textarea {
  @apply w-full px-3.5 py-2.5 rounded-field border border-solid border-line-control bg-surface-control text-sm leading-relaxed text-ink placeholder:text-ink-muted;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50;
}
.ui-textarea[aria-invalid='true'] {
  @apply border-danger-solid;
}
</style>
