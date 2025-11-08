<template>
  <div @click="activeColorPicker = null">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
      <!-- Search and Filters Section -->
      <div 
        class="mb-6 rounded-lg shadow-md border p-4" 
        :class="props.isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex flex-col lg:flex-row gap-4 items-center">
          <!-- Search Bar -->
          <div class="relative lg:w-80 flex-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none">
              search
            </span>
            <input 
              type="text" 
              :value="search" 
              @input="$emit('update:search', $event.target.value)" 
              placeholder="Search fonts..." 
              class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              :class="props.isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-500' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
            />
          </div>
          
          <!-- Filter Dropdowns -->
          <div class="flex flex-wrap gap-3 lg:flex-nowrap">
            <div class="w-full lg:w-auto lg:min-w-[150px]">
              <Dropdown
                :model-value="selectedTag"
                @update:model-value="$emit('update:selectedTag', $event)"
                :options="categoryOptions"
                :is-dark-mode="props.isDarkMode"
              />
            </div>
            <div class="w-full lg:w-auto lg:min-w-[150px]">
              <Dropdown
                :model-value="selectedScript"
                @update:model-value="$emit('update:selectedScript', $event)"
                :options="scriptOptions"
                :is-dark-mode="props.isDarkMode"
              />
            </div>
            <div class="w-full lg:w-auto lg:min-w-[150px]">
              <Dropdown
                :model-value="selectedWeight"
                @update:model-value="$emit('update:selectedWeight', $event)"
                :options="weightOptions"
                :is-dark-mode="props.isDarkMode"
              />
            </div>
          </div>
          
          <!-- Export Button -->
          <div class="flex-shrink-0 ml-auto">
            <button 
              v-if="(props.favorites && props.favorites.length > 0) || (props.comparisonFonts && props.comparisonFonts.length > 0)" 
              @click="$emit('showExportModal')" 
              class="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Export ({{ (props.favorites?.length || 0) + (props.comparisonFonts?.length || 0) }})
            </button>
          </div>
        </div>
      </div>

      <!-- Typography Controls Section -->
      <div 
        class="rounded-lg shadow-md border p-4" 
        :class="props.isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left: Typography Controls -->
          <div class="flex-1">
            <div class="mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-indigo-600">text_fields</span>
                Typography Controls
              </h3>
              <div class="grid grid-cols-3 gap-4">
                <!-- Size and Weight Stacked -->
                <div class="flex flex-col gap-4">
                  <!-- Size -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Size</label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ fontSize }}px</span>
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
                    <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Weight</label>
                    <Dropdown
                      :model-value="String(fontWeight)"
                      @update:model-value="$emit('update:fontWeight', Number($event))"
                      :options="fontWeightOptions"
                      :is-dark-mode="props.isDarkMode"
                    />
                  </div>
                </div>

                <!-- Line Height and Letter Spacing Stacked -->
                <div class="flex flex-col gap-4">
                  <!-- Line Height -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Line Height</label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ lineHeight }}</span>
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
                      <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Letter Spacing</label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ letterSpacing }}px</span>
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
                <div class="flex gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <!-- Text Color -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600 dark:text-gray-400 h-8 flex items-start">Text Color</label>
                    <div class="relative">
                      <button 
                        ref="textColorButtonRef"
                        @click.stop="openColorPicker('text', $event)"
                        class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer block"
                        :style="{ backgroundColor: textColor }"
                      >
                        <div class="absolute inset-0 border border-gray-200 dark:border-gray-600 rounded-lg pointer-events-none"></div>
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
                    <label class="text-xs font-medium text-gray-600 dark:text-gray-400 h-8 flex items-start">Background</label>
                    <div class="relative">
                      <button 
                        ref="bgColorButtonRef"
                        @click.stop="openColorPicker('bg', $event)"
                        class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer block"
                        :style="{ backgroundColor: bgColor }"
                      >
                        <div class="absolute inset-0 border border-gray-200 dark:border-gray-600 rounded-lg pointer-events-none"></div>
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
                  
                  <!-- Preview Dark Mode -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-medium text-gray-600 dark:text-gray-400 h-8 flex items-start">Preview Dark Mode</label>
                    <div class="h-12 flex items-center">
                      <button
                        @click="toggleDarkMode"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        :class="props.previewDarkMode ? 'bg-indigo-600' : 'bg-gray-300'"
                        role="switch"
                        :aria-checked="props.previewDarkMode"
                      >
                        <span
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          :class="props.previewDarkMode ? 'translate-x-6' : 'translate-x-1'"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Sample Text -->
          <div 
            class="lg:w-80 border-l pl-6" 
            :class="props.isDarkMode ? 'border-gray-700' : 'border-gray-200'"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span class="material-symbols-outlined text-base text-indigo-600">description</span>
                  Sample Text
                </h3>
                <div class="w-40">
                  <Dropdown
                    :model-value="selectedSampleType"
                    @update:model-value="selectSampleText($event)"
                    :options="sampleTextOptions"
                    :is-dark-mode="props.isDarkMode"
                  />
                </div>
              </div>
              <textarea 
                :value="sampleText" 
                @input="$emit('update:sampleText', $event.target.value)" 
                placeholder="Type something to preview..."
                rows="4"
                class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                :class="props.isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
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
import Dropdown from '../Dropdown.vue'

const activeColorPicker = ref(null)
const textColorButtonRef = ref(null)
const bgColorButtonRef = ref(null)
const textColorPickerStyle = ref({})
const bgColorPickerStyle = ref({})

// Dropdown options
const categoryOptions = [
  { label: 'All Categories', value: '' },
  { label: 'Serif', value: 'serif' },
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Display', value: 'display' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Handwriting', value: 'handwriting' },
]

const scriptOptions = [
  { label: 'All Scripts', value: '' },
  { label: 'Latin', value: 'latin' },
  { label: 'Cyrillic', value: 'cyrillic' },
  { label: 'Arabic', value: 'arabic' },
  { label: 'Devanagari', value: 'devanagari' },
  { label: 'Chinese', value: 'chinese' },
]

const weightOptions = [
  { label: 'All Weights', value: '' },
  { label: 'Thin (100)', value: '100' },
  { label: 'Extra Light (200)', value: '200' },
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
]

const fontWeightOptions = [
  { label: 'Thin (100)', value: '100' },
  { label: 'Extra Light (200)', value: '200' },
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi-Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
]

const sampleTextOptions = [
  { label: 'Custom', value: '' },
  { label: 'Pangram', value: 'pangram' },
  { label: 'Headings', value: 'headings' },
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Numbers', value: 'numbers' },
  { label: 'Special Characters', value: 'special' },
  { label: 'Lorem Ipsum', value: 'lorem' },
]

const props = defineProps([
  'search', 'selectedTag', 'selectedScript', 'selectedWeight', 'sampleText',
  'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
  'textColor', 'bgColor', 'fontTokens', 'styleJSON',
  'favorites', 'comparisonFonts', 'exportStyleDictionary', 'isDarkMode', 'previewDarkMode', 'fontCount'
])

const emit = defineEmits([
  'update:search', 'update:selectedTag', 'update:selectedScript', 'update:selectedWeight', 'update:sampleText',
  'update:fontSize', 'update:fontWeight', 'update:lineHeight', 'update:letterSpacing',
  'update:textColor', 'update:bgColor', 'update:fontTokens', 'toggleDarkMode', 'showExportModal'
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
  
  // Calculate position - ColorPickerPopup uses fixed positioning, so coordinates are relative to viewport
  const rect = buttonRef.getBoundingClientRect()
  const pickerWidth = 280
  const pickerHeight = 550 // More accurate height estimate
  const padding = 16
  const gap = 16
  
  // Horizontal positioning
  let left = rect.right + gap
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth - padding) {
    left = rect.left - pickerWidth - gap
  }
  
  // Ensure picker doesn't go off left or right edge
  left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding))
  
  // Vertical positioning - check available space above and below
  const spaceBelow = window.innerHeight - rect.bottom - padding
  const spaceAbove = rect.top - padding
  
  let top
  
  // If there's enough space below, position below the button
  if (spaceBelow >= pickerHeight) {
    top = rect.bottom + gap
  }
  // If there's more space above than below, position above
  else if (spaceAbove >= pickerHeight) {
    top = rect.top - pickerHeight - gap
  }
  // If there's not enough space in either direction, use the one with more space
  else if (spaceAbove > spaceBelow) {
    top = Math.max(padding, rect.top - pickerHeight - gap)
  }
  else {
    top = Math.min(window.innerHeight - pickerHeight - padding, rect.bottom + gap)
  }
  
  // Final bounds check to ensure picker stays within viewport
  top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding))
  
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