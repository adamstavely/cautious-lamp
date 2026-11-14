<template>
  <PageShell v-model:doc-link="docLink">
    <PageHero
      eyebrow="Check, generate, convert"
      title="Tools"
      lead="Tools to help you create, iterate and refine your design system, from gradient generators to contrast checkers, all in one place."
      spot="site/tools"
    />

    <PageSection title="Popular tools" description="The ones teams reach for most.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="tool in popular" :key="tool.to" :to="tool.to" :title="tool.title" :body="tool.body" :spot="tool.art" />
      </div>
    </PageSection>

    <PageSection title="All tools" description="Everything for color, type, layout, content, images and code." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UiCard v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :spot="tool.art" compact>{{ tool.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const route = useRoute();

// /tools/references/* shows that reference document in place of the page
const docLink = ref(null);
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/tools/references/')) docLink.value = path;
    else if (path === '/tools' || path === '/tools/') docLink.value = null;
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
