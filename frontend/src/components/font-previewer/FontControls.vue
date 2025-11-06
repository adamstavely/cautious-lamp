<template>
  <div @click="activeColorPicker = null">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
      <!-- Search and Filters Section -->
      <div class="mb-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div class="flex items-center justify-end mb-4">
          <div class="text-sm text-gray-500 whitespace-nowrap">
            {{ fontCount }} font families
          </div>
        </div>
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search Bar -->
          <div class="flex-1">
            <input 
              type="text" 
              :value="search" 
              @input="$emit('update:search', $event.target.value)" 
              placeholder="Search fonts..." 
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          
          <!-- Filter Dropdowns -->
          <div class="flex flex-wrap gap-3 lg:flex-nowrap">
            <select :value="selectedTag" @change="$emit('update:selectedTag', $event.target.value)" class="flex-1 min-w-[140px] px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="">All Categories</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="display">Display</option>
              <option value="monospace">Monospace</option>
              <option value="handwriting">Handwriting</option>
            </select>
            <select :value="selectedScript" @change="$emit('update:selectedScript', $event.target.value)" class="flex-1 min-w-[140px] px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="">All Scripts</option>
              <option value="latin">Latin</option>
              <option value="cyrillic">Cyrillic</option>
              <option value="arabic">Arabic</option>
              <option value="devanagari">Devanagari</option>
              <option value="chinese">Chinese</option>
            </select>
            <select :value="selectedWeight" @change="$emit('update:selectedWeight', $event.target.value)" class="flex-1 min-w-[140px] px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="">All Weights</option>
              <option value="100">Thin (100)</option>
              <option value="200">Extra Light (200)</option>
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Typography Controls Section -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left: Typography Controls -->
          <div class="flex-1">
            <div class="mb-3">
              <h3 class="text-sm font-semibold text-gray-700 mb-4">Typography Controls</h3>
              <div class="grid grid-cols-3 gap-4">
                <!-- Size and Weight Stacked -->
                <div class="flex flex-col gap-4">
                  <!-- Size -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Size</label>
                      <span class="text-xs text-gray-500">{{ fontSize }}px</span>
                    </div>
                    <input 
                      type="range" 
                      :value="fontSize" 
                      @input="$emit('update:fontSize', Number($event.target.value))" 
                      min="12" 
                      max="72" 
                      class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <!-- Weight -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600">Weight</label>
                    <select :value="fontWeight" @change="$emit('update:fontWeight', Number($event.target.value))" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option value="100">Thin (100)</option>
                      <option value="200">Extra Light (200)</option>
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>

                <!-- Line Height and Letter Spacing Stacked -->
                <div class="flex flex-col gap-4">
                  <!-- Line Height -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Line Height</label>
                      <span class="text-xs text-gray-500">{{ lineHeight }}</span>
                    </div>
                    <input 
                      type="range" 
                      :value="lineHeight" 
                      @input="$emit('update:lineHeight', Number($event.target.value))" 
                      min="1" 
                      max="2" 
                      step="0.1" 
                      class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <!-- Letter Spacing -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600">Letter Spacing</label>
                      <span class="text-xs text-gray-500">{{ letterSpacing }}px</span>
                    </div>
                    <input 
                      type="range" 
                      :value="letterSpacing" 
                      @input="$emit('update:letterSpacing', Number($event.target.value))" 
                      min="-2" 
                      max="5" 
                      step="0.1" 
                      class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <!-- Color and Mode Controls -->
                <div class="flex items-start gap-4 pl-4 border-l border-gray-200 justify-between">
                  <!-- Text Color -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600">Text Color</label>
                    <div class="relative">
                      <button 
                        ref="textColorButtonRef"
                        @click.stop="openColorPicker('text', $event)"
                        class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer block"
                        :style="{ backgroundColor: textColor }"
                      >
                        <div class="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none"></div>
                      </button>
                      
                      <!-- Color Picker Popup -->
                      <ColorPickerPopup
                        v-if="activeColorPicker === 'text'"
                        :initial-color="textColor"
                        @apply="(hex) => { emit('update:textColor', hex); activeColorPicker = null; }"
                        @cancel="activeColorPicker = null"
                        :picker-style="textColorPickerStyle"
                      />
                    </div>
                  </div>
                  
                  <!-- Background -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600">Background</label>
                    <div class="relative">
                      <button 
                        ref="bgColorButtonRef"
                        @click.stop="openColorPicker('bg', $event)"
                        class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer block"
                        :style="{ backgroundColor: bgColor }"
                      >
                        <div class="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none"></div>
                      </button>
                      
                      <!-- Color Picker Popup -->
                      <ColorPickerPopup
                        v-if="activeColorPicker === 'bg'"
                        :initial-color="bgColor"
                        @apply="(hex) => { emit('update:bgColor', hex); activeColorPicker = null; }"
                        @cancel="activeColorPicker = null"
                        :picker-style="bgColorPickerStyle"
                      />
                    </div>
                  </div>
                  
                  <!-- Dark Mode -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600">Dark Mode</label>
                    <button
                      @click="toggleDarkMode"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      :class="isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'"
                      role="switch"
                      :aria-checked="isDarkMode"
                    >
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Sample Text -->
          <div class="lg:w-80 border-l border-gray-200 pl-6">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-gray-600">Sample Text</label>
                <select 
                  :value="selectedSampleType"
                  @change="selectSampleText($event.target.value)"
                  class="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Custom</option>
                  <option value="pangram">Pangram</option>
                  <option value="headings">Headings</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="numbers">Numbers</option>
                  <option value="special">Special Characters</option>
                  <option value="lorem">Lorem Ipsum</option>
                </select>
              </div>
              <textarea 
                :value="sampleText" 
                @input="$emit('update:sampleText', $event.target.value)" 
                placeholder="Type something to preview..."
                rows="4"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ColorPickerPopup from './ColorPickerPopup.vue'

const activeColorPicker = ref(null)
const textColorButtonRef = ref(null)
const bgColorButtonRef = ref(null)
const textColorPickerStyle = ref({})
const bgColorPickerStyle = ref({})

const props = defineProps([
  'search', 'selectedTag', 'selectedScript', 'selectedWeight', 'sampleText',
  'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'textColor', 'bgColor', 'fontTokens', 'styleJSON',
  'favorites', 'comparisonFonts', 'exportStyleDictionary', 'isDarkMode', 'fontCount'
])

const emit = defineEmits([
  'update:search', 'update:selectedTag', 'update:selectedScript', 'update:selectedWeight', 'update:sampleText',
  'update:fontSize', 'update:fontWeight', 'update:lineHeight', 'update:letterSpacing',
  'update:textColor', 'update:bgColor', 'update:fontTokens', 'toggleDarkMode'
])

const exportStyleDictionary = () => {
  if (props.exportStyleDictionary) {
    props.exportStyleDictionary()
  }
}

function copyToClipboard() {
  if (navigator.clipboard && window.getSelection) {
    const styleJSON = document.querySelector('.json-code')?.textContent
    if (styleJSON) {
      navigator.clipboard.writeText(styleJSON).then(() => {
        console.log('JSON copied to clipboard')
      })
    }
  }
}

function fillFromFavorites() {
  if (props.favorites.length >= 2) {
    const newTokens = {
      heading: props.favorites[0].name,
      body: props.favorites[1].name,
      ui: props.favorites.length >= 3 ? props.favorites[2].name : ''
    }
    emit('update:fontTokens', newTokens)
  }
}

function fillFromComparison() {
  if (props.comparisonFonts.length >= 2) {
    const newTokens = {
      heading: props.comparisonFonts[0].name,
      body: props.comparisonFonts[1].name,
      ui: props.comparisonFonts.length >= 3 ? props.comparisonFonts[2].name : ''
    }
    emit('update:fontTokens', newTokens)
  }
}

function clearSelection() {
  const newTokens = {
    heading: '',
    body: '',
    ui: ''
  }
  emit('update:fontTokens', newTokens)
}

function updateFontToken(role, value) {
  const newTokens = {
    ...props.fontTokens,
    [role]: value
  }
  emit('update:fontTokens', newTokens)
}

const sampleTexts = {
  pangram: 'The quick brown fox jumps over the lazy dog.',
  headings: 'Heading 1\nHeading 2\nHeading 3\nHeading 4\nHeading 5\nHeading 6',
  paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
}

const selectedSampleType = computed(() => {
  // Check if current sampleText matches any predefined text
  for (const [key, value] of Object.entries(sampleTexts)) {
    if (props.sampleText === value) {
      return key
    }
  }
  // Default to pangram if it matches (initial state)
  return props.sampleText === sampleTexts.pangram ? 'pangram' : ''
})

function selectSampleText(type) {
  if (type && sampleTexts[type]) {
    emit('update:sampleText', sampleTexts[type])
  } else if (type === '') {
    // Allow clearing to custom
    emit('update:sampleText', '')
  }
}

function toggleDarkMode() {
  emit('toggleDarkMode')
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("").toUpperCase()
}

function rgbToCmyk(r, g, b) {
  r = r / 255
  g = g / 255
  b = b / 255
  
  const k = 1 - Math.max(r, g, b)
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k)
  
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  }
}

function cmykToRgb(c, m, y, k) {
  c = c / 100
  m = m / 100
  y = y / 100
  k = k / 100
  
  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)
  
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  }
}

function getCMYK(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return { c: 0, m: 0, y: 0, k: 0 }
  return rgbToCmyk(rgb.r, rgb.g, rgb.b)
}

function updateTextColorCMYK(channel, value) {
  const num = parseInt(value) || 0
  const clamped = Math.max(0, Math.min(100, num))
  const updatedCMYK = { ...getCMYK(props.textColor), [channel]: clamped }
  const rgb = cmykToRgb(updatedCMYK.c, updatedCMYK.m, updatedCMYK.y, updatedCMYK.k)
  emit('update:textColor', rgbToHex(rgb.r, rgb.g, rgb.b))
}

function updateBgColorCMYK(channel, value) {
  const num = parseInt(value) || 0
  const clamped = Math.max(0, Math.min(100, num))
  const updatedCMYK = { ...getCMYK(props.bgColor), [channel]: clamped }
  const rgb = cmykToRgb(updatedCMYK.c, updatedCMYK.m, updatedCMYK.y, updatedCMYK.k)
  emit('update:bgColor', rgbToHex(rgb.r, rgb.g, rgb.b))
}

function updateTextColorHex(value) {
  const hex = value.startsWith('#') ? value : '#' + value
  if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
    emit('update:textColor', hex.toUpperCase())
  }
}

function validateTextColorHex(event) {
  const value = event.target.value
  const hex = value.startsWith('#') ? value : '#' + value
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    emit('update:textColor', hex.toUpperCase())
  } else {
    event.target.value = props.textColor.toUpperCase()
  }
}

function updateBgColorHex(value) {
  const hex = value.startsWith('#') ? value : '#' + value
  if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
    emit('update:bgColor', hex.toUpperCase())
  }
}

function validateBgColorHex(event) {
  const value = event.target.value
  const hex = value.startsWith('#') ? value : '#' + value
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    emit('update:bgColor', hex.toUpperCase())
  } else {
    event.target.value = props.bgColor.toUpperCase()
  }
}

function openColorPicker(type, event) {
  if (activeColorPicker.value === type) {
    activeColorPicker.value = null
    return
  }
  
  activeColorPicker.value = type
  
  // Get button reference
  const buttonRef = type === 'text' ? textColorButtonRef.value : bgColorButtonRef.value
  if (!buttonRef) return
  
  // Calculate position
  const rect = buttonRef.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  const pickerWidth = 280
  const gap = 16
  
  let left = rect.right + scrollLeft + gap
  let top = rect.top + scrollTop
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - gap
  }
  
  // Ensure it doesn't go off-screen
  left = Math.max(16, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - 16))
  top = Math.max(16, Math.min(top, window.innerHeight + scrollTop - 600))
  
  const style = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${pickerWidth}px`,
  }
  
  if (type === 'text') {
    textColorPickerStyle.value = style
  } else {
    bgColorPickerStyle.value = style
  }
}
</script>