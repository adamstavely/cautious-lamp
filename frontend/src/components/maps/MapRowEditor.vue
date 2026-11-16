<template>
  <fieldset class="flex flex-col gap-3">
    <legend class="mb-2 text-sm font-medium text-ink">{{ legend }}</legend>
    <UiTable :caption="legend" bordered compact>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
          <th scope="col"><span class="sr-only">Remove</span></th>
        </tr>
      </thead>
      <tbody ref="rowList">
        <tr v-for="(row, index) in visibleRows" :key="index">
          <td v-for="column in columns" :key="column.key">
            <UiInput
              :model-value="row[column.key] ?? ''"
              :type="column.type === 'number' ? 'number' : 'text'"
              :step="column.step || 'any'"
              size="sm"
              :label="`${itemLabel} ${index + 1} ${column.label.toLowerCase()}`"
              hide-label
              @update:model-value="update(index, column, $event)"
            />
          </td>
          <td>
            <UiButton icon-only icon="trash-2" variant="ghost" size="sm" :label="`Remove ${itemLabel.toLowerCase()} ${index + 1}`" data-focus-after-remove @click="remove(index); focusAfterRemoval(rowList, index, { fallback: addButton })" />
          </td>
        </tr>
      </tbody>
    </UiTable>
    <p v-if="rows.length > limit" class="text-sm text-ink-muted">
      Showing the first {{ limit }} of {{ rows.length.toLocaleString() }} rows. Edit larger tables in a spreadsheet and import them.
    </p>
    <UiButton ref="addButton" icon="plus" size="sm" class="self-start" @click="add">Add {{ itemLabel.toLowerCase() }}</UiButton>
  </fieldset>
</template>

<script setup>
import { computed, ref } from 'vue';
import { UiButton, UiInput, UiTable } from '../ui';
import { focusAfterRemoval } from '../../utils/focusAfterRemoval';

/**
 * A small editable table for Map Maker's data, for quick fixes after an
 * import. `columns` are { key, label, type: 'text' | 'number', step? }; the
 * parent owns the rows and gets a new array on every change (v-model).
 * Empty number cells are stored as null.
 */
const props = defineProps({
  modelValue: { type: Array, required: true },
  columns: { type: Array, required: true },
  legend: { type: String, required: true },
  /** What one row is called: "Region", "Flow" … */
  itemLabel: { type: String, required: true },
  /** Rows shown for editing; long imports are edited as files */
  limit: { type: Number, default: 50 },
});

const emit = defineEmits(['update:modelValue']);

const rowList = ref(null);
const addButton = ref(null);

const rows = computed(() => props.modelValue);
const visibleRows = computed(() => props.modelValue.slice(0, props.limit));

const update = (index, column, value) => {
  const next = [...props.modelValue];
  next[index] = { ...next[index], [column.key]: column.type === 'number' ? (value === '' || value === null ? null : Number(value)) : value };
  emit('update:modelValue', next);
};

const remove = (index) => emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));

const add = () => {
  const blank = Object.fromEntries(props.columns.map((c) => [c.key, c.type === 'number' ? null : '']));
  emit('update:modelValue', [...props.modelValue, blank]);
};
</script>
