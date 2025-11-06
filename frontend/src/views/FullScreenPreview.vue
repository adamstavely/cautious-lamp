<template>
  <div class="fullscreen-preview">
    <iframe
      v-if="previewUrl"
      :src="previewUrl"
      class="w-full h-full"
      frameborder="0"
    ></iframe>
    <div v-else class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-gray-500">Loading preview...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { mockAPI, isMockMode } from '../mockData.js';
import axios from 'axios';

const route = useRoute();
const reviewId = route.params.id;
const versionId = route.query.version || '';

const previewUrl = ref('');

onMounted(async () => {
  try {
    const useMockMode = await isMockMode();
    let reviewData = null;
    
    if (useMockMode) {
      // Get review data first to get filename
      reviewData = await mockAPI.getReview(reviewId);
      
      // Get version ID from query param or get first version
      let version = versionId;
      if (!version) {
        version = reviewData.versions[0]?.id;
      }
      
      if (version) {
        const res = await mockAPI.getVersion(reviewId, version);
        previewUrl.value = res.url;
      }
    } else {
      // Use real API
      reviewData = await axios.get(`/review/${reviewId}`);
      
      let version = versionId;
      if (!version) {
        version = reviewData.data.versions[0]?.id;
      }
      
      if (version) {
        const res = await axios.get(`/review/${reviewId}/version/${version}`);
        previewUrl.value = res.data.url;
      }
    }
    
    // Update document title
    if (reviewData) {
      const filename = useMockMode ? reviewData.filename : reviewData.data.filename;
      if (filename) {
        document.title = `${filename} - Design Review`;
      }
    }
  } catch (error) {
    console.error('Failed to load preview:', error);
  }
});
</script>

<style scoped>
.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.fullscreen-preview iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>

