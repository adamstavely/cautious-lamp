<template>
  <div class="flex flex-col gap-3" aria-live="polite">
    <UiCallout v-if="report.missing?.length" tone="danger" title="Nothing imported" role="alert">
      No column for {{ report.missing.join(', ') }}. Use a header row, e.g. <code class="font-code">{{ report.expected }}</code>.
    </UiCallout>

    <UiCallout v-else-if="!hasProblems && report.total > 0" tone="success" role="status">
      {{ report.imported ? `Imported ${count(report.imported, 'row')}. ` : '' }}All {{ count(report.total, 'row') }} on the map.
    </UiCallout>

    <UiCallout v-else-if="hasProblems" tone="warning" :title="title" role="status">
      <div class="flex flex-col gap-3">
        <section v-if="report.unmatched?.length">
          <h3 class="font-medium text-ink">Not found on {{ report.areaName }}</h3>
          <ul class="mt-1 flex flex-col gap-2">
            <li v-for="item in head(report.unmatched)" :key="item.name" class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span><strong class="text-ink">{{ item.name }}</strong><span v-if="item.rowIndexes.length > 1"> ({{ item.rowIndexes.length }} rows)</span><template v-if="item.ambiguous">: more than one region has this name</template><template v-else-if="item.suggestions.length">: did you mean</template></span>
              <UiButton
                v-for="suggestion in item.suggestions"
                :key="suggestion"
                size="sm"
                variant="secondary"
                :title="`Use ${suggestion} for ${item.name}`"
                @click="$emit('use-suggestion', item, suggestion)"
              >
                {{ suggestion }}
              </UiButton>
            </li>
          </ul>
          <p v-if="report.unmatched.length > LIMIT" class="mt-1">and {{ report.unmatched.length - LIMIT }} more.</p>
        </section>

        <section v-if="report.skipped?.length">
          <h3 class="font-medium text-ink">Skipped when importing</h3>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="row in head(report.skipped)" :key="row.line">Line {{ row.line }}: {{ row.reason }}</li>
          </ul>
          <p v-if="report.skipped.length > LIMIT" class="mt-1">and {{ report.skipped.length - LIMIT }} more.</p>
        </section>

        <section v-if="report.invalid">
          <h3 class="font-medium text-ink">No number</h3>
          <p>{{ count(report.invalid, 'row') }} {{ report.invalid === 1 ? 'has' : 'have' }} no usable value.</p>
        </section>

        <section v-if="report.noValue?.length">
          <h3 class="font-medium text-ink">No size</h3>
          <p>Proportional symbols need a value above zero: {{ names(report.noValue.map((r) => r.name)) }}.</p>
        </section>

        <section v-if="report.unknown?.length">
          <h3 class="font-medium text-ink">Places missing from the places table</h3>
          <p>{{ names(report.unknown.map((u) => u.id)) }}. Add them with coordinates, or fix the ids in the flows.</p>
        </section>

        <section v-if="report.outside?.length">
          <h3 class="font-medium text-ink">Outside this map</h3>
          <p>{{ names(report.outside) }}.</p>
        </section>

        <section v-if="report.duplicates?.length">
          <h3 class="font-medium text-ink">Listed more than once</h3>
          <p>{{ names(report.duplicates.map((d) => d.label)) }}: the last row for each is used.</p>
        </section>
      </div>
    </UiCallout>

    <p v-if="report.remote?.length" class="text-sm text-ink-muted">
      Not in view (far from the mainland): {{ names(report.remote) }}. Turn on "Fit remote regions" to include them.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { UiButton, UiCallout } from '../ui';

/**
 * What happened to the data on its way to the map: rows skipped on import,
 * names that match no region (with suggestions to apply in one click),
 * places outside the map, and so on. Everything the map leaves out is listed
 * here; nothing is dropped silently.
 */
const props = defineProps({
  /**
   * { total, imported?, missing?, expected?, areaName, skipped?, unmatched?, invalid?,
   *   noValue?, unknown?, outside?, duplicates?, remote? }
   */
  report: { type: Object, required: true },
});

defineEmits(['use-suggestion']);

const LIMIT = 12;
const head = (list) => list.slice(0, LIMIT);
const count = (n, noun) => `${n.toLocaleString()} ${noun}${n === 1 ? '' : 's'}`;
const names = (list) => (list.length > LIMIT ? `${list.slice(0, LIMIT).join(', ')} and ${list.length - LIMIT} more` : list.join(', '));

const problemCount = computed(() => {
  const r = props.report;
  return (r.unmatched?.reduce((n, u) => n + u.rowIndexes.length, 0) || 0) + (r.skipped?.length || 0) + (r.invalid || 0)
    + (r.noValue?.length || 0) + (r.unknown?.reduce((n, u) => n + u.rowIndexes.length, 0) || 0) + (r.outside?.length || 0);
});
const hasProblems = computed(() => problemCount.value > 0 || props.report.duplicates?.length > 0);
const title = computed(() => {
  const n = problemCount.value;
  if (!n) return 'Some rows repeat';
  return `${count(n, 'row')} not on the map`;
});
</script>
