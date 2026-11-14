<template>
  <UiField :label="label" :hint="hint" :error="error" :required="required" :id="id" v-slot="{ id: controlId, describedBy, invalid }">
    <div class="ui-select-wrap">
      <select
        :id="controlId"
        v-bind="$attrs"
        :value="modelValue"
        :required="required"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        class="ui-select"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in normalized" :key="String(option.value)" :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
      </select>
      <span class="material-symbols-outlined ui-select-chevron" aria-hidden="true">expand_more</span>
    </div>
  </UiField>
</template>

<script setup>
import { computed } from 'vue';
import UiField from './UiField.vue';

/** A native select with its label. `options` are strings or { value, label, disabled }. */
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  id: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const normalized = computed(() => props.options.map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) })));

const onChange = (event) => {
  // Hand back the option's own value (number, boolean), not the DOM's string
  const option = normalized.value[event.target.selectedIndex - (props.placeholder ? 1 : 0)];
  emit('update:modelValue', option ? option.value : event.target.value);
};
</script>

<style scoped>
.ui-select-wrap {
  @apply relative;
}
.ui-select {
  @apply w-full h-11 pl-3.5 pr-10 appearance-none rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50;
}
.ui-select-chevron {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-lg text-ink-muted pointer-events-none;
}
</style>
