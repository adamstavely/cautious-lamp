<template>
  <GuidanceDocPage
    eyebrow="Artificial intelligence"
    title="AI patterns"
    lead="Patterns for AI features that keep people informed, in control and able to check what the system tells them."
    spot="ai/ai-patterns"
    doc-path="/ai/patterns"
    :related="related"
    related-title="AI pattern pages"
    related-description="Full guidance for each AI interaction pattern."
  />
</template>

<script setup>
import GuidanceDocPage from '../components/GuidanceDocPage.vue';

const related = [
  { title: 'AI thinking states', to: '/guidelines/patterns/ai-thinking-states', spot: 'patterns/ai-thinking-states', body: 'Show progress while the AI works, and let people stop it.' },
  { title: 'Agent-oriented onboarding', to: '/guidelines/patterns/agent-oriented-onboarding', spot: 'patterns/agent-oriented-onboarding', body: 'Introduce what an agent can do and set expectations.' },
  { title: 'AI disengagement, timeout and error', to: '/guidelines/patterns/ai-disengagement-timeout-error', spot: 'patterns/ai-disengagement-timeout-error', body: 'Recover when requests time out or people walk away.' },
  { title: 'Multi-agent orchestration', to: '/guidelines/patterns/multi-agent-orchestration', spot: 'patterns/multi-agent-orchestration', body: 'Present work done by several agents together.' },
];
</script>
