<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="AI suggestions"
      lead="Paste component code and Claude reviews it against this design system: which components and tokens to use, and what to fix for accessibility. Suggestions only name components and tokens that exist."
      spot="ai/ai-components"
      size="tool"
    />

    <PageSection>
      <UiCallout v-if="configured === false" tone="warning" title="AI suggestions aren't configured" icon="triangle-alert" class="mb-6">
        The backend needs a Claude API key (<UiCode>ANTHROPIC_API_KEY</UiCode>) before it can review code. Ask your administrator to set it up.
      </UiCallout>

      <div class="grid lg:grid-cols-5 gap-6">
        <UiPanel title="Your code" class="lg:col-span-2">
          <div class="space-y-6">
            <UiTextarea
              id="ai-suggestions-code"
              v-model="code"
              label="Component code"
              rows="14"
              mono
              placeholder="Paste a Vue, React or HTML component…"
              :hint="`${code.length.toLocaleString()} / ${MAX_CODE.toLocaleString()} characters`"
              :error="tooLong ? `Paste at most ${MAX_CODE.toLocaleString()} characters.` : ''"
            />
            <UiSegmented v-model="focus" label="Look for" :options="FOCUSES" />
            <InlineNotice :notice="notice" @dismiss="clearNotice" />
          </div>

          <template #footer>
            <UiButton variant="primary" icon="sparkles" class="w-full" :loading="isLoading" :disabled="!canAnalyze" @click="analyze">
              {{ isLoading ? 'Reviewing…' : 'Get suggestions' }}
            </UiButton>
          </template>
        </UiPanel>

        <div class="lg:col-span-3">
          <UiPanel v-if="result" title="Suggestions" :description="result.summary">
            <template #actions>
              <UiButton size="sm" variant="ghost" icon="x" @click="result = null">Clear</UiButton>
            </template>

            <UiEmptyState
              v-if="!result.suggestions.length"
              title="Nothing to change"
              body="Claude found no design system or accessibility changes to suggest for this code."
              :bordered="false"
            />
            <ul v-else class="space-y-6">
              <li v-for="suggestion in result.suggestions" :key="suggestion.id" class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <AppIcon :name="SEVERITY[suggestion.severity].icon" class="text-base text-ink-secondary" />
                  <h3 class="text-base font-semibold text-ink-strong">{{ suggestion.title }}</h3>
                  <UiChip :tone="SEVERITY[suggestion.severity].tone">{{ SEVERITY[suggestion.severity].label }}</UiChip>
                  <UiChip>{{ CATEGORY[suggestion.category] }}</UiChip>
                </div>
                <p class="text-sm text-ink-secondary">{{ suggestion.description }}</p>
                <div v-if="suggestion.components.length || suggestion.tokens.length" class="flex flex-wrap items-center gap-2">
                  <span class="text-sm text-ink-secondary">Use</span>
                  <UiChip v-for="component in suggestion.components" :key="component.id" tone="accent" icon="blocks">{{ component.name }}</UiChip>
                  <UiChip v-for="token in suggestion.tokens" :key="token.name" icon="palette">{{ token.name }}</UiChip>
                </div>
                <UiCodeBlock v-if="suggestion.fix" :code="suggestion.fix" label="Suggested change" />
              </li>
            </ul>

            <template #footer>
              <p class="text-sm text-ink-secondary">
                <template v-if="result.removedReferences.length">
                  Left out {{ result.removedReferences.length === 1 ? 'a name' : `${result.removedReferences.length} names` }}
                  that {{ result.removedReferences.length === 1 ? "isn't" : "aren't" }} in the design system:
                  {{ result.removedReferences.join(', ') }}.
                </template>
                Written by {{ result.model }}. Check suggestions before you use them.
              </p>
            </template>
          </UiPanel>

          <UiPanel v-else-if="isLoading" title="Suggestions">
            <UiSpinner label="Claude is reviewing your code…" />
          </UiPanel>

          <UiEmptyState
            v-else
            title="No suggestions yet"
            body="Paste component code, choose what to look for, then Get suggestions."
            spot="ai/ai-components"
          />
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiCodeBlock,
  UiEmptyState,
  UiPanel,
  UiSegmented,
  UiSpinner,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

/**
 * AI suggestions: POST /ai/suggestions sends the pasted code to Claude with
 * the design system's components and tokens. The backend drops any component
 * or token the model names that doesn't exist, and says which.
 */
const MAX_CODE = 20000;

const FOCUSES = [
  { value: 'general', label: 'Everything' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'components', label: 'Components and tokens' },
  { value: 'patterns', label: 'Patterns' },
];

const SEVERITY = {
  error: { label: 'Fix', tone: 'danger', icon: 'circle-alert' },
  warning: { label: 'Should change', tone: 'warning', icon: 'triangle-alert' },
  info: { label: 'Could improve', tone: 'info', icon: 'info' },
};

const CATEGORY = {
  accessibility: 'Accessibility',
  components: 'Components',
  tokens: 'Tokens',
  patterns: 'Patterns',
  maintainability: 'Maintainability',
};

const { notice, showNotice, clearNotice } = useNotice();
const code = ref('');
const focus = ref('general');
const isLoading = ref(false);
const result = ref(null);
/** null until the status check answers */
const configured = ref(null);

const tooLong = computed(() => code.value.length > MAX_CODE);
const canAnalyze = computed(() => !!code.value.trim() && !tooLong.value && configured.value !== false && !isLoading.value);

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/api/v1/ai/status');
    configured.value = !!data.configured;
  } catch {
    // Unknown: let the person try, and show whatever the suggestions route says
  }
});

const analyze = async () => {
  if (!canAnalyze.value) return;
  isLoading.value = true;
  result.value = null;
  clearNotice();
  try {
    const { data } = await apiClient.post('/api/v1/ai/suggestions', { code: code.value, focus: focus.value }, { timeout: 180000 });
    result.value = data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 503 && /not configured/i.test(message ?? '')) configured.value = false;
    showNotice(
      Array.isArray(message) ? message.join(' ') : message || 'Could not reach the AI suggestions service. Please try again.',
      'error',
    );
  } finally {
    isLoading.value = false;
  }
};
</script>
