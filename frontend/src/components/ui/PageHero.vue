<template>
  <section class="page-hero" :class="`page-hero-${size}`">
    <div class="min-w-0">
      <router-link v-if="back" :to="back.to" class="page-hero-eyebrow page-hero-back">
        <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
        {{ back.label }}
      </router-link>
      <p v-else-if="eyebrow" class="page-hero-eyebrow">{{ eyebrow }}</p>
      <h1 class="page-hero-title">{{ title }}</h1>
      <p v-if="lead || $slots.lead" class="page-hero-lead"><slot name="lead">{{ lead }}</slot></p>
      <div v-if="$slots.actions" class="page-hero-actions"><slot name="actions" /></div>
    </div>
    <SpotArt v-if="spot" :name="spot" :size="size === 'page' ? 'hero' : 'xl'" class="hidden md:block" />
  </section>
</template>

<script setup>
import SpotArt from './SpotArt.vue';

/**
 * The top of a page: a section line (or a back link), the page name, one or
 * two sentences, optional actions, and a spot illustration. `page` is for
 * index pages, `tool` for tool and detail pages.
 */
defineProps({
  title: { type: String, required: true },
  /** The section the page belongs to, or a short tagline */
  eyebrow: { type: String, default: '' },
  /** { to, label }: replaces the eyebrow with a link back, e.g. { to: '/tools', label: 'Tools' } */
  back: { type: Object, default: null },
  lead: { type: String, default: '' },
  /** Spot illustration name, e.g. "tools/gradient-generator" */
  spot: { type: String, default: '' },
  size: { type: String, default: 'page', validator: (v) => ['page', 'tool'].includes(v) },
});
</script>

<style scoped>
.page-hero {
  @apply grid md:grid-cols-content-aside items-center gap-10 border-b border-line;
}
.page-hero-page {
  @apply pb-14 md:pb-16;
}
.page-hero-tool {
  @apply pb-10 md:pb-12;
}
.page-hero-eyebrow {
  @apply inline-flex items-center gap-1 mb-4 text-sm font-medium tracking-wide text-accent-text;
}
.page-hero-back {
  @apply hover:underline underline-offset-4;
}
.page-hero-title {
  @apply mb-5 font-semibold tracking-tight leading-tight text-ink-strong;
}
.page-hero-page .page-hero-title {
  @apply text-4xl md:text-6xl;
}
.page-hero-tool .page-hero-title {
  @apply text-4xl md:text-5xl;
}
.page-hero-lead {
  @apply max-w-xl text-lg leading-relaxed text-ink-secondary;
}
.page-hero-actions {
  @apply flex flex-wrap gap-3 mt-8;
}
</style>
