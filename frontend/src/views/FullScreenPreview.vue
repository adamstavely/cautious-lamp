<template>
  <div class="fullscreen-preview">
    <PreviewFrame
      v-if="state === 'ready'"
      :url="previewUrl"
      :review-id="reviewId"
      :version-id="versionId"
      :content-type="contentType"
      :sync-annotations="false"
      read-only
      fill
    />
    <div v-else class="flex h-full items-center justify-center">
      <UiSpinner v-if="state === 'loading'" :label="message" />
      <div v-else class="flex flex-col items-center gap-4 px-6 text-center" :role="state === 'error' ? 'alert' : 'status'">
        <SpotArt :name="state === 'password' ? 'site/building-trust' : 'site/not-found'" size="lg" />
        <p class="text-ink">{{ message }}</p>
        <UiButton v-if="state === 'error'" variant="primary" icon="refresh" @click="load()">Try again</UiButton>
        <UiButton v-else-if="state === 'password' && !showPasswordPrompt" variant="primary" icon="lock_open" @click="showPasswordPrompt = true">Enter password</UiButton>
      </div>
    </div>

    <PasswordPrompt
      v-model="showPasswordPrompt"
      :error="passwordError"
      :loading="passwordSubmitting"
      @submit="submitPassword"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import PreviewFrame from '../components/review-ui/PreviewFrame.vue';
import PasswordPrompt from '../components/review-ui/PasswordPrompt.vue';
import { SpotArt, UiButton, UiSpinner } from '../components/ui';
import {
  reviewAPI,
  reviewPasswords,
  isPasswordRequired,
  errorStatus,
  apiErrorMessage,
} from '../services/api.js';

const route = useRoute();
const reviewId = computed(() => String(route.params.id || ''));

// 'loading' | 'ready' | 'password' | 'error'
const state = ref('loading');
const errorMessage = ref('');
const previewUrl = ref('');
const contentType = ref(null);
const versionId = ref('');
const showPasswordPrompt = ref(false);
const passwordError = ref('');
const passwordSubmitting = ref(false);

const message = computed(() => {
  if (state.value === 'loading') return 'Loading preview...';
  if (state.value === 'password') return 'This review is password protected.';
  return errorMessage.value;
});

let loadToken = 0;

const load = async ({ password } = {}) => {
  const id = reviewId.value;
  const token = ++loadToken;
  state.value = 'loading';

  try {
    const review = password !== undefined ? await reviewAPI.getReview(id, password) : await reviewAPI.getReview(id);
    if (token !== loadToken) return;
    if (password) reviewPasswords.set(id, password);
    showPasswordPrompt.value = false;
    passwordError.value = '';
    if (review.filename) document.title = `${review.filename} - Design Review`;

    // ?version=<id>, else the latest version; URL reviews without versions show their link
    const versions = review.versions || [];
    const requested = typeof route.query.version === 'string' ? route.query.version : '';
    const version = versions.find((v) => v.id === requested) || versions[versions.length - 1];

    if (version) {
      const url = await reviewAPI.getVersion(id, version.id);
      if (token !== loadToken) return;
      versionId.value = version.id;
      contentType.value = version.contentType || null;
      previewUrl.value = url;
    } else if (review.sourceType === 'url' && review.url) {
      versionId.value = '';
      contentType.value = null;
      previewUrl.value = review.url;
    } else {
      errorMessage.value = 'This review has no file to preview yet.';
      state.value = 'error';
      return;
    }
    state.value = 'ready';
  } catch (error) {
    if (token !== loadToken) return;
    if (isPasswordRequired(error)) {
      reviewPasswords.clear(id);
      passwordError.value = password ? 'That password is not correct.' : '';
      state.value = 'password';
      showPasswordPrompt.value = true;
      return;
    }
    console.error('Failed to load preview:', error);
    const status = errorStatus(error);
    errorMessage.value = status === 403
      ? "This review hasn't been shared with you."
      : apiErrorMessage(error, 'Failed to load the preview.');
    state.value = 'error';
  }
};

const submitPassword = async (password) => {
  passwordSubmitting.value = true;
  try {
    await load({ password });
  } finally {
    passwordSubmitting.value = false;
  }
};

watch([reviewId, () => route.query.version], () => load(), { immediate: true });
</script>

<style scoped>
/* Fills the window: this route has no app frame */
.fullscreen-preview {
  @apply fixed inset-0 h-screen w-screen overflow-hidden bg-surface;
}
</style>
