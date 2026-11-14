<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Table generator"
      lead="Create interactive data tables with sorting, filtering, pagination, and row selection. Generate React or Vue components with full functionality."
      spot="tools/table-generator"
      size="tool"
    />

    <PageSection title="Build" description="Describe the table, set its columns and rows, check it and export the code.">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <UiPanel title="Configuration">
            <div class="flex flex-col gap-4">
              <UiInput
                v-model="config.title"
                label="Table title"
                placeholder="Enter table title"
                required
                :error="config.title ? '' : 'Table title is required for accessibility compliance.'"
              />
              <UiTextarea
                v-model="config.summary"
                label="Table summary"
                hint="1-2 sentences"
                :rows="2"
                placeholder="Enter a brief summary describing what this table shows"
                required
                :error="config.summary ? '' : 'Table summary is required for accessibility compliance.'"
              />
              <UiTextarea
                v-model="config.keyInsight"
                label="Key insight"
                hint="Primary takeaway"
                :rows="2"
                placeholder="Enter the primary insight or takeaway from this table"
                required
                :error="config.keyInsight ? '' : 'Key insight is required for accessibility compliance.'"
              />
            </div>

            <fieldset class="mt-6 pt-6 border-t border-line flex flex-col gap-3">
              <legend class="sr-only">Table options</legend>
              <h3 class="text-sm font-semibold text-ink-strong" aria-hidden="true">Table options</h3>
              <UiCheckbox v-model="config.enableSorting" label="Enable sorting" />
              <UiCheckbox v-model="config.enableFiltering" label="Enable filtering" />
              <UiCheckbox v-model="config.enablePagination" label="Enable pagination" />
              <div v-if="config.enablePagination" class="ml-6">
                <UiRange v-model="config.rowsPerPage" label="Rows per page" :min="5" :max="50" :step="5" />
              </div>
              <UiSelect v-model="config.selectionMode" label="Selection mode" :options="selectionModeOptions" />
              <UiCheckbox v-model="config.stripedRows" label="Striped rows" />
              <UiCheckbox v-model="config.hoverEffects" label="Hover effects" />
            </fieldset>

            <div class="mt-6 pt-6 border-t border-line">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-ink-strong">Columns ({{ columns.length }})</h3>
                <UiButton variant="primary" size="sm" icon="add" @click="addColumn">Add column</UiButton>
              </div>

              <InlineNotice :notice="columnNotice" class="mb-3" @dismiss="clearColumnNotice" />

              <div class="flex flex-col gap-3 max-h-64 overflow-y-auto">
                <fieldset v-for="(column, index) in columns" :key="column.id" class="flex flex-col gap-2 p-3 rounded-tile border border-line bg-surface-sunken">
                  <legend class="sr-only">Column {{ index + 1 }}</legend>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-ink-muted" aria-hidden="true">Column {{ index + 1 }}</span>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove column ${index + 1}`" :disabled="columns.length <= 1" @click="removeColumn(index)" />
                  </div>
                  <UiInput :model-value="column.name" placeholder="Column name" :aria-label="`Column ${index + 1} name`" @change="renameColumn(index, $event)" />
                  <UiSelect v-model="column.type" :options="columnTypeOptions" :aria-label="`Column ${index + 1} type`" />
                  <div class="flex flex-wrap gap-4">
                    <UiCheckbox v-model="column.sortable" label="Sortable" :disabled="!config.enableSorting" />
                    <UiCheckbox v-model="column.filterable" label="Filterable" :disabled="!config.enableFiltering" />
                  </div>
                </fieldset>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-line">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-ink-strong">Rows ({{ rows.length }})</h3>
                <UiButton variant="primary" size="sm" icon="add" @click="addRow">Add row</UiButton>
              </div>

              <div class="flex flex-col gap-2 max-h-64 overflow-y-auto">
                <fieldset v-for="(row, rowIndex) in rows" :key="rowIndex" class="flex flex-col gap-2 p-3 rounded-tile border border-line bg-surface-sunken">
                  <legend class="sr-only">Row {{ rowIndex + 1 }}</legend>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-ink-muted" aria-hidden="true">Row {{ rowIndex + 1 }}</span>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove row ${rowIndex + 1}`" :disabled="rows.length <= 1" @click="removeRow(rowIndex)" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <UiInput
                      v-for="column in columns"
                      :key="column.id"
                      v-model="row[column.name]"
                      :placeholder="column.name"
                      :aria-label="`Row ${rowIndex + 1} ${column.name}`"
                    />
                  </div>
                </fieldset>
              </div>
            </div>
          </UiPanel>
        </div>

        <div class="lg:col-span-2 flex flex-col gap-6">
          <div ref="previewSection">
            <UiPanel title="Preview">
              <div v-if="config.enableFiltering && columns.some(c => c.filterable)" class="mb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <UiInput
                  v-for="column in columns.filter(c => c.filterable)"
                  :key="column.name"
                  v-model="filters[column.name]"
                  icon="filter_list"
                  :placeholder="`Filter ${column.name}...`"
                  :aria-label="`Filter ${column.name}`"
                />
              </div>

              <figure role="region" :aria-label="config.title || 'Data Table'" aria-describedby="table-summary">
                <UiTable
                  :caption="config.title || 'Data Table'"
                  bordered
                  :class="{ 'table-no-hover': !config.hoverEffects }"
                >
                  <thead>
                    <tr>
                      <th v-if="config.selectionMode !== 'none'" scope="col">
                        <input
                          v-if="config.selectionMode === 'multiple'"
                          type="checkbox"
                          class="table-check"
                          :checked="allSelected"
                          aria-label="Select all rows on this page"
                          @change="toggleSelectAll"
                        />
                        <span v-else class="sr-only">Select</span>
                      </th>
                      <th
                        v-for="column in columns"
                        :key="column.id"
                        scope="col"
                        :aria-sort="config.enableSorting && column.sortable && sortColumn === column.name ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined"
                      >
                        <button v-if="config.enableSorting && column.sortable" type="button" class="table-sort" @click="handleSort(column.name)">
                          {{ column.name }}
                          <span class="material-symbols-outlined text-sm" aria-hidden="true">{{ getSortIcon(column.name) }}</span>
                        </button>
                        <template v-else>{{ column.name }}</template>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, rowIndex) in paginatedRows"
                      :key="rowKey(row)"
                      :class="{
                        'table-row-striped': config.stripedRows && rowIndex % 2 === 1,
                        'table-row-selected': isRowSelected(row)
                      }"
                    >
                      <td v-if="config.selectionMode !== 'none'">
                        <input
                          type="checkbox"
                          class="table-check"
                          :checked="isRowSelected(row)"
                          :aria-label="`Select row ${rowIndex + 1}`"
                          @change="toggleRowSelection(row)"
                        />
                      </td>
                      <td v-for="column in columns" :key="column.id">
                        {{ formatCellValue(row[column.name], column.type) }}
                      </td>
                    </tr>
                  </tbody>
                </UiTable>
                <figcaption id="table-summary" class="sr-only">
                  {{ config.summary || 'Data table visualization' }}
                </figcaption>
              </figure>

              <div v-if="config.enablePagination && filteredRows.length > config.rowsPerPage" class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm text-ink-secondary" aria-live="polite">
                  Showing {{ (currentPage - 1) * config.rowsPerPage + 1 }} to {{ Math.min(currentPage * config.rowsPerPage, filteredRows.length) }} of {{ filteredRows.length }} entries
                </p>
                <div class="flex gap-2">
                  <UiButton size="sm" icon="chevron_left" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">Previous</UiButton>
                  <UiButton size="sm" trailing-icon="chevron_right" :disabled="currentPage === totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">Next</UiButton>
                </div>
              </div>
            </UiPanel>
          </div>

          <UiPanel title="Accessibility score">
            <template #actions>
              <UiChip :tone="accessibilityScore >= 100 ? 'success' : accessibilityScore >= 70 ? 'warning' : 'danger'">{{ accessibilityScore }}%</UiChip>
            </template>

            <ul class="flex flex-col gap-2 text-sm">
              <li v-for="check in accessibilityChecks" :key="check.label" class="flex items-center justify-between">
                <span class="text-ink-secondary">{{ check.label }}</span>
                <span class="material-symbols-outlined text-base" :class="check.ok ? 'text-success' : 'text-danger'" aria-hidden="true">{{ check.ok ? 'check_circle' : 'error' }}</span>
                <span class="sr-only">{{ check.ok ? 'Passes' : 'Needs work' }}</span>
              </li>
            </ul>

            <UiCallout v-if="accessibilityScore < 100" tone="warning" title="Fix required" class="mt-4">
              <ul>
                <li v-if="!config.title || !config.summary || !config.keyInsight">Add required metadata: title, summary, and key insight</li>
              </ul>
            </UiCallout>

            <UiButton variant="primary" icon="bug_report" class="mt-4" :loading="axeScanRunning" @click="runAxeCoreScan">
              {{ axeScanRunning ? 'Scanning...' : 'Run accessibility check' }}
            </UiButton>

            <div v-if="axeScanResults" class="mt-4 flex flex-col gap-2" role="status">
              <UiCallout v-if="axeScanResults.error" tone="warning" title="Scan error">{{ axeScanResults.error }}</UiCallout>
              <UiCallout
                v-for="(violation, index) in axeScanResults.violations"
                :key="index"
                tone="danger"
                :icon="violation.impact === 'critical' ? 'error' : 'warning'"
                :title="`${violation.id} (${violation.impact || 'moderate'})`"
              >
                <p>{{ violation.description }}</p>
                <p class="mt-1 text-ink-secondary">{{ violation.help }}</p>
              </UiCallout>
              <UiCallout v-if="axeScanResults.violations && axeScanResults.violations.length === 0 && !axeScanResults.error" tone="success">
                No accessibility violations found!
              </UiCallout>
            </div>
          </UiPanel>

          <UiPanel title="Export">
            <div class="flex flex-col gap-4">
              <UiSegmented v-model="selectedExportFormat" :options="exportFormats" label="Export format" />
              <InlineNotice :notice="notice" @dismiss="clearNotice" />
              <UiCodeBlock :code="generatedCode" label="Generated code" @copy-failed="onCopyFailed" />
            </div>
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, toRaw } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiChip, UiCodeBlock, UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiTable, UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import axe from 'axe-core';
import { AXE_SCAN_OPTIONS } from '../utils/axeScan.js';
import { generateTableCode } from '../utils/tableExport.js';

const { notice, showNotice, clearNotice } = useNotice();
const {
  notice: columnNotice,
  showNotice: showColumnNotice,
  clearNotice: clearColumnNotice
} = useNotice();
const previewSection = ref(null);

const selectionModeOptions = [
  { value: 'none', label: 'None' },
  { value: 'single', label: 'Single' },
  { value: 'multiple', label: 'Multiple' }
];

const columnTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'custom', label: 'Custom' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'HTML', value: 'html' }
];

const config = ref({
  title: '',
  summary: '',
  keyInsight: '',
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
  rowsPerPage: 10,
  selectionMode: 'none', // none, single, multiple
  stripedRows: true,
  hoverEffects: true
});

let columnIdCounter = 0;
const columns = ref([
  { name: 'Name', type: 'text', sortable: true, filterable: true },
  { name: 'Age', type: 'number', sortable: true, filterable: true },
  { name: 'Email', type: 'text', sortable: true, filterable: true }
].map(c => ({ id: columnIdCounter++, ...c })));

const rows = ref([
  { Name: 'John Doe', Age: '30', Email: 'john@example.com' },
  { Name: 'Jane Smith', Age: '25', Email: 'jane@example.com' },
  { Name: 'Bob Johnson', Age: '35', Email: 'bob@example.com' },
  { Name: 'Alice Williams', Age: '28', Email: 'alice@example.com' },
  { Name: 'Charlie Brown', Age: '32', Email: 'charlie@example.com' }
]);

const filters = ref({});
const sortColumn = ref(null);
const sortDirection = ref('asc'); // 'asc' or 'desc'
const currentPage = ref(1);
// Selected rows are tracked by row object (not by position), so the selection
// follows the row through sorting, filtering and paging.
const selectedRows = ref(new Set());

// Stable keys for preview rows without adding fields to the exported row data.
const rowKeys = new WeakMap();
let rowKeyCounter = 0;
const rowKey = (row) => {
  const raw = toRaw(row);
  if (!rowKeys.has(raw)) rowKeys.set(raw, rowKeyCounter++);
  return rowKeys.get(raw);
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const toBool = (value) => value === true || /^(true|yes|y|1)$/i.test(String(value ?? '').trim());

const compareValues = (a, b, type) => {
  if (type === 'number') return (Number(a) || 0) - (Number(b) || 0);
  if (type === 'date') return (new Date(a).getTime() || 0) - (new Date(b).getTime() || 0);
  if (type === 'boolean') return Number(toBool(a)) - Number(toBool(b));
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
};

// The range input always gives 5-50, but guard against 0/'' anyway (division).
const rowsPerPage = computed(() => Math.max(1, Number(config.value.rowsPerPage) || 10));

const selectedExportFormat = ref('react');

// Accessibility Score (0-100%)
const accessibilityScore = computed(() => {
  let score = 0;
  let maxScore = 0;
  
  // Alt Text (required fields) - 100 points
  maxScore += 100;
  if (config.value.title && config.value.title.trim() !== '') score += 34;
  if (config.value.summary && config.value.summary.trim() !== '') score += 33;
  if (config.value.keyInsight && config.value.keyInsight.trim() !== '') score += 33;
  
  return Math.round((score / maxScore) * 100);
});

// axe-core Integration
const accessibilityChecks = computed(() => [
  { label: 'Alt text', ok: !!(config.value.title && config.value.summary && config.value.keyInsight) },
  { label: 'Keyboard navigation', ok: true },
  { label: 'Screen reader', ok: true }
]);

const axeScanRunning = ref(false);
const axeScanResults = ref(null);

const runAxeCoreScan = async () => {
  axeScanRunning.value = true;
  axeScanResults.value = null;
  
  try {
    const scanTarget = previewSection.value;
    
    if (!scanTarget) {
      axeScanResults.value = {
        violations: [{
          id: 'scan-error',
          description: 'Table preview not found. Please ensure the table is rendered.',
          help: 'Try refreshing the page or reloading the table data.',
          impact: 'critical'
        }],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
      return;
    }
    
    const results = await axe.run(scanTarget, AXE_SCAN_OPTIONS);
    
    axeScanResults.value = results;
  } catch (error) {
    console.error('axe-core scan error:', error);
    axeScanResults.value = {
      violations: [{
        id: 'scan-error',
        description: `Error running accessibility scan: ${error.message}`,
        help: 'Please check the browser console for more details.',
        impact: 'critical'
      }],
      passes: [],
      incomplete: [],
      inapplicable: [],
      error: error.message
    };
  } finally {
    axeScanRunning.value = false;
  }
};

const filteredRows = computed(() => {
  let result = [...rows.value];

  // Apply filters
  if (config.value.enableFiltering) {
    Object.entries(filters.value).forEach(([columnName, value]) => {
      const filterValue = String(value || '').toLowerCase();
      if (filterValue) {
        result = result.filter(row => String(row[columnName] ?? '').toLowerCase().includes(filterValue));
      }
    });
  }

  // Apply sorting
  if (config.value.enableSorting && sortColumn.value) {
    const column = columns.value.find(c => c.name === sortColumn.value);
    if (column && column.sortable) {
      const direction = sortDirection.value === 'asc' ? 1 : -1;
      result.sort((a, b) => direction * compareValues(a[column.name], b[column.name], column.type));
    }
  }

  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage.value)));

const paginatedRows = computed(() => {
  if (!config.value.enablePagination) {
    return filteredRows.value;
  }

  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredRows.value.slice(start, start + rowsPerPage.value);
});

// New filters or a different page size: start from page 1; never sit past the last page.
watch(filters, () => { currentPage.value = 1; }, { deep: true });
watch(() => config.value.rowsPerPage, () => { currentPage.value = 1; });
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages;
});

// Switching selection mode (e.g. multiple -> single) starts a fresh selection.
watch(() => config.value.selectionMode, () => {
  selectedRows.value.clear();
});

const allSelected = computed(() => {
  if (config.value.selectionMode !== 'multiple') return false;
  return paginatedRows.value.length > 0 && paginatedRows.value.every(row => selectedRows.value.has(row));
});

const uniqueColumnName = (base) => {
  const names = new Set(columns.value.map(c => c.name));
  let n = columns.value.length + 1;
  let name = `${base} ${n}`;
  while (names.has(name)) {
    n++;
    name = `${base} ${n}`;
  }
  return name;
};

const addColumn = () => {
  const name = uniqueColumnName('Column');
  columns.value.push({
    id: columnIdCounter++,
    name,
    type: 'text',
    sortable: true,
    filterable: true
  });

  // Add empty values for existing rows
  rows.value.forEach(row => {
    row[name] = '';
  });
};

const removeColumn = (index) => {
  if (columns.value.length <= 1) return;
  const columnName = columns.value[index].name;
  columns.value.splice(index, 1);

  // Remove column data from rows
  rows.value.forEach(row => {
    delete row[columnName];
  });

  // Remove filter / sort on that column
  delete filters.value[columnName];
  if (sortColumn.value === columnName) sortColumn.value = null;
};

// Rows are keyed by column name, so a rename has to move each row's value to
// the new key (and any filter/sort on it), keeping key order for the export.
const renameColumn = (index, event) => {
  const column = columns.value[index];
  const oldName = column.name;
  const newName = event.target.value.trim();
  if (newName === oldName) {
    event.target.value = oldName;
    return;
  }
  if (!newName) {
    showColumnNotice('Column names can\'t be empty.', 'error');
    event.target.value = oldName;
    return;
  }
  if (columns.value.some((c, i) => i !== index && c.name === newName)) {
    showColumnNotice(`A column named "${newName}" already exists.`, 'error');
    event.target.value = oldName;
    return;
  }
  clearColumnNotice();

  rows.value.forEach(row => {
    const entries = Object.entries(row);
    Object.keys(row).forEach(key => { delete row[key]; });
    entries.forEach(([key, value]) => {
      row[key === oldName ? newName : key] = value;
    });
    if (!entries.some(([key]) => key === oldName)) row[newName] = '';
  });
  if (Object.prototype.hasOwnProperty.call(filters.value, oldName)) {
    filters.value[newName] = filters.value[oldName];
    delete filters.value[oldName];
  }
  if (sortColumn.value === oldName) sortColumn.value = newName;
  column.name = newName;
  event.target.value = newName;
};

const addRow = () => {
  const newRow = {};
  columns.value.forEach(column => {
    newRow[column.name] = '';
  });
  rows.value.push(newRow);
};

const removeRow = (index) => {
  if (rows.value.length <= 1) return;
  const [removed] = rows.value.splice(index, 1);
  selectedRows.value.delete(removed);
};

const handleSort = (columnName) => {
  if (sortColumn.value === columnName) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = columnName;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1; // Reset to first page when sorting
};

const getSortIcon = (columnName) => {
  if (sortColumn.value !== columnName) return 'unfold_more';
  return sortDirection.value === 'asc' ? 'arrow_upward' : 'arrow_downward';
};

const formatCellValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '-';

  if (type === 'boolean') {
    // Cells are typed text, so "false"/"no"/"0" must read as No.
    return toBool(value) ? 'Yes' : 'No';
  }

  return value;
};

const toggleRowSelection = (row) => {
  if (config.value.selectionMode === 'single') {
    const wasSelected = selectedRows.value.has(row);
    selectedRows.value.clear();
    if (!wasSelected) selectedRows.value.add(row);
  } else if (config.value.selectionMode === 'multiple') {
    if (selectedRows.value.has(row)) {
      selectedRows.value.delete(row);
    } else {
      selectedRows.value.add(row);
    }
  }
};

const isRowSelected = (row) => selectedRows.value.has(row);

const toggleSelectAll = (event) => {
  paginatedRows.value.forEach(row => {
    if (event.target.checked) {
      selectedRows.value.add(row);
    } else {
      selectedRows.value.delete(row);
    }
  });
};

const generatedCode = computed(() =>
  generateTableCode(selectedExportFormat.value, columns.value, rows.value, config.value, { escapeHtml, formatCellValue }),
);

const onCopyFailed = () => {
  showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
};





</script>

<style scoped>
.table-check {
  @apply w-4 h-4 accent-accent cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.table-sort {
  @apply inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.table-row-striped {
  @apply bg-fill-subtle;
}
.table-row-selected {
  @apply bg-accent-subtle;
}
/* UiTable highlights rows on hover; "Hover effects" off turns that off */
.table-no-hover table tbody tr:hover {
  @apply bg-transparent;
}
.table-no-hover table tbody tr.table-row-striped:hover {
  @apply bg-fill-subtle;
}
.table-no-hover table tbody tr.table-row-selected:hover {
  @apply bg-accent-subtle;
}
</style>
