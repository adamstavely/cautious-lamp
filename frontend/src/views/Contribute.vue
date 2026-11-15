<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Contribute"
      lead="Help us build and improve the design system. Whether you’re contributing components, patterns, documentation, or feedback, your contributions make the system better for everyone."
      spot="site/contribute"
    />

    <PageSection title="Ways to contribute" description="Every part of the system takes contributions.">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="way in ways" :key="way.title">
          <AppIcon :name="way.icon" class="way-icon" />
          <h3 class="way-title">{{ way.title }}</h3>
          <p class="mb-3">{{ way.body }}</p>
          <ul class="bullets">
            <li v-for="item in way.items" :key="item">{{ item }}</li>
          </ul>
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Contribution process" description="From proposal to release in five steps." divided>
      <ol class="steps">
        <li v-for="step in steps" :key="step.title" class="step">
          <div class="min-w-0">
            <h3 class="step-title">{{ step.title }}</h3>
            <p>{{ step.body }}</p>
            <ul v-if="step.items" class="bullets mt-2">
              <li v-for="item in step.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </PageSection>

    <PageSection title="Contribution guidelines" description="The standards every contribution is reviewed against." divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiCard v-for="guideline in guidelines" :key="guideline.title" :title="guideline.title">
          <ul class="bullets">
            <li v-for="item in guideline.items" :key="item">{{ item }}</li>
          </ul>
        </UiCard>
      </div>
    </PageSection>

    <PageSection
      title="Submit a contribution"
      description="Pick a template, add your files, and open a pull request for the design system team to review."
      divided
    >
      <UiCallout v-if="!canSubmit" tone="info" icon="lock">
        Submitting a contribution needs permission to create components. Ask a design system manager for the contributor role.
      </UiCallout>
      <template v-else>
        <UiCallout v-if="setupError" tone="warning" icon="circle-alert" role="alert">{{ setupError }}</UiCallout>
        <UiCallout v-else-if="setup && setup.configured" tone="info" icon="git-pull-request">
          Pull requests open in <strong>{{ setup.repository }}</strong>, against
          {{ setup.baseBranch ? `the ${setup.baseBranch} branch` : 'its default branch' }}.
        </UiCallout>
        <UiCallout v-else-if="setup" tone="warning" icon="circle-alert">
          GitHub isn't set up on this server, so no pull request will be opened. You'll get the pull request text to paste into your repository instead.
        </UiCallout>

        <form class="contribution-form" novalidate @submit.prevent="submit">
          <UiSelect
            v-model="form.templateId"
            label="Template"
            :options="templateOptions"
            placeholder="Choose a template"
            :hint="selectedTemplate ? selectedTemplate.description : ''"
            :error="errors.templateId"
            required
          />
          <UiInput v-model="form.title" label="Pull request title" :hint="selectedTemplate ? `Leave empty for “${selectedTemplate.template.title}”` : ''" />
          <UiTextarea v-model="form.description" label="Description" :rows="4" hint="What the contribution adds or changes, and why." />

          <fieldset class="files">
            <legend class="files-legend">Files</legend>
            <p class="files-hint">Paths are relative to the repository root, for example src/components/Chip.vue.</p>
            <div v-for="(file, index) in form.files" :key="file.key" class="file">
              <div class="file-head">
                <UiInput v-model="file.path" :label="`File ${index + 1} path`" mono :error="errors.files[index]" />
                <UiButton
                  variant="ghost"
                  icon="trash-2"
                  icon-only
                  :label="`Remove file ${index + 1}`"
                  :disabled="form.files.length === 1"
                  @click="removeFile(index)"
                />
              </div>
              <UiTextarea v-model="file.content" :label="`File ${index + 1} content`" :rows="8" mono />
            </div>
            <div>
              <UiButton icon="plus" :disabled="form.files.length >= MAX_FILES" @click="addFile">Add a file</UiButton>
            </div>
          </fieldset>

          <UiCallout v-if="submitError" tone="danger" icon="circle-alert" role="alert">{{ submitError }}</UiCallout>
          <div>
            <UiButton type="submit" variant="primary" icon="git-pull-request" :loading="submitting">
              {{ setup && setup.configured ? 'Open pull request' : 'Generate pull request text' }}
            </UiButton>
          </div>
        </form>

        <div v-if="result" class="result" aria-live="polite">
          <UiCallout v-if="result.pullRequestOpened" tone="success" icon="circle-check" title="Pull request opened" role="status">
            <p>{{ result.message }}</p>
            <UiLink :href="result.pullRequest.url" external arrow>View pull request #{{ result.pullRequest.number }} on GitHub</UiLink>
          </UiCallout>
          <UiCallout v-else tone="info" icon="info" role="status">{{ result.message }}</UiCallout>
          <UiCodeBlock :code="result.prTemplate" label="Pull request text (Markdown)" />
        </div>
      </template>
    </PageSection>

    <PageSection title="Need help?" divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiPanel title="Questions?" heading-tag="h3">
          <p class="text-ink-secondary">
            Have questions about contributing? Not sure where to start? Reach out to the design system team or start a discussion in our contribution forum.
          </p>
          <div>
            <UiButton variant="primary" to="/getting-started/get-in-touch" trailing-icon="arrow-right">Contact the team</UiButton>
          </div>
        </UiPanel>
        <UiPanel title="Resources" heading-tag="h3">
          <ul class="flex flex-col gap-3">
            <li v-for="resource in resources" :key="resource.to">
              <UiLink :to="resource.to" arrow>{{ resource.label }}</UiLink>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { AppIcon, PageHero, PageSection, PageShell, UiButton, UiCallout, UiCard, UiCodeBlock, UiInput, UiLink, UiPanel, UiSelect, UiTextarea } from '../components/ui';
import { useAuth } from '../composables/useAuth.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/*
 * Submitting a contribution (POST /api/v1/contribution-workflow/templates/:id/generate-pr,
 * component:create): the server commits the files on a new branch and opens a
 * pull request when GitHub is set up, and otherwise returns the text to paste.
 */
const API = '/api/v1/contribution-workflow';
const MAX_FILES = 50;
const PATH_PATTERN = /^(?!\.git(?:hub)?\/)(?!.*\/\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[A-Za-z0-9._@+-]([A-Za-z0-9._@+\-/]*[A-Za-z0-9._@+-])?$/;

const { hasPermission } = useAuth();
const canSubmit = computed(() => hasPermission('component:create'));

const templates = ref([]);
const setup = ref(null);
const setupError = ref('');
let nextKey = 0;
const newFile = () => ({ key: nextKey++, path: '', content: '' });
const form = reactive({ templateId: '', title: '', description: '', files: [newFile()] });
const errors = reactive({ templateId: '', files: [] });
const submitting = ref(false);
const submitError = ref('');
const result = ref(null);

const templateOptions = computed(() => templates.value.map((t) => ({ value: t.id, label: t.name })));
const selectedTemplate = computed(() => templates.value.find((t) => t.id === form.templateId));

const addFile = () => form.files.push(newFile());
const removeFile = (index) => form.files.splice(index, 1);

onMounted(async () => {
  if (!canSubmit.value) return;
  try {
    const [templateList, setupInfo] = await Promise.all([apiClient.get(`${API}/templates`), apiClient.get(`${API}/pull-requests/setup`)]);
    templates.value = templateList.data;
    setup.value = setupInfo.data;
  } catch (error) {
    setupError.value = apiErrorMessage(error, 'The contribution templates could not be loaded.');
  }
});

function validate() {
  errors.templateId = form.templateId ? '' : 'Choose a template';
  const seen = new Set();
  errors.files = form.files.map((file) => {
    const path = file.path.trim();
    const blank = !path && !file.content;
    if (blank && form.files.length === 1) return '';
    if (!PATH_PATTERN.test(path)) return 'Enter a path inside the repository, such as src/components/Chip.vue (not under .git or .github)';
    if (seen.has(path)) return 'This path is already listed';
    seen.add(path);
    return '';
  });
  return !errors.templateId && errors.files.every((message) => !message);
}

async function submit() {
  submitError.value = '';
  if (!validate()) return;
  submitting.value = true;
  try {
    const files = form.files.filter((file) => file.path.trim()).map((file) => ({ path: file.path.trim(), content: file.content }));
    const body = {
      ...(form.title.trim() ? { title: form.title.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(files.length ? { files } : {}),
    };
    const { data } = await apiClient.post(`${API}/templates/${encodeURIComponent(form.templateId)}/generate-pr`, body);
    result.value = data;
  } catch (error) {
    submitError.value = apiErrorMessage(error, 'The contribution could not be submitted.');
  } finally {
    submitting.value = false;
  }
}

const ways = [
  {
    title: 'Components',
    icon: 'blocks',
    body: 'Propose new components or improve existing ones. Make sure they follow our design principles, accessibility standards, and component patterns.',
    items: ['New component proposals', 'Component enhancements', 'Bug fixes and improvements', 'Accessibility improvements'],
  },
  {
    title: 'Design tokens',
    icon: 'swatch-book',
    body: 'Contribute new design tokens, update existing ones, or propose changes to our token structure. All tokens must follow DTCG standards.',
    items: ['New color, spacing, or typography tokens', 'Token value updates', 'Token structure improvements', 'Token documentation'],
  },
  {
    title: 'Patterns',
    icon: 'layout-template',
    body: 'Share design patterns, layouts, and interaction patterns that solve common problems. Document use cases and best practices.',
    items: ['New design patterns', 'Pattern documentation', 'Use case examples', 'Pattern improvements'],
  },
  {
    title: 'Documentation',
    icon: 'book-open',
    body: 'Improve documentation, add examples, fix typos, or clarify guidelines. Great documentation helps everyone use the system effectively.',
    items: ['Documentation improvements', 'Code examples and demos', 'Guideline clarifications', 'Translation and localization'],
  },
  {
    title: 'Feedback and issues',
    icon: 'message-square-warning',
    body: 'Report bugs, suggest improvements, or request new features. Your feedback helps us prioritize and improve the system.',
    items: ['Bug reports', 'Feature requests', 'Usability feedback', 'Accessibility issues'],
  },
  {
    title: 'Tools and resources',
    icon: 'wrench',
    body: 'Contribute new tools, improve existing ones, or create resources that help teams work more effectively with the design system.',
    items: ['New design tools', 'CLI improvements', 'SDK enhancements', 'Integration examples'],
  },
];

const steps = [
  {
    title: 'Propose your contribution',
    body: 'Before starting work, create an issue or discussion to propose your contribution. This helps ensure alignment with design system goals and prevents duplicate work. Include:',
    items: ['Description of the contribution', 'Use case or problem it solves', 'Design mockups or examples (if applicable)', 'Any questions or concerns'],
  },
  {
    title: 'Get feedback and approval',
    body: 'Wait for feedback from the design system team and other contributors. Address questions, incorporate suggestions, and get approval before proceeding with implementation.',
  },
  {
    title: 'Create your contribution',
    body: 'Follow our contribution guidelines:',
    items: [
      'Follow design principles and accessibility standards',
      'Use existing design tokens and patterns',
      'Write comprehensive documentation',
      'Include examples and use cases',
      'Ensure code quality and test coverage',
    ],
  },
  {
    title: 'Submit for review',
    body: 'Create a pull request with your contribution. Include a clear description, a link to the original issue, and any relevant screenshots or examples. The design system team will review your contribution and provide feedback.',
  },
  {
    title: 'Iterate and merge',
    body: 'Address review feedback, make requested changes, and work with reviewers until your contribution is ready. Once approved, it will be merged into the design system and released.',
  },
];

const guidelines = [
  {
    title: 'Code standards',
    items: [
      'Follow our coding style guide and conventions',
      'Write clean, maintainable, and well-documented code',
      'Include unit tests and integration tests',
      'Ensure all tests pass before submitting',
      'Follow semantic versioning for breaking changes',
    ],
  },
  {
    title: 'Design standards',
    items: [
      'Adhere to our design principles and themes',
      'Use existing design tokens (colors, spacing, typography)',
      'Ensure WCAG 2.1 AA accessibility compliance',
      'Follow component patterns and conventions',
      'Provide design mockups and specifications',
    ],
  },
  {
    title: 'Documentation standards',
    items: [
      'Write clear, concise documentation',
      'Include usage examples and code snippets',
      'Document props, APIs, and configuration options',
      'Provide accessibility notes and considerations',
      'Include migration guides for breaking changes',
    ],
  },
  {
    title: 'Review process',
    items: [
      'All contributions require review and approval',
      'Be responsive to feedback and questions',
      'Address all review comments before merging',
      'Maintain a respectful and collaborative tone',
      'Be patient: reviews may take time',
    ],
  },
];

const resources = [
  { label: 'Design principles', to: '/getting-started/principles' },
  { label: 'Best practices', to: '/getting-started/best-practices' },
  { label: 'Component library', to: '/components' },
  { label: 'Design tokens', to: '/tokens' },
];
</script>

<style scoped>
.way-icon {
  @apply mb-3 text-2xl text-accent-text;
}
.way-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.bullets {
  @apply flex flex-col gap-1.5 pl-5 list-disc;
}

/* Numbered steps: the counter sits in an accent disc beside each step */
.steps {
  @apply flex flex-col gap-4 leading-relaxed text-ink-secondary;
  counter-reset: step;
}
.step {
  @apply flex gap-4 rounded-card border border-line bg-surface-raised p-6;
  counter-increment: step;
}
.step::before {
  @apply flex-none grid place-items-center w-9 h-9 rounded-pill bg-accent text-sm font-semibold text-ink-on-accent;
  content: counter(step);
}
.step-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}

.contribution-form {
  @apply mt-6 flex flex-col gap-5 max-w-3xl;
}
.files {
  @apply flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-6;
}
.files-legend {
  @apply px-1 text-base font-semibold text-ink-strong;
}
.files-hint {
  @apply -mt-2 text-sm text-ink-secondary;
}
.file {
  @apply flex flex-col gap-3;
}
.file + .file {
  @apply border-t border-line pt-4;
}
.file-head {
  @apply flex items-end gap-2;
}
.file-head > :first-child {
  @apply flex-1 min-w-0;
}
.result {
  @apply mt-6 flex flex-col gap-4 max-w-3xl;
}
</style>
