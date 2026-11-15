<template>
  <PageShell>
    <PageHero
      eyebrow="Artificial intelligence"
      title="AI"
      lead="How to design AI features people can understand, check and control, and the AI tools built into this design system."
      spot="ai/artificial-intelligence"
    />

    <PageSection title="Design for AI" description="Patterns, components and tokens for interfaces that include AI.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="page in designFor" :key="page.to" :to="page.to" :title="page.title" :spot="page.spot" compact>{{ page.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="AI guidelines" description="Guidance for specific parts of an AI experience." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="guide in guidelines" :key="guide.to" :to="guide.to" :title="guide.title" :spot="guide.spot" />
      </div>
    </PageSection>

    <PageSection title="AI in the design system" description="Tools here that use Claude through the API server." divided>
      <div class="grid sm:grid-cols-2 gap-4">
        <UiCard v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :spot="tool.spot" compact>{{ tool.body }}</UiCard>
      </div>
      <UiCallout class="mt-6" title="Needs an Anthropic key on the server" icon="info">
        These tools only work once the API server has an Anthropic API key. Until then they say they aren't set up rather than guess. The Eero
        assistant also needs the ai-assistant feature flag turned on; it then opens from the button in the corner of every page.
      </UiCallout>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCallout, UiCard, UiLinkRow } from '../components/ui';

const designFor = [
  { title: 'AI patterns', to: '/ai/patterns', spot: 'ai/ai-patterns', body: 'Patterns that keep people informed, in control and able to check what the system tells them.' },
  { title: 'AI components', to: '/ai/components', spot: 'ai/ai-components', body: 'The building blocks of an AI interface and how to build them from the design system.' },
  { title: 'AI tokens', to: '/tokens/ai-builder', spot: 'ai/ai-token-builder', body: 'Tokens for agent identity, confidence, explainability and other AI states.' },
];

const guidelines = [
  ['designing-for-generative-ai', 'Designing for generative AI'],
  ['designing-for-agentic-experiences', 'Designing for agentic experiences'],
  ['designing-for-mcp-ui', 'Designing for MCP UI'],
  ['agent-roles-mental-models', 'Agent roles and mental models'],
  ['human-machine-teaming', 'Human-machine teaming'],
  ['identity-persona', 'Identity and persona'],
  ['memory-personalization', 'Memory and personalization'],
  ['content-microcopy', 'Content and microcopy'],
  ['feedback-observability', 'Feedback and observability'],
  ['fallback-error-states', 'Fallback and error states'],
  ['safe-exploration', 'Safe exploration'],
].map(([slug, title]) => ({ title, to: `/guidelines/ai/${slug}`, spot: `ai/${slug}` }));

const tools = [
  { title: 'AI suggestions', to: '/ai-suggestions', spot: 'ai/ai-components', body: 'Paste component code and Claude reviews it against this design system: components, tokens and accessibility.' },
  { title: 'Alt text generator', to: '/tools/alt-text-generator', spot: 'tools/alt-text-generator', body: 'Upload an image and Claude suggests alt text you can edit before you use it.' },
];
</script>
