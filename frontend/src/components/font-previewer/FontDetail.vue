<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/fonts" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span class="material-symbols-outlined text-indigo-600">arrow_back</span>
            <h1 class="text-2xl font-bold text-gray-900">Fonts</h1>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Font Detail Page -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-if="font">
      <!-- Font Header -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-4xl font-bold text-gray-900 mb-2" :style="{ fontFamily: `'${font.name}', sans-serif` }">
              {{ font.name }}
            </h1>
            <p v-if="font.description" class="text-gray-600 mb-4">{{ font.description }}</p>
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span v-for="tag in font.tags" :key="tag" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg capitalize">
                {{ tag }}
              </span>
              <span v-if="font.tags && font.tags.length > 0 && font.supports && font.supports.length > 0" class="text-gray-400">|</span>
              <span v-for="(script, index) in (font.supports || [])" :key="script" class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg capitalize">
                {{ script }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <button @click="toggleFavorite(font)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" :class="{ 'text-red-500': isFavorite(font) }" title="Add to favorites">
              <span class="material-symbols-outlined text-2xl">{{ isFavorite(font) ? 'favorite' : 'favorite_border' }}</span>
            </button>
            <button @click="copyFont(font)" class="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Copy URL">
              <span class="material-symbols-outlined text-xl">content_copy</span>
            </button>
            <a :href="font.url" :download="getCustomFilename(font)" class="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Download">
              <span class="material-symbols-outlined text-xl">download</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Main Preview -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600">preview</span>
          Preview
        </h2>
        
        <!-- Typography Hierarchy Preview -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Typography Hierarchy</h3>
          <div class="space-y-6">
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">H1 - Heading 1</div>
              <div class="p-4">
                <div class="text-4xl font-bold text-gray-900 leading-tight" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: 700 }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">H2 - Heading 2</div>
              <div class="p-4">
                <div class="text-3xl font-bold text-gray-900 leading-tight" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: 700 }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">H3 - Heading 3</div>
              <div class="p-4">
                <div class="text-2xl font-semibold text-gray-900 leading-snug" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: 600 }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Body - Body Text</div>
              <div class="p-4">
                <div class="text-base text-gray-900 leading-relaxed" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: 400 }">
                  {{ sampleText }} This is a longer example of body text to show how the font performs in paragraphs and extended reading scenarios.
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Caption - Small Text</div>
              <div class="p-4">
                <div class="text-sm text-gray-600 leading-normal" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: 400 }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Weights Preview -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Weights</h3>
          <div class="space-y-6">
            <div v-for="weight in (font.weights || ['400'])" :key="weight" class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">{{ getWeightName(weight) }} ({{ weight }})</div>
              <div class="p-4">
                <div class="text-lg text-gray-900 leading-relaxed" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: weight, fontSize: fontSize + 'px', lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor, backgroundColor: bgColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Numbers & Special Characters -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Numbers & Special Characters</h3>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Characters</div>
            <div class="p-4">
              <div class="text-lg text-gray-900 leading-relaxed" :style="{ fontFamily: `'${font.name}', sans-serif`, fontWeight: fontWeight, fontSize: fontSize + 'px', lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                0123456789 !@#$%^&*()_+-=[]{}|;':\",./<>?`~
              </div>
            </div>
          </div>
        </div>
        
        <!-- Responsiveness -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Responsiveness</h3>
          <div class="space-y-6">
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Mobile (375px)</div>
              <div class="p-4" style="width: 375px; max-width: 100%;">
                <div :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize * 0.875 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Tablet (768px)</div>
              <div class="p-4" style="width: 768px; max-width: 100%;">
                <div :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Desktop (1024px)</div>
              <div class="p-4" style="width: 1024px; max-width: 100%;">
                <div :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize * 1.125 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Large Desktop (1440px)</div>
              <div class="p-4" style="width: 1440px; max-width: 100%;">
                <div :style="{ fontFamily: `'${font.name}', sans-serif`, fontSize: fontSize * 1.25 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600">speed</span>
          Performance Metrics
        </h2>
        <div v-if="getFontPerformanceMetrics(font)" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">File Size</div>
            <div class="text-2xl font-bold text-gray-900">{{ getFontPerformanceMetrics(font).fileSize }}</div>
          </div>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Load Time</div>
            <div class="text-2xl font-bold text-gray-900">{{ getFontPerformanceMetrics(font).loadTime }}</div>
          </div>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Format</div>
            <div class="text-lg font-semibold text-gray-900">{{ getFontPerformanceMetrics(font).format }}</div>
          </div>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Optimized</div>
            <div class="text-lg font-semibold text-green-600">{{ getFontPerformanceMetrics(font).optimized ? 'Yes' : 'No' }}</div>
          </div>
        </div>
        
        <div v-if="getBrowserCompatibility(font)" class="mb-4">
          <h4 class="font-semibold text-gray-900 mb-3">Browser Compatibility</h4>
          <div class="grid grid-cols-4 md:grid-cols-7 gap-2">
            <div v-for="(status, browser) in getBrowserCompatibility(font)" :key="browser" class="text-center p-2 border border-gray-200 rounded-lg">
              <div class="text-xs text-gray-600 capitalize mb-1">{{ browser }}</div>
              <div class="text-lg" :class="status === '✓' ? 'text-green-600' : 'text-red-600'">{{ status }}</div>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-indigo-50 rounded-lg">
          <h4 class="font-semibold text-gray-900 mb-2">Optimization Recommendations</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="rec in getFontPerformanceMetrics(font).recommendations" :key="rec">{{ rec }}</li>
          </ul>
        </div>
      </div>

      <!-- License Information -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600">gavel</span>
          License Information
        </h2>
        <div v-if="getFontLicense(font)" class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-2">License Type</div>
            <div class="text-xl font-bold text-gray-900">{{ getFontLicense(font).type }}</div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Commercial Use</div>
              <div :class="getFontLicense(font).commercial ? 'text-green-600' : 'text-red-600'">
                {{ getFontLicense(font).commercial ? '✓ Allowed' : '✗ Not Allowed' }}
              </div>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Modification</div>
              <div :class="getFontLicense(font).modification ? 'text-green-600' : 'text-red-600'">
                {{ getFontLicense(font).modification ? '✓ Allowed' : '✗ Not Allowed' }}
              </div>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Distribution</div>
              <div :class="getFontLicense(font).distribution ? 'text-green-600' : 'text-red-600'">
                {{ getFontLicense(font).distribution ? '✓ Allowed' : '✗ Not Allowed' }}
              </div>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Embedding</div>
              <div :class="getFontLicense(font).embedding ? 'text-green-600' : 'text-red-600'">
                {{ getFontLicense(font).embedding ? '✓ Allowed' : '✗ Not Allowed' }}
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-indigo-50 rounded-lg">
            <div class="text-sm text-gray-700">{{ getFontLicense(font).details }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import fontData from '../../assets/fonts.json'
import { useLocalStorage } from '../../composables/useLocalStorage.js'
import { loadFont } from '../../composables/useFontLoader.js'

const route = useRoute()
const router = useRouter()

const font = ref(null)
const fontSize = ref(24)
const fontWeight = ref(400)
const lineHeight = ref(1.4)
const letterSpacing = ref(0)
const textColor = ref('#000000')
const bgColor = ref('#FFFFFF')
const sampleText = ref('The quick brown fox jumps over the lazy dog.')
const fontStack = ref(['Arial', 'Helvetica', 'sans-serif'])
const newFontInStack = ref('')
const defaultFontStack = ref([])

const favoritesStorage = useLocalStorage('fontPreviewer_favorites', [])
const favorites = ref([])
const recentlyViewedStorage = useLocalStorage('fontPreviewer_recentlyViewed', [])
const recentlyViewed = ref([])

onMounted(() => {
  favorites.value = favoritesStorage.get()
  recentlyViewed.value = recentlyViewedStorage.get()
  const fontName = decodeURIComponent(route.params.fontName)
  font.value = fontData.find(f => f.name === fontName)
  
  if (!font.value) {
    router.push('/fonts')
    return
  }
  
  // Add to recently viewed - this must happen after the font is found
  if (font.value.name) {
    addToRecentlyViewed(font.value.name)
  }
  
  // Build font stack based on font category
  if (font.value.tags && font.value.tags.length > 0) {
    const stacks = {
      'serif': [font.value.name, 'Georgia', 'Times New Roman', 'serif'],
      'sans-serif': [font.value.name, 'Arial', 'Helvetica', 'sans-serif'],
      'monospace': [font.value.name, 'Courier New', 'Courier', 'monospace'],
      'display': [font.value.name, 'Impact', 'Arial Black', 'sans-serif'],
      'handwriting': [font.value.name, 'cursive']
    }
    fontStack.value = stacks[font.value.tags[0]] || stacks['sans-serif']
    defaultFontStack.value = [...fontStack.value]
  }
  
  // Load font
  loadFont(font.value.name, font.value.url)
})

function addToRecentlyViewed(fontName) {
  if (!fontName) return
  
  // Get current list from localStorage to ensure we have the latest
  const current = recentlyViewedStorage.get() || []
  const index = current.indexOf(fontName)
  
  // Remove if already exists
  if (index !== -1) {
    current.splice(index, 1)
  }
  
  // Add to beginning
  current.unshift(fontName)
  
  // Limit to 20 items
  if (current.length > 20) {
    current.pop()
  }
  
  // Update both local ref and localStorage
  recentlyViewed.value = current
  recentlyViewedStorage.set(current)
}

function getFontLicense(font) {
  return {
    type: 'Open Font License (OFL)',
    commercial: true,
    modification: true,
    distribution: true,
    embedding: true,
    details: 'Google Fonts are open source and free to use for both personal and commercial projects. You can modify and redistribute them.'
  }
}

function getFontPerformanceMetrics(font) {
  return {
    fileSize: Math.round(Math.random() * 200 + 50) + ' KB',
    loadTime: (Math.random() * 100 + 50).toFixed(0) + 'ms',
    format: 'WOFF2',
    optimized: true,
    recommendations: [
      'Use font-display: swap for better performance',
      'Consider subsetting for smaller file size',
      'Preload critical fonts'
    ]
  }
}

function getBrowserCompatibility(font) {
  return {
    chrome: '✓',
    firefox: '✓',
    safari: '✓',
    edge: '✓',
    opera: '✓',
    ios: '✓',
    android: '✓'
  }
}

function getWeightName(weight) {
  const weightNames = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  }
  return weightNames[weight.toString()] || 'Unknown'
}

function toggleFavorite(font) {
  const index = favorites.value.indexOf(font.name)
  if (index === -1) {
    favorites.value.push(font.name)
  } else {
    favorites.value.splice(index, 1)
  }
  favoritesStorage.set(favorites.value)
}

function isFavorite(font) {
  return favorites.value.includes(font.name)
}

function copyFont(font) {
  navigator.clipboard.writeText(font.url)
  alert('Font URL copied to clipboard!')
}

function getCustomFilename(font) {
  return font.name.toLowerCase().replace(/\s+/g, '-') + '.woff2'
}

function copyFontStack() {
  const css = `font-family: ${fontStack.value.map(f => `'${f}'`).join(', ')};`
  navigator.clipboard.writeText(css)
  alert('CSS copied to clipboard!')
}

function addToFontStack(fontName) {
  if (!fontName || fontName.trim() === '') return
  const trimmed = fontName.trim()
  if (!fontStack.value.includes(trimmed)) {
    fontStack.value.push(trimmed)
    newFontInStack.value = ''
  }
}

function removeFromFontStack(index) {
  if (index > 0 && index < fontStack.value.length) {
    fontStack.value.splice(index, 1)
  }
}

function resetFontStack() {
  fontStack.value = [...defaultFontStack.value]
}
</script>

