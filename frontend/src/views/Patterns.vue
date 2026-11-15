<template>
  <!-- An experience pattern: its guidance document under its own hero -->
  <GuidanceDocPage
    v-if="experiencePattern"
    :key="experiencePattern.slug"
    eyebrow="Patterns"
    :title="experiencePattern.title"
    :lead="experiencePattern.lead"
    :spot="experiencePattern.spot"
    :doc-path="`/patterns/${experiencePattern.slug}`"
  />

  <PageShell v-else-if="slug">
    <PageHero :back="{ to: '/patterns', label: 'Patterns' }" title="Pattern not found" size="tool" />
    <PageSection>
      <UiEmptyState spot="site/not-found" title="There's no pattern at this address" :body="`Nothing is published at ${route.path}. It may have moved; the patterns page lists everything there is.`">
        <template #actions>
          <UiButton variant="primary" to="/patterns">Browse patterns</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>
  </PageShell>

  <PageShell v-else>
    <PageHero
      eyebrow="Guidelines"
      title="Patterns"
      lead="Proven solutions to common interface problems: written guidance, decision aids and code you can copy."
      spot="patterns/pattern-overview"
    >
      <template #actions>
        <UiButton variant="primary" icon="layout-template" to="/patterns/status">Pattern status</UiButton>
      </template>
    </PageHero>

    <PageSection title="Core patterns" description="The building blocks of every page.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="guide in PATTERN_GUIDES" :key="guide.slug" :to="guide.to" :title="guide.title" :spot="guide.spot" compact>{{ guide.lead }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Code patterns" description="Accessible components with Vue, React and HTML versions to copy." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="snippet in patternSnippets" :key="snippet.slug" :to="`/patterns/${snippet.slug}`" :title="snippet.title" compact>
          <template #media>
            <AppIcon :name="snippet.icon" class="mb-2 text-2xl text-accent-text" />
          </template>
          {{ snippet.description }}
          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UiChip :tone="COMPLEXITY_TONES[snippet.complexity]">{{ snippet.complexity }}</UiChip>
              <UiChip v-if="libraryStatus(snippet.slug)" :tone="statusTone(libraryStatus(snippet.slug))">{{ statusLabel(libraryStatus(snippet.slug)) }}</UiChip>
            </div>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Experience patterns" description="Guidance for empty states, errors, new features and AI interactions." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UiCard v-for="pattern in EXPERIENCE_PATTERNS" :key="pattern.slug" :to="pattern.to" :title="pattern.title" :spot="pattern.spot" compact>{{ pattern.lead }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Patterns library" description="Patterns the team maintains, with their status. The AI assistant draws on these too." divided>
      <template #actions>
        <UiButton icon="list-checks" to="/patterns/status">Status of every pattern</UiButton>
      </template>

      <UiSpinner v-if="loadingPatterns && !patterns.length" label="Loading the patterns library…" />

      <UiCallout v-else-if="patternsError" tone="danger" title="The patterns library couldn't be loaded" role="alert">
        {{ apiErrorMessage(patternsError) }}
        <template #actions>
          <UiButton size="sm" icon="refresh-cw" @click="loadPatterns">Try again</UiButton>
        </template>
      </UiCallout>

      <div v-else-if="patterns.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="pattern in patterns" :key="pattern.id" :to="patternPage(pattern.name)" :title="pattern.name" compact>
          {{ pattern.description }}
          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UiChip :tone="pattern.category === 'anti-pattern' ? 'warning' : 'neutral'">{{ categoryLabel(pattern.category) }}</UiChip>
              <UiChip :tone="statusTone(pattern.status)">{{ statusLabel(pattern.status) }}</UiChip>
            </div>
          </template>
        </UiCard>
      </div>

      <UiEmptyState v-else title="The patterns library is empty" body="Patterns added to the library appear here with their status." />
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GuidanceDocPage from '../components/GuidanceDocPage.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCard, UiChip, UiEmptyState, UiSpinner } from '../components/ui';
import { categoryLabel, patternPage, statusLabel, statusTone, toComponentId, useComponentPatternStatus } from '../composables/useComponentPatternStatus.js';
import { EXPERIENCE_PATTERNS, PATTERN_GUIDES, experiencePatternForSlug, guideForSlug } from '../data/patternGuides.js';
import { COMPLEXITY_TONES, patternSnippets, snippetForSlug } from '../data/patternSnippets.js';
import { apiErrorMessage } from '../services/api.js';

/**
 * /patterns: every pattern page, the code patterns and the patterns library
 * (GET /patterns-library/patterns) with each pattern's status.
 * /patterns/<slug> and /guidelines/patterns/<slug> (the catch-alls): an
 * experience pattern's guidance document, or "not found".
 */
const route = useRoute();
const router = useRouter();

const slug = computed(() => route.path.replace(/^\/(guidelines\/)?patterns\/?/, '').replace(/\/+$/, ''));
const experiencePattern = computed(() => experiencePatternForSlug(slug.value));

// /guidelines/patterns/<slug> for a pattern with a page of its own goes to that page
watch(
  slug,
  (value) => {
    if (value && (guideForSlug(value) || snippetForSlug(value))) router.replace(`/patterns/${value}`);
  },
  { immediate: true },
);

const { patterns, loadingPatterns, patternsError, loadPatterns } = useComponentPatternStatus();

/** The library's status for a code pattern, when the library has a pattern of that name */
const libraryStatus = (snippetSlug) => patterns.value.find((p) => toComponentId(p.name) === snippetSlug)?.status ?? null;

watch(
  slug,
  (value) => {
    if (!value && !patterns.value.length) loadPatterns();
  },
  { immediate: true },
);
</script>
