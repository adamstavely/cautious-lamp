<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Writing and content"
      lead="Clear, concise, and user-focused content is essential for great user experiences. Learn how to write effective copy that guides and supports users."
      spot="site/writing-content"
    />

    <PageSection title="Content writing guidelines" description="Good content is clear, concise, and user-centered. Our content guidelines help you write copy that supports users and enhances their experience.">
      <ul class="foundation-grid">
        <li v-for="item in principles" :key="item.title">
          <UiCard :title="item.title" class="h-full">
            <template #media>
              <span class="foundation-icon"><AppIcon :name="item.icon" /></span>
            </template>
            {{ item.body }}
          </UiCard>
        </li>
      </ul>
    </PageSection>

    <PageSection title="More foundations" description="The other principles the design system is built on." divided>
      <div class="foundation-links">
        <UiLinkRow v-for="page in otherFoundations" :key="page.to" :to="page.to" :title="page.title" :body="page.body" :spot="page.spot" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const principles = [
  {
    title: 'Clarity and simplicity',
    icon: 'message-square-text',
    body: 'Use plain language and avoid jargon. Write in a way that\'s easy to understand, using short sentences and clear structure. Users should never have to guess what you mean.',
  },
  {
    title: 'User-centered language',
    icon: 'user',
    body: 'Write from the user\'s perspective. Use "you" and "your" to speak directly to users. Focus on what users can do and what benefits they\'ll receive.',
  },
  {
    title: 'Consistency',
    icon: 'spell-check',
    body: 'Maintain consistent terminology, tone, and style throughout your interface. Consistency in language helps users build understanding and trust.',
  },
  {
    title: 'Action-oriented',
    icon: 'mouse-pointer-click',
    body: 'Use active voice and action verbs. Button labels and calls-to-action should clearly indicate what will happen when users interact with them.',
  },
  {
    title: 'Accessibility in content',
    icon: 'accessibility',
    body: 'Write content that\'s accessible to all users. Use descriptive link text, provide alt text for images, and ensure content is readable by screen readers.',
  },
];

const otherFoundations = [
  { title: 'Atomic design', to: '/getting-started/foundations/atomic-design', spot: 'site/atomic-design', body: 'Build interfaces from atoms up to full pages.' },
  { title: 'Building trust', to: '/getting-started/foundations/building-trust', spot: 'site/building-trust', body: 'Earn trust with consistent, clear, reliable interactions.' },
  { title: 'Responsiveness', to: '/getting-started/foundations/responsiveness', spot: 'site/responsiveness', body: 'Adapt layouts to every device and screen size.' },
  { title: 'Usability', to: '/getting-started/foundations/usability', spot: 'research/usability', body: 'Make interfaces easy to learn, efficient and satisfying.' },
];
</script>

<style scoped>
.foundation-grid {
  @apply grid gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
.foundation-icon {
  @apply inline-flex items-center justify-center w-10 h-10 mb-4 rounded-control bg-accent-subtle text-accent-text text-xl;
}
.foundation-links {
  @apply grid gap-x-8 gap-y-4 sm:grid-cols-2;
}
</style>
