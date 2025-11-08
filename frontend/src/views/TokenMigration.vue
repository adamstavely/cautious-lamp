<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Token Migration
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Migrate design tokens between formats, versions, and naming conventions. Automated migration with step-by-step guidance.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="tokenMigrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Token boxes representing migration -->
                    <rect x="30" y="40" width="50" height="30" rx="4" fill="url(#tokenMigrationGradient)" opacity="0.5"/>
                    <rect x="120" y="40" width="50" height="30" rx="4" fill="url(#tokenMigrationGradient)" opacity="0.7"/>
                    <!-- Arrow -->
                    <path d="M 85 55 L 115 55" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                    <path d="M 110 50 L 115 55 L 110 60" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"/>
                    <!-- Token format icons -->
                    <circle cx="55" cy="100" r="20" fill="url(#tokenMigrationGradient)" opacity="0.4"/>
                    <circle cx="145" cy="100" r="20" fill="url(#tokenMigrationGradient)" opacity="0.6"/>
                    <rect x="45" y="130" width="20" height="20" rx="2" fill="url(#tokenMigrationGradient)" opacity="0.4"/>
                    <rect x="135" y="130" width="20" height="20" rx="2" fill="url(#tokenMigrationGradient)" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Token Migration Setup -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Token Migration Setup -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">palette</span>
                Token Migration Setup
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Type
                  </label>
                  <Dropdown
                    :model-value="tokenMigration.type"
                    @update:model-value="tokenMigration.type = $event"
                    :options="migrationTypeOptions"
                    :is-dark-mode="isDarkMode"
                  />
                </div>
                <div v-if="tokenMigration.type === 'format'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Format
                  </label>
                  <Dropdown
                    :model-value="tokenMigration.fromFormat"
                    @update:model-value="tokenMigration.fromFormat = $event"
                    :options="formatOptions"
                    :is-dark-mode="isDarkMode"
                  />
                </div>
                <div v-if="tokenMigration.type === 'format'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Format
                  </label>
                  <Dropdown
                    :model-value="tokenMigration.toFormat"
                    @update:model-value="tokenMigration.toFormat = $event"
                    :options="formatOptions"
                    :is-dark-mode="isDarkMode"
                  />
                </div>
                <div v-if="tokenMigration.type === 'version'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Version
                  </label>
                  <input
                    v-model="tokenMigration.fromVersion"
                    type="text"
                    placeholder="1.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'version'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Version
                  </label>
                  <input
                    v-model="tokenMigration.toVersion"
                    type="text"
                    placeholder="2.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'rename'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Old Token Name
                  </label>
                  <input
                    v-model="tokenMigration.oldName"
                    type="text"
                    placeholder="color.primary"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div v-if="tokenMigration.type === 'rename'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    New Token Name
                  </label>
                  <input
                    v-model="tokenMigration.newName"
                    type="text"
                    placeholder="color.brand.primary"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Upload Token File
                  </label>
                  <input
                    type="file"
                    @change="handleTokenFileUpload"
                    accept=".json,.css,.scss,.plist,.xml"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="tokenMigration.dryRun"
                    id="token-dry-run"
                    class="accent-indigo-600"
                  />
                  <label for="token-dry-run" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Dry Run (Preview Only)
                  </label>
                </div>
                <button
                  @click="analyzeTokenMigration"
                  :disabled="!canAnalyzeToken"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="canAnalyzeToken
                    ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Analyze Migration
                </button>
              </div>
            </div>

            <!-- Rollback -->
            <div 
              v-if="tokenMigrationResults && !tokenMigration.dryRun"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">undo</span>
                Rollback
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Revert the migration if needed
              </p>
              <button
                @click="rollbackTokenMigration"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Rollback Migration
              </button>
            </div>
          </div>

          <!-- Right Column: Token Migration Plan & Results -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Migration Progress -->
            <div 
              v-if="tokenMigrationProgress.isRunning"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">progress_activity</span>
                Migration Progress
              </h3>
              <div class="space-y-3">
                <div class="w-full bg-gray-200 rounded-full h-2.5" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="`width: ${tokenMigrationProgress.percentage}%`"
                  ></div>
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ tokenMigrationProgress.currentStep }} / {{ tokenMigrationProgress.totalSteps }} steps completed
                </div>
                <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ tokenMigrationProgress.currentFile }}
                </div>
              </div>
            </div>

            <!-- Migration Plan -->
            <div 
              v-if="tokenMigrationPlan"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Token Migration Plan
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    v-if="tokenMigrationPlan.outputFile"
                    @click="downloadTokenOutput"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'"
                  >
                    Download Output
                  </button>
                  <button
                    @click="executeTokenMigration"
                    :disabled="tokenMigration.dryRun || tokenMigrationProgress.isRunning"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="!tokenMigration.dryRun && !tokenMigrationProgress.isRunning
                      ? (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Execute Migration
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(step, index) in tokenMigrationPlan.steps"
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="step.type === 'breaking'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200')"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="step.type === 'breaking' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ step.title }}
                      </div>
                      <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ step.description }}
                      </div>
                      <div v-if="step.code" class="rounded-lg overflow-hidden mt-2" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                        <div class="p-3">
                          <div class="text-xs text-green-400 font-mono whitespace-pre-wrap" v-pre><code>{{ step.code }}</code></div>
                        </div>
                      </div>
                      <div v-if="step.example" class="mt-2 p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                        <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Example:</div>
                        <div class="text-xs font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ step.example }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Migration Results -->
            <div 
              v-if="tokenMigrationResults"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Token Migration Results
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500">check_circle</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.tokensMigrated }} tokens migrated
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">info</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.filesProcessed }} files processed
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-yellow-500">warning</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ tokenMigrationResults.warnings }} warnings
                  </span>
                </div>
                <div v-if="tokenMigrationResults.outputPreview" class="mt-4">
                  <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Output Preview
                  </div>
                  <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                    <div class="p-3">
                      <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">{{ tokenMigrationResults.outputPreview }}</pre>
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
import Dropdown from '../components/Dropdown.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

// Token Migration State
const tokenMigration = ref({
  type: 'format',
  fromFormat: 'dtcg',
  toFormat: 'css',
  fromVersion: '',
  toVersion: '',
  oldName: '',
  newName: '',
  dryRun: true,
  uploadedFile: null
});

const tokenMigrationPlan = ref(null);
const tokenMigrationResults = ref(null);
const tokenMigrationProgress = ref({
  isRunning: false,
  percentage: 0,
  currentStep: 0,
  totalSteps: 0,
  currentFile: ''
});

const migrationTypeOptions = computed(() => [
  { label: 'Format Conversion', value: 'format' },
  { label: 'Version Migration', value: 'version' },
  { label: 'Token Rename', value: 'rename' },
  { label: 'Merge Tokens', value: 'merge' }
]);

const formatOptions = computed(() => [
  { label: 'DTCG JSON', value: 'dtcg' },
  { label: 'CSS Variables', value: 'css' },
  { label: 'SCSS Variables', value: 'scss' },
  { label: 'iOS (Plist)', value: 'ios' },
  { label: 'Android (XML)', value: 'android' },
  { label: 'Style Dictionary', value: 'style-dictionary' }
]);

const canAnalyzeToken = computed(() => {
  if (tokenMigration.value.type === 'format') {
    return tokenMigration.value.fromFormat && tokenMigration.value.toFormat && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'version') {
    return tokenMigration.value.fromVersion && tokenMigration.value.toVersion && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'rename') {
    return tokenMigration.value.oldName && tokenMigration.value.newName && tokenMigration.value.uploadedFile;
  } else if (tokenMigration.value.type === 'merge') {
    return tokenMigration.value.uploadedFile;
  }
  return false;
});

const handleTokenFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    tokenMigration.value.uploadedFile = file;
  }
};

const analyzeTokenMigration = async () => {
  if (!canAnalyzeToken.value) return;
  
  const file = tokenMigration.value.uploadedFile;
  if (!file) return;

  try {
    const fileContent = await readFileContent(file);
    
    if (tokenMigration.value.type === 'format') {
      // Format conversion migration
      tokenMigrationPlan.value = {
        type: 'format',
        fromFormat: tokenMigration.value.fromFormat,
        toFormat: tokenMigration.value.toFormat,
        steps: [
          {
            type: 'update',
            title: 'Parse Source Format',
            description: `Reading tokens from ${tokenMigration.value.fromFormat.toUpperCase()} format`,
            code: `// Reading from ${tokenMigration.value.fromFormat}\nconst tokens = parse${tokenMigration.value.fromFormat.toUpperCase()}(fileContent);`
          },
          {
            type: 'update',
            title: 'Convert Token Structure',
            description: `Converting to ${tokenMigration.value.toFormat.toUpperCase()} format`,
            code: `// Converting to ${tokenMigration.value.toFormat}\nconst converted = convertTo${tokenMigration.value.toFormat.toUpperCase()}(tokens);`
          },
          {
            type: 'update',
            title: 'Generate Output',
            description: `Generating ${tokenMigration.value.toFormat.toUpperCase()} output file`,
            code: `// Output format: ${tokenMigration.value.toFormat}\nconst output = generate${tokenMigration.value.toFormat.toUpperCase()}(converted);`
          }
        ],
        outputFile: `tokens.${getFileExtension(tokenMigration.value.toFormat)}`
      };
      
      // Generate preview
      const preview = generateTokenPreview(fileContent, tokenMigration.value.fromFormat, tokenMigration.value.toFormat);
      tokenMigrationPlan.value.outputPreview = preview;
    } else if (tokenMigration.value.type === 'version') {
      // Version migration
      tokenMigrationPlan.value = {
        type: 'version',
        fromVersion: tokenMigration.value.fromVersion,
        toVersion: tokenMigration.value.toVersion,
        steps: [
          {
            type: 'breaking',
            title: 'Update Token References',
            description: `Updating token references from v${tokenMigration.value.fromVersion} to v${tokenMigration.value.toVersion}`,
            code: `// Old\ncolor.primary.v${tokenMigration.value.fromVersion}\n\n// New\ncolor.primary.v${tokenMigration.value.toVersion}`
          },
          {
            type: 'update',
            title: 'Update Import Paths',
            description: 'Updating import statements to new version',
            code: `// Old\nimport tokens from '@/tokens/v${tokenMigration.value.fromVersion}';\n\n// New\nimport tokens from '@/tokens/v${tokenMigration.value.toVersion}';`
          }
        ]
      };
    } else if (tokenMigration.value.type === 'rename') {
      // Token rename migration
      tokenMigrationPlan.value = {
        type: 'rename',
        oldName: tokenMigration.value.oldName,
        newName: tokenMigration.value.newName,
        steps: [
          {
            type: 'breaking',
            title: 'Rename Token References',
            description: `Renaming token from "${tokenMigration.value.oldName}" to "${tokenMigration.value.newName}"`,
            code: `// Old\n\${tokens['${tokenMigration.value.oldName}']}\n\n// New\n\${tokens['${tokenMigration.value.newName}']}`
          },
          {
            type: 'update',
            title: 'Update CSS Variables',
            description: 'Updating CSS variable names',
            code: `// Old\n--${tokenMigration.value.oldName.replace(/\./g, '-')}\n\n// New\n--${tokenMigration.value.newName.replace(/\./g, '-')}`
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error analyzing token migration:', error);
    alert('Error analyzing token migration. Please check the file format.');
  }
};

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const generateTokenPreview = (content, fromFormat, toFormat) => {
  // Generate a preview of the converted tokens
  if (toFormat === 'css') {
    return `:root {\n  --color-primary: #6366f1;\n  --color-secondary: #8b5cf6;\n  --spacing-sm: 0.5rem;\n  --spacing-md: 1rem;\n}`;
  } else if (toFormat === 'scss') {
    return `$color-primary: #6366f1;\n$color-secondary: #8b5cf6;\n$spacing-sm: 0.5rem;\n$spacing-md: 1rem;`;
  } else if (toFormat === 'dtcg') {
    return `{\n  "color": {\n    "primary": {\n      "$value": "#6366f1",\n      "$type": "color"\n    }\n  }\n}`;
  }
  return content.substring(0, 200) + '...';
};

const getFileExtension = (format) => {
  const extensions = {
    'dtcg': 'json',
    'css': 'css',
    'scss': 'scss',
    'ios': 'plist',
    'android': 'xml',
    'style-dictionary': 'json'
  };
  return extensions[format] || 'json';
};

const downloadTokenOutput = () => {
  if (!tokenMigrationPlan.value || !tokenMigrationPlan.value.outputPreview) return;
  
  const blob = new Blob([tokenMigrationPlan.value.outputPreview], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = tokenMigrationPlan.value.outputFile || 'tokens-migrated.json';
  link.click();
  URL.revokeObjectURL(url);
};

const executeTokenMigration = async () => {
  if (tokenMigration.value.dryRun) return;
  
  tokenMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: tokenMigrationPlan.value.steps.length,
    currentFile: ''
  };
  
  // Simulate migration with progress
  for (let i = 0; i < tokenMigrationPlan.value.steps.length; i++) {
    tokenMigrationProgress.value.currentStep = i + 1;
    tokenMigrationProgress.value.percentage = Math.round(((i + 1) / tokenMigrationPlan.value.steps.length) * 100);
    tokenMigrationProgress.value.currentFile = `Processing tokens...`;
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  tokenMigrationProgress.value.isRunning = false;
  
  tokenMigrationResults.value = {
    tokensMigrated: 45,
    filesProcessed: 12,
    warnings: 2,
    outputPreview: tokenMigrationPlan.value.outputPreview
  };
};

const rollbackTokenMigration = async () => {
  if (!confirm('Are you sure you want to rollback this migration?')) return;
  
  tokenMigrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: tokenMigrationPlan.value.steps.length,
    currentFile: 'Rolling back...'
  };
  
  // Simulate rollback
  for (let i = 0; i < tokenMigrationPlan.value.steps.length; i++) {
    tokenMigrationProgress.value.currentStep = i + 1;
    tokenMigrationProgress.value.percentage = Math.round(((i + 1) / tokenMigrationPlan.value.steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  tokenMigrationProgress.value.isRunning = false;
  tokenMigrationResults.value = null;
  tokenMigrationPlan.value = null;
  alert('Token migration rolled back successfully');
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
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
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
</style>

