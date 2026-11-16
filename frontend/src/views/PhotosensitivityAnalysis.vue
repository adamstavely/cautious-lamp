<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Photosensitivity analysis"
      lead="Analyze video content for photosensitive epileptic risks using EA's IRIS tool. Detect luminance flashes, red saturation flashes, and spatial patterns."
      spot="admin/photosensitivity-analysis"
      size="tool"
    />

    <PageSection>
      <UiPanel title="Upload video for analysis">
        <div class="space-y-6">
          <UiInput v-model="applicationName" label="Application name (optional)" placeholder="Enter application name" />

          <UiFileDropzone
            :file="selectedFile"
            :accept="VIDEO_ACCEPT"
            label="Video file"
            prompt="Drag and drop a video here, or"
            button-label="Browse files"
            icon="clapperboard"
            hint="Supported formats: MP4, AVI, MOV, WebM (max 200MB)"
            @select="handleFileSelect"
            @remove="selectedFile = null"
          />

          <UiCheckbox v-model="enablePatternDetection" label="Enable pattern detection" />

          <UiCallout v-if="irisStatus && !irisStatus.installed" tone="warning" role="status" title="IRIS isn't available on this server">
            {{ irisStatus.message }}
          </UiCallout>

          <UiCallout v-if="busy" tone="warning" role="status" title="The analyzer is busy">{{ busy }}</UiCallout>

          <UiCallout v-if="error" tone="danger" role="alert">{{ error }}</UiCallout>

          <!-- Progress and the outcome, said briefly: an analysis can take minutes -->
          <UiAnnounce :text="progressAnnouncement" />
        </div>

        <template #footer>
          <UiButton
            variant="primary"
            icon="play"
            class="w-full"
            :loading="isAnalyzing"
            :disabled="!selectedFile || irisUnavailable"
            @click="analyzeVideo"
          >
            {{ isAnalyzing ? 'Analyzing...' : 'Analyze video' }}
          </UiButton>
        </template>
      </UiPanel>
    </PageSection>

    <PageSection v-if="analysisResult && analysisResult.summary" id="photosensitivity-results" title="Analysis results" divided>
      <div class="space-y-6">
        <UiCallout v-if="analysisResult.saved === false" tone="warning" role="status" title="This result wasn't saved">
          The analysis finished, but it couldn't be stored, so it won't appear in saved analyses.
          {{ analysisResult.saveError ? `Reason: ${analysisResult.saveError}` : '' }}
        </UiCallout>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UiStat label="Status" :icon="statusIcon" :tone="statusTone">
            <span class="capitalize">{{ analysisResult.summary.status }}</span>
          </UiStat>
          <UiStat
            label="Failures"
            tone="danger"
            :value="analysisResult.summary.luminanceFailures + analysisResult.summary.redFailures + analysisResult.summary.patternFailures"
          />
          <UiStat label="Warnings" tone="warning" :value="analysisResult.summary.luminanceWarnings + analysisResult.summary.redWarnings" />
          <UiStat label="Total frames" tone="accent" :value="analysisResult.summary.totalFrames" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiStat
            label="Luminance failures"
            tone="danger"
            :value="analysisResult.summary.luminanceFailures"
            :hint="`Max transitions: ${analysisResult.summary.maxLuminanceTransitions}`"
          />
          <UiStat
            label="Red saturation failures"
            tone="danger"
            :value="analysisResult.summary.redFailures"
            :hint="`Max transitions: ${analysisResult.summary.maxRedTransitions}`"
          />
          <UiStat label="Pattern failures" tone="danger" :value="analysisResult.summary.patternFailures" />
        </div>
      </div>
    </PageSection>

    <PageSection
      v-if="analysisResult && analysisResult.summary && analysisResult.complianceChecks && analysisResult.complianceChecks.length > 0"
      title="Compliance checks"
      divided
    >
      <ul class="space-y-3">
        <li v-for="check in analysisResult.complianceChecks" :key="check.id">
          <UiCallout :tone="checkTone(check.status)" :title="check.rule">{{ check.message }}</UiCallout>
        </li>
      </ul>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { PageHero, PageSection, PageShell, UiAnnounce, UiButton, UiCallout, UiCheckbox, UiInput, UiPanel, UiStat } from '../components/ui';
import UiFileDropzone from '../components/ui/UiFileDropZone.vue';
import apiClient from '../services/api.js';
import { focusSoon } from '../utils/focusAfterRemoval.js';

// The formats the server accepts (photosensitivity.controller VIDEO_EXTENSIONS)
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];
const VIDEO_ACCEPT = [...VIDEO_TYPES, ...VIDEO_EXTENSIONS].join(',');

const selectedFile = ref(null);
const isAnalyzing = ref(false);
const analysisResult = ref(null);
const error = ref(null);
// Set when the server refused the analysis for now (503 PHOTOSENSITIVITY_BUSY
// or 429 PHOTOSENSITIVITY_QUOTA_EXCEEDED): retryable, so not shown as a failure
const busy = ref(null);
const applicationName = ref('');
const enablePatternDetection = ref(true);
// From GET /photosensitivity/verify: whether IRIS is installed (nothing is run)
const irisStatus = ref(null);
const irisUnavailable = computed(() => irisStatus.value?.installed === false);
const progressAnnouncement = ref('');

onMounted(async () => {
  try {
    irisStatus.value = (await apiClient.get('/api/v1/photosensitivity/verify')).data;
  } catch {
    // Unknown: let the analysis itself report any problem
  }
});

// A file dropped on the zone or chosen with Browse files (the native input is
// cleared by the zone, so the same file can be picked again)
const handleFileSelect = (file) => {
  // A drop skips the input's accept list, so check here too; the server goes by MIME type
  if (file && VIDEO_TYPES.includes(file.type)) {
    selectedFile.value = file;
    error.value = null;
  } else {
    error.value = 'Please choose an MP4, WebM, MOV or AVI video.';
  }
};

const statusTone = computed(() => ({ failure: 'danger', warning: 'warning' })[analysisResult.value?.summary?.status] ?? 'success');
const statusIcon = computed(() => ({ failure: 'circle-x', warning: 'triangle-alert' })[analysisResult.value?.summary?.status] ?? 'circle-check');
const checkTone = (status) => (status === 'pass' ? 'success' : status === 'warning' ? 'warning' : 'danger');

const analyzeVideo = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a video file';
    return;
  }

  isAnalyzing.value = true;
  error.value = null;
  busy.value = null;
  analysisResult.value = null;
  progressAnnouncement.value = 'Uploading video…';

  try {
    const formData = new FormData();
    formData.append('video', selectedFile.value);
    formData.append('enablePatternDetection', enablePatternDetection.value ? 'true' : 'false');
    if (applicationName.value) {
      formData.append('applicationName', applicationName.value);
    }

    // apiClient adds the API key. The multipart Content-Type overrides its
    // JSON default (which would make axios serialise the FormData as JSON);
    // axios then lets the browser set the boundary.
    const response = await apiClient.post('/api/v1/photosensitivity/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // The server gives IRIS up to 10 minutes (IRIS_TIMEOUT_MS), and an
      // admitted video may first wait in its queue (IRIS_MAX_QUEUED)
      timeout: 31 * 60 * 1000,
      onUploadProgress: (event) => {
        if (event.total && event.loaded >= event.total) progressAnnouncement.value = 'Analyzing video…';
      },
    });

    if (!response.data?.summary) {
      throw new Error('The server returned no analysis summary.');
    }
    analysisResult.value = response.data;
    const { summary } = response.data;
    const failures = (summary.luminanceFailures || 0) + (summary.redFailures || 0) + (summary.patternFailures || 0);
    const notSaved = response.data.saved === false ? ' The result was not saved.' : '';
    progressAnnouncement.value = `Analysis complete: ${summary.status}, ${failures} ${failures === 1 ? 'failure' : 'failures'}.${notSaved}`;
    focusSoon('#photosensitivity-results h2');
  } catch (err) {
    const data = err.response?.data;
    const message = data?.message;
    if (data?.code === 'PHOTOSENSITIVITY_BUSY' || data?.code === 'PHOTOSENSITIVITY_QUOTA_EXCEEDED') {
      const seconds = Number(data.retryAfterSeconds) || Number(err.response.headers?.['retry-after']) || null;
      const wait = seconds ? `Try again in ${seconds} seconds.` : 'Try again shortly.';
      progressAnnouncement.value = '';
      busy.value =
        data.code === 'PHOTOSENSITIVITY_QUOTA_EXCEEDED'
          ? `You already have as many analyses running as you're allowed. ${wait}`
          : `The server is analyzing as many videos as it can. Nothing was uploaded. ${wait}`;
      return;
    }
    if (Array.isArray(message)) {
      error.value = message.join(' ');
    } else if (message) {
      error.value = message;
    } else if (err.code === 'ECONNABORTED') {
      error.value = 'The analysis timed out. Try a shorter video.';
    } else if (err.response) {
      error.value = `Analysis failed (HTTP ${err.response.status}).`;
    } else {
      error.value = err.message || 'Failed to analyze video. Make sure IRIS is installed and accessible.';
    }
    progressAnnouncement.value = '';
    console.error('IRIS analysis error:', err);
  } finally {
    isAnalyzing.value = false;
  }
};

</script>
