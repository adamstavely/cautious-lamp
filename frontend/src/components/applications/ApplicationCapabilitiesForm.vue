<template>
  <div class="space-y-6">
    <!-- Governance -->
    <div class="p-4 rounded-lg border" :class="c.subCard">
      <label class="flex items-center gap-3">
        <input v-model="model.governance.enabled" type="checkbox" class="w-5 h-5 accent-indigo-600" />
        <span class="text-lg font-semibold" :class="c.heading">Design System Governance</span>
      </label>
      <div v-if="model.governance.enabled" class="mt-4 space-y-4">
        <div>
          <div class="block text-sm font-medium mb-2" :class="c.label">Scan Schedule</div>
          <Dropdown
            v-model="model.governance.scanSchedule"
            :options="[
              { value: 'manual', label: 'Manual' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ]"
            :is-dark-mode="isDarkMode"
          />
        </div>
        <div>
          <div class="block text-sm font-medium mb-1" :class="c.label">Rules</div>
          <p class="text-xs mb-2" :class="c.muted">Leave all unticked to run every enabled rule.</p>
          <p v-if="rulesError" class="text-xs" :class="c.muted">{{ rulesError }}</p>
          <div v-for="(rules, category) in rulesByCategory" :key="category" class="mb-3">
            <div class="text-xs font-semibold uppercase tracking-wide mb-1" :class="c.faint">{{ categoryLabel(category) }}</div>
            <div class="grid sm:grid-cols-2 gap-1">
              <label v-for="rule in rules" :key="rule.id" class="flex items-center gap-2 text-sm" :class="c.text">
                <input v-model="model.governance.rules" type="checkbox" :value="rule.id" class="accent-indigo-600" />
                {{ rule.name }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visual Regression -->
    <div class="p-4 rounded-lg border" :class="c.subCard">
      <label class="flex items-center gap-3">
        <input v-model="model.visualRegression.enabled" type="checkbox" class="w-5 h-5 accent-indigo-600" />
        <span class="text-lg font-semibold" :class="c.heading">Visual Regression Testing</span>
      </label>
      <div v-if="model.visualRegression.enabled" class="mt-4 grid md:grid-cols-2 gap-3">
        <div>
          <label :for="`${uid}-argos-project`" class="block text-sm font-medium mb-2" :class="c.label">Argos Project ID *</label>
          <input :id="`${uid}-argos-project`" v-model="model.visualRegression.argosProjectId" type="text" required maxlength="200" :class="[inputClass, c.input]" />
        </div>
        <div>
          <label :for="`${uid}-argos-branch`" class="block text-sm font-medium mb-2" :class="c.label">Branch</label>
          <input
            :id="`${uid}-argos-branch`"
            v-model="model.visualRegression.argosBranch"
            type="text"
            maxlength="200"
            pattern="[A-Za-z0-9._\/\-]+"
            placeholder="main"
            :class="[inputClass, c.input]"
          />
        </div>
        <div>
          <label :for="`${uid}-argos-url`" class="block text-sm font-medium mb-2" :class="c.label">Argos URL</label>
          <input :id="`${uid}-argos-url`" v-model="model.visualRegression.argosBaseUrl" type="url" placeholder="https://app.argos-ci.com" :class="[inputClass, c.input]" />
          <p class="text-xs mt-1" :class="c.faint">Must be on the server's allowed list (ARGOS_ALLOWED_BASE_URLS).</p>
        </div>
        <div>
          <label :for="`${uid}-argos-token`" class="block text-sm font-medium mb-2" :class="c.label">Argos Token</label>
          <input
            :id="`${uid}-argos-token`"
            v-model="model.visualRegression.argosToken"
            type="password"
            autocomplete="off"
            :placeholder="model.visualRegression.linked ? 'Unchanged' : ''"
            :class="[inputClass, c.input]"
          />
          <p class="text-xs mt-1" :class="c.faint">Stored encrypted with the visual-regression project; never shown again.</p>
        </div>
      </div>
    </div>

    <!-- Session Replay -->
    <div class="p-4 rounded-lg border" :class="c.subCard">
      <label class="flex items-center gap-3">
        <input v-model="model.sessionReplay.enabled" type="checkbox" class="w-5 h-5 accent-indigo-600" />
        <span class="text-lg font-semibold" :class="c.heading">Session Replay</span>
      </label>
      <div v-if="model.sessionReplay.enabled" class="mt-4 space-y-3">
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label :for="`${uid}-or-key`" class="block text-sm font-medium mb-2" :class="c.label">OpenReplay Project Key *</label>
            <input :id="`${uid}-or-key`" v-model="model.sessionReplay.openreplayProjectKey" type="text" required maxlength="200" :class="[inputClass, c.input]" />
          </div>
          <div>
            <label :for="`${uid}-or-url`" class="block text-sm font-medium mb-2" :class="c.label">OpenReplay Base URL</label>
            <input :id="`${uid}-or-url`" v-model="model.sessionReplay.openreplayBaseUrl" type="url" placeholder="https://api.openreplay.com" :class="[inputClass, c.input]" />
            <p class="text-xs mt-1" :class="c.faint">Must be a public address, or one the server allows (OPENREPLAY_ALLOWED_BASE_URLS).</p>
          </div>
          <div>
            <label :for="`${uid}-or-api`" class="block text-sm font-medium mb-2" :class="c.label">OpenReplay API Key</label>
            <input
              :id="`${uid}-or-api`"
              v-model="model.sessionReplay.openreplayApiKey"
              type="password"
              autocomplete="off"
              :placeholder="model.sessionReplay.linked ? 'Unchanged' : 'Optional'"
              :class="[inputClass, c.input]"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="block text-sm font-medium" :class="c.label">Privacy Settings</div>
          <label v-for="option in privacyOptions" :key="option.key" class="flex items-center gap-2">
            <input v-model="model.sessionReplay.privacySettings[option.key]" type="checkbox" class="accent-indigo-600" />
            <span class="text-sm" :class="c.text">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Dropdown from '../Dropdown.vue';
import apiClient, { apiErrorMessage } from '../../services/api.js';
import { inputClass, ui } from '../workspaces/ui.js';

/** Edits the object from capabilitiesForm() in place (v-model) */
const model = defineModel({ type: Object, required: true });
const props = defineProps({
  isDarkMode: { type: Boolean, default: false },
});

const uid = `cap${Math.random().toString(36).slice(2, 8)}`;
const c = computed(() => ui(props.isDarkMode));
const privacyOptions = [
  { key: 'maskAllInputs', label: 'Mask All Inputs' },
  { key: 'maskAllText', label: 'Mask All Text' },
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
