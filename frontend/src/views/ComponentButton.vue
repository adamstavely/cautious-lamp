<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Button"
      lead="A versatile button component for triggering actions throughout your application. Supports multiple variants, sizes, and states."
      spot="foundations/component-button"
      size="tool"
    >
      <template #actions>
        <UiChip :tone="componentStatusTone(componentStatus)">{{ componentStatus || 'Production Ready' }}</UiChip>
      </template>
    </PageHero>

    <BreakingChangeAlert
      :component-versions="componentVersions"
      :component-id="getComponentId()"
      @dismiss="() => {}"
    />

    <!-- Interactive playground -->
    <PageSection
      title="Interactive playground"
      description="Experiment with the Button component. Edit props, see live previews, and export code snippets."
    >
      <template #actions>
        <UiButton variant="primary" icon="share" label="Share playground" @click="sharePlayground" />
        <UiButton
          v-if="sharedPlaygroundUrl"
          :icon="shareUrlCopied ? 'check' : 'content_copy'"
          :label="shareUrlCopied ? 'Copied!' : 'Copy link'"
          @click="copyShareUrl"
        />
      </template>

      <UiCallout v-if="sharedPlaygroundUrl" tone="success" role="status" class="mb-6">
        Playground shared! Share this URL: <UiCode class="break-all">{{ sharedPlaygroundUrl }}</UiCode>
      </UiCallout>

      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <UiPanel title="Props editor">
          <div class="space-y-4">
            <UiInput v-model="propValues.label" label="Label" hint="Button text" placeholder="Click me" required />
            <UiSelect v-model="propValues.variant" label="Variant" :options="variantOptions" />
            <UiSelect v-model="propValues.size" label="Size" :options="sizeOptions" />
            <UiCheckbox v-model="propValues.disabled" label="Disabled" />
            <UiCheckbox v-model="propValues.loading" label="Loading" />
          </div>
        </UiPanel>

        <UiPanel title="Live preview">
          <template #actions>
            <UiButton
              size="sm"
              variant="ghost"
              :icon="previewDarkMode ? 'dark_mode' : 'light_mode'"
              :label="previewDarkMode ? 'Dark' : 'Light'"
              :aria-pressed="previewDarkMode"
              @click="previewDarkMode = !previewDarkMode"
            />
            <UiButton size="sm" variant="ghost" icon="fullscreen" icon-only label="Toggle fullscreen" @click="toggleFullscreen" />
          </template>
          <div class="preview-stage" :class="previewDarkMode ? 'bg-surface-inverse dark' : 'bg-surface-sunken'">
            <component-preview
              :key="`button-${JSON.stringify(propValues)}`"
              component="button"
              :props="propValues"
              :is-dark-mode="previewDarkMode"
            />
          </div>
        </UiPanel>
      </div>

      <UiPanel title="Generated code" description="Pick a format; choosing one also copies it.">
        <template #actions>
          <UiButton
            v-for="format in codeFormats"
            :key="format.value"
            size="sm"
            :variant="codeFormat === format.value ? 'primary' : 'secondary'"
            :aria-pressed="codeFormat === format.value"
            :label="format.label"
            @click="format.export"
          />
        </template>
        <UiCodeBlock :code="generatedCode" :label="codeFormatLabel" />
      </UiPanel>
    </PageSection>

    <!-- Variants -->
    <PageSection title="Variants" description="Explore different button styles and use cases." divided>
      <template #actions>
        <UiButton
          :variant="showVariantBuilder ? 'primary' : 'secondary'"
          :icon="showVariantBuilder ? 'remove' : 'add'"
          :label="showVariantBuilder ? 'Hide builder' : 'Create variant'"
          :aria-expanded="showVariantBuilder"
          @click="showVariantBuilder = !showVariantBuilder"
        />
      </template>

      <UiPanel v-if="showVariantBuilder" title="Variant builder" class="mb-6">
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <UiInput v-model="newVariant.name" label="Variant name" placeholder="e.g., success, danger, outline" required />
            <UiTextarea v-model="newVariant.description" label="Description" :rows="2" placeholder="Describe when to use this variant..." />

            <div class="space-y-4 pt-4 border-t border-line-faint">
              <h3 class="text-sm font-semibold text-ink-strong">Properties</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <UiInput v-model="newVariant.properties.backgroundColor" label="Background" placeholder="indigo-600 or {color.primary}" />
                <UiInput v-model="newVariant.properties.textColor" label="Text color" placeholder="white or {color.text}" />
                <UiSelect v-model="newVariant.properties.borderRadius" label="Border radius" :options="radiusOptions" />
                <UiSelect v-model="newVariant.properties.padding" label="Padding" :options="paddingOptions" />
              </div>

              <div class="pt-4 border-t border-line-faint space-y-4">
                <UiCheckbox v-model="showHoverState" label="Configure hover state" />
                <div v-if="showHoverState" class="grid sm:grid-cols-2 gap-4">
                  <UiInput v-model="newVariant.properties.hover.backgroundColor" label="Hover background" placeholder="indigo-700" />
                  <UiInput v-model="newVariant.properties.hover.textColor" label="Hover text" placeholder="white" />
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3 pt-2">
              <UiButton
                variant="primary"
                icon="save"
                :loading="savingVariant"
                :disabled="!newVariant.name"
                :label="savingVariant ? 'Saving...' : 'Save variant'"
                @click="saveVariant"
              />
              <UiButton label="Reset" @click="resetVariantBuilder" />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-ink-strong">Live preview</h3>
            <div class="demo-stage">
              <UiDesignedButton :styles="getVariantStyles(newVariant.properties)">
                {{ newVariant.name || 'New Variant' }}
              </UiDesignedButton>
            </div>
            <UiCodeBlock
              v-if="newVariant.generatedCode"
              :code="newVariant.generatedCode.html || newVariant.generatedCode.vue"
              label="Variant markup"
            />
          </div>
        </div>
      </UiPanel>

      <div class="space-y-6">
        <UiPanel v-for="example in variantExamples" :key="example.title" :title="example.title" :description="example.description">
          <div class="demo-stage mb-4">
            <button v-if="example.preview === 'primary'" type="button" class="demo-button demo-primary demo-md">Primary Button</button>
            <button v-else-if="example.preview === 'secondary'" type="button" class="demo-button demo-secondary demo-md">Secondary Button</button>
            <template v-else>
              <button type="button" class="demo-button demo-primary demo-sm">Small</button>
              <button type="button" class="demo-button demo-primary demo-md">Medium</button>
              <button type="button" class="demo-button demo-primary demo-lg">Large</button>
            </template>
          </div>
          <UiCodeBlock :code="example.code" label="HTML" />
        </UiPanel>

        <UiPanel
          v-for="variant in customVariants"
          :key="variant.name"
          :title="capitalize(variant.name)"
          :description="variant.description"
        >
          <template #actions>
            <UiChip tone="info">Custom</UiChip>
            <UiButton size="sm" variant="ghost" icon="delete" icon-only :label="`Delete ${variant.name} variant`" @click="deleteVariant(variant.name)" />
          </template>
          <div class="demo-stage" :class="{ 'mb-4': variant.generatedCode }">
            <UiDesignedButton :styles="getVariantStyles(variant.properties)">
              {{ capitalize(variant.name) }} Button
            </UiDesignedButton>
          </div>
          <UiCodeBlock
            v-if="variant.generatedCode"
            :code="variant.generatedCode.html || variant.generatedCode.vue"
            label="Variant markup"
          />
        </UiPanel>
      </div>
    </PageSection>

    <!-- API reference -->
    <PageSection title="API reference" description="Complete list of props and options available for the Button component." divided>
      <UiPanel flush>
        <UiTable caption="Button props">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in apiProps" :key="prop.name">
              <th scope="row"><UiCode>{{ prop.name }}</UiCode></th>
              <td class="whitespace-nowrap"><UiCode>{{ prop.type }}</UiCode></td>
              <td class="whitespace-nowrap"><UiCode>{{ prop.default }}</UiCode></td>
              <td>{{ prop.description }}</td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <!-- Usage examples -->
    <PageSection title="Usage examples" description="Common patterns and use cases for the Button component." divided>
      <div class="space-y-6">
        <UiPanel v-for="example in usageExamples" :key="example.title" :title="example.title" :description="example.description">
          <UiCodeBlock :code="example.code" label="Example" />
        </UiPanel>
      </div>
    </PageSection>

    <!-- Accessibility -->
    <PageSection title="Accessibility" divided>
      <UiCallout tone="info" icon="accessibility">
        <ul class="list-disc pl-5 space-y-2">
          <li>Buttons should have descriptive text that clearly indicates their action</li>
          <li>Use <UiCode>aria-label</UiCode> for icon-only buttons</li>
          <li>Disabled buttons should not be focusable via keyboard navigation</li>
          <li>Ensure sufficient color contrast (WCAG AA minimum)</li>
        </ul>
      </UiCallout>
    </PageSection>

    <!-- Performance -->
    <PageSection title="Performance metrics" description="Bundle size, dependencies and browser support." divided>
      <template v-if="performanceData" #actions>
        <UiButton size="sm" icon="refresh" label="Refresh" @click="loadPerformanceData" />
      </template>

      <UiSpinner v-if="performanceLoading" label="Loading performance data..." />

      <div v-else-if="performanceData" class="space-y-6">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UiStat label="Vue size" icon="code" :value="formatSize(performanceData.vueSize)" />
          <UiStat label="React size" icon="code" :value="formatSize(performanceData.reactSize)" />
          <UiStat
            label="Total size"
            icon="storage"
            :value="formatSize(performanceData.totalSize)"
            :hint="`+ ${formatSize(performanceData.dependenciesSize)} deps`"
          />
          <UiStat
            label="Gzipped"
            icon="compress"
            :value="formatSize(performanceData.gzippedSize)"
            :hint="`${Math.round((performanceData.gzippedSize / performanceData.totalSize) * 100)}% compression`"
          />
        </div>

        <UiPanel title="Status" heading-tag="h3">
          <template #actions>
            <UiChip :tone="performanceStatusTone(performanceData.status)">
              {{ performanceData.status === 'pass' ? 'Optimal' : performanceData.status === 'warning' ? 'Warning' : 'Error' }}
            </UiChip>
          </template>
          <p class="text-sm text-ink-secondary">
            <span v-if="performanceData.dependencies && performanceData.dependencies.length > 0">
              Dependencies: {{ performanceData.dependencies.join(', ') }}
            </span>
            <span v-else>No dependencies</span>
          </p>
        </UiPanel>

        <UiPanel title="Supported browsers" heading-tag="h3">
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <li
              v-for="browser in getSupportedBrowsers()"
              :key="browser.name"
              class="flex items-center gap-3 p-3 rounded-tile border border-line-faint bg-surface-sunken"
            >
              <div class="w-8 h-8 flex-shrink-0" aria-hidden="true" v-html="getBrowserIcon(browser.name)"></div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-ink-strong">{{ browser.name }}</p>
                <p class="text-xs text-ink-muted">{{ browser.version }}+</p>
              </div>
            </li>
          </ul>
        </UiPanel>
      </div>

      <UiEmptyState
        v-else
        title="Performance data unavailable"
        body="Unable to load performance metrics for this component."
        spot="admin/performance-analysis"
      />
    </PageSection>

    <!-- Component dependencies -->
    <ComponentDependencyGraphCard :component-id="getComponentId()" />

    <!-- Version history -->
    <PageSection title="Version history" description="Track component versions, view changelogs, and manage breaking changes." divided>
      <UiPanel v-if="currentVersion.version" :title="`Current version: v${currentVersion.version}`" :description="currentVersion.description" class="mb-6">
        <template #actions>
          <UiChip :tone="versionStatusTone(currentVersion.status)">{{ currentVersion.status }}</UiChip>
        </template>
        <p class="flex flex-wrap gap-4 text-xs text-ink-muted">
          <span>Released: {{ formatDate(currentVersion.releasedAt) }}</span>
          <span v-if="currentVersion.lastUpdated">Last Updated: {{ formatDate(currentVersion.lastUpdated) }}</span>
        </p>
      </UiPanel>

      <UiPanel v-if="componentVersions.length > 0" flush>
        <ol class="divide-y divide-line-faint">
          <li v-for="version in componentVersions" :key="version.version" class="p-6 space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <h3 class="text-lg font-semibold text-ink-strong">v{{ version.version }}</h3>
              <UiChip :tone="versionStatusTone(version.status)">{{ version.status }}</UiChip>
              <UiChip v-if="version.breaking" tone="danger">Breaking Changes</UiChip>
            </div>
            <p class="text-sm text-ink">{{ version.description }}</p>
            <p class="text-xs text-ink-muted">Released: {{ formatDate(version.releasedAt) }}</p>

            <div v-if="version.changelog && version.changelog.length > 0" class="ml-6 border-l-2 border-line-faint pl-4">
              <h4 class="text-sm font-semibold text-ink-strong mb-2">Changelog</h4>
              <ul class="space-y-1 text-sm text-ink-secondary">
                <li v-for="(change, idx) in version.changelog" :key="idx" class="flex items-start gap-2">
                  <span :class="getChangeTypeColor(change.type)" aria-hidden="true">{{ getChangeTypeIcon(change.type) }}</span>
                  <span><span class="sr-only">{{ change.type }}: </span>{{ change.description }}</span>
                </li>
              </ul>
            </div>

            <UiCallout v-if="version.migrationGuide" tone="warning" title="Migration guide">
              {{ version.migrationGuide }}
            </UiCallout>
          </li>
        </ol>
      </UiPanel>

      <UiEmptyState
        v-else
        title="No version history"
        body="Version history will appear here once versions are added"
        spot="admin/deprecation-manager"
      />
    </PageSection>

    <!-- Component migration -->
    <PageSection
      title="Component migration guide"
      description="Auto-generated migration guide to help you update from one version to another."
      divided
      data-migration-section
    >
      <UiPanel title="Component migration setup">
        <div class="space-y-4">
          <UiSelect
            v-model="componentMigration.fromVersion"
            label="From version"
            :options="fromVersionOptions"
            placeholder="Select version..."
          />
          <UiSelect
            v-model="componentMigration.toVersion"
            label="To version"
            :options="toVersionOptions"
            placeholder="Select version..."
            :disabled="!componentMigration.fromVersion"
          />
          <UiCheckbox v-model="componentMigration.dryRun" label="Dry run (preview only)" />
          <UiCheckbox v-model="componentMigration.generateCodemod" label="Generate codemod" />
          <UiButton variant="primary" label="Analyze migration" :disabled="!canAnalyzeComponent" @click="analyzeComponentMigration" />
        </div>

        <div v-if="componentMigrationPlan" class="mt-6 pt-6 border-t border-line-faint">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 class="text-base font-semibold text-ink-strong">Migration plan</h3>
            <UiButton
              v-if="componentMigration.generateCodemod && componentCodemodScript"
              size="sm"
              icon="download"
              label="Download codemod"
              @click="downloadComponentCodemod"
            />
          </div>
          <ol class="space-y-3">
            <li
              v-for="(step, index) in componentMigrationPlan.steps"
              :key="index"
              class="migration-step"
              :class="step.type === 'breaking' ? 'migration-step-breaking' : 'migration-step-standard'"
            >
              <span class="migration-step-number" aria-hidden="true">{{ index + 1 }}</span>
              <div class="flex-1 min-w-0 space-y-2">
                <p class="text-sm font-medium text-ink-strong">
                  <span class="sr-only">Step {{ index + 1 }}{{ step.type === 'breaking' ? ' (breaking)' : '' }}: </span>{{ step.title }}
                </p>
                <p class="text-xs text-ink-secondary">{{ step.description }}</p>
                <UiCodeBlock v-if="step.code" :code="step.code" label="Code" />
              </div>
            </li>
          </ol>
        </div>
      </UiPanel>
    </PageSection>

    <!-- Best practices -->
    <PageSection title="Best practices" description="Recommended patterns and guidelines for using the Button component effectively." divided>
      <div class="space-y-6">
        <UiPanel v-for="practice in bestPractices" :key="practice.title" :title="practice.title" :description="practice.description">
          <template #actions><UiChip tone="success" icon="check_circle">Do</UiChip></template>
          <UiCodeBlock :code="practice.code" label="Example" />
        </UiPanel>
      </div>
    </PageSection>

    <!-- Anti-patterns -->
    <PageSection title="Anti-patterns" description="Common mistakes to avoid when using the Button component." divided>
      <div class="space-y-6">
        <UiPanel v-for="pattern in antiPatterns" :key="pattern.title" :title="pattern.title" :description="pattern.description">
          <template #actions><UiChip tone="danger" icon="error">Avoid</UiChip></template>
          <UiCodeBlock :code="pattern.code" label="Example" />
        </UiPanel>
      </div>
    </PageSection>

    <!-- Related components -->
    <PageSection title="Related components" description="Components that work well with Button or serve similar purposes." divided>
      <div class="grid md:grid-cols-3 gap-4">
        <UiCard v-for="related in relatedComponents" :key="related.to" :to="related.to" :title="related.title" :spot="related.spot" compact>
          {{ related.body }}
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import ComponentPreview from '../components/ComponentPreview.vue';
import ComponentDependencyGraphCard from '../components/ComponentDependencyGraphCard.vue';
import BreakingChangeAlert from '../components/BreakingChangeAlert.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCard,
  UiCheckbox,
  UiChip,
  UiCode,
  UiCodeBlock,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTable,
  UiTextarea,
} from '../components/ui';
import UiDesignedButton from '../components/ui/UiDesignedButton.vue';
import { antiPatterns, bestPractices, usageExamples, variantExamples } from '../data/componentButtonExamples.js';
import apiClient from '../services/api.js';
import { useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';

const route = useRoute();
const { getComponent } = useComponentPatternStatus();

const variantOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
  { value: 'danger', label: 'Danger' },
];
const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];
const radiusOptions = [
  { value: '', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: 'full', label: 'Full' },
];
const paddingOptions = [
  { value: '', label: 'Default' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const apiProps = [
  { name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", default: "'primary'", description: 'The visual style variant of the button.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'The size of the button.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the button is disabled.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading spinner when true.' },
];

const relatedComponents = [
  { title: 'Forms', to: '/components/forms', spot: 'foundations/components', body: 'Form components that work seamlessly with buttons for submission and actions.' },
  { title: 'Cards', to: '/components/cards', spot: 'foundations/component-composition', body: 'Card components often include action buttons for user interactions.' },
  { title: 'Navigation', to: '/components/navigation', spot: 'foundations/pattern-navigation', body: 'Navigation components that complement button usage patterns.' },
];

const capitalize = (name) => name.charAt(0).toUpperCase() + name.slice(1);

const sharedPlaygroundUrl = ref('');
const shareUrlCopied = ref(false);
const previewDarkMode = ref(false);
const codeFormat = ref('vue');

// Variant Builder
const showVariantBuilder = ref(false);
const showHoverState = ref(false);
const savingVariant = ref(false);
const customVariants = ref([]);
const newVariant = reactive({
  name: '',
  description: '',
  properties: {
    backgroundColor: '',
    textColor: '',
    borderColor: '',
    borderWidth: '',
    borderRadius: '',
    padding: '',
    fontSize: '',
    fontWeight: '',
    hover: {
      backgroundColor: '',
      textColor: '',
      borderColor: '',
    },
  },
  generatedCode: null,
});

// Get component status from shared store
const componentStatus = computed(() => {
  const component = getComponent('Button');
  return component?.status || 'Production Ready';
});
const propValues = reactive({
  label: 'Click me',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
});

// Performance data
const performanceData = ref(null);
const performanceLoading = ref(false);

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

// Map route paths to component IDs
const getComponentId = () => {
  const routeToIdMap = {
    '/components/buttons': 'button',
    '/components/color-picker': 'color-picker',
    '/components/forms': 'input',
    '/components/cards': 'card',
    '/components/navigation': 'navigation',
    '/components/data-display': 'table'
  };
  return routeToIdMap[route.path] || null;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const performanceStatusTone = (status) => {
  if (status === 'error') return 'danger';
  if (status === 'warning') return 'warning';
  return 'success';
};

const getSupportedBrowsers = () => {
  // Default browser support - can be customized per component
  return [
    { name: 'Chrome', version: '90' },
    { name: 'Firefox', version: '88' },
    { name: 'Safari', version: '14' },
    { name: 'Edge', version: '90' }
  ];
};

const getBrowserIcon = (browserName) => {
  const icons = {
    'Chrome': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 276 276" class="w-full h-full"><linearGradient id="chrome-a" x1="145" x2="34" y1="253" y2="61" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1e8e3e"/><stop offset="1" stop-color="#34a853"/></linearGradient><linearGradient id="chrome-b" x1="111" x2="222" y1="254" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fcc934"/><stop offset="1" stop-color="#fbbc04"/></linearGradient><linearGradient id="chrome-c" x1="17" x2="239" y1="80" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d93025"/><stop offset="1" stop-color="#ea4335"/></linearGradient><circle cx="128" cy="128" r="64" fill="#fff"/><path fill="url(#chrome-a)" d="M96 183.4A63.7 63.7 0 0 1 72.6 160L17.2 64A128 128 0 0 0 128 256l55.4-96A64 64 0 0 1 96 183.4Z"/><path fill="url(#chrome-b)" d="M192 128a63.7 63.7 0 0 1-8.6 32L128 256A128 128 0 0 0 238.9 64h-111a64 64 0 0 1 64 64Z"/><circle cx="128" cy="128" r="52" fill="#1a73e8"/><path fill="url(#chrome-c)" d="M96 72.6a63.7 63.7 0 0 1 32-8.6h110.8a128 128 0 0 0-221.7 0l55.5 96A64 64 0 0 1 96 72.6Z"/></svg>`,
    'Firefox': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:x="http://www.w3.org/1999/xlink" viewBox="0 0 51500 51500" class="w-full h-full"><radialGradient id="firefox-b" cx="87.4%" cy="-12.9%" r="128%" gradientTransform="matrix(.8 0 0 1 .18 .13)"><stop offset=".13" stop-color="#ffbd4f"/><stop offset=".28" stop-color="#ff980e"/><stop offset=".47" stop-color="#ff3750"/><stop offset=".78" stop-color="#eb0878"/><stop offset=".86" stop-color="#e50080"/></radialGradient><radialGradient id="firefox-d" cx="49%" cy="40%" r="128%" gradientTransform="matrix(.82 0 0 1 .09 0)"><stop offset=".3" stop-color="#960e18"/><stop offset=".35" stop-color="#b11927" stop-opacity=".74"/><stop offset=".43" stop-color="#db293d" stop-opacity=".34"/><stop offset=".5" stop-color="#f5334b" stop-opacity=".1"/><stop offset=".53" stop-color="#ff3750" stop-opacity="0"/></radialGradient><radialGradient id="firefox-e" cx="48%" cy="-12%" r="140%"><stop offset=".13" stop-color="#fff44f"/><stop offset=".53" stop-color="#ff980e"/></radialGradient><radialGradient id="firefox-f" cx="22.76%" cy="110.11%" r="100%"><stop offset=".35" stop-color="#3a8ee6"/><stop offset=".67" stop-color="#9059ff"/><stop offset="1" stop-color="#c139e6"/></radialGradient><radialGradient id="firefox-h" cx="52%" cy="33%" r="59%" gradientTransform="scale(.9 1)"><stop offset=".21" stop-color="#9059ff" stop-opacity="0"/><stop offset=".97" stop-color="#6e008b" stop-opacity=".6"/></radialGradient><radialGradient id="firefox-i" cx="210%" cy="-100%" r="290%"><stop offset=".1" stop-color="#ffe226"/><stop offset=".79" stop-color="#ff7139"/></radialGradient><radialGradient id="firefox-j" cx="84%" cy="-41%" r="180%"><stop offset=".11" stop-color="#fff44f"/><stop offset=".46" stop-color="#ff980e"/><stop offset=".72" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-k" cx="16.1%" cy="-18.6%" r="348.8%" gradientTransform="matrix(.10453 .46743 -.99452 .04913 -.05 -.26)"><stop offset="0" stop-color="#fff44f"/><stop offset=".3" stop-color="#ff980e"/><stop offset=".57" stop-color="#ff3647"/><stop offset=".74" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-l" cx="18.9%" cy="-42.5%" r="238.4%"><stop offset=".14" stop-color="#fff44f"/><stop offset=".48" stop-color="#ff980e"/><stop offset=".66" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="firefox-m" cx="159.3%" cy="-44.72%" r="313.1%"><stop offset=".09" stop-color="#fff44f"/><stop offset=".63" stop-color="#ff980e"/></radialGradient><linearGradient id="firefox-a" x1="87.25%" x2="9.4%" y1="15.5%" y2="93.1%"><stop offset=".05" stop-color="#fff44f"/><stop offset=".37" stop-color="#ff980e"/><stop offset=".53" stop-color="#ff3647"/><stop offset=".7" stop-color="#e31587"/></linearGradient><linearGradient id="firefox-n" x1="80%" x2="18%" y1="14%" y2="84%"><stop offset=".17" stop-color="#fff44f" stop-opacity=".8"/><stop offset=".6" stop-color="#fff44f" stop-opacity="0"/></linearGradient><path id="firefox-c" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294 0-6 2 5 4 22l4 26c2268 6147 1032 12398-748 16218-2754 5910-9420 11967-19857 11670-11276-318-21210-8683-23064-19643-338-1728 0-2605 170-4008-207 1080-286 1394-390 3315l-2 123c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075z"/><path id="firefox-g" d="M25677 21050c-40 598-2150 2660-2890 2660-6834 0-7943 4133-7943 4133 303 3480 2726 6348 5660 7865 134 70 270 130 405 193a13277 13277 0 00706 289 10674 10674 0 003127 603c11978 562 14300-14320 5655-18640 2213-385 4510 505 5794 1407-2100-3672-6025-6150-10530-6150-285 0-564 24-844 43a12025 12025 0 00-6614 2549c366 310 780 724 1650 1583 1630 1606 5813 3270 5822 3465z"/><path fill="url(#firefox-a)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350a12025 12025 0 00-6614 2548 7136 7136 0 00-622-470 11134 11134 0 01-68-5873c-2468 1124-4390 2900-5785 4470h-10c-953-1206-886-5187-832-6018-10-52-710 363-802 425a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39700 39700 0 00-237 1500l-5 52a22907 22907 0 00-390 3316l-1 120c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zM20170 35545c113 53 220 112 334 164l16 10a12620 12620 0 01-350-174zm5506-14493zm19813-3060l-3-23 4 26z"/><use fill="url(#firefox-b)" x:href="#firefox-c"/><use fill="url(#firefox-d)" x:href="#firefox-c"/><path fill="url(#firefox-e)" d="M36192 19560l150 110a13070 13070 0 00-2231-2911C26640 9290 32150 563 33080 120l10-13c-6037 3535-8085 10076-8273 13348 280-20 560-43 844-43 4505 0 8430 2477 10530 6150z"/><use fill="url(#firefox-f)" x:href="#firefox-g"/><use fill="url(#firefox-h)" x:href="#firefox-g"/><path fill="url(#firefox-i)" d="M17083 15204a24404 24404 0 01498 330 11134 11134 0 01-67-5874c-2470 1125-4390 2900-5785 4470 115-3 3600-66 5354 1074z"/><path fill="url(#firefox-j)" d="M1822 26240c1855 10960 11788 19325 23063 19644 10437 296 17104-5762 19858-11670 1780-3820 3016-10070 748-16218v-2l-4-24c-2-17-4-28-4-22l5 40c853 5566-1980 10958-6405 14604l-13 30c-8625 7023-16878 4237-18550 3097a14410 14410 0 01-350-174c-5028-2403-7105-6984-6660-10913-4245 0-5693-3580-5693-3580s3812-2718 8836-355c4653 2190 9023 355 9023 354-10-195-4192-1860-5822-3465-872-860-1285-1272-1652-1583a7136 7136 0 00-622-470 28293 28293 0 00-498-330c-1753-1140-5240-1076-5355-1073h-10c-953-1207-886-5188-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280c-10 52-865 3784-444 5720z"/><path fill="url(#firefox-k)" d="M34110 16760a13070 13070 0 012231 2910l360 296c5450 5020 2594 12120 2380 12626 4426-3646 7258-9038 6405-14604-2716-6774-7323-9506-11086-15453l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10c-930 443-6440 9170 1030 16640z"/><path fill="url(#firefox-l)" d="M36702 19965a4743 4743 0 00-360-295l-150-110c-1283-900-3580-1792-5794-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l16 10c1670 1140 9924 3925 18550-3097l13-30c213-506 3068-7606-2380-12626z"/><path fill="url(#firefox-m)" d="M14844 27844s1110-4133 7943-4133c740 0 2850-2062 2890-2660s-4370 1836-9023-354c-5024-2363-8836 354-8836 354s1448 3580 5693 3580c-445 3930 1632 8510 6660 10913 113 53 218 112 334 164-2935-1517-5358-4384-5660-7865z"/><path fill="url(#firefox-n)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350 280-20 560-43 845-43 4505 0 8430 2477 10530 6148-1284-900-3580-1792-5795-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l17 10a14410 14410 0 01-350-174c112 53 218 112 333 164-2935-1517-5358-4384-5660-7865 0 0 1108-4133 7942-4133 740 0 2850-2062 2890-2660-10-195-4190-1860-5822-3465-870-860-1285-1272-1650-1583a7136 7136 0 00-623-470 11134 11134 0 01-67-5873c-2470 1124-4390 2900-5785 4470h-10c-953-1207-886-5187-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2243 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39787 39787 0 00-277 1515c-2 18 2-17 0 0a27956 27956 0 00-355 3353l-3 122c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zm-2384 1234l4 26v-2l-4-24z"/></svg>`,
    'Safari': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="194.5 190.1 135.1 135.1" class="w-full h-full"><style>.b{color-interpolation-filters:srgb}.c{flood-opacity:.31}</style><defs><linearGradient id="safari-a" x1="132.55" x2="134.37" y1="111.67" y2="-105.3" xlink:href="#safari-b"><stop offset="0" stop-color="#d2d2d2"/><stop offset=".53" stop-color="#f2f2f2"/><stop offset="1" stop-color="#fff"/></linearGradient><linearGradient id="safari-b" gradientUnits="userSpaceOnUse"/><linearGradient id="safari-c" x1="65.44" x2="67.4" y1="115.72" y2="17.14" xlink:href="#safari-b"><stop offset="0" stop-color="#005ad5"/><stop offset=".16" stop-color="#0875f0"/><stop offset=".31" stop-color="#218cee"/><stop offset=".63" stop-color="#27a5f3"/><stop offset=".81" stop-color="#25aaf2"/><stop offset="1" stop-color="#21aaef"/></linearGradient><linearGradient id="safari-d" x1="158.7" x2="176.28" y1="96.71" y2="79.53" xlink:href="#safari-b"><stop offset="0" stop-color="#c72e24"/><stop offset="1" stop-color="#fd3b2f"/></linearGradient><filter id="safari-e" class="b"><feFlood flood-opacity=".28"/><feComposite in2="SourceGraphic" operator="in"/><feGaussianBlur stdDeviation="3"/><feOffset dx=".3" dy="2.8"/><feComposite in="SourceGraphic"/></filter><filter id="safari-f" class="b"><feFlood class="c"/><feComposite class="c" in2="SourceGraphic" operator="out"/><feGaussianBlur flood-opacity=".3" stdDeviation=".7"/><feOffset dy="1.8"/><feComposite in2="SourceGraphic" operator="atop"/></filter><filter id="safari-g" class="b"><feFlood flood-opacity=".61"/><feComposite in2="SourceGraphic" operator="in"/><feGaussianBlur stdDeviation=".5"/><feOffset dx=".8" dy=".8"/><feComposite in="SourceGraphic" result="A"/><feColorMatrix values="0 0 0 -1 0 0 0 0 -1 0 0 0 0 -1 0 0 0 0 1 0"/><feFlood flood-opacity=".4"/><feComposite in2="A" operator="in"/><feGaussianBlur stdDeviation="3.8"/><feOffset dx="2.3" dy="3.3"/><feComposite in="A"/></filter><filter id="safari-h" width="110%" height="110%" x="-1%" y="-1%"><feGaussianBlur in="SourceAlpha" stdDeviation=".4"/><feOffset dx=".1" dy=".2"/><feComponentTransfer result="A"><feFuncA type="linear"/></feComponentTransfer><feFlood flood-color="rgba(0,0,0,0.5)"/><feComposite in2="A" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="safari-i" cx="-69.88" cy="69.29" r="54.01" gradientTransform="matrix(.9023 -.01249 .0377 2.7234 -9.44 -120.29)" xlink:href="#safari-b"><stop offset="0" stop-color="#24a5f3" stop-opacity=".01"/><stop offset="1" stop-color="#1e8ceb" stop-opacity=".98"/></radialGradient><radialGradient id="safari-j" cx="109.35" cy="13.76" r="93.08" gradientTransform="matrix(-.01822 1.0922 -1.042 -.01765 136.95 -115.33)" xlink:href="#safari-b"><stop offset="0" stop-opacity="0"/><stop offset=".96" stop-color="#5488d6" stop-opacity="0"/><stop offset="1" stop-color="#5d96eb"/></radialGradient></defs><rect width="220" height="220" x="22" y="-106.53" fill="url(#safari-a)" filter="url(#safari-e)" ry="49" transform="matrix(.56938 0 0 .56921 186.86 255.75)"/><g filter="url(#safari-f)" transform="translate(194.2 190.07)"><ellipse cx="67.77" cy="67.73" fill="url(#safari-c)" paint-order="stroke fill markers" rx="54.01" ry="53.98"/><ellipse cx="-69.88" cy="69.29" fill="url(#safari-i)" rx="54.01" ry="53.98" transform="translate(137.65 -1.55)"/></g><ellipse cx="120" cy="14.15" fill="url(#safari-j)" rx="93.08" ry="93.67" transform="matrix(.58082 0 0 .57636 192.3 249.63)"/><g filter="url(#safari-g)" transform="matrix(.58289 0 0 .56508 196.8 181.63)"><path fill="#cac7c8" d="m46 191.66.73.35 72.18-48.2-7.34-8.95L46 191.66Z"/><path fill="#fbfffc" d="m45.8 190.87.2.8 65.57-56.8-6.95-8.92-58.83 64.92Z"/><path fill="url(#safari-d)" d="m118.91 143.81-7.35-8.95 66.08-57.2.27.73-59 65.42Z"/><path fill="#fb645c" d="m104.62 125.95 6.94 8.92 66.08-57.2-.65-.35-72.37 48.63Z"/></g><path stroke="#fff" stroke-linecap="round" stroke-miterlimit="1" stroke-width="1.33" d="m286.59 278.44 3.14-2.14m-11.23-17.8 7.8-1.37m-8.32-2.9 3.78-.3m-3.3-12.47 7.8 1.38m-8.2 3.03 3.76.38m-1.2-13.05 7.47 2.73m-3.77-10.5 6.86 3.96m-1.87-10.96 6.07 5.09m.05-11.07 5.09 6.07m1.97-10.99 3.97 6.86m3.7-10.53 2.71 7.43m5.62-9.62 1.37 7.8m15.62-7.89-1.38 7.8m9.82-5.6-2.72 7.42m10.5-3.75-3.96 6.86m10.98-1.89-5.12 6.07m16.18 6.96-6.87 3.96m10.45 3.88-7.45 2.7m9.64 5.6-7.82 1.38m7.81 15.79-7.82-1.39m5.6 9.7-7.44-2.71m3.8 10.47-6.87-3.95m1.91 10.98-6.07-5.07m-.05 11.2-5.1-6.08m-1.95 10.99-4-6.88m-3.87 10.5-2.7-7.43m-5.61 9.61-1.37-7.78m-15.78 7.75 1.4-7.86m-9.7 5.58 2.72-7.47m-10.5 3.73 3.97-6.87m-10.96 1.9 5.08-6.03m-8.26 3.13 2.75-2.68m3.84 8.23 2.2-3.1m5.2 7.44 1.66-3.45m6.43 6.47 1.02-3.7m7.52 5.32.43-3.82m8.08 3.8-.31-3.84m8.81 2.33-.97-3.69m9.06.75-1.58-3.48m9.05-.76-2.16-3.18m8.78-2.38-2.68-2.73m8.24-3.85-3.11-2.2m7.42-5.2-3.47-1.67m6.42-6.41-3.7-1.03m5.17-7.46-3.78-.37m3.8-8.24-3.81.3m2.35-8.8-3.7.97m.8-9.06-3.49 1.61m-1.03-9.12-3.2 2.2m-2.12-8.62-2.72 2.7m-3.84-8.28-2.23 3.12m-5.21-7.45-1.66 3.44m-6.55-6.32-1.02 3.63m-7.42-5.2-.38 3.81m-8.09-3.66.28 3.8m-8.79-2.34.95 3.68m-8.9-.72 1.61 3.46m-9.06.82 2.18 3.16m-8.82 2.27 2.68 2.7m-8.25 3.85 3.1 2.23m-7.44 5.17 3.42 1.66m-6.3 6.36 3.7 1.05m-3.71 24.39 3.7-.91m-2.44 5.03 7.48-2.72m-5.86 6.73 3.5-1.61m-1.53 5.43 6.87-3.95m-13.33-20.52 7.96.01m41.16-41.44v-7.96m.02 98.74.01-7.94m49.33-41.4-7.95-.01" filter="url(#safari-h)" transform="translate(-65 7.73)"/></svg>`,
    'Edge': `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 27600 27600" class="w-full h-full" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="edge-a" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0078d4"/><stop offset="1" stop-color="#0078d4"/></linearGradient><linearGradient id="edge-b" x1="6870" x2="24704" y1="18705" y2="18705" xlink:href="#edge-a"><stop offset="0" stop-color="#0c59a4"/><stop offset="1" stop-color="#114a8b"/></linearGradient><linearGradient id="edge-c" x1="16272" x2="5133" y1="10968" y2="23102" xlink:href="#edge-a"><stop offset="0" stop-color="#1b9de2"/><stop offset=".16" stop-color="#1595df"/><stop offset=".67" stop-color="#0680d7"/><stop offset="1" stop-color="#0078d4"/></linearGradient><radialGradient id="edge-d" cx="16720" cy="18747" r="9538" xlink:href="#edge-a"><stop offset=".72" stop-opacity="0"/><stop offset=".95" stop-opacity=".53"/><stop offset="1"/></radialGradient><radialGradient id="edge-e" cx="7130" cy="19866" r="14324" gradientTransform="matrix(.14843 -.98892 .79688 .1196 -8759 25542)" xlink:href="#edge-a"><stop offset=".76" stop-opacity="0"/><stop offset=".95" stop-opacity=".5"/><stop offset="1"/></radialGradient><radialGradient id="edge-f" cx="2523" cy="4680" r="20243" gradientTransform="matrix(-.03715 .99931 -2.12836 -.07913 13579 3530)" xlink:href="#edge-a"><stop offset="0" stop-color="#35c1f1"/><stop offset=".11" stop-color="#34c1ed"/><stop offset=".23" stop-color="#2fc2df"/><stop offset=".31" stop-color="#2bc3d2"/><stop offset=".67" stop-color="#36c752"/></radialGradient><radialGradient id="edge-g" cx="24247" cy="7758" r="9734" gradientTransform="matrix(.28109 .95968 -.78353 .22949 24510 -16292)" xlink:href="#edge-a"><stop offset="0" stop-color="#66eb6e"/><stop offset="1" stop-color="#66eb6e" stop-opacity="0"/></radialGradient></defs><path id="edge-h" d="M24105 20053a9345 9345 0 01-1053 472 10202 10202 0 01-3590 646c-4732 0-8855-3255-8855-7432 0-1175 680-2193 1643-2729-4280 180-5380 4640-5380 7253 0 7387 6810 8137 8276 8137 791 0 1984-230 2704-456l130-44a12834 12834 0 006660-5282c220-350-168-757-535-565z"/><path id="edge-i" d="M11571 25141a7913 7913 0 01-2273-2137 8145 8145 0 01-1514-4740 8093 8093 0 013093-6395 8082 8082 0 011373-859c312-148 846-414 1554-404a3236 3236 0 012569 1297 3184 3184 0 01636 1866c0-21 2446-7960-8005-7960-4390 0-8004 4166-8004 7820 0 2319 538 4170 1212 5604a12833 12833 0 007684 6757 12795 12795 0 003908 610c1414 0 2774-233 4045-656a7575 7575 0 01-6278-803z"/><path id="edge-j" d="M16231 15886c-80 105-330 250-330 566 0 260 170 512 472 723 1438 1003 4149 868 4156 868a5954 5954 0 003027-839 6147 6147 0 001133-850 6180 6180 0 001910-4437c26-2242-796-3732-1133-4392-2120-4141-6694-6525-11668-6525-7011 0-12703 5635-12798 12620 47-3654 3679-6605 7996-6605 350 0 2346 34 4200 1007 1634 858 2490 1894 3086 2921 618 1067 728 2415 728 2952s-271 1333-780 1990z"/><use fill="url(#edge-b)" xlink:href="#edge-h"/><use fill="url(#edge-d)" opacity=".35" xlink:href="#edge-h"/><use fill="url(#edge-c)" xlink:href="#edge-i"/><use fill="url(#edge-e)" opacity=".4" xlink:href="#edge-i"/><use fill="url(#edge-f)" xlink:href="#edge-j"/><use fill="url(#edge-g)" xlink:href="#edge-j"/></svg>`
  };
  return icons[browserName] || icons['Chrome'];
};

const loadPerformanceData = async () => {
  const componentId = getComponentId();
  if (!componentId) {
    performanceData.value = null;
    return;
  }

  performanceLoading.value = true;
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true }
    );
    performanceData.value = response.data;
  } catch (error) {
    console.error('Error loading performance data:', error);
    performanceData.value = null;
  } finally {
    performanceLoading.value = false;
  }
};

const generatedCode = computed(() => {
  const props = Object.entries(propValues)
    .filter(([key, value]) => {
      if (key === 'label') return false; // Label is handled separately
      return value !== '' && value !== false && value !== null && value !== undefined;
    })
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  const label = propValues.label || 'Button';

  if (codeFormat.value === 'vue') {
    return `<button${props ? '\n' + props + '\n' : ''}>${label}</button>`;
  } else if (codeFormat.value === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<Button${reactProps ? '\n' + reactProps + '\n' : ''}>${label}</Button>`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<button${htmlProps}>${label}</button>`;
  }
});

const generateCodeForFormat = (format) => {
  const props = Object.entries(propValues)
    .filter(([key, value]) => {
      if (key === 'label') return false; // Label is handled separately
      return value !== '' && value !== false && value !== null && value !== undefined;
    })
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  const label = propValues.label || 'Button';

  if (format === 'vue') {
    return `<button${props ? '\n' + props + '\n' : ''}>${label}</button>`;
  } else if (format === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<Button${reactProps ? '\n' + reactProps + '\n' : ''}>${label}</Button>`;
  } else if (format === 'react-native') {
    const reactNativeProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `import { Button } from 'react-native';\n\n<Button${reactNativeProps ? '\n' + reactNativeProps + '\n' : ''} title="${label}" />`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => {
        if (key === 'label') return false; // Label is handled separately
        return value !== '' && value !== false && value !== null && value !== undefined;
      })
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<button${htmlProps}>${label}</button>`;
  }
};

const exportAsVue = async () => {
  codeFormat.value = 'vue';
  await nextTick();
  const vueCode = generateCodeForFormat('vue');
  await navigator.clipboard.writeText(vueCode);
};

const exportAsReact = async () => {
  codeFormat.value = 'react';
  await nextTick();
  const reactCode = generateCodeForFormat('react');
  await navigator.clipboard.writeText(reactCode);
};

const exportAsReactNative = async () => {
  codeFormat.value = 'react-native';
  await nextTick();
  const reactNativeCode = generateCodeForFormat('react-native');
  await navigator.clipboard.writeText(reactNativeCode);
};

const exportAsHTML = async () => {
  codeFormat.value = 'html';
  await nextTick();
  const htmlCode = generateCodeForFormat('html');
  await navigator.clipboard.writeText(htmlCode);
};

const codeFormats = [
  { value: 'vue', label: 'Vue', export: exportAsVue },
  { value: 'react', label: 'React', export: exportAsReact },
  { value: 'react-native', label: 'React Native', export: exportAsReactNative },
  { value: 'html', label: 'HTML', export: exportAsHTML },
];
const codeFormatLabel = computed(() => codeFormats.find((f) => f.value === codeFormat.value)?.label ?? 'Code');

const toggleFullscreen = () => {
  // Could implement fullscreen preview
};

// Component-specific version data - in a real app, this would come from an API
const componentVersions = ref([
  {
    version: '2.1.0',
    status: 'Current',
    description: 'Added loading state and improved accessibility',
    releasedAt: '2024-01-15',
    lastUpdated: '2024-01-20',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Added loading prop and spinner animation' },
      { type: 'added', description: 'Added aria-busy attribute for screen readers' },
      { type: 'improved', description: 'Enhanced focus indicators for better accessibility' },
      { type: 'fixed', description: 'Fixed button text alignment in small sizes' },
    ]
  },
  {
    version: '2.0.0',
    status: 'Stable',
    description: 'Major refactor with new variant system',
    releasedAt: '2023-12-01',
    breaking: true,
    migrationGuide: 'The "type" prop has been renamed to "variant". Update all instances: type="primary" → variant="primary"',
    changelog: [
      { type: 'breaking', description: 'Renamed "type" prop to "variant" for consistency' },
      { type: 'breaking', description: 'Removed "outline" variant, use "secondary" instead' },
      { type: 'added', description: 'Added "tertiary" variant' },
      { type: 'added', description: 'Added size prop (sm, md, lg)' },
      { type: 'improved', description: 'Improved button styling and hover states' },
    ]
  },
  {
    version: '1.5.2',
    status: 'Stable',
    description: 'Bug fixes and minor improvements',
    releasedAt: '2023-10-15',
    breaking: false,
    changelog: [
      { type: 'fixed', description: 'Fixed disabled state styling' },
      { type: 'fixed', description: 'Fixed button width in flex containers' },
    ]
  },
  {
    version: '1.5.0',
    status: 'Stable',
    description: 'Added new button variants',
    releasedAt: '2023-09-01',
    breaking: false,
    changelog: [
      { type: 'added', description: 'Added "outline" variant' },
      { type: 'added', description: 'Added "ghost" variant' },
      { type: 'improved', description: 'Improved button spacing' },
    ]
  },
]);

const currentVersion = computed(() => {
  return componentVersions.value.find(v => v.status === 'Current') || componentVersions.value[0] || {};
});


const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const versionStatusTone = (status) =>
  ({ Current: 'success', Stable: 'info', Deprecated: 'danger', Beta: 'warning' })[status] || 'neutral';

const componentStatusTone = (status) =>
  ({ 'Production Ready': 'success', 'In Progress': 'warning', Planned: 'info', Deprecated: 'danger', Beta: 'warning' })[status] ||
  'neutral';

const getChangeTypeIcon = (type) => {
  const icons = {
    'added': '✓',
    'changed': '→',
    'deprecated': '⚠',
    'removed': '✗',
    'fixed': '🔧',
    'improved': '↑',
    'breaking': '⚠',
  };
  return icons[type] || '•';
};

const getChangeTypeColor = (type) => {
  const colors = {
    'added': 'text-success',
    'changed': 'text-info',
    'deprecated': 'text-warning',
    'removed': 'text-danger',
    'fixed': 'text-accent-text',
    'improved': 'text-accent-text',
    'breaking': 'text-danger font-bold',
  };
  return colors[type] || 'text-ink-muted';
};

// Component Migration Setup
// Get component name from route (e.g., /components/button -> 'button')
const getComponentNameFromRoute = () => {
  const path = route.path;
  const match = path.match(/\/components\/([^/]+)/);
  return match ? match[1] : 'button';
};

const componentName = computed(() => {
  const name = getComponentNameFromRoute();
  // Capitalize first letter for display
  return name.charAt(0).toUpperCase() + name.slice(1);
});

const componentMigration = ref({
  component: getComponentNameFromRoute(), // Pre-filled with current component
  fromVersion: '',
  toVersion: '',
  dryRun: true,
  generateCodemod: false
});

const componentMigrationPlan = ref(null);
const componentCodemodScript = ref('');

// Version options for dropdowns
const fromVersionOptions = computed(() => {
  // Get all versions except the latest (current) one, sorted by version number (descending)
  const versions = componentVersions.value
    .map(v => v.version)
    .filter(v => v !== currentVersion.value.version)
    .sort((a, b) => {
      // Simple version comparison - split by dots and compare numerically
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (bVal !== aVal) return bVal - aVal; // Descending order
      }
      return 0;
    });
  
  return versions.map(v => ({ label: `v${v}`, value: v }));
});

const toVersionOptions = computed(() => {
  if (!componentMigration.value.fromVersion) {
    return [];
  }
  
  // Get all versions that come after the selected "from version" (including current version)
  const fromVersion = componentMigration.value.fromVersion;
  const fromVersionParts = fromVersion.split('.').map(Number);
  
  const availableVersions = componentVersions.value
    .map(v => v.version)
    .filter(v => {
      // Compare versions - only include versions greater than fromVersion
      const vParts = v.split('.').map(Number);
      for (let i = 0; i < Math.max(fromVersionParts.length, vParts.length); i++) {
        const fromVal = fromVersionParts[i] || 0;
        const vVal = vParts[i] || 0;
        if (vVal > fromVal) return true;
        if (vVal < fromVal) return false;
      }
      return false; // Equal versions
    })
    .sort((a, b) => {
      // Sort ascending for "to version"
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });
  
  return availableVersions.map(v => ({ label: `v${v}`, value: v }));
});

// Reset toVersion when fromVersion changes
watch(() => componentMigration.value.fromVersion, () => {
  componentMigration.value.toVersion = '';
});

const canAnalyzeComponent = computed(() => {
  return componentMigration.value.fromVersion && componentMigration.value.toVersion;
});

const analyzeComponentMigration = () => {
  if (!canAnalyzeComponent.value) return;
  
  const fromVersion = componentMigration.value.fromVersion;
  const toVersion = componentMigration.value.toVersion;
  
  // Find versions in the changelog
  const fromVersionData = componentVersions.value.find(v => v.version === fromVersion);
  const toVersionData = componentVersions.value.find(v => v.version === toVersion);
  
  // Collect all changes between versions
  const allVersions = componentVersions.value
    .filter(v => {
      const vNum = parseVersion(v.version);
      const fromNum = parseVersion(fromVersion);
      const toNum = parseVersion(toVersion);
      return vNum > fromNum && vNum <= toNum;
    })
    .sort((a, b) => {
      const aNum = parseVersion(a.version);
      const bNum = parseVersion(b.version);
      return aNum - bNum;
    });
  
  const steps = [];
  
  // Step 1: Update import path
  steps.push({
    title: 'Update Import Path',
    description: `Update the import statement from v${fromVersion} to v${toVersion}`,
    type: 'standard',
    code: `// Old\nimport Button from '@/components/v${fromVersion}/Button';\n\n// New\nimport Button from '@/components/v${toVersion}/Button';`
  });
  
  // Step 2: Collect breaking changes
  const breakingChanges = [];
  allVersions.forEach(version => {
    if (version.breaking && version.changelog) {
      version.changelog
        .filter(c => c.type === 'breaking')
        .forEach(change => {
          breakingChanges.push({
            version: version.version,
            description: change.description,
            migrationGuide: version.migrationGuide
          });
        });
    }
  });
  
  if (breakingChanges.length > 0) {
    breakingChanges.forEach((change, idx) => {
      steps.push({
        title: `Breaking Change: ${change.description.split(':')[0] || 'Update Required'}`,
        description: change.description,
        type: 'breaking',
        version: change.version,
        code: change.migrationGuide ? generateCodeExample(change.migrationGuide) : null
      });
    });
  }
  
  // Step 3: Collect deprecated items
  const deprecatedItems = [];
  allVersions.forEach(version => {
    if (version.changelog) {
      version.changelog
        .filter(c => c.type === 'deprecated' || c.type === 'removed')
        .forEach(change => {
          deprecatedItems.push({
            version: version.version,
            description: change.description
          });
        });
    }
  });
  
  if (deprecatedItems.length > 0) {
    steps.push({
      title: 'Review Deprecated Features',
      description: `The following features have been deprecated or removed: ${deprecatedItems.map(i => i.description).join(', ')}`,
      type: 'warning',
      items: deprecatedItems
    });
  }
  
  // Step 4: New features
  const newFeatures = [];
  allVersions.forEach(version => {
    if (version.changelog) {
      version.changelog
        .filter(c => c.type === 'added')
        .forEach(change => {
          newFeatures.push({
            version: version.version,
            description: change.description
          });
        });
    }
  });
  
  if (newFeatures.length > 0) {
    steps.push({
      title: 'New Features Available',
      description: `Consider using these new features: ${newFeatures.map(f => f.description).join(', ')}`,
      type: 'info',
      items: newFeatures
    });
  }
  
  // Step 5: Final review
  steps.push({
    title: 'Test Your Changes',
    description: 'After making the updates, test your component thoroughly to ensure everything works as expected.',
    type: 'standard'
  });
  
  componentMigrationPlan.value = {
    component: componentName.value,
    fromVersion: fromVersion,
    toVersion: toVersion,
    steps: steps
  };
  
  // Auto-generate codemod if requested
  if (componentMigration.value.generateCodemod) {
    generateCodemod();
  }
};

const parseVersion = (version) => {
  const parts = version.split('.').map(Number);
  return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
};

const generateCodeExample = (migrationGuide) => {
  if (!migrationGuide) return null;
  
  // Extract code examples from migration guide
  const codeMatch = migrationGuide.match(/(?:→|->|to|use)\s*["']?([^"'\n]+)["']?/i);
  if (codeMatch) {
    return `// Before\n${migrationGuide.split(/→|->|to|use/i)[0].trim()}\n\n// After\n${codeMatch[1]}`;
  }
  return migrationGuide;
};

const generateCodemod = () => {
  if (!componentMigrationPlan.value) return;
  
  const fromVersion = componentMigration.value.fromVersion;
  const toVersion = componentMigration.value.toVersion;
  
  // Generate a simple codemod script
  componentCodemodScript.value = `// Codemod: Migrate ${componentName.value} from v${fromVersion} to v${toVersion}
// Run with: jscodeshift -t migration.js --component=${componentName.value} src/

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Update import paths
  root.find(j.ImportDeclaration)
    .filter(path => path.value.source.value.includes('${fromVersion}'))
    .replaceWith(path => {
      return j.importDeclaration(
        path.value.specifiers,
        j.literal(path.value.source.value.replace('${fromVersion}', '${toVersion}'))
      );
    });
  
  // Add breaking change transformations here based on changelog
  
  return root.toSource();
};
`;
};

const downloadComponentCodemod = () => {
  const blob = new Blob([componentCodemodScript.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `codemod-${componentMigration.value.component}-${componentMigration.value.fromVersion}-to-${componentMigration.value.toVersion}.js`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};





// Variant Builder Methods
const getVariantStyles = (properties) => {
  const styles = {};
  
  // Resolve token references or use direct values
  const resolveValue = (value) => {
    if (!value) return '';
    if (value.startsWith('{')) {
      // Token reference - for now, use a placeholder
      return '';
    }
    return value;
  };
  
  // Background color
  if (properties.backgroundColor) {
    if (properties.backgroundColor.startsWith('{')) {
      // Would need to resolve token
      styles.backgroundColor = '#6366f1'; // Placeholder
    } else {
      // Try to map Tailwind class to color
      const colorMap = {
        'indigo-600': '#4f46e5',
        'green-600': '#16a34a',
        'red-600': '#dc2626',
        'blue-600': '#2563eb',
      };
      styles.backgroundColor = colorMap[properties.backgroundColor] || properties.backgroundColor;
    }
  }
  
  // Text color
  if (properties.textColor) {
    if (properties.textColor.startsWith('{')) {
      styles.color = '#ffffff'; // Placeholder
    } else {
      const colorMap = {
        'white': '#ffffff',
        'gray-900': '#111827',
        'indigo-600': '#4f46e5',
      };
      styles.color = colorMap[properties.textColor] || properties.textColor;
    }
  }
  
  // Border
  if (properties.borderColor) {
    styles.borderColor = properties.borderColor.startsWith('{') ? '#4f46e5' : properties.borderColor;
    styles.borderStyle = 'solid';
    styles.borderWidth = properties.borderWidth || '1px';
  }
  
  // Border radius
  const radiusMap = {
    'sm': '0.25rem',
    'md': '0.5rem',
    'lg': '0.75rem',
    'xl': '1rem',
    'full': '9999px',
  };
  if (properties.borderRadius) {
    styles.borderRadius = radiusMap[properties.borderRadius] || properties.borderRadius;
  }
  
  // Padding
  const paddingMap = {
    'sm': '0.5rem 1rem',
    'md': '0.75rem 1.5rem',
    'lg': '1rem 2rem',
  };
  if (properties.padding) {
    styles.padding = paddingMap[properties.padding] || properties.padding;
  } else {
    styles.padding = '0.75rem 1.5rem';
  }
  
  // Font size
  if (properties.fontSize) {
    const fontSizeMap = {
      'sm': '0.875rem',
      'md': '1rem',
      'lg': '1.125rem',
    };
    styles.fontSize = fontSizeMap[properties.fontSize] || properties.fontSize;
  }
  
  // Font weight
  if (properties.fontWeight) {
    styles.fontWeight = properties.fontWeight;
  }
  
  return styles;
};

const saveVariant = async () => {
  if (!newVariant.name) return;
  
  savingVariant.value = true;
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/components/button/variants`,
      newVariant
    );
    
    window.showToast?.('Variant saved successfully', 'success');
    customVariants.value.push(response.data);
    resetVariantBuilder();
    showVariantBuilder.value = false;
    
    // Reload variants
    await loadVariants();
  } catch (error) {
    console.error('Error saving variant:', error);
    window.showToast?.('Failed to save variant', 'error');
  } finally {
    savingVariant.value = false;
  }
};

const resetVariantBuilder = () => {
  newVariant.name = '';
  newVariant.description = '';
  newVariant.properties = {
    backgroundColor: '',
    textColor: '',
    borderColor: '',
    borderWidth: '',
    borderRadius: '',
    padding: '',
    fontSize: '',
    fontWeight: '',
    hover: {
      backgroundColor: '',
      textColor: '',
      borderColor: '',
    },
  };
  newVariant.generatedCode = null;
  showHoverState.value = false;
};

const loadVariants = async () => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/components/button/variants`
    );
    customVariants.value = response.data.variants.filter(v => 
      !['primary', 'secondary', 'tertiary'].includes(v.name)
    );
  } catch (error) {
    console.error('Error loading variants:', error);
  }
};

const deleteVariant = async (variantName) => {
  if (!confirm(`Are you sure you want to delete the "${variantName}" variant?`)) {
    return;
  }
  
  try {
    await apiClient.delete(
      `${API_BASE_URL}/components/button/variants/${variantName}`
    );
    
    window.showToast?.('Variant deleted successfully', 'success');
    customVariants.value = customVariants.value.filter(v => v.name !== variantName);
  } catch (error) {
    console.error('Error deleting variant:', error);
    window.showToast?.('Failed to delete variant', 'error');
  }
};

// Playground sharing
const sharePlayground = () => {
  const state = {
    component: 'button',
    props: { ...propValues },
    timestamp: Date.now(),
  };
  const encoded = btoa(JSON.stringify(state));
  const url = `${window.location.origin}${window.location.pathname}?playground=${encoded}`;
  sharedPlaygroundUrl.value = url;
  copyShareUrl();
};

const copyShareUrl = async () => {
  if (!sharedPlaygroundUrl.value) return;
  try {
    await navigator.clipboard.writeText(sharedPlaygroundUrl.value);
    shareUrlCopied.value = true;
    window.showToast?.('Share URL copied to clipboard!', 'success');
    setTimeout(() => {
      shareUrlCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy URL:', error);
    window.showToast?.('Failed to copy URL', 'error');
  }
};

// Watch for property changes to generate code preview
watch(() => newVariant.properties, () => {
  if (newVariant.name) {
    // Generate preview code
    const classes = [];
    if (newVariant.properties.backgroundColor) {
      classes.push(`bg-${newVariant.properties.backgroundColor}`);
    }
    if (newVariant.properties.textColor) {
      classes.push(`text-${newVariant.properties.textColor}`);
    }
    if (newVariant.properties.borderRadius) {
      classes.push(`rounded-${newVariant.properties.borderRadius}`);
    }
    if (newVariant.properties.hover?.backgroundColor) {
      classes.push(`hover:bg-${newVariant.properties.hover.backgroundColor}`);
    }
    
    newVariant.generatedCode = {
      html: `<button class="${classes.join(' ')}">${newVariant.name}</button>`,
      vue: `<button class="${classes.join(' ')}">${newVariant.name}</button>`,
    };
  }
}, { deep: true });

onMounted(() => {
  // Load playground state from URL
  const params = new URLSearchParams(window.location.search);
  const playgroundState = params.get('playground');
  if (playgroundState) {
    try {
      const state = JSON.parse(atob(playgroundState));
      if (state.component === 'button' && state.props) {
        Object.assign(propValues, state.props);
        sharedPlaygroundUrl.value = window.location.href;
      }
    } catch (error) {
      console.error('Failed to load playground state:', error);
    }
  }

  // Load performance data
  loadPerformanceData();
  
  // Load custom variants
  loadVariants();
});
</script>

<style scoped>
.preview-stage {
  @apply min-h-96 p-8 rounded-tile flex items-center justify-center;
}
.demo-stage {
  @apply p-6 rounded-tile bg-surface-sunken flex flex-wrap items-center gap-4;
}
.demo-button {
  @apply rounded-control font-medium transition-colors focus-visible:outline focus-visible:outline-2 outline-focus;
}
.demo-primary {
  @apply bg-accent text-ink-on-accent hover:bg-accent-hover;
}
.demo-secondary {
  @apply border-2 border-solid border-accent bg-surface-raised text-accent-text hover:bg-accent-subtle;
}
.demo-sm {
  @apply px-3 py-1.5 text-sm;
}
.demo-md {
  @apply px-6 py-3;
}
.demo-lg {
  @apply px-8 py-4 text-lg;
}
.migration-step {
  @apply flex items-start gap-3 p-4 rounded-tile border border-solid;
}
.migration-step-standard {
  @apply bg-surface-sunken border-line-faint;
}
.migration-step-breaking {
  @apply bg-danger-bg border-danger-border;
}
.migration-step-number {
  @apply flex-shrink-0 w-8 h-8 rounded-pill flex items-center justify-center font-bold text-sm;
}
.migration-step-standard .migration-step-number {
  @apply bg-accent text-ink-on-accent;
}
.migration-step-breaking .migration-step-number {
  @apply bg-danger-solid text-ink-on-accent;
}
</style>

