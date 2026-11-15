<template>
  <div class="space-y-6">
    <UiCallout tone="info" title="Builds come from your CI">
      Argos creates a build when screenshots are uploaded, so runs can't be started from here. Add these files and
      commands to the repository's CI with <UiCode>ARGOS_TOKEN</UiCode> set; each upload shows up under Test runs.
    </UiCallout>

    <UiSpinner v-if="loading" label="Loading CI setup…" class="py-8" />
    <InlineNotice v-else-if="notice" :notice="notice" @dismiss="clearNotice" />

    <template v-else-if="setup">
      <p class="text-sm text-ink-secondary">
        <template v-if="setup.reference.kind === 'commit'">
          Builds are compared against the baseline “{{ setup.reference.baselineName }}”, commit
          <span class="font-code">{{ setup.reference.commit.slice(0, 7) }}</span>.
        </template>
        <template v-else>
          Builds are compared against the latest approved build on <span class="font-code">{{ setup.reference.branch }}</span>.
          Record a baseline to compare against a fixed build instead.
        </template>
      </p>
      <UiCodeBlock :code="setup.playwrightConfig" label="playwright.config.ts" />
      <UiCodeBlock :code="setup.screenshotHelper" label="tests/argos.ts" />
      <UiCodeBlock :code="setup.uploadCommand" label="Upload step (after the tests)" />
      <UiCodeBlock v-if="setup.notifyCommand" :code="setup.notifyCommand" label="Build notification (after the upload)" />
      <p v-else class="text-sm text-ink-secondary">
        New builds appear the next time runs are listed. Set a build notification secret in Settings to have CI report each upload at once.
      </p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiCallout, UiCode, UiCodeBlock, UiSpinner } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import apiClient from '../../services/api.js';
import { vrErrorMessage } from './vrApi.js';

/** The CI setup generated from the project's test settings and current baseline */
const props = defineProps({
  projectPath: { type: String, required: true },
  /** Changes when settings or the baseline change, to reload */
  version: { type: [String, Number], default: '' },
});

const { notice, showNotice, clearNotice } = useNotice();
const setup = ref(null);
const loading = ref(false);

const load = async () => {
  loading.value = true;
  clearNotice();
  try {
    setup.value = (await apiClient.get(`${props.projectPath}/ci-setup`)).data;
  } catch (error) {
    setup.value = null;
    showNotice(vrErrorMessage(error, 'The CI setup could not be loaded.'), 'error');
  } finally {
    loading.value = false;
  }
};

watch(() => [props.projectPath, props.version], load);
onMounted(load);
</script>
