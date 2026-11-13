<template>
  <div class="w-full h-full bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />

    <!-- Main Content Area -->
    <div
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />

      <div class="h-full overflow-y-auto">
        <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <!-- Hero -->
          <section class="grid md:grid-cols-[1fr_auto] items-center gap-10 pb-14 md:pb-16 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">Foundations</p>
              <h1 class="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-5">Design assets</h1>
              <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Icons, fonts, flags, seals, photos, illustrations and logos, kept in one place and ready
                to use across your projects.
              </p>
            </div>
            <div class="spot hidden md:block w-64 h-64 lg:w-72 lg:h-72" aria-hidden="true" v-html="spot('foundations/design-assets')"></div>
          </section>

          <!-- Browse -->
          <section class="py-14 md:py-16">
            <div class="section-head">
              <h2>Browse assets</h2>
              <p>Pick a collection to preview, search and download.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <router-link v-for="asset in assets" :key="asset.to" :to="asset.to" class="card group">
                <div class="spot w-16 h-16 -ml-1 mb-2" aria-hidden="true" v-html="spot(asset.art)"></div>
                <h3 class="card-title">
                  {{ asset.title }}
                  <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
                </h3>
                <p class="card-body">{{ asset.body }}</p>
              </router-link>
            </div>
          </section>

          <!-- Collections -->
          <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
            <div class="section-head">
              <h2>Asset collections</h2>
              <p>Curated sets that bring related assets together.</p>
            </div>
            <div class="grid md:grid-cols-3 gap-4">
              <div v-for="collection in collections" :key="collection.title" class="collection">
                <div class="spot w-24 h-24 mx-auto mb-3" aria-hidden="true" v-html="spot(collection.art)"></div>
                <h3 class="card-title justify-center">{{ collection.title }}</h3>
                <p class="card-body text-center">{{ collection.body }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { spot } from '../utils/spotIllustrations.js';

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
});

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
.spot :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.section-head {
  @apply flex flex-col gap-1 mb-8;
}
.section-head h2 {
  @apply text-2xl md:text-3xl font-semibold tracking-tight;
}
.section-head p {
  @apply text-slate-600 dark:text-slate-400;
}

.card {
  @apply block rounded-2xl p-5 border border-slate-200 bg-[#fff] transition-all hover:border-[#8fb0e8] hover:shadow-[0_8px_24px_-12px_rgba(47,94,168,0.25)] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-[#6f93d1];
}
.card-title {
  @apply flex items-center gap-1.5 text-lg font-semibold mb-1.5;
}
.card-body {
  @apply text-sm leading-relaxed text-slate-600 dark:text-slate-400;
}

.collection {
  @apply flex flex-col items-center rounded-2xl p-8 bg-slate-50 dark:bg-slate-900/60;
}

.arrow {
  @apply text-base text-slate-400 transition-transform;
}
.group:hover .arrow {
  @apply translate-x-1 text-[#2f5ea8] dark:text-[#9dbcf0];
}
</style>
