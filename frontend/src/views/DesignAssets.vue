<template>
  <PageShell>
    <PageHero
      eyebrow="Foundations"
      title="Design assets"
      lead="Icons, fonts, flags, seals, photos, illustrations and logos, kept in one place and ready to use across your projects."
      spot="foundations/design-assets"
    />

    <PageSection title="Browse assets" description="Pick a collection to preview, search and download.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UiCard v-for="asset in assets" :key="asset.to" :to="asset.to" :title="asset.title" :spot="asset.art" compact>{{ asset.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Asset collections" description="Curated sets that bring related assets together." divided>
      <div class="grid md:grid-cols-3 gap-4">
        <div v-for="collection in collections" :key="collection.title" class="collection">
          <SpotArt :name="collection.art" size="lg" class="mb-3" />
          <h3 class="collection-title">{{ collection.title }}</h3>
          <p class="collection-body">{{ collection.body }}</p>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, SpotArt, UiCard } from '../components/ui';

const assets = [
  { title: 'Icons', to: '/design-assets/icons', art: 'foundations/icon-library', body: 'Upload and manage icon sets from Material and Lucide.' },
  { title: 'Font library', to: '/design-assets/font-library', art: 'foundations/font-library', body: 'Browse and preview hundreds of Google Fonts.' },
  { title: 'Country flags', to: '/design-assets/country-flags', art: 'foundations/country-flags', body: 'Country flag assets for use in your designs.' },
  { title: 'USG seals', to: '/design-assets/usg-seals', art: 'foundations/usg-seals', body: 'Official US Government seals and emblems for authorized use.' },
  { title: 'Internal seals', to: '/design-assets/internal-seals', art: 'foundations/internal-seals', body: 'Internal organizational seals and emblems for agency use.' },
  { title: 'Interactives', to: '/design-assets/interactives', art: 'foundations/interactives', body: 'Interactive assets and components for richer experiences.' },
  { title: 'Stock photos', to: '/design-assets/stock-photos', art: 'site/stock-photos', body: 'Curated stock photography for your projects.' },
  { title: 'Illustrations', to: '/design-assets/illustrations', art: 'foundations/illustrations', body: 'Curated illustration collections for your designs.' },
  { title: 'Capability logos', to: '/design-assets/capability-logos', art: 'foundations/capability-logos', body: 'Logos and branding for specific capabilities and services.' },
  { title: 'Company logos', to: '/design-assets/company-logos', art: 'foundations/company-logos', body: 'Company and organization logos for partnership materials.' },
];

const collections = [
  { title: 'Icon library', art: 'foundations/icon-library', body: 'Icons organized by category and style.' },
  { title: 'Brand assets', art: 'foundations/capability-logos', body: 'Logos, brand guidelines and marketing materials in one place.' },
  { title: 'Illustration sets', art: 'foundations/illustrations', body: 'Curated illustration collections for your design projects.' },
];
</script>

<style scoped>
.collection {
  @apply flex flex-col items-center p-8 rounded-card bg-surface-sunken text-center;
}
.collection-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.collection-body {
  @apply text-sm leading-relaxed text-ink-secondary;
}
</style>
