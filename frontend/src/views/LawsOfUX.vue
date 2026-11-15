<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Human-centered design"
      title="Laws of UX"
      lead="Best practices to keep in mind when building interfaces, drawn from psychology and research into how people use them."
      spot="site/laws-of-ux"
    />

    <PageSection title="About the laws">
      <div class="max-w-3xl space-y-3 text-ink-secondary leading-relaxed">
        <p>
          Each law describes how people perceive, decide and remember. Knowing them helps you design interfaces that feel familiar, ask
          less of people and hold up under pressure.
        </p>
        <p class="text-sm">
          Based on <UiLink href="https://lawsofux.com/" external>Laws of UX</UiLink> by Jon Yablonski.
        </p>
      </div>
    </PageSection>

    <PageSection :title="`The laws (${laws.length})`" description="Open a law for what it means, how to apply it, examples and sources." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="law in laws" :key="law.id" :to="`/hcd/laws-of-ux/${law.id}`" :title="law.name" :spot="law.spot" compact>
          {{ law.description }}
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { lawsOfUX as laws } from '../data/lawsOfUX.js';
import { PageHero, PageSection, PageShell, UiCard, UiLink } from '../components/ui';
</script>
