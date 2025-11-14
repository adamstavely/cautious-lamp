<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Table/DataTable Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create interactive data tables with sorting, filtering, pagination, and row selection. Generate React or Vue components with full functionality.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">table_chart</span>
                      Data Visualization
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="tableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Table representation -->
                      <rect x="30" y="40" width="140" height="120" rx="4" fill="url(#tableGradient)" opacity="0.2" stroke="url(#tableGradient)" stroke-width="2"/>
                      <!-- Rows -->
                      <line x1="30" y1="60" x2="170" y2="60" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <line x1="30" y1="80" x2="170" y2="80" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <line x1="30" y1="100" x2="170" y2="100" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <line x1="30" y1="120" x2="170" y2="120" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <!-- Columns -->
                      <line x1="70" y1="40" x2="70" y2="160" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <line x1="110" y1="40" x2="110" y2="160" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                      <line x1="150" y1="40" x2="150" y2="160" stroke="url(#tableGradient)" stroke-width="1" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Configuration Panel -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6 sticky top-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">settings</span>
                    Configuration
                  </h2>

                  <!-- Table Options -->
                  <div class="mb-6 space-y-3">
                    <h3 class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Table Options
                    </h3>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.enableSorting"
                        type="checkbox"
                        class="w-4 h-4 rounded"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Enable Sorting</span>
                    </label>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.enableFiltering"
                        type="checkbox"
                        class="w-4 h-4 rounded"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Enable Filtering</span>
                    </label>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.enablePagination"
                        type="checkbox"
                        class="w-4 h-4 rounded"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Enable Pagination</span>
                    </label>
                    
                    <div v-if="config.enablePagination" class="ml-6">
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Rows per page: {{ config.rowsPerPage }}
                      </label>
                      <input
                        v-model.number="config.rowsPerPage"
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Selection Mode
                      </label>
                      <select
                        v-model="config.selectionMode"
                        class="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'"
                      >
                        <option value="none">None</option>
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                      </select>
                    </div>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.stripedRows"
                        type="checkbox"
                        class="w-4 h-4 rounded"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Striped Rows</span>
                    </label>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.hoverEffects"
                        type="checkbox"
                        class="w-4 h-4 rounded"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Hover Effects</span>
                    </label>
                  </div>

                  <!-- Columns Section -->
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Columns ({{ columns.length }})
                      </h3>
                      <button
                        @click="addColumn"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                        Add
                      </button>
                    </div>

                    <div class="space-y-3 max-h-64 overflow-y-auto">
                      <div
                        v-for="(column, index) in columns"
                        :key="index"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            Column {{ index + 1 }}
                          </span>
                          <button
                            @click="removeColumn(index)"
                            class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            :disabled="columns.length <= 1"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        <div class="space-y-2">
                          <input
                            v-model="column.name"
                            type="text"
                            placeholder="Column name"
                            class="w-full px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <select
                            v-model="column.type"
                            class="w-full px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="boolean">Boolean</option>
                            <option value="custom">Custom</option>
                          </select>
                          <div class="flex gap-2">
                            <label class="flex items-center gap-1 cursor-pointer text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="column.sortable"
                                type="checkbox"
                                class="w-3 h-3"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                                :disabled="!config.enableSorting"
                              />
                              Sortable
                            </label>
                            <label class="flex items-center gap-1 cursor-pointer text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="column.filterable"
                                type="checkbox"
                                class="w-3 h-3"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                                :disabled="!config.enableFiltering"
                              />
                              Filterable
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Rows Section -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Rows ({{ rows.length }})
                      </h3>
                      <button
                        @click="addRow"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                        Add
                      </button>
                    </div>

                    <div class="space-y-2 max-h-64 overflow-y-auto">
                      <div
                        v-for="(row, rowIndex) in rows"
                        :key="rowIndex"
                        class="border rounded p-2"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            Row {{ rowIndex + 1 }}
                          </span>
                          <button
                            @click="removeRow(rowIndex)"
                            class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            :disabled="rows.length <= 1"
                          >
                            <span class="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                        <div class="grid grid-cols-2 gap-1">
                          <input
                            v-for="(column, colIndex) in columns"
                            :key="colIndex"
                            v-model="row[column.name]"
                            type="text"
                            :placeholder="column.name"
                            class="px-2 py-1 rounded border text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview and Export Panel -->
              <div class="lg:col-span-2">
                <!-- Preview Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Preview
                  </h2>
                  
                  <div class="p-4 rounded-lg overflow-x-auto"
                    :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                  >
                    <!-- Filters -->
                    <div v-if="config.enableFiltering && columns.some(c => c.filterable)" class="mb-4 flex flex-wrap gap-2">
                      <input
                        v-for="column in columns.filter(c => c.filterable)"
                        :key="column.name"
                        v-model="filters[column.name]"
                        type="text"
                        :placeholder="`Filter ${column.name}...`"
                        class="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>

                    <!-- Table -->
                    <div class="overflow-x-auto">
                      <table 
                        class="w-full border-collapse"
                        :class="[
                          config.stripedRows ? 'table-striped' : '',
                          config.hoverEffects ? 'table-hover' : ''
                        ]"
                      >
                        <thead>
                          <tr :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">
                            <th v-if="config.selectionMode !== 'none'" class="p-3 text-left border" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                              <input
                                v-if="config.selectionMode === 'multiple'"
                                type="checkbox"
                                :checked="allSelected"
                                @change="toggleSelectAll"
                                class="w-4 h-4"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                            </th>
                            <th
                              v-for="column in columns"
                              :key="column.name"
                              class="p-3 text-left border font-semibold text-sm"
                              :class="[
                                isDarkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700',
                                config.enableSorting && column.sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600' : ''
                              ]"
                              @click="config.enableSorting && column.sortable ? handleSort(column.name) : null"
                            >
                              <div class="flex items-center gap-2">
                                {{ column.name }}
                                <span v-if="config.enableSorting && column.sortable" class="material-symbols-outlined text-xs">
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
                              isDarkMode ? 'border-gray-700' : 'border-gray-200',
                              config.stripedRows && rowIndex % 2 === 0 ? (isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50') : '',
                              config.hoverEffects ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' : '',
                              isRowSelected(rowIndex) ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''
                            ]"
                          >
                            <td v-if="config.selectionMode !== 'none'" class="p-3 border" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                              <input
                                type="checkbox"
                                :checked="isRowSelected(rowIndex)"
                                @change="toggleRowSelection(rowIndex)"
                                class="w-4 h-4"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                            </td>
                            <td
                              v-for="column in columns"
                              :key="column.name"
                              class="p-3 border text-sm"
                              :class="isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'"
                            >
                              {{ formatCellValue(row[column.name], column.type) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Pagination -->
                    <div v-if="config.enablePagination && filteredRows.length > config.rowsPerPage" class="mt-4 flex items-center justify-between">
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Showing {{ (currentPage - 1) * config.rowsPerPage + 1 }} to {{ Math.min(currentPage * config.rowsPerPage, filteredRows.length) }} of {{ filteredRows.length }} entries
                      </div>
                      <div class="flex gap-2">
                        <button
                          @click="currentPage = Math.max(1, currentPage - 1)"
                          :disabled="currentPage === 1"
                          class="px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          :class="isDarkMode 
                            ? 'bg-slate-700 border-gray-600 text-gray-300 hover:bg-slate-600 disabled:hover:bg-slate-700' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'"
                        >
                          Previous
                        </button>
                        <button
                          @click="currentPage = Math.min(totalPages, currentPage + 1)"
                          :disabled="currentPage === totalPages"
                          class="px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          :class="isDarkMode 
                            ? 'bg-slate-700 border-gray-600 text-gray-300 hover:bg-slate-600 disabled:hover:bg-slate-700' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Export Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">download</span>
                    Export
                  </h2>

                  <div class="space-y-4">
                    <!-- Export Format Selector -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Export Format
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="format in exportFormats"
                          :key="format.value"
                          @click="selectedExportFormat = format.value"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="selectedExportFormat === format.value
                            ? (isDarkMode 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-600 text-white')
                            : (isDarkMode
                              ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                        >
                          {{ format.label }}
                        </button>
                      </div>
                    </div>

                    <!-- Code Preview -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Generated Code
                        </label>
                        <button
                          @click="copyCode"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                        >
                          <span class="material-symbols-outlined text-sm mr-1 align-middle">content_copy</span>
                          Copy
                        </button>
                      </div>
                      <textarea
                        :value="generatedCode"
                        readonly
                        class="w-full h-64 px-4 py-3 border rounded-lg font-mono text-sm resize-none"
                        :class="isDarkMode 
                          ? 'bg-slate-950 text-gray-100 border-gray-700' 
                          : 'bg-gray-50 text-gray-900 border-gray-300'"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'HTML', value: 'html' }
];

const config = ref({
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
  rowsPerPage: 10,
  selectionMode: 'none', // none, single, multiple
  stripedRows: true,
  hoverEffects: true
});

const columns = ref([
  { name: 'Name', type: 'text', sortable: true, filterable: true },
  { name: 'Age', type: 'number', sortable: true, filterable: true },
  { name: 'Email', type: 'text', sortable: true, filterable: true }
]);

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
const selectedRows = ref(new Set());

const selectedExportFormat = ref('react');

const filteredRows = computed(() => {
  let result = [...rows.value];
  
  // Apply filters
  if (config.value.enableFiltering) {
    Object.keys(filters.value).forEach(columnName => {
      const filterValue = filters.value[columnName]?.toLowerCase() || '';
      if (filterValue) {
        result = result.filter(row => {
          const cellValue = String(row[columnName] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });
  }
  
  // Apply sorting
  if (config.value.enableSorting && sortColumn.value) {
    const column = columns.value.find(c => c.name === sortColumn.value);
    if (column && column.sortable) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortColumn.value] || '';
        const bVal = b[sortColumn.value] || '';
        
        if (column.type === 'number') {
          const aNum = Number(aVal) || 0;
          const bNum = Number(bVal) || 0;
          return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum;
        } else if (column.type === 'date') {
          const aDate = new Date(aVal).getTime() || 0;
          const bDate = new Date(bVal).getTime() || 0;
          return sortDirection.value === 'asc' ? aDate - bDate : bDate - aDate;
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (sortDirection.value === 'asc') {
            return aStr.localeCompare(bStr);
          } else {
            return bStr.localeCompare(aStr);
          }
        }
      });
    }
  }
  
  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / config.value.rowsPerPage);
});

const paginatedRows = computed(() => {
  if (!config.value.enablePagination) {
    return filteredRows.value;
  }
  
  const start = (currentPage.value - 1) * config.value.rowsPerPage;
  const end = start + config.value.rowsPerPage;
  return filteredRows.value.slice(start, end);
});

const allSelected = computed(() => {
  if (config.value.selectionMode !== 'multiple') return false;
  return paginatedRows.value.length > 0 && paginatedRows.value.every((_, index) => {
    const actualIndex = (currentPage.value - 1) * config.value.rowsPerPage + index;
    return selectedRows.value.has(actualIndex);
  });
});

const addColumn = () => {
  columns.value.push({
    name: `Column ${columns.value.length + 1}`,
    type: 'text',
    sortable: true,
    filterable: true
  });
  
  // Add empty values for existing rows
  rows.value.forEach(row => {
    row[`Column ${columns.value.length}`] = '';
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
  
  // Remove filter
  delete filters.value[columnName];
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
  rows.value.splice(index, 1);
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
    return value ? 'Yes' : 'No';
  }
  
  return value;
};

const toggleRowSelection = (rowIndex) => {
  const actualIndex = (currentPage.value - 1) * config.value.rowsPerPage + rowIndex;
  
  if (config.value.selectionMode === 'single') {
    selectedRows.value.clear();
    selectedRows.value.add(actualIndex);
  } else if (config.value.selectionMode === 'multiple') {
    if (selectedRows.value.has(actualIndex)) {
      selectedRows.value.delete(actualIndex);
    } else {
      selectedRows.value.add(actualIndex);
    }
  }
};

const isRowSelected = (rowIndex) => {
  const actualIndex = (currentPage.value - 1) * config.value.rowsPerPage + rowIndex;
  return selectedRows.value.has(actualIndex);
};

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    paginatedRows.value.forEach((_, index) => {
      const actualIndex = (currentPage.value - 1) * config.value.rowsPerPage + index;
      selectedRows.value.add(actualIndex);
    });
  } else {
    paginatedRows.value.forEach((_, index) => {
      const actualIndex = (currentPage.value - 1) * config.value.rowsPerPage + index;
      selectedRows.value.delete(actualIndex);
    });
  }
};

const generatedCode = computed(() => {
  const columnsData = columns.value.map(c => ({
    name: c.name,
    type: c.type,
    sortable: c.sortable,
    filterable: c.filterable
  }));
  
  const rowsData = rows.value;
  
  if (selectedExportFormat.value === 'react') {
    return `import React, { useState, useMemo } from 'react';

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

export interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  config?: TableConfig;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns = ${JSON.stringify(columnsData, null, 2)},
  rows = ${JSON.stringify(rowsData, null, 2)},
  config = ${JSON.stringify(config.value, null, 2)}
}) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filteredRows = useMemo(() => {
    let result = [...rows];
    
    // Apply filters
    if (config.enableFiltering) {
      Object.keys(filters).forEach(columnName => {
        const filterValue = filters[columnName]?.toLowerCase() || '';
        if (filterValue) {
          result = result.filter(row => {
            const cellValue = String(row[columnName] || '').toLowerCase();
            return cellValue.includes(filterValue);
          });
        }
      });
    }
    
    // Apply sorting
    if (config.enableSorting && sortColumn) {
      const column = columns.find(c => c.name === sortColumn);
      if (column && column.sortable) {
        result = [...result].sort((a, b) => {
          const aVal = a[sortColumn] || '';
          const bVal = b[sortColumn] || '';
          
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
  }, [rows, filters, sortColumn, sortDirection, columns, config]);

  const totalPages = Math.ceil(filteredRows.length / (config.rowsPerPage || 10));
  const paginatedRows = config.enablePagination
    ? filteredRows.slice(
        (currentPage - 1) * (config.rowsPerPage || 10),
        currentPage * (config.rowsPerPage || 10)
      )
    : filteredRows;

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
              onChange={(e) => setFilters({ ...filters, [column.name]: e.target.value })}
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
                      checked={paginatedRows.every((_, i) => {
                        const actualIndex = (currentPage - 1) * (config.rowsPerPage || 10) + i;
                        return selectedRows.has(actualIndex);
                      })}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelected = new Set(selectedRows);
                          paginatedRows.forEach((_, i) => {
                            const actualIndex = (currentPage - 1) * (config.rowsPerPage || 10) + i;
                            newSelected.add(actualIndex);
                          });
                          setSelectedRows(newSelected);
                        } else {
                          const newSelected = new Set(selectedRows);
                          paginatedRows.forEach((_, i) => {
                            const actualIndex = (currentPage - 1) * (config.rowsPerPage || 10) + i;
                            newSelected.delete(actualIndex);
                          });
                          setSelectedRows(newSelected);
                        }
                      }}
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
            {paginatedRows.map((row, rowIndex) => {
              const actualIndex = (currentPage - 1) * (config.rowsPerPage || 10) + rowIndex;
              return (
                <tr
                  key={rowIndex}
                  className={\`
                    \${config.stripedRows && rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
                    \${config.hoverEffects ? 'hover:bg-indigo-50' : ''}
                    \${selectedRows.has(actualIndex) ? 'bg-indigo-100' : ''}
                  \`}
                >
                  {config.selectionMode !== 'none' && (
                    <td className="p-3 border">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(actualIndex)}
                        onChange={() => {
                          const newSelected = new Set(selectedRows);
                          if (config.selectionMode === 'single') {
                            newSelected.clear();
                            newSelected.add(actualIndex);
                          } else {
                            if (newSelected.has(actualIndex)) {
                              newSelected.delete(actualIndex);
                            } else {
                              newSelected.add(actualIndex);
                            }
                          }
                          setSelectedRows(newSelected);
                        }}
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
      {config.enablePagination && filteredRows.length > (config.rowsPerPage || 10) && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * (config.rowsPerPage || 10) + 1} to{' '}
            {Math.min(currentPage * (config.rowsPerPage || 10), filteredRows.length)} of{' '}
            {filteredRows.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
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
  } else if (selectedExportFormat.value === 'vue') {
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
              isRowSelected(rowIndex) ? 'bg-indigo-100' : ''
            ]"
          >
            <td v-if="config.selectionMode !== 'none'" class="p-3 border">
              <input
                type="checkbox"
                :checked="isRowSelected(rowIndex)"
                @change="toggleRowSelection(rowIndex)"
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
import { ref, computed } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => ${JSON.stringify(columnsData, null, 4)}
  },
  rows: {
    type: Array,
    default: () => ${JSON.stringify(rowsData, null, 4)}
  },
  config: {
    type: Object,
    default: () => ${JSON.stringify(config.value, null, 4)}
  }
});

const filters = ref({});
const sortColumn = ref(null);
const sortDirection = ref('asc');
const currentPage = ref(1);
const selectedRows = ref(new Set());

// Add computed properties and methods similar to the React version
` + scriptClose;
  } else {
    // HTML export
    return `<!-- Static HTML Table -->
<table class="w-full border-collapse">
  <thead>
    <tr class="bg-gray-100">
      ${columns.value.map(c => `<th class="p-3 text-left border font-semibold text-sm">${c.name}</th>`).join('\n      ')}
    </tr>
  </thead>
  <tbody>
    ${rows.value.map(row => `
    <tr>
      ${columns.value.map(c => `<td class="p-3 border text-sm">${row[c.name] || ''}</td>`).join('\n      ')}
    </tr>`).join('\n    ')}
  </tbody>
</table>`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.table-striped tbody tr:nth-child(even) {
  background-color: rgba(249, 250, 251, 1);
}

.dark .table-striped tbody tr:nth-child(even) {
  background-color: rgba(30, 41, 59, 0.5);
}

.table-hover tbody tr:hover {
  background-color: rgba(238, 242, 255, 1);
}

.dark .table-hover tbody tr:hover {
  background-color: rgba(30, 58, 138, 0.2);
}
</style>

