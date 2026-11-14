<template>
  <div class="flex flex-col gap-4">
    <!-- Governance -->
    <section class="capability">
      <UiCheckbox v-model="model.governance.enabled"><span class="capability-title">Design system governance</span></UiCheckbox>
      <div v-if="model.governance.enabled" class="flex flex-col gap-5">
        <UiSelect v-model="model.governance.scanSchedule" label="Scan schedule" :options="scheduleOptions" />
        <fieldset class="flex flex-col gap-3">
          <legend class="text-sm font-medium text-ink-strong">Rules</legend>
          <p class="text-xs text-ink-muted">Leave all unticked to run every enabled rule.</p>
          <UiCallout v-if="rulesError" tone="warning">{{ rulesError }}</UiCallout>
          <fieldset v-for="(rules, category) in rulesByCategory" :key="category" class="flex flex-col gap-2">
            <legend class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{{ categoryLabel(category) }}</legend>
            <div class="grid sm:grid-cols-2 gap-2">
              <UiCheckbox v-for="rule in rules" :key="rule.id" v-model="model.governance.rules" :value="rule.id" :label="rule.name" />
            </div>
          </fieldset>
        </fieldset>
      </div>
    </section>

    <!-- Visual Regression -->
    <section class="capability">
      <UiCheckbox v-model="model.visualRegression.enabled"><span class="capability-title">Visual regression testing</span></UiCheckbox>
      <div v-if="model.visualRegression.enabled" class="grid md:grid-cols-2 gap-5">
        <UiInput v-model="model.visualRegression.argosProjectId" label="Argos project ID" required maxlength="200" />
        <UiInput v-model="model.visualRegression.argosBranch" label="Branch" maxlength="200" pattern="[A-Za-z0-9._\/\-]+" placeholder="main" />
        <UiInput
          v-model="model.visualRegression.argosBaseUrl"
          type="url"
          label="Argos URL"
          placeholder="https://app.argos-ci.com"
          hint="Must be on the server's allowed list (ARGOS_ALLOWED_BASE_URLS)."
        />
        <UiInput
          v-model="model.visualRegression.argosToken"
          type="password"
          label="Argos token"
          autocomplete="off"
          :placeholder="model.visualRegression.linked ? 'Unchanged' : ''"
          hint="Stored encrypted with the visual-regression project; never shown again."
        />
      </div>
    </section>

    <!-- Session Replay -->
    <section class="capability">
      <UiCheckbox v-model="model.sessionReplay.enabled"><span class="capability-title">Session replay</span></UiCheckbox>
      <div v-if="model.sessionReplay.enabled" class="flex flex-col gap-5">
        <div class="grid md:grid-cols-2 gap-5">
          <UiInput v-model="model.sessionReplay.openreplayProjectKey" label="OpenReplay project key" required maxlength="200" />
          <UiInput
            v-model="model.sessionReplay.openreplayBaseUrl"
            type="url"
            label="OpenReplay base URL"
            placeholder="https://api.openreplay.com"
            hint="Must be a public address, or one the server allows (OPENREPLAY_ALLOWED_BASE_URLS)."
          />
          <UiInput
            v-model="model.sessionReplay.openreplayApiKey"
            type="password"
            label="OpenReplay API key"
            autocomplete="off"
            :placeholder="model.sessionReplay.linked ? 'Unchanged' : 'Optional'"
          />
        </div>
        <fieldset class="flex flex-col gap-2">
          <legend class="mb-1 text-sm font-medium text-ink-strong">Privacy settings</legend>
          <UiCheckbox v-for="option in privacyOptions" :key="option.key" v-model="model.sessionReplay.privacySettings[option.key]" :label="option.label" />
        </fieldset>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { UiCallout, UiCheckbox, UiInput, UiSelect } from '../ui';
import apiClient, { apiErrorMessage } from '../../services/api.js';

/** Edits the object from capabilitiesForm() in place (v-model) */
const model = defineModel({ type: Object, required: true });

const scheduleOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];
const privacyOptions = [
  { key: 'maskAllInputs', label: 'Mask all inputs' },
  { key: 'maskAllText', label: 'Mask all text' },
  { key: 'respectDoNotTrack', label: 'Respect Do Not Track' },
];

const rules = ref([]);
const rulesError = ref(null);
const rulesByCategory = computed(() =>
  rules.value.reduce((groups, rule) => {
    (groups[rule.category] ??= []).push(rule);
    return groups;
  }, {}),
);
const categoryLabel = (category) => ({ 'design-system': 'Design system', 'ux-hcd': 'UX / HCD', accessibility: 'Accessibility' })[category] ?? category;

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/api/v1/governance/rules');
    rules.value = (data?.rules ?? []).filter((rule) => rule.enabled);
  } catch (error) {
    rulesError.value = apiErrorMessage(error, 'The rule list could not be loaded; every enabled rule will run.');
  }
});
</script>

<style scoped>
.capability {
  @apply flex flex-col gap-5 rounded-tile border border-line bg-surface-sunken p-5;
}
.capability-title {
  @apply text-base font-semibold text-ink-strong;
}
</style>
