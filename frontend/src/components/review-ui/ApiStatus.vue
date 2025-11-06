<template>
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
    <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="checking ? 'bg-orange-100 dark:bg-orange-900' : mockMode ? 'bg-orange-100 dark:bg-orange-900' : 'bg-green-100 dark:bg-green-900'"
          >
            <svg
              v-if="!checking && mockMode"
              class="w-5 h-5"
              :class="mockMode ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <svg
              v-else-if="!checking && !mockMode"
              class="w-5 h-5 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              class="w-5 h-5 text-orange-600 dark:text-orange-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">API Connection</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              {{ mockMode ? 'Using mock data for testing' : `Connected to ${apiUrl}` }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="checkApiStatus"
            :disabled="checking"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="forceMockMode"
              @change="toggleMockMode"
              class="w-4 h-4 text-orange-600 dark:text-orange-400 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-2"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Force Mock Mode</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['mode-changed']);

const checking = ref(false);
const mockMode = ref(true);
const forceMockMode = ref(false);

const apiUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');

const statusColor = computed(() => {
  if (checking.value) return 'orange';
  return mockMode.value ? 'orange' : 'green';
});

const statusIcon = computed(() => {
  if (checking.value) return 'mdi-loading';
  return mockMode.value ? 'mdi-test-tube' : 'mdi-check-circle';
});

const statusText = computed(() => {
  if (checking.value) return 'Checking API connection...';
  return mockMode.value ? 'Mock Mode Active' : 'API Connected';
});

const checkApiStatus = async () => {
  checking.value = true;
  try {
    // Only check if user enabled real API mode
    if (localStorage.getItem('useRealAPI') === 'true') {
      const response = await fetch(`${apiUrl.value}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      mockMode.value = !response.ok;
    } else {
      mockMode.value = true; // Default to mock mode
    }
    emit('mode-changed', mockMode.value);
  } catch (error) {
    // CORS error or network error - use mock mode
    console.log('API not available or CORS error, using mock mode');
    mockMode.value = true;
    emit('mode-changed', true);
  } finally {
    checking.value = false;
  }
};

const toggleMockMode = () => {
  if (forceMockMode.value) {
    localStorage.setItem('forceMockMode', 'true');
    localStorage.setItem('useRealAPI', 'false');
  } else {
    localStorage.setItem('forceMockMode', 'false');
    localStorage.setItem('useRealAPI', 'false');
  }
  checkApiStatus();
};

onMounted(async () => {
  forceMockMode.value = localStorage.getItem('forceMockMode') === 'true';
  // Don't automatically check API - default to mock mode
  mockMode.value = true;
  emit('mode-changed', true);
});
</script>
