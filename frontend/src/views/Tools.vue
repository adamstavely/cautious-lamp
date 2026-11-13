<template>
  <div class="w-full h-full bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" @navigate-doc="handleDocNavigation" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Reference Content - shown when a reference link is clicked -->
      <div v-if="currentDocLink" class="h-full w-full relative flex flex-col">
        <!-- Breadcrumbs -->
        <Breadcrumbs 
          :custom-path="currentDocLink"
          :on-navigate="handleBreadcrumbNavigate"
        />
        <div class="flex-1 overflow-hidden">
          <MarkdownViewer :doc-path="currentDocLink" />
        </div>
      </div>
      
      <!-- Overview Content - shown by default -->
      <div v-else class="h-full overflow-y-auto">
        <!-- Breadcrumbs -->
        <Breadcrumbs />

        <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <!-- Hero -->
          <section class="grid md:grid-cols-[1fr_auto] items-center gap-10 pb-14 md:pb-16 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">Check, generate, convert</p>
              <h1 class="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-5">Tools</h1>
              <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Tools to help you create, iterate and refine your design system, from gradient
                generators to contrast checkers, all in one place.
              </p>
            </div>
            <div class="spot hidden md:block w-64 h-64 lg:w-72 lg:h-72" aria-hidden="true" v-html="spot('site/tools')"></div>
          </section>

          <!-- Popular -->
          <section class="py-14 md:py-16">
            <div class="section-head">
              <h2>Popular tools</h2>
              <p>The ones teams reach for most.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              <router-link v-for="tool in popular" :key="tool.to" :to="tool.to" class="tool group">
                <div class="spot w-14 h-14 shrink-0" aria-hidden="true" v-html="spot(tool.art)"></div>
                <div class="min-w-0">
                  <h3 class="font-medium group-hover:text-[#2f5ea8] dark:group-hover:text-[#9dbcf0] transition-colors">{{ tool.title }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ tool.body }}</p>
                </div>
              </router-link>
            </div>
          </section>

          <!-- All tools -->
          <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
            <div class="section-head">
              <h2>All tools</h2>
              <p>Everything for color, type, layout, content, images and code.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <router-link v-for="tool in tools" :key="tool.to" :to="tool.to" class="card group">
                <div class="spot w-16 h-16 -ml-1 mb-2" aria-hidden="true" v-html="spot(tool.art)"></div>
                <h3 class="card-title">
                  {{ tool.title }}
                  <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
                </h3>
                <p class="card-body">{{ tool.body }}</p>
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { spot } from '../utils/spotIllustrations.js';

const route = useRoute();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const currentDocLink = ref(null);

const handleBreadcrumbNavigate = (path) => {
  // Handle navigation from breadcrumbs
  if (path === '/tools' || path === '/') {
    currentDocLink.value = null;
  } else if (path.startsWith('/tools/references/')) {
    currentDocLink.value = path;
  }
};

const handleDocNavigation = (link) => {
  currentDocLink.value = link;
  // Open drawer if closed
  if (!drawerOpen.value) {
    drawerOpen.value = true;
  }
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
});

// Keep the reference content in step with the route (on mount and when moving
// between /tools/references/* pages, or back to /tools).
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/tools/references/')) {
      currentDocLink.value = path;
    } else if (path === '/tools' || path === '/tools/') {
      currentDocLink.value = null;
    }
  },
  { immediate: true },
);

const tools = [
  { title: 'Gradient generator', to: '/tools/gradient-generator', art: 'tools/gradient-generator', body: 'Create CSS gradients with custom stops.' },
  { title: 'Palette builder', to: '/palette-builder', art: 'foundations/color-palettes', body: 'Build color palettes with AI suggestions.' },
  { title: 'Lorem ipsum generator', to: '/tools/lorem-ipsum', art: 'tools/lorem-ipsum-generator', body: 'Generate placeholder text for your designs.' },
  { title: 'SVG placeholder text', to: '/tools/svg-placeholder-text', art: 'guidelines/text-graphics', body: 'Generate placeholder SVG text with custom styling.' },
  { title: 'SEO tagging generator', to: '/tools/seo-tagging', art: 'tools/seo-tagging-generator', body: 'Generate SEO meta tags and structured data.' },
  { title: 'Color scale generator', to: '/tools/color-scale', art: 'tools/color-scale-generator', body: 'Generate accessible color scales using Leonardo.' },
  { title: 'Color converter', to: '/tools/color-converter', art: 'tools/color-converter', body: 'Convert colors between formats and color spaces.' },
  { title: 'Color contrast checker', to: '/tools/color-contrast', art: 'tools/color-contrast-checker', body: 'Check color pairs against WCAG.' },
  { title: 'APCA calculator', to: '/tools/apca-calculator', art: 'tools/apca-calculator', body: 'Compose colors with consistent APCA contrast.' },
  { title: 'Photosensitivity analysis', to: '/tools/photosensitivity', art: 'admin/photosensitivity-analysis', body: 'Check video for photosensitive seizure risks with IRIS.' },
  { title: 'Image converter', to: '/tools/png-to-ico', art: 'tools/png-to-ico', body: 'Convert PNG images to ICO for favicons and app icons.' },
  { title: 'Alt text generator', to: '/tools/alt-text-generator', art: 'tools/alt-text-generator', body: 'Write descriptive, accessible alt text for images.' },
  { title: 'PX unit converter', to: '/tools/px-converter', art: 'tools/px-converter', body: 'Convert pixels to REM, EM, percent and Tailwind units.' },
  { title: 'CSS converter', to: '/tools/css-converter', art: 'tools/css-converter', body: 'Convert CSS to LESS, Sass and SCSS.' },
  { title: 'HTML viewer', to: '/tools/html-viewer', art: 'tools/html-viewer', body: 'Render HTML, CSS and JavaScript with a live preview.' },
  { title: 'HTML escaper', to: '/tools/html-escaper', art: 'tools/html-escaper', body: 'Escape and unescape HTML special characters.' },
  { title: 'Image compressor', to: '/tools/image-compressor', art: 'tools/image-compressor', body: 'Shrink PNG, JPG and GIF files while keeping quality.' },
  { title: 'Chart builder', to: '/tools/chart-builder', art: 'tools/chart-builder', body: 'Make line, bar, pie, scatter and other charts.' },
  { title: 'Spacing scale generator', to: '/tools/spacing-scale', art: 'tools/spacing-scale-generator', body: 'Generate spacing scales from a ratio.' },
  { title: 'Box shadow generator', to: '/tools/box-shadow', art: 'tools/box-shadow-generator', body: 'Layer shadows with custom offset, blur and spread.' },
  { title: 'Border radius generator', to: '/tools/border-radius', art: 'tools/border-radius-generator', body: 'Set corner radii individually or all at once.' },
  { title: 'CSS animation generator', to: '/tools/css-animation', art: 'tools/css-animation-generator', body: 'Build keyframe animations for transform, opacity and color.' },
];

// Same set the old "Popular tools" band featured.
const popularPaths = [
  '/tools/gradient-generator', '/palette-builder', '/tools/lorem-ipsum',
  '/tools/svg-placeholder-text', '/tools/seo-tagging', '/tools/color-scale',
  '/tools/color-contrast', '/tools/apca-calculator', '/tools/html-viewer',
];
const popular = popularPaths.map((path) => tools.find((tool) => tool.to === path));
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

.tool {
  @apply flex items-center gap-4 rounded-xl p-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors;
}

.arrow {
  @apply text-base text-slate-400 transition-transform;
}
.group:hover .arrow {
  @apply translate-x-1 text-[#2f5ea8] dark:text-[#9dbcf0];
}
</style>
