<template>
  <PageShell>
    <template v-if="law">
      <PageHero :back="{ to: '/hcd/laws-of-ux', label: 'Laws of UX' }" :title="law.name" :lead="law.description" :spot="law.spot" size="tool" />

      <PageSection title="Overview">
        <p class="law-text">{{ law.content.overview }}</p>
      </PageSection>

      <PageSection title="Why it happens" divided>
        <p class="law-text">{{ law.content.explanation }}</p>
      </PageSection>

      <PageSection title="Applying it" divided>
        <ul class="law-list">
          <li v-for="item in law.content.applications" :key="item" class="law-item">
            <AppIcon name="circle-check" class="law-item-icon" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection title="Examples" divided>
        <ul class="law-list">
          <li v-for="item in law.content.examples" :key="item" class="law-item">
            <AppIcon name="arrow-right" class="law-item-icon" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection title="Sources" divided>
        <ul class="law-list">
          <li v-for="item in law.content.references" :key="item" class="law-item text-sm">
            <AppIcon name="book-open" class="law-item-icon" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection v-if="neighbours.length" title="More laws" divided>
        <div class="grid sm:grid-cols-2 gap-4">
          <UiCard v-for="other in neighbours" :key="other.id" :to="`/hcd/laws-of-ux/${other.id}`" :title="other.name" :spot="other.spot" compact>
            {{ other.description }}
          </UiCard>
        </div>
      </PageSection>
    </template>

    <template v-else>
      <PageHero :back="{ to: '/hcd/laws-of-ux', label: 'Laws of UX' }" title="Law not found" size="tool" />
      <PageSection>
        <UiEmptyState title="There's no law with this address" body="It may have been renamed. Every law is listed on the Laws of UX page." spot="site/laws-of-ux">
          <template #actions>
            <UiButton to="/hcd/laws-of-ux" variant="primary" icon="arrow-left">All laws</UiButton>
          </template>
        </UiEmptyState>
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { lawsOfUX, lawsOfUXData } from '../data/lawsOfUX.js';
import { useBreadcrumbLabel } from '../composables/useBreadcrumbLabel.js';
import { PageHero, PageSection, PageShell, UiButton, UiCard, UiEmptyState } from '../components/ui';

const route = useRoute();
const law = computed(() => lawsOfUXData[route.params.id] ?? null);

// The law before and after this one, so people can read on
const neighbours = computed(() => {
  const index = lawsOfUX.findIndex((l) => l.id === law.value?.id);
  if (index < 0) return [];
  return [lawsOfUX[index - 1], lawsOfUX[index + 1]].filter(Boolean);
});

useBreadcrumbLabel(
  () => route.path,
  () => law.value?.name,
);
</script>

<style scoped>
.law-text {
  @apply max-w-3xl text-lg leading-relaxed text-ink-secondary;
}
.law-list {
  @apply max-w-3xl space-y-3;
}
.law-item {
  @apply flex items-start gap-3 leading-relaxed text-ink-secondary;
}
.law-item-icon {
  @apply mt-1 shrink-0 text-base text-accent-text;
}
</style>
