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
                  Migration Assistant
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Migrate components from old versions to new versions. Automated migration with step-by-step guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Migration Setup -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Migration Setup -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Migration Setup
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Migration Type
                  </label>
                  <select
                    v-model="migration.type"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="single">Single Component</option>
                    <option value="batch">Batch Migration</option>
                    <option value="template">Migration Template</option>
                  </select>
                </div>
                <div v-if="migration.type === 'single'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Component
                  </label>
                  <select
                    v-model="migration.component"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="">Select component...</option>
                    <option value="button">Button</option>
                    <option value="card">Card</option>
                    <option value="modal">Modal</option>
                    <option value="input">Input</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div v-if="migration.type === 'batch'">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Components (comma-separated)
                  </label>
                  <input
                    v-model="migration.components"
                    type="text"
                    placeholder="button, card, modal"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    From Version
                  </label>
                  <input
                    v-model="migration.fromVersion"
                    type="text"
                    placeholder="2.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    To Version
                  </label>
                  <input
                    v-model="migration.toVersion"
                    type="text"
                    placeholder="3.0.0"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="migration.dryRun"
                    id="dry-run"
                    class="accent-indigo-600"
                  />
                  <label for="dry-run" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Dry Run (Preview Only)
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="migration.generateCodemod"
                    id="codemod"
                    class="accent-indigo-600"
                  />
                  <label for="codemod" class="text-sm cursor-pointer" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Generate Codemod
                  </label>
                </div>
                <button
                  @click="analyzeMigration"
                  :disabled="!canAnalyze"
                  class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="canAnalyze
                    ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                >
                  Analyze Migration
                </button>
              </div>
            </div>

            <!-- Migration Templates -->
            <div 
              v-if="migration.type === 'template'"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Templates
              </h3>
              <div class="space-y-2">
                <button
                  v-for="template in migrationTemplates"
                  :key="template.id"
                  @click="loadTemplate(template)"
                  class="w-full p-3 rounded-lg border text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                >
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ template.name }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ template.fromVersion }} → {{ template.toVersion }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Rollback -->
            <div 
              v-if="migrationResults && !migration.dryRun"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Rollback
              </h3>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Revert the migration if needed
              </p>
              <button
                @click="rollbackMigration"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Rollback Migration
              </button>
            </div>
          </div>

          <!-- Right Column: Migration Plan & Results -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Migration Progress -->
            <div 
              v-if="migrationProgress.isRunning"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Migration Progress
              </h3>
              <div class="space-y-3">
                <div class="w-full bg-gray-200 rounded-full h-2.5" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    :style="`width: ${migrationProgress.percentage}%`"
                  ></div>
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ migrationProgress.currentStep }} / {{ migrationProgress.totalSteps }} steps completed
                </div>
                <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ migrationProgress.currentFile }}
                </div>
              </div>
            </div>

            <!-- Migration Plan -->
            <div 
              v-if="migrationPlan"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Migration Plan
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    v-if="migration.generateCodemod && codemodScript"
                    @click="downloadCodemod"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="isDarkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'"
                  >
                    Download Codemod
                  </button>
                  <button
                    @click="executeMigration"
                    :disabled="migration.dryRun || migrationProgress.isRunning"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="!migration.dryRun && !migrationProgress.isRunning
                      ? (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Execute Migration
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(step, index) in migrationPlan.steps"
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
                          <div class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ step.code }}</code></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Migration Results -->
            <div 
              v-if="migrationResults"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Migration Results
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500">check_circle</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ migrationResults.filesMigrated }} files migrated
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">info</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ migrationResults.warnings }} warnings
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-yellow-500">warning</span>
                  <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ migrationResults.manualSteps }} manual steps required
                  </span>
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const migration = ref({
  type: 'single',
  component: '',
  components: '',
  fromVersion: '',
  toVersion: '',
  dryRun: true,
  generateCodemod: false
});
const migrationPlan = ref(null);
const migrationResults = ref(null);
const migrationProgress = ref({
  isRunning: false,
  percentage: 0,
  currentStep: 0,
  totalSteps: 0,
  currentFile: ''
});
const codemodScript = ref('');
const migrationTemplates = ref([
  { id: 1, name: 'Button v2 → v3', fromVersion: '2.0.0', toVersion: '3.0.0', component: 'button' },
  { id: 2, name: 'Card v1 → v2', fromVersion: '1.0.0', toVersion: '2.0.0', component: 'card' },
  { id: 3, name: 'Modal v2 → v3', fromVersion: '2.0.0', toVersion: '3.0.0', component: 'modal' }
]);

const canAnalyze = computed(() => {
  if (migration.value.type === 'single') {
    return migration.value.component && migration.value.fromVersion && migration.value.toVersion;
  } else if (migration.value.type === 'batch') {
    return migration.value.components && migration.value.fromVersion && migration.value.toVersion;
  }
  return migration.value.fromVersion && migration.value.toVersion;
});

const analyzeMigration = () => {
  if (!canAnalyze.value) return;
  
  const components = migration.value.type === 'batch' 
    ? migration.value.components.split(',').map(c => c.trim())
    : [migration.value.component];
  
  migrationPlan.value = {
    components: components,
    fromVersion: migration.value.fromVersion,
    toVersion: migration.value.toVersion,
    steps: [
      {
        type: 'breaking',
        title: 'Update Import Statement',
        description: 'Change import path to new version',
        code: `// Old\nimport Button from '@/components/v2/Button';\n\n// New\nimport Button from '@/components/v3/Button';`
      },
      {
        type: 'breaking',
        title: 'Update Prop Names',
        description: 'Rename "isOpen" prop to "open"',
        code: `// Old\n<Button isOpen={true} />\n\n// New\n<Button open={true} />`
      },
      {
        type: 'update',
        title: 'Update Event Handlers',
        description: 'Update event handler names',
        code: `// Old\n@click="handleClick"\n\n// New\n@click="onClick"`
      }
    ]
  };
  
  if (migration.value.generateCodemod) {
    generateCodemod();
  }
};

const generateCodemod = () => {
  codemodScript.value = `// Codemod for ${migration.value.component || 'components'} ${migration.value.fromVersion} → ${migration.value.toVersion}
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Transform imports
  root.find(j.ImportDeclaration)
    .filter(path => path.value.source.value.includes('v${migration.value.fromVersion}'))
    .replaceWith(path => {
      return j.importDeclaration(
        path.value.specifiers,
        j.literal(path.value.source.value.replace('v${migration.value.fromVersion}', 'v${migration.value.toVersion}'))
      );
    });
  
  // Transform props
  root.find(j.JSXAttribute, { name: { name: 'isOpen' } })
    .replaceWith(path => {
      return j.jsxAttribute(j.jsxIdentifier('open'), path.value.value);
    });
  
  return root.toSource();
};`;
};

const loadTemplate = (template) => {
  migration.value.component = template.component;
  migration.value.fromVersion = template.fromVersion;
  migration.value.toVersion = template.toVersion;
  analyzeMigration();
};

const downloadCodemod = () => {
  const blob = new Blob([codemodScript.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `codemod-${migration.value.component || 'components'}.js`;
  link.click();
  URL.revokeObjectURL(url);
};

const executeMigration = async () => {
  if (migration.value.dryRun) return;
  
  migrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: migrationPlan.value.steps.length,
    currentFile: ''
  };
  
  // Simulate migration with progress
  for (let i = 0; i < migrationPlan.value.steps.length; i++) {
    migrationProgress.value.currentStep = i + 1;
    migrationProgress.value.percentage = Math.round(((i + 1) / migrationPlan.value.steps.length) * 100);
    migrationProgress.value.currentFile = `Migrating ${migrationPlan.value.components[0]}...`;
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  migrationProgress.value.isRunning = false;
  
  migrationResults.value = {
    filesMigrated: migration.value.type === 'batch' ? migrationPlan.value.components.length * 4 : 12,
    warnings: 3,
    manualSteps: 2
  };
};

const rollbackMigration = async () => {
  if (!confirm('Are you sure you want to rollback this migration?')) return;
  
  migrationProgress.value = {
    isRunning: true,
    percentage: 0,
    currentStep: 0,
    totalSteps: migrationPlan.value.steps.length,
    currentFile: 'Rolling back...'
  };
  
  // Simulate rollback
  for (let i = 0; i < migrationPlan.value.steps.length; i++) {
    migrationProgress.value.currentStep = i + 1;
    migrationProgress.value.percentage = Math.round(((i + 1) / migrationPlan.value.steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  migrationProgress.value.isRunning = false;
  migrationResults.value = null;
  migrationPlan.value = null;
  alert('Migration rolled back successfully');
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
</style>

