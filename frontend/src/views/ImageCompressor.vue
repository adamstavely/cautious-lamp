<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Image compressor"
      lead="Compress PNG, JPG, and GIF images to reduce file size while maintaining quality. Perfect for optimizing images for web use."
      spot="tools/image-compressor"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Upload image">
          <div class="space-y-6">
            <UiFileDropzone
              ref="fileInput"
              :file="selectedFile"
              accept="image/png,image/jpeg,image/gif"
              prompt="Drag and drop an image here, or"
              button-label="Browse files"
              icon="upload"
              hint="Supports PNG, JPG, GIF (Max: 10MB)"
              @select="handleSelect"
              @remove="clearFile"
            />

            <div v-if="selectedFile" class="space-y-6">
              <UiRange
                v-model="compressionQuality"
                label="Quality"
                unit="%"
                :min="10"
                :max="100"
                :step="5"
                :hint="`${compressionQuality >= 80 ? 'High' : compressionQuality >= 50 ? 'Medium' : 'Low'}. Lower makes a smaller file, higher a larger one.`"
              />
              <div class="grid grid-cols-2 gap-4">
                <UiInput v-model="maxWidth" type="number" label="Max width" suffix="px" min="100" max="10000" step="100" placeholder="Original" />
                <UiInput v-model="maxHeight" type="number" label="Max height" suffix="px" min="100" max="10000" step="100" placeholder="Original" />
              </div>
              <UiCheckbox v-model="maintainAspectRatio" label="Maintain aspect ratio" />
            </div>

            <InlineNotice :notice="notice" @dismiss="clearNotice" />
          </div>

          <template #footer>
            <UiButton variant="primary" icon="compress" class="w-full" :loading="isCompressing" :disabled="!selectedFile" @click="compressImage">
              {{ isCompressing ? 'Compressing...' : 'Compress image' }}
            </UiButton>
          </template>
        </UiPanel>

        <UiPanel title="Preview and results">
          <div v-if="previewUrl" class="space-y-4">
            <div class="flex items-center justify-center p-8 rounded-tile border border-line bg-surface-sunken">
              <img :src="previewUrl" :alt="`Preview of ${selectedFile?.name || 'the chosen image'}`" class="max-w-full max-h-64" />
            </div>

            <dl v-if="compressedSize > 0" class="rounded-tile border border-line bg-surface-sunken p-4 space-y-2 text-sm" aria-live="polite">
              <div class="flex items-center justify-between">
                <dt class="text-ink-secondary">Original size:</dt>
                <dd class="font-medium text-ink-strong">{{ formatFileSize(selectedFile?.size || 0) }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-ink-secondary">Compressed size:</dt>
                <dd class="font-medium text-success">{{ formatFileSize(compressedSize) }}</dd>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-line">
                <dt class="font-semibold text-ink-strong">Reduction:</dt>
                <dd v-if="compressionPercentage >= 0" class="font-semibold text-success">
                  {{ compressionPercentage }}% ({{ formatFileSize((selectedFile?.size || 0) - compressedSize) }} saved)
                </dd>
                <dd v-else class="font-semibold text-warning">
                  {{ -compressionPercentage }}% larger ({{ formatFileSize(compressedSize - (selectedFile?.size || 0)) }} more)
                </dd>
              </div>
            </dl>

            <p class="text-sm text-ink-secondary"><strong class="text-ink">Dimensions:</strong> {{ imageWidth }}×{{ imageHeight }}px</p>

            <UiButton v-if="compressedBlob" variant="primary" icon="download" class="w-full" @click="downloadCompressed">Download compressed image</UiButton>
          </div>
          <UiEmptyState v-else title="No image yet" body="Upload an image to see preview and compression results" />
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiEmptyState, UiInput, UiPanel, UiRange } from '../components/ui';
import UiFileDropzone from '../components/ui/UiFileDropZone.vue';
import { useNotice } from '../composables/useNotice.js';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

const { notice, showNotice, clearNotice } = useNotice();
const isCompressing = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const imageWidth = ref(0);
const imageHeight = ref(0);
const fileInput = ref(null);
const compressionQuality = ref(80);
const maxWidth = ref(null);
const maxHeight = ref(null);
const maintainAspectRatio = ref(true);
const compressedBlob = ref(null);
const compressedSize = ref(0);
// Bumped whenever the selected file changes, so late async results for an old
// file (FileReader, image decode, toBlob) are ignored.
let fileToken = 0;

const compressionPercentage = computed(() => {
  if (!selectedFile.value || compressedSize.value === 0 || !selectedFile.value.size) return 0;
  const originalSize = selectedFile.value.size;
  const reduction = ((originalSize - compressedSize.value) / originalSize) * 100;
  return Math.round(reduction);
});

const isAcceptedImage = (file) => ACCEPTED_TYPES.includes(file.type);

// A file dropped on the zone or chosen with Browse files
const handleSelect = (file) => {
  if (!file) return;
  if (isAcceptedImage(file)) {
    processFile(file);
  } else {
    showNotice('Please choose a PNG, JPG, or GIF image file.', 'error');
    fileInput.value?.reset();
  }
};

const processFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    showNotice('File size must be less than 10MB.', 'error');
    return;
  }

  clearNotice();
  const token = ++fileToken;
  selectedFile.value = file;
  compressedBlob.value = null;
  compressedSize.value = 0;
  imageWidth.value = 0;
  imageHeight.value = 0;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (token !== fileToken) return;
    previewUrl.value = e.target.result;

    const img = new Image();
    img.onload = () => {
      if (token !== fileToken) return;
      imageWidth.value = img.naturalWidth;
      imageHeight.value = img.naturalHeight;
    };
    img.onerror = () => {
      if (token !== fileToken) return;
      showNotice('That file could not be read as an image.', 'error');
      clearFile();
    };
    img.src = e.target.result;
  };
  reader.onerror = () => {
    if (token !== fileToken) return;
    showNotice('That file could not be read.', 'error');
  };
  reader.readAsDataURL(file);
};

const clearFile = () => {
  fileToken++;
  selectedFile.value = null;
  previewUrl.value = null;
  imageWidth.value = 0;
  imageHeight.value = 0;
  compressedBlob.value = null;
  compressedSize.value = 0;
  isCompressing.value = false;
  fileInput.value?.reset();
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/** A positive pixel limit from a number input, or null when empty/0/negative/invalid. */
const positiveLimit = (value) => {
  const n = Number(value);
  return value !== '' && value !== null && Number.isFinite(n) && n > 0 ? n : null;
};

const targetDimensions = (width, height) => {
  const limitW = positiveLimit(maxWidth.value);
  const limitH = positiveLimit(maxHeight.value);

  if (maintainAspectRatio.value) {
    const scale = Math.min(1, limitW ? limitW / width : 1, limitH ? limitH / height : 1);
    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
    };
  }
  return {
    width: Math.max(1, Math.round(limitW ? Math.min(width, limitW) : width)),
    height: Math.max(1, Math.round(limitH ? Math.min(height, limitH) : height)),
  };
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });

const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const compressImage = async () => {
  if (!selectedFile.value || isCompressing.value) return;

  const file = selectedFile.value;
  const token = fileToken;
  isCompressing.value = true;
  clearNotice();
  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);
    const { width, height } = targetDimensions(img.naturalWidth, img.naturalHeight);

    // Canvas can't encode GIF, and PNG ignores the quality setting. JPEG is used
    // for JPEG input, and for PNG/GIF input below 80% quality (lossy); otherwise
    // PNG (lossless) is kept.
    const mimeType = file.type === 'image/jpeg' || compressionQuality.value < 80 ? 'image/jpeg' : 'image/png';
    const quality = Math.min(1, Math.max(0.1, compressionQuality.value / 100));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    if (mimeType === 'image/jpeg') {
      // JPEG has no alpha: paint transparent areas white rather than black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    const result = await canvasToBlob(canvas, mimeType, quality);
    if (!result) throw new Error('Canvas produced no output');
    const dataUrl = await readAsDataUrl(result);
    if (token !== fileToken) return;

    compressedBlob.value = result;
    compressedSize.value = result.size;
    previewUrl.value = dataUrl;
    imageWidth.value = width;
    imageHeight.value = height;

    if (file.type !== result.type) {
      showNotice(`Converted to ${EXTENSIONS[result.type]?.toUpperCase() || result.type} for compression.`, 'info');
    } else if (result.size >= file.size) {
      showNotice('The compressed image is not smaller than the original. Try a lower quality or smaller dimensions.', 'warning');
    }
  } catch (error) {
    console.error('Compression error:', error);
    if (token === fileToken) showNotice('Failed to compress image. Please try again.', 'error');
  } finally {
    URL.revokeObjectURL(url);
    if (token === fileToken) isCompressing.value = false;
  }
};

const downloadCompressed = () => {
  if (!compressedBlob.value || !selectedFile.value) return;

  const url = URL.createObjectURL(compressedBlob.value);
  const a = document.createElement('a');
  a.href = url;
  const originalName = selectedFile.value.name.replace(/\.[^/.]+$/, '') || 'image';
  const extension = EXTENSIONS[compressedBlob.value.type] || 'img';
  a.download = `${originalName}-compressed.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after the click has been handled so the download isn't cancelled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
</script>
