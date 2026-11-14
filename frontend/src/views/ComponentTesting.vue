<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Component testing framework"
      lead="Generate tests, run visual regression tests, and ensure component quality with integrated testing tools."
      spot="foundations/component-testing"
      size="tool"
    />

    <PageSection title="Generate tests" description="Pick a component, the kinds of tests you want and any CI/CD configuration.">
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <!-- Left column: test generator -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <UiPanel title="Select component">
            <UiSelect
              v-model="selectedComponent"
              label="Component"
              placeholder="Choose a component..."
              :options="componentOptions"
            />
            <UiSpinner v-if="loadingComponent" label="Loading component data..." />
            <UiCallout v-if="componentsError" tone="danger" role="alert">
              {{ componentsError }}
              <template #actions>
                <UiButton size="sm" variant="ghost" label="Retry" @click="loadComponents" />
              </template>
            </UiCallout>
            <UiCallout v-if="componentError" tone="danger" role="alert">{{ componentError }}</UiCallout>
            <InlineNotice :notice="notice" @dismiss="clearNotice" />

            <div v-if="componentData && componentData.props && componentData.props.length > 0" class="props-well">
              <h3 class="text-xs font-semibold text-ink-secondary flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">tune</span>
                Component props ({{ componentData.props.length }})
              </h3>
              <ul class="flex flex-col gap-2">
                <li v-for="prop in componentData.props" :key="prop.name" class="prop-item">
                  <div class="flex flex-wrap items-center gap-2">
                    <UiCode>{{ prop.name }}</UiCode>
                    <UiChip>{{ prop.type }}</UiChip>
                    <UiChip v-if="prop.required" tone="danger">required</UiChip>
                    <span v-if="prop.default !== undefined && prop.default !== null" class="text-xs text-ink-muted">
                      default: {{ typeof prop.default === 'string' ? `"${prop.default}"` : prop.default }}
                    </span>
                  </div>
                  <p v-if="prop.description" class="text-xs text-ink-secondary">{{ prop.description }}</p>
                  <div v-if="prop.options && prop.options.length > 0" class="flex flex-wrap gap-1">
                    <UiChip v-for="option in prop.options" :key="option" tone="accent">{{ option }}</UiChip>
                  </div>
                </li>
              </ul>
            </div>
            <p v-else-if="componentData" class="props-well text-xs text-ink-secondary">
              No props available for this component. Tests will be generated with basic structure.
            </p>
          </UiPanel>

          <UiCallout
            v-if="componentData && componentData.props && componentData.props.length > 0"
            tone="info"
            title="Prop-aware test generation active"
          >
            Tests will be generated for {{ componentData.props.length }} props including all enum values, boolean states, and combinations.
          </UiCallout>

          <UiCallout v-if="generationSummary" tone="success" title="Tests generated successfully" role="status">
            <dl class="summary-list">
              <dt>Component</dt>
              <dd>{{ generationSummary.component }}</dd>
              <dt>Framework</dt>
              <dd>{{ frameworkLabels[generationSummary.framework] }}</dd>
              <dt>Test types</dt>
              <dd class="capitalize">{{ generationSummary.testTypes.map((type) => type.replace('-', ' ')).join(', ') }}</dd>
              <template v-if="generationSummary.cicd.length > 0">
                <dt>CI/CD</dt>
                <dd>{{ generationSummary.cicd.map((cd) => cicdLabels[cd]).join(', ') }}</dd>
              </template>
              <template v-if="generationSummary.propsCount > 0">
                <dt>Props analyzed</dt>
                <dd>{{ generationSummary.propsCount }} props</dd>
              </template>
            </dl>
            <p class="mt-2 text-xs">Generated at {{ new Date(generationSummary.timestamp).toLocaleTimeString() }}</p>
          </UiCallout>

          <UiPanel title="Test type">
            <fieldset class="flex flex-col gap-2">
              <legend class="sr-only">Test types to generate</legend>
              <UiCheckbox v-for="type in testTypeOptions" :key="type.key" v-model="testTypes[type.key]" :label="type.label" />
            </fieldset>
          </UiPanel>

          <UiPanel title="CI/CD integration">
            <fieldset class="flex flex-col gap-2">
              <legend class="sr-only">CI/CD configurations to generate</legend>
              <UiCheckbox v-for="option in cicdOptions" :key="option.key" v-model="cicd[option.key]" :label="option.label" />
            </fieldset>
          </UiPanel>

          <UiButton variant="primary" class="w-full justify-center" label="Generate tests" :disabled="!selectedComponent" @click="generateTests" />
        </div>

        <!-- Right column: output and runners -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <UiPanel v-if="generatedTests" title="Generated tests">
            <template #actions>
              <UiSelect v-model="testFramework" label="Framework" :options="frameworkOptions" />
              <UiButton variant="primary" size="sm" icon="download" label="Download" @click="downloadTests" />
            </template>
            <UiCodeBlock
              :code="generatedTests"
              :label="`${frameworkLabels[testFramework]} tests`"
              @copied="showNotice('Tests copied to clipboard.', 'success')"
              @copy-failed="showNotice('Failed to copy to clipboard.', 'error')"
            />
          </UiPanel>

          <UiPanel v-if="cicdConfig && cicdConfig.length > 0" title="CI/CD configurations">
            <div v-for="(config, index) in cicdConfig" :key="index" class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-ink-strong">
                  {{ config.name }} <span class="text-xs font-normal text-ink-muted">{{ config.filename }}</span>
                </p>
                <UiButton size="sm" icon="download" :label="`Download ${config.name} config`" @click="downloadCicdConfig(config)" />
              </div>
              <UiCodeBlock
                :code="config.config"
                :label="config.filename"
                @copied="showNotice('Configuration copied to clipboard.', 'success')"
                @copy-failed="showNotice('Failed to copy to clipboard.', 'error')"
              />
            </div>
          </UiPanel>

          <!-- Unit, integration and visual tests: run in the project, not in the browser -->
          <UiPanel title="Test runner">
            <div class="grid md:grid-cols-2 gap-3">
              <div class="runner-note">
                <p class="flex items-center gap-2 text-sm font-medium text-ink-strong">
                  <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">block</span>
                  Unit &amp; integration tests: not available here
                </p>
                <p class="text-xs text-ink-secondary">
                  The generated tests need the component source, a test runner ({{ testFramework }}) and its environment, which only exist in your project. Download the tests above and run them there, or in CI.
                </p>
              </div>
              <div class="runner-note">
                <p class="flex items-center gap-2 text-sm font-medium text-ink-strong">
                  <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">image</span>
                  Visual regression: not available here
                </p>
                <p class="text-xs text-ink-secondary">
                  Visual tests compare screenshots against approved baselines captured in a fixed browser. Run them with the visual regression integration for your application, not from this page.
                </p>
              </div>
            </div>
          </UiPanel>

          <!-- Accessibility tests (axe-core, in this browser) -->
          <UiPanel title="Accessibility tests">
            <template #actions>
              <UiButton
                variant="primary"
                size="sm"
                :loading="a11yRunning"
                :label="a11yRunning ? 'Checking...' : 'Run a11y tests'"
                :disabled="!selectedComponent || !canPreview || a11yRunning || loadingComponent"
                @click="runAccessibilityTests"
              />
            </template>

            <p v-if="!selectedComponent" class="text-sm text-ink-muted text-center py-4">
              Select a component to check its rendered preview with axe-core.
            </p>
            <UiCallout v-else-if="!canPreview">
              No live preview exists for this component on this page, so accessibility can't be checked here. Run axe against the component in your application instead.
            </UiCallout>
            <template v-else>
              <div class="flex flex-col gap-2">
                <p class="text-xs text-ink-secondary">
                  Preview (default prop values). axe-core checks this rendered element against WCAG 2.1 A/AA and best-practice rules.
                </p>
                <div ref="previewRef" class="preview-well">
                  <ComponentPreview :component="selectedComponent" :props="previewProps" :is-dark-mode="previewDark" />
                </div>
              </div>

              <UiCallout v-if="a11yError" tone="danger" role="alert">{{ a11yError }}</UiCallout>

              <div v-if="a11yTestResults" class="flex flex-col gap-3" role="status">
                <div class="flex flex-wrap items-center gap-2">
                  <UiChip tone="danger" icon="cancel">Violations: {{ a11yTestResults.violations.length }}</UiChip>
                  <UiChip tone="success" icon="check_circle">Passed rules: {{ a11yTestResults.passes.length }}</UiChip>
                  <UiChip tone="warning" icon="help">Needs review: {{ a11yTestResults.incomplete.length }}</UiChip>
                </div>

                <UiCallout v-for="violation in a11yTestResults.violations" :key="violation.id" tone="danger" icon="close" :title="violation.help">
                  <p class="text-xs">
                    <span v-if="violation.impact" class="uppercase">{{ violation.impact }} · </span>
                    Rule <UiCode>{{ violation.id }}</UiCode> ·
                    <UiLink :href="violation.helpUrl" external>How to fix</UiLink>
                  </p>
                  <ul class="mt-2 flex flex-col gap-1">
                    <li v-for="(node, index) in violation.nodes" :key="index" class="text-xs font-code break-all">{{ node.target }}</li>
                  </ul>
                </UiCallout>

                <UiCallout v-for="item in a11yTestResults.incomplete" :key="`incomplete-${item.id}`" tone="warning" icon="help" :title="item.help">
                  Needs manual review.
                </UiCallout>

                <details v-if="a11yTestResults.passes.length" class="text-sm">
                  <summary class="cursor-pointer text-ink-secondary">Show {{ a11yTestResults.passes.length }} passed rules</summary>
                  <ul class="mt-2 flex flex-col gap-1">
                    <li v-for="pass in a11yTestResults.passes" :key="`pass-${pass.id}`" class="pass-item">
                      <span class="material-symbols-outlined text-base text-success" aria-hidden="true">check</span>
                      {{ pass.help }}
                    </li>
                  </ul>
                </details>
              </div>
            </template>
          </UiPanel>

          <!-- Performance: measured source size -->
          <UiPanel title="Performance tests">
            <template #actions>
              <UiButton
                size="sm"
                :loading="performanceLoading"
                :label="performanceLoading ? 'Measuring...' : 'Measure size'"
                :disabled="!selectedComponent || performanceLoading"
                @click="runPerformanceTests"
              />
            </template>
            <UiCallout v-if="performanceError" tone="danger" role="alert">{{ performanceError }}</UiCallout>
            <template v-else-if="performanceResults">
              <div class="grid grid-cols-3 gap-3">
                <UiStat label="Source (Vue + React)" :value="formatBytes(performanceResults.totalSize)" />
                <UiStat label="Gzip" :value="formatBytes(performanceResults.gzippedSize)" />
                <UiStat label="Brotli" :value="performanceResults.brotliSize != null ? formatBytes(performanceResults.brotliSize) : 'n/a'" />
              </div>
              <p class="text-xs text-ink-muted">
                Measured on the server from the component's stored source (not a minified build). Render timing isn't measured here.
              </p>
            </template>
            <p v-else-if="selectedComponent" class="text-sm text-ink-muted text-center py-4">
              Measure the raw, gzip and brotli size of this component's source.
            </p>
          </UiPanel>

          <!-- Test coverage -->
          <UiPanel title="Test coverage">
            <template #actions>
              <UiButton
                v-if="selectedComponent && !loadingCoverage"
                size="sm"
                variant="ghost"
                icon="refresh"
                icon-only
                label="Refresh coverage"
                @click="loadTestCoverage"
              />
            </template>

            <div v-if="loadingCoverage" class="flex justify-center py-6">
              <UiSpinner label="Loading test coverage..." />
            </div>

            <UiCallout v-else-if="coverageError" tone="danger" role="alert">{{ coverageError }}</UiCallout>

            <div v-else-if="testCoverage && testCoverage.available" class="flex flex-col gap-4">
              <div v-for="metric in ['statements', 'branches', 'functions', 'lines']" :key="metric" class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span :id="`coverage-${metric}`" class="text-sm capitalize text-ink-secondary">{{ metric }}</span>
                  <span class="text-sm font-semibold" :class="getCoverageColorClass(testCoverage[metric])">{{ testCoverage[metric] }}%</span>
                </div>
                <progress
                  class="coverage-bar"
                  :class="getCoverageBarColor(testCoverage[metric])"
                  max="100"
                  :value="testCoverage[metric]"
                  :aria-labelledby="`coverage-${metric}`"
                >
                  {{ testCoverage[metric] }}%
                </progress>
              </div>
            </div>

            <template v-else-if="testCoverage">
              <UiCallout title="No coverage data.">{{ testCoverage.reason }}</UiCallout>
              <div v-if="testCoverage.surface" class="flex flex-col gap-2">
                <p class="text-xs text-ink-secondary">Testable surface, from the component's prop definitions:</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <UiStat label="Props" :value="testCoverage.surface.props" />
                  <UiStat label="Enum options" :value="testCoverage.surface.enumOptions" />
                  <UiStat label="Boolean props" :value="testCoverage.surface.booleanProps" />
                  <UiStat label="Suggested cases" :value="testCoverage.surface.suggestedTestCases" />
                </div>
              </div>
            </template>

            <p v-else-if="selectedComponent" class="text-sm text-ink-muted text-center py-4">No coverage data available.</p>
            <p v-else class="text-sm text-ink-muted text-center py-4">Select a component to view test coverage</p>
          </UiPanel>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import axe from 'axe-core';
import ComponentPreview from '../components/ComponentPreview.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiCode,
  UiCodeBlock,
  UiLink,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
} from '../components/ui';

// ComponentPreview (not yet on tokens) still takes the theme as a prop
const previewDark = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const selectedComponent = ref('');
const componentData = ref(null);
const loadingComponent = ref(false);
const availableComponents = ref([]);
const testFramework = ref('vitest');
const testTypes = ref({
  unit: true,
  integration: false,
  visual: false,
  accessibility: false,
  performance: false,
  e2e: false,
  snapshot: false,
  crossBrowser: false,
  api: false
});
const cicd = ref({
  github: false,
  gitlab: false,
  jenkins: false,
  circleci: false
});
const testTypeOptions = [
  { key: 'unit', label: 'Unit tests' },
  { key: 'integration', label: 'Integration tests' },
  { key: 'visual', label: 'Visual regression' },
  { key: 'accessibility', label: 'Accessibility tests' },
  { key: 'performance', label: 'Performance tests' },
  { key: 'e2e', label: 'E2E tests' },
  { key: 'snapshot', label: 'Snapshot tests' },
  { key: 'crossBrowser', label: 'Cross-browser' },
  { key: 'api', label: 'API integration' },
];
const cicdLabels = { github: 'GitHub Actions', gitlab: 'GitLab CI', jenkins: 'Jenkins', circleci: 'CircleCI' };
const cicdOptions = Object.entries(cicdLabels).map(([key, label]) => ({ key, label }));
const frameworkLabels = { vitest: 'Vitest', jest: 'Jest', cypress: 'Cypress', playwright: 'Playwright' };
const frameworkOptions = Object.entries(frameworkLabels).map(([value, label]) => ({ value, label }));
const generatedTests = ref('');
const cicdConfig = ref('');
const a11yTestResults = ref(null);
const a11yRunning = ref(false);
const a11yError = ref('');
const previewRef = ref(null);
const performanceResults = ref(null);
const performanceLoading = ref(false);
const performanceError = ref('');
const testCoverage = ref(null);
const loadingCoverage = ref(false);
const coverageError = ref('');
const componentError = ref('');
const componentsError = ref('');

// Components ComponentPreview can actually render; axe runs against that render
const PREVIEWABLE_COMPONENTS = ['button', 'card', 'input', 'select', 'checkbox', 'radio', 'textarea', 'badge', 'alert'];
const componentOptions = computed(() => availableComponents.value.map((comp) => ({ value: comp.id, label: comp.name })));
const canPreview = computed(() => PREVIEWABLE_COMPONENTS.includes(selectedComponent.value));

// The preview renders with the component's own default prop values
const previewProps = computed(() => {
  const values = {};
  for (const prop of componentData.value?.props || []) {
    if (prop?.name && prop.default !== undefined) values[prop.name] = prop.default;
  }
  return values;
});

const apiErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join('; ');
  return message || fallback;
};
const generationSummary = ref(null);

// Load available components
const loadComponents = async () => {
  componentsError.value = '';
  try {
    const response = await apiClient.get('/api/v1/components');
    availableComponents.value = Array.isArray(response.data?.components) ? response.data.components : [];
  } catch (error) {
    availableComponents.value = [];
    componentsError.value = apiErrorMessage(error, 'Could not load components from the design-system API.');
  }
};

const loadTestCoverage = async () => {
  const id = selectedComponent.value;
  if (!id) return;
  loadingCoverage.value = true;
  coverageError.value = '';
  try {
    const response = await apiClient.get(`/api/v1/components/${encodeURIComponent(id)}/test-coverage`);
    if (selectedComponent.value === id) testCoverage.value = response.data;
  } catch (error) {
    if (selectedComponent.value === id) {
      testCoverage.value = null;
      coverageError.value = apiErrorMessage(error, 'Could not load test coverage.');
    }
  } finally {
    if (selectedComponent.value === id) loadingCoverage.value = false;
  }
};

// Load component data when selected; responses for an earlier selection are ignored
watch(selectedComponent, async (newValue) => {
  componentData.value = null;
  testCoverage.value = null;
  coverageError.value = '';
  componentError.value = '';
  a11yTestResults.value = null;
  a11yError.value = '';
  performanceResults.value = null;
  performanceError.value = '';
  generatedTests.value = '';
  cicdConfig.value = '';
  generationSummary.value = null;
  if (!newValue) return;

  loadingComponent.value = true;
  loadTestCoverage();
  try {
    const response = await apiClient.get(`/api/v1/components/${encodeURIComponent(newValue)}`);
    if (selectedComponent.value === newValue) componentData.value = response.data;
  } catch (error) {
    if (selectedComponent.value === newValue) {
      componentError.value = apiErrorMessage(error, 'Could not load this component.');
    }
  } finally {
    if (selectedComponent.value === newValue) loadingComponent.value = false;
  }
});

const generateTests = () => {
  if (!selectedComponent.value) {
    showNotice('Please select a component first', 'warning');
    return;
  }

  const activeTypes = Object.entries(testTypes.value)
    .filter(([_, active]) => active)
    .map(([type]) => type);

  if (activeTypes.length === 0) {
    showNotice('Please select at least one test type', 'warning');
    return;
  }

  let testCode = '';

  // Use component data if available, otherwise fall back to component name only
  const componentInfo = componentData.value || { 
    id: selectedComponent.value, 
    name: selectedComponent.value.charAt(0).toUpperCase() + selectedComponent.value.slice(1),
    props: []
  };

  if (testFramework.value === 'vitest' || testFramework.value === 'jest') {
    testCode = generateJestTests(componentInfo, activeTypes);
  } else if (testFramework.value === 'cypress') {
    testCode = generateCypressTests(componentInfo, activeTypes);
  } else if (testFramework.value === 'playwright') {
    testCode = generatePlaywrightTests(componentInfo, activeTypes);
  }

  generatedTests.value = testCode;
  
  // Generate CI/CD config if any CI/CD option is selected
  const activeCicd = Object.entries(cicd.value)
    .filter(([_, active]) => active)
    .map(([name]) => name);
  
  if (activeCicd.length > 0) {
    cicdConfig.value = generateCicdConfig(activeCicd, testFramework.value, activeTypes);
  } else {
    cicdConfig.value = '';
  }

  // Create generation summary
  generationSummary.value = {
    component: componentInfo.name || componentInfo.id,
    framework: testFramework.value,
    testTypes: activeTypes,
    cicd: activeCicd,
    propsCount: componentInfo.props?.length || 0,
    timestamp: new Date().toISOString(),
  };
};

// Analyze component props to generate intelligent tests
const analyzeProps = (props) => {
  if (!props || props.length === 0) return { hasProps: false, props: [] };
  
  return {
    hasProps: true,
    props: props.map(prop => ({
      name: prop.name,
      type: prop.type,
      required: prop.required || false,
      defaultValue: prop.default,
      options: prop.options || [],
      description: prop.description || '',
      isEnum: !!(prop.options && prop.options.length > 0),
      isBoolean: prop.type === 'boolean' || prop.type === 'Boolean',
      isString: prop.type === 'string' || prop.type === 'String',
      isNumber: prop.type === 'number' || prop.type === 'Number',
      isFunction: prop.type === 'function' || prop.type === 'Function' || prop.name.toLowerCase().includes('on') || prop.name.toLowerCase().includes('handle'),
    }))
  };
};

const generateJestTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `import { describe, it, expect, beforeEach, vi } from '${testFramework.value === 'vitest' ? 'vitest' : '@jest/globals'}';
import { mount } from '@vue/test-utils';
import ${componentName} from './${componentId}.vue';

describe('${componentName} Component', () => {
`;

  if (types.includes('unit')) {
    code += `  describe('Unit Tests', () => {
    it('should render correctly', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.exists()).toBe(true);
    });

    it('should render with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.exists()).toBe(true);
`;

    // Test default values
    props.props.forEach(prop => {
      if (prop.defaultValue !== undefined && prop.defaultValue !== null) {
        code += `      expect(wrapper.props('${prop.name}')).toBe(${JSON.stringify(prop.defaultValue)});\n`;
      }
    });

    code += `    });

`;

    // Test each prop individually
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        // Test each enum value
        prop.options.forEach(option => {
          code += `    it('should render with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper.props('${prop.name}')).toBe('${option}');
    });

`;
        });
      } else if (prop.isBoolean) {
        // Test boolean props
        code += `    it('should handle ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: true }
      });
      expect(wrapper.props('${prop.name}')).toBe(true);
    });

    it('should handle ${prop.name} prop when false', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: false }
      });
      expect(wrapper.props('${prop.name}')).toBe(false);
    });

`;
      } else if (prop.isString) {
        // Test string props
        code += `    it('should accept ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 'test-value' }
      });
      expect(wrapper.props('${prop.name}')).toBe('test-value');
    });

`;
      } else if (prop.isNumber) {
        // Test number props
        code += `    it('should accept ${prop.name} prop', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 42 }
      });
      expect(wrapper.props('${prop.name}')).toBe(42);
    });

`;
      }

      // Test required props
      if (prop.required) {
        code += `    it('should require ${prop.name} prop', () => {
      // Component should handle missing required prop or show warning
      const wrapper = mount(${componentName});
      // Add assertion based on component behavior
    });

`;
      }
    });

    // Test prop combinations (for important combinations)
    const booleanProps = props.props.filter(p => p.isBoolean);
    const enumProps = props.props.filter(p => p.isEnum && p.options.length > 0);
    
    if (booleanProps.length > 0 && enumProps.length > 0) {
      // Test combination of first enum and first boolean
      const firstEnum = enumProps[0];
      const firstBool = booleanProps[0];
      if (firstEnum && firstBool) {
        code += `    it('should handle ${firstEnum.name} and ${firstBool.name} combination', () => {
      const wrapper = mount(${componentName}, {
        props: { ${firstEnum.name}: '${firstEnum.options[0]}', ${firstBool.name}: true }
      });
      expect(wrapper.props('${firstEnum.name}')).toBe('${firstEnum.options[0]}');
      expect(wrapper.props('${firstBool.name}')).toBe(true);
    });

`;
      }
    }

    code += `  });

`;
  }

  if (types.includes('integration')) {
    code += `  describe('Integration Tests', () => {
`;

    // Test event handlers (functions that start with 'on' or 'handle')
    const eventHandlers = props.props.filter(p => p.isFunction);
    eventHandlers.forEach(handler => {
      const eventName = handler.name.replace(/^on|^handle/, '').toLowerCase();
      code += `    it('should handle ${handler.name} event', async () => {
      const ${handler.name} = vi.fn();
      const wrapper = mount(${componentName}, {
        props: { ${handler.name} }
      });
      await wrapper.trigger('${eventName}');
      expect(${handler.name}).toHaveBeenCalled();
    });

`;
    });

    // Test interactions with boolean props (like disabled, loading)
    const interactiveBooleans = props.props.filter(p => 
      p.isBoolean && (p.name.toLowerCase().includes('disabled') || 
                     p.name.toLowerCase().includes('loading') ||
                     p.name.toLowerCase().includes('readonly'))
    );
    
    interactiveBooleans.forEach(prop => {
      code += `    it('should handle interactions when ${prop.name} is true', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: true }
      });
      // Component should prevent interaction when ${prop.name} is true
      await wrapper.trigger('click');
      // Add assertions based on component behavior
    });

`;
    });

    // Test prop changes
    if (props.props.length > 0) {
      const firstProp = props.props[0];
      code += `    it('should update when props change', async () => {
      const wrapper = mount(${componentName});
      await wrapper.setProps({ ${firstProp.name}: ${firstProp.isBoolean ? 'true' : firstProp.isEnum && firstProp.options.length > 0 ? `'${firstProp.options[0]}'` : firstProp.isNumber ? '42' : "'new-value'"}});
      expect(wrapper.props('${firstProp.name}')).toBe(${firstProp.isBoolean ? 'true' : firstProp.isEnum && firstProp.options.length > 0 ? `'${firstProp.options[0]}'` : firstProp.isNumber ? '42' : "'new-value'"});
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('visual')) {
    code += `  describe('Visual Regression Tests', () => {
    it('should match visual snapshot with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper.html()).toMatchSnapshot();
    });

`;

    // Generate visual snapshots for each enum prop value
    props.props.filter(p => p.isEnum && p.options.length > 0).forEach(prop => {
      prop.options.forEach(option => {
        code += `    it('should match visual snapshot with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper.html()).toMatchSnapshot();
    });

`;
      });
    });

    code += `  });

`;
  }

  if (types.includes('e2e')) {
    code += `  describe('E2E Tests', () => {
    it('should complete full user interaction flow', async () => {
      const wrapper = mount(${componentName});
`;

    // Add interactions based on props
    const hasClickHandler = props.props.some(p => p.isFunction && (p.name.toLowerCase().includes('click') || p.name.toLowerCase().includes('onclick')));
    if (hasClickHandler) {
      code += `      await wrapper.trigger('click');
`;
    }

    // Test prop changes during interaction
    const interactiveProps = props.props.filter(p => 
      p.isBoolean && !p.name.toLowerCase().includes('disabled') && !p.name.toLowerCase().includes('loading')
    );
    
    if (interactiveProps.length > 0) {
      const firstInteractive = interactiveProps[0];
      code += `      await wrapper.setProps({ ${firstInteractive.name}: true });
      expect(wrapper.props('${firstInteractive.name}')).toBe(true);
`;
    }

    code += `    });

`;

    // Test edge cases
    const disabledProp = props.props.find(p => p.name.toLowerCase().includes('disabled'));
    const loadingProp = props.props.find(p => p.name.toLowerCase().includes('loading'));
    
    if (disabledProp || loadingProp) {
      code += `    it('should handle edge case: disabled and loading states', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${disabledProp ? `${disabledProp.name}: true` : ''}${disabledProp && loadingProp ? ', ' : ''}${loadingProp ? `${loadingProp.name}: true` : ''} }
      });
      // Component should handle both states appropriately
      expect(wrapper.exists()).toBe(true);
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('snapshot')) {
    code += `  describe('Snapshot Tests', () => {
    it('should match component snapshot with default props', () => {
      const wrapper = mount(${componentName});
      expect(wrapper).toMatchSnapshot();
    });

`;

    // Generate snapshots for each enum prop value
    props.props.filter(p => p.isEnum && p.options.length > 0).forEach(prop => {
      prop.options.forEach(option => {
        code += `    it('should match snapshot with ${prop.name}="${option}"', () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: '${option}' }
      });
      expect(wrapper).toMatchSnapshot();
    });

`;
      });
    });

    // Generate snapshot for boolean combinations
    const booleanProps = props.props.filter(p => p.isBoolean);
    if (booleanProps.length > 0) {
      code += `    it('should match snapshot with boolean props', () => {
      const wrapper = mount(${componentName}, {
        props: { ${booleanProps.map(p => `${p.name}: true`).join(', ')} }
      });
      expect(wrapper).toMatchSnapshot();
    });

`;
    }

    code += `  });

`;
  }

  if (types.includes('api')) {
    code += `  describe('API Integration Tests', () => {
`;

    // Check if component has any async/data-fetching props
    const asyncProps = props.props.filter(p => 
      p.name.toLowerCase().includes('data') || 
      p.name.toLowerCase().includes('fetch') ||
      p.name.toLowerCase().includes('load')
    );

    if (asyncProps.length > 0) {
      asyncProps.forEach(prop => {
        code += `    it('should handle ${prop.name} data', async () => {
      const wrapper = mount(${componentName}, {
        props: { ${prop.name}: 'test-data' }
      });
      // Add API integration assertions
      expect(wrapper.exists()).toBe(true);
    });

`;
      });
    } else {
      code += `    it('should handle API responses', async () => {
      const wrapper = mount(${componentName});
      // Mock API call if component has data fetching
      // const mockResponse = { data: 'test' };
      // await wrapper.vm.fetchData();
      // expect(wrapper.vm.data).toEqual(mockResponse);
      expect(wrapper.exists()).toBe(true);
    });

`;
    }

    code += `  });

`;
  }

  code += '});';
  return code;
};

const generateCypressTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `describe('${componentName} Component', () => {
  beforeEach(() => {
    cy.visit('/components/${componentId}');
  });

`;

  if (types.includes('unit')) {
    code += `  describe('Rendering', () => {
    it('should render correctly', () => {
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

`;

    // Test each prop value
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        prop.options.forEach(option => {
          code += `    it('should render with ${prop.name}="${option}"', () => {
      cy.get('[data-testid="${componentId}"]').should('have.attr', 'data-${prop.name}', '${option}');
    });

`;
        });
      }
    });

    code += `  });

`;
  }

  if (types.includes('integration')) {
    code += `  describe('Interactions', () => {
`;

    // Test event handlers
    const eventHandlers = props.props.filter(p => p.isFunction);
    eventHandlers.forEach(handler => {
      code += `    it('should handle ${handler.name} event', () => {
      cy.get('[data-testid="${componentId}"]').click();
      // Verify ${handler.name} was called
    });

`;
    });

    code += `  });

`;
  }

  if (types.includes('crossBrowser')) {
    code += `  describe('Cross-Browser Compatibility', () => {
    it('should work in Chrome', () => {
      cy.visit('/components/${componentId}', { browser: 'chrome' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

    it('should work in Firefox', () => {
      cy.visit('/components/${componentId}', { browser: 'firefox' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });

    it('should work in Safari', () => {
      cy.visit('/components/${componentId}', { browser: 'webkit' });
      cy.get('[data-testid="${componentId}"]').should('exist');
    });
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  describe('End-to-End Tests', () => {
    it('should complete full user journey', () => {
      cy.get('[data-testid="${componentId}"]').click();
`;

    // Add prop-specific interactions
    const clickableProps = props.props.filter(p => p.isFunction && p.name.toLowerCase().includes('click'));
    if (clickableProps.length > 0) {
      code += `      cy.get('[data-testid="${componentId}"]').should('be.visible');
`;
    }

    code += `      // Add more E2E steps based on component behavior
    });
  });

`;
  }

  if (types.includes('api')) {
    code += `  describe('API Integration', () => {
    it('should handle API calls', () => {
      cy.intercept('GET', '/api/data', { fixture: 'data.json' }).as('getData');
      cy.visit('/components/${componentId}');
      cy.wait('@getData');
      cy.get('[data-testid="${componentId}"]').should('be.visible');
    });
  });

`;
  }

  code += '});';
  return code;
};

const generatePlaywrightTests = (componentInfo, types) => {
  const componentName = componentInfo.name || componentInfo.id.charAt(0).toUpperCase() + componentInfo.id.slice(1);
  const componentId = componentInfo.id || componentInfo.name?.toLowerCase();
  const props = analyzeProps(componentInfo.props || []);
  
  let code = `import { test, expect } from '@playwright/test';

test.describe('${componentName} Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/${componentId}');
  });

`;

  if (types.includes('unit')) {
    code += `  test('should render correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
  });

`;

    // Test each enum prop
    props.props.forEach(prop => {
      if (prop.isEnum && prop.options.length > 0) {
        prop.options.forEach(option => {
          code += `  test('should render with ${prop.name}="${option}"', async ({ page }) => {
    await expect(page.locator('[data-testid="${componentId}"][data-${prop.name}="${option}"]')).toBeVisible();
  });

`;
        });
      }
    });

    code += `
`;
  }

  if (types.includes('crossBrowser')) {
    code += `  test.describe('Cross-Browser Compatibility', () => {
    test('should work in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });

    test('should work in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });

    test('should work in WebKit', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit');
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  if (types.includes('e2e')) {
    code += `  test.describe('End-to-End Tests', () => {
    test('should complete full user flow', async ({ page }) => {
      await page.click('[data-testid="${componentId}"]');
`;

    // Add prop-specific assertions
    const eventHandlers = props.props.filter(p => p.isFunction);
    if (eventHandlers.length > 0) {
      code += `      // Verify event handlers were triggered
`;
    }

    code += `      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  if (types.includes('api')) {
    code += `  test.describe('API Integration', () => {
    test('should handle API integration', async ({ page }) => {
      await page.route('**/api/data', route => route.fulfill({ json: { data: 'test' } }));
      await expect(page.locator('[data-testid="${componentId}"]')).toBeVisible();
    });
  });

`;
  }

  code += '});';
  return code;
};

// Runs axe-core against the component as rendered by ComponentPreview, in this page
const runAccessibilityTests = async () => {
  if (!selectedComponent.value || a11yRunning.value) return;
  a11yError.value = '';
  a11yTestResults.value = null;
  if (!canPreview.value) {
    a11yError.value = 'This component has no live preview on this page, so there is nothing rendered to check.';
    return;
  }
  a11yRunning.value = true;
  const id = selectedComponent.value;
  try {
    await nextTick();
    const element = previewRef.value;
    if (!element) throw new Error('The component preview is not rendered.');
    const results = await axe.run(element, {
      resultTypes: ['violations', 'passes', 'incomplete'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    });
    if (selectedComponent.value !== id) return;
    a11yTestResults.value = {
      ranAt: results.timestamp,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({ target: n.target.join(' '), summary: n.failureSummary })),
      })),
      passes: results.passes.map(p => ({ id: p.id, help: p.help, nodes: p.nodes.length })),
      incomplete: results.incomplete.map(i => ({ id: i.id, help: i.help, helpUrl: i.helpUrl, nodes: i.nodes.length })),
    };
  } catch (error) {
    if (selectedComponent.value === id) a11yError.value = `Accessibility check failed: ${error?.message || error}`;
  } finally {
    a11yRunning.value = false;
  }
};

// Measured source sizes from the backend (raw, gzip, brotli via zlib)
const runPerformanceTests = async () => {
  const id = selectedComponent.value;
  if (!id || performanceLoading.value) return;
  performanceLoading.value = true;
  performanceError.value = '';
  try {
    const response = await apiClient.post('/api/v1/performance/bundle-analysis/analyze', {
      componentId: id,
      includeDependencies: true,
    });
    if (selectedComponent.value === id) performanceResults.value = response.data;
  } catch (error) {
    if (selectedComponent.value === id) {
      performanceResults.value = null;
      performanceError.value = apiErrorMessage(error, 'Could not analyze the bundle size.');
    }
  } finally {
    performanceLoading.value = false;
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
};

const getCoverageColorClass = (percentage) => {
  if (percentage >= 80) return 'text-success';
  if (percentage >= 60) return 'text-warning';
  return 'text-danger';
};

const getCoverageBarColor = (percentage) => {
  if (percentage >= 80) return 'coverage-good';
  if (percentage >= 60) return 'coverage-fair';
  return 'coverage-poor';
};

const generateCicdConfig = (activeCicd, framework, testTypes) => {
  let configs = [];
  
  if (activeCicd.includes('github')) {
    let githubConfig = `name: Component Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test`;
    
    if (framework === 'cypress') {
      githubConfig += `
    
    - name: Cypress run
      uses: cypress-io/github-action@v5`;
    } else if (framework === 'playwright') {
      githubConfig += `
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test`;
    }
    
    configs.push({ name: 'GitHub Actions', config: githubConfig, filename: '.github/workflows/tests.yml' });
  }
  
  if (activeCicd.includes('gitlab')) {
    const gitlabConfig = `test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  artifacts:
    reports:
      junit: junit.xml`;
    
    configs.push({ name: 'GitLab CI', config: gitlabConfig, filename: '.gitlab-ci.yml' });
  }
  
  if (activeCicd.includes('jenkins')) {
    const jenkinsConfig = `pipeline {
  agent any
  
  stages {
    stage('Test') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }
  }
}`;
    
    configs.push({ name: 'Jenkins', config: jenkinsConfig, filename: 'Jenkinsfile' });
  }
  
  if (activeCicd.includes('circleci')) {
    const circleciConfig = `version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Run tests
          command: npm test

workflows:
  version: 2
  test-workflow:
    jobs:
      - test`;
    
    configs.push({ name: 'CircleCI', config: circleciConfig, filename: '.circleci/config.yml' });
  }
  
  return configs;
};

const downloadTests = () => {
  if (!generatedTests.value) return;
  const extension = testFramework.value === 'cypress' ? 'cy.js' : testFramework.value === 'playwright' ? 'spec.ts' : 'test.js';
  const filename = `${selectedComponent.value}.${extension}`;
  
  const blob = new Blob([generatedTests.value], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const downloadCicdConfig = (config) => {
  const blob = new Blob([config.config], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = config.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

onMounted(loadComponents);
</script>

<style scoped>
.props-well {
  @apply flex flex-col gap-3 rounded-tile border border-line bg-surface-sunken p-3;
}
.prop-item {
  @apply flex flex-col gap-1 rounded-control bg-surface-raised p-2;
}
.summary-list {
  @apply grid grid-cols-aside-content gap-x-3 gap-y-1 text-xs;
}
.summary-list dt {
  @apply font-medium;
}
.runner-note {
  @apply flex flex-col gap-1 rounded-tile border border-line bg-surface-sunken p-4;
}
.preview-well {
  @apply flex items-center justify-center rounded-tile border border-line bg-surface-sunken p-6;
}
.pass-item {
  @apply flex items-center gap-2 rounded-control bg-success-bg px-2 py-1 text-success;
}
.coverage-bar {
  @apply block w-full h-2 appearance-none overflow-hidden rounded-pill border-0 bg-fill;
}
.coverage-bar::-webkit-progress-bar {
  @apply bg-fill rounded-pill;
}
.coverage-bar::-webkit-progress-value {
  @apply rounded-pill transition-all duration-300;
}
.coverage-good::-webkit-progress-value {
  @apply bg-success-solid;
}
.coverage-good::-moz-progress-bar {
  @apply bg-success-solid;
}
.coverage-fair::-webkit-progress-value {
  @apply bg-warning-solid;
}
.coverage-fair::-moz-progress-bar {
  @apply bg-warning-solid;
}
.coverage-poor::-webkit-progress-value {
  @apply bg-danger-solid;
}
.coverage-poor::-moz-progress-bar {
  @apply bg-danger-solid;
}
</style>
