<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Support and help"
      lead="Get help when you need it. Find answers to common questions, report issues, or contact the design system team."
      spot="site/support"
    />

    <PageSection title="Frequently asked questions">
      <dl class="faq">
        <div class="faq-item">
          <dt class="faq-question">How do I customize components?</dt>
          <dd class="faq-answer">
            Most components support customization through props and variants. For more advanced customization, you can extend components or use design
            tokens to create your own variants. See the <UiLink to="/getting-started/best-practices">best practices</UiLink> guide for details.
          </dd>
        </div>
        <div class="faq-item">
          <dt class="faq-question">Can I use components in my existing project?</dt>
          <dd class="faq-answer">
            Yes. The design system is framework-agnostic and can be integrated into Vue, React, Angular, and vanilla JavaScript projects. See the
            <UiLink to="/getting-started/installation">installation</UiLink> guide for framework-specific instructions.
          </dd>
        </div>
        <div class="faq-item">
          <dt class="faq-question">How do I report a bug or request a feature?</dt>
          <dd class="faq-answer">
            Use our feedback system or create an issue in the GitHub repository. For feature requests, you can also use the
            <UiLink to="/feedback">roadmap and feedback</UiLink> page.
          </dd>
        </div>
        <div class="faq-item">
          <dt class="faq-question">Is the design system accessible?</dt>
          <dd class="faq-answer">
            Yes. All components are built to meet WCAG 2.1 AA standards. However, proper implementation is key: always use components as documented and
            provide appropriate labels and ARIA attributes when needed.
          </dd>
        </div>
        <div class="faq-item">
          <dt class="faq-question">How often is the design system updated?</dt>
          <dd class="faq-answer">
            We release regular updates with new components, improvements, and bug fixes. Major version updates are announced in advance, and we maintain
            backward compatibility when possible. Check the <UiLink to="/feedback">roadmap</UiLink> for upcoming features.
          </dd>
        </div>
      </dl>
    </PageSection>

    <PageSection title="Get in touch" description="Pick the channel that fits your question." divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiCard>
          <AppIcon name="message-square" class="channel-icon" />
          <h3 class="channel-title">Live chat</h3>
          <p>Chat with our team in real time for quick questions and support.</p>
          <template #footer>
            <UiChip>Not available yet</UiChip>
            <UiLink to="/getting-started/get-in-touch" arrow>Contact the team instead</UiLink>
          </template>
        </UiCard>
        <UiCard>
          <AppIcon name="mail" class="channel-icon" />
          <h3 class="channel-title">Email support</h3>
          <p>Send us an email for detailed questions or support requests.</p>
          <template #footer>
            <UiButton variant="primary" size="sm" icon="mail" href="mailto:design-system@example.com">Send email</UiButton>
          </template>
        </UiCard>
        <UiCard>
          <AppIcon name="messages-square" class="channel-icon" />
          <h3 class="channel-title">Community forum</h3>
          <p>Ask questions and get help from the community of design system users.</p>
          <template #footer>
            <UiChip>Not available yet</UiChip>
            <UiLink to="/feedback" arrow>Share feedback instead</UiLink>
          </template>
        </UiCard>
        <UiCard>
          <AppIcon name="bug" class="channel-icon" />
          <h3 class="channel-title">Report issues</h3>
          <p>Found a bug? Report it on GitHub or through our feedback system.</p>
          <template #footer>
            <UiLink to="/feedback" arrow>Report an issue</UiLink>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <PageSection
      title="Office hours"
      description="Join our weekly office hours for live Q&A with the design system team. Get help with implementation, discuss best practices, and share feedback."
      divided
    >
      <UiPanel>
        <dl class="grid sm:grid-cols-2 gap-4">
          <div>
            <dt class="hours-label">When</dt>
            <dd class="text-ink">Every Tuesday, 2:00 to 3:00 PM Eastern</dd>
          </div>
          <div>
            <dt class="hours-label">Where</dt>
            <dd class="text-ink">Virtual meeting (link provided on request)</dd>
          </div>
        </dl>
        <div>
          <UiButton variant="primary" icon="calendar-clock" :href="inviteHref">Request an invite</UiButton>
        </div>
      </UiPanel>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { AppIcon, PageHero, PageSection, PageShell, UiButton, UiCard, UiChip, UiLink, UiPanel } from '../components/ui';

// Office hours invites go to the same team inbox as email support
const inviteHref = `mailto:design-system@example.com?subject=${encodeURIComponent('Office hours invite request')}`;
</script>

<style scoped>
.faq {
  @apply flex flex-col divide-y divide-line rounded-card border border-line bg-surface-raised;
}
.faq-item {
  @apply p-6;
}
.faq-question {
  @apply mb-2 text-lg font-semibold text-ink-strong;
}
.faq-answer {
  @apply leading-relaxed text-ink-secondary;
}
.channel-icon {
  @apply mb-3 text-2xl text-accent-text;
}
.channel-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.hours-label {
  @apply mb-1 text-sm font-medium text-ink-muted;
}
</style>
