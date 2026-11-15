<template>
  <PageShell v-if="!pattern">
    <PageHero :back="{ to: '/patterns', label: 'Patterns' }" title="Code pattern not found" size="tool" />
    <PageSection>
      <UiEmptyState spot="site/not-found" title="There's no code pattern at this address" body="The patterns page lists every code pattern there is.">
        <template #actions>
          <UiButton variant="primary" to="/patterns">Browse patterns</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>
  </PageShell>

  <PageShell v-else>
    <PageHero :back="{ to: '/patterns', label: 'Patterns' }" :title="pattern.title" :lead="pattern.description" spot="foundations/pattern-code-snippet" size="tool">
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <UiChip :tone="COMPLEXITY_TONES[pattern.complexity]">{{ pattern.complexity }}</UiChip>
          <UiChip icon="shapes">{{ pattern.category }}</UiChip>
          <UiChip v-if="libraryPattern" :tone="statusTone(libraryPattern.status)">{{ statusLabel(libraryPattern.status) }}</UiChip>
        </div>
      </template>
    </PageHero>

    <PageSection v-if="frameworkTabs.length" title="Code" :description="pattern.usage">
      <UiTabs v-model="framework" :tabs="frameworkTabs" label="Framework">
        <UiCodeBlock :code="pattern.code[framework]" :label="`${pattern.title}, ${frameworkLabel(framework)}`" />
      </UiTabs>
    </PageSection>

    <PageSection v-if="pattern.props.length" title="Properties" description="What the component takes and emits." divided>
      <UiPanel flush>
        <UiTable :caption="`${pattern.title} properties`">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Description</th>
              <th scope="col">Default</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in pattern.props" :key="prop.name">
              <th scope="row" class="whitespace-nowrap">
                <UiCode>{{ prop.name }}</UiCode>
                <span v-if="prop.required" class="block mt-1 text-xs font-normal text-ink-secondary">Required</span>
              </th>
              <td class="whitespace-nowrap text-ink-secondary">{{ prop.type }}</td>
              <td>{{ prop.description }}</td>
              <td class="whitespace-nowrap">
                <UiCode v-if="prop.default">{{ prop.default }}</UiCode>
                <span v-else class="text-ink-muted">None</span>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <PageSection v-if="pattern.usageExamples.length" title="Usage examples" description="The pattern in use on a real page." divided>
      <div class="flex flex-col gap-6">
        <UiPanel v-for="example in pattern.usageExamples" :key="example.title" :title="example.title" :description="example.description" heading-tag="h3">
          <UiCodeBlock :code="example.code" :label="example.title" />
        </UiPanel>
      </div>
    </PageSection>

    <PageSection v-if="libraryPattern" title="In the patterns library" :description="libraryPattern.whenToUse || libraryPattern.description" divided>
      <template #actions>
        <UiButton icon="list-checks" to="/patterns/status">Pattern status</UiButton>
      </template>
      <p class="mb-6 text-sm text-ink-secondary">
        {{ statusLabel(libraryPattern.status) }}<template v-if="libraryPattern.updatedAt">, last changed {{ formatDate(libraryPattern.updatedAt) }}</template>.
        <template v-if="libraryPattern.codeExample?.description">{{ libraryPattern.codeExample.description }}.</template>
      </p>
      <div v-if="libraryPattern.codeExample?.good || libraryPattern.codeExample?.bad" class="grid lg:grid-cols-2 gap-6">
        <div v-if="libraryPattern.codeExample.good">
          <p class="library-label text-success"><AppIcon name="circle-check" /> Do</p>
          <UiCodeBlock :code="libraryPattern.codeExample.good" :label="`${libraryPattern.name}: do`" />
        </div>
        <div v-if="libraryPattern.codeExample.bad">
          <p class="library-label text-danger"><AppIcon name="circle-x" /> Don't</p>
          <UiCodeBlock :code="libraryPattern.codeExample.bad" :label="`${libraryPattern.name}: don't`" />
        </div>
      </div>
    </PageSection>

    <PageSection v-else-if="patternsError" title="In the patterns library" divided>
      <UiCallout tone="warning" title="The patterns library couldn't be loaded">
        {{ apiErrorMessage(patternsError) }}
        <template #actions>
          <UiButton size="sm" icon="refresh-cw" @click="loadPatterns">Try again</UiButton>
        </template>
      </UiCallout>
    </PageSection>

    <PageSection v-if="pattern.accessibility.length" title="Accessibility" divided>
      <ul class="practice-list max-w-3xl">
        <li v-for="note in pattern.accessibility" :key="note">
          <AppIcon name="accessibility" class="practice-icon" />
          <span>
            <template v-for="(part, i) in codeParts(note)" :key="i"><UiCode v-if="i % 2">{{ part }}</UiCode><template v-else>{{ part }}</template></template>
          </span>
        </li>
      </ul>
    </PageSection>

    <PageSection v-if="pattern.related.length" title="Related patterns" description="Guidance and code that work alongside this pattern." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="item in pattern.related" :key="item.to" :to="item.to" :title="item.title" compact>{{ item.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCard, UiChip, UiCode, UiCodeBlock, UiEmptyState, UiPanel, UiTable, UiTabs } from '../components/ui';
import { statusLabel, statusTone, toComponentId, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { COMPLEXITY_TONES, FRAMEWORKS, snippetForSlug } from '../data/patternSnippets.js';
import { apiErrorMessage } from '../services/api.js';

/**
 * A code pattern (/patterns/<slug>): its Vue, React and HTML code, properties,
 * a usage example and accessibility notes from src/data/patternSnippets.js,
 * plus its status and do/don't code from the patterns library
 * (GET /patterns-library/patterns) when the library has it.
 */
const route = useRoute();

const pattern = computed(() => snippetForSlug(route.path.split('/').pop()));

// Only the frameworks the pattern has code for get a tab; no code, no section
const frameworkTabs = computed(() => FRAMEWORKS.filter((f) => pattern.value?.code?.[f.value]));
const framework = ref('vue');
watch(
  frameworkTabs,
  (tabs) => {
    if (tabs.length && !tabs.some((t) => t.value === framework.value)) framework.value = tabs[0].value;
  },
  { immediate: true },
);
const frameworkLabel = (value) => FRAMEWORKS.find((f) => f.value === value)?.label ?? value;

const { patterns, patternsError, loadPatterns } = useComponentPatternStatus();
const libraryPattern = computed(() => (pattern.value ? patterns.value.find((p) => toComponentId(p.name) === pattern.value.slug) ?? null : null));

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/** Notes mark code with backticks: odd parts are code */
const codeParts = (note) => note.split('`');

loadPatterns();
</script>

<style scoped>
.library-label {
  @apply flex items-center gap-2 mb-2 text-sm font-semibold;
}
.practice-list {
  @apply flex flex-col gap-3 text-ink;
}
.practice-list li {
  @apply flex items-start gap-3;
}
.practice-icon {
  @apply mt-0.5 shrink-0 text-lg text-accent-text;
}
</style>
