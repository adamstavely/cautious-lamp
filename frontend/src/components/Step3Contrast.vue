<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Step 3: Test Your Color Palette</h2>
    <p class="text-gray-600 mb-8">
      Send your palette through Contrast Testing to make sure every color combo is accessible and readable.
      See the exact scores, check which pairs pass AA/AAA standards, and feel confident your palette works everywhere.
    </p>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-600">Testing contrast...</p>
    </div>

    <div v-else>
      <!-- Summary -->
      <div v-if="contrastResults" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="text-2xl font-bold text-blue-900">{{ totalPairs }}</div>
            <div class="text-sm text-blue-700">Total Pairs</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-900">{{ passingAA }}</div>
            <div class="text-sm text-green-700">Pass AA</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-900">{{ passingAAA }}</div>
            <div class="text-sm text-green-700">Pass AAA</div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <div class="text-2xl font-bold text-red-900">{{ failing }}</div>
            <div class="text-sm text-red-700">Failing</div>
          </div>
        </div>

        <!-- Contrast Results Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AA</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AAA</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(result, index) in contrastResults" :key="index">
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <!-- Text Color 1 on Background Color 2 -->
                    <div class="flex items-center">
                      <div
                        class="flex-1 px-4 py-3 rounded border border-gray-300"
                        :style="{
                          backgroundColor: result.color2,
                          color: result.color1,
                        }"
                      >
                        <span class="text-sm font-medium">
                          (TEXT {{ result.color1 }} ON BACKGROUND {{ result.color2 }})
                        </span>
                      </div>
                    </div>
                    <!-- Text Color 2 on Background Color 1 -->
                    <div class="flex items-center">
                      <div
                        class="flex-1 px-4 py-3 rounded border border-gray-300"
                        :style="{
                          backgroundColor: result.color1,
                          color: result.color2,
                        }"
                      >
                        <span class="text-sm font-medium">
                          (TEXT {{ result.color2 }} ON BACKGROUND {{ result.color1 }})
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="font-mono text-sm font-semibold" :class="getRatioClass(result.ratio)">
                    {{ result.ratio }}:1
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="result.passesAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ result.passesAA ? '✓' : '✗' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="result.passesAAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ result.passesAAA ? '✓' : '✗' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
      <button
        @click="$emit('back')"
        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>
      <button
        @click="$emit('next')"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Next: Assign Roles →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back', 'next']);

const loading = ref(false);
const contrastResults = ref([]);

const totalPairs = computed(() => contrastResults.value.length);
const passingAA = computed(() =>
  contrastResults.value.filter((r) => r.passesAA).length
);
const passingAAA = computed(() =>
  contrastResults.value.filter((r) => r.passesAAA).length
);
const failing = computed(() =>
  contrastResults.value.filter((r) => !r.passesAA).length
);

const getRatioClass = (ratio) => {
  if (ratio >= 7) return 'text-green-600';
  if (ratio >= 4.5) return 'text-yellow-600';
  return 'text-red-600';
};

const testContrast = async () => {
  if (props.palette.colors.length === 0) return;

  loading.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/palettes/analyze', {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    contrastResults.value = response.data.contrastResults || [];
  } catch (error) {
    console.error('Error testing contrast:', error);
    alert('Error testing contrast. Please try again.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  testContrast();
});

watch(() => props.palette.colors, testContrast, { deep: true });
</script>

