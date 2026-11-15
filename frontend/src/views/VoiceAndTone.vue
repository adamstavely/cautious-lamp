<template>
  <PageShell>
    <PageHero
      eyebrow="Guidelines"
      title="Voice and tone"
      lead="How to sound at each stage of someone's journey with us. Our voice stays the same everywhere; the tone shifts with the moment."
      spot="site/voice-and-tone"
    />

    <PageSection title="Three tone attributes" description="Each scenario below sets how strongly to lean on each one.">
      <div class="grid md:grid-cols-3 gap-4">
        <UiCard v-for="attribute in ATTRIBUTES" :key="attribute.name" :title="attribute.name" compact>{{ attribute.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Scenarios" description="Where people are, what the words need to do, and where those words appear." divided>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="scenario in scenarios" :key="scenario.id" :title="scenario.title">
          <p>{{ scenario.description }}</p>
          <dl class="vt-tones">
            <div v-for="tone in scenario.tones" :key="tone.name" class="vt-tone">
              <dt class="vt-tone-head">
                <span>{{ tone.name }}</span>
                <span class="vt-tone-level">{{ level(tone.value) }}</span>
              </dt>
              <dd>
                <UiMeter :value="tone.value" :label="`${tone.name} for ${scenario.title.toLowerCase()}`" :value-text="`${level(tone.value)}, ${tone.value} of 100`" />
              </dd>
            </div>
          </dl>
          <template #footer>
            <span class="vt-footer-label">Touchpoints</span>
            <UiChip v-for="touchpoint in scenario.touchpoints" :key="touchpoint">{{ touchpoint }}</UiChip>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Best practices" divided>
      <div class="grid md:grid-cols-3 gap-4">
        <UiCard v-for="practice in PRACTICES" :key="practice.title" :title="practice.title" compact>{{ practice.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiChip, UiMeter } from '../components/ui';

const ATTRIBUTES = [
  { name: 'To-the-point', body: 'Direct, concise and efficient: no unnecessary words.' },
  { name: 'Approachable', body: 'Friendly, warm and human, so people feel comfortable and understood.' },
  { name: 'Upfront', body: 'Transparent, honest and clear: no hidden agendas or confusing language.' },
];

const PRACTICES = [
  {
    title: 'Context is key',
    body: "Consider the person's emotional state and what they're doing. Someone fixing a problem needs different words from someone celebrating a success.",
  },
  {
    title: 'Consistent across channels',
    body: "Tone shifts with the moment, but the voice doesn't. People should recognise us in an email, in the app or talking to support.",
  },
  {
    title: 'Test and iterate',
    body: 'Treat this as a living guide: review feedback, test messages, and adjust to what works for the people we serve.',
  },
];

/** How strongly to lean on an attribute, in words */
const level = (value) => (value >= 70 ? 'Strong' : value >= 40 ? 'Moderate' : 'Light');

const scenarios = [
  {
    id: 'first-impressions',
    title: 'First impressions',
    description: 'Capture interest and spark curiosity with bold and clever language.',
    tones: [
      { name: 'To-the-point', value: 20 },
      { name: 'Approachable', value: 85 },
      { name: 'Upfront', value: 25 }
    ],
    touchpoints: [
      'In-app product flows',
      'Transactional email',
      'Transactional notifications'
    ]
  },
  {
    id: 'consideration',
    title: 'Consideration',
    description: 'Drive understanding and earn trust by breaking down products, how they work, and results.',
    tones: [
      { name: 'To-the-point', value: 80 },
      { name: 'Approachable', value: 70 },
      { name: 'Upfront', value: 85 }
    ],
    touchpoints: [
      'Product pages',
      'Campaign landers',
      'App store'
    ]
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Provide information for decisions, build control, safety, and confidence, using social proof, metaphors, and data.',
    tones: [
      { name: 'To-the-point', value: 85 },
      { name: 'Approachable', value: 70 },
      { name: 'Upfront', value: 80 }
    ],
    touchpoints: [
      'Product announcement emails',
      'Tooltips',
      'New user states',
      'Half sheets'
    ]
  },
  {
    id: 'product-use',
    title: 'Product use',
    description: 'Help customers efficiently complete tasks with clear actions, helpful copy, and a natural, approachable brand expression.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 75 }
    ],
    touchpoints: [
      'In-app product flows',
      'Transactional email',
      'Transactional notifications'
    ]
  },
  {
    id: 'engagement',
    title: 'Engagement',
    description: 'Keep people coming back by being useful and a little surprising: tips, stories, events and experiences that go beyond the task.',
    tones: [
      { name: 'To-the-point', value: 40 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 35 }
    ],
    touchpoints: [
      'Social',
      'Lifecycle marketing',
      'Event marketing'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Help users overcome obstacles with empathetic, clear, and concise language in error messages and support communications.',
    tones: [
      { name: 'To-the-point', value: 90 },
      { name: 'Approachable', value: 95 },
      { name: 'Upfront', value: 90 }
    ],
    touchpoints: [
      'Support channels',
      'Chatbot',
      'Quick texts'
    ]
  },
  {
    id: 'bad-news',
    title: 'Bad news',
    description: 'Deliver bad news with hyper-awareness of the customer\'s emotional state to ensure they feel heard and reassured.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 95 },
      { name: 'Upfront', value: 75 }
    ],
    touchpoints: [
      'Compliance emails',
      'Error states',
      'Chatbot',
      'Quick texts'
    ]
  },
  {
    id: 'success',
    title: 'Success',
    description: 'Share good news and add delight after task completion, sign-ups, or purchases.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 20 }
    ],
    touchpoints: [
      'Confirmation messages',
      'Transactional email',
      'Lifecycle marketing'
    ]
  },
  {
    id: 'moments-of-pause',
    title: 'Moments of pause',
    description: 'Foster connection in insignificant moments with unexpected language and diction.',
    tones: [
      { name: 'To-the-point', value: 15 },
      { name: 'Approachable', value: 85 },
      { name: 'Upfront', value: 15 }
    ],
    touchpoints: [
      'Empty states',
      'Logged out state',
      'Time out',
      'Footer'
    ]
  }
];
</script>

<style scoped>
.vt-tones {
  @apply mt-4 space-y-3;
}
.vt-tone-head {
  @apply mb-1.5 flex items-center justify-between text-xs font-semibold text-ink;
}
.vt-tone-level {
  @apply font-medium text-ink-muted;
}
.vt-footer-label {
  @apply text-xs font-semibold uppercase tracking-wider text-ink-muted;
}
</style>
