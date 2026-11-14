<template>
  <UiField :label="label" :hint="hint" :error="error" :required="required" :id="id" :hide-label="hideLabel" v-slot="{ id: controlId, describedBy, invalid }">
    <div class="ui-input-wrap">
      <span v-if="icon" class="material-symbols-outlined ui-input-icon" aria-hidden="true">{{ icon }}</span>
      <input
        ref="input"
        :id="controlId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :required="required"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        class="ui-control ui-input"
        :class="[`ui-input-${size}`, { 'pl-10': icon, 'pr-12': $slots.trailing, 'font-code': mono }]"
        @input="onInput"
      />
      <span v-if="suffix" class="ui-input-suffix">{{ suffix }}</span>
      <!-- A control inside the field's end, e.g. a show-password UiButton (size="sm", icon-only) -->
      <span v-if="$slots.trailing" class="ui-input-trailing"><slot name="trailing" /></span>
    </div>
  </UiField>
</template>

<script setup>
import { ref } from 'vue';
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
  /** md: forms · sm: dense rows and table cells */
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) },
  /** Label read by assistive technology but not shown (keep `label` set) */
  hideLabel: { type: Boolean, default: false },
});

const input = ref(null);
/** Focus the field, e.g. from a keyboard shortcut: <UiInput ref="search" /> … search.value.focus() */
defineExpose({ focus: () => input.value?.focus(), select: () => input.value?.select() });

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
  @apply w-full px-3.5;
}
.ui-input-md {
  @apply h-11;
}
.ui-input-sm {
  @apply h-8 px-2.5;
}
.ui-input-trailing {
  @apply absolute right-1.5 flex items-center;
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
