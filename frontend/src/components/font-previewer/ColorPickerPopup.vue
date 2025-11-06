<template>
  <div
    ref="colorPickerContainerRef"
    class="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
    :style="pickerStyle"
    @click.stop
  >
    <div class="w-64">
      <!-- Gradient/Hue Selector -->
      <div class="relative mb-4">
        <canvas
          ref="gradientCanvas"
          width="256"
          height="200"
          class="w-full h-48 rounded-lg cursor-crosshair border border-gray-300"
          @mousedown="startGradientDrag"
          @click="handleGradientClick"
        ></canvas>
        <!-- Selector indicator -->
        <div
          class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
          :style="selectorStyle"
        ></div>
      </div>
      
      <!-- Hue Slider -->
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-700 mb-1">Hue</label>
        <div class="relative h-8">
          <canvas
            ref="hueCanvas"
            width="256"
            height="32"
            class="w-full h-8 rounded cursor-pointer border border-gray-300"
            @click="handleHueClick"
          ></canvas>
          <div
            class="absolute top-0 h-8 w-1 border border-gray-800 pointer-events-none"
            :style="{ left: `${huePosition}%` }"
          ></div>
        </div>
      </div>
      
      <!-- RGB Inputs -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">R</label>
          <input
            v-model.number="rgbValues.r"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">G</label>
          <input
            v-model.number="rgbValues.g"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">B</label>
          <input
            v-model.number="rgbValues.b"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <!-- Hex Input -->
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-700 mb-1">Hex</label>
        <input
          v-model="hexInput"
          @input="updateFromHex"
          type="text"
          class="w-full px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="#000000"
        />
      </div>
      
      <!-- CMYK Inputs -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">C</label>
          <input
            v-model.number="cmykValues.c"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">M</label>
          <input
            v-model.number="cmykValues.m"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Y</label>
          <input
            v-model.number="cmykValues.y"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">K</label>
          <input
            v-model.number="cmykValues.k"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <!-- Color Preview -->
      <div class="mb-4 flex items-center gap-3">
        <div
          class="w-16 h-16 rounded-lg border-2 border-gray-300"
          :style="{ backgroundColor: currentHex }"
        ></div>
        <div class="flex-1">
          <div class="text-sm font-mono font-semibold text-gray-900">{{ currentHex }}</div>
          <div class="text-xs text-gray-500">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
          <div class="text-xs text-gray-500">CMYK({{ Math.round(cmykValues.c) }}, {{ Math.round(cmykValues.m) }}, {{ Math.round(cmykValues.y) }}, {{ Math.round(cmykValues.k) }})</div>
        </div>
      </div>
      
      <!-- Eyedropper Button -->
      <div class="mb-4">
        <button
          @click="toggleEyedropper"
          class="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined eyedropper-icon">colorize</span>
          Use Eyedropper
        </button>
      </div>
      
      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="applyColor"
          class="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply
        </button>
        <button
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  initialColor: {
    type: String,
    default: '#000000'
  },
  pickerStyle: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['apply', 'cancel'])

const colorPickerContainerRef = ref(null)
const gradientCanvas = ref(null)
const hueCanvas = ref(null)
const currentHex = ref('#000000')
const hexInput = ref('#000000')
const rgbValues = ref({ r: 0, g: 0, b: 0 })
const huePosition = ref(0)
const selectorStyle = ref({ left: '0%', top: '0%' })
const isDragging = ref(false)
const currentHue = ref(0)
const currentSaturation = ref(100)
const currentLightness = ref(50)
const cmykValues = ref({ c: 0, m: 0, y: 0, k: 100 })

// Color conversion utilities
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const rgbToCmyk = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const k = 1 - Math.max(r, g, b)
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }
  
  const c = ((1 - r - k) / (1 - k)) * 100
  const m = ((1 - g - k) / (1 - k)) * 100
  const y = ((1 - b - k) / (1 - k)) * 100
  
  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.max(0, Math.min(100, k * 100))
  }
}

const cmykToRgb = (c, m, y, k) => {
  c /= 100
  m /= 100
  y /= 100
  k /= 100
  
  const r = Math.round(255 * (1 - c) * (1 - k))
  const g = Math.round(255 * (1 - m) * (1 - k))
  const b = Math.round(255 * (1 - y) * (1 - k))
  
  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b))
  }
}

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('').toUpperCase()
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToRgb = (h, s, l) => {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

const setColorFromHex = (hex) => {
  currentHex.value = hex.toUpperCase()
  hexInput.value = hex.toUpperCase()
  const rgb = hexToRgb(hex)
  rgbValues.value = { ...rgb }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
  currentHue.value = hsl.h
  currentSaturation.value = hsl.s
  currentLightness.value = hsl.l
  cmykValues.value = { ...cmyk }
  huePosition.value = (hsl.h / 360) * 100
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  }
}

const updateFromHSL = () => {
  const rgb = hslToRgb(currentHue.value, currentSaturation.value, currentLightness.value)
  rgbValues.value = rgb
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
  cmykValues.value = { ...cmyk }
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  hexInput.value = currentHex.value
}

const updateFromRGB = () => {
  const rgb = rgbValues.value
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
  cmykValues.value = { ...cmyk }
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  hexInput.value = currentHex.value
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  currentHue.value = hsl.h
  currentSaturation.value = hsl.s
  currentLightness.value = hsl.l
  huePosition.value = (hsl.h / 360) * 100
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  }
  drawGradientCanvas()
}

const updateFromCMYK = () => {
  const cmyk = cmykValues.value
  const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k)
  rgbValues.value = rgb
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b)
  hexInput.value = currentHex.value
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  currentHue.value = hsl.h
  currentSaturation.value = hsl.s
  currentLightness.value = hsl.l
  huePosition.value = (hsl.h / 360) * 100
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  }
  drawGradientCanvas()
}

const updateFromHex = () => {
  let hex = hexInput.value.trim()
  if (!hex.startsWith('#')) {
    hex = '#' + hex
    hexInput.value = hex
  }
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    // Normalize 3-digit hex
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    }
    setColorFromHex(hex)
    drawGradientCanvas()
    drawHueCanvas()
  }
}

const drawGradientCanvas = () => {
  const canvas = gradientCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // Create saturation/lightness gradient
  const hue = currentHue.value
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const s = (x / width) * 100
      const l = 100 - (y / height) * 100
      const rgb = hslToRgb(hue, s, l)
      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

const drawHueCanvas = () => {
  const canvas = hueCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // Create hue gradient
  for (let x = 0; x < width; x++) {
    const hue = (x / width) * 360
    const rgb = hslToRgb(hue, 100, 50)
    ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    ctx.fillRect(x, 0, 1, height)
  }
}

const handleGradientClick = (event) => {
  const canvas = gradientCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const width = canvas.width
  const height = canvas.height
  
  currentSaturation.value = (x / width) * 100
  currentLightness.value = 100 - (y / height) * 100
  
  selectorStyle.value = {
    left: `${(x / width) * 100}%`,
    top: `${(y / height) * 100}%`,
  }
  
  updateFromHSL()
  drawGradientCanvas()
}

const handleHueClick = (event) => {
  const canvas = hueCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const width = canvas.width
  
  currentHue.value = (x / width) * 360
  huePosition.value = (x / width) * 100
  
  updateFromHSL()
  drawGradientCanvas()
}

const startGradientDrag = (event) => {
  isDragging.value = true
  handleGradientClick(event)
  document.addEventListener('mousemove', handleGradientDrag)
  document.addEventListener('mouseup', endGradientDrag)
}

const handleGradientDrag = (event) => {
  if (isDragging.value && gradientCanvas.value) {
    const canvas = gradientCanvas.value
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(canvas.width, event.clientX - rect.left))
    const y = Math.max(0, Math.min(canvas.height, event.clientY - rect.top))
    const width = canvas.width
    const height = canvas.height
    
    currentSaturation.value = (x / width) * 100
    currentLightness.value = 100 - (y / height) * 100
    
    selectorStyle.value = {
      left: `${(x / width) * 100}%`,
      top: `${(y / height) * 100}%`,
    }
    
    updateFromHSL()
    drawGradientCanvas()
  }
}

const endGradientDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleGradientDrag)
  document.removeEventListener('mouseup', endGradientDrag)
}

const applyColor = () => {
  emit('apply', currentHex.value)
}

const toggleEyedropper = () => {
  if ('EyeDropper' in window) {
    const eyeDropper = new window.EyeDropper()
    eyeDropper
      .open()
      .then((result) => {
        let hex = result.sRGBHex.toUpperCase()
        setColorFromHex(hex)
        drawGradientCanvas()
        drawHueCanvas()
      })
      .catch((error) => {
        console.error('Eyedropper error:', error)
        if (error.name !== 'AbortError') {
          alert('Eyedropper feature is not available in your browser')
        }
      })
  } else {
    alert('Eyedropper API is not supported in your browser. Please use Chrome or Edge.')
  }
}

// Handle click outside to close color picker
const handleClickOutside = (event) => {
  if (colorPickerContainerRef.value && !colorPickerContainerRef.value.contains(event.target)) {
    emit('cancel')
  }
}

watch(() => props.initialColor, (newColor) => {
  setColorFromHex(newColor)
  drawGradientCanvas()
  drawHueCanvas()
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  setTimeout(() => {
    drawGradientCanvas()
    drawHueCanvas()
  }, 0)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleGradientDrag)
  document.removeEventListener('mouseup', endGradientDrag)
})
</script>

<style scoped>
.eyedropper-icon {
  font-size: 1rem;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>

