<template>
  <div class="webviewer-container" :class="{ 'preview-fill': fill }">
    <!-- Nothing selected yet -->
    <div v-if="mode === 'empty'" class="preview-placeholder">
      <p class="text-ink-muted">No document to display</p>
    </div>

    <!-- Not an http(s) URL: never put it in an iframe -->
    <div v-else-if="mode === 'invalid'" class="preview-placeholder" role="alert">
      <span class="material-symbols-outlined preview-placeholder-icon" aria-hidden="true">error</span>
      <p class="font-medium text-ink-strong">This link can't be previewed</p>
      <p class="max-w-md text-center text-sm text-ink-secondary">Only http and https links can be shown here.</p>
    </div>

    <!-- External website -->
    <iframe
      v-else-if="mode === 'web'"
      :src="safeUrl"
      :sandbox="IFRAME_SANDBOX"
      referrerpolicy="no-referrer"
      title="Design preview"
      class="preview-iframe"
    ></iframe>

    <!-- PDF or image in WebViewer -->
    <template v-else>
      <div v-show="!loadError" ref="viewer" class="webviewer"></div>
      <div v-if="loadError" class="preview-placeholder preview-placeholder-error" role="alert">
        <span class="material-symbols-outlined preview-placeholder-icon" aria-hidden="true">error</span>
        <p class="font-medium text-ink-strong">Unable to load document</p>
        <p class="max-w-md text-center text-sm text-ink-secondary">
          The document could not be opened in the viewer. It may have failed to download, or the link may have expired.
          <UiLink :href="safeUrl" external>Open it in a new tab</UiLink>.
        </p>
        <iframe
          :src="safeUrl"
          :sandbox="IFRAME_SANDBOX"
          referrerpolicy="no-referrer"
          title="Document preview"
          class="preview-fallback-iframe"
        ></iframe>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import WebViewer from '@pdftron/webviewer';
import { createAnnotationSync } from '../../services/annotationSync.js';
import { getCurrentUser } from '../../mockData.js';
import { UiLink } from '../ui';

const props = defineProps({
  url: String,
  reviewId: String,
  // Version shown, used to scope annotation comments
  versionId: String,
  // MIME type of the file, from the version; without it the URL's extension is used
  contentType: String,
  readOnly: {
    type: Boolean,
    default: false,
  },
  // Load and save annotations as comments. Off for side-by-side comparison frames.
  syncAnnotations: {
    type: Boolean,
    default: true,
  },
  // Fill the parent's height (full-screen preview) instead of the default viewer height
  fill: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['annotations-changed']);

// No allow-same-origin: framed pages must not reach this app's storage or cookies.
const IFRAME_SANDBOX = 'allow-scripts allow-forms allow-popups';
const LOAD_TIMEOUT_MS = 20000;

const DOCUMENT_TYPES = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const parseUrl = (value) => {
  try {
    return new URL(value, window.location.href);
  } catch {
    return null;
  }
};

// The URL as an absolute http(s) URL, or null for anything else (javascript:, data:, ...)
const safeUrl = computed(() => {
  if (!props.url) return null;
  const parsed = parseUrl(props.url);
  return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed.toString() : null;
});

// File extension for WebViewer, or null when the URL should be shown as a web page
const documentExtension = computed(() => {
  if (props.contentType) {
    return DOCUMENT_TYPES[props.contentType.split(';')[0].trim().toLowerCase()] || null;
  }
  if (!safeUrl.value) return null;
  const match = new URL(safeUrl.value).pathname.toLowerCase().match(/\.(pdf|png|jpe?g|gif|webp|svg)$/);
  if (!match) return null;
  return match[1] === 'jpeg' ? 'jpg' : match[1];
});

const mode = computed(() => {
  if (!props.url) return 'empty';
  if (!safeUrl.value) return 'invalid';
  return documentExtension.value ? 'document' : 'web';
});

const viewer = ref(null);
const loadError = ref(false);

let instance = null;
let documentViewer = null;
let annotationManager = null;
let sync = null;
let initPromise = null;
let viewerGeneration = 0; // bumped on dispose so a slow WebViewer() call knows it's stale
let showRun = 0; // bumped per document load so stale loads are ignored
let loadTimeout = null;
let documentLoaded = false;
let unmounted = false;

const clearLoadTimeout = () => {
  clearTimeout(loadTimeout);
  loadTimeout = null;
};

const syncContext = () => ({ reviewId: props.reviewId, versionId: props.versionId });

const loadAnnotations = async () => {
  if (!sync || !props.syncAnnotations || !props.reviewId || !documentLoaded) return;
  try {
    await sync.load();
  } catch (error) {
    console.error('Failed to load annotations:', error);
  }
};

// WebViewer event handlers (named so they can be removed)
const onDocumentLoaded = () => {
  clearLoadTimeout();
  documentLoaded = true;
  loadError.value = false;
  loadAnnotations();
};

const onLoadError = (error) => {
  console.error('WebViewer could not load the document:', error);
  clearLoadTimeout();
  loadError.value = true;
};

const onAnnotationChanged = (annotations, action, info) => {
  if (!sync || !props.syncAnnotations || props.readOnly) return;
  sync.handleChange(annotations, action, info);
};

const applyReadOnly = () => {
  if (!annotationManager) return;
  if (props.readOnly) annotationManager.enableReadOnlyMode();
  else annotationManager.disableReadOnlyMode();
};

const createViewer = async (element) => {
  const generation = viewerGeneration;
  const created = await WebViewer(
    {
      path: '/lib',
      enableAnnotations: true,
      fullAPI: true,
      enableFilePicker: false,
    },
    element
  );

  // Disposed (unmount, or switched to a web page) while WebViewer was starting
  if (generation !== viewerGeneration || unmounted) {
    created.UI.dispose();
    return null;
  }

  instance = created;
  documentViewer = created.Core.documentViewer;
  annotationManager = created.Core.annotationManager;

  annotationManager.setCurrentUser(getCurrentUser().name);
  applyReadOnly();

  sync = createAnnotationSync({
    annotationManager,
    getContext: syncContext,
    onChange: (event) => emit('annotations-changed', event),
  });

  documentViewer.addEventListener('documentLoaded', onDocumentLoaded);
  annotationManager.addEventListener('annotationChanged', onAnnotationChanged);
  created.UI.addEventListener(created.UI.Events.LOAD_ERROR, onLoadError);
  return created;
};

const ensureViewer = (element) => {
  if (!initPromise) {
    initPromise = createViewer(element).catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
};

const disposeViewer = () => {
  viewerGeneration += 1;
  initPromise = null;
  clearLoadTimeout();
  documentLoaded = false;
  sync?.dispose();
  sync = null;
  if (instance) {
    documentViewer?.removeEventListener('documentLoaded', onDocumentLoaded);
    annotationManager?.removeEventListener('annotationChanged', onAnnotationChanged);
    instance.UI.removeEventListener(instance.UI.Events.LOAD_ERROR, onLoadError);
    instance.UI.dispose();
  }
  instance = null;
  documentViewer = null;
  annotationManager = null;
};

/** Show the current URL: load it into WebViewer, or tear WebViewer down for web pages. */
const show = async () => {
  const run = ++showRun;
  clearLoadTimeout();
  loadError.value = false;
  documentLoaded = false;

  if (mode.value !== 'document') {
    disposeViewer();
    return;
  }

  await nextTick();
  const element = viewer.value;
  if (!element || run !== showRun) return;

  try {
    const created = await ensureViewer(element);
    if (!created || run !== showRun || unmounted) return;

    documentLoaded = false;
    loadTimeout = setTimeout(() => {
      if (run === showRun && !documentLoaded) {
        console.warn('Document load timed out');
        loadError.value = true;
      }
    }, LOAD_TIMEOUT_MS);
    created.UI.loadDocument(safeUrl.value, { extension: documentExtension.value });
  } catch (error) {
    if (run !== showRun) return;
    console.error('Failed to initialize WebViewer:', error);
    clearLoadTimeout();
    loadError.value = true;
  }
};

/** Reload annotations from the comments (after a comment changes in the sidebar). */
const refreshAnnotations = () => loadAnnotations();

defineExpose({ refreshAnnotations });

watch([() => props.url, () => props.contentType], () => {
  show();
});

watch(() => props.readOnly, applyReadOnly);

watch([() => props.reviewId, () => props.versionId, () => props.syncAnnotations], () => {
  loadAnnotations();
});

onMounted(() => {
  show();
});

onBeforeUnmount(() => {
  unmounted = true;
  showRun += 1;
  disposeViewer();
});
</script>

<style scoped>
.webviewer-container {
  @apply w-full h-full;
}

/* Viewer height follows the window; WebViewer and framed pages need an explicit height */
.webviewer,
.preview-iframe {
  @apply relative w-full;
  height: calc(100vh - 300px);
  min-height: 600px;
  max-height: 900px;
}

.preview-iframe,
.preview-fallback-iframe {
  @apply rounded-tile border border-line bg-surface-raised;
}

.preview-fallback-iframe {
  @apply mt-4 w-full max-w-full;
  height: 600px;
}

.preview-placeholder {
  @apply flex flex-col items-center justify-center gap-2 rounded-tile bg-surface-sunken p-6;
  min-height: 600px;
  max-height: 900px;
}

.preview-placeholder-error {
  max-height: none;
}

.preview-placeholder-icon {
  @apply mb-2 text-5xl text-danger;
}

.preview-fill .webviewer,
.preview-fill .preview-iframe,
.preview-fill .preview-placeholder {
  height: 100%;
  min-height: 0;
  max-height: none;
}

/* WebViewer's own UI fills its element */
.webviewer :deep(.App) {
  width: 100% !important;
  height: 100% !important;
}
</style>
