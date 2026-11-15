<template>
  <PageShell>
    <PageHero :back="{ to: '/patterns', label: 'Patterns' }" :title="guide.title" :lead="guide.lead" :spot="guide.spot" size="tool">
      <template #actions>
        <UiButton variant="primary" icon="code" to="/patterns/toast-notification">Toast code</UiButton>
        <UiButton icon="code" to="/patterns/accessible-modal">Modal code</UiButton>
      </template>
    </PageHero>

    <PageSection title="Which notification should I use?" description="Answer a few questions about your message to get a recommendation.">
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <UiPanel title="Your message" heading-tag="h3">
          <div class="flex flex-col gap-6">
            <UiSegmented
              v-for="(step, index) in steps"
              :key="step.node"
              :model-value="step.answer"
              :label="`${index + 1}. ${TREE[step.node].question}`"
              :options="ANSWERS"
              @update:model-value="(answer) => answer && choose(index, answer)"
            />
          </div>
          <template v-if="steps.length > 1 || outcome" #footer>
            <UiButton size="sm" variant="ghost" icon="rotate-ccw" @click="reset">Start over</UiButton>
          </template>
        </UiPanel>

        <UiCallout v-if="outcome" tone="success" :title="`Use a ${outcome.name.toLowerCase()}`" :icon="outcome.icon" role="status">
          {{ outcome.summary }}
        </UiCallout>
        <UiCallout v-else tone="info" title="Keep going">Answer the question on the left; the recommendation appears here.</UiCallout>
      </div>
    </PageSection>

    <PageSection title="The full decision tree" description="Every path through the questions above." divided>
      <ol class="tree">
        <li>
          <p class="tree-question">Does the user need to act on it?</p>
          <ul class="tree-branches">
            <li>
              <span class="tree-answer">Yes</span>
              <p class="tree-question">Do they need to act before doing anything else?</p>
              <ul class="tree-branches">
                <li><span class="tree-answer">Yes</span> <UiChip tone="accent" icon="maximize">Modal</UiChip></li>
                <li><span class="tree-answer">No</span> <UiChip tone="accent" icon="megaphone">Banner</UiChip></li>
              </ul>
            </li>
            <li>
              <span class="tree-answer">No</span>
              <p class="tree-question">Does it report the status of something they did?</p>
              <ul class="tree-branches">
                <li><span class="tree-answer">Yes</span> <UiChip tone="accent" icon="bell">Toast</UiChip></li>
                <li>
                  <span class="tree-answer">No</span>
                  <p class="tree-question">Is it an alert: a problem or a warning?</p>
                  <ul class="tree-branches">
                    <li>
                      <span class="tree-answer">Yes</span>
                      <p class="tree-question">Can it be safely dismissed?</p>
                      <ul class="tree-branches">
                        <li><span class="tree-answer">Yes</span> <UiChip tone="accent" icon="bell">Toast</UiChip></li>
                        <li><span class="tree-answer">No</span> <UiChip tone="accent" icon="megaphone">Banner</UiChip></li>
                      </ul>
                    </li>
                    <li><span class="tree-answer">No</span> <UiChip tone="accent" icon="message-circle">Dialog</UiChip></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
    </PageSection>

    <PageSection title="The four components" description="What each one is for, and what it looks like." divided>
      <div class="grid md:grid-cols-2 gap-6">
        <UiPanel v-for="item in OUTCOME_LIST" :key="item.id" :title="item.name" :description="item.summary" heading-tag="h3">
          <!-- A sketch of the component -->
          <div class="note-example" aria-hidden="true">
            <div v-if="item.id === 'modal' || item.id === 'dialog'" class="note-dialog" :class="{ 'note-dialog-blocking': item.id === 'modal' }">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-ink-strong">{{ item.id === 'modal' ? 'Delete this project?' : 'Keyboard shortcuts' }}</span>
                <AppIcon name="x" class="text-ink-muted" />
              </div>
              <p class="text-sm text-ink-secondary mb-3">{{ item.id === 'modal' ? "You can't undo this." : 'Press ? at any time to see this list.' }}</p>
              <div class="flex justify-end gap-2">
                <span class="note-pill">{{ item.id === 'modal' ? 'Cancel' : 'Close' }}</span>
                <span v-if="item.id === 'modal'" class="note-pill note-pill-danger">Delete</span>
              </div>
            </div>
            <div v-else-if="item.id === 'banner'" class="note-banner">
              <AppIcon name="triangle-alert" class="shrink-0" />
              <span class="flex-1">3 invoices are overdue</span>
              <span class="font-medium underline underline-offset-4">Review</span>
            </div>
            <div v-else class="note-toast">
              <AppIcon name="circle-check" class="shrink-0 text-success" />
              <span class="flex-1">Your changes are saved</span>
              <AppIcon name="x" class="text-ink-muted" />
            </div>
          </div>

          <h4 class="mt-5 mb-2 text-sm font-semibold text-ink-strong">Use it when</h4>
          <ul class="practice-list">
            <li v-for="use in item.uses" :key="use">
              <AppIcon name="check" class="practice-icon" />
              <span>{{ use }}</span>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Accessibility" divided>
      <ul class="practice-list max-w-3xl">
        <li v-for="item in ACCESSIBILITY" :key="item">
          <AppIcon name="accessibility" class="practice-icon" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </PageSection>

    <PageSection title="Related patterns" description="Patterns and code for building these notifications." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in related" :key="card.to" :to="card.to" :title="card.title" :spot="card.spot" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCard, UiChip, UiPanel, UiSegmented } from '../components/ui';
import { guideForSlug, relatedCards } from '../data/patternGuides.js';

/** Notification patterns: a decision helper and tree for choosing a modal, banner, toast or dialog */
const guide = guideForSlug('notifications');
const related = relatedCards(guide.related);

const OUTCOMES = {
  modal: {
    id: 'modal',
    name: 'Modal',
    icon: 'maximize',
    summary: 'Blocks the page until the user responds. For actions they must take, or confirm, before carrying on.',
    uses: ['A destructive action needs confirming', 'Something needs the user’s attention right now', 'They can’t continue until they respond'],
  },
  banner: {
    id: 'banner',
    name: 'Banner',
    icon: 'megaphone',
    summary: 'Stays at the top of the page or section until the problem is resolved or dismissed. For action that isn’t urgent.',
    uses: ['Action is needed, but not this second', 'Several errors or alerts need attention', 'The message must stay until it’s resolved'],
  },
  toast: {
    id: 'toast',
    name: 'Toast',
    icon: 'bell',
    summary: 'Appears briefly without interrupting. For status updates and alerts that are safe to miss or dismiss.',
    uses: ['Confirming that something worked', 'An alert that can safely be dismissed', 'No action is needed'],
  },
  dialog: {
    id: 'dialog',
    name: 'Dialog',
    icon: 'message-circle',
    summary: 'Shows extra information or a non-critical choice, and can be closed without acting.',
    uses: ['Showing more detail on request', 'Non-critical choices or settings', 'It is neither an alert nor a status update'],
  },
};
const OUTCOME_LIST = [OUTCOMES.modal, OUTCOMES.banner, OUTCOMES.toast, OUTCOMES.dialog];

// Each question leads to another question or to a component
const TREE = {
  action: { question: 'Does the user need to act on it?', yes: 'immediate', no: 'status' },
  immediate: { question: 'Do they need to act before doing anything else?', yes: 'modal', no: 'banner' },
  status: { question: 'Does it report the status of something they did?', yes: 'toast', no: 'alert' },
  alert: { question: 'Is it an alert: a problem or a warning?', yes: 'dismiss', no: 'dialog' },
  dismiss: { question: 'Can it be safely dismissed?', yes: 'toast', no: 'banner' },
};
const ANSWERS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const steps = ref([{ node: 'action', answer: null }]);
const outcome = ref(null);

/** Answering a question drops any later answers that depended on it */
const choose = (index, answer) => {
  const kept = steps.value.slice(0, index + 1).map((step, i) => (i === index ? { ...step, answer } : step));
  const next = TREE[kept[index].node][answer];
  outcome.value = OUTCOMES[next] ?? null;
  steps.value = outcome.value ? kept : [...kept, { node: next, answer: null }];
};

const reset = () => {
  steps.value = [{ node: 'action', answer: null }];
  outcome.value = null;
};

const ACCESSIBILITY = [
  'Announce notifications through a live region: role="status" for updates, role="alert" for problems that need attention now.',
  'Move focus into a modal when it opens and back to the trigger when it closes; leave focus alone for toasts and banners.',
  'Use the right role for each component: dialog for modals and dialogs, and a landmark or region for persistent banners.',
  'Pair colour with an icon and words; never show severity by colour alone.',
  'Make every notification dismissible from the keyboard, and let Escape close modals and dialogs.',
  'Give auto-dismissing toasts at least five seconds, and never auto-dismiss errors.',
];
</script>

<style scoped>
.tree {
  @apply max-w-3xl text-ink;
}
.tree-question {
  @apply font-medium text-ink-strong;
}
.tree-branches {
  @apply mt-3 ml-2 pl-5 border-l-2 border-line flex flex-col gap-4;
}
.tree-branches > li {
  @apply flex flex-wrap items-center gap-x-3 gap-y-2;
}
.tree-branches > li > .tree-question,
.tree-branches > li > .tree-branches {
  @apply basis-full;
}
.tree-answer {
  @apply text-sm font-semibold uppercase tracking-wider text-ink-muted;
}
.note-example {
  @apply rounded-tile border border-line bg-surface-sunken p-4;
}
.note-dialog {
  @apply rounded-tile border border-line bg-surface-raised p-4 shadow-raised;
}
.note-dialog-blocking {
  @apply shadow-overlay;
}
.note-banner {
  @apply flex items-center gap-3 rounded-control border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning;
}
.note-toast {
  @apply flex items-center gap-3 rounded-tile border border-line bg-surface-raised px-4 py-3 text-sm text-ink shadow-raised;
}
.note-pill {
  @apply rounded-pill border border-line-control px-3 py-1 text-xs font-medium text-ink;
}
.note-pill-danger {
  @apply border-danger-border bg-danger-solid text-ink-on-accent;
}
.practice-list {
  @apply flex flex-col gap-3 text-ink;
}
.practice-list li {
  @apply flex items-start gap-3;
}
.practice-icon {
  @apply mt-0.5 shrink-0 text-lg text-accent-text;
}
</style>
