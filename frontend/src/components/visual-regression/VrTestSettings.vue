<template>
  <UiPanel
    title="Test settings"
    heading-tag="h3"
    description="Used in the generated CI setup: the Playwright config, the screenshot helper and the upload command."
  >
    <form id="vr-test-settings" class="space-y-5" @submit.prevent="save">
      <UiTextarea
        v-model="form.testDirectories"
        label="Test folders"
        :rows="2"
        mono
        hint="One per line, relative to the repository, e.g. tests/visual."
      />
      <fieldset>
        <legend class="mb-2 text-sm font-medium text-ink">Browsers</legend>
        <div class="flex flex-wrap gap-4">
          <UiCheckbox v-for="browser in browserOptions" :key="browser.value" v-model="form.browsers" :value="browser.value" :label="browser.label" />
        </div>
      </fieldset>
      <UiTextarea
        v-model="form.viewports"
        label="Viewports"
        :rows="2"
        mono
        hint="One per line: an Argos preset such as iphone-16 or macbook-13, or a size such as 1280x800."
      />
      <UiTextarea v-model="form.ignorePatterns" label="Screenshots to skip" :rows="2" mono hint="One glob per line, e.g. **/flaky-*.png." />
      <div class="grid gap-4 sm:grid-cols-3 items-end">
        <UiSwitch v-model="form.fullPage" label="Full page" />
        <UiInput v-model="form.waitForSelector" label="Wait for selector" mono placeholder="[data-ready]" />
        <UiInput v-model="form.waitForTimeout" type="number" label="Wait before each screenshot" suffix="ms" min="0" max="60000" />
      </div>
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
    </form>
    <template #footer>
      <div class="flex justify-end">
        <UiButton variant="primary" type="submit" form="vr-test-settings" :loading="saving">{{ saving ? 'Saving…' : 'Save test settings' }}</UiButton>
      </div>
    </template>
  </UiPanel>
</template>

<script setup>
import { ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCheckbox, UiInput, UiPanel, UiSwitch, UiTextarea } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import apiClient from '../../services/api.js';
import { vrErrorMessage } from './vrApi.js';

const props = defineProps({
  project: { type: Object, required: true },
  projectPath: { type: String, required: true },
});
const emit = defineEmits(['saved']);

const browserOptions = [
  { value: 'chromium', label: 'Chromium' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'webkit', label: 'WebKit (Safari)' },
];

const { notice, showNotice, clearNotice } = useNotice();
const saving = ref(false);

const lines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

const fromConfig = (config = {}) => ({
  testDirectories: (config.testDirectories ?? []).join('\n'),
  browsers: [...(config.browsers ?? [])],
  viewports: (config.viewports ?? []).join('\n'),
  ignorePatterns: (config.ignorePatterns ?? []).join('\n'),
  fullPage: !!config.screenshotOptions?.fullPage,
  waitForSelector: config.screenshotOptions?.waitForSelector ?? '',
  waitForTimeout: config.screenshotOptions?.waitForTimeout ?? '',
});

const form = ref(fromConfig(props.project.config));
watch(() => props.project.config, (config) => (form.value = fromConfig(config)));

/** The config as the API takes it, leaving out empty settings */
const toConfig = () => {
  const screenshotOptions = { fullPage: form.value.fullPage };
  if (form.value.waitForSelector.trim()) screenshotOptions.waitForSelector = form.value.waitForSelector.trim();
  if (form.value.waitForTimeout !== '' && form.value.waitForTimeout !== null) screenshotOptions.waitForTimeout = Number(form.value.waitForTimeout);
  return {
    testDirectories: lines(form.value.testDirectories),
    browsers: form.value.browsers,
    viewports: lines(form.value.viewports),
    ignorePatterns: lines(form.value.ignorePatterns),
    screenshotOptions,
  };
};

const save = async () => {
  saving.value = true;
  clearNotice();
  try {
    const { data } = await apiClient.put(props.projectPath, { config: toConfig() });
    showNotice('Test settings saved. The CI setup uses them now.', 'success');
    emit('saved', data);
  } catch (error) {
    showNotice(vrErrorMessage(error, 'The test settings could not be saved.'), 'error');
  } finally {
    saving.value = false;
  }
};

defineExpose({ toConfig });
</script>
