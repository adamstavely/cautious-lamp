<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Alt text generator"
      lead="Generate accessible, descriptive alt text for images to improve web accessibility and SEO. Upload an image and get AI-powered suggestions or write your own."
      spot="tools/alt-text-generator"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Upload image">
          <div class="space-y-6">
            <UiFileDropzone
              ref="fileInput"
              :file="selectedFile"
              accept="image/png,image/jpeg,image/gif,image/webp"
              prompt="Drag and drop an image here, or"
              button-label="Browse files"
              icon="upload"
              hint="Supported formats: JPG, PNG, GIF, WebP (Max 5MB)"
              @select="processFile"
              @remove="clearFile"
            />

            <div>
              <UiTextarea
                id="alt-text-output"
                v-model="altText"
                label="Alt text"
                rows="4"
                class="resize-none"
                placeholder="Enter descriptive alt text for the image..."
                :hint="`${altText.length} / 125 characters (recommended max)`"
              />
              <div v-if="altText" class="mt-2 flex justify-end">
                <UiButton size="sm" variant="ghost" :icon="copied ? 'check' : 'content_copy'" @click="copyAltText">{{ copied ? 'Copied!' : 'Copy' }}</UiButton>
              </div>
            </div>

            <UiInput id="alt-text-context" v-model="context" label="Where the image appears (optional)" maxlength="500" placeholder="e.g. Hero image on the pricing page" />

            <InlineNotice :notice="notice" @dismiss="clearNotice" />
          </div>

          <template #footer>
            <UiButton variant="primary" icon="auto_awesome" class="w-full" :loading="isGenerating" :disabled="!selectedFile" @click="generateAltText">
              {{ isGenerating ? 'Generating...' : 'Generate alt text' }}
            </UiButton>
          </template>
        </UiPanel>

        <UiPanel title="Best practices">
          <ul class="space-y-4">
            <li v-for="tip in bestPractices" :key="tip.title" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">check_circle</span>
              <div>
                <p class="text-sm font-medium text-ink-strong mb-1">{{ tip.title }}</p>
                <p class="text-sm text-ink-secondary">{{ tip.body }}</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">check_circle</span>
              <div>
                <p class="text-sm font-medium text-ink-strong mb-1">Decorative images</p>
                <p class="text-sm text-ink-secondary">Use empty alt text (<UiCode>alt=""</UiCode>) for purely decorative images.</p>
              </div>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCode, UiInput, UiPanel, UiTextarea } from '../components/ui';
import UiFileDropzone from '../components/ui/UiFileDropZone.vue';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const { notice, showNotice, clearNotice } = useNotice();
const isGenerating = ref(false);
const selectedFile = ref(null);
const altText = ref('');
const context = ref('');
const copied = ref(false);
const fileInput = ref(null);

const bestPractices = [
  { title: 'Be descriptive', body: 'Describe the image content and context, not just what it looks like.' },
  { title: 'Keep it concise', body: 'Aim for 125 characters or less. Be specific but brief.' },
  { title: 'Avoid redundancy', body: 'Don\'t start with "Image of" or "Picture of" - screen readers announce images automatically.' },
  { title: 'Include context', body: 'Mention important details like text, people, actions, or emotions if relevant.' },
];

const processFile = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) {
    showNotice('Please choose a PNG, JPEG, GIF or WebP image.', 'error');
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    showNotice('Images must be 5MB or smaller.', 'error');
    return;
  }
  clearNotice();
  selectedFile.value = file;
  altText.value = '';
};

const clearFile = () => {
  selectedFile.value = null;
  altText.value = '';
  clearNotice();
  fileInput.value?.reset();
};

const generateAltText = async () => {
  if (!selectedFile.value) {
    return;
  }

  isGenerating.value = true;
  clearNotice();
  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);
    if (context.value.trim()) formData.append('context', context.value.trim());

    const { data } = await apiClient.post('/api/v1/alt-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    altText.value = data.altText;
    if (data.altText) {
      showNotice('Alt text generated. Check it reads well in context before using it.', 'success');
    } else {
      showNotice('This image looks decorative, so it should have empty alt text (alt="").', 'info');
    }
  } catch (error) {
    const message = error.response?.data?.message;
    showNotice(
      Array.isArray(message) ? message.join(' ') : message || 'Could not reach the alt text service. You can still write alt text by hand.',
      'error',
    );
  } finally {
    isGenerating.value = false;
  }
};

const copyAltText = async () => {
  if (!altText.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(altText.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    showNotice('Copy failed. Select the text and copy it manually.', 'error');
  }
};

</script>
