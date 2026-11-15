<template>
  <GuidanceDocPage
    eyebrow="Artificial intelligence"
    title="AI components"
    lead="The building blocks of an AI interface, what each must do, and how to build it from the design system."
    spot="ai/ai-components"
    doc-path="/ai/components"
    :related="related"
    related-title="Start here"
    related-description="The patterns these components make up, and the components to build them from."
  />
</template>

<script setup>
import GuidanceDocPage from '../components/GuidanceDocPage.vue';

const related = [
  { title: 'AI patterns', to: '/ai/patterns', spot: 'ai/ai-patterns', body: 'How the building blocks fit together in common AI interactions.' },
  { title: 'Components', to: '/components', spot: 'foundations/components', body: 'The design system components AI interfaces are built from.' },
  { title: 'Designing for generative AI', to: '/guidelines/ai/designing-for-generative-ai', spot: 'ai/designing-for-generative-ai', body: 'Interfaces that create text, images and other content.' },
];
</script>
