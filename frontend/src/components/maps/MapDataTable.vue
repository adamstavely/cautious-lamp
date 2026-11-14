<template>
  <div class="flex flex-col gap-3">
    <UiTable :caption="caption" bordered compact>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col" :class="{ 'text-right': column.numeric }">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in shown" :key="index">
          <template v-for="(column, c) in columns" :key="column.key">
            <th v-if="c === 0" scope="row">{{ row[column.key] }}</th>
            <td v-else :class="{ 'text-right tabular-nums': column.numeric }">{{ display(row[column.key], column) }}</td>
          </template>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="text-ink-muted">No data on the map yet.</td>
        </tr>
      </tbody>
    </UiTable>
    <p v-if="rows.length > limit" class="text-sm text-ink-muted">
      Showing {{ limit.toLocaleString() }} of {{ rows.length.toLocaleString() }} rows. Download the CSV for all of them.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { UiTable } from '../ui';

/**
 * The map's data as a table: the same rows the map draws, for screen-reader
 * users and anyone who wants the numbers. The first column heads each row.
 * `columns` are { key, label, numeric? }.
 */
const props = defineProps({
  caption: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  limit: { type: Number, default: 1000 },
});

const shown = computed(() => props.rows.slice(0, props.limit));

const display = (value, column) => {
  if (value === null || value === undefined || value === '') return '—';
  if (column.numeric && typeof value === 'number') return value.toLocaleString();
  return value;
};
</script>
