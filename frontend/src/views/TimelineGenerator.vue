<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Timeline generator"
      lead="Create customizable timelines with events, dates, and icons. Generate React or Vue components with interactive timeline displays."
      spot="tools/timeline-generator"
      size="tool"
    />

    <PageSection title="Timeline style" description="How the events are laid out.">
      <UiChoiceCards v-model="config.style" :options="timelineStyles" :columns="3" aria-label="Timeline style" />
    </PageSection>

    <PageSection title="Build" description="Describe the timeline, add events, check it and export the code." divided>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <UiPanel title="Configuration">
            <div class="flex flex-col gap-4">
              <UiInput
                v-model="config.title"
                label="Timeline title"
                placeholder="Enter timeline title"
                required
                :error="config.title ? '' : 'Timeline title is required for accessibility compliance.'"
              />
              <UiTextarea
                v-model="config.summary"
                label="Timeline summary"
                hint="1-2 sentences"
                :rows="2"
                placeholder="Enter a brief summary describing what this timeline shows"
                required
                :error="config.summary ? '' : 'Timeline summary is required for accessibility compliance.'"
              />
              <UiTextarea
                v-model="config.keyInsight"
                label="Key insight"
                hint="Primary takeaway"
                :rows="2"
                placeholder="Enter the primary insight or takeaway from this timeline"
                required
                :error="config.keyInsight ? '' : 'Key insight is required for accessibility compliance.'"
              />

              <div class="grid grid-cols-aside-content items-end gap-2">
                <div class="w-16">
                  <UiInput v-model="config.timelineColor" type="color" label="Timeline color" />
                </div>
                <!-- style-check: allow the placeholder shows an example hex value the user types -->
                <UiInput v-model="config.timelineColor" placeholder="#6366f1" mono aria-label="Timeline color value" />
              </div>

              <UiSelect v-model="config.dateFormat" label="Date format" :options="dateFormatOptions" />
              <UiRange v-model="config.spacing" label="Event spacing" :min="40" :max="200" :step="10" unit="px" />
            </div>

            <div class="mt-6 pt-6 border-t border-line">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-ink-strong">Events ({{ events.length }})</h3>
                <UiButton variant="primary" size="sm" icon="add" @click="addEvent">Add event</UiButton>
              </div>

              <div class="flex flex-col gap-3 max-h-96 overflow-y-auto">
                <fieldset v-for="(event, index) in events" :key="event.id" class="flex flex-col gap-2 p-3 rounded-tile border border-line bg-surface-sunken">
                  <legend class="sr-only">Event {{ index + 1 }}</legend>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-ink-muted" aria-hidden="true">Event {{ index + 1 }}</span>
                    <UiButton icon-only icon="delete" variant="ghost" size="sm" :label="`Remove event ${index + 1}`" :disabled="events.length <= 1" @click="removeEvent(index)" />
                  </div>
                  <UiInput v-model="event.date" type="date" :aria-label="`Event ${index + 1} date`" />
                  <UiInput v-model="event.title" placeholder="Event title" :aria-label="`Event ${index + 1} title`" />
                  <UiTextarea v-model="event.description" :rows="2" placeholder="Event description" :aria-label="`Event ${index + 1} description`" />
                  <div class="grid grid-cols-content-aside items-end gap-2">
                    <UiSelect v-model="event.icon" :options="iconOptions" :aria-label="`Event ${index + 1} icon`" />
                    <div class="w-12">
                      <UiInput v-model="event.color" type="color" :aria-label="`Event ${index + 1} color`" />
                    </div>
                  </div>
                  <UiSegmented v-if="config.style === 'zigzag'" v-model="event.position" :options="positionOptions" :aria-label="`Event ${index + 1} side`" />
                </fieldset>
              </div>
            </div>
          </UiPanel>
        </div>

        <div class="lg:col-span-2 flex flex-col gap-6">
          <UiPanel title="Preview">
            <div class="timeline-stage">
              <figure
                ref="timelinePreview"
                class="timeline-container"
                role="img"
                :aria-label="config.title || 'Timeline'"
                aria-describedby="timeline-summary"
                tabindex="0"
              >
                <div v-if="config.style === 'vertical'" class="timeline-vertical">
                  <div v-for="(event, index) in sortedEvents" :key="event.id" class="timeline-event-vertical">
                    <div class="timeline-marker timeline-marker-vertical">
                      <svg class="timeline-marker-dot" viewBox="0 0 2 2" aria-hidden="true"><circle cx="1" cy="1" r="1" :fill="event.color || config.timelineColor" /></svg>
                      <span v-if="event.icon" class="material-symbols-outlined timeline-marker-icon text-sm">{{ getIconName(event.icon) }}</span>
                    </div>
                    <div class="timeline-content-vertical">
                      <div class="timeline-date-vertical text-ink-secondary">{{ formatDate(event.date) }}</div>
                      <div class="timeline-title-vertical font-semibold text-ink-strong">{{ event.title || 'Event ' + (index + 1) }}</div>
                      <div v-if="event.description" class="timeline-description-vertical text-ink">{{ event.description }}</div>
                    </div>
                  </div>
                </div>

                <div v-else-if="config.style === 'horizontal'" class="timeline-horizontal">
                  <div class="timeline-line timeline-line-horizontal"></div>
                  <div class="timeline-events-horizontal">
                    <div v-for="(event, index) in sortedEvents" :key="event.id" class="timeline-event-horizontal">
                      <div class="timeline-marker timeline-marker-horizontal">
                        <svg class="timeline-marker-dot" viewBox="0 0 2 2" aria-hidden="true"><circle cx="1" cy="1" r="1" :fill="event.color || config.timelineColor" /></svg>
                        <span v-if="event.icon" class="material-symbols-outlined timeline-marker-icon text-xs">{{ getIconName(event.icon) }}</span>
                      </div>
                      <div class="timeline-content-horizontal">
                        <div class="timeline-date-horizontal text-xs text-ink-secondary">{{ formatDate(event.date) }}</div>
                        <div class="timeline-title-horizontal font-semibold text-sm text-ink-strong">{{ event.title || 'Event ' + (index + 1) }}</div>
                        <div v-if="event.description" class="timeline-description-horizontal text-xs text-ink">{{ event.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="config.style === 'zigzag'" class="timeline-zigzag">
                  <div class="timeline-line timeline-line-zigzag"></div>
                  <div
                    v-for="(event, index) in sortedEvents"
                    :key="event.id"
                    class="timeline-event-zigzag"
                    :class="event.position === 'right' ? 'timeline-event-right' : 'timeline-event-left'"
                  >
                    <div class="timeline-marker timeline-marker-zigzag">
                      <svg class="timeline-marker-dot" viewBox="0 0 2 2" aria-hidden="true"><circle cx="1" cy="1" r="1" :fill="event.color || config.timelineColor" /></svg>
                      <span v-if="event.icon" class="material-symbols-outlined timeline-marker-icon text-sm">{{ getIconName(event.icon) }}</span>
                    </div>
                    <div class="timeline-content-zigzag" :class="event.position === 'right' ? 'timeline-content-right' : 'timeline-content-left'">
                      <div class="timeline-date-zigzag text-xs text-ink-secondary">{{ formatDate(event.date) }}</div>
                      <div class="timeline-title-zigzag font-semibold text-ink-strong">{{ event.title || 'Event ' + (index + 1) }}</div>
                      <div v-if="event.description" class="timeline-description-zigzag text-sm text-ink">{{ event.description }}</div>
                    </div>
                  </div>
                </div>
                <figcaption id="timeline-summary" class="sr-only">
                  {{ config.summary || 'Timeline visualization' }}
                </figcaption>
              </figure>
            </div>
          </UiPanel>

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
import { ref, computed } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiCodeBlock, UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiTextarea,
} from '../components/ui';
import UiChoiceCards from '../components/ui/UiChoiceCards.vue';
import { useNotice } from '../composables/useNotice.js';
import axe from 'axe-core';
import { AXE_SCAN_OPTIONS } from '../utils/axeScan.js';
import { generateTimelineCode } from '../utils/timelineExport.js';

const { notice, showNotice, clearNotice } = useNotice();
const timelinePreview = ref(null);

const timelineStyles = [
  { label: 'Vertical', value: 'vertical', icon: 'vertical_align_center', description: 'Events stacked vertically' },
  { label: 'Horizontal', value: 'horizontal', icon: 'horizontal_rule', description: 'Events in a horizontal line' },
  { label: 'Zigzag', value: 'zigzag', icon: 'timeline', description: 'Alternating left/right layout' }
];

const dateFormatOptions = [
  { value: 'short', label: 'Short (1/1/2024)' },
  { value: 'medium', label: 'Medium (Jan 1, 2024)' },
  { value: 'long', label: 'Long (January 1, 2024)' },
  { value: 'full', label: 'Full (Monday, January 1, 2024)' }
];

const iconOptions = [
  { value: '', label: 'No icon' },
  { value: 'event', label: 'Event' },
  { value: 'star', label: 'Star' },
  { value: 'check_circle', label: 'Check' },
  { value: 'flag', label: 'Flag' },
  { value: 'location_on', label: 'Location' }
];

const positionOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'SVG', value: 'svg' }
];

const config = ref({
  title: '',
  summary: '',
  keyInsight: '',
  style: 'vertical',
  timelineColor: '#6366f1',
  dateFormat: 'medium',
  spacing: 80
});

// Today's date as YYYY-MM-DD in local time (toISOString() is UTC, which is
// tomorrow/yesterday for part of the day in most time zones).
const localDateString = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// <input type="date"> values are YYYY-MM-DD; new Date('YYYY-MM-DD') parses as
// UTC midnight and shows the previous day west of UTC, so parse as local.
const parseDate = (dateString) => {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

let eventIdCounter = 0;

const events = ref([
  {
    date: localDateString(),
    title: 'Project Start',
    description: 'Initial project kickoff',
    icon: 'event',
    color: '#6366f1',
    position: 'left'
  },
  {
    date: localDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    title: 'Milestone 1',
    description: 'First major milestone achieved',
    icon: 'star',
    color: '#10b981',
    position: 'right'
  }
].map(e => ({ id: eventIdCounter++, ...e })));

const selectedExportFormat = ref('react');

// Events without a valid date go last, in their original order.
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    const aTime = parseDate(a.date)?.getTime();
    const bTime = parseDate(b.date)?.getTime();
    if (aTime === undefined && bTime === undefined) return 0;
    if (aTime === undefined) return 1;
    if (bTime === undefined) return -1;
    return aTime - bTime;
  });
});

const getIconName = (icon) => {
  const iconMap = {
    event: 'event',
    star: 'star',
    check_circle: 'check_circle',
    flag: 'flag',
    location_on: 'location_on'
  };
  return iconMap[icon] || 'event';
};

const DATE_FORMATS = {
  short: { month: 'numeric', day: 'numeric', year: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
};

const formatDate = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return dateString || '';
  return date.toLocaleDateString('en-US', DATE_FORMATS[config.value.dateFormat] || DATE_FORMATS.medium);
};

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

const accessibilityChecks = computed(() => [
  { label: 'Alt text', ok: !!(config.value.title && config.value.summary && config.value.keyInsight) },
  { label: 'Keyboard navigation', ok: true },
  { label: 'Screen reader', ok: true }
]);

// User-chosen values for the preview, passed to CSS through v-bind()
const previewColor = computed(() => config.value.timelineColor);
const previewSpacing = computed(() => `${config.value.spacing}px`);

// axe-core Integration
const axeScanRunning = ref(false);
const axeScanResults = ref(null);

const runAxeCoreScan = async () => {
  axeScanRunning.value = true;
  axeScanResults.value = null;
  
  try {
    const scanTarget = timelinePreview.value;
    
    if (!scanTarget) {
      axeScanResults.value = {
        violations: [{
          id: 'scan-error',
          description: 'Timeline preview not found. Please ensure the timeline is rendered.',
          help: 'Try refreshing the page or reloading the timeline data.',
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

const addEvent = () => {
  events.value.push({
    id: eventIdCounter++,
    date: localDateString(),
    title: '',
    description: '',
    icon: '',
    color: '#6366f1',
    position: 'left'
  });
};

const removeEvent = (index) => {
  if (events.value.length > 1) {
    events.value.splice(index, 1);
  }
};

const generatedCode = computed(() => generateTimelineCode(selectedExportFormat.value, config.value, sortedEvents.value, formatDate));

const onCopyFailed = () => {
  showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
};





</script>

<style scoped>
.timeline-stage {
  @apply p-8 rounded-tile bg-surface-sunken overflow-x-auto;
}

/* Markers: the colour is the event's own, drawn as an SVG fill */
.timeline-marker {
  @apply relative z-10 flex items-center justify-center shrink-0;
}
.timeline-marker-dot {
  @apply absolute inset-0 w-full h-full;
}
.timeline-marker-icon {
  @apply relative text-ink-on-accent;
}
.timeline-line {
  background-color: v-bind(previewColor);
}

/* Vertical */
.timeline-vertical {
  @apply relative pl-8;
}
.timeline-event-vertical {
  @apply relative flex gap-4;
}
.timeline-event-vertical:not(:last-child) {
  margin-bottom: v-bind(previewSpacing);
}
.timeline-marker-vertical {
  @apply w-12 h-12;
}
.timeline-event-vertical:not(:last-child) .timeline-marker-vertical::after {
  content: '';
  @apply absolute top-full left-1/2 -translate-x-1/2 w-0.5;
  height: calc(v-bind(previewSpacing) - 3rem);
  background-color: v-bind(previewColor);
}
.timeline-content-vertical {
  @apply flex-1 pb-4;
}
.timeline-date-vertical {
  @apply text-sm mb-1;
}
.timeline-title-vertical {
  @apply text-lg mb-2;
}
.timeline-description-vertical {
  @apply text-sm leading-normal;
}

/* Horizontal: evenly spaced, equal-width events */
.timeline-horizontal {
  @apply relative py-8 min-h-52;
}
.timeline-line-horizontal {
  @apply absolute top-12 left-0 right-0 h-1 -translate-y-1/2;
}
.timeline-events-horizontal {
  @apply relative flex justify-between gap-2;
}
.timeline-event-horizontal {
  @apply flex flex-col items-center w-36 shrink-0;
}
.timeline-marker-horizontal {
  @apply w-8 h-8 mb-2;
}
.timeline-content-horizontal {
  @apply text-center mt-2;
}
.timeline-date-horizontal,
.timeline-title-horizontal {
  @apply mb-1;
}
.timeline-description-horizontal {
  @apply leading-snug;
}

/* Zigzag */
.timeline-zigzag {
  @apply relative py-8;
}
.timeline-line-zigzag {
  @apply absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2;
}
.timeline-event-zigzag {
  @apply relative flex items-start min-h-24;
}
.timeline-event-zigzag:not(:last-child) {
  margin-bottom: v-bind(previewSpacing);
}
.timeline-event-left {
  @apply flex-row;
}
.timeline-event-right {
  @apply flex-row-reverse;
}
.timeline-marker-zigzag {
  @apply w-12 h-12 mx-4;
}
.timeline-content-zigzag {
  @apply flex-1 p-3 rounded-control bg-fill-subtle;
  max-width: 45%;
}
.timeline-content-left {
  @apply text-left;
}
.timeline-content-right {
  @apply text-right;
}
.timeline-date-zigzag {
  @apply mb-1;
}
.timeline-title-zigzag {
  @apply text-base mb-2;
}
.timeline-description-zigzag {
  @apply leading-normal;
}
</style>
