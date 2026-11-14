<template>
  <UiField :label="label" group v-slot="{ labelId }">
    <ul class="flex flex-col gap-2" :aria-labelledby="labelId">
      <li v-for="(person, index) in modelValue" :key="index" class="flex items-center gap-2">
        <div class="flex-1">
          <UiInput
            :model-value="person"
            type="email"
            placeholder="email@example.com"
            autocomplete="off"
            :aria-label="`Email address ${index + 1}`"
            @update:model-value="update(index, $event)"
          />
        </div>
        <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove email address ${index + 1}`" @click="remove(index)" />
      </li>
    </ul>
    <div>
      <UiButton size="sm" variant="ghost" icon="add" @click="add">Add person</UiButton>
    </div>
  </UiField>
</template>

<script setup>
import { UiButton, UiField, UiInput } from '../ui';

/** The email addresses a restricted review is shared with (v-model: an array of strings, at least one, possibly empty) */
const props = defineProps({
  modelValue: { type: Array, required: true },
  label: { type: String, default: 'Approved people' },
});

const emit = defineEmits(['update:modelValue']);

const update = (index, value) => {
  const next = [...props.modelValue];
  next[index] = value;
  emit('update:modelValue', next);
};

const add = () => emit('update:modelValue', [...props.modelValue, '']);

// Keep one (empty) row rather than none
const remove = (index) => {
  if (props.modelValue.length > 1) {
    emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
  } else {
    emit('update:modelValue', ['']);
  }
};
</script>
