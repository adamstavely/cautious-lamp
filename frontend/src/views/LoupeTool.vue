<template>
  <PageShell>
    <PageHero
      :back="{ to: '/components', label: 'Components' }"
      title="Loupe"
      lead="Inspect design system components on any page. Press a keyboard shortcut to see every component and access its documentation, source code, and design files. Includes breakpoint tracking, layout inspection, and responsive design tools."
      spot="tools/loupe-tool"
      size="tool"
    />

    <PageSection title="How to use" description="Turn the inspector on from any page, then hover to learn about each component.">
      <ol class="grid gap-4 md:grid-cols-2">
        <li v-for="step in steps" :key="step.title" class="flex items-start gap-4 rounded-tile border border-line bg-surface-raised p-4">
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-control bg-accent-subtle text-accent-text" aria-hidden="true">
            <component :is="step.icon" :size="20" />
          </span>
          <div>
            <h3 class="mb-1 font-semibold text-ink-strong">{{ step.title }}</h3>
            <p v-if="step.shortcut" class="text-sm text-ink-secondary">
              Press <kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Shift</kbd> + <kbd class="kbd">L</kbd>
              (or <kbd class="kbd">Cmd</kbd> + <kbd class="kbd">Shift</kbd> + <kbd class="kbd">L</kbd> on Mac) on any page to activate the tool.
            </p>
            <p v-else-if="step.escape" class="text-sm text-ink-secondary">
              Press the keyboard shortcut again or <kbd class="kbd">Escape</kbd> to close the tool.
            </p>
            <p v-else class="text-sm text-ink-secondary">{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </PageSection>

    <PageSection title="Breakpoint features" description="Tools in the control panel for responsive layouts." divided>
      <div class="grid gap-6 lg:grid-cols-2">
        <UiPanel title="Visual breakpoint ruler" heading-tag="h3">
          <div class="mb-4 rounded-control border border-line bg-surface-sunken p-3">
            <svg viewBox="0 0 400 40" class="h-10 w-full" role="img" aria-label="Example ruler with markers at 640, 768, 1024 and 1280 pixels and the viewport between 1024 and 1280">
              <g v-for="(marker, i) in rulerMarkers" :key="marker.label" :class="`ruler-${i + 1}`">
                <line :x1="marker.x" y1="0" :x2="marker.x" y2="40" stroke-width="2" />
                <text :x="marker.x" y="25" font-size="10" text-anchor="middle">{{ marker.label }}</text>
              </g>
              <g class="ruler-viewport">
                <line x1="280" y1="0" x2="280" y2="40" stroke-width="3" />
                <circle cx="280" cy="20" r="4" />
              </g>
            </svg>
          </div>
          <p class="mb-3 text-sm text-ink-secondary">
            The Breakpoint Ruler displays at the top of the page when enabled, providing a visual representation of all breakpoints:
          </p>
          <ul class="feature-list">
            <li>Color-coded vertical markers for each breakpoint</li>
            <li>Red viewport indicator showing current window width</li>
            <li>Clickable markers with breakpoint information</li>
            <li>Real-time updates as you resize the browser</li>
          </ul>
        </UiPanel>

        <UiPanel title="Breakpoint list" heading-tag="h3">
          <ul class="mb-4 space-y-2 rounded-control border border-line bg-surface-sunken p-3" aria-label="Example breakpoint list">
            <li class="flex items-center justify-between rounded-control border border-accent-highlight bg-accent-subtle p-2">
              <span class="text-sm font-medium text-ink-strong">Large</span>
              <UiChip tone="success">Active</UiChip>
            </li>
            <li v-for="name in ['Medium', 'Small']" :key="name" class="flex items-center justify-between rounded-control border border-line p-2">
              <span class="text-sm text-ink-secondary">{{ name }}</span>
              <UiChip>Inactive</UiChip>
            </li>
          </ul>
          <p class="mb-3 text-sm text-ink-secondary">The control panel includes a comprehensive breakpoint list:</p>
          <ul class="feature-list">
            <li>Shows all configured breakpoints (Small, Medium, Large, XL, 2XL)</li>
            <li>Visual indication of active/inactive status</li>
            <li>Displays pixel ranges for each breakpoint</li>
            <li>Updates automatically when viewport changes</li>
          </ul>
        </UiPanel>

        <UiPanel title="Viewport tracking" heading-tag="h3">
          <div class="mb-4 flex items-center gap-3 rounded-control border border-line bg-surface-sunken p-3">
            <span class="rounded-control bg-fill p-2 text-ink-secondary" aria-hidden="true"><Monitor :size="20" /></span>
            <div>
              <div class="text-sm font-medium text-ink-strong">1920 × 1080px</div>
              <div class="text-xs text-ink-secondary">Large</div>
            </div>
          </div>
          <p class="mb-3 text-sm text-ink-secondary">Real-time viewport information displayed in the control panel header:</p>
          <ul class="feature-list">
            <li>Current viewport dimensions (width × height)</li>
            <li>Active breakpoint name (e.g., "Large", "Medium")</li>
            <li>Automatic updates on window resize</li>
          </ul>
        </UiPanel>

        <UiPanel title="Layout inspector" heading-tag="h3">
          <div class="mb-4 rounded-control border border-line bg-surface-sunken p-3">
            <svg viewBox="0 0 200 120" class="h-24 w-full" role="img" aria-label="Example grid container with six highlighted cells">
              <rect class="layout-frame" x="10" y="10" width="180" height="100" fill="none" stroke-width="2" stroke-dasharray="4 4" rx="4" />
              <rect v-for="cell in gridCells" :key="`${cell.x}-${cell.y}`" class="layout-cell" :x="cell.x" :y="cell.y" :width="cell.w" height="40" rx="2" />
              <text class="layout-label" x="100" y="65" font-size="12" text-anchor="middle" font-weight="bold">Grid</text>
            </svg>
          </div>
          <p class="mb-3 text-sm text-ink-secondary">Detect and inspect CSS layout containers on the page:</p>
          <ul class="feature-list">
            <li>Automatically detects CSS Grid and Flexbox containers</li>
            <li>Visual overlays highlighting layout containers</li>
            <li>Shows layout properties (gap, direction, alignment, justification)</li>
            <li>Click items in the list to highlight them on the page</li>
            <li>Refresh button to re-scan after DOM changes</li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection
      title="Adding components to the Loupe tool"
      description="To make a component detectable by the Loupe Tool, add data attributes to the component's root element."
      divided
    >
      <UiCodeBlock :code="exampleCode" label="Vue template" />
      <dl class="mt-4 space-y-2 text-sm">
        <div>
          <dt class="inline"><UiCode>data-ds-component</UiCode></dt>
          <dd class="inline text-ink-secondary"> (required): The component identifier (e.g., "button", "card", "input")</dd>
        </div>
        <div>
          <dt class="inline"><UiCode>data-ds-path</UiCode></dt>
          <dd class="inline text-ink-secondary"> (optional): The import path for the component (e.g., "@design-system/components/button")</dd>
        </div>
      </dl>
    </PageSection>

    <PageSection title="Try it now" divided>
      <p class="mb-4 text-ink">
        Press <kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Shift</kbd> + <kbd class="kbd">L</kbd> to activate the Loupe Tool and see all design system components on this page highlighted.
      </p>
      <UiCallout title="Components on this page">
        This page includes several design system components that you can inspect with the Loupe Tool, including the Sidebar, Top Navigation, Breadcrumbs, and Documentation Drawer.
      </UiCallout>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { Eye, ExternalLink, Keyboard, Monitor, MousePointerClick, Ruler, X } from 'lucide-vue-next';
import { PageHero, PageSection, PageShell, UiCallout, UiChip, UiCode, UiCodeBlock, UiPanel } from '../components/ui';

const steps = [
  { title: 'Activate the Loupe Tool', icon: Keyboard, shortcut: true },
  { title: 'View Components', icon: Eye, body: 'All design system components on the page will be highlighted with a blue overlay.' },
  {
    title: 'Hover for Details',
    icon: MousePointerClick,
    body: 'Hover over any highlighted component to see its name, import path, and links to documentation, GitHub, and Figma.',
  },
  {
    title: 'Access Resources',
    icon: ExternalLink,
    body: 'Click on any link in the info panel to open documentation, source code, or design files in a new tab.',
  },
  {
    title: 'Use Breakpoint Features',
    icon: Ruler,
    body: 'Toggle "Breakpoint Ruler" to see a visual ruler at the top showing all breakpoints. View current viewport size and active breakpoint in the control panel. Use "Layout Inspector" to detect Grid and Flex containers.',
  },
  { title: 'Deactivate', icon: X, escape: true },
];

const rulerMarkers = [
  { x: 80, label: '640' },
  { x: 160, label: '768' },
  { x: 240, label: '1024' },
  { x: 320, label: '1280' },
];

const gridCells = [
  { x: 15, y: 15, w: 55 },
  { x: 75, y: 15, w: 55 },
  { x: 135, y: 15, w: 50 },
  { x: 15, y: 60, w: 55 },
  { x: 75, y: 60, w: 55 },
  { x: 135, y: 60, w: 50 },
];

const exampleCode = `<template>
  <div
    data-ds-component="component-name"
    data-ds-path="@design-system/components/component-name"
  >
    <!-- Component content -->
  </div>
</template>`;
</script>

<style scoped>
.kbd {
  @apply rounded-control border border-line-control bg-surface-sunken px-2 py-0.5 font-code text-xs text-ink;
}
.feature-list {
  @apply ml-4 list-inside list-disc space-y-1 text-sm text-ink-secondary;
}
.ruler-1 { @apply fill-chart-1 stroke-chart-1; }
.ruler-2 { @apply fill-chart-2 stroke-chart-2; }
.ruler-3 { @apply fill-chart-3 stroke-chart-3; }
.ruler-4 { @apply fill-chart-4 stroke-chart-4; }
.ruler-1 text,
.ruler-2 text,
.ruler-3 text,
.ruler-4 text { stroke: none; }
.ruler-viewport { @apply fill-danger-solid stroke-danger-solid; }
.layout-frame { @apply stroke-chart-1; }
.layout-cell { @apply fill-chart-1 opacity-20; }
.layout-label { @apply fill-chart-1; }
</style>
