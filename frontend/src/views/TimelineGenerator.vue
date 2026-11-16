<template>
  <PageShell width="full">
    <PageHero
      :back="{ to: '/data-viz', label: 'Data visualization' }"
      title="Timeline generator"
      lead="Build a timeline from your events, pick a layout, check it reads well for everyone, and export it as a React or Vue component or an SVG."
      spot="tools/timeline-generator"
      size="tool"
    />

    <PageSection title="Layout" description="Every layout becomes a single column when there isn't room, so it works on phones.">
      <UiChoiceCards v-model="config.style" :options="TIMELINE_STYLES" :columns="3" aria-label="Timeline layout" />
    </PageSection>

    <PageSection title="Build" description="Describe the timeline, add your events, check it and export the code." divided>
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="flex flex-col gap-6">
          <UiPanel title="About this timeline" heading-tag="h3">
            <div class="flex flex-col gap-4">
              <UiInput
                v-model="config.title"
                label="Title"
                placeholder="What the timeline is about"
                required
                :error="touched.title && !config.title.trim() ? 'Add a title: it names the timeline for screen readers.' : ''"
                @blur="touched.title = true"
              />
              <UiTextarea
                v-model="config.summary"
                label="Summary"
                hint="One or two sentences"
                :rows="2"
                placeholder="What the timeline shows"
                required
                :error="touched.summary && !config.summary.trim() ? 'Add a summary: it is read out after the title.' : ''"
                @blur="touched.summary = true"
              />
              <UiTextarea v-model="config.keyInsight" label="Key insight" hint="Optional: the one thing to take away" :rows="2" />
              <UiSwitch v-model="config.showHeader" label="Show the title and summary" hint="When off, screen readers still read them." />
            </div>
          </UiPanel>

          <UiPanel title="Appearance" heading-tag="h3">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-aside-content items-end gap-2">
                <div class="w-16">
                  <UiInput v-model="config.timelineColor" type="color" label="Accent" />
                </div>
                <UiInput v-model="config.timelineColor" mono aria-label="Accent colour value" />
              </div>
              <UiSegmented v-model="config.theme" :options="themeOptions" label="Theme" hint="Auto follows the reader's light or dark setting." />
              <UiSwitch v-model="config.cards" label="Show events as cards" />
              <UiSelect v-model="config.dateFormat" label="Date format" :options="dateFormatOptions" />
              <UiRange v-model="config.spacing" label="Space between events" :min="0" :max="120" :step="4" unit="px" />
            </div>
          </UiPanel>

          <UiPanel :title="`Events (${events.length})`" heading-tag="h3">
            <template #actions>
              <UiButton variant="ghost" size="sm" :icon="allCollapsed ? 'chevrons-up-down' : 'chevron-up'" @click="setAllCollapsed(!allCollapsed)">
                {{ allCollapsed ? 'Expand all' : 'Collapse all' }}
              </UiButton>
            </template>

            <div class="flex flex-col gap-4">
              <UiSwitch v-model="config.sortByDate" label="Sort events by date" hint="Turn off to put them in your own order." />

              <ol class="flex flex-col gap-3" aria-label="Events">
                <li v-for="(event, index) in orderedEvents" :key="event.id" class="event-card">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="event-toggle"
                      :aria-expanded="String(!event.collapsed)"
                      :aria-controls="`event-fields-${event.id}`"
                      @click="event.collapsed = !event.collapsed"
                    >
                      <AppIcon :name="event.collapsed ? 'chevron-down' : 'chevron-up'" class="text-base text-ink-muted shrink-0" />
                      <span class="min-w-0 truncate">
                        <span class="font-medium text-ink-strong">{{ event.title || `Event ${index + 1}` }}</span>
                        <span v-if="formatDate(event.date, config.dateFormat)" class="text-ink-muted"> · {{ formatDate(event.date, config.dateFormat) }}</span>
                      </span>
                    </button>
                    <template v-if="!config.sortByDate">
                      <UiButton icon-only icon="arrow-up" variant="ghost" size="sm" :label="`Move ${eventName(event, index)} up`" :disabled="index === 0" @click="move(event, -1)" />
                      <UiButton icon-only icon="arrow-down" variant="ghost" size="sm" :label="`Move ${eventName(event, index)} down`" :disabled="index === events.length - 1" @click="move(event, 1)" />
                    </template>
                    <UiButton icon-only icon="copy" variant="ghost" size="sm" :label="`Duplicate ${eventName(event, index)}`" @click="duplicate(event)" />
                    <UiButton icon-only icon="trash-2" variant="ghost" size="sm" :label="`Remove ${eventName(event, index)}`" :disabled="events.length <= 1" @click="remove(event)" />
                  </div>

                  <fieldset v-show="!event.collapsed" :id="`event-fields-${event.id}`" class="flex flex-col gap-3 mt-3">
                    <legend class="sr-only">{{ eventName(event, index) }}</legend>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <UiInput v-model="event.date" type="date" label="Date" />
                      <UiSelect v-model="event.icon" label="Icon" :options="iconOptions" />
                    </div>
                    <UiInput v-model="event.title" label="Title" placeholder="What happened" />
                    <UiTextarea v-model="event.description" label="Description" :rows="2" placeholder="Optional detail" />
                    <div class="flex flex-wrap items-end gap-3">
                      <div class="w-16">
                        <UiInput :model-value="event.color || config.timelineColor" type="color" label="Marker" @update:model-value="event.color = $event" />
                      </div>
                      <UiButton v-if="event.color" variant="ghost" size="sm" icon="rotate-ccw" @click="event.color = ''">Use the accent</UiButton>
                    </div>
                    <UiSegmented
                      v-if="config.style === 'alternating'"
                      v-model="event.side"
                      :options="sideOptions"
                      label="Side of the line"
                    />
                  </fieldset>
                </li>
              </ol>

              <div class="flex flex-wrap gap-2">
                <UiButton variant="primary" size="sm" icon="plus" @click="addEvent">Add event</UiButton>
                <UiButton variant="ghost" size="sm" icon="rotate-ccw" @click="startOver">Start over</UiButton>
              </div>
              <UiCallout v-if="undoState" tone="info" role="status" title="Started over with the example timeline">
                <template #actions>
                  <UiButton size="sm" icon="undo-2" @click="undoStartOver">Undo</UiButton>
                </template>
              </UiCallout>
            </div>
          </UiPanel>
        </div>

        <div class="xl:col-span-2 flex flex-col gap-6">
          <UiPanel title="Preview" heading-tag="h3">
            <template #actions>
              <UiSegmented v-model="previewWidth" :options="widthOptions" aria-label="Preview width" />
            </template>
            <div class="timeline-stage">
              <div class="timeline-frame" :class="`timeline-frame--${previewWidth}`">
                <TimelineRender ref="preview" :config="config" :events="events" heading-id="timeline-preview-heading" />
              </div>
            </div>
          </UiPanel>

          <UiPanel title="Accessibility" heading-tag="h3">
            <template #actions>
              <UiChip :tone="failures.length ? 'danger' : 'success'">{{ passed }} of {{ checked }} checks pass</UiChip>
            </template>

            <ul class="flex flex-col gap-3 text-sm">
              <li v-for="check in accessibilityChecks" :key="check.label" class="flex items-start gap-2">
                <AppIcon :name="checkIcon[check.state]" class="text-base shrink-0 mt-0.5" :class="checkTone[check.state]" />
                <div class="min-w-0">
                  <span class="text-ink-strong">{{ check.label }}</span>
                  <span class="sr-only">: {{ checkText[check.state] }}</span>
                  <p v-if="check.detail" class="text-ink-secondary">{{ check.detail }}</p>
                </div>
              </li>
            </ul>

            <UiButton variant="secondary" icon="scan-eye" class="mt-4" :loading="axeScanRunning" @click="runAxeCoreScan">
              {{ axeScanRunning ? 'Checking…' : 'Run the automated check (axe)' }}
            </UiButton>

            <div v-if="axeScanResults" class="mt-4 flex flex-col gap-2" role="status">
              <UiCallout v-if="axeScanResults.error" tone="warning" title="The check couldn't run">{{ axeScanResults.error }}</UiCallout>
              <UiCallout
                v-for="violation in axeScanResults.violations"
                :key="violation.id"
                tone="danger"
                :title="`${violation.help} (${violation.impact || 'moderate'})`"
              >
                {{ violation.description }}
              </UiCallout>
              <UiCallout v-if="!axeScanResults.error && !axeScanResults.violations.length" tone="success">
                No problems found in the preview.
              </UiCallout>
            </div>
          </UiPanel>

          <UiPanel title="Export" heading-tag="h3">
            <template #actions>
              <UiButton variant="secondary" size="sm" icon="download" @click="download">Download {{ fileName }}</UiButton>
            </template>
            <div class="flex flex-col gap-4">
              <UiSegmented v-model="selectedExportFormat" :options="exportFormats" label="Format" :hint="formatHint" />
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
import { computed, reactive, ref, watch } from 'vue';
import axe from 'axe-core';
import InlineNotice from '../components/InlineNotice.vue';
import TimelineRender from '../components/timeline/TimelineRender.vue';
import {
  AppIcon, PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiChoiceCards, UiCodeBlock, UiInput, UiPanel, UiRange, UiSegmented, UiSelect, UiSwitch, UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { AXE_SCAN_OPTIONS, axeCategoryState } from '../utils/axeScan.js';
import { generateTimelineCode } from '../utils/timelineExport.js';
import {
  DEFAULT_ACCENT, THEME_BACKGROUNDS, TIMELINE_ICONS, TIMELINE_STYLES, contrastRatio, exampleEvents, formatDate, localDateString, parseDate, readableOn,
  restoreTimeline, safeColor,
} from '../utils/timelineTheme.js';

const STORAGE_KEY = 'cautious-lamp:timeline-generator';
const { notice, showNotice, clearNotice } = useNotice();

const dateFormatOptions = [
  { value: 'year', label: 'Year (2026)' },
  { value: 'month', label: 'Month (January 2026)' },
  { value: 'short', label: 'Short (1/15/2026)' },
  { value: 'medium', label: 'Medium (Jan 15, 2026)' },
  { value: 'long', label: 'Long (January 15, 2026)' },
  { value: 'full', label: 'Full (Thursday, January 15, 2026)' },
];
const iconOptions = [{ value: '', label: 'No icon' }, ...Object.entries(TIMELINE_ICONS).map(([value, { label }]) => ({ value, label }))];
const sideOptions = [
  { value: 'auto', label: 'Alternate' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];
const themeOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
const widthOptions = [
  { value: 'full', label: 'Wide' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'phone', label: 'Phone' },
];
const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'SVG', value: 'svg' },
];

// ---------- State, kept in this browser ----------

let nextId = 0;
const withIds = (list) => list.map((event) => ({ collapsed: false, side: 'auto', ...event, id: nextId++ }));

const readSaved = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};
const restored = restoreTimeline(readSaved());
const config = ref(restored.config);
const events = ref(withIds(restored.events));
const touched = reactive({ title: false, summary: false });

watch(
  [config, events],
  () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ config: config.value, events: events.value.map(({ id, ...event }) => event) }));
    } catch {
      // Storage full or blocked: the timeline still works, it just isn't kept
    }
  },
  { deep: true },
);

// ---------- Events ----------

const byDate = (a, b) => (parseDate(a.date)?.getTime() ?? Infinity) - (parseDate(b.date)?.getTime() ?? Infinity);
/** The events in the order the timeline shows them; editing them edits the timeline */
const orderedEvents = computed(() => (config.value.sortByDate ? [...events.value].sort((a, b) => byDate(a, b) || events.value.indexOf(a) - events.value.indexOf(b)) : events.value));
const eventName = (event, index) => (event.title ? `“${event.title}”` : `event ${index + 1}`);

const addEvent = () => {
  const last = orderedEvents.value.at(-1);
  const after = parseDate(last?.date);
  const date = after ? localDateString(new Date(after.getFullYear(), after.getMonth(), after.getDate() + 7)) : localDateString();
  events.value.push({ id: nextId++, date, title: '', description: '', icon: '', color: '', side: 'auto', collapsed: false });
};

const remove = (event) => {
  if (events.value.length > 1) events.value.splice(events.value.indexOf(event), 1);
};

const duplicate = (event) => {
  const index = events.value.indexOf(event);
  events.value.splice(index + 1, 0, { ...event, id: nextId++, title: event.title ? `${event.title} (copy)` : '', collapsed: false });
};

const move = (event, step) => {
  const index = events.value.indexOf(event);
  const target = index + step;
  if (target < 0 || target >= events.value.length) return;
  events.value.splice(index, 1);
  events.value.splice(target, 0, event);
};

const allCollapsed = computed(() => events.value.every((event) => event.collapsed));
const setAllCollapsed = (collapsed) => events.value.forEach((event) => {
  event.collapsed = collapsed;
});

const undoState = ref(null);
const startOver = () => {
  // A plain copy: structuredClone can't copy Vue's reactive proxies
  undoState.value = JSON.parse(JSON.stringify({ config: config.value, events: events.value }));
  config.value = restoreTimeline(null).config;
  events.value = withIds(exampleEvents());
  Object.assign(touched, { title: false, summary: false });
};
const undoStartOver = () => {
  config.value = undoState.value.config;
  events.value = undoState.value.events;
  undoState.value = null;
};

// ---------- Preview ----------

const previewWidth = ref('full');
const preview = ref(null);

// ---------- Accessibility ----------

const checkTone = { ok: 'text-success', fail: 'text-danger', unchecked: 'text-ink-muted' };
const checkIcon = { ok: 'circle-check', fail: 'circle-alert', unchecked: 'circle-help' };
const checkText = { ok: 'passes', fail: 'needs work', unchecked: 'not checked yet: run the automated check' };

/** The backgrounds the timeline can be read on: both when it follows the reader's setting */
const backgrounds = computed(() => (config.value.theme === 'auto' ? ['light', 'dark'] : [config.value.theme]));
const accent = computed(() => safeColor(config.value.timelineColor, DEFAULT_ACCENT));
const lowContrast = (color) => backgrounds.value.filter((theme) => contrastRatio(color, THEME_BACKGROUNDS[theme]) < 3);
const names = (list) => list.map((event) => event.title || 'an untitled event').join(', ');

const axeScanRunning = ref(false);
const axeScanResults = ref(null);

const accessibilityChecks = computed(() => {
  const list = events.value;
  const untitled = list.filter((event) => !event.title.trim() || !parseDate(event.date));
  const faintMarkers = list.filter((event) => lowContrast(safeColor(event.color, accent.value)).length);
  const faintIcons = list.filter((event) => {
    const color = safeColor(event.color, accent.value);
    return event.icon && config.value.style !== 'compact' && contrastRatio(color, readableOn(color)) < 3;
  });
  const faintLine = lowContrast(accent.value);
  const hasIntro = config.value.title.trim() && config.value.summary.trim();
  return [
    {
      label: 'Title and summary',
      state: hasIntro ? 'ok' : 'fail',
      detail: hasIntro ? '' : 'Screen readers announce the timeline by its title, then read the summary.',
    },
    {
      label: 'Every event has a title and a date',
      state: untitled.length ? 'fail' : 'ok',
      detail: untitled.length ? `Missing on ${names(untitled)}.` : '',
    },
    {
      label: 'Markers stand out from the background (3:1)',
      state: faintMarkers.length ? 'fail' : 'ok',
      detail: faintMarkers.length ? `Too faint on the ${backgrounds.value.join(' or ')} background: ${names(faintMarkers)}.` : '',
    },
    {
      label: 'Icons can be seen on their markers (3:1)',
      state: faintIcons.length ? 'fail' : 'ok',
      detail: faintIcons.length ? `Pick a darker or lighter marker for ${names(faintIcons)}.` : '',
    },
    {
      label: 'The line stands out from the background (3:1)',
      state: faintLine.length ? 'fail' : 'ok',
      detail: faintLine.length ? `The accent is too faint on the ${faintLine.join(' and ')} background.` : '',
    },
    { label: 'Keyboard navigation', state: axeCategoryState(axeScanResults.value, 'keyboard') },
    { label: 'Screen reader', state: axeCategoryState(axeScanResults.value, 'screenReader') },
  ];
});
const checked = computed(() => accessibilityChecks.value.filter((check) => check.state !== 'unchecked').length);
const failures = computed(() => accessibilityChecks.value.filter((check) => check.state === 'fail'));
const passed = computed(() => checked.value - failures.value.length);

const runAxeCoreScan = async () => {
  axeScanRunning.value = true;
  axeScanResults.value = null;
  try {
    const target = preview.value?.$el;
    if (!target) throw new Error('The preview is not on the page yet.');
    axeScanResults.value = await axe.run(target, AXE_SCAN_OPTIONS);
  } catch (error) {
    axeScanResults.value = { violations: [], passes: [], incomplete: [], inapplicable: [], error: error.message };
  } finally {
    axeScanRunning.value = false;
  }
};

// ---------- Export ----------

const selectedExportFormat = ref('react');
const generatedCode = computed(() => generateTimelineCode(selectedExportFormat.value, config.value, events.value));
const fileName = computed(() => ({ react: 'Timeline.tsx', vue: 'Timeline.vue', svg: 'timeline.svg' })[selectedExportFormat.value]);
const formatHint = computed(() => ({
  react: 'A typed component with its own stylesheet; needs only React.',
  vue: 'A single-file component with its own stylesheet; needs only Vue.',
  svg: 'A static picture of the timeline, with its events in the description for screen readers.',
})[selectedExportFormat.value]);

const download = () => {
  const type = selectedExportFormat.value === 'svg' ? 'image/svg+xml' : 'text/plain';
  const url = URL.createObjectURL(new Blob([generatedCode.value], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.value;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const onCopyFailed = () => {
  showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
};
</script>

<style scoped>
.event-card {
  @apply p-3 rounded-tile border border-line bg-surface-sunken;
}
.event-toggle {
  @apply flex flex-1 min-w-0 items-center gap-2 py-1 pr-2 rounded-control text-left text-sm;
}
.event-toggle:focus-visible {
  @apply outline-none ring-2 ring-accent;
}

.timeline-stage {
  @apply p-2 sm:p-6 rounded-tile bg-surface-sunken overflow-x-auto;
}
.timeline-frame {
  @apply mx-auto w-full;
}
.timeline-frame--tablet {
  @apply max-w-2xl;
}
.timeline-frame--phone {
  @apply max-w-sm;
}
</style>
