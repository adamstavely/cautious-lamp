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
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Library Export
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Export your design system components and documentation in various formats.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data source status -->
        <div class="max-w-7xl mx-auto mb-6 space-y-3">
          <div
            class="rounded-lg border px-4 py-3 flex items-center gap-3 text-sm"
            :class="isDarkMode ? 'bg-slate-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'"
          >
            <template v-if="dataLoading">
              <span class="material-symbols-outlined animate-spin" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">progress_activity</span>
              <span>Loading components and tokens...</span>
            </template>
            <template v-else-if="dataError">
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">error</span>
              <span class="flex-1">{{ dataError }}</span>
              <button
                type="button"
                @click="loadData"
                class="px-3 py-1 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Retry
              </button>
            </template>
            <template v-else>
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">database</span>
              <span>Exports are built from the live design system: {{ components.length }} components and {{ tokens.length }} tokens.</span>
            </template>
          </div>
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
        </div>

        <!-- Export Options -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Storybook -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'storybook'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    library_books
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Storybook
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Storybook project with a story for every component that has Vue source, plus your tokens.
              </p>
              <button
                @click.stop="exportStorybook"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Export Storybook
              </button>
            </div>

            <!-- PDF Documentation -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'pdf'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-red-900/30' : 'bg-red-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    description
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  PDF Documentation
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a comprehensive PDF document with all components and guidelines.
              </p>
              <button
                @click.stop="exportPDF"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Export PDF
              </button>
            </div>

            <!-- Markdown -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'markdown'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    article
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Markdown
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export components, props and tokens as a Markdown file for version control.
              </p>
              <button
                @click.stop="exportMarkdown"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'"
              >
                Export Markdown
              </button>
            </div>

            <!-- NPM Package -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'npm'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-green-900/30' : 'bg-green-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                    package_2
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  NPM Package
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate an NPM package with your Vue components and tokens as CSS, SCSS, JS and JSON.
              </p>
              <button
                @click.stop="exportNPM"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'"
              >
                Export NPM
              </button>
            </div>

            <!-- Static Site -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'static'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    public
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Static Site
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export as a static HTML site for hosting anywhere.
              </p>
              <button
                @click.stop="exportStatic"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Export Static
              </button>
            </div>

            <!-- Figma Plugin -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'figma'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">
                    extension
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Figma Plugin
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Figma plugin that creates color styles from your color tokens.
              </p>
              <button
                @click.stop="exportFigma"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'"
              >
                Export Plugin
              </button>
            </div>

            <!-- PenPot -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'penpot'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-pink-400' : 'text-pink-600'">
                    draw
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  PenPot
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export components and tokens for PenPot design tool.
              </p>
              <button
                @click.stop="exportPenPot"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'bg-pink-600 hover:bg-pink-700 text-white'"
              >
                Export PenPot
              </button>
            </div>

            <!-- Adobe XD -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'adobe-xd'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    palette
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Adobe XD
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export design tokens and component specifications for Adobe XD.
              </p>
              <button
                @click.stop="exportAdobeXD"
                :disabled="!canExport"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Export Adobe XD
              </button>
            </div>
          </div>
        </div>

        <!-- Export Settings -->
        <div v-if="exportFormat" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Export Settings
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Components
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="exportSettings.includeComponents" class="accent-indigo-600" />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">All components</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Tokens
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeTokens" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Design tokens</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Documentation
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeDocs" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Guidelines and examples</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Status -->
        <div v-if="exportStatus" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3">
              <span 
                class="material-symbols-outlined"
                :class="exportStatus === 'success' 
                  ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                  : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')"
              >
                {{ exportStatus === 'success' ? 'check_circle' : 'hourglass_empty' }}
              </span>
              <div class="flex-1">
                <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ exportStatus === 'success' ? 'Export completed successfully!' : 'Exporting...' }}
                </p>
                <p v-if="exportStatus === 'success'" class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Your export is ready for download.
                </p>
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
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();
const exportFormat = ref('');
const exportStatus = ref('');
const exportSettings = ref({
  includeComponents: true,
  includeTokens: true,
  includeDocs: true
});

// Live design-system data: GET /api/v1/components and GET /api/v1/tokens
const components = ref([]);
const tokens = ref([]);
const dataLoading = ref(false);
const dataError = ref('');
let statusTimer = null;

const canExport = computed(() => !dataLoading.value && !dataError.value && exportStatus.value !== 'processing');

const loadData = async () => {
  dataLoading.value = true;
  dataError.value = '';
  try {
    const [componentsResponse, tokensResponse] = await Promise.all([
      apiClient.get('/api/v1/components'),
      apiClient.get('/api/v1/tokens'),
    ]);
    components.value = Array.isArray(componentsResponse.data?.components) ? componentsResponse.data.components : [];
    tokens.value = Array.isArray(tokensResponse.data?.tokens) ? tokensResponse.data.tokens : [];
  } catch (error) {
    components.value = [];
    tokens.value = [];
    const status = error?.response?.status;
    dataError.value = status === 401
      ? 'The design-system API rejected the API key, so components and tokens could not be loaded.'
      : 'Could not load components and tokens from the design-system API.';
  } finally {
    dataLoading.value = false;
  }
};

const selectedComponents = () => (exportSettings.value.includeComponents ? components.value : []);
const selectedTokens = () => (exportSettings.value.includeTokens ? tokens.value : []);

// ---------- naming and value helpers (every format must stay valid) ----------

const SCRIPT_OPEN = '<' + 'script';
const SCRIPT_CLOSE = '<' + '/script>';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Markdown text on one line, with characters that would change the structure escaped
const escapeMarkdown = (value) => String(value ?? '').replace(/[\\`*_[\]<>|]/g, '\\$&').replace(/\s*\n\s*/g, ' ');

const toPascalCase = (value) => {
  const result = String(value ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  if (!result) return 'Component';
  return /^[0-9]/.test(result) ? `C${result}` : result;
};

const toFileId = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'component';

/** 'color.primary.500' -> 'color-primary-500', usable as a CSS/SCSS identifier */
const tokenIdentifier = (name) => {
  const id = String(name ?? '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return /^[0-9]/.test(id) || !id ? `t-${id}` : id;
};

const REFERENCE = /^\{([^{}]+)\}$/;
const tokenByName = () => new Map(tokens.value.map(t => [t.name, t]));

/** Follow '{other.token}' references to a literal value (null when unresolvable or circular) */
const resolveTokenValue = (token, byName = tokenByName()) => {
  let current = token;
  const seen = new Set();
  while (current) {
    const value = String(current.value ?? '');
    const match = value.match(REFERENCE);
    if (!match) return value;
    if (seen.has(current.name)) return null;
    seen.add(current.name);
    current = byName.get(match[1].trim());
  }
  return null;
};

// A value is safe to emit into CSS/SCSS only if it can't end the declaration or block
const isSafeCssValue = (value) => typeof value === 'string' && value.trim() !== '' && !/[;{}\\]|\/\*|\*\/|[\r\n]/.test(value) && !/^\s*!/.test(value);

/** CSS custom properties; references become var(--other) so the cascade keeps the alias */
const buildTokensCss = (list) => {
  const byName = tokenByName();
  const lines = [];
  const skipped = [];
  for (const token of list) {
    const raw = String(token.value ?? '');
    const ref = raw.match(REFERENCE);
    let value;
    if (ref && byName.has(ref[1].trim()) && resolveTokenValue(token, byName) !== null) {
      value = `var(--${tokenIdentifier(ref[1].trim())})`;
    } else {
      value = resolveTokenValue(token, byName);
    }
    if (!isSafeCssValue(value)) {
      skipped.push(token.name);
      continue;
    }
    lines.push(`  --${tokenIdentifier(token.name)}: ${value.trim()};`);
  }
  const header = '/* Design tokens, exported from the design system */';
  const note = skipped.length ? `\n/* Skipped (unresolvable or unsafe value): ${skipped.join(', ').replace(/\*\//g, '')} */` : '';
  return `${header}${note}\n:root {\n${lines.join('\n')}\n}\n`;
};

/** SCSS variables with references resolved to literal values (order-independent) */
const buildTokensScss = (list) => {
  const byName = tokenByName();
  const lines = ['// Design tokens, exported from the design system'];
  for (const token of list) {
    const value = resolveTokenValue(token, byName);
    if (!isSafeCssValue(value)) {
      lines.push(`// skipped ${tokenIdentifier(token.name)}: unresolvable or unsafe value`);
      continue;
    }
    lines.push(`$${tokenIdentifier(token.name)}: ${value.trim()};`);
  }
  return `${lines.join('\n')}\n`;
};

const tokensAsObject = (list) => {
  const byName = tokenByName();
  return Object.fromEntries(list.map(token => [token.name, resolveTokenValue(token, byName) ?? String(token.value ?? '')]));
};

const buildTokensJs = (list) =>
  `// Design tokens, exported from the design system (references resolved)\nexport const tokens = ${JSON.stringify(tokensAsObject(list), null, 2)};\n\nexport default tokens;\n`;

/** Design Tokens Community Group format, flat (dotted names would collide as groups) */
const DTCG_TYPES = { color: 'color', dimension: 'dimension', fontSize: 'dimension', fontFamily: 'fontFamily', fontWeight: 'fontWeight' };
const buildDtcgTokens = (list) => {
  const byName = tokenByName();
  const out = {};
  for (const token of list) {
    const raw = String(token.value ?? '');
    const ref = raw.match(REFERENCE);
    const entry = {
      $value: ref && byName.has(ref[1].trim()) ? `{${tokenIdentifier(ref[1].trim())}}` : raw,
    };
    if (DTCG_TYPES[token.type]) entry.$type = DTCG_TYPES[token.type];
    if (token.description) entry.$description = String(token.description);
    out[tokenIdentifier(token.name)] = entry;
  }
  return out;
};

const describeProp = (prop) => {
  const parts = [`${prop.name}: ${prop.type || 'any'}`];
  if (prop.options?.length) parts.push(`(${prop.options.join(' | ')})`);
  if (prop.required) parts.push('required');
  if (prop.default !== undefined && prop.default !== '') parts.push(`default ${JSON.stringify(prop.default)}`);
  return parts.join(' ');
};

// ---------- download helpers ----------

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const downloadFile = (content, filename, mimeType = 'text/plain') => {
  downloadBlob(new Blob([content], { type: `${mimeType};charset=utf-8` }), filename);
};

const downloadZip = async (files, zipFilename) => {
  const zip = new JSZip();
  files.forEach(file => zip.file(file.name, file.content));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipFilename);
};

/** Shared wrapper: data checks, status, and errors shown on the page */
const runExport = async (format, build) => {
  exportFormat.value = format;
  clearNotice();
  if (dataLoading.value) {
    showNotice('Components and tokens are still loading. Try again in a moment.', 'info');
    return;
  }
  if (dataError.value) {
    showNotice(dataError.value, 'error');
    return;
  }
  if (!selectedComponents().length && !selectedTokens().length) {
    showNotice('Nothing to export: select components or tokens (or the design system has none).', 'warning');
    return;
  }
  clearTimeout(statusTimer);
  exportStatus.value = 'processing';
  try {
    await build();
    exportStatus.value = 'success';
    statusTimer = setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
    showNotice(`Export failed: ${error?.message || 'unknown error'}`, 'error');
  }
};

const componentsWithVue = (list) => list.filter(comp => typeof comp.code?.vue === 'string' && comp.code.vue.trim());

const readmeComponentList = (list) => list.length
  ? list.map(c => `- **${escapeMarkdown(c.name)}** (\`${toFileId(c.id)}\`): ${escapeMarkdown(c.description)}`).join('\n')
  : '_No components included._';

const readmeTokenList = (list) => list.length
  ? list.map(t => `- \`${escapeMarkdown(t.name)}\`: \`${escapeMarkdown(t.value)}\` (${escapeMarkdown(t.type)})`).join('\n')
  : '_No tokens included._';

// ---------- formats ----------

const exportStorybook = () => runExport('storybook', async () => {
  const comps = componentsWithVue(selectedComponents());
  const skipped = selectedComponents().filter(c => !comps.includes(c));
  const toks = selectedTokens();
  const files = [];

  files.push({ name: 'package.json', content: JSON.stringify({
    name: 'design-system-storybook',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build'
    },
    dependencies: { vue: '^3.3.4' },
    devDependencies: {
      '@storybook/addon-essentials': '^7.6.0',
      '@storybook/vue3': '^7.6.0',
      '@storybook/vue3-vite': '^7.6.0',
      '@vitejs/plugin-vue': '^4.5.0',
      storybook: '^7.6.0',
      vite: '^5.0.0'
    }
  }, null, 2) });

  files.push({ name: '.storybook/main.js', content: `/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/vue3-vite', options: {} },
};

export default config;
` });
  files.push({ name: '.storybook/preview.js', content: toks.length ? `import '../src/tokens.css';\n\nexport default {};\n` : `export default {};\n` });
  if (toks.length) files.push({ name: 'src/tokens.css', content: buildTokensCss(toks) });

  const usedNames = new Set();
  for (const comp of comps) {
    let name = toPascalCase(comp.name || comp.id);
    while (usedNames.has(name)) name = `${name}X`;
    usedNames.add(name);
    files.push({ name: `src/components/${name}.vue`, content: comp.code.vue });
    const argTypes = {};
    const args = {};
    for (const prop of comp.props || []) {
      if (!prop?.name) continue;
      const argType = { description: prop.description || '' };
      if (prop.options?.length) {
        argType.control = 'select';
        argType.options = prop.options;
      } else if (prop.type === 'boolean') {
        argType.control = 'boolean';
      } else if (prop.type === 'number') {
        argType.control = 'number';
      } else if (prop.type === 'string') {
        argType.control = 'text';
      }
      argTypes[prop.name] = argType;
      if (prop.default !== undefined && ['string', 'number', 'boolean'].includes(typeof prop.default)) {
        args[prop.name] = prop.default;
      }
    }
    files.push({ name: `src/components/${name}.stories.js`, content: `import ${name} from './${name}.vue';

export default {
  title: ${JSON.stringify(`Components/${comp.name || name}`)},
  component: ${name},
  tags: ['autodocs'],
  parameters: { docs: { description: { component: ${JSON.stringify(comp.description || '')} } } },
  argTypes: ${JSON.stringify(argTypes, null, 2).replace(/\n/g, '\n  ')},
};

export const Default = {
  args: ${JSON.stringify(args, null, 2).replace(/\n/g, '\n  ')},
};
` });
  }

  if (exportSettings.value.includeDocs) {
    files.push({ name: 'README.md', content: `# Design System Storybook

Exported ${new Date().toISOString()}.

\`\`\`bash
npm install
npm run storybook
\`\`\`

## Components

${readmeComponentList(comps)}
${skipped.length ? `\nNot included (no Vue source in the design system): ${skipped.map(c => escapeMarkdown(c.name)).join(', ')}\n` : ''}
## Tokens

${toks.length ? `${toks.length} tokens in \`src/tokens.css\`, loaded by \`.storybook/preview.js\`.` : '_No tokens included._'}
` });
  }

  await downloadZip(files, 'design-system-storybook.zip');
});

const exportPDF = () => runExport('pdf', async () => {
  const comps = selectedComponents();
  const toks = selectedTokens();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = margin;

  const ensureSpace = (needed) => {
    if (yPos + needed > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };
  const writeLines = (text, { size = 11, style = 'normal', indent = 0, gap = 2 } = {}) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const lineHeight = size * 0.45;
    const lines = doc.splitTextToSize(String(text ?? ''), maxWidth - indent);
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
    yPos += gap;
  };

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Design System Documentation', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString()}  |  ${comps.length} components, ${toks.length} tokens`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 16;

  if (comps.length) {
    writeLines('Components', { size: 18, style: 'bold', gap: 4 });
    for (const comp of comps) {
      ensureSpace(20);
      writeLines(`${comp.name}  (${comp.status || 'unknown status'})`, { size: 13, style: 'bold', gap: 1 });
      if (comp.description) writeLines(comp.description, { indent: 4 });
      if (exportSettings.value.includeDocs) {
        for (const prop of comp.props || []) {
          writeLines(`- ${describeProp(prop)}${prop.description ? ` - ${prop.description}` : ''}`, { size: 10, indent: 6, gap: 0.5 });
        }
        if (comp.accessibility?.wcag) {
          writeLines(`Accessibility: WCAG ${comp.accessibility.wcag}${comp.accessibility.notes ? ` - ${comp.accessibility.notes}` : ''}`, { size: 10, indent: 4 });
        }
      }
      yPos += 4;
    }
  }

  if (toks.length) {
    ensureSpace(30);
    writeLines('Design Tokens', { size: 18, style: 'bold', gap: 4 });
    const categories = [...new Set(toks.map(t => t.category || 'other'))];
    for (const category of categories) {
      writeLines(category, { size: 13, style: 'bold', gap: 1 });
      for (const token of toks.filter(t => (t.category || 'other') === category)) {
        writeLines(`${token.name}: ${token.value}`, { size: 10, indent: 4, gap: 0.5 });
      }
      yPos += 3;
    }
  }

  doc.save('design-system-documentation.pdf');
});

const exportMarkdown = () => runExport('markdown', async () => {
  const comps = selectedComponents();
  const toks = selectedTokens();
  let markdown = '# Design System Documentation\n\n';
  markdown += `Generated on ${new Date().toISOString().slice(0, 10)}. ${comps.length} components, ${toks.length} tokens.\n\n`;

  if (comps.length) {
    markdown += '## Components\n\n';
    for (const comp of comps) {
      markdown += `### ${escapeMarkdown(comp.name)}\n\n`;
      markdown += `- **ID:** \`${escapeMarkdown(comp.id)}\`\n- **Status:** ${escapeMarkdown(comp.status || 'unknown')}\n\n`;
      if (comp.description) markdown += `${escapeMarkdown(comp.description)}\n\n`;
      if (exportSettings.value.includeDocs) {
        const props = comp.props || [];
        if (props.length) {
          markdown += '| Prop | Type | Required | Default | Description |\n|------|------|----------|---------|-------------|\n';
          for (const prop of props) {
            const type = prop.options?.length ? prop.options.map(o => `\`${escapeMarkdown(o)}\``).join(' \\| ') : `\`${escapeMarkdown(prop.type || 'any')}\``;
            const def = prop.default !== undefined && prop.default !== '' ? `\`${escapeMarkdown(JSON.stringify(prop.default))}\`` : '';
            markdown += `| \`${escapeMarkdown(prop.name)}\` | ${type} | ${prop.required ? 'yes' : 'no'} | ${def} | ${escapeMarkdown(prop.description || '')} |\n`;
          }
          markdown += '\n';
        } else {
          markdown += '_No props._\n\n';
        }
        if (comp.accessibility?.wcag) {
          markdown += `**Accessibility:** WCAG ${escapeMarkdown(comp.accessibility.wcag)}${comp.accessibility.notes ? `. ${escapeMarkdown(comp.accessibility.notes)}` : ''}\n\n`;
        }
      }
    }
  }

  if (toks.length) {
    markdown += '## Design Tokens\n\n| Token | Value | Type | Category |\n|-------|-------|------|----------|\n';
    for (const token of toks) {
      markdown += `| \`${escapeMarkdown(token.name)}\` | \`${escapeMarkdown(token.value)}\` | ${escapeMarkdown(token.type)} | ${escapeMarkdown(token.category)} |\n`;
    }
    markdown += '\n';
  }

  downloadFile(markdown, 'design-system-documentation.md', 'text/markdown');
});

const exportNPM = () => runExport('npm', async () => {
  const comps = componentsWithVue(selectedComponents());
  const toks = selectedTokens();
  const files = [];
  const exportsMap = { '.': './src/index.js' };
  if (toks.length) {
    Object.assign(exportsMap, {
      './tokens': './src/tokens.js',
      './tokens.css': './src/tokens.css',
      './tokens.scss': './src/tokens.scss',
      './tokens.json': './src/tokens.json',
    });
  }

  files.push({ name: 'package.json', content: JSON.stringify({
    name: '@designsystem/components',
    version: '1.0.0',
    description: 'Design System Component Library',
    type: 'module',
    main: './src/index.js',
    module: './src/index.js',
    exports: exportsMap,
    files: ['src'],
    sideEffects: ['*.css', '*.vue'],
    peerDependencies: { vue: '^3.3.0' }
  }, null, 2) });

  const usedNames = new Set();
  const indexLines = [];
  for (const comp of comps) {
    let name = toPascalCase(comp.name || comp.id);
    while (usedNames.has(name)) name = `${name}X`;
    usedNames.add(name);
    files.push({ name: `src/components/${name}.vue`, content: comp.code.vue });
    indexLines.push(`export { default as ${name} } from './components/${name}.vue';`);
  }
  if (toks.length) {
    indexLines.push(`export { tokens } from './tokens.js';`);
    files.push({ name: 'src/tokens.css', content: buildTokensCss(toks) });
    files.push({ name: 'src/tokens.scss', content: buildTokensScss(toks) });
    files.push({ name: 'src/tokens.js', content: buildTokensJs(toks) });
    files.push({ name: 'src/tokens.json', content: `${JSON.stringify(tokensAsObject(toks), null, 2)}\n` });
  }
  files.push({ name: 'src/index.js', content: indexLines.length ? `${indexLines.join('\n')}\n` : 'export {};\n' });

  const skipped = selectedComponents().filter(c => !comps.includes(c));
  files.push({ name: 'README.md', content: `# @designsystem/components

Vue 3 single-file components and design tokens exported from the design system. The package ships source (\`.vue\` files), so the consuming app's bundler must handle \`.vue\` (for example Vite with \`@vitejs/plugin-vue\`).

\`\`\`js
import { ${[...usedNames][0] || 'Button'} } from '@designsystem/components';
${toks.length ? "import '@designsystem/components/tokens.css';" : ''}
\`\`\`

${exportSettings.value.includeDocs ? `## Components\n\n${readmeComponentList(comps)}\n${skipped.length ? `\nNot included (no Vue source): ${skipped.map(c => escapeMarkdown(c.name)).join(', ')}\n` : ''}\n## Tokens\n\n${toks.length ? 'Available as CSS custom properties (`tokens.css`), SCSS variables (`tokens.scss`), a JS object (`tokens.js`) and JSON (`tokens.json`).' : '_No tokens included._'}\n` : ''}` });

  await downloadZip(files, 'design-system-npm-package.zip');
});

const exportStatic = () => runExport('static', async () => {
  const comps = selectedComponents();
  const toks = selectedTokens();
  const byName = tokenByName();
  const files = [];

  const tokenRows = toks.map(token => {
    const resolved = resolveTokenValue(token, byName);
    const swatch = token.type === 'color' && isSafeCssValue(resolved)
      ? `<span class="swatch" style="background: ${escapeHtml(resolved)}"></span>`
      : '';
    return `        <tr><td><code>${escapeHtml(token.name)}</code></td><td>${swatch}<code>${escapeHtml(token.value)}</code></td><td>${escapeHtml(token.type)}</td><td>${escapeHtml(token.category)}</td></tr>`;
  }).join('\n');

  const componentSections = comps.map(comp => {
    const props = exportSettings.value.includeDocs && (comp.props || []).length
      ? `\n      <ul>\n${comp.props.map(p => `        <li><code>${escapeHtml(describeProp(p))}</code>${p.description ? ` - ${escapeHtml(p.description)}` : ''}</li>`).join('\n')}\n      </ul>`
      : '';
    return `    <section class="component" data-search="${escapeHtml(`${comp.name} ${comp.description}`.toLowerCase())}">
      <h3>${escapeHtml(comp.name)} <span class="status">${escapeHtml(comp.status || '')}</span></h3>
      <p>${escapeHtml(comp.description)}</p>${props}
    </section>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Design System</h1>
  <p>Exported ${escapeHtml(new Date().toISOString().slice(0, 10))}. ${comps.length} components, ${toks.length} tokens.</p>
${comps.length ? `  <h2>Components</h2>
  <label>Filter <input id="filter" type="search" placeholder="Search components"></label>
  <div id="components">
${componentSections}
  </div>` : ''}
${toks.length ? `  <h2>Design Tokens</h2>
  <table>
    <thead><tr><th>Token</th><th>Value</th><th>Type</th><th>Category</th></tr></thead>
    <tbody>
${tokenRows}
    </tbody>
  </table>` : ''}
  ${SCRIPT_OPEN} src="app.js">${SCRIPT_CLOSE}
</body>
</html>
`;
  files.push({ name: 'index.html', content: html });

  const tokenCss = toks.length ? `${buildTokensCss(toks)}\n` : '';
  files.push({ name: 'styles.css', content: `${tokenCss}body { font-family: system-ui, sans-serif; margin: 2rem; color: #111827; }
.component { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
.component[hidden] { display: none; }
.status { font-size: 0.75rem; font-weight: 500; color: #6b7280; }
table { border-collapse: collapse; width: 100%; }
th, td { text-align: left; padding: 0.375rem 0.5rem; border-bottom: 1px solid #e5e7eb; }
.swatch { display: inline-block; width: 1rem; height: 1rem; border-radius: 0.25rem; border: 1px solid #d1d5db; margin-right: 0.5rem; vertical-align: middle; }
` });

  files.push({ name: 'app.js', content: `// Filters the component list by the search box
const filter = document.getElementById('filter');
if (filter) {
  filter.addEventListener('input', () => {
    const query = filter.value.trim().toLowerCase();
    document.querySelectorAll('.component').forEach((section) => {
      section.hidden = query !== '' && !section.dataset.search.includes(query);
    });
  });
}
` });

  await downloadZip(files, 'design-system-static-site.zip');
});

const exportFigma = () => runExport('figma', async () => {
  const toks = selectedTokens();
  const byName = tokenByName();
  const colors = toks
    .filter(t => t.type === 'color')
    .map(t => ({ name: t.name, value: resolveTokenValue(t, byName) }))
    .filter(t => typeof t.value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t.value.trim()));
  if (!colors.length) {
    throw new Error('The Figma plugin creates color styles, and no hex color tokens are selected.');
  }
  const files = [];

  files.push({ name: 'manifest.json', content: JSON.stringify({
    name: 'Design System Sync',
    id: 'design-system-sync',
    api: '1.0.0',
    main: 'code.js',
    ui: 'ui.html',
    editorType: ['figma'],
    networkAccess: { allowedDomains: ['none'] }
  }, null, 2) });

  files.push({ name: 'code.js', content: `// Figma plugin: creates or updates local color styles from the design-system tokens
const COLOR_TOKENS = ${JSON.stringify(colors, null, 2)};

function hexToPaint(hex) {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { type: 'SOLID', color: { r, g, b }, opacity: a };
}

figma.showUI(__html__, { width: 320, height: 180 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'sync-tokens') return;
  const existing = await figma.getLocalPaintStylesAsync();
  let created = 0;
  let updated = 0;
  for (const token of COLOR_TOKENS) {
    const styleName = token.name.split('.').join('/');
    let style = existing.find((s) => s.name === styleName);
    if (style) {
      updated += 1;
    } else {
      style = figma.createPaintStyle();
      style.name = styleName;
      created += 1;
    }
    style.paints = [hexToPaint(token.value)];
  }
  figma.notify('Color styles: ' + created + ' created, ' + updated + ' updated');
  figma.closePlugin();
};
` });

  files.push({ name: 'ui.html', content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Design System Sync</title>
  <style>body { font-family: sans-serif; padding: 12px; } button { padding: 8px 12px; }</style>
</head>
<body>
  <h1 style="font-size: 14px">Design System Sync</h1>
  <p style="font-size: 12px">Creates or updates ${colors.length} color styles.</p>
  <button id="sync">Sync color tokens</button>
  ${SCRIPT_OPEN}>
    document.getElementById('sync').onclick = function () {
      parent.postMessage({ pluginMessage: { type: 'sync-tokens' } }, '*');
    };
  ${SCRIPT_CLOSE}
</body>
</html>
` });

  if (exportSettings.value.includeDocs) {
    files.push({ name: 'README.md', content: `# Design System Sync (Figma plugin)

Creates or updates one local color style per color token (${colors.length} tokens; references are resolved, non-hex colors are skipped).

1. In Figma desktop: **Plugins > Development > Import plugin from manifest...**
2. Pick \`manifest.json\` from this folder.
3. Run **Design System Sync** and click **Sync color tokens**.
` });
  }

  await downloadZip(files, 'figma-design-system-plugin.zip');
});

const exportPenPot = () => runExport('penpot', async () => {
  const comps = selectedComponents();
  const toks = selectedTokens();
  const files = [];

  if (toks.length) {
    files.push({ name: 'tokens.json', content: `${JSON.stringify(buildDtcgTokens(toks), null, 2)}\n` });
  }
  if (comps.length) {
    files.push({ name: 'components.json', content: `${JSON.stringify({
      version: '1.0',
      name: 'Design System',
      exportedAt: new Date().toISOString(),
      components: comps.map(comp => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        status: comp.status,
        props: comp.props || [],
        accessibility: comp.accessibility || null,
      })),
    }, null, 2)}\n` });
  }

  if (exportSettings.value.includeDocs) {
    files.push({ name: 'README.md', content: `# PenPot Design System Export

## Tokens

${toks.length ? `\`tokens.json\` holds ${toks.length} tokens in the Design Tokens Community Group (DTCG) JSON format. In PenPot, open the **Tokens** panel and use **Import** to load it.

${readmeTokenList(toks)}` : '_No tokens included._'}

## Components

${comps.length ? `\`components.json\` is a reference specification (names, props, accessibility notes) for rebuilding the components in PenPot; PenPot has no import for component code.

${readmeComponentList(comps)}` : '_No components included._'}
` });
  }

  await downloadZip(files, 'penpot-design-system.zip');
});

const exportAdobeXD = () => runExport('adobe-xd', async () => {
  const comps = selectedComponents();
  const toks = selectedTokens();
  const byName = tokenByName();
  const files = [];
  const tokenEntry = (token, type) => ({
    name: tokenIdentifier(token.name),
    value: resolveTokenValue(token, byName) ?? String(token.value ?? ''),
    type,
    description: token.description || token.name,
  });

  const adobeXDData = {
    version: '1.0.0',
    name: 'Design System',
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Design System Platform',
      format: 'design-spec-json'
    },
    designTokens: toks.length ? {
      colors: toks.filter(t => t.type === 'color').map(t => tokenEntry(t, 'color')),
      spacing: toks.filter(t => t.category === 'spacing').map(t => tokenEntry(t, 'spacing')),
      typography: toks.filter(t => t.category === 'typography').map(t => tokenEntry(t, t.type)),
      other: toks
        .filter(t => t.type !== 'color' && t.category !== 'spacing' && t.category !== 'typography')
        .map(t => tokenEntry(t, t.type)),
    } : {},
    components: comps.map(comp => ({
      name: comp.name,
      description: comp.description,
      type: 'component',
      properties: (comp.props || []).map(prop => ({
        name: prop.name,
        type: prop.type,
        options: prop.options || null,
        required: !!prop.required,
        defaultValue: prop.default ?? null,
        description: prop.description || ''
      })),
      ...(exportSettings.value.includeDocs ? { specifications: { code: comp.code || {}, framework: ['vue', 'react'] } } : {}),
    })),
  };

  files.push({ name: 'design-system-xd-spec.json', content: `${JSON.stringify(adobeXDData, null, 2)}\n` });

  if (exportSettings.value.includeDocs) {
    files.push({ name: 'README.md', content: `# Adobe XD Design Spec

\`design-system-xd-spec.json\` holds the design tokens (references resolved) and component specifications as JSON. Import the tokens with an XD plugin that reads JSON design tokens, and use the component specifications as a reference when building XD components.

## Design Tokens

${readmeTokenList(toks)}

## Components

${readmeComponentList(comps)}
` });
  }

  await downloadZip(files, 'adobe-xd-design-system.zip');
});

onMounted(loadData);
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

