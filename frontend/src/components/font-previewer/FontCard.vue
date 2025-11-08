<template>
  <div 
    class="rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer" 
    :class="[
      isDark ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200',
      selected ? (isDark ? 'border-indigo-400 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50') : ''
    ]"
    @click="goToDetail"
  >
    <!-- Font Header -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">{{ font.name }}</h3>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ font.weights?.length || 1 }} styles</span>
      </div>
      <button @click.stop="toggleFavorite(font)" class="tooltip-wrapper p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center" :class="{ 'text-red-500 dark:text-red-400': selected }" :data-tooltip="selected ? 'Remove from favorites' : 'Add to favorites'">
        <span class="material-symbols-outlined text-xl leading-none">{{ selected ? 'favorite' : 'favorite_border' }}</span>
      </button>
    </div>

    <!-- Font Preview -->
    <div 
      class="my-3 p-4 rounded border text-lg leading-relaxed min-h-[60px] flex items-center" 
      :class="previewDarkMode ? 'border-gray-700' : 'border-gray-200'"
      :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor, backgroundColor: bgColor }"
    >
      {{ sampleText }}
    </div>

    <!-- Font Details -->
    <div class="mb-3 flex-1">
      <div class="flex gap-3 mb-2 text-xs">
        <span class="text-gray-500 dark:text-gray-400">{{ font.supports?.join(', ') || 'Latin' }}</span>
      </div>
      
      <!-- Pairing Suggestions -->
      <div v-if="font.pairsWellWith?.length" class="mt-2">
        <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">Pairs with:</span>
        <div class="flex gap-1 flex-wrap">
          <button 
            v-for="pair in font.pairsWellWith.slice(0, 2)" 
            :key="pair" 
            class="px-2 py-0.5 text-xs rounded border transition-colors" 
            :class="isDark ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700 hover:bg-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'"
            @click.stop="selectPairing(pair)"
          >
            {{ pair }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div 
      class="flex justify-end items-center gap-2 pt-3 border-t mt-auto" 
      :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      @click.stop
    >
      <button 
        class="tooltip-wrapper h-9 w-9 p-0 border rounded transition-colors font-medium text-sm flex items-center justify-center" 
        :class="isDark ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
        @click="togglePreview" 
        data-tooltip="Preview font weights"
      >
        <span class="leading-none">Aa</span>
      </button>
      <button 
        @click="copyFont(font)" 
        class="tooltip-wrapper h-9 w-9 p-0 border rounded transition-colors flex items-center justify-center" 
        :class="isDark ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'"
        data-tooltip="Copy font name"
      >
        <span class="material-symbols-outlined text-lg leading-none">content_copy</span>
      </button>
      <a 
        :href="font.url" 
        :download="getCustomFilename(font)" 
        class="tooltip-wrapper h-9 w-9 p-0 border rounded transition-colors flex items-center justify-center" 
        :class="isDark ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'"
        data-tooltip="Download font"
      >
        <span class="material-symbols-outlined text-lg leading-none">download</span>
      </a>
      <button 
        @click="toggleCompare(font)" 
        class="tooltip-wrapper h-9 w-9 p-0 border rounded transition-colors flex items-center justify-center" 
        :class="isDark 
          ? (isInComparison ? 'border-indigo-400 bg-indigo-900/20 text-indigo-300' : 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700')
          : (isInComparison ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50')
        "
        :data-tooltip="isInComparison ? 'Remove from comparison' : 'Add to comparison'"
      >
        <span class="material-symbols-outlined text-lg leading-none">{{ isInComparison ? 'remove_circle' : 'compare' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()

const props = defineProps([
  'font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'textColor', 'bgColor', 'sampleText', 'selected', 'isInComparison', 'previewDarkMode',
  'copyFont', 'getCustomFilename', 'toggleFavorite', 'toggleCompare', 'getContrastLevel', 'showFontInfo'
])

const emit = defineEmits(['togglePreview', 'selectPairing', 'quickPair', 'addToRecentlyViewed'])

// Check if dark mode is active - make it reactive
const isDark = ref(document.documentElement.classList.contains('dark'))

let darkModeObserver = null

onMounted(() => {
  // Watch for dark mode changes
  darkModeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect()
  }
})

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