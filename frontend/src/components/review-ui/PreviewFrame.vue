<template>
  <div class="webviewer-container">
    <div ref="viewer" class="webviewer" :class="{ 'hidden': loadError }" style="position: relative;"></div>
    <div v-if="loadError" class="flex flex-col items-center justify-center h-full min-h-[600px] max-h-[900px] bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
      <svg class="w-12 h-12 text-red-500 dark:text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-900 dark:text-gray-100 font-medium mb-2">Unable to load document</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
        The document cannot be loaded due to CORS restrictions or network issues. Please ensure the document URL allows cross-origin access or use a proxy server.
      </p>
      <div class="mt-4 w-full">
        <iframe :src="url" class="w-full h-[600px] border border-gray-300 dark:border-slate-600 rounded-lg" style="max-width: 100%;"></iframe>
      </div>
    </div>
    <div v-if="!url && !loadError" class="flex items-center justify-center h-full min-h-[600px] max-h-[900px] bg-gray-50 dark:bg-slate-700 rounded-lg">
      <p class="text-gray-500 dark:text-gray-400">No document to display</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import WebViewer from '@pdftron/webviewer';
import { loadCommentsAsAnnotations, annotationToComment, saveAnnotationToBackend, updateAnnotationInBackend, deleteAnnotationFromBackend } from '../../services/annotationSync.js';
import { mockAPI, isMockMode } from '../../mockData.js';

const props = defineProps({
  url: String,
  reviewId: String,
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['annotation-added', 'annotation-updated', 'annotation-deleted']);

const viewer = ref(null);
let instance = null;
const loadError = ref(false);
let documentViewer = null;
let annotationManager = null;

// Expose method to refresh annotations (for syncing from CommentsSidebar)
const refreshAnnotations = async () => {
  if (props.reviewId && annotationManager && documentViewer) {
    try {
      const useMockMode = await isMockMode();
      await loadCommentsAsAnnotations(
        props.reviewId,
        annotationManager,
        instance,
        useMockMode ? mockAPI : null
      );
    } catch (error) {
      console.error('Failed to refresh annotations:', error);
    }
  }
};

// Expose refreshAnnotations method
defineExpose({
  refreshAnnotations
});

const initializeWebViewer = async () => {
  if (!viewer.value || !props.url) return;

  try {
    // Clean up existing instance if any
    if (instance) {
      instance.UI.dispose();
      instance = null;
    }

    // Check if URL is a PDF or image
    const isPdf = props.url.toLowerCase().endsWith('.pdf') || props.url.includes('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.url);
    
    // For external URLs that are not PDFs or images, fall back to iframe
    if ((props.url.startsWith('http://') || props.url.startsWith('https://')) && !isPdf && !isImage) {
      // For external websites, use iframe
      if (viewer.value) {
        viewer.value.innerHTML = `<iframe src="${props.url}" style="width: 100%; height: 600px; border: none;"></iframe>`;
      }
      return;
    }

    // Clear the viewer container before initializing
    if (viewer.value) {
      viewer.value.innerHTML = '';
    }

    // Initialize WebViewer for PDFs and images
    console.log('Initializing WebViewer with path: /lib, document:', props.url);
    console.log('Viewer element:', viewer.value);
    
    if (!viewer.value) {
      console.error('Viewer element is not available');
      loadError.value = true;
      return;
    }
    
    instance = await WebViewer(
      {
        path: '/lib',
        initialDoc: props.url,
        enableAnnotations: true,
        fullAPI: true,
        enableFilePicker: false,
      },
      viewer.value
    );

    const { documentViewer: docViewer, annotationManager: annManager } = instance.Core;
    documentViewer = docViewer;
    annotationManager = annManager;

    console.log('WebViewer initialized successfully', instance);

    // Set read-only mode if needed
    if (props.readOnly) {
      annotationManager.setReadOnly(true);
    }

    // Wait for document to load
    let loadTimeout = null;
    documentViewer.addEventListener('documentLoaded', async () => {
      console.log('Document loaded in WebViewer');
      loadError.value = false;
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      
      // Load existing comments as annotations
      if (props.reviewId && annotationManager) {
        try {
          const useMockMode = await isMockMode();
          await loadCommentsAsAnnotations(
            props.reviewId,
            annotationManager,
            instance,
            useMockMode ? mockAPI : null
          );
        } catch (error) {
          console.error('Failed to load comments as annotations:', error);
        }
      }
    });

    // Listen for annotation changes and sync to backend
    annotationManager.addEventListener('annotationChanged', async (annotations, action) => {
      if (!props.reviewId) return;
      
      try {
        const useMockMode = await isMockMode();
        
        for (const annotation of annotations) {
          if (action === 'add') {
            // New annotation - save to backend
            const savedComment = await saveAnnotationToBackend(annotation, props.reviewId, useMockMode ? mockAPI : null);
            // Update annotation with backend ID
            if (savedComment && savedComment.id) {
              annotation.customData = annotation.customData || {};
              annotation.customData.commentId = savedComment.id;
            }
            emit('annotation-added', annotationToComment(annotation));
          } else if (action === 'modify') {
            // Updated annotation - update in backend
            await updateAnnotationInBackend(annotation, props.reviewId, useMockMode ? mockAPI : null);
            emit('annotation-updated', annotationToComment(annotation));
          } else if (action === 'delete') {
            // Deleted annotation - delete from backend
            await deleteAnnotationFromBackend(annotation, props.reviewId, useMockMode ? mockAPI : null);
            emit('annotation-deleted', annotationToComment(annotation));
          }
        }
      } catch (error) {
        console.error('Failed to sync annotation to backend:', error);
      }
    });

    // Set a timeout to detect if document fails to load (e.g., CORS issues)
    loadTimeout = setTimeout(() => {
      // Check if document is actually loaded after timeout
      const currentPage = documentViewer.getCurrentPage();
      if (currentPage === null || currentPage === undefined) {
        console.warn('Document load timeout - likely CORS or network issue');
        loadError.value = true;
      }
    }, 5000); // 5 second timeout for faster error detection
  } catch (error) {
    console.error('Failed to initialize WebViewer:', error);
    console.error('Error details:', error.message, error.stack);
    loadError.value = true;
  }
};

const loadDocument = async (url) => {
  if (!instance || !url) return;

  try {
    loadError.value = false;
    await documentViewer.loadDocument(url);
    
    // Reload comments as annotations when document changes
    if (props.reviewId && annotationManager) {
      try {
        const useMockMode = await isMockMode();
        await loadCommentsAsAnnotations(
          props.reviewId,
          annotationManager,
          instance,
          useMockMode ? mockAPI : null
        );
      } catch (error) {
        console.error('Failed to load comments as annotations:', error);
      }
    }
  } catch (error) {
    console.error('Failed to load document:', error);
    loadError.value = true;
  }
};

watch(() => props.url, async (newUrl, oldUrl) => {
  if (newUrl !== oldUrl && newUrl) {
    loadError.value = false;
    if (instance) {
      await loadDocument(newUrl);
    } else {
      await initializeWebViewer();
    }
  }
});

watch(() => props.reviewId, async (newReviewId, oldReviewId) => {
  if (newReviewId !== oldReviewId && newReviewId && annotationManager && documentViewer) {
    // Reload comments when review changes
    try {
      const useMockMode = await isMockMode();
      await loadCommentsAsAnnotations(
        newReviewId,
        annotationManager,
        instance,
        useMockMode ? mockAPI : null
      );
    } catch (error) {
      console.error('Failed to reload comments as annotations:', error);
    }
  }
});

onMounted(async () => {
  await nextTick(); // Wait for DOM to be ready
  if (props.url && viewer.value) {
    await initializeWebViewer();
  }
});

onUnmounted(() => {
  if (instance) {
    instance.UI.dispose();
    instance = null;
  }
});
</script>

<style scoped>
.webviewer-container {
  width: 100%;
  height: 100%;
}

.webviewer {
  width: 100%;
  height: calc(100vh - 300px);
  min-height: 600px;
  max-height: 900px;
  position: relative;
}

/* Ensure WebViewer UI is visible */
.webviewer :deep(.App) {
  width: 100% !important;
  height: 100% !important;
}
</style>
