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
            accept="video/*"
            label="Video file"
            prompt="Drag and drop a video here, or"
            button-label="Browse files"
            icon="video_library"
            hint="Supported formats: MP4, AVI, MOV, WebM (max 500MB)"
            @select="handleFileSelect"
            @remove="selectedFile = null"
          />

          <UiCheckbox v-model="enablePatternDetection" label="Enable pattern detection" />

          <UiCallout v-if="irisStatus && !irisStatus.installed" tone="warning" role="status" title="IRIS isn't available on this server">
            {{ irisStatus.message }}
          </UiCallout>

          <UiCallout v-if="error" tone="danger" role="alert">{{ error }}</UiCallout>
        </div>

        <template #footer>
          <UiButton
            variant="primary"
            icon="play_arrow"
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

    <PageSection v-if="analysisResult && analysisResult.summary" title="Analysis results" divided>
      <div class="space-y-6" role="status">
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
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCheckbox, UiInput, UiPanel, UiStat } from '../components/ui';
import UiFileDropzone from '../components/ui/UiFileDropZone.vue';
import apiClient from '../services/api.js';

const selectedFile = ref(null);
const isAnalyzing = ref(false);
const analysisResult = ref(null);
const error = ref(null);
const applicationName = ref('');
const enablePatternDetection = ref(true);
// From GET /photosensitivity/verify: whether IRIS is installed (nothing is run)
const irisStatus = ref(null);
const irisUnavailable = computed(() => irisStatus.value?.installed === false);

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
  if (file && file.type.startsWith('video/')) {
    selectedFile.value = file;
    error.value = null;
  } else {
    error.value = 'Please choose a valid video file';
  }
};

const statusTone = computed(() => ({ failure: 'danger', warning: 'warning' })[analysisResult.value?.summary?.status] ?? 'success');
const statusIcon = computed(() => ({ failure: 'cancel', warning: 'warning' })[analysisResult.value?.summary?.status] ?? 'check_circle');
const checkTone = (status) => (status === 'pass' ? 'success' : status === 'warning' ? 'warning' : 'danger');

const analyzeVideo = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a video file';
    return;
  }

  isAnalyzing.value = true;
  error.value = null;
  analysisResult.value = null;

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
      // The server gives IRIS up to 10 minutes (IRIS_TIMEOUT_MS), plus the upload
      timeout: 11 * 60 * 1000,
    });

    if (!response.data?.summary) {
      throw new Error('The server returned no analysis summary.');
    }
    analysisResult.value = response.data;
  } catch (err) {
    const message = err.response?.data?.message;
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
    console.error('IRIS analysis error:', err);
  } finally {
    isAnalyzing.value = false;
  }
};

</script>
