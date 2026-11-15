<template>
  <PageShell>
    <PageHero
      eyebrow="Research"
      title="Research repository"
      lead="Journey maps, HCD reports, user studies and insights from teams across the agency, plus the tools we use to measure usability."
      spot="research/research-repo"
    />

    <PageSection title="Browse research" description="Shared from your workspaces, and by teams who made their research public.">
      <div class="grid sm:grid-cols-2 gap-4">
        <UiCard v-for="library in libraries" :key="library.to" :to="library.to" :title="library.title" :spot="library.spot" compact>{{ library.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Research tools" description="Measure and observe how people use what you build." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :spot="tool.spot" compact>{{ tool.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Doing research well" description="Guidance on planning, running and reporting research." divided>
      <UiLinkRow to="/hcd" title="Human-centered design" body="Principles, process, research methods, recruiting, interviewing and the laws of UX." spot="principles/user-centric" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const libraries = [
  { title: 'Journey maps', to: '/research/journey-maps', spot: 'research/journey-maps', body: 'The stages people go through to reach a goal, and where they get stuck.' },
  { title: 'HCD reports', to: '/research/hcd-reports', spot: 'research/hcd-reports', body: 'Usability, accessibility, heuristic and user research reports.' },
  { title: 'User studies', to: '/research/user-studies', spot: 'research/user-studies', body: 'Interviews, surveys, observations and workshops, with their notes and data.' },
  { title: 'Research insights', to: '/research/insights', spot: 'research/research-insights', body: 'User needs, pain points and opportunities, tagged and prioritized.' },
];

const tools = [
  { title: 'User persona generator', to: '/research/user-personas', spot: 'research/user-persona-generator', body: 'Write a structured persona from your research and export it.' },
  { title: 'NASA-TLX', to: '/tools/nasa-tlx', spot: 'research/nasa-tlx', body: 'Score the workload of a task across six dimensions.' },
  { title: 'System Usability Scale', to: '/tools/sus', spot: 'research/system-usability-scale', body: 'Answer ten questions to get a usability score from 0 to 100.' },
  { title: 'Heuristic evaluation', to: '/tools/heuristic-evaluation', spot: 'research/heuristic-evaluation', body: "Rate an interface against Nielsen's ten heuristics by severity." },
  { title: 'Session replay', to: '/hcd/session-replay', spot: 'site/session-replay', body: 'Watch OpenReplay recordings of sessions in your applications.' },
];
</script>
