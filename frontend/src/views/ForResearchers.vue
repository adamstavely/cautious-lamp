<template>
  <PageShell>
    <PageHero
      eyebrow="For researchers"
      title="Research with the system"
      lead="A shared repository for research, tools to measure usability and watch real sessions, and guidance on human-centered design."
      spot="research/for-researchers"
    >
      <template #actions>
        <UiButton to="/research" variant="primary" trailing-icon="arrow-right">Browse research</UiButton>
        <UiButton to="/hcd">HCD guidance</UiButton>
      </template>
    </PageHero>

    <PageSection v-for="(group, i) in groups" :key="group.title" :title="group.title" :description="group.description" :divided="i > 0">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="item in group.items" :key="item.to + item.title" :to="item.to" :title="item.title" :spot="item.spot" compact>{{ item.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const groups = [
  {
    title: 'Research repository',
    description: 'Research kept in workspaces, and shared with the agency when you choose.',
    items: [
      { title: 'Journey maps', to: '/research/journey-maps', spot: 'research/journey-maps', body: 'The stages people go through to reach a goal, and where they get stuck.' },
      { title: 'HCD reports', to: '/research/hcd-reports', spot: 'research/hcd-reports', body: 'Usability, accessibility, heuristic and user research reports.' },
      { title: 'User studies', to: '/research/user-studies', spot: 'research/user-studies', body: 'Interviews, surveys, observations and workshops.' },
      { title: 'Research insights', to: '/research/insights', spot: 'research/research-insights', body: 'Needs, pain points and opportunities, tagged and prioritized.' },
      { title: 'User persona generator', to: '/research/user-personas', spot: 'research/user-persona-generator', body: 'Write a structured persona from your research and export it.' },
    ],
  },
  {
    title: 'Usability tools',
    description: 'Score usability and see what people actually do.',
    items: [
      { title: 'NASA-TLX', to: '/tools/nasa-tlx', spot: 'research/nasa-tlx', body: 'Score the workload of a task across six dimensions.' },
      { title: 'System Usability Scale', to: '/tools/sus', spot: 'research/system-usability-scale', body: 'Ten questions, one usability score from 0 to 100.' },
      { title: 'Heuristic evaluation', to: '/tools/heuristic-evaluation', spot: 'research/heuristic-evaluation', body: "Rate an interface against Nielsen's ten heuristics by severity." },
      { title: 'Session replay', to: '/hcd/session-replay', spot: 'site/session-replay', body: 'Watch OpenReplay recordings of sessions in your applications; heatmaps open in OpenReplay.' },
      { title: 'Photosensitivity analysis', to: '/tools/photosensitivity', spot: 'admin/photosensitivity-analysis', body: 'Check video for flashes and patterns that can trigger seizures, with IRIS.' },
    ],
  },
  {
    title: 'Guidance',
    description: 'How we plan, run and report research.',
    items: [
      { title: 'Human-centered design', to: '/hcd', spot: 'principles/user-centric', body: 'Principles, process, methods, recruiting, interviews and reports.' },
      { title: 'Research methods', to: '/hcd/research-methods', spot: 'research/research-methods', body: 'Which method answers which question, and how many people you need.' },
      { title: 'Accessibility', to: '/hcd/accessibility', spot: 'research/hcd-accessibility', body: 'What Section 508 and WCAG 2.2 require, and how to test for them.' },
      { title: 'Laws of UX', to: '/hcd/laws-of-ux', spot: 'site/laws-of-ux', body: 'Thirty principles from psychology that shape how people use interfaces.' },
    ],
  },
];
</script>
