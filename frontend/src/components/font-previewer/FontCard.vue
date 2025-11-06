<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer" :class="{ 'border-indigo-500 bg-indigo-50': selected }" @click="goToDetail">
    <!-- Font Header -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-base font-semibold text-gray-900 mb-1">{{ font.name }}</h3>
        <span class="text-xs text-gray-500">{{ font.weights?.length || 1 }} styles</span>
      </div>
      <button @click.stop="toggleFavorite(font)" class="tooltip-wrapper p-1 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center" :class="{ 'text-red-500': selected }" :data-tooltip="selected ? 'Remove from favorites' : 'Add to favorites'">
        <span class="material-symbols-outlined text-xl leading-none">{{ selected ? 'favorite' : 'favorite_border' }}</span>
      </button>
    </div>

    <!-- Font Preview -->
    <div class="my-3 p-4 bg-gray-50 rounded border border-gray-200 text-lg leading-relaxed min-h-[60px] flex items-center text-gray-900" :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor, backgroundColor: bgColor }">
      {{ sampleText }}
    </div>

    <!-- Font Details -->
    <div class="mb-3 flex-1">
      <div class="flex gap-3 mb-2 text-xs">
        <span class="text-gray-500">{{ font.supports?.join(', ') || 'Latin' }}</span>
      </div>
      
      <!-- Pairing Suggestions -->
      <div v-if="font.pairsWellWith?.length" class="mt-2">
        <span class="text-xs text-gray-500 block mb-1">Pairs with:</span>
        <div class="flex gap-1 flex-wrap">
          <button v-for="pair in font.pairsWellWith.slice(0, 2)" :key="pair" class="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors" @click.stop="selectPairing(pair)">
            {{ pair }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end items-center gap-2 pt-3 border-t border-gray-200 mt-auto" @click.stop>
      <button class="tooltip-wrapper h-9 w-9 p-0 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center" @click="togglePreview" data-tooltip="Preview font weights">
        <span class="leading-none">Aa</span>
      </button>
      <button @click="copyFont(font)" class="tooltip-wrapper h-9 w-9 p-0 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center" data-tooltip="Copy font name">
        <span class="material-symbols-outlined text-lg leading-none">content_copy</span>
      </button>
      <a :href="font.url" :download="getCustomFilename(font)" class="tooltip-wrapper h-9 w-9 p-0 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center" data-tooltip="Download font">
        <span class="material-symbols-outlined text-lg leading-none">download</span>
      </a>
      <button @click="toggleCompare(font)" class="tooltip-wrapper h-9 w-9 p-0 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center" :class="{ 'border-indigo-500 bg-indigo-50 text-indigo-700': isInComparison }" :data-tooltip="isInComparison ? 'Remove from comparison' : 'Add to comparison'">
        <span class="material-symbols-outlined text-lg leading-none">{{ isInComparison ? 'remove_circle' : 'compare' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps([
  'font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'textColor', 'bgColor', 'sampleText', 'selected', 'isInComparison',
  'copyFont', 'getCustomFilename', 'toggleFavorite', 'toggleCompare', 'getContrastLevel', 'showFontInfo'
])

const emit = defineEmits(['togglePreview', 'selectPairing', 'quickPair', 'addToRecentlyViewed'])

function goToDetail() {
  emit('addToRecentlyViewed', props.font.name)
  // Use nextTick to ensure the event handler completes before navigation
  router.push(`/font/${encodeURIComponent(props.font.name)}`)
}

function togglePreview() {
  emit('togglePreview', props.font)
}

function selectPairing(pairingFont) {
  emit('selectPairing', pairingFont)
}

function quickPair() {
  emit('quickPair', props.font)
}
</script>