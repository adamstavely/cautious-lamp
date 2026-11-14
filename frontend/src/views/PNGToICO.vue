<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Image converter"
      lead="Convert images between different formats: PNG to ICO, BMP to PNG, and WebP to PNG/JPG. Supports multiple sizes in ICO files."
      spot="tools/png-to-ico"
      size="tool"
    />

    <PageSection>
      <UiPanel class="mb-6">
        <UiSegmented :model-value="conversionMode" label="Conversion mode" :options="modeOptions" @update:model-value="switchMode" />
      </UiPanel>

      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel :title="getUploadLabel()">
          <div class="space-y-6">
            <UiFileDropzone
              ref="fileInput"
              :file="selectedFile"
              :accept="getAcceptType()"
              :prompt="`Drag and drop ${getFileTypeLabel()} here, or`"
              button-label="Browse files"
              icon="upload"
              hint="Maximum file size: 10MB"
              @select="acceptFile"
              @remove="clearFile"
            />

            <UiSegmented
              v-if="conversionMode === 'webp-to-png' || conversionMode === 'webp-to-jpg'"
              v-model="webpOutputFormat"
              label="Output format"
              :options="conversionMode === 'webp-to-png' ? [{ value: 'png', label: 'PNG' }] : [{ value: 'jpg', label: 'JPG' }]"
            />

            <fieldset v-if="conversionMode === 'png-to-ico'">
              <legend class="text-sm font-medium text-ink-strong mb-3">ICO sizes (select multiple)</legend>
              <div class="grid grid-cols-3 gap-3">
                <UiCheckbox v-for="size in icoSizes" :key="size" v-model="selectedSizes" :value="size" :label="`${size}×${size}`" />
              </div>
            </fieldset>

            <InlineNotice :notice="notice" @dismiss="clearNotice" />
          </div>

          <template #footer>
            <UiButton
              variant="primary"
              icon="download"
              class="w-full"
              :loading="isConverting"
              :disabled="!selectedFile || (conversionMode === 'png-to-ico' && selectedSizes.length === 0)"
              @click="handleConvert()"
            >
              {{ isConverting ? 'Converting...' : getConvertButtonText() }}
            </UiButton>
          </template>
        </UiPanel>

        <UiPanel title="Preview">
          <div v-if="previewUrl" class="space-y-4">
            <div class="flex items-center justify-center p-8 rounded-tile border border-line bg-surface-sunken">
              <img :src="previewUrl" :alt="`Preview of ${selectedFile?.name || 'the chosen image'}`" class="max-w-full max-h-64" />
            </div>
            <dl class="text-sm text-ink-secondary space-y-1">
              <div><dt class="inline font-semibold text-ink">Original size:</dt> <dd class="inline">{{ imageWidth }}×{{ imageHeight }}px</dd></div>
              <div v-if="conversionMode === 'png-to-ico' && selectedSizes.length > 0">
                <dt class="inline font-semibold text-ink">ICO sizes:</dt> <dd class="inline">{{ sortedSizes().map((size) => `${size}×${size}`).join(', ') }}</dd>
              </div>
            </dl>
          </div>
          <UiEmptyState v-else title="No image yet" :body="`Upload ${getFileTypeLabel()} to see preview`" />
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiEmptyState, UiPanel, UiSegmented } from '../components/ui';
import UiFileDropzone from '../components/ui/UiFileDropZone.vue';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
const isConverting = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const imageWidth = ref(0);
const imageHeight = ref(0);
const fileInput = ref(null);
const conversionMode = ref('png-to-ico');
const webpOutputFormat = ref('png');

const modeOptions = [
  { value: 'png-to-ico', label: 'PNG → ICO' },
  { value: 'bmp-to-png', label: 'BMP → PNG' },
  { value: 'webp-to-png', label: 'WebP → PNG' },
  { value: 'webp-to-jpg', label: 'WebP → JPG' },
];

const icoSizes = [16, 32, 48, 64, 128, 256];
const selectedSizes = ref([16, 32, 48]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ICO directory entries are conventionally ordered smallest first.
const sortedSizes = () => [...new Set(selectedSizes.value)].sort((a, b) => a - b);

const switchMode = (mode) => {
  if (conversionMode.value !== mode) {
    conversionMode.value = mode;
    if (mode === 'webp-to-png') {
      webpOutputFormat.value = 'png';
    } else if (mode === 'webp-to-jpg') {
      webpOutputFormat.value = 'jpg';
    }
    clearFile();
  }
};

const getUploadLabel = () => {
  if (conversionMode.value === 'png-to-ico') return 'Upload PNG Image';
  if (conversionMode.value === 'bmp-to-png') return 'Upload BMP Image';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'Upload WebP Image';
  return 'Upload Image';
};

const getAcceptType = () => {
  if (conversionMode.value === 'png-to-ico') return 'image/png';
  if (conversionMode.value === 'bmp-to-png') return 'image/bmp';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'image/webp';
  return 'image/*';
};

const getFileTypeLabel = () => {
  if (conversionMode.value === 'png-to-ico') return 'a PNG';
  if (conversionMode.value === 'bmp-to-png') return 'a BMP';
  if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') return 'a WebP';
  return 'an image';
};

const getConvertButtonText = () => {
  if (conversionMode.value === 'png-to-ico') return 'Convert to ICO';
  if (conversionMode.value === 'bmp-to-png') return 'Convert to PNG';
  if (conversionMode.value === 'webp-to-png') return 'Convert to PNG';
  if (conversionMode.value === 'webp-to-jpg') return 'Convert to JPG';
  return 'Convert';
};

const handleConvert = () => {
  if (conversionMode.value === 'png-to-ico') {
    convertToICO();
  } else if (conversionMode.value === 'bmp-to-png') {
    convertBmpToPng();
  } else if (conversionMode.value === 'webp-to-png' || conversionMode.value === 'webp-to-jpg') {
    convertWebP();
  }
};

const expectedTypeLabel = () =>
  conversionMode.value === 'png-to-ico' ? 'PNG' : conversionMode.value === 'bmp-to-png' ? 'BMP' : 'WebP';

const isValidForMode = (file) => {
  const name = file.name.toLowerCase();
  if (conversionMode.value === 'png-to-ico') {
    return file.type === 'image/png' || name.endsWith('.png');
  }
  if (conversionMode.value === 'bmp-to-png') {
    return ['image/bmp', 'image/x-ms-bmp', 'image/x-bmp'].includes(file.type) || name.endsWith('.bmp');
  }
  return file.type === 'image/webp' || name.endsWith('.webp');
};

const acceptFile = (file) => {
  if (!file) return;
  if (isValidForMode(file)) {
    processFile(file);
  } else {
    showNotice(`Please choose a ${expectedTypeLabel()} image file.`, 'error');
  }
};

const processFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    showNotice('File size must be less than 10MB.', 'error');
    return;
  }

  clearNotice();
  selectedFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    // Ignore a read that finished after another file was chosen.
    if (selectedFile.value !== file) return;
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      if (selectedFile.value !== file) return;
      previewUrl.value = dataUrl;
      imageWidth.value = img.naturalWidth;
      imageHeight.value = img.naturalHeight;
    };
    img.onerror = () => {
      if (selectedFile.value !== file) return;
      clearFile();
      showNotice('That file could not be read as an image.', 'error');
    };
    img.src = dataUrl;
  };
  reader.onerror = () => {
    clearFile();
    showNotice('Could not read the file.', 'error');
  };
  reader.readAsDataURL(file);
};

const clearFile = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  imageWidth.value = 0;
  imageHeight.value = 0;
  fileInput.value?.reset();
};

// "logo.PNG" -> "logo.ico"; a name without an extension gets one appended.
const outputName = (name, extension) => {
  const base = name.replace(/\.[^./\\]+$/, '') || 'image';
  return `${base}.${extension}`;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after the click has been handled, or some browsers cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image'));
    };
    img.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), type, quality);
  });

// Re-encode an image to PNG or JPEG. JPEG has no alpha, so it gets a white
// background instead of transparent pixels turning black.
const reencode = async (file, mimeType, quality) => {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, mimeType, quality);
};

const convertBmpToPng = async () => {
  if (!selectedFile.value) return;
  isConverting.value = true;
  const file = selectedFile.value;
  try {
    const pngBlob = await reencode(file, 'image/png');
    downloadBlob(pngBlob, outputName(file.name, 'png'));
    showNotice('PNG downloaded.', 'success');
  } catch (error) {
    console.error('Conversion error:', error);
    showNotice('Failed to convert the BMP image. Please try another file.', 'error');
  } finally {
    isConverting.value = false;
  }
};

const convertToICO = async () => {
  if (!selectedFile.value || selectedSizes.value.length === 0) {
    return;
  }

  isConverting.value = true;
  const file = selectedFile.value;

  try {
    const icoData = await createICOFile(file, sortedSizes());
    downloadBlob(new Blob([icoData], { type: 'image/x-icon' }), outputName(file.name, 'ico'));
    showNotice('ICO downloaded.', 'success');
  } catch (error) {
    console.error('Conversion error:', error);
    showNotice('Failed to convert the image. Please try another file.', 'error');
  } finally {
    isConverting.value = false;
  }
};

/**
 * Build an ICO file whose images are PNG-encoded (supported since Windows
 * Vista and by every browser).
 *
 * ICONDIR (6 bytes, little-endian): reserved=0, type=1 (icon), count
 * ICONDIRENTRY (16 bytes each): width, height (0 means 256), colorCount=0,
 *   reserved=0, planes=1, bitCount=32, bytesInRes, imageOffset
 * followed by each image's PNG bytes at its offset.
 */
const createICOFile = async (file, sizes) => {
  const img = await loadImage(file);
  const images = [];

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Fit the image inside the square, keeping its aspect ratio (transparent padding).
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const blob = await canvasToBlob(canvas, 'image/png');
    images.push({ size, bytes: new Uint8Array(await blob.arrayBuffer()) });
  }

  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;
  const totalSize = images.reduce((sum, image) => sum + image.bytes.length, offset);

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const out = new Uint8Array(buffer);

  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type (1 = icon)
  view.setUint16(4, images.length, true); // Image count

  images.forEach(({ size, bytes }, index) => {
    const entry = headerSize + index * entrySize;
    view.setUint8(entry, size >= 256 ? 0 : size); // Width
    view.setUint8(entry + 1, size >= 256 ? 0 : size); // Height
    view.setUint8(entry + 2, 0); // Color count (0 = no palette)
    view.setUint8(entry + 3, 0); // Reserved
    view.setUint16(entry + 4, 1, true); // Color planes
    view.setUint16(entry + 6, 32, true); // Bits per pixel
    view.setUint32(entry + 8, bytes.length, true); // Image data size
    view.setUint32(entry + 12, offset, true); // Image data offset
    out.set(bytes, offset);
    offset += bytes.length;
  });

  return buffer;
};

const convertWebP = async () => {
  if (!selectedFile.value) return;
  isConverting.value = true;
  const file = selectedFile.value;
  const toJpeg = conversionMode.value === 'webp-to-jpg' || webpOutputFormat.value === 'jpg';
  try {
    const blob = toJpeg ? await reencode(file, 'image/jpeg', 0.92) : await reencode(file, 'image/png');
    downloadBlob(blob, outputName(file.name, toJpeg ? 'jpg' : 'png'));
    showNotice(`${toJpeg ? 'JPG' : 'PNG'} downloaded.`, 'success');
  } catch (error) {
    console.error('Conversion error:', error);
    showNotice('Failed to convert the WebP image. Please try another file.', 'error');
  } finally {
    isConverting.value = false;
  }
};
</script>
