/**
 * The code TableGenerator exports (React, Vue, HTML). This is output, not the
 * app's styling: the classes in it belong to the generated component, so it
 * lives outside the view and its style checks.
 */
import { scriptSafeJson } from './scriptSafeJson.js';

export function generateTableCode(format, columns, rows, config, { escapeHtml, formatCellValue }) {
  const columnsData = columns.map(c => ({
    name: c.name,
    type: c.type,
    sortable: c.sortable,
    filterable: c.filterable
  }));
  
  const rowsData = rows;
  
  if (format === 'react') {
    return `import React, { useState, useMemo, useEffect } from 'react';

export interface Column {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  rowsPerPage?: number;
  selectionMode?: 'none' | 'single' | 'multiple';
  stripedRows?: boolean;
  hoverEffects?: boolean;
}

export type RowId = string | number;

export interface DataTableProps {
  columns?: Column[];
  rows?: Record<string, any>[];
  config?: TableConfig;
  /** Stable id for a row; defaults to row.id, else its index in rows. */
  getRowId?: (row: Record<string, any>, index: number) => RowId;
}

// Module-level defaults keep the same identity on every render.
const DEFAULT_COLUMNS: Column[] = ${scriptSafeJson(columnsData, 2)};
const DEFAULT_ROWS: Record<string, any>[] = ${scriptSafeJson(rowsData, 2)};
const DEFAULT_CONFIG: TableConfig = ${scriptSafeJson(config, 2)};
const defaultGetRowId = (row: Record<string, any>, index: number): RowId => row.id ?? index;

export const DataTable: React.FC<DataTableProps> = ({
  columns = DEFAULT_COLUMNS,
  rows = DEFAULT_ROWS,
  config = DEFAULT_CONFIG,
  getRowId = defaultGetRowId
}) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  // Selection is kept by row id, so it survives rerenders, sorting and paging.
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(() => new Set());

  const rowsPerPage = Math.max(1, Number(config.rowsPerPage) || 10);

  const keyedRows = useMemo(
    () => rows.map((row, index) => ({ id: getRowId(row, index), row })),
    [rows, getRowId]
  );

  // Drop selections whose rows are gone.
  useEffect(() => {
    setSelectedIds(previous => {
      const ids = new Set(keyedRows.map(entry => entry.id));
      const next = new Set([...previous].filter(id => ids.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [keyedRows]);

  const filteredRows = useMemo(() => {
    let result = [...keyedRows];

    // Apply filters
    if (config.enableFiltering) {
      Object.keys(filters).forEach(columnName => {
        const filterValue = filters[columnName]?.toLowerCase() || '';
        if (filterValue) {
          result = result.filter(({ row }) => {
            const cellValue = String(row[columnName] ?? '').toLowerCase();
            return cellValue.includes(filterValue);
          });
        }
      });
    }
    
    // Apply sorting
    if (config.enableSorting && sortColumn) {
      const column = columns.find(c => c.name === sortColumn);
      if (column && column.sortable) {
        result = [...result].sort(({ row: a }, { row: b }) => {
          const aVal = a[sortColumn] ?? '';
          const bVal = b[sortColumn] ?? '';
          
          if (column.type === 'number') {
            const aNum = Number(aVal) || 0;
            const bNum = Number(bVal) || 0;
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
          } else if (column.type === 'date') {
            const aDate = new Date(aVal).getTime() || 0;
            const bDate = new Date(bVal).getTime() || 0;
            return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
          } else {
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            return sortDirection === 'asc' 
              ? aStr.localeCompare(bStr)
              : bStr.localeCompare(aStr);
          }
        });
      }
    }
    
    return result;
  }, [keyedRows, filters, sortColumn, sortDirection, columns, config]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  // Clamp while rendering so a shrinking result (filters, new rows, a larger
  // page size) never shows an empty page, then store the clamped page.
  const page = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage !== page) setCurrentPage(page);
  }, [currentPage, page]);

  const paginatedRows = config.enablePagination
    ? filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : filteredRows;

  const setFilter = (columnName: string, value: string) => {
    setFilters(previous => ({ ...previous, [columnName]: value }));
    setCurrentPage(1);
  };

  const toggleRow = (id: RowId) => {
    setSelectedIds(previous => {
      const next = new Set(config.selectionMode === 'single' ? [] : previous);
      if (previous.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(previous => {
      const next = new Set(previous);
      paginatedRows.forEach(({ id }) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const formatCellValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') return '-';
    if (type === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="data-table">
      {/* Filters */}
      {config.enableFiltering && columns.some(c => c.filterable) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {columns.filter(c => c.filterable).map(column => (
            <input
              key={column.name}
              type="text"
              placeholder={\`Filter \${column.name}...\`}
              value={filters[column.name] || ''}
              onChange={(e) => setFilter(column.name, e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
            />
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={\`w-full border-collapse \${config.stripedRows ? 'table-striped' : ''} \${config.hoverEffects ? 'table-hover' : ''}\`}>
          <thead>
            <tr className="bg-gray-100">
              {config.selectionMode !== 'none' && (
                <th className="p-3 text-left border">
                  {config.selectionMode === 'multiple' && (
                    <input
                      type="checkbox"
                      checked={paginatedRows.length > 0 && paginatedRows.every(({ id }) => selectedIds.has(id))}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  )}
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.name}
                  className={\`p-3 text-left border font-semibold text-sm \${config.enableSorting && column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}\`}
                  onClick={() => config.enableSorting && column.sortable && handleSort(column.name)}
                >
                  <div className="flex items-center gap-2">
                    {column.name}
                    {config.enableSorting && column.sortable && (
                      <span>
                        {sortColumn === column.name
                          ? sortDirection === 'asc' ? '↑' : '↓'
                          : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(({ id, row }, rowIndex) => {
              const selected = selectedIds.has(id);
              return (
                <tr
                  key={id}
                  className={\`
                    \${config.stripedRows && rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
                    \${config.hoverEffects ? 'hover:bg-indigo-50' : ''}
                    \${selected ? 'bg-indigo-100' : ''}
                  \`}
                >
                  {config.selectionMode !== 'none' && (
                    <td className="p-3 border">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(id)}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.name} className="p-3 border text-sm">
                      {formatCellValue(row[column.name], column.type)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {config.enablePagination && filteredRows.length > rowsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * rowsPerPage + 1} to{' '}
            {Math.min(page * rowsPerPage, filteredRows.length)} of{' '}
            {filteredRows.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};`;
  } else if (format === 'vue') {
    const templateTag = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateCloseTag = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupTag = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    
    return templateTag + `
  <div class="data-table">
    <!-- Filters -->
    <div v-if="config.enableFiltering && columns.some(c => c.filterable)" class="mb-4 flex flex-wrap gap-2">
      <input
        v-for="column in columns.filter(c => c.filterable)"
        :key="column.name"
        v-model="filters[column.name]"
        type="text"
        :placeholder="\`Filter \${column.name}...\`"
        class="px-3 py-2 rounded-lg border text-sm"
      />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table :class="[\`w-full border-collapse\`, config.stripedRows ? 'table-striped' : '', config.hoverEffects ? 'table-hover' : '']">
        <thead>
          <tr class="bg-gray-100">
            <th v-if="config.selectionMode !== 'none'" class="p-3 text-left border">
              <input
                v-if="config.selectionMode === 'multiple'"
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.name"
              :class="[\`p-3 text-left border font-semibold text-sm\`, config.enableSorting && column.sortable ? 'cursor-pointer hover:bg-gray-200' : '']"
              @click="config.enableSorting && column.sortable ? handleSort(column.name) : null"
            >
              <div class="flex items-center gap-2">
                {{ column.name }}
                <span v-if="config.enableSorting && column.sortable">
                  {{ getSortIcon(column.name) }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in paginatedRows"
            :key="rowIndex"
            :class="[
              config.stripedRows && rowIndex % 2 === 0 ? 'bg-gray-50' : '',
              config.hoverEffects ? 'hover:bg-indigo-50' : '',
              isRowSelected(row) ? 'bg-indigo-100' : ''
            ]"
          >
            <td v-if="config.selectionMode !== 'none'" class="p-3 border">
              <input
                type="checkbox"
                :checked="isRowSelected(row)"
                @change="toggleRowSelection(row)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.name"
              class="p-3 border text-sm"
            >
              {{ formatCellValue(row[column.name], column.type) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="config.enablePagination && filteredRows.length > config.rowsPerPage" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Showing {{ (currentPage - 1) * config.rowsPerPage + 1 }} to {{ Math.min(currentPage * config.rowsPerPage, filteredRows.length) }} of {{ filteredRows.length }} entries
      </div>
      <div class="flex gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
` + templateCloseTag + `

` + scriptSetupTag + `
import { ref, computed, watch } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => ${scriptSafeJson(columnsData, 4)}
  },
  rows: {
    type: Array,
    default: () => ${scriptSafeJson(rowsData, 4)}
  },
  config: {
    type: Object,
    default: () => (${scriptSafeJson(config, 4)})
  }
});

const filters = ref({});
const sortColumn = ref(null);
const sortDirection = ref('asc');
const currentPage = ref(1);
const selectedRows = ref(new Set());

const rowsPerPage = computed(() => Math.max(1, Number(props.config.rowsPerPage) || 10));

const toBool = (value) => value === true || /^(true|yes|y|1)$/i.test(String(value ?? '').trim());

const compareValues = (a, b, type) => {
  if (type === 'number') return (Number(a) || 0) - (Number(b) || 0);
  if (type === 'date') return (new Date(a).getTime() || 0) - (new Date(b).getTime() || 0);
  if (type === 'boolean') return Number(toBool(a)) - Number(toBool(b));
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
};

const filteredRows = computed(() => {
  let result = [...props.rows];
  if (props.config.enableFiltering) {
    Object.entries(filters.value).forEach(([columnName, value]) => {
      const filterValue = String(value || '').toLowerCase();
      if (filterValue) {
        result = result.filter(row => String(row[columnName] ?? '').toLowerCase().includes(filterValue));
      }
    });
  }
  if (props.config.enableSorting && sortColumn.value) {
    const column = props.columns.find(c => c.name === sortColumn.value);
    if (column && column.sortable) {
      const direction = sortDirection.value === 'asc' ? 1 : -1;
      result.sort((a, b) => direction * compareValues(a[column.name], b[column.name], column.type));
    }
  }
  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage.value)));

const paginatedRows = computed(() => {
  if (!props.config.enablePagination) return filteredRows.value;
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredRows.value.slice(start, start + rowsPerPage.value);
});

watch(filters, () => { currentPage.value = 1; }, { deep: true });
watch(totalPages, (pages) => { if (currentPage.value > pages) currentPage.value = pages; });

const allSelected = computed(() =>
  paginatedRows.value.length > 0 && paginatedRows.value.every(row => selectedRows.value.has(row))
);

const handleSort = (columnName) => {
  if (sortColumn.value === columnName) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = columnName;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
};

const getSortIcon = (columnName) => {
  if (sortColumn.value !== columnName) return '↕';
  return sortDirection.value === 'asc' ? '↑' : '↓';
};

const formatCellValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '-';
  if (type === 'boolean') return toBool(value) ? 'Yes' : 'No';
  return value;
};

const isRowSelected = (row) => selectedRows.value.has(row);

const toggleRowSelection = (row) => {
  if (props.config.selectionMode === 'single') {
    const wasSelected = selectedRows.value.has(row);
    selectedRows.value.clear();
    if (!wasSelected) selectedRows.value.add(row);
  } else if (props.config.selectionMode === 'multiple') {
    if (selectedRows.value.has(row)) {
      selectedRows.value.delete(row);
    } else {
      selectedRows.value.add(row);
    }
  }
};

const toggleSelectAll = (event) => {
  paginatedRows.value.forEach(row => {
    if (event.target.checked) {
      selectedRows.value.add(row);
    } else {
      selectedRows.value.delete(row);
    }
  });
};
` + scriptClose;
  } else {
    // HTML export
    const caption = config.title ? `\n  <caption>${escapeHtml(config.title)}</caption>` : '';
    return `<!-- Static HTML Table -->
<table class="w-full border-collapse">${caption}
  <thead>
    <tr class="bg-gray-100">
      ${columns.map(c => `<th scope="col" class="p-3 text-left border font-semibold text-sm">${escapeHtml(c.name)}</th>`).join('\n      ')}
    </tr>
  </thead>
  <tbody>
    ${rows.map(row => `
    <tr>
      ${columns.map(c => `<td class="p-3 border text-sm">${escapeHtml(formatCellValue(row[c.name], c.type))}</td>`).join('\n      ')}
    </tr>`).join('\n    ')}
  </tbody>
</table>`;
  }
}
