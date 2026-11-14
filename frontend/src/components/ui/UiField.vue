<template>
  <div class="ui-field">
    <div v-if="label" class="ui-field-label-row">
      <component :is="labelTag" :for="labelTag === 'label' ? controlId : undefined" :id="labelId" class="ui-field-label" :class="{ 'sr-only': hideLabel }">
        {{ label }}<span v-if="required" class="ui-field-required" aria-hidden="true">*</span>
      </component>
      <slot name="label-aside" :id="controlId" />
    </div>
    <slot :id="controlId" :label-id="labelId" :described-by="describedBy" :invalid="!!error" />
    <p v-if="hint && !error" :id="hintId" class="ui-field-hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="ui-field-error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';

/**
 * A label, a control, and a hint or error, wired together for assistive
 * technology. The UiInput, UiSelect, UiTextarea and UiRange controls use it;
 * wrap any other control in it and use the slot props:
 *   <UiField label="Name" v-slot="{ id, describedBy, invalid }"> <input :id="id" … /> </UiField>
 * For a group (radios, segmented buttons) set `group`: the label becomes a
 * text label referenced by `labelId`.
 */
const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  group: { type: Boolean, default: false },
  /** Keep the label for assistive technology but don't show it (dense rows, table cells) */
  hideLabel: { type: Boolean, default: false },
  id: { type: String, default: '' },
});

const generated = useId();
const controlId = computed(() => props.id || `field-${generated}`);
const labelId = computed(() => `${controlId.value}-label`);
const hintId = computed(() => `${controlId.value}-hint`);
const errorId = computed(() => `${controlId.value}-error`);
const describedBy = computed(() => (props.error ? errorId.value : props.hint ? hintId.value : undefined));
const labelTag = computed(() => (props.group ? 'span' : 'label'));
</script>

<style scoped>
.ui-field {
  @apply flex flex-col gap-1.5;
}
.ui-field-label-row {
  @apply flex items-baseline justify-between gap-3;
}
.ui-field-label {
  @apply text-sm font-medium text-ink;
}
.ui-field-required {
  @apply ml-0.5 text-danger;
}
.ui-field-hint {
  @apply text-xs text-ink-muted;
}
.ui-field-error {
  @apply text-xs font-medium text-danger;
}
</style>
