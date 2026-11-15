<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Get in touch"
      lead="Have questions, feedback, or need support? We're here to help. Reach out to our team and join the conversation."
      spot="site/get-in-touch"
    />

    <PageSection title="Ways to reach us" description="Each address goes to the people who can answer it. Links open your email app.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard
          v-for="channel in channels"
          :key="channel.title"
          :title="channel.title"
          :spot="channel.spot"
          :href="channel.email ? `mailto:${channel.email}` : null"
          compact
        >
          {{ channel.body }}
          <template #footer>
            <span v-if="channel.email" class="channel-address">
              <AppIcon name="mail" class="flex-none" />
              <!-- Let a long address wrap at the @ rather than mid-word -->
              <span class="min-w-0 break-words">{{ channel.email.split('@')[0] }}<wbr />@{{ channel.email.split('@')[1] }}</span>
            </span>
            <UiChip v-else icon="clock">Link not available yet</UiChip>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="What to expect" description="How quickly we reply, and what we can help with." divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiPanel title="Response times" heading-tag="h3">
          <ul class="checklist">
            <li v-for="time in responseTimes" :key="time.label">
              <AppIcon name="circle-check" class="checklist-icon" />
              <span><strong>{{ time.label }}:</strong> {{ time.value }}</span>
            </li>
          </ul>
        </UiPanel>
        <UiPanel title="How we can help" heading-tag="h3">
          <ul class="checklist">
            <li v-for="item in help" :key="item">
              <AppIcon name="circle-check" class="checklist-icon" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection
      title="We're here to help"
      description="Don't hesitate to reach out. Whether you have a question, need support, or want to share feedback, we'd love to hear from you."
      divided
    >
      <div class="flex flex-wrap gap-3">
        <UiButton variant="primary" icon="mail" href="mailto:hello@designsystem.example.com">Email the team</UiButton>
        <UiButton to="/getting-started/support" trailing-icon="arrow-right">View support resources</UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard, UiChip, UiPanel } from '../components/ui';

// Community had no destination (it linked to "#"), so it says so rather than linking nowhere.
const channels = [
  { title: 'Support', spot: 'site/support', email: 'support@designsystem.example.com', body: 'Need help with implementation or have technical questions? Our support team is ready to assist.' },
  { title: 'Feedback', spot: 'site/roadmap-feedback', email: 'feedback@designsystem.example.com', body: 'Share your ideas, suggestions, or report issues. Your feedback helps us improve the design system.' },
  { title: 'Community', spot: 'research/hcd-council', email: null, body: 'Join our community discussions, share knowledge, and connect with other users of the design system.' },
  { title: 'Partnerships', spot: 'site/building-trust', email: 'partnerships@designsystem.example.com', body: "Interested in partnering or collaborating? Let's explore how we can work together." },
  { title: 'Documentation', spot: 'site/writing-content', email: 'docs@designsystem.example.com', body: 'Found an issue with our documentation? Help us improve it by reporting errors or suggesting enhancements.' },
  { title: 'General inquiry', spot: 'research/conducting-interviews', email: 'hello@designsystem.example.com', body: 'For all other questions or inquiries, feel free to reach out to our general contact.' },
];

const responseTimes = [
  { label: 'Support requests', value: 'within 24 hours' },
  { label: 'Feedback', value: 'acknowledged within 48 hours' },
  { label: 'General inquiries', value: 'within 3–5 business days' },
];

const help = [
  'Technical implementation guidance',
  'Best practices and recommendations',
  'Component customization support',
  'Adoption strategy consultation',
];
</script>

<style scoped>
.channel-address {
  @apply inline-flex items-center gap-2 min-w-0 font-medium text-accent-text;
}
.checklist {
  @apply flex flex-col gap-3 text-sm leading-relaxed text-ink-secondary;
}
.checklist li {
  @apply flex items-start gap-2;
}
.checklist-icon {
  @apply flex-none mt-0.5 text-base text-accent-text;
}
.checklist strong {
  @apply font-semibold text-ink-strong;
}
</style>
