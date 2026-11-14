<template>
  <UiSelect
    :model-value="modelValue"
    :label="label"
    :options="options"
    placeholder="Select version"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue';
import { UiSelect } from '../ui';

const props = defineProps({
  modelValue: String,
  versions: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: 'Version',
  },
});
const emit = defineEmits(['update:modelValue']);

const options = computed(() => props.versions.map((version) => ({ value: version.id, label: version.label })));
</script>
