<template>
  <PageShell>
    <PageHero :eyebrow="eyebrow" :title="title" :lead="lead" :spot="spot" />

    <PageSection v-if="related.length" :title="relatedTitle" :description="relatedDescription">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="link in related" :key="link.to" :to="link.to" :title="link.title" :spot="link.spot" compact>{{ link.body }}</UiCard>
      </div>
    </PageSection>

    <!-- Links inside the document stay in the app -->
    <div @click="followLink">
      <MarkdownViewer :doc-path="docPath" embedded />
    </div>
  </PageShell>
</template>

<script setup>
import { useRouter } from 'vue-router';
import MarkdownViewer from './MarkdownViewer.vue';
import { PageHero, PageSection, PageShell, UiCard } from './ui';

/**
 * A guidance page: the hero, optional cards to related pages, and a Markdown
 * document from public/docs rendered by MarkdownViewer (its path comes from
 * `docPath`, e.g. "/hcd/principles" → /docs/hcd/principles.md). The document
 * has no h1 of its own; the hero's title is the page's only h1.
 */
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  lead: { type: String, default: '' },
  spot: { type: String, default: '' },
  docPath: { type: String, required: true },
  /** Cards above the document: [{ title, to, spot, body }] */
  related: { type: Array, default: () => [] },
  relatedTitle: { type: String, default: 'Related pages' },
  relatedDescription: { type: String, default: '' },
});

const router = useRouter();

/** Opens same-site links (href="/…") with the router instead of reloading the app */
const followLink = (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest?.('a[href]');
  if (!anchor || anchor.target === '_blank') return;
  const href = anchor.getAttribute('href');
  if (!href.startsWith('/') || href.startsWith('//')) return;
  event.preventDefault();
  router.push(href);
};
</script>
