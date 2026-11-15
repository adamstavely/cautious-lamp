<template>
  <PageShell>
    <PageHero
      eyebrow="Human-centered design"
      title="Human-centered design"
      lead="How we design with the people who use our services: the principles and process we follow, how we run research, and the laws of UX behind good interfaces."
      spot="principles/user-centric"
    />

    <PageSection title="How we work" description="The principles, process and people behind human-centered design at the agency.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="page in howWeWork" :key="page.to" :to="page.to" :title="page.title" :spot="page.spot" compact>{{ page.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Doing research" description="Planning a study, finding participants, running sessions and reporting what you learned." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="page in research" :key="page.to" :to="page.to" :title="page.title" :spot="page.spot" compact>{{ page.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Research libraries and tools" description="Shared research from teams across the agency, and tools to measure usability." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="page in libraries" :key="page.to" :to="page.to" :title="page.title" :body="page.body" :spot="page.spot" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const howWeWork = [
  { title: 'HCD principles', to: '/hcd/principles', spot: 'research/hcd-principles', body: 'Six principles for designing with the people who use our services.' },
  { title: 'HCD process', to: '/hcd/process', spot: 'research/hcd-process', body: 'Discover, define, develop and deliver, and how they fit agency delivery.' },
  { title: 'HCD council', to: '/hcd/council', spot: 'research/hcd-council', body: 'The cross-agency group that reviews work and helps teams apply HCD.' },
  { title: 'Accessibility', to: '/hcd/accessibility', spot: 'research/hcd-accessibility', body: 'What Section 508 and WCAG 2.2 require, and how to design and test for them.' },
  { title: 'Laws of UX', to: '/hcd/laws-of-ux', spot: 'site/laws-of-ux', body: 'Thirty principles from psychology that shape how people use interfaces.' },
];

const research = [
  { title: 'User research', to: '/hcd/research', spot: 'research/hcd-research', body: 'Why and how we do user research, and running it ethically.' },
  { title: 'Research methods', to: '/hcd/research-methods', spot: 'research/research-methods', body: 'Which method answers which question, and how many people you need.' },
  { title: 'Recruiting users', to: '/hcd/recruiting-users', spot: 'research/recruiting-users', body: 'Finding participants, the Paperwork Reduction Act, incentives and consent.' },
  { title: 'Conducting interviews', to: '/hcd/conducting-interviews', spot: 'research/conducting-interviews', body: 'Discussion guides and questions that get honest answers.' },
  { title: 'Research reports', to: '/hcd/research-reports', spot: 'research/research-reports', body: 'Writing findings people act on, with severity, privacy and sharing.' },
];

const libraries = [
  { title: 'Research repository', to: '/research', spot: 'research/research-repo', body: 'Studies, reports, insights and journey maps.' },
  { title: 'Session replay', to: '/hcd/session-replay', spot: 'site/session-replay', body: 'Watch recorded sessions from your applications.' },
  { title: 'NASA-TLX', to: '/tools/nasa-tlx', spot: 'research/nasa-tlx', body: 'Score the workload of a task.' },
  { title: 'System Usability Scale', to: '/tools/sus', spot: 'research/system-usability-scale', body: 'Ten questions, one usability score.' },
  { title: 'Heuristic evaluation', to: '/tools/heuristic-evaluation', spot: 'research/heuristic-evaluation', body: "Review an interface against Nielsen's heuristics." },
  { title: 'User persona generator', to: '/research/user-personas', spot: 'research/user-persona-generator', body: 'Write a persona from your research.' },
];
</script>
